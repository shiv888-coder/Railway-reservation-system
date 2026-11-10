package com.railway.reservation.db;

import com.railway.reservation.exception.DatabaseException;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Core Database Manager for the Offline SQLite Database.
 *
 * RESPONSIBILITIES:
 * 1. Automatically creates local SQLite database file (railway.db).
 * 2. Initializes relational tables and indices from schema-sqlite.sql.
 * 3. Seeds verified Indian Railway stations, trains, routes, schedules, and quotas from CSVs.
 * 4. Tracks dataset version in 'dataset_metadata' to strictly prevent duplicate imports.
 * 5. Preserves all bookings, cancellations, and state across restarts.
 * 6. Provides transactional JDBC Connections with PRAGMA foreign_keys enabled.
 */
public class DatabaseManager {

    private static final Logger LOGGER = Logger.getLogger(DatabaseManager.class.getName());
    private static final String DEFAULT_DB_FILE = "railway.db";
    private static DatabaseManager instance;

    private static String configuredDbPath = null;

    public static synchronized void setConfiguredDbPath(String path) {
        configuredDbPath = path;
        instance = null; // Recreate instance on next getInstance()
    }

    private final String dbPath;
    private final String jdbcUrl;

    public DatabaseManager() {
        this(resolveDbPath());
    }

    private static String resolveDbPath() {
        if (configuredDbPath != null && !configuredDbPath.trim().isEmpty()) {
            return configuredDbPath.trim();
        }
        String envPath = System.getenv("RAILWAY_DB_PATH");
        if (envPath != null && !envPath.trim().isEmpty()) {
            return envPath.trim();
        }
        return System.getProperty("railway.db.path", DEFAULT_DB_FILE);
    }

    public DatabaseManager(String dbPath) {
        this.dbPath = dbPath;
        this.jdbcUrl = "jdbc:sqlite:" + dbPath;
    }

    public static synchronized DatabaseManager getInstance() {
        if (instance == null) {
            instance = new DatabaseManager();
        }
        return instance;
    }

    /**
     * Obtains an active JDBC connection with foreign key enforcement enabled.
     */
    public Connection getConnection() throws SQLException {
        Connection conn = DriverManager.getConnection(jdbcUrl);
        try (Statement stmt = conn.createStatement()) {
            stmt.execute("PRAGMA foreign_keys = ON;");
            stmt.execute("PRAGMA busy_timeout = 5000;");
        }
        return conn;
    }

    /**
     * Initializes the database schema and loads bundled datasets if not already present.
     */
    public synchronized void initializeDatabase() {
        LOGGER.info("Initializing SQLite database at: " + new File(dbPath).getAbsolutePath());
        try (Connection conn = getConnection()) {
            executeSchemaScript(conn);
            if (!isStarterDatasetLoaded(conn)) {
                LOGGER.info("Starter dataset not found in dataset_metadata. Commencing bundled CSV ingestion...");
                conn.setAutoCommit(false);
                try {
                    int stationsCount = loadStationsCsv(conn, "/data/stations.csv");
                    int trainsCount = loadTrainsCsv(conn, "/data/trains.csv");
                    int routesCount = loadRoutesCsv(conn, "/data/train_routes.csv");
                    int schedCount = loadSchedulesCsv(conn, "/data/train_schedules.csv");
                    int classesCount = loadClassesCsv(conn, "/data/train_classes.csv");
                    int invCount = loadInventoryCsv(conn, "/data/seat_inventory.csv");
                    int adminCount = loadAdminUsersCsv(conn, "/data/admin_users.csv");

                    markStarterDatasetLoaded(conn, "v2.0.0");
                    conn.commit();
                    LOGGER.info(String.format("Starter dataset loaded successfully: %d stations, %d trains, %d routes, %d schedules, %d class tariffs, %d seat quotas, %d admins.",
                            stationsCount, trainsCount, routesCount, schedCount, classesCount, invCount, adminCount));
                } catch (Exception ex) {
                    conn.rollback();
                    LOGGER.log(Level.SEVERE, "Failed to load starter dataset, rolled back transaction", ex);
                    throw new DatabaseException("Failed to load starter railway dataset: " + ex.getMessage(), ex);
                } finally {
                    conn.setAutoCommit(true);
                }
            } else {
                LOGGER.info("Starter dataset is already loaded in SQLite. Preserving existing database records.");
            }
        } catch (SQLException ex) {
            LOGGER.log(Level.SEVERE, "Database initialization error", ex);
            throw new DatabaseException("Database initialization failed: " + ex.getMessage(), ex);
        }
    }

    private void executeSchemaScript(Connection conn) throws SQLException {
        InputStream is = getClass().getResourceAsStream("/schema-sqlite.sql");
        if (is == null) {
            throw new DatabaseException("schema-sqlite.sql not found in classpath resources");
        }
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
             Statement stmt = conn.createStatement()) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                String trimmed = line.trim();
                if (trimmed.startsWith("--") || trimmed.isEmpty()) {
                    continue;
                }
                sb.append(line).append("\n");
                if (trimmed.endsWith(";")) {
                    stmt.execute(sb.toString());
                    sb.setLength(0);
                }
            }
            if (!sb.toString().trim().isEmpty()) {
                stmt.execute(sb.toString());
            }
        } catch (Exception ex) {
            throw new SQLException("Error reading schema-sqlite.sql", ex);
        }
    }

    private boolean isStarterDatasetLoaded(Connection conn) {
        String sql = "SELECT meta_value FROM dataset_metadata WHERE meta_key = 'STARTER_DATASET_LOADED'";
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            return rs.next();
        } catch (SQLException e) {
            return false;
        }
    }

    private void markStarterDatasetLoaded(Connection conn, String version) throws SQLException {
        String sql = "INSERT OR REPLACE INTO dataset_metadata (meta_key, meta_value, imported_at) VALUES (?, ?, ?)";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, "STARTER_DATASET_LOADED");
            pstmt.setString(2, version);
            pstmt.setString(3, LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            pstmt.executeUpdate();
        }
    }

    public int loadStationsCsv(Connection conn, String resourcePath) throws Exception {
        InputStream is = getClass().getResourceAsStream(resourcePath);
        if (is == null) {
            LOGGER.warning("Stations CSV not found at: " + resourcePath);
            return 0;
        }
        return importStationsFromStream(conn, is);
    }

    public int importStationsFromStream(Connection conn, InputStream is) throws Exception {
        String sql = "INSERT OR IGNORE INTO stations (station_code, station_name, city, state, zone, category) VALUES (?, ?, ?, ?, ?, ?)";
        int count = 0;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            String line = reader.readLine(); // skip header
            while ((line = reader.readLine()) != null) {
                List<String> tokens = parseCsvLine(line);
                if (tokens.size() >= 5) {
                    pstmt.setString(1, tokens.get(0).trim().toUpperCase());
                    pstmt.setString(2, tokens.get(1).trim());
                    pstmt.setString(3, tokens.get(2).trim());
                    pstmt.setString(4, tokens.get(3).trim());
                    pstmt.setString(5, tokens.get(4).trim());
                    pstmt.setString(6, tokens.size() > 5 ? tokens.get(5).trim() : "NSG-4");
                    pstmt.addBatch();
                    count++;
                }
            }
            pstmt.executeBatch();
        }
        return count;
    }

    public int loadTrainsCsv(Connection conn, String resourcePath) throws Exception {
        InputStream is = getClass().getResourceAsStream(resourcePath);
        if (is == null) return 0;
        String sql = "INSERT OR IGNORE INTO trains (train_number, train_name, train_type, source_station_code, destination_station_code, departure_time, arrival_time, duration, distance_km, operating_days) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        int count = 0;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            reader.readLine(); // header
            String line;
            while ((line = reader.readLine()) != null) {
                List<String> tokens = parseCsvLine(line);
                if (tokens.size() >= 10) {
                    pstmt.setString(1, tokens.get(0).trim());
                    pstmt.setString(2, tokens.get(1).trim());
                    pstmt.setString(3, tokens.get(2).trim());
                    pstmt.setString(4, tokens.get(3).trim().toUpperCase());
                    pstmt.setString(5, tokens.get(4).trim().toUpperCase());
                    pstmt.setString(6, tokens.get(5).trim());
                    pstmt.setString(7, tokens.get(6).trim());
                    pstmt.setString(8, tokens.get(7).trim());
                    pstmt.setInt(9, Integer.parseInt(tokens.get(8).trim()));
                    pstmt.setString(10, tokens.get(9).trim());
                    pstmt.addBatch();
                    count++;
                }
            }
            pstmt.executeBatch();
        }
        return count;
    }

    public int loadRoutesCsv(Connection conn, String resourcePath) throws Exception {
        InputStream is = getClass().getResourceAsStream(resourcePath);
        if (is == null) return 0;
        String sql = "INSERT OR IGNORE INTO train_routes (route_id, train_number, station_code, stop_sequence, distance_km) VALUES (?, ?, ?, ?, ?)";
        int count = 0;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            reader.readLine(); // header
            String line;
            while ((line = reader.readLine()) != null) {
                List<String> tokens = parseCsvLine(line);
                if (tokens.size() >= 5) {
                    pstmt.setInt(1, Integer.parseInt(tokens.get(0).trim()));
                    pstmt.setString(2, tokens.get(1).trim());
                    pstmt.setString(3, tokens.get(2).trim().toUpperCase());
                    pstmt.setInt(4, Integer.parseInt(tokens.get(3).trim()));
                    pstmt.setInt(5, Integer.parseInt(tokens.get(4).trim()));
                    pstmt.addBatch();
                    count++;
                }
            }
            pstmt.executeBatch();
        }
        return count;
    }

    public int loadSchedulesCsv(Connection conn, String resourcePath) throws Exception {
        InputStream is = getClass().getResourceAsStream(resourcePath);
        if (is == null) return 0;
        String sql = "INSERT OR IGNORE INTO train_schedules (schedule_id, train_number, station_code, arrival_time, departure_time, halt_minutes, day_number, stop_sequence) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        int count = 0;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            reader.readLine(); // header
            String line;
            while ((line = reader.readLine()) != null) {
                List<String> tokens = parseCsvLine(line);
                if (tokens.size() >= 8) {
                    pstmt.setInt(1, Integer.parseInt(tokens.get(0).trim()));
                    pstmt.setString(2, tokens.get(1).trim());
                    pstmt.setString(3, tokens.get(2).trim().toUpperCase());
                    pstmt.setString(4, tokens.get(3).trim());
                    pstmt.setString(5, tokens.get(4).trim());
                    pstmt.setInt(6, Integer.parseInt(tokens.get(5).trim()));
                    pstmt.setInt(7, Integer.parseInt(tokens.get(6).trim()));
                    pstmt.setInt(8, Integer.parseInt(tokens.get(7).trim()));
                    pstmt.addBatch();
                    count++;
                }
            }
            pstmt.executeBatch();
        }
        return count;
    }

    public int loadClassesCsv(Connection conn, String resourcePath) throws Exception {
        InputStream is = getClass().getResourceAsStream(resourcePath);
        if (is == null) return 0;
        String sql = "INSERT OR IGNORE INTO train_classes (class_id, train_number, coach_class, base_fare) VALUES (?, ?, ?, ?)";
        int count = 0;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            reader.readLine(); // header
            String line;
            while ((line = reader.readLine()) != null) {
                List<String> tokens = parseCsvLine(line);
                if (tokens.size() >= 4) {
                    pstmt.setInt(1, Integer.parseInt(tokens.get(0).trim()));
                    pstmt.setString(2, tokens.get(1).trim());
                    pstmt.setString(3, tokens.get(2).trim());
                    pstmt.setDouble(4, Double.parseDouble(tokens.get(3).trim()));
                    pstmt.addBatch();
                    count++;
                }
            }
            pstmt.executeBatch();
        }
        return count;
    }

    public int loadInventoryCsv(Connection conn, String resourcePath) throws Exception {
        InputStream is = getClass().getResourceAsStream(resourcePath);
        if (is == null) return 0;
        String sql = "INSERT OR IGNORE INTO seat_inventory (inventory_id, train_number, coach_class, total_seats, available_seats) VALUES (?, ?, ?, ?, ?)";
        int count = 0;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            reader.readLine(); // header
            String line;
            while ((line = reader.readLine()) != null) {
                List<String> tokens = parseCsvLine(line);
                if (tokens.size() >= 5) {
                    pstmt.setInt(1, Integer.parseInt(tokens.get(0).trim()));
                    pstmt.setString(2, tokens.get(1).trim());
                    pstmt.setString(3, tokens.get(2).trim());
                    pstmt.setInt(4, Integer.parseInt(tokens.get(3).trim()));
                    pstmt.setInt(5, Integer.parseInt(tokens.get(4).trim()));
                    pstmt.addBatch();
                    count++;
                }
            }
            pstmt.executeBatch();
        }
        return count;
    }

    public int loadAdminUsersCsv(Connection conn, String resourcePath) throws Exception {
        InputStream is = getClass().getResourceAsStream(resourcePath);
        if (is == null) return 0;
        String sql = "INSERT OR IGNORE INTO admin_users (user_id, username, password_hash, full_name, role, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)";
        int count = 0;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            reader.readLine(); // header
            String line;
            while ((line = reader.readLine()) != null) {
                List<String> tokens = parseCsvLine(line);
                if (tokens.size() >= 7) {
                    pstmt.setInt(1, Integer.parseInt(tokens.get(0).trim()));
                    pstmt.setString(2, tokens.get(1).trim());
                    pstmt.setString(3, tokens.get(2).trim());
                    pstmt.setString(4, tokens.get(3).trim());
                    pstmt.setString(5, tokens.get(4).trim());
                    pstmt.setInt(6, Integer.parseInt(tokens.get(5).trim()));
                    pstmt.setString(7, tokens.get(6).trim());
                    pstmt.addBatch();
                    count++;
                }
            }
            pstmt.executeBatch();
        }
        return count;
    }

    /**
     * Robust CSV line parser handling quotes and embedded commas.
     */
    public static List<String> parseCsvLine(String line) {
        List<String> result = new ArrayList<>();
        if (line == null || line.isEmpty()) return result;
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                result.add(current.toString().trim());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        result.add(current.toString().trim());
        return result;
    }

    public String getDbPath() {
        return dbPath;
    }
}
