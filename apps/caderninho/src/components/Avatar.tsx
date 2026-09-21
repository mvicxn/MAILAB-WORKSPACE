import { iniciais } from "@/lib/datas";

export function Avatar({
  nome,
  tipo = "humano",
  size = 32,
}: {
  nome: string;
  tipo?: string;
  size?: number;
}) {
  return (
    <span
      className={`avatar ${tipo === "ia" ? "ia" : ""}`}
      style={{ width: size, height: size, fontSize: size < 30 ? "0.62rem" : "0.72rem" }}
      title={nome}
    >
      {iniciais(nome)}
    </span>
  );
}
