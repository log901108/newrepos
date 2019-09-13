var global = require('./globalVal');
module.exports = async function (req, res, next) {

	if ( parseInt(global.get('a')) == 0) { 
		console.log("req:", global.get('a'));
		next();
			
    } else {
		//console.log("process#:",msg);
		console.log("req:", global.get('a'));
		res.status(200).send({success:false, message:'worker is working. cannot start worker'})
		
	}  
};

//cluster process sharing data 
//https://blog.seotory.com/post/2017/08/share-data-with-clustering-in-nodejs