import express from "express";
import crypto from "crypto";
import { Usuario } from "../models/usuario"; // crear este modelo (pendiente)
import { enviarCorreoRecuperacion } from "../utils/mailer"; // revisar funcion
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/solicitar-recuperacion", async (req, res) => {
  const { email } = req.body;
  const usuario = await Usuario.findOne({ email });
  if (!usuario) {
    return res.status(404).send("Usuario no encontrado.");
  }

  const tokenRecuperacion = crypto.randomBytes(20).toString("hex");
  const expiracionToken = Date.now() + 3600000; // este va a establecer 01 hora desde ahora

  usuario.tokenRecuperacion = tokenRecuperacion;
  usuario.expiracionToken = expiracionToken;
  await usuario.save();

  enviarCorreoRecuperacion(usuario.email, tokenRecuperacion);

  res.send("Se ha enviado un correo para restablecer tu contraseña.");
});



router.get("/recuperar/:token", async (req, res) => {
  const { token } = req.params;
  const usuario = await Usuario.findOne({
    tokenRecuperacion: token,
    expiracionToken: { $gt: Date.now() },
  });

  if (!usuario) {
    return res.status(400).send("Token inválido o expirado.");
  }

  // consultar a donde debo redirigir al usuario para restablecer la contraseña (pendiente)
  res.redirect(`https://tu-sitio-web.com/recuperar-contrasena?token=${token}`);
});

router.post("/recuperar/:token", async (req, res) => {
  const { token } = req.params;
  const { nuevaContrasena } = req.body;
  const usuario = await Usuario.findOne({
    tokenRecuperacion: token,
    expiracionToken: { $gt: Date.now() },
  });

  if (!usuario) {
    return res.status(400).send("Token inválido o expirado.");
  }

  // hasheo de contra
  const salt = await bcrypt.genSalt(10);
  const contrasenaHasheada = await bcrypt.hash(nuevaContrasena, salt);

  usuario.contrasena = nuevaContrasena;
  usuario.tokenRecuperacion = undefined;
  usuario.expiracionToken = undefined;
  await usuario.save();

  res.send("Contraseña actualizada correctamente.");
});




export default router;
