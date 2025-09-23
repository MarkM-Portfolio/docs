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

dojo.provide("pres.model.TaskContainer");
dojo.require("pres.model.Htmlable");
dojo.require("pres.model.Attrable");
dojo.declare("pres.model.TaskContainer", [pres.model.Attrable, pres.model.Htmlable], {

	id: "",
	content: "",
	parent: null,

	constructor: function(taskContainer)
	{
		this.attrs = {};
		if(taskContainer)
		{
			this.id = taskContainer.id;
			this.attrs = taskContainer.attrs;
			this.content = taskContainer.content;
		}
	},

	toJson: function()
	{
		return {
			id: this.id,
			type: "taskContainer",
			content: this.content,
			attrs: dojo.clone(this.attrs)
		};
	},

	clone: function()
	{
		var taskContainer = new pres.model.TaskContainer();
		taskContainer.id = this.id;
		taskContainer.attrs = dojo.clone(this.attrs);
		taskContainer.content = this.content;
		return taskContainer;
	},

	getHTML: function()
	{
		var div = this._gartherAttrs();
		div += this.content;
		div += "</div>";
		return div;
	}

});
