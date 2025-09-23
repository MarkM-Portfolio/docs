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
dojo.provide("viewer.widgets.ScalableContentContainer");

dojo.require("dijit._Widget");
dojo.require("viewer.widgets.PageControlWidget");
dojo.declare("viewer.widgets.ScalableContentContainer", [viewer.widgets.PageControlWidget],{
	scale: 0,
	style: "",
	
	postCreate: function(){
		dojo.subscribe(viewer.util.Events.SCALE_CHANGED, this, this._onRescaled);
		dojo.subscribe(viewer.util.Events.STYLE_CHANGED, this, this._onStyleChanged);
		this.inherited(arguments);
	},
	
	_onRescaled: function(newScale){
		if (this.scale != newScale){
			if (this.style != ''){			
				this.style = '';
				this.notifyStyleChanged('');
			}
			this.scale = newScale;
			this.resize();
		}
	},
	
	_onStyleChanged: function(newStyle){
		if (this.style != newStyle){
			this.style = newStyle;
			var oldScale = this.scale;
			this.resize();
		}
	},
	
	notifyStyleChanged: function(newStyle){
		if (this.viewManager && this.viewManager.setCurrentStyle)
			this.viewManager.setCurrentStyle(newStyle);
	},
	
	notifyScaleChanged: function(newScale){
		if (this.viewManager && this.viewManager.setCurrentScale)
			this.viewManager.setCurrentScale(newScale);
	}

});