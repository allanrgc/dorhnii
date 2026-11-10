'use client';

import React from 'react';
import { Sparkles, Zap, Droplets, Flame } from 'lucide-react';
import { useTherapies } from '@/context/BookingContext';
import type { TherapyId } from '@/types';

interface TherapyCatalogProps {
  onSelectTherapy: (id: TherapyId) => void;
}

export default function TherapyCatalog({ onSelectTherapy }: TherapyCatalogProps) {
  const therapies = useTherapies();

  const iconMap: Record<string, React.ElementType> = {
    Sparkles,
    Zap,
    Droplets,
    Flame,
  };

  const handleSelect = (id: TherapyId) => {
    onSelectTherapy(id);
    const element = document.getElementById('booking-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!therapies || therapies.length === 0) return null;

  return (
    <section className="py-20 px-6 bg-[#FBF9F5]">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl text-center text-[#1C1917] mb-16">
          Nossas Terapias
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {therapies.map((therapy) => {
            const Icon = iconMap[therapy.icon] || Sparkles;
            return (
            <div
              key={therapy.id}
              className="bg-white border border-stone-200/80 p-8 rounded-sm shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer group"
              onClick={() => handleSelect(therapy.id)}
            >
              <div className="mb-6 p-4 bg-[#FBF9F5] rounded-full w-fit group-hover:bg-[#f2ede4] transition-colors border border-stone-100">
                <Icon className="w-6 h-6 text-[#8B7E6A]" />
              </div>
              
              <h3 className="font-serif text-xl text-[#1C1917] mb-2">{therapy.name}</h3>
              
              <p className="font-sans text-sm text-[#8B7E6A] mb-4">
                {therapy.subtitle}
              </p>
              
              <p className="font-sans text-[#78716C] text-sm mb-8 flex-grow leading-relaxed">
                {therapy.description}
              </p>
              
              <div className="mt-auto border-t border-stone-200/80 pt-6">
                <p className="text-xs text-[#78716C] font-sans mb-4 text-center">
                  55€ online &middot; 60€ presencial
                </p>
                <button 
                  className="w-full py-3 bg-transparent border border-[#4E5E50] text-[#4E5E50] hover:bg-[#4E5E50] hover:text-[#FBF9F5] transition-colors font-sans text-sm rounded-sm uppercase tracking-wider"
                  aria-label={`Agendar ${therapy.name}`}
                >
                  Agendar
                </button>
              </div>
            </div>
          );
          })}
        </div>
      </div>
    </section>
  );
}
