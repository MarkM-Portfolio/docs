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

dojo.provide("websheet.grid.RenderTree");

dojo.require("websheet.model.Range");
dojo.require("websheet.grid.LayoutEngine");

dojo.declare("websheet.grid._Tree", null, {
	_sheet: null, // optional shhet model, used to get some global doc or style properties, may be mull.

	Style: websheet.Constant.Style,

	constructor: function () { this._root = { type : 'root', children : []}; },
	
	insert: function () {},
	
	root: function () { return this._root; },
	
	invalidate: function () {this._root.children = [];},
	
	setSheet: function (sheet) { this._sheet = sheet;}
	
});

dojo.declare("websheet.grid._TextTree", websheet.grid._Tree, {
	// Module:
	//		websheet/canvas/_TextTree
	// 
	
	constructor: function () {
		this.inherited(arguments);
		this._root.type = 'root';
		this._root.value = '';
	},
	
	insert: function (textCell) {
		// summary:
		//		Insert a font node to the text tree, the font node should contain the following content:
		// font:	font string,
		// color:	font color,
		// cell :	Object 
		//  { 
		//	
		//
		var 
			font = textCell.font,
			color = textCell.color,
			fonts = this._root.children,
			node = null,
			index = 0;
		for (var idx = 0, len = fonts.length;  true; idx++) {
			node = fonts[idx];
			if (node == null) {
				// not found
				this._root.children.push(node = {
						type : 'font',
						value: font,
						children : []
				});
			}
			if (node.value == font) {
				//get it, extend to color
				var 
					ftnode = node,
					colors = ftnode.children;
				for (var cidx = 0, clen = colors.length; true; cidx++) {
					node = colors[cidx];
					if (node == null) {
						// not found
						ftnode.children.push(node = {
								type : 'fontColor',
								value : color,
								children : []
						});
					}
					if (node.value == color) {
						// get, 
						node.children.push(textCell);
						return;
					}
				}
			}
		}
	}
});

dojo.declare("websheet.grid._UserIndicatorTree", websheet.grid._Tree, {
	
	constructor: function () {
		this.inherited(arguments);
	},
	
	insert: function (indicator) {
		var node = this._getUserNode(indicator.user, true);
		node.children.push(indicator);
	},
	
	_getUserNode: function(user, bCreate) {
		var 
			users = this._root.children,
			node;
		for(var idx = 0, len = users.lengh; true; idx++) {
			node = users[idx];
			if(node == null) {
				// not found
				if(bCreate){
					this._root.children.push(node = {
							type : 'user',
							value: user,
							children : []
					});
				}
				return node;
			}
			if(node.value == user) {
				return node;
			}
		}
		return null;
	},
	
	merge: function(tree) {
		var 
			users = tree._root.children,
			node;
		for(var idx = 0, len = users.length; idx < len; idx++) {
			node = users[idx];
			var children = this._getUserNode(node.value, true).children;
			for(var i = 0; i < node.children.length; i++){
				children.push(node.children[i]);
			}
		}
	}
});

dojo.declare("websheet.grid._BackgroundTree", websheet.grid._Tree, {
	_bFillDefaultColor : false,
	_bInHighContrastMode: false,
	
	constructor: function () {
		this.inherited(arguments);
		this._root.type = 'root';
		this.invalidate();
		if (dojo.body() && dojo.hasClass(dojo.body(), "dj_a11y")) {
			this._bInHighContrastMode = true;
		}
	},
	
	invalidate: function () {
		this.inherited(arguments);	
		this.dfNodeList = [];
		this.lastNode = null;
	},
	
	setRange: function(range){
		if(range){
			this.sr = range.startRow;
			this.er = range.endRow;
			this.sc = range.startCol;
			this.ec = range.endCol;
		}
	},
	
	setDefaultStyle: function(color){
		this.defaultColor = color;
		if (color != '#ffffff' || this._bInHighContrastMode) {
			this._bFillDefaultColor = true;
			this._root.children.push({
				type : 'color',
				value : color,
				children : this.dfNodeList
			});
		}
	},
	
	insert: function (node) {
		var
			color = node.color,
			colors = this._root.children;
		if(color && color != this.defaultColor){
			for(var idx = 0, len = colors.length; true; idx++){
				var colorNode = colors[idx];
				if(colorNode == null){
					this._root.children.push(colorNode = {
							type : 'color',
							value : color,
							children : []
					});
				}
				if(color == colorNode.value){
					this.merge(node, colorNode.children);
					this.lastNode = node;
					break;
				}
			}
		}
		this.colIndex = node.endCol;
	},
	
	merge: function(node, nodeList, bNotPush) {
		if(!bNotPush){
			var length = nodeList.length;
			if(length == 0){
				nodeList.push(node);
			} else{
				var lastColorNode = nodeList[length - 1];
				if(lastColorNode.row == node.row && lastColorNode.endCol == this.colIndex){//lastColorNode.endCol == (node.col - 1), there might be column hidden
					lastColorNode.endCol = node.endCol;
					return;
				} else {
					nodeList.push(node);
				}
			}
		}
		// fill the default background color child
		if (this._bFillDefaultColor) {
			var startRow = this.sr;
			if(this.lastNode){
				if(this.lastNode.row == node.row){
					if(node.col - this.lastNode.endCol > 1) {
					this.dfNodeList.push({
						row : node.row,
						col : this.lastNode.endCol + 1,
						endCol : node.col - 1
					});
					}
					return;
				} else {
					if(this.lastNode.endCol < this.ec){
						this.dfNodeList.push({
							row : this.lastNode.row,
							col : this.lastNode.endCol + 1,
							endCol : this.ec
						});
					}
				}
				startRow = this.lastNode.row + 1;
			}
			for(var i = startRow; i < node.row; i++) {
				this.dfNodeList.push({
						row : i,
						col : this.sc,
						endCol : this.ec
				});
			}
			if(node.col > this.sc){
				this.dfNodeList.push({
					row : node.row,
					col : this.sc,
					endCol : node.col - 1
				});
			}
		}
	},
	
	setEndRow: function(endRow) {
		this.er = endRow;
		// fill with last default color
		this.merge({
			row : endRow,
			col : this.ec + 1,
			endCol : this.ec + 1
		},this.dfNodeList, true);
	}
});

dojo.declare("websheet.grid._BorderTree", websheet.grid._Tree, {
	
	dfBorders : {
			"b": "0",
			"bc": "#000000",
			"bs": "solid",
			"l": "0",
			"lc": "#000000",
			"ls": "solid",
			"r": "0",
			"rc": "#000000",
			"rs": "solid",
			"t": "0",
			"tc": "#000000",
			"ts": "solid"	
		},
	constructor: function () {
		this.inherited(arguments);
		this._root.type = 'root';
		this.invalidate();
	},
	
	invalidate: function() {
		this.inherited(arguments);
		this.dfHzNodeList = [];
		this.dfVtNodeList = [];
		this.hzNodeList = [];
		this.vtNodeList = [];
		this.lastRow = this.lvr = this.lvc = 1;
	},
	
	cut: function (inRow, fromColumn, toColumn) {
		// cut through borders due to text overflow.
		//
		//console.info('cut border at row:', inRow + 1, ' from col:', fromColumn, ' to col:', toColumn);
		if(fromColumn < toColumn) {
			// nodeList all store node with 1-based
			inRow += 1;
			fromColumn += 1;
			toColumn += 1;
			this._cut(this.vtNodeList, inRow, fromColumn, toColumn);
			this._cut(this.dfVtNodeList, inRow, fromColumn, toColumn);
		}
	},
	
	_cut: function (list, row, fromColumn, toColumn) {
		for(var i = fromColumn; i < toColumn; i++){
			var nodeList = list[i];
			if(nodeList){
				var length = nodeList.length;
				for(var j = 0; j < length; j++){
					var node = nodeList[j];
					if(row < node.row)
						break;
					if(row < node.endRow){
						if(row == node.row){
							node.row = row + 1;
							if(node.row == node.endRow){
								nodeList.splice(j, 1);
							}
							break;
						}
						if(row == node.endRow - 1){
							node.endRow = row;
							if(node.row == node.endRow)
								nodeList.splice(j, 1);
							break;
						}
						//split it into two part
						var newNode = JSON.parse(JSON.stringify(node));
						node.endRow = row;
						newNode.row = row + 1;
						nodeList.splice(j+1, 0, newNode);
						break;
					}
						
				}
			}
		}
	},
	
	setDefaultStyle: function (defaultStyle){
		var dAttrs = defaultStyle._attributes;
			
		// check all border styles, width and colors for non-default value and put to _dBorders
		for (var p in this.dfBorders) {
			if (dAttrs[p] != null && this.dfBorders[p] != dAttrs[p]) {
				this.dfBorders[p] = dAttrs[p];
			}
		}
		// insert children for default border
		this.dfVtNodeList = this._getPosition({
			width : this._getWidth(this.dfBorders["r"]),
			color : this.dfBorders["rc"],
			dash : this._getDashByWidth(this.dfBorders["rs"], this.dfBorders["r"]),
			dir : "v"
		});
		this.dfHzNodeList = this._getPosition({
			width : this._getWidth(this.dfBorders["b"]),
			color : this.dfBorders["bc"],
			dash : this._getDashByWidth(this.dfBorders["bs"], this.dfBorders["b"]),
			dir : "h"
		});
	},
	
	setRange: function(range){
		if(range){
			this.sr = range.startRow;
			this.lastRow = this.sr;
			this.er = range.endRow + 1;
			this.sc = range.startCol;
			this.ec = range.endCol + 1;
		}
	},
	
	_insertMergeCellBorder: function(node, dir, bLeft/*or bTop*/) {
		var cellSpanNode = {
				width: -1,
				color: "#ffffff",
				dash: 0
			};
		if(dir == "v"){
			cellSpanNode.dir = 'v';
			var nodeList = this._getPosition(cellSpanNode);
			cellSpanNode.row = node.row;
			cellSpanNode.endRow = node.row + 1;
			if(bLeft) {
				// insert the border with width = -1 for invisible cols
				for(var i = this.lvc + 1; i < node.col; i++){
					var invisibleCellSpanNode = dojo.clone(cellSpanNode);
					invisibleCellSpanNode.col = invisibleCellSpanNode.endCol = i;
					this.merge(invisibleCellSpanNode, nodeList, true);
				}
				cellSpanNode.col = cellSpanNode.endCol = node.col;
			}else
				cellSpanNode.col = cellSpanNode.endCol = node.col + 1;
			this.merge(cellSpanNode, nodeList, true);
		} else if(dir == "h") {
			cellSpanNode.dir = 'h';
			var nodeList = this._getPosition(cellSpanNode);
			cellSpanNode.col = node.col;
			cellSpanNode.endCol = node.col + 1;
			if(bLeft){
				// insert the border with width = -1 for invisible rows
				for(var i = this.lvr + 1; i < node.row; i++){
					var invisibleCellSpanNode = dojo.clone(cellSpanNode);
					invisibleCellSpanNode.row = invisibleCellSpanNode.endRow = i;
					this.merge(invisibleCellSpanNode, nodeList);
				}
				cellSpanNode.row = cellSpanNode.endRow = node.row;
			}else{
				cellSpanNode.row = cellSpanNode.endRow = node.row + 1;
			}
			this.merge(cellSpanNode, nodeList);
		}
	},
	
	insert: function (node) {
		if (node) {
			var cellStyle = node.cellStyle;
			var bHasBorder = cellStyle.hasBorderStyle();
			
			if (node.left) {
				this._insertMergeCellBorder(node, "v", true);
			} else if (bHasBorder) {
				this._insertBorder("left", node);
			}
			
			if (node.right) {
				this._insertMergeCellBorder(node, "v");
			} else if (bHasBorder) {
				this._insertBorder("right", node);
			}
			
			if (node.top) {
				this._insertMergeCellBorder(node, "h", true);
			} else if (bHasBorder) {
				//if start the new row, we need to fill the horizontal default border before this row
				this._insertBorder("top", node) && (this.lastRow = node.row);
			}
			
			if (node.bottom) {
				this._insertMergeCellBorder(node, "h");
			} else if (bHasBorder) {
				this._insertBorder("bottom", node);
			}
		}
	},
	
	setEndRow: function(endRow) {
		this.er = endRow + 1;
		this.lvr = endRow;
		//TODO: merge the node when render iterate
		
		// fill with last default borders
		if (this._sheet && this._sheet.getOffGridLines()) {
			// turned off grid lines
		}
		else {			
			for(var i = this.sc; i <= this.ec; i++){
				this.merge({
					row : this.er,
					endRow : this.er,
					col : i,
					endCol : i
				}, this.dfVtNodeList, true, false, true);
				
			}
			
			this.merge({
				row : this.er + 1,
				endRow : this.er + 1,
				col: this.ec,
				endCol : this.ec
			}, this.dfHzNodeList, false, true, true);
		}
	},
	
	_getBorderAttr: function(attrs, attr) {
		// summary: get attr from style, if not exist or is null, fall back to same attr in dcs,
		var v, bDf = false;
		if (attrs) {
			v = attrs[attr];
			var wsConsts = this.Style;	
			if(attr === wsConsts.BORDER_TOP || attr === wsConsts.BORDER_LEFT || 
				attr === wsConsts.BORDER_RIGHT || attr === wsConsts.BORDER_BOTTOM){
				if (v == null) {
					bDf = true;
					if (this.dfBorders == null) {
						v = null;
					} else {
						v = this.dfBorders[attr];
					}
				}
			}
			else if (v == null || (v.length != null && v.length == 0)) {
				bDf = true;
				if (this.dfBorders == null) {
					v = null;
				} else {
					v = this.dfBorders[attr];
				}
			}
		} else {
			bDf = true;
			if (this.dfBorders == null) {
				v = null;
			} else {
				v = this.dfBorders[attr];
			}
		}
		
		if(!bDf){
			if(this.dfBorders != null && v == this.dfBorders[attr])
				bDf = true;
		}
		
		return {value: v, isDefaultValue : bDf};
	},
	
	_insertBorder: function(direction, node){
		var styleConstant = this.Style,
			cellStyle = node.cellStyle,
			attrs = cellStyle._attributes,
			widthAttr, colorAttr, styleAttr,
			newNode, nodeList, bVertical, bTop,
			startRow = node.row,
			endRow = startRow + 1,
			startCol = node.col,
			endCol = startCol + 1;
		switch(direction){
		case  "left":
			widthAttr = this._getBorderAttr(attrs, styleConstant.BORDER_LEFT);
			colorAttr = this._getBorderAttr(attrs, styleConstant.BORDER_LEFT_COLOR);
			styleAttr = this._getBorderAttr(attrs, styleConstant.BORDER_LEFT_STYLE);
			newNode = {
					row : startRow,
					endRow : endRow,
					col : startCol,
					endCol : startCol
			};
			bVertical = true;
			break;
		case  "right":
			widthAttr = this._getBorderAttr(attrs, styleConstant.BORDER_RIGHT);
			colorAttr = this._getBorderAttr(attrs, styleConstant.BORDER_RIGHT_COLOR);
			styleAttr = this._getBorderAttr(attrs, styleConstant.BORDER_RIGHT_STYLE);
			newNode = {
					row : startRow,
					endRow : endRow,
					col : endCol,
					endCol : endCol
			};
			bVertical = true;
			break;
		case  "top":
			widthAttr = this._getBorderAttr(attrs, styleConstant.BORDER_TOP);
			colorAttr = this._getBorderAttr(attrs, styleConstant.BORDER_TOP_COLOR);
			styleAttr = this._getBorderAttr(attrs, styleConstant.BORDER_TOP_STYLE);
			newNode = {
					row : startRow,
					endRow : startRow,
					col : startCol,
					endCol : endCol
			};
			bVertical = false;
			bTop = true;
			break;
		case  "bottom":
			widthAttr = this._getBorderAttr(attrs, styleConstant.BORDER_BOTTOM);
			colorAttr = this._getBorderAttr(attrs, styleConstant.BORDER_BOTTOM_COLOR);
			styleAttr = this._getBorderAttr(attrs, styleConstant.BORDER_BOTTOM_STYLE);
			newNode = {
					row : endRow,
					endRow : endRow,
					col : startCol,
					endCol : endCol
			};
			bVertical = false;
			break;
		}
		
		var width = this._getWidth(widthAttr.value);
		if(width != 0){
			if(!widthAttr.isDefaultValue || !colorAttr.isDefaultValue || !styleAttr.isDefaultValue){
				newNode.color = colorAttr.value;
				newNode.width = width;
				newNode.dash = this._getDashByWidth(styleAttr.value, widthAttr.value);
				newNode.dir = bVertical?'v':'h';
				nodeList = this._getPosition(newNode);
				this.merge(newNode, nodeList, bVertical, bTop);
				return true;
			}
		}
		return false;
	},
	
	_getWidth: function (value){
		if(value == "thin"){
			return 1;
		}
		if(value == "thick"){
			return 2;
		}
		return 0;
	},
	
	_getDashByWidth: function (value, width) {
		if(value == "dotted"){
			if(width == "thin"){
				return 2;
			} 
			if(width == "thick"){
				return 2;
			}
		} else if(value == "dashed"){
			if(width == "thin"){
				return 3;
			}
			if(width == "thick"){
				return 4;
			}
		}
		return 0;
	},
	
	_getPosition: function(node){
		var width = node.width,
			widths = this._root.children;
		for(var sidx = 0, sLen = widths.length; true; sidx++){
			var widthNode = widths[sidx];
			if(widthNode == null){
				widths.push(widthNode = {
					type : 'width',
					value : width,
					children : []
				});
			}
			if(width == widthNode.value){
				var color = node.color,
					colors = widthNode.children;
				for(var cidx = 0, len = colors.length; true; cidx++){
					var colorNode = colors[cidx];
					if(colorNode == null){
						colors.push(colorNode = {
								type : 'color',
								value : color,
								children : []
						});
					}
					if(color == colorNode.value){
						var dash = node.dash;
							dashes = colorNode.children;
						for(var didx = 0, dLen = dashes.length; true; didx++){
							var dashNode = dashes[didx];
							if(dashNode == null){
								dashes.push(dashNode = {
										type : 'dash',
										value : dash,
										children : []
								});
							}
							if(dash == dashNode.value){
								var dir = node.dir,
									dirs = dashNode.children;
								for(var idx = 0, len = dirs.length; true; idx++){
									var dirNode = dirs[idx];
									if(dirNode == null){
										dirs.push(dirNode = {
												type : 'dir',
												value : dir,
												children : []
										});
									}
									if(dir == dirNode.value){
										return dirNode.children;
									}
								}
							}
						}
					}
				}
			}
		}
	},
	
	merge: function(node, nodeList, bVertical, bTop, bNotPush) {
		var vtLastNode;
		if(bVertical) {
			// get the last styled node
			var vtList = this.vtNodeList[node.col];
			if(!vtList){
				vtList = [];
				this.vtNodeList[node.col] = vtList;
			}
			if(vtList.length > 0)
				vtLastNode = vtList[vtList.length - 1];
		}
		
		if(!bNotPush){
			if(bVertical){
				
				// put in the nodeList which has the same style as node
				var list = nodeList[node.col];
				if(!list){
					list = [];
					nodeList[node.col] = list;
				}
				if(this._putInOrder(vtList, node, true))
					list.push(node);
			} else {
				// put in the horizontal node list which contains all the styled node
				// so that we can fill the default border style node
				var hzList = this.hzNodeList[node.row];
				if(!hzList){
					hzList = [];
					this.hzNodeList[node.row] = hzList;
				}
				if(this._putInOrder(hzList, node, false)) {
					// push in the nodeList which has the same style as node
					var list = nodeList[node.row];
					if(!list){
						list = [];
						nodeList[node.row] = list;
					}
					this._putInOrder(list, node);
				}
				
			}
		}
		
		// fill the default border
		if (this._sheet && this._sheet.getOffGridLines()) {
			// turned off grid lines
		}
		else {
			if(bVertical){
				var startRow = this.sr;
				if(vtLastNode){
					startRow = vtLastNode.endRow;
				}
				if(startRow < node.row){
					var list = this.dfVtNodeList[node.col];
					if(!list){
						list = [];
						this.dfVtNodeList[node.col] = list;
					}
					list.push({
						row : startRow,
						endRow : node.row,
						col : node.col,
						endCol : node.col
					});
				} 
			} else{
				if(bTop){
					// move to the next row
					if(this.lastRow < node.row) {
						//only fill the default node for lastRow to last previous hidden rows
						// because all the row between lvr and node.row must be hidden, and do not need to fill any default node
						for(var i = this.lastRow; i <= (this.lvr + 1); i++) {
							this._fillDefaultNode(this.hzNodeList[i], i);
						}
					}
				}
			}
		}
		return node;
	},
	
	_putInOrder: function(list, node, bVertical) {
		var length = list.length;
		if(bVertical) {
			// they must be in order
			var lastNode = list[length - 1];
			if(lastNode && (lastNode.endRow == node.endRow) && (node.row == lastNode.row)){
				if(this._compareBorder(node, lastNode) > 0){
					lastNode.invalid = true;
					list.push(node);
					return true;
				} else
					return false;
			}
			list.push(node);
			return true;
		} else {
			var lastNode;
			for(var i = 0; i < length; i++){
				var n = list[i];
				if(node.endCol <= n.col){
					break;
				}
				lastNode = n;
			}
			if(lastNode && (lastNode.col == node.col) && (lastNode.endCol == node.endCol)){
				if(this._compareBorder(node, lastNode) > 0){
					lastNode.invalid = true;
					list.splice(i, 0, node);
					return true;
				} else
					return false;
			}
			list.splice(i, 0, node);
			return true;
		}
	},
	
	// Width > Style > Color
	_compareBorder:function(node1, node2) {
		if(node1.width ==  node2.width){
			if(node1.dash == node2.dash){
				if(node1.color != node2.color){
					var gray1 = websheet.Utils.getGrayFromRGB(node1.color);
					var gray2 = websheet.Utils.getGrayFromRGB(node2.color);
					if(gray1 < gray2)
						return 1;
				}
			} else if(node1.dash > node2.dash)
				return 1;
		}
		else if(node1.width > node2.width )
			return 1;
		return -1;
	},
	
	_fillDefaultNode: function(list, row){
		var hzList = this.dfHzNodeList[row];
		if(!hzList){
			hzList = [];
			this.dfHzNodeList[row] = hzList;
		}
		if(!list){
			hzList.push({
				row : row,
				endRow : row,
				col : this.sc,
				endCol : this.ec
			});
		} else {
			var startCol = this.sc;
			for(var i = 0; i < list.length ; i++){
				var node = list[i];
				if(node.col > startCol){
					hzList.push({
						row : node.row,
						endRow : node.endRow,
						col : startCol,
						endCol : node.col
					});
				}
				startCol = node.endCol;
			}
			if(this.ec > startCol){
				hzList.push({
					row : row,
					endRow : row,
					col : startCol,
					endCol : this.ec
				});
			}
		}
	}
});

dojo.declare("websheet.grid.RenderTree", null, {
	// Module:
	//		websheet/canvas/RenderTree
	// Description:
	//		A render tree is a tree structure that can be traversed and explained to render out the data grid.
	//		To construct a render tree, you should provide a data grid and a 'range' object which indicates the rendering area of the tree.
	
	// background color
	_bg				:		null,
	// text 
	_txt			:		null,
	// border 
	_border			:		null,
	// co-editing highlight
	_indicator		:		null,
	
	// start row, end row, start column, end column,
	// they are 1-based, just the same as model iterator requires.
	_sr				:		null,
	_er				:		null,
	_sc				:		null,
	_lc				:		null,
	
	_range			:		null,
	_grid			:		null,
	_cfRanges		: 		null,
	
	// cached direction map, key : cell raw value, direction 'rtr' 'ltr'
	_directionMap	:		null,
	
	Style: websheet.Constant.Style,
	
	constructor: function () {
		this._bg = new websheet.grid._BackgroundTree();
		this._txt = new websheet.grid._TextTree();
		this._border = new websheet.grid._BorderTree();
		this._indicator = new websheet.grid._UserIndicatorTree();
		this._directionMap = {};
	},
	
	build: function () {
//		console.time("Render tree build");
		var 
			range = this._range,
			startRow = range.startRow,
			endRow = range.endRow,
			startCol = range.startCol,
			endCol = range.endCol,
			model_iter = new websheet.model.RangeIterator(range, websheet.Constant.RangeIterType.EXTENDRENDER, false, {cfRanges: this._cfRanges}),
			grid = this._grid,
			editor = grid.editor,
			freezeCol = grid.freezeCol,
			firstVisibleCol = grid.scroller.firstVisibleCol,
			lastVisibleCol = grid.scroller.lastVisibleCol,
			gem = grid.geometry,
			self = this,
			text = this._txt,
			background = this._bg,
			border = this._border,
			indicator = this._indicator,
			row = null,
			col = null,
			defaultStyle = websheet.style.DefaultStyleCode,
			styleManager = editor.getDocumentObj()._styleManager,
			engine = websheet.grid.LayoutEngine.getInstance(),
			styleConstant = this.Style,
			defaultBgColor = defaultStyle.getAttr(styleConstant.BACKGROUND_COLOR),
			currentRow = null,
			lvr = startRow - 1,// last visible row when iterate
			currentCol = null,
			lvc = startCol - 1,// last visible col when iterate
			rowModel = null,
			lastNode = null,
			inCoediting = editor.scene.isDocViewMode(true) ? false : (!editor.scene.session.isSingleMode() && editor.hasColorShading),
			a11yEnabled = grid.a11yEnabled(),
			helper = websheet.Helper,
			usFormulaCode = websheet.Constant.ErrorType.UNSUPPORTFORMULA,
			cellInfoMap = grid._cellInfoMap,
			infoKey,
			cellInfo,
			masterCell,
			insertedMaster = {}
			;
		engine.setBreakCondition(gem.getGridHeight(true))
		background.setDefaultStyle(defaultBgColor);
		border.setDefaultStyle(defaultStyle);
		
		model_iter.iterate(function (obj, row, col) {
			var 
				styleCell,
				valueCell,
				coverCell,
				colSpan = 1,
				rowSpan = 1,
				cellStyle = defaultStyle,
				fontStyle = cellStyle.getFontStyle(),
				ltr = true,
				align,
				indent,
				wrap,
				isString,
				bgColor,
				color,
				paddingSize = 2,
				rawValue,
				show,
				values,
				beyondVisualRange = (col > endCol || col < startCol || row < startRow || row > endRow),
				lines,
				lineHeight,
				contentHeight,
				widths,
				result,
				direction,
				styleId,
				cfStyleId,
				format,
				wrapInfo,
				unsupported,
				overflow = false,
				generalFormatedNum = false,
				checkMasterCell = false,
				masterKey,
				userId,
				covered,
				invalidDateTime = false,
				hasRepeatChar = false
				;
			if (currentRow == null || row != currentRow + 1) {
				//last visible row might not adjacent with row( means lvr != row - 1), because there might be hidden rows
				if (currentRow != null) {
					lvr = currentRow + 1;
				}
				// iterate to a new row.
				currentRow = row - 1;
				lastNode = null;
			}
			if (col != currentCol) {
				if( currentCol != null ) lvc = currentCol;
				currentCol = col;
			}
			if (obj != null) {
				// Collect cell information & store them to data grid, we directly access the store map for performance;
				// About the key, check 'insertCellInfo' in GridStage for more details;
				infoKey = currentRow + "_" + col;
				if (!obj.isBlank && !(cellInfo = cellInfoMap[infoKey])) {
					cellInfo = cellInfoMap[infoKey] = {};
				}
				
				cfStyleId = obj.cfStyleId;
				if (covered = obj.isCovered) {
					masterCell = obj.masterCell;
					valueCell = masterCell.cell;
					if (editor.getDocumentObj().enableFormula) {
						styleCell = masterCell.styleCell;
					} else {
						styleCell = obj.styleCell ? obj.styleCell : masterCell.styleCell;
					}
					coverCell = obj.coverInfo;
					colSpan = coverCell._colSpan;
					rowSpan = coverCell._rowSpan;
					styleId = styleCell ? styleCell._styleId : masterCell.columnStyleId;
					if (masterCell) {
						if (masterCell.cell && masterCell.cell.cfStyleId) {
							styleId = masterCell.cell.cfStyleId;
						}							
						masterKey = (masterCell.masterRow - 1) + "_" + masterCell.masterCol;
						if (checkMasterCell = !insertedMaster[masterKey]) {
							insertedMaster[masterKey] = true;
							cellInfoMap[masterKey] = {
									merge : {
										colSpan : colSpan,
										rowSpan : rowSpan,
										masterCol : masterCell.masterCol,
										masterRow : masterCell.masterRow - 1,
										isCovered : false
									}
							};
						}
						cellInfo.merge = {
								colSpan : colSpan,
								rowSpan : rowSpan,
								masterCol : masterCell.masterCol,
								masterRow : masterCell.masterRow - 1,
								isCovered : true
						};
					}
				} else if (!obj.isBlank){
					styleCell = obj.styleCell;
					valueCell = obj.cell;
					coverCell = obj.coverInfo;
					styleId = styleCell ? styleCell._styleId : obj.columnStyleId;
					if (coverCell) {
						colSpan = coverCell._colSpan;
						rowSpan = coverCell._rowSpan;
						cellInfo.merge = {
								colSpan : colSpan,
								rowSpan : rowSpan,
								masterCol : col,
								masterRow : currentRow,
								isCovered : false
						};
						insertedMaster[(row - 1)+ "_" + col] = true;
					}
				}
			}
			var forceStyleFmt = false;
			if(cfStyleId) {
				styleId = cfStyleId;
				forceStyleFmt = true;
			}
			if (styleId) {
				cellStyle = styleManager.styleMap[styleId]; // getStyleById()
				if (!cellStyle) {
					cellStyle = defaultStyle;
				}
				fontStyle = cellStyle.getFontStyle();
				bgColor = cellStyle._attributes[styleConstant.BACKGROUND_COLOR];
			}
			// co-editing highlight;
			if (valueCell) {
				userId = valueCell.getUser();
				if (userId) {
					indicator.insert({
						user : userId,
						row : currentRow + 1,
						col : col
					});
				}
			}
			// border and background color;
			if (!beyondVisualRange) {
				background.insert({
					color : bgColor,
					row : currentRow + 1,
					col : col,
					endCol : col
				});
				var borderNode = {
						cellStyle : cellStyle,
						row : row,
						col : col,
						top : (covered ? (row > masterCell.masterRow && masterCell.masterRow <= lvr) : false),// masterCell.masterRow > lvr means masterRow is in the hidden rows, then  the next first visible row should has top border
						right : (covered ? (col < masterCell.masterCol + colSpan - 1) : (colSpan > 1)),
						bottom : (covered ? (row < masterCell.masterRow + rowSpan - 1) : (rowSpan > 1)),
						left : (covered ? (col > masterCell.masterCol && masterCell.masterCol <= lvc) : false)
					};
				// if top merge border is true, and the master cell covers some invisible rows
				// we should also insert the border with width = -1 for invisible rows
				border.lvr = lvr;
				border.lvc = lvc;
				border.insert(borderNode);
			}
			// if it's a covered cell and "checkMasterCell" is false, can directly terminate this iteration since the master cell has already been dealed with;
			if (covered) {
				if (lastNode && !lastNode.isCovered) {
					// text should not over flow to merged area;
					lastNode.rgp = masterCell.masterCol - lastNode.col - 1;
				}
				// give en empty lastNode with 'col' attribute to calculate the lgp for next value cell;
				lastNode = {col : col, isCovered : true};
				if (!checkMasterCell) {
					return true;
				} else {
					show = (valueCell ? (valueCell.getShowValue(styleId, forceStyleFmt)) : "");
					if (show === "" || show == null) {
						// empty value, no text content;
						return true;
					} else {
						show = show + "";
					}
				}
			} else {
				// text contents;
				// first got show value;
				show = valueCell ? (valueCell.getShowValue(styleId, forceStyleFmt)) : "";
				if (coverCell) {
					if (lastNode && !lastNode.isCovered) {
						 // text should not over flow to merged area;
						 lastNode.rgp = col - lastNode.col - 1;
					 }
					lastNode = {col : col};
				} else {
					if (show && lastNode) {
						lastNode.rgp = col - lastNode.col - 1;
					} else {
						// in this case, lastNode should be null;
					}
				}
				if (show === "" || show == null) {
					// empty value, no text content;
					return true;
				} else if (show == websheet.Constant.ERRORCODE["1004"]){
					show = "";
					invalidDateTime = true;
				} else {
					show = show + "";
				}
			}
			// go further to get direction & align;
			// we need to decide the text align here based on cell contents.
			isString = valueCell && (valueCell.isString() || valueCell.isUnknown());
			if (cellStyle._attributes[styleConstant.FORMATTYPE] == 'text') {
				isString = true;
			}
			if (isString) {
				overflow = true;
				direction = cellStyle._attributes[styleConstant.DIRECTION];
				if (!direction) {
					rawValue = valueCell._rawValue || "";
					if (BidiUtils.isBidiOn()) {
						direction = BidiUtils.isTextRtl(rawValue) ? "rtl" : "ltr";
					} else {
						direction = (self._directionMap[rawValue] || (self._directionMap[rawValue] = BidiUtils.isTextRtl(rawValue))) ? "rtl" : "ltr";
					}
				}
			} else if (valueCell.isNumber() && helper.getFormat(cellStyle) == null){
				/*overflow is false;*/
				generalFormatedNum = true;
			}
			align = cellStyle._attributes[styleConstant.TEXT_ALIGN];
			if (align == null || align.length == 0) {
				if (valueCell && (valueCell.isError() || valueCell.isBoolean())) {
        			// error and boolean cells center align
        			align = 'center';
        		} else {
        			// regular string
        			if (isString && direction != 'rtl') {
        				align = 'left';
    				} else {
    					align = 'right';
    				}
        		}
			}
			// The cell cannot be overflow to visible area in these cases;
			if (col > endCol && align == 'left') {
				return true;
			}
			if (col + colSpan - 1 < startCol && align == 'right') {
				return true;
			}
			wrap = fontStyle.wrap;
			indent = fontStyle.indent || 0;
			// Numbers (formulas with errors) never wrap; They should be rounded or kept as it is, or just replaced with "####";
			if (wrap && (valueCell.isNumber() || valueCell.isBoolean() || (valueCell.isFormula() && valueCell.isError()))) {
				wrap = false;
			}
			if (wrap) {
				width = checkMasterCell ? gem.colWidth(masterCell.masterCol, masterCell.masterCol + colSpan - 1) : gem.colWidth(col, col + colSpan - 1);
				if (indent > 0) {
					width -= indent;
				}
				wrapInfo = grid.cellWrapInfo(row - 1, col);
				if (wrapInfo && wrapInfo.onWidth == width) {
					lines = wrapInfo.lines;
					widths = wrapInfo.widths;
				} else {
					// this should not happen
					// console.warn("You'd check this, why the wrap info is not avaliable when render tree construction ?");
					// no that does happen...
					// what if we enlarge the column width of the cell while keep the row un-changed ?
					// geometry will not be triggered since the row has not been modified, but the wrap info need to be updated with the new column width,
					// so re-calculate it here;
					lines = [];
					widths = [];
					values = show.split("\n");
					engine.state(fontStyle.fontString);
					
					for (var idx = 0, len = values.length, line; idx < len; idx++) {
						line = values[idx];
						if (line != '') {
							result = engine.fragmentText(line, width);
							lines = lines.concat(result.lines);
							widths = widths.concat(result.widths);
						} else {
							lines.push(line);
							widths.push(0);
						}
					}
					if (!valueCell.isUnknown()) {
						grid.insertCellInfo(covered ? masterCell.masterRow - 1 : row - 1, col, 'wrap', {
							lines : lines,
							widths: widths,
							onWidth: width
						});
					}
					
				}
				lineHeight = (fontStyle.size + 2);
				contentHeight = lineHeight * lines.length;
			} else {
				show = show.replace(/\n/gm, "");
				contentHeight = lineHeight = (fontStyle.size + 2);
			}
			color = cellStyle._attributes[styleConstant.COLOR] || "#000";
			if (!valueCell._error) {
				if ((format = helper.getFormat(cellStyle))) {
					color = websheet.Utils.getFormatColor(valueCell.getCalculatedValue(), 
								format[styleConstant.FORMAT_FONTCOLOR] || defaultStyle._attributes[styleConstant.FORMAT_FONTCOLOR],
								format[styleConstant.FORMATCODE] || defaultStyle._attributes[styleConstant.FORMATCODE], 
								isString, 
								valueCell.getType()) || color;
					if (valueCell.isNumber() && format[styleConstant.FORMATCODE] && format[styleConstant.FORMATCODE].indexOf("* ") != -1) {
						hasRepeatChar = true;
					}
				}
			} else if (valueCell._error.errorType == usFormulaCode) {
				unsupported = true;
			}
			if (!beyondVisualRange || ( /*invisible cells but may overflow to visible area*/(!wrap) || /*master cell invisible but spans to current visible area;*/(coverCell && !covered))) {
				// some cells within invisible area need to be rendered in case there're text overflow
				text.insert(lastNode = {
						lgp : lastNode ? lastNode.rgp : null,
						rgp : null,
						lineHeight : lineHeight,
						contentHeight: contentHeight,
						align : align,
						direction : direction,
						indent : indent,
						colSpan : colSpan || 1,
						rowSpan : rowSpan || 1,
						font : fontStyle.fontString,
						color : color,
						valign : cellStyle._attributes[styleConstant.VERTICAL_ALIGN] || defaultStyle._attributes[styleConstant.VERTICAL_ALIGN],
						value : lines || show,
						widths: widths,
						wrap : wrap,
						row	: checkMasterCell ? masterCell.masterRow : currentRow + 1,
						col : checkMasterCell ? masterCell.masterCol : col,
						underline: cellStyle._attributes[styleConstant.UNDERLINE],
						unsupported: unsupported,
						strikethrough: cellStyle._attributes[styleConstant.STRIKETHROUGH],
						beyondVisualRange: beyondVisualRange || checkMasterCell && (masterCell.masterCol < startCol || masterCell.masterRow < startRow),
						needOverflow : overflow,
						needRounding : !overflow && generalFormatedNum,
						link: valueCell.hasLink(),
						invalidDateTime: invalidDateTime,
						hasRepeatChar: hasRepeatChar
				});
				// and if the cell contains hyper link?
				cellInfo.link = valueCell.hasLink();
				if (a11yEnabled) {
					// Only the screen reader needs to know these;
					// currently we only cares it's empty or not
					cellInfo.value = show;
					// and if it contains formula ?
					cellInfo.formula = valueCell.isFormula();
					// and if it have been modified by others?
					cellInfo.coediting = userId;
				}
				// is it an unsupported formula cell? we need to popup tool tip to tell user this when mouse over;
				if (unsupported) {
					cellInfo.unsupported = lastNode.value;
				}
			}
			return true;
		});
		background.setEndRow(this._er);
		border.setEndRow(this._er);
//		console.timeEnd("Render tree build");
		return this;
	},
	
	background: function () {
		return this._bg;
	},
	
	border: function () {
		return this._border;
	},
	
	userIndicator: function () {
		return this._indicator;
	},
	
	text: function () {
		return this._txt;
	},

	range: function () {
		return {startRow: this._sr, endRow: this._er, startCol: this._sc, endCol: this._ec};
	},
	
	cfRanges: function() {
		var ranges = this._grid.editor.getDocumentObj().getAreaManager().getRangesByUsage(websheet.Constant.RangeUsage.CONDITION_FORMAT);
		var displayRange = this._range;
		return (ranges == null || ranges == undefined) ? [] : ranges.filter(function(elem){
			var ret = websheet.Helper.compareRange(displayRange, elem._getRangeInfo());
			if(ret != websheet.Constant.RangeRelation.NOINTERSECTION && ret != -1) {
				return true;
			}
			else {
				return false;
			}
		});
	},
	
	reset: function () {
		// summary:
		//		Re-set the indicator tree;
		this._indicator.invalidate();
	},
	
	start: function (grid, range) {
		// summary:
		//		Re-set the render tree to get a new one.
		this._grid = grid;
		this._range = range;
		this._sr = range.startRow;
		this._er = range.endRow;
		this._sc = range.startCol;
		this._ec = range.endCol;
		this._bg.invalidate();
		this._txt.invalidate();
		this._border.invalidate();
//		this._indicator.invalidate();
		//leave the indicator reset to "reset" method, and call it each time we prepare a frame rendering;
		this._bg.setRange(this._range);		
		var sheet = grid.editor.getDocumentObj().getSheet(grid.sheetName);
		this._border.setSheet(sheet);
		this._border.setRange(this._range);
		this._cfRanges = this.cfRanges();
		return this;
	}
});