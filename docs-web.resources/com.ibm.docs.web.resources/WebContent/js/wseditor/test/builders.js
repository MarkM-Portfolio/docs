dojo.provide("websheet.test.builders");

dojo.require("websheet.Constant");

(function(runner) {
	var _builders = runner.builders = {};
	
	var colors = _builders.colorPalette = [
	                      ["000000", "800000", "8b4513", "2f4f4f", "008080", "000080", "4b0082", "696969"], 
			              ["b22222", "a52a2a", "daa520", "006400", "40e0d0", "0000cd", "800080", "808080"], 
			              ["ff0000", "ff8c00", "ffd700", "008000", "00ffff", "0000ff", "ee82ee", "a9a9a9"],
			              ["ffa07a", "ffa500", "ffff00", "00ff00", "afeeee", "add8e6", "dda0dd", "d3d3d3"],
			              ["fff0f5", "faebd7", "ffffe0", "f0fff0", "f0ffff", "f0f8ff", "e6e6fa", "ffffff"]];
	
	_builders.posToColor = function(x, y) {
		var color = colors[x-1][y-1];
		if(!color)
			throw "postion is not correct";
		return "#" + color;
	};

	_builders.editor = function(){
		var e = {
				color		: arguments[0],
				displayName : arguments[1],
				email		: arguments[2],
				userId		: arguments[3]
		};
		return e;
	};
	/**
	 * arguments[0]: reference
	 * arguments[1]: rangeId
	 * arguments[2]: data
	 */
	_builders.permission = function(){
		var parsedRef = websheet.Helper.parseRef(arguments[0]);
		var area = new websheet.parse.Area(parsedRef, arguments[1], websheet.Constant.RangeUsage.ACCESS_PERMISSION);
		area.data = arguments[2];
		pm = new websheet.ACL.Permission(area);
		return pm;
	};
	
	_builders.dataValidation = function(){
		var dv = new runner.app.websheet.model.RulesObject.DataValidation(arguments[0],arguments[1],arguments[2]);
		
		var _self = {
			value1: function(v){
				dv._value1 = new websheet.model.RulesObject.RuleVal(v);;
				return _self;
			},
			value2: function(v){
				dv._value2 = new websheet.model.RulesObject.RuleVal(v);;
				return _self;
			},
			operator: function(v){
				dv._operator = v;
				return _self;
			},			
			value1Map : function(v){
				if(!dv._value1)
					dv._value1 = new websheet.model.RulesObject.RuleVal();
				if(typeof v == "object")
					dv._value1._cacheData = v;
				else
					dv._value1._calculatedValue = v;
				return _self;
			},
			value2Map : function(v){
				if(!dv._value2)
					dv._value2 = new websheet.model.RulesObject.RuleVal();
				if(typeof v == "object")
					dv._value2._cacheData = v;
				else
					dv._value2._calculatedValue = v;
				return _self;
			},
			value1Type: function(v){
				if(!dv._value1)
					dv._value1 = new websheet.model.RulesObject.RuleVal();
				dv._value1._type = v;
				return _self;
			},
			value2Type: function(v){
				if(!dv._value2)
					dv._value2 = new websheet.model.RulesObject.RuleVal();
				dv._value2._type = v;
				return _self;
			},
			value1Data:function(v){
				if(!dv._value1)
					dv._value1 = new websheet.model.RulesObject.RuleVal();
				dv._value1._calculatedValue = v;
				return _self;
			},
			value2Data:function(v){
				if(!dv._value2)
					dv._value2 = new websheet.model.RulesObject.RuleVal();
				dv._value2._calculatedValue = v;
				return _self;
			},
			topRow:function(v){
				dv._topRow = v;
				return _self;
			},
			leftCol:function(v){
				dv._leftCol = v;
				return _self;
			},
			finish: function() {
				// summary: Return style code when all things have been done. 
				return dv;
			}
		};
		return _self;
	};
	
	_builders.style = function() {
		// summary: Help to build StyleCode object
		var sc = new runner.app.websheet.style.StyleCode();
		var border = null;
		var _posToColor = _builders.posToColor;
		
		var _setBorder = function(type, val){
			if(border == runner.app.websheet.Constant.Style.BORDER){
				sc.setAttr(runner.app.websheet.Constant.Style.BORDER_TOP + type, val);
				sc.setAttr(runner.app.websheet.Constant.Style.BORDER_RIGHT + type, val);
				sc.setAttr(runner.app.websheet.Constant.Style.BORDER_BOTTOM + type, val);
				sc.setAttr(runner.app.websheet.Constant.Style.BORDER_LEFT + type, val);
			} else {
				sc.setAttr(border + type, val);
			}
		};
		
		var _self = {
			defaultStyle: function() {
				_self.border().solid().borderColor("#000000").borderWidth("")
					.align("")
					.bgColor("#ffffff")
					.wrap(false)
					.category("")
					.code("")
					.fmcolor("")
					.currency("")
					.bold(false)
					.italic(false)
					.strikethrough(false)
					.underline(false)
					.color("#000000")
					.fontArial()
					.size(10);
				return _self;
			},
			border: function(){
				// summary: Focus on all borders.
				border = runner.app.websheet.Constant.Style.BORDER;
				return _self;
			},
			borderTop: function(){
				// summary: Focus on top border.
				border = runner.app.websheet.Constant.Style.BORDER_TOP;
				return _self;
			},
			borderRight: function(){
				// summary: Focus on right border.
				border = runner.app.websheet.Constant.Style.BORDER_RIGHT;
				return _self;
			},
			borderBottom: function(){
				// summary: Focus on bottom border.
				border = runner.app.websheet.Constant.Style.BORDER_BOTTOM;
				return _self;
			},
			borderLeft: function(){
				// summary: Focus on left border.
				border = runner.app.websheet.Constant.Style.BORDER_LEFT;
				return _self;
			},
			thin: function(){
				// summary: Set focusing border to thin.
				_setBorder("", "thin");
				return _self;
			},
			thick: function(){
				// summary: Set focusing border to thick.
				_setBorder("", "thick");
				return _self;
			},
			borderWidth: function(w) {
				_setBorder("", w);
				return _self;
			},
			solid: function(){
				// summary: Set focusing border to solid.
				_setBorder("_style", "solid");
				return _self;
			},
			dotted: function(){
				// summary: Set focusing border to dotted.
				_setBorder("_style", "dotted");
				return _self;
			},
			dashed: function(){
				// summary: Set focusing border to dashed.
				_setBorder("_style", "dashed");
				return _self;
			},
			borderColor: function(x, y){
				// summary: Set focusing border's color. Users can use color code or 1-based coords
				//      of color in palette. Such as
				// 		xx.borderColor("#ffffff")
				//      xx.borderColor(1, 1)
				var color = null;
				if(y != null || y != undefined)
					color = _posToColor(x, y);
				else
					color = x;
				_setBorder("_color", color);
				return _self;
			},
			bgColor: function(x, y){
				// summary: Set background color of style code. Users can use color code or 1-based
				//      coords of color in palette. Such as
				// 		xx.bgColor("#ffffff")
				//      xx.bgColor(1, 1)
				var color = null;
				if(y != null || y != undefined)
					color = _posToColor(x, y);
				else
					color = x;
				sc.setAttr(runner.app.websheet.Constant.Style.BACKGROUND_COLOR, color);
				return _self;
			},
			color: function(x, y){
				// summary: Set color of style code. Users can use color code or 1-based coords
				//      of color in palette. Such as
				// 		xx.bgColor("#ffffff")
				//      xx.bgColor(1, 1)
				var color = null;
				if(y != null || y != undefined)
					color = _posToColor(x, y);
				else
					color = x;
				sc.setAttr(runner.app.websheet.Constant.Style.COLOR, color);
				return _self;
			},
			font: function(/*String*/font){
				// summary: Set font family of style code.
				sc.setAttr(runner.app.websheet.Constant.Style.FONTNAME, font);
				return _self;
			},
			fontArial: function(){
				// summary: Set font family to Arial.
				sc.setAttr(runner.app.websheet.Constant.Style.FONTNAME, "Arial");
				return _self;
			},
			fontTimesNewRoman: function(){
				// summary: Set font family to Times New Roman.
				sc.setAttr(runner.app.websheet.Constant.Style.FONTNAME, "Times New Roman");
				return _self;
			},
			fontCourierNew: function(){
				// summary: Set font family to Courier New.
				sc.setAttr(runner.app.websheet.Constant.Style.FONTNAME, "Courier New");
				return _self;
			},
			fontGeorgia: function(){
				// summary: Set font family to Georgia.
				sc.setAttr(runner.app.websheet.Constant.Style.FONTNAME, "Georgia");
				return _self;
			},
			fontComicSansMS: function(){
				// summary: Set font family to Comic Sans MS.
				sc.setAttr(runner.app.websheet.Constant.Style.FONTNAME, "Comic Sans MS");
				return _self;
			},
			fontCalibri: function(){
				// summary: Set font family to Calibri.
				sc.setAttr(runner.app.websheet.Constant.Style.FONTNAME, "Calibri");
				return _self;
			},
			size: function(/*Number*/size){
				// summary: Set font size of style code.
				sc.setAttr(runner.app.websheet.Constant.Style.SIZE, size);
				return _self;
			},
			formatPercent: function(){
				// summary: Set format category to percent.
				sc.setAttr(runner.app.websheet.Constant.Style.FORMATTYPE, "percent");
				return _self;
			},
			formatCurrency: function(){
				// summary: Set format category to currency.
				sc.setAttr(runner.app.websheet.Constant.Style.FORMATTYPE, "currency");
				return _self;
			},
			category: function(category) {
				// summary: set style general category
				sc.setAttr(runner.app.websheet.Constant.Style.FORMATTYPE, category);
				return _self;
			},
			currency: function(/*String*/currency){
				// summary: Set currency. Such as
				//      xx.currency("CNY")
				sc.setAttr(runner.app.websheet.Constant.Style.FORMATCURRENCY, currency);
				return _self;
			},
			code: function(code){
				// summary: Set format code. This is designed to deal with imported xls or xlsx files
				//      that have complex format code. Avoid using this function in normal testcase. 
				sc.setAttr(runner.app.websheet.Constant.Style.FORMATCODE, code);
				return _self;
			},
			fmcolor: function(fmc) {
				// summary: set style "fmcolor" field. This field is generally deprecated.
				sc.setAttr(runner.app.websheet.Constant.Style.FORMAT_FONTCOLOR, fmc);
				return _self;
			},
			bold: function(/*boolean?*/bold){
				// summary: Set font to bold or not. Default is true.
				if(bold != false)
					bold = true;
				sc.setAttr(runner.app.websheet.Constant.Style.BOLD, bold);
				return _self;
			},
			italic: function(italic){
				// summary: Set font to italic or not. Default is true.
				if(italic != false)
					italic = true;
				sc.setAttr(runner.app.websheet.Constant.Style.ITALIC, italic);
				return _self;
			},
			strikethrough: function(strikethrough){
				// summary: Set font to strikethrough or not. Default is true.
				if(strikethrough != false)
					strikethrough = true;
				sc.setAttr(runner.app.websheet.Constant.Style.STRIKTHROUGH, strikethrough);
				return _self;
			},
			underline: function(underline){
				// summary: Set font to strikethrough or not. Default is true.
				if(underline != false)
					underline = true;
				sc.setAttr(runner.app.websheet.Constant.Style.UNDERLINE, underline);
				return _self;
			},
			align: function(align) {
				sc.setAttr(runner.app.websheet.Constant.Style.TEXT_ALIGN, align);
				return _self;
			},
			valign: function(valign) {
				sc.setAttr(runner.app.websheet.Constant.Style.VERTICAL_ALIGN, valign);
				return _self;
			},
			wrap: function(wrap) {
				if (wrap == undefined) {
					wrap = true;
				}
				
				sc.setAttr(runner.app.websheet.Constant.Style.WRAPTEXT, wrap);
				return _self;
			},
			finish: function() {
				// summary: Return style code when all things have been done. 
				return sc;
			},
			putInto: function(styleManager) {
				// summary: put the generated style code to styleManager and return the style id
				return styleManager.addStyle(sc, true);
			}
		};		
		return _self;
	};
	
	
	_builders.object = function(properties, context) {
		// summary: helper to make one object by providing dot separate properties values and names, handy for making stub objects
		//	this is a shortcut for calling dojo.setObject() multiple times
		// 	document copy from dojo.setObject
		// summary:
		//		Set a property from a dot-separated string, such as "A.B.C"
		//	description:
		//		Useful for longer api chains where you have to test each object in
		//		the chain, or when you have an object reference in string format.
		//		Objects are created as needed along `path`. Returns the passed
		//		value if setting is successful or `undefined` if not.
		//	name:
		//		Path to a property, in the form "A.B.C".
		//	context:
		//		Optional. Object to use as root of path. Defaults to
		//		`dojo.global`.
		//	example:
		//		set the value of `foo.bar.baz`, regardless of whether
		//		intermediate objects already exist:
		//	|	dojo.setObject("foo.bar.baz", value);
		//	example:
		//		without `dojo.setObject`, we often see code like this:
		//	|	// ensure that intermediate objects are available
		//	|	if(!obj["parent"]){ obj.parent = {}; }
		//	|	if(!obj.parent["child"]){ obj.parent.child= {}; }
		//	|	// now we can safely set the property
		//	|	obj.parent.child.prop = "some value";
		//		wheras with `dojo.setObject`, we can shorten that to:
		//	|	dojo.setObject("parent.child.prop", "some value", obj);
		for (var i = 0; i < properties.length; i++) {
			dojo.setObject(properties[i][0], properties[i][1], context);
		}
		
		return context;
	};
	
	_builders.message = function() {
		// summary: helper to build a sendMessage message
		var _json = {};
		var _self = {
			JSON: function() {
				return _json;
			},
			action: function(a) {
				_json["action"] = a;
				return _self;
			},
			referenceType: function(type) {
				var o = _json["reference"];
				if (o == null) {
					o = _json["reference"] = {};
				}
				o["refType"] = type;
				return _self;
			},
			referenceValue: function(v) {
				var o = _json["reference"];
				if (o == null) {
					o = _json["reference"] = {};
				}
				o["refValue"] = v;
				return _self;
			},
			cell: function(cell) {
				var o = _json["data"] = {};
				o["cell"] = cell;
				return _self;
			}
		};
		return _self;
	};
	
	var _argsToSet = function(args, start) {
		var set = {};
		for (var i = start; i < args.length; i++) {
			set[args[i]] = true;
		}
		return set;
	};
	
	var _sheetBuilder = _builders.sheet = function() {
		// summary: build a sheet with customized data, call sheetBuilder() to begin, chain following functions:
		//		row() to add a row of cells
		//		column() to add a column of cells
		//		rowMeta() to add/change row meta
		//		columnMeta() to add/change column meta
		//		done() to finish building and return the sheet.
		//		Each function can be called in many forms for convince.
		//		sheetBuilder() can be called by arguments,
		//		1.	document, sheetName, properties...: create sheet by sheetName in document, properties can be:
		//			* "hidden": hidden sheet
		//			* "veryHidden": very hidden sheet
		//			* "protected": protected sheet
		//		2.	sheet: build models in a constructed sheet
		//		3. 	no arguments: get document object from runner.app.websheet.Main.controller
		
		// crack arguments
		var o = arguments[0];
		var sheet;
		if (o == null) {
			var _doc = runner.app.websheet.Main.getDocumentObj();
			sheet = _doc._createSheet(sheetName, null, null, null, {protected: pted, vis : hide});
		} else if (o.isInstanceOf && o.isInstanceOf(runner.app.websheet.model.Document)) {
			var _doc = o;
			var hide = null;
			var pted = false;
			var sheetName = null;
			for (var i = 1; i < arguments.length; i++) {
				switch (arguments[i]) {
				case "hidden":
					hide = "hidden";
					break;
				case "veryHidden":
					hide = "veryHidden";
					break;
				case "protected":
					pted = true;
					break;
				default:
					sheetName = arguments[i];
					break;
				}
			}
			sheet = _doc._createSheet(sheetName, null, null, null, {protected: pted, vis : hide});
		} else if (o.isInstanceOf && o.isInstanceOf(runner.app.websheet.model.Sheet)) {
			sheet = o;
		}
		
		var _self = {
			row: function(rowArg, cells) {
				// summary: Create a row with provided cells, cells is an array of each cell definition.
				// Args for row can be an integer or array. If it is integer, it is the row index. If array,
				//		[ integer ]: first integer being the row index.
				//		[ , integer ]: second integer being the repeated number
				//		[ , , integer ]: third integer being row height
				//		[ "hide" ]: hidden row
				// Each cell definition is a inner array. Cell definition can be:
				//		[ "ce*", integer ]	: style cell with style id ce* and repeat number integer, no integer means
				//						      repeat number 0
				//		[ "colspan", integer ] : covered cell with colspan integer, no integer to set colspan as 2
				//		[ "rowspan", integer ] : covered cel with rowspan integer, no integer to set rowspan as 2
				//		any of the above can repeat to form a valid cell def, e.g.
				//			[ "ce*", "colspan" ]
				//			[ "colspan", 3, "ce*", 3 ]
				//		[ any, any... ] : anything that not any of the above creates a plain value cell, set raw value as provided.
				//			If any is given repeatedly,
				//				1.	raw value
				//				2.	calculated value
				//				3.	type
				//				4.	formula value
				//				5.	link
				//		[ any, _latter_ ] : where latter being any of the above repeatedly, e.g
				//			[ any, "ce*" ]
				//			[ any, "ce*", 3, "colspan", 4 ]
				//			all being valid cell def.
				//  cells array can leave empty element if no cell object in the position
				var index;
				var height = vis = rn = null;
				if(typeof rowArg == "number")
					index = rowArg;
				else{
					for(var k = 0; k < rowArg.length; k ++){
						var arg = rowArg[k];
						if(arg == null)
							continue;
						if (arg == "hide") {
							vis = arg;
						} else if (typeof(arg) == "number") {
							if (k == 0) {
								// first element in meta being the repeat number
								index = arg;
							} else if (k == 1){
								rn = arg;
							} else {
								height = arg;
							}
						}
					}
				}
				var row = sheet._createRow(index,null,height,rn,false,vis);
				// get cell defs
				if (cells == null) {
					return _self;
				}
				for (var i = 0; i < cells.length; i++) {
					var value = styleId = cs = rs = rn = cv = fv = type = link = null;
					var args = cells[i];
					if (args == null) {
						continue;
					}
					for (var j = 0; j < args.length; j++) {
						var arg = args[j];
						if (typeof(arg) == "string" && (arg.indexOf("ce") == 0 || arg == "defaultcellstyle")) {
							styleId = arg;
							if (typeof(args[j + 1]) == "number") {
								rn = args[j + 1];
								j++;
							} else {
								rn = 0;
							}
						} else if (arg == "colspan") {
							if (typeof(args[j + 1]) == "number") {
								cs = args[j + 1];
								j++;
							} else {
								cs = 2;
							}
						} else if (arg == "rowspan") {
							if (typeof(args[j + 1]) == "number") {
								rs = args[j + 1];
								j++;
							} else {
								rs = 2;
							}
						} else {
							switch (j) {
							case 0:
								value = arg;
								break;
							case 1:
								cv = arg;
								break;
							case 2:
								type = arg;
								break;
							case 3:
								fv = arg;
								break;
							case 4:
								link = arg;
								break;
							default:
								// don't know what it is
								break;
							}
						}
					}

					if (value != null) {
						// TODO will this change? goes to cell constructor, not the row._createCell for value cell
						var colId = sheet._idManager.getColIdByIndex(sheet._id, i);
						var cell = new runner.app.websheet.model.Cell(row, colId, null, value, cv, null, link, type);
						row._valueCells[i] = cell;
					}
					
					if (styleId != null) {
						var sc = row._createCell(i + 1, row._doc.CellType.STYLE);
				 		sc._repeatednum = rn;
				 		sc._styleId = styleId;
					}
					
					if (cs != null) {
						var coverInfo = row._createCell(i + 1, row._doc.CellType.COVERINFO);
						coverInfo.setColSpan(cs);
					}
				}
				
				return _self;
			},
			
			columnMeta: function(index, meta) {
				// create a column with provided meta, first argument being the index, meta is an array that may in form:
				//		[ integer ]: first integer being the repeated number
				//		[ "ce*" ]: column with style
				//		[ , integer ]: integer after first being column width
				//		[ "hide" ]: hidden column
				//		attributes can be in any sequence, except for first element being the repeated number
				var width = styleId = vis = rn = null;
				for (var i = 0; i < meta.length; i++) {
					var arg = meta[i];
					if (arg == "hide") {
						vis = arg;
					} else if (typeof(arg) == "number") {
						if (i == 0) {
							// first element in meta being the repeat number
							rn = arg;
						} else {
							// else the width
							width = arg;
						}
					} else if (typeof(arg) == "string" && (arg.indexOf("ce") == 0 || arg == "defaultcellstyle")) {
						styleId = arg;
					}
				}
		 		sheet._createColumn(index, null, width, styleId, rn, null, null, null, vis);
		 		return _self;
			},
			
			done: function() {
				return sheet;
			}
		};
		
		return _self;
	};
	
	_builders.reference = function() {
		// summary: helper to build a references, to be put in a message
		var _sname, _esname, _srindex, _erindex, _scindex, _ecindex;
		var _type;
		
		var _self = {
			sheetName: function(n) {
				_sname = n;
				return _self;
			},
			endSheetName: function(n) {
				_esname = n;
				return _self;
			},
			rowIndex: function(i) {
				_srindex = i;
				return _self;
			},
			endRowIndex: function(i) {
				_erindex = i;
				return _self;
			},
			columnIndex: function(i) {
				_scindex = i;
				return _self;
			},
			endColumnIndex: function(i) {
				_ecindex = i;
				return _self;
			},
			type: function(t) {
				_type = t;
				return _self;
			},
			toAddress: function() {
				var p = {};
				p["type"] = _type;
				return runner.app.websheet.Helper.getAddressByIndex(_sname, _srindex, _scindex, _esname, _erindex, _ecindex, p);				
			}
		};
		
		return _self;
	};
})(window);