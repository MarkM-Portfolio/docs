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
dojo.provide("websheet.model.RulesObject.ConditionalFvos");
dojo.declare("websheet.model.RulesObject.ConditionalFvos", websheet.model.RulesObject.RuleVal, {
	_cfvosType: null,	//websheet.Constant.CfvosType
	_gte: null,		//boolean
	
	constructor: function(value, cfvo){
		this._cfvosType = cfvo.type;
		if(cfvo.gte != null)
			this._gte = cfvo.gte;
		if (this._cfvosType == websheet.Constant.CfvosType.MIN || 
			this._cfvosType == websheet.Constant.CfvosType.MAX) { // colorScale min, max must be a number
			this._type = websheet.Constant.valueType.NUMBER;
		}
		else {
			this.parseFormulaValue();
		}
	},
	
	getJSON: function(tokenArray, baseRange, rangeInfo)
	{
		var ret = {};
		ret.type = this._cfvosType;
		if(this._gte != null)
			ret.gte = this._gte;
		if(tokenArray && this.isFormula())
			ret.val = this.updateValue(tokenArray, baseRange, rangeInfo);
		else
			ret.val = this._value;
		return ret;
	},
	
//	compare: function(cFvos, baseRange, comRange, start){
//		if(this._cfvosType != cFvos._cfvosType)
//			return false;
//		if(this._gte != cFvos._gte)
//			return false;
//		
//		return this.inherited(arguments);
//	},	
	
	getType : function()
	{
		return this._cfvosType;
	}
});