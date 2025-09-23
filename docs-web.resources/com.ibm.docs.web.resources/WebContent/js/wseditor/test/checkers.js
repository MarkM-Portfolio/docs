dojo.provide("websheet.test.checkers");

(function(runner) {
	function colorToHex( c ) {
		//transform 'rgba(0, 0, 0, 0)' or 'rgba(255, 255, 255, 0)' to 'transparent'
		if (c == 'rgba(0, 0, 0, 0)' || c == 'rgba(255, 255, 255, 0)'){
			return 'transparent';
		}
		var m = /rgba?\((\d+), (\d+), (\d+)/.exec( c );
		return m
			? '#' + (1 << 24 | m[1] << 16 | m[2] << 8 | m[3] ).toString(16).slice(1)
			: c;
	};
	
	expect.ui = function() {
		// summary: returns the UI checker used to check UI rendering all by hand.
		//		2 patterns to use this checker.
		//		1.	Use forVisibleRows() and check row by row in visible area. forVisibleRows() accepts a function that defined in the form:
		//			/ boolean / function (rowNode, index, checker)
		//			Where the parameters are,
		//			*	rowNode: the <TR> row node
		//			*	index: the row 1-based index
		//			*	checker: the checker itself
		//			Return true for this callback to continue iterating through rows. False to stop the iterating
		//			The checker will be put in the state that is ready for checking all the cell nodes in the row.
		//			Cells can be checked in any order in the chained function style:
		//				checker.cellAtIndex(index).backgroundColor()...;
		//			For all the cell checking functions, calling with one argument will assert its style and continue the chain. 
		//			Pass no argument will return the value.
		//		2.	Use rowAtIndex to locate any row in visible area. And start the check just as pattern (1).
		
		var _not = false;
		
		var base = runner.app.websheet.Main;
		var grid = base.getCurrentGrid();
		var sheetName = null;
		var rowNodesMap = grid.views.views[1].rowNodes;
		var cellNodes = null;
		var rowHeaderNode = null;
		var rowNode = null;
		var leftRow = rightRow = null;
		var cellNode = null;
		var currentCellIndex = null;
		var dcs = runner.app.websheet.style.DefaultStyleCode;
		var dcsattrs = dcs._attributes;
		
		var _assertCellNodeSet = function() {
			doh.isNot(null, cellNode, "cell node set");
		};
		
		var _assertRowNodeSet = function() {
			doh.isNot(null, leftRow || rightRow, "row node set");
		};
		
		var _assertHeaderAligned = function() {
			// summary: call once to assert current row grid line aligned
			_assertRowNodeSet();
			var headerRect = rowHeaderNode.getBoundingClientRect();
			var cellRect = null;
			for (var i = 0; i < cellNodes.length; i++) {
				var node = cellNodes[i];
				if (dojo.style(node, "display") != "none") {
					// cells at hidden column has display: none, the height would be 0. search until hit a visible cell
					cellRect = node.getBoundingClientRect();
					break;
				}
			}
			expect(headerRect.height).toBe(cellRect.height);
		};
		
		var _fillInCellNodes = function() {
			_assertRowNodeSet();
			var ltds = leftRow ? dojo.query("td", leftRow) : [];
			var rtds = rightRow ? dojo.query("td", rightRow): [];
			cellNodes = ltds.concat(rtds);
		};
		
		var _returnOrCheck = function(v, fg) {
			// defines the "return or check" pattern
			//		fg: the function to get value
			_assertCellNodeSet();
			var vgot = fg();
			if (v == null) {
				return vgot;
			} else {
				expect(vgot).toBe(v);
				// ('Assuming that only main route uses ugly retrun_or_check.');
				// it can cause problem, should never use this return_or_check pattern
				return _self;
			}
		};
		
		var _returnOrCheckStyle = function(style, value, fgs) {
			// check or return arbitrary cell style
			return _returnOrCheck(value, function() {
				var s;
				if (fgs == null) {
					s = dojo.style(cellNode, style);
				} else {
					s = fgs(style);
				}
				if (typeof(s) == "string" && s.indexOf("rgb") == 0) {
					// RGB notation color, covert to HEX
					s = colorToHex(s);
				}
				return s;
			});
		};
		
		// a checklist that registers series of check functions, used for repeated cell style check 
		var _repeatChecklist = [];
		
		var _isInRepeat = false;
		
		var _addToRepeatChecklist = function(funcName) {
			// summary: add a check function to the check list, first argument being the
			// function name bound to _self, latter arguments being the check arguments
			if (!_isInRepeat) {
				var args = [_self, funcName];
				
				for (var i = 1; i < arguments.length; i++) {
					args.push(arguments[i]);
				}
				
				_repeatChecklist.push(dojo.hitch.apply(dojo, args));
			}
		};
		
		var _defaultStyleFallBack = function(v, attrName) {
			if (v == null || v.length == 0) {
				v = dcsattrs[attrName];
			}
			return v;
		};
		
		var forVisibleRows = function(f) {
			// summary: iterate all visible rows in current sheet.
			var start = grid.scroller.firstVisibleRow + 1;
			var end = grid.scroller.lastVisibleRow + 1;
			for (var i = start; i <= end; i++) {
				rowNode = rowNodesMap[i - 1];
				this.rowAtIndex(i);
				if(f(rowNode, i, _self)) {
					break;
				}
			}
			return this;
		};
		
		var rowAtIndex = function(index) {
			// summary: focus on the given row, index should be 1 based.
			var rows = grid.getRowNode(index - 1, false);
			// grid.getRowNode(index, true) returns an array, [leftNode, rightNode], for header view,
			// the header TR is in rightNode.
			rowHeaderNode = grid.getRowNode(index - 1, true)[1];
			leftRow = rows[0], rightRow = rows[1];
			doh.isNot(null, rightRow || leftRow, "row at index " + index + " is not null.");
			_fillInCellNodes();
			_assertHeaderAligned();
			return this;
		};
		
		var hiddenAtIndex = function(index){
			var rows = grid.getRowNode(index - 1, false);
			leftRow = rows[0], rightRow = rows[1];
			if (leftRow){
				expect(leftRow.style.display).toEqual("none");					
			} else if(rightRow){
				expect(rightRow.style.display).toEqual("none"); 
			} else {
				expect(leftRow).toBe(undefined);
				expect(rightRow).toBe(undefined);
			}
			return this;
		};
		
		var cellAtIndex = function(index) {
			// summary: focus on cell node in index, index could be 1-based, or column character ("A" ~ "AZ")
			if (typeof(index) == "string") {
				index = runner.app.websheet.Helper.getColNum(index);
			}
			cellNode = cellNodes[index - 1];
			doh.isNot(null, cellNode, "cell at index " + index + " is not null.");
			if (!_isInRepeat) {
				_repeatChecklist = [];
			}
			currentCellIndex = index;
			return this;
		};
		
		var cell = function(addr) {
			var results = addr.match(/([a-zA-Z]+)(\d+)/);
			_self.rowAtIndex(results[2]);
			_self.cellAtIndex(results[1]);
			return this;
		};
		
		var repeats = function(n) {
			// summary: verifies already checked style on current focused cell repeats for next n cells, n starts from 1
			var oriCellNode = cellNode;
			_isInRepeat = true;
			for (var i = 1; i <= n; i++) {
				// focus on next cell and run all check functions
				cellNode = cellNodes[currentCellIndex + i - 1];
				for (var j = 0; j < _repeatChecklist.length; j++) {
					_repeatChecklist[j]();
				}
				// re-focus to current cell
				cellNode = oriCellNode;
			}
			_isInRepeat = false;
			return this;
		};
		
		var value = function(v){
			// summary: Assert value of focusing value cell is equal to given.
			// content must be string, so turn v to string
			return _returnOrCheck(v == null ? null : v + "", function() {
				var value;
				if (cellNode.textContent) {
					value = cellNode.textContent;
				} else {
					value = cellNode.innerHTML;
				}
				return value;
			});
		};
		
		var bold = function(bBold) {
			_addToRepeatChecklist("bold", bBold);
			return _returnOrCheckStyle("fontWeight", bBold, function(style) {
				var fw = dojo.style(cellNode, style);
				return parseInt(fw) >= 700;
			});
		};
		
		var italic = function(bItalic) {
			_addToRepeatChecklist("italic", bItalic);
			return _returnOrCheckStyle("fontStyle", bItalic, function(style) {
				var fs = dojo.style(cellNode, style);
				return fs.indexOf("italic") != -1;
			});
		};
		
		var underline = function(bUnderline) {
			_addToRepeatChecklist("underline", bUnderline);
			return _returnOrCheckStyle("textDecoration", bUnderline, function(style) {
				var tdecor = dojo.style(cellNode, style);
				return tdecor.indexOf("underline") != -1;
			});
		};
		
		var strikethrough = function(bST) {
			_addToRepeatChecklist("strikethrough", bST);
			return _returnOrCheckStyle("textDecoration", bST, function(style) {
				var tdecor = dojo.style(cellNode, style);
				return tdecor.indexOf("lineThrough") != -1;
			});
		};
		
		var font = function(font) {
			_addToRepeatChecklist("font", font);
			return _returnOrCheckStyle("fontFamily", font, function(style) {
				var fn = dojo.style(cellNode, style);
				return fn.replace(/^'/,'').replace(/'$/,'');
			});
		};
		
		var size = function(size) {
			_addToRepeatChecklist("size", size);
			return _returnOrCheckStyle("fontSize", size, function(style) {
				var fs = dojo.style(cellNode, style);
				// size is in pt number, returned fs is in px with string, parse it first
				var fsInPx = parseFloat(fs);
				// TODO this should only work for 96ppi in runners, update for mac
				return Math.round(fsInPx * 72 / 96);
			});
		};
		
		var freezeAt = function(/*Number*/ row, /*Number*/ col){
			doh.is(row, grid.freezeRow, "grid freeze row value should be " + row);
			
			var viewTable = grid.getContentView().getTable(false, true, true); //right top table
			var lastRow = viewTable.lastChild;
			var viewRowIndex = lastRow ? Math.max(lastRow.gridRowIndex, grid.freezeRow) : 0;
			doh.is(row, viewRowIndex, "sheet freeze at row " + row);
			
			doh.is(col, grid.freezeCol, "grid freeze col value should be " + col);
			var firstRow = grid.getRowNode(grid.scroller.firstVisibleRow);
			var viewColIndex = firstRow[0] ? Math.max(parseInt(dojo.attr(firstRow[0].lastChild, "idx")), grid.freezeCol) : 0;
			doh.is(col, viewColIndex, "sheet freeze at column " + col);
			return this;
		};
		
		// back to the main route
		var leave = function() {
			return _self;
		};
		
		var not = function() {
			_not = !_not;
			return this;
		};
		
		// enter filter route
		var filter = function() {
			var container = grid.getContentView().contentNode;
			filterRoute.filters = dojo.query('.filterHeader', container);
			return filterRoute;
		};
		
		var filter_toBeOfCount = function(l) {
			expect(this.filters.length).toBe(l);
			return this;
		};
		
		var filter_toBeVisible = function() {
			var filterPos;
			for (var i = 0; i< this.filters.length; i++){
				filterPos = dojo.style(this.filters[i]);
				expect(filterPos.display === 'none').toBe(_not);
			}
			return this;
		};
		
		var filter_toBeAt = function(row, startCol, endCol){
			expect(this.filters.length).toEqual(endCol - startCol + 1);
			for (var i = 0; i < endCol - startCol; i++){
				var filterPos = dojo.style(this.filters[i]);
				var col = startCol + i;
				var cellPos = grid.getCellPosition(row, col);
				var visible = true;
				if ((cellPos.top < 0 || cellPos.left < 0) || 
					(cellPos.width <= 0 || cellPos.height <= 0) ||
					(row > grid.freezeRow && row <= grid.scroller.firstVisibleRow) ||
					(col > grid.freezeCol && col < grid.firstVisibleColumn)){
					visible = false;
				}
				if (visible){
					//a visible cell
					expect(parseInt(filterPos.left, 10)).toBeGreaterThan(cellPos.left);
					expect(parseInt(filterPos.left, 10) + parseInt(filterPos.width, 10))
					 .toBeLessThan(cellPos.right);
					expect(parseInt(filterPos.top, 10)).toBeGreaterThan(cellPos.top);
					expect(parseInt(filterPos.top, 10) + parseInt(filterPos.height, 10))
					 .toBeLessThan(cellPos.bottom);	
				} else {
					//a hidden cell
					expect(filterPos.display).toBe("none");
				}
			}
			return this;
		};
		
		var filter_toBeEnabled = function(enabledArr){
			//enabledArr: Array
			//For example, [0, 3] means that rules are enabled at index 0 and 3
			var idxArr = new Array();
			for (var i = 0; i < this.filters.length; i++){
				var filter = this.filters[i];
				var icons = dojo.query(".filterHeaderIconWithRule", filter);
				if(icons.length){
					idxArr.push(i);
				}
			}
			if(enabledArr && enabledArr.length){
				expect(idxArr).toEqual(enabledArr);
			} else {
				expect(idxArr.length).toEqual(0);
			}
			return this;
		};
		
		// enter sheet route
		var sheet = function(sheetName){
			sheetRoute.sheetName = sheetName || grid.getSheetName();
			return sheetRoute;
		};
		
		var sheet_toBeVisible = function(){
			var visible = false;
			dojo.query('span[id^="worksheetTabcontainer_"]', runner.app.document)
				  .forEach(function(node){
						if (this.sheetName === node.title.trim()){
							visible = true;
						}
				  });
			expect(visible).toBe(!_not);
			return this;
		};
		
		var sheet_toBeProtected = function(){
			var locked = false;
			dojo.query('span[id^="websheet_layout_WorksheetContainer"]', runner.app.document)
				  .some(function(node){
					  if (this.sheetName === node.children[0].title.trim()){
						 var imgNode = dojo.query("img", node);
						 if (imgNode && imgNode[0] && imgNode[0].alt == "Protected Sheet"){
							 locked = true;
						 }
						 return;
					  }
				  });
			expect(locked).toBe(!_not);
			return this;
		};
		
		var sheet_toBeAtIndex = function(index){
			//index - 1 based
			var i = -1;
			var nodes = dojo.query('span[id^="worksheetTabcontainer_"]', runner.app.document);
			for(var j = 0; j < nodes.length; j++){
				if(this.sheetName == nodes[j].title.trim()){
					i = j + 1;
					break;
				}
			}
			expect(i).toBe(index);
			return this;
		};
		
		var filterRoute = {
			leave: leave, // back to the main route
			not: not,
			filter: filter,
			sheet: sheet,
			
			toBeOfCount: filter_toBeOfCount, // (count)
		    toBeVisible: filter_toBeVisible, 
			toBeAt: filter_toBeAt,
			toBeEnabled: filter_toBeEnabled // ([0, 3])
		};
		
		var sheetRoute = {
			leave: leave, // back to the main route
			not: not,
			sheet: sheet,
			filter: filter,
			
			toBeVisible: sheet_toBeVisible,
			toBeProtected: sheet_toBeProtected,
			toBeAtIndex: sheet_toBeAtIndex // 1-based index
		};
		
		var _self = {
			forVisibleRows: forVisibleRows, // (func) loop breaks when func returns `something`
			
			rowAtIndex: rowAtIndex, // (index) 1-based row index
			hiddenAtIndex: hiddenAtIndex, // (rowIndex)
			cellAtIndex: cellAtIndex, // (index) number or string
			cell: cell, // (addr) // replace the rowAtIndex(1).cellAtIndex('A') with cell('A1')
			repeats: repeats, // (num)
			value: value, // (value)
			
			bold: bold, // (bBold)
			italic: italic, // (bItalic)
			underline: underline, // (bUnderline)
			strikethrough: strikethrough, // (bStrikethrough)
			font: font, // (font)
			fontFamily: font,
			size: size, // (size)
			
			freezeAt: freezeAt, // (row, col)
			
			// sub routes
			filter: filter, // enter filter route
			sheet: sheet // enter sheet route
		};
		
		// other cell styles that needs to check
		var _styles = [
		    "backgroundColor",
		    "color",
		    "textAlign",
		    "verticalAlign",
		    "borderTopWidth",
		    "borderRightWidth",
		    "borderBottomWidth",
		    "borderLeftWidth",
		    "borderTopStyle",
		    "borderRightStyle",
		    "borderBottomStyle",
		    "borderLeftStyle",
		    "borderTopColor",
		    "borderRightColor",
		    "borderBottomColor",
		    "borderLeftColor"
	    ];

		for (var i = 0; i < _styles.length; i++) {
			var style = _styles[i];
			_self[style] = (function(s) {
				return function(v) {
					_addToRepeatChecklist(s, v);
					return _returnOrCheckStyle(s, v, function(style) {
						return dojo.style(cellNode, style);
					});					
				};
			})(style);
		}
		
		return _self;
	};
	
	expect.model = function() {
		// summary: document model checker in a sequence "." pattern.
		//		possible arguments:
		//			st: sheet model
		//			"fuzzy": use fuzzy model test. In fuzzy model tests, following rules apply:
		//				1,	model number is not counted, hasxxx() checks always pass
		//				2,	repeat number can be any reasonable number no matter what model shows, e.g.
		//					model as ["ce0", 2], "ce0", "ce0"
		//					repeat number check will be passed for 1, 2, 3 and 4.
		//				3,	model at index check passes when index in the middle of a repeated model, e.g.
		//					model as ["ce0", 2]
		//					model at index check passes for index in 1 and 2.
		
		var _not = false;
		
		var sheet = docObj = null;
		var bFuzzy = false;
		// crack arguments
		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (arg == "fuzzy") {
				bFuzzy = true;
			} else {
				sheet = arg;
			}
		}
		
		if (sheet == null) {
			var editor = runner.app.websheet.Main;
			var docObj = editor.controller._documentObj;
			var sheetId = docObj.getSheetId(editor.getCurrentGrid().getSheetName());
			var constants = runner.app.websheet.Constant;
			sheet = docObj.getSheetById(sheetId);
		} else {
			docObj = sheet._parent;
		}
		var sheetName = null;
		var row = null;
		var col = null;
		var model = null;
		var valueCells = null;
		var styleCells = null;
		var coverInfos = null;
		var valueCell = null;
		var styleCell = null;
		var styleCode = null;
		var coverInfo = null;
		var styleMgr = docObj._styleManager;
		var dcs = styleMgr.styleMap.defaultcellstyle;
		
		// in fuzzy mode, what index the testers believe the model starts
		var fuzzyIndex;
		
		var _assertColSet = function(col) {
			doh.isNot(col, null, "has context col set");
		};
		var _assertRowSet = function(row) {
			doh.isNot(row, null, "has context row set");
		};
		var _assertValueCellSet = function(valueCell) {
			doh.isNot(valueCell, null, "has context value cell set");
		};
		var _assertStyleCellSet = function(styleCell) {
			doh.isNot(styleCell, null, "has context style cell set");
		};
		
		var hasRows = function(/*Number*/count) {
			// summary: Assert number of rows is equal to given number.
			if (!bFuzzy) {
				doh.is(count, sheet._rows.length, "row total count");
			}
			return this;
		};
		
		var rowAtIndex = function(/*Number*/index){
			// summary: Focus on row at index.
			var msg, r;
			if (bFuzzy) {
				msg = "[Fuzzy]row exists at index " + index;
				r = sheet.getRow(index, true);
				fuzzyIndex = index;
			} else {
				msg = "row exists at index " + index;
				r = sheet.getRow(index);
			}
			doh.t(r != null, msg);
			if (!bFuzzy) {
				doh.is(index, r.getIndex(), msg);
			}
			row = r;
			model = row;
			valueCells = r.getValueCells();
			styleCells = r._styleCells;
			coverInfos = r._coverInfos;
			return this;
		};
		
		var notHasRowAt = function(/*Number*/index) {
			// summary: Assert row at index does not exist.
			if (bFuzzy) {
				doh.t(sheet.getRow(index, true) == null, "[Fuzzy] row does not exist at " + index);
			} else {
				doh.t(sheet.getRow(index) == null, "row does not exist at " + index);
			}
			return this;
		};
		
		var hasColumns = function(num) {
			// summary: Assert number of rows is equal to given number.
			if (!bFuzzy) {
				expect(sheet._columns.length).toBe(num);
			}
			return this;
		};
		
		var colAtIndex = function(/*Number*/index) {
			// summary: Focus on column at index.
			var msg, c;
			if (bFuzzy) {
				msg = "[Fuzzy]column exists at index " + index;
				c = sheet.getColumn(index, true);
				fuzzyIndex = index;
			} else {
				msg = "column exists at index " + index;
				c = sheet.getColumn(index);
			}
			doh.t(c != null, msg);
			if (!bFuzzy) {
				doh.is(index, c.getIndex(), msg);
			}
			col = c;
			model = col;
			return this;
		};
		
		var notHasColAt = function(/*Number*/index){
			// summary: Assert column at index does not exist.
			if (bFuzzy) {
				doh.t(sheet.getColumn(index, true) == null, "[Fuzzy] column does not exist at " + index);
			} else {
				doh.t(sheet.getColumn(index)==null, "column does not exist at " + index);
			}
			return this;
		};
		
		var colStyle = function(/*Number*/index) {
			// summary: Assert column at index has style.
			doh.t(col.getStyle()!=null,"has col style cell");
			styleCode = dojo.clone(dcs);
			dojo.mixin(styleCode._attributes, col.getStyle()._attributes);
			return this;
		};
		
		var noColStyle = function(/*Number*/index){
			// summary: Assert column at index has no style.
			doh.t(col.getStyle()==null,"not has a col style");
			return this;
		};
		
		var repeats = function(/*Number*/repeat){
			// summary: Focusing model repeats given number of times.
			//		Note: don't fuzzy check row repeat, it can't tell precisely since it is troublesome to check
			//		every cell for row repeatness.
			//		For row fuzzy repeat check, passes check when row repeat is not smaller than expected repeat 
			doh.t(model != null, "has context model set");
			if (bFuzzy) {
				if (model.isInstanceOf(websheet.model.Row)) {
					expect(model.getRepeatedNum() >= repeat).toBeTruthy();
				} else {
					// it is believed that current focused model starts at fuzzyIndex and has repeat number "repeat"
					// start from fuzzyIndex and look
					var sid = model._styleId;
					var currModel = model;
					var currIndex = fuzzyIndex;
					while (repeat >= 0) {
						// assert that when repeat not finished, current position still have model holding the same
						// style
						expect(currModel).not.toBeNull();
						expect(currModel._styleId).toBe(sid);
						// decrease the repeat
						var currModelIndex = currModel.getCol ? currModel.getCol() : currModel.getIndex();
						var currModelEnd = currModelIndex + currModel.getRepeatedNum();
						repeat -= (currModelEnd - currIndex) + 1;
						currIndex = currModelEnd + 1;
						// iterate to next model
						if (currModel.isInstanceOf(websheet.model.Column)) {
							currModel = sheet.getColumn(currIndex, false);
						} else {
							currModel = row.getCell(currIndex, runner.app.websheet.Constant.CellType.STYLE, false);
						}
					}
				}
			} else {
				doh.is(repeat, model.getRepeatedNum(), "model repeats correct");
			}
			return this;
		};
		
		var height = function(/*Number*/h){
			// summary: Height of focusing row is equal to given number.
			_assertRowSet(row);
			doh.is(h, row.getHeight(), "row height correct");
			return this;
		};
		
		var hasHeight = function(){
			// summary: Height of focusing row is setted.
			_assertRowSet(row);
			doh.isNot(0, row.getHeight());
			return this;	
		};
		
		var isFiltered = function(){
			// summary: Visibility of focusing row is filter.
			_assertRowSet(row);
			doh.is(constants.ROW_VISIBILITY_ATTR.FILTER, row.getVisibility());
			return this;	
		};
		
		var isHidden = function(){
			// summary: Visibility of focusing row is hide.
			_assertRowSet(row);
			doh.is(constants.ROW_VISIBILITY_ATTR.HIDE, row.getVisibility());
			return this;	
		};
		
		var isShown = function(){
			// summary: Visibility of focusing row is visible.
			_assertRowSet(row);
			var v = row.getVisibility();
			doh.isNot(constants.ROW_VISIBILITY_ATTR.HIDE, v);
			doh.isNot(constants.ROW_VISIBILITY_ATTR.FILTER, v);
			return this;	
		};
		
		var width = function(/*Number*/w){
			// summary: Width of focusing column is equal to given number.
			_assertColSet(col);
			doh.is(w, col.getWidth());
			return this;	
		};
		
		var hasWidth = function(){
			// summary: Width of focusing column is setted.
			_assertColSet(col);
			doh.isNot(null, col.getWidth());
			return this;	
		};
		
		var colIsHidden = function(){
			// summary: Visibility of focusing column is hide.
			_assertColSet(col);
			doh.is(constants.COLUMN_VISIBILITY_ATTR.HIDE, col.getVisibility(), "col is hidden");
			return this;	
		};
		
		var colIsShown = function(){
			// summary: Visibility of focusing column is visible.
			_assertColSet(col);
			doh.isNot(constants.COLUMN_VISIBILITY_ATTR.HIDE, col.getVisibility(), "col is shown");
			return this;	
		};
		
		var hasStyleCells = function(/*Number*/count) {
			// summary: Assert number of style cells at focusing row is equal to given number.
			if (!bFuzzy) {
				_assertRowSet(row);
				doh.is(count, styleCells.length, "style cells total count");
			}
			return this;
		};
		
		var hasCellStyleAtIndex = function(/*Number*/ index) {
			// summary: Style cell or follow master style cell at the given index.
			//		this can be used in fuzzy mode also
			_assertRowSet(row);
			var msg = "style cell at index " + index;
			var sc = row.getCell(index, runner.app.websheet.Constant.CellType.STYLE, true);
			doh.isNot(sc, null, msg);
			model = styleCell = sc;
			sc = styleMgr.getStyleById(sc.getStyleId());
			doh.isNot(sc, null, msg);
			styleCode = dojo.clone(dcs);
			dojo.mixin(styleCode._attributes, sc._attributes);
			return this;
		};
		
		var hasValueCells = function(/*Number*/count){
			// summary: Assert number of value cells at focusing row is equal to given number.
			if (!bFuzzy) {
				_assertRowSet(row);
		        var cnt = 0;
				for (var i = 0; i < valueCells.length; i++){
					cnt += valueCells[i]? 1 : 0;
				}
				doh.is(count, cnt, "value cells total count");
			}
			return this;
		};
		
		var hasCoverInfos = function(/*Number*/count){
			// summary: Assert number of cover infos at focusing row is equal to given number.
			if (!bFuzzy) {
				_assertRowSet(row);
				doh.is(count, coverInfos.length, "cover Infos total count");
			}
			return this;
		};
		
		var f_valueCell = function(row, col) {
			this.rowAtIndex(row);
			this.valueCellAtIndex(col);
			return this;
		};
		
		var valueCellAtIndex = function(/*Number*/index){
			// summary: Assert value cell exists at index at focusing row and focus on it.
			_assertRowSet(row);
			var msg = "value cell at index " + index;
			var vc = row.getCell(index);
			doh.isNot(vc, null, msg);
			doh.is(index, vc.getCol(), msg);
			valueCell = vc;
			model = vc;
			return this;
		};
		
		var value = function(v){
			// summary: Assert value of focusing value cell is equal to given number.
			_assertValueCellSet(valueCell);
			doh.is(v, valueCell.getValue(), "value cell value correct");
			return this;
		};
		
		var cvalue = function(v) {
			// summary: Assert calculated value of focusing value cell is equal to given number.
			_assertValueCellSet(valueCell);
			doh.is(v, valueCell.getCalculatedValue(), "value cell calculated value correct");
			return this;
		};
		
		var type = function(t) {
			// summary: Assert cell typeof focusing value cell is equal to given number.
			_assertValueCellSet(valueCell);
			doh.is(t, valueCell.getType(), "value cell value correct");
			return this;
		};
		
		var setCalculated = function() {
			// summary: set cell _unCalc to false
			_assertValueCellSet(valueCell);
			valueCell._isUnCalc = false;
			return this;
		};
		
		var noStyleCellAtIndex = function(/*Number*/index){
			// summary: Assert no style cell exists at index at focusing row.
			_assertRowSet(row);
			if (bFuzzy) {
				var sc = row.getCell(index, runner.app.websheet.Constant.CellType.STYLE, true);
				doh.is(sc, null, "[Fuzzy] no style cell at index " + index);
			} else {
				var sc = row.getCell(index, runner.app.websheet.Constant.CellType.STYLE);
				doh.is(sc, null, "no style cell at index " + index);
			}
			
			return this;
		};
		
		var noValueCellAtIndex = function(/*Number*/index){
			// summary: Assert no value cell exists at index at focusing row.
			_assertRowSet(row);
			var vc = row.getCell(/*Number*/index);
			doh.is(vc, null, "no value cell at index " + index);
			return this;	
		};
		
		var styleCellAtIndex = function(/*Number*/index){
			// summary: Assert style cell exists at index at focusing row.
			_assertRowSet(row);
			var msg, sc;
			if (bFuzzy) {
				sc = row.getCell(index, runner.app.websheet.Constant.CellType.STYLE, true);
				msg = "[Fuzzy] style cell at index " + index;
				fuzzyIndex = index;
			} else {
				sc = row.getCell(index, runner.app.websheet.Constant.CellType.STYLE, false);
				msg = "style cell at index " + index;
			}
			doh.isNot(sc, null, msg);
			model = styleCell = sc;
			sc = styleMgr.getStyleById(sc.getStyleId());
			doh.isNot(sc, null, msg);
			styleCode = dojo.clone(dcs);
			dojo.mixin(styleCode._attributes, sc._attributes);
			return this;
		};
		
		var hasStyle = function(key, value){
			// summary: Assert focusing style cell contains given style. Style is given by key-value pairs.
			//      This may not be easy to use. You may use runner.testUtils.utils.builders.style to build
			//      StyleCode and use hasStyles(styleObj) instead to do test.
			_assertStyleCellSet(styleCode);
			doh.is(styleCode.getAttr(key), value, "contains style " + key);
			return this;
		};
		
		var hasStyles = function(/*StyleCode*/styleObj){
			// summary: Check if focusing style cell contains the styles that styleObj has. You may use 
			//      runner.testUtils.utils.builders.style to build StyleCode. We merge default cell styles
			//      into style cell before check. So the test will not fail if you put some default cell 
			//      styles into styleObj. Notice that focusing style cell may contain other styles that 
			//      styleObj doesn't have. You can user style(styleObj) instead if you want to check whether
			//      they are equal.
			_assertStyleCellSet(styleCode);
			var msg = "contains style ";
			for(var key in styleObj.getAttributes()){
				doh.is(styleCode.getAttr(key), styleObj.getAttr(key), msg + key);
			}
			return this;
		};
		
		var style = function(/*StyleCode*/styleObj){
			// summary: Check if styles that style cell has is equal to the styles that styleObj has. You
			//      may use runner.testUtils.utils.builders.style to build StyleCode. We merge default cell
			//      styles into style cell and styleObj before check.
			_assertStyleCellSet(styleCode);
			var sc = dojo.clone(dcs);
			dojo.mixin(sc._attributes, styleObj._attributes);
			doh.is(sc.hashCode(), styleCode.hashCode());
			return this;
		};
		
		var noCoverInfoAtIndex = function(/*Number*/index) {
			// summary: Assert no cover info at index at focusing row.
			_assertRowSet(row);
			var ci = row.getCell(index, runner.app.websheet.Constant.CellType.COVERINFO);
			expect(ci).toBeNull();
			return this;
		};
		
		var coverInfoAtIndex = function(/*Number*/index) {
			// summary: Assert cover info exists at index at focusing row and focus on it.
			var msg = "cover info at index " + index;
			_assertRowSet(row);
			var ci = row.getCell(index, runner.app.websheet.Constant.CellType.COVERINFO);
			expect(ci).not.toBeNull();
			coverInfo = ci;
			model = ci;
			return this;
		};
		
		var colSpan = function(/*Number*/colspan) {
			// summary: Assert colspan of focusing cover info is equal to given number.
			doh.isNot(coverInfo, null);
			doh.is(colspan, coverInfo.getColSpan());
			return this;
		};
		
		var freezeAt = function(/*Number*/ row, /*Number*/ col){
			doh.is(row, sheet.getFreezePos(sheet.Constant.FreezeType.ROW) || 0, "sheet freeze at row " + row);
			doh.is(col, sheet.getFreezePos(sheet.Constant.FreezeType.COLUMN) || 0, "sheet freeze at column " + col);
			return this;
		};
		
		var filterAt = function(rangeAddr){
			var filterRanges = docObj.getAreaManager().getRangesByUsage(websheet.Constant.RangeUsage.FILTER, sheet.getSheetName());
			if (rangeAddr) {
				//Expect: a filter exists
				expect(filterRanges).not.toBeNull();
				expect(filterRanges.length).toEqual(1);
				//Compare filter range with a given address
				var parseRef = runner.app.websheet.Helper.parseRef(rangeAddr);
				var info = filterRanges[0]._getRangeInfo();
				if (parseRef){
					expect(info.startRow).toEqual(parseRef.startRow);
					//expect(info.endRow).toEqual(parseRef.endRow);
					expect(info.startCol).toEqual(parseRef.startCol);
					expect(info.endCol).toEqual(parseRef.endCol);
				}
			} else {
				//Expect: no filter exists					
				expect(filterRanges.length).toBe(0);
			}
			return this;				
		};
		
		var hasName = function(name, rangeAddr){
			var parseRef = runner.app.websheet.Helper.parseRef(rangeAddr);				
			var exist = false;
			var names = docObj.getAreaManager().getRangesByUsage(websheet.Constant.RangeUsage.NAME, parseRef.sheetName);
			for (var i = 0; i < names.length; i++ ){
				if (names[i]._id != name){
					continue;
				}else{
					exist = true;						
					var info = names[i]._getRangeInfo();
					if (parseRef){
						expect(info.startRow).toEqual(parseRef.startRow);
						expect(info.endRow).toEqual(parseRef.endRow);
						expect(info.startCol).toEqual(parseRef.startCol);
						expect(info.endCol).toEqual(parseRef.endCol);
					}
					break;
				}
			}
			expect(exist).toBe(true);
			return this;		
		};
		
		var leave = function() {
			return _self;
		};
		var not = function() {
			_not = !_not;
			return this;
		};
		
		var f_sheet = function(sheetName){
			sheetRoute.sheetName = sheetName || sheet.getSheetName();
			return sheetRoute;
		};
		
		var sheet_toBeProtected = function(){
			expect(docObj.isSheetProtected(this.sheetName)).toBe(!_not);
			return this;
		};
		
		var sheet_toBeVisible = function(){
			var sheetName = this.sheetName;
			var visible = false;
			if (docObj.getSheet(sheetName) && docObj.getSheet(sheetName).isSheetVisible()){
				visible = true;
			}
			expect(visible).toBe(!_not);
			return this;
		};
		
		var sheet_toExist = function() {
			if (_not) {
				expect(docObj.getSheet(this.sheetName)).toBeNull();
			} else {
				expect(docObj.getSheet(this.sheetName)).not.toBeNull();
			}
			return this;
		};
		
		var sheetRoute = {
			leave: leave,
			not: not,
			sheet: f_sheet,
			
			toBeProtected: sheet_toBeProtected,
			toBeVisible: sheet_toBeVisible,
			toExist: sheet_toExist
		};
		
		var _self = {
			hasRows: hasRows,
			rowAtIndex: rowAtIndex,
			notHasRowAt: notHasRowAt,
			hasColumns: hasColumns,
			colAtIndex: colAtIndex,
			notHasColAt: notHasColAt,
			colStyle: colStyle, // (index) assert col of index has style
			noColStyle: noColStyle,
			repeats: repeats,
			height: height,
			hasHeight: hasHeight,
			isFiltered: isFiltered,
			isHidden: isHidden,
			isShown: isShown,
			width: width,
			hasWidth: hasWidth,
			colIsHidden: colIsHidden,
			colIsShown: colIsShown,
			hasStyleCells: hasStyleCells,
			hasCellStyleAtIndex: hasCellStyleAtIndex,
			hasValueCells: hasValueCells,
			hasCoverInfos: hasCoverInfos,
			valueCell: f_valueCell,
			valueCellAtIndex: valueCellAtIndex,
			value: value,
			cvalue: cvalue,
			type: type,
			setCalculated: setCalculated,
			
			noStyleCellAtIndex: noStyleCellAtIndex,
			noValueCellAtIndex: noValueCellAtIndex,
			styleCellAtIndex: styleCellAtIndex,
			hasStyle: hasStyle,
			hasStyles: hasStyles,
			style: style,
			
			noCoverInfoAtIndex: noCoverInfoAtIndex,
			coverInfoAtIndex: coverInfoAtIndex,
			colSpan: colSpan,
			
			freezeAt: freezeAt, // (row, col)
			filterAt: filterAt, // (addr)
			hasName: hasName, // (name, addr)
			
			// sub routes
			sheet: f_sheet // enter sheet sub-route
		};
		
		return _self;
	};
	
	
	expect.css = function() {
		var hasStyle = function(cssStr, styleName, value) {
			// summary: determine if provided cssStr has provided styleName with the provided value
			var reg = new RegExp(styleName + "\\s*:\\s*" + value + "\\s*;?");
			return reg.test(cssStr);
		};
		
		var notHasStyle = function(cssStr, styleName, value) {
			return !this.hasStyle(cssStr, styleName, value);
		};
		
		var definedCustomClass = function(classStr, styleName, value) {
			// summary: checks if the classStr defines a class with the styleName and value specificed.
			//		if defined, return the defined class name, if not, returns null
			var reg = /\.([^\s]+)\s*\{(.*)\}/;
			var m;
			if (m = classStr.match(reg)) {
				if (this.hasStyle(m[2], styleName, value)) {
					return m[1];
				} else {
					return null;
				}
			} else {
				return null;
			}
		};
		
		return {
			hasStyle: hasStyle,
			notHasStyle: notHasStyle,
			definedCustomClass: definedCustomClass
		};
	};
	
})(window);