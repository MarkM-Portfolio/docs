dojo.provide("writer.tests.common.commonOperation");
//setup test environment related
/**
 * get document editor
 * @returns
 */
function testGetEditor(){
	var editor = window.testDoc1.pe.lotusEditor; 
	if (!editor) 
		throw("Editor is null!");
    return editor;
}
/**
 * get shell;
 * @returns
 */
function testGetShell(){
	var editor = testGetEditor(); 
	var shell = editor._shell;
	
	if (!shell) 
		throw(" Shell is null! ");
    return shell;
}
function testGetDocument(){
	var editor = testGetEditor(); 
	var doc = editor.document;

	if (!doc) 
		throw("Document variable is null!");
    return doc;
}
function testUpdateToolbarStatus(){
	window.testDoc1.dojo.publish(writer.EVENT.SELECTION_CHANGE);
}
function testUpdateDom(){
	var editor = testGetEditor(); 
	editor.updateManager.update(true);
	//doh.debug("update Dom by API test!");
}
function getTargetParagraph(parentObject,paraIndex){
	// get selection position
	if (paraIndex == null||paraIndex <= 0) paraIndex = 1;
	
	var targetO = parentObject.firstChild();
	var i=0;
	while(i< paraIndex-1){
		targetO = targetO.next();
		i++;
	}
	return targetO;
}

function getTargetParas(parentObj, paraIdx, paraNum){
	if(paraIdx == null || paraIdx <=0) paraIdx = 1;
	if(paraNum <= 0) throw ("No target paragraph! Please check your code.");
	var targetObjs = [];
	targetObjs[0] = parentObj.firstChild();
	var i = 0, j = 1;
	while(i < paraIdx -1){
		targetObjs[0] = targetObjs[0].next();
		i++;
	}
	while(j < paraNum){
		if(paraNum == 1) break;
		else {
			targetObjs[j] = targetObjs[(j-1)].next();
			j++;
		}	
	}
	return targetObjs;
	
}
/**
 * author: wuchaof
 * this function used to get the target operate table  
 * @param tableIndex
 *        table index under body,exp:  tow table in file, operate the second one,then table Index is 2.
 */

function getTargetTable(tableIndex,parentObject){
	if (tableIndex == null||tableIndex <= 0) 
		tableIndex = 1;
	if (parentObject == null||parentObject =="")
		parentObject= testGetDocument();
	
	var targetTable = null;
    if (parentObject.modelType == "document"){
    	var startO = parentObject.firstChild();	
	    var i=0;
	    while(startO){
		    if (startO.modelType != "table.table")
		    	startO = startO.next();
		    else {
			    i++;
			    if (i == tableIndex) {
				    targetTable= startO;	
				    break;		
			    }
		    }		
	    }
	  }	
    else 
    	throw("getTargetTable()'s parentObject is : "+ parentObject.modelType);
		
	if (!targetTable) 
		throw("Table not exists in file, pls check your test data/sample. Expected table: "+tableIndex+" . But actual table: "+i);
    return targetTable;
}


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
}


function getTableNeighbours(pos){
    var sIndex = pos[0].index;
    var eIndex = pos[1].index;
    var startO = pos[0].obj;
    var endO   = pos[1].obj;
    var tPrivious = "";
    var tNext = "";
    if (startO == endO ){
    	 if (sIndex == 0)
         	tPrivious= startO.previous();    
         else  tPrivious =startO;
     
         if (eIndex == 0)
         	tNext = endO;     	
         else tNext = "";
              //TODO: need to consider more.    	
    }else{
        if (sIndex == 0)
        	tPrivious= startO.previous();    
        else  tPrivious =startO;
    
        if (eIndex == 0)
        	tNext = endO;
    	
        else tNext = endO.next();   
    };	
    return [tPrivious,tNext]; 
};
/**
 * 
 * @param object: which paragraph/Cell contains the target image
 * @param imageNum: which image you want to operate;valid:1,2,3
 * @returns
 */
function getTargetImage(object,imageNum){
	var imageObj=null;
	var i=0;
	var currentP= object.firstChild();
	while(currentP){
	    var con = currentP.container;
	    con.forEach( function(run){
		    
		     if (run.modelType == "run.image"||run.modelType == "run.floatImage"||run.modelType == "run.sqImage"||run.modelType == "run.tbImage"){		
    	    	 i++;	
		         if (i== imageNum) {
		        	   imageObj = run; 		        	         
		         }
		         
		     }
	    });
	    currentP = currentP.next();
	}
	 if (!imageObj)throw("target image not exists. Expected imageNum: " +imageNum);
	 
	return imageObj;
}

/*
 * The function used to get the target hyperlink in one paragraph.
 */

function getTargetHyperlink(targetO, hyIdx){
	var hylkObj=null;
	var i=1;
	var fstChild = targetO.firstChild();
	while(fstChild){
		if(fstChild.modelType!="run.hyperlink") fstChild = fstChild.next();
		else {
			if(i = hyIdx){
				hylkObj = fstChild;
				break;
			}
			else {
				i++;
				fstChild = fstChild.next();
			}		
		}
	}
	
	 if (!hylkObj)throw("target hyperlink not exists.");
	 
	return hylkObj;
}


//selection related
/**
 * select content, pos can be got from writer.tests.common.getOperationPosition
 * @param pos: pos=[start, end],start={"obj":startO,"index":4}
 *        exp: start={"obj":startO,"index":4},end={"obj":startO,"index":4}
 *        
 */
function testGetSelection(pos){
    var shell = testGetShell();
    var selection = shell.getSelection();	
    selection.select(pos[0], pos[1]);
    //fore selection change immediately
    selection.selectionChange();
}

//view related
function testGetObjView(object,ownerId){
	var allViews = object.getAllViews();
	var views = allViews[ownerId];
	return views;
}
