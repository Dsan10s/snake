var Board = (function() {
	var _SNAKE_SYMBOL = 's';
	var _CANDY_SYMBOL = 'c';
	var _SYMBOLS = [_SNAKE_SYMBOL, _CANDY_SYMBOL];
	var _MIN_WIDTH = 5;
	var _MIN_HEIGHT = 5;
	var _MIN_SNAKE_START_SIZE = 3;

	var _width,
			_height,
			_snakeStartSize,
			_snakeStartDirection,
			_snake,
			_cells;

	// set for fast lookup, keys are "row,col" strings
	var _emptyCells = {};

	function Board(width, height, snakeStartSize, snakeStartDirection) {
		_width = width;
		_height = height;
		_snakeStartSize = snakeStartSize;
		_snakeStartDirection = snakeStartDirection;
		_cells = [];

		_checkWidthAndHeight();
		_checkSnakeStartSize();

		this.initializeStartState();
	}

	Board.prototype.getSnake = function() {
		return _snake;
	}

	/**
	 * Sets all cells in _cells to null
	 * Creates _cells if _cells is empty
	 */
	Board.prototype.emptyBoard = function() {
		_checkWidthAndHeight();

		_emptyCells = {};

		if (!_cells || _cells.length == 0) {
			// Initialize cells to empty state if not yet initialized
			for (var rowNum = 0; rowNum < _height; rowNum++) {
				var row = [];
				for (var colNum = 0; colNum < _width; colNum++) {
					row.push(null);
					_emptyCells[[rowNum, colNum]] = null;
				}
				_cells.push(row);
			}
		} else {
			// Set cells in existing board to null if exists
			for (var rowNum = 0; rowNum < _height; rowNum++) {
				for (var colNum = 0; colNum < _width; colNum++) {
					_cells[rowNum][colNum] = null;
					_emptyCells[[rowNum, colNum]] = null;
				}
			}
		}
	}

	/**
	 * Sets snake in center of board facing in _snakeStartDirection
	 * Places a candy randomly on the board
	 */
	Board.prototype.initializeStartState = function() {
		this.emptyBoard();

		var centerRow = Math.floor(_height / 2);
		var centerCol = Math.floor(_width / 2);
		var snakeHeadRow = centerRow - Math.floor(_snakeStartSize / 2);

		_snake = new Snake([snakeHeadRow, centerCol], _snakeStartSize, _snakeStartDirection);

		var positions = _snake.getPositions();

		_.each(positions, function(pos) {
			_setCell(pos, _SNAKE_SYMBOL);
		});

		var candyPosition = _getRandomEmptyPosition();
		_setCell(candyPosition, _CANDY_SYMBOL);
	}

	/**
	 * Based on the current state, calculates what will happen in the next frame
	 * and updates the model to match that frame
	 * @returns {object} newStateInfo with properties needed to update the DOM
	 */
	Board.prototype.updateState = function() {
		var direction = _snake.getDirection();
		var nextPosition = _snake.getNextPosition(direction);
		var newStateInfo = {};
		if (!_isInBounds(nextPosition)) {
			newStateInfo.validState = false;
		} else {
			var hasCandy = this.hasCandyInCell(nextPosition);
			newStateInfo = _snake.updateState(direction, hasCandy);

			// Set the new position as having a snake
			_setCell(nextPosition, _SNAKE_SYMBOL);

			// Clear the tail position if the snake did not grow
			if (newStateInfo.tailPositions.length == 3) {
				var oldTailPosition = newStateInfo.tailPositions[2];
				_clearCell(oldTailPosition);
			}

			// Set a new random empty cell as having a candy
			if (hasCandy) {
				var emptyPosition = _getRandomEmptyPosition();
				_setCell(emptyPosition, _CANDY_SYMBOL);
				newStateInfo.newCandyPosition = emptyPosition;
			}
		}

		return newStateInfo;
	}

	/**
	 * Checks if the cell specified by the given position has a candy or not
	 * @param {Array} [row, col] tuple of position to check for candy
	 */
	Board.prototype.hasCandyInCell = function(pos) {
		var row = pos[0];
		var col = pos[1];
		_checkBounds(pos);
		return _cells[row][col] == _CANDY_SYMBOL;
	}

	/**
	 * Checks if the cell specified by the given position has a snake or not
	 * @param {Array} pos [row, col] tuple of position to check for snake
	 */
	Board.prototype.hasSnakeInCell = function(pos) {
		var row = pos[0];
		var col = pos[1];
		_checkBounds(pos);
		return _cells[row][col] == _SNAKE_SYMBOL;
	}

	/**
	 * Sets a cell as as having whatever is represented by the given symbol
	 * @param {Array} pos [row, col] tuple of position of cell to set
	 * @param {string} symbol symbol that we would like to set in this cell
	 */
	function _setCell(pos, symbol) {
		var row = pos[0];
		var col = pos[1];
		_checkBounds(pos);
		_checkSymbol(symbol);
		_cells[row][col] = symbol;

		// Removes empty cell if exists
		delete _emptyCells[[row, col]];
	}

	/**
	 * Empties a cell in the board
	 * @param {Array} pos [row, col] tuple of position of cell to empty
	 */
	function _clearCell(pos) {
		var row = pos[0];
		var col = pos[1];
		_checkBounds(pos);
		_cells[row][col] = null;
		_emptyCells[[row, col]] = null;
	}

	/**
	 * Gets a random empty position
	 * @returns {Array} [row, col] tuple of a random empty position
	 */
	function _getRandomEmptyPosition() {
		var randomPositionString = _.sample(_.keys(_emptyCells));
		return _stringToNumberTuple(randomPositionString);
	}

	/**
	 * Converts a comma separated string into a tuple of numbers
	 * @param {string} positionString
	 * @returns {Array} [row, col] tuple of position corresponding
	 * to positionString
	 */
	function _stringToNumberTuple(positionString) {
		var numberTuple = positionString.split(',').map(function(coordString) {
			return Number(coordString);
		});

		return numberTuple;
	}

	/**
	 * Checks if a given position is in the bounds of the board
	 * @param {Array} pos [row, col] tuple of position to check
	 * @returns {boolean} if the given position is in the board
	 */
	function _isInBounds(pos) {
		var row = pos[0];
		var col = pos[1];
		return (row >= 0 && row < _height && col >= 0 && col < _width);
	}

	/**
	 * Throws an error if the _width and _height are smaller than their minimum
	 * allowed values
	 * minimum values
	 */
	function _checkWidthAndHeight() {
		if (_width < _MIN_WIDTH) {
			throw ('ERROR: board width is ' + _width +
					' and must be >= ' + _MIN_WIDTH);
		}
		if (_height < _MIN_HEIGHT) {
			throw ('ERROR: board height is ' + _height +
					' and must be >= ' + _MIN_HEIGHT);
		}
	}

	/**
	 * Throws an error if the given position is outside of the bounds of the board
	 * @param {Array} pos [row, col] tuple of position to check
	 */
	function _checkBounds(pos) {
		var row = pos[0];
		var col = pos[1];
		if (row < 0 || row >= _height) {
			throw 'ERROR: given row: ' + row + ' must be in the range [0, ' + _height + ')';
		}
		if (col < 0 || col >= _width) {
			throw 'ERROR: given col: ' + col + ' must be in the range [0, ' + _width + ')';
		}
	}

	/**
	 * Throws an error if the given symbol is invalid
	 * @param {string} symbol
	 */
	function _checkSymbol(symbol) {
		if (!_.contains(_SYMBOLS, symbol)) {
			throw 'ERROR: given symbol: ' + symbol + ' must be in ' + _SYMBOLS;
		}
	}

	/**
	 * Throws an error if the snakeStartSize is smaller than its minimum allowed
	 * value
	 */
	function _checkSnakeStartSize() {
		if (_snakeStartSize < _MIN_SNAKE_START_SIZE) {
			throw ('ERROR: given snake starting size of ' + _snakeStartSize + 
					' must be >= ' + _MIN_SNAKE_START_SIZE);
		}
	}

	return Board;
})();
