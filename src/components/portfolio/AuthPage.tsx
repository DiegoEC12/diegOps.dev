import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, Github, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setMessage("");
    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
    setLoading(false);
    if (result.error) { setMessage(result.error.message); return; }
    if (mode === "signup" && !result.data.session) { setMessage("Revisa tu correo para confirmar la cuenta."); return; }
    await navigate({ to: "/admin" });
  };

  const google = async () => {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin`,
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data?.url) {
      window.location.href = data.url;
    }
  };

  return <main className="auth-page">
    <div className="auth-art"><div className="auth-code">&lt;admin /&gt;</div><p>El archivo privado de proyectos.</p></div>
    <section className="auth-form-wrap">
      <Link to="/" className="back-link"><ArrowLeft /> Volver al portfolio</Link>
      <div className="auth-card">
        <LockKeyhole />
        <p className="kicker">Acceso privado</p>
        <h1>{mode === "signin" ? "Bienvenido, Diego." : "Crear acceso"}</h1>
        <p>Gestiona el catálogo, el orden y el estado de publicación.</p>
        <form onSubmit={submit}>
          <label>Correo<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Contraseña<div className="password-field"><input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required /><Button type="button" variant="ghost" size="icon" onClick={() => setShow(!show)} aria-label="Mostrar contraseña">{show ? <EyeOff /> : <Eye />}</Button></div></label>
          {message && <p className="auth-message">{message}</p>}
          <Button type="submit" size="lg" disabled={loading}>{loading ? "Procesando…" : mode === "signin" ? "Entrar" : "Crear cuenta"}</Button>
        </form>
        <div className="auth-divider"><span>o</span></div>
        <Button variant="outline" size="lg" onClick={google}><Github /> Continuar con Google</Button>
        <button className="auth-switch" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>{mode === "signin" ? "Crear la primera cuenta administradora" : "Ya tengo una cuenta"}</button>
      </div>
    </section>
  </main>;
}
