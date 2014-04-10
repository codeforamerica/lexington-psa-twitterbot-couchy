var Twit = require('twit');
var express = require("express");
var https = require('https');
var app = express();

var dotenv = require('dotenv');
dotenv.load();

app.set('view engine', 'ejs');
app.use("/public", express.static(__dirname + '/public'));

var redis = require('redis-url').connect(process.env.REDISTOGO_URL);

var T = new Twit({
    consumer_key:         process.env.API_KEY
  , consumer_secret:      process.env.API_KEY_SECRET
  , access_token:         process.env.ACCESS_TOKEN
  , access_token_secret:  process.env.ACCESS_TOKEN_SECRET
});

var latestTweet;

var stream = T.stream('statuses/filter', {track: process.env.SEARCH_TERM}, function() {
  console.log(arguments);
});
stream.on('tweet', handleTweet);

function handleTweet(tweet) {
  latestTweet = tweet;
  if (! tweet.retweeted_status) {
    handleNewThread(tweet);
  } else {
    console.log('is retweet');
  }
  console.log(tweet.user.screen_name);
}

function handleNewThread(tweet) {
  console.log('omg a new thread!!');

  redis.get(tweet.user.screen_name, function(err, user) {
    if (!user) {
      handleNewUser(tweet)
    } else {
      console.log('NOT a new new user ' + tweet.user.screen_name);
    }
  });
}

function handleNewUser(tweet) {
  console.log('new user! ' + tweet.user.screen_name);
  tweet.embedded = {html: tweet.text};
  setNewUser(tweet);
}

function setNewUser(tweet) {
  redis.set(tweet.user.screen_name, JSON.stringify(tweet));
  if (process.env.NODE_ENV === 'production') {
    replyTo(tweet);
  }
}

function replyTo(tweet) {
  var handle = tweet.user.screen_name;
  var update = '@' + handle + ' is my new best bud! Here you are saving me from the flaaaaames! http://savecouchy.com/buds/' + handle;
  T.post('statuses/update', {status: update, in_reply_to_status_id: tweet.id}, function(err, reply) {
    console.log('err: ' + err);
    console.log('reply: ' + reply);
  });
}

function randomTweet(callback) {
  redis.RANDOMKEY(function() {
    var randomKey = arguments[1];
    getStoredTweet(randomKey, function(tweet) {
      callback(tweet);
    });
  });
};

function getStoredTweet(twitterHandle, callback) {
  redis.get(twitterHandle, function(err, tweet) {
    callback(tweet ? JSON.parse(tweet) : undefined);
  });
}

app.get('/', function(req, res) {
  if (latestTweet) {
      res.render('index', { latestTweet: latestTweet });
  } else {
    randomTweet(function(tweet) {
      res.render('index', { latestTweet: tweet });
    });
  }
});

app.get('/tweet', function(req, res) {
  randomTweet(function(tweet) {
    res.send(tweet);
  });
});

app.get('/buds/:name', function(req, res) {
  getStoredTweet(req.params.name, function(tweet) {
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
