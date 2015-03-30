var crypto = require('crypto');

module.exports = function (hashFunc) {
    
    return function namedUUID(options, callback) {
        var hash = crypto.createHash(hashFunc);

        if (typeof options !== 'object') {
            callback('options must be an object with .name and .namespace', null);
            return;
        }
        var namespace = options.namespace;
        var name = options.name;

        if (typeof namespace === 'string') {
            if (!this.check(namespace)) {
                callback('options.namespace must be a valid UUID', null);
                return;
            }
            namespace = this.parse(namespace);
        } else if (namespace instanceof Builder) {
            if (namespace.length !== 16) {
                callback('options.namespace must have 128 bits', null);
                return;
            }
        }

        hash.update(namespace);
        hash.update(options.name);

        var buffer = hash.digest();

        callback(null, buffer);
    };

};
