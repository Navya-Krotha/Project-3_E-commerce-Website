import { client, localStorage } from "../app.js";

const getAllUsers = async () =>  {
    return await client.db('NodeJs-Project-3').collection("users").find().toArray();
}

const getUser = async (userQueryObject) => {
    return await client.db('NodeJs-Project-3').collection("users").findOne(userQueryObject);
}

const addUser = async (newUser) => {
    return await client.db('NodeJs-Project-3').collection("users").insertOne(newUser);
}

const updateUser = async (email, updatedUserInfo) => {
    return await client.db('NodeJs-Project-3').collection("users").updateOne(
        { email }, 
        { $set: updatedUserInfo}
    );
}

const deleteUser = async (email) => {
    return await client.db('NodeJs-Project-3').collection("users").deleteOne({ email });
}

export { getAllUsers, getUser, addUser, updateUser, deleteUser };