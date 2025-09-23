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
dojo.provide("websheet.parse.SharedFormulaRef4DV");
dojo.require("websheet.parse.SharedFormulaRefBase");
dojo.declare("websheet.parse.SharedFormulaRef4DV",websheet.parse.SharedFormulaRef4RulesObj,{
	
	constructor: function(/*parsedRef*/range, id){
		this.usage = websheet.Constant.RangeUsage.DATA_VALIDATION;
		if(id && id.indexOf("srd") == 0){
			var n = Number(id.slice(3));
			if(!isNaN(n) &&  (this.constructor.prototype._dvIdCount == undefined || this.constructor.prototype._dvIdCount <= n))
				this.constructor.prototype._dvIdCount = ++n;
		}
	},
	
	_generateId:function() {
		if (this.constructor.prototype._dvIdCount == undefined)//static variable used to generate unique id for unique area
			this.constructor.prototype._dvIdCount = 1;
		this._id = "srd" + this.constructor.prototype._dvIdCount++; // it won't conflict with name range id
	},
	
	getNextId:function()
	{
		if (this.constructor.prototype._dvIdCount == undefined)//static variable used to generate unique id for unique area
			this.constructor.prototype._dvIdCount = 1;
		return "srd" + this.constructor.prototype._dvIdCount;
	}
});