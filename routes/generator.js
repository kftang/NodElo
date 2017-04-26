var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('sql/players.sqlite3');
const pug = require('pug');

function shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
}

router.get('/', function(req, res, next) {
  var sess = req.session;
  if(!sess || !sess.username)
    return res.redirect('/login');
  db.all('SELECT * FROM "daily"', function(e, result) {
    if(e)
      throw e;
      res.render('generator', {user: sess.username});
  });
});

router.post('/', function(req, res, next) {
  var post = req.body;
  var sess = req.session;
  if(!sess || !sess.username)
    return res.redirect('/login');
  if(post.generate !== undefined) {
    db.all('SELECT * FROM "daily"', function(e, result) {
      if(e)
        throw e;
      shuffle(result);
      var pairs = [];
      for(var i = 0; i < result.length; i += 2) {
        if(result.length == i + 1)
          pairs.push({player: result[i].name, opponent: 'No Opponent :('});
        else
          pairs.push({player: result[i].name, opponent: result[i + 1].name});
      }
      res.render('generator', {user: sess.username, pairs: pairs});
    });
  }

});

module.exports = router;
