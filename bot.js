var Twit = require('twit');

var _this;
module.exports = {
  newTwit: function(twitParams) {
    _this = this;
    _this.setTwit();
  },
  setTwit: function(twitParams) {
    _this.T = new Twit(twitParams);
  },
  streamTerm: function(term, handleTweet) {
    var stream = _this.T.stream('statuses/filter', {track: term});

    stream.on('tweet', _this.handleTweet);
    stream.on('error', function(err) {
      if (err.code === 401) {
        console.log('Error authenticating with twitter! Please check env variables');
        process.exit();
      }
    });
  },
  getStoredTweet: function(twitterHandle, callback) {
    _this.redis.get(twitterHandle, function(err, tweet) {
      callback(tweet ? JSON.parse(tweet) : undefined);
    });
  },
  randomTweet: function(callback) {
    _this.redis.RANDOMKEY(function() {
      var randomKey = arguments[1];
      _this.getStoredTweet(randomKey, function(tweet) {
        callback(tweet);
      });
    });
  },
  replyTo: function(tweet) {
    var handle = tweet.user.screen_name;
    var update = '@' + handle + ' is my new best bud! Here you are saving me from the flaaaaames! http://savecouchy.com/buds/' + handle;
    _this.T.post('statuses/update', {status: update, in_reply_to_status_id: tweet.id}, function(err, reply) {
      console.log('err: ' + err);
      console.log('reply: ' + reply);
    });
  },
  setNewUser: function(tweet) {
    _this.redis.set(tweet.user.screen_name, JSON.stringify(tweet));
    if (process.env.NODE_ENV === 'production') {
      _this.replyTo(tweet);
    }
  },
  handleNewUser: function(tweet) {
    _this.setNewUser(tweet);
  },
  handleNewThread: function(tweet) {
    _this.getTweet(tweet.user.screen_name, function(err, user) {
      if (!user) {
        _this.handleNewUser(tweet)
      }
    });
  },
  getTweet: function(screen_name, callback) {
    _this.redis.get(screen_name, callback);
  },
  handleTweet: function(tweet) {
    _this.latestTweet = tweet;
    if (! tweet.retweeted_status) {
      _this.handleNewThread(tweet);
    } else {
      console.log('is retweet');
    }
    console.log(tweet.user.screen_name);
  }
};
