uuid-1345
==========

[![Build Status](https://travis-ci.org/scravy/uuid-1345.svg?branch=master)](https://travis-ci.org/scravy/uuid-1345)

Generate UUIDs of versions 1, 3, 4, and 5.

    npm install --save uuid-1345


Examples
--------

```JavaScript
var UUID = require('uuid-1345');

UUID.v1(function (err, result) {
    console.log("Generated a time-based UUID:\n\t%s\n", result);
});

UUID.v4(function (err, result) {
    console.log("Generated a random UUID:\n\t%s\n", result);
});

UUID.v3({
    namespace: UUID.namespace.url,
    name: "https://github.com/scravy/uuid-1345"
}, function (err, result) {
    console.log("Generated a name-based UUID using MD5:\n\t%s\n", result);
});

UUID.v5({
    namespace: UUID.namespace.url,
    name: "https://github.com/scravy/uuid-1345"
}, function (err, result) {
    console.log("Generated a name-based UUID using SHA1:\n\t%s\n", result);
});

```

might result in:

    Generated a time-based UUID:
        9e3a0460-d72d-11e4-a631-c8e0eb141dab

    Generated a random UUID:
        366a77ba-d506-4a03-a730-318b8e6be8c5
                
    Generated a name-based UUID using MD5:
        2c1d43b8-e6d7-376e-af7f-d4bde997cc3f

    Generated a name-based UUID using SHA1:
        39888f87-fb62-5988-a425-b2ea63f5b81e


API
---

```JavaScript
UUID.vX([options], callback);
```

where `vX` is one of `v1`, `v3`, `v4`, or `v5`.

---

### `UUID.v1([options], callback)`

Generates a time based UUID. Note that you can not generate more than
10000 UUIDs per second. Should this (highly unlikely) scenario happen,
the uuid generator will automatically postpone your request until new UUIDs
are available.

#### Options:

**`mac: false | string | Buffer`**

By default this generator will try to use your mac address (the mac address
of your primary network interface). It does so using
[node-macaddress](https://www.npmjs.com/package/node-macaddress). If it can
not obtain your MAC address it will generate a random value according to
[RFC 4122 § 4.5](http://tools.ietf.org/html/rfc4122#section-4.5) and keep that
as node id during the lifetime of your process.

The latter behaviour can be enforced by specifying `{ mac: false }`.

It is also possible to provide a cusom MAC address: `{ mac: 'ac:00:00:ac:ff:ff' }`.

The MAC address can also be specified as a `Buffer` of 6 bytes.

---

### `UUID.v4(callback)`

Generates a random, version 4, UUID. Does not take any options.

---

### `UUID.v3(options, cb)` / `UUID.v5(options, cb)`

#### Options

Generates a name-based UUID based on a namespace-UUID and an arbitrary name.
Both `name` and `namespace` are required options.

**`namespace: uuid as (string | Buffer)`**

This must be a valid UUID. A few pre-defined namespaces are available in `UUID.namespace`:

```JavaScript
// from rfc4122#appendix-C
UUID.namespace = {
    dns:  "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    url:  "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
    oid:  "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
    x500: "6ba7b814-9dad-11d1-80b4-00c04fd430c8"
};
```

**`name: string | Buffer`**

This can be an arbitrary value (including the empty string).

More API
--------

```JavaScript
UUID.check(uuid) → { version: number, variant: string }
UUID.parse(uuid as string) → uuid as Buffer
UUID.stringify(uuid as Buffer) → uuid as string
```
