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

dojo.provide("concord.chart.i18n.Math");
dojo.require("concord.chart.i18n.Helper");

concord.chart.i18n.Math = {
	
	_addSubOp: function(arg1, arg2, isAdd){		
		 var r1,r2,m,n; 
		 
		 if(concord.chart.i18n.Helper.isInt(arg1)){// arg1 is int and arg2 is float
		   r1 = 0;
		   r2 = this._getDD(arg2);
		 }
		 else if(concord.chart.i18n.Helper.isInt(arg2)){// arg2 is int and arg1 is float
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
	     //precision of excel calculation is 15	
	     return  parseFloat(result.toPrecision(15));
	},
	
	//usefull
	sub: function(arg1, arg2, isFloat){
		if(isFloat == undefined)
		   isFloat = false;	
		if(!isFloat && concord.chart.i18n.Helper.isInt(arg1) && concord.chart.i18n.Helper.isInt(arg2))
		   return arg1 - arg2;
		return this._addSubOp(arg1, arg2, false);
	},
	
	
	//usefull
	mul: function(arg1, arg2, isFloat){
		var exp = 0;
		if(concord.chart.i18n.Helper.isSciNum(arg1)){
			var sciNum1 = concord.chart.i18n.Helper.parseSciNum(arg1);
			exp = sciNum1.exp;
			arg1 = sciNum1.base;
		}
		if(concord.chart.i18n.Helper.isSciNum(arg2)){
			var sciNum2 = concord.chart.i18n.Helper.parseSciNum(arg2);
			exp += sciNum2.exp;
			arg2 = sciNum2.base;
		}
			
		var result;
		
		if(isFloat == undefined)
		   isFloat = false;	
		var i1 = concord.chart.i18n.Helper.isInt(arg1);
		var i2 = concord.chart.i18n.Helper.isInt(arg2);
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
			 if(concord.chart.i18n.Helper.isSciNum(tmp1) || concord.chart.i18n.Helper.isSciNum(tmp2))
		    	 result = this._sciDiv(tmp1 , tmp2); 
		     else
		     	result = tmp1/tmp2;
		}
		if(exp !=0 ){
			if(concord.chart.i18n.Helper.isSciNum(result)){
				var sciResult = concord.chart.i18n.Helper.parseSciNum(result);
				exp += sciResult.exp;
				result = sciResult.base;
			}
			return parseFloat(result + "e" + exp);
		}
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
	
	_sciDiv: function(arg1,arg2){
		var exp = 0;
		if(concord.chart.i18n.Helper.isSciNum(arg1)){
			var sciNum1 = concord.chart.i18n.Helper.parseSciNum(arg1);
			exp = sciNum1.exp;
			arg1 = sciNum1.base;
		}
		if(concord.chart.i18n.Helper.isSciNum(arg2)){
			var sciNum2 = concord.chart.i18n.Helper.parseSciNum(arg2);
			exp -= sciNum2.exp;
			arg2 = sciNum2.base;
		}
		
		var result = this.div(arg1,arg2);
		
		if(exp !=0 ){
			if(concord.chart.i18n.Helper.isSciNum(result)){
				var sciResult = concord.chart.i18n.Helper.parseSciNum(result);
				exp += sciResult.exp;
				result = sciResult.base;
			}
			return parseFloat(result + "e" + exp);
		}
		return result;		
	}
};