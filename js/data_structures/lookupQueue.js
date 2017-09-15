var LookupQueue = (function() {
	var _queue = null;
	var _queueData = null;

	function LookupQueue() {
		_queue = new Queue();
		_queueData = {};
	}

	LookupQueue.prototype.getQueueData = function() {
		return _.clone(_queueData);
	}

	LookupQueue.prototype.hasData = function(data) {
		return _.has(_queueData, data);
	}

	LookupQueue.prototype.getSize = function() {
		return _queue.getSize();
	}

	LookupQueue.prototype.enqueue = function(data) {
		if (!_.has(_queueData, data)) {
			_queueData[data] = 0;
		}
		_queueData[data] += 1;
		return _queue.enqueue(data);
	}

	LookupQueue.prototype.dequeue = function() {
		var dequeuedData = _queue.dequeue();
		if (_.has(_queueData, dequeuedData)) {
			if (_queueData[dequeuedData] > 0) {
				_queueData[dequeuedData] -= 1;
				if (_queueData[dequeuedData] == 0) {
					delete _queueData[dequeuedData];
				}
			} else {
				throw ('ERROR: implementation error, frequency' +
					' in _queueData should never be 0');
			}
		} else {
			throw ('ERROR: implementation error, _queueData should have ' +
					dequeuedData);
		}
		return dequeuedData;
	}

	LookupQueue.prototype.peek = function(numFromHead) {
		return _queue.peek(numFromHead);
	}

	return LookupQueue;
})();
