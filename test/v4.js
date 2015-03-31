var assert = require('assert');
var UUID = require("../index");

describe("v4 - random", function () {

    it("generates a v4 UUID (async)", function (done) {
        UUID.v4(function (err, result) {
            assert.equal(UUID.check(result).version, 4);
            assert.equal(UUID.check(result).variant, 'rfc4122');
            done();
        });
    });

    it("generates a v4 UUID (sync)", function () {
        assert.equal(UUID.check(UUID.v4()).version, 4);
    });


});

