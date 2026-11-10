'use client';

import React, { useState, useEffect } from 'react';
import { useSchedule } from '@/context/BookingContext';
import type { DaySchedule, Weekday, TimeSlot, DateOverride } from '@/types';
import { Save, Plus, Trash2, Calendar } from 'lucide-react';

const WEEKDAY_LABELS: Record<Weekday, string> = {
  segunda: 'Segunda-feira',
  terca: 'Terça-feira',
  quarta: 'Quarta-feira',
  quinta: 'Quinta-feira',
  sexta: 'Sexta-feira',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

const WEEKDAY_ORDER: Weekday[] = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

export default function ScheduleSettings() {
  const {
    weeklySchedule,
    updateWeeklySchedule,
    dateOverrides,
    addDateOverride,
    removeDateOverride,
    bufferMinutes,
    updateBufferMinutes,
    generateSlotsForDate,
  } = useSchedule();

  const [localSchedule, setLocalSchedule] = useState<DaySchedule[]>(weeklySchedule);
  const [localBuffer, setLocalBuffer] = useState(bufferMinutes);
  const [selectedDate, setSelectedDate] = useState('');
  const [isDayOff, setIsDayOff] = useState(false);
  const [dateSlots, setDateSlots] = useState<TimeSlot[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [customSlotStart, setCustomSlotStart] = useState('');
  const [customSlotEnd, setCustomSlotEnd] = useState('');
  const [showCustomSlotForm, setShowCustomSlotForm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setLocalSchedule(weeklySchedule);
  }, [weeklySchedule]);

  useEffect(() => {
    setLocalBuffer(bufferMinutes);
  }, [bufferMinutes]);

  const updateDayField = (weekday: Weekday, field: keyof DaySchedule, value: string | boolean) => {
    setLocalSchedule(prev =>
      prev.map(day =>
        day.weekday === weekday ? { ...day, [field]: value } : day
      )
    );
  };

  const handleSaveWeekly = () => {
    updateWeeklySchedule(localSchedule);
    updateBufferMinutes(localBuffer);
    showToast('Horário semanal guardado com sucesso!');
  };

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);

    const override = dateOverrides.find(o => o.date === date);
    if (override) {
      setIsDayOff(override.isDayOff);
      setBlockedSlots(override.blockedSlots);
    } else {
      setIsDayOff(false);
      setBlockedSlots([]);
    }

    if (date) {
      const slots = generateSlotsForDate(date);
      setDateSlots(slots);
    }
  };

  const toggleSlotBlock = (slotId: string) => {
    setBlockedSlots(prev =>
      prev.includes(slotId)
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    );
  };

  const handleAddCustomSlot = () => {
    if (!customSlotStart || !customSlotEnd) return;
    const existingOverride = dateOverrides.find(o => o.date === selectedDate);
    const customSlots = existingOverride?.customSlots || [];

    addDateOverride({
      date: selectedDate,
      isDayOff: false,
      blockedSlots,
      customSlots: [...customSlots, { startTime: customSlotStart, endTime: customSlotEnd }],
    });

    setCustomSlotStart('');
    setCustomSlotEnd('');
    setShowCustomSlotForm(false);

    // Refresh slots
    setTimeout(() => {
      const slots = generateSlotsForDate(selectedDate);
      setDateSlots(slots);
    }, 100);

    showToast('Horário extra adicionado!');
  };

  const handleSaveOverride = () => {
    if (!selectedDate) return;
    const existingOverride = dateOverrides.find(o => o.date === selectedDate);

    addDateOverride({
      date: selectedDate,
      isDayOff,
      blockedSlots,
      customSlots: existingOverride?.customSlots || [],
    });

    showToast('Exceção de data guardada!');
  };

  const handleRemoveOverride = (date: string) => {
    removeDateOverride(date);
    if (selectedDate === date) {
      setSelectedDate('');
      setDateSlots([]);
    }
    showToast('Exceção removida.');
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-10">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#4E5E50] text-white px-6 py-3 rounded-sm shadow-elevated flex items-center gap-3 z-50 animate-toast-in">
          <Save className="w-4 h-4" />
          <span className="font-sans text-sm">{toast}</span>
        </div>
      )}

      {/* Section 1: Weekly Schedule */}
      <section className="bg-white p-6 sm:p-8 rounded-sm shadow-card border border-stone-200/80">
        <h2 className="text-2xl font-serif text-[#1C1917] mb-6">Horário Semanal</h2>

        <div className="space-y-3">
          {WEEKDAY_ORDER.map((weekday) => {
            const day = localSchedule.find(d => d.weekday === weekday);
            if (!day) return null;

            return (
              <div
                key={weekday}
                className={`flex items-center flex-wrap gap-4 p-4 rounded-sm border transition-colors ${
                  day.enabled
                    ? 'border-stone-200/80 bg-white'
                    : 'border-stone-100 bg-stone-50/50'
                }`}
              >
                {/* Toggle + Label */}
                <div className="flex items-center gap-3 w-40 shrink-0">
                  <button
                    onClick={() => updateDayField(weekday, 'enabled', !day.enabled)}
                    className={`toggle-switch ${day.enabled ? 'active' : ''}`}
                    role="switch"
                    aria-checked={day.enabled}
                  />
                  <span className={`font-sans text-sm font-medium ${day.enabled ? 'text-[#1C1917]' : 'text-[#78716C]'}`}>
                    {WEEKDAY_LABELS[weekday]}
                  </span>
                </div>

                {day.enabled ? (
                  <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#78716C] font-sans">Início:</span>
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => updateDayField(weekday, 'startTime', e.target.value)}
                        className="p-1.5 border border-stone-200/80 rounded-sm focus:outline-none focus:border-[#4E5E50] text-sm font-sans"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#78716C] font-sans">Fim:</span>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => updateDayField(weekday, 'endTime', e.target.value)}
                        className="p-1.5 border border-stone-200/80 rounded-sm focus:outline-none focus:border-[#4E5E50] text-sm font-sans"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#78716C] font-sans">Pausa:</span>
                      <input
                        type="time"
                        value={day.breakStart}
                        onChange={(e) => updateDayField(weekday, 'breakStart', e.target.value)}
                        className="p-1.5 border border-stone-200/80 rounded-sm focus:outline-none focus:border-[#4E5E50] text-sm font-sans w-[110px]"
                      />
                      <span className="text-[#78716C]">–</span>
                      <input
                        type="time"
                        value={day.breakEnd}
                        onChange={(e) => updateDayField(weekday, 'breakEnd', e.target.value)}
                        className="p-1.5 border border-stone-200/80 rounded-sm focus:outline-none focus:border-[#4E5E50] text-sm font-sans w-[110px]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 text-[#78716C] italic text-sm font-sans">Folga</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 pt-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#1C1917] font-sans font-medium">Intervalo entre sessões:</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={0}
                max={60}
                value={localBuffer}
                onChange={(e) => setLocalBuffer(Number(e.target.value))}
                className="w-16 p-1.5 border border-stone-200/80 rounded-sm focus:outline-none focus:border-[#4E5E50] text-sm font-sans text-center"
              />
              <span className="text-sm text-[#78716C] font-sans">min</span>
            </div>
          </div>
          <button
            onClick={handleSaveWeekly}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#4E5E50] text-white rounded-sm hover:bg-[#586B5A] transition-colors text-sm font-sans btn-press"
          >
            <Save className="w-4 h-4" />
            Guardar Alterações
          </button>
        </div>
      </section>

      {/* Section 2: Date Overrides */}
      <section className="bg-white p-6 sm:p-8 rounded-sm shadow-card border border-stone-200/80">
        <h2 className="text-2xl font-serif text-[#1C1917] mb-6">Exceções de Data</h2>

        <div className="space-y-6">
          <div className="flex flex-wrap items-end gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#78716C] font-sans font-medium">Selecionar Data</label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateSelect}
                min={new Date().toISOString().split('T')[0]}
                className="p-2.5 border border-stone-200/80 rounded-sm focus:outline-none focus:border-[#4E5E50] font-sans text-sm"
              />
            </div>

            {selectedDate && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsDayOff(!isDayOff)}
                  className={`toggle-switch ${isDayOff ? 'active' : ''}`}
                  role="switch"
                  aria-checked={isDayOff}
                />
                <span className="font-sans text-sm font-medium text-[#1C1917]">Marcar como Folga</span>
              </div>
            )}
          </div>

          {/* Slot Grid for Selected Date */}
          {selectedDate && !isDayOff && (
            <div className="space-y-4 border-t border-stone-100 pt-6">
              <div>
                <h3 className="font-sans font-medium text-[#1C1917] mb-1">
                  Horários para {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <p className="text-xs text-[#78716C] font-sans">
                  Clique num horário para bloquear ou desbloquear.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {dateSlots.length > 0 ? (
                  dateSlots.map((slot) => {
                    const isBlocked = blockedSlots.includes(slot.id) || slot.status === 'blocked';
                    const isBooked = slot.status === 'booked';
                    return (
                      <button
                        key={slot.id}
                        onClick={() => !isBooked && toggleSlotBlock(slot.id)}
                        disabled={isBooked}
                        className={`px-4 py-2 rounded-sm text-sm font-sans font-medium transition-all border ${
                          isBooked
                            ? 'bg-amber-50 text-amber-700 border-amber-200 cursor-not-allowed opacity-60'
                            : isBlocked
                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                            : 'bg-[#FBF9F5] text-[#4E5E50] border-[#4E5E50]/20 hover:bg-[#4E5E50]/10'
                        }`}
                        title={isBooked ? 'Horário ocupado' : isBlocked ? 'Bloqueado' : 'Disponível'}
                      >
                        {slot.startTime}
                        {isBooked && ' (Reservado)'}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-sm text-[#78716C] font-sans italic">Nenhum horário gerado para este dia.</p>
                )}
              </div>

              {/* Add Custom Slot */}
              <div className="pt-2">
                {showCustomSlotForm ? (
                  <div className="flex flex-wrap items-end gap-3 bg-[#FBF9F5] p-4 rounded-sm border border-stone-100">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#78716C] font-sans">Início</label>
                      <input
                        type="time"
                        value={customSlotStart}
                        onChange={(e) => setCustomSlotStart(e.target.value)}
                        className="p-1.5 border border-stone-200/80 rounded-sm text-sm font-sans focus:outline-none focus:border-[#4E5E50]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-[#78716C] font-sans">Fim</label>
                      <input
                        type="time"
                        value={customSlotEnd}
                        onChange={(e) => setCustomSlotEnd(e.target.value)}
                        className="p-1.5 border border-stone-200/80 rounded-sm text-sm font-sans focus:outline-none focus:border-[#4E5E50]"
                      />
                    </div>
                    <button
                      onClick={handleAddCustomSlot}
                      disabled={!customSlotStart || !customSlotEnd}
                      className="px-4 py-2 bg-[#4E5E50] text-white rounded-sm text-sm font-sans hover:bg-[#586B5A] transition-colors disabled:opacity-40 btn-press"
                    >
                      Adicionar
                    </button>
                    <button
                      onClick={() => setShowCustomSlotForm(false)}
                      className="px-4 py-2 text-[#78716C] text-sm font-sans hover:text-[#1C1917]"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCustomSlotForm(true)}
                    className="flex items-center gap-1.5 text-sm font-sans text-[#4E5E50] hover:text-[#586B5A] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Horário Extra
                  </button>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-stone-100">
                <button
                  onClick={handleSaveOverride}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#4E5E50] text-white rounded-sm hover:bg-[#586B5A] transition-colors text-sm font-sans btn-press"
                >
                  <Save className="w-4 h-4" />
                  Guardar Exceção
                </button>
              </div>
            </div>
          )}

          {/* Existing Overrides List */}
          {dateOverrides.length > 0 && (
            <div className="border-t border-stone-100 pt-6">
              <h3 className="font-sans font-medium text-[#1C1917] mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#8B7E6A]" />
                Exceções configuradas
              </h3>
              <div className="space-y-2">
                {dateOverrides.map((override) => (
                  <div
                    key={override.date}
                    className="flex items-center justify-between p-3 bg-[#FBF9F5] rounded-sm border border-stone-100"
                  >
                    <div className="font-sans text-sm">
                      <span className="text-[#1C1917] font-medium">
                        {new Date(override.date + 'T00:00:00').toLocaleDateString('pt-PT', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      {override.isDayOff && (
                        <span className="ml-2 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-sm">Folga</span>
                      )}
                      {override.blockedSlots.length > 0 && (
                        <span className="ml-2 text-xs text-[#78716C]">
                          {override.blockedSlots.length} bloqueado(s)
                        </span>
                      )}
                      {override.customSlots.length > 0 && (
                        <span className="ml-2 text-xs text-[#4E7A5A]">
                          +{override.customSlots.length} extra(s)
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveOverride(override.date)}
                      className="p-1.5 text-[#78716C] hover:text-red-500 transition-colors"
                      title="Remover exceção"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
