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

dojo.provide("websheet.model.StyleCell");
dojo.require("websheet.Constant");
dojo.require("websheet.model._cell");
dojo.declare("websheet.model.StyleCell",[websheet.model._cell],{
	_styleId:null,					//style id, get style code from style manager

	/**
	 * constructor
	 */
	constructor:function(parent,id,repeatednum,styleId){
		// must set repeatnum prior to set styleId, otherwise
		// because the setStyleId function depends on 'repeatednum'		
		if(undefined != styleId){
			this.setStyleId(styleId);
		}
	},

	/////////////////////////////////////////////////////////////////////////
	//// The function to be mixed into value cell object ////////////////////
//	
//	/**
//	 * return cell's style id
//	 * if colStyleId is specified, return column style if this cell doesn't have _styleId
//	 * @param colStyleId		column style id
//	 */
//	/*string*/getStyleId:function(/*string*/colStyleId){
//		if (this._styleId) return this._styleId;
//		return colStyleId;
//	},
	
	///////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	
	/**
	 * merge style with style attribute
	 * return the id for the merged style
	 * // TODO should delete this cell if _styleId is null
	 */
	/*string*/mergeStyle: function(styleAttr, colStyleId) {
		//StyleManager merge style fetch by current style id with style attributes
		//return a new style id to cover original style id
		if (!this._styleId) {
			this._styleId = colStyleId;
			// temporarily add colStyleId's refCount, to change it later
			var colStyle = this._doc._styleManager.styleMap[colStyleId];
			if (colStyle) {
				colStyle.refCount++;
			}
		}
		
		var styleId = this._doc._styleManager.changeStyle(this._styleId, styleAttr);
		if (styleId) {
			this._styleId = styleId;
		} else {
			// special case of default style
			if (this._repeatednum || colStyleId) {
				this._styleId = websheet.Constant.Style.DEFAULT_CELL_STYLE;
			} else {
				this._styleId = null;
			}
		}
		
		return this._styleId;
	},

	/**
	 * set cell's style id
	 * return the id for the new style
	 * // TODO should delete this object with _styleId as null
	 */
	/*string*/setStyleId:function(styleId) {
		if(undefined != this._styleId){
			if (this._styleId == styleId) {
				return this._styleId;
			}
			this._doc._styleManager.deleteStyle(this._styleId);
		}
		
		// special case of default style
		// only optimize if cell have no repeat so we not involve another
		// FOR here, to save performance
		if (!(this._repeatednum) && styleId == websheet.Constant.Style.DEFAULT_CELL_STYLE) {
			var iColIndex = this.getCol();
			var sheetModel = this._parent._parent;
			var colModel = sheetModel.getColumn(iColIndex, true);
			if (!colModel || !colModel.getStyleId()) {
				// no column model or no column style,
				// and we are setting default cell style,
				// clear the cell style
				
				// TODO should delete this object with _styleId as null
				this._styleId = null;
				return this._styleId;
			}
		}
		
		this._styleId = styleId;
		if(styleId){
			this._doc._styleManager.addRefCount(styleId);
		}
		
		return this._styleId;
	},
	
	/*boolean*/isMergable:function(model){
		var curSIndex = this.getCol();
	    var curEIndex = curSIndex + this._repeatednum;
	    
	    var nSIndex = model.getCol();
	    var nEIndex = nSIndex + model._repeatednum;
	    
	    if(curEIndex + 1 == nSIndex || nEIndex + 1 == curSIndex)
	    {
	      return model._styleId == this._styleId;
	    }  
	    return false;
	},
	
	/**
	* take style from provided cell json
	* return the id for the merged style
	* TODO need to delete this object if _styleId is null
	*/
	/*string*/setCellByJson: function(cellJson,colStyleId,bReplace)
	{
		var cellStyle = cellJson.style;
		var bRemove = false; // remove the cached _showValue or not
		if(bReplace)
		{
			bRemove = true; // the cached _showValue should be removed
			var styleId = null;
			var styleManager = this._doc._styleManager;
			var needUnlock = this._parent._parent._bProtected && !websheet.style.DefaultStyleCode[websheet.Constant.Style.PROTECTION_UNLOCKED];
			if(cellStyle)
			{
				if (cellStyle.id) {
					if(needUnlock)
						styleId = styleManager.changeStyle(cellStyle.id, {unlocked : true});
					else
						styleId = cellStyle.id;
				} else {
					if(needUnlock && !cellStyle[websheet.Constant.Style.PROTECTION_UNLOCKED]){
						 var cellStyleB = dojo.clone(cellStyle);
						 cellStyleB[websheet.Constant.Style.PROTECTION_UNLOCKED] =  true;
						 styleId = styleManager.addStyle(cellStyleB);
					}
					else
						styleId = styleManager.addStyle(cellStyle);
				}
			}else if(needUnlock){					
				styleId = styleManager.addStyle({unlocked : true});
			}
			this.setStyleId(styleId);
		}
		else
		{
			if(cellStyle)
			{
				if (cellStyle.format) bRemove = true;
				var selfStyleId = this._styleId || colStyleId;
				var mergedStyleId = this._styleId = this._doc._styleManager.changeStyle(selfStyleId, cellStyle);
				if (mergedStyleId == null && (this._repeatednum > 0 || colStyleId)) {
					this._styleId = websheet.Constant.Style.DEFAULT_CELL_STYLE;
				}
				if (this._styleId == websheet.Constant.Style.DEFAULT_CELL_STYLE) {
					bRemove = true;
				}
			}
		}

		if (bRemove) {
			// remove the cached _showValue
			var repeatednum = cellJson.rn ? cellJson.rn : 0;
			var colIndex = this.getCol();
			var vCell = this._parent._valueCells[colIndex - 1];
			if (repeatednum) {
				for (var i = 0; i <= repeatednum; ++i) {
					vCell = this._parent._valueCells[colIndex - 1 + i];
					if (vCell) delete vCell._showValue;
				}
			} else {
				if (vCell) delete vCell._showValue;
			}
		}

		return this._styleId;
	}
});