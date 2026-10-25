import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ClipboardCheck, FilePlus2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDatePt, STATUS_LABELS } from "@/lib/checklist";

export const Route = createFileRoute("/_authenticated/empresa/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Empresa — Checklists | TechCan Systems" },
      {
        name: "description",
        content: "Histórico de checklists de manutenção preventiva CCTV.",
      },
    ],
  }),
  component: EmpresaList,
});

type Row = {
  id: string;
  client_name: string;
  client_email: string;
  intervention_number: string;
  status: string;
  created_at: string;
};

function EmpresaList() {
  const listQuery = useQuery({
    queryKey: ["checklists", "empresa"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sem sessão");
      const { data, error } = await supabase
        .from("checklists")
        .select(
          "id, client_name, client_email, intervention_number, status, created_at",
        )
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Row[];
    },
  });

  const rows = listQuery.data ?? [];

  return (
    <div className="doc-grid min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Checklists — Empresa
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Registros guardados na base de dados.
            </p>
          </div>
          <Link
            to="/empresa/novo"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 font-display text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90"
          >
            <FilePlus2 className="h-4 w-4" />
            Novo checklist
          </Link>
        </div>

        {listQuery.isLoading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : listQuery.isError ? (
          <p className="mt-10 text-sm text-destructive">
            Não foi possível carregar os checklists. Tente novamente.
          </p>
        ) : rows.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-border bg-card p-10 text-center">
            <ClipboardCheck className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 font-display text-base font-semibold text-foreground">
              Ainda não há checklists
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Crie o primeiro checklist de manutenção preventiva.
            </p>
          </div>
        ) : (
          <ul className="mt-6 grid gap-3">
            {rows.map((row) => (
              <li key={row.id}>
                <Link
                  to="/checklist/$id"
                  params={{ id: row.id }}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10"
                >
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-semibold text-foreground">
                      {row.client_name || "Sem cliente definido"}
                      {row.intervention_number ? (
                        <span className="ml-2 text-muted-foreground">
                          · Nº {row.intervention_number}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {row.client_email || "—"} ·{" "}
                      {formatDatePt(row.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                      {STATUS_LABELS[row.status] ?? row.status}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
