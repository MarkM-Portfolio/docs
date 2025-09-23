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

dojo.provide("concord.widgets.sidebar.SidebarPanesContainer");

dojo.require("dijit.layout.AccordionContainer");


dojo.declare(
	"concord.widgets.sidebar.SidebarPanesContainer",
	dijit.layout.AccordionContainer,
{	
	buttonWidget: "concord.widgets.sidebar.SidebarPanesButton",	
		
	switchPane: function()
	{		
		this.forward();
	}
	
});

dojo.declare("concord.widgets.sidebar.SidebarPanesButton",
	dijit.layout._AccordionButton,
{
	/**
	 * overwrote the click behavior
	 */
	_onTitleClick: function(){		
		if (window.pe.scene.docType == "pres" && !pe.scene.bLoadFinished){
		   // please do not switch pane, before loading finished for Pres
		   return;
		}
		
		//this.inherited(arguments);		
		var parent = this.getParent();
		if(!parent._inTransition){
			parent.switchPane();	
			dijit.focus(this.focusNode);
		}
		
		if (window.pe.scene.docType == "pres"){
			var eventData = [{eventName: concord.util.events.sidebarEditorEvents_eventName_slideSorterExpand}];
			concord.util.events.publish(concord.util.events.sideBarEvents, eventData);
		}
	},
	
	_onTitleKeyPress: function(event){		
		this.inherited(arguments); 
		
		event = event || window.event;
		var key = (event.keyCode ? event.keyCode : event.which);
		if(key == dojo.keys.ENTER || key == dojo.keys.SPACE){
			this._onTitleClick();
			if (event.preventDefault) 
				event.preventDefault();
		}		
	}
});