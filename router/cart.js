import express from "express";
import bodyParser from "body-parser";
import { getProductById } from "../helpers/productCollection.js";
import { generateId } from "../helpers/utils.js";
import { localStorage } from "../app.js";
import { addToCart, deleteCart, getCartById, getCartItemById, removeCartItem, updateCart } from "../helpers/cartCollection.js";

const cartRouter = express.Router();

cartRouter.use(bodyParser.urlencoded({ extended: true }));
cartRouter.use((bodyParser.json()));

cartRouter.post('/getCartById', async (req, res) => {
    const { cartId } = req.body;
    const item = await getCartById(cartId);
    res.send(item);
});

cartRouter.post('/getCartItemById', async (req, res) => {
    const { cartId, itemId } = req.body;
    const item = await getCartItemById(cartId, itemId);
    res.send(item);
});

cartRouter.post('/addItemToCart', async (req, res) => {
    const { productId, quantity } = req.body;
    const cartIdFromStorage = localStorage.getItem('cartId');
    let cartId = undefined;
    if(cartIdFromStorage) {
        cartId = cartIdFromStorage;
    } else {
        const id = generateId();
        localStorage.setItem('cartId', id);
        cartId = id;
    }
    console.log("CartId: ", cartIdFromStorage, cartId);

    const product = await getProductById(productId);
    const item = { itemId: generateId(), itemName: product.productName, quantity };
    // console.log("Item: ", item, product);

    const addedCart = await addToCart(cartId, item, +product.price);
    // res.status(200).send(addedCart);
    res.redirect('/goToPurchaseFlow');
});

cartRouter.put('/updateCartItem', async (req, res) => {
    const cartId = localStorage.getItem('cartId');
    console.log("CartId: ", cartId);
    if(!cartId) {
        return res.status(400).json({ message: "No cart present to update" });
    }
    const { itemId, quantity } = req.body;
    console.log("Cart: ", itemId, quantity);
    const updatedProduct = await updateCart(cartId, itemId, quantity);
    res.status(200).send(updatedProduct);
});

cartRouter.delete('/removeItem', async (req, res) => {
    const cartId = localStorage.getItem('cartId');
    if(!cartId) {
        return res.status(400).json({ message: "No cart present to delete item" });
    }
    const { itemId } = req.body;
    const deletedProduct = await removeCartItem(cartId, itemId);
    res.status(200).send({ message:"Item deleted successfully" });
});

cartRouter.delete('/removeCart', async (req, res) => {
    const cartId = localStorage.getItem('cartId');
    if(!cartId) {
        return res.status(400).json({ message: "No cart is present to delete" });
    }
    const deletedProduct = await deleteCart(cartId);
    localStorage.removeItem('cartId');
    res.status(200).send({ message:"Cart deleted successfully" });
    // res.redirect('/viewAdmin);
});

module.exports = cartRouter;