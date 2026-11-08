  import React, { useState, useEffect } from "react";
  import io from "socket.io-client";
  import { SOCKET_URL } from "../lib/api";
  // import GameEndPopup from "./GameEndPopup";
  import OpponentGameEndPopup from "./OpponentGameEndPopup";
  import { Copy, Check, ArrowLeft, ArrowRight } from "lucide-react";
  import Board, { Piece } from "./Board";

  import { useAuthStore } from "../store/authStore";

  // One shared connection. The auth callback runs on every (re)connect, so a
  // signed-in player's token always reaches the server; signing in or out
  // later is pushed with "authenticate". Guests can still play.
  const socket = io(SOCKET_URL, {
    auth: (cb) => cb({ token: useAuthStore.getState().token }),
  });
  useAuthStore.subscribe((state, prev) => {
    if (state.token !== prev.token) socket.emit("authenticate", state.token);
  });

  const TicTacToeShift = ({ isDark, onBack }) => {
    const [copied, setCopied] = useState(false);
    const [name, setName] = useState("");
    const [room, setRoom] = useState("");
    const [gameState, setGameState] = useState("initial");
    const [board, setBoard] = useState(Array(9).fill(null));
    const [currentPlayer, setCurrentPlayer] = useState("X");
    const [winner, setWinner] = useState(null);
    const [moveCount, setMoveCount] = useState(0);
    const [roomCode, setRoomCode] = useState("");
    const [isCreator, setIsCreator] = useState(false);
    const [opponentName, setOpponentName] = useState("");
    const [selectedCell, setSelectedCell] = useState(null);
    const [timer, setTimer] = useState(20);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [timerActive, setTimerActive] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [notice, setNotice] = useState("");

    const [myMoves, setMyMoves] = useState([]);
    const [opponentMoves, setOpponentMoves] = useState([]);
    const [myMoveCount, setMyMoveCount] = useState(0);
    const [opponentMoveCount, setOpponentMoveCount] = useState(0);
    const [playerMoves, setPlayerMoves] = useState({ X: [], O: [] });
    const [showRoomControls, setShowRoomControls] = useState(false);

    const handleBack = () => {
      // Reset necessary state
      setGameState("initial");
      setBoard(Array(9).fill(null));
      setWinner(null);
      setMoveCount(0);
      setMyMoves([]);
      setOpponentMoves([]);
      setMyMoveCount(0);
      setOpponentMoveCount(0);
      setShowPopup(false);

      // Emit a leave room event if needed
      socket.emit("leaveRoom", roomCode);

      // Reset room-related state
      setRoomCode("");
      setOpponentName("");
      setIsCreator(false);
    };

    const handleRematch = () => {
      // Reset game state for creator
      setGameState("playing");
      setBoard(Array(9).fill(null));
      setCurrentPlayer("X");
      setWinner(null);
      setMoveCount(0);
      setTimer(20);
      setIsMyTurn(isCreator);
      setTimerActive(isCreator);
      setSelectedCell(null);
      setMyMoves([]);
      setOpponentMoves([]);
      setMyMoveCount(0);
      setOpponentMoveCount(0);
      setShowPopup(false);

      // Emit rematch event to server
      socket.emit("rematch", { room: roomCode });
    };

    const handleNameSubmit = (e) => {
      e.preventDefault();
      if (name.trim()) {
        setShowRoomControls(true);
      }
    };

    const handleLeaveRoom = () => {
      socket.emit("leaveRoom", roomCode);
      // Reset all necessary state variables
      setRoomCode("");
      setOpponentName("");
      setGameState("initial");
      setShowPopup(false);
      setShowRoomControls(false); // Reset room controls visibility
      setName(""); // Clear the name input
      setRoom(""); // Clear the room input
      // Reset game-related states
      setBoard(Array(9).fill(null));
      setCurrentPlayer("X");
      setWinner(null);
      setMoveCount(0);
      setMyMoves([]);
      setOpponentMoves([]);
      setMyMoveCount(0);
      setOpponentMoveCount(0);
      setIsCreator(false);
    };

    const handleCreateRoom = () => {
      socket.emit("createRoom", name);
    };

    // Errors and notices from the server (wrong code, room full, host left…)
    useEffect(() => {
      const onRoomError = (message) => setNotice(message);
      const onRoomClosed = (message) => {
        setNotice(message);
        setGameState("initial");
        setRoomCode("");
        setOpponentName("");
        setIsCreator(false);
        setWinner(null);
        setBoard(Array(9).fill(null));
        setMoveCount(0);
        setMyMoves([]);
      };
      const onStats = (user) => useAuthStore.getState().setUser(user);
      const onConnectError = () => setNotice("Can't reach the game server. Retrying…");
      const onConnect = () => setNotice((n) => (n.startsWith("Can't reach") ? "" : n));
      socket.on("roomError", onRoomError);
      socket.on("roomClosed", onRoomClosed);
      socket.on("statsUpdated", onStats);
      socket.on("connect_error", onConnectError);
      socket.on("connect", onConnect);
      return () => {
        socket.off("roomError", onRoomError);
        socket.off("roomClosed", onRoomClosed);
        socket.off("statsUpdated", onStats);
        socket.off("connect_error", onConnectError);
        socket.off("connect", onConnect);
      };
    }, []);

    // Clear a notice after a few seconds
    useEffect(() => {
      if (!notice || notice.startsWith("Can't reach")) return;
      const t = setTimeout(() => setNotice(""), 4000);
      return () => clearTimeout(t);
    }, [notice]);

    // Leaving the page section (Back) shouldn't leave a ghost player in a room.
    useEffect(() => () => socket.emit("leaveRoom"), []);

    useEffect(() => {
      socket.on("roomCreated", (code) => {
        setRoomCode(code);
        setGameState("waiting");
        setIsCreator(true);
      });

      socket.on("roomJoined", (data) => {
        setRoomCode(data.room);
        setGameState("waiting");
        setIsCreator(false);
        setOpponentName(data.opponentName);
      });

      socket.on("opponentJoined", (opponentName) => {
        setOpponentName(opponentName);
        setGameState("ready");
      });

      socket.on("gameStarted", () => {
        setGameState("playing");
        setMoveCount(0);
        setBoard(Array(9).fill(null));
        setCurrentPlayer("X");
        setWinner(null);
        setTimer(20);
        setIsMyTurn(isCreator);
        setTimerActive(isCreator);
      });

      socket.on("updateBoard", (newBoard) => {
        setBoard(newBoard);
        setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"));
        setMoveCount((prev) => prev + 1);
        setTimer(20);
        setIsMyTurn((prev) => !prev);
        setTimerActive((prev) => !prev);
      });

      socket.on("updateMoveCounts", (counts) => {
        if (isCreator) {
          setMyMoveCount(counts.X);
          setOpponentMoveCount(counts.O);
        } else {
          setMyMoveCount(counts.O);
          setOpponentMoveCount(counts.X);
        }
      });

      socket.on("gameOver", (data) => {
        setWinner(data.winner);
        setTimerActive(false);
        if (isCreator) {
          setMyMoveCount(data.moveCounts.X);
        } else {
          setMyMoveCount(data.moveCounts.O);
        }
        // Stats are saved by the server and arrive via "statsUpdated".
      });

      socket.on("opponentLeft", () => {
        setGameState("abandoned");
        setWinner("opponent left");
        setShowPopup(true);
        setTimeout(() => {
          setGameState("waiting");
          setShowPopup(false);
        }, 5000); // Reset game state after 5 seconds
      });

      socket.on("playerLeft", (name) => {
        if (gameState === "playing" || gameState === "waiting") {
          // Update opponent's name to empty string
          setOpponentName("");

          // Update game state to 'waiting'
          setGameState("waiting");

          // Show a message indicating the player has left
          alert(`${name} has left the game`);

          // Optionally, reset the board and move count
          setBoard(Array(9).fill(null));
          setMoveCount(0);
        }
      });

      socket.on("updateTimer", (newTimer) => {
        setTimer(newTimer);
      });

      socket.on("turnChange", (newCurrentPlayer) => {
        setCurrentPlayer(newCurrentPlayer);
        setIsMyTurn(
          (isCreator && newCurrentPlayer === "X") ||
            (!isCreator && newCurrentPlayer === "O")
        );
        setTimerActive(
          (isCreator && newCurrentPlayer === "X") ||
            (!isCreator && newCurrentPlayer === "O")
        );
        setTimer(20);
      });

      socket.on("updateMoves", (data) => {
        const isMyMove =
          (isCreator && data.player === "X") ||
          (!isCreator && data.player === "O");

        if (isMyMove) {
          setMyMoveCount(data.moveCount);
        }
      });

      socket.on("rematchInitiated", () => {
        // Reset game state for opponent
        setGameState("playing");
        setBoard(Array(9).fill(null));
        setCurrentPlayer("X");
        setWinner(null);
        setMoveCount(0);
        setTimer(20);
        setIsMyTurn(!isCreator); // Opponent's turn will be opposite of creator's
        setTimerActive(!isCreator);
        setSelectedCell(null);
        setMyMoves([]);
        setOpponentMoves([]);
        setMyMoveCount(0);
        setOpponentMoveCount(0);
        setShowPopup(false);
      });

      socket.on("rematchAccepted", (data) => {
        // Reset game state for ALL players
        setGameState("playing");
        setBoard(data.board);
        setCurrentPlayer(data.currentPlayer);
        setWinner(null);
        setMoveCount(data.moveCount);
        setTimer(data.timer);
        setIsMyTurn(isCreator); // Creator (X) starts first
        setTimerActive(isCreator);
        setSelectedCell(null);
        setMyMoves([]);
        setOpponentMoves([]);
        setMyMoveCount(0);
        setOpponentMoveCount(0);
        setShowPopup(false);
      });

      return () => {
        socket.off("roomCreated");
        socket.off("roomJoined");
        socket.off("opponentJoined");
        socket.off("gameStarted");
        socket.off("updateBoard");
        socket.off("updateMoves");
        socket.off("gameOver");
        socket.off("turnChange");
        socket.off("rematchInitiated");
        socket.off("rematchAccepted");
        socket.off("opponentLeft");
        socket.off("playerLeft");
        socket.off("updateTimer");
        socket.off("updateMoveCounts");
      };
    }, [isCreator, socket]);

    useEffect(() => {
      let interval;
      if (gameState === "playing" && timerActive && !winner) {
        interval = setInterval(() => {
          setTimer((prevTimer) => {
            if (prevTimer > 0) {
              return prevTimer - 1;
            } else {
              socket.emit("timeUp", { room: roomCode });
              return 0;
            }
          });
        }, 1000);
      }
      return () => clearInterval(interval);
    }, [gameState, timerActive, winner, roomCode]);

    const createRoom = () => {
      if (name) {
        socket.emit("createRoom", name);
      }
    };

    const joinRoom = () => {
      if (name && room) {
        socket.emit("joinRoom", { name, room });
      }
    };

    const startGame = () => {
      socket.emit("startGame", roomCode);
    };

    const handleCellClick = (index) => {
      if (winner || !isMyTurn) return;

      if (moveCount < 6) {
        if (!board[index]) {
          const newBoard = [...board];
          newBoard[index] = currentPlayer;

          // Only track my move
          const timestamp = Date.now();
          const moveData = {
            move: [index],
            timestamp: timestamp,
          };

          setMyMoves((prevMoves) => [...prevMoves, moveData]);

          socket.emit("move", {
            room: roomCode,
            board: newBoard,
            player: currentPlayer,
            timestamp: timestamp,
            move: [index],
          });
        }
      } else {
        if (selectedCell === null) {
          if (board[index] === currentPlayer) {
            setSelectedCell(index);
          }
        } else {
          if (index !== selectedCell && !board[index]) {
            const newBoard = [...board];
            newBoard[index] = newBoard[selectedCell];
            newBoard[selectedCell] = null;

            // Only track my move
            const timestamp = Date.now();
            const moveData = {
              move: [selectedCell, index],
              timestamp: timestamp,
            };

            setMyMoves((prevMoves) => [...prevMoves, moveData]);

            socket.emit("move", {
              room: roomCode,
              board: newBoard,
              player: currentPlayer,
              timestamp: timestamp,
              move: [selectedCell, index],
            });
            setSelectedCell(null);
          } else {
            setSelectedCell(null);
          }
        }
      }
    };

    const copyCode = () => {
      navigator.clipboard?.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    };

    const renderRoomCode = () => (
      <button
        onClick={copyCode}
        className="group mx-auto mt-5 flex items-center gap-3 rounded-2xl border-2 border-dashed border-ink/40 bg-paper px-5 py-3 transition-colors hover:border-ink"
        title="Copy room code"
      >
        <span className="font-mono text-[26px] font-medium tracking-[0.18em]">{roomCode}</span>
        {copied ? <Check className="h-4 w-4 text-oteal" /> : <Copy className="h-4 w-4 text-muted group-hover:text-ink" />}
      </button>
    );

    const panelCls = "pop-in mx-auto max-w-md py-8 text-center";

    const myPiece = isCreator ? "X" : "O";
    const theirPiece = isCreator ? "O" : "X";
    const lastMoves = myMoves.slice(-4);

    let status;
    if (winner) {
      status = winner === "draw" ? "A draw. Rare in this game!" : winner === myPiece ? "You win!" : `${opponentName || "Your opponent"} wins.`;
    } else if (!isMyTurn) {
      status = `${opponentName || "Opponent"} is thinking…`;
    } else if (moveCount < 6) {
      status = "Your turn. Place a piece.";
    } else {
      status = selectedCell === null ? "Your turn. Pick up a piece to shift." : "Now drop it on an empty square.";
    }

    return (
      <div>
        {notice && (
          <div role="status" className="pop-in mx-auto mb-4 max-w-md rounded-2xl bg-xred/10 px-4 py-3 text-center text-[14px] font-medium text-xred">
            {notice}
          </div>
        )}
        {gameState === "initial" && (
          <div className={panelCls}>
            {onBack && (
              <button onClick={onBack} className="btn-ghost -mt-4 mb-4">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            )}
            <p className="eyebrow">Play a friend</p>
            <h3 className="font-display mt-2 text-[32px] font-medium tracking-tight">
              {showRoomControls ? `Hi ${name}. Host or join?` : "What should we call you?"}
            </h3>

            {!showRoomControls ? (
              <form onSubmit={handleNameSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  placeholder="Your name"
                  aria-label="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="field text-center sm:text-left"
                  autoFocus
                />
                <button type="submit" className="btn-ink shrink-0" disabled={!name.trim()}>
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <div className="mt-8 space-y-5 text-left">
                <button onClick={createRoom} className="btn-ink w-full">
                  Create a room
                </button>
                <div className="flex items-center gap-3 text-[13px] text-muted">
                  <span className="h-px flex-1 bg-line" /> or join one <span className="h-px flex-1 bg-line" />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Room code"
                    aria-label="Room code"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="field font-mono tracking-widest"
                  />
                  <button onClick={joinRoom} className="btn-line shrink-0" disabled={!room.trim()}>
                    Join
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {gameState === "waiting" && isCreator && (
          <div className={panelCls}>
            <p className="eyebrow">Room open</p>
            <h3 className="font-display mt-2 text-[30px] font-medium tracking-tight">Send this to your friend</h3>
            {renderRoomCode()}
            <p className="mt-6 flex items-center justify-center gap-2 text-[15px] text-muted">
              <span className="think">
                <span>●</span>
                <span>●</span>
                <span>●</span>
              </span>
              Waiting for them to join
            </p>
            <button className="btn-ghost mt-6" onClick={handleLeaveRoom}>
              Close room
            </button>
          </div>
        )}

        {gameState === "waiting" && !isCreator && (
          <div className={panelCls}>
            <p className="eyebrow">Room {roomCode}</p>
            <h3 className="font-display mt-2 text-[30px] font-medium tracking-tight">You're in.</h3>
            <p className="mt-3 text-[15px] text-muted">
              Waiting for {opponentName || "the host"} to start the game.
            </p>
          </div>
        )}

        {gameState === "ready" && isCreator && (
          <div className={panelCls}>
            <p className="eyebrow">Room {roomCode}</p>
            <h3 className="font-display mt-2 text-[30px] font-medium tracking-tight">
              {opponentName} sat down.
            </h3>
            <p className="mt-3 text-[15px] text-muted">You're red and you move first.</p>
            <button onClick={startGame} className="btn-ink mt-8">
              Start the game <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {gameState === "playing" && (
          <div className="grid items-center gap-8 md:grid-cols-[1fr_300px] md:gap-12">
            <Board
              board={board}
              onCellClick={handleCellClick}
              selectedCell={selectedCell}
              disabled={!!winner || !isMyTurn}
              showTargets={moveCount >= 6}
            />

            <aside className="space-y-3">
              {[
                { who: `${name || "You"} (you)`, piece: myPiece, active: isMyTurn },
                { who: opponentName || "Opponent", piece: theirPiece, active: !isMyTurn },
              ].map((p) => (
                <div
                  key={p.piece}
                  className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 ${
                    p.active && !winner ? "border-ink bg-card" : "border-transparent bg-sunk/60"
                  }`}
                >
                  <span className="h-8 w-8 shrink-0">
                    <Piece value={p.piece} className="h-full w-full" animate={false} />
                  </span>
                  <span className="truncate text-[15px] font-semibold">{p.who}</span>
                  {p.active && !winner && (
                    <span className="ml-auto font-mono text-[13px] tabular-nums text-muted">
                      {isMyTurn && p.active ? `${timer}s` : "…"}
                    </span>
                  )}
                </div>
              ))}

              <div className="rounded-2xl border border-line p-4">
                <div className="flex items-center justify-between">
                  <span className="eyebrow">{moveCount < 6 ? "Placing" : "Shifting"}</span>
                  <span className="font-mono text-[12px] text-muted">your moves: {myMoveCount}</span>
                </div>
                {isMyTurn && !winner && (
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-linear ${timer <= 5 ? "bg-xred" : "bg-mustard"}`}
                      style={{ width: `${(timer / 20) * 100}%` }}
                    />
                  </div>
                )}
                <p className={`mt-4 leading-snug ${winner ? "font-display text-[22px]" : "text-[15px]"}`}>{status}</p>

                {lastMoves.length > 0 && (
                  <ul className="mt-4 space-y-1 border-t border-line pt-3 font-mono text-[12px] text-muted">
                    {lastMoves.map((move, i) => (
                      <li key={i}>
                        {myMoves.length - lastMoves.length + i + 1}.{" "}
                        {move.move.length > 1 ? `shift ${move.move[0] + 1} → ${move.move[1] + 1}` : `place ${move.move[0] + 1}`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </aside>
          </div>
        )}

        {gameState === "abandoned" && (
          <div className={panelCls}>
            <h3 className="font-display text-[30px] font-medium tracking-tight">Your opponent left.</h3>
            <p className="mt-3 text-[15px] text-muted">No harm done. Open a new room whenever you're ready.</p>
            <button className="btn-ink mt-8" onClick={handleCreateRoom}>
              Open a new room
            </button>
          </div>
        )}

        {gameState === "playing" && winner !== null && (
          <OpponentGameEndPopup
            handleRematch={handleRematch}
            opponentMoves={myMoves}
            isCreator={isCreator}
            isDark={isDark}
            winner={winner}
            myPiece={myPiece}
            opponentName={opponentName}
            onBack={handleBack}
          />
        )}
      </div>
    );
  };

  export default TicTacToeShift;
