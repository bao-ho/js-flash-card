const passport = require("passport");
const router = require("express").Router();
const User = require("./user.js");
const { dictionary, N_CARDS } = require("./dictionary");

router.get("/", function (req, res) {
  res.render("home");
});

router.get("/register", function (req, res) {
  res.render("register", { message: req.flash("error") });
});

router.get("/card", function (req, res) {
  User.findById(req.user.id, (err, user) => {
    if (err) console.log("user not found: " + err);
    else {
      const words = dictionary.getWords(user.progress);
      dictionary.saveSounds(words);
      setTimeout(() => {
        res.render("card", { words });
      }, 500);
    }
  });
});

router.get("/login", function (req, res) {
  res.render("login", { message: req.flash("error") });
});

router.get("/test", function (req, res) {
  res.render("testSound");
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
    else {
      const wordIndex = req.body.absIndex;
      if (!Object.keys(user.progress).includes(wordIndex)) {
        if (req.body.options.includes("pass")) user.progress[wordIndex] = 1;
      } else {
        if (req.body.options.includes("pass"))
          user.progress[wordIndex] = Math.min(
            N_CARDS,
            user.progress[wordIndex] + 1
          );
        else user.progress[wordIndex] = 0; // reset the word's progress
      }
      user.markModified(`progress.${wordIndex}`);
      user.save((err) => {
        if (err) console.log("cannot save user: " + err);
      });
    }
  });
  if (req.body.options.includes("render")) {
    res.redirect("/card");
  } else {
    res.send("success");
  }
});

router.post("/register", function (req, res) {
  User.register(
    new User({ username: req.body.username, progress: { 0: 0 } }),
    req.body.password,
    function (err) {
      if (err) {
        console.log("Error while user register!", err);
        req.flash("error", "Email already registered");
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
