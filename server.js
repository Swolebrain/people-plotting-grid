"use strict";
var port = 8008;
var express = require('express');
var app = express();
var jwt = require('express-jwt');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var db = require('./.configdb');

var AppState = new Schema({
  user: String,
  state: {
        coreVals    : {
                        SS: String,
                        Acc: String,
                        Asp: String,
                        Com: String,
                        Exx: String,
                        Giv: String
                      },
        evaluations : [
                        {
                          name        :   String,
                          scoreCard   :   [
                                            { name: String, score: Number, weight: Number}
                                          ],
                          coreVals    : {
                                  				SS: String,
                                  				Acc: String,
                                  				Asp: String,
                                  				Com: String,
                                  				Exx: String,
                                  				Giv: String
                      			             }
                        }
                      ]
          }
});
mongoose.connect('mongodb://' + db.user + ':' + db.pass + '@' + db.host + ':' + db.port + '/' + db.name);
mongoose.model('AppState', AppState);

var jwtCheck = jwt({
  secret: new Buffer('UUbQ3KTvY1B1xS-lD-fcSGpT3ZglxXsC20I6DHklKLCzHUD5ltmXsuF6muih5Uux', 'base64'),
  audience: 'trDPfReklgtHuU9vMwYtEYBGTz0nuLgp'
});

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    next();
}
app.use(allowCrossDomain);

app.use('/api', jwtCheck);

var states = {};

app.options('/api', (req, res) => res.end(200));

app.post('/api', (req,res) => {
  var user = req.query.user;
  console.log("got a request from "+user);
  //states[user] = req.query.state;
  var userState = new AppState(req.query);
  userState.save((err, state) => {
    if (err) res.end("Error saving to db "+ err);
    else res.end("valid request from "+user+" state:\n"+JSON.stringify(state));
  });
  //console.log("got a request - current state \n"+JSON.stringify(statesnode ));

});

app.listen(8008);
console.log(`App listening on port ${port}`);
