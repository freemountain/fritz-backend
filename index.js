
//const sourceStream = require('./src/sources/');
const { Client } = require('node-ssdp');

const flyd = require('flyd');
/*
const WebsocketMsgBroadcaster = require('./src/WebsocketMsgBroadcaster');

const br = new WebsocketMsgBroadcaster({
  port: 8002,
  cachedTopics: ['sources'],
});
*/
console.log('WS server listening to 8002');
/*
const sourceProducer = flyd.map((sources) => {
  return {
    topic: 'sources',
    data: sources,
  }
}, sourceStream());

br.addProducer(sourceProducer);

flyd.on((error) => {
  console.error("Error:\n", error);
}, br.error);
*/
