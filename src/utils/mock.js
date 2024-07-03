import { fakerDE as faker } from "@faker-js/faker";

export default function setupMockRoutes(app) {
  app.get("/mockingproducts", (req, res, next) => {
    try {
      let products = [];
      for (let i = 0; i < 100; i++) {
        products.push({
          name: faker.commerce.productName(),
          price: faker.commerce.price(),
          // Agregar más campos si se requieren
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
}

export { errorDictionary };