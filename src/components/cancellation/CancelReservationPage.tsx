import React, { useState } from 'react';
import {
  Ban,
  Search,
  AlertTriangle,
  CheckCircle2,
  Train,
  ArrowRight,
  Receipt,
  RotateCcw,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { railwayService } from '../../services/RailwayDataService.ts';
import { TicketReservation } from '../../models/Reservation.ts';
import { CancellationSlip } from '../../models/CancellationSlip.ts';

interface CancelReservationPageProps {
  initialPnr?: string;
  onViewTrain: (trainNumber: string) => void;
  onViewReservation: (pnr: string) => void;
}

export const CancelReservationPage: React.FC<CancelReservationPageProps> = ({
  initialPnr = '',
  onViewTrain,
  onViewReservation,
}) => {
  const [pnrInput, setPnrInput] = useState(initialPnr);
  const [reservation, setReservation] = useState<TicketReservation | null>(() => {
    if (initialPnr) {
      return railwayService.getReservationByPnr(initialPnr) || null;
    }
    // Pick the first confirmed reservation as a default preview
    return railwayService.getAllReservations().find(r => r.isConfirmed()) || null;
  });

  const [cancelReason, setCancelReason] = useState('Change of travel plan');
  const [cancellationResult, setCancellationResult] = useState<CancellationSlip | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setCancellationResult(null);

    if (!pnrInput.trim()) {
      setErrorMsg('Please enter a 10-digit Booking ID / PNR number.');
      return;
    }

    const found = railwayService.getReservationByPnr(pnrInput.trim());
    if (found) {
      setReservation(found);
    } else {
      setReservation(null);
      setErrorMsg(`No active ticket found for Booking ID / PNR "${pnrInput}".`);
    }
  };

  const handleConfirmCancel = async () => {
    if (!reservation) return;
    setErrorMsg('');
    setIsProcessing(true);

    try {
      const slip = await railwayService.cancelReservation(reservation.bookingId, cancelReason);
      setCancellationResult(slip);
      // Refresh reservation state
      const updated = railwayService.getReservationByPnr(reservation.bookingId);
      if (updated) setReservation(updated);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to cancel ticket.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Ticket Cancellation & Refund Processing</h2>
            <p className="text-xs text-slate-500">
              Cancel confirmed bookings, calculate cancellation fees according to railway rules, and release seats
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-rose-50 text-rose-800 border border-rose-200">
            Automated Seat Replenishment
          </span>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mt-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={pnrInput}
              onChange={e => setPnrInput(e.target.value)}
              placeholder="Enter Booking ID / 10-Digit PNR (e.g. 2489104821)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Find Booking
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success Cancellation Receipt Banner */}
      {cancellationResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-emerald-950 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>Ticket Cancelled Successfully · Refund Initiated</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-white/80 rounded-lg border border-emerald-200 text-xs font-medium">
            <div>
              <span className="text-slate-500 block text-[11px]">PNR / Booking ID:</span>
              <span className="font-mono font-bold text-slate-900">{cancellationResult.bookingId}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Cancellation Charge:</span>
              <span className="font-mono text-rose-700">₹{cancellationResult.cancellationFee}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Net Refund Amount:</span>
              <span className="font-mono font-bold text-emerald-800 text-sm">
                ₹{cancellationResult.refundAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Refund Transaction ID:</span>
              <span className="font-mono text-slate-800">{cancellationResult.refundReferenceId}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-emerald-800 text-[11px]">
              Seats allocated to this ticket have been restored to the train inventory.
            </span>
            {reservation && (
              <button
                onClick={() => onViewTrain(reservation.trainNumber)}
                className="font-semibold text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Check Updated Seats on Train {reservation.trainNumber}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active Reservation Summary Card */}
      {reservation && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {reservation.isDemo && (
            <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="font-semibold">DEMO RESERVATION NOTICE:</span>
                <span>This booking is simulated demo data. Cancelling will update local offline state only.</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300 shrink-0">
                OFFLINE DEMO
              </span>
            </div>
          )}

          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Booking Information
              </span>
              <span className="font-mono font-bold text-xs text-blue-900">
                PNR: {reservation.getFormattedPNR()}
              </span>
              {reservation.isDemo && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  DEMO TICKET
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {reservation.isConfirmed() ? (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {reservation.isDemo ? 'Demo Confirmed' : 'Confirmed'}
                </span>
              ) : (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                  Already Cancelled
                </span>
              )}
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Train & Journey Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pb-3 border-b border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Train</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">
                  {reservation.trainNumber} - {reservation.trainName}
                </div>
                <div className="text-slate-500">{reservation.trainType}</div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Route & Date</span>
                <div className="font-bold text-slate-900 mt-0.5">
                  {reservation.source} → {reservation.destination}
                </div>
                <div className="text-slate-500 font-mono">Date: {reservation.journeyDate}</div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Fare Paid</span>
                <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                  ₹{reservation.fareBreakdown.totalFare.toLocaleString('en-IN')}
                </div>
                <div className="text-slate-500">Class: {reservation.travelClass}</div>
              </div>
            </div>

            {/* Passengers on ticket */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Passengers on this Reservation ({reservation.passengers.length}):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {reservation.passengers.map((p, idx) => {
                  const alloc = reservation.seatAllocations[idx];
                  return (
                    <div
                      key={p.id}
                      className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 text-xs space-y-1"
                    >
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-slate-500 text-[11px]">
                        {p.age} Yrs · {p.gender}
                      </div>
                      <div className="text-blue-900 font-mono font-semibold text-[11px]">
                        Seat: {alloc?.coach || 'B2'}-{alloc?.berthNumber || 24 + idx} ({alloc?.berthType || 'Berth'})
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cancellation Action Box */}
            {reservation.isConfirmed() ? (
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Cancellation Surcharge Notice:</strong>
                    Standard railway deduction rules apply based on departure timing. The refund amount will be credited back to the original source.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-medium text-slate-700">Reason for Cancellation</label>
                    <select
                      value={cancelReason}
                      onChange={e => setCancelReason(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                    >
                      <option value="Change of travel plan">Change of travel plan</option>
                      <option value="Meeting rescheduled / postponed">Meeting rescheduled / postponed</option>
                      <option value="Booked another train/date">Booked another train/date</option>
                      <option value="Medical / Personal emergency">Medical / Personal emergency</option>
                      <option value="Train delay / schedule conflict">Train delay / schedule conflict</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-slate-700">Estimated Refund Amount</label>
                    <div className="px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 font-mono font-bold text-emerald-800 text-sm">
                      ≈ ₹{Math.max(0, reservation.fareBreakdown.totalFare - Math.min(reservation.fareBreakdown.totalFare, Math.max(120, Math.round(reservation.fareBreakdown.totalFare * 0.15)))).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => onViewReservation(reservation.bookingId)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Keep Ticket & View
                  </button>

                  <button
                    onClick={handleConfirmCancel}
                    disabled={isProcessing}
                    className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Ban className="w-4 h-4" />
                    <span>{isProcessing ? 'Cancelling...' : 'Confirm Cancellation & Refund'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  This reservation has already been cancelled. Refund reference is recorded on file.
                </span>
                <button
                  onClick={() => onViewReservation(reservation.bookingId)}
                  className="font-semibold text-blue-900 hover:underline cursor-pointer"
                >
                  View Cancellation Slip
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
