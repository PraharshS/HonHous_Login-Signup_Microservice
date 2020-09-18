const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const connectDB = require("./config/db");
const User = require("./models/UserSchema");

// Connect to MONGO DB
connectDB();

// Set default template engine
app.set("view engine", "ejs");

app.use(express.json());

app.use(express.static(__dirname + "/public"));
const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.get("/signup", (req, res) => {
  res.render("signup", {
    alert: [],
    userData: [],
  });
});

// Problem in implementing dashboard page denial without login
app.get("/dashboard", (req, res) => {
  console.log(req.body);
  return res.render("dashboard", req.body);
});

app.get("/", (req, res) => {
  res.render("index", { error: false });
});

app.get("/login", (req, res) => {
  res.render("index", { error: false });
});

app.post(
  "/signup",
  urlencodedParser,
  [
    check("name", "Name cannot be empty").exists().isLength({
      min: 1,
    }),
    check("username", "username must be 3+ characters long").exists().isLength({
      min: 3,
    }),

    check("email", "Email is not valid").isEmail().normalizeEmail(),
    check("phone", "Phone Number must contain 10 digits").isLength({
      min: 10,
    }),
    check("password", "password must be 8 characters long").isLength({
      min: 8,
    }),
    check("password2", "passwords must match").matches("password"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    const { name, username, email, phone, password, password2 } = req.body;
    if (!errors.isEmpty()) {
      const userData = { name, username, email, phone, password, password2 };
      const alert = errors.array();
      res.render("signup", {
        alert,
        userData,
      });
    } else {
      try {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const user = new User({
          name,
          username,
          password: hashedPassword,
          email,
          phone,
        });
        await user.save();
        console.log(user);
        return res.render("index");
      } catch (error) {
        res.render("signup", { error: true });
      }
    }
  }
);

app.post("/login", urlencodedParser, async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user == null) {
    // alert("User does not exist !");

    res.render("index", { error: "invalid" });
    // return res.status(400).send("Cannot find user");
  }
  try {
    const isMatched = await bcrypt.compare(req.body.password, user.password);

    if (isMatched) {
      console.log("matches");
      return res.render("dashboard", { name: user.name });
    } else {
      res.render("index", { error: true });
    }
  } catch (error) {
    return res.status(500).send();
  }
});
const PORT = process.env.PORT || 3000;

app.listen(process.env.PORT || PORT, () =>
  console.log("SERVER STARTED ON PORT " + PORT)
);
