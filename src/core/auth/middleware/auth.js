//Activar la librería:
const jwt = require("jsonwebtoken");

//Token Generado:
const generateToken = (user, isRefreshToken) => {
  //Comprobamos si ya hay token de Refresco, en caso de que lo haya procesamos el nuevo token
  if (isRefreshToken) {
    return jwt.sign(user, process.env.TOKEN_SECRET);
  }
  //Si no lo tiene lo marcamos, y le metemos token de refresco y una expiración de 15 min.
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "15min",
  });
};

module.exports = generateToken;
//Será usado por el userController
