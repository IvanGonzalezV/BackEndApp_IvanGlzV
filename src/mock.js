import { fakerDE as faker } from "@faker-js/faker";

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

export default generateMockProducts;