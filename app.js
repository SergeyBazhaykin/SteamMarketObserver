// SteamMarketObserver tool
// Type lot's name ids in the NAMEIDS array
const NAMEIDS = ['7177182', 175880240];

const request = require('request');
const path = require('path');
const fs = require('fs');
let cTime = new Date(Date.now()).toISOString().
    slice(0, 16).replace(/:/g, '');

const logDirectory = path.join(__dirname, 'log');

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

for (const nameid of NAMEIDS) {
  makeRequest(nameid);
}

function makeRequest(obsNameid) {
  request('https://steamcommunity.com/market/itemordershistogram' +
      '?language=english&currency=1&item_nameid=' + obsNameid,
      function(error, response, body) {
        if (!error && response.statusCode === 200) {
          parseResp(JSON.parse(body), obsNameid);
        } else {
          const path = `${logDirectory}/`;
          const errorMessage = 'Error (nameid: ' + obsNameid + ') ' +
              response.statusCode;
          fs.writeFile(path + '!E' + cTime + 'ID' + obsNameid + '.log',
              JSON.stringify({
                success: false,
                error: errorMessage,
              }),
              'utf8',
              () => console.log(errorMessage));
        }
      });
}

function parseResp(body, obsNameid) {
  let logBody = {};
  if (body.success !== 1) {
    const path = `${logDirectory}/`;
    const errorMessage = 'Error: response (nameid: ' + obsNameid +
        ') not success';
    fs.writeFile(path + '!E' + cTime + 'ID' + obsNameid + '.log',
        JSON.stringify({
          success: false,
          error: errorMessage,
        }),
        'utf8', () =>
            console.log(errorMessage));
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
  const path = `${logDirectory}/`;
  fs.writeFile(path + cTime + 'ID' + obsNameid + '.log',
      JSON.stringify(logBody), 'utf8', () => console.log(
          'Data (nameid: ' + obsNameid + ') has been written successfully..'));
}
