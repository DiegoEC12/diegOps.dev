import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Disc3, Music2, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  destroy: () => void;
}

interface YouTubeApi {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      playerVars: Record<string, number>;
      events: {
        onReady: (event: { target: YouTubePlayer }) => void;
        onStateChange: (event: { data: number }) => void;
        onError: () => void;
      };
    }
  ) => YouTubePlayer;
}

declare global {
  interface Window { YT?: YouTubeApi; onYouTubeIframeAPIReady?: () => void; }
}

let youtubeApiPromise: Promise<YouTubeApi> | null = null;
const loadYouTubeApi = () => {
  if (window.YT) return Promise.resolve(window.YT);
  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();
        if (window.YT) resolve(window.YT);
      };
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.appendChild(script);
      }
    });
  }
  return youtubeApiPromise;
};

interface Track {
  id: string;
  title: string;
  artist: string;
  audio_url: string;
  source_type?: "upload" | "direct_url" | "youtube" | null;
  youtube_id?: string | null;
  duration?: string | null;
  is_active: boolean;
}

const normalizeTrackUrl = (value?: string | null) => {
  if (!value) return value;
  return value
    .replace(/\.mp3\.mp3$/i, ".mp3")
    .replace(/\.wav\.wav$/i, ".wav")
    .replace(/\.aac\.aac$/i, ".aac")
    .replace(/\.ogg\.ogg$/i, ".ogg");
};

const getYouTubeId = (track: Track) => {
  const value = track.youtube_id || track.audio_url || "";
  if (/^[\w-]{11}$/.test(value)) return value;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] || "";
    if (["youtube.com", "m.youtube.com", "music.youtube.com"].includes(host)) {
      const id = url.searchParams.get("v");
      if (id) return id;
      const parts = url.pathname.split("/").filter(Boolean);
      if (["embed", "shorts", "live", "v"].includes(parts[0]) && parts[1]) return parts[1];
    }
  } catch {
    return "";
  }
  return "";
};

export function LofiCassettePlayer() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [youtubeEmbedActive, setYoutubeEmbedActive] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const youtubeContainerRef = useRef<HTMLIFrameElement | null>(null);
  const youtubePlayerRef = useRef<YouTubePlayer | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const youtubeAutoplayRequestedRef = useRef(false);
  const interactionCleanupRef = useRef<(() => void) | null>(null);
  const autoplayAttemptedRef = useRef(false);
  isPlayingRef.current = isPlaying;

  const playAudioTrack = (track: Track, restart = false) => {
    if (!track.audio_url) return;
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    if (audio.src !== track.audio_url) audio.src = track.audio_url;
    if (restart) audio.currentTime = 0;
    audio.volume = isMuted ? 0 : volume;
    audio.onended = () => advanceQueueRef.current(true);
    audio.onerror = () => setIsPlaying(false);
    void audio.play().then(() => {
      setIsPlaying(true);
      interactionCleanupRef.current?.();
    }).catch(() => setIsPlaying(false));
  };

  const playTrackAt = (index: number, autoplay: boolean, restart = true) => {
    if (!tracks[index]) return;
    audioRef.current?.pause();
    setCurrentIndex(index);
    const track = tracks[index];
    if (track.source_type === "youtube") {
      setIsPlaying(false);
      youtubeAutoplayRequestedRef.current = autoplay;
      setYoutubeEmbedActive(true);
      return;
    }
    setYoutubeEmbedActive(false);
    if (autoplay) playAudioTrack(track, restart);
    else setIsPlaying(false);
  };

  const advanceQueue = (autoplay = true) => {
    if (tracks.length < 2) {
      setIsPlaying(false);
      return;
    }
    playTrackAt((currentIndex + 1) % tracks.length, autoplay);
  };
  const advanceQueueRef = useRef(advanceQueue);
  advanceQueueRef.current = advanceQueue;
  const currentTrack = tracks[currentIndex] || tracks[0];

  useEffect(() => {
    void (async () => {
      try {
        const { data, error } = await supabase
          .from("music_tracks")
          .select("*")
          .eq("is_active", true)
          .order("sort_order");

        if (!error && data) {
          const validTracks = (data as Track[])
            .map((track) => ({
              ...track,
              audio_url: normalizeTrackUrl(track.audio_url),
              source_type:
                track.source_type === "youtube" || track.youtube_id || getYouTubeId(track)
                  ? "youtube"
                  : track.source_type || "direct_url",
            }))
            .filter((track) =>
              track.source_type === "youtube"
                ? Boolean(getYouTubeId(track))
                : Boolean(track.audio_url && !track.audio_url.startsWith("blob:") && track.audio_url.trim() !== "")
            );

          setTracks(validTracks);
          setCurrentIndex(0);
          if (validTracks.length > 0 && !autoplayAttemptedRef.current) {
            autoplayAttemptedRef.current = true;
            const firstTrack = validTracks[0];
            if (firstTrack.source_type === "youtube") {
              setYoutubeEmbedActive(true);
              youtubeAutoplayRequestedRef.current = true;
              setIsPlaying(false);
            } else {
              playAudioTrack(firstTrack);
            }
          }
        }
      } catch {
        setTracks([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!youtubeEmbedActive || currentTrack?.source_type !== "youtube" || !youtubeContainerRef.current) return;
    let cancelled = false;
    let createdPlayer: YouTubePlayer | null = null;
    const videoId = getYouTubeId(currentTrack);

    void loadYouTubeApi().then((api) => {
      if (cancelled || !youtubeContainerRef.current || !videoId) return;
      createdPlayer = new api.Player(youtubeContainerRef.current, {
        videoId,
        playerVars: {
          autoplay: youtubeAutoplayRequestedRef.current ? 1 : 0,
          controls: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: ({ target }) => {
            youtubePlayerRef.current = target;
            if (youtubeAutoplayRequestedRef.current || isPlayingRef.current) target.playVideo();
          },
          onStateChange: ({ data }) => {
            if (data === 0) {
              youtubeAutoplayRequestedRef.current = false;
              advanceQueueRef.current(true);
            }
            if (data === 1) {
              youtubeAutoplayRequestedRef.current = false;
              setIsPlaying(true);
              interactionCleanupRef.current?.();
            }
            if (data === 2) setIsPlaying(false);
          },
          onError: () => setIsPlaying(false),
        },
      });
      youtubePlayerRef.current = createdPlayer;
    });

    return () => {
      cancelled = true;
      createdPlayer?.destroy();
      if (youtubePlayerRef.current === createdPlayer) youtubePlayerRef.current = null;
    };
  }, [youtubeEmbedActive, currentTrack?.id]);

  useEffect(() => {
    if (!currentTrack) return;

    const cleanup = () => {
      window.removeEventListener("pointerdown", tryPlaybackFromGesture);
      window.removeEventListener("touchstart", tryPlaybackFromGesture);
      window.removeEventListener("keydown", tryPlaybackFromGesture);
      if (interactionCleanupRef.current === cleanup) interactionCleanupRef.current = null;
    };

    function tryPlaybackFromGesture(event: Event) {
      if (isPlayingRef.current) {
        cleanup();
        return;
      }
      const target = event.target;
      if (target instanceof Element && target.closest(".lofi-cassette-widget")) return;

      if (currentTrack.source_type === "youtube") {
        youtubeAutoplayRequestedRef.current = true;
        setYoutubeEmbedActive(true);
        youtubePlayerRef.current?.playVideo();
        return;
      }

      const audio = audioRef.current;
      if (!audio) return;
      void audio.play().then(() => {
        setIsPlaying(true);
        cleanup();
      }).catch(() => setIsPlaying(false));
    }

    window.addEventListener("pointerdown", tryPlaybackFromGesture, { passive: true });
    window.addEventListener("touchstart", tryPlaybackFromGesture, { passive: true });
    window.addEventListener("keydown", tryPlaybackFromGesture);
    interactionCleanupRef.current = cleanup;
    return cleanup;
  }, [currentTrack?.id]);

  const togglePlay = () => {
    if (isPlaying) {
      youtubeAutoplayRequestedRef.current = false;
      audioRef.current?.pause();
      youtubePlayerRef.current?.pauseVideo();
      setIsPlaying(false);
      return;
    }

    if (!currentTrack) return;
    if (currentTrack.source_type === "youtube") {
      if (!getYouTubeId(currentTrack)) return;
      setYoutubeEmbedActive(true);
      youtubeAutoplayRequestedRef.current = true;
      youtubePlayerRef.current?.playVideo();
      return;
    }

    playAudioTrack(currentTrack);
  };

  const nextTrack = () => {
    if (tracks.length < 2) return;
    playTrackAt((currentIndex + 1) % tracks.length, true);
  };

  const prevTrack = () => {
    if (tracks.length < 2) return;
    playTrackAt((currentIndex - 1 + tracks.length) % tracks.length, true);
  };

  const restartCurrentTrack = () => {
    if (!currentTrack) return;
    if (currentTrack.source_type === "youtube") {
      youtubeAutoplayRequestedRef.current = true;
      if (!youtubePlayerRef.current) {
        setYoutubeEmbedActive(false);
        window.setTimeout(() => setYoutubeEmbedActive(true), 0);
        setIsPlaying(true);
        return;
      }
      youtubePlayerRef.current.seekTo(0, true);
      youtubePlayerRef.current.playVideo();
      return;
    }
    playAudioTrack(currentTrack, true);
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (audioRef.current) {
      audioRef.current.volume = nextMute ? 0 : volume;
    }
  };

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <aside
      className={`lofi-cassette-widget ${isCollapsed ? "is-collapsed" : "is-expanded"}`}
      aria-label="Reproductor Cassette Lo-Fi"
    >
      {isCollapsed ? (
        <div className="cassette-collapsed-controls">
          <button
            type="button"
            className="cassette-collapsed-badge"
            onClick={() => setIsCollapsed(false)}
            aria-label="Abrir reproductor de música"
            aria-expanded={false}
            title="Abrir reproductor"
          >
            <span className="collapsed-sound-waves" aria-hidden="true">
              {Array.from({ length: 4 }).map((_, index) => (
                <span key={index} className={`wave-bar ${isPlaying && !isMuted ? "is-animated" : ""}`} />
              ))}
            </span>
            <Music2 className="collapsed-icon" aria-hidden="true" />
            {isPlaying && <span className="collapsed-pulse-dot" aria-hidden="true" />}
          </button>
          <button
            type="button"
            className="cassette-expand-trigger"
            onClick={() => setIsCollapsed(false)}
            aria-label="Expandir reproductor"
            title="Expandir reproductor"
          >
            <ChevronDown aria-hidden="true" />
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            className="cassette-collapse-trigger"
            onClick={() => setIsCollapsed(true)}
            aria-label="Minimizar reproductor"
            aria-expanded={true}
            title="Minimizar reproductor"
          >
            <ChevronUp aria-hidden="true" />
          </button>
      {/* Cassette Mechanical Body */}
      <div className="cassette-deck">
        {/* Left Reel */}
        <div className={`cassette-spool left ${isPlaying ? "is-spinning" : ""}`}>
          <Disc3 className="w-5 h-5 text-copper" />
        </div>

        {/* Center LCD & Tape Window */}
        <div className="cassette-center-screen">
          <button
            type="button"
            className="cassette-lcd cassette-track-select"
            onClick={restartCurrentTrack}
            disabled={!currentTrack}
            aria-label={`Reiniciar ${currentTrack?.title || "pista actual"} desde el inicio`}
            title="Volver a reproducir desde el inicio"
          >
            <span className="track-title-ticker">{currentTrack?.title || "Sin pista"}</span>
            <span className="track-artist-sub">{currentTrack?.artist || ""}</span>
          </button>

          <div className="cassette-eq-bars" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, i) => (
              <span
                key={i}
                className={`eq-bar ${isPlaying && !isMuted ? "is-animated" : ""}`}
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Right Reel */}
        <div className={`cassette-spool right ${isPlaying ? "is-spinning" : ""}`}>
          <Disc3 className="w-5 h-5 text-copper" />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="cassette-controls">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={prevTrack}
          disabled={!currentTrack || tracks.length < 2}
          aria-label="Pista anterior"
          className="cassette-btn"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={togglePlay}
          disabled={!currentTrack}
          aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
          className="cassette-play-btn"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={nextTrack}
          disabled={!currentTrack || tracks.length < 2}
          aria-label="Pista siguiente"
          className="cassette-btn"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={toggleMute}
          disabled={!currentTrack}
          aria-label={isMuted ? "Activar sonido" : "Silenciar"}
          className="cassette-btn"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-muted-foreground" /> : <Volume2 className="w-3.5 h-3.5 text-copper" />}
        </Button>
      </div>
        </>
      )}
      {!currentTrack ? (
        !isCollapsed && <p className="cassette-empty-message">No hay pistas disponibles</p>
      ) : currentTrack.source_type === "youtube" && youtubeEmbedActive ? (
        <div className={`cassette-youtube-player ${isCollapsed ? "is-hidden" : ""}`}>
          <iframe
            ref={youtubeContainerRef}
            key={getYouTubeId(currentTrack)}
            src={`https://www.youtube.com/embed/${getYouTubeId(currentTrack)}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&playsinline=1&controls=1&rel=0&autoplay=1`}
            title={`Reproduciendo ${currentTrack.title}`}
            allow="autoplay; encrypted-media; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      ) : null}
    </aside>
  );
}
