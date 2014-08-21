var test = require('tap').test
var levelup = require('levelup')
var Giffer = require('../')
var TestAdapter = require('./testadapter')

var db = levelup('/whatever', {
    db: require('memdown')
})

test('Test basic functionality of giffer', function(t) {
    var emits = 0

    t.plan(21)
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
        emits++
        t.ok(filename)
        t.ok(metadata)
        t.ok(metadata.origin)

        if(emits < 3) return

        giffer.stop()
        t.end()
    })
})
