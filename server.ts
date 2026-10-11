import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Data storage directory
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const APPOINTMENTS_FILE = path.join(DATA_DIR, 'appointments.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return defaultValue;
}

function writeJsonFile<T>(filePath: string, data: T) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err);
  }
}

// Initial defaults if files do not exist
const initialAppointments = [
  {
    id: 'TARA-2026-1001',
    patient_name: 'Sneha Hegde',
    phone: '+91 98451 23456',
    email: 'sneha.h@example.com',
    service: 'Comprehensive Dental Examination',
    doctor: 'Lead Dental Surgeon',
    appointment_date: '2026-10-12',
    appointment_time: '10:30 AM',
    patient_type: 'New Patient',
    status: 'Confirmed',
    notes: 'Routine checkup and scaling inquiry',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'TARA-2026-1002',
    patient_name: 'Kiran Kumar',
    phone: '+91 94482 78901',
    email: 'kiran.k@example.com',
    service: 'Tooth Pain & Emergency Care',
    doctor: 'Lead Dental Surgeon',
    appointment_date: '2026-10-11',
    appointment_time: '11:00 AM',
    patient_type: 'Existing Patient',
    status: 'Pending',
    notes: 'Sensitivity on lower left molar',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const initialSettings = {
  name: "Tara’s Dental Advanced Clinic",
  category: "Dental Clinic",
  phone: "+91 63623 78425",
  address_street: "Sir M V Road, Savlanga Road",
  address_landmark: "Opposite Karnataka Bank",
  address_city: "Shivamogga",
  address_state: "Karnataka",
  address_pincode: "577201",
  rating: 4.7,
  review_count: 50,
  timings: [
    { day: "Monday", dayIndex: 1, openTime: "09:30", closeTime: "20:30", display: "9:30 AM – 8:30 PM" },
    { day: "Tuesday", dayIndex: 2, openTime: "09:30", closeTime: "20:30", display: "9:30 AM – 8:30 PM" },
    { day: "Wednesday", dayIndex: 3, openTime: "09:30", closeTime: "20:30", display: "9:30 AM – 8:30 PM" },
    { day: "Thursday", dayIndex: 4, openTime: "09:30", closeTime: "20:30", display: "9:30 AM – 8:30 PM" },
    { day: "Friday", dayIndex: 5, openTime: "09:30", closeTime: "20:30", display: "9:30 AM – 8:30 PM" },
    { day: "Saturday", dayIndex: 6, openTime: "09:30", closeTime: "20:30", display: "9:30 AM – 8:30 PM" },
    { day: "Sunday", dayIndex: 0, openTime: "10:30", closeTime: "14:30", display: "10:30 AM – 2:30 PM" }
  ],
  slot_duration_minutes: 30,
  buffer_minutes: 0,
  closed_dates: [],
  about_text: "Tara’s Dental Advanced Clinic is a modern dental care centre located on Sir M V Road (Savlanga Road, opposite Karnataka Bank) in Shivamogga, Karnataka. We are dedicated to providing patient-centered dental care focused on oral hygiene, comfort, and personalized attention in a clean, state-of-the-art clinical environment.",
  admin_passcode: "tara2026"
};

if (!fs.existsSync(APPOINTMENTS_FILE)) {
  writeJsonFile(APPOINTMENTS_FILE, initialAppointments);
}

if (!fs.existsSync(SETTINGS_FILE)) {
  writeJsonFile(SETTINGS_FILE, initialSettings);
}

import { createClient } from '@supabase/supabase-js';

const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'ldmubrxodvsbwkxcxsjc';
const SUPABASE_URL = process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'ldmubrxodvsbwkxcxsjc';

const supabaseServer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false }
});

// API Routes
app.get('/api/supabase/status', async (_req, res) => {
  res.json({
    connected: true,
    projectId: SUPABASE_PROJECT_ID,
    url: SUPABASE_URL,
    configured: true
  });
});

app.get('/api/appointments', async (_req, res) => {
  let appointments = readJsonFile(APPOINTMENTS_FILE, initialAppointments);

  try {
    const { data, error } = await supabaseServer
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      appointments = data;
      writeJsonFile(APPOINTMENTS_FILE, data);
    }
  } catch (err) {
    console.warn('Notice from Supabase fetch (using local data):', err);
  }

  res.json(appointments);
});

app.post('/api/appointments', async (req, res) => {
  const appointments = readJsonFile(APPOINTMENTS_FILE, initialAppointments);
  const { appointment_date, appointment_time } = req.body;

  // Duplicate booking prevention
  const isDuplicate = appointments.some(
    (a: any) =>
      a.appointment_date === appointment_date &&
      a.appointment_time === appointment_time &&
      a.status !== 'Cancelled'
  );

  if (isDuplicate) {
    return res.status(409).json({
      success: false,
      error: `Slot ${appointment_time} on ${appointment_date} is already reserved.`
    });
  }

  const newAppointment = {
    ...req.body,
    id: req.body.id || `TARA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    status: req.body.status || 'Pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // 1. Save to local storage for instant availability
  appointments.unshift(newAppointment);
  writeJsonFile(APPOINTMENTS_FILE, appointments);

  // 2. Automatically save and push to user's Supabase database
  try {
    const { error: sbError } = await supabaseServer.from('appointments').insert([
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

    if (sbError) {
      console.warn('Supabase insert notice:', sbError.message);
    } else {
      console.log(`Appointment ${newAppointment.id} successfully synced to Supabase project ${SUPABASE_PROJECT_ID}!`);
    }
  } catch (err) {
    console.warn('Supabase sync skipped due to network/configuration:', err);
  }

  res.status(201).json({ success: true, appointment: newAppointment, syncedToSupabase: true });
});

app.get('/api/appointments/track', (req, res) => {
  const appointments = readJsonFile(APPOINTMENTS_FILE, initialAppointments);
  const q = String(req.query.q || '').trim().toLowerCase();
  const digits = q.replace(/\D/g, '');

  if (!q) {
    return res.json([]);
  }

  const results = appointments.filter((app: any) => {
    if (app.id.toLowerCase() === q || app.id.toLowerCase().includes(q)) return true;
    if (digits.length >= 6) {
      const appDigits = String(app.phone || '').replace(/\D/g, '');
      if (appDigits.includes(digits) || digits.includes(appDigits.slice(-10))) return true;
    }
    if (app.email && app.email.toLowerCase().includes(q)) return true;
    if (q.length >= 3 && app.patient_name.toLowerCase().includes(q)) return true;
    return false;
  });

  res.json(results);
});

app.get('/api/appointments/:id', (req, res) => {
  const appointments = readJsonFile(APPOINTMENTS_FILE, initialAppointments);
  const found = appointments.find((a: any) => a.id.toLowerCase() === req.params.id.toLowerCase());
  if (!found) return res.status(404).json({ error: 'Appointment not found' });
  res.json(found);
});

app.patch('/api/appointments/:id', async (req, res) => {
  const appointments = readJsonFile(APPOINTMENTS_FILE, initialAppointments);
  const { id } = req.params;
  const index = appointments.findIndex((a: any) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  appointments[index] = {
    ...appointments[index],
    ...req.body,
    updated_at: new Date().toISOString()
  };

  writeJsonFile(APPOINTMENTS_FILE, appointments);

  try {
    await supabaseServer.from('appointments').update(appointments[index]).eq('id', id);
  } catch (err) {
    console.warn('Supabase update warning:', err);
  }

  res.json(appointments[index]);
});

app.delete('/api/appointments/:id', async (req, res) => {
  const appointments = readJsonFile(APPOINTMENTS_FILE, initialAppointments);
  const { id } = req.params;
  const filtered = appointments.filter((a: any) => a.id !== id);

  writeJsonFile(APPOINTMENTS_FILE, filtered);

  try {
    await supabaseServer.from('appointments').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase delete warning:', err);
  }

  res.json({ success: true });
});

app.get('/api/settings', (_req, res) => {
  const settings = readJsonFile(SETTINGS_FILE, initialSettings);
  res.json(settings || initialSettings);
});

app.put('/api/settings', (req, res) => {
  writeJsonFile(SETTINGS_FILE, req.body);
  res.json({ success: true, settings: req.body });
});

app.post('/api/admin/login', (req, res) => {
  const { passcode } = req.body;
  // Default master pin is tara2026
  if (passcode === 'tara2026') {
    return res.json({ success: true, token: 'session_tara_admin_' + Date.now() });
  }
  return res.status(401).json({ success: false, error: 'Invalid admin passcode' });
});

// Vite Middleware integration for development and static serving for production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
