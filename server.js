"use strict";
var port = 8008;
var express = require('express');
var app = express();
var jwt = require('express-jwt');
var cors = require('cors');

var jwtCheck = jwt({
  secret: new Buffer('UUbQ3KTvY1B1xS-lD-fcSGpT3ZglxXsC20I6DHklKLCzHUD5ltmXsuF6muih5Uux', 'base64'),
  audience: 'trDPfReklgtHuU9vMwYtEYBGTz0nuLgp'
});

app.use(cors());

app.use('/api', jwtCheck);

var states = {};

app.post('/api', (req,res) => {
  var user = req.query.user;
  states[user] = req.query.state;
  console.log("got a request - current state \n"+JSON.stringify(states));
  res.end("valid request from "+user+" state:\n");
});

app.listen(8008);
console.log(`App listening on port ${port}`);
