// handles registration and login/logout logic
// Interacts with the database and creates a cookie

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
    findUserIdByEmail,
    createUser,
    findUserByEmail,
    findUserById,
} = require("../models/userModel");

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

        const exists = await findUserIdByEmail(normEmail);
        if (exists.length) {
            return res.status(409).json({message:"Email already in use"});
        }

        const password_hash = await bcrypt.hash(password,10);

        const result = await createUser({
            first_name,
            last_name,
            email: normEmail,
            password_hash,
            role: "user",
        });
        
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

        const user = await findUserByEmail(normEmail);
        if (!user){
            return res.status(401).json({message:"Invalid Email or Password"})
        }

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
        const user = await findUserById(payload.user_id);
        if (!user) return res.status(401).json({message:"Not logged in"});
            
        return res.json({user});
        } catch (err){
            return res.status(401).json({message:"Not logged in"});
        }
};

// Logs out user
exports.logout = (req,res)=>{
    res.clearCookie("tt_token", cookieOptions);
    res.json({message:"Logged Out"})
};
