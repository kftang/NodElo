var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('sql/players.sqlite3');
var secrets = require('.././secrets.json');
var crypt = require('../crypt');
const pug = require('pug');




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
  console.log(req.body);
  if(req.session && req.session.username)
    return res.redirect('/dashboard');
  return res.render('login', {user: req.session.username});
});

router.get('/signout', function(req, res, next) {
  console.log('signout');
  delete req.session.username;
  res.redirect('/');
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
