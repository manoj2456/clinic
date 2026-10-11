import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Copy, 
  Check, 
  Printer, 
  CalendarPlus, 
  RefreshCw, 
  X, 
  MessageSquare, 
  ArrowLeft, 
  ExternalLink, 
  User, 
  ShieldCheck, 
  FileText,
  CalendarCheck,
  ChevronRight
} from 'lucide-react';
import { Appointment, AppointmentStatus, ClinicSettings, DentalService } from '../../types';
import { api } from '../../services/api';
import { generateAvailableSlotsForDate, getIndiaCurrentDate } from '../../utils/hours';

interface TrackBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ClinicSettings;
  services: DentalService[];
  initialBookingId?: string;
  onOpenBooking: () => void;
}

export const TrackBookingModal: React.FC<TrackBookingModalProps> = ({
  isOpen,
  onClose,
  settings,
  services,
  initialBookingId,
  onOpenBooking
}) => {
  const [searchInput, setSearchInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const [recentBookingId, setRecentBookingId] = useState<string | null>(null);

  // Reschedule state
  const [isRescheduling, setIsRescheduling] = useState<boolean>(false);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string>('');
  const [rescheduleLoading, setRescheduleLoading] = useState<boolean>(false);
  const [rescheduleError, setRescheduleError] = useState<string>('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string>('');

  // Cancellation state
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelLoading, setCancelLoading] = useState<boolean>(false);

  // Print view state
  const [isPrintSlipOpen, setIsPrintSlipOpen] = useState<boolean>(false);

  // Minimum date for rescheduling
  const todayIstStr = useMemo(() => {
    const d = getIndiaCurrentDate();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Available slots for selected reschedule date
  const availableRescheduleSlots = useMemo(() => {
    if (!rescheduleDate) return [];
    return generateAvailableSlotsForDate(
      rescheduleDate,
      settings.timings,
      settings.slot_duration_minutes || 30
    );
  }, [rescheduleDate, settings.timings, settings.slot_duration_minutes]);

  // Load recent booking from localStorage or initialBookingId prop on open
  useEffect(() => {
    if (isOpen) {
      setActionSuccessMessage('');
      setRescheduleError('');
      setIsRescheduling(false);
      setIsCancelling(false);
      setIsPrintSlipOpen(false);

      const storedLastId = localStorage.getItem('tara_last_booking_id');
      if (storedLastId) {
        setRecentBookingId(storedLastId);
      }

      const idToSearch = initialBookingId || storedLastId;
      if (idToSearch) {
        setSearchInput(idToSearch);
        executeSearch(idToSearch);
      } else {
        setSearchInput('');
        setSearchResults([]);
        setSelectedAppointment(null);
        setHasSearched(false);
      }
    }
  }, [isOpen, initialBookingId]);

  const executeSearch = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setHasSearched(true);
    setActionSuccessMessage('');
    setRescheduleError('');

    try {
      const results = await api.trackBooking(trimmed);
      setSearchResults(results);
      if (results.length === 1) {
        setSelectedAppointment(results[0]);
      } else if (results.length === 0) {
        setSelectedAppointment(null);
      } else {
        // Multiple results: if exact ID match, select it; otherwise show selector
        const exact = results.find(a => a.id.toLowerCase() === trimmed.toLowerCase());
        setSelectedAppointment(exact || null);
      }
    } catch {
      setSearchResults([]);
      setSelectedAppointment(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchInput);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Google Calendar Link generator
  const getGoogleCalendarUrl = (apt: Appointment) => {
    const title = encodeURIComponent(`Dental Appointment: ${apt.service} at ${settings.name}`);
    const details = encodeURIComponent(
      `Appointment Ref: ${apt.id}\nPatient: ${apt.patient_name}\nDoctor: ${apt.doctor}\nStatus: ${apt.status}\nLocation: ${settings.address_street}, ${settings.address_city}\nPhone: ${settings.phone}`
    );
    const location = encodeURIComponent(`${settings.name}, ${settings.address_street}, ${settings.address_city}`);

    // Approximate ISO time
    const dateClean = apt.appointment_date.replace(/-/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dateClean}/${dateClean}`;
  };

  // .ICS file download
  const handleDownloadIcs = (apt: Appointment) => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Taras Dental Advanced Clinic//Appointment Tracker//EN',
      'BEGIN:VEVENT',
      `UID:${apt.id}@tarasdental.com`,
      `SUMMARY:Dental Appointment - ${apt.service}`,
      `DESCRIPTION:Patient: ${apt.patient_name}\\nBooking ID: ${apt.id}\\nPractitioner: ${apt.doctor}\\nClinic: ${settings.name} (${settings.phone})`,
      `LOCATION:${settings.name}, ${settings.address_street}, ${settings.address_city}`,
      `STATUS:${apt.status === 'Cancelled' ? 'CANCELLED' : 'CONFIRMED'}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Tara-Dental-Appointment-${apt.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Rescheduling
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    if (!rescheduleDate) {
      setRescheduleError('Please select a preferred new appointment date.');
      return;
    }
    if (!rescheduleTime) {
      setRescheduleError('Please select an available time slot.');
      return;
    }

    setRescheduleLoading(true);
    setRescheduleError('');

    try {
      const updated = await api.updateAppointment(selectedAppointment.id, {
        appointment_date: rescheduleDate,
        appointment_time: rescheduleTime,
        status: 'Pending', // pending clinic review for rescheduled time
        notes: (selectedAppointment.notes ? selectedAppointment.notes + ' | ' : '') + `Rescheduled by patient on ${new Date().toLocaleDateString()}`
      });

      setSelectedAppointment(updated);
      setIsRescheduling(false);
      setActionSuccessMessage(`Your appointment has been successfully rescheduled to ${rescheduleDate} at ${rescheduleTime}. Our clinic reception will verify and update you.`);
      
      // Refresh search results
      executeSearch(updated.id);
    } catch (err: any) {
      setRescheduleError(err.message || 'Failed to reschedule. Please contact clinic reception.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  // Handle Cancellation
  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setCancelLoading(true);
    try {
      const updated = await api.updateAppointment(selectedAppointment.id, {
        status: 'Cancelled',
        notes: (selectedAppointment.notes ? selectedAppointment.notes + ' | ' : '') + `Cancelled by patient: ${cancelReason.trim() || 'Patient request'}`
      });

      setSelectedAppointment(updated);
      setIsCancelling(false);
      setActionSuccessMessage('Your appointment has been cancelled. If you wish to re-book at another time, please feel free to schedule online.');
      
      executeSearch(updated.id);
    } catch {
      setRescheduleError('Failed to cancel appointment. Please call clinic directly.');
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Confirmed</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>Under Clinic Review</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Visit Completed</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Cancelled</span>
          </span>
        );
      case 'No-show':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <span>Missed Visit</span>
          </span>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="track-booking-title"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 id="track-booking-title" className="text-sm sm:text-base font-bold text-slate-900">
                Track My Appointment
              </h2>
              <p className="text-[11px] text-slate-500">
                {settings.name} · Real-time Status Tracker
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar Form */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white shrink-0">
          <form onSubmit={handleSearchSubmit} className="space-y-2">
            <label htmlFor="track-search-input" className="block text-xs font-semibold text-slate-700">
              Enter Booking Reference ID or Registered Mobile Number
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="track-search-input"
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="e.g. TARA-2026-1001 or +91 98451 23456"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 font-medium"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
              <button
                type="submit"
                disabled={loading || !searchInput.trim()}
                className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <span>Track Status</span>
                )}
              </button>
            </div>

            {/* Quick Chips for easy lookup */}
            <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px] text-slate-500">
              <span className="font-medium text-slate-400">Quick Search:</span>
              {recentBookingId && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput(recentBookingId);
                    executeSearch(recentBookingId);
                  }}
                  className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 transition-colors font-mono cursor-pointer"
                >
                  My Recent: {recentBookingId}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSearchInput('TARA-2026-1001');
                  executeSearch('TARA-2026-1001');
                }}
                className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors font-mono cursor-pointer"
              >
                Demo: TARA-2026-1001
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchInput('TARA-2026-1002');
                  executeSearch('TARA-2026-1002');
                }}
                className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors font-mono cursor-pointer"
              >
                Demo: TARA-2026-1002
              </button>
            </div>
          </form>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Action Success Alert */}
          {actionSuccessMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">
                {actionSuccessMessage}
              </div>
            </div>
          )}

          {/* Initial / Unsearched State */}
          {!hasSearched && (
            <div className="text-center py-8 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center mx-auto">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Check Your Appointment Status in Seconds
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Enter your Tara’s Dental booking reference ID (sent on booking confirmation) or the phone number you used when scheduling.
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBooking();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold hover:bg-teal-800 transition-colors"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Book a New Appointment Instead</span>
                </button>
              </div>
            </div>
          )}

          {/* Searched but Not Found */}
          {hasSearched && !loading && searchResults.length === 0 && (
            <div className="text-center py-8 px-4 space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                No Booking Found for "{searchInput}"
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                We couldn't locate an appointment matching this reference code or mobile number. Please check for typos, or search with your 10-digit mobile number.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100"
                >
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>Call Clinic Support: {settings.phone}</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBooking();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold hover:bg-teal-800"
                >
                  <span>Book New Appointment</span>
                </button>
              </div>
            </div>
          )}

          {/* Multiple Results List Selector */}
          {hasSearched && searchResults.length > 1 && !selectedAppointment && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700">
                  {searchResults.length} Appointments Found for "{searchInput}":
                </p>
                <span className="text-[11px] text-slate-400">Select one to view tracking details</span>
              </div>
              <div className="space-y-2">
                {searchResults.map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => setSelectedAppointment(apt)}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800">{apt.id}</span>
                        {getStatusBadge(apt.status)}
                      </div>
                      <p className="text-xs font-semibold text-slate-900">{apt.service}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>{apt.patient_name}</span>
                        <span>·</span>
                        <span>{apt.appointment_date} at {apt.appointment_time}</span>
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Single Selected Appointment Detailed View */}
          {selectedAppointment && (
            <div className="space-y-4">
              {/* If multiple results, show back button */}
              {searchResults.length > 1 && (
                <button
                  type="button"
                  onClick={() => setSelectedAppointment(null)}
                  className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to all matching bookings ({searchResults.length})</span>
                </button>
              )}

              {/* Top Reference Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-900 to-slate-900 text-white shadow-md space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-teal-200 font-medium">Booking ID:</span>
                    <span className="font-mono font-bold text-sm sm:text-base text-white tracking-wider">
                      {selectedAppointment.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyId(selectedAppointment.id)}
                      className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      title="Copy Reference ID"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div>
                    {getStatusBadge(selectedAppointment.status)}
                  </div>
                </div>

                {/* Primary Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 border-t border-white/10 text-xs">
                  <div>
                    <span className="block text-[10px] text-teal-200 uppercase font-semibold">Scheduled Date</span>
                    <span className="font-bold text-white tabular-nums">{selectedAppointment.appointment_date}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-teal-200 uppercase font-semibold">Time Slot</span>
                    <span className="font-bold text-teal-300 tabular-nums">{selectedAppointment.appointment_time}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-[10px] text-teal-200 uppercase font-semibold">Patient Name</span>
                    <span className="font-bold text-white truncate block">{selectedAppointment.patient_name}</span>
                  </div>
                </div>
              </div>

              {/* Progress Tracker Stepper */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Visit Journey & Timeline</span>
                </h4>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {/* Step 1: Request Placed */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Appointment Request Submitted</p>
                      <p className="text-[11px] text-slate-500">
                        Received on {new Date(selectedAppointment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Clinic Confirmation */}
                  <div className="relative">
                    <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      selectedAppointment.status === 'Confirmed' || selectedAppointment.status === 'Completed'
                        ? 'bg-emerald-600 text-white'
                        : selectedAppointment.status === 'Cancelled'
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-500 text-white animate-pulse'
                    }`}>
                      {selectedAppointment.status === 'Confirmed' || selectedAppointment.status === 'Completed' ? '✓' : selectedAppointment.status === 'Cancelled' ? '✕' : '•'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {selectedAppointment.status === 'Confirmed'
                          ? 'Clinic Confirmed & Surgeon Assigned'
                          : selectedAppointment.status === 'Cancelled'
                          ? 'Booking Cancelled'
                          : selectedAppointment.status === 'Completed'
                          ? 'Confirmed & Attended'
                          : 'Clinic Staff Reviewing Slot'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {selectedAppointment.status === 'Confirmed'
                          ? 'Your slot is officially secured with Tara’s Dental clinical team.'
                          : selectedAppointment.status === 'Cancelled'
                          ? 'This appointment has been cancelled.'
                          : 'Our reception is verifying schedule availability.'}
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Treatment Day */}
                  <div className="relative">
                    <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      selectedAppointment.status === 'Completed'
                        ? 'bg-emerald-600 text-white'
                        : selectedAppointment.status === 'Cancelled'
                        ? 'bg-slate-300 text-slate-600'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {selectedAppointment.status === 'Completed' ? '✓' : '3'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Arrival & Treatment Session
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {selectedAppointment.appointment_date} at {selectedAppointment.appointment_time} (Please arrive 5-10 mins early)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Booking Details Grid */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-3">
                <h4 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">
                  Detailed Information
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Treatment Requested</span>
                    <p className="font-semibold text-slate-900">{selectedAppointment.service}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Practitioner</span>
                    <p className="font-semibold text-slate-900">{selectedAppointment.doctor}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Patient Phone</span>
                    <p className="font-semibold text-slate-900 tabular-nums">{selectedAppointment.phone}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Patient Type</span>
                    <p className="font-semibold text-slate-900">{selectedAppointment.patient_type || 'New Patient'}</p>
                  </div>
                  {selectedAppointment.email && (
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Email Address</span>
                      <p className="font-semibold text-slate-900">{selectedAppointment.email}</p>
                    </div>
                  )}
                  {selectedAppointment.notes && (
                    <div className="col-span-1 sm:col-span-2 space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Patient Remarks</span>
                      <p className="font-normal text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {selectedAppointment.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Clinic Location Box */}
                <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div className="text-[11px]">
                    <span className="font-bold text-slate-900">{settings.name}</span>
                    <p>{settings.address_street}, {settings.address_landmark}, {settings.address_city}, Karnataka {settings.address_pincode}</p>
                  </div>
                </div>
              </div>

              {/* Action Toolbar: Calendar, Pass, Reschedule, Directions, WhatsApp */}
              <div className="space-y-2">
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Quick Patient Actions
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Action 1: Add to Calendar */}
                  <button
                    type="button"
                    onClick={() => handleDownloadIcs(selectedAppointment)}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors text-center cursor-pointer"
                  >
                    <CalendarPlus className="w-4 h-4 text-teal-700 mb-1" />
                    <span className="text-[11px] font-semibold">Save to Calendar</span>
                  </button>

                  {/* Action 2: Print Appointment Pass */}
                  <button
                    type="button"
                    onClick={() => setIsPrintSlipOpen(true)}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors text-center cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-slate-700 mb-1" />
                    <span className="text-[11px] font-semibold">Print Visit Pass</span>
                  </button>

                  {/* Action 3: Call Clinic */}
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors text-center"
                  >
                    <Phone className="w-4 h-4 text-teal-600 mb-1" />
                    <span className="text-[11px] font-semibold">Call Clinic</span>
                  </a>

                  {/* Action 4: Directions */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent("Tara's Dental Advanced Clinic Sir M V Road Savlanga Road Shivamogga")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors text-center"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-700 mb-1" />
                    <span className="text-[11px] font-semibold">Google Maps</span>
                  </a>
                </div>

                {/* Reschedule & Cancel Row (Only if not already cancelled or completed) */}
                {selectedAppointment.status !== 'Cancelled' && selectedAppointment.status !== 'Completed' && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRescheduling(!isRescheduling);
                        setIsCancelling(false);
                        setRescheduleDate(selectedAppointment.appointment_date);
                        setRescheduleTime(selectedAppointment.appointment_time);
                      }}
                      className="flex-1 py-2 px-3 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{isRescheduling ? 'Hide Reschedule Form' : 'Request to Reschedule'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsCancelling(!isCancelling);
                        setIsRescheduling(false);
                      }}
                      className="py-2 px-3 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel Booking</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Inline Reschedule Form */}
              {isRescheduling && (
                <form onSubmit={handleRescheduleSubmit} className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-teal-700" />
                      <span>Choose New Date & Time Slot</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsRescheduling(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>

                  {rescheduleError && (
                    <p className="text-xs text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                      {rescheduleError}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Select New Date
                      </label>
                      <input
                        type="date"
                        min={todayIstStr}
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Select Time Slot ({availableRescheduleSlots.length} available)
                      </label>
                      <select
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 font-medium"
                        required
                      >
                        <option value="">-- Choose Slot --</option>
                        {availableRescheduleSlots.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={rescheduleLoading}
                    className="w-full py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all shadow-xs cursor-pointer disabled:bg-slate-400"
                  >
                    {rescheduleLoading ? 'Updating Appointment...' : 'Confirm Rescheduled Timing'}
                  </button>
                </form>
              )}

              {/* Inline Cancellation Form */}
              {isCancelling && (
                <form onSubmit={handleCancelSubmit} className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Confirm Cancellation</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => setIsCancelling(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Keep Booking
                    </button>
                  </div>

                  <p className="text-xs text-slate-600">
                    Are you sure you want to cancel appointment <span className="font-mono font-bold">{selectedAppointment.id}</span>? Your reserved slot will be released.
                  </p>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Reason for cancellation (optional):
                    </label>
                    <input
                      type="text"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="e.g. Work conflict, feeling better, scheduling later"
                      className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={cancelLoading}
                    className="w-full py-2.5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl transition-all shadow-xs cursor-pointer disabled:bg-slate-400"
                  >
                    {cancelLoading ? 'Cancelling...' : 'Yes, Cancel My Appointment'}
                  </button>
                </form>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0 text-xs">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Tara’s Dental Advanced Clinic · Shivamogga</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer text-xs"
          >
            Close
          </button>
        </div>

      </div>

      {/* Printable Visit Pass Modal */}
      {isPrintSlipOpen && selectedAppointment && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 print:m-0 print:border-none print:shadow-none">
            {/* Pass Printable Area */}
            <div id="printable-slip" className="p-6 space-y-4">
              <div className="border-b-2 border-teal-800 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    {settings.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Sir M V Road, Savlanga Road, Opp. Karnataka Bank, Shivamogga 577201
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Phone: {settings.phone}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Dental Pass</span>
                  <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {selectedAppointment.id}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-bold text-slate-900">{selectedAppointment.patient_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-semibold text-slate-800">{selectedAppointment.phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Dental Service:</span>
                  <span className="font-bold text-teal-900">{selectedAppointment.service}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Doctor / Practitioner:</span>
                  <span className="font-semibold text-slate-800">{selectedAppointment.doctor}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Scheduled Date:</span>
                  <span className="font-bold text-slate-900 tabular-nums">{selectedAppointment.appointment_date}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Appointment Time:</span>
                  <span className="font-bold text-teal-800 tabular-nums">{selectedAppointment.appointment_time}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-slate-900">{selectedAppointment.status}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[10px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">Instructions for Patient:</p>
                <p>• Please report to the reception desk 10 minutes prior to your time slot.</p>
                <p>• Carry any previous dental X-rays, prescriptions, or medical history if available.</p>
                <p>• For queries or emergency rescheduling, call reception at {settings.phone}.</p>
              </div>
            </div>

            {/* Modal Controls */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-2 print:hidden">
              <button
                type="button"
                onClick={() => setIsPrintSlipOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Pass</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
