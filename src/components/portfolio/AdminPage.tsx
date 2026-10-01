import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, LayoutDashboard, LogOut, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];
const emptyForm = { title: "", slug: "", summary: "", problem: "", category: "Full Stack", technologies: "TypeScript, PostgreSQL", github_url: "", demo_url: "", image_url: "", featured: false, published: false, sort_order: 0 };

export function AdminPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const loadProjects = async () => {
    const { data } = await supabase.from("projects").select("*").order("sort_order");
    setProjects(data ?? []);
  };

  useEffect(() => {
    void (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { await navigate({ to: "/auth" }); return; }
      const { data: claimed } = await supabase.rpc("claim_first_admin");
      const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
      if (!claimed && !isAdmin) { setMessage("Esta cuenta no tiene acceso de administración."); setLoading(false); return; }
      setAuthorized(true); await loadProjects(); setLoading(false);
    })();
  }, [navigate]);

  const startEdit = (project?: Project) => {
    if (project) {
      setEditingId(project.id);
      setForm({ title: project.title, slug: project.slug, summary: project.summary, problem: project.problem, category: project.category, technologies: project.technologies.join(", "), github_url: project.github_url ?? "", demo_url: project.demo_url ?? "", image_url: project.image_url ?? "", featured: project.featured, published: project.published, sort_order: project.sort_order });
    } else { setEditingId(null); setForm(emptyForm); }
    setOpen(true); setMessage("");
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = { ...form, technologies: form.technologies.split(",").map((item) => item.trim()).filter(Boolean), github_url: form.github_url || null, demo_url: form.demo_url || null, image_url: form.image_url || null };
    const result = editingId ? await supabase.from("projects").update(payload).eq("id", editingId) : await supabase.from("projects").insert(payload);
    if (result.error) { setMessage(result.error.message); return; }
    setOpen(false); await loadProjects();
  };

  const remove = async (id: string) => { if (!window.confirm("¿Eliminar este proyecto?")) return; await supabase.from("projects").delete().eq("id", id); await loadProjects(); };
  const togglePublished = async (project: Project) => { await supabase.from("projects").update({ published: !project.published }).eq("id", project.id); await loadProjects(); };
  const signOut = async () => { await supabase.auth.signOut(); await navigate({ to: "/auth" }); };

  if (loading) return <main className="admin-loading">Cargando archivo…</main>;
  if (!authorized) return <main className="admin-loading"><p>{message}</p><Button onClick={signOut}>Cerrar sesión</Button></main>;

  return <main className="admin-page">
    <aside className="admin-sidebar"><div className="wordmark"><img src="/favicon.png" alt="Logo Diego Yeferson" className="wordmark-logo" width={38} height={38} /> Admin</div><nav><a className="active" href="#projects"><LayoutDashboard />Proyectos</a><Link to="/"><ArrowLeft />Ver portfolio</Link></nav><Button variant="ghost" onClick={signOut}><LogOut />Cerrar sesión</Button></aside>
    <section className="admin-content">
      <header><div><p className="kicker">Panel privado</p><h1>Archivo de proyectos</h1><p>{projects.length} piezas · {projects.filter((p) => p.published).length} publicadas</p></div><Button size="lg" onClick={() => startEdit()}><Plus />Nuevo proyecto</Button></header>
      <div className="admin-table-wrap"><table><thead><tr><th>Proyecto</th><th>Stack</th><th>Orden</th><th>Estado</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>{projects.map((project) => <tr key={project.id}><td><strong>{project.title}</strong><small>{project.category}</small></td><td><div className="badge-row">{project.technologies.slice(0, 3).map((tech) => <span key={tech}>{tech}</span>)}</div></td><td>{project.sort_order}</td><td><button className={project.published ? "status-pill published" : "status-pill"} onClick={() => togglePublished(project)}>{project.published ? <Eye /> : <EyeOff />}{project.published ? "Publicado" : "Borrador"}</button></td><td><div className="row-actions"><Button size="icon" variant="ghost" onClick={() => startEdit(project)} aria-label="Editar"><Pencil /></Button><Button size="icon" variant="ghost" onClick={() => remove(project.id)} aria-label="Eliminar"><Trash2 /></Button></div></td></tr>)}</tbody></table></div>
    </section>
    {open && <div className="drawer-backdrop" onMouseDown={() => setOpen(false)}><aside className="project-drawer" onMouseDown={(e) => e.stopPropagation()}><header><div><p className="kicker">{editingId ? "Editar ficha" : "Nueva ficha"}</p><h2>{editingId ? form.title : "Nuevo proyecto"}</h2></div><Button variant="ghost" size="icon" onClick={() => setOpen(false)}><X /></Button></header><form onSubmit={save}>
      <div className="form-grid"><label>Título<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: editingId ? form.slug : e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })} required /></label><label>Identificador<input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required /></label></div>
      <label>Resumen<textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} required /></label><label>Problema resuelto<textarea value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} required /></label>
      <div className="form-grid"><label>Categoría<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required /></label><label>Tecnologías, separadas por coma<input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} required /></label></div>
      <label>Imagen (URL)<input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></label><div className="form-grid"><label>GitHub<input type="url" value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} /></label><label>Demo<input type="url" value={form.demo_url} onChange={(e) => setForm({ ...form, demo_url: e.target.value })} /></label></div>
      <div className="form-grid"><label>Orden<input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></label><div className="checkboxes"><label><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />Destacado</label><label><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />Publicado</label></div></div>
      {message && <p className="auth-message">{message}</p>}<Button type="submit" size="lg"><Save />Guardar proyecto</Button>
    </form></aside></div>}
  </main>;
}
