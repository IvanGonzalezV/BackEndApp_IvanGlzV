import express from "express";
import crypto from "crypto";
import { enviarCorreoRecuperacion } from "../utils/mailer"; 
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/solicitar-recuperacion", async (req, res) => {
  const { email } = req.body;
  const users = await users.findOne({ email });
  if (!users) {
    return res.status(404).send("users no encontrado.");
  }

  const tokenRecuperacion = crypto.randomBytes(20).toString("hex");
  const expiracionToken = Date.now() + 3600000; // este va a establecer 01 hora desde ahora (duracion)

  users.tokenRecuperacion = tokenRecuperacion;
  users.expiracionToken = expiracionToken;
  await users.save();

  enviarCorreoRecuperacion(users.email, tokenRecuperacion);

  res.send("Se ha enviado un correo para restablecer tu contraseña.");
});



router.get("/recuperar/:token", async (req, res) => {
  const { token } = req.params;
  const users = await users.findOne({
    tokenRecuperacion: token,
    expiracionToken: { $gt: Date.now() },
  });

  if (!users) {
    return res.status(400).send("Token inválido o expirado.");
  }

  // consultar a donde debo redirigir al users para restablecer la contraseña (pendiente)
  res.redirect(`https://tu-sitio-web.com/recuperar-contrasena?token=${token}`);
});

router.post("/recuperar/:token", async (req, res) => {
  const { token } = req.params;
  const { nuevaContrasena } = req.body;
  const users = await users.findOne({
    tokenRecuperacion: token,
    expiracionToken: { $gt: Date.now() },
  });

  if (!users) {
    return res.status(400).send("Token inválido o expirado.");
  }

  // hasheo de contra
  const salt = await bcrypt.genSalt(10);
  const contrasenaHasheada = await bcrypt.hash(nuevaContrasena, salt);

  users.contrasena = nuevaContrasena;
  users.tokenRecuperacion = undefined;
  users.expiracionToken = undefined;
  await users.save();

  res.send("Contraseña actualizada correctamente.");
});




export default router;
