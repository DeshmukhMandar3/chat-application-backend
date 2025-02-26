const jwt = require("jsonwebtoken");

const authorize = async (req, res, next) => {
  let token = req?.headers?.authorization;
  if (!token) {
    return res.status(401).send({ error: "missing token" });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).send({ error: "token expired" });
      } else {
        req.body.userId = decoded.id;
        next();
      }
    });
  } catch (error) {
    res.status(500).send({ error: "Internal Error Occured" });
  }
};

module.exports = authorize;
