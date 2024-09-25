var express = require("express");
var socket = require("socket.io");
var jwt = require("jsonwebtoken"); // JWT for authentication
var bodyParser = require("body-parser");

// App setup
var app = express();
app.use(bodyParser.json());
var server = app.listen(4000, function () {
  console.log("listening for requests on port 4000,");
});

// Static files
app.use(express.static("public"));

// Secret key for JWT
const secretKey = "your_secret_key";

// Set up user
const users = [{ username: "mario", password: "michat" }];

// Authentication route
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    // Generate a token
    const token = jwt.sign({ username: user.username }, secretKey, {
      expiresIn: "1h",
    });
    res.json({ token });
  } else {
    res.status(401).send("Invalid credentials");
  }
});

// Socket setup & pass server
var io = socket(server);
io.on("connection", (socket) => {
  console.log("made socket connection", socket.id);

  socket.on("chat", function (data) {
    io.sockets.emit("chat", data);
  });

  socket.on("typing", function (data) {
    socket.broadcast.emit("typing", data);
  });
});
