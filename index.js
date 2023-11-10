const axios = require('axios')
const express = require('express');
require('dotenv').config()
const app = express();
const PORT = 4000;

const http = require('http').Server(app);
const cors = require('cors');
app.use(cors());

let axiosFetch = axios.create();
axiosFetch.defaults.headers.common["Authorization"] =
    "Bearer " + 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJET0NUT1IiXSwic3ViIjoiZG9jdG9yQ2FyZGlvbG9neTEiLCJpYXQiOjE2OTk1MDY5NTQsImV4cCI6MTcwMDExMTc1NH0.MkuKdBQtgSq43MTBKs2yr9YirCT-h0Uc7DEHNgTNhXM';


// Set up socket.io
const socketIO = require('socket.io')(http, {
  cors: {
      origin: ["http://localhost:3000", "http://127.0.0.1:5173/"]
  }
});

// Array of users in chat room
let users = [];

// On connection
socketIO.on('connection', (socket) => {
  console.log(`+++ : ${socket.id} user just connected!`);

  // On message sent
  socket.on('message', (data) => {
    console.log("sent by: " + socket.id)
    socketIO.emit('messageResponse', data);
    postMessage(data.conversationId, data.senderId, data.content)
  });

  const postMessage = async (conversationId ,senderId, content) => {
    try {
       const response = await axiosFetch.post(`http://localhost:8080/conversation/addChatMessage?conversationId=${conversationId}&senderId=${senderId}&content=${content}`)
       console.log(response)
    } catch (e) {
      console.log(e)
    }
  }

  // On new user joined
  // socket.on('newUser', (data) => {
  //   users.push(data);
  //   socketIO.emit('newUserResponse', users);
  // });

  // On user disconnect
  socket.on('disconnect', () => {
    console.log(`--- : ${socket.id} user disconnected`);
    socketIO.emit('newUserResponse', users);
    socket.disconnect();
  });
});

app.get("/api", (req, res) => {
  res.json({message: "Hello"})
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});