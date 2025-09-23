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

dojo.provide("pres.test.ut.model.ut_document");

describe("pres.test.ut.model.ut_document", function()
{

	var testData = getTestData("draft_simple1.html");
	beforeEach(function()
	{
		;
	});

	afterEach(function()
	{
		;
	});

	it("document valid load draft_simple1", function()
	{
		var doc = new pres.model.Document(testData);
		var id = doc.getId();
		var slides = doc.getSlides();
		var styles = doc.getStyles();
		var customValues = doc.getCustomValues();
		expect(id).toBe("officeprez_id_166");
		//expect(customValues["cusAA"]["abs-font-size"]).toBe("1234");
		//expect(customValues["cusbb"]["abs-font-size"]).toBe("5678");
		expect(slides.length).toBe(4);
		expect(styles.length).toBe(4);
		for ( var i = 0; i < slides.length; i++)
		{
			var slide = slides[i];
			var elements = slide.getElements();
			var notes = slide.getNotes();
			var element = elements[0];
			expect(elements.length).toBe(2);
			expect(notes).toBe(elements[1]);
			expect(slide.getParent()).toBe(doc);
		}
	});

	it("document valid finding", function()
	{
		var doc = new pres.model.Document(testData);
		var slideFindByWrapper = doc.find("body_id_1832c833eda47a1");
		var slideFindById = doc.find("slide_body_id_18305341729922a");
		var elementFind = doc.find("body_id_183095d1a797ffe");
		var contentFind = doc.find("body_id_18371a69aa736c3");
		var notFind = doc.find("aaaa");
		var notFind2 = doc.find("aaaa", true);
		var findAttr = doc.findAttr("masterpageclass", "MB_defaultBackground");
		expect(findAttr.length).toBe(4);
		expect(notFind).toBe(null);
		expect(notFind2).toBe(null);
		expect(contentFind).toBe(null);

		expect(slideFindByWrapper instanceof pres.model.Slide).toBe(true);
		expect(elementFind instanceof pres.model.Element).toBe(true);

		expect(slideFindByWrapper).toBe(slideFindById);
		expect(elementFind.getParent()).toBe(slideFindByWrapper);

	});

	it("document insert slide", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		var length = slides.length;
		var slide0 = slides[0];
		var slide = new pres.model.Slide();
		slide.parent = doc;
		slide.id = "aa";
		slide.wrapperId = "w_aa";
		doc.insertSlide(slide, 0, null);
		expect(slides.length).toBe(length + 1);
		expect(slides[0]).toBe(slide);
		expect(slides[1]).toBe(slide0);
	});

	it("document delete slide", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		var length = slides.length;
		var slide1 = slides[1];
		doc.deleteSlide(slide1);
		expect(slides.length).toBe(length - 1);
		expect(slides[1]).not.toBe(slide1);
	});

	it("document delete slides", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		var arr = [];
		Array.prototype.push.apply(arr, slides);
		doc.deleteSlides(arr);
		expect(slides.length).toBe(0);
	});
	it("document move slides 2 to 1 before", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		dojo.forEach(slides, function(s, index)
		{
			s.tag = index + 1;
		});
		var arr = [slides[1]];
		doc.moveSlides(arr, 0, true);
		var tags = dojo.map(slides, function(s)
		{
			return s.tag;
		});
		expect(tags).toEqual([2, 1, 3, 4]);
	});
	it("document move slides 2 to 1 after", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		dojo.forEach(slides, function(s, index)
		{
			s.tag = index + 1;
		});
		var arr = [slides[1]];
		doc.moveSlides(arr, 0, false);
		var tags = dojo.map(slides, function(s)
		{
			return s.tag;
		});
		expect(tags).toEqual([1, 2, 3, 4]);
	});
	it("document move slides 2 to 2 before", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		dojo.forEach(slides, function(s, index)
		{
			s.tag = index + 1;
		});
		var arr = [slides[1]];
		doc.moveSlides(arr, 1, false);
		var tags = dojo.map(slides, function(s)
		{
			return s.tag;
		});
		expect(tags).toEqual([1, 2, 3, 4]);
	});
	it("document move slides 2 to 2 after", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		dojo.forEach(slides, function(s, index)
		{
			s.tag = index + 1;
		});
		var arr = [slides[1]];
		doc.moveSlides(arr, 1, true);
		var tags = dojo.map(slides, function(s)
		{
			return s.tag;
		});
		expect(tags).toEqual([1, 2, 3, 4]);
	});
	it("document move slides 2 to 3 before", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		dojo.forEach(slides, function(s, index)
		{
			s.tag = index + 1;
		});
		var arr = [slides[1]];
		doc.moveSlides(arr, 2, true);
		var tags = dojo.map(slides, function(s)
		{
			return s.tag;
		});
		expect(tags).toEqual([1, 2, 3, 4]);
	});
	it("document move slides 2 to 3 after", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		dojo.forEach(slides, function(s, index)
		{
			s.tag = index + 1;
		});
		var arr = [slides[1]];
		doc.moveSlides(arr, 2, false);
		var tags = dojo.map(slides, function(s)
		{
			return s.tag;
		});
		expect(tags).toEqual([1, 3, 2, 4]);
	});
	it("document move slides 1,2,3 to 1 before", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		dojo.forEach(slides, function(s, index)
		{
			s.tag = index + 1;
		});
		var arr = [slides[0], slides[1], slides[2]];
		doc.moveSlides(arr, 0, true);
		var tags = dojo.map(slides, function(s)
		{
			return s.tag;
		});
		expect(tags).toEqual([1, 2, 3, 4]);
	});
	it("document move slides 1,2,3 to 2 before", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		dojo.forEach(slides, function(s, index)
		{
			s.tag = index + 1;
		});
		var arr = [slides[0], slides[1], slides[2]];
		doc.moveSlides(arr, 1, true);
		var tags = dojo.map(slides, function(s)
		{
			return s.tag;
		});
		expect(tags).toEqual([1, 2, 3, 4]);
	});
	it("document move slides 1,2,3 to 3 before", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		dojo.forEach(slides, function(s, index)
		{
			s.tag = index + 1;
		});
		var arr = [slides[0], slides[1], slides[2]];
		doc.moveSlides(arr, 2, true);
		var tags = dojo.map(slides, function(s)
		{
			return s.tag;
		});
		expect(tags).toEqual([1, 2, 3, 4]);
	});
	it("document move slides 1,2,3 to 3 after", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		dojo.forEach(slides, function(s, index)
		{
			s.tag = index + 1;
		});
		var arr = [slides[0], slides[1], slides[2]];
		doc.moveSlides(arr, 2, false);
		var tags = dojo.map(slides, function(s)
		{
			return s.tag;
		});
		expect(tags).toEqual([1, 2, 3, 4]);
	});
	it("document move slides 1,2,3 to 4 before", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		dojo.forEach(slides, function(s, index)
		{
			s.tag = index + 1;
		});
		var arr = [slides[0], slides[1], slides[2]];
		doc.moveSlides(arr, 3, true);
		var tags = dojo.map(slides, function(s)
		{
			return s.tag;
		});
		expect(tags).toEqual([1, 2, 3, 4]);
	});
	it("document move slides 1,2,3 to 4 after", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		dojo.forEach(slides, function(s, index)
		{
			s.tag = index + 1;
		});
		var arr = [slides[0], slides[1], slides[2]];
		doc.moveSlides(arr, 3, false);
		var tags = dojo.map(slides, function(s)
		{
			return s.tag;
		});
		expect(tags).toEqual([4, 1, 2, 3]);
	});

	it("document move slides 1,3 to 1 before", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		dojo.forEach(slides, function(s, index)
		{
			s.tag = index + 1;
		});
		var arr = [slides[0], slides[2]];
		doc.moveSlides(arr, 0, true);
		var slides = doc.getSlides();
		var tags = dojo.map(slides, function(s)
		{
			return s.tag;
		});
		expect(tags).toEqual([1, 3, 2, 4]);
	});

	it("document move slides 1,3 to 1 after", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		dojo.forEach(slides, function(s, index)
		{
			s.tag = index + 1;
		});
		var arr = [slides[0], slides[2]];
		doc.moveSlides(arr, 0, false);
		var slides = doc.getSlides();
		var tags = dojo.map(slides, function(s)
		{
			return s.tag;
		});
		expect(tags).toEqual([1, 3, 2, 4]);
	});

	it("document move slides 1,3 to 2 before", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		dojo.forEach(slides, function(s, index)
		{
			s.tag = index + 1;
		});
		var arr = [slides[0], slides[2]];
		doc.moveSlides(arr, 1, true);
		var slides = doc.getSlides();
		var tags = dojo.map(slides, function(s)
		{
			return s.tag;
		});
		expect(tags).toEqual([1, 3, 2, 4]);
	});
	it("document move slides 1,3 to 2 after", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		dojo.forEach(slides, function(s, index)
		{
			s.tag = index + 1;
		});
		// select 1, 3
		var arr = [slides[0], slides[2]];
		// move to 2 after
		doc.moveSlides(arr, 1, false);
		var slides = doc.getSlides();
		var tags = dojo.map(slides, function(s)
		{
			return s.tag;
		});
		expect(tags).toEqual([2, 1, 3, 4]);
	});

	it("document move slides 1,3 to 3 before", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		dojo.forEach(slides, function(s, index)
		{
			s.tag = index + 1;
		});
		// select 1, 3
		var arr = [slides[0], slides[2]];
		// move to 3 before
		doc.moveSlides(arr, 2, true);
		var slides = doc.getSlides();
		var tags = dojo.map(slides, function(s)
		{
			return s.tag;
		});
		expect(tags).toEqual([2, 1, 3, 4]);
	});

	it("document move slides 1,3 to 3 after", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		dojo.forEach(slides, function(s, index)
		{
			s.tag = index + 1;
		});
		// select 1, 3
		var arr = [slides[0], slides[2]];
		// move to 3 after
		doc.moveSlides(arr, 2, false);
		var slides = doc.getSlides();
		var tags = dojo.map(slides, function(s)
		{
			return s.tag;
		});
		expect(tags).toEqual([2, 1, 3, 4]);
	});

	it("document move slides 1,3 to 4 before", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		dojo.forEach(slides, function(s, index)
		{
			s.tag = index + 1;
		});
		var arr = [slides[0], slides[2]];
		doc.moveSlides(arr, 3, true);
		var slides = doc.getSlides();
		var tags = dojo.map(slides, function(s)
		{
			return s.tag;
		});
		expect(tags).toEqual([2, 1, 3, 4]);
	});

	it("document move slides 1,3 to 4 after", function()
	{
		var doc = new pres.model.Document(testData);
		var slides = doc.getSlides();
		dojo.forEach(slides, function(s, index)
		{
			s.tag = index + 1;
		});
		var arr = [slides[0], slides[2]];
		doc.moveSlides(arr, 3, false);
		var slides = doc.getSlides();
		var tags = dojo.map(slides, function(s)
		{
			return s.tag;
		});
		expect(tags).toEqual([2, 4, 1, 3]);
	});
/*
	it("delete list before ids", function()
	{
		var doc = new pres.model.Document(testData);
		doc.listBeforeStyles = {
			"a1": "font-size:16px",
			"a2": "font-family:arial"
		};
		var ids = ["a1", "a3", "a4"];
		var data = doc.deleteListBeforeIds(ids);
		expect(doc.getListBeforeStyles()["a1"]).toBe(undefined);
		expect(data.before).toEqual(["IL_CS_a1:before=font-size:16px"]);
		expect(data.post).toEqual(["IL_CS_a1:before=no"]);
	});

	it("update list before styles", function()
	{
		var doc = new pres.model.Document(testData);
		doc.listBeforeStyles = {
			"a1": "font-size:16px",
			"a2": "font-family:arial"
		};
		doc.updateListBeforeStyles(["IL_CS_a1:before=no", "IL_CS_a3:before=font-size:20px"])
		expect(doc.getListBeforeStyles()["a1"]).toBe(undefined);
		expect(doc.getListBeforeStyles()["a3"]).toBe("font-size:20px");
	});
*/
	it("clone", function()
	{
		var doc = new pres.model.Document(testData);
		var docCloned = doc.clone();
		expect(doc.id).toBe(docCloned.id);
		var oldSlides = doc.slides;
		var newSlides = docCloned.slides;
		expect(oldSlides.length).toBe(newSlides.length);
		for ( var i = 0; i < oldSlides.length; i++)
		{
			var oSlide = oldSlides[i];
			var nSlide = newSlides[i];
			expect(nSlide.id).toEqual(oSlide.id);
			expect(nSlide.wrapperId).toEqual(oSlide.wrapperId);
			expect(nSlide.w).toEqual(oSlide.w);
			expect(nSlide.h).toEqual(oSlide.h);
			var ele = oSlide.getElements();
			var nEle = nSlide.getElements();
			expect(ele.length).toBe(nEle.length);
			for ( var j = 0; j < ele.length; j++)
			{
				var e = ele[j];
				var ne = nEle[j];
				expect(e.id).toBe(ne.id);
				expect(e.content).toBe(ne.content);
				expect(e.isNotes).toBe(ne.isNotes);
				expect(e.w).toBe(ne.w);
				expect(e.h).toBe(ne.h);
				expect(e.t).toBe(ne.t);
				expect(e.l).toBe(ne.l);
				expect(e.z).toBe(ne.z);
				expect(e.family).toBe(ne.family);
			}
		}
		expect(doc.styles).toEqual(docCloned.styles);
		expect(doc.customValues).toEqual(docCloned.customValues);
		expect(doc.listBeforeStyles).toEqual(docCloned.listBeforeStyles);
	});

});
