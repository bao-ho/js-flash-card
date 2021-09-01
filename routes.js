const passport = require("passport");
const router = require("express").Router();
const User = require("./user.js");
const dictionary = require("./dictionary");

router.get("/", function (req, res) {
  res.render("home");
});

router.get("/register", function (req, res) {
  res.render("register");
});

router.get("/card", function (req, res) {
  const words = dictionary.getWords(req.user.progress);
  dictionary.saveSounds(words);
  setTimeout(() => {
    res.render("card", { words });
  }, 500);
});

router.get("/login", function (req, res) {
  res.render("login", { message: req.flash("error") });
});

router.get("/secrets", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

router.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

router.post("/next", function (req, res) {
  User.findById(req.user.id, (err, user) => {
    if (err) console.log("user not found: " + err);
    else if (req.body.options.includes("pass")) {
      user.progress = user.progress + 1;
      user.save((err) => {
        if (err) console.log("cannot save user: " + err);
      });
    }
  });
  if (req.body.options.includes("render")) res.redirect("/card");
});

router.post("/register", function (req, res) {
  User.register(
    new User({ username: req.body.username, progress: 1 }),
    req.body.password,
    function (err) {
      if (err) {
        console.log("Error while user register!", err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/card");
        });
      }
    }
  );
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res) {
    res.redirect("/card");
  }
);

module.exports = router;
