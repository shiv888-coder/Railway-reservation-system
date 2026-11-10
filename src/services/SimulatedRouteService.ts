/**
 * @file SimulatedRouteService.ts
 * Reusable Academic Demo Route Generation Service
 * 
 * Generates deterministic, realistic simulated train routes when no official
 * timetable exists for a requested station pair.
 * 
 * STRICT COMPLIANCE:
 * - Every simulated train is clearly numbered (e.g. DEMO-001, DEMO-002, DEMO-003).
 * - Every simulated train is prominently marked:
 *   "SIMULATED ROUTE — NOT AN OFFICIAL TRAIN"
 * - Does NOT modify or corrupt any of the 24 official Indian Railway timetable records.
 * - Supports all 120 verified stations in both directions independently.
 */

import { VERIFIED_STATIONS } from '../data/railwayDatasets.ts';
import { CoachClass, RouteHalt, StationData, TrainType } from '../types/index.ts';
import { BaseTrain, TrainDetailsJSON, TrainFactory } from '../models/Train.ts';

// Known corridor distances (km) for authentic track distance approximation
const KNOWN_CORRIDOR_DISTANCES: Record<string, number> = {
  'HWH-RPH': 218,
  'RPH-HWH': 218,
  'SDAH-NH': 38,
  'NH-SDAH': 38,
  'HWH-NDLS': 1451,
  'NDLS-HWH': 1451,
  'SDAH-NJP': 567,
  'NJP-SDAH': 567,
  'HWH-NJP': 567,
  'NJP-HWH': 567,
  'CSMT-PUNE': 192,
  'PUNE-CSMT': 192,
  'MMCT-NDLS': 1386,
  'NDLS-MMCT': 1386,
  'MAS-SBC': 358,
  'SBC-MAS': 358,
  'MAS-NDLS': 2180,
  'NDLS-MAS': 2180,
  'HWH-MAS': 1661,
  'MAS-HWH': 1661,
  'HWH-YPR': 1944,
  'YPR-HWH': 1944,
  'SDAH-BKN': 1920,
  'BKN-SDAH': 1920,
  'NDLS-BSB': 757,
  'BSB-NDLS': 757,
  'NDLS-LKO': 512,
  'LKO-NDLS': 512,
  'NDLS-RKMP': 708,
  'RKMP-NDLS': 708,
};

// Deterministic string hash helper
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Format minutes to "HH:MM"
function formatTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export class SimulatedRouteService {
  private static instance: SimulatedRouteService;
  private simulatedTrainCache: Map<string, BaseTrain> = new Map();

  private constructor() {}

  public static getInstance(): SimulatedRouteService {
    if (!SimulatedRouteService.instance) {
      SimulatedRouteService.instance = new SimulatedRouteService();
    }
    return SimulatedRouteService.instance;
  }

  /**
   * Find station by code or name
   */
  public findStation(query: string): StationData | undefined {
    const q = query.trim().toUpperCase();
    return VERIFIED_STATIONS.find(
      s => s.code.toUpperCase() === q || s.name.toUpperCase() === q || s.city.toUpperCase() === q
    );
  }

  /**
   * Approximate track distance between any two stations
   */
  public estimateDistance(source: StationData, destination: StationData): number {
    const pairKey = `${source.code}-${destination.code}`;
    if (KNOWN_CORRIDOR_DISTANCES[pairKey]) {
      return KNOWN_CORRIDOR_DISTANCES[pairKey];
    }
    const reverseKey = `${destination.code}-${source.code}`;
    if (KNOWN_CORRIDOR_DISTANCES[reverseKey]) {
      return KNOWN_CORRIDOR_DISTANCES[reverseKey];
    }

    // Heuristic based on state and zone
    const isSameCity = source.city.toUpperCase() === destination.city.toUpperCase();
    if (isSameCity) return 35;

    const isSameDivision = source.division && destination.division && source.division === destination.division;
    if (isSameDivision) return 65;

    const isSameState = source.state.toUpperCase() === destination.state.toUpperCase();
    if (isSameState) {
      const seed = hashCode(`${source.code}:${destination.code}`) % 180;
      return 110 + seed; // 110 to 290 km
    }

    const isSameZone = source.zone.toUpperCase() === destination.zone.toUpperCase();
    if (isSameZone) {
      const seed = hashCode(`${source.code}:${destination.code}`) % 350;
      return 260 + seed; // 260 to 610 km
    }

    // Inter-zonal distance
    const seed = hashCode(`${source.code}:${destination.code}`) % 800;
    return 650 + seed; // 650 to 1450 km
  }

  /**
   * Select 1-3 appropriate intermediate halts from the station directory
   */
  private pickIntermediateHalts(source: StationData, destination: StationData, distanceKm: number): StationData[] {
    if (distanceKm < 60) return []; // Short suburban corridor, direct

    // Intermediate candidates in the same zone or state
    const candidates = VERIFIED_STATIONS.filter(s =>
      s.code !== source.code &&
      s.code !== destination.code &&
      (s.zone === source.zone || s.zone === destination.zone || s.state === source.state || s.state === destination.state)
    );

    if (candidates.length === 0) return [];

    const haltCount = distanceKm < 150 ? 1 : distanceKm < 400 ? 2 : distanceKm < 900 ? 3 : 4;
    const seed = hashCode(`${source.code}:${destination.code}`);
    const selected: StationData[] = [];

    // Deterministically pick stations without repeats
    for (let i = 0; i < haltCount; i++) {
      const idx = (seed + i * 7) % candidates.length;
      const candidate = candidates[idx];
      if (!selected.some(s => s.code === candidate.code)) {
        selected.push(candidate);
      }
    }

    return selected;
  }

  /**
   * Generate 2 to 3 simulated train suggestions for any valid station pair
   */
  public generateSuggestions(
    sourceCode: string,
    destCode: string,
    filters?: { travelClass?: CoachClass | 'ALL'; trainType?: string }
  ): BaseTrain[] {
    const src = this.findStation(sourceCode);
    const dst = this.findStation(destCode);

    if (!src || !dst || src.code === dst.code) {
      return [];
    }

    const distanceKm = this.estimateDistance(src, dst);
    const intermediateStations = this.pickIntermediateHalts(src, dst, distanceKm);

    // Deterministic seed for unique stable IDs
    const pairSeed = hashCode(`${src.code}-${dst.code}`);
    const demoNumber1 = `DEMO-${String((pairSeed % 900) + 100)}`;
    const demoNumber2 = `DEMO-${String(((pairSeed + 13) % 900) + 100)}`;
    const demoNumber3 = `DEMO-${String(((pairSeed + 47) % 900) + 100)}`;

    const rawTrains: TrainDetailsJSON[] = [];

    // -------------------------------------------------------------
    // SERVICE 1: Superfast Express (Simulated) - Morning Departure
    // -------------------------------------------------------------
    const avgSpeed1 = distanceKm > 500 ? 75 : 65; // km/h
    const durationMinutes1 = Math.round((distanceKm / avgSpeed1) * 60) + (intermediateStations.length * 5);
    const depMins1 = 390; // 06:30 AM
    const arrMins1 = depMins1 + durationMinutes1;
    const durHours1 = `${Math.floor(durationMinutes1 / 60)}h ${(durationMinutes1 % 60).toString().padStart(2, '0')}m`;

    const halts1: RouteHalt[] = [
      {
        stationCode: src.code,
        stationName: src.name,
        arrivalTime: 'Start',
        departureTime: formatTime(depMins1),
        haltMinutes: 0,
        distanceKm: 0,
        day: 1,
      },
    ];

    intermediateStations.forEach((haltStation, idx) => {
      const haltDist = Math.round((distanceKm / (intermediateStations.length + 1)) * (idx + 1));
      const haltArrivalMins = depMins1 + Math.round((haltDist / avgSpeed1) * 60);
      halts1.push({
        stationCode: haltStation.code,
        stationName: haltStation.name,
        arrivalTime: formatTime(haltArrivalMins),
        departureTime: formatTime(haltArrivalMins + 3),
        haltMinutes: 3,
        distanceKm: haltDist,
        day: haltArrivalMins >= 1440 ? 2 : 1,
      });
    });

    halts1.push({
      stationCode: dst.code,
      stationName: dst.name,
      arrivalTime: formatTime(arrMins1),
      departureTime: 'Ends',
      haltMinutes: 0,
      distanceKm: distanceKm,
      day: arrMins1 >= 1440 ? (arrMins1 >= 2880 ? 3 : 2) : 1,
    });

    rawTrains.push({
      trainNumber: demoNumber1,
      trainName: `DEMO: ${src.city || src.name} – ${dst.city || dst.name} Superfast (Simulated)`,
      trainType: 'Superfast',
      source: src.code,
      sourceStationName: src.name,
      destination: dst.code,
      destinationStationName: dst.name,
      departureTime: formatTime(depMins1),
      arrivalTime: formatTime(arrMins1),
      durationHours: durHours1,
      distanceKm,
      daysOfOperation: ['Daily'],
      classesAvailable: distanceKm < 450 ? ['CC', 'EC', '3A', 'SL'] : ['1A', '2A', '3A', 'SL'],
      totalSeats: { '1A': 24, '2A': 54, '3A': 180, 'SL': 320, 'CC': 140, 'EC': 45 },
      availableSeats: {
        '1A': 8,
        '2A': 18,
        '3A': 64,
        'SL': 110,
        'CC': 42,
        'EC': 12,
      },
      baseFares: {
        'SL': Math.max(140, Math.round(distanceKm * 0.42)),
        '3A': Math.max(480, Math.round(distanceKm * 1.15)),
        '2A': Math.max(720, Math.round(distanceKm * 1.70)),
        '1A': Math.max(1150, Math.round(distanceKm * 2.85)),
        'CC': Math.max(320, Math.round(distanceKm * 0.85)),
        'EC': Math.max(680, Math.round(distanceKm * 1.65)),
      },
      halts: halts1,
      amenities: [
        'Demonstration Route Service',
        'Simulated Timetable Only',
        'Academic Fare Tariff',
        'Standard Seating & Berths',
      ],
      isDemoRoute: true,
      routeSourceType: 'SIMULATED',
    });

    // -------------------------------------------------------------
    // SERVICE 2: Intercity / Mail Express (Simulated) - Afternoon
    // -------------------------------------------------------------
    const avgSpeed2 = 58; // km/h
    const durationMinutes2 = Math.round((distanceKm / avgSpeed2) * 60) + (intermediateStations.length * 6);
    const depMins2 = 885; // 02:45 PM
    const arrMins2 = depMins2 + durationMinutes2;
    const durHours2 = `${Math.floor(durationMinutes2 / 60)}h ${(durationMinutes2 % 60).toString().padStart(2, '0')}m`;

    const halts2: RouteHalt[] = [
      {
        stationCode: src.code,
        stationName: src.name,
        arrivalTime: 'Start',
        departureTime: formatTime(depMins2),
        haltMinutes: 0,
        distanceKm: 0,
        day: 1,
      },
    ];

    intermediateStations.forEach((haltStation, idx) => {
      const haltDist = Math.round((distanceKm / (intermediateStations.length + 1)) * (idx + 1));
      const haltArrivalMins = depMins2 + Math.round((haltDist / avgSpeed2) * 60);
      halts2.push({
        stationCode: haltStation.code,
        stationName: haltStation.name,
        arrivalTime: formatTime(haltArrivalMins),
        departureTime: formatTime(haltArrivalMins + 4),
        haltMinutes: 4,
        distanceKm: haltDist,
        day: haltArrivalMins >= 1440 ? 2 : 1,
      });
    });

    halts2.push({
      stationCode: dst.code,
      stationName: dst.name,
      arrivalTime: formatTime(arrMins2),
      departureTime: 'Ends',
      haltMinutes: 0,
      distanceKm: distanceKm,
      day: arrMins2 >= 1440 ? (arrMins2 >= 2880 ? 3 : 2) : 1,
    });

    rawTrains.push({
      trainNumber: demoNumber2,
      trainName: `DEMO: ${src.city || src.name} – ${dst.city || dst.name} Intercity Express (Simulated)`,
      trainType: 'Mail Express',
      source: src.code,
      sourceStationName: src.name,
      destination: dst.code,
      destinationStationName: dst.name,
      departureTime: formatTime(depMins2),
      arrivalTime: formatTime(arrMins2),
      durationHours: durHours2,
      distanceKm,
      daysOfOperation: ['Daily'],
      classesAvailable: ['2A', '3A', 'SL'],
      totalSeats: { '1A': 0, '2A': 48, '3A': 144, 'SL': 420, 'CC': 0, 'EC': 0 },
      availableSeats: {
        '1A': 0,
        '2A': 14,
        '3A': 48,
        'SL': 180,
        'CC': 0,
        'EC': 0,
      },
      baseFares: {
        'SL': Math.max(120, Math.round(distanceKm * 0.38)),
        '3A': Math.max(420, Math.round(distanceKm * 1.05)),
        '2A': Math.max(650, Math.round(distanceKm * 1.55)),
        '1A': 0,
        'CC': 0,
        'EC': 0,
      },
      halts: halts2,
      amenities: [
        'Demonstration Route Service',
        'Academic Demonstration Halts',
        'Simulated Timings Only',
      ],
      isDemoRoute: true,
      routeSourceType: 'SIMULATED',
    });

    // -------------------------------------------------------------
    // SERVICE 3: Night Express (Simulated) if distance > 200 km
    // -------------------------------------------------------------
    if (distanceKm >= 200) {
      const avgSpeed3 = 70; // km/h
      const durationMinutes3 = Math.round((distanceKm / avgSpeed3) * 60) + (intermediateStations.length * 4);
      const depMins3 = 1305; // 09:45 PM
      const arrMins3 = depMins3 + durationMinutes3;
      const durHours3 = `${Math.floor(durationMinutes3 / 60)}h ${(durationMinutes3 % 60).toString().padStart(2, '0')}m`;

      const halts3: RouteHalt[] = [
        {
          stationCode: src.code,
          stationName: src.name,
          arrivalTime: 'Start',
          departureTime: formatTime(depMins3),
          haltMinutes: 0,
          distanceKm: 0,
          day: 1,
        },
      ];

      intermediateStations.forEach((haltStation, idx) => {
        const haltDist = Math.round((distanceKm / (intermediateStations.length + 1)) * (idx + 1));
        const haltArrivalMins = depMins3 + Math.round((haltDist / avgSpeed3) * 60);
        halts3.push({
          stationCode: haltStation.code,
          stationName: haltStation.name,
          arrivalTime: formatTime(haltArrivalMins),
          departureTime: formatTime(haltArrivalMins + 3),
          haltMinutes: 3,
          distanceKm: haltDist,
          day: haltArrivalMins >= 1440 ? (haltArrivalMins >= 2880 ? 3 : 2) : 1,
        });
      });

      halts3.push({
        stationCode: dst.code,
        stationName: dst.name,
        arrivalTime: formatTime(arrMins3),
        departureTime: 'Ends',
        haltMinutes: 0,
        distanceKm: distanceKm,
        day: arrMins3 >= 1440 ? (arrMins3 >= 2880 ? 3 : 2) : 1,
      });

      rawTrains.push({
        trainNumber: demoNumber3,
        trainName: `DEMO: ${src.city || src.name} – ${dst.city || dst.name} Night Special (Simulated)`,
        trainType: 'Superfast',
        source: src.code,
        sourceStationName: src.name,
        destination: dst.code,
        destinationStationName: dst.name,
        departureTime: formatTime(depMins3),
        arrivalTime: formatTime(arrMins3),
        durationHours: durHours3,
        distanceKm,
        daysOfOperation: ['Daily'],
        classesAvailable: ['1A', '2A', '3A', 'SL'],
        totalSeats: { '1A': 24, '2A': 54, '3A': 180, 'SL': 320, 'CC': 0, 'EC': 0 },
        availableSeats: {
          '1A': 6,
          '2A': 22,
          '3A': 75,
          'SL': 130,
          'CC': 0,
          'EC': 0,
        },
        baseFares: {
          'SL': Math.max(145, Math.round(distanceKm * 0.44)),
          '3A': Math.max(490, Math.round(distanceKm * 1.18)),
          '2A': Math.max(730, Math.round(distanceKm * 1.75)),
          '1A': Math.max(1180, Math.round(distanceKm * 2.90)),
          'CC': 0,
          'EC': 0,
        },
        halts: halts3,
        amenities: [
          'Demonstration Route Service',
          'Academic Demonstration Timings',
          'Clean Bedroll (AC Classes)',
        ],
        isDemoRoute: true,
        routeSourceType: 'SIMULATED',
      });
    }

    // Instantiate as OOP BaseTrain subclasses and cache
    const instances: BaseTrain[] = rawTrains.map(raw => {
      const train = TrainFactory.createTrain(raw);
      this.simulatedTrainCache.set(train.trainNumber, train);
      return train;
    });

    // Apply class and type filters if specified
    return instances.filter(t => {
      if (filters?.travelClass && filters.travelClass !== 'ALL' && !t.classesAvailable.includes(filters.travelClass)) {
        return false;
      }
      if (filters?.trainType && filters.trainType !== 'ALL' && t.trainType !== filters.trainType) {
        return false;
      }
      return true;
    });
  }

  /**
   * Retrieve a cached simulated train by its demo train number (e.g. DEMO-101)
   */
  public getSimulatedTrainByNumber(trainNumber: string): BaseTrain | undefined {
    return this.simulatedTrainCache.get(trainNumber);
  }
}

export const simulatedRouteService = SimulatedRouteService.getInstance();
