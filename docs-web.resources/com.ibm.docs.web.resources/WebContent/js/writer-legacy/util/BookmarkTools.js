dojo.provide("writer.util.BookmarkTools");
var imgWidth = null;
writer.util.BookmarkTools = {
		
createMarkNode: function( line, bmkModel ){
	var domNode;
	if( !line.bookMarkDomNode || !bmkModel ){
		var srcPath = window.contextPath + window.staticRootPath + "/images/bookmark1appendix.png";
		var page = writer.util.ViewTools.getPage( line );
		var top = 0;//- line.getTop();// - body.getParent().getContentTop();
		var left = -line.getLeft() - line.getRealPaddingLeft() + page.left -6;
		domNode = dojo.create("img",{"src": srcPath ,"z-index":"99", "class": "bookMark", "style": "position:absolute;left:"+left+"px;top:"+ top + "px; height:20px" });
		if( bmkModel ){
			domNode.id = bmkModel.name;
		}
		//in a row
		var row = writer.util.ViewTools.getRow( line );
		if( row ){
			dojo.attr(domNode, "row_id", row.model.id);
			dojo.attr(domNode, "line_top", line.getTop());
		}
		
		//end
		line.domNode.appendChild(domNode);
		if(BidiUtils.isGuiRtl()) {
			if(!this.imgWidth)
				this.imgWidth = domNode.naturalWidth * 2/3;

			dojo.style(domNode, 'width', this.imgWidth + 'px');

			left += dojo.style(page.domNode, 'width') - this.imgWidth - page.left;
			dojo.style(domNode, 'left', left + 'px');
			dojo.addClass(domNode, ' rtl');
		}
		dojo.connect( domNode, "onclick", null, function( event ){
			var plugin = pe.lotusEditor.getPlugin("BookMark");
			plugin.editBookmark( line );
		} );
		return domNode;
	}
	else{
		domNode = line.bookMarkDomNode;
		var bmkNames = ( domNode.id||"" ).split(",");
		for( var i=0; i<bmkNames.length; i++ ){
			if( bmkNames[i]== bmkModel.name ){
				return domNode;
			}
		}
		bmkNames.push(bmkModel.name);
		domNode.id = bmkNames.join(",");
	}
	return domNode;
 },
 /**
  * is bookmark name valid
  * @param name
  * @returns {Boolean}
  */
isBookmarkNameValid: function( name ){
	name = "" + name;
	
	// Start with number and _, special character and space
	if(name.match(/^[0-9_]/) || name.match(/[\u20ac\`\~\!\@\#\$\%\^\&\*\(\)\-\=\+\[\]\{\}\\\|\;\:\'\"\,\<\>\.\?\/ ]+/))
		return false;
	
	return name!="";
	
//	return name && name.match(/^[a-z, A-Z][a-z|A-Z|0-9]*$/);
},

isNeedShow: function( bmk ){
	return bmk.type!="fn" && this.isBookmarkNameValid( bmk.name );
},
/**
 * rename bookmark
 * @param newName
 * @param bm
 */
renameBookmark: function( newName, bm ){
	var oldName = bm.name;
	bm.name = newName;
	if( pe.lotusEditor.paraCache ){
	//check from editor
		for( var id in pe.lotusEditor.paraCache ){
			if(  pe.lotusEditor.paraCache[id].bookMarks )
				if( pe.lotusEditor.paraCache[id].bookMarks[oldName]  ){
					delete pe.lotusEditor.paraCache[id].bookMarks[oldName];
					pe.lotusEditor.paraCache[id].bookMarks[newName] = bm;
				}
		}
	}
}

};