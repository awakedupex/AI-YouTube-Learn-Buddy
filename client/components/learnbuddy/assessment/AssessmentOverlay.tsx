import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Question } from "../quiz/engine";

export default function AssessmentOverlay({
  questions,
  onClose,
  onSubmitSubjective,
  onComplete,
}: {
  questions: Question[];
  onClose: () => void;
  onSubmitSubjective: (
    answer: string,
  ) => Promise<{ score: number; feedback: string }>;
  onComplete?: (payload: { mode: "mcq" | "subjective"; score: number }) => void;
}) {
  const [mode, setMode] = useState<"mcq" | "subjective">("mcq");
  const [selected, setSelected] = useState<number[]>(
    Array(questions.length).fill(-1),
  );
  const [subjective, setSubjective] = useState("");
  const [result, setResult] = useState<{
    score: number;
    feedback: string;
  } | null>(null);

  const score = useMemo(() => {
    let s = 0,
      t = 0;
    questions.forEach((q, i) => {
      if (q.type === "mcq") {
        t++;
        if (selected[i] === (q as any).correctIndex) s++;
      }
    });
    return t ? Math.round((s / t) * 100) : 0;
  }, [questions, selected]);

  return (
    <div className="absolute inset-0 flex items-center justify-center p-3">
      <Card className="relative w-full max-w-3xl border-2">
        <button
          aria-label="Close"
          className="absolute right-3 top-3 text-foreground/60 hover:text-foreground"
          onClick={onClose}
        >
          ×
        </button>
        <CardHeader>
          <CardTitle>End of Video Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-4">
            <Button
              variant={mode === "mcq" ? "default" : "secondary"}
              onClick={() => setMode("mcq")}
            >
              Multiple‑choice
            </Button>
            <Button
              variant={mode === "subjective" ? "default" : "secondary"}
              onClick={() => setMode("subjective")}
            >
              Subjective (AI‑graded)
            </Button>
          </div>

          {mode === "mcq" ? (
            <div className="space-y-5 max-h-[50vh] overflow-auto pr-2">
              {questions.map((q, qi) => (
                <div key={qi} className="rounded-lg border p-4">
                  <div className="font-medium">
                    Q{qi + 1}. {q.prompt}
                  </div>
                  {q.type === "mcq" && (
                    <div className="mt-3 grid gap-2">
                      {q.options.map((opt, i) => (
                        <Button
                          key={i}
                          variant={selected[qi] === i ? "default" : "secondary"}
                          className="justify-start"
                          onClick={() =>
                            setSelected((s) => {
                              const n = [...s];
                              n[qi] = i;
                              return n;
                            })
                          }
                        >
                          {opt}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex items-center justify-between">
                <div className="text-sm text-foreground/70">
                  Score: {score}%
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={onClose}>
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      onComplete?.({ mode: "mcq", score });
                      onClose();
                    }}
                  >
                    Submit & Save
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                className="w-full min-h-[200px] rounded-md border p-3 bg-background"
                placeholder="Write what you learned..."
                value={subjective}
                onChange={(e) => setSubjective(e.target.value)}
              />
              <div className="flex gap-3">
                <Button
                  onClick={async () => {
                    const r = await onSubmitSubjective(subjective);
                    setResult(r);
                    onComplete?.({ mode: "subjective", score: r.score });
                  }}
                >
                  Submit for grading
                </Button>
                <Button variant="secondary" onClick={onClose}>
                  Close
                </Button>
              </div>
              {result && (
                <div className="rounded-lg border p-3 bg-secondary/50">
                  <div className="font-medium">AI Feedback</div>
                  <div className="text-sm mt-1">Score: {result.score}%</div>
                  <p className="text-sm text-foreground/70 mt-1 whitespace-pre-line">
                    {result.feedback}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
