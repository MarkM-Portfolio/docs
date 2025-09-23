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

dojo.provide("pres.widget.NotesEditor");

dojo.require("dijit.layout.ContentPane");
dojo.require("dijit._Container");
dojo.require("dijit._Contained");
dojo.require("pres.editor.NotesBox");
dojo.require("pres.utils.placeHolderUtil");
dojo.require("pres.widget.MenuContext");
dojo.require("pres.widget.EditorSpellCheck");
dojo.require("pres.config.boxEditingContextMenu");
dojo.require("concord.util.BidiUtils");
dojo.require("pres.utils.htmlHelper");

dojo.declare("pres.widget.NotesEditor", [dijit.layout.ContentPane, dijit._Contained, dijit._Container, pres.widget.EditorSpellCheck], {

	slide: null,
	element: null,

	postCreate: function()
	{
		this.inherited(arguments);
		this.container = dojo.create("div", {
			"className": "notes-box"
		}, this.domNode);
		this.domNode.style.overflow = "hidden";
		this.domNode.tabIndex = 0;
		// this.connect(this.domNode, "onkeypress", this.onKey);
		pe.scene.notesEditor = this;

		if (pe.scene.isHTMLViewMode() || pe.scene.isMobile)
			return;
		
		this.connect(this.domNode, "onClick", this.onClick);
		
		this.connect(this.domNode, "onkeydown", function(evt)
		{
			if (evt.shiftKey && evt.keyCode == dojo.keys.F10)
			{
				this.popupContextMenu(evt);
				dojo.stopEvent(evt);
			}
		});
		
		this.subscribe("/scene/user/joined", this.checkLocks);
		this.subscribe("/scene/coedit/started", this.checkLocks);

		this.subscribe("/editor/slide/focus", this.deSelectAll);
		this.subscribe("/element/deleted", this.onElementDeleted);
		this.subscribe("/elements/deleted", this.onElementsDeleted);
		this.subscribe("/element/inserted", this.onElementInserted);
		this.dispatch("/lock/element/add");
		this.dispatch("/lock/element/remove");

		this.subscribe("/msg/rn/before", function(eleId)
		{
			dojo.some(this.getChildren(), function(c)
			{
				if (c.element.id == eleId)
				{
					c.recordStatus();
					return true;
				}
			});
		});
		this.subscribe("/msg/rn/after", function(eleId)
		{
			dojo.some(this.getChildren(), function(c)
			{
				if (c.element.id == eleId)
				{
					c.restoreStatus();
					return true;
				}
			});
		});

		this.boxEditingMenuModel = new pres.model.Commands(pres.config.boxEditingContextMenu);
		this.boxEditingContextMenu = new pres.widget.MenuContext({
			model: this.boxEditingMenuModel
		});
		this.boxEditingContextMenu.startup();
	},

	checkLocks: function()
	{
		if (this.box && pe.scene.locker.isLockedByMe(this.box.element.id))
			this.box.lock();
	},

	popupContextMenu: function(evt, mouse)
	{
		if (this.box && this.box.status == 2)
		{
			var target = this.box.domNode;

			var pos = evt ? {
				x: evt.pageX,
				y: evt.pageY
			}: null;
			if (!mouse)
			{
				pos = dojo.coords(target);
				if (target == this.domNode)
				{
					pos.x += 100;
					pos.y += 100;
				}
			}
			this.box.detachCoEditTooltip();
			this.detachSpellCheckMenuItems(this.boxEditingContextMenu);
			if (window.spellcheckerManager && spellcheckerManager.isAutoScaytEnabled())
				this.attachSpellCheckMenuItems(this.box, this.boxEditingContextMenu);
			
			this.boxEditingContextMenu._scheduleOpen(target, null, pos);
			
			return true;
		}
	},

	dispatch: function(event)
	{
		this.subscribe(event, function(ele)
		{
			var children = this.getChildren();
			for ( var i = 0; i < children.length; i++)
			{
				var child = children[i];
				var element = child.element;
				if (element == ele || element.id == ele)
				{
					if (child.dispatch)
					{
						var arr = [event];
						Array.prototype.push.apply(arr, arguments);
						child.dispatch.apply(child, arr);
					}
					break;
				}
			}
		});
	},

	onElementDeleted: function(ele, eventSource)
	{
		if (ele.isNotes && ele.parent == this.slide)
		{
			if (this.box && this.box.element.id == ele.id)
				this.box.destroy();
		}
	},

	onElementsDeleted: function(eles, eventSource)
	{
		dojo.forEach(eles, dojo.hitch(this, function(ele)
		{
			this.onElementDeleted(ele, eventSource);
		}));
	},

	onElementInserted: function(element, eventSource)
	{
		if (element.isNotes)
		{
			if (element.parent == this.slide)
			{
				this.render(this.slide);
			}
		}
	},

	onClick: function()
	{
		if (this.box && this.box.status < 2)
			this.box.enterEdit();
		else
			dojo.publish("/editor/notes/focus", this);
	},

	getEditingBox: function()
	{
		if (this.box && this.box.status == 2)
			return this.box;
	},

	onKey: function(e)
	{
		if (pe.scene.isHTMLViewMode() || pe.scene.isMobile)
			return;
		
		if (!pe.scene.isLoadFinished())
			return;
		
		var code = e.charCode || e.keyCode;
		var keychar = code >= 32 ? String.fromCharCode(code) : "";
		if ((e.ctrlKey || (dojo.isMac && e.metaKey)) && (keychar == "a" || keychar == "A"))
		{
			this.selectAll();
			dojo.stopEvent(e);
		}
		else if (code == 8 || code == 46)
		{
			// backspace / delete
			dojo.stopEvent(e);
		}
		else if (code == 27)
		{
			// escape
			var b = this.box;
			if (b)
			{
				if (b.status > 1)
					b.exitEdit();
				else if (b.status > 0)
					b.exitSelection();
			}
			dojo.stopEvent(e);
		}
	},

	deSelectAll: function()
	{
		if (this.box && this.box.status > 0)
		{
			this.box.exitEdit();
			this.box.exitSelection();
		}
	},

	selectAll: function()
	{
		// TODO, select box content
	},

	resize: function()
	{
		this.inherited(arguments);
		this.layoutNotes(true);
	},

	layoutNotes: function(resize)
	{
		if (resize || !this.layouted)
			dojo.marginBox(this.container, dojo.contentBox(this.domNode));
		this.layouted = true;
	},

	cleanBoxEvents: function()
	{
		if (this.boxEvents)
			dojo.forEach(this.boxEvents, dojo.disconnect);
		this.boxEvents = [];
	},

	clean: function()
	{
		this.cleanBoxEvents();
		this.box && this.box.destroy(true);
		this.box = null;
	},

	destroy: function()
	{
		this.clean();
		if (this.boxEditingContextMenu)
			this.boxEditingContextMenu.destroyRecursive();
		this.inherited(arguments);
	},

	delayUpdate: function()
	{
		this.updateHeaderFooter();
		this.spellCheck();
	},

	updateHeaderFooter: function(onlyPageNumber)
	{
		var index = dojo.indexOf(pe.scene.doc.getSlides(), this.slide);
		var hfu = concord.widgets.headerfooter.headerfooterUtil;
		hfu.updatePageNumber(this.container, index + 1);
		if (!onlyPageNumber)
			hfu.updateHeaderFooterDateTimeFields(this.container);
	},

	spellCheck: function()
	{
		if (pe.scene.isHTMLViewMode() || pe.scene.isMobile)
			return;
		var sc = pe.scene.spellChecker;
		if (sc.isAutoScaytEnabled() && this.box)
			sc.checkNodes(this.box.domNode, this.box.domNode, null);
	},

	render: function(slide)
	{
		//var t = new Date();
		this.slide = slide;
		if (pe.scene.isViewCompactMode())
			return;
		this.clean();
		this.element = slide.getNotes();
		if (this.element)
		{
			var domHTML = this.element.getHTML();
			this.container.innerHTML = domHTML;
			var child = this.container.children[0];
			pres.utils.placeHolderUtil.i18n(child);

			var notesDrawText = null;
			dojo.query(".draw_text-box", child).forEach(function(node, index, arr)
			{
				if (dojo.attr(node.parentNode, "presentation_class") == "notes")
				{
					notesDrawText = node;
				}
			});

			if(notesDrawText)
			{
				dojo.addClass(notesDrawText, "notes_tweaks");
				dojo.addClass(notesDrawText.parentNode, "notes_tweaks_parent");
				if (notesDrawText.children[0])
				{
					dojo.style(notesDrawText.children[0], "display", "table");
					dojo.style(notesDrawText.children[0], "height", "100%");
					dojo.style(notesDrawText.children[0], "width", "100%");
					dojo.style(notesDrawText.children[0], "margin", "0px");
					dojo.style(notesDrawText.children[0], "padding", "0px");
					dijit.setWaiRole(notesDrawText.children[0], 'presentation');
					var drawFrameClassesNode = dojo.query(".draw_frame_classes", notesDrawText.children[0])[0];
					if (drawFrameClassesNode)
					{
						dojo.style(drawFrameClassesNode, {
							display: "table-cell",
							height: "100%",
							width: "100%",
							fontSize: "12px",
							textIndent: "0px",
							margin: "0px",
							padding: dojo.isFF ? "0 1% 0 0" : "0px"
						});
						if(BidiUtils.isGuiRtl())
							dojo.attr(drawFrameClassesNode, "dir",'rtl');

						dijit.setWaiRole(drawFrameClassesNode, 'presentation');
						dojo.query("span", drawFrameClassesNode).forEach(function(spanNode){
							EditorUtil.setCustomStyle(spanNode, PresConstants.ABS_STYLES.FONTSIZE, '18');
							dojo.style(spanNode, {
								fontSize: "1em",
								color:"#000000",
								fontFamily: "Arial, Helvetica, sans-seri"
							});
						});
					}
				}
			}
			
			setTimeout(dojo.hitch(this, this.delayUpdate), 100);
			
			if (pe.scene.isHTMLViewMode() || pe.scene.isMobile)
				return;
			
			this.box = new pres.editor.NotesBox({}, child);
			var me = this;
			if (!this.boxEvents)
				this.boxEvents = [];
			this.boxEvents.push(dojo.connect(this.box, "beforeEnterEdit", function()
			{
				dojo.publish("/editor/notes/focus", me);
			}));
			
		}
		this.layoutNotes();
		
		if (pe.scene.isHTMLViewMode())
			pres.utils.htmlHelper.removeTabIndex(this.container);
		
		//var t10 = new Date();
		//console.info("Notes Render " + (t10 - t));
	},

	getSelectedBoxes: function()
	{
		return dojo.filter(this.getChildren(), function(c)
		{
			return c.status >= 1;
		});
	},
	toggleSelection: function()
	{
	}
});
