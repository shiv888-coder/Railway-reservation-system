/**
 * @file Train.ts
 * OOP Concepts:
 * - Abstract Class & Interface Segregation
 * - Inheritance: Subclasses extending BaseTrain
 * - Polymorphism: Overridden calculateFare() method per train category
 * - Encapsulation: Protected inventory tracking with safe booking & cancellation methods
 */

import { CoachClass, FareBreakdown, RouteHalt, TrainType } from '../types/index.ts';

export interface TrainDetailsJSON {
  trainNumber: string;
  trainName: string;
  trainType: TrainType;
  source: string;
  sourceStationName: string;
  destination: string;
  destinationStationName: string;
  departureTime: string;
  arrivalTime: string;
  durationHours: string;
  distanceKm: number;
  daysOfOperation: string[];
  classesAvailable: CoachClass[];
  totalSeats: Partial<Record<CoachClass, number>>;
  availableSeats: Partial<Record<CoachClass, number>>;
  baseFares: Partial<Record<CoachClass, number>>;
  halts: RouteHalt[];
  amenities: string[];
  isSimulated?: boolean;
  isDemoRoute?: boolean;
  routeSourceType?: 'OFFICIAL' | 'SIMULATED';
  provenance?: 'OFFICIAL' | 'SIMULATED';
}

/**
 * Base Abstract Train Class (Abstraction & Inheritance Root)
 */
export abstract class BaseTrain {
  protected _trainNumber: string;
  protected _trainName: string;
  protected _trainType: TrainType;
  protected _source: string;
  protected _sourceStationName: string;
  protected _destination: string;
  protected _destinationStationName: string;
  protected _departureTime: string;
  protected _arrivalTime: string;
  protected _durationHours: string;
  protected _distanceKm: number;
  protected _daysOfOperation: string[];
  protected _classesAvailable: CoachClass[];
  protected _totalSeats: Partial<Record<CoachClass, number>>;
  protected _availableSeats: Partial<Record<CoachClass, number>>;
  protected _baseFares: Partial<Record<CoachClass, number>>;
  protected _halts: RouteHalt[];
  protected _amenities: string[];
  protected _isSimulated: boolean;
  protected _provenance: 'OFFICIAL' | 'SIMULATED';

  constructor(data: TrainDetailsJSON) {
    this._trainNumber = data.trainNumber;
    this._trainName = data.trainName;
    this._trainType = data.trainType;
    this._source = data.source;
    this._sourceStationName = data.sourceStationName;
    this._destination = data.destination;
    this._destinationStationName = data.destinationStationName;
    this._departureTime = data.departureTime;
    this._arrivalTime = data.arrivalTime;
    this._durationHours = data.durationHours;
    this._distanceKm = data.distanceKm;
    this._daysOfOperation = data.daysOfOperation;
    this._classesAvailable = data.classesAvailable;
    this._totalSeats = { ...data.totalSeats };
    this._availableSeats = { ...data.availableSeats };
    this._baseFares = { ...data.baseFares };
    this._halts = [...data.halts];
    this._amenities = [...data.amenities];
    this._isSimulated = Boolean(data.isSimulated);
    this._provenance = data.provenance || (data.isSimulated ? 'SIMULATED' : 'OFFICIAL');
  }

  // Getters for train properties (Encapsulation)
  public get trainNumber(): string { return this._trainNumber; }
  public get trainName(): string { return this._trainName; }
  public get trainType(): TrainType { return this._trainType; }
  public get source(): string { return this._source; }
  public get sourceStationName(): string { return this._sourceStationName; }
  public get destination(): string { return this._destination; }
  public get destinationStationName(): string { return this._destinationStationName; }
  public get departureTime(): string { return this._departureTime; }
  public get arrivalTime(): string { return this._arrivalTime; }
  public get durationHours(): string { return this._durationHours; }
  public get distanceKm(): number { return this._distanceKm; }
  public get daysOfOperation(): string[] { return [...this._daysOfOperation]; }
  public get classesAvailable(): CoachClass[] { return [...this._classesAvailable]; }
  public get totalSeats(): Partial<Record<CoachClass, number>> { return { ...this._totalSeats }; }
  public get availableSeats(): Partial<Record<CoachClass, number>> { return { ...this._availableSeats }; }
  public get baseFares(): Partial<Record<CoachClass, number>> { return { ...this._baseFares }; }
  public get halts(): RouteHalt[] { return [...this._halts]; }
  public get amenities(): string[] { return [...this._amenities]; }
  public get isSimulated(): boolean { return this._isSimulated; }
  public get provenance(): 'OFFICIAL' | 'SIMULATED' { return this._provenance; }

  /**
   * Check seat availability for a specific class
   */
  public getAvailableSeats(coachClass: CoachClass): number {
    return this._availableSeats[coachClass] || 0;
  }

  /**
   * Encapsulated method to reserve seats safely
   */
  public bookSeats(coachClass: CoachClass, count: number): boolean {
    const currentAvailable = this.getAvailableSeats(coachClass);
    if (currentAvailable < count) {
      return false;
    }
    this._availableSeats[coachClass] = currentAvailable - count;
    return true;
  }

  /**
   * Encapsulated method to return seats upon cancellation
   */
  public cancelSeats(coachClass: CoachClass, count: number): void {
    const current = this._availableSeats[coachClass] || 0;
    const maxCapacity = this._totalSeats[coachClass] || 100;
    this._availableSeats[coachClass] = Math.min(maxCapacity, current + count);
  }

  /**
   * Check if train runs on a specific day of week
   */
  public isOperatingOn(dayName: string): boolean {
    return this._daysOfOperation.includes('Daily') || this._daysOfOperation.includes(dayName);
  }

  /**
   * Route Serving Logic:
   * Evaluates if this train genuinely serves the route between sourceStationCode
   * and destStationCode, including intermediate halts where boarding stop sequence < deboarding stop sequence.
   */
  public checkRouteService(sourceCode?: string, destCode?: string): {
    serves: boolean;
    boardingHalt?: RouteHalt;
    deboardingHalt?: RouteHalt;
    segmentDistanceKm?: number;
    isIntermediateHop?: boolean;
  } {
    const s = sourceCode?.trim().toUpperCase();
    const d = destCode?.trim().toUpperCase();

    // If neither origin nor destination is specified, all trains match
    if (!s && !d) {
      return {
        serves: true,
        boardingHalt: this._halts[0],
        deboardingHalt: this._halts[this._halts.length - 1],
        segmentDistanceKm: this._distanceKm,
        isIntermediateHop: false,
      };
    }

    const halts = this._halts;
    if (!halts || halts.length === 0) {
      const sMatch = !s || this._source.toUpperCase() === s || this._sourceStationName.toUpperCase().includes(s);
      const dMatch = !d || this._destination.toUpperCase() === d || this._destinationStationName.toUpperCase().includes(d);
      return {
        serves: sMatch && dMatch,
        segmentDistanceKm: this._distanceKm,
        isIntermediateHop: false,
      };
    }

    // Both source and destination specified
    if (s && d) {
      const srcIdx = halts.findIndex(h => h.stationCode.toUpperCase() === s || h.stationName.toUpperCase().includes(s));
      const dstIdx = halts.findIndex(h => h.stationCode.toUpperCase() === d || h.stationName.toUpperCase().includes(d));

      if (srcIdx !== -1 && dstIdx !== -1 && srcIdx < dstIdx) {
        const boarding = halts[srcIdx];
        const deboarding = halts[dstIdx];
        const segDist = Math.max(0, deboarding.distanceKm - boarding.distanceKm) || this._distanceKm;
        const isInter = srcIdx > 0 || dstIdx < halts.length - 1;
        return {
          serves: true,
          boardingHalt: boarding,
          deboardingHalt: deboarding,
          segmentDistanceKm: segDist,
          isIntermediateHop: isInter,
        };
      }
      return { serves: false };
    }

    // Only source specified: station must appear on route before the terminus
    if (s) {
      const srcIdx = halts.findIndex(h => h.stationCode.toUpperCase() === s || h.stationName.toUpperCase().includes(s));
      if (srcIdx !== -1 && srcIdx < halts.length - 1) {
        const boarding = halts[srcIdx];
        const deboarding = halts[halts.length - 1];
        return {
          serves: true,
          boardingHalt: boarding,
          deboardingHalt: deboarding,
          segmentDistanceKm: Math.max(0, this._distanceKm - boarding.distanceKm) || this._distanceKm,
          isIntermediateHop: srcIdx > 0,
        };
      }
      return { serves: false };
    }

    // Only destination specified: station must appear on route after the origin
    if (d) {
      const dstIdx = halts.findIndex(h => h.stationCode.toUpperCase() === d || h.stationName.toUpperCase().includes(d));
      if (dstIdx !== -1 && dstIdx > 0) {
        const boarding = halts[0];
        const deboarding = halts[dstIdx];
        return {
          serves: true,
          boardingHalt: boarding,
          deboardingHalt: deboarding,
          segmentDistanceKm: deboarding.distanceKm || this._distanceKm,
          isIntermediateHop: dstIdx < halts.length - 1,
        };
      }
      return { serves: false };
    }

    return { serves: false };
  }

  /**
   * POLYMORPHIC ABSTRACT METHOD:
   * Every derived train class must implement its own fare calculation rules!
   */
  public abstract calculateFare(
    travelClass: CoachClass,
    passengersCount: number,
    seniorCount?: number
  ): FareBreakdown;

  /**
   * Serialize for Firestore/JSON persistence
   */
  public toJSON(): TrainDetailsJSON {
    return {
      trainNumber: this._trainNumber,
      trainName: this._trainName,
      trainType: this._trainType,
      source: this._source,
      sourceStationName: this._sourceStationName,
      destination: this._destination,
      destinationStationName: this._destinationStationName,
      departureTime: this._departureTime,
      arrivalTime: this._arrivalTime,
      durationHours: this._durationHours,
      distanceKm: this._distanceKm,
      daysOfOperation: this._daysOfOperation,
      classesAvailable: this._classesAvailable,
      totalSeats: this._totalSeats,
      availableSeats: this._availableSeats,
      baseFares: this._baseFares,
      halts: this._halts,
      amenities: this._amenities,
      isSimulated: this._isSimulated,
      provenance: this._provenance,
    };
  }
}

/**
 * Superfast Train Class (Inheritance & Polymorphism)
 * Adds Superfast Surcharge + Distance calculation + GST
 */
export class SuperfastTrain extends BaseTrain {
  constructor(data: TrainDetailsJSON) {
    super({ ...data, trainType: 'Superfast' });
  }

  public override calculateFare(
    travelClass: CoachClass,
    passengersCount: number,
    seniorCount: number = 0
  ): FareBreakdown {
    const perSeatBase = this._baseFares[travelClass] || 600;
    const baseTotal = perSeatBase * passengersCount;
    const reservationFee = travelClass === '1A' ? 60 : travelClass === '2A' ? 50 : travelClass === '3A' ? 40 : 20;
    const superfastCharge = 45 * passengersCount;
    const catering = 0; // optional on standard superfast
    const subtotal = baseTotal + (reservationFee * passengersCount) + superfastCharge;
    
    // Senior citizen discount (40% off base fare for seniors)
    const seniorDiscount = Math.round(perSeatBase * 0.4 * seniorCount);
    const taxableAmount = Math.max(0, subtotal - seniorDiscount);
    const gst = ['1A', '2A', '3A', 'CC', 'EC'].includes(travelClass) ? Math.round(taxableAmount * 0.05) : 0;
    const totalFare = taxableAmount + gst;

    return {
      baseFare: baseTotal,
      reservationCharge: reservationFee * passengersCount,
      superfastCharge,
      cateringCharge: catering,
      gst,
      seniorDiscount,
      totalFare,
    };
  }
}

/**
 * Rajdhani Express Train Class (Inheritance & Polymorphism)
 * Fully Air-Conditioned Premier Train with mandatory inclusive catering & dynamic pricing
 */
export class RajdhaniTrain extends BaseTrain {
  constructor(data: TrainDetailsJSON) {
    super({ ...data, trainType: 'Rajdhani' });
  }

  public override calculateFare(
    travelClass: CoachClass,
    passengersCount: number,
    seniorCount: number = 0
  ): FareBreakdown {
    const perSeatBase = this._baseFares[travelClass] || 1850;
    const baseTotal = perSeatBase * passengersCount;
    const reservationFee = travelClass === '1A' ? 60 : travelClass === '2A' ? 50 : 40;
    const superfastCharge = 75 * passengersCount;
    // Rajdhani trains provide complimentary premium meals (catering fee included)
    const cateringPerPassenger = travelClass === '1A' ? 420 : 340;
    const cateringCharge = cateringPerPassenger * passengersCount;

    const subtotal = baseTotal + (reservationFee * passengersCount) + superfastCharge + cateringCharge;
    const seniorDiscount = Math.round(perSeatBase * 0.25 * seniorCount);
    const taxableAmount = Math.max(0, subtotal - seniorDiscount);
    const gst = Math.round(taxableAmount * 0.05); // 5% GST on premier AC
    const totalFare = taxableAmount + gst;

    return {
      baseFare: baseTotal,
      reservationCharge: reservationFee * passengersCount,
      superfastCharge,
      cateringCharge,
      gst,
      seniorDiscount,
      totalFare,
    };
  }
}

/**
 * Vande Bharat Express Train Class (Inheritance & Polymorphism)
 * Next-Gen Semi-High-Speed Train with Chair Car (CC) and Executive Class (EC)
 */
export class VandeBharatTrain extends BaseTrain {
  constructor(data: TrainDetailsJSON) {
    super({ ...data, trainType: 'Vande Bharat' });
  }

  public override calculateFare(
    travelClass: CoachClass,
    passengersCount: number,
    seniorCount: number = 0
  ): FareBreakdown {
    const perSeatBase = this._baseFares[travelClass] || 1200;
    const baseTotal = perSeatBase * passengersCount;
    const reservationFee = travelClass === 'EC' ? 60 : 40;
    const superfastCharge = 65 * passengersCount; // High-speed corridor surcharge
    // Gourmet onboard dining service
    const cateringPerPassenger = travelClass === 'EC' ? 380 : 260;
    const cateringCharge = cateringPerPassenger * passengersCount;

    const subtotal = baseTotal + (reservationFee * passengersCount) + superfastCharge + cateringCharge;
    const seniorDiscount = Math.round(perSeatBase * 0.2 * seniorCount);
    const taxableAmount = Math.max(0, subtotal - seniorDiscount);
    const gst = Math.round(taxableAmount * 0.05);
    const totalFare = taxableAmount + gst;

    return {
      baseFare: baseTotal,
      reservationCharge: reservationFee * passengersCount,
      superfastCharge,
      cateringCharge,
      gst,
      seniorDiscount,
      totalFare,
    };
  }
}

/**
 * Mail / Express Train Class (Standard regular service)
 */
export class MailExpressTrain extends BaseTrain {
  constructor(data: TrainDetailsJSON) {
    super({ ...data, trainType: 'Mail Express' });
  }

  public override calculateFare(
    travelClass: CoachClass,
    passengersCount: number,
    seniorCount: number = 0
  ): FareBreakdown {
    const perSeatBase = this._baseFares[travelClass] || 400;
    const baseTotal = perSeatBase * passengersCount;
    const reservationFee = travelClass === '1A' ? 60 : travelClass === '2A' ? 50 : travelClass === '3A' ? 40 : 20;
    const superfastCharge = 0; // No superfast surcharge
    const cateringCharge = 0;

    const subtotal = baseTotal + (reservationFee * passengersCount);
    const seniorDiscount = Math.round(perSeatBase * 0.4 * seniorCount);
    const taxableAmount = Math.max(0, subtotal - seniorDiscount);
    const gst = ['1A', '2A', '3A', 'CC'].includes(travelClass) ? Math.round(taxableAmount * 0.05) : 0;
    const totalFare = taxableAmount + gst;

    return {
      baseFare: baseTotal,
      reservationCharge: reservationFee * passengersCount,
      superfastCharge,
      cateringCharge,
      gst,
      seniorDiscount,
      totalFare,
    };
  }
}

/**
 * Shatabdi Express Train Class (Inheritance & Polymorphism)
 * Daytime premium express connecting major metros with inclusive catering
 */
export class ShatabdiTrain extends BaseTrain {
  constructor(data: TrainDetailsJSON) {
    super({ ...data, trainType: 'Shatabdi' });
  }

  public override calculateFare(
    travelClass: CoachClass,
    passengersCount: number,
    seniorCount: number = 0
  ): FareBreakdown {
    const perSeatBase = this._baseFares[travelClass] || 1100;
    const baseTotal = perSeatBase * passengersCount;
    const reservationFee = travelClass === 'EC' ? 60 : 40;
    const superfastCharge = 55 * passengersCount;
    const cateringPerPassenger = travelClass === 'EC' ? 320 : 210;
    const cateringCharge = cateringPerPassenger * passengersCount;

    const subtotal = baseTotal + (reservationFee * passengersCount) + superfastCharge + cateringCharge;
    const seniorDiscount = Math.round(perSeatBase * 0.3 * seniorCount);
    const taxableAmount = Math.max(0, subtotal - seniorDiscount);
    const gst = Math.round(taxableAmount * 0.05);
    const totalFare = taxableAmount + gst;

    return {
      baseFare: baseTotal,
      reservationCharge: reservationFee * passengersCount,
      superfastCharge,
      cateringCharge,
      gst,
      seniorDiscount,
      totalFare,
    };
  }
}

/**
 * Duronto Express Train Class (Inheritance & Polymorphism)
 * Non-stop long distance point-to-point premier express
 */
export class DurontoTrain extends BaseTrain {
  constructor(data: TrainDetailsJSON) {
    super({ ...data, trainType: 'Duronto' });
  }

  public override calculateFare(
    travelClass: CoachClass,
    passengersCount: number,
    seniorCount: number = 0
  ): FareBreakdown {
    const perSeatBase = this._baseFares[travelClass] || 1600;
    const baseTotal = perSeatBase * passengersCount;
    const reservationFee = travelClass === '1A' ? 60 : travelClass === '2A' ? 50 : travelClass === '3A' ? 40 : 20;
    const superfastCharge = 65 * passengersCount;
    const cateringCharge = travelClass === 'SL' ? 0 : 280 * passengersCount;

    const subtotal = baseTotal + (reservationFee * passengersCount) + superfastCharge + cateringCharge;
    const seniorDiscount = Math.round(perSeatBase * 0.25 * seniorCount);
    const taxableAmount = Math.max(0, subtotal - seniorDiscount);
    const gst = travelClass === 'SL' ? 0 : Math.round(taxableAmount * 0.05);
    const totalFare = taxableAmount + gst;

    return {
      baseFare: baseTotal,
      reservationCharge: reservationFee * passengersCount,
      superfastCharge,
      cateringCharge,
      gst,
      seniorDiscount,
      totalFare,
    };
  }
}

/**
 * Garib Rath Express Train Class (Inheritance & Polymorphism)
 * Economical fully air-conditioned express with subsidized tariff
 */
export class GaribRathTrain extends BaseTrain {
  constructor(data: TrainDetailsJSON) {
    super({ ...data, trainType: 'Garib Rath' });
  }

  public override calculateFare(
    travelClass: CoachClass,
    passengersCount: number,
    seniorCount: number = 0
  ): FareBreakdown {
    const perSeatBase = this._baseFares[travelClass] || 850;
    const baseTotal = perSeatBase * passengersCount;
    const reservationFee = 30 * passengersCount;
    const superfastCharge = 35 * passengersCount;
    const cateringCharge = 0; // Optional bedroll / food on demand

    const subtotal = baseTotal + reservationFee + superfastCharge;
    const seniorDiscount = Math.round(perSeatBase * 0.2 * seniorCount);
    const taxableAmount = Math.max(0, subtotal - seniorDiscount);
    const gst = Math.round(taxableAmount * 0.05);
    const totalFare = taxableAmount + gst;

    return {
      baseFare: baseTotal,
      reservationCharge: reservationFee,
      superfastCharge,
      cateringCharge,
      gst,
      seniorDiscount,
      totalFare,
    };
  }
}

/**
 * Factory Pattern for OOP Train Instantiation
 */
export class TrainFactory {
  public static createTrain(data: TrainDetailsJSON): BaseTrain {
    switch (data.trainType) {
      case 'Rajdhani':
        return new RajdhaniTrain(data);
      case 'Vande Bharat':
        return new VandeBharatTrain(data);
      case 'Shatabdi':
        return new ShatabdiTrain(data);
      case 'Duronto':
        return new DurontoTrain(data);
      case 'Garib Rath':
        return new GaribRathTrain(data);
      case 'Superfast':
        return new SuperfastTrain(data);
      case 'Mail Express':
      default:
        return new MailExpressTrain(data);
    }
  }
}
