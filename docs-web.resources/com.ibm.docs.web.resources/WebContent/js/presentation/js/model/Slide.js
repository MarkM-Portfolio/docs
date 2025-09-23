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

dojo.provide("pres.model.Slide");
dojo.require("pres.model.Attrable");
dojo.require("pres.model.Htmlable");
dojo.require("pres.model.TaskContainer");
dojo.require("pres.model.parser");
dojo.require("pres.utils.helper");

dojo.declare("pres.model.Slide", [pres.model.Attrable, pres.model.Htmlable], {

	id: "",
	wrapperId: "",
	elements: null,

	w: 0,
	h: 0,

	// default h="19.05" w="25.4" pageunits="cm"

	taskContainer: null,

	isValid: function()
	{
		return this.w > 0 && this.h > 0 && this.id && this.wrapperId && this.id != this.wrapperId && this.elements && dojo.every(this.elements, function(e)
		{
			return e.isValid();
		});
	},

	toJson: function(excludeTask)
	{
		var result = {
			id: this.id,
			type: "slide",
			wrapperId: this.wrapperId,
			w: this.w,
			h: this.h,
			elements: null,
			attrs: dojo.clone(this.attrs)
		};

		if (this.parent)
			result.parentId = this.parent.id;

		if (this.taskContainer && !excludeTask)
			result.taskContainer = this.taskContainer.toJson();

		if (this.elements)
		{
			result.elements = dojo.map(this.elements, function(ele)
			{
				return ele.toJson();
			});
		}

		return result;
	},

	clone: function()
	{
		var slide = new pres.model.Slide();
		slide.attrs = dojo.clone(this.attrs);
		slide.w = this.w;
		slide.h = this.h;
		slide.id = this.id;
		slide.wrapperId = this.wrapperId;
		if (this.taskContainer)
		{
			slide.taskContainer = this.taskContainer.clone();
		}
		dojo.forEach(this.elements, function(ele)
		{
			var e = ele.clone();
			slide.elements.push(e);
		});
		return slide;
	},

	constructor: function(slide)
	{
		this.elements = [];
		this.attrs = {};
		if (slide)
		{
			this.attrs = slide.attrs;
			this.w = slide.w;
			this.h = slide.h;
			this.id = slide.id;
			this.wrapperId = slide.wrapperId;
			this.taskContainer = slide.taskContainer;
			if (this.taskContainer)
				this.taskContainer.parent = this;
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
				e.parent = this;
				this.elements.push(e);
			}, this);
		}
	},

	attachParent: function(cascade)
	{
		var me = this;
		if (this.taskContainer)
			this.taskContainer.parent = this;
		dojo.forEach(this.elements, function(e)
		{
			e.parent = me;
			if (cascade)
				e.attachParent(cascade);
		});
	},

	find: function(elementId)
	{
		for ( var j = 0; j < this.elements.length; j++)
		{
			var ele = this.elements[j];
			if (ele.id == elementId)
			{
				return ele;
			}
		}
		return null;
	},

	findAttr: function(k, v, justOne)
	{
		var arr = [];
		var slide = this;
		if (slide[k] == v || slide.attrs[k] == v)
		{
			arr.push(slide);
			if (justOne)
				return arr;
		}
		var taskContainer = slide.taskContainer;
		if (taskContainer && (taskContainer[k] == v || taskContainer.attrs[k] == v))
		{
			arr.push(taskContainer);
			if (justOne)
				return arr;
		}
		for ( var j = 0; j < slide.elements.length; j++)
		{
			var ele = slide.elements[j];
			if (ele[k] == v || ele.attrs[k] == v)
			{
				arr.push(ele);
				if (justOne)
					return arr;
			}
		}
		return arr;
	},

	appendChild: function(child)
	{
		if (child instanceof pres.model.Element)
			this.elements.push(child);
		else if (child.nodeName)
		{
			var ele = pres.model.parser.parseElement(this, child);
			this.elements.push(ele);
		}
	},

	getPlaceHolders: function()
	{
		return dojo.filter(this.elements, function(ele)
		{
			var ph = ele.attr("presentation_placeholder");
			return ph === "true" || ph === true;
		});
	},

	getChildren: function()
	{
		return this.elements;
	},

	getParent: function()
	{
		return this.parent;
	},

	getMaxZ: function(excludeBg)
	{
		var z = 0;
		dojo.forEach(this.elements, function(ele)
		{
			if (ele.z > z && !ele.isNotes)
			{
				if (excludeBg)
				{
					if (ele.family != "background" && ele.family != "header" && ele.family != "date-time" && ele.family != "page-number" && ele.family != "footer" && ele.family != "unknown")
						z = ele.z;
				}
				else
					z = ele.z;
			}
		});
		return z;
	},

	getMinZ: function(excludeBg)
	{
		var z = -1;
		dojo.forEach(this.elements, function(ele)
		{
			if ((ele.z < z || z == -1) && !ele.isNotes)
			{
				if (excludeBg)
				{
					if (ele.family != "background" && ele.family != "header" && ele.family != "date-time" && ele.family != "page-number" && ele.family != "footer" && ele.family != "unknown")
						z = ele.z;
				}
				else
					z = ele.z;
			}
		});
		if (z < 0)
			z = 0;
		return z;
	},

	getNotes: function()
	{
		var arr = dojo.filter(this.elements, function(e)
		{
			return e.isNotes;
		});
		if (arr && arr.length == 1)
			return arr[0];
	},

	getElements: function()
	{
		return this.elements;
	},

	getElementById: function(id)
	{
		if (!id)
			return null;
		var arr = dojo.filter(this.elements, function(e)
		{
			return e.id && e.id === id;
		});
		if (arr && arr.length == 1)
			return arr[0];
		return null;
	},

	insertElement: function(ele, index, eventSource)
	{
		var commentsId = ele.attr("commentsid");
		if (commentsId)
			dojo.publish("/comments/element/undodeleted", [commentsId]);

		ele.parent = this;
		this.elements.splice(index, 0, ele);
		dojo.publish("/element/inserted", [ele, eventSource]);
	},

	deleteElement: function(ele, eventSource)
	{
		var commentsId = ele.attr("commentsid");
		if (commentsId)
			dojo.publish("/comments/element/deleted", [commentsId]);

		var index = dojo.indexOf(this.elements, ele);
		if (index > -1)
		{
			this.elements.splice(index, 1);
			dojo.publish("/element/deleted", [ele, eventSource]);
			return ele;
		}
	},

	deleteElements: function(eles, eventSource)
	{
		eventSource = eventSource || {};
		dojo.forEach(eles, dojo.hitch(this, function(ele)
		{
			this.deleteElement(ele, eventSource);
		}));
		dojo.publish("/elements/deleted", [eles, eventSource]);
	},

	nextSibling: function()
	{
		if (this.parent)
		{
			var slides = this.parent.slides;
			var index = dojo.indexOf(slides, this);
			if (index > -1 && index < slides.length - 1)
				return slides[index + 1];
		}
		return null;
	},

	getHTML: function(scaleProps, withWrapper, withNotes, withTask, forEdit)
	{
		var useCache = scaleProps == null && !withWrapper && !withNotes && !withTask && forEdit;
		// useCache just for mobie and need test.
		// useCache = false;
		if (useCache && this._cacheHTML)
		{
			return this._cacheHTML;
		}

		var page = this._gartherAttrs(scaleProps, forEdit);
		dojo.forEach(this.elements, dojo.hitch(this, function(ele)
		{
			if ((!ele.isNotes) || withNotes)
			{
				var div = ele.getHTML();
				page += div;
			}
		}));

		page += "</div>";
		var str = "";
		if (withWrapper)
		{
			var task = "";
			if (withTask && this.taskContainer)
				task = this.taskContainer.getHTML();
			str = "<div class='slideWrapper' id='" + this.wrapperId + "'>" + page + task + "</div>";
		}
		else
			str = page;

		if (useCache)
			this._cacheHTML = str;

		return str;
	},
	hasComment: function(commentId)
	{
		if (!commentId)
		{
			return false;
		}
		var commentsid = this.attr("commentsid");
		if (commentsid)
		{
			commentsid = dojo.trim(commentsid);
			if (commentsid.indexOf(commentId) >= 0)
			{
				return true;
			}
		}
		return false;
	},
	hasElementWithCommentsId: function(commentsId)
	{//find the child of slide first then find slide 
		var find = false;
		for ( var i = 0; i < this.elements.length; i++)
		{
			var e = this.elements[i];
			if (e.hasComment(commentsId))
			{
				find = true;
				break;
			}
		}
		if(!find)
		{
			find = this.hasComment(commentsId);
		}
		return find;
	},
	getTransitionType: function()
	{
		var smil_type = this.attrs.smil_type;
		var smil_subtype = this.attrs.smil_subtype;
		var smil_direction = this.attrs.smil_direction;
		if (smil_direction == null)
		{
			smil_direction = "none";
		}

		if (smil_type == "none")
		{
			smil_type = null;
		}

		var transitionToUse = "slideTransitions_none";

		if (!smil_type)
		{
			return transitionToUse;
		}

		if (smil_type == "slideWipe")
		{
			if (smil_subtype == "fromTop")
			{
				transitionToUse = "slideTransitions_coverDown";
			}
			else if (smil_subtype == "fromRight")
			{
				transitionToUse = "slideTransitions_coverLeft";
			}
			else if (smil_subtype == "fromBottom")
			{
				transitionToUse = "slideTransitions_coverUp";
			}
			else if (smil_subtype == "fromLeft")
			{
				transitionToUse = "slideTransitions_coverRight";
			}
		}
		else if (smil_type == "pushWipe")
		{
			if (smil_subtype == "fromTop")
			{
				transitionToUse = "slideTransitions_pushDown";
			}
			else if (smil_subtype == "fromRight")
			{
				transitionToUse = "slideTransitions_pushLeft";
			}
			else if (smil_subtype == "fromBottom")
			{
				transitionToUse = "slideTransitions_pushUp";
			}
			else if (smil_subtype == "fromLeft")
			{
				transitionToUse = "slideTransitions_pushRight";
			}
		}
		else if (smil_type == "fade")
		{
			transitionToUse = "slideTransitions_fadeSmoothly";
		}
		else if (smil_type == "barWipe")
		{
			if (smil_subtype == "topToBottom" && smil_direction == "none")
			{
				transitionToUse = "slideTransitions_wipeDown";
			}
			else if (smil_subtype == "leftToRight" && smil_direction == "none")
			{
				transitionToUse = "slideTransitions_wipeRight";
			}
			else if (smil_subtype == "topToBottom" && smil_direction == "reverse")
			{
				transitionToUse = "slideTransitions_wipeUp";
			}
			else if (smil_subtype == "leftToRight" && smil_direction == "reverse")
			{
				transitionToUse = "slideTransitions_wipeLeft";
			}
		}
		else
		{
			// the default transition if the transition is not supported
			transitionToUse = "slideTransitions_notSupported";
		}
		return transitionToUse;
	},

	getTransitionTypeImgSrc: function()
	{
		var baseUrl = contextPath + window.staticRootPath + "/styles/css/presentation2/images/slidetrans/";
		var smil_type = this.attrs.smil_type;
		var smil_subtype = this.attrs.smil_subtype;
		var smil_direction = this.attrs.smil_direction;
		if (smil_direction == null)
		{
			smil_direction = "none";
		}

		if (smil_type == "none")
		{
			smil_type = null;
		}

		var transitionToUse = "";

		if (!smil_type)
		{
			return transitionToUse;
		}

		if (smil_type == "slideWipe")
		{
			if (smil_subtype == "fromTop")
			{
				transitionToUse = "slideTransitions_coverDown.png";
			}
			else if (smil_subtype == "fromRight")
			{
				transitionToUse = "slideTransitions_coverLeft.png";
			}
			else if (smil_subtype == "fromBottom")
			{
				transitionToUse = "slideTransitions_coverUp.png";
			}
			else if (smil_subtype == "fromLeft")
			{
				transitionToUse = "slideTransitions_coverRight.png";
			}
		}
		else if (smil_type == "pushWipe")
		{
			if (smil_subtype == "fromTop")
			{
				transitionToUse = "slideTransitions_pushDown.png";
			}
			else if (smil_subtype == "fromRight")
			{
				transitionToUse = "slideTransitions_pushLeft.png";
			}
			else if (smil_subtype == "fromBottom")
			{
				transitionToUse = "slideTransitions_pushUp.png";
			}
			else if (smil_subtype == "fromLeft")
			{
				transitionToUse = "slideTransitions_pushRight.png";
			}
		}
		else if (smil_type == "fade")
		{
			transitionToUse = "slideTransitions_fadeSmoothly.png";
		}
		else if (smil_type == "barWipe")
		{
			if (smil_subtype == "topToBottom" && smil_direction == "none")
			{
				transitionToUse = "slideTransitions_wipeDown.png";
			}
			else if (smil_subtype == "leftToRight" && smil_direction == "none")
			{
				transitionToUse = "slideTransitions_wipeRight.png";
			}
			else if (smil_subtype == "topToBottom" && smil_direction == "reverse")
			{
				transitionToUse = "slideTransitions_wipeUp.png";
			}
			else if (smil_subtype == "leftToRight" && smil_direction == "reverse")
			{
				transitionToUse = "slideTransitions_wipeLeft.png";
			}
		}
		else
		{
			// the default transition if the transition is not supported
			transitionToUse = "slideTransitions_notSupported.png";
		}
		return baseUrl + transitionToUse;
	}

});
