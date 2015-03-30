var crypto = require('crypto');

var invalidNamespace =
  'options.namespace must be a string or a Buffer containing a valid UUID';

var invalidName =
  'options.name must be either a string or a Buffer';

module.exports = function (hashFunc) {
    
    return function namedUUID(options, callback) {
        var hash = crypto.createHash(hashFunc);

        var namespace = options.namespace;
        var name = options.name;

        if (typeof namespace === 'string') {
            if (!this.check(namespace)) {
                callback(invalidNamespace, null);
                return;
            }
            namespace = this.parse(namespace);
        } else if (!(namespace instanceof Buffer) || namespace.length !== 16) {
            callback(invalidNamespace, null);
            return;
        }

        if (typeof name !== 'string' && !(name instanceof Buffer)) {
            callback(invalidName, null);
            return;
        }

        hash.update(namespace);
        hash.update(options.name, typeof name === 'string' ? 'utf8' : 'binary');

        var buffer = hash.digest();

        callback(null, buffer);
    };

};
