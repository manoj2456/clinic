import React from 'react';
import { Star, ExternalLink, MessageSquareQuote } from 'lucide-react';
import { INITIAL_REVIEWS } from '../data/initialData';
import { ClinicSettings } from '../types';

interface ReviewsSectionProps {
  settings: ClinicSettings;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ settings }) => {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Tara's Dental Advanced Clinic Sir M V Road Shivamogga")}`;

  return (
    <section id="reviews" className="py-16 lg:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
              Patient Experiences
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              What Our Patients Say
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
              Authentic reviews submitted by patients visiting Tara’s Dental Advanced Clinic in Shivamogga.
            </p>
          </div>

          {/* Google Summary Score Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 self-start md:self-auto shrink-0">
            <div className="text-center pr-3 border-r border-slate-200">
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">4.7</div>
              <div className="flex text-amber-400 text-xs mt-0.5">
                {'★'.repeat(5)}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Google Verified Rating</p>
              <p className="text-xs text-slate-500 tabular-nums">Based on ~50 reviews</p>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {INITIAL_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between hover:shadow-sm hover:border-slate-300 transition-all"
            >
              <div>
                {/* Rating Stars & Quote Icon */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-400 text-sm">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <MessageSquareQuote className="w-5 h-5 text-slate-300" />
                </div>

                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author & Source */}
              <div className="mt-6 pt-4 border-t border-slate-200/60">
                <div className="text-sm font-bold text-slate-900">{rev.author}</div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                  <span className="text-teal-700 font-medium">Google Review</span>
                  <span aria-hidden="true">·</span>
                  <span>{rev.date_relative}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Read More Google Reviews Link */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
          >
            <span>Read More Google Reviews</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
          </a>
          <span className="text-xs text-slate-400">
            Ratings strictly reflect public Google Business Profile records.
          </span>
        </div>

      </div>
    </section>
  );
};
