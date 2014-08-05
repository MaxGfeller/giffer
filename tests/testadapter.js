var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

inherits(TestAdapter, EventEmitter);

function TestAdapter() {}

TestAdapter.prototype.start = function() {
    setTimeout(this.emit.bind(this, 'gif', 'http://localhost:8080/images/9e52e742-1c67-11e4-8f73-6186c5bb1a45.gif'), 2000);
};

TestAdapter.prototype.stop = function() {};

module.exports = TestAdapter;
