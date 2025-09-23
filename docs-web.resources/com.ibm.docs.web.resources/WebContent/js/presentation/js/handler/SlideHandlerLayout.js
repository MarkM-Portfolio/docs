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

dojo.provide("pres.handler.SlideHandlerLayout");

dojo.require("pres.constants");
dojo.require("concord.widgets.imageGallery");
dojo.require("pres.widget.Dialog");
dojo.require("concord.widgets.slideTransitionGallery");
dojo.require("concord.widgets.layoutGallery");
dojo.requireLocalization("concord.widgets", "slideEditor");

dojo.declare("pres.handler.SlideHandlerLayout", null, {

	resizeLayoutDialog: function()
	{
		var box = dojo.window.getBox();
		var height = Math.min(350, box.h - 200);
		var dom = dojo.query(".clipPickerDialogResultBox", this.openLayoutDialogObj.domNode)[0];
		if (dom)
		{
			dom.style.height = height + "px";
		}
		this.openLayoutDialogObj.resize();
	},

	openLayoutDialog: function()
	{
		var STRINGS = dojo.i18n.getLocalization("concord.widgets", "slideEditor");

		pe.scene.slideEditor.deSelectAll();
		if (!dijit.byId('P_d_Layout'))
		{
			var dlgDiv = document.createElement('div');
			dlgDiv.id = 'layoutDialog';
			document.body.appendChild(dlgDiv);

			var width = (dojo.isIE) ? '371' : '361';

			this.openLayoutDialogObj = new pres.widget.Dialog({
				id: "P_d_Layout",
				title: STRINGS.ctxMenu_slideLayout,
				content: "<div id='P_d_Layout_MainDiv'> </div>",
				resizable: false,
				dockable: false,
				'presDialogWidth': width,
				'destroyOnClose': false
			}, dojo.byId('layoutDialog'));
			this.openLayoutDialogObj.startup();
			var dialogHeight = 350;
			this.layoutDialogContent(dialogHeight);

			dojo.connect(window, "resize", dojo.hitch(this, function()
			{
				this.resizeLayoutDialog();
			}));
		}
		if (dojo.isChrome)
		{// fixed for #22989,disable tooltip of chrome of itself
			var nodeContainer = dojo.byId("P_d_Layout_MainDiv").parentNode;
			if (nodeContainer)
			{
				var nodeCanvas = nodeContainer.parentNode;
				if (nodeCanvas)
				{
					var theTitle = nodeCanvas.getAttribute("title");
					if (theTitle && theTitle.length > 0)
					{
						nodeCanvas.setAttribute("title", "");
					}
					var layoutNode = nodeCanvas.parentNode;
					if (layoutNode)
					{
						var theLayoutTitle = layoutNode.getAttribute("title");
						if (theLayoutTitle && theLayoutTitle.length > 0)
						{
							layoutNode.setAttribute("title", "");
						}
					}
				}
			}
		}
		if (this.layoutGalleryObj != null)
		{ // jmt - D45188
			this.layoutGalleryObj.deSelectAll();

		}
		this.openLayoutDialogObj.show();
		this.openLayoutDialogObj.resize();
		if (this.layoutGalleryObj)
			this.layoutGalleryObj.updateDialogHeight();

		this.resizeLayoutDialog();
	},

	layoutDialogContent: function(height)
	{
		// Create Dialog Content
		var STRINGS = dojo.i18n.getLocalization("concord.widgets", "slideEditor");
		var mainLayoutContainer = this.mainLayoutContainer = document.createElement('div');
		mainLayoutContainer.id = "P_d_Layout_ContentDiv";
		dojo.byId('P_d_Layout_MainDiv').appendChild(mainLayoutContainer);

		// Load layoutGallery
		this.layoutGalleryObj = new concord.widgets.layoutGallery({
			'mainDiv': mainLayoutContainer,
			'height': height + "px",
			'galleryLayoutData': dojo.byId("layoutHtmlDiv"),
			'getMasterTemplateInfo': dojo.hitch(this, this.getMasterTemplateInfo),
			'handleClose': dojo.hitch(this, this.closeDialog, this.openLayoutDialogObj),
			'onSelectCallback': dojo.hitch(this, this.applyLayoutToCurrentSlide),
			'STRINGS': STRINGS.concordGallery,
			'onDblClick': dojo.hitch(this.openLayoutDialogObj, this.openLayoutDialogObj.closeDialog)
		});
		// IE will not set correct font size for Korean unless the text box has a fixed height
		if (dojo.isIE)
			dojo.style(this.layoutGalleryObj.searchBoxObj.domNode, 'height', '18px');
	},

	getMasterTemplateInfo: function(data)
	{
		// need to store the master style json to be used when creating new frames or outlines
		return pe.scene.master.currMasterFrameStylesJSON;
	},

	applyLayoutForMultiSlidesToScene: function(presPageLayoutName, slideArray, msgPairList, isFromOtherDocForPasteSlides, resultArray)
	{
		var t1 = new Date().valueOf();
		var slideSorter = pe.scene.slideSorter;
		var selectedIndex = slideSorter.getSelectedIndexs();
		var currentIndex = slideSorter.getCurrentIndex();
		var slides = slideArray;
		if (slideArray == null)
		{
			slideArray = slideSorter.getSelectedThumbs();
			slides = dojo.map(slideArray, function(item)
			{
				return item.slide;
			});
		}
		if (resultArray == null)
		{
			resultArray = this.getLayoutResultArray(presPageLayoutName);
		}

		if (resultArray == null || slideArray == null || presPageLayoutName == null || presPageLayoutName == "")
			return msgPairList;

		// TODO, check lock
		if (isFromOtherDocForPasteSlides != true)
		{
			// defect 16324 change contentboxlock check to slidelock check to prevent strange behaviors when other users is
			// viewing or working on the slide.
			// var isContentLocked = window.pe.scene.isMultiSlideHasContentBoxLocked(slideArray);
			var isContentLocked = slideSorter.isSelectionLocked();
			if (isContentLocked)
			{
				// prevent layout change and shows a message operation is not allowed if there is a content box locked
				var isSlide = true;
				// TODO;
				pe.scene.openLockMessageDialog(slides);
				return msgPairList;
			}
		}

		var msgActs = [];
		var msgPub = pe.scene.msgPublisher;

		var opts = [];
		
		dojo.forEach(slideArray, dojo.hitch(this, function(sa)
		{
			var oldSlide = sa.slide;
			var html = oldSlide.getHTML(null, true, true, true);
			var dom = dojo.create("div", {
				style: {
					position: "absolute",
					top: "-10000px",
					left: "-10000px"
				},
				innerHTML: html
			}, dojo.body());

			// just in case, the dom mixed in spell checker tags.
			if (pe.scene.spellChecker)
				pe.scene.spellChecker.resetOneNode(dom, true);

			var oldSlideWrapper = dom.firstChild;
			var oldSlideElem = oldSlideWrapper.firstChild;
			var newSlideWrapper = dojo.clone(dom);
			var newSlideElem = newSlideWrapper.firstChild.firstChild;
			this.tempMaxZ = oldSlide.getMaxZ();
			this.applyLayoutToSlide(resultArray, newSlideElem, isFromOtherDocForPasteSlides, true);

			this.applyLayoutToScene(oldSlideElem, newSlideElem, isFromOtherDocForPasteSlides);

			oldSlideElem.style.cssText = "";
			oldSlideElem.style.cssText = oldSlide.attr("style") || "";

			var newSlide = pres.model.parser.parseSlide(oldSlideWrapper, true);

			dojo.destroy(dom);

			var index = dojo.indexOf(oldSlide.parent.slides, oldSlide);

			opts.push({index: index, oldSlide: oldSlide, newSlide: newSlide});

		}));
		
		dojo.forEach(opts, function(opt, index){
			
			var index = opt.index;
			var oldSlide = opt.oldSlide;
			var newSlide = opt.newSlide;
			
			msgActs.push(msgPub.createDeleteElementAct(oldSlide, index));
			msgActs.push(msgPub.createInsertElementAct(newSlide, index));

			pe.scene.doc.deleteSlide(oldSlide, {batch:true});
			pe.scene.doc.insertSlide(newSlide, index, {batch:true});
		});
		
		setTimeout(function(){
			slideSorter.updateOrders();
			slideSorter.adjustThumbnailContent();  // 1.build thumnail content
			// 2.render selected thumbnail, must after thumnail/cachedSlideHtml content is ready.
			slideSorter.selectItemsByIndex(selectedIndex, currentIndex);
		}, 100);
		
		var t2 = new Date().valueOf();
		console.info("apply layout time " + (t2 - t1));
		
		if (msgActs.length > 0)
		{
			var msg = msgPub.createMessage(MSGUTIL.msgType.ReplaceNode, msgActs);
			msg.msg.forLayout = true;
			msg.rMsg.forLayout = true;
			msgPub.sendMessage([msg]);
		}
	},

	removeSpareBoxes: function(slideElem)
	{
		if (slideElem != null)
		{
			var spareBoxes = dojo.query(".isSpare", slideElem);
			for ( var i = 0; i < spareBoxes.length; i++)
			{
				dojo.destroy(spareBoxes[i]);
			}
		}
	},

	applyLayoutToScene: function(oldSlideElem, newSlideElem, isFromOtherDocForPasteSlides)
	{

		var slideWithNewLayout = newSlideElem;
		if (slideWithNewLayout != null)
		{
			// this.removeSpareBoxes(slideWithNewLayout);
			var slideId = slideWithNewLayout.id;
			var layoutName = slideWithNewLayout.getAttribute("presentation_presentation-page-layout-name");
			var masterName = slideWithNewLayout.getAttribute("draw_master-page-name");
			var slideWithNewLayoutDrawPageClassNames = slideWithNewLayout.className;

			if (slideId && oldSlideElem)
			{
				var slideElem = oldSlideElem;

				slideElem.setAttribute('docs_layout', 'true');
				// msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slideElem), 'docs_layout', 'true', msgPairList);
				this.removeSpareBoxes(slideElem);
				var currLayoutName = slideElem.getAttribute("presentation_presentation-page-layout-name");
				var currMasterName = slideElem.getAttribute("draw_master-page-name");

				// need to send coedit message for presentation_presentation-page-layout-name first before anything else to handle conflict
				// gracefully, since in OT we only detect OT by individual message, OT will be detected for 2 users applying layout at the same time
				// when there is a conflict on setting presentation_presentation-page-layout-name attribute.
				// if we put this msg at the beginning of the msg list for layout, the handle conflict will take care gracefully
				// otherwise, some msgs have already been processed, and the handle conflict on presentation_presentation-page-layout-name attr is not handled gracefully
				if (layoutName != null && layoutName != "")
				{
					// jmt - coeditfix
					var attrName = "presentation_presentation-page-layout-name";
					// msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slideElem), attrName, layoutName, msgPairList);
					slideElem.setAttribute(attrName, layoutName);
					// jmt - coeditfix
					if (masterName != currMasterName)
					{
						var attrName = "draw_master-page-name";
						// msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slideElem), attrName, masterName, msgPairList);
						slideElem.setAttribute("draw_master-page-name", masterName);

					}
					// update master draw_page classes
					// first remove both possible draw_page classes
					var attrName = "class";
					var oldAttrVal = "";
					// we need to clean the slideSelected class from oldAttrVal
					var styleNameTemp1 = dojo.trim(slideElem.className);
					var styleNameTempArray1 = styleNameTemp1.split(" ");
					if (styleNameTempArray1 != null)
					{
						for ( var i = 0; i < styleNameTempArray1.length; i++)
						{
							if (styleNameTempArray1[i] != "slideSelected")
							{
								oldAttrVal = oldAttrVal + " " + styleNameTempArray1[i];
							}
						}
					}
					oldAttrVal = dojo.trim(oldAttrVal);

					var currMasterFrameStylesJSON = this.getMasterTemplateInfo();
					dojo.removeClass(slideElem, currMasterFrameStylesJSON.draw_page_title + " " + currMasterFrameStylesJSON.draw_page_text);
					// then add the ones from slideWithNewLayout
					var styleName = "";
					var styleNameTemp2 = dojo.trim(slideWithNewLayoutDrawPageClassNames);
					var styleNameTempArray2 = styleNameTemp2.split(" ");
					if (styleNameTempArray2 != null)
					{
						for ( var i = 0; i < styleNameTempArray2.length; i++)
						{
							if (styleNameTempArray2[i] != "slideEditor" && styleNameTempArray2[i] != "slideSelected")
							{
								styleName = styleName + " " + styleNameTempArray2[i];
							}
						}
					}
					styleName = dojo.trim(styleName);
					dojo.addClass(slideElem, styleName);
					var newAttrVal = "";
					// we need to clean the slideSelected class from oldAttrVal
					var styleNameTemp3 = dojo.trim(slideElem.className);
					var styleNameTempArray3 = styleNameTemp3.split(" ");
					if (styleNameTempArray3 != null)
					{
						for ( var i = 0; i < styleNameTempArray3.length; i++)
						{
							if (styleNameTempArray3[i] != "slideSelected")
							{
								newAttrVal = newAttrVal + " " + styleNameTempArray3[i];
							}
						}
					}
					newAttrVal = dojo.trim(newAttrVal);
					// msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slideElem), attrName, newAttrVal, msgPairList, oldAttrVal);

				}

				// update the position and size of the slide with the slideWithNewLayout values
				// get all the draw_frame elements and update the style position, left, top, width, height
				var newLayoutDrawFrames = dojo.query(".draw_frame[presentation_placeholder='true']", slideWithNewLayout);
				if (newLayoutDrawFrames != null)
				{
					// delete background image if any
					// change the backgroundImage if any
					var bgImgDivs = dojo.query(".draw_frame.backgroundImage", slideElem);
					// delete the current background to be replaced with background image div from slide editor
					if (bgImgDivs != null)
					{
						for ( var p = 0; p < bgImgDivs.length; p++)
						{
							var nodeToDeleteId = bgImgDivs[p].id;
							// check if this id exist in slideWithNewLayout
							// for some reason dojo.query using "#" for query id doesn't work with the slideWithNewLayout, may be because it is not attached to any document
							// so try to loop
							var IsExistInSlideWithNewLayout = false;
							var bgFramesInSlideWithNewLayout = dojo.query(".draw_frame.backgroundImage", slideWithNewLayout);
							for ( var y = 0; y < bgFramesInSlideWithNewLayout.length; y++)
							{
								if (bgFramesInSlideWithNewLayout[y].id == nodeToDeleteId)
								{
									IsExistInSlideWithNewLayout = true;
								}
							}
							if (IsExistInSlideWithNewLayout == false)
							{
								// var elem = this.editor.document.getById(nodeToDeleteId);
								// jmt - coeditfix
								// msgPairList = SYNCMSG.createDeleteNodeMsgPair(elem,msgPairList);
								dojo.destroy(bgImgDivs[p]);
							}
						}
					}

					for ( var i = 0; i < newLayoutDrawFrames.length; i++)
					{
						// if drawFrame exist in slideElem, update the style
						var frameElem = newLayoutDrawFrames[i];
						var frameId = frameElem.id;
						var frameInSlideElem = dojo.query("[id=" + frameId + "]", slideElem)[0];
						if (frameInSlideElem != null)
						{
							frameInSlideElem.id = frameElem.id;
							// remove the current draw_frame and replace with the new one
							// var elem = this.editor.document.getById(frameInSlideElem.id);
							// msgPairList =SYNCMSG.createDeleteNodeMsgPair(elem,msgPairList);
							var nextSibling = frameInSlideElem.nextSibling;
							dojo.destroy(frameInSlideElem);
							// then insert the new one
							var newFrameElem = frameElem.cloneNode(true);
							if (dojo.isIE)
							{
								// for some reason in IE, the width and height in draw_text-box element becomes pixels.
								// need to reset to 100%
								var drawTextBoxes = dojo.query(".draw_text-box", newFrameElem);
								if (drawTextBoxes.length > 0)
								{
									drawTextBoxes[0].style.width = "100%";
									drawTextBoxes[0].style.height = "100%";
								}
							}
							if (nextSibling != null)
							{
								slideElem.insertBefore(newFrameElem, nextSibling);
							}
							else
							{
								slideElem.appendChild(newFrameElem);
							}
							// coedit insert frame
							// jmt - coeditfix
							// msgPairList = SYNCMSG.createInsertNodeMsgPair(newFrameElem,msgPairList);
						}
						// if drawFrame doesn't exist in slideElem, insert the new frame to slideElem
						else
						{

							if (dojo.hasClass(frameElem, "backgroundImage"))
							{
								var newFrameElem = frameElem.cloneNode(true);
								if (slideElem.childNodes[i] != null)
								{
									slideElem.insertBefore(newFrameElem, slideElem.childNodes[i]);
								}
								else
								{// if somehow index i node is not available, insert as the first item
									slideElem.insertBefore(newFrameElem, slideElem.firstChild);
								}
							}
							else
							{
								var newFrameElem = frameElem.cloneNode(true);
								slideElem.appendChild(newFrameElem);
							}
							// coedit insert frame
							// jmt - coeditfix
							// msgPairList = SYNCMSG.createInsertNodeMsgPair(newFrameElem,msgPairList);
						}
					}

					// delete all the frames that are not in the new layout
					var slideElemDrawFrames = dojo.query(".draw_frame[presentation_placeholder='true']", slideElem);

					for ( var i = 0; i < slideElemDrawFrames.length; i++)
					{
						// if drawFrame exist in slideElem, update the style
						var frameElem = slideElemDrawFrames[i];
						var frameId = frameElem.id;
						var prezClass = frameElem.getAttribute("presentation_class");
						var isBgImageFrame = dojo.hasClass(frameElem, "backgroundImage");
						var isFrameInNewLayout = false;
						if (isBgImageFrame == false && prezClass != null && prezClass != "header" && prezClass != "footer" && prezClass != "date-time" && prezClass != "page-number")
						{
							for ( var j = 0; j < newLayoutDrawFrames.length; j++)
							{
								var frameNewLayoutElem = newLayoutDrawFrames[j];
								var frameNewLayoutId = frameNewLayoutElem.id;
								if (frameId == frameNewLayoutId)
								{
									isFrameInNewLayout = true;
									break;
								}
							}
							if (isFrameInNewLayout == false)
							{

								// coediting
								// jmt - coeditfix
								// var elem = this.editor.document.getById(frameId);
								// msgPairList =SYNCMSG.createDeleteNodeMsgPair(elem,msgPairList);
								dojo.destroy(frameElem);
							}
						}
					}

				}

			}
		}
	},

	applyLayoutToCurrentSlide: function(resultArray)
	{
		var presPageLayoutName = 'blank';
		if (resultArray.length > 0)
		{
			presPageLayoutName = resultArray[0].layoutName;
		}
		// process the change layout
		// Just send one rn message to layout application(one or multiple)
		this.applyLayoutForMultiSlidesToScene(presPageLayoutName, null, null, null, resultArray);
	}

});