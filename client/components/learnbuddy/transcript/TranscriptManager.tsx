import { useEffect, useState } from "react";
import { parseVTT, TranscriptSegment } from "../transcript/parser";

export default function TranscriptManager({ onLoad }: { onLoad: (segments: TranscriptSegment[]) => void }) {
  const [segments, setSegments] = useState<TranscriptSegment[] | null>(null);

  useEffect(() => {
    // load sample transcript
    fetch("/sample-transcript.vtt").then((r) => r.text()).then((t) => {
      const segs = parseVTT(t);
      setSegments(segs);
      onLoad(segs);
    }).catch(() => {});
  }, [onLoad]);

  return (
    <div className="space-y-2">
      <div className="text-sm text-foreground/70">Transcript loaded: {segments ? segments.length : 0} segments</div>
      <label className="inline-flex items-center gap-2 text-sm">
        <input type="file" accept=".vtt,.srt" onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const text = await f.text();
          const segs = f.name.endsWith('.srt') ? (await import('../transcript/parser')).parseSRT(text) : (await import('../transcript/parser')).parseVTT(text);
          setSegments(segs);
          onLoad(segs);
        }} />
        <span className="text-foreground/70 text-sm">Upload transcript (.vtt or .srt)</span>
      </label>
    </div>
  );
}
