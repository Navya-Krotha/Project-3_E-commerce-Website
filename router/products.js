import express from "express";
import bodyParser from "body-parser";
import { addProduct, deleteProduct, getProductById, updateProduct } from "../helpers/productCollection.js";
import { generateId } from "../helpers/utils.js";

const productRouter = express.Router();

productRouter.use(bodyParser.urlencoded({ extended: true }));
productRouter.use((bodyParser.json()));

productRouter.post('/addProduct', async (req, res) => {
    // const { productName, description, price, category, productImage } = req.body;
    const productId = generateId();
    const addedProduct = await addProduct({ productId, ...req.body });
    // res.status(200).send(addedProduct);
    res.redirect('/user/viewHomePage');
});

productRouter.post('/productById', async (req, res) => {
    const { id } = req.body;
    const product = await getProductById(id);
    console.log("Product: ", product);
    res.send(product);
});

productRouter.put('/updateProduct', async (req, res) => {
    const { productId } = req.body;
    const updatedProduct = await updateProduct(productId, req.body);
    console.log(productId, updateProduct);
    res.status(200).send(updatedProduct);
    // res.redirect('/user/viewHomePage');
});

productRouter.delete('/deleteProduct', async (req, res) => {
    const { productId } = req.body;
    const deletedProduct = await deleteProduct(productId);
    if(deletedProduct.deletedCount === 1)
        return res.status(200).send({ message:"Product deleted successfully" });
    else
        return res.status(400).send({ message: "No product found to delete" });
});

module.exports = productRouter;