var database = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');

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
  next();
});

var Link = mongoose.model('Link', linkSchema);


module.exports = Link;
