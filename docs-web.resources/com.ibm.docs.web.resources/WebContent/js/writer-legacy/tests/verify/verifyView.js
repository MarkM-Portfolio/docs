dojo.provide("writer.tests.verify.verifyView");
dojo.require("writer.model.style.Styles");
dojo.require("writer.model.Settings");
dojo.require("writer.model.Relations");
dojo.require("writer.tests.common.subFuncForVerify");
// This function just used to verify paragraph without special indent, input a paragraph object
function verifyTableDom(tableObj,ownerId){

	var rowNumM= tableObj.rows.len;
	var colNumM= tableObj.cols.length;
	var rowNumD = 0;
	var colNumD = 0;
	var cellMatrixM = tableObj.getTableMatrix();
	var views = testGetObjView(tableObj,ownerId);
	var view = views.getFirst();

	while (view != null) {
		//verify table view width and dom width
		var tableStyleD = view.domNode;
		//doh.debug("verify table view"+tableStyleD);
		verifyEquals("verify table width between View and Dom", view.w, dojo.style(tableStyleD,"width"));
		//verify table style-border between model and dom
		var atr = ["borderLeft","borderRight","borderTop","borderBottom"];
		//"0.666667px solid rgb(0, 0, 0)"
		var objD =[];
		for(var i=0; i < atr.length ; i++){
			var str = dojo.style(tableStyleD,atr[i]);
			objD[i] = domBorderToObj(str);
		};
		var tableMObject = tableModelBorderToObj (tableObj);
	
	    for(var i=0 ; i<atr.length ; i++){
	    	//doh.is(tableMObject[i].width,objD[i].width);
	    	//verifyEquals("verify table border-width between Model and Dom", tableMObject[i].width, objD[i].width);
	    	//have some mistake need XieDan to modify code. I add this problem to the document.
	    	//doh.is(tableMObject[i].style,objD[i].style);
	    	verifyEquals("verify table border-style between Model and Dom", tableMObject[i].style, objD[i].style);
	    	//doh.is(tableMObject[i].color,objD[i].color);	
	    	verifyEquals("verify table border-color between Model and Dom", tableMObject[i].color, objD[i].color);
	    }    
		
		var tableD = tableStyleD.childNodes;
		var rowDs = tableD[0].childNodes;	
		//var tableRowNumD = rowDs.length;
		for (var x=0; x < rowDs.length ; x++){			
			var cellDs = rowDs[x].childNodes;
			//verify col
			colNumD = cellDs.length;
			//doh.is(colNumM,colNumD);
			verifyEquals("verify Column number between Model and Dom", colNumM, colNumD);
			for (var y=0; y < cellDs.length; y++){				
				var cellStyleD = cellDs[y].childNodes;
								
			    //var atrPadding = ["paddingLeft","paddingRight","paddingTop","paddingBottom"];
		       //TODO: verify padding between view and dom.
				// verify cell style-border between model and dom
		        var cellObjD =[];	
				for(var i=0;i < atr.length ; i++){
					
						var str = dojo.style(cellStyleD.item(x),atr[i]);
						cellObjD[i] = domBorderToObj(str);
						
				};
				// get cell model
		        var currentCellM = cellMatrixM.getCell(x,y);
		        var curCellMObj = cellModelBorderToObj (currentCellM);				
			    for(var i=0 ; i<atr.length ; i++){
			    	//doh.is(curCellMObj[i].width,cellObjD[i].width);
			    	//verifyEquals("verify cell border-width between Model and Dom", curCellMObj[i].width, cellObjD[i].width);
			    	//doh.is(curCellMObj[i].style,cellObjD[i].style);
			    	verifyEquals("verify cell border-style between Model and Dom", curCellMObj[i].style, cellObjD[i].style);
			    	//doh.is(curCellMObj[i].color,cellObjD[i].color);
			    	verifyEquals("verify cell border-color between Model and Dom", curCellMObj[i].color, cellObjD[i].color);
			    }
			    //Verify paragraph
			    var para= currentCellM.firstChild();
				while (para != null){
					verifyParagraph(para);
					para = para.next();					
				}
			}
		};
		rowNumD = rowNumD + rowDs.length;
		view = views.next(view);
	};
	//Verify row style,row span?....
	//doh.is(rowNumM,rowNumD);
	verifyEquals("verify Row number between Modle and Dom", rowNumM, rowNumD);
};
function verifyImageDom(imageObj,ownerId){
    
	common.tools.getDPI();
	var views = testGetObjView(imageObj,ownerId);
	var view = views.getFirst();
	
	var verifyImageAtt = function(imageObj,imageDs){
		var i = 0;
		while(i< imageDs.length){
			if (imageDs[i].tagName == "IMG"){
				var imageD = imageDs[i];
				break;
			};
			i++;				
		}
		if (!imageD){
			 throw ("not found target<img> DOM tag!");
		}
		var imageHeightcmM= imageObj.height;
		var imageHeightpxD= dojo.style(imageD,"height");
		if (imageHeightcmM){
		    var imageHeightM= common.tools.CmToPx(parseFloat(imageHeightcmM.substr(0,imageHeightcmM.length-2)));
		   // var hErrorPercent = imageHeightM - parseFloat(imageHeightpxD.substr(0,imageHeightpxD.length-2));
		    var hErrorPercent = imageHeightM - imageHeightpxD;
		   // doh.assertTrue(Math.abs(hErrorPercent) < 1 );
		    verifyTrue("verify image height between Model and Dom", Math.abs(hErrorPercent) < 1);
		}
		var imageWidthcmM= imageObj.width;
		var imageWidthpxD= dojo.style(imageD,"width");
		if (imageWidthcmM){			
			var imageWidthM= common.tools.CmToPx(parseFloat(imageWidthcmM.substr(0,imageWidthcmM.length-2)));
			//var wErrorPercent = imageWidthM - parseFloat(imageWidthpxD.substr(0,imageWidthpxD.length-2));
			var wErrorPercent = imageWidthM - imageWidthpxD;
			// doh.assertTrue(Math.abs(wErrorPercent) < 1 );	
			verifyTrue("verify image width between Model and Dom", Math.abs(wErrorPercent) < 1);
		}
	};
	var verifyImageStyle = function(){
		
		//TODO: add image position verification in here
		
	};
	
	while (view != null) {
		
		var imageTypeD = view.domNode;
		if (imageObj.modelType == "run.image"){
			var imageDs = imageTypeD.childNodes;		
			verifyImageAtt(imageObj,imageDs);
		}
		else{
			var imageStyleD = imageTypeD.childNodes;
			var imageDs= imageStyleD.childNodes;
			verifyImageAtt(imageObj,imageDs);
		}		
		view = views.next(view);
	};	
	
};
function verifyRunDom(runObj,ownerId){
	var views = testGetObjView(runObj,ownerId);
	var view = views.getFirst();
	
	var textD= '';
	var dom = view.domNode;
	if (dom) // Partial rendering will not render all dom
		textD += dom.textContent || dom.innerText || '';
	else
		textD += view.getText(view.start, view.length);
	
	if (runObj.modelType == "run.text") {
		//verify text content.
		var textM = runObj.getText(runObj.start, runObj.length);
		doh.is(textM, textD);
		
	}
}
function verifyListDom(targetLists,ownerId){
	
};
function verifyParagraph (para) {
	var getViewText = function(model) {
		var text = '';
		
		var allViews = model.getAllViews();
		for(var ownerId in allViews){
			var views = allViews[ownerId];
			var view = views.getFirst();
			while (view != null) {
				if (view.declaredClass == 'view.Tab')
					text += "\t";
				else if (view.declaredClass == 'view.Break')
					text += "\r";
				else {
					var dom = view.domNode;
					if (dom) // Partial rendering will not render all dom
						text += dom.textContent || dom.innerText || '';
					else
						text += view.getText(view.start, view.length);
				}
				view = views.next(view);
			}
		}
		doh.debug("text : " + text);
		return text;
	};
	
	if (para.text == undefined)
		return;

	var textLen = para.text.length;
	var hintLen = 0;

	var curStart = 0;
	// Verify text and properties
	para.hints.forEach(function(child) {
		// Ensure all hints are continuous
		doh.debug("child.modelType : "+ child.modelType);
		if(child.modelType == "run.bookMark")
			return;
		doh.is(child.start, curStart);
		hintLen += child.length;
		curStart = hintLen;
		if (child.modelType == "run.text") {
			//verify text content.
			var modelText = child.getText(child.start, child.length);
			var viewText = getViewText(child);
			viewText = viewText.replace(/\u00a0/g, "\u0020");
			var exception = null;
			try {
				doh.is(modelText, viewText);
				
//				doh.t(false);
			} catch (e) {
				exception = e;
				highlightPara(para);
			}
			if (exception)
				throw exception;
		//Verify span style properties
			var atts = ['font-weight','font-style','text-decoration','font-size','font-family','color','background-color'];
			            for(var i = 0; i < atts.length; i++)
			            {
			               if(!model[atts[i]])
			            	continue;
			                doh.is(model[atts[i]], dojo.style(domNode, atts[i]));
			            }
		}
	 });
	 // TODO verify list symbol
	 // TODO verify style and inline style
};
function verifyParagrphAlignment (ParaObj){
	var lines ;
	var allViews = ParaObj.getAllViews();
	for(var ownerId in allViews){
		var views = allViews[ownerId];
		var view = views.getFirst();
		while (view != null) {
				var dom = view.domNode;
				lines = view.lines;
				
				view = views.next(view);
		}
	}
	  var lineDom = dom.childNodes;
	  var paddingleft = dojo.style(lineDom[0],'paddingLeft');
	   console.log("paddingleft : "+paddingleft);
	  if (!paddingleft|| paddingleft == 'undefined')
	     paddingleft =  0;
	console.log("paddingleft : "+paddingleft);
	var PAlign_M = ParaObj.directProperty.getAlign();

	var temp = ParaObj.directProperty.indentLeft;
	var PIndentleft_M = common.tools.PtToPx(parseFloat(temp));
	console.log("PIndentleft_M : "+PIndentleft_M);
	var lineTextWidth = lines.getFirst().offsetX;
	console.log("lineTextWidth : "+lineTextWidth);
	// Calculate span length to get lineTextwidth 
	//for (var i= 0; i< spanDom.length; i++){
	//	lineTextWidth += parseFloat(spanDom[i].getBoundingClientRect().width);
	//}
	var lineWidth = dojo.style(dom.parentNode,'width');	
	console.log("lineWidth : "+lineWidth);
	var actualalignment = "";
	if (paddingleft == 0|| paddingleft == PIndentleft_M)  actualalignment = "left";
	else if ( paddingleft!=0 && lineWidth == paddingleft + lineTextWidth ) actualalignment = "right";
	else if (paddingleft!=0 && -5<(lineWidth - paddingleft*2 + lineTextWidth+ PIndentleft_M)<5) actualalignment = "centered" ;
	else actualalignment= "justified";
	console.log("actualalignment : "+actualalignment);
	doh.is(PAlign_M,actualalignment);

	return lineWidth;
};

function verifyBulletDom(targetObjs, ownerId){
	for (var i = 0; i < targetObjs.length ; i++ )
	{
		var views = testGetObjView(targetObjs[i], ownerId);
		var view = views.getFirst();
		var paraDom = view.domNode;
		var lineDom = paraDom.childNodes;
		var spanDom = lineDom[0].childNodes;
		var listDom = spanDom[0].childNodes;
		doh.debug("The target paragraph bullet symbol is: " + listDom[0].data);
		doh.is(targetObjs[i].listSymbols.txt.trim(), listDom[0].data);
		//doh.debug(targetObjs[i].getListSymbolProperty().style["font-family"]);
		//doh.is("Symbol", targetObjs[i].getListSymbolProperty().style["font-family"]);
	}
};

function verifyEditor(editor, paras) {
	var highlightPara = function(para) {
		var allViews = para.getAllViews();
		for(var ownerId in allViews){
			var views = allViews[ownerId];
			var view = views.getFirst();
			
			while (view != null) {
				var dom = view.domNode;
				if (dom) {
					dojo.style(dom, {
						"border" : "medium solid #FF0000"
					});
				} else {
					console.error("Error paragraph ID is:" + para.id);
				}
				view = views.next(view);
			}
		}
	};


	// modle: need a span object 
	var getSpanStyle = function(model) {
		var dom;
		var allViews = model.getAllViews();
		for(var ownerId in allViews){
			var views = allViews[ownerId];
			var view = views.getFirst();
			dom = view.domNode;
			var styleStr = dom.getAttribute('style');
			doh.debug("DomStyle : " + styleStr);
			var domObj = changeStyleStrtoObj(styleStr);
		
			//doh.debug("domObj : " + domObj);
		};
		
		return domObj;
	};
	var paraIndex = 0;
	if(paras)
	{
		for(var i = 0; i < paras.length; i++)
			
			verifyParagraph(paras[i]);
			//getLineDode(paras[i]);
	}	
	else
		{
	      var doc = editor.document;
	      var para = doc.firstChild();
	         while (para != null) {
		       paraIndex++;
		       verifyParagraph(para);
		       para = para.next();
	          }
		}
};