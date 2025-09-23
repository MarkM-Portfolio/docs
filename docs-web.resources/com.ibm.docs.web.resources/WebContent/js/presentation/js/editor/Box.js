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

dojo.provide("pres.editor.Box");
dojo.require("dijit._Widget");
dojo.require("dijit._Contained");
dojo.require("pres.editor.BoxPosMixin");
dojo.require("pres.editor.BoxKeyDown");
dojo.require("pres.editor.BoxKeyUp");
dojo.require("pres.editor.BoxKeyPress");
dojo.require("pres.editor.BoxKeyComposition");
dojo.require("pres.editor.BoxMouseDown");
dojo.require("pres.editor.BoxMouseUp");
dojo.require("pres.editor.BoxMouseMove");
dojo.require("pres.editor.BoxClick");
dojo.require("pres.editor.BoxEditor");
dojo.require("pres.editor.BoxLock");
dojo.require("pres.editor.BoxComment");
dojo.require("pres.editor.BoxSpellCheck");
dojo.require("pres.editor.EditorUtil");
dojo.require("pres.widget.LockerTooltip");
dojo.require("pres.utils.tableResizeUtil");

dojo.requireLocalization("concord.widgets", "contentBox");

dojo.declare("pres.editor.Box", [dijit._Widget, dijit._Contained, pres.editor.BoxPosMixin, pres.editor.BoxLock, pres.editor.BoxComment, pres.editor.BoxSpellCheck, pres.editor.BoxClick, pres.editor.BoxKeyDown, pres.editor.BoxKeyUp, pres.editor.BoxKeyPress, pres.editor.BoxKeyComposition, pres.editor.BoxMouseDown, pres.editor.BoxMouseUp, pres.editor.BoxMouseMove],
{

	STATUS_IDLE: 0,
	STATUS_SELECTED: 1,
	STATUS_EDITING: 2,

	status: 0,
	moveable: null,
	mouseDownTime: 0,

	element: null,
	tempStatus:
	{},
	editor: new pres.editor.BoxEditor(),

	getContent: function()
	{
		if (!pe.scene.tmpEditDiv)
			pe.scene.tmpEditDiv = dojo.create("div",
			{
				"style":
				{
					"display": "none"
				}
			}, document.body);
		var div = pe.scene.tmpEditDiv;
		div.innerHTML = "";
		var dom = this.domNode.cloneNode(true);
		div.appendChild(dom);

		dojo.removeClass(dom, "boxSelected");
		dojo.removeAttr(dom, "hfixed");
		var node = this.getTextNode(dom);
		var nodeh;
		var realh;
		if (node && this.element.family != "notes")
		{
			node = node.parentNode;
			realh = dojo.attr(node, "realh");
			if (!realh)
				realh = "100%";
			node.style.height = realh;
			dojo.removeAttr(node, "realh");
		}

		if (pe.scene.spellChecker)
			pe.scene.spellChecker.resetOneNode(dom, true);

		var resizer = dojo.query(".resize-wrapper", dom)[0];
		if (resizer)
			dojo.destroy(resizer);

		var comments = dojo.query(".box-comments", dom);
		dojo.forEach(comments, function(c)
		{
			dojo.destroy(c);
		});

		var html = dom.innerHTML;
		html = html.replace(/contenteditable\s*=\s*["']true["']/gi, "");
		div.innerHTML = "";
		return html;
	},

	getSubContent: function()
	{
		var editNode = this.getEditNode();
		if (editNode)
		{
			var parentNode = editNode.parentNode.parentNode.parentNode;
			if (!pe.scene.tmpEditDiv)
				pe.scene.tmpEditDiv = dojo.create("div",
				{
					"style":
					{
						"display": "none"
					}
				}, document.body);
			var div = pe.scene.tmpEditDiv;
			div.innerHTML = "";
			var dom = parentNode.cloneNode(true);
			div.appendChild(dom);

			if (pe.scene.spellChecker)
				pe.scene.spellChecker.resetOneNode(dom, true);

			var html = dom.innerHTML;
			html = html.replace(/contenteditable\s*=\s*["']true["']/gi, "");

			return html;
		}
	},

	postCreate: function()
	{
		this.inherited(arguments);
		this.boxUID = this.widgetId;
		this.STRINGS = dojo.i18n.getLocalization("concord.widgets", "contentBox");
		var slide = this.getParent().slide;
		this.element = slide.find(this.id);
		this.mainNode = this.domNode;
		this.contentBoxDataNode = this.mainNode.firstElementChild;
		var userId = pe.scene.locker.getLockedOtherUsers(this.element.id, false, true);
		if (userId)
		{
			this.showLock(pe.scene.getEditorStore().getEditorById(userId));
		}
		this.refreshComments();
		this.mainNode.tabIndex = -1;

		// this.subscribe("/box/enter/selection", this.onBoxSelected);
		// this.subscribe("/box/enter/edit", this.onBoxEditing);
		this.connectEvents();
	},

	connectEvents: function()
	{


		// this.connect(this.domNode, "onkeypress", "onKeyPress");
		// this.connect(this.domNode, "onkeyup", "onKeyUp");
		// this.connect(this.domNode, "onkeydown", "onKeyDown");


		if (dojo.isIE && this.element.family == "table")
		{
			// IE table 8 native resize handler issue
			// dojo's event connection does not work;
			this.domNode.oncontrolselect = function(e)
			{
				return false;
			}
			this.domNode.onresizestart = function(e)
			{
				return false;
			}
		}

		this.connect(this.domNode, "onclick", "onClick");
		this.connect(this.domNode, "ondragstart", function(e)
		{
			dojo.stopEvent(e);
		});

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
			}
		}
	},

	recordStatus: function()
	{
		this.tempStatus[this.id] = this.status;
	},

	restoreStatus: function()
	{
		var status = this.tempStatus[this.id];
		if (!status)
			status = this.status;
		if (this.status != status)
		{
			this.status = status;
			if (this.status == 1)
			{
				this.enterSelection();
			}
			else if (this.status == 2)
			{
				this.enterSelection();
				this.enterEdit();
				this.editor.updateSelection();
			}
		}
		delete this.tempStatus[this.id];
	},

	dispatch: function()
	{
		var event = arguments[0];
		var obj = arguments[1];
		if (event == "/lock/element/add")
		{
			this.addLockIcon(obj, arguments[2]);
		}
		if (event == "/lock/element/remove")
		{
			this.removeLockIcon(obj, arguments[2]);
		}
	},

	/*
	 * onBoxSelected: function(box) { if (box != this && box.element.isNotes) this.exitSelection(); },
	 *
	 * onBoxEditing: function(box) { if (box != this && box.element.isNotes) this.exitSelection(); },
	 */

	onElementStyleChanged: function(element, eventSource)
	{
		if (element == this.element)
		{
			var eleDom = this.domNode;
			if (eleDom)
			{
				var styleText = element.attr("style") + ";" + element.getPositionStyle();
				eleDom.setAttribute("style", styleText);
			}
			if (this.status >= this.STATUS_SELECTED)
			{
				this.showHandles();
				this.fixBoxHeight();
			}
			if (this.status == this.STATUS_EDITING)
			{
				this.attachEditStyle();
			}
			this.refreshComments();
		}
	},

	onElementAttrChanged: function(element, eventSource)
	{
		if (element == this.element)
		{
			if (eventSource && eventSource.msg)
			{
				var eleDom = this.domNode;
				if (eleDom)
				{
					var attrsMap = element.getAttrsMap();
					dojo.forEach(eleDom.attributes, function(attr)
					{
						if (attr && attr.nodeName != "widgetId" && attr.nodeName != "widgetid")
						{
							eleDom.removeAttribute(attr.nodeName);
						}
					});
					for (var x in attrsMap)
					{
						var value = attrsMap[x];
						if (x == "style")
						{
							value = attrsMap[x] + ";" + element.getPositionStyle();
						}
						eleDom.setAttribute(x, value);
					}
				}
				if (this.status >= this.STATUS_SELECTED)
				{
					this.showHandles();
					this.fixBoxHeight();
				}
				if (this.status == this.STATUS_EDITING)
				{
					this.enterEdit();
				}
			}
			this.refreshComments();
		}

	},

	onShapeFillChanged: function(element, eventSource, bgOrbd)
	{
		if (element == this.element)
		{
			var eleDom = this.domNode;
			if (eleDom)
			{
				// custom shape
				pres.utils.shapeUtil.updateViewFill(element, eleDom, false, bgOrbd);
			}
		}
	},
	
	onShapeLineTypeChanged: function(element, eventSource, lineStyleName)
	{
		if (element == this.element)
		{
			var eleDom = this.domNode;
			if (eleDom)
			{
				pres.utils.shapeUtil.updateLineTypeView(element, eleDom, false, lineStyleName);
			}
		}
	},

	onShapeOpacityChanged: function(element, eventSource, opacity)
	{
		if (element == this.element)
		{
			var eleDom = this.domNode;
			if (eleDom)
			{
				pres.utils.shapeUtil.updateViewFill(element, eleDom, false, opacity);
			}
		}
	},
	
	onShapeSizeChanged: function(element, eventSource)
	{
		if (element == this.element)
		{
			var eleDom = this.domNode;
			if (eleDom)
			{
				// custom shape
				pres.utils.shapeUtil.updateViewSize(element, eleDom);
			}
		}
	},

	onShapePosChanged: function(element, eventSource)
	{
		if (element == this.element)
		{
			var eleDom = this.domNode;
			if (eleDom)
			{
				pres.utils.shapeUtil.updateModelPos(element, eleDom);
			}
		}
	},

	exitSelection: function(toDestroy)
	{
		if (this.status > 0)
		{
			pe.scene.hideComments();
			this.refreshComments();
			dojo.publish("/box/exit/selection", [this]);
			this.exitEdit(toDestroy);
			if (!this._destroyed)
				this.hideHandles();
			if (this.element.family == "table")
			{
				var tru = pres.utils.tableResizeUtil;
				tru.detachResizer();
				tru.resetResizer();
			}
			this.status = this.STATUS_IDLE;
		}
	},

	enterPreSelection: function()
	{
		// in drag mode.
		var userId = pe.scene.locker.getLockedOtherUsers(this.element.id, false, true);
		if (userId)
		{
			return;
		}
		this.showHandles();
		this.fixBoxHeight();
		dojo.addClass(this.domNode, "boxPreSelected");
	},

	enterSelection: function()
	{
		var presStrs = pe.presStrs;
		var userId = pe.scene.locker.getLockedOtherUsers(this.element.id, false, true);
		if (userId)
		{
			return;
		}
		this.showHandles();
		this.fixBoxHeight();
		if (this.status != this.STATUS_SELECTED)
		{
			this.status = this.STATUS_SELECTED;
			dojo.publish("/box/enter/selection", [this]);
		}
		var readText = this.getBoxAnnouce() + presStrs.acc_enterEdit;
		pe.scene.slideEditor && pe.scene.slideEditor.announce(readText);
	},

	getBoxAnnouce: function()
	{
		var presStrs = pe.presStrs;
		var boxtype = this.getBoxContentType();
		var readText = "";
		var currentdeg = "";
		if (this.isEnableRotate())
		{
			var t = pres.utils.htmlHelper.extractStyle(this.element.attrs.style)["transform"] || "";
			var degResult = /rotate\((-?[\d\.]+)deg\)/.exec(t);
			if (degResult)
			{
				currentdeg = parseFloat(degResult[1]);
				currentdeg = dojo.string.substitute(presStrs.acc_rotated, [currentdeg]);
			}
		}
		switch (boxtype)
		{
			case "title":
				readText = presStrs.acc_titleSelected + (currentdeg ? currentdeg : "");
				break;
			case "subtitle":
				readText = presStrs.acc_subtitleSelected + (currentdeg ? currentdeg : "");
				break;
			case "outline":
				readText = presStrs.acc_outlineSelected + (currentdeg ? currentdeg : "");
				break;
			case "notes":
				readText = presStrs.acc_notesSelected;
				break;
			case "shape":
				readText = this.element.svg.title + presStrs.acc_selected + (currentdeg ? currentdeg : "");
				break;
			case "table":
				readText = presStrs.acc_tableSelected;
				break;
			case "textbox":
				readText = presStrs.acc_textboxSelected + (currentdeg ? currentdeg : "");
				break;
			case "image":
				readText = presStrs.acc_imageSelected + (currentdeg ? currentdeg : "");
				break;
			case "line":
				readText = this.element.svg.title + presStrs.acc_selected;
				break;
		}

		return readText;
	},

	getBoxContentType: function()
	{
		var btype = "textbox";
		var presentation_class = this.element.attrs.presentation_class;
		if (presentation_class == "title")
			btype = "title";
		else if (presentation_class == "subtitle")
			btype = "subtitle";
		else if (presentation_class == "outline")
			btype = "outline";
		else if (presentation_class == "notes")
			btype = "notes";
		else if (presentation_class == "graphic")
			btype = "image";
		else if (presentation_class == "table")
			btype = "table";
		else if (presentation_class == "group")
		{
			if (pres.utils.shapeUtil.isShape(this.element))
			{
				if (pres.utils.shapeUtil.isConnectorShape(this.element))
					btype = "line";
				else
					btype = "shape";
			}
			else
			{
				btype = "image";
			}
		}
		return btype;
	},

	isEditing: function()
	{
		return (this.status == this.STATUS_EDITING);
	},

	disableRotate: function()
	{
		var style = this.element.attr("style");
		if (style.indexOf("transform") >= 0)
		{
			this.domNode.style.transform = "";
			this.domNode.style.mozTransform = "";
			this.domNode.style.webkitTransform = "";
			this.domNode.style.msTransform = "";
		}
	},

	restoreRotate: function()
	{
		var style = this.element.attr("style");
		if (style.indexOf("transform") >= 0)
		{
			var styles = pres.utils.htmlHelper.extractStyle(style);
			if (styles["transform"])
				this.domNode.style.transform = styles["transform"];
			if (styles["-moz-transform"])
				this.domNode.style.mozTransform = styles["-moz-transform"];
			if (styles["-webkit-transform"])
				this.domNode.style.webkitTransform = styles["-webkit-transform"];
			if (styles["-ms-transform"])
				this.domNode.style.msTransform = styles["-ms-transform"];
		}
	},

	attachEditStyle: function()
	{
		var maxZ = this.element.parent.getMaxZ();
		if (this.element.z <= maxZ)
		{
			this.domNode.style.zIndex = maxZ + 1;
		}
	},

	detachEditStyle: function()
	{
		this.domNode.style.zIndex = this.element.z;
	},

	getEditNode: function(rootNode)
	{
		var node = null;
		var root = rootNode ? rootNode : this.domNode;
		try
		{
			var family = this.element.family;
			if (family == "table")
			{
				node = root;
				if ((dojo.isWebKit || dojo.isFF))
					node = dojo.query("table", root)[0];
			}
			else if (family == "text" || family == "notes" || family == "group")
				node = this.getTextNode(root);
		}
		catch (e)
		{}
		return node;
	},
	onCopyPasteIssueCasesEditingCopyCut: function(e)
	{
		if ((dojo.isMac && dojo.isFF == 30))
		{
			var c = pres.constants;
			if (e.type == "cut")
				dojo.publish("/command/exec", [c.CMD_CUT, e]);
			else
				dojo.publish("/command/exec", [c.CMD_COPY, e]);
		}
		e.preventDefault();
		var pasteBin = pe.scene.hub.focusMgr.getPasteBin();
		var setStatus = e.clipboardData.setData('text/html', pasteBin.innerHTML);
		console.log("==BOX:onCopyPasteIssueCasesEditingCopyCut:set content to clipboardData==S3:" + setStatus);
	},
	onCopyPasteIssueCasesEditingBeforeCopy: function(e)
	{
		var c = pres.constants;
		dojo.publish("/command/exec", [c.CMD_COPY, e]);
	},
	onCopyPasteIssueCasesEditingBeforeCut: function(e)
	{
		var c = pres.constants;
		dojo.publish("/command/exec", [c.CMD_CUT, e]);
	},
	onCopyPasteIssueCasesEditingPaste: function(e)
	{
		console.log("==BOX:onCopyPasteIssueCasesEditingPaste==Safari==S_1");
		e.preventDefault();
		if (e.clipboardData)
		{
			var pasteText = e.clipboardData.getData("text/plain");
			var pasteHtml = e.clipboardData.getData("text/html") || pasteText;
			var c = pres.constants;
			setTimeout(dojo.hitch(this, function()
			{
				delete pe.copyPasteIssueCases;
				delete pe.inCopyPasteAction;
				var pasteBin = pe.scene.hub.focusMgr.getPasteBin();
				pasteBin.innerHTML = pasteHtml;
				dojo.publish("/command/exec", [c.CMD_PASTE, e, pasteText, pasteHtml, pasteBin]);
				pasteBin.innerHTML = "";
				console.log("==BOX:onCopyPasteIssueCasesEditingPaste:setTimeOut==Safari==S_End");
				this.editor.renderSelection();
			}, 0));
		}
	},
	regCopyPasteIssueCasesEvents: function()
	{
		var editNode = this.getEditNode();
		if (this.copyPasteIssueCasesArray)
			dojo.forEach(this.copyPasteIssueCasesArray, dojo.disconnect);
		this.copyPasteIssueCasesArray = [];
		this.copyPasteIssueCasesArray.push(dojo.connect(editNode, "onbeforecopy", dojo.hitch(this, "onCopyPasteIssueCasesEditingBeforeCopy")));
		this.copyPasteIssueCasesArray.push(dojo.connect(editNode, "onbeforecut", dojo.hitch(this, "onCopyPasteIssueCasesEditingBeforeCut")));
		this.copyPasteIssueCasesArray.push(dojo.connect(editNode, "oncopy", dojo.hitch(this, "onCopyPasteIssueCasesEditingCopyCut")));
		this.copyPasteIssueCasesArray.push(dojo.connect(editNode, "oncut", dojo.hitch(this, "onCopyPasteIssueCasesEditingCopyCut")));
		this.copyPasteIssueCasesArray.push(dojo.connect(editNode, "onpaste", dojo.hitch(this, "onCopyPasteIssueCasesEditingPaste")));
	},

	beforeEnterEdit: function()
	{
		// stub for event connection
	},

	_setContentEditable: function(bEdit)
	{
		var editNode = this.getEditNode();
		if (editNode == null)
		{
			return;
		}
		editNode.setAttribute("contentEditable", (bEdit ? "true" : "false"));
	},

	enterEdit: function(range,bNewCreated)
	{
		var userId = pe.scene.locker.getLockedOtherUsers(this.element.id, false, true);
		if (userId)
		{
			return;
		}

		this.beforeEnterEdit();

		var editNode = this.getEditNode();
		if (editNode == null)
		{
			this.enterSelection();
			return;
		}

		this.status = this.STATUS_EDITING;
		pe.scene.editingBox = this;
		pe.IMEWorking = false;

		this.attachEditStyle();
		this.showHandles();
		this.fixBoxHeight();

		this.getParent().toggleSelection(true);
		editNode.setAttribute("contentEditable", "false");
		editNode.setAttribute("contentEditable", "true");
		this.regCopyPasteIssueCasesEvents();
		try
		{
			document.execCommand("enableObjectResizing", false, "false");
			document.execCommand("enableInlineTableEditing", false, "false");
		}
		catch (e)
		{}

		this.domNode.style.cursor = "text";
		if (pe.scene.spellChecker)
			pe.scene.spellChecker.resetOneNode(this.domNode, true);

		this.editor._isModified = false;
		this.editor.clearInvalidTextNode(editNode);
		this.editor.fixInvaildWhiteSpace(editNode);
		this.editor.processEnterEmptyPlaceHolder(editNode);
		this.editor.buildModel(this,bNewCreated);
		var selectionUpdated = false;

		dojo.publish("/box/enter/edit", [this]);
		
		if (range)
			selectionUpdated = this.editor.updateSelection(range);
		if (!selectionUpdated)
			this.editor.moveCursorToEditStart();
		
		if (!pe.scene.locker.isLockedByOther(this.element.id))
			this.lock();

		if (dojo.isFF && document.activeElement)
			document.activeElement.blur();
		this.focus();
		this.editor.renderSelection();
		this.editor.doSpellCheck(true);
		this.editor.updateSelection();
		if (!dojo.isWebKit || this.element.isNotes)
		{
			this.waitingFocus = true;
			setTimeout(dojo.hitch(this, function()
			{
				if (this.status == this.STATUS_EDITING)
				{
					this.focus();
					this.editor.renderSelection();
					try {
						if (dojo.isIE < 10 && this.editor.mContentModel.mTxtCells.length > 1) {
							this.editor.mContentModel.boxOwner.commentsContainer.style.display = "none";
						}
					} catch (e){}
				}
				this.waitingFocus = false;
				if (this._pendingContextMenu && this._pendingContextMenuEvent)
					this.popupContextMenu(this._pendingContextMenuEvent, true);
				this._pendingContextMenu = false;
			}), 100);
		}
		var presStrs = pe.presStrs;
		var readText = this.getBoxContentType() + " " + presStrs.ACC_EditorMode;
		pe.scene.slideEditor && pe.scene.slideEditor.announce(readText);
	},

	showCoEditTooltip: function(e)
	{
		if (!pe.settings.getIndicator())
		{
			return;
		}

		if (this.status != 2)
		{
			return;
		}

		var target = e.target;
		if (target == this._lastMouseMoveTarget)
			return;

		if (target && this._lastMouseMoveTarget && target.id == this._lastMouseMoveTarget.id)
			return;

		this.detachCoEditTooltip();

		this._lastMouseMoveTarget = target;

		var tagName = target.tagName;
		if (tagName.toLowerCase() == "span")
		{
			var typeid = dojo.attr(target, "typeid");

			if (typeid)
			{
				var userId = typeid.replace("CSS_", "");
				if (pe.scene._userColorMap[userId])
				{
					var user = pe.scene.getEditorStore().getEditorById(userId);
					if (user)
					{
						this.coEditTooltip = new pres.widget.LockerTooltip(
						{
							label: user.getName(),
							userId: user.getEditorId(),
							forNotes: this.element.isNotes,
							forCoEdit: true
						});
						this.coEditTooltip.open(target);
					}
				}
			}
		}
	},

	detachCoEditTooltip: function()
	{
		if (this.coEditTooltip)
			this.coEditTooltip.destroy();
		this.coEditTooltip = null;
	},

	focus: function()
	{
		if(dojo.isIE && pe.scene.slideEditor.opcityPanelShow)
			return;
		var node = this.domNode;
		if (this.status == this.STATUS_EDITING)
		{
			node = this.getEditNode();
		}
		if (!node)
			node = this.domNode;

		if (node)
		{
			node.focus();
			// prevent banner disappear in chrome(or other browser)
			if (!pe.scene.isMobileBrowser())
			{
				var banner = pe.scene.presApp.banner;
				if (banner)
					banner.scrollIntoView();

			}
			else if (this.status == this.STATUS_EDITING)
			{
				node.scrollIntoView();
			}
		}
	},

	exitEdit: function(toDestroy)
	{
		if (this.status == this.STATUS_EDITING)
		{
			if (toDestroy)
			{
				if(this.editor._dumpPendingInput())
				{
					this._hasUpdate = true;
					this.editor.renderModel(null, null);
				}
			}
			
			try{
				if (dojo.isIE < 10 && this.editor && this.editor.mContentModel.mTxtCells.length > 1) {
					this.editor.mContentModel.boxOwner.commentsContainer.style.display = "";
				}
			} catch (e){}
			this.detachEditStyle();
			this.detachCoEditTooltip();
			var editNode = this.getEditNode();
			if (editNode)
			{
				dojo.removeAttr(editNode, "contentEditable");
				if (this.copyPasteIssueCasesArray)
					dojo.forEach(this.copyPasteIssueCasesArray, dojo.disconnect);
				this.copyPasteIssueCasesArray = [];
			}
			dojo.removeAttr(this.domNode, "contentEditable");

			if (this._hasUpdate)
				this.notifyUpdate(
				{
					sync: true
				});

			if (this.editor)
				this.editor.stopSpellCheck();

			this._pendingRenderTableSelection = false;

			this.status = this.STATUS_SELECTED;
			//this.getParent().toggleSelection(false);
			if (!toDestroy)
			{
				this.domNode.style.cursor = "default";
				var isEmptyPlaceholderProcessed = this.editor.processExitEmptyPlaceHolder(this.domNode);
				this.editor.clearSelection(true);
				if (document.activeElement && document.activeElement.blur && !dojo.isIE)
					document.activeElement.blur();

				var bForceRender = false;
				if (dojo.isSafari)
				{
					var inputMethod = this.editor.lastInputMethod;
					if (inputMethod && inputMethod.indexOf("IME_") >= 0)
					{
						bForceRender = true;
					}
				}
				this.editor.renderModel(null, bForceRender);

				this.editor.renderTableSelection();
				if (isEmptyPlaceholderProcessed)
				{
					this.notifyUpdate(
					{
						forPlaceHolder: true,
						noNeedUndo: !this.editor._isModified
					});
				}
				else if (this.element.family == "text" && EditorUtil.isNodeTextEmpty(this.domNode))
				{
					if (!pe.scene.locker.isLockedByOther(this.element.id))
					{
						var textNode = this.getTextNode(this.domNode);
						if (!EditorUtil.hasBackgroundFill(textNode))
							dojo.publish("/box/to/delete", [
								[this]
							]);
					}
				}

				this.spellCheck();
			}
			else
			{
				if(!(dojo.isIE && pe.scene.slideEditor.opcityPanelShow))
					this.domNode.focus();
			}
			if (pe.scene.locker.isLockedByMe(this.element.id))
				this.unlock();
			dojo.publish("/box/exit/edit", [this]);
			var presStrs = pe.presStrs;
			var readText = this.getBoxContentType() + " " + presStrs.ACC_EndEditorMode;
			pe.scene.slideEditor && pe.scene.slideEditor.announce(readText);
		}
	},

	spellCheck: function()
	{
		var sc = pe.scene.spellChecker;
		if (sc.isAutoScaytEnabled())
			sc.checkNodes(this.domNode, this.domNode, null);
	},

	getNotesNode: function(rootNode)
	{
		var node = rootNode || this.domNode;
		var notesDrawText = null;
		dojo.query(".draw_text-box", node).forEach(function(n, index, arr)
		{
			if (dojo.attr(n.parentNode, "presentation_class") == "notes")
			{
				notesDrawText = n;
			}
		});
		return notesDrawText;
	},

	getTextNode: function(rootNode)
	{
		var node = rootNode || this.domNode;
		if (this.element.family == "text")
			return node.children[0].children[0].children[0];
		else if (this.element.family == "notes")
		{
			var notesDrawText = this.getNotesNode(rootNode);
			var resultNode = null;
			if (notesDrawText)
				resultNode = dojo.query(".draw_frame_classes", notesDrawText)[0];
			if (!resultNode)
				resultNode = node.children[0].children[0].children[0];
			return resultNode;
		}
		else if (this.element.family == "group")
		{
			var subs = node.firstElementChild.children;
			var textNode;
			for (var i = 0; i < subs.length; i++)
			{
				var child = subs[i];
				if (dojo.attr(child, "presentation_class") != 'graphic')
				{
					textNode = child;
					break;
				}
			}
			if (textNode)
			{
				return textNode.children[0].children[0].children[0];
			}
		}
	},

	getInnerContentHeight: function()
	{
		// for text;
		var node = this.getTextNode();
		if (node)
		{
			var height = node.style.height;
			var display = node.style.display;
			node.style.height = "auto";
			node.style.display = "inline-block";
			var h = dojo.contentBox(node).h;
			node.style.height = height;
			node.style.display = display;
			return h;
		}
		return 0;
	},

	destroy: function()
	{
		if (this.status)
			this.exitSelection(true);
		if (this.copyPasteIssueCasesArray)
			dojo.forEach(this.copyPasteIssueCasesArray, dojo.disconnect);
		this.copyPasteIssueCasesArray = [];
		this.detachCoEditTooltip();
		this.inherited(arguments);
	},

	heightFixed: function()
	{
		return dojo.hasAttr(this.domNode, "hfixed");
	},

	unfixBoxHeight: function()
	{
		if (this.heightFixed())
		{
			if (this.element.family == "table")
			{
				var tableModel = this.element.table;
				var trs = dojo.query("tr", this.domNode);
				if (tableModel.rows.length != trs.length)
					return;
				this.domNode.style.height = (this.element.h * 100 / this.element.parent.h) + "%";
				dojo.forEach(trs, function(tr, i)
				{
					if (tr.style.height == "0px" && tr.style.display == "none")
					{
						tr.style.display = "";
					}
					dojo.attr(tr, "style", tableModel.rows[i].attr("style"));
				});
			}

			else if (this.element.family == "text")
			{
				var node = this.getTextNode();
				if (node)
				{
					node = node.parentNode;
					var realh = dojo.attr(node, "realh");
					if (!realh)
						realh = "100%"; // TODO, always 100%?
					node.style.height = realh;
					dojo.removeAttr(node, "realh");
				}
				this.domNode.style.height = (this.element.h * 100 / this.element.parent.h) + "%";
			}

			dojo.removeAttr(this.domNode, "hfixed");
		}
	},

	fixBoxHeight: function(invalidate)
	{
		this.unfixBoxHeight();
		// invalidate means to reset 'origh'
		if (this.element.family == "table")
		{
			var tableModel = this.element.table;
			var trs = dojo.query("tr", this.domNode);
			if (tableModel.rows.length != trs.length)
				return;
			var heightsPx = [];
			var tableHeight = 0;
			dojo.forEach(trs, function(tr, i)
			{
				var h = Math.ceil(tr.offsetHeight);
				var cm = pres.utils.helper.px2cm(h);
				var rowModel = tableModel.rows[i];
				var orighpx = h;
				var origh = rowModel.attr("origh");
				if (origh && !invalidate)
				{
					orighpx = Math.ceil(pres.utils.helper.cm2px(origh));
				}
				else
				{
					origh = cm;
					rowModel.attr("origh", cm);
				}
				/*
				 * // normalize the table model h if (first) rowModel.h = cm;
				 */
				rowModel.attr("currh", h);
				tableHeight += cm;
				heightsPx.push(orighpx);
			});

			dojo.forEach(trs, function(tr, i)
			{
				tr.style.height = heightsPx[i] + "px";
				if (heightsPx[i] == 0)
					tr.style.display = "none";
			});

			dojo.attr(this.domNode, "hfixed", "true");
			if(tableHeight != 0) {
				tableModel.parent.h = tableHeight;
			}
			this.domNode.style.height = "";
		}

		else if (this.element.family == "text")
		{
			var node = this.getTextNode();
			if (node)
			{
				node = node.parentNode;
				this.disableRotate();
				var h = Math.ceil(dojo.contentBox(node).h);
				var cm = pres.utils.helper.px2cm(h);
				var origh = this.element.attr("origh");
				if (!origh || invalidate)
				{
					origh = cm;
					this.element.attr("origh", cm);
				}
				var orighpx = pres.utils.helper.cm2px(origh);
				this.element.attr("currh", h);
				if (!dojo.attr(node, "realh"))
				{
					// the first time/
					var height = node.style.height;
					if (height)
						dojo.attr(node, "realh", height);
				}
				dojo.contentBox(node,
				{
					h: orighpx
				});
				this.restoreRotate();
			}
			this.domNode.style.height = "";
			dojo.attr(this.domNode, "hfixed", "true");
		}
	},

	notifyUpdate: function(params)
	{

		this._hasUpdate = false;
		clearTimeout(this._checkKeyDownUpdateTimer);
		dojo.publish("/box/content/updated", [this, params]);
	},

	isRotatedPPTODPGroupBox: function()
	{
		var isPPTODPGroupBox = (this.element.family == "group" || this.element.family =="text") && (DOC_SCENE.extension.toLowerCase() != 'pptx' || (DOC_SCENE.extension.toLowerCase() == "pptx" && DOC_SCENE.isOdfDraft));
		if (!isPPTODPGroupBox)
			return false;

		var styleString = dojo.attr(this.domNode, 'style') || '';
		if (styleString.indexOf('transform') >= 0 || styleString.indexOf('rotate') >= 0)
		{
			return true;
		}

		var textNode = this.getTextNode();
		if (textNode)
		{
			var styleString = dojo.attr(textNode.parentNode.parentNode.parentNode, 'style') || '';
			if (styleString.indexOf('transform') >= 0 || styleString.indexOf('rotate') >= 0)
			{
				return true;
			}
		}

		return false;
	}

});
