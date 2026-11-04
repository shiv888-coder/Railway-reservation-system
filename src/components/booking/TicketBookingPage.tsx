import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Train,
  Users,
  Calendar,
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { railwayService, BookingRequest } from '../../services/RailwayDataService.ts';
import { CoachClass, Gender, IdProofType, BerthPreference } from '../../types/index.ts';
import { Passenger } from '../../models/Passenger.ts';
import { TicketReservation } from '../../models/Reservation.ts';

interface TicketBookingPageProps {
  preselectedTrainNumber?: string;
  preselectedClass?: CoachClass;
  preselectedPassenger?: Passenger | null;
  onBookingSuccess: (reservation: TicketReservation) => void;
}

interface PassengerFormState {
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email: string;
  idProofType: IdProofType;
  idProofNumber: string;
  berthPreference: BerthPreference;
}

export const TicketBookingPage: React.FC<TicketBookingPageProps> = ({
  preselectedTrainNumber = '12301',
  preselectedClass,
  preselectedPassenger,
  onBookingSuccess,
}) => {
  const allTrains = railwayService.getAllTrains();
  const savedPassengers = railwayService.getPassengers();

  const [selectedTrainNumber, setSelectedTrainNumber] = useState(preselectedTrainNumber);
  const currentTrain = railwayService.getTrainByNumber(selectedTrainNumber) || allTrains[0];

  const [journeyDate, setJourneyDate] = useState('2026-11-15');
  const [selectedClass, setSelectedClass] = useState<CoachClass>(
    preselectedClass || currentTrain.classesAvailable[0] || '3A'
  );

  // Synchronize available classes when train changes
  useEffect(() => {
    if (currentTrain && !currentTrain.classesAvailable.includes(selectedClass)) {
      setSelectedClass(currentTrain.classesAvailable[0] || '3A');
    }
  }, [selectedTrainNumber, currentTrain]);

  // Passengers list (1 to 6)
  const [passengers, setPassengers] = useState<PassengerFormState[]>(() => {
    if (preselectedPassenger) {
      return [
        {
          name: preselectedPassenger.name,
          age: preselectedPassenger.age,
          gender: preselectedPassenger.gender,
          phone: preselectedPassenger.phone,
          email: preselectedPassenger.email,
          idProofType: preselectedPassenger.idProofType,
          idProofNumber: preselectedPassenger.idProofNumber,
          berthPreference: preselectedPassenger.berthPreference || 'No Preference',
        },
      ];
    }
    return [
      {
        name: 'Shiv Shankar Mal',
        age: 21,
        gender: 'Male',
        phone: '+91 98765 43210',
        email: 'shiv.cse@lab.edu',
        idProofType: 'Aadhaar Card',
        idProofNumber: '7829-4412-9081',
        berthPreference: 'Lower',
      },
    ];
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate live fare through polymorphic method
  const seniorCount = passengers.filter(p => p.age >= 60).length;
  const fareBreakdown = currentTrain.calculateFare(selectedClass, passengers.length, seniorCount);
  const availableSeats = currentTrain.getAvailableSeats(selectedClass);

  const handleAddPassenger = () => {
    if (passengers.length >= 6) {
      setErrorMessage('Maximum 6 passengers allowed per reservation ticket.');
      return;
    }
    setPassengers(prev => [
      ...prev,
      {
        name: '',
        age: 28,
        gender: 'Male',
        phone: prev[0]?.phone || '+91 ',
        email: prev[0]?.email || '',
        idProofType: 'Aadhaar Card',
        idProofNumber: '',
        berthPreference: 'No Preference',
      },
    ]);
  };

  const handleRemovePassenger = (index: number) => {
    if (passengers.length <= 1) {
      setErrorMessage('At least one passenger is required to book.');
      return;
    }
    setPassengers(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdatePassenger = <K extends keyof PassengerFormState>(
    index: number,
    field: K,
    value: PassengerFormState[K]
  ) => {
    setPassengers(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAutofillPassenger = (index: number, passengerId: string) => {
    const found = savedPassengers.find(p => p.id === passengerId);
    if (!found) return;
    setPassengers(prev => {
      const copy = [...prev];
      copy[index] = {
        name: found.name,
        age: found.age,
        gender: found.gender,
        phone: found.phone,
        email: found.email,
        idProofType: found.idProofType,
        idProofNumber: found.idProofNumber,
        berthPreference: found.berthPreference || 'No Preference',
      };
      return copy;
    });
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (availableSeats < passengers.length) {
      setErrorMessage(`Only ${availableSeats} seats available in ${selectedClass} class.`);
      return;
    }

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name.trim() || p.name.trim().length < 2) {
        setErrorMessage(`Please enter a valid name for Passenger #${i + 1}.`);
        return;
      }
      if (!p.phone.trim() || p.phone.trim().length < 8) {
        setErrorMessage(`Please enter a valid phone number for Passenger #${i + 1}.`);
        return;
      }
      if (!p.idProofNumber.trim()) {
        setErrorMessage(`Please enter ID proof details for Passenger #${i + 1}.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const bookingPayload: BookingRequest = {
        trainNumber: currentTrain.trainNumber,
        journeyDate,
        travelClass: selectedClass,
        passengers: passengers.map(p => ({
          name: p.name.trim(),
          age: Number(p.age),
          gender: p.gender,
          phone: p.phone.trim(),
          email: p.email.trim(),
          idProofType: p.idProofType,
          idProofNumber: p.idProofNumber.trim(),
          berthPreference: p.berthPreference,
        })),
      };

      const newReservation = await railwayService.bookTicket(bookingPayload);
      onBookingSuccess(newReservation);
    } catch (err: any) {
      setErrorMessage(err.message || 'Booking failed.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Ticket Reservation Booking</h2>
            <p className="text-xs text-slate-500">
              Enter passenger details, select coach category, and generate instant e-ticket
            </p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded font-mono ${
            railwayService.isBackendOnline
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-amber-100 text-amber-900 border border-amber-300'
          }`}>
            {railwayService.isBackendOnline ? 'Spring Boot REST API' : 'Demo Mode (Local Fallback)'}
          </span>
        </div>
      </div>

      {/* Academic Safety Banner */}
      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            <strong>Academic Simulation Notice:</strong> This reservation form demonstrates Java OOP seat allocation and tariff calculation for college evaluation. No real payment or official IRCTC ticket is issued.
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-blue-200/80 text-blue-900 font-bold uppercase text-[10px] shrink-0">
          DEMO RESERVATION
        </span>
      </div>
      {!railwayService.isBackendOnline && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-950 font-bold uppercase text-[10px]">
              DEMO NOTICE
            </span>
            <span>
              Spring Boot backend is offline at <code className="font-mono">{railwayService.backendUrl}</code>. Bookings made now will be saved as <strong>SIMULATED DEMO DATA</strong> and not stored in MySQL.
            </span>
          </div>
          <span className="text-[10px] text-amber-700 font-medium whitespace-nowrap hidden sm:inline">
            Run: mvn spring-boot:run
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Train & Passengers Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Section 1: Train & Journey Configuration */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Train className="w-4 h-4 text-blue-900" />
              <span>1. Train & Route Selection</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-slate-700">Train *</label>
                <select
                  value={selectedTrainNumber}
                  onChange={e => setSelectedTrainNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-blue-600 focus:bg-white"
                >
                  {allTrains.map(t => (
                    <option key={t.trainNumber} value={t.trainNumber}>
                      {t.trainNumber} - {t.trainName} ({t.source} → {t.destination})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-700">Journey Date *</label>
                <input
                  type="date"
                  required
                  value={journeyDate}
                  onChange={e => setJourneyDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Train Route Summary Box */}
            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-blue-950 text-sm">{currentTrain.trainNumber}</span>
                <div>
                  <div className="font-bold text-slate-900">{currentTrain.trainName}</div>
                  <div className="text-[11px] text-slate-500">
                    {currentTrain.sourceStationName} ({currentTrain.departureTime}) → {currentTrain.destinationStationName} ({currentTrain.arrivalTime})
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200">
                  {currentTrain.trainType}
                </span>
                <div className="text-[10px] text-slate-500 mt-0.5">{currentTrain.durationHours} Duration</div>
              </div>
            </div>

            {/* Travel Class Selector */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-medium text-slate-700">Select Travel Class *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {currentTrain.classesAvailable.map(cls => {
                  const seats = currentTrain.getAvailableSeats(cls);
                  const isSelected = selectedClass === cls;
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setSelectedClass(cls)}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-900 bg-blue-900 text-white shadow-xs font-semibold'
                          : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>{cls} Class</span>
                        <span className={isSelected ? 'text-blue-200' : 'text-slate-500'}>
                          ₹{currentTrain.baseFares[cls]}
                        </span>
                      </div>
                      <div className={`mt-1 text-[11px] ${isSelected ? 'text-blue-100' : 'text-emerald-700 font-medium'}`}>
                        {seats > 0 ? `AVL: ${seats} Seats` : 'Waitlist'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Passenger Details (Supports 1-6) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-900" />
                <span>2. Passenger Details ({passengers.length} of 6 max)</span>
              </h3>

              <button
                type="button"
                onClick={handleAddPassenger}
                disabled={passengers.length >= 6}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-blue-50 text-blue-950 font-semibold text-xs rounded-lg transition-colors border border-slate-200 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Passenger</span>
              </button>
            </div>

            <div className="space-y-4">
              {passengers.map((passenger, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 relative space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-[10px]">
                        {index + 1}
                      </span>
                      <span>Passenger {index + 1}</span>
                      {passenger.age >= 60 && (
                        <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-200">
                          Senior Citizen (Concession Applied)
                        </span>
                      )}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Autofill helper */}
                      {savedPassengers.length > 0 && (
                        <select
                          onChange={e => handleAutofillPassenger(index, e.target.value)}
                          defaultValue=""
                          className="px-2 py-1 text-[11px] bg-white border border-slate-200 rounded text-slate-600 focus:outline-none"
                        >
                          <option value="" disabled>
                            Autofill saved profile...
                          </option>
                          {savedPassengers.map(sp => (
                            <option key={sp.id} value={sp.id}>
                              {sp.name} ({sp.age}y)
                            </option>
                          ))}
                        </select>
                      )}

                      {passengers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePassenger(index)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove Passenger"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Passenger Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-medium text-slate-700">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={passenger.name}
                        onChange={e => handleUpdatePassenger(index, 'name', e.target.value)}
                        placeholder="e.g. Shiv Shankar Mal"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-medium text-slate-700">Age *</label>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        required
                        value={passenger.age}
                        onChange={e => handleUpdatePassenger(index, 'age', Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-medium text-slate-700">Gender *</label>
                      <select
                        value={passenger.gender}
                        onChange={e => handleUpdatePassenger(index, 'gender', e.target.value as Gender)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Transgender">Transgender</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-medium text-slate-700">Phone Number *</label>
                      <input
                        type="text"
                        required
                        value={passenger.phone}
                        onChange={e => handleUpdatePassenger(index, 'phone', e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-medium text-slate-700">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={passenger.email}
                        onChange={e => handleUpdatePassenger(index, 'email', e.target.value)}
                        placeholder="passenger@domain.com"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-medium text-slate-700">ID Proof Type *</label>
                      <select
                        value={passenger.idProofType}
                        onChange={e =>
                          handleUpdatePassenger(index, 'idProofType', e.target.value as IdProofType)
                        }
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        <option value="Aadhaar Card">Aadhaar Card</option>
                        <option value="PAN Card">PAN Card</option>
                        <option value="Passport">Passport</option>
                        <option value="Voter ID">Voter ID</option>
                        <option value="Driving License">Driving License</option>
                        <option value="Student ID">Student ID</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-medium text-slate-700">ID Number *</label>
                      <input
                        type="text"
                        required
                        value={passenger.idProofNumber}
                        onChange={e => handleUpdatePassenger(index, 'idProofNumber', e.target.value)}
                        placeholder="e.g. 7829-4412-9081"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-medium text-slate-700">Berth Preference</label>
                      <select
                        value={passenger.berthPreference}
                        onChange={e =>
                          handleUpdatePassenger(index, 'berthPreference', e.target.value as BerthPreference)
                        }
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        <option value="No Preference">No Preference</option>
                        <option value="Lower">Lower Berth</option>
                        <option value="Middle">Middle Berth</option>
                        <option value="Upper">Upper Berth</option>
                        <option value="Side Lower">Side Lower</option>
                        <option value="Side Upper">Side Upper</option>
                        <option value="Window Seat">Window Seat</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Fare Summary & Confirm Button */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Fare & Reservation Breakdown</span>
              <span className="text-blue-900 font-mono">
                {passengers.length} {passengers.length === 1 ? 'Seat' : 'Seats'}
              </span>
            </h3>

            {/* Itemized Fare Statement */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>
                  Base Fare ({passengers.length} × ₹{currentTrain.baseFares[selectedClass]}):
                </span>
                <span className="font-mono text-slate-900 tabular-nums">
                  ₹{fareBreakdown.baseFare.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Reservation Charges:</span>
                <span className="font-mono text-slate-900 tabular-nums">
                  ₹{fareBreakdown.reservationCharge}
                </span>
              </div>

              {fareBreakdown.superfastCharge > 0 && (
                <div className="flex items-center justify-between text-slate-600">
                  <span>Superfast Train Surcharge:</span>
                  <span className="font-mono text-slate-900 tabular-nums">
                    ₹{fareBreakdown.superfastCharge}
                  </span>
                </div>
              )}

              {fareBreakdown.cateringCharge > 0 && (
                <div className="flex items-center justify-between text-slate-600">
                  <span>Included Premier Catering:</span>
                  <span className="font-mono text-slate-900 tabular-nums">
                    ₹{fareBreakdown.cateringCharge}
                  </span>
                </div>
              )}

              {fareBreakdown.seniorDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-800 font-medium">
                  <span>Senior Citizen Concession ({seniorCount}):</span>
                  <span className="font-mono tabular-nums">
                    -₹{fareBreakdown.seniorDiscount}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600">
                <span>GST (5% AC Transport):</span>
                <span className="font-mono text-slate-900 tabular-nums">
                  ₹{fareBreakdown.gst}
                </span>
              </div>

              {/* Total Fare Line */}
              <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900">Total Payable:</span>
                  <p className="text-[10px] text-slate-400">All taxes & fees inclusive</p>
                </div>
                <div className="text-2xl font-extrabold font-mono text-blue-950 tabular-nums">
                  ₹{fareBreakdown.totalFare.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Seat Availability Warning / Alert */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center justify-between font-semibold text-slate-800">
                <span>Seat Inventory Status:</span>
                <span className="text-emerald-700">{availableSeats} Seats Available</span>
              </div>
              <p className="text-slate-500">
                Coaches & berths will be automatically assigned upon confirmation according to railway allocation algorithms.
              </p>
            </div>

            {/* Confirm Booking CTA */}
            <button
              type="submit"
              disabled={isSubmitting || availableSeats < passengers.length}
              className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isSubmitting ? 'Confirming Ticket...' : 'Confirm Ticket Reservation'}</span>
            </button>

            <div className="text-[11px] text-center text-slate-400">
              Third-year B.Tech CSE OOP Mini Project demonstration. No actual bank charge.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
