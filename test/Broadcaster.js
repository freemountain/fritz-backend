const chai = require('chai');
const flyd = require('flyd');

const { defer, either, wait } = require('./../src/promise.js');
const Broadcaster = require('./../src/Broadcaster');
const expect = chai.expect;

describe('Broadcaster', () => {
  it('broadcast messages', () => {
    const br = new Broadcaster();
    const consumerA = flyd.stream();
    const consumerB = flyd.stream();
    const producerA = flyd.stream();
    const producerB = flyd.stream();

    br.addConsumer(consumerA);
    br.addProducer(producerA);

    producerA(100);

    return wait(10)
      .then(() => {
        expect(consumerA()).to.equal(100);

        br.addConsumer(consumerB);

        producerA(200);

        return wait(10);
      })
      .then(() => {
        expect(consumerA()).to.equal(200);
        expect(consumerB()).to.equal(200);

        br.addProducer(producerB);

        producerB(300);

        return wait(10);
      })
      .then(() => {
        expect(consumerA()).to.equal(300);
        expect(consumerB()).to.equal(300);

        br.removeConsumer(consumerA);

        producerA(400);

        return wait(10);
      })
      .then(() => {
        expect(consumerA()).to.equal(300);
        expect(consumerB()).to.equal(400);
      })
    ;
  });
});
