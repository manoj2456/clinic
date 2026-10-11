import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: 'Clinic Exterior' | 'Reception' | 'Treatment Rooms' | 'Sterilization';
  src: string;
  description: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Clinic Building & Glass Entrance',
    category: 'Clinic Exterior',
    src: '/src/assets/images/clinic_hero_exterior_1791664166640.jpg',
    description: 'Modern glass front and welcoming clinic reception building situated on Sir M V Road, Savlanga Road, Shivamogga.'
  },
  {
    id: 'gal-2',
    title: 'Advanced Dental Operatory Suite',
    category: 'Treatment Rooms',
    src: '/src/assets/images/clinic_modern_operatory_1791664180600.jpg',
    description: 'Ergonomic dental chair, digital intraoral monitoring displays, and hygienic treatment environment for patient comfort.'
  },
  {
    id: 'gal-3',
    title: 'Patient Reception & Waiting Lounge',
    category: 'Reception',
    src: '/src/assets/images/clinic_reception_lounge_1791664191529.jpg',
    description: 'Spacious, relaxed reception lounge with ambient lighting designed to reduce pre-treatment anxiety.'
  },
  {
    id: 'gal-4',
    title: 'Autoclave Instrument Sterilization Bay',
    category: 'Sterilization',
    src: '/src/assets/images/clinic_sterilization_suite_1791664202154.jpg',
    description: 'Medical-grade autoclave sterilization unit and stainless steel tray preparation adhering to strict hygiene guidelines.'
  }
];

export const GallerySection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const categories = ['All', 'Clinic Exterior', 'Treatment Rooms', 'Reception', 'Sterilization'];

  const filteredItems = activeFilter === 'All'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === activeFilter);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeImageIndex === null) return;
      if (e.key === 'Escape') setActiveImageIndex(null);
      if (e.key === 'ArrowRight') {
        setActiveImageIndex((prev) => (prev !== null ? (prev + 1) % filteredItems.length : 0));
      }
      if (e.key === 'ArrowLeft') {
        setActiveImageIndex((prev) => (prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeImageIndex, filteredItems.length]);

  return (
    <section id="gallery" className="py-16 lg:py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
              Inside Tara’s Dental
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Clinic Environment & Infrastructure
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
              Tour our modern clinical facilities in Shivamogga, showcasing our clean operatory, calm reception, and strict sterilization protocols.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl overflow-x-auto self-start md:self-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeFilter === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setActiveImageIndex(idx)}
              className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 relative">
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="p-2.5 rounded-full bg-white/90 text-slate-900 shadow-md">
                    <ZoomIn className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="p-4">
                <span className="text-xs text-teal-700 font-semibold">{item.category}</span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">{item.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {activeImageIndex !== null && filteredItems[activeImageIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            
            {/* Header / Close */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">{filteredItems[activeImageIndex].title}</h3>
                <p className="text-xs text-slate-400">{filteredItems[activeImageIndex].category}</p>
              </div>
              <button
                onClick={() => setActiveImageIndex(null)}
                aria-label="Close Lightbox"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Image with Navigation Buttons */}
            <div className="relative aspect-[16/10] bg-slate-950 flex items-center justify-center overflow-hidden">
              <img
                src={filteredItems[activeImageIndex].src}
                alt={filteredItems[activeImageIndex].title}
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />

              {filteredItems.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : 0));
                    }}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white shadow transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev !== null ? (prev + 1) % filteredItems.length : 0));
                    }}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white shadow transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Description Footer */}
            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <p>{filteredItems[activeImageIndex].description}</p>
              <span className="tabular-nums font-semibold shrink-0 ml-4">
                {activeImageIndex + 1} / {filteredItems.length}
              </span>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
