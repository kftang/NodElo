var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('sql/players.sqlite3');
var crypto = require('crypto');
var secrets = require('.././secrets.json');
const pug = require('pug');
var crypt = {
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
  verify: function(password, hash, salt) {
    var hasher = crypto.createHmac('sha512', salt);
    hasher.update(password);
    return hash === hasher.digest('hex');
  }
};




db.run('CREATE TABLE IF NOT EXISTS "logins" ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "username" TEXT NOT NULL UNIQUE, "password" TEXT NOT NULL, "salt" TEXT NOT NULL)', [], function(e) {
  if(e)
    throw e;
  var crypted = crypt.hash(secrets.default.password);
  var defaultLogin = [secrets.default.username, crypted.hash, crypted.salt];
  db.run('INSERT INTO "logins" ("username", "password", "salt") VALUES (?, ?, ?)', defaultLogin, function(e) {
    if(e && e.errno != 19)
      throw e;
  });
});

router.get('/', function(req, res, next) {
  if(req.session && req.session.username)
    return res.redirect('/dashboard');
  return res.render('login', {user: req.session.username});
});

router.post('/', function(req, res, next) {
  var post = req.body;
  var sess = req.session;
  var invalid = false;
  if(post.username && post.password) {
    db.all('SELECT * FROM "logins" WHERE "username" = ?', [post.username], function(e, login) {
      if(login[0] && crypt.verify(post.password, login[0].password, login[0].salt)) {
          sess.username = post.username;
          return res.redirect('/dashboard');
      }
      return res.render('login', {failed: true, user: sess.username});
    });
  } else
  return res.render('login', {failed: true, user: sess.username});
});

module.exports = router;
