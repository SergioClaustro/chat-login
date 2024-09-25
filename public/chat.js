var socket;
var loginBtn = document.getElementById("login-btn");
var chatSection = document.getElementById("chat-mario");
var authSection = document.getElementById("auth-section");
var output = document.getElementById("output"),
  handle = document.getElementById("handle"),
  message = document.getElementById("message"),
  btn = document.getElementById("send"),
  feedback = document.getElementById("feedback"),
  toggleDarkModeBtn = document.getElementById("toggle-dark-mode");

// Handle user login
loginBtn.addEventListener("click", function () {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      Cookies.set("token", data.token); // Store token in cookies
      socket = io.connect("https://chat-login.onrender.com", {
        query: { token: data.token },
      });
      chatSection.style.display = "block";
      authSection.style.display = "none";
      setupChat();
    })
    .catch((err) => {
      alert("Login failed!");
    });
});

// Set up chat functionality
function setupChat() {
  // Emit events
  btn.addEventListener("click", function () {
    socket.emit("chat", {
      message: message.value,
      handle: handle.value,
    });
    message.value = ""; // Clear message input
  });

  message.addEventListener("keypress", function () {
    socket.emit("typing", handle.value);
  });

  // Listen for events
  socket.on("chat", function (data) {
    feedback.innerHTML = "";
    output.innerHTML +=
      "<p><strong>" + data.handle + ": </strong>" + data.message + "</p>";

    // Notify user of new message
    if (Notification.permission === "granted") {
      new Notification("New message from " + data.handle, {
        body: data.message,
      });
    }
  });

  socket.on("typing", function (data) {
    feedback.innerHTML = "<p><em>" + data + " is typing a message...</em></p>";
  });
}

// Dark Mode Toggle
toggleDarkModeBtn.addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");
});

// Request permission for notifications
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}
