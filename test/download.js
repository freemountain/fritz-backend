const chai = require('chai');
const mockery = require('mockery');
const flyd = require('flyd');

const reqMock = require('./mocks/request-promise');
const { defer } = require('./../src/promise');

const expect = chai.expect;

describe('download util', () => {
  let dl;

  before(() => {
    mockery.enable({ useCleanCache: true });
    mockery.warnOnUnregistered(false);
    mockery.registerMock('request-promise-native', reqMock({
      'http://foo.com': 'foo',
      'http://bar.com': 'bar',
      'http://baz.com': 'baz',
    }));

    dl = require('./../src/download');
  });

  after(mockery.deregisterAll);

  it('downloadAll', () => {
    const stream = dl.downloadAll(data => data, ['http://bar.com', 'http://foo.com']);
    const end = defer();
    flyd.on(end.resolve, stream.end);

    return end.promise.then(() => {
      const result = stream();

      expect(result[0].value).to.equal('bar');
      expect(result[1].value).to.equal('foo');
    });
  });

  it('downloadAllStream', () => {
    const input = flyd.stream();
    const output = dl.downloadAllStream(i => i, input);

    input(['http://foo.com', 'http://bar.com']);

    return new Promise((resolve) => {
      setTimeout(() => {
        const current = output();

        expect(current[0].value).to.equal('foo');
        expect(current[1].value).to.equal('bar');

        input(['http://bar.com', 'http://baz.com']);
        resolve();
      }, 10);
    }).then(() => {
      const end = defer();

      setTimeout(() => {
        const current = output();

        expect(current[0].value).to.equal('bar');
        expect(current[1].value).to.equal('baz');

        end.resolve();
      }, 10);

      return end.promise;
    });
  });
});
