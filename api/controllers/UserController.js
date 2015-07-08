/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  /**
   * `UserController.login()`
   */
  login: function (req, res) {

    User.tryLogin({
      screenname: req.param('name'),
      password: req.param('password')
    },function(err,user){
        if (err) {
          sails.log.error(err);
          // Implement flash at front end;
          req.flash('error',err);
          return res.redirect('/login');
        }

        req.session.user_id = user.id;
        req.session.authenticated = true;
        res.redirect('/home');
    })
  },


  /**
   * `UserController.logout()`
   */
  logout: function (req, res) {
    req.session.user_id = null;
    req.session.authenticated = false;
    res.redirect('/login')
  },


  /**
   * `UserController.signup()`
   */
  signup: function (req, res) {
    // Signing up a user using method from User Model
    User.signup({
      screenname: req.param('name'),
      password: req.param('password')
    },function(err,user){

      //TODO- Send flash message in case of error
      if (err) return res.negotiate(err);

      req.session.user_id = user.id;
      req.session.authenticated = true;
      return res.redirect('/home')
    })
  },

  home: function(req,res){
    res.view('home');
  }
};

