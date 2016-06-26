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

/*var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    next();
}
app.use(allowCrossDomain);*/
app.use(cors({origin: '*'}));

app.use('/api', jwtCheck);

var states = {};

var schemas = require('./schemas.js');
var AppState = schemas.AppState;

app.post('/api', (req,res) => {
  var user = req.query.user;
  console.log("got a request from "+user);
  console.log("State info in request: "+JSON.stringify(req.query));
  //states[user] = req.query.state;
  AppState.findOne({user: user}, '-_id', (err, doc ) =>{
    if (err){
      res.end("Error querying mongodb");
    }
    else {
      if (doc){
        doc.state = req.query.state;
        console.log("valid request from "+user+" state:\n"+JSON.stringify(doc.toObject()));
        res.end(JSON.stringify(doc.toObject()));
      }
      else{
        let userState = new AppState(req.query);
        userState.save((err, state) => {
          if (err) res.end("Error saving new user to db "+ err);
          else res.end("valid request from "+user+" to store new doc in db. State:\n"+JSON.stringify(state));
        });
      }
    }
  });
  /*
  let userState = new AppState(req.query);
  userState.save((err, state) => {
    if (err) res.end("Error saving to db "+ err);
    else res.end("valid request from "+user+" state:\n"+JSON.stringify(state));
  });*/
  //console.log("got a request - current state \n"+JSON.stringify(statesnode ));

});

app.get('/api', (req, res) => {
  console.log("Got a request from "+req.query.user);
  AppState.findOne({"user": req.query.user}, '-_id', function(err, doc){
    if (err){
      console.log("Error: "+err);
      res.end(err);
    }
    else{
      console.log("Found users: "+JSON.parse(doc.toObject()));
      res.end(JSON.stringify(doc.toObject()));
    }
  });
});

app.listen(8008);
console.log(`App listening on port ${port}`);
