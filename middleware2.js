module.exports = function (req, res, next) {


	if(req.user.is_admin === true){
    	next();	   
	}else{
		return res.status(403).send({success: false, msg: 'Unauthorized.'});
	}

};