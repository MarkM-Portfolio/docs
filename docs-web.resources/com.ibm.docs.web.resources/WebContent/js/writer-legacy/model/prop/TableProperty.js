/**
 * 
 */

dojo.provide("writer.model.prop.TableProperty");
dojo.require("writer.model.prop.Property");
writer.model.prop.TableProperty = function(json, table) {
	this.table = table;
//	this.json = json;
	json.tblCellSpacing && this.initCellSpacing(json.tblCellSpacing);
	json.tblBorders && this.initBorder(json.tblBorders);
	json.shd && this.initColor(json.shd);
    json.tblLook && this.initConditionStyle(json.tblLook);
	this.tableStyle = null;
	if(json.align){
		this.align = json.align;
	}
	//tmp code, the doc conversion has different value for alignment.
	if(json.jc){
		this.align = json.jc.val;
	}

	if(json.bidiVisual)
		this.direction = json.bidiVisual.val ? json.bidiVisual.val : "rtl";

	if(json.tblInd){
		this.ind = Math.round(common.tools.toPxValue(json.tblInd.w,	json.tblInd.type));
	}
};

writer.model.prop.TableProperty.prototype = {
	type : writer.model.prop.Property.TABLE_PROPERTY,
	toJson : function() {
		var json = {};
		var borders = this.borderToJson();
		if(borders){
			json.tblBorders = borders;
		}		
		if(this.cellSpacing){
			json.tblCellSpacing = {};
			json.tblCellSpacing.w = common.tools.PxToDXA(this.cellSpacing);
			json.tblCellSpacing.type = "dxa";
		}
		if(this.conditionStyle&&!common.tools.isEmpty(this.conditionStyle)){
			json.tblLook = dojo.clone(this.conditionStyle);
		}
		var color = this.colorToJson(json);
		if(color){
			json.shd = color;
		}
		if(this.align){
			json.align = this.align;
		}
		var direction = this.getDirection(true);
		if(direction)
			json.bidiVisual = {val: direction};

		if(this.ind){
			json.tblInd = {};
			json.tblInd.w = common.tools.PxToDXA(this.ind);
			json.tblInd.type = "dxa";
		}
		if(common.tools.isEmpty(json)){
			return null;
		}
		
		return json;
	},
//	getBorder : function(conStyle) {
//		var _borderCache = {};
//		_borderCache.left = this.leftBorder;
//		_borderCache.right = this.rightBorder;
//		_borderCache.top = this.topBorder;
//		_borderCache.bottom = this.bottomBorder;
//		if (this.tableStyle) {
//			this._objMerge(_borderCache, this.tableStyle.getBorder(conStyle));
//		}
//		return _borderCache;
//	},
//	getGridBorder : function(conStyle) {
//
//		var _gridBorder = {};
//		_gridBorder.h = this.insideH;
//		_gridBorder.v = this.insideV;
//		if (this.tableStyle) {
//			this._objMerge(_gridBorder, this.tableStyle.getGridBorder(conStyle));
//		}
//		return _gridBorder;
//	},
	getCellSpacing : function(conStyle) {
		if (this.cellSpacing > 0) {
			return this.cellSpacing;
		}
		if (!this.tableStyle) {
			return 0;
		} else {
			return this.tableStyle.getCellSpacing(conStyle);
		}
		return 0;
	},
	getAlignment:function(){
		var align = this.align;
		if(!align && this.tableStyle ){
			var _tableProperty = this.tableStyle.getTableProperty();
			align =  _tableProperty&&_tableProperty.getAlignment();
		}
		return align;
	},
	getIndent:function(){
		var ind = this.ind;
		if(!ind && this.tableStyle){
			var _tableProperty = this.tableStyle.getTableProperty();
			ind = _tableProperty&&_tableProperty.getIndent();
		}
		return ind;
	},
	getDirection:function(isRawProperty){
		var direction = this.direction;
		if(!direction && this.tableStyle ){
			var tableProperty = this.tableStyle.getTableProperty();
			direction = tableProperty && tableProperty.getDirection(isRawProperty);
		}
		if(!direction)
			direction = pe.lotusEditor.setting.getDefaultDirection();

		if(!isRawProperty && direction == "rl-tb")
			direction = "rtl";

		return direction;
	},
	getColor : function(conStyle) {
		var _colorCache = {};
		this._objMerge(_colorCache, this.color);
		if (this.tableStyle) {
			this._objMerge(_colorCache, this.tableStyle.getColor(conStyle));
		}
		return _colorCache;
	},
	getMergedTextProperty:function(conStyle){
		if(this.tableStyle&&conStyle&&conStyle.length>0){
			var s = this.tableStyle.getConditionStyle(conStyle[0]);
			var textProperty = s&&s.getMergedTextProperty();
			if(textProperty && textProperty != "empty"){
				textProperty = textProperty.clone();
			}else{
				textProperty = new writer.model.prop.TextProperty ();
			}
			var color = s && s.getCellProperty() && s.getCellProperty().getColor();
			color && textProperty._mergeStyle(color, textProperty.style, textProperty);
			for(var i =1;i< conStyle.length;i++){
				var s = this.tableStyle.getConditionStyle(conStyle[i]);
				var t = s&&s.getMergedTextProperty();
				if(t && t != "empty"){
					textProperty = textProperty.merge(t, true);
				}
				var color = s.getCellProperty() && s.getCellProperty().getColor();
				color && textProperty._mergeStyle(color, textProperty.style, textProperty);
			}
			return textProperty;			
		}else if(this.tableStyle){			
			return this.tableStyle.getMergedTextProperty();
		}
		return "empty";
	},
	// Performance reason, change function call to inline.
	_isValid: function(prop)
    {
    	if(prop && prop != 'empty')
    		return true;
    	return false;
    },
	getParagraphProperty:function(conStyle){
		
	},
	getCSSStyle:function(conStyle){
		if(this.tableStyle&&conStyle){
			var str =" ";
			for(var i =0;i< conStyle.length;i++){
				var style = this.tableStyle.getConditionStyle(conStyle[i]);
				if(style && style.refId){
					str +=style.refId+" ";
				}
			}
			return str;
		}else if(this.tableStyle){
			return this.tableStyle.refId||" ";
		}
		return "";
	},
	getTableProperty : function() {
		return null;
	},
	checkStyle:function(style){
		if(this.tableStyle){
			var ret = this.tableStyle.getConditionStyle(style);
			if(ret){
				return true;
			}
		}
		return false;
	},
	
	/* this function has three different return value.
	 *  0: the tableStyle is the same, the refer element do not need to change anything;
	 *  1: the tableStyle is not the same, while text property is the same, it doesnot need to relayout for the refer;
	 *  2: the tableStyle is not the same, and the text property is not the same, the refer need to relayout.
	 */
	compareConditionStyle:function(oldStyle,newStyle){
		if(this.tableStyle){
			var oldTbStyle = this.tableStyle.getConditionStyle(oldStyle);
			var newTbStyle   = this.tableStyle.getConditionStyle(newStyle);
			if(oldTbStyle==newTbStyle){
				return 0;
			}
			if(!oldTbStyle||!newTbStyle){
				var style = oldTbStyle||newTbStyle;
				if(!style){
					console.error("something error!");
					return 0;
				}
				var textProp = style.checkStyle();
				if(textProp.t["font-size"]||textProp.t["font-style"]||textProp.t["font-weight"]||textProp.t["font-family"]||textProp.p){
					return 2;
				}
				return 1;
			}else{
				var oldTextProp = oldTbStyle.checkStyle();
				var newTextProp = newTbStyle.checkStyle();
				if(oldTextProp.t["font-size"]!=newTextProp.t["font-size"]||oldTextProp.t["font-style"]!=newTextProp.t["font-style"]
					||oldTextProp.t["font-weight"]!=newTextProp.t["font-weight"]||oldTextProp.t["font-family"]!=newTextProp.t["font-family"]){					
					return 2;
				}
				if(oldTextProp.p||newTextProp.p){
					return 2;
				}
				return 1;
			}
		}
		return 0;
	}
};
writer.model.prop.TableCommonProperty = function() {

};
writer.model.prop.TableCommonProperty.prototype = {
	initBorder : function(borders) {
		delete this.leftBorder;
		delete this.rightBorder;
		delete this.topBorder;
		delete this.bottomBorder;
		delete this.insideH;
		delete this.insideV;
		if (borders) {
			var left = borders.left;
			if (left&&!this._isNullBorder(left.val)) {
				this.leftBorder = {};
				this.leftBorder.width = left.sz; // Math.round(common.tools.toPxValue((left.sz/20)+"pt"));
				this.leftBorder.style = left.val;
				this.leftBorder.color = left.color;
			}
			var right = borders.right;
			if (right&&!this._isNullBorder(right.val)) {
				this.rightBorder = {};
				this.rightBorder.width = right.sz; // Math.round(common.tools.toPxValue((right.sz/20)+"pt"));
				this.rightBorder.style = right.val;
				this.rightBorder.color = right.color;
			}
			var top = borders.top;
			if (top&&!this._isNullBorder(top.val)) {
				this.topBorder = {};
				this.topBorder.width = top.sz;// Math.round(common.tools.toPxValue((top.sz/20)+"pt"));
				this.topBorder.style = top.val;
				this.topBorder.color = top.color;
			}
			var bottom = borders.bottom;
			if (bottom&&!this._isNullBorder(bottom.val)) {
				this.bottomBorder = {};
				this.bottomBorder.width = bottom.sz;// Math.round(common.tools.toPxValue((bottom.sz/20)+"pt"));
				this.bottomBorder.style = bottom.val;
				this.bottomBorder.color = bottom.color;
			}
			var insideH = borders.insideH;
			if (insideH&&!this._isNullBorder(insideH.val)) {
				this.insideH = {};
				this.insideH.width = insideH.sz;// Math.round(common.tools.toPxValue((insideH.sz/20)+"pt"));
				this.insideH.style = insideH.val;
				this.insideH.color = insideH.color;
			}
			var insideV = borders.insideV;
			if (insideV&&!this._isNullBorder(insideV.val)) {
				this.insideV = {};
				this.insideV.width = insideV.sz;// Math.round(common.tools.toPxValue((insideV.sz/20)+"pt"));
				this.insideV.style = insideV.val;
				this.insideV.color = insideV.color;
			}
			// Save properties we do not implement
			var implementeds = ['left','right','top','bottom','insideH','insideV'];
			var notImplement = dojo.clone(borders);
			dojo.forEach(implementeds,function(implemented){
				delete notImplement[implemented];
			});
			this.borderNotImpl = notImplement; 
		}
	},
	borderToJson:function(){
		var borders = ['left','right','top','bottom','insideH','insideV'];
		var json = dojo.clone(this.borderNotImpl || {});
		for( var i=0;i< borders.length;i++ ){
			if(borders[i]=="insideH"||borders[i]=="insideV"){
				var name = borders[i];
			}else{
				var name = borders[i]+"Border";
			}
			var border = {};
			if(!this[name]){
				continue;
			}
			border.sz = this[name].width;
			border.color = this[name].color;
			border.val = this._adapterBorder2OOXML(this[name].style);
			json[borders[i]]=border;
		}
		if(common.tools.isEmpty(json)){
			return null;
		}
		return json;
	},
	initCellSpacing : function(cellSpacing) {
		this.cellSpacing = Math.round(common.tools.toPxValue(cellSpacing.w,
				cellSpacing.type));
	},
	initConditionStyle : function(style) {
		this.conditionStyle = style;
	},
	setConditionStyleByValue: function(style){
		this.conditionStyle = style;
	},
	createEmptyConditionStyle:function(){
		return {};
	},
	mergeConditionStyle:function(style1,style2){
		var ret =[];
		if(style1&&style1.lastRowFirstColumn==1||style2&&style2.lastRowFirstColumn==1){
			ret.push("lastRowFirstColumn");
		}
		if(style1&&style1.lastRowLastColumn==1||style2&&style2.lastRowLastColumn==1){
			ret.push("lastRowLastColumn");	
		}
		if(style1&&style1.firstRowFirstColumn==1||style2&&style2.firstRowFirstColumn==1){
			ret.push("firstRowFirstColumn");	
		}
		if(style1&&style1.firstRowLastColumn==1||style2&&style2.firstRowLastColumn==1){
			ret.push("firstRowLastColumn");	
		}
		
		if(style1&&style1.firstRow==1||style2&&style2.firstRow==1){
			ret.push("firstRow");	
		}
		if(style1&&style1.lastRow==1||style2&&style2.lastRow==1){
			ret.push("lastRow");	
		}
		
		if(style1&&style1.firstColumn==1||style2&&style2.firstColumn==1){
			ret.push("firstColumn");	
		}
		if(style1&&style1.lastColumn==1||style2&&style2.lastColumn==1){
			ret.push("lastColumn");	
		}
		
		
		if(style1&&style1.evenVBand==1||style2&&style2.evenVBand==1){
			ret.push("evenVBand");
		}
		if(style1&&style1.oddVBand==1||style2&&style2.oddVBand==1){
			ret.push("oddVBand");
		}
		if(style1&&style1.evenHBand==1||style2&&style2.evenHBand==1){
			ret.push("evenHBand");
		}
		if(style1&&style1.oddHBand==1||style2&&style2.oddHBand==1){
			ret.push("oddHBand");
		}
		return ret;
	},
	getBorder:function(){
		if(!this._borderCache){
			this._borderCache = {};
//			var gridBorder = (this.tableProperty&&dojo.clone(this.tableProperty.getGridBorder()))||{};
			this._borderCache.left = this.leftBorder;
			this._borderCache.right = this.rightBorder;
			this._borderCache.top = this.topBorder;
			this._borderCache.bottom = this.bottomBorder;
			this._borderCache.h = this.insideH;
			this._borderCache.v = this.insideV;
		}
		return this._borderCache;
	},
	setConditionStyle:function(style,noOverride){
		if(!noOverride){
			this.conditionStyle = this.createEmptyConditionStyle();
		}
		if(style&&this.getTableProperty().checkStyle(style)){
			this.conditionStyle = this.conditionStyle||this.createEmptyConditionStyle();
			this.conditionStyle[style]="1";
		}
	},
	removeConditionStyle:function(style){
		if(this.conditionStyle&&style){
			this.conditionStyle[style]="0";
		}
	},
	initColor : function(shd) {
		if (shd.fill && shd.fill != "auto") {
			this.color = this.color || {};
			this.color["background-color"] = shd.fill;
		}
		if (shd.color && shd.color != "auto") {
			this.color = this.color || {};
			this.color["color"] = shd.color;
		}
	},
	setColor:function(color,value){
		if(color=="background-color"){
			this.color = this.color || {};
			this.color["background-color"] = value;
		}else if(color=="color"){
			this.color = this.color || {};
			this.color["color"] = value;
		}
		
		if(!value){
			delete this.color[color];
		}
	},
	colorToJson:function(){
		var json = {};
		var isEmpty = true;
		if(this.color&&this.color['background-color']){
			json.fill = this.color['background-color'];
			isEmpty = false;
		}
		if(this.color&&this.color['color']){
			json.color = this.color['color'];
			isEmpty = false;
		}
		if(!isEmpty){
			if(!json.color){
				json.color = 'auto';
			}
			if(!json.fill){
				json.fill = 'auto';
			}
		}
		if(common.tools.isEmpty(json)){
			return null;
		}
		return json;
	},
	getCellSpacing : function() {
		return this.cellSpacing;
	},
	getColor : function() {
		return this.color;
	},
	getTableProperty : function() {
		console.warn("this function need to be implemented!");
	},
	getConditionStyle:function(){
		if(this.conditionStyle){
			return this.conditionStyle;
		}
		return {};
	},
	_isNullBorder:function(style){
		if(!style){
			return true;
		}
		// style = style.toLowerCase();
		// if(style=="nil"){
		// 	return true;
		// }
		return false;
	},
	_adapterBorder2OOXML:function(style){
		style = style.toLowerCase();
		switch (style) {
		case "solid":
			return "single";
		default:
			return style;
		}
	},
	_objMerge : function(obj1, obj2) {
		var o = dojo.clone(obj2);
		for ( var i in o) {
			if (!obj1[i]) {
				obj1[i] = o[i];
			}
		}
		return obj1;
	}
};
common.tools.extend(writer.model.prop.TableProperty.prototype,
		new writer.model.prop.TableCommonProperty());