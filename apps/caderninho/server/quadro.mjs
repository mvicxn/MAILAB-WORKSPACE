import { WebSocketServer } from "ws";

const port = Number(process.env.QUADRO_WS_PORT || 5858);
const wss = new WebSocketServer({ port, host: "127.0.0.1" });
const rooms = new Map();

wss.on("connection", (socket, req) => {
  const host = req.headers.host || "localhost";
  const url = new URL(req.url || "/", `http://${host}`);
  const sala = url.searchParams.get("sala") || "geral";
  if (!rooms.has(sala)) {
    rooms.set(sala, new Set());
  }
  const peers = rooms.get(sala);
  peers.add(socket);

  socket.on("message", (raw) => {
    for (const peer of peers) {
      if (peer !== socket && peer.readyState === 1) {
        peer.send(raw);
      }
    }
  });

  socket.on("close", () => {
    peers.delete(socket);
    if (peers.size === 0) {
      rooms.delete(sala);
    }
  });
});

console.log(`Quadro ao vivo na porta ${port}`);
