
const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ responseCode: "UNAUTHORIZED", message: 'Unauthorized' });
    }
    const accessToken = authHeader.split(' ')[1];
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ responseCode: "FORBIDDEN", message: 'Forbidden' });
        }
        req.user = decoded.UserInfo;
        next();
    });

};

module.exports = verifyJWT;