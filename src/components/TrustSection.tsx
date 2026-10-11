import React from 'react';
import { Star, Award, MapPin, CalendarClock } from 'lucide-react';

export const TrustSection: React.FC = () => {
  return (
    <section className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          
          {/* Card 1: Google Rating */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Google Rating</span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">4.7 / 5</div>
              <p className="text-xs text-slate-500 mt-1">From ~50 patient reviews</p>
            </div>
          </div>

          {/* Card 2: Patients' Choice */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-teal-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Patients' Choice</span>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-bold text-slate-900">Highly Recommended</div>
              <p className="text-xs text-slate-500 mt-1">Based on Google reviews</p>
            </div>
          </div>

          {/* Card 3: Convenient Location */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-teal-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Central Location</span>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-bold text-slate-900">Shivamogga</div>
              <p className="text-xs text-slate-500 mt-1">Opposite Karnataka Bank</p>
            </div>
          </div>

          {/* Card 4: Easy Booking */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <CalendarClock className="w-5 h-5 text-teal-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Easy Booking</span>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-bold text-slate-900">Direct Scheduling</div>
              <p className="text-xs text-slate-500 mt-1">Instant slot request online</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
