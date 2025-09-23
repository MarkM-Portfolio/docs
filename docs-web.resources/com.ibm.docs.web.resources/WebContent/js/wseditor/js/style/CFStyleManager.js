/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.style.CFStyleManager");
dojo.require("websheet.style.StyleCode");
 
/**
 * CFStyleManager <ConditionalFormatStylemanager> is to generate and cache the calculated StyleCode for the cells, 
 * because the calculated StyleCode should be reused in most cases.
 * it also maintains the cfStyleId -- styleId map
 * It's runtime cache and won't be loaded or persist to disk.
 * To reuse the calculated cache StyleCode, input cells should have same:
 * 1. styleId -- which is styleCell's styleId or columnStyleId
 * 2. ConditionalFormat [priority, styleId, color] array.
 */
dojo.declare("websheet.style.CFStyleManager",null,{
	
	_styleIdMap: {}, // key: return of generateID(), value: StyleCode id in _styleManager
	_doc: null,
	_styleManager: null, // document styleManager

	constructor:function(styleMgr) {
		this._doc = websheet.model.ModelHelper.getDocumentObj();
		this._styleManager = styleMgr;
	},
	
	/**
	 * csid: cell styleId or columnStyleId
	 * cfStyles: array of the conditional format styles applied to the cell, [ [p:priority,s:styleId,c:color], [p:priority,s:styleId,c:color]..]
	 *           p: priority, s: styleId, c: color
	 * calculate the StyleCode and add it into document styleManager, otherwise return the cached StyleCode ID.
	 * @return StyleCode ID if generated, otherwise return null
	 */
	/*String*/generateStyle:function(csid, ranges, row, col) {				
		var cfStyles = [];
		ranges.forEach(function(el){
			var sr = el._parsedRef.startRow,
			    er = el._parsedRef.endRow,
			    sc = el._parsedRef.startCol,
			    ec = el._parsedRef.endCol;
			if( row && col &&
				(row >= sr && row <= er) &&
				(col >= sc && col <= ec) ) 
			{
				var cfelems = el.result && el.result[row-sr] && el.result[row-sr][col-sc]; // el.result is 0 based relative address					
				if(cfelems && cfelems.length > 0) {
					if(cfStyles.length === 0) {
						cfStyles = cfelems;
					}	
					else {
						cfStyles = cfStyles.concat(cfelems);	
					}						
				}
			}
		});		
		
		if(cfStyles.length == 0)
			return null;
				
		var id = this.generateID(csid, cfStyles);
		var styleCodeId = this._styleIdMap[id];
		if(!styleCodeId)
		{
			var mStyle = this._mergeStyle(csid, cfStyles);
			if(mStyle) {
				styleCodeId = this._styleManager.addStyle(mStyle, true);
				this._styleIdMap[id] = styleCodeId;
			}
		}
		return styleCodeId;
	},	
	
	/*StyleCode*/_mergeStyle:function(csid, cfStyles) {	
		var mStyle = null;
		var styleMgr = this._styleManager;
		var cellStyle = csid ? styleMgr.getStyleById(csid) : null;
		
		if (cfStyles)
		{		
			var count = cfStyles.length;
			
			// no cell style and color scale, the single cf style can be used directly
			if(count === 1 && !cellStyle && !cfStyles[0].c) {
				return styleMgr.getStyleById(cfStyles[0].s);
			}
			
			// otherwise, need new StyleCode and merge them...
			var colorScaleSet = false; // only set once for colorScale per priority
			cfStyles.every(function(e)
			{					
				var s = styleMgr.getStyleById(e.s);
				if (s) {
					if (!mStyle) {
						mStyle = new websheet.style.StyleCode(websheet.Constant.PARAM_TYPE.OBJECT, s);
					}
					else {
						mStyle.mergeStyle(s); // mergeStyle will ignore the exiting attribute, ensure attr in front element take effect.
					}
				}
				
				if(e.c && !colorScaleSet) { // set colorScale for merged StyleCode if need, later lower priority rules will be ignored.
					if (!mStyle) {
						var bg = websheet.Constant.Style.BACKGROUND_COLOR;
						mStyle = new websheet.style.StyleCode(websheet.Constant.PARAM_TYPE.JSON, {bg : e.c});
					}
					mStyle.setAttr(websheet.Constant.Style.BACKGROUND_COLOR, e.c);
					colorScaleSet = true;
				}
				
				if (e.stt === true) // stopIfTrue
					return false;
				return true;
			});
			
			if(cellStyle && mStyle)
			{
				mStyle.mergeStyle(cellStyle);
			}
		}
		return mStyle;
	},
	
	/**
	 * 
	 * @param csid: cell styleId or columnStyleId
	 * @param cfStyles: array of the conditional format styles applied to the cell, [ [p:priority,s:styleId,c:color], [p:priority,s:styleId,c:color]..]
	 *                  p: priority, s: styleId, c: color
	 * csid-p-s-c-p-s-c (if c exist)
	 * csid-p-s-p-s     (if c does not exist)
	 * -p-s-c-p-s-c     (if csid does not exist)
	 */	
	/*String*/generateID:function(csid, cfStyles) {
		// sort by priority and styleId, (priority first, lower p value have higher priority)
		cfStyles.sort(function(a,b){
			if(a.p === b.p) {
				if(a.s === b.s) {
					// item with color should be in front, if priority and styleId are both equals
					// does not matter which one is in front if both a and b have color attr
					if (a.c && b.c) {
						if (a.c < b.c)
							return -1;
						else if (a.c === b.c)
							return 0;
						else
							return 1;
					}
					else if(a.c) {
						return -1;
					}
					else if (b.c){
						return 1;
					}
					else {
						return 0;						
					}
				}
				else {
					return (a.s < b.s) ? -1 : 1; //lower styleId is in the front if p equals
				}
			}
			else {
				return (a.p < b.p) ? -1 : 1; // lower p is in the front
			}
		});
		
		var sep = "-";
		var prefix = csid ? csid : "";
		return prefix + cfStyles.map(function(elem){
			var str = "";
			if(elem.p)
				str += sep + elem.p;
			if(elem.s)
				str += sep + elem.s;
			if(elem.c)
				str += sep + elem.c;
			return str;
		}).join(sep);
	},
	
	/**
	 * return the real StyleCode ID from CFStyleID, CFStyleID is the return of generateID
	 */
	getStyleId:function(id) {
		return this._styleIdMap[id];
	},
	
	clear:function() {
		this._styleIdMap = {};
	},
});