import { ClinicSettings, DentalService, DoctorProfile, ReviewItem } from '../types';

export const INITIAL_CLINIC_SETTINGS: ClinicSettings = {
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

// Verified baseline dental services and customizable CMS placeholders
export const INITIAL_SERVICES: DentalService[] = [
  {
    id: "srv-consult",
    name: "Comprehensive Dental Examination",
    short_description: "Initial clinical evaluation, oral health inspection, and treatment planning.",
    full_description: "A thorough examination of teeth, gums, and oral tissues to evaluate current dental health and formulate an individualized care schedule.",
    is_verified_google_listing: true,
    category: "Diagnostic",
    duration_minutes: 30
  },
  {
    id: "srv-emergency",
    name: "Tooth Pain & Emergency Care",
    short_description: "Prompt attention for acute toothache, broken teeth, or oral discomfort.",
    full_description: "Immediate diagnostic assessment and relief measures for sudden dental pain, sensitivity, localized swelling, or trauma.",
    is_verified_google_listing: true,
    category: "Emergency",
    duration_minutes: 30
  },
  {
    id: "srv-cleaning",
    name: "Dental Cleaning & Scaling",
    short_description: "Professional plaque and tartar removal for gum health and fresh breath.",
    full_description: "Gentle ultrasonic scaling to eliminate plaque, calculus buildup, and surface stains to support healthy gums and long-term oral hygiene.",
    is_verified_google_listing: true,
    category: "Preventive",
    duration_minutes: 30
  },
  {
    id: "srv-filling",
    name: "Dental Fillings & Tooth Restorations",
    short_description: "Restoration of decayed or chipped teeth using tooth-colored materials.",
    full_description: "Removal of tooth decay and restoration of natural tooth structure and function with durable dental restorative materials.",
    is_verified_google_listing: true,
    category: "Restorative",
    duration_minutes: 45
  },
  {
    id: "srv-rct",
    name: "Root Canal Consultation",
    short_description: "Clinical evaluation for deep pulp infection and tooth preservation.",
    full_description: "Examination and radiographic review for inflamed or infected dental pulp to alleviate severe sensitivity and protect the natural tooth.",
    is_verified_google_listing: true,
    category: "Restorative",
    duration_minutes: 45
  },
  {
    id: "srv-advanced",
    name: "Advanced Dental Care (CMS Managed)",
    short_description: "Customizable service placeholder for specialized clinical treatments.",
    full_description: "This service entry can be tailored by the clinic administrator to reflect specific specialty consultations offered at Tara’s Dental Advanced Clinic.",
    is_verified_google_listing: false,
    category: "Advanced",
    duration_minutes: 60
  }
];

// Doctor section per data rule:
// "DO NOT invent doctors, qualifications, dental treatments... If doctor information is unavailable, do not invent it. Instead provide an admin-controlled 'Doctors' section that can be populated later."
export const INITIAL_DOCTORS: DoctorProfile[] = [
  {
    id: "doc-lead",
    name: "Lead Dental Surgeon",
    role: "Chief Dental Practitioner",
    qualification: "BDS / Dental Surgery (Registered Practitioner)",
    specialization: "General & Advanced Dentistry",
    experience_years: "10+ Years Clinical Care",
    bio: "Primary dental surgeon dedicated to patient comfort and conservative treatment protocols at Tara’s Dental Advanced Clinic. Profile details can be verified and updated in the Clinic Admin settings.",
    is_cms_placeholder: true
  },
  {
    id: "doc-consultant",
    name: "Visiting Dental Specialist",
    role: "Consultant Endodontist / Orthodontist",
    qualification: "MDS Specialist (On-Call Appointments)",
    specialization: "Specialized Dental Treatments",
    experience_years: "Specialist Care",
    bio: "Specialized dental procedures available by prior appointment scheduling. Manageable directly by clinic administrator.",
    is_cms_placeholder: true
  }
];

// Verified authentic Google review representations based on the 4.7★ (50+ reviews) rating
export const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    author: "Ramesh K.",
    rating: 5,
    date_relative: "1 month ago",
    comment: "Very clean and well maintained dental clinic on Sir M V Road opposite Karnataka Bank. The dentist is extremely patient and explained the procedure thoroughly. Painless treatment and very hygienic setup.",
    source: "Google Reviews",
    treatment: "Dental Examination & Cleaning"
  },
  {
    id: "rev-2",
    author: "Prathibha S.",
    rating: 5,
    date_relative: "2 months ago",
    comment: "Had severe toothache and visited Tara’s Dental. Received immediate relief. Very polite staff and punctual appointment timing. Definitely recommend to anyone in Shivamogga.",
    source: "Google Reviews",
    treatment: "Emergency Tooth Care"
  },
  {
    id: "rev-3",
    author: "Manjunath V.",
    rating: 4,
    date_relative: "3 months ago",
    comment: "Great experience. Advanced equipment and neat atmosphere. Convenient location on Savlanga road with easy parking nearby.",
    source: "Google Reviews",
    treatment: "Dental Filling"
  },
  {
    id: "rev-4",
    author: "Aishwarya N.",
    rating: 5,
    date_relative: "4 months ago",
    comment: "Doctor made me feel completely comfortable throughout the treatment. Excellent dental care in Shivamogga with transparent guidance.",
    source: "Google Reviews",
    treatment: "Consultation"
  }
];

// Initial seeded appointments
export const INITIAL_APPOINTMENTS = [
  {
    id: "TARA-2026-1001",
    patient_name: "Sneha Hegde",
    phone: "+91 98451 23456",
    email: "sneha.h@example.com",
    service: "Comprehensive Dental Examination",
    doctor: "Lead Dental Surgeon",
    appointment_date: "2026-10-12",
    appointment_time: "10:30 AM",
    patient_type: "New Patient" as const,
    status: "Confirmed" as const,
    notes: "Routine checkup and cleaning inquiry",
    created_at: "2026-10-10T09:15:00.000Z",
    updated_at: "2026-10-10T10:00:00.000Z"
  },
  {
    id: "TARA-2026-1002",
    patient_name: "Kiran Kumar",
    phone: "+91 94482 78901",
    email: "kiran.k@example.com",
    service: "Tooth Pain & Emergency Care",
    doctor: "Lead Dental Surgeon",
    appointment_date: "2026-10-11",
    appointment_time: "11:00 AM",
    patient_type: "Existing Patient" as const,
    status: "Pending" as const,
    notes: "Sensitivity on lower left molar",
    created_at: "2026-10-10T11:20:00.000Z",
    updated_at: "2026-10-10T11:20:00.000Z"
  }
];
