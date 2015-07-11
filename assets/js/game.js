//Creates new div for game and appends it to the page
function createGameDiv(game){

	//Hiding buttons for Existing games and option to start new game
	$('#game-header').hide();
	$('#games').hide();

	var gameDivId = 'game-room-' + game.id;

	var gameDiv = $('<div id="'+ gameDivId +'" style="width:700px"></div>');

	var gamePanel = '<div class="text-center"><div style="height:300px;width:400px;float:left;" id="game-panel-'+game.id +'"><div id="anagram" class="text-center"><p style="font-size:16px">Options will appear here</p></div></div>'

	var gameMessage = '<div style="height:300px;width:250px;float:right;display:inline-block;border-style:solid;border-width:2px;border-color:white;" id="game-message-panel-'+game.id +'"></div></div>'

	// Creating html for the room
	var gameHTML = gamePanel + gameMessage

	gameDiv.html(gameHTML);

	$('#game-room').append(gameDiv);

}

// Method to add game joining request on the game creators game panel
function addRequest(data){

	// Gets the message panel DOM element
	var messagePanelDiv = $('#game-message-panel-' + data.gameId);

	//Creates an approval div and populates it with info about the user wanting to join.
	var approvalDiv = $('<div id="approval-request-'+data.userId+'"></div>')

	var joinMessage = $('<p style="font-size:16px" class="text-center" style="margin:5px">'+ data.name +' wants to join</p>');

	var acceptButton = $('<button class="btn btn-default" style="margin:2px">Accept</button>');

	var rejectButton = $('<button class="btn btn-danger style="margin:2px">Reject</button><br>');

	approvalDiv.append(joinMessage).append(acceptButton).append(rejectButton);

	messagePanelDiv.append(approvalDiv);

	//Attaching on click listener to acceptButton to sendApproval to requesting user,sendApproval is defined in app.js
	acceptButton.on('click',data,sendApproval);

	//Attaching on click listener on rejectButton to remove the approval div from the creaters game
	rejectButton.on('click',{divId: "approval-request-"+data.userId},removeApprovalDiv)

}

//Removes the approvalDiv after creator clicks on rejectButton
function removeApprovalDiv(input){
	$('#'+input.data.divId).remove();
}

// Appends message about a new user joining the room. The method is trigerred to all players whenever a new user joins the game.
function appendMessage(data){
	var messagePanelDiv = $('#game-message-panel-' + data.gameId);
	var message = $('<p style="font-size:18px" class="text-center" style="margin:5px">'+ data.user +' joined</p>');
	messagePanelDiv.append(message);
}

//Appends the start game button for the game creater when atleast two players are in the game room.
function appendStartGame(data){
	var startGameDiv = $('#start-game');
	var startGameButton = $('<button class="btn btn-default" id="start-game-'+data.gameId+'">Start Game</button><br>');

	startGameDiv.append(startGameButton);

	// Binding click handler to startGameButton. startGame is defined in app.js
	startGameButton.on('click',{gameId: data.gameId},startGame);
}

//Appends the anagram options to the anagram div
function appendQuestionOptions(data){

	var anagram = data.anagram;

	var anagramDiv = $('#anagram');

	//Previously displayed anagram are removed.
	anagramDiv.children().remove();

	//New anagram question is added
	anagramDiv.append(createAnagramDiv(anagram,data.gameId));
	var gamePanelDiv = $('#game-panel-' + data.gameId);
	gamePanelDiv.append(anagramDiv);

	// Binding click handlers to the options to submit the answer
	$('#anagram .btn-lg').on('click',function(){
		submitAnswer({answer:this.value,anagramId:anagram.id,gameId:data.gameId,userId: $('#user-id').val()})
	})
}

// Method to create anagram div using its options
function createAnagramDiv(anagram,gameId){
	var anagramButtons = ""

	anagramButtons = anagramButtons + createButton(anagram.subject) + createButton(anagram.anagram1) + createButton(anagram.anagram2) + createButton(anagram.anagram3);

	return $(anagramButtons);
}

// Method to create a anagram button
function createButton(value){
	return '<button style="margin:10px" class= "btn btn-default btn-lg" value="'+value+'">'+value+'</button><br>';
}

// Method to update the game scores of users.
function updateGameScores(data){

	var scoreDivId = "game-"+data.gameId+"-user-"+data.userId;

	//Checks if score div exists for this user and the present game.
	var divExists = $('#'+scoreDivId).length!= 0

	// We initialize a new div if one does not already exists.
	var scoreDiv = (divExists) ?  $('#'+scoreDivId) : $('<div style="font-size:20px;margin:1em;display:inline-block"></div>') ;

	scoreDiv.html(data.userName + ' : ' + data.score);

	// Append the div to gamescores div if one does not already exist
	if (!divExists){
		scoreDiv.attr('id',scoreDivId);
		$('#game-scores').append(scoreDiv);
	}

}

// Method to show Game Over message when gameOver event is recieved
function showGameOverMessage(data){

	//Finds the panel div and appends game over message to it.
	var panelDiv = $('#game-room-'+data.gameId);
	panelDiv.children().remove();
	panelDiv.append('<br><br><h1 class="text-center">Game Over</h1>');

	appendLeaveRoomButton(data.gameId);

}

function appendLeaveRoomButton(gameId){

	//Appends leaveRoomButton to start game div.
	var leaveRoomDiv = $('#leave-room');
	var leaveRoomButton = $('<button class="btn btn-danger" id="leave-game-'+gameId+'">Leave Game Room</button><br>');
	leaveRoomDiv.append(leaveRoomButton);

	// Binding click handler to startGame when start game is clicked. startGame is defined in app.js
	leaveRoomButton.on('click',{gameId: gameId},leaveRoom);
}

// Method to leave room and show the Start game button and existing games.
function leaveRoom(input){
	var gameDivId = 'game-room-' + input.data.gameId;

	$('#'+gameDivId).children().remove();

	// Removing the leaveRoom button
	$('#leave-room').children().remove();

	// Removing scores
	$('#game-scores').children().remove();

	//Showing Create a game button.
	$('#game-header').show();

	//Showing games that can be joined.
	$('#games').show();
}