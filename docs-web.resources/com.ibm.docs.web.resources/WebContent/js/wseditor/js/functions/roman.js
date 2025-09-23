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

dojo.provide("websheet.functions.roman");
dojo.require("websheet.functions._doubleargfunc");
dojo.declare("websheet.functions.roman", websheet.functions._doubleargfunc, {
	pChars : ['M','D','C','L','X','V','I'],
	pValues : [1000,500,100,50,10,5,1],
	
	constructor: function(){
		this.minNumOfArgs = 1;
		this.maxNumOfArgs = 2;
	},

	/*number*/_calcSingleValue: function(nVal,nMode){
		if(nVal == undefined)
			nVal = 0;
		var nNumber = Math.floor(this.getValue(nVal, null, this.LOCALE_NUM));
		if(nNumber < 0 || nNumber > 3999)
			throw websheet.Constant.ERRORCODE["519"];//#VALUE
		
		if(nMode == undefined) {
			nMode = 0;
		} else if (typeof nMode == "boolean") {
			if(nMode)	// base==true -> 0
				nMode=0;
			else 		// base==false -> 4
				nMode=4;
		} else {
			nMode = Math.floor(this.getValue(nMode, null, this.LOCALE_NUM));
			if(nMode < 0 || nMode > 4)
				throw websheet.Constant.ERRORCODE["519"];//#VALUE
		}
		
		return this.Arabit2Roman(nNumber,nMode);
	},
	
	Arabit2Roman: function(nVal,nMode){
		var nMaxIndex = this.pValues.length-1;
		var aRoman = "";
		for(var i=0 ; i<= Math.floor( nMaxIndex/2 ); i++)
		{
				var nIndex = 2 * i;
				var nDigit = Math.floor( nVal/this.pValues[nIndex] );
				if((nDigit%5)==4)
				{
					var nIndex2 = (nDigit == 4) ? nIndex - 1 : nIndex - 2;
					var nSteps = 0;
					while( (nSteps < nMode) && (nIndex < nMaxIndex) )
					{
						nSteps++;
						if( this.pValues[ nIndex2 ] - this.pValues[ nIndex + 1 ] <= nVal )
							nIndex++;
						else
							nSteps = nMode;
					}
					aRoman += this.pChars[ nIndex ];
					aRoman += this.pChars[ nIndex2 ];
					nVal = nVal + this.pValues[ nIndex ];
					nVal = nVal - this.pValues[ nIndex2 ];
				}
				else
				{
					if( nDigit > 4 )
						aRoman += this.pChars[ nIndex - 1 ];
					for(var j=0 ; j<(nDigit % 5) ; j++)
						aRoman += this.pChars[ nIndex ];
					nVal %= this.pValues[ nIndex ];
				}
		}
	    return aRoman;
	}
	
});