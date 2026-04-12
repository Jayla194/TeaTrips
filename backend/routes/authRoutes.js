const express = require("express");
const router = express.Router();
const { register,login,user,logout,changePassword } = require("../controllers/authController");

router.post("/register",register);

router.post("/login",login)

router.get("/user",user);

router.post("/logout",logout);

router.post("/change-password", changePassword);

module.exports = router;
