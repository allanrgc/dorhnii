'use client';

import { useState } from 'react';
import { BookingProvider } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TherapyCatalog from '@/components/TherapyCatalog';
import BookingFlow from '@/components/BookingFlow';
import LoyaltyCard from '@/components/LoyaltyCard';
import StudioLocation from '@/components/StudioLocation';
import AuthModal from '@/components/AuthModal';
import type { TherapyId } from '@/types';
import { LogIn } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [selectedTherapy, setSelectedTherapy] = useState<TherapyId | undefined>(undefined);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleSelectTherapy = (id: TherapyId) => {
    setSelectedTherapy(id);
  };

  return (
    <BookingProvider>
      <Header />
      <main className="flex-1">
        <HeroSection />
        <TherapyCatalog onSelectTherapy={handleSelectTherapy} />

        {/* Booking: requires auth */}
        {isAuthenticated && user?.role === 'client' ? (
          <BookingFlow initialTherapy={selectedTherapy} />
        ) : (
          <section id="booking-section" className="py-20 px-6 bg-white border-t border-stone-200/80">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-serif text-3xl md:text-4xl text-[#1C1917] mb-4">
                Agendar Sessão
              </h2>
              <p className="text-[#78716C] font-sans mb-8 max-w-lg mx-auto">
                Para agendar a sua sessão e acompanhar o seu cartão de fidelidade, inicie sessão ou crie uma conta gratuita.
              </p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center gap-2 bg-[#4E5E50] hover:bg-[#586B5A] text-[#FBF9F5] px-8 py-4 rounded-sm text-sm font-sans uppercase tracking-wider transition-all btn-press"
              >
                <LogIn className="w-4 h-4" />
                Entrar ou Criar Conta
              </button>
            </div>
          </section>
        )}

        {/* Loyalty: auto-loads when authenticated */}
        <LoyaltyCard />
        <StudioLocation />
      </main>

      {/* Footer */}
      <footer className="bg-[#1C1917] text-stone-400 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="font-serif text-xl text-white mb-1">Dohrnii</p>
              <p className="text-sm">Santuário de Serenidade e Toque Terapêutico</p>
            </div>
            <div className="text-center md:text-right text-sm space-y-1">
              <p>Avenida da Liberdade, 120 — Lisboa</p>
              <p>+351 912 345 678 · geral@dohrnii.pt</p>
            </div>
          </div>
          <div className="divider my-8 opacity-20" />
          <p className="text-center text-xs text-stone-500">
            © {new Date().getFullYear()} Dohrnii. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab="login"
      />
    </BookingProvider>
  );
}
