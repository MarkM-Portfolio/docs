dojo.provide('websheet.JsProxyModel.Calculator');
dojo.require('websheet.JsProxyModel.PartialCalcManager');
dojo.declare('websheet.JsProxyModel.Calculator', null,{
	java : null, // jvm
	_doc : null, //websheet.JsProxyModel.Document
	_idManager: null, //websheet.JsProxyModel.IDManager
	_task: null,	//task created by TaskManager
	_monitor: null,	//CalcMontior.class
	_calcInterval : null,
	_service : null,// the calc service info
	constructor: function(j, m, interval, service){
		this.java = j;
		this._monitor = m;
		this._calcInterval = interval;
		this._service = service;
	},
	/**
	 * Calculate the formula of the document which can be recognized by data
	 */
	calc: function(javaDoc, docId){
		if (javaDoc != null) {
			websheet.functions.Object.setCalculator(this);
			
			this._doc = new websheet.JsProxyModel.Document(this.java, javaDoc);
			this._doc.docId = docId;
			var pcm = new websheet.JsProxyModel.PartialCalcManager(this);
			this._doc.setPartialCalcManager(pcm);
			
			var taskTime = this._monitor.addCalcTaskSync(docId);
			
			this.init(javaDoc);
			
			var calculator = this;
			//start parsing...
			var startTime = new Date();
			javaDoc.getDirtyCells(function(err, cell_list) {
				if(err){
					console.log(err);
					return;
				}
				var et = new Date();
				var dt = et - startTime;
				calculator._service.javaCollectFormulaTime = dt; 
				console.log("java collect formula cost " + dt + " ms for doc " + docId );
				if(calculator._task && calculator._task._delete){
					console.log("calculation task has been removed");
					return;
				}
				pcm.start(cell_list, function(task, options){
						calculator._task = task;
						var params = {bTerminate: task == null, bReport: true};
						if(options)
							dojo.mixin(params, options);
						dojo.publish("calc" + this._doc.docId, [params]);
					});
			});
		}
	},
	
	getTask: function(){
		return this._task;
	},
	
	init: function(javaDoc){
		this._idManager = new websheet.JsProxyModel.IDManager(javaDoc.getIDManagerSync());
		this._doc._idManager = this._idManager;
//		var refList = this._doc.getRefList();
		var refList = this._doc.getAreaManager();
		var usage = websheet.Constant.RangeUsage.NAME;
		
		//load name range into reference list
		var nameList = javaDoc.getRangeListSync().getNameRangesSync();
		
		for(var i = 0; i < nameList.sizeSync(); i++)
		{
			var range = nameList.getSync(i);
			var address = range.getAddressSync();
			var reference = this.newReference(address);
			reference.setUsage(usage);
			reference.setRangeId(range.getIdSync());
			refList.addRange(reference);
		}
		
	},
	
	/////////////////implement ModelHelper method/////////////////
	getDocument: function(){
		return this._doc;
	},
	
	getIDManager: function(){
		return this._idManager;
	},
	
	newReference: function(address, sheetName) {
		var ref = new websheet.JsProxyModel.Reference(this._doc, this._idManager);
		ref.parseAddress(address, sheetName);
		return ref;
	},
	
	decompose:function(){
		this._doc.decompose();
		this._doc = null;
		this._idManager = null;
		this.java = null;
		this._monitor = null;
		this._task = null;
		this._service = null;
	}
});
