var crypto = require('crypto');

module.exports = function (options, callback) {
    if (options.sync) {
        callback(null, crypto.randomBytes(16));
    } else {
        crypto.randomBytes(16, callback);
    }
};
