// ---------------------------------------------------
// Operation Transformation Functions
// ---------------------------------------------------
var editor = CodeMirror(document.getElementById('workarea'), {
			value: "",
			lineNumbers: true,
			keyMap: "sublime",
			mode: "python",
			matchBrackets: true,
			autoCloseBrackets: true,
			showCursorWhenSelecting: true,
			theme: "dracula",
			tabSize: 4
});

function applyOp(op, editor){
	for(var i=0;i<op.length;++i){
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
	if(Pos1.line < Pos2.line){
		return true;
	}else if(Pos1.line === Pos2.line){
		return Pos1.ch <= Pos2.ch;
	}
	return false;
}
function before(Pos1, Pos2){
	if(Pos1.line < Pos2.line){
		return true;
	}else if(Pos1.line === Pos2.line){
		return Pos1.ch < Pos2.ch;
	}
	return false;
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
			rPos.ch = rPos.ch - tTo.ch + tFrom.ch;
		}
	}
	rPos.line -= tTo.line - tFrom.line;
	return rPos;
}
function transformII(opNew,op,priority){
	if(before(op.from, opNew.from)){
		opNew.from = insertBefore(op,opNew.from);
	}else if(equal(op.from,opNew.from) && !priority){
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
function transformOne(op, oldOp, priority){
	for(var i = 0; i<oldOp.length; ++i){
		for(var n = 0; n<op.length ; ++n){
			if(oldOp[i].type === 'ins'){
				if(op[n].type === 'ins'){
					transformII(op[n],oldOp[i],priority);
				}else{
					var rst = transformDI(op[n],oldOp[i]);
					if(rst !== null){
						op.splice(n+1, 0, rst);
						++n;
					}
				}
			}else{
				if(op[n].type === 'ins'){
					var trst = transformDI(oldOp[i],op[n]);
					if(trst !== null){
						oldOp.splice(i+1, 0, trst);
						++i;
					}
				}else{
					transformDD(op[n],oldOp[i]);
				}
			}
		}
	}
}
function cpOp(op){
	var rst={};
	if(op.type==='ins'){
		rst.type = 'ins',
		rst.from = cpPos(op.from)
		rst.text = op.text;
	}else{
		rst.type = 'del',
		rst.from = cpPos(op.from)
		rst.to = cpPos(op.to);
	}
	return rst;
}
function cpOpList(oplist){
	var rst = [];
	for(var i=0;i<oplist.length;++i){
		rst.push(cpOp(oplist[i]));
	}
	return rst;
}
function updateOp(newOp,oldOp,priority){
	var rst = [];
	for(var i=0; i<newOp.length; ++i){
		var list = [cpOp(newOp[i])];
		transformOne(list, oldOp, priority);
		rst = rst.concat(list);
	}
	return rst;
}
function updateVer(missedOp,commit,notCommit,editor){
	if(missedOp.applyVer>commit.length){
		console.log('No way!');
	}else{
		var oldOp = [];
		for(var n=missedOp.applyVer; n<commit.length; ++n){
			oldOp = oldOp.concat(cpOpList(commit[n]));
		}
		var rst = updateOp(missedOp.newOp,oldOp,false);
		commit.push(rst);
		var tNewOp = updateOp(rst,notCommit,true);
		applyOp(tNewOp,editor);
	}
}
function chMade(e,c){
	if( c.origin === 'setValue'){
		return;
	}
    notCommitLock = true;
    if(c.from.line !== c.to.line || c.from.ch !== c.to.ch){
    notCommit.push({type:'del', from:c.from, to:c.to});
    }
    if(c.text.length !== 1 ||c.text[0] !== '') {
        notCommit.push({type: 'ins', from: c.from, text: c.text});
    }
    notCommitLock = false;
}
