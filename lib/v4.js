var crypto = require('crypto');

module.exports = function (options, callback) {
    crypto.randomBytes(16, callback);
};
