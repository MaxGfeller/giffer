var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter

inherits(TestAdapter, EventEmitter)

function TestAdapter() {}

TestAdapter.prototype.start = function() {
    setTimeout(this.emit.bind(this, 'gif', 'http://d3dsacqprgcsqh.cloudfront.net/photo/axNxReD_460sa_v1.gif'), 2000)
}

TestAdapter.prototype.stop = function() {}

module.exports = TestAdapter
