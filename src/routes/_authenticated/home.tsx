import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Loader2, LogOut, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/home")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Início — TechCan Systems" },
      {
        name: "description",
        content: "Escolha a área: Cliente ou Empresa.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) throw new Error("Sem sessão");
      const [{ data: profile }, { data: isEmpresa }] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, company_name")
          .eq("id", user.id)
          .single(),
        supabase.rpc("has_role", { _user_id: user.id, _role: "empresa" }),
      ]);
      return { user, profile, isEmpresa: !!isEmpresa };
    },
  });

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const me = meQuery.data;

  return (
    <div className="doc-grid flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">
            TC
          </div>
          <div>
            <p className="font-display text-sm font-semibold tracking-[0.15em] text-foreground uppercase">
              TechCan Systems
            </p>
            <p className="text-xs text-muted-foreground">Checklist CCTV</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition hover:border-destructive/50 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        {meQuery.isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : meQuery.isError || !me ? (
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar os seus dados. Tente novamente.
          </p>
        ) : (
          <div className="w-full max-w-2xl">
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                Olá, {me.profile?.full_name || me.user.email?.split("@")[0]}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Escolha a área a que quer aceder:
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate({ to: "/cliente" })}
                className="group rounded-2xl border border-border bg-card p-6 text-left transition hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent transition group-hover:bg-accent group-hover:text-accent-foreground">
                  <Users className="h-6 w-6" />
                </div>
                <h2 className="mt-4 font-display text-lg font-semibold text-foreground">
                  Cliente
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Consulte os relatórios de manutenção preventiva enviados para o
                  seu e-mail.
                </p>
                <span className="mt-4 inline-block font-display text-sm font-semibold text-accent">
                  Abrir →
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate({ to: "/empresa" })}
                className="group rounded-2xl border border-border bg-card p-6 text-left transition hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Building2 className="h-6 w-6" />
                </div>
                <h2 className="mt-4 font-display text-lg font-semibold text-foreground">
                  Empresa
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Preencha o checklist de manutenção preventiva, guarde e exporte
                  em PDF.
                </p>
                {!me.isEmpresa && (
                  <span className="mt-2 inline-block text-xs text-muted-foreground">
                    Requer conta de empresa
                  </span>
                )}
                <span className="mt-4 inline-block font-display text-sm font-semibold text-primary">
                  Abrir →
                </span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
