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

dojo.provide("pres.utils.cssHelper");

pres.utils.cssHelper = {
	findCssSheet: function(styleName, create, doc)
	{
		var theDoc = doc || document;
		var useOldIEWay = dojo.isIE && (dojo.isIE!=11) && theDoc.createStyleSheet;
		if (styleName && theDoc.cssSheets && theDoc.cssSheets[styleName])
			return theDoc.cssSheets[styleName];
		if (create)
		{
			var sheet;
			if (useOldIEWay)
			{
				sheet = theDoc.createStyleSheet();
				if (styleName)
				{
					if (theDoc.cssSheets == null)
						theDoc.cssSheets = {};
					theDoc.cssSheets[styleName] = sheet;
				}
			}
			else
			{
				sheet = theDoc.createElement('style');
				sheet.type = 'text/css';
				if (styleName)
					sheet.name = styleName;
				theDoc.getElementsByTagName('head')[0].appendChild(sheet);
				if (theDoc.cssSheets == null)
					theDoc.cssSheets = {};
				if (styleName)
					theDoc.cssSheets[styleName] = sheet;
			}
			return sheet;
		}
		return null;
	},
	replaceFontName: function(style)
	{
		style = style.replace(
	            /\'Helvetica Neue\'/g,
				"'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
	    style = style.replace(
	            /\'Helvetica Neue Light\'/g,
	            "'Helvetica Neue Light',HelveticaNeueLight,HelveticaNeue-Light,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
	    style = style.replace(
	            /\'Helvetica Neue Black\'/g,
	            "'Helvetica Neue Black',HelveticaNeueBlack,HelveticaNeue-Black,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
	    style = style.replace(
	            /\'Helvetica Neue Heavy\'/g,
	            "'Helvetica Neue Heavy',HelveticaNeueHeavy,HelveticaNeue-Heavy,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
	    style = style.replace(
	            /\'Helvetica Neue Bold\'/g,
	            "'Helvetica Neue Bold',HelveticaNeueBold,HelveticaNeue-Bold,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
	    style = style.replace(
	            /\'Helvetica Neue Medium\'/g,
	            "'Helvetica Neue Medium',HelveticaNeueMedium,HelveticaNeue-Medium,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
	    style = style.replace(
	            /\'Helvetica Neue Thin\'/g,
	            "'Helvetica Neue Thin',HelveticaNeueThin,HelveticaNeue-Thin,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
	    style = style.replace(
	            /\'Helvetica Neue UltraLight\'/g,
	            "'Helvetica Neue UltraLight',HelveticaNeueUltraLight,HelveticaNeue-UltraLight,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
	    style = style.replace(
	            /\'Helvetica Neue Black Condensed\'/g,
	            "'Helvetica Neue Black Condensed',HelveticaNeueBlackCondensed,HelveticaNeue-Black-Condensed,HelveticaNeueBlack,HelveticaNeue-Black,'Helvetica Neue Black','Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
	    style = style.replace(
	            /\'Helvetica Neue Bold Condensed\'/g,
	            "'Helvetica Neue Bold Condensed',HelveticaNeueBoldCondensed,HelveticaNeue-Bold-Condensed,HelveticaNeueBold,HelveticaNeue-Bold,'Helvetica Neue Bold','Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
	    style = style.replace(
	            /\'Calibri Light\'/g,
	            "'C-alibri-Light'");
	    style = style.replace(
	            /\'?Calibri\'?/g,
	            "Calibri,Carlito,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
	    style = style.replace(
	            /\'C-alibri-Light\'/g,
	            "'Calibri Light',Calibri,Carlito,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
	    return style;
	},
	insertCssStyle: function(css, styleName, replace, doc)
	{
		css = this.replaceFontName(css);
		var theDoc = doc || document;
		var sheet = this.findCssSheet(styleName, true, theDoc);
		var useOldIEWay = dojo.isIE && (dojo.isIE!=11) && theDoc.createStyleSheet;
		if (useOldIEWay)
		{
			if (replace)
				sheet.cssText = "";
			sheet.cssText += css;
			
			return sheet.owningElement;
		}
		else
		{
			if (replace)
			{
				sheet.innerHTML = css;
			}
			else
			{
				sheet.appendChild(theDoc.createTextNode(css));
			}
			
			return sheet;
		}
	}

}
