const express = require("express");
const path = require("path");
const morgan = require("morgan");
const http = require("http");
const socketio = require("socket.io");

const app = express();

// Create a new webserver explicitly instead of having express do this in the background
const server = http.createServer(app);

// call socket io with raw http server to install web socket support
const io = socketio(server);

// set port number as host port#
const port = process.env.PORT || 3000;

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan("dev"));

// Define static directory files path for Express config
const publicDirectoryPath = path.join(__dirname, "../public");

// Setup static directory to serve
app.use(express.static(publicDirectoryPath));

// listen for new client connection
io.on("connection", (socket) => {
  console.log("New web socket connection");

  // server (emit) -> client (receive) - message
  socket.emit("message", "Welcome!");
  //server(emit) -> all clients except this socket connection (receive) - message
  socket.broadcast.emit("message", "A new user has joined!");

  // client (emit) -> sever (receive) - message submitted
  socket.on("submit", (message) => {
    // server (emit) -> all clients (receive) - message
    io.emit("message", message);
  });

  
  // client emit -> server(receive) - location
  socket.on("sendLocation", (coords) => {
    //server(emit) -> all clients(receive) - location
    io.emit(
      "message",
      `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
    );
  });

  //server (emit) -> all connected clients(receive) - message
  socket.on("disconnect", () => {
    io.emit("message", "A user has left the chat!");
  });
});

// Set up the web server to listen on port
server.listen(port, () => {
  console.log(`Server is up on port: ${port}`);
});
