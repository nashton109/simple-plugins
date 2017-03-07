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
     */
    constructor(manager) {
        this.manager = manager;
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