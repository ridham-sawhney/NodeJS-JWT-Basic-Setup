const User = require("../models/User");
const jwt = require("jsonwebtoken");
const {removeRefreshTokenCookie} = require(".././Utils/CookieHandler");
const handleLogout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
        return res.sendStatus(204); // No content
    }
    const refreshToken = cookies.refreshToken;
    try {
        const foundUser = await User.findOne({ refreshToken: refreshToken }).exec();
        if (!foundUser) {
            return res.status(403).json({ responseCode: "FORBIDDEN", message: 'Forbidden' });
        }
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if (err || foundUser.email !== decoded.email) {
                    return res.status(403).json({ responseCode: "FORBIDDEN", message: 'Forbidden' });
                }

                foundUser.refreshToken = "";
                await foundUser.save();
                removeRefreshTokenCookie({response:res});
                res.status(200).json({ responseCode: "LOGOUT_SUCCESSFUL", message: 'Logout Successful' });
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ responseCode: "SERVER_ERROR", message: 'Server Error' });
    }
};

module.exports = { handleLogout };