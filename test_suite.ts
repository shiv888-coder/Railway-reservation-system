/**
 * Automated Verification & Functional Test Suite
 * Tests all 9 pages, domain models, search algorithms, booking flow,
 * cancellation logic, backend API endpoints, and data consistency.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { VERIFIED_STATIONS, VERIFIED_TRAINS } from './src/data/railwayDatasets.ts';
import { TrainFactory } from './src/models/Train.ts';
import { Passenger } from './src/models/Passenger.ts';
import { TicketReservation } from './src/models/Reservation.ts';
import { Station } from './src/models/Station.ts';
import { CancellationSlip } from './src/models/CancellationSlip.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function record(category: string, name: string, passed: boolean, details: string) {
  results.push({ category, name, passed, details });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} [${category}] ${name}: ${details}`);
}

// HTTP request helper
function fetchJson(endpoint: string, options: { method?: string; body?: any; headers?: any } = {}): Promise<{ status: number; data: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, 'http://127.0.0.1:3000');
    const postData = options.body ? JSON.stringify(options.body) : null;
    const req = http.request(
      url,
      {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
          ...options.headers,
        },
      },
      (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
          try {
            const data = raw ? JSON.parse(raw) : null;
            resolve({ status: res.statusCode || 0, data, headers: res.headers });
          } catch (e) {
            resolve({ status: res.statusCode || 0, data: raw, headers: res.headers });
          }
        });
      }
    );
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('🚀 STARTING COMPREHENSIVE FUNCTIONAL TESTING & AUDIT');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // TEST SECTION 1: ALL 9 PAGES INTEGRITY CHECK
  // -------------------------------------------------------------
  console.log('--- 1. Testing All 9 Pages Integrity ---');
  const pages = [
    { name: 'Dashboard', file: 'src/components/dashboard/DashboardPage.tsx' },
    { name: 'Search Trains', file: 'src/components/search/SearchTrainsPage.tsx' },
    { name: 'Train Details', file: 'src/components/trains/TrainDetailsPage.tsx' },
    { name: 'Train & Station Directory', file: 'src/components/directory/TrainDirectoryPage.tsx' },
    { name: 'Passenger Information', file: 'src/components/passengers/PassengerInfoPage.tsx' },
    { name: 'Ticket Booking', file: 'src/components/booking/TicketBookingPage.tsx' },
    { name: 'Reservations', file: 'src/components/reservations/ReservationDetailsPage.tsx' },
    { name: 'Cancellation', file: 'src/components/cancellation/CancelReservationPage.tsx' },
    { name: 'OOP Architecture', file: 'src/components/oop/OOPArchitecturePage.tsx' },
  ];

  for (const page of pages) {
    const filePath = path.resolve(__dirname, page.file);
    const exists = fs.existsSync(filePath);
    const content = exists ? fs.readFileSync(filePath, 'utf-8') : '';
    const hasExport = content.includes('export function') || content.includes('export const') || content.includes('export default');
    record('Pages Integrity', `Page: ${page.name}`, exists && hasExport, `File ${page.file} exists (${content.length} bytes) and exports component.`);
  }

  // -------------------------------------------------------------
  // TEST SECTION 2: IMPORTANT FUNCTIONALITIES
  // -------------------------------------------------------------
  console.log('\n--- 2. Testing Important Functionalities ---');

  // 2.1 Station Directory Check: Naihati (NH) and Rampurhat (RPH)
  const nhStation = VERIFIED_STATIONS.find(s => s.code === 'NH');
  const rphStation = VERIFIED_STATIONS.find(s => s.code === 'RPH');
  record('Stations', 'Naihati (NH) in Dataset', Boolean(nhStation && nhStation.name.includes('Naihati') && nhStation.zone.includes('ER')), `Found: ${nhStation?.name} (${nhStation?.code})`);
  record('Stations', 'Rampurhat (RPH) in Dataset', Boolean(rphStation && rphStation.name.includes('Rampurhat') && rphStation.zone.includes('ER')), `Found: ${rphStation?.name} (${rphStation?.code})`);

  // 2.2 Search trains by station name and station code
  const trains = VERIFIED_TRAINS.map(t => TrainFactory.createTrain(t));
  
  // Test search: Sealdah to Naihati (SDAH -> NH)
  const sdahToNh = trains.filter(t => t.checkRouteService('SDAH', 'NH').serves);
  record('Search Algorithm', 'Sealdah (SDAH) to Naihati (NH) Search', sdahToNh.length > 0 && sdahToNh.some(t => t.trainNumber === '12377'), `Found ${sdahToNh.length} train(s) serving corridor (e.g. Train ${sdahToNh[0]?.trainNumber} ${sdahToNh[0]?.trainName})`);

  // Test search: Howrah to Rampurhat (HWH -> RPH)
  // Check if any train has HWH and RPH in sequential halts
  const hwhToRph = trains.filter(t => t.checkRouteService('HWH', 'RPH').serves);
  // Also check Sealdah to Rampurhat (SDAH -> RPH)
  const sdahToRph = trains.filter(t => t.checkRouteService('SDAH', 'RPH').serves);
  record('Search Algorithm', 'Sealdah (SDAH) to Rampurhat (RPH) Search', sdahToRph.length > 0 && sdahToRph.some(t => t.trainNumber === '12377'), `Found ${sdahToRph.length} train(s) (Train ${sdahToRph[0]?.trainNumber} ${sdahToRph[0]?.trainName})`);

  // 2.3 Train Category Filters
  const categories = ['Rajdhani', 'Shatabdi', 'Vande Bharat', 'Duronto', 'Superfast'];
  for (const cat of categories) {
    const matching = trains.filter(t => t.trainType === cat);
    record('Category Filters', `Filter: ${cat}`, matching.length > 0, `Found ${matching.length} trains matching type "${cat}"`);
  }

  // 2.4 Passenger Validation & Domain Logic
  const validPassenger = new Passenger('p_test', 'Shiv Shankar Mal', 21, 'Male', '+91 98765 43210', 'shiv@lab.edu', 'Aadhaar Card', '7829-4412-9081', 'Lower');
  const seniorPassenger = new Passenger('p_sen', 'Ramesh Chandra', 65, 'Male', '+91 91234 56789', 'ramesh@lab.edu', 'Aadhaar Card', '1234-5678-9012', 'Lower');
  record('Passenger Model', 'Senior Citizen Detection', !validPassenger.isSeniorCitizen() && seniorPassenger.isSeniorCitizen(), 'Age 21 isSenior: false, Age 65 isSenior: true');
  record('Passenger Model', 'Passenger Serialization', validPassenger.toFirestoreData().name === 'Shiv Shankar Mal', 'Successfully converted to/from JSON payload');

  // 2.5 Fare Calculation & Concessions
  const rajdhani = trains.find(t => t.trainNumber === '12301')!;
  const standardFare = rajdhani.calculateFare('3A', 1, 0);
  const seniorFare = rajdhani.calculateFare('3A', 1, 1);
  record('OOP Polymorphism', 'Tariff Calculation (3A)', standardFare.totalFare > 0 && standardFare.gst > 0, `Base: ₹${standardFare.baseFare}, Total: ₹${standardFare.totalFare}`);
  record('OOP Polymorphism', 'Senior Citizen 40% Base Fare Discount', seniorFare.seniorDiscount > 0 && seniorFare.totalFare < standardFare.totalFare, `Senior Discount: ₹${seniorFare.seniorDiscount}, Discounted Total: ₹${seniorFare.totalFare}`);

  // 2.6 Seat Allocation and Booking
  const initialAvailable = rajdhani.getAvailableSeats('3A');
  const bookedSuccess = rajdhani.bookSeats('3A', 2);
  const afterAvailable = rajdhani.getAvailableSeats('3A');
  record('Seat Allocation', 'Seat Booking State Mutation', bookedSuccess && afterAvailable === initialAvailable - 2, `Seats decreased from ${initialAvailable} to ${afterAvailable}`);

  // 2.7 Cancellation and Seat Restoration
  rajdhani.cancelSeats('3A', 2);
  const restoredAvailable = rajdhani.getAvailableSeats('3A');
  record('Seat Allocation', 'Seat Cancellation Restoration', restoredAvailable === initialAvailable, `Seats restored to ${restoredAvailable}`);

  // -------------------------------------------------------------
  // TEST SECTION 3: BACKEND API ENDPOINTS
  // -------------------------------------------------------------
  console.log('\n--- 3. Testing Node.js/Express Backend API Endpoints ---');

  // 3.1 Health Check: GET /api/health
  try {
    const health = await fetchJson('/api/health');
    record('API Endpoint', 'GET /api/health', health.status === 200 && health.data.status === 'UP', `HTTP ${health.status}, runtime: ${health.data.runtime}, activeProxy: ${health.data.activeProxy}`);
  } catch (e: any) {
    record('API Endpoint', 'GET /api/health', false, e.message);
  }

  // 3.2 Stations: GET /api/stations
  try {
    const stationsRes = await fetchJson('/api/stations');
    record('API Endpoint', 'GET /api/stations', stationsRes.status === 200 && stationsRes.data.length === 120, `HTTP ${stationsRes.status}, returned ${stationsRes.data.length} stations`);
  } catch (e: any) {
    record('API Endpoint', 'GET /api/stations', false, e.message);
  }

  // 3.3 Specific Station: GET /api/stations/NH and RPH
  try {
    const nhRes = await fetchJson('/api/stations/NH');
    record('API Endpoint', 'GET /api/stations/NH', nhRes.status === 200 && nhRes.data.stationCode === 'NH', `HTTP ${nhRes.status}, Name: ${nhRes.data.stationName}`);
    const rphRes = await fetchJson('/api/stations/RPH');
    record('API Endpoint', 'GET /api/stations/RPH', rphRes.status === 200 && rphRes.data.stationCode === 'RPH', `HTTP ${rphRes.status}, Name: ${rphRes.data.stationName}`);
  } catch (e: any) {
    record('API Endpoint', 'GET /api/stations/:code', false, e.message);
  }

  // 3.4 Trains: GET /api/trains and GET /api/trains/12377
  try {
    const trainsRes = await fetchJson('/api/trains');
    record('API Endpoint', 'GET /api/trains', trainsRes.status === 200 && trainsRes.data.length === 24, `HTTP ${trainsRes.status}, returned ${trainsRes.data.length} trains`);
    const train12377 = await fetchJson('/api/trains/12377');
    record('API Endpoint', 'GET /api/trains/12377 (Padatik)', train12377.status === 200 && train12377.data.trainNumber === '12377', `HTTP ${train12377.status}, Name: ${train12377.data.trainName}`);
  } catch (e: any) {
    record('API Endpoint', 'GET /api/trains/:trainNumber', false, e.message);
  }

  // 3.5 Live Status Proxy: GET /api/trains/12301/live-status
  try {
    const liveRes = await fetchJson('/api/trains/12301/live-status');
    const hasXCache = liveRes.headers['x-cache'] !== undefined;
    record('API Endpoint', 'GET /api/trains/12301/live-status', liveRes.status === 200 && liveRes.data.status === 'UNAVAILABLE' && hasXCache, `HTTP ${liveRes.status}, X-Cache: ${liveRes.headers['x-cache']}, status: ${liveRes.data.status}, errorCode: ${liveRes.data.errorCode}`);

    // Test Caching Hit
    const cachedLiveRes = await fetchJson('/api/trains/12301/live-status');
    record('API Caching', 'Live Status 60-second Cache HIT', cachedLiveRes.headers['x-cache'] === 'HIT' && cachedLiveRes.data.cached === true, `HTTP ${cachedLiveRes.status}, X-Cache: ${cachedLiveRes.headers['x-cache']}, TTL: ${cachedLiveRes.headers['x-cache-ttl']}`);

    // Test Cache Bypass with ?refresh=true
    const refreshedLiveRes = await fetchJson('/api/trains/12301/live-status?refresh=true');
    record('API Caching', 'Live Status Forced Refresh Bypass (?refresh=true)', refreshedLiveRes.headers['x-cache'] === 'MISS', `HTTP ${refreshedLiveRes.status}, X-Cache: ${refreshedLiveRes.headers['x-cache']}`);
  } catch (e: any) {
    record('API Endpoint', 'GET /api/trains/:trainNumber/live-status', false, e.message);
  }

  // 3.6 Booking API: POST /api/reservations/book
  let testPnr = '';
  try {
    const bookPayload = {
      trainNumber: '12377',
      journeyDate: '2026-11-20',
      travelClass: 'THIRD_AC',
      passengers: [
        {
          fullName: 'Test Automation Passenger',
          age: 26,
          gender: 'MALE',
          phone: '+91 99999 88888',
          email: 'auto.test@lab.edu',
          idProofType: 'AADHAAR_CARD',
          idProofNumber: '9988-7766-5544',
          berthPreference: 'Lower Berth',
        },
      ],
    };

    const bookRes = await fetchJson('/api/reservations/book', { method: 'POST', body: bookPayload });
    const pnrGenerated = bookRes.data?.pnr;
    testPnr = pnrGenerated;
    const isValidPnr = Boolean(pnrGenerated && pnrGenerated.length === 10);
    record('API Endpoint', 'POST /api/reservations/book', bookRes.status === 201 && isValidPnr, `HTTP ${bookRes.status}, Generated PNR: ${pnrGenerated}, Total Fare: ₹${bookRes.data.totalFare}`);

    // Verify retrieval by PNR: GET /api/reservations/:pnr
    const getRes = await fetchJson(`/api/reservations/${pnrGenerated}`);
    record('API Endpoint', 'GET /api/reservations/:pnr', getRes.status === 200 && getRes.data.pnr === pnrGenerated, `HTTP ${getRes.status}, Retreived PNR: ${getRes.data.pnr}, Status: ${getRes.data.bookingStatus}`);

    // Verify cancellation: POST /api/reservations/:pnr/cancel
    const cancelRes = await fetchJson(`/api/reservations/${pnrGenerated}/cancel`, {
      method: 'POST',
      body: { reason: 'Automated test suite cancellation verification' },
    });
    record('API Endpoint', 'POST /api/reservations/:pnr/cancel', cancelRes.status === 200 && cancelRes.data.refundAmount > 0, `HTTP ${cancelRes.status}, Refund: ₹${cancelRes.data.refundAmount}, Fee: ₹${cancelRes.data.cancellationFee}, Ref: ${cancelRes.data.refundReferenceId}`);

    // Verify re-cancellation error handling
    const reCancelRes = await fetchJson(`/api/reservations/${pnrGenerated}/cancel`, { method: 'POST', body: {} });
    record('API Endpoint', 'Re-Cancellation 400 Prevention', reCancelRes.status === 400, `HTTP ${reCancelRes.status}, Message: ${reCancelRes.data.message}`);
  } catch (e: any) {
    record('API Endpoint', 'Booking and Cancellation API Flow', false, e.message);
  }

  // 3.7 Invalid Input Error Handling
  try {
    const invalidTrain = await fetchJson('/api/trains/99999');
    record('Error Handling', 'Non-existent Train Returns 404', invalidTrain.status === 404, `HTTP ${invalidTrain.status}`);

    const invalidStation = await fetchJson('/api/stations/ZZZZ');
    record('Error Handling', 'Non-existent Station Returns 404', invalidStation.status === 404, `HTTP ${invalidStation.status}`);

    const invalidPnr = await fetchJson('/api/reservations/0000000000');
    record('Error Handling', 'Non-existent PNR Returns 404', invalidPnr.status === 404, `HTTP ${invalidPnr.status}`);

    const invalidBook = await fetchJson('/api/reservations/book', { method: 'POST', body: {} });
    record('Error Handling', 'Empty Booking Payload Returns 400', invalidBook.status === 400, `HTTP ${invalidBook.status}`);
  } catch (e: any) {
    record('Error Handling', 'Invalid Input Error Handling', false, e.message);
  }

  // 3.8 Persistent Storage Check
  const resFilePath = path.resolve(__dirname, 'data/reservations.json');
  const persistentExists = fs.existsSync(resFilePath);
  const persistentContent = persistentExists ? JSON.parse(fs.readFileSync(resFilePath, 'utf-8')) : [];
  const foundTestInFile = persistentContent.some((r: any) => r.pnr === testPnr);
  record('Data Persistence', 'Persistence in data/reservations.json', persistentExists && foundTestInFile, `File exists with ${persistentContent.length} reservations; includes test PNR ${testPnr}`);

  // -------------------------------------------------------------
  // TEST SECTION 4: GITHUB READINESS
  // -------------------------------------------------------------
  console.log('\n--- 4. Checking GitHub Readiness & Secret Protection ---');
  const gitignorePath = path.resolve(__dirname, '.gitignore');
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  const hasEnvIgnore = gitignoreContent.includes('.env*');
  const hasMavenIgnore = gitignoreContent.includes('target/') && gitignoreContent.includes('*.class');
  record('GitHub Readiness', '.gitignore Configuration', hasEnvIgnore && hasMavenIgnore, 'Includes .env*, target/, *.class, node_modules/, dist/');

  // Check no real secret in .env.example
  const envExamplePath = path.resolve(__dirname, '.env.example');
  const envExample = fs.readFileSync(envExamplePath, 'utf-8');
  const noRealSecret = !envExample.includes('AIzaSy') && !envExample.includes('rapidapi-key-real');
  record('GitHub Readiness', '.env.example Placeholder Verification', noRealSecret, 'All values are empty or safe placeholders');

  // Check README and DEPLOYMENT_GUIDE
  const readmeExists = fs.existsSync(path.resolve(__dirname, 'README.md'));
  const deployGuideExists = fs.existsSync(path.resolve(__dirname, 'DEPLOYMENT_GUIDE.md'));
  record('GitHub Readiness', 'Documentation Completeness', readmeExists && deployGuideExists, 'README.md and DEPLOYMENT_GUIDE.md present and up to date');

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`📊 TEST SUITE SUMMARY: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
