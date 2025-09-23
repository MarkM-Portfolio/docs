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

dojo.provide("pres.utils.fontSizeUtil");
dojo.require("pres.constants");

pres.utils.fontSizeUtil = {

	getFirst: function(limited)
	{
		var arr = limited ? pres.constants.FONT_SIZE_ITEMS : pres.constants.FONT_SIZE_ITEMS_EXTEND;
		return arr[0];
	},
	
	getLast: function(limited)
	{
		var arr = limited ? pres.constants.FONT_SIZE_ITEMS : pres.constants.FONT_SIZE_ITEMS_EXTEND;
		return arr[arr.length - 1];
	},
		
	getPrev: function(current, limited)
	{
		var arr = limited ? pres.constants.FONT_SIZE_ITEMS : pres.constants.FONT_SIZE_ITEMS_EXTEND;

		if (current == 0)
			return 0;

		var c = parseInt(current);
		if (!c)
			return c;

		for ( var i = arr.length - 1; i >= 0; i--)
		{
			var item = arr[i];
			if (c >= item)
			{
				if (c > item)
				{
					return item;
				}
				else if (c == item)
				{
					return i == 0 ? c : arr[i - 1];
				}
			}
		}

		return c;
	},

	getNext: function(current, limited)
	{
		var arr = limited ? pres.constants.FONT_SIZE_ITEMS : pres.constants.FONT_SIZE_ITEMS_EXTEND;

		var c = parseInt(current);
		if (!c)
			return arr[0];

		for ( var i = 0; i < arr.length; i++)
		{
			var item = arr[i];

			if (c <= item)
			{
				if (c < item)
				{
					return item;
				}
				else if (c == item)
				{
					return i == arr.length - 1 ? c : arr[i + 1];
				}
			}
		}

		return c;
	}

};