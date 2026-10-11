import { ClinicTiming } from '../types';

export interface ClinicStatusInfo {
  isOpen: boolean;
  statusText: string;
  nextEventText: string;
  currentDayIndex: number; // 0 = Sun, 1 = Mon, ...
  istTimeString: string;
}

/**
 * Returns the current date and time in India Standard Time (Asia/Kolkata, UTC+5:30)
 */
export function getIndiaCurrentDate(): Date {
  const now = new Date();
  // Format to Asia/Kolkata parts
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  });
  
  const parts = formatter.formatToParts(now);
  const partMap: Record<string, number> = {};
  for (const p of parts) {
    if (p.type !== 'literal') {
      partMap[p.type] = parseInt(p.value, 10);
    }
  }

  // Construct a date object representing IST
  return new Date(
    partMap.year,
    partMap.month - 1,
    partMap.day,
    partMap.hour,
    partMap.minute,
    partMap.second
  );
}

/**
 * Calculates whether Tara's Dental Advanced Clinic is open right now in Shivamogga
 */
export function getClinicStatus(timings: ClinicTiming[]): ClinicStatusInfo {
  const istDate = getIndiaCurrentDate();
  const currentDayIndex = istDate.getDay(); // 0 (Sun) to 6 (Sat)
  const currentMinutes = istDate.getHours() * 60 + istDate.getMinutes();

  const todayTiming = timings.find(t => t.dayIndex === currentDayIndex);

  const istTimeString = istDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  if (!todayTiming || todayTiming.isClosed) {
    return {
      isOpen: false,
      statusText: 'Closed Today',
      nextEventText: 'Opens tomorrow at 9:30 AM',
      currentDayIndex,
      istTimeString
    };
  }

  // Parse open and close times
  const [openH, openM] = todayTiming.openTime.split(':').map(Number);
  const [closeH, closeM] = todayTiming.closeTime.split(':').map(Number);

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    const formattedClose = formatMilitaryTo12h(todayTiming.closeTime);
    return {
      isOpen: true,
      statusText: 'Open Now',
      nextEventText: `Closes at ${formattedClose} today`,
      currentDayIndex,
      istTimeString
    };
  } else if (currentMinutes < openMinutes) {
    const formattedOpen = formatMilitaryTo12h(todayTiming.openTime);
    return {
      isOpen: false,
      statusText: 'Closed Now',
      nextEventText: `Opens today at ${formattedOpen}`,
      currentDayIndex,
      istTimeString
    };
  } else {
    // Already closed for the day, find next day's opening
    const nextDayIndex = (currentDayIndex + 1) % 7;
    const nextTiming = timings.find(t => t.dayIndex === nextDayIndex);
    const nextOpen = nextTiming ? formatMilitaryTo12h(nextTiming.openTime) : '9:30 AM';
    const dayName = nextDayIndex === 0 ? 'Sunday' : 'tomorrow';
    return {
      isOpen: false,
      statusText: 'Closed Now',
      nextEventText: `Opens ${dayName} at ${nextOpen}`,
      currentDayIndex,
      istTimeString
    };
  }
}

export function formatMilitaryTo12h(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m < 10 ? `0${m}` : `${m}`;
  return `${displayH}:${displayM} ${ampm}`;
}

/**
 * Generates available 30-min (or configured duration) appointment slots for a given date
 */
export function generateAvailableSlotsForDate(
  dateStr: string, // YYYY-MM-DD
  timings: ClinicTiming[],
  slotDurationMinutes: number = 30
): string[] {
  if (!dateStr) return [];

  // Parse the target date
  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  const dayIndex = targetDate.getDay();

  const timing = timings.find(t => t.dayIndex === dayIndex);
  if (!timing || timing.isClosed) return [];

  const [openH, openM] = timing.openTime.split(':').map(Number);
  const [closeH, closeM] = timing.closeTime.split(':').map(Number);

  const startMinutes = openH * 60 + openM;
  const endMinutes = closeH * 60 + closeM;

  const slots: string[] = [];

  // If the target date is today in IST, filter out slots that have already passed!
  const istNow = getIndiaCurrentDate();
  const isToday =
    istNow.getFullYear() === year &&
    istNow.getMonth() === month - 1 &&
    istNow.getDate() === day;
  const currentIstMinutes = istNow.getHours() * 60 + istNow.getMinutes();

  for (let mins = startMinutes; mins + slotDurationMinutes <= endMinutes; mins += slotDurationMinutes) {
    // If today, buffer at least 30 minutes in advance
    if (isToday && mins <= currentIstMinutes + 30) {
      continue;
    }

    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m < 10 ? `0${m}` : `${m}`;
    slots.push(`${displayH}:${displayM} ${ampm}`);
  }

  return slots;
}
