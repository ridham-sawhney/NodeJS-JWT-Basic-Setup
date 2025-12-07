const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { COOKIES } = require('../constants/Cookies');

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.[COOKIES.JWT_REFRESH_TOKEN]) {
        return res.status(401).json({ responseCode: "UNAUTHORIZED", message: 'Unauthorized' });
    }
    const refreshToken = cookies[COOKIES.JWT_REFRESH_TOKEN];
    try {
        const foundUser = await User.findOne({ refreshToken: refreshToken }).exec();
        if (!foundUser) {
            return res.status(403).json({ responseCode: "FORBIDDEN", message: 'Forbidden' });
        }
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if (err || foundUser.username !== decoded.username) {
                    return res.status(403).json({ responseCode: "FORBIDDEN", message: 'Forbidden' });
                }
                const accessToken = jwt.sign(
                    {
                        "UserInfo": {
                            "username": foundUser.username,
                            "roles": foundUser.roles
                        }
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '60s' }
                );

                //Also update the value of refresh token in the DB and cookie without changing its expiry time
                const expiryTime = decoded.exp;
                const now = Math.floor(Date.now() / 1000);
                const remainingTime = expiryTime - now;

                const newRefreshToken = jwt.sign(
                    { "username": foundUser.username },
                    process.env.REFRESH_TOKEN_SECRET,
                    { expiresIn: remainingTime }
                );
                res.cookie(COOKIES.JWT_REFRESH_TOKEN, newRefreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'None',
                    maxAge: remainingTime * 1000
                });
                foundUser.refreshToken = newRefreshToken;
                await foundUser.save();


                res.json({ responseCode: "TOKEN_REFRESHED_SUCCESSFULLY", [COOKIES.JWT_ACCESS_TOKEN]: accessToken });
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ responseCode: "SERVER_ERROR", message: 'Server Error' });
    }
};

module.exports = { handleRefreshToken };
