export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

const srtTimeToSeconds = (t: string) => {
  const [h, m, s] = t.replace(",", ".").split(":");
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
};

const vttTimeToSeconds = (t: string) => {
  const [h, m, s] = t.split(":");
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
};

export function parseVTT(vtt: string): TranscriptSegment[] {
  const lines = vtt.split(/\r?\n/);
  const segments: TranscriptSegment[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/-->/i.test(line)) {
      const [start, end] = line.split(/\s+-->\s+/);
      const textLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== "") {
        textLines.push(lines[i]);
        i++;
      }
      segments.push({ start: vttTimeToSeconds(start.trim()), end: vttTimeToSeconds(end.trim()), text: textLines.join(" ") });
    }
  }
  return segments;
}

export function parseSRT(srt: string): TranscriptSegment[] {
  const blocks = srt.split(/\n\s*\n/);
  const out: TranscriptSegment[] = [];
  for (const block of blocks) {
    const lines = block.trim().split(/\r?\n/);
    if (lines.length >= 2) {
      const times = lines[1];
      const m = times.match(/(\d{2}:\d{2}:\d{2},?\d{0,3})\s*-->\s*(\d{2}:\d{2}:\d{2},?\d{0,3})/);
      if (!m) continue;
      const text = lines.slice(2).join(" ");
      out.push({ start: srtTimeToSeconds(m[1]), end: srtTimeToSeconds(m[2]), text });
    }
  }
  return out;
}

export function findSegmentAt(segments: TranscriptSegment[], t: number): TranscriptSegment | null {
  return segments.find((s) => t >= s.start && t <= s.end) ?? null;
}
