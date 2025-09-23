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
 *  Describe the shared formulas position
 */
dojo.provide("websheet.parse.SharedFormulaRef4CF");
dojo.require("websheet.parse.SharedFormulaRef4RulesObj");
dojo.declare("websheet.parse.SharedFormulaRef4CF",websheet.parse.SharedFormulaRef4RulesObj,{
	result: null,//result for cf, tow dimensional array, one element is a list of {priority, styleid, color}
	
	constructor: function(/*parsedRef*/range, id){
		this.usage = websheet.Constant.RangeUsage.CONDITION_FORMAT;
		this.dirty = true;
		if(id && id.indexOf("src") == 0){
			var i = id.indexOf("_");
			var n = 0;
			if (i == -1) {
				n = Number(id.slice(3));
			} else {
				n = Number(id.substring(3, i));
			}
			if(!isNaN(n) &&  (this.constructor.prototype._cfIdCount == undefined || this.constructor.prototype._cfIdCount <= n))
				this.constructor.prototype._cfIdCount = ++n;
		}
		this._doc._calcManager.addUnCalcCF(this);
	},
	
	_generateId:function() {
		if (this.constructor.prototype._cfIdCount == undefined)//static variable used to generate unique id for unique area
			this.constructor.prototype._cfIdCount = 1;
		this._id = "src" + this.constructor.prototype._cfIdCount++; // it won't conflict with name range id
	},
	
	getNextId:function()
	{
		if (this.constructor.prototype._cfIdCount == undefined)//static variable used to generate unique id for unique area
			this.constructor.prototype._cfIdCount = 1;
		return "src" + this.constructor.prototype._cfIdCount;
	},
	
	_generateId4Split: function()
	{
		if (this.constructor.prototype._cfIdCount == undefined)//static variable used to generate unique id for unique area
			this.constructor.prototype._cfIdCount = 1;
		return this._id + "_" + this.constructor.prototype._cfIdCount++;;
	},
	
	isPartialDirty: function(rangeInfo)
	{
		if(!this.result)
			return true;
		if(!this.dirty)
			return false;
		sr = this._parsedRef.startRow;
		sc = this._parsedRef.startCol;
		for(var i = rangeInfo.startRow; i <= rangeInfo.endRow; i++){
			var ri = i - sr;
			if(!this.result[ri])
				return true;
			for(var j = rangeInfo.startCol; j <= rangeInfo.endCol; j++){
				var ci = j -sc;
				if(!this.result[ri][ci])
					return true;
			}
		}
		return false;
	},
	
	setDirtyAndUpdate: function(dirtyFlag, isUpdate, rangeInfo){
		this.inherited(arguments);
		this.dirty = true;
		delete this.result;
		this._doc._calcManager.addUnCalcCF(this);
	},
	
	setDirty : function()
	{
		this.dirty = true;
		delete this.result;
		this._doc._calcManager.addUnCalcCF(this);
	},
	
	_clearResult: function(dsr, dsc, der, dec){
		this.dirty = true;
		this._doc._calcManager.addUnCalcCF(this);
		if(!this.result)
			return;
		for(var i = dsr; i <= der; i++){
			var r = this.result[i];
			if(!r)
				continue;
			for(var j = dsc; j <= dec; j++)
				delete r[j];
		}
	},
	
	_range2Show: function()
	{
		this.dirty = true;
		this._doc._calcManager.addUnCalcCF(this);
	},
	
	setCurrRangeNotify: function(data, area, refValue){
		var rulesObj = this.data;
		var range = websheet.Helper.parseRef(refValue);
		var size = area.getEndRow() - area.getStartRow();
		var dsr = range.startRow - area.getStartRow();
		var der = range.endRow - area.getStartRow();
		if (dsr < 0) {
            dsr = 0;
        }
        if (der > size) {
            der = size;
        }
        
        var size = area.getEndCol() - area.getStartCol();
		var dsc = range.startCol - area.getStartCol();
		var dec = range.endCol - area.getStartCol();
		if (dsc < 0) {
            dsc = 0;
        }
        if (dec > size) {
            dec = size;
        }
        
        var ret = rulesObj.clearResult(this._id, dsr, dsc, der, dec);
        if(ret){
        	this.dirty = true;
        	this._doc._calcManager.addUnCalcCF(this);
    		delete this.result;
        }else 
        	this._clearResult(dsr, dsc, der, dec);		
	}
});