var needle = require('needle')
var fs = require('fs')

function Downloader() {
    this.queue = []
    this.downloading = false
}

Downloader.prototype.download = function(url, path, cb) {
    this.queue.push({
        url: url,
        path: path,
        cb: cb
    })

    if(this.queue.length === 1 && this.downloading === false)
        this._processNextItem()
}

Downloader.prototype._processNextItem = function() {
    if(this.queue.length === 0) return

    this.downloading = true

    var obj = this.queue.shift()
    var url = obj.url
    var path = obj.path
    var cb = obj.cb

    needle.get(url).pipe(fs.createWriteStream(path))
        .on('close', function() {
            this.downloading = false
            this._processNextItem()
            return cb()
        }.bind(this))
}

var instance = new Downloader()

module.exports = instance
