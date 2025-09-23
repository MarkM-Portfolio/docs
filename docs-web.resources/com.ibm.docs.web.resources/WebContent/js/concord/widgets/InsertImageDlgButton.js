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

dojo.provide('concord.widgets.InsertImageDlgButton');
dojo.require("dijit.form.Button");

(function()
{
	dojo.declare("concord.widgets.InsertImageDlgButton", [dijit.form.Button], {
		postCreate: function()
		{	
			this.inherited(arguments);
			dojo.addClass(this.titleNode.parentNode, "lotusBtn");
		},		
		__onClick: function(/*Event*/ e){
			pe.lotusEditor.insertImageButton = this.type;
			this.inherited(arguments);
		}
	});
})();