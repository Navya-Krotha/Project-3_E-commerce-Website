import { client } from "../app.js";
import { getProductByQuery } from "./productCollection.js";

const getCartById = async (cartId) => {
    return await client.db('NodeJs-Project-3').collection("carts").findOne({ cartId });
}

const getCartItemById = async (cartId, itemId) => {
    const cart = await getCartById(cartId);
    if(cart)
        return cart.items.find(item => item.itemId == itemId);
    return undefined;
}

// When we add items to cart
const addToCart = async (cartId, cartItem, itemUnitPrice) => {
    let cart = await getCartById(cartId);
    console.log("Cart in sc: ", cart);
    const newItemPrice = +cartItem.quantity * +itemUnitPrice;
    if(cart) {
        cart.items = [...cart.items, cartItem];
        cart.price = (cart.price ? cart.price : 0) + newItemPrice;
        return await client.db('NodeJs-Project-3').collection("carts").updateOne(
            { cartId }, { $set: cart }
        );
    } else {
        return await client.db('NodeJs-Project-3').collection("carts").insertOne({ cartId, items: [cartItem], price: newItemPrice });
    }
}

// When we update item quantity in cart
const updateCart = async (cartId, itemId, quantity) => {
    const cart = await getCartById(cartId);
    const item = cart.items.find(item => item.itemId === itemId);
    const otherItems = cart.items.filter(item => item.itemId !== itemId);
    if(quantity == 0) {
        cart.items = otherItems;
    } else {
        const updatedItem = { ...item, quantity };
        cart.items = [...otherItems, updatedItem ];
    }
    cart.price = await getCartPrice(cart.items);
    console.log("Cart price: ", cart.price);
    return await client.db('NodeJs-Project-3').collection("carts").updateOne(
        { cartId }, { $set: cart }
    );
}

const removeCartItem = async (cartId, itemId) => {
    const cart = await getCartById(cartId);
    cart.items = cart.items.filter(item => item.itemId !== itemId);
    cart.price = await getCartPrice(cart.items);
    return await client.db('NodeJs-Project-3').collection("carts").updateOne(
        { cartId }, { $set: cart }
    );
}

const deleteCart = async (cartId) => {
    return await client.db('NodeJs-Project-3').collection("carts").deleteOne({ cartId });
}

const getCartPrice = async (items) => {
    let price = 0;
    for(let i = 0; i < items.length; i++) {
        const product = await getProductByQuery({ productName: items[i].itemName });
        const itemPrice = +items[i].quantity * +product.price;
        price += itemPrice;
    }
    return price;
}

export { getCartById, addToCart, updateCart, removeCartItem, deleteCart, getCartItemById };