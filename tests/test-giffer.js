var test = require('tap').test
var Giffer = require('../')

test('Test basic functionality of giffer', function(t) {
    var giffer = new Giffer({
        db: __dirname + '/temp/db',
        outputDir: __dirname + '/temp'
    })

    giffer.start()
    giffer.on('gif', function(filename) {
        giffer.stop()
        t.ok(filename)
        t.end()
    })
})
