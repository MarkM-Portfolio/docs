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

dojo.provide("concord.editor.EditorExtend");

dojo.declare("concord.editor.EditorExtend", null, {
	setupfontSizeList: function(){
		var entries = CKEDITOR.config.fontSize_sizes;
		if( entries )
		{
			var fontsizes = entries.split( ';' );
			this.fontsizeList = [];
			for ( var i = 0 ; i < fontsizes.length ; i++ )
			{
				var parts = fontsizes[ i ].split( '/' );
				this.fontsizeList.push( parseInt( parts[0],10 ));
			}
		}
	},
	getConfig: function() {
		return {
			increaseFontSize : 1, //step in font size list
			increaseUnit : 'pt',
			increaseClasses : null,
			defaultInit : 12 //default font size is 12pt
		};
	},
	
	getFontSizeValue: function( node ) {
		var size = node.getStyle('font-size')||"";
		if( size == "")
		{
			var p = node.$;
			if( p.currentStyle)
				size = p.currentStyle['fontSize'];
			else if( window.getComputedStyle )
			{
				var doc = node.getDocument().$;
				size = doc.defaultView.getComputedStyle(p,null).getPropertyValue('font-size');
			}
		}
		if(!size) size="";
		var fontsizes = size.match(/^([\d|\.]*)(px|pt|em)$/i);
		var n = 12;
		if( fontsizes && fontsizes.length == 3 )
		{
			switch(fontsizes[2])
			{
				case 'px':
					n = parseInt( fontsizes[1],10);
					n = n*3/4;
					break;
				case 'pt':
					n = parseInt( fontsizes[1],10);
					break;
				case 'em':
					n = parseFloat( fontsizes[1],10)
					n = n*12;
					break;
			} 
		}
		return n;
	},
	
	incDecValue: function(value, increaseStep, type) {
		if( !this.fontsizeList )
			this.setupfontSizeList();
		if( this.fontsizeList && this.fontsizeList.length )
		{
			var index = 0;
			for ( var i = 0; i < this.fontsizeList.length && value >= this.fontsizeList[i]; i++ )
				index = i;
				
			index += ( type == 'increase' ? 1 : -1 ) * increaseStep;
			if( index < 0 )
				index = 0;
			if( index >= this.fontsizeList.length )
				index = this.fontsizeList.length-1;
			return this.fontsizeList[index];
		}
		else
		{
			value += ( type == 'increase' ? 1 : -1 ) * increaseStep;
			if(value <= 0 )
				value = 2; 
			return value; 
		}
	},
	
	stepValue: function(value, increaseStep) {
		return value;
	},
	
	setStyle: function(node, property, value, unit) {
		node.setStyle(property, value+ unit);
	},
	
	getStyle: function ( property, value, unit) {
		var styles = {};
		styles[property] = value+ unit;
		return styles;
	},
	
	handleCoEdit: function(data) {
		var func = "_" + data.m;
		if(data.m && this[func]) {
			this[func](data);
		}
	},
	
	/* This is only for presentation implementation */
	getActiveDoc: function() {
		return null;
	},
	
	skipForNextParagraph: function(node, func) {
		if(null == func)
			return node;
		return func(node);
	},
	
	getExtraPlugins: function() {
		return 'coediting,deletekey,dojo,concordsave,smarttables,comments,task,messages,concordtemplates,menubar,concordimage,concordlink,concordfindreplace,publish,concordpreview,startnewdoc,closeeditor,createpdf,shortcuts,concordhelp,concordtoolbar,headingbutton,increasefont,dialogmessage,discarddraft,indicator,messages,concordprintpdf,fixedwidthpage,browserresizehandler,concordpaste,undo,concordscayt,linespacing';
	},
	
	setDefaultAlignment: function(block, align) {
		block.setStyle( 'text-align', align );
	},
	run4Text: function(foo, params) {
		return foo(params);
	},
	
	run4Presentation: function(foo, params) {
		return;
	},
	
	isDojoDialogOpening: function() {
		//dojo1.6.1 upgrade : now the initial length of _dialogStack is 1, not 0.
		return (dijit && (dijit.Dialog._dialogStack)&&(dijit.Dialog._dialogStack.length > 1));
	},
	
	getTableContextMenuItems: function(isMerge,isCaption){
		return {
			smarttable_delete : CKEDITOR.TRISTATE_OFF,
			//smarttable_changestyle : isMerge ?CKEDITOR.TRISTATE_DISABLED:CKEDITOR.TRISTATE_OFF,
			//Presentaion does not support change column width now, may support later, so I only remove the menu
//			smarttable_resize : isMerge ?CKEDITOR.TRISTATE_DISABLED:CKEDITOR.TRISTATE_OFF,
			smarttable_showCaption : isCaption?CKEDITOR.TRISTATE_DISABLED:CKEDITOR.TRISTATE_OFF,
			smarttable_hideCaption :isCaption? CKEDITOR.TRISTATE_OFF:CKEDITOR.TRISTATE_DISABLED
		}
	}
	
});