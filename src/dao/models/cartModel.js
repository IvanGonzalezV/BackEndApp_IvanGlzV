import mongoose from "mongoose";

const cartsCollection = "carts"

const cartSchema = new mongoose.Schema({
    products: {
        type: [
            {
                product:{
                    type: mongoose.Schema.ObjectId,
                    ref: "products"
                },
                quantity:{
                    type: Number,
                    default: 1
                }
            }
        ],
        default: []
    }
})

export const cartModel = mongoose.model(cartsCollection, cartSchema)
