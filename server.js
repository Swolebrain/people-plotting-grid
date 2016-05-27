"use strict";
var port = 8008;
var express = require('express');
var app = express();
var passport = require('passport');
var jwtX = require('express-jwt');
var jwt = require('jsonwebtoken');
var jwtCheck = {
  secret: new Buffer('8gEd9TsT3f8ghENLBA3ikGyS6mgeXb6NkIaBr1mhGqiMuegOzcHhseaFGCz82oHN'),
  audience: 'B9JnY1RTstONDZ6ewn9Gf0owT2E78icz'
};

var azureStrategy = require('passport-azure-ad-oauth2');


/*
app id uri http://floridavocational.onmicrosoft.com/people-plotting-grid
federation metadata: https://login.windows.net/2790bc79-4605-4c05-983b-dacd0f48680c/FederationMetadata/2007-06/FederationMetadata.xml
client id ae0a0434-6d76-4536-8409-00124384c7fa
key/secret moE7nOuiwWu0uVgD78K9BzmJLjt9P/mifB5S8xPdTEE=
*/
passport.use(new AzureAdOAuth2Strategy({
  clientID: 'ae0a0434-6d76-4536-8409-00124384c7fa',
  clientSecret: 'moE7nOuiwWu0uVgD78K9BzmJLjt9P/mifB5S8xPdTEE=',
  callbackURL: 'http://localhost:8008/auth/azureadoauth2/callback',
  tenant: 'floridavocational.onmicrosoft.com'
},
function (accessToken, refresh_token, params, profile, done) {
  var waadProfile = profile || jwt.decode(params.id_token);

  console.log(JSON.stringify(waadProfile));
}));

app.get('/', (req,res) => res.end(`<html><head><title>login page</title></head>
        <body>
          <h1>login page</h1>
          <form method='POST' action='/auth/azureadoauth2/callback?username=vmoreno@fvi.edu&password=Dpqf6ed49.'>
            <input type='submit' value='log in'>
          </form>
        </body>
  `));

app.listen(8008);
console.log(`App listening on port ${port}`);
