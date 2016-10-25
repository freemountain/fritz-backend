const t = require('tcomb');

const Stream = require('./Stream');

module.exports = t.struct({
  name: t.String,
  streams: t.list(Stream),
});
