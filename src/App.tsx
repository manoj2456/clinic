import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TrustSection } from './components/TrustSection';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { DoctorSection } from './components/DoctorSection';
import { OpeningHoursSection } from './components/OpeningHoursSection';
import { ReviewsSection } from './components/ReviewsSection';
import { GallerySection } from './components/GallerySection';
import { LocationSection } from './components/LocationSection';
import { FAQSection } from './components/FAQSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { MobileBottomBar } from './components/MobileBottomBar';
import { AppointmentModal } from './components/booking/AppointmentModal';
import { TrackBookingModal } from './components/booking/TrackBookingModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { PolicyModal } from './components/PolicyModal';

import { ClinicSettings, DentalService, DoctorProfile } from './types';
import { INITIAL_CLINIC_SETTINGS, INITIAL_SERVICES, INITIAL_DOCTORS } from './data/initialData';
import { api } from './services/api';

export default function App() {
  const [settings, setSettings] = useState<ClinicSettings>(INITIAL_CLINIC_SETTINGS);
  const [services, setServices] = useState<DentalService[]>(INITIAL_SERVICES);
  const [doctors, setDoctors] = useState<DoctorProfile[]>(INITIAL_DOCTORS);

  // Modal triggers
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [bookingInitialService, setBookingInitialService] = useState<string | undefined>(undefined);
  const [bookingInitialDoctor, setBookingInitialDoctor] = useState<string | undefined>(undefined);

  const [isTrackBookingOpen, setIsTrackBookingOpen] = useState<boolean>(false);
  const [trackingInitialId, setTrackingInitialId] = useState<string | undefined>(undefined);

  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [activePolicyType, setActivePolicyType] = useState<'privacy' | 'terms' | 'appointment' | null>(null);

  useEffect(() => {
    // Initial fetch from API / client storage
    api.getSettings().then((data) => {
      if (data && data.name) setSettings(data);
    });
    api.getServices().then((data) => {
      if (data && data.length) setServices(data);
    });
    api.getDoctors().then((data) => {
      if (data && data.length) setDoctors(data);
    });

    // Event listeners for live CMS synchronization
    const handleSettingsUpdate = () => api.getSettings().then((data) => {
      if (data && data.name) setSettings(data);
    });
    const handleServicesUpdate = () => api.getServices().then((data) => {
      if (data && data.length) setServices(data);
    });
    const handleDoctorsUpdate = () => api.getDoctors().then((data) => {
      if (data && data.length) setDoctors(data);
    });

    window.addEventListener('tara-settings-updated', handleSettingsUpdate);
    window.addEventListener('tara-services-updated', handleServicesUpdate);
    window.addEventListener('tara-doctors-updated', handleDoctorsUpdate);

    return () => {
      window.removeEventListener('tara-settings-updated', handleSettingsUpdate);
      window.removeEventListener('tara-services-updated', handleServicesUpdate);
      window.removeEventListener('tara-doctors-updated', handleDoctorsUpdate);
    };
  }, []);

  const handleOpenBooking = (serviceName?: string, doctorName?: string) => {
    setBookingInitialService(serviceName);
    setBookingInitialDoctor(doctorName);
    setIsBookingOpen(true);
  };

  const handleOpenTracking = (id?: string) => {
    setTrackingInitialId(id);
    setIsTrackBookingOpen(true);
  };

  const activeSettings = settings || INITIAL_CLINIC_SETTINGS;

  if (isAdminOpen) {
    return (
      <AdminPanel
        onBackToWebsite={() => setIsAdminOpen(false)}
        settings={activeSettings}
        services={services}
        doctors={doctors}
        onSettingsUpdated={setSettings}
        onServicesUpdated={setServices}
        onDoctorsUpdated={setDoctors}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* 1. Header (Sticky Top Bar Contract) */}
      <Header
        settings={activeSettings}
        onOpenBooking={() => handleOpenBooking()}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenTracking={handleOpenTracking}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 2. Hero Section */}
        <Hero
          settings={activeSettings}
          onOpenBooking={() => handleOpenBooking()}
          onOpenTracking={handleOpenTracking}
        />

        {/* 3. Trust Strip */}
        <TrustSection />

        {/* 4. About the Clinic */}
        <AboutSection
          settings={activeSettings}
          onOpenBooking={() => handleOpenBooking()}
        />

        {/* 5. Dental Services Grid with Details Modal */}
        <ServicesSection
          services={services}
          onBookService={(serviceName) => handleOpenBooking(serviceName)}
        />

        {/* 6. Working Hours Section (Live IST Calculation) */}
        <OpeningHoursSection
          settings={activeSettings}
          onOpenBooking={() => handleOpenBooking()}
        />

        {/* 7. Clinical Team / Doctors Section (CMS managed) */}
        <DoctorSection
          doctors={doctors}
          onBookWithDoctor={(doctorName) => handleOpenBooking(undefined, doctorName)}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />

        {/* 8. Verified Patient Reviews (Google 4.7★) */}
        <ReviewsSection
          settings={activeSettings}
        />

        {/* 9. Image Gallery with Lightbox */}
        <GallerySection />

        {/* 10. Clinic Location & Google Maps */}
        <LocationSection
          settings={activeSettings}
        />

        {/* 11. FAQ Accordion */}
        <FAQSection
          settings={activeSettings}
        />

        {/* 12. Contact & Call to Action Banner */}
        <ContactSection
          settings={activeSettings}
          onOpenBooking={() => handleOpenBooking()}
        />
      </main>

      {/* 13. Footer */}
      <Footer
        settings={activeSettings}
        onOpenBooking={() => handleOpenBooking()}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenPolicy={(type) => setActivePolicyType(type)}
        onOpenTracking={handleOpenTracking}
      />

      {/* 14. Mobile Bottom Sticky Navigation Bar */}
      <MobileBottomBar
        settings={activeSettings}
        onOpenBooking={() => handleOpenBooking()}
        onOpenTracking={handleOpenTracking}
      />

      {/* 15. Complete 5-Step Appointment Booking Modal */}
      <AppointmentModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        settings={activeSettings}
        services={services}
        doctors={doctors}
        initialService={bookingInitialService}
        initialDoctor={bookingInitialDoctor}
        onTrackBooking={handleOpenTracking}
      />

      {/* 16. Track My Booking Modal */}
      <TrackBookingModal
        isOpen={isTrackBookingOpen}
        onClose={() => {
          setIsTrackBookingOpen(false);
          setTrackingInitialId(undefined);
        }}
        settings={activeSettings}
        services={services}
        initialBookingId={trackingInitialId}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* 17. Legal & Healthcare Policies Modal */}
      <PolicyModal
        type={activePolicyType}
        onClose={() => setActivePolicyType(null)}
        settings={activeSettings}
      />

    </div>
  );
}
