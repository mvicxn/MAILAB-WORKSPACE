export const EMPRESA = "mai";

export const vivo = { deletedAt: null, empresaId: EMPRESA } as const;

export function daCasa<T extends Record<string, unknown>>(extra: T = {} as T) {
  return { empresaId: EMPRESA, deletedAt: null, ...extra };
}
