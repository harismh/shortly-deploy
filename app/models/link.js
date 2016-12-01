var database = require('../config');
var schemas = database.schemas;
var crypto = require('crypto');
var mongoose = require('mongoose');

// var Link = db.Model.extend({
//   tableName: 'urls',
//   hasTimestamps: true,
//   defaults: {
//     visits: 0
//   },
//   initialize: function() {
//     this.on('creating', function(model, attrs, options) {
//       var shasum = crypto.createHash('sha1');
//       shasum.update(model.get('url'));
//       model.set('code', shasum.digest('hex').slice(0, 5));
//     });
//   }
// });

var Schema = mongoose.Schema;

var linkSchema = new Schema({
  url: { type: String, required: true, unique: true },
  baseUrl: String,
  code: String,
  title: String,
  visits: Number,
  timestamps: Date
});

linkSchema.pre('save', function(next) {
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code = shasum.digest('hex').slice(0, 5);
});

var Link = mongoose.model('Link', linkSchema);


module.exports = Link;
