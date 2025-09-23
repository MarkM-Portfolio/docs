dojo.provide("concord.pres.test2.APITestCase.updateTest");
dojo.require("concord.pres.test2.common.commonOperation");
dojo.require("concord.pres.PresTableUtil");
dojo.require("concord.pres.test2.Util");

doh.register("updateTest", [ 
	function createTable() {
		
		var testFunc = function(){ 
			console.log("enter paragraphUpdate");
			var testDocWindow = window.testDoc1;
			var slideEditor = getSlideEditor(testDocWindow);
			var tblContentBox  = testDocWindow.PresTableUtil.createTableFromMenu(slideEditor, true);
			verifyNotEquals("Create table from menu:", null, tblContentBox);
			
			var t_id = dojo.attr(tblContentBox.mainNode, "id");
			
			refreshDoc(testDocWindow);
			
			var checkTable = function (){
				var sorterDoc = getSorterDocument(testDocWindow);
				var tableNode = getElementById(sorterDoc, t_id);
				verifyNotEquals("Get the table after refresh:", null, tableNode);
				endTest(testDocWindow, "createTable");
			};
			loadFinished(testDocWindow,checkTable);
		};
		
		startTest("updateTest", "createTable", "sample", testFunc, "tableSample.pptx");
	},
	
	function createSlide(){
		var testFunc = function(){
			console.log("in createSlide");
			var testDocWindow = window.testDoc1;
			var num1 = getAllSlideNumbers(testDocWindow);
			createNewSlide(testDocWindow);
			var num2 = getAllSlideNumbers(testDocWindow);
			verifyEquals("Get all slide numbers after create slide:", num1+1, num2);
			
			refreshDoc(testDocWindow);
			
			var checkSlide = function (){
				var num3 = getAllSlideNumbers(testDocWindow);
				verifyEquals("Get  all slide numbers after refresh:", num1+1, num3);
				endTest(testDocWindow, "createSlide");
			};
			
			loadFinished(testDocWindow,checkSlide);
			
		};
		startTest("updateTest", "createSlide", "sample", testFunc, "slideSample.pptx");
	},
	
	function deleteSlide(){
		var testFunc = function(){
			console.log("in deleteSlide");
			var testDocWindow = window.testDoc1;
			var num1 = getAllSlideNumbers(testDocWindow);
			var allSlides = getAllSlides(testDocWindow);
			selectSlide(testDocWindow, allSlides[0]);
			deleteSlides(testDocWindow);
			setTimeout(function(){
				var num2 = getAllSlideNumbers(testDocWindow);
				verifyEquals("Get all slide numbers after delete slide:", num1-1, num2);
			
				refreshDoc(testDocWindow);
			
				var checkSlide = function (){
					var num3 = getAllSlideNumbers(testDocWindow);
					verifyEquals("Get  all slide numbers after refresh:", num1-1, num3);
					endTest(testDocWindow, "deleteSlide");
				};
				
				loadFinished(testDocWindow,checkSlide);
			
			}, 2000);
			
		};
		startTest("updateTest", "deleteSlide", "sample", testFunc, "slideSample.pptx");
	}
]);
