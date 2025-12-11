const express = require('express');
const router = express.Router();

const googleAuthController  = require('../controllers/googleAuthController');

router.post('/',googleAuthController.validateAndExtractGoogleToken,googleAuthController.handleGoogleAuth);

module.exports = router;