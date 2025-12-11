const express = require("express");
const router = express.Router();
const usersController = require("../../controllers/UserControllers/usersController");
const verifyJWT = require("../../middlewares/verifyJWT");

router.use((req, res, next) => {
    const publicRoutes = [
        '/generatePassword'
    ];

    if (publicRoutes.includes(req.path)) {
        return next(); // skip JWT
    }

    // Run JWT middleware for all other routes
    verifyJWT(req, res, next);
});


router.post("/generatePassword",usersController.handleGeneratePassword);

module.exports = router;