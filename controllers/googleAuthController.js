const {OAuth2Client}  = require("google-auth-library");
const User = require("../models/User");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function handleGoogleAuth (req, res){
  const { credential } = req.body;
  if (!credential) return res.status(400).json({responseCode:'MissingCredential', message: 'Missing credential' });

  // verify id token with Google
  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch (err) {
    return res.status(401).json({responseCode:"InvalidGoogleToken", message: 'Invalid Google token' });
  }

  const payload = ticket.getPayload();
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
      const savedUser = await newUser.save();
      res.json({
        responseCode:"GoogleAuthComplete",
        payload:{
            email:savedUser.email,
            name:savedUser.name,
            picture:savedUser.pictureURL,
            isGoogleVerified:savedUser.isGoogleVerified,
            isRegisteredUser:savedUser.isRegisteredUser
        }});
  }
  res.json({
    message:"Pendingg."
  })

}

module.exports ={handleGoogleAuth}
