const axios = require("axios");
const express = require("express");
require("dotenv").config();
const app = express();
const PORT = 4000;

const http = require("http").Server(app);
const cors = require("cors");
app.use(cors());

// Set up socket.io
const socketIO = require("socket.io")(http, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:5173/",
      "http://localhost:8100",
      "http://192.168.1.77:3000",
      "http://192.168.1.77:5555",
      "http://192.168.1.77:5901",
      "http://192.168.1.118:8100", //UPDATE IF NEEDED
      "http://192.168.1.118:8080", //UPDATE IF NEEDED
    ],
  },
});
// On connection
socketIO.on("connection", (socket) => {
  console.log(`+++ : ${socket.id} user just connected!`);

  // On message sent
  socket.on("message", (data) => {
    console.log("sent by: " + socket.id);
    postMessage(data.conversationId, data.senderId, data.content, data.token);
    socketIO.emit("messageResponse", data);
  });

  const postMessage = async (conversationId, senderId, content, token) => {
    try {
      let axiosFetch = axios.create();
      axiosFetch.defaults.headers.common["Authorization"] = "Bearer " + token;
      const response = await axiosFetch.post(
        `http://localhost:8080/conversation/addChatMessage?conversationId=${conversationId}&senderId=${senderId}&content=${content}`
      );
      console.log(response);
    } catch (e) {
      console.log(e);
    }
  };

  // On new user joined
  // socket.on('newUser', (data) => {
  //   users.push(data);
  //   socketIO.emit('newUserResponse', users);
  // });

  // On user disconnect
  socket.on("disconnect", () => {
    console.log(`--- : ${socket.id} user disconnected`);
    // socketIO.emit('newUserResponse', users);
    socket.disconnect();
  });
});

app.get("/api", (req, res) => {
  res.json({ message: "Hello" });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
