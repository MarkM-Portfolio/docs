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

dojo.provide("websheet.grid.GridStage");
dojo.require("websheet.grid.RenderTree");

dojo.declare("websheet.grid.GridStage", [], {
	// Module:
	//		websheet/canvas/GridStage
	// Description:
	//		Manage layers on the stage.
	//
	//		|----------------------------------------------|
	//		|-------------Basic canvas layer---------------|
	
	// About this "_cellInfoMap", we'll store information related with the grid's "logic cells";
	// In canvas grid, there's actually no 'cell nodes' in the grid, but we need to get the "attached cell info" on some cell nodes with a handy and highly efficient way.
	// What we called "attached cell info" includes (but not limited to):
	//	1. (MO, SR-ACC)Is there any comments attached to this 'cell' ?
	//	2. (MO, )Does the 'cell' contains 'unsupported formula' ?
	//	3. (SR-ACC, )Is some one else currently editing this 'cell' ?
	//	4. (SR-ACC, )Any filter header trigger attached to this 'cell' ? 
	// ...
	//	(MO) means the mouse over handler cares about this,
	//	(SR-ACC) means the 'screen reader information collector (for a11y) cares about this.
	//
	//	These informations must have been generated when the grid render finished,
	//		we intend to store them here in the "_cellInfoMap" with the following pattern:
	//		"RowIndex_ColIndex"		:		{
	//												comments	:	{},
	//												unsupported	:	true | false,
	//												locked		:	true | false,
	//												...
	//										},
	//	Detailed structure depends on you, row indexes are 0-based to keep compliant with other grid managers, column indexes are 1-base for the same reason.
	//	For example:
	//		{ "0_1"	:	{comments : "bla bla...I don't care."}}
	//		means, the cell in row 1 column 1 (that's A1 actually) contains comments and nothing else.
	//	We will provide getters/setters later in this class.
	//	We originally intend to use this structure to quickly get cell information in "MouseOverCell handler" and "screen reader information collector";
	//
	_cellInfoMap		:		{},
	//
	constructor: function () {
	},
	
	clearStage: function () {
		// clear the canvas layer before re-draw.
		this.renderer.clear();
		// clear the cell info map, they're to be re-generated;
		this._cellInfoMap = {};
	},
	
	cellContainsComments: function (rowIndex, colIndex) {
		// summary:
		//		Get the attached cell information, make sure the cell is in current visible area, otherwise you'll faile.
		// returns:
		//		Return the predefined comments structure stored in the CellInfoMap, you can check the return value against 'null' to see if there're any comments
		//			on this cell, or you may need to read the actually comments content in the return value.
		var value = this._cellInfoMap[rowIndex + "_" + colIndex];
		if (value) {
			return value.comments;
		}
	},
	
	cellContainsFilter: function (rowIndex, colIndex) {
		// summary:
		//		Filter info is not collected into CellInfoMap;
		//		It's trivial, easy to judge, and only useful for screen reader when a11y enabled. 
		var filter = this.editor.getAutoFilterHdl().getFilter(this.sheetName), filterRange = null;
		if (filter && (filterRange = filter.getRange())) {
			var rangeInfo = filterRange._getRangeInfo();
			if (colIndex >= rangeInfo.startCol && colIndex <= rangeInfo.endCol && rowIndex == rangeInfo.startRow - 1) {
				return true;
			}
		}
	},
	
	cellContainsList: function (rowIndex, colIndex) {
		var dvRange = websheet.Utils.getDataValidation4Cell(this.sheetName, rowIndex + 1, colIndex, true);
		if(!dvRange)
			return false;
		var dataValidation = dvRange.data;
		if(dataValidation && dataValidation.isShowList())
			return true;
		return false;
	},
	
	cellContainsDVPrompt: function (rowIndex, colIndex) {
		var dvRange = websheet.Utils.getDataValidation4Cell(this.sheetName, rowIndex + 1, colIndex, true);
		if(!dvRange)
			return false;
		var dataValidation = dvRange.data;
		if(dataValidation && dataValidation.getPrompt())
			return true;
		return false;
	},
	
	cellContainsFormula: function (rowIndex, colIndex) {
		var store = this._cellInfoMap[rowIndex + "_" + colIndex];
		if (store) {
			return (store.formula);
		}
	},
	
	cellContainsUnsupportedFormula: function (rowIndex, colIndex) {
		var store = this._cellInfoMap[rowIndex + "_" + colIndex];
		if (store) {
			return (store.unsupported);
		}
	},
	
	cellContainsLink: function (rowIndex, colIndex) {
		var store = this._cellInfoMap[rowIndex + "_" + colIndex];
		if (store) {
			return (store.link);
		}
	},
	
	cellTextRect: function(rowIndex, colIndex){
		var store = this._cellInfoMap[rowIndex + "_" + colIndex];
		if (store) {
			return (store.textRect);
		}
	},
	
	cellCoeditingInfo: function (rowIndex, colIndex) {
		var store = this._cellInfoMap[rowIndex + "_" + colIndex];
		if (store) {
			return (store.coediting);
		}
	},
	
	cellLocked: function (rowIndex, colIndex) {
		var store = this._cellInfoMap[rowIndex + "_" + colIndex];
		if (store) {
			return (store.locked);
		}
	},
	
	cellMergeInfo: function (rowIndex, colIndex) {
		var store = this._cellInfoMap[rowIndex + "_" + colIndex];
		if (store) {
			return (store.merge);
		}
	},
	
	cellWrapInfo: function (rowIndex, colIndex) {
		var store = this.geometry._wrapInfoMap[rowIndex + ""];
		if (store) {
			store = store[colIndex + ""];
			if (store) {
				return (store.wrap);
			}
		}
	},
	
	cellShowValue: function (rowIndex, colIndex) {
		var store = this._cellInfoMap[rowIndex + "_" + colIndex];
		if (store) {
			return (store.value);
		}
	},
	
	fullRender: function () {
		if (this._updateSuspended) {
			this._updateOnResume = true;
			return false;
		}
		// re-render all the areas on the canvas layer.
		var 
			renderRange,
			geometry = this.geometry,
			scroller = this.scroller,
			leftTopRowBoundary = -1,
			leftTopColBoundary = -1,
			leftBottomRowBoundary = -1,
			rightTopColBoundary = -1,
			freezeRowCollapsed = false,
			freezeColCollapsed = false,
			scrollRowCollapsed = false,
			scrollColCollapsed = false
			;
		this.clearStage();
		// switch to current data grid, prepare to render
		this.renderer.prepare(this);
		// construct render-tree for each view.
		if (this.freezeRow > 0) {
			// render freeze rows first
			if (this.freezeCol > 0) {
				// left top
				if ((renderRange = geometry.calculateFrameRange(1, 1, geometry.getGridHeight(true), geometry.getGridWidth(true)))) {
					if (renderRange.endRow > this.freezeRow) {
						if (geometry.getFreezeHeight() > geometry.freezeBarSize) {
							renderRange.endRow = this.freezeRow;
						} else {
							freezeRowCollapsed = true;
						}
					} else {
						scrollRowCollapsed = true;
					}
					if (renderRange.endCol > this.freezeCol) {
						if (geometry.getFreezeWidth() > geometry.freezeBarSize) {
							renderRange.endCol = this.freezeCol;
						} else {
							freezeColCollapsed = true;
						}
					} else {
						scrollColCollapsed = true;
					}
					if (!freezeRowCollapsed && !freezeColCollapsed) {
						this.renderer.buildRenderTree(renderRange).renderContent();
						leftTopRowBoundary = renderRange.endRow;
						leftTopColBoundary = renderRange.endCol;
					}
				}
			} else {
				// we have no chance to check if the freeze row area is collapsed if the freeze column is 0
				// Usually we do this check when calculating frame range for the top-left area, 
				// when the freeze column is 0 and the top-left area frame calculation is skipped, do this check here:
				if (geometry.getFreezeHeight() <= geometry.freezeBarSize) {
					freezeRowCollapsed = true;
				}
			}
			if (!freezeRowCollapsed && !scrollColCollapsed) {
				// right top
				if ((renderRange = geometry.calculateFrameRange(1, scroller.firstVisibleCol, leftTopRowBoundary > 0 ? 0 : geometry.getGridHeight(true), geometry.getScrollableWidth()))) {
					if (leftTopRowBoundary > 0) {
						renderRange.endRow = leftTopRowBoundary;
					} else {
						if (renderRange.endRow > this.freezeRow) {
							if (geometry.getFreezeHeight() > geometry.freezeBarSize) {
								renderRange.endRow = this.freezeRow;
							}
						} else {
							scrollRowCollapsed = true;
						}
					}
					scroller.updateVision({lc : renderRange.endCol});
					this.renderer.buildRenderTree(renderRange).renderContent();
					rightTopColBoundary = renderRange.endCol;
					if (leftTopRowBoundary < 0) {
						leftTopRowBoundary = renderRange.endRow;
					}
				}
			}
		}
		if (!scrollRowCollapsed) {
			if (this.freezeCol > 0) {
				// left bottom
				if ((renderRange = geometry.calculateFrameRange(scroller.firstVisibleRow + 1, 1, geometry.getScrollableHeight(), leftTopColBoundary > 0 ? 0 : geometry.getGridWidth(true)))) {
					if (leftTopColBoundary > 0) {
						renderRange.endCol = leftTopColBoundary;
					} else {
						if (renderRange.endCol > this.freezeCol) {
							if (geometry.getFreezeWidth() > geometry.freezeBarSize) {
								renderRange.endCol = this.freezeCol;
							} else {
								freezeColCollapsed = true;
							}
						} else {
							scrollColCollapsed = true;
						}
					}
					if (!freezeColCollapsed) {
						scroller.updateVision({lr : renderRange.endRow - 1});
						this.renderer.buildRenderTree(renderRange).renderContent();
						leftBottomRowBoundary = renderRange.endRow;
						leftTopColBoundary = renderRange.endCol;
					}
				}
			}
			if (!scrollColCollapsed) {
				// right bottom
				if ((renderRange = geometry.calculateFrameRange(scroller.firstVisibleRow + 1, scroller.firstVisibleCol, leftBottomRowBoundary > 0 ? 0 : geometry.getScrollableHeight(), 
						rightTopColBoundary > 0 ? 0 : geometry.getScrollableWidth()))) {
					if (leftBottomRowBoundary > 0) {
						renderRange.endRow = leftBottomRowBoundary;
					} else {
						scroller.updateVision({lr : renderRange.endRow - 1});
					}
					if (rightTopColBoundary > 0) {
						renderRange.endCol = rightTopColBoundary;
					} else {
						scroller.updateVision({lc : renderRange.endCol});
					}
					this.renderer.buildRenderTree(renderRange).renderContent();
				}
			}
		}
		var self = this;
		// Calculate frame range can not fill the scrollable area, in this case the rows from current 'lastVisibleRow' to 'MaxRow' are all hidden;
		// Update the geometry height array to 0 in this case, the event decoration relies on this;
		if (geometry.quickRowHeight(scroller.firstVisibleRow, scroller.lastVisibleRow) < geometry.getScrollableHeight()) {
			if (scroller.lastVisibleRow - scroller.firstVisibleRow > 1 && geometry._heightArray[scroller.lastVisibleRow + 1] == null) {
				// In another timer
				var start = scroller.lastVisibleRow + 1;
				var end = self.editor.getMaxRow() - 1;
				setTimeout(function () {
					geometry.updateRow(start, end, 0);
				});
			}
		}
		//
		// content render complete, publish measured rows height change;
		// move this step before content rendering;
		geometry.publishRowsUpdate();
		//
		// render headers
		this.renderer.renderSheetHeader();
		this.renderer.renderHeader();
		// render widgets at last
		this.renderer.renderWidgets();
		this.scrollRowCollapsed = scrollRowCollapsed;
		this.scrollColCollapsed = scrollColCollapsed;
		if (scrollRowCollapsed || scrollColCollapsed) {
			// give a warnning message to notify the user to unfreeze the sheet, the screen is not big enough to fully display 
			// the frozen panes, thus the scrollable aera can not be scrolled;
			setTimeout(function () {
				self.editor.getFreezeHdl().showWarningMessage(self.editor.nls.FW_WINDOW_TOO_SMALL);
			});
		}
		return true;
	},
	
	insertCellInfo: function (row, col, key, info) {
		// summary:
		//		Insert cell info to the map;
		// row, col are indexes;
		// key, string;
		//		They should be the following string:
		//		"comments",
		//		"filter",
		//		"value",
		//		"formula",
		//		"locked",
		//		"unsupported",
		//		"link",
		//		"coediting"
		//		"wrap"
		// info, value related with the key;
		var map, indexKey, value;
		if (key == 'wrap') {
			map = this.geometry._wrapInfoMap;
			indexKey = row + "";
			value = map[indexKey];
			if (value == null) {
				value = map[indexKey] = {};
			}
			indexKey = col + "";
			map = value[indexKey];
			if (map == null) {
				map = value[indexKey] = {};
			}
			map[key] = info;
		} else {
			map = this._cellInfoMap;
			indexKey = row + "_" + col;
			value = map[indexKey];
			if (value == null) {
				value = map[indexKey] = {};
			}
			value[key] = info;
		}
	},
	
	partialRenderFromRow: function (targetRow) {
		// summary:
		//		Use the given row index as the new 'first visible row' and render out the grid.
		//		First, we move the entire canvas upwards and then append new contents to the bottom, in this we we called 'partial row render' it can be faster than the
		//		full render.
		// targetRow:
		//		0-based row index.
		var
			scroller = this.scroller,
			renderer = this.renderer,
			geometry = this.geometry,
			rowLeft,
			rowTop,
			targetLeft,
			targetTop,
			width,
			height,
			clearHeight,
			newEdge,
			renderRange
			;
		console.assert((targetRow > scroller.firstVisibleRow && targetRow < scroller.lastVisibleRow), "Invalid target when partial render from row!");
		console.time("partial render from row");
		rowTop = geometry.getCellPosition(targetRow, 1).t;
		targetLeft = rowLeft = 0;
		if (this.freezeRow > 0) {
			targetTop = geometry.getFreezeHeight() + geometry.GRID_HEADER_HEIGHT;
		} else {
			targetTop = 0;
		}
		scroller.updateVision({fr: targetRow});
		renderer.shiftCanvas(rowLeft, rowTop, geometry.getGridWidth(), geometry.getGridHeight() - rowTop, targetLeft, targetTop);
		clearHeight = rowTop - geometry.GRID_HEADER_HEIGHT - geometry.getFreezeHeight();
		clearHeight += geometry.quickRowHeight(scroller.lastVisibleRow);
		renderer.clear(0, geometry.getGridHeight() - clearHeight, geometry.getGridWidth(), clearHeight);
		newEdge = scroller.lastVisibleRow;
		if (this.freezeCol > 0) {
			if (renderRange = geometry.calculateFrameRange(newEdge, 1, clearHeight, geometry.getGridWidth(true))) {
				scroller.updateVision({lr: renderRange.endRow - 1});
				renderer.buildRenderTree(renderRange).renderContent();
			}
		}
		if (renderRange = geometry.calculateFrameRange(newEdge, scroller.firstVisibleCol, clearHeight, geometry.getGridWidth(true))) {
			scroller.updateVision({lr: renderRange.endRow - 1});
			renderer.buildRenderTree(renderRange).renderContent();
		}
		renderer.renderHeader().renderWidgets();
		console.timeEnd("partial render from row");
	},
	
	partialRenderFromCol: function (targetCol) {
		
	},
	
	/**
	 * Resize the overlay content view size
	 * should be triggered when window resize, row/column resize and freeze bar move
	 */
	resizeContentView: function() {
		this.contentViews.style.left = this.boxSizing.l; 
		if (this.isMirrored) {
			this.basicLayer.style.left = this.widgetLayer.style.left = this.contentViews.style.left =
				this.yScrollNode.offsetLeft + this.yScrollNode.offsetWidth + "px";

			this.basicLayer.style.position = "absolute"; 
		}
		this.contentViews.style.top = this.boxSizing.t;
	},
	
	/*dojo.Deferred*/requestUpdate: function (bSync) {
		// summary:
		//		Use a timer to lazy update the grid, currently trigger a full-render here.
		// bSync:
		//		Boolean, flag to indicates if it's a synchronous update;
		// returns:
		//		dojo.Deferred, you can add call back if you need;
		// notice:
		//		If bSync is true, will not return deferred;
		var context = this;
		if (context._lazyUpdateTimer != null) {
			clearTimeout(context._lazyUpdateTimer);
			context._lazyUpdateTimer = null;
		}
		if (bSync) {
			return context._lazyFullUpdate();
		}
		if (!context.deferredUpdate) {
			context.deferredUpdate = new dojo.Deferred();
			var signal = dojo.aspect.after(context, 'fullRender', function () {
				if (!context._updateSuspended) {
					signal.remove();
					context.deferredUpdate.resolve();
					context.deferredUpdate = null;
				}
			});
		}
		if (context._updateSuspended) {
			// no matter sync or not, currently we can not render the grid;
			context._updateOnResume = true;
		} else {
			context._lazyUpdateTimer = setTimeout(dojo.hitch(context, context._lazyFullUpdate), 10);
		}
		return context.deferredUpdate;
	},
	
	/*dojo.Deferred*/requestWidgetsUpdate: function (bSync) {
		// summary:
		//		Used to update the widgets layer in data grid, same effect with the calling of "updateUI" in data grid, but in
		//		asynchronous way;
		// returns:
		//		will return a dojo.Deferred if you're calling it asynchronously;
		var context = this;
		if (bSync) {
			return this.updateUI();
		}
		if (context.deferredUpdate || context.deferredWidgetsUpdate) {
			return context.deferredUpdate || context.deferredWidgetsUpdate;
		}
		context.deferredWidgetsUpdate = new dojo.Deferred();
		var signal = dojo.aspect.after(context, "updateUI", function () {
			signal.remove();
			context.deferredWidgetsUpdate.resolve();
			context.deferredWidgetsUpdate = null;
		});
		setTimeout(function () {
			context.updateUI();
		}, this.deferredTimeOut || 200);
		return context.deferredWidgetsUpdate;
	},
	
	resumeUpdate: function () {
		// summary:
		//		Resume grid update, will trigger an update if there're update request during suspend;
		this._updateSuspended = false;
		if (this._updateOnResume == true) {
			this._lazyFullUpdate();
			this._updateOnResume = false;
		}
		return this;
	},
	
	suspendUpdate: function () {
		// summary:
		//		Suspend grid update, if this is called, make sure to resume!
		//		Prevent data grid from render in all cases;
		return (this._updateSuspended = true) && this;
	},
	
	setLoadingOverlay: function() {
		// summary:
		//		When partial loading, set an overlay DIV on the data grid to prevent user click or scroll to un-loaded area;
		if (this._loadingRowIndex != null) {
			var cellGeom = this.geometry.getCellPosition(this._loadingRowIndex - 1, 1);
			if (cellGeom.top < 0) {
				cellGeom.top = 0;
			}
			var cellTop = cellGeom.t;
			var gridBottom = this.gridRect.bottom;
			var gridRight = this.gridRect.right;
			var height = gridBottom - cellTop;

			// draw overlay from [(x, y)]: (0, cellTop) ~ (gridRight, gridBottom)
			this._bOverlay = true;
			if (this._overlay) {
				dojo.style(this._overlay, "display", "block");
				dojo.style(this._overlayNotice, "display", "block");
			} else {
				var node = this._overlay = dojo.doc.createElement('div');
				dojo.addClass(node, "loadingOverlay");
				this.contentViews.appendChild(node);
				node = this._overlayNotice = dojo.doc.createElement('h1');
				dojo.addClass(node, "loadingOverlayNotice");
				node.innerHTML = this.editor.nls["LOADING_MORE_DOCUMENT"];
				this.contentViews.appendChild(node);
			}
			
			// re-position overlay
			dojo.style(this._overlay, {
				left: 0 + "px",
				top: cellTop + "px"
			});
			
			// re-position the notice
			dojo.style(this._overlayNotice, {
				left: 30 + "px",
				top: cellGeom.t + "px"
			});

			// re-size overlay
			dojo.contentBox(this._overlay, { w: gridRight, h: height });
			
		} else {
			if (this._bOverlay) {
				dojo.style(this._overlay, "display", "none");
				dojo.style(this._overlayNotice, "display", "none");
				this._bOverlay = false;
			}
		}
	},
	
	_lazyFullUpdate: function () {
		this._lazyUpdateTimer = null;
		// If currently selected, (activated)
		//this.editor.getPartialCalcManager().calcVisibleFormula();//Defect 43520, undo other sheet operation makes visible sheet formula changes
		if (this.editor.getWorksheetContainer().getCurrentWorksheet() == this) {
			if (!this._updateSuspended) {
				this.fullRender();
				this.updateUI();
			} else {
				var self = this;
				if (!self._updateOnResume) {
					self._updateOnResume = true;
				}
				var signal = dojo.aspect.after(this, 'fullRender', function () {
					if (!self._updateSuspended) {
						signal.remove();
						self.updateUI();
					}
				});
				if (this.deferredUpdate) {
					return this.deferredUpdate;
				} else {
					return this.requestUpdate();
				}
			}
		}
		return true;
	}
});