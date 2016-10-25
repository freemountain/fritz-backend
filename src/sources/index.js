const R = require('ramda');
const flyd = require('flyd');
const filter = require('flyd/module/filter');

const { split } = require('./../streams');
const playlistSource = require('./playlist');
const repeaterSource = require('./avm-repeater');

module.exports = () => {
  const options = flyd.stream({
    repeater: {},
    playlist: {
      foo: {
        url: 'http://169.254.1.1/dvb/m3u/tvsd.m3u',
      },
    },
  });
  const keys = [
    'repeater',
    'playlist',
  ];
  const sourceFactories = [
    repeaterSource,
    playlistSource,
  ];
  const splitted = split(keys, options);

  const sources = R.pipe(
    R.zip(splitted),
    R.map(([input, f]) => f(input))
  )(sourceFactories);

  return R.pipe(
    flyd.combine(() => sources.map(source => source())),
    flyd.map(results => results
      .reduce((all, current) => all.concat(current), [])
      .filter((either) => {
        if (either.isRight) return true;

        console.error('Source Error: ', either.value);
        return false;
      })
      .map(either => either.value)
    )
  )(sources);
};
