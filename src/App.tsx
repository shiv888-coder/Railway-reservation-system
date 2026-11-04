/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ProjectBadge } from './components/layout/ProjectBadge.tsx';
import { Sidebar, NavPage } from './components/layout/Sidebar.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { DashboardPage } from './components/dashboard/DashboardPage.tsx';
import { SearchTrainsPage } from './components/search/SearchTrainsPage.tsx';
import { TrainDetailsPage } from './components/trains/TrainDetailsPage.tsx';
import { TrainDirectoryPage } from './components/directory/TrainDirectoryPage.tsx';
import { PassengerInfoPage } from './components/passengers/PassengerInfoPage.tsx';
import { TicketBookingPage } from './components/booking/TicketBookingPage.tsx';
import { ReservationDetailsPage } from './components/reservations/ReservationDetailsPage.tsx';
import { CancelReservationPage } from './components/cancellation/CancelReservationPage.tsx';
import { OOPArchitecturePage } from './components/oop/OOPArchitecturePage.tsx';
import { railwayService } from './services/RailwayDataService.ts';
import { CoachClass } from './types/index.ts';
import { Passenger } from './models/Passenger.ts';
import { TicketReservation } from './models/Reservation.ts';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cross-page navigation state
  const [selectedTrainNumber, setSelectedTrainNumber] = useState<string>('12301');
  const [bookingClass, setBookingClass] = useState<CoachClass | undefined>(undefined);
  const [bookingPassenger, setBookingPassenger] = useState<Passenger | null>(null);
  const [activePnr, setActivePnr] = useState<string>('');

  // Subscribe to RailwayDataService updates
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsubscribe = railwayService.subscribe(() => {
      setTick(prev => prev + 1);
    });
    return unsubscribe;
  }, []);

  // Handlers for cross-page navigation
  const handleSelectTrainForDetails = (trainNumber: string) => {
    setSelectedTrainNumber(trainNumber);
    setCurrentPage('train-details');
  };

  const handleBookTrain = (trainNumber: string, travelClass?: CoachClass) => {
    setSelectedTrainNumber(trainNumber);
    setBookingClass(travelClass);
    setBookingPassenger(null);
    setCurrentPage('booking');
  };

  const handleBookWithPassenger = (passenger: Passenger) => {
    setBookingPassenger(passenger);
    setCurrentPage('booking');
  };

  const handleViewReservation = (pnr: string) => {
    setActivePnr(pnr);
    setCurrentPage('reservations');
  };

  const handleInitiateCancel = (pnr: string) => {
    setActivePnr(pnr);
    setCurrentPage('cancellation');
  };

  const handleBookingSuccess = (reservation: TicketReservation) => {
    setActivePnr(reservation.bookingId);
    setCurrentPage('reservations');
  };

  const handleResetData = () => {
    railwayService.resetToDefaults();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Academic Project Banner */}
      <ProjectBadge onOpenOOPModal={() => setCurrentPage('oop-docs')} />

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={page => setCurrentPage(page)}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onResetData={handleResetData}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
          {/* Top Navbar */}
          <Navbar
            currentPage={currentPage}
            onNavigate={page => setCurrentPage(page)}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onSearchPnr={pnr => {
              setActivePnr(pnr);
              setCurrentPage('reservations');
            }}
          />

          {/* Page Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {currentPage === 'dashboard' && (
              <DashboardPage
                onNavigate={setCurrentPage}
                onSelectTrainForDetails={handleSelectTrainForDetails}
                onViewReservation={handleViewReservation}
                onInitiateCancel={handleInitiateCancel}
                onPrefillBooking={handleBookTrain}
              />
            )}

            {currentPage === 'search' && (
              <SearchTrainsPage
                onSelectTrainForDetails={handleSelectTrainForDetails}
                onBookTrain={handleBookTrain}
              />
            )}

            {currentPage === 'train-details' && (
              <TrainDetailsPage
                selectedTrainNumber={selectedTrainNumber}
                onBookTrain={handleBookTrain}
                onSelectTrainNumber={setSelectedTrainNumber}
              />
            )}

            {currentPage === 'directory' && (
              <TrainDirectoryPage
                onSelectTrainForDetails={handleSelectTrainForDetails}
                onBookTrain={handleBookTrain}
              />
            )}

            {currentPage === 'passengers' && (
              <PassengerInfoPage onBookWithPassenger={handleBookWithPassenger} />
            )}

            {currentPage === 'booking' && (
              <TicketBookingPage
                preselectedTrainNumber={selectedTrainNumber}
                preselectedClass={bookingClass}
                preselectedPassenger={bookingPassenger}
                onBookingSuccess={handleBookingSuccess}
              />
            )}

            {currentPage === 'reservations' && (
              <ReservationDetailsPage
                initialPnr={activePnr}
                onInitiateCancel={handleInitiateCancel}
                onBookNew={() => setCurrentPage('booking')}
              />
            )}

            {currentPage === 'cancellation' && (
              <CancelReservationPage
                initialPnr={activePnr}
                onViewTrain={handleSelectTrainForDetails}
                onViewReservation={handleViewReservation}
              />
            )}

            {currentPage === 'oop-docs' && <OOPArchitecturePage />}
          </main>

          {/* Footer */}
          <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">Railway Reservation System</span>
                <span>·</span>
                <span>Object Oriented Programming Mini Project</span>
              </div>
              <div className="text-slate-400">
                Designed & Developed by <strong className="text-slate-700">Shiv Shankar Mal</strong> · Group 9 (Roll: 2760012408)
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
