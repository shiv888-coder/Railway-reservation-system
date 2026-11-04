/**
 * @file RailwayDataService.ts
 * Repository Pattern & Data Access Layer
 * Integrates with Java 17 + Spring Boot 3.2.4 REST Backend on http://localhost:8080/api
 * Falls back to local offline demo storage when Spring Boot server is not running.
 */

import {
  BookingStatus,
  CoachClass,
  DashboardStats,
  DataSourceType,
  FareBreakdown,
  Gender,
  LiveRunningStatus,
  PassengerData,
  ReservationData,
  SearchFilterState,
  SeatAllocation,
  StationData,
} from '../types/index.ts';
import { Passenger } from '../models/Passenger.ts';
import { BaseTrain, TrainDetailsJSON, TrainFactory } from '../models/Train.ts';
import { TicketReservation } from '../models/Reservation.ts';
import { Station } from '../models/Station.ts';
import { CancellationSlip } from '../models/CancellationSlip.ts';
import { backendApiClient } from './backendApi.ts';

export interface BookingRequest {
  trainNumber: string;
  journeyDate: string;
  travelClass: CoachClass;
  passengers: {
    name: string;
    age: number;
    gender: Gender;
    phone: string;
    email: string;
    idProofType: PassengerData['idProofType'];
    idProofNumber: string;
    berthPreference?: PassengerData['berthPreference'];
  }[];
}

import { VERIFIED_STATIONS, VERIFIED_TRAINS } from '../data/railwayDatasets.ts';

// Verified Indian Railways Seed Stations Directory (68 Major Stations across all 18 Zones)
const INITIAL_STATIONS: StationData[] = VERIFIED_STATIONS;

// Verified Indian Railways Trains (24 Premier Services across Rajdhani, Shatabdi, Vande Bharat, Duronto, Garib Rath, Superfast)
const INITIAL_TRAINS: TrainDetailsJSON[] = VERIFIED_TRAINS;

// Initial demo passengers
const INITIAL_PASSENGERS: PassengerData[] = [
  {
    id: 'pass_01',
    name: 'Shiv Shankar Mal',
    age: 21,
    gender: 'Male',
    phone: '+91 98765 43210',
    email: 'shiv.cse@lab.edu',
    idProofType: 'Aadhaar Card',
    idProofNumber: '7829-4412-9081',
    berthPreference: 'Lower',
  },
  {
    id: 'pass_02',
    name: 'Aarav Sharma',
    age: 28,
    gender: 'Male',
    phone: '+91 94123 55890',
    email: 'aarav.sharma@example.com',
    idProofType: 'PAN Card',
    idProofNumber: 'ABCPS9812K',
    berthPreference: 'Side Lower',
  },
  {
    id: 'pass_03',
    name: 'Sunita Devi',
    age: 63,
    gender: 'Female',
    phone: '+91 98321 00987',
    email: 'sunita.devi@example.com',
    idProofType: 'Aadhaar Card',
    idProofNumber: '6211-8934-2109',
    berthPreference: 'Lower',
  },
  {
    id: 'pass_04',
    name: 'Vikramaditya Roy',
    age: 34,
    gender: 'Male',
    phone: '+91 91234 87654',
    email: 'vikram.roy@example.com',
    idProofType: 'Passport',
    idProofNumber: 'Z8912304',
    berthPreference: 'Upper',
  },
];

// Initial demo reservations
const INITIAL_RESERVATIONS: ReservationData[] = [
  {
    bookingId: '2489104821',
    trainNumber: '12301',
    trainName: 'Howrah Rajdhani Express',
    trainType: 'Rajdhani',
    source: 'HWH',
    sourceStationName: 'Howrah Junction',
    destination: 'NDLS',
    destinationStationName: 'New Delhi',
    journeyDate: '2026-11-15',
    departureTime: '16:50',
    arrivalTime: '10:05',
    travelClass: '3A',
    passengers: [
      {
        id: 'p1',
        name: 'Shiv Shankar Mal',
        age: 21,
        gender: 'Male',
        phone: '+91 98765 43210',
        email: 'shiv.cse@lab.edu',
        idProofType: 'Aadhaar Card',
        idProofNumber: '7829-4412-9081',
        berthPreference: 'Lower',
        allocatedCoach: 'B3',
        allocatedSeat: 'B3-24',
      },
      {
        id: 'p2',
        name: 'Sunita Devi',
        age: 63,
        gender: 'Female',
        phone: '+91 98321 00987',
        email: 'sunita.devi@example.com',
        idProofType: 'Aadhaar Card',
        idProofNumber: '6211-8934-2109',
        berthPreference: 'Lower',
        allocatedCoach: 'B3',
        allocatedSeat: 'B3-25',
      },
    ],
    seatAllocations: [
      { passengerId: 'p1', passengerName: 'Shiv Shankar Mal', coach: 'B3', berthNumber: 24, berthType: 'Lower Berth' },
      { passengerId: 'p2', passengerName: 'Sunita Devi', coach: 'B3', berthNumber: 25, berthType: 'Middle Berth' },
    ],
    fareBreakdown: {
      baseFare: 3960,
      reservationCharge: 80,
      superfastCharge: 150,
      cateringCharge: 680,
      gst: 219,
      seniorDiscount: 495,
      totalFare: 4594,
    },
    bookingStatus: 'CONFIRMED',
    bookedAt: '2026-11-01T14:20:00.000Z',
    isDemo: true,
  },
  {
    bookingId: '8147291035',
    trainNumber: '22436',
    trainName: 'Vande Bharat Express',
    trainType: 'Vande Bharat',
    source: 'NDLS',
    sourceStationName: 'New Delhi',
    destination: 'BSB',
    destinationStationName: 'Varanasi Junction',
    journeyDate: '2026-11-18',
    departureTime: '06:00',
    arrivalTime: '14:00',
    travelClass: 'CC',
    passengers: [
      {
        id: 'p3',
        name: 'Aarav Sharma',
        age: 28,
        gender: 'Male',
        phone: '+91 94123 55890',
        email: 'aarav.sharma@example.com',
        idProofType: 'PAN Card',
        idProofNumber: 'ABCPS9812K',
        berthPreference: 'Window Seat',
        allocatedCoach: 'C4',
        allocatedSeat: 'C4-18',
      },
    ],
    seatAllocations: [
      { passengerId: 'p3', passengerName: 'Aarav Sharma', coach: 'C4', berthNumber: 18, berthType: 'Window Chair' },
    ],
    fareBreakdown: {
      baseFare: 1440,
      reservationCharge: 40,
      superfastCharge: 65,
      cateringCharge: 260,
      gst: 90,
      seniorDiscount: 0,
      totalFare: 1895,
    },
    bookingStatus: 'CONFIRMED',
    bookedAt: '2026-11-02T06:15:00.000Z',
    isDemo: true,
  },
  {
    bookingId: '4920193850',
    trainNumber: '12951',
    trainName: 'Mumbai Tejas Rajdhani Express',
    trainType: 'Rajdhani',
    source: 'CSMT',
    sourceStationName: 'Chhatrapati Shivaji Maharaj Terminus',
    destination: 'NDLS',
    destinationStationName: 'New Delhi',
    journeyDate: '2026-11-20',
    departureTime: '17:00',
    arrivalTime: '08:32',
    travelClass: '2A',
    passengers: [
      {
        id: 'p4',
        name: 'Vikramaditya Roy',
        age: 34,
        gender: 'Male',
        phone: '+91 91234 87654',
        email: 'vikram.roy@example.com',
        idProofType: 'Passport',
        idProofNumber: 'Z8912304',
        berthPreference: 'Upper',
        allocatedCoach: 'A2',
        allocatedSeat: 'A2-12',
      },
    ],
    seatAllocations: [
      { passengerId: 'p4', passengerName: 'Vikramaditya Roy', coach: 'A2', berthNumber: 12, berthType: 'Upper Berth' },
    ],
    fareBreakdown: {
      baseFare: 2820,
      reservationCharge: 50,
      superfastCharge: 75,
      cateringCharge: 340,
      gst: 164,
      seniorDiscount: 0,
      totalFare: 3449,
    },
    bookingStatus: 'CANCELLED',
    bookedAt: '2026-10-28T09:10:00.000Z',
    cancellationDetails: {
      cancelledAt: '2026-10-30T11:45:00.000Z',
      cancellationFee: 517,
      refundAmount: 2932,
      reason: 'Meeting rescheduled by client',
      refundReferenceId: 'REF-8492017420',
    },
    isDemo: true,
  },
];

const STORAGE_KEYS = {
  TRAINS: 'railway_rrs_trains_v3',
  RESERVATIONS: 'railway_rrs_reservations_v1',
  PASSENGERS: 'railway_rrs_passengers_v1',
};

/**
 * Singleton Railway Data Service connecting to Java Spring Boot Backend.
 */
class RailwayDataService {
  private _trainsMap: Map<string, BaseTrain> = new Map();
  private _reservationsMap: Map<string, TicketReservation> = new Map();
  private _passengers: Passenger[] = [];
  private _stations: Station[] = [];
  private _listeners: Set<() => void> = new Set();

  private _isBackendOnline: boolean = false;
  private _backendMessage: string = 'Checking Java Spring Boot backend...';
  private _isCheckingBackend: boolean = false;

  constructor() {
    this.initializeLocalFallback();
    // Non-blocking asynchronous probe of Spring Boot backend
    this.probeAndSyncBackend();
  }

  public get isBackendOnline(): boolean {
    return this._isBackendOnline;
  }

  public get backendMessage(): string {
    return this._backendMessage;
  }

  public get isCheckingBackend(): boolean {
    return this._isCheckingBackend;
  }

  public get backendUrl(): string {
    return backendApiClient.getBaseUrl();
  }

  /**
   * Probes the Spring Boot backend via GET /api/health and syncs live database data
   */
  public async probeAndSyncBackend(): Promise<boolean> {
    this._isCheckingBackend = true;
    this.notify();

    try {
      const health = await backendApiClient.checkHealth();
      if (health && health.status === 'UP') {
        this._isBackendOnline = true;
        this._backendMessage = health.message || 'Connected to Railway Reservation Server';

        // Load authoritative live data from Java backend endpoints
        await this.syncFromBackend();
        this._isCheckingBackend = false;
        this.notify();
        return true;
      }
    } catch (e: any) {
      this._isBackendOnline = false;
      this._backendMessage = `Backend Offline (${backendApiClient.getBaseUrl()} unreachable). Using Local Demo Data.`;
    } finally {
      this._isCheckingBackend = false;
      this.notify();
    }
    return false;
  }

  /**
   * Fetches real live data from Spring Boot REST endpoints
   */
  private async syncFromBackend(): Promise<void> {
    try {
      // 1. Stations: GET /api/stations
      const stationsData = await backendApiClient.getStations();
      if (stationsData.length > 0) {
        this._stations = stationsData.map(
          s => new Station(s.code, s.name, s.city, s.state, s.zone, s.division, s.category, s.latitude, s.longitude, s.aliases)
        );
      }

      // 2. Trains: GET /api/trains
      const trainsData = await backendApiClient.getAllTrains();
      if (trainsData.length > 0) {
        this._trainsMap.clear();
        for (const t of trainsData) {
          this._trainsMap.set(t.trainNumber, TrainFactory.createTrain(t));
        }
      }

      // 3. Reservations: GET /api/reservations
      const resData = await backendApiClient.getAllReservations();
      this._reservationsMap.clear();
      for (const r of resData) {
        const reservation = new TicketReservation(r);
        this._reservationsMap.set(reservation.bookingId, reservation);
      }

      // 4. Passengers: GET /api/passengers
      const passData = await backendApiClient.getPassengers();
      if (passData.length > 0) {
        this._passengers = passData.map(p => Passenger.fromFirestoreData(p));
      }
    } catch (err) {
      console.warn('Backend sync failed, falling back to local cache:', err);
    }
  }

  private initializeLocalFallback(): void {
    this._stations = INITIAL_STATIONS.map(
      s => new Station(s.code, s.name, s.city, s.state, s.zone, s.division, s.category, s.latitude, s.longitude, s.aliases)
    );

    let trainsJSON = INITIAL_TRAINS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRAINS);
      if (stored) trainsJSON = JSON.parse(stored);
    } catch {
      trainsJSON = INITIAL_TRAINS;
    }

    this._trainsMap.clear();
    for (const t of trainsJSON) {
      const instance = TrainFactory.createTrain(t);
      this._trainsMap.set(instance.trainNumber, instance);
    }

    let passJSON = INITIAL_PASSENGERS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PASSENGERS);
      if (stored) passJSON = JSON.parse(stored);
    } catch {
      passJSON = INITIAL_PASSENGERS;
    }
    this._passengers = passJSON.map(p => Passenger.fromFirestoreData(p));

    let resJSON = INITIAL_RESERVATIONS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
      if (stored) resJSON = JSON.parse(stored);
    } catch {
      resJSON = INITIAL_RESERVATIONS;
    }
    this._reservationsMap.clear();
    for (const r of resJSON) {
      const reservation = new TicketReservation(r);
      this._reservationsMap.set(reservation.bookingId, reservation);
    }
  }

  private persistLocalFallback(): void {
    try {
      const trainsList = Array.from(this._trainsMap.values()).map(t => t.toJSON());
      localStorage.setItem(STORAGE_KEYS.TRAINS, JSON.stringify(trainsList));

      const resList = Array.from(this._reservationsMap.values()).map(r => r.toFirestoreData());
      localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(resList));

      const passList = this._passengers.map(p => p.toFirestoreData());
      localStorage.setItem(STORAGE_KEYS.PASSENGERS, JSON.stringify(passList));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  private notify(): void {
    this._listeners.forEach(l => l());
  }

  // --- QUERY METHODS ---

  public getStations(): Station[] {
    return [...this._stations];
  }

  public getAllTrains(): BaseTrain[] {
    return Array.from(this._trainsMap.values());
  }

  public getTrainByNumber(trainNumber: string): BaseTrain | undefined {
    return this._trainsMap.get(trainNumber);
  }

  public searchTrains(filters: SearchFilterState): BaseTrain[] {
    const { source, destination, travelClass, trainType } = filters;
    return this.getAllTrains().filter(train => {
      // Route Serving Logic: Check if train serves the origin & destination corridor
      // (either direct terminals or intermediate halts where boarding seq < deboarding seq)
      const routeCheck = train.checkRouteService(source, destination);
      if (!routeCheck.serves) return false;

      if (travelClass && travelClass !== 'ALL' && !train.classesAvailable.includes(travelClass)) return false;
      if (trainType && trainType !== 'ALL' && train.trainType !== trainType) return false;
      return true;
    });
  }

  public getAllReservations(): TicketReservation[] {
    return Array.from(this._reservationsMap.values()).sort(
      (a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()
    );
  }

  public getReservationByPnr(pnr: string): TicketReservation | undefined {
    const cleanPnr = pnr.replace(/-/g, '').trim();
    return this._reservationsMap.get(cleanPnr);
  }

  public getPassengers(): Passenger[] {
    return [...this._passengers];
  }

  /**
   * Data Source Provenance Breakdown:
   * Explicitly categorizes each feature's real data source to prevent deceptive representations.
   */
  public getDataProvenance(trainNumber?: string): {
    stationDirectory: DataSourceType;
    timetables: DataSourceType;
    runningStatus: DataSourceType;
    seatAvailability: DataSourceType;
    fares: DataSourceType;
    booking: DataSourceType;
  } {
    return {
      stationDirectory: 'SCHEDULE', // Authentic Indian Railways Station Codes
      timetables: 'SCHEDULE',       // Authentic National Published Timetable
      runningStatus: 'SCHEDULE',    // Live when external key is configured in backend, otherwise authentic scheduled timetable tracking
      seatAvailability: 'DEMO',     // Simulated inventory in MySQL / local storage
      fares: 'DEMO',                // Tariff calculations via Java OOP models
      booking: 'DEMO',              // Academic simulation — not an IRCTC official ticket
    };
  }

  /**
   * Live Train Running Status Enquiry:
   * Checks external Railway API if configured, or evaluates timetable schedule progress.
   */
  public async getLiveRunningStatus(trainNumber: string): Promise<LiveRunningStatus> {
    const train = this.getTrainByNumber(trainNumber);
    if (!train) {
      return {
        trainNumber,
        trainName: 'Unknown Train',
        currentStationName: 'Not Found',
        currentStationCode: 'N/A',
        status: 'SCHEDULED',
        delayMinutes: 0,
        lastUpdated: new Date().toLocaleTimeString(),
        sourceType: 'UNAVAILABLE',
        message: `Train ${trainNumber} was not found in the national directory.`,
      };
    }

    // Query the secure backend proxy (Spring Boot on 8080 or Express on 3000)
    // The proxy holds the RAILWAY_API_KEY in server environment variables — never exposed to client browser
    try {
      const proxyEndpoint = this._isBackendOnline
        ? `${backendApiClient.getBaseUrl()}/trains/${encodeURIComponent(trainNumber)}/live-status`
        : `/api/trains/${encodeURIComponent(trainNumber)}/live-status`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const res = await fetch(proxyEndpoint, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const backendStatus = await res.json();
        return {
          trainNumber: train.trainNumber,
          trainName: backendStatus.trainName || train.trainName,
          currentStationName: backendStatus.currentStationName || train.sourceStationName,
          currentStationCode: backendStatus.currentStationCode || train.source,
          status: backendStatus.status || 'UNAVAILABLE',
          delayMinutes: backendStatus.delayMinutes || 0,
          lastUpdated: backendStatus.lastUpdated || new Date().toLocaleTimeString(),
          nextHaltName: backendStatus.nextHaltName || train.halts[1]?.stationName,
          nextHaltDeparture: backendStatus.nextHaltDeparture || train.halts[1]?.departureTime,
          sourceType: backendStatus.sourceType || 'UNAVAILABLE',
          apiConfigured: backendStatus.apiConfigured ?? false,
          apiProvider: backendStatus.apiProvider || 'RapidAPI IRCTC Gateway (Backend Proxy)',
          errorCode: backendStatus.errorCode,
          message: backendStatus.message,
        };
      }
    } catch (err: any) {
      console.warn('Backend live status proxy unreachable or error:', err);
    }

    // Fallback if proxy unreachable and key unconfigured
    return {
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      currentStationName: `${train.sourceStationName} (${train.source})`,
      currentStationCode: train.source,
      status: 'UNAVAILABLE',
      delayMinutes: 0,
      lastUpdated: new Date().toLocaleTimeString(),
      nextHaltName: train.halts[1]?.stationName || train.destinationStationName,
      nextHaltDeparture: train.halts[1]?.departureTime || train.arrivalTime,
      sourceType: 'UNAVAILABLE',
      apiConfigured: false,
      apiProvider: 'No Verified Live Provider Configured',
      errorCode: 'NO_VERIFIED_PROVIDER',
      message: 'No verified live railway API provider or RAILWAY_API_KEY is configured. Live tracking status is UNAVAILABLE. Official published timetable schedule is displayed below.',
    };
  }

  // --- MUTATION METHODS ---

  public async savePassenger(passengerData: PassengerData): Promise<Passenger> {
    if (this._isBackendOnline) {
      try {
        const isUpdate = passengerData.id &&
          !passengerData.id.startsWith('pass_temp') &&
          !passengerData.id.startsWith('pass_' + Date.now().toString().slice(0, 4)) &&
          this._passengers.some(p => p.id === passengerData.id);

        const saved = isUpdate
          ? await backendApiClient.updatePassenger(passengerData.id, passengerData)
          : await backendApiClient.createPassenger(passengerData);

        const passengerInstance = Passenger.fromFirestoreData(saved);
        const idx = this._passengers.findIndex(p => p.id === passengerInstance.id);
        if (idx >= 0) this._passengers[idx] = passengerInstance;
        else this._passengers.unshift(passengerInstance);
        this.notify();
        return passengerInstance;
      } catch (e: any) {
        console.warn('Backend passenger save failed, using local fallback:', e);
      }
    }

    // Local fallback
    const existingIndex = this._passengers.findIndex(p => p.id === passengerData.id);
    const passenger = Passenger.fromFirestoreData(passengerData);
    if (existingIndex >= 0) {
      this._passengers[existingIndex] = passenger;
    } else {
      this._passengers.unshift(passenger);
    }
    this.persistLocalFallback();
    return passenger;
  }

  /**
   * Dynamically calculates fare via Java Spring Boot POST /api/booking/calculate-fare
   * when connected, or falls back to local train OOP calculateFare.
   */
  public async calculateFare(
    trainNumber: string,
    coachClass: CoachClass,
    passengerCount: number,
    seniorCount: number = 0
  ): Promise<FareBreakdown> {
    if (this._isBackendOnline) {
      try {
        return await backendApiClient.calculateFare(trainNumber, coachClass, passengerCount, seniorCount);
      } catch (e) {
        console.warn('Backend calculate-fare error, falling back to local OOP calculation:', e);
      }
    }
    const train = this.getTrainByNumber(trainNumber);
    if (!train) {
      throw new Error(`Train ${trainNumber} not found.`);
    }
    return train.calculateFare(coachClass, passengerCount, seniorCount);
  }

  public async deletePassenger(passengerId: string): Promise<void> {
    if (this._isBackendOnline) {
      try {
        await backendApiClient.deletePassenger(passengerId);
      } catch (e) {
        console.warn('Backend passenger delete failed:', e);
      }
    }
    this._passengers = this._passengers.filter(p => p.id !== passengerId);
    this.persistLocalFallback();
  }

  /**
   * Book ticket: Delegates to Java Spring Boot POST /api/reservations/book
   * when connected, or falls back to local OOP booking if offline.
   */
  public async bookTicket(request: BookingRequest): Promise<TicketReservation> {
    if (this._isBackendOnline) {
      try {
        const rawReservation = await backendApiClient.bookTicket(request);
        const reservation = new TicketReservation(rawReservation);
        this._reservationsMap.set(reservation.bookingId, reservation);

        // Refresh train seat count from backend
        try {
          const updatedTrain = await backendApiClient.getTrainByNumber(request.trainNumber);
          this._trainsMap.set(updatedTrain.trainNumber, TrainFactory.createTrain(updatedTrain));
        } catch {}

        this.notify();
        return reservation;
      } catch (e: any) {
        throw new Error(e.message || 'Java Backend Booking Failed');
      }
    }

    // Local Offline Demo Mode Booking
    const train = this.getTrainByNumber(request.trainNumber);
    if (!train) {
      throw new Error(`Train #${request.trainNumber} not found.`);
    }

    const passengerCount = request.passengers.length;
    if (passengerCount <= 0) {
      throw new Error('At least one passenger must be specified.');
    }

    const success = train.bookSeats(request.travelClass, passengerCount);
    if (!success) {
      throw new Error(`Insufficient seats in class ${request.travelClass} on Train ${train.trainNumber}.`);
    }

    const passengerInstances: Passenger[] = request.passengers.map((p, idx) => {
      const passId = `pass_${Date.now()}_${idx}`;
      return new Passenger(
        passId,
        p.name,
        p.age,
        p.gender,
        p.phone,
        p.email,
        p.idProofType,
        p.idProofNumber,
        p.berthPreference || 'No Preference'
      );
    });

    const seniorCount = passengerInstances.filter(p => p.isSeniorCitizen()).length;
    const fareBreakdown = train.calculateFare(request.travelClass, passengerCount, seniorCount);

    const coachPrefix = request.travelClass === '1A' ? 'H1' :
      request.travelClass === '2A' ? 'A1' :
      request.travelClass === '3A' ? 'B2' :
      request.travelClass === 'EC' ? 'E1' :
      request.travelClass === 'CC' ? 'C2' : 'S3';

    const baseSeatNumber = Math.floor(Math.random() * 40) + 1;
    const berthTypes = ['Lower Berth', 'Middle Berth', 'Upper Berth', 'Side Lower', 'Side Upper'];

    const seatAllocations: SeatAllocation[] = passengerInstances.map((p, idx) => {
      const seatNum = baseSeatNumber + idx;
      const bType = request.travelClass === 'CC' || request.travelClass === 'EC'
        ? (idx % 2 === 0 ? 'Window Chair' : 'Aisle Chair')
        : berthTypes[idx % berthTypes.length];

      p.allocatedCoach = coachPrefix;
      p.allocatedSeat = `${coachPrefix}-${seatNum}`;

      return {
        passengerId: p.id,
        passengerName: p.name,
        coach: coachPrefix,
        berthNumber: seatNum,
        berthType: bType,
      };
    });

    const pnr = Math.floor(2000000000 + Math.random() * 8000000000).toString();

    const reservationData: ReservationData = {
      bookingId: pnr,
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      trainType: train.trainType,
      source: train.source,
      sourceStationName: train.sourceStationName,
      destination: train.destination,
      destinationStationName: train.destinationStationName,
      journeyDate: request.journeyDate,
      departureTime: train.departureTime,
      arrivalTime: train.arrivalTime,
      travelClass: request.travelClass,
      passengers: passengerInstances.map(p => p.toFirestoreData()),
      seatAllocations,
      fareBreakdown,
      bookingStatus: 'CONFIRMED',
      bookedAt: new Date().toISOString(),
      isDemo: true,
    };

    const reservation = new TicketReservation(reservationData);
    this._reservationsMap.set(pnr, reservation);

    for (const p of passengerInstances) {
      if (!this._passengers.some(existing => existing.phone === p.phone && existing.name.toLowerCase() === p.name.toLowerCase())) {
        this._passengers.push(p);
      }
    }

    this.persistLocalFallback();
    return reservation;
  }

  /**
   * Cancel ticket: Delegates to Java Spring Boot POST /api/reservations/{pnr}/cancel
   * when connected, or falls back to local cancellation if offline.
   */
  public async cancelReservation(bookingId: string, reason: string = 'User requested cancellation'): Promise<CancellationSlip> {
    const cleanPnr = bookingId.replace(/-/g, '').trim();

    if (this._isBackendOnline) {
      try {
        const rawSlip = await backendApiClient.cancelReservation(cleanPnr, reason);
        const slip = new CancellationSlip(cleanPnr, 0, reason);
        // Sync reservation state
        const updatedReservation = await backendApiClient.getReservationByPnr(cleanPnr);
        const reservationInstance = new TicketReservation(updatedReservation);
        this._reservationsMap.set(cleanPnr, reservationInstance);

        // Sync train seats
        try {
          const updatedTrain = await backendApiClient.getTrainByNumber(reservationInstance.trainNumber);
          this._trainsMap.set(updatedTrain.trainNumber, TrainFactory.createTrain(updatedTrain));
        } catch {}

        this.notify();
        return slip;
      } catch (e: any) {
        throw new Error(e.message || 'Java Backend Cancellation Failed');
      }
    }

    // Local Offline Demo Mode Cancellation
    const reservation = this.getReservationByPnr(cleanPnr);
    if (!reservation) {
      throw new Error(`Reservation with PNR ${bookingId} not found.`);
    }

    if (reservation.isCancelled()) {
      throw new Error(`Reservation with PNR ${bookingId} is already cancelled.`);
    }

    const train = this.getTrainByNumber(reservation.trainNumber);
    if (train) {
      train.cancelSeats(reservation.travelClass, reservation.passengers.length);
    }

    const slip = reservation.cancel(reason);
    this.persistLocalFallback();
    return slip;
  }

  /**
   * Computed Dashboard KPIs
   */
  public getDashboardStats(): DashboardStats {
    const trains = this.getAllTrains();
    const reservations = this.getAllReservations();

    let totalAvailableSeats = 0;
    for (const t of trains) {
      for (const cls of t.classesAvailable) {
        totalAvailableSeats += t.getAvailableSeats(cls);
      }
    }

    const confirmed = reservations.filter(r => r.isConfirmed());
    const cancelled = reservations.filter(r => r.isCancelled());

    const totalRevenue = confirmed.reduce(
      (acc, curr) => acc + curr.fareBreakdown.totalFare,
      0
    );

    return {
      totalTrains: trains.length,
      totalBookings: reservations.length,
      availableSeats: totalAvailableSeats,
      cancelledTickets: cancelled.length,
      activePassengers: confirmed.reduce((acc, curr) => acc + curr.passengers.length, 0),
      totalRevenue,
    };
  }

  public resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.TRAINS);
    localStorage.removeItem(STORAGE_KEYS.RESERVATIONS);
    localStorage.removeItem(STORAGE_KEYS.PASSENGERS);
    this.initializeLocalFallback();
    this.probeAndSyncBackend();
  }
}

// Export singleton instance
export const railwayService = new RailwayDataService();
