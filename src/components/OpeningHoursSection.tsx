import React, { useState, useEffect } from 'react';
import { Clock, Phone, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { ClinicSettings } from '../types';
import { getClinicStatus, ClinicStatusInfo } from '../utils/hours';

interface OpeningHoursSectionProps {
  settings: ClinicSettings;
  onOpenBooking: () => void;
}

export const OpeningHoursSection: React.FC<OpeningHoursSectionProps> = ({ settings, onOpenBooking }) => {
  const [statusInfo, setStatusInfo] = useState<ClinicStatusInfo>(() => getClinicStatus(settings.timings));

  // Re-calculate status periodically to update live without page reload
  useEffect(() => {
    const update = () => setStatusInfo(getClinicStatus(settings.timings));
    update();
    const interval = setInterval(update, 30000); // every 30 seconds
    return () => clearInterval(interval);
  }, [settings.timings]);

  return (
    <section id="hours" className="py-16 lg:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Context & Live Status */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
                Consultation Schedule
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Clinic Working Hours
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                Tara’s Dental Advanced Clinic provides flexible consultation hours across all seven days of the week to cater to school, corporate, and family commitments in Shivamogga.
              </p>
            </div>

            {/* Live Status Card based on current Shivamogga time */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Live Clinic Status (Shivamogga Time)
                </span>
                <span className="text-xs font-medium text-slate-400 tabular-nums">
                  {statusInfo.istTimeString} IST
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-3.5 h-3.5 rounded-full ${
                    statusInfo.isOpen ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-rose-500 ring-4 ring-rose-100'
                  }`}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-900">
                      {statusInfo.statusText}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {statusInfo.nextEventText}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Walk-ins welcome, prior booking recommended to prevent waiting.</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={onOpenBooking}
                className="flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>

              <a
                href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                className="flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all"
              >
                <Phone className="w-4 h-4 text-teal-600" />
                <span>Call Clinic</span>
              </a>
            </div>
          </div>

          {/* Right Column: Weekly Schedule Table with Automatic Day Highlight */}
          <div className="lg:col-span-7">
            <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
                <span className="text-sm font-bold text-slate-900">Day of the Week</span>
                <span className="text-sm font-bold text-slate-900">Consultation Hours</span>
              </div>

              <div className="space-y-2">
                {settings.timings.map((timing) => {
                  const isCurrentDay = timing.dayIndex === statusInfo.currentDayIndex;

                  return (
                    <div
                      key={timing.day}
                      className={`flex items-center justify-between py-2.5 px-3.5 rounded-xl text-sm transition-colors ${
                        isCurrentDay
                          ? 'bg-teal-50/80 border border-teal-200 font-semibold text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{timing.day}</span>
                        {isCurrentDay && (
                          <span className="text-xs font-bold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-md">
                            Today
                          </span>
                        )}
                      </div>

                      <div className="tabular-nums font-medium">
                        {timing.display}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>Emergency Dental Assistance:</span>
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="font-semibold text-teal-700 hover:underline tabular-nums"
                >
                  {settings.phone}
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
