/**
 * GameController
 *
 * @description :: Server-side logic for managing Games
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	find: function(req,res){

		Game.getGames({},function(err,games){

			if (err) {
				sails.log.error(err);
				return res.badRequest();
			}

			res.ok(games);
		})

	},

	create: function(req,res){

		Game.create({creater: req.param('userId'),createrSocketId: req.socket.id}).exec(function(err,game){
			if (err){
				sails.log.error(err);
				return res.badRequest();
			}
			//Sending game creation message to all sockets except this socket.
			sails.sockets.blast('game',{data: game,verb: 'created',id: game.id},req.socket);
			return res.ok(game);
		})
	},

	joinRequest: function(req,res){

		Game.joinRequest({userId: req.param('userId'),gameId: req.param('gameId'),reqSocketId: req.socket.id},function(err){
			if (err) return res.badRequest();
			return res.ok();
		})
	},

	approveRequest: function(req,res){
		sails.sockets.emit(req.param('requestingSocketId'),'approval',{gameId: req.param('gameId'),userId: req.param('userId')});
		res.ok();
	},

	join: function(req,res){

		Game.join({
			gameId: req.param('gameId'),
			userId: req.param('id'),
			socket: req.socket
		},function(err,game){
			if (err) {
				sails.log.error(err);
				return res.badRequest();
			}

			return res.ok();
		})
	},

	start: function(req,res){

		Game.startGame({gameId: req.param('gameId')},function(err){
			if (err) return res.badRequest();
			return res.ok();
		})
	},

	submitAnswer: function(req,res){

		Game.submitAnswer({ anagramId: req.param('anagramId'),answer: req.param('answer'),gameId: req.param('gameId'),userId: req.param('userId')},function(err){
			if (err) return res.badRequest();
			return res.ok();
		})

	}


}


