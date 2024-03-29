![Logo](images/logo.png)
# SteamMarketObserver
An app for recording the order book (shows interest of buyers and sellers) of a particular lot at Steam market. 
May be used for making charts of Depth of Market.

### User guide
* Download the project
* Add required nameids to array `NAMEIDS` at the beginning of *app.js* file
  * In order to see nameid you need to go to Steam Market page 
  ([example](https://steamcommunity.com/market/listings/730/Operation%20Phoenix%20Weapon%20Case)),
  open console and type `ItemActivityTicker.m_llItemNameID`
* Do an `npm install` at *package.json* directory
* Run `node app.js` or `npm start`
  * App would save current order book of selected lot(s) in the *log* folder. Log files look like 
  `2019-10-19T1359ID7177182`, where `7177182` is Nameid of a lot and `1359` is HHmm - hours and minutes.
  * In case of failure, name of log file will be `!E2019-10-19T1359ID7177182` 
  and the file will contains in JSON format `success: false` and error message.

##### It may be useful to configure cron to run `node app.js` at regular intervals.

### Log data format
Log files are JSON formatted and minified. JSON structure looks like:
```
{
  bg: [
    [int, int]
    ...
    ],
  bs: string,
  maxx: int,
  maxy: int,
  minx: int,
  sg: [
     [int, int]
     ...
     ],
  ss: string
}
```
where 
* `bg` - buy orders graph data, where `[int, int]` is price and amount of orders, respectively;
* `bs` - amount of buy orders summary;
* `maxx`, `maxy` and `minx` - parameters of chart;
* `sg` - sell orders graph data, where `[int, int]` is price and amount of orders;
* `ss` - amount of sell orders summary;
