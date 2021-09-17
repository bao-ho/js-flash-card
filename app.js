require("dotenv").config();
const path = require('path');
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const flash = require('connect-flash');
const User = require("./user.js");

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
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
  app.listen(3001, '0.0.0.0', function() {
    console.log(`Server started succesfully at: http://0.0.0.0:3001`);
  });
} else {
  app.listen(port, function() {
    console.log(`Server started succesfully with heroku.`);
  });
}
 
