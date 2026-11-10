'use client';

import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Leaf } from 'lucide-react';
import { useLoyalty, THERAPIES } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import type { Client } from '@/types';

export default function LoyaltyCard() {
  const { getClientLoyalty } = useLoyalty();
  const { user, isAuthenticated } = useAuth();
  const [query, setQuery] = useState('');
  const [client, setClient] = useState<Client | null>(null);
  const [searched, setSearched] = useState(false);

  // Auto-load when authenticated
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'client') {
      const result = getClientLoyalty(user.email);
      if (result) {
        setClient(result);
        setSearched(true);
        setQuery(user.email);
      }
    }
  }, [isAuthenticated, user, getClientLoyalty]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const result = getClientLoyalty(query.trim());
    setClient(result);
    setSearched(true);
  };

  const stamps = client?.loyaltyStamps ?? 0;
  const isCompleted = stamps >= 20;
  const completedSessions = client?.completedSessions ?? [];

  const getTherapyName = (therapyId: string) => {
    return THERAPIES.find(t => t.id === therapyId)?.name || 'Sessão Dohrnii';
  };

  return (
    <section className="py-20 px-6 bg-[#FBF9F5] border-t border-stone-200/80">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs text-[#8B7E6A] font-sans uppercase tracking-[0.2em] mb-3">Programa de Fidelidade</p>
          <h2 className="font-serif text-3xl md:text-4xl text-[#1C1917] mb-4">
            Cartão Dohrnii <span className="text-[#8B7E6A]">20</span>
          </h2>
          <p className="font-sans text-[#78716C] max-w-lg mx-auto leading-relaxed">
            Cada visita ao nosso santuário aproxima-o do bem-estar pleno. Ao completar 20 sessões, 
            a Dohrnii oferece-lhe uma massagem de cortesia de 60 minutos.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto mb-12">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8B7E6A] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="O seu email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full p-3 pl-11 border border-stone-200/80 rounded-sm bg-white focus:outline-none focus:border-[#4E5E50] focus:ring-1 focus:ring-[#4E5E50]/20 font-sans text-sm text-[#1C1917] transition-all"
            />
          </div>
          <button
            type="submit"
            className="bg-[#4E5E50] text-[#FBF9F5] px-6 py-3 rounded-sm text-sm uppercase tracking-wider hover:bg-[#586B5A] transition-colors btn-press"
          >
            Consultar
          </button>
        </form>

        {/* Results */}
        {searched && (
          <div className="animate-fade-in-up">
            {client ? (
              <div className="bg-white border border-stone-200/80 rounded-sm p-6 sm:p-8 shadow-sm space-y-8">
                {/* Client Header */}
                <div className="text-center border-b border-stone-100 pb-6">
                  <div className="w-12 h-12 bg-[#4E5E50] rounded-full flex items-center justify-center mx-auto mb-3">
                    <Leaf className="w-5 h-5 text-[#FBF9F5]" />
                  </div>
                  <h3 className="font-serif text-xl text-[#1C1917] mb-1">{client.name}</h3>
                  <p className="font-sans text-[#78716C] text-sm">
                    {stamps}/20 sessões completadas
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="w-full max-w-xs mx-auto h-1.5 bg-stone-100 rounded-full mt-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#4E5E50] to-[#586B5A] rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min((stamps / 20) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Congratulations Banner */}
                {isCompleted && (
                  <div className="bg-gradient-to-r from-[#8B7E6A] to-[#A89B87] text-[#FBF9F5] p-5 rounded-sm text-center shadow-md animate-scale-in">
                    <p className="font-serif text-xl mb-1">
                      🎉 Massagem Cortesia Desbloqueada!
                    </p>
                    <p className="font-sans text-sm opacity-90">
                      Parabéns! Contacte-nos para agendar a sua sessão gratuita de 60 minutos.
                    </p>
                  </div>
                )}

                {/* Stamp Grid */}
                <div className="grid grid-cols-5 sm:grid-cols-5 gap-3 sm:gap-4 max-w-sm mx-auto">
                  {Array.from({ length: 20 }).map((_, i) => {
                    const isFilled = i < stamps;
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-full flex items-center justify-center text-sm font-sans transition-all duration-300
                          ${isFilled
                            ? 'bg-[#4E5E50] text-[#FBF9F5] shadow-sm animate-stamp-pop'
                            : 'border-2 border-stone-200 text-stone-300'
                          }`}
                        style={isFilled ? { animationDelay: `${i * 50}ms` } : undefined}
                      >
                        {isFilled ? <Sparkles className="w-4 h-4" /> : i + 1}
                      </div>
                    );
                  })}
                </div>

                {/* Past Sessions */}
                {completedSessions.length > 0 && (
                  <div className="border-t border-stone-100 pt-6">
                    <h4 className="font-serif text-lg text-[#1C1917] mb-4">Últimas Sessões</h4>
                    <ul className="space-y-2">
                      {completedSessions.slice(-5).reverse().map((session, i) => (
                        <li key={i} className="flex justify-between items-center text-sm font-sans py-2 border-b border-stone-50 last:border-0">
                          <span className="text-[#1C1917]">{getTherapyName(session.therapyId)}</span>
                          <span className="text-[#78716C] text-xs">
                            {new Date(session.date).toLocaleDateString('pt-PT')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-stone-200/80 rounded-sm p-8 text-center shadow-sm">
                <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-5 h-5 text-[#78716C]" />
                </div>
                <p className="font-serif text-xl text-[#1C1917] mb-2">Cliente não encontrado</p>
                <p className="font-sans text-[#78716C] text-sm max-w-sm mx-auto">
                  Não encontrámos registos com este email. Agende a sua primeira sessão para ativar o seu cartão de fidelidade.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
