# Giffer

Giffer is an automatic gif download bot and is highly customizable. It's core
functionality only consists of being able to start different adapters and
downloading gifs that were found by these adapters. It also saves some meta
information and makes sure that gifs with the same url are not downloaded multiple times.

## API

## `new Giffer(args)`

There are some args you must/can provide when creating a new giffer client:
- `db`: A `levelup` instance. _Important:_ Must have `valueEncoding: "json"`
- `timeToRestart`: Time in ms after which an adapter should be started again after it has finished
- `adapters`: An array of adapters. See [list of adapters](https://github.com/MaxGfeller/giffer/wiki/Modules#adapters)
- `outputDir`: Where the files should be downloaded to

```javascript
var levelup = require('levelup')
var GifferAdapter9Gag = require('giffer-adapter-9gag')
var Giffer = require('giffer')

var db = levelup('/whatever', {
    db: require('memdown'),
    valueEncoding: 'json'
})

var adapter9gag = new GifferAdapter9Gag({})

var giffer = new Giffer({
  db: db,
  outputDir: __dirname + '/images',
  adapters: [adapter9gag]
})
```
### `start()`

Start up the whole engine!

### `stop()`

Shut down the whole engine.

### `plugin(plugin[, args])`

Easy way to use a plugin.

```javascript
giffer.plugin(require('giffer-validator'))
```

## Events

Giffer emits only one event:

### `gif`

When a gif was downloaded. As a parameter you get the filename.

## Writing plugins

Writing plugins is pretty straight forward. It offers hooks on some methods and
your plugin can register on either `pre` or `post` events on these methods.

These are methods that can be hooked into:

### `handleGif`

This is the first method that is being called when an adapter emits a new `gif`
event. Checks if the gif was already downloaded and - if not - saves the data
into the database.

### `download`

Does what it says. Actually downloads the gif into the predefined folder.

### `emitGif`

This is the method that emits the `gif` event after everything has been done
properly.
