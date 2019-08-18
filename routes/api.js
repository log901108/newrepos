const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const router = express.Router();
require('../config/passport')(passport);
const Product = require('../models').Product;
const User = require('../models').User;
const signin_trial_tbl = require('../models').signin_trial_tbl;

const requestIp = require('request-ip');
const validator = require('validator');

const Check = require('../middleware');

router.post('/signup', function(req, res) {
  console.log(req.body);
  if (!req.body.username || !req.body.password) {
    res.status(400).send({msg: 'Please pass username and password.'});
  } else {
    User
      .create({
        username: req.body.username,
        password: req.body.password
      })
      .then((user) => res.status(201).send(user))
      .catch((error) => {
        console.log(error);
        res.status(400).send(error);
      });
  }
});
/*
router.post('/signin', function(req, res) {
  User
      .findOne({
        where: {
          username: req.body.username
        }
      })
      .then((user) => {
        if (!user) {
          return res.status(401).send({
            message: 'Authentication failed. User not found.',
          });
        }
        user.comparePassword(req.body.password, (err, isMatch) => {
          if(isMatch && !err) {
            var token = jwt.sign(JSON.parse(JSON.stringify(user)), 'nodeauthsecret', {expiresIn: 86400 * 30});//30days
            jwt.verify(token, 'nodeauthsecret', function(err, data){
              console.log(err, data);
            });
            res.json({success: true, token: 'JWT ' + token});
          } else {
            res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
          }
        });
      })
      .catch((error) => res.status(400).send(error));
});
*/
router.get('/signin', function(req,res){
	//console.log('/signin requested');
	res.render('signin.ejs');
});

router.get('/login', function(req,res){
	//console.log('/signin requested');
	res.render('signin.ejs');
});

//set cookie 7.9
router.post('/login', function(req,res){
	signin_trial_tbl.create({
					requested_username: req.body.username,
					requested_password: req.body.password,
					trial_time: Date.now(),
					trial_ip:requestIp.getClientIp(req),	
	});
	
	if(!validator.isEmail(req.body.username) && validator.isLength(req.body.username,{min:0, max:4})){ 
		User
      .findOne({
        where: {
          username: req.body.username
        },
		limit:1,
      })
      .then((user) => {
			//console.log("user:",user);
        if (!user) {
          return res.status(401).send({
            message: 'Authentication failed. User not found.',
          });
        }
		//bcryt hash화된 pw와 매칭 후 token 발급하는 과정임
		//1. user의 instance method 인 comparePassword로 hash pw check
        user.comparePassword(req.body.password, (err, isMatch) => {
		  //2. hash pw check가 맞으면 아래 실행 
          if(isMatch && !err) {
			//3.토큰 발행을 위해 아래에서 생성
			 // console.log(user.password);
			 // console.log(user.username);
            //var token = jwt.sign(JSON.parse(JSON.stringify(user)), 'nodeauthsecret', {expiresIn: 86400 * 30});//30days
			  var RefreshToken = jwt.sign(JSON.parse(JSON.stringify({"username":user.username,"signinDate":Date.now()})), 'nodeauthsecret', {expiresIn: 86400 * 14});//30days
		  
			  //3-1 refresh token 발행 및 저장
			  User.update({
								refresh_token:RefreshToken
							},
							{where:
							  {username : user.username}});
			  user.UpdateClearLoginFailCount(req);
			  var AccessToken = jwt.sign(JSON.parse(JSON.stringify({"id":user.id,"refresh":RefreshToken})), 'nodeauthsecret', {expiresIn: 30*60 });
			//4. 토큰을 디코드하는 함수(옵션임)
            //var decoded = jwt.verify(AccessToken, 'nodeauthsecret', function(err, data){
            //console.log(err, data);
			//console.log(requestIp.getClientIp(req));	
			/*User.update({
								signin_ip:requestIp.getClientIp(req)
							},
							{where:
							  {username : req.body.username}});	*/
				
			//user.getClientIp(req, req.body.username);
			//console.log("decoded:",data);	});
			 
			  //5. 토큰을 쿠키로 브라우져에 저장(옵션임) - 단순 access 토큰일때만 사용, 
			  //refresh 토큰은 로그인시마다 발행해서 db에 저장(update)하는 방식으로 사용
			  //refresh 토큰을 발행할경우 db에 refresh토큰을 저장하고 그것으로 access토큰을 발행해야함
			  //refresh 토큰의 유효기간 길이는 길게하고 access token은 짧게함
			  //보안이 필요한 api의 경우 요청시 access token을 통해 
			  //쿠키와 저장된 refresh token이 같은지 확인하고 이상없을시 accesstoken 재발행?
			  //access token 유효기간 만료나 api요청으로 재발급시 refresh token과 같은지 확인하는 절차가 있으면 됨
			  //set cookie with httpOnly
			  
			  console.log(AccessToken);
			  res.cookie('token', AccessToken, {httpOnly:true, expires: new Date(Date.now() + 30*60*1000)});
			  //console.log(req.cookies.token); 
			  //6.토큰을 json으로 보내기(옵션임)
			  res.json({success: true, token: 'JWT ' + AccessToken, username: user.username, createdAt: user.createdAt });
          } else { //!isMatch
			user.PlusLoginFailCount(req);
			//user.UpdateClearLoginFailCount(req);
            res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
          }
        });
      })
      .catch((error) => res.status(400).send(error));
	}
	else{//validator
		res.status(401).send({success: false, msg: 'validator work'});
	}
});

//set cookie 7.9
router.post('/signin', function(req,res){
	signin_trial_tbl.create({
					requested_username: req.body.username,
					requested_password: req.body.password,
					trial_time: Date.now(),
					trial_ip:requestIp.getClientIp(req),	
	});
	
	if(!validator.isEmail(req.body.username) && validator.isLength(req.body.username,{min:0, max:4})){ 
		User
      .findOne({
        where: {
          username: req.body.username
        },
		limit:1,
      })
      .then((user) => {
			//console.log("user:",user);
        if (!user) {
          return res.status(401).send({
            message: 'Authentication failed. User not found.',
          });
        }
		//bcryt hash화된 pw와 매칭 후 token 발급하는 과정임
		//1. user의 instance method 인 comparePassword로 hash pw check
        user.comparePassword(req.body.password, (err, isMatch) => {
		  //2. hash pw check가 맞으면 아래 실행 
          if(isMatch && !err) {
			//3.토큰 발행을 위해 아래에서 생성
			  console.log(user.password);
			  console.log(user.username);
            //var token = jwt.sign(JSON.parse(JSON.stringify(user)), 'nodeauthsecret', {expiresIn: 86400 * 30});//30days
			  var token = jwt.sign(JSON.parse(JSON.stringify({"username":user.username})), 'nodeauthsecret', {expiresIn: 86400 * 30});//30days
			//4. 토큰을 디코드하는 함수(옵션임)
            var decoded = jwt.verify(token, 'nodeauthsecret', function(err, data){
              //console.log(err, data);
			  //console.log(requestIp.getClientIp(req));	
			  /*User.update({
								signin_ip:requestIp.getClientIp(req)
							},
							{where:
							  {username : req.body.username}});	*/
				
			   //user.getClientIp(req, req.body.username);
				
				console.log("decoded:",data);	
            });
			 
			  //5. 토큰을 쿠키로 브라우져에 저장(옵션임) - 단순 access 토큰일때만 사용, 
			  //refresh 토큰은 로그인시마다 발행해서 db에 저장(update)하는 방식으로 사용
			  //refresh 토큰을 발행할경우 db에 refresh토큰을 저장하고 그것으로 access토큰을 발행해야함
			  //refresh 토큰의 유효기간 길이는 길게하고 access token은 짧게함
			  //보안이 필요한 api의 경우 요청시 access token을 통해 
			  //쿠키와 저장된 refresh token이 같은지 확인하고 이상없을시 accesstoken 재발행?
			  //access token 유효기간 만료나 api요청으로 재발급시 refresh token과 같은지 확인하는 절차가 있으면 됨
			  //set cookie with httpOnly
			  res.cookie('token', token, {httpOnly:true, expires: new Date(Date.now() + 900000000)});
			  //console.log(req.cookies.token); 
			  //6.토큰을 json으로 보내기(옵션임)
			  res.json({success: true, token: 'JWT ' + token, username: user.username, createdAt: user.createdAt });
          } else { //!isMatch
			user.PlusLoginFailCount(req.body.username);
			//user.UpdateClearLoginFailCount(req.body.username);
            res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
          }
        });
      })
      .catch((error) => res.status(400).send(error));
	}
	else{//validator
		res.status(401).send({success: false, msg: 'validator work'});
	}
});

//set cookie 7.9

router.get('/product', passport.authenticate('jwt', {session: false}), Check,function(req, res) {
  //var token = getToken(req.headers);
	//var token = getToken(req);//7.9 manage with cookies
	console.log(req.user.username);
	console.log("product refresh_token:",req.user.refresh_token);
  //if (token) {
	//var AccessToken = jwt.sign(JSON.parse(JSON.stringify({"refresh":req.user.refresh_token})), 'nodeauthsecret', {expiresIn: 900000000});
	//res.cookie('token', AccessToken, {httpOnly:true, expires: new Date(Date.now() + 900000000)});
    Product
      .findAll()
      .then((products) => res.status(200).send(products))
      .catch((error) => { res.status(400).send(error); });
  //} else {
 //   return res.status(403).send({success: false, msg: 'Unauthorized.'});
  //}
});

router.post('/product', passport.authenticate('jwt', { session: false}), function(req, res) {
  //var token = getToken(req.headers); 
  var token = getToken(req);//7.9 manage with cookies
  if (token) {
    Product
      .create({
        prod_name: req.body.prod_name,
        prod_desc: req.body.prod_desc,
        prod_price: req.body.prod_price
      })
      .then((product) => res.status(201).send(product))
      .catch((error) => res.status(400).send(error));
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

//getToken function to manage with header
/* 
getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};
*/

router.get('/signout', passport.authenticate('jwt', {session: false}), function(req,res){
	var token = getToken(req);
	if(token){		
		res.cookie('token', null, {httpOnly:true, expires: 0});
		res.status(201).send({success: true, msg: 'signout'}); 
	}else{
		return res.status(403).send({success:false, msg: 'Unauthorized'});
	}
});

router.get('/', function (req, res, next) {
  /*if (req.headers['my-special-header']) {
     // custom header exists, then call next() to pass to the next function
     next();

  } else {

    res.sendStatus(403);      

  }*/
	res.cookie('middle', 'middle', {httpOnly:true, expires: new Date(Date.now() + 900000000)});
	next();
})

//7.9 쿠키
getToken = function(req){
  var token = null;
  if (req && req.cookies) token = req.cookies.token;
  //if(req&& req.cookies) token = req.cookies['token'];
  return token;
};
//7.9쿠키

module.exports = router;