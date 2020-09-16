const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const connectDB = require("./config/db");
const User = require("./models/UserSchema");

connectDB();

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index", { error: false });
});

app.get("/signup", (req, res) => {
  res.render("signup", {
    error: false,
    alert: document.querySelector(".alert"),
  });
});

app.get("/login", (req, res) => {
  res.render("index");
});

app.post("/signup", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const user = new User({
      name: req.body.name,
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email,
      phone: req.body.phone,
    });
    await user.save();
    return res.render("index");
  } catch (error) {
    res.render("signup", { error: true });
  }

  //   res.render("login");
});

app.post("/login", async (req, res) => {
  if (req.body.password !== req.body.password2) {
    return res.render("signup", { error: true });
  }
  const user = await User.findOne({ username: req.body.username });
  if (user == null) {
    // alert("User does not exist !");
    return res.render("index", { error: true });
    // return res.status(400).send("Cannot find user");
  }
  try {
    const isMatched = await bcrypt.compare(req.body.password, user.password);

    if (isMatched) {
      return res.send(user);
    } else {
      return res.render("index", { error: true });
    }
  } catch (error) {
    return res.status(500).send();
  }
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log("SERVER STARTED ON PORT 3000"));
