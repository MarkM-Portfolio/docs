dojo.provide("writer.api");

writer.api = {
	_assembleMsg: function(what, detail)
	{
		var m = {
				eventType : what || "unknown",
				detail : detail,
				generated: new Date().valueOf()
		}
		return JSON.stringify(m);
	},
	
	notify: function(what, detail){
		if (!window.postMessage)
			return;
		
		var json = this._assembleMsg(what, detail);
		postMessage(json, "*");
	},
	
	execCommand: function(cmdName, cmdArgs)
	{
		pe.lotusEditor.execCommand(cmdName, cmdArgs)
	}
}

window.IDocs = {
	DocumentApp: writer.api
}