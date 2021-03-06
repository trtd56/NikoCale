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
      user_name = req.session.name;
      var user_id = req.session.user_id;
      UserData.find(function(err,docs){
        if(err){
          console.log(err);
        }
        timeline = sortForTimeline(docs);
        idNameTable = generateIdNameTable(docs);
        res.render('index', {
          msg: msg,
          docs : timeline,
          id : user_id,
          show_name: user_name,
          id_name_table : idNameTable
        });
      });
    }else{
      res.render('index', {
        msg: msg,
        docs : [],
        id : "",
        show_name : "",
        id_name_table : {}
      });
    }
  }else{
    res.render('index', {
      msg: msg,
      docs : [],
      id : "",
      show_name : "",
      id_name_table : {}
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
      timeline = sortForTimeline(docs);
      idNameTable = generateIdNameTable(docs);
      res.render('index', {
        msg : msg,
        docs : timeline,
        id : user_id,
        show_name: user_name,
        id_name_table : idNameTable
      });
    }else if(req.body.logout == "true"){
      req.session.login = false;
      req.session.id = "";
      res.render('index', {
        msg : 'ログアウトしました',
        docs : [],
        id : "",
        show_name : "",
        id_name_table : {}
      });
    }else{
      req.session.login = false;
      req.session.id = "";
      res.render('index', {
        msg: 'ログインに失敗しました',
        docs : [],
        id : "",
        show_name : "",
        id_name_table : {}
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

sortForTimeline = function(docs){
  res = []
  count = 0
  for (var i = 0; i < docs.length; i++) {
    person = docs[i]
    for (var j = 0; j < person.tweet.length; j++) {
      res[count] = {"tweet":person.tweet[j].word,"date":person.tweet[j].date,"feeling":person.tweet[j].feeling,"name":person.name,"_id":person._id,'tweetId':person.tweet[j]._id, 'like':person.tweet[j].like};
      count++;
    }
  }
  res.sort(function(a,b){
    if(Date.parse(a.date) > Date.parse(b.date)) return -1;
    if(Date.parse(a.date) < Date.parse(b.date)) return 1;
    return 0;
  });
  return(res);
}

generateIdNameTable = function(docs){
  idList = [];
  nameList = [];
  for (var i = 0; i < docs.length; i++) {
    idList.push(docs[i].id);
    nameList.push(docs[i].name);
  }
  res = {"id":idList,"name":nameList}
  return(res)
}
