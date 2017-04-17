var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('sql/players.sqlite3', sqlite3.OPEN_READWRITE, function(e) {
  if(e)
    throw e;
});
var secrets = require('.././secrets.json');
var crypt = require('../crypt');
const pug = require('pug');

router.get('/', function(req, res, next) {
  //Redirect to dashboard if logged in
  if(req.session && req.session.username)
    return res.redirect('/dashboard');
  return res.render('login', {user: req.session.username});
});

router.get('/signout', function(req, res, next) {
  //Signout by deleteing session and redirect to home page
  delete req.session.username;
  res.redirect('/');
});

router.post('/', function(req, res, next) {
  var post = req.body;
  var sess = req.session;
  //If given a username and password
  if(post.username && post.password) {
    db.all('SELECT * FROM "logins" WHERE "username" = ?', [post.username], function(e, login) {
      //If login succeeds, redirect to dashboard and create session
      if(login[0] && crypt.verify(post.password, login[0].password, login[0].salt)) {
          sess.username = post.username;
          return res.redirect('/dashboard');
      }
      //Show login failed
      res.render('login', {failed: true, user: sess.username});
    });
  } else
    return res.render('login', {failed: true, user: sess.username});
});

module.exports = router;
