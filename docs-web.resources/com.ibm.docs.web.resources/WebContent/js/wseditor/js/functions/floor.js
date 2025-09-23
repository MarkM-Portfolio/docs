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

dojo.provide("websheet.functions.floor");
dojo.require("websheet.functions._doubleargfunc");
dojo.declare("websheet.functions.floor", websheet.functions._doubleargfunc, {
	
	constructor: function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 3;
		this.bCeil = false;
	},
	
	/*boolean*/calc: function(context) {
		// the implement of symphony,keep it.
//		var mode=0;
//		if(this.args.length==3){
//			mode= this.fetchScalaResult(this.args[2],true); 
//			type = this.args[2].getType();			
//			mode = this.getValue(mode, type, this.LOCALE_NUM);
//		}
//		context.mode = mode;
		return this.calcDoubleArgFunc(this.args, context);
	},
	
	_calcSingleValue : function(rawValue, step, context) {
		// floor(2,0),floor(2,false),floor(2,)
		if (!step)
			throw websheet.Constant.ERRORCODE["532"];
		if (!rawValue)
			return 0;
		rawValue = this.getValue(rawValue, null, this.LOCALE_NUM);
		step = this.getValue(step, null, this.LOCALE_NUM);
		// FLOOR(3.5, -2) -> #NUM!   FLOOR(-3.5,2) -> -4    FLOOR(-3.5,-2) -> -2  FLOOR(3.5,2) -> 2
		if (rawValue > 0 && step < 0)
			throw websheet.Constant.ERRORCODE["504"];
		if(rawValue % step == 0)
			return rawValue;
		
//		MS format just use following code
		var count = websheet.Math.div(rawValue, step);
		count = this.bCeil ? Math.ceil(count) : Math.floor(count);
		
		return websheet.Math.mul(step, count);
	}
});