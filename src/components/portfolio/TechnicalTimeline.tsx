import { useEffect, useState } from "react";
import { BookOpen, Briefcase, Calendar, CheckCircle2, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TimelineItem {
  id: string;
  kind: "education" | "experience";
  title: string;
  institution: string;
  period: string;
  status: string;
  description: string;
  skills_learned: string[];
  sort_order: number;
}

const defaultTimeline: TimelineItem[] = [
  {
    id: "edu-1",
    kind: "education",
    title: "Ingeniería de Software",
    institution: "Universidad Tecnológica del Perú (UTP)",
    period: "2026 - Presente",
    status: "En curso (1er ciclo)",
    description:
      "Formación profesional orientada a algoritmia profunda, arquitectura de sistemas distribuidos, patrones de diseño empresarial y ciclo de vida de software de alta disponibilidad.",
    skills_learned: ["Arquitectura de Software", "Estructuras de Datos", "POO Avanzada", "Algoritmos"],
    sort_order: 1,
  },
  {
    id: "edu-2",
    kind: "education",
    title: "Técnico en Desarrollo de Sistemas e Información",
    institution: "Instituto de Educación Superior",
    period: "2023 - 2025",
    status: "Titulado / Egresado",
    description:
      "Especialización técnica intensiva con enfoque práctico en bases de datos relacionales (PostgreSQL, MySQL, SQL Server), desarrollo backend en PHP y TypeScript, servicios RESTful y despliegues con Docker.",
    skills_learned: ["PostgreSQL", "MySQL", "PHP", "TypeScript", "JavaScript", "Docker", "Git"],
    sort_order: 2,
  },
];

export function TechnicalTimeline() {
  const [entries, setEntries] = useState<TimelineItem[]>(defaultTimeline);

  useEffect(() => {
    void (async () => {
      try {
        const { data, error } = await supabase
          .from("timeline_entries")
          .select("*")
          .order("sort_order", { ascending: true });

        if (!error && data && data.length > 0) {
          setEntries(data as TimelineItem[]);
        }
      } catch {
        // Fallback to default
      }
    })();
  }, []);

  return (
    <section id="expediente" className="timeline-section section-band">
      <div className="section-heading split-heading">
        <div>
          <p className="kicker">Expediente Técnico</p>
          <h2>Trayectoria académica y profesional.</h2>
        </div>
        <p>
          Formación dual: La rapidez y destreza práctica del grado técnico combinada con la visión analítica y arquitectónica de la ingeniería universitaria.
        </p>
      </div>

      <div className="timeline-manga-track">
        {entries.map((item, index) => {
          const isOngoing = item.status.toLowerCase().includes("curso") || item.period.toLowerCase().includes("presente");
          return (
            <article key={item.id} className="timeline-manga-entry">
              <div className="timeline-spine">
                <div className={`timeline-node ${isOngoing ? "is-pulse" : ""}`}>
                  {item.kind === "education" ? (
                    <GraduationCap className="w-4 h-4 text-copper" />
                  ) : (
                    <Briefcase className="w-4 h-4 text-copper" />
                  )}
                </div>
                {index < entries.length - 1 && <div className="timeline-line" />}
              </div>

              <div className="timeline-entry-content">
                <div className="timeline-card-header">
                  <div className="timeline-badge-group">
                    <span className="timeline-kind-tag">
                      {item.kind === "education" ? "Formación Académica" : "Experiencia Laboral"}
                    </span>
                    <span className={`timeline-status-pill ${isOngoing ? "is-ongoing" : "is-completed"}`}>
                      {isOngoing ? (
                        <span className="status-dot-pulse" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline text-green-600" />
                      )}
                      {item.status}
                    </span>
                  </div>
                  <div className="timeline-period">
                    <Calendar className="w-3.5 h-3.5 mr-1 inline text-muted-foreground" />
                    {item.period}
                  </div>
                </div>

                <h3 className="timeline-title">{item.title}</h3>
                <p className="timeline-institution">
                  <BookOpen className="w-3.5 h-3.5 mr-1 inline text-copper" />
                  {item.institution}
                </p>

                <p className="timeline-description">{item.description}</p>

                {item.skills_learned && item.skills_learned.length > 0 && (
                  <div className="timeline-skills">
                    <span className="skills-label">Competencias clave:</span>
                    <div className="badge-row">
                      {item.skills_learned.map((skill) => (
                        <span key={skill} className="skill-pill">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
