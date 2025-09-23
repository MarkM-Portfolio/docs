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

dojo.provide("pres.test.ut.model.ut_element");

describe("pres.test.ut.model.ut_element", function()
{

	var testData = getTestData("draft_simple1.html");

	beforeEach(function()
	{

	});

	afterEach(function()
	{
		;
	});

	it("get element html", function()
	{
		var refNode = dojo.create("div", {
			innerHTML: testData,
			style: {
				"display": "none"
			}
		}, dojo.body());
		
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		var slide = slides[0];
		var element = slide.getElements()[0];
		var html = element.getHTML();
		var div = dojo.create("div", {
			id: 'testCenter',
			style: {
				display: "none"
			}
		}, dojo.body());
		div.innerHTML = html;

		var rootNode = dojo.byId(element.id);
		var myNode = div.children[0];

		expect(compareDom(myNode, rootNode)).toBe(true);
		dojo.destroy(div);
		dojo.destroy(refNode);
	});

	it("get element next sibling", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		var slide = slides[0];
		var element = slide.getElements()[0];
		var element2 = slide.getElements()[1];

		expect(element.nextSibling()).toBe(element2);
		expect(element2.nextSibling()).toBe(null);
	});

	it("element clone", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		var slide = slides[0];
		var element = slide.getElements()[0];
		var elementCloned = element.clone();
		expect(elementCloned).not.toBe(element);
		expect(elementCloned.id).toBe(element.id);
		expect(elementCloned.w).toBe(element.w);
		expect(elementCloned.h).toBe(element.h);
		expect(elementCloned.t).toBe(element.t);
		expect(elementCloned.l).toBe(element.l);
		expect(elementCloned.z).toBe(element.z);
		expect(elementCloned.family).toBe(element.family);
		expect(elementCloned.isNotes).toBe(element.isNotes);
		expect(elementCloned.content).toBe(element.content);
		expect(elementCloned.meta).toEqual(element.meta);
		expect(elementCloned.ids).toEqual(element.ids);
	});

	it("element to json", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		var slide = slides[0];
		var element = slide.getElements()[0];
		var elementCloned = element.toJson();
		expect(elementCloned).not.toBe(element);
		expect(elementCloned.id).toBe(element.id);
		expect(elementCloned.w).toBe(element.w);
		expect(elementCloned.h).toBe(element.h);
		expect(elementCloned.t).toBe(element.t);
		expect(elementCloned.l).toBe(element.l);
		expect(elementCloned.z).toBe(element.z);
		expect(elementCloned.family).toBe(element.family);
		expect(elementCloned.isNotes).toBe(element.isNotes);
		expect(elementCloned.content).toBe(element.content);
		expect(elementCloned.meta).toEqual(element.meta);
		expect(elementCloned.ids).toEqual(element.ids);
	});

});
