import React, { useState } from 'react';
import { 
  Stethoscope, 
  AlertCircle, 
  Sparkles, 
  Wrench, 
  ShieldCheck, 
  Layers, 
  ArrowRight, 
  Calendar,
  X,
  Info
} from 'lucide-react';
import { DentalService } from '../types';

interface ServicesSectionProps {
  services: DentalService[];
  onBookService: (serviceName: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ services, onBookService }) => {
  const [selectedService, setSelectedService] = useState<DentalService | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Diagnostic', 'Preventive', 'Restorative', 'Emergency', 'Advanced'];

  const filteredServices = activeCategory === 'All'
    ? services
    : services.filter(s => s.category === activeCategory);

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'Emergency':
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      case 'Preventive':
        return <ShieldCheck className="w-5 h-5 text-teal-600" />;
      case 'Restorative':
        return <Wrench className="w-5 h-5 text-sky-600" />;
      case 'Advanced':
        return <Layers className="w-5 h-5 text-indigo-600" />;
      default:
        return <Stethoscope className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <section id="services" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
              Clinical Procedures & Care
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Dental Services at Tara’s Dental
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
              Professional dental treatments focused on oral wellness, prompt pain relief, and routine preventative care in Shivamogga.
            </p>
          </div>

          {/* CMS Transparency notice */}
          <div className="text-xs text-slate-500 flex items-center gap-1.5 bg-white px-3 py-2 rounded-lg border border-slate-200 shrink-0 self-start md:self-auto">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Service directory is configurable via Clinic Admin</span>
          </div>
        </div>

        {/* Functional Category Filter Segmented Control */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl mb-8 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all group"
            >
              <div>
                {/* Service Header: Icon + Metadata text (No pills) */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {getServiceIcon(service.category)}
                  </div>
                  <div className="text-xs text-slate-500">
                    <span>{service.category}</span>
                    <span aria-hidden="true" className="mx-1">·</span>
                    <span className="tabular-nums">~{service.duration_minutes} mins</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  {service.name}
                </h3>
                
                <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {service.short_description}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedService(service)}
                  className="text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onBookService(service.name)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Need specific dental consultation or unsure what you need?</h4>
              <p className="text-xs text-slate-600">Schedule a general evaluation and our dental team will assess your condition.</p>
            </div>
          </div>
          <button
            onClick={() => onBookService('Comprehensive Dental Examination')}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            Schedule General Checkup
          </button>
        </div>

      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  {getServiceIcon(selectedService.category)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedService.name}</h3>
                  <div className="text-xs text-slate-500">
                    <span>{selectedService.category} Care</span>
                    <span aria-hidden="true" className="mx-1">·</span>
                    <span className="tabular-nums">Duration: ~{selectedService.duration_minutes} minutes</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                aria-label="Close dialog"
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p className="font-medium text-slate-800">{selectedService.short_description}</p>
              <p>{selectedService.full_description}</p>
              
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
                <p className="font-semibold text-slate-800 mb-1">Appointment Information:</p>
                <p>Appointments are conducted at our Sir M V Road clinic in Shivamogga. All equipment and dental instruments undergo autoclave sterilization before each patient consultation.</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedService(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const sName = selectedService.name;
                  setSelectedService(null);
                  onBookService(sName);
                }}
                className="px-5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book This Service</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
