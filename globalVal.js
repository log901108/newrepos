// globalVal.js
const cluster = require('cluster');

let globalData = {};

module.exports.get = function(name) {
    return globalData[name];
}

// 1. 수정 요청 보냄
module.exports.set = function ( name, val ) {
    globalData[name] = val;

    // 1-1. 워커인 경우 요청을 마스터로 보냄
    if ( cluster.isWorker ) {
        process.send({
            cmd: 'val:edit-request', 
            data: globalData
        });
    // 1-2. 마스터인 경우 바로 브로드캐스트. -> 3. 단계로 넘어감
    } else {
        this.broadcast();
    }
}

// 3. 데이터 전파
module.exports.broadcast = function () {
    if ( cluster.isMaster ) {
        for (const id in cluster.workers) {
            let worker = cluster.workers[id];
            worker.send({
                cmd: 'val:edit',
                data: globalData
            });
        }
    } else {
        process.send({
            cmd: 'val:broadcast'
        });
    }
}

if ( cluster.isMaster ) {
    cluster.on('message', (worker, message) => {
        // 2. 수정 요청 받음
        if ( message.cmd === 'val:edit-request' ) {
            let keys = Object.keys( message.data );
            keys.forEach((key) => {
                globalData[key] = message.data[key];
            });
            broadcast();
        } else if ( message.cmd === 'val:broadcast' ) {
            broadcast();
        }
    });
} else {
    process.on('message', function (message) {
        // 4. 전파 받은 후 데이터 수정
        if ( message.cmd === 'val:edit' ) {
            globalData = message.data;
            console.log(`[${process.pid}:globalData:edit] ${JSON.stringify(globalData)}`);
        }
    });
}


