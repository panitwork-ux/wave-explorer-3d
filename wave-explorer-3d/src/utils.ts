
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function distance2D(ax: number, az: number, bx: number, bz: number): number {
  const dx = ax - bx;
  const dz = az - bz;
  return Math.sqrt(dx * dx + dz * dz);
}

export function formatTime(date: Date): string {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear() + 543; // Buddhist era
  const h = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  return `วันที่ ${d}/${m}/${y} เวลา ${h}:${min} น.`;
}

export function getGrade(score: number, max: number): { letter: string; cls: string } {
  const pct = (score / max) * 100;
  if (pct >= 80) return { letter: 'A', cls: 'grade-a' };
  if (pct >= 60) return { letter: 'B', cls: 'grade-b' };
  if (pct >= 50) return { letter: 'C', cls: 'grade-c' };
  return { letter: 'D', cls: 'grade-d' };
}

export function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

export function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}
