import * as chai from "chai";
import chaiHttp from "chai-http";
import mongoose from "mongoose";
import app from "../src/app.js";
import dotenv from "dotenv";

dotenv.config();

const { assert } = chai;
chai.use(chaiHttp); // config para chaihttp

const uri = process.env.MONGODB_URI;
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
    chai
      .request(app)
      .get(`/api/products/${productId}`)
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, "_id");
        assert.equal(res.body._id, productId);
        done();
      });
  });
});
