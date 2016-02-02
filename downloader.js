var request = require('request')
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

  if (this.queue.length === 1 && this.downloading === false)
    this._processNextItem()
}

Downloader.prototype._processNextItem = function() {
  if (this.queue.length === 0) return

  this.downloading = true

  var obj = this.queue.shift()
  var url = obj.url
  var path = obj.path
  var cb = obj.cb

  try {
    var self = this
    request.get(url).on('error', function () {
      console.error(e)
      self.downloading = false
      self._processNextItem()
      return cb()
    })
    .pipe(fs.createWriteStream(path))
    .on('finish', function () {
      self.downloading = false
      self._processNextItem()
      return cb()
    })
  } catch (e) {
    this.downloading = false
    this._processNextItem()
    return cb()
  }
}

var instance = new Downloader()

module.exports = instance
