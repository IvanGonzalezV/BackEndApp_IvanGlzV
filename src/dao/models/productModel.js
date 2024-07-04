import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2"

const productsCollection = "products"

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    required: false,
    default: true,
  },
  thumbnails: {
    type: Array,
    required: false,
    default: [],
  },

  owner: {
    type: String,
    default: "admin", // Valor predeterminado para cuando el producto se crea sin owner en especifico
  }

});

productSchema.plugin(mongoosePaginate)

export const productModel = mongoose.model(productsCollection, productSchema)