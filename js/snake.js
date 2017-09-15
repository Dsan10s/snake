var Snake = (function() {
	var _UP = 'u';
	var _DOWN = 'd';
	var _LEFT = 'l';
	var _RIGHT = 'r';
	var _DIRECTIONS = [_UP, _RIGHT, _DOWN, _LEFT];

	var _headPosition,
	    _positions,
	    _size,
	    _direction,
			_nextDirection,
	    _positions;

	function Snake(headPosition, snakeStartSize, snakeStartDirection) {
		_checkDirection(snakeStartDirection);
		_headPosition = headPosition;
		_size = snakeStartSize;

		_direction = snakeStartDirection;
		_nextDirection = snakeStartDirection;

		_initializeSnake();
	}

	Snake.prototype.getDirection = function() {
		return _direction;
	}

	Snake.prototype.getHeadPosition = function() {
		return _headPosition;
	}

	/**
	 * Sets the internal state of what direction the snake is moving in
	 * @param {string} direction direction to set
	 */
	Snake.prototype.setDirection = function(direction) {
		if (_isValidNextDirection(direction)) {
			_direction = direction;
		}
	}

	/**
	 * Sets the direction that snake's should be in at the end of the update state
	 * phase
	 * @param {string} direction direction to set
	 */
	Snake.prototype.setNextDirection = function(direction) {
		if (_isValidNextDirection(direction)) {
			_nextDirection = direction;
		}
	}

	/**
	 * Gets the position of numCells cells starting from the head, and going in
	 * order along the snake
	 * @param {number} numCells number of cells to return
	 * @returns {Array} array of cells starting with head
	 */
	Snake.prototype.getHeadEndPositions = function(numCells) {
		var headEndPositions = [];
		var currentHeadIndex = _positions.getSize() - 1;

		for (var i = 0; i < numCells; i++) {
			headEndPositions.push(_positions.peek(currentHeadIndex-i));
		}
		return headEndPositions;
	}

	/**
	 * Gets the position of numCells cells ending with the tail. The preceding
	 * cells are the cells in order that lead up to the tail
	 * @param {number} numCells number of cells to return
	 * @returns {Array} array of cells ending with tail
	 */
	Snake.prototype.getTailEndPositions = function(numCells) {
		var tailEndPositions = [];
		var currentTailIndex = numCells-1;
		for (var i = 0; i < numCells; i++) {
			tailEndPositions.push(_positions.peek(currentTailIndex-i));
		}
		return tailEndPositions;
	}

	/**
	 * Gets a list of all the current snake positions in order, starting from the
	 * tail and ending with the head
	 * @returns {Array} array with position tuples corresponding to snake
	 * positions
	 */
	Snake.prototype.getPositions = function() {
		return _positions.getInOrderData();
	}

	/**
	 * Returns the location of where the snake plans to move the next frame if it
	 * is facing a certain direction
	 * @param {string} direction direction to use for calculating next position
	 * @returns {Array} [row, col] tuple representing next position
	 */
	Snake.prototype.getNextPosition = function(direction) {
		_checkDirection(direction);
		if (direction == _UP) {
			return [_headPosition[0]-1, _headPosition[1]];
		} else if (direction == _DOWN) {
			return [_headPosition[0]+1, _headPosition[1]];
		} else if (direction == _LEFT) {
			return [_headPosition[0], _headPosition[1]-1];
		} else if (direction == _RIGHT) {
			return [_headPosition[0], _headPosition[1]+1];
		}
	}

	/**
	 * Updates the snake's internal state based on the given direction 
	 * @param {string} direction direction to use for updating state
	 * @param {boolean} hasCandy whether or not the next position contains a candy
	 * @returns {object} with information about parts of the state that have
	 * changed in the new state
	 */
	Snake.prototype.updateState = function(direction, hasCandy) {
		_checkDirection(direction);
		var headPositions = [];
		var tailPositions = [];
		var oldTailPosition;

		var validState = true;

		if (hasCandy) {
			_size += 1
		} else {
			oldTailPosition = _positions.dequeue();
		}

		tailPositions = this.getTailEndPositions(2);
		if (oldTailPosition) {
			tailPositions.push(oldTailPosition);
		}

		var newPosition = this.getNextPosition(direction);

		if (_positions.hasData(newPosition)){
			validState = false;
		} else {
			_headPosition = newPosition;
			_positions.enqueue(newPosition);
			headPositions = this.getHeadEndPositions(3);
		}

		this.setDirection(_nextDirection);

		return {
			validState: validState,
			headPositions: headPositions,
			tailPositions: tailPositions,
		};
	}

	function _initializeSnake() {
		_positions = new LookupQueue();
		if (_direction == _UP) {
			for (var i = _size-1; i >= 1; i--) {
				_positions.enqueue([_headPosition[0]+i, _headPosition[1]]);
			}
		} else if (_direction == _DOWN) {
			for (var i = _size-1; i >= 1; i--) {
				_positions.enqueue([_headPosition[0]-i, _headPosition[1]]);
			}
		} else if (_direction == _LEFT) {
			for (var i = _size-1; i >= 1; i--) {
				_positions.enqueue([_headPosition[0], _headPosition[1]+1]);
			}
		} else if (_direction == _RIGHT) {
			for (var i = _size-1; i >= 1; i--) {
				_positions.enqueue([_headPosition[0], _headPosition[1]-1]);
			}
		} else {
			throw 'ERROR: the saved _direction ' + _direction + ' is not valid';
		}
		_positions.enqueue(_headPosition);
	}

	/**
	 * Checks if the given direction is a direction that the snake can turn based
	 * on its current direction
	 * @param {string} direction direction to check
	 * @returns {boolean} if the direction is a valid next direction for the snake
	 */
	function _isValidNextDirection(direction) {
		_checkDirection(direction);
		return ((direction == _UP && _direction != _DOWN) ||
				(direction == _DOWN && _direction != _UP) ||
				(direction == _LEFT && _direction != _RIGHT) ||
				(direction == _RIGHT && _direction != _LEFT));
	}

	/**
	 * Makes sure that a given direction is valid
	 * @param {string} direction
	 */
	function _checkDirection(direction) {
		if (!_.contains(_DIRECTIONS, direction)) {
			throw 'ERROR: given direction: ' + direction + ' must be in ' + _DIRECTIONS;
		}
	}

	return Snake;
})();
