// handles registration and login/logout logic
// Interacts with the database and creates a cookie
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
    findUserIdByEmail,
    createUser,
    findUserByEmail,
    findUserById,
    findUserAuthById,
    updateUserPassword,
} = require("../models/userModel");

const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    // Lasts for 30 days
    maxAge: 30 * 24 * 60 * 60 * 1000,
};

const NAME_MAX_LENGTH = 50;
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\p{Zs}'’.-]*$/u;

function validateName(fieldName, value) {
    const trimmedValue = typeof value === "string" ? value.trim() : "";

    if (!trimmedValue) {
        return `${fieldName} is required`;
    }
    if (trimmedValue.length > NAME_MAX_LENGTH) {
        return `${fieldName} must be ${NAME_MAX_LENGTH} characters or fewer`;
    }
    if (!NAME_PATTERN.test(trimmedValue)) {
        return `${fieldName} can only include letters, spaces, apostrophes, hyphens, and periods`;
    }

    return null;
}

function setCookie(res, payload){
    const token = jwt.sign(payload, process.env.JWT_SECRET);

    res.cookie("tt_token", token, cookieOptions);
}

// Registration
exports.register = async (req, res) => {
    try {
        const { first_name, last_name, email, password} = req.body;
        const normEmail = email?.trim().toLowerCase();
        const firstName = typeof first_name === "string" ? first_name.trim() : "";
        const lastName = typeof last_name === "string" ? last_name.trim() : "";

        const firstNameError = validateName("First name", firstName);
        if (firstNameError) {
            return res.status(400).json({ message: firstNameError });
        }

        const lastNameError = validateName("Last name", lastName);
        if (lastNameError) {
            return res.status(400).json({ message: lastNameError });
        }

        if (!normEmail || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const exists = await findUserIdByEmail(normEmail);
        if (exists.length) {
            return res.status(409).json({message:"Email already in use"});
        }

        const password_hash = await bcrypt.hash(password,10);

        const result = await createUser({
            first_name: firstName,
            last_name: lastName,
            email: normEmail,
            password_hash,
            role: "user",
        });
        
        setCookie(res, { user_id: result.insertId, role: "user" });

        return res.status(201).json({
            user: {
                user_id: result.insertId,
                first_name: firstName,
                last_name: lastName,
                email: normEmail,
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
    if (!token) return res.json({ user: null });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await findUserById(payload.user_id);
        if (!user) return res.json({ user: null });
            
        return res.json({user});
        } catch (err){
            return res.json({ user: null });
        }
};

// Logs out user
exports.logout = (req,res)=>{
    res.clearCookie("tt_token", cookieOptions);
    res.json({message:"Logged Out"})
};

// Change password for current user
exports.changePassword = async (req, res) => {
    const token = req.cookies.tt_token;
    if (!token) return res.status(401).json({ message: "Not logged in" });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const { currentPassword, newPassword } = req.body || {};

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current and new password are required" });
        }
        if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            return res.status(400).json({ message: "Password must be 8+ characters with 1 uppercase letter and 1 number" });
        }

        const user = await findUserAuthById(payload.user_id);
        if (!user) return res.status(401).json({ message: "Not logged in" });

        const ok = await bcrypt.compare(currentPassword, user.password_hash);
        if (!ok) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        const password_hash = await bcrypt.hash(newPassword, 10);
        await updateUserPassword(user.user_id, password_hash);

        return res.json({ message: "Password updated" });
    } catch (err) {
        return res.status(401).json({ message: "Not logged in" });
    }
};
