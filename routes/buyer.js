const express = require('express');
const passport = require('passport');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const {
  ensureAuthenticatedb
} = require('../config/authb');
const bodyParser = require('body-parser');
let jsonParser = bodyParser.json();
const db2 = new sqlite3.Database('db/prod.db');
const db = new sqlite3.Database('db/buyer.db',
  function(err) {
    if (!err) {
      db.run(`
      CREATE TABLE IF NOT EXISTS buy (
        id INTEGER PRIMARY KEY ,
        name TEXT,
        email TEXT,
        pass TEXT,
        loc TEXT,
        type Text,
        isBuyer Boolean,
        SLoc Text
      )`);
      console.log('opened buyer.db');
    }
  }
);





// Buyers Login Page
router.get('/loginb', (req, res) => res.render('loginb'));

// Register Page
router.get('/registerb', (req, res) => res.render('registerb'));

//Buyer Change Pass Page
router.get('/dashbuyer/passb', ensureAuthenticatedb, (req, res) => res.render('passb'));


//Buyer Register Handler
router.post('/registerb', (req, res) => {
  const {
    name,
    email,
    password,
    location
  } = req.body;
  let errors = [];

  if (!name || !email || !password || !location) {
    errors.push({
      msg: 'Please enter all fields'
    });
  }

  //check pass length
  if (password.length < 3) {
    errors.push({
      msg: 'Password must be at least 3 characters'
    });
  }

  if (errors.length > 0) {
    res.render('registerb', {
      errors,
      name,
      email,
      password,
      location
    });

  } else {
    db.get('SELECT * FROM buy WHERE email=?', [email], function(err, row) {
      if (!err) {

        if (row) {
          errors.push({
            msg: 'Email already exists'
          });
          res.render('registerb', {
            errors,
            name,
            email,
            password,
            location
          });
        } else {
          db.serialize(function() {
            //hash password
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, salt);
            db.run('INSERT INTO buy(name,email,pass,loc,type,isBuyer) VALUES(?,?,?,?,?,?)', [name, email, hash, location, "buyer", true]);
            req.flash(
              'success_msg',
              'You are now registered and can log in'
            );
            res.redirect('/buyer/loginb');

          });
        }
      } else {
        throw err;
      }
    });
  }
});

//UPDATE Session Location
router.post('/location', jsonParser, ensureAuthenticatedb, function(req, res, next) {
  let long = req.body.long;
  let lat = req.body.lat;
  console.log(req.body);
  if ((42 <= lat && lat <= 64) && (-136 <= long && long <= -51)) {
    db.run('UPDATE buy SET SLoc=? WHERE email=?', ["CA", req.user.email], function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log(`Row(s) updated: ${this.changes}`);
    });
  } else if ((19 <= lat && lat <= 65) && (-161 <= long && long <= -67)) {
    db.run('UPDATE buy SET SLoc=? WHERE email=?', ["US", req.user.email], function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log(`Row(s) updated: ${this.changes}`);
    });
  } else {
    db.run('UPDATE buy SET SLoc=? WHERE email=?', [null, req.user.email], function(err) {
      if (err) {
        return console.error(err.message);
      }
      console.log(`Row(s) updated: ${this.changes}`);
    });

  };
});

//Display Browse Page
router.get('/dashbuyer/browse', jsonParser, ensureAuthenticatedb, function(req, res) {
  db.get('SELECT * FROM buy WHERE email=?', [req.user.email], function(err, row) {
    if (!err) {
      if (row.SLoc == "CA") {
        let data2 = "";
        db2.all('SELECT * FROM prod WHERE loc=?', ["can"], (err, row) => {
          let data = row;
          let data2 = "";
          for (c in data) {
            data2 = data2 + '<div class="card"><img src=' + data[c].path + ' style="width:100%"><p class="text1">' + data[c].name + '</p><p class="price">Price:$' + data[c].price + '</p><p class="text">Style:' + data[c].style + '</p><p class="text">Contact Email:' + data[c].email + '</p></div>';
          }
          res.render('browse', {
            data: '<div class="flex-container">' + data2 + '</div>'
          });
        });
      };
      if (row.SLoc == "US") {
        let data2 = "";
        db2.all('SELECT * FROM prod WHERE loc=?', ["usa"], (err, row) => {
          let data = row;
          let data2 = "";
          for (c in data) {
            data2 = data2 + '<div class="card"><img src=' + data[c].path + ' style="width:100%"><p class="text1">' + data[c].name + '</p><p class="price">Price:$' + data[c].price + '</p><p class="text">Style:' + data[c].style + '</p><p class="text">Contact Email:' + data[c].email + '</p></div>';
          }
          res.render('browse', {
            data: '<div class="flex-container">' + data2 + '</div>'
          });
        });
      } else {
        db2.all('SELECT * FROM prod ', (err, row) => {
          let data = row;
          let data2 = "";
          for (c in data) {
            data2 = data2 + '<div class="card"><img src=' + data[c].path + ' style="width:100%"><p class="text1">' + data[c].name + '</p><p class="price">Price:$' + data[c].price + '</p><p class="text">Style:' + data[c].style + '</p><p class="text">Contact Email:' + data[c].email + '</p></div>';
          }
          res.render('browse', {
            data: '<div class="flex-container">' + data2 + '</div>'
          });
        });

      };
    }
  });
});



//Buyer Change password Handler
router.post('/changeb', jsonParser, ensureAuthenticatedb, function(req, res) {
  const newpass = req.body.password2;
  let errors = [];
  if (newpass.length < 3) {
    errors.push({
      msg: 'Password must be at least 3 characters'
    });
  }
  if (errors.length > 0) {
    res.render('passb', {
      errors
    })
  } else {
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(newpass, salt);
    db.run('UPDATE buy SET pass=? WHERE email=?', [hash, req.user.email], function(err) {
      if (!err) {
        req.flash(
          'success_msg',
          'Password Changed'
        );
        res.redirect('/buyer/dashbuyer');
      }
    })
  };
});



// Buyer Login
router.post('/loginb', (req, res, next) => {
  passport.authenticate('buy', {
    successRedirect: '/buyer/dashbuyer',
    failureRedirect: '/buyer/loginb',
    failureFlash: true
  })(req, res, next);
});

//Buyer Logout Handler
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/');
});

module.exports = router;
