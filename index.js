var levelup = require('levelup');
var uuid = require('uuid');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var downloader = require('./downloader');
var fs = require('fs');
var gm = require('gm');
var imageMagick = gm.subClass({ imageMagick: true });

inherits(Giffer, EventEmitter);

function Giffer(args) {
    this.timeToRestart = args.timeToRestart || 300000; // in ms
    this.adapters = [];
    this.db = args.db; // key encoding must be json

    args.adapters.forEach(this.adapters.push.bind(this.adapters));

    this.outDir = args.outputDir;
    this.thumbDir = this.outDir + '/' + args.thumbDir;
    this.thumbnailWidth = args.thumbnailWidth;
    this.thumbnailHeight = args.thumbnailHeight;

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
    this.db.get(url, function(err, value) {
        if (!err && value) return;

        var id = uuid.v1();
        this.db.put(url, {
            filename: id + '.gif',
            dir: this.outDir,
            time: new Date().getTime()
        }, function(err) {
            if (err) throw err;
        });

        downloader.download(url, this.outDir + '/' + id + '.gif', function() {
          var readStream = fs.createReadStream(this.outDir + '/' + id + '.gif');
          imageMagick(readStream, id + '.gif[0]')
            .resize(this.thumbnailWidth, this.thumbnailHeight)
            .noProfile()
            .stream(function (err, stdout, stderr) {
              if (err) {
                console.log('Error: ' + err);
              }
              var writeStream = fs.createWriteStream(this.thumbDir + '/' + id + '.gif');
              stdout.pipe(writeStream);
              writeStream.on('finish', function() {
                this.emit('gif', id + '.gif');
              }.bind(this));
            }.bind(this));
        }.bind(this));
    }.bind(this));
};

module.exports = Giffer;
