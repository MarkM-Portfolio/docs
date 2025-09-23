/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */


dojo.provide("concord.text.Log");

dojo.declare("concord.text.Log", null, {
	level : null,
	stack : [],
    size : null,
    forceReport : false,
    constructor : function constructor(){
        this.level = window.g_logLevel;
        this.size = window.g_logSize;//(1 command + 3 message) * 10
        this.forceReport = false;
        
    },
    
    log : function(msg){
    	if (this.level == 'none')
    		return;
    	else if (this.level == 'console')
    		console.log(msg);
    	else if (this.level == 'report')
    	{
    		if (this.stack.length >= this.size)
    			this.stack.shift();
    		this.stack.push(msg);
    	}   		
    },
    
    report : function(){
    	// Temp add this to track reloading issues
    	 if (!g_reloadLog)
    		return;	// Disable send report to server in product environment.
    	if (!this.stack || this.stack.length == 0){
    		return;
    	}
    	//send xhr request to Docs server   	
    	var sData = dojo.toJson(this.stack);
    	this.stack = [];
		var url = concord.util.uri.getDocEditUri() + "/report";
	
		dojo.xhrPost({
			url: url,
			handleAs: "json",
			sync: false,
			contentType: "text/plain",
			postData: sData
		});
    },
    
    logMessage : function(msg, local){
    	var str;
    	if (local)
    		str = '<Local> Type : ';
    	else
    		str = '<Incoming> Type : ';
    	str += msg.type;
    	var acts = msg.updates;
    	
    	for (var i=0; i<acts.length ; i++)
    	{
    		if ( i == 5)
    			break;//avoid to record too many actions
    		var act = acts[i];
    		str += ' Target : ';
    		str += act.tid;
    		str += ' Action : ';
    		str += act.t;
    		if (act.idx != undefined)
    		{
    			str += ' Position : ';
    			str += act.idx;
    		}
		}
    	
    	this.log(str);
    },
    
    logCommand : function(cmd,data)
    {
    	var str = 'Command : ';
    	str += cmd;
    	if (data && typeof data == 'string')
    	{
     		str +=  'Data : ';
     		str += data;
    	}

    	this.log(str);
    },

    logCursor : function(block)
    {
    	var str = 'Cursor : ';
    	str += block;
    	this.log(str);
    }
});

(function(){	
	if(typeof LOG == "undefined")
		LOG = new concord.text.Log();	
})();