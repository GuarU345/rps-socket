const { createServer } = require("http");
const os = require("os");
const { Server } = require("socket.io");
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://192.168.1.5:5173",
  },
});

let players = [];

io.on("connection", (socket) => {
  console.log(`usuario conectado ${socket.id}`);

  socket.on("newRoomCreated", () => {
    io.emit("roomDataUpdated");
  });

  socket.on("playerGoToRoom", () => {
    io.emit("playerInRoom");
  });

  players.push(socket);
  console.log(players.length);

  socket.on("game_ready", () => {
    io.emit("game_start");
  });

  socket.on("choice", (choice, user) => {
    console.log(choice);
    socket.choice = choice;
    socket.user = user;

    if (players.every((player) => player.choice !== undefined)) {
      compareChoices();
    }
  });

  socket.on("disconnect", () => {
    console.log(`Usuario desconectado: ${socket.id}`);
    players = players.filter((player) => player !== socket);
    io.emit("logout");
  });
});

function compareChoices() {
  const choice1 = players[0].choice;
  const choice2 = players[1].choice;
  const player1 = players[0].user;
  const player2 = players[1].user;

  const player1Selection = {
    choice1,
    player1,
  };

  const player2Selection = {
    choice2,
    player2,
  };

  let result;
  if (player1Selection.choice1 === player2Selection.choice2) {
    result = "Empate";
  } else if (
    (player1Selection.choice1 === "rock" &&
      player2Selection.choice2 === "scissors") ||
    (player1Selection.choice1 === "scissors" &&
      player2Selection.choice2 === "paper") ||
    (player1Selection.choice1 === "paper" &&
      player2Selection.choice2 === "rock")
  ) {
    if (player1Selection.player1 === undefined) {
      result = `${player2Selection.player2}`;
    } else {
      result = `${player1Selection.player1}`;
    }
  }
  io.emit("game_result", player1Selection, player2Selection);
}

const IP_ADDRESS = getIPAddress();
const PORT = process.env.PORT || 4000;

function getIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    const interfaceData = interfaces[interfaceName];
    for (const data of interfaceData) {
      if (data.family === "IPv4" && !data.internal) {
        return data.address;
      }
    }
  }
  return "127.0.0.1"; // Dirección IP por defecto si no se puede detectar automáticamente
}

httpServer.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
