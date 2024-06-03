import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2"

const productsCollection = "products"

const productSchema = new mongoose.Schema({
    title:{
        type: String,
        require: true
    },
    description:{
        type: String,
        require: true
    },
    price:{
        type: Number,
        require: true
    },
    stock:{
        type: Number,
        require: true
    },
    category:{
        type: String,
        require: true
    },
    status:{
        type: Boolean,
        require: false,
        default: true
    },
    thumbnails:{
        type: Array,
        require: false,
        default: []
    }
})

productSchema.plugin(mongoosePaginate)

export const productModel = mongoose.model(productsCollection, productSchema)