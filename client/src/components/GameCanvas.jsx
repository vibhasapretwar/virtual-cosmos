import { useEffect, useRef } from "react";
import { PixiApp } from "../game/PixiApp";

export default function GameCanvas({ selfId, players, messages, onMove }) {
  const mountRef = useRef(null);
  const appRef = useRef(null);
  const prevPlayers = useRef({});
  const readyRef = useRef(false);
  const initRef = useRef(false);
  const pendingRef = useRef(null);
  const lastMessageIdRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || initRef.current) return;
    initRef.current = true;

    const pixi = new PixiApp(onMove);
    appRef.current = pixi;

    pixi
      .init(container)
      .then(() => {
        readyRef.current = true;

        if (pendingRef.current) {
          const { players, selfId } = pendingRef.current;
          syncPlayers(pixi, {}, players, selfId);
          prevPlayers.current = { ...players };
          pendingRef.current = null;
        }
      })
      .catch((err) => console.error("Pixi init error:", err));

    return () => {
      readyRef.current = false;
      pixi.destroy();
    };
  }, []);

  useEffect(() => {
    const pixi = appRef.current;
    if (!selfId) return;

    if (!pixi || !readyRef.current) {
      pendingRef.current = { players, selfId };
      return;
    }

    syncPlayers(pixi, prevPlayers.current, players, selfId);
    prevPlayers.current = { ...players };
  }, [players, selfId]);

  useEffect(() => {
    const pixi = appRef.current;
    if (!pixi || !readyRef.current || !messages?.length) return;

    const latest = messages[messages.length - 1];
    if (!latest || latest.id === lastMessageIdRef.current) return;

    lastMessageIdRef.current = latest.id;
    pixi.showMessage(latest.username, latest.text);
  }, [messages]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full"
      style={{ minHeight: "100vh", overflow: "hidden" }}
    />
  );
}

function syncPlayers(pixi, prev, curr, selfId) {
  for (const [id, p] of Object.entries(curr)) {
    if (!prev[id]) {
      pixi.addPlayer(id, p.name, p.x, p.y, id === selfId);
    } else {
      pixi.movePlayer(id, p.x, p.y);
    }
  }

  for (const id of Object.keys(prev)) {
    if (!curr[id]) {
      pixi.removePlayer(id);
    }
  }
}