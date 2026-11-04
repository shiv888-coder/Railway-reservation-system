import React from 'react';
import {
  LayoutDashboard,
  Search,
  Train,
  Users,
  Ticket,
  FileText,
  Ban,
  Cpu,
  RefreshCw,
  X,
  ChevronRight,
  Compass,
} from 'lucide-react';

export type NavPage =
  | 'dashboard'
  | 'search'
  | 'train-details'
  | 'directory'
  | 'passengers'
  | 'booking'
  | 'reservations'
  | 'cancellation'
  | 'oop-docs';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onResetData: () => void;
}

interface NavItem {
  id: NavPage;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & Train Stats' },
  { id: 'search', label: 'Search Trains', icon: Search, description: 'Find Trains & Check Seats' },
  { id: 'train-details', label: 'Train Details', icon: Train, description: 'Schedules, Halts & Fares' },
  { id: 'directory', label: 'Trains & Stations', icon: Compass, description: 'National Directory & Fleets' },
  { id: 'passengers', label: 'Passenger Info', icon: Users, description: 'Directory & ID Profiles' },
  { id: 'booking', label: 'Ticket Booking', icon: Ticket, description: 'Reserve Seats & Calculate Fare' },
  { id: 'reservations', label: 'Reservation Details', icon: FileText, description: 'PNR Status & E-Ticket' },
  { id: 'cancellation', label: 'Cancel Reservation', icon: Ban, description: 'Ticket Cancellation & Refund' },
  { id: 'oop-docs', label: 'OOP Architecture', icon: Cpu, description: 'Classes, Polymorphism & Design' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  onResetData,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0a192f] text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-900/40">
              <Train className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-snug">
                RailReserve
              </h1>
              <p className="text-[11px] text-blue-300 font-medium tracking-wide">
                Railway Reservation System
              </p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Main Navigation
          </div>

          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-800/40 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.label}</div>
                  <div
                    className={`text-[11px] truncate font-normal ${
                      isActive ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-blue-200 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Student Mini Project Info Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#071324] text-xs space-y-2">
          <div className="rounded bg-slate-900/90 p-2.5 border border-slate-800">
            <div className="text-[10px] uppercase font-semibold text-blue-400 tracking-wider">
              CSE Mini Project
            </div>
            <div className="text-white font-medium truncate mt-0.5">Shiv Shankar Mal</div>
            <div className="text-slate-400 text-[11px] flex items-center justify-between mt-0.5">
              <span>Group 9</span>
              <span className="font-mono">Roll: 2760012408</span>
            </div>
          </div>

          <button
            onClick={onResetData}
            title="Reset initial railway demonstration records"
            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 text-[11px] rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors border border-slate-800 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>
    </>
  );
};
