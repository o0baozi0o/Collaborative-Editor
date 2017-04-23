var clientVersion = -1;
var notCommit = [];
var commit = [];

var serverUrl = ["http://155.41.106.212:8000","http://155.41.100.200:8000" ];
var server = serverUrl[0];
var errorCount = 0;
var kickOut = 0;
var myTimer;

function sendAppendEntry() {
	// make a pkg
	var message;
	var type;
    var pre_notCommit_len = notCommit.length;
	if(clientVersion === -1){
		type = "fetchfile";
		// console.log("[Nothing Commit]: " + notCommit.length + typeof(notCommit));
		message = JSON.stringify({type:type,fileName:'1'});
	}else if(notCommit.length === 0){
		type = "heartBeat";
		// console.log("[Nothing Commit]: " + notCommit.length + typeof(notCommit));
		message = JSON.stringify({type:type, version: clientVersion});
	}else if (notCommit.length !== 0){
		type = "newOp";
		console.log("[Something Commit]: " + notCommit.length + typeof(notCommit));
		message = JSON.stringify({type:type,fileName:'1',Op:{newOp:notCommit, applyVer:clientVersion}, version: clientVersion});
	}

	var subscribeRequest = $.ajax({
        type: "POST",
        url: server + "/add_string/",
        data: {msg: message},
        async: false
    });

    subscribeRequest.done(function (data) {
        responseHandler(data, type, pre_notCommit_len);
    });

    subscribeRequest.fail(function (jqXHR, textStatus) {
        errorHandler();
    });

}

function responseHandler(data, type, pre_notCommit_len) {
    console.log("[Client Version:]" + clientVersion);

    if (type === "fetchfile") {
        editor.setValue(data.file);
        clientVersion = data.version; // update clientVersion to server Version
        editor.on('change', chMade);
        console.log('get Init Version:'+clientVersion);
    } else if (type === "heartBeat") {
        if (data.type === "Heartbeat") {
            // console.log("[Hearbeat From Server] Receive heartbeat from server");
        } else if (data.type === "Append") {
            data.newOp.forEach(function (entry) {
                updateVer(entry,commit,notCommit,editor);
                ++clientVersion;
            });
            // console.log("[Hearbeat From Server] Need to update entry from server");
            // console.log("[Hearbeat From Server] clientVersion:" + clientVersion);
            // console.log("[Hearbeat From Server] serverVersion" + data.version);
            if(clientVersion !== data.version){
                // console.log('Why!!!!');
            }
        } else{
            // console.log("[Hearbeat From Server]Unexpected No Type")
        }
    } else if (type === "newOp") {
        if (data.type === "Updated") {
            // console.log("[newOp From Server] Successful append clientVersion:" + clientVersion);
            commit.push(notCommit);
            notCommit = [];
            ++clientVersion;
        }else if(data.type === 'NeedUpdate'){
            // console.log("[newOp From Server] Need to update entry from server");
            data.newOp.forEach(function (entry) {
                updateVer(entry,commit,notCommit,editor);
                ++clientVersion;
            });
            ++clientVersion;
            if(clientVersion !== data.version){
                // console.log('VersionFail:'+clientVersion+','+'dataVersion:'+data.version);
                // console.log(data.newOp);
            }
            commit.push(notCommit);
            notCommit= [];
        }else{
            // console.log("[AppendEntry From Server]Unexpected No Type")
        }
    } else {
        // console.log("[Client]Unexpected No Type")
    }

}

function errorHandler() {
    console.log("[Connection Error]Connect Error to Server" + server);
    errorCount += 1;
    if(errorCount >= 5){
        clearInterval(myTimer);
        errorCount = 0;
        kickOut += 1;
        if(kickOut < 5){
            switchServer();
            sendAppendEntry();
            myTimer = setInterval(sendAppendEntry, 1000);
        }else {
            // console.log("[Client]Fail to connect to Server.");
        }
    }
}

function switchServer() {
    // console.log("[Client]Switch Server!");
    if(server === serverUrl[0]){
        server = serverUrl[1]
    }else {
        server = serverUrl[0]
    }
}

function tryRecovery() {
    // console.log("[Client]Try to reconnect with Server!");
    kickOut = 3;
    sendAppendEntry();
}