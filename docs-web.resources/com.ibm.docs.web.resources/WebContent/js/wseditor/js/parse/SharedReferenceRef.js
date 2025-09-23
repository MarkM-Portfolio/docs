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

/***
 *  Describe the position of shared formulas referred references
 */
dojo.provide("websheet.parse.SharedReferenceRef");
dojo.require("websheet.parse.Reference");
dojo.declare("websheet.parse.SharedReferenceRef",websheet.parse.Reference,{
	_rowSize: null,
	_colSize: null,
	
	constructor: function(range, rowSize, colSize){
		this.usage = websheet.Constant.RangeUsage.SHARED_REFS;
		this._rowSize = rowSize;
		this._colSize = colSize;
		this._generateId();
	},
	
	_generateId:function() {
		if (this.constructor.prototype._idCount == undefined)//static variable used to generate unique id for unique area
			this.constructor.prototype._idCount = 1;
		this._id = "srr" + this.constructor.prototype._idCount++; // it won't conflict with name range id
	},
	
	isAbsolute: function(bRow)
	{
		var refMask = this._parsedRef.refMask;
		if(bRow)
			return ((refMask & websheet.Constant.RefAddressType.ABS_ROW) > 0 || (refMask & websheet.Constant.RefAddressType.ABS_END_ROW) > 0);
		else
			return ((refMask & websheet.Constant.RefAddressType.ABS_COLUMN) > 0 || (refMask & websheet.Constant.RefAddressType.ABS_END_COLUMN) > 0);
	},
	
	// do not update the position now for shared reference, just notify the shared formula
	// will update later
	/*boolean*/update: function(range, /*int*/rowDelta, /*int*/colDelta, event){
		if(this.isAbsolute(rowDelta != 0))
			return this.inherited(arguments);
		
		var deltaChange = websheet.Helper.getRefChangeDeltas(range, this._parsedRef, rowDelta, colDelta, this._rowSize, this._colSize);
		var source = event._source;
		var data = source.data;
		if(deltaChange){
			if(!data) source.data = data = {};
			data.shared_ref_delta = deltaChange;
		}
		else if(data)
			delete data.shared_ref_delta;
		if(data){
			data.sizeChanged = false;
			data.collectUndo = false;
		}
		
		this.broadcast(event);
		return true;
	}
});
