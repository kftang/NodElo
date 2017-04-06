var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('sql/players.sqlite3');
const pug = require('pug');

db.run('CREATE TABLE IF NOT EXISTS "players" ("name" TEXT NOT NULL UNIQUE, "elo" INT NOT NULL DEFAULT 1200, "hasChange" BOOLEAN NOT NULL DEFAULT FALSE, "change" BOOLEAN)');

/* GET home page. */
router.get('/', function(req, res, next) {
  var players = {};
  //Populate players from DB
  db.all('SELECT * FROM "players"', {}, function(e, val) {
    players = val;
    res.render('scores', {players: players, isLoggedIn: true, user: 'kenny' });
  });
});

/* POST home page*/
router.post('/', function(req, res, next) {
  var post = req.body;
  var error;
  console.log(post);
  if(post.addname != null) {
    db.run('INSERT INTO "players" ("name") VALUES (?)', post.addname, function(e) {
      //Error Occured
      if(e != null)
        if(e.errno == 19)
          error = 'Name already exists!';
    });
    console.log('New player ' + post.name + ' added.');
  }
  if(post.removename != null)
      db.run('DELETE FROM "players" WHERE "name" = ?', post.removename, function(e) {
        error = 'Error while deleting user'
      });
  var players = {};
  db.all('SELECT * FROM "players"', {}, function(e, val) {
    players = val;
  });
  if(typeof(error) != 'undefined')
    res.render('scores', {players: players, isLoggedIn: true, user: 'kenny', error: error });
  else
    res.render('scores', {players: players, isLoggedIn: true, user: 'kenny' });
});

module.exports = router;
