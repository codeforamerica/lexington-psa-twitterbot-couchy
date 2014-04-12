// :map ,x idescribe('', function() {<Cr><Cr>})<Esc>Vk=f'a

var bot = require('../bot')
var redis = require('redis-url').connect();
var assert = require("assert");

bot.setTwit = function() {};
bot.newTwit();
bot.redis = redis;


describe('handleTweet', function(){
  it('stores new tweet in db', function(done){
    bot.redis.FLUSHALL(function() {
      var tweet = {user: {screen_name: '@foo'}};
      bot.getTweet = function(screen_name, callback) { callback() }
      bot.handleTweet(tweet);
      bot.redis.get(tweet.user.screen_name, function(err, dbTweet) {
        assert.equal(JSON.stringify(tweet), dbTweet);
        done();
      });
    });
  });

  describe('replying to tweet', function() {
    it('only replys in prod', function(done) {
      var tweet = {user: {screen_name: 'foo'}};
      bot.replyTo = function() { assert.fail('should not be called') };
      bot.setNewUser(tweet);

      process.env.NODE_ENV = 'production';
      bot.replyTo = function() { done(); };
      bot.setNewUser(tweet);
    });
  })
});
