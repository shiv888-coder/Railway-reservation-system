import React, { useState } from 'react';
import {
  FileText,
  Search,
  Train,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Copy,
  Check,
  Ban,
  Calendar,
  CreditCard,
  QrCode,
  ShieldCheck,
  ArrowRight,
  Ticket,
  AlertCircle,
} from 'lucide-react';
import { railwayService } from '../../services/RailwayDataService.ts';
import { TicketReservation } from '../../models/Reservation.ts';
import { BookingStatus } from '../../types/index.ts';

interface ReservationDetailsPageProps {
  initialPnr?: string;
  onInitiateCancel: (pnr: string) => void;
  onBookNew: () => void;
}

export const ReservationDetailsPage: React.FC<ReservationDetailsPageProps> = ({
  initialPnr = '',
  onInitiateCancel,
  onBookNew,
}) => {
  const [searchPnr, setSearchPnr] = useState(initialPnr);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');
  const [copiedPnr, setCopiedPnr] = useState(false);

  // Current viewed reservation
  const allReservations = railwayService.getAllReservations();
  const [activeReservation, setActiveReservation] = useState<TicketReservation | null>(() => {
    if (initialPnr) {
      const found = railwayService.getReservationByPnr(initialPnr);
      if (found) return found;
    }
    return allReservations[0] || null;
  });

  const [searchError, setSearchError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    if (!searchPnr.trim()) return;
    const found = railwayService.getReservationByPnr(searchPnr.trim());
    if (found) {
      setActiveReservation(found);
    } else {
      setSearchError(`No reservation found with PNR: "${searchPnr.trim()}"`);
    }
  };

  const handleCopyPnr = (pnr: string) => {
    navigator.clipboard.writeText(pnr);
    setCopiedPnr(true);
    setTimeout(() => setCopiedPnr(false), 2000);
  };

  const filteredReservations = allReservations.filter(r => {
    if (statusFilter === 'ALL') return true;
    return r.bookingStatus === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Search Bar & Page Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Reservation Details & Digital E-Ticket</h2>
            <p className="text-xs text-slate-500">
              Query booking status, view authentic reservation vouchers and inspect seat allocations
            </p>
          </div>

          {/* PNR Search Input */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchPnr}
                onChange={e => setSearchPnr(e.target.value)}
                placeholder="Enter 10-digit PNR..."
                className="pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                maxLength={11}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Track PNR
            </button>
          </form>
        </div>

        {searchError && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Left Column = Full E-Ticket Viewer; Right Column = Reservations List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): E-Ticket View */}
        <div className="lg:col-span-8">
          {activeReservation ? (
            <div className="bg-white rounded-xl border-2 border-slate-300 shadow-md overflow-hidden print:border-none print:shadow-none">
              {/* E-Ticket Official Header */}
              <div className="bg-gradient-to-r from-[#0b192c] to-[#0f2851] text-white p-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                    <Train className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-widest text-blue-300">
                      ELECTRONIC RESERVATION SLIP (ERS) · LAB SIMULATION
                    </div>
                    <div className="text-base font-extrabold text-white">Railway Reservation System (Demo)</div>
                    <div className="text-[11px] text-amber-200">
                      B.Tech CSE OOP Mini Project · Academic Simulation Only · Not Valid for Real Train Travel
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-300 uppercase">PNR / Booking Reference</div>
                  <div className="text-xl font-mono font-extrabold text-white tracking-wider flex items-center justify-end gap-1.5">
                    <span>{activeReservation.getFormattedPNR()}</span>
                    <button
                      onClick={() => handleCopyPnr(activeReservation.bookingId)}
                      className="p-1 rounded hover:bg-white/20 transition-colors"
                      title="Copy PNR"
                    >
                      {copiedPnr ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-300 mt-0.5">
                    Booked on: {new Date(activeReservation.bookedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Demo Mode Notice Banner if ticket is local fallback */}
              {activeReservation.isDemo && (
                <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold uppercase tracking-wider text-[10px]">
                      DEMO DATA
                    </span>
                    <span className="font-medium">
                      Simulated local reservation · Java Spring Boot backend was offline during creation. Not stored in MySQL database.
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-amber-700 font-semibold hidden md:inline">
                    LOCAL_STORAGE_ONLY
                  </span>
                </div>
              )}

              {/* Status Banner */}
              <div
                className={`px-5 py-2.5 flex items-center justify-between text-xs font-semibold ${
                  activeReservation.isCancelled()
                    ? 'bg-rose-50 text-rose-900 border-b border-rose-200'
                    : activeReservation.isDemo
                    ? 'bg-amber-50 text-amber-950 border-b border-amber-200'
                    : 'bg-emerald-50 text-emerald-900 border-b border-emerald-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {activeReservation.isCancelled() ? (
                    <>
                      <XCircle className="w-4 h-4 text-rose-700" />
                      <span>BOOKING STATUS: CANCELLED (REFUND ISSUED)</span>
                    </>
                  ) : activeReservation.isDemo ? (
                    <>
                      <AlertCircle className="w-4 h-4 text-amber-700" />
                      <span>BOOKING STATUS: DEMO RESERVATION · UNCONFIRMED IN MYSQL</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>BOOKING STATUS: CONFIRMED (CNF) · VERIFIED IN MYSQL</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px]">
                    Travel Class: <strong>{activeReservation.travelClass}</strong>
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="font-mono text-[11px]">
                    Quota: <strong>General (GN)</strong>
                  </span>
                </div>
              </div>

              {/* Cancellation Audit Box (if cancelled) */}
              {activeReservation.isCancelled() && activeReservation.cancellationDetails && (
                <div className="m-5 p-4 bg-rose-50/80 rounded-lg border border-rose-200 text-xs text-rose-950 space-y-1.5">
                  <div className="font-bold flex items-center justify-between">
                    <span>Ticket Cancellation & Refund Details</span>
                    <span className="font-mono text-[11px]">
                      Ref: {activeReservation.cancellationDetails.refundReferenceId}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-medium text-[11px]">
                    <div>
                      <span className="text-rose-700 block text-[10px]">Cancelled Date:</span>
                      <span>
                        {new Date(activeReservation.cancellationDetails.cancelledAt).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-rose-700 block text-[10px]">Cancellation Fee:</span>
                      <span className="font-mono">
                        ₹{activeReservation.cancellationDetails.cancellationFee}
                      </span>
                    </div>
                    <div>
                      <span className="text-rose-700 block text-[10px]">Refund Amount:</span>
                      <span className="font-mono font-bold text-emerald-800">
                        ₹{activeReservation.cancellationDetails.refundAmount}
                      </span>
                    </div>
                    <div>
                      <span className="text-rose-700 block text-[10px]">Reason:</span>
                      <span className="truncate">{activeReservation.cancellationDetails.reason}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Train & Journey Bar */}
              <div className="p-5 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-50/50">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Train Details</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {activeReservation.trainNumber} - {activeReservation.trainName}
                  </div>
                  <div className="text-xs text-blue-900 font-semibold">{activeReservation.trainType}</div>
                </div>

                <div className="sm:border-x sm:border-slate-200 sm:px-4 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Journey Date</div>
                  <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                    {activeReservation.journeyDate}
                  </div>
                  <div className="text-xs text-slate-500">Boarding at {activeReservation.source}</div>
                </div>

                <div className="sm:text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Route Corridor</div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    {activeReservation.sourceStationName} ({activeReservation.departureTime})
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    → {activeReservation.destinationStationName} ({activeReservation.arrivalTime})
                  </div>
                </div>
              </div>

              {/* Passenger Manifest & Allocated Seats Table */}
              <div className="p-5 border-b border-slate-200">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
                  <span>Passenger Manifest & Assigned Coach / Berth</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {activeReservation.passengers.length} Passenger(s)
                  </span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px]">
                      <tr>
                        <th className="px-3.5 py-2.5">#</th>
                        <th className="px-3.5 py-2.5">Passenger Name</th>
                        <th className="px-3.5 py-2.5">Age / Gender</th>
                        <th className="px-3.5 py-2.5">ID Proof Details</th>
                        <th className="px-3.5 py-2.5 text-center">Assigned Coach</th>
                        <th className="px-3.5 py-2.5 text-center">Berth Number</th>
                        <th className="px-3.5 py-2.5 text-right">Berth Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal">
                      {activeReservation.passengers.map((p, idx) => {
                        const alloc = activeReservation.seatAllocations[idx];
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/70">
                            <td className="px-3.5 py-2.5 font-mono text-slate-400">{idx + 1}</td>
                            <td className="px-3.5 py-2.5 font-bold text-slate-900 whitespace-nowrap">
                              {p.name}
                            </td>
                            <td className="px-3.5 py-2.5 text-slate-600 whitespace-nowrap">
                              {p.age} Yrs · {p.gender}
                            </td>
                            <td className="px-3.5 py-2.5 text-slate-600 whitespace-nowrap">
                              <span className="text-slate-400">{p.idProofType}:</span>{' '}
                              <span className="font-mono text-slate-800">
                                {p.idProofNumber ? `••••-${p.idProofNumber.slice(-4)}` : 'Verified'}
                              </span>
                            </td>
                            <td className="px-3.5 py-2.5 text-center font-mono font-bold text-blue-900 whitespace-nowrap">
                              {alloc?.coach || 'B2'}
                            </td>
                            <td className="px-3.5 py-2.5 text-center font-mono font-bold text-slate-900 whitespace-nowrap">
                              {alloc?.berthNumber || 24 + idx}
                            </td>
                            <td className="px-3.5 py-2.5 text-right font-medium text-slate-700 whitespace-nowrap">
                              {alloc?.berthType || 'Lower Berth'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Fare & Security Section */}
              <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                {/* Simulated Verification QR Code */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-lg p-1.5 flex items-center justify-center shrink-0">
                    <QrCode className="w-full h-full text-white" />
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight">
                    <strong className="text-slate-800 block">Digital Verification QR</strong>
                    Scan with Railway Ticket Examiner (TTE) handheld terminal for biometric verification.
                  </div>
                </div>

                {/* Academic Mini Project Note */}
                <div className="text-[11px] text-slate-500 leading-relaxed sm:border-x sm:border-slate-200 sm:px-4">
                  <strong className="text-slate-700 block">Project Submission</strong>
                  Student: <strong>Shiv Shankar Mal</strong> (Group 9)
                  <br />
                  Roll: <strong>2760012408</strong> · 3rd Year B.Tech CSE
                </div>

                {/* Total Fare Breakdown */}
                <div className="sm:text-right space-y-1 text-xs">
                  <div className="text-slate-500">Total Ticket Fare (Inc. GST)</div>
                  <div className="text-2xl font-mono font-extrabold text-blue-950 tabular-nums">
                    ₹{activeReservation.fareBreakdown.totalFare.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Includes ₹{activeReservation.fareBreakdown.gst} GST + reservation fee
                  </div>
                </div>
              </div>

              {/* Academic Simulation Watermark Banner */}
              <div className="px-5 py-2 bg-slate-100/90 border-t border-slate-200 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-1">
                <span>Academic Lab Simulation · B.Tech CSE (Group 9 - Shiv Shankar Mal)</span>
                <span className="font-semibold text-slate-700">Not an Official IRCTC Ticket · No Travel Validity</span>
              </div>

              {/* Ticket Action Footer */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Download Slip</span>
                  </button>
                  <button
                    onClick={onBookNew}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Book Another Ticket</span>
                  </button>
                </div>

                {activeReservation.isConfirmed() && (
                  <button
                    onClick={() => onInitiateCancel(activeReservation.bookingId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Cancel This Reservation</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
              Select or search for a reservation to display details.
            </div>
          )}
        </div>

        {/* Right Column (4 cols): All Reservations Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                All Bookings ({allReservations.length})
              </h3>
              <div className="flex items-center gap-1 text-[11px]">
                {(['ALL', 'CONFIRMED', 'CANCELLED'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                      statusFilter === f
                        ? 'bg-blue-900 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredReservations.map(res => {
                const isSelected = activeReservation?.bookingId === res.bookingId;
                return (
                  <div
                    key={res.bookingId}
                    onClick={() => setActiveReservation(res)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-900 bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-950">
                        {res.getFormattedPNR()}
                      </span>
                      {res.isConfirmed() ? (
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Confirmed
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          Cancelled
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 font-medium text-slate-900 truncate">
                      {res.trainNumber} - {res.trainName}
                    </div>

                    <div className="mt-1 text-slate-500 text-[11px] flex items-center justify-between">
                      <span>{res.journeyDate}</span>
                      <span className="font-mono font-bold text-slate-800 tabular-nums">
                        ₹{res.fareBreakdown.totalFare.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="mt-1 text-[11px] text-slate-400">
                      {res.passengers.length} Passenger(s) · Class: {res.travelClass}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
