import { ArrowUpRight, Code, Heart, Sparkles, Terminal } from "lucide-react";

interface StudioFooterProps {
  brandName?: string;
  logoUrl?: string | null;
  footerTagline?: string | null;
  location?: string | null;
}

export function StudioFooter({
  brandName = "Diego Yeferson EC",
  logoUrl = "/favicon.png",
  footerTagline = "Diseñado entre café, código y lluvia.",
  location = "Lima, Perú",
}: StudioFooterProps) {
  return (
    <footer className="studio-footer-container">
      <div className="studio-footer-inner">
        {/* Zona 1: Autor y manifiesto */}
        <div className="footer-zone-author">
          <div className="footer-brand-lockup">
            <img className="footer-brand-logo" src={logoUrl || "/favicon.png"} alt="Logotipo Diego Yeferson" />
            <div>
              <h3 className="footer-author-name">{brandName}</h3>
              <p className="footer-author-role">Técnico en Sistemas & Estudiante Ing. de Software UTP</p>
            </div>
          </div>
          <p className="footer-tagline-text">
            “{footerTagline || "Diseñado entre café, código y lluvia."}”
          </p>
        </div>

        {/* Zona 2: Índice Técnico de Navegación */}
        <div className="footer-zone-nav">
          <p className="footer-nav-heading">Índice del Blueprint</p>
          <ul className="footer-nav-list">
            <li>
              <a href="#proyectos">
                <Code className="w-3.5 h-3.5 mr-1.5 inline text-copper" /> Archivo de Proyectos
              </a>
            </li>
            <li>
              <a href="#stack">
                <Terminal className="w-3.5 h-3.5 mr-1.5 inline text-copper" /> Stack Tecnológico
              </a>
            </li>
            <li>
              <a href="#expediente">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 inline text-copper" /> Expediente Técnico
              </a>
            </li>
            <li>
              <a href="#certificaciones">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 inline text-copper" /> Certificaciones
              </a>
            </li>
            <li>
              <a href="#faq">
                <Terminal className="w-3.5 h-3.5 mr-1.5 inline text-copper" /> Consola SQL & FAQ
              </a>
            </li>
            <li>
              <a href="#contacto">
                <Heart className="w-3.5 h-3.5 mr-1.5 inline text-copper" /> Hoja de Contacto
              </a>
            </li>
          </ul>
        </div>

        {/* Zona 3: Telemetría de Sistema & Scroll Top */}
        <div className="footer-zone-telemetry">
          <div className="telemetry-badge">
            <span className="status-dot-pulse" />
            <span>Sistema Operativo · {location || "Lima, Perú"}</span>
          </div>

          <p className="telemetry-note">
            Estética Manga Lo-Fi Chill · Imprenta editorial & Blueprint de ingeniería de software.
          </p>

          <a href="#inicio" className="footer-back-to-top">
            Volver al inicio <ArrowUpRight className="w-4 h-4 ml-1 inline" />
          </a>
        </div>
      </div>

      <div className="studio-footer-bottom">
        <p>© {new Date().getFullYear()} {brandName}. Construido con rigor técnico, café y tinta.</p>
        <p className="footer-engine-tag">PostgreSQL · Drizzle ORM · TanStack Start</p>
      </div>
    </footer>
  );
}
