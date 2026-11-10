'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MessageCircle,
  Sparkles,
  Zap,
  Droplets,
  Flame,
} from 'lucide-react';
import { useBooking, useSchedule, useTherapies } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import { generateBookingId } from '@/lib/schedule-utils';
import type { TherapyId, PaymentMethod, TimeSlot } from '@/types';

interface BookingFlowProps {
  initialTherapy?: TherapyId;
}

const iconMap: Record<string, React.ElementType> = {
  Sparkles,
  Zap,
  Droplets,
  Flame,
};

export default function BookingFlow({ initialTherapy }: BookingFlowProps) {
  const therapies = useTherapies();
  const { createBooking } = useBooking();
  const { getAvailableSlotsForDate } = useSchedule();
  const { user, isAuthenticated } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedTherapy, setSelectedTherapy] = useState<TherapyId | null>(initialTherapy || null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '+351 ' });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online');
  const [bookingResult, setBookingResult] = useState<{ id: string } | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (initialTherapy) setSelectedTherapy(initialTherapy);
  }, [initialTherapy]);

  // Pre-fill form data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.whatsapp || '+351 ',
      });
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const slots = getAvailableSlotsForDate(dateStr);
      setAvailableSlots(slots || []);
      setSelectedTimeSlot(null);
    }
  }, [selectedDate, getAvailableSlotsForDate]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const handlePrevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const now = new Date();
    if (prev.getFullYear() > now.getFullYear() || (prev.getFullYear() === now.getFullYear() && prev.getMonth() >= now.getMonth())) {
      setCurrentMonth(prev);
    }
  };

  const handleDateSelect = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    if (date >= today) {
      setSelectedDate(date);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedTherapy || !selectedDate || !selectedTimeSlot || !formData.name || !formData.email) return;

    const dateStr = selectedDate.toISOString().split('T')[0];
    const result = createBooking({
      clientName: formData.name,
      clientEmail: formData.email,
      clientWhatsapp: formData.phone,
      therapyId: selectedTherapy,
      date: dateStr,
      startTime: selectedTimeSlot.startTime,
      endTime: selectedTimeSlot.endTime,
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
      sessionStatus: 'scheduled',
    });
    setBookingResult(result);
    setStep(4);
  };

  const downloadICS = () => {
    if (!selectedDate || !selectedTimeSlot || !selectedTherapy) return;
    const therapy = therapies.find(t => t.id === selectedTherapy);
    const start = new Date(selectedDate);
    const [hours, minutes] = selectedTimeSlot.startTime.split(':');
    start.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatICS = (d: Date) => {
      return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
    };

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Dohrnii//Booking//PT',
      'BEGIN:VEVENT',
      `SUMMARY:Sessão Dohrnii - ${therapy?.name || 'Terapia'}`,
      `DTSTART:${formatICS(start)}`,
      `DTEND:${formatICS(end)}`,
      'LOCATION:Avenida da Liberdade\\, 120 - Lisboa',
      'DESCRIPTION:O seu momento de bem-estar no Dohrnii.',
      `UID:${bookingResult?.id || 'dohrnii'}@dohrnii.pt`,
      'END:VEVENT',
      'END:VCALENDAR',
    ];

    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dohrnii-sessao-${bookingResult?.id || 'booking'}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openWhatsApp = () => {
    const therapy = therapies.find(t => t.id === selectedTherapy);
    const dateStr = selectedDate ? selectedDate.toLocaleDateString('pt-PT') : '';
    const timeStr = selectedTimeSlot ? selectedTimeSlot.startTime : '';
    const message = `Olá! Gostaria de partilhar o meu agendamento na Dohrnii.\n\nTerapia: ${therapy?.name}\nData: ${dateStr} às ${timeStr}\nID: ${bookingResult?.id}\n\nAté breve! 🌿`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getTherapyName = () => therapies.find(t => t.id === selectedTherapy)?.name || '';
  const getTherapyPrice = () => paymentMethod === 'online' ? '55€' : '60€';

  const resetBooking = () => {
    setStep(1);
    setSelectedTherapy(null);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setFormData({ name: '', email: '', phone: '+351 ' });
    setPaymentMethod('online');
    setBookingResult(null);
  };

  return (
    <section id="booking-section" className="py-20 px-6 bg-white border-t border-stone-200/80">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl text-center text-[#1C1917] mb-4">
          Agendar Sessão
        </h2>
        <p className="text-center text-[#78716C] font-sans mb-12 max-w-lg mx-auto">
          Reserve o seu momento de tranquilidade em três passos simples.
        </p>

        {/* Step Indicator */}
        {step < 4 && (
          <div className="mb-12 flex justify-center items-center gap-0">
            {[
              { num: 1, label: 'Terapia' },
              { num: 2, label: 'Data & Hora' },
              { num: 3, label: 'Confirmação' },
            ].map((s, i) => (
              <React.Fragment key={s.num}>
                {i > 0 && (
                  <div className={`h-[1px] w-12 sm:w-20 ${step > i ? 'bg-[#4E5E50]' : 'bg-stone-200'} transition-colors duration-300`} />
                )}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-sans transition-all duration-300 ${
                      step > s.num
                        ? 'bg-[#4E5E50] text-[#FBF9F5]'
                        : step === s.num
                        ? 'bg-[#4E5E50] text-[#FBF9F5] ring-4 ring-[#4E5E50]/20'
                        : 'bg-[#FBF9F5] text-[#78716C] border border-stone-200/80'
                    }`}
                  >
                    {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className="text-[10px] text-[#78716C] mt-2 font-sans uppercase tracking-wider whitespace-nowrap">
                    {s.label}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="bg-[#FBF9F5] border border-stone-200/80 p-6 sm:p-8 rounded-sm shadow-sm">
          {/* Step 1 — Therapy Selection */}
          {step === 1 && (
            <div className="animate-fade-in-up">
              <h3 className="font-serif text-2xl text-[#1C1917] mb-6">Selecione a Terapia</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {therapies.map(therapy => {
                  const Icon = iconMap[therapy.icon] || Sparkles;
                  return (
                    <div
                      key={therapy.id}
                      onClick={() => setSelectedTherapy(therapy.id)}
                      className={`p-5 border rounded-sm cursor-pointer transition-all duration-200 ${
                        selectedTherapy === therapy.id
                          ? 'border-[#4E5E50] bg-white shadow-sm ring-1 ring-[#4E5E50]/10'
                          : 'border-stone-200/80 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-[#FBF9F5] rounded-full shrink-0">
                          <Icon className="w-4 h-4 text-[#8B7E6A]" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-serif text-lg text-[#1C1917]">{therapy.name}</h4>
                          <p className="text-xs text-[#8B7E6A] font-sans mt-0.5">{therapy.subtitle}</p>
                          <div className="flex items-center gap-3 mt-3">
                            <span className="text-xs font-sans bg-[#E8F0EA] text-[#4E7A5A] px-2 py-0.5 rounded-full">
                              Online: 55€
                            </span>
                            <span className="text-xs font-sans bg-stone-100 text-[#78716C] px-2 py-0.5 rounded-full">
                              Local: 60€
                            </span>
                          </div>
                        </div>
                        {selectedTherapy === therapy.id && (
                          <Check className="w-5 h-5 text-[#4E5E50] shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedTherapy}
                  className="bg-[#4E5E50] hover:bg-[#586B5A] text-[#FBF9F5] px-8 py-3 rounded-sm text-sm uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all btn-press"
                >
                  Próximo
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Date & Time */}
          {step === 2 && (
            <div className="animate-fade-in-up">
              <h3 className="font-serif text-2xl text-[#1C1917] mb-6">Escolha a Data e Hora</h3>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Calendar */}
                <div className="flex-1 bg-white p-5 border border-stone-200/80 rounded-sm">
                  <div className="flex justify-between items-center mb-5">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-[#FBF9F5] rounded-full transition-colors">
                      <ChevronLeft className="w-5 h-5 text-[#4E5E50]" />
                    </button>
                    <span className="font-sans font-medium text-[#1C1917] capitalize">
                      {currentMonth.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-[#FBF9F5] rounded-full transition-colors">
                      <ChevronRight className="w-5 h-5 text-[#4E5E50]" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                      <span key={i} className="text-xs text-[#8B7E6A] font-sans font-medium py-1">
                        {d}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`e-${i}`} />
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                      date.setHours(0, 0, 0, 0);
                      const isPast = date < today;
                      const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
                      const isToday = date.getTime() === today.getTime();

                      return (
                        <button
                          key={day}
                          disabled={isPast}
                          onClick={() => handleDateSelect(day)}
                          className={`w-10 h-10 mx-auto rounded-full font-sans text-sm flex items-center justify-center transition-all duration-200 ${
                            isPast
                              ? 'text-stone-300 cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#4E5E50] text-[#FBF9F5] font-medium'
                              : isToday
                              ? 'ring-1 ring-[#4E5E50] text-[#4E5E50] font-medium hover:bg-[#f2ede4]'
                              : 'text-[#1C1917] hover:bg-[#f2ede4]'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Slots */}
                <div className="flex-1">
                  <p className="text-sm text-[#78716C] font-sans mb-3 flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4" />
                    {selectedDate
                      ? `Horários para ${selectedDate.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}`
                      : 'Selecione uma data'}
                  </p>
                  {selectedDate ? (
                    availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`py-2.5 px-3 border rounded-sm text-sm font-sans transition-all duration-200 ${
                              selectedTimeSlot?.id === slot.id
                                ? 'bg-[#4E5E50] text-[#FBF9F5] border-[#4E5E50]'
                                : 'bg-white text-[#4E5E50] border-stone-200/80 hover:border-[#4E5E50] hover:bg-[#f2ede4]'
                            }`}
                          >
                            {slot.startTime}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="h-40 flex items-center justify-center text-[#78716C] font-sans text-sm p-4 bg-white border border-stone-200/80 rounded-sm">
                        Sem horários disponíveis neste dia.
                      </div>
                    )
                  ) : (
                    <div className="h-40 flex items-center justify-center text-[#78716C] font-sans text-sm p-4 bg-white border border-stone-200/80 rounded-sm text-center">
                      Selecione uma data no calendário para ver os horários disponíveis.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-8 border-t border-stone-200/80 pt-6">
                <button
                  onClick={() => setStep(1)}
                  className="text-[#78716C] px-6 py-3 font-sans text-sm uppercase tracking-wider hover:text-[#1C1917] transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedDate || !selectedTimeSlot}
                  className="bg-[#4E5E50] hover:bg-[#586B5A] text-[#FBF9F5] px-8 py-3 rounded-sm text-sm uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all btn-press"
                >
                  Próximo
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Client Info & Payment */}
          {step === 3 && (
            <div className="animate-fade-in-up">
              <h3 className="font-serif text-2xl text-[#1C1917] mb-6">Informações e Pagamento</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#78716C] font-sans mb-1.5">Nome completo</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="O seu nome"
                      className="w-full p-3 border border-stone-200/80 rounded-sm bg-white focus:outline-none focus:border-[#4E5E50] focus:ring-1 focus:ring-[#4E5E50]/20 font-sans text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#78716C] font-sans mb-1.5">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@exemplo.pt"
                      className="w-full p-3 border border-stone-200/80 rounded-sm bg-white focus:outline-none focus:border-[#4E5E50] focus:ring-1 focus:ring-[#4E5E50]/20 font-sans text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#78716C] font-sans mb-1.5">WhatsApp</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+351 912 345 678"
                      className="w-full p-3 border border-stone-200/80 rounded-sm bg-white focus:outline-none focus:border-[#4E5E50] focus:ring-1 focus:ring-[#4E5E50]/20 font-sans text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Summary & Payment */}
                <div className="space-y-5">
                  <div className="bg-white p-5 border border-stone-200/80 rounded-sm">
                    <h4 className="font-serif text-[#1C1917] border-b border-stone-100 pb-2 mb-3">Resumo</h4>
                    <div className="space-y-2">
                      <p className="flex justify-between text-sm font-sans">
                        <span className="text-[#78716C]">Terapia:</span>
                        <span className="text-[#1C1917] font-medium">{getTherapyName()}</span>
                      </p>
                      <p className="flex justify-between text-sm font-sans">
                        <span className="text-[#78716C]">Data:</span>
                        <span className="text-[#1C1917]">{selectedDate?.toLocaleDateString('pt-PT')}</span>
                      </p>
                      <p className="flex justify-between text-sm font-sans">
                        <span className="text-[#78716C]">Hora:</span>
                        <span className="text-[#1C1917]">{selectedTimeSlot?.startTime} – {selectedTimeSlot?.endTime}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-[#78716C] font-sans">Método de pagamento</p>
                    <div
                      onClick={() => setPaymentMethod('online')}
                      className={`p-4 border rounded-sm cursor-pointer flex justify-between items-center transition-all duration-200 ${
                        paymentMethod === 'online'
                          ? 'border-[#4E5E50] bg-white shadow-sm ring-1 ring-[#4E5E50]/10'
                          : 'border-stone-200/80 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div>
                        <p className="font-sans text-sm font-medium text-[#1C1917]">Pagar Online</p>
                        <p className="font-sans text-xs text-[#4E7A5A]">55€ · Poupe 5€</p>
                      </div>
                      {paymentMethod === 'online' && <Check className="w-5 h-5 text-[#4E5E50]" />}
                    </div>
                    <div
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-4 border rounded-sm cursor-pointer flex justify-between items-center transition-all duration-200 ${
                        paymentMethod === 'cash'
                          ? 'border-[#4E5E50] bg-white shadow-sm ring-1 ring-[#4E5E50]/10'
                          : 'border-stone-200/80 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div>
                        <p className="font-sans text-sm font-medium text-[#1C1917]">Pagar no Local</p>
                        <p className="font-sans text-xs text-[#78716C]">60€ · Dinheiro ou Multibanco</p>
                      </div>
                      {paymentMethod === 'cash' && <Check className="w-5 h-5 text-[#4E5E50]" />}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8 border-t border-stone-200/80 pt-6">
                <button
                  onClick={() => setStep(2)}
                  className="text-[#78716C] px-6 py-3 font-sans text-sm uppercase tracking-wider hover:text-[#1C1917] transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={handleConfirmBooking}
                  disabled={!formData.name || !formData.email}
                  className="bg-[#4E5E50] hover:bg-[#586B5A] text-[#FBF9F5] px-8 py-3 rounded-sm text-sm uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all btn-press"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </div>
          )}

          {/* Step 4 — Confirmation */}
          {step === 4 && (
            <div className="text-center py-8 animate-scale-in">
              {/* Success Checkmark */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-[#4E5E50]/20 rounded-full animate-pulse-ring" />
                <div className="relative w-20 h-20 bg-[#4E5E50] rounded-full flex items-center justify-center text-[#FBF9F5]">
                  <Check className="w-10 h-10" strokeWidth={2.5} />
                </div>
              </div>

              <h3 className="font-serif text-3xl text-[#1C1917] mb-2">Agendamento Confirmado</h3>
              <p className="font-sans text-[#78716C] mb-8">
                Obrigado pela sua preferência. A sua sessão está marcada.
              </p>

              <div className="bg-white border border-stone-200/80 p-6 rounded-sm max-w-md mx-auto mb-8 text-left">
                <p className="text-xs text-[#8B7E6A] font-sans uppercase tracking-widest mb-4 border-b border-stone-100 pb-2">
                  ID: {bookingResult?.id}
                </p>
                <div className="space-y-2">
                  <p className="font-sans text-sm text-[#1C1917]">
                    <span className="text-[#78716C]">Terapia:</span> {getTherapyName()}
                  </p>
                  <p className="font-sans text-sm text-[#1C1917]">
                    <span className="text-[#78716C]">Data:</span> {selectedDate?.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="font-sans text-sm text-[#1C1917]">
                    <span className="text-[#78716C]">Hora:</span> {selectedTimeSlot?.startTime} – {selectedTimeSlot?.endTime}
                  </p>
                  <div className="border-t border-stone-100 pt-2 mt-3">
                    <p className="font-sans text-[#1C1917] font-medium">
                      Total: {getTherapyPrice()}
                      <span className="text-xs text-[#78716C] ml-2">
                        ({paymentMethod === 'online' ? 'Pago online' : 'A pagar no local'})
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={downloadICS}
                  className="flex items-center justify-center gap-2 bg-white border border-[#4E5E50] text-[#4E5E50] hover:bg-[#FBF9F5] px-5 py-3 rounded-sm text-sm font-sans transition-colors btn-press"
                >
                  <CalendarIcon className="w-4 h-4" />
                  Adicionar ao Calendário
                </button>
                <button
                  onClick={openWhatsApp}
                  className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b858] text-white px-5 py-3 rounded-sm text-sm font-sans transition-colors btn-press"
                >
                  <MessageCircle className="w-4 h-4" />
                  Enviar via WhatsApp
                </button>
              </div>

              <div className="mt-10">
                <button
                  onClick={resetBooking}
                  className="text-[#78716C] text-sm font-sans hover:text-[#1C1917] transition-colors underline underline-offset-4"
                >
                  Nova Marcação
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
