
const jwt = require("jsonwebtoken");
function createAccessToken({ email, roles }) {

    return jwt.sign(
        {
            "UserInfo": {
                "email": email,
                "roles": roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY }
    );
}

function createRefreshToken({email,remainingTime}) {
    return jwt.sign(
        { "email": email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn:remainingTime || process.env.JWT_REFRESH_TOKEN_EXPIRY }
    );
}

module.exports = {
    createAccessToken,
    createRefreshToken
}