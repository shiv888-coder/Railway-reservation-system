/**
 * @file backendApi.ts
 * Dedicated REST API Client for Java 17 + Spring Boot 3.2.4 Backend.
 * Base URL: http://localhost:8080/api (Configurable via VITE_API_BASE_URL)
 */

import {
  CoachClass,
  Gender,
  IdProofType,
  StationData,
  PassengerData,
  ReservationData,
  FareBreakdown,
  DashboardStats,
  BookingStatus,
} from '../types/index.ts';
import { TrainDetailsJSON } from '../models/Train.ts';

const API_BASE_URL = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) ||
  '/api'
).replace(/\/$/, '');

// ============================================================================
// DTO & ENUM MAPPER FUNCTIONS
// Translates between Frontend TypeScript types and Java Spring Boot Enum strings
// ============================================================================

export function toBackendCoachClass(c: CoachClass): string {
  switch (c) {
    case '1A': return 'FIRST_AC';
    case '2A': return 'SECOND_AC';
    case '3A': return 'THIRD_AC';
    case 'SL': return 'SLEEPER';
    case 'CC': return 'CHAIR_CAR';
    case 'EC': return 'EXECUTIVE_CHAIR';
    default: return 'THIRD_AC';
  }
}

export function fromBackendCoachClass(s: string): CoachClass {
  if (!s) return '3A';
  const clean = s.toUpperCase();
  switch (clean) {
    case 'FIRST_AC':
    case '1A':
      return '1A';
    case 'SECOND_AC':
    case '2A':
      return '2A';
    case 'THIRD_AC':
    case '3A':
      return '3A';
    case 'SLEEPER':
    case 'SL':
      return 'SL';
    case 'CHAIR_CAR':
    case 'CC':
      return 'CC';
    case 'EXECUTIVE_CHAIR':
    case 'EC':
      return 'EC';
    default:
      return '3A';
  }
}

export function toBackendGender(g: Gender): string {
  return g ? g.toUpperCase() : 'MALE';
}

export function fromBackendGender(s: string): Gender {
  if (!s) return 'Male';
  const clean = s.toUpperCase();
  if (clean === 'MALE') return 'Male';
  if (clean === 'FEMALE') return 'Female';
  if (clean === 'TRANSGENDER') return 'Transgender';
  return 'Other';
}

export function toBackendIdProofType(idType: IdProofType): string {
  switch (idType) {
    case 'Aadhaar Card': return 'AADHAAR_CARD';
    case 'PAN Card': return 'PAN_CARD';
    case 'Passport': return 'PASSPORT';
    case 'Voter ID': return 'VOTER_ID';
    case 'Driving License': return 'DRIVING_LICENSE';
    case 'Student ID': return 'STUDENT_ID';
    default: return 'AADHAAR_CARD';
  }
}

export function fromBackendIdProofType(s: string): IdProofType {
  if (!s) return 'Aadhaar Card';
  const clean = s.toUpperCase();
  switch (clean) {
    case 'AADHAAR_CARD': return 'Aadhaar Card';
    case 'PAN_CARD': return 'PAN Card';
    case 'PASSPORT': return 'Passport';
    case 'VOTER_ID': return 'Voter ID';
    case 'DRIVING_LICENSE': return 'Driving License';
    case 'STUDENT_ID': return 'Student ID';
    default: return 'Aadhaar Card';
  }
}

export function fromBackendTrainType(s: string): 'Superfast' | 'Rajdhani' | 'Vande Bharat' | 'Mail Express' {
  if (!s) return 'Superfast';
  const clean = s.toUpperCase();
  if (clean.includes('RAJDHANI')) return 'Rajdhani';
  if (clean.includes('VANDE')) return 'Vande Bharat';
  if (clean.includes('SUPERFAST')) return 'Superfast';
  return 'Mail Express';
}

// Transform backend BaseTrainEntity JSON to frontend TrainDetailsJSON
export function mapBackendTrainToFrontend(raw: any): TrainDetailsJSON {
  const classesAvailable: CoachClass[] = (raw.seats || []).map((st: any) =>
    fromBackendCoachClass(st.coachClass)
  );

  const totalSeats: Record<CoachClass, number> = {
    '1A': 0, '2A': 0, '3A': 0, 'SL': 0, 'CC': 0, 'EC': 0,
  };
  const availableSeats: Record<CoachClass, number> = {
    '1A': 0, '2A': 0, '3A': 0, 'SL': 0, 'CC': 0, 'EC': 0,
  };
  const baseFares: Record<CoachClass, number> = {
    '1A': 0, '2A': 0, '3A': 0, 'SL': 0, 'CC': 0, 'EC': 0,
  };

  for (const st of raw.seats || []) {
    const cls = fromBackendCoachClass(st.coachClass);
    totalSeats[cls] = st.totalSeats || 0;
    availableSeats[cls] = st.availableSeats || 0;
    baseFares[cls] = typeof st.baseFare === 'number' ? st.baseFare : parseFloat(st.baseFare || '0');
  }

  const halts = (raw.halts || []).map((h: any, idx: number) => ({
    stationCode: h.station?.stationCode || h.stationCode || 'STN',
    stationName: h.station?.stationName || h.stationName || 'Station',
    arrivalTime: h.arrivalTime || '00:00',
    departureTime: h.departureTime || '00:00',
    haltMinutes: h.haltMinutes || 0,
    distanceKm: h.distanceKm || 0,
    day: h.dayNumber || 1,
  }));

  const departureStr = typeof raw.departureTime === 'string'
    ? raw.departureTime.slice(0, 5)
    : '00:00';
  const arrivalStr = typeof raw.arrivalTime === 'string'
    ? raw.arrivalTime.slice(0, 5)
    : '00:00';

  return {
    trainNumber: raw.trainNumber,
    trainName: raw.trainName,
    trainType: fromBackendTrainType(raw.trainType),
    source: raw.sourceStation?.stationCode || 'NDLS',
    sourceStationName: raw.sourceStation?.stationName || 'New Delhi',
    destination: raw.destinationStation?.stationCode || 'HWH',
    destinationStationName: raw.destinationStation?.stationName || 'Howrah',
    departureTime: departureStr,
    arrivalTime: arrivalStr,
    durationHours: raw.durationHours || '12h 00m',
    distanceKm: raw.distanceKm || 1000,
    daysOfOperation: raw.daysOfOperation ? raw.daysOfOperation.split(',').map((d: string) => d.trim()) : ['Daily'],
    classesAvailable: classesAvailable.length > 0 ? classesAvailable : ['3A'],
    totalSeats,
    availableSeats,
    baseFares,
    halts,
    amenities: raw.amenities || [
      'High Speed Wi-Fi',
      'Catering Car',
      'Charging Ports',
      'Clean Bedroll (AC)',
      'CCTV Surveillance',
    ],
  };
}

// Transform backend ReservationEntity JSON to frontend ReservationData
export function mapBackendReservationToFrontend(raw: any): ReservationData {
  const travelClass = fromBackendCoachClass(raw.travelClass);
  const trainType = fromBackendTrainType(raw.train?.trainType);

  const passengers: PassengerData[] = (raw.seatAllocations || []).map((alloc: any, idx: number) => {
    const p = alloc.passenger || {};
    return {
      id: p.passengerId ? `pass_${p.passengerId}` : `pass_${idx}`,
      name: p.fullName || 'Passenger',
      age: p.age || 25,
      gender: fromBackendGender(p.gender),
      phone: p.phone || '',
      email: p.email || '',
      idProofType: fromBackendIdProofType(p.idProofType),
      idProofNumber: p.idProofNumber || '',
      allocatedCoach: alloc.coachNumber || 'B2',
      allocatedSeat: `${alloc.coachNumber || 'B2'}-${alloc.berthNumber || idx + 1}`,
    };
  });

  const seatAllocations = (raw.seatAllocations || []).map((alloc: any) => ({
    passengerId: alloc.passenger?.passengerId ? `pass_${alloc.passenger.passengerId}` : 'p1',
    passengerName: alloc.passenger?.fullName || 'Passenger',
    coach: alloc.coachNumber || 'B2',
    berthNumber: alloc.berthNumber || 1,
    berthType: alloc.berthType || 'Lower Berth',
  }));

  const fareBreakdown: FareBreakdown = {
    baseFare: typeof raw.baseFare === 'number' ? raw.baseFare : parseFloat(raw.baseFare || '0'),
    reservationCharge: typeof raw.reservationCharge === 'number' ? raw.reservationCharge : parseFloat(raw.reservationCharge || '0'),
    superfastCharge: typeof raw.superfastCharge === 'number' ? raw.superfastCharge : parseFloat(raw.superfastCharge || '0'),
    cateringCharge: typeof raw.cateringCharge === 'number' ? raw.cateringCharge : parseFloat(raw.cateringCharge || '0'),
    gst: typeof raw.gstAmount === 'number' ? raw.gstAmount : parseFloat(raw.gstAmount || '0'),
    seniorDiscount: typeof raw.seniorDiscount === 'number' ? raw.seniorDiscount : parseFloat(raw.seniorDiscount || '0'),
    totalFare: typeof raw.totalFare === 'number' ? raw.totalFare : parseFloat(raw.totalFare || '0'),
  };

  let cancellationDetails = undefined;
  if (raw.cancellationSlip) {
    cancellationDetails = {
      cancelledAt: raw.cancellationSlip.cancelledAt || new Date().toISOString(),
      cancellationFee: typeof raw.cancellationSlip.cancellationFee === 'number' ? raw.cancellationSlip.cancellationFee : parseFloat(raw.cancellationSlip.cancellationFee || '0'),
      refundAmount: typeof raw.cancellationSlip.refundAmount === 'number' ? raw.cancellationSlip.refundAmount : parseFloat(raw.cancellationSlip.refundAmount || '0'),
      reason: raw.cancellationSlip.cancellationReason || 'Cancelled',
      refundReferenceId: raw.cancellationSlip.refundReferenceId || 'REF-000000',
    };
  }

  const depStr = raw.train?.departureTime
    ? (typeof raw.train.departureTime === 'string' ? raw.train.departureTime.slice(0, 5) : '00:00')
    : '16:50';
  const arrStr = raw.train?.arrivalTime
    ? (typeof raw.train.arrivalTime === 'string' ? raw.train.arrivalTime.slice(0, 5) : '00:00')
    : '10:05';

  return {
    bookingId: raw.pnr,
    trainNumber: raw.train?.trainNumber || '12301',
    trainName: raw.train?.trainName || 'Express',
    trainType,
    source: raw.sourceStation?.stationCode || 'NDLS',
    sourceStationName: raw.sourceStation?.stationName || 'New Delhi',
    destination: raw.destinationStation?.stationCode || 'HWH',
    destinationStationName: raw.destinationStation?.stationName || 'Howrah',
    journeyDate: typeof raw.journeyDate === 'string' ? raw.journeyDate : new Date().toISOString().split('T')[0],
    departureTime: depStr,
    arrivalTime: arrStr,
    travelClass,
    passengers,
    seatAllocations,
    fareBreakdown,
    bookingStatus: (raw.bookingStatus as BookingStatus) || 'CONFIRMED',
    bookedAt: raw.bookedAt || new Date().toISOString(),
    cancellationDetails,
    isDemo: false,
  };
}

// ============================================================================
// BACKEND REST API CLIENT METHODS
// ============================================================================

export class BackendApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Check Spring Boot backend health: GET /api/health
   */
  public async checkHealth(): Promise<{ status: string; message?: string; project?: any; runtime?: any }> {
    const res = await fetch(`${this.baseUrl}/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Backend health check failed: HTTP ${res.status}`);
    }
    return res.json();
  }

  /**
   * GET /api/stations
   */
  public async getStations(): Promise<StationData[]> {
    const res = await fetch(`${this.baseUrl}/stations`);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching stations`);
    const data = await res.json();
    return data.map((s: any) => ({
      code: s.stationCode,
      name: s.stationName,
      city: s.city,
      state: s.state,
      zone: s.zone,
    }));
  }

  /**
   * GET /api/stations/{code}
   */
  public async getStationByCode(code: string): Promise<StationData> {
    const res = await fetch(`${this.baseUrl}/stations/${encodeURIComponent(code.trim().toUpperCase())}`);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching station ${code}`);
    const s = await res.json();
    return {
      code: s.stationCode,
      name: s.stationName,
      city: s.city,
      state: s.state,
      zone: s.zone,
    };
  }

  /**
   * GET /api/trains
   */
  public async getAllTrains(): Promise<TrainDetailsJSON[]> {
    const res = await fetch(`${this.baseUrl}/trains`);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching trains`);
    const data = await res.json();
    return data.map(mapBackendTrainToFrontend);
  }

  /**
   * GET /api/trains/search?source=...&destination=...
   */
  public async searchTrains(source?: string, destination?: string): Promise<TrainDetailsJSON[]> {
    const params = new URLSearchParams();
    if (source) params.append('source', source);
    if (destination) params.append('destination', destination);

    const res = await fetch(`${this.baseUrl}/trains/search?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status} searching trains`);
    const data = await res.json();
    return data.map(mapBackendTrainToFrontend);
  }

  /**
   * GET /api/trains/{trainNumber}
   */
  public async getTrainByNumber(trainNumber: string): Promise<TrainDetailsJSON> {
    const res = await fetch(`${this.baseUrl}/trains/${encodeURIComponent(trainNumber)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching train ${trainNumber}`);
    const data = await res.json();
    return mapBackendTrainToFrontend(data);
  }

  /**
   * GET /api/trains/{trainNumber}/seats
   * Retrieves class-wise seat capacity and availability for a train.
   */
  public async getTrainSeats(trainNumber: string): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/trains/${encodeURIComponent(trainNumber)}/seats`);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching seats for train ${trainNumber}`);
    return res.json();
  }

  /**
   * GET /api/trains/{trainNumber}/live-status
   * Backend proxy for live railway running status.
   */
  public async getTrainLiveStatus(trainNumber: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/trains/${encodeURIComponent(trainNumber)}/live-status`);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching live status for train ${trainNumber}`);
    return res.json();
  }

  /**
   * GET /api/passengers
   */
  public async getPassengers(): Promise<PassengerData[]> {
    const res = await fetch(`${this.baseUrl}/passengers`);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching passengers`);
    const data = await res.json();
    return data.map((p: any) => ({
      id: `pass_${p.passengerId}`,
      name: p.fullName,
      age: p.age,
      gender: fromBackendGender(p.gender),
      phone: p.phone,
      email: p.email,
      idProofType: fromBackendIdProofType(p.idProofType),
      idProofNumber: p.idProofNumber,
      berthPreference: 'No Preference',
    }));
  }

  /**
   * POST /api/passengers
   */
  public async createPassenger(passenger: PassengerData): Promise<PassengerData> {
    const body = {
      fullName: passenger.name,
      age: passenger.age,
      gender: toBackendGender(passenger.gender),
      phone: passenger.phone,
      email: passenger.email,
      idProofType: toBackendIdProofType(passenger.idProofType),
      idProofNumber: passenger.idProofNumber,
      berthPreference: passenger.berthPreference || 'No Preference',
    };

    const res = await fetch(`${this.baseUrl}/passengers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to save passenger profile (HTTP ${res.status})`);
    }

    const saved = await res.json();
    return {
      id: `pass_${saved.passengerId}`,
      name: saved.fullName,
      age: saved.age,
      gender: fromBackendGender(saved.gender),
      phone: saved.phone,
      email: saved.email,
      idProofType: fromBackendIdProofType(saved.idProofType),
      idProofNumber: saved.idProofNumber,
      berthPreference: passenger.berthPreference || 'No Preference',
    };
  }

  /**
   * PUT /api/passengers/{id}
   */
  public async updatePassenger(id: string, passenger: PassengerData): Promise<PassengerData> {
    const numericId = id.replace('pass_', '');
    const body = {
      fullName: passenger.name,
      age: passenger.age,
      gender: toBackendGender(passenger.gender),
      phone: passenger.phone,
      email: passenger.email,
      idProofType: toBackendIdProofType(passenger.idProofType),
      idProofNumber: passenger.idProofNumber,
      berthPreference: passenger.berthPreference || 'No Preference',
    };

    const res = await fetch(`${this.baseUrl}/passengers/${numericId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to update passenger profile (HTTP ${res.status})`);
    }

    const saved = await res.json();
    return {
      id: `pass_${saved.passengerId}`,
      name: saved.fullName,
      age: saved.age,
      gender: fromBackendGender(saved.gender),
      phone: saved.phone,
      email: saved.email,
      idProofType: fromBackendIdProofType(saved.idProofType),
      idProofNumber: saved.idProofNumber,
      berthPreference: passenger.berthPreference || 'No Preference',
    };
  }

  /**
   * DELETE /api/passengers/{id}
   */
  public async deletePassenger(id: string): Promise<void> {
    const numericId = id.replace('pass_', '');
    const res = await fetch(`${this.baseUrl}/passengers/${numericId}`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 404) {
      throw new Error(`HTTP ${res.status} deleting passenger`);
    }
  }

  /**
   * POST /api/booking/calculate-fare
   */
  public async calculateFare(
    trainNumber: string,
    coachClass: CoachClass,
    passengerCount: number,
    seniorCount: number = 0
  ): Promise<FareBreakdown> {
    const body = {
      trainNumber,
      coachClass: toBackendCoachClass(coachClass),
      passengerCount,
      seniorCount,
    };

    const res = await fetch(`${this.baseUrl}/booking/calculate-fare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Fare calculation failed (HTTP ${res.status})`);
    }

    const data = await res.json();
    return {
      baseFare: parseFloat(data.baseFare || '0'),
      reservationCharge: parseFloat(data.reservationCharge || '0'),
      superfastCharge: parseFloat(data.superfastCharge || '0'),
      cateringCharge: parseFloat(data.cateringCharge || '0'),
      gst: parseFloat(data.gstAmount || '0'),
      seniorDiscount: parseFloat(data.seniorDiscount || '0'),
      totalFare: parseFloat(data.totalFare || '0'),
    };
  }

  /**
   * POST /api/reservations/book
   */
  public async bookTicket(bookingRequest: {
    trainNumber: string;
    journeyDate: string;
    travelClass: CoachClass;
    passengers: {
      name: string;
      age: number;
      gender: Gender;
      phone: string;
      email: string;
      idProofType: IdProofType;
      idProofNumber: string;
      berthPreference?: string;
    }[];
  }): Promise<ReservationData> {
    const payload = {
      trainNumber: bookingRequest.trainNumber,
      journeyDate: bookingRequest.journeyDate,
      travelClass: toBackendCoachClass(bookingRequest.travelClass),
      passengers: bookingRequest.passengers.map(p => ({
        fullName: p.name,
        age: p.age,
        gender: toBackendGender(p.gender),
        phone: p.phone,
        email: p.email,
        idProofType: toBackendIdProofType(p.idProofType),
        idProofNumber: p.idProofNumber,
        berthPreference: p.berthPreference || 'No Preference',
      })),
    };

    const res = await fetch(`${this.baseUrl}/reservations/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Reservation failed (HTTP ${res.status})`);
    }

    const data = await res.json();
    return mapBackendReservationToFrontend(data);
  }

  /**
   * GET /api/reservations/{pnr}
   */
  public async getReservationByPnr(pnr: string): Promise<ReservationData> {
    const cleanPnr = pnr.replace(/-/g, '').trim();
    const res = await fetch(`${this.baseUrl}/reservations/${cleanPnr}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Reservation with PNR ${cleanPnr} not found (HTTP ${res.status})`);
    }
    const data = await res.json();
    return mapBackendReservationToFrontend(data);
  }

  /**
   * GET /api/reservations
   */
  public async getAllReservations(status?: string): Promise<ReservationData[]> {
    const url = status ? `${this.baseUrl}/reservations?status=${status}` : `${this.baseUrl}/reservations`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching reservations`);
    const data = await res.json();
    return data.map(mapBackendReservationToFrontend);
  }

  /**
   * POST /api/reservations/{pnr}/cancel
   */
  public async cancelReservation(pnr: string, reason: string = 'User requested cancellation'): Promise<any> {
    const cleanPnr = pnr.replace(/-/g, '').trim();
    const res = await fetch(`${this.baseUrl}/reservations/${cleanPnr}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ reason }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Cancellation failed (HTTP ${res.status})`);
    }

    const slip = await res.json();
    return {
      bookingId: cleanPnr,
      cancelledAt: slip.cancelledAt,
      cancellationFee: typeof slip.cancellationFee === 'number' ? slip.cancellationFee : parseFloat(slip.cancellationFee || '0'),
      refundAmount: typeof slip.refundAmount === 'number' ? slip.refundAmount : parseFloat(slip.refundAmount || '0'),
      reason: slip.cancellationReason || reason,
      refundReferenceId: slip.refundReferenceId,
    };
  }

  /**
   * GET /api/dashboard/stats
   */
  public async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${this.baseUrl}/dashboard/stats`);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching dashboard stats`);
    const data = await res.json();
    return {
      totalTrains: data.totalTrains || 0,
      totalBookings: data.totalBookings || 0,
      availableSeats: data.availableSeats || 0,
      cancelledTickets: data.cancelledTickets || 0,
      activePassengers: 0,
      totalRevenue: typeof data.totalRevenue === 'number' ? data.totalRevenue : parseFloat(data.totalRevenue || '0'),
    };
  }
}

export const backendApiClient = new BackendApiClient();
