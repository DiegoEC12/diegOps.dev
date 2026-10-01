import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowDown, ArrowUpRight, Braces, Check, ChevronRight, CirclePause,
  CirclePlay, Clipboard, Code2, Database, Github, Linkedin,
  Mail, Menu, ServerCog, Volume2, VolumeX, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/diego-hero.jpg";
import heroVideo from "@/assets/diego-hero.mp4";
import logo1 from "@/assets/logo1.png";
import { supabase } from "@/integrations/supabase/client";
import type { Database as Db } from "@/integrations/supabase/types";

type Project = Db["public"]["Tables"]["projects"]["Row"];

const fallbackProjects: Project[] = [
  { id: "1", title: "Gestor de inventario", slug: "gestor-inventario", summary: "Control de stock, movimientos y alertas en tiempo real para pequeños negocios.", problem: "Centraliza el inventario y reduce quiebres de stock.", category: "Full Stack", technologies: ["TypeScript", "PostgreSQL", "Docker"], github_url: "https://github.com", demo_url: null, image_url: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80", featured: true, published: true, sort_order: 1, created_at: "", updated_at: "" },
  { id: "2", title: "Mesa de ayuda TI", slug: "mesa-ayuda-ti", summary: "Sistema de tickets con prioridades, responsables e historial de atención.", problem: "Ordena solicitudes internas y acelera su resolución.", category: "Backend", technologies: ["PHP", "MySQL", "JavaScript"], github_url: "https://github.com", demo_url: null, image_url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80", featured: true, published: true, sort_order: 2, created_at: "", updated_at: "" },
  { id: "3", title: "Panel de métricas", slug: "metricas-academicas", summary: "Visualización clara del avance académico y rendimiento por curso.", problem: "Convierte datos complejos en decisiones comprensibles.", category: "Data", technologies: ["TypeScript", "SQL Server", "HTML"], github_url: "https://github.com", demo_url: null, image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80", featured: false, published: true, sort_order: 3, created_at: "", updated_at: "" },
];

const stackGroups = [
  { icon: Braces, title: "Backend & Lenguajes", items: ["PHP", "TypeScript", "JavaScript"] },
  { icon: Database, title: "Bases de Datos", items: ["PostgreSQL", "MySQL", "SQL Server"] },
  { icon: Code2, title: "Frontend", items: ["HTML", "CSS", "JavaScript", "TypeScript"] },
  { icon: ServerCog, title: "DevOps & Herramientas", items: ["Docker", "Git", "GitHub"] },
];

function LofiPlayer() {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const audioRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourcesRef = useRef<OscillatorNode[]>([]);

  const stopAudio = () => {
    sourcesRef.current.forEach((source) => source.stop());
    sourcesRef.current = [];
    audioRef.current?.close();
    audioRef.current = null;
    gainRef.current = null;
  };

  const togglePlay = () => {
    if (playing) {
      stopAudio();
      setPlaying(false);
      return;
    }
    const AudioContextClass = window.AudioContext;
    const context = new AudioContextClass();
    const gain = context.createGain();
    gain.gain.value = muted ? 0 : 0.025;
    gain.connect(context.destination);
    [110, 164.81, 220].forEach((frequency) => {
      const oscillator = context.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      oscillator.start();
      sourcesRef.current.push(oscillator);
    });
    audioRef.current = context;
    gainRef.current = gain;
    setPlaying(true);
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (gainRef.current) gainRef.current.gain.value = next ? 0 : 0.025;
  };

  useEffect(() => () => stopAudio(), []);

  return (
    <aside className="lofi-player" aria-label="Reproductor lo-fi">
      <Button size="icon" variant="ghost" onClick={togglePlay} aria-label={playing ? "Pausar ambiente" : "Reproducir ambiente"}>
        {playing ? <CirclePause /> : <CirclePlay />}
      </Button>
      <div className="lofi-track">
        <div><span>noche_de_codigo.wav</span><small>Lo-fi ambient</small></div>
        <div className={playing && !muted ? "equalizer is-playing" : "equalizer"} aria-hidden="true">
          {Array.from({ length: 8 }).map((_, index) => <i key={index} style={{ animationDelay: `${index * 90}ms` }} />)}
        </div>
      </div>
      <Button size="icon" variant="ghost" onClick={toggleMute} aria-label={muted ? "Activar sonido" : "Silenciar"}>
        {muted ? <VolumeX /> : <Volume2 />}
      </Button>
    </aside>
  );
}

function TerminalContact() {
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<string[]>([
    "Portfolio CLI v1.0 — escribe help para ver los comandos.",
  ]);
  const [copied, setCopied] = useState(false);

  const execute = (raw: string) => {
    const command = raw.trim().toLowerCase();
    if (!command) return;
    if (command === "clear") { setLines([]); setInput(""); return; }
    const responses: Record<string, string> = {
      help: "Comandos: whoami · skills · projects · contact --send · clear",
      whoami: "Diego Yeferson EC — técnico en desarrollo de sistemas e información · estudiante de Ingeniería de Software, UTP.",
      skills: "PHP · TypeScript · JavaScript · PostgreSQL · MySQL · SQL Server · Docker · Git",
      projects: "3 proyectos publicados. Usa ‘Explorar proyectos’ para abrir el catálogo.",
      "contact --send": "Canal listo. Elige LinkedIn o GitHub para iniciar una conversación.",
    };
    setLines((current) => [...current, `diego@portfolio:~$ ${raw}`, responses[command] ?? `Comando no encontrado: ${command}. Prueba “help”.`]);
    setInput("");
  };

  const copyHandle = async () => {
    await navigator.clipboard.writeText("Diego Yeferson EC");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section id="contacto" className="terminal-section section-band">
      <div className="section-heading">
        <p className="kicker">Canal directo</p>
        <h2>Hablemos en lenguaje claro.</h2>
      </div>
      <div className="terminal-window">
        <div className="terminal-top"><span /><span /><span /><strong>diego@portfolio: ~</strong></div>
        <div className="terminal-output" aria-live="polite">
          {lines.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}
        </div>
        <form onSubmit={(event) => { event.preventDefault(); execute(input); }} className="terminal-input">
          <label htmlFor="command">diego@portfolio:~$</label>
          <input id="command" value={input} onChange={(event) => setInput(event.target.value)} autoComplete="off" spellCheck={false} placeholder="help" />
        </form>
        <div className="terminal-actions">
          <Button variant="outline" onClick={copyHandle}>{copied ? <Check /> : <Clipboard />}{copied ? "Copiado" : "Copiar nombre"}</Button>
          <Button asChild variant="outline"><a href="https://www.linkedin.com/search/results/all/?keywords=Diego%20Yeferson%20EC" target="_blank" rel="noreferrer"><Linkedin />LinkedIn</a></Button>
          <Button asChild variant="outline"><a href="https://github.com/search?q=Diego+Yeferson+EC&type=users" target="_blank" rel="noreferrer"><Github />GitHub</a></Button>
        </div>
      </div>
    </section>
  );
}

export function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>(fallbackProjects);
  const [filter, setFilter] = useState("Todos");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    void supabase.from("projects").select("*").eq("published", true).order("sort_order").then(({ data }) => {
      if (data?.length) setProjects(data);
    });
  }, []);

  const filters = useMemo(() => ["Todos", ...Array.from(new Set(projects.flatMap((project) => [project.category, ...project.technologies])))], [projects]);
  const visibleProjects = filter === "Todos" ? projects : projects.filter((project) => project.category === filter || project.technologies.includes(filter));

  return (
    <main className="portfolio-shell">
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <a href="#inicio" className="wordmark" aria-label="Ir al inicio">
          <img src={logo1} alt="Logo" className="wordmark-logo" width={38} height={38} /> Diego Yeferson EC</a>
        <nav className={mobileOpen ? "site-nav is-open" : "site-nav"} aria-label="Navegación principal">
          <a href="#proyectos" onClick={() => setMobileOpen(false)}>Proyectos</a>
          <a href="#stack" onClick={() => setMobileOpen(false)}>Stack</a>
          <a href="#contacto" onClick={() => setMobileOpen(false)}>Contacto</a>
          <Link to="/admin">Admin</Link>
        </nav>
        <Button className="menu-button" variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Abrir menú">{mobileOpen ? <X /> : <Menu />}</Button>
      </header>

      <section id="inicio" className="hero-section">
        <video
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
          poster={heroImage}
          className="hero-image"
        />
        {/* <div className="rain" aria-hidden="true" />*/}
        <div className="hero-content">
          <p className="hero-status"><span /> Disponible para nuevos retos</p>
          <h1>Diego<br />Yeferson EC</h1>
          <p className="hero-role">Técnico en desarrollo de sistemas e información</p>
          <p className="hero-copy">Construyo soluciones digitales útiles, mantenibles y bien pensadas. Actualmente curso Ingeniería de Software en la UTP.</p>
          <div className="hero-actions">
            <Button asChild size="lg"><a href="#proyectos">Explorar proyectos <ChevronRight /></a></Button>
            <Button asChild variant="outline" size="lg"><a href="/diego-yeferson-cv.txt" download>Descargar CV <ArrowDown /></a></Button>
            <Button asChild variant="ghost" size="lg"><a href="#contacto">Contacto <Mail /></a></Button>
          </div>
        </div>
        {/*<div className="coffee-steam" aria-hidden="true"><i /><i /><i /></div>*/}
        <div className="hero-index" aria-hidden="true">01 / 04</div>
      </section>

      <section id="proyectos" className="projects-section section-band">
        <div className="section-heading split-heading">
          <div><p className="kicker">Archivo de trabajo</p><h2>Proyectos que resuelven.</h2></div>
          <p>Del problema inicial a una solución desplegable: decisiones técnicas documentadas y resultados verificables.</p>
        </div>
        <div className="filter-row" aria-label="Filtrar proyectos">
          {filters.map((item) => <Button key={item} variant={filter === item ? "default" : "outline"} size="sm" onClick={() => setFilter(item)}>{item}</Button>)}
        </div>
        <div className="project-grid">
          {visibleProjects.map((project, index) => (
            <article className="project-panel" key={project.id}>
              <div className="panel-number">{String(index + 1).padStart(2, "0")}</div>
              {project.image_url && <img src={project.image_url} alt="" loading="lazy" />}
              <div className="panel-body">
                <span className="project-category">{project.category}</span>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <div className="problem-note"><strong>Problema</strong>{project.problem}</div>
                <div className="badge-row">{project.technologies.map((tech) => <span key={tech}>{tech}</span>)}</div>
                <div className="project-links">
                  {project.github_url && <a href={project.github_url} target="_blank" rel="noreferrer"><Github /> Código</a>}
                  {project.demo_url && <a href={project.demo_url} target="_blank" rel="noreferrer">Ver demo <ArrowUpRight /></a>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="stack" className="stack-section section-band">
        <div className="blueprint-grid" aria-hidden="true" />
        <div className="section-heading"><p className="kicker">Blueprint técnico</p><h2>Capas de mi stack.</h2></div>
        <div className="stack-grid">
          {stackGroups.map(({ icon: Icon, title, items }) => (
            <article key={title} className="stack-layer">
              <div className="stack-title"><Icon /><h3>{title}</h3></div>
              <div>{items.map((item) => <span key={item}>{item}</span>)}</div>
            </article>
          ))}
        </div>
        <div className="education-strip"><span>Formación actual</span><strong>Ingeniería de Software · UTP</strong><em>1er ciclo</em></div>
      </section>

      <TerminalContact />

      <footer className="site-footer">
        <div className="wordmark"><span>DY</span> Diego Yeferson EC</div>
        <p>Diseñado entre café, código y lluvia.</p>
        <a href="#inicio">Volver arriba <ArrowUpRight /></a>
      </footer>
      <LofiPlayer />
    </main>
  );
}
