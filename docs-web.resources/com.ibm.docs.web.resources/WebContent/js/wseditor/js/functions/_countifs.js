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

dojo.provide("websheet.functions._countifs");
dojo.declare("websheet.functions._countifs", websheet.functions._countif, {
	
	/*Array*/_checkRangeSize: function (context, baseRange, prefixRange) {
		var values = this.args;
		var baseIdx = prefixRange ? 1 : 0;
		baseRange = baseRange ? baseRange : this._getRange(values[baseIdx]);
		var baseInfo = baseRange._getRangeInfo();
		var baseRowSize = baseInfo.endRow - baseInfo.startRow + 1;
		var baseColSize = baseInfo.endCol - baseInfo.startCol + 1;
		var deltas = new Array();
		deltas.push({row: 0, col:0, sheetName: baseInfo.sheetName});
		
		if (prefixRange) {
			var prefixInfo = prefixRange._getRangeInfo();
			var prefixRowSize = prefixInfo.endRow - prefixInfo.startRow + 1;
			var prefixColSize = prefixInfo.endCol - prefixInfo.startCol + 1;
			if (prefixRowSize != baseRowSize || prefixColSize != baseColSize) {
				throw websheet.Constant.ERRORCODE["519"];
			}
		}

		var i = baseIdx + 2;
		var len = values.length;
		var range;
		var info;
		for (; i < len; i += 2) {
			range =  this._getRange(values[i]);
			info = range._getRangeInfo();
			var rowSize = info.endRow - info.startRow + 1;
			var colSize = info.endCol - info.startCol + 1;
			if (colSize != baseColSize || rowSize != baseRowSize) {
				throw websheet.Constant.ERRORCODE["519"];
			}
			deltas.push({row: info.startRow - baseInfo.startRow, 
				col: info.startCol - baseInfo.startCol,
				sheetName: info.sheetName});
		}
		return deltas;
	},
	
	/*void*/_satisfy: function (context, delta, criteria, preSatisfyCells) {
		var sheetName = delta.sheetName;
		var len = preSatisfyCells.length;
		var i = len - 1;
		for (; i >=0; i--) {
			var pos = preSatisfyCells[i];
			var rowSize = pos.rowSize? pos.rowSize : 1;
			var colSize = pos.colSize? pos.colSize : 1;
			var parsedRef = new websheet.parse.ParsedRef(sheetName, pos.row + delta.row, 
					pos.col + delta.col,  pos.row + rowSize + delta.row - 1, 
					pos.col + colSize + delta.col - 1, websheet.Constant.RANGE_MASK);
			var range = new websheet.parse.Reference(parsedRef);
			var tempSatifyCells = this.getSatisfyCriteria(context, range, criteria);
			if (pos.rowSize && pos.colSize) { // range
				preSatisfyCells.splice(i, 1);
				dojo.forEach(tempSatifyCells, function(tempPos) {
					var basePos = {};
					basePos.row = tempPos.row - delta.row;
					basePos.col = tempPos.col - delta.col;
					if (tempPos.rowSize && tempPos.colSize) {
						basePos.rowSize = tempPos.rowSize;
						basePos.colSize = tempPos.colSize;
					}
					preSatisfyCells.push(basePos);	
				}, this);
				
			} else { // cell
				if (!tempSatifyCells.length) {
					preSatisfyCells.splice(i, 1);
				}
			}
		}
	},
	
	/*Array*/getSatisfyCells: function (context, baseRange, prefixRange) {
	    var deltas = this._checkRangeSize(context, baseRange, prefixRange);
	    var baseIdx = prefixRange ? 1 : 0;
	    
	    var satisfyCells = this.exec(context, baseIdx);

		var lastIdx = this.args.length - 1;
		var current = baseIdx + 2;
		var delta;
		var criteria;
		while (current < lastIdx) {
			if (satisfyCells.length === 0) {
				return null;
			}
			delta = deltas[Math.floor(current / 2)];
			criteria = this._getCriteria(this.args[current + 1]);
			this._satisfy(context, delta, criteria, satisfyCells);
			current += 2;
		}
		return satisfyCells;
	}
});