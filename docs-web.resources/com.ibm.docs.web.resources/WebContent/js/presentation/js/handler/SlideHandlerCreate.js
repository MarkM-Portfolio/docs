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

dojo.provide("pres.handler.SlideHandlerCreate");

dojo.require("pres.constants");
dojo.require("pres.model.Document");
dojo.require("pres.msg.Publisher");
dojo.require("pres.utils.htmlHelper");
dojo.require("concord.pres.PresCKUtil");
dojo.require("pres.utils.placeHolderUtil");

PresCKUtil.doUpdateListStyleSheet = function()
{
};

dojo.declare("pres.handler.SlideHandlerCreate", null, {

	createSlide: function(thumb)
	{
		var slides = pe.scene.doc.getSlides();
		var len = slides.length;
		if (len > pres.constants.MAX_SLIDE_NUM - 1)
		{
			this.showSlideNumCheckMsg();
			return;
		}
		var slide = thumb.slide;
		var html = slide.getHTML(null, true, true, false, false);
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

		this.tempMaxZ = slide.getMaxZ();
		var slideElemClicked = dom.firstChild.firstChild;
		// copied from old code
		var newSlide = slideElemClicked.cloneNode(true);
		newSlide.setAttribute("draw_name",pres.utils.helper.getUUID("page"+"_",4));
		
		newSlide = this.removeNewSlideAttributes(newSlide);
		var tfontsize = newSlide.style.fontSize;
		var theight = newSlide.style.height;
		dojo.removeAttr(newSlide, 'style');
		// 29438: [Regression]New slide can't follow slide's portrait page orientation in slide sorter in sample file
		if (tfontsize && tfontsize.length > 0)
		{
			dojo.style(newSlide, 'fontSize', tfontsize);
		}
		if (theight && theight.length > 0)
		{
			dojo.style(newSlide, 'height', theight);
		}
		// D36581: Slide number in new slide lost after export
		// dojo.removeAttr(newSlide,'draw_style-name');
		
		var masterPageName = newSlide.getAttribute("draw_master-page-name");
		var masterHtmlDiv = document.getElementById("masterHtmlDiv");
		var layoutHtmlDiv = document.getElementById("layoutHtmlDiv");
		var masterPageContent = document.getElementById(masterPageName);
		var bCloneEmptySlide = false;
		if (masterHtmlDiv == null || layoutHtmlDiv == null || masterPageContent == null)
		{
			bCloneEmptySlide = true;
		}
		// Update the layout for new page,default we should use "ALT1", which means it is a "Title-outline" layout
		var presPageLayoutName = newSlide.getAttribute("presentation_presentation-page-layout-name");

		if (presPageLayoutName == "ALT0")
		{
			presPageLayoutName = "ALT1";
			dojo.attr(newSlide, "presentation_presentation-page-layout-name", "ALT1");
			// Get a content master page (which has title and outline)
			var properContentMasterPage = this._getContentMasterPage(slideElemClicked, masterHtmlDiv);
			if (properContentMasterPage)
			{
				masterPageContent = properContentMasterPage;
				masterPageName = masterPageContent.getAttribute('id');
				newSlide.setAttribute("draw_master-page-name", masterPageName);
			}
		}

		// Set background image===============================================================
		if (!bCloneEmptySlide)
		{
			// remove all child
			newSlide = newSlide.cloneNode(false);

			var children = masterPageContent.children;
			for ( var i = 0; i < children.length; i++)
			{
				var child = children[i];
				if (child && dojo.hasClass(child, "draw_frame") && dojo.hasClass(child, "backgroundImage"))
				{
					var bgImageNode = child.cloneNode(true);
					bgImageNode.className = "draw_frame  backgroundImage";
					var classNameTemp1 = dojo.trim(child.className);
					var classNameTempArray1 = classNameTemp1.split(" ");
					if (classNameTempArray1 != null)
					{
						for ( var p = 0; p < classNameTempArray1.length; p++)
						{
							if (classNameTempArray1[p] != "draw_frame" && (classNameTempArray1[p].indexOf("draw_") == 0 || classNameTempArray1[p] == "importedImage"))
							{
								dojo.addClass(bgImageNode, classNameTempArray1[p]);
							}
						}
					}
					classNameTempArray1 = null;

					// append file name on the image src url
					// adding file parameter for defect #48341, where browser caches the image by a file currently opened,
					// but when the same image used in a new file, browser doesn't get it from server again, and fail to load
					var imgElems = dojo.query("img", bgImageNode);
					for ( var l = 0; l < imgElems.length; l++)
					{
						var src1 = dojo.attr(imgElems[l], "src1");
						if (!src1)
						{
							src1 = dojo.attr(imgElems[l], "src");
						}
						var src2 = src1 + "?file=" + pe.scene.bean.getUri();
						dojo.attr(imgElems[l], "src", src2);
					}
					newSlide.appendChild(bgImageNode);
				}
			}
		}
		else
		// clone empty placeholder slide
		{
			dojo.query(".draw_frame", newSlide).forEach(function(node)
			{
				if (dojo.hasClass(node, 'regard_as_master_obj' || ((dojo.attr(node, 'draw_layer') != 'backgroundobjects') && (dojo.attr(node, 'draw_layer') != 'backgroundImage'))))
					dojo.destroy(node);
			});
		}

		// TODO !isForPasteFromExtPres
		if (true)
		{
			// we get the placeholder object from the master
			var placeholders = dojo.query(".draw_frame[presentation_placeholder='true']", bCloneEmptySlide ? slideElemClicked : masterPageContent);
			for ( var i = 0; i < placeholders.length; i++)
			{
				var plhlder = placeholders[i];
				var pressClass = plhlder.getAttribute('presentation_class');
				if (this.isSupportedPlaceholderClass(pressClass))
				{
					var divDrawFrame = plhlder.cloneNode(true);
					dojo.addClass(divDrawFrame, "layoutClass");
					// update z-index=========
					var tmpZ = this.tempMaxZ;
					if (tmpZ <= 0)
						tmpZ = 500; // start from 500 so we have enough room to handle multiple sendtoback
					tmpZ = parseInt(tmpZ) + 5;
					this.tempMaxZ = tmpZ;
					divDrawFrame.style.zIndex = tmpZ;
					divDrawFrame.setAttribute('draw_layer', 'layout');
					this._constructDefaultPalceholder(divDrawFrame, pressClass, presPageLayoutName, bCloneEmptySlide);
					newSlide.appendChild(divDrawFrame);
				}
			}

			var IsDocsLayout = newSlide.getAttribute('docs_layout');
			if (IsDocsLayout == 'true')
			{
				// if the layout is our support layout
				// we should apply the layout
				var resultArray = this.getLayoutResultArray(presPageLayoutName);
				if (resultArray.length || (presPageLayoutName == "blank"))
					this.applyLayoutToSlide(resultArray, newSlide);
			}
		}

		// make sure if the slide was added by insert new slide that it has default text
		var speakerNotesNode = dojo.query('[presentation_class = "notes"]', newSlide)[0];
		if (!speakerNotesNode)
		{
			var previousNotes = dojo.query('[presentation_class = "notes"]', slideElemClicked)[0];
			if (previousNotes != undefined)
			{
				var speakerNotesNode = previousNotes.cloneNode(true);
				var nodeToAdjust = null;
				dojo.query(".draw_text-box", speakerNotesNode).forEach(function(node, index, arr)
				{
					if (dojo.attr(node.parentNode, "presentation_class") == "notes")
					{
						nodeToAdjust = node;
					}
				});
				nodeToAdjust = dojo.query(".draw_frame_classes", nodeToAdjust)[0];
				nodeToAdjust.innerHTML = '<p class="defaultContentText cb_notes"><span>' + this.STRINGS.layout_clickToAddSpeakerNotes + '</span></p>';
				dojo.addClass(nodeToAdjust.parentNode.parentNode, "layoutClassSS");
				dojo.style(nodeToAdjust.parentNode.parentNode, "border", "0px solid");
				dojo.addClass(nodeToAdjust.parentNode.parentNode.parentNode, "layoutClass");
				newSlide.appendChild(speakerNotesNode);
			}
		}
		this._postProcessAfterCreatePage(newSlide, slideElemClicked);
		return newSlide;
	},

	updateHeaderFooterFields: function(slideToPaste, slideRefWrapper, creatingSlide, slideNumber)
	{
		// 15090, need to accept array: footer, date time and pagenumbers sometime appears more than one in the slides
		var slideFooter = [];
		var slideDateTime = [];
		var slidePageNumber = [];
		var copyFrames = dojo.query(".draw_frame", slideRefWrapper);
		if (copyFrames != null)
		{
			for ( var i = 0; i < copyFrames.length; i++)
			{
				var presClass = copyFrames[i].getAttribute("presentation_class");
				if (presClass != null && dojo.hasClass(copyFrames[i].parentNode, "draw_page"))
				{
					if (presClass == "footer")
					{
						// slideFooter = dojo.clone(copyFrames[i]);
						slideFooter.push(dojo.clone(copyFrames[i]));
					}
					else if (presClass == "date-time")
					{
						slideDateTime.push(dojo.clone(copyFrames[i]));
					}
					else if (presClass == "page-number")
					{
						slidePageNumber.push(dojo.clone(copyFrames[i]));
					}
				}
			}
		}

		dojo.query('[presentation_class = "footer"]', slideToPaste).forEach(function(node, index, arr)
		{
			if (dojo.hasClass(node.parentNode, "draw_page"))
			{
				dojo.destroy(node);
			}
		});

		var textFixed = null;
		var textDateTimeFormat = null;
		var textLocale = null;
		var referenceSlide = slideToPaste;

		// If a slide is being created then the header and footer information
		// needs to be pulled from the selectedSlide to preserve. If pasted,
		// the information needs to be preserved from the copied slide.
		if (creatingSlide)
		{
			referenceSlide = slideRefWrapper;
		}

		dojo.query('[presentation_class = "date-time"]', referenceSlide).forEach(function(node, index, arr)
		{
			if (dojo.hasClass(node.parentNode, "draw_page"))
			{
				textFixed = dojo.attr(node, "text_fixed");
				textDateTimeFormat = dojo.attr(node, "text_datetime-format");
				textLocale = dojo.attr(node, "text_locale");
			}
		});

		dojo.query('[presentation_class = "date-time"]', slideToPaste).forEach(function(node, index, arr)
		{
			if (dojo.hasClass(node.parentNode, "draw_page"))
			{
				dojo.destroy(node);
			}
		});

		dojo.query('[presentation_class = "page-number"]', slideToPaste).forEach(function(node, index, arr)
		{
			if (dojo.hasClass(node.parentNode, "draw_page"))
			{
				dojo.destroy(node);
			}
		});

		// if(slideFooter != null || slideDateTime != null || slidePageNumber != null) {
		if (slideFooter.length > 0 || slideDateTime.length > 0 || slidePageNumber.length > 0)
		{
			var showOnTitleSlide = dojo.attr(referenceSlide, 'show-on-title');

			// Special case for first slide. If first slide then on insert
			// need to check if the footer, datetime and page number should be
			// shown. If show-on-title is false then need to determine
			// whether the inserted slide should show the footers
			if (slideNumber == 1 && showOnTitleSlide != "true")
			{
				// Grab the second slide footer information
				var nextSlide = pe.scene.doc.getSlides()[slideNumber];
				if (nextSlide)
				{
					var html = nextSlide.getHTML(null, true, true, false, false);
					var nextSlideDom = dojo.create("div", {
						style: {
							position: "absolute",
							top: "-10000px",
							left: "-10000px"
						},
						innerHTML: html
					}, dojo.body());

					var nextSlideWrapper = nextSlideDom.firstChild;
					if (nextSlideWrapper != null)
					{
						var nextSlide = nextSlideWrapper.firstChild;
						slideFooter = [];
						slideDateTime = [];
						slidePageNumber = [];
						var copyNextSlideFrames = dojo.query(".draw_frame", nextSlide);
						if (copyNextSlideFrames != null)
						{
							for ( var i = 0; i < copyNextSlideFrames.length; i++)
							{
								var presClass = copyNextSlideFrames[i].getAttribute("presentation_class");
								if (presClass != null && dojo.hasClass(copyNextSlideFrames[i].parentNode, "draw_page"))
								{
									if (presClass == "footer")
									{
										slideFooter.push(dojo.clone(copyNextSlideFrames[i]));
										dojo.style(slideFooter[slideFooter.length - 1], 'visibility', dojo.style(copyNextSlideFrames[i], 'visibility'));
									}
									else if (presClass == "date-time")
									{
										slideDateTime.push(dojo.clone(copyNextSlideFrames[i]));
										dojo.style(slideDateTime[slideDateTime.length - 1], 'visibility', dojo.style(copyNextSlideFrames[i], 'visibility'));
									}
									else if (presClass == "page-number")
									{
										slidePageNumber.push(dojo.clone(copyNextSlideFrames[i]));
										dojo.style(slidePageNumber[slidePageNumber.length - 1], 'visibility', dojo.style(copyNextSlideFrames[i], 'visibility'));
									}
								}
							}
						}
						dojo.destroy(nextSlideDom);
					}
				}
			}

			for ( var i = 0; i < slideFooter.length; i++)
			{
				slideToPaste.appendChild(slideFooter[i]);
			}

			for ( var i = 0; i < slideDateTime.length; i++)
			{
				// preserve date-time format before append
				dojo.attr(slideDateTime[i], 'text_datetime-format', textDateTimeFormat);
				dojo.attr(slideDateTime[i], 'text_fixed', textFixed);
				dojo.attr(slideDateTime[i], 'text_locale', textLocale);
				slideToPaste.appendChild(slideDateTime[i]);
			}

			for ( var i = 0; i < slidePageNumber.length; i++)
			{
				slideToPaste.appendChild(slidePageNumber[i]);
			}
		}

		// update date time field of headers and footer for newly pasted slide
		var hfu = concord.widgets.headerfooter.headerfooterUtil;
		// TODO, need verify this
		hfu.updateHeaderFooterDateTimeFields(slideToPaste);
		return slideToPaste;
	},

	updateSlideClassToUseMasterClass: function(slideElem, msgPairList)
	{
		if (msgPairList == null)
		{
			msgPairList = new Array();
		}
		if (slideElem != null)
		{
			var presPageLayoutName = slideElem.getAttribute("presentation_presentation-page-layout-name");
			var masterPageName = slideElem.getAttribute("draw_master-page-name");
			var masterDrawPageDiv = masterPageName ? document.getElementById(masterPageName) : null;
			if (masterDrawPageDiv != null)
			{
				// jmt - coeditfix
				var masterPageClass = masterDrawPageDiv.className;
				var attrName = "class";
				var newValue = "draw_page PM1_concord " + masterPageClass.replace(/style_master-page/g, '');
				// msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slideElem), attrName, newValue, msgPairList);
				// update the classes of draw_page also
				// reset the classname to a clean slate
				slideElem.className = "draw_page PM1_concord";
				// add classes from master
				dojo.addClass(slideElem, masterPageClass);
				// remove unnecessary class from master
				dojo.removeClass(slideElem, "style_master-page");
			}
		}
		return msgPairList;
	},

	setSlideId: function(slideElem)
	{
		if (slideElem != null)
		{
			pres.utils.helper.injectRdomIdsForElement(slideElem);
			slideElem.id = 'slide_' + slideElem.id; // JMT D40996
			// set ids for all children elements
			var children = slideElem.getElementsByTagName('*');
			for ( var i = 0; i < children.length; i++)
			{
				// we now need to generate id for span (D47366)
				// if(children[i].tagName != "span" && children[i].tagName != "SPAN"){
				// skip BRs
				if (children[i].tagName.toLowerCase() != "br")
				{
					pres.utils.helper.injectRdomIdsForElement(children[i]);
				}
			}

			// update id/ref for SVG shape, after all the id changed
			var svgNodes = slideElem.getElementsByTagName('svg');
			for ( var j = 0; j < svgNodes.length; ++j)
			{
				concord.util.HtmlContent.checkIdRefForSVGElement(svgNodes[j]);
			} // end for
		}
	},

	refreshPlaceHolder: function(rootNode, bUpdateValue)
	{
		var queryString = "." + pres.constants.CONTENT_BOX_TITLE_CLASS + ",." + pres.constants.CONTENT_BOX_SUBTITLE_CLASS + ",."
		+ pres.constants.CONTENT_BOX_OUTLINE_CLASS + ",." + pres.constants.CONTENT_BOX_GRAPHIC_CLASS + ",." + pres.constants.CONTENT_BOX_NOTES_CLASS;

		var defaultTextLines = dojo.query(queryString, rootNode);

		// result is <p> or <ul>/<ol>
		for ( var i = 0; i < defaultTextLines.length; i++)
		{
			var line = defaultTextLines[i];
			var strPlaceHodler = null;
			if (dojo.hasClass(line, pres.constants.CONTENT_BOX_TITLE_CLASS))
			{
				strPlaceHodler = this.STRINGS.layout_clickToAddTitle;
			}
			else if (dojo.hasClass(line, pres.constants.CONTENT_BOX_SUBTITLE_CLASS))
			{
				strPlaceHodler = this.STRINGS.layout_clickToAddText;
			}
			else if (dojo.hasClass(line, pres.constants.CONTENT_BOX_NOTES_CLASS))
			{
				strPlaceHodler = this.STRINGS.layout_clickToAddSpeakerNotes;
			}
			else if (dojo.hasClass(line, pres.constants.CONTENT_BOX_GRAPHIC_CLASS))
			{
				strPlaceHodler = this.STRINGS.layout_doubleClickToAddGraphics;
			}
			var spanNodes = dojo.query('span', line);
			var spanNode = spanNodes[0];
			if (spanNode)
			{
				if (concord.util.browser.isMobile() && concord.util.mobileUtil.disablePresEditing)
				{
					if (line.nodeName.toLowerCase() == "li")
					{
						dojo.addClass(li, "sys-list-hidden");
					}
					spanNode.innerHTML = "";
				}
				else
				{
					spanNode.innerHTML = strPlaceHodler;
				}
			}

			if (bUpdateValue)
			{
				var masterClass = PresCKUtil.getMasterClass(line, 1);
				if (masterClass)
				{
					var tLine = PresCKUtil.setMasterClass(line, masterClass, true);
					if (tLine)
						line = tLine;
				}
				if (defaultTextLines.length)
					PresCKUtil.updateRelativeValue(line);
			}
		}
	},

	_postProcessAfterCreatePage: function(newSlide, slideElemClicked)
	{

		var sorter = pe.scene.slideSorter;
		var currentThumb = sorter.getCurrentThumb();
		var currentSlide = currentThumb.slide;
		var index = dojo.indexOf(sorter.getChildren(), currentThumb) + 1;

		// update slide numbers
		// make sure that if the slide was added by insert we copy the footer fields from the clickedSlide
		newSlide = this.updateHeaderFooterFields(newSlide, slideElemClicked, true, index);
		// update the classes of draw_page also to use master class
		this.updateSlideClassToUseMasterClass(newSlide);

		// set new id
		this.setSlideId(newSlide);
		
		var wrapper = dojo.create("div", {
			className: "slideWrapper"
		});
		wrapper.appendChild(newSlide);
		wrapper.id = pres.utils.helper.getUUID("slideWrapper_id_");

		
		this.refreshPlaceHolder(newSlide, true);

		EditorUtil.resetListBeforeStyleByFirstSpan(newSlide);

		wrapper.firstChild.style.cssText = "";
		wrapper.firstChild.style.cssText = currentSlide.attr("style") || "";
		
		pres.utils.placeHolderUtil.i18n(newSlide);

		var slide = pres.model.parser.parseSlide(wrapper, true);
		var elements = slide.getElements();
		dojo.forEach(elements, function(e)
		{
			delete e.ids;
		});

		pe.scene.doc.insertSlide(slide, index, null);

		var msg = this.createMsg4InsertSlides([slide]);
		

		// select all pasted slides
		sorter.selectItems(index, index);
		var currentSlideIds = pe.scene.slideSorter.getSelectedIds();
		dojo.destroy(slideElemClicked.parentNode.parentNode);

		
		pe.scene.msgPublisher.putSlideSelection(msg, [currentSlide.wrapperId], currentSlideIds);
		pe.scene.msgPublisher.sendMessage(msg);
		
		// select the new slide
		// this.getNotifyTool().addInsertedSlidesNotifyMsg(newSlide);
	},

	// remove attributes that should not be copied
	removeNewSlideAttributes: function(newSlide)
	{
		var removeAttributes = new Array("commentsId", "comments", "smil_type", "smil_subtype", "smil_direction", "presentation_transition-speed", "smil_fadeColor", "presentation_duration");

		for ( var i = 0; i < removeAttributes.length; i++)
		{
			dojo.removeAttr(newSlide, removeAttributes[i]);
		}

		return newSlide;
	},

	_getContentMasterPage: function(slideElemClicked, _masterHtmlDiv)
	{
		function _IsContentMasterPage(masterPage)
		{
			var titles = dojo.query(".draw_frame[presentation_class='title'][presentation_placeholder='true']", masterPage);
			var outlines = dojo.query(".draw_frame[presentation_class='outline'][presentation_placeholder='true']", masterPage);
			if (titles.length == 1 && (outlines.length >= 1))
				return true;
			return false;
		}

		var masterPageName = slideElemClicked.getAttribute("draw_master-page-name");
		var presPageLayoutName = slideElemClicked.getAttribute("presentation_presentation-page-layout-name");

		// current page is title or unsupported layout
		if (!this.isSupportedLayout(presPageLayoutName) || presPageLayoutName == "ALT0")
		{
			var slideWrapper = slideElemClicked.parentNode;
			if (slideWrapper)
			{
				var slide = dojo.query('.draw_page', slideWrapper)[0];
				var id = slide.id;
				var slideModel = pe.scene.doc.find(id);
				if (slideModel && slideModel instanceof pres.model.Slide)
				{
					var slideIndex = dojo.indexOf(pe.scene.doc.slides, slideModel);
					while (slideModel)
					{
						var layout = slideModel.attr("presentation_presentation-page-layout-name");
						if (layout != "ALT0")
						{
							var mPageName = slideModel.attr("draw_master-page-name");
							var masterPage = document.getElementById(mPageName);
							if (_IsContentMasterPage(masterPage))
							{
								return masterPage;
							}
						}
						if (slideIndex < pe.scene.doc.slides.length - 1)
							slideModel = pe.scene.doc.slides[slideIndex + 1];
						else
							slideModel = null;
						
						slideIndex = slideIndex + 1;
					}
				}
			}
		}
		else
		// supported not title layout, return current master
		{
			// if not find right master page, we return click page's master page
			var masterPage = document.getElementById(masterPageName);
			return masterPage;
		}

		// For other case, search first content master page
		var masterHtmlDiv = _masterHtmlDiv;
		var masterPageList = dojo.query(".style_master-page", masterHtmlDiv);
		for ( var i = 0; i < masterPageList.length; i++)
		{
			var masterPage = masterPageList[i];
			if (_IsContentMasterPage(masterPage))
				return masterPage;
		}

		// Could not find
		return null;

	},

	isSupportedPlaceholderClass: function(PresType)
	{
		if (PresType != null && PresType.length > 0)
		{
			if ((PresType == 'title') || (PresType == 'subtitle') || (PresType == 'outline') || (PresType == 'graphic') || (PresType == 'date-time') || (PresType == 'page-number') || (PresType == 'footer'))
				return true;
		}
		return false;
	},

	isSupportedLayout: function(layoutName)
	{
		var result = false;
		var hub = pe.scene.hub;
		if (layoutName != null && hub.supportedLayoutArray != null)
		{
			result = hub.supportedLayoutArray[layoutName];
			if (result != true)
			{
				result = false;
			}
		}
		return result;
	},

	getLayoutResultArray: function(layoutName)
	{
		var resultArray = [];
		if (layoutName != null && layoutName.length > 0 && this.isSupportedLayout(layoutName))
		{
			var presPageLayoutContent = document.getElementById(layoutName);
			if (presPageLayoutContent != null)
			{
				var objectBoxArray = dojo.query(".draw_frame[presentation_placeholder='true']", presPageLayoutContent);
				if (objectBoxArray != null && objectBoxArray.length > 0)
				{
					var outlineIndex = 1;
					for ( var i = 0; i < objectBoxArray.length; i++)
					{
						var index = 0;
						var presType = dojo.attr(objectBoxArray[i], 'presentation_class');
						if (!this.isSupportedPlaceholderClass(presType))
							presType = 'outline';
						if ((layoutName == "ALT3"||layoutName == "ALT3-RTL") && (presType == 'outline'))// Two outline
						{
							index = outlineIndex;
							outlineIndex++;
						}
						resultArray.push({
							'type': presType,
							'top': objectBoxArray[i].style.top,
							'left': objectBoxArray[i].style.left,
							'height': objectBoxArray[i].style.height,
							'width': objectBoxArray[i].style.width,
							'layoutName': layoutName,
							'index': index
						});

					}
				}
			}
		}
		return resultArray;
	},

	//
	// Apply selected layout to a slide
	// here we don't care about creating msgs for coediting
	applyLayoutToSlide: function(resultArray, slideElem, isFromOtherDocForPasteSlides, needUpdateListStyle)
	{
		// TODO, this function need to be tested.
		if (slideElem == null)
		{
			return slideElem;
		}
		if (resultArray == null)
		{
			resultArray = [];
		}

		// Update new layout info at draw page level (slideEditor level)
		var presPageLayoutName = (resultArray.length > 0) ? resultArray[0].layoutName : "blank";
		dojo.attr(slideElem, 'presentation_presentation-page-layout-name', presPageLayoutName);
		dojo.attr(slideElem, 'docs_layout', 'true');
		// Here it want to remove all empty placeholders
		if (isFromOtherDocForPasteSlides != true)
		{
			var queryString = "." + pres.constants.CONTENT_BOX_TITLE_CLASS + ",." + pres.constants.CONTENT_BOX_SUBTITLE_CLASS + ",." + pres.constants.CONTENT_BOX_OUTLINE_CLASS + ",." + pres.constants.CONTENT_BOX_GRAPHIC_CLASS;

			var defaultTextLines = dojo.query(queryString, slideElem);
			for ( var i = 0; i < defaultTextLines.length; i++)
			{
				var line = defaultTextLines[i];
				// find the drawframe
				var drawFrame = line;
				while (drawFrame)
				{
					if (dojo.hasClass(drawFrame, 'draw_frame'))
						break;
					drawFrame = drawFrame.parentNode;
				}
				if (drawFrame)
					dojo.destroy(drawFrame);
			}
		}

		var masterPageName = dojo.attr(slideElem, 'draw_master-page-name');
		var masterPageContent = document.getElementById(masterPageName);

		// loop through all the objects in the array and check against current slide
		for ( var i = 0; i < resultArray.length; i++)
		{
			var layoutObj = resultArray[i];
			var presClass = layoutObj.type;
			// Check whether we could find such layoutobject in current slide
			var slideDrawFrames = dojo.query(".draw_frame[presentation_class='" + presClass + "'][presentation_placeholder='true']", slideElem);
			var presentObj = null;
			for ( var j = 0; j < slideDrawFrames.length; j++)
			{
				var obj = slideDrawFrames[j];
				if (dojo.hasClass(obj, 'deploied'))
					continue;
				presentObj = obj;
				dojo.addClass(obj, 'deploied');
				break;
			}

			// we need build the layout object according to targte presentation type
			if (!presentObj)
			{
				var contentContainerOrig = null;
				// first find this placeholder from master page
				if (masterPageContent)
				{
					var masterPlaceholders = dojo.query(".draw_frame[presentation_class='" + presClass + "'][presentation_placeholder='true']", masterPageContent);
					if (masterPlaceholders.length)// we use the first object from master page placeholder
						contentContainerOrig = masterPlaceholders[0];
				}

				var bNewedLayoutObj = false;
				// could not find from master page, we try to find from layout data
				if (!contentContainerOrig)
				{
					var presPageLayoutContent = document.getElementById(presPageLayoutName);
					if (presPageLayoutContent != null)
					{
						var contentContainers = dojo.query(".draw_frame[presentation_class='" + presClass + "'][presentation_placeholder='true']", presPageLayoutContent);
						if (contentContainers != null && contentContainers.length > 0)
						{
							var contentContainerOrig = contentContainers[0];// in case of not found
							// try to found "the one" in layout page
							if (contentContainers.length > 1)
							{
								for ( var y = 0; y < contentContainers.length; y++)
								{
									var cc = contentContainers[y];
									if (cc.style.top == layoutObj.top && cc.style.left == layoutObj.left && cc.style.height == layoutObj.height && cc.style.width == layoutObj.width)
									{
										contentContainerOrig = cc;
										bNewedLayoutObj = true;
										break;
									}
								}
							}
						}
					}
				}

				if (contentContainerOrig)
				{
					var divDrawFrame = contentContainerOrig.cloneNode(true);
					dojo.addClass(divDrawFrame, "layoutClass");
					// TODO : we should check master page to see whether it has index support
					// if not, we should not add this attribute
					// var index = parseInt(layoutObj.index);
					// if(index!=0)
					// {
					// divDrawFrame.setAttribute('presentation_placeholder_index',index);
					// }

					// update z-index=========
					var tmpZ = this.tempMaxZ;
					if (tmpZ <= 0)
						tmpZ = 500; // start from 500 so we have enough room to handle multiple sendtoback
					tmpZ = parseInt(tmpZ) + 5;
					divDrawFrame.style.zIndex = tmpZ;
					this.tempMaxZ = tmpZ;
					divDrawFrame.setAttribute('draw_layer', 'layout');
					this._constructDefaultPalceholder(divDrawFrame, presClass, presPageLayoutName);
					this.setFrameId(divDrawFrame);
					slideElem.appendChild(divDrawFrame);
					dojo.addClass(divDrawFrame, 'deploied');
					if (bNewedLayoutObj)
					{
						dojo.query('p,li', divDrawFrame).forEach(function(node)
						{
							dojo.addClass(node, 'default_' + presClass + '_style');
							if (node.tagName.toLowerCase() == "li")
							{
								dojo.addClass(node, 'lst-c');
							}
						});
					}

					presentObj = divDrawFrame;
				}

			}
			if (presentObj)
			{
				// Update position
				var pos = {
					'top': layoutObj.top,
					'left': layoutObj.left,
					'height': layoutObj.height,
					'width': layoutObj.width
				};
				if (dojo.attr(presentObj, 'presentation_class') == "graphic" || dojo.attr(presentObj, 'presentation_class') == "group")
				{
					// adjust the position ONLY according to layout position, we don't want to resize the image
					dojo.style(presentObj, {
						'top': pos.top,
						'left': pos.left,
						'position': 'absolute'
					});
				}
				else
				{
					// adjust the size and position according to layout position
					dojo.style(presentObj, {
						'top': pos.top,
						'left': pos.left,
						'height': pos.height,
						'width': pos.width,
						'position': 'absolute'
					});
				}
			}
			else
			{
				console.error('we found one missing presentation object:' + presClass + ' in layout : ' + presPageLayoutName);
			}

		}
		// clean up temp flag
		dojo.query(".deploied", slideElem).forEach(function(node)
		{
			dojo.removeClass(node, 'deploied');
		});

		// here we just need to build the new slide with new layout
		// the following things leave this.applyLayout to take.
		// //////////////////////////////////////////////////////////////////
		this.refreshPlaceHolder(slideElem, true);
		PresCKUtil.updateRelativeValue(slideElem);

		if (needUpdateListStyle)
		{
			//PresCKUtil.copyAllFirstSpanStyleToILBefore(slideElem, ['font-size']);
			EditorUtil.resetListBeforeStyleByFirstSpan(slideElem);
		}
		
		pres.utils.placeHolderUtil.i18n(slideElem);
	},

	// set slide elements id with new UUID
	setFrameId: function(frameElem)
	{
		if (frameElem != null)
		{
			pres.utils.helper.injectRdomIdsForElement(frameElem);
			// set ids for all children elements
			var children = frameElem.getElementsByTagName('*');
			for ( var i = 0; i < children.length; i++)
			{
				pres.utils.helper.injectRdomIdsForElement(children[i]);
			}
		}
	},
	// set slide elements id with new UUID
	setDivIdWithChildren: function(divElem)
	{
		if (divElem != null)
		{
			this.setFrameId(divElem);
		}
	},

	// this function is to build content fot this placeholder textbox according presPageLayoutName
	// Same function reference addPlaceHolderContent //TODO
	_constructDefaultPalceholder: function(divDrawFrame, presClass, layoutName, bOnlyRemoveText)
	{
		function _buildContentForPlaceholder(divPlaceholder)
		{
			this.STRINGS = dojo.i18n.getLocalization("concord.widgets", "slidesorter");
			if (presClass == "title")
			{
				var titleHtml = '<p odf_element="text:p" class="defaultContentText ' + pres.constants.CONTENT_BOX_TITLE_CLASS + '"><span>this.STRINGS.layout_clickToAddTitle</span><br class="hideInIE"></p>';
				divPlaceholder.innerHTML = titleHtml;
			}
			else if (presClass == "subtitle")
			{
				var subtitleHTML = "";
				if (layoutName == "ALT32")
				{ // centered text but using presentationClass "subtitle"
					subtitleHtml = '<p odf_element="text:p" class="defaultContentText ' + pres.constants.CONTENT_BOX_OUTLINE_CLASS + ' centerTextAlign"><span>this.STRINGS.layout_clickToAddText2</span><br class="hideInIE"></p>';
					// this.STRINGS.layout_clickToAddText currently says" double click to add subtitle", we need to add new nls string to say:"double click to add text" for centered text layout
					// drawFrameClassDiv.style.verticalAlign = "middle";
					dojo.addClass(divPlaceholder, "centerVerticalAlign");
				}
				else
				{
					subtitleHtml = '<p odf_element="text:p" class="defaultContentText ' + pres.constants.CONTENT_BOX_SUBTITLE_CLASS + '"><span>this.STRINGS.layout_clickToAddText</span><br class="hideInIE"></p>';
				}
				if (layoutName == "ALT0")// title,subtile
				{
					dojo.style(divPlaceholder, 'color', '#8B8B8B');
					dojo.addClass(divPlaceholder, "centerTextAlign");
					dojo.addClass(divPlaceholder, "centerVerticalAlign");
				}
				divPlaceholder.innerHTML = subtitleHtml;
			}
			else if (presClass == "outline")
			{
				var rtlStyle = (layoutName && layoutName.indexOf("-RTL") != -1) ? 'style="direction: rtl;text-align:right"' : '';
				var outlineHtmlStr = '<ul class="text_list" odf_element="text:list"><li ' + rtlStyle + ' class="text_list-item defaultContentText ' + pres.constants.CONTENT_BOX_OUTLINE_CLASS + '"><span>this.STRINGS.layout_clickToAddOutline</span><br class="hideInIE"></li></ul>';
				divPlaceholder.innerHTML = outlineHtmlStr;
			}
			else if (presClass == "graphic")
			{
				var imgHtmlStr = '<img src="' + window.contextPath + window.staticRootPath + '/images/imgPlaceholder.png" class="defaultContentImage" style="position: absolute; left: 39%; top: 39%; height: 25%; width: 25%;" alt="">';
				var textStr = '<p odf_element="text:p" class="defaultContentText ' + pres.constants.CONTENT_BOX_GRAPHIC_CLASS + '"><span>this.STRINGS.layout_clickToAddText</span><br class="hideInIE"></p>';
				var contentHtmlStr = '<div style="position: absolute; top: 5%; width: 100%; text-align:center;">' + textStr + '</div>';

				divPlaceholder.innerHTML = imgHtmlStr + contentHtmlStr;
			}
			else if (presClass == "page-number" || presClass == "date-time" || presClass == "footer" || presClass == "header")
			{
				// Nothing todo

			}
			else
			{
				divPlaceholder.innerHTML = "";
			}
		}

		// Return the drawframe node
		function _buildPlaceholderDiv(placeHolderContent, _frameClassesArray)
		{
			if (presClass == 'graphic')
			{
				var children = dojo.query("*", placeHolderContent);
				for ( var x = 0; x < children.length; x++)
				{
					dojo.destroy(children[x]);
				}
				var vGraphicDiv = document.createElement("div");
				vGraphicDiv.className = "imgContainer layoutClassSS";
				_buildContentForPlaceholder(vGraphicDiv);
				placeHolderContent.appendChild(vGraphicDiv);
			}
			else
			{
				dojo.addClass(placeHolderContent, "layoutClassSS");
				// clean the text box, remove existing children of the text box if any
				if (bOnlyRemoveText)
				{
					var divDisplayTableCell = dojo.query(".draw_frame_classes", placeHolderContent)[0];
					var children = dojo.query("*", divDisplayTableCell);
					for ( var x = 0; x < children.length; x++)
					{
						dojo.destroy(children[x]);
					}
					_buildContentForPlaceholder(divDisplayTableCell);
				}
				else
				{
					var children = dojo.query("*", placeHolderContent);
					for ( var x = 0; x < children.length; x++)
					{
						dojo.destroy(children[x]);
					}
					dojo.addClass(placeHolderContent, "layoutClassSS");
					placeHolderContent.style.height = "100%";
					placeHolderContent.style.width = "100%";
					dijit.setWaiRole(placeHolderContent, 'textbox');
					if (presClass == 'title' || presClass == 'subtitle')
						dijit.setWaiState(placeHolderContent, 'labelledby', 'P_arialabel_Textbox');
					var divDisplayTable = document.createElement("div");
					divDisplayTable.style.display = "table";
					divDisplayTable.style.height = "100%";
					divDisplayTable.style.width = "100%";
					dijit.setWaiRole(divDisplayTable, 'presentation');
					dojo.attr(divDisplayTable, "tabindex", "0");

					var divDisplayTableCell = document.createElement("div");
					divDisplayTableCell.style.display = "table-cell";
					divDisplayTableCell.style.height = "100%";
					divDisplayTableCell.style.width = "100%";
					dijit.setWaiRole(divDisplayTableCell, 'presentation');
					dojo.addClass(divDisplayTableCell, "draw_frame_classes ");
					// remove class from frame level to displayTableCell level div
					for ( var i = 0; i < _frameClassesArray.length; i++)
					{
						if (_frameClassesArray[i] != "draw_frame" && _frameClassesArray[i] != "layoutClass")
						{
							dojo.addClass(divDisplayTableCell, _frameClassesArray[i]);
						}
					}
					_buildContentForPlaceholder(divDisplayTableCell);
					divDisplayTable.appendChild(divDisplayTableCell);
					placeHolderContent.appendChild(divDisplayTable);
				}
				if (presClass == "page-number" || presClass == "date-time" || presClass == "footer" || presClass == "header")
				{
					var frameClassesStr = divDrawFrame.className;
					var frameClassesArray = frameClassesStr.split(" ");
					for ( var i = 0; i < frameClassesArray.length; i++)
					{
						if (frameClassesArray[i] != "draw_frame")
						{
							dojo.removeClass(divDrawFrame, frameClassesArray[i]);
						}
					}
					// set frame to hidden for now, currently not supported
					divDrawFrame.style.visibility = "hidden";
				}
				divDrawFrame.appendChild(placeHolderContent);
			}
		}

		// ==============

		// remove classes from frame level, needs to be inserted to the displaytableCell div due to change in slide structure
		var frameClassesStr = divDrawFrame.className;
		var frameClassesArray = frameClassesStr.split(" ");
		for ( var i = 0; i < frameClassesArray.length; i++)
		{
			if (frameClassesArray[i] != "draw_frame" && frameClassesArray[i] != "layoutClass")
			{
				dojo.removeClass(divDrawFrame, frameClassesArray[i]);
			}
		}

		if ((divDrawFrame.children != null) && (divDrawFrame.children.length > 0))
		{
			for ( var y = 0; y < divDrawFrame.children.length; y++)
			{
				_buildPlaceholderDiv(divDrawFrame.children[y], frameClassesArray);
			}
		}
		else if (presClass == 'graphic')
		{
			_buildPlaceholderDiv(divDrawFrame, frameClassesArray);
		}
	}

});
