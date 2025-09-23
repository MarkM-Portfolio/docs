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

dojo.provide("concord.util.beta");

concord.util.beta.isBetaFeature = function(featureName) {
	var betaStr = g_BetasStr;
	if(!betaStr || betaStr == '') return false;

	try
	{
		//Don't use eval and remove '[' , ']' first
		var subStr = betaStr.substring(1, betaStr.length-1);
		if(subStr)
		{
			var betaArray = subStr.split(',');
			for (var index = 0; index < betaArray.length; index++)
			{
				var betaFeature = betaArray[index];
				if (betaFeature)
				{
					if(betaFeature == featureName) return true;
				}
			}				
		}
	}
	catch (e)
	{
		console.log("Error happens while getting beta_features." , e);
	}
	return false;		

};