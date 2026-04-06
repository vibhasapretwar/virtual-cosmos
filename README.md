# Virtual Cosmos 🌌

A real-time 2D virtual space where users can move around and interact with each other based on proximity. When users come close, a chat connects. When they move away, the chat disconnects.

🔗 **Live Demo:** [virtual-cosmos.vercel.app](https://virtual-cosmos.vercel.app)

---

## Features

- **2D Canvas** — Rendered with PixiJS, grid-based environment with smooth player movement
- **Real-time Multiplayer** — All players visible and synced in real time via Socket.IO
- **Proximity Detection** — Automatic connect/disconnect based on distance between players
- **Proximity Chat** — Chat panel appears when users are close, disappears when they move apart
- **Message Bubbles** — Floating speech bubbles appear above players when they send messages
- **Session Tracking** — MongoDB stores join/leave sessions and chat history
- **Toast Notifications** — Visual feedback when connections are made or broken

---

## Tech Stack

### Frontend
| Tech | Purpose |
|---|---|
| React + Vite | UI framework |
| PixiJS v8 | 2D canvas rendering |
| Socket.IO Client | Real-time communication |
| Tailwind CSS | Styling |

### Backend
| Tech | Purpose |
|---|---|
| Node.js + Express | Server |
| Socket.IO | WebSocket server |
| MongoDB + Mongoose | Session and message persistence |

---

## Project Structure

```
virtual-cosmos/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── GameCanvas.jsx       # PixiJS canvas wrapper
│   │   │   ├── ChatPanel.jsx        # Proximity chat UI
│   │   │   └── UsernameModal.jsx    # Entry screen
│   │   ├── hooks/
│   │   │   └── useSocket.js         # All socket logic
│   │   ├── game/
│   │   │   ├── PixiApp.js           # PixiJS app, game loop, movement
│   │   │   └── PlayerSprite.js      # Player avatar + message bubbles
│   │   ├── shared/
│   │   │   └── constants.js         # Shared constants (radius, canvas size)
│   │   └── App.jsx
│   └── package.json
└── server/                  # Node.js backend
    ├── index.js             # Express + Socket.IO server
    ├── constants.js         # Server-side constants
    └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)

### 1. Clone the repository
```bash
git clone https://github.com/vibhasapretwar/virtual-cosmos.git
cd virtual-cosmos
```

### 2. Setup the server
```bash
cd server
npm install
```

Create `server/.env`:
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/virtual-cosmos
PORT=3001
```

Start the server:
```bash
npm run dev
```

### 3. Setup the client
```bash
cd client
npm install
```

Create `client/.env.development`:
```
VITE_SERVER_URL=http://localhost:3001
```

Start the client:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in multiple tabs to test multiplayer.

---

## How It Works

1. User enters a name and joins the cosmos
2. A random spawn position is assigned
3. Move using **WASD** or **Arrow keys**
4. When two players come within the proximity radius (~150px), a chat panel appears
5. Messages are sent only to nearby players
6. Moving away closes the chat automatically

---

## Deployment

| Service | Purpose |
|---|---|
| Vercel | Frontend (client/) |
| Render | Backend (server/) — required for WebSocket support |
| MongoDB Atlas | Database |

### Environment variables on Vercel
```
VITE_SERVER_URL=https://your-render-server.onrender.com
```

### Environment variables on Render
```
MONGO_URI=mongodb+srv://...
PORT=3001
```

---

## API

### REST
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/history/:roomKey` | Fetch last 50 messages for a proximity room |

### Socket Events

**Client → Server**
| Event | Payload | Description |
|---|---|---|
| `player:join` | `name: string` | Join the cosmos |
| `player:move` | `{ x, y }` | Update position |
| `chat:message` | `{ text }` | Send a message to nearby players |

**Server → Client**
| Event | Payload | Description |
|---|---|---|
| `players:update` | `players object` | Full player state |
| `connections:update` | `nearby players[]` | Current proximity connections |
| `chat:message` | `{ username, text, time }` | Incoming chat message |

---

## License

MIT

## Author 
Vibhas Apretwar
