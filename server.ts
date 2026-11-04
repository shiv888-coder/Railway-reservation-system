import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { VERIFIED_STATIONS, VERIFIED_TRAINS } from './src/data/railwayDatasets.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists for persistent storage
const DATA_DIR = path.resolve(__dirname, 'data');
const RESERVATIONS_FILE = path.resolve(DATA_DIR, 'reservations.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed reservations for persistent store
const INITIAL_SEED_RESERVATIONS = [
  {
    pnr: '2849182374',
    train: {
      trainNumber: '12301',
      trainName: 'Howrah Rajdhani Express',
      trainType: 'RAJDHANI',
      departureTime: '16:50:00',
      arrivalTime: '10:05:00',
      durationHours: '17h 15m',
      distanceKm: 1451,
      daysOfOperation: 'Daily',
    },
    sourceStation: {
      stationCode: 'HWH',
      stationName: 'Howrah Junction',
      city: 'Kolkata',
      state: 'West Bengal',
      zone: 'Eastern Railway (ER)',
    },
    destinationStation: {
      stationCode: 'NDLS',
      stationName: 'New Delhi Railway Station',
      city: 'New Delhi',
      state: 'Delhi',
      zone: 'Northern Railway (NR)',
    },
    journeyDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
    travelClass: 'THIRD_AC',
    bookingStatus: 'CONFIRMED',
    seatAllocations: [
      {
        allocationId: 1,
        passenger: {
          passengerId: 1,
          fullName: 'Shiv Shankar Mal',
          age: 21,
          gender: 'MALE',
          phone: '+91 98765 43210',
          email: 'shiv.cse@lab.edu',
          idProofType: 'AADHAAR_CARD',
          idProofNumber: '7829-4412-9081',
          berthPreference: 'Lower',
        },
        coachNumber: 'B2',
        berthNumber: 21,
        berthType: 'Lower Berth',
      },
      {
        allocationId: 2,
        passenger: {
          passengerId: 2,
          fullName: 'Prof. Rajesh Sharma',
          age: 62,
          gender: 'MALE',
          phone: '+91 91234 56780',
          email: 'rajesh.prof@university.ac.in',
          idProofType: 'PAN_CARD',
          idProofNumber: 'ABCPS1234F',
          berthPreference: 'Lower',
        },
        coachNumber: 'B2',
        berthNumber: 22,
        berthType: 'Middle Berth',
      },
    ],
    baseFare: 3900.0,
    reservationCharge: 80.0,
    superfastCharge: 150.0,
    cateringCharge: 680.0,
    gstAmount: 216.13,
    seniorDiscount: 487.5,
    totalFare: 4538.63,
    bookedAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    cancellationSlip: null,
  },
];

// Initialize reservations.json if missing
if (!fs.existsSync(RESERVATIONS_FILE)) {
  try {
    fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify(INITIAL_SEED_RESERVATIONS, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to initialize reservations file:', err);
  }
}

function readReservations(): any[] {
  try {
    if (fs.existsSync(RESERVATIONS_FILE)) {
      const data = fs.readFileSync(RESERVATIONS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading reservations:', e);
  }
  return [...INITIAL_SEED_RESERVATIONS];
}

function writeReservations(reservations: any[]): boolean {
  try {
    fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify(reservations, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Error writing reservations:', e);
    return false;
  }
}

// In-Memory Live Running Status Cache (60-second TTL to avoid quota burn)
interface LiveStatusCacheEntry {
  data: any;
  cachedAt: number;
}
const liveStatusCache = new Map<string, LiveStatusCacheEntry>();
const LIVE_STATUS_CACHE_TTL_MS = 60 * 1000; // 60 seconds

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const HOST = process.env.HOST || '0.0.0.0';

  app.use(express.json());

  /**
   * GET /api/health
   * Standard Health Check & Runtime Diagnostics Endpoint
   */
  app.get('/api/health', (_req: Request, res: Response) => {
    const apiKey = (process.env.RAILWAY_API_KEY || '').trim();
    const apiUrl = (process.env.RAILWAY_API_URL || '').trim();
    const apiHost = (process.env.RAILWAY_API_HOST || '').trim();

    return res.json({
      status: 'UP',
      message: 'Connected to Railway Reservation Production Server (Node.js/Express)',
      runtime: `Node.js ${process.version}`,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      activeProxy: 'Node.js/Express (server.ts)',
      liveApiConfigured: Boolean(apiKey && apiUrl),
      liveApiProvider: apiHost || 'Unconfigured (Official Published Schedule Timetable Active)',
      version: '3.0.0',
    });
  });

  /**
   * GET /api/trains/:trainNumber/live-status
   * Live GPS Running Status Proxy with 60-Second In-Memory Caching & Forced Refresh Support.
   */
  app.get('/api/trains/:trainNumber/live-status', async (req: Request, res: Response) => {
    const { trainNumber } = req.params;
    const forceRefresh = req.query.refresh === 'true' || req.query.refresh === '1';

    // 1. Check in-memory cache if not forced refresh
    if (!forceRefresh) {
      const cached = liveStatusCache.get(trainNumber);
      if (cached && Date.now() - cached.cachedAt < LIVE_STATUS_CACHE_TTL_MS) {
        const remainingTtlSec = Math.round((LIVE_STATUS_CACHE_TTL_MS - (Date.now() - cached.cachedAt)) / 1000);
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-TTL', `${remainingTtlSec}s`);
        return res.json({
          ...cached.data,
          cached: true,
          cachedAt: new Date(cached.cachedAt).toLocaleTimeString(),
          cacheTtlSeconds: remainingTtlSec,
        });
      }
    }

    const apiKey = (process.env.RAILWAY_API_KEY || '').trim();
    const apiHost = (process.env.RAILWAY_API_HOST || '').trim();
    const apiUrl = (process.env.RAILWAY_API_URL || '').trim();
    const trainParam = (process.env.RAILWAY_API_TRAIN_PARAM || 'train_number').trim();
    const dateParam = (process.env.RAILWAY_API_DATE_PARAM || 'date').trim();

    // Diagnostic if no verified provider or key is configured
    if (!apiKey || !apiUrl) {
      const unavailablePayload = {
        trainNumber,
        status: 'UNAVAILABLE',
        sourceType: 'UNAVAILABLE',
        apiConfigured: false,
        apiProvider: apiHost ? `Configured Host: ${apiHost}` : 'No Verified Live Provider Configured',
        errorCode: 'NO_VERIFIED_PROVIDER',
        message: 'No verified live railway API provider or RAILWAY_API_KEY is configured. Live tracking status is UNAVAILABLE. Official published timetable schedule is shown below.',
        lastUpdated: new Date().toLocaleTimeString(),
        cached: false,
      };

      // Cache unavailable status for 30s to prevent rapid spamming
      liveStatusCache.set(trainNumber, { data: unavailablePayload, cachedAt: Date.now() });

      res.setHeader('X-Cache', 'MISS');
      return res.json(unavailablePayload);
    }

    try {
      const todayDate = new Date().toISOString().split('T')[0];
      const separator = apiUrl.includes('?') ? '&' : '?';
      const targetUrl = `${apiUrl}${separator}${encodeURIComponent(trainParam)}=${encodeURIComponent(trainNumber)}&${encodeURIComponent(dateParam)}=${encodeURIComponent(todayDate)}`;

      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'x-rapidapi-key': apiKey,
      };

      if (apiHost) {
        headers['x-rapidapi-host'] = apiHost;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const apiResponse = await fetch(targetUrl, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (apiResponse.status === 401 || apiResponse.status === 403) {
        return res.json({
          trainNumber,
          status: 'UNAVAILABLE',
          sourceType: 'UNAVAILABLE',
          apiConfigured: true,
          apiProvider: apiHost || 'Configured Gateway',
          errorCode: 'INVALID_KEY',
          message: `Authentication failed (HTTP ${apiResponse.status}): Invalid or unauthorized RAILWAY_API_KEY. Please verify provider subscription.`,
          lastUpdated: new Date().toLocaleTimeString(),
          cached: false,
        });
      }

      if (apiResponse.status >= 500) {
        return res.json({
          trainNumber,
          status: 'UNAVAILABLE',
          sourceType: 'UNAVAILABLE',
          apiConfigured: true,
          apiProvider: apiHost || 'Configured Gateway',
          errorCode: 'GATEWAY_ERROR',
          message: `External railway gateway server error (HTTP ${apiResponse.status}). Service temporarily unavailable.`,
          lastUpdated: new Date().toLocaleTimeString(),
          cached: false,
        });
      }

      if (!apiResponse.ok) {
        return res.json({
          trainNumber,
          status: 'UNAVAILABLE',
          sourceType: 'UNAVAILABLE',
          apiConfigured: true,
          apiProvider: apiHost || 'Configured Gateway',
          errorCode: 'NETWORK_ERROR',
          message: `Railway API returned HTTP ${apiResponse.status}.`,
          lastUpdated: new Date().toLocaleTimeString(),
          cached: false,
        });
      }

      const raw = await apiResponse.json();
      const data = raw.data || raw;

      const currentStation = data.current_station_name || data.current_station || data.current_position || 'In Transit';
      const currentStationCode = data.current_station_code || data.current_station || '';
      const rawDelay = data.delay ?? data.delay_minutes ?? 0;
      const delayMinutes = typeof rawDelay === 'number' ? rawDelay : parseInt(String(rawDelay), 10) || 0;
      const status = delayMinutes > 5 ? 'DELAYED' : 'ON_TIME';

      const liveResult = {
        trainNumber,
        trainName: data.train_name || data.trainName || 'Train ' + trainNumber,
        currentStationName: currentStation,
        currentStationCode,
        status,
        delayMinutes,
        lastUpdated: new Date().toLocaleTimeString(),
        nextHaltName: data.next_station_name || data.nextHaltName,
        nextHaltDeparture: data.next_station_departure || data.nextHaltDeparture,
        sourceType: 'LIVE',
        apiConfigured: true,
        apiProvider: apiHost || 'Verified Railway Gateway',
        message: 'Live GPS running status retrieved successfully via secure backend proxy.',
        cached: false,
      };

      // Store in memory cache
      liveStatusCache.set(trainNumber, { data: liveResult, cachedAt: Date.now() });

      res.setHeader('X-Cache', 'MISS');
      return res.json(liveResult);
    } catch (err: any) {
      const isTimeout = err.name === 'AbortError' || err.name === 'TimeoutError';
      return res.json({
        trainNumber,
        status: 'UNAVAILABLE',
        sourceType: 'UNAVAILABLE',
        apiConfigured: true,
        apiProvider: apiHost || 'Configured Gateway',
        errorCode: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: isTimeout
          ? 'Live API request timed out after 8000ms.'
          : `Proxy connection error to railway gateway: ${err.message || 'Check host resolution'}`,
        lastUpdated: new Date().toLocaleTimeString(),
        cached: false,
      });
    }
  });

  /**
   * GET /api/stations
   */
  app.get('/api/stations', (_req: Request, res: Response) => {
    const list = VERIFIED_STATIONS.map(s => ({
      stationCode: s.code,
      code: s.code,
      stationName: s.name,
      name: s.name,
      city: s.city,
      state: s.state,
      zone: s.zone,
      division: s.division,
      category: s.category,
      aliases: s.aliases,
    }));
    return res.json(list);
  });

  /**
   * GET /api/stations/:code
   */
  app.get('/api/stations/:code', (req: Request, res: Response) => {
    const code = req.params.code.toUpperCase();
    const st = VERIFIED_STATIONS.find(s => s.code === code);
    if (!st) return res.status(404).json({ message: `Station ${code} not found` });
    return res.json({
      stationCode: st.code,
      code: st.code,
      stationName: st.name,
      name: st.name,
      city: st.city,
      state: st.state,
      zone: st.zone,
      division: st.division,
      category: st.category,
      aliases: st.aliases,
    });
  });

  /**
   * GET /api/trains
   */
  app.get('/api/trains', (_req: Request, res: Response) => {
    const list = VERIFIED_TRAINS.map(t => ({
      trainNumber: t.trainNumber,
      trainName: t.trainName,
      trainCategory: t.trainType.toUpperCase().replace(/\s+/g, '_'),
      trainType: t.trainType.toUpperCase().replace(/\s+/g, '_'),
      sourceStation: {
        stationCode: t.source,
        stationName: t.sourceStationName,
      },
      destinationStation: {
        stationCode: t.destination,
        stationName: t.destinationStationName,
      },
      departureTime: t.departureTime + ':00',
      arrivalTime: t.arrivalTime + ':00',
      durationHours: t.durationHours,
      distanceKm: t.distanceKm,
      daysOfOperation: t.daysOfOperation,
      routeHalts: t.halts.map((h, i) => ({
        haltId: i + 1,
        stopSequence: i + 1,
        station: { stationCode: h.stationCode, stationName: h.stationName },
        arrivalTime: h.arrivalTime,
        departureTime: h.departureTime,
        haltMinutes: h.haltMinutes,
        distanceKm: h.distanceKm,
        dayNumber: h.day,
      })),
      seatConfigurations: Object.entries(t.totalSeats).map(([cls, cap], idx) => ({
        id: idx + 1,
        coachClass: cls === '1A' ? 'FIRST_AC' : cls === '2A' ? 'SECOND_AC' : cls === '3A' ? 'THIRD_AC' : cls === 'SL' ? 'SLEEPER' : cls === 'CC' ? 'CHAIR_CAR' : 'EXECUTIVE_CHAIR',
        totalSeats: cap,
        availableSeats: t.availableSeats[cls as keyof typeof t.availableSeats] || cap,
        baseFare: t.baseFares[cls as keyof typeof t.baseFares] || 500,
      })),
    }));
    return res.json(list);
  });

  /**
   * GET /api/trains/:trainNumber
   */
  app.get('/api/trains/:trainNumber', (req: Request, res: Response) => {
    const { trainNumber } = req.params;
    const t = VERIFIED_TRAINS.find(tr => tr.trainNumber === trainNumber);
    if (!t) return res.status(404).json({ message: `Train ${trainNumber} not found` });

    return res.json({
      trainNumber: t.trainNumber,
      trainName: t.trainName,
      trainCategory: t.trainType.toUpperCase().replace(/\s+/g, '_'),
      trainType: t.trainType.toUpperCase().replace(/\s+/g, '_'),
      sourceStation: { stationCode: t.source, stationName: t.sourceStationName },
      destinationStation: { stationCode: t.destination, stationName: t.destinationStationName },
      departureTime: t.departureTime + ':00',
      arrivalTime: t.arrivalTime + ':00',
      durationHours: t.durationHours,
      distanceKm: t.distanceKm,
      daysOfOperation: t.daysOfOperation,
      routeHalts: t.halts.map((h, i) => ({
        haltId: i + 1,
        stopSequence: i + 1,
        station: { stationCode: h.stationCode, stationName: h.stationName },
        arrivalTime: h.arrivalTime,
        departureTime: h.departureTime,
        haltMinutes: h.haltMinutes,
        distanceKm: h.distanceKm,
        dayNumber: h.day,
      })),
      seatConfigurations: Object.entries(t.totalSeats).map(([cls, cap], idx) => ({
        id: idx + 1,
        coachClass: cls === '1A' ? 'FIRST_AC' : cls === '2A' ? 'SECOND_AC' : cls === '3A' ? 'THIRD_AC' : cls === 'SL' ? 'SLEEPER' : cls === 'CC' ? 'CHAIR_CAR' : 'EXECUTIVE_CHAIR',
        totalSeats: cap,
        availableSeats: t.availableSeats[cls as keyof typeof t.availableSeats] || cap,
        baseFare: t.baseFares[cls as keyof typeof t.baseFares] || 500,
      })),
    });
  });

  /**
   * GET /api/reservations
   */
  app.get('/api/reservations', (req: Request, res: Response) => {
    const { status } = req.query;
    let list = readReservations();
    if (status) {
      list = list.filter(r => r.bookingStatus === status);
    }
    return res.json(list);
  });

  /**
   * GET /api/reservations/:pnr
   */
  app.get('/api/reservations/:pnr', (req: Request, res: Response) => {
    const cleanPnr = req.params.pnr.replace(/-/g, '').trim();
    const list = readReservations();
    const found = list.find(r => r.pnr === cleanPnr);
    if (!found) {
      return res.status(404).json({ message: `Reservation with PNR ${cleanPnr} not found` });
    }
    return res.json(found);
  });

  /**
   * POST /api/reservations/book
   * Persists reservations to data/reservations.json
   */
  app.post('/api/reservations/book', (req: Request, res: Response) => {
    const { trainNumber, journeyDate, travelClass, passengers } = req.body;
    if (!trainNumber || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({ message: 'Invalid reservation request' });
    }

    const train = VERIFIED_TRAINS.find(t => t.trainNumber === trainNumber);
    if (!train) {
      return res.status(404).json({ message: `Train ${trainNumber} not found` });
    }

    // Generate authentic 10-digit PNR
    const pnr = `${Math.floor(100 + Math.random() * 900)}${Math.floor(1000000 + Math.random() * 9000000)}`;

    // Fare calculation
    const normClass = travelClass === 'FIRST_AC' ? '1A' : travelClass === 'SECOND_AC' ? '2A' : travelClass === 'THIRD_AC' ? '3A' : travelClass === 'CHAIR_CAR' ? 'CC' : travelClass === 'EXECUTIVE_CHAIR' ? 'EC' : 'SL';
    const rate = train.baseFares[normClass as keyof typeof train.baseFares] || 850;
    const baseTotal = rate * passengers.length;
    const reservationFee = 40 * passengers.length;
    const superfastFee = train.trainType === 'Superfast' || train.trainType === 'Rajdhani' || train.trainType === 'Vande Bharat' ? 45 * passengers.length : 0;
    const cateringFee = train.trainType === 'Rajdhani' || train.trainType === 'Vande Bharat' ? 340 * passengers.length : 0;

    let seniorDiscount = 0;
    passengers.forEach((p: any) => {
      if (p.age >= 60) {
        seniorDiscount += rate * 0.4;
      }
    });

    const taxable = baseTotal + reservationFee + superfastFee + cateringFee - seniorDiscount;
    const gst = Math.round(taxable * 0.05 * 100) / 100;
    const totalFare = Math.round((taxable + gst) * 100) / 100;

    // Allocate seats
    const coachPrefix = normClass === '1A' ? 'H1' : normClass === '2A' ? 'A1' : normClass === '3A' ? 'B2' : normClass === 'CC' ? 'C1' : normClass === 'EC' ? 'E1' : 'S3';
    const seatAllocations = passengers.map((p: any, idx: number) => {
      const berthNum = 12 + idx * 2;
      return {
        allocationId: Date.now() + idx,
        passenger: {
          passengerId: Date.now() + idx,
          fullName: p.fullName || p.name,
          age: p.age,
          gender: p.gender || 'MALE',
          phone: p.phone,
          email: p.email,
          idProofType: p.idProofType || 'AADHAAR_CARD',
          idProofNumber: p.idProofNumber || 'N/A',
          berthPreference: p.berthPreference || 'No Preference',
        },
        coachNumber: coachPrefix,
        berthNumber: berthNum,
        berthType: berthNum % 3 === 0 ? 'Lower Berth' : berthNum % 3 === 1 ? 'Middle Berth' : 'Upper Berth',
      };
    });

    const newReservation = {
      pnr,
      train: {
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        trainType: train.trainType.toUpperCase().replace(/\s+/g, '_'),
        departureTime: train.departureTime + ':00',
        arrivalTime: train.arrivalTime + ':00',
        durationHours: train.durationHours,
        distanceKm: train.distanceKm,
        daysOfOperation: train.daysOfOperation,
      },
      sourceStation: {
        stationCode: train.source,
        stationName: train.sourceStationName,
      },
      destinationStation: {
        stationCode: train.destination,
        stationName: train.destinationStationName,
      },
      journeyDate: journeyDate || new Date().toISOString().split('T')[0],
      travelClass: travelClass,
      bookingStatus: 'CONFIRMED',
      seatAllocations,
      baseFare: baseTotal,
      reservationCharge: reservationFee,
      superfastCharge: superfastFee,
      cateringCharge: cateringFee,
      gstAmount: gst,
      seniorDiscount,
      totalFare,
      bookedAt: new Date().toISOString(),
      cancellationSlip: null,
    };

    const currentReservations = readReservations();
    currentReservations.unshift(newReservation);
    writeReservations(currentReservations);

    return res.status(201).json(newReservation);
  });

  /**
   * POST /api/reservations/:pnr/cancel
   */
  app.post('/api/reservations/:pnr/cancel', (req: Request, res: Response) => {
    const cleanPnr = req.params.pnr.replace(/-/g, '').trim();
    const reason = req.body.reason || 'Customer requested ticket cancellation';

    const list = readReservations();
    const target = list.find(r => r.pnr === cleanPnr);
    if (!target) {
      return res.status(404).json({ message: `Reservation with PNR ${cleanPnr} not found` });
    }

    if (target.bookingStatus === 'CANCELLED') {
      return res.status(400).json({ message: 'Ticket has already been cancelled previously' });
    }

    const cancelFee = Math.round(target.totalFare * 0.15 * 100) / 100;
    const refundAmount = Math.max(0, Math.round((target.totalFare - cancelFee) * 100) / 100);
    const refundRef = `REF-${Math.floor(10000000 + Math.random() * 90000000)}`;

    target.bookingStatus = 'CANCELLED';
    target.cancellationSlip = {
      cancelledAt: new Date().toISOString(),
      cancellationFee: cancelFee,
      refundAmount,
      cancellationReason: reason,
      refundReferenceId: refundRef,
    };

    writeReservations(list);

    return res.json({
      bookingId: cleanPnr,
      cancelledAt: target.cancellationSlip.cancelledAt,
      cancellationFee: cancelFee,
      refundAmount,
      reason,
      refundReferenceId: refundRef,
    });
  });

  /**
   * GET /api/dashboard/stats
   */
  app.get('/api/dashboard/stats', (_req: Request, res: Response) => {
    const list = readReservations();
    const confirmedList = list.filter(r => r.bookingStatus === 'CONFIRMED');
    const cancelledList = list.filter(r => r.bookingStatus === 'CANCELLED');
    const totalRev = confirmedList.reduce((sum, r) => sum + (r.totalFare || 0), 0);

    return res.json({
      totalTrains: VERIFIED_TRAINS.length,
      totalBookings: confirmedList.length,
      availableSeats: 4850,
      cancelledTickets: cancelledList.length,
      totalRevenue: totalRev,
    });
  });

  /**
   * GET /api/passengers
   */
  app.get('/api/passengers', (_req: Request, res: Response) => {
    const list = readReservations();
    const passengers: any[] = [];
    const seenIds = new Set<number>();
    list.forEach(r => {
      (r.seatAllocations || []).forEach((alloc: any) => {
        if (alloc.passenger && !seenIds.has(alloc.passenger.passengerId)) {
          seenIds.add(alloc.passenger.passengerId);
          passengers.push(alloc.passenger);
        }
      });
    });
    return res.json(passengers);
  });

  // Mount Vite development middlewares or serve production dist
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Railway Reservation Server running on http://${HOST}:${PORT}`);
  });
}

startServer();
