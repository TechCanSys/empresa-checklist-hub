export type ChecklistData = Record<string, string | boolean>;

export const ITENS_TECNICOS = [
  "Funcionamento de todas as câmeras (imagem)",
  "Limpeza das lentes e domos",
  "Focagem e enquadramento/ângulo",
  "Visão noturna / IR",
  "Gravação e reprodução de imagens",
  "Armazenamento / espaço em HD",
  "Data e hora do sistema",
  "Conexões e cabeamento (físico)",
  "Alimentação / fonte / UPS",
  "Rede / switch / conectividade",
  "Acesso remoto (app / DVR / NVR)",
  "Atualização de configurações",
  "Fixação física de câmeras e suportes",
  "Limpeza geral do rack / gabinete",
] as const;

export const NUM_INTERVENCOES = 4;

export function emptyChecklistData(profile?: {
  company_name?: string | null;
  phone?: string | null;
  logo_url?: string | null;
}): ChecklistData {
  const data: ChecklistData = {
    empresaNome: profile?.company_name || "TECH CAN SYSTEMS",
    empresaTelefone: profile?.phone || "+258 878088000 | 852637473",
    empresaEmail: "geral@techcansystems.site | Av. FPLM, Muhala-Expansão",
    data: "",
    dataAprovacao: "",
  };
  if (profile?.logo_url) data["__logo"] = profile.logo_url;
  return data;
}

export interface ChecklistRow {
  id: string;
  created_by: string;
  client_name: string;
  client_email: string;
  intervention_number: string;
  status: string;
  data: ChecklistData;
  created_at: string;
  updated_at: string;
}

export function formatDatePt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Exporta um elemento HTML para PDF A4, paginado quando necessário. */
export async function exportChecklistPdf(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const imgData = canvas.toDataURL("image/jpeg", 0.92);

  if (imgHeight <= pageHeight) {
    pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
  } else {
    let rendered = 0;
    while (rendered < imgHeight) {
      const sliceHeight = Math.min(imgHeight - rendered, pageHeight);
      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = Math.round(
        (canvas.height * sliceHeight) / imgHeight,
      );
      const ctx = sliceCanvas.getContext("2d")!;
      ctx.drawImage(
        canvas,
        0,
        Math.round((canvas.height * rendered) / imgHeight),
        canvas.width,
        sliceCanvas.height,
        0,
        0,
        sliceCanvas.width,
        sliceCanvas.height,
      );
      if (rendered > 0) pdf.addPage();
      pdf.addImage(
        sliceCanvas.toDataURL("image/jpeg", 0.92),
        "JPEG",
        0,
        0,
        imgWidth,
        sliceHeight,
      );
      rendered += sliceHeight;
    }
  }

  pdf.save(filename);
}
