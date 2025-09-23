dojo.provide('websheet.JsProxyModel.Document');

dojo.declare("websheet.JsProxyModel.Document", websheet.functions.Document, {
	java: null,
	_javaDoc : null, // com.ibm.concord.spreadsheet.document.oomodel.impl.IDManager
//	isDeepParsing : false,
	_pcm: null,		// PartialCalcManager
	_idManager : null,
	_afFormulas: null,
	/*Map*/_sheets:null, //different type with client model	, key is sheetName
	/*Map*/_sheetsById:null,	//key is id
	constructor: function(j,jd)
	{
		this.java = j;
		this._javaDoc = jd;
		this._sheets = {};
		this._sheetsById = {};
		var javaSheets = this._javaDoc.getSheetsSync();
		var size = javaSheets.sizeSync();
		for(var i=0;i<size;i++){
			var javaSheet = javaSheets.getSync(i);
			var sheet = new websheet.JsProxyModel.Sheet(this);
			sheet.setJavaModel(javaSheet);
			var name = sheet.getSheetName();
			this._sheets[name.toUpperCase()] = sheet;
			this._sheetsById[sheet.getId()+""] = sheet;
		}
		//used for autofill formula recognition
		this._afFormulas = {row:{}, col:{}};
		
	},
	
	getSheet:function(sheetName){
		if(sheetName){
			var sheet = this._sheets[sheetName.toUpperCase()];
			return sheet;
		}
		return null;
	},
	
	getSheetById:function(id) {
		var sheet = this._sheetsById[id];
		return sheet;
	},
	
	isSheetExist:function(sheetName, bSheetId){
		if(bSheetId)
			return (this.getSheetById(sheetName) != null);
		else
			return (this.getSheet(sheetName) != null);
	},
	
	getRefList: function() {
		if(!this._refList)
		{
			this._refList = websheet.JsProxyModel.ReferenceList(this, this._idManager);//new websheet.parse.ReferenceList();//websheet.JsProxyModel.ReferenceList();??
		}
		return this._refList;
	},
	
	setPartialCalcManager:function(pcm) {
		this._pcm = pcm;
	},
	
	getPartialCalcManager:function(){
		return this._pcm;
	},
	
	decompose:function(){
		this._pcm.decompose();
		this._pcm = null;
		for(var name in this._sheets){
			var sheet = this._sheets[name];
			sheet._javaSheet = null;
			sheet = null;
		}
		this._sheets = null;
		this._idManager._javaIDManager = null;
		this._idManager = null;
		this._javaDoc = null;
		this.java = null;
		this._afFormulas = null;
		if(this._refList){
			this._refList.decompose();
			this._refList = null;
		}
		
	}
	
});
