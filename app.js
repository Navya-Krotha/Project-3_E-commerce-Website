import express from "express";
import bodyParser from "body-parser";
import path from 'path';
import { MongoClient } from "mongodb";
import { LocalStorage } from 'node-localstorage';
import authRouter from './router/auth.js';
import cartRouter from './router/cart.js';
import productRouter from './router/products.js';
import ordersRouter from './router/orders.js';
import userRouter from './router/user.js';
import { getAllUsers } from "./helpers/usersCollection.js";
import { getAllProducts } from "./helpers/productCollection.js";
import { getCartById } from "./helpers/cartCollection.js";
import { getAllOrders } from "./helpers/orderCollection.js";
import http from 'http';
const socketIo = require('socket.io');

export const localStorage = new LocalStorage('./scratch');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/auth', authRouter);
app.use('/product', productRouter);
app.use('/orders', ordersRouter);
app.use('/cart', cartRouter);
app.use('/user', userRouter);

const MONGO_URL = 'mongodb://127.0.0.1:27017/';

const createConnection = () => {
    const client = new MongoClient(MONGO_URL);
    client.connect();
    console.log("Mongodb is connected");
    return client;
}

export const client = createConnection();

app.get('/', (req, res) => {
    res.render('index.html');
})

app.get("/viewLogin", (req, res) => {
    const token = localStorage.getItem('authToken');
    if(!!token) return res.redirect('/user/viewHomePage');
    res.render('login.ejs');
});

app.get("/viewRegister", (req, res) => {
    res.render('signup.ejs');
});

app.get('/viewUserInfo', async (req, res) => {
    const users = await getAllUsers();
    res.render('users-info.ejs', { users });
});

app.get('/handleOrders', async (req, res) => {
    const allOrders = await getAllOrders();
    res.render('handleOrders.ejs', { orders: allOrders });
});

app.get('/goToPurchaseFlow', async (req, res) => {
    let cart = { cartId: undefined, items: [] };
    const products = await getAllProducts();
    const cartId = localStorage.getItem('cartId');
    if(cartId) {
        cart = await getCartById(cartId);
    }
    res.render('purchase.ejs', { cart, products });
});

let server = http.createServer(app).listen(PORT, () => 
    console.log(`Server started on PORT ${PORT}`)
);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log("Connected");

    socket.on('disconnect', () => {
        console.log("Client disconnected");
    });
});

export const emitOrderStatusUpdate = (orderInfo) => {
    console.log("Emit called with: ", orderInfo);
    io.emit('orderStatusUpdate', orderInfo);
}