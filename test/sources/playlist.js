const chai = require('chai');
const flyd = require('flyd');
const mockery = require('mockery');
const fs = require('fs');
const reqMock = require('./../mocks/request-promise');
const { wait } = require('./../../src/promise');

const expect = chai.expect;

let playlist;

const options = {
  someM3U: {
    url: 'http://192.168.0.3/pl.m3u',
  },
  other: {
    url: 'http://192.168.0.3/pl.m3u',
  },
};

describe('playlist source', () => {
  before(() => {
    mockery.deregisterAll();
    mockery.resetCache();
    mockery.enable({ useCleanCache: true });
    mockery.warnOnUnregistered(false);
    mockery.registerMock('request-promise-native', reqMock({
      'http://192.168.0.3/pl.m3u': fs.readFileSync(`${__dirname}/../fixtures/pl.m3u`, 'utf8'),
    }));

    playlist = require('./../../src/sources/playlist');
  });

  after(mockery.deregisterAll);

  it('split values from object to streams', () => {
    const optStream = flyd.stream();
    const pl = playlist(optStream);

    optStream(options);

    return wait(10).then(() => {
      const result = pl();

      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(2);
      expect(result[0].isRight).to.equal(true);
      expect(result[1].isRight).to.equal(true);

      const listA = result[0].value;
      const listB = result[1].value;

      expect(listA.streams).to.have.lengthOf(6);
      expect(listB.streams).to.have.lengthOf(6);
    });
  });
});
