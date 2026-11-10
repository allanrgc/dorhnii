'use client';

import React from 'react';
import { MapPin, Phone, Clock, MessageCircle, ExternalLink } from 'lucide-react';

export default function StudioLocation() {
  const handleWhatsApp = () => {
    window.open('https://wa.me/351912345678?text=Olá!%20Gostaria%20de%20pedir%20mais%20informações.', '_blank');
  };

  const handleMaps = () => {
    window.open('https://maps.google.com/?q=Avenida+da+Liberdade,+120+Lisboa', '_blank');
  };

  return (
    <section className="py-24 px-6 bg-[#FBF9F5] border-t border-stone-200/80">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl text-center text-[#1C1917] mb-16">
          Encontre-nos
        </h2>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-8 items-stretch">
          
          {/* Map Placeholder */}
          <div className="flex-1 rounded-sm overflow-hidden relative min-h-[400px] border border-stone-200/80 shadow-sm bg-stone-100 flex items-center justify-center group">
            {/* Wavy/Gradient background pattern for aesthetics */}
            <div 
              className="absolute inset-0 opacity-20 transition-transform duration-1000 group-hover:scale-105"
              style={{
                background: 'repeating-radial-gradient(circle at 0 0, transparent 0, #FBF9F5 10px), repeating-linear-gradient(#8B7E6A55, #8B7E6A)'
              }}
            />
            
            {/* Map Pin */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-12 h-12 bg-[#4E5E50] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <MapPin className="w-6 h-6 text-[#FBF9F5]" />
              </div>
              <div className="w-4 h-4 bg-[#4E5E50]/20 rounded-full mt-2 animate-[pulse_2s_ease-in-out_infinite] absolute -bottom-4"></div>
            </div>

            {/* Address Overlay */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm p-4 border border-stone-200/80 rounded-sm text-center shadow-sm z-10">
              <p className="font-serif text-[#1C1917] text-lg mb-1">Dohrnii Studio</p>
              <p className="font-sans text-sm text-[#78716C]">Avenida da Liberdade, 120 — Lisboa</p>
            </div>
          </div>

          {/* Contact Info Card */}
          <div className="flex-1 bg-white p-8 md:p-12 border border-stone-200/80 rounded-sm shadow-sm flex flex-col justify-between">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-[#8B7E6A] mt-1 shrink-0" />
                <div>
                  <h3 className="font-serif text-lg text-[#1C1917] mb-1">Morada</h3>
                  <p className="font-sans text-[#78716C] text-sm">Avenida da Liberdade, 120<br/>1250-096 Lisboa, Portugal</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-[#8B7E6A] mt-1 shrink-0" />
                <div>
                  <h3 className="font-serif text-lg text-[#1C1917] mb-1">Contactos</h3>
                  <p className="font-sans text-[#78716C] text-sm">+351 912 345 678</p>
                  <p className="font-sans text-[#78716C] text-sm mt-1">geral@dohrnii.pt</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-[#8B7E6A] mt-1 shrink-0" />
                <div>
                  <h3 className="font-serif text-lg text-[#1C1917] mb-1">Horário</h3>
                  <p className="font-sans text-[#78716C] text-sm">Segunda a Sexta: 09:00 &mdash; 19:00</p>
                  <p className="font-sans text-[#78716C] text-sm mt-1">Sábado: 10:00 &mdash; 16:00</p>
                  <p className="font-sans text-[#78716C] text-sm mt-1 opacity-70">Domingo: Encerrado</p>
                </div>
              </div>
              
              <div className="bg-[#FBF9F5] p-4 rounded-sm border border-stone-100">
                <p className="font-sans text-xs text-[#78716C] leading-relaxed">
                  <strong className="text-[#8B7E6A] font-medium block mb-1">Estacionamento:</strong>
                  Parque subterrâneo disponível a 50m do estúdio. Oferecemos 1h de estacionamento aos nossos clientes mediante apresentação do talão.
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleMaps}
                className="flex-1 flex items-center justify-center gap-2 bg-transparent border border-[#4E5E50] text-[#4E5E50] hover:bg-[#FBF9F5] px-6 py-3 rounded-sm text-sm font-sans uppercase tracking-wider transition-colors"
              >
                Abrir Maps <ExternalLink className="w-4 h-4" />
              </button>
              <button 
                onClick={handleWhatsApp}
                className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b858] text-white px-6 py-3 rounded-sm text-sm font-sans uppercase tracking-wider transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
