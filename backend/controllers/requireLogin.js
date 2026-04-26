// Protective guard for logged-in routes
// Checks whether the user is logged in by checking the cookie


const jwt = require("jsonwebtoken");

function requireLogin(req,res,next){
    const token = req.cookies?.tt_token;

    if (!token){
        return res.status(401).json({message:"Login Required"});
    }

    try {
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);

    if (!tokenData?.user_id) {
        return res.status(401).json({ message: "Missing user_id" });
    }

    req.user = { user_id: tokenData.user_id, role: tokenData.role };
    next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid login" });
    }
}
module.exports = requireLogin;