//TODO: Integrate with the glicko library
var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('sql/players.sqlite3', sqlite3.OPEN_READWRITE, function(e) {
  if(e)
    throw e;
});
var glicko2 = require('glicko2');
var currentRanking = new glicko2.Glicko2({
  tau : 0.5,
  rating : 1500,
  rd : 200,
  vol : 0.06
});
var matches = [];
const pug = require('pug');


/* GET home page. */
router.get('/', function(req, res, next) {
  //Populate players from DB
  db.all('SELECT * FROM "players"', [], function(e, players) {
    if(e)
      throw e;
    players.sort(function(a, b) {
      return b.elo - a.elo;
    });
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
  console.log(post);
  if(post.winner && post.loser) {
    //TODO: Calculate elo changes here
    //TODO: Add to game log
    db.all('SELECT * FROM "players"', function(e, result) {
      if(e)
        throw e;
      result.sort(function(a, b) {
        return b.elo - a.elo;
      });
      //TODO: this doesn't work lol
      for(var i = 0; i < result.length; i++)
        result[i].gli = currentRanking.makePlayer(result[i].rating, result[i].rd, rating[i].vol);
      var winner = result[post.winner].gli;
      var loser = result[post.loser].gli;
      matches.push([winner, loser, 1]);
      var log = [result[post.winner].name + ' vs. ' + result[post.loser].name, result[post.winner].name];
      db.serialize(function() {
        db.all('SELECT * FROM "players"', [], function(e, players) {
          if(e)
            throw e;
          players.sort(function(a, b) {
            return b.rating - a.rating;
          });
          res.render('rankings', {players: players, user: req.session.username, error: error });
        });
        db.run('INSERT INTO "gamelog" ("matchup", "winner") VALUES (?, ?)', log, function(e) {
          if(e)
            throw e;
        });
      });
    });
  } else if(post.addname) {
    //Add player into database
    db.serialize(function() {
      db.run('INSERT INTO "players" ("name") VALUES (?)', post.addname, function(e) {
        //Error Occured
        if(e)
          if(e.errno === 19)
            error = 'Name already exists!';
      });
      db.all('SELECT * FROM "players"', [], function(e, players) {
        if(e)
          throw e;
        players.sort(function(a, b) {
          return b.rating - a.rating;
        });
        res.render('rankings', {players: players, user: req.session.username, error: error });
      });
    });
  } else if(post.removename) {
    db.serialize(function() {
      db.run('DELETE FROM "players" WHERE "name" = ?', post.removename, function(e) {
        if(e)
          error = 'Error while deleting user';
      });
      db.all('SELECT * FROM "players"', [], function(e, players) {
        if(e)
          throw e;
        players.sort(function(a, b) {
          return b.rating - a.rating;
        });
        res.render('rankings', {players: players, user: req.session.username, error: error });
      });
    });
  } else {
    //Populate players from database
    db.all('SELECT * FROM "players"', [], function(e, players) {
      if(e)
        throw e;
      players.sort(function(a, b) {
        return b.rating - a.rating;
      });
      res.render('rankings', {players: players, user: req.session.username, error: error });
    });
  }
});

module.exports = router;
