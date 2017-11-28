"use strict";
const port = 8008;
const express = require('express');
const app = express();
const jwt = require('express-jwt');
const cors = require('cors');
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');

const jwtCheck = jwt({
  secret: new Buffer('UUbQ3KTvY1B1xS-lD-fcSGpT3ZglxXsC20I6DHklKLCzHUD5ltmXsuF6muih5Uux', 'base64'),
  audience: 'trDPfReklgtHuU9vMwYtEYBGTz0nuLgp'
});

app.set('port', port);
app.use(function(req,res,next){
  console.log(req.domain);
  console.log(req.headers);
  next();
});


app.use(cors({origin: '*'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use('/api', jwtCheck);

const states = {};

const schemas = require('./schemas.js');
const AppState = schemas.AppState;

app.get('/', function(req, res){
  console.log("This is a test");
});

app.post('/api', (req,res) => {
  const user = req.body.user;
  console.log("got a POST from "+user);
  console.log("State info in request: "+JSON.stringify(req.body));
  if (!req.body.state.evals){
    console.log("ignoring this POST");
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
        console.log("valid POST from "+user+", new state:\n"+JSON.stringify(req.body.state));
        console.log("number of documents affected: "+JSON.stringify(numAffected));
        res.end(JSON.stringify(req.body.state));
      });

    }
    else{
      console.log("Creating new user due to POST");
      let userState = new AppState(req.body);
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
  'agirnun@fvi.edu',
  'vmoreno@nhflorida.com',
  'gbonwitt@nhflorida.com'
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
    if (!doc && admins.indexOf(req.query.user) === -1){
      return res.json({type: 'user', payload: {}});
    }
    var docObj = doc ? doc.toObject() : {
      user: req.query.user.toLowerCase(),
      state: {
        coreVals: {},
        evals:[]
      }
    };
    if (admins.indexOf(req.query.user) >= 0){
      handleAdminLoad(req, res, docObj);
    }
    else {
      res.json({type: 'user', payload: docObj});
    }
  });
}

function handleAdminLoad(req, res, adminData){
  console.log("Handling admin load");
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


const env = process.env.NODE_ENV || 'dev';

if (env === 'dev'){
  app.listen(app.get('port'), ()=>console.log(`Server listening on port ${app.get('port')}`));
}
else {
  let httpsOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/apps.techlaunch.io/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/apps.techlaunch.io/fullchain.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/apps.techlaunch.io/chain.pem')
  };
  
  https.createServer(httpsOptions, app)
    .listen(app.get('port'), ()=>console.log(`Server listening on port ${app.get('port')}`));
}
