dojo.provide('websheet.JsProxyModel.Sheet');

dojo.declare("websheet.JsProxyModel.Sheet", websheet.functions.Sheet, {
	_doc : null, //websheet.JsProxyModel.Document
	_javaSheet : null,// com.ibm.concord.spreadsheet.document.oomodel.impl.Sheet
	_id: null,
	_name: null,
	constructor: function(doc)
	{
		this._doc = doc;
	},
	
	setJavaModel:function(js){
		this._javaSheet = js;
	},
	
	getJavaModel:function(){
		return this._javaSheet;
	},
	
	getId: function(){
		if(!this._id)
			this._id = this._javaSheet.getIdSync();
		return this._id;
	},
	
	getSheetName: function() {
		if(!this._name)
			this._name = this._javaSheet.getSheetNameSync();
		return this._name;
	}
});
	
