(function () { "use strict";

var crypto = require('crypto');

var invalidNamespace =
  'options.namespace must be a string or a Buffer ' +
  'containing a valid UUID, or a UUID object';

var invalidName =
  'options.name must be either a string or a Buffer';

module.exports = function (hashFunc) {
    
    return function namedUUID(options) {
        var hash = crypto.createHash(hashFunc);

        var namespace = options.namespace || this.nil;
        var name = options.name;

        if (typeof namespace === 'string') {
            if (!this.check(namespace)) {
                return invalidNamespace;
            }
            namespace = this.parse(namespace);
        } else if (namespace instanceof this) {
            namespace = namespace.toBuffer();
        } else if (!(namespace instanceof Buffer) || namespace.length !== 16) {
            return invalidNamespace;
        }

        var nameIsNotAString = typeof name !== 'string';
        if (nameIsNotAString && !(name instanceof Buffer)) {
            return invalidName;
        }

        hash.update(namespace);
        hash.update(options.name, nameIsNotAString ? 'binary' : 'utf8');

        var buffer = hash.digest();

        return buffer;
    };
};

}());
