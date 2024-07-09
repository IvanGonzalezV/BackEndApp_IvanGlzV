import express from "express";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import productsRouter from "./routes/productsRouter.js";
import cartsRouter from "./routes/cartsRouter.js";
import viewsRouter from "./routes/viewsRouter.js";
import cookiesRouter from "./routes/cookiesRouter.js";
import sessionsRouter from "./routes/sessionsRouter.js";
import __dirname from "./utils/utils.js";
import config from "./config/config.js";
import logger from "./utils/logger.js";
import adminRoutes from "./routes/adminRoutes.js";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

const app = express();

const PORT = process.env.PORT || 8080;

const uri = config.MONGODB_URI;

const httpServer = app.listen(PORT, () => {
  logger.info(`Servidor activo en http://localhost:${PORT}`);
});

const socketServer = new Server(httpServer);

app.use(adminRoutes);
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

//swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Products API",
      version: "1.0.0",
      description: "A simple products API",
    },
  },
  apis: [`./**/*.yaml`],
};

const specs = swaggerJSDoc(swaggerOptions);
//endpoint swagger
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

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
        // Agregar + campos si se requieren
      });
    }
    res.json(products); // Envia la respuesta al cliente
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Mocking Server Error";
  res.status(status).send(message);
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

export default app;
