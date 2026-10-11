import React from 'react';
import { X, ShieldCheck, FileText, CalendarCheck } from 'lucide-react';
import { ClinicSettings } from '../types';

interface PolicyModalProps {
  type: 'privacy' | 'terms' | 'appointment' | null;
  onClose: () => void;
  settings: ClinicSettings;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ type, onClose, settings }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
              {type === 'privacy' && <ShieldCheck className="w-5 h-5" />}
              {type === 'terms' && <FileText className="w-5 h-5" />}
              {type === 'appointment' && <CalendarCheck className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {type === 'privacy' && 'Patient Privacy Policy'}
                {type === 'terms' && 'Terms & Conditions'}
                {type === 'appointment' && 'Appointment & Clinic Policy'}
              </h3>
              <p className="text-xs text-slate-500">{settings.name} · Shivamogga</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content based on type */}
        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-4">
          {type === 'privacy' && (
            <>
              <p>
                Tara’s Dental Advanced Clinic respects the privacy of our patients. We gather minimal contact information (Full Name, Phone Number, Email, and clinical symptoms/notes) exclusively for scheduling and confirming your dental consultation.
              </p>
              <h4 className="font-bold text-slate-800 text-sm">Patient Data Protection</h4>
              <p>
                Your submitted contact information is stored strictly for clinic communication and appointment management. We do not sell, rent, or distribute personal information to third-party commercial marketing entities.
              </p>
              <h4 className="font-bold text-slate-800 text-sm">Medical Records</h4>
              <p>
                Formal diagnosis, dental radiographs, and medical histories gathered during your in-person clinic visit are protected under medical record confidentiality guidelines.
              </p>
            </>
          )}

          {type === 'terms' && (
            <>
              <p>
                By scheduling an appointment through this platform, you agree to adhere to the terms and clinical consultation guidelines of Tara’s Dental Advanced Clinic.
              </p>
              <h4 className="font-bold text-slate-800 text-sm">Informational Nature of Website</h4>
              <p>
                Information provided on this website is for general oral healthcare guidance only. It does not replace comprehensive in-person dental examination or clinical diagnosis by a registered dental surgeon.
              </p>
              <h4 className="font-bold text-slate-800 text-sm">Treatment Decisions</h4>
              <p>
                Specific dental procedures, durations, and clinical costs are evaluated and discussed with the patient after an in-person oral checkup at our Sir M V Road clinic in Shivamogga.
              </p>
            </>
          )}

          {type === 'appointment' && (
            <>
              <p>
                We value your time and strive to maintain punctual appointment schedules for every patient.
              </p>
              <h4 className="font-bold text-slate-800 text-sm">Arrival Guidance</h4>
              <p>
                Please arrive 5 to 10 minutes prior to your scheduled consultation slot to allow for basic registration and health intake.
              </p>
              <h4 className="font-bold text-slate-800 text-sm">Rescheduling & Cancellations</h4>
              <p>
                If you need to change your appointment date or time, please notify our reception team at least 2 to 3 hours in advance via telephone at <span className="font-bold text-slate-900 tabular-nums">{settings.phone}</span>.
              </p>
              <h4 className="font-bold text-slate-800 text-sm">Walk-In & Emergency Cases</h4>
              <p>
                While appointments have priority, acute dental emergencies (severe pain, bleeding, or dental trauma) are stabilized promptly during clinic opening hours.
              </p>
            </>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
};
