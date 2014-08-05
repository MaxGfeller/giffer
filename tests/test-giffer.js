var test = require('tap').test;
var levelup = require('levelup');
var Giffer = require('../');
var TestAdapter = require('./testadapter');

var db = levelup('/whatever', {
    db: require('memdown')
});

test('Test basic functionality of giffer', function(t) {
    var testAdapter = new TestAdapter();

    var giffer = new Giffer({
        db: db,
        outputDir: __dirname + '/temp',
        thumbnailDir: __dirname + '/temp/thumbs',
        thumbnailHeight: 200,
        thumbnailWidth: 200,
        createThumbnails: true,

        adapters: [testAdapter]
    });

    giffer.start();
    giffer.on('gif', function(url) {
        giffer.stop();
        t.ok(url);
        t.end();
    });
});
