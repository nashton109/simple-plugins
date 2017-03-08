/**
 * An example simple plugin.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

'use strict';

module.exports = class ExamplePlugin3 {
    /**
     * Plugin constructor.
     *
     * @param {Object} manager The manager which created this plugin instance.
     * @param {Object} context Any additional data.
     */
    constructor(manager, context) {
        this.manager = manager;
        this.context = context;
    }

    /**
     * Boot this instance of the plugin.
     *
     * @param {Function} done The done callback.
     */
    boot(done) {
        done(new Error());
    }
};