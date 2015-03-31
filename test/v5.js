var assert = require('assert');
var UUID = require("../index");

describe("v5 - name based with SHA1", function () {

    it("generates a v5 UUID (async)", function (done) {
        UUID.v5({
            name: "something",
            namespace: UUID.v4()
        }, function (err, result) {
            assert.equal(UUID.check(result).version, 5);
            done();
        });
    });

    it("generates a v5 UUID (sync)", function () {
        assert.equal(UUID.check(UUID.v5({ name: "something", namespace: UUID.v4() }).version, 5));
    });


    it("generates the correct uuid for `http://github.com`", function (done) {
        UUID.v5({
            namespace: UUID.namespace.url,
            name: 'http://github.com' 
        }, function (err, result) {
            assert.equal(result, 'f297a1ff-0099-5cd3-9a84-7ca20ceeeded');
            done();
        });
    });

});

