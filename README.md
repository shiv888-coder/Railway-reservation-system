# Indian Railway Reservation System (IRRS)
### Production-Ready Full-Stack Web Application & B.Tech CSE Java OOP Mini Project

[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-brightgreen.svg)](https://nodejs.org)
[![React Version](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.4-green.svg)](https://spring.io/projects/spring-boot)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-38bdf8.svg)](https://tailwindcss.com)

**Student Name:** Shiv Shankar Mal  
**Roll Number:** 2760012408  
**Project Group:** Group 9  
**Academic Program:** B.Tech Computer Science & Engineering (Semester IV)  
**Course:** Object-Oriented Programming Lab (Java)  

---

## 🚆 System Highlights

1. **Expanded Authentic Indian Railway Datasets:**
   - **120 Verified Stations** covering all **18 Railway Zones** (NR, CR, WR, ER, SR, SWR, ECR, NCR, SCR, SECR, NFR, NWR, WCR, SER, ECoR, KR, NER) including Naihati Junction (NH), Rampurhat Junction (RPH), and major national junctions.
   - **24 Premier Trains** with official route halts, arrival/departure schedules, distances, and run days across:
     - 👑 **Rajdhani Express** (e.g. 12301 Howrah, 12952 Mumbai)
     - ⚡ **Vande Bharat Express** (e.g. 22436 Varanasi, 20608 Chennai-Mysuru)
     - 🚄 **Shatabdi Express** (e.g. 12002 Bhopal, 12004 Lucknow)
     - 🚀 **Duronto Express** (e.g. 12260 Sealdah-Bikaner, 12213 Delhi-Yesvantpur)
     - 💰 **Garib Rath Express** (e.g. 12909 Bandra-Nizamuddin)
     - 🚆 **Superfast & Mail Express** (e.g. 12810 Howrah Mail, 12622 Tamil Nadu SF)

2. **Train & Station Directory:**
   - Dedicated directory navigation (`Compass` icon in sidebar).
   - Searchable Station Directory with Station Code, City, State, Zone, and direct "Departures / Arrivals" route actions.
   - Premier Fleet Explorer with category filtering, full halt timetables, distance, and run frequency.

3. **Smart Train Search & Booking:**
   - Real-time station autocomplete with station codes and cities.
   - Route path validation (prevents selecting identical origin/destination).
   - Filter by journey date, coach class (1A, 2A, 3A, SL, CC, EC), and train categories.
   - Interactive seat selection, passenger profile management, senior citizen concessions, and itemized fare breakdowns (GST, reservation fee, catering, superfast supplement).
   - Cancellation slip generation with automated refund calculation.

4. **Live Telemetry & Data Transparency Badges:**
   - Server-side proxy (`server.ts`) protects sensitive credentials (`RAILWAY_API_KEY` is never sent to the browser).
   - **60-Second In-Memory Caching** prevents API quota depletion; supports manual forced refresh (`?refresh=true`).
   - Clear status demarcation:
     - 🟢 **LIVE DATA:** GPS running status directly verified from live API.
     - 🔵 **SCHEDULE DATA:** Official published timetable schedules.
     - 🟡 **DEMO DATA:** Academic demonstration simulation.
     - ⚪ **LIVE STATUS UNAVAILABLE:** Diagnostic status with error code when no live API is configured.

5. **Java OOP Architectural Blueprint:**
   - Complete Spring Boot 3.2.4 backend in `railway-backend/`.
   - Demonstrates **Abstraction**, **Inheritance** (`BaseTrainEntity` -> subclasses), **Polymorphism** (`calculateFare()`), and **Encapsulation**.
   - Interactive OOP architecture viewer in the web UI.

---

## 🚀 Quick Start (Development & Production)

### 1. Run with Node.js / Express (Integrated Production Server)
```bash
# Install dependencies
npm install

# Start development / production server (serves both React SPA and /api/* on port 3000)
npm start
```
Visit `http://localhost:3000` in your browser.

### 2. Optional: Run Java Spring Boot Backend
```bash
cd railway-backend
mvn clean spring-boot:run
```
Spring Boot REST API will be available at `http://localhost:8080/api`.

---

## 🌐 Online Deployment

For deploying online to Render, Railway, Fly.io, or Google Cloud Run, see the complete guide in [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

> **Note on GitHub Pages:** GitHub Pages is a static file host and cannot execute Node.js or Spring Boot backends. Use Render, Railway, or Fly.io for online deployment.

---

## 🔒 Security & API Configuration

To configure live running status tracking, supply the following server-side environment variables (via AI Studio Settings → Secrets or your cloud dashboard):

- `RAILWAY_API_KEY`: Private RapidAPI key.
- `RAILWAY_API_HOST`: Provider host header.
- `RAILWAY_API_URL`: Target live status endpoint.

*Never paste API keys in chat or commit `.env` files.*
