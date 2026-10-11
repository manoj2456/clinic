export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No-show';

export interface Appointment {
  id: string;
  patient_name: string;
  phone: string;
  email: string;
  service: string;
  doctor: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:MM AM/PM
  patient_type: 'New Patient' | 'Existing Patient';
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DentalService {
  id: string;
  name: string;
  short_description: string;
  full_description: string;
  is_verified_google_listing: boolean;
  category: 'Diagnostic' | 'Restorative' | 'Preventive' | 'Emergency' | 'Advanced';
  duration_minutes: number;
}

export interface DoctorProfile {
  id: string;
  name: string;
  role: string;
  qualification: string;
  specialization: string;
  experience_years: string;
  bio: string;
  is_cms_placeholder: boolean;
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date_relative: string;
  comment: string;
  source: 'Google Reviews';
  treatment?: string;
}

export interface ClinicTiming {
  day: string;
  dayIndex: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  openTime: string; // e.g. "09:30"
  closeTime: string; // e.g. "20:30"
  display: string; // e.g. "9:30 AM – 8:30 PM"
  isClosed?: boolean;
}

export interface ClinicSettings {
  name: string;
  category: string;
  phone: string;
  address_street: string;
  address_landmark: string;
  address_city: string;
  address_state: string;
  address_pincode: string;
  rating: number;
  review_count: number;
  timings: ClinicTiming[];
  slot_duration_minutes: number;
  buffer_minutes: number;
  closed_dates: string[]; // YYYY-MM-DD
  about_text: string;
  admin_passcode: string;
}
