module.exports = {
  ensureAuthenticatedb: function(req, res, next) {

    if (req.isAuthenticated() && req.user.type == "buyer") {
      return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/');
  }
};
