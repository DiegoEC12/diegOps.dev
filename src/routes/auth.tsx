import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/portfolio/AuthPage";
export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "Acceso privado — Diego Yeferson EC" },
    { name: "description", content: "Acceso al panel privado del portfolio de Diego Yeferson EC." },
    { property: "og:title", content: "Acceso privado — Diego Yeferson EC" },
    { property: "og:description", content: "Acceso al panel privado del portfolio de Diego Yeferson EC." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: AuthPage,
});
