io.socket.on('connect', function Connected() {

	$('#games').show();

	//Listen to the game event which happens when something happens when a new game is created or change is made to a game we are subscribed to
	io.socket.on('game',function(game){
		switch(game.verb){

			case 'created':
				addGame(game.data);
				break;

			case 'destroyed':
				removeGame(game.id);
				break;

		}
	})

	// Get the current list of games available and publish on home.ejs
	// updateGames is defined in home.js
  io.socket.get('/game', updateGames);

  // Adding a click handler for new game button , newGame is defined in home.js
  $('#new-game').on('click',newGame);

	io.socket.on('removeGame',function removeGameFromDom(data){
		removeGame(data.id);
	})

	io.socket.on('disconnect',function(){
		$('#games').hide();
	})


})