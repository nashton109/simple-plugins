/**
 * Provides the main plugin manager class, and is used by the application
 * which wants to support plugins.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

'use strict';

const path = require('path');
const async = require('async');
const WeightedEmitter = require('weighted-emitter');
const sortByKey = require('sort-by-key');

const findPackage = require('./FindPackage');

/**
 * Sends a message to the given plugin.
 *
 * @param {String} pluginId The ID of the plugin to send the message to.
 * @param {PluginManager} manager The plugin manager.
 * @param {String} messageId The message ID.
 * @param {Object} data Any data to send to the plugin.
 * @param {String} senderId The ID of what is sending the message.
 * @param {Object} results An object to append the results to.
 */
function messagePlugin(pluginId, manager, messageId, data, senderId, results) {
    return function(next) {
        if (manager.plugins[pluginId].plugin.message instanceof Function === false) {
            return next();
        }

        manager.plugins[pluginId].plugin.message(function(response) {
            if (response !== undefined) {
                results[pluginId] = response;
            }

            next();
        }, messageId, senderId, data);
    };
}

/**
 * Boot the given plugin.
 *
 * @param {String} pluginId The ID of the plugin to boot.
 * @param {PluginManager} manager The plugin manager.
 */
function bootPlugin(pluginId, manager) {
    return function(next) {
        if (manager.plugins[pluginId].plugin.boot instanceof Function === false) {
            manager.enabled.push(pluginId);
            return next();
        }

        manager.plugins[pluginId].plugin.boot((err) => {
            if (!err) {
                manager.enabled.push(pluginId);
            }

            next();
        });
    };
}

/**
 * Check a package file for simple plugin references.
 *
 * @param {PluginManager} manager The plugin manager.
 * @param {String} moduleName The name of the module.
 * @param {Object} pkg The package info object.
 * @param {Object} context Any additional data to send to the plugin constructor.
 */
function checkPackageForPlugins(manager, moduleName, pkg, isLocal, context) {
    if (!pkg.SimplePlugins) {
        return;
    }

    for (let name in pkg.SimplePlugins) {
        const plgClass = pkg.SimplePlugins[name].class || 'simple';
        if (manager.classes.indexOf(plgClass) === -1) {
            continue;
        }

        const pluginId = `${moduleName}/${name}`;
        const weight = pkg.SimplePlugins[name].weight || 0;
        const namespace = (isLocal === true ? findPackage.packageRootDirectory() + path.sep : `${moduleName}/`) +
            `${pkg.SimplePlugins[name].namespace}`;
        const PluginCls = require(namespace);

        manager.plugins[pluginId] = {
            info: pkg.SimplePlugins[name],
            weight: weight,
            plugin: new PluginCls(manager, context)
        };
    }
}

module.exports = class PluginManager extends WeightedEmitter {
    /**
     * Construct the plugin manager, and provide the plugin classes this
     * manager will look for.
     *
     * @param {String|Array} classes A plugin class or an array of plugin
     *   classes, if not provided then ['simple'] is used.
     */
    constructor(classes) {
        super();

        const _plugins = {
            enabled: [],
            plugins: {}
        };

        classes = !classes ? ['simple'] : (classes instanceof Array ? classes : [classes]);

        Object.defineProperties(this, {
            /**
             * Returns the plugin class or classes this manager uses.
             *
             * @type {Array}
             */
            classes: {
                get: function() {
                    return classes;
                }
            },
            /**
             * Get a list of the enabled plugins.
             *
             * @type {Array}
             */
            enabled: {
                get: function() {
                    return _plugins.enabled;
                }
            },
            /**
             * Get a list of the running plugins.
             *
             * @type {Object}
             */
            plugins: {
                get: function() {
                    return _plugins.plugins;
                }
            }
        });
    }

    /**
     * Search for and index the matching plugins.
     *
     * @param {Function} done The done callback.
     * @param {Object} context Any additional data to send to the plugin constructor.
     * @param {Boolean} searchDevDependencies Set to true to allow searching the dev dependencies.
     * @async
     */
    index(done, context, searchDevDependencies) {
        const me = this;
        const pkg = findPackage();
        checkPackageForPlugins(this, pkg.name, pkg, true, context);

        let npmCmd = 'npm ls --depth=0 --json';
        if (searchDevDependencies !== true) {
            npmCmd += ' --only=production';
        }

        require('child_process').exec(npmCmd, function(err, stdout, stderr) {
            const modInf = JSON.parse(stdout);
            for (let moduleName in modInf.dependencies) {
                const pkg = require(`${moduleName}/package.json`);
                checkPackageForPlugins(me, moduleName, pkg, false, context);
            }

            sortByKey(me.plugins, 'weight');
            done();
        });
    }

    /**
     * Boot the available plugins, or plugins matching the given IDs.
     *
     * @param {Function} done The done callback.
     * @param {Array} plugins An array of plugin IDs to enable, if this is not
     *   provided, then all found plugins will be booted.
     * @async
     */
    boot(done, plugins) {
        if (!plugins) {
            plugins = Object.keys(this.plugins);
        }

        const queue = [];
        for (let pluginId in this.plugins) {
            if (plugins.indexOf(pluginId) === -1) {
                continue;
            }

            queue.push(bootPlugin(pluginId, this));
        }

        async.series(queue, () => {
            this.emit('plugins.booted');
            done();
        });
    }

    /**
     * Retrieve the plugin object reference of a given plugin ID.
     *
     * @param {String} pluginId The plugin ID.
     * @return {Boolean|Plugin} Either the matching plugin, or false.
     */
    plugin(pluginId) {
        return this.plugins[pluginId] ? this.plugins[pluginId].plugin : false;
    }

    /**
     * Find the PluginID of a given plugin instance.
     *
     * @param {Object} plugin
     * @return {String|Boolean} The found plugin's ID, or false.
     */
    pluginId(plugin) {
        for (let pluginId in this.plugins) {
            if (this.plugins[pluginId].plugin === plugin) {
                return pluginId;
            }
        }

        return false;
    }

    /**
     * Send a message to either a specified plugin or all plugins.
     *
     * @param {Function} done The done callback.
     * @param {String} messageId The message id being sent.
     * @param {Object} data Any data to send as part of the message.
     * @param {String|Array} pluginIds Either a plugin id, plugin ids or null for all plugins.
     * @param {String} senderId Either the plugin id of the sender, or null to assume from the manager.
     * @async
     */
    message(done, messageId, data, pluginIds, senderId) {
        if (!pluginIds) {
            pluginIds = this.enabled;
        } else if (pluginIds instanceof Array === false) {
            pluginIds = [pluginIds];
        }

        const queue = [];
        const results = {};
        pluginIds.forEach((pluginId) => {
            queue.push(messagePlugin(pluginId, this, messageId, data, senderId, results));
        });

        async.series(queue, (err) => {
            if (typeof done === 'function') {
                done(err, results);
            }
        });
    }
};