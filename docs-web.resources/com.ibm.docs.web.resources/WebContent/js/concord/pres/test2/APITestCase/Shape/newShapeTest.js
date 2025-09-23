dojo.provide("concord.pres.test2.APITestCase.Shape.newShapeTest");
dojo.require("concord.pres.test2.common.commonOperation");
dojo.require("concord.pres.test2.Util");
dojo.require("concord.pres.test2.shape.shapeOperation");

doh.register("newShapeTest", [ 
	function createShaperect() {
		
		var testFunc = function(){ 
				var shapeType = "rect";
				console.info("NewShape type is" + shapeType);
				var testDocWindow = window.testDoc1;
    			var slideEditor = getSlideEditor(testDocWindow);
    			shapesarrbeforeArr=getAllShapes(slideEditor);
    			var shapeNumberBefore =shapesarrbeforeArr.length;
    			//new a shape
    			var sp_node  = createShape(slideEditor, shapeType);
    			var sp_id = dojo.attr(sp_node.mainNode, "id");
    			var shapesarr=getAllShapes(slideEditor);
    			var shapeTypeResult = getShapeType(sp_node);
    			//verify shape type
    			verifyEquals("Get shape Type:", shapeTypeResult, shapeType);
    			//verify shape number in slide
    			var shapeNumberAfter = shapesarr.length;
    			verifyEquals("Get  all shape numbers:", shapeNumberBefore+1, shapeNumberAfter);
    			//input string in shape
    			selectShape(sp_node);
    			var spedit_node = enterEditMode(sp_node,testDocWindow);
    			var defaulttextinShape = getTextInEditObject(testDocWindow,spedit_node);
    			var inputText = "New rectangle Shape";
    			setTextInEditObject(testDocWindow,spedit_node,inputText);
    			var TextInShape = getTextInEditObject(testDocWindow,spedit_node);
    			verifyEquals("Get shape text:", TextInShape, inputText);
    			
    			//delete string in Shape
    			selectShape(sp_node);
    			spedit_node = enterEditMode(sp_node,testDocWindow);
    			cleanTextInEditObject(testDocWindow,spedit_node);
    			TextInShape = getTextInEditObject(testDocWindow,spedit_node);
    			verifyEquals("Get the shape text after delete:", defaulttextinShape, TextInShape);
    			
    			
    			//delete shape
    			selectShape(sp_node);
    			deleteShape(slideEditor);
    			var shapesarr = getAllShapes(slideEditor);
    			verifyEquals("Get  all shape numbers after delete:", shapeNumberBefore, shapesarr.length);
    			
    			//New a shape before refresh
    			sp_node  = createShape(slideEditor, shapeType);
    			//set shape fill color for the new shape
    			selectShape(sp_node);
    			var color = '#'+('00000'+(Math.random()*0x1000000<<0).toString(16)).substr(-6); 
    			setFill(slideEditor,color);
    			
    			//verify the color
    			var expectColor = getFill(sp_node);
    			verifyEquals("Get shape color after changed:", expectColor, color);
    			
    			//refresh page
        		refreshDoc(testDocWindow);
        			
        		var checkShape = function (){
        			testDocWindow = window.testDoc1;
        			slideEditor = getSlideEditor(testDocWindow);
        			var shapesarrafterRefresh=getAllShapes(slideEditor);
        			verifyEquals("Get  all shape numbers after refresh:", shapeNumberBefore+1, shapesarrafterRefresh.length);
        			verifyNotEquals("Get the shape after refresh:", null, sp_node);
        			selectShape(shapesarrafterRefresh[shapesarrafterRefresh.length-1]);
        			deleteShape(slideEditor);
        			endTest(testDocWindow, "createShaperect");
        			};
        			loadFinished(testDocWindow,checkShape);
    			
		};
		
		startTest("newShapeTest", "createShaperect", "sample", testFunc, "newShape.pptx");
	},
	
	function createShapeellipse() {
		
		var testFunc = function(){ 
				var shapeType = "ellipse";
				console.info("NewShape type is" + shapeType);
				var testDocWindow = window.testDoc1;
    			var slideEditor = getSlideEditor(testDocWindow);
    			shapesarrbeforeArr=getAllShapes(slideEditor);
    			var shapeNumberBefore =shapesarrbeforeArr.length;
    			//new a shape
    			var sp_node  = createShape(slideEditor, shapeType);
    			var sp_id = dojo.attr(sp_node.mainNode, "id");
    			var shapesarr=getAllShapes(slideEditor);
    			var shapeTypeResult = getShapeType(sp_node);
    			//verify shape type
    			verifyEquals("Get shape Type:", shapeTypeResult, shapeType);
    			//verify shape number in slide
    			var shapeNumberAfter = shapesarr.length;
    			verifyEquals("Get  all shape numbers:", shapeNumberBefore+1, shapeNumberAfter);
    			//input string in shape
    			selectShape(sp_node);
    			var spedit_node = enterEditMode(sp_node,testDocWindow);
    			var defaulttextinShape = getTextInEditObject(testDocWindow,spedit_node);
    			var inputText = "New rectangle Shape";
    			setTextInEditObject(testDocWindow,spedit_node,inputText);
    			var TextInShape = getTextInEditObject(testDocWindow,spedit_node);
    			verifyEquals("Get shape text:", TextInShape, inputText);
    			
    			//delete string in Shape
    			selectShape(sp_node);
    			spedit_node = enterEditMode(sp_node,testDocWindow);
    			cleanTextInEditObject(testDocWindow,spedit_node);
    			TextInShape = getTextInEditObject(testDocWindow,spedit_node);
    			verifyEquals("Get the shape text after delete:", defaulttextinShape, TextInShape);
    			
    			
    			//delete shape
    			selectShape(sp_node);
    			deleteShape(slideEditor);
    			var shapesarr = getAllShapes(slideEditor);
    			verifyEquals("Get  all shape numbers after delete:", shapeNumberBefore, shapesarr.length);
    			
    			//New a shape before refresh
    			sp_node  = createShape(slideEditor, shapeType);
    			
    			//set shape fill color for the new shape
    			selectShape(sp_node);
    			var color = '#'+('00000'+(Math.random()*0x1000000<<0).toString(16)).substr(-6); 
    			setFill(slideEditor,color);
    			
    			//verify the color
    			var expectColor = getFill(sp_node);
    			verifyEquals("Get shape color after changed:", expectColor, color);
    			
    			//refresh page
        		refreshDoc(testDocWindow);
        			
        		var checkShape = function (){
        			testDocWindow = window.testDoc1;
            		slideEditor = getSlideEditor(testDocWindow);
        			var shapesarrafterRefresh=getAllShapes(slideEditor);
        			verifyEquals("Get  all shape numbers after refresh:", shapeNumberBefore+1, shapesarrafterRefresh.length);
        			verifyNotEquals("Get the shape after refresh:", null, sp_node);
        			selectShape(shapesarrafterRefresh[shapesarrafterRefresh.length-1]);
        			deleteShape(slideEditor);
        			endTest(testDocWindow, "createShapeellipse");
            			
        			};
        			loadFinished(testDocWindow,checkShape); 
    			
		};
		
		startTest("newShapeTest", "createShapeellipse", "sample", testFunc, "newShape.pptx");
	},

	function createShapetriangle() {
		
		var testFunc = function(){ 
				var shapeType = "triangle";
				console.info("NewShape type is" + shapeType);
				var testDocWindow = window.testDoc1;
    			var slideEditor = getSlideEditor(testDocWindow);
    			shapesarrbeforeArr=getAllShapes(slideEditor);
    			var shapeNumberBefore =shapesarrbeforeArr.length;
    			//new a shape
    			var sp_node  = createShape(slideEditor, shapeType);
    			var sp_id = dojo.attr(sp_node.mainNode, "id");
    			var shapesarr=getAllShapes(slideEditor);
    			var shapeTypeResult = getShapeType(sp_node);
    			//verify shape type
    			verifyEquals("Get shape Type:", shapeTypeResult, shapeType);
    			//verify shape number in slide
    			var shapeNumberAfter = shapesarr.length;
    			verifyEquals("Get  all shape numbers:", shapeNumberBefore+1, shapeNumberAfter);
    			//input string in shape
    			selectShape(sp_node);
    			var spedit_node = enterEditMode(sp_node,testDocWindow);
    			var defaulttextinShape = getTextInEditObject(testDocWindow,spedit_node);
    			var inputText = "New rectangle Shape";
    			setTextInEditObject(testDocWindow,spedit_node,inputText);
    			var TextInShape = getTextInEditObject(testDocWindow,spedit_node);
    			verifyEquals("Get shape text:", TextInShape, inputText);
    			
    			//delete string in Shape
    			selectShape(sp_node);
    			spedit_node = enterEditMode(sp_node,testDocWindow);
    			cleanTextInEditObject(testDocWindow,spedit_node);
    			TextInShape = getTextInEditObject(testDocWindow,spedit_node);
    			verifyEquals("Get the shape text after delete:", defaulttextinShape, TextInShape);
    			
    			
    			//delete shape
    			selectShape(sp_node);
    			deleteShape(slideEditor);
    			var shapesarr = getAllShapes(slideEditor);
    			verifyEquals("Get  all shape numbers after delete:", shapeNumberBefore, shapesarr.length);
    			
    			//New a shape before refresh
    			sp_node  = createShape(slideEditor, shapeType);
    			
    			//set shape fill color for the new shape
    			selectShape(sp_node);
    			var color = '#'+('00000'+(Math.random()*0x1000000<<0).toString(16)).substr(-6); 
    			setFill(slideEditor,color);
    			
    			//verify the color
    			var expectColor = getFill(sp_node);
    			verifyEquals("Get shape color after changed:", expectColor, color);
    			
    			//refresh page
        		refreshDoc(testDocWindow);
        			
        		var checkShape = function (){
        			testDocWindow = window.testDoc1;
            		slideEditor = getSlideEditor(testDocWindow);
        			var shapesarrafterRefresh=getAllShapes(slideEditor);
        			verifyEquals("Get  all shape numbers after refresh:", shapeNumberBefore+1, shapesarrafterRefresh.length);
        			verifyNotEquals("Get the shape after refresh:", null, sp_node);
        			selectShape(shapesarrafterRefresh[shapesarrafterRefresh.length-1]);
        			deleteShape(slideEditor);
        			endTest(testDocWindow, "createShapetriangle");
            			
        			};
        			loadFinished(testDocWindow,checkShape); 
    			
		};
		
		startTest("newShapeTest", "createShapetriangle", "sample", testFunc, "newShape.pptx");
	},
	
	function createShapediamond() {
		
		var testFunc = function(){ 
				var shapeType = "diamond";
				console.info("NewShape type is" + shapeType);
				var testDocWindow = window.testDoc1;
    			var slideEditor = getSlideEditor(testDocWindow);
    			shapesarrbeforeArr=getAllShapes(slideEditor);
    			var shapeNumberBefore =shapesarrbeforeArr.length;
    			//new a shape
    			var sp_node  = createShape(slideEditor, shapeType);
    			var sp_id = dojo.attr(sp_node.mainNode, "id");
    			var shapesarr=getAllShapes(slideEditor);
    			var shapeTypeResult = getShapeType(sp_node);
    			//verify shape type
    			verifyEquals("Get shape Type:", shapeTypeResult, shapeType);
    			//verify shape number in slide
    			var shapeNumberAfter = shapesarr.length;
    			verifyEquals("Get  all shape numbers:", shapeNumberBefore+1, shapeNumberAfter);
    			//input string in shape
    			selectShape(sp_node);
    			var spedit_node = enterEditMode(sp_node,testDocWindow);
    			var defaulttextinShape = getTextInEditObject(testDocWindow,spedit_node);
    			var inputText = "New rectangle Shape";
    			setTextInEditObject(testDocWindow,spedit_node,inputText);
    			var TextInShape = getTextInEditObject(testDocWindow,spedit_node);
    			verifyEquals("Get shape text:", TextInShape, inputText);
    			
    			//delete string in Shape
    			selectShape(sp_node);
    			spedit_node = enterEditMode(sp_node,testDocWindow);
    			cleanTextInEditObject(testDocWindow,spedit_node);
    			TextInShape = getTextInEditObject(testDocWindow,spedit_node);
    			verifyEquals("Get the shape text after delete:", defaulttextinShape, TextInShape);
    			
    			
    			//delete shape
    			selectShape(sp_node);
    			deleteShape(slideEditor);
    			var shapesarr = getAllShapes(slideEditor);
    			verifyEquals("Get  all shape numbers after delete:", shapeNumberBefore, shapesarr.length);
    			
    			//New a shape before refresh
    			sp_node  = createShape(slideEditor, shapeType);
    			
    			//set shape fill color for the new shape
    			selectShape(sp_node);
    			var color = '#'+('00000'+(Math.random()*0x1000000<<0).toString(16)).substr(-6); 
    			setFill(slideEditor,color);
    			
    			//verify the color
    			var expectColor = getFill(sp_node);
    			verifyEquals("Get shape color after changed:", expectColor, color);
    			
    			//refresh page
        		refreshDoc(testDocWindow);
        			
        		var checkShape = function (){
        			testDocWindow = window.testDoc1;
            		slideEditor = getSlideEditor(testDocWindow);
        			var shapesarrafterRefresh=getAllShapes(slideEditor);
        			verifyEquals("Get  all shape numbers after refresh:", shapeNumberBefore+1, shapesarrafterRefresh.length);
        			verifyNotEquals("Get the shape after refresh:", null, sp_node);
        			selectShape(shapesarrafterRefresh[shapesarrafterRefresh.length-1]);
        			deleteShape(slideEditor);
        			endTest(testDocWindow, "createShapediamond");
            			
        			};
        			loadFinished(testDocWindow,checkShape); 
    			
		};
		
		startTest("newShapeTest", "createShapediamond", "sample", testFunc, "newShape.pptx");
	},

	function createShapestar5() {
		
		var testFunc = function(){ 
				var shapeType = "star5";
				console.info("NewShape type is" + shapeType);
				var testDocWindow = window.testDoc1;
    			var slideEditor = getSlideEditor(testDocWindow);
    			shapesarrbeforeArr=getAllShapes(slideEditor);
    			var shapeNumberBefore =shapesarrbeforeArr.length;
    			//new a shape
    			var sp_node  = createShape(slideEditor, shapeType);
    			var sp_id = dojo.attr(sp_node.mainNode, "id");
    			var shapesarr=getAllShapes(slideEditor);
    			var shapeTypeResult = getShapeType(sp_node);
    			//verify shape type
    			verifyEquals("Get shape Type:", shapeTypeResult, shapeType);
    			//verify shape number in slide
    			var shapeNumberAfter = shapesarr.length;
    			verifyEquals("Get  all shape numbers:", shapeNumberBefore+1, shapeNumberAfter);
    			//input string in shape
    			selectShape(sp_node);
    			var spedit_node = enterEditMode(sp_node,testDocWindow);
    			var defaulttextinShape = getTextInEditObject(testDocWindow,spedit_node);
    			var inputText = "New rectangle Shape";
    			setTextInEditObject(testDocWindow,spedit_node,inputText);
    			var TextInShape = getTextInEditObject(testDocWindow,spedit_node);
    			verifyEquals("Get shape text:", TextInShape, inputText);
    			
    			//delete string in Shape
    			selectShape(sp_node);
    			spedit_node = enterEditMode(sp_node,testDocWindow);
    			cleanTextInEditObject(testDocWindow,spedit_node);
    			TextInShape = getTextInEditObject(testDocWindow,spedit_node);
    			verifyEquals("Get the shape text after delete:", defaulttextinShape, TextInShape);
    			
    			
    			//delete shape
    			selectShape(sp_node);
    			deleteShape(slideEditor);
    			var shapesarr = getAllShapes(slideEditor);
    			verifyEquals("Get  all shape numbers after delete:", shapeNumberBefore, shapesarr.length);
    			
    			//New a shape before refresh
    			sp_node  = createShape(slideEditor, shapeType);
    			
    			//set shape fill color for the new shape
    			selectShape(sp_node);
    			var color = '#'+('00000'+(Math.random()*0x1000000<<0).toString(16)).substr(-6); 
    			setFill(slideEditor,color);
    			
    			//verify the color
    			var expectColor = getFill(sp_node);
    			verifyEquals("Get shape color after changed:", expectColor, color);
    			
    			//refresh page
        		refreshDoc(testDocWindow);
        			
        		var checkShape = function (){
        			testDocWindow = window.testDoc1;
            		slideEditor = getSlideEditor(testDocWindow);
        			var shapesarrafterRefresh=getAllShapes(slideEditor);
        			verifyEquals("Get  all shape numbers after refresh:", shapeNumberBefore+1, shapesarrafterRefresh.length);
        			verifyNotEquals("Get the shape after refresh:", null, sp_node);
        			selectShape(shapesarrafterRefresh[shapesarrafterRefresh.length-1]);
        			deleteShape(slideEditor);
        			endTest(testDocWindow, "createShapestar5");
            			
        			};
        			loadFinished(testDocWindow,checkShape); 
    			
		};
		
		startTest("newShapeTest", "createShapestar5", "sample", testFunc, "newShape.pptx");
	},
	
	function createShaperoundRect() {
		
		var testFunc = function(){ 
				var shapeType = "roundRect";
				console.info("NewShape type is" + shapeType);
				var testDocWindow = window.testDoc1;
    			var slideEditor = getSlideEditor(testDocWindow);
    			shapesarrbeforeArr=getAllShapes(slideEditor);
    			var shapeNumberBefore =shapesarrbeforeArr.length;
    			//new a shape
    			var sp_node  = createShape(slideEditor, shapeType);
    			var sp_id = dojo.attr(sp_node.mainNode, "id");
    			var shapesarr=getAllShapes(slideEditor);
    			var shapeTypeResult = getShapeType(sp_node);
    			//verify shape type
    			verifyEquals("Get shape Type:", shapeTypeResult, shapeType);
    			//verify shape number in slide
    			var shapeNumberAfter = shapesarr.length;
    			verifyEquals("Get  all shape numbers:", shapeNumberBefore+1, shapeNumberAfter);
    			//input string in shape
    			selectShape(sp_node);
    			var spedit_node = enterEditMode(sp_node,testDocWindow);
    			var defaulttextinShape = getTextInEditObject(testDocWindow,spedit_node);
    			var inputText = "New rectangle Shape";
    			setTextInEditObject(testDocWindow,spedit_node,inputText);
    			var TextInShape = getTextInEditObject(testDocWindow,spedit_node);
    			verifyEquals("Get shape text:", TextInShape, inputText);
    			
    			//delete string in Shape
    			selectShape(sp_node);
    			spedit_node = enterEditMode(sp_node,testDocWindow);
    			cleanTextInEditObject(testDocWindow,spedit_node);
    			TextInShape = getTextInEditObject(testDocWindow,spedit_node);
    			verifyEquals("Get the shape text after delete:", defaulttextinShape, TextInShape);
    			
    			
    			//delete shape
    			selectShape(sp_node);
    			deleteShape(slideEditor);
    			var shapesarr = getAllShapes(slideEditor);
    			verifyEquals("Get  all shape numbers after delete:", shapeNumberBefore, shapesarr.length);
    			
    			//New a shape before refresh
    			sp_node  = createShape(slideEditor, shapeType);
    			
    			//set shape fill color for the new shape
    			selectShape(sp_node);
    			var color = '#'+('00000'+(Math.random()*0x1000000<<0).toString(16)).substr(-6); 
    			setFill(slideEditor,color);
    			
    			//verify the color
    			var expectColor = getFill(sp_node);
    			verifyEquals("Get shape color after changed:", expectColor, color);
    			
    			//refresh page
        		refreshDoc(testDocWindow);
        			
        		var checkShape = function (){
        			testDocWindow = window.testDoc1;
            		slideEditor = getSlideEditor(testDocWindow);
        			var shapesarrafterRefresh=getAllShapes(slideEditor);
        			verifyEquals("Get  all shape numbers after refresh:", shapeNumberBefore+1, shapesarrafterRefresh.length);
        			verifyNotEquals("Get the shape after refresh:", null, sp_node);
        			selectShape(shapesarrafterRefresh[shapesarrafterRefresh.length-1]);
        			deleteShape(slideEditor);
        			endTest(testDocWindow, "createShaperoundRect");
            			
        			};
        			loadFinished(testDocWindow,checkShape); 
    			
		};
		
		startTest("newShapeTest", "createShaperoundRect", "sample", testFunc, "newShape.pptx");
	},
	
	function createShapewedgeRectCallout() {
		
		var testFunc = function(){ 
				var shapeType = "wedgeRectCallout";
				console.info("NewShape type is" + shapeType);
				var testDocWindow = window.testDoc1;
    			var slideEditor = getSlideEditor(testDocWindow);
    			shapesarrbeforeArr=getAllShapes(slideEditor);
    			var shapeNumberBefore =shapesarrbeforeArr.length;
    			//new a shape
    			var sp_node  = createShape(slideEditor, shapeType);
    			var sp_id = dojo.attr(sp_node.mainNode, "id");
    			var shapesarr=getAllShapes(slideEditor);
    			var shapeTypeResult = getShapeType(sp_node);
    			//verify shape type
    			verifyEquals("Get shape Type:", shapeTypeResult, shapeType);
    			//verify shape number in slide
    			var shapeNumberAfter = shapesarr.length;
    			verifyEquals("Get  all shape numbers:", shapeNumberBefore+1, shapeNumberAfter);
    			//input string in shape
    			selectShape(sp_node);
    			var spedit_node = enterEditMode(sp_node,testDocWindow);
    			var defaulttextinShape = getTextInEditObject(testDocWindow,spedit_node);
    			var inputText = "New rectangle Shape";
    			setTextInEditObject(testDocWindow,spedit_node,inputText);
    			var TextInShape = getTextInEditObject(testDocWindow,spedit_node);
    			verifyEquals("Get shape text:", TextInShape, inputText);
    			
    			//delete string in Shape
    			selectShape(sp_node);
    			spedit_node = enterEditMode(sp_node,testDocWindow);
    			cleanTextInEditObject(testDocWindow,spedit_node);
    			TextInShape = getTextInEditObject(testDocWindow,spedit_node);
    			verifyEquals("Get the shape text after delete:", defaulttextinShape, TextInShape);
    			
    			
    			//delete shape
    			selectShape(sp_node);
    			deleteShape(slideEditor);
    			var shapesarr = getAllShapes(slideEditor);
    			verifyEquals("Get  all shape numbers after delete:", shapeNumberBefore, shapesarr.length);
    			
    			//New a shape before refresh
    			sp_node  = createShape(slideEditor, shapeType);
    			
    			//set shape fill color for the new shape
    			selectShape(sp_node);
    			var color = '#'+('00000'+(Math.random()*0x1000000<<0).toString(16)).substr(-6); 
    			setFill(slideEditor,color);
    			
    			//verify the color
    			var expectColor = getFill(sp_node);
    			verifyEquals("Get shape color after changed:", expectColor, color);
    			
    			//refresh page
        		refreshDoc(testDocWindow);
        			
        		var checkShape = function (){
        			testDocWindow = window.testDoc1;
            		slideEditor = getSlideEditor(testDocWindow);
        			var shapesarrafterRefresh=getAllShapes(slideEditor);
        			verifyEquals("Get  all shape numbers after refresh:", shapeNumberBefore+1, shapesarrafterRefresh.length);
        			verifyNotEquals("Get the shape after refresh:", null, sp_node);
        			selectShape(shapesarrafterRefresh[shapesarrafterRefresh.length-1]);
        			deleteShape(slideEditor);
        			endTest(testDocWindow, "createShapewedgeRectCallout");
            			
        			};
        			loadFinished(testDocWindow,checkShape); 
    			
		};
		
		startTest("newShapeTest", "createShapewedgeRectCallout", "sample", testFunc, "newShape.pptx");
	},
	
	function createShapehexagon() {
		
		var testFunc = function(){ 
				var shapeType = "hexagon";
				console.info("NewShape type is" + shapeType);
				var testDocWindow = window.testDoc1;
    			var slideEditor = getSlideEditor(testDocWindow);
    			shapesarrbeforeArr=getAllShapes(slideEditor);
    			var shapeNumberBefore =shapesarrbeforeArr.length;
    			//new a shape
    			var sp_node  = createShape(slideEditor, shapeType);
    			var sp_id = dojo.attr(sp_node.mainNode, "id");
    			var shapesarr=getAllShapes(slideEditor);
    			var shapeTypeResult = getShapeType(sp_node);
    			//verify shape type
    			verifyEquals("Get shape Type:", shapeTypeResult, shapeType);
    			//verify shape number in slide
    			var shapeNumberAfter = shapesarr.length;
    			verifyEquals("Get  all shape numbers:", shapeNumberBefore+1, shapeNumberAfter);
    			//input string in shape
    			selectShape(sp_node);
    			var spedit_node = enterEditMode(sp_node,testDocWindow);
    			var defaulttextinShape = getTextInEditObject(testDocWindow,spedit_node);
    			var inputText = "New rectangle Shape";
    			setTextInEditObject(testDocWindow,spedit_node,inputText);
    			var TextInShape = getTextInEditObject(testDocWindow,spedit_node);
    			verifyEquals("Get shape text:", TextInShape, inputText);
    			
    			//delete string in Shape
    			selectShape(sp_node);
    			spedit_node = enterEditMode(sp_node,testDocWindow);
    			cleanTextInEditObject(testDocWindow,spedit_node);
    			TextInShape = getTextInEditObject(testDocWindow,spedit_node);
    			verifyEquals("Get the shape text after delete:", defaulttextinShape, TextInShape);
    			
    			
    			//delete shape
    			selectShape(sp_node);
    			deleteShape(slideEditor);
    			var shapesarr = getAllShapes(slideEditor);
    			verifyEquals("Get  all shape numbers after delete:", shapeNumberBefore, shapesarr.length);
    			
    			//New a shape before refresh
    			sp_node  = createShape(slideEditor, shapeType);
    			
    			//set shape fill color for the new shape
    			selectShape(sp_node);
    			var color = '#'+('00000'+(Math.random()*0x1000000<<0).toString(16)).substr(-6); 
    			setFill(slideEditor,color);
    			
    			//verify the color
    			var expectColor = getFill(sp_node);
    			verifyEquals("Get shape color after changed:", expectColor, color);
    			
    			//refresh page
        		refreshDoc(testDocWindow);
        			
        		var checkShape = function (){
        			testDocWindow = window.testDoc1;
            		slideEditor = getSlideEditor(testDocWindow);
        			var shapesarrafterRefresh=getAllShapes(slideEditor);
        			verifyEquals("Get  all shape numbers after refresh:", shapeNumberBefore+1, shapesarrafterRefresh.length);
        			verifyNotEquals("Get the shape after refresh:", null, sp_node);
        			selectShape(shapesarrafterRefresh[shapesarrafterRefresh.length-1]);
        			deleteShape(slideEditor);
        			endTest(testDocWindow, "createShapehexagon");
            			
        			};
        			loadFinished(testDocWindow,checkShape); 
    			
		};
		
		startTest("newShapeTest", "createShapehexagon", "sample", testFunc, "newShape.pptx");
	},
	]);
