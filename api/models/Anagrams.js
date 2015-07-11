/**
* Anagrams.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

  	subject:{
  		type: 'string'
  	},
  	anagram1:{
  		type: 'string'
  	},
  	anagram2:{
  		type: 'string'
  	},
    anagram3: {
      type: 'string'
    },
  	//Storing which among the above 4 anagrams is the wrong one.
    wronggram:{
  		type: 'string'
  	}

  },

  /**
  * Method to check whether user selected answer is the right answer
  * @param {Object} input
  *                 * wronggram
  *                 * answer
  *                 * gameId
  *
  * @param {Function} callback
  */

  checkRightAnswer: function(input,callback){

    var isRightAnswer = (input.wronggram === input.answer)

    if (!isRightAnswer){
      //Method to decrement users score in case his answer is wrong.
      Gamescores.updateScore({gameId: input.gameId,userId: input.userId,rightAnswer: isRightAnswer},function(err){
        if (err)
          return callback(err);
        return (null);
      })
    }

    else{

      Gamescores.updateScore({gameId: input.gameId,userId: input.userId,rightAnswer: isRightAnswer},function(err){
        if (err)
          return callback(err);
      })
      Game.findOne({id: input.gameId},function(err,game){
        if (err)
          return callback(err);

        if (game.anagramsAsked == 10){
          //Broadcast Game ended message and leave room button
          sails.sockets.broadcast('game-'+input.gameId,'gameOver',{gameId: input.gameId});
          return callback(null);
        }
        else{
          //Broadcasting the next anagram options to be displayed.
          Anagrams.broadcastAnagram(game.anagramsAsked + 1,input.gameId,function(err){
            if (err)
              return callback(err);

            Game.incrementAnagramsAsked(game,function(err){
              if (err)
                return callback(err);
              return callback(null);
            })
          })
        }
      })
    }
  },

  /**
  * Method to broadcast an anagram and its options to the user
  * @param {Integer} anagramId
  * @param {Integer} gameId
  * @param {Function} callback
  */
  broadcastAnagram: function(anagramId,gameId,callback){

    Anagrams.findOne({id: anagramId}).exec(function(err,anagram){
      if (err)
        return callback(err);

      sails.sockets.broadcast('game-' + gameId,'displayAnagram',{gameId: gameId,anagram: anagram})
      return callback(null);
    })
  }
};

