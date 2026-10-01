import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/components/portfolio/AdminPage";
export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Administración — Diego Yeferson EC" },
    { name: "description", content: "Gestión privada del catálogo de proyectos." },
    { property: "og:title", content: "Administración — Diego Yeferson EC" },
    { property: "og:description", content: "Gestión privada del catálogo de proyectos." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: AdminPage,
});
