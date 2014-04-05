var Twit = require('twit');
var express = require("express");
var app = express();
app.set('view engine', 'ejs');

var T = new Twit({
    consumer_key:         process.env.CONSUMER_KEY
  , consumer_secret:      process.env.CONSUMER_SECRET
  , access_token:         process.env.ACCESS_TOKEN
  , access_token_secret:  process.env.ACCESS_TOKEN_SECRET
});

var latestTweets = [];

var stream = T.stream('statuses/filter', {track: 'xbox'})

stream.on('tweet', function (tweet) {
  if (latestTweets.length >= 3) {
    latestTweets.shift()
  }
  latestTweets.push(tweet);
  console.log(tweet);
})

app.get('/', function(req, res) {
  res.render('index', { latestTweets: latestTweets })
});

app.get('/tweets', function(req, res) {
  res.send(latestTweets);
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
