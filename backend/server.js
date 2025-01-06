const express = require("express");
const socketIo = require("socket.io");
const color = require("colors");
const cors = require("cors");
const { get_Current_User, user_Disconnect, join_User } = require("./dummyuser");

// Initialize Express
const app = express();
app.use(express.json()); // Parse incoming JSON requests

// CORS Middleware
app.use(cors({
  origin: 'http://localhost:3000', // The frontend address
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

// Start the server
const port = process.env.PORT || 8000;
const server = app.listen(
  port,
  console.log(`Server is running on port: ${port}`.green)
);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000', // The frontend address
    methods: ['GET', 'POST'],
  },
});

// Handle socket connections
io.on("connection", (socket) => {
  console.log(`User connected with socket ID: ${socket.id}`);

  // Handle user joining a room
  socket.on("joinRoom", ({ username, roomname }) => {
    const p_user = join_User(socket.id, username, roomname); // Add the user
    console.log(`User ${username} joined room: ${roomname}`);

    socket.join(p_user.room); // Join the specified room

    // Welcome message for the user who joined
    socket.emit("message", {
      userId: p_user.id,
      username: p_user.username,
      text: `Welcome ${p_user.username}!`,
    });

    // Notify others in the room about the new user
    socket.broadcast.to(p_user.room).emit("message", {
      userId: p_user.id,
      username: p_user.username,
      text: `${p_user.username} has joined the chat.`,
    });
  });

  // Handle chat messages
  socket.on("chat", ({ text, username, roomname }) => {
    const p_user = get_Current_User(socket.id); // Get the current user
    if (p_user) {
      console.log(`User ${p_user.username} sent message: ${text}`);
      io.to(p_user.room).emit("message", { // Emit the message to the room
        userId: p_user.id,
        username: p_user.username,
        text: text,
      });
    } else {
      console.error("User not found for chat message");
    }
  });

  // Handle file uploads
  socket.on("file", ({ file, fileName, username, roomname }) => {
    const p_user = get_Current_User(socket.id); // Get the current user
    if (p_user) {
      console.log(`User ${p_user.username} sent file: ${fileName}`);
      io.to(p_user.room).emit("message", { // Emit the file to the room
        userId: p_user.id,
        username: p_user.username,
        file: file,
        fileName: fileName,
      });
    } else {
      console.error("User not found for file upload");
    }
  });

  // Handle user disconnecting
  socket.on("disconnect", () => {
    const p_user = user_Disconnect(socket.id); // Remove the user on disconnect
    if (p_user) {
      console.log(`User ${p_user.username} disconnected`);
      io.to(p_user.room).emit("message", { // Notify others in the room
        userId: p_user.id,
        username: p_user.username,
        text: `${p_user.username} has left the chat.`,
      });
    } else {
      console.error("User not found on disconnect");
    }
  });
});
