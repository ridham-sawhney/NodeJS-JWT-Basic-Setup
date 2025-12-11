const { COOKIES } = require("../../constants/Cookies");
const User = require("../../models/User");
const { createRefreshTokenCookie } = require("../../Utils/CookieHandler");
const { createAccessToken, createRefreshToken } = require("../../Utils/TokenCreator");
const { validateAndExtractGoogleToken } = require("../googleAuthController");
const bcrypt = require("bcrypt");
async function handleGeneratePassword(req, res) {
    try {
        //For password generation , credential is required
        //Logic to extract credential from the request , verify the google credential 
        // and extract user details
        // will be stored in the request
        const { email: useremail, password, credential } = req.body;
        if (!useremail || !password || !credential) {
            return res.status(400).json({ responseCode: 'MissingCredential', message: 'Missing credential' });
        }
        await validateAndExtractGoogleToken(req, res);
        const { email, name, picture, email_verified } = req.googlePayload;

        //find user from the DB , it should be google verified already and partially stored in the DB
        const existingUser =await  User.findOne({ email: email });
        if (!existingUser) {
            return res.status(401).json({ responseCode: "USER_NOT_FOUND", message: 'User not found.' });
        }
        if (existingUser.isRegisteredUser && existingUser.password) {
            return res.status(401).json({ responseCode: "PASSWORD_ALREADY_GENERATED", message: 'Password already generated.' });
        }
        const hashedPwd = await bcrypt.hash(password, 10);
        existingUser.name = name;
        existingUser.pictureURL = picture;
        existingUser.isGoogleVerified = email_verified;
        existingUser.isRegisteredUser = true;
        existingUser.password = hashedPwd;
        
        const accessToken = createAccessToken({ email: existingUser.email, roles: existingUser.roles });
        const refreshToken = createRefreshToken({ email: existingUser.email });
        createRefreshTokenCookie({ response: res, refreshToken: refreshToken });

        existingUser.refreshToken = refreshToken;
        await existingUser.save();


        return res.status(200).json({
            email: existingUser.email,
            name: existingUser.name,
            picture: existingUser.pictureURL,
            roles:existingUser.roles,
            isGoogleVerified: existingUser.isGoogleVerified,
            isRegisteredUser: existingUser.isRegisteredUser,
            [COOKIES.JWT_ACCESS_TOKEN]: accessToken
        });


    } catch (err) {
        console.log(err);
        return res.status(500).json({ responseCode: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error.',err:err });
    }
}

module.exports ={handleGeneratePassword}