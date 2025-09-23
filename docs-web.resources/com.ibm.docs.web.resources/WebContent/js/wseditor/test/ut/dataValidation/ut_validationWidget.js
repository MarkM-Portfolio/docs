dojo.provide("websheet.tests.ut.dataValidation.validationWidget");

dojo.require("websheet.DataValidation.DataValidationHandler");
dojo.require("websheet.DataValidation.ValidationPane");
dojo.require("websheet.DataValidation.ValidationWidget");
dojo.require("websheet.DataValidation.ValidationWarning");

describe("websheet.tests.ut.dataValidation.ut_validationWidget", function()
{
	var locale = "en-us";
	dojo.setObject("pe.scene.getLocale", function(){
		return locale;
	});
	dojo.setObject("websheet.Main.scene", pe.scene);
	dojo.setObject("pe.scene.setLocale", function(value){
		if(locale != value){
			locale = value;
		}
	});
	dojo.setObject("contextPath", "/docs");
	dojo.setObject("window.staticRootPath", "/static");
	dojo.setObject("BidiUtils.isGuiRtl", function(){
		return false;
	});
	pe.scene.editor =  websheet.Main;
	var _document = new websheet.model.Document();
	_document._createSheet("Sheet1", "os1", 1);	
	var broadcaster = new websheet.listener.BroadCaster();
	websheet.Constant.init();
	websheet.functions.Formulas.init();
	var areaMgr = _document.getAreaManager(broadcaster);
	var dvHandler, validationPane;
	beforeEach(function() {
		utils.bindDocument(_document);
		dvHandler = new websheet.DataValidation.DataValidationHandler(websheet.Main);
		var mainNode = dojo.byId("mainNode");
		var vNode = dojo.create("div",{id: "validation_sidebar_div"}, mainNode);
		validationPane = new websheet.DataValidation.ValidationPane(vNode,dvHandler);
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it("validation handler", function() {
		dvHandler._validationPane = validationPane;
		dvHandler.setLocalDirty();
		dvHandler.isEditing();
		dvHandler.isPandShowing();
		dvHandler.currAddress = "Sheet1!A3";
		dvHandler.rangePicked();
	});
	
	it("validation pane", function() {
		var okCallback = dojo.hitch(dvHandler, "_setValidation");
		var removeCallback = dojo.hitch(dvHandler, "_removeValidation");
		validationPane.init(dvHandler, okCallback, removeCallback);
		validationPane.isCollapsed();		
		
		validationPane.open("sheet1!A1", {isMul: true});
		validationPane._warning.resize(300);
		validationPane.onRemoveAll();
		validationPane.onCancel();
		validationPane.toggle();
		
		validationPane.open("sheet1!#REF!", {isMul: true});
		validationPane.onCancel();
		
		validationPane.open("sheet1!A1", {json:{criteria:{operator:"between", prompt:"a b", type:"whole", value1:2, value2:"a"}}});
		
		
		validationPane.onOK();
		validationPane.onRemove();
		validationPane._focusedNode = validationPane._widget.input1;
		validationPane.selectionChanged(validationPane._widget.input1);
		validationPane.rangePicking("Sheet1!A1");
		
		validationPane.rangePicking("Sheet1!A2");
		
		validationPane.highlightRef(validationPane._widget.input1);
		
		validationPane.hideRangeViewer();
		
		validationPane.setLocalDirty();
		validationPane._seperator();
		
		validationPane.rangePicked();
		
		validationPane.updateRef("Sheet1!B1");		
		
		validationPane.isEditingRef();
	});
		
	it("validation widget", function() {
		var okCallback = dojo.hitch(dvHandler, "_setValidation");
		var removeCallback = dojo.hitch(dvHandler, "_removeValidation");
		validationPane.init(dvHandler, okCallback, removeCallback);
		validationPane._widget.resize(300, 500);
		
		validationPane._widget._btnKeyHanlder({keyCode: dojo.keys.ESCAPE});		
		validationPane._widget._dropDownKeyHanlder({keyCode: dojo.keys.ESCAPE});
		
		validationPane._widget._addListItemKeyHanlder({keyCode: dojo.keys.ENTER});
		validationPane._widget._addListItemKeyHanlder({keyCode: dojo.keys.SPACE});
		validationPane._widget._addListItemKeyHanlder({keyCode: dojo.keys.ESCAPE});
		
		validationPane._widget.onListInputKeyPress({altKey: true});
		validationPane._widget.onListInputKeyPress({keyCode: dojo.keys.ENTER});
		validationPane._widget.onListInputKeyPress({keyCode: dojo.keys.ESCAPE});
		
		validationPane.updateRef("Sheet1!B1");
		validationPane._widget.onKeyPress(validationPane._widget.input1, "nn", {altKey: true});
		validationPane._widget.onKeyPress(validationPane._widget.input1, null, {keyCode: dojo.keys.ENTER});
		validationPane._widget.onKeyPress(validationPane._widget.input1, null, {keyCode: dojo.keys.ESCAPE});
		
		validationPane._widget._value1Change();
		
		validationPane._widget._isValidaTime("aa");
		validationPane._widget._isValidaTime(2);
		validationPane._widget._isValidaTime(0.3);
		
		validationPane._widget._isValidateDate("aa");
		validationPane._widget._isValidateDate(2958467);
		validationPane._widget._isValidateDate(-1);
		validationPane._widget._isValidateDate(3);
		
		validationPane._widget._formatDate(3);
		validationPane._widget._formatTime(0.3);
		
		validationPane._widget._conditonChanged("equal");
		validationPane._widget._conditonChanged("");
		
		validationPane._widget.type = "date";
		validationPane._widget._showValueInputs("block", "none");
		
		validationPane._widget.listInput.value = "aa";
		validationPane._widget._addListItem();
		
		var delItem = validationPane._widget.listDiv.firstChild;
		validationPane._widget._delListItemKeyHanlder(delItem, {keyCode: dojo.keys.ENTER});
		validationPane._widget._delListItemKeyHanlder(delItem, {keyCode: dojo.keys.SPACE});
		validationPane._widget._delListItemKeyHanlder(delItem, {keyCode: dojo.keys.ESCAPE});
		
		validationPane._widget.setState("sheet1!A1", {criteria:{prompt:"a b", type:"list", value1:"\"a,b,cc,1\""}});
		validationPane._widget.getState();
		validationPane._widget.setState("sheet1!A1", {criteria:{prompt:"a b", operator:"between", type:"date", value1:"Sheet1!A3", value2:"a"}});
		validationPane._widget.getState();
		validationPane._widget._checkValue2();
		validationPane._widget._checkValue1();		
		
		validationPane._widget.type = "rangeList";
		validationPane._widget._parseValue("=Sheet1!A1");
		
		validationPane._widget.type = "textLength";
		validationPane._widget._parseValue("4");
		validationPane._widget._getTypeString();
		
		validationPane._widget.type = "decimal";
		validationPane._widget._parseValue("4");
		validationPane._widget._getTypeString();
		
		validationPane._widget.type = "time";
		validationPane._widget._parseValue("0.4");
		validationPane._widget._getTypeString();
		
		validationPane._widget.type = "date";
		validationPane._widget._parseValue("0.4");
		validationPane._widget._getTypeString();
		
		validationPane._widget.type = "custom";
		validationPane._widget._parseValue("true");
		validationPane._widget._getTypeString();
		
		validationPane._widget.type = "custom";
		validationPane._widget._parseValue("ab");
		
		validationPane._widget._parseValue("");
		
		validationPane._widget._createWidgetsForList();
		validationPane._widget._getCurrentCon(validationPane._widget.conditions, "between");
	});
	
	it("popupWarning", function() {
		var mainNode = dojo.byId("mainNode");
		var tmpNode = dojo.create("div", null, mainNode);
		var popupWarning = new websheet.widget.PopupIndicate({editor: this.editor, className : "redIndicate", value: "info"}, tmpNode);

		popupWarning.addStyle("width", "10px");
		popupWarning.isShow();
		popupWarning.close();
		popupWarning.hide();
	});
});