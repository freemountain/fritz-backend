const chai = require('chai');
const flyd = require('flyd');
const { split, merge, collectPromises } = require('./../src/streams.js');
const { defer } = require('./../src/promise');
const { Left, Right } = require('folktale/data/either');

const expect = chai.expect;

describe('streams#split', () => {
  it('split values from object to streams', () => {
    const input = flyd.stream({
      a: '1',
      b: '2',
    });

    const outputs = split(['a', 'b'], input);

    expect(outputs).to.be.an('array');
    expect(outputs).to.have.lengthOf(2);
    expect(outputs[0]()).to.equal('1');
    expect(outputs[1]()).to.equal('2');
  });

  it('filter undefined keys', () => {
    const input = flyd.stream({
      a: '1',
      b: '2',
    });

    const outputs = split(['a', 'b'], input);

    input({ a: '3' });
    expect(outputs[0]()).to.equal('3');
    expect(outputs[1]()).to.equal('2');
  });
});

describe('streams#merge', () => {
  it('merge streams', () => {
    const input = flyd.stream({
      a: '1',
      b: '2',
    });
    const streams = split(['a', 'b'], input);
    const merged = merge(['a', 'b'], streams);

    expect(merged()).to.deep.equals({
      a: '1',
      b: '2',
    });
  });

  it('dosent fail undefined keys', () => {
    const input = flyd.stream({
      a: '1',
      b: '2',
    });

    const streams = split(['a', 'b'], input);
    const merged = merge(['a', 'b'], streams);

    input({ a: '3' });
    expect(merged()).to.deep.equals({
      a: '3',
      b: '2',
    });
  });
});

describe('collectPromises', () => {
  it('', () => {
    const d0 = defer();
    const d1 = defer();
    const d2 = defer();
    const end = defer();
    const collected = [];
    const stream = collectPromises([
      d0.promise,
      d1.promise,
      d2.promise,
    ]);

    flyd.on(v => collected.push(v), stream);
    flyd.on(end.resolve, stream.end);

    expect(stream()).to.equal(undefined);

    setTimeout(() => d1.resolve(1), 1);
    setTimeout(() => d0.reject(0), 5);
    setTimeout(() => d2.resolve(2), 10);

    return end.promise.then(() => {
      expect(collected).to.deep.equal([
        [Right(1)],
        [Right(1), Left(0)],
        [Right(1), Left(0), Right(2)],
      ]);
    });
  });
});
