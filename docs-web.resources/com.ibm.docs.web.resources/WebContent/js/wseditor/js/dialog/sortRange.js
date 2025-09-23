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

dojo.provide("websheet.dialog.sortRange");
dojo["require"]("dijit.Dialog");
dojo["require"]("dojo.i18n");
dojo["require"]("dijit.form.Select");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.RadioButton");
dojo.require("concord.widgets.LotusTextSelect");
dojo.requireLocalization("websheet.dialog","sortRange");
dojo.require("concord.util.BidiUtils");
dojo.declare("websheet.dialog.sortRange", [concord.widgets.concordDialog], {	
	
	_currentSheetId : null,
	_contentContainer: null,
	
	ruleDomList: [],
	sortBySelectorList: [],
	sortOrderSelectorList: [],
	
	_Max_Rule: 10,
	
	constructor: function () {},
	
	setDialogID: function() {
		// Overridden
		this.dialogId = "S_d_sortRange";
		return;
	},
	
	createContent: function (contentDiv) {
		this._contentContainer = dojo.create('div', {}, contentDiv);
		dojo.addClass(this._contentContainer, "wsSortRulesContainer");
		this.nls = dojo.i18n.getLocalization("websheet.dialog","sortRange");
		this._createHeaderCheckBox();
		this._createSortRules();
		this._createAddRuleLink();
		this.MAX_RULE_NUMBER = this._Max_Rule;
		this.orderOptions = [{value: 'asc', label: this.nls.STR_SORT_ASCENDING}, {value: 'dec', label: this.nls.STR_SORT_DESCENDING}];
	},
	
	updateOptionsForAllRules: function () {
		var grid = this.editor.getCurrentGrid();
		var selector = grid.selection.selector(); 
		var rangeInfo = selector.getRangeInfo();
		//Only the first row is needed
	    rangeInfo.endRow = rangeInfo.startRow;
	    var colNameList = [];       
	    for (var i = rangeInfo.startCol; i <= rangeInfo.endCol; i++) {
	    	colNameList.push(websheet.Helper.getColChar(i));
	    }
	    var options = [];
	    if (this.headerCheckBox.attr('checked')) {
	    	var colsArray = websheet.model.ModelHelper.getCols(rangeInfo, true, true).data;
	    	var iter = new websheet.model.RangeIterator(rangeInfo, websheet.Constant.RangeIterType.NORMAL);
	    	iter.iterate(dojo.hitch(this, function(obj, row, col) {
	    		var cell = obj && obj.cell;
	    		var styleCell = obj && obj.styleCell;
	    		var showValue = null;
	    		var index = col - rangeInfo.startCol;
	    		var colModel = colsArray[index];
	    		if (cell!=null) {
	    			var styleId = styleCell ? styleCell._styleId : colModel && colModel._styleId;
	    			showValue = cell.getShowValue(styleId);
	    			if (showValue.length > 20) {
	    				showValue = websheet.Utils.truncateStrWithEllipsis(showValue, 20);
    				}
	    			showValue = showValue.replace(/\n/gm, "\u00a0");
	    			showValue = websheet.Helper.escapeXml(showValue);
	    			if (BidiUtils.isBidiOn()) {
	    				var dir;
	    				if (styleId) {
	    					var styleCode = websheet.model.ModelHelper.getDocumentObj()._getStyleManager().getStyleById(styleId);
	    					dir = styleCode ? styleCode.getAttr(websheet.Constant.Style.DIRECTION) : null;
	    				}
	    				if (!dir) {
	    					dir = BidiUtils.isTextRtl(showValue) ? "rtl" : "ltr";
	    				}
	    				showValue = BidiUtils.addEmbeddingUCCwithDir(showValue, dir);
	    			}
	    		 }
	    		 //if column cell is null or blank str, use column name instead
	    		if (showValue == null || dojo.trim(showValue) === "") {
	    			showValue = this.nls.STR_SORT_COLUMN + " " + colNameList[index];
    			}
	    		options.push({
	    			value: colNameList[index], label: showValue
    			});
	    		return true;
	    	}));
	     } else {
	    	 for (var i = 0, showValue; i < colNameList.length; i++) {
	    		 showValue = this.nls.STR_SORT_COLUMN + " " + colNameList[i];
	    		 if (BidiUtils.isGuiRtl()) {
	    			 showValue = BidiUtils.RLE + showValue;
	    		 }
	    		 options.push({
	    			 value: colNameList[i], label: showValue
	    		 });
	    	 }  
	     }
	     this.options = options;
	     var selected;
	     dojo.forEach(this.sortBySelectorList, function (item) {
	    	 selected = item.attr('value');
	    	 item.removeOption(item.getOptions());
	    	 item.addOption(dojo.clone(options));
	    	 if (selected) {
	    		 item.attr('value', selected);
	    	 } else {
	    		 item.attr('value', options[0].value);
	    	 }
	     });
	},
	
	onOk: function (editor) {
		if (!this._validateRules()) {
			this.setWarningMsg(this.nls.SortRuleConflict);
			return false;
		}
		editor.getCalcManager().pauseTasks();
        var grid = editor.getCurrentGrid();
        var sheetId = editor.getDocumentObj().getSheetId(grid.getSheetName());
        if (sheetId!=this._currentSheetId) {
            this.setWarningMsg(this.nls.STR_SORT_CONFLICT_DEL_SHEET);
            return false;
        }
        
        dojo["require"]("concord.concord_sheet_widgets");
		var currentRangeSorting = new websheet.sort.RangeSorting(this.editor, this._getRangeAddress(), this);
		currentRangeSorting._bLocal = true;
		var result = true;
		
		this.sortData = {
				criterion: this.generateSortCriterion()
		};
		
		//calc the column before sorting
		this.isCalcDone = false;
		this.okBtn.setAttribute("disabled",true);
		this.cancelBtn.setAttribute("disabled", true);
		this.setWarningMsg(editor.scene.nls.browserWorkingMsg);
		currentRangeSorting._doCalc(editor, this.sortData.criterion);
		
//		this.okBtn.setAttribute("disabled",false);
		return this.isCalcDone;
	},
	
	/*SortCriterion*/generateSortCriterion: function () {
		// summary:
		//		Gather information in the dialog inputs and then generate 'sort criterion'.
		//		Sort data (sort criterion) structure
		// {
		//		withHeader: boolean,
		//		rules: array of rules []
		//		rules - {
		//			isAscend: boolean,
		//			sortByIdx: number, the index of the sort column (row not supported now) from the start index of the sort range
		//					i.e, 0 means the first column of the sort range, 2 means the third column of the sort range.
		//		}
		//	}
		// return:
		//		sort criterion with the above structure,
		var result = {};
		var rules = result.rules = [];
		var self = this;
		var range = this.editor.getCurrentGrid().selection.selector().getRangeInfo();
		dojo.forEach(this.sortBySelectorList, function (selector, selectorIndex) {
			var index = websheet.Helper.getColNum(selector.value);
			rules.push({
				isAscend: (self.sortOrderSelectorList[selectorIndex].attr('value') == 'asc'),
				sortByIdx: index - range.startCol
			});
		});
		result.withHeader = this.headerCheckBox.attr('checked');
		return result;
	},
	
	
	postOnOk: function (editor, currentRangeSorting) {
		var callBack = dojo.hitch(this, "_confirmSortRange");
		if (!currentRangeSorting.checkSortRangeConflict(this.sortData, callBack)) {
			this._confirmSortRange(this._getRangeAddress(), this.sortData);
		}
	},
	
	_confirmSortRange:function(rangeAddress, sortData){
		var res = this.editor.sortRange(rangeAddress, sortData);
		var result = false;
		switch (res) {
			case 0:
			case 1:
				// executed completed
				result = true;
				break;
			case -1:
				// error
				this.setWarningMsg(this.nls.STR_SORT_CONFLICT_DEL_SHEET);
				result = false;
				break;
			case -2:
				// is executing async
				result = false;
				break;
			case -3:
			    this.setWarningMsg(this.nls.CAN_NOT_SORT_MERGE_CELLS);
                result = false;
			    break;
			default:
				// never here
				;
		}
		if(result){
			this.isCalcDone = true;
			this.hide();
		}
	},
	
	onCancel: function (editor) {
		return true;
	},
	
	
	reset: function () {
        var grid = this.editor.getCurrentGrid();
        // set current sheet id
        this._currentSheetId = this.editor.getDocumentObj().getSheetId(grid.getSheetName());
        var range = grid.selection.selector().getExpandedRangeInfo();
        this.MAX_RULE_NUMBER = Math.min(range.endCol - range.startCol + 1, this._Max_Rule);
        // set dialog title
		this.dialog.attr("title", this.concordTitle + " " + this._getRangeAddress(true));
		// with header default no
		this.headerCheckBox.attr('checked', false);
		// update options for rules
		this._resetAllRules();
		this._addSortRule();
		this.updateOptionsForAllRules();
	},
	
	_getRangeAddress: function (withoutSheet) {
        var grid = this.editor.getCurrentGrid();
        var selector = grid.selection.selector(); 
        var rangeInfo = selector.getRangeInfo();
        
        var selectType = selector.getSelectType();
        if(selectType==websheet.Constant.Row || selectType==websheet.Constant.RowRange)
            rangeInfo.endCol = websheet.Constant.MaxColumnIndex;
        
        var sheetName = rangeInfo.sheetName;
        if (withoutSheet) {
        	sheetName = null;
        }
        return websheet.Helper.getAddressByIndex(sheetName,rangeInfo.startRow,rangeInfo.startCol, null,rangeInfo.endRow,rangeInfo.endCol);
	},
	
	_createHeaderCheckBox: function () {
		var headerTable = dojo.create('table', {
			role: "presentation",
			style: {
				"padding-bottom": '10px'
			}
		}, this._contentContainer);
		var tr = dojo.create('tr', null, dojo.create('tbody', null, headerTable));
		var checkBoxCell = dojo.create('td', null, tr);
		var labelCell = dojo.create('td', null, tr);		
		
		var headerCheckBox = this.headerCheckBox = new dijit.form.CheckBox({
			id: "S_d_sortRangeWithHeader",
			name: "sortWithHeader",
			onClick: dojo.hitch(this, 'updateOptionsForAllRules')});		
		checkBoxCell.appendChild(headerCheckBox.domNode);
		
		var headerLabel = dojo.create('label', {
			'for': 'S_d_sortRangeWithHeader'
		}, labelCell);
		headerLabel.appendChild(dojo.doc.createTextNode(this.nls.STR_SORT_WITH_HEADER));
	},
	
	_createSortRules: function () {
		// initial create sort rules, add one rule on load
		var table = dojo.create('table', {cellspacing: "0", role: "presentation", style : {
			'margin-left': '17px'
		}}, this._contentContainer);
		var tbody = dojo.create('tbody', null, table);
		this.rulesBody = tbody;
		this._addSortRule();
	},
	
	_createAddRuleLink: function () {
		// initial create a 'link' to add new sort columns to rule list
		var label = this.nls.SortRuleAddRule;
		var addRule = dojo.create('span', {
			'class': 'ws-sort-add-rule-link',
			tabindex: '0',
			title: label,
			alt: label
		});
		addRule.textContent = label;
		dojo.place(addRule, this._contentContainer, 'after');
		dijit.setWaiRole(addRule, 'button');
		dijit.setWaiState(addRule, 'label', label);
		var self = this;
		var focusToLastRule = function () {
			setTimeout(function () {
				var list = self.sortBySelectorList;
				try {
					// focus to the new added rule;
					list[list.length - 1].focusNode.focus();
				} catch (e) {}
			},20);
		};
		dojo.connect(addRule, 'onclick', function () {
			self._addSortRule();
			focusToLastRule();
		});
		dojo.connect(addRule, 'onkeydown', function (e) {
			if (e.keyCode == dojo.keys.ENTER || e.keyCode == dojo.keys.SPACE) {
				dojo.stopEvent(e);
				self._addSortRule();
				focusToLastRule();
			}
		});
	},
	
	_addSortRule: function () {
		// create a new sort column, and append the rule to the tail of the rule list
		if (this.ruleDomList.length >= this.MAX_RULE_NUMBER) {
			this.setWarningMsg(dojo.string.substitute(this.nls.SortRuleReachesLimitation, [this.MAX_RULE_NUMBER]));
			return;
		}
		var tr = dojo.create('tr', {'class': 'ws-sort-rule-tr'}, this.rulesBody);
		
		var sortByLabel = dojo.create('td', {'class': 'ws-sort-rule-label'}, tr);
		var sortBySelector = dojo.create('td', {'class': 'ws-sort-rule-selector'}, tr);
		var orderByLabel = dojo.create('td', {'class': 'ws-sort-order-label', innerHTML: this.nls.SortOrder}, tr);
		var orderBySelector = dojo.create('td', {'class': 'ws-sort-order-selector'}, tr);
		var deleteRuleLabel = dojo.create('td', {'class': 'ws-sort-rule-delete'}, tr);
		
		this.ruleDomList.push(tr);
		if (this.ruleDomList.length == 1) {
			// no del button for the first rule
			// text label is 'sort by'
			dojo.create('label', {innerHTML: this.nls.STR_SORT_BY_LABEL}, sortByLabel);
			dojo.addClass(deleteRuleLabel, 'ws-sort-rule-delete-none');
		} else {
			// text label is 'then by'
			dojo.create('label', {innerHTML: this.nls.SortRuleLabelThenBy}, sortByLabel);
			var self = this;
			dojo.connect(deleteRuleLabel, 'onclick', function () {
				self._deleteSortRule(tr);
			});
			dojo.connect(deleteRuleLabel, 'onkeydown', function (e) {
				if (e.keyCode == dojo.keys.ENTER || e.keyCode == dojo.keys.SPACE) {
					self._deleteSortRule(tr);
				}
			});
			// has delete button,
			var deleteRule = dojo.create('div', {
				title: this.nls.SortRuleTitleRemove,
				role: 'button',
				tabindex: '0',
				'aria-label': this.nls.SortRuleTitleRemove
			}, deleteRuleLabel);
		}
		// create a column selector
		var selector = new concord.widgets.LotusTextSelect({
			id: this._generateUniqueId("S_d_sortSelector"),
			maxHeight: 200,
			dir: BidiUtils.isGuiRtl() ? "rtl" : ""
		});
		var self = this;
		dojo.connect(selector, "onChange", function () {
			self.setWarningMsg("");
		});
		this.sortBySelectorList.push(selector);
		selector.placeAt(sortBySelector);
		dijit.setWaiRole(selector.domNode,'listbox');
		dijit.setWaiState(selector.domNode, 'label', this.nls.STR_SORT_BY_LABEL);
		dojo.attr(selector.domNode, "tabIndex", 0);
		dojo.style(selector.dropDown.domNode,"text-indent","5px");
		
		selector.addOption(dojo.clone(this.options));
		// dojo.style(selector.dropDown.domNode,"margin-left","20px");
		// create a order selector
		var order = new concord.widgets.LotusTextSelect({
			id: this._generateUniqueId("S_d_orderSelector"),
			maxHeight: 200,
			dir: BidiUtils.isGuiRtl() ? "rtl" : ""
		});
		this.sortOrderSelectorList.push(order);
		order.placeAt(orderBySelector);
		dijit.setWaiRole(order.domNode,'listbox');
		dijit.setWaiState(order.domNode, 'label', this.nls.SortOrder);
		dojo.attr(order.domNode, "tabIndex", 0);
		dojo.style(order.dropDown.domNode,"text-indent","5px");
		order.addOption(dojo.clone(this.orderOptions));
	},

	_generateUniqueId: function (prefix) {
		prefix = prefix || "";
		if (dojox && dojox.uuid) {
			return prefix + dojox.uuid.generateRandomUuid();
		} else {
			return prefix + ((new Date()).getTime());
		}
	},
	
	_deleteSortRule: function (item) {
		// remove the sort rule, remove it from table, destroy the owned widgets
		var index = -1;
		if (this.ruleDomList.every) {
			this.ruleDomList.every(function (tr, idx) {
				if (tr == item) {
					index = idx;
					return false;
				} else {
					return true;
				}
			});
		} else {
			dojo.forEach(this.ruleDomList, function (tr, idx) {
				if (tr == item) {
					index = idx;
					return;
				}
			});
		}
		if (index > -1) {
			var ruleRowNode = this.ruleDomList[index];
			// remove tr node
			this.rulesBody.removeChild(ruleRowNode);
			// destroy selector widget and radio button group
			this.sortBySelectorList[index].destroy();
			this.sortOrderSelectorList[index].destroy();
			// remove items from array list
			this.ruleDomList.splice(index, 1);
			this.sortBySelectorList.splice(index, 1);
			this.sortOrderSelectorList.splice(index, 1);
			// clear the warning message
			if (this.ruleDomList.length <= this.MAX_RULE_NUMBER) {
				this.setWarningMsg("");
			}
		}
	},
	
	_resetAllRules: function () {
		// on reset, clear all the rules
		if (this.rulesBody) {
			dojo.forEach(this.sortBySelectorList, function (selector) {
				selector.destroy();
			});
			dojo.forEach(this.sortOrderSelectorList, function (radios) {
				radios[0] && (radios[0].destroy());
				radios[1] && (radios[1].destroy());
			});
			dojo.empty(this.rulesBody);
			this.ruleDomList = [];
			this.sortBySelectorList = [];
			this.sortOrderSelectorList = [];
		}
	},
	
	/*SortRules*/_validateRules: function () {
		// only one rule is allowed in one column, otherwise it's considered invalid 
		var trunk = {}, selected;
		var valid = true;
		dojo.forEach(this.sortBySelectorList, function (item) {
			selected = item.attr('value');
			if (trunk[selected]) {
				valid = false;
				return;
			} else {
				trunk[selected] = true;
			}
		});
		return valid;
	}
});