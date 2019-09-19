var global = require('./globalVal');
module.exports = function (req, res, next) {

	if ( parseInt(global.get('working')) == 0) { 
		console.log("req:", global.get('working'));
		next();
			
    } else {
		//console.log("process#:",msg);
		console.log("req:", global.get('working'));
		res.status(200).send({success:false, message:'worker is working. cannot start worker'})
		
	}  
};

//cluster process sharing data 
//https://blog.seotory.com/post/2017/08/share-data-with-clustering-in-nodejs