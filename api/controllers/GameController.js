/**
 * GameController
 *
 * @description :: Server-side logic for managing Games
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	find: function(req,res){

		Game.get_games({},function(err,games){

			if (err) {
				sails.log.error(err);
				return res.badRequest();
			}

			res.ok(games);
		})

	},

	create: function(req,res){

		Game.create().exec(function(err,game){
			if (err){
				sails.log.error(err);
				return res.badRequest();
			}
			sails.sockets.blast('game',{data: game,verb: 'created',id: game.id},req.socket);
			return res.ok(game);
		})
	},

	join: function(req,res){

		Game.join({
			gameId: req.param('gameId'),
			userId: req.param('id')
		},function(err,game){
			if (err) {
				sails.log.error(err);
				return res.badRequest();
			}
			return res.ok();
		})
	}

};


