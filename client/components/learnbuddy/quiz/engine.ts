import { keywords, summarize } from "../nlp/nlp";

export type Question =
  | { type: "mcq"; prompt: string; options: string[]; correctIndex: number }
  | { type: "fill"; prompt: string; answer: string };

export function generateQuestionFromText(text: string): Question {
  const keys = keywords(text, 6);
  const promptBase = summarize(text, 1);
  if (keys.length >= 3) {
    const correct = keys[0];
    const distractors = Array.from(new Set(keys.slice(1))).slice(0, 3);
    const all = [...distractors, correct].sort(() => Math.random() - 0.5);
    return {
      type: "mcq",
      prompt: `${promptBase}\nWhat key term best fits this segment?`,
      options: all,
      correctIndex: all.indexOf(correct),
    };
  }
  return {
    type: "fill",
    prompt: `${promptBase}\nFill in the key term: ____`,
    answer: keys[0] ?? text.split(/\s+/)[0],
  };
}

export function generateAssessmentFromSegments(segments: { text: string }[], count = 5): Question[] {
  const pool = segments.filter((s) => s.text.trim().length > 20);
  const chosen = pool.sort(() => Math.random() - 0.5).slice(0, count);
  return chosen.map((s) => generateQuestionFromText(s.text));
}
