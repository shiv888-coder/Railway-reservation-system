import React from 'react';
import {
  Train,
  Ticket,
  Armchair,
  Ban,
  ArrowRight,
  Search,
  Calendar,
  Eye,
  CheckCircle2,
  XCircle,
  Users,
  Compass,
  AlertTriangle,
  Server,
} from 'lucide-react';
import { railwayService } from '../../services/RailwayDataService.ts';
import { NavPage } from '../layout/Sidebar.tsx';

interface DashboardPageProps {
  onNavigate: (page: NavPage) => void;
  onSelectTrainForDetails: (trainNumber: string) => void;
  onViewReservation: (pnr: string) => void;
  onInitiateCancel: (pnr: string) => void;
  onPrefillBooking: (trainNumber: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onSelectTrainForDetails,
  onViewReservation,
  onInitiateCancel,
  onPrefillBooking,
}) => {
  const stats = railwayService.getDashboardStats();
  const reservations = railwayService.getAllReservations().slice(0, 6);
  const trains = railwayService.getAllTrains().slice(0, 4);
  const isOnline = railwayService.isBackendOnline;

  return (
    <div className="space-y-6">
      {/* Backend Status Notice Banner */}
      {!isOnline ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold text-amber-950">Backend Offline Notice: </span>
              <span>
                Java Spring Boot backend at <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[11px] font-semibold">{railwayService.backendUrl}</code> is not connected. All reservations, passenger counts, and statistics reflect <strong>Local Demo Data</strong>. Real bookings require the backend to be running.
              </span>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
              DEMO MODE
            </span>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50/90 p-3.5 text-xs text-emerald-900 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Server className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <span className="font-bold text-emerald-950">Java Spring Boot Connected: </span>
              <span>
                Connected to <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded text-[11px] font-semibold">{railwayService.backendUrl}</code>. Live database synchronization enabled with MySQL.
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900 border border-emerald-300 shrink-0">
            LIVE MYSQL SYNC
          </span>
        </div>
      )}

      {/* Welcome & Primary Hero Banner */}
      <div className="rounded-xl bg-gradient-to-r from-[#0b192c] via-[#0f2851] to-[#1e3a8a] text-white p-6 shadow-md border border-blue-900/40 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="text-xs uppercase font-semibold text-blue-300 tracking-wider">
            Operational Overview & Passenger Central
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Indian Railway Reservation Management Portal
          </h2>
          <p className="text-sm text-slate-200 leading-relaxed">
            Real-time control over train schedules, coach inventory, passenger manifests, and instant ticket processing. Built on enterprise Object-Oriented architecture.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('search')}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-950 font-semibold text-xs rounded-lg hover:bg-blue-50 transition-all shadow-sm cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-blue-900" />
              <span>Search Available Trains</span>
            </button>
            <button
              onClick={() => onNavigate('booking')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-800/80 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-all border border-blue-600/50 cursor-pointer"
            >
              <Ticket className="w-3.5 h-3.5 text-blue-300" />
              <span>New Reservation</span>
            </button>
            <button
              onClick={() => onNavigate('oop-docs')}
              className="flex items-center gap-2 px-3 py-2 text-blue-200 hover:text-white text-xs font-medium transition-colors"
            >
              <span>Explore OOP Architecture</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-80 opacity-10 pointer-events-none hidden md:flex items-center justify-center">
          <Train className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Trains */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Trains
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center">
              <Train className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {stats.totalTrains}
            </div>
            <span className="text-xs text-slate-500">Scheduled Routes</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <span>Rajdhani, Vande Bharat, Superfast</span>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Bookings
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {stats.totalBookings}
            </div>
            <span className="text-xs text-emerald-800 font-medium">Active & Processed</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <span>{stats.activePassengers} Passengers Traveled</span>
          </div>
        </div>

        {/* Available Seats */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Available Seats
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-900 flex items-center justify-center">
              <Armchair className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {stats.availableSeats}
            </div>
            <span className="text-xs text-indigo-900 font-medium">Ready to Book</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <span>Across AC & Chair Car classes</span>
          </div>
        </div>

        {/* Cancelled Tickets */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Cancelled Tickets
            </span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-800 flex items-center justify-center">
              <Ban className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {stats.cancelledTickets}
            </div>
            <span className="text-xs text-rose-800 font-medium">Refunds Processed</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <span>Seats automatically replenished</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Reservations Table + Featured Trains */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Reservations Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Ticket Reservations</h3>
              <p className="text-xs text-slate-500">Live booking log with passenger counts and PNR status</p>
            </div>
            <button
              onClick={() => onNavigate('reservations')}
              className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">PNR / Booking ID</th>
                  <th className="px-4 py-3">Train & Route</th>
                  <th className="px-4 py-3">Journey Date</th>
                  <th className="px-4 py-3">Passengers</th>
                  <th className="px-4 py-3 text-right">Fare</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      No reservations recorded yet.
                    </td>
                  </tr>
                ) : (
                  reservations.map(res => (
                    <tr key={res.bookingId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-blue-950 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{res.getFormattedPNR()}</span>
                          {res.isDemo && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              DEMO
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-medium text-slate-900 flex items-center gap-1.5">
                          <span>{res.trainNumber}</span>
                          <span className="text-slate-400">·</span>
                          <span className="truncate max-w-[130px]">{res.trainName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {res.source} → {res.destination} ({res.travelClass})
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                        {res.journeyDate}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700 font-mono">
                        {res.passengers.length} {res.passengers.length === 1 ? 'Passenger' : 'Passengers'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right font-mono font-semibold text-slate-900 tabular-nums">
                        ₹{res.fareBreakdown.totalFare.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {res.isConfirmed() ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            Confirmed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-700" />
                            Cancelled
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewReservation(res.bookingId)}
                            className="p-1 rounded text-slate-500 hover:text-blue-900 hover:bg-slate-100 transition-colors"
                            title="View E-Ticket"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {res.isConfirmed() && (
                            <button
                              onClick={() => onInitiateCancel(res.bookingId)}
                              className="p-1 rounded text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                              title="Cancel Ticket"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Key Trains & Quick Booking Shortcut */}
        <div className="space-y-4">
          {/* Featured Trains Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Featured Trains</h3>
              <button
                onClick={() => onNavigate('search')}
                className="text-xs text-blue-900 font-semibold hover:underline cursor-pointer"
              >
                Search All
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {trains.map(train => (
                <div
                  key={train.trainNumber}
                  className="p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="font-mono text-blue-900">{train.trainNumber}</span>
                      <span>·</span>
                      <span className="truncate max-w-[140px]">{train.trainName}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {train.trainType}
                    </span>
                  </div>

                  <div className="mt-2 text-slate-500 flex items-center justify-between">
                    <span>{train.source} ({train.departureTime})</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span>{train.destination} ({train.arrivalTime})</span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-slate-500">
                      Duration: <strong className="text-slate-700 font-medium">{train.durationHours}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectTrainForDetails(train.trainNumber)}
                        className="text-blue-900 hover:underline font-semibold cursor-pointer"
                      >
                        Timetable
                      </button>
                      <button
                        onClick={() => onPrefillBooking(train.trainNumber)}
                        className="px-2 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts Box */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-900" />
              <span>Project Quick Access</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Third-year B.Tech CSE Mini Project created by <strong>Shiv Shankar Mal</strong> (Group 9, Roll 2760012408).
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onNavigate('passengers')}
                className="flex items-center gap-1.5 p-2 bg-white rounded border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-900 transition-colors font-medium text-[11px]"
              >
                <Users className="w-3.5 h-3.5 text-blue-800" />
                <span>Passenger Info</span>
              </button>
              <button
                onClick={() => onNavigate('cancellation')}
                className="flex items-center gap-1.5 p-2 bg-white rounded border border-slate-200 text-slate-700 hover:border-rose-400 hover:text-rose-900 transition-colors font-medium text-[11px]"
              >
                <Ban className="w-3.5 h-3.5 text-rose-800" />
                <span>Cancel Ticket</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
