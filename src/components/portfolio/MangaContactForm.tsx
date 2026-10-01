import { useState } from "react";
import { Check, Clipboard, Github, Linkedin, Mail, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface MangaContactFormProps {
  emailContact?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
}

export function MangaContactForm({
  emailContact = "tu-correo@ejemplo.com",
  githubUrl = "https://github.com/",
  linkedinUrl = "https://linkedin.com/",
}: MangaContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg("Por favor completa los campos obligatorios.");
      return;
    }

    setSending(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.from("contact_messages").insert({
        sender_name: name.trim(),
        sender_email: email.trim(),
        subject: subject.trim() || null,
        message: message.trim(),
      });

      if (error) {
        setErrorMsg(`Error al enviar: ${error.message}`);
      } else {
        setSentSuccess(true);
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error inesperado al enviar el mensaje.");
    } finally {
      setSending(false);
    }
  };

  const copyEmail = async () => {
    if (!emailContact) return;
    await navigator.clipboard.writeText(emailContact);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contacto" className="manga-contact-section section-band">
      <div className="section-heading split-heading">
        <div>
          <p className="kicker">Manga Manuscript & Direct Desk</p>
          <h2>Hoja de contacto y canal directo.</h2>
        </div>
        <p>
          Déjame una nota directa sobre una vacante, colaboración técnica o consulta de proyecto. La leo y respondo personalmente.
        </p>
      </div>

      <div className="manga-sheet-wrapper">
        {/* Visual Manuscript Sheet */}
        <div className="manga-sheet-frame">
          <div className="manuscript-header-info">
            <span className="manuscript-tag">HOJA DE REGISTRO // DESPACHO DIEG_OPS</span>
            <span className="manuscript-stamp">NO. 0042 / LIMA</span>
          </div>

          <div className="sheet-inner-border">
            {sentSuccess ? (
              <div className="contact-success-box">
                <div className="success-icon-hanko">
                  <Check className="w-8 h-8 text-terminal" />
                </div>
                <h3>¡Mensaje entregado al despacho!</h3>
                <p>
                  Tu comunicación ha quedado registrada en la bandeja del sistema. Te responderé al correo en breve.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSentSuccess(false)}
                  className="mt-4"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Enviar otro mensaje
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="manga-contact-form">
                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="contact-name">
                      Remitente / Nombre <span className="text-copper">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      placeholder="Tu nombre o empresa"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="manga-input"
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="contact-email">
                      Correo Electrónico <span className="text-copper">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      placeholder="ejemplo@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="manga-input"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="contact-subject">Asunto / Contexto</label>
                  <input
                    id="contact-subject"
                    type="text"
                    placeholder="Propuesta laboral / Prácticas / Proyecto"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="manga-input"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="contact-message">
                    Mensaje / Consulta Técnica <span className="text-copper">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    placeholder="Describe los detalles de la posición o propuesta..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="manga-input"
                  />
                </div>

                {errorMsg && <p className="contact-error-msg">{errorMsg}</p>}

                <div className="form-submit-row">
                  <Button type="submit" size="lg" disabled={sending} className="submit-manuscript-btn">
                    {sending ? (
                      <>Enviando nota…</>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" /> Entregar Nota de Contacto
                      </>
                    )}
                  </Button>

                  <div className="quick-contact-actions">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyEmail}
                      title="Copiar correo"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-green-600" /> Copiado
                        </>
                      ) : (
                        <>
                          <Clipboard className="w-3.5 h-3.5 mr-1" /> Copiar Correo
                        </>
                      )}
                    </Button>

                    {linkedinUrl && (
                      <Button asChild variant="outline" size="sm">
                        <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="w-3.5 h-3.5 mr-1" /> LinkedIn
                        </a>
                      </Button>
                    )}

                    {githubUrl && (
                      <Button asChild variant="outline" size="sm">
                        <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="w-3.5 h-3.5 mr-1" /> GitHub
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
