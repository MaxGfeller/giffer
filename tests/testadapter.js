var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter

inherits(TestAdapter, EventEmitter)

function TestAdapter() {}

TestAdapter.prototype.start = function() {
    setTimeout(this.emit.bind(this, 'gif', 'http://d3dsacqprgcsqh.cloudfront.net/photo/axNxReD_460sa_v1.gif', { origin: 'test' }), 2000)
    setTimeout(this.emit.bind(this, 'gif', 'http://d3dsacqprgcsqh.cloudfront.net/photo/ae33vPQ_460sa_v1.gif', { origin: 'test2' }), 2100)
    setTimeout(this.emit.bind(this, 'gif', 'http://img-9gag-lol.9cache.com/photo/aqZZpqL_460sa_v1.gif', { origin: 'test3' }), 2100)
}

TestAdapter.prototype.stop = function() {}

module.exports = TestAdapter
