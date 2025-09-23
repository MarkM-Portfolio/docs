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

dojo.provide("websheet.functions.errortype");

dojo.declare("websheet.functions.errortype", websheet.functions._singleargfunc, {
	
	constructor: function() {
		this.maxNumOfArgs = 1;
		this.inherited(arguments);
	},
	
	_operatorSingleValue: function(item) {
		var bCell = this.Object.isCell(item);
		var curObj = bCell ? item.getError() : item;
		if (curObj && curObj.errorCode){
			return curObj.errorCode;
		}
		if(bCell && !item.isFormula()){
			var para=cell.getValue();
			if(typeof(para) == "string"){
				var err = websheet.model.ModelHelper.toErrCode(para);
				if(err && err.errorCode)
					return err.errorCode;
			}
		}
		throw websheet.Constant.ERRORCODE["7"];
	}
});