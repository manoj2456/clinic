import { Appointment, AppointmentStatus, ClinicSettings, DentalService, DoctorProfile } from '../types';
import { INITIAL_APPOINTMENTS, INITIAL_CLINIC_SETTINGS, INITIAL_DOCTORS, INITIAL_SERVICES } from '../data/initialData';
import { supabase } from './supabase';

const STORAGE_KEYS = {
  APPOINTMENTS: 'tara_dental_appointments_v1',
  SETTINGS: 'tara_dental_settings_v1',
  SERVICES: 'tara_dental_services_v1',
  DOCTORS: 'tara_dental_doctors_v1'
};

// Initialize localStorage if not present
function initializeStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_CLINIC_SETTINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) {
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(INITIAL_DOCTORS));
  }
}

initializeStorage();

// Try backend API first with graceful fallback to persistent client storage
export const api = {
  async getAppointments(): Promise<Appointment[]> {
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(data));
          return data;
        }
      }
    } catch {
      // Backend not running or offline, try Supabase directly
    }

    // Direct Supabase query fallback
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(data));
        return data;
      }
    } catch {
      // Offline fallback
    }

    const stored = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return stored ? JSON.parse(stored) : INITIAL_APPOINTMENTS;
  },

  async createAppointment(
    payload: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
    // 1. Validation & Duplicate Booking Prevention
    const appointments = await this.getAppointments();

    const isSlotTaken = appointments.some(app => 
      app.appointment_date === payload.appointment_date &&
      app.appointment_time === payload.appointment_time &&
      app.status !== 'Cancelled'
    );

    if (isSlotTaken) {
      return {
        success: false,
        error: `The ${payload.appointment_time} slot on ${payload.appointment_date} is already booked. Please choose another available slot.`
      };
    }

    const newAppointment: Appointment = {
      ...payload,
      id: `TARA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Also dispatch directly to Supabase
    try {
      await supabase.from('appointments').insert([
        {
          id: newAppointment.id,
          patient_name: newAppointment.patient_name,
          phone: newAppointment.phone,
          email: newAppointment.email || null,
          service: newAppointment.service,
          doctor: newAppointment.doctor,
          appointment_date: newAppointment.appointment_date,
          appointment_time: newAppointment.appointment_time,
          patient_type: newAppointment.patient_type || 'New Patient',
          status: newAppointment.status || 'Pending',
          notes: newAppointment.notes || null,
          created_at: newAppointment.created_at,
          updated_at: newAppointment.updated_at
        }
      ]);
    } catch (e) {
      // Handled gracefully
    }

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.appointment) {
          // Update client cache
          appointments.unshift(data.appointment);
          localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
          window.dispatchEvent(new Event('tara-appointments-updated'));
          return { success: true, appointment: data.appointment };
        }
      }
    } catch {
      // Fallback
    }

    // Client persistence
    appointments.unshift(newAppointment);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    window.dispatchEvent(new Event('tara-appointments-updated'));
    return { success: true, appointment: newAppointment };
  },

  async updateAppointment(
    id: string,
    updates: Partial<Appointment>
  ): Promise<Appointment> {
    const appointments = await this.getAppointments();
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Appointment not found');

    const updated: Appointment = {
      ...appointments[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    // 1. Sync to Supabase directly
    try {
      await supabase.from('appointments').update({
        patient_name: updated.patient_name,
        phone: updated.phone,
        email: updated.email || null,
        service: updated.service,
        doctor: updated.doctor,
        appointment_date: updated.appointment_date,
        appointment_time: updated.appointment_time,
        patient_type: updated.patient_type,
        status: updated.status,
        notes: updated.notes || null,
        updated_at: updated.updated_at
      }).eq('id', id);
    } catch {
      // Handled gracefully
    }

    // 2. Sync to Server
    try {
      await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch {
      // Offline fallback
    }

    appointments[index] = updated;
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    window.dispatchEvent(new Event('tara-appointments-updated'));
    return updated;
  },

  async updateAppointmentStatus(
    id: string,
    status: AppointmentStatus,
    notes?: string,
    rescheduleDate?: string,
    rescheduleTime?: string
  ): Promise<Appointment> {
    return this.updateAppointment(id, {
      status,
      ...(notes !== undefined ? { notes } : {}),
      ...(rescheduleDate ? { appointment_date: rescheduleDate } : {}),
      ...(rescheduleTime ? { appointment_time: rescheduleTime } : {})
    });
  },

  async syncFromDatabase(): Promise<Appointment[]> {
    // 1. Try Supabase
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(data));
        window.dispatchEvent(new Event('tara-appointments-updated'));
        return data;
      }
    } catch {
      // Continue to API
    }

    // 2. Try Server API
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(data));
          window.dispatchEvent(new Event('tara-appointments-updated'));
          return data;
        }
      }
    } catch {
      // Fallback
    }

    return this.getAppointments();
  },

  async deleteAppointment(id: string): Promise<boolean> {
    const appointments = await this.getAppointments();
    const filtered = appointments.filter(a => a.id !== id);

    // 1. Delete from Supabase
    try {
      await supabase.from('appointments').delete().eq('id', id);
    } catch {
      // Handled
    }

    // 2. Delete from Server
    try {
      await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
    } catch {
      // Offline fallback
    }

    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(filtered));
    window.dispatchEvent(new Event('tara-appointments-updated'));
    return true;
  },

  async getSettings(): Promise<ClinicSettings> {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object' && data.name) {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
          return data;
        }
      }
    } catch {
      // Fallback
    }
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && parsed.name) {
          return parsed;
        }
      } catch {
        // Corrupted, reset
      }
    }
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_CLINIC_SETTINGS));
    return INITIAL_CLINIC_SETTINGS;
  },

  async updateSettings(settings: ClinicSettings): Promise<ClinicSettings> {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
    } catch {
      // Fallback
    }
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new Event('tara-settings-updated'));
    return settings;
  },

  async getServices(): Promise<DentalService[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.SERVICES);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // Fallback
      }
    }
    return INITIAL_SERVICES;
  },

  async updateServices(services: DentalService[]): Promise<DentalService[]> {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    window.dispatchEvent(new Event('tara-services-updated'));
    return services;
  },

  async getDoctors(): Promise<DoctorProfile[]> {
    const stored = localStorage.getItem(STORAGE_KEYS.DOCTORS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // Fallback
      }
    }
    return INITIAL_DOCTORS;
  },

  async updateDoctors(doctors: DoctorProfile[]): Promise<DoctorProfile[]> {
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
    window.dispatchEvent(new Event('tara-doctors-updated'));
    return doctors;
  },

  async getAppointmentById(id: string): Promise<Appointment | null> {
    const appointments = await this.getAppointments();
    const cleanId = id.trim().toLowerCase();
    return appointments.find(a => a.id.toLowerCase() === cleanId) || null;
  },

  async trackBooking(query: string): Promise<Appointment[]> {
    const appointments = await this.getAppointments();
    const cleanQuery = query.trim().toLowerCase();
    const cleanDigits = query.replace(/\D/g, '');

    return appointments.filter(app => {
      // 1. Exact or partial ID match
      if (app.id.toLowerCase() === cleanQuery || app.id.toLowerCase().includes(cleanQuery)) {
        return true;
      }
      // 2. Phone match by digits
      if (cleanDigits.length >= 6) {
        const appDigits = app.phone.replace(/\D/g, '');
        if (appDigits.includes(cleanDigits) || cleanDigits.includes(appDigits.slice(-10))) {
          return true;
        }
      }
      // 3. Email match
      if (app.email && app.email.toLowerCase().includes(cleanQuery)) {
        return true;
      }
      // 4. Patient name match
      if (cleanQuery.length >= 3 && app.patient_name.toLowerCase().includes(cleanQuery)) {
        return true;
      }
      return false;
    });
  }
};

