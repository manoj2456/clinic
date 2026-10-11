import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft,
  CalendarPlus,
  Navigation,
  MessageSquare
} from 'lucide-react';
import { Appointment, ClinicSettings, DentalService, DoctorProfile } from '../../types';
import { api } from '../../services/api';
import { generateAvailableSlotsForDate, getIndiaCurrentDate } from '../../utils/hours';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ClinicSettings;
  services: DentalService[];
  doctors: DoctorProfile[];
  initialService?: string;
  initialDoctor?: string;
  onTrackBooking?: (id?: string) => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  settings,
  services,
  doctors,
  initialService,
  initialDoctor,
  onTrackBooking
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Form states
  const [selectedService, setSelectedService] = useState<string>(initialService || services[0]?.name || '');
  const [selectedDoctor, setSelectedDoctor] = useState<string>(initialDoctor || doctors[0]?.name || 'Any Available Dental Surgeon');
  
  // Format today's date in IST as minimum selectable date YYYY-MM-DD
  const todayIstStr = useMemo(() => {
    const d = getIndiaCurrentDate();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayIstStr);
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [patientType, setPatientType] = useState<'New Patient' | 'Existing Patient'>('New Patient');
  const [notes, setNotes] = useState<string>('');
  const [consentChecked, setConsentChecked] = useState<boolean>(true);

  // Confirmed appointment result
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Existing appointments to prevent double-booking
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialService) setSelectedService(initialService);
      if (initialDoctor) setSelectedDoctor(initialDoctor);
      api.getAppointments().then(setExistingAppointments);
    }
  }, [isOpen, initialService, initialDoctor]);

  // Booked slots on selected date
  const bookedSlotsOnDate = useMemo(() => {
    return existingAppointments
      .filter(a => a.appointment_date === selectedDate && a.status !== 'Cancelled')
      .map(a => a.appointment_time);
  }, [existingAppointments, selectedDate]);

  // Available slots for selected date based on clinic hours
  const availableSlots = useMemo(() => {
    return generateAvailableSlotsForDate(
      selectedDate,
      settings.timings,
      settings.slot_duration_minutes || 30
    );
  }, [selectedDate, settings.timings, settings.slot_duration_minutes]);

  // Submit appointment
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('Please provide a valid 10-digit mobile number.');
      return;
    }
    if (email && !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!consentChecked) {
      setErrorMessage('Please accept the appointment scheduling and clinic contact terms.');
      return;
    }

    setLoading(true);

    try {
      const result = await api.createAppointment({
        patient_name: fullName.trim(),
        phone: cleanPhone.startsWith('+91') ? cleanPhone : `+91 ${cleanPhone}`,
        email: email.trim(),
        service: selectedService,
        doctor: selectedDoctor,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        patient_type: patientType,
        status: 'Pending',
        notes: notes.trim()
      });

      if (!result.success || !result.appointment) {
        setErrorMessage(result.error || 'This slot was just taken. Please choose another time.');
        setCurrentStep(3); // return to time slot selection
        setLoading(false);
        return;
      }

      setConfirmedAppointment(result.appointment);
      if (typeof window !== 'undefined' && result.appointment?.id) {
        localStorage.setItem('tara_last_booking_id', result.appointment.id);
      }
      setCurrentStep(5); // Confirmation screen
    } catch {
      setErrorMessage('Failed to submit appointment request. Please call our clinic directly.');
    } finally {
      setLoading(false);
    }
  };

  // Generate .ics calendar download
  const handleDownloadCalendar = () => {
    if (!confirmedAppointment) return;
    const { appointment_date, appointment_time, service } = confirmedAppointment;
    
    // Construct simplified ICS file
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Tara Dental Advanced Clinic//Appointment//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Dental Appointment - ${service}`,
      `DESCRIPTION:Appointment at Tara’s Dental Advanced Clinic. Sir M V Road, Shivamogga. Phone: ${settings.phone}`,
      `LOCATION:${settings.address_street}, ${settings.address_landmark}, ${settings.address_city}`,
      `DTSTART:${appointment_date.replace(/-/g, '')}T093000Z`,
      `DTEND:${appointment_date.replace(/-/g, '')}T103000Z`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Tara-Dental-Appointment-${confirmedAppointment.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold">Book Dental Appointment</h2>
            <p className="text-xs text-slate-400">Tara’s Dental Advanced Clinic · Shivamogga</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close appointment modal"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators (Step 1 to 4) */}
        {currentStep < 5 && (
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span className={currentStep === 1 ? 'text-teal-700 font-bold' : ''}>1. Service</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className={currentStep === 2 ? 'text-teal-700 font-bold' : ''}>2. Date</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className={currentStep === 3 ? 'text-teal-700 font-bold' : ''}>3. Time</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className={currentStep === 4 ? 'text-teal-700 font-bold' : ''}>4. Details</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Select Service & Doctor */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Select Dental Service
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {services.map((srv) => (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedService(srv.name)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedService === srv.name
                          ? 'border-teal-600 bg-teal-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">{srv.name}</span>
                        <span className="text-xs text-slate-500 tabular-nums">~{srv.duration_minutes}m</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1">{srv.short_description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Preferred Doctor / Practitioner
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="Any Available Dental Surgeon">Any Available Dental Surgeon</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span>Continue to Date</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Select Date */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Select Appointment Date
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Clinic is open Mon–Sat 9:30 AM–8:30 PM, and Sun 10:30 AM–2:30 PM.
                </p>
                
                <input
                  type="date"
                  min={todayIstStr}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime(''); // Reset time when date changes
                  }}
                  className="w-full p-3.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 tabular-nums cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">Selected Appointment:</p>
                <p>Service: <span className="font-medium text-slate-900">{selectedService}</span></p>
                <p>Practitioner: <span className="font-medium text-slate-900">{selectedDoctor}</span></p>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!selectedDate) {
                      setErrorMessage('Please choose a valid appointment date.');
                      return;
                    }
                    setErrorMessage('');
                    setCurrentStep(3);
                  }}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span>Select Time Slot</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Select Time Slot (with duplicate prevention) */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Select Available Time Slot
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Date: <span className="font-semibold text-slate-800 tabular-nums">{selectedDate}</span>
                </p>

                {availableSlots.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-sm font-semibold text-slate-700">No slots available on this date</p>
                    <p className="text-xs text-slate-500 mt-1">Please select another date or contact the clinic directly.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto pr-1">
                    {availableSlots.map((slot) => {
                      const isBooked = bookedSlotsOnDate.includes(slot);
                      const isSelected = selectedTime === slot;

                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          onClick={() => {
                            setSelectedTime(slot);
                            setErrorMessage('');
                          }}
                          className={`p-2.5 text-xs font-semibold rounded-xl border text-center transition-all tabular-nums ${
                            isBooked
                              ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 cursor-pointer'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-700 inline-block" /> Selected
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300 inline-block" /> Available
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" /> Already Reserved
                </span>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={!selectedTime}
                  onClick={() => {
                    if (!selectedTime) {
                      setErrorMessage('Please pick an appointment time slot.');
                      return;
                    }
                    setErrorMessage('');
                    setCurrentStep(4);
                  }}
                  className={`px-6 py-2.5 text-xs font-bold text-white rounded-xl transition-all flex items-center gap-1.5 shadow-sm ${
                    !selectedTime
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-teal-700 hover:bg-teal-800 cursor-pointer'
                  }`}
                >
                  <span>Patient Info</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Patient Information & Final Submission */}
          {currentStep === 4 && (
            <form onSubmit={handleSubmitBooking} className="space-y-4">
              
              {/* Summary of chosen slot */}
              <div className="p-3.5 rounded-xl bg-teal-50/80 border border-teal-200 text-xs text-slate-700 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{selectedService}</p>
                  <p className="text-teal-800 tabular-nums">
                    {selectedDate} · {selectedTime}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs text-teal-700 font-semibold hover:underline"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Phone <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 98451 23456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </div>
              </div>

              {/* Patient Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Patient Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    patientType === 'New Patient' ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-200 text-slate-600'
                  }`}>
                    <input
                      type="radio"
                      name="patientType"
                      checked={patientType === 'New Patient'}
                      onChange={() => setPatientType('New Patient')}
                      className="sr-only"
                    />
                    <span>First-time Visit</span>
                  </label>

                  <label className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    patientType === 'Existing Patient' ? 'border-teal-600 bg-teal-50 text-teal-900' : 'border-slate-200 text-slate-600'
                  }`}>
                    <input
                      type="radio"
                      name="patientType"
                      checked={patientType === 'Existing Patient'}
                      onChange={() => setPatientType('Existing Patient')}
                      className="sr-only"
                    />
                    <span>Existing Patient</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Symptoms or Notes <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Tooth sensitivity when drinking cold water..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              {/* Consent checkbox */}
              <label className="flex items-start gap-2 text-[11px] text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>
                  I consent to Tara’s Dental Advanced Clinic contacting me via phone or SMS regarding this appointment schedule.
                </span>
              </label>

              {/* Submission Controls */}
              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-7 py-3 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all cursor-pointer shadow-md disabled:bg-slate-400 flex items-center gap-2"
                >
                  {loading ? (
                    <span>Confirming...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Appointment</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* STEP 5: Confirmation View */}
          {currentStep === 5 && confirmedAppointment && (
            <div className="text-center space-y-6 py-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Appointment Request Received
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Reference ID: <span className="font-mono font-bold text-slate-800">{confirmedAppointment.id}</span>
                </p>
              </div>

              {/* Appointment Summary Box */}
              <div className="text-left p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-semibold text-slate-900">{confirmedAppointment.patient_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-semibold text-slate-900">{confirmedAppointment.service}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-semibold text-teal-800 tabular-nums">
                    {confirmedAppointment.appointment_date} at {confirmedAppointment.appointment_time}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Clinic:</span>
                  <span className="font-semibold text-slate-900">{settings.name}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Clinic Telephone:</span>
                  <span className="font-semibold text-slate-900 tabular-nums">{settings.phone}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Our clinic team will hold this slot for you. Please arrive 5–10 minutes early at our Sir M V Road clinic in Shivamogga.
              </p>

              {/* Track Booking Live CTA Button */}
              {onTrackBooking && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onTrackBooking(confirmedAppointment.id);
                    }}
                    className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-200" />
                    <span>Track This Booking Status Live</span>
                  </button>
                </div>
              )}

              {/* Action Buttons: Add to Calendar, Call Clinic, Get Directions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <button
                  onClick={handleDownloadCalendar}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  <CalendarPlus className="w-4 h-4 text-slate-600" />
                  <span>Add to Calendar</span>
                </button>

                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  <Phone className="w-4 h-4 text-teal-600" />
                  <span>Call Clinic</span>
                </a>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent("Tara's Dental Advanced Clinic Sir M V Road Shivamogga")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  <Navigation className="w-4 h-4 text-slate-500" />
                  <span>Directions</span>
                </a>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Done & Close
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
