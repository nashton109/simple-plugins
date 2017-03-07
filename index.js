/**
 * Provide the PluginManager and Plugin classes as an export.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

'use strict';

module.exports.PluginManager = require('./lib/PluginManager');
module.exports.Plugin = require('./lib/PluginManager');

/**
 * Install a module or modules.
 *
 * @param {String|Array} plugins A plugin name or an array of multiple plugin
 *   names.
 * @param {Function} done The done callback.
 * @async
 */
module.exports.install = function(plugins, done) {
    const args = ['install'].concat(plugins instanceof Array ? plugins : [plugins]);
    const npm = require('child_process').spawn('npm', args, { env: process.env, stdio: 'inherit', detached: true });
    npm.on('close', function(code) {
        npm.unref();
        done(code === 0);
    });
};

/**
 * Uninstall a module or modules.
 *
 * @param {String|Array} plugins A plugin name or an array of multiple plugin
 *   names.
 * @param {Function} done The done callback.
 * @async
 */
module.exports.uninstall = function(plugins, done) {
    const args = ['remove'].concat(plugins instanceof Array ? plugins : [plugins]);
    const npm = require('child_process').spawn('npm', args, { env: process.env, stdio: 'inherit', detached: true });
    npm.on('close', function(code) {
        npm.unref();
        done(code === 0);
    });
};