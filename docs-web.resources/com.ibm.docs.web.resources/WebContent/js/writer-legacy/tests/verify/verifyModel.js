dojo.provide("writer.tests.verify.verifyModel");
/**
 * author: wu chao feng
 * date: 2013/
 * tests: to verify different objects' model
 * @param tableObj: target table object
 * @param expectedNeib
 * 
 * modify by: wu jing jing
 * date: 2013/09
 * add: 
 * 1.verifyHylkModel()
 * 2.variable suc & dif used to mark the compared result between actual & expect.
 * 3.function compare*() in table/image/runs model
 * change: verifyTableModel(), add doh.debug() to print the actual/expect table's row and col
 *
 */

var suc = "[successful]";
var dif = "[different]";
function verifyTableNeib(tableObj,expectedNeib){
	var tPreM = tableObj.previous();
	var tNextM = tableObj.next();
	doh.is(tPreM,expectedNeib[0]);
	doh.is(tNextM,expectedNeib[1]);	
};

function verifyTableModel(tableObj,tArray){
	var rowNumM= tableObj.rows.len;
	var colNumM= tableObj.cols.length;
	//doh.debug(compareRow() + " Actual Row Num: " + rowNumM + " && Expect Row Num: " + tArray[0]);
	//doh.debug(compareCol() + " Actual Col Num: " + colNumM + " && Expect Col Num: " + tArray[1]);	
	//doh.is(rowNumM,tArray[0]);
	//doh.is(colNumM,tArray[1]);
	verifyEquals("verify table row number between Actual insert and Model", tArray[0], rowNumM);
	verifyEquals("verify table column number between Actual insert and Model", tArray[1], colNumM);
	//TODO: verify table style while customized table supported
	testUpdateDom();
};

/**
 * 
 * @param imageObj: image object
 * @param expect(cm): {"height":"2.6","width":"2.6"}
 */
function verifyImageModel(imageObj,expect){
	 var heightM= imageObj.height;
	 var hErrorPercent= parseFloat(heightM.substr(0,heightM.length-2))-parseFloat(expect.height);
	 doh.assertTrue(Math.abs(hErrorPercent) < 0.1 );
	 function compareheight(){
		 if(Math.abs(hErrorPercent) < 0.1){
			 return suc;
		 } else return dif;
	 }
	 doh.debug(compareheight() + "height");	 
	 var widthM= imageObj.width;
	 var wErrorPercent= parseFloat(widthM.substr(0,widthM.length-2))-parseFloat(expect.width);
	 doh.assertTrue(Math.abs(wErrorPercent) < 0.1 );
	 function compareWidth(){
		 if(Math.abs(wErrorPercent) < 0.1){
			 return suc;
		 } else return dif;
	 }
	 doh.debug(compareWidth()+ "width");
	
     
	//TODO: verify table style while customized table supported

};
/**
 * verify link text's style and link src, and print actual/expect result
 * @param hylkObj: get target hyperlink object
 * @param expect: expected style and src
 */

function verifyHylkModel(hylkObj,expect){
	 var linkNum = 0;
	 var fstChild = hylkObj.firstChild();
	 var styleList = fstChild.getStyle();
	 function compareColor(){
		 if(styleList.color == expect.Forecolor){
			 return suc;
		 }else return dif;
	 }
	 function compareDeco(){
		 if(styleList["text-decoration"] == expect.textDecoration){
			 return suc;
		 }else return dif;
	 }
	 function compareSrc(){
		 if(hylkObj.src == expect.src){
			 return suc;
		 }else return dif;
	 }
	 doh.debug(compareColor() + " actual: "+styleList.color + " && " + "expect: "+ expect.Forecolor);
     doh.debug(compareDeco() + " actual: "+styleList["text-decoration"] + " && " + "expect: "+ expect.textDecoration);
     doh.debug(compareSrc() + " actual: "+ hylkObj.src + " && " + "expect: "+ expect.src);
     doh.is(styleList.color, expect.Forecolor);
     doh.is(styleList["text-decoration"],expect.textDecoration);
     doh.is(hylkObj.src, expect.src);
	//TODO: verify table style while customized table supported
};

function verifyBullets(targetObjs,expect){
	//TODO: need to verify the bullet type.
	if(expect == ""){
		for(var i = 0; i < targetObjs.length; i++){
			//doh.debug(targetObjs[i].listSymbols.txt); 
			//don't support symbol type.
			doh.debug("Is this paragraph adds bullet? "+ targetObjs[i].isBullet());
		}
	} else{
		for(var i = 0; i < targetObjs.length; i++){
			//doh.debug(targetObjs[i].listSymbols.txt);
			doh.debug("Is this paragraph adds bullet? "+ targetObjs[i].isBullet());
			doh.is(expect, targetObjs[i].getListSymbolProperty().style["font-family"]);
		}	
	} 	
};

function verifyMultilevelBullet(targetObjs,expect,expectBullet){
	for(var i = 0; i < targetObjs.length; i++){
		doh.debug("The list multilevel is: " + targetObjs[i].getListLevel());
		doh.is(expect, targetObjs[i].getListLevel());
		doh.debug("The list txt is: " + targetObjs[i].listSymbols.txt.trim());
		doh.is(expectBullet[i], targetObjs[i].listSymbols.txt.trim());
	}
};
	
function verifyRuns(targetRuns,stylename,expect){
	testUpdateToolbarStatus();
	function compareStyle(){
		if(targetRuns[i].getStyle()[stylename] == expect){
			return suc;
		}else return dif;
	}
	
	doh.debug("expect: "+ expect);
	var runIndex = targetRuns.length;
	doh.debug("runIndex: "+ runIndex);
	var i=0;
	var tag = false;
	while(i< runIndex){
		if (targetRuns[i].modelType == "run.image") continue;
		else{
		doh.debug("run"+ i +" : " +targetRuns[i].getText(targetRuns[i].start, targetRuns[i].length));
		tag=true;
		//if(expect == 'normal' && expect != targetRuns[i].getStyle()[stylename])
			//debugger;
		doh.debug("actual value "+i+": "+ targetRuns[i].getStyle()[stylename]);
		doh.debug(compareStyle());
		doh.is(targetRuns[i].getStyle()[stylename],expect);	
		//doh.is(4,5);
		
		
		}
		i++;
	}
	if(!tag){
		throw "None runs been judged,please check test code.";
	}
	testUpdateDom();
	
}

function verifyParagraph(ParaObj){
	//1.verify alignment/indent/paragraph border/paragraph space....
	//2. verify text/text properties
	
};
function verifyEditorModel(editor, paras) {
	//if paras is not null, verify object provided in paras, 
	//else verify whole object in editor
	if(paras)
	{
		for(var i = 0; i < paras.length; i++)
			if (paras[i].modelType == "run.text")  verifyRun(paras[i]);
			else if (paras[i].modelType == "paragraph") verifyParagraph(paras[i]);
			else if (paras[i].modelType == "table.table") verifyTable(paras[i]);
			else doh.debug("There is no code to verify this type modle : " + paras[i].modelType);
			
	}	
	else
		{
		  var objIndex = 0;
	      var doc = editor.document;
	      var obj = doc.firstChild();
	         while (obj != null) {
	            objIndex++;
				if (obj.modelType == "paragraph")verifyParagraph(paras[i]);				
				else if (obj.modelType == "table.table") verifyTable(paras[i]);
				else doh.debug("There is no code to verify this type modle : " + obj.modelType); 
		    
				obj = obj.next();
	          }
		};
  

};