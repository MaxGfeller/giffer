var needle = require('needle')
var levelup = require('levelup')
var uuid = require('uuid')
var fs = require('fs')
var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter

inherits(Giffer, EventEmitter)

function Giffer(args) {
    this.adapters = []
    this.db = args.db // key encoding must be json

    args.adapters.forEach(this.adapters.push.bind(this.adapters))

    this.outDir = args.outputDir
}

Giffer.prototype.start = function() {
    this.adapters.forEach(function(adapter) {
        if(!adapter.start) return

        adapter.start()
        adapter.on('gif', this._handleGif.bind(this))
    }.bind(this))
}

Giffer.prototype.stop = function() {
    // stop adapters
    this.adapters.forEach(function(adapter) {
        if(!adapter.stop) return
        adapter.stop()
    })
}

Giffer.prototype._handleGif = function(url) {
    this.db.get('url', function(err, value) {
        if(!err && value) return

        var id = uuid.v1()
        this.db.put(url, {
            filename: id + 'gif',
            dir: this.outDir,
            time: new Date().getTime()
        }, function(err) {
            if(err) throw err
        })

        http.get(url, function(res) {
            res.pipe(fs.createWriteStream(this.outDir + '/' + id + '.gif'))
            this.emit('gif', this.outDir + '/' + id + '.gif')
        }.bind(this))
    }.bind(this))
}

module.exports = Giffer
