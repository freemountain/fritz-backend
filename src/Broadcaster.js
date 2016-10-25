const flyd = require('flyd');
const Either = require('folktale/data/either');

const parseJson = (data) => {
  // let json;

  try {
    const json = JSON.parse(data);

    return Either.Right(data);
  } catch (e) {
    return Either.Left(e);
  }
};

const streamEither = (leftStream, rightStream, either) => {
  if (either.isLeft) {
    return leftStream(either.value);
  }

  rightStream(either.value);

  const stream = either.isLeft ? leftStream : rightStream;

  return stream(either.value);
};

module.exports = class Broadcaster {
  constructor() {
    this.consumer = [];
    this.error = flyd.stream();
  }

  addConsumer(consumer) {
    this.consumer.push(consumer);

    flyd.on(() => this.removeConsumer(consumer), consumer.end);
  }

  removeConsumer(consumer) {
    this.consumer = this.consumer.filter(c => c !== consumer);
  }

  addProducer(producer) {
    flyd.on((msg) => {
      this.consumer.forEach(consumer => consumer(msg));
    }, producer);
  }

  addWebsocket(ws) {
    const producer = flyd.stream();
    const consumer = flyd.stream();

    ws.on('message', (data) => {
      const result = parseJson(data);

      streamEither(this.error, producer, result);
    });

    flyd.on((msg) => {
      const data = JSON.stringify(msg);

      ws.send(data);
    }, consumer);

    this.addConsumer(consumer);
    this.addProducer(producer);
  }
};
