const fs = require('fs');

const chai = require('chai');
const flyd = require('flyd');
const parse = require('./../src/parseM3U.js');

const { defer } = require('./../src/promise');

const expect = chai.expect;

describe('parse m3u', () => {

  it('parse fritz m3u', () => {
    const data = fs.readFileSync(`${__dirname}/fixtures/pl.m3u`, 'utf8');
    const m3u = parse(data);

    console.log(m3u);
  });

  it('parse web m3u', () => {
    const data = fs.readFileSync(`${__dirname}/fixtures/withoutHeader.m3u`, 'utf8');
    const m3u = parse(data);

    console.log(m3u);
  });
});
