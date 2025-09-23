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

dojo.provide("pres.widget.SorterDnd");

dojo.require("dojo.dnd.Container");
dojo.require("dojo.dnd.Manager");
dojo.require("dojo.dnd.Avatar");
dojo.require("pres.widget.SorterDndSource");
dojo.require("pres.model.helper");
dojo.require("pres.utils.shapeUtil");

dojo.declare("pres.widget.SorterDnd", null,
{

	inDnd: false,

	syncDnd: function()
	{
		if (pe.scene.isHTMLViewMode() || pe.scene.isMobile)
			return;
		if (pe.scene.isMobileBrowser())
			return;
		if (!this.dnd)
			return;
		this.dnd.selection = {};
		var me = this;
		dojo.forEach(this.getChildren(), function(c, i)
		{
			if (c.selected)
				me.dnd.selection[c.domNode.id] = 1;
		});
	},

	setupDnd: function()
	{
		if (pe.scene.isHTMLViewMode() || pe.scene.isMobile)
			return;
		if (pe.scene.isMobileBrowser())
			return;
		if (this.dnd)
			this.dnd.destroy();
		var me = this;
		this.dnd = new pres.widget.SorterDndSource(this.containerNode,
		{
			delay: 5,
			onDrop: dojo.hitch(this, this.onDrop)
		});

		var node = this.containerNode;
		var lmd = this.dnd._legalMouseDown;
		this.dnd._legalMouseDown = function(e)
		{
			return lmd(e) && e.target != node;
		};

		if (this.dndEvents)
		{
			dojo.forEach(this.dndEvents, dojo.disconnect);
		}
		this.dndEvents = [];
		this.dndEvents.push(dojo.connect(this.dnd, "onMouseDown", this, this.dndMouseDown));
		this.dndEvents.push(dojo.connect(this.dnd, "onDndStart", this, this.dndStart));
		this.dndEvents.push(dojo.connect(this.dnd, "onDndDrop", this, this.dndDrop));
		this.dndEvents.push(dojo.connect(this.dnd, "onDndCancel", this, this.dndCancel));
	},

	dndMouseDown: function(e, again)
	{
		if (again || (e.ctrlKey || (dojo.isMac && e.metaKey)))
			return;
		var nodes = this.dnd.getSelectedNodes();
		var children = this.getChildren();
		var indexes = [];
		var thumbs = [];
		pe.scene.slideEditor.deSelectAll();
		dojo.forEach(nodes, function(n)
		{
			var thumb = dijit.byNode(n);
			thumbs.push(thumb);
			indexes.push(dojo.indexOf(children, thumb));
		});
		if (!pres.utils.helper.isArraySame(thumbs, this.selectedThumbs))
		{
			this.selectItemsByIndex(indexes);
			this.dndMouseDowned = true;
			this.dnd.onMouseDown(e, true);
		}
	},

	disconnectDocForCancelDnd: function()
	{
		if (this.documentBodyDnDMouseUpEvt != null)
		{
			// #2241 - cancel dnd if mouseup in other area
			dojo.disconnect(this.documentBodyDnDMouseUpEvt);
			this.documentBodyDnDMouseUpEvt = null;
		}
		if (this.documentBodyDnDClickEvt != null)
		{
			// #2241 - cancel dnd if click the doc
			dojo.disconnect(this.documentBodyDnDClickEvt);
			this.documentBodyDnDClickEvt = null;
		}
		if (this.presDivDnDMouseOverEvt != null)
		{
			dojo.disconnect(this.presDivDnDMouseOverEvt);
			this.presDivDnDMouseOverEvt = null;
		}
		if (this.documentBodyDnDMouseOutEvt != null)
		{
			// #2241 - cancel dnd if click the doc
			dojo.disconnect(this.documentBodyDnDMouseOutEvt);
			this.documentBodyDnDMouseOutEvtckEvt = null;
		}
	},
	connectDocForCancelDnd: function()
	{
		// #2241 - cancel dnd if mouseup in other area
		this.disconnectDocForCancelDnd();
		// this.documentBodyDnDMouseUpEvt = dojo.connect(document.body, "onmouseup", dojo.hitch(this, this.cancelDnd));
		this.documentBodyDnDClickEvt = dojo.connect(document, "onclick", dojo.hitch(this, this.cancelDnd));
		// this.documentBodyDnDMouseOutEvt = dojo.connect(this.domNode, "onmouseout", dojo.hitch(this, this.cancelDnd));
	},

	cancelDnd: function()
	{
		if (this.inDnd)
		{
			dojo.publish("/dnd/cancel");
			dojo.dnd._manager.stopDrag();
			this.dnd.onDndCancel();
			this.inDnd = false;
			this.disconnectDocForCancelDnd();
			return true;
		}
		return false;
	},

	onDrop: function(source, nodes)
	{
		// do nothing
		this.dndCurrent = this.dnd.current;
		this.dndBefore = this.dnd.before;
	},

	dndDrop: function(source, nodes)
	{
		this.disconnectDocForCancelDnd();
		this.inDnd = false;
		if (this.dndCurrent == null)
			return;
		var w = dijit.byNode(this.dndCurrent);
		if (!w /* || w in this.selectedThumbs */ )
			return;
		var children = this.getChildren();
		var index = dojo.indexOf(children, w);
		if (index < 0)
			return;
		this.moveSlides(index, this.dndBefore);
		dojo.dnd.autoScroll = this._dndAutoScroll;
	},

	dndStart: function(source, nodes, copy)
	{
		var help = pres.model.helper;
		// #2241 - cancel dnd if mouseup in other area
		this.connectDocForCancelDnd();

		// override window.scroll as in presentation no dnd auto scroll needed
		this._dndAutoScroll = dojo.dnd.autoScroll;
		dojo.dnd.autoScroll = function() {};

		var thumbnails = this.selectedThumbs;
		var slides = dojo.map(thumbnails, function(t)
		{
			return t.slide;
		});

		this.inDnd = true;

		var isHavingLockedSlide = dojo.some(slides, function(s)
		{
			return pe.scene.locker.isSlideOrContentLocked(s.id);
		});

		if (isHavingLockedSlide)
		{
			// 18079 - reduced the timeout to prevent chances that user can
			// finish dragging before cancelling the dnd
			setTimeout(dojo.hitch(this, this.cancelDnd, true), 5);
			pe.scene.openLockMessageDialog(slides);
			return;
		}
		else
		{
			var me = this;
			// for future when we need to do anything on dndStart

			this.dndIndexs = [];
			var children = this.getChildren();
			dojo.forEach(thumbnails, function(t, i)
			{
				var index = dojo.indexOf(children, t);
				if (i == 0)
				{
					me.firstThumbDom = thumbnails[0];
					me.firstThumbDomIndex = index;
				}
				me.dndIndexs.push(index);
			});
		}
	},

	dndCancel: function(source)
	{
		this.inDnd = false;
		this.disconnectDocForCancelDnd();
		dojo.dnd.autoScroll = this._dndAutoScroll;
	},

	destroy: function()
	{
		this.inherited(arguments);
		this.inDnd = false;
		if (this.dnd)
			this.dnd.destroy();
		if (this.dndEvents)
		{
			dojo.forEach(this.dndEvents, dojo.disconnect);
			this.dndEvents = [];
		}
	}

});


dojo.dnd.manager().makeAvatar = function()
{
	var avatar = new dojo.dnd.Avatar(this);
	// Fix shape id for thumbnail
	pres.utils.shapeUtil.fixDomShapeIds(avatar.node);
	return avatar;
};
