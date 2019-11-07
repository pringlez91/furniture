const express = require('express');
const passport = require('passport');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const {ensureAuthenticatedv} = require('../config/authv');
const bodyParser = require('body-parser');
let jsonParser = bodyParser.json();
var db1 = new sqlite3.Database('db/buyer.db');
const format = require('string-format');
const multer = require('multer');
const db2 = new sqlite3.Database('db/prod.db');
//Connect to Vendor DB
const db = new sqlite3.Database('db/vendor.db',
  function(err) {
    if (!err) {
      db.run(`
      CREATE TABLE IF NOT EXISTS ven (
        id INTEGER PRIMARY KEY,
        name TEXT,
        email TEXT,
        pass TEXT,
        loc TEXT,
        type Text,
        isAdmin Boolean
      )`);
      console.log('opened vendor.db');
    }
  });



const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './views/images')
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + file.originalname)
  }
});


const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000000
  },
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('ImageN');

function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;

  const mimetype = filetypes.test(file.mimetype);

  if (mimetype) {
    return cb(null, true);
  } else {
    cb('Invalid Image Format!');
  }
};

format.extend(String.prototype, {
  escape: s => s.replace(/[&<>"'`]/g, c => '&#' + c.charCodeAt(0) + ';'),
  upper: s => s.toUpperCase(),
});

//Login Page
router.get('/loginv', (req, res) => res.render('loginv'));

// Register Page
router.get('/registerv', (req, res) => res.render('registerv'));

// Change Pass Page
router.get('/dashvendor/passv', ensureAuthenticatedv, (req, res) => res.render('passv'));

//add Product
router.get('/dashvendor/addprod', ensureAuthenticatedv, (req, res) => res.render('addproduct'));

//Delete Account Handler
router.post('/delet', ensureAuthenticatedv, function(req, res) {
  let email = req.body.email;
  db1.run(`DELETE FROM buy WHERE email=?`, email, function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Row(s) deleted ${this.changes}`);
    req.flash(
      'success_msg',
      'User Deleted'
    );
    res.redirect('/vendor/dashvendor/modify');
  });


});

//Modify Page
router.get('/dashvendor/modify', ensureAuthenticatedv, function(req, res) {
  db1.all('SELECT * FROM buy ', (err, row) => {
    if (!err) {
      let data = row;
      let data2 = "";
      let temp = `
        <div class="card" style="width: 18rem;">
          <div class="card-body">
            <h5 class="card-title">Name: {0}</h5>
            <h5 class="card-title">Email:{1}</h5>
            <form action="/vendor/delet" method="POST">
            <div class="form-group">
              <input type="hidden" name="email" value={1} />
            </div>
            <button type="submit" class="btn btn-primary">Delet</button>
            </form>
          </div>
        </div>
        `;
      for (c in data) {
        data2 = data2 + temp.format(data[c].name, data[c].email);

      }
      res.render('modify', {
        data: '<div class="flex-container">' + data2 + '</div>'
      });

    } else {
      throw err

    };


  });

});

//Register Handler
router.post('/registerv', function(req, res) {

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
    res.render('registerv', {
      errors,
      name,
      email,
      password,
      location
    });

  } else {
    db.get('SELECT * FROM ven WHERE email=?', [email], function(err, row) {
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
            db.run('INSERT INTO ven(name,email,pass,loc,type,isAdmin) VALUES(?,?,?,?,?,?)', [name, email, hash, location, "admin", true]);
            req.flash(
              'success_msg',
              'You are now registered and can log in'
            );
            res.redirect('/vendor/loginv');

          });
        }
      } else {
        throw err;
      }
    });
  }

});

//Change Pass Handler
router.post('/changev', jsonParser, ensureAuthenticatedv, function(req, res) {
  const newpass = req.body.password2;
  let errors = [];
  if (newpass.length < 3) {
    errors.push({
      msg: 'Password must be at least 3 characters'
    });
  }

  if (errors.length > 0) {
    res.render('passv', {
      errors
    })
  } else {

    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(newpass, salt);
    db.run('UPDATE ven SET pass=? WHERE email=?', [hash, req.user.email], function(err) {
      if (!err) {
        req.flash(
          'success_msg',
          'Password Changed'
        );
        res.redirect('/vendor/dashvendor');

      }
    })
  };
});

//Vendor Login
router.post('/loginv', (req, res, next) => {
  passport.authenticate('ven', {
    successRedirect: '/vendor/dashvendor',
    failureRedirect: '/vendor/loginv',
    failureFlash: true
  })(req, res, next);

});

//Add Product Handler
router.post('/addp', (req, res) => {
  upload(req, res, (err) => {
    let errors = [];
    if (err) {
      errors.push({
        msg: err
      });
      res.render('addproduct', {
        errors
      });
    } else {
      const {
        name,
        price,
        location,
        style
      } = req.body;


      if (!name) {
        errors.push({
          msg: "Please Enter All Fields"
        });
      };
      if (req.file == undefined) {
        errors.push({
          msg: "No File Selected"
        });
      };
      if (errors.length > 0) {
        console.log(errors);
        res.render('addproduct', {
          errors
        })
      } else {
        req.flash(
          'success_msg',
          'Product Added'
        );

        let pr = parseInt(price);
        db2.run('INSERT INTO prod(name,style,loc,path,email,price) VALUES(?,?,?,?,?,?)', [name, style, location, '/images/' + req.file.filename, req.user.email, price]);
        res.redirect('/vendor/dashvendor/addprod');


      };
    }
  });
});

//Vendor Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/');
});

module.exports = router;
