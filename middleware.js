const jwt = require('jsonwebtoken');
module.exports = function (req, res, next) {
    //Do your session checking...
	res.cookie('middle', 'middle', {httpOnly:true, expires: new Date(Date.now() + 900000000)});
	 //var token = getToken(req.headers);
	//var token = getToken(req);//7.9 manage with cookies
	console.log("product refresh_token:",req.user.refresh_token);
  //if (token) {
	   var AccessToken = jwt.sign(JSON.parse(JSON.stringify({"refresh":req.user.refresh_token})), 'nodeauthsecret', {expiresIn: 900000000});
		res.cookie('token', AccessToken, {httpOnly:true, expires: new Date(Date.now() + 900000000)});
    next();
};