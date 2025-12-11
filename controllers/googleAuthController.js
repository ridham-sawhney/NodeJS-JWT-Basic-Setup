const {OAuth2Client}  = require("google-auth-library");
const User = require("../models/User");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const {COOKIES} = require("../constants/Cookies");
const {createAccessToken,createRefreshToken} = require("../Utils/TokenCreator");
const {createRefreshTokenCookie} = require("../Utils/CookieHandler")

async function handleGoogleAuth (req, res){
  const payload = req.googlePayload;
  if (!payload.email_verified) {
    return res.status(403).json({responseCode:"USER_NOT_VERIFIED", message: 'Google email not verified' });
  }

  const {email,name,picture:pictureURL,email_verified} = payload;

  const user = await User.findOne({ email: email });
  if (!user) {
      const newUser = new User({
          email: email,
          pictureURL: pictureURL,
          name: name,
          isGoogleVerified: email_verified
      });
      if(process.env.ADMIN_EMAILS.split("|").includes(email)){
        newUser.roles = ["Admin",...newUser.roles];
      }
      const savedUser = await newUser.save();
      return res.status(202).json({
        responseCode:"GoogleAuthComplete",
        payload:{
            email:savedUser.email,
            name:savedUser.name,
            picture:savedUser.pictureURL,
            isGoogleVerified:savedUser.isGoogleVerified,
            isRegisteredUser:savedUser.isRegisteredUser
        }});
  }
  user.name = name;
  user.pictureURL = pictureURL;
  user.isGoogleVerified=email_verified;
  await user.save();

  if(!user.isRegisteredUser){
    // Still not registered
    //inform UI to generate password first
    return res.status(202).json({
        responseCode:"GoogleAuthComplete",
        payload:{
            email:user.email,
            name:user.name,
            picture:user.pictureURL,
            isGoogleVerified:user.isGoogleVerified,
            isRegisteredUser:user.isRegisteredUser,
            roles:[]
        }});
  }
  // user is registered  , issue  access token , refresh token 

  const accessToken = createAccessToken({email:user.email,roles:user.roles});
  const refreshToken = createRefreshToken({email:user.email});
  createRefreshTokenCookie({response:res,refreshToken:refreshToken});


  return res.status(200).json({
        responseCode:"GoogleAuthComplete",
        payload:{
            email:user.email,
            name:user.name,
            picture:user.pictureURL,
            isGoogleVerified:user.isGoogleVerified,
            isRegisteredUser:user.isRegisteredUser,
            roles:user.roles,
            [COOKIES.JWT_ACCESS_TOKEN]:accessToken,
        }});

}

async function validateAndExtractGoogleToken(req, res, next) {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ responseCode: 'MissingCredential', message: 'Missing credential' });

    // verify id token with Google
    let ticket;
    try {
        ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
    } catch (err) {
        return res.status(401).json({ responseCode: "InvalidGoogleToken", message: 'Invalid Google token' });
    }

    const payload = ticket.getPayload();
    req.googlePayload = payload;
    next && next();
}

module.exports ={validateAndExtractGoogleToken,handleGoogleAuth}
