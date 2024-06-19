import nodemailer from "nodemailer";
import logger from "./logger.js";

app.post("/mail", async (req, res) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
      user: process.env.GMAIL_USER, // mail dir
      pass: process.env.GMAIL_PASS, // app pass
    },
  });

  let mailOptions = {
    from: "googlPass <iglzv7@gmail.com>", // remite
    to: "irgovi7@gmail.com", // destino
    subject: "Correo de prueba", // Asunto
    text: "¡Wassup! Este es un correo de prueba.", // cuerpo
    html: `
        <div> 
            <h1>¡Wassup!</h1>
            <p>Este es un correo de prueba.</p>
        </div>`,
    attachments: [
      {
        filename: "Buitre_01.jpg",
        path: "./public/imgs/buitre_01.jpg",
        cid: "buitre",
      },
    ],
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    logger.info("Correo enviado: " + info.response);
    res.send("Correo enviado correctamente.");
  } catch (error) {
    logger.info(error);
    res.status(500).send("Hubo un error al enviar el correo.");
  }
});

app.get("/mail", (req, res) => {
  res.send("Ruta GET /mail funcionando correctamente.");
});

export default transporter;