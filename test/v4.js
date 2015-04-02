var assert = require('assert');
var UUID = require("../index");

describe("UUID.v4", function () {

    it("generates a v4 UUID (async)", function (done) {
        UUID.v4(function (err, result) {
            assert.equal(UUID.check(result).version, 4);
            assert.equal(UUID.check(result).variant, 'rfc4122');
            done();
        });
    });

    it("generates a v4 UUID (sync)", function () {
        var uuid = UUID.v4();
        assert.equal(UUID.check(uuid).version, 4);
        assert.equal(UUID.check(uuid).variant, 'rfc4122');

    });

    it("generates a v4 UUID (fast)", function () {
        var uuid = UUID.v4fast();
        assert.equal(UUID.check(uuid).version, 4);
        assert.equal(UUID.check(uuid).variant, 'rfc4122');
    });

});

