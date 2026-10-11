import React from 'react';
import { Calendar, Phone, Star, MapPin, CheckCircle2, Search } from 'lucide-react';
import { ClinicSettings } from '../types';

interface HeroProps {
  settings: ClinicSettings;
  onOpenBooking: () => void;
  onOpenTracking?: (id?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onOpenBooking, onOpenTracking }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-slate-100/70 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Core Value Proposition & Actions */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Unboxed Location Breadcrumb (No pill capsules) */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Sir M V Road, Savlanga Road</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-slate-700">Opposite Karnataka Bank, Shivamogga</span>
            </div>

            {/* Clinic Brand & Primary Headline */}
            <div className="space-y-3">
              <p className="text-xs sm:text-sm font-bold tracking-widest uppercase text-teal-700">
                {settings.name}
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]" style={{ textWrap: 'balance' }}>
                Confident Smiles Start Here
              </h1>
            </div>

            {/* Subheading (No unverified claims) */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              Professional dental care focused on your comfort, oral health, and confident smile. Personalized clinical treatments right in the heart of Shivamogga.
            </p>

            {/* Verified Trust Bullet List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Modern hygienic treatment rooms</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Punctual appointment slots</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Transparent oral healthcare guidance</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Open 7 days a week</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
              >
                <Calendar className="w-4 h-4" />
                <span>Book an Appointment</span>
              </button>

              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm hover:border-slate-400 transition-all"
              >
                <Phone className="w-4 h-4 text-teal-600" />
                <span>Call <span className="tabular-nums">{settings.phone}</span></span>
              </a>
            </div>

            {/* Micro note & Quick Track Link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
              <p className="text-slate-500">
                No walk-in waiting necessary when you reserve in advance
              </p>
              {onOpenTracking && (
                <button
                  type="button"
                  onClick={() => onOpenTracking()}
                  className="inline-flex items-center gap-1.5 font-semibold text-teal-700 hover:text-teal-800 transition-colors cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Already booked? Track appointment status →</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Authentic Clinic Image with Floating Verified Google Rating Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden border border-slate-200/80 shadow-xl bg-slate-100 aspect-[4/3] lg:aspect-[16/11]">
              <img
                src="/src/assets/images/clinic_hero_exterior_1791664166640.jpg"
                alt="Tara’s Dental Advanced Clinic exterior facade in Shivamogga"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                loading="eager"
              />
              
              {/* Subtle gradient overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

              {/* Verified Google Reviews floating anchor card */}
              <div className="absolute bottom-4 left-4 right-4 sm:left-5 sm:right-auto bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3.5 shadow-lg flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold text-slate-900 tabular-nums">4.7</span>
                    <div className="flex text-amber-400 text-xs">
                      {'★'.repeat(5)}
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-500">
                    50+ Google Reviews · Shivamogga
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
