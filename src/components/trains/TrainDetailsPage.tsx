import React, { useState } from 'react';
import {
  Train,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  Armchair,
  Utensils,
  Wifi,
  ShieldCheck,
  Zap,
  ArrowRight,
  Ticket,
} from 'lucide-react';
import { railwayService } from '../../services/RailwayDataService.ts';
import { CoachClass } from '../../types/index.ts';

interface TrainDetailsPageProps {
  selectedTrainNumber?: string;
  onBookTrain: (trainNumber: string, travelClass?: CoachClass) => void;
  onSelectTrainNumber: (trainNumber: string) => void;
}

export const TrainDetailsPage: React.FC<TrainDetailsPageProps> = ({
  selectedTrainNumber = '12301',
  onBookTrain,
  onSelectTrainNumber,
}) => {
  const allTrains = railwayService.getAllTrains();
  const currentTrainNumber = selectedTrainNumber || allTrains[0]?.trainNumber || '12301';
  const train = railwayService.getTrainByNumber(currentTrainNumber) || allTrains[0];

  const [activeTab, setActiveTab] = useState<'schedule' | 'seats' | 'amenities'>('schedule');

  if (!train) {
    return <div className="p-8 text-center text-slate-500">Train details not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Train Selector Dropdown & Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Train className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-950 text-white rounded">
                  {train.trainNumber}
                </span>
                <h2 className="text-lg font-bold text-slate-900">{train.trainName}</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                  {train.trainType}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Connecting {train.sourceStationName} ({train.source}) to {train.destinationStationName} ({train.destination})
              </p>
            </div>
          </div>

          {/* Quick Switch Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Select Train:</span>
            <select
              value={train.trainNumber}
              onChange={e => onSelectTrainNumber(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              {allTrains.map(t => (
                <option key={t.trainNumber} value={t.trainNumber}>
                  {t.trainNumber} - {t.trainName} ({t.source} → {t.destination})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Route Overview Row */}
        <div className="py-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          <div className="space-y-1">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Origin Station</div>
            <div className="text-base font-bold text-slate-900">{train.sourceStationName}</div>
            <div className="text-xs font-mono font-bold text-blue-900">
              {train.source} · Dep: {train.departureTime}
            </div>
          </div>

          <div className="space-y-1 text-center sm:border-x sm:border-slate-100 sm:px-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Duration</div>
            <div className="text-base font-bold font-mono text-slate-900">{train.durationHours}</div>
            <div className="text-xs text-slate-500">{train.distanceKm} Kilometers</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Destination Terminal</div>
            <div className="text-base font-bold text-slate-900">{train.destinationStationName}</div>
            <div className="text-xs font-mono font-bold text-emerald-800">
              {train.destination} · Arr: {train.arrivalTime}
            </div>
          </div>

          <div className="flex sm:justify-end">
            <button
              onClick={() => onBookTrain(train.trainNumber)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              <span>Book This Train</span>
            </button>
          </div>
        </div>

        {/* Operational Days */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="font-medium">Operating Days:</span>
            <div className="flex items-center gap-1 font-mono">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                const isRun = train.isOperatingOn(day);
                return (
                  <span
                    key={day}
                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                      isRun
                        ? 'bg-blue-900 text-white font-semibold'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {day}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="text-slate-500">
            Classes Configured: <strong>{train.classesAvailable.join(', ')}</strong>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'schedule'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Route Halts & Timetable ({train.halts.length} Stations)
        </button>
        <button
          onClick={() => setActiveTab('seats')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'seats'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Class Fares & Seat Matrix
        </button>
        <button
          onClick={() => setActiveTab('amenities')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'amenities'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Onboard Amenities & Services
        </button>
      </div>

      {/* Tab 1: Route Halts Table */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Official Station Halts & Intermediate Timings
            </h3>
            <span className="text-xs text-slate-500">Distance from Origin: {train.distanceKm} km</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-2.5">#</th>
                  <th className="px-4 py-2.5">Station Name & Code</th>
                  <th className="px-4 py-2.5">Arrival</th>
                  <th className="px-4 py-2.5">Departure</th>
                  <th className="px-4 py-2.5">Halt Time</th>
                  <th className="px-4 py-2.5">Distance</th>
                  <th className="px-4 py-2.5">Day</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {train.halts.map((halt, idx) => (
                  <tr
                    key={halt.stationCode}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      idx === 0 || idx === train.halts.length - 1 ? 'bg-blue-50/30 font-medium' : ''
                    }`}
                  >
                    <td className="px-4 py-2.5 font-mono text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{halt.stationName}</span>
                        <span className="font-mono text-xs text-blue-900 font-bold">
                          ({halt.stationCode})
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-mono tabular-nums text-slate-700">
                      {halt.arrivalTime}
                    </td>
                    <td className="px-4 py-2.5 font-mono tabular-nums text-slate-700">
                      {halt.departureTime}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {halt.haltMinutes > 0 ? `${halt.haltMinutes} mins` : 'Origin/Terminus'}
                    </td>
                    <td className="px-4 py-2.5 font-mono tabular-nums text-slate-600">
                      {halt.distanceKm} km
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-600">Day {halt.day}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Class Fares & Seat Matrix */}
      {activeTab === 'seats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {train.classesAvailable.map(cls => {
            const available = train.getAvailableSeats(cls);
            const total = train.totalSeats[cls] || 100;
            const fare = train.calculateFare(cls, 1, 0);
            const occupancyPct = Math.round(((total - available) / total) * 100);

            return (
              <div
                key={cls}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-lg font-bold font-mono text-blue-950">{cls}</span>
                      <p className="text-[11px] text-slate-500">
                        {cls === '1A' ? 'First Class AC' :
                         cls === '2A' ? 'AC 2-Tier Sleeper' :
                         cls === '3A' ? 'AC 3-Tier Sleeper' :
                         cls === 'CC' ? 'AC Chair Car' :
                         cls === 'EC' ? 'Executive Chair Car' : 'Sleeper Class'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                        ₹{fare.totalFare}
                      </div>
                      <span className="text-[10px] text-slate-400">Base + Surcharges + GST</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Available Seats:</span>
                      <strong className="text-emerald-800 font-mono text-sm">{available} Seats</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Total Coach Capacity:</span>
                      <span className="text-slate-700 font-mono">{total} Seats</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Occupancy Rate</span>
                        <span>{occupancyPct}% Booked</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            occupancyPct > 80 ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${occupancyPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fare breakdown pill box */}
                  <div className="mt-4 p-2.5 rounded bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-500">
                      <span>Base Fare:</span>
                      <span className="font-mono">₹{fare.baseFare}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Reservation Fee:</span>
                      <span className="font-mono">₹{fare.reservationCharge}</span>
                    </div>
                    {fare.superfastCharge > 0 && (
                      <div className="flex justify-between text-slate-500">
                        <span>Superfast Fee:</span>
                        <span className="font-mono">₹{fare.superfastCharge}</span>
                      </div>
                    )}
                    {fare.cateringCharge > 0 && (
                      <div className="flex justify-between text-slate-500">
                        <span>Included Catering:</span>
                        <span className="font-mono">₹{fare.cateringCharge}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-500">
                      <span>GST (5%):</span>
                      <span className="font-mono">₹{fare.gst}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onBookTrain(train.trainNumber, cls)}
                  className="mt-4 w-full py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Book In {cls} Class
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Amenities */}
      {activeTab === 'amenities' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Onboard Amenities & Passenger Conveniences</h3>
          <p className="text-xs text-slate-500">
            Standard and premier amenities included on Train {train.trainNumber} ({train.trainName})
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {train.amenities.map(amenity => (
              <div
                key={amenity}
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{amenity}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Complimentary or standard onboard service
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
