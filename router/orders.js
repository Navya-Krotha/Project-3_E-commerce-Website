import express from "express";
import bodyParser from "body-parser";
import * as jwt from 'jsonwebtoken';
import { cancelOrder, getOrderById, placeOrder, updateOrderStatus } from "../helpers/orderCollection.js";
import { generateId } from "../helpers/utils.js";
import { emitOrderStatusUpdate, io, localStorage } from "../app.js";
import config from "../config.js";
import { ObjectId } from "mongodb";
import { getUser } from "../helpers/usersCollection.js";

const ordersRouter = express.Router();

ordersRouter.use(bodyParser.urlencoded({ extended: true }));
ordersRouter.use((bodyParser.json()));

ordersRouter.post('/getOrderById', async (req, res) => {
    const { orderId } = req.body;
    const order = await getOrderById(orderId);
    if(order)
        res.status(200).send(order);
    else
        res.status(400).send({ message: "No order found" });
});

ordersRouter.post('/placeOrder', async (req, res) => {
    // const { userId, productId, quantity, address } = req.body;
    // As per normal place, based on cart, order should be prepared. So can send below payload
    var token = localStorage.getItem('authToken');    
    jwt.verify(token, config.secret, async (err, verifiedToken) => {
        if(err) res.status(400).send('Not able to get token');
        else {
            const id = verifiedToken.id;
            const user = await getUser({ _id: new ObjectId(id) });
            if(user) {
                const cartId = localStorage.getItem('cartId');
                if(!cartId)
                    return res.status(400).json({ message: 'No cart present to create order' });
                
                const { address } = req.body;
                const email = user.email;
                const orderId = generateId();
                const addedProduct = await placeOrder({ orderId, cartId, email, ...req.body, status: 'Order Placed' });
                
                // As order is placed, we can delete cartId from local store
                localStorage.removeItem('cartId');
                
                res.status(200).json({ orderId, status: 'Order placed' });

                // Show info of order placed using socket.io in screen or store info
            } else {
                res.status(400).send('No user present to place order');
            }
        }
    });
});

ordersRouter.put('/cancelOrder', async (req, res) => {
    const { orderId } = req.body;
    const canceledOrder = await cancelOrder(orderId);
    res.status(200).json({ orderId, status: 'Order cancelled' });
    // res.redirect('/viewAdmin');
});

ordersRouter.put('/updateOrderStatus', async (req, res) => {
    var token = localStorage.getItem('authToken');    
    jwt.verify(token, config.secret, async (err, verifiedToken) => {
        if(err) res.status(400).send('Not able to get token');
        else {
            const id = verifiedToken.id;
            const user = await getUser({ _id: new ObjectId(id) });
            if(user) {
                const seller = user.email;
                const { orderId, status } = req.body;
                const order = await getOrderById(orderId);
                const updatedOrderStatus = await updateOrderStatus(orderId, status, seller);
                const orderInfo = `Order ${orderId} created on user ${order.email} has been updated to ${status} by ${seller} at ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
                console.log("OrderInfo: ", orderInfo);
                emitOrderStatusUpdate(orderInfo);
                res.status(200).json({ message: 'Order status updated successfully' });
            }
            else {
                res.status(400).json({ message: 'Not able to update order status' });
            }
        }
    });
});

module.exports = ordersRouter;