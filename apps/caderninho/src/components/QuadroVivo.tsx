"use client";

import { useEffect, useRef } from "react";
import { Tldraw, getSnapshot, loadSnapshot } from "tldraw";
import type { Editor } from "tldraw";
import "tldraw/tldraw.css";

import { salvarQuadro } from "@/app/actions";

type Props = {
  sala: string;
  snapshotInicial: string;
};

export function QuadroVivo({ sala, snapshotInicial }: Props) {
  const editorRef = useRef<Editor | null>(null);
  const skip = useRef(false);

  useEffect(() => {
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(
      `${proto}://${window.location.hostname}:5858/?sala=${encodeURIComponent(sala)}`,
    );
    let timer: number | null = null;

    ws.onmessage = (event) => {
      const editor = editorRef.current;
      if (!editor) {
        return;
      }
      try {
        const payload = JSON.parse(String(event.data)) as {
          type: string;
          snapshot: unknown;
        };
        if (payload.type !== "snap" || !payload.snapshot) {
          return;
        }
        skip.current = true;
        loadSnapshot(editor.store, payload.snapshot as never);
        skip.current = false;
      } catch {
        skip.current = false;
      }
    };

    const push = () => {
      const editor = editorRef.current;
      if (!editor || skip.current) {
        return;
      }
      const snapshot = getSnapshot(editor.store);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "snap", snapshot }));
      }
      if (timer) {
        window.clearTimeout(timer);
      }
      timer = window.setTimeout(() => {
        void salvarQuadro(sala, JSON.stringify(snapshot));
      }, 1000);
    };

    const interval = window.setInterval(() => {
      if (editorRef.current && !skip.current) {
        push();
      }
    }, 1200);

    return () => {
      window.clearInterval(interval);
      if (timer) {
        window.clearTimeout(timer);
      }
      ws.close();
    };
  }, [sala]);

  return (
    <div className="tldraw-casa">
      <Tldraw
        onMount={(editor) => {
          editorRef.current = editor;
          if (snapshotInicial) {
            try {
              loadSnapshot(editor.store, JSON.parse(snapshotInicial));
            } catch {
              // quadro em branco
            }
          }
        }}
      />
    </div>
  );
}
