/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.widgets.LotusTextSelect");

dojo.require("dijit.form.Select");

dojo.declare(
		"concord.widgets.LotusTextSelect",
		[dijit._Widget, dijit.form.Select],
		{
			postCreate: function()
			{	
				this.inherited(arguments);
				dojo.addClass(this.dropDown.domNode, "lotusActionMenu");
			}
		
		});