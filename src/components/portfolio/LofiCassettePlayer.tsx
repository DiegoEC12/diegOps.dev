import { useEffect, useRef, useState } from "react";
import { Disc3, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Track {
  id: string;
  title: string;
  artist: string;
  audio_url: string;
  duration?: string | null;
  is_active: boolean;
}

const defaultTracks: Track[] = [
  {
    id: "track-1",
    title: "noche_de_codigo.wav",
    artist: "Diego Yeferson Lo-Fi",
    audio_url: "",
    duration: "2:45",
    is_active: true,
  },
  {
    id: "track-2",
    title: "lluvia_sobre_terminal.mp3",
    artist: "Manga Chill Beats",
    audio_url: "",
    duration: "3:10",
    is_active: true,
  },
  {
    id: "track-3",
    title: "cafe_y_queries.wav",
    artist: "Syntax Echo",
    audio_url: "",
    duration: "2:20",
    is_active: true,
  },
];

const normalizeTrackUrl = (value?: string | null) => {
  if (!value) return value;
  return value
    .replace(/\.mp3\.mp3$/i, ".mp3")
    .replace(/\.wav\.wav$/i, ".wav")
    .replace(/\.aac\.aac$/i, ".aac")
    .replace(/\.ogg\.ogg$/i, ".ogg");
};

export function LofiCassettePlayer() {
  const [tracks, setTracks] = useState<Track[]>(defaultTracks);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthContextRef = useRef<AudioContext | null>(null);
  const synthGainRef = useRef<GainNode | null>(null);
  const synthOscillatorsRef = useRef<OscillatorNode[]>([]);

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
            }))
            .filter((track) => track.audio_url && !track.audio_url.startsWith("blob:") && track.audio_url.trim() !== "");

          setTracks(validTracks.length > 0 ? validTracks : []);
        }
      } catch {
        // Fallback to default
      }
    })();
  }, []);

  const currentTrack = tracks[currentIndex] || tracks[0];

  const stopSynth = () => {
    synthOscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        // Ignored
      }
    });
    synthOscillatorsRef.current = [];
    synthContextRef.current?.close();
    synthContextRef.current = null;
    synthGainRef.current = null;
  };

  const startSynth = () => {
    stopSynth();
    const AudioContextClass = window.AudioContext;
    const ctx = new AudioContextClass();
    const gain = ctx.createGain();
    const effectiveVol = isMuted ? 0 : volume * 0.04;
    gain.gain.value = effectiveVol;
    gain.connect(ctx.destination);

    // Warm lo-fi chord: A minor 7 / C major 7 pentatonic chords
    const chordFrequencies = [
      [110, 164.81, 220, 261.63], // Am7
      [130.81, 164.81, 196, 246.94], // Cmaj7
      [98, 146.83, 196, 220], // Gsus2
    ];
    const freqs = chordFrequencies[currentIndex % chordFrequencies.length];

    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      osc.start();
      synthOscillatorsRef.current.push(osc);
    });

    synthContextRef.current = ctx;
    synthGainRef.current = gain;
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current && currentTrack.audio_url) {
        audioRef.current.pause();
      } else {
        stopSynth();
      }
      setIsPlaying(false);
    } else {
      if (currentTrack?.audio_url) {
        if (!audioRef.current) {
          audioRef.current = new Audio(currentTrack.audio_url);
        } else {
          audioRef.current.src = currentTrack.audio_url;
        }
        audioRef.current.volume = isMuted ? 0 : volume;
        audioRef.current.play().catch(() => startSynth());
      } else {
        startSynth();
      }
      setIsPlaying(true);
    }
  };

  const nextTrack = () => {
    const next = (currentIndex + 1) % tracks.length;
    setCurrentIndex(next);
    if (isPlaying) {
      setTimeout(() => {
        if (tracks[next]?.audio_url) {
          if (audioRef.current) {
            audioRef.current.src = tracks[next].audio_url;
            audioRef.current.play().catch(() => startSynth());
          }
        } else {
          startSynth();
        }
      }, 50);
    }
  };

  const prevTrack = () => {
    const prev = (currentIndex - 1 + tracks.length) % tracks.length;
    setCurrentIndex(prev);
    if (isPlaying) {
      setTimeout(() => {
        if (tracks[prev]?.audio_url) {
          if (audioRef.current) {
            audioRef.current.src = tracks[prev].audio_url;
            audioRef.current.play().catch(() => startSynth());
          }
        } else {
          startSynth();
        }
      }, 50);
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (audioRef.current) {
      audioRef.current.volume = nextMute ? 0 : volume;
    }
    if (synthGainRef.current) {
      synthGainRef.current.gain.value = nextMute ? 0 : volume * 0.04;
    }
  };

  useEffect(() => {
    return () => {
      stopSynth();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <aside className="lofi-cassette-widget" aria-label="Reproductor Cassette Lo-Fi">
      {/* Cassette Mechanical Body */}
      <div className="cassette-deck">
        {/* Left Reel */}
        <div className={`cassette-spool left ${isPlaying ? "is-spinning" : ""}`}>
          <Disc3 className="w-5 h-5 text-copper" />
        </div>

        {/* Center LCD & Tape Window */}
        <div className="cassette-center-screen">
          <div className="cassette-lcd">
            <span className="track-title-ticker">{currentTrack?.title}</span>
            <span className="track-artist-sub">{currentTrack?.artist}</span>
          </div>

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
          aria-label={isMuted ? "Activar sonido" : "Silenciar"}
          className="cassette-btn"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-muted-foreground" /> : <Volume2 className="w-3.5 h-3.5 text-copper" />}
        </Button>
      </div>
    </aside>
  );
}
