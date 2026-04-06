import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { PROXIMITY_RADIUS } from "./constants.js";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const players = {};
const connections = {};

app.get("/", (req, res) => {
  res.send("Virtual Cosmos server is running");
});

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function recomputeConnections() {
  for (const id of Object.keys(players)) {
    connections[id] = [];
  }

  const ids = Object.keys(players);

  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const id1 = ids[i];
      const id2 = ids[j];

      const p1 = players[id1];
      const p2 = players[id2];

      if (!p1 || !p2) continue;

      const dist = distance(p1, p2);

      if (dist <= PROXIMITY_RADIUS) {
        connections[id1].push(id2);
        connections[id2].push(id1);
      }
    }
  }
}

function emitConnections() {
  for (const socketId of Object.keys(players)) {
    const nearbyIds = connections[socketId] || [];

    const nearbyPlayers = nearbyIds
      .map((id) => players[id])
      .filter(Boolean)
      .map((p) => ({
        id: p.id,
        name: p.name,
        x: p.x,
        y: p.y,
      }));

    io.to(socketId).emit("connections:update", nearbyPlayers);
  }
}

function updateWorldState() {
  recomputeConnections();
  io.emit("players:update", players);
  emitConnections();
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("player:join", (name) => {
    const safeName =
      typeof name === "string" && name.trim() ? name.trim() : "Anonymous";

    const randomX = Math.floor(Math.random() * 700) + 80;
    const randomY = Math.floor(Math.random() * 450) + 80;

    players[socket.id] = {
      id: socket.id,
      name: safeName,
      x: randomX,
      y: randomY,
    };

    connections[socket.id] = [];

    console.log(`${safeName} joined`);

    updateWorldState();

    io.emit("chat:message", {
      id: Date.now(),
      username: "System",
      text: `${safeName} joined the cosmos`,
      time: new Date().toLocaleTimeString(),
    });
  });

  socket.on("player:move", ({ x, y }) => {
    if (!players[socket.id]) return;

    players[socket.id].x = x;
    players[socket.id].y = y;

    updateWorldState();
  });

  socket.on("chat:message", (msg) => {
    if (!players[socket.id]) return;

    const text = typeof msg?.text === "string" ? msg.text.trim() : "";
    if (!text) return;

    const nearbyIds = connections[socket.id] || [];
    if (nearbyIds.length === 0) return;

    const finalMessage = {
      id: Date.now(),
      username: players[socket.id].name,
      text,
      time: new Date().toLocaleTimeString(),
    };

    io.to(socket.id).emit("chat:message", finalMessage);

    for (const nearbyId of nearbyIds) {
      io.to(nearbyId).emit("chat:message", finalMessage);
    }
  });

  socket.on("disconnect", () => {
    const disconnectedPlayer = players[socket.id];

    if (disconnectedPlayer) {
      io.emit("chat:message", {
        id: Date.now(),
        username: "System",
        text: `${disconnectedPlayer.name} left the cosmos`,
        time: new Date().toLocaleTimeString(),
      });

      delete players[socket.id];
      delete connections[socket.id];

      for (const id of Object.keys(connections)) {
        connections[id] = connections[id].filter(
          (nearbyId) => nearbyId !== socket.id
        );
      }

      updateWorldState();
      console.log("User disconnected:", disconnectedPlayer.name);
    } else {
      console.log("User disconnected:", socket.id);
    }
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});