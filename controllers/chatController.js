const express = require("express");
const chatModel = require("../models/Chat");

const chatRouter = express.Router();

chatRouter.post("/create", async (req, res) => {
  try {
    const chatDetails = req.body;
    if (!chatDetails?.isGroup) {
      const existingChats = await chatModel.findOne({
        members: { $all: chatDetails?.members },
        isGroup: false,
      });
      if (existingChats) {
        return res.status(400).send({ error: "Chat already exists!" });
      }
    }
    const chat = new chatModel(chatDetails);
    await chat.save();
    return res.status(200).send({ chatId: chat?.id });
  } catch (error) {
    res.status(500).send("Internal Error Occured");
  }
});

chatRouter.post("/userChats", async (req, res) => {
  try {
    const { userId } = req.body;
    const chats = await chatModel.find({ members: { $in: [userId] } });
    return res.status(200).send({ chats });
  } catch (error) {
    res.status(500).send("Internal Error Occured");
  }
});

chatRouter.delete("/delete", async (req, res) => {
  try {
    const { chatId } = req.body;
    await chatModel.findByIdAndDelete(chatId);
    return res.status(200).send("Chat Deleted Successfully!");
  } catch (error) {
    res.status(500).send("Internal Error Occured");
  }
});

module.exports = chatRouter;
