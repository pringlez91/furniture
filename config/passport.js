const LocalStrategy = require('passport-local').Strategy;
var crypto = require('crypto');
var sqlite3 = require('sqlite3');
const bcrypt = require('bcryptjs');
var db = new sqlite3.Database('db/buyer.db');
var db1 = new sqlite3.Database('db/vendor.db');



module.exports = function(passport) {
  passport.use('buy',
    new LocalStrategy({
      usernameField: 'email',
      passReqToCallback: true
    }, function(req, email, password, done) {
      db.get('SELECT * FROM buy WHERE email = ?', email, function(err, row) {
        if (!err) {
          if (!row) {
            return done(null, false, {
              message: 'Email doesnt exist'
            });
          }
          bcrypt.compare(password, row.pass, (err, isMatch) => {
            if (isMatch) {

              return done(null, row);
            } else {
              return done(null, false, {
                message: 'Incorrect Password'
              });
            }

          })


        };

      });
    })

  );

  passport.use('ven',
    new LocalStrategy({
      usernameField: 'email'
    }, (email, password, done) => {
      db1.get('SELECT * FROM ven WHERE email = ?', email, function(err, row) {
        if (!err) {
          if (!row) {
            return done(null, false, {
              message: 'Email doesnt exist'
            });
          }
          bcrypt.compare(password, row.pass, (err, isMatch) => {
            if (isMatch) {
              return done(null, row);
            } else {
              return done(null, false, {
                message: 'Incorrect Password'
              });
            }

          })


        };

      });
    })

  );





  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    if (user.type == "admin") {
      db1.get('SELECT id,name,email,type,isAdmin FROM ven WHERE id = ?', user.id, function(err, row) {
        if (!row) return done(null, false);
        return done(null, row);
      });

    }
    if (user.type == "buyer") {
      db.get('SELECT id,name,email,type,isBuyer,SLoc FROM buy WHERE id = ?', user.id, function(err, row) {
        if (!row) return done(null, false);
        return done(null, row);
      });

    }

  });

};
