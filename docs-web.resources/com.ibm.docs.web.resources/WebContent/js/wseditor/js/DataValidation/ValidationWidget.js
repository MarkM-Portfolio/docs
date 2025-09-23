/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.DataValidation.ValidationWidget");
dojo.require("dijit.form.DropDownButton");
dojo.require("dijit.form.ToggleButton");
dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.Menu");
dojo.requireLocalization("websheet.DataValidation","Validation");

dojo.declare("websheet.DataValidation.ValidationWidget", [dijit._Widget, dijit._Templated], {
	widgetsInTemplate: true,
	templateString: dojo.cache("websheet", "templates/ValidationWidget.html"),
	parent: null,
	
	dvTypes: ["none", "whole","decimal","itemList", "rangeList","date","time","textLength","custom"],
	
	conditions: ["bet", "notBet", "equal", "notEqual", "greater", "greaterEqual", "less", "lessEqual"],
	conditionsDate: ["bet", "notBet", "equal", "notEqual", "before", "onBefore", "after", "onAfter"],
	
	//Three dropdown widget for three different operator list
	conDropDown: null,
	conDropDownDate: null,
	
	//The current using dropDown widget 
	currConDropDown : null,
	//The current operator list
	optList: null,
	
	//The selected type and operator
	type: null,
	operator: null,
	
	//map for json operator
	operatorMap:{
		bet : "between",
		notBet : "notBetween",
		equal : "==",
		notEqual : "!=",
		greater : ">",
		greaterEqual : ">=",
		less : "<",
		lessEqual : "<=",
		before : "<",
		onBefore : "<=", 
		after : ">", 
		onAfter : ">="
	},
		
	dataOperatorMap:{
		bet : "between",
		notBet : "notBetween",
		equal : "==",
		notEqual : "!=",
		before : "<",
		onBefore : "<=", 
		after : ">", 
		onAfter : ">="
	},
	
	constructor: function() 
	{
		this.nls = dojo.i18n.getLocalization("websheet.DataValidation","Validation");
	},
	
	setParent: function(parent)
	{
		this.parent = parent;
	},
	
	postCreate: function(){
		this.inherited(arguments);
		
		this.ref_error.innerHTML = this.nls.refAlert;
		this.list_error.innerHTML = this.nls.itemListAlert;
		//this.addItemBtn.src = window.contextPath + window.staticRootPath + "/images/blank.gif";

		var dirAttr = '';
		if (BidiUtils.isGuiRtl()) {
			dirAttr = 'rtl';
			this.input2Date.dir = this.input1Date.dir = dirAttr;
		}

		this.validation_type.dropDown = new dijit.Menu({dir: dirAttr});
		for(var i=0;i<this.dvTypes.length;i++)
		{
			var type = this.dvTypes[i];
			var item = new dijit.MenuItem({label:this.nls[type], dir: dirAttr});

			dijit.setWaiState(item.domNode,"label",this.nls[type]);
			
			this.connect(item,"onClick", dojo.hitch(this,function(type)
			{
				this.validation_type.setLabel(this.nls[type]);
				this._typeChanged(type);
			},type));
			
			this.validation_type.dropDown.addChild(item);
		}
		this.connect(this.validation_type.dropDown,"onOpen", dojo.hitch(this,"_dropDownOpen", this.validation_type));
	
		this.connect(this.input1, "onchange", dojo.hitch(this, "_value1Change"));
		this.connect(this.input2, "onchange", dojo.hitch(this, "_value2Change"));
		this.input1Date.onChange = dojo.hitch(this, "_value1Change");
		this.input2Date.onChange = dojo.hitch(this, "_value2Change");
		this.connect(this.input1Date.textbox, "onchange", dojo.hitch(this, "_value1Change"));
		this.connect(this.input2Date.textbox, "onchange", dojo.hitch(this, "_value2Change"));
		
		this.connect(this.input1, "onkeypress", dojo.hitch(this, "onKeyPress",this.input1, this.value1_error));
		this.connect(this.input2, "onkeypress", dojo.hitch(this, "onKeyPress",this.input2, this.value2_error));
		this.connect(this.input1Date.textbox, "onkeypress", dojo.hitch(this, "onKeyPress", this.input1Date, this.value1_error));
		this.connect(this.input2Date.textbox, "onkeypress", dojo.hitch(this, "onKeyPress", this.input2Date, this.value2_error));	
		if (BidiUtils.isBidiOn()) {
			var textDir = BidiUtils.getTextDir();
			if (textDir == 'contextual') {
				this.connect(this.hintMsg, "onkeyup", dojo.hitch(this, function() {
					var dir = BidiUtils.calculateDirForContextual(this.hintMsg.value);
					dojo.attr(this.hintMsg, "dir", dir);
				}));
			} else {
				dojo.attr(this.hintMsg, "dir", textDir);
			}
		}
		
		this.connect(this.hintMsg, "onkeypress", dojo.hitch(this, "onKeyPress", null, null));
		this.connect(this.listInput, "onkeypress", dojo.hitch(this, "onListInputKeyPress"));
		
		dojo.removeClass(this.input1Date._buttonNode, "dijitArrowButton");
		dojo.removeClass(this.input2Date._buttonNode, "dijitArrowButton");
		
		dojo.addClass(this.input1Date._buttonNode.firstChild, "dateButton");
		dojo.addClass(this.input2Date._buttonNode.firstChild, "dateButton");
		dojo.setAttr(this.input1Date._buttonNode.firstChild, "style", "margin-top:6px !important; height: 16px !important;padding-right: 3px !important;");
		dojo.setAttr(this.input2Date._buttonNode.firstChild, "style", "margin-top:6px !important; height: 16px !important;padding-right: 3px !important;");
		
		this.connect(this.input1Date._buttonNode.firstChild, "onmouseover", dojo.hitch(this, function(){
			dojo.addClass(this.input1Date._buttonNode.firstChild, "dateButtonHovered");
			dojo.removeClass(this.input1Date._buttonNode.firstChild, "dateButton");
		}));
		this.connect(this.input2Date._buttonNode.firstChild, "onmouseover", dojo.hitch(this, function(){
			dojo.addClass(this.input2Date._buttonNode.firstChild, "dateButtonHovered");
			dojo.removeClass(this.input2Date._buttonNode.firstChild, "dateButton");
		}));
		
		this.connect(this.input1Date._buttonNode.firstChild, "onmouseout", dojo.hitch(this, function(){
			dojo.removeClass(this.input1Date._buttonNode.firstChild, "dateButtonHovered");
			dojo.addClass(this.input1Date._buttonNode.firstChild, "dateButton");
		}));
		this.connect(this.input2Date._buttonNode.firstChild, "onmouseout", dojo.hitch(this, function(){
			dojo.removeClass(this.input2Date._buttonNode.firstChild, "dateButtonHovered");
			dojo.addClass(this.input2Date._buttonNode.firstChild, "dateButton");
		}));
		
		this.input1Date.displayMessage = dojo.hitch(this, function(){});
		this.input2Date.displayMessage = dojo.hitch(this, function(){});
		this.input1Date.isValid = dojo.hitch(this, function(){return true;});
		this.input2Date.isValid = dojo.hitch(this, function(){return true;});
		
		dojo.addClass(this.input1Date.textbox, "validationInput");
		dojo.addClass(this.input2Date.textbox, "validationInput");
		dojo.style(this.input1Date.textbox, "line-height", "28px");
		dojo.style(this.input2Date.textbox, "line-height", "28px");
		dojo.style(this.input1Date.textbox.nextSibling, "line-height", "28px");
		dojo.style(this.input2Date.textbox.nextSibling, "line-height", "28px");
		dojo.style(this.input1Date.textbox, "padding", "0px");
		dojo.style(this.input2Date.textbox, "padding", "0px");
		
		dojo.addClass(this.validation_type._buttonNode, "validationDropBtn");
		dojo.addClass(this.validation_type.focusNode, "validationFocus");
		dojo.addClass(this.validation_type.containerNode, "validationDropCon");
		dojo.style(this.validation_type.containerNode.nextSibling, "float", BidiUtils.isGuiRtl() ? "left" : "right");
		dojo.style(this.validation_type.containerNode.nextSibling, "marginTop", "6px");
		dojo.style(this.validation_type.containerNode.nextSibling.nextSibling, "float", BidiUtils.isGuiRtl() ? "left" : "right");
		dojo.style(this.validation_type.containerNode.nextSibling.nextSibling, "marginTop", "6px");
		dojo.addClass(this.ok.domNode.firstChild, "dvButtonInner");
		dojo.addClass(this.remove.domNode.firstChild, "dvButtonInner");
		dojo.addClass(this.cancel.domNode.firstChild, "dvButtonInner");

		if (BidiUtils.isGuiRtl()) {
			dojo.style(this.buttonContainer, "textAlign", "left");
		}		
		this.cancel.domNode.firstChild.setAttribute("style", "border: 0px solid !important; background-color: #FFFFFF !important; box-shadow: none !important;");
		this.remove.domNode.firstChild.setAttribute("style", "border: 0px solid !important; box-shadow: none !important; background-color: #FFFFFF !important; color: #aaaaaa !important;");
		this.ok.domNode.firstChild.setAttribute("style", "border: 0px solid !important; box-shadow: none !important; background-color: #FFFFFF !important; color: #aaaaaa !important;");
		
		this.connect(this.addItemBtn, "onmousedown", dojo.hitch(this, "_addListItem"));
		
		this.connect(this.addItemBtn, "onmouseover", dojo.hitch(this, function(){
			dojo.addClass(this.addItemBtn,"addItemBtnSelected");
		}));
		this.connect(this.addItemBtn, "onmouseout", dojo.hitch(this, function(){
			dojo.removeClass(this.addItemBtn,"addItemBtnSelected");
		}));
	
		this.connect(this.addItemBtn, "onfocus", dojo.hitch(this, function(){
			dojo.addClass(this.addItemBtn,"btnFocused");
		}));
		this.connect(this.addItemBtn, "onblur", dojo.hitch(this, function(){
			dojo.removeClass(this.addItemBtn,"btnFocused");
		}));
				
		this.connect(this.addItemBtn, "onkeydown", dojo.hitch(this, this._addListItemKeyHanlder));
		this.connect(this.validation_type.focusNode, "onkeydown", dojo.hitch(this, this._dropDownKeyHanlder));
		this.connect(this.ok.focusNode, "onkeydown", dojo.hitch(this, this._btnKeyHanlder));
		this.connect(this.remove.focusNode, "onkeydown", dojo.hitch(this, this._btnKeyHanlder));
		this.connect(this.cancel.focusNode, "onkeydown", dojo.hitch(this, this._btnKeyHanlder));
		
		dijit.setWaiState(this.validation_type.focusNode,"label",this.nls.dvType);
		
		this.input2Date.set('placeholder', this.nls.max);
	},
	
	show: function(){
		dojo.style(this.pane,"display", "");
		setTimeout(dojo.hitch(this.validation_type, "focus"),500);
		this.setLocale(this.parent.getLocale());
	},
	
	hide: function(){
		dojo.style(this.pane,"display", "none");
	},
	
	disableBtn: function(disable, widget)
	{
		if(disable){
			dojo.removeClass(widget.domNode, "dvButton");
			dojo.addClass(widget.domNode, "dvButtonCancel");
			dojo.style(widget.domNode.firstChild, "color", "");
			var oriStyle = dojo.attr(widget.domNode.firstChild, "style");
			dojo.setAttr(widget.domNode.firstChild, "style", oriStyle + "color: #aaaaaa !important");
		}
		else{
			dojo.removeClass(widget.domNode, "dvButtonCancel");
			dojo.addClass(widget.domNode, "dvButton");
			dojo.style(widget.domNode.firstChild, "color", "");
		}
	},
	
	reset: function()
	{
		if(this.conDropDown)
			this.conDropDown.set("label", this.nls[this.conditions[0]]);
		if(this.conDropDownDate)
			this.conDropDownDate.set("label", this.nls[this.conditionsDate[0]]);
				
		this.input1.value = "";
		this.input2.value = "";
		this.input1Date.setDisplayedValue("");
		this.input2Date.setDisplayedValue("");
		this.hintMsg.value = "";
		this.listInput.value = "";
		
		this._hideError(this.input1, this.value1_error);
		this._hideError(this.input2, this.value2_error);
		this._hideError(this.input1Date, this.value1_error);
		this._hideError(this.input2Date, this.value2_error);
		this._hideError(this.listInput, this.list_error);
		
		var listItems = this.listDiv.childNodes;
		for(var i = listItems.length - 1; i >=0 ; i --){
			var item = listItems[i];
			if(dojo.isIE)
				item.removeNode(true);
			else
				item.remove();
		}
		if(this._list)
			this._list.length = 0;
		dojo.style(this.listContainer, "marginBottom", "0px");
	},
	
	resize: function(width, maxListHeight)
	{
		this._paneWidth = width;
		var listItems = this.listDiv.childNodes;
		dojo.style(this.listDiv, "maxHeight", maxListHeight + "px");
		if(width == "300"){
			dojo.style(this.pane, "marginLeft", "18px");
			dojo.style(this.pane, "marginRight", "18px");
			dojo.style(this.pane, "paddingLeft", "15px");
			dojo.style(this.pane, "paddingRight", "17px");
						
			dojo.style(this.input1, "width", "225px");
			dojo.style(this.input1Date, "width", "225px");
			dojo.style(this.input1Date.domNode, "width", "225px");
			dojo.style(this.input2, "width", "225px");
			dojo.style(this.input2Date, "width", "225px");
			dojo.style(this.input2Date.domNode, "width", "225px");
			dojo.style(this.hintMsg, "width", "225px");
			
			dojo.style(this.listInput, "width", "204px");
			
			dojo.style(this.validation_type._buttonNode, "width", "230px");
			dojo.style(this.validation_type.containerNode, "width", "212px");
			if(this.conDropDown)
				dojo.style(this.conDropDown._buttonNode, "width", "230px");
			if(this.conDropDownDate)
				dojo.style(this.conDropDownDate._buttonNode, "width", "230px");
			if(this.conDropDownText)
				dojo.style(this.conDropDownText._buttonNode, "width", "230px");
			
			for(var i = 0; i < listItems.length; i ++){
				var item = listItems[i];
				dojo.style(item.firstChild, "maxWidth", "180px");
			}
		}else{
			dojo.style(this.pane, "marginLeft", "2.5px");
			dojo.style(this.pane, "marginRight", "2.5px");
			dojo.style(this.pane, "paddingLeft", "8px");
			dojo.style(this.pane, "paddingRight", "10px");
			
			dojo.style(this.input1, "width", "195px");
			dojo.style(this.input1Date.domNode, "width", "195px");
			dojo.style(this.input2, "width", "195px");
			dojo.style(this.input2Date.domNode, "width", "195px");
			dojo.style(this.hintMsg, "width", "195px");
			
			dojo.style(this.listInput, "width", "174px");
			
			dojo.style(this.validation_type._buttonNode, "width", "200px");
			dojo.style(this.validation_type.containerNode, "width", "182px");
			if(this.conDropDown)
				dojo.style(this.conDropDown._buttonNode, "width", "200px");
			if(this.conDropDownDate)
				dojo.style(this.conDropDownDate._buttonNode, "width", "200px");
			if(this.conDropDownText)
				dojo.style(this.conDropDownText._buttonNode, "width", "200px");
			for(var i = 0; i < listItems.length; i ++){
				var item = listItems[i];
				dojo.style(item.firstChild, "maxWidth", "150px");
			}
		}
	},
	
	_typeChanged: function(type)
	{
		this.type = type;
		this._hideError(this.input1, this.value1_error);
		this._hideError(this.input2, this.value2_error);
		this._hideError(this.input1Date, this.value1_error);
		this._hideError(this.input2Date, this.value2_error);

		if(type == "rangeList"){
			this.input1.placeholder = this.nls.source;
			this.input1.title = this.nls.source;
		}else if(type == "custom"){
			this.input1.placeholder = this.nls.formula;
			this.input1.title = this.nls.formula;
		}
		
		switch(type){
		case "none":
			this._createConditionWidget(null);
			this.operator = null;
			this._showValueInputs("none","none");
			break;
		case "whole":
		case "decimal":
		case "time":
		case "textLength":
			this._createConditionWidget(this.conditions);
			break;
		case "date":
			this._createConditionWidget(this.conditionsDate);
			break;
		case "itemList":
			this._createWidgetsForList();
			break;
		case "rangeList":
		case "custom":
			this._createConditionWidget(null);
			this.operator = null;
			this._showValueInputs("","none");
			break;
		default:
			break;
		}
		this.updateOKBtn();
	},
	
	_createWidgetsForList: function()
	{
		this._createConditionWidget(null);
		this.operator = null;
		this._showValueInputs("none","none");
		dojo.style(this.listContainer, "display", "");
	},
	
	_createConditionWidget: function(conList)
	{
		if(this.optList == conList)
			return;
		
		this.optList = conList;
		
		if(this.currConDropDown){
			if(dojo.isIE)
				this.currConDropDown.domNode.removeNode(true);
			else
				this.currConDropDown.domNode.remove();
			this.currConDropDown = null;
		}
		if(conList == null)
			return;
				
		if(conList == this.conditions){
			if(this.conDropDown == null)
				this.conDropDown = this._createConDropDown(conList);
			else{
				var con = this._getCurrentCon(this.conditions, this.conDropDown.label);
				this._conditonChanged(con);
			}
			this.currConDropDown = this.conDropDown;
		}else if(conList == this.conditionsDate){
			if(this.conDropDownDate == null)
				this.conDropDownDate = this._createConDropDown(conList);
			else{
				var con = this._getCurrentCon(this.conditionsDate, this.conDropDownDate.label);
				this._conditonChanged(con);
			}
			this.currConDropDown = this.conDropDownDate;
		}
		this.currConDropDown.placeAt(this.validation_details, "first");
		//TODO: default selected, show back and reset operator, value1, value2
	},
	
	//Get the selected condition
	_getCurrentCon: function(conList, label)
	{
		for(var i = 0; i < conList.length; i ++)
		{
			var con = conList[i];
			if(this.nls[con] == label)
				return con;
		}
	},
	
	_createConDropDown: function(conList)
	{
		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
		var dropDown = new dijit.Menu({dir: dirAttr});
		var conDropDown = new dijit.form.DropDownButton({
			dropDown : dropDown,
			title: this.nls.dvOperator,
			dir: dirAttr
		});
		for(var i = 0; i < conList.length; i ++)
		{
			var con = conList[i];
			var item = new dijit.MenuItem({label:this.nls[con], dir: dirAttr});
			dijit.setWaiState(item.domNode,"label",this.nls[con]);
			
			this.connect(item,"onClick", dojo.hitch(this,function(con)
			{
				this.currConDropDown.setLabel(this.nls[con]);
				this._conditonChanged(con);
			},con));
			
			dropDown.addChild(item);
		}
		dojo.style(conDropDown.domNode, "margin-bottom", "20px");
		if(this._paneWidth  == "300"){
			dojo.style(conDropDown._buttonNode, "width", "230px");
		}else{
			dojo.style(conDropDown._buttonNode, "width", "200px");
		}

		dojo.style(conDropDown.containerNode.nextSibling, "float", BidiUtils.isGuiRtl() ? "left" : "right");
		dojo.style(conDropDown.containerNode.nextSibling, "marginTop", "6px");
		dojo.style(conDropDown.containerNode.nextSibling.nextSibling, "float", BidiUtils.isGuiRtl() ? "left" : "right");
		dojo.style(conDropDown.containerNode.nextSibling.nextSibling, "marginTop", "6px");
		dojo.addClass(conDropDown._buttonNode, "validationDropBtn");
		dojo.addClass(conDropDown.focusNode, "validationFocus");
		dojo.addClass(conDropDown.containerNode, "validationDropCon");
		conDropDown.setLabel(this.nls[conList[0]]);
		this.connect(dropDown,"onOpen", dojo.hitch(this,"_dropDownOpen", conDropDown));
		this._conditonChanged(conList[0]);
		
		dijit.setWaiState(conDropDown.focusNode,"label",this.nls.dvOperator);
		this.connect(conDropDown.focusNode, "onkeydown", dojo.hitch(this, this._dropDownKeyHanlder));
		return conDropDown;
	},	

	_dropDownOpen: function(dropDownButton)
	{
		var dropDown = dropDownButton.dropDown;
		var value = dropDownButton.label;
		var children = dropDown.getChildren();
		for(var i = 0; i < children.length; i++){
			if(children[i].label == value){
				setTimeout(dojo.hitch(dropDown, "focusChild", children[i]),100);
				break;
			}
		}
	},
	
	_conditonChanged: function(condition)
	{
		this.operator = condition;
		switch(condition){
		case "bet":
		case "notBet":
			this._showValueInputs("", "");
			this.input1.placeholder = this.nls.min;
			this.input1.title = this.nls.min;
			this.input1Date.set('placeholder', this.nls.min);
			this.input1Date.set('title', this.nls.min);
			break;
		case "equal":
		case "notEqual":
		case "greater":
		case "greaterEqual":
		case "less":
		case "lessEqual":
		case "before":
		case "onBefore":
		case "after":
		case "onAfter":
			this._showValueInputs("", "none");
			this.input1.placeholder = this.nls.criValue;
			this.input1.title = this.nls.criValue;
			this.input1Date.set('placeholder', this.nls.criValue);
			this.input1Date.set('title', this.nls.criValue);
			break;
		default:
			break;
		}
		this.updateOKBtn();
	},
		
	_showValueInputs: function(input1, input2)
	{
		dojo.style(this.listContainer, "display", "none");
		if(this.type == "date"){
			dojo.style(this.input1, "display", "none");
			dojo.style(this.input2, "display", "none");
			dojo.style(this.input1Date.domNode, "display", input1);
			dojo.style(this.input2Date.domNode, "display", input2);
			dojo.style(this.input1Container, "display", input1);
			dojo.style(this.input2Container, "display", input2);
		}else{
			dojo.style(this.input1Date.domNode, "display", "none");
			dojo.style(this.input2Date.domNode, "display", "none");
			dojo.style(this.input1, "display", input1);
			dojo.style(this.input2, "display", input2);
			dojo.style(this.input1Container, "display", input1);
			dojo.style(this.input2Container, "display", input2);
		}
	},
		
	isEditingRef: function()
	{
		return document.activeElement == this.input1 || document.activeElement == this.input2
		|| document.activeElement == this.input1Date.textbox || document.activeElement == this.input2Date.textbox;
	},
	
	_btnKeyHanlder: function(e)
	{
		e = e || window.event;
		if (e.keyCode == dojo.keys.ESCAPE)
			this.parent.onCancel();
	},
	
	_dropDownKeyHanlder: function(e)
	{
		e = e || window.event;
		if (e.keyCode == dojo.keys.ESCAPE)
			this.parent.onCancel();
	},
	
	_addListItemKeyHanlder:  function(e)
	{
		e = e || window.event;
		if (e.keyCode == dojo.keys.ENTER || e.keyCode == dojo.keys.SPACE)
			this._addListItem();		
		else if (e.keyCode == dojo.keys.ESCAPE)
			this.parent.onCancel();
	},
	
	_addListItem: function()
	{
		if(this._list == null)
			this._list = [];
		var val = this.listInput.value;
		if(val === ""){
			setTimeout(dojo.hitch(this.listInput, "focus"),100);
			return;
		}
		this._hideError(this.listInput, this.list_error);
		var idx = this._list.length;
		if(idx == 0){
			dojo.style(this.listContainer, "marginBottom", "14px");
			this.disableBtn(false, this.ok);
		}
		var currListLen = this._list.join(",").length;
		if (val.length + currListLen > 254) {
			this._showError(this.listInput, this.list_error);
		} else {
			this._list.push(val);
			this._createListItem(val);

			this.listInput.value = "";
		}

		setTimeout(dojo.hitch(this.listInput, "focus"),100);
	},
	
	_createListItem: function(val)
	{
		val = websheet.Helper.escapeXml(val);
		var label = dojo.create("div",{'class': "dvListItem"}, this.listDiv);
		var item = dojo.create("div", {'innerHTML':val, 'style':'display:inline-flex; overflow:hidden; height: 18px'}, label);
		if(this._paneWidth  == "300"){
			dojo.style(item, "maxWidth", "180px");
		}else{
			dojo.style(item, "maxWidth", "150px");
		}
		
		var str = dojo.string.substitute(this.nls.removeItem,[val]);
		var delItem = dojo.create("div",{'class': "dvDelItem", 'tabindex':'0', 'title' : str, 'aria-label': str,'alt': str, 'role':'button'}, label);
		this.connect(delItem, "onkeydown", dojo.hitch(this, this._delListItemKeyHanlder, label));
		this.connect(delItem, "onmousedown", dojo.hitch(this, "_delListItem", label));
		this.connect(delItem, "onmouseover", dojo.hitch(this, function(){
			dojo.addClass(delItem,"dvDelItemHovered");
		}));
		this.connect(delItem, "onmouseout", dojo.hitch(this, function(){
			dojo.removeClass(delItem,"dvDelItemHovered");
		}));
		
		var altText = dojo.create('div',{innerHTML: 'X'},delItem);
		dojo.addClass(altText,'ll_DV_image_alttext'); 
	},
	
	_delListItemKeyHanlder: function(delItem, e){
		e = e || window.event;
		if (e.keyCode == dojo.keys.ENTER || e.keyCode == dojo.keys.SPACE)
			this._delListItem(delItem);
		else if (e.keyCode == dojo.keys.ESCAPE)
			this.parent.onCancel();
	},
	
	_delListItem: function(delItem)
	{
		var idx = 0;
		var items = this.listDiv.childNodes;
		for(;idx < items.length; idx++){
			if(items[idx] == delItem)
				break;
		}
		this._list.splice(idx, 1);
		
		var next = delItem.nextSibling;
		var pre = delItem.previousSibling;
		if(dojo.isIE)
			delItem.removeNode(true);
		else
			delItem.remove();
		if(this._list.length == 0){
			dojo.style(this.listContainer, "marginBottom", "0px");
			this.disableBtn(true, this.ok);
		}

		if(next)
			next.lastChild.focus();
		else if(pre)
			pre.lastChild.focus();
		else
			this.listInput.focus();
	},
	
	_inputCheck: function(noCheck)
	{
		if(dojo.style(this.ref_error, "display") != "none")
			return false;
		if(this.type == "itemList"){
			if(!this._list || this._list.length == 0)
				return false;
		}else{
			if(noCheck != "value1" && dojo.style(this.input1Container, "display") != "none"){
				if(this.type == "date"){
					if(dojo.trim(this.input1Date.displayedValue).length == 0)
						return false;
				}else{
					if(dojo.trim(this.input1.value).length == 0)
						return false;
				}
				var v1Valid = this._checkValue1();
				if(!v1Valid)
					return v1Valid;
			}
			if(noCheck != "value2" && dojo.style(this.input2Container, "display") != "none"){
				if(this.type == "date"){
					if(dojo.trim(this.input2Date.displayedValue).length == 0)
						return false;
				}else{
					if(dojo.trim(this.input2.value).length == 0)
						return false;
				}
				return v1Valid = this._checkValue2();
			}
		}
		
		return true;
	},
	
	setLocale: function(locale)
	{
		this.input1Date.constraints.locale = locale;
		this.input2Date.constraints.locale = locale;
	},
	
	_checkValue1: function()
	{
		if(this.type == "date"){
			var val = this.input1Date.value;
			if(val && (typeof val == "object" && val.toString() != "Invalid Date"))
				this.value1 = this._parseDate(val);
			else
				this.value1 = this._parseValue(this.input1Date.displayedValue);
		}
		else
			this.value1 = this._parseValue(this.input1.value);
		if(this.value1 == null){
			this.value1_error.innerHTML = this._getTypeString();
			if(this.type == "date")
				this._showError(this.input1Date, this.value1_error);
			else
				this._showError(this.input1, this.value1_error);
			return false;
		}else{
			if(this.type == "date"){
				this._hideError(this.input1Date, this.value1_error);
				if(typeof this.value1 == "number")
					this.input1Date.setDisplayedValue(this._formatDate(this.value1));
			}
			else
				this._hideError(this.input1, this.value1_error);
			return true;
		}
	},
	
	_checkValue2: function()
	{
		if(this.type == "date"){
			var val = this.input2Date.value;
			if(val && (typeof val == "object" && val.toString() != "Invalid Date"))
				this.value2 = this._parseDate(val);
			else
				this.value2 = this._parseValue(this.input2Date.displayedValue);
		}
		else
			this.value2 = this._parseValue(this.input2.value);
		if(this.value2 == null){
			this.value2_error.innerHTML = this._getTypeString();
			if(this.type == "date")
				this._showError(this.input2Date, this.value2_error);
			else
				this._showError(this.input2, this.value2_error);
			return false;
		}else{
			if(this.type == "date"){
				this._hideError(this.input2Date, this.value2_error);
				if(typeof this.value2 == "number")
					this.input2Date.setDisplayedValue(this._formatDate(this.value2));
			}
			else
				this._hideError(this.input2, this.value2_error);
			return true;
		}
	},
	
	_parseDate: function(dateVal)
	{
		var date = new Date(dateVal);
		var fValue = websheet.Helper.getSerialNumberWithDate(date);
		return fValue;
	},
	
	updateOKBtn: function(noCheck)
	{
		if(this._inputCheck(noCheck))
			this.disableBtn(false, this.ok);
		else
			this.disableBtn(true, this.ok);
	},
	
	_value1Change: function()
	{
		if(this._checkValue1())
			this.updateOKBtn("value1");
		else
			this.disableBtn(true, this.ok);
	},
	
	_value2Change: function()
	{
		if(this._checkValue2())
			this.updateOKBtn("value2");
		else
			this.disableBtn(true, this.ok);
	},
	
	_getTypeString: function()
	{
		switch(this.type){
		case "whole":
			return this.nls.wholeAlert;
		case "decimal":
			return this.nls.decimalAlert;
		case "textLength":
			return this.nls.textAlert;
		case "time":
			return this.nls.timeAlert;
		case "date":
			return this.nls.dateAlert;
		case "rangeList":
			return this.nls.rangeAlert;
		case "custom":
			return this.nls.formulaAlert;
		default:
			break;
		}
		return "";
	},
	
	_showError: function(input, errorWidget){
		dojo.style(errorWidget, "display", "");
		if(!input)
			return;
		if(input.domNode)
			dojo.style(input.domNode, "borderColor", "#e71d32");
		dojo.style(input, "borderColor", "#e71d32");
	},
	
	_hideError: function(input, errorWidget){
		dojo.style(errorWidget, "display", "none");
		if(!input)
			return;
		if(input.domNode)
			dojo.style(input.domNode, "borderColor", "");			
		else
			dojo.style(input, "borderColor", "");
		
	},
	
	onListInputKeyPress : function(e)
	{
		e = e || window.event;		
		if (e.altKey || e.ctrlKey || e.metaKey) return;
		if (e.keyCode == dojo.keys.ENTER)
			this._addListItem();
		if (e.keyCode == dojo.keys.ESCAPE)
			this.parent.onCancel();
	},
	
	onKeyPress: function(input, warning, e)
	{
		e = e || window.event;
		
		if (e.altKey || e.ctrlKey || e.metaKey) return;
		if (e.keyCode == dojo.keys.ENTER)
			this.parent.onOK();
		if (e.keyCode == dojo.keys.ESCAPE)
			this.parent.onCancel();
		else if(e.keyCode != dojo.keys.TAB && warning)
			this._hideError(input, warning);
	},
	
	_getConByOperator: function(type, operator)
	{
		var map = (type == "date") ? this.dataOperatorMap : this.operatorMap;		
		for(var key in map){
			if(map[key] == operator)
				return key;
		}
		return operator;
	},
	
	//return the value fo json. return null if the value is invalid
	_parseValue: function(value)
	{	
		if(!value || value.length == 0)
			return null;
		if(value.indexOf("=") == 0){//parse formula			
			parseTokenResult = websheet.parse.FormulaParseHelper.parseFormula(value, false, null, /*bLocaleSensitive*/true);
			if (parseTokenResult.error) {
				return null;
			}
			if(!this.parent.validateRefs(parseTokenResult, this.type == "rangeList"))
				return null;
			if(this.type == "rangeList"){
				var token = parseTokenResult.tokenTree;
				if(token.getTokenType() == websheet.parse.tokenType.RANGEREF_TOKEN ||
						token.getTokenType() == websheet.parse.tokenType.NAME)
					return parseTokenResult.formula.substring(1);
				else
					return null;
			}
			return parseTokenResult.formula.substring(1);
		}else if(this.type == "rangeList")
			return null;
		
		var parseResult = websheet.i18n.numberRecognizer.parse(value, false, true);
		switch(this.type){
		case "whole":
			if(!parseResult.isNumber)
				return null;
			if(!websheet.Helper.isInt(parseResult.fValue))
				return null;
			return this._fixNumber(parseResult.fValue);
			break;
		case "textLength":
			if(!parseResult.isNumber)
				return null;
			if(!websheet.Helper.isInt(parseResult.fValue))
				return null;
			if(parseResult.fValue < 0)
				return null;
			return this._fixNumber(parseResult.fValue);
			break;
		case "decimal":
			if(!parseResult.isNumber)
				return null;
			return this._fixNumber(parseResult.fValue);
			break;
		case "time":
			if(!parseResult.isNumber)
				return null;
			if(this._isValidaTime(parseResult.fValue))
				return this._fixNumber(parseResult.fValue);
			return null;
			break;
		case "date":
			if(!parseResult.isNumber)
				return null;
			if(this._isValidateDate(parseResult.fValue))
				return this._fixNumber(parseResult.fValue);
			return null;
			break;
		case "custom":
			if(parseResult.formatType == websheet.Constant.FormatType.BOOLEAN)
				return websheet.model.ModelHelper.intToBoolean(parseResult.fValue).toString();
			if(parseResult.isNumber)
				return this._fixNumber(parseResult.fValue);
			return '"' + value + '"';
			break;
		default:
			break;
		}
	},
	
	_fixNumber: function(v)
	{
		return parseFloat(v.toPrecision(15));
	},
	
	_isValidaTime: function(value)
	{
		if(typeof value != "number")
			return false;
		if(value < 0 || value >= 1)
			return false;
		return true;
	},
	
	_isValidateDate: function(value)
	{
		if(typeof value != "number")
			return false;
		var snMax = websheet.baseDateStr == websheet.Constant.baseDateStr ? 2958465 : 2957003;// sn for 9999-12-31 this.getSerialNumberWithYMD(9999,11,31);
		var snMin = 0 ;  //0 is sn for 1899-12-30   this.getSerialNumberWithYMD(1899,11,30);
		if(value >=snMax+1 || value <snMin)
			return false;
		return true;
	},
	
	_formatDate: function(value)
	{
		var fmt = {code:"short", cat: "date"};
		var formatter = websheet.i18n.Number;
		return formatter.formatDate(value, fmt);
	},
	
	_formatTime: function(value)
	{
		fmt = {code: "medium", cat: "time"};
		var formatter = websheet.i18n.Number;
		return formatter.formatTime(value, fmt);
	},
	
	getRefValue: function()
	{
		if(dojo.style(this.ref_error, "display") != "none")
			return null;
		else
			return this.refAddr;
	},
	
	updateRef: function(address)
	{
		this.refAddr = address;
		if (BidiUtils.isBidiOn()) {
			var splits = address.split("!");
			splits[0] = BidiUtils.addEmbeddingUCC(splits[0]);
			this.refValue.innerHTML = splits.join("!");
		}
		else
			this.refValue.innerHTML = address;

		var parsedRef = websheet.Helper.parseRef(address);
		if(parsedRef.isValid()){
			this._hideError(null, this.ref_error);
			this.disableBtn(false, this.remove);
		}
		else{
			this._showError(null, this.ref_error);
			this.disableBtn(true, this.remove);
		}
		this.updateOKBtn();
	},
	
	getState: function()
	{
		if(dojo.style(this.ref_error, "display") != "none")
			return null;
		if(dojo.style(this.input1Container, "display") != "none")
			this._checkValue1();
		if(dojo.style(this.input2Container, "display") != "none"){
			this._checkValue2();
		}
		
		if(dojo.style(this.input1Container, "display") != "none" && dojo.style(this.value1_error, "display") != "none")
			return null;
		if(dojo.style(this.input2Container, "display") != "none" && dojo.style(this.value2_error, "display") != "none")
			return null;
		
		if((this.operator == "bet" || this.operator == "notBet") && typeof this.value1 == "number" && typeof this.value2 == "number" && this.value2 < this.value1){
			this.value2_error.innerHTML = this._getTypeString();
			if(this.type == "date")
				this._showError(this.input2Date, this.value2_error);
			else
				this._showError(this.input2, this.value2_error);
			this.disableBtn(true, this.ok);
			return null;
		}
		
		if(this.type == "itemList" && (!this._list || this._list.length == 0 || this._list.join(",").length > 255)){
			this._showError(this.listInput, this.list_error);
			return null;
		}
		
		var json = {};
		var criteria = {};
		criteria.type = this.type;
		if(this.type == "itemList" || this.type == "rangeList")
			criteria.type = "list";			
		
		if(this.type != "none"){
			criteria.operator = this.operatorMap[this.operator];
			if(this.type == "itemList")
				criteria.value1 = '"' +  this._list.join(",") + '"';
			else
				criteria.value1 = this.value1;
		}
		if(this.operator == "bet" || this.operator == "notBet")
			criteria.value2 = this.value2;
		
		var prompt = dojo.trim(this.hintMsg.value);
		if(prompt != "")
			criteria.prompt = prompt;
		
		json.criteria = criteria;
		json.refValue = this.refAddr;
		return json;
	},
	
	setState: function(refValue, dvJson)
	{
		this.updateRef(refValue);
		if(!dvJson){
			this._typeChanged("none");
			this.validation_type.set("label", this.nls["none"]);
			return;
		}
		
		var criteria = dvJson.criteria;
		
		if(criteria.value1 != null)
			var value1Type = criteria.value1 != null ? websheet.Helper.parseValue(criteria.value1) : null;
			
		var type = criteria.type;
		if(criteria.type == "list"){
			if(value1Type == websheet.Constant.valueType.STRING)
				type = "itemList";
			else
				type = "rangeList";
		}
		
		this._typeChanged(type);
		this.validation_type.set("label", this.nls[type]);
		
		if(criteria.operator && this.currConDropDown && criteria.type != "list" && criteria.type != "custom"){
			var con = this._getConByOperator(type, criteria.operator);
			this._conditonChanged(con);
			this.currConDropDown.set("label", this.nls[con]);
		}
		if(criteria.value1 != null){
			if(value1Type ==  websheet.Constant.valueType.FORMULA && criteria.value1.indexOf("=") != 0)
				criteria.value1 = "=" + criteria.value1;
			if(type == "itemList"){
				var tmpV = criteria.value1.substring(1,criteria.value1.length -1);
				var list = tmpV.split(",");
				for(var i = list.length - 1; i >= 0; i --){
					list[i] = dojo.trim(list[i]);
					if(list[i] === "")
						list.splice(i,1);
				}
				this._list = list;
				for(var i = 0; i < list.length; i ++)
				{
					if(i == 0)
						dojo.style(this.listContainer, "marginBottom", "14px");
					this._createListItem(list[i]);
				}
			}
			else if(this.type == "date"){
				var val = value1Type ==  websheet.Constant.valueType.NUMBER ? this._formatDate(criteria.value1) : criteria.value1;
				this.input1Date.setDisplayedValue(val);
			}else if(this.type == "time"){
				var val = value1Type ==  websheet.Constant.valueType.NUMBER ? this._formatTime(criteria.value1) : criteria.value1;
				this.input1.value = val;
			}else{
				if(value1Type == websheet.Constant.valueType.STRING && criteria.value1.indexOf('"') == 0 && criteria.value1.lastIndexOf('"') == criteria.value1.length - 1)
					this.input1.value = criteria.value1.substring(1,criteria.value1.length -1);
				else
					this.input1.value = criteria.value1;
			}
		}
		if(criteria.value2 != null){
			var value2Type = websheet.Helper.parseValue(criteria.value2);
			if(value2Type ==  websheet.Constant.valueType.FORMULA && criteria.value2.indexOf("=") != 0)
				criteria.value2 = "=" + criteria.value2;
			if(this.type == "date"){
				var val = value2Type ==  websheet.Constant.valueType.NUMBER ? this._formatDate(criteria.value2) : criteria.value2;
				this.input2Date.setDisplayedValue(val);
			}else if(this.type == "time"){
				var val = value2Type ==  websheet.Constant.valueType.NUMBER ? this._formatTime(criteria.value2) : criteria.value2;
				this.input2.value = val;
			}else{
				this.input2.value = criteria.value2;
			}
		}
		
		if(criteria.prompt)
			this.hintMsg.value = criteria.prompt;
		this.disableBtn(false, this.ok);
	}
});