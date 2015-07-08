/**
* Game.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

  	users: {
			collection: 'user',
			via: 'games'
  	},

    new : { type: 'string' },

  },

  /**
  * Method to get active games which can be joined by a user,displayed on home page
  * @param {Object} input {}
  * @param {Function} callback
  */

  get_games: function(input,callback){

  	var maxPlayers = 2;
  	var activeGames = new Array();
		Game.find().populate('users').exec(function(err,games){

			if (err) return callback(err);
			//Finding games where number of subscribed users is less then maxPlayers which can be subscribed.
			games.forEach(function(game){
				if (game.users.length < maxPlayers)
					activeGames.push(game);
			});
			return callback(null,activeGames);
		})
  },

  /**
  * Method to join game by a user
  * @param {Object} input
  *									* gameId {Integer}
  *									* userId {Integer}
  *
  * @param {Function} callback
  */

  join: function(input,callback){

  	var maxPlayers = 2;

  	Game.findOne(input.gameId).populate('users').exec(function(err,game){
  		if(err) return callback(err);
  		if (game.users.length < maxPlayers){
				game.users.add(input.userId,function(err,res){
					if (err) return callback(err);
				});
				game.save(function(err,game){
					if (err) callback(err);
					if (game.users.length == maxPlayers){
						// If game room has reached capacity then send message to client to remove the room.
						sails.sockets.blast('removeGame',{id: input.gameId});
						return callback(null,game);
					}
				});
			}
			else
				return callback(new Error('Game has reached capacity'));
  	})
  }
};

