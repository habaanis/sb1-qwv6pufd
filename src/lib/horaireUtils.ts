export interface DaySchedule {
  day: string;
  hours: string;
  isOpen: boolean;
}

export interface ParsedSchedule {
  schedule: DaySchedule[];
  isCurrentlyOpen: boolean;
  todaySchedule: DaySchedule | null;
}

const DAYS_FR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const DAYS_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_AR = ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];
const DAYS_IT = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
const DAYS_RU = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

export function getDayName(dayIndex: number, language: string): string {
  switch (language) {
    case 'en':
      return DAYS_EN[dayIndex];
    case 'ar':
      return DAYS_AR[dayIndex];
    case 'it':
      return DAYS_IT[dayIndex];
    case 'ru':
      return DAYS_RU[dayIndex];
    default:
      return DAYS_FR[dayIndex];
  }
}

export function parseHoraires(horaires: string | null | undefined): DaySchedule[] {
  if (!horaires) return [];

  const schedule: DaySchedule[] = [];

  // Normaliser : remplacer espaces multiples par un seul espace
  const normalized = horaires.replace(/\s+/g, ' ').trim();

  // Détecter le format
  const hasNewLines = horaires.includes('\n');

  if (hasNewLines) {
    // Format avec sauts de ligne
    const lines = horaires.split('\n').filter(line => line.trim());
    let currentDay: string | null = null;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Format 1: "Lundi : 08:00–17:00" (avec deux-points)
      const matchWithColon = trimmedLine.match(/^([^:]+)\s*:\s*(.+)$/);
      if (matchWithColon) {
        const day = matchWithColon[1].trim();
        const hours = matchWithColon[2].trim();
        const isOpen = !hours.toLowerCase().includes('fermé') &&
                       !hours.toLowerCase().includes('closed') &&
                       !hours.toLowerCase().includes('مغلق');

        schedule.push({ day, hours, isOpen });
        currentDay = null;
        continue;
      }

      // Format 2: Jour sur une ligne, horaires sur la suivante
      const dayMatch = trimmedLine.match(/^(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i);
      if (dayMatch) {
        currentDay = trimmedLine;
        continue;
      }

      // Si on a un jour en attente et que la ligne contient des horaires
      if (currentDay && trimmedLine.match(/\d{1,2}[:h]\d{2}/)) {
        const hours = trimmedLine;
        const isOpen = !hours.toLowerCase().includes('fermé') &&
                       !hours.toLowerCase().includes('closed') &&
                       !hours.toLowerCase().includes('مغلق');

        schedule.push({
          day: currentDay.charAt(0).toUpperCase() + currentDay.slice(1).toLowerCase(),
          hours,
          isOpen
        });
        currentDay = null;
      }
    }
  } else {
    // Format sur une seule ligne (Airtable)
    // Ex: "Lundi 08:30–13:00/15:00–19:30 Mardi 08:30–13:00 ..."
    // Ex: "lundi 08:30–19:30 mardi 08:30–19:30 ..."

    const dayRegex = /(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+([^\s].*?)(?=\s+(?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|$)/gi;

    let match;
    while ((match = dayRegex.exec(normalized)) !== null) {
      const day = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
      const hours = match[2].trim();
      const isOpen = !hours.toLowerCase().includes('fermé') &&
                     !hours.toLowerCase().includes('closed') &&
                     !hours.toLowerCase().includes('مغلق');

      schedule.push({ day, hours, isOpen });
    }
  }

  return schedule;
}

function parseTimeString(timeStr: string): { hours: number; minutes: number } | null {
  // Nettoyer la chaîne (supprimer espaces, h, H)
  const cleaned = timeStr.trim().toLowerCase().replace(/h/g, ':');

  // Format HH:MM ou H:MM
  let match = cleaned.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    return {
      hours: parseInt(match[1], 10),
      minutes: parseInt(match[2], 10)
    };
  }

  // Format HH ou H (sans minutes, ex: "9" ou "18")
  match = cleaned.match(/^(\d{1,2})$/);
  if (match) {
    return {
      hours: parseInt(match[1], 10),
      minutes: 0
    };
  }

  return null;
}

function isTimeInRange(currentTime: Date, startTime: string, endTime: string): boolean {
  const start = parseTimeString(startTime);
  const end = parseTimeString(endTime);

  if (!start || !end) return false;

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const startMinutes = start.hours * 60 + start.minutes;
  const endMinutes = end.hours * 60 + end.minutes;

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

export function isCurrentlyOpen(horaires: string | null | undefined): boolean {
  if (!horaires) return false;

  const now = new Date();
  const dayIndex = (now.getDay() + 6) % 7;
  const dayName = DAYS_FR[dayIndex];

  const schedule = parseHoraires(horaires);
  const todaySchedule = schedule.find(s => s.day.includes(dayName));

  if (!todaySchedule || !todaySchedule.isOpen) return false;

  // Accepter différents formats de séparateurs : -, –, >, à, etc.
  // Exemples: "9h-18h", "09:00 - 18:00", "9:00 à 18:00", "9>18"
  const timeRangeMatch = todaySchedule.hours.match(/(\d{1,2}(?:[:h]\d{2})?)\s*(?:[-–>àa]|to)\s*(\d{1,2}(?:[:h]\d{2})?)/i);
  if (timeRangeMatch) {
    return isTimeInRange(now, timeRangeMatch[1], timeRangeMatch[2]);
  }

  return false;
}

export function getTodaySchedule(horaires: string | null | undefined): DaySchedule | null {
  if (!horaires) return null;

  const now = new Date();
  const dayIndex = (now.getDay() + 6) % 7;
  const dayName = DAYS_FR[dayIndex];

  const schedule = parseHoraires(horaires);
  return schedule.find(s => s.day.includes(dayName)) || null;
}

export function getParsedSchedule(horaires: string | null | undefined): ParsedSchedule {
  const schedule = parseHoraires(horaires);
  const isOpen = isCurrentlyOpen(horaires);
  const todaySchedule = getTodaySchedule(horaires);

  return {
    schedule,
    isCurrentlyOpen: isOpen,
    todaySchedule
  };
}

export function translateClosedStatus(language: string): string {
  switch (language) {
    case 'en':
      return 'Closed';
    case 'ar':
      return 'مغلق';
    case 'it':
      return 'Chiuso';
    case 'ru':
      return 'Закрыто';
    default:
      return 'Fermé';
  }
}

export function translateOpenStatus(language: string): string {
  switch (language) {
    case 'en':
      return 'Open';
    case 'ar':
      return 'مفتوح';
    case 'it':
      return 'Aperto';
    case 'ru':
      return 'Открыто';
    default:
      return 'Ouvert';
  }
}

export function translateScheduleNotAvailable(language: string): string {
  switch (language) {
    case 'en':
      return 'Schedule not available';
    case 'ar':
      return 'أوقات العمل غير متوفرة';
    case 'it':
      return 'Orari non disponibili';
    case 'ru':
      return 'Расписание недоступно';
    default:
      return 'Horaires non communiqués';
  }
}

export function translateScheduleTitle(language: string): string {
  switch (language) {
    case 'en':
      return 'Opening Hours';
    case 'ar':
      return 'أوقات العمل';
    case 'it':
      return 'Orari di Apertura';
    case 'ru':
      return 'Часы работы';
    default:
      return 'Horaires d\'ouverture';
  }
}

export function translateSeeMore(language: string): string {
  switch (language) {
    case 'en':
      return 'See more';
    case 'ar':
      return 'عرض المزيد';
    case 'it':
      return 'Vedi altro';
    case 'ru':
      return 'Показать больше';
    default:
      return 'Voir plus';
  }
}

export function translateSeeLess(language: string): string {
  switch (language) {
    case 'en':
      return 'See less';
    case 'ar':
      return 'عرض أقل';
    case 'it':
      return 'Vedi meno';
    case 'ru':
      return 'Показать меньше';
    default:
      return 'Voir moins';
  }
}

export function translateToday(language: string): string {
  switch (language) {
    case 'en':
      return 'Today';
    case 'ar':
      return 'اليوم';
    case 'it':
      return 'Oggi';
    case 'ru':
      return 'Сегодня';
    default:
      return 'Aujourd\'hui';
  }
}

/**
 * Normalise l'affichage des horaires pour une meilleure lisibilité
 * Exemples: "9h-18h" → "9h-18h", "09:00-18:00" → "09:00-18:00"
 */
export function normalizeHoursDisplay(hours: string): string {
  if (!hours) return hours;

  // Remplacer les différents tirets par un tiret standard avec espaces
  const normalized = hours
    .replace(/–/g, '-')  // Tiret long
    .replace(/\s*-\s*/g, ' - ')  // Ajouter espaces autour des tirets
    .replace(/\s*>\s*/g, ' - ')  // Remplacer > par -
    .replace(/\s+à\s+/gi, ' - ')  // Remplacer "à" par -
    .replace(/\s+to\s+/gi, ' - ')  // Remplacer "to" par -
    .replace(/\s+/g, ' ')  // Normaliser les espaces multiples
    .trim();

  return normalized;
}

export function formatTodayScheduleText(todaySchedule: DaySchedule | null, language: string): string {
  if (!todaySchedule) return translateScheduleNotAvailable(language);

  const todayLabel = translateToday(language);
  const hours = normalizeHoursDisplay(todaySchedule.hours);

  return `${todayLabel} : ${hours}`;
}
