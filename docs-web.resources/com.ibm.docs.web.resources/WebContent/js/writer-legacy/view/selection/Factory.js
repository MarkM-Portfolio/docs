dojo.provide("writer.view.selection.Factory");

dojo.require("writer.view.selection.Text");
dojo.require("writer.view.selection.Cell");
dojo.require("writer.view.selection.Anchor");
dojo.require("writer.view.selection.Base");

dojo.declare("writer.view.selection.Factory", null,{
_selections : {"text.Line": "Text","table.Cell":"Cell"},

getSelectionClass : function(type) {
	var selectionClassName = this._selections[type];
	if (selectionClassName) {
		return dojo.getObject("writer.view.selection."+selectionClassName);
	}
	return null;
},

createSelection : function( params ){
	var viewItem = params.viewItem;
	var viewType = viewItem.getViewType && viewItem.getViewType();
	var selectionClass = this.getSelectionClass(viewType);
	if( selectionClass )
		return new selectionClass(params);
	else if (writer.util.ViewTools.isAnchor(viewItem))
		return new writer.view.selection.Anchor(params);
	else
		return null;
}

});