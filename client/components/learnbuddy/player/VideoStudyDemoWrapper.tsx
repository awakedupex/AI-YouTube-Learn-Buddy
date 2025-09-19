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
  const [quizTitle, setQuizTitle] = useState<string | undefined>(undefined);
  const [helpText, setHelpText] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [assessmentQuestions, setAssessmentQuestions] = useState<any[] | null>(null);

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

  // Predefined quick quizzes (times in seconds)
  const quickQuizzes: { time: number; question: import("../quiz/engine").Question }[] = [
    {
      time: 2 * 60 + 24,
      question: {
        type: "mcq",
        prompt: "Data science involves having knowledge in which of these fields?",
        options: [
          "Mathematics and statistics only",
          "Computer science only",
          "Your domain expertise only",
          "All of the above",
        ],
        correctIndex: 3,
      },
    },
    {
      time: 4 * 60 + 16,
      question: {
        type: "mcq",
        prompt: "Which of these is an application of data science?",
        options: [
          "A recommender system of an e-commerce website",
          "Creating HTML web pages",
          "Installing operating systems",
          "Writing documentation manuals",
        ],
        correctIndex: 0,
      },
    },
    {
      time: 6 * 60 + 7,
      question: {
        type: "mcq",
        prompt: "Which country has the highest number of data scientists on Kaggle?",
        options: ["India", "United States", "China", "Germany"],
        correctIndex: 0,
      },
    },
  ];

  // End of video assessment questions
  const endAssessment: import("../quiz/engine").Question[] = [
    {
      type: "mcq",
      prompt: "What is data science?",
      options: [
        "Using processes and systems to extract knowledge or insights from data",
        "Creating databases for large corporations",
        "Designing user interfaces for mobile applications",
        "Managing network security systems",
      ],
      correctIndex: 0,
    },
    {
      type: "mcq",
      prompt: "Which of these offline applications use data science?",
      options: [
        "Predictive maintenance of machines in industries",
        "Monitoring real-time disease outbreaks",
        "Forecasting changes in climate",
        "All of these",
      ],
      correctIndex: 3,
    },
    {
      type: "mcq",
      prompt: "Which job did Harvard Business Review describe as \"the sexiest job of the 21st century\"?",
      options: ["Data scientist", "Software engineer", "Product manager", "Machine learning engineer"],
      correctIndex: 0,
    },
  ];

  const overlayActive = Boolean(quiz || helpText || assessmentOpen || summary);

  return (
    <div className="relative">
      <div className="grid gap-3">
        <VideoStudyPlayer
          videoId={videoId}
          overlayActive={overlayActive}
          scheduledQuizzes={quickQuizzes.map((q) => q.time)}
          onScheduled={(schedTime) => {
            // find quiz for this scheduled time and open it
            const match = quickQuizzes.find((q) => q.time === schedTime);
            if (!match) return;
            setQuiz(match.question);
            setQuizTitle("Quick Quiz");
          }}
          onStruggle={(r) => {
            if (overlayActive) return;
            const seg = mapToSegment((r.start + r.end) / 2);
            if (!seg) return;
            setHelpText(seg.text);
            setSummary(null);
          }}
          onReminder={() => {
            if (overlayActive) return;
            setHelpText("It seems you are inactive. Remember to stay focused.");
          }}
          onEnded={() => {
            if (overlayActive) return;
            setAssessmentQuestions(endAssessment);
            setAssessmentOpen(true);
          }}
        />
        <div className="mt-3 flex justify-end">
          <button
            className="rounded-full bg-violet-600 text-white px-4 py-2 shadow-lg"
            onClick={() => {
              if (overlayActive) return;
              setAssessmentQuestions(endAssessment);
              setAssessmentOpen(true);
            }}
          >
            Take Assessment
          </button>
        </div>
      </div>

      {quiz && (
        <QuizOverlay
          title={quizTitle}
          question={quiz}
          onSubmit={() => {
            setQuiz(null);
            setQuizTitle(undefined);
          }}
          onSkip={() => {
            setQuiz(null);
            setQuizTitle(undefined);
          }}
          onExplain={() => {
            setQuiz(null);
            setQuizTitle(undefined);
          }}
          onClose={() => {
            setQuiz(null);
            setQuizTitle(undefined);
          }}
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
          questions={assessmentQuestions ?? generateAssessmentFromSegments(segments, 5)}
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
