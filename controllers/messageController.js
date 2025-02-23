const express = require("express");
const messageModel = require("../models/Message");

const messageRouter = express.Router();

messageRouter.post("/post", async (req, res) => {
  try {
    const { chatId, senderId, content } = req.body;
    if (!chatId || !senderId || !content) {
      return res.status(400).send("Invalid Details");
    }
    const message = new messageModel({ chatId, senderId, content });
    await message.save();
    res.status(200).send("Message Posted Successfully");
  } catch (error) {
    res.status(500).send({ error: "Internal Error Occured" });
  }
});

messageRouter.post("/get", async (req, res) => {
  try {
    const { chatId } = req.body;
    const messages = await messageModel.find({ chatId });
    if (!messages.length) {
      return res.status(400).send({ error: "Invalid Chat Id" });
    }
    return res.status(200).send({ messages });
  } catch (error) {
    res.status(500).send({ error: "Internal Error Occured" });
  }
});

messageRouter.delete("/delete/:id", async (req, res) => {
  try {
    const { messageId } = req.body;
    const message = await messageModel.findByIdAndDelete(messageId);
    return res.status(200).send("Message Deleted Successfully");
  } catch (error) {
    res.status(500).send({ error: "Internal Error Occured" });
  }
});

module.exports = messageRouter;
