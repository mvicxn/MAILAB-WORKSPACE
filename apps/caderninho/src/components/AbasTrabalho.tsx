"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type AbaDoc = { href: string; titulo: string; tipo: "tarefa" | "projeto" };

const CHAVE = "mai-abas";

function ler(): AbaDoc[] {
  try {
    const raw = sessionStorage.getItem(CHAVE);
    return raw ? (JSON.parse(raw) as AbaDoc[]) : [];
  } catch {
    return [];
  }
}

function gravar(abas: AbaDoc[]) {
  sessionStorage.setItem(CHAVE, JSON.stringify(abas.slice(-12)));
}

export function registrarAba(aba: AbaDoc) {
  const atuais = ler().filter((a) => a.href !== aba.href);
  gravar([...atuais, aba]);
}

export function RegistrarAba(props: AbaDoc) {
  useEffect(() => {
    registrarAba(props);
    window.dispatchEvent(new Event("mai-abas"));
  }, [props.href, props.titulo, props.tipo]);
  return null;
}

export function AbasTrabalho() {
  const path = usePathname();
  const router = useRouter();
  const [abas, setAbas] = useState<AbaDoc[]>([]);

  useEffect(() => {
    const sync = () => setAbas(ler());
    sync();
    window.addEventListener("mai-abas", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("mai-abas", sync);
      window.removeEventListener("storage", sync);
    };
  }, [path]);

  const visiveis = useMemo(() => abas, [abas]);
  if (visiveis.length === 0) {
    return null;
  }

  function fechar(href: string) {
    const resto = ler().filter((a) => a.href !== href);
    gravar(resto);
    setAbas(resto);
    window.dispatchEvent(new Event("mai-abas"));
    if (path === href) {
      const ultima = resto[resto.length - 1];
      router.push(ultima?.href ?? "/painel");
    }
  }

  return (
    <div className="flex min-w-0 flex-1 items-end gap-1 overflow-x-auto px-2 pt-2">
      {visiveis.map((aba) => (
        <span key={aba.href} className={`tab-doc ${path === aba.href ? "on" : ""}`}>
          <Link href={aba.href} className="min-w-0 truncate">
            {aba.titulo}
          </Link>
          <button type="button" aria-label="Fechar" onClick={() => fechar(aba.href)}>
            <X size={12} />
          </button>
        </span>
      ))}
    </div>
  );
}
