import { rotuloPresenca, type EstadoPresenca } from "@/lib/presenca";

export function Ponto({ estado, size = 10 }: { estado: EstadoPresenca; size?: number }) {
  return (
    <span
      className={`ponto ${estado}`}
      style={{ width: size, height: size }}
      title={rotuloPresenca(estado)}
    />
  );
}
