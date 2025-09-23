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

dojo.provide("concord.pres.PresEditorExtend");

dojo.require("concord.editor.EditorExtend");
dojo.require("concord.util.HtmlContent");

dojo.declare("concord.pres.PresEditorExtend", concord.editor.EditorExtend, {
	_config: {
				increaseFontSize : 0.2,
				increaseUnit : 'em',
				increaseClasses : null,
				defaultInit : 1
			},
			
	getConfig: function() {
		return this._config;
	},
	
	getFontSizeValue: function( node ) {
		var value;
		va = node.getStyle( 'font-size' );
		if(va.search('em')>0) value = parseFloat( va);
		return value;
	},
	
	incDecValue: function(value, increaseStep, type) {
		value += ( type == 'increase' ? 1 : -1 ) * increaseStep;
		return this.stepValue(value, increaseStep);
	},
	
	stepValue: function(value, increaseStep) {
		value = Math.max( value, 0.2 );
		return value;
	},
	
	setStyle: function(node, property, value, unit) {
	//add line height property to avoid overlap in presentation
		node.setStyle(property, value + unit);
		node.setStyle('line-height', '1em');
	},
	
	getStyle:  function( property, value, unit) {
		var unitValue = value+ unit;
		var styles = {'line-height':'1em'};
		styles[property] = value + unit;
		return styles;
	},
	
	getBoxInEdit: function() {
		var box = null;
		var curDrawFrameId  = window['pe'].scene.getDrawFrameInEditModeId();
		if (curDrawFrameId){
			 box = window['pe'].scene.slideEditor.getRegisteredContentBoxById(curDrawFrameId);
		}
		return box;
	},
	
	_getCurEditor: function() {
		var box = this.getBoxInEdit();
		return box ? box.editor : null;
	},
	
	/**
	 * I guess this getActiveDoc can be replaced by _getActiveEditor.document.$
	 * But in plugins/list/plugin.js, there's something different, it has the determination on
	 * box.editModeOn
	 */
	getActiveDoc: function() {
		var box = this._getCurEditor();
		return (box && box.editModeOn) ? box.editor.document.$ : null;
	},
	
	/**
	 * Here's the rule, if the handleCoEdit is invoked by a plugin, and PresEditorExtend defines the method, _+pluginName
	 * the method deals with
	 * 	 - addtional logic than co-edit.  For example increase/decrease
	 * Also, the event name should be passed by data, and this editor extend would accordingly create the event data
	 */
	handleCoEdit: function(data) {
		var func = '_' + data.command;
		if( data.command && this[func]) {
		 	this[func](data);
		} 
		
		var eventData = null;
		var createData = '_' + data.eventName + 'Data';
		if (data.eventName && this[createData]) {
			eventData = this[createData](data);
		}
		
		concord.util.events.publish(concord.util.events.presToolbarEvents, eventData);				
	},
	
	/**
	 * do nothing
	 */
	skipForNextParagraph: function(node, func) {
		return node;
	},
	
	onContentChange: function(editor, nodeList, flag) {
		return;
	},
	
	getExtraPlugins: function(isSlideSorter) {
		var extra = 'coediting,deletekey,concordsave,smarttables,tablecolresizer,startnewpres,shortcuts,concordhelp,increasefont,verticalalign,dialogmessage,discarddraft,indicator,messages,concordprintpdf,odpprintpdf,presComments,concordpresentations,concordpaste,undo,concordscayt,publish,concordlink,slidetransitions,shapes,tablestyles,smarttableresize,dropdownbutton,liststyles';
		if(concord.util.browser.isMobile())
			extra += ',mobileinit';
		if(isSlideSorter){
			extra = 'deletekey,concordsave,tablecolresizer,startnewpres,shortcuts,concordhelp,increasefont,verticalalign,dialogmessage,discarddraft,indicator,messages,concordprintpdf,odpprintpdf,presComments,concordpresentations,undo,concordscayt,publish,concordlink,slidetransitions,shapes,tablestyles,dropdownbutton,liststyles';
			if(concord.util.browser.isMobile())
				extra += ',mobilelayout';	
		}
			
		return extra;
	},
	
	
	setDefaultAlignment: function(block, align) {
		block.setStyle( 'text-align', align );
	},
	
	run4Text: function(foo, params) {
		return;
	},
	
	run4Presentation: function(foo, params) {
		return foo(params);
	},
	getTableContextMenuItems: function(isMerge,isCaption){
		return;
	}	
});