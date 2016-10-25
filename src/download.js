const R = require('ramda');
const flyd = require('flyd');

const request = require('request-promise-native');
const mergeAll = require('flyd/module/mergeall');
const switchLatest = require('flyd/module/switchlatest');

const { streamPromise } = require('./promise');
const { collect } = require('./streams');

const downloadAll = R.curry((transform, urls) => {
  const download = url => R.pipe(
    request,
    promise => promise.then(data => transform(data, url)),
    streamPromise
  )(url);

  return R.pipe(
    R.map(download),
    mergeAll,
    collect
  )(urls);
});

const downloadAllStream = R.curry((transform, urlStream) => {
  const dls = flyd.map(downloadAll(transform), urlStream);

  return switchLatest(dls);
});

module.exports = {
  downloadAll,
  downloadAllStream,
};
