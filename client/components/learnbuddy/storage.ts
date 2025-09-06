export type Attempt = { ts: number; videoId: string; score: number; mode: "mcq" | "subjective" };
const KEY = "ylb_attempts";

export function loadAttempts(): Attempt[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Attempt[];
  } catch {
    return [];
  }
}

export function saveAttempt(a: Attempt) {
  const all = loadAttempts();
  all.push(a);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function computeDailyStreak(now = new Date()): number {
  const attempts = loadAttempts();
  if (attempts.length === 0) return 0;
  const days = new Set(attempts.map((a) => new Date(a.ts).toDateString()));
  let streak = 0;
  const d = new Date(now);
  while (true) {
    const key = d.toDateString();
    if (days.has(key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function leaderboard(): { name: string; score: number; videoId: string; when: number }[] {
  const attempts = loadAttempts();
  // local, anonymized names
  return attempts
    .slice()
    .sort((a, b) => b.score - a.score || b.ts - a.ts)
    .map((a, i) => ({ name: `User-${(i + 1).toString().padStart(2, "0")}`, score: a.score, videoId: a.videoId, when: a.ts }));
}
