var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('sql/players.sqlite3');
const pug = require('pug');

router.get('/', function(req, res, next) {
  res.render('tournament');
});

module.exports = router;
