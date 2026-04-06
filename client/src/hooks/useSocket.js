import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function useSocket(username) {
  const socketRef = useRef(null);
  const prevConnectionIdsRef = useRef([]);

  const [messages, setMessages] = useState([]);
  const [players, setPlayers] = useState({});
  const [selfId, setSelfId] = useState("");
  const [connections, setConnections] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 2200);

    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!username) return;

    const socket = io(import.meta.env.VITE_SERVER_URL, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSelfId(socket.id);
      socket.emit("player:join", username);
    });

    socket.on("players:update", (data) => {
      setPlayers(data);
    });

    socket.on("connections:update", (nearbyPlayers) => {
      const prevIds = prevConnectionIdsRef.current;
      const nextIds = nearbyPlayers.map((p) => p.id);

      const newlyConnected = nearbyPlayers.filter(
        (p) => !prevIds.includes(p.id)
      );

      const disconnected = prevIds.filter((id) => !nextIds.includes(id));

      if (newlyConnected.length > 0) {
        setToast({
          type: "connected",
          text: `Connected to ${newlyConnected.map((p) => p.name).join(", ")}`,
        });
      } else if (disconnected.length > 0 && nextIds.length === 0) {
        setToast({
          type: "disconnected",
          text: "Disconnected from nearby users",
        });
      }

      prevConnectionIdsRef.current = nextIds;
      setConnections(nearbyPlayers);
    });

    socket.on("chat:message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      prevConnectionIdsRef.current = [];
      setMessages([]);
      setPlayers({});
      setConnections([]);
      setSelfId("");
      setToast(null);
    };
  }, [username]);

  const sendMove = (x, y) => {
    if (!socketRef.current) return;
    socketRef.current.emit("player:move", { x, y });
  };

  return {
    socket: socketRef.current,
    messages,
    players,
    selfId,
    connections,
    toast,
    sendMove,
  };
}