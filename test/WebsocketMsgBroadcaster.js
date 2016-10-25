const chai = require('chai');
const flyd = require('flyd');
const getPort = require('get-port');
const WebSocket = require('ws');

const { defer, wait } = require('./../src/promise.js');
const WebsocketMsgBroadcaster = require('./../src/WebsocketMsgBroadcaster');

const expect = chai.expect;

const createWSClient = (url) => {
  const client = new WebSocket(url);
  const d = defer();

  client.on('open', () => d.resolve(client));
  client.on('error', d.reject);

  return d.promise;
};

describe('WebsocketMsgBroadcaster', () => {
  let port;

  before(() => getPort().then((p) => {
    port = p;
  }));

  it('broadcasts', () => {
    const br = new WebsocketMsgBroadcaster({ port });
    const consumer = flyd.stream();
    const producer = flyd.stream();
    const messages = [];
    let client;

    br.addConsumer(consumer);
    br.addProducer(producer);

    return createWSClient(`ws://127.0.0.1:${port}`)
      .then((c) => {
        client = c;

        client.on('message', (msg) => {
          messages.push(msg);
        });

        client.send('{ "topic": "foo", "data": 34}');

        return wait(10);
      })
      .then(() => {
        expect(consumer().data).to.equal(34);

        producer({
          topic: 'bar',
          data: 'baz',
        });

        return wait(10);
      })
      .then(() => {
        const last = messages[messages.length - 1];
        expect(last).to.equal('{"topic":"bar","data":"baz"}');
      })
    ;
  });
});
