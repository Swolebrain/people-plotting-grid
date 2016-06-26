var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var db = require('./.configdb');

var ScoreCardSchema = new Schema({ name: String, weight: String, score: String}, {_id: false});

var SingleEvalSchema = new Schema({
  name        :   String,
  scorecard   :   [ ScoreCardSchema ],
  coreVals    : {
                  SS: String,
                  Acc: String,
                  Asp: String,
                  Com: String,
                  Exx: String,
                  Giv: String
                 }
}, { _id: false });

var AppStateSchema = new Schema({
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
        evals : [ SingleEvalSchema  ]
          }
}, {_id: false});
mongoose.connect('mongodb://' + db.user + ':' + db.pass + '@' + db.host + ':' + db.port + '/' + db.name);
module.exports = {
  AppState : mongoose.model('AppState', AppStateSchema)

};
