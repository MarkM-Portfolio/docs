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

dojo.provide("websheet.functions.substitute");
dojo.require("websheet.functions.FormulaBase");

dojo.declare("websheet.functions.substitute", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 4;
		this.minNumOfArgs = 3;
	},
	
	/*string*/calc: function() {
		var values = this.args;
		var length = values.length;
		var type = values[0].getType();
		var stringValue = this.getValue(this.fetchScalaResult(values[0],false,true), type);
		
		type= values[1].getTokenType();				
		var oldValue = this.getValue(this.fetchScalaResult(values[1],false, true), type);
		
		type = values[2].getTokenType();		
		var newValue = this.getValue(this.fetchScalaResult(values[2],false,true),type);
		
		var whichValue;
		if(length == 4){
			var type = values[3].getType();
			if(type == this.tokenType.NONE_TOKEN)
			   throw websheet.Constant.ERRORCODE["519"];	
			whichValue = this.fetchScalaResult(values[3]);
			whichValue = this.getValue(whichValue, type, this.LOCALE_NUM);
			if(whichValue < 1)
			   throw websheet.Constant.ERRORCODE["519"];
			
			whichValue = parseInt(whichValue);			
		}
			
		if(oldValue.length == 0){
		   return stringValue;
		}else if(length == 3){
		   oldValue = this._regESC(oldValue);
		   return stringValue.replace(new RegExp(oldValue, "g"), newValue);
		}else if(length == 4){
		   return this._whichReplace(stringValue, oldValue, newValue, whichValue);
		}else{
	       throw websheet.Constant.ERRORCODE["519"];
		}
	},
	  
   _regESC: function(oldValue)
   {
   	   var reg="[{^$()[.?+*|\\\\]";
   	   var result = oldValue.replace(new RegExp(reg, "g"), "\\$&");
   	   
   	   return result;
   },
   
	_whichReplace: function(stringValue, oldValue, newValue, whichValue){ 
	  var count = 0;
	  var offset = 0;
	  do{ 
		  offset = stringValue.indexOf(oldValue,offset);
		  if(offset != -1){			  
			  count ++;
			  if(count == whichValue){	
				return stringValue.substring(0,offset)+stringValue.substring(offset).replace(oldValue,newValue); 
			  }	else{		  
				  offset += 1;
			  }
		  }
	  }while(offset != -1);
	  
	  return stringValue;
    }
});  