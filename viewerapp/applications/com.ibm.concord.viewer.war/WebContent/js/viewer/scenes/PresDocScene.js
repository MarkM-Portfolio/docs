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
dojo.provide("viewer.scenes.PresDocScene");

dojo.require("viewer.scenes.AbstractScene");
dojo.require("viewer.widgets.PresActions");

dojo.declare("viewer.scenes.PresDocScene", 
			[viewer.scenes.AbstractScene], {

	DEFAULT_STYLE: 'slideMode',
	style: this.DEFAULT_STYLE,
	constructor: function(){
			
	},
	
	getTitleImageName: function(){
		if(g_env!="smart_cloud")
			return "ibmdocs_presentations_32.png";
		else
			return "ibmdocs_presentation_24.png";
	},

	createContentWidget: function(mode){
		var widget = null;
		if (mode == 'Normal'){
			widget = this.createNormalContentWidget();
		}else if(mode == 'Continuous') {
			widget = this.createContinuousWidget();
		}
		return widget;
	},

	createNormalContentWidget: function(){
		var contentContainer = dijit.byId("contentPane");
		var normalContentView = new viewer.widgets.NormalContentContainer({id: "normalView",
																			style: this.DEFAULT_STYLE,
																		    pagesInfo: this.doc.getPagesInfo(),
																			orgWidth: this.DEFUALT_NORMAL_PAGE_WIDTH,
																			//baseUri: this.getFullImageRoot(),
																			baseUri: this.getPageRoot(),
																			tabIndex: 0,
																			viewManager: this});
		contentContainer.setContent(normalContentView.domNode);
		return normalContentView;
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
	
	insertModeButton: function(toolbar){
		var button = new dijit.form.ToggleButton({
			id: "T_Mode_Normal",
			title: this.nls.labelNormal,
			iconClass: "normalModeIcon",
			showLabel: false,
		    label: this.nls.labelNormal,
		    _onClick: dojo.hitch(this, function(){		    	
		    	this.switchMode("Normal", this.DEFAULT_STYLE);
		    	})
		});

		toolbar.addChild(button);	
		
		// play mode
		button = new dijit.form.Button({
			id: "T_Mode_Play",
			title: this.nls.labelPlay,
			showLabel: false,
		    label: this.nls.labelPlay,
			iconClass: "normalPlayIcon",
			onClick: dojo.hitch(this, function(){//_onButtonClick		    	
				var strssUrl = window.location.href + '?mode=slideshow';
				var ssWindow = window.open(strssUrl,
						'SlideShow', 'height='+screen.height+',width='+screen.width + ',left=0,top=0');
		    })
		});
		dojo.addClass(button.domNode,"lotusDijitButtonImg");
		toolbar.addChild(button);		
	},
	
	stage: function(){
		var playBtn = dijit.byId('T_Mode_Play');
		if (playBtn){
			if (this.jobId != null){
				playBtn.attr('disabled', true);
			}
			else{
				playBtn.attr('disabled', false);
			}
		}
		this.inherited(arguments);
	},
	
	staged: function(success, response){
		this.inherited(arguments);
		if (success){
			var playBtn = dijit.byId('T_Mode_Play');
			playBtn.attr('disabled', false);
		}
	},
	
	setCurrentStyle: function(newStyle){
		this.inherited(arguments);
		if (this.style == this.DEFAULT_STYLE){
			dijit.byId('T_Mode_Normal').attr('checked', true);
		}else{
			dijit.byId('T_Mode_Normal').attr('checked', false);
		}
	},
	showHelp: function(){
		var regEx = new RegExp("^((https|http|)?:\/\/)[^\s]+");
		if(regEx.test(gPres_help_URL)){
			window.open(gPres_help_URL);
		}
		else{
			window.open(window.location.protocol+'//'+window.location.host + gPres_help_URL + this.helpTail);
		}
	},
	
	createActions: function(){
		
		var actions = new viewer.widgets.PresActions({
			id: "T_Actions",
			manager: this
		});
		dojo.body().appendChild(actions.domNode);
		actions.position();
		return actions;
	}

});