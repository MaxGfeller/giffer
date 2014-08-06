# Giffer

Giffer is an automatic gif download bot and is highly customizable. It's core
functionality only consists of being able to start different adapters and
downloading gifs that were found by these adapters. It also saves some meta
information and makes sure that the same gifs are not downloaded multiple times.

## API

### `start()`

Start up the whole engine!

### `stop()`

Shut down the whole engine.

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
