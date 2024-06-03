import { cartModel } from '../models/cartModel.js'; 

async function getCartById(cartId) {
    try {
        const cart = await cartModel.findById(cartId).populate('products.product');
        return cart;
    } catch (error) {
        console.error(error);
    }
}

export async function getCartById(cartId) {
    // ...
}