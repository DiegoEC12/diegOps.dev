# 🛠️ Diagnóstico y Soluciones UI/UX

Este documento detalla los problemas de desbordamiento y comportamiento *responsive* identificados en el repositorio, junto con el código corregido e instrucciones paso a paso para su implementación.

---

## 🔍 1. Diagnóstico de Problemas

### 🎵 Bug 1: Desbordamiento en el Reproductor (`LofiCassettePlayer.tsx` / `styles.css`)

| Aspecto | Detalles |
| :--- | :--- |
| **Ubicación** | `src/components/portfolio/LofiCassettePlayer.tsx` & `src/styles.css` (líneas ~2740 y ~3020) |
| **Causa Raíz** | Se renombró la clase CSS de `.lofi-player` a `.lofi-cassette-widget` con `max-width: 440px; left: 20px;`. Sin embargo, en la *media query* para móviles (`@media (max-width: 640px)`), permaneció la regla antigua apuntando a `.lofi-player`. |
| **Impacto** | En pantallas estrechas (360px – 390px), el reproductor se desborda entre 50px y 80px hacia la derecha sin ajustar su ancho. |
| **Falta de Ergonomía** | No existe un estado de colapso ni botón de minimizar, manteniendo un panel fijo de ~420px de ancho cubriendo pantalla constantemente. |

---

### 📑 Bug 2: Colapso del Aside en Admin (`AdminPage.tsx` / `styles.css`)

| Aspecto | Detalles |
| :--- | :--- |
| **Ubicación** | `src/pages/AdminPage.tsx` & `src/styles.css` (líneas 2928–2933) |
| **Causa Raíz** | El admin incorporó 7 pestañas (*Contenido General, Proyectos, Expediente, Certificaciones, Música, FAQ, Mensajes*) más las acciones *Ver Portfolio* y *Cerrar sesión*. La regla CSS en tabletas (`@media (max-width: 900px)`) forzaba `.admin-sidebar { flex-direction: row; }` y `.admin-sidebar nav { display: flex; }`. |
| **Impacto** | Intentar renderizar 8+ elementos en una sola fila causa un empaquetado caótico de 3 niveles o desbordamiento horizontal que bloquea formularios y tablas de edición. |

---

## 💡 2. Soluciones Propuestas

```
┌─────────────────────────────────────────────────────────────────────────┐
│ RESUMEN DE CAMBIOS                                                      │
├────────────────────────┬────────────────────────────────────────────────┤
│ LofiCassettePlayer.tsx │ • Detección automática de viewport (< 768px)   │
│                        │ • Estado colapsado (Badge 48x48px con ondas)    │
│                        │ • Botón toggle [▾] sin interrupción de audio    │
├────────────────────────┼────────────────────────────────────────────────┤
│ src/styles.css         │ • Selector corregido .lofi-cassette-widget      │
│                        │ • Scrollable horizontal tabs para el Admin      │
└────────────────────────┴────────────────────────────────────────────────┘
```

---

## 💻 3. Código Modificado

### 📌 Solución 1: Componente `LofiCassettePlayer.tsx`

Reemplaza todo el contenido de `src/components/portfolio/LofiCassettePlayer.tsx`:

```tsx
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Disc3,
  Music2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
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
  
  // Estado para colapsar en cuadrado flotante o expandir
  const [isCollapsed, setIsCollapsed] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthContextRef = useRef<AudioContext | null>(null);
  const synthGainRef = useRef<GainNode | null>(null);
  const synthOscillatorsRef = useRef<OscillatorNode[]>([]);

  // En pantallas móviles / tablets arranca colapsado por ergonomía
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsCollapsed(true);
    }
  }, []);

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
            .filter(
              (track) =>
                track.audio_url &&
                !track.audio_url.startsWith("blob:") &&
                track.audio_url.trim() !== ""
            );
          setTracks(validTracks.length > 0 ? validTracks : defaultTracks);
        }
      } catch {
        // Fallback a pistas por defecto
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

    const chordFrequencies = [
      [110, 164.81, 220, 261.63],
      [130.81, 164.81, 196, 246.94],
      [98, 146.83, 196, 220],
    ];
    const freqs = chordFrequencies[currentIndex % chordFrequencies.length];

    const oscs = freqs.map((f) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      o.connect(gain);
      o.start();
      return o;
    });

    synthOscillatorsRef.current = oscs;
    synthContextRef.current = ctx;
    synthGainRef.current = gain;
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      stopSynth();
      setIsPlaying(false);
    } else {
      if (currentTrack?.audio_url) {
        if (!audioRef.current) {
          audioRef.current = new Audio(currentTrack.audio_url);
          audioRef.current.volume = isMuted ? 0 : volume;
          audioRef.current.onended = () => nextTrack();
        } else {
          audioRef.current.src = currentTrack.audio_url;
        }
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            startSynth();
            setIsPlaying(true);
          });
      } else {
        startSynth();
        setIsPlaying(true);
      }
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
    <aside
      className={`lofi-cassette-widget ${
        isCollapsed ? "is-collapsed" : "is-expanded"
      }`}
      aria-label="Reproductor Cassette Lo-Fi"
    >
      {/* VISTA COLAPSADA: Mini cuadrado con ondas animadas */}
      {isCollapsed ? (
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="cassette-collapsed-badge"
          title="Abrir reproductor (Clic para expandir)"
          aria-label="Abrir reproductor de música"
        >
          <div className="collapsed-sound-waves" aria-hidden="true">
            <span className={`wave-bar ${isPlaying ? "is-animated" : ""}`} />
            <span className={`wave-bar ${isPlaying ? "is-animated" : ""}`} />
            <span className={`wave-bar ${isPlaying ? "is-animated" : ""}`} />
            <span className={`wave-bar ${isPlaying ? "is-animated" : ""}`} />
          </div>
          <Music2 className="w-3.5 h-3.5 text-copper collapsed-icon" />
          {isPlaying && <span className="collapsed-pulse-dot" />}
        </button>
      ) : (
        /* VISTA EXPANDIDA: El dock extendido con botón de cierre */
        <div className="cassette-full-panel">
          {/* Botón de achicar en la esquina superior */}
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="cassette-collapse-trigger"
            title="Minimizar reproductor"
            aria-label="Minimizar reproductor"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {/* Cuerpo mecánico del Cassette */}
          <div className="cassette-deck">
            {/* Carrete izquierdo */}
            <div className={`cassette-spool left ${isPlaying ? "is-spinning" : ""}`}>
              <Disc3 className="w-5 h-5 text-copper" />
            </div>

            {/* Pantalla LCD Central */}
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

            {/* Carrete derecho */}
            <div className={`cassette-spool right ${isPlaying ? "is-spinning" : ""}`}>
              <Disc3 className="w-5 h-5 text-copper" />
            </div>
          </div>

          {/* Botones de Control */}
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
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
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
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-copper" />
              )}
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
```

---

### 🎨 Solución 2: Estilos CSS (`src/styles.css`)

Agrega o reemplaza los siguientes bloques en `src/styles.css`:

#### A. Reproductor Cassette (*Responsive & Dual-State*)

```css
/* ==========================================================================
   LOFI CASSETTE WIDGET (RESPONSIVE & DUAL-STATE)
   ========================================================================== */

.lofi-cassette-widget {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 50;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
}

/* 1. MODO COLAPSADO: Cuadrado estilo manga con ondas sonoras */
.cassette-collapsed-badge {
  width: 50px;
  height: 50px;
  background: var(--night);
  border: 2px solid var(--ink);
  box-shadow: 4px 4px 0 var(--copper);
  display: flex;
  flex-direction: column;  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  position: relative;
  padding: 0;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.cassette-collapsed-badge:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--copper);
}

.collapsed-sound-waves {
  display: flex;
  align-items: flex-end;
  gap: 2.5px;
  height: 16px;
}

.wave-bar {
  width: 3px;
  height: 4px;
  background: var(--copper);
  border-radius: 1px;
  transition: height 0.2s ease, background-color 0.2s ease;
}

.wave-bar.is-animated {
  background: var(--terminal, #4ade80);
  animation: wave-bounce 0.7s infinite alternate ease-in-out;
}

.wave-bar.is-animated:nth-child(2) { animation-delay: 0.15s; }
.wave-bar.is-animated:nth-child(3) { animation-delay: 0.3s; }
.wave-bar.is-animated:nth-child(4) { animation-delay: 0.45s; }

@keyframes wave-bounce {
  0% { height: 3px; }
  100% { height: 16px; }
}

.collapsed-pulse-dot {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--terminal, #4ade80);
  box-shadow: 0 0 6px var(--terminal, #4ade80);
}

/* 2. MODO EXPANDIDO: Panel completo */
.cassette-full-panel {
  position: relative;
  background: var(--night);
  color: var(--primary-foreground);
  border: 2px solid var(--ink);
  box-shadow: 5px 5px 0 var(--copper);
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 440px;
}

/* Botón para minimizar */
.cassette-collapse-trigger {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 22px;
  height: 22px;
  background: var(--paper);
  color: var(--ink);
  border: 2px solid var(--ink);
  box-shadow: 2px 2px 0 var(--copper);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  border-radius: 2px;
}

.cassette-collapse-trigger:hover {
  background: var(--copper);
  color: #fff;
}

/* 3. MEDIA QUERY PARA MÓVILES (< 640px) */
@media (max-width: 640px) {
  .lofi-cassette-widget.is-expanded {
    left: 12px;
    right: 12px;
    bottom: 14px;
    width: calc(100vw - 24px);
    max-width: calc(100vw - 24px);
  }

  .cassette-full-panel {
    width: 100%;
    max-width: 100%;
    padding: 8px 10px;
    gap: 8px;
  }

  .cassette-lcd {
    min-width: 0;
    max-width: 120px;
  }

  /* Oculta carrete izquierdo en pantallas reducidas para dar espacio a controles */
  .cassette-spool.left {
    display: none;
  }
}
```

---

#### B. Layout del Panel Admin (`.admin-page` y `.admin-sidebar`)

```css
/* ==========================================================================
   ADMIN LAYOUT & RESPONSIVE ASIDE
   ========================================================================== */

.admin-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 240px 1fr;
  background: var(--paper);
}

.admin-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  color: var(--primary-foreground);
  background: var(--night);
  border-right: 2px solid var(--ink);
  overflow-y: auto;
}

/* EN TABLETS Y MÓVILES (< 1024px):
   Pasa de columna fija a barra superior con pestañas deslizables (Scrollable Tabs) */
@media (max-width: 1024px) {
  .admin-page {
    display: flex;
    flex-direction: column;
  }

  .admin-sidebar {
    position: sticky;
    top: 0;
    height: auto;
    width: 100%;
    z-index: 40;
    padding: 12px 16px;
    border-right: none;
    border-bottom: 2px solid var(--ink);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  }

  /* Header del admin en una fila */
  .admin-sidebar .wordmark {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 10px;
  }

  /* Carrusel horizontal táctil con las pestañas */
  .admin-sidebar nav {
    display: flex;
    flex-direction: row;
    gap: 8px;
    margin: 0;
    width: 100%;
    overflow-x: auto;
    padding-bottom: 4px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Oculta scrollbar en Firefox */
  }

  .admin-sidebar nav::-webkit-scrollbar {
    display: none; /* Oculta scrollbar en WebKit */
  }

  .admin-tab-button {
    flex: 0 0 auto;
    white-space: nowrap;
    padding: 8px 14px;
    font-size: 12px;
  }

  /* Ubicación del botón de cerrar sesión en la barra superior */
  .admin-sidebar > button.mt-auto {
    position: absolute;
    top: 10px;    right: 16px;
    margin: 0;
    padding: 6px 10px;
    font-size: 12px;
  }

  .admin-content {
    padding: 24px 16px 80px;
  }
}
```

---

## 🚀 4. Resultado Final Obtenido

1. **Cero Desbordamientos Lateral**: El widget del reproductor no sobrepasa el ancho de pantalla en dispositivos de 360px–390px.
2. **Uso Eficiente del Espacio Mobile**: En móviles/tablets el reproductor inicia como un badge flotante de `50x50px` con animación ecualizadora activa sin pausar la música.
3. **Navegación Admin Fluncionante**: Las 7 pestañas se transforman en una barra de chips horizontal táctil con *smooth scrolling*, evitando superposición de elementos con los formularios de edición.