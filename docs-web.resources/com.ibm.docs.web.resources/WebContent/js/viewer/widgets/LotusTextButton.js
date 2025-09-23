/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of IBM.                             */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* Copyright IBM Corporation 2012. All Rights Reserved.              */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("viewer.widgets.LotusTextButton");

dojo.require("dijit.form.Button");

dojo.declare(
		"viewer.widgets.LotusTextButton",
		[dijit._Widget, dijit.form.Button],
		{
			postCreate: function()
			{	
				this.inherited(arguments);
				dojo.addClass(this.titleNode.parentNode, "lotusBtn");
			}
		
		});