var assert = require('assert');
var UUID = require("../index");

describe("v1 - time based", function () {

    it("generates a v1 UUID", function (done) {
        UUID.v1(function (err, result) {
            assert.equal(UUID.check(result).version, 1);
            done();
        });
    });

});
