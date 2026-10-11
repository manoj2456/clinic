import React from 'react';
import { Sparkles, HeartPulse, Clock4, ShieldCheck, ArrowRight } from 'lucide-react';
import { ClinicSettings } from '../types';

interface AboutSectionProps {
  settings: ClinicSettings;
  onOpenBooking: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ settings, onOpenBooking }) => {
  return (
    <section id="about" className="py-16 lg:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
            Local Dental Excellence
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            About Tara’s Dental Advanced Clinic
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            {settings.about_text}
          </p>
        </div>

        {/* Content Split: Feature Matrix & Photo Collage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Key Patient Pillars */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                <HeartPulse className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Gentle, Patient-Centered Care</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Every treatment begins with listening to your concerns. We prioritize a calm atmosphere, minimizing procedural anxiety for children, working adults, and seniors alike.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">High Clinical Cleanliness & Hygiene</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Our operatory and sterilization areas follow disciplined healthcare hygiene standards to safeguard every patient visiting our Shivamogga facility.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                <Clock4 className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Reliable Scheduling & Extended Hours</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Operating till 8:30 PM on weekdays and open on Sundays ensures you can schedule your family's oral care conveniently after work or school hours.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Personalized Oral Health Guidance</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Clear, honest diagnosis without unnecessary procedures. We explain every step so you make well-informed decisions for your dental well-being.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <span>Book Your Visit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Right Column: Visual Facility Collage */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="col-span-2 rounded-2xl overflow-hidden border border-slate-200 shadow-md aspect-[16/10] bg-slate-100">
              <img
                src="/src/assets/images/clinic_modern_operatory_1791664180600.jpg"
                alt="Tara’s Dental Modern Treatment Suite"
                className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm aspect-[4/3] bg-slate-100">
              <img
                src="/src/assets/images/clinic_reception_lounge_1791664191529.jpg"
                alt="Patient Reception Lounge"
                className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm aspect-[4/3] bg-slate-100">
              <img
                src="/src/assets/images/clinic_sterilization_suite_1791664202154.jpg"
                alt="Hygiene and Instrument Sterilization Bay"
                className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
