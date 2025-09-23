dojo.provide("writer.tests.common.getTargetVerifyObjects");

function verifyObject(pos,objNum){
	//4. get verify each target object
	if (objNum == null||objNum <= 0)objNum = 1;
	 var targetRuns =[];

	 var i =0;
	// currentObj = startO;
	 var currentObj = pos[0].obj;
	 var startindex = pos[0].index;
	 var endIndex = pos[1].index;
	 while (i < objNum && currentObj != null){	
	    var con = currentObj.container;	
	    if (objNum == 1){
	        con.forEach(function(run){	    	
		         if( run.start >= startindex  && (run.start+ run.length)<= endIndex){
		        	 targetRuns.push(run);
		        	
		         }
	         });
	    }
	    else{
	    	if (i == 0){	   
	    	     con.forEach(function(run){	    	
			          if( run.start >= startindex){
			        	  targetRuns.push(run);
			           }
		         });	    	
	         }
	        else if ( objNum-i > 1){
	    	     con.forEach(function(run){	 			    
	    	    	 targetRuns.push(run);		     
		         });
	         }
	        else {
	        	 con.forEach(function(run){	    	
				     if( run.start >= 0  && (run.start+ run.length)<= endIndex){
				    	 targetRuns.push(run);
				     }
			     });
	         }
	    }
	    i++;
	    currentObj = currentObj.next();
	  }	
	  if (!targetRuns) throw ("No Runs in need to be verified, exeCommand failed");
      return targetRuns;
};
function getRunsInPara(pos,objNum){
	if (objNum == null||objNum <= 0)objNum = 1;
	 var targetRuns =[];
	 var runIndex = 0;
	 var i =0;
	// currentObj = startO;
	 var currentObj = pos[0].obj;
	 var startindex = pos[0].index;
	 var endIndex = pos[1].index;
	 while (i < objNum && currentObj != null){	
	    var con = currentObj.container;	
	    if (objNum == 1){
	        con.forEach(function(run){	    	
		         if( run.start >= startindex  && (run.start+ run.length)<= endIndex){
		        	 targetRuns[runIndex] = run;
			        runIndex++;
		         }
	         });
	    }
	    else{
	    	if (i == 0){	   
	    	     con.forEach(function(run){	    	
			          if( run.start >= startindex){
			        	  targetRuns[runIndex] = run;
				           runIndex++;
			           }
		         });	    	
	         }
	        else if ( objNum-i > 1){
	    	     con.forEach(function(run){	 			    
	    	    	      targetRuns[runIndex] = run;
				          runIndex++;			     
		         });
	         }
	        else {
	        	 con.forEach(function(run){	    	
				     if( run.start >= 0  && (run.start+ run.length)<= endIndex){
				    	  targetRuns[runIndex] = run;
					      runIndex++;
				     }
			     });
	         }
	    }
	    i++;
	    currentObj = currentObj.next();
	  }	   
     return targetRuns;	
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

function getAllRunsInCellRange(pos,tableIndex,startCell,endCell){
	var runs= [];
	var runIndex= 0;
	var sObj= pos[0];
	var eObj= pos[1];
	if (sObj.obj.modelType == "table.cell"&&eObj.obj.modelType == "table.cell"){
       var table = getTargetTable(tableIndex); 
       var matrix= table.getTableMatrix();
	   var cells = matrix.getCellsInRange(startCell.row,startCell.col,endCell.row,endCell.col);
	   for (var i =0; i<cells.length; i++){
		       var child = cells[i].firstChild();
		       while(child){
		    	   var con = child.container;
		    	   if(con){		    	   
				        con.forEach(function(run){	  
				          if (run.modelType != "run.image"){
				           runs.push(run);
				          }
		                });
		    	   }				    
				child = child.next();
		       }
		  	   	  
	   };
	  	   
	}	else if(sObj.obj.modelType == "paragraph"&&eObj.obj.modelType == "paragraph"){
		      var objNum= endCell.paraIndex - startCell.paraIndex +1;
		      runs = getRunsInPara(pos,objNum);
	}	else 
		throw("getAllRunsInCellRange(pos): get unexpected pos array, pls double check.");

	return runs;
};
/**
 * suppose only para selected
 * @param pos
 * @returns
 */
function getAllLists(pos){
	 var currentObj = pos[0].obj;
	 var endObj = pos[1].obj;
	 var listsObjArr = [];
	 listsObjArr.push(currentObj);
	 while (currentObj != endObj){
		 currentObj = currentObj.next();
		 listsObjArr.push(currentObj);
	 }
	
	 return listsObjArr;
	 
}