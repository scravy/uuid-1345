var sprintf = require('sprintf-js').sprintf;
var crypto = require('crypto');


module.exports = function v1(options) {

    var nodeId = options.mac;
    if (nodeId === undefined) {
        if (!macAddressLoaded && !options.sync) {
            setImmediate(module.exports.bind(this, options));
            return;
        }
        return uuidv1(macAddress, options);
    }
    if (nodeId === false) {
        return uuidv1(randomHost, options);
    }
    if (nodeId instanceof Buffer) {
        if (buffer.length !== 6) {
            callback(invalidMacAddress, null);
            return;
        }
        return uuidv1(nodeId, options);
    }
    if (macRegex.test(nodeId)) {
        return uuidv1(parseMACAddress(nodeId.toLowerCase()), options);
    }
    return invalidMacAddress;
};
