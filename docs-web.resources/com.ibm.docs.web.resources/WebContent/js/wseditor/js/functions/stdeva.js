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

dojo.provide("websheet.functions.stdeva");
dojo.require("websheet.functions.stdev");

dojo.declare("websheet.functions.stdeva", websheet.functions.stdev, {
	
	_calcCount:function(retArray, item, bNumber, bBool, bFormula, num){
		if(bNumber || bBool){
			if(num > 1)
			{
				// for range expression default value, such as A:A+1, the default value is 1
				retArray.defaultValue = item;
				retArray.defaultNum = num;
				retArray.calcCount += num;
			}else{
				retArray.push(item);
				retArray.calcCount++;
			}
		}else{
			//do not count empty cell
			if(item !== "" || bFormula){
				retArray.calcCount++;
				retArray.push(0);
			}
		}
	}	
});