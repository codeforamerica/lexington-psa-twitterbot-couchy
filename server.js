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

var latestTweet = JSON.parse("{\"created_at\":\"Sat Apr 05 23:57:55 +0000 2014\",\"id\":452596022548520960,\"id_str\":\"452596022548520960\",\"text\":\"Are you a #BBN bodyguard? You shou holler at @SaveCouchy to save it from the flames! cc/@rhsiv @JTPalumbo78 #finalfour\",\"source\":\"<a href=\\\"http://www.echofon.com/\\\" rel=\\\"nofollow\\\">Echofon</a>\",\"truncated\":false,\"in_reply_to_status_id\":null,\"in_reply_to_status_id_str\":null,\"in_reply_to_user_id\":2429064914,\"in_reply_to_user_id_str\":\"2429064914\",\"in_reply_to_screen_name\":\"SaveCouchy\",\"user\":{\"id\":120774911,\"id_str\":\"120774911\",\"name\":\"Smith Schwartz\",\"screen_name\":\"smithschwartz\",\"location\":\"San Francisco\",\"url\":\"http://smithschwartz.com\",\"description\":\"Cascades with style. Blogs at @Schwartzography. High five anxiety.\",\"protected\":false,\"followers_count\":422,\"friends_count\":437,\"listed_count\":15,\"created_at\":\"Sun Mar 07 14:18:00 +0000 2010\",\"favourites_count\":220,\"utc_offset\":-18000,\"time_zone\":\"Central Time (US & Canada)\",\"geo_enabled\":true,\"verified\":false,\"statuses_count\":1070,\"lang\":\"en\",\"contributors_enabled\":false,\"is_translator\":false,\"is_translation_enabled\":false,\"profile_background_color\":\"1A1B1F\",\"profile_background_image_url\":\"http://pbs.twimg.com/profile_background_images/669934286/51eeb4a4b9e7414711b3c6f386d52d54.jpeg\",\"profile_background_image_url_https\":\"https://pbs.twimg.com/profile_background_images/669934286/51eeb4a4b9e7414711b3c6f386d52d54.jpeg\",\"profile_background_tile\":false,\"profile_image_url\":\"http://pbs.twimg.com/profile_images/2147173740/IMG_5521_normal.jpg\",\"profile_image_url_https\":\"https://pbs.twimg.com/profile_images/2147173740/IMG_5521_normal.jpg\",\"profile_banner_url\":\"https://pbs.twimg.com/profile_banners/120774911/1348674620\",\"profile_link_color\":\"2FC2EF\",\"profile_sidebar_border_color\":\"FFFFFF\",\"profile_sidebar_fill_color\":\"252429\",\"profile_text_color\":\"666666\",\"profile_use_background_image\":true,\"default_profile\":false,\"default_profile_image\":false,\"following\":null,\"follow_request_sent\":null,\"notifications\":null},\"geo\":null,\"coordinates\":null,\"place\":null,\"contributors\":null,\"retweet_count\":0,\"favorite_count\":0,\"entities\":{\"hashtags\":[],\"symbols\":[],\"urls\":[],\"user_mentions\":[{\"screen_name\":\"SaveCouchy\",\"name\":\"Couchy\",\"id\":2429064914,\"id_str\":\"2429064914\",\"indices\":[0,11]}]},\"favorited\":false,\"retweeted\":false,\"filter_level\":\"medium\",\"lang\":\"it\",\"embedded\":{\"html\":\"@SaveCouchy oh hai!\"}}");

var stream = T.stream('statuses/filter', {track: '@savecouchy'})
// var stream = T.stream('statuses/filter', {track: 'bbn'})

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
  // replyTo(tweet);
}

function replyTo(tweet) {
  var handle = tweet.user.screen_name;
  var update = '@' + handle + ' is my new best bud! Here you are saving me from the flaaaaames! http://savecouchy.com/buds/' + handle;
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
