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

// var stream = T.stream('statuses/filter', {track: '@savecouchy'})
var stream = T.stream('statuses/filter', {track: 'bbn'})

var embeddedResponse = {"cache_age":"3153600000","url":"https:\/\/twitter.com\/JDaugherty_\/statuses\/452481183213813760","height":null,"provider_url":"https:\/\/twitter.com","provider_name":"Twitter","author_name":"Justin Daugherty","version":"1.0","author_url":"https:\/\/twitter.com\/JDaugherty_","type":"rich","html":"\u003Cblockquote class=\"twitter-tweet\"\u003E\u003Cp\u003EJust ready to leave work that&#39;s all.. \u003Ca href=\"https:\/\/twitter.com\/search?q=%23BBN&amp;src=hash\"\u003E#BBN\u003C\/a\u003E\u003C\/p\u003E&mdash; Justin Daugherty (@JDaugherty_) \u003Ca href=\"https:\/\/twitter.com\/JDaugherty_\/statuses\/452481183213813760\"\u003EApril 5, 2014\u003C\/a\u003E\u003C\/blockquote\u003E\n\u003Cscript async src=\"\/\/platform.twitter.com\/widgets.js\" charset=\"utf-8\"\u003E\u003C\/script\u003E","width":550};

// stream.on('tweet', handleTweet);

function handleTweet(tweet) {
  if (! tweet.retweeted_status && ! tweet.in_reply_to_status_id) {
    handleNewThread(tweet);
  } else {
    console.log('is retweet or reply');
  }
  console.log(tweet.user.screen_name);
  // https.get('https://api.twitter.com/1/statuses/oembed.json?id=' + tweet.id, function(res) {
  //   // console.log('res: ' + JSON.stringify(Object.keys(res)));
  //   res.on('data', function (chunk) {
  //     console.log('BODY: ' + chunk);
  //   });
  // });
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
  latestTweet = tweet;
  tweet.embedded = embeddedResponse;
  redis.set(tweet.user.screen_name, JSON.stringify(tweet));
  // replyTo(tweet);
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
  res.render('index', { latestTweets: [] })
});

app.get('/tweets', function(req, res) {
  res.send([latestTweet]);
});

app.get('/buds/:name', function(req, res) {
  console.log('name: ' + req.params.name);
  redis.get(req.params.name, function(err, tweet) {
    if (tweet) {
      res.render('bud', { tweet: JSON.parse(tweet) })
    } else {
      res.end('could not find user');
    }
  });
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
