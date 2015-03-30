var assert = require('assert');
var UUID = require("../index");

describe("v3 - name based with MD5", function () {

    it("generates the correct uuid for `http://github.com`", function (done) {
        UUID.v3({
            namespace: UUID.namespace.url,
            name: 'http://github.com' 
        }, function (err, result) {
            assert.equal(result, '730433f1-7c3e-3939-a0c4-9c066e699799');
            done();
        });
    });

});

