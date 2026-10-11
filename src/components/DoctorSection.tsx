import React from 'react';
import { UserCheck, Calendar, ShieldCheck, Stethoscope } from 'lucide-react';
import { DoctorProfile } from '../types';

interface DoctorSectionProps {
  doctors: DoctorProfile[];
  onBookWithDoctor: (doctorName: string) => void;
  onOpenAdmin: () => void;
}

export const DoctorSection: React.FC<DoctorSectionProps> = ({
  doctors,
  onBookWithDoctor,
  onOpenAdmin
}) => {
  return (
    <section id="doctors" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
              Clinical Practitioners
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Our Dental Care Team
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
              Experienced dental professionals committed to gentle, high-precision oral care and transparent diagnosis at Tara’s Dental Advanced Clinic.
            </p>
          </div>

          <div className="text-xs text-slate-500 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shrink-0">
            <span>Practitioner roster managed via Clinic CMS</span>
          </div>
        </div>

        {/* Doctor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="p-6 sm:p-8 space-y-4">
                
                {/* Doctor Avatar / Badge */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0 shadow-inner">
                    <Stethoscope className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                      {doc.name}
                    </h3>
                    <p className="text-xs font-semibold text-teal-700 mt-0.5">
                      {doc.role}
                    </p>
                    <div className="text-xs text-slate-500 mt-0.5">
                      <span>{doc.qualification}</span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-xs text-slate-600 flex items-center justify-between">
                    <span className="font-medium text-slate-500">Specialization:</span>
                    <span className="font-semibold text-slate-800">{doc.specialization}</span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center justify-between">
                    <span className="font-medium text-slate-500">Clinical Background:</span>
                    <span className="font-semibold text-slate-800">{doc.experience_years}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                  {doc.bio}
                </p>
              </div>

              {/* Bottom Card Action */}
              <div className="p-4 sm:p-6 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Accepting appointments</span>
                </div>

                <button
                  onClick={() => onBookWithDoctor(doc.name)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book with Doctor</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Doctor CMS Edit callout for Clinic Admin */}
        <div className="mt-10 text-center">
          <p className="text-xs text-slate-400">
            Clinic Administrator? You can update doctor credentials, qualifications, or add visiting consultants in the{' '}
            <button
              onClick={onOpenAdmin}
              className="text-teal-700 hover:underline font-semibold cursor-pointer"
            >
              Clinic Admin Dashboard
            </button>.
          </p>
        </div>

      </div>
    </section>
  );
};
