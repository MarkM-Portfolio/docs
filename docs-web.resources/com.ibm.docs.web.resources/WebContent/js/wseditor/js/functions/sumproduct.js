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

dojo.provide("websheet.functions.sumproduct");

dojo.declare("websheet.functions.sumproduct", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 255;
	},
	
	/*number*/calc: function(context) {			
	   this.x = -1;
	   this.y = -1;
	   //the loop size for arg which does not contain default value
	   this.realX = -1;
	   this.realY = -1;
	   //the loop size for arg which contains default value
	   this.realDefaultX = -1;
	   this.realDefaultY = -1;
	   //the size of the default value
	   this.defaultX = 0;
	   this.defaultY = 0;
	   
	   this.defaultValues = [];
	   
	   var total = 0;
	   var l = this.args.length;
	   var calcArray = [];
	   for(var i = 0; i < l; i++){
		   var arg = this.args[i];
		   var calcValue = this.analyzeToken(arg, true);
		   var retValue = this._argCheck(i, calcValue);
		   calcArray.push(retValue);
	   }
	   var iMul = 1;
	   var bAllContainsDv = false;
	   if(this.realX == -1 || this.realY == -1){
		   //all the argument contain default value
		   bAllContainsDv = true;
		   this.realX = this.realDefaultX;
		   this.realY = this.realDefaultY;
	   }
	   for(var iy =0 ; iy < this.realY;iy++) {
		   for(var ix = 0; ix< this.realX; ix++){	
			   iMul = 1;
			   for(var i = 0; i < l; i++){
				   var calcValue = calcArray[i];
				   var calcValueY = calcValue[iy];
				   var v = null;
				   if(calcValueY)
					   v = calcValueY[ix];
				   if(v == null)
					   v = this._getDefaultValue(calcValue.defaultValue, ix, iy);//it might exist for range expression
				   if(this.Object.isCell(v))
					   v = this._getCellValue(context, v);
				   if(v == null || typeof v == "boolean" || typeof v == "string")
					   iMul = 0;
				   else if(v.errorCode)
					   throw v;
				   else if(typeof v == "number")
						iMul = websheet.Math.mul(iMul,v);
				   if(iMul == 0)
					   break;
				}
				total += iMul;
			}
		}
	   //add the default value for range expression
	   if(bAllContainsDv){
		   var allDv = this._addDefaultValues();
		   total += allDv;
	   }
	   return total;
	   
	},

	//get default value from default value arrays according to the position
	_getDefaultValue:function(dv,ix,iy){
		if(dv){
			if(dojo.isArray(dv)){
				var y = dv.length;
				var x = dv[0].length;
				dv = dv[iy % y][ix % x];
			}
		}
		return dv;
	},
	
	_addDefaultValues : function() {
		var dvs = [];
		var l = this.args.length;
		var defaultTotal = 0;
		var total = 0;
		if((this.y - this.realY) > 0 || (this.x - this.realX) > 0){
			for ( var iy = 0; iy < this.defaultY; iy++) {
				var dvX = [];
				for ( var ix = 0; ix < this.defaultX; ix++) {
					var iMul = 1;
					for ( var i = 0; i < l; i++) {
						var calcValue = this.defaultValues[i];
						var v = this._getDefaultValue(calcValue, ix, iy);
						if (v == null || typeof v == "boolean"
								|| typeof v == "string")
							iMul = 0;
						else if(v.errorCode)
							throw v;
						else if(typeof v == "number")
							iMul = websheet.Math.mul(iMul, v);
						if (iMul == 0)
							break;
					}
					defaultTotal += iMul;
					dvX.push(iMul);
				}
				dvs.push(dvX);
			}
			total += (defaultTotal * (this.x/this.defaultX) * (this.y - this.realY)/this.defaultY);
			total += (defaultTotal * (this.realY/this.defaultY) * (this.x - this.realX)/this.defaultX);
		}
		return total;
	},
	
	// always return two dimension array
	_argCheck:function(argIndex, calcValue){
		var retValue = calcValue;
		var x, y, realX, realY;
		var defaultX = 0;
		var defaultY = 0;
		var ref;
		if(retValue && retValue.defaultValue != undefined){
			if(retValue.rowSize){
				y = retValue.rowSize;
				x = retValue.colSize;
			}else{
				x = y = 1;
			}
			var defaultValue = retValue.defaultValue; 
			if(!dojo.isArray(retValue))
				retValue = [[retValue]];
			else if(!dojo.isArray(retValue[0]))
				retValue = [retValue];
			if(defaultValue){
				if(dojo.isArray(defaultValue)){
					defaultY = defaultValue.length;
					defaultX = defaultValue[0].length;
				}else{
					defaultX = 1;
					defaultY = 1;
					defaultValue = [[defaultValue]];
				}
				
				this.defaultValues.push(defaultValue);
				retValue.defaultValue = defaultValue;
			}
			
		}else if(dojo.isArray(retValue)){
		 	if(this.Object.isReference(retValue[0])) {
		 		if(retValue.length != 1)//~ operator
		 			throw websheet.Constant.ERRORCODE["519"]; //#VALUE!
		 		ref = retValue[0];
	 		}else{
	 			if(dojo.isArray(retValue[0])){
	 				x = retValue[0].length;
	 				y = retValue.length;
	 			}else{
	 				x = retValue.length;
	 				y = 1;
	 				retValue = [retValue];
	 			}
	 		}
		 }else if(this.Object.isReference(retValue)){
			 if(retValue.is3DArea())
				 throw websheet.Constant.ERRORCODE["524"]; //#REF!
			 ref = retValue;
		 }else if(retValue != null){
			 if(typeof retValue == "boolean" || typeof retValue == "string")
				 throw websheet.Constant.ERRORCODE["519"]; //#VALUE!
			 x = 1;
			 y = 1;
			 retValue = [[retValue]];
		 }
			 
		if(ref){
			retValue = this.getRows(ref);
			var rangeInfo = ref._getRangeInfo();
		 	var startRow = rangeInfo.startRow;//! operator
		 	var endRow = rangeInfo.endRow;
		 	var startCol = rangeInfo.startCol;
		 	var endCol = rangeInfo.endCol;
		 	x = endCol - startCol + 1;
		 	y = endRow - startRow + 1;
		 	realX = retValue.colSize;// the max column size which contain value
		}
		if(realX == null){
			realX = retValue[0].length;
		}
		if(realY == null){
			realY = retValue.length;
		}
		if(argIndex == 0){
			//define this.x and this.y
			this.x = x;
			this.y = y;
			//define the range of the loop size
			
			if(retValue.defaultValue != undefined){
				this.realDefaultX = realX;
				this.realDefaultY = realY;
				this.defaultX = defaultX;
				this.defaultY = defaultY;
			}else{
				this.realX = realX;
				this.realY = realY;
			}
		}else{
			//check if all the args have the same size, x*y
			if(this.x != x || this.y != y)
				throw websheet.Constant.ERRORCODE["519"]; //#VALUE!
			if(retValue.defaultValue != undefined ){
				//for the calcValue which has defaultValue, get the biggest loop size
				if(realX > this.realDefaultX)
					this.realDefaultX = realX;
				if(realY > this.realDefaultY)
					this.realDefaultY = realY;
				if(defaultX > this.defaultX)
					this.defaultX = defaultX;
				if(defaultY > this.defaultY)
					this.defaultY = defaultY;
			}else{
				if(this.realX == -1)
					this.realX = realX;
				if(this.realY == -1)
					this.realY = realY;
				// get the smallest loop size if calcValue does not has defaultValue,
				// because it's value is 0, there is useless to loop it for mul operator
				if(realX < this.realX)
					this.realX = realX;
				if(realY < this.realY)
					this.realY = realY;
			}
			
		}
		return retValue;
	},
	
	
	_getCellValue:function(context, cell,beSingleCell){
		this.preCheckCellError(context, cell);
		var value = 0;
		if (cell && cell.isNumber() && !cell.isBoolean())
			value = cell.getComputeValue();
		else {
			if (beSingleCell)
				throw websheet.Constant.ERRORCODE["519"]; //#VALUE
		}
		
		return value;
	}
	
});