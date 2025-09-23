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

dojo.provide("pres.test.api.utils.slideUtil");
dojo.require("concord.pres.TextMsg");

pres.test.api.utils.slideUtil = {

	getDateTime: function(node)
	{
		var dateTimeDrawFrames = dojo.query(".draw_frame[presentation_class='date-time']", node);
		var value = dateTimeDrawFrames[0];
		return TEXTMSG.getTextContent(dateTimeDrawFrames[0]);
	},

	getFooter: function(node)
	{
		var footerDrawFrames = dojo.query(".draw_frame[presentation_class='footer']", node);
		return TEXTMSG.getTextContent(footerDrawFrames[0]);
	},

	getPageNumber: function(node)
	{
		var pageNumberFields = dojo.query(".draw_frame[presentation_class='page-number'", node);
		return TEXTMSG.getTextContent(pageNumberFields[0]);
	},

	getModeContetnValue: function(ElementContent)
	{

		return TEXTMSG.getTextContent(dojo.create("div", {
			innerHTML: ElementContent
		}));
	},

	getFieldArray: function(Elements)
	{
		var dateTimeElement = new Array();
		var footerElement = new Array();
		var pageNumberElement = new Array();
		var field = new Array();
		for ( var i = 0; i < Elements.length; i++)
		{
			if (Elements[i].family == "date-time")
			{
				dateTimeElement.push(Elements[i]);
			}
			else if (Elements[i].family == "footer")
			{
				footerElement.push(Elements[i]);
			}
			else if (Elements[i].family == "page-number")
			{
				pageNumberElement.push(Elements[i]);
			}

		}
		field.push(dateTimeElement, footerElement, pageNumberElement);
		return field;
	},
	getEditorElements: function(editor)
	{
		return  dojo.clone(dojo.query(".draw_frame", editor.domNode));
	}

};