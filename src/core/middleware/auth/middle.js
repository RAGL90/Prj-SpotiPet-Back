const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.header("auth-token");

  if (!token) return res.status(401).send("Acceso denegado");

  try {
    const payload = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = payload;
    next(); //Next nos permitirá continuar la ruta
  } catch (error) {
    try {
      const payload = jwt.verify(token, process.env.REFRESH_TOKEN);
      req.user = payload;
      next();
    } catch (error) {
      res.status(400).send("Expired Token, please log in again");
    }
  }
};

module.exports = { verifyToken };
