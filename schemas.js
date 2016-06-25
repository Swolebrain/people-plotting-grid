var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var db = require('./.configdb');

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
module.exports = {
  AppState : mongoose.model('AppState', AppStateSchema)

};
