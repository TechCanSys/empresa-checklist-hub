import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — TechCan Systems" },
      {
        name: "description",
        content: "Entrar ou criar conta no sistema de checklists TechCan Systems.",
      },
      { property: "og:title", content: "Entrar — TechCan Systems" },
      {
        property: "og:description",
        content: "Entrar ou criar conta no sistema de checklists TechCan Systems.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [busy, setBusy] = useState(false);
  const [sentConfirmation, setSentConfirmation] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] = useState<"empresa" | "cliente">("empresa");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");

  // Already signed in? go straight home.
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) navigate({ to: "/home", replace: true });
    });
  }, [navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error("Não foi possível entrar", { description: error.message });
      return;
    }
    navigate({ to: "/home", replace: true });
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
          account_type: accountType,
          company_name: accountType === "empresa" ? companyName : "",
          phone,
        },
      },
    });
    setBusy(false);
    if (error) {
      toast.error("Não foi possível criar a conta", { description: error.message });
      return;
    }
    setSentConfirmation(true);
  }

  async function handleSocial(provider: "google" | "lovable") {
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Não foi possível entrar", { description: result.error.message });
      return;
    }
    if (result.redirected) return; // browser is navigating to the provider
    navigate({ to: "/home", replace: true });
  }

  if (sentConfirmation) {
    return (
      <div className="doc-grid flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-xl font-semibold text-foreground">
            Confirme o seu e-mail
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enviámos um link de confirmação para <strong className="text-foreground">{email}</strong>.
            Abra o link para ativar a conta e depois entre.
          </p>
          <Button
            variant="secondary"
            className="mt-6 w-full"
            onClick={() => {
              setSentConfirmation(false);
              setMode("login");
            }}
          >
            Voltar ao início de sessão
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="doc-grid flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-base font-semibold tracking-[0.15em] text-foreground uppercase">
              TechCan Systems
            </p>
            <p className="text-xs text-muted-foreground">Checklist CCTV</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
            {(["login", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-md py-2 font-display text-sm font-semibold transition ${
                  mode === m
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "login" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="o-seu@email.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Palavra-passe</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" disabled={busy} className="w-full font-display font-semibold">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Tipo de conta</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { value: "empresa", label: "Empresa", hint: "Preenche checklists" },
                      { value: "cliente", label: "Cliente", hint: "Consulta relatórios" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAccountType(opt.value)}
                      className={`rounded-lg border p-3 text-left transition ${
                        accountType === opt.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-foreground/30"
                      }`}
                    >
                      <span className="block font-display text-sm font-semibold text-foreground">
                        {opt.label}
                      </span>
                      <span className="block text-xs text-muted-foreground">{opt.hint}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="O seu nome"
                />
              </div>
              {accountType === "empresa" && (
                <div className="space-y-1.5">
                  <Label htmlFor="companyName">Nome da empresa</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex.: TECH CAN SYSTEMS"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+258 …"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="su-email">E-mail</Label>
                <Input
                  id="su-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="o-seu@email.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="su-password">Palavra-passe</Label>
                <Input
                  id="su-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 8 caracteres"
                />
              </div>
              <Button type="submit" disabled={busy} className="w-full font-display font-semibold">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar conta"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Vai receber um e-mail para confirmar a conta antes de entrar.
              </p>
            </form>
          )}

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-2">
            <Button type="button" variant="secondary" onClick={() => handleSocial("google")}>
              Continuar com Google
            </Button>
            <Button type="button" variant="secondary" onClick={() => handleSocial("lovable")}>
              Continuar com Lovable
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
