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

dojo.provide("websheet.functions.mode");

dojo.declare("websheet.functions.mode", websheet.functions.FormulaBase, {
	
	constructor: function() {	
		this.maxNumOfArgs = 255;
	},
	
	/*float*/calc: function(context) {
		for(var i=0;i<this.args.length;i++){
			this.preCheckParm(this.args[i]);
		}

		var nums= [];
		context.nums = nums;
		this.iterate(this.args, context);
		if(nums.length==0)
			throw websheet.Constant.ERRORCODE["7"]; //#N/A
		
		var candidateCount = 0;
		var candidateValue = null;
		var candidatePos = 0;
		var calculated=new Object();
		var keys=new Array();
		var len = nums.length;
		while(nums.length!=0){		
			var curValue= nums.shift();
			var num = 1;
			if(curValue.num)
				num = curValue.num;
			curValue = curValue.v;
			if( calculated[curValue] === undefined){
			  	var tmp={};
				tmp.position = len - (nums.length + 1);
				tmp.count = num;
				calculated[curValue] =tmp;	
				keys.push(curValue);				
			}else{									
				calculated[curValue].count += num;
			}		
		}
		len =keys.length;
		for(var i=0;i<len;i++){
			var tmp= calculated[keys[i]];
			if(candidateValue===null){
				candidateCount=tmp.count;
				candidateValue=keys[i];
				candidatePos=tmp.position; 
			}else if(tmp.count > candidateCount){				
				candidateCount=tmp.count;
				candidateValue=keys[i];
				candidatePos=tmp.position; 		
			}
			else if(tmp.count == candidateCount){
				if(candidatePos > tmp.position){				
				candidateCount=tmp.count;
				candidateValue=keys[i];
				candidatePos=tmp.position;
				}	
			}		
		}
		
		if(candidateCount > 1)
			return candidateValue;
		throw websheet.Constant.ERRORCODE["7"]; //#N/A
	},
	
	_operatorSingleValue:function(context,item,index,type, num){
		if(!num)
			return;
		if (this.bArrayFormula){
			if(typeof item == "string" || typeof item == "boolean")
				return;
			if(item && item.errorCode)
				throw item;
		}
		//for case  =mode(,1,1)
		if(type == this.tokenType.NONE_TOKEN){
				throw websheet.Constant.ERRORCODE["519"];
		}	
		if(type == this.tokenType.DOUBLEQUOT_STRING){
			throw websheet.Constant.ERRORCODE["519"];
		}
		if(type == this.tokenType.RANGEREF_TOKEN || type == this.tokenType.NAME){
			if((curObj === "") || (this.Object.isCell(item) && !item.isNumber()))
				return;
		}
			
		var curObj = this.Object.isCell(item)? item.getComputeValue():item;
		var v = this.getValue(curObj,type,this.LOCALE_NUM);
		var info = {v:v};
		if(num > 1)
			info.num = num;
		context.nums.push(info);
		
	},
	
	preCheckParm:function(value){
		if(this.Object.isToken(value)) {
			if(value.getType() == this.tokenType.NAME) {
				var error = value.getError();
				if (error)
					throw error;
//				if (error && error == websheet.Constant.ERRORCODE["525"] && !value.getEnabled())
//					throw websheet.Constant.ERRORCODE["525"];
			}
		}
		  
		var result = this.analyzeToken(value);		
		if (this.isRangeObj(result))
			return;
		
	}
});