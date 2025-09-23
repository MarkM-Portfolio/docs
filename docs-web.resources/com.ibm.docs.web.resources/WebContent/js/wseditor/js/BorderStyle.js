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

dojo.provide("websheet.BorderStyle");
dojo.declare("websheet.BorderStyle", null, {    
    //default value for cell border
    borderStyle : "thinsolid",
    borderColor : "#000000",
    editor: null,
    Style : websheet.Constant.Style,
    /*void*/constructor: function(editor) {
    	this.editor = editor;
    },
    
    /**
     * This function is used to set border/border color/border style
     * args is map, its format like one of below
     *  {type:BORDERCUSTOMIZE.CUSTOMIZECOLOR, color:{}}
     *  {type:BORDERCUSTOMIZE.CUSTOMIZESTYLE, borderStyle:BORDERSTYLE.THINSOLID}
     *  {type:BORDERCUSTOMIZE.CUSTOMIZEBORDER,  borderType:BORDERTYPE.ALLBORDERS}
     */
    CustomizeBorder: function(args){
    	var toolbar = this.editor.getToolbar();
    	if(args.type == BORDERCUSTOMIZE.CUSTOMIZECOLOR){
    		this.borderColor = args.color;
    		if(this.bordertype){
    			this.editor.execCommand(commandOperate.SETBORDERSTYLE);
    		}
    	}else if(args.type == BORDERCUSTOMIZE.CUSTOMIZESTYLE){
    		this.borderStyle = args.borderStyle;
    		if (toolbar) toolbar.updateBorderStyleMenu();
    		if(this.bordertype){
    			this.editor.execCommand(commandOperate.SETBORDERSTYLE);
    		}
    	}else if(args.type == BORDERCUSTOMIZE.CUSTOMIZEBORDER){
    		this.bordertype = args.borderType;
    		if (toolbar) toolbar.updateBorderTypeMenu();
    		this.editor.execCommand(commandOperate.SETBORDERSTYLE);
    	}
    },
    
	_Border: function(border, width){
		var styleChange={border:{}};
        if (border[this.Style.BORDER_LEFT] == 1) {
            styleChange.border[this.Style.BORDER_LEFT] = width;
        }
        // do not set border_left to "" in else to void effect the original style value
//        else{
//        	styleChange.border[this.Style.BORDER_LEFT] = "";
//        }
        if (border[this.Style.BORDER_TOP] == 1) {
            styleChange.border[this.Style.BORDER_TOP] = width;
        }
        if (border[this.Style.BORDER_RIGHT] == 1) {
            styleChange.border[this.Style.BORDER_RIGHT] = width;
        }
        if (border[this.Style.BORDER_BOTTOM] == 1) {
            styleChange.border[this.Style.BORDER_BOTTOM] = width;
        }
        return styleChange;
    },

    _prepareCleanBorderStyle: function(){
	   	var styleChange ={border:{},bordercolor:{}, style:{}};
	   	styleChange.border[this.Style.BORDER_LEFT] = "";
	   	styleChange.border[this.Style.BORDER_TOP] = "";
	   	styleChange.border[this.Style.BORDER_RIGHT] = "";
	   	styleChange.border[this.Style.BORDER_BOTTOM] = "";
	   	styleChange.bordercolor[this.Style.BORDER_LEFT_COLOR] = "";
	   	styleChange.bordercolor[this.Style.BORDER_TOP_COLOR] = "";
	   	styleChange.bordercolor[this.Style.BORDER_RIGHT_COLOR] = "";
	   	styleChange.bordercolor[this.Style.BORDER_BOTTOM_COLOR] = "";
		styleChange.style[this.Style.BORDER_LEFT_STYLE] = "";
	   	styleChange.style[this.Style.BORDER_TOP_STYLE] = "";
	   	styleChange.style[this.Style.BORDER_RIGHT_STYLE] = "";
	   	styleChange.style[this.Style.BORDER_BOTTOM_STYLE] = "";
	   	return styleChange;
   },

   _prepareBorderStyle: function(style, color, border, bClear){
   	  	style = style ? style : BORDERSTYLE.THINSOLID;
   	  	var width = "thin";
   	  	var borderStyle;
   	  	if(style == BORDERSTYLE.THICKSOLID || style == BORDERSTYLE.THICKDOTTED || style == BORDERSTYLE.THICKDASHED){
   	  		width = "thick";
   	  		borderStyle = style.substring(5);
   	  	}else{
   	  		borderStyle = style.substring(4);
   	  	}
   	  	var styleChange = this._Border(border, width);
		styleChange.bordercolor={};
		styleChange.style={};
		if (border[this.Style.BORDER_LEFT] == 1) {
			styleChange.bordercolor[this.Style.BORDER_LEFT_COLOR] = color;
			styleChange.style[this.Style.BORDER_LEFT_STYLE] = borderStyle;
		}
       // do not set color to "" in else to void effect the original style value
//       else{       	
//       	styleChange.bordercolor[this.Style.BORDER_LEFT_STYLE] = "";
//       }
       if (border[this.Style.BORDER_TOP] == 1) {    	  
    	   styleChange.bordercolor[this.Style.BORDER_TOP_COLOR] = color;
    	   styleChange.style[this.Style.BORDER_TOP_STYLE] = borderStyle;
       }

       if (border[this.Style.BORDER_RIGHT] == 1) {    	  
		   	styleChange.bordercolor[this.Style.BORDER_RIGHT_COLOR] = color;
		   	styleChange.style[this.Style.BORDER_RIGHT_STYLE] = borderStyle;
       }

       if (border[this.Style.BORDER_BOTTOM] == 1) {    	  
		   styleChange.bordercolor[this.Style.BORDER_BOTTOM_COLOR] = color;
		   styleChange.style[this.Style.BORDER_BOTTOM_STYLE] = borderStyle;
       }
       
       return styleChange;
   },
   
   /**
    * This method is used to merge the style in sourceStyleJson[rowIndex] to targetStyleJson
    * @param sourceStyleJson
    * @param rowIndex
    * @param targetStyleJson
    */
   _doMergeStyleJson:function(sourceStyleJson, rowIndex, targetStyleJson){	
	   if(targetStyleJson.rows[rowIndex]){
		   if(!targetStyleJson.rows[rowIndex].cells){
			   targetStyleJson.rows[rowIndex].cells = {};
		   }
		   var targetNum = targetStyleJson.rows[rowIndex].rn != undefined? targetStyleJson.rows[rowIndex].rn :0 ;
		   var sourceNum = sourceStyleJson[rowIndex].rn != undefined? sourceStyleJson[rowIndex].rn :0 ;
		   if(targetNum != sourceNum){
			   if(targetNum > sourceNum){					 
				   targetStyleJson.rows[rowIndex].rn = sourceNum;	
				   var newRowIndex = "" + (parseInt(rowIndex) + sourceNum + 1) + "";
				   if(!targetStyleJson.rows[newRowIndex]){
					   targetStyleJson.rows[newRowIndex] = {};
					   if(!targetStyleJson.rows[newRowIndex].cells){
						   targetStyleJson.rows[newRowIndex].cells = {};
					   }
				   }
				   targetStyleJson.rows[newRowIndex].cells = this._doMergeStyleCellsJson(targetStyleJson.rows[rowIndex].cells, targetStyleJson.rows[newRowIndex].cells);
				   targetStyleJson.rows[newRowIndex].rn = targetNum - sourceNum - 1;
			   }else if(targetNum < sourceNum){
				   sourceStyleJson[rowIndex].rn = targetNum;
				   var newRowIndex = "" + (parseInt(rowIndex) + targetNum + 1) + "";
				   if(!sourceStyleJson[newRowIndex]){
					   sourceStyleJson[newRowIndex] = {};
					   if(!sourceStyleJson[newRowIndex].cells){
						   sourceStyleJson[newRowIndex].cells = {};
					   }
				   }
				   sourceStyleJson[newRowIndex].cells = this._doMergeStyleCellsJson(sourceStyleJson[newRowIndex].cells, sourceStyleJson[rowIndex].cells);
//				   sourceStyleJson[newRowIndex].cells = dojo.mixin(sourceStyleJson[newRowIndex].cells, sourceStyleJson[rowIndex].cells);
				   sourceStyleJson[newRowIndex].rn = sourceNum - targetNum - 1;
				   this._doMergeStyleJson(sourceStyleJson, newRowIndex, targetStyleJson);
			   }
		   }
		   targetStyleJson.rows[rowIndex].cells = this._doMergeStyleCellsJson(sourceStyleJson[rowIndex].cells, targetStyleJson.rows[rowIndex].cells);
//		   targetStyleJson.rows[rowIndex].cells = dojo.mixin(targetStyleJson.rows[rowIndex].cells, sourceStyleJson[rowIndex].cells);		  
	   }else{
		   if(sourceStyleJson[rowIndex]) {
			   // previous search in case targetStyleJson contains the repeat rows which cover the rowIndex
			   rowIndex = parseInt(rowIndex);
			   var json;
			   for(var i = rowIndex - 1; i > 0; i--){
				   json = targetStyleJson.rows[i];
				   if(json){
					   if(json.rn + i >= rowIndex){
						   targetStyleJson.rows[rowIndex] = {};
						   targetStyleJson.rows[rowIndex].cells = dojo.mixin({}, json.cells);
						   var rn = i + json.rn - rowIndex;
						   if(rn > 0)
							   targetStyleJson.rows[rowIndex].rn = rn;
						   this._doMergeStyleJson(sourceStyleJson, rowIndex, targetStyleJson);
						   json.rn = rowIndex - i - 1;
						   if(json.rn == 0)
							   delete json.rn;
					   } else
						   json = null;
					   break;
				   }
			   }
			   if(!json)
				   targetStyleJson.rows[rowIndex] = dojo.mixin({},sourceStyleJson[rowIndex]);
		   }
		   
	   }
   },
   
   _doMergeStyleCellsJson: function(sourceCellsJson, targetCellsJson){
	   var sCellsArray = websheet.model.ModelHelper._sortItems(sourceCellsJson);
	   var sLength = sCellsArray.length;
	   var tCellsArray = websheet.model.ModelHelper._sortItems(targetCellsJson);
	   var tLength = tCellsArray.length;
	   var i = sLength - 1, j = tLength - 1;
	   for(; i >= 0; i--){
		   var sCell = sCellsArray[i];
		   var sIndex = sCell.index;
		   var sRepeatNum = sCell.object.rn;
		   if(!sRepeatNum)
			   sRepeatNum = 0;
		   for(; j >= 0;j--){
			   var tCell = tCellsArray[j];
			   var tIndex = tCell.index;
			   var tRepeatNum = tCell.object.rn;
			   if(!tRepeatNum)
				   tRepeatNum = 0;
			   if(sIndex > tIndex + tRepeatNum){
				   tCellsArray.splice(j+1, 0, sCell);
				   break;
			   } else if(sIndex + sRepeatNum < tIndex){
				  continue;
			   } 
			   else {
				   var newTCell;
				   var rn = sIndex + sRepeatNum - (tIndex + tRepeatNum) - 1;
				   var end = 0;
				   if(rn > 0){
					   // split sCell then insert to target cells array
					   newTCell = dojo.clone(sCell);
					   newTCell.index = tIndex + tRepeatNum + 1;
					   newTCell.object.rn = rn;
					   tCellsArray.splice(j+1, 0, newTCell);
					   end = tIndex + tRepeatNum;
					   sRepeatNum = sCell.object.rn = end - sIndex;
				   } else {
					   // split tCell
					   rn = tIndex + tRepeatNum - (sIndex + sRepeatNum) - 1;
					   if(rn > 0){
						   newTCell = dojo.clone(tCell);
						   newTCell.index = sIndex + sRepeatNum + 1;
						   newTCell.object.rn = rn;
						   tCellsArray.splice(j+1, 0, newTCell);
					   }
					   end = sIndex + sRepeatNum;
				   }
				   // insert merged cell
				   rn = sIndex - tIndex - 1;
				   if(rn >= 0 ){
					   tCell.object.rn = rn;
					   newTCell = dojo.clone(tCell);
					   dojo.mixin(newTCell.object, sCell.object);
					   newTCell.index = sIndex;
					   newTCell.object.rn = end - sIndex;
					   tCellsArray.splice(j+1, 0, newTCell);
					   tCell.object.rn = rn;
					   break;
				   } else {
					   tCell.object = dojo.mixin(tCell.object, sCell.object);
					   tCell.object.rn = end - tIndex;
					   if(tIndex == sIndex){
						   j--;
						   break;
					   } else {
						   sRepeatNum = sCell.object.rn = tIndex - sIndex - 1;
					   }
				   }
			   }
		   }
		   if(j < 0 && i >= 0 ){
			   tCellsArray = tCellsArray.concat(sCellsArray.slice(0,i+1));
			   break;
		   }
	   }
	   var cells = {};
	   for(var i = 0; i < tCellsArray.length; i++) {
		   var cell = tCellsArray[i];
		   var strIndex = websheet.Helper.getColChar(cell.index);
		   cells[strIndex] = cell.object;
	   }
	   return cells;
   },
   
   /**
    * merge the style in sourceStyleJson to targetStyleJson
    * @param sourceStyleJson
    * @param targetStyleJson
    */
   _mergeStyleJson: function(sourceStyleJson, targetStyleJson){
	   if(!sourceStyleJson ) return;
	   if(!targetStyleJson)
		   targetStyleJson = {};
	   if(!targetStyleJson.rows){
		   targetStyleJson.rows = {};
	   }
	   for(var rowIndex in sourceStyleJson){
		   this._doMergeStyleJson(sourceStyleJson, rowIndex, targetStyleJson);
	   }
   },
   
   /**This method is used to create border information based on border, border color, border style, select type and select rect info
    * @param selectType: ALLBORDERS, INNERBORDERS etc.
    * @param selectRectInfo: the select range information user selected to set border
    * @returns: return the information needed when set Style,it may include style or json, old style json needed for undo event
    */
   preSetBorderStyle: function(selectType, selectRectInfo){
	   var borderStyleInfo ={};
   	   var mHelper = websheet.model.ModelHelper;
	   var sr = selectRectInfo.startRowIndex;
 	   var sc = selectRectInfo.startColIndex;
 	   var er = selectRectInfo.endRowIndex;
 	   var ec = selectRectInfo.endColIndex;
	   switch (selectType) {
		 	case websheet.Constant.Cell:
		 		var bStyle;
		 		var cellBorder = {};
		 		var bEnlargeStartRow =  bEnlargeStartCol = bEnlargeEndRow = bEnlargeEndCol = false;
		 		switch (this.bordertype){
		       		case BORDERTYPE.ALLBORDERS: 
		       		case BORDERTYPE.OUTERBORDERS:
		       			cellBorder[this.Style.BORDER_LEFT] = 1, cellBorder[this.Style.BORDER_TOP] = 1;
		       			cellBorder[this.Style.BORDER_RIGHT] = 1, cellBorder[this.Style.BORDER_BOTTOM] = 1;
		       			bStyle = this._prepareBorderStyle(this.borderStyle,this.borderColor, cellBorder);
		       			sr = sr == 1 ? sr : ((bEnlargeStartRow = true) && (sr - 1));
						er = er == websheet.Constant.MaxRowNum ? er: ((bEnlargeEndRow = true) && (er + 1));
						sc = sc == 1 ? sc: ( (bEnlargeStartCol = true) && (sc - 1));
						ec = ec == websheet.Constant.MaxColumnIndex ? ec: ((bEnlargeEndCol = true) && (ec + 1));
		       			break;
		       		case BORDERTYPE.INNERBORDERS:
		       		case BORDERTYPE.HORIZONTALBORDERS:
		       		case BORDERTYPE.VERTICALBORDERS:
		       			bStyle = this._prepareBorderStyle(this.borderStyle,this.borderColor, {});
		       			break;
		       		case BORDERTYPE.LEFTBORDER:
		       			cellBorder[this.Style.BORDER_LEFT] = 1;
		       			bStyle = this._prepareBorderStyle(this.borderStyle,this.borderColor, cellBorder);
		       			sc = sc == 1 ? sc: ( (bEnlargeStartCol = true) && (sc - 1));
		       			break;
		       		case BORDERTYPE.TOPBORDER:
		       			cellBorder[this.Style.BORDER_TOP] = 1;
		       			bStyle = this._prepareBorderStyle(this.borderStyle,this.borderColor, cellBorder);
		       			sr = sr == 1 ? sr : ((bEnlargeStartRow = true) && (sr - 1));
		       			break;
		       		case BORDERTYPE.RIGHTBORDER:
		       			cellBorder[this.Style.BORDER_RIGHT] = 1;
		       			bStyle = this._prepareBorderStyle(this.borderStyle,this.borderColor, cellBorder);
		       			ec = ec == websheet.Constant.MaxColumnIndex ? ec: ((bEnlargeEndCol = true) && (ec + 1));
		       			break;
		       		case BORDERTYPE.BOTTOMBORDER:
		       			cellBorder[this.Style.BORDER_BOTTOM] = 1;
		       			bStyle = this._prepareBorderStyle(this.borderStyle,this.borderColor, cellBorder);
		       			er = er == websheet.Constant.MaxRowNum ? er: ((bEnlargeEndRow = true) && (er + 1));
		       			break;
		       		case BORDERTYPE.CLEARBORDERS:
		       			bStyle = this._prepareCleanBorderStyle();
		       			break;
		       		default:
		       			break;
		       	}
		 		if(bEnlargeStartRow || bEnlargeStartCol || bEnlargeEndRow || bEnlargeEndCol) {
		 			var rangeJson= {rows:{}}, cellsJson = {};
					var scIndex = websheet.Helper.getColChar(selectRectInfo.startColIndex);
		      		cellsJson[scIndex] = {style: bStyle};
		      		rangeJson.rows[selectRectInfo.startRowIndex] = {cells: cellsJson};
		      		
		 			var styleJson = mHelper.toRangeJSON(selectRectInfo.sheetName, sr, sc, er, ec,
								{includeValue: false, computeDelta: true, style: bStyle, 
									enlargeForBorderStyle:{startRow: bEnlargeStartRow, startCol: bEnlargeStartCol, endRow: bEnlargeEndRow, endCol:bEnlargeEndCol} 
								});
		      		if(styleJson.enlargedCells.startRow){
	   					borderStyleInfo.startRow = styleJson.enlargedCells.startRow;
	   					delete styleJson.enlargedCells.startRow;
	   				} 
	   				if(styleJson.enlargedCells.startCol){
	   					borderStyleInfo.startCol = styleJson.enlargedCells.startCol;
	   					delete styleJson.enlargedCells.startCol;
	   				} 
	   				if(styleJson.enlargedCells.endRow){
	   					borderStyleInfo.endRow = styleJson.enlargedCells.endRow;
	   					delete styleJson.enlargedCells.endRow;
	   				} 
	   				if(styleJson.enlargedCells.endCol){
	   					borderStyleInfo.endCol = styleJson.enlargedCells.endCol;
	   					delete styleJson.enlargedCells.endCol;
	   				} 
		      		this._mergeStyleJson(styleJson.enlargedCells, rangeJson);
					borderStyleInfo.json = rangeJson;
				   	delete styleJson.enlargedCells;
				   	borderStyleInfo.oldRangeStyle = styleJson;
		 		} else {
		 			borderStyleInfo.style = bStyle;
		 		}
		 		break;
	    case websheet.Constant.RowRange:
		case websheet.Constant.Row:
	    case websheet.Constant.Range:
	    case websheet.Constant.Column:
   		case websheet.Constant.ColumnRange:
   			borderStyleInfo = {json: {}, oldRangeStyle: {}};
   	 		var sheetName = selectRectInfo.sheetName;
   			var hasFilteredRows = websheet.Utils.hasFilteredRows({sheetName: sheetName, startRow: sr, endRow: er, startCol: sc, endCol: ec});
   			if (hasFilteredRows) {
   	 			var visibleRangeJSON = mHelper.toRangeJSON(sheetName, sr, sc, er, ec, 
   	   					{includeValue: false, computeDelta: true, ignoreFilteredRows: true});
   	 			var	tempRangeInfo = {};
   	 			tempRangeInfo.sheetName = sheetName;
   	 			var index;
   	 			for(var rowIdx in visibleRangeJSON) {
   	 				index = parseInt(rowIdx);
   	 				tempRangeInfo.startRowIndex = index; 
   	 				tempRangeInfo.endRowIndex = visibleRangeJSON[rowIdx].rn ? visibleRangeJSON[rowIdx].rn + index : index;
   	 				tempRangeInfo.startColIndex = sc;
   	 				tempRangeInfo.endColIndex =  ec;
   	 				this._preSetRangeBorderStyle(selectType, tempRangeInfo, borderStyleInfo);
   	 			}
   	 			if (borderStyleInfo.startRow > sr) {
   	 				borderStyleInfo.startRow = sr;
   	 			}	 				
   	 			if (borderStyleInfo.endRow < er) {
   	 				borderStyleInfo.endRow = er;
   	 			}   	 				
   			} else {
   				this._preSetRangeBorderStyle(selectType, selectRectInfo, borderStyleInfo);
   			}
		   	break;
	    default:
	    	break;
	   }
	   
	   return borderStyleInfo;
   },

   _preSetRangeBorderStyle: function(selectType, selectRectInfo, borderStyleInfo) {
   	   var maxRow = this.editor.getMaxRow();
   	   var enlargeForBorderStyle = true;
	   if(selectType == websheet.Constant.RowRange && 1 == selectRectInfo.startRowIndex && selectRectInfo.endRowIndex == maxRow)
	   {
		   selectType = websheet.Constant.ColumnRange;
		   startColIndex = 1, endColIndex = websheet.Constant.MaxColumnIndex;
		   
		   if (dojo.isIE) {
			   // don't try to enlarge border style if select one sheet and set all borders or inner borders on IE,
			   // IE is pretty slow
			   if (this.bordertype == BORDERTYPE.ALLBORDERS || this.bordertype == BORDERTYPE.INNERBORDERS) {
				   enlargeForBorderStyle = false;
			   }
		   }
	   }

		// separate range to sub range, and give them border information
		var subRange = this._getRangesInfo(selectRectInfo);
  	
  	    // create json and old style information based on sub range information
  	    var len = subRange.length;
  	    var rangeJson= {rows:{}};
	    var oldRangeStyle={};
	    var bUpdate = false;
	    var enlargeCells = {};
	    var styles = [];
	    var mHelper = websheet.model.ModelHelper;
  	    for(var i = 0; i < len; i++){
  	    	// build range data			
  	    	var cellsJson = {};
  	    	if(subRange[i].rangeInfo){
  	    		var style;
  	    		if(this.bordertype==BORDERTYPE.CLEARBORDERS)
  	    			style = this._prepareCleanBorderStyle();
  	    		else
  	    			style = this._prepareBorderStyle(this.borderStyle,this.borderColor, subRange[i].border);
  	    		styles.push(style);
  	    		var rangeInfo = subRange[i].rangeInfo;
  	    		var scIndex = websheet.Helper.getColChar(rangeInfo.startColIndex);
         		cellsJson[scIndex] = {style: style};
         		if (rangeInfo.endColIndex > rangeInfo.startColIndex) {
         			cellsJson[scIndex].rn = rangeInfo.endColIndex - rangeInfo.startColIndex;
         		}
         		
         		rangeJson.rows[rangeInfo.startRowIndex] = {cells: cellsJson};
         		if (rangeInfo.endRowIndex > rangeInfo.startRowIndex) {
         			rangeJson.rows[rangeInfo.startRowIndex].rn = rangeInfo.endRowIndex - rangeInfo.startRowIndex;
         		}
         		
         		var bEnlargeStartRow =  bEnlargeStartCol = bEnlargeEndRow = bEnlargeEndCol = true;
         		var sr = ((rangeInfo.startRowIndex == selectRectInfo.startRowIndex) && (subRange[i].border[this.Style.BORDER_TOP] == 1) && rangeInfo.startRowIndex > 1)? rangeInfo.startRowIndex - 1: ( (bEnlargeStartRow = false) || rangeInfo.startRowIndex);
         		var er = ((rangeInfo.endRowIndex == selectRectInfo.endRowIndex) && (subRange[i].border[this.Style.BORDER_BOTTOM] == 1) && rangeInfo.endRowIndex < maxRow )?rangeInfo.endRowIndex + 1 : ( (bEnlargeEndRow = false) || rangeInfo.endRowIndex);
         		var sc = ((rangeInfo.startColIndex == selectRectInfo.startColIndex) && (subRange[i].border[this.Style.BORDER_LEFT] == 1) && rangeInfo.startColIndex > 1)? rangeInfo.startColIndex - 1: ( (bEnlargeStartCol = false) || rangeInfo.startColIndex);
         		var ec = ((rangeInfo.endColIndex == selectRectInfo.endColIndex) && (subRange[i].border[this.Style.BORDER_RIGHT] == 1) && rangeInfo.endColIndex < websheet.Constant.MaxColumnIndex )?rangeInfo.endColIndex + 1 : ( (bEnlargeEndCol = false) || rangeInfo.endColIndex);
         		var param = {includeValue: false, computeDelta: true, style: style };
         		if (enlargeForBorderStyle)
	    			param.enlargeForBorderStyle = {startRow: bEnlargeStartRow, startCol: bEnlargeStartCol, endRow: bEnlargeEndRow, endCol:bEnlargeEndCol};
         		var styleJson = mHelper.toRangeJSON(selectRectInfo.sheetName, sr, sc, er, ec, param);
         		if (styleJson.enlargedCells) {
         			if(styleJson.enlargedCells.startRow){
         				borderStyleInfo.startRow = Math.min(styleJson.enlargedCells.startRow, selectRectInfo.startRowIndex);
         				delete styleJson.enlargedCells.startRow;
         			}
         			if(styleJson.enlargedCells.startCol){
         				borderStyleInfo.startCol = Math.min(styleJson.enlargedCells.startCol, selectRectInfo.startColIndex);
         				delete styleJson.enlargedCells.startCol;
         			}
         			if(styleJson.enlargedCells.endRow){
         				borderStyleInfo.endRow = Math.max(styleJson.enlargedCells.endRow, selectRectInfo.endRowIndex);
         				delete styleJson.enlargedCells.endRow;
         			}
         			if(styleJson.enlargedCells.endCol){
         				borderStyleInfo.endCol = Math.max(styleJson.enlargedCells.endCol, selectRectInfo.endColIndex);
         				delete styleJson.enlargedCells.endCol;
         			}
         			this._mergeStyleJson(styleJson.enlargedCells, enlargeCells);
         			delete styleJson.enlargedCells;
         		}
         		this._mergeStyleJson(styleJson, oldRangeStyle);
  	    	}else{
  	    		var allrange = subRange[i].allrange;
  	    		for(var j = 0; j < subRange[i].subranges.length; j++){
  	    			var sub = subRange[i].subranges[j];
  	    			var style = this._prepareBorderStyle(this.borderStyle,this.borderColor, sub.border);
  	    			styles.push(style);
  	    			var rangeInfo = sub.rangeInfo;
  	    			var scIndex = websheet.Helper.getColChar(rangeInfo.startColIndex);
  	    			cellsJson[scIndex] = { style : style };
  	    			if (rangeInfo.endColIndex > rangeInfo.startColIndex) {
	    				cellsJson[scIndex].rn = rangeInfo.endColIndex - rangeInfo.startColIndex;
  	    			}
  	    			var bEnlargeStartRow =  bEnlargeStartCol = bEnlargeEndRow = bEnlargeEndCol = true;
  	    			var sr = ((rangeInfo.startRowIndex == selectRectInfo.startRowIndex) && (sub.border[this.Style.BORDER_TOP] == 1) && rangeInfo.startRowIndex > 1)? rangeInfo.startRowIndex - 1: ( (bEnlargeStartRow = false) || rangeInfo.startRowIndex);
	          		var er = ((rangeInfo.endRowIndex == selectRectInfo.endRowIndex) && (sub.border[this.Style.BORDER_BOTTOM] == 1) && rangeInfo.endRowIndex < maxRow )?rangeInfo.endRowIndex + 1 : ( (bEnlargeEndRow = false) || rangeInfo.endRowIndex);
	          		var sc = ((rangeInfo.startColIndex == selectRectInfo.startColIndex) && (sub.border[this.Style.BORDER_LEFT] == 1) && rangeInfo.startColIndex > 1)? rangeInfo.startColIndex - 1: ( (bEnlargeStartCol = false) || rangeInfo.startColIndex);
	          		var ec = ((rangeInfo.endColIndex == selectRectInfo.endColIndex) && (sub.border[this.Style.BORDER_RIGHT] == 1) && rangeInfo.endColIndex < websheet.Constant.MaxColumnIndex )?rangeInfo.endColIndex + 1 : ( (bEnlargeEndCol = false) || rangeInfo.endColIndex);
	          		var param = {includeValue: false, computeDelta: true, style: style};
	          		if (enlargeForBorderStyle)
	    				param.enlargeForBorderStyle = {startRow: bEnlargeStartRow, startCol: bEnlargeStartCol, endRow: bEnlargeEndRow, endCol:bEnlargeEndCol};
  	    			var styleJson = mHelper.toRangeJSON(selectRectInfo.sheetName, sr, sc, er, ec, param);
  	    			if (styleJson.enlargedCells) {
  	    				if(styleJson.enlargedCells.startRow){
  	    					borderStyleInfo.startRow = Math.min(styleJson.enlargedCells.startRow, selectRectInfo.startRowIndex);
  	    					delete styleJson.enlargedCells.startRow;
  	    				}
  	    				if(styleJson.enlargedCells.startCol){
  	    					borderStyleInfo.startCol = Math.min(styleJson.enlargedCells.startCol, selectRectInfo.startColIndex);
  	    					delete styleJson.enlargedCells.startCol;
  	    				}
  	    				if(styleJson.enlargedCells.endRow){
  	    					borderStyleInfo.endRow = Math.max(styleJson.enlargedCells.endRow, selectRectInfo.endRowIndex);
  	    					delete styleJson.enlargedCells.endRow;
  	    				}
  	    				if(styleJson.enlargedCells.endCol){
  	    					borderStyleInfo.endCol = Math.max(styleJson.enlargedCells.endCol, selectRectInfo.endColIndex);
  	    					delete styleJson.enlargedCells.endCol;
  	    				}
  	    				this._mergeStyleJson(styleJson.enlargedCells, enlargeCells);
  	    				delete styleJson.enlargedCells;
  	    			}
  	    			this._mergeStyleJson(styleJson, oldRangeStyle);
  	    		}
  	    		
	    		rangeJson.rows[allrange.startRowIndex] = {cells: cellsJson};
  	    		if (allrange.endRowIndex > allrange.startRowIndex) {
  	    			rangeJson.rows[allrange.startRowIndex].rn = allrange.endRowIndex - allrange.startRowIndex;
  	    		}
  	    	}
  	    	this._mergeStyleJson(enlargeCells.rows, rangeJson);
  	    }
  	    this._mergeStyleJson(rangeJson.rows, borderStyleInfo.json);
  	    this._mergeStyleJson(oldRangeStyle.rows, borderStyleInfo.oldRangeStyle);
  	    if(styles.length > 0)
  	    	borderStyleInfo.styles = styles;
   },
   
   
   /**
    * This method is used to return the sub range information, and its border information
    * @param Info selectRectInfo
    * @returns {Array}
    */
   _getRangesInfo: function(info){
   		var rowCount = info.endRowIndex - info.startRowIndex + 1;
   		var columnCount = info.endColIndex - info.startColIndex + 1;
   		var subRange = [];
   		switch (this.bordertype){
   			case BORDERTYPE.ALLBORDERS:
   			case BORDERTYPE.CLEARBORDERS:
   				var border;
    			if(this.bordertype==BORDERTYPE.ALLBORDERS) {
    				border = {};
    				border[this.Style.BORDER_LEFT] = 1, border[this.Style.BORDER_TOP] = 1;
    				border[this.Style.BORDER_RIGHT] = 1, border[this.Style.BORDER_BOTTOM] = 1;
    			}
    			if(this.bordertype==BORDERTYPE.CLEARBORDERS)
    				border={};
    			subRange[0] = {
    					border: border,
    			     	rangeInfo: {startRowIndex:info.startRowIndex, endRowIndex:info.endRowIndex, startColIndex:info.startColIndex, endColIndex:info.endColIndex}};
    			break;
    		case BORDERTYPE.INNERBORDERS:
    			var topRowRangeInfo = {
    					allrange:{startRowIndex:info.startRowIndex, endRowIndex:info.startRowIndex,startColIndex:info.startColIndex, endColIndex:info.endColIndex}};
    			topRowRangeInfo.subranges = [];
    			
    			// first row
    			var topleftBorder = {};
    			// top left cell
				if( columnCount > 1)
					topleftBorder[this.Style.BORDER_RIGHT]=1;
				if(rowCount > 1)
					topleftBorder[this.Style.BORDER_BOTTOM]=1;
				// top left range
				var colIndex = info.startColIndex;
				var tLRange = {startRowIndex:info.startRowIndex, endRowIndex:info.startRowIndex, startColIndex:colIndex, endColIndex:colIndex};
				topRowRangeInfo.subranges.push({border:topleftBorder, rangeInfo: tLRange});
				if(columnCount > 2){
					//top center cells
					var topCenterBorder = {};
					topCenterBorder[this.Style.BORDER_LEFT] = 1, topCenterBorder[this.Style.BORDER_RIGHT] = 1;
	 				if(rowCount > 1)
	 					topCenterBorder[this.Style.BORDER_BOTTOM]=1;
	 				// top center range
	 				var tCRange = {startRowIndex:info.startRowIndex, endRowIndex:info.startRowIndex, startColIndex:info.startColIndex + 1, endColIndex:info.endColIndex - 1};
	 				topRowRangeInfo.subranges.push({border:topCenterBorder, rangeInfo: tCRange});
				}
				
				var toprightBorder = {};
    			// top right cell
				if( columnCount > 1)
					toprightBorder[this.Style.BORDER_LEFT]=1;
				if(rowCount > 1)
					toprightBorder[this.Style.BORDER_BOTTOM]=1;
				// top right range
				colIndex = info.endColIndex;
				var tRRange = {startRowIndex:info.startRowIndex, endRowIndex:info.startRowIndex, startColIndex:colIndex, endColIndex:colIndex};
				topRowRangeInfo.subranges.push({border:toprightBorder, rangeInfo: tRRange});
				subRange.push(topRowRangeInfo);
    			if(rowCount > 2){
    				var centerRowsRangeInfo ={
    						allrange: {startRowIndex:info.startRowIndex + 1, endRowIndex:info.endRowIndex - 1, startColIndex:info.startColIndex, endColIndex:info.endColIndex}};
    				centerRowsRangeInfo.subranges = [];
	    			// center rows    				
					// Middle left cell
					var centerleftBorder = {};
					centerleftBorder[this.Style.BORDER_TOP] = 1, centerleftBorder[this.Style.BORDER_BOTTOM] = 1;
					if( columnCount > 1)
						centerleftBorder[this.Style.BORDER_RIGHT]=1;
					// center left range
					colIndex = info.startColIndex;
					var cLRange = {startRowIndex:info.startRowIndex + 1, endRowIndex:info.endRowIndex - 1, startColIndex:colIndex, endColIndex:colIndex};
					centerRowsRangeInfo.subranges.push({border:centerleftBorder, rangeInfo: cLRange});
					if(columnCount > 2){
						//Middle center cells
						var middleCenterBorder = {};
						middleCenterBorder[this.Style.BORDER_LEFT] = 1, middleCenterBorder[this.Style.BORDER_RIGHT] = 1;
						middleCenterBorder[this.Style.BORDER_TOP] = 1, middleCenterBorder[this.Style.BORDER_BOTTOM] = 1;
						// middle center range
		 				var mCRange = {startRowIndex:info.startRowIndex + 1, endRowIndex:info.endRowIndex - 1, startColIndex:info.startColIndex + 1, endColIndex:info.endColIndex - 1};
		 				centerRowsRangeInfo.subranges.push({border:middleCenterBorder, rangeInfo: mCRange});
					}
					var middleRightBorder = {};
					middleRightBorder[this.Style.BORDER_TOP] = 1, middleRightBorder[this.Style.BORDER_BOTTOM] = 1;
	    			// Middle right cell
					if( columnCount > 1)
						middleRightBorder[this.Style.BORDER_LEFT]=1;
					// middle right range
					colIndex = info.endColIndex;
					var mRRange = {startRowIndex:info.startRowIndex + 1, endRowIndex:info.endRowIndex - 1, startColIndex:colIndex, endColIndex:colIndex};
					centerRowsRangeInfo.subranges.push({border:middleRightBorder, rangeInfo: mRRange});
					subRange.push(centerRowsRangeInfo);
    			}
    			
    			// last row
    			if(rowCount > 1){
    				var bottomRowRangeInfo = {
    						allrange:{startRowIndex:info.endRowIndex, endRowIndex:info.endRowIndex, startColIndex:info.startColIndex, endColIndex:info.endColIndex}};
	    			bottomRowRangeInfo.subranges = [];
	    			var bottomleftBorder = {};
    	    		// bottom left cell
    				
					if( columnCount > 1)
						bottomleftBorder[this.Style.BORDER_RIGHT]=1;
					if(rowCount > 1)
						bottomleftBorder[this.Style.BORDER_TOP]=1;
					// bottom left range
					colIndex = info.startColIndex;
					var bLRange = {startRowIndex:info.endRowIndex, endRowIndex:info.endRowIndex, startColIndex:colIndex,endColIndex:colIndex};
					bottomRowRangeInfo.subranges.push({border:bottomleftBorder, rangeInfo: bLRange});
					
					if(columnCount > 2){
						//bottom center cells
						var bottomCenterBorder = {};
						bottomCenterBorder[this.Style.BORDER_LEFT] = 1, bottomCenterBorder[this.Style.BORDER_RIGHT] = 1;
		 				if(rowCount > 1)
		 					bottomCenterBorder[this.Style.BORDER_TOP]=1;
		 				// bottom center range
		 				var bCRange = {startRowIndex:info.endRowIndex, endRowIndex:info.endRowIndex, startColIndex:info.startColIndex + 1, endColIndex:info.endColIndex - 1};
		 				bottomRowRangeInfo.subranges.push({border:bottomCenterBorder, rangeInfo: bCRange});
					}
    				
					var bottomrightBorder = {};
	    			// top right cell
					if( columnCount > 1)
						bottomrightBorder[this.Style.BORDER_LEFT]=1;
					if(rowCount > 1)
						bottomrightBorder[this.Style.BORDER_TOP]=1;
					// bottom right range
					colIndex = info.endColIndex;
					var bRRange = {startRowIndex:info.endRowIndex, endRowIndex:info.endRowIndex, startColIndex:colIndex, endColIndex:colIndex};
					bottomRowRangeInfo.subranges.push({border:bottomrightBorder, rangeInfo: bRRange});					
					subRange.push(bottomRowRangeInfo);
    			}
    			break;
    		case BORDERTYPE.HORIZONTALBORDERS:
    			// first row
    			var topRowBorder = {};
				if(rowCount > 1)
					topRowBorder[this.Style.BORDER_BOTTOM]=1;
				subRange.push({
					border: topRowBorder,
					rangeInfo: {startRowIndex:info.startRowIndex, endRowIndex:info.startRowIndex, startColIndex:info.startColIndex, endColIndex:info.endColIndex}});
    			// middle row
				if(rowCount > 2){
					var b = {}; b[this.Style.BORDER_TOP] = 1, b[this.Style.BORDER_BOTTOM] = 1;
    				subRange.push({
    					border: b,
				     	rangeInfo: {startRowIndex:info.startRowIndex + 1, endRowIndex:info.endRowIndex - 1, startColIndex:info.startColIndex, endColIndex:info.endColIndex}});
    			}
				// last row			
				if(rowCount > 1){
					var bottomRowBorder = {};
					bottomRowBorder[this.Style.BORDER_TOP]=1;
					subRange.push({
						border: bottomRowBorder,
					    rangeInfo: {startRowIndex:info.endRowIndex, endRowIndex:info.endRowIndex, startColIndex:info.startColIndex, endColIndex:info.endColIndex}});
				}
    			break;
    		case BORDERTYPE.VERTICALBORDERS:
    			var rangeInfo = {
    					allrange:{startRowIndex:info.startRowIndex, endRowIndex:info.endRowIndex, startColIndex:info.startColIndex, endColIndex:info.endColIndex}};
    			rangeInfo.subranges = [];
    			var leftBorder = {};
    			// left cell on every row
				if( columnCount > 1)
					leftBorder[this.Style.BORDER_RIGHT]=1;
				var colIndex = info.startColIndex;
				var leftRange = {startRowIndex:info.startRowIndex, endRowIndex:info.endRowIndex, startColIndex:colIndex, endColIndex:colIndex};
				rangeInfo.subranges.push({border:leftBorder, rangeInfo: leftRange});	
				if(columnCount > 2){
				 // center cells on every row
					var centerBorder = {}; centerBorder[this.Style.BORDER_LEFT] = 1, centerBorder[this.Style.BORDER_RIGHT] = 1;
	 				var centerRange = {startRowIndex:info.startRowIndex, endRowIndex:info.endRowIndex, startColIndex:info.startColIndex + 1,endColIndex:info.endColIndex - 1};
	 				rangeInfo.subranges.push({border:centerBorder, rangeInfo: centerRange});
				}
				
				var rightBorder = {};
				// right cell on every row
				if( columnCount > 1)
					rightBorder[this.Style.BORDER_LEFT]=1;				

				colIndex = info.endColIndex;
				var rightRange = {startRowIndex:info.startRowIndex, endRowIndex:info.endRowIndex, startColIndex:colIndex, endColIndex:colIndex};
				rangeInfo.subranges.push({border:rightBorder, rangeInfo: rightRange});
				subRange.push(rangeInfo);
    			break;
    		case BORDERTYPE.LEFTBORDER:
    			var rangeInfo = {
    					allrange:{startRowIndex:info.startRowIndex, endRowIndex:info.endRowIndex, startColIndex:info.startColIndex, endColIndex:info.endColIndex}};
    			rangeInfo.subranges = [];
    			var leftBorder = {}; leftBorder[this.Style.BORDER_LEFT] = 1;
    			// left cell on every row 
				var leftRange = {startRowIndex:info.startRowIndex, endRowIndex:info.endRowIndex, startColIndex:info.startColIndex, endColIndex:info.startColIndex};
				rangeInfo.subranges.push({border:leftBorder, rangeInfo: leftRange});
				if(columnCount >= 2){
				 // center and right cells on every row
					var centerRightBorder = {};
					// center right range
	 				var cRRange = {startRowIndex:info.startRowIndex, endRowIndex:info.endRowIndex, startColIndex:info.startColIndex + 1, endColIndex:info.endColIndex};
	 				rangeInfo.subranges.push({border:centerRightBorder, rangeInfo: cRRange});
				}
				subRange.push(rangeInfo);
    			break;
    		case BORDERTYPE.RIGHTBORDER:
    			var rangeInfo = {
    					allrange:{startRowIndex:info.startRowIndex, endRowIndex:info.endRowIndex, startColIndex:info.startColIndex, endColIndex:info.endColIndex}};
    			rangeInfo.subranges = [];
    			if(columnCount >= 2){
	    			var leftBorder = {};
	    			// left and center cells on every rows
					var leftRange = {startRowIndex:info.startRowIndex, endRowIndex:info.endRowIndex, startColIndex:info.startColIndex, endColIndex:info.endColIndex - 1};
					rangeInfo.subranges.push({border:leftBorder, rangeInfo: leftRange});
				}
    			// right cell on every rows
				var rightBorder = {}; rightBorder[this.Style.BORDER_RIGHT] = 1;
				var rightRange = {startRowIndex:info.startRowIndex, endRowIndex:info.endRowIndex, startColIndex:info.endColIndex, endColIndex:info.endColIndex};
				rangeInfo.subranges.push({border:rightBorder, rangeInfo: rightRange});
				subRange.push(rangeInfo);
    			break;
    		case BORDERTYPE.OUTERBORDERS:
    			var topRowRangeInfo = {
    					allrange:{startRowIndex:info.startRowIndex, endRowIndex:info.startRowIndex, startColIndex:info.startColIndex, endColIndex:info.endColIndex}};
    			topRowRangeInfo.subranges = [];
    			// first row
    			var topleftBorder = {}; topleftBorder[this.Style.BORDER_LEFT] = 1, topleftBorder[this.Style.BORDER_TOP] = 1;
    			// top left cell 
    			if(columnCount == 1)
    				topleftBorder[this.Style.BORDER_RIGHT] = 1;
    			if(rowCount == 1)
    				topleftBorder[this.Style.BORDER_BOTTOM] = 1;
    			// top left range
				var colIndex = info.startColIndex;
				var tLRange = {startRowIndex:info.startRowIndex, endRowIndex:info.startRowIndex, startColIndex:colIndex, endColIndex:colIndex};
				topRowRangeInfo.subranges.push({border:topleftBorder, rangeInfo: tLRange});
				if(columnCount > 2){
					//top center cells
					var topCenterBorder = {}; topCenterBorder[this.Style.BORDER_TOP] = 1;
					if(rowCount == 1)
						topCenterBorder[this.Style.BORDER_BOTTOM] = 1;
					// top center range
	 				var tCRange = {startRowIndex:info.startRowIndex, endRowIndex:info.startRowIndex, startColIndex:info.startColIndex + 1, endColIndex:info.endColIndex - 1};
	 				topRowRangeInfo.subranges.push({border:topCenterBorder, rangeInfo: tCRange});
				}
				if(columnCount >= 2){
					var toprightBorder = {}; toprightBorder[this.Style.BORDER_TOP] = 1, toprightBorder[this.Style.BORDER_RIGHT] = 1;
	     			// top right cell
					if(rowCount == 1)
						toprightBorder[this.Style.BORDER_BOTTOM] = 1;
					// top right range
	 				colIndex = info.endColIndex;
	 				var tRRange = {startRowIndex:info.startRowIndex, endRowIndex:info.startRowIndex, startColIndex:colIndex, endColIndex:colIndex};
	 				topRowRangeInfo.subranges.push({border:toprightBorder, rangeInfo: tRRange});
				}
				subRange.push(topRowRangeInfo);
     			if(rowCount > 2){
     				var centerRowsRangeInfo ={
     						allrange:{startRowIndex:info.startRowIndex + 1, endRowIndex:info.endRowIndex - 1, startColIndex:info.startColIndex, endColIndex:info.endColIndex}};
     				centerRowsRangeInfo.subranges = [];
     				// center rows
     				// Middle left cell
     				var centerleftBorder = {}; centerleftBorder[this.Style.BORDER_LEFT] = 1;
     				if(columnCount == 1)
     					centerleftBorder[this.Style.BORDER_RIGHT]=1;
     				// center left range
     				colIndex = info.startColIndex;
     				var cLRange = {startRowIndex:info.startRowIndex + 1, endRowIndex:info.endRowIndex - 1, startColIndex:colIndex, endColIndex:colIndex};
     				centerRowsRangeInfo.subranges.push({border:centerleftBorder, rangeInfo: cLRange});
     				if(columnCount > 2){
     					//Middle center cells
     					var middleCenterBorder = {};
     					// middle center range
     	 				var mCRange = {startRowIndex:info.startRowIndex + 1, endRowIndex:info.endRowIndex - 1, startColIndex:info.startColIndex + 1, endColIndex:info.endColIndex - 1};
     	 				centerRowsRangeInfo.subranges.push({border:middleCenterBorder, rangeInfo: mCRange});
     				}
     				if(columnCount >= 2){
     					var middleRightBorder = {}; middleRightBorder[this.Style.BORDER_RIGHT] = 1;
 	         			// Middle right cell
 	     				colIndex = info.endColIndex;
 	     				var mRRange = {startRowIndex:info.startRowIndex + 1, endRowIndex:info.endRowIndex - 1, startColIndex:colIndex, endColIndex:colIndex};
 	     				centerRowsRangeInfo.subranges.push({border:middleRightBorder, rangeInfo: mRRange});
     				}
     				subRange.push(centerRowsRangeInfo);
     			}
    			
     			// last row
	     		if(rowCount > 1){
	     			var bottomRowRangeInfo = {
	     					allrange:{startRowIndex:info.endRowIndex, endRowIndex:info.endRowIndex, startColIndex:info.startColIndex, endColIndex:info.endColIndex}};
        			bottomRowRangeInfo.subranges = [];
        			// bottom left cell
        			var bottomleftBorder = {}; bottomleftBorder[this.Style.BORDER_LEFT] = 1, bottomleftBorder[this.Style.BORDER_BOTTOM] = 1;
        			if(columnCount == 1)
        				bottomleftBorder[this.Style.BORDER_RIGHT]=1;
        			// bottom left range
    				colIndex = info.startColIndex;
    				var bLRange = {startRowIndex:info.endRowIndex, endRowIndex:info.endRowIndex, startColIndex:colIndex, endColIndex:colIndex};
    				bottomRowRangeInfo.subranges.push({border:bottomleftBorder, rangeInfo: bLRange});
    				if(columnCount > 2){
    					//bottom center cells 					
    					var bottomCenterBorder = {}; bottomCenterBorder[this.Style.BORDER_BOTTOM] = 1;
    					// bottom center range
    	 				var bCRange = {startRowIndex:info.endRowIndex, endRowIndex:info.endRowIndex,startColIndex:info.startColIndex + 1, endColIndex:info.endColIndex - 1};
    	 				bottomRowRangeInfo.subranges.push({border:bottomCenterBorder, rangeInfo: bCRange});
    				}
    				if(columnCount >= 2){
    					var bottomrightBorder = {}; bottomrightBorder[this.Style.BORDER_RIGHT] = 1, bottomrightBorder[this.Style.BORDER_BOTTOM] = 1;
    	     			// bottom right range	    	 			
    	 				colIndex = info.endColIndex;
    	 				var bRRange = {startRowIndex:info.endRowIndex, endRowIndex:info.endRowIndex, startColIndex:colIndex, endColIndex:colIndex};
    	 				bottomRowRangeInfo.subranges.push({border:bottomrightBorder, rangeInfo: bRRange});
    				}
    				subRange.push(bottomRowRangeInfo);
	     		}
	     		break;
    		case BORDERTYPE.TOPBORDER:
    		  // first row
    			var topRowBorder = {}; topRowBorder[this.Style.BORDER_TOP] = 1;
				subRange[0] = {
					border: topRowBorder,
			    	rangeInfo: {startRowIndex:info.startRowIndex, endRowIndex:info.startRowIndex, startColIndex:info.startColIndex, endColIndex:info.endColIndex}};
    			// middle anb bottom rows
				if(rowCount >= 2){
    				subRange[1] ={
    					border: {},
				     	rangeInfo: {startRowIndex:info.startRowIndex + 1, endRowIndex:info.endRowIndex, startColIndex:info.startColIndex, endColIndex:info.endColIndex}};
    			}
    			break;
    		case BORDERTYPE.BOTTOMBORDER:
    			// top and center rows
				if(rowCount >= 2){
    				subRange.push({
    					border: {},
				     	rangeInfo: {startRowIndex:info.startRowIndex, endRowIndex:info.endRowIndex - 1, startColIndex:info.startColIndex, endColIndex:info.endColIndex}});
    			}
				var bt = {}; bt[this.Style.BORDER_BOTTOM] = 1;
				subRange.push({
						border: bt,
						rangeInfo: {startRowIndex:info.endRowIndex, endRowIndex:info.endRowIndex, startColIndex:info.startColIndex, endColIndex:info.endColIndex}});
    			break;
    		default:
    			console.log("invalid value for bordertype in method_getRangesInfo");
    			break;
    	}
   	 return subRange;
   }
});