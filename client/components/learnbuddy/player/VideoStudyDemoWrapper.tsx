import { useEffect, useState } from "react";
import VideoStudyPlayer from "./VideoStudyPlayer";
import { parseVTT } from "../transcript/parser";
import {
  generateQuestionFromText,
  generateAssessmentFromSegments,
} from "../quiz/engine";
import QuizOverlay from "../quiz/QuizOverlay";
import HelpPopup from "../HelpPopup";
import AssessmentOverlay from "../assessment/AssessmentOverlay";
import { gradeSubjective } from "../assessment/grader";
import { summarize } from "../nlp/nlp";
import { findSegmentAt } from "../transcript/parser";
import { saveAttempt } from "../storage";

const DEFAULT_VTT = `WEBVTT

00:00.000 --> 00:07.000
Welcome to our introduction on algorithms. In this lesson, we'll explore what algorithms are and why they matter.

00:07.000 --> 00:15.000
An algorithm is a step-by-step procedure for solving a problem. Think of a recipe or a set of instructions.

00:15.000 --> 00:24.000
We'll compare different algorithms by their efficiency, often measured using Big O notation like O(n) or O(log n).

00:24.000 --> 00:33.000
Let's start with a simple example: linear search. Linear search checks each element one-by-one until it finds a match.

00:33.000 --> 00:42.000
In contrast, binary search repeatedly divides a sorted list in half, quickly narrowing down where the value could be.

00:42.000 --> 00:52.000
Binary search runs in logarithmic time, O(log n), which is much faster than linear time, O(n), for large inputs.

00:52.000 --> 01:00.000
Next, we'll discuss sorting algorithms like bubble sort, insertion sort, and merge sort, each with different tradeoffs.
`;

export default function VideoStudyDemoWrapper({
  videoId,
}: {
  videoId: string;
}) {
  const [segments, setSegments] = useState<any[]>([]);
  const [quiz, setQuiz] = useState<any | null>(null);
  const [helpText, setHelpText] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [assessmentOpen, setAssessmentOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch("/sample-transcript.vtt", { cache: "no-store" });
        if (!r.ok) throw new Error(String(r.status));
        const t = await r.text();
        setSegments(parseVTT(t));
      } catch {
        setSegments(parseVTT(DEFAULT_VTT));
      }
    };
    load();
  }, []);

  const mapToSegment = (t: number) => {
    let seg = findSegmentAt(segments, t);
    if (seg) return seg;
    // fallback to nearest segment by time
    return (
      segments.reduce((best: any, cur: any) => {
        const dist = Math.min(Math.abs(t - cur.start), Math.abs(t - cur.end));
        if (!best || dist < best.dist) return { seg: cur, dist } as any;
        return best;
      }, null)?.seg ?? null
    );
  };

  const overlayActive = Boolean(quiz || helpText || assessmentOpen || summary);

  return (
    <div className="relative">
      <div className="grid gap-3">
        <VideoStudyPlayer
          videoId={videoId}
          overlayActive={overlayActive}
          onQuizTrigger={(ts) => {
            const seg = mapToSegment(ts);
            if (!seg) return;
            setQuiz(generateQuestionFromText(seg.text));
          }}
          onStruggle={(r) => {
            const seg = mapToSegment((r.start + r.end) / 2);
            if (!seg) return;
            setHelpText(seg.text);
            setSummary(null);
          }}
          onReminder={() => {
            setHelpText("It seems you are inactive. Remember to stay focused.");
          }}
          onEnded={() => setAssessmentOpen(true)}
        />
        <div className="mt-3 flex justify-end">
          <button
            className="rounded-full bg-violet-600 text-white px-4 py-2 shadow-lg"
            onClick={() => setAssessmentOpen(true)}
          >
            Take Assessment
          </button>
        </div>
      </div>

      {quiz && (
        <QuizOverlay
          question={quiz}
          onSubmit={() => {
            setQuiz(null);
          }}
          onSkip={() => setQuiz(null)}
          onExplain={() => setQuiz(null)}
          onClose={() => setQuiz(null)}
        />
      )}

      {helpText && (
        <HelpPopup
          text={helpText}
          onAccept={() => {
            try {
              const s = summarize(helpText, 2);
              setSummary(s);
            } catch {
              setSummary(helpText.slice(0, 220));
            }
            setHelpText(null);
          }}
          onClose={() => setHelpText(null)}
        />
      )}

      {summary && (
        <div className="absolute inset-6 flex items-end justify-center pointer-events-none">
          <div className="relative pointer-events-auto max-w-xl w-full rounded-xl border bg-card/80 p-4 shadow-xl">
            <button
              aria-label="Close"
              className="absolute right-3 top-3 text-foreground/60 hover:text-foreground"
              onClick={() => setSummary(null)}
            >
              ×
            </button>
            <div className="font-semibold">Summary</div>
            <p className="mt-2 text-sm text-foreground/80 whitespace-pre-line">
              {summary}
            </p>
            <div className="mt-3 flex justify-end">
              <button
                className="text-sm text-foreground/70 underline"
                onClick={() => setSummary(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {assessmentOpen && (
        <AssessmentOverlay
          questions={generateAssessmentFromSegments(segments, 5)}
          onClose={() => setAssessmentOpen(false)}
          onSubmitSubjective={(ans) => gradeSubjective(ans)}
          onComplete={({ score, mode }) =>
            saveAttempt({ ts: Date.now(), videoId, score, mode })
          }
        />
      )}
    </div>
  );
}
