const flyd = require('flyd');
const R = require('ramda');
const Either = require('folktale/data/either');
const MsgBroadcaster = require('./MsgBroadcaster');
const WebSocket = require('ws');
const { unEither } = require('./streams');

const parseJson = (data) => {
  try {
    const json = JSON.parse(data);

    return Either.Right(json);
  } catch (e) {
    return Either.Left(e);
  }
};

const defaultOptions = {
  port: 1234,
  cachedTopics: [],
};

const createWSStreams = (ws, error) => {
  const consumer = flyd.stream();
  const producer = flyd.stream();

  ws.on('message', producer);
  ws.on('close', () => {
    consumer.end(true);
    producer.end(true);
  });

  flyd.on((data) => {
    ws.send(data, (e) => {
      if (!e) return;
      error(e);
    });
  }, consumer);

  return { consumer, producer };
};

module.exports = class WebsocketBroadcaster {
  constructor(options) {
    const opts = Object.assign({}, defaultOptions, options);

    this.br = new MsgBroadcaster(opts.cachedTopics);
    this.error = this.br.error;
    this.wss = new WebSocket.Server({
      port: options.port,
    });

    this.wss.on('connection', (ws) => {
      this.addWebsocket(ws);
    });
  }

  addConsumer(consumer) {
    return this.br.addConsumer(consumer);
  }

  removeConsumer(consumer) {
    return this.br.removeConsumer(consumer);
  }

  addProducer(producer) {
    return this.br.addProducer(producer);
  }

  addWebsocket(ws) {
    const streams = createWSStreams(ws, this.error);
    const consumer = flyd.stream();

    const producer = R.pipe(
      flyd.map(parseJson),
      unEither(this.error)
    )(streams.producer);

    flyd.on((d) => {
      const s = JSON.stringify(d);
      streams.consumer(s);
    }, consumer);

    this.br.addConsumer(consumer);
    this.br.addProducer(producer);
  }
};
