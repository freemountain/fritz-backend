const R = require('ramda');
const flyd = require('flyd');
const t = require('tcomb');

const parseM3U = require('./../parseM3U');
const Source = require('./../types/Source');
const { downloadAllStream } = require('./../download');

const Options = t.dict(t.String, t.struct({
  url: t.String,
}));

module.exports = function playlist(input) {
  return R.pipe(
    flyd.map(Options),
    flyd.map(R.toPairs),
    flyd.map(pairs => pairs.map(([key, { url }]) => url)),
    downloadAllStream((data) => {
      const streams = parseM3U(data);

      return Source({
        name: 'some playlist',
        streams,
      });
    })
  )(input);
};
