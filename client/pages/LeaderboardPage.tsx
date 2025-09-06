import Layout from "@/components/learnbuddy/Layout";
import {
  computeDailyStreak,
  leaderboard,
  loadAttempts,
} from "@/components/learnbuddy/storage";

export default function LeaderboardPage() {
  const streak = computeDailyStreak();
  const lb = leaderboard();
  const attempts = loadAttempts()
    .slice()
    .sort((a, b) => b.ts - a.ts);

  return (
    <Layout>
      <section className="container py-16">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
            <p className="text-foreground/70 mt-1">
              Local to your browser. Names are anonymized.
            </p>
          </div>
          <div className="rounded-full bg-violet-600 text-white px-4 py-2 text-sm shadow">
            Daily streak: <span className="font-semibold">{streak}</span> 🔥
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border p-5">
            <div className="font-semibold mb-3">Top Scores</div>
            {lb.length === 0 ? (
              <div className="text-sm text-foreground/60">
                No attempts yet. Finish an assessment to appear here.
              </div>
            ) : (
              <ul className="space-y-2">
                {lb.slice(0, 10).map((r, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-foreground/60">{i + 1}.</span>
                      <span className="font-medium">{r.name}</span>
                      <span className="text-foreground/60">
                        · Video {r.videoId}
                      </span>
                    </div>
                    <div className="font-semibold">{r.score}%</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border p-5">
            <div className="font-semibold mb-3">Recent Attempts</div>
            {attempts.length === 0 ? (
              <div className="text-sm text-foreground/60">
                No recent attempts.
              </div>
            ) : (
              <ul className="space-y-2">
                {attempts.slice(0, 10).map((a, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="text-foreground/70">
                      {new Date(a.ts).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                        {a.mode}
                      </span>
                      <span className="font-semibold">{a.score}%</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
