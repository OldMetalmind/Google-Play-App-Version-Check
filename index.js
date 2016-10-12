var config = require('./config');
var request = require('request');
var cheerio = require('cheerio');
var cron = require('node-cron');
var Slack = require('slack-node');
var webhookUri = config.slack.webhook;
var version = config.app.currentVersion;

slack = new Slack();
slack.setWebhook(webhookUri);

var warnTeam = function() {
  slack.webhook({
    channel: config.slack.channel,
    username: "googleplaybot",
    icon_emoji: ":ghost:",
    text: config.slack.message
  }, function(err, response) {
    console.log(response);
    if (!error && response.statusCode == 200) {
      process.exit()
    }
  });
};

var checkVersion = function() {
  request('https://play.google.com/store/apps/details?id='+config.app.packageName, function (error, response, html) {
  if (!error && response.statusCode == 200) {
    var $ = cheerio.load(html);
    var gp_version = $('div[itemprop=softwareVersion]').html();
    console.log("current version:" + gp_version);
    if(gp_version.toString().trim() !== version.toString().trim())
    {
      console.log("["+Date.now()+"] Version updated");
      process.exit()
      warnTeam();
    }
    else {
      console.log("["+Date.now()+"] Version not updated" );
    }
  }
  });
};

checkVersion();
var schedule = cron.schedule('*/20 * * * *', function(){
     checkVersion();
}, true);
