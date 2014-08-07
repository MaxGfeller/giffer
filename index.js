var uuid = require('uuid')
var sublevel = require('level-sublevel')
var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter
var downloader = require('./downloader')
var hooks = require('hooks')

inherits(Giffer, EventEmitter)

function Giffer(args) {
    // Make hooks possible
    for(var k in hooks) {
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
        add({
            key: '' + Date.now(),
            value: ch.key,
            type: 'put',
            prefix: seqDb
        })
    })

    args.adapters.forEach(this.adapters.push.bind(this.adapters))

    this.outDir = args.outputDir

    this._timeouts = []
}

Giffer.prototype.start = function() {
    this.adapters.forEach(function(adapter) {
        if(!adapter.start) return

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
        if(!adapter.stop) return
        adapter.stop()
    })

    this._timeouts.forEach(function(timeout) {
        clearTimout(timeout)
    })
}

Giffer.prototype.handleGif = function(url) {
    this.urlDb.get(url, function(err, value) {
        if(!err && value) return

        var id = uuid.v1()

        this.download(id, url)
    }.bind(this))
}

Giffer.prototype.download = function(id, url) {
    downloader.download(url, this.outDir + '/' + id + '.gif', function() {
        this.saveMetaData(url, id)
    }.bind(this))
}

Giffer.prototype.saveMetaData = function(url, id) {
    this.urlDb.put(url, {
        filename: id + '.gif',
        dir: this.outDir,
        time: new Date().getTime()
    }, function(err) {
        if(err) throw err

        this.emitGif(id + '.gif')
    }.bind(this))
}

Giffer.prototype.emitGif = function(filename) {
    this.emit('gif', filename)
}

module.exports = Giffer
