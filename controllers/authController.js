const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/User");
const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
  let userDetails = req.body;
  if (!userDetails?.username || !userDetails?.email || !userDetails?.password) {
    return res.status(400).send({ error: "Incomplete Details!" });
  }
  try {
    let existingUsers = await userModel.findOne({
      username: userDetails?.username,
    });
    if (existingUsers) {
      return res.status(400).send({ error: "Username already exists!" });
    }
    existingUsers = await userModel.findOne({ email: userDetails?.email });
    if (existingUsers) {
      return res.status(400).send({ error: "User already exists!" });
    }
    const hash = await bcrypt.hash(
      userDetails?.password,
      parseInt(process.env.saltRounds || 10)
    );
    const body = {
      username: userDetails?.username,
      email: userDetails?.email,
      password: hash,
      avatar: userDetails?.avatar || "",
    };

    const user = new userModel(body);
    await user.save();
    res.status(200).send({ userId: user?.id });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal Server Error!" });
  }
});

authRouter.post("/login", async (req, res) => {
  let userDetails = req.body;
  if (!userDetails?.email || !userDetails?.password) {
    return res.status(400).send({ error: "Invalid Email/Password!" });
  }

  try {
    let user = await userModel.findOne({ email: userDetails?.email });
    if (!user) {
      return res.status(400).send({ error: "Incorrect Email!" });
    }
    const match = await bcrypt.compare(userDetails?.password, user?.password);
    if (match) {
      let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "1d",
      });

      res.status(200).send({
        token,
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
        },
      });
    } else {
      res.status(400).send({ error: "Incorrect Password!" });
    }
  } catch (error) {
    res.status(500).send({ error });
  }
});

authRouter.post("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const details = req.body;

    await userModel.findByIdAndUpdate(id, details);
    res.status(200).send("Details update sussessful");
  } catch (error) {
    res.status(500).send({ error });
  }
});

module.exports = authRouter;
