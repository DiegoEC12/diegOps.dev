import { useEffect, useState } from "react";
import { Award, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  issued_date: string;
  credential_url: string | null;
  credential_id: string | null;
  hours: number | null;
  badge_url: string | null;
  image_fit: string;
  image_position: string;
  sort_order: number;
  published: boolean;
}

const defaultCerts: CertificationItem[] = [
  {
    id: "cert-1",
    title: "Administración y Modelado de Bases de Datos Relacionales",
    issuer: "Oracle Academy / Certificación Técnica",
    issued_date: "2024",
    credential_url: "https://certificados.ejemplo.com/db-modeling",
    credential_id: "ORA-DB-98421",
    hours: 120,
    badge_url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80",
    image_fit: "cover",
    image_position: "50% 50%",
    sort_order: 1,
    published: true,
  },
  {
    id: "cert-2",
    title: "Desarrollo Backend y Arquitectura REST con TypeScript & Node",
    issuer: "Platzi / Escuela de Desarrollo Web",
    issued_date: "2024",
    credential_url: "https://certificados.ejemplo.com/backend-ts",
    credential_id: "PLTZ-TS-4410",
    hours: 80,
    badge_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
    image_fit: "cover",
    image_position: "50% 50%",
    sort_order: 2,
    published: true,
  },
  {
    id: "cert-3",
    title: "Docker Essentials & Contenedores para Desarrolladores",
    issuer: "Linux Foundation / Open Source Training",
    issued_date: "2025",
    credential_url: "https://certificados.ejemplo.com/docker",
    credential_id: "LF-DK-2025-01",
    hours: 45,
    badge_url: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=600&auto=format&fit=crop&q=80",
    image_fit: "cover",
    image_position: "50% 50%",
    sort_order: 3,
    published: true,
  },
];

export function CertificationsSection() {
  const [certs, setCerts] = useState<CertificationItem[]>(defaultCerts);

  useEffect(() => {
    void (async () => {
      try {
        const { data, error } = await supabase
          .from("certifications")
          .select("*")
          .eq("published", true)
          .order("sort_order");

        if (!error && data && data.length > 0) {
          setCerts(data as CertificationItem[]);
        }
      } catch {
        // Fallback to default
      }
    })();
  }, []);

  return (
    <section id="certificaciones" className="certifications-section section-band">
      <div className="section-heading split-heading">
        <div>
          <p className="kicker">Credenciales Verificables</p>
          <h2>Certificaciones y especializaciones.</h2>
        </div>
        <p>
          Constancias académicas y técnicas con horas acreditadas y enlaces de validación directa.
        </p>
      </div>

      <div className="certs-grid">
        {certs.map((cert) => (
          <article key={cert.id} className="cert-card">
            {cert.badge_url && (
              <div className="cert-media-wrap aspect-[4/3]">
                <img
                  src={cert.badge_url}
                  alt={cert.title}
                  loading="lazy"
                  className="cert-img"
                  style={{
                    objectFit: (cert.image_fit as "cover" | "contain") || "cover",
                    objectPosition: cert.image_position || "50% 50%",
                  }}
                />
                <div className="cert-media-overlay" />
                <span className="cert-hours-badge">
                  <Clock className="w-3 h-3 inline mr-1 text-copper" />
                  {cert.hours ? `${cert.hours} hrs académicas` : "Acreditado"}
                </span>
              </div>
            )}

            <div className="cert-body">
              <div className="cert-header">
                <span className="cert-issuer">
                  <Award className="w-3.5 h-3.5 inline mr-1 text-copper" />
                  {cert.issuer}
                </span>
                <span className="cert-date">{cert.issued_date}</span>
              </div>

              <h3 className="cert-title">{cert.title}</h3>

              {cert.credential_id && (
                <div className="cert-id-tag">
                  ID: <code>{cert.credential_id}</code>
                </div>
              )}

              {cert.credential_url && (
                <div className="cert-action">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <a href={cert.credential_url} target="_blank" rel="noopener noreferrer">
                      Verificar credencial <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
