const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const router = express.Router();
require('../config/passport')(passport);
const Product = require('../models').Product;
const User = require('../models').User;


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
	console.log('/signin requested');
	res.render('signin.ejs');
});

//set cookie 7.9
router.post('/signin', function(req,res){
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
			  //set cookie with httpOnly
			  res.cookie('token', token, {httpOnly:true, expires: new Date(Date.now() + 900000)});
			  console.log(req.cookies.token); 
			  res.json({success: true, token: 'JWT ' + token, username: user.username, createdAt: user.createdAt });
          } else {
            res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
          }
        });
      })
      .catch((error) => res.status(400).send(error));
});

//set cookie 7.9

router.get('/product', passport.authenticate('jwt', { session: false}), function(req, res) {
  //var token = getToken(req.headers);
	var token = getToken(req);//7.9 manage with cookies
  if (token) {
    Product
      .findAll()
      .then((products) => res.status(200).send(products))
      .catch((error) => { res.status(400).send(error); });
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
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


//7.9 쿠키
getToken = function(req){
  var token = null;
  if (req && req.cookies) token = req.cookies.token;
  //if(req&& req.cookies) token = req.cookies['token'];
  return token;
};
//7.9쿠키

module.exports = router;