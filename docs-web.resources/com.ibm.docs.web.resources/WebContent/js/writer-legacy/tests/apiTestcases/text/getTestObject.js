dojo.provide("writer.tests.apiTestcases.text.getTestObject");

/** This function is used for select first level object, object modelType is : paragraph or table 
 * if start/end object is paragraph, then startindex/endIndex is the start/end index in paragraph.
 * if start/end object is table, then startindex/endIndex is the start/end row of table.
 * @param objIndex 
 *        object start select,valid 1,2,3,4,...
 * @param objNum 
 *        how many object select, valid 1,2,3,4...
 * @param startindex
 *        index, valid 0,1,2,3 ...
 * @param endIndex 
 *        index, valid 0,1,2,3 ...
 */
function OperationSelection(objIndex,objNum,startindex,endIndex){
	//1. get editor
	var editor = window.testDoc1.pe.lotusEditor; 
	var shell = editor._shell;
	var doc = editor.document;
	var selection = shell.getSelection();	
	//2. get selection position
	if (objIndex == null||objIndex <= 0) objIndex = 1;
	if (objNum == null||objNum <= 0)objNum = 1;
	var startO = doc.firstChild();
	
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
	selection.select(pos1, pos2);
	var pos = [pos1,pos2];
	return pos;
}
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
		        	 targetRuns.push( run );
		         }
	         });
	    }
	    else{
	    	if (i == 0){	   
	    	     con.forEach(function(run){	    	
			          if( run.start >= startindex){
			        	  targetRuns.push( run );
			           }
		         });	    	
	         }
	        else if ( objNum-i > 1){
	    	     con.forEach(function(run){	 			    
	    	    	 	targetRuns.push( run );			     
		         });
	         }
	        else {
	        	 con.forEach(function(run){	    	
				     if( run.start >= 0  && (run.start+ run.length)<= endIndex){
				    	 targetRuns.push( run );
				     }
			     });
	         }
	    }
	    i++;
	    currentObj = currentObj.next();
	  }	   
      return targetRuns;
}
function getRunsInPos(pos,objNum){
      var targetRuns = VerifyObject(pos,objNum);
      return targetRuns;
}
function VerifyRuns(targetRuns,stylename,expect){
	doh.debug("expect: "+ expect);
	var runIndex = targetRuns.length;
	doh.debug("runIndex: "+ runIndex);
	var i=0;
	var tag = false;
	while(i< runIndex){
		//doh.debug("run"+ i +" : " +targetRuns[i].getText(targetRuns[i].start, targetRuns[i].length));
		tag=true;
		//if(expect == 'normal' && expect != targetRuns[i].getStyle()[stylename])
		//	debugger;
		doh.is(expect,targetRuns[i].getStyle()[stylename]);	
		doh.debug("actual value "+i+": "+ targetRuns[i].getStyle()[stylename]);
		i++;
	}
	if(!tag){
		throw "None runs been judged,please check test code.";
	}
	
	
}

