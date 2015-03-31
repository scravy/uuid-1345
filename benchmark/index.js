"use strict";

var control = require('async');
var shuffle = require('knuth-shuffle').knuthShuffle;
var UUID = require('../index');
var uuid2 = require('node-uuid');
var crypto = require('crypto');

function rng() {
    return crypto.randomBytes(16);
}

// Maps for number <-> hex string conversion
var _byteToHex = [];
var _hexToByte = {};
for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
}

// **`unparse()` - Convert UUID byte array (ala parse()) into a string**
function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
}

function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;

    if (typeof(options) == 'string') {
      buf = options == 'binary' ? new Buffer(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = rng();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
}

function uuidv4() {
    var buffer = crypto.randomBytes(16);
    buffer[6] = (buffer[6] & 0x0f) | 0x40;
    buffer[8] = (buffer[8] & 0x3f) | 0x80;

    return buffer.toString('hex', 0, 4) + '-' +
           buffer.toString('hex', 4, 6) + '-' +
           buffer.toString('hex', 6, 8) + '-' +
           buffer.toString('hex', 8, 10) + '-' +
           buffer.toString('hex', 10, 16);
}

function uuidv4_2() {
    var buffer = crypto.randomBytes(16);
    buffer[6] = (buffer[6] & 0x0f) | 0x40;
    buffer[8] = (buffer[8] & 0x3f) | 0x80;

    return unparse(buffer);
}

function sync(f, h, max, done) {
    for (var i = 0; i < max; i++) {
        h(f());
    }
    setImmediate(done);
}

function async(f, h, max, done) {
    function loop(count) {
        if (count < max) {
            f(function (err, result) {
                h(result);
                loop(count + 1);
            });
        } else {
            setImmediate(done);
        }
    }
    loop(0);
}

var reportTiming = true;
function timeEnd (name) {
    if (reportTiming) {
        console.timeEnd(name);
    }
}
function timed(name, func) {
    return function (done) {
        console.time(name);
        func(function () {
            timeEnd(name);
            done();
        });
    }
}

var opts = {
    name: "https://github.com/scravy/uuid-1345",
    namespace: UUID.namespace.url
};

var all = [];

function makeTasks(count, empty) {
    empty = empty || function () {};
    return [
        timed("v4 simple", sync.bind(null, uuidv4, empty, count)),
        timed("v4 simple 2", sync.bind(null, uuidv4_2, empty, count)),
        timed("v4 local node-uuid", sync.bind(null, v4, empty, count)),

        timed("v1 node-uuid", sync.bind(null, uuid2.v1, empty, count)),
        timed("v4 node-uuid", sync.bind(null, uuid2.v4, empty, count)),

        timed("v1 sync", sync.bind(null, UUID.v1, empty, count)),
        timed("v1 async", async.bind(null, UUID.v1, empty, count)),
        timed("v4 sync", sync.bind(null, UUID.v4, empty, count)),
        timed("v4 async", async.bind(null, UUID.v4, empty, count)),
        timed("v3 sync", sync.bind(null, UUID.v3.bind(null, opts), empty, count)),
        timed("v3 async", async.bind(null, UUID.v3.bind(null, opts), empty, count)),
        timed("v5 sync", sync.bind(null, UUID.v5.bind(null, opts), empty, count)),
        timed("v5 async", async.bind(null, UUID.v5.bind(null, opts), empty, count))
    ];
}

var warmUpTasks = makeTasks(1000);
var tasks = makeTasks(10000, function (uuid) { all.push(uuid); });

reportTiming = false;
control.waterfall(warmUpTasks, function (err, result) {

    setTimeout(function () {
        reportTiming = true;
        console.log("SEQUENTIAL\n");
        console.time("total");
        control.waterfall(tasks, function (err, result) {
            console.log("---------");
            console.timeEnd("total");
            console.log("");

            console.log("PARALLEL");
            console.time("total");
            reportTiming = false;
            control.parallel(tasks, function (err, result) {
                reportTiming = true;
                console.log("---------");
                console.timeEnd("total");
            });
        });
    }, 2000);
});
