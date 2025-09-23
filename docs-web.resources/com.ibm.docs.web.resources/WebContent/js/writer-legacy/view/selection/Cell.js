dojo.provide("writer.view.selection.Cell");

dojo.require("writer.view.selection.Base");

dojo.declare("writer.view.selection.Cell", writer.view.selection.Base, {
	constructor : function(createParam) {
		var cell = createParam.viewItem;
		if (cell && cell.domNode) {
			var cellDom = cell.domNode;
			this._domNode = dojo.create("div", null, cellDom);
			dojo.addClass(this._domNode, "cellSelection");
			dojo.style(this._domNode, "position", "absolute");
			dojo.style(this._domNode, "zIndex", this._selectLayer);
			if (dojo.isFF && dojo.hasClass(dojo.body(), "dijit_a11y"))
				dojo.style(this._domNode, 'opacity', '0.80');
			else
				dojo.style(this._domNode, 'opacity', '0.20');

			dojo.style(this._domNode, 'left', cell.cellSpacing + 'px');
			dojo.style(this._domNode, 'width', cell.getBoxWidth() + 'px');
			dojo.style(this._domNode, 'top', cell.cellSpacing + 'px');
			dojo.style(this._domNode, 'height', cell.getBoxHeight() + 'px');
			this.highLight();
		}
	}
});