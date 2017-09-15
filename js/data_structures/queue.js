var Queue = (function() {
	var _size = null;
	var _inStack = null;
	var _outStack = null;

	function Queue() {
		_size = 0;
		_inStack = [];
		_outStack = [];
	};

	Queue.prototype.getSize = function() {
		return _size;
	}

	Queue.prototype.enqueue = function(data) {
		_inStack.push(data);
		_size += 1;
	}

	Queue.prototype.dequeue = function() {
		if (_size == 0) {
			throw 'ERROR: Cannot dequeue from a queue of size 0';
		}
		if (_inStack.length > 0 && _outStack.length == 0) {
			while (_inStack.length > 0) {
				_outStack.push(_inStack.pop());
			}
		}
		if (_outStack.length > 0) {
			_size -= 1;
			return _outStack.pop();
		} else {
			throw 'ERROR: Implementation error: stacks are empty but size is nonzero'
		}
	}

	Queue.prototype.peek = function(numFromHead) {
		if (numFromHead == undefined) {
			numFromHead = 0;
		}
		if (_size == 0) {
			throw 'ERROR: Cannot peek into an empty queue';
		}
		if (numFromHead > _size-1 || numFromHead < 0) {
			throw ('ERROR: Attempting to retrieve an element out of bounds of the' +
			       ' queue');
		}

		if (numFromHead < _outStack.length) {
			return _outStack[_outStack.length - 1 - numFromHead];
		} else {
			numFromHead -= _outStack.length
			return _inStack[numFromHead];
		}
	}

	return Queue;
})();
