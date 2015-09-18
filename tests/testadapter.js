var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter

inherits(TestAdapter, EventEmitter)

function TestAdapter() {}

TestAdapter.prototype.start = function() {
  setTimeout(this.emit.bind(this, 'gif', 'http://www.arabianbusiness.com/skins/ab.main/gfx/loading_spinner.gif', {
    origin: 'test'
  }), 2000)
  setTimeout(this.emit.bind(this, 'gif', 'http://www.arabianbusiness.com/skins/ab.main/gfx/loading_spinner.gif', {
    origin: 'test2'
  }), 2300)
  setTimeout(this.emit.bind(this, 'gif', 'http://img-9gag-lol.9cache.com/photo/aqZZpqL_460sa_v1.gif', {
    origin: 'test3'
  }), 2700)
}

TestAdapter.prototype.stop = function() {}

module.exports = TestAdapter
