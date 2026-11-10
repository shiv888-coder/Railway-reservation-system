/**
 * @file SimulatedTrainGenerator.ts
 * Generates academic simulated train routes and connecting journeys across All-India stations.
 * Every synthetic service is strictly flagged with isSimulated: true and provenance: 'SIMULATED'.
 */

import { BaseTrain, TrainDetailsJSON, TrainFactory } from '../models/Train.ts';
import { ALL_INDIA_STATIONS } from '../data/railwayDatasets.ts';
import { CoachClass, ConnectingRoute, StationBoardEntry, StationData } from '../types/index.ts';

// Major railway junction transfer hubs across India
const MAJOR_TRANSFER_HUBS: string[] = [
  'HWH', 'SDAH', 'NDLS', 'CNB', 'DDU', 'ASN', 'BWN', 'GAYA', 'PRYJ', 'BZA', 'MAS', 'CSMT', 'NGP', 'BBS', 'PNBE'
];

/**
 * Generate a deterministic simulated train service between any two valid stations
 */
export function generateSimulatedTrain(
  sourceCode: string,
  destCode: string,
  _dateStr: string = '2026-11-15'
): BaseTrain | null {
  const src = ALL_INDIA_STATIONS.find(s => s.code.toUpperCase() === sourceCode.toUpperCase());
  const dest = ALL_INDIA_STATIONS.find(s => s.code.toUpperCase() === destCode.toUpperCase());

  if (!src || !dest || src.code === dest.code) {
    return null;
  }

  // Deterministic seed based on station codes
  const seed = (src.code.charCodeAt(0) * 31 + dest.code.charCodeAt(0) * 17) % 900 + 100;
  const trainNumber = `09${seed}`;

  // Estimate distance: default to plausible corridor distances
  let estDistance = 250;
  if (src.state === dest.state) {
    estDistance = 80 + (seed % 240);
  } else {
    estDistance = 350 + (seed % 1100);
  }

  // Determine service type based on distance
  let trainType: any = 'Superfast';
  let depHour = 6 + (seed % 14);
  let speedKmH = 65;

  if (estDistance < 90) {
    trainType = 'Local';
    speedKmH = 38;
  } else if (estDistance < 200) {
    trainType = 'Passenger';
    speedKmH = 45;
  } else if (estDistance > 1000) {
    trainType = 'Superfast';
    speedKmH = 75;
  }

  const durationMin = Math.round((estDistance / speedKmH) * 60) + 20;
  const arrTotalMin = (depHour * 60 + (seed % 45) + durationMin);
  const arrDay = 1 + Math.floor(arrTotalMin / (24 * 60));
  const arrHour = Math.floor((arrTotalMin % (24 * 60)) / 60);
  const arrMin = arrTotalMin % 60;

  const depTimeStr = `${String(depHour).padStart(2, '0')}:${String(seed % 45).padStart(2, '0')}`;
  const arrTimeStr = `${String(arrHour).padStart(2, '0')}:${String(arrMin).padStart(2, '0')}`;

  const durH = Math.floor(durationMin / 60);
  const durM = durationMin % 60;
  const durationStr = `${durH}h ${durM}m`;

  const classes: CoachClass[] = estDistance < 90
    ? ['2S']
    : estDistance < 200
    ? ['2S', 'CC']
    : ['1A', '2A', '3A', 'SL'];

  const baseFares: Record<string, number> = {
    '1A': Math.round(estDistance * 2.6 + 400),
    '2A': Math.round(estDistance * 1.6 + 250),
    '3A': Math.round(estDistance * 1.1 + 180),
    'SL': Math.round(estDistance * 0.42 + 90),
    'CC': Math.round(estDistance * 0.95 + 140),
    '2S': Math.max(30, Math.round(estDistance * 0.28 + 25)),
    'EC': Math.round(estDistance * 2.2 + 350),
  };

  const trainJSON: TrainDetailsJSON = {
    trainNumber,
    trainName: `${src.city || src.name} - ${dest.city || dest.name} Academic Express`,
    trainType,
    source: src.code,
    sourceStationName: src.name,
    destination: dest.code,
    destinationStationName: dest.name,
    departureTime: depTimeStr,
    arrivalTime: arrTimeStr,
    durationHours: durationStr,
    distanceKm: estDistance,
    daysOfOperation: ['Daily'],
    classesAvailable: classes,
    totalSeats: { '1A': 18, '2A': 54, '3A': 180, 'SL': 360, 'CC': 150, '2S': 400, 'EC': 0 },
    availableSeats: { '1A': 6, '2A': 18, '3A': 65, 'SL': 142, 'CC': 48, '2S': 160, 'EC': 0 },
    baseFares,
    halts: [
      {
        stationCode: src.code,
        stationName: src.name,
        arrivalTime: 'Start',
        departureTime: depTimeStr,
        haltMinutes: 0,
        distanceKm: 0,
        day: 1,
      },
      {
        stationCode: dest.code,
        stationName: dest.name,
        arrivalTime: arrTimeStr,
        departureTime: 'Ends',
        haltMinutes: 0,
        distanceKm: estDistance,
        day: arrDay,
      },
    ],
    amenities: ['Simulated Academic Schedule', 'Estimated Corridor Timetable', 'Computer Generated Route'],
    isSimulated: true,
    provenance: 'SIMULATED',
  };

  return TrainFactory.createTrain(trainJSON);
}

/**
 * Searches 1-hop connecting train routes via major junction hubs
 */
export function searchConnectingRoutes(
  sourceCode: string,
  destCode: string,
  _dateStr: string = '2026-11-15',
  trains: BaseTrain[]
): ConnectingRoute[] {
  const src = sourceCode.trim().toUpperCase();
  const dest = destCode.trim().toUpperCase();

  if (!src || !dest || src === dest) return [];

  const connecting: ConnectingRoute[] = [];

  for (const hubCode of MAJOR_TRANSFER_HUBS) {
    if (hubCode === src || hubCode === dest) continue;

    // Find Leg 1: src -> hubCode
    const leg1Trains = trains.filter(t => t.checkRouteService(src, hubCode).serves);
    if (leg1Trains.length === 0) continue;

    // Find Leg 2: hubCode -> dest
    const leg2Trains = trains.filter(t => t.checkRouteService(hubCode, dest).serves);
    if (leg2Trains.length === 0) continue;

    const t1 = leg1Trains[0];
    const t2 = leg2Trains[0];

    const h1 = t1.checkRouteService(src, hubCode);
    const h2 = t2.checkRouteService(hubCode, dest);

    const leg1Dep = h1.boardingHalt ? h1.boardingHalt.departureTime : t1.departureTime;
    const leg1Arr = h1.deboardingHalt ? h1.deboardingHalt.arrivalTime : t1.arrivalTime;

    const leg2Dep = h2.boardingHalt ? h2.boardingHalt.departureTime : t2.departureTime;
    const leg2Arr = h2.deboardingHalt ? h2.deboardingHalt.arrivalTime : t2.arrivalTime;

    const hubStation = ALL_INDIA_STATIONS.find(s => s.code === hubCode);

    const fare1 = t1.calculateFare(t1.classesAvailable[0] || 'SL', 1, 0).totalFare;
    const fare2 = t2.calculateFare(t2.classesAvailable[0] || 'SL', 1, 0).totalFare;

    connecting.push({
      transferStationCode: hubCode,
      transferStationName: hubStation ? hubStation.name : `${hubCode} Junction`,
      layoverTime: '1h 45m',
      totalDuration: '14h 30m',
      totalEstimatedFare: fare1 + fare2,
      leg1: {
        trainNumber: t1.trainNumber,
        trainName: t1.trainName,
        trainType: t1.trainType,
        originStationCode: src,
        destinationStationCode: hubCode,
        departureTime: leg1Dep,
        arrivalTime: leg1Arr,
        travelClass: t1.classesAvailable[0] || 'SL',
      },
      leg2: {
        trainNumber: t2.trainNumber,
        trainName: t2.trainName,
        trainType: t2.trainType,
        originStationCode: hubCode,
        destinationStationCode: dest,
        departureTime: leg2Dep,
        arrivalTime: leg2Arr,
        travelClass: t2.classesAvailable[0] || 'SL',
      },
    });

    if (connecting.length >= 3) break;
  }

  return connecting;
}

/**
 * Builds an authentic electronic station arrivals and departures board
 */
export function getStationBoardTimetable(
  stationCode: string,
  allTrains: BaseTrain[]
): StationBoardEntry[] {
  const code = stationCode.trim().toUpperCase();
  const entries: StationBoardEntry[] = [];

  for (const train of allTrains) {
    const halt = train.halts.find(h => h.stationCode === code);
    if (halt) {
      const isStart = halt.arrivalTime === 'Start' || train.source === code;
      const isEnd = halt.departureTime === 'Ends' || train.destination === code;

      entries.push({
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        trainType: train.trainType,
        sourceStationCode: train.source,
        destinationStationCode: train.destination,
        scheduledArrival: isStart ? 'Originating' : halt.arrivalTime,
        scheduledDeparture: isEnd ? 'Terminating' : halt.departureTime,
        platform: String((parseInt(train.trainNumber, 10) % 8) + 1),
        delayMinutes: 0,
        status: 'ON_TIME',
        isSimulated: train.isSimulated || false,
      });
    }
  }

  return entries;
}
