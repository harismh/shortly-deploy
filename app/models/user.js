var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var mongoose = require('mongoose');


var Schema = mongoose.Schema;

userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  timestamps: Date
});


var User = mongoose.model('User', userSchema);

User.comparePassword = function(attemptedPassword, hashed, callback) {
  bcrypt.compare(attemptedPassword, hashed, function(err, isMatch) {
    callback(isMatch);
  });
};

User.hashPassword = function() {
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      return hash;
    });
};

userSchema.post('save', function() {
  User.hashPassword();
});

module.exports = User;
