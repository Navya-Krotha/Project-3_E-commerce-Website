import { client } from "../app.js";

const getAllProducts = async () => {
    return await client.db('NodeJs-Project-3').collection("products").find().toArray();
}

const getProductById = async (productId) => {
    return await client.db('NodeJs-Project-3').collection("products").findOne({ productId });
}

const getProductByQuery = async (productQuery) => {
    return await client.db('NodeJs-Project-3').collection("products").findOne(productQuery);
}

const addProduct = async (newProduct) => {
    return await client.db('NodeJs-Project-3').collection("products").insertOne(newProduct);
}

const updateProduct = async (productId, updatedProductInfo) => {
    return await client.db('NodeJs-Project-3').collection("products").updateOne(
        { productId }, 
        { $set: updatedProductInfo}
    );
}

const deleteProduct = async (productId) => {
    return await client.db('NodeJs-Project-3').collection("products").deleteOne({ productId });
}

export { getAllProducts, getProductById, getProductByQuery, addProduct, updateProduct, deleteProduct };