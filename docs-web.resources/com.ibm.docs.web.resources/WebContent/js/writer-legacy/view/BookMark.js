//This run only exist in Header/footer
dojo.provide("writer.view.BookMark");
dojo.require("writer.view.Run");
dojo.require("writer.util.BookmarkTools");

dojo.declare("writer.view.BookMark",[writer.view.Run],
{
	constructor: function(model,ownerId, start,len) {
		this.w = 0;
		this.h = 0;
		this.init();
	},
	
	getViewType: function(){
		return "bookMark";
	},
	
	getText:function(){
		return "";
	},
	
	canSplit: function() {
		return false;
	},
	canFit:function(w,h){
		return true;
	},
	
	render:function(parentChange){
		if(!this.domNode ||this._updateDOM){
			delete this._updateDOM;
			this.domNode = this._createRunDOM();
			this.domNode.innerHTML = "";
			this._domLeftMargin = this._leftMargin;
		}else if(parentChange){
			this._updateLeftMarginDom();
			var updated = this._updateDOMWidth();

			// for IE, we should re assing text content to node. if parent node was released of deattached
			// the text contents will lost.
			if (!updated && dojo.isIE)
			{
				this.domNode.innerHTML = "";
			}
		}
		delete this._offsetTop;
		return this.domNode;
	},
	
	//render mark node before line
	renderLineMark: function( line ){
		if( !this.isNeedShow() )
			return null;
		
		if( line.domNode ){
			return writer.util.BookmarkTools.createMarkNode( line, this.model );
		}
	},
	/**
	 * check if need show mark node
	 * @returns
	 */
	isNeedShow: function(){
		return writer.util.BookmarkTools.isNeedShow( this.model );
	}
}
);
writer.model.Model.prototype.viewConstructors[writer.MODELTYPE.BOOKMARK]=writer.view.BookMark;