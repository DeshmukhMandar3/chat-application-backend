const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRouter = require("./controllers/authController");
const chatRouter = require("./controllers/chatController");
const messageRouter = require("./controllers/messageController");
const userRouter = require("./controllers/userController");
const authorize = require("./middlewares/authorization");
const messageModel = require("./models/Message");
const userModel = require("./models/User");
dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(cors());
app.use(express.json());

app.use("/health", (req, res) => {
  res.send("Hello World");
});

app.use("/auth", authRouter);

app.use("/chats", authorize, chatRouter);

app.use("/messages", authorize, messageRouter);

app.use("/user", authorize, userRouter);

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await userModel.findById(decoded.id);
    if (!user) return next(new Error("User not found"));
    socket.user = user;
    next();
  } catch (error) {
    return next(new Error("Invalid Token"));
  }
});

io.on("connection", (socket) => {
  console.log("user is connected", socket.id);

  socket.on("joinRoom", (chatId) => {
    socket.join(chatId);
    console.log(`user ${socket.user.username} has joined the chat ${chatId}`);
  });

  socket.on("leaveRoom", (chatId) => {
    socket.leave(chatId);
    console.log(`user ${socket.user.username} has left the chat ${chatId}`);
  });

  socket.on("sendMessage", async ({ chatId, message }) => {
    const newMessage = new messageModel({
      chatId,
      senderId: socket.user.id,
      content: message,
    });

    await newMessage.save();
    io.to(chatId).emit("receiveMessage", newMessage);
  });

  socket.on("typing", (chatId) => {
    socket.to(chatId).emit("userTyping", socket.user.id);
  });

  socket.on("stopTyping", (chatId) => {
    socket.to(chatId).emit("userStoppedTyping", socket.user.id);
  });

  socket.on("disconnect", () => {
    console.log("user is disconnected", socket.user.id);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
