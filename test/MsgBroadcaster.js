const chai = require('chai');
const flyd = require('flyd');

const { defer, either, wait } = require('./../src/promise.js');

const MsgBroadcaster = require('./../src/MsgBroadcaster');
const expect = chai.expect;

describe('MsgBroadcaster', () => {
  it('caches messages', () => {
    const br = new MsgBroadcaster(['cached']);
    const consumerA = flyd.stream();
    const consumerB = flyd.stream();
    const producer = flyd.stream();

    br.addConsumer(consumerA);
    br.addProducer(producer);

    producer({
      topic: 'foo',
      data: 42,
    });

    return wait(10)
      .then(() => {
        expect(consumerA().data).to.equal(42);

        producer({
          topic: 'cached',
          data: 100,
        });

        br.addConsumer(consumerB);

        return wait(10);
      })
      .then(() => {
        expect(consumerA().data).to.equal(100);
        expect(consumerB().data).to.equal(100);
      })
    ;
  });

  it('rejects other values messages', () => {
    const br = new MsgBroadcaster([]);
    const consumer = flyd.stream();
    const producer = flyd.stream();

    br.addConsumer(consumer);
    br.addProducer(producer);

    producer('invalidMsg');

    return wait(10)
      .then(() => {
        expect(consumer()).to.equal(undefined);
        expect(br.error()).to.be.an.instanceof(TypeError);
      })
    ;
  });
});
