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

dojo.provide("websheet.functions._stdevBase");

dojo.declare("websheet.functions._stdevBase", websheet.functions.FormulaBase, {
	
	constructor: function() 
	{
		this.maxNumOfArgs = 255;
	},
	
	//if the text is a number text, then convert it to number. Or throw error
	_getStringNumber: function(input)
	{
		var parseResult = this.NumberRecognizer.parse(input);
		if(!parseResult.isNumber)
			throw websheet.Constant.ERRORCODE["519"];
		
		return parseResult.fValue;
	},
	
	/** Get all sample data.
	 * The input boolean or text that can be converted to number will be used.
	 * The boolean or text in the referenced cell or range will be ignored.
	 */
	_getAlldata: function(context)
	{
		var alldata = [];
		var arraydata = [];
		var defaultValues = [];//used for arraydata
		context.calcCount = 0;
		for(var i=0;i<this.args.length;i++)
		{
			var arg = this.args[i];	
			var cv = this.analyzeToken(arg, true);
			if(typeof cv == "number"){
				alldata.push(cv);
				context.calcCount++;
			}else if(typeof cv == "boolean"){
				alldata.push(cv ? 1:0);
				context.calcCount++;
			}else if(typeof cv == "string"){
				alldata.push(this._getStringNumber(cv));
				context.calcCount++;
			}else {
				var retArray = [];
				retArray.calcCount = 0;
				context.retArray = retArray;
				this.iterate(arg, context);
				context.calcCount += retArray.calcCount;
				if (retArray && retArray.defaultValue != undefined) {
					arraydata = arraydata.concat(retArray);
					if(retArray.defaultValue != undefined){
						defaultValues.push({defaultValue: retArray.defaultValue, defaultNum: retArray.defaultNum});
					}
				} else {
					alldata = alldata.concat(retArray);
				}
			}
		}
		// for range expression
		if (arraydata.length > 0) {
			var ret = {};
			ret = arraydata.concat(alldata);
			ret.defaultValues = defaultValues;
			return ret;
		}
		
		return alldata;
	},
		
	//Calculate the average of the sample
	_average: function(alldata, context)
	{
		var sum = 0;
		var n = alldata.length;
		for(var i=0;i<n;i++) {
			var temp = alldata[i];
			sum = websheet.Math.add(sum, temp);
		}
		
		//default values for range expression
		var dvs = alldata.defaultValues;
		if(dvs){
			var length = dvs.length;
			for(var i = 0; i < length; i++){
				var dv = dvs[i];
				sum += websheet.Math.mul(dv.defaultValue, dv.defaultNum);
			}
		}
		return websheet.Math.div(sum,context.calcCount);
	},
	
	_sumdev: function(alldata,average)
	{
		var n = alldata.length;
		var sumdev = 0;
		for(var i=0;i<n;i++)
		{
			var s = alldata[i];
			var dev = websheet.Math.pow(s-average,2);
			sumdev = websheet.Math.add(sumdev,dev);
		}
		
		var dvs = alldata.defaultValues;
		if(dvs){
			var length = dvs.length;
			for(var i = 0; i < length; i++){
				var dv = dvs[i];
				var dev = websheet.Math.pow(dv.defaultValue-average,2);
				dev = websheet.Math.mul(dev, dv.defaultNum);
				sumdev = websheet.Math.add(sumdev,dev);
			}
		}
		return sumdev;
	},
	
	_calcValue: function(context) {
		var data = this._getAlldata(context);
		return this._calcSingleValue(data, context);
	},
	
	/** Called by this.iterate.
	 * Item will be number, text, or a cell model
	 */ 
	_operatorSingleValue: function(context, item, index, type, num)
	{
		if(!num)
			return;
		
		if (this.bArrayFormula){
			if(typeof item == "string" || typeof item == "boolean")
				return;
		}
		var bNumber = false;
		var bBool = false;
		var bFormula = false;
		var bObj = this.Object.isCell(item);
		if(bObj)
		{
			if(item.isError()){
				throw item.getError();
			}
			bNumber = item.isNumber();
			//If the cell's number format is boolean, ignore it.
			bBool = item.isBoolean();
			bFormula = item.isFormula();
			item = item.getComputeValue();
		}
		else if(typeof item == "number")
		{
			bNumber = true;
		}
		
		if(item && item.errorCode)
			throw item;
		this._calcCount(context.retArray,item, bNumber, bBool, bFormula, num);
	}
});