import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { ArrowLeft, Download, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChecklistDocument } from "@/components/ChecklistDocument";
import {
  exportChecklistPdf,
  formatDatePt,
  type ChecklistData,
} from "@/lib/checklist";

export const Route = createFileRoute("/_authenticated/checklist/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Checklist — TechCan Systems" },
      {
        name: "description",
        content: "Visualizar, imprimir e exportar o checklist em PDF.",
      },
    ],
  }),
  component: ChecklistView,
});

function ChecklistView() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const docRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const rowQuery = useQuery({
    queryKey: ["checklist", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checklists")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const row = rowQuery.data;

  async function handleExportPdf() {
    if (!docRef.current || !row) return;
    setExporting(true);
    try {
      const name = row.client_name?.trim().replace(/\s+/g, "-") || "checklist";
      const num = row.intervention_number?.trim()
        ? `-${row.intervention_number.trim()}`
        : "";
      await exportChecklistPdf(
        docRef.current,
        `checklist-${name}${num}-${formatDatePt(row.created_at).replaceAll("/", "-")}.pdf`,
      );
    } catch {
      toast.error("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setExporting(false);
    }
  }

  if (rowQuery.isLoading) {
    return (
      <div className="doc-grid flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (rowQuery.isError || !row) {
    return (
      <div className="doc-grid flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-muted-foreground">
          Checklist não encontrado ou sem permissão para o visualizar.
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: "/home" })}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Voltar ao início
        </button>
      </div>
    );
  }

  return (
    <div className="doc-grid min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => window.history.length > 1 ? navigate({ to: "/home" }) : undefined}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground print:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Início
          </button>
          <div className="flex items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:border-primary/60"
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={exporting}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 font-display text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90 disabled:opacity-60"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Exportar PDF
            </button>
          </div>
        </div>

        <div ref={docRef} className="print-area mt-4">
          <ChecklistDocument value={(row.data ?? {}) as ChecklistData} />
        </div>
      </div>
    </div>
  );
}
