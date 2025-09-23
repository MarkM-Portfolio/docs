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
dojo.provide("viewer.scenes.BasicDocScene");

dojo.require("viewer.scenes.AbstractScene");
dojo.require("viewer.widgets.ContinuousContainer");
dojo.require("viewer.widgets.Actions");
dojo.declare("viewer.scenes.BasicDocScene", 
			[viewer.scenes.AbstractScene], {
				
	defaultMode : 'Continuous',//continuous 				
	DEFAULT_STYLE: 'fitWidth',
	style: this.DEFAULT_STYLE,
	supportedMode: ['Continuous'],
		
	constructor: function(){
		
	},
	
	insertModeButton: function(toolbar){
//		this.inherited(arguments);
		
		// play mode
		button = new dijit.form.ToggleButton({
			id: "T_Mode_Continuous",
			title: this.nls.labelFitWidth,
			iconClass: "fitWidthIcon",
			showLabel: false,
		    label: this.nls.labelFitWidth,
		    _onClick: dojo.hitch(this, function(){		    	
		    	this.switchMode("Continuous", this.DEFAULT_STYLE);
		    	})		    
		});
 		toolbar.addChild(button);			
	},
	
	createContentWidget: function(mode){
		var widget = null;
		if (mode == 'Continuous'){
			widget = this.createContinuousWidget();
		}else{
			widget = this.inherited(arguments);
		}
		
		return widget;
	},
		
	createContinuousWidget: function(){
		var contentContainer = dijit.byId("contentPane");
		var continuousView = new viewer.widgets.ContinuousConatiner({id: "continuousView",
																	  size: this.doc.getPages(),
																	  pagesInfo: this.doc.getPagesInfo(),
																	  style: this.DEFAULT_STYLE,
//																	  scale: this.DEFUALT_NORMAL_VIEW_SCALE,
																	  orgWidth: this.DEFUALT_NORMAL_PAGE_WIDTH,
																	  //baseUri: this.getFullImageRoot(),
																	  baseUri: this.getPageRoot(),
																	  tabIndex: 0,
																	  viewManager: this});
		contentContainer.setContent(continuousView.domNode);
		return continuousView;
	},
	
	setCurrentStyle: function(newStyle){
		this.inherited(arguments);
		if (this.style == this.DEFAULT_STYLE){
			dijit.byId('T_Mode_Continuous').attr('checked', true);
		}else{
			dijit.byId('T_Mode_Continuous').attr('checked', false);
		}
	},
	
	createActions: function(){
		//return;
		
		var actions = new viewer.widgets.Actions({
			id: "T_Actions",
			manager: this
		});
		dojo.body().appendChild(actions.domNode);
		actions.position();
		return actions;
	}
});