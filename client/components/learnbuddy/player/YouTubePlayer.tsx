import { useEffect, useRef } from "react";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export type YTPlayerState =
  | "unstarted"
  | "ended"
  | "playing"
  | "paused"
  | "buffering"
  | "cued";

export interface YouTubePlayerProps {
  videoId: string;
  onReady?: (api: {
    getCurrentTime: () => number;
    getDuration: () => number;
    seekTo: (s: number) => void;
    play: () => void;
    pause: () => void;
  }) => void;
  onStateChange?: (state: YTPlayerState) => void;
}

export default function YouTubePlayer({
  videoId,
  onReady,
  onStateChange,
}: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const readyRef = useRef<YouTubePlayerProps["onReady"]>(onReady);
  const stateRef = useRef<YouTubePlayerProps["onStateChange"]>(onStateChange);

  // Keep latest handlers without forcing player remounts
  useEffect(() => {
    readyRef.current = onReady;
  }, [onReady]);
  useEffect(() => {
    stateRef.current = onStateChange;
  }, [onStateChange]);

  useEffect(() => {
    let destroyed = false;

    const createPlayer = () => {
      if (destroyed || !containerRef.current || !window.YT || !window.YT.Player)
        return;
      if (playerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        // use 100% so the iframe fills the container; container uses aspect-video to keep 16:9
        height: "100%",
        width: "100%",
        videoId,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: () => {
            const api = {
              getCurrentTime: () => playerRef.current?.getCurrentTime?.() ?? 0,
              getDuration: () => playerRef.current?.getDuration?.() ?? 0,
              seekTo: (s: number) => playerRef.current?.seekTo?.(s, true),
              play: () => playerRef.current?.playVideo?.(),
              pause: () => playerRef.current?.pauseVideo?.(),
            };
            readyRef.current?.(api);
          },
          onStateChange: (e: any) => {
            const map: Record<number, YTPlayerState> = {
              [-1]: "unstarted",
              0: "ended",
              1: "playing",
              2: "paused",
              3: "buffering",
              5: "cued",
            };
            stateRef.current?.(map[e.data] ?? "unstarted");
          },
        },
      });
    };

    const ensureScript = () =>
      new Promise<void>((resolve) => {
        if (window.YT && window.YT.Player) return resolve();
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          prev?.();
          resolve();
        };
        document.body.appendChild(tag);
      });

    ensureScript().then(() => {
      if (destroyed) return;
      // Try immediately
      createPlayer();
      // And retry shortly in case of race with layout/DOM
      requestAnimationFrame(createPlayer);
      setTimeout(createPlayer, 50);
    });

    return () => {
      destroyed = true;
      try {
        playerRef.current?.destroy?.();
      } catch {}
      playerRef.current = null;
    };
  }, [videoId]);

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="aspect-video w-full rounded-xl overflow-hidden shadow-xl"
      />
    </div>
  );
}
