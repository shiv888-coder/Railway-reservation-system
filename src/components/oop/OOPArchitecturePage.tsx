import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  Layers,
  Code2,
  Box,
  Share2,
  Play,
  Database,
  CheckCircle2,
  Cpu,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import { railwayService } from '../../services/RailwayDataService.ts';
import { CoachClass } from '../../types/index.ts';

export const OOPArchitecturePage: React.FC = () => {
  // Live Polymorphic Fare Simulator state
  const [simDistance, setSimDistance] = useState<number>(1200);
  const [simClass, setSimClass] = useState<CoachClass>('3A');
  const [simPassengers, setSimPassengers] = useState<number>(2);
  const [simSeniors, setSimSeniors] = useState<number>(1);

  // Train instances for testing
  const trains = railwayService.getAllTrains();
  const rajdhani = trains.find(t => t.trainType === 'Rajdhani') || trains[0];
  const vandeBharat = trains.find(t => t.trainType === 'Vande Bharat') || trains[1];
  const superfast = trains.find(t => t.trainType === 'Superfast') || trains[2];

  const rajdhaniFare = rajdhani.calculateFare(simClass, simPassengers, simSeniors);
  const vandeFare = vandeBharat.calculateFare(
    simClass === '3A' || simClass === '2A' || simClass === '1A' ? 'CC' : simClass,
    simPassengers,
    simSeniors
  );
  const superfastFare = superfast.calculateFare(simClass, simPassengers, simSeniors);

  return (
    <div className="space-y-6">
      {/* Academic Credentials Hero Banner */}
      <div className="bg-gradient-to-r from-[#0b192c] via-[#0f2851] to-[#1e3a8a] text-white rounded-xl p-6 shadow-md border border-blue-900/40">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 uppercase tracking-widest">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>Department of Computer Science & Engineering</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Railway Reservation System · OOP Mini Project
            </h2>
            <p className="text-xs text-slate-200 leading-relaxed">
              Third-Year B.Tech CSE Mini Project showcasing core Object-Oriented Programming (OOP) paradigms, clean design patterns, and Spring Boot 3.2.4 & MySQL 8 data-access architecture.
            </p>
          </div>

          {/* Student Profile Card */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-blue-700/50 shadow-inner text-xs space-y-2 min-w-[240px]">
            <div className="text-[10px] uppercase font-bold text-blue-400 tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Student Profile</span>
            </div>
            <div className="space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span>Student Name:</span>
                <strong className="text-white font-medium">Shiv Shankar Mal</strong>
              </div>
              <div className="flex justify-between">
                <span>Group Number:</span>
                <strong className="text-white font-medium">Group 9</strong>
              </div>
              <div className="flex justify-between">
                <span>Roll Number:</span>
                <strong className="text-white font-mono font-medium">2760012408</strong>
              </div>
              <div className="flex justify-between">
                <span>Curriculum:</span>
                <strong className="text-blue-200">B.Tech 3rd Year CSE</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Core OOP Concepts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Classes & Objects */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <Box className="w-4 h-4 text-blue-700" />
            <span>1. Classes & Objects</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Models real-world railway entities into specialized TypeScript classes: <code className="text-blue-900 font-semibold">BaseTrain</code>, <code className="text-blue-900 font-semibold">Passenger</code>, <code className="text-blue-900 font-semibold">TicketReservation</code>, <code className="text-blue-900 font-semibold">Station</code>, and <code className="text-blue-900 font-semibold">CancellationSlip</code>.
          </p>
          <div className="pt-2 text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded border border-slate-100">
            const train = TrainFactory.createTrain(data);<br />
            const p = new Passenger(id, name, age...);
          </div>
        </div>

        {/* 2. Encapsulation */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <Layers className="w-4 h-4 text-blue-700" />
            <span>2. Encapsulation</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Restricts direct field access via <code className="text-blue-900 font-semibold">private</code> & <code className="text-blue-900 font-semibold">protected</code> access modifiers. Internal state is modified safely through controlled methods like <code className="text-blue-900 font-semibold">bookSeats()</code>, <code className="text-blue-900 font-semibold">cancelSeats()</code>, and validated setters.
          </p>
          <div className="pt-2 text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded border border-slate-100">
            private _age: number;<br />
            public bookSeats(class, count): boolean;
          </div>
        </div>

        {/* 3. Inheritance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <Share2 className="w-4 h-4 text-blue-700" />
            <span>3. Inheritance</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Abstract base class <code className="text-blue-900 font-semibold">BaseTrain</code> acts as the template for specialized subclasses: <code className="text-blue-900 font-semibold">SuperfastTrain</code>, <code className="text-blue-900 font-semibold">RajdhaniTrain</code>, <code className="text-blue-900 font-semibold">VandeBharatTrain</code>, and <code className="text-blue-900 font-semibold">MailExpressTrain</code>.
          </p>
          <div className="pt-2 text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded border border-slate-100">
            class RajdhaniTrain extends BaseTrain &#123;...&#125;
          </div>
        </div>

        {/* 4. Polymorphism */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <Cpu className="w-4 h-4 text-blue-700" />
            <span>4. Polymorphism</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Polymorphic method override of <code className="text-blue-900 font-semibold">calculateFare()</code>. Rajdhani incorporates premier catering algorithms, Vande Bharat computes high-speed surcharges, and Superfast applies standard superfast levys.
          </p>
          <div className="pt-2 text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded border border-slate-100">
            public override calculateFare(...): FareBreakdown
          </div>
        </div>

        {/* 5. Constructors & Factories */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <Code2 className="w-4 h-4 text-blue-700" />
            <span>5. Constructors & Methods</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Uses parameterized constructors with invariant validation, plus helper domain methods like <code className="text-blue-900 font-semibold">isSeniorCitizen()</code>, <code className="text-blue-900 font-semibold">getMaskedIdProof()</code>, and <code className="text-blue-900 font-semibold">getFormattedPNR()</code>.
          </p>
          <div className="pt-2 text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded border border-slate-100">
            constructor(...) &#123; this.validateAge(age); &#125;
          </div>
        </div>

        {/* 6. Spring Data JPA & MySQL Architecture */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <Database className="w-4 h-4 text-blue-700" />
            <span>6. Spring Data JPA & MySQL 8</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Repository pattern separating business logic from storage. Interfaces extend <code className="text-blue-900 font-semibold">JpaRepository</code> with normalized MySQL 8 tables and constructor-injected services.
          </p>
          <div className="pt-2 text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded border border-slate-100">
            public interface TrainRepository extends JpaRepository&lt;BaseTrainEntity, Long&gt;
          </div>
        </div>
      </div>

      {/* Interactive Polymorphism Live Testing Console */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-blue-900" />
            <h3 className="text-sm font-bold text-slate-900">
              Interactive Polymorphism Demonstration: Dynamic Fare Calculation
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">calculateFare() Override</span>
        </div>

        <p className="text-xs text-slate-600">
          Adjust parameters below to witness how the polymorphic <code className="text-blue-900 font-semibold">calculateFare()</code> method dynamically executes different logic across subclasses for the exact same input!
        </p>

        {/* Simulator Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Class for Comparison</label>
            <select
              value={simClass}
              onChange={e => setSimClass(e.target.value as CoachClass)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium"
            >
              <option value="1A">1A (First AC)</option>
              <option value="2A">2A (2-Tier AC)</option>
              <option value="3A">3A (3-Tier AC)</option>
              <option value="CC">CC (Chair Car)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Total Passengers</label>
            <input
              type="number"
              min={1}
              max={6}
              value={simPassengers}
              onChange={e => setSimPassengers(Math.max(1, Number(e.target.value)))}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Senior Citizens (Concession)</label>
            <input
              type="number"
              min={0}
              max={simPassengers}
              value={simSeniors}
              onChange={e =>
                setSimSeniors(Math.min(simPassengers, Math.max(0, Number(e.target.value))))
              }
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Simulated Corridor</label>
            <div className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-mono">
              ~1,450 km (Metro Run)
            </div>
          </div>
        </div>

        {/* Polymorphic Output Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Rajdhani Subclass Output */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-blue-950">
              <span>RajdhaniTrain Class</span>
              <span className="text-[10px] bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                Luxury AC + Dining
              </span>
            </div>
            <div className="text-xl font-mono font-extrabold text-blue-950 tabular-nums">
              ₹{rajdhaniFare.totalFare.toLocaleString('en-IN')}
            </div>
            <div className="space-y-1 text-[11px] text-slate-600 border-t border-blue-200/60 pt-2 font-mono">
              <div className="flex justify-between">
                <span>Base Total:</span>
                <span>₹{rajdhaniFare.baseFare}</span>
              </div>
              <div className="flex justify-between">
                <span>Inclusive Catering:</span>
                <span>₹{rajdhaniFare.cateringCharge}</span>
              </div>
              <div className="flex justify-between">
                <span>Superfast Fee:</span>
                <span>₹{rajdhaniFare.superfastCharge}</span>
              </div>
              <div className="flex justify-between text-emerald-800">
                <span>Senior Rebate:</span>
                <span>-₹{rajdhaniFare.seniorDiscount}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%):</span>
                <span>₹{rajdhaniFare.gst}</span>
              </div>
            </div>
          </div>

          {/* Vande Bharat Subclass Output */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-amber-950">
              <span>VandeBharatTrain Class</span>
              <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                Semi-High Speed
              </span>
            </div>
            <div className="text-xl font-mono font-extrabold text-amber-950 tabular-nums">
              ₹{vandeFare.totalFare.toLocaleString('en-IN')}
            </div>
            <div className="space-y-1 text-[11px] text-slate-600 border-t border-amber-200/60 pt-2 font-mono">
              <div className="flex justify-between">
                <span>Base Total:</span>
                <span>₹{vandeFare.baseFare}</span>
              </div>
              <div className="flex justify-between">
                <span>Speed Surcharge:</span>
                <span>₹{vandeFare.superfastCharge}</span>
              </div>
              <div className="flex justify-between">
                <span>Onboard Breakfast:</span>
                <span>₹{vandeFare.cateringCharge}</span>
              </div>
              <div className="flex justify-between text-emerald-800">
                <span>Senior Rebate:</span>
                <span>-₹{vandeFare.seniorDiscount}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%):</span>
                <span>₹{vandeFare.gst}</span>
              </div>
            </div>
          </div>

          {/* Superfast Subclass Output */}
          <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span>SuperfastTrain Class</span>
              <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                Standard Express
              </span>
            </div>
            <div className="text-xl font-mono font-extrabold text-slate-900 tabular-nums">
              ₹{superfastFare.totalFare.toLocaleString('en-IN')}
            </div>
            <div className="space-y-1 text-[11px] text-slate-600 border-t border-slate-200 pt-2 font-mono">
              <div className="flex justify-between">
                <span>Base Total:</span>
                <span>₹{superfastFare.baseFare}</span>
              </div>
              <div className="flex justify-between">
                <span>Superfast Fee:</span>
                <span>₹{superfastFare.superfastCharge}</span>
              </div>
              <div className="flex justify-between">
                <span>Catering:</span>
                <span>Optional (₹0)</span>
              </div>
              <div className="flex justify-between text-emerald-800">
                <span>Senior Rebate:</span>
                <span>-₹{superfastFare.seniorDiscount}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%):</span>
                <span>₹{superfastFare.gst}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Java Spring Boot & MySQL Backend Architecture Diagram */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Database className="w-4 h-4 text-blue-900" />
          <span>Java 17 + Spring Boot 3.2.4 & MySQL 8 Architecture Preview</span>
        </div>
        <p className="text-xs text-slate-600">
          The application state connects to the Java Spring Boot REST backend with full JPA entity mapping and MySQL 8 relational schema:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
            <div className="font-bold text-blue-900 flex items-center gap-1.5">
              <span>GET/POST /api/trains</span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Mapped to <code>BaseTrainEntity</code> (InheritanceType.JOINED) with <code>RajdhaniTrainEntity</code>, <code>VandeBharatTrainEntity</code>, and <code>SuperfastTrainEntity</code> tables.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
            <div className="font-bold text-blue-900 flex items-center gap-1.5">
              <span>POST /api/reservations/book</span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Transactional booking service: generates 10-digit PNR, checks and reserves seat records with optimistic locking (<code>@Version</code>), and persists <code>ReservationEntity</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
            <div className="font-bold text-blue-900 flex items-center gap-1.5">
              <span>POST /api/reservations/{'{pnr}'}/cancel</span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Applies cancellation charge rules, updates status to <code>CANCELLED</code>, releases seats back to inventory, and generates <code>CancellationSlipEntity</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
