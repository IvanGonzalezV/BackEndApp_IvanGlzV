import mongoose from "mongoose"
import { productModel } from "../models/productModel.js"
import { paginate } from "mongoose-paginate-v2"

export class productManagerDB {
    
    async addProduct( title, description, price, stock, category, status, thumbnails ) { 

        if( !title || !description || !price || !stock || !category ){
            return 
        }

        try {
            
        const productExisting = await this.getProductByTitle(title)

        if(productExisting){
            return
        }
            const result = await productModel.create({
                title: title,
                description: description,
                price: price,
                stock: stock,
                category: category,
                status: status,
                thumbnails: thumbnails
            })
            
            console.log("producto creado correctamente")
            return result
        } 
        catch(error) {
            console.error(error.message)
        }
    }

    async getProductByTitle(title) {
        try{
            const result = await productModel.findOne({title: title})
            if(!result){
                return 
            }
            return result
        }catch(error){
            console.error(error.message)
        }
    }

    async getProducts() {  
        try{
            const result = await productModel.find().lean()
            return result
        } 
        catch(error){
            console.error(error.message)
        }
    }

    async getProductById(id) {
        try{
            const result = await productModel.findOne({_id: id})

            if(!result){
                return
            }

            return result
        }
        catch(error){
            console.error(error.message)
        }
    }

    async updateProduct(id, update) {

        try{

            const productToUpdate = await this.getProductById(id)

            if(!productToUpdate){

                return

            }

            const result = await productModel.updateOne({_id: id}, update)

            return result

        }
        catch(error){

            console.error(error.message)

        }
    }

    async deleteProduct(id){

        try{

            const productExists = await this.getProductById(id)
        
            if(!productExists){
        
                return
        
            }

            const result = productModel.deleteOne({_id: id})

            return result

        }
        catch(error){

            console.error(error.message)
            
        }
    }
}

    export const PMDB = new productManagerDB


