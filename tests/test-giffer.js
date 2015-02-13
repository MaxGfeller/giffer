var test = require('tap').test
var levelup = require('levelup')
var Giffer = require('../')
var TestAdapter = require('./testadapter')
var concat = require('concat-stream')

var db = levelup('/whatever', {
    db: require('memdown'),
    valueEncoding: 'json'
})

test('Test basic functionality of giffer', function(t) {
    var emits = 0

    t.plan(22)
    var testAdapter = new TestAdapter()

    var giffer = new Giffer({
        db: db,
        outputDir: __dirname + '/temp',
        adapters: [testAdapter]
    })

    giffer.pre('handleGif', function(next, url) {
        t.ok(url)
        next()
    })
    giffer.pre('download', function(next) {
        t.ok(true)
        next()
    })
    giffer.pre('saveMetaData', function(next) {
        t.ok(true)
        next()
    })
    giffer.pre('emitGif', function(next) {
        t.ok(true)
        next()
    })

    giffer.start()
    giffer.on('gif', function(filename, metadata) {
        t.ok(filename)
        t.ok(metadata)
        t.ok(metadata.origin)

        if (++emits < 3) return

        // test the stream
        giffer.createSeqReadStream({
          reverse: true
        }).pipe(concat(function(data) {
          t.ok(data.length == 3)
          giffer.stop()
          t.end()
        }))
    })
})
