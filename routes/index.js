var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var UserData = require('../db.js').UserData;

/* GET home page. */
router.get('/', function(req, res, next) {
  msg = 'ログインしていません';
  if(req.session != null || req.body.logout == "true"){
    if(req.session.login == true){
      msg = req.session.name + 'でログインしています';
      var user_id = req.session.user_id;
      UserData.find(function(err,docs){
        if(err){
          console.log(err);
        }
        docs.sort(function(a,b){
          if(Date.parse(a.tweet[0].date) > Date.parse(b.tweet[0].date)) return -1;
          if(Date.parse(a.tweet[0].date) < Date.parse(b.tweet[0].date)) return 1;
          return 0;
        });
        res.render('index', {
          msg: msg,
          docs : docs,
          id : user_id
        });
      });
    }else{
      res.render('index', {
        msg: msg,
        docs : [],
        id : ""
      });
    }
  }else{
    res.render('index', {
      msg: msg,
      docs : [],
      id : ""
    });
  }
});

/* POST home page. */
router.post('/', function(req, res, next) {
  var user_id = req.body.user_id;
  var msg = '';
  UserData.find(function(err,docs){
    if(err){
      console.log(err);
    }
    var user_name = serchName(docs,user_id);
    if(user_name != null && user_id != null){
      msg = user_name + 'でログインしました';
      req.session.login = true;
      req.session.name = user_name;
      req.session.user_id = user_id;
      docs.sort(function(a,b){
        if(Date.parse(a.tweet[0].date) > Date.parse(b.tweet[0].date)) return -1;
        if(Date.parse(a.tweet[0].date) < Date.parse(b.tweet[0].date)) return 1;
        return 0;
      });
      res.render('index', {
        msg : msg,
        docs : docs,
        id : user_id
      });
    }else if(req.body.logout == "true"){
      req.session.login = false;
      req.session.id = "";
      res.render('index', {
        msg : 'ログアウトしました',
        docs : [],
        id : ""
      });
    }else{
      req.session.login = false;
      req.session.id = "";
      res.render('index', {
        msg: 'ログインに失敗しました',
        docs : [],
        id : ""
      });
    }
  });
});

module.exports = router;

// --- functions ---
serchName = function(db_data,serchId){
  name = null;
  for (var i = 0; i < db_data.length; i++) {
    if(db_data[i].id == serchId){
      name = db_data[i].name;
    }
  }
  return(name);
}
