const express = require("express");
const path = require("path");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname, "/public")));

let activeUsers = new Set(); // Simpan username yang sedang online

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("newuser", (username, callback) => {
    // Hanya huruf a-z dan A-Z yang diizinkan
    const nameCheck = /^[A-Za-z]+$/;
    if (!nameCheck.test(username)) {
      return callback({
        success: false,
        message: "❌ Username hanya boleh huruf tanpa angka/simbol.",
      });
    }

    // Cek apakah username sudah digunakan
    if (activeUsers.has(username)) {
      return callback({
        success: false,
        message: "⚠️ Username sudah dipakai, gunakan nama lain.",
      });
    }

    socket.username = username;
    activeUsers.add(username);

    callback({ success: true });
    socket.broadcast.emit("update", `${username} joined the chat`);
  });

  socket.on("chat", (message) => {
    socket.broadcast.emit("chat", message);
  });

  socket.on("exituser", (username) => {
    activeUsers.delete(username);
    socket.broadcast.emit("update", `${username} left the chat`);
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      activeUsers.delete(socket.username);
      io.emit("update", `${socket.username} left the chat`);
    }
  });
});

const PORT = process.env.PORT || 5004;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));