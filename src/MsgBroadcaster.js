const flyd = require('flyd');
const filter = require('flyd/module/filter');

const R = require('ramda');
const Either = require('folktale/data/either');

const Broadcaster = require('./Broadcaster');
const Message = require('./types/Message');
const { unEither } = require('./streams');

const toMsg = (data) => {
  let msg;

  try {
    msg = new Message(data);

    return Either.Right(msg);
  } catch (e) {
    return Either.Left(e);
  }
};

const cacheMsg = flyd.curryN(2, (cache, msg) => {
  if (cache[msg.topic] !== undefined) cache[msg.topic] = msg;

  return msg;
});

const createCache = (topics) => {
  const cache = {};

  topics.forEach((topic) => {
    cache[topic] = null;
  });

  return cache;
};

module.exports = class WebsocketBroadcaster {
  constructor(cachedTopics) {
    this.br = new Broadcaster();
    this.error = flyd.stream();
    this.cache = createCache(cachedTopics);
  }

  addConsumer(consumer) {
    const cached = R.pipe(
      R.values,
      R.filter(msg => msg !== null)
    )(this.cache);

    cached.forEach(msg => consumer(msg));

    return this.br.addConsumer(consumer);
  }

  removeConsumer(consumer) {
    return this.br.removeConsumer(consumer);
  }

  addProducer(producer) {
    const filtered = R.pipe(
      flyd.map(toMsg),
      unEither(this.error),
      flyd.map(cacheMsg(this.cache))
    )(producer);

    return this.br.addProducer(filtered);
  }
};
