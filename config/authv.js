module.exports = {
  ensureAuthenticatedv: function(req, res, next) {
    if (req.isAuthenticated() && req.user.type == "admin") {
      return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/');
  }
};
