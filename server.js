const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRouter = require("./controllers/authController");
const chatRouter = require("./controllers/chatController");
const messageRouter = require("./controllers/messageController");
const userRouter = require("./controllers/userController");
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/health", (req, res) => {
  res.send("Hello World");
});

app.use("/auth", authRouter);

app.use("/chats", chatRouter);

app.use("/messages", messageRouter);

app.use("/user", userRouter);

app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
