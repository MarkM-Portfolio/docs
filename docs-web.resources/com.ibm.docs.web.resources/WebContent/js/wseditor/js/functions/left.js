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

dojo.provide("websheet.functions.left");
dojo.require("websheet.functions.FormulaBase");
dojo.require("concord.i18n.CharCategory");
dojo.require("concord.i18n.utf");

dojo.declare("websheet.functions.left", websheet.functions.FormulaBase, {
	
	bLeft: false,
	bRight: false,
	bRightB: false,
	
	constructor: function() {
		this.maxNumOfArgs = 2;
		this.bLeft = true;
	},
	
	/*string*/calc: function() {
		var values = this.args;
		var length = values.length;
		var type = values[0].getType();
		var stringValue =this.getValue(this.fetchScalaResult(values[0],false,true),type);
		
		var lengthValue = 1;
		if(length == 2)
		{
			var type = values[1].getType();
			lengthValue = this.fetchScalaResult(values[1]);
			if(dojo.isArray(lengthValue))
				throw websheet.Constant.ERRORCODE["519"];	
					
		    lengthValue = this.getValue(lengthValue, type, this.LOCALE_NUM);		       
			if(lengthValue < 0)
			   throw websheet.Constant.ERRORCODE["519"];	
			lengthValue = parseInt(lengthValue);			
		}
		
		if(lengthValue <= 0) 
			return "";

		stringValue=websheet.BrowserHelper._composeByLocale(stringValue);

		if(this.bLeft)
		{
			return this._left(stringValue,lengthValue);
		}
		
		if(this.bRight)
		{
			return this._right(stringValue,lengthValue);
		}
		
		if(this.bRightB)
		{
			if(this.isCJKLocale())
			{
				return this._rightb(stringValue,lengthValue);
			}
			else
				return this._right(stringValue,lengthValue);
		}
	},
	
	_left: function(stringValue,lengthValue)
	{
		if(lengthValue>=stringValue.length)
			return stringValue;
			
		var n = 0;
		var i = 0;
		for(i=0;i<stringValue.length;i++)
		{
			var c = stringValue.charCodeAt(i);
			if(concord.i18n.utf.U16_IS_SURROGATE(c))
			{
				if(concord.i18n.utf.U16_IS_SURROGATE_LEAD(c))
					continue; // ignore the first surrogate
				else
					n++;
			}
			else
				n++;
			if(n==lengthValue)
				break;
		}
		return stringValue.substring(0,i+1);
	},
	
	_right: function(str,len)
	{
		if(len>=str.length)
			return str;
		
		var n = 0;
		var i = 0;
		for(i=str.length-1;i>=0;i--)
		{
			var c = str.charCodeAt(i);
			if(concord.i18n.utf.U16_IS_SURROGATE(c))
			{
				if(concord.i18n.utf.U16_IS_SURROGATE_LEAD(c))
					n++;
				else
					continue; // ignore the second surrogate
			}
			else
				n++;
			if(n==len)
				break;
		}
		
		return str.substring(i);
	},
	
	_rightb: function(stringValue,lengthValue)
	{
		var half = false;
		var cnt = 0;
		var n = 0;
		for(var i=stringValue.length-1;i>=0;i--)
		{
			var c = stringValue.charCodeAt(i);
			if(concord.i18n.CharCategory.isCJK(c))
			{
				cnt += 2;
			}
			else if(concord.i18n.utf.U16_IS_SURROGATE(c))
			{
				if(concord.i18n.utf.U16_IS_SURROGATE_LEAD(c))
					cnt++;
				else
					continue;
			}
			else
			{
				cnt++;
			}
			if(cnt>lengthValue)
			{
				half = true;
				n = i+1;
				break;
			}
			else if(cnt==lengthValue)
			{
				n = i;
				break;
			}
		}
		var res = stringValue.substring(n);
		if(half)
			res = " " + res;
		return res;
	}
});