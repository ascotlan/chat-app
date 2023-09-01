const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();

// Create a new webserver explicitly instead of having express do this in the background
const server = http.createServer(app);

// call socket io with raw http server to install web socket support
const io = socketio(server);

// set port number as host port#
const port = process.env.PORT || 3000;

// Define static directory files path for Express config
const publicDirectoryPath = path.join(__dirname, "../public");

// Setup static directory to serve
app.use(express.static(publicDirectoryPath));

// listen for new client connection
io.on("connection", (socket) => {
  console.log("New web socket connection");

  // client (emit) -> sever (receive) - username and room (join)
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      username,
      room,
    });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    // server (emit) -> client(receive) - message
    socket.emit("message", generateMessage("Admin", `Welcome!`));
    //server(emit) -> all clients in a room except this socket connection (receive) - message
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  // client (emit) -> sever (receive) - message submitted
  socket.on("submitMessage", (message, callback) => {
    const user = getUser(socket.id);

    const filter = new Filter();
    //filter message for profanity and send error msg
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }
    // server (emit) -> all clients (receive) - message
    io.to(user.room).emit("message", generateMessage(user.username, message));
    // send acknowledgment
    callback();
  });

  // client emit -> server(receive) - location
  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);

    //server(emit) -> all clients(receive) - location
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(user.username, coords)
    );
    // send acknowledgment
    callback();
  });

  //server (emit) -> all connected clients(receive) - message
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left the chat!`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

// Set up the web server to listen on port
server.listen(port, () => {
  console.log(`Server is up on port: ${port}`);
});
