
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {COOKIES} = require('../constants/Cookies');
const handleRegister = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ responseCode: "USERNAME_PASSWORD_REQUIRED", message: 'Username and password are required' });
    }
    var foundUser = await User.findOne({ username: username }).exec();
    if (foundUser) {
        return res.status(409).json({ responseCode: "USERNAME_NOT_AVAILABLE", message: 'Username Not Available' });
    }
    try {
        const hashedPwd = await bcrypt.hash(password, 10);

        const newUser = new User({
            username: username,
            password: hashedPwd
        });
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": username,
                    "roles": ["User"]
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '60s' });

        const refreshToken = jwt.sign(
            { "username": username },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '1d' }
        );
        res.cookie(COOKIES.JWT_REFRESH_TOKEN, refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            // maxAge: 30 * 1000
            maxAge: 24 * 60 * 60 * 1000
        });
        newUser.refreshToken = refreshToken;
        const savedUser = await newUser.save();
        res.status(201).json({ responseCode: "USER_REGISTERED_SUCCESSFULLY", message: `User ${savedUser.username} Registered Successfully`, data: { username: savedUser.username, roles: savedUser.roles,[COOKIES.JWT_ACCESS_TOKEN]: accessToken } });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ responseCode: "SERVER_ERROR", message: 'Server Error' });
    }
};

module.exports = {handleRegister};