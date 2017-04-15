var express = require('express');
var router = express.Router();
const pug = require('pug');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('sql/players.sqlite3');
var secrets = require('.././secrets.json');
var crypt = require('../crypt');

router.get('/', function(req, res, next) {
  var sess = req.session;
  if(!sess || !sess.username)
    return res.redirect('/login');
  db.all('SELECT * FROM "logins"', [], function(e, logins) {
    return res.render('dashboard', {user: sess.username, 'logins': logins});
  });
});

router.post('/', function(req, res, next) {
  var post = req.body;
  var sess = req.session;
  var err;
  var suc;
  if(!sess || !sess.username)
    return res.redirect('/login');
  console.log(post);
  if(post.deluser) {
    if(post.deluser === secrets.default.username) {
      err = 'Cannot delete default user';
    } else if(post.deluser === sess.username) {
      err = 'Cannot delete yourself silly!';
    } else {
      db.run('DELETE FROM "logins" WHERE "username" = ?', [post.deluser], function(e) {
        if(e)
          throw e;
        else
          suc = 'User ' + post.deluser + ' has been deleted!';
      });
    }
  } else if(post.username) {
    var hashed = crypt.hash(post.password);
    db.run('INSERT INTO "logins" ("username", "password", "salt") VALUES (?, ?, ?)', [post.username, hashed.hash, hashed.salt], function(e) {
      if(e)
        if(e.errno === 19)
          err = 'User already exists!';
        else
          throw e;
      else
        suc = 'User ' + post.username + ' has been added!';
    });
  }
  db.all('SELECT * FROM "logins"', [], function(e, logins) {
    return res.render('dashboard', {user: sess.username, 'logins': logins, error: err, success: suc});
  });
});

module.exports = router;
