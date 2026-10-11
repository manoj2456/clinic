import React from 'react';
import { MapPin, Navigation, Phone, ExternalLink, Clock } from 'lucide-react';
import { ClinicSettings } from '../types';

interface LocationSectionProps {
  settings: ClinicSettings;
}

export const LocationSection: React.FC<LocationSectionProps> = ({ settings }) => {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent("Tara's Dental Advanced Clinic, Sir M V Road, Savlanga Road, opposite Karnataka Bank, Shivamogga, Karnataka 577201")}`;
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Tara's Dental Advanced Clinic Shivamogga")}`;

  return (
    <section id="location" className="py-16 lg:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
            Visit Us in Shivamogga
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Clinic Location & Directions
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Conveniently situated on Sir M V Road (Savlanga Road) opposite Karnataka Bank with straightforward access and nearby vehicle parking.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Clinic Address Card & Actions */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-100/70 border border-teal-200/60 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-teal-800" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{settings.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">Dental Healthcare Centre</p>
                </div>
              </div>

              {/* Exact Address */}
              <div className="space-y-1.5 p-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 leading-relaxed">
                <p className="font-semibold text-slate-900">{settings.address_street}</p>
                <p className="text-teal-700 font-medium">{settings.address_landmark}</p>
                <p>{settings.address_city}, {settings.address_state} – <span className="tabular-nums font-medium">{settings.address_pincode}</span></p>
                <p className="text-xs text-slate-400 mt-1">India</p>
              </div>

              {/* Landmark Guidance */}
              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">How to reach:</p>
                <p>Located directly across from Karnataka Bank on Savlanga Road. Visible roadside premises with ground-level access.</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row gap-3">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-sm transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Directions</span>
              </a>

              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all"
              >
                <Phone className="w-4 h-4 text-teal-600" />
                <span>Call Clinic</span>
              </a>
            </div>
          </div>

          {/* Right Column: Google Maps Embed with fallback link */}
          <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative min-h-[380px] bg-slate-100">
            <iframe
              title="Tara’s Dental Advanced Clinic Google Maps Location"
              src="https://maps.google.com/maps?q=Tara's%20Dental%20Advanced%20Clinic%20Sir%20M%20V%20Road%20Savlanga%20Road%20Shivamogga%20Karnataka%20577201&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '380px' }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />

            {/* Floating Open Maps Badge */}
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 shadow-sm flex items-center gap-1.5">
              <a
                href={mapSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-teal-700 flex items-center gap-1"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
