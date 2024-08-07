import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../dao/models/userModel.js";
import config from "../config/config.js";
import authorize from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, age, password, isAdmin } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      first_name,
      last_name,
      email,
      age,
      password: hashedPassword,
      isAdmin,
    });

    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: 86400, // 24 hours
    });

    res.status(201).json({ auth: true, token: token });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email: email });
    if (!user) return res.status(404).send("No user found.");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).send("Password is incorrect.");

    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: 86400, // 24 hours
    });

    res.status(200).json({ auth: true, token: token });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.get("/me", authorize, async (req, res) => {
  try {
    const user = await userModel.findById(req.userId, { password: 0 });
    if (!user) return res.status(404).send("No user found.");

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

export default router;
