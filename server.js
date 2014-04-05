var Twit = require('twit');
var express = require("express");
var https = require('https');
var app = express();
app.set('view engine', 'ejs');
app.use("/public", express.static(__dirname + '/public'));

var redis = require('redis-url').connect(process.env.REDISTOGO_URL);

var T = new Twit({
    consumer_key:         process.env.CONSUMER_KEY
  , consumer_secret:      process.env.CONSUMER_SECRET
  , access_token:         process.env.ACCESS_TOKEN
  , access_token_secret:  process.env.ACCESS_TOKEN_SECRET
});

var latestTweet;

var stream = T.stream('statuses/filter', {track: '@savecouchy'})
// var stream = T.stream('statuses/filter', {track: 'bbn'})

stream.on('tweet', handleTweet);

function handleTweet(tweet) {
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
  // var embeddedResponse;

  // T.get('statuses/oembed', {id: tweet.id}, function(err, reply) {
    // // console.log('res: ' + JSON.stringify(Object.keys(res)));
    // res.on('data', function (chunk) {
    //   embeddedResponse += chunk;
    //   console.log('BODY: ' + tweet.id + chunk);
    // });
    // res.on('end', function() {
      // tweet.embedded = embeddedResponse;
      // setNewUser(tweet);
    // });
  // });
  tweet.embedded = {html: tweet.text};
  setNewUser(tweet);
}

function setNewUser(tweet) {
  latestTweet = tweet;
  redis.set(tweet.user.screen_name, JSON.stringify(tweet));
  replyTo(tweet);
}

function replyTo(tweet) {
  var handle = tweet.user.screen_name;
  var update = '@' + handle + ' is my new best bud. Here you are saving me from the flaaaaames! http://savecouchy.com/buds/' + handle;
  T.post('statuses/update', {status: update, in_reply_to_status_id: tweet.id}, function(err, reply) {
    console.log('err: ' + err);
    console.log('reply: ' + reply);
  });
}

app.get('/', function(req, res) {
  res.render('index', { latestTweet: latestTweet })
});

app.get('/tweet', function(req, res) {
  res.send(latestTweet);
});

app.get('/buds/:name', function(req, res) {
  console.log('name: ' + req.params.name);
  redis.get(req.params.name, function(err, tweet) {
    if (tweet) {
      tweet = JSON.parse(tweet)
      // tweet.id = "452586780017963008";
      res.render('bud', { tweet: tweet })
    } else {
      res.end('could not find user');
    }
  });
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
