const t = require('tcomb');

module.exports = t.struct({
  topic: t.String,
  data: t.Any,
});
