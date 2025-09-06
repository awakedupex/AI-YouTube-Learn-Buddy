import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Question } from "./engine";

export default function QuizOverlay({
  question,
  onSubmit,
  onSkip,
  onExplain,
  onClose,
}: {
  question: Question;
  onSubmit: (correct: boolean) => void;
  onSkip: () => void;
  onExplain: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-3">
      <Card className="relative w-full max-w-xl border-2">
        <button aria-label="Close" className="absolute right-3 top-3 text-foreground/60 hover:text-foreground" onClick={() => (onClose ?? onSkip)()}>×</button>
        <CardHeader>
          <CardTitle className="text-lg">Quick Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-foreground/80 whitespace-pre-line">{question.prompt}</p>
            {question.type === "mcq" ? (
              <div className="grid gap-2">
                {question.options.map((opt, i) => (
                  <Button key={i} variant="secondary" className="justify-start" onClick={() => onSubmit(i === (question as any).correctIndex)}>
                    {opt}
                  </Button>
                ))}
              </div>
            ) : (
              <FillIn onSubmit={(ans) => onSubmit(ans.trim().toLowerCase() === (question as any).answer.toLowerCase())} />
            )}
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={onSkip}>Skip</Button>
              <Button variant="link" onClick={onExplain}>Explain more</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FillIn({ onSubmit }: { onSubmit: (answer: string) => void }) {
  let input: HTMLInputElement | null = null;
  return (
    <div className="flex items-center gap-2">
      <input ref={(r) => (input = r)} className="flex-1 h-10 rounded-md border px-3 bg-background" placeholder="Type your answer" />
      <Button onClick={() => onSubmit(input?.value ?? "")}>Submit</Button>
    </div>
  );
}
