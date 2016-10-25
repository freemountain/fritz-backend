const R = require('ramda');
const flyd = require('flyd');
const filterStream = require('flyd/module/filter');

const { either } = require('./promise');

function split(keys, input) {
  const get = k => v => v[k];
  const has = k => v => Object.prototype.hasOwnProperty.call(v, k);

  return R.map(key => flyd.map(get(key), filterStream(has(key), input)), keys);
}

const mapKey = (key, stream) => flyd.map(value => [key, value], stream);
const getValues = streams => R.map(stream => stream(), streams);

function merge(keys, streams) {
  const mapped = R
    .zip(keys, streams)
    .map(([key, stream]) => mapKey(key, stream));

  return flyd.combine(() => R.fromPairs(getValues(mapped)), mapped);
}

function collect(stream) {
  const items = [];

  return flyd.map((item) => {
    items.push(item);

    return items.slice();
  }, stream);
}

function collectPromises(promises) {
  const out = flyd.stream();
  const mapped = promises.map(promise => either(promise).then(out));

  Promise.all(mapped).then(() => out.end(true));

  return collect(out);
}

const unEither = flyd.curryN(2, (errorStream, eitherStream) => flyd.combine((s, self) => {
  const either = s();
  if (either.isLeft) {
    errorStream(either.value);
    return;
  }

  self(either.value);
  return;
}, [eitherStream]));

module.exports = {
  split,
  merge,
  collect,
  collectPromises,
  unEither,
};
