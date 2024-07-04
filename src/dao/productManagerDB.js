import mongoose from "mongoose";
import { productModel } from "../dao/models/productModel.js";
import { paginate } from "mongoose-paginate-v2";

export class productManagerDB {
  async addProduct(
    user,
    title,
    description,
    price,
    stock,
    category,
    status,
    thumbnails
  ) {
    if (
      !title ||
      !description ||
      !price ||
      !stock ||
      !category ||
      user.role !== "premium"
    ) {
      throw new Error(
        "Faltan datos obligatorios o el usuario no tiene permisos."
      );
    }

    try {
      const productExisting = await this.getProductByTitle(title);
      if (productExisting) {
        throw new Error("El producto ya existe.");
      }
      const result = await productModel.create({
        title,
        description,
        price,
        stock,
        category,
        status,
        thumbnails,
        owner: user.email, // Asigna el correo electrónico del usuario como owner
      });

      console.log("Producto creado correctamente");
      return result;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  async deleteProduct(user, id) {
    try {
      const product = await this.getProductById(id);
      if (!product) {
        throw new Error("Producto no encontrado.");
      }

      if (product.owner !== user.email && !user.isAdmin) {
        throw new Error("No tienes permiso para eliminar este producto.");
      }

      await productModel.deleteOne({ _id: id });
      console.log("Producto eliminado correctamente.");
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }

  async getProductByTitle(title) {
    try {
      const result = await productModel.findOne({ title: title });
      if (!result) {
        return;
      }
      return result;
    } catch (error) {
      console.error(error.message);
    }
  }

  async getProducts() {
    try {
      const result = await productModel.find().lean();
      return result;
    } catch (error) {
      console.error(error.message);
    }
  }

  async getProductById(id) {
    try {
      const result = await productModel.findOne({ _id: id });
      if (!result) {
        return;
      }
      return result;
    } catch (error) {
      console.error(error.message);
    }
  }

  async updateProduct(id, update) {
    try {
      const productToUpdate = await this.getProductById(id);
      if (!productToUpdate) {
        return;
      }
      const result = await productModel.updateOne({ _id: id }, update);
      return result;
    } catch (error) {
      console.error(error.message);
    }
  }

  async deleteProduct(id) {
    try {
      const productExists = await this.getProductById(id);
      if (!productExists) {
        return;
      }
      const result = await productModel.deleteOne({ _id: id });
      return result;
    } catch (error) {
      console.error(error.message);
    }
  }
}

export const PMDB = new productManagerDB();
