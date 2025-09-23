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

dojo.provide("pres.test.ut.model.ut_slideshow");

describe("pres.test.ut.widget.ut_slideshow", function() {
	var testData = getTestData("draft_simple1.html");
	pe = {
		scene : {
			isMobileBrowser : function() {
				return false;
			},
			isHTMLViewMode : function() {
				return false;
			}
		}
	};
	var doc = new pres.model.Document(testData);
	pe.scene.doc = doc;
	g_locale = 'en_us';
	PresCKUtil = {
		bEnableHLink : false
	};
	slideShow = new pres.widget.SlideShow(window, 0);
	beforeEach(function() {
		var bodyNode = "";
		dojo.query('body', window.document).forEach(function(node, index, arr)
		{
			bodyNode = node;
		});
		dojo.create("div", {
			id: "slideShowContainer"
		}, bodyNode);
		slideShow.slideContainer = dojo.query('#slideShowContainer', window.document)[0];
	});

	afterEach(function() {
		slideShow.destroy();
	});
	describe("storeCurrentShowDivToModel", function() {
		it("store CurrentShowSlide html Div back to Slides Model, normal slide", function() {
			var slideHtmlDiv = document.createElement('div');
			slideHtmlDiv.id = "slide_number_0";
			spyOn(slideShow, 'getSlideHtmlDiv').andReturn(slideHtmlDiv);
			var currentDiv = document.createElement('div');
			currentDiv.id = "slideid_0";
			slideShow.slideContainer.appendChild(currentDiv);
			slideShow.storeCurrentShowDivToModel();
			expect(slideShow.getSlideHtmlDiv).toHaveBeenCalledWith(slideShow.currSlide, slideShow.slides[slideShow.currSlide]);
			expect(slideHtmlDiv.firstElementChild.id).toBe('slideid_0');
		});
		it("store CurrentShowSlide html Div back to Slides Model, slide transition case", function() {
			var slideHtmlDiv = document.createElement('div');
			slideHtmlDiv.id = "slide_number_0";
			spyOn(slideShow, 'getSlideHtmlDiv').andReturn(slideHtmlDiv);
			var slideContainer = document.createElement('div');
			slideContainer.id = "slideContainerDiv";
			
			var currentDiv = document.createElement('div');
			currentDiv.id = "pane0";
			slideContainer.appendChild(currentDiv);
			slideShow.slideContainer = slideContainer;
			slideShow.storeCurrentShowDivToModel();
		});
		it("store CurrentShowSlide html Div back to Slides Model, null case", function() {
			var slideHtmlDiv = document.createElement('div');
			slideHtmlDiv.id = "slide_number_0";
			spyOn(slideShow, 'getSlideHtmlDiv').andReturn(slideHtmlDiv);
			var currentDiv = document.createElement('div');
			slideShow.slideContainer = currentDiv;
			slideShow.storeCurrentShowDivToModel();
		});
	});
	
	describe("getSlideHtmlDiv", function() {
		it("store CurrentShowSlide html Div back to Slides Model, normal slide", function() {
			var slide = slideShow.slides[0];
			var slideHtml = slideShow.getSlideHtmlDiv(0,slide);
			expect(slideHtml.id).toBe('slide_number_0');
			expect(slideHtml.firstElementChild.id).toBe('slide_body_id_18333f2902b1022');
			slide = slideShow.slides[1];
			slideHtml = slideShow.getSlideHtmlDiv(1,slide);
			expect(slideHtml.id).toBe('slide_number_1');
		});
	});
	
	describe("createSlidesHtmlDiv", function() {
		it("createSlidesHtmlDiv in window.document", function() {
			spyOn(slideShow, 'getSlideHtmlDiv');
			slideShow.createSlidesHtmlDiv();
			expect(slideShow.slideHtmlListDiv.id).toBe('SlideHtmlListDiv');
		});
	});
	describe("preLoadSlidesbySlideIndex", function() {
		it("preLoadSlidesbySlideIndex 0,count.4", function() {
			slideShow.preLoadSlidesbySlideIndex(0);
			expect(slideShow.slideHtmlListDiv.childElementCount).toBe(4);
		});
		it("preLoadSlidesbySlideIndex 4,count.2", function() {
			slideShow.preLoadSlidesbySlideIndex(4);
			expect(slideShow.slideHtmlListDiv.childElementCount).toBe(2);
		});
	});
});
