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

dojo.provide("pres.widget.SlideEditorEvent");
dojo.require("dojox.html.metrics");

dojo.declare("pres.widget.SlideEditorEvent", null,
{

	onScroll: function(e)
	{
		// stub for events
	},

	onKey: function(e)
	{
		if (!pe.scene.isLoadFinished())
			return;

		var currentBox = this.getEditingBox();
		if (currentBox && currentBox.editor)
		{
			return;
		}

		var code = e.charCode || e.keyCode;
		var keychar = code >= 32 ? String.fromCharCode(code) : "";
		// in [Polish] IME, right "alt" key will also enable "e.ctrlkey"
		if ((e.ctrlKey || (dojo.isMac && e.metaKey)) && !e.altKey && (keychar == 'a' || keychar == 'A'))
		{
			this.selectAll();
			dojo.stopEvent(e);
		}
		else if (code == 8 || code == 46)
		{
			// backspace / delete
			dojo.stopEvent(e);
			this.deleteBox();
			this.domNode.focus();
		}
		else if (code == 27)
		{
			// escape
			dojo.forEach(this.getChildren(), function(b)
			{
				if (b.status > 1)
					b.exitEdit();
				else if (b.status > 0)
					b.exitSelection();
			});
			if (this.inDragCreateMode)
				this.toggleDragCreateMode();
			this.domNode.focus();
			dojo.stopEvent(e);
		}
		else if (code == 13)
		{
			// enter
			var boxes = dojo.filter(this.getChildren(), function(c)
			{
				return c.status == 1;
			});
			if (boxes.length == 1)
				boxes[0].enterEdit();
			dojo.stopEvent(e);
		}
		else if (code == 9)
		{
			// TAB
			var boxes = this.getChildren();
			if (boxes.length == 0)
			{
				return;
			}
			else
			{
				var currentBox = null;
				var currentBoxIndex = 0;
				for (var i = 0; i < boxes.length; i++)
				{
					var b = boxes[i];
					if (b.status == 1 || document.activeElement == b.domNode)
					{
						currentBoxIndex = i;
						currentBox = b;
						break;
					}
				}
				if (e.shiftKey)
				{
					if (currentBox)
						currentBoxIndex--;
					if (currentBoxIndex < 0)
						currentBoxIndex = boxes.length - 1;
				}
				else
				{
					if (currentBox)
						currentBoxIndex++;
					if (currentBoxIndex >= boxes.length)
						currentBoxIndex = 0;
				}

				box = boxes[currentBoxIndex];
				if (box != currentBox)
				{
					dojo.forEach(boxes, function(b)
					{
						if (b != box && b.status > 0)
						{
							b.exitSelection();
						}
					});
					var user = pe.scene.locker.isLockedByOther(box.element.id);
					if (user)
					{
						box.focus();
						var readText = box.getBoxAnnouce();
						var u = pe.scene.getEditorStore().getEditorById(user);
						var name = u.getName();
						readText += dojo.string.substitute(pe.presStrs.acc_locked_by, [name]);
						this.announce(readText);
					}
					else
					{
						box.enterSelection();
						box.focus();
					}
				}
			}
			dojo.stopEvent(e);
		}
		else if (code == 37 || code == 38 || code == 39 || code == 40)
		{
			// left, up, right, down
			var boxes = dojo.filter(this.getChildren(), function(c)
			{
				return c.status == 1;
			});
			if (boxes.length)
			{
				if (e.altKey)
				{
					if (code == 37)
						this.rotateBox(-15);
					else if (code == 39)
						this.rotateBox(15);
				}
				else
				{
					var dir = "left";
					if (code == 38)
						dir = "up";
					else if (code == 39)
						dir = "right";
					else if (code == 40)
						dir = "down";
					this.moveBox(dir);
				}
				dojo.stopEvent(e);
			}
		}
		else if (e.altKey && (e.ctrlKey || e.metaKey))
		{
			if (keychar == 'k' || keychar == 'K')
			{
				this.checkResize(true);
				dojo.stopEvent(e);
			}
			else if (keychar == 'j' || keychar == 'J')
			{
				this.checkResize(false);
				dojo.stopEvent(e);
			}
		}
	},

	// keep ratio in resize when shiftkey is pressed.
	_toggleShiftInResize: function(shift)
	{
		if (this._shiftResize != shift)
		{
			this._shiftResize = shift;

			if (this._moveMouseDown && this._clickOnResizeHandler)
			{
				if (this._mouseMoveEvent)
					this.checkResize(this._mouseMoveEvent);
			}
		}
	},

	onMouseLeave: function(e)
	{
		//not allow user do select object & input text action while in partial load.
		if(!pe.scene.isLoadFinished()) {
			e.stopPropagation();
			dojo.stopEvent(e);
			return;
		}
		this.cleanTempEvents();

		if (this._draged)
		{
			if (pe.scene.isMobileBrowser())
			{
				this._tempEvents.push(dojo.connect(document, "ontouchmove", this, "onMouseMove"));
				this._tempEvents.push(dojo.connect(document, "ontouchend", this, "onMouseUp"));
			}

			else
			{
				this._tempEvents.push(dojo.connect(document, "onmousemove", this, "onMouseMove"));
				this._tempEvents.push(dojo.connect(document, "onmouseup", this, "onMouseUp"));
				this._tempEvents.push(dojo.connect(document, "onmouseleave", this, "onMouseUp"));
			}


			var iframe = pe.scene.presApp.iframe;
			if (iframe && iframe.contentDocument)
			{
				if (pe.scene.isMobileBrowser())
				{
					this._tempEvents.push(dojo.connect(iframe.contentDocument, "ontouchmove", this, "onMouseMove"));
					this._tempEvents.push(dojo.connect(iframe.contentDocument, "ontouchend", this, "onMouseUp"));
				}
				else
				{
					this._tempEvents.push(dojo.connect(iframe.contentDocument, "onmousemove", this, "onMouseMove"));
					this._tempEvents.push(dojo.connect(iframe.contentDocument, "onmouseup", this, "onMouseUp"));
				}
			}
		}
		else
		{
			this.onMouseUp(e, true);
		}
	},

	createBoxWithDrag: function(attrs)
	{
		document.body.style.cursor = "default";
		var cmd = pres.constants.CMD_TEXTBOX_CREATE;
		if (this._shapeCreateType)
			cmd = pres.constants.CMD_SHAPE_CREATE;

		var _attrs = {
			type: this._shapeCreateType
		};
		if (!attrs || !attrs.pos)
		{
			if (!attrs)
				attrs = {};
			var height = this.slideNode.offsetHeight;
			var width = this.slideNode.offsetWidth;
			attrs.pos = {
				t: pres.constants.DEFAULT_TEXTBOX_TOP * height / 100,
				l: pres.constants.DEFAULT_TEXTBOX_LEFT * width / 100,
				h: pres.constants.DEFAULT_TEXTBOX_HEIGHT * height / 100,
				w: pres.constants.DEFAULT_TEXTBOX_WIDTH * width / 100
			};
			attrs.sePos = {};
		}

		dojo.mixin(_attrs, attrs);
		dojo.publish("/command/exec", [cmd, _attrs]);
		this.toggleDragCreateMode(false);
		this._shapeCreateType = null;
	},

	checkDragSelect: function(e, type)
	{
		var isMove = type == "mousemove" || type == "touchmove";
		var isLeave = type == "mouseleave";
		var isUp = type == "mouseup" || type == "touchend";

		this.posDragDiv(e);
		var pos = dojo.coords(this.domNode);
		var sePos = this.getStartEndPos();
		sePos.endY = e.clientY + this.domNode.scrollTop;
		sePos.endX = e.clientX + this.domNode.scrollLeft;
		sePos.endY -= pos.y;
		sePos.endX -= pos.x;
		if (sePos.endY > this.domNode.scrollHeight)
			sePos.endY = this.domNode.scrollHeight;
		if (sePos.endY < this.domNode.scrollTop)
			sePos.endY = this.domNode.scrollTop;
		if (sePos.endX > this.domNode.scrollWidth)
			sePos.endX = this.domNode.scrollWidth;
		if (sePos.endX < this.domNode.scrollLeft)
			sePos.endX = this.domNode.scrollLeft;

		var dragDiv = this.getDragDiv();
		var display = dragDiv.style.display;
		dragDiv.style.display = "";
		var box = dojo.coords(dragDiv);
		dragDiv.style.display = display;
		var marginTop = dojo.style(this.mainNode, "marginTop");
		var marginLeft = dojo.style(this.mainNode, "marginLeft");
		var paddingTop = dojo.style(this.containerNode, "paddingTop");
		var paddingLeft = dojo.style(this.containerNode, "paddingLeft");
		if (type != "mousemove")
			dragDiv.style.display = "none";
		box.t -= marginTop + paddingTop;
		box.l -= marginLeft + paddingLeft;
		var rightMouse = e && e.which == 3;
		if (!rightMouse)
		{
			if (!this._dragedOnCover)
			{
				var dragBoxes = [];
				var nonDragBoxes = [];
				dojo.forEach(this.getChildren(), function(c)
				{
					var dom = c.domNode;
					var size = dojo.marginBox(dom);
					var top = size.t;
					var left = size.l;
					var width = size.w;
					var height = size.h;
					if (box.l <= left && box.t <= top && box.l + box.w >= left + width && box.t + box.h >= top + height)
						dragBoxes.push(c);
					else
						nonDragBoxes.push(c);
				});

				dojo.forEach(nonDragBoxes, function(box)
				{
					box.hideHandles();
				});

				dojo.forEach(dragBoxes, function(box)
				{
					if (isUp || isLeave)
						box.enterSelection();
					else
						box.enterPreSelection();
				});
				dragBoxes = null;
				nonDragBoxes = null;
			}
			else if (isUp)
			{
				if(this._creatingDom)
				{
					//add a timeout to kill the blink, as shapeinsert have a 100 ms delay
					setTimeout(dojo.hitch(this, function()
					{
						dojo.destroy(this._creatingDom);					
						this._creatingDom = null;
					}), 120)
				}
				this.createBoxWithDrag(
				{
					pos: box,
					sePos: sePos
				});
			}
		}

	},

	onMouseUp: function(e, leave)
	{
		//not allow user do select object & input text action while in partial load.
		if(!pe.scene.isLoadFinished()) {
			e.stopPropagation();
			dojo.stopEvent(e);
			return;
		}
		this.cleanTempEvents();
		this.resetChildrenCache();
		if (this._draged)
		{
			var type = "mouseup";
			if (leave)
				type = "mouseleave";
			this.checkDragSelect(e, type);
		}
		this._mouseDown = false;
		this._moveMouseDown = false;
		if (this._mouseMoved)
		{
			var me = this;
			setTimeout(function()
			{
				if (e.which != 3 && me._mouseMovedEffected)
					me.afterMoved(me._movedBoxes, me._clickOnResizeHandler,
						me._clickOnResizeHandler ? dojo.trim(me._resizeHandler.id.split("_")[0]) : null);
				me._mouseMoved = false;
				me._movedBoxes = null;
				me._mouseMovedEffected = false;
			}, 0);
		}
		if (this._draged)
		{
			var me = this;
			setTimeout(function()
			{
				me._draged = false;
				me._dragedOnCover = false;
				var dragDiv = me.getDragDiv();
				if (dragDiv)
					dojo.removeClass(dragDiv, "newBox");
			}, 0);
		}

		this.hideActionAssistTip();
		if (e.which == 1)
			this.toggleSelection(true);
	},

	onMouseDown: function(e)
	{
		//not allow user do select object & input text action while in partial load.
		if(!pe.scene.isLoadFinished()) {
			e.stopPropagation();
			dojo.stopEvent(e);
			return;
		}
		if(e.touches && e.touches.length != 1) {
			pe.scene.slideEditor.deSelectAll();
			this._mouseDown = false;
			return;
		};
		//alert("slide editor :: onmousedown")
		this.cleanTempEvents();
		this.resetChildrenCache();

		var sender = null;
		if (e)
		{
			sender = (typeof(window.event) != "undefined") ? e.srcElement : e.target;
		}

		this._movedBoxes = null;
		this._mouseDown = true;
		this._mouseDownPos = e;
		this._mouseDownScrollHeight = this.domNode.scrollHeight;
		this._mouseDownScrollWidth = this.domNode.scrollWidth;
		this._mouseDownScrollTop = this.domNode.scrollTop;
		this._mouseDownScrollLeft = this.domNode.scrollLeft;

		// Get drag start pos for create line shapes
		var pos = dojo.coords(this.domNode);
		var sePos = this.getStartEndPos();
		sePos.startY = this._mouseDownPos.clientY + this._mouseDownScrollTop;
		sePos.startX = this._mouseDownPos.clientX + this._mouseDownScrollLeft;
		sePos.startY -= pos.y;
		sePos.startX -= pos.x;

		if (sender == this.coverNode)
		{
			this._draged = true;
			this._dragedOnCover = true;
		}
		else if (sender != this.slideNode && sender != this.containerNode && sender != this.domNode && sender != this.mainNode && !this._isBackground(sender))
		{
			this._moveMouseDown = true;
			this._clickOnResizeHandler = sender && dojo.hasClass(sender, "resize-handler");
			//alert(this._clickOnResizeHandler)
			this._resizeHandler = sender;
		}
		else if (this.inContentRange(e))
		{
			dojo.publish("/editor/slide/focus", []);
			if (this._mouseMoved || this._draged)
				return;
			dojo.forEach(this.getChildren(), function(child)
			{
				child.exitSelection();
			});
			this.domNode.focus();
			this._draged = true;
		}
		if (this._draged || this._clickOnResizeHandler)
		{
			if (this._draged)
			{
				pres.utils.htmlHelper.clearNativeSel(document);
			}
			this.toggleSelection(false);
		}

		dojo.publish("/editor/focus", []);
	},

	_isBackground: function(dom)
	{
		if (dojo.hasClass(dom, "draw_frame"))
		{
			return !this.isWidgitizable(dom.id);
		}
		else
		{
			while (dom != this.slideNode && dom != document.body && !dojo.hasClass(dom, "draw_frame"))
			{
				dom = dom.parentNode;
			}
			if (dom == this.slideNode || dom == document.body)
				return true;
			if (dojo.hasClass(dom, "draw_frame"))
			{
				return !this.isWidgitizable(dom.id);
			}
			return true;
		}
	},

	posDragDiv: function(e)
	{
		if (this._mouseDown && this._draged && e.which !=3)
		{
			//this.toggleSelection(false);
			var pos = dojo.coords(this.domNode);
			var dragDiv = this.getDragDiv();
			var createClazz = "newBox";
			if (!this._dragedOnCover && dojo.hasClass(dragDiv, createClazz))
				dojo.removeClass(dragDiv, createClazz);
			if (this._dragedOnCover && !dojo.hasClass(dragDiv, createClazz))
				dojo.addClass(dragDiv, createClazz);
			dragDiv.style.display = "none";
			var top = this._mouseDownPos.clientY + this._mouseDownScrollTop;
			var left = this._mouseDownPos.clientX + this._mouseDownScrollLeft;
			if (e.clientY + this.domNode.scrollTop < top)
			{
				top = e.clientY + this.domNode.scrollTop;
			}
			if (e.clientX + this.domNode.scrollLeft < left)
			{
				left = e.clientX + this.domNode.scrollLeft;
			}
			var marginTop = dojo.style(this.mainNode, "marginTop");
			var marginLeft = dojo.style(this.mainNode, "marginLeft");
			var paddingTop = dojo.style(this.containerNode, "paddingTop");
			var paddingLeft = dojo.style(this.containerNode, "paddingLeft");

			var top = top - pos.y;
			var left = left - pos.x;
			var width = Math.abs(this._mouseDownPos.clientX + this._mouseDownScrollLeft - e.clientX - this.domNode.scrollLeft);
			var height = Math.abs(this._mouseDownPos.clientY + this._mouseDownScrollTop - e.clientY - this.domNode.scrollTop);

			width = Math.min(width, this._mouseDownScrollWidth - left);
			height = Math.min(height, this._mouseDownScrollHeight - top);

			dragDiv.style.top = top + "px";
			dragDiv.style.left = left + "px";
			var shapeUtil = pres.utils.shapeUtil;
			var isConnector = shapeUtil.isConnectorShapeUI(this._shapeCreateType);
			if(e.shiftKey && this._shapeCreateType)
			{
				if(!isConnector) {
					var ratio = pres.constants.SHAPE_DEFAULT_RATIO[this._shapeCreateType] || 1;
					height = width / ratio;	
				} else {
					if(width > height) height = 0;
					if(width < height) width = 0;
				} 
			}
			
			dragDiv.style.width = width + "px";
			dragDiv.style.height = height + "px";
			
			if(this._shapeCreateType)
				this._drawCreatingShapes(e);
			else
				dragDiv.style.display = "";
		}
	},
	
	_drawCreatingShapes: function(e)
	{
		var dragDiv = this.getDragDiv();
		var box = {l: parseInt(dragDiv.style.left), t: parseInt(dragDiv.style.top), w: parseInt(dragDiv.style.width), h: parseInt(dragDiv.style.height)};
		var parent = pe.scene.slideEditor.containerNode;
		var shapeUtil = pres.utils.shapeUtil;
		if (shapeUtil.isConnectorShapeUI(this._shapeCreateType))
		{
			var pos = dojo.coords(this.domNode);
			var sePos = this.getStartEndPos();
			sePos.endY = e.clientY + this.domNode.scrollTop;
			sePos.endX = e.clientX + this.domNode.scrollLeft;
			sePos.endY -= pos.y;
			sePos.endX -= pos.x;
			if (sePos.endY > this.domNode.scrollHeight)
				sePos.endY = this.domNode.scrollHeight;
			if (sePos.endY < this.domNode.scrollTop)
				sePos.endY = this.domNode.scrollTop;
			if (sePos.endX > this.domNode.scrollWidth)
				sePos.endX = this.domNode.scrollWidth;
			if (sePos.endX < this.domNode.scrollLeft)
				sePos.endX = this.domNode.scrollLeft;
			if(box.w == 0) {
				sePos.endX = sePos.startX;
				box.l = sePos.startX;
			} else if(box.h == 0) {
				sePos.endY = sePos.startY;
				box.t = sePos.startY;
			}
			var shapeModel = shapeUtil.createConnectorShapeModel(parent, {type:this._shapeCreateType, pos: box, sePos: sePos})
		}
		else
			var shapeModel = shapeUtil.createShapeModel(parent, {type:this._shapeCreateType, pos: box});

		shapeModel.isPreview = true;
		
		var dom = dojo.create("div", {}, null);
		dom.innerHTML = shapeModel.getHTML();
		var outDom = dom.childNodes[0];

		var scale = dojo.style(pe.scene.slideEditor.mainNode.firstChild, "height")*2.54/96/pe.scene.doc.slides[0].h;
		var key = 'g[transform~="scale(1.3333)"]';
		dojo.forEach(dojo.query(key, outDom), function(e){
			var t = dojo.attr(e, 'transform');
			var idx = t.indexOf('scale(1.3333) translate');
			if (idx >= 0)
			{
				t = t.substr(idx);
				dojo.attr(e, 'transform', 'scale(' + scale + ') ' + t);
			}
		});

		if(this._creatingDom)
			dojo.destroy(this._creatingDom);
		this._creatingDom = pe.scene.slideEditor.containerNode.appendChild(outDom);
	},

	getMovedBoxes: function()
	{
		if (!this._movedBoxes)
		{
			var boxes = dojo.filter(this.getChildren(), function(c)
			{
				if (c.status == 1 && !pe.scene.locker.isLockedByOther(c.element.id))
				{
					var dom = c.domNode;
					c._initRatio = dom.offsetWidth / dom.offsetHeight;
					return true;
				}
			});
			this._movedBoxes = boxes;
		}
		return this._movedBoxes;
	},

	onMouseMove: function(e)
	{
		//not allow user do select object & input text action while in partial load.
		if(!pe.scene.isLoadFinished()) {
			e.stopPropagation();
			dojo.stopEvent(e);
			return;
		}
		if(e.touches) {
			if(e.touches.length != 1) {
				pe.scene.slideEditor.deSelectAll();
				this._mouseMoved = false;
				if (e.touches.length == 2) {
					this._touchZoom = true;
				}
				return;	
			} else if (e.touches.length == 1) {
				this._touchMove = true;
			}
		}
		this._mouseMoveEvent = e;
		if (this._mouseDown && this._draged && e.which != 3)
		{
			if (pe.scene.isMobileBrowser())
				return;
			this.checkDragSelect(e, "mousemove");
		}
		else if (this._moveMouseDown && e.which != 3)
		{
			var enterEdit = !this._mouseMoved;
			this._mouseMoved = true;
			var boxes = this.getMovedBoxes();
			if (boxes.length == 0)
				return;
			var me = this;

			this.toggleSelection(false);

			if (!this._clickOnResizeHandler)
			{
				dojo.forEach(boxes, dojo.hitch(this, function(box)
				{
					if (!box.coords)
						box.coords = dojo.coords(box.domNode);
					if (pres.utils.shapeUtil.isNormalShape(box.element) && !box.wrapperCoords)
						box.wrapperCoords = dojo.coords(dojo.query('.resize-wrapper', box.domNode)[0]);
					if (box.status == 1 && !pe.scene.locker.isLockedByOther(box.element.id))
					{
						if (box.isRotatedPPTODPGroupBox())
						{
							this.showWarningMsgForRotatedObject();
							return;
						}

						// the box may be locked by other in moving.
						var top = box.coords.t;
						var left = box.coords.l;
						var newTop = top + (e.clientY - me._mouseDownPos.clientY);
						var newLeft = left + (e.clientX - me._mouseDownPos.clientX);

						if (Math.abs(e.clientY - me._mouseDownPos.clientY) >= 2 || Math.abs(e.clientX - me._mouseDownPos.clientX) >= 2)
						{
							me._mouseMovedEffected = true;
							var newTopPer = me.pxToPercent(newTop, false) + "%";
							var newLeftPer = me.pxToPercent(newLeft, true) + "%";
							dojo.style(box.domNode,
							{
								'top': newTopPer,
								'left': newLeftPer
							});
						}
					}
				}));
				// don't popup this event, else the page will be moved too in safari
				e.stopPropagation();
				dojo.stopEvent(e);
			}
			else
			{
				if(enterEdit)
				{
					//only add current editing box, for only one box in adjHandlerChanged
					var box = dijit.getEnclosingWidget(this._resizeHandler);
					this.addShapeAdjDeleteActionMsg([box]);
				}				
				this.checkResize(e);
			}
		}
		else if (!this._mouseDown && !this._moveMouseDown)
		{
			var tblUtil = pres.utils.tableResizeUtil;
			if (tblUtil.resizeStart)
				return;
			var selectedBoxes = this.getSelectedBoxes();
			if (selectedBoxes.length == 1 && selectedBoxes[0].element.family == "table")
			{
				if (selectedBoxes[0].resizeStart)
					return;
				// this.toggleSelection(false);
				if (!selectedBoxes[0]._mouseDown)
					tblUtil.initPillars(e, selectedBoxes[0]);
				else
					tblUtil.detachResizer();
			}
			else
			{
				tblUtil.detachResizer();
			}
		}
	},

	showActionAssistTip: function(e, txt)
	{
		if (!e)
			return;

		var wrapperNode = dijit.getEnclosingWidget(this._resizeHandler).domNode;
		var pos = dojo.position(wrapperNode);
		var centX = pos.x + pos.w / 2,
			centY = pos.y + pos.h / 2;
		var mouseX = e.clientX,
			mouseY = e.clientY;

		var shiftX = 0,
			shiftY = 0;
		(mouseX > centX) ? shiftX = 10: shiftX = -40;
		(mouseY > centY) ? shiftY = 10: shiftY = -40;

		var sender = this._resizeHandler;
		var dir = dojo.trim(sender.id.split("_")[0]);

		var assistTip = document.getElementById("pres_assist_tip");
		if (assistTip)
		{
			assistTip.innerHTML = txt;

			var editorPos = dojo.position(pe.scene.slideEditor.domNode);
			var tipPos = dojo.position(assistTip);

			var left = mouseX + shiftX;
			var top = mouseY + shiftY;

			if (left < editorPos.x)
				left = editorPos.x;
			else if (left + tipPos.w > editorPos.x + editorPos.w)
				left = editorPos.x + editorPos.w - tipPos.w;

			if (top < editorPos.y)
				top = editorPos.y;
			else if (top + tipPos.w > editorPos.y + editorPos.h)
				top = editorPos.y + editorPos.h - tipPos.h;

			assistTip.style.left = left + "px";
			assistTip.style.top = top + "px";
			assistTip.style.display = '';
		}

	},

	hideActionAssistTip: function()
	{
		var assistTip = document.getElementById("pres_assist_tip");
		if (assistTip)
			assistTip.style.display = 'none';
	},

	_movingAdjHandler: function(handler, e)
	{
		var box = dijit.getEnclosingWidget(handler);

		if (pe.scene.locker.isLockedByOther(box.element.id))
			return;

		var trans = pres.utils.shapeUtil.parseTransformStyle(box.domNode.style.transform);
		var ltpos = dojo.position(dojo.byId("tl_" + box.element.id));
		var gX = e.clientX - ltpos.x - 3.5,
			gY = e.clientY - ltpos.y - 3.5;
		var r = trans.rot * Math.PI / 180;
		var lX = gX * Math.cos(r) + gY * Math.sin(r);
		var lY = gY * Math.cos(r) - gX * Math.sin(r);

		var x = lX * trans.scaleX,
			y = lY * trans.scaleY;
		//		handler.style.left = x + "px";
		//		handler.style.top = y + "px";

		var index = parseInt(handler.id.substr(3));
		box.element.setAvByAdjHandler(index, x, y);
		//TODO: rename ShapeElement.updateShapeSize to ShapeElement.redraw???
		var wrapperCoords = dojo.coords(dojo.query('.resize-wrapper', box.domNode)[0]);
		box.element.updateShapeSize(wrapperCoords);
		box.updateAdjustHandlerPos(index);

		box.resized = true;
	},

	addShapeAdjDeleteActionMsg: function(boxes)
	{
		//create delete actions for redo/undo msg
		if (boxes.length == 0)
			return;
		pe.scene.slideEditor.msgActs = [];
		var msgActs = pe.scene.slideEditor.msgActs;
		var msgPub = pe.scene.msgPublisher;
		var slide = boxes[0].element.parent;
		dojo.forEach(boxes, function(box)
		{
			var index = dojo.indexOf(slide.elements, box.element);
			var deleteAct = msgPub.createDeleteElementAct(box.element, index);
			msgActs.push(deleteAct);
		});

		return msgActs;
	},

	addShapeAdjInsertActionMsg: function(boxes)
	{
		var msgActs = pe.scene.slideEditor.msgActs;
		if (!msgActs)
			return;
		var slide = boxes[0].element.parent;
		var msgPub = pe.scene.msgPublisher;
		dojo.forEach(boxes, function(box)
		{
			var index = dojo.indexOf(slide.elements, box.element);
			var insertAct = msgPub.createInsertElementAct(box.element, index);
			msgActs.push(insertAct);
		}, this);
		return msgActs;
	},

	checkResize: function(e)
	{
		var byMouse = e && (e.type == "mousemove" || e.type == "touchmove");
		if (byMouse)
		{
			this._mouseMovedEffected = true;
			document.body.style.cursor = this._resizeHandler.style.cursor;
		}
		var slideEditor = this;
		var slideEditorNode = this.domNode;
		var boxes = this.getMovedBoxes();
		if (boxes.length == 0)
			return;
		var me = this;
		var dir = e === true ? "large" : "small";
		if (byMouse)
		{
			var sender = this._resizeHandler;
			dir = dojo.trim(sender.id.split("_")[0]);

			if (dir.indexOf("ah-") == 0)
			{
				this._movingAdjHandler(sender, e);
				return;
			}
		}

		dojo.forEach(boxes, dojo.hitch(this, function(box)
		{
			if (!pe.scene.locker.isLockedByOther(box.element.id))
			{
				if (box.status == 1)
				{
					if (box.isRotatedPPTODPGroupBox())
					{
						pe.scene.slideEditor.showWarningMsgForRotatedObject();
						return;
					};
					if (byMouse)
					{
						var sender = me._resizeHandler;
						box.domNode.style.cursor = me._resizeHandler.style.cursor;
					}
					if (!box.coords)
						box.coords = dojo.coords(box.domNode);
					if (pres.utils.shapeUtil.isNormalShape(box.element) && !box.wrapperCoords)
						box.wrapperCoords = dojo.coords(dojo.query('.resize-wrapper', box.domNode)[0]);

					if (dir == "rh" && box.isEnableRotate())
					{
						var wrapperNode = me._resizeHandler.parentNode.parentNode;
						if(box.element.svg && pres.utils.shapeUtil.isNormalShape(box.element))
							wrapperNode = me._resizeHandler.parentNode;

						var pos = dojo.position(wrapperNode);
						var centX = pos.x + pos.w / 2;
						var centY = pos.y + pos.h / 2;

						var startX = me._mouseDownPos.clientX;
						var startY = me._mouseDownPos.clientY;

						var currentX = e.clientX;
						var currentY = e.clientY;

						var rStart = Math.atan2((startX - centX), (centY - startY)) * 180 / Math.PI;
						var rCurrent = Math.atan2((currentX - centX), (centY - currentY)) * 180 / Math.PI;

						var tiptxt = box.rotateMe(rCurrent - rStart, e.shiftKey);
						tiptxt = (Math.round(tiptxt) % 360 + 360) % 360 + "&#x00B0";
						//TODO: change box.resized to a more general name
						box.resized = true;

						//show assist tip on the selected rh handler
						if(box.domNode == wrapperNode || box.domNode == wrapperNode.parentNode)
							this.showActionAssistTip(e, tiptxt);
					}
					else
					{
						var coords = null;
						if (pres.utils.shapeUtil.isNormalShape(box.element))
							coords = box.wrapperCoords;
						else
							coords = box.coords;

						if (byMouse)
						{
							var trans = pres.utils.shapeUtil.parseTransformStyle(box.domNode.style["transform"] || box.domNode.style["-webkit-transform"]);
							var gX = e.clientX - me._mouseDownPos.clientX,
								gY = e.clientY - me._mouseDownPos.clientY;
							var r = trans.rot * Math.PI / 180;
							var lX = gX * Math.cos(r) + gY * Math.sin(r);
							var lY = gY * Math.cos(r) - gX * Math.sin(r);

							if (pres.utils.shapeUtil.isConnectorShape(box.element))
								box.resizeConnectorShape(box.coords, lX, lY, dir);
							else
								box.resizeMe(coords, lX * trans.scaleX, lY * trans.scaleY, dir, this._shiftResize);
						}
						else
							box.resizeMe(coords, 0, 0, e === true ? "large" : "small", this._shiftResize);
						// indicate the box is really resized
						box.resized = true;
					}
				}
			}
		}));
		if (!byMouse)
		{
			this.afterMoved(this._movedBoxes, true, e === true ? "large" : "small");
			this._movedBoxes = null;
			this.resetChildrenCache();
		}
	},

	inContentRange: function(e)
	{
		if (dojo.isWebKit)
			return true;

		var pos = dojo.position(this.domNode);
		var scrollHeight = this.domNode.scrollHeight;
		var scrollWidth = this.domNode.scrollWidth;
		var height = pos.h;
		var width = pos.w;

		var scrollSize = dojox.html.metrics.getScrollbar();

		if (scrollHeight > height && e.clientX >= width + pos.x - scrollSize.w)
			return false;

		if (scrollWidth > width && e.clientY >= height + pos.y - scrollSize.h)
			return false;

		return true;
	},

	toggleSelection: function(bEnable)
	{
		if (this.selectable !== bEnable)
		{
			this.selectable = bEnable;
			pres.utils.htmlHelper.setSelectable(dojo.isChrome ? dojo.body() : this.domNode, bEnable);
		}
	},

	cleanTempEvents: function()
	{
		if (this._tempEvents)
			dojo.forEach(this._tempEvents, dojo.disconnect);
		this._tempEvents = [];
	},

	destroy: function()
	{
		this.cleanTempEvents();
		this.inherited(arguments);
	}

});
