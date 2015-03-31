var assert = require('assert');
var UUID = require("../index");

var sample = '730433f1-7c3e-3939-a0c4-9c066e699799';

describe('UUID class', function () {
    
    it('correctly reports version and variant', function () {
        var uuid = new UUID(sample);

        assert.equal(uuid.version, 3);
        assert.equal(uuid.variant, 'rfc4122');
    });
     
    it('instanceof works', function () {
        var uuid = new UUID(sample);

        assert(uuid instanceof UUID);
    });
});

describe('UUID.prototype.toString()', function () {
     
    it('reports correct UUID for ascii UUID', function () {
        var uuid = new UUID(sample);

        assert.equal(uuid.toString(), sample);
    });

    it('reports correct UUID for binary UUID', function () {
        var uuid = new UUID(UUID.parse(sample));

        assert.equal(uuid.toString(), sample);
    });
});

describe('UUID.prototype.toBuffer()', function () {

    it('reports correct UUID for ascii UUID', function () {
        var uuid = new UUID(sample);

        assert.equal(UUID.stringify(uuid.toBuffer()), sample);
    });

    it('reports correct UUID for binary UUID', function () {
        var uuid = new UUID(UUID.parse(sample));

        assert.equal(UUID.stringify(uuid.toBuffer()), sample);
    });
});
