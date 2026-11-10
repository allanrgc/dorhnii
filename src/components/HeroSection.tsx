'use client';

import React, { useEffect, useState } from 'react';

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBooking = () => {
    const element = document.getElementById('booking-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-[#FBF9F5] to-[#f2ede4] overflow-hidden">
      {/* Decorative Background Elements */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(#1C1917 1px, transparent 1px)', 
          backgroundSize: '48px 48px' 
        }}
        aria-hidden="true"
      />
      
      {/* Content Container */}
      <div 
        className={`z-10 text-center px-6 max-w-4xl transition-all duration-1000 transform ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h1 className="font-serif text-6xl md:text-8xl text-[#1C1917] tracking-tight mb-4">
          Dohrnii
        </h1>
        
        <p className="font-serif text-xl md:text-3xl text-[#8B7E6A] italic mb-8 font-light">
          Santuário de Serenidade e Toque Terapêutico
        </p>
        
        <div className="w-16 h-[1px] bg-[#8B7E6A] mx-auto mb-8 opacity-40" aria-hidden="true" />
        
        <p className="font-sans text-[#78716C] md:text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
          Acreditamos no poder curativo do toque e no equilíbrio profundo entre corpo, mente e espírito. 
          O nosso espaço foi desenhado para ser o seu refúgio diário de quiet luxury, onde o tempo abranda 
          e o seu bem-estar holístico prevalece.
        </p>
        
        <button
          onClick={scrollToBooking}
          className="bg-[#4E5E50] hover:bg-[#586B5A] text-[#FBF9F5] font-sans px-8 py-4 rounded-sm tracking-wide transition-all duration-300 shadow-sm hover:shadow-md uppercase text-sm"
        >
          Agendar Sessão
        </button>
      </div>
    </section>
  );
}
