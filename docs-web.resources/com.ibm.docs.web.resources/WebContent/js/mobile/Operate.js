dojo.provide("mobile.Operate");
dojo.require("mobile.util.Constant");
dojo.declare("mobile.Operate",null,{
	definition: null,
	state: mobile.Constant.ON,
	constructor: function(/*OperateDefinition*/ definition){
		var len = arguments.length;
		//mixin other properties
		for(var i = 1; i < len; i++){
			dojo.mixin(this,arguments[i]);
		}
		this.definition = definition;
	},
	operate: function(data){
		if((this.state == mobile.Constant.DISABLED) ||(this.state == mobile.Constant.OFF)){
			console.log("the operate is disabled!");
			return;
		}
		return this.definition && this.definition.operate(data);
	}
});

dojo.extend(mobile.Operate,{
	setState: function(newState){
		if(this.state == newState)
			return false;
		this.preState = this.state;
		this.state = newState;
		this.onstateChange && this.onstateChange(newState); //optional function callback
		return true;
	},
	/**
	 *  make the state back to preState if preState exists, or the state will be set OFF
	 */
	enableState: function(){
		if(this.state == mobile.Constant.DISABLED){
			this.setState((this.preState&&typeof(this.preState)!="undefined")?this.preState: mobile.Constant.OFF);
		}
	},
	disableState: function(){
		this.setState(mobile.Constant.DISABLED);
	},
	toggleState: function(){
		if(this.state == mobile.Constant.ON){
			this.disableState();
		}else if(this.state == mobile.Constant.OFF){
			this.enableState();
		}
	}
	
});
