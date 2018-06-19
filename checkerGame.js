

var board = [[1,2,1,2,1,2],   // 1 means human player's pieces, -1 means computer player's pieces, 
[2,1,2,1,2,1],                // 0 means empty places, 2 means squares can never be reached to or selected
[0,2,0,2,0,2],                // white represents 0 , red represents 1, blue represents -1, black represents 2
[2,0,2,0,2,0],
[-1,2,-1,2,-1,2],              
[2,-1,2,-1,2,-1],
]; 
  // later i will set red king as 1.1, and blue kind as -1.1
var hardLevel = -1; // defaut hardlevel is the easist level
var square = document.querySelectorAll("div");
var square_s = pop(square);
var squares = pop(square_s);
var message = document.getElementById("colorDisplay");
var myTurn = true;  // check whether it is a humman 's turn
var pieceToggled = false; //  check whether 
var selected = null;    // select a piece to move
var INFINITY = 10000;
var NEG_INFINITY = -10000;
var resetButton = document.querySelector("#reset");
var modeButtons = document.querySelectorAll(".mode");
var twoJumps = false;
var humanFirstBtn = document.querySelector("#humanFirst");
var humanFirst = true;   // default it is human go first

humanFirstBtn.addEventListener("click",function(){
       this.classList.toggle("selected");
       humanFirst = !humanFirst;
       reset();
});

function setupModeButtons(){
  for(var i = 0; i < modeButtons.length; i++){
    modeButtons[i].addEventListener("click", function(){
      modeButtons[0].classList.remove("selected");
      modeButtons[1].classList.remove("selected");
      modeButtons[2].classList.remove("selected");
      this.classList.add("selected");
      if(this.textContent === "Easy"){
        hardLevel = -1;     // computer select next move randomly
      }else if(this.textContent === "Medium"){
        hardLevel = 2;     // two levels search
      }else if(this.textContent === "Hard"){
        hardLevel = 8;     // eight levels search
      }
      
      reset();
    });
  }
}


function setupClicks(){
  for (var i = 0; i <6; i++) {
  for (var j= 0; j< 6; j++) {
      squares[i*6+j].addEventListener("click", function(){
      var a = parseInt(this.id.split("-")[0]);
      var b = parseInt(this.id.split("-")[1]);
        clicked(a,b);

      });

   }
  }
}
setupClicks();
setupModeButtons();


resetButton.addEventListener("click", function(){   // new game button
  reset();
});

message.textContent = "It is your turn!";
initiate();

function reset(){
  initiate();
}


function pop(list){
	var s = [];
	for(var i =1;i< list.length;i++){
     s[i-1] = list[i];
	}
	return s;
}

function possibleMoves(i, j){     // return a list containing the legal moves, and change the movable squares' color to orange
	var validMoves = new Array();
      for (var m = 0; m < 6; m++) {
  	for (var n = 0; n < 6; n++) {
        if(board[m][n]===0){
        		
        	if(((m-i)===1) && (Math.abs(n-j) ===1)){
            squares[m*6+n].classList.remove("white");
        		squares[m*6+n].classList.add("orange");

        		validMoves.push(coord(m,n));
        		// squares[m*6+n].classList.remove("white");
          //      squares[m*6+n].classList.add("orange");
        	}
        	if((m-i)===2 && (Math.abs(n-j) ===2) && board[(m+i)/2][(j+n)/2] === -1){
            squares[m*6+n].classList.remove("white");
        		squares[m*6+n].classList.add("orange");
        		validMoves.push(coord(m,n));
        	}
        }

    }

  }
  return validMoves;
}

function removeAllOrange(){   // after selected a square to move, reset all the orange squares' color to white
	var oranges = document.querySelectorAll(".orange");
	for(var i = 0 ; i<oranges.length;i++){
		oranges[i].classList.remove("orange");
    oranges[i].classList.add("white");
	}
}
function Coord(x,y) {
 this.x = x;
 this.y = y;
}
function coord(x,y) {
 c = new Coord(x,y);
 return c;
}

function clicked(i, j){   // main function for human's actions
  if (myTurn) {
  if ((board[i][j])==1) toggle(i,j);  // choose an red square to move to another place
  else if (board[i][j]==0 && pieceToggled)   // move to other empty place
  	{  
       
  		if (squares[6*i+j].classList.contains("orange")){   // make sure selected an orange, target place

          pieceToggled = false;
          myTurn = false;
          
  		    move_human(selected,coord(i,j));
          removeAllOrange();
          //if(twoJumps) jumpAvailable(selected.x,selected.y);  // no consecutive jumps allowed
  		  updateKings();
  		  if(getWinner(board)== 1){
  		  	message.textContent = "You Win!";
  		    return;
  		  }
          if(!myTurn){    
          	computer();    // let computer to move the pieces
          }
          
                                                      // computer move 
        }else {
        	message.textContent = "Please choose an orange square to move";
        }

  	}
  else message.textContent="First click one of your red pieces, then click where you want to move it";
 } else {
  if(message.textContent === "You Lost!" ||  message.textContent === "You Win!" ||  message.textContent === "Draw!"){
    return;
  }
 	message.textContent = "It's not your turn yet. Hang on a sec!"
 //message("It's not your turn yet. Hang on a sec!");
 }
	
}

function jumpAvailable(i ,j){    // useless function if no consecutive jumps allowed
	var moves = new Array();
	if(i+2<6){
	    	if((j+2<6)&&board[i+1][j+1] == -1 && board[i+2][j+2]==0){
          squares[(i+2)*6+j+2].classList.remove("white");
	    		squares[(i+2)*6+j+2].classList.add("orange");
	    		moves.push(coord(i+2,j+2));
	    	}
	    	if((j-2>=0)&&board[i+1][j-1] == -1 && board[i+2][j-2]==0){
          squares[(i+2)*6+j-2].classList.remove("white");
	    		squares[(i+2)*6+j-2].classList.add("orange");
	    		moves.push(coord(i+2,j-2));
	    	}
	    }

	return moves;
}
function move_human(from, to){    // after toggled a piece, move the piece from one square to the target place, including jump move
	     //twoJumps = false;
    if((to.x - from.x )==2) {  // jump move 
    	var a = (from.x+to.x)/2;
    	var b = (from.y+to.y)/2;
    	board[a][b] = 0;
    	squares[6*a+b].classList.remove("blue");
	    squares[6*a+b].classList.add("white");
	    // if(jumpAvailable(to.x,to.y).length>0){   // no consecutive jumps allowed
	    // 	pieceToggled = true;
     //        myTurn = true;
     //        selected = to;
     //        twoJumps = true;
	    // }

    }
    	board[from.x][from.y] = 0;  // change the board value
	    board[to.x][to.y] = 1;
	    squares[6*from.x+from.y].classList.remove("red");    // change the color of squares
	    squares[6*from.x+from.y].classList.add("white");
	    squares[6*to.x+to.y].classList.remove("orange");
	    squares[6*to.x+to.y].classList.add("red");
    

}

function toggle(x,y){  // only can select a movable piece
	if (myTurn) {
    if (pieceToggled)
  	 removeAllOrange();
 
    if(possibleMoves(x,y).length>0) 
       {
     		message.textContent = "Please choose an orange square to move";
     		pieceToggled = true;
            selected = coord(x,y);
       }
     else message.textContent = "Please choose another piece to move !";
     
  
 }
}

function initiate(){
     board = [[1,2,1,2,1,2],
         [2,1,2,1,2,1],
         [0,2,0,2,0,2],
         [2,0,2,0,2,0],
         [-1,2,-1,2,-1,2],
         [2,-1,2,-1,2,-1],
        ];
         myTurn = true;  // check whether it is a humman 's turn
        pieceToggled = false; //  check whether 
        selected = null;    // select a piece to move
     if(!humanFirst){
        myTurn = false;
      computer();
     }
   
   


    message.textContent = "It is your turn!";

for (var i = 0; i <6; i++) {
	for (var j= 0; j< 6; j++) {
    var oldClassName = squares[i*6+j].getAttribute("class");
		switch (board[i][j]){
			case 1 :     
			
			squares[i*6+j].classList.remove(oldClassName);
			squares[i*6+j].classList.add("red");
			
			break;
			case 0 : 

			squares[i*6+j].classList.remove(oldClassName);
			squares[i*6+j].classList.add("white");
			
			break;
			case 2 : 
			squares[i*6+j].classList.remove(oldClassName);
			squares[i*6+j].classList.add("black");
			
			break;
			case -1 : 
			squares[i*6+j].classList.remove(oldClassName);
			squares[i*6+j].classList.add("blue");
			
			break;

		}
	}
	
}
}
function getPieceCount(boardState) {  // count red, and blue piece number 
	var numRed = 0;
	var numBlack = 0;
	
	for (var i=0;i<6;i++) {
		for (var j= 0; j < 6; j++) {
			if(boardState[i][j] == 1 || boardState[i][j]== 1.1) numRed +=1;
			else if (boardState[i][j] == -1 || boardState[i][j]== -1.1) numBlack +=1;
		}
		
	}
	

	return {red: numRed, black: numBlack};
}

function getWinner(boardState) {    // check who is the winner
	var pieceCount = getPieceCount(boardState);
	if (pieceCount.red > 0  && pieceCount.black === 0) {
		return 1;
	}
	else if (pieceCount.black > 0 && pieceCount.red === 0) {
		return -1;
	}
	else return 0;
}

function updateKings(){  // set buleKing to -1.1, and set redKing to 1.1
	for (var i = 0; i< 6 ; i++){
		if(board[0][i]==-1){
			board[0][i]= -1.1;
		}
		if(board[5][i]==1){
			board[5][i] = 1.1;
		}
	}
}

/*  computer player part*/




function copyBoard(oldBoard){   // copy a board
	var newBoard = [];
	for (var i = 0; i < 6; i++) {
		 newBoard.push([0]);
		for (var j = 0; j < 6 ;j++) {
			newBoard[i][j] = oldBoard[i][j];
		}
	}
	return newBoard;
}
function get_player_pieces(player, target_board) {  // find movable pieces for human player or computer player
	player_pieces = new Array();
	for (var i=0;i<6;i++){
		for (var j = 0; j < 6; j++) {
			if(target_board[i][j] == player){
				player_pieces.push(coord(i,j));
			}
		}
	}
	return player_pieces;
}
function get_available_piece_moves(target_board, target_piece, player) {
    var moves = [];
    var from = target_piece;

	// check for moves
	if(player == 1){    // red , human player
		if(from.x+1<6){
          if((from.y+1)<6 && target_board[from.x+1][from.y+1] == 0){  // move to right
          	move = {move_type: 'slide', piece: player, from: from, to:coord(from.x+1,from.y+1)};
          	moves[moves.length] = move;

          }
          if((from.y-1)>=0 && target_board[from.x+1][from.y-1] == 0){   // left move
          	move = {move_type: 'slide', piece: player, from: from, to:coord(from.x+1,from.y-1)} ;
          	moves[moves.length] = move;
          }
          if(from.x+2<6){   // check form jumps 
          	if((from.y+2)<6 && target_board[from.x+2][from.y+2] == 0 && target_board[from.x+1][from.y+1]==-1){  // right jump
             move = {move_type: 'jump', piece: player, from: from, to:coord(from.x+2,from.y+2)} ;
          	 moves[moves.length] = move;
          	}
          	if((from.y-2)>=0 && target_board[from.x+2][from.y-2] == 0 && target_board[from.x+1][from.y-1]==-1){ // left jump
             move = {move_type: 'jump', piece: player, from: from, to:coord(from.x+2,from.y-2) };
          	 moves[moves.length] = move;
          	}
          
         }
	   }
	}else{  // blue, computer player
		if(from.x-1>=0){
          if((from.y+1)<6 && target_board[from.x-1][from.y+1] == 0){ // right move
          	move = {move_type: 'slide', piece: player, from: from, to:coord(from.x-1,from.y+1)} ;
          	moves[moves.length] = move;
          }
          if((from.y-1)>=0 && target_board[from.x-1][from.y-1] == 0){ // left move 
          	move = {move_type: 'slide', piece: player, from: from, to:coord(from.x-1,from.y-1)} ;
          	moves[moves.length] = move;
          }
            if(from.x-2>=0){  // check form jumps
              if((from.y+2)<6 && target_board[from.x-2][from.y+2] == 0 && target_board[from.x-1][from.y+1]==1){  // right jump
               move = {move_type: 'jump', piece: player, from: from, to:coord(from.x-2,from.y+2)} ;
          	   moves[moves.length] = move;	
               }
               if((from.y-2)>=0 && target_board[from.x-2][from.y-2] == 0 && target_board[from.x-1][from.y-1]==1){  // left jump
               move = {move_type: 'jump', piece: player, from: from, to:coord(from.x-2,from.y-2)} ;
          	   moves[moves.length] = move;	
               }
            }
		}

	}

	return moves;

}

function get_available_moves(player, target_board) {

    var moves = [];
    var move = null;
    var player_pieces = get_player_pieces(player, target_board);

    for (var i=0;i<player_pieces.length;i++) {
    	var from = player_pieces[i];
    	var piece_moves = get_available_piece_moves(target_board, from, player);
    	moves.push.apply(moves, piece_moves);
    }

    // prune non-jumps, if applicable every opportunity to jump must be taken
    var jump_moves = [];
    for (var i=0; i<moves.length;i++) {
        var move = moves[i];
        if (move.move_type == "jump") {
            jump_moves.push(move);
        }
    }
    if (jump_moves.length > 0){
        moves = jump_moves;
    }

    return moves;
}

function select_random_move(moves){
    // Randomly select move
    var index = Math.floor(Math.random() * (moves.length - 1));
    var selected_move = moves[index];

    return selected_move;
}

function alpha_beta_search(calc_board, limit) {
    var alpha = NEG_INFINITY;
    var beta = INFINITY;

    //get available moves for computer
    var available_moves = get_available_moves(-1, calc_board);
    console.log(available_moves);   // the move computer selected
    //get max value for each available move
    var best_moves = [];
    var max_move = null;
    if(limit == -1){
      best_moves = available_moves;
    }else {
        var max = max_value(calc_board,available_moves,limit,alpha,beta);
    
       console.log(max);
    //find all moves that have max-value
    
       for(var i=0;i<available_moves.length;i++){
         var next_move = available_moves[i];
         if (next_move.score == max){
            max_move = next_move;
            best_moves.push(next_move);
        }
      }
    }
    //randomize selection, if multiple moves have same max-value
    if (best_moves.length >= 1){
        max_move = select_random_move(best_moves);
    }

    return max_move;   // the value represent the possibility of the computer to win this game, negative number means lose, positive means win
}

function updateBoard( move){    // just for changing the squares' color, used in computer move
	var from = move.from;
    var to   = move.to;

   	squares[6*from.x+from.y].classList.remove("blue");
   	squares[6*from.x+from.y].classList.add("white");

    squares[6*to.x+to.y].classList.remove("white");   
   	squares[6*to.x+to.y].classList.add("blue");
   if(move.move_type == "jump"){
   	   var x = (from.x + to.x)/2;
   	   var y = (to.y + from.y)/2;
   	   squares[6*x+y].classList.remove("red");
   	   squares[6*x+y].classList.add("white");
   }
}

function computer(){   // computer player function

	var simulated_board = copyBoard(board);

    // Run algorithm to select next move
    var selected_move = alpha_beta_search(simulated_board, hardLevel);  // now limit is 8 
   
    console.log(selected_move);
	  if(selected_move == null){                          // no more moves for computer
      if(get_available_moves(1,board).length<=0){      // both of human and computer have no moves
        if(getPieceCount(board).red > getPieceCount(board).black) 
          {
            message.textContent =  "You Win!";
            return;
          }
        else if (getPieceCount(board).red < getPieceCount(board).black) {
          message.textContent =  "You Lost!";
          return;
        }
          else {
              message.textContent = "Draw!";
              return;
            }
      }
      myTurn = true;                 //  game is not over, and let human to make next move
      pieceToggled = false;
      return;
    }
    movePiece(board,selected_move);    // computer player makes a move
    updateBoard(selected_move);
    updateKings();

	var winner = getWinner(board);  //  check if end the game
	if (winner == -1) {
		message.textContent = "You Lost!";
    return;
	}
	else {
    if(get_available_moves(1,board).length<=0){
      computer();
    }else 
		{     // Set turn back to human
		   myTurn = true;
		   pieceToggled = false;
    }
	}
    console.log("computer move");      // computer has completed its move
}

function jump_available(available_moves) {  // check if there is any jump move available for the computer 
    var jump = false;
    for (var i=0;i<available_moves.length;i++){
        var move = available_moves[i];
        if (move.move_type == "jump") {
            jump = true;
            break;
        }
    }

    return jump;
}

function movePiece(simulated_board, move){
	if(move.move_type == "slide"){  // slide movement 
		var temp = simulated_board[move.from.x][move.from.y];
		simulated_board[move.from.x][move.from.y] = simulated_board[move.to.x][move.to.y];
		simulated_board[move.to.x][move.to.y] = temp;
	}else {   // jump movement
       var from = move.from;
       var to = move.to;
       var temp = simulated_board[move.from.x][move.from.y];
		simulated_board[move.from.x][move.from.y] = simulated_board[move.to.x][move.to.y];
		simulated_board[move.to.x][move.to.y] = temp;
		simulated_board[(from.x+to.x)/2][(from.y+to.y)/2]= 0;
	}
	return simulated_board;
}



function min_value(calc_board, human_moves, limit, alpha, beta) {

    if (limit <=0 && !jump_available(human_moves)) {
    	
        return utility(calc_board);
    }
    var min = INFINITY;
    var simulated_board = null;
    //for each move, get min
    if (human_moves.length > 0){
        for (var i=0;i<human_moves.length;i++){
            simulated_board = copyBoard(calc_board);

            //move human piece
            var human_move = human_moves[i];
			// var pieceIndex = getPieceIndex(simulated_board.pieces, human_move.from.row, human_move.from.col);
			// var piece = simulated_board.pieces[pieceIndex];
            simulated_board = movePiece(simulated_board, human_move);
            // make human's move 
            //get available moves for computer
            var computer_moves = get_available_moves(-1, simulated_board);

            //get max value for this move
            var max_score = max_value(simulated_board, computer_moves, limit-1, alpha, beta);

            //compare to min and update, if necessary
            if (max_score < min) {
                min = max_score;
            }
            human_moves[i].score = min;
            if (min <= alpha) {
                break;
            }
            if (min < beta) {
                beta = min;
            }
        }
    }
    else {
        if(getWinner(calc_board)!= 0){
        if (getWinner(calc_board)==1){
        	
             return -100000;
           }else
           {
           	
           	return 100000;
           } 
       }
        //log("NO MORE MOVES FOR MIN: l=" + limit);
    }
    
    return min;
}

function max_value(calc_board, computer_moves, limit, alpha, beta) {
    if (limit <= 0 && !jump_available(computer_moves)) {
    	
        return utility(calc_board);
    }
    var max = NEG_INFINITY;

    //for each move, get max
    if (computer_moves.length > 0){
        for (var i=0;i<computer_moves.length;i++){
            simulated_board = copyBoard(calc_board);

            //move computer piece
            var computer_move = computer_moves[i];
			// var pieceIndex = getPieceIndex(simulated_board.pieces, computer_move.from.row, computer_move.from.col);
			// var piece = simulated_board.pieces[pieceIndex];
            simulated_board = movePiece(simulated_board, computer_move);
           // computer move action
            //get available moves for human
            var human_moves = get_available_moves(1, simulated_board);

            //get min value for this move
            var min_score = min_value(simulated_board, human_moves, limit-1, alpha, beta);
            computer_moves[i].score = min_score;

            //compare to min and update, if necessary
            if (min_score > max) {
                max = min_score;
            }
            if (max >= beta) {
                break;
            }
            if (max > alpha) {
                alpha = max;
            }
        }
    }
    else {
      if(getWinner(calc_board)!= 0){
        if (getWinner(calc_board)==1){
        	
             return -100000;
           }else {
           	
           	return 100000;
           }
       }
        //log("NO MORE MOVES FOR MAX: l=" + limit);
      
    }
    
    return max;

}

function evaluate_position(x , y, player) {
    if(player == 1){   // human
      return y+1;
    }else {     // computer 
    	return 6-y;
    }
}

function utility(target_board) {
    var sum = 0;
    var computer_pieces = 0;
    var computer_kings = 0;
    var human_pieces = 0;
    var human_kings = 0;
    var computer_pos_sum = 0;
    var human_pos_sum = 0;

    //log("************* UTILITY *****************")
  


    for (var i = 0; i < 6; i++) {
    	for (var j = 0; j < 6; j++) {
    		if((target_board[i][j]!=0)&& (target_board[i][j]!=2)){ // only count human , and computer's pieces
    			if(target_board[i][j]>0){  // human 
    				human_pieces +=1;
    				if(target_board[i][j]==1.1){
    					human_kings +=1;
    				}
    				var human_pos = evaluate_position(i,j,1);
    				human_pos_sum += human_pos;
    			}else {             // computer pieces
                     computer_pieces += 1;
	                if (target_board[i][j] === -1.1){
	                  computer_kings += 1;
	                 }
	                 var computer_pos = evaluate_position(i, j,-1);
	                computer_pos_sum += computer_pos;
    			}

    		}
    	}
    }

    var piece_difference = computer_pieces - human_pieces;
    var king_difference = computer_kings - human_kings;
    if (human_pieces === 0){
        human_pieces = 0.00001;
    }
    var avg_human_pos = human_pos_sum / human_pieces;
    if (computer_pieces === 0) {
        computer_pieces = 0.00001;
    }
    var avg_computer_pos = computer_pos_sum / computer_pieces;
    var avg_pos_diff = avg_computer_pos - avg_human_pos;

    var features = [piece_difference, king_difference, avg_pos_diff];
    var weights = [100, 10, 1];

    var board_utility = 0;

    for (var f=0; f<features.length; f++){
        var fw = features[f] * weights[f];
        board_utility += fw;
    }

    //log("utility=" + board_utility);
    //log("************* END  UTILITY ************")

    return board_utility;
}

