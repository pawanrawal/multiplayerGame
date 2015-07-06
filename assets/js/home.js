// Add a game to the list of games which can be joined
function addGame(game){
	var div = $('#games');
	var button = $('<button type="submit" id="'+"game-"+game.id+'" value="'+game.id+'" class="btn btn-default" style="margin:1em;">' + 'Game ' + game.id + '</button>')
	div.append(button);
}

// Remove a game from the home page as soon as it is no longer available to be joined
function removeGame(game_id){
	var button = $('#game-'+game_id);
	button.remove();
}

// Initially populate the home page with preexisting games which can be joined.
function updateGames(games){
	games.forEach(function(game){
		addGame(game);
	});
}

// Create a new game when user clicks on Start a Game Button
function newGame(){
	io.socket.post('/game',function(game){
		addGame(game);

		createGameDiv({id: game.id});

		io.socket.post('/game'+game.id + '/users' + {id: window})
	});
}

