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

dojo.provide("concord.widgets.LotusTextButton");

dojo.require("dijit.form.Button");

dojo.declare(
		"concord.widgets.LotusTextButton",
		[dijit._Widget, dijit.form.Button],
		{
			postCreate: function()
			{	
				this.inherited(arguments);
				dojo.addClass(this.titleNode.parentNode, "lotusBtn");
			}
		
		});