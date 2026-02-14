const express = require("express");
const router = express.Router();
const { signUp, signIn, getAllUsers } = require("../userController");

// Routes
router.post("/signup", signUp);
router.post("/signin", signIn);
router.get("/users", getAllUsers);

module.exports = router;
