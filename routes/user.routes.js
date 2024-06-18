import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import isAuth from "../middleware/jwt.middleware.js";
const router = express.Router();

const salts = 10;

// SIGN UP ROUTE
router.post("/signup", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    //CHECKS IF REQ BODY HAS ALL INFO (email, password and username)
    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email, username, and password" });
    }

    //TRY TO FIND A USER IN DATABASE THROUGH EMAIL OR USERNAME PROVIDED

    const user = await User.findOne({
      $or: [{ email }, { username }],
    });
    //IF IT FINDS A USER, THEY ALREADY EXIST
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Regex to validate email (checks if theres word@word.com format)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Provide a valid email address" });
      return;
    }

    // Use regex to validate the password format
    const passwordRegex =
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({
        message:
          "Password must have at least 8 characters and contain at least one number, one lowercase, one uppercase letter and a special character.",
      });
      return;
    }

    // Encrypts the password
    const salt = await bcrypt.genSalt(salts);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Creates the user in the database
    const createdUser = await User.create({
      email,
      username,
      password: hashedPassword,
    });

    res.status(201).json(createdUser);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, username, password } = req.body;
    // Checks if body has all info (email OR username AND password)
    if (!(email || username) || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email or username, and password" });
    }

    // Check if user exists by looking for them through email or username
    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (!user) {
      return res.status(401).json({ message: "User does not exist" });
    }

    // Check if password is correct using bcrypt to compare user input and password in database
    const passwordCheck = await bcrypt.compare(password, user.password);

    if (!passwordCheck) {
      return res
        .status(401)
        .json({ message: "Email/Username or password incorrect" });
    }
    // Delete the user password from the user variable so we can use that as payload
    delete user._doc.password;

    // we use jwt.sign() to create a token upon login
    // to sign we need some info:
    // payload = info to encrypt/encode (user object in this example)
    // the SECRET in the .env file (could have any value, it's like a password)
    // algorithm = just use "HS256"
    // expiresIn = the amount of time in hours that your token will be valid for
    const jwtToken = jwt.sign(
      { payload: { user } },
      process.env.TOKEN_SIGN_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "24h",
      }
    );

    res.status(200).json({ user, jwtToken });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

router.get("/verify", isAuth, async (req, res) => {
  try {
    console.log("Hello, this is the loffed user in verify --> ", req.user);
    res.json({ message: "User is logged in.", user: req.user });
  } catch (error) {
    console.log(error);
  }
});

export default router;
