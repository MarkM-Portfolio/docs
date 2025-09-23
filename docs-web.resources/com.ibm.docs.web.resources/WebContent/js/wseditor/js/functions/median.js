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

dojo.provide("websheet.functions.median");

dojo.declare("websheet.functions.median", websheet.functions.FormulaBase,{
	
	constructor: function(){
		this.maxNumOfArgs = 32;
	},
	
	calc: function(context){
		var parmArray = new Array();
		// record how many numbers, it contains the default value count for range expression
		parmArray.count = 0;
		context.parmArray = parmArray;
		
		this.iterate(this.args, context);
		
		return this._getMedian(parmArray);
	},
	
	_operatorSingleValue: function(context, item, index, type,num){
		if(!num)
			return;
		if (this.bArrayFormula ){
			if(typeof item == "string" || typeof item == "boolean")
				return;
			if(item && item.errorCode)
				throw item;
		}
		
		var bObj = this.Object.isCell(item);
		if (bObj || type == this.tokenType.RANGEREF_TOKEN) {
			if(this.isNum(item))
				item = item.getComputeValue();
			else
				return;
		}else{
			if(type == this.tokenType.SINGLEQUOT_STRING) {
				throw websheet.Constant.ERRORCODE["525"]; //#NAME
			}
			if(typeof item == "string") {
				if(!this.isNum(item))
					throw websheet.Constant.ERRORCODE["519"]; //#VALUE
				else
					item = this.parseNumber(item);
			} else if(typeof item == "boolean") {
				item = this.parseNumber(item);
			}
		}
		
		if(this.isNum(item)){
			var info = {v:item};
			if(num > 1){
				info.num = num;
			}
			var parmArray = context.parmArray;
			parmArray.push(info);
			parmArray.count += num;
		}
		
	},
	
	_getMedian: function(parmArray){
		var count = parmArray.count;
		if(count == 0)
			throw websheet.Constant.ERRORCODE["504"];//#NUM!
		
		var halfCount = Math.floor(count/2);
		parmArray.sort(function(key1,key2){return key1.v-key2.v;});
		var len = parmArray.length;
		var totalNum = 0;
		var param;
		for(var i = 0; i < len; i++){
			param = parmArray[i];
			if(param.num){
				totalNum += param.num;
			}else
				totalNum++;
			if(totalNum >= halfCount){
				if(totalNum == halfCount)
					i++;
				break;
			}
		}
		
		var halfIndex = i;
		//odd or it is has several same number
		if(count % 2 != 0 || ( param.num > 1 && totalNum > halfCount))	
			return parmArray[halfIndex].v;
		
		//even
		var add = websheet.Math.add(parmArray[halfIndex - 1].v, parmArray[halfIndex].v);
		return websheet.Math.div(add, 2);
	}
});