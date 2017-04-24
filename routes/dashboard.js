var express = require('express');
var router = express.Router();
const pug = require('pug');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('sql/players.sqlite3');
var secrets = require('.././secrets.json');
var crypt = require('../crypt');
var ranks = require('./rankings').ranks;

router.get('/', function(req, res, next) {
  var sess = req.session;
  //Redirect to login page if not logged in (session.username does not exist)
  if(!sess || !sess.username)
    return res.redirect('/login');
  //Populate dashboard page with logins for the dropdown box
  db.all('SELECT * FROM "logins"', [], function(e, logins) {
    return res.render('dashboard', {user: sess.username, 'logins': logins});
  });
});

router.post('/', function(req, res, next) {
  var post = req.body;
  var sess = req.session;
  //Error and success buffers
  var err;
  var suc;
  //Redirect if not logged in
  if(!sess || !sess.username)
    return res.redirect('/login');
  //If we're saving ranks
  if(post.save !== undefined) {
    ranks.save();
  } else if(post.reset !== undefined) {
    db.run('DELETE FROM "daily"', function(e) {
      if(e)
        throw e;
    });
  }
  //If we're deleting a user
  if(post.deluser) {
    //Check for default user or self
    if(post.deluser === secrets.default.username) {
      err = 'Cannot delete default user';
    } else if(post.deluser === sess.username) {
      err = 'Cannot delete yourself silly!';
    } else {
      //Delete user from db and fill success buffer
      db.run('DELETE FROM "logins" WHERE "username" = ?', [post.deluser], function(e) {
        if(e)
          throw e;
        else
          suc = 'User ' + post.deluser + ' has been deleted!';
      });
    }
    //If we're adding a user
  } else if(post.username) {
    //Get the new user's password hash and salt
    var hashed = crypt.hash(post.password);
    //Add the new user and fill the success or error buffer
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
  //Populate dashboard page with logins from dropdown and with success and error buffer
  db.all('SELECT * FROM "logins"', [], function(e, logins) {
    res.render('dashboard', {user: sess.username, 'logins': logins, error: err, success: suc});
  });
});

module.exports = router;
