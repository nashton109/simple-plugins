/**
 * @todo
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Find this modules package file.
 *
 * @return {Boolean|Object} Returns either this modules package object, or
 *   false if it couldn't be found.
 */
module.exports = function() {
    const root = module.exports.packageRootDirectory();
    return require(path.join(root, 'package.json'));
};

/**
 * Attempt to find the root directoy of this module.
 *
 * @return {Boolean|String} Returns either the path, or false.
 */
module.exports.packageRootDirectory = function() {
    const dir = __dirname.split(path.sep);
    var root = false;

    while (dir.length) {
        try {
            if (!(dir[dir.length - 1] === 'simple-plugins' && dir[dir.length - 2] === 'node_modules')) {
                fs.lstatSync(path.join(dir.join(path.sep), 'package.json')).isFile();

                root = path.join(dir.join(path.sep));
                break;
            }
        } catch (err) {}
        dir.pop();
    }

    return root;
};