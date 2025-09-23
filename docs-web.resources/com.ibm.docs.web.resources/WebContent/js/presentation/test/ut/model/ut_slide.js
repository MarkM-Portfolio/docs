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

dojo.provide("pres.test.ut.model.ut_slide");

describe("pres.test.ut.model.ut_slide", function()
{

	var testData = getTestData("draft_simple1.html");
	dojo.create("div", {
		innerHTML: testData,
		style: {
			"display": "none"
		}
	}, dojo.body());

	beforeEach(function()
	{

	});

	afterEach(function()
	{
		;
	});

	it("get slide html", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		var slide = slides[0];
		var html = slide.getHTML(null, false, true, 0);
		var div = dojo.create("div", {
			id: 'testCenter',
			style: {
				display: "none"
			}
		}, dojo.body());
		div.innerHTML = html;

		var rootNode = dojo.byId(slide.id);
		var myNode = div.children[0];
		expect(compareDom(myNode, rootNode)).toBe(true);
		dojo.destroy(div);
	});

	it("get slide html with wrapper", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		var slide = slides[0];
		var html = slide.getHTML(null, true, true, 0);
		var div = dojo.create("div", {
			id: 'testCenter',
			style: {
				display: "none"
			}
		}, dojo.body());
		div.innerHTML = html;

		var rootNode = dojo.byId(slide.wrapperId);
		var myNode = div.children[0];
		expect(compareDom(myNode, rootNode)).toBe(true);
		dojo.destroy(div);

	});

	it("get slide next sibling", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		var slide = slides[0];
		var slide2 = slides[1];
		expect(slide.nextSibling()).toBe(slide2);
	});

	it("get notes", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		var slide = slides[0];
		expect(slide.getNotes()).toBe(slide.getElements()[1]);
	});

	it("get element by id", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		var slide = slides[0];
		var id = "body_id_183cad45f61d17a";
		var element = doc.find(id);
		expect(slide.getElementById(id)).toBe(element);
	});

	it("insert element", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		var slide = slides[0];
		var length = slide.getElements().length;
		var element = new pres.model.Element();
		slide.insertElement(element, 0, null);
		expect(slide.getElements()[0]).toBe(element);
		expect(slide.getElements().length).toBe(length + 1);
	});

	it("delete element", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		var slide = slides[0];
		var elements = slide.getElements();
		var element = elements[0];
		var length = elements.length;
		slide.deleteElement(element);
		expect(elements.length).toBe(length - 1);
	});

	it("delete elements", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		var slide = slides[0];
		var elements = slide.getElements();
		var arr = [];
		Array.prototype.push.apply(arr, elements);
		slide.deleteElements(arr);
		expect(elements.length).toBe(0);
	});

});
