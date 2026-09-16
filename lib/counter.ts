export type TimeTogether = {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
};

export function timeTogether(startDate: string, now = new Date()): TimeTogether | null {
  if (!startDate) return null;
  const start = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || start > now) return null;

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  let hours = now.getHours() - start.getHours();
  let minutes = now.getMinutes() - start.getMinutes();
  let seconds = now.getSeconds() - start.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes -= 1;
  }
  if (minutes < 0) {
    minutes += 60;
    hours -= 1;
  }
  if (hours < 0) {
    hours += 24;
    days -= 1;
  }
  if (days < 0) {
    const previous = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += previous;
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const totalDays = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return { years, months, days, hours, minutes, seconds, totalDays };
}

export function formatTogether(time: TimeTogether) {
  const parts: string[] = [];
  if (time.years) parts.push(`${time.years} ${time.years === 1 ? "ano" : "anos"}`);
  if (time.months) parts.push(`${time.months} ${time.months === 1 ? "mês" : "meses"}`);
  if (time.days || parts.length === 0) {
    parts.push(`${time.days} ${time.days === 1 ? "dia" : "dias"}`);
  }
  return parts.join(", ");
}
