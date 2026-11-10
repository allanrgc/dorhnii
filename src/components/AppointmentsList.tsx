'use client';

import React, { useState } from 'react';
import { useBooking, useLoyalty } from '@/context/BookingContext';
import { THERAPIES } from '@/context/BookingContext';
import { Check, X, Clock, MessageCircle, Sparkles } from 'lucide-react';
import type { Booking } from '@/types';

type FilterType = 'hoje' | 'proximas' | 'concluidas' | 'canceladas';

const filterLabels: Record<FilterType, string> = {
  hoje: 'Hoje',
  proximas: 'Próximas',
  concluidas: 'Concluídas',
  canceladas: 'Canceladas',
};

export default function AppointmentsList() {
  const { bookings, cancelBooking } = useBooking();
  const { completeSession } = useLoyalty();
  const [filter, setFilter] = useState<FilterType>('hoje');
  const [toast, setToast] = useState<string | null>(null);

  const handleComplete = (bookingId: string) => {
    completeSession(bookingId);
    setToast('Sessão concluída! Carimbo de fidelidade adicionado.');
    setTimeout(() => setToast(null), 3000);
  };

  const getTherapyName = (therapyId: string) => {
    return THERAPIES.find(t => t.id === therapyId)?.name || therapyId;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBookings = bookings.filter((b: Booking) => {
    if (filter === 'hoje') return b.date === todayStr && b.sessionStatus !== 'cancelled' && b.sessionStatus !== 'completed';
    if (filter === 'proximas') return b.date > todayStr && b.sessionStatus !== 'cancelled' && b.sessionStatus !== 'completed';
    if (filter === 'concluidas') return b.sessionStatus === 'completed';
    if (filter === 'canceladas') return b.sessionStatus === 'cancelled';
    return true;
  });

  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#4E5E50] text-white px-6 py-3 rounded-sm shadow-elevated flex items-center gap-3 z-50 animate-toast-in">
          <Check className="w-5 h-5" />
          <span className="font-sans text-sm">{toast}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(filterLabels) as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-sm text-sm font-sans font-medium transition-all duration-200 ${
              filter === f
                ? 'bg-[#4E5E50] text-white shadow-sm'
                : 'bg-white text-[#78716C] hover:bg-stone-50 border border-stone-200/80'
            }`}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {/* Bookings Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredBookings.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#78716C] bg-white rounded-sm border border-stone-200/80 border-dashed">
            <Clock className="w-8 h-8 mx-auto mb-3 text-stone-300" />
            <p className="font-sans text-sm">Não há agendamentos para este filtro.</p>
          </div>
        ) : (
          filteredBookings.map((booking: Booking) => (
            <div
              key={booking.id}
              className="bg-white p-5 rounded-sm border border-stone-200/80 shadow-card flex flex-col h-full card-hover"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-sans font-semibold text-[#1C1917]">{booking.clientName}</h3>
                  <div className="flex items-center text-[#78716C] text-xs mt-1 gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{booking.clientWhatsapp || 'N/A'}</span>
                  </div>
                </div>
                <div
                  className={`px-2.5 py-1 rounded-sm text-[10px] font-sans font-medium uppercase tracking-wider ${
                    booking.sessionStatus === 'completed'
                      ? 'bg-[#E8F0EA] text-[#4E7A5A]'
                      : booking.sessionStatus === 'cancelled'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {booking.sessionStatus === 'completed'
                    ? 'Concluída'
                    : booking.sessionStatus === 'cancelled'
                    ? 'Cancelada'
                    : 'Confirmada'}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2.5 mb-5 flex-1">
                <div className="flex items-center gap-2.5 text-sm">
                  <div className="w-7 h-7 rounded-full bg-[#FBF9F5] flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-[#8B7E6A]" />
                  </div>
                  <span className="font-sans text-[#1C1917] font-medium text-sm">{getTherapyName(booking.therapyId)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#78716C] font-sans">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {new Date(booking.date + 'T00:00:00').toLocaleDateString('pt-PT', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    às {booking.startTime}
                  </span>
                </div>

                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-sans font-medium ${
                    booking.paymentStatus === 'paid'
                      ? 'bg-[#E8F0EA] text-[#4E7A5A]'
                      : 'bg-[#FEF3CD] text-[#B8860B]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {booking.paymentStatus === 'paid' ? '55€ Pago Online' : '60€ Pendente (Local)'}
                </div>
              </div>

              {/* Actions */}
              {booking.sessionStatus === 'scheduled' && (
                <div className="flex gap-2 pt-4 border-t border-stone-100">
                  <button
                    onClick={() => handleComplete(booking.id)}
                    className="flex-1 flex justify-center items-center gap-1.5 px-3 py-2.5 bg-[#4E5E50] text-white rounded-sm hover:bg-[#586B5A] transition-colors text-xs font-sans font-medium btn-press"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Concluir Sessão
                  </button>
                  <button
                    onClick={() => cancelBooking(booking.id)}
                    className="flex-1 flex justify-center items-center gap-1.5 px-3 py-2.5 border border-[#9B4444]/30 text-[#9B4444] rounded-sm hover:bg-red-50 transition-colors text-xs font-sans font-medium btn-press"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
