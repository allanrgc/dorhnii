import { Booking, DateOverride, DaySchedule, SlotStatus, TimeSlot, Weekday } from '../types';

export function getWeekdayFromDate(dateStr: string): Weekday {
  const date = new Date(dateStr);
  const dayIndex = date.getDay();
  const weekdays: Weekday[] = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  return weekdays[dayIndex];
}

export function formatTime(time: string): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
}

export function generateBookingId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'DOH-';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function timeToMinutes(time: string): number {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function generateTimeSlots(
  daySchedule: DaySchedule | undefined,
  date: string,
  overrides: DateOverride[],
  bookings: Booking[],
  bufferMinutes: number
): TimeSlot[] {
  if (!daySchedule) return [];

  const dateOverride = overrides.find((o) => o.date === date);
  if (dateOverride?.isDayOff) {
    return [];
  }

  const slots: TimeSlot[] = [];
  const duration = 60; // Fixed duration based on therapies
  
  if (daySchedule.enabled) {
    const startMins = timeToMinutes(daySchedule.startTime);
    const endMins = timeToMinutes(daySchedule.endTime);
    const breakStartMins = daySchedule.breakStart ? timeToMinutes(daySchedule.breakStart) : null;
    const breakEndMins = daySchedule.breakEnd ? timeToMinutes(daySchedule.breakEnd) : null;

    let currentMins = startMins;

    while (currentMins + duration <= endMins) {
      const slotEnd = currentMins + duration;
      
      // Check if slot overlaps with break
      const overlapsWithBreak = breakStartMins !== null && breakEndMins !== null &&
        ((currentMins >= breakStartMins && currentMins < breakEndMins) ||
         (slotEnd > breakStartMins && slotEnd <= breakEndMins) ||
         (currentMins <= breakStartMins && slotEnd >= breakEndMins));

      if (!overlapsWithBreak) {
        const startTime = minutesToTime(currentMins);
        const endTime = minutesToTime(slotEnd);
        const slotId = `slot-${date}-${startTime}`;
        
        let status: SlotStatus = 'available';
        
        if (dateOverride?.blockedSlots.includes(slotId)) {
          status = 'blocked';
        } else if (bookings.some(b => b.date === date && b.startTime === startTime && b.sessionStatus !== 'cancelled')) {
          status = 'booked';
        }

        slots.push({
          id: slotId,
          date,
          startTime,
          endTime,
          status
        });
      }

      currentMins += duration + bufferMinutes;
    }
  }

  // Add custom overtime slots from overrides
  if (dateOverride?.customSlots) {
    for (const customSlot of dateOverride.customSlots) {
      const slotId = `slot-${date}-${customSlot.startTime}`;
      let status: SlotStatus = 'available';
      
      if (dateOverride.blockedSlots.includes(slotId)) {
        status = 'blocked';
      } else if (bookings.some(b => b.date === date && b.startTime === customSlot.startTime && b.sessionStatus !== 'cancelled')) {
        status = 'booked';
      }

      slots.push({
        id: slotId,
        date,
        startTime: customSlot.startTime,
        endTime: customSlot.endTime,
        status
      });
    }
  }

  // Sort slots by start time
  return slots.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
}

export function getAvailableSlots(
  daySchedule: DaySchedule | undefined,
  date: string,
  overrides: DateOverride[],
  bookings: Booking[],
  bufferMinutes: number
): TimeSlot[] {
  const allSlots = generateTimeSlots(daySchedule, date, overrides, bookings, bufferMinutes);
  return allSlots.filter((slot) => slot.status === 'available');
}
