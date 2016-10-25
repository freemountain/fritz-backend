const flyd = require('flyd');
const Either = require('folktale/data/either');

function either(promise) {
  return promise
    .then(v => Either.Right(v))
    .catch(v => Either.Left(v));
}

function streamPromise(promise) {
  const out = flyd.stream();

  either(promise)
    .then(out)
    .then(() => out.end(true))
    ;

  return out;
}

function defer() {
  let resolve;
  let reject;
  let promise;

  const f = handler => (value) => {
    handler(value);

    return promise;
  };

  promise = new Promise((res, rej) => {
    resolve = f(res);
    reject = f(rej);
  });

  return { promise, resolve, reject };
}

function wait(t) {
  const d = defer();

  setTimeout(d.resolve, t);
  return d.promise;
}

module.exports = {
  defer,
  wait,
  either,
  streamPromise,
};
