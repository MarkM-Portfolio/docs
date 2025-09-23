dojo.provide("mobile.OperateController");
dojo.require("mobile.Operate");
dojo.declare("mobile.OperateController",null,{
	operateMap: null,
	constructor: function(){
		this.operateMap = {};
	},
	/**
	 * one id has only one operate, not a list with order!
	 * @param id
	 * @param operate
	 */
	addOperate: function(/*String*/id, /*mobile.Operate*/operate){
		var op = (this.operateMap || (this.operateMap = {}))[id];
		if(!op){
			this.operateMap[id] = operate;
		}
	},
	execOperate: function(/*String*/id,data){
		var op = (this.operateMap || (this.operateMap = {}))[id];
		if(op){
			op.operate.call(this,data);
		}
	},
	removeOperate: function(/*String*/id){
		var operate = this.operateMap[id];
		if(operate){
			delete this.operateMap[id];
			return operate;
		}
		return null;
	},
	destroy: function(){
		this.operateMap = null;
	}
});
