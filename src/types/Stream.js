const t = require('tcomb');

module.exports = t.struct({
  url: t.String,
  title: t.maybe(t.String),
  channel: t.maybe(t.String),
  vlc: t.maybe(t.dict(t.String, t.Any)),
});
