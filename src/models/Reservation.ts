/**
 * @file Reservation.ts
 * OOP Class representing a Railway Ticket Reservation
 * Encapsulates passenger party, seat allocations, fare breakdown, and booking state
 */

import {
  BookingStatus,
  CoachClass,
  FareBreakdown,
  PassengerData,
  ReservationData,
  SeatAllocation,
  TrainType,
} from '../types/index.ts';
import { Passenger } from './Passenger.ts';
import { CancellationSlip } from './CancellationSlip.ts';

export class TicketReservation {
  private _bookingId: string; // 10-digit PNR
  private _trainNumber: string;
  private _trainName: string;
  private _trainType: TrainType;
  private _source: string;
  private _sourceStationName: string;
  private _destination: string;
  private _destinationStationName: string;
  private _journeyDate: string;
  private _departureTime: string;
  private _arrivalTime: string;
  private _travelClass: CoachClass;
  private _passengers: Passenger[];
  private _seatAllocations: SeatAllocation[];
  private _fareBreakdown: FareBreakdown;
  private _bookingStatus: BookingStatus;
  private _bookedAt: string;
  private _cancellationDetails?: {
    cancelledAt: string;
    cancellationFee: number;
    refundAmount: number;
    reason: string;
    refundReferenceId: string;
  };
  private _isDemo: boolean;

  constructor(data: ReservationData) {
    this._bookingId = data.bookingId;
    this._trainNumber = data.trainNumber;
    this._trainName = data.trainName;
    this._trainType = data.trainType;
    this._source = data.source;
    this._sourceStationName = data.sourceStationName;
    this._destination = data.destination;
    this._destinationStationName = data.destinationStationName;
    this._journeyDate = data.journeyDate;
    this._departureTime = data.departureTime;
    this._arrivalTime = data.arrivalTime;
    this._travelClass = data.travelClass;
    this._passengers = data.passengers.map(p =>
      p instanceof Passenger ? p : Passenger.fromFirestoreData(p)
    );
    this._seatAllocations = [...data.seatAllocations];
    this._fareBreakdown = { ...data.fareBreakdown };
    this._bookingStatus = data.bookingStatus;
    this._bookedAt = data.bookedAt || new Date().toISOString();
    this._cancellationDetails = data.cancellationDetails;
    this._isDemo = data.isDemo ?? false;
  }

  // Getters
  public get bookingId(): string { return this._bookingId; }
  public get trainNumber(): string { return this._trainNumber; }
  public get trainName(): string { return this._trainName; }
  public get trainType(): TrainType { return this._trainType; }
  public get source(): string { return this._source; }
  public get sourceStationName(): string { return this._sourceStationName; }
  public get destination(): string { return this._destination; }
  public get destinationStationName(): string { return this._destinationStationName; }
  public get journeyDate(): string { return this._journeyDate; }
  public get departureTime(): string { return this._departureTime; }
  public get arrivalTime(): string { return this._arrivalTime; }
  public get travelClass(): CoachClass { return this._travelClass; }
  public get passengers(): Passenger[] { return [...this._passengers]; }
  public get seatAllocations(): SeatAllocation[] { return [...this._seatAllocations]; }
  public get fareBreakdown(): FareBreakdown { return { ...this._fareBreakdown }; }
  public get bookingStatus(): BookingStatus { return this._bookingStatus; }
  public get bookedAt(): string { return this._bookedAt; }
  public get cancellationDetails() { return this._cancellationDetails; }
  public get isDemo(): boolean { return this._isDemo; }

  /**
   * Helper: Formats 10-digit PNR into standard 3-7 layout (e.g., 284-9182374)
   */
  public getFormattedPNR(): string {
    if (this._bookingId.length === 10) {
      return `${this._bookingId.slice(0, 3)}-${this._bookingId.slice(3)}`;
    }
    return this._bookingId;
  }

  public isConfirmed(): boolean {
    return this._bookingStatus === 'CONFIRMED';
  }

  public isCancelled(): boolean {
    return this._bookingStatus === 'CANCELLED';
  }

  /**
   * Encapsulated cancel method with audit trail and refund generation
   */
  public cancel(reason: string = 'Passenger voluntary cancellation'): CancellationSlip {
    if (this._bookingStatus === 'CANCELLED') {
      throw new Error(`Reservation ${this._bookingId} is already cancelled.`);
    }

    const slip = new CancellationSlip(this._bookingId, this._fareBreakdown.totalFare, reason);
    this._bookingStatus = 'CANCELLED';
    this._cancellationDetails = {
      cancelledAt: slip.cancelledAt,
      cancellationFee: slip.cancellationFee,
      refundAmount: slip.refundAmount,
      reason: slip.reason,
      refundReferenceId: slip.refundReferenceId,
    };

    return slip;
  }

  /**
   * Serialization to standard plain object / Firestore document
   */
  public toFirestoreData(): ReservationData {
    return {
      bookingId: this._bookingId,
      trainNumber: this._trainNumber,
      trainName: this._trainName,
      trainType: this._trainType,
      source: this._source,
      sourceStationName: this._sourceStationName,
      destination: this._destination,
      destinationStationName: this._destinationStationName,
      journeyDate: this._journeyDate,
      departureTime: this._departureTime,
      arrivalTime: this._arrivalTime,
      travelClass: this._travelClass,
      passengers: this._passengers.map(p => p.toFirestoreData()),
      seatAllocations: this._seatAllocations,
      fareBreakdown: this._fareBreakdown,
      bookingStatus: this._bookingStatus,
      bookedAt: this._bookedAt,
      cancellationDetails: this._cancellationDetails,
      isDemo: this._isDemo,
    };
  }
}
