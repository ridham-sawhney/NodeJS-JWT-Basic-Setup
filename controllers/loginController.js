const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {COOKIES} = require('../constants/Cookies');
const {createAccessToken,createRefreshToken}  = require(".././Utils/TokenCreator");
const {createRefreshTokenCookie} = require(".././Utils/CookieHandler");

const handleLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({code:"EMAIL_PASSWORD_REQUIRED", message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).json({responseCode:"INVALID_CREDENTIALS", message: 'Invalid credentials' });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({responseCode:"INVALID_CREDENTIALS", message: 'Invalid credentials' });
        }
        const roles = user.roles;
        const accessToken = createAccessToken({email:user.email,roles:roles}); 
        const refreshToken = createRefreshToken({email:user.email});
        createRefreshTokenCookie({response:res,refreshToken});

        user.refreshToken = refreshToken;
        const savedUser = await user.save();
        res.json({responseCode:"LOGIN_SUCCESSFUL",email:user.email,[COOKIES.JWT_ACCESS_TOKEN] :accessToken,roles });
    } catch (err) {
        console.error(err);
        res.status(500).json({ responseCode:"SERVER_ERROR",message: 'Server error' });
    }
};

module.exports = {handleLogin};