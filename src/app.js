import express from "express";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

import productsRouter from "./routes/productsRouter.js";
import cartsRouter from "./routes/cartsRouter.js";
import viewsRouter from "./routes/viewsRouter.js";
import cookiesRouter from "./routes/cookiesRouter.js";
import sessionsRouter from "./routes/sessionsRouter.js";
import recoveryRoutes from "./routes/recoveryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import usersRouter from "./routes/usersRouter.js";
import multer from "multer";

import __dirname from "./utils/utils.js";
import config from "./config/config.js";
import logger from "./utils/logger.js";
import { enviarCorreoRecuperacion } from "./socialnet/mailer.js";

const app = express();
const PORT = process.env.PORT || 8080;
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
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "handlebars");

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/auth", usersRouter);
app.use("/", viewsRouter);
app.use("/cookies", cookiesRouter);
app.use("/recovery", recoveryRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// swagger para productos
const swaggerOptionsProducts = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Products API",
      version: "1.0.0",
      description: "A simple products API",
    },
  },
  apis: ["./src/docs/Products/products-api.yaml"],
};

const specsProducts = swaggerJSDoc(swaggerOptionsProducts);

// swagger para carritos
const swaggerOptionsCarts = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Carts API",
      version: "1.0.0",
      description: "A simple carts API",
    },
  },
  apis: ["./src/docs/Carts/carts-api.yaml"],
};

const specsCarts = swaggerJSDoc(swaggerOptionsCarts);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specsProducts));
app.use("/api-carts", swaggerUI.serve, swaggerUI.setup(specsCarts));

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  logger.error(`Stack: ${err.stack}`);
  const status = err.status || 500;
  const message = errorDictionary[err.message] || "¡Algo salió mal!";
  res.status(status).send(message);
});

app.get("/mockingproducts", (req, res, next) => {
  try {
    let products = [];
    for (let i = 0; i < 100; i++) {
      products.push({
        name: faker.commerce.productName(),
        price: faker.commerce.price(),
        // agregar + campos si se requieren
      });
    }
    res.json(products);
  } catch (err) {
    next(err);
  }
});

const errorDictionary = {
  ProductNotFound: "El producto no se encontró",
  CartNotFound: "El carrito no se encontró",
};

const connection = async () => {
  try {
    await mongoose.connect(uri);
    logger.info("Conexión a la base de datos exitosa");
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

connection();

process.on("SIGINT", closeServer);
process.on("SIGTERM", closeServer);

async function closeServer() {
  try {
    await mongoose.connection.close();
    logger.info("conexion a la base de datos cerrada");
  } catch (error) {
    logger.error("error al cerrar la conexion a la base de datos");
  }

  httpServer.close((err) => {
    if (err) {
      logger.error("Hubo un error al cerrar el servidor HTTP:", err);
    } else {
      logger.info("servidor HTTP cerrado exitosamente.");
    }
  });

  socketServer.close((err) => {
    if (err) {
      logger.error("Hubo un error al cerrar el servidor de socket:", err);
    } else {
      logger.info("servidor de socket cerrado exitosamente.");
    }
  });

  process.exit(0);
}

app.post("/mail", async (req, res) => {
  const { email, token } = req.body;
  if (!email || !token) {
    return res.status(400).send("Faltan datos necesarios.");
  }

  try {
    await enviarCorreoRecuperacion(email, token);
    res.send("Correo de recuperación enviado correctamente.");
  } catch (error) {
    logger.error(error);
    res.status(500).send("Error al enviar el correo de recuperación.");
  }
});

// config de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// endpoint para subir archivos
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  res.send("Archivo subido exitosamente");
});


export default app;
