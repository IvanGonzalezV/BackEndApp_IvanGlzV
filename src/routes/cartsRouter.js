import { Router } from "express";
import { CMDB } from "../dao/cartManagerDB.js";
import { cartModel } from "../dao/models/cartModel.js"
import { Ticket } from "../dao/models/ticketModel.js"


const router = Router()

router.post("/", async (req, res) => {

    try{
        
        const result = await CMDB.createCart()

        if(!result){

            return res.status(400).send({message: "Hubo un error al crear el carrito :("})

        }

        return res.status(200).send({message: `Carrito creado correctamente: ${result}`})

    }catch(error){
        
        console.error(error.message)

    }

})

router.post("/:cartid/products/:productid", async (req, res)=>{
    const productId = req.params.productid;
    const cartId = req.params.cartid;
    try {
        const result = await CMDB.addProductToCart(productId, cartId);
        if(!result){
            return res.status(400).send({message:"Hubo un error añadiento el producto al carrito. Asegurate de que existe un carrito y un producto con ese ID"});
        }
        const cart = await cartModel.findById(cartId).populate('products.product');
        return res.status(200).send({message:`El producto ${productId} fue añadido correctamente al carrito ${cartId}`, cart});
    } catch(error) {
        console.error(error.message);
    }
});

router.post('/:cid/purchase', async (req, res) => {
    const cartId = req.params.cid;
    const cart = await CMDB.getCart(cartId);

    if (!cart) {
        return res.status(404).send({ error: 'Carrito no encontrado' });
    }

    const failedProducts = [];
    let totalAmount = 0;

    for (const product of cart.products) {
        if (product.quantity > product.product.stock) {
            failedProducts.push(product.product._id);
        } else {
            totalAmount += product.quantity * product.product.price;
            product.product.stock -= product.quantity;
            await product.product.save();
        }
    }

    if (failedProducts.length > 0) {
        return res.status(400).send({ error: 'No se pudo procesar la compra', failedProducts });
    }

    const Ticket = new Ticket({
        code: generateUniqueCode(), // Necesitas implementar esta función
        amount: totalAmount,
        purchaser: req.session.user.email // Asegúrate de que el usuario esté en la sesión
    });

    await Ticket.save();

    cart.products = cart.products.filter(product => !failedProducts.includes(product.product._id));
    await cart.save();

    res.send({ message: 'Compra exitosa', Ticket });
});

router.get("/", async (req, res)=>{

    try{

        const result = await CMDB.getCarts()

        if(!result){

            return res.status(400).send({message:"Hubo un error al obtener los carritos"})

        }

        return res.status(200).send({carts: result})

    }catch(error){

        console.error(error.message)

    }


})

router.get("/:cartid", async (req, res) => {
    try {
        const cart = await cartModel.findById(req.params.cartid).populate('products.product');
        if (cart) {
            res.json(cart);
        } else {
            res.status(404).send('Carrito no encontrado');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error al obtener el carrito');
    }
});

router.delete("/:cartid/products/:productid", async (req, res)=>{ 

    const cartId = req.params.cartid

    const productId = req.params.productid

    try{

        const result = await CMDB.deleteProductFromCart(productId, cartId)

        if(!result){

            return res.status(400).send({message:"Hubo un error al eliminar el producto del carrito. Asegurese de que exista un carrito y un producto con esos ID"})

        }

        return res.status(200).send({message: result})


    }catch(error){

        console.error(error.message)

    }

})

router.delete("/:cartid", async (req, res)=>{

    const cartId = req.params.cartid

    try{

        const result = await CMDB.deleteAllProductsFromCart(cartId)

        if(!result){

            return res.status(400).send({message:"Hubo un error al intentar eliminar todos los productos del carrito. Asegurese de que ese ID corresponda a un carrito"})

        }

        return res.status(200).send({message: "Todos los productos han sido eliminados del carrito"})

    }catch(error){

        console.error(error.message)

    }

})

router.put("/:cartid/products/:productid", async (req, res)=>{
    const cartId = req.params.cartid;
    const productId = req.params.productid;
    const { quantity } = req.body;
    try {
        const result = await CMDB.updateProductQuantity(cartId, productId, quantity);
        if(!result){
            return res.status(400).send({message: "Hubo un error al actualizar el producto. Asegurate de que los ID correspondan a un carrito y producto existentes"});
        }
        const cart = await cartModel.findById(cartId).populate('products.product');
        return res.status(200).send({message:"Se ha actualizado el carrito correctamente", cart});
    } catch(error) {
        console.error(error.message);
    }
});

router.put("/:cartid", async (req, res)=>{

    const cartId = req.params.cartid

    const {products} = req.body 

    try{

        const result = await CMDB.updateCartProducts(cartId, products)

        if(!result){

            return res.status(400).send({message:"Hubo un error al actualizar el carrito. Intentelo de nuevo"})

        }

        return res.status(200).send({message:"Carrito actualizado correctamente", result: result})

    }catch(error){

        console.error(error.message)

    }

})

export default router