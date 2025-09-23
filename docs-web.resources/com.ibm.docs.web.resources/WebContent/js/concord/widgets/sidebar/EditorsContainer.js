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

dojo.provide("concord.widgets.sidebar.EditorsContainer");

dojo.require("dijit.layout.AccordionContainer");


dojo.declare(
	"concord.widgets.sidebar.EditorsContainer",
	dijit.layout.AccordionContainer,
{
	buttonWidget: "concord.widgets.sidebar.EditorsButton",
	expanded: true,
	
	expand: function()
	{
		this.expanded = true;
		concord.util.events.publish(concord.util.events.sidebar_editorspane_switched, [true]);
	},
	
	minimize: function()
	{
		this.expanded = false;		
		concord.util.events.publish(concord.util.events.sidebar_editorspane_switched, [false]);
	},
	
	getTitleHeight: function()
	{
		var children = this.getChildren();
		if(children.length)
		{
			return children[0]._buttonWidget.getTitleHeight();
		}
		
		return null;
	}
	
});


dojo.declare("concord.widgets.sidebar.EditorsButton",
	dijit.layout._AccordionButton,
{
	_onTitleClick: function(){
		this.inherited(arguments);
		this._expandCollapseTitle();
		
	},
	_onTitleKeyPress: function(event){		
		this.inherited(arguments); 
		
		event = event || window.event;
		var key = (event.keyCode ? event.keyCode : event.which);
		if(key == dojo.keys.ENTER || key == dojo.keys.SPACE){
			this._expandCollapseTitle();
			if (event.preventDefault) 
				event.preventDefault();
		}		
	},
	
	_expandCollapseTitle: function(){
		var parent = this.getParent();
		if(parent.expanded)
			parent.minimize();
		else
			parent.expand();		
	}
});
