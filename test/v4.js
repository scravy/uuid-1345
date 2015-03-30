var assert = require('assert');
var UUID = require("../index");

describe("v4 - random", function () {

    it("generates a v4 UUID", function (done) {
        UUID.v4(function (err, result) {
            assert.equal(UUID.check(result).version, 4);
            assert.equal(UUID.check(result).variant, 'rfc4122');
            done();
        });
    });

});
