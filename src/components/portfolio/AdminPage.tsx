import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Briefcase,
  Check,
  CheckCircle2,
  Disc3,
  ExternalLink,
  Eye,
  EyeOff,
  Github,
  GraduationCap,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  Linkedin,
  LogOut,
  Mail,
  MapPin,
  Move,
  Music,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Sliders,
  Sparkles,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { ImageDragFramer } from "./ImageDragFramer";

type Project = Database["public"]["Tables"]["projects"]["Row"];
type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];
type TimelineEntry = Database["public"]["Tables"]["timeline_entries"]["Row"];
type Certification = Database["public"]["Tables"]["certifications"]["Row"];
type MusicTrack = Database["public"]["Tables"]["music_tracks"]["Row"];
type FaqQuery = Database["public"]["Tables"]["faq_queries"]["Row"];
type ContactMessage = Database["public"]["Tables"]["contact_messages"]["Row"];

type AdminTab = "settings" | "projects" | "timeline" | "certifications" | "music" | "faq" | "messages";

const defaultSettings: SiteSettings = {
  id: "general_config",
  brand_initials: "DY",
  brand_name: "Diego Yeferson EC",
  hero_title: "Diego Yeferson EC",
  hero_role: "Técnico en desarrollo de sistemas e información",
  hero_copy: "Construyo soluciones digitales útiles, mantenibles y bien pensadas. Actualmente curso Ingeniería de Software en la UTP.",
  availability_status: "Disponible para nuevos retos y proyectos",
  email_contact: "tu-correo@ejemplo.com",
  github_url: "https://github.com/",
  linkedin_url: "https://linkedin.com/",
  location: "Lima, Perú",
  logo_url: "/favicon.png",
  logo_fit: "contain",
  logo_position: "50% 50%",
  footer_tagline: "Diseñado entre café, código y lluvia.",
  updated_at: new Date().toISOString(),
};

const emptyProjectForm = {
  title: "",
  slug: "",
  summary: "",
  problem: "",
  category: "Full Stack",
  technologies: "TypeScript, PostgreSQL",
  github_url: "",
  demo_url: "",
  image_url: "",
  image_fit: "cover" as "cover" | "contain",
  image_position: "50% 50%",
  featured: false,
  published: false,
  sort_order: 0,
};

const emptyTimelineForm = {
  kind: "education" as "education" | "experience",
  title: "",
  institution: "",
  period: "",
  status: "Completado",
  description: "",
  skills_learned: "",
  sort_order: 0,
};

const emptyCertForm = {
  title: "",
  issuer: "",
  issued_date: "",
  credential_url: "",
  credential_id: "",
  hours: 40,
  badge_url: "",
  image_fit: "cover" as "cover" | "contain",
  image_position: "50% 50%",
  sort_order: 0,
  published: true,
};

const emptyMusicForm = {
  title: "",
  artist: "Diego Yeferson Lo-Fi",
  source_type: "direct_url" as "upload" | "direct_url" | "youtube",
  audio_url: "",
  youtube_id: "",
  duration: "2:45",
  duration_seconds: 165,
  is_active: true,
  sort_order: 0,
};

const emptyFaqForm = {
  question_label: "",
  sql_command: "SELECT * FROM tabla;",
  result_columns: "col1, col2",
  result_rows_json: '[{"col1": "Valor 1", "col2": "Valor 2"}]',
  sort_order: 0,
};

export function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("settings");
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [globalMessage, setGlobalMessage] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Entities
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSettings);
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [music, setMusic] = useState<MusicTrack[]>([]);
  const [faqs, setFaqs] = useState<FaqQuery[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Drawers & Modals
  const [projectDrawerOpen, setProjectDrawerOpen] = useState(false);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const [timelineDrawerOpen, setTimelineDrawerOpen] = useState(false);
  const [timelineForm, setTimelineForm] = useState(emptyTimelineForm);
  const [editingTimelineId, setEditingTimelineId] = useState<string | null>(null);

  const [certDrawerOpen, setCertDrawerOpen] = useState(false);
  const [certForm, setCertForm] = useState(emptyCertForm);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);

  const [musicDrawerOpen, setMusicDrawerOpen] = useState(false);
  const [musicForm, setMusicForm] = useState(emptyMusicForm);
  const [musicUploadFile, setMusicUploadFile] = useState<File | null>(null);
  const [musicFileLabel, setMusicFileLabel] = useState("No hay archivo");
  const [musicFeedback, setMusicFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [editingMusicId, setEditingMusicId] = useState<string | null>(null);

  const [faqDrawerOpen, setFaqDrawerOpen] = useState(false);
  const [faqForm, setFaqForm] = useState(emptyFaqForm);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);

  // Loaders
  const loadSiteSettings = async () => {
    try {
      const { data } = await supabase.from("site_settings").select("*").eq("id", "general_config").maybeSingle();
      if (data) setSiteSettings({ ...defaultSettings, ...data });
    } catch {
      // Ignored
    }
  };

  const loadProjects = async () => {
    const { data } = await supabase.from("projects").select("*").order("sort_order");
    setProjects(data ?? []);
  };

  const loadTimeline = async () => {
    try {
      const { data } = await supabase.from("timeline_entries").select("*").order("sort_order");
      setTimeline(data ?? []);
    } catch {
      // Ignored
    }
  };

  const loadCertifications = async () => {
    try {
      const { data } = await supabase.from("certifications").select("*").order("sort_order");
      setCertifications(data ?? []);
    } catch {
      // Ignored
    }
  };

  const loadMusic = async () => {
    try {
      const { data } = await supabase.from("music_tracks").select("*").order("sort_order");
      setMusic(data ?? []);
    } catch {
      // Ignored
    }
  };

  const loadFaqs = async () => {
    try {
      const { data } = await supabase.from("faq_queries").select("*").order("sort_order");
      setFaqs(data ?? []);
    } catch {
      // Ignored
    }
  };

  const loadMessages = async () => {
    try {
      const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      setMessages(data ?? []);
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    void (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        await navigate({ to: "/auth" });
        return;
      }
      const { data: claimed } = await supabase.rpc("claim_first_admin");
      const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
      if (!claimed && !isAdmin) {
        setGlobalMessage("Esta cuenta no tiene privilegios de administración.");
        setLoading(false);
        return;
      }
      setAuthorized(true);
      await Promise.allSettled([
        loadSiteSettings(),
        loadProjects(),
        loadTimeline(),
        loadCertifications(),
        loadMusic(),
        loadFaqs(),
        loadMessages(),
      ]);
      setLoading(false);
    })();
  }, [navigate]);

  // Save Site Settings
  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setGlobalMessage("");

    const payload = {
      ...siteSettings,
      id: "general_config",
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("site_settings").upsert(payload, { onConflict: "id" });
    if (error) {
      setGlobalMessage(`Error: ${error.message}`);
    } else {
      setSaveSuccess(true);
      setGlobalMessage("¡Configuración general guardada con éxito en la base de datos!");
      setTimeout(() => setSaveSuccess(false), 3500);
      await loadSiteSettings();
    }
  };

  // Projects CRUD
  const startEditProject = (proj?: Project) => {
    if (proj) {
      setEditingProjectId(proj.id);
      setProjectForm({
        title: proj.title,
        slug: proj.slug,
        summary: proj.summary,
        problem: proj.problem,
        category: proj.category,
        technologies: proj.technologies.join(", "),
        github_url: proj.github_url ?? "",
        demo_url: proj.demo_url ?? "",
        image_url: proj.image_url ?? "",
        image_fit: (proj.image_fit as "cover" | "contain") || "cover",
        image_position: proj.image_position || "50% 50%",
        featured: proj.featured,
        published: proj.published,
        sort_order: proj.sort_order,
      });
    } else {
      setEditingProjectId(null);
      setProjectForm(emptyProjectForm);
    }
    setProjectDrawerOpen(true);
  };

  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...projectForm,
      technologies: projectForm.technologies.split(",").map((s) => s.trim()).filter(Boolean),
      github_url: projectForm.github_url || null,
      demo_url: projectForm.demo_url || null,
      image_url: projectForm.image_url || null,
      image_fit: projectForm.image_fit,
      image_position: projectForm.image_position,
    };

    const res = editingProjectId
      ? await supabase.from("projects").update(payload).eq("id", editingProjectId)
      : await supabase.from("projects").insert(payload);

    if (res.error) {
      alert(`Error al guardar: ${res.error.message}`);
      return;
    }
    setProjectDrawerOpen(false);
    await loadProjects();
  };

  const removeProject = async (id: string) => {
    if (!window.confirm("¿Eliminar este proyecto del archivo?")) return;
    await supabase.from("projects").delete().eq("id", id);
    await loadProjects();
  };

  const toggleProjectPublished = async (p: Project) => {
    await supabase.from("projects").update({ published: !p.published }).eq("id", p.id);
    await loadProjects();
  };

  // Timeline CRUD
  const startEditTimeline = (item?: TimelineEntry) => {
    if (item) {
      setEditingTimelineId(item.id);
      setTimelineForm({
        kind: item.kind,
        title: item.title,
        institution: item.institution,
        period: item.period,
        status: item.status,
        description: item.description,
        skills_learned: (item.skills_learned || []).join(", "),
        sort_order: item.sort_order,
      });
    } else {
      setEditingTimelineId(null);
      setTimelineForm(emptyTimelineForm);
    }
    setTimelineDrawerOpen(true);
  };

  const saveTimeline = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      kind: timelineForm.kind,
      title: timelineForm.title,
      institution: timelineForm.institution,
      period: timelineForm.period,
      status: timelineForm.status,
      description: timelineForm.description,
      skills_learned: timelineForm.skills_learned.split(",").map((s) => s.trim()).filter(Boolean),
      sort_order: Number(timelineForm.sort_order),
    };

    const res = editingTimelineId
      ? await supabase.from("timeline_entries").update(payload).eq("id", editingTimelineId)
      : await supabase.from("timeline_entries").insert(payload);

    if (res.error) {
      alert(`Error: ${res.error.message}`);
      return;
    }
    setTimelineDrawerOpen(false);
    await loadTimeline();
  };

  const removeTimeline = async (id: string) => {
    if (!window.confirm("¿Eliminar este hito del expediente?")) return;
    await supabase.from("timeline_entries").delete().eq("id", id);
    await loadTimeline();
  };

  // Certifications CRUD
  const startEditCert = (item?: Certification) => {
    if (item) {
      setEditingCertId(item.id);
      setCertForm({
        title: item.title,
        issuer: item.issuer,
        issued_date: item.issued_date,
        credential_url: item.credential_url || "",
        credential_id: item.credential_id || "",
        hours: item.hours || 40,
        badge_url: item.badge_url || "",
        image_fit: (item.image_fit as "cover" | "contain") || "cover",
        image_position: item.image_position || "50% 50%",
        sort_order: item.sort_order,
        published: item.published,
      });
    } else {
      setEditingCertId(null);
      setCertForm(emptyCertForm);
    }
    setCertDrawerOpen(true);
  };

  const saveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: certForm.title,
      issuer: certForm.issuer,
      issued_date: certForm.issued_date,
      credential_url: certForm.credential_url || null,
      credential_id: certForm.credential_id || null,
      hours: Number(certForm.hours) || null,
      badge_url: certForm.badge_url || null,
      image_fit: certForm.image_fit,
      image_position: certForm.image_position,
      sort_order: Number(certForm.sort_order),
      published: certForm.published,
    };

    const res = editingCertId
      ? await supabase.from("certifications").update(payload).eq("id", editingCertId)
      : await supabase.from("certifications").insert(payload);

    if (res.error) {
      alert(`Error: ${res.error.message}`);
      return;
    }
    setCertDrawerOpen(false);
    await loadCertifications();
  };

  const removeCert = async (id: string) => {
    if (!window.confirm("¿Eliminar esta certificación?")) return;
    await supabase.from("certifications").delete().eq("id", id);
    await loadCertifications();
  };

  // Music CRUD
  const isBlobUrl = (value?: string | null) => !!value && value.startsWith("blob:");

  const normalizeStoredAudioUrl = (value?: string | null) => {
    if (!value) return value;
    return value
      .replace(/\.mp3\.mp3$/i, ".mp3")
      .replace(/\.wav\.wav$/i, ".wav")
      .replace(/\.aac\.aac$/i, ".aac")
      .replace(/\.ogg\.ogg$/i, ".ogg");
  };

  const handleMusicFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setMusicUploadFile(file);
    setMusicFileLabel(file.name);
    setMusicFeedback({ type: "success", message: `Archivo listo para subir: ${file.name}` });
    setMusicForm((current) => ({
      ...current,
      source_type: "upload",
      audio_url: objectUrl,
      title: current.title || file.name.replace(/\.[^/.]+$/, ""),
      duration: current.duration || "2:45",
    }));
  };

  const uploadMusicFileToStorage = async () => {
    if (musicForm.source_type !== "upload" || !musicUploadFile) {
      return isBlobUrl(musicForm.audio_url) ? null : normalizeStoredAudioUrl(musicForm.audio_url) || null;
    }

    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket("music");
    if (bucketError || !bucketData) {
      throw new Error("El bucket 'music' no existe en este proyecto de Supabase. Créalo en Storage con acceso público.");
    }

    const originalName = musicUploadFile.name.toLowerCase();
    const extension = originalName.includes(".") ? originalName.slice(originalName.lastIndexOf(".")) : ".mp3";
    const baseName = originalName.replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
    const randomSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const safeFileName = `${baseName || "audio"}-${randomSuffix}`.replace(/-+/g, "-");
    const storagePath = `${safeFileName}${extension}`;

    const { error } = await supabase.storage.from("music").upload(storagePath, musicUploadFile, {
      cacheControl: "3600",
      upsert: false,
      contentType: musicUploadFile.type || "audio/mpeg",
    });

    if (error) {
      throw new Error(`No se pudo subir el archivo a Supabase Storage: ${error.message}`);
    }

    const { data } = supabase.storage.from("music").getPublicUrl(storagePath);
    return normalizeStoredAudioUrl(data.publicUrl) || data.publicUrl;
  };

  const startEditMusic = (item?: MusicTrack) => {
    setMusicFeedback(null);
    if (item) {
      setEditingMusicId(item.id);
      setMusicUploadFile(null);
      setMusicForm({
        title: item.title,
        artist: item.artist,
        source_type: (item.source_type as "upload" | "direct_url" | "youtube") || "direct_url",
        audio_url: normalizeStoredAudioUrl(item.audio_url) || "",
        youtube_id: item.youtube_id || "",
        duration: item.duration || "2:45",
        duration_seconds: item.duration_seconds || 165,
        is_active: item.is_active,
        sort_order: item.sort_order,
      });
      setMusicFileLabel(item.audio_url ? "Archivo adjunto" : "No hay archivo");
    } else {
      setEditingMusicId(null);
      setMusicUploadFile(null);
      setMusicForm(emptyMusicForm);
      setMusicFileLabel("No hay archivo");
    }
    setMusicDrawerOpen(true);
  };

  const saveMusic = async (e: React.FormEvent) => {
    e.preventDefault();

    const safeStoredAudioUrl = isBlobUrl(musicForm.audio_url) ? "" : musicForm.audio_url || "";
    const validExistingAudio = safeStoredAudioUrl || (editingMusicId ? (await supabase.from("music_tracks").select("audio_url").eq("id", editingMusicId).maybeSingle()).data?.audio_url || "" : "");

    if (musicForm.source_type === "upload" && !musicUploadFile && !validExistingAudio) {
      setMusicFeedback({ type: "error", message: "Selecciona un archivo MP3/WAV antes de guardar la pista." });
      return;
    }

    try {
      let resolvedAudioUrl = isBlobUrl(musicForm.audio_url) ? null : normalizeStoredAudioUrl(musicForm.audio_url) || null;

      if (musicForm.source_type === "upload" && musicUploadFile) {
        resolvedAudioUrl = await uploadMusicFileToStorage();
      } else if (musicForm.source_type === "upload" && !musicUploadFile && editingMusicId && validExistingAudio) {
        resolvedAudioUrl = normalizeStoredAudioUrl(validExistingAudio) || validExistingAudio;
      }

      if (musicForm.source_type === "upload" && !resolvedAudioUrl) {
        setMusicFeedback({ type: "error", message: "No hay ninguna URL válida para esta pista de audio. Sube un archivo MP3/WAV o usa una URL pública." });
        return;
      }

      const payload = {
        title: musicForm.title,
        artist: musicForm.artist,
        source_type: musicForm.source_type,
        audio_url: musicForm.source_type === "upload" ? resolvedAudioUrl : safeStoredAudioUrl || null,
        youtube_id: musicForm.source_type === "youtube" ? (musicForm.youtube_id || safeStoredAudioUrl || null) : (musicForm.youtube_id || null),
        duration: musicForm.duration || "2:45",
        duration_seconds: Number(musicForm.duration_seconds) || null,
        is_active: musicForm.is_active,
        sort_order: Number(musicForm.sort_order),
      };

      const res = editingMusicId
        ? await supabase.from("music_tracks").update(payload).eq("id", editingMusicId)
        : await supabase.from("music_tracks").insert(payload);

      if (res.error) {
        setMusicFeedback({ type: "error", message: `Error: ${res.error.message}` });
        return;
      }

      setMusicDrawerOpen(false);
      setMusicUploadFile(null);
      setMusicFileLabel("No hay archivo");
      setMusicFeedback({ type: "success", message: "Pista guardada correctamente en Supabase." });
      await loadMusic();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      setMusicFeedback({ type: "error", message: `${message}. Crea el bucket 'music' en Supabase Storage y asegúrate de que sea público.` });
    }
  };

  const removeMusic = async (id: string) => {
    if (!window.confirm("¿Eliminar esta pista de audio?")) return;
    await supabase.from("music_tracks").delete().eq("id", id);
    await loadMusic();
  };

  // Messages Actions
  const toggleMessageRead = async (msg: ContactMessage) => {
    await supabase.from("contact_messages").update({ is_read: !msg.is_read }).eq("id", msg.id);
    await loadMessages();
  };

  const removeMessage = async (id: string) => {
    if (!window.confirm("¿Eliminar este mensaje?")) return;
    await supabase.from("contact_messages").delete().eq("id", id);
    await loadMessages();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await navigate({ to: "/auth" });
  };

  if (loading) return <main className="admin-loading">Cargando consola de administración…</main>;
  if (!authorized) {
    return (
      <main className="admin-loading">
        <p>{globalMessage || "No autorizado"}</p>
        <Button onClick={signOut}>Cerrar sesión</Button>
      </main>
    );
  }

  return (
    <main className="admin-page">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="wordmark">
          <img src="/favicon.png" alt="Logo Diego Yeferson" className="wordmark-logo" width={34} height={34} />
          <span>Panel Administrador</span>
        </div>

        <nav>
          <button
            type="button"
            className={activeTab === "settings" ? "admin-tab-button active" : "admin-tab-button"}
            onClick={() => setActiveTab("settings")}
          >
            <Sliders /> Contenido General
          </button>
          <button
            type="button"
            className={activeTab === "projects" ? "admin-tab-button active" : "admin-tab-button"}
            onClick={() => setActiveTab("projects")}
          >
            <LayoutDashboard /> Proyectos ({projects.length})
          </button>
          <button
            type="button"
            className={activeTab === "timeline" ? "admin-tab-button active" : "admin-tab-button"}
            onClick={() => setActiveTab("timeline")}
          >
            <GraduationCap /> Expediente ({timeline.length})
          </button>
          <button
            type="button"
            className={activeTab === "certifications" ? "admin-tab-button active" : "admin-tab-button"}
            onClick={() => setActiveTab("certifications")}
          >
            <Award /> Certificaciones ({certifications.length})
          </button>
          <button
            type="button"
            className={activeTab === "music" ? "admin-tab-button active" : "admin-tab-button"}
            onClick={() => setActiveTab("music")}
          >
            <Music /> Música Lo-Fi ({music.length})
          </button>
          <button
            type="button"
            className={activeTab === "faq" ? "admin-tab-button active" : "admin-tab-button"}
            onClick={() => setActiveTab("faq")}
          >
            <HelpCircle /> Consultas FAQ ({faqs.length})
          </button>
          <button
            type="button"
            className={activeTab === "messages" ? "admin-tab-button active" : "admin-tab-button"}
            onClick={() => setActiveTab("messages")}
          >
            <Inbox /> Mensajes ({messages.filter((m) => !m.is_read).length} nuevos)
          </button>
          <Link to="/">
            <ArrowLeft /> Ver Portfolio
          </Link>
        </nav>

        <Button variant="ghost" onClick={signOut} className="mt-auto">
          <LogOut /> Cerrar sesión
        </Button>
      </aside>

      {/* Main Content Area */}
      <section className="admin-content">
        {/* ====================================================================
            TAB: CONTENIDO GENERAL (REDESIGNED & BEAUTIFIED)
            ==================================================================== */}
        {activeTab === "settings" && (
          <>
            <header>
              <div>
                <p className="kicker">Manga Blueprint Studio // Ajustes Principales</p>
                <h1>Contenido General</h1>
                <p>
                  Controla la identidad visual, el logotipo con encuadre dinámico, los titulares hero, la disponibilidad y canales de contacto.
                </p>
              </div>
            </header>

            <form onSubmit={saveSettings}>
              <div className="admin-settings-layout">
                {/* Columna Izquierda: Tarjetas Modulares */}
                <div className="admin-cards-column">
                  {/* TARJETA 1: Identidad & Logotipo */}
                  <div className="admin-card">
                    <span className="admin-card-badge">[SEC-01] IDENTIDAD VISUAL & LOGOTIPO</span>
                    <h2 className="admin-card-title">Marca & Encuadre de Logo</h2>
                    <p className="admin-card-desc">
                      Define las siglas, el nombre visible en el encabezado y ajusta el encuadre exacto del isotipo.
                    </p>

                    <div className="form-grid">
                      <div className="admin-field-group">
                        <label className="admin-field-label">
                          Siglas de Marca <span className="admin-field-meta">(Máx. 3 letras)</span>
                        </label>
                        <input
                          type="text"
                          value={siteSettings.brand_initials || "DY"}
                          maxLength={4}
                          onChange={(e) => setSiteSettings({ ...siteSettings, brand_initials: e.target.value })}
                          className="admin-input-styled font-mono font-bold"
                          placeholder="DY"
                        />
                      </div>

                      <div className="admin-field-group">
                        <label className="admin-field-label">Nombre de Marca / Autor</label>
                        <input
                          type="text"
                          value={siteSettings.brand_name}
                          onChange={(e) => setSiteSettings({ ...siteSettings, brand_name: e.target.value })}
                          className="admin-input-styled font-semibold"
                          placeholder="Diego Yeferson EC"
                        />
                      </div>
                    </div>

                    <div className="admin-field-group">
                      <label className="admin-field-label">URL del Logotipo o Isotipo</label>
                      <input
                        type="url"
                        value={siteSettings.logo_url || ""}
                        onChange={(e) => setSiteSettings({ ...siteSettings, logo_url: e.target.value })}
                        className="admin-input-styled font-mono text-sm"
                        placeholder="https://... o /favicon.png"
                      />
                    </div>

                    {/* ImageDragFramer para el logotipo */}
                    <ImageDragFramer
                      imageUrl={siteSettings.logo_url || "/favicon.png"}
                      imageFit={(siteSettings.logo_fit as "cover" | "contain") || "contain"}
                      imagePosition={siteSettings.logo_position || "50% 50%"}
                      aspectRatio="1/1"
                      label="Mesa de encuadre para Isotipo / Logo"
                      onChange={(fit, pos) => {
                        setSiteSettings({
                          ...siteSettings,
                          logo_fit: fit,
                          logo_position: pos,
                        });
                      }}
                    />
                  </div>

                  {/* TARJETA 2: Hero & Narrativa Profesional */}
                  <div className="admin-card">
                    <span className="admin-card-badge">[SEC-02] HERO SECTION & BIOGRAFÍA</span>
                    <h2 className="admin-card-title">Titular Principal & Narrativa</h2>
                    <p className="admin-card-desc">
                      Textos de impacto que los reclutadores y clientes ven en el primer pliegue de la pantalla.
                    </p>

                    <div className="admin-field-group">
                      <label className="admin-field-label">Título Hero (H1)</label>
                      <input
                        type="text"
                        value={siteSettings.hero_title}
                        onChange={(e) => setSiteSettings({ ...siteSettings, hero_title: e.target.value })}
                        className="admin-input-styled text-lg font-bold"
                        placeholder="Diego Yeferson EC"
                      />
                    </div>

                    <div className="admin-field-group">
                      <label className="admin-field-label">
                        Rol Profesional Técnico <span className="admin-field-meta">(Subtítulo en color cobre)</span>
                      </label>
                      <input
                        type="text"
                        value={siteSettings.hero_role}
                        onChange={(e) => setSiteSettings({ ...siteSettings, hero_role: e.target.value })}
                        className="admin-input-styled font-mono font-semibold"
                        placeholder="Técnico en desarrollo de sistemas e información"
                      />
                      <div className="admin-presets-row">
                        <span className="text-[11px] font-mono text-muted-foreground self-center mr-1">Sugerencias:</span>
                        <button
                          type="button"
                          className="admin-preset-chip"
                          onClick={() =>
                            setSiteSettings({
                              ...siteSettings,
                              hero_role: "Técnico en desarrollo de sistemas e información",
                            })
                          }
                        >
                          Técnico en Sistemas
                        </button>
                        <button
                          type="button"
                          className="admin-preset-chip"
                          onClick={() =>
                            setSiteSettings({
                              ...siteSettings,
                              hero_role: "Técnico en Sistemas · Estudiante Ing. de Software UTP",
                            })
                          }
                        >
                          Técnico + UTP
                        </button>
                        <button
                          type="button"
                          className="admin-preset-chip"
                          onClick={() =>
                            setSiteSettings({
                              ...siteSettings,
                              hero_role: "Desarrollador Full Stack & Modelador de Bases de Datos",
                            })
                          }
                        >
                          Full Stack & BD
                        </button>
                      </div>
                    </div>

                    <div className="admin-field-group">
                      <div className="admin-field-label">
                        <span>Copy Principal / Manifiesto</span>
                        <span className="admin-field-meta">{siteSettings.hero_copy.length} caracteres</span>
                      </div>
                      <textarea
                        value={siteSettings.hero_copy}
                        onChange={(e) => setSiteSettings({ ...siteSettings, hero_copy: e.target.value })}
                        className="admin-input-styled"
                        placeholder="Describe tu propuesta de valor técnica y académica..."
                      />
                    </div>
                  </div>

                  {/* TARJETA 3: Estado & Disponibilidad */}
                  <div className="admin-card">
                    <span className="admin-card-badge">[SEC-03] RADAR DE DISPONIBILIDAD</span>
                    <h2 className="admin-card-title">Disponibilidad Laboral</h2>
                    <p className="admin-card-desc">
                      Informa a los reclutadores en qué modalidad o estado de búsqueda te encuentras.
                    </p>

                    <div className="admin-field-group">
                      <label className="admin-field-label">Estado visible en el badge</label>
                      <input
                        type="text"
                        value={siteSettings.availability_status}
                        onChange={(e) => setSiteSettings({ ...siteSettings, availability_status: e.target.value })}
                        className="admin-input-styled font-mono"
                        placeholder="Disponible para nuevos retos y proyectos"
                      />
                      <div className="admin-presets-row">
                        <button
                          type="button"
                          className="admin-preset-chip"
                          onClick={() =>
                            setSiteSettings({
                              ...siteSettings,
                              availability_status: "Disponible para nuevos retos y proyectos",
                            })
                          }
                        >
                          🟢 Disponible para nuevos retos
                        </button>
                        <button
                          type="button"
                          className="admin-preset-chip"
                          onClick={() =>
                            setSiteSettings({
                              ...siteSettings,
                              availability_status: "Búsqueda activa: Prácticas pre-profesionales / Junior",
                            })
                          }
                        >
                          🟡 Prácticas pre-profesionales
                        </button>
                        <button
                          type="button"
                          className="admin-preset-chip"
                          onClick={() =>
                            setSiteSettings({
                              ...siteSettings,
                              availability_status: "Enfocado en proyectos y ciclo académico UTP",
                            })
                          }
                        >
                          🔵 Enfocado en proyectos UTP
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* TARJETA 4: Coordenadas & Canales Técnicos */}
                  <div className="admin-card">
                    <span className="admin-card-badge">[SEC-04] CANALES DE COMUNICACIÓN</span>
                    <h2 className="admin-card-title">Coordenadas & Redes</h2>
                    <p className="admin-card-desc">
                      Enlaces directos para que los reclutadores te contacten por LinkedIn, GitHub o Email.
                    </p>

                    <div className="form-grid">
                      <div className="admin-field-group">
                        <label className="admin-field-label">
                          <Mail className="w-3.5 h-3.5 mr-1 inline text-copper" /> Correo de contacto
                        </label>
                        <input
                          type="email"
                          value={siteSettings.email_contact || ""}
                          onChange={(e) => setSiteSettings({ ...siteSettings, email_contact: e.target.value })}
                          className="admin-input-styled font-mono"
                          placeholder="diego@ejemplo.com"
                        />
                      </div>

                      <div className="admin-field-group">
                        <label className="admin-field-label">
                          <MapPin className="w-3.5 h-3.5 mr-1 inline text-copper" /> Ubicación / Ciudad
                        </label>
                        <input
                          type="text"
                          value={siteSettings.location || ""}
                          onChange={(e) => setSiteSettings({ ...siteSettings, location: e.target.value })}
                          className="admin-input-styled"
                          placeholder="Lima, Perú"
                        />
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="admin-field-group">
                        <label className="admin-field-label">
                          <Github className="w-3.5 h-3.5 mr-1 inline text-copper" /> URL GitHub
                        </label>
                        <input
                          type="url"
                          value={siteSettings.github_url || ""}
                          onChange={(e) => setSiteSettings({ ...siteSettings, github_url: e.target.value })}
                          className="admin-input-styled font-mono text-sm"
                          placeholder="https://github.com/..."
                        />
                      </div>

                      <div className="admin-field-group">
                        <label className="admin-field-label">
                          <Linkedin className="w-3.5 h-3.5 mr-1 inline text-copper" /> URL LinkedIn
                        </label>
                        <input
                          type="url"
                          value={siteSettings.linkedin_url || ""}
                          onChange={(e) => setSiteSettings({ ...siteSettings, linkedin_url: e.target.value })}
                          className="admin-input-styled font-mono text-sm"
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* TARJETA 5: Pie de Página & Manifiesto */}
                  <div className="admin-card">
                    <span className="admin-card-badge">[SEC-05] PIE DE PÁGINA & SELLO</span>
                    <h2 className="admin-card-title">Manifiesto de Cierre</h2>
                    <p className="admin-card-desc">Lema final que corona el footer estilo estudio manga.</p>

                    <div className="admin-field-group">
                      <label className="admin-field-label">Tagline del Footer</label>
                      <input
                        type="text"
                        value={siteSettings.footer_tagline || ""}
                        onChange={(e) => setSiteSettings({ ...siteSettings, footer_tagline: e.target.value })}
                        className="admin-input-styled italic"
                        placeholder="Diseñado entre café, código y lluvia."
                      />
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Vista Previa en Vivo (Mesa de Dibujo Blueprint) */}
                <div className="admin-preview-column">
                  <div className="blueprint-preview-box">
                    <div className="blueprint-preview-bar">
                      <span className="font-mono text-xs">
                        <Sparkles className="w-3.5 h-3.5 mr-1 inline text-copper" /> LIVE PREVIEW // BLUEPRINT
                      </span>
                      <div className="blueprint-dots">
                        <span className="blueprint-dot" />
                        <span className="blueprint-dot" />
                        <span className="blueprint-dot" />
                      </div>
                    </div>

                    <div className="blueprint-content">
                      {/* Preview Header */}
                      <div className="preview-site-header">
                        <div className="preview-logo-wrapper">
                          <img
                            src={siteSettings.logo_url || "/favicon.png"}
                            alt="Logo preview"
                            className="preview-logo-img"
                            style={{
                              objectFit: (siteSettings.logo_fit as "cover" | "contain") || "contain",
                              objectPosition: siteSettings.logo_position || "50% 50%",
                            }}
                          />
                          <span className="preview-brand-tag">{siteSettings.brand_name || "Diego Yeferson EC"}</span>
                        </div>
                        <div className="preview-hanko-seal" title="Sello Hankō tradicional">
                          {siteSettings.brand_initials || "DY"}
                        </div>
                      </div>

                      {/* Preview Hero Status */}
                      <div className="preview-status-pill">
                        <span className="status-dot-pulse" />
                        <span>{siteSettings.availability_status || "Disponible"}</span>
                      </div>

                      {/* Preview Titles */}
                      <h3 className="preview-hero-title">{siteSettings.hero_title || "Diego Yeferson EC"}</h3>
                      <p className="preview-hero-role">{siteSettings.hero_role || "Técnico en Sistemas"}</p>
                      <p className="preview-hero-copy">{siteSettings.hero_copy}</p>

                      {/* Preview Badges */}
                      <div className="preview-contact-bar">
                        {siteSettings.location && (
                          <span className="preview-badge">
                            <MapPin className="w-3 h-3 text-copper" /> {siteSettings.location}
                          </span>
                        )}
                        {siteSettings.email_contact && (
                          <span className="preview-badge">
                            <Mail className="w-3 h-3 text-copper" /> {siteSettings.email_contact}
                          </span>
                        )}
                      </div>

                      {/* Preview Footer */}
                      <div className="preview-footer-line">
                        <span>“{siteSettings.footer_tagline || "Diseñado entre café, código y lluvia."}”</span>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-copper">Lima, Perú</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra fija de guardado con feedback visual */}
              <div className="admin-save-sticky-bar">
                <div className="save-bar-status">
                  {saveSuccess ? (
                    <span className="text-green-400 font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> Cambios guardados correctamente en Supabase.
                    </span>
                  ) : globalMessage ? (
                    <span className="text-copper">{globalMessage}</span>
                  ) : (
                    <span className="text-muted-foreground">Configuración lista para sincronizar con producción.</span>
                  )}
                </div>
                <Button type="submit" size="lg" className="bg-copper text-white hover:bg-copper/90">
                  <Save className="w-4 h-4 mr-2" /> Guardar Todo el Contenido
                </Button>
              </div>
            </form>
          </>
        )}

        {/* ====================================================================
            TAB: PROYECTOS
            ==================================================================== */}
        {activeTab === "projects" && (
          <>
            <header>
              <div>
                <p className="kicker">Panel privado</p>
                <h1>Archivo de proyectos</h1>
                <p>
                  {projects.length} piezas · {projects.filter((p) => p.published).length} publicadas
                </p>
              </div>
              <Button size="lg" onClick={() => startEditProject()}>
                <Plus /> Nuevo proyecto
              </Button>
            </header>

            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Proyecto</th>
                    <th>Stack</th>
                    <th>Orden</th>
                    <th>Estado</th>
                    <th>
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <strong>{project.title}</strong>
                        <small>{project.category}</small>
                      </td>
                      <td>
                        <div className="badge-row">
                          {project.technologies.slice(0, 3).map((tech) => (
                            <span key={tech}>{tech}</span>
                          ))}
                        </div>
                      </td>
                      <td>{project.sort_order}</td>
                      <td>
                        <button
                          type="button"
                          className={project.published ? "status-pill published" : "status-pill"}
                          onClick={() => toggleProjectPublished(project)}
                        >
                          {project.published ? <Eye /> : <EyeOff />}
                          {project.published ? "Publicado" : "Borrador"}
                        </button>
                      </td>
                      <td>
                        <div className="row-actions">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startEditProject(project)}
                            aria-label="Editar"
                          >
                            <Pencil />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeProject(project.id)}
                            aria-label="Eliminar"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ====================================================================
            TAB: EXPEDIENTE TÉCNICO (TIMELINE)
            ==================================================================== */}
        {activeTab === "timeline" && (
          <>
            <header>
              <div>
                <p className="kicker">Trayectoria Académica y Laboral</p>
                <h1>Expediente Técnico</h1>
                <p>{timeline.length} hitos registrados en la base de datos.</p>
              </div>
              <Button size="lg" onClick={() => startEditTimeline()}>
                <Plus /> Nuevo hito
              </Button>
            </header>

            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Título & Institución</th>
                    <th>Periodo</th>
                    <th>Estado</th>
                    <th>Orden</th>
                    <th>
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {timeline.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="font-mono text-xs uppercase font-bold text-copper">
                          {item.kind === "education" ? "Académico" : "Laboral"}
                        </span>
                      </td>
                      <td>
                        <strong>{item.title}</strong>
                        <small>{item.institution}</small>
                      </td>
                      <td>{item.period}</td>
                      <td>
                        <span className="font-mono text-xs">{item.status}</span>
                      </td>
                      <td>{item.sort_order}</td>
                      <td>
                        <div className="row-actions">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startEditTimeline(item)}
                            aria-label="Editar"
                          >
                            <Pencil />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeTimeline(item.id)}
                            aria-label="Eliminar"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ====================================================================
            TAB: CERTIFICACIONES
            ==================================================================== */}
        {activeTab === "certifications" && (
          <>
            <header>
              <div>
                <p className="kicker">Credenciales y Horas</p>
                <h1>Certificaciones</h1>
                <p>{certifications.length} certificaciones registradas.</p>
              </div>
              <Button size="lg" onClick={() => startEditCert()}>
                <Plus /> Nueva certificación
              </Button>
            </header>

            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Certificación</th>
                    <th>Emisor</th>
                    <th>Fecha</th>
                    <th>Horas</th>
                    <th>Estado</th>
                    <th>
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {certifications.map((cert) => (
                    <tr key={cert.id}>
                      <td>
                        <strong>{cert.title}</strong>
                        {cert.credential_id && <small>ID: {cert.credential_id}</small>}
                      </td>
                      <td>{cert.issuer}</td>
                      <td>{cert.issued_date}</td>
                      <td>{cert.hours ? `${cert.hours} hrs` : "—"}</td>
                      <td>
                        <span className={cert.published ? "status-pill published" : "status-pill"}>
                          {cert.published ? "Publicado" : "Oculto"}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startEditCert(cert)}
                            aria-label="Editar"
                          >
                            <Pencil />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeCert(cert.id)}
                            aria-label="Eliminar"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ====================================================================
            TAB: MÚSICA LO-FI
            ==================================================================== */}
        {activeTab === "music" && (
          <>
            <header>
              <div>
                <p className="kicker">Cola de Audio & Beats</p>
                <h1>Música Lo-Fi</h1>
                <p>{music.length} pistas en el cassette virtual.</p>
              </div>
              <Button size="lg" onClick={() => startEditMusic()}>
                <Plus /> Nueva pista
              </Button>
            </header>

            {musicFeedback && (
              <div className={musicFeedback.type === "success" ? "admin-feedback success" : "admin-feedback error"}>
                {musicFeedback.message}
              </div>
            )}

            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Artista</th>
                    <th>Duración</th>
                    <th>Estado</th>
                    <th>Orden</th>
                    <th>
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {music.map((track) => (
                    <tr key={track.id}>
                      <td>
                        <strong>{track.title}</strong>
                      </td>
                      <td>{track.artist}</td>
                      <td>{track.duration || "2:45"}</td>
                      <td>
                        <span className={track.is_active ? "status-pill published" : "status-pill"}>
                          {track.is_active ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td>{track.sort_order}</td>
                      <td>
                        <div className="row-actions">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startEditMusic(track)}
                            aria-label="Editar"
                          >
                            <Pencil />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeMusic(track.id)}
                            aria-label="Eliminar"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ====================================================================
            TAB: CONSULTAS FAQ
            ==================================================================== */}
        {activeTab === "faq" && (
          <>
            <header>
              <div>
                <p className="kicker">Consola SQL Interactiva</p>
                <h1>Consultas FAQ</h1>
                <p>{faqs.length} consultas preparadas para reclutadores.</p>
              </div>
            </header>

            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Etiqueta de Pregunta</th>
                    <th>Comando SQL</th>
                    <th>Columnas</th>
                    <th>Orden</th>
                  </tr>
                </thead>
                <tbody>
                  {faqs.map((faq) => (
                    <tr key={faq.id}>
                      <td>
                        <strong>{faq.question_label}</strong>
                      </td>
                      <td>
                        <code className="text-xs bg-muted px-2 py-1">{faq.sql_command}</code>
                      </td>
                      <td>
                        <div className="badge-row">
                          {(faq.result_columns || []).map((col) => (
                            <span key={col}>{col}</span>
                          ))}
                        </div>
                      </td>
                      <td>{faq.sort_order}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ====================================================================
            TAB: BANDEJA DE MENSAJES
            ==================================================================== */}
        {activeTab === "messages" && (
          <>
            <header>
              <div>
                <p className="kicker">Canal Directo</p>
                <h1>Bandeja de Mensajes</h1>
                <p>
                  {messages.length} notas recibidas · {messages.filter((m) => !m.is_read).length} sin leer
                </p>
              </div>
            </header>

            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Remitente</th>
                    <th>Asunto & Mensaje</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {messages.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">
                        No hay mensajes registrados aún en la bandeja.
                      </td>
                    </tr>
                  ) : (
                    messages.map((msg) => (
                      <tr key={msg.id}>
                        <td>
                          <strong>{msg.sender_name}</strong>
                          <small className="font-mono">{msg.sender_email}</small>
                        </td>
                        <td>
                          <strong>{msg.subject || "(Sin asunto)"}</strong>
                          <p className="text-sm mt-1 line-clamp-2">{msg.message}</p>
                        </td>
                        <td className="font-mono text-xs whitespace-nowrap">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            type="button"
                            className={msg.is_read ? "status-pill" : "status-pill published"}
                            onClick={() => toggleMessageRead(msg)}
                          >
                            {msg.is_read ? "Leído" : "Nuevo"}
                          </button>
                        </td>
                        <td>
                          <div className="row-actions">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeMessage(msg.id)}
                              aria-label="Eliminar"
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* ====================================================================
          DRAWER: PROYECTO (CON ImageDragFramer INTEGRADO)
          ==================================================================== */}
      {projectDrawerOpen && (
        <div className="drawer-backdrop" onMouseDown={() => setProjectDrawerOpen(false)}>
          <aside className="project-drawer" onMouseDown={(e) => e.stopPropagation()}>
            <header>
              <div>
                <p className="kicker">{editingProjectId ? "Editar ficha" : "Nueva ficha"}</p>
                <h2>{editingProjectId ? projectForm.title : "Nuevo proyecto"}</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setProjectDrawerOpen(false)}>
                <X />
              </Button>
            </header>

            <form onSubmit={saveProject}>
              <div className="form-grid">
                <label>
                  Título
                  <input
                    value={projectForm.title}
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        title: e.target.value,
                        slug: editingProjectId
                          ? projectForm.slug
                          : e.target.value
                              .toLowerCase()
                              .normalize("NFD")
                              .replace(/[\u0300-\u036f]/g, "")
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/(^-|-$)/g, ""),
                      })
                    }
                    required
                  />
                </label>
                <label>
                  Identificador (Slug)
                  <input
                    value={projectForm.slug}
                    onChange={(e) => setProjectForm({ ...projectForm, slug: e.target.value })}
                    required
                  />
                </label>
              </div>

              <label>
                Resumen
                <textarea
                  value={projectForm.summary}
                  onChange={(e) => setProjectForm({ ...projectForm, summary: e.target.value })}
                  required
                />
              </label>

              <label>
                Problema resuelto
                <textarea
                  value={projectForm.problem}
                  onChange={(e) => setProjectForm({ ...projectForm, problem: e.target.value })}
                  required
                />
              </label>

              <div className="form-grid">
                <label>
                  Categoría
                  <input
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Tecnologías (separadas por coma)
                  <input
                    value={projectForm.technologies}
                    onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
                    required
                  />
                </label>
              </div>

              <label>
                Imagen (URL)
                <input
                  type="url"
                  value={projectForm.image_url}
                  onChange={(e) => setProjectForm({ ...projectForm, image_url: e.target.value })}
                />
              </label>

              {/* Encuadre interactivo para la imagen del proyecto */}
              <ImageDragFramer
                imageUrl={projectForm.image_url}
                imageFit={projectForm.image_fit}
                imagePosition={projectForm.image_position}
                aspectRatio="16/9"
                label="Encuadre de portada de proyecto (16:9)"
                onChange={(fit, pos) => {
                  setProjectForm({
                    ...projectForm,
                    image_fit: fit,
                    image_position: pos,
                  });
                }}
              />

              <div className="form-grid">
                <label>
                  GitHub
                  <input
                    type="url"
                    value={projectForm.github_url}
                    onChange={(e) => setProjectForm({ ...projectForm, github_url: e.target.value })}
                  />
                </label>
                <label>
                  Demo
                  <input
                    type="url"
                    value={projectForm.demo_url}
                    onChange={(e) => setProjectForm({ ...projectForm, demo_url: e.target.value })}
                  />
                </label>
              </div>

              <div className="form-grid">
                <label>
                  Orden
                  <input
                    type="number"
                    value={projectForm.sort_order}
                    onChange={(e) => setProjectForm({ ...projectForm, sort_order: Number(e.target.value) })}
                  />
                </label>
                <div className="checkboxes">
                  <label>
                    <input
                      type="checkbox"
                      checked={projectForm.featured}
                      onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })}
                    />
                    Destacado
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={projectForm.published}
                      onChange={(e) => setProjectForm({ ...projectForm, published: e.target.checked })}
                    />
                    Publicado
                  </label>
                </div>
              </div>

              <Button type="submit" size="lg">
                <Save /> Guardar proyecto
              </Button>
            </form>
          </aside>
        </div>
      )}

      {/* ====================================================================
          DRAWER: EXPEDIENTE (TIMELINE)
          ==================================================================== */}
      {timelineDrawerOpen && (
        <div className="drawer-backdrop" onMouseDown={() => setTimelineDrawerOpen(false)}>
          <aside className="project-drawer" onMouseDown={(e) => e.stopPropagation()}>
            <header>
              <div>
                <p className="kicker">{editingTimelineId ? "Editar hito" : "Nuevo hito"}</p>
                <h2>{editingTimelineId ? timelineForm.title : "Registrar Hito"}</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setTimelineDrawerOpen(false)}>
                <X />
              </Button>
            </header>

            <form onSubmit={saveTimeline}>
              <div className="form-grid">
                <label>
                  Tipo de Hito
                  <select
                    value={timelineForm.kind}
                    onChange={(e) =>
                      setTimelineForm({ ...timelineForm, kind: e.target.value as "education" | "experience" })
                    }
                    className="admin-input-styled"
                  >
                    <option value="education">Formación Académica</option>
                    <option value="experience">Experiencia Laboral</option>
                  </select>
                </label>
                <label>
                  Periodo (ej: 2026 - Presente)
                  <input
                    value={timelineForm.period}
                    onChange={(e) => setTimelineForm({ ...timelineForm, period: e.target.value })}
                    required
                  />
                </label>
              </div>

              <label>
                Título del Hito / Carrera / Puesto
                <input
                  value={timelineForm.title}
                  onChange={(e) => setTimelineForm({ ...timelineForm, title: e.target.value })}
                  required
                />
              </label>

              <label>
                Institución o Empresa
                <input
                  value={timelineForm.institution}
                  onChange={(e) => setTimelineForm({ ...timelineForm, institution: e.target.value })}
                  required
                />
              </label>

              <label>
                Estado (ej: En curso (1er ciclo), Titulado / Egresado)
                <input
                  value={timelineForm.status}
                  onChange={(e) => setTimelineForm({ ...timelineForm, status: e.target.value })}
                  required
                />
              </label>

              <label>
                Descripción y Competencias
                <textarea
                  value={timelineForm.description}
                  onChange={(e) => setTimelineForm({ ...timelineForm, description: e.target.value })}
                  required
                />
              </label>

              <label>
                Habilidades aprendidas (separadas por coma)
                <input
                  value={timelineForm.skills_learned}
                  onChange={(e) => setTimelineForm({ ...timelineForm, skills_learned: e.target.value })}
                  placeholder="Arquitectura, PostgreSQL, Docker"
                />
              </label>

              <label>
                Orden de aparición
                <input
                  type="number"
                  value={timelineForm.sort_order}
                  onChange={(e) => setTimelineForm({ ...timelineForm, sort_order: Number(e.target.value) })}
                />
              </label>

              <Button type="submit" size="lg">
                <Save /> Guardar hito en expediente
              </Button>
            </form>
          </aside>
        </div>
      )}

      {/* ====================================================================
          DRAWER: CERTIFICACIONES
          ==================================================================== */}
      {certDrawerOpen && (
        <div className="drawer-backdrop" onMouseDown={() => setCertDrawerOpen(false)}>
          <aside className="project-drawer" onMouseDown={(e) => e.stopPropagation()}>
            <header>
              <div>
                <p className="kicker">{editingCertId ? "Editar certificación" : "Nueva certificación"}</p>
                <h2>{editingCertId ? certForm.title : "Registrar Credencial"}</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setCertDrawerOpen(false)}>
                <X />
              </Button>
            </header>

            <form onSubmit={saveCert}>
              <label>
                Título de la Certificación
                <input
                  value={certForm.title}
                  onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                  required
                />
              </label>

              <div className="form-grid">
                <label>
                  Entidad Emisora
                  <input
                    value={certForm.issuer}
                    onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Año / Fecha
                  <input
                    value={certForm.issued_date}
                    onChange={(e) => setCertForm({ ...certForm, issued_date: e.target.value })}
                    required
                  />
                </label>
              </div>

              <div className="form-grid">
                <label>
                  Horas Académicas
                  <input
                    type="number"
                    value={certForm.hours}
                    onChange={(e) => setCertForm({ ...certForm, hours: Number(e.target.value) })}
                  />
                </label>
                <label>
                  ID de Credencial
                  <input
                    value={certForm.credential_id}
                    onChange={(e) => setCertForm({ ...certForm, credential_id: e.target.value })}
                  />
                </label>
              </div>

              <label>
                URL de Validación Oficial
                <input
                  type="url"
                  value={certForm.credential_url}
                  onChange={(e) => setCertForm({ ...certForm, credential_url: e.target.value })}
                />
              </label>

              <label>
                URL de Imagen / Insignia
                <input
                  type="url"
                  value={certForm.badge_url}
                  onChange={(e) => setCertForm({ ...certForm, badge_url: e.target.value })}
                />
              </label>

              {/* Encuadre de la imagen del certificado */}
              <ImageDragFramer
                imageUrl={certForm.badge_url}
                imageFit={certForm.image_fit}
                imagePosition={certForm.image_position}
                aspectRatio="4/3"
                label="Encuadre de credencial (4:3)"
                onChange={(fit, pos) => {
                  setCertForm({
                    ...certForm,
                    image_fit: fit,
                    image_position: pos,
                  });
                }}
              />

              <div className="form-grid">
                <label>
                  Orden
                  <input
                    type="number"
                    value={certForm.sort_order}
                    onChange={(e) => setCertForm({ ...certForm, sort_order: Number(e.target.value) })}
                  />
                </label>
                <div className="checkboxes">
                  <label>
                    <input
                      type="checkbox"
                      checked={certForm.published}
                      onChange={(e) => setCertForm({ ...certForm, published: e.target.checked })}
                    />
                    Publicado
                  </label>
                </div>
              </div>

              <Button type="submit" size="lg">
                <Save /> Guardar certificación
              </Button>
            </form>
          </aside>
        </div>
      )}

      {/* ====================================================================
          DRAWER: MÚSICA LO-FI
          ==================================================================== */}
      {musicDrawerOpen && (
        <div className="drawer-backdrop" onMouseDown={() => setMusicDrawerOpen(false)}>
          <aside className="project-drawer music-drawer" onMouseDown={(e) => e.stopPropagation()}>
            <header>
              <div>
                <p className="kicker">{editingMusicId ? "Editar pista" : "Nueva pista"}</p>
                <h2>{editingMusicId ? musicForm.title : "Registrar Pista Lo-Fi"}</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMusicDrawerOpen(false)}>
                <X />
              </Button>
            </header>

            <form onSubmit={saveMusic}>
              <div className="admin-music-layout">
                <div className="admin-music-form-panel">
                  <label>
                    Título del archivo / pista
                    <input
                      value={musicForm.title}
                      onChange={(e) => setMusicForm({ ...musicForm, title: e.target.value })}
                      placeholder="noche_de_codigo.wav"
                      required
                    />
                  </label>

                  <label>
                    Artista / Sello
                    <input
                      value={musicForm.artist}
                      onChange={(e) => setMusicForm({ ...musicForm, artist: e.target.value })}
                      required
                    />
                  </label>

                  <label>
                    Tipo de origen
                    <select
                      value={musicForm.source_type}
                      onChange={(e) => {
                        const nextType = e.target.value as "upload" | "direct_url" | "youtube";
                        const cleanedAudioUrl = isBlobUrl(musicForm.audio_url) ? "" : musicForm.audio_url;

                        setMusicForm({
                          ...musicForm,
                          source_type: nextType,
                          audio_url: nextType === "upload" ? cleanedAudioUrl : "",
                          youtube_id: nextType === "youtube" ? musicForm.youtube_id : "",
                        });
                      }}
                      className="admin-input-styled"
                    >
                      <option value="upload">Archivo MP3 / Upload</option>
                      <option value="direct_url">URL directa</option>
                      <option value="youtube">YouTube</option>
                    </select>
                  </label>

                  {musicForm.source_type === "upload" ? (
                    <div className="music-upload-panel">
                      <label className="music-upload-label">
                        Archivo de audio
                        <input type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/aac" onChange={handleMusicFileSelection} />
                      </label>

                      {musicForm.audio_url && (
                        <div className="music-upload-preview">
                          <audio controls src={musicForm.audio_url} preload="metadata" />
                          <small>{musicFileLabel}</small>
                          {musicForm.audio_url.startsWith("http") && (
                            <small>Enlace guardado: {musicForm.audio_url}</small>
                          )}
                        </div>
                      )}
                    </div>
                  ) : musicForm.source_type === "youtube" ? (
                    <label>
                      URL o ID de YouTube
                      <input
                        value={musicForm.youtube_id || musicForm.audio_url || ""}
                        onChange={(e) => {
                          const raw = e.target.value.trim();
                          const match = raw.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                          const youtubeId = match ? match[1] : raw;
                          setMusicForm({
                            ...musicForm,
                            youtube_id: youtubeId,
                            audio_url: raw,
                          });
                        }}
                        placeholder="https://youtu.be/... o watch?v=..."
                      />
                    </label>
                  ) : (
                    <label>
                      URL del Audio (MP3 / WAV o streaming)
                      <input
                        type="url"
                        value={musicForm.audio_url}
                        onChange={(e) => setMusicForm({ ...musicForm, audio_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </label>
                  )}

                  <div className="form-grid">
                    <label>
                      Duración aproximada
                      <input
                        value={musicForm.duration}
                        onChange={(e) => setMusicForm({ ...musicForm, duration: e.target.value })}
                        placeholder="2:45"
                      />
                    </label>
                    <label>
                      Orden
                      <input
                        type="number"
                        value={musicForm.sort_order}
                        onChange={(e) => setMusicForm({ ...musicForm, sort_order: Number(e.target.value) })}
                      />
                    </label>
                  </div>

                  <div className="checkboxes">
                    <label>
                      <input
                        type="checkbox"
                        checked={musicForm.is_active}
                        onChange={(e) => setMusicForm({ ...musicForm, is_active: e.target.checked })}
                      />
                      Activa en el reproductor cassette
                    </label>
                  </div>
                </div>

                <div className="admin-music-preview-panel">
                  <div className="admin-music-preview-box">
                    <div className="admin-music-preview-header">Live Cassette Preview</div>
                    <div className="cassette-deck admin-cassette-mini">
                      <div className={`cassette-spool left ${musicForm.is_active ? "is-spinning" : ""}`}>
                        <Disc3 className="w-5 h-5 text-copper" />
                      </div>
                      <div className="cassette-center-screen">
                        <div className="cassette-lcd">
                          <span className="track-title-ticker">{musicForm.title || "Nueva pista"}</span>
                          <span className="track-artist-sub">{musicForm.artist || "Lo-Fi Records"}</span>
                        </div>
                        <div className="cassette-eq-bars" aria-hidden="true">
                          {Array.from({ length: 9 }).map((_, i) => (
                            <span key={i} className={`eq-bar ${musicForm.is_active ? "is-animated" : ""}`} style={{ animationDelay: `${i * 120}ms` }} />
                          ))}
                        </div>
                      </div>
                      <div className={`cassette-spool right ${musicForm.is_active ? "is-spinning" : ""}`}>
                        <Disc3 className="w-5 h-5 text-copper" />
                      </div>
                    </div>
                    <div className="admin-music-meta">
                      <span>Origen: {musicForm.source_type}</span>
                      <span>Duración: {musicForm.duration || "2:45"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" size="lg">
                <Save /> Guardar pista de música
              </Button>
            </form>
          </aside>
        </div>
      )}
    </main>
  );
}
