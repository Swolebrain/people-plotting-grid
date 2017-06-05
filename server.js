"use strict";
var port = 8008;
var express = require('express');
var app = express();
var jwt = require('express-jwt');
var cors = require('cors');
var bodyParser = require('body-parser');

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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use('/api', jwtCheck);

var states = {};

var schemas = require('./schemas.js');
var AppState = schemas.AppState;

app.post('/api', (req,res) => {
  var user = req.body.user;
  console.log("got a POST from "+user);
  console.log("State info in request: "+JSON.stringify(req.body));
  if (!req.body.state.evals){
    return res.end("Ignoring this POST");
  }

  AppState.findOne({user: user}, '-_id', (err, doc ) =>{
    if (err){
      res.end("Error querying mongodb");
      return;
    }
    if (doc){
      console.log("Received POST for pre-existing user");
      var conditions = { user: user }
          , update = { $set: { state: req.body.state }}
          , options = { multi: false };
      AppState.update(conditions, update, options, function(err, numAffected){
        if (err){
          res.end("error updating state for user "+user);
        }
        console.log("valid POST from "+user+", doc state:\n"+JSON.stringify(doc.toObject()));
        console.log("number of documents affected: "+JSON.stringify(numAffected));
        res.end(JSON.stringify(doc.toObject()));
      });

    }
    else{
      console.log("Creating new user due to POST");
      let userState = new AppState(req.query);
      userState.save((err, state) => {
        if (err) res.end("Error saving new user to db "+ err);
        else res.end("valid request from "+user+" to store new doc in db. State:\n"+JSON.stringify(state));
      });
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

const admins = [
  'sysop@fvi.edu',
  'kwade@nhflorida.com',
  'dantunes@fvi.edu',
  'agirnun@fvi.edu'
];
app.get('/api', (req, res) => {
  console.log("GET request from "+req.query.user);
  handleUserLoad(req, res);
});

function handleUserLoad(req, res){
  AppState.findOne({"user": req.query.user}, '-_id', function(err, doc){
    if (err){
      console.log("Error: "+err);
      return res.json({error: err});
    }
    if (!doc){
      return res.json({type: 'user', payload: {}});
    }
    var docObj = doc.toObject();
    if (admins.indexOf(req.query.user) >= 0){
      handleAdminLoad(req, res, docObj);
    }
    else {
      res.json({type: 'user', payload: docObj});
    }
  });
}

function handleAdminLoad(req, res, adminData){
  var domain = req.query.user.split('@')[1];
  AppState.find({"user": new RegExp('^.*@'+domain, 'i')}, '-_id', function(err, docs){
    if (err){
      console.log("Error: "+err);
      res.end(err);
    }
    var response = {type: 'admin', payload: adminData, otherManagers: docs};
    res.json(response);
  });
}



app.listen(8008);
console.log(`App listening on port ${port}`);
