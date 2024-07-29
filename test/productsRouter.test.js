import { expect } from "chai";
import supertest from "supertest";
import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import app from "../src/app.js";
import config from "../src/config/config.js";

const token = config.JWT_SECRET; // config del token

describe("API de productos", function () {
  this.timeout(20000); // setea el tiempo de espera para las pruebas

  // hook que establece la conexion a la DB antes de las pruebas
  before(async () => {
    try {
      await mongoose.connect(config.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Conexión a la base de datos establecida");
    } catch (error) {
      console.error("Error al conectar a la base de datos", error);
      throw error;
    }
  });

  // hook para cerrar la conexion a la db despues de las pruebas
  after(async () => {
    await mongoose.disconnect();
  });

  // test para GET "/"
  describe("GET /api/products", () => {
    it("debería retornar todos los productos", async () => {
      const response = await supertest(app)
        .get("/api/products")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("object");
      expect(response.body.status).to.equal("success");
      expect(response.body.payload).to.be.an("array");
    });
  });

  // test para POST "/"
  describe("POST /api/products", () => {
    it("debería crear un nuevo producto", async () => {
      const newProduct = {
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price(),
        stock: faker.number.int({ min: 1, max: 100 }),
        category: faker.commerce.department(),
        status: "Disponible",
        thumbnails: [faker.image.url()],
      };
      const response = await supertest(app)
        .post("/api/products")
        .set("Authorization", `Bearer ${token}`)
        .send(newProduct);
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property(
        "message",
        "Producto creado correctamente"
      );
    });
  });

  // test para GET "/:productid"
  describe("GET /api/products/:productid", () => {
    it("debería retornar un producto por su ID", async () => {
      // ID existente en la DB para el test
      const productId = "661f8219a5b7e2f6dbf013ea";
      const response = await supertest(app)
        .get(`/api/products/${productId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("object");
      expect(response.body._id).to.equal(productId);
    });
  });

  // test para PUT "/:productid"
  describe("PUT /api/products/:productid", () => {
    it("debería actualizar un producto existente", async () => {
      // ID existente en la DB para el test
      const productId = "661f8219a5b7e2f6dbf013e4";
      const productUpdate = {
        title: "Producto Actualizado",
        price: 150,
      };
      const response = await supertest(app)
        .put(`/api/products/${productId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(productUpdate);
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property(
        "message",
        "El producto ha sido modificado correctamente"
      );
    });
  });

  // test para DELETE "/:productid"
  describe("DELETE /api/products/:productid", () => {
    it("debería eliminar un producto existente", async () => {
      // ID existente en la DB para el test
      const productId = "661f8219a5b7e2f6dbf013e9";
      const response = await supertest(app)
        .delete(`/api/products/${productId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property(
        "message",
        "Producto eliminado correctamente"
      );
    });
  });
});
