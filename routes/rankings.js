var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('sql/players.sqlite3', sqlite3.OPEN_READWRITE, function(e) {
  if(e)
    throw e;
});
const pug = require('pug');


/* GET home page. */
router.get('/', function(req, res, next) {
  //Populate players from DB
  db.all('SELECT * FROM "players"', [], function(e, players) {
    if(e)
      throw e;
    res.render('rankings', {players: players, user: req.session.username });
  });
});

/* POST home page*/
router.post('/', function(req, res, next) {
  //Get posted information as an object
  var post = req.body;
  //Error buffer that will be displayed
  var error;
  //If the user wants to add a player
  if(post.addname) {
    //Add player into database
    db.run('INSERT INTO "players" ("name") VALUES (?)', post.addname, function(e) {
      //Error Occured
      if(e)
        if(e.errno === 19)
          error = 'Name already exists!';
    });
  }
  //If the user wants to remove a player
  if(post.removename) {
    db.run('DELETE FROM "players" WHERE "name" = ?', post.removename, function(e) {
      if(e)
        error = 'Error while deleting user';
    });
  }
  //Populate players from database
  db.all('SELECT * FROM "players"', [], function(e, players) {
    if(e)
      throw e;
      res.render('rankings', {players: players, user: req.session.username, error: error });
  });
});

module.exports = router;