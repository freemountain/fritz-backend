
const sourceStream = require('./sources/');

const flyd = require('flyd');
const WebsocketMsgBroadcaster = require('./WebsocketMsgBroadcaster');

const br = new WebsocketMsgBroadcaster({
  port: 8002,
  cachedTopics: ['sources'],
});

console.log('WS server listening to 8002');

const sourceProducer = flyd.map((sources) => {
  return {
    topic: 'sources',
    data: sources,
  };
}, sourceStream());

br.addProducer(sourceProducer);

flyd.on((error) => {
  console.error('Error:\n', error);
}, br.error);
/*
const server = new StaticServer({
  rootPath: __dirname + '/static',            // required, the root of the server file tree
  name: 'my-http-server',   // optional, will set "X-Powered-by" HTTP header
  port: 8001,               // optional, defaults to a random port
  cors: '*',                // optional, defaults to undefined
});

server.start(function () {
  console.log('HTTP server listening to', server.port);
});
*/
