const db = require("../models");
const fs = require('fs');
const exec = require('child_process').exec
const connectToDatabase = require('../db');

require('dotenv').config();

var api = require('twitch-api-v5');
api.clientID = process.env.CLIENT_ID;

function sortMinToMax(arr) {
  var sortable = [];

  for (var count in arr) {
    sortable.push([count, arr[count]]);
  }

  sortable.sort(function (a, b) {
    return a[1] - b[1];
  });

  let lastTenElements = sortable.slice(Math.max(sortable.length - 10, 1));

  return lastTenElements;
}

function secondsToHms(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);

  var hDisplay = h > 0 ? h + (h == 1 ? "h: " : "h: ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? "m: " : "m: ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? "s" : "s") : "";

  return hDisplay + mDisplay + sDisplay;
}

function getDifference(timestamp1, timestamp2) {
  var difference = timestamp1 - timestamp2;
  var seconds = Math.abs(difference) / 1000;

  return seconds;
}

module.exports = {
  createStats: function (req, res) {

    console.log('createstats triggered');

    api.videos.getVideo({ videoID: req.params.id }, (err, vodData) => {

      console.log('get video');

      if (typeof vodData.error !== 'undefined') {
        console.log('ERROR, ERROR! Could not find Vod!');
        res.send(vodData);
      } else {
        console.log('No error!');

        connectToDatabase()
          .then(() => {
            db.Stat.find({ vodID: req.params.id }).then((obj) => {
              console.log('Checking if data exists');
              if (!Array.isArray(obj) || !obj.length) {

                console.log('Data does not exist, creating data...');

                var child = exec(`node_modules/twitch-chatlog/bin/twitch-chatlog -l 0 ${req.params.id} > /tmp/${req.params.id}.txt`);

                child.stdout.on('data', function (data) {
                  console.log('stdout: ' + data);
                  //Here is where the output goes
                });

                child.stderr.on('data', function (data) {
                  console.log('stderr: ' + data);

                });

                child.on('close', function (code) {
                  console.log('closing code: ' + code);

                  fs.readFile(`/tmp/${req.params.id}.txt`, 'utf8', function (err, contents) {
                    console.log('Starting to read file');
                    let ResultArray = contents.split("\n");
                    const { params } = req;
                    const { title, url, preview, channel } = vodData;
                    const stat = {
                      vodID: params.id,
                      textLog: ResultArray,
                      vodTitle: title,
                      vodURL: url,
                      previewURL: preview.large,
                      broadcasterName: channel.display_name,
                      broadcasterChannel: channel.url,
                      dateCreated: channel.updated_at,
                    }
                    console.log('object being created');
                    console.log(stat);
                    db.Stat.create(stat)
                      .then(stat => {
                        console.log(stat)
                      })
                      .catch(err => console.log(err));
                  });

                });
              } else {
                console.log('data exists, sending this to frontend: ', req.params.id);
                res.send(req.params.id);
              }
            });
          });
      }
    });
  },
  getStats: function (req, res) {

    console.log('get stats triggered');

    let stats = {

    }

    connectToDatabase()
      .then(() => {
        db.Stat.find({ vodID: req.params.id }).then((obj) => {

          console.log(obj)

          let topTenChatters = [];
          let topTenMessages = [];
          let totalMessages = 0;
          let totalUniqueChatters = 0;

          let messagesOnly = [];
          let namesOnly = [];
          let timeStampsOnly = [];
          let firstTimeStamp = null;

          let countsTimeStamps = {};
          let countsMessage = {};
          let countsName = {};

          for (let i = 0; i < obj[0].textLog.length; i++) {
            let splitMessage = obj[0].textLog[i].split('>');
            let splitName = splitMessage[0].split('<');
            let splitTimeStamp = splitName[0];

            splitMessage = splitMessage[1];
            splitName = splitName[1];

            if (splitTimeStamp.length <= 35) {

              splitTimeStamp = splitTimeStamp.replace('[', '');
              splitTimeStamp = splitTimeStamp.replace(']', '');

              //let year = obj[0].dateCreated.substring(0, 1);

              let year = '20';

              splitTimeStamp = new Date(year += splitTimeStamp);

              let time = 0;

              if (i === 0) {
                firstTimeStamp = splitTimeStamp;
              }

              let difference = getDifference(firstTimeStamp, splitTimeStamp);

              time += difference;

              if (difference <= 99999999) {
                timeStampsOnly.push(secondsToHms(time));
              } else {
                console.log('Error: Very large number outside set generated:', difference);
                console.log('This is a bug in the server. The number will not be included. Contact the developer for more info.');
              }

            }

            if (splitMessage !== undefined) {
              messagesOnly.push(splitMessage.trim());
            }
            if (splitName !== undefined) {
              namesOnly.push(splitName.trim());
            }
          }

          messagesOnly.forEach(function (x) { countsMessage[x] = (countsMessage[x] || 0) + 1; });
          namesOnly.forEach(function (x) { countsName[x] = (countsName[x] || 0) + 1; });
          timeStampsOnly.forEach(function (x) { countsTimeStamps[x] = (countsTimeStamps[x] || 0) + 1; });

          totalMessages = messagesOnly.length;
          totalUniqueChatters = [...new Set(namesOnly)];

          topTenMessages = sortMinToMax(countsMessage).reverse();
          topTenChatters = sortMinToMax(countsName).reverse();

          let chatFrequency = [];

          for (var x in countsTimeStamps) {
            chatFrequency.push([x, countsTimeStamps[x]]);
          }

          if (obj[0].textLog.length >= 32000) {
            obj[0].textLog = {};
            stats = {
              topTenChatters,
              topTenMessages,
              totalMessages,
              totalUniqueChatters,
              countsTimeStamps,
              obj
            }
          } else {
            stats = {
              topTenChatters,
              topTenMessages,
              totalMessages,
              totalUniqueChatters,
              countsTimeStamps,
              obj
            }
          }

          res.send(stats);

        });
      });
  },
  getStatsJson: function (req, res) {

    console.log('get stats json triggered');

    connectToDatabase()
      .then(() => {
        db.Stat.find({ vodID: req.params.id }).then((obj) => {
          res.json(obj);
        });
      });
  },
  areStatsCreated: function(req, res){
    console.log('Checking if object with id: ' + req.params.id + ' is created')
    connectToDatabase()
    .then(() => {
      db.Stat.find({ vodID: req.params.id }).then((obj) => {
        if (!Array.isArray(obj) || !obj.length) {
          console.log('Object not created');
        } else {
          console.log('Object created, sending this:', req.params.id);
          res.send(req.params.id);
        }
      });
    });
  }

};