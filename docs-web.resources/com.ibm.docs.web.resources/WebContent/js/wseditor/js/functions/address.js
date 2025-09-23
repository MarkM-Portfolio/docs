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

dojo.provide("websheet.functions.address");

dojo.declare("websheet.functions.address", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 5;
	},
	
	/*float*/calc: function() {
		var values = this.args;
		var address = "";
		var isA1Style = this.fetchScalaResult(values[3]);
		if(isA1Style == undefined)
			isA1Style = 1;
		var type = this.fetchScalaResult(values[2],false, true);
		if(type == undefined)
			type = 1;
		var column = this.fetchScalaResult(values[1],false, true);
		var row = this.fetchScalaResult(values[0],false, true);
		isA1Style = this.parseNumber(isA1Style);
		type = parseInt(this.parseNumber(type));
		column = parseInt(this.parseNumber(column));
		row = parseInt(this.parseNumber(row));
		//not support R1C1 format
		if(isA1Style == 0)
			throw websheet.Constant.ERRORCODE["502"];
		if(( column > 1024) || (column  < 1)
			|| ( row > 65536) || ( row < 1))
			throw websheet.Constant.ERRORCODE["502"];
		if(type < 1 || type > 4)
			throw websheet.Constant.ERRORCODE["519"];
		//sheet name
		if(values.length == 5){
			//check if sheetName is number or string
			//if is number, then the sheetName should be contained by ''
//			try{
//				if(sheetName != ""){
//					sheetName = this.parseNumber(sheetName);
//				}
//				sheetName = "'" + sheetName + "'";
//			}catch(e){
//				//if it is string then use the string directly
//			}
			var sheetName = this.fetchScalaResult(values[4],false, true);//not treat the empty cell as 0
			sheetName=this.getValue(sheetName,values[4].getType())
			if(sheetName!=""){
				if(websheet.Helper.needSingleQuotePattern.test(sheetName)){
					sheetName = sheetName.replace(/\'/g,"''");	// change '' if the sheet name has '
					sheetName="'"+sheetName+"'";
				}
				if(this.bMS){
					address += sheetName + "!";
				}else{
					address += sheetName + ".";
				}
			}
		}
		//if column absolute
		if(type == 1 || type == 3 ){
			address += "$";
		}
		address += websheet.Helper.getColChar(column);
		//if row absolute
		if(type == 1 || type == 2 ){
			address += "$";
		}
		address += row;
		return address;
	}
});