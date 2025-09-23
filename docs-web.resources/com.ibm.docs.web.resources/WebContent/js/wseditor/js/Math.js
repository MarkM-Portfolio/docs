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

dojo.provide("websheet.Math");
dojo.require("websheet.Helper");

websheet.Math = {
	
	  _addSubOp: function(arg1, arg2, isAdd){		
		 var r1,r2,m,n; 
		 
		 if(arg1 % 1 == 0){// arg1 is int and arg2 is float
		   r1 = 0;
		   r2 = this._getDD(arg2);
		 }
		 else if(arg2 % 1 == 0){// arg2 is int and arg1 is float
		   r2 = 0;
		   r1 = this._getDD(arg1);
		 }	 
		 else{// arg1 and arg2 both are float
		 	r1 = this._getDD(arg1);
		 	r2 = this._getDD(arg2);
		 }   
	     n = (r1>=r2)?r1:r2;
	     m = Math.pow(10,n);	    
	     if(isAdd)
	        var result = (arg1*m + arg2*m)/m; 
	     else
	        var result = (arg1*m - arg2*m)/m;
	     
	     if(!(result % 1 == 0))
	    	//precision of excel calculation is 15	
		     result = parseFloat(result.toPrecision(15));
	     return result;
	},
	
	//return the int value of a float, for example, 1.21 ==> 121,  1.21e-15 ==> 121
	_getInt: function(arg){
		var s=arg+"";
		s = s.toLowerCase();
		return Number(s.split("e")[0].replace(".",""));
	},
	
	//return the decimal digits of a float
	_getDD: function(arg){
	    var s = arg + "";
	    s = s.toLowerCase();
		var i = s.indexOf("e");
		var m=0;
		if(s.indexOf("e")!=-1){
		     m=Number(s.split("e")[1]);
		}
		var n = 0;		
		var base = s.split("e")[0];
		var digarray = base.split(".");
		if(digarray.length>1)
			n = digarray[1].length;		
		return n-m;
	},
	
	// inline websheet.Helper.isInt() with num % 1 == 0
	add: function(arg1, arg2, isFloat){
		if(isFloat == undefined)
		   isFloat = false;			
		if(!isFloat && (arg1 % 1 == 0) && (arg2 % 1 == 0))
		   return arg1 + arg2;
        return this._addSubOp(arg1, arg2, true);
	},
	
	sub: function(arg1, arg2, isFloat){
		if(isFloat == undefined)
		   isFloat = false;	
		if(!isFloat && (arg1 % 1 == 0) && (arg2 % 1 == 0))
		   return arg1 - arg2;
		return this._addSubOp(arg1, arg2, false);
	},
	
	mul: function(arg1, arg2, isFloat){
		var exp = 0;
		if(websheet.Helper.isSciNum(arg1)){
			var sciNum1 = websheet.Helper.parseSciNum(arg1);
			exp = sciNum1.exp;
			arg1 = sciNum1.base;
		}
		if(websheet.Helper.isSciNum(arg2)){
			var sciNum2 = websheet.Helper.parseSciNum(arg2);
			exp += sciNum2.exp;
			arg2 = sciNum2.base;
		}
			
		var result;
		
		if(isFloat == undefined)
		   isFloat = false;	
		var i1 = arg1 % 1 == 0;
		var i2 = arg2 % 1 == 0;
		if(!isFloat && i1 && i2)
		   result = arg1 * arg2;
		else{
			 var m = 0;
			 var num1, num2;
			 if(i1){// arg1 is int and arg2 is float
			   num1 = arg1;
			   
			   m += this._getDD(arg2);
			   num2 = this._getInt(arg2);
			 }
			 else if(i2){// arg2 is int and arg1 is float
			   num2 = arg2;
			   
			   m += this._getDD(arg1);
			   num1 = this._getInt(arg1);
			 }
			 else{// arg1 and arg2 both are float
			   m += this._getDD(arg1);
			   num1= this._getInt(arg1);
			   
			   m += this._getDD(arg2);
			   num2 = this._getInt(arg2);
			 }
			 var tmp1 = num1 * num2;
			 var tmp2 = Math.pow(10,m);
			 if(websheet.Helper.isSciNum(tmp1) || websheet.Helper.isSciNum(tmp2))
		    	 result = this._sciDiv(tmp1 , tmp2); 
		     else
		     	result = tmp1/tmp2;
		}
		if(exp !=0 ){
			if(websheet.Helper.isSciNum(result)){
				var sciResult = websheet.Helper.parseSciNum(result);
				exp += sciResult.exp;
				result = sciResult.base;
			}
			result = parseFloat(result + "e" + exp);
		}
		if(!(result % 1 == 0) && !websheet.Helper.isSciNum(result))
	    	//precision of excel calculation is 15	
		     result = parseFloat(result.toPrecision(15));
		return result;
	},
	
	_sciDiv: function(arg1,arg2){
		var exp = 0;
		if(websheet.Helper.isSciNum(arg1)){
			var sciNum1 = websheet.Helper.parseSciNum(arg1);
			exp = sciNum1.exp;
			arg1 = sciNum1.base;
		}
		if(websheet.Helper.isSciNum(arg2)){
			var sciNum2 = websheet.Helper.parseSciNum(arg2);
			exp -= sciNum2.exp;
			arg2 = sciNum2.base;
		}
		
		var result = this.div(arg1,arg2);
		
		if(exp !=0 ){
			if(websheet.Helper.isSciNum(result)){
				var sciResult = websheet.Helper.parseSciNum(result);
				exp += sciResult.exp;
				result = sciResult.base;
			}
			result = parseFloat(result + "e" + exp);
		}
		if(!(result % 1 == 0) && !websheet.Helper.isSciNum(result))
	    	//precision of excel calculation is 15	
		     result = parseFloat(result.toPrecision(15));
		return result;		
	},
	
	div: function(arg1, arg2, isFloat){
		if(websheet.Helper.isSciNum(arg1) || websheet.Helper.isSciNum(arg2))
			return this._sciDiv(arg1,arg2);
		if(isFloat == undefined)
		   isFloat = false;	
		 var i1 = arg1 % 1 == 0;
		 var i2 = arg2 % 1 == 0;
		 if(!isFloat && i1 && i2){
			 var result = arg1/arg2;
			 if(!(result % 1 == 0))
		    	//precision of excel calculation is 15	
			     result = parseFloat(result.toPrecision(15));	 
		   return result;
		 }
		 var t1 = 0,t2 = 0, r1, r2;  
		 
		 if(i1){// arg1 is int and arg2 is float
		   r1 = arg1;
		   
		   t2 = this._getDD(arg2);
		   r2 = this._getInt(arg2);  
		 }
		 else if(i2){// arg2 is int and arg1 is float
		 	r2 = arg2;
		 	
		    t1 = this._getDD(arg1);
		    r1 = this._getInt(arg1);  
		 }
		 else{// arg1 and arg2 both are float
		 	t1 = this._getDD(arg1);
		    r1 = this._getInt(arg1);  
		    
		    t2 = this._getDD(arg2);
		    r2 = this._getInt(arg2);
		 }
		 return this.mul(r1/r2 , Math.pow(10,t2-t1)); 	               
	},
	//TODO: There may be one or two decimal digits inaccuracy 
	pow: function(arg1, arg2, isFloat){
		 var bNegative = arg1 < 0 ? true : false;
		 if(bNegative)
		 	arg1 = 0 - arg1;
		 if(arg1 % 1 == 0){
		     var result = Math.pow(arg1, arg2);
		 	 if(!(result % 1 == 0) && !(arg2 % 1 == 0)){
			    if(typeof(result) == "number" && (isNaN(result) || !isFinite(result)))
					throw websheet.Constant.ERRORCODE["504"]; 
				//precision of excel calculation is 15						
			    result = parseFloat(result.toPrecision(15));		      		
		 	 }
		 }else{
			var t1 = this._getDD(arg1); 
	
		    var m = Math.pow(10, t1);
		    var tmp1 = Math.pow(arg1*m, arg2);
		    var tmp2 = Math.pow(m,arg2);
		    if(!isFinite(tmp1)|| !isFinite(tmp2))
		        var result = Math.pow(arg1, arg2);
		    else
		    	var result = this.div(tmp1 , tmp2); 
		    if(!(result % 1 == 0) && !(arg2 % 1 == 0)){
			    if(typeof(result) == "number" && (isNaN(result) || !isFinite(result)))
				  throw websheet.Constant.ERRORCODE["504"];
				 //precision of excel calculation is 15	
			    result = parseFloat(result.toPrecision(15));
			 }
		 }
    	if(bNegative && arg2%2 != 0)
		 	return 0 - result;
		else		 	 	
		    return result;
	},
	
	mean: function(array)
	{
		if (!array || array.length == 0)
			return NaN;
		
		var l = array.length;
		
		if (l < 1)
			return 0;
		
		var sum = 0, count = 0;		
		for (var i=0; i<l; i++)
		{
			var v = array[i];
			if (typeof v == "number" && !isNaN(v))
			{
				count++;
				sum = this.add(sum,v);
			}
		}
		
		if (count > 0)
			return sum / count;
		
		return NaN;
	},
	
	std: function(array, mean, bPopulation)
	{
		if (!array || array.length == 0)
			return NaN;
		
		var l = array.length;
		
		if (l < 2)
			return NaN;
		
		if (mean == undefined || mean == null)
		{
			mean = this.mean(array);
		}
				
		var sumdev = 0, count = 0;
		for (var i=0; i<l; i++)
		{
			var v = array[i];
			if (typeof v == "number" && !isNaN(v))
			{
				count++;
				var adev = this.pow(v-mean,2);
				sumdev = this.add(sumdev,adev);					
			}
		}
		if (!bPopulation) {
			count--;
		}
		if (count > 0) {
			var dev = sumdev / count;
			return sigma = Math.sqrt(dev);				
		}
		return NaN;
	}
};