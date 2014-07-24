var needle = require('needle')
var fs = require('fs')

function Downloader() {
    this.queue = []
}

Downloader.prototype.download = function(url, path, cb) {
    this.queue.push({
        url: url,
        path: path,
        cb: cb
    })

    if(this.queue.length === 1) this._processNextItem()
}

Downloader.prototype._processNextItem = function() {
    if(this.queue.length === 0) return

    var obj = this.queue.shift()
    var url = obj.url
    var path = obj.path
    var cb = obj.cb

    needle.get(url).pipe(fs.createWriteStream(path))
        .on('close', function() {
            this._processNextItem()
            return cb()
        }.bind(this))
}

var instance = new Downloader()

module.exports = instance
