var Controller = (function() {
	var _BOARD_WIDTH = 40;
	var _BOARD_HEIGHT = 40;
	var _SNAKE_START_SIZE = 5;
	var _SNAKE_UP_DIRECTION = 'u';
	var _SNAKE_DOWN_DIRECTION = 'd';
	var _SNAKE_LEFT_DIRECTION = 'l';
	var _SNAKE_RIGHT_DIRECTION = 'r';
	var _SNAKE_START_DIRECTION = _SNAKE_UP_DIRECTION;
	var _BOARD_ID = 'board';
	var _MESSAGE_CONTAINER_ID = 'messageContainer';
	var _MAIN_MESSAGE_ID = 'mainMessage';
	var _MESSAGE_DETAILS_ID = 'messageDetails';
	var _DOM_IDS = [
	    _BOARD_ID,
			_MESSAGE_CONTAINER_ID,
			_MAIN_MESSAGE_ID,
			_MESSAGE_DETAILS_ID
	];

	var _PAUSE_MESSAGE = 'Game Paused';
	var _PAUSE_DETAILS = 'Press the spacebar to resume the game';

	var _GAME_OVER_MESSAGE = 'Game Over!';
	var _GAME_OVER_DETAILS = 'Press the spacebar to restart!';

	var _RESTART_MESSAGE = 'Ready?';
	var _RESTART_DETAILS = 'Press the spacebar to begin!';

	var _ROW_CLASS_NAME = 'row';
	var _CELL_CLASS_NAME = 'cell';
	var _SNAKE_CELL_CLASS_NAME = 'snake';
	var _CANDY_CELL_CLASS_NAME = 'candy';

	var _CSS_UP = 'up';
	var _CSS_DOWN = 'down';
	var _CSS_LEFT = 'left';
	var _CSS_RIGHT = 'right';

	// Maps a direction to its opposite
	var _CSS_DIRECTIONS = {};
	_CSS_DIRECTIONS[_CSS_UP] = _CSS_DOWN;
	_CSS_DIRECTIONS[_CSS_DOWN] = _CSS_UP;
	_CSS_DIRECTIONS[_CSS_LEFT] = _CSS_RIGHT;
	_CSS_DIRECTIONS[_CSS_RIGHT] = _CSS_LEFT;

	var _CSS_UPLEFT = 'upleft';
	var _CSS_UPRIGHT = 'upright';
	var _CSS_DOWNLEFT = 'downleft';
	var _CSS_DOWNRIGHT = 'downright';

	var _FRAME_SPEED = 66;
	var _UP_KEY_CODE = 38;
	var _DOWN_KEY_CODE = 40;
	var _LEFT_KEY_CODE = 37;
	var _RIGHT_KEY_CODE = 39;
	var _SPACE_KEY_CODE = 32;

	var _board,
	    _snake,
	    _dom,
	    _gameActive,
	    _gameOver;

	function Controller() {
		_board = new Board(_BOARD_WIDTH,
		                   _BOARD_HEIGHT,
		                   _SNAKE_START_SIZE,
		                   _SNAKE_START_DIRECTION);
		_snake = _board.getSnake();
		_dom = {}
		_gameActive = false;
		_gameOver = false;

		// Retrieves dom elements once and populates in _dom for quick access
		_getDomElements();

		_renderDOMBoard();
		_showMessageBoard();
		_addEventListeners();
	};

	/**
	 * Unpauses game if game is paused
	 * Restarts game if game is over
	 */
	function _startGame() {
		if (!_gameOver) {
			if (!_gameActive) {
				_hideMessageBoard();
				_gameActive = true;
				_frameInterval = setInterval(function() {
					var stateInfo = _board.updateState();
					_updateDOMBoard(stateInfo);
				}, _FRAME_SPEED);
			}
		} else {
			_gameOver = false;
			_board.initializeStartState();
			_renderDOMBoard();

			_setMainMessage(_RESTART_MESSAGE);
			_setMessageDetails(_RESTART_DETAILS);
		}
	}

	/**
	 * Clears the frame interval for playing the game, effectively pausing it
	 */
	function _pauseGame() {
		if (_gameActive) {
			if (_frameInterval) {
				_setMainMessage(_PAUSE_MESSAGE);
				_setMessageDetails(_PAUSE_DETAILS);
				_showMessageBoard();
				window.clearInterval(_frameInterval);
				if (_gameOver) {
					_setMainMessage(_GAME_OVER_MESSAGE);
					_setMessageDetails(_GAME_OVER_DETAILS);
					_showMessageBoard();
				}
			} else {
				throw ('ERROR: Implementation error, _frameInterval' +
						'should be defined if game is active');
			}
			_gameActive = false;
		}
	}

	/**
	 * Goes the every id in _DOM_IDS, and maps the id to the element corresponding
	 * to that id in _dom
	 */
	function _getDomElements() {
		_.each(_DOM_IDS, function(domId) {
			var element = document.getElementById(domId);
			if (element) {
				_dom[domId] = element;
			} else {
				throw 'ERROR: element with id ' + domId + ' does not exist';
			}
		});
	}

	/**
	 * Renders the board model stored in the _board instance into the DOM
	 */
	function _renderDOMBoard() {
		var domBoard = _dom[_BOARD_ID];
		domBoard.innerHTML = '';

		var headPositions = _snake.getHeadEndPositions(2);
		var tailPositions = _snake.getTailEndPositions(2);

		_dom.cells = [];
		for (var rowNum = 0; rowNum < _BOARD_HEIGHT; rowNum++) {
			var row = [];
			var domRow = document.createElement('div');
			domRow.className = _ROW_CLASS_NAME;
			for (var colNum = 0; colNum < _BOARD_WIDTH; colNum++) {
				var classString = _CELL_CLASS_NAME;
				var domCell = document.createElement('div');
				if (_board.hasCandyInCell([rowNum, colNum])) {
					classString += ' ' + _CANDY_CELL_CLASS_NAME;
				} else if (_board.hasSnakeInCell([rowNum, colNum])) {
					classString += ' ' + _SNAKE_CELL_CLASS_NAME;
				}
				domCell.className = classString;
				row.push(domCell);
				domRow.append(domCell);
			}
			_dom.cells.push(row);
			domBoard.append(domRow);
		}

		_setDOMSnakeEndCell(headPositions[0], headPositions[1]);
		_setDOMSnakeEndCell(tailPositions[1], tailPositions[0]);
	}

	/**
	 * Based on the passed new state information, updates the DOM board to match
	 * this new state
	 * @param {object} stateInfo information about parts of the state that have
	 * changed since the last state
	 */
	function _updateDOMBoard(stateInfo) {
		if (stateInfo.validState) {

			// [head, second cell, third cell]
			var headPositions = stateInfo.headPositions;

			// [second to last, tail, oldTail]
			var tailPositions = stateInfo.tailPositions;

			var newCandyPosition = stateInfo.newCandyPosition;

			_setDOMSnakeBodyCell(headPositions[0], headPositions[1], headPositions[2]);

			_setDOMSnakeEndCell(headPositions[0], headPositions[1]);

			if (tailPositions.length == 3) {
				var oldTailPosition = tailPositions[2];
				_clearDOMCell(tailPositions[2]);
				_setDOMSnakeEndCell(tailPositions[1], tailPositions[0]);
			}

			if (newCandyPosition) {
				_setDOMCandyCell(newCandyPosition);
			}
		} else {
			_gameOver = true;
			_pauseGame();
		}
	}

	/**
	 * Sets the cell in the DOM corresponding to the passed position to represent
	 * having a snake in that cell
	 * @param {Array} pos array with x and y coordinates of position to set
	 */
	function _setDOMSnakeCell(pos) {
		var row = pos[0];
		var col = pos[1];
		var className = _CELL_CLASS_NAME + ' ' + _SNAKE_CELL_CLASS_NAME;
		_dom.cells[row][col].className = className;
		return className;
	}

	/**
	 * Sets the cell in the DOM corresponding to the passed position to represent
	 * having a portion of the snake body (not head or tail) in that cell.
	 * Determines whether to round the corner of the body based on the previous
	 * and next positions of the cells in the snake
	 * @param {Array} nextPos array with x and y coordinates of position of next
	 * cell of the snake after the one we are looking to set
	 * @param {Array} pos array with x and y coordinates of position to set
	 * @param {Array} prevPos array with x and y coordinates of position of
	 * previous cell of the snake before the one we are looking to set
	 */
	function _setDOMSnakeBodyCell(nextPos, pos, prevPos) {
		var className = _setDOMSnakeCell(pos);
		var firstDirection = _getDirectionFromPosition(nextPos, pos);
		var secondDirection = _getDirectionFromPosition(prevPos, pos);
		var cssDirections = [firstDirection, secondDirection];
	
		var isStraightLine = _CSS_DIRECTIONS[firstDirection] == secondDirection;

		if (!isStraightLine) {
			className += ' ';
			className += _.contains(cssDirections, _CSS_UP) ? _CSS_UP : '';
			className += _.contains(cssDirections, _CSS_DOWN) ? _CSS_DOWN : '';
			className += _.contains(cssDirections, _CSS_LEFT) ? _CSS_LEFT : '';
			className += _.contains(cssDirections, _CSS_RIGHT) ? _CSS_RIGHT : '';
		}

		var row = pos[0];
		var col = pos[1];

		_dom.cells[row][col].className = className;
	}

	/**
	 * Sets the cell in the DOM corresponding to the passed position to represent
	 * having a snake end (head or tail) in that cell
	 * @param {Array} endPos array with x and y coordinates of position of end to set
	 * @param {Array} prevPos array with x and y coordinates of position of snake
	 * cell right next to the end cell (2nd cell if head, 2nd to last if tail)
	 */
	function _setDOMSnakeEndCell(endPos, prevPos) {
		var row = endPos[0];
		var col = endPos[1];
		var cssDirection = _getDirectionFromPosition(prevPos, endPos);

		var className = _setDOMSnakeCell(endPos);
		if (_.contains(_CSS_DIRECTIONS, cssDirection)) {
			className += ' ' + cssDirection;
		}
		_dom.cells[row][col].className = className;
	}

	/**
	 * Given a base position and an other position, returns the direction of the
	 * other position relative to the base position
	 * @param {Array} basePos array with x and y coordinates of position we'd like
	 * to base the direction off of
	 * @param {Array} otherPos array with x and y coordinates of position we'd
	 * like to calculate direction relative to basePos
	 * @returns {string} direction of otherPos from basePos
	 */
	function _getDirectionFromPosition(basePos, otherPos) {
		var baseRow = basePos[0];
		var baseCol = basePos[1];
		var otherRow = otherPos[0];
		var otherCol = otherPos[1];

	if (otherRow == baseRow-1) {
			return _CSS_UP;
		} else if (otherRow == baseRow+1) {
			return _CSS_DOWN;
		} else if (otherCol == baseCol-1) {
			return _CSS_LEFT;
		} else if (otherCol == baseCol+1) {
			return _CSS_RIGHT;
		} else {
			throw 'ERROR: The corresponding positions are not next to each other';
		}
	}

	/**
	 * Given a position, sets that position in the DOM board as having a candy
	 * @param {Array} pos array with x and y coordinates of position of candy
	 */
	function _setDOMCandyCell(pos) {
		var row = pos[0];
		var col = pos[1];
		var className = _CELL_CLASS_NAME + ' ' + _CANDY_CELL_CLASS_NAME;
		_dom.cells[row][col].className = className;
	}

	/**
	 * Given a position, sets that position in the DOM board as being an empty
	 * cell (no snake or candy)
	 * @param {Array} pos array with x and y coordinates of position of cell to
	 * clear
	 */
	function _clearDOMCell(pos) {
		var row = pos[0];
		var col = pos[1];
		var className = _CELL_CLASS_NAME;
		_dom.cells[row][col].className = className;
	}

	function _showMessageBoard() {
		_dom[_MESSAGE_CONTAINER_ID].style.opacity = 1;
	}

	function _hideMessageBoard() {
		_dom[_MESSAGE_CONTAINER_ID].style.opacity = 0;
	}

	function _setMainMessage(mainMessage) {
		_dom[_MAIN_MESSAGE_ID].innerText = mainMessage;
	}

	function _setMessageDetails(messageDetails) {
		_dom[_MESSAGE_DETAILS_ID].innerText = messageDetails;
	}

	function _addEventListeners() {
		document.addEventListener('keydown', function(e) {
			if (e.keyCode == _UP_KEY_CODE) {
				_snake.setNextDirection(_SNAKE_UP_DIRECTION);
			} else if (e.keyCode == _DOWN_KEY_CODE) {
				_snake.setNextDirection(_SNAKE_DOWN_DIRECTION);
			} else if (e.keyCode == _LEFT_KEY_CODE) {
				_snake.setNextDirection(_SNAKE_LEFT_DIRECTION);
			} else if (e.keyCode == _RIGHT_KEY_CODE) {
				_snake.setNextDirection(_SNAKE_RIGHT_DIRECTION);
			} else if (e.keyCode == _SPACE_KEY_CODE) {
				if (!_gameActive) {
					_startGame();
				} else {
					_pauseGame();
				}
			}
		});
	}

	return Controller;
})();
