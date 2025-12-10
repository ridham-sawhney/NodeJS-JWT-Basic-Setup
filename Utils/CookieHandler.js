
const {COOKIES} = require("../constants/Cookies");

function createRefreshTokenCookie({response,refreshToken,remainingTime}){
    var devmode = process.env.IS_DEVELOPMENT == "true";

    response.cookie(COOKIES.JWT_REFRESH_TOKEN, refreshToken, {
        httpOnly: true,
        secure: devmode ? false : true,
        sameSite: devmode ? 'lax' : 'None',
        path: '/',
        maxAge:remainingTime || process.env.JWT_REFRESH_TOKEN_EXPIRY_MS
    });
}


function removeRefreshTokenCookie({ response }) {
    var devmode = process.env.IS_DEVELOPMENT == "true";
    response.clearCookie(COOKIES.JWT_REFRESH_TOKEN, {
        httpOnly: true,
        secure: devmode ? false : true,
        sameSite: devmode ? 'lax' : 'None',
    });
}

module.exports = {
    createRefreshTokenCookie,
    removeRefreshTokenCookie
}