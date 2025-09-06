import { useEffect, useState } from "react";
import VideoStudyPlayer from "./VideoStudyPlayer";
import TranscriptManager from "../transcript/TranscriptManager";
import { parseVTT } from "../transcript/parser";
import { generateQuestionFromText, generateAssessmentFromSegments } from "../quiz/engine";
import QuizOverlay from "../quiz/QuizOverlay";
import HelpPopup from "../HelpPopup";
import AssessmentOverlay from "../assessment/AssessmentOverlay";
import { gradeSubjective } from "../assessment/grader";
import { summarize } from "../nlp/nlp";
import { findSegmentAt } from "../transcript/parser";
import { saveAttempt } from "../storage";

export default function VideoStudyDemoWrapper({ videoId }: { videoId: string }) {
  const [segments, setSegments] = useState<any[]>([]);
  const [quiz, setQuiz] = useState<any | null>(null);
  const [helpText, setHelpText] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [assessmentOpen, setAssessmentOpen] = useState(false);

  useEffect(() => {
    fetch('/sample-transcript.vtt').then((r) => r.text()).then((t) => {
      setSegments(parseVTT(t));
    });
  }, []);

  const mapToSegment = (t: number) => {
    let seg = findSegmentAt(segments, t);
    if (seg) return seg;
    // fallback to nearest segment by time
    return segments.reduce((best: any, cur: any) => {
      const dist = Math.min(Math.abs(t - cur.start), Math.abs(t - cur.end));
      if (!best || dist < best.dist) return { seg: cur, dist } as any;
      return best;
    }, null)?.seg ?? null;
  };

  return (
    <div className="relative">
      <div className="grid gap-3">
        <VideoStudyPlayer videoId={videoId} onQuizTrigger={(ts) => {
          const seg = mapToSegment(ts);
          if (!seg) return;
          setQuiz(generateQuestionFromText(seg.text));
        }} onStruggle={(r) => {
          const seg = mapToSegment((r.start + r.end) / 2);
          if (!seg) return;
          setHelpText(seg.text);
          setSummary(null);
        }} onReminder={() => {
          setHelpText('It seems you are inactive. Remember to stay focused.');
        }} onEnded={() => setAssessmentOpen(true)} />
      </div>

      {quiz && (
        <QuizOverlay question={quiz} onSubmit={() => { setQuiz(null); }} onSkip={() => setQuiz(null)} onExplain={() => setQuiz(null)} onClose={() => setQuiz(null)} />
      )}

      {helpText && (
        <HelpPopup text={helpText} onAccept={() => {
          try {
            const s = summarize(helpText, 2);
            setSummary(s);
          } catch {
            setSummary(helpText.slice(0, 220));
          }
          setHelpText(null);
        }} onClose={() => setHelpText(null)} />
      )}

      {summary && (
        <div className="absolute inset-6 flex items-end justify-center pointer-events-none">
          <div className="relative pointer-events-auto max-w-xl w-full rounded-xl border bg-card/80 p-4 shadow-xl">
            <button aria-label="Close" className="absolute right-3 top-3 text-foreground/60 hover:text-foreground" onClick={() => setSummary(null)}>×</button>
            <div className="font-semibold">Summary</div>
            <p className="mt-2 text-sm text-foreground/80 whitespace-pre-line">{summary}</p>
            <div className="mt-3 flex justify-end">
              <button className="text-sm text-foreground/70 underline" onClick={() => setSummary(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {assessmentOpen && (
        <AssessmentOverlay questions={generateAssessmentFromSegments(segments, 5)} onClose={() => setAssessmentOpen(false)} onSubmitSubjective={(ans) => gradeSubjective(ans)} onComplete={({ score, mode }) => saveAttempt({ ts: Date.now(), videoId, score, mode })} />
      )}

      <div className="absolute right-4 bottom-16 md:bottom-20 flex flex-col gap-2">
        <button className="rounded-full bg-violet-600 text-white px-4 py-2 shadow-lg" onClick={() => setAssessmentOpen(true)}>Take Assessment</button>
      </div>
    </div>
  );
}
