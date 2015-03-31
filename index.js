var sprintf = require('sprintf-js').sprintf;

var UUID = {};

// according to rfc4122#section-4.1.7
UUID.nil = "00000000-0000-0000-0000-000000000000";

// from rfc4122#appendix-C
UUID.namespace = {
    dns: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    url: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
    oid: "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
    x500: "6ba7b814-9dad-11d1-80b4-00c04fd430c8"
};

var hex2byte = []; // lookup table hex to byte
for (var i = 0; i < 256; i++) {
    hex2byte[sprintf('%02x', i)] = i;
}

var byte2hex = []; // lookup table byte to hex
for (var i = 0; i < 256; i++) {
    byte2hex[i] = sprintf('%02x', i);
}

// format Buffer as string "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
function uuidToString(b) {
    var i = 0;
    return byte2hex[b[i++]] + byte2hex[b[i++]] +
           byte2hex[b[i++]] + byte2hex[b[i++]] + '-' +
           byte2hex[b[i++]] + byte2hex[b[i++]] + '-' +
           byte2hex[b[i++]] + byte2hex[b[i++]] + '-' +
           byte2hex[b[i++]] + byte2hex[b[i++]] + '-' +
           byte2hex[b[i++]] + byte2hex[b[i++]] +
           byte2hex[b[i++]] + byte2hex[b[i++]] +
           byte2hex[b[i++]] + byte2hex[b[i++]];
}
UUID.stringify = uuidToString;

// read stringified uuid into a Buffer
function parseUUID(string) {
    
    var buffer = new Buffer(16);
    var j = 0;
    for (var i = 0; i < 16; i++) {
        buffer[i] = hex2byte[string[j++] + string[j++]];
        if (i == 3 || i == 5 || i == 7 || i == 9) {
            j += 1;
        }
    }

    return buffer;
}
UUID.parse = parseUUID;

function wrap(func, version) {

    return function (options, callback) {

        if (typeof options === 'function') {
            callback = options;
            options = {};
        } else if (typeof options !== 'object') {
            options = {};
        }
        if (typeof callback !== 'function') {
            console.warn('no callback given');
            callback = function () {};
        }

        func.call(UUID, options, function (err, buffer) {

            if (err) {
                callback(err, null);
                return;
            }

            // set version
            buffer[6] = (buffer[6] & 0x0f) | (version << 4);

            // set variant
            buffer[8] = (buffer[8] & 0x3f) | 0x80;

            if (options.encoding === 'binary') {
                callback(null, buffer);
                return;
            }

            // turn buffer into string
            var uuid = uuidToString(buffer);
            
            if (options.case == 'upper') {
                uuid = uuid.toUpperCase();
            }

            callback(null, uuid);
        });
    };
}

function getVariant(bits) {
    // according to rfc4122#section-4.1.1
    if (bits < 4) {
        return 'ncs';
    } else if (bits < 6) {
        return 'rfc4122';
    } else if (bits < 7) {
        return 'microsoft';
    }
    return 'future';
}

UUID.v1 = wrap(require('./lib/v1'), 1);

UUID.v3 = wrap(require('./lib/named')('md5'), 3);

UUID.v4 = wrap(require('./lib/v4'), 4);

UUID.v5 = wrap(require('./lib/named')('sha1'), 5);

UUID.check = function (uuid, offset) {

    if (typeof uuid === 'string') {
        uuid = uuid.toLowerCase();

        if (!/^[a-f0-9]{8}(\-[a-f0-9]{4}){3}\-([a-f0-9]{12})$/.test(uuid)) {
            return false;
        }

        if (uuid == module.exports.nil) {
            return { version: undefined, variant: 'nil' };
        }

        return {
            version: (hex2byte[uuid[14] + uuid[15]] & 0xf0) >> 4,
            variant: getVariant((hex2byte[uuid[19] + uuid[20]] & 0xe0) >> 5)
        };
    }

    if (uuid instanceof Buffer) {
        offset = offset || 0;

        if (uuid.length < offset + 16) {
            return false;
        }

        for (var i = 0; i < 16; i++) {
            if (buffer[offset + i] !== 0) {
                return { version: undefined, variant: 'nil' };
            }
        }
        
        return {
            version: (uuid[6] & 0xf0) >> 4,
            variant: getVariant((uuid[8] & 0xe0) >> 5)
        };
    }
};

module.exports = UUID;
