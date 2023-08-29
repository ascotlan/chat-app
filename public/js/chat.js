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

//listen for send loation button click
document.querySelector("#send-location").addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    // Emit "send location" eventt with location data object
    socket.emit("sendLocation", {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
  });
});
