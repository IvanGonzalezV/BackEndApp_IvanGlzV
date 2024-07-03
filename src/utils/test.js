import chai from "chai";
import chaiHttp from "chai-http";
import app from "./app.js";
import logger from "./logger.js";

chai.use(chaiHttp);
const { expect } = chai;

// prueba para ratu get /api/products

describe("GET /api/products", () => {
  it("should return all products", (done) => {
    chai
      .request(app)
      .get("/api/products")
      .end((err, res) => {
        if (err) {
          logger.error(err); // Registra el error en mi logger
        }
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        done();
      });
  });
});

// prueba para ruta post /api/admin
describe("POST /api/admin", () => {
  it("should return a success message", (done) => {
    chai
      .request(app)
      .post("/api/admin")
      .end((err, res) => {
        if (err) {
          logger.error(err); // Registra el error en mi logger
        }
        expect(res).to.have.status(200);
        expect(res.text).to.equal("Ruta POST /api/admin alcanzada");
        done();
      });
  });
});

// prueba para ruta get /some-protected-route
describe("GET /some-protected-route", () => {
  it("should return a success message", (done) => {
    chai
      .request(app)
      .get("/some-protected-route")
      .end((err, res) => {
        if (err) {
          logger.error(err); // Registra el error en mi logger
        }
        expect(res).to.have.status(200);
        expect(res.text).to.equal("Bienvenido a la ruta protegida!");
        done();
      });
  });
});

// prueba para ruta get /api/admin-route
describe("GET /admin-route", () => {
  it("should return a success message", (done) => {
    chai
      .request(app)
      .get("/admin-route")
      .end((err, res) => {
        if (err) {
          logger.error(err); // Registra el error en mi logger
        }
        expect(res).to.have.status(200);
        expect(res.text).to.equal(
          "Bienvenido administrador a tu ruta exclusiva!"
        );
        done();
      });
  });
});

// prueba para ruta post /mail
describe("POST /mail", () => {
  it("should return a success message", (done) => {
    chai
      .request(app)
      .post("/mail")
      .end((err, res) => {
        if (err) {
          logger.error(err); // Registra el error en mi logger
        }
        expect(res).to.have.status(200);
        expect(res.text).to.equal("Correo enviado correctamente.");
        done();
      });
  });
});

// prueba para ruta get /mail
describe("GET /mail", () => {
  it("should return a success message", (done) => {
    chai
      .request(app)
      .get("/mail")
      .end((err, res) => {
        if (err) {
          logger.error(err); // Registra el error en mi logger
        }
        expect(res).to.have.status(200);
        expect(res.text).to.equal("Ruta GET /mail funcionando correctamente.");
        done();
      });
  });
});

// prueba para ruta get /sms
describe("GET /sms", () => {
  it("should return a success message", (done) => {
    chai
      .request(app)
      .get("/sms")
      .end((err, res) => {
        if (err) {
          logger.error(err); // Registra el error en mi logger
        }
        expect(res).to.have.status(200);
        expect(res.text).to.equal("SMS enviado correctamente.");
        done();
      });
  });
});

// prueba para ruta /mockingproducts
describe("GET /mockingproducts", () => {
  it("should return an array of products", (done) => {
    chai
      .request(app)
      .get("/mockingproducts")
      .end((err, res) => {
        if (err) {
          logger.error(err); // Registra el error en mi logger
        }
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
        done();
      });
  });
});