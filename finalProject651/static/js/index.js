// ---------------------------------------------------
// Operation Transformation Function Area: op函数区
// ---------------------------------------------------

function applyOp(op, editor){
	for(var i=0;i<op.length;++i){
		console.log(op[i]);
		if(op[i].type === 'ins'){
			var str = "";
			for(var j=0;j<op[i].text.length;++j){
				str += op[i].text[j];
				if(j !== op[i].text.length-1){
					str += '\n';
				}
			}
			editor.replaceRange(str,op[i].from,op[i].from,'setValue');
		}else{
			editor.replaceRange('',op[i].from,op[i].to,'setValue');
		}
	}
}

function beforeOrEqual(Pos1, Pos2){
	return Pos1.line <= Pos2.line && Pos1.ch <= Pos2.ch;
}
function before(Pos1, Pos2){
	return Pos1.line <= Pos2.line && Pos1.ch < Pos2.ch;
}
function equal(Pos1, Pos2){
	return Pos1.line === Pos2.line && Pos1.ch === Pos2.ch;
}
function cpPos(pos){
	var rst = {};
	rst.line = pos.line;
	rst.ch = pos.ch;
	return rst;
}
function insertBefore(op, Pos){
	var tFrom = op.from;
	var tText = op.text;
	var rPos = cpPos(Pos);

	if(tFrom.line === rPos.line){
		if(tText.length === 1){
			rPos.ch += tText[0].length;
		}else{
			rPos.ch = rPos.ch - tFrom.ch + tText[tText.length - 1].length;
		}
	}
	rPos.line += tText.length - 1 ;
	return rPos;
}

function deleteBefore(op, Pos){
	var tFrom = op.from;
	var tTo = op.to;
	var rPos = cpPos(Pos);

	if(rPos.line === tTo.line){
		if(tFrom.line === tTo.line){
			rPos.ch -= (tTo.ch - tFrom.ch);
		}else{
			rPos.ch -= tTo.ch;
		}
	}
	rPos.line -= tTo.line - tFrom.line;
	return rPos;
}

function transformII(opNew,op){
	if(before(op.from,opNew.from)){
		opNew.from = insertBefore(op,opNew.from);
	}else{
		op.from = insertBefore(opNew,op.from);
	}
}

function transformDI(opNew,op){
	if(beforeOrEqual(op.from, opNew.from)){
		opNew.from = insertBefore(op,opNew.from);
		opNew.to = insertBefore(op,opNew.to);
	}else if(before(op.from, opNew.to)){
		var tOpNew = {};
		tOpNew.type = 'del';
		tOpNew.to = insertBefore(op, opNew.to);
		tOpNew.from = insertBefore(op, op.from);
		opNew.to = cpPos(op.from);
		op.from = cpPos(opNew.from);
		tOpNew.from = deleteBefore(opNew, tOpNew.from);
		tOpNew.to = deleteBefore(opNew, tOpNew.to);
		return tOpNew;
	}else{
		op.from = deleteBefore(opNew ,op.from);
	}
	return null;
}

function transformDD(opNew,op){
	if(beforeOrEqual(opNew.from, op.from)){
		if(beforeOrEqual(opNew.to, op.from)){
			op.from = deleteBefore(opNew, op.from);
			op.to = deleteBefore(opNew, op.to);
		}else if(before(opNew.to, op.to)){
			op.to = deleteBefore(opNew, op.to);
			opNew.to = cpPos(op.from);
			op.from = cpPos(opNew.from);
		}else{
			opNew.to = deleteBefore(op, opNew.to);
			op.to = cpPos(op.from);
		}
	}else if(before(opNew.from,op.to)){
		if(beforeOrEqual(opNew.to,op.to)){
			op.to = deleteBefore(opNew, op.to);
			opNew.to = cpPos(opNew.from);
		}else{
			var ttPos = cpPos(opNew.from);
			opNew.from = cpPos(op.from);
			opNew.to = deleteBefore(op, opNew.to);
			op.to = ttPos;
		}
	}else{
		opNew.from = deleteBefore(op, opNew.from);
		opNew.to = deleteBefore(op, opNew.to);
	}
}

function transform(op, notCommit){
	for(var i = 0; i<notCommit.length; ++i){
		for(var n = 0; n<op.length ; ++n){
			if(notCommit[i].type === 'ins'){
				if(op[n].type === 'ins'){
					transformII(op[n],notCommit[i]);
				}else{
					var rst = transformDI(op[n],notCommit[i]);
					if(rst !== null){
						console.log('DI create new delete');
						op.splice(n+1, 0, rst);
						++n;
					}
				}
			}else{
				if(op[n].type === 'ins'){
					var trst = transformDI(notCommit[i],op[n]);
					if(trst !== null){
						console.log('ID create new delete');
						notCommit.splice(i+1, 0, trst);
						++i;
					}
				}else{
					transformDD(op[n],notCommit[i]);
					if(equal(notCommit[i].from,notCommit[i].to)){
						console.log('DD delete old del');
						notCommit.splice(i,1);
						--i;
					}
					if(equal(op[n].from,op[n].to)){
						console.log('DD delete new del');
						op.splice(n,1);
						--n;
					}
				}
			}
		}
	}
}

// ---------------------------------------------------
// Set editor1 and editor2: 初始化设置
// ---------------------------------------------------
var clientVersion = -1;
var notCommit = [];
var commit = [];
var editor = CodeMirror(document.getElementById('workarea'), {
			value: "Type something!",
			lineNumbers: true,
			mode: "javascript",
			matchBrackets: true,
			showCursorWhenSelecting: true,
			theme: "monokai",
			tabSize: 2
});

function chMade(e,c){
	if( c.origin === 'setValue'){
		return;
	}
	if(c.from.line !== c.to.line || c.from.ch !== c.to.ch){
		notCommit.push({type:'del', from:c.from, to:c.to});
	}
	if(c.text.length !== 1 ||c.text[0] !== '') {
		notCommit.push({type: 'ins', from: c.from, text: c.text});
	}
}


var serverUrl = ["http://155.41.100.200:8000", "http://155.41.84.169:8000"];
var server = serverUrl[0];
var errorCount = 0;
var kickOut = 0;


// ---------------------------------------------------
// Connect to backend: 向后端发送Ajax
// ---------------------------------------------------

$(document).ready(function () {
	// console.log(notCommit);
    sendString();
});

var flag = false;

function sendString() {
    // console.log("[Swtich Master]connected to server: " + server);
	if(notCommit.length !== 0){
		console.log(notCommit);
	}

	var message;
	var type;
	if(clientVersion === -1){
		type = "fetchfile";
		console.log("[Nothing Commit]: " + notCommit.length + typeof(notCommit));
		message = JSON.stringify({type:type,fileName:'1'});
	}else if(notCommit.length === 0){
		type = "heartBeat";
		// console.log("[Nothing Commit]: " + notCommit.length + typeof(notCommit));
		message = JSON.stringify({type:type, version: clientVersion});
	}else if (notCommit.length !== 0){
		type = "newOp";
		console.log("[Something Commit]: " + notCommit.length + typeof(notCommit));
		message = JSON.stringify({type:type,fileName:'1',Op:notCommit,version: clientVersion});
	}
	if(flag == false) {
		flag = true;
		$.ajax({
			type: "POST",
			url: server + "/add_string/",
			data: {msg: message},
			success: function (data) {
				//console.log(data.content);
				if (type === "fetchfile") {
					editor.setValue(data.content);
					clientVersion = data.version; // update clientVersion to server Version
					editor.on('change', chMade);
				} else if (type === "heartBeat") {
					if (data.type === "Heartbeat") {
						// console.log("[Hearbeat From Server] Receive heartbeat from server");
					} else if (data.type === "Append") {
						console.log("[Hearbeat From Server] Need to update entry from server");
						console.log("[Hearbeat From Server] clientVersion:" + clientVersion);
						console.log("[Hearbeat From Server] serverVersion" + data.version);

						data.newOp.forEach(function (entry) {
							transform(entry, notCommit);
							applyOp(entry, editor);
						});

						// applyOp(data.newOp, editor);
						clientVersion = data.version;
						commit.push(data.newOp);
					} else if (data.type === "Rejected") {
						console.log("[Hearbeat From Server] Server is unexpected behind, reject your request");
					} else {
						console.log("[Hearbeat From Server]Unexpected No Type")
					}
				} else if (type === "newOp") {
					if (data.type === "Updated") {
						console.log("[AppendEntry From Server] Server is updated, your request is successful, update client version");
						clientVersion++;
						commit.push(notCommit);
						notCommit = [];

					} else if (data.type === "Append") {
						console.log("[AppendEntry From Server] You are fall behind, Server request append old version");
						data.newOp.forEach(function (entry) {
							transform(entry, notCommit);
							applyOp(entry, editor);
						});
						// applyOp(data.newOp, editor);
						clientVersion = data.version;
						commit.push(data.newOp);
					} else if (data.type === "Rejected") {
						console.log("[AppendEntry From Server] Server is unexpected behind, reject your request");
					} else {
						console.log("[AppendEntry From Server]Unexpected No Type")
					}
				} else {
					console.log("[Client]Unexpected No Type")
				}

				setTimeout('sendString()', 500);
			},
			error: function (request, status, error) {
				console.log("[Connection Error]Connect Error to Server" + server);
				errorCount += 1;
				if (errorCount < 4) {
					setTimeout('sendString()', 1000);
				} else {
					errorCount = 0;
					kickOut += 1;
					if (kickOut > 5) {
						console.log("[Client] Still cannot connect, Server might have been shut down");
						setTimeout('tryRecovery()', 5000);
					} else {
						switchServer();
					}
				}
			}
		});
		flag = false;
	}

}

function switchServer() {
    console.log("[Client]SwichServer!");
    if(server == serverUrl[0]){
        server = serverUrl[1]
    }else {
        server = serverUrl[0]
    }
    sendString();
}

function tryRecovery() {
    console.log("[Client]Try to reconnect with Server!");
    kickOut = 3;
    sendString();
}
