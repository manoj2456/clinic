import React from 'react';
import { Phone, MapPin, Clock, Lock, ShieldCheck } from 'lucide-react';
import { ClinicSettings } from '../types';

interface FooterProps {
  settings: ClinicSettings;
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
  onOpenPolicy: (type: 'privacy' | 'terms' | 'appointment') => void;
  onOpenTracking?: (id?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenBooking,
  onOpenAdmin,
  onOpenPolicy,
  onOpenTracking
}) => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900 pb-20 sm:pb-8 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-base font-bold text-white tracking-tight">
              {settings.name}
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Dental Clinic · Shivamogga, Karnataka. Committed to compassionate, hygienic, and precise dental healthcare for patients of all ages.
            </p>
            <div className="pt-2 text-slate-500">
              <span className="text-amber-400 font-semibold">4.7 ★</span> Google Verified Rating (50+ Reviews)
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">About Clinic</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Dental Services</a></li>
              <li><a href="#doctors" className="hover:text-white transition-colors">Care Team</a></li>
              <li><a href="#hours" className="hover:text-white transition-colors">Working Hours</a></li>
              <li><a href="#reviews" className="hover:text-white transition-colors">Patient Reviews</a></li>
              <li><a href="#gallery" className="hover:text-white transition-colors">Facility Gallery</a></li>
              <li><a href="#location" className="hover:text-white transition-colors">Directions & Map</a></li>
              <li>
                <button
                  onClick={() => onOpenTracking?.()}
                  className="text-teal-400 hover:text-teal-300 transition-colors font-medium cursor-pointer"
                >
                  Track My Booking
                </button>
              </li>
            </ul>
          </div>

          {/* Consultation Hours */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Consultation Hours
            </h4>
            <div className="space-y-1.5 text-slate-400">
              <div className="flex justify-between">
                <span>Mon – Sat:</span>
                <span className="text-slate-200 font-medium tabular-nums">9:30 AM – 8:30 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span>
                <span className="text-slate-200 font-medium tabular-nums">10:30 AM – 2:30 PM</span>
              </div>
            </div>
            <div className="pt-2 flex flex-col gap-1.5">
              <button
                onClick={onOpenBooking}
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors cursor-pointer text-left"
              >
                Book online to avoid queue →
              </button>
              <button
                onClick={() => onOpenTracking?.()}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
              >
                Track existing appointment status →
              </button>
            </div>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Location & Phone
            </h4>
            <div className="space-y-2 text-slate-400">
              <p className="text-slate-200 font-medium">{settings.address_street}</p>
              <p className="text-teal-400">{settings.address_landmark}</p>
              <p>{settings.address_city}, Karnataka {settings.address_pincode}</p>
              <p className="pt-1">
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="text-white hover:text-teal-400 font-bold tabular-nums text-sm transition-colors"
                >
                  {settings.phone}
                </a>
              </p>
            </div>
          </div>

        </div>

        {/* Medical Disclaimer per Healthcare Guidelines */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] leading-relaxed text-slate-400">
          <p className="font-semibold text-slate-300 mb-0.5">Healthcare & Consultation Disclaimer:</p>
          <p>
            Information provided on this website is for general informational purposes and does not replace professional dental consultation, clinical examination, or diagnosis. Treatment plans are customized following in-person examination at Tara’s Dental Advanced Clinic, Shivamogga.
          </p>
        </div>

        {/* Bottom Bar: Copyright & Policies */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} {settings.name}. All rights reserved.</p>
          
          <div className="flex items-center gap-4 text-slate-500">
            <button
              onClick={() => onOpenPolicy('privacy')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onOpenPolicy('terms')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onOpenPolicy('appointment')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Appointment Policy
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={onOpenAdmin}
              className="hover:text-slate-300 transition-colors cursor-pointer flex items-center gap-1 text-slate-600 hover:text-slate-400"
            >
              <Lock className="w-3 h-3" />
              <span>Staff Portal</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
