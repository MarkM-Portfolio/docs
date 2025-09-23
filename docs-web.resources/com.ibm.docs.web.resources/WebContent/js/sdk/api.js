/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

var Docs_SDK_Version = "0.8";

/////////////////////////////////////////////////////////////////////
////////////////// Range class in SpreadsheetApp ////////////////////
/////////////////////////////////////////////////////////////////////

/*
 * Create one Range object
 * @param sheet  	the sheet object that this range belongs to
 * @param row	 	the start row index
 * @param column 	the start column index
 * @param endRow 	the end row index
 * @param endColumn the end column index
 */
var Range = function(/*Sheet*/sheet, /*int*/row, /*int*/column, /*int*/endRow, /*int*/endColumn) {
	if (!(sheet && sheet instanceof Sheet) || !(typeof row == "number" && typeof column == "number" && typeof endRow == "number" && typeof endColumn == "number"))
		throw "invalid arguments";
	
	row = parseInt(row);
	column = parseInt(column);
	endRow = parseInt(endRow);
	endColumn = parseInt(endColumn);

	if ((row > endRow || column > endColumn) || endColumn > 1024 ||
		((row == -1 && endRow != -1) || (column == -1 && endColumn != -1)) || 
		(row == -1 && endRow == -1 && column == -1 && endColumn == -1) ||
		(row < -1 || column < -1))
		throw "invalid arguments";
	
	this.sheet = sheet;
	this.row = row;
	this.column = column;
	this.endRow = endRow;
	this.endColumn = endColumn;
	
	this.type = 8; // 1: cell 2: row 4: column 8: range
	if (row == -1) { 
		this.type = 4;
		this.row = 1;
		this.endRow = 20000; // FIXME
	} else if (column == -1) {
		this.type = 2;
		this.column = 1;
		this.endColumn = 1024;
	} else if (row == endRow && column == endColumn)
		this.type = 1;
	
	this.errorMessage = null;
};

/*
 * Return the sheet object that this range belongs to
 */
/*Sheet*/
Range.prototype.getSheet = function() {
	return this.sheet;
};

/*
 * Return the start row index
 */
/*int*/
Range.prototype.getRow = function() {
	return this.row;
};

/*
 * Return the start column index
 */
/*int*/
Range.prototype.getColumn = function() {
	return this.column;
};

/*
 * Return the end row index
 */
/*int*/
Range.prototype.getEndRow = function() {
	return this.endRow;
};

/*
 * Return the end column index
 */
/*int*/
Range.prototype.getEndColumn = function() {
	return this.endColumn;
};

/*string*/
Range.prototype.getErrMessage = function() {
	return this.errorMessage;
};

/*
 * Return Range object for this cell
 * @param row		the row delta within range
 * @param column 	the column delta within range
 */
/*Range*/
Range.prototype.getCell = function(/*int*/row, /*int*/column) {
	if (typeof row != "number" || typeof column != "number")
		return null;
	
	row = parseInt(row);
	column = parseInt(column);
	var rowIndex = this.row + row - 1;
	var colIndex = this.column + column - 1;
	if (rowIndex < this.row || rowIndex > this.endRow) return null;
	if (colIndex < this.column || colIndex > this.endColumn) return null;

	// this is one single cell
	if (this.type == 1)
		return this;
	
	var cell = new Range(this.sheet, rowIndex, colIndex, rowIndex, colIndex);
	return cell;
};

/*
 * Activate this range in this sheet
 */
Range.prototype.activate = function() {
	this.sheet.setActiveRange(this);
};

/*
 * Check whether the range is editable or not
 */
Range.prototype.canEdit = function(/*func*/callback) {
	if (callback && typeof callback != "function") {
		this.errorMessage = "invalid argument";
		return;
	}
	
	var sheetId = this.sheet.getSheetId();
	var self = this;
	apiObj._sheet_range_canEdit(sheetId, this.row, this.column, this.endRow, this.endColumn, function(data){
		apiObj.defaultMsgHandler(self, data);
		var editable = undefined;
		if (!self.errorMessage)
			editable = data.detail;
		if (callback) callback(editable);
	});
};

/*
 * Get the displayed value of the top-left cell in this range
 */
Range.prototype.getDisplayValue = function(/*func*/callback) {
	if (callback && typeof callback != "function") {
		this.errorMessage = "invalid argument";
		return;
	}

	var sheetId = this.sheet.getSheetId();
	var self = this;
	apiObj._sheet_range_getValues(sheetId, this.row, this.column, this.row, this.column, true, function(data){
		apiObj.defaultMsgHandler(self, data);
		var value = undefined;
		if (!self.errorMessage) {
			var rowData = data.detail[0];
			value = rowData ? rowData[0] : "";
		}
		if (callback) callback(value);
	});
};

/*
 * Get the displayed value for this range in one two-dimensional array 
 */
Range.prototype.getDisplayValues = function(/*func*/callback) {
	if (callback && typeof callback != "function") {
		this.errorMessage = "invalid argument";
		return;
	}

	var sheetId = this.sheet.getSheetId();
	var self = this;
	apiObj._sheet_range_getValues(sheetId, this.row, this.column, this.endRow, this.endColumn, true, function(data){
		apiObj.defaultMsgHandler(self, data);
		var values = undefined;
		if (!self.errorMessage)
			values = data.detail;
		if (callback) callback(values);
	});
};

/*
 * Get the value of the top-left cell in this range
 */
Range.prototype.getValue = function(/*func*/callback) {
	if (callback && typeof callback != "function") {
		this.errorMessage = "invalid argument";
		return;
	}

	var sheetId = this.sheet.getSheetId();
	var self = this;
	apiObj._sheet_range_getValues(sheetId, this.row, this.column, this.row, this.column, false, function(data){
		apiObj.defaultMsgHandler(self, data);
		var value = undefined;
		if (!self.errorMessage) {
			var rowData = data.detail[0];
			value = rowData ? rowData[0] : "";
		}
		if (callback) callback(value);
	});
};

/*
 * Get the values for this range in one two-dimensional array 
 */
Range.prototype.getValues = function(/*func*/callback) {
	if (callback && typeof callback != "function") {
		this.errorMessage = "invalid argument";
		return;
	}

	var sheetId = this.sheet.getSheetId();
	var self = this;
	apiObj._sheet_range_getValues(sheetId, this.row, this.column, this.endRow, this.endColumn, false, function(data){
		apiObj.defaultMsgHandler(self, data);
		var values = undefined;
		if (!self.errorMessage)
			values = data.detail;
		if (callback) callback(values);
	});
};

/*
 * Set the top-left cell in this range with this value
 * @param value		one non-empty value which is either string, boolean or number
 */
Range.prototype.setValue = function(/*string, boolean or number*/value) {
	if (typeof value != "number" && typeof value != "string" && typeof value != "boolean") {
		this.errorMessage = "invalid argument";
		return;
	}

	var sheetId = this.sheet.getSheetId();
	var self = this;
	apiObj._sheet_range_setValues(sheetId, this.row, this.column, this.row, this.column, [[value]], function(data){
		apiObj.defaultMsgHandler(self, data);
	});
};

/*
 * Set this range with the values
 * @param values	one two-dimensional array
 */
Range.prototype.setValues = function(/*Object[][]*/values) { // Object can be string, boolean or number
	if (!this._is2DArrayValid(values, function(value) {
		return !(value && (typeof value != "number" && typeof value != "string" && typeof value != "boolean"));
	})) {
		this.errorMessage = "invalid argument";
		return;
	}

	var sheetId = this.sheet.getSheetId();
	var self = this;
	apiObj._sheet_range_setValues(sheetId, this.row, this.column, this.endRow, this.endColumn, values, function(data){
		apiObj.defaultMsgHandler(self, data);
	});
};

/*
 * Clear the range content
 */
Range.prototype.clearContent = function() {
	var sheetId = this.sheet.getSheetId();
	var self = this;
	apiObj._sheet_range_clearContent(sheetId, this.row, this.column, this.endRow, this.endColumn, function(data){
		apiObj.defaultMsgHandler(self, data);
	});
};

/*
 * Get background color of the top-left cell in this range
 */
Range.prototype.getBackground = function(/*func*/callback) {
	if (callback && typeof callback != "function") {
		this.errorMessage = "invalid argument";
		return;
	}

	var self = this;
	this._getColors(this.row, this.column, this.row, this.column, true, function(colors){
		var color = undefined;
		if (colors !== undefined) {
			var rowData = colors[0];
			color = rowData ? rowData[0] : "";
		}
		if (callback) callback(color);
	});
};

/*
 * Get background colors of this range in one two-dimensional array
 */
Range.prototype.getBackgrounds = function(/*func*/callback) {
	if (callback && typeof callback != "function") {
		this.errorMessage = "invalid argument";
		return;
	}

	this._getColors(this.row, this.column, this.endRow, this.endColumn, true, callback);
};

/*
 * Set this range's background with this color 
 * @param color		one non-empty string (hex value like "#FFFFFF")
 */
Range.prototype.setBackground = function(/*string hex value*/color) {
	if (!(color && typeof color == "string" && color.length == 7 && color.charAt(0) == "#")) {
		this.errorMessage = "invalid argument";
		return;
	}

	this._setColor(color, true);
};

/*
 * Set this range's background with this colors
 * @param colors 	one two-dimensional array which consists of string hex value
 */
Range.prototype.setBackgrounds = function(/*string[][]*/colors) {
	if (!this._is2DArrayValid(colors, function(color) {
		return !(color && (typeof color != "string" && color.length != 7 && color.charAt(0) != "#"));
	})) {
		this.errorMessage = "invalid argument";
		return;
	}

	this._setColor(colors, true);
};

/*
 * Get font color of the top-left cell in this range
 */
Range.prototype.getFontColor = function(/*func*/callback) {
	if (callback && typeof callback != "function") {
		this.errorMessage = "invalid argument";
		return;
	}

	var self = this;
	this._getColors(this.row, this.column, this.row, this.column, false, function(colors){
		var color = undefined;
		if (colors !== undefined) {
			var rowData = colors[0];
			color = rowData ? rowData[0] : "";
		}
		if (callback) callback(color);
	});
};

/*
 * Get font colors of this range in one two-dimensional array
 */
Range.prototype.getFontColors = function(/*func*/callback) {
	if (callback && typeof callback != "function") {
		this.errorMessage = "invalid argument";
		return;
	}
	
	this._getColors(this.row, this.column, this.endRow, this.endColumn, false, callback);
};

/*
 * Set this range's font color with this color
 * @param color		one non-empty string (hex value like "#FFFFFF")
 */
Range.prototype.setFontColor = function(color) {
	if (!(color && typeof color == "string" && color.length == 7 && color.charAt(0) == "#")) {
		this.errorMessage = "invalid argument";
		return;
	}

	this._setColor(color, false);
};

/*
 * Set this range's font color with this colors
 * @param colors 	one two-dimensional array which consists of string hex value
 */
Range.prototype.setFontColors = function(/*string[][]*/colors) {
	if (!this._is2DArrayValid(colors, function(color) {
		return !(color && (typeof color != "string" && color.length != 7 && color.charAt(0) != "#"));
	})) {
		this.errorMessage = "invalid argument";
		return;
	}
	
	this._setColor(colors, false);
};

/*boolean*/
Range.prototype._is2DArrayValid = function(/*two-dimensional array*/values, /*func*/singleValueChecker) {
	if (!(values && Array.isArray(values))) return false;
	if (values.length > this.endRow - this.row + 1) return false;

	var valid = true;
	var colSize = this.endColumn - this.column + 1;	
	for (var i = 0; i < values.length; i++) {
		var list = values[i];
		if (!list) continue;
		
		if (!Array.isArray(list) || list.length > colSize) {
			valid = false;
			break;
		}
		
		for (var j = 0; j < list.length; j++) {
			var value = list[j];
			if (!singleValueChecker(value)) {
				valid = false;
				break;
			}
		}
		
		if (!valid) break;
	}
	
	return valid;
};

Range.prototype._getColors = function(row, column, endRow, endColumn, bBackground, callback) {
	var sheetId = this.sheet.getSheetId();
	var self = this;
	apiObj._sheet_range_getColors(sheetId, row, column, endRow, endColumn, bBackground, function(data){
		apiObj.defaultMsgHandler(self, data);
		var colors = undefined;
		if (!self.errorMessage)
			colors = data.detail; // string[][]
		if (callback) callback(colors);
	});
};

Range.prototype._setColor = function(color, bBackground) {
	var sheetId = this.sheet.getSheetId();
	var self = this;
	apiObj._sheet_range_setColor(sheetId, this.row, this.column, this.endRow, this.endColumn, color, bBackground, function(data){
		apiObj.defaultMsgHandler(self, data);
	});
};

/////////////////////////////////////////////////////////////////////
/////////////////  Sheet class in SpreadsheetApp ////////////////////
/////////////////////////////////////////////////////////////////////

/*
 * Create one new Sheet object
 * @param id  the sheet id
 */
var Sheet = function(/*string*/id) {
	if (!(id && typeof id == "string"))
		throw "invalid argument";
	
	this.sheetId = id;
	this.errorMessage = null;
};

/*
 * Return the sheet name
 */
/*string*/
Sheet.prototype.getSheetId = function() {
	return this.sheetId;
};

/*string*/
Sheet.prototype.getErrMessage = function() {
	return this.errorMessage;
};

/*
 * Get the name of this sheet
 */
Sheet.prototype.getSheetName = function(/*func*/callback) {
	if (callback && typeof callback != "function") {
		this.errorMessage = "invalid argument";
		return;
	}

	apiObj._sheet_getSheetName(this.sheetId, function(data) {
		var sheetName = data.detail;
		if (callback) callback(sheetName);
	});
};

/*
 * Active this sheet in this spreadsheet
 */
Sheet.prototype.activate = function() {
	var self = this;
	apiObj._sheet_setActiveSheet(this.sheetId, function(data){
		apiObj.defaultMsgHandler(self, data);
	});
};

/*
 * Hide this sheet
 */
Sheet.prototype.hideSheet = function() {
	var self = this;
	apiObj._sheet_hideSheet(this.sheetId, function(data){
		apiObj.defaultMsgHandler(self, data);
	});
};

/*
 * Un-hide this sheet
 */
Sheet.prototype.showSheet = function() {
	var self = this;
	apiObj._sheet_showSheet(this.sheetId, function(data){
		apiObj.defaultMsgHandler(self, data);
	});
};

/*
 * Re-name this sheet with new sheet name
 * @param sheetName		new sheet name
 */
Sheet.prototype.setSheetName = function(/*string*/sheetName) {
	if (!(sheetName && typeof sheetName == "string")) {
		this.errorMessage = "invalid argument";
		return;
	}
	
	var self = this;
	apiObj._sheet_setSheetName(this.sheetId, sheetName, function(data){
		apiObj.defaultMsgHandler(self, data);
	});
};

/*
 * Check whether this sheet is hidden
 */
Sheet.prototype.isHiddenSheet = function(/*func*/callback) {
	if (callback && typeof callback != "function") {
		this.errorMessage = "invalid argument";
		return;
	}

	var self = this;
	apiObj._sheet_isHiddenSheet(this.sheetId, function(data){
		apiObj.defaultMsgHandler(self, data);
		var hidden = undefined;
		if (!self.errorMessage)
			hidden = data.detail; // boolean
		
		if (callback) callback(hidden);
	});
};

/*
 * Get the index of this sheet in sheet tab
 */
Sheet.prototype.getIndex = function(/*func*/callback) {
	if (callback && typeof callback != "function") {
		this.errorMessage = "invalid argument";
		return;
	}

	var self = this;
	apiObj._sheet_getSheetIndex(this.sheetId, function(data){
		apiObj.defaultMsgHandler(self, data);
		var index = undefined;
		if (!self.errorMessage)
			index = data.detail;
		
		if (callback) callback(index);
	});
};

/*
 * Get current active cell (in Range) of this sheet
 */
Sheet.prototype.getActiveCell = function(/*func*/callback) {
	if (callback && typeof callback != "function") {
		this.errorMessage = "invalid argument";
		return;
	}
	
	var self = this;
	apiObj._sheet_getActiveRange(this.sheetId, function(data){
		apiObj.defaultMsgHandler(self, data);
		if (!self.errorMessage) {
			var rangeInfo = data.detail;
			var cell = new Range(self, rangeInfo.row, rangeInfo.column, rangeInfo.row, rangeInfo.column);
			if (callback) callback(cell);
		}
	});
};

/*
 * Get current active range of this sheet
 */
Sheet.prototype.getActiveRange = function(/*func*/callback) {
	if (callback && typeof callback != "function") {
		this.errorMessage = "invalid argument";
		return;
	}

	var self = this;
	apiObj._sheet_getActiveRange(this.sheetId, function(data){
		apiObj.defaultMsgHandler(self, data);
		if (!self.errorMessage) {
			var rangeInfo = data.detail;
			var range = new Range(self, rangeInfo.row, rangeInfo.column, rangeInfo.endRow, rangeInfo.endColumn);
			if (callback) callback(range);
		}
	});
};

/*
 * Activate this range in this sheet
 * @param range	 one Range object
 */
Sheet.prototype.setActiveRange = function(/*Range*/range) {
	if (!(range && range instanceof Range)) {
		this.errorMessage = "invalid argument";
		return;
	}
	
	var row = range.getRow();
	var column = range.getColumn();
	var endRow = range.getEndRow();
	var endColumn = range.getEndColumn();
	var type = range.type;
	var self = this;
	apiObj._sheet_setActiveRange(this.sheetId, row, column, endRow, endColumn, type, function(data){
		apiObj.defaultMsgHandler(self, data);
	});
};

/*
 * Return one range instance
 */
Sheet.prototype.getRange = function(/*int*/row, /*int*/column, /*int*/endRow, /*int*/endColumn) {
	var range = new Range(this, row, column, endRow, endColumn);
	return range;
};

/////////////////////////////////////////////////////////////////////
/////////////////  SpreadsheetApp ///////////////////////////////////
/////////////////////////////////////////////////////////////////////

var SpreadsheetApp = {
	errorMessage: null,
	sheets: {},
	
	/*
	 * Get active sheet in this spreadsheet
	 */
	getActiveSheet: function(/*func*/callback) {
		if (callback && typeof callback != "function") {
			this.errorMessage = "invalid argument";
			return;
		}

		var self = this;
		apiObj._sheet_getActiveSheet(function(data){
			var sheet = undefined;
			
			apiObj.defaultMsgHandler(self, data);
			
			if (!self.errorMessage) {
				var sheetId = data.detail;
				sheet = self.sheets[sheetId];
				if (!sheet) {
					sheet = new Sheet(sheetId);
					self.sheets[sheetId] = sheet;
				}
			}
			
			if (callback) callback(sheet);
		});
	},

	/*
	 * Get one array of sheets in this spreadsheet
	 */
	getSheets: function(/*func*/callback) {
		if (callback && typeof callback != "function") {
			this.errorMessage = "invalid argument";
			return;
		}
		
		var self = this;
		apiObj._sheet_getSheets(function(data) {
			var sheets = undefined;
			
			apiObj.defaultMsgHandler(self, data);
			
			if (!self.errorMessage) {
				sheets = [];
				var sheetsInfo = data.detail;
				for (var sheetId in sheetsInfo) {
					var index = sheetsInfo[sheetId];
					sheets[index - 1] = self.sheets[sheetId] = new Sheet(sheetId);
				}
			}
			
			if (callback) callback(sheets);
		});
	},
	
	/*
	 * Get one sheet object with the given sheet name
	 * @param sheetName		the sheet name
	 */
	getSheetByName: function(/*string*/sheetName, /*func*/callback) {
		if (!(sheetName && typeof sheetName == "string") || (callback && typeof callback != "function")) {
			this.errorMessage = "invalid argument";
			return;
		}

		var self = this;
		apiObj._sheet_isValidSheet(sheetName, function(data) {
			var sheet = undefined;
			
			apiObj.defaultMsgHandler(self, data);
			
			if (!self.errorMessage) {
				var sheetId = data.detail;
				if (!self.sheets[sheetId]) {
					sheet = new Sheet(sheetId);
					self.sheets[sheetId] = sheet;
				} else {
					sheet = self.sheets[sheetId];
				}
			}
			
			if (callback) callback(sheet);
		});
	},
	
	/*
	 * Insert new sheet with the given sheet name in this spreadsheet
	 * @param sheetName		the sheet name
	 */
	/*void*/insertSheetByName: function(/*string*/sheetName) {
		if (!(sheetName && typeof sheetName == "string")) {
			this.errorMessage = "invalid argument";
			return;
		}
		
		var self = this;
		apiObj._sheet_insertSheet(sheetName, function(data) {
			apiObj.defaultMsgHandler(self, data);
			
			if (!self.errorMessage) {
				var sheetId = data.detail;
				self.sheets[sheetId] = new Sheet(sheetId);
			}
		});
	}
};

/////////////////////////////////////////////////////////////////////
////////////////// Element class in DocumentApp /////////////////////
/////////////////////////////////////////////////////////////////////
var Element = function(/*string*/id) {
	if (!(id && typeof id == "string"))
		throw "invalid argument";

	this.type = 0;
	this.id = id;
	this.errorMessage = null;
};

/*
 * Get the id of this element
 */
Element.prototype.getId = function() {
	return this.id;
};

/*
 * Get the attributes of this element
 */
Element.prototype.getAttributes = function(/*func*/callback) {
	if (callback && typeof callback != "function") {
		this.errorMessage = "invalid argument";
		return;
	}

	// TODO
};

/*
 * Get the next sibling of this element in document model
 */
Element.prototype.getNextSibling = function(/*func*/callback) {
	if (callback && typeof callback != "function") {
		this.errorMessage = "invalid argument";
		return;
	}

	var self = this;
	apiObj._text_element_getNextSibling(this.toJson(), function(data){
		apiObj.defaultMsgHandler(self, data);
		var next = undefined;
		if (!self.errorMessage && data.detail)
			next = DocumentApp.getElement(data.detail.id, data.detail.type, data.detail);

		if (callback) callback(next);
	});
};

/*
 * Get the parent of this element
 */
Element.prototype.getParent = function(/*func*/callback) {
	if (callback && typeof callback != "function") {
		this.errorMessage = "invalid argument";
		return;
	}

	var self = this;
	apiObj._text_element_getParent(this.toJson(), function(data){
		apiObj.defaultMsgHandler(self, data);
		var parent = undefined;
		if (!self.errorMessage && data.detail)
			parent = DocumentApp.getElement(data.detail.id, data.detail.type, data.detail);

		if (callback) callback(parent);
	});
};

/*
 * Get the previous sibling of this element in document model
 */
Element.prototype.getPrevSibling = function(/*func*/callback) {
	if (callback && typeof callback != "function") {
		this.errorMessage = "invalid argument";
		return;
	}

	var self = this;
	apiObj._text_element_getPrevSibling(this.toJson(), function(data){
		apiObj.defaultMsgHandler(self, data);
		var prev = undefined;
		if (!self.errorMessage && data.detail)
			prev = DocumentApp.getElement(data.detail.id, data.detail.type, data.detail);

		if (callback) callback(prev);
	});
};

/*
 * Set the attributes of this element with given 'attrs'
 */
Element.prototype.setAttributes = function(/*Array*/attrs) {
	if (!(attrs && Array.isArray(attrs))) {
		this.errorMessage = "invalid argument";
		return;
	}

	// TODO
};

Element.prototype.toJson = function() {
	var ret = {};
	ret.id = this.id;
	switch(this.type) { 
		case DocumentApp.ElementType.BODY:
			ret.type = "body";
			break; 
		case DocumentApp.ElementType.PARAGRAPH:
			ret.type = "paragraph";
			break;
		case DocumentApp.ElementType.TEXT:
			ret.type = "text";
			break; 			
		default: 
			ret.type = this.type;
	};
	return ret;
};

/////////////////////////////////////////////////////////////////////
////////////////// ContainerElement class in DocumentApp ////////////
/////////////////////////////////////////////////////////////////////
var ContainerElement = function(/*string*/id) {
	if (!(id && typeof id == "string"))
		throw "invalid argument";

	this.type = 1;
	this.id = id;
	this.errorMessage = null;
};

/*
 * Find the first given 'type' type of the child element in this ContainerElement,
 * it can start to find from the given 'from' index rather than 1.
 */
ContainerElement.prototype.findElement = function(/*ElementType*/type, /*int*/from, /*func*/callback) {
	if (typeof type != "number" || (from && typeof from != "number") || (callback && typeof callback != "function")) {
		this.errorMessage = "invalid argument";
		return;
	}

	if (from === undefined) from = 1;
	else from = parseInt(from);
	
	// TODO
};

/*
 * Get the n-th child in this ContainerElement
 */
ContainerElement.prototype.getChild = function(/*int*/index, /*func*/callback) {
	if (!(index && typeof index == "number") || (index <= 0) || (callback && typeof callback != "function")) {
		this.errorMessage = "invalid argument";
		return;
	}

	index = parseInt(index);
	var self = this;
	apiObj._text_containerElement_getChild(this.toJson(), index, function(data){
		apiObj.defaultMsgHandler(self, data);
		var child = undefined;
		if (!self.errorMessage && data.detail)
			child = DocumentApp.getElement(data.detail.id, data.detail.type, data.detail);

		if (callback) callback(child);
	});
};

/*
 * Get the index (1-based) of the child specified by 'element'
 */
ContainerElement.prototype.getChildIndex = function(/*Element*/element, /*func*/callback) {
	if (!element || (callback && typeof callback != "function")) {
		this.errorMessage = "invalid argument";
		return;
	}

	var self = this;
	apiObj._text_containerElement_getChildIndex(this.toJson(), element.toJson(), function(data){
		apiObj.defaultMsgHandler(self, data);
		var index = -1;
		if (!self.errorMessage && data.detail > 0)
			index = data.detail;

		if (callback) callback(index);
	});
};

/*
 * Get number of children
 */
ContainerElement.prototype.getNumChildren = function(/*func*/callback) {
	if ((callback && typeof callback != "function")) {
		this.errorMessage = "invalid argument";
		return;
	}

	var self = this;
	apiObj._text_containerElement_getNumChildren(this.toJson(), function(data){
		apiObj.defaultMsgHandler(self, data);
		var num = 0;
		if (!self.errorMessage && data.detail>=0)
			num = data.detail;

		if (callback) callback(num);
	});
};

ContainerElement.prototype.getTextAlignment = function(/*func*/callback) {
	// to be overriden
};

ContainerElement.prototype.setTextAlignment = function(alignment) {
	// to be overriden
};

ContainerElement.prototype.editAsText = function() {
	return new Text(this);
};

ContainerElement.prototype.isContainer = function() {
	return true;
};

ContainerElement.prototype.toJson = function() {
	var ret = {};
	ret.id = this.id;
	switch(this.type) { 
		case DocumentApp.ElementType.BODY:
			ret.type = "body";
			break; 
		case DocumentApp.ElementType.PARAGRAPH:
			ret.type = "paragraph";
			break;
		case DocumentApp.ElementType.TEXT:
			ret.type = "text";
			break; 			
		default: 
			ret.type = this.type;
	};
	ret.isContainer = true;
	return ret;
};

/////////////////////////////////////////////////////////////////////
////////////////// Paragraph class in DocumentApp ///////////////////
/////////////////////////////////////////////////////////////////////
var Paragraph = function(/*string*/id) {
	if (!(id && typeof id == "string"))
		throw "invalid argument";

	this.type = DocumentApp.ElementType.PARAGRAPH;
	this.id = id;
};

Paragraph.prototype.appendText = function(/*string*/text, /*func*/callback) {
	if (!(text && typeof text == "string") || (callback && typeof callback != "function")) {
		this.errorMessage = "invalid argument";
		return;
	}

	apiObj._text_paragraph_appendText(this.id, text, function(data){
		var ret = {};
		ret.status = data.status;
		apiObj.defaultMsgHandler(ret, data);

		if (callback) callback(ret);
	});
};

Paragraph.prototype.setText = function(/*string*/text, /*func*/callback) {
	if ((text && typeof text != "string") || (callback && typeof callback != "function")) {
		this.errorMessage = "invalid argument";
		return;
	}

	apiObj._text_paragraph_setText(this.id, text, function(data){
		var ret = {};
		ret.status = data.status;
		apiObj.defaultMsgHandler(ret, data);

		if (callback) callback(ret);
	});	
};

Paragraph.prototype.clear = function(/*func*/callback) {
	this.setText("", callback);
};

Paragraph.prototype.getText = function(/*func*/callback) {
	if (callback && typeof callback != "function") {
		this.errorMessage = "invalid argument";
		return;
	}

	var self = this;
	apiObj._text_text_getText(this.toJson(), 0, null, function(data){
		var text = undefined;
		
		apiObj.defaultMsgHandler(self, data);
		
		if (!self.errorMessage)
			text = data.detail;

		if (callback) callback(text);
	});
};

Paragraph.prototype.getTextAlignment = function(/*func*/callback) {
	if (callback && typeof callback != "function") {
		this.errorMessage = "invalid argument";
		return;
	}

	// TODO
};

Paragraph.prototype.setTextAlignment = function(alignment) {
	// TODO override here
};

/////////////////////////////////////////////////////////////////////
////////////////// Body class in DocumentApp ////////////////////////
/////////////////////////////////////////////////////////////////////
var Body = function() {
	this.type = DocumentApp.ElementType.BODY;
	this.id = "body-dummy-id";
};

Body.prototype.getParagraphs = function(/*func*/callback) {
	if (callback && typeof callback != "function") {
		this.errorMessage = "invalid argument";
		return;
	}

	var self = this;
	apiObj._text_body_getParagraphs(function(data) {
		var paras = undefined;
		
		apiObj.defaultMsgHandler(self, data);
		
		if (!self.errorMessage) {
			paras = [];
			var ids = data.detail;
			for (var i=0; i < ids.length; i++)
				paras.push(new Paragraph(ids[i]));
		}

		if (callback) callback(paras);
	});
};

Body.prototype.getPageHeight = function() {
	// TODO override here, ??? moved to section ???
	return 0;
};

Body.prototype.getPageWidth = function() {
	// TODO override here, ??? moved to section ???
	return 0;
};

Body.prototype.setPageHeight = function(height) {
	// TODO override here, ??? moved to section ???
};

Body.prototype.setPageWidth = function(width) {
	// TODO override here, ??? moved to section ???
};

Body.prototype.insertParagraph = function(/*int*/index, /*string*/text, /*func*/callback) {
	if (!(index && typeof index == "number") || (text && typeof text != "string") || (callback && typeof callback != "function")) {
		this.errorMessage = "invalid argument";
		return;
	}

	var self = this;
	apiObj._text_body_insertParagraph(parseInt(index), text, function(data) {
		var para = undefined;
		apiObj.defaultMsgHandler(self, data);

		if (!self.errorMessage) {
			var id = data.detail;
			para = new Paragraph(id);
		}

		if (callback) callback(para);
	});
};

Body.prototype.appendParagraph = function(/*string*/text, /*func*/callback) {
	if ((text && typeof text != "string") || (callback && typeof callback != "function")) {
		this.errorMessage = "invalid argument";
		return;
	}

	var self = this;
	apiObj._text_body_appendParagraph(text, function(data) {
		var para = undefined;
		apiObj.defaultMsgHandler(self, data);

		if (!self.errorMessage) {
			var id = data.detail;
			para = new Paragraph(id);
		}

		if (callback) callback(para);
	});
};

Body.prototype.getTextAlignment = function(/*func*/callback) {
	// TODO override here ??? moved to section ???
};

Body.prototype.setTextAlignment = function(alignment) {
	// TODO override here ??? moved to section ???
};

/////////////////////////////////////////////////////////////////////
////////////////// Text class in DocumentApp ////////////////////////
/////////////////////////////////////////////////////////////////////
var Text = function(/*ContainerElement*/parent, /*int*/start,/*int*/length) {
	if (!(parent && parent.isContainer) || (start && typeof start != "number") || (length && typeof length != "number"))
		throw "invalid argument";

	this.type = DocumentApp.ElementType.TEXT;
	this.id = "text-dummy-id"; // never used
	this.parent = parent;

	if(length == null && start == null)
		this.isPartial = false;//Not all the text of parent
	else {
		this.isPartial = true;
		this.start = (start > 0) ? parseInt(start) : 0;
		if(length != null)
			this.len = (length > 0) ? parseInt(length) : 0;
	}
};

Text.prototype.getParent = function() {
	return this.parent;
};

Text.prototype.appendText = function(/*string*/text, /*func*/callback) {
	if (!(text && typeof text == "string") || (callback && typeof callback != "function")) {
		this.errorMessage = "invalid argument";
		return;
	}
	var self = this;
	var newCallBack = function(response) {
		if(response.status != "error") {
			if(self.len != null)
				self.len = self.len + text.length;
		}
		if (callback) callback(response);
	};

	var curPos = null;
	if(this.isPartial)
		curPos = new Position(this.parent, this.start + this.len);
	else
		curPos = new Position(this.parent, -1);

	apiObj._text_position_insertText(curPos.toJson(), text, function(data){
		var ret = {};
		ret.status = data.status;
		apiObj.defaultMsgHandler(ret, data);

		if (newCallBack) newCallBack(ret);
	});
};

Text.prototype.insertText = function(/*int*/offset, /*string*/text, /*func*/callback) {
	if (!(offset && (offset >= 0)) || !(text && typeof text == "string") || (callback && typeof callback != "function")) {
		this.errorMessage = "invalid argument";
		return;
	}
	var self = this;
	var newCallBack = function(response) {
		if(response.status != "error") {
			if(self.len != null)
				self.len = self.len + text.length;
		}
		if (callback) callback(response);
	};

	var curPos = null;
	if(this.isPartial)
		curPos = new Position(this.parent, this.start + offset);
	else
		curPos = new Position(this.parent, offset);

	apiObj._text_position_insertText(curPos.toJson(), text, function(data){
		var ret = {};
		ret.status = data.status;
		apiObj.defaultMsgHandler(ret, data);

		if (newCallBack) newCallBack(ret);
	});
};

Text.prototype.setText = function(/*string*/text, /*func*/callback) {
	if ((text && typeof text != "string") || (callback && typeof callback != "function")) {
		this.errorMessage = "invalid argument";
		return;
	}
	var self = this;
	var newCallBack = function(response) {
		if(response.status != "error") {
			if(self.len != null)
				self.len = text.length;
		}
		if (callback) callback(response);
	};

	if(this.isPartial) {
		var pos1 = new Position(this.parent, this.start);
		var pos2 = new Position(this.parent, this.start + this.len);
		var range = new DocumentApp.Range(pos1, pos2);

		apiObj._text_text_setText(range.toJson(), text, function(data){
			var ret = {};
			ret.status = data.status;
			apiObj.defaultMsgHandler(ret, data);

			if (newCallBack) newCallBack(ret);
		});
	} else {
		var pId = this.parent.getId();
		if(pId) {
			apiObj._text_paragraph_setText(pId, text, function(data){
				var ret = {};
				ret.status = data.status;
				apiObj.defaultMsgHandler(ret, data);

				if (newCallBack) newCallBack(ret);
			});
		}
	}
};

Text.prototype.clear = function(/*func*/callback) {
	if (callback && typeof callback != "function") {
		this.errorMessage = "invalid argument";
		return;
	}
	var self = this;
	var newCallBack = function(response) {
		if(response.status != "error") {
			if(self.len != null)
				self.len = 0;
		}
		if (callback) callback(response);
	};

	if(this.isPartial) {
		this.setText("", newCallBack);
	} else {
		if(this.parent.clear)
			this.parent.clear(newCallBack);
		else if(this.parent.editAsText)
			this.parent.editAsText().setText("", newCallBack);
	}
};

Text.prototype.getText = function(/*func*/callback) {
	if (callback && typeof callback != "function") {
		this.errorMessage = "invalid argument";
		return;
	}

	if(this.isPartial) {
		apiObj._text_text_getText(this.parent.toJson(), this.start, this.len, function(data){
			var text = undefined;
			apiObj.defaultMsgHandler(self, data);

			if (!self.errorMessage)
				text = data.detail;

			if (callback) callback(text);
		});		

	} else {
		var pId = this.parent.getId();
		apiObj._text_text_getText(this.parent.toJson(), 0, null, function(data){
			var text = undefined;
			apiObj.defaultMsgHandler(self, data);

			if (!self.errorMessage)
				text = data.detail;

			if (callback) callback(text);
		});		
	}
};

Text.prototype.toJson = function() {
	var ret = {};
	if(this.parent.toJson) {
		ret.parent = this.parent.toJson();
		ret.isPartial = this.isPartial;
		if(this.isPartial) {
			ret.start = this.start;
			if(this.len != null)
				ret.len = this.len;
		}
	}
	return ret;
};

/////////////////////////////////////////////////////////////////////
////////////////// Bookmark class in DocumentApp ////////////////////
/////////////////////////////////////////////////////////////////////
var Bookmark = function(/*string*/id) {
	if (!(id && typeof id == "string"))
		throw "invalid argument";
	
	this.id = id;
};

Bookmark.prototype.getId = function() {
	return this.id;
};

Bookmark.prototype.getPosition = function(/*func*/callback) {
	if (callback && typeof callback != "function") {
		this.errorMessage = "invalid argument";
		return;
	}
//TODO	
};

/////////////////////////////////////////////////////////////////////
////////////////// Position class in DocumentApp ////////////////////
/////////////////////////////////////////////////////////////////////
var Position = function(/*ContainerElement*/element, /*int*/offset) {
	if (!(element && element.isContainer) || (offset && typeof offset != "number"))
		throw "invalid argument";

	this.element = element;
	this.offset = ((offset && offset > 0) || (offset == -1)) ? parseInt(offset) : 0;
};

Position.prototype.compare = function(/*Position*/cPos) {
	//TODO:More to compared
	if (cPos && cPos instanceof Position) {
		if(this.element == cPos.element && this.offset == cPos.offset)
			return 0;
	}
	return -1;
};

Position.prototype.getElement = function() {
	return this.element;
};

Position.prototype.getOffset = function() {
	return this.offset;
};

Position.prototype.getSurroudingText = function(/*func*/callback) {
	if (callback && typeof callback != "function")
		return;
	
	// TODO
};

Position.prototype.insertText = function(/*string*/text, /*func*/callback) {
	if (!(text && typeof text == "string") || (callback && typeof callback != "function")) {
		this.errorMessage = "invalid argument";
		return;
	}
	
	var self = this;
	apiObj._text_position_insertText(self.toJson(), text, function(data){
		var ret = undefined;;
		apiObj.defaultMsgHandler(self, data);

		if (!self.errorMessage)
			ret = new Text(self.element, self.offset, text.length);

		if (callback) callback(ret);
	});	
};

Position.prototype.toJson = function() {
	var ret = {};
	if(this.element){
		ret.element = this.element.toJson && this.element.toJson();
		ret.offset = this.offset;
	}
	return ret;
};
/////////////////////////////////////////////////////////////////////
//////////////////Unsupported class in DocumentApp ////////////////////
//////////////////////////////////////////////////////////////////////
var UnSupportedElement = function(/*string*/ id) {
	if (!(id && typeof id == "string"))
		throw "invalid argument";

	this.type = DocumentApp.ElementType.UNSUPPORTED;
	this.id = id;
	this.errorMessage = null;
};

for (var func in Element.prototype) {
!ContainerElement.prototype[func] && (ContainerElement.prototype[func] = Element.prototype[func]);
!Text.prototype[func] && (Text.prototype[func] = Element.prototype[func]);
!UnSupportedElement.prototype[func] && (UnSupportedElement.prototype[func] = Element.prototype[func]);
!Bookmark.prototype[func] && (Bookmark.prototype[func] = Element.prototype[func]);
}

for (var func in ContainerElement.prototype) {
!Body.prototype[func] && (Body.prototype[func] = ContainerElement.prototype[func]);
!Paragraph.prototype[func] && (Paragraph.prototype[func] = ContainerElement.prototype[func]);
}

/////////////////////////////////////////////////////////////////////
/////////////////  DocumentApp //////////////////////////////////////
/////////////////////////////////////////////////////////////////////

var DocumentApp = {
	errorMessage: null,
	body: null,

	Attribute: {
		BACKGROUND_COLOR: 1,
		BOLD: 2,
		FONT_FAMILTY: 3,
		FONT_SIZE: 4,
		FOREGROUND_COLOR: 5,
		HEADING: 6,
		HORIZONTAL_ALIGNMENT: 7,
		ITALIC: 8,
		LINE_SPACING: 9,
		MARGIN_BOTTOM: 10,
		MARGIN_LEFT: 11,
		MARGIN_RIGHT: 12,
		MARGIN_TOP: 13,
		NESTING_LEVEL: 14,
		PAGE_HEIGHT: 15,
		PAGE_WIDTH: 16,
		STRIKETHROUGH: 17,
		UNDERLINE: 18
	},

	ElementType: {
		BODY: 1 << 1,
		PARAGRAPH: 1 << 2,
		TEXT: 1 << 3,
		UNSUPPORTED: 1 << 10
	},

	addBookmark: function(position) {
		// TODO override here
	},

	clearChangeHistory: function() {
		apiObj._text_clearChangeHistory(false, function(data){});
	},

	disableTrackChange: function() {
		apiObj._text_setTrackChange(false, function(data){});
	},

	enableTrackChange: function() {
		apiObj._text_setTrackChange(true, function(data){});
	},

	getCursor: function(/*func*/callback) {
		if (callback && typeof callback != "function") {
			this.errorMessage = "invalid argument";
			return;
		}

		var self = this;
		apiObj._text_getCursor(function(data){
			var pos = undefined;

			apiObj.defaultMsgHandler(self, data);
			
			if (!self.errorMessage) {
				var obj = data.detail;
				var e = new Paragraph(obj.id);
				pos = new Position(e, obj.offset);
			}

			if (callback) callback(pos);
		});
	},

	getSelection: function(/*func*/callback) {
		if (callback && typeof callback != "function") {
			this.errorMessage = "invalid argument";
			return;
		}

		var self = this;
		apiObj._text_getSelection(function(data){
			var range = undefined;

			apiObj.defaultMsgHandler(self, data);

			if (!self.errorMessage) {
				var obj = data.detail;
				if(obj.start) {
					range = new self.Range();
					var e = new Paragraph(obj.start.id);
					var pos1 = new Position(e, obj.start.offset);
					var pos2 = null;
					if(!obj.isCollapsed && obj.end) {
						e = new Paragraph(obj.end.id);
						pos2 = new Position(e, obj.end.offset);
					}
					range.buildRange(pos1, pos2);
				}
			}

			if (callback) callback(range);
		});
	},

	setCursor: function(/*Position*/position) {
		if (!(position && position instanceof Position)) {
			this.errorMessage = "invalid argument";
			return;
		}

		apiObj._text_setCursor(position.toJson(), function(data){});
	},

	setSelection: function(/*DocumentApp.Range*/range) {
		if(!(range && range instanceof DocumentApp.Range)){
			this.errorMessage = "invalid argument";
			return;
		}

		apiObj._text_setSelection(range.toJson(), function(data){});	
	},

	getBody: function() {
		if(!this.body)
			this.body = new Body();
		return this.body;
	},

	getBookmark: function(id) {
		// TODO override here
	},

	getBookmarks: function() {
		// TODO override here
	},

	// Get the document title
	getName: function(/*func*/callback) {
		if (callback && typeof callback != "function") {
			this.errorMessage = "invalid argument";
			return;
		}

		var self = this;
		apiObj._text_getDocProperty("title", function(data) {
			var title = undefined;
			
			apiObj.defaultMsgHandler(self, data);
			
			if (!self.errorMessage)
				title = data.detail;
			
			if (callback) callback(title);
		});
	},

	/*
	 * Create element object with the given info
	 * @param id : element id
	 * @param type : ElementType
	 * @param detail : detail.subType, detail.parent, detail.offset, detail.length
	 */
	getElement: function(/*string*/id, /*ElementType*/type, /*Json*/ detail) {
		var ret = undefined;

		if(id) {
			if(type == this.ElementType.BODY)
				ret = this.getBody();
			else if(type == this.ElementType.PARAGRAPH)
				ret = new Paragraph(id);
			else if(type == this.ElementType.TEXT && detail)
				ret = new Text(new Paragraph(id), detail.offset, detail.len);			
			else
				ret = new UnSupportedElement(id);
		}
		return ret;
	}
};

/////////////////////////////////////////////////////////////////////
//////////////////Range class in DocumentApp ////////////////////////
/////////////////////////////////////////////////////////////////////
DocumentApp.Range = function(/*Position*/start, /*Position*/end) {
	if ((start && !(start instanceof Position)) || (end && !(end instanceof Position)))
		throw "invalid argument";

	this.isCollapsed = true;
	if(start)
		this.buildRange(start, end);
};

DocumentApp.Range.prototype.buildRange = function(/*Position*/start, /*Position*/end) {
	if (!(start && start instanceof Position) || (end && !(end instanceof Position))) {
		this.errorMessage = "invalid argument";
		return;
	}
	
	this.start = start;
	this.end = end;

	if (this.start && this.end && (this.start.compare(this.end) != 0))
		this.isCollapsed = false;
};

DocumentApp.Range.prototype.toJson = function(){
	var ret = {};
	this.start && (ret.start = this.start.toJson());
	this.end && (ret.end = this.end.toJson());
	ret.isCollapsed = this.isCollapsed;
	return ret;
};

/////////////////////////////////////////////////////////////////////
//////////////////Ui class in iDocsApp //////////////////////////////
/////////////////////////////////////////////////////////////////////

var Ui = {
	errorMessage: null,
	
	/*
	 * Create one Menu object with the given label
	 * @param label   the label of this menu
	 */
	/*Menu*/createMenu: function(/*string*/label) {
		if (!(label && typeof label == "string")) {
			this.errorMessage = "invalid argument";
			return null;
		}
		
		var menu = new Menu(label);
		return menu;
	},
	
	/*
	 * Create one AddOn Menu object
	 */
	/*Menu*/createAddOnMenu: function() {
		var menu = new Menu("Add-ons", true);
		return menu;
	},
	
	/*
	 * Popup one alert with ok button with custom title and alert content
	 * @title 		the custom title or
	 *				null (using default title) or 
	 *				custom alert content if the second parameter is null
	 * @message 	the custom alert content or null
	 */
	alert: function(/*string*/title, /*string*/message, /*func*/callback) {
		this._alert(title, message, true, callback);
	},

	/*
	 * Popup one alert with ok and cancel buttons with custom title and alert content
	 * @title 		the custom title or
	 *				null (using default title) or 
	 *				custom alert content if the second parameter is null
	 * @message 	the custom alert content or null
	 */
	alertWithButtons: function(/*string*/title, /*string*/message, /*func*/callback) {
		this._alert(title, message, false, callback);
	},

	_alert: function(title, message, okButtonOnly, callback) {
		if ((title && typeof title != "string") || (message && typeof message != "string") || (callback && typeof callback != "function")) {
			this.errorMessage = "invalid arguments";
			return;
		}
		
		if (!message) {
			message = title;
			title = null;
		}
		if (!message) {
			this.errorMessage = "invalid arguments";
			return;
		}

		var self = this;
		apiObj._idocs_ui_alert(title, message, okButtonOnly, function(data){
			var response = undefined;
			apiObj.defaultMsgHandler(self, data);
			if (!self.errorMessage)
				response = data.detail;
			
			if (callback) callback(response);
		});
	},

	/*
	 * Popup one prompt dialog with ok and cancel buttons with custom title and prompt content to ask for input
	 * @title 		the custom title or
	 *				null (using default title) or 
	 *				custom prompt content if the second parameter is null
	 * @message 	the custom prompt content or null
	 */
	prompt: function(/*string*/title, /*string*/message, /*func*/callback) {
		if ((title && typeof title != "string") || (message && typeof message != "string") || (callback && typeof callback != "function")) {
			this.errorMessage = "invalid arguments";
			return;
		}
		
		if (!message) {
			message = title;
			title = null;
		}
		if (!message) {
			this.errorMessage = "invalid arguments";
			return;
		}

		var self = this;
		apiObj._idocs_ui_prompt(title, message, function(data){
			var response = undefined;
			apiObj.defaultMsgHandler(self, data);
			if (!self.errorMessage)
				response = data.detail;
			
			if (callback) callback(response);
		});
	},
	
	showDialog: function(/*UserInterface*/ui) {
		if (!(ui && ui instanceof UserInterface)) {
			this.errorMessage = "invalid argument";
			return;
		}
		
		var self = this;
		apiObj._idocs_ui_showDialog(ui, function(data){
			apiObj.defaultMsgHandler(self, data);
		});
	},

	/*
	 * Show sidebar with custom content being defined in userInterface
	 * @param userInterface 	one userInterface object
	 */
	showSidebar: function(/*UserInterface*/ui) {
		if (!(ui && ui instanceof UserInterface)) {
			this.errorMessage = "invalid argument";
			return;
		}
		
		var self = this;
		apiObj._idocs_ui_showSidebar(ui, function(data){
			apiObj.defaultMsgHandler(self, data);
		});
	}
};

/////////////////////////////////////////////////////////////////////
//////////////////UserInterface class in iDocsApp ///////////////////
/////////////////////////////////////////////////////////////////////
/*
 * Create one userInterface object
 * @param content  custom html content
 */
var UserInterface = function(/*string*/content) {
	this.content = content;
};

/*
 * Set title to this userInterface, otherwise default title would be used 
 * @param title  one custom title
 */
UserInterface.prototype.setTitle = function(/*string*/title) {
	if (title && typeof title == "string" && title.length != 0)
		this.title = title;
};

/*
 * Set width to this userInterface, otherwise default width would be used
 * @param width  one custom width
 */
UserInterface.prototype.setWidth = function(/*int*/width) {
	if (width && typeof width == "number" && width > 0)
		this.width = parseInt(width);
};

/////////////////////////////////////////////////////////////////////
//////////////////Menu class in iDocsApp ////////////////////////////
/////////////////////////////////////////////////////////////////////

/*
 * Create one Menu object
 * @param label 	the menu label
 * @param bAddOn 	true if it is one AddOn menu
 */
var Menu = function(/*string*/label, /*boolean*/bAddOn) {
	if (!(label && typeof label == "string"))
		throw "invalid argument";

	this.label = label;
	this.elements = [];  // menu item, separator, sub menu
	this.bAddOn = !!bAddOn;
	this.errorMessage = null;
};

/*
 * Add one menu item in this menu
 * @param itemLabel		the menu item label
 */
/*Menu*/
Menu.prototype.addItem = function(/*string*/itemLabel, /*func*/callback) {
	if (!(itemLabel && typeof itemLabel == "string") || !(callback && typeof callback == "function")) {
		this.errorMessage = "invalid arguments";
		return null;
	}

	this.elements.push({type: "menuitem", label: itemLabel, func: callback});
	
	return this;
};

/*
 * Add one separator in this menu
 */
/*Menu*/
Menu.prototype.addSeparator = function() {
	this.elements.push({type: "separator"});
	
	return this;
};

/*
 * Add one submenu in this menu
 * @param menu 	one submenu object
 */
/*Menu*/
Menu.prototype.addSubMenu = function(/*Menu*/menu) {
	if (!(menu && menu instanceof Menu)) {
		this.errorMessage = "invalid argument";
		return null;
	}
	
	if (menu.bAddOn) {
		this.errorMessage = "can not add one sub-addons";
		return null;
	}

	this.elements.push({type: "menu", sub: menu});
	
	return this;
};

/*
 * Tell Docs to add AddOn
 */
Menu.prototype.addUi = function() {
	if (this.bAddOn && this.elements.length > 0) {
		apiObj._idocs_menu_addUi(this.elements);
		this.errorMessage = null;
	} else
		this.errorMessage = "fail to add menu to ui";
};

var iDocsApp = {
	execCommand: function(/*string*/command, /*array*/cmdArgs, /*func*/callback) {
		if ((command && typeof command != "string") || (cmdArgs && !Array.isArray(cmdArgs)) || (callback && typeof callback != "function"))
			return;

		switch (command) {
		case "getSelectedTextInScope":
			var scope = cmdArgs[0];
			apiObj[command](scope, callback);
			break;
		case "selectTextInScope":
			var scope = cmdArgs[0];
			var direction = cmdArgs[1];
			apiObj[command](scope, direction, callback);
			break;
		case "setTextInScope":
			var text = cmdArgs[0];
			var scope = cmdArgs[1];
			apiObj[command](text, scope, callback);
			break;
		default:
			// non-supported interface
			break;
		}
	},
	
	/*
	 * Return document type
     *    "sheet" - spreadsheet
	 * 	  "text" - document
	 * 	  "pres" - presentation
	 */
    getDocType: function(/*func*/callback) {
    	if (callback && typeof callback != "function")
    		return;

    	apiObj.getDocType(function(data){
    		var type = undefined;
    		if (data.status != "error")
    			type = data.detail;
    		if (callback) callback(type);
    	});
    },
	
	/*id*/addListener: function(eventName, callback) {
		if (callback && typeof callback != "function")
			return;

        // an unique id will be returned for you to remove listener later.
		return apiObj_helper.addListener(eventName, callback);
	},
	
    /*void*/removeListener: function(eventId) {
        apiObj_helper.removeListener(eventId);
    },
    
    /*
     * Register docs window
     */
    /*void*/registerIDocsWindow: function(window) {
        apiObj_helper.registerIDocsWindow(window);
    },
    
    // callback //
    /*void*/versionMismatch: function(data) {
    	var supportedVersion = data.supportedVersion;
    	if (data.higherThan) {
    		var errMsg = "Your SDK version is " + Docs_SDK_Version + ", it is higher than currently supported version " + supportedVersion + ". Add-ons won't work as expected!";
    		iDocsApp.getUi().alert("Mismatched Version Error", errMsg);
    	} else
    		console.info("Please upgrade your SDK to version " + supportedVersion);
    },
    
    /*
     * Return the Ui object
     */
    /*Ui*/getUi: function() {
    	return Ui;
    },
    
    /*
     * Save document to file respository with new file version
     */
    /*void*/save: function() {
    	apiObj._idocs_saveToRepository(function(data){
    		console.info("save to file repository");
    	});
    },
    
    /*
     * Add the list of custom fonts to fontname dropdown on Toolbar
     * @param fonts  the list of custom fonts
     */
    addFonts: function(fonts) {
    	if (!(fonts && Array.isArray(fonts))) return;
    	
        apiObj._idocs_addFonts(fonts, function(data){
    		console.info("Add custom fonts");
    	});
    }
};

for(var func in iDocsApp){
	SpreadsheetApp[func] = iDocsApp[func];
	DocumentApp[func] = iDocsApp[func];
}


var apiObj = {

    supported_events: ["IDOCS.EVENT.selectionChange", "IDOCS.EVENT.contentReady", "IDOCS.EVENT.versionMismatch"],

    _msgId: 1,
    
    _createMsgId: function() {
    	return this._msgId++;
    },

    defaultMsgHandler: function(obj, data) {
    	if(obj) {
        	if (data && data.status == "error")
        		obj.errorMessage = data.detail;
        	else
        		obj.errorMessage = null;  		
    	}
    },

    getSelectedTextInScope: function(scope, callback) {
        var obj = { id: this._createMsgId(), name: "getSelectedTextInScope", params: [scope] };
        apiObj_helper.inQueue(obj, callback);
    },

    selectTextInScope: function(scope, direction, callback) {
        var obj = { id: this._createMsgId(), name: "selectTextInScope", params: [scope, direction] };
        apiObj_helper.inQueue(obj, callback);
    },

    setTextInScope: function(text, scope, callback) {
        var obj = { id: this._createMsgId(), name: "setTextInScope", params: [text, scope] };
        apiObj_helper.inQueue(obj, callback);
    },

    getDocType: function(callback) {
        var obj = { id: this._createMsgId(), name: "getDocType", params: [] };
        apiObj_helper.inQueue(obj, callback);    	
    },
    
    //////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////
    //// object related functions are listed below ///////////////////////
    //their names start with prefix like _idocs_, _sheet_, _text_ ////////
    //////////////////////////////////////////////////////////////////////

    _idocs_addFonts: function(fonts, callback) {
        var obj = { id: this._createMsgId(), name: "_idocs_addFonts", params: [fonts] };
        apiObj_helper.inQueue(obj, callback);
    },
    
    _idocs_saveToRepository: function(callback) {
        var obj = { id: this._createMsgId(), name: "_idocs_saveToRepository", params: [] };
        apiObj_helper.inQueue(obj, callback);
    },
    
    _idocs_menu_addUi: function(menus, callback) {
        var obj = { id: this._createMsgId(), name: "_idocs_menu_addUi", params: [menus] };
        apiObj_helper.inQueue(obj, callback);
    },
    
    _idocs_ui_alert: function(title, message, okButtonOnly, callback) {
        var obj = { id: this._createMsgId(), name: "_idocs_ui_alert", params: [title, message, okButtonOnly], timeout: -1 };
        apiObj_helper.inQueue(obj, callback);
    },
    
    _idocs_ui_prompt: function(title, message, callback) {
        var obj = { id: this._createMsgId(), name: "_idocs_ui_prompt", params: [title, message], timeout: -1 };
        apiObj_helper.inQueue(obj, callback);
    },

    _idocs_ui_showDialog: function(ui, callback) {
        var obj = { id: this._createMsgId(), name: "_idocs_ui_showDialog", params: [ui] };
        apiObj_helper.inQueue(obj, callback);
    },
    
    _idocs_ui_showSidebar: function(ui, callback) {
        var obj = { id: this._createMsgId(), name: "_idocs_ui_showSidebar", params: [ui] };
        apiObj_helper.inQueue(obj, callback);
    },

    /////////////////////////////////////////////////////////////////////
    /////// SpreadsheetApp APIs /////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    _sheet_getSheets: function(callback) {
        var obj = { id: this._createMsgId(), name: "_sheet_getSheets", params: [] };
        apiObj_helper.inQueue(obj, callback);
    },
    
    _sheet_getActiveSheet: function(callback) {
        var obj = { id: this._createMsgId(), name: "_sheet_getActiveSheet", params: [] };
        apiObj_helper.inQueue(obj, callback);
    },

    _sheet_setActiveSheet: function(sheetId, callback) {
        var obj = { id: this._createMsgId(), name: "_sheet_setActiveSheet", params: [sheetId] };
        apiObj_helper.inQueue(obj, callback);
    },

    _sheet_isValidSheet: function(sheetName, callback) {
    	var obj = { id: this._createMsgId(), name: "_sheet_isValidSheet", params: [sheetName] };
    	apiObj_helper.inQueue(obj, callback);
    },

    _sheet_insertSheet: function(sheetName, callback) {
    	var obj = { id: this._createMsgId(), name: "_sheet_insertSheet", params: [sheetName] };
    	apiObj_helper.inQueue(obj, callback);
    },
    
    _sheet_hideSheet: function(sheetId, callback) {
    	var obj = { id: this._createMsgId(), name: "_sheet_hideSheet", params: [sheetId] };
    	apiObj_helper.inQueue(obj, callback);
    },

    _sheet_showSheet: function(sheetId, callback) {
    	var obj = { id: this._createMsgId(), name: "_sheet_showSheet", params: [sheetId] };
    	apiObj_helper.inQueue(obj, callback);
    },

    _sheet_getSheetName: function(sheetId, callback) {
    	var obj = { id: this._createMsgId(), name: "_sheet_getSheetName", params: [sheetId] };
    	apiObj_helper.inQueue(obj, callback);
    },
    
    _sheet_setSheetName: function(sheetId, newSheetName, callback) {
    	var obj = { id: this._createMsgId(), name: "_sheet_setSheetName", params: [sheetId, newSheetName] };
    	apiObj_helper.inQueue(obj, callback);
    },
    
    _sheet_isHiddenSheet: function(sheetId, callback) {
    	var obj = { id: this._createMsgId(), name: "_sheet_isHiddenSheet", params: [sheetId] };
    	apiObj_helper.inQueue(obj, callback);
    },
    
    _sheet_getSheetIndex: function(sheetId, callback) {
    	var obj = { id: this._createMsgId(), name: "_sheet_getSheetIndex", params: [sheetId] };
    	apiObj_helper.inQueue(obj, callback);
    },

    _sheet_setActiveRange: function(sheetId, row, column, endRow, endColumn, type, callback) {
    	var obj = { id: this._createMsgId(), name: "_sheet_setActiveRange", params: [sheetId, row, column, endRow, endColumn, type] };
    	apiObj_helper.inQueue(obj, callback);
    },

    _sheet_getActiveRange: function(sheetId, callback) {
    	var obj = { id: this._createMsgId(), name: "_sheet_getActiveRange", params: [sheetId] };
    	apiObj_helper.inQueue(obj, callback);
    },
    
    _sheet_range_clearContent: function(sheetId, row, column, endRow, endColumn, callback) {
    	var obj = { id: this._createMsgId(), name: "_sheet_range_clearContent", params: [sheetId, row, column, endRow, endColumn] };
    	apiObj_helper.inQueue(obj, callback);
    },
    
    _sheet_range_getValues: function(sheetId, row, column, endRow, endColumn, isDisplayValue, callback) {
    	var obj = { id: this._createMsgId(), name: "_sheet_range_getValues", params: [sheetId, row, column, endRow, endColumn, isDisplayValue] };
    	apiObj_helper.inQueue(obj, callback);
    },

    _sheet_range_setValues: function(sheetId, row, column, endRow, endColumn, values, callback) {
    	var obj = { id: this._createMsgId(), name: "_sheet_range_setValues", params: [sheetId, row, column, endRow, endColumn, values] };
    	apiObj_helper.inQueue(obj, callback);
    },
    
    _sheet_range_canEdit: function(sheetId, row, column, endRow, endColumn, callback) {
    	var obj = { id: this._createMsgId(), name: "_sheet_range_canEdit", params: [sheetId, row, column, endRow, endColumn] };
    	apiObj_helper.inQueue(obj, callback);
    },

    _sheet_range_getColors: function(sheetId, row, column, endRow, endColumn, bBackground, callback) {
    	var obj = { id: this._createMsgId(), name: "_sheet_range_getColors", params: [sheetId, row, column, endRow, endColumn, bBackground] };
    	apiObj_helper.inQueue(obj, callback);
    },

    _sheet_range_setColor: function(sheetId, row, column, endRow, endColumn, color, bBackground, callback) {
    	var obj = { id: this._createMsgId(), name: "_sheet_range_setColor", params: [sheetId, row, column, endRow, endColumn, color, bBackground] };
    	apiObj_helper.inQueue(obj, callback);
    },

    /////////////////////////////////////////////////////////////////////
    /////// DocumentApp APIs /////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    _text_clearChangeHistory: function(status, callback) {
        var obj = { id: this._createMsgId(), name: "_text_clearChangeHistory", params: [status] };
        apiObj_helper.inQueue(obj, callback);
    },

    _text_getDocProperty: function(propName, callback) {
        var obj = { id: this._createMsgId(), name: "_text_getDocProperty", params: [propName] };
        apiObj_helper.inQueue(obj, callback);    	
    },    
  
    _text_getCursor: function(callback) {
        var obj = { id: this._createMsgId(), name: "_text_getCursor", params: [] };
        apiObj_helper.inQueue(obj, callback);
    },

    _text_getSelection: function(callback) {
        var obj = { id: this._createMsgId(), name: "_text_getSelection", params: [] };
        apiObj_helper.inQueue(obj, callback);
    },

    _text_setCursor: function(position, callback) {
        var obj = { id: this._createMsgId(), name: "_text_setCursor", params: [position] };
        apiObj_helper.inQueue(obj, callback);
    },

    _text_setSelection: function(range, callback) {
        var obj = { id: this._createMsgId(), name: "_text_setSelection", params: [range] };
        apiObj_helper.inQueue(obj, callback);
    },

    _text_setTrackChange: function(status, callback) {
        var obj = { id: this._createMsgId(), name: "_text_setTrackChange", params: [status] };
        apiObj_helper.inQueue(obj, callback);
    },

    _text_containerElement_getChild: function(element, index, callback) {
        var obj = { id: this._createMsgId(), name: "_text_containerElement_getChild", params: [element, index] };
        apiObj_helper.inQueue(obj, callback);    	
    },

    _text_containerElement_getChildIndex: function(container, element, callback) {
        var obj = { id: this._createMsgId(), name: "_text_containerElement_getChildIndex", params: [container, element] };
        apiObj_helper.inQueue(obj, callback);    	
    },

    _text_containerElement_getNumChildren: function(container, callback) {
        var obj = { id: this._createMsgId(), name: "_text_containerElement_getNumChildren", params: [container] };
        apiObj_helper.inQueue(obj, callback);    	
    },

    _text_element_getParent: function(element, callback) {
        var obj = { id: this._createMsgId(), name: "_text_element_getParent", params: [element] };
        apiObj_helper.inQueue(obj, callback);    	
    },

    _text_element_getNextSibling: function(element, callback) {
        var obj = { id: this._createMsgId(), name: "_text_element_getNextSibling", params: [element] };
        apiObj_helper.inQueue(obj, callback);    	
    },

    _text_element_getPrevSibling: function(element, callback) {
        var obj = { id: this._createMsgId(), name: "_text_element_getPrevSibling", params: [element] };
        apiObj_helper.inQueue(obj, callback);    	
    },

    _text_body_getParagraphs: function(callback) {
        var obj = { id: this._createMsgId(), name: "_text_body_getParagraphs", params: [] };
        apiObj_helper.inQueue(obj, callback);    	
    },

    _text_body_appendParagraph: function(text, callback){
        var obj = { id: this._createMsgId(), name: "_text_body_appendParagraph", params: [text] };
        apiObj_helper.inQueue(obj, callback);
    },

    _text_body_insertParagraph: function(index, text, callback){
        var obj = { id: this._createMsgId(), name: "_text_body_insertParagraph", params: [index, text] };
        apiObj_helper.inQueue(obj, callback);
    },

    _text_paragraph_appendText: function(pId, text, callback){
        var obj = { id: this._createMsgId(), name: "_text_paragraph_appendText", params: [pId, text] };
        apiObj_helper.inQueue(obj, callback);
    },

    _text_paragraph_setText: function(pId, text, callback){
        var obj = { id: this._createMsgId(), name: "_text_paragraph_setText", params: [pId, text] };
        apiObj_helper.inQueue(obj, callback);
    },

    _text_position_insertText: function(position, text, callback){
        var obj = { id: this._createMsgId(), name: "_text_position_insertText", params: [position, text] };
        apiObj_helper.inQueue(obj, callback);
    },

    _text_text_getText: function(container, startOffset, length, callback){
        var obj = { id: this._createMsgId(), name: "_text_text_getText", params: [container, startOffset, length] };
        apiObj_helper.inQueue(obj, callback);
    },

    _text_text_setText: function(range, text, callback){
        var obj = { id: this._createMsgId(), name: "_text_text_setText", params: [range, text] };
        apiObj_helper.inQueue(obj, callback);
    }
};

var apiObj_helper = {

    queue: [],
    events: [],

    eventTimeout: 10000 * 2, // take spreadsheet's partial load into consideration
    eventId: 1,

    status_wait: 0,
    status_sent: 1,
    status_received: 2,

    domain: "*",

    registerIDocsWindow: function(win) {
    	iDocsApp.addListener("IDOCS.EVENT.versionMismatch", iDocsApp.versionMismatch);
    	
        this.docsWin = win;
        this.docsWin && this.docsWin.postMessage("handshake" + "-" + Docs_SDK_Version, this.domain);
    },
    
    getIDocsWindow: function() {
    	if (!this.docsWin) {
    		if (window.pe && window.pe.lotusEditor) {
    			// FIXME run in the same origin here?
    			this.registerIDocsWindow(window);
    		}
    	}
 	
    	return this.docsWin;
    },

    addListener: function(name, callback) {
        var id = this.eventId++;
        this.events.push({ id: id, callback: callback, name: name });
        return id;
    },

    removeListener: function(eventId) {
        for (var i = this.events.length - 1; i >= 0; i--) {
            var event = this.events[i];
            if (event.id == eventId) {
                this.events.splice(i, 1);
                break;
            }
        }
    },

    inQueue: function(json, callback) {
        this.queue.push({ json: json, callback: callback, status: this.status_wait, time: new Date() });
        this.checkQueue();
    },

    checkQueue: function() {
        var q = this.queue;
        if (q.length) {
            var head = q[0];
            var timeout = head.json.timeout != -1;
            var d = new Date();
            if (head.status == this.status_wait) {
                var timeoffset = d - head.time;
               	if (timeout && (timeoffset > this.eventTimeout)) {
               		q.shift();
               		if (head.callback) {
               			head.callback({ status: "error", detail: "function timeout" });
               		}
               		this.checkQueue();
               	}
                else {
                	var docsWin = this.getIDocsWindow();
                    docsWin && docsWin.postMessage(JSON.stringify(head.json, function (key, value) {
                   	 				if (typeof value === 'function')
                   	 					return value.toString();
                   	 				return value;
                    			}), this.domain);
                    head.sent_time = d;
                    head.status = this.status_sent;
                }
            }
            else if (head.status == this.status_sent) {
           		var timeoffset = d - head.sent_time;
           		if (timeout && (timeoffset > this.eventTimeout)) {
           			q.shift();
           			if (head.callback) {
           				head.callback({ status: "error", detail: "function timeout" });
           			}
           			this.checkQueue();
           		}
            }
            else if (head.status == this.status_received) {
                q.shift();
                if (head.callback) {
                    head.callback(head.result || { status: "success" });
                }
                // check it again.
                this.checkQueue();
            }
        }
        if (this.checkQueueTimer)
            clearTimeout(this.checkQueueTimer);
        if (q.length)
            this.checkQueueTimer = setTimeout(function () { apiObj_helper.checkQueue(); }, 1000);
    },

    msgReceived: function(json) {
        var eventId = json.eventId;
        var eventType = json.eventType;
        if (eventId || eventId === 0) {
            var head = this.queue[0];
            if (head && eventId === head.json.id) {
                head.status = this.status_received;
                head.result = json;
            }
            this.checkQueue();
        }
        else if (eventType) {
            // no id, not to response one call, just notification
            for (var i = 0; i < this.events.length; i++) {
                var event = this.events[i];
                if (event.callback && event.name == eventType) {
                    event.callback(json.detail);
                }
            }
        }
    },

    eventReceived: function(event) {
        var data = event.data;
        if (data) {
            try {
                var json = JSON.parse(data);
                this.msgReceived(json);
            } catch (e) { }
        }
    }
};

window.addEventListener("message", function(event) {
    apiObj_helper.eventReceived(event);
}, false);