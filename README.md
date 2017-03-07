[![Build Status](https://travis-ci.org/Orgun109uk/simple-plugins.svg)](https://travis-ci.org/Orgun109uk/simple-plugins)
[![Build Status](https://david-dm.org/orgun109uk/simple-plugins.png)](https://david-dm.org/orgun109uk/simple-plugins)
[![npm version](https://badge.fury.io/js/simple-plugins.svg)](http://badge.fury.io/js/simple-plugins)

[![NPM](https://nodei.co/npm/simple-plugins.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/simple-plugins/)

# Simple Plugins

This utility provides a simple plugin manager and plugin base class. This provides installation, uninstallation, enable
and disable functionality as a plugin manager. And the plugin class provides a means to access the callbacks and an
event emitter connected to the single manager, or to each plugin.

### Installation
```sh
$ npm install simple-plugins
```

### PluginManager Usage

```javascript
const SimplePlugins = require('simple-plugins');
pm = new SimplePlugins.PluginManager();
pm.index(() => {
    pm.boot(() => {
        // Done.
    });
});
```

Or you can boot specific plugins, for instance from a configuration of enabled plugins:

```javascript
const SimplePlugins = require('simple-plugins');
let enabled = ['plugin-1', 'plugin-2'];

pm = new SimplePlugins.PluginManager();
pm.index(() => {
    pm.boot(() => {
        // Reset the config, just incase plugins have been removed since the
        // config value had been set.
        enabled = pm.enabled;

        // Trigger an event on the manage.
        pm.emit('event');

        // Send a message to all plugins.
        pm.message((err, response) => {
            // Message sent.
        }, 'a-message', {hello: 'world'}, null, 'sender');

        // Or send a message to a specific plugin.
        pm.message((err, response) => {
            // Message sent.
        }, 'a-message', {hello: 'world'}, 'plugin-1', 'sender');

        // Get the plugin instance.
        const plugin = pm.plugin('plugin-1');
        const pluginId = pm.pluginId(plugin); // Returns 'plugin-1'.

        done();
    }, enabled);
});
```

Each plugin can be given a "class", this is the type of plugin and allows you to only index and boot plugins of
specific classes. The default class is "simple".

```javascript
const SimplePlugins = require('simple-plugins');
pm = new SimplePlugins.PluginManager('my-plugin-class');
```

or

```javascript
const SimplePlugins = require('simple-plugins');
pm = new SimplePlugins.PluginManager(['my-plugin-class', 'another-plugin-class']);
```

### Plugin Usage

```json
    "SimplePlugins": {
        "plugin-1": {
            "description": "My custom plugin (1).",
            "class": "plugin-class",
            "namespace": "lib/Plugin1"
        },
        "plugin-2": {
            "description": "My custom plugin (2).",
            "class": "another-plugin-class",
            "namespace": "lib/Plugin2"
        }
    }
```

The ID given to the plugin will be "module-name/plugin-name" so for example if these plugins are in a module called
"my-plugins", then the plugin IDs would be "my-plugins/plugin-1" and "my-plugins/plugin-2".

## Testing
A mocha test suite has been provided and can be run by:
```sh
$ npm test
```
