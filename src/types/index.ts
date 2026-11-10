export type CoachClass = '1A' | '2A' | '3A' | 'SL' | 'CC' | 'EC' | '2S';

export type ServiceScope = 'ALL' | 'OFFICIAL' | 'SIMULATED';

export type TrainProvenance = 'OFFICIAL' | 'SIMULATED';

export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'WAITLIST';

export type DataSourceType = 'LIVE' | 'SCHEDULE' | 'DEMO' | 'UNAVAILABLE';

export interface LiveRunningStatus {
  trainNumber: string;
  trainName: string;
  currentStationName: string;
  currentStationCode: string;
  status: 'ON_TIME' | 'DELAYED' | 'ARRIVED' | 'SCHEDULED' | 'UNAVAILABLE';
  delayMinutes: number;
  lastUpdated: string;
  nextHaltName?: string;
  nextHaltDeparture?: string;
  expectedPlatform?: string;
  sourceType: DataSourceType;
  message?: string;
  apiConfigured?: boolean;
  apiProvider?: string;
  errorCode?: 'MISSING_API_KEY' | 'INVALID_KEY' | 'TIMEOUT' | 'GATEWAY_ERROR' | 'MALFORMED_DATA' | 'NETWORK_ERROR' | 'NO_VERIFIED_PROVIDER';
}

export interface StationBoardEntry {
  trainNumber: string;
  trainName: string;
  trainType: string;
  sourceStationCode: string;
  destinationStationCode: string;
  scheduledArrival: string;
  scheduledDeparture: string;
  platform: string;
  delayMinutes: number;
  status: string;
  isSimulated: boolean;
}

export interface ConnectingRouteLeg {
  trainNumber: string;
  trainName: string;
  trainType: string;
  originStationCode: string;
  destinationStationCode: string;
  departureTime: string;
  arrivalTime: string;
  travelClass: CoachClass;
}

export interface ConnectingRoute {
  transferStationCode: string;
  transferStationName: string;
  layoverTime: string;
  totalDuration: string;
  totalEstimatedFare: number;
  leg1: ConnectingRouteLeg;
  leg2: ConnectingRouteLeg;
}

export type Gender = 'Male' | 'Female' | 'Transgender' | 'Other';

export type BerthPreference = 'Lower' | 'Middle' | 'Upper' | 'Side Lower' | 'Side Upper' | 'Window Seat' | 'No Preference';

export type IdProofType = 'Aadhaar Card' | 'PAN Card' | 'Passport' | 'Voter ID' | 'Driving License' | 'Student ID';

export interface StationData {
  code: string;
  name: string;
  city: string;
  state: string;
  zone: string;
  division?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  aliases?: string[];
}

export interface RouteHalt {
  stationCode: string;
  stationName: string;
  arrivalTime: string;
  departureTime: string;
  haltMinutes: number;
  distanceKm: number;
  day: number;
}

export interface ClassFareInfo {
  coachClass: CoachClass;
  className: string;
  baseFare: number;
  availableSeats: number;
  totalSeats: number;
}

export interface FareBreakdown {
  baseFare: number;
  reservationCharge: number;
  superfastCharge: number;
  cateringCharge: number;
  gst: number;
  seniorDiscount: number;
  totalFare: number;
}

export interface PassengerData {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email: string;
  idProofType: IdProofType;
  idProofNumber: string;
  berthPreference?: BerthPreference;
  allocatedSeat?: string;
  allocatedCoach?: string;
}

export interface SeatAllocation {
  passengerId: string;
  passengerName: string;
  coach: string;
  berthNumber: number;
  berthType: string;
}

export type TrainType =
  | 'Superfast'
  | 'Rajdhani'
  | 'Vande Bharat'
  | 'Mail Express'
  | 'Shatabdi'
  | 'Duronto'
  | 'Garib Rath'
  | 'Passenger'
  | 'Local'
  | 'MEMU'
  | 'DEMU'
  | 'Humsafar';

export interface ReservationData {
  bookingId: string; // 10-digit PNR
  trainNumber: string;
  trainName: string;
  trainType: TrainType;
  source: string;
  sourceStationName: string;
  destination: string;
  destinationStationName: string;
  journeyDate: string;
  departureTime: string;
  arrivalTime: string;
  travelClass: CoachClass;
  passengers: PassengerData[];
  seatAllocations: SeatAllocation[];
  fareBreakdown: FareBreakdown;
  bookingStatus: BookingStatus;
  bookedAt: string;
  cancellationDetails?: {
    cancelledAt: string;
    cancellationFee: number;
    refundAmount: number;
    reason: string;
    refundReferenceId: string;
  };
  isDemo?: boolean;
  isDemoRoute?: boolean;
  routeSourceType?: 'OFFICIAL' | 'SIMULATED';
}

export interface SearchFilterState {
  source: string;
  destination: string;
  journeyDate?: string;
  travelClass?: CoachClass | 'ALL';
  trainType?: string;
  serviceScope?: ServiceScope;
}

export interface DashboardStats {
  totalTrains: number;
  totalBookings: number;
  availableSeats: number;
  cancelledTickets: number;
  activePassengers: number;
  totalRevenue: number;
}
