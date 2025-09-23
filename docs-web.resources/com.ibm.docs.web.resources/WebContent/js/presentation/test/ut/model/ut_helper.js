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

dojo.provide("pres.test.ut.model.ut_helper");

describe("pres.test.ut.model.ut_helper", function()
{

	var testData = getTestData("draft_simple1.html");

	beforeEach(function()
	{

	});

	afterEach(function()
	{
		;
	});

	it("get parent element", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		var slide = slides[0];
		var element = slide.getElements()[0];
		var parentElement = pres.model.helper.getParentElement(doc, element.id);
		expect(parentElement).toBe(element);
		parentElement = pres.model.helper.getParentElement(doc, slide.id);
		expect(parentElement).toBe(null);
	});

	it("get parent slide", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		var slide = slides[0];
		var element = slide.getElements()[0];
		var parentSlide = pres.model.helper.getParentSlide(doc, element.id);
		expect(parentSlide).toBe(slide);
		parentSlide = pres.model.helper.getParentSlide(doc, slide.id);
		expect(parentSlide).toBe(slide);
		parentSlide = pres.model.helper.getParentSlide(doc, doc.id);
		expect(parentSlide).toBe(null);
	});

});
