// handles registration and login/logout logic
// Interacts with the database and creates a cookie

const bcrypt = require("bcrypt");
const db = require("../config/db");
const jwt = require("jsonwebtoken");

const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    // Lasts for 30 days
    maxAge: 30 * 24 * 60 * 60 * 1000,
};

function setCookie(res, payload){
    const token = jwt.sign(payload, process.env.JWT_SECRET);

    res.cookie("tt_token", token, cookieOptions);
}

// Registration
exports.register = async (req, res) => {
    try {
        const { first_name, last_name, email, password} = req.body;
        const normEmail = email?.trim().toLowerCase();

        const [exists] = await db.query("SELECT user_id FROM users WHERE email =?", [normEmail]);
        if (exists.length) {
            return res.status(409).json({message:"Email already in use"});
        }

        const password_hash = await bcrypt.hash(password,10);

        const [result] = await db.query(
            "INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES (?,?,?,?, 'user')",
            [first_name, last_name, normEmail, password_hash]
        );
        
        setCookie(res, { user_id: result.insertId, role: "user" });

        return res.status(201).json({
            user: {
                user_id: result.insertId,
                first_name,
                last_name,
                email,
                role: "user",
            },
        });

    } catch (err){
        return res.status(500).json({message:"Server Error"})
    }
}

// Login
exports.login = async (req, res) => {
    try{
        const {email, password} = req.body;
        const normEmail = email?.trim().toLowerCase();

        const [rows] = await db.query("SELECT * FROM users WHERE email=?",[normEmail]);
        

        if (!rows || rows.length === 0){
            return res.status(401).json({message:"Invalid Email or Password"})
        }
        const user = rows[0];
        const ok = await bcrypt.compare(password,user.password_hash);
        if (!ok){
            return res.status(401).json({message:"Invalid Email or Password"})
        }

        setCookie(res, { user_id: user.user_id, role: user.role });

        return res.status(200).json({
            user: {
                user_id: user.user_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (err){
        return res.status(500).json({message:"Server Error"})

    }
}
// Returns current logged-in user
exports.user = async (req,res)=> {
    const token = req.cookies.tt_token;
    if (!token) return res.status(401).json({message:"Not logged in"});

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const [rows] = await db.query(
            "SELECT user_id, first_name, last_name, email, role FROM users WHERE user_id = ?",[payload.user_id]);
        if (!rows.length) return res.status(401).json({message:"Not logged in"});
            
        return res.json({user:rows[0]});
        } catch (err){
            return res.status(401).json({message:"Not logged in"});
        }
};
// Logs out user
exports.logout = (req,res)=>{
    res.clearCookie("tt_token", cookieOptions);
    res.json({message:"Logged Out"})
};
