/**
* Gamescores.js
*
* @description :: This model stores the scores of a user for a particular game.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

  	user: {
      model: 'user'
    },
    game: {
    	model: 'game'
    },
    score: {
    	type: 'integer',
    	defaultsTo: 0
    }

  },

  /**
  * Method to update the score of a user for a game
  * @param {Object} input
  *                 * userId
  *                 * gameId
  *                 * rightAnswer
  *
  * @param {Function} callback
  */
  updateScore: function(input,callback){

  	var correctIncrement = 3;
  	var incorrectDecrement = 1;
  	var gameRoom = 'game-'+input.gameId

  	Gamescores.findOne({user: input.userId,game: input.gameId}).exec(function(err,userScore){
  		if(err)
  			return callback(err);

  		if (input.rightAnswer)
  			userScore.score += correctIncrement
  		else
  			userScore.score -= incorrectDecrement

  		userScore.save(function(err){
  			if(err)
  				return callback(err);

  			User.findOne({id: input.userId}).exec(function(err,user){
  				if(err)
  					return callback(err);
  				//Broadcasting the score of the user to the gameRoom
  				sails.sockets.broadcast(gameRoom,'updateScore',{userId: input.userId,score: userScore.score,userName: user.screenname,gameId: input.gameId})
  			})

  			return callback(null);
  		})
  	})
  }
};

