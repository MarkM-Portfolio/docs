dojo.provide("concord.widgets.sidebar.EditorColorIndicator");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.declare("concord.widgets.sidebar.EditorColorIndicator",[dijit._Widget, dijit._Templated], {
	userColor:"",
	templateString:'<span class="editor-color" data-dojo-attach-point="containerNode"></span>',
	widgetInTemplate:false,
	postCreate: function () {
		if (this.userColor && this.userColor != "")
			dojo.style(this.domNode, "backgroundColor", this.userColor);
	}
});