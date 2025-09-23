dojo.provide("writer.view.selection.Base");
dojo.declare("writer.view.selection.Base",
null, {

	_selectLayer: 10,
	_domNode: null,
	_coEditColor: null,
	destroy: function(){
		if( this._domNode)
			dojo.destroy(this._domNode);
	},

	constructor: function(createParam) {
		if (createParam)
			this._coEditColor = createParam.coEditColor;
	},
	
	highLight: function( b ){
		if( !b ){
			dojo.style( this._domNode, 'backgroundColor', this._coEditColor ? this._coEditColor : '#36c');
		}
		else if( b == 'find'){
			dojo.style(this._domNode,'borderRadius','2px 2px 2px 2px');
			dojo.style( this._domNode, 'backgroundColor','#FF00FF');
		}	
		else{
			dojo.style( this._domNode, 'backgroundColor','#aaa');
		}
	},
	isPointInSelection: function(pt) {
		if (!this._domNode) return false;
		
		var rect = this._domNode.getBoundingClientRect();
		
		if (pt.x >= (rect.left-0.5) && pt.x <= (rect.left+rect.width+0.5) && 
			pt.y >= (rect.top-0.5) && pt.y <= (rect.top+rect.height+0.5))
			return true;
		else
			return false;
	}
});