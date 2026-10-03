import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUpRight,
  Braces,
  ChevronRight,
  Code2,
  Database,
  Github,
  Mail,
  Menu,
  ServerCog,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/diego-hero.jpg";
import heroVideo from "@/assets/diego-hero.mp4";
import logo1 from "@/assets/logo1.png";
import { supabase } from "@/integrations/supabase/client";
import type { Database as Db } from "@/integrations/supabase/types";
import { CertificationsSection } from "./CertificationsSection";
import { LofiCassettePlayer } from "./LofiCassettePlayer";
import { MangaContactForm } from "./MangaContactForm";
import { SqlConsoleFaq } from "./SqlConsoleFaq";
import { StudioFooter } from "./StudioFooter";
import { TechnicalTimeline } from "./TechnicalTimeline";

type Project = Db["public"]["Tables"]["projects"]["Row"];
type SiteSettings = Db["public"]["Tables"]["site_settings"]["Row"];

const defaultSiteSettings: SiteSettings = {
  id: "general_config",
  brand_name: "Diego Yeferson EC",
  hero_title: "Diego Yeferson EC",
  hero_role: "Técnico en desarrollo de sistemas e información",
  hero_copy:
    "Construyo soluciones digitales útiles, mantenibles y bien pensadas. Actualmente curso Ingeniería de Software en la UTP.",
  availability_status: "Disponible para nuevos retos y proyectos",
  email_contact: "tu-correo@ejemplo.com",
  github_url: "https://github.com/",
  linkedin_url: "https://linkedin.com/",
  location: "Lima, Perú",
  logo_url: null,
  logo_fit: "contain",
  logo_position: "50% 50%",
  footer_tagline: "Diseñado entre café, código y lluvia.",
  updated_at: new Date().toISOString(),
};

const stackGroups = [
  { icon: Braces, title: "Backend & Lenguajes", items: ["PHP", "TypeScript", "JavaScript", "Python"] },
  { icon: Database, title: "Bases de Datos", items: ["PostgreSQL", "MySQL", "SQL Server", "Supabase"] },
  { icon: Code2, title: "Frontend", items: ["React", "HTML5", "CSS3 / Vanilla", "TypeScript", "Vite"] },
  { icon: ServerCog, title: "DevOps & Entorno", items: ["Docker", "Git", "GitHub", "Linux / CLI"] },
];

export function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState("Todos");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    void (async () => {
      const { data: projData } = await supabase
        .from("projects")
        .select("*")
        .eq("published", true)
        .order("sort_order");
      setProjects(projData ?? []);

      const { data: settData } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", "general_config")
        .maybeSingle();

      if (settData) {
        setSiteSettings({ ...defaultSiteSettings, ...settData });
      }
    })();
  }, []);

  const filters = useMemo(
    () => ["Todos", ...Array.from(new Set(projects.flatMap((p) => [p.category, ...(p.technologies || [])])))],
    [projects]
  );

  const visibleProjects =
    filter === "Todos"
      ? projects
      : projects.filter((p) => p.category === filter || (p.technologies || []).includes(filter));

  return (
    <main className="portfolio-shell">
      {/* Site Header */}
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <a href="#inicio" className="wordmark" aria-label="Ir al inicio">
          <img
            src={siteSettings.logo_url || logo1}
            alt="Logo Diego Yeferson"
            className="wordmark-logo"
            width={38}
            height={38}
            style={{
              objectFit: (siteSettings.logo_fit as "cover" | "contain") || "contain",
              objectPosition: siteSettings.logo_position || "50% 50%",
            }}
          />
          <span>{siteSettings.brand_name}</span>
        </a>

        <nav className={mobileOpen ? "site-nav is-open" : "site-nav"} aria-label="Navegación principal">
          <a href="#proyectos" onClick={() => setMobileOpen(false)}>
            Proyectos
          </a>
          <a href="#stack" onClick={() => setMobileOpen(false)}>
            Stack
          </a>
          <a href="#expediente" onClick={() => setMobileOpen(false)}>
            Expediente
          </a>
          <a href="#certificaciones" onClick={() => setMobileOpen(false)}>
            Certificaciones
          </a>
          <a href="#faq" onClick={() => setMobileOpen(false)}>
            SQL FAQ
          </a>
          <a href="#contacto" onClick={() => setMobileOpen(false)}>
            Contacto
          </a>
          <Link to="/admin">Admin</Link>
        </nav>

        <Button
          className="menu-button"
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Abrir menú"
        >
          {mobileOpen ? <X /> : <Menu />}
        </Button>
      </header>

      {/* Hero Section */}
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
        <div className="hero-content">
          <p className="hero-status">
            <span className="status-dot-pulse" /> {siteSettings.availability_status}
          </p>
          <h1>{siteSettings.hero_title.split(" ").slice(0, 2).join(" ") || siteSettings.brand_name}</h1>
          <p className="hero-role">{siteSettings.hero_role}</p>
          <p className="hero-copy">{siteSettings.hero_copy}</p>
          <div className="hero-actions">
            <Button asChild size="lg">
              <a href="#proyectos">
                Explorar proyectos <ChevronRight />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/diego-yeferson-cv.txt" download>
                Descargar CV <ArrowDown />
              </a>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <a href="#contacto">
                Contacto <Mail />
              </a>
            </Button>
          </div>
        </div>
        <div className="hero-index" aria-hidden="true">
          01 / 06
        </div>
      </section>

      {/* Proyectos Section */}
      <section id="proyectos" className="projects-section section-band">
        <div className="section-heading split-heading">
          <div>
            <p className="kicker">Archivo de trabajo</p>
            <h2>Proyectos que resuelven.</h2>
          </div>
          <p>
            Del problema inicial a una solución desplegable: decisiones técnicas documentadas, encuadre dinámico y resultados verificables.
          </p>
        </div>

        <div className="filter-row" aria-label="Filtrar proyectos">
          {filters.map((item) => (
            <Button
              key={item}
              variant={filter === item ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(item)}
            >
              {item}
            </Button>
          ))}
        </div>

        {visibleProjects.length === 0 ? (
          <div className="empty-state-card">
            <p className="kicker">Sin proyectos publicados</p>
            <h3>Aún no hay contenido en la base de datos.</h3>
            <p>Inicia sesión en admin y crea la primera ficha para que aparezca en el portfolio.</p>
          </div>
        ) : (
          <div className="project-grid">
            {visibleProjects.map((project, index) => (
              <article className="project-panel" key={project.id}>
                <div className="panel-number">{String(index + 1).padStart(2, "0")}</div>
                {project.image_url && (
                  <img
                    src={project.image_url}
                    alt={project.title}
                    loading="lazy"
                    style={{
                      objectFit: (project.image_fit as "cover" | "contain") || "cover",
                      objectPosition: project.image_position || "50% 50%",
                    }}
                  />
                )}
                <div className="panel-body">
                  <span className="project-category">{project.category}</span>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <div className="problem-note">
                    <strong>Problema</strong>
                    {project.problem}
                  </div>
                  <div className="badge-row">
                    {project.technologies.map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                  <div className="project-links">
                    {project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noreferrer">
                        <Github /> Código
                      </a>
                    )}
                    {project.demo_url && (
                      <a href={project.demo_url} target="_blank" rel="noreferrer">
                        Ver demo <ArrowUpRight />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Stack Blueprint Section */}
      <section id="stack" className="stack-section section-band">
        <div className="blueprint-grid" aria-hidden="true" />
        <div className="section-heading">
          <p className="kicker">Blueprint técnico</p>
          <h2>Capas de mi stack.</h2>
        </div>
        <div className="stack-grid">
          {stackGroups.map(({ icon: Icon, title, items }) => (
            <article key={title} className="stack-layer">
              <div className="stack-title">
                <Icon />
                <h3>{title}</h3>
              </div>
              <div>
                {items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="education-strip">
          <span>Formación actual</span>
          <strong>Ingeniería de Software · UTP</strong>
          <em>1er ciclo (2026 - Presente)</em>
        </div>
      </section>

      {/* Expediente Técnico (Timeline) */}
      <TechnicalTimeline />

      {/* Certificaciones y Credenciales */}
      <CertificationsSection />

      {/* Consola SQL & FAQ Interactiva */}
      <SqlConsoleFaq />

      {/* Hoja de Contacto Manuscrita */}
      <MangaContactForm
        emailContact={siteSettings.email_contact}
        githubUrl={siteSettings.github_url}
        linkedinUrl={siteSettings.linkedin_url}
      />

      {/* Footer de Estudio Manga Ampliado */}
      <StudioFooter
        brandName={siteSettings.brand_name}
        logoUrl={siteSettings.logo_url || "/favicon.png"}
        footerTagline={siteSettings.footer_tagline}
        location={siteSettings.location}
      />

      {/* Reproductor Cassette Lo-Fi */}
      <LofiCassettePlayer />
    </main>
  );
}
