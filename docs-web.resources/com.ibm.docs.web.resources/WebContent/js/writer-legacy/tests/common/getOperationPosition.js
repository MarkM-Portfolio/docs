dojo.provide("writer.tests.common.getOperationPosition");

/**
 * author: wuchaof
 * this function used to select range in table.
 * @param tableIndex
 *        table to operate. valid: 1,2,3....
 * @param startCell
 *        valid: 0,1,2...
 *        ["row":1,"col":2,"paraIndex":1,"sIndex":0]
 * @param endCell
 *        valid: 0,1,2...
 *        ["row":1,"col":2,"paraIndex":2,"eIndex":4]
 * @returns {Array}
 */

function selectInFile(tableIndex,startCell,endCell){
	var pos =null;
	//1. get editor
	var editor = window.testDoc1.pe.lotusEditor; 
	var shell = editor._shell;
	var doc = editor.document;
	var selection = shell.getSelection();	
	//2. get selection position
    var targetTable = getTargetTable(tableIndex);
	 var sCellRow = startCell.row;
	 var sCellCol = startCell.col;
	 var sPara = startCell.paraIndex;
	 var sIndex = startCell.sIndex;
	 var eCellRow = endCell.row;
	 var eCellCol = endCell.col;
	 var ePara = endCell.paraIndex;
	 var eIndex = endCell.eIndex;
	
	 
	 if (sCellRow == eCellRow && sCellCol == eCellCol){
		 //select content in one cell
         var tCell =getTargetCell(targetTable,sCellRow,sCellCol);
	     var objNum = ePara-sPara+1;
		 pos= posInParagraph(tCell,sPara,objNum,sIndex,eIndex);
	 }
	 else{		
		 pos= posInTable(targetTable,sCellRow,sCellCol,eCellRow,eCellCol);
	 }
	selection.select(pos[0], pos[1]);
	return pos;
}

/**
 * This function used to find the position array while both start pos and end pos are in same table
 * @param targetTable
 * @param sCellRow
 *        row number of start cell
 * @param sCellCol
 *        column number of start cell
 * @param eCellRow
 *        row number of start cell
 * @param eCellCol
 *        column number of start cell
 * @returns {Array}
 */

function posInTable(targetTable,sCellRow,sCellCol,eCellRow,eCellCol){
	 var sRow = null;
	 var eRow = null;
	 var sCell = null;
	 var eCell = null;
	 targetTable.rows.forEach(function(row){
		 if (sCellRow == row.getRowIdx()) sRow = row;
		 if (eCellRow == row.getRowIdx()) eRow = row; 
	 });
	 if (!sRow)throw("start row not exists in table. Expected rowNum: " +sCellRow);
	 if (!eRow)throw("end row not exists in table. Expected rowNum: " +eCellRow);
	 sRow.cells.forEach(function(cell){
		 if (sCellCol == cell.getColIdx()) sCell = cell;
	 });
	 if (!sCell)throw("start cell not exists in table. Expected rowNum: " +sCellCol);
	 eRow.cells.forEach(function(cell){
		 if (eCellCol == cell.getColIdx()) eCell = cell;
	 });
	 if (!eCell)throw("end cell not exists in table. Expected rowNum: " +eCellCol);
	 var pos1 = {'obj': sCell, 'index': ""};
	 var pos2 = {'obj': eCell, 'index': ""};
	 pos = [pos1,pos2];
	 return pos;
}

/**
 *  This function is used for select first level object, object modelType is : paragraph or table 
 * if start/end object is paragraph, then startindex/endIndex is the start/end index in paragraph.
 * if start/end object is table, then startindex/endIndex is the start/end row of table.
 * @param parentObject
 *        document or table cell
 * @param objIndex
 * object start select,valid 1,2,3,4,..
 * @param objNum:  how many object select, valid 1,2,3,4...
 * @param startindex: index, valid 0,1,2,3 ...
 * @param endIndex: index, valid 0,1,2,3 ...
 * @returns {Array}
 */
function posInParagraph(parentObject,objIndex,objNum,startindex,endIndex){
	
	// get selection position
	if (objIndex == null||objIndex <= 0) objIndex = 1;
	if (objNum == null||objNum <= 0)objNum = 1;
	var startO = parentObject.firstChild();
	var i=0;
	while(i< objIndex-1){
		startO = startO.next();
		i++;
	}
	 i = 0;
	var endO = startO;
	while (i < objNum -1 && endO != null){
		endO = endO.next();
		i++;
	}
	if (startindex < 0||startindex == null|| startindex > startO.getLength()) startindex = 0;
	if (endIndex <0 ||endIndex ==null|| endIndex > endO.getLength() ) endIndex = endO.getLength();
	var pos1 = {'obj': startO, 'index': startindex};
	var pos2 = {'obj': endO, 'index': endIndex};
	var pos = [pos1,pos2];
	return pos;
}

function posInDoc(parentObject, objIndex, objNum){
	if (objIndex == null||objIndex <= 0) objIndex = 1;
	if (objNum == null||objNum <= 0)objNum = 1;
	var startO = parentObject.firstChild();
	var i =0;
	while(i < objIndex-1){
		startO = startO.next();
		i++;
	}
	i = 0;
	var endO = startO;
	while(i < objNum-1 && endO != null){
		endO = endO.next();
		i++;
	}
	var pos1 = {'obj': startO, 'index': ""};
	var pos2 = {'obj': endO, 'index': ""};
	var pos = [pos1, pos2];
	return pos;
}

