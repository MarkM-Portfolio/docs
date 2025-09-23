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

dojo.provide("websheet.Main");
dojo.provide("websheet.test.stubs.Main");

dojo.declare("websheet.Main", null, {
	controller: null,
	
	constructor: function() {
		this.controller = new websheet.Controller(this);
		
		builders.object([
		               [ "websheet.Main", this ]
		              ], window);
	},
	
	getController: function() {
		return this.controller;
	},
	
	getDocumentObj: function() {
		return this.controller._documentObj;
	},
	
	getCurrentGrid: function() {
		return this.controller.getGrid("Sheet1");
	},
	
	getIDManager: function(){
		return this.controller._documentObj._idManager;
	},
	
	getCalcManager: function() {
    	return this.controller._documentObj._calcManager;
    },
    
    getPartialCalcManager: function(){
    	return this.controller._documentObj._partialCalcManager;
    },
    
    getInstanseOfPCM:function()
    {
    	return this.controller._documentObj._partialCalcManager;
    },
    
    getPartialManager:function(){
		return this.controller._documentObj._partialManager;
	},
	
	getTaskMan: function() {
    	return this.controller._documentObj._taskMgr;
    },
        getPaneMgr: function() {
    	return new websheet.widget.PaneManager();
    },
        
    getDrawFrameHdl : function(){
		if(!this._drawFrameMgr)
        	this._drawFrameMgr = new websheet.widget.DrawFrameManager();
		return this._drawFrameMgr;
	},
	
	hasACLHandler: function()
	{
		return !!this._aclHandler;
	},
	
	hasDrawFrameSelected: function()
	{
		return false;
	},
	
	sendMessage: function (event, reverse, attrs, bAsync) {
		
	},
    
    execCommand: function(){
    	
    },
    
    _toDVJSON4Msg: function(){
    	
    },
    
    getACLHandler: function(){
    	return this._aclHandler;
    },
    
    getPaneMgr: function() {
    	return new websheet.widget.PaneManager();
    },
    
    execCommand: function(){
    	
    },
    
    _toDVJSON4Msg: function(){
    	
    },
    
    getMaxRow: function () {
    	return parseInt(g_maxSheetRows);
    }
	
});

new websheet.Main();