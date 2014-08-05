var uuid = require('uuid');
var sublevel = require('level-sublevel');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var downloader = require('./downloader');
var thumbnailer = require('giffer-thumbnail');

inherits(Giffer, EventEmitter);

function Giffer(args) {
    this.timeToRestart = args.timeToRestart || 300000; // in ms
    this.adapters = [];
    var db = sublevel(args.db); // value encoding must be json

    this.urlDb = db.sublevel('url');
    var seqDb = this.seqDb = db.sublevel('seq');

    // create time based index
    this.urlDb.pre(function(ch, add) {
        add({
            key: '' + Date.now(),
            value: ch.key,
            type: 'put',
            prefix: seqDb
        });
    });

    args.adapters.forEach(this.adapters.push.bind(this.adapters));

    this.outDir = args.outputDir;
    this.thumbnailDir = args.thumbnailDir;
    this.thumbnailWidth = args.thumbnailWidth;
    this.thumbnailHeight = args.thumbnailHeight;

    this.createThumbnails = args.createThumbnails;

    this._timeouts = [];
}

Giffer.prototype.start = function() {
    this.adapters.forEach(function(adapter) {
        if (!adapter.start) return;

        adapter.start();
        adapter.on('gif', this._handleGif.bind(this));
        adapter.on('stop', function() {
            var timeout = setTimeout(adapter.start.bind(adapter), this.timeToRestart);
            this._timeouts.push(timeout);
        }.bind(this));
    }.bind(this));
};

Giffer.prototype.stop = function() {
    // stop adapters
    this.adapters.forEach(function(adapter) {
        if (!adapter.stop) return;
        adapter.stop();
    });

    this._timeouts.forEach(function(timeout) {
        clearTimout(timeout);
    });
};

Giffer.prototype._handleGif = function(url) {
    this.urlDb.get(url, function(err, value) {
        if (!err && value) return;

        var id = uuid.v1();
        this.urlDb.put(url, {
            filename: id + '.gif',
            dir: this.outDir,
            time: new Date().getTime()
        }, function(err) {
            if (err) throw err;
        });
      this._download(url, id, function() {
      });
      this.emit('gif', id + '.gif');
    }.bind(this));
};

Giffer.prototype._download = function(url, id) {
  downloader.download(url, this.outDir + '/' + id + '.gif', function() {
    if (this.createThumbnails) {
      this._createThumbnail(id);
    }
  }.bind(this));
};

Giffer.prototype._createThumbnail = function(id) {
  thumbnailer.createThumbnail(this, {'img':id + '.gif'}, function() {
  }.bind(this));
};

module.exports = Giffer;
