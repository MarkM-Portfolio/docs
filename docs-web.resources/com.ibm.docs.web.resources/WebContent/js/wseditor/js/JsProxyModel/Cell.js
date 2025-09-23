dojo.provide('websheet.JsProxyModel.Cell');

dojo.declare("websheet.JsProxyModel.Cell", websheet.functions.Cell, {
	_javaCell : null,// com.ibm.concord.spreadsheet.document.oomodel.impl.ValueCell
	_doc : null, //websheet.JsProxyModel.Document
	_sheet : null,
	_tokens : null, // cell token tree
	_errProp:websheet.Constant.CellErrProp.DEFAULT, // cell referred formula error proerties
	_uniqueId: null,
	
	isParsed:false,								//check if the cell has been parsed
	_isUnCalc: false,							//check if cell has been calculated
	//private attribute
	_rowIndex: -1,
	_colIndex: -1,
	_sheetName : null,
	_type: null,								
	_value: null,								//null for not used yet
	constructor: function(doc)
	{
		this._doc = doc;
	},
	
	//cellInfos is in the order of [SheetName, colIndex, rowIndex,value, bFormula, bDirty, errProp ,calcValue, errorCode]
	setJavaModel:function(jc, pos, cellId, cellInfos){
		this._javaCell = jc;
		//reset 
		this._tokens = null;
		this._errProp = websheet.Constant.CellErrProp.DEFAULT;

		if (pos && pos.rowIndex != undefined && pos.colIndex != undefined
				&& pos.sheetName != undefined) {
			this._rowIndex = pos.rowIndex;
			this._colIndex = pos.colIndex;
			this._sheetName = pos.sheetName;
			if (cellId == null)
				this._uniqueId = this._sheetName + "."
						+ websheet.Helper.getColChar(this._colIndex)
						+ this._rowIndex;
			else
				this._uniqueId = cellId;
		} 
		if(!cellInfos){
			cellInfos = jc.info;
		}
		if(!cellInfos)
			return;
		
		var cInfo = cellInfos[0];
		
		if(this._sheetName == null){//cell position has not been assigned
			this._sheetName = cInfo[0];
			this._colIndex = cInfo[1];
			this._rowIndex = cInfo[2];
			this._uniqueId = this._sheetName + "."
				+ websheet.Helper.getColChar(this._colIndex)
				+ this._rowIndex;
		}
		this._value = cInfo[3];
		this._type = cInfo[4];
		this._visible = cInfo[5];
		var fInfo = cellInfos[1];
		if(fInfo && fInfo.length > 0){
			//it must be formula cells
			this._bFormula = true;
			var bDirty = fInfo[0];
			this._errProp = fInfo[1];
			if(!bDirty){
				this._calcValue = fInfo[2];
				//the formula cell does not have cv should also be considered as dirty
				if(this._calcValue != null)
					this.isParsed = true;
				var code = fInfo[3];
				if (code == 0)
					this._errCode = null;
				else
					this._errCode = websheet.Constant.ERRORCODE["" + code];
			}
		}else{
			this._bFormula = false;
			this.isParsed = true;
			if(this.isError())
				this._errCode = websheet.model.ModelHelper.toErrCode(this._value);
			else
				this._errCode = null;
			delete this._isUnCalc;
		}
		if(this._bFormula)
			this._tokenArray = [];
	},
	
	getJavaModel:function(){
		return this._javaCell;
	},
	
	getValue: function() {
		return this._value;
	},
	
	///////////////////////////////////////////////
	getComputeValue: function() {
		if(this.isFormula()){
			if(this._calcValue == undefined){
				if(!this.isParsed || this._isUnCalc){
					this._calculate();
				}
			}
			return this._calcValue;
		}else{
			return this.getValue();
		}
	},
	
	setType:function(type){
		this._type = type;
	},
	
	getType:function() {
		return this._type;
	},
	
	getFormulaValue: function() {
		if(this._fv == null){
			this._fv = this._doc.java.callStaticMethodSync("com.ibm.concord.spreadsheet.common.utils.FormulaPrioritizer", "prioritize", this.getValue());
		}
		return this._fv;
	},
	
	/*boolean*/isFormula: function() {
		return this._bFormula;
	},
	
	/**
	 * the cell is one number cell?
	 */
	/*boolean*/isNumber:function(){
		return this._value != null && ((this._type >> 3) == websheet.Constant.ValueCellType.NUMBER);
	},
	
	/**
	 * is boolean cell?
	 */
	/* boolean */ isBoolean: function() {
		return (this._type >> 3) == websheet.Constant.ValueCellType.BOOLEAN;
	},
	
	/**
	 * is string cell?
	 */
	/* boolean */ isString: function() {
		return (this._type >> 3) == websheet.Constant.ValueCellType.STRING;
	},
	
	/* boolean */ isError: function() {
		return (this._type >> 3) == websheet.Constant.ValueCellType.ERROR;
	},
	
	/*error*/getError: function() {
		return this._errCode;
	},
	
	/*string*/getSheetName: function() {
		return this._sheetName;
	},
	
	/*int*/getRow: function() {
		return this._rowIndex;
	},
	
	/*int*/getCol: function() {
		return this._colIndex;
	},
	
	getRowId: function() {
		return this._rowIndex;
	},
	
	getColId: function() {
		return this._colIndex;
	},
	
	isFiltered: function() {
		this._visible == "filter";
	},
	
	isVisible: function() {
		this._visible != "hide";
	},
	
	/*sheet*/_getSheet: function() {
		return this._doc.getSheet(this._sheetName);
	},
	
	/*document*/_getDocument: function() {
		return this._doc;
	},
	
	/*websheet.parse.tokenList*/newTokenList: function() {
		var tokenList = new websheet.parse.tokenList();
		tokenList.cell = this;
		return tokenList;
	},
	
	setCellToken:function(tokens){
		this._tokens = tokens;
	},
	
	getCellToken:function(){
		return this._tokens;
	},
	
	/*void*/setLink: function(link) {
	},
	
	/*void*/setErrProp: function(errProp) {
		this._errProp |= errProp;
		this._javaCell.setErrProp(errProp, function(err){
			
		});
	},
	
	getErrProp:function(){
		return this._errProp;
	},
	
	/*void*/pushRef: function(token) {
		//do not need add to _refs list yet unless need getImpactCells for circular calc
		if(token && (token.getTokenType() == websheet.parse.tokenType.RANGEREF_TOKEN
				|| token.getTokenType() == websheet.parse.tokenType.NAME))
		{
			//1.add ref to document reference list
			var ref = token.getValue();
			this._doc.getAreaManager().addRange(ref);
			ref.addRelateCell(this);
			if(!this._refs)
				this._refs = [];
			this._refs.push(token);
		}
	},
	
	/*void*/deleteRef: function(token) {
		//do not need to delete reference, because the relate ref info will not change for each cell
		if(token && (token.getTokenType() == websheet.parse.tokenType.RANGEREF_TOKEN
				|| token.getTokenType() == websheet.parse.tokenType.NAME))
		{
			var ref = token.getValue();
			var bContain = ref.deleteRelateCell(this);
			if(bContain){
				this._doc.getAreaManager().deleteRange(ref);
				if(this._refs){
					var length = this._refs.length;
					for(var i=0;i<length; i++)
					{
						if(this._refs[i] == token)
						{
							this._refs.splice(i,1);
							break;
						}
					}
				}
			}
		}
	},
	
	/*string*/getEditValue: function() {
		console.log("WARN: error when get cell edit value");
		return this._value;
	},
	
	/*void*/setError: function(/*websheet.Constant.ERRORCODE*/error) {	
		var code = 0;//for java cell, the error code is int
		if (error) {
			code = error.errorCode;
			console.log(this._uniqueId + " result contains error with code: " + code);
			this._errCode = websheet.Constant.ERRORCODE["" + code];
			this._type &= websheet.Constant.ValueCellType.FORMULA_TYPE_MASK;
			this._type |= websheet.Constant.ValueCellType.ERROR << 3;
		}else
			this._errCode = null;
		
	},
	
	//set calc value after calculation done
	/*void*/setComputeValue: function(value) {
		if(value == null)
			return;
		//for unsupport formula or refer to unsupport formula cell, we should not save cv
		//or set it unknown and set error properties in reference.js
		if(this._errCode == websheet.Constant.ERRORCODE["1001"]
		 || this._errCode == websheet.Constant.ERRORCODE["1003"]){
			value = null;
		}else{
			var mhelper = websheet.model.ModelHelper;
			this._type = mhelper.getCellType(this._value, value);
//			if(this.isError() && this._errCode == null){
//				this._errCode = mhelper.toErrCode(value);
//			}
			this._calcValue = mhelper.fixValueByType(value, this._type);
		}
			
		this._javaCell.setCalcValue(value,function(err){
			if(err){
				console.log("WARN: error when set java cell calculate value ");
			}
		});
		
	},
	
	_calculate:function(){
		console.log("start calc cell with value: " + this.getValue());
		var result = {};
		
		var parseHelper = websheet.parse.parseHelper;
		var STATUS = websheet.Constant.FormulaPredictStatus;
		var bPredict = false;
		var af = this._doc._afFormulas;
		if(!this.isParsed){
			var predictStatus = parseHelper._predictFormula(this, af);
			var areas = af.areas;
			if(this._doc._pcm.bBatchGetCells && predictStatus && areas){
				var area = areas[this._uniqueId];
				if(area)
					return;
			}
			bPredict = true;
		}
		if(!this.isParsed){
			this.isParsed = true;
			this._isUnCalc = true;
			result = parseHelper._parse(this);
		}else if(this._tokens){
			var updateObj = {};
			if(this._bAfPat)
			{
				updateObj.bAutofill = true;
				updateObj.tokenArray = this._tokenArray;
			}
			if(this._isUnCalc) 
			{
				updateObj.bUpdate = true;
			}
			var err = null;
			try{
				parseHelper.calc(this, updateObj);
				err = updateObj.error;
			}catch(e){
				err = e;
			}
			if(updateObj.bUpdate)
			{
				if(!parseHelper._cellStack){
					parseHelper._cellStack = [];
				}
				parseHelper._cellStack.push(this);				
				parseHelper.getFormulaResult(err, result, this._tokens, this);//not check partial loading here
				parseHelper._cellStack.pop();
			}
		}else{
			//no token tree, it must be #REF!
			this._isUnCalc = false;
		}
		var bClearRef = true;
		if(bPredict){//if there is predict before parse, there must be predict action after parse
			var predictStatus = parseHelper._predictFormula(this, af);
			if(this._doc._pcm.bBatchGetCells && predictStatus){
				var areas = af.areas;//record all the autofilled areas
				if(!areas){
					areas = {};
					af.areas = areas;
				}
				if(predictStatus[0] == STATUS.PREDICT || predictStatus[1] == STATUS.PREDICT){
					var area = {sheetName: this._sheetName,
								startCol: this._colIndex,
								endCol: this._colIndex,
								startRow: this._rowIndex,
								endRow: this._rowIndex,
								cell: this};
					areas[this._uniqueId] = area;
					bClearRef = false;//the reference info need reused by batchCalc
				}
			}
		}
		
		if(result.error && result.error.errorCode == 2001)
		{
			this._isUnCalc = true;//note that isParsed still be true
			this.setComputeValue(null);
			console.log(this._uniqueId + " still need to calc");
		}else{
			delete this._isUnCalc;
			this.setError(result.error);//TODO do not need it because set error by set format type
			this.setComputeValue(result.result);
			this._javaCell.setDirtySync(false);
			console.log(this._uniqueId + " result: " + result.result);
			this._doc._pcm.calcIndex++;
		}
	},
	
	clearRefs:function(){
		if (this._refs) {
			var list = this._doc.getAreaManager();
			var length = this._refs.length;
			for ( var i = 0; i < length; i++) {
				var token = this._refs[i];
				var ref = token.getValue();
				var bContain = ref.deleteRelateCell(this);
				if(bContain)
					list.deleteRange(ref);
				ref = null;
				token = null;
			}
			this._refs = null;
		}
	},
	
	decompose:function(){
		this.clearRefs();
		this._javaCell = null;
		this._doc = null;
		this._tokens = null;
		this._tokenArray = null;
		delete this._bFormula;
		delete this._type;
		delete this._calcValue;
		delete this._value;
		delete this._errCode;
		delete this.isParsed;
		delete this._isUnCalc;
		delete this._bAfPat;
		delete this._doc;
	},
	
	getAddress:function(){
		return this._uniqueId;
	}
});
