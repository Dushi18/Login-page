const express = require('express');
const path = require('path');
const User = require('./models/userSchema');
const jwt = require('jsonwebtoken');
require('./db/conn.js');
const app = express();
const port = process.env.PORT || 3000;
const dotenv = require('dotenv');
dotenv.config({path: './src/config.env'});

const staticpath = path.join(__dirname, "../public/");
// console.log(staticpath);
const signToken = id=>{
    return jwt.sign({id: id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRATION});
}
// console.log(app.get('env'));
// console.log(process.env.JWT_SECRET);
app.use(express.static(staticpath));
app.use(express.urlencoded({extended:false}));

app.get('/', (req, res) => {
    res.render('index');
});
app.post('/signup',async (req,res) =>{
        try {
            // res.send(req.body);
            const userData = new User(req.body);
            await userData.save();
            console.log(userData.id);
            const token = signToken(userData.id);
            console.log(token);
            res.status(201).send(`<h1> User saved successfully</h1> \n<a href= './'>Click here to go back...</a> `);
        } catch (error) {
            res.status(500).send(error);            
        }
});
app.post('/login', async(req,res,next)=>{
    const {email, password} = req.body;
    console.log(req.body);
    console.log(`${email} ${password}`);

    if(!email || !password) {
        return next(new Error('Please provie an email and password'));
    }

    const user = await User.findOne({email: email}).select('+password');
    console.log(user);
    if(!user||!(await user.correctPassword(password, user.password))) {
        return next(new Error('Invalid EMAIL or PASSWORD'));
    };
    const token = signToken(user.id);
    res.status(200).send(`<b>Welcome! ${user.name} , email ${user.email}</b> \n <h1> You are successfully logged in</h1>\n <a href= './'>Click here to go back...</a> `);

});

app.listen(port, ()=>{
    console.log(`listening at port ${port}`);
});