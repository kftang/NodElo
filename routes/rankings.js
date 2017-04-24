var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('sql/players.sqlite3', sqlite3.OPEN_READWRITE, function(e) {
  if (e)
    throw e;
});
var glicko2 = require('glicko2');
var currentRanking = new glicko2.Glicko2({
  tau: 0.5,
  rating: 1500,
  rd: 100,
  vol: 0.06
});
var matches = [];
var glickoObjs = [];
const pug = require('pug');
var ranks = {
  init: function() {
    db.all('SELECT * FROM "players"', function(e, result) {
      if (e)
        throw e;
      for (var i = 0; i < result.length; i++) {
        var player = result[i];
        glickoObjs[player.name] = (currentRanking.makePlayer(player.rating, player.rd, player.vol));
      }
    });
  },
  save: function(callback) {
    currentRanking.updateRatings(matches);
    db.all('SELECT * FROM "players"', function(e, result) {
      if (e)
        throw e;
      for (var i = 0; i < result.length; i++) {
        var name = result[i].name;
        var glickoObj = glickoObjs[name];
        var dRating = glickoObj.getRating() - result[i].rating
        var change = dRating > 0;
        if(dRating) {
          var newInfo = [glickoObj.getRating(), glickoObj.getRd(), glickoObj.getVol(), change, name];
          db.run('UPDATE "players" SET "rating" = ?, "rd" = ?, "vol" = ?, "change" = ? WHERE "name" = ?', newInfo);
        } else {
          var newInfo = [glickoObj.getRating(), glickoObj.getRd(), glickoObj.getVol(), name];
          db.run('UPDATE "players" SET "rating" = ?, "rd" = ?, "vol" = ? WHERE "name" = ?', newInfo);
        }
      }
      if(callback)
        callback();
    });
    matches = [];
  },
  resetPending: function() {
    matches = [];
  }
};

function renderPlayers(res, user) {
  var renderObj = {user: user};
  for(var i = 2; i < arguments.length - 1; i+=2)
    renderObj[arguments[i]] = arguments[i + 1];
  console.log(renderObj);
  db.all('SELECT * FROM "players"', [], function(e, players) {
    renderObj.players = players;
    if (e)
      throw e;
    players.sort(function(a, b) {
      return b.rating - a.rating;
    });
    res.render('rankings', renderObj);
  });
};

/* GET home page. */
router.get('/', function(req, res, next) {
  //Populate players from DB
  renderPlayers(res, req.session.username);
});

/* POST home page*/
router.post('/', function(req, res, next) {
  var post = req.body;
  var error;
  if (post.winner && post.loser) {
    db.all('SELECT * FROM "players"', function(e, result) {
      if (e)
        throw e;
      result.sort(function(a, b) {
        return b.rating - a.rating;
      });
      //Add match to considered glicko rating
      var winner = glickoObjs[result[post.winner].name];
      var loser = glickoObjs[result[post.loser].name];
      matches.push([winner, loser, 1]);
      //Log contents
      var log = [result[post.winner].name + ' vs. ' + result[post.loser].name, result[post.winner].name];
      db.run('INSERT INTO "gamelog" ("matchup", "winner") VALUES (?, ?)', log);
      renderPlayers(res, req.session.username, 'error', error);
    });
  } else if (post.addname) {
    //Add player into database
    db.run('INSERT INTO "players" ("name") VALUES (?)', post.addname, function(e) {
      //Error Occured
      if (e && e.errno == 19)
        error = 'Name already exists!';
      else if (e)
        throw e;
      glickoObjs[post.addname] = (currentRanking.makePlayer());
      renderPlayers(res, req.session.username, 'error', error);
    });
  //If admin is removing a person
  } else if (post.removename) {
    db.run('DELETE FROM "players" WHERE "name" = ?', post.removename, function(e) {
      if (e)
        error = 'Error while deleting user';
      renderPlayers(res, req.session.username, 'error', error);
    });
  } else if(post.save !== undefined) {
    ranks.save(function() {
      renderPlayers(res, req.session.username);
    });
  } else if(post.reset !== undefined) {
    console.log('resetting');
    ranks.resetPending();
    renderPlayers(res, req.session.username);
  }
});

module.exports = {
  'router': router,
  'ranks': ranks
};
