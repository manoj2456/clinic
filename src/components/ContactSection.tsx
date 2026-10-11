import React from 'react';
import { Phone, MapPin, Clock, Calendar, ExternalLink } from 'lucide-react';
import { ClinicSettings } from '../types';

interface ContactSectionProps {
  settings: ClinicSettings;
  onOpenBooking: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings, onOpenBooking }) => {
  return (
    <section id="contact" className="py-16 lg:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-6">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Personalized Dental Healthcare
            </p>
            
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Ready to schedule your dental visit at Tara’s Dental?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Experience modern, gentle dental care in Shivamogga. Choose an available slot online or speak directly with our reception desk.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-sm">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Direct Telephone</p>
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                    className="text-white hover:text-teal-300 font-bold tabular-nums text-base"
                  >
                    {settings.phone}
                  </a>
                  <p className="text-xs text-slate-400 mt-0.5">Mon–Sat: 9:30 AM–8:30 PM · Sun: 10:30 AM–2:30 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Location</p>
                  <p className="text-white font-medium">{settings.address_street}</p>
                  <p className="text-xs text-teal-300 font-medium">{settings.address_landmark}</p>
                  <p className="text-xs text-slate-400">{settings.address_city}, Karnataka {settings.address_pincode}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 text-sm font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl transition-all shadow-md cursor-pointer active:scale-[0.98]"
              >
                <Calendar className="w-4 h-4 text-slate-950" />
                <span>Book Appointment Online</span>
              </button>

              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
              >
                <Phone className="w-4 h-4 text-teal-400" />
                <span>Call Clinic Directly</span>
              </a>
            </div>

          </div>

          {/* Decorative subtle ambient light */}
          <div className="absolute right-0 bottom-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

      </div>
    </section>
  );
};
