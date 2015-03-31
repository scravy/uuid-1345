var getMAC = require('node-macaddress').one;
var sprintf = require('sprintf-js').sprintf;
var crypto = require('crypto');

var invalidMacAddress =
  "invalid options.mac - must either not be set, the value `false`, " +
  "a Buffer of length 6, or a MAC address as a string";

var moreThan10000 = "can not generate more than 10000 UUIDs per second";

var hex2byte = []; // lookup table hex to byte
for (var i = 0; i < 256; i++) {
    hex2byte[sprintf('%02x', i)] = i;
}

function parseMACAddress(address) {
    var buffer = new Buffer(6);
    buffer[0] = hex2byte[address[0] + address[1]];
    buffer[1] = hex2byte[address[3] + address[4]];
    buffer[2] = hex2byte[address[6] + address[7]];
    buffer[3] = hex2byte[address[9] + address[10]];
    buffer[4] = hex2byte[address[12] + address[13]];
    buffer[5] = hex2byte[address[15] + address[16]];
    return buffer;
}

// Node ID according to rfc4122#section-4.5
var randomHost = crypto.randomBytes(16);
randomHost[0] = randomHost[0] | 0x01;

// the mac address of this host (filled in later)
var macAddress = randomHost;
var macAddressLoaded = false;

getMAC(function (err, result) {
    if (err) {
        macAddress = randomHost;
    } else {
        macAddress = parseMACAddress(result);
    }
    macAddressLoaded = true;
});

var clockSeq = process.pid & 0x3fff;

var lastMTime = 0;
var lastNTime = 0;

var macRegex = /^[a-fA-F0-9]{2}(:[a-fA-F0-9]{2}){5}$/;

function uuidv1(nodeId, options, callback) {

    var mTime = Date.now();
    var nTime = lastNTime + 1;
    var delta = (mTime - lastMTime) + (nTime - lastNTime) / 10000;

    var myClockSeq = clockSeq;

    if (delta < 0) {
        myClockSeq = (myClockSeq + 1) & 0x3fff;
        nTime = 0;
    } else if (mTime > lastMTime) {
        nTime = 0
    } else if (nTime >= 10000) {
        if (options.sync) {
            callback(moreThan10000, null);
        } else {
            process.nextTick(uuidv1.bind(null, nodeId, callback));
        }
        return;
    }

    lastMTime = mTime;
    lastNTime = nTime;
    clockSeq = myClockSeq;

    // unix timestamp to gregorian epoch as per rfc4122#section-4.5
    mTime += 12219292800000;

    var buffer = new Buffer(16);

    var i = 0;
    var timeLow = ((mTime & 0xfffffff) * 10000 + nTime) % 0x100000000;
    var timeHigh = (mTime / 0x100000000 * 10000) & 0xfffffff;

    buffer[i++] = timeLow >>> 24 & 0xff;
    buffer[i++] = timeLow >>> 16 & 0xff;
    buffer[i++] = timeLow >>> 8 & 0xff;
    buffer[i++] = timeLow & 0xff;

    buffer[i++] = timeHigh >>> 8 & 0xff;
    buffer[i++] = timeHigh & 0xff;

    buffer[i++] = timeHigh >>> 24 & 0xff;
    buffer[i++] = timeHigh >>> 16 & 0xff;

    buffer[i++] = myClockSeq >>> 8;
    buffer[i++] = myClockSeq & 0xff;

    for (var j = 0; j < 6; j++) {
        buffer[i + j] = nodeId[j];
    }

    callback(null, buffer);
}

module.exports = function v1(options, callback) {

    var nodeId = options.mac;
    if (nodeId === undefined) {
        if (!macAddressLoaded && !options.sync) {
            setImmediate(module.exports.bind(this, options, callback));
            return;
        }
        uuidv1(macAddress, options, callback);
        return;
    }
    if (nodeId === false) {
        uuidv1(randomHost, options, callback);
        return;
    }
    if (nodeId instanceof Buffer) {
        if (buffer.length !== 6) {
            callback(invalidMacAddress, null);
            return;
        }
        uuidv1(nodeId, options, callback);
        return;
    }
    if (macRegex.test(nodeId)) {
        uuidv1(parseMACAddress(nodeId.toLowerCase()), options, callback);
        return;
    }
    callback(invalidMacAddress, null);
};
