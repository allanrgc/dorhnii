'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppState, Booking, Client, DateOverride, DaySchedule, Therapy, TherapyId, TimeSlot } from '../types';
import { generateBookingId, getAvailableSlots, generateTimeSlots, getWeekdayFromDate } from '../lib/schedule-utils';

export const THERAPIES: Therapy[] = [
  {
    id: 'signature',
    name: 'Signature Dohrnii',
    subtitle: 'Massagem Relaxante & Harmonizante',
    description: 'Uma massagem exclusiva que combina técnicas orientais e ocidentais para proporcionar um relaxamento profundo. Ajuda a aliviar a tensão muscular e harmonizar o corpo e a mente, utilizando óleos essenciais terapêuticos.',
    duration: 60,
    priceOnline: 55,
    priceCash: 60,
    icon: 'Sparkles'
  },
  {
    id: 'deep-tissue',
    name: 'Deep Tissue',
    subtitle: 'Terapêutica Descompressiva',
    description: 'Focada nas camadas mais profundas dos músculos e tecidos conjuntivos. Ideal para o alívio de dores crónicas e tensão muscular acumulada, promovendo uma recuperação física intensa.',
    duration: 60,
    priceOnline: 55,
    priceCash: 60,
    icon: 'Zap'
  },
  {
    id: 'lymphatic',
    name: 'Drenagem Linfática',
    subtitle: 'Revitalizante',
    description: 'Tratamento suave e estimulante que favorece a circulação linfática. É perfeito para reduzir a retenção de líquidos, desintoxicar o organismo e melhorar o aspeto geral da pele.',
    duration: 60,
    priceOnline: 55,
    priceCash: 60,
    icon: 'Droplets'
  },
  {
    id: 'candle',
    name: 'Candle Massage',
    subtitle: 'Velas Aromáticas',
    description: 'Experiência sensorial única com cera quente de velas específicas para massagem. O calor e os aromas fundem-se num tratamento envolvente que nutre a pele e apazigua os sentidos.',
    duration: 60,
    priceOnline: 55,
    priceCash: 60,
    icon: 'Flame'
  }
];

const defaultWeeklySchedule: DaySchedule[] = [
  { weekday: 'segunda', enabled: true, startTime: '09:00', endTime: '19:00', breakStart: '12:30', breakEnd: '14:00' },
  { weekday: 'terca', enabled: true, startTime: '09:00', endTime: '19:00', breakStart: '12:30', breakEnd: '14:00' },
  { weekday: 'quarta', enabled: true, startTime: '09:00', endTime: '19:00', breakStart: '12:30', breakEnd: '14:00' },
  { weekday: 'quinta', enabled: true, startTime: '09:00', endTime: '19:00', breakStart: '12:30', breakEnd: '14:00' },
  { weekday: 'sexta', enabled: true, startTime: '09:00', endTime: '19:00', breakStart: '12:30', breakEnd: '14:00' },
  { weekday: 'sabado', enabled: true, startTime: '10:00', endTime: '16:00', breakStart: '12:30', breakEnd: '13:30' },
  { weekday: 'domingo', enabled: false, startTime: '09:00', endTime: '18:00', breakStart: '', breakEnd: '' },
];

const mockClients: Client[] = [
  { id: 'client-1', name: 'Maria Silva', email: 'maria.silva@example.com', whatsapp: '+351912345678', loyaltyStamps: 3, completedSessions: [] },
  { id: 'client-2', name: 'João Santos', email: 'joao.santos@example.com', whatsapp: '+351961234567', loyaltyStamps: 8, completedSessions: [] },
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

const formatDateStr = (d: Date) => d.toISOString().split('T')[0];

const mockBookings: Booking[] = [
  {
    id: generateBookingId(),
    clientName: 'Maria Silva',
    clientEmail: 'maria.silva@example.com',
    clientWhatsapp: '+351912345678',
    therapyId: 'signature',
    date: formatDateStr(tomorrow),
    startTime: '10:00',
    endTime: '11:00',
    paymentMethod: 'online',
    paymentStatus: 'paid',
    sessionStatus: 'scheduled',
    createdAt: today.toISOString()
  },
  {
    id: generateBookingId(),
    clientName: 'Ana Pereira',
    clientEmail: 'ana.pereira@example.com',
    clientWhatsapp: '+351931234567',
    therapyId: 'deep-tissue',
    date: formatDateStr(tomorrow),
    startTime: '15:00',
    endTime: '16:00',
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    sessionStatus: 'scheduled',
    createdAt: today.toISOString()
  },
  {
    id: generateBookingId(),
    clientName: 'João Santos',
    clientEmail: 'joao.santos@example.com',
    clientWhatsapp: '+351961234567',
    therapyId: 'lymphatic',
    date: formatDateStr(nextWeek),
    startTime: '11:00',
    endTime: '12:00',
    paymentMethod: 'online',
    paymentStatus: 'paid',
    sessionStatus: 'scheduled',
    createdAt: today.toISOString()
  }
];

const defaultState: AppState = {
  bookings: mockBookings,
  clients: mockClients,
  weeklySchedule: defaultWeeklySchedule,
  dateOverrides: [],
  bufferMinutes: 15
};

interface BookingContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => Booking;
  cancelBooking: (id: string) => void;
  rescheduleBooking: (id: string, newDate: string, newStartTime: string, newEndTime: string) => void;
  completeSession: (id: string) => void;
  getAvailableSlotsForDate: (date: string) => TimeSlot[];
  generateSlotsForDate: (date: string) => TimeSlot[];
  getTherapies: () => Therapy[];
  updateClientLoyalty: (clientId: string, therapyId: TherapyId, date: string) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dohrnii_app_state');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('dohrnii_app_state', JSON.stringify(state));
    }
  }, [state, isLoaded]);

  const createBooking = (bookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: generateBookingId(),
      createdAt: new Date().toISOString()
    };
    
    setState(prev => {
      // Also update/create client
      let clients = [...prev.clients];
      const existingClient = clients.find(c => c.email === newBooking.clientEmail);
      
      if (!existingClient) {
        clients.push({
          id: `client-${Date.now()}`,
          name: newBooking.clientName,
          email: newBooking.clientEmail,
          whatsapp: newBooking.clientWhatsapp,
          loyaltyStamps: 0,
          completedSessions: []
        });
      }

      return {
        ...prev,
        bookings: [...prev.bookings, newBooking],
        clients
      };
    });
    
    return newBooking;
  };

  const cancelBooking = (id: string) => {
    setState(prev => ({
      ...prev,
      bookings: prev.bookings.map(b => b.id === id ? { ...b, sessionStatus: 'cancelled' } : b)
    }));
  };

  const rescheduleBooking = (id: string, newDate: string, newStartTime: string, newEndTime: string) => {
    setState(prev => ({
      ...prev,
      bookings: prev.bookings.map(b => b.id === id ? { ...b, date: newDate, startTime: newStartTime, endTime: newEndTime } : b)
    }));
  };

  const completeSession = (id: string) => {
    setState(prev => {
      const booking = prev.bookings.find(b => b.id === id);
      if (!booking) return prev;
      
      const newBookings = prev.bookings.map(b => b.id === id ? { ...b, sessionStatus: 'completed' as const } : b);
      
      // Update client loyalty
      let newClients = [...prev.clients];
      const clientIndex = newClients.findIndex(c => c.email === booking.clientEmail);
      
      if (clientIndex !== -1) {
        const client = newClients[clientIndex];
        let newStamps = client.loyaltyStamps + 1;
        // Reset after 20 stamps (free session earned)
        if (newStamps > 20) newStamps = 1;
        
        newClients[clientIndex] = {
          ...client,
          loyaltyStamps: newStamps,
          completedSessions: [...client.completedSessions, { date: booking.date, therapyId: booking.therapyId }]
        };
      }
      
      return {
        ...prev,
        bookings: newBookings,
        clients: newClients
      };
    });
  };

  const updateClientLoyalty = (clientId: string, therapyId: TherapyId, date: string) => {
    setState(prev => {
      const newClients = prev.clients.map(client => {
        if (client.id === clientId) {
          let newStamps = client.loyaltyStamps + 1;
          if (newStamps > 20) newStamps = 1;
          return {
            ...client,
            loyaltyStamps: newStamps,
            completedSessions: [...client.completedSessions, { date, therapyId }]
          };
        }
        return client;
      });
      return { ...prev, clients: newClients };
    });
  };

  const getAvailableSlotsForDate = useCallback((date: string): TimeSlot[] => {
    const weekday = getWeekdayFromDate(date);
    const daySchedule = state.weeklySchedule.find(s => s.weekday === weekday);
    
    return getAvailableSlots(
      daySchedule,
      date,
      state.dateOverrides,
      state.bookings,
      state.bufferMinutes
    );
  }, [state]);

  const generateSlotsForDate = useCallback((date: string): TimeSlot[] => {
    const weekday = getWeekdayFromDate(date);
    const daySchedule = state.weeklySchedule.find(s => s.weekday === weekday);
    
    return generateTimeSlots(
      daySchedule,
      date,
      state.dateOverrides,
      state.bookings,
      state.bufferMinutes
    );
  }, [state]);

  const getTherapies = () => THERAPIES;

  return (
    <BookingContext.Provider
      value={{
        state,
        setState,
        createBooking,
        cancelBooking,
        rescheduleBooking,
        completeSession,
        getAvailableSlotsForDate,
        generateSlotsForDate,
        getTherapies,
        updateClientLoyalty
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return {
    bookings: context.state.bookings,
    createBooking: context.createBooking,
    cancelBooking: context.cancelBooking,
    rescheduleBooking: context.rescheduleBooking,
  };
}

export function useSchedule() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a BookingProvider');
  }

  const updateWeeklySchedule = (schedule: DaySchedule[]) => {
    context.setState(prev => ({ ...prev, weeklySchedule: schedule }));
  };

  const addDateOverride = (override: DateOverride) => {
    context.setState(prev => ({
      ...prev,
      dateOverrides: [...prev.dateOverrides.filter(o => o.date !== override.date), override]
    }));
  };

  const updateDateOverride = (date: string, updates: Partial<DateOverride>) => {
    context.setState(prev => ({
      ...prev,
      dateOverrides: prev.dateOverrides.map(o => o.date === date ? { ...o, ...updates } : o)
    }));
  };

  const removeDateOverride = (date: string) => {
    context.setState(prev => ({
      ...prev,
      dateOverrides: prev.dateOverrides.filter(o => o.date !== date)
    }));
  };

  const updateBufferMinutes = (minutes: number) => {
    context.setState(prev => ({ ...prev, bufferMinutes: minutes }));
  };

  return {
    weeklySchedule: context.state.weeklySchedule,
    dateOverrides: context.state.dateOverrides,
    bufferMinutes: context.state.bufferMinutes,
    getAvailableSlotsForDate: context.getAvailableSlotsForDate,
    generateSlotsForDate: context.generateSlotsForDate,
    updateWeeklySchedule,
    addDateOverride,
    updateDateOverride,
    removeDateOverride,
    updateBufferMinutes,
  };
}

export function useLoyalty() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useLoyalty must be used within a BookingProvider');
  }
  
  const getClientLoyalty = (email: string): Client | null => {
    return context.state.clients.find(c => c.email === email) || null;
  };

  return {
    clients: context.state.clients,
    getClientLoyalty,
    updateClientLoyalty: context.updateClientLoyalty,
    completeSession: context.completeSession
  };
}

export function useTherapies() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useTherapies must be used within a BookingProvider');
  }
  return context.getTherapies();
}
