var bot = require('./bot');

var express = require("express");
var https = require('https');
var app = express();

var dotenv = require('dotenv');
dotenv.load();

app.set('view engine', 'ejs');
app.use("/public", express.static(__dirname + '/public'));

var redis = require('redis-url').connect(process.env.REDISTOGO_URL);

bot.newTwit({
    consumer_key:         process.env.API_KEY
  , consumer_secret:      process.env.API_KEY_SECRET
  , access_token:         process.env.ACCESS_TOKEN
  , access_token_secret:  process.env.ACCESS_TOKEN_SECRET
});

bot.redis = redis;
bot.streamTerm(process.env.SEARCH_TERM);

app.get('/', function(req, res) {
  if (bot.latestTweet) {
      res.render('index', { latestTweet: bot.latestTweet });
  } else {
    bot.randomTweet(function(tweet) {
      res.render('index', { latestTweet: tweet });
    });
  }
});

app.get('/tweet', function(req, res) {
  bot.randomTweet(function(tweet) {
    res.send(tweet);
  });
});

app.get('/buds/:name', function(req, res) {
  bot.getStoredTweet(req.params.name, function(tweet) {
    if (tweet) {
      res.render('bud', { tweet: tweet, requestUrl: 'http://savecouchy.com/' + req.url })
    } else {
      res.redirect('/');
    }
  });
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
