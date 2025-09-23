/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("viewer.widgets.NavigatorBarManager");

dojo.declare("viewer.widgets.NavigatorBarManager", null, {
	pageIndicator: null,
	actionBar: null,
	displayTimer: null,
	_isMouseOnToolbar: false,
	_isNavigationActive: false,
	
	constructor: function(actions,indicator){
	  this.pageIndicator=indicator;
	  this.actionBar=actions;
	},
	
	registerEvents: function(){
		this.hideToolbarsAfterTimeOut();
		dojo.connect(window, "onresize", this, this.handleResize);
		var editorFrame=document.getElementById("editorFrame");
	    if(editorFrame){
	    	dojo.connect(editorFrame.contentDocument, "mousemove",this, this.handleMouseMove);
	    }
		dojo.connect(document.body, "mousemove",this, this.handleMouseMove);
		dojo.connect(document, "onkeydown", this, this.handleKeyEvent);
	},
	
	hideToolbarsAfterTimeOut: function(){
		if(this.displayTimer)
		clearTimeout(this.displayTimer);
		this.displayTimer = setTimeout(dojo.hitch(this, this.hideToolbarIfAllowed),2000);
	},
	
	handleResize: function(){
		this.actionBar.position();
		if(this.pageIndicator){
			this.pageIndicator.position();
		}
		this.hideToolbarsAfterTimeOut();
	},
	
	handleMouseMove: function(e){
		this._isMouseOnToolbar = this.actionBar.isMouseOnActions(e);
		this._isNavigationActive=false;
		this.showToolbar();
		this.hideToolbarsAfterTimeOut();
	},
	
	handleKeyEvent: function(e){
		switch(e.keyCode){
		    case dojo.keys.TAB:
		    	this._isNavigationActive=true;
		    	this.showToolbar();
		    	break;
		    
		    case dojo.keys.ESCAPE:
		    	this._isNavigationActive=false;
		    	this.hideToolbarIfAllowed();
		    	break;
	    }
	},
	
	showToolbar: function(){
		this.actionBar.show();
		if(this.pageIndicator){
			this.pageIndicator.show();
		}
	},
	
	hideToolbar: function(){
		this.actionBar.hide();
		if(this.pageIndicator){
			this.pageIndicator.hide();
		}
	},
	
	hideToolbarIfAllowed: function(e){
		if(this._isMouseOnToolbar){
			return;
		}
		if(this._isNavigationActive){
			return;
		}
		this.hideToolbar();
	}
	
	
});