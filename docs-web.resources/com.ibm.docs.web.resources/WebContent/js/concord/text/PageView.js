dojo.provide("concord.text.PageView");
dojo.require("concord.text.View");
dojo.declare("concord.text.PageView",concord.text.View,{
	_document: null,
	_editor: null,
	
	constructor: function( layoutEditor, document){
		this._document = document;	
		this._editor = layoutEditor;
	}
});