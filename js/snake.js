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

	function Snake(headRow, headCol, snakeStartSize, snakeStartDirection) {
		_checkDirection(snakeStartDirection);
		_headPosition = [headRow, headCol];
		_size = snakeStartSize;

		_checkDirection(snakeStartDirection);
		_direction = snakeStartDirection;
		_nextDirection = snakeStartDirection;

		_initializeSnake();
	}

	Snake.prototype.setDirection = function(direction) {
		if (_isValidNextDirection(direction)) {
			_direction = direction;
		}
	}

	Snake.prototype.setNextDirection = function(direction) {
		if (_isValidNextDirection(direction)) {
			_nextDirection = direction;
		}
	}

	Snake.prototype.getDirection = function() {
		return _direction;
	}

	Snake.prototype.getHeadPosition = function() {
		return _headPosition;
	}

	Snake.prototype.getHeadEndPositions = function(numCells) {
		var headEndPositions = [];
		var currentHeadIndex = _positions.getSize() - 1;

		for (var i = 0; i < numCells; i++) {
			headEndPositions.push(_positions.peek(currentHeadIndex-i));
		}
		return headEndPositions;
	}

	Snake.prototype.getTailEndPositions = function(numCells) {
		var tailEndPositions = [];
		var currentTailIndex = numCells-1;
		for (var i = 0; i < numCells; i++) {
			tailEndPositions.push(_positions.peek(currentTailIndex-i));
		}
		return tailEndPositions;
	}

	Snake.prototype.getTailPosition = function() {
		return _positions.peek();
	}

	Snake.prototype.getPositions = function() {
		return _positions.getQueueData();
	}

	/**
	 * Returns the location of where the snake plans to move the next frame if it
	 * is facing a certain direction
	 * @param {string} direction direction to use for calculating next position
	 * @returns [row, col] tuple representing next position
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
	 * Returns if the next state is valid, i.e., the new position is a position
	 * already occupied by the snake 
	 * @param {string} direction direction to use for updating state
	 * @param {boolean} hasCandy whether or not the next position contains a candy
	 * @returns {object} with if the state is valid, and the old tail position if
	 * the tail moved
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
