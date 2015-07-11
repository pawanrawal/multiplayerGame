describe.only('GameModel',function() {

	describe('#get_games()',function(){
		it("should check get_games function",function(done){
			Game.get_games().exec(function(err,games){
				games.length.should.not.be.eql(0);
				done();
			})
		})
	})
})