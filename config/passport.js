const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

// load up the user model
const User = require('../models').User;

/*
module.exports = function(passport) {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
    secretOrKey: 'nodeauthsecret',
  };
  passport.use('jwt', new JwtStrategy(opts, function(jwt_payload, done) {
    User
      .findByPk(jwt_payload.id)
      .then((user) => { return done(null, user); })
      .catch((error) => { return done(error, false); });
  }));
};
*/

//7.9 쿠키용 스트레터지 
var cookieExtractor = function(req) {
  var token = null;
  if (req && req.cookies) token = req.cookies['token'];
  return token;
};

module.exports = function(passport) {  
  var opts = {};
  opts.jwtFromRequest = cookieExtractor; // check token in cookie
  opts.secretOrKey = 'nodeauthsecret';
    passport.use('jwt', new JwtStrategy(opts, function(jwt_payload, done) {
    User
      .findByPk(jwt_payload.id)
      .then((user) => { return done(null, user); })
      .catch((error) => { return done(error, false); });
  }));
};
//7.9 쿠키용 스트레터지 