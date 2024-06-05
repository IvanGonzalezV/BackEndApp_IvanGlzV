import { cartModel } from "../dao/models/cartModel.js"
import { productModel } from "../dao/models/productModel.js"

export class cartManagerDB {

    async createCart() {

        try{

            const result = await cartModel.create({

                products: []

            })

            return result

        }catch(error){

            console.error(error.message)

        }

    }
    
    async getCarts() {

        try{

            const result = await cartModel.find()

            if(!result){

                console.log("hubo un error")

                return
            }

            return result

        }catch(error){

            console.error(error.message)

        }

    }

    async getCart(cartId) {

        try{
        
            const result = await cartModel.findOne({_id:cartId})

            if(!result){

                return

            }

            return result
        
        }catch(error){

            console.error(error.message)

        }

    }

    async getCartProduct(productId, cartId){

        try{

            const cartRequired = await cartModel.findOne({_id:cartId})

            if(!cartRequired){

                return

            }

            const productRequired = cartRequired.products.find(product => product.product == productId)

            return productRequired

        }catch(error){

            console.error(error.message)

        }

    }
    
    async getAllCartProducts(cartId) { 

        try{

            const result = await cartModel.findOne({_id:cartId}).populate("products.product").lean()

            if(!result){

                return

            }

            return result

        }catch(error){

            console.error(error.message)

        }

    }

    async addProductToCart(productId, cartId) {
    try {
        // Buscar el producto por su productId
        const product = await productModel.findById(productId);

        // Si el producto no existe o no hay suficiente stock, lanzar un error
        if (!product || product.stock < 1) {
            throw new Error('Producto no disponible o sin stock');
        }

        // Buscar el carrito por su cartId
        let cart = await cartModel.findById(cartId);

        // Si el carrito no existe, crear uno nuevo
        if (!cart) {
            cart = new cartModel({ _id: cartId, products: [] });
        }

        // Agregar el producto al carrito
        cart.products.push({ product: productId, quantity: 1 });

        // Guardar el carrito en la base de datos
        await cart.save();

        // Reducir el stock del producto en 1
        product.stock -= 1;
        await product.save();

        return cart;
    } catch (error) {
        console.error(error.message);
    }
}

    async deleteProductFromCart(productId, cartId) {
    try {
        // Busca el producto por productId
        const product = await productModel.findById(productId);

        // Si el producto no existe, lanza error
        if (!product) {
            throw new Error('Producto no encontrado');
        }

        const validateProduct = await cartModel.findOne({_id:cartId, "products.product": productId})

        if(!validateProduct){
            return
        }

        const result = await cartModel.updateOne({_id:cartId, "products.product": productId},{$pull: { products: {product: productId }}})

        if(!result){
            return
        }

        // Incrementar el stock del producto en 1
        product.stock += 1;
        await product.save();

        return result;
    } catch (error) {
        console.error(error.message);
    }
}

    async deleteAllProductsFromCart(cartId){ //FUNCIONS, despues puedo modificarla para que primero verifique que haya productos en el carrito antes de eliminar

        try{

            const validateCart = await cartModel.findOne({_id:cartId})

            if(!validateCart){

                return 
            
            }

            const result = await cartModel.updateOne({_id:cartId},{products:[]})

            return result

        }catch(error){

            console.error(error.message)
        }
    }

    async deleteCart(cartId){

        try{

            const validateCart = await cartModel.findOne({_id: cartId})

            if(!validateCart){

                return

            }

            const result = await cartModel.deleteOne({_id: cartId})

            if(!result){

                return

            }

            return result

        }catch(error){

            console.error(error.message)

        }
    }

    async updateProductQuantity(cartId, productId, quantity){

        try{

            const validateCart = await cartModel.findOne({_id: cartId})

            if(!validateCart){

                console.log("carrito inexistwente")
                return

            }

            const productInCart = validateCart.products.find(prod => prod.product == productId)

            if(!productInCart){

                return 

            }

            const result = await cartModel.updateOne({_id:cartId, "products.product": productId},{$set: {"products.$.quantity":quantity} })

            if(!result){

                return

            }

            return result

        }catch(error){

            console.error(error.message)

        }

    }

    async updateCartProducts(cartId, products){

        try{

            const validateCart = await cartModel.findOne({_id:cartId})

            if(!validateCart){

                return

            }

            const result = cartModel.updateOne({_id:cartId},{products:products})

            return result

        }catch(error){

            console.error(error.message)

        }

    }
}

export const CMDB = new cartManagerDB 


