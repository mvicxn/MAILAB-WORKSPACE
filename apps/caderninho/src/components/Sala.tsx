"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sala({
  base,
  itens,
}: {
  base: string;
  itens: readonly (readonly [string, string])[];
}) {
  const path = usePathname();
  return (
    <nav className="sala">
      {itens.map(([label, sufixo]) => {
        const href = `${base}${sufixo}`;
        const on = sufixo === "" ? path === base : path.startsWith(href);
        return (
          <Link key={href} href={href} className={on ? "on" : ""}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
