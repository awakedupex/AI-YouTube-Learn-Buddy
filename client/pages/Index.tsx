import { useState } from "react";

import Layout from "@/components/learnbuddy/Layout";
import VideoStudyDemoWrapper from "@/components/learnbuddy/player/VideoStudyDemoWrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Index({
  page,
}: { page?: "leaderboard" | "settings" } = {}) {
  const [exampleFromServer] = useState("");

  if (page === "leaderboard")
    return (
      <Layout>
        <section className="container py-16">
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-foreground/70 mt-1">
            See top scores for videos you practiced.
          </p>
          <div className="mt-8 text-sm text-foreground/60">
            No attempts recorded yet.
          </div>
        </section>
      </Layout>
    );

  if (page === "settings")
    return (
      <Layout>
        <section className="container py-16">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-foreground/70 mt-1">
            Configure reminders, privacy, and grading.
          </p>
          <div className="mt-8 grid gap-6 max-w-2xl">
            <div className="rounded-xl border p-5">
              <div className="font-medium">Engagement Reminders</div>
              <p className="text-sm text-foreground/70">
                Show a gentle reminder after 2 minutes of inactivity.
              </p>
              <div className="mt-3 flex gap-3">
                <Button size="sm">Enable</Button>
                <Button variant="secondary" size="sm">
                  Disable
                </Button>
              </div>
            </div>
            <div className="rounded-xl border p-5">
              <div className="font-medium">AI Grading</div>
              <p className="text-sm text-foreground/70">
                Opt in to AI grading for subjective answers (uses your API key).
              </p>
              <div className="mt-3 flex gap-3">
                <Button size="sm">Enable</Button>
                <Button variant="secondary" size="sm">
                  Disable
                </Button>
              </div>
            </div>
            <div className="rounded-xl border p-5">
              <div className="font-medium">Leaderboard Privacy</div>
              <p className="text-sm text-foreground/70">
                Appear on local leaderboards with an anonymized name.
              </p>
              <div className="mt-3 flex gap-3">
                <Button size="sm">Opt in</Button>
                <Button variant="secondary" size="sm">
                  Opt out
                </Button>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );

  return (
    <Layout>
      <section className="container pt-16 pb-10" id="hero">
        <div className="flex flex-col items-center font-normal">
          <Badge
            variant="secondary"
            className="mb-4 px-4 py-2 text-sm md:text-base"
          >
            Chrome Extension
          </Badge>

          <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-center">
            Learn Buddy
          </div>

          <p className="mt-4 text-lg text-foreground/80 text-center max-w-[697px]">
            Smart quiz pop‑ups, struggle detection, gentle reminders, end-of-video
            assessments, and gamified streaks, all powered by transcripts and
            engagement patterns.
          </p>

          <div className="mt-6 flex gap-3">
            <a href="https://b9af8c1e4e3d496dbe43ffb43a742288-27b51b3b-6c52-4dd3-bb61-f0f055.fly.dev/?reload=1758310228022#demo">
              <Button size="lg">Try the Demo</Button>
            </a>
            <a href="https://b9af8c1e4e3d496dbe43ffb43a742288-27b51b3b-6c52-4dd3-bb61-f0f055.fly.dev/?reload=1758310228022#features">
              <Button size="lg" variant="secondary">
                Explore Features
              </Button>
            </a>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-center" />
      </section>

      <section className="container py-16" id="features">
        <h2 className="text-2xl font-bold">
          Everything you need to stay engaged
        </h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Feature
            title="Smart Quiz Pop‑ups"
            desc="MCQs with solutions will pop up during engagement dips"
          />
          <Feature
            title="Struggle Detection"
            desc="Rewinds 3+ times? Get a concise, friendly explanation of that segment."
          />
          <Feature
            title="Engagement Reminders"
            desc="Paused or inactive for 2 minutes? A gentle nudge with Resume / Dismiss / Remind later."
          />
          <Feature
            title="Learning Assessment"
            desc="Choose MCQ or subjective at the end. Optional AI grading with explanations."
          />
          <Feature
            title="Gamified Streaks"
            desc="Track streaks, earn badges, and stay motivated day after day."
          />
          <Feature
            title="Optional Leaderboards"
            desc="Compare within your group using anonymized names. Opt in/out anytime."
          />
        </div>
      </section>

      <section className="container py-16" id="demo">
        <h2 className="text-2xl font-bold">Interactive Demo</h2>
        <p className="text-foreground/70 mt-1">
          Load a YouTube video and experience pop‑ups based on your playback
          behavior. For best results, try pausing, seeking, or rewinding a few
          times.
        </p>
        <div className="mt-6 rounded-xl border p-3 bg-card/60 shadow-xl">
          <VideoStudyDemoWrapper videoId="SJ2lI4j0kfo" />
        </div>
      </section>

      <section id="privacy" className="container py-16">
        <h2 className="text-2xl font-bold">Privacy First</h2>
        <p className="text-foreground/70 mt-2 max-w-2xl">
          All processing runs locally by default. Your data is stored in your
          browser. You can opt‑in to AI grading or cloud sync if desired.
        </p>
      </section>
    </Layout>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border p-5 bg-background/60">
      <div className="font-semibold">{title}</div>
      <p className="text-sm text-foreground/70 mt-1">{desc}</p>
    </div>
  );
}
