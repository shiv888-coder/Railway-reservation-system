import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  ShieldCheck,
  Edit2,
  Trash2,
  Check,
  X,
  CreditCard,
  UserCheck,
  Ticket,
} from 'lucide-react';
import { railwayService } from '../../services/RailwayDataService.ts';
import { Passenger } from '../../models/Passenger.ts';
import { Gender, IdProofType, BerthPreference, PassengerData } from '../../types/index.ts';

interface PassengerInfoPageProps {
  onBookWithPassenger: (passenger: Passenger) => void;
}

export const PassengerInfoPage: React.FC<PassengerInfoPageProps> = ({ onBookWithPassenger }) => {
  const [passengers, setPassengers] = useState<Passenger[]>(() => railwayService.getPassengers());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<Gender>('Male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [idProofType, setIdProofType] = useState<IdProofType>('Aadhaar Card');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [berthPreference, setBerthPreference] = useState<BerthPreference>('No Preference');
  const [formError, setFormError] = useState('');

  const refreshList = () => {
    setPassengers(railwayService.getPassengers());
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setAge(25);
    setGender('Male');
    setPhone('+91 ');
    setEmail('');
    setIdProofType('Aadhaar Card');
    setIdProofNumber('');
    setBerthPreference('No Preference');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Passenger) => {
    setEditingId(p.id);
    setName(p.name);
    setAge(p.age);
    setGender(p.gender);
    setPhone(p.phone);
    setEmail(p.email);
    setIdProofType(p.idProofType);
    setIdProofNumber(p.idProofNumber);
    setBerthPreference(p.berthPreference || 'No Preference');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await railwayService.deletePassenger(id);
    refreshList();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim() || name.trim().length < 2) {
      setFormError('Please enter a valid passenger name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setFormError('Please enter a valid contact phone number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!idProofNumber.trim()) {
      setFormError('Please provide an official ID card / document number.');
      return;
    }

    try {
      const pData: PassengerData = {
        id: editingId || `pass_${Date.now()}`,
        name: name.trim(),
        age: Number(age),
        gender,
        phone: phone.trim(),
        email: email.trim(),
        idProofType,
        idProofNumber: idProofNumber.trim(),
        berthPreference,
      };

      await railwayService.savePassenger(pData);
      refreshList();
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Error saving passenger record.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Passenger Directory & Profile Central</h2>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                railwayService.isBackendOnline
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {railwayService.isBackendOnline ? 'Synced with MySQL' : 'Demo Mode (Local)'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Stored passenger records, verified government identity credentials, and concession flags
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Passenger</span>
        </button>
      </div>

      {/* Passenger Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {passengers.map(p => {
          const isSenior = p.isSeniorCitizen();
          return (
            <div
              key={p.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-200 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-900 font-bold flex items-center justify-center text-sm border border-blue-200/60">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{p.name}</h3>
                      <div className="text-[11px] text-slate-500">
                        {p.gender} · {p.age} years
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 rounded text-slate-400 hover:text-blue-900 hover:bg-slate-100 transition-colors"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      title="Delete Profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-3.5 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-slate-800">{p.phone}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-800">{p.email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {p.idProofType}: <strong className="font-mono text-slate-800">{p.getMaskedIdProof()}</strong>
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Berth Preference:</span>
                    <span className="font-medium text-slate-700">{p.berthPreference}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Senior Citizen:</span>
                    {isSenior ? (
                      <span className="font-semibold text-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-700" />
                        Eligible for 40% Concession
                      </span>
                    ) : (
                      <span className="text-slate-400">Regular Category</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onBookWithPassenger(p)}
                className="mt-4 w-full py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Book Ticket For {p.name.split(' ')[0]}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Passenger Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 w-full max-w-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Users className="w-4 h-4 text-blue-400" />
                <span>{editingId ? 'Edit Passenger Profile' : 'Add New Passenger Record'}</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-medium text-slate-700">Full Passenger Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Shiv Shankar Mal"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Age (Years) *</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    required
                    value={age}
                    onChange={e => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  {age >= 60 && (
                    <p className="text-[10px] text-emerald-800 font-medium">
                      ✓ Qualifies for Senior Citizen concession
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Gender *</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as Gender)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Transgender">Transgender</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Mobile Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="passenger@domain.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-slate-700">Identity Proof Type *</label>
                  <select
                    value={idProofType}
                    onChange={e => setIdProofType(e.target.value as IdProofType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
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
                  <label className="font-medium text-slate-700">ID Card / Document Number *</label>
                  <input
                    type="text"
                    required
                    value={idProofNumber}
                    onChange={e => setIdProofNumber(e.target.value)}
                    placeholder="e.g. 7829-4412-9081"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-medium text-slate-700">Berth / Seat Preference</label>
                  <select
                    value={berthPreference}
                    onChange={e => setBerthPreference(e.target.value as BerthPreference)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="No Preference">No Preference</option>
                    <option value="Lower">Lower Berth</option>
                    <option value="Middle">Middle Berth</option>
                    <option value="Upper">Upper Berth</option>
                    <option value="Side Lower">Side Lower</option>
                    <option value="Side Upper">Side Upper</option>
                    <option value="Window Seat">Window Seat (Chair Car)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors"
                >
                  {editingId ? 'Update Record' : 'Save Passenger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
