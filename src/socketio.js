import { Server } from "socket.io";
import { ObjectId } from "mongodb";
import { PMDB } from "./dao/productManagerDB.js";
import { CMDB } from "./dao/cartManagerDB.js";
import logger from "./logger.js";

const socketServer = new Server(httpServer);

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
      const product = await PMDB.getProduct(data.productId);
      if (!product) {
        socket.emit("error", { message: "Producto no encontrado." });
        return;
      }
      if (data.quantity <= 0) {
        socket.emit("error", { message: "Cantidad inválida." });
        return;
      }
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

export default socketServerImport