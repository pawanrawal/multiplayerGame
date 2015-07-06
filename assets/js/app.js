io.socket.on('connect', function Connected() {

	io.socket.on('login', function(data) {
      window.user = data;
  });

	//Listen to the game event which happens when something happens when a new game is created or change is made to a game we are subscribed to
	io.socket.on('game',function(message){

		switch(message.verb){

			case 'created':
				addGame(message.data);
				break;

			case 'destroyed':
				removeGame(message.id);
				break;

		}
	})

	// Get the current list of games available and publish on home.ejs
	// updateGames is defined in app.js
  io.socket.get('/game', updateGames);

  // Adding a click handler for new game button , newGame is defined in home.js
  $('#new-game').on('click',newGame);

})