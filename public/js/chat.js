const socket = io();

// listen for emitted message on connection
socket.on("message", (message) => {
  console.log(message);
});

// listen for form submit
document.querySelector("#message-form").addEventListener("submit", (e) => {
  e.preventDefault();
  //get input text from form
  const message = e.target.elements.message.value;
  //emit message from client to server
  socket.emit("submit", message);
});
