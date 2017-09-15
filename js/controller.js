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
	    _dom,
	    _gameActive,
	    _gameOver;

	function Controller() {
		_board = new Board(_BOARD_WIDTH,
		                   _BOARD_HEIGHT,
		                   _SNAKE_START_SIZE,
		                   _SNAKE_START_DIRECTION);
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

	function _renderDOMBoard() {
		var domBoard = _dom[_BOARD_ID];
		domBoard.innerHTML = '';

		var headPositions = _board.getSnakeHeadEndPositions(2);
		var tailPositions = _board.getSnakeTailEndPositions(2);

		_dom.cells = [];
		for (var rowNum = 0; rowNum < _BOARD_HEIGHT; rowNum++) {
			var row = [];
			var domRow = document.createElement('div');
			domRow.className = _ROW_CLASS_NAME;
			for (var colNum = 0; colNum < _BOARD_WIDTH; colNum++) {
				var classString = _CELL_CLASS_NAME;
				var domCell = document.createElement('div');
				if (_board.hasCandyInCell(rowNum, colNum)) {
					classString += ' ' + _CANDY_CELL_CLASS_NAME;
				} else if (_board.hasSnakeInCell(rowNum, colNum)) {
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
			// TODO: Game over!
			_gameOver = true;
			_pauseGame();
			console.log('Game Over!');
		}
	}

	function _setDOMSnakeCell(pos) {
		var row = pos[0];
		var col = pos[1];
		var className = _CELL_CLASS_NAME + ' ' + _SNAKE_CELL_CLASS_NAME;
		_dom.cells[row][col].className = className;
		return className;
	}

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

	function _setDOMCandyCell(pos) {
		var row = pos[0];
		var col = pos[1];
		var className = _CELL_CLASS_NAME + ' ' + _CANDY_CELL_CLASS_NAME;
		_dom.cells[row][col].className = className;
	}

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
				_board.setSnakeDirection(_SNAKE_UP_DIRECTION);
			} else if (e.keyCode == _DOWN_KEY_CODE) {
				_board.setSnakeDirection(_SNAKE_DOWN_DIRECTION);
			} else if (e.keyCode == _LEFT_KEY_CODE) {
				_board.setSnakeDirection(_SNAKE_LEFT_DIRECTION);
			} else if (e.keyCode == _RIGHT_KEY_CODE) {
				_board.setSnakeDirection(_SNAKE_RIGHT_DIRECTION);
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
