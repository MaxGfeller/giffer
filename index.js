var uuid = require('uuid')
var sublevel = require('level-sublevel')
var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var downloader = require('./downloader')
var hooks = require('hooks')
var through = require('through')
var fs = require('fs')

inherits(Giffer, EventEmitter)

function Giffer(args) {
  // Make hooks possible
  for (var k in hooks) {
    this[k] = hooks[k]
  }

  this.hook('download', this.download)
  this.hook('handleGif', this.handleGif)
  this.hook('saveMetaData', this.saveMetaData)
  this.hook('emitGif', this.emitGif)

  this.timeToRestart = args.timeToRestart || 300000 // in ms
  this.adapters = []
  var db = sublevel(args.db) // value encoding must be json

  this.urlDb = db.sublevel('url')
  var seqDb = this.seqDb = db.sublevel('seq')

  // create time based index
  this.urlDb.pre(function(ch, add) {
    if (ch.type === 'put') {
      add({
        key: '' + ch.value.time,
        value: ch.key,
        type: 'put',
        prefix: seqDb
      })
    } else if (ch.type === 'del') {
      this.urlDb.get(ch.key, function(err, obj) {
        fs.unlink(this.outDir + '/' + obj.filename, noop)
        if (err) throw err
        this.seqDb.del(obj.time, noop)
      }.bind(this))
    }
  }.bind(this))

  args.adapters.forEach(this.adapters.push.bind(this.adapters))
  this.outDir = args.outputDir
  this._timeouts = []
}

Giffer.prototype.start = function() {
  this.adapters.forEach(function(adapter) {
    if (!adapter.start) return

    adapter.start()
    adapter.on('gif', this.handleGif.bind(this))
    adapter.on('stop', function() {
      var timeout = setTimeout(adapter.start.bind(adapter), this.timeToRestart)
      this._timeouts.push(timeout)
    }.bind(this))
  }.bind(this))
}

Giffer.prototype.stop = function() {
  // stop adapters
  this.adapters.forEach(function(adapter) {
    if (!adapter.stop) return
    adapter.stop()
  })

  this._timeouts.forEach(function(timeout) {
    clearTimout(timeout)
  })
}

Giffer.prototype.plugin = function(plugin, opts) {
  plugin(this, opts)
}

Giffer.prototype.createSeqReadStream = function(opts) {
  var self = this
  var tr = through(function(v) {
    this.pause()
    self.urlDb.get(v.value, function(err, value) {
      if (err) return this.emit('error', err)
      this.emit('data', {
        key: v.key,
        filename: value.filename,
        metadata: value.meta
      })
      this.resume()
    }.bind(this))
  })

  process.nextTick(function() {
    this.seqDb.createReadStream(opts).pipe(tr)
  }.bind(this))
  return tr
}

Giffer.prototype.handleGif = function(url, metadata) {
  if (!metadata || !metadata.origin) return
  this.urlDb.get(url, function(err, value) {
    if (!err && value) return

    var id = uuid.v1()

    this.download(id, url, metadata)
  }.bind(this))
}

Giffer.prototype.download = function(id, url, metadata) {
  downloader.download(url, this.outDir + '/' + id + '.gif', function() {
    this.saveMetaData(url, id, metadata)
  }.bind(this))
}

Giffer.prototype.saveMetaData = function(url, id, metadata) {
  this.urlDb.put(url, {
    filename: id + '.gif',
    dir: this.outDir,
    time: Date.now(),
    meta: metadata
  }, function(err) {
    if (err) throw err

    this.emitGif(id + '.gif', metadata)
  }.bind(this))
}

Giffer.prototype.emitGif = function(filename, metadata) {
  this.emit('gif', filename, metadata)
  downloader._processNextItem()
}

module.exports = Giffer

function noop() {}
