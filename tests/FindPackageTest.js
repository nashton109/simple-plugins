/**
 * Provides the tests for the FindPackage function.
 *
 * @author Orgun109uk <orgun109uk@gmail.com>
 */

'use strict';

const unitjs = require('unit.js');

const findPackage = require('../lib/FindPackage');

/** @test {FindPackage} */
describe('FindPackage', () => {
    it('should sort array by key', () => {
        const pkg = findPackage();

        unitjs.object(pkg).hasKey('name', 'simple-plugins');
    });
});