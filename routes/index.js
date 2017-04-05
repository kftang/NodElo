var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('sql/players.sqlite3');
const pug = require('pug');


db.serialize(function() {
  db.run('CREATE TABLE IF NOT EXISTS "players" ("name" TEXT NOT NULL, "elo" INT NOT NULL, "hasChange" BOOLEAN NOT NULL DEFAULT FALSE, "change" BOOLEAN)');
});

var players = {};
db.all('SELECT * FROM "players"', {}, function(e, val) {
  players = val;
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('scores', {players: players, isLoggedIn: true, user: 'kenny' });
});

/*POST home page*/
router.post('/', function(req, res, next) {
  res.render('scores', {players: players, isLoggedIn: true, user: 'kenny' });
});

module.exports = router;
