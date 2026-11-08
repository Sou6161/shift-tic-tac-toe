# Shift TicTacToe

A modern multiplayer TicTacToe game with a twist, built for the Appwrite Hackathon. Experience real-time gameplay with smooth animations and an engaging user interface.


## 🎮 Live Demo

Play the game at: [Shift TicTacToe](https://shift-tic-tac-toe.vercel.app/)

## ✨ Features

- Real-time multiplayer gameplay powered by Socket.IO
- Modern, animated user interface
- Live player status and game state updates
- Responsive design for all devices
- Smooth scrolling and transitions
- Game room creation and joining functionality
- Real-time chat between players
- Score tracking and game history

## 🛠️ Technologies Used

- **ReactJS** - Frontend framework
- **JavaScript (ES6+)** - Programming language
- **Socket.IO** - Real-time bidirectional event-based communication
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lenis** - Smooth scroll library
- **Vite** - Next generation frontend tooling
- **Zustand** - Sign-in state shared across the app
- **Node.js + Express** - REST API for accounts and game results (`server/`)
- **PostgreSQL** - Accounts, stats, game history and the discussion board (Neon in production)

## 🎯 Game Rules

1. Traditional TicTacToe rules apply
2. Players take turns marking spaces on a 3x3 grid
3. First player to get three in a row (horizontally, vertically, or diagonally) wins
4. Added twist: The game features a dynamic shifting mechanism where board positions can be strategically moved, adding a layer of strategy beyond traditional TicTacToe. Players must adapt their strategies as the board state changes, with win conditions being continuously evaluated against shifted positions.

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or newer
- PostgreSQL running locally (e.g. `brew install postgresql@17`)

### Run it locally

1. Install dependencies for the site and the server
```bash
npm install
cd server && npm install && cd ..
```

2. Create the local database and the server's env file
```bash
createdb shift_dev
cp server/.env.example server/.env
```

3. Start the backend (port 4000). It creates its tables on first start.
```bash
cd server && npm run dev
```

4. In a second terminal, start the site
```bash
npm run dev
```

5. Open `http://localhost:5173`. Vite forwards `/api` and `/socket.io` to the backend, so no CORS setup is needed locally.

### Backend tests

```bash
createdb shift_test   # once
cd server && npm test
```

The tests wipe and rebuild the `shift_test` database (or `TEST_DATABASE_URL`), never the one in `.env`.

## ☁️ Deployment

| Part | Where | Notes |
| --- | --- | --- |
| Site | Vercel | Set `VITE_API_URL` to the Render URL |
| Backend (`server/`) | Render web service | `render.yaml` describes it |
| Database | Neon | Connection string goes in Render's `DATABASE_URL` |

**Backend env vars on Render**

| Name | Value |
| --- | --- |
| `DATABASE_URL` | Neon connection string, including `?sslmode=require` |
| `CLIENT_ORIGINS` | `https://shift-tic-tac-toe.vercel.app,http://localhost:5173` |
| `NODE_ENV` | `production` |

The server applies database migrations from `server/migrations/` every time it starts, so a fresh Neon database needs no manual setup.

## 🎨 Features in Detail

### Multiplayer Support
- Real-time game state synchronization
- Player presence detection
- Room-based matchmaking
- Instant move updates

### User Interface
- Responsive design
- Smooth animations
- Interactive elements
- Game status indicators
- Player statistics

## 🏆 Hackathon Submission

This project was created for the Appwrite Hackathon. Key highlights:
- Originally built on Appwrite auth; now runs on its own Node.js + PostgreSQL backend
- Real-time multiplayer functionality
- Modern web technologies
- Engaging user experience


## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Appwrite team for hosting the hackathon
- Socket.IO for real-time capabilities
- The open-source community

---

Made with ❤️ by Sourabh
