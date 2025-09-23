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

dojo.provide("pres.widget.Thumbnail");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("dijit._Contained");
dojo.require("dijit._CssStateMixin");
dojo.require("pres.utils.helper");
dojo.require("concord.widgets.headerfooter.headerfooterUtil");
dojo.require("pres.utils.htmlHelper");
dojo.require("pres.utils.shapeUtil");
dojo.require("pres.utils.a11yUtil");
dojo.require("pres.utils.placeHolderUtil");

dojo.declare("pres.widget.Thumbnail", [dijit._Widget, dijit._Templated, dijit._Contained, dijit._CssStateMixin], {

	baseClass: "thumbnail",
	templateString: dojo.cache("pres", "templates/Thumbnail.html"),
	index: 0,
	html: "",
	slide: null,
	selected: false,
	byClick: false,
	hidden: true,

	dirty: false,
	lockedUsers: null,

	checkLocks: function()
	{
		var slideId = this.slide.id;
		var otherUsers = pe.scene.locker.getLockedOtherUsers(slideId, true);
		if (this.lockedUsers && pres.utils.helper.isArraySame(otherUsers, this.lockedUsers))
			return;
		this.lockedUsers = otherUsers;
		this.renderLocks();
	},

	renderLocks: function()
	{
		if(this.markers)
			dojo.empty(this.markers);
		for ( var i = 0; i < this.lockedUsers.length; i++)
		{
			var initials = "..";
			var userId = this.lockedUsers[i];
			if (i < 3)
			{
				var u = pe.scene.getEditorStore().getEditorById(userId);
				var name = u.getName();
				var x = name.split(' ');
				initials = "";
				for ( var j = 0; j < x.length; j++)
				{
					initials += x[j].substring(0, 1).toUpperCase() + ".";
				}
				initials = initials.substring(0, initials.length - 1);
			}

			dojo.create("div", {
				className: "slide_marker slide_marker_user_" + userId,
				innerHTML: initials
			}, this.markers);

			if (i == 3)
			{
				break;
			}
		}
	},

	_setIndexAttr: function(index)
	{
		this.index = index;
		var slideNum = BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi(index + "") : index;
		this.number.innerHTML = "<span class='slideNum'>" + slideNum + "</span>";
		if (this.html && this.content)
			concord.widgets.headerfooter.headerfooterUtil.updatePageNumber(this.content, index);
	},

	getParent: function()
	{
		// make it fast;
		return pe.scene.slideSorter;
	},

	focus: function(e)
	{
		if (!this.byClick)
			this.selectItem();
	},

	onMouseDown: function(e)
	{
		if (e.which == 3)
			this.onClick(e, true);
	},

	onClick: function(e, rightMouse)
	{
		var sorter = this.getParent();

		if (sorter.dndMouseDowned)
		{
			sorter.dndMouseDowned = false;
			return;
		}

		var focusChild = sorter.focusedChild;

		this.byClick = true;
		this.selectItem(e, rightMouse);
		sorter.focusChild(this);
		this.byClick = false;
		
		if (e) {
			if (!this.isClickOnLink(e)) {
				dojo.stopEvent(e);
			}
		}
	},

	isClickOnLink:function (e) {
		var isLink = false;
		if (pe.scene.isViewCompactMode()) {
			var toElement = e.toElement;
			if (toElement) {
				isLink = PresCKUtil.checkNodeName(toElement, 'a');
				if (toElement.parentElement) {
					isLink = isLink || PresCKUtil.checkNodeName(toElement.parentElement, 'a');
				}
			}
		}
		return isLink;
	},

	selectItem: function(e, rightMouse)
	{
		var sorter = this.getParent();
		var meSelected = false;
		var ctrl = false;
		var shift = false;
		if (!pe.scene.isHTMLViewMode())
		{
			ctrl = (e && (e.ctrlKey || (dojo.isMac && e.metaKey)));
			shift = e && e.shiftKey;
		}
		if (e && (ctrl || shift))
		{
			if (ctrl)
			{
				if(!this.selected) {
					this.set("selected", true);
				} else {
					if(sorter.getSelectedThumbs().length > 1)
						this.set("selected", false);
				}
			}
			else if (shift)
			{
				// get last selected item, and select items between me and
				// it.
				if (sorter._lastSelectedItem)
				{
					var pos = sorter.getIndexOfChild(this);
					if (pos > sorter._lastSelectedItemPos)
						sorter.selectItems(sorter._lastSelectedItemPos, pos);
					else
						sorter.selectItems(pos, sorter._lastSelectedItemPos);
				}
				else
				{
					meSelected = true;
					this.selectMe();
				}
			}
		}
		else
		{

			if (rightMouse)
			{
				if (!this.selected)
				{
					this.selectMe();
					meSelected = true;
				}
			}
			else
			{
				this.selectMe();
				meSelected = true;
			}
		}

		sorter._lastSelectedItem = this;
		sorter._lastSelectedItemPos = sorter.getIndexOfChild(this);

		sorter.syncSelection();

		if (meSelected)
			dojo.publish("/thumbnail/selected", [sorter.getCurrentThumb()]);
	},

	selectMe: function()
	{
		var sorter = this.getParent();
		sorter.getChildren().forEach(function(c)
		{
			c.set("selected", false);
			c.set("current", false);
		});
		this.set("selected", true);
		this.set("current", true);

		if (pe.scene.windowFocused && !pe.scene.isMobile)
			this.domNode.focus();
	},

	postCreate: function()
	{
		this.inherited(arguments);
		var slideNum = BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi(this.index + "") : this.index;
		this.number.innerHTML = "<span class='slideNum'>" + slideNum + "</span>";
		this.transitionIconClass = this.slide.getTransitionType();
		dojo.addClass(this.transition, this.transitionIconClass);
		dojo.addClass(this.transitionImage,'dijitDisplayNone');
		if(dojo.hasClass(dojo.body(), "dijit_a11y"))
		{
			dojo.removeClass(this.transitionImage,'dijitDisplayNone');
			var transitionImageSrc = this.slide.getTransitionTypeImgSrc();
			if(transitionImageSrc)
				dojo.attr(this.transitionImage,'src',transitionImageSrc);
			else
				dojo.removeAttr(this.transitionImage,'src');
		}
		// dojo.setSelectable(this.domNode, false);

		if (!pe.scene.isMobile && !pe.scene.isMobileBrowser())
		{
			this.connect(this.domNode, "onmousedown", "onMouseDown");
		}

		if (!pe.scene.isMobile || !this.getParent().tapEnabled)
			this.connect(this.domNode, "onclick", "onClick");

		if (pe.scene.isViewCompactMode()) {
			this.cover && this.cover.parentNode && this.cover.parentNode.removeChild(this.cover);
		}
	},
	
	resizeLayout: function(scaleProps)
	{
		this.scale = scaleProps || this.getParent().getScaleProperties();
		var scale = {};
		var scaleFactor = 10;
		for ( var key in this.scale)
		{
			scale[key] = parseFloat(this.scale[key]) * scaleFactor + "px";
		}
		scale["-webkit-transform"] = "scale(" + 1 / scaleFactor + ")";
		scale["-webkit-transform-origin"] = "0 0 0";
		this.webkitScale = scale;
		var width = 0;
		for ( var x in this.scale)
		{
			if (x == "width")
				width = parseFloat(this.scale[x]);
			if (x == "font-size")
				this.content.style["fontSize"] = this.scale[x];
			else
				this.content.style[x] = this.scale[x];
		}
		
		this.markers.style.left = width + 38 + "px";
		
		this.resizeContent();
	},

	startup: function()
	{
		if (this._started)
			return;
		this.inherited(arguments);

		if (pe.scene.isMobile)
		{
			var sorter = this.getParent();
			if (!sorter.tapEnabled)
				this.connect(this.domNode, "onclick", "onClick");
		}

		setTimeout(dojo.hitch(this, this.checkLocks), 100);
		
		this.resizeLayout();
	},
	_cleanEventTimer :function (element)
	{
		clearTimeout(this[element.id + '_onElementAttrChanged']);
		clearTimeout(this[element.id + '_onShapeSizeChanged']);
		clearTimeout(this[element.id + '_onShapePosChanged']);
		clearTimeout(this[element.id + '_onShapeBgFillChanged']);
		clearTimeout(this[element.id + '_onShapeBorderFillChanged']);
	},
	
	_replaceNodeInCacheSlideHtmlDiv: function(element, event, cacheSlideHtml, slideEditor)
	{
		var dom = dojo.create("div", {}, null);
		var elem = element;
		// for webkit, shape still has the fill extension issue in slide editor
		// due to the last "dojo.destroy"
		// So for shape do not touch whole div. Only its text box will be updated.
		var forShape = event && event.indexOf("/shape") == 0;
		if (element.family == 'group' && element.txtBox && !forShape)
			elem = element.txtBox;
		dom.innerHTML = elem.getHTML();
		var box = dom.childNodes[0];
		var oldBox = dojo.query("div[id='" + elem.id + "']", cacheSlideHtml)[0];
		if (oldBox)
		{
			oldBox.parentNode.replaceChild(box, oldBox);
		}
		if (event == "/element/content/changed")
		{
			pres.utils.placeHolderUtil.i18n(box, true);
		}
		if (forShape)
		{
			pres.utils.shapeUtil.scaleShapeForZoom(slideEditor.mainNode.firstChild, slideEditor.mainBoxH, false);
		}
	},
	_onElementAttrChangedInCacheSlideHtmlDiv: function(element, cacheSlideHtml)
	{
		var eleDom = dojo.query("div[id='" + element.id + "']", cacheSlideHtml)[0];
		if (eleDom)
		{
			var attrsMap = element.getAttrsMap();
			dojo.forEach(eleDom.attributes, function(attr)
			{
				attr && eleDom.removeAttribute(attr.nodeName);
			});
			for ( var x in attrsMap)
			{
				var value = attrsMap[x];
				if (x == "style")
				{
					value = attrsMap[x] + ";" + element.getPositionStyle();
				}
				eleDom.setAttribute(x, value);
			}
			eleDom.id =  element.id;
			pres.utils.placeHolderUtil.i18n(eleDom, false);
		}
	},
	_onShapeSizeChangedInCacheSlideHtmlDiv: function(element, eventSource, cacheSlideHtml)
	{
		var eleDom = dojo.query("div[id='" + element.id + "']", cacheSlideHtml)[0];
		if (eleDom)
		{
			pres.utils.shapeUtil.updateViewSize(element, eleDom, false);
		}
	},
	
	_onShapePosChangedInCacheSlideHtmlDiv: function(element, eventSource, cacheSlideHtml)
	{
		var eleDom = dojo.query("div[id='" +element.id + "']", cacheSlideHtml)[0];
		if (eleDom)
		{
			pres.utils.shapeUtil.updateModelPos(element, eleDom);
		}
	},
	_onShapeBgFillChangedInCacheSlideHtmlDiv: function(element, eventSource, cacheSlideHtml)
	{
		var eleDom = dojo.query("div[id='" + element.id + "']", cacheSlideHtml)[0];
		if (eleDom)
		{
			pres.utils.shapeUtil.updateViewFill(element, eleDom, false, 'bg');
		}
	},

	_onShapeOpacityFillChangedInCacheSlideHtmlDiv: function(element, eventSource, cacheSlideHtml)
	{
		var eleDom = dojo.query("div[id='" + element.id + "']", cacheSlideHtml)[0];
		if (eleDom)
		{
			pres.utils.shapeUtil.updateViewFill(element, eleDom, false, 'op');
		}
	},
	
	_onShapeLineStyleChangedInCacheSlideHtmlDiv: function(element, eventSource , changeType, cacheSlideHtml)
	{
		var eleDom = dojo.query("div[id='" + element.id + "']", cacheSlideHtml)[0];
		if (eleDom)
		{
			pres.utils.shapeUtil.updateLineTypeView(element, eleDom, false, changeType);
		}
	},
	
	_onShapeBorderFillChangedInCacheSlideHtmlDiv: function(element, eventSource, cacheSlideHtml)
	{
		var eleDom = dojo.query("div[id='" + element.id + "']", cacheSlideHtml)[0];
		if (eleDom)
		{
			pres.utils.shapeUtil.updateViewFill(element, eleDom, false, 'bd');
		}
	},
	
	dealMessageForCacheSlideHtmlDiv: function(event, element, eventSource)
	{
		//update the cached slideHtml dom content, same logical as the one for this.html
		if (this.slide.htmlDiv && this.slide.htmlDiv.firstElementChild)
		{
			var cacheSlideHtml = this.slide.htmlDiv.firstElementChild;
			var slideEditor = pe.scene.slideEditor;
			var a11yEnabled = pres.utils.a11yUtil.enabled;
			if (event == "/element/inserted")
			{
				var dom = dojo.create("div", {}, null);
				dom.innerHTML = element.getHTML();
				var box = dom.childNodes[0];
				cacheSlideHtml.appendChild(box);
				pres.utils.placeHolderUtil.i18n(box, true);
				if (element.family == "group" && slideEditor)
				{
					pres.utils.shapeUtil.scaleShapeForZoom(slideEditor.mainNode.firstChild, slideEditor.mainBoxH, false);
				}
				dojo.destroy(dom);
			}
			else if (event == "/element/deleted")
			{
				var eleDom = dojo.query("div[id='" + element.id + "']", cacheSlideHtml)[0];
				eleDom && dojo.destroy(eleDom);
			}
			else if (event == "/elements/deleted")
			{
				dojo.forEach(element, dojo.hitch(this, function(ele)
				{
					var eleDom = dojo.query("div[id='" + ele.id + "']", cacheSlideHtml)[0];
					eleDom && dojo.destroy(eleDom);
				}));
			}
			else if (event == "/element/content/changed" || event.indexOf("/table/") == 0)
			{
				this._replaceNodeInCacheSlideHtmlDiv(element, event, cacheSlideHtml, slideEditor);
			}
			else if (event == "/element/attr/changed" || event == "/element/style/changed")
			{
				this._onElementAttrChangedInCacheSlideHtmlDiv(element, cacheSlideHtml);
			}
			else if (event == "/shape/size/changed")
			{
				if (a11yEnabled) {
					this._replaceNodeInCacheSlideHtmlDiv(element, event, cacheSlideHtml, slideEditor);
				} else {
					this._onShapeSizeChangedInCacheSlideHtmlDiv(element, eventSource, cacheSlideHtml);
				}
			}
			else if (event == "/shape/pos/changed")
			{
				this._onShapePosChangedInCacheSlideHtmlDiv(element, eventSource, cacheSlideHtml);
			}
			else if (event == "/shape/bgfill/changed")
			{
				if (a11yEnabled) {
					this._replaceNodeInCacheSlideHtmlDiv(element, event, cacheSlideHtml, slideEditor);
				} else {
					this._onShapeBgFillChangedInCacheSlideHtmlDiv(element, eventSource, cacheSlideHtml);
				}
			}
			else if (event == "/shape/opacityfill/changed")
			{
				if (a11yEnabled) {
					this._replaceNodeInCacheSlideHtmlDiv(element, event, cacheSlideHtml, slideEditor);
				} else {
					this._onShapeOpacityFillChangedInCacheSlideHtmlDiv(element, eventSource, cacheSlideHtml);
				}
			}
			else if (event == "/shape/borderfill/changed")
			{
				if (a11yEnabled) {
					this._replaceNodeInCacheSlideHtmlDiv(element, event, cacheSlideHtml, slideEditor);
				} else {
					this._onShapeBorderFillChangedInCacheSlideHtmlDiv(element, eventSource, cacheSlideHtml);
				}
			}
			else if (event == "/shape/linestyle/changed")
			{
				if (a11yEnabled) {
					this._replaceNodeInCacheSlideHtmlDiv(element, event, cacheSlideHtml, slideEditor);
				} else {
					this._onShapeLineStyleChangedInCacheSlideHtmlDiv(element, eventSource, cacheSlideHtml);
				}
			}
		}
	},
	dispatch: function(event, element, eventSource)
	{
		if (event == "/slide/attr/changed")
		{
			dojo.removeClass(this.transition, this.transitionIconClass);
			this.transitionIconClass = this.slide.getTransitionType();
			dojo.addClass(this.transition, this.transitionIconClass);
			dojo.addClass(this.transitionImage,'dijitDisplayNone');
			if(dojo.hasClass(dojo.body(), "dijit_a11y"))
			{
				dojo.removeClass(this.transitionImage,'dijitDisplayNone');
				var transitionImageSrc = this.slide.getTransitionTypeImgSrc();
				if(transitionImageSrc)
					dojo.attr(this.transitionImage,'src',transitionImageSrc);
				else
					dojo.removeAttr(this.transitionImage,'src');
			}
		}

		if (this.html)
		{
			var a11yEnabled = pres.utils.a11yUtil.enabled;
			if (event == "/element/inserted")
			{
				this._cleanEventTimer(element);
				var dom = dojo.create("div", {}, null);
				dom.innerHTML = element.getHTML();
				pres.utils.a11yUtil.addPrefixId(dom);
				var box = dom.childNodes[0];
				var thumbnail = dojo.query(".draw_page", this.content)[0];
				thumbnail.appendChild(box);
				pres.utils.placeHolderUtil.i18n(box, true);
				pres.utils.htmlHelper.removeTabIndex(box);
				if (element.family == "group")
				{
					pres.utils.shapeUtil.scaleShapeForZoom(thumbnail, null, true, box);
					// add fix to resolve chrome fill issue when slide switch
					if (!(dojo.isIE || dojo.isEdge)) {
						pres.utils.shapeUtil.fixShapeIds(box);
					}
				}
				dojo.destroy(dom);
			}
			else if (event == "/element/deleted")
			{
				this._cleanEventTimer(element);
				var id = pres.utils.a11yUtil.addPrefixId(element.id);
				var eleDom = dojo.query("div[id='" + id + "']", this.content)[0];
				eleDom && dojo.destroy(eleDom);
			}
			else if (event == "/elements/deleted")
			{
				dojo.forEach(element, dojo.hitch(this, function(ele)
				{
					this._cleanEventTimer(ele);
					var id = pres.utils.a11yUtil.addPrefixId(ele.id);
					var eleDom = dojo.query("div[id='" + id + "']", this.content)[0];
					eleDom && dojo.destroy(eleDom);
				}));
			}
			else if (event == "/element/content/changed" || event.indexOf("/table/") == 0)
			{
				this._cleanEventTimer(element);
				this._replaceNode(element, event);
			}
			else if (event == "/element/attr/changed" || event == "/element/style/changed")
			{
				this[element.id + '_onElementAttrChanged'] = setTimeout(dojo.hitch(this, function()
				{
					this._onElementAttrChanged(element);
				}), 100);
			}
			else if (event == "/shape/size/changed")
			{
				if (a11yEnabled) {
					this._replaceNode(element, event);
				}
				else
				{
					this[element.id + '_onShapeSizeChanged'] = setTimeout(dojo.hitch(this, function()
					{
						this._onShapeSizeChanged(element, eventSource);
					}), 100);
				}
			}
			else if (event == "/shape/pos/changed")
			{
				this[element.id + '_onShapePosChanged'] = setTimeout(dojo.hitch(this, function()
				{
					this._onShapePosChanged(element, eventSource);
				}), 100);
			}
			else if (event == "/shape/bgfill/changed")
			{
				if (a11yEnabled) {
					this._replaceNode(element, event);
				}
				else
				{
					this[element.id + '_onShapeBgFillChanged'] = setTimeout(dojo.hitch(this, function()
					{
						this._onShapeBgFillChanged(element, eventSource);
					}), 100);
				}
			}
			else if (event == "/shape/opacityfill/changed")
			{
				if (a11yEnabled) {
					this._replaceNode(element, event);
				}
				else
				{
					this[element.id + '_onShapeOpacityFillChanged'] = setTimeout(dojo.hitch(this, function()
					{
						this._onShapeOpacityFillChanged(element, eventSource);
					}), 100);
				}
			}
			else if (event == "/shape/borderfill/changed")
			{
				if (a11yEnabled) {
					this._replaceNode(element, event);
				}
				else
				{
					this[element.id + '_onShapeBorderFillChanged'] = setTimeout(dojo.hitch(this, function()
					{
						this._onShapeBorderFillChanged(element, eventSource);
					}), 100);
				}
			}
			else if (event == "/shape/linestyle/changed")
			{
				if (a11yEnabled) {
					this._replaceNode(element, event);
				}
				else
				{
					this[element.id + '_onShapeLineStyleChanged'] = setTimeout(dojo.hitch(this, function()
					{
						this._onShapeLineStyleChanged(element, eventSource);
					}), 100);
				}
			}
		}
		//the cached slideHtml dom content should be updated too, same logical as the one for this.html
		this.dealMessageForCacheSlideHtmlDiv(event, element, eventSource);
		if(eventSource && eventSource.undo)
		{
			var toThumb = this;
			var slideSorter = this.getParent();
			var cThumb = slideSorter.getCurrentThumb();
			if(cThumb != toThumb)
			{
				setTimeout(dojo.hitch(this, function()
				{
					toThumb.selectMe();
					slideSorter.syncSelection();
					slideSorter.focusChild(toThumb);
				}), 150);
			}
		}
	},

	_replaceNode: function(element, event)
	{
		var dom = dojo.create("div", {}, null);
		var elem = element;
		// for webkit, shape still has the fill extension issue in slide editor
		// due to the last "dojo.destroy"
		// So for shape do not touch whole div. Only its text box will be updated.
		var forShape = event && event.indexOf("/shape") == 0;
		if (element.family == 'group' && element.txtBox && !forShape)
			elem = element.txtBox;
		dom.innerHTML = elem.getHTML();
		pres.utils.a11yUtil.addPrefixId(dom);
		var box = dom.childNodes[0];
		var id = pres.utils.a11yUtil.addPrefixId(elem.id);
		var oldBox = dojo.query("div[id='" + id + "']", this.content)[0];
		if (oldBox)
		{
			oldBox.parentNode.replaceChild(box, oldBox);
		}
		if (event == "/element/content/changed")
		{
			pres.utils.placeHolderUtil.i18n(box, true);
			pres.utils.htmlHelper.removeTabIndex(box);
		}
		if (forShape)
		{
			var thumbnail = dojo.query(".draw_page", this.content)[0];
			pres.utils.shapeUtil.scaleShapeForZoom(thumbnail, null, true, box);
			// add fix to resolve chrome fill issue when slide switch
			if (!(dojo.isIE || dojo.isEdge))
				pres.utils.shapeUtil.fixShapeIds(box);
		}
	},

	_onElementAttrChanged: function(element)
	{
		if (this.slide == element.parent && this.html)
		{
			var id = pres.utils.a11yUtil.addPrefixId(element.id);
			var eleDom = dojo.query("div[id='" + id + "']", this.content)[0];
			if (eleDom)
			{
				var attrsMap = element.getAttrsMap();
				dojo.forEach(eleDom.attributes, function(attr)
				{
					attr && eleDom.removeAttribute(attr.nodeName);
				});
				for ( var x in attrsMap)
				{
					var value = attrsMap[x];
					if (x == "style")
					{
						value = attrsMap[x] + ";" + element.getPositionStyle();
					}
					eleDom.setAttribute(x, value);
				}
				eleDom.id = id;
				pres.utils.placeHolderUtil.i18n(eleDom, true);
				pres.utils.htmlHelper.removeTabIndex(eleDom);
			}
		}
	},

	_onShapeSizeChanged: function(element, eventSource)
	{
		if (this.slide == element.parent && this.html)
		{
			var id = pres.utils.a11yUtil.addPrefixId(element.id);
			var eleDom = dojo.query("div[id='" + id + "']", this.content)[0];
			if (eleDom)
			{
				// custom shape
				// true means from thumb nail
				pres.utils.shapeUtil.updateViewSize(element, eleDom, true);
			}
		}
	},
	
	_onShapePosChanged: function(element, eventSource)
	{
		if (this.slide == element.parent && this.html)
		{
			var id = pres.utils.a11yUtil.addPrefixId(element.id);
			var eleDom = dojo.query("div[id='" +id + "']", this.content)[0];
			if (eleDom)
			{
				// custom shape
				// true means from thumb nail
				pres.utils.shapeUtil.updateModelPos(element, eleDom);
			}
		}
	},

	_onShapeBgFillChanged: function(element, eventSource)
	{
		if (this.slide == element.parent && this.html)
		{
			var id = pres.utils.a11yUtil.addPrefixId(element.id);
			var eleDom = dojo.query("div[id='" + id + "']", this.content)[0];
			if (eleDom)
			{
				// custom shape
				// true means from thumb nail
				pres.utils.shapeUtil.updateViewFill(element, eleDom, true, 'bg');
			}
		}
	},

	_onShapeOpacityFillChanged: function(element, eventSource)
	{
		if (this.slide == element.parent && this.html)
		{
			var id = pres.utils.a11yUtil.addPrefixId(element.id);
			var eleDom = dojo.query("div[id='" + id + "']", this.content)[0];
			if (eleDom)
			{
				pres.utils.shapeUtil.updateViewFill(element, eleDom, true, 'op');
			}
		}
	},
	
	_onShapeLineStyleChanged: function(element, eventSource , changeType)
	{
		if (this.slide == element.parent && this.html)
		{
			var id = pres.utils.a11yUtil.addPrefixId(element.id);
			var eleDom = dojo.query("div[id='" + id + "']", this.content)[0];
			if (eleDom)
			{
				// custom shape
				// true means from thumb nail
				pres.utils.shapeUtil.updateLineTypeView(element, eleDom, true, changeType );
			}
		}
	},
	
	_onShapeBorderFillChanged: function(element, eventSource)
	{
		if (this.slide == element.parent && this.html)
		{
			var id = pres.utils.a11yUtil.addPrefixId(element.id);
			var eleDom = dojo.query("div[id='" + id + "']", this.content)[0];
			if (eleDom)
			{
				// custom shape
				// true means from thumb nail
				pres.utils.shapeUtil.updateViewFill(element, eleDom, true, 'bd');
			}
		}
	},

	showDom: function()
	{
		if (!this.html || !this.slideWrapper)
			this.renderContent();
		if (this.hidden)
		{
			if(this.blockContentImage){
				var slideHtml = this.slideWrapper.innerHTML;
				var viewerSnapshotId = pe.scene.htmlViewerHasSnapshotId?DOC_SCENE.version:null;
				slideHtml = pres.utils.htmlHelper.loadContentImage(slideHtml, viewerSnapshotId);
				this.slideWrapper.innerHTML = slideHtml;
				this.blockContentImage = false;
			}
			this.slideWrapper.style.display = "";
			this.hidden = false;
		}
	},

	hideDom: function(timer)
	{
		if (this.slideWrapper)
			this.slideWrapper.style.display = "none";
		if (this.getParent().hardSwap)
		{
			this.clearContent();
		}
		this.hidden = true;
	},

	renderContent: function(force)
	{
		if (this.html && !force)
			return;
		var html = this.slide.getHTML(null, false, false, false, true);
		if (pe.scene.htmlViewerHasSnapshotId)
			html = concord.util.uri.addSidToContentImage(html);
		if (pe.scene.canCacheSlideHTMLDiv && pe.scene.slideEditor) {
			//store the html sting as slideEidtor DOM node, to improve the user experice after cahce been disabled.
			var slideEditor = pe.scene.slideEditor;
			var slideHtmlDiv = slideEditor.getSlideHtmlDiv(this.slide);
			if(pe.scene.notCacheFirstSlide) {
				delete pe.scene.notCacheFirstSlide;
			} else {
				slideHtmlDiv.innerHTML = html;
			}
		}
		var viewerSnapshotId = pe.scene.htmlViewerHasSnapshotId?DOC_SCENE.version:null;
		if(this.hidden){
			html = pres.utils.htmlHelper.blockContentImage(html, viewerSnapshotId);
			this.blockContentImage = true;
		} else {
			html = pres.utils.htmlHelper.loadContentImage(html, viewerSnapshotId);
			this.blockContentImage = false;			
		}
		if (this.html != html)
		{
			var display = this.hidden ? "none" : "";
			this.content.innerHTML = this.html = "<div class='slideWrapper' id='" + this.slide.wrapperId + "' style='display:" + display + "'>" + html + "</div>";
			
			pres.utils.a11yUtil.addPrefixId(this.content);
			
			var hfu = concord.widgets.headerfooter.headerfooterUtil;
			if (this.index)
				hfu.updatePageNumber(this.content, this.index);
			hfu.updateHeaderFooterDateTimeFields(this.content);
			pres.utils.placeHolderUtil.i18n(this.content, true);
			pres.utils.htmlHelper.removeTabIndex(this.content);
			// Update shape scales
			this.slideWrapper = this.content.firstChild;
			// Fix shape def Ids
			// add fix to resolve chrome fill issue when slide switch
			var slide = this.content.firstChild.firstChild;
			pres.utils.shapeUtil.fixDomShapeIds(slide);
			pres.utils.textboxUtil.fixBoxDom(slide);
			
			this.resizeContent(true);
		}
	},
	
	resizeContent: function(render)
	{
		if (this.html && this.content)
		{
			var slide = this.content.firstChild.firstChild;
			dojo.style(slide, dojo.isWebKit ? this.webkitScale : this.scale);
			var me = this;
			if (this.hidden && !render)
				setTimeout(function(){
					pres.utils.shapeUtil.scaleShapeForZoom(slide, dojo.style(me.content, 'height'), true);
				}, 10);
			else
				pres.utils.shapeUtil.scaleShapeForZoom(slide, dojo.style(this.content, 'height'), true);
			
		}
	},

	clearContent: function()
	{
		this.html = "";
		this.content.innerHTML = "";
	},
	
	destroy: function()
	{
		if (pe.scene.canCacheSlideHTMLDiv && pe.scene.slideEditor) {
			var slideEditor = pe.scene.slideEditor;
			var slideHtmlDiv = slideEditor.getSlideHtmlDiv(this.slide);
			dojo.destroy(slideHtmlDiv);
		}
		this.inherited(arguments);
	}
	
});
