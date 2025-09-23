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

dojo.provide("pres.widget.SlideEditor");

dojo.require("dijit.layout.ContentPane");
dojo.require("dijit._Container");
dojo.require("dijit._Contained");

dojo.require("pres.editor.Box");

dojo.require("pres.widget.MenuContext");
dojo.require("pres.widget.SlideEditorEvent");
dojo.require("pres.widget.SlideEditorDrag");
dojo.require("pres.widget.SlideEditorImageMixin");
dojo.require("pres.widget.EditorSpellCheck");
dojo.require("pres.constants");

dojo.require("pres.config.boxContextMenu");
dojo.require("pres.config.boxEditingContextMenu");
dojo.require("pres.config.boxEditingTableContextMenu");
dojo.require("pres.config.editorContextMenu");

dojo.require("pres.utils.placeHolderUtil");
dojo.require("pres.utils.htmlHelper");
dojo.require("pres.widget.common.LinkPanel");
dojo.require("pres.widget.common.OpacityPanel");

dojo.require("pres.widget.LineSpaceInputBox");

dojo.requireLocalization("concord.widgets", "slideEditor");
dojo.requireLocalization("pres", "pres");

dojo.declare("pres.widget.SlideEditor", [dijit.layout.ContentPane, dijit._Contained, dijit._Container, pres.widget.SlideEditorEvent, pres.widget.SlideEditorDrag, pres.widget.SlideEditorImageMixin, pres.widget.EditorSpellCheck, pres.editor.BoxComment], {

	index: -1,
	slide: null,

	pageHeight: 0,
	pageWidth: 0,
	canvas: null,
	PASTE_DISPLACEMENT: 0.5,// cm
	scale: 0,

	getCurrentSlideId: function()
	{
		return this.slide.wrapperId;
	},

	showCantAddCommentDialog: function()
	{
		var noBoxesDialog = new concord.widgets.presentationDialog({
			'id': 'noBoxesDialog',
			'aria-describedby': 'noBoxesDialog_containerNode',
			'title': this.nls.cannotAddComment_Title,
			'content': dojo.string.substitute(this.nls.cannotAddComment_Content, [5]),
			'presDialogHeight': 'auto',
			'presDialogWidth': '360',
			'presDialogTop': (this.domNode.parentElement.parentElement.offsetParent.offsetHeight / 2) - 115,
			'presDialogLeft': (this.domNode.parentElement.parentElement.offsetParent.offsetWidth / 2) - 150,
			'heightUnit': 'px',
			'presModal': true,
			'destroyOnClose': true,
			'presDialogButtons': [{
				'label': this.nls.ok,
				'action': dojo.hitch(this, function()
				{
				})
			}]
		});
		noBoxesDialog.startup();
		noBoxesDialog.show();
	},
	checkSelectedBoxCommentNumber: function()
	{
		var size = 0;
		var boxToComment = this.getSelectedContentboxForComment();
		if (boxToComment)
		{
			size = boxToComment.displayedCommentIds.length;
		}
		else
		{
			size = this.displayedCommentIds.length;
		}
		if (size >= 5)
		{
			this.showCantAddCommentDialog();
			return true;
		}
		else
		{
			return false;
		}
	},
	getSelectedContentboxForComment: function()
	{
		return dojo.filter(this.getChildren(), function(c)
		{
			return c.status >= 1;
		})[0];
	},
	getBoxWithCommentId: function(commentsId)
	{
		if (commentsId != null)
		{
			for ( var i = 0; i < this.getChildren().length; i++)
			{
				var box = this.getChildren()[i];
				if (box.hasComment(commentsId))
				{
					return box;
				}
			}
		}
		return null;
	},
	
	getChildren: function()
	{
		return dijit.registry.findWidgets(this.mainNode);
	},

	getActivateBoxes: function()
	{
		var editingBox = this.getEditingBox();
		if (editingBox)
			return [editingBox];
		else
			return this.getSelectedBoxes();
	},

	getSelectedBoxes: function()
	{
		return dojo.filter(this.getChildren(), function(c)
		{
			return c.status >= 1;
		});
	},

	getEditingBox: function()
	{
		return dojo.filter(this.getChildren(), function(c)
		{
			return c.status == 2;
		})[0];
	},

	focus: function()
	{
		this.domNode.focus();
		if (this.getActivateBoxes().length == 0)
		{
			var box = this.getChildren()[0];
			if (box)
				box.enterSelection();
		}
	},

	zoom: function(scale)
	{
		if (this.scale != scale)
		{
			this.scale = scale;
			if (scale == 0)
			{
				this.boxW = 0;
				this.layoutSlide(true, scale);
			}
			else
			{
				this.layoutSlide(false, scale);
			}
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
	createSlidesHtmlDiv : function(){
		//Hidden div to store all slide html in this presentation, in order to improve the performance of load images in slideEditor.
		this.slideHtmlListDiv = dojo.create("div", {
			id: "SlideHtmlListDiv",
			style: {
				"position": "absolute",
				"top": "-50000px",
				"left": "-50000px",
				"overflow": "hidden",
				"width": "1000px",
				"height": "500px"
			}
		}, document.body);
	},
	getSlideHtmlDiv: function(slide) {
		var slideHtmlDiv = slide.htmlDiv;
		if(slideHtmlDiv) {
			return slideHtmlDiv;
		} else {
			slideHtmlDiv = dojo.create("div", {
				id: "slide_number_"+ slide.id,
				"style": {
					display: "none"
				}
			}, this.slideHtmlListDiv);
			slide.htmlDiv = slideHtmlDiv;
		}
		return slideHtmlDiv;
	},
	postCreate: function()
	{
		this.inherited(arguments);
		this.nls = dojo.i18n.getLocalization("concord.widgets", "slideEditor");
		this.presnls = dojo.i18n.getLocalization("pres", "pres");
		this.modelDomMap = {};
		this.containerNode = dojo.create("div", {
			"className": "box",
			"dojoAttachPoint": "containerNode",
			"style": {
				position: "absolute",
				zIndex: 1000,
				top: 0,
				left: 0,
				width: "100%",
				height: "100%"
			}
		}, this.domNode);
		this.mainNode = dojo.create("div", {
			"dojoAttachPoint": "mainNode",
			style: {
				"background": "white",
				"position": "relative",
				"overflow": "visible",
				"display": "none"
			}
		}, this.containerNode);

		this.domNode.style.overflow = "auto";
		this.domNode.tabIndex = 0;
		pe.scene.slideEditor = this;

		if (pe.scene.isHTMLViewMode() || pe.scene.isMobile)
			return;

		dojo.create("div", {
			id: "pres_assist_tip",
			style: {
				"display": "none"
			}
		}, this.containerNode);
		this.createSlidesHtmlDiv();
		this.connect(this.domNode, "onkeypress", "onKey");
		this.connect(this.domNode, "onscroll", "onScroll");
		// this.connect(this.domNode, "onclick", "onClick");

		if (!pe.scene.isMobile)
		{
			if (pe.scene.isMobileBrowser())
			{
				this.connect(this.domNode, "ontouchstart", "onMouseDown");
				this.connect(this.domNode, "ontouchend", "onMouseUp");
				this.connect(this.domNode, "ontouchmove", "onMouseMove");
			}
			else
			{
				this.connect(this.domNode, "onmousedown", "onMouseDown");
				this.connect(this.domNode, "onmousemove", "onMouseMove");
				this.connect(this.domNode, "onmouseup", "onMouseUp");
				this.connect(this.domNode, "onmouseleave", "onMouseLeave");
			}

			this.connect(this.domNode, "ondragstart", function(e)
			{
				dojo.stopEvent(e);
			});
		}

		this.subscribe("/editor/notes/focus", this.noNotesFocus);

		this.subscribe("/editor/commentselected", this.onCommentBoxSelected);

		this.subscribe("/scene/user/joined", this.checkLocks);
		this.subscribe("/scene/coedit/started", this.checkLocks);

		this.subscribe("/element/attr/changed", this.onElementAttrChanged);
		this.subscribe("/element/style/changed", this.onElementStyleChanged);
		this.subscribe("/shape/size/changed", this.onShapeSizeChanged);
		this.subscribe("/shape/pos/changed", this.onShapePosChanged);
		this.subscribe("/shape/bgfill/changed", this.onShapeBgFillChanged);
		this.subscribe("/shape/borderfill/changed", this.onShapeBorderFillChanged);
		this.subscribe("/shape/opacityfill/changed",this.onShapeOpacityChanged);
		this.subscribe("/shape/linestyle/changed", this.onShapeLineTypeChanged);
		this.subscribe("/element/deleted", this.onElementDeleted);
		this.subscribe("/elements/deleted", this.onElementsDeleted);

		this.dispatch("/lock/element/add");
		this.dispatch("/lock/element/remove");

		this.subscribe("/element/inserted", this.onElementInserted);

		this.subscribe("/table/row/resized", this.onTableChanged);
		this.subscribe("/table/row/moved", this.onTableChanged);
		this.subscribe("/table/row/inserted", this.onTableChanged);
		this.subscribe("/table/row/deleted", this.onTableChanged);
		this.subscribe("/table/row/set/header", this.onTableChanged);
		this.subscribe("/table/row/remove/header", this.onTableChanged);

		this.subscribe("/table/col/resized", this.onTableChanged);
		this.subscribe("/table/col/moved", this.onTableChanged);
		this.subscribe("/table/col/inserted", this.onTableChanged);
		this.subscribe("/table/col/deleted", this.onTableChanged);
		this.subscribe("/table/col/set/header", this.onTableChanged);
		this.subscribe("/table/col/remove/header", this.onTableChanged);

		this.subscribe("/table/cell/cleared", this.onTableChanged);
		this.subscribe("/table/cell/pasted", this.onTableChanged);
		this.subscribe("/table/cell/colored", this.onTableChanged);

		this.subscribe("/table/height/adjust", this.onTableChanged);
		this.subscribe("/table/style/updated", this.onTableChanged);

		this.subscribe("/msg/rn/before", dojo.hitch(this, function(ids)
		{
			dojo.forEach(ids, dojo.hitch(this, function(id)
			{
				var box = this.getBoxByElementId(id);
				if (box)
					box.recordStatus();
			}));
		}));
		this.subscribe("/msg/rn/after", dojo.hitch(this, function(ids)
		{
			dojo.forEach(ids, dojo.hitch(this, function(id)
			{
				var box = this.getBoxByElementId(id);
				if (box)
					box.restoreStatus();
			}));
		}));

		this.subscribe("/box/enter/selection", this.onBoxSelected);
		this.subscribe("/box/enter/edit", this.onBoxEditing);
		this.subscribe("/slide/attr/changed", this.refreshComments);

		this.boxMenuModel = new pres.model.Commands(pres.config.boxContextMenu);
		this.boxEditingMenuModel = new pres.model.Commands(pres.config.boxEditingContextMenu);
		this.boxEditingTableMenuModel = new pres.model.Commands(pres.config.boxEditingTableContextMenu);
		this.editorMenuModel = new pres.model.Commands(pres.config.editorContextMenu);

		this.boxEditingContextMenu = new pres.widget.MenuContext({
			model: this.boxEditingMenuModel,
			renderBoxSelection: dojo.hitch(this, function()
			{
			})
		});
		this.boxEditingTableContextMenu = new pres.widget.MenuContext({
			model: this.boxEditingTableMenuModel,
			renderBoxSelection: dojo.hitch(this, function()
			{
				var editingBox = this.getEditingBox();
				if (editingBox && editingBox.editor)
				{
					var cells = editingBox.editor.getSelectedTableCells();
					if (cells && cells.length > 1)
					{
						// editingBox.editor.renderSelection();
					}
				}
			})
		});
		this.boxContextMenu = new pres.widget.MenuContext({
			model: this.boxMenuModel
		});
		this.editorContextMenu = new pres.widget.MenuContext({
			model: this.editorMenuModel
		});

		this.boxContextMenu.startup();
		this.boxEditingTableContextMenu.startup();
		this.boxEditingContextMenu.startup();
		this.editorContextMenu.startup();
		
		var mb = pe.scene.isMobileBrowser();

		this.connect(this.domNode, "oncontextmenu", function(e)
		{
			var t = e.target;
			if (mb) {
				// don't show the contextMenu when it's mobile Brower, in order to let text range select work.
				//this.popupContextMenu(e, true);
			}
			else if (t == this.slideNode || t == this.containerNode || t == this.mainNode || t == this.domNode || this._isBackground(t))
				this.popupContextMenu(e, true);
		});
		if (dojo.isIE)
		{
			// to disable IE selection when shift clicked.
			// it is not a perfect solution though, not work every single time, but do blocked many cases.
			this.connect(dojo.body(), "onselectstart", function(evt){
				if((this._shiftResize || (document.activeElement && dojo.isDescendant(document.activeElement, this.domNode) && !pe.inCopyPasteAction && !this.getEditingBox())) 
						&& (this._moveMouseDown || this._draged))
				{
					if (evt)
						dojo.stopEvent(evt);
					return false;
				}
			});
		}
		this.connect(this.domNode, "onkeydown", function(evt)
		{
			if (evt.shiftKey)
			{
				this._toggleShiftInResize(true);
			}
			if (evt.shiftKey && evt.keyCode == dojo.keys.F10)
			{
				this.popupContextMenu(evt);
				dojo.stopEvent(evt);
			}
		});
		this.connect(this.domNode, "onkeyup", function(evt)
		{
			this._toggleShiftInResize(false);
		});
	},

	noNotesFocus: function()
	{
		this.deSelectAll();
		this.toggleDragCreateMode(false);
		dojo.publish("/editor/focus", []);
	},
	onCommentBoxSelected: function(selectedCommentId)
	{
		var cBox = this.getBoxWithCommentId(selectedCommentId);
		if (cBox && cBox.status != cBox.STATUS_SELECTED)
		{
			cBox.enterSelection();
		}
	},
	onBoxSelected: function(box)
	{
		if (!box.element.isNotes)
		{
			dojo.publish("/editor/slide/focus", this);
		}
	},

	onBoxEditing: function(box)
	{
		if (!box.element.isNotes)
		{
			dojo.publish("/editor/slide/focus", this);
		}
	},

	onElementDeleted: function(ele, eventSource, batch)
	{
		if (!ele.isNotes)
		{
			if (ele.parent == this.slide)
			{
				var box = dijit.byId(ele.id);
				if (box)
					box.destroy();
				else
				{
					// just in case the box widget is not startup or it is not an editable element.
					var node = dojo.query("[id='" + ele.id + "']", this.domNode)[0];
					node && dojo.destroy(node);
				}
				this.delayLayout();
				if (!batch)
				{
					if (!eventSource || !eventSource.msg)
					{
						this.domNode.focus();
					}
				}
			}
		}
	},

	onElementsDeleted: function(eles, eventSource)
	{
		dojo.forEach(eles, dojo.hitch(this, function(ele)
		{
			this.onElementDeleted(ele, eventSource, true);
		}));

		if (!eventSource || !eventSource.msg)
		{
			this.domNode.focus();
		}
	},

	onElementInserted: function(element, eventSource)
	{
		if (!element.isNotes)
		{
			if (element.parent == this.slide && this.slideNode && this.slideNode.parentNode == this.mainNode)
			{
				var dom = dojo.create("div", {}, null);
				dom.innerHTML = element.getHTML();
				var outDom = dom.childNodes[0];
				var shapeDomId = "";
				if (element.family == "group")
				{
					dojo.addClass(outDom, "hideShape");
					shapeDomId = outDom.id;
				}
				var innerDom = this.slideNode.appendChild(outDom);
				pres.utils.placeHolderUtil.i18n(innerDom);
				if (this.isWidgitizable(element))
				{
					new pres.editor.Box({}, innerDom);
				}
				this.spellCheck(innerDom);
				dojo.destroy(dom);
				if (shapeDomId)
				{
					if (!this._pendingShapeResize)
						this._pendingShapeResize = [];
					this._pendingShapeResize.push(shapeDomId);
				}

				if (eventSource && eventSource.undo)
					this.layoutSlide();
				else
					this.delayLayout();
			}
		}
	},

	onTableChanged: function(element, eventSource)
	{
		if (element.parent == this.slide)
		{
			var remainingDom = null;
			var box = dijit.byId(element.id);
			var status = box.status;
			if (box)
			{
				remainingDom = box.domNode;
				box.destroy(true);
			}
			var dom = dojo.create("div", {}, null);
			dom.innerHTML = element.getHTML();

			var innerDom;
			if (remainingDom)
				innerDom = dojo.place(dom.childNodes[0], remainingDom, "after");
			else
				innerDom = this.slideNode.appendChild(dom.childNodes[0]);

			if (this.isWidgitizable(element))
			{
				new pres.editor.Box({}, innerDom);
			}
			this.spellCheck(innerDom);
			dojo.destroy(dom);
			if (remainingDom)
				dojo.destroy(remainingDom);
			this.delayLayout();

			// enter edit or selection mode
			var box = this.getBoxByElementId(element.id);
			if (box)
			{
				if (status == 2)
				{
					var entered = false;
					if (eventSource && eventSource.cellId)
					{
						var range = box.editor.getRange();
						var cell = dojo.query("[id='" + eventSource.cellId + "']", this.domNode)[0];
						if (cell)
						{
							var span = pres.utils.tableUtil.getFristOrLastSpanFromNode(cell, true);
							if (span && range)
							{
								box.enterEdit(true);
								entered = true;
								range.moveToPosition(span, EditorUtil.POSITION_BEFORE_END);
								range.select();
								box.editor.updateSelection();
								box.editor.renderSelection();
							}
						}
					}
					if (!entered)
						box.enterEdit();
				}
				else if (status == 1)
					box.enterSelection();
			}
		}

	},

	onElementStyleChanged: function(ele, eventSource)
	{
		if (ele.parent == this.slide)
		{
			var box = dijit.byId(ele.id);
			if (box)
				box.onElementStyleChanged(ele, eventSource);
			else
			{
				// just in case the box widget is not startup or it is not an editable element.
				var eleDom = dojo.query("[id='" + ele.id + "']", this.domNode)[0];
				if (eleDom)
				{
					var styleText = ele.attr("style") + ";" + ele.getPositionStyle();
					eleDom.setAttribute("style", styleText);
				}
			}
			this.delayLayout();
		}
	},

	onElementAttrChanged: function(ele, eventSource)
	{
		if (eventSource && eventSource.msg && ele.parent == this.slide)
		{
			var box = dijit.byId(ele.id);
			if (box)
				box.onElementAttrChanged(ele, eventSource);
			else
			{
				// just in case the box widget is not startup or it is not an editable element.
				var eleDom = dojo.query("[id='" + ele.id + "']", this.domNode)[0];
				if (eleDom)
				{
					var attrsMap = ele.getAttrsMap();
					dojo.forEach(eleDom.attributes, function(attr)
					{
						if (attr && attr.nodeName != "widgetId" && attr.nodeName != "widgetid" && attr.nodeName != "contentEditable" && attr.nodeName != "contenteditable")
						{
							eleDom.removeAttribute(attr.nodeName);
						}
					});
					for ( var x in attrsMap)
					{
						var value = attrsMap[x];
						if (x == "style")
						{
							value = attrsMap[x] + ";" + ele.getPositionStyle();
						}
						eleDom.setAttribute(x, value);
					}
				}
			}
			this.delayLayout();
		}
	},

	// onShapeSizeChanged
	onShapeSizeChanged: function(ele, eventSource)
	{
		if (ele.parent == this.slide)
		{
			var box = dijit.byId(ele.id);
			if (box)
				box.onShapeSizeChanged(ele, eventSource);
		}
	},

	onShapePosChanged: function(ele, eventSource)
	{
		if (ele.parent == this.slide)
		{
			var box = dijit.byId(ele.id);
			if (box)
				box.onShapePosChanged(ele, eventSource);
		}
	},

	onShapeBgFillChanged: function(ele, eventSource)
	{
		if (ele.parent == this.slide)
		{
			var box = dijit.byId(ele.id);
			if (box)
				box.onShapeFillChanged(ele, eventSource, 'bg');
		}
	},
	onShapeBorderFillChanged: function(ele, eventSource)
	{
		if (ele.parent == this.slide)
		{
			var box = dijit.byId(ele.id);
			if (box)
				box.onShapeFillChanged(ele, eventSource, 'bd');
		}
	},

	onShapeLineTypeChanged: function(ele, eventSource,changeType)
	{
		if (ele.parent == this.slide)
		{
			var box = dijit.byId(ele.id);
			if (box)
				box.onShapeLineTypeChanged(ele, eventSource, changeType);
		}
	},
	
	onShapeOpacityChanged: function(ele, eventSource)
	{
		if (ele.parent == this.slide)
		{
			var box = dijit.byId(ele.id);
			if (box)
				box.onShapeFillChanged(ele, eventSource, 'op');
		}
	},
	
	openTransparencyDialog : function(transparencyValue)
	{
		var box = this.getSelectedBoxes()[0];
		if (!box)
			return;
		this.opcityPanelShow = true;
		var transparencyPanel = new pres.widget.common.OpacityPanel(this.presnls.opacity_title);
		transparencyPanel._setDisabledAttr(false);
		//dialog width = 180 , border = 4 , locate dialog in the middle under selected box. 
		var tempDom = dojo.position(box.domNode);
		var left = tempDom.x + tempDom.w*0.5 - 184 *0.5;
		var top = tempDom.y + tempDom.h;	
		dojo.style(transparencyPanel.domNode,{'left':left+'px','top':top+'px'});
		
		dojo.body().appendChild(transparencyPanel.domNode);
		dojo.addClass(transparencyPanel.domNode, 'transparencyDialogCSS');
		transparencyPanel.configOpDialogDiv();
		transparencyPanel.setValue(transparencyValue);
		transparencyPanel.slideWidget.focus();
		dojo.connect(transparencyPanel, 'onBlur' , this , function(){
			transparencyPanel.destory();
			var cmModel = pe.scene.hub.commandsModel;
			cmModel.setValue(pres.constants.CMD_TRANSPARENCY_DIALOG_OPEN , transparencyPanel.slideWidget.getValue());
		});
		
		dojo.connect(transparencyPanel.slideWidget.sliderBarContainer , 'onmouseenter' , this , function(){
			if(!transparencyPanel.publishCMD)
				transparencyPanel.publishCMD = true ;
		});

		dojo.connect(transparencyPanel.slideWidget.sliderHandle , 'onkeydown' , this , function(){
			if(!transparencyPanel.publishCMD)
				transparencyPanel.publishCMD = true ;
		});
		
		transparencyPanel.domNode.tabIndex = 0;
		dojo.connect(transparencyPanel.domNode , "onkeydown" , dojo.hitch(this, function( e ){
			if(e.keyCode == dojo.keys.ESCAPE && transparencyPanel)
			{
				transparencyPanel.destory();
				if( box )
					box.focus();// For acc
			}
		}));
	},
	
	popupContextMenu: function(evt, mouse)
	{
		//not allow user do select object & input text action while in partial load.
		if(!pe.scene.isLoadFinished()) {
			evt.stopPropagation();
			dojo.stopEvent(evt);
			return;
		}
		
		var target = evt.target;
		var isOnBox = target && this.slideNode && target != this.slideNode && dojo.isDescendant(target, this.slideNode) && !this._isBackground(target);

		if (!mouse)
			isOnBox = this.getActivateBoxes().length > 0;

		var editingBox = this.getEditingBox();
		var isInEditing = false;
		var menu = null;
		if (!isOnBox)
		{
			menu = this.editorContextMenu;
		}
		else
		{
			var children = this.getChildren();
			for ( var i = 0; i < children.length; i++)
			{
				var c = children[i];
				if (c.status == c.STATUS_EDITING)
				{
					isInEditing = true;
					break;
				}
			}

			if (isInEditing)
			{
				editingBox.detachCoEditTooltip();
				menu = editingBox.element.family == "table" ? this.boxEditingTableContextMenu : this.boxEditingContextMenu;
				// menu.rebuild();
				this.detachSpellCheckMenuItems(menu);
				this.refreshLinkMenuItems(menu);
				if (window.spellcheckerManager && spellcheckerManager.isAutoScaytEnabled())
					this.attachSpellCheckMenuItems(editingBox, menu);
			}
			else
			{
				menu = this.boxContextMenu;
			}
		}
		if (menu)
		{
			var target = evt.target;
			if (isInEditing)
				target = editingBox.domNode;
			var pos = {
				x: evt.pageX,
				y: evt.pageY
			};
			if (!mouse)
			{
				pos = dojo.coords(target);
				if (target == this.domNode)
				{
					pos.x += 100;
					pos.y += 100;
				}
			}
			menu._scheduleOpen(target, null, pos);
		}
		// dojo.stopEvent(evt);
	},

	checkLocks: function()
	{
		dojo.forEach(this.getChildren(), function(c)
		{
			if (pe.scene.locker.isLockedByMe(c.element.id))
				c.lock();
		});
	},

	bringToFront: function()
	{
		var boxes = this.getActivateBoxes();
		if (boxes.length == this.getChildren().length || boxes.length == 0)
			return;

		var maxZIndex = this.slide.getMaxZ() + 1;

		dojo.forEach(boxes, function(child)
		{
			child.domNode.style.zIndex = maxZIndex++;
		});

		dojo.publish("/box/pos/changed", [boxes]);
		this.domNode.focus();
	},

	sendToBack: function()
	{
		var boxes = this.getActivateBoxes();
		if (boxes.length == this.getChildren().length || boxes.length == 0)
			return;

		var minZIndex = this.slide.getMinZ(true);
		minZIndex--;
		if (minZIndex < 0)
			minZIndex = 0;

		dojo.forEach(boxes, function(child)
		{
			child.domNode.style.zIndex = minZIndex;
			minZIndex--;
			if (minZIndex < 0)
				minZIndex = 0;
		});

		dojo.publish("/box/pos/changed", [boxes]);
		this.domNode.focus();
	},
	
	rotate: function(deg)
	{
		this.domNode.focus();
		var boxes = this.getActivateBoxes();
		if (boxes.length == 0)
			return;

		dojo.forEach(boxes, function(box)
		{
			if (box.element.family == "group" && box.element.svg)
			{
				var util = pres.utils.shapeUtil;
				var trans = util.parseTransformStyle(box.domNode.style.transform||box.domNode.style.webkitTransform||box.domNode.style.ieTransform||"");
				var d = trans.scaleX==trans.scaleY ? deg : -deg;
				box.resizeWrapper.style.transform = "rotate(" + d + "deg)";
			}
			else
			{
				var util = pres.utils.shapeUtil;
				var trans = util.parseTransformStyle(box.domNode.style.transform||box.domNode.style.webkitTransform||box.domNode.style.ieTransform||"");
				trans.rot += deg
				var newTrans = util.getTransformStyle(trans);
				
				dojo.style(box.domNode, 'transform', newTrans);
				dojo.style(box.domNode, '-webkit-transform', newTrans);
				dojo.style(box.domNode, '-ms-transform', newTrans);
				dojo.style(box.domNode, '-moz-transform', newTrans);
			}
		});

		dojo.publish("/box/trans/changed", [boxes]);
	},

	flip: function(x, y)
	{
		this.domNode.focus();
		var boxes = this.getActivateBoxes();
		if (boxes.length == 0)
			return;

		dojo.forEach(boxes, function(box)
		{
			if (box.element.family == "group" && box.element.svg)
			{
				box.resizeWrapper.style.transform = "scale(" + x + "," + y + ")";
			}
			else
			{
				var oldTrans = box.domNode.style.transform || "";
				oldTrans = oldTrans.replace(/ /g, "");
				var transMap = {};
				dojo.forEach(oldTrans.split(')'), function(attr)
				{
					var t = attr.split('(');
					if (t.length == 2)
					{
						transMap[t[0]] = t[1];
					}
				});

				if (transMap.scale)
				{
					var scaleResult1 = /(-?1),(-?1)/.exec(transMap.scale);
					var scaleResult2 = /(-?1)/.exec(transMap.scale);
					if (scaleResult1)
					{
						transMap.scaleX = parseInt(scaleResult1[1]);
						transMap.scaleY = parseInt(scaleResult1[2]);
					}
					else if (scaleResult2)
					{
						transMap.scaleX = parseInt(scaleResult2[1]);
						transMap.scaleY = parseInt(scaleResult2[1]);
					}
				}

				transMap.scaleX = (transMap.scaleX || 1) * x;
				transMap.scaleY = (transMap.scaleY || 1) * y;

				var newScale;
				if (transMap.scaleX == 1 && transMap.scaleY == 1)
					newScale = "";
				else
					newScale = "scale(" + transMap.scaleX + "," + transMap.scaleY + ")";

				var newTrans = "";
				if (transMap.rotate)
				{
					var r = /(.*)deg/.exec(transMap.rotate);
					r = r ? (360 - parseFloat(r[1])) % 360 : 0;
				}
				var newTrans = transMap.rotate ? "rotate(" + (r) + "deg)" : "";
				newTrans += newScale;

				dojo.style(box.domNode, 'transform', newTrans);
				dojo.style(box.domNode, '-webkit-transform', newTrans);
				dojo.style(box.domNode, '-ms-transform', newTrans);
				dojo.style(box.domNode, '-moz-transform', newTrans);
				
				var textNode = dojo.query(".draw_text-box", box.domNode)[0];
				if(textNode)
				{
					var textNodeStylestr = dojo.attr(textNode,"style");
					var textNodeStyles = pres.utils.htmlHelper.extractStyle(textNodeStylestr);
					if(transMap.scaleX == transMap.scaleY)
					{
						delete textNodeStyles["transform"];
						delete textNodeStyles["-moz-transform"];
						delete textNodeStyles["-ms-transform"];
						delete textNodeStyles["-webkit-transform"];
					}
					else
					{
						textNodeStyles["transform"] = "scaleX(-1)";
						textNodeStyles["-moz-transform"] = "scaleX(-1)";
						textNodeStyles["-ms-transform"] = "scaleX(-1)";
						textNodeStyles["-webkit-transform"] = "scaleX(-1)";
					}
					textNodeStylestr = pres.utils.htmlHelper.stringStyle(textNodeStyles);
					dojo.attr(textNode,"style",textNodeStylestr);
				}
			}
		});

		dojo.publish("/box/trans/changed", [boxes]);
	},
	
	// Symphony distibute by distance (spacing.)
	boxDistribute: function(vertical)
	{
		this.domNode.focus();
		if(pe.scene.hub.focusMgr && pe.scene.hub.focusMgr.isCopyPasteIssueCases()) {
			setTimeout(function() {
				pe.scene.hub.focusMgr.onFocusOut();
			},0);
		}
		var boxes = this.getActivateBoxes();
		
		// 3 boxes at least.
		if (boxes.length < 2)
			return;
		
		if (boxes.length > 1)
		{
			var l, r, t, b;
			var poses = {};
			var totalHeight = 0;
			var totalWidth = 0;
			dojo.forEach(boxes, dojo.hitch(this, function(box, index)
			{
				var dom = box.domNode;
				var temp;
				if (index == 0)
				{
					temp = dojo.position(dom);
					l = temp.x;
					r = temp.x + temp.w;
					t = temp.y;
					b = temp.y + temp.h;
				}
				else
				{
					temp = dojo.position(dom);
					l = l < temp.x ? l : temp.x;
					r = r > (temp.x + temp.w) ? r : (temp.x + temp.w);
					t = t < temp.y ? t : temp.y;
					b = b > (temp.y + temp.h) ? b : (temp.y + temp.h);
				}
				totalHeight += temp.h;
				totalWidth += temp.w;
				poses[box.element.id] = temp;
			}));

			var totalAreaHeight = b - t;
			var totalAreaWidth = r - l;

			boxes.sort(function(a, b){
				
				var posa = poses[a.element.id];
				var posb = poses[b.element.id];
				
				var centera = vertical ? (posa.y + (posa.h / 2)) : (posa.x + (posa.w / 2));
				var centerb = vertical ? (posb.y + (posb.h / 2)) : (posb.x + (posb.w / 2));

				if (centera < centerb)
					return -1;
				if (centera > centerb)
					return 1;

				return 0;
			});

			var posesArr = [];
			dojo.forEach(boxes, function(box){
				posesArr.push(poses[box.element.id]);
			});

			var spacesCount = boxes.length - 1;
			// the space might be negative number.
			var space = vertical ? ((totalAreaHeight - totalHeight) / spacesCount) :
				((totalAreaWidth - totalWidth) / spacesCount);

			var stepStart = vertical ? (posesArr[0].y + (posesArr[0].h / 2)) :
				(posesArr[0].x + (posesArr[0].w / 2)); // the middle point;

			// supposed next box's center point.
			stepStart += (space + (vertical ?  (posesArr[0].h + posesArr[1].h)/2 : 
				(posesArr[0].w + posesArr[1].w)/2));
			
			var changedBoxes = [];

			for (var i = 1; i < boxes.length - 1; i ++)
			{
				var box = boxes[i];
				var pos = posesArr[i];
				var center = vertical ? (pos.y + (pos.h / 2)) : (pos.x + (pos.w / 2));
				var delta = stepStart - center;

				if (delta != 0)
				{
					// set box's center to stepStart;
					var attr = vertical ? "top" : "left";
					var dom = box.domNode;
					var oldValue = parseFloat(vertical ? dom.style.top : dom.style.left);
					if (isNaN(oldValue))
						oldValue = 0;
					var newValue = oldValue + this.pxToPercent(delta, !vertical)
					dom.style[attr] = newValue + "%";
					changedBoxes.push(box);
				}

				stepStart += (space + (vertical ? (posesArr[i].h + posesArr[i + 1].h)/2 : 
					(posesArr[i].w + posesArr[i + 1].w)/2));
			}
			
			if (changedBoxes.length)
				dojo.publish("/box/pos/changed", [changedBoxes]);
		}
		else
		{
			var refPos = dojo.position(this.slideNode);
			if (boxes.length == 1)
			{
				var box = boxes[0];
				var dom = box.domNode;
				if (vertical)
				{
					var p = dojo.position(dom);
					var oldTop = parseFloat(dom.style.top);
					if(isNaN(oldTop))
						oldTop = 0;
					dom.style.top = (oldTop + this.pxToPercent((refPos.h-p.h)/2+refPos.y-p.y, false)) + "%";
				}
				else
				{
					var p = dojo.position(dom);
					var oldLeft = parseFloat(dom.style.left);
					if(isNaN(oldLeft))
						oldLeft = 0;
					dom.style.left = (oldLeft + this.pxToPercent((refPos.w-p.w)/2+refPos.x-p.x, true)) + "%";
				}
				dojo.publish("/box/pos/changed", [boxes]);
			}
		}
	},

	boxAlign: function(dir)
	{
		this.domNode.focus();
		if(pe.scene.hub.focusMgr && pe.scene.hub.focusMgr.isCopyPasteIssueCases()) {
			setTimeout(function() {
				pe.scene.hub.focusMgr.onFocusOut();
			},0);
		}
		var boxes = this.getActivateBoxes();
		if (boxes.length == 0)
			return;
		var refPos;
		if (boxes.length > 1)
		{
			refPos = {};
			var l, r, t, b;
			dojo.forEach(boxes, dojo.hitch(this, function(box, index)
			{
				var dom = box.domNode;
				if (index == 0)
				{
					var temp = dojo.position(dom);
					l = temp.x;
					r = temp.x + temp.w;
					t = temp.y;
					b = temp.y + temp.h;
				}
				else
				{
					var temp = dojo.position(dom);
					l = l < temp.x ? l : temp.x;
					r = r > (temp.x + temp.w) ? r : (temp.x + temp.w);
					t = t < temp.y ? t : temp.y;
					b = b > (temp.y + temp.h) ? b : (temp.y + temp.h);
				}
			}));

			refPos.x = l;
			refPos.y = t;
			refPos.w = r - l;
			refPos.h = b - t;
		}
		else
		{
			refPos = dojo.position(this.slideNode);
		}
			 
		dojo.forEach(boxes, dojo.hitch(this, function(box)
		{
			var dom = box.domNode;
			if (dir == "top")
			{
				var p = dojo.position(dom);
				var oldTop = parseFloat(dom.style.top);
				if(isNaN(oldTop))
					oldTop = 0;
				dom.style.top = (oldTop - this.pxToPercent(p.y-refPos.y, false)) + "%";	
			}
			else if (dir == "bottom")
			{
				var p = dojo.position(dom);
				var oldTop = parseFloat(dom.style.top);
				if(isNaN(oldTop))
					oldTop = 0;
				dom.style.top = (oldTop + this.pxToPercent(refPos.h-p.h+refPos.y-p.y, false)) + "%";
			}
			else if (dir == "middle")
			{
				var p = dojo.position(dom);
				var oldTop = parseFloat(dom.style.top);
				if(isNaN(oldTop))
					oldTop = 0;
				dom.style.top = (oldTop + this.pxToPercent((refPos.h-p.h)/2+refPos.y-p.y, false)) + "%";
			}
			else if (dir == "left")
			{
				var p = dojo.position(dom);
				var oldLeft = parseFloat(dom.style.left);
				if(isNaN(oldLeft))
					oldLeft = 0;
				dom.style.left = (oldLeft - this.pxToPercent(p.x-refPos.x, true)) + "%";				
			}
			else if (dir == "right")
			{
				var p = dojo.position(dom);
				var oldLeft = parseFloat(dom.style.left);
				if(isNaN(oldLeft))
					oldLeft = 0;
				dom.style.left = (oldLeft + this.pxToPercent(refPos.w-p.w+refPos.x-p.x, true)) + "%";
			}
			else if (dir == "center")
			{
				var p = dojo.position(dom);
				var oldLeft = parseFloat(dom.style.left);
				if(isNaN(oldLeft))
					oldLeft = 0;
				dom.style.left = (oldLeft + this.pxToPercent((refPos.w-p.w)/2+refPos.x-p.x, true)) + "%";
			}
		}));
		dojo.publish("/box/pos/changed", [boxes]);
	},

	selectAll: function()
	{
		if (pe.scene.isMobile)
			this.domNode.style.display = "none";
		dojo.forEach(this.getChildren(), function(child)
		{
			if (pe.scene.locker.isLockedByOther(child.element.id))
				return;
			if (child.status)
				child.exitEdit();
			child.enterSelection();
		});
		this.domNode.style.display = "";
		this.domNode.focus();
	},

	setBgColor: function(value)
	{
		var box = this.getSelectedBoxes()[0];
		if (!box)
			return;
		if (box.element.family == "text")
		{
			dojo.publish("/box/set/color", [[box], value]);
		}
		else if (box.element.family == "table")
		{
			var cells = box.editor.getSelectedTableCells();
			if (!cells || cells.length == 0)
			{
				cells = [];
				dojo.forEach(box.element.table.rows, dojo.hitch(this, function(row)
				{
					cells = cells.concat(row.cells);
				}));
			}
			dojo.publish("/table/to/color/cell", [box.element, cells, value]);
		}
		else if (box.element.family == "group")
		{
			dojo.publish("/shape/set/bgcolor", [[box], value]);
		}
	},
	
	setOpacity: function(value)
	{
		var opacityValue = parseFloat(value)/100;
		var box = this.getSelectedBoxes()[0];
		if (!box)
			return;
		if (box.element.family == "group"&&box.element.svg)
		{
			dojo.publish("/shape/set/opacity", [[box], opacityValue]);
		}
		else if (box.element.family == "graphic"||(box.element.family == "group"&&!(box.element.svg)))
		{
			//graphic: img created in docs    group : img imported. 
			dojo.publish("/img/set/opacity", [[box], opacityValue]);
		}
		else if (box.element.family == "text")
		{
			dojo.publish("/box/set/opacity", [[box], opacityValue]);
		}
	},
	
	// for shape and line type only for now.
	setBorderColor: function(value)
	{
		var box = this.getSelectedBoxes()[0];
		if (!box)
			return;
		if (box.element.family == "text")
		{
		}
		else if (box.element.family == "table")
		{
		}
		else if (box.element.family == "group")
		{
			dojo.publish("/shape/set/bordercolor", [[box], value]);
		}
	},

	execTable: function(cmd, value)
	{
		var c = pres.constants;
		var box = this.getEditingBox();
		var boxSel = this.getSelectedBoxes();

		if (cmd == c.CMD_TABLE_UPDATE_TEMPLATE)
		{
			var elementId = null;
			if (box && box.element.family == "table")
			{
				dojo.publish("/table/to/update/template", [box.element, value, box.editor.getSelectedTableCells()]);
				elementId = box.element.id;
			}
			else if (boxSel.length == 1 && boxSel[0].element.family == "table")
			{
				dojo.publish("/table/to/update/template", [boxSel[0].element, value]);
				elementId = boxSel[0].element.id;
			}
			setTimeout(dojo.hitch(this, function()
			{
				if (elementId)
				{
					var box = this.getBoxByElementId(elementId);
					box && box.focus();
				}
			}), 0);
			return;
		}

		if (!(box && box.element.family == "table"))
			return;

		var cells = box.editor.getSelectedTableCells();
		if (!cells || cells.length == 0)
			return;

		var fromCell = cells[0];
		var toCell = cells[cells.length - 1];
		var fromRow = fromCell.parent;
		var toRow = toCell.parent;
		var multipleCell = fromCell != toCell;
		var multipleRow = fromRow != toRow;

		/* row start */
		if (cmd == c.CMD_TABLE_DELETE_ROW)
		{
			dojo.publish("/table/to/delete/row", [box.element, cells]);
		}
		else if (cmd == c.CMD_TABLE_SET_ROW_HEADER)
		{
			if (!multipleRow)
				dojo.publish("/table/to/set/row/header", [box.element, cells]);
		}
		else if (cmd == c.CMD_TABLE_REMOVE_ROW_HEADER)
		{
			if (!multipleRow)
				dojo.publish("/table/to/remove/row/header", [box.element, cells]);
		}
		else if (cmd == c.CMD_TABLE_MOVE_ROW_UP)
		{
			dojo.publish("/table/to/move/row", [box.element, cells, true]);
		}
		else if (cmd == c.CMD_TABLE_MOVE_ROW_DOWN)
		{
			dojo.publish("/table/to/move/row", [box.element, cells, false]);
		}
		else if (cmd == c.CMD_TABLE_INSERT_ROW_ABOVE)
		{
			dojo.publish("/table/to/insert/row", [box.element, cells, true]);
		}
		else if (cmd == c.CMD_TABLE_INSERT_ROW_BELOW)
		{
			dojo.publish("/table/to/insert/row", [box.element, cells, false]);
		}

		/* column start */
		if (cmd == c.CMD_TABLE_DELETE_COLUMN)
		{
			dojo.publish("/table/to/delete/col", [box.element, cells]);
		}
		else if (cmd == c.CMD_TABLE_SET_COLUMN_HEADER)
		{
			dojo.publish("/table/to/set/col/header", [box.element, cells]);
		}
		else if (cmd == c.CMD_TABLE_REMOVE_COLUMN_HEADER)
		{
			dojo.publish("/table/to/remove/col/header", [box.element, cells]);
		}
		else if (cmd == c.CMD_TABLE_MOVE_COLUMN_LEFT)
		{
			var wrapper = dojo.byId(box.element.id);
			var left = (wrapper && dojo.getStyle(wrapper, 'direction') == 'rtl') ? false : true;
			dojo.publish("/table/to/move/col", [box.element, cells, left]);
		}
		else if (cmd == c.CMD_TABLE_MOVE_COLUMN_RIGHT)
		{
			var wrapper = dojo.byId(box.element.id);
			var right = (wrapper && dojo.getStyle(wrapper, 'direction') == 'rtl') ? true : false;
			dojo.publish("/table/to/move/col", [box.element, cells, right]);
		}
		else if (cmd == c.CMD_TABLE_INSERT_COLUMN_BEFORE)
		{
			dojo.publish("/table/to/insert/col", [box.element, cells, true]);
		}
		else if (cmd == c.CMD_TABLE_INSERT_COLUMN_AFTER)
		{
			dojo.publish("/table/to/insert/col", [box.element, cells, false]);
		}

		/* cell start */
		if (cmd == c.CMD_TABLE_CLEAR_CELL)
		{
			dojo.publish("/table/to/clear/cell", [box.element, cells]);
		}
		else if (cmd == c.CMD_TABLE_COLOR_CELL)
		{
			dojo.publish("/table/to/color/cell", [box.element, cells, value]);
		}
	},

	setLineStyle: function(value, cmd){
		var box = this.getSelectedBoxes()[0];
		if (!box )
			return;
		if (box.element.family == "group" && box.element.svg)
		{
			dojo.publish("/shape/set/linestyle", [[box], value, cmd]);
		}
	},
	
	createBox: function(type, params)
	{
		if (!type)
		{
			console.error("ERROR! no type info to create a box!");
			return false;
		}
		this.deSelectAll();
		dojo.publish("/box/to/create", [type, params]);
	},

	deleteBox: function()
	{
		if (this.getSelectedBoxes().length > 0)
		{
			dojo.publish("/box/to/delete", [this.getSelectedBoxes()]);
		}
	},

	moveBox: function(dir)
	{
		var offset = 4;
		var me = this;
		var topOffset = dir == "up" ? 0 - offset : dir == "down" ? offset : 0;
		var leftOffset = dir == "left" ? 0 - offset : dir == "right" ? offset : 0;
		var boxes = dojo.filter(this.getChildren(), dojo.hitch(this, function(c)
		{
			if (c.status == 1)
			{
				if (c.isRotatedPPTODPGroupBox())
				{
					this.showWarningMsgForRotatedObject();
					return false;
				}
				return true;
			}
			return false;
		}));

		if (!this._movedBoxesByKey)
			this._movedBoxesByKey = [];

		dojo.forEach(boxes, function(bo)
		{
			if (dojo.indexOf(me._movedBoxesByKey, bo) == -1)
				me._movedBoxesByKey.push(bo);
		});

		if (this._movedBoxesByKey.length == 0)
			return;

		dojo.forEach(boxes, function(box)
		{
			if (!box.coords)
				box.coords = dojo.coords(box.domNode);
			var top = box.coords.t;
			var left = box.coords.l;
			var newTop = top + topOffset;
			var newLeft = left + leftOffset;

			box.coords.t = newTop;
			box.coords.l = newLeft;

			var newTopPer = me.pxToPercent(newTop, false) + "%";
			var newLeftPer = me.pxToPercent(newLeft, true) + "%";
			if (topOffset)
				dojo.style(box.domNode, {
					'top': newTopPer
				});
			if (leftOffset)
				dojo.style(box.domNode, {
					'left': newLeftPer
				});
		});
		clearTimeout(this._keyMoveTimer);
		this._keyMoveTimer = setTimeout(function()
		{
			me.afterMoved(me._movedBoxesByKey);
			me._movedBoxesByKey = null;
		}, 600);
	},
	
	rotateBox: function(deg)
	{
		if(this._keyRotateTimer)
			return;
		var boxes = dojo.filter(this.getChildren(), dojo.hitch(this, function(c)
		{
			if (c.status == 1)
			{
				if (c.isRotatedPPTODPGroupBox())
				{
					this.showWarningMsgForRotatedObject();
					return false;
				}
				
				if(!c.isEnableRotate())
				{
					return false;
				}
				return true;
			}
			return false;
		}));
		
		if(boxes.length < 1)
			return;
		
		dojo.forEach(boxes, function(box)
		{
			box.rotateMe(deg);
		});
		dojo.publish("/box/trans/changed", [boxes]);
		
		var me = this;
		this._keyRotateTimer = setTimeout(function()
		{
			me._keyRotateTimer = null;
		}, 100);
	},

	afterMoved: function(boxes, resize, resizeHandlerName)
	{
		if (boxes && boxes.length)
		{
			var existBoxes = dojo.filter(boxes, function(box)
			{
				if (resize)
				{
					if (box.resized)
					{
						box.resized = false;
						return box && box.domNode && box.domNode.parentNode;
					}
				}
				else
				{
					return box && box.domNode && box.domNode.parentNode;
				}
			});

			document.body.style.cursor = "default";

			if (existBoxes.length)
			{
				this.checkChildrenPos(existBoxes);
				this.resetChildrenCache();
				if (resize)
					if(resizeHandlerName == "rh")
						dojo.publish("/box/trans/changed", [existBoxes]);
					else if(resizeHandlerName.indexOf("ah-") == 0)
						dojo.publish("/box/adjhandler/changed", [existBoxes, resizeHandlerName]);
					else
						dojo.publish("/box/size/changed", [existBoxes, resizeHandlerName]);
				else
					dojo.publish("/box/pos/changed", [existBoxes]);
				this.delayLayout();
			}
		}
	},

	checkChildrenPos: function(boxes)
	{
		var me = this;
		if (boxes)
		{
			var width = parseFloat(dojo.style(this.mainNode, "width"));
			var height = parseFloat(dojo.style(this.mainNode, "height"));

			dojo.forEach(boxes, function(box)
			{
				var coords = dojo.coords(box.domNode);
				var newLeft = coords.l;
				var newTop = coords.t;
				if (coords.l + coords.w < 0)
				{
					newLeft = 0 - coords.w;
					box.domNode.style.left = me.pxToPercent(newLeft, true) + "%";
				}
				else if (coords.l > width)
				{
					box.domNode.style.left = "100%";
				}
				if (coords.t + coords.h < 0)
				{
					newTop = 0 - coords.h;
					box.domNode.style.top = me.pxToPercent(newTop, false) + "%";
				}
				if (coords.t > height)
				{
					newTop = height;
					box.domNode.style.top = "100%";
				}
			});
		}
	},

	getBoxByElementId: function(elemID)
	{
		var box = dijit.byId(elemID);
		return box;
	},

	pxToPercent: function(px, width, parent)
	{
		var pxValue = parseFloat(px);
		var _parent = parent || this.slideNode;
		var value = 1;
		var useWidth = width === true || width === "width";
		if (_parent == this.slideNode)
		{
			if (useWidth)
			{
				if (!this.slideNodeW)
					this.slideNodeW = _parent.offsetWidth;
				value = this.slideNodeW;
			}
			else
			{
				if (!this.slideNodeH)
					this.slideNodeH = _parent.offsetHeight;
				value = this.slideNodeH;
			}
		}
		else
		{
			value = (!useWidth) ? _parent.offsetHeight : _parent.offsetWidth;
		}
		var result = (pxValue * 100) / value;
		return result;
	},

	//
	// Compare if objects are in exact same position or not
	//
	inSamePosition: function(element)
	{
		var withIn = 0.2;
		for ( var i = 0; i < this.getChildren().length; i++)
		{
			var box = this.getChildren()[i];
			var leftDiff = Math.abs(parseFloat(element.l) - parseFloat(box.element.l));
			var topDiff = Math.abs(parseFloat(element.t) - parseFloat(box.element.t));
			if ((leftDiff <= withIn) && (topDiff <= (withIn)))
			{
				return true;
			}
		}
		return false;
	},
	//
	// returns new position for pasted items
	// 
	getNewPastePosition: function(element)
	{
		var lpCtr = 0;
		var maxAttempt = 100; // loop safety 100 * 0.5 = 50 cm, default page size is 25
		var displace = this.PASTE_DISPLACEMENT;
		while (this.inSamePosition(element) && lpCtr <= maxAttempt)
		{
			element.t += displace;
			element.l += displace;
			lpCtr++;
		}
		return element;
	},

	resetChildrenCache: function()
	{
		dojo.forEach(this.getChildren(), function(c)
		{
			c.coords = null;
			c.wrapperCoords = null;
		});
	},

	beforeClean: function()
	{

	},

	clean: function()
	{
		this.beforeClean();
		this.deSelectAll();
		if (this.inDragCreateMode)
			this.toggleDragCreateMode();
		if (this.coverNode)
			dojo.destroy(this.coverNode);
		this.coverNode = null;
		if (this.coverNodeEvents)
			dojo.forEach(this.coverNodeEvents, dojo.disconnect);
		this.coverNodeEvents = [];
		dojo.forEach(this.getChildren(), function(widget)
		{
			widget.destroy(true);
		});
		dojo.query(".box-comments", this.slideNode).forEach(dojo.destroy);
		dojo.query(".rowColResizer", this.slideNode).forEach(dojo.destroy);
		dojo.query(".resize-wrapper", this.slideNode).forEach(dojo.destroy);
		this._moveMouseDown = false;
		this._mouseDown = false;
		this._movedBoxes = null;
		clearTimeout(this._widgetTimer);
	},

	destroy: function()
	{
		this.clean();
		if (this.boxContextMenu)
			this.boxContextMenu.destroyRecursive();
		if (this.editorContextMenu)
			this.editorContextMenu.destroyRecursive();
		if (this.boxEditingContextMenu)
			this.boxEditingContextMenu.destroyRecursive();
		if (this.boxEditingTableContextMenu)
			this.boxEditingTableContextMenu.destroyRecursive();
		this.inherited(arguments);
	},

	render: function(slide)
	{
		// var t1 = new Date();
		var s = pe.scene;
		if (s.isViewCompactMode()) {
			this.slide = slide;
			return;
		}
		this.clean();
		if (s.canCacheSlideHTMLDiv && this.slide && this.slideNode) {
			//swtich the current SlideEditor to hidden slides html list div, not destory, to improve the user experice after cahce been disabled.
			var preSlideHtmlDiv = this.getSlideHtmlDiv(this.slide);
			this.slideNode.style.display = "none";
			preSlideHtmlDiv.innerHTML = "";
			preSlideHtmlDiv.appendChild(this.slideNode);
		}
		this.slide = slide;
		this.domNode.scrollLeft = 0;
		this.domNode.scrollTop = 0;
		// if this.slideNode == null it mean it's frist time render
		// if s.canCacheSlideHTMLDiv = false it mean it's frist time render
		if (s.canCacheSlideHTMLDiv && this.slideNode) { 
			var slideHtmlDiv = this.getSlideHtmlDiv(slide);
			if(slideHtmlDiv.firstElementChild) {
				this.mainNode.innerHTML = "";
				this.mainNode.appendChild(slideHtmlDiv.firstElementChild);
				this.mainNode.firstElementChild.style.display = "";
			} else {
				//D55834 First slide sometimes can't load after switch slides when large file just load 5 slides 
				var domHTML = slide.getHTML(null, false, false, false, true);
				if (s.isHTMLViewMode() && DOC_SCENE.snapshotId && DOC_SCENE.snapshotId != "null")
					domHTML = concord.util.uri.addSidToContentImage(domHTML);
				this.mainNode.innerHTML = domHTML;
			}
		} else {
			var domHTML = slide.getHTML(null, false, false, false, true);
			if (s.isHTMLViewMode() && DOC_SCENE.snapshotId && DOC_SCENE.snapshotId != "null")
				domHTML = concord.util.uri.addSidToContentImage(domHTML);
			this.mainNode.innerHTML = domHTML;
		}
		this.slideNode = this.mainNode.children[0];
		this.layoutSlide(true, false);
		pres.utils.textboxUtil.fixBoxDom(this.slideNode);
		this.initEditor();
		if (s.isHTMLViewMode())
			pres.utils.htmlHelper.removeTabIndex(this.mainNode);
		else
			this.initSlideCommentsContainer();
		// var t6 = new Date();
		// console.info("Slide render " + (t6 - t1));
		if (s.lightEditMode || s.isMobileBrowser()) {
			// in mobile browser slide sorter will hide automatically, after user select one slide
			s.hub.toggleSorter(false);
		}
	},
	initSlideCommentsContainer: function()
	{
		pe.scene.hideComments();
		this.displayedCommentIds = [];
		this.commentsContainer = dojo.create("div", {
			className: "box-comments",
			style: {
				'position': 'absolute',
				'left': "100%",
				'marginLeft': "6px",
				'top': 0
			}
		}, this.mainNode);
		if(BidiUtils.isGuiRtl()) {
			dojo.style(this.commentsContainer, 'left','');
			dojo.style(this.commentsContainer, 'marginLeft','');
			dojo.style(this.commentsContainer, 'right','100%');
			dojo.style(this.commentsContainer, 'marginRight','6px');
		}
		this.refreshComments();
	},
	delayLayout: function(firstTime, scale)
	{
		var firstTime = !!firstTime;
		var scale = !!scale;
		var name = "_layoutTimer_" + firstTime + "_" + scale;
		clearTimeout(this[name]);
		this[name] = setTimeout(dojo.hitch(this, function()
		{
			this.layoutSlide(firstTime, scale);
		}), 100);
	},

	layoutSlide: function(firstTime, scale)
	{
		clearTimeout(this._layoutTimer);

		if (!this.slide)
			return;

		this.slideNodeH = 0;
		this.slideNodeW = 0;
		var realResize = false;
		if (!this.boxW || scale)
		{
			var box = {
				w: this.domNode.offsetWidth,
				h: this.domNode.offsetHeight
			};
			realResize = true;
			// console.warn("REAL_RESIZE " + this.scale);
			// real window resized.
			// this.deSelectAll();

			var w0 = this.boxW = box.w;
			var h0 = this.boxH = box.h;

			// this.containerNode.style.width = w0 + "px";
			// this.containerNode.style.height = h0 + "px";

			box.w = box.w - 20;
			box.h = box.h - 20;

			var pageHeight = this.slide.h;
			var pageWidth = this.slide.w;

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

			this.whRatio = slideWidth / slideHeight;

			this.mainBoxW = slideWidth - 2;
			this.mainBoxH = slideHeight - 2;

			if (this.scale)
			{
				var realHeight = pres.utils.helper.cm2pxReal(pe.scene.doc.slides[0].h);
				this.mainBoxH = realHeight * this.scale;
				this.mainBoxW = this.mainBoxH * this.whRatio - 2;
				this.mainBoxH -= 2;
			}

			var remainLeft = (w0 - this.mainBoxW) / 2;
			var remainTop = (h0 - this.mainBoxH) / 2;
			if (remainLeft < 10)
				remainLeft = 10;
			if (remainTop < 10)
				remainTop = 10;

			this.mainBoxRemainLeft = remainLeft;
			this.mainBoxRemainTop = remainTop;
			this.mainBoxFontSize = PresCKUtil.getBasedFontSize(this.mainBoxH, pageHeight);
			this.mainNode.style.width = this.mainBoxW + 'px';
			this.mainNode.style.height = this.mainBoxH + 'px';
			this.mainNode.style.marginLeft = this.mainNode.style.marginRight = this.mainBoxRemainLeft - 1 + "px";
			this.mainNode.style.marginTop = this.mainNode.style.marginBottom = this.mainBoxRemainTop - 1 + "px";
			this.mainNode.style.fontSize = this.mainBoxFontSize + 'px';

			this.scaleRatio = this.mainBoxH / this.slide.h;
			this.layoutComments(this.mainBoxW, this.mainBoxH);
			this._resizeInited = true;
		}

		// Update shape scale when zooming
		if (realResize || firstTime || this._pendingShapeResize)
			pres.utils.shapeUtil.scaleShapeForZoom(this.mainNode.firstChild, this.mainBoxH, false);

		if (this._pendingShapeResize)
		{
			dojo.forEach(this._pendingShapeResize, dojo.hitch(this, function(domId)
			{
				try
				{
					var node = dojo.query("[id='" + domId + "']", this.domNode)[0];
					if (node)
						dojo.removeClass(node, "hideShape");
				}
				catch (ex)
				{
				}
			}));
		}

		this._pendingShapeResize = null;

		if (this.coverNode)
			dojo.marginBox(this.coverNode, dojo.contentBox(this.containerNode));

		if (realResize)
		{
			dojo.forEach(this.getChildren(), function(child)
			{
				// editing will fit its content again.
				if (!pe.scene.isMobileBrowser()) {
					// keep box is editing model in mobile
					if (child.status > 1) {
						child.exitEdit();
					}
				}
				if (child.heightFixed())
					child.fixBoxHeight();
				if (child.hasBorder || child.element.family == "table")
				{
					child.removeResizeable();
					if (child.status >= 1)
						child.showHandles();
				}
			});
		}

		if (!pe.scene.isMobile)
		{
			this.adjustPadding(this.mainBoxRemainLeft, this.mainBoxRemainTop, this.mainBoxW, this.mainBoxH, firstTime);

			// IE hack for scrollbar issue, no idea why.
			if (dojo.isIE)
			{
				this.mainNode.style.height = (this.mainBoxH - 1) + "px";
				setTimeout(dojo.hitch(this, function()
				{
					this.mainNode.style.height = this.mainBoxH + "px";
				}), 0);
			}
		}
	},

	resize: function()
	{
		// var t = new Date();
		this.inherited(arguments);
		this.delayLayout(false, true);
		// console.info("Resize with layout slide " + (new Date() - t))
	},

	layoutComments: function(slideW)
	{
		var size = slideW / 20;
		size = size > 29 ? 29 : size;
		if (!this.commentIconSize || size != this.commentIconSize)
		{
			this.commentIconSize = size;
			pe.scene.hideComments();
			pres.utils.cssHelper.insertCssStyle("img.imgcomment{height:auto !important;width:" + this.commentIconSize + "px !important;}", "comments", true);
		}
	},

	adjustPadding: function(remainLeft, remainTop, w, h, firstTime)
	{
		var maxNegtiveLeft = 0;
		var maxNegtiveTop = 0;

		dojo.forEach(this.slide.elements, dojo.hitch(this, function(ele)
		{
			if (!ele.isNotes)
			{
				var left = (ele.l / this.slide.w) * w;
				var top = (ele.t / this.slide.h) * h;

				if (top < 0)
				{
					maxNegtiveTop = Math.min(top, maxNegtiveTop);
				}
				if (left < 0)
				{
					maxNegtiveLeft = Math.min(left, maxNegtiveLeft);
				}
			}
		}));

		if (this.paddingLeft > 0)
			this.containerNode.style.paddingLeft = "0px";
		if (this.paddingTop > 0)
			this.containerNode.style.paddingTop = "0px";

		var overflowSet = false;

		var paddingLeft = 0;
		var paddingTop = 0;
		if (remainLeft + maxNegtiveLeft < 0)
		{
			paddingLeft = (remainLeft + maxNegtiveLeft) * -1 + 20;
			if (paddingLeft != 0)
			{
				this.domNode.style.overflow = "hidden";
				overflowSet = true;
				this.containerNode.style.paddingLeft = paddingLeft + "px";
			}
		}
		if (remainTop + maxNegtiveTop < 0)
		{
			paddingTop = (remainTop + maxNegtiveTop) * -1 + 20;
			if (paddingTop != 0)
			{
				if (!overflowSet)
				{
					this.domNode.style.overflow = "hidden";
					overflowSet = true;
				}
				this.containerNode.style.paddingTop = paddingTop + "px";
			}
		}

		this.paddingTop = paddingTop;
		this.paddingLeft = paddingLeft;

		if (overflowSet)
			this.domNode.style.overflow = "auto";

		if (firstTime)
		{
			if (paddingLeft > 0 || paddingTop > 0)
			{
				this.domNode.scrollLeft = paddingLeft;
				this.domNode.scrollTop = paddingTop;
			}
			else
			{
				// this.domNode.scrollLeft = 0;
				// this.domNode.scrollTop = 0;
			}
		}
	},

	isWidgitizable: function(element)
	{
		if (!element)
			return false;
		if (dojo.isString(element))
			element = this.slide.find(element);
		if (element && element.family && element.family != "background" && element.family != "header" && element.family != "date-time" && element.family != "page-number" && element.family != "footer" && element.family != "unknown")
			return true;
		else
			return false;
	},

	updateHeaderFooter: function(onlyPageNumber)
	{
		var index = dojo.indexOf(pe.scene.doc.getSlides(), this.slide);
		var hfu = concord.widgets.headerfooter.headerfooterUtil;
		hfu.updatePageNumber(this.mainNode, index + 1);
		if (!onlyPageNumber)
			hfu.updateHeaderFooterDateTimeFields(this.mainNode);
	},

	disableLinks: function()
	{
		var slideTextAnchors = dojo.query('[class = "text_a"]', this.mainNode);
		for ( var j = 0; j < slideTextAnchors.length; j++)
		{
			slideTextAnchors[j].onclick = function()
			{
				return false;
			};
		}
		slideTextAnchors = dojo.query('a', this.mainNode);
		for ( var j = 0; j < slideTextAnchors.length; j++)
		{
			slideTextAnchors[j].onclick = function()
			{
				return false;
			};
		}
	},

	spellCheck: function(dom)
	{
		if (pe.scene.isHTMLViewMode() || pe.scene.isMobile)
			return;
		var sc = pe.scene.spellChecker;
		if (sc.isAutoScaytEnabled()) {
			if (dom) {
				sc.checkNodes(dom, dom, null);
			} else {
				dojo.query('.draw_frame_classes', this.mainNode).forEach(function(d){
					sc.checkNodes(d, d, null);
				});
				dojo.query('.draw_shape_classes', this.mainNode).forEach(function(d){
					sc.checkNodes(d, d, null);
				});
				dojo.query('.smartTable', this.mainNode).forEach(function(d){
					sc.checkNodes(d, d, null);
				});
			}
		}
	},

	initEditor: function()
	{
		var me = this;
		this.mainNode.style.display = "";
		clearTimeout(this._widgetTimer);

		if (pe.scene.isHTMLViewMode() || pe.scene.isMobile)
		{
			pres.utils.placeHolderUtil.i18n(me.mainNode, true);
			return;
		}
		//not init Editor, not allow user do select object & input text action while in partial load.
		if(!pe.scene.isLoadFinished())
			return;
		this._widgetTimer = setTimeout(function()
		{
			var doms = dojo.query('.draw_frame', me.mainNode);
			var boxes = dojo.filter(doms, function(dom)
			{
				var id = dom.id;
				return id && me.isWidgitizable(id);
			});
			me.widgitizeContent(boxes, 0, boxes.length);

			me.disableLinks();
			me.updateHeaderFooter();
			me.spellCheck();
			pres.utils.placeHolderUtil.i18n(me.mainNode);
		}, pe.scene.isMobile || dojo.isIE ? 500 : 100);

		if (pe.scene.isMobile)
		{
			// changeSlide will notify native app the location of each box.
			setTimeout(function()
			{
				concord.util.mobileUtil.changeSlide(me.slide.id, false);
			}, 0);
		}
	},

	widgitizeContent: function(boxes, from, len)
	{
		// console.info("widget from " + from + " : " + len)
		// widgetize content 20 each time.

		var batchSize = 1000;
		var hasNext = from + batchSize < len;
		for ( var i = from; i < Math.min(len, from + batchSize); i++)
		{
			var dom = boxes[i];
			var box = new pres.editor.Box({}, dom);
			// if (pe.scene.isMobile)
			// concord.util.mobileUtil.presObject.processMessage(box.id, MSGUTIL.actType.insertElement);
		}
		var me = this;
		if (hasNext)
		{
			dojo.publish("/mask/show", []);
			this._widgetTimer = setTimeout(function()
			{
				me.widgitizeContent(boxes, from + batchSize, len);
			}, 100);
		}
		else
		{
			dojo.publish("/mask/hide", []);
			// console.info("Widget time: " + (new Date() - window.wctime));

			// notify it again when all box inited.
			pe.scene.isMobile && concord.util.mobileUtil.changeSlide(this.slide.id, false);
		}

	},

	// below is all for mobile.

	deSelectAll: function()
	{
		dojo.forEach(this.getChildren(), function(b)
		{
			if (b.status > 0)
			{
				b.exitEdit();
				b.exitSelection();
			}
		});
	},

	getSlideInfo: function()
	{
		var info = dojo.coords(this.mainNode);
		var mt = dojo.style(this.mainNode, "marginTop");
		var ml = dojo.style(this.mainNode, "marginLeft");

		info.t = info.y;
		info.l = info.x;
		var cbArray = this.getChildren();
		var contentBoxs = [];
		for ( var i = 0; i < cbArray.length; i++)
		{
			// if(!cbArray[i].mainNode)
			// continue;
			// TODO, BOB, type
			var type = 1;
			if (!type)
				continue;
			var contentBox = dojo.coords(cbArray[i].domNode);

			// contentBox['t'] = cbArray[i].domNode.offsetTop;
			// contentBox['l'] = cbArray[i].domNode.offsetLeft ;
			// contentBox['w'] = cbArray[i].domNode.offsetWidth ;
			// contentBox['h'] = cbArray[i].domNode.offsetHeight ;

			// console.info(contentBox)

			contentBox['z'] = dojo.style(cbArray[i].domNode, 'zIndex');
			contentBox['id'] = cbArray[i].domNode.id;
			contentBox['boxtype'] = type;
			/*
			 * if(cbArray[i].commentsId) contentBox['commentsId'] = cbArray[i].commentsId; if(this.selectedCommentsId && cbArray[i].commentsId.indexOf(this.selectedCommentsId) >= 0) contentBox['needSelect'] = this.selectedCommentsId; if(cbArray[i].isBoxLocked && cbArray[i].isBoxLocked()) contentBox['lock'] = 1;
			 */
			contentBoxs.push(contentBox);
		}
		info['contentBoxs'] = contentBoxs;
		return info;
	},

	showWarningMsgForRotatedObject: function()
	{
		this.cleanShowtime && clearTimeout(this.cleanShowtime);
		var msgStr = this.nls.warningforRotatedShape;
		window.pe.scene.showWarningMessage(msgStr);
		this.cleanShowtime = setTimeout(dojo.hitch(this, function()
		{
			window.pe.scene.hideErrorMessage();
			this.cleanShowtime = null;
		}), 2000);
	},

	announce: function(message)
	{
		if (!this.screenReaderNode1)
		{
			this.screenReaderNode1 = dojo.create('div', null, document.body);
			this.screenReaderNode1.style.zIndex = -20000;
			this.screenReaderNode1.style.position = "relative";
			this.screenReaderNode1.style.top = "-10000px";
			this.screenReaderNode1.style.overflow = "hidden";
			this.screenReaderNode1.style.width = "1px";
			this.screenReaderNode1.style.height = "1px";
			dijit.setWaiRole(this.screenReaderNode1, 'region');
			dijit.setWaiState(this.screenReaderNode1, 'live', 'assertive');
			dijit.setWaiState(this.screenReaderNode1, 'label', 'live region');

			this.screenReaderNode2 = dojo.create('div', null, document.body);
			this.screenReaderNode2.style.zIndex = -20000;
			this.screenReaderNode2.style.position = "relative";
			this.screenReaderNode2.style.top = "-10000px";
			this.screenReaderNode2.style.overflow = "hidden";
			this.screenReaderNode2.style.width = "1px";
			this.screenReaderNode2.style.height = "1px";
			dijit.setWaiRole(this.screenReaderNode2, 'region');
			dijit.setWaiState(this.screenReaderNode2, 'live', 'assertive');
			dijit.setWaiState(this.screenReaderNode2, 'label', 'live region 2');

			this.screenReaderNode = this.screenReaderNode1;
		}
		// use two nodes and clean one and use another to fix the issue if two more char are same, and navigator them with key arrowleft/arrowright
		this.screenReaderNode.innerHTML = " ";
		dijit.removeWaiState(this.screenReaderNode, 'live');
		if (this.screenReaderNode == this.screenReaderNode1)
		{
			this.screenReaderNode = this.screenReaderNode2;
		}
		else
		{
			this.screenReaderNode = this.screenReaderNode1;
		}
		dijit.setWaiState(this.screenReaderNode, 'live', 'assertive');
		this.screenReaderNode.innerHTML = message;
		//console.log("annoucne--" + message);
	},
	readLine: function()
	{
		var contentBoxInEditMode = pe.scene.editor.getEditingBox();
		if (contentBoxInEditMode)
		{
			var mSelection = contentBoxInEditMode.editor.mContentModel.getSelection();
			if (mSelection && mSelection.bCollapsed && mSelection.start)
			{
				var index = mSelection.start.lineIndex;
				var mTxtcell = null;
				if (mSelection.cells)
				{// table
					mTxtcell = contentBoxInEditMode.editor.mContentModel.mSelectTxtCells[0];
				}
				else
				{// textbox
					mTxtcell = contentBoxInEditMode.editor.mContentModel.mTxtCells[0];
				}
				if (mTxtcell)
				{
					var paragraph = mTxtcell.paragraphs[index];
					var strContent = paragraph.strContent;
					this.announce(strContent);
				}
			}
		}
	},
	readIndicator: function()
	{
		var contentBoxInEditMode = pe.scene.editor.getEditingBox();
		if (contentBoxInEditMode)
		{
			var mSelection = contentBoxInEditMode.editor.mContentModel.getSelection();
			if (mSelection && mSelection.bCollapsed && mSelection.start)
			{
				var range = contentBoxInEditMode.editor.mSelection.getRange();
				var startContainer = range.startContainer;
				var fspan = EditorUtil.getAscendant(startContainer, 'span');
				var userid = fspan.getAttribute('typeid').replace('CSS_', '');
				var userName = pe.scene.getEditorStore().getEditorById(userid).getName();
				msg = fspan.textContent + ' Edit by ' + userName;
				this.announce(msg);
			}
		}
	},
	
	linkDiv: null,
	linkPanel: null,
	linkPanelShow: false,

	refreshLinkMenuItems: function(menu)
	{
		var c = pres.constants;
		dojo.forEach(menu.getChildren(), function(c)
		{
			if (c.forLink)
			{
				menu.removeChild(c);
				c.destroyRecursive();
			}
		});

		menu.addChild(new dijit.MenuSeparator(
		{
			forLink: true
		}));

		var box = this.getEditingBox();
		if (box)
		{
			hasLink = box.editor.getCurHyperLink();
		}

		if (hasLink)
		{
			if(hasLink.indexOf(EditorUtil.STR_XLINK) != 0)
			{
				var m = new dijit.MenuItem(
				{
					label: this.presnls.open_link,
					forLink: true,
					cmd: c.CMD_LINK_OPEN,
					onClick: function()
					{
						dojo.publish("/command/exec", [this.cmd,hasLink]);
					},
					dir: BidiUtils.isGuiRtl() ? 'rtl' : ''
				});
		
				menu.addChild(m);
			}

			var m = new dijit.MenuItem(
			{
				label: this.presnls.edit_link,
				forLink: true,
				cmd: c.CMD_LINK_ADD,
				onClick: function()
				{
					dojo.publish("/command/exec", [this.cmd]);
				},
				dir: BidiUtils.isGuiRtl() ? 'rtl' : ''
			});

			menu.addChild(m);
			var m = new dijit.MenuItem(
			{
				label: this.presnls.remove_link,
				forLink: true,
				cmd: c.CMD_LINK_REMOVE,
				onClick: function()
				{
					dojo.publish("/command/exec", [this.cmd]);
				},
				dir: BidiUtils.isGuiRtl() ? 'rtl' : ''
			});

			menu.addChild(m);
		}
		else
		{
			var m = new dijit.MenuItem(
			{
				label: this.presnls.add_link,
				forLink: true,
				cmd: c.CMD_LINK_ADD,
				onClick: function()
				{
					dojo.publish("/command/exec", [this.cmd]);
				},
				dir: BidiUtils.isGuiRtl() ? 'rtl' : ''
			});

			menu.addChild(m);
		}
	},
	
	closeLink: function()
	{
		var linkPanel = pe.scene.presApp.linkPanel;
		if (!linkPanel)
			return;
		linkPanel.close();
	},

	createLink: function(noFocus)
	{
		var box = this.getEditingBox();
		if (!box)
			return;
		box.editor.pauseSpellCheck();
		var href = box.editor.getCurHyperLink() || "";
		var pos = dojo.coords(box.domNode);
		pos.y += pos.h/ 2;
		pos.x += pos.w/ 2;
		var height = 150;
		var aroundNode = null;
		try{
			var focusTxtCell =  box.editor.mContentModel.getFocusTxtCell();
			if (focusTxtCell)
			{
				var span = focusTxtCell.getCurEditingSpanModel();
				if (span)
				{
					if(span.id)
					{
						aroundNode = dojo.query("[id='"+span.id+"']", this.domNode)[0];
					}
					
					if(!aroundNode && span.hyperLinkId)
					{
						var mapNode = focusTxtCell._hyperlinkStoreMap[span.hyperLinkId];
						if(mapNode)
							aroundNode = dojo.query("[id='"+mapNode.id+"']", this.domNode)[0];
					}

					if (!aroundNode)
					{
						var para = focusTxtCell.paragraphs[focusTxtCell.selection.start.lineIndex];
						if (para && para.id)
						{
							aroundNode = dojo.query("[id='"+para.id+"']", this.domNode)[0];
						}
					}
				}
			} else {
				var sel = box.editor.mContentModel.getSelection();
				if(sel && sel.cells && sel.cells[0]) {
					aroundNode = dojo.query("[id='"+sel.cells[0].id+"']", this.domNode)[0];
				}
			}
		}catch(e){}
		
		var me = this;
		
		var linkPanel = pe.scene.presApp.linkPanel;
		if (!linkPanel)
			return;
		
		linkPanel.close = function(){
			if (box)
				box.editor.resumeSpellCheck();
			this.onClose();
			this.closeDropDowns();
			this.domNode.style.display = "none";
			pe.scene.slideEditor.linkPanelShow = false;
			pe.scene.presApp.restoreIFrame();
			setTimeout(function(){
				if (!box)
					return;
				box.focus();
				if (box.editor && box.status == 2)
					box.editor.renderSelection();
			}, 0);
		};
		linkPanel.onRemove = function(){
			if(box.editor.insertHyperLink(null))
				box.notifyUpdate();

			this.close();
		};
		linkPanel.onDone = function(data)
		{
			if(this.domNode.style.display != "none" && data && data.type != "unknown")
			{
				var box = me.getEditingBox();
				if (!box)
					return;
				
				var hlinkString = "";
				if(data.type == "email")
				{
					data.subject = data.subject.replace(/ /g,"%20");
					hlinkString = "mailto:" + data.link + "?subject=" + data.subject;
				}
				else if(data.type == "slide")
				{
					hlinkString = EditorUtil.STR_XLINK + data.link;
				}
				else //website
				{
					hlinkString = data.link;
					var index = hlinkString.indexOf("://");
					if(index<0)
						hlinkString = "http://" + hlinkString;	
				}
				if(box.editor.insertHyperLink(hlinkString,data.text))
					box.notifyUpdate();		
					
			}
			//console.info(data.type + " " + data.link + " " + data.subject + " " + data.text);
			this.close();
		};
		
		
		var bHasHyperlink = false;
		var needInserText = false;
		var selection = box.editor.getSelectInfo();
		if(selection && selection.txtSelInfo && selection.txtSelInfo.bCollapsed)
		{
			needInserText = true;
		}
		if(href && href.length)
		{
			//if(selection && selection.txtSelInfo && selection.txtSelInfo.bCollapsed)
			bHasHyperlink = true;
			needInserText = false;
		}

		//this.linkPanel.startup();
		linkPanel.initData(href,bHasHyperlink,needInserText);
		linkPanel.domNode.style.display = "";
		
		this.linkPanelShow = true;
		
		pe.scene.presApp.enlargeIFrame();

		if (aroundNode)
		{
			var div = dojo.create("div", {}, dojo.body());
			div.style.position = "absolute";
			dojo.style(div, "height", linkPanel.domNode.offsetHeight + "px");
			dojo.style(div, "width", linkPanel.domNode.offsetWidth + "px");
			
			dijit.placeOnScreenAroundNode(div, aroundNode, ["below", "above"]);
			var top = dojo.style(div, "top");
			var left = dojo.style(div, "left");
			
			var bannerTop = 0;
			var banner = dojo.byId("banner");
			if (banner)
				bannerTop = banner.offsetHeight;
			
			linkPanel.domNode.style.top = (top - bannerTop) + "px";
			linkPanel.domNode.style.left = left + "px";
			
			dojo.destroy(div);
		}
		else
		{
			linkPanel.domNode.style.top = pos.y + "px";
			linkPanel.domNode.style.left = pos.x + "px";
		}
		
		setTimeout(dojo.hitch(this, function(){
			linkPanel.domNode.style.display = "";
			if (!noFocus)
			{
				linkPanel.focus();
				if (!dojo.isIE)
				{
					var box = this.getEditingBox();
					if (box && box.editor)
						box.editor.renderSelection();
				}
			}
		}), 100);
	},
	
	removeLink: function()
	{
		var box = this.getEditingBox();
		if (!box)
			return;
		if(box.editor.insertHyperLink(null))
			box.notifyUpdate();
	},

	callbackForLineSpacing:function(returnInputText)
	{
		var c = pres.constants;
		if (returnInputText != undefined || returnInputText != "" || returnInputText != null)
			dojo.publish("/command/exec",[c.CMD_LINESPACING, returnInputText]);
	},
	
	inputSpaceValue : function(defaultValue)
	{
		var dlg = new pres.widget.LineSpaceInputBox(null, null, null, true, {callback:this.callbackForLineSpacing, defvalue:defaultValue});
		dlg.show();
	},

	getZoomScale : function() 
	{
		if (this.scale > 0)
			return this.scale*100;
		else {
			var realHeight = pres.utils.helper.cm2pxReal(pe.scene.doc.slides[0].h);
			var scale = this.mainBoxH / realHeight;
			return Math.round(scale * 100);
		}
	},

    setStyleCursor: function()
    {
        //change cursor
    	if(this.domNode)
        {
    		this.domNode.style.cursor = "url('" + window.contextPath + window.staticRootPath + "/images/painter32.cur'),auto";    	
        }
    },
    _unsetStyleCursor: function()
    {
        //change cursor back to auto
    	if(this.domNode)
        {
    		this.domNode.style.cursor = "auto";  	
        }
    },
    cleanFormatPainter: function()
    {
    	this._unsetStyleCursor();
		pe.scene.hub.formatpainterStyles = null;
		pe.scene.hub.toolbarModel.setChecked('formatpainter', false);
		var currentBox = pe.scene.editor.getEditingBox();
		if (currentBox)
		{
			pe.scene.hub.toolbarModel.setEnabled('formatpainter', true);
			currentBox.mainNode.style.cursor = "text";
		} else {
			pe.scene.hub.toolbarModel.setEnabled('formatpainter', false);
		}
    }
});
