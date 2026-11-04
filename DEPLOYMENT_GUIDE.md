# Production Deployment & Cloud Hosting Guide
## Railway Reservation System (B.Tech CSE Java OOP Mini Project & Full-Stack Web App)

**Author:** Shiv Shankar Mal (Roll: 2760012408 | Group: 9 | B.Tech CSE)  
**Version:** 3.0.0 (Production Release)  
**License:** Educational & Academic Project  

---

## 1. System Architecture Overview

The Railway Reservation System is built with a **production-ready full-stack architecture** designed for both cloud web deployment and academic evaluation:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BROWSER / CLIENT TIER                          │
│   React 19 SPA + TypeScript + Vite + Tailwind CSS                      │
│   - Train Directory & Fleet Discovery (24 Premier Express Trains)      │
│   - Dynamic Station Autocomplete (120 Verified Stations across 18 Zones) │
│   - Interactive Booking, Seat Allocation & Cancellation Slip Flow      │
│   - OOP Architecture & Class Hierarchy Visualization                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                       HTTP / HTTPS │ /api/*
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        PRODUCTION BACKEND TIER                         │
│   Node.js + Express (`server.ts`) on PORT 3000                         │
│   - Serves Vite React Frontend (SPA mode)                              │
│   - RESTful API Endpoints (`/api/trains`, `/api/reservations`, etc.)   │
│   - 60-Second In-Memory Live Running Status Cache                      │
│   - Secure Backend Railway API Proxy (Zero client credential leak)     │
│   - Persistent JSON Storage (`data/reservations.json`)                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Optional Local Academic Evaluation)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      ACADEMIC JAVA OOP BACKEND TIER                    │
│   Java 17 + Spring Boot 3.2.4 + MySQL 8 (`railway-backend`)            │
│   - Strict OOP Inheritance Hierarchy (`BaseTrainEntity` -> Subclasses) │
│   - Polymorphic Tariff Calculation (`calculateFare`)                   │
│   - JPA Hibernate ORM with MySQL Persistence                           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Why GitHub Pages CANNOT Run This Application

> ⚠️ **CRITICAL PLATFORM LIMITATION:**  
> **GitHub Pages is exclusively a static HTML/CSS/JS file server.**  
> It **cannot execute server-side runtimes** such as Node.js, Express, or Java Spring Boot.

### Why Static-Only Hosts (GitHub Pages) Fail for Full-Stack Railway Apps:
1. **Server-Side API Proxy Required:** Secure railway API providers (such as RapidAPI or official IRCTC gateways) require API keys. In a static GitHub Pages site, any API key must be hardcoded into client-side JavaScript, exposing credentials to any visitor via browser Developer Tools.
2. **CORS Restrictions:** Official railway data providers block direct browser requests using Cross-Origin Resource Sharing (CORS) security policies. A server-side proxy (`server.ts`) is mandatory.
3. **Data Persistence:** GitHub Pages has no writable file system or server-side database. Reservations, cancellations, and live quota modifications cannot persist across browser sessions or between different users.
4. **Backend Routing:** Single Page Application (SPA) client-side routes return HTTP 404 on refresh without a Node/Express wildcard handler (`res.sendFile('dist/index.html')`).

---

## 3. Recommended Cloud Hosting Platforms (Production-Ready)

To host the complete application online with live server-side APIs and persistent storage, choose one of the following verified cloud providers:

### Option A: Render (Recommended — Simplest Deployment)
Render offers free and low-cost Node.js Web Services with automated GitHub integration.

1. **Push Code to GitHub:**
   Ensure your repository contains `server.ts`, `package.json`, and `vite.config.ts`.
2. **Create New Web Service:**
   - Log into [Render Dashboard](https://dashboard.render.com/).
   - Click **New +** > **Web Service**.
   - Connect your GitHub repository.
3. **Configure Settings:**
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start` (runs `tsx server.ts`)
   - **Plan:** Free or Starter
4. **Add Persistent Disk (Optional for Reservations):**
   - Under **Disks**, add a volume mounted at `/data` (1 GB is plenty).
5. **Set Environment Variables (Optional for Live Data):**
   - `NODE_ENV`: `production`
   - `PORT`: `3000` (Render will set `PORT` automatically if omitted)
   - `RAILWAY_API_KEY`: *(Your private RapidAPI key if subscribed)*
   - `RAILWAY_API_HOST`: *(Your RapidAPI provider host header)*
   - `RAILWAY_API_URL`: *(Your verified live status gateway endpoint URL)*

---

### Option B: Railway.app
Railway offers instant GitHub deployments with support for Docker and persistent storage.

1. Connect your GitHub repository at [Railway.app](https://railway.app/).
2. Railway detects `package.json` and uses the `start` script (`tsx server.ts`).
3. Add a **Persistent Volume** mounted at `/data` to preserve bookings across deploys.
4. Add environment variables under **Variables** tab.

---

### Option C: Fly.io
Fly.io runs applications in lightweight micro-VMs globally.

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Run in project root:
   ```bash
   fly launch
   ```
3. Set secrets securely:
   ```bash
   fly secrets set RAILWAY_API_KEY="your_api_key_here"
   ```
4. Deploy:
   ```bash
   fly deploy
   ```

---

### Option D: Google Cloud Run (Container Deployment)
Google Cloud Run provides auto-scaling serverless containers with Google Cloud Secret Manager.

1. Build container image:
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/railway-app
   ```
2. Deploy to Cloud Run:
   ```bash
   gcloud run deploy railway-app \
     --image gcr.io/PROJECT_ID/railway-app \
     --platform managed \
     --port 3000 \
     --allow-unauthenticated
   ```

---

## 4. Environment Variables Reference

Configure these environment variables in your cloud hosting provider's dashboard or container environment:

| Variable Name | Required | Default Value | Purpose / Description |
|---|---|---|---|
| `PORT` | Optional | `3000` | Port on which Express listens. Cloud hosts set this automatically. |
| `HOST` | Optional | `0.0.0.0` | Network binding interface. Must remain `0.0.0.0` for containers. |
| `NODE_ENV` | Optional | `development` | Set to `production` in live deployments. |
| `RAILWAY_API_KEY` | Optional | *Empty* | Private API secret key for live GPS telemetry. **Never expose in React.** |
| `RAILWAY_API_HOST` | Optional | *Empty* | Host header required by API provider (e.g., `indian-railways.p.rapidapi.com`). |
| `RAILWAY_API_URL` | Optional | *Empty* | Target gateway endpoint URL for live running status. |
| `RAILWAY_API_TRAIN_PARAM` | Optional | `train_number` | Query parameter name for train number. |
| `RAILWAY_API_DATE_PARAM` | Optional | `date` | Query parameter name for journey date. |
| `VITE_API_BASE_URL` | Optional | `/api` | Relative or absolute backend base URL. Keep unset for same-origin proxy. |

---

## 5. Security & Secret Protection Protocol

1. **Zero Secret Exposure:** `RAILWAY_API_KEY` is read strictly on the server in `server.ts`. It is **never** prefixed with `VITE_` and is **never** sent to the client browser in HTTP responses.
2. **No Secret Commits:** Do not store live API keys in `.env` or commit `.env` to Git. `.gitignore` is configured to ignore `.env`, `.env.local`, and private credential files.
3. **Data Transparency Badging:** If no live API key is configured, the application transparently displays **LIVE STATUS UNAVAILABLE** with error diagnostics and serves official published railway schedules. It **never** fabricates fake running positions or mislabels simulated data as live.

---

## 6. Live Status 60-Second In-Memory Caching

To prevent rapid quota depletion and protect against rate-limiting on external railway gateways:
- All live running status queries are cached in-memory on `server.ts` for **60 seconds**.
- Cache hits return HTTP header `X-Cache: HIT` and payload field `cached: true` with countdown TTL.
- Users can bypass the cache and force a fresh lookup using the in-app **Refresh** button or by passing query parameter `?refresh=true`.

---

## 7. Health Checks & Verification

After deployment, verify system health using your live domain:

```bash
# 1. Verify health status and uptime
curl -s https://your-deployed-domain.com/api/health

# Expected response:
# {
#   "status": "UP",
#   "message": "Connected to Railway Reservation Production Server (Node.js/Express)",
#   "runtime": "Node.js v22.x",
#   "uptime": 45,
#   "environment": "production",
#   "activeProxy": "Node.js/Express (server.ts)",
#   "liveApiConfigured": false
# }

# 2. Verify live status proxy diagnostics
curl -s https://your-deployed-domain.com/api/trains/12301/live-status

# 3. Verify persistent reservations store
curl -s https://your-deployed-domain.com/api/reservations
```
