const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/prod.db',
  function(err) {
    if (!err) {
      db.run(`
      CREATE TABLE IF NOT EXISTS prod (
        id INTEGER PRIMARY KEY,
        name TEXT,
        style TEXT,
        loc TEXT,
        path TEXT,
        email Text,
        price INTEGER
      )`);
      console.log('opened prod.db');
    }
  });




const PORT = process.env.PORT || 8000;
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/routes'));





// Passport Config
require('./config/passport')(passport);


//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');


// body parser
app.use(bodyParser.urlencoded({
  extended: true
}));

// Express session
app.use(
  session({
    secret: 'bacon',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


//Routes
app.use('/', require('./routes/index'));
app.use('/buyer', require('./routes/buyer'));
app.use('/vendor', require('./routes/vendor'));



app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));
