var express = require('express');
var request = require('request');
var path = require('path');
var fs = require('fs');
var rfs = require('rotating-file-stream');
let cTime = new Date(Date.now()).toISOString().
    slice(0, 16).
    replace(/-/g, '').
    replace(/:/g, '');

var obsNameid = '7177182';
var logDirectory = path.join(__dirname, 'log');

var app = express();

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

var accessLogStream = rfs(cTime + 'ID' + obsNameid + '.log', {
  interval: '7d',
  path: logDirectory,
  compress: 'gzip',
});

app.use(express.json());
app.use(express.urlencoded({extended: false}));

request('https://steamcommunity.com/market/itemordershistogram' +
    '?language=english&currency=1&item_nameid=' + obsNameid,
    function(error, response, body) {
      if (!error && response.statusCode === 200) {
        parseResp(JSON.parse(body));
      } else {
        accessLogStream.end(handleLog('Error ' + response.statusCode), 'utf8', () => {
          console.log(handleLog('Error ' + response.statusCode));
          process.exit();
        });
      }
    });

function parseResp(body) {
  let logBody = {};
  if (body.success !== 1) {
    handleLog('Error: responce not success');
  }
  logBody['bg'] = body['buy_order_graph'].map((v, i, a) => {
    a[i].length = 2;
    return a[i];
  });
  logBody['bs'] = body['buy_order_summary'].slice(
      body['buy_order_summary'].indexOf('>') + 1,
      body['buy_order_summary'].indexOf('<', 3));
  logBody['maxx'] = body['graph_max_x'];
  logBody['maxy'] = body['graph_max_y'];
  logBody['minx'] = body['graph_min_x'];

  logBody['sg'] = body['sell_order_graph'].map((v, i, a) => {
    a[i].length = 2;
    return a[i];
  });
  logBody['ss'] = body['sell_order_summary'].slice(
      body['sell_order_summary'].indexOf('>') + 1,
      body['sell_order_summary'].indexOf('<', 3));
  accessLogStream.end(JSON.stringify(logBody), 'utf8', () => {
    console.log('Data has been written successfully..');
    process.exit();
  });
}

function handleLog(str, options) {
  let res = '';
  if (!options) {
    res = str;
  }
  // todo options
  return res;
}

module.exports = app;
