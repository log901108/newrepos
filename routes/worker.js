var express = require('express');
var router = express.Router();

const Check = require('../mcheckWorker');

/* GET users listing. */
router.get('/', Check, function(req, res, next) {
	
  var trial = 0;
  var max = 10;

	  process.send({ cmd: 'notifyRequest' });
	  var intervalObj = setInterval(() => {
		
		trial++;
	  console.log(trial);
		if(trial == max){
			clearInterval(intervalObj);
			process.send({ cmd: 'notifyEnd' });
		}
  	}, 5 * 1000);  
	res.status(200).send({message:'worker start'});

});

router.get('/response', Check, function(req, res, next) {
  

	res.send({message:'response success'}); 
});


module.exports = router;