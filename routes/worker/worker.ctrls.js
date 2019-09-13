
module.exports.worker = function(req, res, next) {
	
  var trial = 0;
  var max = 1;

	  process.send({ cmd: 'notifyRequest' });
	  var intervalObj = setInterval(() => {
		
	  trial++;
	  console.log(trial);
		if(trial == max){
			rworker(max);
			clearInterval(intervalObj);
			process.send({ cmd: 'notifyEnd' });
		}
  	}, 5 * 1000);  
	res.status(200).send({message:'worker start'});

};


 function rworker(num) {
	
  var rtrial = 0;
  var rmax = 10;
	
	  //process.send({ cmd: 'notifyRequest' });
	  var rintervalObj = setInterval(() => {
		
		rtrial++;
	  console.log(rtrial);
	  console.log(num);
		if(rtrial == rmax){
			clearInterval(rintervalObj);
			process.send({ cmd: 'notifyEnd' });
		}
  	}, 5 * 1000);  
	//res.status(200).send({message:'worker start'});

};
