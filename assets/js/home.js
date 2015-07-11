/**
 * home.js
 *
 * Front-end code and event handling for all events that happen on the home page before a game room is joined
 *
 */


// Adding a click handler for new game button
$('#new-game').on('click',newGame);

// Create a new game when user clicks on Start a Game Button
function newGame(){

	io.socket.post('/game',{userId: $('#user-id').val()},function(game){

		//This creates a new html structure inside which the game will be played. Create game div is defined in game.js.
		createGameDiv({id: game.id});

		//Join the room
		io.socket.post('/game/'+ game.id + '/users', {id: $('#user-id').val()});
	});
}

// Add a game to the list of games which can be joined, trigerred when a new game is created by any user.
function addGame(game){

	// Finding HTML element which will contain the game buttons.
	var div = $('#games');

	var button = createGameButton(game.id);
	div.append(button);

	//Binding event handler on the button to trigger attemptJoinGame , which will send request to the creater of the game.
	button.click({gameId: button.val(),userId: $('#user-id').val()},attemptJoinGame);
}

// Creates HTML dom button element belongin to a game.
function createGameButton(game_id){
	return $('<button type="submit" id="'+"game-"+game_id+'" value="'+game_id+'" class="btn btn-default game-button" style="margin:1em;">' + 'Game ' + game_id + '</button>');
}

// Remove a game from the home page as soon as it is no longer available to be joined,trigerred when is started or has reached maxPlayer capacity.
function removeGame(game_id){
	var button = $('#game-'+game_id);
	button.remove();
}

// Method to send a join request to the creator of a game when a user click on a game button to join the game
function attemptJoinGame(input){
	io.socket.get('/joinrequest',{userId: input.data.userId,gameId: input.data.gameId})
}

// Attempt to join game by a user, game div is created for the user if we get a
function joinGame(input){

	var game_id = input.gameId ;

	io.socket.post('/game/'+game_id + '/users',{ id: input.userId});

	createGameDiv({id: game_id});
}


// Initially populate the home page with preexisting games which can be joined.
function updateGames(games){

	// To prevent repopulating game if socket is disconnected
	if ($('#games').children().length){
		return;
	}
	games.forEach(function(game){
		addGame(game);
	});
}
