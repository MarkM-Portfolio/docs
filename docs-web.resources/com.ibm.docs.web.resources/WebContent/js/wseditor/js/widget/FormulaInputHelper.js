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
dojo.provide("websheet.widget.FormulaInputHelper");
dojo.require("websheet.parse.FormulaLexer");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("websheet.widget","FormulaInputHelper");
dojo.requireLocalization("websheet.dialog","allFormulas");

dojo.declare("websheet.widget.FormulaInputHelper", null, {
	// module:
	//		websheet/widget/FormulaInputHelper
	// description:
	//		This 'FormulaInputHelper" provide these three features to help improve formula input experience in in-line editor.
	//
	//		1. Display formula suggestion list when user type in function names. User can use up/down arrow to select and use tab to complete.
	//
	//	 	2. Display formula arguments help information when user type in arguments of the formula.
	//
	//		3. Try to parse the formula strings in advance when user input, speed up formula calculation when apply.
	
	inlineEditor				:		null,		//reference to in-line editor
	_lexer				:		null,		//lexer may be used when highlight content in function details.
	
	_lastInput			:		null,		//String, cached formula string used in dropHelpInfo 
	_lastCursor			:		null,		//Number, cached cursor positions used in dropHelpInfo.
	_lastToken			:		null,		//Object, token object the cursor located.
	_tokens				:		null,		//Array, cached token objects used in dropHelpInfo.
	
	_suggestion			:		null,		//widget used to provide the formula suggestion feature
	_details			:		null,		//widget used to display the formula details information
	_list				:		null,		//widget used to display the formula suggestions and arguments candidates.
	_store				:		null,		//formulas data store
	
	constructor: function (inlineEditor) {
		this.inlineEditor = inlineEditor || websheet.model.ModelHelper.getEditor().getController().getInlineEditor(),
		this._lexer = new websheet.parse.FormulaLexer(),
		this._store = new websheet.widget._FormulaStore(),
		//create widgets
		this._list = new websheet.widget._SuggestionList({dir: BidiUtils.isGuiRtl() ? 'rtl' : ''}),
		this._suggestion = new websheet.widget._FormulaSuggestion({
				inlineEditor : this.inlineEditor, 
				_store : this._store, 
				_list : this._list, 
				_helper : this
		}),
		this._details = new websheet.widget._FormulaDetails({
			inlineEditor:this.inlineEditor, 
			_store:this._store, 
			_list : this._list,
			_helper : this
		});
	},
	
	complete: function (option, focusNode) {
		// summary:
		//		Auto-complete the selected option to the editor box, 
		// option:	Object
		//		isFormula: 	boolean, if it's a formula or  a name range?
		//		label	:	string, the text content of the formula or name range.
		if (option) {
			var isFormula = option.isFormula,
				label = option.label,
				pre = this._lastInput.substring(0, 
						((this._lastToken.type == this._lexer.TOKEN_TYPE.NAME_TYPE || this._lastToken.type == this._lexer.TOKEN_TYPE.FUNCTION_TYPE)? this._lastToken.start : this._lastCursor))
						+ label,
				latter = this._lastInput.substring(this._lastCursor),
				result,
				cursor = pre.length;
			var bShowCandidate = true;
			if (isFormula) {
				var bracket = this.inlineEditor.grid.editor.enableFormulaAutoComplete?'()':'(';
				result = pre + bracket + latter;
				cursor += 1;
			} else {
				// now autocomplete the candidate, so it is not neccessary to showCandidate again
				result = pre + latter;
				bShowCandidate = false;
			}
			// when auto-complete the suggestion done, should hide it
			this.closeHelpInfo();
			
			if(result == this._lastInput){
				return;
			}
			this.suspendSearch();
			var formulaBar = this.inlineEditor._formulaBar;
			formulaBar && formulaBar.setFormulaInputLineValue(result);
			this.inlineEditor.setValue(result, !bShowCandidate, cursor);
			if(formulaBar && (focusNode == formulaBar.formulaInputLineNode)){
				formulaBar.formulaInputLineNode.focus();
				formulaBar.setCurserPos(formulaBar.formulaInputLineNode, cursor);
			} else {
				this.inlineEditor.setCursor(cursor);
			}
			this.resumeSearch();
		}
	},
	
	cover: function () {
		// summary:
		//		Hide the pop-ups of the suggestion list or function details page in case some dialog or menu displayed.
		//		Call uncover() to resume, please refer to InlineEditor's cover()/uncover() for more details.
		if (this.displayingSuggestion() || this.displayingDetails()) {
			this._suggestion.close();
			this._details.close();
			this._covered = true;
		}
	},
	
	dispatchEvent: function (e) {
		// summary:
		//		Receive events from in-line editor and dispatch them to owned widgets.
		//		Currently only the formula suggestion widget needs to handle some keyboard events, 
		//		the formula details widget is not an interactive widget.
		// e:	keyboard event
		// returns:
		//		in-line editor relies on the return value to determine the following steps.
		//		return true, if the keyboard events is handled within the widgets, otherwise return false.
		var handled = this._suggestion.dispatchEvent(e);
		if(!handled){
			var cursor = null;
			switch(e.keyCode){
				case dojo.keys.ENTER:
					// enter means apply the value
					this.closeHelpInfo();
					break;
				case dojo.keys.LEFT_ARROW:
				case dojo.keys.RIGHT_ARROW:
					if(!this.inlineEditor.shouldMoveRangePicker()){
						// move cursor when editing formula cell
						var cursor, aroundNode;
						var formulaBar = this.inlineEditor._formulaBar;
						if(formulaBar && (document.activeElement == formulaBar.formulaInputLineNode)){
			    			cursor = formulaBar.getInputTextSelectionPositon().end;
			    			aroundNode = formulaBar.formulaInputLineNode;
						}
			    		else {
							cursor = this.inlineEditor.getBackupSelection().end;
							aroundNode = this.inlineEditor.inputBox;
			    		}
						if(e.keyCode == dojo.keys.LEFT_ARROW)
							cursor--;
						else
							cursor++;
						var input = this._lastInput;
						if(!input)
							input = this.inlineEditor.getValue();
						this.dropHelpInfo(input, cursor, null, aroundNode);
						break;
					}
			}
		}
		return handled;
			
	},
	
	displayingSuggestion: function () {
		// summary:
		//		return if it's currently displaying the formula suggestion widget
		return this._suggestion.isShow();
	},
	
	displayingDetails: function () {
		// summary:
		//		return if it's currently displaying the formula details page
		return this._details.isShow();
	},
	
	displayingHelp: function () {
		// summary:
		//		return if it's currently displaying something, either the formula suggestion or formula details.
		return this._suggestion.isShow() || this._details.isShow();
	},
	
	closeSuggestion: function(){
		this._suggestion.close();
	},
	
	closeHelpInfo: function () {
		// summary:
		//		Close the suggestion list or the function details page on calling this.
		if (this._suggestion.isShow()) {
			this._suggestion.close();
		}
		if (this._details.isShow()) {
			this._details.close();
		}
	},
	
	dropHelpInfo: function (input, cursor, prefer, aroundNode, isResume) {
		// summary:
		//		Give help information with a drop-down based on current input text and the cursor position.
		//		If user is typing a function name, show the user with the filtered function list.
		//		If user is typing an argument of the function, display the function's detailed information and highlight the related content.
		//	input:	String Optional
		//		The value currently user typed in the editor box.
		//		If it's not given, need to fetch from in-line editor with getValue().
		//	cursor:	Number Optional
		//		The end cursor position (we do not care the start of the selection, if any), very likely to be located at the end of the input text.
		//		But user may click on somewhere else and we need to highlight the related content in the function detail page.
		//		If it's not given, need to fetch from in-line editor with getInputTextSelection().
		//	prefer: String Optional
		//		Can be "type" or "click", indicates which kind of help the editor is expecting.
		//		We are not intend to display both formula suggestion list together with formula details page. It maybe a mess on data grid.
		//		By giving a "type", user is typing some characters, and it's more likely to display the formula suggestion page.
		//		While giving a "click", user is more likely to expect the function details page to see the details of the clicked content.
		//		If not given, we're expecting the 'click' or say we prefer the function details page.
		//	aroundNode: DOM node
		//		This should be the inline editor box or the formula bar node
		//	isResume:	boolean
		//		If true, it's a cover-uncover case, the value and status in the is not changed, but we need to re-run the full path to resume.
		var input = (typeof input == 'string') ? input : this.inlineEditor.getValue(),
//			cursor = (typeof cursor == 'number') ? cursor : this._inlineEditor.getInputTextSelection().end,
			token,	//the token object near the cursor.
			tokenStack, tokens;
		if (input.length < 2 || input.charAt(0) !== "="){
			this.reset();
			return; //do not need to drop any help information, short or weird
		}
		if (this._lastInput == input && !isResume) {
			if (cursor == this._lastCursor)
				return; //it just make no difference with previous help information
			else
				tokens = this._tokens;
		} else {
			//parse the token from beginning to cursor
			tokens = this._lexer.parseToken(input, true, cursor, true);
		}
		//search in the tokens with the cursor position, decide what the user need, a suggestion list or a detailed page ?
		token = this._searchTokens(tokens, cursor);
		if (token) {
			this._lastInput = input;
			this._lastCursor = cursor;
			this._lastToken = token;
			this._lastPrefer = prefer;
		} else {
			this.reset();
			// =sum(1,2), then input "A" before 1, then last item of token should be name token with "A"
			// continue to parse token, so that "A1" parsedRef can be recognized
			this._tokens = this._lexer.resumeParseToken(input, true);
			this._lastInput = input;
			return;
		}
		if ((token.type == this._lexer.TOKEN_TYPE.NAME_TYPE || token.type == this._lexer.TOKEN_TYPE.FUNCTION_TYPE)&& prefer == 'type' && cursor == token.end) {
			//should display a suggestion list
			var deferred = new dojo.Deferred();
			var self = this;
			deferred.then(function(bSuggesionOpened){
				// if suggestion list is opened, then close detail list
				// else try to open detail list
				// such as type "=SUM(g", no formula begin with g, so no suggestion list will pop up
				// but we still need detail list of sum with first argument highlight
				if(bSuggesionOpened){
					self._details.close();
				} else {
					self._dropDetails(token, tokenStack, aroundNode, prefer == 'type');
				}
			});
			this._dropSuggestion(token, aroundNode, deferred);
		} else {
			//try to give a function detail page 
			//find function token,
			//highlight the related content of the function token,
			this._dropDetails(token, tokenStack, aroundNode, prefer == 'type');
		}
		this._tokens = this._lexer.resumeParseToken(input, true);
	},
	
	getCurrentTokens:function(){
		return this._tokens;
	},
	
	reset: function () {
		// summary:
		//		Reset the cached status, 
		this._tokens = [];
		this._lastCursor = 0;
		this._lastInput = "";
		this._lastToken = null;
		this._covered = this._suspended = false;
		this._lastPrefer = '';
		this.closeHelpInfo();
	},
	
	resetLocale: function() {
		this._lexer.resetBundle();
		this._store.resetLocale();
		this._details.reset();
	},
	
	resumeSearch: function () {
		// summary:
		//		Resume the suspending status, see the 'suspendSearch' for more details.
		this._suspended = false;
	},
	
	suspendSearch: function () {
		// summary:
		//		Suspend the formula input helper, the status will be 'frozen', in this case any change in the in-line editor
		//		will not trigger the search of the formula suggestion search.
		//		I use this flag to block unnecessary search when picking range for the in-line editor.
		this._suspended = true;
	},
	
	uncover: function () {
		// summary:
		//		Resume the cover status, please refer to cover() for more details.
		if (this._covered) {
			if (this._lastInput != "" && this._lastInput == this.inlineEditor.getValue()) {
				this.dropHelpInfo(this._lastInput, this._lastCursor, this._lastPrefer, this.inlineEditor.inputBox, true);
			}
			this._covered = false;
		}
	},
	
	_dropSuggestion: function (token, aroundNode, deferred) {
		this._suggestion.aroundNode = aroundNode;
		this._suggestion.search(token.text, deferred);
	},
	
	_dropDetails: function (startToken, tokenStack, aroundNode, bShowCandidate) {
		// search token's function token and its position
		// search the nearest previous , or (, )
		// if is ), then jump to the pair ( and start to search, it might not has pair, then stop
		this._suggestion.close();
		var tokenIndex = -1;
		var topToken, funcToken;
		if(tokenStack){
			topToken = tokenStack.peek();
			var preToken = topToken && topToken.pre;
			if(preToken && preToken.type == this._lexer.TOKEN_TYPE.FUNCTION_TYPE){
				tokenIndex = topToken.nPar;
				funcToken = preToken;
			}
		} 
		if(!funcToken){
			var t = startToken;
			do{
				if( t.type == this._lexer.TOKEN_TYPE.SEPERATOR_TYPE){
					switch (t.subType){
						case this._lexer.TOKEN_SUBTYPE.SEPERATOR_ARGUMENTS:
							topToken = t.parent;
							tokenIndex = t.pos;
							break;
						case this._lexer.TOKEN_SUBTYPE.SEPERATOR_OPEN:
							topToken = t;
							tokenIndex = 0;
							break;
						case this._lexer.TOKEN_SUBTYPE.SEPERATOR_CLOSE:
							if(t.pair)
								t = t.pair;
							break;
					}
					if(topToken){
						var preToken = topToken.pre;
						if(preToken && preToken.type == this._lexer.TOKEN_TYPE.FUNCTION_TYPE){
							funcToken = preToken;
							break;
						}
					}
				}
				
			} while((t = t.pre) != null);
		}
		if(!funcToken && startToken.type == this._lexer.TOKEN_TYPE.FUNCTION_TYPE){
			// highlight this function token if it is the top function
			funcToken = startToken;
			tokenIndex = -1;
		}
		if(funcToken) {
			this._details.aroundNode = aroundNode;
			this._details.setStatus(funcToken.id, funcToken.value, tokenIndex, bShowCandidate);
		} else
			this._details.close();
	},
	
	_dropCandidates: function (results) {
		this._suggestion.showCandidates(results);
	},
	
	_searchTokens: function(tokens, cursor) {
		// summary:
		//		Search the token in which the cursor located.
		// cursor:	Number
		//		Cursor position, should be in [0, formulaString.length]
		// returns:
		//		The token object.
		for (var idx = tokens.length - 1, token; (token = tokens[idx]); idx--) {
			// for whitespace in formula, it is not exist in tokens
			if (token.start < cursor) {
				return token;
			}
		}
		return null;
	},
	
	destroy: function () {
		//destroy used widgets
		this._suggestion.destroy();
		this._details.destroy();
	}
});

dojo.require("dojo.store.Memory");
dojo.require("websheet.dialog.allFormulas");
dojo.requireLocalization("websheet.dialog","allFormulas");
dojo.declare("websheet.widget._FormulaStore", [dojo.store.Memory, websheet.listener.Listener], {
	// module:
	//		websheet/widget/_FormulaStore
	// description:
	//		This is an in-memory object store that contains all the supported formulas together with the defined names.
	
	constructor: function () {
		this.inherited(arguments);
		// load store
		this._loadFormulasAndNames();
	},
	
	_loadFormulasAndNames: function () {
		//(supported) formulas from allFormulas nls.
		var resource = dojo.i18n.getLocalization("websheet.dialog","allFormulas"),
			formulas = resource.formula,
			data = {idProperty: 'id', items : []},
			items = data.items;
		this._nls = dojo.i18n.getLocalization("websheet.widget","FormulaInputHelper");
		var nameRangeDesc = this._nls.RANGE_DESCRIPTION;
		var keys = Object.keys(formulas);
		var formulaSep = websheet.parse.FormulaParseHelper.getArgSepByLocale();
		
		for (var idx = 0, len = keys.length; idx < len; idx ++) {
			var item = {};
			var key = keys[idx];
			item.name = key;
			item.localeName = websheet.functions.FormulaTranslate.transFuncNameEn2Locale(key);
			item.id = this._toId(item.name, true);
			item.category = 'formula';
			var content = formulas[key];
			item.syntax = content['Syntax'];
			this._decorateSyntax(item, formulaSep);
			item.desp = content['Disp'];
			item.args = content['Arguments'];
			items.push(item);
		}
		//load names
		var names = websheet.model.ModelHelper.getDocumentObj().getAreaManager().getRangesByUsage(websheet.Constant.RangeUsage.NAME);
		for ( idx = 0, len = names.length; idx < len; idx ++) {
			var item = {};
			var nameRange = names[idx];
			item.name = item.localeName = nameRange._id;
			item.id = this._toId(item.name, false);
			item.category = 'name';
			item.nameRange = nameRange;
			var address = nameRange.getParsedRef().getAddress();
			item.desp = nameRangeDesc + address;
			items.push(item);
		}
		this.setData(data);
	},
	
	updateNames: function() {
		//insert names after document load name range, in case store is constructed before names have been initialized 
		var names = websheet.model.ModelHelper.getDocumentObj().getAreaManager().getRangesByUsage(websheet.Constant.RangeUsage.NAME);
		for ( idx = 0, len = names.length; idx < len; idx ++) {
			var nameRange = names[idx];
			if(!this.get(this._toId(nameRange._id)))
				this._onInsert(nameRange);
		}
	},
	
	_decorateSyntax: function(item, sep){
		var syntax = item.syntax;
		var name = item.localeName;
		var count = 0;
		//"$2<span>$3</span>$4";
		var text = syntax.replace(/(\$\{0\})(\()(.*)(\))/ig, function(str, param1, left, content, right){
			if(content && content.length > 0)
				count++;
			return ["<span>", name , "</span>", left, "<span>", content, "</span>", right].join(""); 
//			"<span>" + name+ left +"<span>" + content + "</span>" + right;
		});
		text = text.replace(/(\$\{1\})/ig, function(str){
			count++;
			return "</span>"+sep+"<span>";
		});
		item.decorateSyntax = text;
		item.paramCount = count;
	},
	
	resetLocale:function(){
		var formulaSep = websheet.parse.FormulaParseHelper.getArgSepByLocale();
		var self = this;
		dojo.when(this.query({category:'formula'}), function(results){
			results.forEach(function(item, index){
				item.localeName = websheet.functions.FormulaTranslate.transFuncNameEn2Locale(item.name);
				self._decorateSyntax(item, formulaSep);
			});
		});
	},
	_onRemove: function (range) {
		// summary:
		//		name range removed, remove it from data store.
		return this.remove(this._toId(range._id));
	},
	
	_onInsert: function (range) {
		// Summary:
		//		New name range insert, add to store.
		var address = range.getParsedRef().getAddress();
		desp = this._nls.RANGE_DESCRIPTION + address;
		return this.put({
			name : range._id,
			nameRange: range,
			localeName: range._id,
			id : this._toId(range._id),
			desp : desp,
			category : 'name'
		});
	},
	
	_onUpdate: function (range) {
		// TODO: currently we do not support the re-name operation on names.
		// but only update the area address
		var rangeDescp = this._nls.RANGE_DESCRIPTION;
		dojo.when(this.query({id:this._toId(range._id)}), function(results){
			var item = results[0];
			if(item){
				item.bDirty = true;
			}
		});
	},
	
	_toId: function (name, isFormula) {
		// summary:
		//		Generate a unique id string for the given item.
		// returns:
		//		formula_sum, name_sum, name_test1......
		//		It's not case sensitive
		if (!name) 
			return null;
		return (isFormula ? 'formula_' : 'name_') + name.toLowerCase();
	},
	
	notify: function(area, e){
		if(e )
		{
			//set Area, this.updateNameRange
			if(e._type == websheet.Constant.EventType.DataChange)
			{
				var s = e._source;
				if (s.refType == websheet.Constant.OPType.AREA) {
					switch(s.action) {
						case websheet.Constant.DataChange.DELETE: {
							this._onRemove(area);
							break;
						}
						case websheet.Constant.DataChange.INSERT:{
							var newArea = s.refValue;
							this._onInsert(area);
							break;
						}
						case websheet.Constant.DataChange.SET:{
							this._onUpdate(area);
							break;
						}
					}
				} else if(((s.action == websheet.Constant.DataChange.SET || s.action == websheet.Constant.DataChange.INSERT || s.action == websheet.Constant.DataChange.PREDELETE ) 
								&& s.refType == websheet.Constant.OPType.SHEET)
						||((s.action == websheet.Constant.DataChange.PREINSERT || s.action == websheet.Constant.DataChange.PREDELETE) 
								&&( s.refType == websheet.Constant.OPType.ROW ||s.refType == websheet.Constant.OPType.COLUMN )) ){
					this._onUpdate(area);
				}
			}
		}
	}
	
});

dojo.require("dijit.form._ComboBoxMenu");
dojo.declare("websheet.widget._SuggestionList", [dijit.form._ComboBoxMenu], {
	// module:
	//		websheet/widget/_SuggestionList
	// description:
	//		This widget is the suggestion list that contains the searched results based on user's input.
	minWidth		:		"206px",	
	postCreate: function () {
		this.inherited(arguments);
		this.domNode.id = 'ws_formula_suggestion';
	},
	
	onHover: function (node) {
		//do nothing, include do not show css style
//		this._setSelectedAttr(node, true);
	},
	
	_onMouseDown: function (/*Event*/ evt, /*DomNode*/ target) {
		//a hack for defect:46464
		//change the mouse select behavior, mouse down on list items will select the item.
		//:~
		this.inherited(arguments);
		this.defer(function(){
			this._onClick(evt, this.selected);
		});
	},
	
	_createOption: function(/*Object*/ item, labelFunc){
		//add title for the menuItem node.
		var menuitem = this._createMenuItem();
		var labelObject = labelFunc(item);
		if(labelObject.html){
			menuitem.innerHTML = labelObject.label;
			if (item['desp']) {
				dojo.attr(menuitem, 'title', item['desp']);
			}
		}
		if(menuitem.innerHTML == ""){
			menuitem.innerHTML = "&#160;";	// &nbsp;
		}

		return menuitem;
	}
});

dojo.declare("websheet.widget._FormulaSuggestion", [], {
	// module:
	//		websheet/widget/_FormulaSuggestion
	// description:
	//		Provide a suggestion list when user type in function names.
	//		Provide a candidate list when user type in arguments if any.
	
	constructor: function (params) {
		dojo.mixin(this, params);
		this._list.onChange = dojo.hitch(this, this.onSelected);
	},
	
	close: function () {
		// summary:
		//		Close the suggestion list.
		this._abortSearch();
		this._opened = false;
		dijit.popup.close(this._list);
		if(this.aroundNode)
			this.aroundNode.setAttribute("aria-expanded", "false");
	},
	
	dispatchEvent: function (e) {
		// summary:
		//		The _suggestionList can handle some key such as UP/DOWN arrow, page up/ page down.
		//		We need to add more key shortcuts like 'TAB & ENTER' to select the current option, 
		//		and 'ESCAPE' to close the suggestion list (or details page).
		// returns
		//		true, handled
		//		false, not interested.
		var handled = false;
		if (this._opened) {
			handled = !this._list.handleKey(e);
		}
		if (!handled) {
			var keys = dojo.keys,
				code = e.keyCode;
			switch(code) {
			case keys.TAB:
				//selecting the current highlighted option
				if (this._opened) {
					this.onSelected(this._list.getHighlightedOption());
					dojo.stopEvent(e);
					handled = true;
				}
				break;
			case keys.ESCAPE:
				if (this.inlineEditor.formulaAssist.displayingSuggestion()) {
					this.inlineEditor.formulaAssist.closeSuggestion();
					handled = true;
				}// else should escape cell editing
				break;
			default:
				//do not care other keys
			}
		}
		return handled;
	},
	
	isShow: function () {
		// summary:
		//		Return if it's currently displaying the suggestion list.
		return this._opened;
	},
	
	open: function (params) {
		// summary:
		//		Popup the suggestion list.
		// params {
		// 	aroundNode : domNode
		//		The dom node to which the suggestion list will be attached, if not given, take the in-line editor box as default.
		//	parent : widget
		//		If it's going to pop up a second-level list, this parent should be given to prevent hidden the top-level pop-ups when open the _list.
//		var editorNode = this._editor.inputBox;
		var dropDown = this._list,
			ddNode = dropDown.domNode,
			aroundNode = this.aroundNode = params && params.aroundNode ? params.aroundNode : this.aroundNode,
			parent = (params && params.parent) ? params.parent : null,
			width = (params && params.width) ? params.width: "206px",
			self/* = this*/;
		if (parent == null) {
			parent = {
					isLeftToRight : function () {
						return (aroundNode.style.textAlign == 'right') ? false : true;
					}
			};
		};
		dojo.style(dropDown.domNode, "minWidth", width);
		var positions = (params && params.position) ? params.position : ["below", "after", "before"];
		this._opened = true;
		var retVal = dijit.popup.open({
			popup: dropDown,
			around: aroundNode,
			orient: positions,
			parent: parent
		});
		this.aroundNode.setAttribute("aria-expanded", "true");
		this._list.highlightFirstOption();
	},
	
	onSelected: function (option) {
		// summary:
		//		When mouse click, press enter, press tab, pass the current selected option ( a menu item node) to 'onSelected'
		this._helper.complete(this._getSelected(option), this.aroundNode);
	},
	
	search: function (text, deferred) {
		// summary:
		//		Starts a search for elements matching text (text=="" means to return all items),
		//		and calls _searchComplete(...) when the search completes, to display the results.
		this._searchTimer = setTimeout(dojo.hitch(this, this._searchStart, text, deferred), 0);
	},
	
	showCandidates: function (results) {
		// summary:
		//		Show the candidates in the suggestion list.
		this._list.clearResultList();
		if (!results.length) {
			return this.close();
		}
		this._opened = true;
		this._list.createOptions(results, {start : 0}, dojo.hitch(this, "_getMenuLabelFromItem"));
		this.open({
			parent : this._helper._details, 
			aroundNode : this._helper._details.domNode,
			position : ["below", "after", "before"],
			width: "150px"
		});
	},
	
	_abortSearch: function () {
		if (this._queryTimer) {
			clearTimeout(this._queryTimer);
			this._queryTimer = null;
		}
		if (this._searchTimer) {
			clearTimeout(this._searchTimer);
			this._searchTimer = null;
		}
		if (this._fetchHandle) {
			if(this._fetchHandle.abort) {
				this._fetchHandle.abort();
			} else {
				this._fetchHandle.cancel();
			}
		}
		this.deferred && this.deferred.cancel();
	},
	
	_getMenuLabelFromItem: function (item) {
		// summary:
		//		Computes the label to display based on the dojo.data store item.
		var store = this._store,
			category = item['category'];
		if (category == 'formula') {
			_label = item['name'].toString();
			_label = websheet.functions.FormulaTranslate.transFuncNameEn2Locale(_label);
			//ws-f is websheet-formula for short
			_label = "<span class = 'ws-f'>" + _label + "</span>";
			_label += "<p class= 'ws-f-d'>"+ item['desp'] + "</p>";
		} else if (category == 'name'){ 
			// name range input are from user input, escape the string here.
			_label = websheet.Helper.escapeXml(item['name'].toString());
			//ws-n is websheet-names
			_label = "<span class = 'ws-n'>" + _label + "</span>";
			if(item.bDirty){
				var address = item.nameRange.getParsedRef().getAddress();
				item['desp'] = store._nls.RANGE_DESCRIPTION + address;
				delete item.bDirty;
			}
			_label += "<p class= 'ws-f-d'>"+ websheet.Helper.escapeXml(item['desp']) + "</p>";
		} else {
			//ws-a-c is websheet-argument-candidates
			_label = dojo.string.substitute(item['label'], [item.result], function(value){
				return "<span class = 'ws-c'>" + value + "</span>";
			});
			_label = "<span class = 'ws-a-c'>" + _label + "</span>";
		}
		return {html : true, label : _label};
	},
	
	_getSelected: function (option) {
		// summary:
		//		Return the selected option information of the suggestion list.
		// option:
		//		It's the current selected menu item got from suggestion list.
		var content = option.children[0],
			rawlabel = content.textContent,
			label = rawlabel,
			isFormula = true;
		if (dojo.hasClass(content, "ws-f")) {
			// it's a formula suggestion option
			//isFormula = true;
			// label = rawLabel;
		} else if (dojo.hasClass(content, "ws-n")) {
			// it's a names suggestion option
			isFormula = false;
		} else {
			// it's a argument candidates option
			isFormula = false;
			// candidates in pattern  "${value} - some description text"
			label = rawlabel.substring(0, rawlabel.indexOf(' - '));
		}
		return {isFormula: isFormula, label: label};
	},
	
	_patternToRegExp: function(pattern){
		// summary:
		//		Helper function to convert a simple pattern to a regular expression for matching.
		// description:
		//		Returns a regular expression object that conforms to the defined conversion rules.
		//		For example:
		//
		//		- ca*   -> /^ca.*$/
		//		- *ca*  -> /^.*ca.*$/
		//		- *c\*a*  -> /^.*c\*a.*$/
		//		- *c\*a?*  -> /^.*c\*a..*$/
		//
		//		and so on.
		// pattern: string
		//		A simple matching pattern to convert that follows basic rules:
		//
		//		- * Means match anything, so ca* means match anything starting with ca
		//		- ? Means match single character.  So, b?b will match to bob and bab, and so on.
		//		- \ is an escape character.  So for example, \* means do not treat * as a match, but literal character *.
		//
		//		To use a \ as a character in the string, it must be escaped.  So in the pattern it should be
		//		represented by \\ to be treated as an ordinary \ character instead of an escape.

		return new RegExp("^" + pattern.replace(/(\\.)|(\*)|(\?)|\W/g, function(str, literal, star, question){
			return star ? ".*" : question ? "." : literal ? literal : "\\" + str;
		}) + "$", "mi");
	},
	
	_searchStart: function (text, deferred) {
		this._abortSearch();
		if(text.length <= 0)
			return this.close();
		this.deferred = deferred;
		var _this = this,
			query = {},
			qs = dojo.string.substitute("${0}*", [text.replace(/([\\\*\?])/g, "\\$1")]),	//${0}*` means "starts with",
			q = this._patternToRegExp(qs),
			options = {
				start: 0,
				count: 25,
				sort:function(a,b){
					var name1 = a.localeName.toUpperCase();
					var name2 = b.localeName.toUpperCase();
					return (name1 < name2)? -1:1;
				},
				ignoreCase : true
			};
		var startQuery = function (){
			var resPromise = _this._fetchHandle = _this._store.query(query, options);
			dojo.when(resPromise, function (res) {
				_this._fetchHandle = null;
				dojo.when(resPromise.total, function(total){
					res.total = total;
					var pageSize = res.total;
					// Setup method to fetching the next page of results
					res.nextPage = function(direction){
						//	tell callback the direction of the paging so the screen
						//	reader knows which menu option to shout
						options.direction = direction = direction !== false;
						options.count = pageSize;
						if(direction){
							options.start += res.length;
							if(options.start >= res.total){
								options.count = 0;
							}
						}else{
							options.start -= pageSize;
							if(options.start < 0){
								options.count = Math.max(pageSize + options.start, 0);
								options.start = 0;
							}
						}
						if(options.count <= 0){
							res.length = 0;
							_this._searchComplete(res, query, options);
						}else{
							startQuery();
						}
					};
					_this._searchComplete(res, query, options);
				});
			}, function (err) {
				_this._fetchHandle = null;
				console.warn('fetch error on input ', text, ' error:', err);
			});
		};
		this._lastQuery = query['localeName'] = q;
		this._queryTimer = setTimeout(startQuery, 0);
	},
	
	_searchComplete: function (results, query, options) {
		// summary:
		//		Callback when search complete, generate suggestion list and display it.
		// results: Array
		//		The array returned from data store's query.
		this._list.clearResultList();
		if (!results.length) {
			this.deferred.resolve(false);
			return this.close();
		}
		this._nextSearch = this._list.onPage = dojo.hitch(this, function(direction){
			results.nextPage(direction !== -1);
//			this.focus();
		});
		this._list.createOptions(results, options, dojo.hitch(this, "_getMenuLabelFromItem"));
		this.open();
		this._list.highlightFirstOption();
		this.deferred.resolve(true);
		//acc
	},
	
	destroy: function () {
		this._list.destroy();
	}
});

dojo.declare("websheet.widget._FormulaDetails", [dijit._Widget, dijit._Templated], {
	// module:
	//		websheet/widget/_FormulaDetails
	// description:
	//		Provide the formula details information 
	templateString	:	"<div class='formula-detail-container' style='visibility:hidden' dojoAttachPoint='focusNode,containerNode'>" +
			"<div class='formula-detail-title' dojoAttachPoint='formulaSyntax'></div>"+
			"</div>",
	
	_cacheItem		: null, // specify the formula cache item in store
	_highlightParamPos: -2,  // specify the user input param position which need to be highlighted
	
	
	postCreate: function () {
		// generate a Unique id starts with "ws_formula" to prevent conflict with others;
		this.domNode.id = "ws_formula_details" + (new Date()).getTime();
	},
	
	/**
	 * Change status of detail page
	 * @param key
	 * 		function name which is local insensitive
	 * @param funcModel
	 * 		the function instance 
	 * @param highlightParamPos
	 *    -1 means highlight function name
	 *    >=0 means highlight the specified index param which is 0-based
	 */
	setStatus: function(key, funcModel, highlightParamPos, bShowCandidate){
		var id = this._store._toId(key, true),
			candidates;
		if(!this._cacheItem || this._cacheItem.id != id){
			var result = this._store.query({id: id});
			if(result && result.length > 0){
				this._cacheItem = result[0];
				this.formulaSyntax.innerHTML = this._cacheItem.decorateSyntax;
//				this.formulaDescription.innerHTML = this._cacheItem.desp;
				this._highlightParamPos = -2;
			} else
				return false;
		}
			
		if(highlightParamPos == funcModel.maxNumOfArgs && highlightParamPos == 0){
			// for no params, such as now, today
			this._highlightParamPos = 0;
		} else if(highlightParamPos >= funcModel.maxNumOfArgs){
			//if param position is invalid, do not highlight any span
			this._removeClass();
			this._highlightParamPos = -2;
			this.open();
			return;
		} else if(highlightParamPos >= this._cacheItem.paramCount) {
			// for sum, the template only has 3 params, but it can accept 256 params
			highlightParamPos = this._cacheItem.paramCount - 1;
		}
		
		if(this._highlightParamPos != highlightParamPos){
			this._removeClass();
			this._highlightParamPos = highlightParamPos;
			this._addClass();
		}
		//
		this.open();
		if(bShowCandidate && this._cacheItem.args && (candidates = this._cacheItem.args[highlightParamPos])) {
			if (typeof candidates == "number") {
				candidates = this._cacheItem.args[candidates];
			}
			if(candidates.length > 0) {
				this._helper._dropCandidates(candidates);
			}
		} 
		//TODO: datagrid announce
	},
	
	reset:function(){
		this._cacheItem = null;
		this._highlightParamPos = -2;
	},
	
	//remove previous highlight class
	_removeClass:function(){
		if(this._highlightParamPos == -1){
			dojo.query(".highlightFormulaName",this.formulaSyntax).removeClass("highlightFormulaName");
		} else {
			dojo.query(".highlightFormulaParam",this.formulaSyntax).removeClass("highlightFormulaParam");
		}
	},
	
	_addClass:function() {
		if(this._highlightParamPos == -1){
			dojo.query("span:first-child",this.formulaSyntax).addClass("highlightFormulaName");
		} else {
			dojo.query("span:nth-child("+(this._highlightParamPos+2)+")",this.formulaSyntax).addClass("highlightFormulaParam");
		}
	},
	open: function () {
		// summary:
		//		Popup the formula detail
//		if(!this._opened){
			var	aroundNode = this.aroundNode,
				self = this;
			this._opened = true;
			var positions = ["below", "above", "before"];
			var retVal = dijit.popup.open({
				popup: self,
				around: aroundNode,
				orient: positions,
				parent : {
						isLeftToRight : function () {
							return (aroundNode.style.textAlign == 'right') ? false : true;
						}
				}
			});
			this.domNode.style.display = "";
			aroundNode.setAttribute("aria-expanded", "true");
//		}
	},
	
	close: function() {
		if(this._opened){
			this.domNode.style.display == "none";
			this._opened = false;
			dijit.popup.close(this);
			if(this.aroundNode)
				this.aroundNode.setAttribute("aria-expanded", "false");
		}
	},
	
	isShow: function () {
		return this._opened;
	}
});
