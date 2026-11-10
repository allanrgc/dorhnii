'use client';

import { useState } from 'react';
import { BookingProvider } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import TherapistDashboard from '@/components/TherapistDashboard';
import { Shield, Lock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TerapeutaPage() {
  const { user, isAuthenticated, loginTherapist } = useAuth();
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const isTherapist = isAuthenticated && user?.role === 'therapist';

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = loginTherapist(pin);
    if (!result.success) {
      setError(result.error || 'PIN incorreto.');
      setPin('');
    }
  };

  if (isTherapist) {
    return (
      <BookingProvider>
        <Header />
        <main className="flex-1">
          <TherapistDashboard />
        </main>
      </BookingProvider>
    );
  }

  // PIN access screen
  return (
    <BookingProvider>
      <Header />
      <main className="flex-1 flex items-center justify-center min-h-[80vh] bg-[#FBF9F5] px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white border border-stone-200/80 rounded-sm shadow-card p-8 animate-fade-in-up">
            {/* Icon */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#FBF9F5] rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-200/80">
                <Shield className="w-7 h-7 text-[#4E5E50]" />
              </div>
              <h1 className="font-serif text-2xl text-[#1C1917] mb-1">Painel do Terapeuta</h1>
              <p className="font-sans text-sm text-[#78716C]">
                Acesso restrito. Introduza o PIN de segurança.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-[#FDE8E8] border border-[#9B4444]/20 rounded-sm text-sm text-[#9B4444] font-sans animate-slide-down text-center">
                {error}
              </div>
            )}

            {/* PIN Form */}
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[#78716C] font-sans mb-1.5">Código PIN</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8B7E6A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    required
                    autoFocus
                    maxLength={10}
                    className="w-full p-3 pl-10 border border-stone-200/80 rounded-sm bg-[#FBF9F5] focus:outline-none focus:border-[#4E5E50] focus:ring-1 focus:ring-[#4E5E50]/20 font-sans text-sm text-center tracking-[0.5em] transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={!pin}
                className="w-full bg-[#4E5E50] hover:bg-[#586B5A] text-[#FBF9F5] py-3 rounded-sm text-sm font-sans uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed btn-press"
              >
                Aceder ao Painel
              </button>
            </form>

            {/* Back link */}
            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-1.5 text-sm text-[#78716C] font-sans hover:text-[#1C1917] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar ao portal
              </button>
            </div>
          </div>
        </div>
      </main>
    </BookingProvider>
  );
}
