var express = require('express');
var router = express.Router();

const workerCtrls = require('./worker.ctrls');

const Check = require('../../mcheckWorker');

/* GET users listing. */
router.get('/', Check, workerCtrls.worker);



module.exports = router;