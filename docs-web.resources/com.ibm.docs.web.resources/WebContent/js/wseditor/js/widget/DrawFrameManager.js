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

dojo.provide("websheet.widget.DrawFrameManager");

dojo.declare("websheet.widget.DrawFrameManager", null, {
	// module:
	//		websheet/canvasweidget/DrawFrameManager
	// summary:
	//		Manage image & chart handlers.
	//		This 'manager' mainly manager the following routines:
	//		1. Manager the Z order of the shapes;
	//		2. Keep tracking the focus of the shapes;
	//		3. Provide an uniformed entrance for keyboard events;

	handlers				: null,
	maxZIndexMap			: null,
	
	constructor: function() {
		this.maxZIndexMap = {};
		this.handlers = [];
	},
	
	addHandler: function (handler) {
		this.handlers.push(handler);
	},
	
	reset: function () {
		dojo.forEach(this.handlers, function (handler) {
			handler.reset();
		});
    },
    
    getMaxZIndex: function (sheetId) {
    	// summary:
    	//		The Z index in each sheet is a cumulative value, return the 
    	if(this.maxZIndexMap[sheetId] === undefined )
    	{
    		this.maxZIndexMap[sheetId] = 0;
    		return 0;
    	}
    	return this.maxZIndexMap[sheetId];
    },
    
    updateMaxZIndex: function (sheetId, data) {
    	// summary:
    	//		If the given index is bigger than current record, update the index.
    	if (this.maxZIndexMap[sheetId] === undefined) {
    		this.maxZIndexMap[sheetId]=data;
    	} else if(data > this.maxZIndexMap[sheetId]) {
    		this.maxZIndexMap[sheetId] = data;
    	}
    },
    
    delSelectedDrawFrames: function (sheetName) {
    	// summary:
    	//		Delete;
    	var del = false;
		for (var i = 0, len = this.handlers.length; i< len ; i++) {
			if (this.handlers[i].delSelectedDrawFrames(sheetName)) {
				del = true;
			}
		}
		return del;
    },
    
    getSelectedDrawFramesInSheet: function (sheetName) {
    	var ranges = [];
    	for (var i = 0, len = this.handlers.length, _ranges; i< len; i++) {
    		ranges = ranges.concat(this.handlers[i].getSelectedDrawFramesInSheet(sheetName));
    	}
    	return ranges;
    },

    getSelectedDrawFramesInCurrSheet: function () {
    	var ranges = [];
    	for (var i = 0, len = this.handlers.length, _ranges; i< len; i++) {
    		ranges = ranges.concat(this.handlers[i].getSelectedDrawFramesInCurrSheet());
    	}
    	return ranges;
    },
    
    getSelectedDrawDivInCurrSheet: function(){
    	var drawDiv;
    	for (var i = 0, len = this.handlers.length; i< len; i++){
    		var ranges = this.handlers[i].getSelectedDrawFramesInCurrSheet();
    		if (ranges.length != 0) {
    			var range = ranges[0];
    			drawDiv = this.handlers[i].getDrawFrameDivbySheetName(range.getSheetName(), range.getId());
    			return drawDiv;
    		}
    	}
    	return drawDiv;
    },
    
    onArrowKeyDown: function (sheetName, e, dir) {
    	var move = false;
		for (var i = 0, len = this.handlers.length; i< len ; i++) {
			move = this.handlers[i].onArrowKeyDown(sheetName, e, dir);
			if (move) {
				break;
			}
		}
		return move;
    },
    
    hasSelectedDrawFrames: function (sheetName) { 
		for (var i = 0, len = this.handlers.length; i< len ; i++) {
			if (this.handlers[i].hasSelectedDrawFrames(sheetName)) {
				return true;;
			}
		}
    	return false;
    },
    
	unSelectDrawFrames: function (sheetName) {
		for(var i = 0, len = this.handlers.length; i< len ; i++){
			this.handlers[i].unSelectDrawFrames(sheetName);
		}
    },

    drawAll: function(sheetName) {
    	for(var i = 0, len = this.handlers.length; i< len ; i++){
			this.handlers[i].drawAll(sheetName);
		}
    }
});