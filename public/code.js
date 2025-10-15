document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ code.js loaded");

  const app = document.querySelector(".app");
  const socket = io();
  let uname;

  const joinScreen = app.querySelector(".join-screen");
  const chatScreen = app.querySelector(".chat-screen");
  const joinBtn = joinScreen.querySelector("#join-user");
  const sendBtn = chatScreen.querySelector("#send-message");
  const exitBtn = chatScreen.querySelector("#exit-chat");
  const messageInput = chatScreen.querySelector("#message-input");
  const messagesContainer = chatScreen.querySelector(".messages");

  const savedUser = localStorage.getItem("username");
  if (savedUser) {
    uname = savedUser;
    joinScreen.classList.remove("active");
    chatScreen.classList.add("active");
    socket.emit("newuser", uname, (res) => {
      if (res && res.success === false) {
        alert(res.message);
        localStorage.removeItem("username");
        window.location.reload();
      }
    });
    loadMessages();
  }

  function loadMessages() {
    const savedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
    savedMessages.forEach(msg => renderMessage(msg.type, msg.data));
  }

  joinBtn.addEventListener("click", function () {
    const username = joinScreen.querySelector("#username").value.trim();
    if (!username) return;

    socket.emit("newuser", username, (res) => {
      if (!res.success) {
        alert(res.message);
      } else {
        uname = username;
        localStorage.setItem("username", uname);
        joinScreen.classList.remove("active");
        chatScreen.classList.add("active");
        loadMessages();
      }
    });
  });

  sendBtn.addEventListener("click", function () {
    const text = messageInput.value.trim();
    if (!text) return;

    const msgObj = { username: uname, text };
    renderMessage("my", msgObj);
    saveMessage("my", msgObj);

    socket.emit("chat", msgObj);
    messageInput.value = "";
  });

  exitBtn.addEventListener("click", function () {
    socket.emit("exituser", uname);
    localStorage.removeItem("username");
    localStorage.removeItem("chatMessages");
    window.location.reload();
  });

  socket.on("update", function (update) {
    renderMessage("update", update);
    saveMessage("update", update);
  });

  socket.on("chat", function (message) {
    renderMessage("other", message);
    saveMessage("other", message);
  });

  function renderMessage(type, message) {
    const el = document.createElement("div");

    if (type === "my") {
      el.className = "message my-message";
      el.innerHTML = `
        <div>
          <div class="name">You</div>
          <div class="text">${message.text}</div>
        </div>`;
    } else if (type === "other") {
      el.className = "message other-message";

      let nameHTML = message.username;
      if (message.username === "Harzz") {
        nameHTML = `Harzz (Dev) <img class="dev-tiktok" src="centang.png" alt="dev badge">`;
      }

      el.innerHTML = `
        <div>
          <div class="name">${nameHTML}</div>
          <div class="text">${message.text}</div>
        </div>`;
    } else if (type === "update") {
      el.className = "update";
      el.innerText = message;
    }

    messagesContainer.appendChild(el);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function saveMessage(type, data) {
    const savedMessages = JSON.parse(localStorage.getItem("chatMessages")) || [];
    savedMessages.push({ type, data });
    localStorage.setItem("chatMessages", JSON.stringify(savedMessages));
  }
});