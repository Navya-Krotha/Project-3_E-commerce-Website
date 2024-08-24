import express from "express";
import bodyParser from "body-parser";
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import config from "../config.js";
import { localStorage } from "../app.js";
import { getUser, addUser } from "../helpers/usersCollection.js";

const authRouter = express.Router();

authRouter.use(bodyParser.urlencoded({ extended: true }));
authRouter.use((bodyParser.json()));

authRouter.post('/register', async (req, res) => {
    const { username, password, email, userType } = req.body;
    const isUserExists = await getUser({ email });
    if(isUserExists) 
        return res.send(400).json({ message: 'User already exists' });
    const hashedPassword = bcrypt.hashSync(password, 8);
    const userRole = userType ? userType : 'Buyer';
    const registeredUser = await addUser({
        username,
        email,
        password: hashedPassword,
        userType: userRole
    });
    // res.status(200).send(registeredUser);
    res.redirect('/viewLogin');
});

authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await getUser({ email });
    if(!user)
        return res.status(401).json({ message: 'Authorized user' });
    const storedPassword = user.password;
    const isCorrectPassword = bcrypt.compareSync(password, storedPassword);
    if(!isCorrectPassword)
        return res.status(401).json({ message: 'Invalid credentials' });
    var token = jwt.sign({ id: user._id }, config.secret , { expiresIn: 86400 });
    localStorage.setItem('authToken', token);
    
    // const products = await getAllProducts();
    // res.render('homePage.ejs', { user, products });
    res.redirect('/user/viewHomePage');
});

module.exports = authRouter;