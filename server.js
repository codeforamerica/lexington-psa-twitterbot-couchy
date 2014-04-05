var Twit = require('twit');
var express = require("express");
// var https = require('https');
var app = express();
app.set('view engine', 'ejs');

var T = new Twit({
    consumer_key:         process.env.CONSUMER_KEY
  , consumer_secret:      process.env.CONSUMER_SECRET
  , access_token:         process.env.ACCESS_TOKEN
  , access_token_secret:  process.env.ACCESS_TOKEN_SECRET
});

var latestTweets = [];

var stream = T.stream('statuses/filter', {track: 'bbn'})
//
// var embeddedResponse = {
//   "type": "rich",
//   "author_name": "Twitter API",
//   "cache_age": "31536000000",
//   "height": null,
//   "html": "<blockquote class=\"twitter-tweet tw-align-center\"><p>Search API will now always return \"real\" Twitter user IDs. The with_twitter_user_id parameter is no longer necessary. An era has ended. ^TS</p>&mdash; Twitter API (@twitterapi) <a href=\"https://twitter.com/twitterapi/status/133640144317198338\" data-datetime=\"2011-11-07T20:21:07+00:00\">November7, 2011</a></blockquote>\n<script src=\"//platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>",
//   "author_url": "https://twitter.com/twitterapi",
//   "provider_name": "Twitter",
//   "version": "1.0",
//   "provider_url": "http://twitter.com",
//   "url": "https://twitter.com/twitterapi/status/133640144317198338",
//   "width": 550
// };

var embeddedResponse = {"cache_age":"3153600000","url":"https:\/\/twitter.com\/JDaugherty_\/statuses\/452481183213813760","height":null,"provider_url":"https:\/\/twitter.com","provider_name":"Twitter","author_name":"Justin Daugherty","version":"1.0","author_url":"https:\/\/twitter.com\/JDaugherty_","type":"rich","html":"\u003Cblockquote class=\"twitter-tweet\"\u003E\u003Cp\u003EJust ready to leave work that&#39;s all.. \u003Ca href=\"https:\/\/twitter.com\/search?q=%23BBN&amp;src=hash\"\u003E#BBN\u003C\/a\u003E\u003C\/p\u003E&mdash; Justin Daugherty (@JDaugherty_) \u003Ca href=\"https:\/\/twitter.com\/JDaugherty_\/statuses\/452481183213813760\"\u003EApril 5, 2014\u003C\/a\u003E\u003C\/blockquote\u003E\n\u003Cscript async src=\"\/\/platform.twitter.com\/widgets.js\" charset=\"utf-8\"\u003E\u003C\/script\u003E","width":550};

stream.on('tweet', handleTweet);

function handleTweet(tweet) {
  // tweet.embedded = embeddedResponse;

  if (! tweet.retweeted_status && ! tweet.in_reply_to_status_id) {
    handleNewThread(tweet);
  } else {
    console.log('is retweet or reply');
  }
  latestTweets.push(tweet);
  console.log(tweet);
  // https.get('https://api.twitter.com/1/statuses/oembed.json?id=' + tweet.id, function(res) {
  //   // console.log('res: ' + JSON.stringify(Object.keys(res)));
  //   res.on('data', function (chunk) {
  //     console.log('BODY: ' + chunk);
  //   });
  // });
}

function handleNewThread(tweet) {
  console.log('omg a new thread!!');
  // if user is new to me:
  // replyTo(tweet);
}

function replyTo(tweet) {
  var update = '@' + tweet.user.screen_name + ' is my new best bud. Thank you for saving me from the flaaaaames!';
  T.post('statuses/update', {status: update, in_reply_to_status_id: tweet.id}, function(err, reply) {
    console.log('err: ' + err);
    console.log('reply: ' + reply);
  });
}

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
