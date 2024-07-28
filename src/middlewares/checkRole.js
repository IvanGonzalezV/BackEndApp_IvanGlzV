import jwt from "jsonwebtoken";
import userModel from "../dao/models/userModel.js";

// middleware para verificacion de roles de user
function checkRole(role) {
  return async function (req, res, next) {
    try {
      const token = req.session.token; // obtener el token de la sesión del usuario
      const userId = jwt.decode(token).id; // decodifica el token para obtener el user ID
      const user = await userModel.findById(userId); // buscar al user en la DB
      if (user.role !== role) {
        res.status(403).send("No tienes permiso para realizar esta acción"); // error si el rol de user no es correcto
      } else {
        next(); // si el rol de user es correcto, continua con el siguiente función middle
      }
    } catch (error) {
      next(error);
    }
  };
}

export default checkRole;
