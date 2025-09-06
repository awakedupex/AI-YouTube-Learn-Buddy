export async function gradeSubjective(answer: string, rubricHint?: string): Promise<{ score: number; feedback: string }> {
  const key = (import.meta as any).env?.VITE_OPENAI_API_KEY as string | undefined;
  const baseFeedback = answer.trim().length < 30 ? "Try elaborating more on key concepts and include examples." : "Good detail. Consider adding definitions and a concise summary.";
  if (!key) {
    // heuristic grading
    const coverage = Math.min(100, Math.round((answer.split(/\b(algorithm|search|sort|big\s*o|complexity|time|space|binary)\b/i).length - 1) * 20));
    const lenScore = Math.min(100, Math.round(answer.length / 6));
    const score = Math.round(0.6 * coverage + 0.4 * Math.min(100, lenScore));
    return { score, feedback: baseFeedback };
  }
  try {
    const prompt = `Grade the following learning summary from 0-100. Provide JSON {"score":number,"feedback":string}. Rubric: clarity, accuracy, key terms, examples.${rubricHint ? ` Topic: ${rubricHint}` : ""}\n\nSummary:\n${answer}`;
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a strict grader. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0,
      }),
    });
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    const json = JSON.parse(content);
    return { score: Number(json.score) || 0, feedback: String(json.feedback || baseFeedback) };
  } catch {
    return { score: 0, feedback: baseFeedback };
  }
}
