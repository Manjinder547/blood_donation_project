const express = require('express');
const path = require('path');
const hbs = require('hbs');
const exhbs = require('express-handlebars');
const app = express();
const passport = require("passport");
const bodyParser = require("body-parser");
const LocalStrategy = require("passport-local");
const user = require("./models/user");
const donorSchema = require("./models/donor_model");
const acceptorSchema = require("./models/acceptor");

const Joi = require('@hapi/joi');

const mongoose = require('mongoose')

mongoose.connect('mongodb://0.0.0.0:27017/blood_donation_db', {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection
db.on('error', (err) => {console.log(err)})
db.once('open', () => {
    console.log("connectionn success.")
})

const port = process.env.port || 3000;

const static_path = path.join(__dirname, "../blood_donation_project/public");
const template_path = path.join(__dirname, "../blood_donation_project/templates/views");
const partial_path = path.join(__dirname, "../blood_donation_project/templates/partials");


app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partial_path);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("express-session")({
    secret: "12345",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session()); 
passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.get('/', (req, res) => {
    res.render("index")
});
app.get('/index', (req, res) => {
    res.render("index")
});
// Showing secret page
app.get("/index_secret", isLoggedIn, function (req, res) {
    res.render("index_secret");
});
  
// Showing register form
app.get("/register", function (req, res) {
    res.render("register");
});
  
// Handling user signup
app.post("/register", async (req, res) => {
    const { error } = validateUser(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    // Check if this user already exisits
    let user_c = await db.collection('user').findOne({ username: req.body.username, email: req.body.email });
    console.log(user_c);
    if (user_c) {
        return res.status(400).send('That user already exisits!');
    } else {
        // Insert the new user if they do not exist yet
        user_c = new user({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });
        console.log(user_c);
        add({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        }, 'user');
        await user_c.save();
        res.render("login");
    }});
  
//Showing login form
app.get("/login", function (req, res) {
    res.render("login");
});
  
//Handling user login
app.post("/login", async function(req, res){
    try {
        // check if the user exists
        const user_c = await user.findOne({ username: req.body.username });
        if (user_c) {
          //check if password matches
          const result = req.body.password === user_c.password;
          if (result) {
            res.render("index_secret");
          } else {
            res.status(400).json({ error: "password doesn't match" });
          }
        } else {
          res.status(400).json({ error: "user doesn't exist" });
        }
      } catch (error) {
        res.status(400).json({ error });
      }
});
  
//Handling user logout 
app.get("/logout", function (req, res) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
});


// rendering donate blood page when requested
app.get("/donate_blood", function (req, res) {
    res.render("donate_blood");
});

// responding with schedule appointment page
app.post("/donate_blood", async function(req, res){
    try {
    const { error } = validateDonor(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    // Check if this donor already exisits
    let donor_c = await db.collection('donor').findOne({ d_name: req.body.d_name, d_email: req.body.d_email });
    console.log(donor_c);
    if (donor_c) {
        return res.status(400).send('That donor already exisits!');
    } else {
        // Insert the new donor if they do not exist yet
        donor_c = new donorSchema({
            d_name: req.body.d_name,
            d_email: req.body.d_email,
            d_blood_group: req.body.d_blood_group,
            d_dob: req.body.d_dob,
            d_address: req.body.d_address,
            d_city: req.body.d_city,
            d_province: req.body.d_province,
            d_country: req.body.d_country,
            d_phone_number: req.body.d_phone_number
        });
        console.log(donor_c);
        add({
            d_name: req.body.d_name,
            d_email: req.body.d_email,
            d_blood_group: req.body.d_blood_group,
            d_dob: req.body.d_dob,
            d_address: req.body.d_address,
            d_city: req.body.d_city,
            d_province: req.body.d_province,
            d_country: req.body.d_country,
            d_phone_number: req.body.d_phone_number
        }, 'donor');
        res.render("schedule_appointment");
    }} 
      catch (error) {
        res.status(400).json({ error });
      }
});
// responding with schedule appointment page
app.post("/schedule_appointment", async function(req, res){
    try {
        console.log(req.body);
        add({
            location: req.body.loc_select,
            date: req.body.date,
            time: req.body.appt
        }, 'appointment');
        res.render("confirmed");
      } catch (error) {
        res.status(400).json({ error });
      }
})


// rendering find blood page when requested
app.get("/find_blood", function (req, res) {
    res.render("find_blood");
});


// finding suitable donors through blood group matching
app.post("/find_blood", async function(req, res){
    try {
    const { error } = validateAcceptor(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    // Check if this acceptor already exisits

    let acceptor_c = await db.collection('acceptor').findOne({ a_name: req.body.a_name, a_email: req.body.a_email });
    
    if (acceptor_c) {

        return res.status(400).send('That acceptor already exisits!');
    } else {
        // Insert the new acceptor if they do not exist yet
        acceptor_c = new acceptorSchema({
            a_name: req.body.a_name,
            a_email: req.body.a_email,
            a_blood_group: req.body.a_blood_group,
            a_dob: req.body.a_dob,
            a_address: req.body.a_address,
            a_city: req.body.a_city,
            a_province: req.body.a_province,
            a_country: req.body.a_country,
            a_phone_number: req.body.a_phone_number
        });
        console.log(acceptor_c);
        // registring acceptor
        add({
            a_name: req.body.a_name,
            a_email: req.body.a_email,
            a_blood_group: req.body.a_blood_group,
            a_dob: req.body.a_dob,
            a_address: req.body.a_address,
            a_city: req.body.a_city,
            a_province: req.body.a_province,
            a_country: req.body.a_country,
            a_phone_number: req.body.a_phone_number
        }, 'acceptor');


        let all_donors = await db.collection('donor').find({ d_blood_group: req.body.a_blood_group}).toArray();
        res.send(all_donors);
        
    }} 
      catch (error) {
        res.status(400).json({ error });
      }
});


// rendering contact page
app.get("/contact", function (req, res) {
    res.render("contact");
});

//rendering about page
app.get("/about", function (req, res) {
    res.render("about");
});
  
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}

function validateUser(user) {
    const schema = {
        username: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required()
    };
    return Joi.validate(user, schema);
}

function validateDonor(donor) {
    const schema = {
        d_name: Joi.string().min(5).max(50).required(),
        d_email: Joi.string().min(5).max(255).required().email(),
        d_blood_group: Joi.string().min(2).max(50).required(),
        d_dob: Joi.date().max('01-01-2003').required(),
        d_address: Joi.string().min(5).max(50).required(),
        d_city: Joi.string().min(2).max(50).required(),
        d_province: Joi.string().min(2).max(50).required(),
        d_country: Joi.string().min(3).max(50).required(),
        d_phone_number: Joi.string().min(10).max(10).required(),
    };
    return Joi.validate(donor, schema);
}
function validateAcceptor(acceptor) {
    const schema = {
        a_name: Joi.string().min(5).max(50).required(),
        a_email: Joi.string().min(5).max(255).required().email(),
        a_blood_group: Joi.string().min(2).max(50).required(),
        a_dob: Joi.date().max('01-01-2023').required(),
        a_address: Joi.string().min(5).max(50).required(),
        a_city: Joi.string().min(2).max(50).required(),
        a_province: Joi.string().min(2).max(50).required(),
        a_country: Joi.string().min(3).max(50).required(),
        a_phone_number: Joi.string().min(10).max(10).required(),
    };
    return Joi.validate(acceptor, schema);
}
function add(doc, coll){
    db.collection(coll).insertOne(doc, function(err, res) {        
        if (err) throw err;
        console.log("1 document inserted");
    });
}


app.listen(port, () => {
    console.log(`Server is running on port ${port}`)

});
