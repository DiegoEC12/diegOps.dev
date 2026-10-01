import { createFileRoute } from "@tanstack/react-router";
import { PortfolioPage } from "@/components/portfolio/PortfolioPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Diego Yeferson EC — Desarrollo de sistemas" },
      { name: "description", content: "Portfolio de Diego Yeferson EC, técnico en desarrollo de sistemas y estudiante de Ingeniería de Software en la UTP." },
      { property: "og:title", content: "Diego Yeferson EC — Desarrollo de sistemas" },
      { property: "og:description", content: "Proyectos, stack técnico y contacto de Diego Yeferson EC." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortfolioPage,
});
