require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const user = require('./models/users');
const bcrypt = require('bcrypt')

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect(process.env.DATABASE_URL,{useNewUrlParser: true});

const db = mongoose.connection;
db.on('error',(error) => console.log(error));
db.once('open',() => console.log("Connected to database"));

var loggedIn = false;
app.get("/", (req,res) => {
    res.redirect("login");
});

app.get("/login", (req,res) => {
    if(!loggedIn){
        res.render("login");
    }else{
        res.redirect('home')
    }
});

app.get("/admin_login", (req,res) => {
    if(!loggedIn){
        res.render("admin_login");
    }else{
        res.redirect('home')
    }

});

app.get("/individual_login", (req,res) => {
    if(!loggedIn){
        res.render("individual_login",{failure: false, message: ""});
    }else{
        res.redirect('home')
    }
});

app.post("/individual_login", async (req,res) => {
    try{
        const UserLogin = await user.findById(req.body.email);
        if (UserLogin == null) {
            res.render("individual_login",{failure: true, message: "Email not found"});
        }else{
            if(await bcrypt.compare(req.body.password, UserLogin.password)){
                loggedIn = true;
                res.redirect("home");
            }else{
                res.render("individual_login",{failure: true, message: "Incorrect email or password"});
            } 
        }
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
});

app.get("/individual_signup", (req,res) => {
    if(!loggedIn){
        res.render("individual_signup",{failure: false, message: ""});
    }else{
        res.redirect('home')
    }
    
});

app.post("/individual_signup", async (req,res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const userAdd = new user({
            fname: req.body.fname,
            mname: req.body.mname,
            lname: req.body.lname,
            _id: req.body.email,
            password: hashedPassword
        });
        await userAdd.save();
        res.redirect("individual_login");
    }
    catch(error){
        res.render("individual_signup",{failure: true, message: "Account already exists"});
    }
});

app.get("/home", (req,res) => {
    if(loggedIn){
        res.render("home");
    }else{
        res.render("individual_login",{failure: true, message: "Please, login to continue"});
    }
});

app.get("/question", (req,res) => {
    if(loggedIn){
        res.render("question");
    }else{
        res.render("individual_login",{failure: true, message: "Please, login to continue"});
    }
});

app.get("/contact", (req,res) => {
    if(loggedIn){
        res.render("contact");
    }else{
        res.render("individual_login",{failure: true, message: "Please, login to continue"});
    }
});

app.get("/problems", (req,res) => {
    if(loggedIn){
        res.render("problems");
    }else{
        res.render("individual_login",{failure: true, message: "Please, login to continue"});
    }
});

app.get("/logout", (req, res) =>{
    loggedIn = false;
    res.render("login");
})
app.listen(5000,() => {
    console.log("Server started on port 5000");
});
