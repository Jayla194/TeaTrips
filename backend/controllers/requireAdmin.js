const requireLogin = require("./requireLogin");

function requireAdmin(req, res, next) {
    requireLogin(req, res, () => {
        if(req.user?.role !== "admin"){
            return res.status(403).json({message: "Admin access required."});
        }
        next();
    });
}

module.exports = requireAdmin;