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
dojo.provide("websheet.grid.GridRender");
// Module:
//		websheet/canvas/GridRender
// Description:
//		Canvas layer rendering methods collection, it is designed as a singleton, get a instance with 'getRenderer'
//		Initial the state with 'prepare' method, pass the right grid to renderer when 'prepare'.
//		Then you're suppose to call 'buildRenderTree', it is a mandatory step before you call 'renderContent'.
//		A common render routine is :
//		==>	renderer = websheet.grid.GridRender.getRenderer();	
//		==>	renderer.prepare(grid);	
//		==> renderer.buildRenderTree(visionRange);
//		==> renderer.renderContent();	// content render based on render tree
//		==> renderer.renderSheetHeader();// you may not need to render the sheet header each time
//		==> renderer.renderHeader();	// render the column/row headers
//		==> renderer.renderWidgets();	// render widgets at last, this is where to render the selection highlight, coediting highlight, and some other thing.

websheet.grid.GridRender = (function () {
	var instance;
	var initialize = function () {
		var 
			grid,													//render grid
			geometry,												//grid geometry
			canvas,													//canvas node
			ctx,													//rendering context
			engine = websheet.grid.LayoutEngine.getInstance(),		//LayoutEngine will be used to round numbers;
			widget_ctx,
			GRID_LINE_COLOR = 'rgb(210, 210, 210)',					//grid line color
			GRID_LINE_COLOR_HC = 'rgb(255, 255, 255)',				//grid line color in high-contrast mode (high-contrast mode 1 which is yellow on black);
			GRID_HEADER_LINECOLOR = 'rgb(169, 169, 169)',			//header cell border
			GRID_HEADER_LINECOLOR_HC = 'rbg(255, 245, 0)',			//header cell border in high-contrast
			GRID_LINE_WIDTH = 1,									//grid line width
			GRID_HEADER_BGCOLOR = 'rgb(238, 238, 238)',				//grid header background color
			SHEET_HEADER_BGCOLOR = 'rgb(232, 225, 207)',			//sheet header background color
			GRID_HEADER_HIGHLIGHT = 'rgb(12, 12, 12)',				//sheet header highlight background color (selected headers will be 'highlighted')
			GRID_HEADER_HIGHLIGHT_HC = 'rgb(00, 251, 00)',			//sheet header highlight BG, in high-contrast;
			GRID_HEADER_FONTCOLOR = 'rgb(2, 2, 2)',					//header cell font color;
			GRID_HEADER_FONTCOLOR_HC = 'rgb(255, 255, 255)',		//header cell font color in high-contrast
			GRID_FREEZEBAR_COLOR = 'rgb(166, 166, 166)',
			GRID_TEXT_COLOR_HC = 'rgb(255, 255, 0)',
			GRID_BGCOLOR_HC = 'rgb(26, 26, 26)',
			GRID_HEADER_BGCOLOR_HC = GRID_BGCOLOR_HC,
			GRID_HEADER_FONT = "bold 12px Arial",
			GRID_HEADER_WIDTH = 36,
			GRID_HEADER_HEIGHT = 24,
			HEADER_BOUNDING_WIDTH = 13,
			HEADER_BOUNDING_HEIGHT = 8,
			PADDING_SIZE = 2,
			HIGH_CONTRAST_MODE = false,
			LEFT_TO_RIGHT = true,
			CUSTMIZED_DASH_LINE = false,							// If we're using our custmized dash line rendering method
			dashLength = 0,											// dashed line length value;
			debug_render = false,
			lockCellImg = new Image(),
			unsupportedImg = new Image(),
			activeCmtImg = new Image(),
			dashedContext = ctx,
			inactiveCmtImg = new Image(),
			readOnlyImg = new Image()
			;
		// load the image here when initialize;
		lockCellImg.src = window.contextPath + window.staticRootPath + "/styles/css/websheet/img/ico_coedit.gif";
		unsupportedImg.src = window.contextPath + window.staticRootPath + "/styles/css/websheet/img/ico_notice1.gif";
		activeCmtImg.src = window.contextPath + window.staticRootPath + "/styles/css/websheet/img/withComment2.gif";
		inactiveCmtImg.src = window.contextPath + window.staticRootPath + "/styles/css/websheet/img/withComment1.gif";
		readOnlyImg.src = window.contextPath + window.staticRootPath + "/styles/css/websheet/img/readonly_bg2.png";
		
		// Some browsers like IE9 does not directly support dash line, add our own dash line method here;
		var detectDashLineSupport = function () {
			if (ctx) {
				if (ctx.setLineDash) {
					// use the default setLineDash provided by the browser;
					return !(CUSTMIZED_DASH_LINE = false);
				} else if (CanvasRenderingContext2D && dashedContext) {
					CUSTMIZED_DASH_LINE = true;
					var prototypeMoveTo = CanvasRenderingContext2D.prototype.moveTo;
					// customized location store to record the 'ctx.moveTo' position
					CanvasRenderingContext2D.prototype._lastMoveToPosition = {};
					CanvasRenderingContext2D.prototype.moveTo = function (x, y) {
						prototypeMoveTo.apply(dashedContext, [x, y]);
						this._lastMoveToPosition.x = x;
						this._lastMoveToPosition.y = y;
					};
					// Add our own "dashedLineTo", similar with "lineTo" but it will be used to render dashed line;
					CanvasRenderingContext2D.prototype.dashedLineTo = function (x, y, dash_length) {
						dash_length = (dash_length === undefined) ? 5 : dash_length;
						if (dash_length <= 0) {
							dash_length = 1;
						}
						var 
							startX = this._lastMoveToPosition.x,
							startY = this._lastMoveToPosition.y,
							deltaX = x - startX,
							deltaY = y - startY,
							count = Math.floor(Math.sqrt(deltaX * deltaX + deltaY * deltaY) / dash_length);
						for (var i = 0; i < count; i++) {
							this[ (i % 2 === 0) ? 'moveTo' : 'lineTo'] (startX + (deltaX/count) * i, startY + (deltaY/count) * i);
						}
						this.moveTo(x, y);
					};
				}
			}
		};
		
		var detectHighContrastMode = function () {
			if (require && require.has) {
				if (require.has("highcontrast")) {
					HIGH_CONTRAST_MODE = true;
				}
			} else if (dojo.hasClass(dojo.body(), "dijit_a11y")){
				HIGH_CONTRAST_MODE = true;
			} else {
				HIGH_CONTRAST_MODE = false;
			}
		};
		
		var fillTextBidi = function (line, cellLeft, linetop, cellWidth, align) {
			ctx.save();
			ctx.scale(-1,1);
			if (align == 'right') {
				ctx.translate(-2*cellLeft, 0);
				cellLeft -= PADDING_SIZE;
			} else if (align == 'left')
				ctx.translate(-2*cellLeft - cellWidth, 0);
			else if (align == 'center')
				ctx.translate(-2*cellLeft - cellWidth/2,0);

			ctx.fillText(line, cellLeft, linetop);
			ctx.restore();
		};
		
		var renderTree = new websheet.grid.RenderTree();
		
		var borderRender = function (tree) {
			var	borderWidth,
				pixelOffset = 0.5,
				dir,
				lineRowStart, 
				lineRowEnd, 
				lineColStart, 
				lineColEnd,
				_lrs,	// last row start;
				_lre,	// last row end;
				_lrv;	// last row value;
			var traverse = function (node) {
				var 
					type = node.type,
					value = node.value,
					children = node.children;
				if (type == "width") {
					borderWidth = value;
					if(borderWidth < 0){
						// ignore the negative width border
						children = [];
					} else if(borderWidth == 0)
						ctx.lineWidth = GRID_LINE_WIDTH;
					else
						ctx.lineWidth = value;
					
					if(ctx.lineWidth%2 == 0){
						pixelOffset = 0;
					} else {
						pixelOffset = 0.5;
					}
				} else if (type == "color") {
					if (HIGH_CONTRAST_MODE) {
						ctx.strokeStyle = GRID_LINE_COLOR_HC;
					} else {
						if (borderWidth == 0) {
							ctx.strokeStyle = GRID_LINE_COLOR;
						}
						else {
							ctx.strokeStyle = value;
						}
					}
				} else if (type == "dash") {
					if (CUSTMIZED_DASH_LINE) {
						dashLength = value;
					} else if (ctx.setLineDash) { 
						if (value == 0) {
							ctx.setLineDash([]);
						} else {
							ctx.setLineDash([value]);
						}
					}
				} else if (type == "dir") {
					ctx.beginPath();
					dir = value;
					for (var line in children){
						var child = children[line];
						var lastNode = null;
						for(var i in child){
							if(!child[i].invalid){
								traverse((lastNode = child[i]));
							}
						}
						// draw the last border of the current line
						lastNode && traverse(lastNode);
						lineRowStart = lineRowEnd = lineColStart = lineColEnd = null;
					}
					ctx.stroke();
					children = null;
				} else if (type != "root") {
						var 
							row = node.row,
							col = node.col,
							endRow = node.endRow,
							endCol = node.endCol,
							lineWidth,
							lineHeight,
							cellPosition, cellLeft, cellTop
							;
						if(dir == "h"){
							if(col != endCol) {
								if(lineRowStart == null){
									lineRowStart = lineRowEnd = row;
									lineColStart = col;
									lineColEnd = endCol;
									return;
								}else if(lineRowStart == row) {
									if(lineColEnd == col){
										lineColEnd = endCol;
										return;
									}
								} 
							}
							if(lineColStart != null && lineColStart < lineColEnd)
								lineWidth = geometry.colWidth(lineColStart, lineColEnd - 1);
							else
								lineWidth = 0;
							lineHeight = 0;
						} else if(dir == "v") { 
							if (row != endRow) {// row == endRow for vertical line means this node is cut to a dot, which should not be a border
								if(lineColStart == null) {
									lineColStart = lineColEnd = col;
									lineRowStart = row;
									lineRowEnd = endRow;
									return;
								} else if(lineColStart == col) {
									if(lineRowEnd == row){
										lineRowEnd = endRow;
										return;
									}
								}
							}
							lineWidth = 0;
							if (lineRowStart != null && lineRowStart < lineRowEnd) {
								if (lineRowStart == _lrs && lineRowEnd == _lre) {
									lineHeight = _lrv;
								} else {
									_lrv = lineHeight = geometry.rowHeight(lineRowStart - 1, lineRowEnd - 2);
									_lrs = lineRowStart;
									_lre = lineRowEnd;
								}
							} else {
								lineHeight = 0;
							}
						}
						cellPosition = geometry.getCellPosition(lineRowStart - 1, lineColStart);
						cellLeft = cellPosition.l + pixelOffset,
						cellTop = cellPosition.t + pixelOffset;
						
						ctx.moveTo(cellLeft, cellTop);
						if (dashLength > 0 && CUSTMIZED_DASH_LINE) {
							ctx.dashedLineTo(cellLeft + lineWidth, cellTop + lineHeight, dashLength);
						} else {
							ctx.lineTo(cellLeft + lineWidth, cellTop + lineHeight);
						}
						
						lineRowStart = row;
						lineRowEnd = endRow;
						lineColStart = col;
						lineColEnd = endCol;
				}
				if (children) {
					for (var idx = 0, len = children.length; idx < len; idx++) {
						traverse(children[idx]);
					}
				}
			};
			ctx.save();
			traverse(tree.root());
			ctx.restore();
		};
		var textRender = function (tree) {
			// text overflow may cut through the borders, we will measure the content width when traverse and call 'cut' of the border tree to make 
			// the adjustment.
			var 
				border = renderTree.border(),
				renderRange = renderTree.range(),
				firstVisibleRow = grid.scroller.firstVisibleRow,
				firstVisibleCol = grid.scroller.firstVisibleCol,
				lastVisibleCol = grid.scroller.lastVisibleCol
				;
			var traverse = function (node) {
				var 
					type = node.type,
					value = node.value,
					children = node.children;
				if (type == "font") {
					ctx.font = value;
				} else if (type == "fontColor") {
					if (HIGH_CONTRAST_MODE) {
						ctx.fillStyle = GRID_TEXT_COLOR_HC;
						ctx.strokeStyle = GRID_TEXT_COLOR_HC;
					} else {
						ctx.fillStyle = value;
						ctx.strokeStyle = value;
					}
				} else if (type != "root") {
					var 
						wrap = node.wrap,		//	wrap or not
						lgp = node.lgp,			//	left gap to previous value cell
						rgp = node.rgp,			//	right gap to next value cell
						row = node.row - 1,		//	row index of current cell, 0-based
						col = node.col,			//	column index of current cell
						overflow = node.needOverflow, //  if we need to overflow the text
						beyondVisualRange = node.beyondVisualRange, //	cell node in invisible column area, but may overflow to current visible areas.
						align = dojo.trim(node.align || ""),		//	align
						direction = node.direction,	//	text direction
						valign = dojo.trim(node.valign || ""),	//	vertical align
						indent = node.indent, // text indent;
						padding = PADDING_SIZE, // the default padding size (left, right, top)
						lineHeight = node.lineHeight,	// font size + padding size
						underline = node.underline,		// under line style
						strikethrough = node.strikethrough, // strike through style
						contentHeight = node.contentHeight,	// lineHeight * lines,
						cspan = node.colSpan,	// column span
						rspan = node.rowSpan || 1,	// row span
						excol = col + cspan - 1,	// extended column
						exrow = row + rspan - 1,	// extended row
						boxHeight = geometry.rowHeight(row, exrow),	// boxHeight means the actual rendering box of the text content, the area may be larger than current cell 
						boxWidth,		//depends on cell lgp, rgp, align & direction , merged or not
						contentWidth,	//contentWidth means the string measured width for non-wrapped cells
						cellWidth = geometry.colWidth(col, excol),	// cellWidth, current column and column span
						cellPos,	// cell position
						cellLeft,	// cell left position 
						cellTop,	// cell top position
						clipTop,	//mainly for merged cell;
						clipLeft,	//mainly for merged cell;
						clipWidth,	//mainly for merged cell;
						clipHeight,	//mainly for merged cell;
						linetop,	// top position of current line
						lines,		// lines,
						clipped = false,	// If we have a clip requirement.
						contentStartCol = col,	// text content spans (if not clipped) from 'contentStartCol' to 'contentEndCol', they depends on the content length and font.
						contentEndCol = col,
						decorationTop,	// the top coordinates of the text decoration line (strikethrough or underlinke)
						invisibleColWidth = 0, // width of the invisible parts for a merge cell;
						invisibleRowHeight = 0,// height of the inivisible parts for a merge cell;
						textMetrics
						;
					
					// Some kind of alignment currently we can not support;
					if (align != 'left' && align != 'right' && align != 'center') {
						if (debug_render) {
							console.info("Modify text alignment: '", align, "'.");
						}
						if (node.direction != 'rtl') {
							align = 'left';
						} else {
							align = 'right';
						}
					}
					if (valign != 'top' && valign != 'bottom' && valign != 'middle') {
						// Some values currently not supported, like 'automatic' from AOO;
						if (debug_render) {
							console.info("Modify text vertical alignment from '", align, "' to middle.");
						}
						if (valign == 'automatic') {
							valign = 'bottom';
						} else {
							valign = 'top';
						}
					}
					if (!wrap) {
						// for wrapped cells, need to read contentWidth from widths array in the actually render loop;
						if (node.invalidDateTime) {
							boxWidth = geometry.colWidth(col, excol);
						} else {
							textMetrics = ctx.measureText(node.value);
							contentWidth = textMetrics.width;
						}
					}
					// If it's a normal text rendering, we can get the cell position from GridGeometry.
					// For those beyondVisualRange cells (which means the cell is not in vision area, but may overflow to current vision area), we can not get cell position directly.
					// We will check the align of the 'over step cell' latter, maybe we do not need to render it. 
					// If we do need to render the 'over step cell', it will not be too late to calculate it then.
					if (!beyondVisualRange) {
						cellPos = geometry.getCellPosition(row, col);
						cellTop = cellPos.t;
						cellLeft = cellPos.l;
					}
					// We use different align context to render different align text content, maybe we can use 'left' align to render all kinds of text alignment 
					// (it should be faster, but also complex).
					ctx.textAlign = align;
					ctx.save();
					// close the path, we may need to clip a new rectangle later when render.
					ctx.beginPath();
					// 1. First we need to check if we need to clip a rectangle to render the text contents.
					// Some rules:
					// 		If the cell is a merge cell, clip the merged area to render the content.
					//		We do not need to clip a wrapped cell, the contents should have already been arranged to precisely located in current cell box.
					// 2. We need to check if the contents in current cell overlap the freeze line, in this case we have to render the cell contents twice in 
					// different views and different positions to make it properly rendered.
					// Example:
					//		This is a very long string  a|nd it should be rendered twice in different positions.
					//									 |
					//								("|" is freeze line)
					//		=> the first step
					//				This is a very long string a| (clipped)
					//		=> the second step
					//				(clipped)					|nd it should be rendered twice in different positions.
					//		=> if the view has been scrolled, the rendering position of the second step also change with the scroll
					//				(clipped)					|should be rendered twice in different positions.
					if (cspan > 1 || rspan > 1) {
						clipWidth = cellWidth;
						clipHeight = boxHeight;
						if (beyondVisualRange) {
							// master cell not visible, but overflow to current visible area;
							if (debug_render) {
								if (col > renderRange.endCol) {
									throw "Unexpected merge cells!";
								}
							}
							// the cell left need to be adjusted.
							cellPos = geometry.getCellPosition(row, col);
							clipTop = cellTop = cellPos.t;
							clipLeft = cellLeft = cellPos.l;
							// See if we need to clip in this case;
							if (row < firstVisibleRow && row >= grid.freezeRow) {
								// the master row is not visible;
								invisibleRowHeight = geometry.preciseRowHeight(row, firstVisibleRow - 1);
								cellTop -= invisibleRowHeight;
								clipHeight -= invisibleRowHeight;
							} else if (row < grid.freezeRow && exrow >= grid.freezeRow){
								// the master row is visible, but there're folded rows;
								clipTop = geometry.getFreezeHeight() + GRID_HEADER_HEIGHT;
								clipHeight = geometry.quickRowHeight(firstVisibleRow, exrow);
								if (firstVisibleRow > grid.freezeRow) {
									cellTop -= geometry.preciseRowHeight(grid.freezeRow, firstVisibleRow - 1);
								}
							}
							if (col < firstVisibleCol && col > grid.freezeCol) {
								// the master col is not visible;
								invisibleColWidth = geometry.colWidth(col, firstVisibleCol - 1);
								cellLeft -= invisibleColWidth;
								clipWidth -= invisibleColWidth;
							} else if (col <= grid.freezeCol && excol > grid.freezeCol){
								// the master column is visible, but there're folded columns;
								clipLeft += (geometry.colWidth(col, grid.freezeCol) + geometry.freezeBarSize);
								clipWidth = geometry.colWidth(firstVisibleCol, excol);
							}
						} else {
							clipTop = cellTop;
							clipLeft = cellLeft;
							// clip text box on merge cells, the master cell is in visible area;
							// if the cell extends over the freeze line, clip at the freeze boundary;
							if (col <= grid.freezeCol && excol > grid.freezeCol) {
								clipWidth = geometry.colWidth(col, grid.freezeCol);
							}
							if (row < grid.freezeRow && exrow >= grid.freezeRow && grid.freezeRow > 0) {
								clipHeight = geometry.quickRowHeight(row, grid.freezeRow - 1);
							}
						}
						ctx.rect(clipLeft, clipTop, clipWidth, clipHeight);
						ctx.clip();
						clipped = true;
					} else if (!wrap) {
						// we do not need to clip 'wrapped cells', see if we need to clip on non-wrap cells
						if (overflow) {
							if (((align == 'left' && !grid.isMirrored) || (align == 'right' && grid.isMirrored))
								&& LEFT_TO_RIGHT) {
								// measure the start column and the end column of this content
								contentStartCol = col; // start col is the cell column for a left align cell.
								contentEndCol = _columnOnWidth(col, contentWidth + indent);
								// overflow check.
								if (beyondVisualRange) {
									if (contentEndCol < renderRange.startCol) {
										// we do not need to render the cell, it is totally invisible.
										return;
									}
									if (rgp != null && contentStartCol + rgp < renderRange.startCol) {
										// do not need to render the cell, it's overflow but clipped by the cell in render range's start column.
										return;
									}
									// render out, the cell left need to be adjusted.
									cellPos = geometry.getCellPosition(row, col);
									cellTop = cellPos.t;
									cellLeft = cellPos.l;
								}
								if (rgp == null) {
									// no content clip, but may be clipped by the freeze edge, check later
									border.cut(row, col, contentEndCol);
								} else {
									border.cut(row, col, Math.min(contentEndCol, col + rgp));
								}
								// check if we need to clip.
								if (renderRange.startCol <= grid.freezeCol) {
									// currently we are render the left freeze view
									if (contentEndCol > grid.freezeCol && (rgp == null || col + rgp > grid.freezeCol)) {
										// step over the freeze line.
										if (grid.isMirrored && (col > grid.freezeCol)) {
											//skip
										} else {
											ctx.rect(cellLeft, cellTop, geometry.colWidth(col, grid.freezeCol), boxHeight);
										}
										ctx.clip();
										clipped = true;
									}
									if (rgp != null && col + rgp < contentEndCol) {
										ctx.rect(cellLeft, cellTop, geometry.colWidth(col, col + rgp), boxHeight);
										ctx.clip();
										clipped = true;
									}
								} else /*if (renderRange.startCol > grid.freezeCol)*/ {
									// currently we are render the right scrollable view
									if (beyondVisualRange) {
										if (grid.freezeCol == 0) {
											// Can clip, but seems not necessary.
											// nope, it's only not necessary on the left edge, but we still need to clip if the col + rgp < contentEndCol;
											// if the rgp == null, we do not need to clip the cell;
											if (rgp != null && col + rgp < contentEndCol) {
												ctx.rect(GRID_HEADER_WIDTH + geometry.getFreezeWidth(), cellTop, geometry.colWidth(firstVisibleCol, col + rgp), boxHeight);
												ctx.clip();
												clipped = true;
											}
										} else {
											// Clip the scrollable area, left edge is the freeze edge, need to decide the clip box width
											if (rgp == null) {
												ctx.rect(GRID_HEADER_WIDTH + geometry.getFreezeWidth(), cellTop, geometry.getScrollableWidth(), boxHeight);
											} else {
												ctx.rect(GRID_HEADER_WIDTH + geometry.getFreezeWidth(), cellTop, geometry.colWidth(firstVisibleCol, col + rgp), boxHeight);
											}
											ctx.clip();
											clipped = true;
										}
										if (firstVisibleCol > grid.freezeCol + 1) {
											// adjust the cell left now, later it will be used to fill text
											if (col <= grid.freezeCol) {
												cellLeft -= geometry.colWidth(grid.freezeCol + 1, firstVisibleCol - 1);
											} else {
												cellLeft -= geometry.colWidth(col, firstVisibleCol - 1);
											}
										}
									} else {
										if (rgp != null && col + rgp < contentEndCol) {
											ctx.rect(cellLeft, cellTop, geometry.colWidth(col, col + rgp), boxHeight);
											ctx.clip();
											clipped = true;
										}
									}
								}
								if (!clipped) {
									// check if we have height clip requirement.
									if (contentHeight > boxHeight) {
										// give a big boxWidh  and clip on box height
										ctx.rect(cellLeft, cellTop, grid.boxSizing.w, boxHeight);
										ctx.clip();
										clipped = true;
									}
								}
							} else if (((align == 'right' && !grid.isMirrored) || (align == 'left' && grid.isMirrored))
								&& LEFT_TO_RIGHT) {
								// measure the start column and the end column of this content
								contentEndCol = contentStartCol;
								contentStartCol = _columnOnWidth(col, contentWidth + indent, true);
								if (beyondVisualRange) {
									// overflow check
									if (contentStartCol > renderRange.endCol) {
										// we do not need to render the cell, it's not overflow to current range.
										return;
									}
									if (lgp != null && contentEndCol - lgp > renderRange.endCol) {
										// do not need to render either, it's clipped beyond the visible area.
										return;
									}
									// get the cell position, the cell left may need adjustment, we'll do this after the potential clip step.
									cellPos = geometry.getCellPosition(row, col);
									cellTop = cellPos.t;
									cellLeft = cellPos.l;
								}
								if (lgp == null) {
									// cut borders through
									border.cut(row, contentStartCol, contentEndCol);
								} else {
									border.cut(row, Math.max(col - lgp, contentStartCol), contentEndCol);
								}
								if (renderRange.startCol <= grid.freezeCol) {
									// currently in left view
									if (beyondVisualRange) {
										// steps over the freeze line, clip the frozen area in this case
										if (debug_render) {
											if ((col <= grid.freezeCol) || (contentStartCol > grid.freezeCol)) {
												throw "Unexpected value cell in this range";
											} 
										}
										if (lgp == null) {
											ctx.rect(GRID_HEADER_WIDTH, cellTop, geometry.getFreezeWidth(), boxHeight);
										} else {
											contentStartCol = Math.max(col - lgp, contentStartCol);
											ctx.rect(GRID_HEADER_WIDTH + geometry.colWidth(1, contentStartCol - 1), 
													cellTop, 
													geometry.colWidth(contentStartCol, grid.freezeCol), 
													boxHeight);
										}
										ctx.clip();
										clipped = true;
										if (firstVisibleCol > grid.freezeCol + 1 && contentEndCol > grid.freezeCol + 1) {
											// adjust the cell left
											if (col >= firstVisibleCol) {
												cellLeft += geometry.colWidth(grid.freezeCol + 1, firstVisibleCol - 1);
											} else {
												cellLeft += geometry.colWidth(grid.freezeCol + 1, col - 1);
											}
										}
									} else {
										// normal clip check
										if (lgp == null) {
											// we can clip here, but seems not necessary, the header will overlap the exceeds content;
										} else if (col - lgp > contentStartCol){
											if (lgp == 0) {
												ctx.rect(cellLeft, cellTop, cellWidth, boxHeight);
											} else {
												ctx.rect(cellLeft - (boxWidth = geometry.colWidth(col - lgp, contentEndCol - 1)), cellTop, boxWidth + cellWidth, boxHeight);
											}
											ctx.clip();
											clipped = true;
										}
									}
								} else {
									// right view
									if (beyondVisualRange) {
										if (col < renderRange.startCol) {
											// this is not likely to happen for a 'right align cell' to get in this.
											if (debug_render) {
												throw "How could this be happen";
											}
										} else {
											/*col > renderRange.endCol*/
											// The cell contents overflow to current visible area, if not so it should have already return in the overflow check in the begining,
											// we suppose it will surely overflow to current visible area.
											// In this case the clip check can be done together with the non-beyond-visual-range case, in the following if branch.
										}
									}
									if (
											/*overflow & clip in the freeze area*/
											(contentStartCol <= grid.freezeCol && (lgp == null || col - lgp <= grid.freezeCol)) || 
											/**/
											(contentStartCol < firstVisibleCol && grid.freezeCol > 0 && (lgp == null || col - lgp < firstVisibleCol))
									) {
										ctx.rect(GRID_HEADER_WIDTH + geometry.getFreezeWidth(), cellTop, geometry.getScrollableWidth(), boxHeight);
										ctx.clip();
										clipped = true;
									}
									if (!clipped && (lgp != null && col - lgp > contentStartCol)) {
										if (lgp == 0) {
											ctx.rect(cellLeft, cellTop, cellWidth, boxHeight);
										} else {
											ctx.rect(cellLeft - (boxWidth = geometry.colWidth(col - lgp, contentEndCol - 1)), cellTop, boxWidth + cellWidth, boxHeight);
										}
										ctx.clip();
										clipped = true;
									}
								}
								if (!clipped) {
									if (contentHeight > boxHeight) {
										// give a big boxWidh  and clip on box height
										ctx.rect(GRID_HEADER_WIDTH, cellTop, grid.boxSizing.w, boxHeight);
										ctx.clip();
										clipped = true;
									}
								}
							} else if (LEFT_TO_RIGHT) /*center*/{
								// in this case, there should have no indent;
								if (debug_render) {
									if (indent != 0) {
										console.warn("Center align with indent, this can't be happening.");
									}
								}
								rightClipEdge = leftClipEdge = 0;
								contentStartCol = _columnOnWidth(col, contentWidth / 2 + cellWidth / 2, true);
								contentEndCol = _columnOnWidth(col, contentWidth / 2 + cellWidth / 2);
								// cut through borders
								border.cut(row, 
										(lgp == null ? contentStartCol : Math.max(col - lgp, contentStartCol)), 
										(rgp == null ? contentEndCol : Math.min(col + rgp, contentEndCol)));
								if (beyondVisualRange) {
									if (contentStartCol > renderRange.endCol || (contentStartCol > grid.freezeCol && contentEndCol < renderRange.startCol)) {
										// totally invisible, do not render this cell;
										return;
									}
									if (renderRange.startCol <= grid.freezeCol) {
										if (contentStartCol > grid.freezeCol) {
											// overflow does not reach current visible area.
											return;
										}
									} else {
										if (contentEndCol < renderRange.startCol) {
											// overflow does not reach current visible area.
											return;
										}
									}
									cellPos = geometry.getCellPosition(row, col);
									cellTop = cellPos.t;
									cellLeft = cellPos.l;
								}
								if (renderRange.startCol <= grid.freezeCol) {
									// left view
									if (beyondVisualRange) {
										// clip the frozen area to render the cell.
										if (lgp == null) {
											ctx.rect(GRID_HEADER_WIDTH, cellTop, geometry.getFreezeWidth(), boxHeight);
										} else {
											ctx.rect(GRID_HEADER_WIDTH + (boxWidth = geometry.colWidth(1, Math.max(col - lgp, contentStartCol) - 1)), cellTop, geometry.getFreezeWidth() - boxWidth, boxHeight);
										}
										ctx.clip();
										clipped = true;
										if (firstVisibleCol > grid.freezeCol + 1 && col > grid.freezeCol + 1) {
											if (col >= firstVisibleCol) {
												cellLeft += geometry.colWidth(grid.freezeCol + 1, firstVisibleCol - 1);
											} else {
												cellLeft += geometry.colWidth(grid.freezeCol + 1, col - 1);
											}
										}
									} else {
										if (lgp != null && col - lgp > contentStartCol) {
											contentStartCol = col - lgp;
											clipped = true;
										}
										if (contentEndCol > grid.freezeCol && (rgp == null || col + rgp > grid.freezeCol)) {
											contentEndCol = grid.freezeCol;
											clipped = true;
										}
										if (rgp != null && col + rgp < contentEndCol) {
											contentEndCol = col + rgp;
											clipped = true;
										}
										if (clipped) {
											ctx.rect(GRID_HEADER_WIDTH + (contentStartCol > 1 ? geometry.colWidth(1, contentStartCol - 1) : 0), cellTop, geometry.colWidth(contentStartCol, contentEndCol), boxHeight);
											ctx.clip();
										}
									}
								} else {
									// right view
									if (beyondVisualRange) {
										if (contentStartCol <= grid.freezeCol) {
											contentStartCol = grid.freezeCol + 1;
											clipped = true;
										}
										if (col < renderRange.startCol && col > grid.freezeCol) {
											cellLeft -= geometry.colWidth(col, renderRange.startCol - 1);
										}
									}
									if (contentStartCol <= grid.freezeCol && (lgp == null || col - lgp <= grid.freezeCol)) {
										contentStartCol = grid.freezeCol + 1;
										clipped = true;
									}
									if (lgp != null && col - lgp > contentStartCol) {
										contentStartCol = col - lgp;
										clipped = true;
									}
									if (rgp != null && col + rgp < contentEndCol) {
										contentEndCol = col + rgp;
										clipped = true;
									}
									if (clipped) {
										ctx.rect(GRID_HEADER_WIDTH + geometry.getFreezeWidth() + ((contentStartCol > renderRange.startCol) ? geometry.colWidth(renderRange.startCol, contentStartCol - 1) : 0), cellTop, geometry.colWidth(contentStartCol, contentEndCol), boxHeight);
										ctx.clip();
									}
								}
								if (!clipped && contentHeight > boxHeight) {
									// row clipped
									ctx.rect(GRID_HEADER_WIDTH, cellTop, geometry.getGridWidth(), boxHeight);
									ctx.clip();
									clipped = true;
								}
							}
						}
					} else {
						// wrapped cell;
						if (contentHeight > boxHeight || boxHeight < HEADER_BOUNDING_HEIGHT /2 || cellWidth < HEADER_BOUNDING_WIDTH / 2) {
							// Although it's a wrapped cell, but the box height is not enough to fully display the content;
							ctx.rect(cellLeft, cellTop, cellWidth, boxHeight);
							ctx.clip();
						}
					}
					// number cell, or ERROR cell;
					if (!overflow) {
						if (node.needRounding) {
							// for general formated number, we may need to change the show value to fit current cell width;
							node.value = engine.roundNumber(node.value, geometry.colWidth(col, excol), indent, ctx, null, grid.editor.scene.getLocale());
							if (node.value.indexOf("#") == 0) {
								// "####" will ignore idnent;
								indent = 0;
								// and padding
								padding = 0;
							}
							// re-measure rounded number's content width since the value chould have been changed 
							// during 'layoutEngine.roundNumber'.
							textMetrics = ctx.measureText(node.value);
							contentWidth = textMetrics.width;
						} else if (node.invalidDateTime || contentWidth + indent > (boxWidth = geometry.colWidth(col, excol))) {
							// use "#####" to replace with the content if it does not have enough space or it isn't an valid date/time(1899/12/30-9999/12/31)
							node.value = new Array(parseInt(boxWidth / (ctx.measureText("#").width) || 1) + 1).join("#");
							// "####" will ignore idnent;
							indent = 0;
							// and padding
							padding = 0;
						} else if (node.hasRepeatChar){
							// Number format - Accounting:  repeat a whitespace so that the width of the number fills the column
							var spacesNum = parseInt((boxWidth - contentWidth - indent) / (ctx.measureText(" ").width));
							var spaces = new Array(spacesNum).join(" ");
							node.value = node.value.replace(/\* /, spaces);
						} 
						if (node.value == "") {
							// no need to render this cell;
							return;
						}
						if (contentHeight > boxHeight) {
							ctx.rect(cellLeft, cellTop, cellWidth, boxHeight);
							ctx.clip();
							clipped = true;
						}
					}
					if (node.unsupported) {
						// Record the value before we modify it accroding to the text align info so as to render the text;
						node.cellLeft = cellLeft;
					}
					// 3. We need to start render the cell content, first calculate the linetop (base line top position) of the cell contents based on vertical align
					if (valign == 'top') {
						// top down
						linetop = cellTop + contentHeight;
					} else if (valign == 'middle') {
						linetop = cellTop + boxHeight / 2 + contentHeight / 2;
					} else {
						// bottom up
						linetop = cellTop + boxHeight;
						if (wrap && node.value.length > 1 && contentHeight > boxHeight) {
							// As a special case of a "bottom-up" cell, follow the display rules of Excel;
							linetop += (contentHeight - boxHeight);
						}
					}
					linetop = ((linetop - PADDING_SIZE) | 0);
					if(!grid.isMirrored) {
						if (align == 'right') {
							cellLeft += (cellWidth);
							cellLeft -= (padding + indent); // padding size;
						} else if (align == 'center') {
							cellLeft += cellWidth / 2;
						} else {
							cellLeft += (indent + padding); // padding size;
						}
					}
					// 4. Render the text content and the text decoration.
					if (clipped && (underline || strikethrough)) {
						ctx.beginPath();
					}
					for (var line, lines = wrap ? node.value : [node.value], widths = node.widths, idx = lines.length - 1; (line = lines[idx]) != null; idx--) {
						if(direction == 'rtl')
							line = BidiUtils.RLE + line;

						if (grid.isMirrored) {
							fillTextBidi(line, cellLeft, linetop, cellWidth, align);
						} else {
							ctx.fillText(line, cellLeft, linetop);
						}
						if (underline || strikethrough) {
							if (wrap) {
								// it's a wrap line
								contentWidth = widths[idx];
								if (!textMetrics) {
									textMetrics = ctx.measureText(line || "Ayf,M");
								}
							}
							if (strikethrough && (!textMetrics.actualBoundingBoxAscent)) {
								// just get an approximation of the asent from a low case 'm';
								// actualBoundingBoxAscent may not be suuported in some browsers;
								// This is a method used by Bespin (Mozila Labs).
								textMetrics.actualBoundingBoxAscent = ctx.measureText('m').width;
							}
							decorationTop = (linetop | 0) + 1.5;
							if (align == 'right') {
								var _right = grid.isMirrored ? cellLeft + contentWidth : cellLeft - contentWidth;
								if (underline) {
									ctx.moveTo(cellLeft, decorationTop);
									ctx.lineTo(_right, decorationTop);
								}
								if (strikethrough) {
									decorationTop -= (textMetrics.actualBoundingBoxAscent / 2) | 0;
									ctx.moveTo(cellLeft, decorationTop);
									ctx.lineTo(_right, decorationTop);
								}
							} else if (align == 'center') {
								var _left = cellLeft - (contentWidth) / 2;
								var _right = cellLeft + (contentWidth) / 2;
								if(grid.isMirrored) {
									_left += cellWidth / 2;
									_right += cellWidth / 2;
								}
								if (underline) {
									ctx.moveTo(_left, decorationTop);
									ctx.lineTo(_right, decorationTop);
								}
								if (strikethrough) {
									decorationTop -= (textMetrics.actualBoundingBoxAscent / 2) | 0;
									ctx.moveTo(_left, decorationTop);
									ctx.lineTo(_right, decorationTop);
								}
							} else {
								var _left = grid.isMirrored ? cellLeft + cellWidth : cellLeft;
								var _right = grid.isMirrored ? cellLeft + cellWidth - contentWidth : cellLeft + contentWidth;
								if (underline) {
									ctx.moveTo(_left, decorationTop);
									ctx.lineTo(_right, decorationTop);
								}
								if (strikethrough) {
									decorationTop -= (textMetrics.actualBoundingBoxAscent / 2) | 0;
									ctx.moveTo(_left, decorationTop);
									ctx.lineTo(_right, decorationTop);
								}
							}
						}
						linetop -= lineHeight;
					}
					if(!wrap && node.link){
						var tx = cellLeft;
						var tw = cellWidth > contentWidth ? contentWidth : cellWidth;
						if(!grid.isMirrored) {
							if (align == 'right') {
								tx -= tw;
							} else if (align == 'center') {
								tx -= tw/2;
							}
						}
						var ty = linetop;
						var th = lineHeight;
						var pos = grid.geometry.getCellPosition(node.row - 1, node.col);
						var ox = tx - pos.l;
						var oy = ty - pos.t;
						oy = oy < 0 ? 0 : oy;
						
						grid.insertCellInfo(node.row - 1, node.col, "textRect", [ox, oy, tw, th]);
					}
					
					if (underline || strikethrough) {
						ctx.stroke();
					}
					if (node.unsupported) {
						if (!unsupportedImg.complete) {
							var deferRender = new dojo.Deferred();
							deferRender.then(function () {
								ctx.drawImage(unsupportedImg, node.cellLeft + cellWidth - unsupportedImg.width - 1, cellTop + 1);
							});
							unsupportedImg.onload = function () {
								if (!deferRender.isResolved()) {
									deferRender.resolve();
								}
							};
						} else {
							ctx.drawImage(unsupportedImg, node.cellLeft + cellWidth - unsupportedImg.width - 1, cellTop + 1);
						}
					}
					// 5. Restore for potential clip.
					ctx.restore();
				}
				if (children) {
					for (var idx = 0, len = children.length; idx < len; idx++) {
						traverse(children[idx]);
					}
				}
			};
			ctx.save();
			ctx.textBaseline = 'alphabetic';
			traverse(tree.root());
			ctx.restore();
		};
		
		var backgroundRender = function (tree) {
			if (HIGH_CONTRAST_MODE) {
				ctx.fillStyle = GRID_BGCOLOR_HC;
				ctx.rect(GRID_HEADER_WIDTH, GRID_HEADER_HEIGHT, geometry.getGridWidth(), geometry.getGridHeight());
				ctx.fill();
			} else {
				var colors = tree.root().children;
				if (colors) {
					var 
					node,
					color,
					children,
					branches;
					for (var idx = 0, len = colors.length; idx < len; idx++) {
						node = colors[idx];
						color = node.value;
						children = node.children;
						branches = children.length;
						if(branches > 0){
							ctx.fillStyle = color;
							ctx.beginPath();
							for (var i = 0; i < branches; i++){
								var 
								n = children[i],
								row = n.row,
								col = n.col,
								endCol = n.endCol,
								height = geometry.rowHeight(row - 1),
								width = geometry.colWidth(col, endCol),
								position = geometry.getCellPosition(row - 1, col);
								ctx.rect(position.l, position.t, width, height);
							}
							ctx.fill();
						}
					}
			}
			}
		};
		var headerRender = function () {
			var columnHeaderRender = function (start_col, end_col) {
				// fill columns background
				if (HIGH_CONTRAST_MODE) {
					ctx.fillStyle = GRID_HEADER_BGCOLOR_HC;
				} else {
					ctx.fillStyle = GRID_HEADER_BGCOLOR;
				}
				ctx.beginPath();
				if (LEFT_TO_RIGHT) {
					ctx.fillRect(left, top, boxWidth, cellHeight);
				} else {
					ctx.fillRect(left - boxWidth, top, boxWidth, cellHeight);
				}
				// fill text and stroke border at the same time;
				if (HIGH_CONTRAST_MODE) {
					ctx.fillStyle = GRID_HEADER_FONTCOLOR_HC;
				} else {
					ctx.fillStyle = GRID_HEADER_FONTCOLOR;
				}
				ctx.beginPath();
				for (var start =  start_col, end = end_col; start <= end; start ++) {
					cellWidth = geometry.colWidth(start);
					if (cellWidth > 0) {
						if (LEFT_TO_RIGHT) {
							if (cellWidth < HEADER_BOUNDING_WIDTH) {
								ctx.stroke();
								ctx.save();
								ctx.rect(left, 0, cellWidth, cellHeight);
								ctx.clip();
								if (cellWidth > HEADER_BOUNDING_WIDTH / 4) {
									if(grid.isMirrored)
										fillTextBidi(translator.getColChar(start), left, cellHeight/2, cellWidth, 'center');
									else
										ctx.fillText(translator.getColChar(start), left + cellWidth/2, cellHeight/2);
								}
								ctx.restore();
							} else {
								if(grid.isMirrored) {
									fillTextBidi(translator.getColChar(start), left, cellHeight/2, cellWidth, 'center');
								} else {
									ctx.fillText(translator.getColChar(start), left + cellWidth/2, cellHeight/2);
								}
							}
							left += cellWidth;
						} else {
							ctx.fillText(translator.getColChar(start), left - cellWidth/2, cellHeight/2);
							left -= cellWidth;
						}
						ctx.beginPath();
						ctx.moveTo(left, top);
						ctx.lineTo(left, top + cellHeight);
						ctx.stroke();
						indicator = 2;
					} else if(indicator > 0) {
						while (indicator -= 0.5) {
							ctx.moveTo(left + indicator, top);
							ctx.lineTo(left + indicator, top + cellHeight);
							ctx.stroke();
						}
					}
				}
				ctx.stroke();
			};
			
			var rowHeaderRender = function (start_row, end_row) {
				if (HIGH_CONTRAST_MODE) {
					ctx.fillStyle = GRID_HEADER_BGCOLOR_HC;
				} else {
					ctx.fillStyle = GRID_HEADER_BGCOLOR;
				}
				ctx.beginPath();
				if (LEFT_TO_RIGHT) {
					ctx.fillRect(left, top, cellWidth, boxHeight);
				} else {
					ctx.fillRect(left - cellWidth, top, cellWidth, boxHeight);
				}
				// fill text and stroke border at the same time;
				if (HIGH_CONTRAST_MODE) {
					ctx.fillStyle = GRID_HEADER_FONTCOLOR_HC;
				} else {
					ctx.fillStyle = GRID_HEADER_FONTCOLOR;
				}
				ctx.beginPath();
				for (var start =  start_row, end = end_row; start <= end; start ++) {
					cellHeight = geometry.rowHeight(start);
					if (cellHeight > 0) {
						if (cellHeight < HEADER_BOUNDING_HEIGHT) {
							ctx.stroke();
							ctx.save();
							ctx.rect(0, top, cellWidth, cellHeight);
							ctx.clip();
							if (cellHeight > HEADER_BOUNDING_HEIGHT / 2) {
								if(grid.isMirrored)
									fillTextBidi(start + 1, left, top + cellHeight/2, cellWidth, 'center');
								else
									ctx.fillText(start + 1, left + cellWidth/2, top + cellHeight/2);
							}
							ctx.restore();
							ctx.beginPath();
						} else {
							if(grid.isMirrored)
								fillTextBidi(start + 1, left, top + cellHeight/2, cellWidth, 'center');
							else
								ctx.fillText(start + 1, left + cellWidth/2, top + cellHeight/2);
						}
						top += cellHeight;
						ctx.moveTo(left, top);
						ctx.lineTo(left + cellWidth, top);
						indicator = 2;
					} else if (indicator){
						while (indicator -= 0.5) {
							ctx.moveTo(left, top + indicator);
							ctx.lineTo(left + cellWidth, top + indicator);
						}
					}
				}
				ctx.stroke();
			};
			var 
				firstVisibleRow = grid.scroller.firstVisibleRow,
				lastVisibleRow = grid.scroller.lastVisibleRow,
				firstVisibleCol = grid.scroller.firstVisibleCol,
				lastVisibleCol = grid.scroller.lastVisibleCol,
				freezeCol = grid.freezeCol,
				freezeRow = grid.freezeRow,
				translator = websheet.Helper,
				left = LEFT_TO_RIGHT ? GRID_HEADER_WIDTH + 0.5 : grid.boxSizing.w - GRID_HEADER_WIDTH + 0.5,
				top = 0,
				boxWidth = 0,
				boxHeight = 0,
				cellWidth = 0,
				cellHeight = GRID_HEADER_HEIGHT,
				indicator = 2;
			if (HIGH_CONTRAST_MODE) {
				ctx.strokeStyle = GRID_HEADER_LINECOLOR_HC;
			} else {
				ctx.strokeStyle = GRID_HEADER_LINECOLOR;
			}
			// render freeze columns,
			if (freezeCol > 0 && (boxWidth = geometry.getFreezeWidth()) > geometry.freezeBarSize) {
				columnHeaderRender(1, freezeCol);
			}
			// render scrollable columns,
			if ((boxWidth = geometry.colWidth(firstVisibleCol, lastVisibleCol)) > 0) {
				// jump over the freeze gap.
				if (freezeCol > 0) {
					if (LEFT_TO_RIGHT) {
						left += 3;
					} else {
						left -= 3;
					}
				}
				columnHeaderRender(firstVisibleCol, lastVisibleCol);
			}
			if (HIGH_CONTRAST_MODE) {
				ctx.fillStyle = GRID_HEADER_BGCOLOR_HC;
			} else {
				ctx.fillStyle = GRID_HEADER_BGCOLOR;
			}
			
			cellWidth = GRID_HEADER_WIDTH;
			top = top + GRID_HEADER_HEIGHT + 0.5;
			left = LEFT_TO_RIGHT ? 0.5 : grid.boxSizing.w - 0.5;
			// render freeze rows,
			if (freezeRow > 0 && (boxHeight = geometry.getFreezeHeight()) > geometry.freezeBarSize) {
				rowHeaderRender(0, freezeRow - 1);
			}
			// render scrollable rows
			if ((boxHeight = geometry.rowHeight(firstVisibleRow, lastVisibleRow)) > 0) {
				// jump over the freeze gap
				if (freezeRow > 0) {
					top = top + 3;
				}
				rowHeaderRender(firstVisibleRow, lastVisibleRow);
			}
		};
		var headerSelectionHighlight = function () {
			var
				selectionManager = grid.selection,
				selections = selectionManager._selections,
//				selects = selectionManager.getSelectedRanges(true),
				freezeCol = grid.freezeCol,
				freezeRow = grid.freezeRow,
				firstVisibleRow = grid.scroller.firstVisibleRow + 1,
				lastVisibleRow = grid.scroller.lastVisibleRow + 1,
				firstVisibleCol = grid.scroller.firstVisibleCol,
				lastVisibleCol = grid.scroller.lastVisibleCol,
				startRow,
				endRow,
				startCol,
				endCol,
				master,
				left,
				top
				;
			widget_ctx.save();
			widget_ctx.beginPath();
			widget_ctx.globalAlpha = 0.2;
			if (HIGH_CONTRAST_MODE) {
				widget_ctx.fillStyle = GRID_HEADER_HIGHLIGHT_HC;
			} else {
				widget_ctx.fillStyle = GRID_HEADER_HIGHLIGHT;
			}
			for (var selection, idx = 0, len = selections.length; selection = selections[idx++]; ) {
				var select = (selection.selectingRows() || selection.selectingColumns()) ? selection.getRangeInfo() : selection.getExpandedRangeInfo();
				startRow = select.startRow;
				endRow = select.endRow;
				startCol = select.startCol;
				endCol = select.endCol;
				// column first
				if (LEFT_TO_RIGHT) {
					left = GRID_HEADER_WIDTH + ((select.startCol > 1) ? geometry.colWidth(1, select.startCol - 1) : 0); 
					top = 0;
					if (startRow == endRow && startCol == endCol) {
						// gonna check if its a master cell of a merged cell;
						if (master = grid.cellMergeInfo(startRow - 1, startCol)) {
							startRow = master.masterRow == null ? startRow : master.masterRow + 1;
							endRow = master.rowSpan ? startRow + master.rowSpan - 1 : endRow;
							startCol = master.masterCol == null ? startCol : master.masterCol;
							endCol = master.colSpan ? startCol + master.colSpan - 1: endCol;
						}
					}
					if (startCol <= freezeCol) {
						widget_ctx.fillRect(left, top, geometry.colWidth(startCol, Math.min(freezeCol, endCol)), GRID_HEADER_HEIGHT);
					}
					if (endCol >= firstVisibleCol) {
						left = geometry.getFreezeWidth() + GRID_HEADER_WIDTH;
						if (startCol > firstVisibleCol) {
							 left += geometry.colWidth(firstVisibleCol, startCol - 1);
						}
						if (startCol <= lastVisibleCol) {
							widget_ctx.fillRect(left, top, geometry.colWidth(Math.max(firstVisibleCol, startCol), Math.min(lastVisibleCol, endCol)), GRID_HEADER_HEIGHT);
						}
					}
				}
				// then rows
				if (LEFT_TO_RIGHT) {
					left = 0;
					top = GRID_HEADER_HEIGHT + ((startRow > 1) ? geometry.quickRowHeight(0, startRow - 2) : 0);
					if (startRow <= freezeRow) {
						widget_ctx.fillRect(left, top, GRID_HEADER_WIDTH, geometry.quickRowHeight(startRow - 1, Math.min(freezeRow - 1, endRow - 1)));
					}
					if (endRow >= firstVisibleRow) {
						top = GRID_HEADER_HEIGHT + geometry.getFreezeHeight();
						if (startRow > firstVisibleRow) {
							top += geometry.quickRowHeight(firstVisibleRow - 1, startRow - 2);
						}
						widget_ctx.fillRect(left, top, GRID_HEADER_WIDTH, geometry.quickRowHeight(Math.max(firstVisibleRow - 1, startRow - 1), Math.min(lastVisibleRow - 1, endRow - 1)));
					}
				}
			}
			widget_ctx.restore();
		};
		
		var freezebarBackground = function () {
			var
				left,
				top;
			widget_ctx.save();
			widget_ctx.lineWidth = 3;
			widget_ctx.globalAlpha = 0.5;
			widget_ctx.fillStyle = GRID_FREEZEBAR_COLOR;
			widget_ctx.beginPath();
			if (grid.freezeCol > 0) {
				left = geometry.getFreezeWidth() + GRID_HEADER_WIDTH - 0.5;
				top = 0;
				widget_ctx.moveTo(left, top);
				widget_ctx.lineTo(left, geometry.getGridHeight());
			}
			if (grid.freezeRow > 0) {
				left = 0;
				top = geometry.getFreezeHeight() + GRID_HEADER_HEIGHT - 0.5;
				widget_ctx.moveTo(left, top);
				widget_ctx.lineTo(geometry.getGridWidth(), top);
			}
			widget_ctx.stroke();
			widget_ctx.restore();
		};
		
		var coeditingHighlight = function (userIndicatorTree) {
			if (userIndicatorTree && grid.editor.hasColorShading) {
				widget_ctx.save();
				widget_ctx.globalAlpha = 0.5;
				var users = userIndicatorTree.root().children;
				if (users) {
					for (var idx = 0, len = users.length; idx < len; idx++) {
						var node = users[idx];
						var user = node.value;
						if(window["pe"].curUser.getIndicator(user)  != 'hide'){
							userHighlight(node, true);
						}
					}
				}
				widget_ctx.restore();
			}
			grid.editor.getCollaboratorContainer().updateIndicator(grid.sheetName);
		};
		
		var watermark = function () {
			// render watermark on base layer
			if (!grid.editor.watermark)
				return;
			var watermark = grid.editor.watermark;
			ctx.save();
			ctx.globalAlpha = watermark.opacity;
			ctx.font = watermark.font;
			ctx.fillStyle = watermark.color;
			ctx.textAlign = 'left';
			var metrics = ctx.measureText(watermark.text);
			var width = metrics.width;
			var height = watermark.size;
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.translate(canvas.width / 2, canvas.height / 2);
			if (watermark.diagonal)
				ctx.rotate(-Math.atan(canvas.height / canvas.width));
			ctx.fillText(watermark.text, -width / 2, height / 2);
			ctx.restore();
		};
		
		var comments = function () {
			// render comments indicator on cell;
			var 
				docObj = grid.editor.getDocumentObj(),
				areaMgr = docObj.getAreaManager(),
				ranges_list = areaMgr.getRangesByUsage(websheet.Constant.RangeUsage.COMMENTS, grid.sheetName),
				comments_list = grid.editor.getCommentsHdl()/*Create it if not initialized*/._commentsList,
				sc = grid.scroller,
				range,
				comment
				;
			for (var idx = 0, len = ranges_list.length; idx < len; idx++) {
				range = ranges_list	[idx];
				comment = docObj.getComments(range._id);
				if (!comment) {
					continue;
				}
				if(comment.items[0].resolved){
					grid.insertCellInfo(range.getStartRow() - 1, range.getStartCol(), 'comments', null);
					continue;
				}		
				if (comment = comments_list[range._id]) {
					// visible ?
					var startRow = range.getStartRow() - 1;
					var startCol = range.getStartCol();
//					var endRow = range.getEndRow() - 1;
					var endCol = range.getEndCol();
					var master = grid.cellMergeInfo(startRow, startCol);
					if (master) {
//						endRow = master.rowSpan ? startRow + master.rowSpan - 1 : startRow;
						endCol = master.colSpan ? startCol + master.colSpan - 1 : startCol;
					}
					var isActive = (comment.state == "active");
					// the comments indicator is rendered at the 'first row & laster column (that is the top-right corner');
					if (sc.isRowInVisibleArea(startRow) && sc.isColumnInVisibleArea(endCol) && grid.isVisibleRow(startRow) && grid.isVisibleCol(startCol) && !grid.isCoveredCell(startRow, startCol)) {
						grid.insertCellInfo(startRow, startCol, 'comments', range._id);
						var position = geometry.getCellPosition(startRow, startCol);
						if (startCol < sc.firstVisibleCol && startCol > grid.freezeCol) {
							position.w = grid.geometry.colWidth(sc.firstVisibleCol, endCol);
						} else if (startCol <= grid.freezeCol && endCol > grid.freezeCol && endCol >= sc.firstVisibleCol) {
							position.w = grid.geometry.colWidth(startCol, grid.freezeCol) + grid.geometry.colWidth(sc.firstVisibleCol, endCol);
						} else {
							position.w = grid.geometry.colWidth(startCol, endCol);
						}
						// render out the indicator;
						var img = isActive ? activeCmtImg : inactiveCmtImg;
						if (!img.complete) {
							var deferRender = new dojo.Deferred();
							deferRender.then(function () {
								widget_ctx.drawImage(position.l + position.w - 6, position.t + 1, img);
							});
							img.onload = function () {
								if (!deferRender.isResolved()) {
									deferRender.resolve();
								}
							};
						} else {
							widget_ctx.drawImage(img, position.l + position.w - 6, position.t + 1);
						}
					}
				}
			}
		};
		
		var userHighlight = function (node, bOn) {
			var children = node.children,
				firstVisCol = grid.scroller.firstVisibleCol,
				freezeCol = grid.freezeCol,
				length = children.length;
			if (length > 0) {
				var collaborator = grid.editor.getCollaboratorContainer().getCollaborator(node.value);
				if (collaborator) {
					var color = collaborator.getColor();
					bOn && (widget_ctx.fillStyle = color);
					widget_ctx.beginPath();
					for (var i = 0; i < length; i++){
						var 
							n = children[i],
							row = n.row,
							col = n.col,
							height = geometry.rowHeight(row - 1),
							width = geometry.colWidth(col),
							position = geometry.getCellPosition(row - 1, col);
						// adjust width with positions;
						if (col > freezeCol && col < firstVisCol) {
							// we render a cell unit on each iteration,
							// a large merged cell contains a set of cell units;
							// just pass the cell units that are not visible in column;
							// (those cell units not visible in row will not be involved in 'node', they're filtered before 'userHighlight' called);
							continue;
						}
						if (bOn) {
							widget_ctx.rect(position.l, position.t, width, height);
						} else {
							widget_ctx.clearRect(position.l, position.t, width, height);
						}
					}
					bOn && widget_ctx.fill();
				}
			}
		};
		
		var _columnOnWidth = function (startCol, width, backwards) {
			// return endCol
			var 
				endCol = startCol,
				array = geometry._widthArray,
				colWidth = array[endCol - 1];
			while (width > colWidth) {
				if (colWidth > 0) {
					width -= colWidth;
				}
				colWidth = array[((backwards ? (--endCol) : (++endCol)) - 1)];
				if (colWidth == null) {
					endCol = Math.max(1, endCol);
					break;
				}
			}
			return endCol;
		};
		
		var _renderLockCell = function(color, img, left, top, width, height) {
			widget_ctx.save();
			var l,t,w,h;//define image size
			(width <= img.width)? (l = left) && (w = width) :(l = left + width - img.width) && (w = img.width);
			(height <= img.height)? (t = top) && (h = height):(t = top + height/2 - img.height/2) && (h = img.height);
			widget_ctx.beginPath();
			widget_ctx.globalAlpha = 0.5;
			widget_ctx.fillStyle = "#e0e0e0";
			widget_ctx.lineWidth = 1;
			widget_ctx.strokeStyle = color;
			widget_ctx.rect(left + 0.5, top + 0.5, width - 1, height - 1);
			widget_ctx.fill();
			widget_ctx.stroke();
			widget_ctx.drawImage(img, l, t, w, h );
			widget_ctx.restore();
		};
		
		var _rangeBox = function (startRow, endRow, startCol, endCol) {
			var 
				sc = grid.scroller,
				width,
				height,
				crossFreezebar = false;
			if (startRow < grid.freezeRow) {
				height = geometry.quickRowHeight(startRow, Math.min(endRow, grid.freezeRow - 1));
				if (endRow >= sc.firstVisibleRow) {
					height += geometry.quickRowHeight(sc.firstVisibleRow, Math.min(endRow, sc.lastVisibleRow));
					height += geometry.freezeBarSize;
					crossFreezebar = true;
				}
			} else {
				height = geometry.quickRowHeight(Math.max(sc.firstVisibleRow, startRow), Math.min(sc.lastVisibleRow, endRow));
			}
			if (startCol <= grid.freezeCol) {
				if (endCol > grid.freezeCol) {
					width = geometry.colWidth(startCol, grid.freezeCol);
				} else {
					width = geometry.colWidth(startCol, endCol);
				}
				if (endCol >= sc.firstVisibleCol) {
					width += geometry.colWidth(sc.firstVisibleCol, Math.min(endCol, sc.lastVisibleCol));
					width += geometry.freezeBarSize;
					crossFreezebar = true;
				}
			} else {
				width = geometry.colWidth(Math.max(sc.firstVisibleCol, startCol), Math.min(sc.lastVisibleCol, endCol));
			}
			return {w : width, h : height, crossFreezebar: crossFreezebar};
		};
		return {
			buildRenderTree: function (renderRange) {
				// summary:
				//		Build the render tree of the given range, make sure data grid has been updated.
				// renderRange: a 'range info' object, rows are 1-based as model requires.
				//		{	startRow : 1,
				//			endRow: 45,
				//			startCol: 1,
				//			endCol: 24,
				//			sheetName: 'sheet1'
				//		}
				renderTree.start(grid, renderRange).build();
				return this;
			},
			
			clear: function (left, top, width, height) {
				// summary:
				//		Clear the canvas (basic layer). Clear all.
				if(ctx) {
					ctx.save();
					ctx.setTransform(1, 0, 0, 1, 0, 0);
					if (left == null) {
						ctx.clearRect(0, 0, canvas.width, canvas.height);
					} else if (arguments.length == 4) {
						ctx.clearRect(left, top, width, height);
					}
					ctx.restore();
				}
				return this;
			},
			
			_renderACL: function()
			{
				var views = [],
				    sc = grid.scroller;
				if(grid.freezeRow > 0)
				{
					if(grid.freezeCol > 0)
					{
						var view = {startRow: 1, endRow: grid.freezeRow, startCol: 1, endCol: grid.freezeCol};
						view.left = GRID_HEADER_WIDTH;
						view.top = GRID_HEADER_HEIGHT;
						views.push(view);
					}	
					if(!grid.scrollColCollapsed)
					{
						var view = {startRow: 1, endRow: grid.freezeRow,startCol:sc.firstVisibleCol, endCol: sc.lastVisibleCol};
						view.left = geometry.getFreezeWidth() + GRID_HEADER_WIDTH;
						view.top = GRID_HEADER_HEIGHT;
						views.push(view);
					}	
				}	
				
				if(!grid.scrollRowCollapsed)
				{
					if(grid.freezeCol > 0)
					{
						var view = {startRow: sc.firstVisibleRow + 1 , endRow: sc.lastVisibleRow + 1, startCol: 1, endCol: grid.freezeCol};
						view.left = GRID_HEADER_WIDTH;
						view.top = geometry.getFreezeHeight() + GRID_HEADER_HEIGHT;
						views.push(view);
					}	
					if(!grid.scrollColCollapsed)
					{
						var view = {startRow: sc.firstVisibleRow + 1 , endRow: sc.lastVisibleRow + 1,startCol:sc.firstVisibleCol, endCol: sc.lastVisibleCol};
						view.left = geometry.getFreezeWidth() + GRID_HEADER_WIDTH;
						view.top = geometry.getFreezeHeight() + GRID_HEADER_HEIGHT;
						views.push(view);
					}	
				}
				var pms = grid.getPermissions(views[0]);
				var pattern = widget_ctx.createPattern(readOnlyImg,"repeat");
				widget_ctx.fillStyle = pattern;
				var len = views.length;
				var clipRect = function()
				{
					for(var i = 0; i < len; i++)
					{
						var view = views[i];
						var ranges = i == 0 ? pms.ranges : grid.getPermissions(view).ranges;
						var rLen = ranges.length;
						
						for(var j = 0; j < rLen; j++)
						{
							var range = ranges[j];
							var top = view.startRow-1 > range.startRow-2 ? 0 : geometry.quickRowHeight(view.startRow-1, range.startRow-2);
							var left = view.startCol > range.startCol-1 ? 0 : geometry.colWidth(view.startCol,range.startCol-1);
							top += view.top;
							left += view.left;
							var width = geometry.colWidth(range.startCol, range.endCol);
							var height = geometry.quickRowHeight(range.startRow -1, range.endRow-1);
	
							if(pms.basic == websheet.Constant.PermissionType.EDITABLE)
								widget_ctx.fillRect(left,top, width, height);
							else
								widget_ctx.clearRect(left,top, width, height);
						}	
					}
				};
				if(pms.basic != websheet.Constant.PermissionType.EDITABLE)
				{
					widget_ctx.fillRect(GRID_HEADER_WIDTH,GRID_HEADER_HEIGHT,canvas.width, canvas.height);
					widget_ctx.fill();
					
				}
				clipRect();
			},
			
			
			renderACL: function(){
				widget_ctx.save();
				widget_ctx.globalAlpha = 0.15;
				try{
					if (!readOnlyImg.complete) {
						var deferRender = new dojo.Deferred();
						deferRender.then(dojo.hitch(this, this._renderACL));
						readOnlyImg.onload = function () {
							if (!deferRender.isResolved()) {
								deferRender.resolve();
							}
						};
					} else {
						this._renderACL();
					}
				}catch(e)
				{
					console.log("Render ACL exception " + e);
				}
				widget_ctx.restore();
			},
			
			setWidgetLayerBg: function() {
				widget_ctx.save();
				widget_ctx.globalAlpha = 0.5;
				if (!readOnlyImg.complete) {
					var deferRender = new dojo.Deferred();
					deferRender.then(function () {
						var pattern = widget_ctx.createPattern(readOnlyImg,"repeat");
						widget_ctx.fillStyle = pattern;
						widget_ctx.fillRect(0,0,canvas.width, canvas.height);
						widget_ctx.fill();
					});
					readOnlyImg.onload = function () {
						if (!deferRender.isResolved()) {
							deferRender.resolve();
						}
					};
				} else {
					var pattern = widget_ctx.createPattern(readOnlyImg,"repeat");
					widget_ctx.fillStyle = pattern;
					widget_ctx.fillRect(GRID_HEADER_WIDTH,GRID_HEADER_HEIGHT,canvas.width, canvas.height);
					widget_ctx.fill();
				}
				widget_ctx.clearRect(100,100,200,200);
				widget_ctx.restore();
			},
			
			clearWidgetLayer: function () {
				// summary:
				//		Clear the widgetLayer cavans;
				if (widget_ctx) {
					widget_ctx.save();
					widget_ctx.setTransform(1, 0, 0, 1, 0, 0);
					widget_ctx.clearRect(0, 0, grid.widgetLayer.width, grid.widgetLayer.height);
					widget_ctx.restore();
				}
				return this;
			},
			
			direction: function (/*boolean*/isRtl) {
				// change the direction, 
				LEFT_TO_RIGHT = isRtl;
				return this;
			},
			
			shiftCanvas: function (sLeft, sTop, sWidth, sHeight, tLeft, tTop, tWidth, tHeight) {
				// summary:
				//		Move the frame with 'drawImage'.
				// sLeft, sTop, sWidth, sHeight
				//		Source coordinates and box sizing.
				// tLeft, tTop, tWidth, tHeight
				//		Target coordinates and box sizing
				var imageData = ctx.getImageData(sLeft, sTop, sWidth, sHeight);
				ctx.putImageData(imageData, tLeft, tTop);
				return this;
			},
			
			prepare: function (datagrid) {
				// summary:
				//		If you switch to a new grid, use state(newGrid) to make the context switch.
				grid = datagrid;
				ctx = grid.getBasicLayerContext();
				dashedContext = ctx;
				widget_ctx = grid.getWidgetLayerContext();
				canvas = grid.basicLayer;
				geometry = grid.geometry;
				renderTree.reset();
				if(grid.isMirrored) {
					ctx.setTransform(1, 0, 0, 1, 0, 0);
					ctx.translate(canvas.width,0);
					ctx.scale(-1,1);
					widget_ctx.setTransform(1, 0, 0, 1, 0, 0);
					widget_ctx.translate(canvas.width,0);
					widget_ctx.scale(-1,1);
				}
				detectHighContrastMode();
				detectDashLineSupport();
//				userIndicatorTree = null;
				return this;
			},
			
			renderContent: function () {
//				console.time("Render content");
				// 1. render background, background tree is simple, directly parse the tree and render it here,
//				console.time("Render background");
				backgroundRender(renderTree.background());
				watermark();
//				console.timeEnd("Render background");
				// 2. render text content, traverse the text tree to render it out.
//				console.time("Render text");
				textRender(renderTree.text());
//				console.timeEnd("Render text");
				// 3. render cell border, traverse the border tree to render it out.
//				console.time("Render border");
				borderRender(renderTree.border());
//				console.timeEnd("Render border");
//				console.timeEnd("Render content");
				return this;
			},
			
			renderSheetHeader: function () {
//				console.time("Render sheet header");
				ctx.beginPath();
				// render sheet header,
				ctx.rect(0.5, 0.5, GRID_HEADER_WIDTH, GRID_HEADER_HEIGHT);
				if (HIGH_CONTRAST_MODE) {
					ctx.fillStyle = GRID_BGCOLOR_HC;
					ctx.strokeStyle = GRID_LINE_COLOR_HC;
				} else {
					ctx.fillStyle = SHEET_HEADER_BGCOLOR;
					ctx.strokeStyle = GRID_LINE_COLOR;
				}
				ctx.fill();
				ctx.stroke();
//				console.timeEnd("Render sheet header");
				return this;
			},
			
			renderHeader: function () {
//				console.time("Render header");
				ctx.save();
				ctx.textBaseline = 'middle';
				ctx.textAlign = 'center';
				ctx.font = GRID_HEADER_FONT;
				headerRender();
				ctx.restore();
//				console.timeEnd("Render header");
				return this;
			},
			
			renderWidgets: function () {
//				console.time("Render widgets");
				this.clearWidgetLayer();
				if(grid.isInACLView())
					this.renderACL();
				dashedContext = widget_ctx;
				// render other widgets after grid main content render finished.
				headerSelectionHighlight();
				freezebarBackground();
//				console.timeEnd("Render widgets");
				coeditingHighlight(renderTree.userIndicator());
				comments();
				return this;
			},
			
			renderLockCell: function (row, col, color) {
				var sc = grid.scroller;
				var startRow = endRow = row;
				var startCol = endCol = col;
				var master = grid.cellMergeInfo(startRow, startCol);
				if (master) {
					if (master.isCovered) {
						return;
					}
					endRow = master.rowSpan ? (master.masterRow + master.rowSpan - 1) : startRow;
					endCol = master.colSpan ? (master.masterCol + master.colSpan - 1) : startCol;
				}
				if (sc.isRowRangeInVisibleArea(startRow, endRow) && sc.isColRangeInVisibleArea(startCol, endCol)) {
					var position = geometry.getCellPosition(row, col);
					var cellbox = _rangeBox(startRow, endRow, startCol, endCol);
					if (!lockCellImg.complete) {
						var deferRender = new dojo.Deferred();
						deferRender.then(function () {
							_renderLockCell(color, lockCellImg, position.l, position.t, cellbox.w, cellbox.h);
						});
						lockCellImg.onload = function () {
							if (!deferRender.isResolved()) {
								deferRender.resolve();
							}
						};
					} else {
						_renderLockCell(color, lockCellImg, position.l, position.t, cellbox.w, cellbox.h);
					}
				}
			},
			
			renderReleaseCell: function(row, col) {
				var sc = grid.scroller;
				var startRow = endRow = row;
				var startCol = endCol = col;
				var master = grid.cellMergeInfo(startRow, startCol);
				if (master) {
					if (master.isCovered) {
						return;
					}
					endRow = master.rowSpan ? master.masterRow + master.rowSpan - 1 : startRow;
					endCol = master.colSpan ? master.masterCol + master.colSpan - 1 : startCol;
				}
				if (sc.isRowRangeInVisibleArea(startRow, endRow) && sc.isColRangeInVisibleArea(startCol, endCol)) {
					var cellbox = _rangeBox(startRow, endRow, startCol, endCol);
					var position = geometry.getCellPosition(row, col);
					widget_ctx.clearRect(position.l, position.t, cellbox.w, cellbox.h);
					if (cellbox.crossFreezebar) {
						widget_ctx.save();
						widget_ctx.rect(position.l, position.t, cellbox.w, cellbox.h);
						widget_ctx.clip();
						freezebarBackground();
						widget_ctx.restore();
					}
					
					var pms = grid.getPermissions({sheetName: this.sheetName, startRow:row+1, endRow:row+1, endCol: col, startCol:col});
					if((pms.basic == websheet.Constant.PermissionType.EDITABLE && pms.ranges.length > 0)
						|| (pms.basic != websheet.Constant.PermissionType.EDITABLE && pms.ranges.length == 0)){
						widget_ctx.save();
						widget_ctx.globalAlpha = 0.15;
						var pattern = widget_ctx.createPattern(readOnlyImg,"repeat");
						widget_ctx.fillStyle = pattern;
						widget_ctx.fillRect(position.l, position.t, cellbox.w, cellbox.h);
						widget_ctx.restore();
					}
				}
			},
			
			turnOnUserIndicator: function(bOn, userId) {
				// summary:
				//		Turn on/off coediting highlight on given user;
				var userIndicatorTree = renderTree.userIndicator();
				if (userIndicatorTree && grid && grid.editor.hasColorShading) {
					// defect "49676: [FF]Cannot open the sidebar and comments do not pop up"
					// this method may be called before any grid rendering, thus the grid maybe 'undefined';
					var users = userIndicatorTree.root().children;
					if (users) {
						for (var idx = 0, len = users.length; idx < len; idx++) {
							var node = users[idx];
							var user = node.value;
							if (user == userId) {
								widget_ctx.save();
								widget_ctx.globalAlpha = 0.5;
								userHighlight(node, bOn);
								widget_ctx.restore();
								break;
							}
						}
					}
				}
			}
			
			//toImageData: function () {
				//return canvas;
			//}
		};
	};
	return {
		getRenderer: function (grid) {
			// summary:
			//		Return the instance of the grid renderer, give a grid to switch the rendering context
			if (instance == null) {
				instance = initialize();
			}
			if (grid != null) {
				instance.prepare(grid);
			}
			return instance;
		}
	};
})();
