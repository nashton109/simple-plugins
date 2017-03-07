/**
 * Provides the tests for the PluginManager class.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

'use strict';

const unitjs = require('unit.js');

const PluginManager = require('../lib/PluginManager');
const ExamplePlugin = require('../lib/ExamplePlugin');
const ExamplePlugin2 = require('../lib/ExamplePlugin2');

/** @test {PluginManager} */
describe('PluginManager', () => {
    /** @test {PluginManager.constructor} */
    describe('constructor()', () => {
        it('should construct with empty plugin data', () => {
            const pm = new PluginManager();

            unitjs.array(pm.classes).is(['simple']);
            unitjs.object(pm.plugins).is({});
            unitjs.array(pm.enabled).is([]);
        });

        it('should be able to set the plugin classes array', () => {
            const pm = new PluginManager(['test']);

            unitjs.array(pm.classes).is(['test']);
        });

        it('should be able to set the plugin classes string', () => {
            const pm = new PluginManager('test');

            unitjs.array(pm.classes).is(['test']);
        });
    });

    /** @test {PluginManager.index} */
    describe('index()', () => {
        it('shouldnt find any plugins', function(done) {
            this.timeout(5000);

            const pm = new PluginManager();
            pm.index(function() {
                unitjs.object(pm.plugins).is({});
                unitjs.array(pm.enabled).is([]);

                done();
            });
        });

        it('should find plugins from the example plugin', function(done) {
            this.timeout(5000);

            const pm = new PluginManager(['simple', 'simple-plugins-test']);
            pm.index(function() {
                unitjs.object(pm.plugins)
                    .hasKey('simple-plugins/example')
                    .hasKey('simple-plugins/example2')
                    .notHasKey('simple-plugins-plugin/plugin-1')
                    .notHasKey('simple-plugins-plugin/plugin-2')
                    .notHasKey('simple-plugins-plugin/plugin-3');
                unitjs.array(pm.enabled).is([]);

                unitjs.object(pm.plugins['simple-plugins/example'])
                    .hasKey('info')
                    .hasKey('weight', 0)
                    .hasKey('plugin');

                unitjs.object(pm.plugins['simple-plugins/example'].info)
                    .hasKey('class', 'simple-plugins-test')
                    .hasKey('description', 'An example plugin.')
                    .hasKey('namespace', 'lib/ExamplePlugin');

                unitjs.object(pm.plugins['simple-plugins/example'].plugin)
                    .isInstanceOf(ExamplePlugin)
                    .hasKey('manager', pm);

                unitjs.object(pm.plugins['simple-plugins/example2'])
                    .hasKey('info')
                    .hasKey('weight', 0)
                    .hasKey('plugin');

                unitjs.object(pm.plugins['simple-plugins/example2'].info)
                    .hasKey('class', 'simple-plugins-test')
                    .hasKey('description', 'An example plugin.')
                    .hasKey('namespace', 'lib/ExamplePlugin2');

                unitjs.object(pm.plugins['simple-plugins/example2'].plugin)
                    .isInstanceOf(ExamplePlugin2)
                    .hasKey('manager', pm);

                done();
            });
        });

        it('should find plugins from the example plugin and sample dev module', function(done) {
            this.timeout(5000);

            const pm = new PluginManager(['simple', 'simple-plugins-test']);
            pm.index(function() {
                unitjs.object(pm.plugins)
                    .hasKey('simple-plugins/example')
                    .hasKey('simple-plugins/example2')
                    .hasKey('simple-plugins-plugin/plugin-1')
                    .hasKey('simple-plugins-plugin/plugin-2')
                    .hasKey('simple-plugins-plugin/plugin-3');
                unitjs.array(pm.enabled).is([]);

                unitjs.object(pm.plugins['simple-plugins-plugin/plugin-1'])
                    .hasKey('info')
                    .hasKey('weight', -10)
                    .hasKey('plugin');

                unitjs.object(pm.plugins['simple-plugins-plugin/plugin-1'].info)
                    .hasKey('description', 'An example plugin.')
                    .hasKey('namespace', 'lib/Plugin');

                unitjs.object(pm.plugins['simple-plugins-plugin/plugin-1'].plugin)
                    .isInstanceOf(require('simple-plugins-plugin/lib/Plugin'));

                unitjs.object(pm.plugins['simple-plugins-plugin/plugin-2'])
                    .hasKey('info')
                    .hasKey('weight', 10)
                    .hasKey('plugin');

                unitjs.object(pm.plugins['simple-plugins-plugin/plugin-2'].info)
                    .hasKey('description', 'Another example plugin.')
                    .hasKey('namespace', 'lib/Plugin2');

                unitjs.object(pm.plugins['simple-plugins-plugin/plugin-2'].plugin)
                    .isInstanceOf(require('simple-plugins-plugin/lib/Plugin2'));

                unitjs.object(pm.plugins['simple-plugins-plugin/plugin-3'])
                    .hasKey('info')
                    .hasKey('weight', 0)
                    .hasKey('plugin');

                unitjs.object(pm.plugins['simple-plugins-plugin/plugin-3'].info)
                    .hasKey('class', 'simple-plugins-test')
                    .hasKey('description', 'Yet another example plugin.')
                    .hasKey('namespace', 'lib/plugins/Plugin3');

                unitjs.object(pm.plugins['simple-plugins-plugin/plugin-3'].plugin)
                    .isInstanceOf(require('simple-plugins-plugin/lib/plugins/Plugin3'));

                done();
            }, true);
        });
    });

    /** @test {PluginManager.boot} */
    describe('boot()', () => {
        it('should boot indexed plugins', function(done) {
            this.timeout(5000);

            const pm = new PluginManager(['simple', 'simple-plugins-test']);
            pm.index(function() {
                unitjs.array(pm.enabled).is([]);

                pm.boot(function() {
                    unitjs.array(pm.enabled).is([
                        'simple-plugins/example',
                        'simple-plugins/example2',
                        'simple-plugins-plugin/plugin-1',
                        'simple-plugins-plugin/plugin-2',
                        'simple-plugins-plugin/plugin-3'
                    ]);

                    done();
                });
            }, true);
        });

        it('should boot specified plugins', function(done) {
            this.timeout(5000);

            const pm = new PluginManager(['simple', 'simple-plugins-test']);
            pm.index(function() {
                unitjs.array(pm.enabled).is([]);

                pm.boot(function() {
                    unitjs.array(pm.enabled).is([
                        'simple-plugins/example',
                        'simple-plugins-plugin/plugin-3'
                    ]);

                    done();
                }, [
                    'simple-plugins/example',
                    'simple-plugins-plugin/plugin-3'
                ]);
            }, true);
        });

        it('plugins which error in boot will not be added to the enabled list', function(done) {
            this.timeout(5000);

            const pm = new PluginManager(['simple-plugins-test', 'simple-plugins-test-error']);
            pm.index(function() {
                pm.boot(function() {
                    unitjs.array(pm.enabled).is([
                        'simple-plugins/example',
                        'simple-plugins/example2',
                        'simple-plugins-plugin/plugin-3'
                    ]);

                    done();
                });
            }, true);
        });
    });

    /** @test {PluginManager.plugin} */
    describe('plugin()', () => {
        it('should return false if the plugin doesnt exist', () => {
            const pm = new PluginManager();
            unitjs.bool(pm.plugin('simple-plugins/example')).isFalse();
        });

        it('should return false if the plugin doesnt exist after indexing', function(done) {
            this.timeout(5000);

            const pm = new PluginManager(['simple', 'simple-plugins-test']);
            pm.index(function() {
                unitjs.bool(pm.plugin('simple-plugins/example-2')).isNotTrue();

                done();
            }, true);
        });

        it('should return the plugin instance', function(done) {
            this.timeout(5000);

            const pm = new PluginManager(['simple', 'simple-plugins-test']);
            pm.index(function() {
                unitjs.object(pm.plugin('simple-plugins/example')).isInstanceOf(ExamplePlugin);

                done();
            }, true);
        });
    });

    /** @test {PluginManager.pluginId} */
    describe('pluginId()', () => {
        it('should return false if the plugin is invalid', () => {
            const pm = new PluginManager();
            unitjs.bool(pm.pluginId(null)).isFalse();
            unitjs.bool(pm.pluginId({})).isFalse();
        });

        it('should return false if the plugin doesnt exist after indexing', function(done) {
            this.timeout(5000);

            const pm = new PluginManager(['simple', 'simple-plugins-test']);
            pm.index(function() {
                unitjs.bool(pm.pluginId(null)).isFalse();
                unitjs.bool(pm.pluginId({})).isFalse();

                done();
            }, true);
        });

        it('should return plugin id', function(done) {
            this.timeout(5000);

            const pm = new PluginManager(['simple', 'simple-plugins-test']);
            pm.index(function() {
                unitjs.string(pm.pluginId(pm.plugins['simple-plugins/example'].plugin))
                    .is('simple-plugins/example');

                done();
            }, true);
        });
    });

    /** @test {PluginManager.message} */
    describe('message()', () => {
        it('should send a message to all enabled plugins', function(done) {
            this.timeout(5000);

            const pm = new PluginManager(['simple', 'simple-plugins-test']);
            pm.index(function() {
                unitjs.array(pm.enabled).is([]);

                pm.boot(function() {
                    pm.message(function(err, responses) {
                        unitjs.object(responses)
                            .hasKey('simple-plugins-plugin/plugin-1', 'Hello from "simple-plugins-plugin/plugin-1".')
                            .hasKey('simple-plugins-plugin/plugin-2', 'Hello from "simple-plugins-plugin/plugin-2".')
                            .hasKey('simple-plugins-plugin/plugin-3', 'Hello from "simple-plugins-plugin/plugin-3".')
                            .hasKey('simple-plugins/example', 'Hello from "simple-plugins/example".');

                        done();
                    }, 'hello', {}, null, null);
                });
            }, true);
        });

        it('should send a message to specified plugins', function(done) {
            this.timeout(5000);

            const pm = new PluginManager(['simple', 'simple-plugins-test']);
            pm.index(function() {
                unitjs.array(pm.enabled).is([]);

                pm.boot(function() {
                    pm.message(function(err, responses) {
                        unitjs.object(responses)
                            .hasKey('simple-plugins-plugin/plugin-1', 'Hello from "simple-plugins-plugin/plugin-1".')
                            .notHasKey('simple-plugins-plugin/plugin-2')
                            .notHasKey('simple-plugins-plugin/plugin-3')
                            .hasKey('simple-plugins/example', 'Hello from "simple-plugins/example".');

                        done();
                    }, 'hello', {}, [
                        'simple-plugins-plugin/plugin-1',
                        'simple-plugins/example'
                    ], null);
                });
            }, true);
        });

        it('should send a message to a single specified plugin', function(done) {
            this.timeout(5000);

            const pm = new PluginManager(['simple', 'simple-plugins-test']);
            pm.index(function() {
                unitjs.array(pm.enabled).is([]);

                pm.boot(function() {
                    pm.message(function(err, responses) {
                        unitjs.object(responses)
                            .notHasKey('simple-plugins-plugin/plugin-1')
                            .notHasKey('simple-plugins-plugin/plugin-2')
                            .notHasKey('simple-plugins-plugin/plugin-3')
                            .hasKey('simple-plugins/example', 'Hello from "simple-plugins/example".');

                        done();
                    }, 'hello', {}, 'simple-plugins/example', null);
                });
            }, true);
        });

        it('should send a message and recieve data object', function(done) {
            this.timeout(5000);

            const pm = new PluginManager(['simple', 'simple-plugins-test']);
            pm.index(function() {
                unitjs.array(pm.enabled).is([]);

                pm.boot(function() {
                    pm.message(function(err, responses) {
                        unitjs.object(responses['simple-plugins-plugin/plugin-1'])
                            .hasKey('field1', 'value1')
                            .hasKey('field2', 'value2');

                        unitjs.object(responses['simple-plugins/example'])
                            .hasKey('field1', 'value1')
                            .hasKey('field2', 'value2');

                        done();
                    }, 'info', {}, [
                        'simple-plugins-plugin/plugin-1',
                        'simple-plugins/example'
                    ], null);
                });
            }, true);
        });

        it('should ignore unknown message ids', function(done) {
            this.timeout(5000);

            const pm = new PluginManager(['simple', 'simple-plugins-test']);
            pm.index(function() {
                unitjs.array(pm.enabled).is([]);

                pm.boot(function() {
                    pm.message(function(err, responses) {
                        unitjs.object(responses)
                            .notHasKey('simple-plugins-plugin/plugin-1')
                            .notHasKey('simple-plugins-plugin/plugin-2')
                            .notHasKey('simple-plugins-plugin/plugin-3')
                            .notHasKey('simple-plugins/example');

                        done();
                    }, 'something', {}, [
                        'simple-plugins-plugin/plugin-1',
                        'simple-plugins/example'
                    ], null);
                });
            }, true);
        });

        it('can send message without done callback', function(done) {
            this.timeout(5000);

            const pm = new PluginManager(['simple', 'simple-plugins-test']);
            pm.index(function() {
                unitjs.array(pm.enabled).is([]);

                pm.boot(function() {
                    pm.message(null, 'goodbye', {}, [
                        'simple-plugins-plugin/plugin-1',
                        'simple-plugins/example'
                    ], null);

                    done();
                });
            }, true);
        });
    });
});