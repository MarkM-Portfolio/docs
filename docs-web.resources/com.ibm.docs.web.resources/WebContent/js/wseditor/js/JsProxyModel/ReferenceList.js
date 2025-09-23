dojo.provide('websheet.JsProxyModel.ReferenceList');
//not used for now
dojo.declare("websheet.JsProxyModel.ReferenceList", websheet.functions.ReferenceList, {
	_doc: null,	//websheet.JsProxyModel.Document
	_idManager: null, //websheet.JsProxyModel.IDManager
	_nameRefs: null,	//the list for name reference
	_refs: null,		// the list for formula reference
	constructor: function(d, idmanager)
	{
		this._doc = d;
		this._idManager = idmanager;
		this._nameRefs = {};
		this._refs = {};
	},
	
	getRefByAddress:function(address, sheetName, bCreate, refType, ignoreInvalid){
		//TODO: the same address are not share the same reference
		var ref = new websheet.JsProxyModel.Reference(this._doc, this._idManager);
		if(refType == undefined)
			refType = 0;
		
		ref._setRefType(refType,false);
		ref.parseAddress(address, sheetName);
		var name = ref._rangeInfo.sheetName;
		var list = this._refs[name];
		if(!list){
			list = {};
			this._refs[name] = list;
		}
		var address = ref.getAddress();
		var rl = list[address];
		if(rl != null){
			var length = rl.length;
			for(var i = 0; i < length; i++){
				var r = rl[i];
				if(r.getRefType() == refType)
					return r;
			}
		}
		return ref;
	},
	
	addRange: function(range){
		if(range ){
			if(range.getUsage() == websheet.Constant.RangeUsage.NAME)
				this._nameRefs[range.getRangeId()] = range;
			var name = range._rangeInfo.sheetName;
			var list = this._refs[name];
			if(!list){
				list = {};
				this._refs[name] = list;
			}
			var address = range.getAddress();
			var rl = list[address];
			if(!rl)
				list[address] = [range];
			else{
				var bFound = false;
				var length = rl.length;
				var refType = range.getRefType();
				for(var i = 0; i < length; i++){
					var r = rl[i];
					if(r.getRefType() == refType){
						bFound = true;
						break;
					}
				}
				if(!bFound)
					rl.push(range);
			}
			range.addCount();
		}
		//do nothing
	},
	
	deleteRange:function(range){
		if(!range)
			return;
		var count = range.deleteCount();
		//TODO necessary?
		if(count <= 0){
			range.resetCache();
			var name = range._rangeInfo.sheetName;
			var list = this._refs[name];
			if(list){
				var address = range.getAddress();
				var rl = list[address];
				var length = rl.length;
				var refType = range.getRefType();
				for(var i = 0; i < length; i++){
					var r = rl[i];
					if(r.getRefType() == refType){
						rl.splice(i,1);
						break;
					}
				}
				if(rl.length == 0)
					delete list[address];
			}
		}
	},
	
	getRange:function(){
		console.warn("getRange does not supported yet");
	},
	
	getRangeByUsage:function(rangeId, usage){
		if(usage == websheet.Constant.RangeUsage.NAME && rangeId){
			var range = this._nameRefs[rangeId.toLowerCase()];
			return range;
		}else
			console.warn("getRangeByUsage does not supported yet");
	},
	
	addNonNameCell:function(cell){
		//Do nothing
	},
	
	decompose:function() {
		this._nameRefs = null;
		this._refs = null;
		this._doc = null;
		this._idManager = null;
	}

});
