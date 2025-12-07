const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {COOKIES} = require('../constants/Cookies');
const handleLogin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({code:"USERNAME_PASSWORD_REQUIRED", message: 'Username and password are required' });
    }

    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(401).json({responseCode:"INVALID_CREDENTIALS", message: 'Invalid credentials' });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({responseCode:"INVALID_CREDENTIALS", message: 'Invalid credentials' });
        }
        const roles = user.roles;

        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": user.username,
                    "roles": roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY }
        );  
        const refreshToken = jwt.sign(
            { "username": user.username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY }
        );
        res.cookie(COOKIES.JWT_REFRESH_TOKEN, refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            // maxAge: 30 * 1000
            maxAge: process.env.JWT_REFRESH_TOKEN_EXPIRY_MS
        });
        user.refreshToken = refreshToken;
        const savedUser = await user.save();
        res.json({responseCode:"LOGIN_SUCCESSFUL",username:user.username,[COOKIES.JWT_ACCESS_TOKEN] :accessToken,roles });
    } catch (err) {
        console.error(err);
        res.status(500).json({ responseCode:"SERVER_ERROR",message: 'Server error' });
    }
};

module.exports = {handleLogin};