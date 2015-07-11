/**
 * app.js
 *
 * Front-end code and event handling for Anagram app
 *
 */

// Attaching a listener which fires when a connection is established
io.socket.on('connect', function Connected() {

	//Once we have connected we start listening for other events

	// Gets the current list of games available and publish on home.ejs
	// updateGames is defined in home.js
  io.socket.get('/game', updateGames);

	//Listener for new game or update to a game we are subscribed to
	io.socket.on('game',function(game){
		switch(game.verb){

			case 'created':
			//addGame adds the game as a button which can be joined. addGame is defined in home.js
				addGame(game.data);
				break;

			case 'destroyed':
			//removeGame remove the game button. removeGame is defined in home.js
				removeGame(game.id);
				break;

		}
	})

	//Listener to remove game from home page when maxPlayer capacity exhausted, removeGame is defined in home.js
	io.socket.on('removeGame',function (data){
		removeGame(data.id);
	})

	// Listener to listen for a new join request by a player. addRequest is defined in game.js
	io.socket.on('joinRequest',function (data){
		addRequest(data);
	})

	// Listener to listen for approval to join a game. joinGame is defined in home.js
	io.socket.on('approval',function(data){
		joinGame(data);
	})

	//Listener to add name of player joining to game board , appendMessage is defined in game.js
	io.socket.on('joinMessage',function (data){
		appendMessage(data);
	})

	//Listener to append a start game button for the creater of the game on recieving message, appendStartGame is defined in game.js
	io.socket.on('canStartGame',function (data){
		appendStartGame(data);
	})

	//Listner to display an anagram qn,appendQuestionOptions is defined in game.js
	io.socket.on('displayAnagram',function (data){
		appendQuestionOptions(data);
	})

	//Listener to update the score of a user, updateGameSccores is defined in game.js
	io.socket.on('updateScore',function (data){
		updateGameScores(data);
	})

	//Listener to show Leave room button when game is over. showGameOverMessage is defined in game.js
	io.socket.on('gameOver',function(data){
		showGameOverMessage(data);
	})

	io.socket.on('disconnect',function(){
		$('#games').children().remove();
	})

})

// Method to start game , invoked when game creater clicks on start game
startGame = function(input){
	$(this).hide();

	//Sends request to start game
	io.socket.get('/startgame',{gameId: input.data.gameId});
}

// Method to submit an answer, invoked when user clicks on an option
submitAnswer = function(input){
	io.socket.post('/submitanswer',input);
}

// Method to send approval to the requesting player for joining the game.
sendApproval = function(input){

	//Removing the approval request div
	$("#approval-request-"+input.data.userId).remove();

	//Sending approval request to the requester
	io.socket.get('/approve', input.data);
}