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

/**
 * Summary: Returns the rank of a number in a list of numbers.
 */
dojo.provide("websheet.functions.rank");
dojo.require("websheet.functions.FormulaBase");
dojo.declare("websheet.functions.rank", websheet.functions.FormulaBase, {
	order: 0,
	totalOfNum : 0,
	previousIndex : 0,
	totalRepeat : 0,
	constructor:function(){
		this.maxNumOfArgs = 3;
		this.minNumOfArgs = 2;
		this.inherited(arguments);
	},
	/*number*/calc:function(){
		//reset
		this.order = 0;
		this.totalOfNum = 0;
		this.previousIndex = 0;
		this.totalRepeat = 0;
		
		var values = this.args;
		var type;
		// check arg3
		if(values[2]){
			type=values[2].getType();
			if(type == this.tokenType.SINGLEQUOT_STRING)
				throw websheet.Constant.ERRORCODE["525"];
			this.order=this.fetchScalaResult(values[2]);
			if(typeof(this.order) == "string")
				this.order = this.toBoolean(this.order);
			this.order=this.parseNumber(this.order,this.LOCALE_NUM);
		}
		// check arg1
		number=values[0];
		type=number.getType();
		number=this.fetchScalaResult(number);
		number=this.getValue(number,type,this.LOCALE_NUM);
		// check arg2
		this.getResult(values[1], number);
		
		if(this.totalRepeat==0)
	 		throw websheet.Constant.ERRORCODE["7"];
		 /**
		  * Result=total - total of lesser - total of repeated
		  * Example: range:2 2 4 5 number:2 -> result:3 or 1  repeatNum=2,index=4 --> 4-0-1=3 or 1
		  */
		if(this.order==0)
		 	return this.totalOfNum-this.previousIndex-this.totalRepeat+1;  
		else
		 	return this.previousIndex+1;
	},
	
	getResult:function(value, number){
		var array = this.analyzeToken(value);
		if(dojo.isArray(array)){
			dojo.forEach(array,function(item,index){
				this.getResult(item, number);
			}, this);
		}else if(this.isRangeObj(array)){
			var range = this.analyzeToken(array);
			var func;
			if(range.is3DArea()) {
				func = dojo.hitch(this, 'iterate3DWithFunc');
			} else {
				func = dojo.hitch(this, 'iterateWithFunc');
			}
			
			func(range, dojo.hitch(this, function(cell, row, col) {
				if(cell.getError()!=null) // when error throw exception
					throw websheet.Constant.ERRORCODE["519"];
				if(cell.isNumber()){ // treat boolean type as a number
					this.totalOfNum++;
					var cellValue=cell.getComputeValue();
					if(cellValue===number)
						this.totalRepeat++;
					else if(cellValue<number)
						this.previousIndex++;
				}
				return true;
			}));
		}else{
			throw websheet.Constant.ERRORCODE["525"];
		}
	}
});
	