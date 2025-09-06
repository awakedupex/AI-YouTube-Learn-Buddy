import { useEffect, useMemo, useState } from "react";
import { DemoResponse } from "@shared/api";

import Layout from "@/components/learnbuddy/Layout";
import VideoStudyPlayer from "@/components/learnbuddy/player/VideoStudyPlayer";
import VideoStudyDemoWrapper from "@/components/learnbuddy/player/VideoStudyDemoWrapper";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TranscriptManager from "@/components/learnbuddy/transcript/TranscriptManager";

export default function Index({ page }: { page?: "leaderboard" | "settings" } = {}) {
  const [exampleFromServer, setExampleFromServer] = useState("");
  useEffect(() => {
    fetchDemo();
  }, []);
  const fetchDemo = async () => {
    try {
      const response = await fetch("/api/demo");
      const data = (await response.json()) as DemoResponse;
      setExampleFromServer(data.message);
    } catch {}
  };

  if (page === "leaderboard") return (
    <Layout>
      <section className="container py-16">
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-foreground/70 mt-1">See top scores for videos you practiced.</p>
        <div className="mt-8 text-sm text-foreground/60">No attempts recorded yet.</div>
      </section>
    </Layout>
  );

  if (page === "settings") return (
    <Layout>
      <section className="container py-16">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-foreground/70 mt-1">Configure reminders, privacy, and grading.</p>
        <div className="mt-8 grid gap-6 max-w-2xl">
          <div className="rounded-xl border p-5">
            <div className="font-medium">Engagement Reminders</div>
            <p className="text-sm text-foreground/70">Show a gentle reminder after 2 minutes of inactivity.</p>
            <div className="mt-3 flex gap-3">
              <Button size="sm">Enable</Button>
              <Button variant="secondary" size="sm">Disable</Button>
            </div>
          </div>
          <div className="rounded-xl border p-5">
            <div className="font-medium">AI Grading</div>
            <p className="text-sm text-foreground/70">Opt in to AI grading for subjective answers (uses your API key).</p>
            <div className="mt-3 flex gap-3">
              <Button size="sm">Enable</Button>
              <Button variant="secondary" size="sm">Disable</Button>
            </div>
          </div>
          <div className="rounded-xl border p-5">
            <div className="font-medium">Leaderboard Privacy</div>
            <p className="text-sm text-foreground/70">Appear on local leaderboards with an anonymized name.</p>
            <div className="mt-3 flex gap-3">
              <Button size="sm">Opt in</Button>
              <Button variant="secondary" size="sm">Opt out</Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );

  return (
    <Layout>
      <section className="container pt-16 pb-10" id="hero">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <Badge variant="secondary" className="mb-4">Chrome Extension Concept</Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              YouTube Learn Buddy
            </h1>
            <p className="mt-4 text-lg text-foreground/80">
              Smart quiz pop‑ups, struggle detection, gentle reminders, end-of-video assessments, and gamified streaks — all powered by transcripts and your viewing behavior.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="#demo"><Button size="lg">Try the Demo</Button></a>
              <a href="#features"><Button size="lg" variant="secondary">Explore Features</Button></a>
            </div>
          </div>
          <div className="rounded-xl border p-3 bg-card/60 shadow-xl">
            <div className="grid gap-3">
              <VideoStudyDemoWrapper videoId="M7lc1UVf-VE" />
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16" id="features">
        <h2 className="text-2xl font-bold">Everything you need to stay engaged</h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Feature title="Smart Quiz Pop‑ups" desc="Auto‑triggered when engagement dips. Multiple choice or fill‑in with explanations." />
          <Feature title="Struggle Detection" desc="Rewinds 3+ times? Get a concise, friendly explanation of that segment." />
          <Feature title="Engagement Reminders" desc="Paused or inactive for 2 minutes? A gentle nudge with Resume / Dismiss / Remind later." />
          <Feature title="Learning Assessment" desc="Choose MCQ or subjective at the end. Optional AI grading with explanations." />
          <Feature title="Gamified Streaks" desc="Track streaks, earn badges, and stay motivated day after day." />
          <Feature title="Optional Leaderboards" desc="Compare within your group using anonymized names. Opt in/out anytime." />
        </div>
      </section>

      <section className="container py-16" id="demo">
        <h2 className="text-2xl font-bold">Interactive Demo</h2>
        <p className="text-foreground/70 mt-1">Load a YouTube video and experience pop‑ups based on your playback behavior. For best results, try pausing, seeking, or rewinding a few times.</p>
        <div className="mt-6 rounded-xl border p-3 bg-card/60 shadow-xl">
          <VideoStudyDemoWrapper videoId="M7lc1UVf-VE" />
        </div>
      </section>

      <section id="privacy" className="container py-16">
        <h2 className="text-2xl font-bold">Privacy First</h2>
        <p className="text-foreground/70 mt-2 max-w-2xl">All processing runs locally by default. Your data is stored in your browser. You can opt‑in to AI grading or cloud sync if desired.</p>
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
