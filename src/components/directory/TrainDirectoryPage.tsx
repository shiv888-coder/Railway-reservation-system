import React, { useState, useMemo } from 'react';
import {
  Train,
  MapPin,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  Clock,
  Calendar,
  Compass,
  CheckCircle2,
  Building2,
  Layers,
  ChevronRight,
  ChevronDown,
  Info,
} from 'lucide-react';
import { railwayService } from '../../services/RailwayDataService.ts';
import { BaseTrain } from '../../models/Train.ts';
import { CoachClass, StationData, TrainType } from '../../types/index.ts';

interface TrainDirectoryPageProps {
  onSelectTrainForDetails: (trainNumber: string) => void;
  onBookTrain: (trainNumber: string, travelClass?: CoachClass) => void;
  onSearchFromStation?: (stationCode: string) => void;
  onSearchToStation?: (stationCode: string) => void;
}

type DirectoryTab = 'trains' | 'stations' | 'popular';

export const TrainDirectoryPage: React.FC<TrainDirectoryPageProps> = ({
  onSelectTrainForDetails,
  onBookTrain,
  onSearchFromStation,
  onSearchToStation,
}) => {
  const [activeTab, setActiveTab] = useState<DirectoryTab>('trains');

  // Train Search & Filter State
  const [trainQuery, setTrainQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [expandedTrainHalts, setExpandedTrainHalts] = useState<string | null>(null);

  // Station Search & Filter State
  const [stationQuery, setStationQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');

  const allTrains: BaseTrain[] = useMemo(() => railwayService.getAllTrains(), []);
  const allStations: StationData[] = useMemo(() => railwayService.getStations(), []);

  // Filtered Trains
  const filteredTrains = useMemo(() => {
    return allTrains.filter(t => {
      const q = trainQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        t.trainNumber.toLowerCase().includes(q) ||
        t.trainName.toLowerCase().includes(q) ||
        t.source.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q) ||
        t.sourceStationName.toLowerCase().includes(q) ||
        t.destinationStationName.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === 'ALL' || t.trainType === selectedCategory;

      const matchesClass =
        selectedClass === 'ALL' || t.classesAvailable.includes(selectedClass as CoachClass);

      return matchesQuery && matchesCategory && matchesClass;
    });
  }, [allTrains, trainQuery, selectedCategory, selectedClass]);

  // Unique Railway Zones
  const allZones = useMemo(() => {
    const set = new Set<string>();
    allStations.forEach(s => {
      if (s.zone) set.add(s.zone);
    });
    return Array.from(set).sort();
  }, [allStations]);

  // Filtered Stations
  const filteredStations = useMemo(() => {
    return allStations.filter(s => {
      const q = stationQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q);

      const matchesZone = selectedZone === 'ALL' || s.zone === selectedZone;
      return matchesQuery && matchesZone;
    });
  }, [allStations, stationQuery, selectedZone]);

  // Category styling helper
  const getCategoryBadge = (type: TrainType) => {
    switch (type) {
      case 'Rajdhani':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
      case 'Vande Bharat':
        return 'bg-purple-100 text-purple-900 border-purple-300 font-bold';
      case 'Shatabdi':
        return 'bg-cyan-100 text-cyan-900 border-cyan-300 font-bold';
      case 'Duronto':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
      case 'Garib Rath':
        return 'bg-teal-100 text-teal-900 border-teal-300 font-bold';
      case 'Superfast':
        return 'bg-blue-100 text-blue-900 border-blue-300 font-semibold';
      case 'Mail Express':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300 font-semibold';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-50 text-blue-900 rounded-lg">
                <Compass className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-slate-900">National Railway Directory</h1>
                <p className="text-xs text-slate-500">
                  Explore verified Indian Railways trains, route timetables, station codes, and network zones
                </p>
              </div>
            </div>
          </div>

          {/* Directory Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('trains')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'trains'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Train className="w-3.5 h-3.5" />
              <span>Trains Directory ({allTrains.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stations')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'stations'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Stations Directory ({allStations.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('popular')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'popular'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Premier Discovery</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: TRAINS DIRECTORY */}
      {activeTab === 'trains' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={trainQuery}
                  onChange={e => setTrainQuery(e.target.value)}
                  placeholder="Search by train number (e.g. 12301), name (Rajdhani), or city..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>

              {/* Class Filter */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs text-slate-500 font-medium">Class:</span>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                >
                  <option value="ALL">All Classes</option>
                  <option value="1A">1A (First AC)</option>
                  <option value="2A">2A (Second AC)</option>
                  <option value="3A">3A (Third AC)</option>
                  <option value="SL">SL (Sleeper)</option>
                  <option value="CC">CC (Chair Car)</option>
                  <option value="EC">EC (Executive Chair)</option>
                </select>
              </div>
            </div>

            {/* Category Badges Filter */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-slate-500 font-medium mr-1">Category:</span>
              {[
                { id: 'ALL', label: 'All Trains' },
                { id: 'Rajdhani', label: 'Rajdhani' },
                { id: 'Vande Bharat', label: 'Vande Bharat' },
                { id: 'Shatabdi', label: 'Shatabdi' },
                { id: 'Duronto', label: 'Duronto' },
                { id: 'Garib Rath', label: 'Garib Rath' },
                { id: 'Superfast', label: 'Superfast' },
                { id: 'Mail Express', label: 'Mail Express' },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-blue-900 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing {filteredTrains.length} of {allTrains.length} verified trains</span>
            <span className="text-[11px] bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded font-mono">
              Source: Official Published Timetables
            </span>
          </div>

          {/* Trains Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTrains.map(train => {
              const isHaltsExpanded = expandedTrainHalts === train.trainNumber;
              return (
                <div
                  key={train.trainNumber}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-blue-900 font-mono tracking-tight">
                          {train.trainNumber}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${getCategoryBadge(train.trainType)}`}>
                          {train.trainType}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">{train.trainName}</h3>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-600 block">{train.durationHours}</span>
                      <span className="text-[11px] text-slate-400">{train.distanceKm} km</span>
                    </div>
                  </div>

                  {/* Route Corridor */}
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-extrabold text-slate-900 font-mono text-sm">{train.source}</span>
                      <div className="text-[11px] text-slate-500 truncate max-w-[130px]">{train.sourceStationName}</div>
                      <div className="text-[11px] font-bold text-blue-900 mt-0.5">{train.departureTime}</div>
                    </div>

                    <div className="flex-1 flex flex-col items-center px-4">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {train.halts.length} stations
                      </span>
                      <div className="w-full flex items-center my-1">
                        <div className="w-2 h-2 rounded-full bg-blue-900"></div>
                        <div className="flex-1 h-0.5 bg-slate-300"></div>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-900" />
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {train.daysOfOperation.join(', ')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 font-mono text-sm">{train.destination}</span>
                      <div className="text-[11px] text-slate-500 truncate max-w-[130px]">{train.destinationStationName}</div>
                      <div className="text-[11px] font-bold text-emerald-800 mt-0.5">{train.arrivalTime}</div>
                    </div>
                  </div>

                  {/* Classes & Amenities */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[11px]">Classes:</span>
                      {train.classesAvailable.map(cls => (
                        <span
                          key={cls}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-mono font-semibold border border-slate-200"
                        >
                          {cls}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedTrainHalts(isHaltsExpanded ? null : train.trainNumber)}
                      className="text-blue-900 text-[11px] font-medium hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{isHaltsExpanded ? 'Hide Route' : 'Show Halts'}</span>
                      {isHaltsExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Expandable Halts Timetable */}
                  {isHaltsExpanded && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                        Scheduled Halts Timetable:
                      </span>
                      <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-slate-100 text-[10px] text-slate-500 uppercase sticky top-0">
                            <tr>
                              <th className="py-1.5 px-2.5">Station</th>
                              <th className="py-1.5 px-2 text-center">Arr</th>
                              <th className="py-1.5 px-2 text-center">Dep</th>
                              <th className="py-1.5 px-2 text-right">Halt</th>
                              <th className="py-1.5 px-2 text-right">Distance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-[11px]">
                            {train.halts.map((h, i) => (
                              <tr key={h.stationCode + i} className="hover:bg-slate-50">
                                <td className="py-1.5 px-2.5 font-medium text-slate-900">
                                  <span className="font-mono font-bold text-blue-900 mr-1.5">{h.stationCode}</span>
                                  <span>{h.stationName}</span>
                                </td>
                                <td className="py-1.5 px-2 text-center font-mono text-slate-600">{h.arrivalTime}</td>
                                <td className="py-1.5 px-2 text-center font-mono text-slate-600">{h.departureTime}</td>
                                <td className="py-1.5 px-2 text-right text-slate-500">{h.haltMinutes ? `${h.haltMinutes}m` : '-'}</td>
                                <td className="py-1.5 px-2 text-right font-mono text-slate-500">{h.distanceKm} km</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectTrainForDetails(train.trainNumber)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      View Timetable & Seats
                    </button>

                    <button
                      type="button"
                      onClick={() => onBookTrain(train.trainNumber)}
                      className="px-4 py-1.5 rounded-lg bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <span>Book Ticket</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: STATIONS DIRECTORY */}
      {activeTab === 'stations' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={stationQuery}
                onChange={e => setStationQuery(e.target.value)}
                placeholder="Search station by code (e.g. NDLS, HWH, NH, RPH), city (Naihati, Rampurhat, Kolkata), or state..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>

            {/* Zone Filter */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs text-slate-500 font-medium">Zone:</span>
              <select
                value={selectedZone}
                onChange={e => setSelectedZone(e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-900 max-w-[200px]"
              >
                <option value="ALL">All Railway Zones</option>
                {allZones.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing {filteredStations.length} of {allStations.length} verified stations</span>
            <span className="text-[11px] bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded font-mono">
              Coverage: All 18 Indian Railway Zones
            </span>
          </div>

          {/* Stations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredStations.map(station => (
              <div
                key={station.code}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-lg font-black text-blue-900 font-mono tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {station.code}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold px-2 py-0.5 bg-slate-100 rounded border border-slate-200 truncate max-w-[120px]">
                      {station.zone.split('(')[1]?.replace(')', '') || station.zone}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">{station.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {station.city}, {station.state}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                  <span className="text-slate-400 text-[10px]">{station.zone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: POPULAR TRAIN DISCOVERY */}
      {activeTab === 'popular' && (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-md">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider inline-block mb-2">
              Indian Railways Premier Fleets
            </span>
            <h2 className="text-lg font-bold">Discover India&apos;s Fastest & Most Iconic Train Services</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              From the pioneering 160 km/h Vande Bharat Express to the legendary Rajdhani and Shatabdi networks, experience verified routes and timetables connecting all state capitals.
            </p>
          </div>

          {/* Premier Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Vande Bharat Showcase */}
            <div className="bg-white rounded-xl border border-purple-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-purple-100 text-purple-900">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Vande Bharat Express</h3>
                  <span className="text-[10px] text-purple-700 font-semibold">160 km/h Semi-High Speed</span>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Indigenous state-of-the-art semi-high-speed rakes equipped with aerodynamic design, 180° rotatable executive seats, sound-proof cabins, and vacuum toilets.
              </p>
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-800">22436 · New Delhi - Varanasi</span>
                  <span className="text-purple-700 font-semibold">8h 00m</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-800">20901 · Mumbai - Ahmedabad</span>
                  <span className="text-purple-700 font-semibold">5h 15m</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-800">22301 · Howrah - New Jalpaiguri</span>
                  <span className="text-purple-700 font-semibold">7h 30m</span>
                </div>
              </div>
            </div>

            {/* Rajdhani Showcase */}
            <div className="bg-white rounded-xl border border-amber-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-amber-100 text-amber-900">
                  <Train className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Rajdhani Express Network</h3>
                  <span className="text-[10px] text-amber-800 font-semibold">Flagship Capital Connectivity</span>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Premier fully air-conditioned express connecting state capitals to the national capital New Delhi. Features inclusive gourmet dining and dedicated right-of-way priority.
              </p>
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-800">12301 · Howrah Rajdhani</span>
                  <span className="text-amber-800 font-semibold">17h 15m</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-800">12951 · Mumbai Tejas Rajdhani</span>
                  <span className="text-amber-800 font-semibold">15h 32m</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-800">22691 · Bengaluru Rajdhani</span>
                  <span className="text-amber-800 font-semibold">33h 30m</span>
                </div>
              </div>
            </div>

            {/* Shatabdi Showcase */}
            <div className="bg-white rounded-xl border border-cyan-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-cyan-100 text-cyan-900">
                  <Clock className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Shatabdi Express Services</h3>
                  <span className="text-[10px] text-cyan-800 font-semibold">Same-Day Intercity Express</span>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Daytime fast express trains designed for business travellers connecting major commercial hubs with returning departures on the same day. Includes catering and tea service.
              </p>
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-800">12002 · Bhopal Shatabdi</span>
                  <span className="text-cyan-800 font-semibold">8h 40m</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-800">12004 · Lucknow Shatabdi</span>
                  <span className="text-cyan-800 font-semibold">6h 30m</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-800">12007 · Chennai Mysuru Shatabdi</span>
                  <span className="text-cyan-800 font-semibold">7h 00m</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
