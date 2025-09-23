dojo.provide("writer.tests.apiTestcases.table.tableCommon");
/**
 * author: wuchaof
 * this function used to get the target operate table  
 * @param tableIndex
 *        table index under body,exp:  tow table in file, operate the second one,then table Index is 2.
 */
function getTargetTable(tableIndex){
	var editor = window.testDoc1.pe.lotusEditor; 
	var shell = editor._shell;
	var doc = editor.document;
	//var doc = document;
	if (tableIndex == null||tableIndex <= 0) tableIndex = 1;
	var targetTable = null;
	var startO = doc.firstChild();	
	var i=0;
	while(startO){
		if (startO.modelType != "table.table")startO = startO.next();
		else {
			i++;
			if (i == tableIndex) {
				targetTable= startO;	break;		
			}
		}		
	}
	if (!targetTable) 
		throw("Table not exists in file, pls check your test data/sample. Expected table: "+tableIndex+" . But actual table: "+i);
    return targetTable;
};
/**
 * This function used to find the cell you specified in some table
 * @param tableObj
 *        Table object.
 * @param sCellRow
 *        Row number of target cell 
 * @param sCellCol
 *        Col number of target cell 
 */
function getTargetCell(tableObj,sCellRow,sCellCol){
	 var tRow = null;
	 var tCell = null;
	 tableObj.rows.forEach(function(row){
		 if (sCellRow == row.getRowIdx()) tRow = row;			
	 });
	 if (!tRow)throw("start row not exists in table. Expected rowNum: " +sCellRow);
	
	 tRow.cells.forEach(function(cell){
		 if (sCellCol == cell.getColIdx()) tCell = cell;
	 });
	 if (!tCell)throw("target cell not exists in table. Expected rowNum: " +sCellCol);
     return tCell;
};
/**
 * author: wuchaof
 * this function used to select range in table.
 * @param tableIndex
 *        table to operate. valid: 1,2,3....
 * @param startCell
 *        ["row":1,"col":2,"paraIndex":1,"sIndex":0]
 * @param endCell
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
};
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
};
/**
 * this function used to get position array while start pos and end pos in same cell
 * @param parentObject
 * @param objIndex
 * @param objNum
 * @param startindex
 * @param endIndex
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
};
/**
 * this function used to get all of the runs in one cell, 
 * if pos is null, then get all runs in cell
 * else get run in pos
 * @param tCell: cell object
 * @param pos : array get from 'posInParagraph'
 * @param objNum: paragraph number
 * @returns {Array}
 */
function getRunsInCell(tCell){
	var runs = [];
	
	    
	
	return runs;
};
function getAllRunsInCellRange(pos,tableIndex,startCell,endCell){
	var runs= [];
	var runIndex= 0;
	var sObj= pos[0];
	var eObj= pos[1];
	if (sObj.obj.modelType == "table.cell"&&eObj.obj.modelType == "table.cell"){
       var table = getTargetTable(tableIndex); 
       var matrix= table.getTableMatrix();
	   var cells = matrix.getCellsInRange(startCell.row,startCell.col,endCell.row,endCell.col);
	   cells.foreach(function(cell){
		   cell.foreach(function(child){
			    var con = child.container;
			    con.forEach(function(run){	    	
		           	  runs[runIndex] = run;
			          runIndex++;
		           
	            });	    	
		    });
	   });
	   
	}
	else if(sObj.obj.modelType == "paragraph"&&eObj.obj.modelType == "paragraph"){
		var objNum= endCell.paraIndex - startCell.paraIndex +1;
		runs = getRunsInPos(pos,objNum);
	}
	else{
		throw("getAllRunsInCellRange(pos): get unexpected pos array, pls double check.");
	}
	var runs = [];
	return runs;
};