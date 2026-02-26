const express = require("express");
const router = express.Router();
const { register,login,user,logout } = require("../controllers/authController");

router.post("/register",register);

router.post("/login",login)

router.get("/user",user);

router.post("/logout",logout);

module.exports = router;