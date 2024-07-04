//Activar la librería:
const jwt = require("jsonwebtoken");

const generateToken = (user, isRefreshToken) => {
  if (isRefreshToken)
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "90min",
    });

  return jwt.sign(user, process.env.TOKEN_SECRET, {
    expiresIn: "15min",
  });
};

module.exports = generateToken;
//Será usado por el userController
