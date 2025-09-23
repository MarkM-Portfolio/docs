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
 * For Range Object in spreadsheet document
 * It can be unnamed range with different usage, such as task, comments
 * Or named range
 */
dojo.provide("websheet.event.undo.Range3D");
dojo.require("websheet.Helper");
dojo.require("websheet.Constant");
dojo.declare("websheet.event.undo.Range3D",null,{
	rangeId:null,//rangeId is the name for named range, and unique id for unnamed range
	_sheetId:null,
	_endSheetId:null,//not null and not equal to _sheetId when it is 3D range
	_startRow:null,
	_startCol:null,
	_endRow:null,
	_endCol:null,
	
	_refMask: websheet.Constant.RefAddressType.NONE,
	_idManager : null,
	//must set range id after constructorendRow
	constructor: function(rangeRef,idManager) 
	{
    	if(!idManager) {
    		var docObj = websheet.model.ModelHelper.getDocumentObj();
			idManager = docObj._getIDManager();
    	}
		this._idManager = idManager;
		if(rangeRef) {
			if(dojo.isString(rangeRef)) {
				this._address = rangeRef;
				rangeRef = websheet.Helper.parseRef(rangeRef);
			}
			if(rangeRef && rangeRef.is3D()) {
				this._sheetId = idManager.getSheetIdBySheetName(rangeRef.sheetName);
				this._endSheetId = idManager.getSheetIdBySheetName(rangeRef.endSheetName);
				
				this._startRow = rangeRef.startRow;
				this._startCol = rangeRef.startCol;
				this._endRow = rangeRef.endRow;
				this._endCol = rangeRef.endCol;
				this._refMask = rangeRef.refMask;
				this.bValid = true;
				this._address = rangeRef.getAddress();
				this._parsedRef = rangeRef;
			} 
		}
	},
	
	/*id*/getRangeId: function() {
		return this.rangeId;
	},
	
	//append this range to document
	setRangeId:function(rangeId)
	{
		this.rangeId = rangeId;
	},
	
	setUsage:function(use){
		this.usage = use;
	},
	
	getUsage:function(){
//		if(!this.usage)
//			this.usage = websheet.Constant.RangeUsage.UNNAMES;
		return this.usage;
	},
	
	isValid:function() {
		return this.bValid?true:false;
	},
	/*boolean*/is3D: function() {
		return true;
	},
	
	getAddress: function() {
		if(this.bValid) {
			var sheetName = this._idManager.getSheetNameById(this._sheetId);
			var endSheetName = this._idManager.getSheetNameById(this._endSheetId);
			if(sheetName && endSheetName) {
				return websheet.Helper.getAddressByIndex(sheetName, this._startRow, this._startCol, endSheetName, this._endRow, this._endCol, {refMask:this._refMask});
			} else {
				// the sheet has been deleted, while we do not change the start/end sheet of 3D ref in undo stack,
				// so keep the original address
				// the sheet might be renamed, so change the sheet name
				if(this._parsedRef) {
					if (sheetName)
						this._parsedRef.sheetName = sheetName;
					if(endSheetName) 
						this._parsedRef.endSheetName = endSheetName;
					this._address = this._parsedRef.getAddress();
				}
			}
		} 
		return this._address;
	}

});
	
