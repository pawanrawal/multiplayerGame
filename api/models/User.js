/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var bcrypt = require('bcrypt');

module.exports = {


  attributes: {

  	screenname: {
  		type: 'string',
  		required: true,
  		unique: true
  	},

  	password: {
  		type: 'string',
  		required: true,
  		minLength: 6
  	},
  	games: {
  		collection: 'game',
  		via: 'users'
  	}
  },

  //Callback to encrypt password before storing in database
  beforeCreate: function(values,callback){

  	bcrypt.genSalt(10, function(err, salt) {
  		if (err) return callback(err);
	    bcrypt.hash(values.password, salt, function(err, hash) {
	      if (err) return callback(err);
	      values.password = hash;
	      callback();
	    });
		});
  },

  /**
  * Create a new user using inputs from signup page
  * @param {Object} input
  *									* name {String}
  *									* password {String}
  *
  * @param {Function} callback
  */

  signup: function(input,callback){
  	//Create a user entry
  	User.create({
  		screenname: input.screenname,
  		password: input.password
  	}).exec(callback);
  },

  /**
  * Tries to login a user
  * @param {Object} input
  *									* name {String}
  *									* password {String}
  *
  * @param {Function} callback
  */

  tryLogin: function(input,callback){
  	//Create a user entry
  	User.findOne({
  		screenname: input.screenname
  	}).exec(function(err,user){
  			if (err) return callback(err);

        if (!user) return callback(new Error("User does not exist"));

  			bcrypt.compare(input.password, user.password, function(err, res) {
  				if (err) return callback(err);

  				if (!res) return callback(new Error("Password is wrong"));

  				if (res) return callback(null,user);

  			});
  		});
  },
};

