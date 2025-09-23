dojo.provide("writer.tests.wrapper.editor");
dojo.require("writer.tests.wrapper.session");
// Override old editor.

window.common={};
window.controller={};
window.model = {};
window.view = {};
if( !window.pe )
	window.pe = {};

window.DOC_SCENE = {
};

/// From apptext.jsp
window.gText_help_URL = "<%= text_helpurl %>";
window.gSheet_help_URL = "<%= sheet_helpurl %>";
window.gPres_help_URL = "<%= pres_helpurl %>";
window.g_bidiOn = "<%= bidiOn%>";
window.contextPath = "<%= contextPath %>";
window.g_locale = "<%= locale %>";

dojo.require("writer.controller.Editor");


dojo.require("writer.tests.wrapper.engine");
dojo.require("writer.common.Container");
dojo.require("writer.common.SubContainer");
dojo.require("writer.common.Space");
dojo.require("writer.common.tools");

dojo.require("writer.model.Factory");
dojo.require("writer.model.Model");

dojo.require("writer.model.style.Styles");
dojo.require("writer.model.Settings");
dojo.require("writer.model.Relations");

if(!pe.lotusEditor )
{
//	var editor = new controller.Editor();
	
	
	pe.lotusEditor = {
	  editorHandlers : [],
	  _commands : [],
	  _shell : 
	  {
		  isInHeaderFooter: function(){ return false; }  
		  
	  },
	  getRefStyle: function( id ){
		  if( !this.styles || id == "docDefaults" )
			  this._initDefault(id); 
		  return this.styles&& this.styles.getStyle(id);
	  },
	  getDefaultParagraphStyle: function()
	{
		return this.styles&&this.styles.getDefaultParagraphStyle();
	},
		
	  layoutEngine: null,
	  getEditorDoc: function(){
		  return window.document;
	  },
	  _initDefault: function(id){
		var prepath = "/docs/static/js/writer/tests/default/";
		var content, styles, numbering, settings, relations;
		//eval("content = " + dojo._getText(prepath + "content.json"));
		if( !this.styles || id == "docDefaults" )
		{
			eval("styles = " + dojo._getText(prepath + "styles.json"));
			this.styles = new writer.model.style.Styles( styles );
			this.styles.createCSSStyle();
		}
		
		if( !this.number )
		{
			eval("numbering = " + dojo._getText(prepath + "numbering.json"));
			this.number = new writer.model.Numbering(numbering);
		}
		
		//eval("settings = " + dojo._getText(prepath + "settings.json"));
		//eval("relations = " + dojo._getText(prepath + "relations.json"));
	  },
	  reset: function(){
		  
	  },
	  getSelection: function(){
		  return {
			store: function(){},
			restore: function(){},
			getRanges: function(){return []},
			selectRangesBeforeUpdate: function(){},
			restoreBeforeUpdate: function(){},
			updateHeaderFooter:function(){}
		  };	
	  },
	  isHeaderFooterEditing: function(){
		  return false;
	  },
	  isFootnoteEditing:function(){
	  		return false;
	  },
	  isEndnoteEditing:function(){
	  		return false;
	  },
	  addCommand: function(){
		  
	  },
	  getCommand: function(){
		  return { setState:function(){}, getState: function(){ return 1;} };
	  },
	  focus:function(){
	  	
	  }
	};
	pe.lotusEditor.layoutEngine = new controller.LayoutEngine(pe.lotusEditor);
	pe.lotusEditor.undoManager = {
			addUndo: function(){}
	};
	pe.lotusEditor.indicatorManager= {
		drawUserSelections: function(){}
	}
	pe.lotusEditor.getEditor = function() {
		return this;
	};
	pe.lotusEditor.getScale = function(){
		return 1;
	};
}

window.layoutEngine = pe.lotusEditor.layoutEngine;

