require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const flash = require('connect-flash');
const User = require("./user.js");

const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(flash());

app.use(
  session({
    secret: process.env.DB_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Register routes
app.use('/', require('./routes'));

let port = process.env.PORT;
if (port === null || port === "" || port === undefined) {
  port = 3001;
}
 
app.listen(port, function() {
  console.log(`Server started succesfully at: http://localhost:${port}`);
});   
