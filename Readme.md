# Repository Name

## Install

##### Create a twitter application
* Set up a twitter account that will be the bot!
* Sign-in to the [develper console](https://dev.twitter.com/) with the bot account credentials.
* Through the account menu, create a new application
* Add a phone number to the account so that the application can have "Read and Write" permissions
* Set the application permissions to "Read and Write"
* Generate access token. Make sure that its permissions are "Read and Write"

##### To install to your development environment
* Install redis
* Clone the repo:

```
git clone <repo name> 
cd <repo name>
npm install
cp .env-sample .env
```

* Edit .env, replace the values with those from your twitter application settings on dev.twitter.com
* Test whether your keys are correct. Search for something popular on twitter and watch the node output as it streams tweets that result from the search. In the .env file, set SEARCH_TERM='Something popular'

```
foreman start

```
