import React, { useState } from 'react';
import { Menu, X, Phone, Lock, Calendar, Search } from 'lucide-react';
import { ClinicSettings } from '../types';
import { INITIAL_CLINIC_SETTINGS } from '../data/initialData';

interface HeaderProps {
  settings?: ClinicSettings | null;
  onOpenBooking: (serviceName?: string) => void;
  onOpenAdmin: () => void;
  onOpenTracking?: (id?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenBooking,
  onOpenAdmin,
  onOpenTracking
}) => {
  const currentSettings = settings || INITIAL_CLINIC_SETTINGS;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element in display face, no pill clutter) */}
        <a
          href="#"
          className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-teal-700 transition-colors"
        >
          {currentSettings.name}
        </a>

        {/* Zone 2: 4-5 Clean single-line nav links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a href="#about" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            About
          </a>
          <a href="#services" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            Services
          </a>
          <a href="#hours" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            Timings
          </a>
          <a href="#reviews" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            Reviews
          </a>
          <a href="#gallery" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            Gallery
          </a>
          <a href="#contact" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            Contact
          </a>
        </nav>

        {/* Zone 3: 1 Primary CTA Button (+ Track Booking + Admin trigger) */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          <a
            href={`tel:${currentSettings.phone.replace(/\s+/g, '')}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-teal-700 px-2.5 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors whitespace-nowrap"
            title="Call Tara's Dental Clinic"
          >
            <Phone className="w-3.5 h-3.5 text-teal-600" />
            <span className="tabular-nums">{currentSettings.phone}</span>
          </a>

          <button
            onClick={() => onOpenTracking?.()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-teal-800 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors cursor-pointer whitespace-nowrap"
            title="Track Existing Booking Status"
          >
            <Search className="w-3.5 h-3.5 text-teal-700" />
            <span>Track Booking</span>
          </button>

          <button
            onClick={() => onOpenBooking()}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap cursor-pointer active:scale-[0.98]"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>

          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:text-teal-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            title="Open Clinic Admin Panel"
          >
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Admin</span>
          </button>
        </div>

        {/* Mobile controls */}
        <div className="flex sm:hidden items-center gap-1.5">
          <button
            onClick={() => onOpenTracking?.()}
            className="p-1.5 text-teal-800 bg-teal-50 rounded-lg border border-teal-200"
            title="Track Booking"
            aria-label="Track Booking"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenBooking()}
            className="px-2.5 py-1.5 text-xs font-semibold text-white bg-teal-700 rounded-lg shadow-sm"
          >
            Book
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 text-slate-700 rounded-lg hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-2 text-base font-medium text-slate-700">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              About Clinic
            </a>
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Dental Services
            </a>
            <a
              href="#hours"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Working Hours
            </a>
            <a
              href="#reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Patient Reviews
            </a>
            <a
              href="#gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Clinic Gallery
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              Location & Contact
            </a>
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTracking?.();
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-teal-900 bg-teal-50 border border-teal-200 rounded-lg"
            >
              <Search className="w-4 h-4 text-teal-700" />
              <span>Track My Booking</span>
            </button>

            <a
              href={`tel:${currentSettings.phone.replace(/\s+/g, '')}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-slate-800 bg-slate-100 rounded-lg"
            >
              <Phone className="w-4 h-4 text-teal-700" />
              <span>Call {currentSettings.phone}</span>
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Clinic Staff Login</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
