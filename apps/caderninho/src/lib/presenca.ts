export const ONLINE_MS = 90_000;
export const AUSENTE_MS = 15 * 60_000;

export type EstadoPresenca = "online" | "ausente" | "campo" | "mesa" | "off";

export function estadoPresenca(
  vistoAt: Date | string | null | undefined,
  opts?: { ia?: boolean; emCampo?: boolean; rotina?: boolean },
): EstadoPresenca {
  if (opts?.ia) {
    if (opts.emCampo) {
      return "campo";
    }
    if (opts.rotina) {
      return "mesa";
    }
    return "off";
  }
  if (!vistoAt) {
    return "off";
  }
  const t = typeof vistoAt === "string" ? Date.parse(vistoAt) : vistoAt.getTime();
  if (!Number.isFinite(t)) {
    return "off";
  }
  const d = Date.now() - t;
  if (d <= ONLINE_MS) {
    return "online";
  }
  if (d <= AUSENTE_MS) {
    return "ausente";
  }
  return "off";
}

export function rotuloPresenca(estado: EstadoPresenca) {
  if (estado === "online") {
    return "Online";
  }
  if (estado === "ausente") {
    return "Ausente";
  }
  if (estado === "campo") {
    return "Em campo";
  }
  if (estado === "mesa") {
    return "Na mesa";
  }
  return "Offline";
}
