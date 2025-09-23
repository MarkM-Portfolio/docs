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

dojo.provide("pres.model.Document");

dojo.require("pres.model.Slide");
dojo.require("pres.model.Element");
dojo.require("pres.model.TableElement");
dojo.require("pres.model.ShapeElement");

dojo.require("pres.model.parser");

dojo.declare("pres.model.Document", null, {

	id: "",
	bodyId: "",
	bodyClass: "",
	slides: null,
	styles: null,
	customValues: null,
	fontSize: 18,
	b: false,
	i: false,
	u: false,

	chunkId: "",
	full: false,
	masterSlides: null,

	isValid: function()
	{
		return this.id && this.slides && this.slides.length > 0 && dojo.every(this.slides, function(s)
		{
			return s.isValid();
		});
	},

	clone: function()
	{
		var slides = [];
		dojo.forEach(this.slides, function(s)
		{
			slides.push(s.clone());
		});
		var styles = JSON.parse(JSON.stringify(this.styles));
		var customValues = this.customValues;

		var doc = new pres.model.Document();
		doc.bodyClass = this.bodyClass;
		doc.bodyId = this.bodyId;
		doc.slides = slides;
		doc.styles = styles;
		doc.id = this.id;
		doc.customValues = customValues;
		doc.fontSize = this.fontSize;
		doc.b = this.b;
		doc.i = this.i;
		doc.u = this.u;

		return doc;
	},

	findAttr: function(k, v, justOne)
	{
		var arr = [];
		outer: for ( var i = 0; i < this.slides.length; i++)
		{
			var slide = this.slides[i];
			if (slide[k] == v || slide.attrs[k] == v)
			{
				arr.push(slide);
				if (justOne)
					break;
			}
			for ( var j = 0; j < slide.elements.length; j++)
			{
				var ele = slide.elements[j];
				if (ele[k] == v || ele.attrs[k] == v)
				{
					arr.push(ele);
					if (justOne)
						break outer;
				}
			}
			var taskContainer = slide.taskContainer;
			if (taskContainer && (taskContainer[k] == v || taskContainer.attrs[k] == v))
			{
				arr.push(taskContainer);
				if (justOne)
					break;
			}
		}
		return arr;
	},

	find: function(elementId)
	{
		if (elementId == this.id)
			return this;
		for ( var i = 0; i < this.slides.length; i++)
		{
			var slide = this.slides[i];
			if (elementId == slide.id || slide.wrapperId == elementId)
				return slide;
			if (slide.taskContainer && slide.taskContainer.id == elementId)
				return slide.taskContainer;
			for ( var j = 0; j < slide.elements.length; j++)
			{
				var ele = slide.elements[j];
				if (ele.id == elementId)
				{
					return ele;
				}
			}
		}
		return null;
	},

	constructor: function(html, json, chuckId)
	{
		this.customValues = "";
		this.slides = [];
		this.styles = [];
		if (html)
		{
			this.chunkId = chuckId;
			if (!this.chunkId)
				this.full = true;
			dojo.mixin(this, pres.model.parser.parse(html));
			this.attachParent();
		}
		else if (json)
		{
			this.chunkId = chuckId;
			if (!this.chunkId)
				this.full = true;
			var me = this;
			this.id = json.id;
			this.bodyClass = json.bodyClass;
			this.bodyId = json.bodyId;
			this.styles = json.styles;
			this.customValues = json.customValues;
			this.fontSize = json.fontSize || 18;
			this.b = json.b || false;
			this.i = json.i || false;
			this.u = json.u || false;
			
			this.defaultTextStyle = "font-size: " + this.fontSize / 18 + "em; ";
			// TODO support default B/I/U
//			this.b && (this.defaultTextStyle += "font-weight: bold; "); 
//			this.i && (this.defaultTextStyle += "font-style: italic; ");
//			this.u && (this.defaultTextStyle += "text-decoration: underline; ");
			
			dojo.forEach(json.slides, function(slide)
			{
				var s = new pres.model.Slide();
				s.attrs = slide.attrs;
				s.id = slide.id;
				s.wrapperId = slide.wrapperId;
				s.w = slide.w;
				s.h = slide.h;
				s.parent = me;

				if (slide.taskContainer)
				{
					var taskContainer = new pres.model.TaskContainer(slide.taskContainer);
					taskContainer.parent = s;
					s.taskContainer = taskContainer;
				}

				me.slides.push(s);
				dojo.forEach(slide.elements, function(ele)
				{
					var e = null;
					if (ele.family == "table")
					{
						e = new pres.model.TableElement(ele);
					}
					else if (ele.family == 'group')
					{
						if (ele.img && ele.img.attrs && ele.img.attrs.src 
								&& ele.img.attrs.src.indexOf("file:///") == 0)
							return false;
						e = new pres.model.ShapeElement(ele);
					}
					else
					{
						e = new pres.model.Element(ele);
					}
					e.parent = s;
					s.elements.push(e);
				});
			});
		}
		// this.attachParent();
		dojo.subscribe("/element/deleted", dojo.hitch(this, function(element)
		{
			element.parent._cacheHTML = "";
		}));
		dojo.subscribe("/elements/deleted", dojo.hitch(this, function(elements)
		{
			dojo.forEach(elements, function(element)
			{
				element.parent._cacheHTML = "";
			});
		}));
		dojo.subscribe("/element/inserted", dojo.hitch(this, function(element)
		{
			element.parent._cacheHTML = "";
		}));
		dojo.subscribe("/elements/inserted", function(elements)
		{
			dojo.forEach(elements, function(element)
			{
				element.parent._cacheHTML = "";
			});
		});
		dojo.subscribe("/element/attr/changed", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/element/style/changed", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/shape/size/changed", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/shape/pos/changed", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/shape/bgfill/changed", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/shape/borderfill/changed", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/shape/opacityfill/changed", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/shape/linestyle/changed", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/element/content/updated", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/slide/inserted", dojo.hitch(this, function(slide)
		{
			slide._cacheHTML = "";
		}));
		dojo.subscribe("/slides/inserted", dojo.hitch(this, function(slides)
		{
			dojo.forEach(slides, dojo.hitch(this, function(slide)
			{
				slide._cacheHTML = "";
			}));
		}));
		dojo.subscribe("/slide/deleted", dojo.hitch(this, function(slide)
		{
			slide._cacheHTML = "";
		}));
		dojo.subscribe("/slides/deleted", dojo.hitch(this, function(slides)
		{
			dojo.forEach(slides, dojo.hitch(this, function(slide)
			{
				slide._cacheHTML = "";
			}));
		}));
		dojo.subscribe("/slide/attr/changed", function(slide)
		{
			slide._cacheHTML = "";
		});
		dojo.subscribe("/element/content/changed", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/table/content/updated", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/table/row/resized", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/table/row/moved", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/table/row/deleted", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/table/row/inserted", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/table/row/set/header", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/table/row/remove/header", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/table/col/set/header", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/table/col/remove/header", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/table/col/resized", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/table/col/inserted", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/table/col/moved", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/table/col/deleted", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/table/cell/cleared", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/table/cell/pasted", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/table/cell/colored", function(element)
		{
			element.parent._cacheHTML = "";
		});
		dojo.subscribe("/table/style/updated", function(element)
		{
			element.parent._cacheHTML = "";
		});

	},

	appendPartial: function(html, json)
	{
		this.partialed = true;
		if (html)
		{
			var processor = pres.model.parser;
			processor.parse(html, true, dojo.hitch(this, function(slides)
			{
				this.slides.push.apply(this.slides, slides);
				this.full = true;
				this.attachParent();
				dojo.publish("/data/loaded", [true]);
			}));
		}
		else if (json)
		{
			var me = this;
			dojo.forEach(json.slides, function(slide)
			{
				var s = new pres.model.Slide();
				s.attrs = slide.attrs;
				s.id = slide.id;
				s.wrapperId = slide.wrapperId;
				s.w = slide.w;
				s.h = slide.h;
				s.parent = me;

				if (slide.taskContainer)
				{
					var taskContainer = new pres.model.TaskContainer(slide.taskContainer);
					taskContainer.parent = s;
					s.taskContainer = taskContainer;
				}

				me.slides.push(s);
				dojo.forEach(slide.elements, function(ele)
				{
					var e = null;
					if (ele.family == "table")
					{
						e = new pres.model.TableElement(ele);
					}
					else if (ele.family == 'group')
					{
						e = new pres.model.ShapeElement(ele);
					}
					else
					{
						e = new pres.model.Element(ele);
					}
					e.parent = s;
					s.elements.push(e);
				});
			});

			this.full = true;
			dojo.publish("/data/loaded", [true]);
		}

	},

	attachParent: function(cascade)
	{
		var me = this;
		dojo.forEach(this.slides, function(s)
		{
			if (cascade)
				s.attachParent(cascade);
			s.parent = me;
		});
	},

	getId: function()
	{
		return this.id;
	},

	getChildren: function()
	{
		return this.slides;
	},

	getSlides: function()
	{
		return this.slides;
	},

	moveSlides: function(slides, targetIndex, before)
	{
		var me = this;
		var allSlides = this.slides;
		var oldIndexes = [];
		var isContinueSlides = true;
		var oldIndex = -1;
		dojo.forEach(slides, function(slide)
		{
			var theIndex = dojo.indexOf(allSlides, slide);
			if (oldIndex >= 0)
			{
				if (theIndex != oldIndex + 1)
					isContinueSlides = false;

			}
			oldIndex = theIndex;
			oldIndexes.push(theIndex);
		});
		if (isContinueSlides)
		{
			var min = oldIndexes[0];
			var max = oldIndexes[oldIndexes.length - 1];
			var index = before ? targetIndex : targetIndex + 1;
			if (index >= min && index <= max + 1)
				return null;
		}

		var targetSlide = allSlides[targetIndex];

		var deletedSlides = [];
		var insertedSlides = [];
		var oldTargetIndex = targetIndex;

		dojo.forEach(slides, function(slide, index)
		{
			var oldIndex = oldIndexes[index];
			var currentIndex = dojo.indexOf(allSlides, slide);
			allSlides.splice(currentIndex, 1);
			deletedSlides.push([slide, oldIndex]);
			if (oldIndex < oldTargetIndex)
				targetIndex--;
			else if (oldIndex == oldTargetIndex)
			{
				targetIndex--;
				before = false;
			}
		});

		if (!before)
		{
			targetIndex++;
		}
		if (targetIndex < 0)
			targetIndex = 0;

		dojo.forEach(slides, function(slide, i)
		{
			allSlides.splice(targetIndex, 0, slide);
			insertedSlides.push([slide, targetIndex]);
			targetIndex++;
		});

		dojo.publish("/slides/moved", [deletedSlides, insertedSlides, null]);

		return {
			deleted: deletedSlides,
			inserted: insertedSlides
		};
	},

	insertSlide: function(slide, index, eventSource)
	{
		var commentsId = slide.attr("commentsid");
		if (commentsId)
			dojo.publish("/comments/element/undodeleted", [commentsId]);
		
		slide.parent = this;
		this.slides.splice(index, 0, slide);
		dojo.publish("/slide/inserted", [slide, eventSource]);
	},

	deleteSlide: function(slide, eventSource)
	{		
		var commentsId = slide.attr("commentsid");
		if (commentsId)
			dojo.publish("/comments/element/deleted", [commentsId]);
		var allSlides = this.slides;
		var oldIndex = dojo.indexOf(allSlides, slide);
		if (oldIndex > -1)
		{
			allSlides.splice(oldIndex, 1);
			dojo.publish("/slide/deleted", [slide, eventSource]);
			return slide;
		}
	},

	deleteSlides: function(slides, eventSource)
	{
		var allSlides = this.slides;
		eventSource = eventSource || {};
		eventSource.batch = slides.length > 1;
		dojo.forEach(slides, dojo.hitch(this, function(slide, index)
		{
			if (index == slides.length - 1 && eventSource.batch)
				eventSource.batchLast = true;
			this.deleteSlide(slide, eventSource);
		}));
		dojo.publish("/slides/deleted", [slides, eventSource]);
	},

	getStyles: function()
	{
		return this.styles;
	},

	getCustomValues: function()
	{
		return this.customValues;
	}

});
