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

dojo.provide("websheet.widget.StatusBar");
dojo.require("websheet.listener.Listener");
dojo.require("websheet.Helper");
dojo.require("websheet.i18n.Number");
dojo.requireLocalization("websheet", "base");
dojo.declare("websheet.widget.StatusBar", [dijit._Widget, dijit._Templated, websheet.listener.Listener], {
	
	 templateString		:	"<div class='websheet-statusbar' dojoAttachPoint='focusNode,containerNode'></div>",
	 SELECTION_CHANGED	:	"SelectionChanged",
	 //default sequence, currently 6, up to 20 functions, (refer to 524287 in _createConfigMenu)
	 sequence			:	['AVERAGE', 'COUNTA', 'COUNT', 'MAX', 'MIN', 'SUM'],
	 //default, 				1		0			1		0		0		1 = >  100101
	 function_num		:	{
		 'AVERAGE'	:	101,
		 'COUNT'	:	102,
		 'COUNTA'	:	103,
		 'MAX'		:	104,
		 'MIN'		:	105,
		 'SUM'		:	109
	 },
	 //cached range
	 _cache		:	null,
	 _helper			:	websheet.parse.FormulaParseHelper,
	 //local storage key for the settings.
	 _key				:	'WS_STATUSBAR_CFG',
	 //view DOM nodes associated with the functions in sequence.
	 _viewItems			:	null,
	 //calculate values, structured in { function name : value}, while function name should be same with the names in sequence.
	 _values			:	null,
	 //998.12345(6.....)
	 _decimalPrecision	:	4,
	 _nls				:	null,
	 //for number format.
	 _formater			:	null,
	 //precision, significant figures 
	 _sigFigs			:	10, 
	 
	 //stop formula digest, if this enabled and nothing selected in config menu, 
	 _debug				:	true,
	 
	 postCreate: function()
	 {
		 this._nls = dojo.i18n.getLocalization("websheet", "base");
//		 if(this.editor.scene.isHTMLViewMode())
//		 {
//			 dojo.addClass(this.domNode, 'HTMLView');
//		 }
		 this._formater = websheet.i18n.Number;
		 this.relocate();
		 this._createInlineItems();//according to the 'sequence'
		 this._createConfigMenu();
		 this.startListening(this.editor.getController());
		 dojo.subscribe(this.SELECTION_CHANGED, this, '_calculate');
		 // for function_num map, use int token as the value
		 for(var funcName in this.function_num){
			 var num = this.function_num[funcName];
			 this.function_num[funcName] = this.newNumberToken(num);
		 }
//		 if (concord.util.browser.isMobile() || true) {
//			 if (!dojo.hasClass(this.domNode, "websheetMobile")) {
//				 dojo.addClass(this.domNode, "websheetMobile");
//			 }
//		 }
	 },
	 
	 newNumberToken: function(num){
		 var token = new websheet.parse.token();
		 token.setTokenType(websheet.parse.tokenType.NUMBER_TOKEN);
	     token.setValue(num);
	     token.setName(num);
	     return token;
	 },
	 
	 blockTrivialResults: function(cfg)
	 {
		 //Some results should not be displayed according to the selected content, apply the rules here,
		 //1. if there's only a single cell (non-empty) in the selected range, block all results,
		 if(this._values['COUNTA'] <= 1)
			 return (cfg & 0);
		 //2. if there're no numbers in the selected range, block the Math formulas like, AVERAGE, MAX, MIN, COUNT.
		 if(this._values['COUNT'] == 0)
		 {
			 var n = '';
			 for(var i = 0, len = this.sequence.length, func; i < len; i++) 
			 {
				 func = this.sequence[i];
				 if(func == 'AVERAGE' || func == 'MAX' || func == 'MIN' || func == 'SUM' || func == 'COUNT')
					 n = '0' + n;
				 else
					 n = '1' + n;
			 }
			 return (cfg & parseInt(n, 2));
		 }
		 return cfg;
	 },
	 
	 clearCache: function()
	 {
		 this._cache = null;
	 },
	 
	 clearContent: function()
	 {
		 //clear the result in statusbar,
		 for(var item in this._viewItems){
			 var data = this._viewItems[item];
			 data[0].textContent = data[1].textContent = '';
		 }
	 },
	 
	 notify:function(caster, event, bNotModify)
	 {
		 //clear the cached range when apply message, re-calculate the formulas when update
		 //make sure the results are up to date. 
		 this.clearCache();
	 },

	 preCondition: function(event)
	 {
		 if(this._cache != null && event._type == websheet.Constant.EventType.DataChange)
			 return true;
	 },
	 
	 relocate: function()
	 {
		 //place the statusbar at the bottom of the WorkSheetContainer DIV,
		 dojo.style(this.domNode, {top : (parseInt(this.editor.scene.getWorksheetHeight()) - this.editor.scene.getStatusBarHeight() - 2) + 'px'});
	 },
	 
	 reset: function()
	 {
		 this._values = {};
		 this._formats = {};
		 this.clearCache();
		 this.clearContent();
	 },
	 
	 calculateResult: function()
	 {
		 //Calculate ALL the formula results defined in sequence array, then call renderResult to render them out.
		 //Use the formula implementations to calculate the result,
		 this._values = {}, this._formats = {};
		 var /*cfg = this._getConfig(),*/ addr = this._getAddress();
		 if(!addr || addr == '') return;
		 var util = websheet.functions.Util;
		 this._cache.refMask = websheet.Constant.RANGE_MASK;
		 // FIXME need to ensure that token.enableCache returns TRUE
		 var token = this._helper.generateRefToken(addr, this._cache);
		 for(var i = 0; i < this.sequence.length; i++)
		 {
			 try
			 {
				 var funcName = this.sequence[i];
				 var funcNumToken = this.function_num[funcName];
//				 if(cfg & 1 == 1) 
				 {
					 var func = websheet.functions.Formulas.getFunc('SUBTOTAL');
					 if(func)
					 {
						 // re-use the cached cells in the token to improve calculation performance
						 this._values[funcName] = func([funcNumToken, token]);
						 if(util.getFormatTypeByName(funcName))
							 this._formats[funcName] = token.getFormat();
					 }
				 }
			 }
			 catch(e)
			 {
				 this._values[funcName] = null;
			 }
//			 cfg >>= 1;
		 }
		 this.renderResult();
	 },
	 
	 renderResult: function()
	 {
		 //show out the result on statusbar according to the configuration, format number with locale if it's not integer
		this.clearContent();
		if(this._cache == null) return;
		//Do not render out trivial results,
		var cfg = this.blockTrivialResults(this._getConfig());
		var values = [];
		var locale = this.editor.scene.getLocale();
		for(var i = 0; i < this.sequence.length; i++)
		{
			var bVisible = false;
			var funcName = this.sequence[i];
			if(cfg & 1 == 1)
			{
				var value = this._values[funcName];
				if(value != null)
				{
					if((value + "").length > this._sigFigs)
						value = value.toPrecision(this._sigFigs);
					var format = this._formats[funcName];
					if(format != null)
					{
						//formula format
						value = this._formater.format(value, format); //common formula format
					}
					else if(value % 1 != 0)
					{
						//format decimal
						value = dojo.number.format(value, {type : "decimal", locale : locale}); 
					}
					
					var data = this._viewItems[funcName];
					data[0].textContent = this._nls[funcName];
					data[1].textContent = value;
					data[0].style.display = '';
					data[1].style.display = '';
					bVisible = true;
					
					var item = [];
					item.push(this._nls[funcName]);
					item.push(value + "");
					values.push(item);
				}
			}
			if(!bVisible){
				var data = this._viewItems[funcName];
				data[0].style.display = 'none';
				data[1].style.display = 'none';
			}
			cfg >>= 1;
		}

		if (values.length > 0) {
			this.editor.publishForMobile({"name": "showValueOnStatusBar", "params":values});
		}
	 },
	 
	 _calculate: function(range)
	 {
		 if(this._debug && this._getConfig() == 0)
			 return;
		 //notified when the selection update, calculate the formulas if necessary.
		 if(range == null) return; 
		 //we do not calculate for a single cell.
		 if(range.startRow == range.endRow && range.startCol == range.endCol)
			 return this.reset();
		 //no need to calculate if it's not changed.
		 if(!this._isRangeChanged(range)) return;
		 var tm = this.editor.getTaskMan();
		 var callback = dojo.hitch(this, this.calculateResult);
		 tm.addTask(this.editor.getInstanseOfPCM(), "startWithCondition", [range,callback], tm.Priority.UserOperation);
		 tm.start();
	 },
	 
	 _createInlineItems: function()
	 {
		 //create some span to show the formula results, store the span nodes in a map indexed with their formula names.
		 this._viewItems = {};
		 //node to attach menu
		 this.settingsNode = dojo.create('span', {id : 'status_menu'}, this.domNode);
		 var valueNode = dojo.create('span', {}, this.domNode);
		 for(var i = this.sequence.length - 1; i >= 0 ; i--)
		 {
			 var functionItem = dojo.create('span', { id : 'status_' + this.sequence[i], 'class':'status_func'}, valueNode);
			 var valueItem = dojo.create('span', {'class': 'status_value'}, valueNode);
			 this._viewItems[this.sequence[i]] = [functionItem, valueItem];
		 }
	 },
	 
	 _createConfigMenu: function()
	 {
		 //create a configuration menu to config which formulas should be displayed on the statusbar,
		 //this menu can be accessed by click on the 'settingsNode' (a small triangle on the right bottom of the statusbar) 
		 //and the menu can also be accessed in the View menu for A11Y capability.
		 var cfg = this._getConfig();
		 var menu = new dijit.Menu({
			 onItemClick: function(item, evt){
				 item._onClick ? item._onClick(evt) : item.onClick(evt);
			 }
		 });
		 var self = this;
		 for(var i = 0; i < this.sequence.length; i++)
		 {
			 menu.addChild(new dijit.CheckedMenuItem({
				 onChange : function(checked) {
					 var cfg = self._getConfig();
					 if(checked)
						 cfg = cfg | this._statebit;
					 else
						 cfg = cfg & (this._statebit ^ 524287);
					 self._setConfig(cfg);
					 self.renderResult();
				 },
				 label: this._nls[this.sequence[i]],
				 checked : ((cfg & 1) == 1),
				 _statebit: (1 << i)
			 }));
			 cfg >>= 1;
		 }
		 var attach = this.settingsNode;
		 this._dropDown = new dijit.form.DropDownButton({
			 dropDown: menu
		 }, attach);
		 menu.bindDomNode(this.domNode);
		 // for RPT compliance
		 if (dojo.isFF) {
			 this._dropDown.valueNode.value = 'setting';
		 }
	 },
	 
	 _getConfig: function()
	 {
		 //Summary : Get config from local storage or cookies, render out the first 3 items by DEFAULT
		 if(!dojo.isIE && window.localStorage) 
		 {
			 //local storage broken in IE11, even access to it throw an exception....
			 if(window.localStorage[this._key])
				 return parseInt(window.localStorage[this._key]);
			 else {
				 if (this.editor.isMobile())
					 return 32; // pasreInt(100000, 2) sum only 
				 
				 return 37; // parseInt(100101, 2) for average, count and sum 
			 }
		 }
		 else
		 {
			 var cfg = dojo.cookie(this._key);
			 if (cfg) return cfg;

			 if (this.editor.isMobile())
				 return 32; // sum only
			 return 37; // parseInt(100101, 2) for average, count and sum
		 }
	 },
	 
	 _getAddress: function()
	 {
		 //return the address of the cached range, it's used to generate tokens before formula calculation.
		 if(this._cache != null) 
		 {
			 var cr = this._cache;
			 var hp = websheet.Helper;
			 var addr = (hp.getColChar(cr.startCol) + cr.startRow + ':' + hp.getColChar(cr.endCol) + cr.endRow);
			 return addr;
		 }
		 return "";
	 },
	 
	 _isRangeChanged: function(range)
	 {
		 //prevent some un-necessary calculation if the cached range is not changed
		 if(this._cache == null) 
		 {
			 this._cache = range;
			 return true;
		 }
		 var cr = this._cache, nr = range;
		 if(cr.sheetName == nr.sheetName && 
				 cr.startRow == nr.startRow && 
				 cr.endRow == nr.endRow && 
				 cr.startCol == nr.startCol &&
				 cr.endCol == nr.endCol)
		 {
			 return false;
		 }
		 this._cache = range;
		 return true;
	 },
	 
	 _setConfig: function(config)
	 {
		 //set configuration to localStorage or cookie(when local storage is not accessible)
		 if(!dojo.isIE && window.localStorage) 
			 window.localStorage[this._key] = config;
		 else
			 dojo.cookie(this._key, config, {path: '/', expires: 7/*for one week*/});
	 },
	 
	 /*
	  * Only one formula can be set from mobile's status bar
	  */
	 /*void*/setConfig: function(/*string*/funcName) {
		funcName = funcName.toUpperCase();
		var config = 1;
		for (var i = 0; i <= this.sequence.length - 1; i++) {
			if (funcName == this.sequence[i])
				break;
			
		 	config = config << 1;
	 	}
		
		this._setConfig(config);
	 }
});