// middleware/auth.js
module.exports = {
    ensureAuthenticated: (req, res, next) => {
      if (req.session.userId) {
        return next();
      }
      res.redirect('/auth/signin');
    },
    forwardAuthenticated: (req, res, next) => {
      if (!req.session.userId) {
        return next();
      }
      res.redirect('/organizer/dashboard');
    },
  };
  