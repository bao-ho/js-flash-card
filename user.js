require("dotenv").config();
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const databaseUrl = `mongodb+srv://admin-bao:${process.env.MONGO_ATLAS_PASSWORD}@cluster0.sogeo.mongodb.net/flashCardUserDB`;
mongoose.connect(databaseUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  progress: Number,
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
