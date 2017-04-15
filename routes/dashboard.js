var express = require('express');
var router = express.Router();
const pug = require('pug');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('sql/players.sqlite3');

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
  if(!sess || !sess.username)
    return res.redirect('/login');
  console.log(post);
  if(post.deluser) {

  } else if(post.newuser) {

  } else {
    db.all('SELECT * FROM "logins"', [], function(e, logins) {
      return res.render('dashboard', {user: sess.username, 'logins': logins});
    });
  }
});

module.exports = router;
