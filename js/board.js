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

	// obj for fast lookup, keys are [row, val] tuples (arrays)
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
	 * Sets snake in center of board facing upwards
	 * Places a candy randomly on the board
	 */
	Board.prototype.initializeStartState = function() {
		this.emptyBoard();

		var centerRow = Math.floor(_height / 2);
		var centerCol = Math.floor(_width / 2);
		var snakeHeadRow = centerRow - Math.floor(_snakeStartSize / 2);

		_snake = new Snake(snakeHeadRow, centerCol, _snakeStartSize, _snakeStartDirection);

		var positions = _.keys(_snake.getPositions()).map(_stringToNumberTuple);

		_.each(positions, function(pos) {
			_setCell(pos[0], pos[1], _SNAKE_SYMBOL);
		});

		var candyPosition = _getRandomEmptyPosition();
		_setCell(candyPosition[0], candyPosition[1], _CANDY_SYMBOL);
	}

	Board.prototype.updateState = function() {
		var direction = _snake.getDirection();
		var nextPosition = _snake.getNextPosition(direction);
		var newStateInfo = {};
		if (!_isInBounds(nextPosition[0], nextPosition[1])) {
			newStateInfo.validState = false;
		} else {
			var hasCandy = this.hasCandyInCell(nextPosition[0], nextPosition[1]);
			newStateInfo = _snake.updateState(direction, hasCandy);

			// Set the new position as having a snake
			_setCell(nextPosition[0], nextPosition[1], _SNAKE_SYMBOL);

			// Clear the tail position if the snake did not grow
			if (newStateInfo.tailPositions.length == 3) {
				var oldTailPosition = newStateInfo.tailPositions[2];
				_clearCell(oldTailPosition[0], oldTailPosition[1]);
			}

			// Set a new random empty cell as having a candy
			if (hasCandy) {
				var emptyPosition = _getRandomEmptyPosition();
				_setCell(emptyPosition[0], emptyPosition[1], _CANDY_SYMBOL);
				newStateInfo.newCandyPosition = emptyPosition;
			}
		}

		return newStateInfo;
	}

	Board.prototype.getSnakeHeadEndPositions = function(numCells) {
		return _snake.getHeadEndPositions(numCells);
	}

	Board.prototype.getSnakeTailEndPositions = function(numCells) {
		return _snake.getTailEndPositions(numCells);
	}

	Board.prototype.hasCandyInCell = function(row, col) {
		_checkBounds(row, col);
		return _cells[row][col] == _CANDY_SYMBOL;
	}

	Board.prototype.hasSnakeInCell = function(row, col) {
		_checkBounds(row, col);
		return _cells[row][col] == _SNAKE_SYMBOL;
	}

	Board.prototype.setSnakeDirection = function(direction) {
		_snake.setNextDirection(direction);
	}

	/**
	 * Sets the value of a symbol in _cells
	 */
	function _setCell(row, col, symbol) {
		_checkBounds(row, col);
		_checkSymbol(symbol);
		_cells[row][col] = symbol;

		// Removes empty cell if exists
		delete _emptyCells[[row, col]];
	}

	/**
	 * Empties a cell if there is any symbol in it
	 */
	function _clearCell(row, col) {
		_checkBounds(row, col);
		_cells[row][col] = null;
		_emptyCells[[row, col]] = null;
	}

	/**
	 * Gets a random empty position
	 */
	function _getRandomEmptyPosition() {
		var randomPositionString = _.sample(_.keys(_emptyCells));
		return _stringToNumberTuple(randomPositionString);
	}

	/**
	 * Converts a comma separated string into a tuple of numbers
	 * @param {string} positionString
	 */
	function _stringToNumberTuple(positionString) {
		var numberTuple = positionString.split(',').map(function(coordString) {
			return Number(coordString);
		});

		return numberTuple;
	}

	/**
	 * Checks if the cell at the given row and column is empty
	 */
	function _isCellEmpty(row, col) {
		return _cells[row][col] == null;
	}

	function _isInBounds(row, col) {
		return (row >= 0 && row < _height && col >= 0 && col < _width);
	}

	/**
	 * Makes sure that width and height are positive
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
	 * Makes sure that the width and height are defined, and the given row and
	 * column are in the bounds of the board
	 * @param {number} row
	 * @param {number} col
	 */
	function _checkBounds(row, col) {
		_checkWidthAndHeight();
		if (row < 0 || row >= _height) {
			throw 'ERROR: given row: ' + row + ' must be in the range [0, ' + _height + ')';
		}
		if (col < 0 || col >= _width) {
			throw 'ERROR: given col: ' + col + ' must be in the range [0, ' + _width + ')';
		}
	}

	/**
	 * Makes sure that the given symbol is valid
	 * @param {string} symbol
	 */
	function _checkSymbol(symbol) {
		if (!_.contains(_SYMBOLS, symbol)) {
			throw 'ERROR: given symbol: ' + symbol + ' must be in ' + _SYMBOLS;
		}
	}

	function _checkSnakeStartSize() {
		if (_snakeStartSize < _MIN_SNAKE_START_SIZE) {
			throw ('ERROR: given snake starting size of ' + _snakeStartSize + 
					' must be >= ' + _MIN_SNAKE_START_SIZE);
		}
	}

	return Board;
})();
