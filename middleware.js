const jwt = require('jsonwebtoken');
//sliding session 구현
module.exports = function (req, res, next) {
	console.log("product refresh_token:",req.user.refresh_token);
	var AccessToken = jwt.sign(JSON.parse(JSON.stringify({"refresh":req.user.refresh_token})), 'nodeauthsecret', {expiresIn: 30*60});
	res.cookie('token', AccessToken, {httpOnly:true, expires: new Date(Date.now() + 30*60*1000)});
	
    next();
};