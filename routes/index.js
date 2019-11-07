const express = require('express');
const router = express.Router();
const {ensureAuthenticatedb} = require('../config/authb');
const { ensureAuthenticatedv} = require('../config/authv');





//Homepage
router.get('/', (req, res) => res.render('homepage'));

//Dash Vendor
router.get('/vendor/dashvendor', ensureAuthenticatedv, function(req, res) {
  res.render('dashvendor', {
    name: req.user.name
  })
});

//Dash Buyer
router.get('/buyer/dashbuyer', ensureAuthenticatedb, function(req, res) {
  res.render('dashbuyer', {
    name: req.user.name
  })
});


module.exports = router;
