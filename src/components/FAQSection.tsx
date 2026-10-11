import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { ClinicSettings } from '../types';

interface FAQSectionProps {
  settings: ClinicSettings;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ settings }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How can I book an appointment at Tara’s Dental?",
      a: "You can book an appointment online right through this website by clicking 'Book an Appointment'. Select your desired dental service, choose a date and time slot, and submit your contact details. Alternatively, you can call us directly at " + settings.phone + "."
    },
    {
      q: "What are the clinic’s opening hours?",
      a: "Tara’s Dental Advanced Clinic is open Monday through Saturday from 9:30 AM to 8:30 PM, and on Sundays from 10:30 AM to 2:30 PM. We recommend booking in advance to minimize waiting time."
    },
    {
      q: "Where is Tara’s Dental Advanced Clinic located in Shivamogga?",
      a: "The clinic is located on Sir M V Road (Savlanga Road), directly opposite Karnataka Bank in Shivamogga, Karnataka (PIN: 577201). Ground floor accessibility and parking are available nearby."
    },
    {
      q: "Can I request a specific appointment time?",
      a: "Yes! Our online scheduler displays live available 30-minute consultation slots. Once you select a time that fits your day, that slot is reserved to prevent double bookings."
    },
    {
      q: "What should I do if I have acute tooth pain or a dental emergency?",
      a: "For immediate tooth pain relief, choose our 'Tooth Pain & Emergency Care' appointment option or call the clinic immediately at " + settings.phone + ". We prioritize acute emergency cases during clinic working hours."
    },
    {
      q: "Are the dental instruments sterilized?",
      a: "Yes. Strict infection control and autoclave sterilization protocols are maintained for every instrument and operatory room between patient consultations to guarantee maximum clinical hygiene."
    }
  ];

  return (
    <section id="faq" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
            Frequently Asked Questions
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Patient Information & Queries
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
            Clear answers regarding appointment scheduling, timings, location, and visit preparation at our Shivamogga clinic.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <span className="text-sm sm:text-base font-semibold text-slate-900">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-teal-700' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in duration-150">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
