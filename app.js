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

app.listen(process.env.PORT || 3001, function () {
  console.log("Server hosted at http://localhost:3001");
});
