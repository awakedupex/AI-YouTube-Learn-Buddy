import { useEffect, useState } from "react";
import VideoStudyPlayer from "./VideoStudyPlayer";
import TranscriptManager from "../transcript/TranscriptManager";
import { parseVTT } from "../transcript/parser";
import { generateQuestionFromText } from "../quiz/engine";
import QuizOverlay from "../quiz/QuizOverlay";
import HelpPopup from "../HelpPopup";
import AssessmentOverlay from "../assessment/AssessmentOverlay";
import { generateAssessmentFromSegments } from "../quiz/engine";
import { gradeSubjective } from "../assessment/grader";

export default function VideoStudyDemoWrapper({ videoId }: { videoId: string }) {
  const [segments, setSegments] = useState<any[]>([]);
  const [quiz, setQuiz] = useState<any | null>(null);
  const [help, setHelp] = useState<string | null>(null);
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
          setHelp(seg.text);
        }} onReminder={() => {
          // open a small toast - for demo we'll set a help text
          setHelp('It seems you are inactive. Remember to stay focused.');
        }} />
      </div>

      {quiz && (
        <QuizOverlay question={quiz} onSubmit={(c) => { setQuiz(null); }} onSkip={() => setQuiz(null)} onExplain={() => setQuiz(null)} />
      )}

      {help && (
        <HelpPopup text={help} onAccept={() => {
          // show summary
          setHelp(null);
          setHelp('Summary: ' + help.slice(0, 220));
        }} onClose={() => setHelp(null)} />
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
