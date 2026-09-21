"use client";

import { useState, useTransition } from "react";

import { toast } from "@/components/Toast";

export function FormMai({
  action,
  children,
  className,
  ok = "Guardado.",
}: {
  action: (data: FormData) => Promise<{ ok?: boolean; erro?: string } | void>;
  children: React.ReactNode;
  className?: string;
  ok?: string;
}) {
  const [erro, setErro] = useState("");
  const [pending, start] = useTransition();
  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          setErro("");
          const r = await action(fd);
          if (r && "erro" in r && r.erro) {
            setErro(r.erro);
            toast(r.erro, "erro");
            return;
          }
          toast(ok);
        });
      }}
    >
      {children}
      {erro ? <p className="text-sm text-[var(--danger)]">{erro}</p> : null}
      {pending ? <p className="text-xs text-[var(--mute)]">Salvando…</p> : null}
    </form>
  );
}
