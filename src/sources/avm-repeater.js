const R = require('ramda');
const flyd = require('flyd');
const url = require('url');
const { Client } = require('node-ssdp');
const { downloadAllStream } = require('./../download');
const parseM3U = require('./../parseM3U');
const Source = require('./../types/Source');
// BSP: uuid:663d5d6c-f9f8-4bb4-84d4-3431C48B3AB3::urn:ses-com:service:satip:1
const parseUSN = s => s
  .split('::')[0]
  .split(':')[1];

function findBox(end) {
  const client = new Client();
  const stream = flyd.stream();
  const search = () => client.search('urn:ses-com:service:satip:1');
  const update = setInterval(search, 60000);

  client.on('response', (headers, statusCode, rinfo) => {
    stream(headers);
  });

  flyd.on(() => {
    clearInterval(update);
    stream.end(true);
  }, end);

  search();

  return stream;
}

module.exports = function repeater(input) {
  return R.pipe(
    findBox,
    flyd.map((header) => {
      const { hostname } = url.parse(header.LOCATION);
      const base = `http://${hostname}/dvb/m3u`;

      return [`${base}/tvsd.m3u`, `${base}/tvhd.m3u`];
    }),
    downloadAllStream((data, source) => {
      const streams = parseM3U(data);
      const prefix = source.slice(-6, -4); // sd or hd

      return Source({
        name: `repeater ${prefix}`,
        streams,
      });
    })
  )(input.end);
};
