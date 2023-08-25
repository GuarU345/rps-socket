const { createServer } = require("http");
const os = require("os");
const { Server } = require("socket.io");
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://192.168.1.30:5173",
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

  socket.on("choice", (choice) => {
    console.log(choice);
    socket.choice = choice;

    if (players.every((player) => player.choice !== undefined)) {
      compareChoices();
    }
  });

  socket.on("disconnect", () => {
    console.log(`Usuario desconectado: ${socket.id}`);
    players = players.filter((player) => player !== socket);
  });
});

function compareChoices() {
  const choice1 = players[0].choice;
  const choice2 = players[1].choice;

  let result;
  if (choice1 === choice2) {
    result = "Empate";
  } else if (
    (choice1 === "piedra" && choice2 === "tijeras") ||
    (choice1 === "tijeras" && choice2 === "papel") ||
    (choice1 === "papel" && choice2 === "piedra")
  ) {
    result = {
      text: "Jugador 1 gana",
    };
  } else {
    result = {
      text: "Jugador 2 gana",
    };
  }

  players[0].emit("game_result", result);
  players[1].emit("game_result", result);
  console.log(result);
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
