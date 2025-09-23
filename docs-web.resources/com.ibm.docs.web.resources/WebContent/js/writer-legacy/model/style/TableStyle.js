dojo.provide("writer.model.style.TableStyle");
dojo.require("writer.model.prop.TableProperty");
dojo.require("writer.model.prop.CellProperty");
writer.model.style.TableStyle=function(source,id){
	//this.styles = source;
	this.jsonData = source;
	this.conStyle =  {};
	this.init(id);
	this.initTableStyle(id);
},
writer.model.style.TableStyle.prototype={
	isTableStyle:true,
	initTableStyle:function(id){
		this._tableProperty = this.jsonData.tblPr && new writer.model.prop.TableProperty(this.jsonData.tblPr, null);
		this._cellProperty = this.jsonData.tcPr && new writer.model.prop.CellProperty(this.jsonData.tcPr, null);
		this._createCSSStyle();
		if(this.jsonData.tblStylePrs&&this.jsonData.tblStylePrs.length>0){
			this._sortConStyle(this.jsonData.tblStylePrs);
			for(var i=0;i<this.jsonData.tblStylePrs.length;i++ ){
				var type = this.jsonData.tblStylePrs[i].type;
				var style = new writer.model.style.TableStyle(this.jsonData.tblStylePrs[i],id+"_"+type);
				this.conStyle[type] = style;
			}
		}
		
	},
	toJson: function()
	{
		return dojo.clone(this.jsonData);
	},
	createCSSStyle:function(){
		
	},
	_createCSSStyle:function(str){
		if(!str)
		{
			str = this.toCSSString();
			if(!str||str.length==0){
				delete this.refId;
				return;
			}
			str = "."+this.refId+"{"+str+"}";
		}
		var doc = layoutEngine.editor.getEditorDoc();
		var styleSheet = doc.styleSheets[0];
		if(!this._CSRuleIndex){
			this._CSRuleIndex = styleSheet.cssRules.length;
		}
		str = writer.util.FontTools.fallbackFontsInCss(str);
		styleSheet.insertRule(str,this._CSRuleIndex);
	},
	_sortConStyle:function(styles){
		var t ={swCell:1,seCell:1,nwCell:1,neCell:1,
				firstRow:2,	lastRow:2,
				firstCol:3,lastCol:3,
				band2Vert:4,band1Vert:4,band2Horz:5,band1Horz:5				
		};
		var _sortFunc = function(s1,s2){
			var t1 = s1.type;
			var t2 = s2.type;
			return t[t2]-t[t1];
		};
		styles.sort(_sortFunc);
	},
	getTableProperty:function(){
		return this._tableProperty;
	},
	getCellProperty:function(){
		return this._cellProperty;
	},
	toCSSString:function(){
		var textProperty = this.getMergedTextProperty();
		var str = "";
		if(textProperty!="empty"){
			var style = textProperty.style;
			
			for(var n in style){
				str += n+":"+style[n]+";";
			}
		}
		var color = this.getColor();
		for(var n in color){
			str += n+":#"+color[n]+";";
		}
		return str;
	},
	getConditionStyle:function(condition){
		var ret = null;
		if(!condition){
			return ret;
		}
		switch(condition){
			case "lastRowFirstColumn":
				ret=this.conStyle.swCell;
				break;
			case "lastRowLastColumn":
				ret=this.conStyle.seCell;
				break;
			case "firstRowFirstColumn":
				ret=this.conStyle.nwCell;
				break;
			case "firstRowLastColumn":
				ret = this.conStyle.neCell;
				break;
			case "firstColumn":
				ret = this.conStyle.firstCol ;
				break;
			case "firstRow":
				ret = this.conStyle.firstRow ;
				break;
			case "lastColumn":
				ret = this.conStyle.lastCol ;
				break;
			case "lastRow":
				ret = this.conStyle.lastRow ;
				break;
			case "evenVBand":
				ret = this.conStyle.band2Vert ;
				break;
			case "oddVBand":
				ret = this.conStyle.band1Vert ;
				break;
			case "evenHBand":
				ret = this.conStyle.band2Horz ;
				break;
			case "oddHBand":
				ret = this.conStyle.band1Horz ;
				break;			
		}
		return ret;
	},
	getBorder:function(){
//		return this._getValue("getBorder", conStyle);
		var value ={};
		this._cellProperty&&this._objMerge(value, this._cellProperty.getBorder());
		this._tableProperty&&this._objMerge(value, this._tableProperty.getBorder());
		return value;
	},
//	getGridBorder:function(conStyle){
//		return this._getValue("getGridBorder", conStyle);
//	},
	getColor:function(conStyle){
		return this._getValue("getColor", conStyle);
	},
	getCellSpacing:function(conStyle){
		if(conStyle){
			for(var i =0;i< conStyle.length;i++){
				var s = this.getConditionStyle(conStyle[i]);
				if(s){
					var v = s.getCellSpacing();
					if(v>0){
						return v;
					}
				}
			}
		}
		if(this._cellProperty){
			var v = this._cellProperty.getCellSpacing();
			if(v>0){
				return v;
			}
		}
		if(this._tableProperty){
			var v = this._tableProperty.getCellSpacing();
			if(v>0){
				return v;
			}
		}
		return 0;
	},
	_getValue:function(func,conStyle){
		var value ={};
		if(conStyle){
			for(var i =0;i< conStyle.length;i++){
				var s = this.getConditionStyle(conStyle[i]);
				s&&this._objMerge(value, s[func]());
			}
		}
		this._cellProperty&&this._objMerge(value, this._cellProperty[func]());
		this._tableProperty&&this._objMerge(value, this._tableProperty[func]());
		return value;
	},
	_objMerge:function(obj1,obj2){
		var o = dojo.clone(obj2);
		for(var i in o){
			if(!obj1[i]){
				obj1[i] = o[i];
			}
		}
		return obj1;
	},
	checkStyle:function(){
		var textProp = this._textProperty;
		var paraProp = this._paraProperty;
		var cellProp = this._cellProperty;
		var ret = {};
		ret.t={};
		if(textProp){
			ret.t = textProp.style;
		}
		if(paraProp){
			ret.p = paraProp.toJson();
		}
		if(cellProp){
			ret.c = true;
		}
		return ret;
	}
};
common.tools.extend(writer.model.style.TableStyle.prototype, new writer.model.style.Style());