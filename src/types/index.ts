export type TherapyId = 'signature' | 'deep-tissue' | 'lymphatic' | 'candle';
export type PaymentMethod = 'online' | 'cash';
export type PaymentStatus = 'paid' | 'pending';
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled';
export type SlotStatus = 'available' | 'booked' | 'blocked';
export type Weekday = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';
export type UserRole = 'client' | 'therapist' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  role: UserRole;
}

export interface RegisteredUser extends AuthUser {
  passwordHash: string;
}

export interface Therapy {
  id: TherapyId;
  name: string;
  subtitle: string;
  description: string;
  duration: number; // minutes
  priceOnline: number;
  priceCash: number;
  icon: string; // lucide icon name
}

export interface TimeSlot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status: SlotStatus;
}

export interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  clientWhatsapp: string;
  therapyId: TherapyId;
  date: string;
  startTime: string;
  endTime: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  sessionStatus: SessionStatus;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  loyaltyStamps: number;
  completedSessions: { date: string; therapyId: TherapyId }[];
}

export interface DaySchedule {
  weekday: Weekday;
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
}

export interface DateOverride {
  date: string;
  isDayOff: boolean;
  blockedSlots: string[]; // slot IDs
  customSlots: { startTime: string; endTime: string }[];
}

export interface AppState {
  bookings: Booking[];
  clients: Client[];
  weeklySchedule: DaySchedule[];
  dateOverrides: DateOverride[];
  bufferMinutes: number;
}
