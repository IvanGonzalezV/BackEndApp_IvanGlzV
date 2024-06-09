import express from "express";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import { ObjectId } from "mongodb";
import productsRouter from "./routes/productsRouter.js";
import cartsRouter from "./routes/cartsRouter.js";
import viewsRouter from "./routes/viewsRouter.js";
import cookiesRouter from "./routes/cookiesRouter.js";
import sessionsRouter from "./routes/sessionsRouter.js";
import __dirname from "./utils.js";
import { PMDB } from "./dao/productManagerDB.js";
import { CMDB } from "./dao/cartManagerDB.js";
import { authorize } from "./middlewares/auth.js";
import { requireRole } from "./middlewares/auth.js";
import config from "./config.js";
import nodemailer from "nodemailer";
import twilio from "twilio";
import { fakerDE as faker } from "@faker-js/faker";
import logger from "./logger.js";

const app = express();

const PORT = 8080;

const uri = config.MONGODB_URI;

const httpServer = app.listen(PORT, () => {
  logger.info(`Servidor activo en http://localhost:${PORT}`);
});

const socketServer = new Server(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/../public`));
app.use(cookieParser());
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: uri,
      ttl: 600,
    }),
    secret: config.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

app.engine("handlebars", handlebars.engine());
app.set("views", `${__dirname}/views`);
app.set("view engine", "handlebars");

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/auth", sessionsRouter);
app.use("/", viewsRouter);
app.use("/cookies", cookiesRouter);

app.post("/api/admin", (req, res) => {
  // Tu código aquí. Por ejemplo, puedes enviar una respuesta de prueba:
  res.send("Ruta POST /api/admin alcanzada");
});

// Ruta protegida
app.get("/some-protected-route", authorize, (req, res) => {
  // validar el codigo para manejar la ruta
  // mensaje de bienvenida al usuario
  res.send("Bienvenido a la ruta protegida!");
});

// Ruta de administrador
app.get("/admin-route", authorize, requireRole("admin"), (req, res) => {
  // validar el codigo para manejar la ruta
  // mensaje de bienvenida al admin
  res.send("Bienvenido administrador a tu ruta exclusiva!");
});

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send("¡Algo salió mal!");
});

const connection = async () => {
  try {
    await mongoose.connect(uri);
  } catch (error) {
    logger.error(error);

    throw error;
  }
};

connection();

function generateNewCartId() {
  return new ObjectId().toString();
}

socketServer.on("connection", (socket) => {
  let cartId = socket.handshake.headers.cookie.cartId;

  if (!cartId) {
    cartId = generateNewCartId();

    socket.emit("newCartId", cartId);
  }

  logger.info("nuevo cliente conectado");

  socket.on("addProduct", async (data) => {
    try {
      const result = await PMDB.addProduct(...data);

      if (!result) {
        socket.emit(
          "errorOnCreation",
          "Hubo un error al crear el producto. Asegurate de llenar todos los campos con los datos solicitados y que el producto previamente no exista en la base de datos"
        );
        return;
      }

      const products = await PMDB.getProducts();
      socket.emit("getProducts", products);
    } catch (error) {
      logger.error(error.message);
      socket.emit("error", {
        message: "Hubo un error al agregar el producto.",
      });
    }
  });

  socket.on("deleteProduct", async (data) => {
    try {
      await PMDB.deleteProduct(data);

      const products = await PMDB.getProducts();

      socket.emit("getProducts", products);
    } catch (error) {
      logger.error(error.message);
    }
  });

  socket.on("addToCart", async (data) => {
    try {
      await CMDB.addProductToCart(data, cartId);

      socket.emit("addedSuccessfully", data);
    } catch (error) {
      logger.error(error.message);
    }
  });

  socket.on("deleteProductFromCart", async (data) => {
    try {
      await CMDB.deleteProductFromCart(data, cartId);

      let cart = await CMDB.getAllCartProducts(cartId);

      socket.emit("getProductsFromCart", cart.products);
    } catch (error) {
      logger.error(error.message);
    }
  });
});

process.on("SIGINT", closeServer);
process.on("SIGTERM", closeServer);

async function closeServer() {
  logger.info("cerrando el servidor...");

  httpServer.close(() => {
    logger.info("servidor HTTP cerrado.");
  });

  socketServer.close(() => {
    logger.info("servidor de socket cerrado");
  });

  try {
    await mongoose.connection.close();
    logger.info("conexion a la base de datos cerrada");
  } catch (error) {
    logger.error("error al cerrar la conexion a la base de datos");
  }

  process.exit(0);
}

//gmail
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

//sms (twilio)
app.get("/sms", async (req, res) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = twilio(accountSid, authToken);

  try {
    await client.messages.create({
      body: "¡Wassup Dough! Este es un SMS de prueba, loco.",
      from: process.env.TWILIO_SMS_NUMBER,
      to: "+525522203242",
    });
    res.send("SMS enviado correctamente.");
  } catch (error) {
    logger.info(error);
    res.status(500).send("Hubo un error al enviar el SMS.");
  }
});

app.get("/mockingproducts", (req, res, next) => {
  try {
    let products = [];
    for (let i = 0; i < 100; i++) {
      products.push({
        name: faker.commerce.productName(),
        price: faker.commerce.price(),
        // Agrega aquí más campos según el formato de tus productos
      });
    }
    res.json(products);
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Mocking Server Error";
  res.status(status).send(message);
})

const errorDictionary = {
  ProductNotFound: "El producto no se encontró",
  CartNotFound: "El carrito no se encontró",
};
