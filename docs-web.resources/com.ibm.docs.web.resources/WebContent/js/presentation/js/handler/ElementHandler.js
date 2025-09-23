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

dojo.provide("pres.handler.ElementHandler");

dojo.require("pres.model.Document");
dojo.require("pres.msg.Publisher");
dojo.require("pres.utils.htmlHelper");
dojo.require("pres.utils.tableUtil");
dojo.require("pres.utils.textboxUtil");
dojo.require("pres.config.defaultTableElement");
dojo.require("pres.utils.imageUtil");
dojo.require("pres.handler.TableElementHandler");

dojo.declare("pres.handler.ElementHandler", [pres.handler.TableElementHandler], {

	textBoxContentUpdated: function(box, forPlaceHolder, noNeedUndo)
	{
		var element = box.element;
		// for text, or groupped text, notes
		var dom = box.domNode;
		if (!dom)
			return;

		var shapeUtil = pres.utils.shapeUtil;
		if (!shapeUtil.isShape(element))
			box.disableRotate();

		var helper = pres.utils.helper;
		var msgPub = pe.scene.msgPublisher;
		var actPair = [];
		var index = element.getIndex();
		actPair.push(msgPub.createDeleteElementAct(element, index));

		var changed = true;
		var putToUnDo = true;

		if (element.family == "group")
		{
			var content = box.getSubContent();

			if (element.txtBox)
				element.txtBox.setContent(content);
			else if(element.img)
			{
				content = box.getContent();
				element.setContent(content);
			}
		}
		else if (element.family == "text" || element.family == "notes")
		{
			var content = box.getContent();
			var contentBefore = element.content;
			element.setContent(content);

			if (element.family != "notes")
			{
				var domBox = dojo.marginBox(dom.firstChild);
				var textNode = box.getTextNode();
				var node = textNode.parentNode;
				var currenth = Math.ceil(dojo.contentBox(node).h);
				var oldhpx = helper.cm2px(element.h);
				if (currenth != element.attr("currh") || Math.abs(oldhpx - domBox.h) > 3)
				{
					// height changed, update height.
					element.updateWH(element.w, pres.utils.helper.px2cm(domBox.h));
					element.attr("currh", currenth);
				}
				else
				{
					if (noNeedUndo)
						putToUnDo = false;
				}
			}
		}else if (element.family == "graphic"){
			var content = box.getContent();
			element.setContent(content);
			if (noNeedUndo)
				putToUnDo = false;
		}

		// box.fixBoxHeight();

		actPair.push(msgPub.createInsertElementAct(element, index));

		if (changed)
		{
			if (!putToUnDo)
			{
				actPair[0].act.addToUndoFlag = false;
				actPair[1].act.addToUndoFlag = false;
			}

			var msg = [msgPub.createMessage(MSGUTIL.msgType.ReplaceNode, actPair)];

			if (!putToUnDo)
			{
				msgPub.sendMessage(msg);
			}

			else
				msgPub.addPending("/box/content/changed", msg, [element]);
		}

		if (!shapeUtil.isShape(element))
			box.restoreRotate();
	},

	boxContentUpdated: function(box, params)
	{
		var sync = params ? params.sync : false;
		var forPlaceHolder = params ? params.forPlaceHolder : false;
		var noNeedUndo =  params ? params.noNeedUndo : false;
		var element = box.element;
		var msgPub = pe.scene.msgPublisher;

		if (element.family == "table")
		{
			this.tableToUpdateContent(element);
		}
		else
		{
			this.textBoxContentUpdated(box, forPlaceHolder,noNeedUndo);
		}

		if (sync)
			msgPub.sendPending();
	},

	boxToCreateTextBox: function(slide, params)
	{
		var txtUtil = pres.utils.textboxUtil;
		var defaultTxt = txtUtil.createDefaultTextBox(params);
		if (!defaultTxt)
			return false;

		var curLayout = slide.attr('presentation_presentation-page-layout-name');
		var drawFrameClassDiv = defaultTxt.firstElementChild.firstElementChild.firstElementChild;
		// var contents = dojo.query("p,ol,ul", defaultTxt);
		// if(contents.length > 0)
		// {
		// drawFrameClassDiv = contents[0].parentNode;
		// }
		var masterInfo = pe.scene.master.currMasterFrameStylesJSON;
		if (curLayout == 'ALT0')
			dojo.addClass(drawFrameClassDiv, masterInfo.default_title);
		else
			dojo.addClass(drawFrameClassDiv, masterInfo.default_text);

		var parser = pres.model.parser;
		return parser.parseElement(slide, defaultTxt);
	},

	boxToCreateTable: function(slide, params)
	{
		var row = params.row;
		var col = params.col;
		var style = params.style || "st_plain";

		var plainTable = pres.utils.tableUtil.createPlainTable(style, row, col);// (parms.tableName, parms.rowNum, parms.colNum);
		if (!plainTable)
			return false;

		var parser = pres.model.parser;
		var model = parser.parseElement(slide, plainTable);

		return model;
	},

	boxToCreateImage: function(slide, params)
	{
		var imgUtil = pres.utils.imageUtil;
		var parser = pres.model.parser;
		params.callback = dojo.hitch(this, function(node)
		{
			var elem = parser.parseElement(slide, node);
			this.afterElementCreated(slide, elem);
		});
		imgUtil.createImage(params);
	},

	boxToCreateShape: function(slide, params)
	{
		var shapeUtil = pres.utils.shapeUtil;
		var shapeModel = null;
		if (shapeUtil.isConnectorShapeUI(params.type))
			shapeModel = shapeUtil.createConnectorShapeModel(slide, params);
		else
			shapeModel = shapeUtil.createShapeModel(slide, params);
		return shapeModel;
	},

	boxToReplace: function(type, params)
	{
		if (type == "image")
		{
			var imgUtil = pres.utils.imageUtil;
			var parser = pres.model.parser;
			var slide = pe.scene.slideEditor.slide;
			var oldEle = params.box.element;
			params.callback = dojo.hitch(this, function(node)
			{
				var elem = parser.parseElement(slide, node);
				this.afterElementReplaced(slide, oldEle, elem);
			});
			imgUtil.createImage(params);
		}
	},

	boxToCreate: function(type, params)
	{
		if (!type)
			return false;
		var elem = null;
		var slide = pe.scene.slideEditor.slide;
		if (type == "textbox")
			elem = this.boxToCreateTextBox(slide, params);
		else if (type == "table")
			elem = this.boxToCreateTable(slide, params);
		else if (type == "image")
			this.boxToCreateImage(slide, params);
		else if (type == "shape")
			elem = this.boxToCreateShape(slide, params);

		if (elem)
		{
			this.afterElementCreated(slide, elem);
			return true;
		}
	},

	afterElementReplaced: function(slide, oldElem, elem)
	{
		elem.z = oldElem.z;

		var index = slide.elements.length;

		var oldIndex = dojo.indexOf(slide.elements, oldElem);

		slide.deleteElement(oldElem);
		slide.insertElement(elem, 0);

		// enter edit mode
		var box = pe.scene.slideEditor.getBoxByElementId(elem.id);
		if (box)
		{
			box.enterEdit();
		}

		// step3: send msg
		var msgPub = pe.scene.msgPublisher;
		var act = [msgPub.createDeleteElementAct(oldElem, oldIndex), msgPub.createInsertElementAct(elem, 0)];
		var msg = [msgPub.createMessage(MSGUTIL.msgType.Element, act)];
		msgPub.sendMessage(msg);
	},

	afterElementCreated: function(slide, elem)
	{
		elem.z = slide.getMaxZ() + 5;
		elem.attr("style", elem.getFinalStyle());

		var index = slide.elements.length;

		slide.insertElement(elem, index);

		// enter edit mode
		var box = pe.scene.slideEditor.getBoxByElementId(elem.id);
		if (box)
		{
			box.focus();
			setTimeout(function()
			{
				pe.scene.hub.commandHandler.checkBoxCommands();
				box.enterEdit(null,true);
			}, 0);
		}
		// step3: send msg
		var msgPub = pe.scene.msgPublisher;
		var act = [msgPub.createInsertElementAct(elem, index)];
		var msg = [msgPub.createMessage(MSGUTIL.msgType.Element, act)];
		msgPub.sendMessage(msg);
	},

	boxToPaste: function(elements)
	{
		if (elements.length == 0)
			return;
		var msgActs = [];
		var slide = pe.scene.slideEditor.slide;
		var msgPub = pe.scene.msgPublisher;

		var index = slide.elements.length;
		var selectL = 0;
		dojo.forEach(elements, function(element)
		{
			element.z = slide.getMaxZ() + 1;
			slide.insertElement(element, index);
			element.attr("style", element.getFinalStyle());
			msgActs.push(msgPub.createInsertElementAct(element, index));
			index = index + 1;
			selectL++;
		});

		if (msgActs.length > 0)
		{
			var msg = [msgPub.createMessage(MSGUTIL.msgType.Element, msgActs)];
			msgPub.sendMessage(msg);
		}
		pe.scene.slideEditor.deSelectAll();
		var viewC = pe.scene.slideEditor.getChildren();
		for ( var i = 0; i < selectL; i++)
		{
			var b = viewC.pop();
			b.enterSelection();
			(i == 0) && dojo.window.scrollIntoView(b.mainNode);
		}
	},

	boxToDelete: function(boxes)
	{
		if (boxes.length == 0)
			return;
		var msgActs = [];
		var elements = [];
		var me = this;
		var slide = boxes[0].element.parent;
		var msgPub = pe.scene.msgPublisher;
		dojo.forEach(boxes, function(box)
		{
			var element = box.element;
			if (pe.scene.locker.isLockedByOther(element.id))
				return;

			elements.push(element);

			var oldIndex = dojo.indexOf(slide.elements, element);
			var deleteAct = msgPub.createDeleteElementAct(element, oldIndex);

			msgActs.push(deleteAct);
		});

		if (msgActs.length > 0)
		{
			var msgPairList = [msgPub.createMessage(MSGUTIL.msgType.Element, msgActs)];
			msgPub.sendMessage(msgPairList);
		}

		slide.deleteElements(elements, null);
	},

	shapeSetBGColor: function(boxes, bgColor)
	{
		if (boxes.length == 0)
			return;
		var msgActs = [];
		var SYNCMSG = pe.scene.msgPublisher;
		dojo.forEach(boxes, dojo.hitch(this, function(box)
		{
			var e = box.element;
			var fill = e.svg.fill;
			if (fill)
			{
				// Create message acts
				var rectId = fill.id;
				// Create "a" message acts
				var act = null;
				var oldAttrObj = {};
				var newAttrObj = {};
				pres.utils.shapeUtil.setGroupLineFillColor(fill, bgColor, 'fill', oldAttrObj, newAttrObj);
				act = SYNCMSG.createAttributeAct(rectId, newAttrObj, null, oldAttrObj, null);
				act.act.shapeid = e.id;
				act.rAct.shapeid = e.id;
				act.act.bgbd = 'bg';
				act.rAct.bgbd = 'bg';
				if (act)
					msgActs.push(act);
			}
		}));
		if (msgActs.length > 0)
		{
			// for server and other client.
			var msgList = [SYNCMSG.createMessage(MSGUTIL.msgType.Attribute, msgActs)];
			SYNCMSG.sendMessage(msgList);
		}
		dojo.forEach(boxes, function(box)
		{
			// for local view update
			dojo.publish("/shape/bgfill/changed", [box.element]);
		});
	},
	
	shapeSetOpacity: function(boxes, opacityValue)
	{
		if (boxes.length == 0)
			return;
		var msgActs = [];
		var SYNCMSG = pe.scene.msgPublisher;
		dojo.forEach(boxes, dojo.hitch(this, function(box)
		{
			var e = box.element;
			var fill = e.svg.fill;
			if (fill)
			{
				var rectId = fill.id;
				// Create "a" message acts
				var act = null;
				var oldAttrObj = {};
				var newAttrObj = {};
				pres.utils.shapeUtil.setOpacity(fill, opacityValue,'fill',oldAttrObj, newAttrObj);
				act = SYNCMSG.createAttributeAct(rectId, newAttrObj, null, oldAttrObj, null);
				act.act.shapeid = e.id;
				act.rAct.shapeid = e.id;
				act.act.bgbd = 'op';
				act.rAct.bgbd = 'op';
				if (act)
					msgActs.push(act);
			}
		}));
		if (msgActs.length > 0)
		{
			// for server and other client.
			var msgList = [SYNCMSG.createMessage(MSGUTIL.msgType.Attribute, msgActs)];
			//use addPending instead of sendMessage. will merge msg with short interval, just send the final msg.
			//When users drag opacityBar , opacity changes continuously 
			//only final value will be put into undo stack and send to server.
			//addPending: function(type, msg, elements, time)
			SYNCMSG.addPending("/shape/opacity/changed", msgList,[boxes[0].element]);
		}
		dojo.forEach(boxes, function(box)
		{
			// for local view update
			dojo.publish("/shape/opacityfill/changed", [box.element]);
		});
	},
	
	shapeSetLineStyle: function (boxes, lineStyleValue, cmd)
	{
		if (boxes.length == 0)
			return;
		var SYNCMSG = pe.scene.msgPublisher;
		//cmd format : line_stylename, like line_width
		var lineStyleName = cmd.replace('line_', '');
		var msgList = '';
		//width : change width attr , resize shape and send replaceNode msg , then update local view.
		//attribute (like dashtype, linejoin and linecap ): change attribute and send attr msg ,then update local view.
		//endpoints type : delete endpoints , change endpoints or add endpoints, send replaceNode msg.
		if( cmd == pres.constants.CMD_LINE_WIDTH)
		{
			this.shapeSizeUpdate(boxes, null, lineStyleName, lineStyleValue);
			dojo.forEach(boxes, function(box){
				dojo.publish("/shape/linestyle/changed", [box.element, null, lineStyleName]);
			});
		}
		else if( cmd == pres.constants.CMD_ARROW_TYPE)
		{
			var msgActs = [];
			var msgPub = pe.scene.msgPublisher;
			var slide = boxes[0].element.parent;
			//delete node msg
			dojo.forEach(boxes, function(box)
			{
				var element = box.element;
				var index = dojo.indexOf(slide.elements, element);
				var deleteAct = msgPub.createDeleteElementAct(element, index);
				msgActs.push(deleteAct);
			});

			dojo.forEach(boxes, dojo.hitch(this, function(box)
			{
				var e = box.element;
				var drawType = e.attrs["draw_type"];
				if(!(/Z/.test(e.svg.path) || e.svg.circle))
				{
					var arrows = e.svg.arrows;
					var hasHead  = false;
					var hasTail = false;
					var slide = boxes[0].element.parent;
					//add or change endpoints
					var needUpdate = false;						
					var arrowType = lineStyleValue.split('-'); 
					arrows && arrows.length && (arrows.length == 2 ? (hasHead = hasTail = true) :((hasHead = arrows[0].type == 'head')? true:(hasTail = true)));

					//has head and tail, just change arrowModel
					if(hasHead && hasTail)
					{
						dojo.forEach(arrowType, function(eachArrowType)
						{
							var formatStr = eachArrowType.split('_');
							dojo.forEach(arrows, function(arrow)
							{
								if( arrow && formatStr[0] == arrow.type)
								{
									//addOrDelEndpoint : svg parent , arrow obj to change, triangle , tail or head
									needUpdate = pres.utils.shapeUtil.addOrDelEndpoint(box.element.svg, arrow, formatStr[1], arrow.type, drawType) || needUpdate;
								}
							});	
						});
					}
					else if(hasHead)
					{
						//just have head , need to add tail in arrowModel.
						dojo.forEach(arrowType, function(eachArrowType)
						{
							var formatStr = eachArrowType.split('_');
							if(formatStr[0] == "head")
							{
								needUpdate = pres.utils.shapeUtil.addOrDelEndpoint(box.element.svg, arrows[0], formatStr[1], "head", drawType) || needUpdate; 
							}
							else if(formatStr[0] == "tail")
							{
								needUpdate = pres.utils.shapeUtil.addOrDelEndpoint(box.element.svg, null, formatStr[1], "tail", drawType) || needUpdate; 
							}
						});
					}
					else if(hasTail)
					{
						//have tail , need to add head in arrowModel.
						dojo.forEach(arrowType, function(eachArrowType)
						{
							var formatStr = eachArrowType.split('_');
							if(formatStr[0] == "head")
							{
								needUpdate = pres.utils.shapeUtil.addOrDelEndpoint(box.element.svg, null, formatStr[1], "head", drawType) || needUpdate; 
							}
							else if(formatStr[0] == "tail")
							{
								needUpdate = pres.utils.shapeUtil.addOrDelEndpoint(box.element.svg, arrows[0], formatStr[1], "tail", drawType) || needUpdate; 
							}
						});
					}
					else
					{
						//add head and tail
						dojo.forEach(arrowType, function(eachArrowType)
						{
							var formatStr = eachArrowType.split('_');
							if(formatStr[0] == "head")
							{
								needUpdate = pres.utils.shapeUtil.addOrDelEndpoint(box.element.svg, null, formatStr[1], "head", drawType) || needUpdate; 
							}
							else if(formatStr[0] == "tail")
							{
								needUpdate = pres.utils.shapeUtil.addOrDelEndpoint(box.element.svg, null, formatStr[1], "tail", drawType) || needUpdate; 
							}
						});
					}
					
					//if endpoints changed , resize shape and send replaceNode msg. 
					if(needUpdate)
					{
						pres.utils.shapeUtil.shapeCalcWithNewAttr(box);
						var index = dojo.indexOf(slide.elements, e);
						var insertAct = msgPub.createInsertElementAct(e, index);
						msgActs.push(insertAct);
						if (msgActs.length > 0)
						{
							var msgPairList = [msgPub.createMessage(MSGUTIL.msgType.ReplaceNode, msgActs)];
							msgPub.sendMessage(msgPairList);
						}
						dojo.publish("/shape/linestyle/changed", [box.element, null, lineStyleName]);
					}

				}//end if svgfill
			}));///end dojo.foreach box
		}
		else
		{
			var msgActs = [];
			//dashtype, lineJoin or linecap styles  
			dojo.forEach(boxes, dojo.hitch(this, function(box)
			{
				var e = box.element;
				var stroke = e.svg.line;
				if (stroke)
				{
					var rectId = stroke.id;
					// Create "a" message acts
					var actLine = null;
					var oldAttrObj = {};
					var newAttrObj = {};
					//change attribute
					pres.utils.shapeUtil.setLineType(stroke, lineStyleValue, oldAttrObj, newAttrObj, lineStyleName);
					actLine = SYNCMSG.createAttributeAct(rectId, newAttrObj, null, oldAttrObj, null);
					actLine.act.shapeid = e.id;
					actLine.rAct.shapeid = e.id;
					actLine.act.lineStyleName = lineStyleName;
					actLine.rAct.lineStyleName = lineStyleName;					
					if (actLine)
					{
						msgActs.push(actLine);
					}
				}
			}));

			if (msgActs.length > 0)
			{
				// send attr msg . for server and other client.
				msgList = [SYNCMSG.createMessage(MSGUTIL.msgType.Attribute, msgActs)];
				SYNCMSG.sendMessage(msgList);
			}

			dojo.forEach(boxes, function(box)
			{
				// for local view update
				dojo.publish("/shape/linestyle/changed", [box.element, null, lineStyleName]);
			});		
		}
	},


	boxSetOpacity: function(boxes, opacityValue)
	{
		if (boxes.length == 0)
			return;

		dojo.forEach(boxes, dojo.hitch(this, function(box)
		{
			var textNode = box.getTextNode();
			if (textNode)
			{
				var tempColor = textNode.style.backgroundColor;
				var rgbaColor = EditorUtil.getRGBAColorWithOpacity(tempColor,opacityValue);
				dojo.style(textNode,{'backgroundColor': rgbaColor});
			}
			this.textBoxContentUpdated(box , null , false);
		}));
	},	
	
	imageSetOpacity: function(boxes, opacityValue)
	{
		if (boxes.length == 0)
			return;
		
		var opacityFloatValue = parseFloat(opacityValue);
		dojo.forEach(boxes, dojo.hitch(this, function(box)
		{
			var element = box.element;
			var imgNode = null;
			if (isNaN(opacityFloatValue))
				opacityFloatValue = 1;
			element.attr("opacity", opacityFloatValue);
			if (element.img)
			{
				element.img.attr("opacity", opacityFloatValue);
				var styleArray = EditorUtil.turnStyleStringToArray(element.img.attrs.style);
				styleArray['opacity'] = opacityFloatValue;
				element.img.attrs.style = EditorUtil._arrayToStyleString(styleArray);
				imgNode = box.domNode.children[0].children[0].children[0];//get imgNode of image imported into docs
			}
			else
				imgNode = box.domNode.children[0];//get imgNode of image created in docs
			if (imgNode)
			{
				dojo.style(imgNode,{'opacity': opacityFloatValue});
			}
			this.textBoxContentUpdated(box, null, false);
		}));
	},
	
	shapeSetBorderColor: function(boxes, bdcolor)
	{
		if (boxes.length == 0)
			return;
		var msgActs = [];
		var SYNCMSG = pe.scene.msgPublisher;
		dojo.forEach(boxes, dojo.hitch(this, function(box)
		{
			var e = box.element;
			var shapeid = e.id;
			var line = e.svg.line;
			if (line)
			{
				var rectId = line.id;
				// Create "a" message acts
				var act = null;
				var oldAttrObj = {};
				var newAttrObj = {};
				pres.utils.shapeUtil.setGroupLineFillColor(line, bdcolor, 'stroke', oldAttrObj, newAttrObj);
				act = SYNCMSG.createAttributeAct(rectId, newAttrObj, null, oldAttrObj, null);
				act.act.shapeid = shapeid;
				act.rAct.shapeid = shapeid;
				act.act.bgbd = 'bd';
				act.rAct.bgbd = 'bd';
				if (act)
					msgActs.push(act);
			}
			var arrows = e.svg.arrows;
			dojo.forEach(arrows, dojo.hitch(this, function(arrow)
			{
				var rectId = arrow.id;
				// Create "a" message acts
				var act = null;
				var oldAttrObj = {};
				var newAttrObj = {};
				var flag = pres.utils.shapeUtil.checkArrowColorChange(arrow);
				if (flag == true)
					pres.utils.shapeUtil.setGroupLineFillColor(arrow, bdcolor, 'fill', oldAttrObj, newAttrObj);
				else if (flag == false)
					pres.utils.shapeUtil.setGroupLineFillColor(arrow, bdcolor, 'stroke', oldAttrObj, newAttrObj);
				act = SYNCMSG.createAttributeAct(rectId, newAttrObj, null, oldAttrObj, null);
				act.act.shapeid = shapeid;
				act.rAct.shapeid = shapeid;
				act.act.bgbd = 'bd';
				act.rAct.bgbd = 'bd';
				if (act)
					msgActs.push(act);
			}));

		}));
		if (msgActs.length > 0)
		{
			// Just sent one msg
			var msgList = [SYNCMSG.createMessage(MSGUTIL.msgType.Attribute, msgActs)];
			SYNCMSG.sendMessage(msgList);
		}
		dojo.forEach(boxes, function(box)
		{
			dojo.publish("/shape/borderfill/changed", [box.element]);
		});
	},
	
	boxSetColor: function(boxes, color)
	{
		// for move, bring to front, send to back.
		if (boxes.length == 0)
			return;
		var hazOpacity = false;
		dojo.forEach(boxes, dojo.hitch(this, function(box)
		{
			var element = box.element;
			var textNode = box.getTextNode();
			
			if (textNode)
			{
				hazOpacity = EditorUtil.testIfHazOp(textNode.style.backgroundColor);
				if(hazOpacity)
				{
					//preserve opacityA. combine opacityA with newColor. 
					if(color != 'transparent')
						color = EditorUtil.getRGBAFromNewColor(color,textNode.style.backgroundColor);
					textNode.style.backgroundColor = color;
				}
				else
				{
					//have no opacity . set color derectly
					textNode.style.background = "";
					textNode.style.backgroundImage = "none";
					textNode.style.backgroundColor = color;
				}				
			}
			this.textBoxContentUpdated(box);
		}));
	},

	boxPosChanged: function(boxes)
	{
		// for move, bring to front, send to back.
		if (boxes.length == 0)
			return;

		var objArray = [];
		var elements = [];
		var me = this;
		var msgPub = pe.scene.msgPublisher;

		var msgActs = [];
		dojo.forEach(boxes, function(box)
		{
			var element = box.element;
			var slide = element.parent;
			var s = box.domNode.style;

			// only impact t/l/z

			var z = parseInt(s.zIndex);
			var t = parseFloat(s.top) * slide.h / 100.0;
			var l = parseFloat(s.left) * slide.w / 100.0;

			var oldStyle = element.getFinalStyle();
			// update shape frame
			if (element.family == 'group' && element.svg)
			{
				var oldAttrObj = element.svg.getModelPos();

				element.updateShapeFrmLT(l, t);

				var newAttrObj = element.svg.getModelPos();
				// This action is only for server update
				// Other client will not handle this act
				// model position will update per main node position in style act
				var act = msgPub.createAttributeAct(element.svg.id, newAttrObj, null, oldAttrObj, null);
				msgActs.push(act);
			}
			element.updatePosAttr(element.w, element.h, t, l, z, null);
			var newStyle = element.getFinalStyle();

			var flag = "ResizingEnd";
			var obj = {
				id: element.id,
				oldStyle: oldStyle,
				newStyle: newStyle,
				flag: flag
			};

			elements.push(element);
			objArray.push(obj);
		});

		dojo.forEach(objArray, function(data)
		{
			var act = msgPub.createAttributeActForResizing(data.id, data.newStyle, data.oldStyle, data.flag);
			msgActs.push(act);
		});

		var msg = [msgPub.createMessage(MSGUTIL.msgType.Attribute, msgActs)];
		msgPub.addPending("/box/pos", msg, elements);
	},
	
	boxTransChanged: function(boxes)
	{
		// for rotate and flip.
		if (boxes.length == 0)
			return;
		var msgActs = [];
		var msgPub = pe.scene.msgPublisher;
		var slide = boxes[0].element.parent;
		dojo.forEach(boxes, function(box)
		{
			var element = box.element;
			var index = dojo.indexOf(slide.elements, element);
			var deleteAct = msgPub.createDeleteElementAct(element, index);
			msgActs.push(deleteAct);
		});

		dojo.forEach(boxes, function(box)
		{
			box.element.updateTransform(box);
			var index = dojo.indexOf(slide.elements, box.element);
			var insertAct = msgPub.createInsertElementAct(box.element, index);
			msgActs.push(insertAct);
			//reset direct class for resize wrapper
			box.setWrapperRotateClass();
		}, this);
				
		if (msgActs.length > 0)
		{
			var msgPairList = [msgPub.createMessage(MSGUTIL.msgType.ReplaceNode, msgActs)];
			msgPub.sendMessage(msgPairList);
		}
	},
	
	adjHandlerChanged: function(boxes, handlerName)
	{
		//shape element is changed when mouse move synchronously, 
		//only update adjust handlers poses
		dojo.forEach(boxes, function(box)
		{
			box.updateAdjustHandlerPos();
		});		
		var msgPub = pe.scene.msgPublisher;
		var msgActs = pe.scene.slideEditor.addShapeAdjInsertActionMsg(boxes);
		if(!msgActs)
			return;
		var msgPairList = [msgPub.createMessage(MSGUTIL.msgType.ReplaceNode, msgActs)];
		msgPub.sendMessage(msgPairList);	
	},

	boxSizeChanged: function(boxes, resizeHandlerName)
	{
		// for resize.
		if (boxes.length == 0)
			return;
		var msgActs = [];
		var msgPub = pe.scene.msgPublisher;
		var slide = boxes[0].element.parent;
		dojo.forEach(boxes, function(box)
		{
			var element = box.element;
			var index = dojo.indexOf(slide.elements, element);
			var deleteAct = msgPub.createDeleteElementAct(element, index);
			msgActs.push(deleteAct);
		});

		dojo.forEach(boxes, function(box)
		{
			var element = box.element;

			var s = box.domNode.style;
			// z should not changed.
			var z = element.z;

			var coords = dojo.coords(box.domNode);

			var border = dojo.style(box.domNode, "borderTopWidth") || 0;
			coords.w = coords.w - border * 2;
			coords.h = coords.h - border * 2;

			var help = pres.utils.helper;

			var t = help.px2cm(coords.t);
			var l = help.px2cm(coords.l);
			var w = help.px2cm(coords.w);
			var h = help.px2cm(coords.h);

			if (element.family == "table")
			{
				var tableModel = element.table;
				var rows = dojo.query("tr", box.domNode);
				var tableNode = dojo.query("table", box.domNode)[0];
				dojo.forEach(rows, function(row, index)
				{
					var px = row.offsetHeight;
					var cm = pres.utils.helper.px2cm(px);
					var rowModel = tableModel.rows[index];
					rowModel.h = cm;
					rowModel.removeAttr("origh");
					rowModel.removeAttr("currh");
				});
				var widths = pres.utils.helper.getColWidthsFromDOM(tableNode);
				tableModel.colWidths = dojo.map(widths, function(w)
				{
					return pres.utils.helper.px2cm(w);
				});
			}
			else if (element.family == 'group' && element.svg)
			{
				var wrapperCoords = dojo.coords(dojo.query('.resize-wrapper', box.domNode)[0]);
				element.updateShapeSize(wrapperCoords, resizeHandlerName);
				if (pres.utils.shapeUtil.isConnectorShape(element))
				{
					box.coords = dojo.coords(box.domNode);
					box.sePoint = null;
				}
				else
				{ // normal shape
					box.wrapperCoords = dojo.coords(dojo.query('.resize-wrapper', box.domNode)[0]);
					
					//Some shapes' AdjustHandlerPos will change after resize 
					box.updateAdjustHandlerPos();
				}
			}
	
			// Shape element pos will be updated in updateShapeSize
			if (!(element.family == 'group' && element.svg))
				element.updatePosAttr(w, h, t, l, z, null);

			if (element.family == "table")
			{
				dojo.forEach(element.table.rows, function(rowModel)
				{
					rowModel._updateStyleHeight();
				});
			}
			box.fixBoxHeight(true);
			var index = dojo.indexOf(slide.elements, element);
			var insertAct = msgPub.createInsertElementAct(element, index);
			msgActs.push(insertAct);
		}, this);

		if (msgActs.length > 0)
		{
			var msgPairList = [msgPub.createMessage(MSGUTIL.msgType.ReplaceNode, msgActs)];
			msgPub.sendMessage(msgPairList);
		}
	},

	//change attribute and resize shape, send replaceNode msg, change width need resize
	shapeSizeUpdate: function(boxes, resizeHandlerName, lineStyleName, lineStyleValue)
	{
		// for resize.
		if (boxes.length == 0)
			return;
		var msgActs = [];
		var msgPub = pe.scene.msgPublisher;
		var slide = boxes[0].element.parent;
		dojo.forEach(boxes, function(box)
		{
			var element = box.element;
			var index = dojo.indexOf(slide.elements, element);
			var deleteAct = msgPub.createDeleteElementAct(element, index);
			msgActs.push(deleteAct);
		});
		
		dojo.forEach(boxes, function(box)
		{
			var element = box.element;
			var e = box.element;
			var stroke = e.svg.line;
			var arrows = e.svg.arrows;
			if (stroke)
			{
				var oldAttrObj = {};
				var newAttrObj = {};
				pres.utils.shapeUtil.setLineType(stroke, lineStyleValue, oldAttrObj, newAttrObj, lineStyleName);
			}
			// change width need change line width and arrow width, need resize viewbox
			if( arrows && lineStyleName == 'width')
			{
				dojo.forEach(arrows, function(arrow)
				{
					oldAttrObj = {};
					newAttrObj = {};
					//only type 'arrow' need update stroke-width. 
					if(arrow.attrs["kind"] == "arrow")
						pres.utils.shapeUtil.setLineType(arrow, lineStyleValue, oldAttrObj, newAttrObj, lineStyleName);
				});
			}
			pres.utils.shapeUtil.shapeCalcWithNewAttr(box);
			var index = dojo.indexOf(slide.elements, element);
			var insertAct = msgPub.createInsertElementAct(element, index);
			msgActs.push(insertAct);
		});

		if (msgActs.length > 0)
		{
			var msgPairList = [msgPub.createMessage(MSGUTIL.msgType.ReplaceNode, msgActs)];
			msgPub.addPending("/shape/width/changed", msgPairList, [boxes[0].element]);
		}
	},

	boxToLock: function(element)
	{
		var id = element.id;
		pe.scene.locker.lockElement(id);
		var msgPub = pe.scene.msgPublisher;
		var msg = msgPub.createActivateEditModeMsg(id, true, null);
		msgPub.sendMessage([msg]);
	},

	boxToUnlock: function(element)
	{
		var id = element.id;
		pe.scene.locker.unlockElement(id);
		var msgPub = pe.scene.msgPublisher;
		var msg = msgPub.createActivateEditModeMsg(id, false, null);
		msgPub.sendMessage([msg]);
	}

});