import { client } from "../app.js";

const getAllOrders = async () => {
    return await client.db('NodeJs-Project-3').collection("orders").find().toArray();
}

const getOrderById = async (orderId) => {
    return await client.db('NodeJs-Project-3').collection("orders").findOne({ orderId });
}

const placeOrder = async (orderInfo) => {
    return await client.db('NodeJs-Project-3').collection("orders").insertOne(orderInfo);
}

const updateOrderStatus = async (orderId, newStatus, seller) => {
    const orderInfo = await getOrderById(orderId);
    const updatedOrderInfo = { ...orderInfo, status: newStatus, seller };
    return await client.db('NodeJs-Project-3').collection("orders").updateOne(
        { orderId }, 
        { $set: updatedOrderInfo }
    );
}

const cancelOrder = async (orderId) => {
    const orderInfo = await getOrderById(orderId);
    const updatedOrderInfo = { ...orderInfo, status: 'Order Cancelled' };
    return await client.db('NodeJs-Project-3').collection("orders").updateOne(
        { orderId }, 
        { $set: updatedOrderInfo }
    );
}

export { getAllOrders, getOrderById, placeOrder, cancelOrder, updateOrderStatus };