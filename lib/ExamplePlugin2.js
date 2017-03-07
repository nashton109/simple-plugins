/**
 * An example simple plugin.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

'use strict';

module.exports = class ExamplePlugin2 {
    /**
     * Plugin constructor.
     *
     * @param {Object} manager The manager which created this plugin instance.
     */
    constructor(manager) {
        this.manager = manager;
    }
};