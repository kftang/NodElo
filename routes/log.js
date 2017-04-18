var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('sql/players.sqlite3');
const pug = require('pug');

router.get('/', function(req, res, next) {
  db.all('SELECT * FROM "gamelog"', function(e, result) {
    if(e)
      throw e;
    res.render('log', {log: result, user: req.session.username});
  });
});

module.exports = router;
