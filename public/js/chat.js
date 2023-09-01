const socket = io();

// Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Get the Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// listen for emitted message on connection
socket.on("message", (message) => {
  // render dynamic content in the mustache bars in the innerHtml hidden in the script tags
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  // insert html dynamically before the end of the closing tag
  $messages.insertAdjacentHTML("beforeend", html);
});

// listen for emitted locationMessage on connection
socket.on("locationMessage", (message) => {
  // render dynamic content in the mustache bars in the innerHtml hidden in the script tags
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });

  // insert html dynamically before the end of the closing tag
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });

  // insert html dynamically
  document.querySelector("#sidebar").innerHTML = html;
});

// listen for form submit
$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  //disable form btn
  $messageFormButton.setAttribute("disabled", "disabled");

  //get input text from form
  const message = e.target.elements.message.value;
  //emit message from client to server
  socket.emit("submitMessage", message, (error) => {
    //enable form btn, clear, and focus on input element
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }
    //acknowledgement msg
    console.log("Message delivered!");
  });
});

//listen for send loation button click
document.querySelector("#send-location").addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser.");
  }

  // Disable send location btn
  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    // Emit "send location" eventt with location data object
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
        console.log("Location shared!");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
