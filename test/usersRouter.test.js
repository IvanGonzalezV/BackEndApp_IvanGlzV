import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app.js";
import userModel from "../src/dao/models/userModel.js";

describe("Users API", () => {
  before(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  after(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // limpiara la coleccion de usuarios antes de las pruebas
    await userModel.deleteMany({});
  });

  it("Debería registrar un nuevo usuario", async () => {
    const res = await request(app).post("/auth/register").send({
      first_name: "John",
      last_name: "Doe",
      email: "johndoe@example.com",
      age: 30,
      password: "mysecretpassword",
      isAdmin: true,
    });

    if (res.error) {
      console.error(res.error.text);
    }

    if (res.statusCode !== 201) {
      console.error("Expected status code 201, but got", res.statusCode);
    }

    console.log(res.body);

    if (!res.body.token) {
      throw new Error("No se generó un token");
    }
  });

  it("Debería hacer login de un usuario", async () => {
    // registro del usuario
    // datos de usuario los mismos que obtuvimos de las pruebas en postman (token caduca en 24hrs)
    await request(app).post("/auth/register").send({
      first_name: "John",
      last_name: "Doe",
      email: "johndoe@example.com",
      age: 30,
      password: "mysecretpassword",
      isAdmin: true,
    });

    // intentos para hacer login
    const res = await request(app).post("/auth/login").send({
      email: "johndoe@example.com",
      password: "mysecretpassword",
    });

    if (res.error) {
      console.error(res.error.text);
    }

    if (res.statusCode !== 200) {
      console.error("Expected status code 200, but got", res.statusCode);
    }

    console.log(res.body);

    if (!res.body.token) {
      throw new Error("No se generó un token en el login");
    }
  });

  it("Debería obtener los datos del usuario autenticado", async () => {
    // registro del usuario (nuevamente)
    const registerRes = await request(app).post("/auth/register").send({
      first_name: "John",
      last_name: "Doe",
      email: "johndoe@example.com",
      age: 30,
      password: "mysecretpassword",
      isAdmin: true,
    });

    const token = registerRes.body.token;

    // intento para obtener los datos del usuario (autenticado)
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);

    if (res.error) {
      console.error(res.error.text);
    }

    if (res.statusCode !== 200) {
      console.error("Expected status code 200, but got", res.statusCode);
    }

    console.log(res.body);

    if (res.body.email !== "johndoe@example.com") {
      throw new Error("El email del usuario no coincide");
    }
  });
});
