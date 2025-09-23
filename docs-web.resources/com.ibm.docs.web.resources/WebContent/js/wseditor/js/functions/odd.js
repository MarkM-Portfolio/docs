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

dojo.provide("websheet.functions.odd");

dojo.declare("websheet.functions.odd", websheet.functions.FormulaBase,{
	
	constructor: function(){
		this.maxNumOfArgs = 1;
		this.inherited(arguments);
	},
	
	/*number*/calc: function(){
		var value = this.args[0];
		var parm = this.fetchScalaResult(value);
		var type = value.getType();
		
		if(dojo.isArray(parm) && (parm.length > 1)) // concatenation is not support
			throw websheet.Constant.ERRORCODE["519"];
		
		parm = this.getValue(parm, type, this.LOCALE_NUM);
		var absParm = Math.abs(parm);
		if(absParm % 2 == 1)
			return parm;
		var intPart = Math.floor(absParm);
		var added = intPart % 2; // added == 1: intPart is even; added == 2: intPart is odd.
		return (parm >= 0) ? intPart + added + 1 : -(intPart + added + 1);
		
		/*
		if(intPart % 2 == 1)
			return (parm >= 0) ? intPart + 2 : -(intPart + 2);
		return (parm >= 0) ? intPart + 1 : -(intPart + 1);
		*/
	}
});

