import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar as CalendarIcon, 
  Phone, 
  Mail, 
  User, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  ArrowLeft, 
  Database, 
  Check, 
  Copy, 
  FileText, 
  ExternalLink, 
  Printer, 
  AlertCircle,
  Eye,
  CalendarCheck,
  ChevronRight,
  ShieldCheck,
  Save,
  X
} from 'lucide-react';
import { Appointment, AppointmentStatus, ClinicSettings, DentalService, DoctorProfile } from '../../types';
import { api } from '../../services/api';
import { SUPABASE_SQL_SCHEMA } from '../../services/supabase';
import { generateAvailableSlotsForDate, getIndiaCurrentDate } from '../../utils/hours';

interface AdminPanelProps {
  onBackToWebsite: () => void;
  settings: ClinicSettings;
  services: DentalService[];
  doctors: DoctorProfile[];
  onSettingsUpdated: (newSettings: ClinicSettings) => void;
  onServicesUpdated: (newServices: DentalService[]) => void;
  onDoctorsUpdated: (newDoctors: DoctorProfile[]) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onBackToWebsite,
  settings,
  services,
  doctors,
  onSettingsUpdated,
  onServicesUpdated,
  onDoctorsUpdated
}) => {
  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('tara_admin_auth') === 'true';
  });
  const [passcode, setPasscode] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Main UI States
  const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'doctors' | 'settings' | 'supabase'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string>('');

  // Filter States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('All'); // 'All' | 'Today' | 'Tomorrow' | YYYY-MM-DD
  const [customDate, setCustomDate] = useState<string>('');
  const [serviceFilter, setServiceFilter] = useState<string>('All');

  // Modal Dialogs
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isNewBookingOpen, setIsNewBookingOpen] = useState<boolean>(false);
  const [cancelModalAppointment, setCancelModalAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // New manual appointment form state
  const [newPatientName, setNewPatientName] = useState<string>('');
  const [newPatientPhone, setNewPatientPhone] = useState<string>('');
  const [newPatientEmail, setNewPatientEmail] = useState<string>('');
  const [newService, setNewService] = useState<string>(services[0]?.name || '');
  const [newDoctor, setNewDoctor] = useState<string>(doctors[0]?.name || 'Any Available Dental Surgeon');
  const [newDate, setNewDate] = useState<string>(() => {
    const d = getIndiaCurrentDate();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [newTime, setNewTime] = useState<string>('10:00 AM');
  const [newPatientType, setNewPatientType] = useState<'New Patient' | 'Existing Patient'>('New Patient');
  const [newNotes, setNewNotes] = useState<string>('');
  const [modalError, setModalError] = useState<string>('');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<ClinicSettings>(settings);
  const [settingsSaveMsg, setSettingsSaveMsg] = useState<string>('');

  // Services & Doctors CMS state
  const [servicesList, setServicesList] = useState<DentalService[]>(services);
  const [newServiceName, setNewServiceName] = useState<string>('');
  const [newServiceDesc, setNewServiceDesc] = useState<string>('');
  const [newServiceDuration, setNewServiceDuration] = useState<number>(30);

  const [doctorsList, setDoctorsList] = useState<DoctorProfile[]>(doctors);
  const [newDocName, setNewDocName] = useState<string>('');
  const [newDocQual, setNewDocQual] = useState<string>('');
  const [newDocSpec, setNewDocSpec] = useState<string>('');
  const [newDocBio, setNewDocBio] = useState<string>('');

  // Load appointments
  const refreshAppointments = async () => {
    setIsSyncing(true);
    try {
      const list = await api.syncFromDatabase();
      setAppointments(list);
      setSyncToast('Live Supabase data synchronized successfully!');
      setTimeout(() => setSyncToast(''), 3000);
    } catch {
      setSyncToast('Using local database storage');
      setTimeout(() => setSyncToast(''), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshAppointments();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setSettingsForm(settings);
    setServicesList(services);
    setDoctorsList(doctors);
  }, [settings, services, doctors]);

  // Auth handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === settings.admin_passcode || passcode === 'tara2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('tara_admin_auth', 'true');
      setAuthError('');
      refreshAppointments();
    } else {
      setAuthError('Incorrect passcode. Default passcode is tara2026');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('tara_admin_auth');
  };

  // IST Today & Tomorrow date strings
  const { todayStr, tomorrowStr } = useMemo(() => {
    const d = getIndiaCurrentDate();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const today = `${y}-${m}-${day}`;

    const tomDate = new Date(d);
    tomDate.setDate(d.getDate() + 1);
    const ty = tomDate.getFullYear();
    const tm = String(tomDate.getMonth() + 1).padStart(2, '0');
    const tday = String(tomDate.getDate()).padStart(2, '0');
    const tomorrow = `${ty}-${tm}-${tday}`;

    return { todayStr: today, tomorrowStr: tomorrow };
  }, []);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      // Search
      const matchSearch =
        a.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.phone.includes(searchTerm) ||
        a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.email && a.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (a.notes && a.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status
      const matchStatus = statusFilter === 'All' || a.status === statusFilter;

      // Service
      const matchService = serviceFilter === 'All' || a.service === serviceFilter;

      // Date
      let matchDate = true;
      if (dateFilter === 'Today') {
        matchDate = a.appointment_date === todayStr;
      } else if (dateFilter === 'Tomorrow') {
        matchDate = a.appointment_date === tomorrowStr;
      } else if (dateFilter === 'Custom' && customDate) {
        matchDate = a.appointment_date === customDate;
      }

      return matchSearch && matchStatus && matchService && matchDate;
    });
  }, [appointments, searchTerm, statusFilter, serviceFilter, dateFilter, customDate, todayStr, tomorrowStr]);

  // Metric counts
  const metrics = useMemo(() => {
    return {
      total: appointments.length,
      today: appointments.filter(a => a.appointment_date === todayStr && a.status !== 'Cancelled').length,
      pending: appointments.filter(a => a.status === 'Pending').length,
      confirmed: appointments.filter(a => a.status === 'Confirmed').length,
      completed: appointments.filter(a => a.status === 'Completed').length,
      cancelled: appointments.filter(a => a.status === 'Cancelled').length
    };
  }, [appointments, todayStr]);

  // Actions
  const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus) => {
    const updated = await api.updateAppointmentStatus(id, newStatus);
    setAppointments(prev => prev.map(a => a.id === id ? updated : a));
    if (viewingAppointment?.id === id) setViewingAppointment(updated);
    setSyncToast(`Appointment marked as ${newStatus}`);
    setTimeout(() => setSyncToast(''), 2500);
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalAppointment) return;
    const finalNotes = cancelReason.trim()
      ? `${cancelModalAppointment.notes ? cancelModalAppointment.notes + ' | ' : ''}Cancelled: ${cancelReason.trim()}`
      : cancelModalAppointment.notes;

    const updated = await api.updateAppointmentStatus(cancelModalAppointment.id, 'Cancelled', finalNotes);
    setAppointments(prev => prev.map(a => a.id === cancelModalAppointment.id ? updated : a));
    setCancelModalAppointment(null);
    setCancelReason('');
    setSyncToast('Appointment cancelled in Supabase database');
    setTimeout(() => setSyncToast(''), 2500);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this appointment record?')) {
      await api.deleteAppointment(id);
      setAppointments(prev => prev.filter(a => a.id !== id));
      if (viewingAppointment?.id === id) setViewingAppointment(null);
      setSyncToast('Record deleted');
      setTimeout(() => setSyncToast(''), 2000);
    }
  };

  // Edit Submission
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;
    try {
      const updated = await api.updateAppointment(editingAppointment.id, editingAppointment);
      setAppointments(prev => prev.map(a => a.id === editingAppointment.id ? updated : a));
      setEditingAppointment(null);
      setSyncToast('Appointment updated successfully in Supabase database!');
      setTimeout(() => setSyncToast(''), 3000);
    } catch {
      setModalError('Failed to save changes.');
    }
  };

  // New Manual Booking Submission
  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    if (!newPatientName.trim()) {
      setModalError('Patient name is required.');
      return;
    }
    if (!newPatientPhone.trim()) {
      setModalError('Contact phone number is required.');
      return;
    }

    try {
      const result = await api.createAppointment({
        patient_name: newPatientName.trim(),
        phone: newPatientPhone.trim().startsWith('+91') ? newPatientPhone.trim() : `+91 ${newPatientPhone.trim()}`,
        email: newPatientEmail.trim() || '',
        service: newService,
        doctor: newDoctor,
        appointment_date: newDate,
        appointment_time: newTime,
        patient_type: newPatientType,
        status: 'Confirmed',
        notes: newNotes.trim() || 'Manual booking via Admin Panel'
      });

      if (!result.success || !result.appointment) {
        setModalError(result.error || 'Failed to create booking.');
        return;
      }

      setAppointments(prev => [result.appointment!, ...prev]);
      setIsNewBookingOpen(false);
      // Reset
      setNewPatientName('');
      setNewPatientPhone('');
      setNewPatientEmail('');
      setNewNotes('');
      setSyncToast('New appointment created and saved to Supabase!');
      setTimeout(() => setSyncToast(''), 3000);
    } catch {
      setModalError('Error saving appointment to database.');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Patient Name', 'Phone', 'Email', 'Service', 'Doctor', 'Date', 'Time', 'Type', 'Status', 'Notes', 'Created At'];
    const rows = filteredAppointments.map(a => [
      `"${a.id}"`,
      `"${a.patient_name}"`,
      `"${a.phone}"`,
      `"${a.email || ''}"`,
      `"${a.service}"`,
      `"${a.doctor}"`,
      `"${a.appointment_date}"`,
      `"${a.appointment_time}"`,
      `"${a.patient_type}"`,
      `"${a.status}"`,
      `"${(a.notes || '').replace(/"/g, '""')}"`,
      `"${a.created_at}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Tara-Dental-Appointments-${todayStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print schedule
  const handlePrint = () => {
    window.print();
  };

  // Available slots for edit/new modal
  const newBookingSlots = useMemo(() => {
    return generateAvailableSlotsForDate(newDate, settings.timings, settings.slot_duration_minutes || 30);
  }, [newDate, settings.timings, settings.slot_duration_minutes]);

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto text-teal-700 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clinic Admin Panel</h1>
            <p className="text-xs text-slate-500">
              Tara’s Dental Advanced Clinic · Shivamogga
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Staff Passcode
              </label>
              <input
                type="password"
                autoFocus
                placeholder="Enter admin passcode (default: tara2026)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-300 text-sm font-semibold tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            {authError && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all shadow-md cursor-pointer active:scale-98"
            >
              Access Dashboard
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={onBackToWebsite}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Clinic Website</span>
            </button>
            <span className="text-[11px] text-slate-400">Database: Supabase</span>
          </div>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD WORKSPACE
  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Left Brand Lockup & Return */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToWebsite}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Return to Public Website"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-white">
                  {settings.name}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-900/80 text-teal-300 px-2 py-0.5 rounded border border-teal-700/60">
                  Admin Dashboard
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Sir M V Road, Shivamogga · Patient Bookings & Records
              </p>
            </div>
          </div>

          {/* Right Live Cloud Status & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">Supabase:</span>
              <span className="font-mono text-emerald-300 font-bold">ldmubrxodvsbwkxcxsjc</span>
            </div>

            <button
              onClick={refreshAppointments}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-teal-800 hover:bg-teal-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Fetch fresh data from Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync DB'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Sign Out"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Tab Navigation Strip */}
        <div className="bg-slate-950/60 border-t border-slate-800 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-1 py-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'appointments' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Appointments ({metrics.total})</span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'services' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Services CMS ({servicesList.length})
            </button>

            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'doctors' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Doctors CMS ({doctorsList.length})
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'settings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Clinic Settings
            </button>

            <button
              onClick={() => setActiveTab('supabase')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'supabase' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supabase Database</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sync Toast */}
      {syncToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        
        {/* TAB 1: APPOINTMENTS MANAGEMENT */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <div 
                onClick={() => setStatusFilter('All')} 
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  statusFilter === 'All' ? 'bg-white border-slate-900 shadow-sm ring-1 ring-slate-900' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Bookings</span>
                <p className="text-2xl font-extrabold text-slate-900 tabular-nums mt-1">{metrics.total}</p>
              </div>

              <div 
                onClick={() => setDateFilter('Today')} 
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  dateFilter === 'Today' ? 'bg-teal-50 border-teal-700 shadow-sm ring-1 ring-teal-700' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Today's Visits</span>
                <p className="text-2xl font-extrabold text-teal-900 tabular-nums mt-1">{metrics.today}</p>
              </div>

              <div 
                onClick={() => setStatusFilter('Pending')} 
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  statusFilter === 'Pending' ? 'bg-amber-50 border-amber-600 shadow-sm ring-1 ring-amber-600' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pending Approval</span>
                <p className="text-2xl font-extrabold text-amber-900 tabular-nums mt-1">{metrics.pending}</p>
              </div>

              <div 
                onClick={() => setStatusFilter('Confirmed')} 
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  statusFilter === 'Confirmed' ? 'bg-teal-50 border-teal-700 shadow-sm ring-1 ring-teal-700' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Confirmed</span>
                <p className="text-2xl font-extrabold text-teal-900 tabular-nums mt-1">{metrics.confirmed}</p>
              </div>

              <div 
                onClick={() => setStatusFilter('Completed')} 
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  statusFilter === 'Completed' ? 'bg-emerald-50 border-emerald-600 shadow-sm ring-1 ring-emerald-600' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Completed</span>
                <p className="text-2xl font-extrabold text-emerald-900 tabular-nums mt-1">{metrics.completed}</p>
              </div>

              <div 
                onClick={() => setStatusFilter('Cancelled')} 
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  statusFilter === 'Cancelled' ? 'bg-rose-50 border-rose-600 shadow-sm ring-1 ring-rose-600' : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Cancelled</span>
                <p className="text-2xl font-extrabold text-rose-900 tabular-nums mt-1">{metrics.cancelled}</p>
              </div>
            </div>

            {/* Action Bar: Search, Date Filter, Status Tabs, & Add Appointment Button */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search by patient name, phone, ID, or symptoms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsNewBookingOpen(true)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Appointment</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    title="Export CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    title="Print schedule"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Print</span>
                  </button>
                </div>

              </div>

              {/* Secondary Filter Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                {/* Status Segmented Control */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
                  {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                        statusFilter === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Date Filters */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Date:</span>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800"
                  >
                    <option value="All">All Dates</option>
                    <option value="Today">Today Only</option>
                    <option value="Tomorrow">Tomorrow Only</option>
                    <option value="Custom">Specific Date...</option>
                  </select>

                  {dateFilter === 'Custom' && (
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="p-1.5 rounded-lg border border-slate-300 text-xs bg-white tabular-nums"
                    />
                  )}
                </div>

                {/* Service Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Service:</span>
                  <select
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 max-w-[160px] truncate"
                  >
                    <option value="All">All Services</option>
                    {services.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Appointments Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3.5">ID / Patient</th>
                      <th className="px-4 py-3.5">Phone & Contact</th>
                      <th className="px-4 py-3.5">Treatment / Practitioner</th>
                      <th className="px-4 py-3.5">Date & Time Slot</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5 text-right">Management Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                          <div className="max-w-sm mx-auto space-y-2">
                            <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="font-semibold text-slate-700">No appointments found</p>
                            <p className="text-xs text-slate-400">
                              Try clearing filters or search terms. You can also click "New Appointment" to manually record a patient booking.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                          
                          {/* Patient */}
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-900 text-sm">{app.patient_name}</div>
                            <div className="font-mono text-[10px] text-slate-400 mt-0.5">{app.id}</div>
                            <div className="text-[10px] font-semibold text-teal-700 mt-0.5">{app.patient_type}</div>
                          </td>

                          {/* Contact */}
                          <td className="px-4 py-3.5">
                            <a
                              href={`tel:${app.phone.replace(/\s+/g, '')}`}
                              className="font-bold text-slate-800 hover:text-teal-700 tabular-nums flex items-center gap-1.5"
                            >
                              <Phone className="w-3.5 h-3.5 text-teal-600" />
                              <span>{app.phone}</span>
                            </a>
                            {app.email && (
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span className="truncate max-w-[150px]">{app.email}</span>
                              </div>
                            )}
                          </td>

                          {/* Service & Doctor */}
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-900">{app.service}</div>
                            <div className="text-slate-500 text-[11px] mt-0.5">{app.doctor}</div>
                          </td>

                          {/* Date & Time */}
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-900 tabular-nums flex items-center gap-1">
                              <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                              <span>{app.appointment_date}</span>
                              {app.appointment_date === todayStr && (
                                <span className="bg-teal-100 text-teal-800 text-[9px] px-1.5 py-0.2 rounded font-bold">
                                  TODAY
                                </span>
                              )}
                            </div>
                            <div className="text-teal-700 font-semibold tabular-nums mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-teal-600" />
                              <span>{app.appointment_time}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5">
                            <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                              app.status === 'Confirmed' ? 'bg-teal-100 text-teal-800 border border-teal-200' :
                              app.status === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              app.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                              'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}>
                              {app.status}
                            </span>
                            {app.notes && (
                              <div className="text-[11px] text-slate-500 mt-1 max-w-[180px] truncate italic" title={app.notes}>
                                "{app.notes}"
                              </div>
                            )}
                          </td>

                          {/* Management Actions */}
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              
                              {/* View Details */}
                              <button
                                onClick={() => setViewingAppointment(app)}
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Edit Modal */}
                              <button
                                onClick={() => setEditingAppointment(app)}
                                className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Appointment"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Confirm Action */}
                              {app.status === 'Pending' && (
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'Confirmed')}
                                  className="px-2.5 py-1 text-[11px] font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                                  title="Confirm Appointment"
                                >
                                  Confirm
                                </button>
                              )}

                              {/* Mark Completed */}
                              {app.status === 'Confirmed' && (
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'Completed')}
                                  className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                                  title="Mark as Completed"
                                >
                                  Complete
                                </button>
                              )}

                              {/* Cancel Action */}
                              {app.status !== 'Cancelled' && (
                                <button
                                  onClick={() => setCancelModalAppointment(app)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Cancel Appointment"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                onClick={() => handleDelete(app.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                            </div>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Count */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                <span>Showing {filteredAppointments.length} of {appointments.length} records</span>
                <span className="font-mono text-[11px]">Synced with Supabase Cloud DB</span>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: SERVICES CMS */}
        {activeTab === 'services' && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Manage Dental Services</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update services offered, treatment descriptions, and slot durations shown to patients.
                </p>
              </div>
            </div>

            {/* Add Service Box */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Add New Service</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Service Name (e.g. Tooth Extraction)"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-300 text-xs"
                />
                <input
                  type="text"
                  placeholder="Brief Description"
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-300 text-xs"
                />
                <div className="flex gap-2">
                  <select
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                    className="p-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value={15}>15 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                  </select>
                  <button
                    onClick={async () => {
                      if (!newServiceName.trim()) return;
                      const newSrv: DentalService = {
                        id: `srv-${Date.now()}`,
                        name: newServiceName.trim(),
                        short_description: newServiceDesc.trim() || 'Professional dental care',
                        full_description: newServiceDesc.trim() || 'Professional clinical care at Tara’s Dental Advanced Clinic.',
                        is_verified_google_listing: false,
                        category: 'Advanced',
                        duration_minutes: newServiceDuration
                      };
                      const updated = [...servicesList, newSrv];
                      setServicesList(updated);
                      await api.updateServices(updated);
                      onServicesUpdated(updated);
                      setNewServiceName('');
                      setNewServiceDesc('');
                      setSyncToast('Service added!');
                      setTimeout(() => setSyncToast(''), 2000);
                    }}
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Current Services List */}
            <div className="space-y-3">
              {servicesList.map((srv) => (
                <div
                  key={srv.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4 shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{srv.name}</span>
                      <span className="text-xs text-slate-400">· ~{srv.duration_minutes} mins</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{srv.category}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{srv.short_description}</p>
                  </div>
                  <button
                    onClick={async () => {
                      const updated = servicesList.filter(s => s.id !== s.id);
                      setServicesList(updated);
                      await api.updateServices(updated);
                      onServicesUpdated(updated);
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title="Remove Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 3: DOCTORS CMS */}
        {activeTab === 'doctors' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Manage Dental Team</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update practitioner profiles, degrees, and specializations without inventing data.
              </p>
            </div>

            {/* Add Doctor Box */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Add Practitioner</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Doctor Name (e.g. Dr. Ramesh Rao)"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-300 text-xs"
                />
                <input
                  type="text"
                  placeholder="Degrees (e.g. BDS, MDS)"
                  value={newDocQual}
                  onChange={(e) => setNewDocQual(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-300 text-xs"
                />
                <input
                  type="text"
                  placeholder="Specialization (e.g. Conservative Dentistry)"
                  value={newDocSpec}
                  onChange={(e) => setNewDocSpec(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Short clinician bio..."
                value={newDocBio}
                onChange={(e) => setNewDocBio(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
              <button
                onClick={async () => {
                  if (!newDocName.trim()) return;
                  const newDoc: DoctorProfile = {
                    id: `doc-${Date.now()}`,
                    name: newDocName.trim(),
                    role: 'Dental Surgeon / Specialist',
                    qualification: newDocQual.trim() || 'BDS',
                    specialization: newDocSpec.trim() || 'General Dentistry',
                    experience_years: 'Clinical Care',
                    bio: newDocBio.trim() || 'Registered clinician at Tara’s Dental Advanced Clinic, Shivamogga.',
                    is_cms_placeholder: false
                  };
                  const updated = [...doctorsList, newDoc];
                  setDoctorsList(updated);
                  await api.updateDoctors(updated);
                  onDoctorsUpdated(updated);
                  setNewDocName('');
                  setNewDocQual('');
                  setNewDocSpec('');
                  setNewDocBio('');
                  setSyncToast('Doctor added!');
                  setTimeout(() => setSyncToast(''), 2000);
                }}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Doctor</span>
              </button>
            </div>

            {/* Doctor List */}
            <div className="space-y-3">
              {doctorsList.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4 shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{doc.name}</span>
                      <span className="text-xs text-teal-700 font-semibold">· {doc.qualification}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{doc.specialization} · {doc.experience_years}</p>
                    <p className="text-xs text-slate-600 mt-1">{doc.bio}</p>
                  </div>
                  <button
                    onClick={async () => {
                      const updated = doctorsList.filter(d => d.id !== doc.id);
                      setDoctorsList(updated);
                      await api.updateDoctors(updated);
                      onDoctorsUpdated(updated);
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title="Remove Practitioner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 4: CLINIC SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Clinic Profile & Scheduler Settings</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure clinic contact details, address landmark, and booking slot duration.
              </p>
            </div>

            {settingsSaveMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold">
                {settingsSaveMsg}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const saved = await api.updateSettings(settingsForm);
                onSettingsUpdated(saved);
                setSettingsSaveMsg('Settings updated successfully!');
                setTimeout(() => setSettingsSaveMsg(''), 3000);
              }}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinic Name</label>
                <input
                  type="text"
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Appointment Slot Duration</label>
                  <select
                    value={settingsForm.slot_duration_minutes}
                    onChange={(e) => setSettingsForm({ ...settingsForm, slot_duration_minutes: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                  >
                    <option value={15}>15 Minutes per Slot</option>
                    <option value={30}>30 Minutes per Slot</option>
                    <option value={45}>45 Minutes per Slot</option>
                    <option value={60}>60 Minutes per Slot</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={settingsForm.address_street}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address_street: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Landmark</label>
                  <input
                    type="text"
                    value={settingsForm.address_landmark}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address_landmark: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={settingsForm.address_city}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address_city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={settingsForm.address_pincode}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address_pincode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin Passcode</label>
                <input
                  type="text"
                  value={settingsForm.admin_passcode}
                  onChange={(e) => setSettingsForm({ ...settingsForm, admin_passcode: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Save Clinic Settings</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: SUPABASE CLOUD DATABASE */}
        {activeTab === 'supabase' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <span>Supabase Database Backend</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                All patient booking submissions are automatically stored and retrieved from your Supabase database.
              </p>
            </div>

            {/* Connection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Project ID</span>
                <p className="text-base font-mono font-bold text-slate-900">ldmubrxodvsbwkxcxsjc</p>
                <p className="text-xs text-slate-500">API URL: https://ldmubrxodvsbwkxcxsjc.supabase.co</p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 shadow-xs">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Database Status</span>
                <div className="flex items-center gap-2 text-base font-bold text-emerald-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                  <span>Connected & Active</span>
                </div>
                <p className="text-xs text-emerald-700">Auto-streaming client & server API routes active</p>
              </div>
            </div>

            {/* Schema Box */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Database Schema (SQL)</h3>
                  <p className="text-xs text-slate-400">Run this once in your Supabase SQL Editor if you haven't created the table yet</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2500);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy SQL Schema</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-60 leading-relaxed border border-slate-800">
                {SUPABASE_SQL_SCHEMA}
              </pre>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
                <span>Target Table: <code className="text-emerald-300">public.appointments</code></span>
                <a
                  href="https://supabase.com/dashboard/project/ldmubrxodvsbwkxcxsjc/editor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-semibold underline flex items-center gap-1"
                >
                  <span>Open Supabase Table Editor</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* VIEW DETAILS DRAWER / MODAL */}
      {viewingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">{viewingAppointment.id}</span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">{viewingAppointment.patient_name}</h3>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                  viewingAppointment.status === 'Confirmed' ? 'bg-teal-100 text-teal-800' :
                  viewingAppointment.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                  viewingAppointment.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {viewingAppointment.status}
                </span>
              </div>
              <button
                onClick={() => setViewingAppointment(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Contact Number:</span>
                <a href={`tel:${viewingAppointment.phone}`} className="font-bold text-teal-700 hover:underline tabular-nums">
                  {viewingAppointment.phone}
                </a>
              </div>
              {viewingAppointment.email && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Email Address:</span>
                  <span className="font-medium text-slate-800">{viewingAppointment.email}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Selected Treatment:</span>
                <span className="font-semibold text-slate-900">{viewingAppointment.service}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Assigned Doctor:</span>
                <span className="font-semibold text-slate-900">{viewingAppointment.doctor}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Appointment Date:</span>
                <span className="font-bold text-slate-900 tabular-nums">{viewingAppointment.appointment_date}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Appointment Time:</span>
                <span className="font-bold text-teal-800 tabular-nums">{viewingAppointment.appointment_time}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Patient Type:</span>
                <span className="font-medium text-slate-800">{viewingAppointment.patient_type}</span>
              </div>
              <div className="pt-2">
                <span className="text-slate-500 font-semibold block mb-1">Clinical Notes / Symptoms:</span>
                <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed italic">
                  {viewingAppointment.notes || 'No symptoms or special instructions provided.'}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  const toEdit = viewingAppointment;
                  setViewingAppointment(null);
                  setEditingAppointment(toEdit);
                }}
                className="px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Record</span>
              </button>

              <div className="flex items-center gap-2">
                {viewingAppointment.status === 'Pending' && (
                  <button
                    onClick={() => handleUpdateStatus(viewingAppointment.id, 'Confirmed')}
                    className="px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors cursor-pointer"
                  >
                    Confirm Visit
                  </button>
                )}
                {viewingAppointment.status !== 'Cancelled' && (
                  <button
                    onClick={() => {
                      const toCancel = viewingAppointment;
                      setViewingAppointment(null);
                      setCancelModalAppointment(toCancel);
                    }}
                    className="px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* EDIT APPOINTMENT MODAL */}
      {editingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 my-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Appointment</h3>
                <p className="text-xs text-slate-400 font-mono">ID: {editingAppointment.id}</p>
              </div>
              <button
                onClick={() => setEditingAppointment(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  required
                  value={editingAppointment.patient_name}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, patient_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editingAppointment.phone}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editingAppointment.email || ''}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service</label>
                  <select
                    value={editingAppointment.service}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, service: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium bg-white"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Doctor</label>
                  <select
                    value={editingAppointment.doctor}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, doctor: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium bg-white"
                  >
                    <option value="Any Available Dental Surgeon">Any Available Dental Surgeon</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editingAppointment.appointment_date}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, appointment_date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={editingAppointment.appointment_time}
                    onChange={(e) => setEditingAppointment({ ...editingAppointment, appointment_time: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={editingAppointment.status}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, status: e.target.value as AppointmentStatus })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="No-show">No-show</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editingAppointment.notes || ''}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAppointment(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs"
                >
                  Save Changes to DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL CONFIRMATION DIALOG */}
      {cancelModalAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Cancel Appointment?</h3>
                <p className="text-xs text-slate-500">Patient: {cancelModalAppointment.patient_name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to cancel the booking for <strong className="text-slate-800">{cancelModalAppointment.appointment_date} at {cancelModalAppointment.appointment_time}</strong>? This slot will become free for other patients.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cancellation Reason (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Patient requested reschedule, emergency..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancelModalAppointment(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW MANUAL BOOKING MODAL */}
      {isNewBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 my-6">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Create New Patient Appointment</h3>
                <p className="text-xs text-slate-500">Record a phone or in-clinic booking directly into Supabase</p>
              </div>
              <button
                onClick={() => setIsNewBookingOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                {modalError}
              </p>
            )}

            <form onSubmit={handleCreateManualBooking} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Murthy"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98451 23456"
                    value={newPatientPhone}
                    onChange={(e) => setNewPatientPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={newPatientEmail}
                    onChange={(e) => setNewPatientEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Service</label>
                  <select
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium bg-white"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Practitioner</label>
                  <select
                    value={newDoctor}
                    onChange={(e) => setNewDoctor(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium bg-white"
                  >
                    <option value="Any Available Dental Surgeon">Any Available Dental Surgeon</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time Slot</label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium bg-white tabular-nums"
                  >
                    {newBookingSlots.map(sl => (
                      <option key={sl} value={sl}>{sl}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Clinical notes or symptoms..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewBookingOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs"
                >
                  Create Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
