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

dojo.provide("pres.test.api.field.headerfooter");
dojo.require("pres.test.api.utils.slideUtil");

apiTest(function()
{
	describe("pres.test.api.field.headerfooter", function()
	{
		// define expect result
		var fixedTime = "2014/6/17";
		var footer1 = "test aaa";
		var footer2 = "test footer";
		var currentDate = new Date();
		var month = currentDate.getMonth() + 1;
		var day = currentDate.getDate();
		var year = currentDate.getYear() % 100;
		var currentTime = month + "/" + day + "/" + year;

		it.asyncly("check field after load", function()
		{
			// model check
			// model check slide 1, get the Elements array, find field element
			var doc = pe.scene.doc;
			var slide1 = doc.getSlides()[0];
			var Elements = slide1.getElements();

			var fieldArray = pres.test.api.utils.slideUtil.getFieldArray(Elements);
			var dateTimeElement = fieldArray[0];
			var footerElement = fieldArray[1];
			var pageNumberElement = fieldArray[2];

			// get the element value, and check it
			var dateTimeElementContent = dateTimeElement[0].getHTML();
			var footerElementContent = footerElement[0].getHTML();
			var pageNumberElementContent = pageNumberElement[0].getHTML();

			var datetime = pres.test.api.utils.slideUtil.getModeContetnValue(dateTimeElementContent);
			var pagenumber = pres.test.api.utils.slideUtil.getModeContetnValue(pageNumberElementContent);
			var footer = pres.test.api.utils.slideUtil.getModeContetnValue(footerElementContent);

			expect("1").toBe(pagenumber);
			expect(fixedTime).toBe(datetime);
			expect(footer1).toBe(footer);

			// model check slide 2, get the Elements array, find field element
			var doc = pe.scene.doc;
			var slide2 = doc.getSlides()[1];
			var Elements = slide2.getElements();

			var fieldArray = pres.test.api.utils.slideUtil.getFieldArray(Elements);
			var dateTimeElement = fieldArray[0];
			var footerElement = fieldArray[1];
			var pageNumberElement = fieldArray[2];

			// get the element value, and check it
			var dateTimeElementContent = dateTimeElement[0].getHTML();
			var footerElementContent = footerElement[0].getHTML();
			var pageNumberElementContent = pageNumberElement[0].getHTML();

			var datetime = pres.test.api.utils.slideUtil.getModeContetnValue(dateTimeElementContent);
			var pagenumber = pres.test.api.utils.slideUtil.getModeContetnValue(pageNumberElementContent);
			var footer = pres.test.api.utils.slideUtil.getModeContetnValue(footerElementContent);

			expect("2").toBe(pagenumber);
			expect(fixedTime).toBe(datetime);
			expect(footer2).toBe(footer);

			// UI check

			// select slide 1
			var sorter = pe.scene.slideSorter;
			sorter.selectItems(0, 0);

			// check all field in slide 1 on slide editor
			var SlideEditor = pe.scene.slideEditor.slideNode;
			var datetime = pres.test.api.utils.slideUtil.getDateTime(SlideEditor);
			var pagenumber = pres.test.api.utils.slideUtil.getPageNumber(SlideEditor);
			var footer = pres.test.api.utils.slideUtil.getFooter(SlideEditor);

			expect("1").toBe(pagenumber);
			expect(fixedTime).toBe(datetime);
			expect(footer1).toBe(footer);

			// Check all field in slide 1 on slide sorter
			var slide1Sorter = sorter.containerNode.childNodes[0];
			datetime = pres.test.api.utils.slideUtil.getDateTime(slide1Sorter);
			pagenumber = pres.test.api.utils.slideUtil.getPageNumber(slide1Sorter);
			footer = pres.test.api.utils.slideUtil.getFooter(slide1Sorter);
			expect("1").toBe(pagenumber);
			expect(fixedTime).toBe(datetime);
			expect(footer1).toBe(footer);

			// select slide 2 check all field
			sorter.selectItems(1, 1);
			SlideEditor = pe.scene.slideEditor.slideNode;
			datetime = pres.test.api.utils.slideUtil.getDateTime(SlideEditor);
			pagenumber = pres.test.api.utils.slideUtil.getPageNumber(SlideEditor);
			footer = pres.test.api.utils.slideUtil.getFooter(SlideEditor);

			expect("2").toBe(pagenumber);
			expect(fixedTime).toBe(datetime);
			expect(footer2).toBe(footer);

			// Check all field in slide 2 on slide sorter
			var slide2Sorter = sorter.containerNode.childNodes[1];
			datetime = pres.test.api.utils.slideUtil.getDateTime(slide2Sorter);
			pagenumber = pres.test.api.utils.slideUtil.getPageNumber(slide2Sorter);
			footer = pres.test.api.utils.slideUtil.getFooter(slide2Sorter);

			expect("2").toBe(pagenumber);
			expect(fixedTime).toBe(datetime);
			expect(footer2).toBe(footer);

		});

		it.asyncly("check field after new slide", function()
		{
			var sorter = pe.scene.slideSorter;
			// new slide after slide 1
			sorter.selectItems(0, 0);
			sorter.createSlide();
			sorter.selectItems(1, 1);

			// //model check for new slide slide 2
			// //get the Elements array, find field element
			// var doc = pe.scene.doc;
			// var slide2 = doc.getSlides()[1];
			// var Elements = slide2.getElements();
			//
			// var fieldArray = pres.test.api.utils.slideUtil.getFieldArray(Elements);
			// var dateTimeElement = fieldArray[0];
			// var footerElement = fieldArray[1];
			// var pageNumberElement = fieldArray[2];
			//
			// // get the element value, and check it
			// var dateTimeElementContent = dateTimeElement[0].getHTML();
			// var footerElementContent = footerElement[0].getHTML();
			// var pageNumberElementContent = pageNumberElement[0].getHTML();
			//
			// var datetime = pres.test.api.utils.slideUtil.getModeContetnValue(dateTimeElementContent);
			// var pagenumber = pres.test.api.utils.slideUtil.getModeContetnValue(pageNumberElementContent);
			// var footer = pres.test.api.utils.slideUtil.getModeContetnValue(footerElementContent);
			//
			// expect("2").toBe(pagenumber);
			// expect(currentTime).toBe(datetime);
			// expect(footer2).toBe(footer);
			//
			// //model check for slide 3
			// //get the Elements array, find field element
			// var doc = pe.scene.doc;
			// var slide3 = doc.getSlides()[2];
			// var Elements = slide3.getElements();
			//
			// var fieldArray = pres.test.api.utils.slideUtil.getFieldArray(Elements);
			// var dateTimeElement = fieldArray[0];
			// var footerElement = fieldArray[1];
			// var pageNumberElement = fieldArray[2];
			//
			// // get the element value, and check it
			// var dateTimeElementContent = dateTimeElement[0].getHTML();
			// var footerElementContent = footerElement[0].getHTML();
			// var pageNumberElementContent = pageNumberElement[0].getHTML();
			//
			// var datetime = pres.test.api.utils.slideUtil.getModeContetnValue(dateTimeElementContent);
			// var pagenumber = pres.test.api.utils.slideUtil.getModeContetnValue(pageNumberElementContent);
			// var footer = pres.test.api.utils.slideUtil.getModeContetnValue(footerElementContent);
			//
			// expect("3").toBe(pagenumber);
			// expect(fixedTime).toBe(datetime);
			// expect(footer2).toBe(footer);

			// UI Check
			// Check all new slide all field value

			SlideEditor = pe.scene.slideEditor.slideNode;
			datetime = pres.test.api.utils.slideUtil.getDateTime(SlideEditor);
			pagenumber = pres.test.api.utils.slideUtil.getPageNumber(SlideEditor);
			footer = pres.test.api.utils.slideUtil.getFooter(SlideEditor);
			expect("2").toBe(pagenumber);
			expect(currentTime).toBe(datetime);
			expect(footer2).toBe(footer);

			// Check all filed for new slide on slide sorter
			var slide2Sorter = sorter.containerNode.childNodes[1];
			datetime = pres.test.api.utils.slideUtil.getDateTime(slide2Sorter);
			pagenumber = pres.test.api.utils.slideUtil.getPageNumber(slide2Sorter);
			footer = pres.test.api.utils.slideUtil.getFooter(slide2Sorter);

			expect("2").toBe(pagenumber);
			expect(currentTime).toBe(datetime);
			expect(footer2).toBe(footer);

			// check page number in slide 3 on sorter
			var slide3Sorter = sorter.containerNode.childNodes[2];
			pagenumber = pres.test.api.utils.slideUtil.getPageNumber(slide3Sorter);
			expect("3").toBe(pagenumber);

			// check page number in slide 3

			runs(function()
			{
				flag = false;
				sorter.selectItems(2, 2);

				setTimeout(function()
				{
					SlideEditor = pe.scene.slideEditor.slideNode;
					flag = true;
				}, 1000);

			});

			waitsFor(function()
			{
				return flag;

			}, "wait the UI changed", 1000);

			runs(function()
			{
				pagenumber = pres.test.api.utils.slideUtil.getPageNumber(SlideEditor);
				expect("3").toBe(pagenumber);
			});

		});

		it.asyncly("check field after delete slide", function()
		{
			var sorter = pe.scene.slideSorter;
			// delete slide 2 then check slide number in slide 3
			sorter.selectItems(1, 1);
			sorter.deleteSlides();

			// //Model check
			// var doc = pe.scene.doc;
			// var slide1 = doc.getSlides()[0];
			// var Elements = slide1.getElements();
			//
			// var fieldArray = pres.test.api.utils.slideUtil.getFieldArray(Elements);
			// var dateTimeElement = fieldArray[0];
			// var footerElement = fieldArray[1];
			// var pageNumberElement = fieldArray[2];
			//
			// // get the element value, and check it
			// var dateTimeElementContent = dateTimeElement[0].getHTML();
			// var footerElementContent = footerElement[0].getHTML();
			// var pageNumberElementContent = pageNumberElement[0].getHTML();
			//
			// var datetime = pres.test.api.utils.slideUtil.getModeContetnValue(dateTimeElementContent);
			// var pagenumber = pres.test.api.utils.slideUtil.getModeContetnValue(pageNumberElementContent);
			// var footer = pres.test.api.utils.slideUtil.getModeContetnValue(footerElementContent);
			//
			// expect("1").toBe(pagenumber);
			// expect(fixedTime).toBe(datetime);
			// expect(footer1).toBe(footer);
			//
			// // model check slide 2, get the Elements array, find field element
			// var doc = pe.scene.doc;
			// var slide2 = doc.getSlides()[1];
			// var Elements = slide2.getElements();
			//
			// var fieldArray = pres.test.api.utils.slideUtil.getFieldArray(Elements);
			// var dateTimeElement = fieldArray[0];
			// var footerElement = fieldArray[1];
			// var pageNumberElement = fieldArray[2];
			//
			// // get the element value, and check it
			// var dateTimeElementContent = dateTimeElement[0].getHTML();
			// var footerElementContent = footerElement[0].getHTML();
			// var pageNumberElementContent = pageNumberElement[0].getHTML();
			//
			// var datetime = pres.test.api.utils.slideUtil.getModeContetnValue(dateTimeElementContent);
			// var pagenumber = pres.test.api.utils.slideUtil.getModeContetnValue(pageNumberElementContent);
			// var footer = pres.test.api.utils.slideUtil.getModeContetnValue(footerElementContent);
			//
			// expect("2").toBe(pagenumber);
			// expect(fixedTime).toBe(datetime);
			// expect(footer2).toBe(footer);

			// UI check
			// Check slide 2 slide number in slide Editor
			runs(function()
			{
				flag = false;
				sorter.selectItems(1, 1);

				setTimeout(function()
				{
					SlideEditor = pe.scene.slideEditor.slideNode;
					flag = true;
				}, 1000);

			});

			waitsFor(function()
			{
				return flag;

			}, "wait the UI changed", 1000);

			runs(function()
			{
				pagenumber = pres.test.api.utils.slideUtil.getPageNumber(SlideEditor);
				expect("2").toBe(pagenumber);
			});

			// Check slide 2 slide number in sorter

			var slide2Sorter = sorter.containerNode.childNodes[1];
			pagenumber = pres.test.api.utils.slideUtil.getPageNumber(slide2Sorter);
			expect("2").toBe(pagenumber);
		});

		it.asyncly("move slide check the number", function()
		{
			var sorter = pe.scene.slideSorter;
			sorter.selectItems(1, 1, 0);
			sorter.moveSlidesDir(true);

			// UI Check

			// check all field in slide 1 on slide editor
			runs(function()
			{
				flag = false;
				//select slide 1
				sorter.selectItems(0, 0);

				setTimeout(function()
				{
					SlideEditor = pe.scene.slideEditor.slideNode;
					flag = true;
				}, 1000);

			});

			waitsFor(function()
			{
				return flag;

			}, "wait the UI changed", 1000);

			runs(function()
			{
				var SlideEditor = pe.scene.slideEditor.slideNode;
				var datetime = pres.test.api.utils.slideUtil.getDateTime(SlideEditor);
				var pagenumber = pres.test.api.utils.slideUtil.getPageNumber(SlideEditor);
				var footer = pres.test.api.utils.slideUtil.getFooter(SlideEditor);
				expect("1").toBe(pagenumber);
				expect(fixedTime).toBe(datetime);
				expect(footer2).toBe(footer);
			});

			// Check all field in slide 1 on slide sorter
			var slide1Sorter = sorter.containerNode.childNodes[0];
			datetime = pres.test.api.utils.slideUtil.getDateTime(slide1Sorter);
			pagenumber = pres.test.api.utils.slideUtil.getPageNumber(slide1Sorter);
			footer = pres.test.api.utils.slideUtil.getFooter(slide1Sorter);
			expect("1").toBe(pagenumber);
			expect(fixedTime).toBe(datetime);
			expect(footer2).toBe(footer);

			// select slide 2 check all field
			runs(function()
			{
				flag = false;
				sorter.selectItems(1, 1);

				setTimeout(function()
				{
					SlideEditor = pe.scene.slideEditor.slideNode;
					flag = true;
				}, 1000);

			});

			waitsFor(function()
			{
				return flag;

			}, "wait the UI changed", 1000);

			runs(function()
			{
				datetime = pres.test.api.utils.slideUtil.getDateTime(SlideEditor);
				pagenumber = pres.test.api.utils.slideUtil.getPageNumber(SlideEditor);
				footer = pres.test.api.utils.slideUtil.getFooter(SlideEditor);
				expect("2").toBe(pagenumber);
				expect(fixedTime).toBe(datetime);
				expect(footer1).toBe(footer);
				//move the slide 2 up
				sorter.selectItems(1, 1, 0);
				sorter.moveSlidesDir(true);

			});

			// Check all field in slide 2 on slide sorter
			var slide2Sorter = sorter.containerNode.childNodes[1];
			datetime = pres.test.api.utils.slideUtil.getDateTime(slide2Sorter);
			pagenumber = pres.test.api.utils.slideUtil.getPageNumber(slide2Sorter);
			footer = pres.test.api.utils.slideUtil.getFooter(slide2Sorter);

			expect("2").toBe(pagenumber);
			expect(fixedTime).toBe(datetime);
			expect(footer1).toBe(footer);

		});
	});

});