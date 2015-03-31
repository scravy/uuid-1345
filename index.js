"use strict";

var sprintf = require('sprintf-js').sprintf;
var crypto = require('crypto');
var v1 = require('./lib/v1');
var v3 = require('./lib/named')('md5');
//var v4 = require('./lib/v4');
var v5 = require('./lib/named')('sha1');

// UUID class
var UUID = function (uuid) {
    
    var check = UUID.check(uuid);
    if (!check) {
        throw "not a UUID";
    }

    this.version = check.version;
    this.variant = check.variant;

    this[check.format] = uuid;
};

UUID.prototype.toString = function () {
    if (!this.ascii) {
        this.ascii = UUID.stringify(this.binary);
    }
    return this.ascii;
};

UUID.prototype.toBuffer = function () {
    if (!this.binary) {
        this.binary = UUID.parse(this.ascii);
    }
    return new Buffer(this.binary);
};

UUID.prototype.inspect = function () {
    return "UUID v" + this.version + " " + this.toString();
};

var hex2byte = {}; // lookup table hex to byte
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

    var func = func.bind(UUID);

    function handleResult(options, buffer) {

        // set version
        buffer[6] = (buffer[6] & 0x0f) | version;

        // set variant
        buffer[8] = (buffer[8] & 0x3f) | 0x80;

        switch (options.encoding) {
            case 'binary':
                return buffer;
            case 'object':
                return new UUID(buffer);
        }

        // turn buffer into string
        var uuid = uuidToString(buffer);
        
        if (options.case == 'upper') {
            uuid = uuid.toUpperCase();
        }

        return uuid;
    }

    return function (options, callback) {

        switch (typeof options) {
            case 'function':
                callback = options
                break;
            case 'string':
                options = { name: options };
                break;
            case 'object':
                break;
            default:
                options = {};
        }
        var sync = options.sync = typeof callback !== 'function';

        if (options.sync) {
            var result = func(options);
            if (typeof result === 'string') {
                throw new Error(result);
            }
            return handleResult(options, result);
        } else {
            setImmediate(function () {
                var result = func(options);
                if (typeof result === 'string') {
                    return callback(result);
                }
                callback(null, handleResult(options, result));
            });
        }
    };
}

function getVariant(bits) {
    // according to rfc4122#section-4.1.1
    switch (bits) {
        case 0: case 1: case 3:
            return 'ncs';
        case 4: case 5:
            return 'rfc4122';
        case 6:
            return 'microsoft';
        default:
            return 'future';
    }
}

UUID.check = function (uuid, offset) {

    if (typeof uuid === 'string') {
        uuid = uuid.toLowerCase();

        if (!/^[a-f0-9]{8}(\-[a-f0-9]{4}){3}\-([a-f0-9]{12})$/.test(uuid)) {
            return false;
        }

        if (uuid == "00000000-0000-0000-0000-000000000000") {
            return { version: undefined, variant: 'nil', format: 'ascii' };
        }

        return {
            version: (hex2byte[uuid[14] + uuid[15]] & 0xf0) >> 4,
            variant: getVariant((hex2byte[uuid[19] + uuid[20]] & 0xe0) >> 5),
            format: 'ascii'
        };
    }

    if (uuid instanceof Buffer) {
        offset = offset || 0;

        if (uuid.length < offset + 16) {
            return false;
        }

        for (var i = 0; i < 16; i++) {
            if (uuid[offset + i] !== 0) {
                break;
            }
        }
        if (i == 16) {
            return { version: undefined, variant: 'nil', format: 'binary' };
        }

        
        return {
            version: (uuid[offset + 6] & 0xf0) >> 4,
            variant: getVariant((uuid[offset + 8] & 0xe0) >> 5),
            format: 'binary'
        };
    }
};

// according to rfc4122#section-4.1.7
UUID.nil = new UUID("00000000-0000-0000-0000-000000000000");

// from rfc4122#appendix-C
UUID.namespace = {
    dns:  new UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8"),
    url:  new UUID("6ba7b811-9dad-11d1-80b4-00c04fd430c8"),
    oid:  new UUID("6ba7b812-9dad-11d1-80b4-00c04fd430c8"),
    x500: new UUID("6ba7b814-9dad-11d1-80b4-00c04fd430c8")
};

UUID.v1 = wrap(v1, 0x10);

UUID.v3 = wrap(v3, 0x30);

UUID.v4 = wrap(function () { return crypto.randomBytes(16); }, 0x40);

UUID.v5 = wrap(v5, 0x50);

module.exports = UUID;
