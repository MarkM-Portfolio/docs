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

dojo.provide("websheet.functions.frequency");

dojo.declare("websheet.functions.frequency", websheet.functions.FormulaBase,{
	
	constructor: function(){
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 2;
	},
	
	//accept array, range, number as parameters
	/*Array*/calc: function(context){
		var dataArray = new Array();
		var binsArray = new Array();
		var dataToken = this.args[0];
		var binsToken = this.args[1];
		//e.g. =frequency({},{})
		if(dataToken._token == "{}" || binsToken._token == "{}")
			throw websheet.Constant.ERRORCODE["508"];
		var dataType = dataToken.getType();
		context.bDataArray = true;
		try{
			context.retArray = dataArray;
			this.iterate(dataToken, context);
		}catch(e){
			//should return the first encountered error
			//if unparsed error, first check if there are recursive error, if yes, return #Err522! directly
			//if it is other error throw it directly
			if( e == websheet.Constant.ERRORCODE["2001"] ){
				var value = this.analyzeToken(dataToken);
				if(dojo.isArray(value)) {
					// get constant-array, not only the first element
					// if the result is a single reference(union/intersection), get it
					var res = this.analyzeToken(value[0]);
					if (this.isRangeObj(res) && (value.length == 1))
						value = res;
				}
				if(this.isRangeObj(value)){
					var rangeInfo=value._getRangeInfo();
					var curCell = context.currentCell;
					var sheetName = curCell.getSheetName();
					var r = curCell.getRow();
					var c = curCell.getCol();
					if(rangeInfo.sheetName == sheetName
							&& rangeInfo.startRow <= r && rangeInfo.startCol <= c
							&& rangeInfo.endRow >= r && rangeInfo.endCol >= c)
						throw websheet.Constant.ERRORCODE["522"];
				}
					
			}
			throw e;
		}
		dataArray = this._cleanData(dataArray, true);
		
		var binsType = binsToken.getType();
		if(binsType == this.tokenType.DOUBLEQUOT_STRING || binsType == this.tokenType.BOOLEAN_TOKEN)
			throw websheet.Constant.ERRORCODE["519"];
		
		var err = binsToken.getError();
		if (err) throw err;
		
		context.bDataArray = false;
		context.retArray = binsArray;
		this.iterate(binsToken, context, {bIgnoreErr:true});
		binsArray = this._cleanData(binsArray, false);
		
		var retArray = new Array();
		if(dataArray && dataArray.length == 0){  			//e.g. =frequency(A1,2)	A1 is empty cell
			retArray.push({index: 0, v: 0, count: 0});
			retArray.push({index: 1, v: 0, count: 0});
		}
		else{
			if(binsArray && binsArray.length == 0) 			//e.g. =frequency({1,3},A1)	A1 is empty cell
				binsArray.push(0);
			
			dataArray.sort(function(key1,key2){return key1-key2;});
			
			var tmpBinsArray = this._keepArrayIndex(binsArray);
			tmpBinsArray.sort(function(key1,key2){return key1.v-key2.v;});
			retArray = this._getResultArray(dataArray, tmpBinsArray);
			if(dataArray.frequency){
				dataArray.frequency.sort(function(key1,key2){return key1.v-key2.v;});
				retArray = this._getResultArray(dataArray.frequency, tmpBinsArray);
			}
		}	

		return this._adjustResult(retArray);  
	},
	
	//ignore: false ==> taken text as number 0
	//		  true  ==> skip text 
	_cleanData: function(array, ignore){
		var retArray = [];
		var len = array.length;
		for(var i = 0 ; i < len; i++){
			if(typeof array[i] == "string")
				if(ignore)
					continue;
				else
					array[i] = 0;
			else if(typeof array[i] == "boolean")
				if(ignore)
					continue;
				else
					array[i] = (array[i] == true) ? 1 : 0;
			retArray.push(array[i]);
		}
		return retArray;
	},
	
	// e.g. =frequency(A1:B2,**)
	//		=frequency({1,true,"a",'b',"3"},**)
	//		=frequency(A:A+1,**)
	_operatorSingleValue: function(context, item, index, type,num){
		if(!num)
			return;
		if (this.bArrayFormula){
			if (typeof item == "string" || typeof item == "boolean")
				return;
		}

	    if(this.Object.isCell(item)){
	    	if(item.isError())
	    		item = item.getError();
	    	else if(!item.isBoolean())
	   			item = item.getComputeValue();
	   		else
	   			item = item.getComputeValue() == 1;
		}
		else{
			if(type == this.tokenType.RANGEREF_TOKEN){
				return;//empty cell, no cell object
			}
			if(type == this.tokenType.SINGLEQUOT_STRING){
				throw websheet.Constant.ERRORCODE["525"]; //#NAME
			}
			if (typeof item == "string" || typeof item == "boolean")
				throw websheet.Constant.ERRORCODE["519"]; //#VALUE
		}
	
	    if(item && item.errorCode){
			if(context.bDataArray)
				throw item;
			else
				throw websheet.Constant.ERRORCODE["7"];//if binArray contains error throw #N/A
		}
	    
		if(this.isNum(item)){
			var retArray = context.retArray;
			if(num > 1){
				//default values for range expression
				if(!retArray.frequency)
					retArray.frequency = [];
				var v = {v:item, num: num};
				retArray.frequency.push(v);
			}else
				retArray.push(item);
		}
	},
	
	// creat a new array and keep the old indexs
	_keepArrayIndex: function(binsArray){
		var tmp = new Array();
		var lenBA = binsArray.length;
		for(var i = 0; i < lenBA; i++){
			var binItem = {
				index : i, 			//index in old bins array
				v: binsArray[i], 	//value in old bins array
				count:0 			//for later use to keep the counting result
			};
			tmp.push(binItem);
		}
		tmp.push({index: lenBA, v: Infinity, count: 0}); 
		return tmp;
	},
	
	//e.g.  =frequency({1,2,2,3,4,5},{2,2,2,2})  ==>{3,0,0,0,3}
	_getResultArray: function(dataArray,tmpBinsArray){
		var lenDA = dataArray.length;
		var lenBA = tmpBinsArray.length;
		if(lenDA == 0 || lenBA == 0)
			throw websheet.Constant.ERRORCODE["508"]; // 
		var j = 0;
		for(var i = 0; i < lenBA; i++){
			if (j == lenDA){ //=frequency({1,2,3},{4,5,6,7)		In this case, break the for loop after 
				break;
			}
			var count = tmpBinsArray[i].count;
			var item = tmpBinsArray[i].v;
			for(; j < lenDA; j ++){
				var itemD = dataArray[j];
				var num = 1;
				if(itemD.v != undefined && itemD.num > 0){
					num = itemD.num;
					itemD = itemD.v;
				}
				if(itemD <= item){
					count += num;
				}else
					break;
			}
			
			tmpBinsArray[i].count = count;
		}
		
		return tmpBinsArray;
	},
	
	//Adjust the result array with the old bins array order.
	_adjustResult: function(retArray){
		var resultArray = [];
		retArray.sort(function(key1,key2){return key1.index - key2.index;});
		
		for(var each in retArray){
			var count = retArray[each].count;
			resultArray.push([count]);
		}
		
		return resultArray;
	}
});