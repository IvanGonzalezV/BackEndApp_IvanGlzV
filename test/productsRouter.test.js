import * as chai from "chai";
import { expect } from "chai";
import chaiHttp from "chai-http";
import supertest from "supertest";
import app from "../src/app.js";

// config para usar chai-http
chai.use(chaiHttp);

describe("API de productos", () => {
  // test para GET "/"
  describe("GET /api/products", () => {
    it("debería retornar todos los productos", async () => {
      const response = await supertest(app).get("/api/products");
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
        title: "Nuevo Producto",
        description: "Descripción del nuevo producto",
        price: 100,
        stock: 10,
        category: "Categoría",
        status: "Disponible",
        thumbnails: ["http://example.com/thumbnail.jpg"],
      };
      const response = await supertest(app)
        .post("/api/products")
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
      // id existente en la DB para el test
      const productId = "661f8219a5b7e2f6dbf013ea";
      const response = await supertest(app).get(`/api/products/${productId}`);
      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("object");
    });
  });

  // test para PUT "/:productid"
  describe("PUT /api/products/:productid", () => {
    it("debería actualizar un producto existente", async () => {
      // id existente en la DB para el test
      const productId = "661f8219a5b7e2f6dbf013e8";
      const productUpdate = {
        title: "Producto Actualizado",
        price: 150,
      };
      const response = await supertest(app)
        .put(`/api/products/${productId}`)
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
      // id existente en la DB para el test
      const productId = "661f8219a5b7e2f6dbf013e8";
      const response = await supertest(app).delete(
        `/api/products/${productId}`
      );
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property(
        "message",
        "Producto eliminado correctamente"
      );
    });
  });
});
