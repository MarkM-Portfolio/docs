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

dojo.provide("websheet.functions.proper");
dojo.require("websheet.functions.FormulaBase");

dojo.declare("websheet.functions.proper", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 1;
	},
	
	/*string*/calc: function() {
		var value = this.args[0];
		var type = value.getType();
		var stringValue= this.getValue(this.fetchScalaResult(value,false,true), type);
		var result = stringValue.charAt(0).toLocaleUpperCase();
		for(var i = 0; i < stringValue.length - 1; i++){
	   	 	if(this._isLetter(stringValue.charAt(i)))
	   	 		result = result + stringValue.charAt(i + 1).toLocaleLowerCase();
	   	 	else
	   	 		result = result + stringValue.charAt(i + 1).toLocaleUpperCase();
		}
		
	   return result;
	},
	
	//TODO: support unicode 
    _isLetter: function(character){
	    var reg = /^[a-zA-Z]+$/;
	    var de=[196,228,214,246,223,220,252];
		if (reg.test(character)) {
		    return true;
		}else if(dojo.indexOf(de, character.charCodeAt(0))>= 0){
			return true;
		}
		
	   return false;
    }
});