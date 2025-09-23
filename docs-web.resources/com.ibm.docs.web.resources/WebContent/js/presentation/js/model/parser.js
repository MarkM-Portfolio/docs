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

dojo.provide("pres.model.parser");
dojo.require("concord.widgets.SlideContent");
dojo.require("pres.model.Slide");
dojo.require("pres.model.Element");
dojo.require("pres.model.TableElement");

pres.model.parser = {

	cleanHTML: function(html)
	{
		html = html.replace(/[\r\n]*/ig, '');

		html = html.replace(/\shref\s*=/g, " _href_=");
		html = html.replace(/\ssrc\s*=/g, " _src_=");
		html = html.replace(/<\s*style*\s*/g, "<style_ ");
		html = html.replace(/<\s*\/*style*\s*>/g, "</style_>");
		html = html.replace(/<\s*head*\s*/g, "<head_ ");
		html = html.replace(/<\s*\/*head*\s*>/g, "</head_>");
		return html;
	},

	parse: function(html, isPartial, callback)
	{
		html = this.cleanHTML(html);
		var div = dojo.create("div", {}, dojo.body());
		div.style.display = "none";
		div.innerHTML = html;

		var styles = [];
		var title = "";

		if (!isPartial)
		{

			dojo.query("head_ > *", div).forEach(function(node)
			{
				if (node.tagName == "TITLE")
				{
					title = node.innerHTML;
				}
				if (node.tagName == "LINK")
				{
					var id = node.id;
					var src = node.getAttribute("_href_");
					var name = node.getAttribute("name") || node.getAttribute("stylename");
					if (src != null && src.indexOf("office_") >= 0)
					{
						// TODO, to confirm this, only allow office style here.
						styles.push({
							id: id,
							src: src,
							name: name
						});
					}
				}
				else if (node.tagName == "STYLE_")
				{

					var id = node.id;
					var text = node.innerText || node.textContent;
					var name = node.getAttribute("name") || node.getAttribute("stylename");
					styles.push({
						id: id,
						text: text,
						name: name
					});
				}
			});
		}
		var customValues = "";
		var customValue = dojo.byId("custom_style_mode_value");
		if (customValue != null)
		{
			customValues = customValue.innerHTML;
		}

		var slides = [];
		var docNode = null;
		try
		{
			docNode = dojo.query(".office_presentation", div)[0];
			docId = docNode.id;
		}
		catch (e)
		{
		}

		var root = docNode ? docNode : div;
		var childNodes = root.childNodes;

		if (isPartial)
		{
			this._parseSlideNodes(div, childNodes, childNodes.length, 0, slides, callback);
			return;
		}

		dojo.forEach(root.childNodes, dojo.hitch(this, function(wrapper, index)
		{
			if (dojo.hasClass(wrapper, "slideWrapper"))
			{
				var slide = this.parseSlide(wrapper);
				slides.push(slide);
			}
		}));

		setTimeout(function()
		{
			dojo.destroy(div);
		}, 5000);

		return {
			id: docId,
			title: title,
			styles: styles,
			customValues: customValues,
			slides: slides
		};

	},

	parsePartial: function()
	{

	},

	_parseSlideNodes: function(div, nodes, len, from, slides, callback)
	{
		var batchSize = 20;
		var hasNext = from + batchSize < len;
		for ( var i = from; i < Math.min(len, from + batchSize); i++)
		{
			var wrapper = nodes[i];
			if (wrapper && dojo.hasClass(wrapper, "slideWrapper"))
			{
				var slide = this.parseSlide(wrapper);
				slides.push(slide);
			}
		}
		if (hasNext)
		{
			var me = this;
			setTimeout(function()
			{
				me._parseSlideNodes(div, nodes, len, from + batchSize, slides, callback);
			}, 10);
		}
		else
		{
			setTimeout(function()
			{
				dojo.destroy(div);
			}, 5000);
			callback(slides);
		}
	},

	str2array: function(s)
	{
		var spaces = /\s+/;
		if (dojo.isString(s))
		{
			if (s.indexOf(" ") < 0)
			{
				return [s];
			}
			else
			{
				return s.split(spaces);
			}
		}
		// assumed to be an array
		return s || "";
	},

	cleanCss: function(css)
	{
		var arr = this.str2array(css);
		var css2 = "";
		arr.forEach(function(a)
		{
			if (!(a == "slideSelected" || a.indexOf("dojoDnd") == 0 || a == "resizableContainer"))
				css2 += a + " ";
		});
		return dojo.trim(css2);
	},

	parseSlide: function(wrapper, needIds)
	{
		var slide = new pres.model.Slide();
		var d = dojo;
		var n = d.query(".draw_page", wrapper)[0];
		var me = this;
		slide.wrapperId = wrapper.id;
		d.forEach(n.attributes, function(attr)
		{
			var name = attr.name;
			if (name == "id")
				slide.id = attr.value;
			else
			{
				if (name == "pageheight")
					slide.h = parseFloat(attr.value) || 0;
				if (name == "pagewidth")
					slide.w = parseFloat(attr.value) || 0;

				if (name == "class")
					slide.attrs[name] = me.cleanCss(attr.value);
				else
					slide.attrs[name] = attr.value;
			}
		});

		var es = dojo.filter(n.childNodes, function(e)
		{
			return dojo.hasClass(e, "draw_frame");
		});
		es.forEach(function(e)
		{
			var element = me.parseElement(slide, e, needIds);
			slide.elements.push(element);
		});

		var taskDiv = d.query(".taskContainer", wrapper)[0];
		if (taskDiv)
		{
			var taskContainer = new pres.model.TaskContainer();
			taskContainer.parent = slide;
			taskContainer.content = taskDiv.innerHTML;
			d.forEach(taskDiv.attributes, function(attr)
			{
				var name = attr.name;
				if (name == "id")
					taskContainer.id = attr.value;
				else
				{
					if (name == "class")
						taskContainer.attrs[name] = me.cleanCss(attr.value);
					else
						taskContainer.attrs[name] = attr.value;
				}
			});

			slide.taskContainer = taskContainer;
		}

		return slide;
	},

	parseElement: function(slide, e, needIds)
	{
		var d = dojo;
		var me = this;
		var family = me.getFamily(e);

		var s = e.style;
		var element;
		if (family == "table")
			element = new pres.model.TableElement();
		else if (family == "group")
			element = new pres.model.ShapeElement();
		else
			element = new pres.model.Element();
		element.t = (parseFloat(s.top) * slide.h / 100.0) || 0;
		element.l = (parseFloat(s.left) * slide.w / 100.0) || 0;
		element.w = (parseFloat(s.width) * slide.w / 100.0) || 2;
		element.h = (parseFloat(s.height) * slide.h / 100.0) || 2;
		element.z = parseFloat(s.zIndex) || 0;

		element.family = family;
		element.parent = slide;
		if (needIds)
		{
			element.ids = dojo.map(d.query("[id]", e), function(idc)
			{
				return idc.id;
			});
		}

		d.forEach(e.attributes, function(attr)
		{
			var name = attr.name;
			if (name == "id")
				element.id = attr.value;
			else
			{
				if (name == "class")
					element.attrs[name] = me.cleanCss(attr.value);
				else
					element.attrs[name] = attr.value;
			}
		});
		if (family == "notes")
			element.isNotes = true;
		if (family == "table")
		{
			var html = e.innerHTML;
			html = html.replace(/_href_=/g, "href=");
			html = html.replace(/_src_=/g, "src=");
			e.innerHTML = html;

			var tableDom = dojo.query("table", e)[0];
			var table = new pres.model.Table();
			table.parseDom(tableDom, element.w, element.h);
			table.parent = element;
			element.table = table;
		}
		else if (family == 'group')
		{
			var html = e.innerHTML;
			html = html.replace(/_href_=/g, "href=");
			html = html.replace(/_src_=/g, "src=");
			e.innerHTML = html;

			element.parseDom(e);
		}
		else
		{
			var html = e.innerHTML;
			html = html.replace(/_href_=/g, "href=");
			html = html.replace(/_src_=/g, "src=");
			element.content = html;
		}
		return element;
	},

	getFamily: function(node)
	{
		var presentationClass = dojo.attr(node, "presentation_class");
		var dataNode = node.children[0];
		//
		// dataNode can contain the following class: draw_text-box,
		//

		// The order of this IF statement is important.
		// We have to check for BACKGROUND objects before anything else to
		// ensure we DO NOT widgetize.
		if ((presentationClass == 'outline') || (presentationClass == 'title') || (presentationClass == 'subtitle'))
		{
			return 'text';
		}
		else if (dojo.attr(node, 'draw_layer') == "backgroundobjects")
		{
			return 'background';
		}
		else if ((presentationClass == 'graphic') || ((dataNode) && (dojo.hasClass(dataNode, 'draw_image'))))
		{
			return 'graphic';
		}
		else if ((presentationClass == 'date-time'))
		{
			return 'date-time';
		}
		else if (presentationClass == 'footer')
		{
			return 'footer';
		}
		else if (presentationClass == 'header')
		{
			return 'header';
		}
		else if (presentationClass == 'page-number')
		{
			return 'page-number';
		}
		else if (presentationClass == 'notes')
		{
			return 'notes';
		}
		else if ((dataNode) && (dataNode.tagName.toLowerCase() == 'table'))
		{ // table
			return 'table';
		}
		else if ((presentationClass == 'group'))
		{
			return 'group';
		}
		else if ((((dataNode) && (dojo.hasClass(dataNode, 'draw_text-box') || dojo.attr(dataNode, 'odf_element') == 'draw_text-box'))))
		{
			return 'text';
		}
		else
		{
			return 'unknown';
		}
	}

};