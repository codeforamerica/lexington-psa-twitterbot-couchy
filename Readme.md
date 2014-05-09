## Public Service Announcement Twitterbot
A twitterbot currently configured to dissuade excited University of Kentucky basketball fans from burning couches in their front yards, in the back yards, or in the street.

It interacts with users like so:
* The first time someone (a bud) tweets at CouchyLives, the bot (Couchy) replys
* The reply contains a permalink immortalizing the bud's tweet, and showing the bud as a dancing robot.
* It's nicely described [here](http://teambiglex.tumblr.com/post/84538539409/save-couchy-from-the-flaaaaaaaames) 
* This pattern can be used in any number of ways. Please feel free to fork and use as a bot for your own PSA campaign!


## Install

##### Create a twitter application
* Set up a twitter account that will be the bot!
* Sign-in to the [develper console](https://dev.twitter.com/) with the bot account credentials.
* Through the account menu, create a new application
* Add a phone number to the account so that the application can have "Read and Write" permissions
* Set the application permissions to "Read and Write"
* Generate access token. Make sure that its permissions are "Read and Write"

##### To install to your development environment
* Install [Node.js](https://github.com/codeforamerica/howto/blob/master/Node.js.md)
* Install [redis](http://redis.io/)
* Setup the repo

```
git clone <repo name>
cd <repo name>
npm install
cp .env-sample .env
```

* Edit .env, replace the values with those from your twitter application settings on dev.twitter.com
* Test whether your keys are correct. Search for something popular on twitter and watch the node output as it streams tweets that result from the search. In the .env file, set SEARCH_TERM='Something popular'

```
# make sure redis is running
# run tests
mocha

# start application
foreman start

```
