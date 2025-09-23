dojo.provide("websheet.test.actions");

(function(runner) {
	var log = function(t) {
		console.log(t);
	};
	
    var currentSheet = function() {
        return runner.app.websheet.Main.getCurrentGrid();
    };

    var save = function(){
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.SAVEDRAFT);
        return this;
    };

    var publish = function(text){
        runner.app.websheet.Main.publish({"changeSummary" : text || "actions.js"});
        return this;
    };

    var insertSheet = function(sheetName){
    	var docObj = runner.app.websheet.Main.getDocumentObj();
    	if (!docObj.isSheetExist(sheetName)) {
            runner.app.websheet.Main._insertSheet(runner.app.websheet.Main, sheetName);
    	} else {
    		switchSheet(sheetName);
    	}
        return this;
    };

    var moveSheet = function(sheetName, index) {
        var docObj = runner.app.websheet.Main.getDocumentObj();
        runner.app.websheet.Main._currentSheetId = docObj.getSheetId(sheetName);
        runner.app.websheet.Main._moveSheet(runner.app.websheet.Main, index);
        return this;
    };

    var renameSheet = function(sheetName, newName) {
        var docObj = runner.app.websheet.Main.getDocumentObj();
        runner.app.websheet.Main._currentSheetId = docObj.getSheetId(sheetName);
        runner.app.websheet.Main._renameSheet(runner.app.websheet.Main, newName);
        return this;
    };

    var deleteSheet = function(sheetName) {
    	var docObj = runner.app.websheet.Main.getDocumentObj();
        runner.app.websheet.Main._currentSheetId = docObj.getSheetId(sheetName);
        runner.app.websheet.Main._deleteSheet(runner.app.websheet.Main, true);
        return this;
    };

    var hideSheet = function() {
    	runner.app.websheet.Main.execCommand(runner.app.commandOperate.HIDESHEET);
    	return this;
    };
    
    var showSheet = function(sheetName) {
    	var doc = runner.app.websheet.Main.getDocumentObj();
    	var sheetId = doc.getSheetId(sheetName);
		runner.app.websheet.Main.execCommand(runner.app.commandOperate.UNHIDESHEET, [sheetId]);
    	return this;
    };
    
    var undo = function() {
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.UNDO);
        return this;
    };

    var redo = function() {
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.REDO);
        return this;
    };

    var cut = function() {
    	runner.app.websheet.Main.cut();
        return this;
    };

    var copy = function() {
    	runner.app.websheet.Main.copy();
        return this;
    };

    var paste = function() {
        runner.app.websheet.Main.paste();
        return this;
    };

    var freezeRow = function(rowIndex) {
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.FREEZEWINDOW, [{row:rowIndex}]);
        return this;
    };

    var freezeColumn = function(/*String or Number*/col) {
        // summary: freeze columns at given position
    	// column - name, e.g "A", "AZ" or 1-based index
    	var colIndex = 0;
    	if (typeof col == "number"){
    		colIndex = col;
    	} else {
    		colIndex = runner.app.websheet.Helper.getColNum(col);
    	}
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.FREEZEWINDOW, [{col:colIndex}]);
        return this;
    };

    var insertName = function(rangeName, addr){
        //summary: insert a named range
        //rangeName: string
        //              rangeId
        //addr: string
        //              MS format address, single quote pattern
        var nameHdl = runner.app.websheet.Main.getNameRangeHdl();
        nameHdl.onRefChange(addr);
        //Format to absolute column and row $A$1
        nameHdl._addressSerialize();
        nameHdl.insertNameRange(rangeName);
        return this;
    };

    var updateName = function(rangeName, newsAddr){
        //summary: change the reference range of a name
        //rangeName: string
        //              rangeId
        //newsAddr: string
        //              MS format address, single quote pattern
        var docObj = runner.app.websheet.Main.getDocumentObj();
        var nameHdl = runner.app.websheet.Main.getNameRangeHdl();
        nameHdl.onRefChange(newsAddr);
        nameHdl._addressSerialize();
        nameHdl.currRange = docObj.getAreaManager()
        						.getRangeByUsage(rangeName,
        								runner.app.websheet.Constant.RangeUsage.NAME);
        nameHdl.setSelectedRange();
        return this;
    };

    var deleteName = function(rangeName){
        var docObj = runner.app.websheet.Main.getDocumentObj();
        var range = docObj.getAreaManager().getRangeByUsage(rangeName,
                              runner.app.websheet.Constant.RangeUsage.NAME, true);
        runner.app.websheet.Main.getNameRangeHdl().deleteNameRange(range);
        return this;
    };

    var _setInstantFilter = function(bNew){
    	//summary: create or remove an auto filter
    	//bNew: true - create, false - remove
    	runner.app.websheet.Main.getToolbar().checkToolbarById("S_t_InstantFilter", bNew);
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.INSTANTFILTER, [true]);
    };
    
    var createFilter = function(){
    	_setInstantFilter(true);
    	return this;
    };
    
    var removeFilter = function(){
    	_setInstantFilter(false);
    	return this;
    };
    
    var _filterRows = function(colIdx, data){
    	runner.app.websheet.Main.execCommand(runner.app.commandOperate.FILTERROWS,[colIdx, data]);
    };
    
    var keywordFilter = function(colIdx, type, showArr, addArr, delArr){
        //summary: filter out rows by keywords
    	//colIdx:  1-based, from column A 
    	//type: set, update
    	//showArr:  Array, show keywords 
    	//addArr: Array,  add keywords to showArr
    	//delArr: Array, delete keywords from showArr
    	var data = {};
        data.type = "key";
        if (type == "set") {         
            data.set = {"keys" : showArr};
        }
        if (type == "update") {
         	data.add = addArr;
            data.del = delArr;
        }
        _filterRows(colIdx, data);
        return this;
    };   
    
    var customFilter = function(colIdx, op1, v1, op2, v2, cnj){
        //summary: filter out rows by keywords
    	//colIdx:  1-based, from column A 
    	//op: operator  !=, >, <, >=, <=, null(equal)
    	//v:  value or regx: *v - end, v* - begin, *v* - contain
    	//cnj: conjunction 'and', 'or'
        var data = {};
        data.set = {};
        data.type = "custom";
        var rules = new Array();
        rules.push({op : op1, v : v1});
        if(v2){
            rules.push({op : op2, v : v2});
            data.set[cnj] = 1;
        } else {
        	data.set["and"] = 1;
        }
        data.set["rules"] = rules;
        _filterRows(colIdx, data);
        return this;
    };
    
   var clearFilter = function(colIdx){
	   //summary: disable filter rules at colIdx
	   _filterRows(colIdx, {"clear": 1});
	   return this;
    };

    var filterSort = function(colIdx, bAsc){
        //summary: sort via a instant filter
    	//colIdx: 1-based column index
        //bAsc: true - sort in ascending order, false - sort in descending order
    	if(typeof(colIdx) != "number" || colIdx < 1 ){
    		return this;
    	}
        var sheetName = runner.app.websheet.Main.getCurrentGrid().getSheetName();
        var filter = runner.app.websheet.Main.getAutoFilterHdl().getFilter(sheetName);
        if(filter) {
        	filter._activeIndex = colIdx;
        	filter.prepareData();
            filter.sort(bAsc);
        }
        return this;
    };
    
    var rangeSort = function(bAscend, bHeader, colIndex){
        //bAscend: boolean
        //              True - sort in ascending order, false - sort in descending order
        //bHeader: boolean
        //              True - The range contains column labels
        //colIndex: int
        //              Sort by the column index of the selection, base 0
    	var grid = runner.app.websheet.Main.getCurrentGrid();
        var sheetName = grid.getSheetName();
        var selector = grid.selection.selector();
        var rangeInfo = selector.getRangeInfo();
        var rangeAddress = runner.app.websheet.Helper.getAddressByIndex(sheetName,rangeInfo.startRow,rangeInfo.startCol,
                                                             null,rangeInfo.endRow,rangeInfo.endCol);
        runner.app.dojo["require"]("websheet.sort.RangeSorting");
        var rangeSorting = new runner.app.websheet.sort.RangeSorting(rangeAddress);
        rangeSorting._bLocal = true;
        var sortArgs = {withHeader: bHeader, isAscend: bAscend, sortById: [colIndex]};
        var sortData = {sortcriterion:sortArgs};
        runner.app.websheet.Main.sortRange(rangeSorting, sortData);
        return this;
    };

    var setBorderType = function(lineType){
    	//lineType: string Constant.BORDERTYPE
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.BORDERCUSTOMIZE,
                            {type : runner.app.BORDERCUSTOMIZE.CUSTOMIZEBORDER, borderType : lineType});
        return this;
    };

    var setBorderStyle = function(lineStyle){
        //lineStyle: string Constant.BORDERSTYLE
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.BORDERCUSTOMIZE,
                            {type : runner.app.BORDERCUSTOMIZE.CUSTOMIZESTYLE, borderStyle : lineStyle});
        return this;
    };
    
    var setBorderColor = function(lineColor){
        //lineColor: string HTML color code
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.BORDERCUSTOMIZE,
                            {type : runner.app.BORDERCUSTOMIZE.CUSTOMIZECOLOR, color : lineColor});
        return this;
    };

    var clearBorder = function(){
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.BORDERCUSTOMIZE,
                            {type : runner.app.BORDERCUSTOMIZE.CUSTOMIZEBORDER, borderType : BORDERSTYLE.CLEARBORDERS});
        return this;
    };

    var setBackgroundColor = function(bgColor){
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.SETSTYLE, [{bg : bgColor}]);
        return this;
    };

    var setNumberFormat = function(formatCode){
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.SETSTYLE, [{format : formatCode}]);
        return this;
    };

    var removeFormat = function(){
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.DEFAULTSTYLE);
        return this;
    };

    var setAlignment = function(alignType){
        //alignType: string
        //                horizontal: "left", "center", "right"
        //    		      vertical: "top", "middle", "bottom"
        var align = runner.app.commandOperate['ALIGN' + alignType.toUpperCase()];
        runner.app.websheet.Main.execCommand(align);
        return this;
    };
    
    var setFontEffect = function(effect){
        //effect: string "bold", "italic", "underline", "strikethrough"
        if (effect == 'strikethrough') {
        	effect = 'strike';
        }
        runner.app.websheet.Main.execCommand(runner.app.commandOperate[effect.toUpperCase()]);
        return this;
    };

    var setFontName = function(fontName){
        //fontName: string "Comic Sans MS"
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.FONT, [fontName]);
        return this;
    };

    var setFontSize = function(fontSize){
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.SETSTYLE,[{font: {sz: fontSize}}]);
        return this;
    };

    var setFontColor = function(fontColor){
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.SETSTYLE,[{font: {c: fontColor}}]);
        return this;
    };

    var wrapText = function(){
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.WRAPTEXT);
        return this;
    };
    
    var insertRowsAbove = function() {
    	runner.app.websheet.Main.execCommand(runner.app.commandOperate.INSERTROW);
    	return this;
    };

    var insertRowsBelow = function() {
    	runner.app.websheet.Main.execCommand(runner.app.commandOperate.INSERTROWBELOW);
    	return this;
    };

    var deleteRows = function(){
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.DELETEROW);
        return this;
    };

    var hideRows = function(){
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.HIDEROW);
        return this;
    };

    var showRows = function(){
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.SHOWROW);
        return this;
    };

    var setRowHeight = function(height){
        //height: pt
    	var grid = runner.app.websheet.Main.getCurrentGrid();
        var sheetName = grid.getSheetName();
        var selector = grid.selection.selector();
        // rowIndex: selector 0-based, setRowHeight() 1-based
        runner.app.websheet.Main.setRowHeight(sheetName, selector._startRowIndex + 1, selector._endRowIndex + 1, height);
        return this;
    };

    var insertColumnsBefore = function() {
    	runner.app.websheet.Main.execCommand(runner.app.commandOperate.INSERTCOLUMN);
    	return this;
    };
    
    var insertColumnsAfter = function() {
    	runner.app.websheet.Main.execCommand(runner.app.commandOperate.INSERTCOLUMNAFTER);
    	return this;
    };

    var deleteColumns = function(){
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.DELETECOLUMN);
        return this;
    };

    var hideColumns = function(){
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.HIDECOLUMN);
        return this;
    };

    var showColumns = function(){
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.SHOWCOLUMN);
        return this;
    };

    var setColumnWidth = function(width){
        var n = currentSheet().getSheetName();
        var s = runner.app.websheet.Main.getController().getGrid(n).selection.selector();
        runner.app.websheet.Main.setColumnWidth(n, s._startColIndex, s._endColIndex, width);
        return this;
    };

    var clearCell = function(){
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.CLEAR);
        return this;
    };
    
    var mergeCell = function(){
        //summary: merge or split
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.MERGECELL);
        return this;
    };
    
    var editCell = function(value){
        //value: cell raw value
    	var grid = runner.app.websheet.Main.getCurrentGrid();
    	var sheetName = grid.sheetName;
    	var selector = grid.selection.selector();
    	if(selector.selectingCell())
    	{
    		var col = runner.app.websheet.Helper.getColChar(selector.focusCol);
    		runner.app.websheet.Main.execCommand(runner.app.commandOperate.CELLEDIT, [sheetName, value, selector.focusRow , col]);
    	}
        return this;
    };
    
    var autofill = function(direction, steps){
        //direction: string up,down,right,left
        var maxCol = runner.app.websheet.Constant.MaxColumnIndex;
        var maxRow = parseInt(runner.app.g_maxSheetRows);
        //Source range
        var grid = runner.app.websheet.Main.getCurrentGrid();
        var sheetName = grid.getSheetName();
        var selector = grid.selection.selector();
        var startRow = selector._startRowIndex + 1;
        var endRow = selector._endRowIndex + 1;
        var startCol = selector._startColIndex;
        var endCol = selector._endColIndex;
        //Target range
        var toStartRow = startRow;
        var     toEndRow = endRow;
        var     toStartCol = startCol;
        var     toEndCol = endCol;
        if (steps > 0){
            direction = direction.toLowerCase();
            switch(direction){
            case "down":
                toStartRow = endRow + 1 > maxRow ? maxRow : endRow + 1 ;
                toEndRow = endRow + steps > maxRow ? maxRow: endRow + steps;
                break;
            case "right":
                toStartCol = endCol + 1 >  maxCol ?  maxCol : endCol + 1;
                toEndCol = endCol + steps > maxCol ?  maxCol : endCol + steps;;
                break;
            case "up":
                toEndRow = startRow - 1 > 1 ? startRow - 1 : 1;
                toStartRow = startRow - steps > 1 ? startRow - steps: 1;
                break;
            case "left":
                toEndCol = startCol - 1 > 1 ? startCol - 1 : 1;
                toStartCol = startCol - steps > 1 ?  startCol - steps : 1;
                break;
            default:
                break;
            }
        }
        runner.app.websheet.Main.execCommand(runner.app.commandOperate.FILLRANGE, [{sheetName : sheetName, startRow : startRow,
                                              endRow : endRow, startCol : startCol, endCol : endCol},
                                             {sheetName : sheetName , startRow : toStartRow, endRow : toEndRow,
                                              startCol : toStartCol, endCol : toEndCol}]);
        return this;
    };

    var focus = function(addr) {
        runner.app.websheet.Main.formulaBar.setNameBoxValue(addr);
        runner.app.websheet.Main.formulaBar.syncOnNameBoxEnter({ keyCode: dojo.keys.ENTER });
        return this;
    };
    
    var focusCell = function(row, col) {
    	var colAsStr = runner.app.websheet.Helper.getColChar(col);
    	return this.focus(colAsStr + row);
    };

    var pageDown = function() {
        var e = { "timeStamp": new Date().getTime() };
        var grid = currentSheet();
        grid._pageDown(e);
        // clear _PCount, so pageDown will not be treated as not releasing
        grid._PCount = 0;
        return this;
    };

    var pageUp = function() {
        var e = { "timeStamp": new Date().getTime() };
        var grid = currentSheet();
        grid._pageUp(e);
        // clear _PCount, so pageDown will not be treated as not releasing
        grid._PCount = 0;
        return this;
    };

    var scrollToRow = function(/*Number*/rowIndex){
        currentSheet().scrollToRow(rowIndex - 1);
        return this;
    };
    
    var scrollToColumn = function(/*String or Number*/col){
    	var colIndex = 1;
    	if (typeof col == "number"){
    		colIndex = col;
    	} else {
    		colIndex = runner.app.websheet.Helper.getColNum(col);
    	}
		currentSheet().scrollByColumn(colIndex);
        return this;
    };
    
    var switchSheet = function(sheetName) {
        var workSheetContainer = runner.app.websheet.Main.getWorksheetContainer();
        workSheetContainer.showWorksheet(sheetName);
        return this;
    };
    
    var reset = function() {
    	this.save();
    	runner.app.pe.scene.session.reload();
    	return this;
    };
        
    runner.actions = {
		// file
		save: save,
		publish: publish,
		reset: reset,
		
		//sheet
		insertSheet: insertSheet, // Note: no longer return sheetName.
		moveSheet: moveSheet,
		renameSheet: renameSheet,
		deleteSheet: deleteSheet, // sync
		hideSheet: hideSheet, // sync
		showSheet: showSheet,
		switchSheet: switchSheet,
		
		// edit
		undo: undo,
		redo: redo,
		
		cut: cut,
		copy: copy,
		paste: paste,
		
		// frozen panes
		freezeRow: freezeRow,	
		freezeColumn: freezeColumn,
		
		// name
		insertName: insertName,		
		updateName: updateName,
		deleteName: deleteName,
		
		//filter
		createFilter: createFilter,
		removeFilter: removeFilter,
		keywordFilter: keywordFilter,
		customFilter: customFilter,
		clearFilter: clearFilter, // (colIndex)
		filterSort: filterSort, // (colIndex, isAsc)
		
		// style
		setBorderType: setBorderType, // Constant.BORDERTYPE
		setBorderStyle: setBorderStyle, // Constant.BORDERSTYLE
		setBorderColor: setBorderColor, // HTML color code
		clearBorder: clearBorder,		
		setBackgroundColor: setBackgroundColor,		
		
		setNumberFormat: setNumberFormat,
		removeFormat: removeFormat,
		
		setAlignment: setAlignment,		
		setFontEffect: setFontEffect,		
		setFontName: setFontName,		
		setFontSize: setFontSize,		
		setFontColor: setFontColor,
		wrapText: wrapText,
		
		// row
		insertRowsAbove: insertRowsAbove,
		insertRowsBelow: insertRowsBelow,
		deleteRows: deleteRows,
		hideRows: hideRows,
		showRows: showRows,
		setRowHeight: setRowHeight, // unit: pt
		
		// column
		insertColumnsBefore: insertColumnsBefore,
		insertColumnsAfter: insertColumnsAfter,
		deleteColumns: deleteColumns,
		hideColumns: hideColumns,
		showColumns: showColumns,
		setColumnWidth: setColumnWidth,
		
		// cell
		clearCell: clearCell,
		mergeCell: mergeCell,
		editCell: editCell,
		autofill: autofill,
		focus: focus,
		focusCell: focusCell,
		
		pageDown: pageDown,
		pageUp: pageUp,
		scrollToRow: scrollToRow, // 1-based row index
		scrollToColumn: scrollToColumn, // string or 1-based column index
		
		// sort
		rangeSort: rangeSort 
    };
})(window);