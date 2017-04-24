var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('sql/players.sqlite3');
const pug = require('pug');

router.get('/', function(req, res, next) {
  var sess = req.session;
  db.all('SELECT * FROM "daily"', function(e, result) {
    if(e)
      throw e;
    res.render('checkin', {user: sess.username, names: result});
  });
});

router.post('/', function(req, res, next) {
  var sess = req.session;
  var post = req.body;
  //Error buffer
  var error;
  if(post.name) {
    db.serialize(function() {
      db.run('INSERT INTO "daily" ("name") VALUES (?)', post.name, function(e) {
        if(e && e.errno !== 19)
          throw e;
        else if(e && e.errno === 19)
          error = 'Player has already been checked in.'
      });
      db.all('SELECT * FROM "daily"', function(e, result) {
        if(e)
          throw e;
        res.render('checkin', {user: sess.username, names: result, error: error});
      });
    });
  }
});

module.exports = router;
