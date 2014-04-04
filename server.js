var Twit = require('twit'),
  http = require('http');

var T = new Twit({
    consumer_key:         process.env.CONSUMER_KEY
  , consumer_secret:      process.env.CONSUMER_SECRET
  , access_token:         process.env.ACCESS_TOKEN
  , access_token_secret:  process.env.ACCESS_TOKEN_SECRET
});

var latestTweet;

var stream = T.stream('statuses/filter', {track: 'xbox'})

stream.on('tweet', function (tweet) {
  latestTweet = tweet;
  console.log(tweet);
})

var server = http.createServer(function (request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello World\n");
  if (latestTweet) {
    response.write(JSON.stringify(latestTweet));
  }
  response.end();
});

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(8000);

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:8000/");

