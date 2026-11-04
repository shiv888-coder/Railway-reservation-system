import React, { useState } from 'react';
import { Menu, Plus, Search, Server, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { NavPage } from './Sidebar.tsx';
import { railwayService } from '../../services/RailwayDataService.ts';

interface NavbarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  onOpenMobileMenu: () => void;
  onSearchPnr: (pnr: string) => void;
}

const PAGE_TITLES: Record<NavPage, { title: string; subtitle: string }> = {
  dashboard: { title: 'Operational Dashboard', subtitle: 'Live railway network and booking metrics' },
  search: { title: 'Search Trains', subtitle: 'Find connecting schedules and check seat availability' },
  'train-details': { title: 'Train Timetable & Details', subtitle: 'Route halts, coach composition and class fares' },
  passengers: { title: 'Passenger Information', subtitle: 'Passenger profiles and identity proofs directory' },
  booking: { title: 'Ticket Reservation Booking', subtitle: 'Multi-passenger booking and automated fare calculation' },
  reservations: { title: 'Reservation Details', subtitle: 'PNR status inquiry and authentic digital e-ticket' },
  cancellation: { title: 'Ticket Cancellation & Refund', subtitle: 'Process cancellation and instant seat replenishment' },
  directory: { title: 'Train & Station Directory', subtitle: 'Search stations, routes, and explore Indian Railways premier fleet' },
  'oop-docs': { title: 'OOP Architecture & Models', subtitle: 'Encapsulation, Inheritance, Polymorphism and Spring Boot design' },
};

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenMobileMenu,
  onSearchPnr,
}) => {
  const [quickPnr, setQuickPnr] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [showStatusDetails, setShowStatusDetails] = useState(false);

  const isOnline = railwayService.isBackendOnline;
  const isChecking = railwayService.isCheckingBackend || isRetrying;

  const handleQuickPnrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickPnr.trim()) {
      onSearchPnr(quickPnr.trim());
      setQuickPnr('');
      onNavigate('reservations');
    }
  };

  const handleRetryConnection = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRetrying(true);
    try {
      await railwayService.probeAndSyncBackend();
    } finally {
      setIsRetrying(false);
    }
  };

  const currentInfo = PAGE_TITLES[currentPage] || PAGE_TITLES.dashboard;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-3 md:gap-6">
        {/* Zone 1: Mobile toggle & Context Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0 shrink">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="hidden sm:inline">Railway Reservation System</span>
              <span className="hidden sm:inline" aria-hidden="true">/</span>
              <span className="text-blue-900 font-semibold">{currentInfo.title}</span>
            </div>
            <p className="text-xs text-slate-500 truncate hidden md:block">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Zone 2: PNR Quick Lookup Bar */}
        <form
          onSubmit={handleQuickPnrSubmit}
          className="hidden md:flex items-center relative w-48 lg:w-56"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={quickPnr}
            onChange={e => setQuickPnr(e.target.value)}
            placeholder="Quick PNR Lookup..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-mono"
            maxLength={11}
          />
        </form>

        {/* Zone 3: Backend Status & Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Spring Boot Backend Status Pill */}
          <div className="relative">
            <div
              className={`flex items-center rounded-lg text-xs font-medium border transition-all ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setShowStatusDetails(prev => !prev)}
                title="Click for Spring Boot connection details"
                className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-black/5 rounded-l-lg cursor-pointer transition-colors"
              >
                {isOnline ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                    </span>
                    <Server className="w-3.5 h-3.5 text-emerald-700 hidden sm:inline" />
                    <span className="hidden sm:inline">Spring Boot:</span>
                    <span className="font-semibold text-emerald-900">Connected</span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0"></span>
                    <Server className="w-3.5 h-3.5 text-amber-700 hidden sm:inline" />
                    <span className="hidden sm:inline">Backend:</span>
                    <span className="font-semibold text-amber-900">Demo Mode</span>
                  </>
                )}
              </button>

              <div className={`w-[1px] h-4 self-center ${isOnline ? 'bg-emerald-200' : 'bg-amber-200'}`} />

              <button
                type="button"
                onClick={handleRetryConnection}
                disabled={isChecking}
                className="px-2 py-1.5 rounded-r-lg hover:bg-black/5 text-inherit transition-all active:rotate-180 disabled:opacity-50 cursor-pointer"
                title="Probe & Sync with Spring Boot Backend"
              >
                <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>

            {/* Connection Info Popover */}
            {showStatusDetails && (
              <div
                className="absolute right-0 mt-2 w-72 p-3 bg-white border border-slate-200 rounded-xl shadow-lg text-xs z-50 text-slate-700 space-y-2 animate-in fade-in"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-semibold text-slate-900">
                  <span className="flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-blue-900" />
                    Java Backend Integration
                  </span>
                  <button
                    onClick={() => setShowStatusDetails(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target REST URL:</span>
                    <span className="font-mono text-slate-800 font-medium">{railwayService.backendUrl}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Framework:</span>
                    <span className="font-medium text-slate-800">Java 17 + Spring Boot 3.2.4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Database:</span>
                    <span className="font-medium text-slate-800">MySQL 8 (railway_db)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Status:</span>
                    <span className={`px-1.5 py-0.5 rounded font-medium text-[10px] ${
                      isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isOnline ? 'LIVE API SYNCHRONIZED' : 'OFFLINE (LOCAL OOP FALLBACK)'}
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded bg-slate-50 border border-slate-100 text-[10px] text-slate-600 leading-relaxed">
                  {isOnline ? (
                    <span className="text-emerald-700 font-medium">
                      ✓ Connected! Real-time bookings, cancellations, and fare calculations are executed via Spring Boot REST controllers.
                    </span>
                  ) : (
                    <span>
                      Spring Boot backend at <code>http://localhost:8080</code> is not running. To start:
                      <code className="block mt-1 p-1 bg-slate-200/70 rounded font-mono text-[9px] text-slate-800 select-all">
                        cd railway-backend && mvn spring-boot:run
                      </code>
                    </span>
                  )}
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    onClick={handleRetryConnection}
                    disabled={isChecking}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-900 text-white font-medium hover:bg-blue-800 transition-colors disabled:opacity-50 text-[11px]"
                  >
                    <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                    <span>{isChecking ? 'Probing...' : 'Re-check Server'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => onNavigate('booking')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Book Ticket</span>
          </button>
        </div>
      </div>
    </header>
  );
};
