const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/auth/login/failed' 
  }),
  (req, res) => {
    res.redirect(process.env.CLIENT_URL);
  }
);

router.get('/user', authController.loginSuccess);

router.get('/login/failed', authController.loginFailed);

router.get('/logout', authController.logout);

module.exports = router;