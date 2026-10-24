import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, ClipboardCheck, Building2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "TechCan Systems — Checklist de Manutenção Preventiva CCTV",
      },
      {
        name: "description",
        content:
          "Registo digital e histórico de checklists de manutenção preventiva de sistemas de videovigilância CCTV.",
      },
      {
        property: "og:title",
        content: "TechCan Systems — Checklist de Manutenção Preventiva CCTV",
      },
      {
        property: "og:description",
        content:
          "Registo digital e histórico de checklists de manutenção preventiva de sistemas de videovigilância CCTV.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="doc-grid flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <p className="mt-6 font-display text-sm font-semibold tracking-[0.2em] text-primary uppercase">
          TechCan Systems
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Checklist de Manutenção Preventiva — CCTV
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
          Verificação técnica periódica do sistema de videovigilância — registo
          digital, assinaturas, histórico e exportação em PDF.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/auth"
            className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary px-8 font-display text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90 sm:w-auto"
          >
            Entrar / Criar conta
          </Link>
        </div>

        <div className="mt-14 grid gap-4 text-left sm:grid-cols-3">
          {[
            {
              icon: ClipboardCheck,
              title: "Checklist completo",
              text: "14 verificações técnicas, intervenções corretivas e estado geral do sistema.",
            },
            {
              icon: Building2,
              title: "Lado Empresa",
              text: "Preencha, guarde na base de dados e exporte o documento em PDF.",
            },
            {
              icon: ShieldCheck,
              title: "Lado Cliente",
              text: "O cliente consulta os relatórios de manutenção enviados para o seu e-mail.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card/60 p-5 backdrop-blur"
            >
              <f.icon className="h-5 w-5 text-primary" />
              <h2 className="mt-3 font-display text-sm font-semibold text-foreground">
                {f.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
