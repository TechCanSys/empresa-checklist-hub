import { useRef } from "react";
import type { ReactNode } from "react";
import { ITENS_TECNICOS, NUM_INTERVENCOES, type ChecklistData } from "@/lib/checklist";
import { SignaturePad } from "@/components/SignaturePad";

interface ChecklistDocumentProps {
  value: ChecklistData;
  onChange?: (next: ChecklistData) => void;
}

function SectionTitle({ n, children }: { n: number; children: ReactNode }) {
  return (
    <h2 className="mt-8 rounded bg-paper-foreground px-3 py-2 font-display text-[13px] font-semibold tracking-wide text-paper uppercase">
      {n}. {children}
    </h2>
  );
}

export function ChecklistDocument({ value, onChange }: ChecklistDocumentProps) {
  const readOnly = !onChange;
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (key: string, v: string | boolean) => onChange?.({ ...value, [key]: v });
  const str = (key: string) => (typeof value[key] === "string" ? (value[key] as string) : "");
  const bool = (key: string) => value[key] === true;

  function loadLogo(file: File) {
    const reader = new FileReader();
    reader.onload = () => set("__logo", String(reader.result));
    reader.readAsDataURL(file);
  }

  const inputCls =
    "w-full rounded-none border-b border-paper-line/70 bg-transparent py-1 text-[15px] text-paper-foreground placeholder:text-paper-muted/60 focus:border-primary focus:outline-none disabled:opacity-100";

  return (
    <div className="rounded-xl bg-paper px-4 py-6 text-paper-foreground shadow-xl sm:px-8 sm:py-8">
      {/* Cabeçalho com logo */}
      <div className="flex flex-col gap-4 border-b-2 border-paper-foreground pb-4 sm:flex-row sm:items-center">
        <div
          onClick={() => !readOnly && fileRef.current?.click()}
          className={`flex h-24 w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-paper-muted/50 text-center sm:w-40 ${
            readOnly ? "" : "cursor-pointer hover:border-paper-foreground"
          }`}
          title={readOnly ? undefined : "Clique para enviar o logo"}
        >
          {str("__logo") ? (
            <img src={str("__logo")} alt="Logo" className="h-full w-full object-contain" />
          ) : (
            <span className="px-2 text-xs text-paper-muted">
              LOGO DA EMPRESA{readOnly ? "" : <><br />(clique)</>}
            </span>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) loadLogo(f);
          }}
        />
        <div className="grid flex-1 gap-2 text-sm">
          <input
            data-key="empresaNome"
            readOnly={readOnly}
            value={str("empresaNome")}
            onChange={(e) => set("empresaNome", e.target.value)}
            placeholder="TECH CAN SYSTEMS"
            className={`${inputCls} font-display text-lg font-semibold`}
          />
          <input
            data-key="empresaTelefone"
            readOnly={readOnly}
            value={str("empresaTelefone")}
            onChange={(e) => set("empresaTelefone", e.target.value)}
            placeholder="+258 878088000 | 852637473"
            className={inputCls}
          />
          <input
            data-key="empresaEmail"
            readOnly={readOnly}
            value={str("empresaEmail")}
            onChange={(e) => set("empresaEmail", e.target.value)}
            placeholder="geral@techcansystems.site | Av. FPLM, Muhala-Expansão"
            className={inputCls}
          />
        </div>
      </div>

      <h1 className="mt-6 text-center font-display text-lg font-bold tracking-tight uppercase sm:text-xl">
        Checklist de Manutenção Preventiva — Sistema de CCTV
      </h1>
      <p className="mt-1 text-center text-sm text-paper-muted">
        Verificação técnica periódica do sistema de videovigilância
      </p>

      {/* 1. Identificação */}
      <SectionTitle n={1}>Identificação do Atendimento</SectionTitle>
      <div className="mt-3 grid gap-4 text-sm sm:grid-cols-3">
        <label className="block">
          <span className="text-paper-muted">Cliente:</span>
          <input data-key="cliente" readOnly={readOnly} value={str("cliente")} onChange={(e) => set("cliente", e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-paper-muted">E-mail do cliente:</span>
          <input data-key="clienteEmail" readOnly={readOnly} value={str("clienteEmail")} onChange={(e) => set("clienteEmail", e.target.value)} className={inputCls} placeholder="para envio do relatório" />
        </label>
        <label className="block">
          <span className="text-paper-muted">Local:</span>
          <input data-key="local" readOnly={readOnly} value={str("local")} onChange={(e) => set("local", e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-paper-muted">Data:</span>
          <input data-key="data" readOnly={readOnly} value={str("data")} onChange={(e) => set("data", e.target.value)} placeholder="dd-mm-aaaa" maxLength={10} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-paper-muted">Técnico:</span>
          <input data-key="tecnico" readOnly={readOnly} value={str("tecnico")} onChange={(e) => set("tecnico", e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-paper-muted">Nº da intervenção:</span>
          <input data-key="numIntervencao" readOnly={readOnly} value={str("numIntervencao")} onChange={(e) => set("numIntervencao", e.target.value)} className={inputCls} />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-6 text-sm">
        <span className="text-paper-muted">Periodicidade:</span>
        <label className="flex items-center gap-2">
          <input type="checkbox" data-key="periodTrimestral" checked={bool("periodTrimestral")} disabled={readOnly} onChange={(e) => set("periodTrimestral", e.target.checked)} className="h-4 w-4 accent-primary" />
          Trimestral
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" data-key="periodMensal" checked={bool("periodMensal")} disabled={readOnly} onChange={(e) => set("periodMensal", e.target.checked)} className="h-4 w-4 accent-primary" />
          Mensal
        </label>
      </div>

      {/* 2. Descrição do sistema */}
      <SectionTitle n={2}>Descrição do Sistema</SectionTitle>
      <div className="mt-3 grid gap-4 text-sm sm:grid-cols-4">
        <label className="block">
          <span className="text-paper-muted">Nº de câmeras:</span>
          <input data-key="numCameras" readOnly={readOnly} value={str("numCameras")} onChange={(e) => set("numCameras", e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-paper-muted">DVR/NVR (modelo):</span>
          <input data-key="dvrModelo" readOnly={readOnly} value={str("dvrModelo")} onChange={(e) => set("dvrModelo", e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-paper-muted">HD / Armazenamento:</span>
          <input data-key="hd" readOnly={readOnly} value={str("hd")} onChange={(e) => set("hd", e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-paper-muted">Acesso remoto (app):</span>
          <input data-key="app" readOnly={readOnly} value={str("app")} onChange={(e) => set("app", e.target.value)} className={inputCls} />
        </label>
      </div>

      {/* 3. Verificações técnicas */}
      <SectionTitle n={3}>Verificações Técnicas</SectionTitle>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-[13px]">
          <thead>
            <tr>
              <th className="w-[42%] border border-paper-line bg-paper-muted/10 px-2 py-2 text-center font-semibold">Item verificado</th>
              <th className="w-12 border border-paper-line bg-paper-muted/10 px-1 py-2 text-center font-semibold">OK</th>
              <th className="w-12 border border-paper-line bg-paper-muted/10 px-1 py-2 text-center font-semibold">N/OK</th>
              <th className="w-12 border border-paper-line bg-paper-muted/10 px-1 py-2 text-center font-semibold">N/A</th>
              <th className="border border-paper-line bg-paper-muted/10 px-2 py-2 text-center font-semibold">Observação</th>
            </tr>
          </thead>
          <tbody>
            {ITENS_TECNICOS.map((item, i) => (
              <tr key={i}>
                <td className="border border-paper-line px-2 py-1.5">{item}</td>
                {(["ok", "nok", "na"] as const).map((state) => (
                  <td key={state} className="border border-paper-line px-1 py-1.5 text-center">
                    <input
                      type="checkbox"
                      checked={bool(`t${i}_${state}`)}
                      disabled={readOnly}
                      onChange={(e) => set(`t${i}_${state}`, e.target.checked)}
                      className="mx-auto block h-[18px] w-[18px] accent-primary"
                    />
                  </td>
                ))}
                <td className="border border-paper-line px-1 py-1">
                  <input
                    data-key={`t${i}_obs`}
                    readOnly={readOnly}
                    value={str(`t${i}_obs`)}
                    onChange={(e) => set(`t${i}_obs`, e.target.value)}
                    className="w-full bg-transparent px-1 py-1 text-[13px] focus:outline-none"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Intervenções corretivas */}
      <SectionTitle n={4}>Intervenções Corretivas</SectionTitle>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-[13px]">
          <thead>
            <tr>
              <th className="w-8 border border-paper-line bg-paper-muted/10 px-1 py-2 font-semibold">#</th>
              <th className="border border-paper-line bg-paper-muted/10 px-2 py-2 font-semibold">Descrição do problema</th>
              <th className="border border-paper-line bg-paper-muted/10 px-2 py-2 font-semibold">Ação corretiva realizada</th>
              <th className="w-24 border border-paper-line bg-paper-muted/10 px-2 py-2 font-semibold">Materiais</th>
              <th className="w-20 border border-paper-line bg-paper-muted/10 px-2 py-2 font-semibold">Custo</th>
              <th className="w-16 border border-paper-line bg-paper-muted/10 px-1 py-2 font-semibold">Aprovado</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: NUM_INTERVENCOES }, (_, i) => (
              <tr key={i}>
                <td className="border border-paper-line px-1 py-1.5 text-center">{i + 1}</td>
                {(
                  [
                    ["prob", ""],
                    ["acao", ""],
                    ["pecas", ""],
                    ["custo", "0,00"],
                  ] as const
                ).map(([suffix, placeholder]) => (
                  <td key={suffix} className="border border-paper-line px-1 py-1">
                    <input
                      data-key={`int${i}_${suffix}`}
                      readOnly={readOnly}
                      value={str(`int${i}_${suffix}`)}
                      onChange={(e) => set(`int${i}_${suffix}`, e.target.value)}
                      placeholder={placeholder}
                      className="w-full bg-transparent px-1 py-1 text-[13px] placeholder:text-paper-muted/50 focus:outline-none"
                    />
                  </td>
                ))}
                <td className="border border-paper-line px-1 py-1.5 text-center">
                  <input
                    type="checkbox"
                    checked={bool(`int${i}_aprov`)}
                    disabled={readOnly}
                    onChange={(e) => set(`int${i}_aprov`, e.target.checked)}
                    className="mx-auto block h-[18px] w-[18px] accent-primary"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-paper-muted">
        * Intervenções corretivas e peças são orçadas separadamente, conforme contrato, e executadas somente após aprovação do cliente.
      </p>

      {/* 5. Notas */}
      <SectionTitle n={5}>Notas e Recomendações</SectionTitle>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Observações do técnico:</span>
          <textarea data-key="obsTecnico" readOnly={readOnly} value={str("obsTecnico")} onChange={(e) => set("obsTecnico", e.target.value)} className="min-h-24 w-full rounded-md border border-paper-line bg-transparent p-2 text-[15px] focus:border-primary focus:outline-none" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Recomendações / próximos passos:</span>
          <textarea data-key="recomendacoes" readOnly={readOnly} value={str("recomendacoes")} onChange={(e) => set("recomendacoes", e.target.value)} className="min-h-24 w-full rounded-md border border-paper-line bg-transparent p-2 text-[15px] focus:border-primary focus:outline-none" />
        </label>
      </div>

      {/* 6. Estado geral */}
      <SectionTitle n={6}>Estado Geral do Sistema</SectionTitle>
      <div className="mt-3 flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-3">
        {(
          [
            ["estadoPleno", "Sistema em pleno funcionamento"],
            ["estadoRessalvas", "Funcionando com ressalvas"],
            ["estadoCorretiva", "Necessita intervenção corretiva"],
            ["estadoParado", "Sistema parado"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 rounded-lg border border-paper-line/60 px-3 py-2">
            <input type="checkbox" checked={bool(key)} disabled={readOnly} onChange={(e) => set(key, e.target.checked)} className="h-4 w-4 accent-primary" />
            {label}
          </label>
        ))}
      </div>

      {/* 7. Aprovação */}
      <SectionTitle n={7}>Aprovação</SectionTitle>
      <p className="mt-3 text-sm">
        Declaro que acompanhei a intervenção e que as verificações acima descritas foram realizadas.
      </p>
      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <div>
          <input data-key="nomeTecnico" readOnly={readOnly} value={str("nomeTecnico")} onChange={(e) => set("nomeTecnico", e.target.value)} placeholder="Nome do técnico" className={`${inputCls} mb-2`} />
          <SignaturePad value={str("__assinTec")} disabled={readOnly} onChange={(v) => set("__assinTec", v)} />
          <div className="mt-2 border-t border-paper-foreground pt-2 text-center text-sm">
            <strong>Técnico (Prestador)</strong>
            <br />
            Assinatura
          </div>
        </div>
        <div>
          <input data-key="nomeCliente" readOnly={readOnly} value={str("nomeCliente")} onChange={(e) => set("nomeCliente", e.target.value)} placeholder="Nome do cliente / inspetor" className={`${inputCls} mb-2`} />
          <SignaturePad value={str("__assinCli")} disabled={readOnly} onChange={(v) => set("__assinCli", v)} />
          <div className="mt-2 border-t border-paper-foreground pt-2 text-center text-sm">
            <strong>Cliente / Inspetor</strong>
            <br />
            Assinatura
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
        <label className="block">
          <span className="text-paper-muted">Data da aprovação:</span>
          <input data-key="dataAprovacao" readOnly={readOnly} value={str("dataAprovacao")} onChange={(e) => set("dataAprovacao", e.target.value)} placeholder="dd-mm-aaaa" maxLength={10} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-paper-muted">Hora de início:</span>
          <input data-key="horaInicio" readOnly={readOnly} value={str("horaInicio")} onChange={(e) => set("horaInicio", e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="text-paper-muted">Hora de término:</span>
          <input data-key="horaFim" readOnly={readOnly} value={str("horaFim")} onChange={(e) => set("horaFim", e.target.value)} className={inputCls} />
        </label>
      </div>

      <p className="mt-8 text-center text-sm text-paper-muted">
        Documento gerado para controlo interno e comprovação de manutenção preventiva.
      </p>
    </div>
  );
}
