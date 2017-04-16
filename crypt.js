var crypto = require('crypto');

var crypt = {
  //Returns the password as a hash and salt
  hash: function(password) {
    var salt = crypto.randomBytes(8).toString('hex');
    var hasher = crypto.createHmac('sha512', salt);
    hasher.update(password);
    var hash = hasher.digest('hex');
    return {
      salt: salt,
      hash: hash
    };
  },
  //Returns whether or not a password matches a hash and salt
  verify: function(password, hash, salt) {
    var hasher = crypto.createHmac('sha512', salt);
    hasher.update(password);
    return hash === hasher.digest('hex');
  }
};

module.exports = crypt;
