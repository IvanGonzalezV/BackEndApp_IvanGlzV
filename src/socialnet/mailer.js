import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

// este configura el transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  auth: {
    user: process.env.GMAIL_USER, // Dirección de correo
    pass: process.env.GMAIL_PASS, // Contraseña de aplicación
  },
});

// esta func es para enviar correo de recuperacion
export const enviarCorreoRecuperacion = async (email, token) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Recuperación de Contraseña",
    html: `<p>Para restablecer tu contraseña, por favor haz clic en el siguiente enlace:</p>
       <a href="http://tu-sitio.com/recuperar/${token}">Restablecer Contraseña</a>
       <p>Este enlace expirará en 1 hora.</p>`,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    logger.info("Correo de recuperación enviado: " + info.response);
  } catch (error) {
    logger.error(error);
  }
};

export const enviarCorreoPrueba = async (req, res) => {
  let mailOptions = {
    from: "googlPass <iglzv7@gmail.com>", // remitente
    to: "irgovi7@gmail.com", // destinatario
    subject: "Correo de prueba", // Asunto
    text: "¡Wassup! Este es un correo de prueba.", // Cuerpo en texto plano
    html: `
        <div> 
            <h1>¡Wassup!</h1>
            <p>Este es un correo de prueba.</p>
        </div>`, // Cuerpo en HTML
    attachments: [
      {
        filename: "Buitre_01.jpg",
        path: "./public/imgs/buitre_01.jpg",
        cid: "buitre", // Identificador del contenido
      },
    ],
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    logger.info("Correo de prueba enviado: " + info.response);
    res.send("Correo de prueba enviado correctamente.");
  } catch (error) {
    logger.error(error);
    res.status(500).send("Hubo un error al enviar el correo de prueba.");
  }
};

// ruta GET para verificar el servicio
export const configurarRutas =(app) => {
  app.get("/mail", (req, res) => {
  res.send("Ruta GET /mail funcionando correctamente.");
});
}

export default transporter;
