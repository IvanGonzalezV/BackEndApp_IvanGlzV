import { Router } from "express";
import { PMDB } from "../dao/Dao/productManagerDB.js";
import { productModel } from "../dao/models/productModel.js";

const router = Router()

router.get("/", async (req, res) => {

    let { limit, page, sort, category, status } = req.query

    let sortOptions 

    try{
        if(sort == "asc"){
                sortOptions = {price:1}
            }else if(sort == "desc"){
                sortOptions={price:-1}
            }else{
                sortOptions = {}
        }

        let filter  
    
        if(category){
            filter = {category:category}
        }else if(status){
            filter = {status:status}
        }else{
            filter = {}
        }

        let products = await productModel.paginate(filter,{limit:limit ? limit : 10, page:page ? page : 1, sort: sortOptions})

        res.status(200).send({status:"success",
            payload: products.docs,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.hasPrevPage ? `http://localhost:8080/api/products?page=${products.prevPage}` : null,
            nextLink: products.hasNextPage ? `http://localhost:8080/api/products?page=${products.nextPage}` : null
        })

    } catch(error){

        res.status(400).send({
            status: "error",
            error: error.message
        })

    }
})

router.get("/:productid", async (req, res) => {

    let productId = req.params.productid

    try{

        let productRequired = await PMDB.getProductById(productId)

        !productRequired ?

            res.status(404).send({message: "No existe un producto con ese id"}) :

            res.status(200).send(productRequired)

    }catch(error){

        console.error(error.message)

    }

})

router.post("/", async (req, res) => {
    
    const { title, description, price, stock, category, status, thumbnails } = req.body
    
    try{

        const addedProduct = await PMDB.addProduct( title, description, price, stock, category, status, thumbnails )

        if(!addedProduct){

            return res.status(400).send({

                message:"Hubo un error al crear el producto. Asegurate de haber completado todos los campos y que el producto no exista en la base de datos"

            })

        }

        return res.status(201).send({message: "Producto creado correctamente"})

    }catch(error){
        
        console.error(error.message)

    }

})

router.put("/:productid", async (req, res) => {

    try{

        const updatedProduct = await PMDB.updateProduct(req.params.productid,req.body)

        if(!updatedProduct){
            
            return res.status(400).send({message:"Hubo un error modificando el producto. Asegurate de que el ID del producto y el campo a modificar existan y que la modificacion posea un valor valido"})

        }

        return res.status(200).send({
            message:"El producto ha sido modificado correctamente"
        })

    }catch(error){

        console.error(error.message)

    }

    

})

router.delete("/:productid", async (req, res) => {

    const productId = req.params.productid

    try{

        const deletedProduct = await PMDB.deleteProduct(productId)

        if(!deletedProduct){

            return res.status(400).send({
                message:"Hubo un error al intentar eliminar el producto. Asegurate de que el ID proporcionado coincida con el de un producto existente"
            })
        }

        return res.status(200).send({message: "Producto eliminado correctamente"})

    }catch(error){

        console.error(error.message)

    }
})

export default router