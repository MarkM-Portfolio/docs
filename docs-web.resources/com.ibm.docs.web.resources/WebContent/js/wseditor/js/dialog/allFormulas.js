/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.dialog.allFormulas");
dojo.require("dijit.Dialog");
dojo.require("dojo.i18n");
dojo.require("websheet.functions.FormulaTranslate");
dojo.require("concord.i18n.Collation");
dojo.requireLocalization("websheet.dialog","allFormulas");
dojo.declare("websheet.dialog.allFormulas", [concord.widgets.concordDialog], {
	//resource
	//add the new formula name by alphabetic order
	formulasNameArray: ["ABS","ACOS","ACOSH","ACOT","ACOTH","ADDRESS","AND","ASIN","ASINH","ATAN","AVERAGE","AVERAGEA","AVERAGEIF","AVERAGEIFS","ATAN2","ATANH",
						"BASE", "BIN2DEC", "BIN2HEX", "BIN2OCT",
						"CEILING","CHAR","CHOOSE","CODE","COLUMN","COLUMNS","CONVERT","CONCATENATE","COMBIN","COS","COSH","COT","COTH",
		                 "COUNT","COUNTA","COUNTBLANK","COUNTIF","COUNTIFS","CUMIPMT","CUMPRINC","DATE","DATEDIF","DATEVALUE","DAY","DAYS","DAYS360", "DEC2BIN", "DEC2HEX", "DEC2OCT", "DEGREES","DISC","DOLLAR","EDATE","EOMONTH","ERFC","ERROR.TYPE","EVEN","EXACT","EXP","FACT","FACTDOUBLE",
		                 "FALSE","FIND","FIXED","FLOOR","FORMULA","FREQUENCY","FV","FVSCHEDULE","GAMMALN","GCD", "HEX2BIN", "HEX2DEC", "HEX2OCT", "HOUR","HLOOKUP","HYPERLINK","IF","IFS","IFERROR","IFNA","INDEX","INDIRECT","INT","IPMT","ISBLANK","ISERR","ISERROR",
		                 "ISEVEN","ISFORMULA","ISLOGICAL","ISNA","ISNONTEXT","ISNUMBER","ISODD","ISPMT","ISREF","ISTEXT",
		                 "LARGE","LCM","LEFT","LEN","LENB","LN","LOG","LOOKUP","LOWER","LOG10","MATCH","MAX","MEDIAN","MID","MIN","MINUTE",
		                 "MMULT",
		                 "MOD","MODE","MONTH","MROUND","MULTINOMIAL","N","NA",'NETWORKDAYS',"NOT","NOW","NPV","OCT2BIN", "OCT2DEC", "OCT2HEX", "ODD","OFFSET","OR","PI","PMT","POWER","PPMT","PRICEDISC","PRICEMAT","PRODUCT","PROPER",
		                 "PV","QUOTIENT","RANDBETWEEN","RAND",
		                 "RANK","RECEIVED","RADIANS","ROMAN",
		                 "REPLACE","REPT","RIGHT","RIGHTB","ROUND","ROUNDDOWN","ROUNDUP","ROW","ROWS",
		                 "SEARCH","SECOND","SERIESSUM","SHEET","SMALL","SUBSTITUTE", "SUBTOTAL","SUM","SUMIF","SUMIFS","SUMPRODUCT","SQRT","SQRTPI","STDEV","STDEVP","SIGN","SIN","SINH","SUMSQ",
		                 "T","TAN","TANH","TBILLPRICE","TEXT","TIME","TIMEVALUE","TODAY","TRIM","TRUE","TRUNC","TYPE",
		                 "UPPER","VALUE","VAR","VARA","VARP","VARPA","VLOOKUP","WEEKDAY","WEEKNUM","WORKDAY","XNPV","YEAR"],
    formulasNameSortArray:null,
	formulasSyntaxMap:null,
	formulasDispMap:null,
	//dom node
	formulaList: null,	
	formulaSep: null,
	bDirty : false,
	
	constructor: function() {
//		this.timeout = 500;
	},
	setDirty: function(bDirty){
		this.bDirty = bDirty;
	},
	setDialogID: function() {
		this.dialogId ="S_d_allFormulas";
		this.formulaListID="S_d_allFormulasFormulaList";
		// Overridden
		return;
	},
	//overide the super method, do nothing
	returnFocus : function()
	{
	},
	
	onCancel: function (editor) {
		setTimeout( dojo.hitch(this.editor.scene,this.editor.scene.setFocus), 0 );
		return true;
	},

	onShow:function(editor){
		this.formulaSep = websheet.parse.FormulaParseHelper.getArgSepByLocale();
		this._showFormulaText();
	},	
	
	loadFormulaResources: function()
	{
		var formulas = dojo.i18n.getLocalization("websheet.dialog","allFormulas");
		this.formulasNameSortArray = new Array(); // with the locale
		this.formulasDispMap = {};
		this.formulasSyntaxMap = {};
		this.generateResources(this.formulasNameSortArray,this.formulasDispMap,this.formulasSyntaxMap,formulas);
	},
	
	generateResources:function(nameArray,DispMap,SyntaxMap,params){
		for(var i=0;i<this.formulasNameArray.length;i++){		
			var formulaName = this.formulasNameArray[i];
			var localeFormulaName = websheet.functions.FormulaTranslate.transFuncNameEn2Locale(formulaName) || formulaName; // no need trans for En locale?
			formulaName = formulaName.replace(".", "");
			if(!params.formula[formulaName])
			{
				console.log( i + " formula name is :" + formulaName + " has no nls");
				continue;
			}
			nameArray.push(localeFormulaName);
			DispMap[localeFormulaName] = params.formula[formulaName]["Disp"];
			SyntaxMap[localeFormulaName] = params.formula[formulaName]["Syntax"];
		}
		var lang = this.editor.scene.getLocale();	    
	    if(lang.indexOf('de') >=0)
	    	nameArray.sort(concord.i18n.Collation.compare_de);
	    else
	    	nameArray.sort();
	},
	
	updateSelectDiv: function(nameArray){
		for(var index = 0 ; index < nameArray.length; index++){
			var formula = nameArray[index]
			var opt = this.formulaList[index];
			if(opt){
				opt.text = formula;
			}else{
				var opt = document.createElement('option');
				opt.text = formula; 
				if(dojo.isIE)
				{
					this.formulaList.add(opt);
				}
				else
				{
					this.formulaList.add(opt,null);
				}
			}
		}
	},
	
	createContent: function (contentDiv) 
	{
		var formulas = dojo.i18n.getLocalization("websheet.dialog","allFormulas");
		this.loadFormulaResources();
		var listLable = dojo.create('div', null, contentDiv);		
		var lableText = dojo.create('label', null, listLable);
		lableText.appendChild(document.createTextNode(formulas.LABEL_FORMULA_LIST));
		dojo.attr(lableText,'for',this.formulaListID);		
		
		dojo.addClass(listLable,"formualListLabel");
		var selectDiv = dojo.create('div', null, contentDiv);
		var formulaList = dojo.create('select', null, selectDiv);
		this.formulaList = formulaList;
		dojo.attr(formulaList,{"id": this.formulaListID,"size": 8});
		this.updateSelectDiv(this.formulasNameSortArray);
		dojo.addClass(formulaList,"formulaList");
		dojo.attr(formulaList.options[0],{"selected":"selected"});
		var formula = formulaList.options[0].text;
		dojo.connect(formulaList,"onchange", dojo.hitch(this,this._showFormulaText));
		dojo.connect(formulaList,"onkeypress", dojo.hitch(this,this.onKeyPress));
		
		this.formulaSyntaxDiv = dojo.create('div', null, contentDiv);
		dijit.setWaiRole( this.formulaSyntaxDiv,'region');
		dijit.setWaiState( this.formulaSyntaxDiv,'live', 'assertive');	
		this.formulaSyntaxDiv.innerHTML = document.createTextNode(this.formulasSyntaxMap[formula]);		
		dojo.addClass(this.formulaSyntaxDiv,"formulaSyntax");
		
		this.formulaDiscpDiv = dojo.create('div', null, contentDiv);
		this.formulaDiscpDiv.innerHTML = (this.formulasDispMap[formula]);
		dijit.setWaiRole( this.formulaDiscpDiv,'region');
		dijit.setWaiState( this.formulaDiscpDiv,'live', 'assertive');
		dojo.addClass(this.formulaDiscpDiv,"formulaDiscp");
	},
	
	reset: function () {
		if(this.bDirty){
			this.bDirty = false;
			this.loadFormulaResources();
			this.updateSelectDiv(this.formulasNameSortArray);
		}
	},
	
	_showFormulaText: function()
	{
		var selectedIndex = this.formulaList.selectedIndex;
		if(selectedIndex >=0 && selectedIndex < this.formulaList.length)
		{
			var formula = this.formulaList[selectedIndex].text;
			var text = this.formulasSyntaxMap[formula];
			text = dojo.string.substitute(text, [formula,this.formulaSep]);			
			this.formulaSyntaxDiv.innerHTML = text;
			var dispText = this.formulasDispMap[formula];
			dispText = dojo.string.substitute(dispText, [formula]);
			this.formulaDiscpDiv.innerHTML = dispText;
		}
	},
	
	onOk: function (editor)
	{
		//if has image selected: return directly		
		if(editor.hasDrawFrameSelected())
			return;
		
		editor.getCalcManager().pauseTasks();
		var grid = editor.getCurrentGrid();
		var selectedIndex = this.formulaList.selectedIndex;
		var formula = this.formulaList[selectedIndex].text;
	    var text = "=" + formula + "()";
	    var formulaBar = editor.getFormulaBar();
	    if (formulaBar) formulaBar.setFormulaInputLineValue(text);
	    this.focus = false;
	    
	    var inlineEditor = grid.getInlineEditor();
	    var editingBefore = inlineEditor.isEditing();
    	inlineEditor.editingStart();
    	inlineEditor.setValue(text);
    	if (!editingBefore) {
    		inlineEditor._lockEditCell();
    	}
		return true;
	},
	
	hide: function()
	{
		try{
			var inlineEditor = this.editor.getController().getInlineEditor();
			var setCursor = function(){
				if(inlineEditor.isEditing())
				{
					inlineEditor.setCursor(inlineEditor.getValue().length - 1);
					inlineEditor.getInputTextSelection(true);
				}
			};
			//Animation complete, if it's editing, place the cursor in the () in the formula string.
			this.inherited(arguments).then(setCursor);
		}catch(e){
			//in case the default hide() of dojo is overwrite with _hide_, and it's not return a promise. timeout to do this
			setTimeout(setCursor, 0);
		}
	}
});