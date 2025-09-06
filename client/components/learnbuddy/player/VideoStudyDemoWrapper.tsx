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

  return (
    <div className="relative">
      <div className="grid gap-3">
        <VideoStudyPlayer videoId={videoId} onQuizTrigger={(ts) => {
          const seg = segments.find((s) => ts >= s.start && ts <= s.end) || segments[Math.floor(ts/10)];
          if (!seg) return;
          setQuiz(generateQuestionFromText(seg.text));
        }} onStruggle={(r) => {
          const seg = segments.find((s) => r.start >= s.start && r.start <= s.end) || segments[Math.floor(r.start/10)];
          if (!seg) return;
          setHelpText(seg.text);
          setSummary(null);
        }} onReminder={() => {
          // open a small toast - for demo we'll set a help text
          setHelpText('It seems you are inactive. Remember to stay focused.');
        }} />
      </div>

      {quiz && (
        <QuizOverlay question={quiz} onSubmit={() => { setQuiz(null); }} onSkip={() => setQuiz(null)} onExplain={() => setQuiz(null)} />
      )}

      {helpText && (
        <HelpPopup text={helpText} onAccept={() => {
          // produce a concise summary using our lightweight summarizer
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
          <div className="pointer-events-auto max-w-xl w-full rounded-xl border bg-card/80 p-4 shadow-xl">
            <div className="font-semibold">Summary</div>
            <p className="mt-2 text-sm text-foreground/80 whitespace-pre-line">{summary}</p>
            <div className="mt-3 flex justify-end">
              <button className="text-sm text-foreground/70 underline" onClick={() => setSummary(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {assessmentOpen && (
        <AssessmentOverlay questions={generateAssessmentFromSegments(segments, 5)} onClose={() => setAssessmentOpen(false)} onSubmitSubjective={(ans) => gradeSubjective(ans)} />
      )}

      <div className="absolute right-4 bottom-4 flex flex-col gap-2">
        <button className="rounded-full bg-violet-600 text-white px-4 py-2" onClick={() => setAssessmentOpen(true)}>Take Assessment</button>
      </div>
    </div>
  );
}
