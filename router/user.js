import { localStorage } from "../app.js";
import express from 'express';
import bodyParser from "body-parser";
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import config from "../config.js";
import { addUser, deleteUser, getUser, updateUser } from "../helpers/usersCollection.js";
import { ObjectId } from "mongodb";
import { getAllProducts } from "../helpers/productCollection.js";
import { getAllOrders } from "../helpers/orderCollection.js";

const userRouter = express.Router();

userRouter.use(bodyParser.urlencoded({ extended: true }));
userRouter.use((bodyParser.json()));

userRouter.get('/viewHomePage', async (req, res) => {
    var token = localStorage.getItem('authToken');    
    if(!token)
        return res.redirect('/viewLogin');
    jwt.verify(token, config.secret, async (err, verifiedToken) => {
        if(err) res.status(400).send('Not able to get token');
        else {
            const id = verifiedToken.id;
            const user = await getUser({ _id: new ObjectId(id) });
            console.log("VerifiedToken:", verifiedToken);

            const products = await getAllProducts();
            const allOrders = await getAllOrders();
            const ordersOfCurrentlyLoggedInUser = allOrders.filter(order => order.email == user.email);
            res.render('homePage.ejs', { user, products, orders: ordersOfCurrentlyLoggedInUser });
        }
    });
});

userRouter.post('/addUser', async (req, res) => {
    const{ username, password, email, userType } = req.body;
    const isUserExists = await getUser({ email });
    if(isUserExists) 
        return res.send(400).json({ message: 'User already exists' });
    const hashedPassword = bcrypt.hashSync(password, 8);
    const registeredUser = await addUser({
        username,
        email,
        password: hashedPassword,
        userType
    });
    res.redirect('/viewUserInfo');
})

userRouter.put('/updateUser', async (req, res) => {
    var token = localStorage.getItem('authToken');    
    jwt.verify(token, config.secret, async (err, verifiedToken) => {
        if(err) res.status(400).send('Not able to get token');
        else {
            const id = verifiedToken.id;
            const user = await getUser({ _id: new ObjectId(id) });
            console.log(`Request: ${user}`);
            const email = user.email;
            const response = await updateUser(email, { ...user, ...req.body });
            res.status(200).send(response);
        }
    });
});

userRouter.get('/deleteUser', async (req, res) => {
    var token = localStorage.getItem('authToken');    
    jwt.verify(token, config.secret, async (err, verifiedToken) => {
        if(err) res.status(400).send('Not able to delete User');
        else {
            const id = verifiedToken.id;
            const user = await getUser({ _id: new ObjectId(id) });
            console.log("VerifiedToken:", verifiedToken);
            const response = await deleteUser(user.email);
            localStorage.removeItem('authToken');
            res.redirect('/viewLogin');
            // res.send({ message:"User deleted successfully" });
        }
    });
});

userRouter.get('/logout', (req, res) => {
    console.log("Logout");
    localStorage.removeItem('authToken');
    localStorage.removeItem('cartId');
    res.redirect('/viewLogin');
});

module.exports = userRouter;