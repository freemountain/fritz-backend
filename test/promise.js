const chai = require('chai');
const { Left, Right } = require('folktale/data/either');
const { defer, either, streamPromise } = require('./../src/promise.js');

const expect = chai.expect;

describe('promise utils', () => {
  it('either wraps promise in Either', () => {
    const resolved = defer().resolve(0);
    const rejected = defer().reject(-1);
    const right = either(resolved);
    const left = either(rejected);

    return Promise.all([right, left]).then(([r, l]) => {
      expect(r.isRight).to.equal(true);
      expect(l.isLeft).to.equal(true);

      expect(r.value).to.equal(0);
      expect(l.value).to.equal(-1);
    });
  });

  it('streamPromise streams promise wrapped in Either', () => {
    const resolved = defer();
    const rejected = defer();
    const rightStream = streamPromise(resolved.promise);
    const leftStream = streamPromise(rejected.promise);

    expect(rightStream()).to.equal(undefined);
    expect(leftStream()).to.equal(undefined);

    resolved.resolve(1);
    rejected.reject(-1);

    return Promise.all([resolved.promise, rejected.promise.catch(() => 0)]).then(() => {
      expect(rightStream()).to.deep.equal(Right(1));
      expect(leftStream()).to.deep.equal(Left(-1));
    });
  });
});
