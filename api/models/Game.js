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
    state: {
      type: 'string',
      enum: ['created', 'started'],
      defaultsTo: 'created'
    },
    // To keep track of the creater of a game.
    creater: {
      model: 'user'
    },
    // To send special events to creater, like button to Start Game, and request for approval of a user joining.
    createrSocketId: {
      type: 'string'
    },
    //To keep track of when to end game
    anagramsAsked: {
      type: 'integer',
      defaultsTo: 1
    }

  },

  /**
  * Method to get active games which can be joined by a user,displayed on home page
  * @param {Object} input {}
  * @param {Function} callback
  */

  getGames: function(input,callback){

    var maxPlayers = 4;
    var activeGames = new Array();
		Game.find().populate('users').exec(function(err,games){

			if (err) return callback(err);
			//Finding games where number of subscribed users is less then maxPlayers which can be subscribed.
			games.forEach(function(game){
				if (game.users.length < maxPlayers && game.state!=='started')
					activeGames.push(game);
			});
			return callback(null,activeGames);
		})
  },

  /**
  * Method to send a join request to the creator of a game when another player requests to join
  * @param {Object} input
  *                 * userId {Integer}
  *                 * gameId {Integer}
  *                 * reqSocketId {String}
  * @param {Function} callback
  */
  joinRequest: function(input,callback){

    Game.findOne({id: input.gameId}).exec(function(err,game){

      if (err) return callback(err);

      User.findOne({id: input.userId}).exec(function(err,user){

        if (err) return callback(err);

        sails.sockets.emit(game.createrSocketId,'joinRequest',{userId: input.userId,gameId: input.gameId, name: user.screenname,requestingSocketId: input.reqSocketId});
        return callback(null);
      })

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

    var maxPlayers = 4;
    var gameId = input.gameId;
    var userId = input.userId;
    var gameRoom = 'game-'+gameId;

    Game.findOne({id:gameId}).populate('users').exec(function(err,game){
      if(err) return callback(err);

      if (game.users.length < maxPlayers){
				game.users.add(input.userId,function(err,res){
					if (err) return callback(err);
				});
				game.save(function(err,game){
					if (err) return callback(err);

          sails.sockets.join(input.socket,gameRoom);

          //Broadcast message to the room about the joining player
          Game.broadcastMessagetoGame({userId: userId,gameId: gameId,gameRoom: gameRoom},function(err){
            if (err) return callback(err);
          })

          //When number of players who have joined is 2 ,signalling the creater that he can start the game
          Game.emitMessageToCreater({numPlayers: game.users.length,createrSocketId: game.createrSocketId,gameId: gameId})

          //Create an instance of Gamescores to keep track of score of the joining user for this game.
          Gamescores.create({user: userId,game: gameId}).exec(function(err){
            if (err) return callback(err);
          })

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
  },


  /**
  * Method to broadcast message to a gameRoom
  * @param {Object} input
  *                 * gameId {Integer}
  *                 * userId {Integer}
  *                 * gameRoom {String}
  *
  * @param {Function} callback
  */
  broadcastMessagetoGame: function(input,callback){
    User.findOne({id: input.userId}).exec(function(err,user){
      if(err) return callback(err);
      sails.sockets.broadcast(input.gameRoom,'joinMessage',{user: user.screenname,gameId: input.gameId})
    })
    return callback(null);
  },

  /**
  * Method to inform the creater of a game that he can start the game
  * @param {Object} input
  *                 * gameId {Integer}
  *                 * numPlayers {Integer}
  *                 * createrSocketId {String}
  */
  emitMessageToCreater: function(input){
    if (input.numPlayers == 2){
      sails.sockets.emit(input.createrSocketId,'canStartGame',{gameId: input.gameId})
    }
  },

  /**
  * Method to start game and change game state
  * @param {Object} input
  *                 * gameId {Integer}
  * @param {Function} callback
  */
  startGame: function(input,callback){

    Game.findOne({id: input.gameId}).exec(function(err,game){
      if (err) return callback(err);

      game.state = 'started'
      game.save(function(err,game){
        if (err) return callback(err);

        //Sending message to remove the game from home page of all players when it is started by the creater
        sails.sockets.blast('removeGame',{id: input.gameId});

        Anagrams.broadcastAnagram(1,input.gameId,function(err){
          if (err) return callback(err);
            return callback(null);
        })
      })
    })
  },

  /**
  * Method to increment the value of anagramsAsked for a game so that next anagram can be asked.
  * @param {Object} input
  *                 * game {Object}
  * @param {Function} callback
  */
  incrementAnagramsAsked: function(game,callback){
    game.anagramsAsked +=1;
    game.save(function(err,game){
      if (err) return callback(err);
      return callback(null);
    })
  },

  /**
  * Method to submit answer to a question and check it.
  * @param {Object} input
  *                 * gameId {Integer}
  *                 * answer {string}
  *                 * userId {Integer}
  *                 * anagramId {Integer}
  * @param {Function} callback
  */
  submitAnswer: function(input,callback){
    Anagrams.findOne({id: input.anagramId}).exec(function(err,anagram){

      if (err) return callback(err);

      var data = {wronggram: anagram.wronggram,answer: input.answer,gameId: input.gameId,userId: input.userId};

      Anagrams.checkRightAnswer(data,function(err){
        if (err) return callback(err);

        return callback(null);
      })
    })
  }

};

