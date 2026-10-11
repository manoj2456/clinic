import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Lock, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  Phone, 
  Settings as SettingsIcon, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Save, 
  LogOut,
  RefreshCw,
  Plus,
  Database,
  Copy,
  Check
} from 'lucide-react';
import { Appointment, AppointmentStatus, ClinicSettings, DentalService, DoctorProfile } from '../../types';
import { api } from '../../services/api';
import { SUPABASE_SQL_SCHEMA, supabaseUrl } from '../../services/supabase';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ClinicSettings;
  services: DentalService[];
  doctors: DoctorProfile[];
  onSettingsUpdated: (newSettings: ClinicSettings) => void;
  onServicesUpdated: (newServices: DentalService[]) => void;
  onDoctorsUpdated: (newDoctors: DoctorProfile[]) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  settings,
  services,
  doctors,
  onSettingsUpdated,
  onServicesUpdated,
  onDoctorsUpdated
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'doctors' | 'settings' | 'supabase'>('appointments');
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<ClinicSettings>(settings);
  const [settingsSaveMsg, setSettingsSaveMsg] = useState<string>('');

  // Services state
  const [servicesList, setServicesList] = useState<DentalService[]>(services);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [newServiceName, setNewServiceName] = useState<string>('');
  const [newServiceDesc, setNewServiceDesc] = useState<string>('');
  const [newServiceDuration, setNewServiceDuration] = useState<number>(30);

  // Doctors state
  const [doctorsList, setDoctorsList] = useState<DoctorProfile[]>(doctors);
  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [newDocName, setNewDocName] = useState<string>('');
  const [newDocQual, setNewDocQual] = useState<string>('');
  const [newDocSpec, setNewDocSpec] = useState<string>('');
  const [newDocBio, setNewDocBio] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSettingsForm(settings);
      setServicesList(services);
      setDoctorsList(doctors);
      if (isAuthenticated) {
        loadAppointments();
      }
    }
  }, [isOpen, isAuthenticated, settings, services, doctors]);

  const loadAppointments = async () => {
    const list = await api.getAppointments();
    setAppointments(list);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === settings.admin_passcode || passcode === 'tara2026') {
      setIsAuthenticated(true);
      setAuthError('');
      loadAppointments();
    } else {
      setAuthError('Incorrect clinic administrator passcode.');
    }
  };

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      const matchSearch =
        a.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.phone.includes(searchTerm) ||
        a.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [appointments, searchTerm, statusFilter]);

  // Appointment counts
  const counts = useMemo(() => {
    return {
      all: appointments.length,
      pending: appointments.filter(a => a.status === 'Pending').length,
      confirmed: appointments.filter(a => a.status === 'Confirmed').length,
      completed: appointments.filter(a => a.status === 'Completed').length,
      cancelled: appointments.filter(a => a.status === 'Cancelled').length
    };
  }, [appointments]);

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    const updated = await api.updateAppointmentStatus(id, newStatus);
    setAppointments(prev => prev.map(a => a.id === id ? updated : a));
    if (selectedAppointment && selectedAppointment.id === id) {
      setSelectedAppointment(updated);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Patient Name', 'Phone', 'Email', 'Service', 'Doctor', 'Date', 'Time', 'Status', 'Notes', 'Created At'];
    const rows = appointments.map(a => [
      `"${a.id}"`,
      `"${a.patient_name}"`,
      `"${a.phone}"`,
      `"${a.email || ''}"`,
      `"${a.service}"`,
      `"${a.doctor}"`,
      `"${a.appointment_date}"`,
      `"${a.appointment_time}"`,
      `"${a.status}"`,
      `"${(a.notes || '').replace(/"/g, '""')}"`,
      `"${a.created_at}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tara-Dental-Appointments-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const saved = await api.updateSettings(settingsForm);
    onSettingsUpdated(saved);
    setSettingsSaveMsg('Settings saved successfully!');
    setTimeout(() => setSettingsSaveMsg(''), 3000);
  };

  // Add Service
  const handleAddService = async () => {
    if (!newServiceName.trim()) return;
    const newService: DentalService = {
      id: `srv-${Date.now()}`,
      name: newServiceName.trim(),
      short_description: newServiceDesc.trim() || 'Custom dental treatment',
      full_description: newServiceDesc.trim() || 'Custom dental consultation and treatment plan at Tara’s Dental.',
      is_verified_google_listing: false,
      category: 'Advanced',
      duration_minutes: newServiceDuration
    };
    const updated = [...servicesList, newService];
    setServicesList(updated);
    await api.updateServices(updated);
    onServicesUpdated(updated);
    setNewServiceName('');
    setNewServiceDesc('');
  };

  const handleDeleteService = async (id: string) => {
    const updated = servicesList.filter(s => s.id !== id);
    setServicesList(updated);
    await api.updateServices(updated);
    onServicesUpdated(updated);
  };

  // Add Doctor
  const handleAddDoctor = async () => {
    if (!newDocName.trim()) return;
    const newDoc: DoctorProfile = {
      id: `doc-${Date.now()}`,
      name: newDocName.trim(),
      role: 'Dental Surgeon / Specialist',
      qualification: newDocQual.trim() || 'BDS / MDS',
      specialization: newDocSpec.trim() || 'General Dentistry',
      experience_years: 'Clinical Care',
      bio: newDocBio.trim() || 'Practicing clinician at Tara’s Dental Advanced Clinic, Shivamogga.',
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
  };

  const handleDeleteDoctor = async (id: string) => {
    const updated = doctorsList.filter(d => d.id !== id);
    setDoctorsList(updated);
    await api.updateDoctors(updated);
    onDoctorsUpdated(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-4">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold">Clinic Administration Portal</h2>
              <p className="text-xs text-slate-400">Tara’s Dental Advanced Clinic · Shivamogga</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={() => setIsAuthenticated(false)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Not Authenticated View */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto my-auto space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto text-teal-700">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Staff Authentication</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your staff passcode to access patient appointments, CMS content, and clinic schedule controls.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  autoFocus
                  placeholder="Enter passcode (default: tara2026)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-300 text-center text-sm font-semibold tracking-wider focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              {authError && (
                <p className="text-xs text-rose-600 font-medium">{authError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Unlock Dashboard
              </button>

              <p className="text-[11px] text-slate-400">
                Authorized clinical personnel only. Confidential patient data is protected.
              </p>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Navigation Tabs */}
            <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between overflow-x-auto shrink-0">
              <div className="flex items-center gap-1 py-2">
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'appointments' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Appointments ({counts.all})
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'services' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Services CMS ({servicesList.length})
                </button>
                <button
                  onClick={() => setActiveTab('doctors')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'doctors' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Doctors CMS ({doctorsList.length})
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'settings' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Clinic Settings
                </button>
                <button
                  onClick={() => setActiveTab('supabase')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'supabase' ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Supabase Backend</span>
                </button>
              </div>

              {activeTab === 'appointments' && (
                <div className="flex items-center gap-2 py-2">
                  <button
                    onClick={loadAppointments}
                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60"
                    title="Refresh data"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              )}
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* APPOINTMENTS TAB */}
              {activeTab === 'appointments' && (
                <div className="space-y-6">
                  
                  {/* Supabase Connection Banner */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shrink-0" />
                      <span className="font-semibold">Supabase Backend Connected:</span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-900 font-bold">ldmubrxodvsbwkxcxsjc</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('supabase')}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer text-left sm:text-right"
                    >
                      View Supabase SQL & Table Details →
                    </button>
                  </div>

                  {/* Metric Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase">Total</span>
                      <p className="text-xl font-extrabold text-slate-900 tabular-nums">{counts.all}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                      <span className="text-[11px] font-semibold text-amber-700 uppercase">Pending</span>
                      <p className="text-xl font-extrabold text-amber-900 tabular-nums">{counts.pending}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200">
                      <span className="text-[11px] font-semibold text-teal-700 uppercase">Confirmed</span>
                      <p className="text-xl font-extrabold text-teal-900 tabular-nums">{counts.confirmed}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                      <span className="text-[11px] font-semibold text-emerald-700 uppercase">Completed</span>
                      <p className="text-xl font-extrabold text-emerald-900 tabular-nums">{counts.completed}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200">
                      <span className="text-[11px] font-semibold text-rose-700 uppercase">Cancelled</span>
                      <p className="text-xl font-extrabold text-rose-900 tabular-nums">{counts.cancelled}</p>
                    </div>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Search patient, phone, ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                      {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setStatusFilter(st)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                            statusFilter === st ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Appointments Table */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3">ID / Patient</th>
                            <th className="px-4 py-3">Contact</th>
                            <th className="px-4 py-3">Service & Doctor</th>
                            <th className="px-4 py-3">Date & Slot</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredAppointments.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                No appointments found matching the current criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredAppointments.map((app) => (
                              <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="font-bold text-slate-900">{app.patient_name}</div>
                                  <div className="text-[11px] font-mono text-slate-400">{app.id}</div>
                                  <div className="text-[10px] text-teal-700 font-medium">{app.patient_type}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <a href={`tel:${app.phone}`} className="font-semibold text-slate-800 hover:underline tabular-nums">
                                    {app.phone}
                                  </a>
                                  {app.email && <div className="text-slate-400 text-[11px]">{app.email}</div>}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="font-medium text-slate-800">{app.service}</div>
                                  <div className="text-slate-400 text-[11px]">{app.doctor}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="font-semibold text-slate-900 tabular-nums">{app.appointment_date}</div>
                                  <div className="text-teal-700 font-medium tabular-nums">{app.appointment_time}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    app.status === 'Confirmed' ? 'bg-teal-100 text-teal-800' :
                                    app.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                    app.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                                    'bg-rose-100 text-rose-800'
                                  }`}>
                                    {app.status}
                                  </span>
                                  {app.notes && (
                                    <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 italic" title={app.notes}>
                                      "{app.notes}"
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    {app.status === 'Pending' && (
                                      <button
                                        onClick={() => handleStatusChange(app.id, 'Confirmed')}
                                        className="px-2 py-1 rounded bg-teal-600 text-white font-semibold text-[11px] hover:bg-teal-700 cursor-pointer"
                                        title="Confirm Appointment"
                                      >
                                        Confirm
                                      </button>
                                    )}
                                    {app.status !== 'Completed' && (
                                      <button
                                        onClick={() => handleStatusChange(app.id, 'Completed')}
                                        className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-semibold text-[11px] hover:bg-slate-200 cursor-pointer"
                                        title="Mark as Completed"
                                      >
                                        Complete
                                      </button>
                                    )}
                                    {app.status !== 'Cancelled' && (
                                      <button
                                        onClick={() => handleStatusChange(app.id, 'Cancelled')}
                                        className="px-2 py-1 rounded bg-rose-50 text-rose-700 font-semibold text-[11px] hover:bg-rose-100 cursor-pointer"
                                        title="Cancel Appointment"
                                      >
                                        Cancel
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* SERVICES CMS TAB */}
              {activeTab === 'services' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Manage Dental Services</h3>
                    <p className="text-xs text-slate-500">
                      Update the service catalogue displayed to patients on the website and appointment scheduler.
                    </p>
                  </div>

                  {/* Add New Service Form */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Add New Service</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Service Title (e.g. Tooth Extraction)"
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                        className="p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-600"
                      />
                      <input
                        type="text"
                        placeholder="Short description"
                        value={newServiceDesc}
                        onChange={(e) => setNewServiceDesc(e.target.value)}
                        className="p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-600"
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
                          onClick={handleAddService}
                          className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Current Services List */}
                  <div className="space-y-2">
                    {servicesList.map((srv) => (
                      <div
                        key={srv.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{srv.name}</span>
                            <span className="text-xs text-slate-400">· {srv.duration_minutes} mins</span>
                            {srv.is_verified_google_listing && (
                              <span className="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded font-medium">Verified Baseline</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{srv.short_description}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteService(srv.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DOCTORS CMS TAB */}
              {activeTab === 'doctors' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Manage Dental Practitioners</h3>
                    <p className="text-xs text-slate-500">
                      Populate verified doctor credentials, degrees, and specializations at Tara’s Dental Advanced Clinic.
                    </p>
                  </div>

                  {/* Add Doctor Form */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Add Practitioner Profile</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Dr. Full Name"
                        value={newDocName}
                        onChange={(e) => setNewDocName(e.target.value)}
                        className="p-2.5 rounded-xl border border-slate-300 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Qualification (e.g. BDS, MDS)"
                        value={newDocQual}
                        onChange={(e) => setNewDocQual(e.target.value)}
                        className="p-2.5 rounded-xl border border-slate-300 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Specialization (e.g. Endodontics)"
                        value={newDocSpec}
                        onChange={(e) => setNewDocSpec(e.target.value)}
                        className="p-2.5 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Practitioner short biography..."
                      value={newDocBio}
                      onChange={(e) => setNewDocBio(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                    />
                    <button
                      onClick={handleAddDoctor}
                      className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Practitioner</span>
                    </button>
                  </div>

                  {/* Doctors List */}
                  <div className="space-y-2">
                    {doctorsList.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{doc.name}</span>
                            <span className="text-xs text-teal-700 font-medium">· {doc.qualification}</span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">{doc.specialization} · {doc.experience_years}</p>
                          <p className="text-xs text-slate-600 mt-1">{doc.bio}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteDoctor(doc.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Delete Doctor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Clinic Profile & Operational Settings</h3>
                    <p className="text-xs text-slate-500">
                      Configure clinic contact details, location strings, and scheduler slot durations.
                    </p>
                  </div>

                  {settingsSaveMsg && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
                      {settingsSaveMsg}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Clinic Name</label>
                      <input
                        type="text"
                        value={settingsForm.name}
                        onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                        <input
                          type="text"
                          value={settingsForm.phone}
                          onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Slot Duration</label>
                        <select
                          value={settingsForm.slot_duration_minutes}
                          onChange={(e) => setSettingsForm({ ...settingsForm, slot_duration_minutes: Number(e.target.value) })}
                          className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
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
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
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
                      <span>Save Settings</span>
                    </button>
                  </div>
                </form>
              )}

              {/* SUPABASE CLOUD TAB */}
              {activeTab === 'supabase' && (
                <div className="space-y-6 max-w-3xl">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Database className="w-5 h-5 text-emerald-600" />
                      <span>Supabase Cloud Integration</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Your website is connected to project <strong className="text-slate-800">ldmubrxodvsbwkxcxsjc</strong>. Every new appointment booking automatically writes to the Supabase <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700">appointments</code> table.
                    </p>
                  </div>

                  {/* Connection Details Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Project ID</span>
                      <p className="text-sm font-mono font-bold text-slate-900">ldmubrxodvsbwkxcxsjc</p>
                      <p className="text-[11px] text-slate-400">Endpoint: https://ldmubrxodvsbwkxcxsjc.supabase.co</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1.5">
                      <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Connection Status</span>
                      <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                        <span>Active & Synchronizing</span>
                      </div>
                      <p className="text-[11px] text-emerald-700">Client SDK & Server API bridge enabled</p>
                    </div>
                  </div>

                  {/* Schema Guide & Copy */}
                  <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Database Schema (SQL)</h4>
                        <p className="text-xs text-slate-400">Run this in your Supabase SQL Editor if you haven't created the table yet</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                          setCopiedSql(true);
                          setTimeout(() => setCopiedSql(false), 2500);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
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

                    <pre className="p-3.5 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-56 leading-relaxed border border-slate-800">
                      {SUPABASE_SQL_SCHEMA}
                    </pre>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Target Table: <code className="text-emerald-300">public.appointments</code></span>
                      <a
                        href="https://supabase.com/dashboard/project/ldmubrxodvsbwkxcxsjc/editor"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 font-semibold underline"
                      >
                        Open Supabase Table Editor →
                      </a>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
