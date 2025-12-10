
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {COOKIES} = require('../constants/Cookies');
const handleRegister = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ responseCode: "EMAIL_PASSWORD_REQUIRED", message: 'email and password are required' });
    }
    var foundUser = await User.findOne({ email: email }).exec();
    if (foundUser) {
        return res.status(409).json({ responseCode: "EMAIL_NOT_AVAILABLE", message: 'email Not Available' });
    }
    try {
        const hashedPwd = await bcrypt.hash(password, 10);

        const newUser = new User({
            email: email,
            password: hashedPwd
        });
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "email": email,
                    "roles": ["User"]
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY });

        const refreshToken = jwt.sign(
            { "email": email },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY }
        );
        res.cookie(COOKIES.JWT_REFRESH_TOKEN, refreshToken, {
            httpOnly: true,
            // secure: true,
            // sameSite: 'None',
            secure: false,
            sameSite: 'lax',
            path: '/',
            // maxAge: 30 * 1000
            maxAge: process.env.JWT_REFRESH_TOKEN_EXPIRY_MS
        });
        newUser.refreshToken = refreshToken;
        const savedUser = await newUser.save();
        res.status(201).json({ responseCode: "USER_REGISTERED_SUCCESSFULLY", message: `User ${savedUser.email} Registered Successfully`, data: { email: savedUser.email, roles: savedUser.roles,[COOKIES.JWT_ACCESS_TOKEN]: accessToken } });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ responseCode: "SERVER_ERROR", message: 'Server Error' });
    }
};

module.exports = {handleRegister};