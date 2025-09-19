import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import YouTubePlayer, { YTPlayerState } from "./YouTubePlayer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Props {
  videoId: string;
  onEnded?: () => void;
  onQuizTrigger?: (timestamp: number) => void; // legacy heuristic trigger
  onScheduled?: (timestamp: number) => void; // scheduled fixed-time quizzes
  scheduledQuizzes?: number[];
  onStruggle?: (range: { start: number; end: number }) => void;
  onReminder?: () => void;
  overlayActive?: boolean;
}

export default function VideoStudyPlayer({ videoId, onEnded, onQuizTrigger, onStruggle, onReminder, overlayActive, onScheduled, scheduledQuizzes }: Props) {
  const apiRef = useRef<{ getCurrentTime: () => number; getDuration: () => number; seekTo: (s: number) => void; play: () => void; pause: () => void; } | null>(null);
  const [state, setState] = useState<YTPlayerState>("unstarted");
  const [progress, setProgress] = useState(0);
  const lastTimeRef = useRef(0);
  const bucketsRef = useRef<Record<number, { pauses: number; rewinds: number; seeks: number }>>({});
  const rewindWindowRef = useRef<{ times: number[] }>({ times: [] });
  const inactivityTimerRef = useRef<number | null>(null);
  const firedScheduledRef = useRef<Set<number>>(new Set());

  const resetInactivity = useCallback(() => {
    if (inactivityTimerRef.current) window.clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = window.setTimeout(() => {
      onReminder?.();
    }, 120000);
  }, [onReminder]);

  const onReady = useCallback((api: any) => {
    apiRef.current = api;
    lastTimeRef.current = api.getCurrentTime();
    resetInactivity();
  }, [resetInactivity]);

  // Pause playback whenever an overlay popup is active
  useEffect(() => {
    if (overlayActive) {
      apiRef.current?.pause();
    }
  }, [overlayActive]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const api = apiRef.current;
      if (!api) return;
      const t = api.getCurrentTime();
      const d = Math.max(api.getDuration(), 1);
      setProgress((t / d) * 100);

      const delta = t - lastTimeRef.current;
      const bucket = Math.floor(t / 10); // 10s buckets
      bucketsRef.current[bucket] ||= { pauses: 0, rewinds: 0, seeks: 0 };

      if (delta < -2) {
        // rewind detected
        bucketsRef.current[bucket].rewinds++;
        rewindWindowRef.current.times.push(Date.now());
        // clean >2min
        rewindWindowRef.current.times = rewindWindowRef.current.times.filter((ts) => Date.now() - ts < 120000);
        const count = rewindWindowRef.current.times.length;
        if (count >= 3) {
          onStruggle?.({ start: Math.max(t - 10, 0), end: t + 5 });
          rewindWindowRef.current.times = [];
        }
      } else if (Math.abs(delta) > 5) {
        bucketsRef.current[bucket].seeks++;
      }

      // heuristic quiz trigger: if interactions exceed threshold in bucket
      const b = bucketsRef.current[bucket];
      if (b && (b.rewinds + b.pauses) >= 4) {
        onQuizTrigger?.(bucket * 10);
        // dampen to avoid repeat
        bucketsRef.current[bucket] = { pauses: 0, rewinds: 0, seeks: 0 };
      }

      lastTimeRef.current = t;
    }, 1000);
    return () => window.clearInterval(id);
  }, [onQuizTrigger, onStruggle]);

  const onStateChange = useCallback((s: YTPlayerState) => {
    setState(s);
    if (s === "paused") {
      const t = apiRef.current?.getCurrentTime?.() ?? 0;
      const bucket = Math.floor(t / 10);
      bucketsRef.current[bucket] ||= { pauses: 0, rewinds: 0, seeks: 0 };
      bucketsRef.current[bucket].pauses++;
    }
    if (s === "ended") onEnded?.();
    if (s === "playing") resetInactivity();
  }, [onEnded, resetInactivity]);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) return; // resume timer when visible
      resetInactivity();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [resetInactivity]);

  return (
    <div className="w-full space-y-3">
      <YouTubePlayer videoId={videoId} onReady={onReady} onStateChange={onStateChange} />
      <div className="flex items-center gap-3">
        <Progress className="h-2 flex-1" value={progress} />
        <span className="text-xs text-foreground/60 min-w-14 text-right">{Math.round(progress)}%</span>
        <Button size="sm" variant={state === "playing" ? "secondary" : "default"}
          onClick={() => (state === "playing" ? apiRef.current?.pause() : apiRef.current?.play())}
        >{state === "playing" ? "Pause" : "Play"}</Button>
      </div>
    </div>
  );
}
