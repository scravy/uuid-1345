var assert = require('assert');
var macaddress = require('node-macaddress');
var UUID = require("../index");

describe("UUID.v1", function () {

    it("generates a v1 UUID (async)", function (done) {
        UUID.v1(function (err, result) {
            assert.equal(UUID.check(result).version, 1);
            done();
        });
    });

    it("generates a v1 UUID (sync)", function () {
        assert.equal(UUID.check(UUID.v1()).version, 1);
    });
 
    it("uses the MAC address", function (done) {
        macaddress.one(function (err, addr) {
            assert.equal(addr.replace(/:/g, ""), UUID.v1().substring(24));
            done();
        });
    });
    
    it("uses the specified MAC address", function (done) {
        UUID.v1({ mac: 'ab:cd:ef:00:47:11' }, function (err, result) {
            assert.equal('abcdef004711', result.substring(24));
            done();
        });
    });
});
