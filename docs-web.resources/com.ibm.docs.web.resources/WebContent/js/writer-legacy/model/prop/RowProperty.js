dojo.provide("writer.model.prop.RowProperty");
dojo.require("writer.model.prop.TableProperty");
writer.model.prop.RowProperty = function(json,row){
	this.row = row;
	if(!json){
		return;
	}
	this.tblHeaderRepeat = "none";
//	this.json = json;
	if(json.tblHeader && json.tblHeader == "1")
		this.tblHeaderRepeat = true;
	json.cnfStyle&&this.initConditionStyle(json.cnfStyle);
	json.trHeight&&this.initHeight(json.trHeight);
	this.tableProperty = null;
};
writer.model.prop.RowProperty.prototype={
	getTableProperty:function(){
		if(this.row){
			return this.row.parent.getProperty();
		}
	},
	getTblHeaderRepeat:function(){
		return this.tblHeaderRepeat == true ? true: "none"; 
	},
	setTblHeaderRepeat:function(value){
		if(value != null && value != this.getTblHeaderRepeat()){
			this.tblHeaderRepeat = value;
		}			
	},
	toJson:function(){
		var json ={};
		if(this.conditionStyle){
			json.cnfStyle = dojo.clone(this.conditionStyle);
		}
		if(this.h!=null && this.h >0){
			json.trHeight = common.tools.PxToPt(this.h)+"pt";
		}
		if(this.tblHeaderRepeat == true)
			json.tblHeader = "1";
		if(common.tools.isEmpty(json)){
			return null;
		}
		return json;
	},
	initHeight:function(value){
		this.h = common.tools.toPxValue(value);
	},
	setHeight:function(h){
		this.h = h;
	}
};
common.tools.extend(writer.model.prop.RowProperty.prototype, new writer.model.prop.TableCommonProperty());