import React, { useState } from 'react';
import {
  Search,
  ArrowRightLeft,
  Calendar,
  Train,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Database,
  ArrowRight,
  RotateCcw,
  Activity,
  RefreshCw,
  X,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { railwayService } from '../../services/RailwayDataService.ts';
import { CoachClass, LiveRunningStatus, SearchFilterState, StationData } from '../../types/index.ts';
import { BaseTrain } from '../../models/Train.ts';
import { StationAutocompleteInput } from './StationAutocompleteInput.tsx';

interface SearchTrainsPageProps {
  onSelectTrainForDetails: (trainNumber: string) => void;
  onBookTrain: (trainNumber: string, travelClass?: CoachClass) => void;
  initialSource?: string;
  initialDestination?: string;
}

const POPULAR_ROUTES = [
  { from: 'HWH', to: 'NDLS', label: 'Howrah → New Delhi' },
  { from: 'NDLS', to: 'HWH', label: 'New Delhi → Howrah' },
  { from: 'CSMT', to: 'NDLS', label: 'Mumbai → New Delhi' },
  { from: 'NDLS', to: 'BSB', label: 'New Delhi → Varanasi' },
  { from: 'NDLS', to: 'LKO', label: 'New Delhi → Lucknow' },
  { from: 'NDLS', to: 'RKMP', label: 'New Delhi → Bhopal' },
  { from: 'MAS', to: 'MYS', label: 'Chennai → Mysuru' },
  { from: 'MAS', to: 'NDLS', label: 'Chennai → New Delhi' },
  { from: 'HWH', to: 'YPR', label: 'Howrah → Bengaluru' },
  { from: 'HWH', to: 'NJP', label: 'Howrah → New Jalpaiguri' },
  { from: 'SDAH', to: 'RPH', label: 'Sealdah → Rampurhat' },
  { from: 'SDAH', to: 'NH', label: 'Sealdah → Naihati' },
  { from: 'CSMT', to: 'MAO', label: 'Mumbai → Goa (Madgaon)' },
  { from: 'CSMT', to: 'ADI', label: 'Mumbai → Ahmedabad' },
  { from: 'BDTS', to: 'NZM', label: 'Bandra → Nizamuddin' },
  { from: 'PNBE', to: 'NDLS', label: 'Patna → New Delhi' },
  { from: 'SBC', to: 'PNBE', label: 'Bengaluru → Patna' },
];

export const SearchTrainsPage: React.FC<SearchTrainsPageProps> = ({
  onSelectTrainForDetails,
  onBookTrain,
  initialSource = '',
  initialDestination = '',
}) => {
  const stations: StationData[] = railwayService.getStations();
  const isOnline = railwayService.isBackendOnline;

  const [source, setSource] = useState(initialSource);
  const [destination, setDestination] = useState(initialDestination);
  const [journeyDate, setJourneyDate] = useState('2026-11-15');
  const [selectedClass, setSelectedClass] = useState<CoachClass | 'ALL'>('ALL');
  const [selectedTrainType, setSelectedTrainType] = useState<string>('ALL');

  // Live Running Status Modal State
  const [activeStatusTrain, setActiveStatusTrain] = useState<BaseTrain | null>(null);
  const [liveStatusData, setLiveStatusData] = useState<LiveRunningStatus | null>(null);
  const [isLoadingLiveStatus, setIsLoadingLiveStatus] = useState<boolean>(false);

  // Same station validation
  const isSameStation = Boolean(
    source &&
    destination &&
    source.trim().toUpperCase() === destination.trim().toUpperCase()
  );

  // Search Results
  const [searchResults, setSearchResults] = useState<BaseTrain[]>(() => {
    return railwayService.searchTrains({
      source: initialSource,
      destination: initialDestination,
      journeyDate: '2026-11-15',
      travelClass: 'ALL',
      trainType: 'ALL',
    });
  });

  const handleSwapStations = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
    // If both stations exist and aren't same, auto-execute search with swapped values
    if (temp && destination && temp.toUpperCase() !== destination.toUpperCase()) {
      const filter: SearchFilterState = {
        source: destination,
        destination: temp,
        journeyDate,
        travelClass: selectedClass,
        trainType: selectedTrainType,
      };
      setSearchResults(railwayService.searchTrains(filter));
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSameStation) return;

    const filter: SearchFilterState = {
      source,
      destination,
      journeyDate,
      travelClass: selectedClass,
      trainType: selectedTrainType,
    };
    const results = railwayService.searchTrains(filter);
    setSearchResults(results);
  };

  const handleApplyPreset = (from: string, to: string) => {
    setSource(from);
    setDestination(to);
    const filter: SearchFilterState = {
      source: from,
      destination: to,
      journeyDate,
      travelClass: selectedClass,
      trainType: selectedTrainType,
    };
    setSearchResults(railwayService.searchTrains(filter));
  };

  const handleResetFilters = () => {
    setSource('');
    setDestination('');
    setSelectedClass('ALL');
    setSelectedTrainType('ALL');
    setSearchResults(railwayService.getAllTrains());
  };

  // Live running status fetch handler
  const handleOpenLiveStatus = async (train: BaseTrain) => {
    setActiveStatusTrain(train);
    setIsLoadingLiveStatus(true);
    setLiveStatusData(null);
    try {
      const status = await railwayService.getLiveRunningStatus(train.trainNumber);
      setLiveStatusData(status);
    } catch {
      setLiveStatusData({
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        currentStationName: 'Not Available',
        currentStationCode: 'N/A',
        status: 'SCHEDULED',
        delayMinutes: 0,
        lastUpdated: new Date().toLocaleTimeString(),
        sourceType: 'UNAVAILABLE',
        message: 'Unable to retrieve running status. Please check your network or try again.',
      });
    } finally {
      setIsLoadingLiveStatus(false);
    }
  };

  const handleRefreshLiveStatus = async () => {
    if (!activeStatusTrain) return;
    setIsLoadingLiveStatus(true);
    try {
      const status = await railwayService.getLiveRunningStatus(activeStatusTrain.trainNumber);
      setLiveStatusData(status);
    } catch {
      // Keep existing data or show error
    } finally {
      setIsLoadingLiveStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Filter Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Search Train Schedules & Seats</h2>
            <p className="text-xs text-slate-500">
              Type station name or code to search direct routes and intermediate corridor halts
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              SCHEDULE DATA: Authentic IR Timetable
            </span>
            {isOnline ? (
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-600" />
                <span>MySQL Connected</span>
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-amber-900 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                <span>DEMO DATA: Simulated Inventory</span>
              </span>
            )}
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            {/* Origin Station Autocomplete Input */}
            <div className="md:col-span-4">
              <StationAutocompleteInput
                id="search-source-station"
                label="From (Origin Station)"
                value={source}
                onChange={code => setSource(code)}
                stations={stations}
                placeholder="Type station name or code (e.g. NDLS, Delhi, HWH)..."
                icon={<MapPin className="w-3.5 h-3.5 text-blue-900" />}
                error={isSameStation ? 'Origin matches Destination' : null}
              />
            </div>

            {/* Station Swap Button */}
            <div className="md:col-span-1 flex items-center justify-center pb-0.5">
              <button
                type="button"
                onClick={handleSwapStations}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-900 transition-colors cursor-pointer"
                title="Swap origin and destination stations"
                aria-label="Swap origin and destination"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Destination Station Autocomplete Input */}
            <div className="md:col-span-4">
              <StationAutocompleteInput
                id="search-dest-station"
                label="To (Destination Station)"
                value={destination}
                onChange={code => setDestination(code)}
                stations={stations}
                placeholder="Type destination code or city (e.g. CNB, Mumbai, MAS)..."
                icon={<MapPin className="w-3.5 h-3.5 text-emerald-800" />}
                error={isSameStation ? 'Destination matches Origin' : null}
              />
            </div>

            {/* Journey Date */}
            <div className="md:col-span-3 space-y-1">
              <label htmlFor="search-journey-date" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Journey Date</span>
              </label>
              <input
                id="search-journey-date"
                type="date"
                value={journeyDate}
                onChange={e => setJourneyDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-medium"
              />
            </div>
          </div>

          {/* Same Station Error Banner */}
          {isSameStation && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>Invalid Route:</strong> Origin and Destination stations cannot be identical (<strong>{source}</strong> to <strong>{destination}</strong>). Please select two different railway stations to view schedules.
              </span>
            </div>
          )}

          {/* Secondary Filters & Search Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              {/* Class Filter */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-500 font-medium mr-1">Class:</span>
                {(['ALL', '1A', '2A', '3A', 'SL', 'CC', 'EC'] as const).map(cls => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedClass(cls)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      selectedClass === cls
                        ? 'bg-blue-900 text-white font-semibold shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>

              {/* Train Type */}
              <div className="flex items-center gap-1 text-xs overflow-x-auto pb-1 max-w-full">
                <span className="text-slate-500 font-medium mr-1 shrink-0">Type:</span>
                {(['ALL', 'Rajdhani', 'Vande Bharat', 'Shatabdi', 'Duronto', 'Garib Rath', 'Superfast', 'Mail Express'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedTrainType(type)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                      selectedTrainType === type
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(source || destination || selectedClass !== 'ALL' || selectedTrainType !== 'ALL') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}

              <button
                type="submit"
                disabled={isSameStation}
                className={`flex items-center gap-2 px-5 py-2 font-semibold text-xs rounded-lg shadow-sm transition-all ${
                  isSameStation
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-900 hover:bg-blue-800 text-white cursor-pointer active:scale-98'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Search Trains</span>
              </button>
            </div>
          </div>
        </form>

        {/* Popular Route Presets */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Popular Corridors:</span>
          </span>
          {POPULAR_ROUTES.map(r => (
            <button
              key={r.label}
              type="button"
              onClick={() => handleApplyPreset(r.from, r.to)}
              className="px-2.5 py-1 rounded bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-200 transition-colors text-[11px] cursor-pointer"
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Academic Safety Notice Banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-950 shadow-xs flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-blue-950">Academic Reservation System Notice: </span>
            <span>
              This is a B.Tech CSE Java OOP laboratory project. Train schedules, station codes, and intermediate halt sequences are grounded in <strong>authentic Indian Railways published timetables</strong>. Seat inventory, fare estimation, and ticket booking operate as an <strong>academic simulation</strong>. No real financial transactions or official IRCTC bookings are generated.
            </span>
          </div>
        </div>
        <span className="shrink-0 text-[10px] font-bold text-blue-900 bg-blue-200/60 px-2 py-0.5 rounded border border-blue-300">
          ACADEMIC PROJECT
        </span>
      </div>

      {/* Results Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-slate-600">
          Showing <strong className="text-slate-900">{searchResults.length}</strong> matching train service{searchResults.length === 1 ? '' : 's'}
          {source && destination && (
            <span> for route <strong>{source}</strong> <ArrowRight className="inline w-3 h-3 text-slate-400 mx-0.5" /> <strong>{destination}</strong></span>
          )}
          {source && !destination && <span> departing from <strong>{source}</strong></span>}
          {!source && destination && <span> arriving at <strong>{destination}</strong></span>}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Timetable: Official Schedule</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Seats: Demo Simulation</span>
          </span>
        </div>
      </div>

      {/* Train Cards List */}
      <div className="space-y-4">
        {searchResults.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
            <Train className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No Direct or Intermediate Trains Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {source && destination
                ? `No scheduled train operates from ${source} to ${destination} in this travel direction. If you are traveling in the return direction, try swapping stations.`
                : 'No train matches your current station or class filter. Try clearing filters to inspect all corridor services.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {source && destination && (
                <button
                  type="button"
                  onClick={handleSwapStations}
                  className="px-4 py-2 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Try Reverse Route ({destination} → {source})</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-medium hover:bg-blue-800 transition-colors cursor-pointer"
              >
                Show All Available Trains ({railwayService.getAllTrains().length})
              </button>
            </div>
          </div>
        ) : (
          searchResults.map(train => {
            // Check specific route serving details for this train
            const routeService = train.checkRouteService(source, destination);
            const boardingHalt = routeService.boardingHalt;
            const deboardingHalt = routeService.deboardingHalt;
            const isHop = routeService.isIntermediateHop;

            // Determine departure time and arrival time based on searched stops
            const displayDepTime = boardingHalt ? boardingHalt.departureTime : train.departureTime;
            const displayDepStation = boardingHalt ? `${boardingHalt.stationName} (${boardingHalt.stationCode})` : `${train.sourceStationName} (${train.source})`;
            const displayArrTime = deboardingHalt ? deboardingHalt.arrivalTime : train.arrivalTime;
            const displayArrStation = deboardingHalt ? `${deboardingHalt.stationName} (${deboardingHalt.stationCode})` : `${train.destinationStationName} (${train.destination})`;
            const displayDistance = routeService.segmentDistanceKm || train.distanceKm;

            return (
              <div
                key={train.trainNumber}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-200 hover:shadow-sm transition-all space-y-4"
              >
                {/* Card Header: Train Info & Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-bold px-2 py-0.5 bg-blue-950 text-white rounded">
                      {train.trainNumber}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>{train.trainName}</span>
                        {isHop && (
                          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                            Intermediate Stop Service
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-blue-900 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                          SCHEDULE DATA
                        </span>
                      </h3>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <span>Runs: {train.daysOfOperation.join(', ')}</span>
                        <span>·</span>
                        <span>Full Corridor: {train.distanceKm} km</span>
                        <span>·</span>
                        <span className="text-slate-400">{train.source} → {train.destination}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenLiveStatus(train)}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Check live running status and delays"
                    >
                      <Activity className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Live Status</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectTrainForDetails(train.trainNumber)}
                      className="text-xs text-blue-900 font-semibold hover:underline cursor-pointer px-2 py-1"
                    >
                      Timetable & All Halts
                    </button>

                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        train.trainType === 'Vande Bharat'
                          ? 'bg-amber-50 text-amber-900 border border-amber-200'
                          : train.trainType === 'Rajdhani'
                          ? 'bg-blue-50 text-blue-900 border border-blue-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {train.trainType}
                    </span>
                  </div>
                </div>

                {/* Journey Time & Stations Bar (Dynamic to Searched Route) */}
                <div className="py-2 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  {/* Departure */}
                  <div>
                    <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                      {displayDepTime}
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {displayDepStation}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {boardingHalt ? 'Boarding Halt Departure' : 'Scheduled Origin Departure'}
                    </div>
                  </div>

                  {/* Duration & Route Segment Line */}
                  <div className="text-center px-2">
                    <div className="text-xs font-medium text-slate-600 flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{train.durationHours}</span>
                      <span className="text-slate-400">({displayDistance} km)</span>
                    </div>
                    <div className="relative my-2">
                      <div className="border-t-2 border-dashed border-slate-300 w-full" />
                      <Train className="w-4 h-4 text-blue-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-0.5" />
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {train.halts.length} Scheduled Halts Across Corridor
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="sm:text-right">
                    <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                      {displayArrTime}
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {displayArrStation}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {deboardingHalt ? 'Deboarding Halt Arrival' : 'Scheduled Destination Arrival'}
                    </div>
                  </div>
                </div>

                {/* Coach Classes & Availability Matrix */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex flex-wrap items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span>Class Fares & Seat Availability:</span>
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                        DEMO DATA
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 normal-case">Includes Reservation & Superfast charges</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {train.classesAvailable.map(cls => {
                      const available = train.getAvailableSeats(cls);
                      const breakdown = train.calculateFare(cls, 1, 0);

                      return (
                        <div
                          key={cls}
                          className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-900">{cls}</span>
                              <span className="font-mono font-bold text-blue-950 tabular-nums">
                                ₹{breakdown.totalFare}
                              </span>
                            </div>

                            <div className="mt-1 flex items-center gap-1 text-[11px]">
                              {available > 20 ? (
                                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                  AVL {available}
                                </span>
                              ) : available > 0 ? (
                                <span className="text-amber-700 font-semibold flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                                  Few {available}
                                </span>
                              ) : (
                                <span className="text-rose-600 font-semibold">WL / Regret</span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onBookTrain(train.trainNumber, cls)}
                            className="mt-2.5 w-full py-1 text-[11px] font-semibold bg-blue-900 hover:bg-blue-800 text-white rounded transition-colors cursor-pointer text-center"
                          >
                            Book {cls}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Live Running Status Enquiry Modal */}
      {activeStatusTrain && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in-50 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <span>{activeStatusTrain.trainName}</span>
                    <span className="font-mono text-xs bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded">
                      {activeStatusTrain.trainNumber}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Route: {activeStatusTrain.sourceStationName} ({activeStatusTrain.source}) → {activeStatusTrain.destinationStationName} ({activeStatusTrain.destination})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveStatusTrain(null);
                  setLiveStatusData(null);
                }}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close live status dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {isLoadingLiveStatus ? (
                <div className="py-8 text-center space-y-2">
                  <RefreshCw className="w-6 h-6 text-blue-900 animate-spin mx-auto" />
                  <p className="text-xs text-slate-600 font-medium">Checking train status and timetable data...</p>
                </div>
              ) : liveStatusData ? (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className="flex flex-wrap items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Live GPS Enquiry:</span>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                        {liveStatusData.sourceType === 'LIVE' ? (
                          liveStatusData.status === 'ON_TIME' ? (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Right Time (On Schedule)
                            </span>
                          ) : (
                            <span className="text-amber-700 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              Delayed by {liveStatusData.delayMinutes} mins
                            </span>
                          )
                        ) : (
                          <span className="text-rose-700 flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-rose-600" />
                            <span>Live GPS Unavailable ({liveStatusData.errorCode || 'NOT_CONNECTED'})</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Data Provenance Badge */}
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Data Provenance:</span>
                      <div className="mt-0.5">
                        {liveStatusData.sourceType === 'LIVE' ? (
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                            LIVE DATA
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                            UNAVAILABLE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Diagnostic / Error Notice Box */}
                  {liveStatusData.sourceType === 'UNAVAILABLE' && (
                    <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-lg text-xs text-rose-950 space-y-2">
                      <div className="flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-rose-950">
                            Live Railway API Connection Not Active
                          </p>
                          <p className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
                            {liveStatusData.message}
                          </p>
                        </div>
                      </div>

                      {liveStatusData.errorCode === 'MISSING_API_KEY' && (
                        <div className="bg-white/80 p-2.5 rounded border border-rose-200 text-[11px] text-slate-700 space-y-1">
                          <p className="font-semibold text-slate-900">How to configure genuine live running API:</p>
                          <ol className="list-decimal list-inside space-y-0.5 text-slate-600">
                            <li>Register on a genuine Indian Railways API gateway (e.g. RapidAPI Indian Railways or RailYatri API).</li>
                            <li>Obtain your API Key from the provider dashboard.</li>
                            <li>Set <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-900 font-semibold">RAILWAY_API_KEY=&quot;your_key&quot;</code> in your backend environment / <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">.env</code> file.</li>
                          </ol>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Authentic Published Timetable Section (Always Available) */}
                  <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-lg space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-800" />
                        <span>Official Published Timetable (Indian Railways)</span>
                      </span>
                      <span className="text-[10px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                        SCHEDULE DATA
                      </span>
                    </div>

                    <div className="max-h-40 overflow-y-auto rounded border border-blue-100 bg-white divide-y divide-slate-100 text-[11px]">
                      {activeStatusTrain.halts.map((halt, idx) => (
                        <div key={halt.stationCode + idx} className="p-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 px-1 bg-slate-100 rounded text-[10px]">
                              {halt.stationCode}
                            </span>
                            <span className="font-medium text-slate-800">{halt.stationName}</span>
                          </div>
                          <div className="text-slate-600 font-mono text-[10px] flex items-center gap-2">
                            <span>Arr: {halt.arrivalTime}</span>
                            <span>·</span>
                            <span>Dep: {halt.departureTime}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Enquiry Timestamp: {liveStatusData.lastUpdated}</span>
                    <button
                      type="button"
                      onClick={handleRefreshLiveStatus}
                      className="text-xs text-blue-900 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Test / Refresh Enquiry</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setActiveStatusTrain(null);
                  setLiveStatusData(null);
                }}
                className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
