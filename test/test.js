// :map ,x idescribe('', function() {<Cr><Cr>})<Esc>kkf'a

var bot = require('../bot')
var redis = require('redis-url').connect();

var assert = require("assert")
describe('handleTweet', function(){
  it('stores new tweet in db', function(done){
    bot.setTwit = function() {};
    bot.newTwit();
    bot.redis = redis;

    bot.redis.FLUSHALL(function() {
      var tweet = {user: {screen_name: '@foo'}};
      bot.getTweet = function(screen_name, callback) { callback() }
      bot.handleTweet(tweet);
      bot.redis.get(tweet.user.screen_name, function(err, dbTweet) {
        assert.equal(JSON.stringify(tweet), dbTweet);
        done();
      });
    });
  })
})
