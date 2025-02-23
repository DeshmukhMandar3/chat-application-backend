const express = require("express");
const userRouter = express.Router();

userRouter.post("/getAllFromChat", async (req, res) => {
  try {
    const { members } = req.body;
    if (!members || !Array.isArray(members)) {
      return res.status(400).send({ error: "Invalid members list!" });
    }

    const users = await Promise.all(
      members?.map(async (userId) => {
        let userData = await userModel.findById(userId);
        return userData
          ? {
              id: userData?.id,
              username: userData?.username,
              avatar: userData?.avatar,
            }
          : null;
      })
    );
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ error });
  }
});

module.exports = userRouter;
