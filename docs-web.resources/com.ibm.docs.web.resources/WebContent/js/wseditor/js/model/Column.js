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

/****************************************************/
/* created by LinXin, linxinbj@cn.ibm.com           */
/*   1/27/2011                                      */
/* Column Model									    */
/****************************************************/
dojo.provide("websheet.model.Column");
dojo.require("websheet.model.BasicModel");
dojo.declare("websheet.model.Column",[websheet.model.BasicModel],{
	/*String*/_id : null,					//column id
	/*integer*/_width:null,					//column width (integer)
	/*String*/_styleId:null,				//column style id
	/*integer*/_repeatedNum:0,			    //column repeated number (integer)
	/*Sheet*/_parent: null,					//Sheet
	/*Document*/_doc: null,					//Document
	/*String*/_visibility:null,				//for visibility attr, if non-null, always invisible state
	/*Boolean*/_visible: true,				//hide or show column
	/**
	 * constructor
	 */
	constructor:function(parent,colId,width,styleId,repeatednum,visibility){
		this._id = colId;
		this._parent = parent;
		this._doc = this._parent._parent;
		if(undefined != styleId){
			this.setStyleId(styleId);
		}
		if(undefined != repeatednum){
			this._repeatedNum = repeatednum;
		}
		if(undefined !== width){
			this._width = width;
		}
		this._coverInfos = [];
		this.setVisibility(visibility);	
	},
	
	/*integer*/getCoverCellPosition:function(rowIndex,followStyle){
		var cells = this._coverInfos;
		var index = this._doc._mhelper.binarySearch(cells,rowIndex,this.equalCondition,"",followStyle,this._parent._id, websheet.Constant.Row);
		return index;
	},
	
	/**
	 * equal condition for binary search
	 * @param model					compare object
	 * @param index					it is a position for search
	 * @param fetchMethodById		how to fetch a object by id
	 * @param followStyle			if it is true,search a object whose style current position(parameter index) followed]
	 * 								otherwise only search a object in current position
	 * @param sheetId				sheet id
	 */
	/*integer*/equalCondition:function(model,index,fetchMethodById,followStyle,sheetId, methodType, idManager){
		var id = model._parent.getId();
		var repeatednum = model.getRowSpan() - 1;
		
		var pos = idManager.getRowIndexById(sheetId,id);
		
		if(pos != -1){pos += 1;}
		if(followStyle){
			if(pos	<= index && index <= pos + repeatednum){
				return 0;
			}else if(pos > index){
				return 1;
			}else{
				return -1;
			}
		}else{
			if(pos > index){
				return 1;
			}else if(pos == index){
				return 0;
			}else{
				return -1;
			}
		}
	},

	insertCoverInfo: function(coverInfo){
		var pos = this.getCoverCellPosition(coverInfo.getRow());
		if(pos <= -1){
			pos = -(pos + 1);
		} else {
			if(this._coverInfos[pos] == coverInfo)
				return pos;
		}
		
		this._coverInfos.splice(pos, 0, coverInfo);
	    return pos;
	},

	getCoverInfo: function(rowIndex, followStyle) {
		var index = this.getCoverCellPosition(rowIndex, followStyle);
		if(index >= 0)
			return this._coverInfos[index];
		return null;
	},
	
	/*
	 * check whether this object can be merged together with given column model 
	 */
	/*boolean*/isMergable:function(column) {
		if (column == null) return false;
		//repeated number attribute means that two column have the same style and width
		if(this.getWidth() != column.getWidth()){
			return false;
		}
		if(this.getStyleId() != column.getStyleId()){
			return false;
		}
		if(this.getVisibility() != column.getVisibility())
			return false;
		
		if(this._coverInfos.length > 0)
			return false;
		return true;
	},
	
	/**
	 * load data
	 */
	/*void*/load:function(colData){
	},
	/**
	 * get Sheet
	 */
	/*Sheet*/_getParent:function(){
		return this._parent;
	},
	/**
	 * get Document
	 */
	/*Document*/_getDocument:function(){
		return this._doc;
	},
	/**
	 * if column is null,return true
	 */
	/*boolean*/isNull:function(){
		if(this.getWidth() !== undefined || this.getStyleId() || (this._visibility && this._visibility != websheet.Constant.COLUMN_VISIBILITY_ATTR.SHOW)){
			return false;
		}
		return true;
	},
	/*boolean*/isVisible:function(){
		return this._visible;
	},
	/*String*/getVisibility: function(){
		if(this._visibility === null)
			return websheet.Constant.COLUMN_VISIBILITY_ATTR.SHOW;
		else
			return this._visibility;  
		 },
	/*void*/setVisibility:function(visibility){
		if(!visibility || visibility == websheet.Constant.COLUMN_VISIBILITY_ATTR.SHOW) 
			visibility = null;
		this._visibility = visibility;
		
		if(visibility == websheet.Constant.COLUMN_VISIBILITY_ATTR.HIDE){
		    this._visible = false;
		}else
			this._visible = true;
	},
//	/**
//	 * clear cells's value in this column
//	 */
//	/*void*/clearColumn:function(){
//		var sheet = this._parent;
//		var index = this.getIndex();
//		dojo.forEach(sheet.getRows(),function(row,rIndex){
//				var cell = row.getCell(index);
//				if(cell){
//					row.setCellRawValue("");
//				}
//				//if row is null,delete its instance in sheet
//				if(row.isNull()){
//					sheet.splice(rIndex,1);
//				}
//		});
//	},
	/**
	 * return column id
	 */
	/*string*/getId:function(){
		return this._id;
	},
	/**
	 * set column id
	 */
	/*void*/setId:function(id){
		this._id = id;
	},
	/**
	 * return column index, 1-based
	 */
	/*string*/getIndex:function(){
		var sheet = this._parent;
		var index = sheet.getColIndex(this._id);
		if(index > -1)
			index++;
		return index;
	},
	/**
	 * return column width
	 */
	/*integer*/getWidth: function() {
		return this._width;
	},

	/**
	 * set column width
	 * @param width     integer
	 */
	/*void*/setWidth:function(width){
		this._width = width;
	},
	/**
	 * return column repeated number
	 */
	/*integer*/getRepeatedNum: function() {
		return this._repeatedNum;
	},

	/**
	 * set column RepeatedNum
	 * @param repeatedNum     integer
	 */
	/*void*/setRepeatedNum:function(repeatedNum){
		this._repeatedNum = repeatedNum;
	},
	/**
	 * return column style
	 */
	/*Style*/getStyle:function(){
		var styleCode = null;
		if(this._styleId)
		{
			var styleManager = this._doc._getStyleManager();
			styleCode = styleManager.getStyleById(this._styleId);
		}
		return styleCode;
	},
	/**
	 * return column style id
	 */
	/*string*/getStyleId: function() {
	     return this._styleId;
	},
	/**
	 * merge style with style attribute
	 */
	/*void*/mergeStyle:function(styleAttr){
		//StyleManager merge style fetch by current style id with style attributes
		//return a new style id to cover original style id
		var styleId = this._doc._getStyleManager().changeStyle(this.getStyleId(),styleAttr);
		this._styleId = styleId;
	},
    /**
     * set column style id
     */
	/*void*/setStyleId:function(styleId){
		var styleManager = this._doc._getStyleManager();
		if(undefined != this._styleId){
			if(this._styleId == styleId){return;}
//			styleManager.deleteStyle(this._styleId);
		}
		this._styleId = styleId;
		if(styleId){
			styleManager.addRefCount(styleId);
		}
	}
});