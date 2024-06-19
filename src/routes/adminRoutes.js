import express from "express";
import { authorize, requireRole } from "../middlewares/auth.js";
import checkRole from "../middlewares/checkRole.js";

const router = express.Router();

router.post("/api/admin", (req, res) => {
  try {
    res.send("Ruta POST /api/admin alcanzada");
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
});

// Ruta protegida
router.get(
  "/some-protected-route",
  authorize,
  checkRole("admin"),
  async (req, res, next) => {
    try {
      // id del user debe de estar disponible en req.user.id
      const userData = await getUserData(req.user.id);
      res.send({ message: "Bienvenido a la ruta protegida!", data: userData });
    } catch (error) {
      next(error);
    }
  }
);

// Ruta de administrador
router.get("/admin-route", authorize, requireRole("admin"), (req, res) => {
  // mensaje de bienvenida al admin
  res.send("Bienvenido administrador a tu ruta exclusiva!");
});

export default router;