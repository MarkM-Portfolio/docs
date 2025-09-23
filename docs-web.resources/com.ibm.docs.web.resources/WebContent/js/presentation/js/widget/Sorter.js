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

dojo.provide("pres.widget.Sorter");

dojo.require("dijit.layout.ContentPane");
dojo.require("dijit._Container");
dojo.require("dijit._Contained");
dojo.require("dijit._KeyNavContainer");
dojo.require("pres.widget.Thumbnail");
dojo.require("pres.widget.SorterDnd");
dojo.require("pres.widget.MenuContext");

dojo.require("concord.pres.PresConstants");
dojo.require("concord.pres.PresCKUtil");
dojo.require("pres.utils.shapeUtil");

dojo.require("pres.utils.helper");
dojo.require("pres.config.sorterContextMenu");
dojo.require("pres.mobile.SnapshotMgr");
dojo.requireLocalization("concord.widgets", "slidesorter");
dojo.requireLocalization("concord.util", "a11y");
dojo.requireLocalization("pres", "pres");

/*
 * Sorter listen to /data/loaded event to build the thumbnail widget in it. (1) Manager the selection, send /sorter/selection event out. (2) Build dnd function for re-order, and move slides. (3) Construct the context menu (4) Swap in/out capability (5) Delete slides
 */

dojo.declare("pres.widget.Sorter", [dijit.layout.ContentPane, dijit._Contained, dijit._KeyNavContainer, pres.widget.SorterDnd], {

	viewCompactScaleRate: 1,
	
	tapEnabled: false,

	// empty the html or just set display:none to swap in and out.
	// true means empty the html (lazy load as much as possible)
	hardSwap: false, 
	swapEnabled: true,
	// buffer size in the head and tail for swapping
	swapBuffer: 2,

	slideWidth: 130,

	selectedThumbs: null,

	getTotalSlideNum: function()
	{
		// for mobile compatability.
		return pe.scene.doc.slides.length;
	},

	getSelectedThumbs: function()
	{
		return this.selectedThumbs;
	},

	getSelectedIndexs: function()
	{
		var indexs = [];
		var children = this.getChildren();
		for ( var i = 0; i < children.length; i++)
		{
			var t = children[i];
			if (t.selected)
				indexs.push(i);
		}
		return indexs;
	},

	getSelectedIds: function()
	{
		var indexs = [];
		var children = this.getChildren();
		for ( var i = 0; i < children.length; i++)
		{
			var t = children[i];
			if (t.selected)
				indexs.push(t.slide.wrapperId);
		}
		return indexs;
	},

	getCurrentIndex: function()
	{
		var t = this.getCurrentThumb();
		if (t)
			return dojo.indexOf(this.getChildren(), t);
	},

	// main selected thumb
	getCurrentThumb: function()
	{
		for ( var i = 0; i < this.selectedThumbs.length; i++)
		{
			var t = this.selectedThumbs[i];
			if (t.current)
				return t;
		}
	},

	refresh: function()
	{
	},

	buildContextMenu: function()
	{
	},

	isSelectionLocked: function()
	{
		return dojo.some(this.selectedThumbs, function(t)
		{
			return pe.scene.locker.isSlideOrContentLocked(t.slide.id);
		});
	},

	focus: function(e)
	{
		if (!pe.scene.windowFocused)
			return;
		this.domNode.focus();
		var currentThumb = this.getCurrentThumb();
		if (currentThumb)
			currentThumb.domNode.focus();
	},

	focusChild: function()
	{
		if (!pe.scene.windowFocused)
			return;
		if (this.inDnd)
			return;
		this.inherited(arguments);
	},
	
	focusCurrentThumbDom: function()
	{
		if (!pe.scene.windowFocused)
			return;
		var currentThumb2 = this.getCurrentThumb();
		try
		{
			if (currentThumb2 && document.activeElement != currentThumb2.domNode)
				currentThumb2.domNode.focus();
		}
		catch (e)
		{
		}
	},

	syncSelection: function(forceUpdate)
	{
		var selection = [];
		var thumbs = this.getChildren();
		if (thumbs.length === 0)
			return;
		var currentThumb = this.getCurrentThumb();
		var current = null;
		dojo.forEach(thumbs, function(t, i)
		{
			if (t.selected)
			{
				if (current)
					t.current = false;
				else if (t.current)
					current = t;
				selection.push(t);
			}
			else
			{
				t.current = false;
			}
		});
		if (selection.length == 0)
		{
			this.focusFirstChild();
			thumbs[0].selectItem();
		}
		else
		{
			if (!current)
			{
				selection[0].current = true;
				current = selection[0];
			}
			
			if (pe.scene.isHTMLViewMode())
			{
				if (selection.length > 1 && current)
				{
					// only allow one selection in html viewer mode.
					current.selectMe();
					return;
				}
			}
			

			var sameSelection = this.selectedThumbs && pres.utils.helper.isArraySame(this.selectedThumbs, selection);
			if (!sameSelection)
				this.selectedThumbs = selection;

			var newCurrentThumb = this.getCurrentThumb();
			if (currentThumb != newCurrentThumb && newCurrentThumb)
			{
				dojo.publish("/thumbnail/selected", [newCurrentThumb]);
				this.readCurrentThumb();
				if (pe.scene.isHTMLViewMode() && newCurrentThumb.domNode){
					newCurrentThumb.domNode.scrollIntoView();
				}
			}
			if (!forceUpdate && sameSelection)
			{
				return;
			}
			this.syncDnd();
			dojo.publish("/sorter/selection/changed", [this.selectedThumbs]);
		}
	},
	readCurrentThumb: function(){
		var newCurrentThumb = this.getCurrentThumb();
		var index = dojo.indexOf(this.getChildren(), newCurrentThumb) + 1;
		var readStr = dojo.string.substitute(pe.presStrs.acc_slide, [index]) + pe.presStrs.acc_selected;
		var slideContent = (newCurrentThumb.slideWrapper && newCurrentThumb.slideWrapper.textContent) || "empty";
		readStr = readStr + " text content is " + slideContent;
		pe.scene.slideEditor && pe.scene.slideEditor.announce(readStr);
		if(pe.scene.isHTMLViewMode() && dojo.isFF) newCurrentThumb.focus();
	},
	startup: function()
	{
		if (this._started)
			return;
		this.inherited(arguments);
		this.startupKeyNavChildren();
	},

	selectItems: function(from, to, current)
	{
		var thumbs = this.getChildren();
		var currentThumb = this.getCurrentThumb();
		dojo.forEach(thumbs, dojo.hitch(this, function(t, i)
		{
			if (i >= from && i <= to)
			{
				if (i === current)
					t.set("current", true);
				t.set("selected", true);
			}
			else
				t.set("selected", false);
		}));
		this.syncSelection();

		if (!pe.scene.isMobile)
		{
			this.focusCurrentThumbDom();
		}
	},

	selectItemsByIds: function(idsArr, currentId)
	{
		var thumbs = this.getChildren();
		var length = arguments.length;
		var currentThumb = this.getCurrentThumb();
		// index array
		if (!dojo.isArray(idsArr))
			idsArr = [idsArr];
		dojo.forEach(thumbs, dojo.hitch(this, function(t, i)
		{
			var slide = t.slide;
			var id = slide.wrapperId;
			if (dojo.indexOf(idsArr, id) > -1)
			{
				if (id === currentId)
					t.set("current", true);
				t.set("selected", true);
			}
			else
				t.set("selected", false);
		}));
		this.syncSelection();
		this.focusCurrentThumbDom();
	},

	selectItemsByIndex: function(indexArr, current)
	{
		var thumbs = this.getChildren();
		var length = arguments.length;
		var currentThumb = this.getCurrentThumb();
		// index array
		if (!dojo.isArray(indexArr))
			indexArr = [indexArr];
		dojo.forEach(thumbs, dojo.hitch(this, function(t, i)
		{
			if (dojo.indexOf(indexArr, i) > -1)
			{
				if (i === current)
					t.set("current", true);
				t.set("selected", true);
			}
			else
				t.set("selected", false);
		}));
		this.syncSelection();
		this.focusCurrentThumbDom();
	},

	updateOrders: function()
	{
		//48987: [MVC][Regression][Safari]Slide number is not correct after move slide ,v5 only
		setTimeout(dojo.hitch(this, function()
		{
			var change = false;
			dojo.forEach(this.getChildren(), function(t, index)
					{
				if (t.attr("index") != index + 1)
				{
					change = true;
					t.attr("index", index + 1);
				}
					});
			if (change)
				dojo.publish("/sorter/order/changed", []);
		}, 100));
	},

	dispatch: function(event)
	{
		var me = this;
		this.subscribe(event, function(ele, eventSource)
		{
			if (dojo.isArray(ele))
			{
				dojo.forEach(ele, function(ee)
				{
					me._dispatch(event, ee, eventSource);
				});
			}
			else
				me._dispatch(event, ele, eventSource);
		});
	},

	_dispatch: function(event, ele, eventSource)
	{
		var slide = (ele instanceof pres.model.Slide) ? ele : ele.parent;
		var children = this.getChildren();
		for ( var i = 0; i < children.length; i++)
		{
			var child = children[i];
			if (child.slide == slide)
			{
				if (child.dispatch)
				{
					child.dispatch(event, ele, eventSource);
				}
				break;
			}
		}
	},

	scrollAdjust: function()
	{
		pe.inScrollAdjust = true;
		clearTimeout(this._delayOnFocusViewMode);
		clearTimeout(this._adjustTimer);
		this._adjustTimer = setTimeout(dojo.hitch(this, this.adjustThumbnailContent), this.hardSwap ? 300 : 100);
	},
	
	onFocusViewMode: function()
	{
		clearTimeout(this._delayOnFocusViewMode);
		this._delayOnFocusViewMode = setTimeout(dojo.hitch(this, function()
		{
			if(pe.inScrollAdjust)
				return;
			var thumb = this.getCurrentThumb();
			if (!thumb)
				return;
		    if (pe.scene.isViewCompactMode()) {
		        thumb.focus();
		        var node = dojo.query(".contentWrapper", thumb.domNode)[0];
		        var cssText = node.style.cssText;
		        node.style.cssText = cssText + ";outline: 3px solid blue !important";
		        setTimeout(function(){
		           node.style.cssText = cssText;
		        }, 2000);
		    }
			if (dojo.isFF)
				this.readCurrentThumb();
		}), 100);
	},

	postCreate: function()
	{
		pe.scene.slideSorter = this;
		if (pe.scene.isMobile)
			this.swapEnabled = false;
		this.snapshotMgr = new pres.mobile.SnapshotMgr();
		this.selectedThumbs = [];
		this.STRINGS = dojo.i18n.getLocalization("concord.widgets", "slidesorter");
		if (!pe.presStrs)
			pe.presStrs = dojo.i18n.getLocalization("pres", "pres");
		this.a11ySTRINGS = dojo.i18n.getLocalization("concord.util", "a11y");

		this.inherited(arguments);
		this.containerNode = dojo.create("div", {}, this.domNode);
		this.containerNode.style.zIndex = 0;

		this._scrollTop = 0;

		var k = dojo.keys;
		this.connectKeyNavHandlers([k.UP_ARROW, k.LEFT_ARROW, k.PAGE_UP], [k.DOWN_ARROW, k.RIGHT_ARROW, k.PAGE_DOWN]);
		this.subscribe("/data/loaded", this.onDataLoaded);
		this.subscribe("/data/css/loaded", this.onCssLoaded);

		if (this.swapEnabled)
			this.connect(this.domNode, "onscroll", this.scrollAdjust);
		
		//[Work Item 50981]  New:  [Preview]Tab to presentation editor, can't read slide1, and press tab will make focus jump in slide editor [o]
		if(pe.scene.isHTMLViewMode())
			this.connect(this.domNode, "onfocus", "onFocusViewMode");
		
		if (pe.scene.isHTMLViewMode() || pe.scene.isMobile)
			return;

		this.subscribe("/msg/layout/before", function()
		{
			this._selectedIndexs = this.getSelectedIndexs();
			this._currentIndex = this.getCurrentIndex();
		});
		
		this.subscribe("/msg/layout/after", function(){
			this.updateOrders();
			this.selectItemsByIndex(this._selectedIndexs, this._currentIndex);
			this.adjustThumbnailContent();
			setTimeout(dojo.hitch(this, function()
			{
				this.getCurrentThumb().domNode.focus();
			}, 0));
		});

		this.subscribe("/editor/focus", this.deselectMultiple);
		this.subscribe("/lock/slides/updated", this.updateUserIndicator);

		this.dispatch("/element/attr/changed");
		this.dispatch("/element/style/changed");
		this.dispatch("/shape/size/changed");
		this.dispatch("/shape/pos/changed");
		this.dispatch("/shape/bgfill/changed");
		this.dispatch("/shape/borderfill/changed");
		this.dispatch("/shape/opacityfill/changed");		
		this.dispatch("/shape/linestyle/changed");
		this.dispatch("/element/deleted");
		this.dispatch("/elements/deleted");
		this.dispatch("/element/inserted");
		this.dispatch("/element/content/changed");

		this.dispatch("/table/content/updated");

		this.dispatch("/table/row/resized");
		this.dispatch("/table/row/moved");
		this.dispatch("/table/row/deleted");
		this.dispatch("/table/row/inserted");
		this.dispatch("/table/row/set/header");
		this.dispatch("/table/row/remove/header");

		this.dispatch("/table/col/resized");
		this.dispatch("/table/col/moved");
		this.dispatch("/table/col/deleted");
		this.dispatch("/table/col/inserted");
		this.dispatch("/table/col/set/header");
		this.dispatch("/table/col/remove/header");

		this.dispatch("/table/cell/cleared");
		this.dispatch("/table/cell/pasted");
		this.dispatch("/table/cell/colored");

		this.dispatch("/table/style/updated");
		this.dispatch("/table/height/adjust");

		// TODO, html dirty?
		this.dispatch("/slide/attr/changed");

		this.subscribe("/scene/user/left", function()
		{
			this.syncSelection(true);
		});

		this.subscribe("/scene/user/joined", function()
		{
			this.syncSelection(true);
			setTimeout(dojo.hitch(this, function()
			{
				// in case conflict, send it again.
				this.syncSelection(true);
			}), Math.random() * 10);
		});
		this.subscribe("/scene/coedit/started", function()
		{
			this.syncSelection(true);
		});
		var me = this;

		this.subscribe("/slide/inserted", this.onSlideInserted);
		this.subscribe("/slide/deleted", this.onSlideDeleted);
		this.subscribe("/slides/deleted", this.onSlidesDeleted);
		this.subscribe("/slides/moved", this.onSlidesMoved);

		this.subscribe("/slides/commentselected", this.onCommentSelected);

		this.subscribe("/msg/undo/back", function(slideId)
		{
			var slide = pe.scene.doc.find(slideId);
			if (slide)
			{
				if (me.selectedThumb && me.selectedThumb.slide != slide)
				{
					dojo.forEach(me.getChildren(), function(c)
					{
						if (c.slide == slide)
						{
							c.onClick();
						}
					});
				}
			}
		});
		this.subscribe("/data/reset", this.reset);

		this.connect(this.containerNode, "onkeypress", "onKey");
		
		this.menuModel = new pres.model.Commands(pres.config.sorterContextMenu);

		this.contextMenu = new pres.widget.MenuContext({
			model: this.menuModel
		});

		this.contextMenu.startup();
		this.connect(this.domNode, "oncontextmenu", function(evt)
		{
			//not allow user do select object & input text action while in partial load.
			if(!pe.scene.isLoadFinished()) {
				evt.stopPropagation();
				dojo.stopEvent(evt);
				return;
			}
			var target = evt.target;
			var pos = {
				x: evt.pageX,
				y: evt.pageY
			};
			this.contextMenu._scheduleOpen(target, null, pos);
		});
//		this.contextMenu.bindDomNode(this.containerNode);

		if (pe.scene.isMobile)
		{
			if (this.tapEnabled)
			{
				this._touchStartEvent = dojo.connect(this.containerNode, "ontouchstart", this, "onTouchStart");
			}
			this.containerNode.style.overflowY = "auto";
			if (concord.util.browser.isMobileVersionGreaterOrEqual("7.0"))
			{
				this.containerNode.style.webkitOverflowScrolling = "auto";
				setTimeout(dojo.hitch(this, function()
				{
					this.containerNode.style.webkitOverflowScrolling = "touch";
				}), 0);
			}
		}

		if (pe.scene.isMobile && this.tapEnabled)
		{
			this.connect(this.domNode, "onscroll", function()
			{
				var current = this.domNode.scrollTop;
				this._scrollOffset = Math.abs(current - this._scrollTop);
				this._scrollTop = current;
				this._scrollTime = new Date();
			});
		}
	},

	_scrollTime: 0,
	_scrollOffset: 0,

	onTouchEnd: function(e)
	{
		if (this.touched)
		{
			if (!this.touchMoved)
			{
				var offsetX = Math.abs(e.changedTouches[0].clientX - this.touchX);
				var offsetY = Math.abs(e.changedTouches[0].clientY - this.touchY);

				if (!(offsetX > 8 || offsetY > 8))
				{
					console.info(this._scrollOffset);
					if (new Date() - this._scrollTime > 100 && this._scrollOffset < 50)
					{
						console.warn("direct find element");
						var element = e.target;
						if (element)
						{
							var thumb = dijit.getEnclosingWidget(element);
							if (thumb && thumb instanceof pres.widget.Thumbnail)
							{
								var currentThumb = this.getCurrentThumb();
								thumb.selectMe();
								this.syncSelection();
								if (currentThumb == thumb)
									dojo.publish("/thumbnail/selected", [thumb]);
							}
						}
					}
					else
					{
						console.warn("timeout to find element");
						setTimeout(function()
						{
							var x = e.changedTouches[0].pageX - window.pageXOffset;
							var y = e.changedTouches[0].pageY - window.pageYOffset;
							var element = document.elementFromPoint(x, y);

							// if the element is a text node, get its parent.
							if (element.nodeType === 3)
							{
								element = element.parentNode;
							}
							if (element)
							{
								var thumb = dijit.getEnclosingWidget(element);
								if (thumb && thumb instanceof pres.widget.Thumbnail)
								{
									var currentThumb = this.getCurrentThumb();
									thumb.selectMe();
									this.syncSelection();
									if (currentThumb == thumb)
										dojo.publish("/thumbnail/selected", [thumb]);
								}
							}
						}, 10);
					}

					this._scrollOffset = 0;
				}
			}
		}

		this.touched = false;
		this.touchMoved = false;

		if (this._touchEndHandler)
		{
			dojo.disconnect(this._touchEndHandler);
			this._touchEndHandler = null;
		}
	},

	onTouchStart: function(event)
	{
		this.touchMoved = false;
		if (this.touched || new Date() - this.touchedTime < 100)
			return;
		this.touchedTime = new Date();
		this.touchMoved = false;
		this.touched = true;
		this.touchX = event.touches[0].clientX;
		this.touchY = event.touches[0].clientY;

		if (this._touchEndHandler)
		{
			dojo.disconnect(this._touchEndHandler);
			this._touchEndHandler = null;
		}

		// this._touchMoveHandler = dojo.connect(this.domNode, "ontouchmove", this, "onTouchMove");
		this._touchEndHandler = dojo.connect(this.containerNode, "ontouchend", this, "onTouchEnd");
	},

	// override this function, to remove recursive navigation which we do not need.
	_getNextFocusableChild: function(child, dir)
	{
		if (!child)
			return this.inherited(arguments);
		var sib;
		if (child)
		{
			sib = this._getSiblingOfChild(child, dir);
		}
		return sib || child; // dijit._Widget
	},

	reset: function()
	{
		this.cssLoaded = false;
		this.cancelDnd();
		this.selectedThumbs = [];
		this.destroyDescendants();
	},

	deselectMultiple: function()
	{
		if (this.selectedThumbs.length)
		{
			var changed = false;
			dojo.forEach(this.selectedThumbs, dojo.hitch(this, function(t)
			{
				if (!t.current && t.selected)
				{
					t.attr("selected", false);
					changed = true;
				}
			}));
			if (changed)
				this.syncSelection();
		}
	},

	updateUserIndicator: function(slides)
	{
		dojo.forEach(this.getChildren(), function(child)
		{
			child.checkLocks();
		});
	},

	selectAll: function()
	{
		if (!pe.scene.isHTMLViewMode())
			this.selectItems(0, this.getChildren().length - 1);
	},

	onKey: function(e)
	{
		if (!pe.scene.isLoadFinished())
			return;
		var viewmode = pe.scene.isHTMLViewMode();
		var code = e.charCode || e.keyCode;
		var keychar = code >= 32 ? String.fromCharCode(code) : "";
		if ((e.ctrlKey || (dojo.isMac && e.metaKey)) && (keychar == "a" || keychar == "A"))
		{
			this.selectAll();
			dojo.stopEvent(e);
		}
		else if (!viewmode)
		{
			if (code == 8 || code == 46)
			{
				// backspace / delete
				dojo.stopEvent(e);
				this.deleteSlides();
			}
			else if (code == 13)
			{
				// enter to add new slide
				dojo.stopEvent(e);
				this.createSlide();
			}
		}
	},

	createSlide: function()
	{
		if (this.selectedThumbs.length > 0)
		{
			dojo.publish("/sorter/to/create", [this.getCurrentThumb()]);
		}
	},

	layoutSlide: function()
	{
		if (this.selectedThumbs.length > 0)
		{
			dojo.publish("/sorter/update/layout", [this.getCurrentThumb()]);
		}
	},

	transitionSlide: function()
	{
		if (this.selectedThumbs.length > 0)
		{
			dojo.publish("/sorter/update/transition", [this.getCurrentThumb()]);
		}
	},

	findThumbBySlide: function(slide)
	{
		var children = this.getChildren();
		for ( var i = 0; i < children.length; i++)
		{
			if (children[i].slide == slide)
			{
				return children[i];
			}
		}
	},

	cancelDndOnEvents: function()
	{
		if (this.cancelDnd())
		{
			pe.scene.showWarningMessage(pe.presStrs.dnd_canceled_on_slide_event, 4000);
		}
	},

	onSlidesMoved: function(deleted, inserted, eventSource)
	{
		this.cancelDndOnEvents(); // cancel dnd if exist;
		var removedThumbs = {};
		dojo.forEach(deleted, dojo.hitch(this, function(de)
		{
			var slide = de[0];
			var index = de[1];
			var thumb = this.findThumbBySlide(slide);
			removedThumbs[slide.id] = thumb;
			this.removeChild(thumb);
		}));

		dojo.forEach(inserted, dojo.hitch(this, function(ie)
		{
			var slide = ie[0];
			var index = ie[1];
			var thumb = null;
			if (removedThumbs[slide.id])
				thumb = removedThumbs[slide.id];
			else
				// should not be there.
				thumb = this.createThumbnail(slide);
			// Fix shape id for thumbnail
			pres.utils.shapeUtil.fixDomShapeIds(thumb.domNode);
			this.addChild(thumb, index);
		}));
		this.updateOrders();
		this.syncSelection();
		this.adjustThumbnailContent();

		if (!eventSource || !eventSource.message || eventSource.undo)
			this.getCurrentThumb().domNode.focus();
	},

	getThumbBySlideId: function(slideId)
	{
		var thumbs = this.getChildren();
		for ( var i = 0; i < thumbs.length; i++)
		{
			var t = thumbs[i];
			if (t.slide.id == slideId)
			{
				return t;
			}
		}
		return null;
	},

	onCommentSelected: function(selectedCommentId)
	{
		var slide = null;
		var slides = pe.scene.doc.slides;
		for ( var i = 0; i < slides.length; i++)
		{
			var s = slides[i];
			if (s.hasElementWithCommentsId(selectedCommentId))
			{
				slide = s;
				break;
			}
		}

		if (slide)
		{
			var toSlideId = slide.id;
			if (!(!concord.util.browser.isMobile() && toSlideId == pe.scene.slideSorter.getCurrentThumb().slide.id))
			{
				var toThumb = this.getThumbBySlideId(toSlideId);
				if (toThumb)
				{
					toThumb.selectMe();
					this.syncSelection();
					this.focusChild(toThumb);
				}
			}
			else
			{
				window.pe.scene.slideEditor.deSelectAll();
			}
			dojo.publish("/editor/commentselected", [selectedCommentId]);
		}
		else
		{
			window.pe.scene.slideEditor.deSelectAll();
		}
	},

	onSlideInserted: function(slide, eventSource)
	{
		this.cancelDndOnEvents(); // cancel dnd if exist;
		var thumb = this.createThumbnail(slide);
		var index = pe.scene.doc.slides.indexOf(slide);
		this.addChild(thumb, index);
		if (!eventSource || !eventSource.batch || eventSource.batchLast)
		{
			if (eventSource && eventSource.undo)
			{
				// UNDO a DELETE SLIDE
				if (eventSource.slideIds && eventSource.slideIds.length > 0)
				{
					this.selectItemsByIds(eventSource.slideIds, eventSource.slideIds[0]);
				}
				else
				{
					this.selectItemsByIds(slide.wrapperId);
				}
			}
			this.updateOrders();
			this.syncSelection();
			this.adjustThumbnailContent();
		}
		if (!eventSource || (eventSource.undo && eventSource.batchLast))
		{
			setTimeout(dojo.hitch(this, function()
			{
				this.getCurrentThumb().domNode.focus();
			}, 0));
		}
	},

	onSlidesDeleted: function(slides, eventSource)
	{
		this.cancelDndOnEvents(); // cancel dnd if exist;
		var isSelectedThumbDeleted = false;
		var firstDeletedSelectedThumb = null;
		var firstDeletedSelectedThumbIndex = -1;
		var thumbs = dojo.filter(this.getChildren(), dojo.hitch(this, function(c, i)
		{
			var toDelete = dojo.indexOf(slides, c.slide) >= 0;

			if (toDelete && !isSelectedThumbDeleted)
			{
				isSelectedThumbDeleted = dojo.indexOf(this.selectedThumbs, c) >= 0;
				if (isSelectedThumbDeleted)
				{
					firstDeletedSelectedThumb = c;
					firstDeletedSelectedThumbIndex = i;
				}
			}
			return toDelete;
		}));

		dojo.forEach(thumbs, function(t)
		{
			t.destroy();
		});

		if (!eventSource || !eventSource.batch || eventSource.batchLast)
		{
			var focusHandled = false;
			if (eventSource && eventSource.undo)
			{
				// UNDO a INSERT SLIDE
				if (eventSource.slideIds && eventSource.slideIds.length > 0)
				{
					this.selectItemsByIds(eventSource.slideIds, eventSource.slideIds[0]);
					focusHandled = true;
				}
			}
			if (!focusHandled)
			{
				var children = this.getChildren();
				var len = children.length;

				if (firstDeletedSelectedThumbIndex > -1)
				{
					if (firstDeletedSelectedThumbIndex > len - 1)
						firstDeletedSelectedThumbIndex = len - 1;

					var nextChild = children[firstDeletedSelectedThumbIndex];
					nextChild && this.focusChild(nextChild);
				}
			}
			this.updateOrders();
			this.syncSelection();
			this.adjustThumbnailContent();
		}
		if (!eventSource || (eventSource.undo && eventSource.batchLast))
		{
			setTimeout(dojo.hitch(this, function()
			{
				this.getCurrentThumb().domNode.focus();
			}, 0));
		}
	},

	onSlideDeleted: function(slide, eventSource)
	{
		this.onSlidesDeleted([slide], eventSource);
	},

	moveSlidesDir: function(up)
	{
		if (this.selectedThumbs.length > 1)
			return;
		var children = this.getChildren();
		var index = dojo.indexOf(children, this.selectedThumbs[0]);
		if (up && index == 0)
			return;
		if (!up && index == children.length - 1)
			return;
		this.moveSlides(up ? index - 1 : index + 2, true);
	},

	moveSlides: function(targetIndex, before)
	{
		if (this.selectedThumbs.length > 0)
		{
			dojo.publish("/sorter/to/move", [this.selectedThumbs, targetIndex, before]);
		}
	},

	duplicateSlides: function()
	{
		if (this.selectedThumbs.length > 0)
		{
			dojo.publish("/sorter/to/duplicate", [this.selectedThumbs]);
		}
	},

	deleteSlides: function()
	{
		if (this.selectedThumbs.length > 0)
		{
			dojo.publish("/sorter/to/delete", [this.selectedThumbs]);
		}
	},

	resize: function()
	{
		this.inherited(arguments);
		if (this.swapEnabled)
			this.adjustThumbnailContent();
	},
	
	fitInWindow: function()
	{
		this.scaleProperties = null;
		this.slideHeight = null;
		var children = this.getChildren();
		if (children.length)
		{
			var scale  = this.getScaleProperties();
			dojo.forEach(children, function(c){
				c.resizeLayout(scale);
			});
			
			if (this.swapEnabled)
				this.adjustThumbnailContent();
		}
	},
	
	getScaleProperties: function()
	{
		if (this.scaleProperties)
			return this.scaleProperties;

		var pageRatio = 0.75; // Default pageRatio for a 4:3 presentation

		var doc = pe.scene.doc;
		var slides = doc.getSlides();
		var slide = slides[0];

		var pageHeight = slide.h || 21;
		var pageWidth = slide.w;


		if (!pe.scene.isViewCompactMode())
		{
			if (pageHeight && pageWidth)
			{
				pageRatio = concord.util.resizer.getRatio(pageHeight, pageWidth);
			}

			var slideHeight = this.slideWidth * pageRatio;

			var slideFontSize = PresCKUtil.getBasedFontSize(slideHeight, pageHeight);

			this.scaleProperties = {
				"height": slideHeight + "px",
				"width": this.slideWidth + "px",
				"font-size": slideFontSize + "px"
			};

			return this.scaleProperties;
		}


		// for html view compact mode.

		var box = {
			w: this.domNode.offsetWidth,
			h: this.domNode.offsetHeight
		};


		box.w = box.w * this.viewCompactScaleRate - 40;
		box.h = box.h * this.viewCompactScaleRate - 40;

		var slideHeight = 0;
		var slideWidth = 0;

		if (pageHeight >= pageWidth)
		{
			var pageSizeRatio = concord.util.resizer.getRatio(pageWidth, pageHeight);
			var slideHeight = box.h;
			var slideWidth = box.h * pageSizeRatio;
			if (slideWidth > box.w)
			{
				pageSizeRatio = concord.util.resizer.getRatio(pageHeight, pageWidth);
				slideWidth = box.w;
				slideHeight = slideWidth * pageSizeRatio;
			}
		}
		else
		{
			var pageSizeRatio = concord.util.resizer.getRatio(pageHeight, pageWidth);
			var slideWidth = box.w;
			var slideHeight = box.w * pageSizeRatio;
			if (slideHeight > box.h)
			{
				pageSizeRatio = concord.util.resizer.getRatio(pageWidth, pageHeight);
				slideHeight = box.h;
				slideWidth = slideHeight * pageSizeRatio;
			}
		}

		var slideFontSize = PresCKUtil.getBasedFontSize(slideHeight, pageHeight);

		this.scaleProperties = {
			"height": slideHeight + "px",
			"width": slideWidth + "px",
			"font-size": slideFontSize + "px"
		};

		return this.scaleProperties;
	},

	onCssLoaded: function()
	{
		this.cssLoaded = true;
		// console.info("this.cssLoadedTime " + new Date().valueOf())
	},

	onDataLoaded: function(full)
	{
		if(pe.scene.isHTMLViewMode() && DOC_SCENE.snapshotId && DOC_SCENE.snapshotId != "null"){
			pe.scene.htmlViewerHasSnapshotId = true;
		}
		if (!pe.scene.hub.monitorCss)
		{
			this.initSlides(full);
			return;
		}
		else
		{
			// mobile, wait css fully load
			if (!this.dataLoadedTime)
				this.dataLoadedTime = new Date().valueOf();
			// console.info("dataLoaded " + new Date().valueOf())
			if (this.cssCheckInterval)
				clearInterval(this.cssCheckInterval);

			this.cssCheckInterval = setInterval(dojo.hitch(this, function()
			{

				if (this.cssLoaded || new Date().valueOf() - this.dataLoadedTime >= 5 * 1000)
				{
					clearInterval(this.cssCheckInterval);
					if (pe.scene.doc.full)
					{
						this.initSlides(full);
					}
					else
					{
						this.initSlides();
					}
				}
			}, 100));
		}
	},

	initSlides: function(full)
	{
		var doc = pe.scene.doc;
		var slides = doc.getSlides();

		if (!pe.scene.isMobile)
		{
			// normal mode,
			// destroy partial loaded, and rebuild all.
			this.destroyDescendants();
		}
		if (full) {
			pe.scene.canCacheSlideHTMLDiv = true;
			pe.scene.notCacheFirstSlide = true;
		}
		var i = this.getChildren().length;
		for (; i < slides.length; i++)
		{
			this.addChild(this.createThumbnail(slides[i]));
		}

		this.initSlidesContent();
		if (this.swapEnabled)
			this.adjustThumbnailContent();

		var focused = false;
		var children = this.getChildren();

		this.syncSelection(true);
		this.updateOrders();
		if (!pe.scene.isMobile)
		{
			this.setupDnd();
			this.syncDnd();
		}
		else
		{
			if (!full)
			{
				this.snapshotMgr.dirtySlides = [];
				var length = slides.length;
				for ( var i = 0; i < length; i++)
				{
					var slide = slides[i];
					var transitionName = slide.getTransitionType();
					this.snapshotMgr.insertSlide(i, transitionName, false);
				}
				this._firstSnapShotFired = true;
				setTimeout(concord.util.mobileUtil.snapPreStart, 1);
				this.subscribe("/pres/snapshot/finish", dojo.hitch(this, function()
				{
					this._firstSnapShotFinished = true;
				}));
			}
			else
			{
				var children = this.getChildren();
				// make first batch slides which is hidden before to show.
				if (this._firstSnapShotFired)
				{
					dojo.forEach(children, function(thumbnail, i)
					{
						if (i < pe.scene.loadInitSlide)
						{
							thumbnail.showDom();
							thumbnail.domNode.style.display = "";
						}
					});
				}

				this._checkThumbShowInterval = setInterval(dojo.hitch(this, function()
				{
					if ((this._firstSnapShotFinished || !this._firstSnapShotFired) && dojo.every(children, function(thumb)
					{
						return thumb.html && !thumb.hidden;
					}))
					{
						clearInterval(this._checkThumbShowInterval);

						// reset the snapshots, capture from beginning (the first batch may have image/css not loaded fully).
						this.snapshotMgr.dirtySlides = [];
						for ( var i = 0; i < slides.length; i++)
						{
							var slide = slides[i];
							var transitionName = slide.getTransitionType();
							this.snapshotMgr.insertSlide(i, transitionName, false);
						}

						concord.util.mobileUtil.totalSlide(pe.scene.doc.slides.length);

						dojo.forEach(children, function(c)
						{
							c.showDom();
							c.domNode.style.display = "";
						});

						setTimeout(function()
						{
							concord.util.mobileUtil.snapPreStart();
							concord.util.mobileUtil.jsObjCBridge.postEvents([{
								"name": "presLoaded",
								"params": []
							}]);
							pe.scene.isMobileLoaded = true;
						}, 1);
					}
				}), 100);
			}
		}

		pres.perf.mark("sorter_render_init", true);
		if (full)
			pres.perf.mark("sorter_render_full");
	},

	createThumbnail: function(slide)
	{
		var tId = "thumbnail_" + slide.id;
		var thumbnail = new pres.widget.Thumbnail({
			slide: slide,
			id: tId
		});
		this.dnd && this.dnd.setItem(thumbnail.id, {
			data: thumbnail.id,
			type: 'text'
		});
		return thumbnail;
	},

	initSlidesContent: function()
	{
		var children = this.getChildren();
		var me = this;
		for ( var i = 0; i < children.length; i++)
		{
			var thumb = children[i];
			var time = parseInt(i / 8);
			if (time == 0)
			{
				if (!this.swapEnabled)
					thumb.showDom();
				else
					thumb.renderContent();
			}
			else if (!(this.hardSwap && this.swapEnabled))
			{
				setTimeout(dojo.hitch(thumb, function()
				{
					if (!me.swapEnabled)
						this.showDom();
					else
						this.renderContent();
				}), time * 100);
			}
		}
	},

	adjustThumbnailContent: function()
	{
		delete pe.inScrollAdjust;
		var children = this.getChildren();
		if (!this.swapEnabled)
		{
			for ( var i = 0; i < children.length; i++)
			{
				var thumb = children[i];
				var time = parseInt(i / 8);
				if (time == 0)
				{
					thumb.showDom();
				}
				else
				{
					setTimeout(dojo.hitch(thumb, function()
					{
						this.showDom();
					}), time * 200);
				}
			}
		}
		else
		{
			var children = this.getChildren();
			var map = this.getVisibilityMap(children);
			dojo.forEach(map, function(m, i)
			{
				var thumb = children[i];
				if (m)
					thumb.showDom();
			});
			clearTimeout(this._delayHideDom);
			this._delayHideDom = setTimeout(dojo.hitch(this, function()
			{
				var children = this.getChildren();
				var map = this.getVisibilityMap(children);
				dojo.forEach(map, function(m, i)
				{
					var thumb = children[i];
					if (!m)
						thumb.hideDom();
				});
			}), 1000);
		}
	},

	getVisibilityMap: function(children)
	{
		var len = children.length;
		if (len < 1)
			return;
		var scrollTop = this.domNode.scrollTop;
		var h = dojo.contentBox(this.domNode).h;
		if (!this.slideHeight)
			this.slideHeight = dojo.marginBox(children[0].domNode).h;
		var th = this.slideHeight;
		var visibilityMap = [];
		var first = -1;
		var last = -1;
		for ( var i = 0; i < len; i++)
		{
			visibilityMap[i] = 0;
			var mypos = th * i - scrollTop;
			var myposEnd = mypos + th;
			if ((myposEnd >= 0 && (myposEnd < h || mypos <= 0)) || (mypos >= 0 && mypos < h))
			{
				if (first < 0)
					first = i;
				last = Math.max(last, i);
				visibilityMap[i] = 1;
			}
		}
		if (first >= 0 && last > first)
		{
			for ( var i = 0; i < len; i++)
			{
				if (i >= first - this.swapBuffer && i < first)
					visibilityMap[i] = 2;
				else if (i <= last + this.swapBuffer && i > last)
					visibilityMap[i] = 2;
			}
		}
		return visibilityMap;
	},

	destroy: function()
	{
		this.inherited(arguments);
		if (this.contextMenu)
			this.contextMenu.destroyRecursive();
	},

	handleKeyFromBody: function(e)
	{
		if (!this.focusedChild && this.lastFocusedChild)
			this._set("focusedChild", this.lastFocusedChild);
		this._onContainerKeydown(e);
	},

	readIndicators: function()
	{
		var ctb = this.getCurrentThumb();
		var readText = dojo.string.substitute(pe.presStrs.acc_slide, [ctb.index]) + pe.presStrs.acc_selected;
		if (ctb.lockedUsers)
		{
			var users = "";
			for ( var i = 0; i < ctb.lockedUsers.length; i++)
			{
				var userId = ctb.lockedUsers[i];
				var u = pe.scene.getEditorStore().getEditorById(userId);
				var name = u.getName();
				users += name + " ";
			}
			if (users.length > 0)
			{
				readText += dojo.string.substitute(pe.presStrs.acc_slide_used_by, [users]);
			}
		}
		pe.scene.slideEditor && pe.scene.slideEditor.announce(readText);
	},
	_onContainerFocus: function()
	{
		// override
	}

});