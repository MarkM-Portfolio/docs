dojo.provide("writer.view.selection.Anchor");

dojo.require("writer.view.selection.Base");

dojo.declare("writer.view.selection.Anchor",
[writer.view.selection.Base], {

constructor: function(createParam) {
	this._selectLayer = 2001;

	var anchor = createParam.viewItem;
	if( anchor ){
		var anchorDom = anchor.domNode;
		if(anchorDom){
			this._domNode = dojo.create("div", null, anchorDom);
			dojo.style(this._domNode, "position", "absolute");
			dojo.style(this._domNode,"zIndex", this._selectLayer);
			if(dojo.isFF && dojo.hasClass(dojo.body(), "dijit_a11y"))
				dojo.style(this._domNode,'opacity','0.80');
			else
				dojo.style(this._domNode,'opacity','0.20');
		
			dojo.style(this._domNode,'left','0px');
			dojo.style(this._domNode,'width',dojo.getComputedStyle(anchorDom)["width"]);
			dojo.style(this._domNode,'top','0px');
			dojo.style(this._domNode,'height',dojo.getComputedStyle(anchorDom)["height"]);
			this.highLight();
		}
		
	}
	
}

});