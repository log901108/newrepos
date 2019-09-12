module.exports = async function (req, res, next) {

  var func = await process.send({ cmd: 'notifyResponse' });	
  var func2 = await process.on('message', (msg) => {
	if (msg === 'off') { 
		//console.log('off');
		req.query.worker = 0;
			
    } else {
		//console.log("process#:",msg);
		req.query.worker = 1;	
		
	}  
	  	next();
  });

};