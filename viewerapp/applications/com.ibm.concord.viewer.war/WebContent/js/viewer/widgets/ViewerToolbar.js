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
dojo.provide("viewer.widgets.ViewerToolbar");

dojo.require("dijit.Toolbar");

dojo.declare(
	"viewer.widgets.ViewerToolbar",
	[dijit.Toolbar],
	{
	    //it must setted as -1,or the toobar will getfocus
	    // if it does not set "-1" the first child will getfocus twice.
		tabIndex : "-1",
		
		//In the dojo control arrow key in toobar is selected on different child, 
		//  ViewerToolbar need to disable this feature.
		_onContainerKeypress: function(evt){
			if(evt.keyCode == dojo.keys.UP_ARROW && evt.keyChar != '&'
			    ||evt.keyCode == dojo.keys.DOWN_ARROW && evt.keyChar != '('
			    ||evt.keyCode == dojo.keys.LEFT_ARROW && evt.keyChar != '%'
			    ||evt.keyCode == dojo.keys.RIGHT_ARROW) 
			{
				dojo.stopEvent(evt);
			}
			else
				this.inherited(arguments);
		 },
		 
		 //In ViewerToolbar allows tab button in the menu and switch, 
		 // the dojo Toolbar does not allow this function.
		 _startupChild: function(/*dijit._Widget*/ widget){
			// summary:
			//		Setup for each child widget
			// description:
			//		Sets tabIndex=0 on each child, so that the tab key will 
			//		 visit each child rather than leave the container rather.
			// tags:
			//		private
			widget.attr("tabIndex", "0");
		},
		
		//it is no need to focus the first child,when the toolbar getFocus through click toolbar 
		//  or click a child in toolbar.
		// if you use tab to getfocus,the first child will getfocus,as it is tabindex is 0
		_onContainerFocus: function(evt){
		
		}
	});