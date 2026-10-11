import React from 'react';
import { Phone, Navigation, Calendar, Search } from 'lucide-react';
import { ClinicSettings } from '../types';

interface MobileBottomBarProps {
  settings: ClinicSettings;
  onOpenBooking: () => void;
  onOpenTracking?: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ 
  settings, 
  onOpenBooking,
  onOpenTracking
}) => {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent("Tara's Dental Advanced Clinic Sir M V Road Savlanga Road Shivamogga")}`;

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg">
      <div className="grid grid-cols-4 gap-1.5">
        {/* Action 1: Call */}
        <a
          href={`tel:${settings.phone.replace(/\s+/g, '')}`}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <Phone className="w-4 h-4 text-teal-600 mb-0.5" />
          <span className="text-[10px] font-semibold">Call</span>
        </a>

        {/* Action 2: Track */}
        <button
          onClick={onOpenTracking}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4 text-teal-700 mb-0.5" />
          <span className="text-[10px] font-semibold">Track</span>
        </button>

        {/* Action 3: Directions */}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <Navigation className="w-4 h-4 text-teal-600 mb-0.5" />
          <span className="text-[10px] font-semibold">Directions</span>
        </a>

        {/* Action 4: Book Appointment */}
        <button
          onClick={onOpenBooking}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl bg-teal-700 text-white shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-white mb-0.5" />
          <span className="text-[10px] font-bold">Book Visit</span>
        </button>
      </div>
    </div>
  );
};
