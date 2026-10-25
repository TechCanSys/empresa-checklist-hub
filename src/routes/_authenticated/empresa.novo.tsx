import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  ChecklistDocument,
} from "@/components/ChecklistDocument";
import {
  deriveStatus,
  emptyChecklistData,
  type ChecklistData,
} from "@/lib/checklist";

export const Route = createFileRoute("/_authenticated/empresa/novo")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Novo checklist — TechCan Systems" },
      {
        name: "description",
        content:
          "Preencher e guardar um novo checklist de manutenção preventiva CCTV.",
      },
    ],
  }),
  component: NovoChecklist,
});

function NovoChecklist() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ChecklistData | null>(null);

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sem sessão");
      const [{ data: profile }, { data: isEmpresa }] = await Promise.all([
        supabase
          .from("profiles")
          .select("company_name, phone, logo_url")
          .eq("id", user.id)
          .single(),
        supabase.rpc("has_role", { _user_id: user.id, _role: "empresa" }),
      ]);
      return { user, profile, isEmpresa: !!isEmpresa };
    },
  });

  useEffect(() => {
    if (!data && meQuery.data) {
      setData(emptyChecklistData(meQuery.data.profile ?? undefined));
    }
  }, [data, meQuery.data]);

  async function handleSave() {
    if (!meQuery.data || !data) return;
    if (!meQuery.data.isEmpresa) {
      toast.error("Apenas contas de empresa podem guardar checklists", {
        description: "Crie uma conta do tipo Empresa para usar esta área.",
      });
      return;
    }
    if (!data["cliente"]) {
      toast.error("Indique o nome do cliente antes de guardar");
      return;
    }
    setSaving(true);
    const { data: inserted, error } = await supabase
      .from("checklists")
      .insert({
        created_by: meQuery.data.user.id,
        client_name: String(data["cliente"] ?? ""),
        client_email: String(data["clienteEmail"] ?? ""),
        client_user_id: null,
        intervention_number: String(data["numIntervencao"] ?? ""),
        status: deriveStatus(data),
        data,
      })
      .select("id")
      .single();
    setSaving(false);
    if (error || !inserted) {
      toast.error("Não foi possível guardar", {
        description: error?.message ?? "Tente novamente.",
      });
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["checklists"] });
    navigate({ to: "/checklist/$id", params: { id: inserted.id } });
  }

  return (
    <div className="doc-grid min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/empresa" })}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !data || meQuery.isLoading}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 font-display text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar checklist
          </button>
        </div>

        {meQuery.isLoading || !data || !meQuery.data ? (
          <div className="mt-20 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !meQuery.data.isEmpresa ? (
          <div className="mt-10 rounded-2xl border border-border bg-card p-10 text-center">
            <p className="font-display text-base font-semibold text-foreground">
              Esta área requer conta de empresa
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              A sua conta está registada como Cliente. Para preencher
              checklists, crie uma conta do tipo Empresa.
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <ChecklistDocument value={data} onChange={(next) => setData(next)} />
          </div>
        )}
      </div>
    </div>
  );
}
