import * as chai from "chai";
import mongoose from "mongoose";
import request from "supertest";
import app from "../src/app.js";
import config from "../src/config/config.js";

const { assert } = chai;

const uri = config.MONGODB_URI;
const logger = console; // console como logger para simplificar

const connection = async () => {
  try {
    await mongoose.connect(uri);
    logger.info("Conexión a la base de datos exitosa");
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

describe("test ProductsRouter", function () {
  before(async function () {
    await connection();
  });

  after(async function () {
    await mongoose.disconnect();
  });

  it('get("/:productid") debe de retornar un producto por su id', function (done) {
    const productId = "661f8219a5b7e2f6dbf013ea";
    request(app)
      .get(`/api/products/${productId}`)
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, "_id");
        assert.equal(res.body._id, productId);
        done();
      });
  });
});
