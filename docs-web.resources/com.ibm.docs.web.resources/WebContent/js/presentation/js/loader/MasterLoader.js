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

dojo.provide("pres.loader.MasterLoader");
dojo.require("pres.model.Document");
dojo.require("concord.util.uri");

pres.loader.MasterLoader = {

	currMaster: {
		"masterName": "",
		"masterPages": [{
			"name": ""
		}, {
			"name": ""
		}],
		"masterTemplateDataJSONStr": ""
	},

	currMasterFrameStylesJSON: {
		"title": "",
		"subtitle": "",
		"text_title": "",
		"text_outline": "",
		"default_text": "",
		"default_title": "",
		"masterStyleCss": "",
		"footer": "",
		"datetime": "",
		"pagenumber": "",
		"text_footer": "",
		"text_datetime": "",
		"text_pagenumber": ""
	},

	cancel: function()
	{
		this.dfd && this.dfd.cancel();
	},

	start: function(chunkId)
	{
		this.cancel();
		var masterHTMLUrl = concord.util.uri.getEditAttUri("master.html");
		var masterStyleUrl = concord.util.uri.getEditAttUri("office_styles.css");
		if (masterStyleUrl != null)
		{
			var paramIdx = masterStyleUrl.indexOf("?");
			if (paramIdx >= 0)
			{
				masterStyleUrl = masterStyleUrl.substring(0, paramIdx);
			}
		}

		this.dfd = new dojo.Deferred();

		dojo.xhrGet({
			url: masterHTMLUrl,
			handleAs: "text",
			preventCache: true
		}).then(dojo.hitch(this, function(data)
		{
			this._loaded(data, masterStyleUrl);
		}), function(err)
		{
			this.dfd.reject();
		});

		return this.dfd;
	},

	/*
	 * defect 8759 needs to update url in content.html that contains old/previous build number (staticRootpath) just in case the server keeps a different build number in the url
	 */
	/*
	 * #9611 - no need to update static root path this way, moving out master styles files to other location that is not affected by static root path/build number //Code was removed by #27400
	 */

	// to update old version of templateDesignGallery location
	_updateTemplateDesignGalleryUrl: function(htmlStr)
	{
		if (htmlStr != null && htmlStr.indexOf("/js/concord/widgets/templateDesignGallery/") >= 0)
		{
			htmlStr = htmlStr.replace(/src\s*=\s*"[^<]*\/js\/concord\/widgets\/templateDesignGallery\//g, 'src="' + window.contextPath + "/presTemplateDesignGallery/");
			htmlStr = htmlStr.replace(/src\s*=\s*'[^<]*\/js\/concord\/widgets\/templateDesignGallery\//g, "src='" + window.contextPath + "/presTemplateDesignGallery/");
			htmlStr = htmlStr.replace(/src1\s*=\s*"[^<]*\/js\/concord\/widgets\/templateDesignGallery\//g, 'src1="' + window.contextPath + "/presTemplateDesignGallery/");
			htmlStr = htmlStr.replace(/src1\s*=\s*'[^<]*\/js\/concord\/widgets\/templateDesignGallery\//g, "src1='" + window.contextPath + "/presTemplateDesignGallery/");
			htmlStr = htmlStr.replace(/masterstylecss\s*=\s*"[^<]*\/js\/concord\/widgets\/templateDesignGallery\//g, 'masterstylecss="' + window.contextPath + "/presTemplateDesignGallery/");
			htmlStr = htmlStr.replace(/masterstylecss\s*=\s*'[^<]*\/js\/concord\/widgets\/templateDesignGallery\//g, "masterstylecss='" + window.contextPath + "/presTemplateDesignGallery/");
		}
		return htmlStr;
	},

	saveMasterToFile: function(sData)
	{
		var saveMasterUrl = window.contextPath + "/SaveTemplateServlet";
		var bean = pe.session.bean;
		var saveMasterUrlWithParam = saveMasterUrl + "?docUri=" + bean.getUri() + "&repoId=" + bean.getRepository() + "&ownerId=" + bean.getOwner();
		if (sData == null)
		{
			var masterHtmlDiv = document.getElementById("masterHtmlDiv");
			sData = masterHtmlDiv.innerHTML;
		}
		dojo.xhrPost({
			url: saveMasterUrlWithParam,
			handleAs: "json",
			sync: false,
			contentType: "text/plain",
			postData: sData
		});
	},

	guessTitlePageAndOutlinePageMasterUsed: function(masterHtmlDiv)
	{
		var masterObj = {};
		var doc = pe.scene.doc;
		var titleMasterPageName = null;
		var outlineMasterPageName = null;

		// if there is presentation_layout_name in the slides, investigate what master is used by ALT0 (title page) and what master is used by ALT1 or others
		var titlePageSlides = doc.findAttr("presentation_presentation-page-layout-name", "ALT0");
		var outlinePageSlides = doc.findAttr("presentation_presentation-page-layout-name", "ALT1");
		// if outlinePageSlides not available, just use any of the slide that has presentation-page-layout-name attribute that is not ALT0.
		var otherPageSlides = doc.findAttr("presentation_presentation-page-layout-name", null);
		var centeredPageSlides = doc.findAttr("presentation_presentation-page-layout-name", "ALT32");

		var subtitleDrawFrames = doc.findAttr("presentation_class", "subtitle");
		var outlineDrawFrames = doc.findAttr("presentation_class", "outline");

		// try find title page slide using Title only layout
		var titlePageSlides2 = doc.findAttr("presentation_presentation-page-layout-name", "ALT19");

		var outlineKeepGuessing = false;

		// get titleMasterPageName
		// try to inspect the slides first
		if (titlePageSlides.length > 0)
		{ // if there is a title page slide, just use the first one
			var titlePageSlide = titlePageSlides[0];
			titleMasterPageName = titlePageSlide.attr("draw_master-page-name");
		}
		else if (subtitleDrawFrames.length > 0)
		{ // if there is presentation class subtitle, use this slide master page
			var titlePageSlide = subtitleDrawFrames[0].parent;
			// sometimes ALT32 (centered text) with drawframe subtitle is used for title page too, but we want to rule out this time, will consider later
			// we want to get the pure title page here so we get the intended subtitle for title page
			if (titlePageSlide.attr("presentation_presentation-page-layout-name") != "ALT32")
			{
				titleMasterPageName = titlePageSlide.attr("draw_master-page-name");
			}
		}
		else if (titlePageSlides2.length > 0)
		{ // if there is a title page slide with alt19, just use the first one
			var titlePageSlide = titlePageSlides2[0];
			titleMasterPageName = titlePageSlide.attr("draw_master-page-name");
		}
		else if (centeredPageSlides.length > 0)
		{
			var titlePageSlide = centeredPageSlides[0];
			titleMasterPageName = titlePageSlide.attr("draw_master-page-name");
		}
		else
		{
			// if there is no clue
			// try use/asume the first slide as title slide if there is no presentation_presentation-page-layout-name attr
			// if it has presentation_presentation-page-layout-name attr meaning it is not title slide (and by this point) the presentation_presentation-page-layout-name attr must be NOT ALT0 or ALT19
			if (doc.slides != null && doc.slides.length > 0 && !doc.slides[0].attr("presentation_presentation-page-layout-name"))
			{
				var titlePageSlide = doc.slides[0];
				titleMasterPageName = titlePageSlide.attr("draw_master-page-name");
			}
			else
			{
				// if there is no ALT0 page layout name defined, e.g. no presentation_presentation-page-layout-name attribute
				// and no clue from the slides,
				// look at master-page and see if it has subtitle master-page
				var subtitlePresClass = dojo.query("[presentation_class='subtitle']", masterHtmlDiv);
				if (subtitlePresClass.length > 0)
				{
					for ( var k = 0; k < subtitlePresClass.length; k++)
					{
						if (dojo.hasClass(subtitlePresClass[k].parentNode, "style_master-page"))
						{
							titleMasterPage = subtitlePresClass[k].parentNode;
							break;
						}
					}
				}
				else
				{// if still doesn't have it, just use the first master
					var masterPages = dojo.query(".style_master-page", masterHtmlDiv);
					if (masterPages.length > 0)
					{
						titleMasterPage = masterPages[0];
					}
				}
				if (titleMasterPage != null)
				{
					titleMasterPageName = titleMasterPage.id;
				}
			}
		}

		if (outlinePageSlides.length > 0)
		{
			var outlinePageSlide = outlinePageSlides[0];
			outlineMasterPageName = outlinePageSlide.attr("draw_master-page-name");
		}
		else if (outlineDrawFrames.length > 0)
		{
			var outlinePageSlide = outlineDrawFrames[0].parent;
			outlineMasterPageName = outlinePageSlide.attr("draw_master-page-name");
		}
		else if (otherPageSlides.length > 0)
		{
			for ( var m = 0; m < otherPageSlides.length; m++)
			{
				var otherPageSlide = otherPageSlides[m];
				if (otherPageSlide.attr("presentation_presentation-page-layout-name") != "ALT0" && otherPageSlide.attr("presentation_presentation-page-layout-name") != "ALT19")
				{
					// if(otherPageSlide.id != this.slides[0].id){ //if this is not the first slide, use it.First slide may be title page so not for outline
					outlineMasterPageName = otherPageSlide.attr("draw_master-page-name");
					break;
					// }
				}
			}
		}
		if (outlineMasterPageName == null)
		{
			outlineKeepGuessing = true;
		}
		if (outlineKeepGuessing == true)
		{
			// if there is no clue, just use/asume the second slide as outline slide
			if (doc.slides != null && doc.slides.length > 1)
			{
				var outlinePageSlide = doc.slides[1];
				outlineMasterPageName = outlinePageSlide.attr("draw_master-page-name");
			}
			else
			{
				// if there is no ALT1 page layout name defined, e.g. no presentation_presentation-page-layout-name attribute
				// and no clue from the slides,
				// look at master-page and see if it has subtitle master-page
				var outlinePresClass = dojo.query("[presentation_class='outline']", masterHtmlDiv);
				var outlineMasterPage = null;
				if (outlinePresClass.length > 0)
				{
					for ( var k = 0; k < outlinePresClass.length; k++)
					{
						if (dojo.hasClass(outlinePresClass[k].parentNode, "style_master-page"))
						{
							outlineMasterPage = outlinePresClass[k].parentNode;
							break;
						}
					}
				}
				else
				{
					var masterPages = dojo.query(".style_master-page", masterHtmlDiv);
					if (masterPages.length > 1)
					{ // use the second masterPage instead
						outlineMasterPage = masterPages[1];
					}

				}
				if (outlineMasterPage != null)
				{
					outlineMasterPageName = outlineMasterPage.id;
				}
			}
		}

		masterObj.titleMasterPageName = titleMasterPageName;
		masterObj.outlineMasterPageName = outlineMasterPageName;

		return masterObj;
	},

	_loaded: function(masterHtmlStr, masterStyleUrl)
	{
		// defect 8759 - check if there is a need to update src in master just
		// in case static root path has change
		// if(this.docStaticRootPath != this.newStaticRootPath){
		// masterHtmlStr = this._updateStaticRootPathInURL(masterHtmlStr,
		// this.newStaticRootPath, this.docStaticRootPath);
		// #9611 - templateDesignGallery folder has moved out of js folder, need
		// to update if the file still has the old url
		var origMasterHtmlStr = masterHtmlStr;
		masterHtmlStr = this._updateTemplateDesignGalleryUrl(masterHtmlStr);
		if (origMasterHtmlStr != masterHtmlStr)
		{
			this.saveMasterToFile(masterHtmlStr);
		}
		var masterHtmlDiv = dojo.create("div", {
			id: "masterHtmlDiv",
			style: {
				visibility: "hidden",
				display: "none",
				position: "absolute",
				opacity: "0",
				top: "-10000px",
				left: "-10000px"
			}
		}, dojo.body());
		masterHtmlDiv.innerHTML = masterHtmlStr;
		var titleMasterPage = null;
		var titleMasterPageName = null;
		var outlineMasterPage = null;
		var outlineMasterPageName = null;
		// update current master info
		var doc = pe.scene.doc;
		var masterPages = dojo.query(".style_master-page", masterHtmlDiv);
		if (masterPages)
		{
			if (masterPages.length == 0)
			{

			}
			else if (masterPages.length == 1)
			{
				titleMasterPage = masterPages[0];
				titleMasterPageName = titleMasterPage.id;
				outlineMasterPage = masterPages[0];
				outlineMasterPageName = outlineMasterPage.id;
			}

			else if (masterPages.length == 2 || masterPages.length % 2 == 0)
			{
				// check the first master page if it contains
				// "Subtitle", if it is assign it to titleMasterPage
				var titleMasterPageFoundInSlide = false;
				var subtitlePresClass = dojo.query("[presentation_class='subtitle']", masterPages[0]);
				if (subtitlePresClass.length > 0)
				{
					titleMasterPage = masterPages[0];
				}
				else
				{
					subtitlePresClass = dojo.query("[presentation_class='subtitle']", masterPages[1]);
					if (subtitlePresClass.length > 0)
					{
						titleMasterPage = masterPages[1];
					}
				}

				if (titleMasterPage != null)
				{
					titleMasterPageName = titleMasterPage.id;
					// check if titleMasterPageName found is really used
					// in slides
					var titleSlides = doc.findAttr("draw_master-page-name", titleMasterPageName, true);
					if (titleSlides.length > 0)
					{
						titleMasterPageFoundInSlide = true;
					}
				}

				// //check the first master page if it contains
				// "outline", if it is assign it to titleMasterPage
				var outlineMasterPageFoundInSlide = false;
				var outlinePresClass = dojo.query("[presentation_class='outline']", masterPages[0]);
				if (outlinePresClass.length > 0)
				{
					outlineMasterPage = masterPages[0];
				}
				else
				{
					outlinePresClass = dojo.query("[presentation_class='outline']", masterPages[1]);
					if (outlinePresClass.length > 0)
					{
						outlineMasterPage = masterPages[1];
					}
				}
				if (outlineMasterPage != null)
				{
					outlineMasterPageName = outlineMasterPage.id;
					// check if titleMasterPageName found is really used
					// in slides
					var outlineSlides = doc.findAttr("draw_master-page-name", outlineMasterPageName, true);
					if (outlineSlides.length > 0)
					{
						outlineMasterPageFoundInSlide = true;
					}
				}

				// if one or the other is not found, check whether the
				// slides has the layout we are looking for..
				// if it doesn't have it meaning the master page may
				// still be valid only is not used yet, we still can use
				// the master page we found
				if (titleMasterPageFoundInSlide == true && outlineMasterPageFoundInSlide != true)
				{
					// look if presClass other than ALT0 exists in
					// document, if it doesn't,we still can use the
					// outlineMasterPage we found
					var otherPageSlides = doc.findAttr("presentation_presentation-page-layout-name", null);
					var outlineSlideFound = false;
					if (otherPageSlides.length > 0)
					{
						for ( var m = 0; m < otherPageSlides.length; m++)
						{
							var otherPageSlide = otherPageSlides[m];
							if (otherPageSlide.attrs["presentation_presentation-page-layout-name"] && otherPageSlide.attrs["presentation_presentation-page-layout-name"] != "ALT0")
							{
								outlineSlideFound = true;
								break;
							}
						}
						if (outlineSlideFound == true)
						{
							// if itis found, we need to guess from the
							// slides
							var masterObj = this.guessTitlePageAndOutlinePageMasterUsed(masterHtmlDiv);
							if (masterObj != null)
							{
								outlineMasterPageName = masterObj.outlineMasterPageName;
							}
						}
						else if (outlineMasterPage != null)
						{ // if not found, meaning there is no
							// outline related layout used yet,
							// still keep using the one found from
							// master page
							outlineMasterPageName = outlineMasterPage.id;
						}
					}
				}
				else if (titleMasterPageFoundInSlide != true && outlineMasterPageFoundInSlide == true)
				{
					// look if presClass ALT0 exists in document, if
					// it doesn't,we still can use the
					// outlineMasterPage we found
					var titlePageSlides = doc.findAttr("presentation_presentation-page-layout-name", "ALT0", true);
					var titleSlideFound = false;
					if (titlePageSlides.length > 0)
					{
						titleSlideFound = true;
					}
					if (titleSlideFound == true)
					{
						// if itis found, we need to guess from the
						// slides
						var masterObj = this.guessTitlePageAndOutlinePageMasterUsed(masterHtmlDiv);
						if (masterObj != null)
						{
							titleMasterPageName = masterObj.titleMasterPageName;

						}
					}
					else if (titleMasterPage != null)
					{// if not found, meaning there is no
						// outline related layout used yet,
						// still keep using the one found from
						// master page
						titleMasterPageName = titleMasterPage.id;
					}
				}
				else
				{ // if the both master pages we found from
					// masterpage are not used in the slides, keep
					// guessing or if we haven't found both master
					// pages
					var masterObj = this.guessTitlePageAndOutlinePageMasterUsed(masterHtmlDiv);
					if (masterObj != null)
					{
						titleMasterPageName = masterObj.titleMasterPageName;
						outlineMasterPageName = masterObj.outlineMasterPageName;

					}
				}

			}

			else if (masterPages.length >= 2)
			{ // if master pages length is greater than 2 --
				// confused, no need to rely on master pages but try
				// to look at the slides in the documents
				var masterObj = this.guessTitlePageAndOutlinePageMasterUsed(masterHtmlDiv);
				if (masterObj != null)
				{
					titleMasterPageName = masterObj.titleMasterPageName;
					outlineMasterPageName = masterObj.outlineMasterPageName;

				}
			}

			if (titleMasterPageName != null)
			{
				this.currMaster.masterPages[0].name = titleMasterPageName;
			}
			else
			{

				this.currMaster.masterPages[0].name = masterPages[0].id;
			}
			if (outlineMasterPageName != null)
			{
				this.currMaster.masterPages[1].name = outlineMasterPageName;
			}
			else
			{
				this.currMaster.masterPages[1].name = masterPages[1].id;
			}
			this.currMaster.masterName = this.currMaster.masterPages[0].name;
			this.currMaster.masterCount = masterPages.length;

			var styleCss = masterPages[0].getAttribute("masterStyleCss");
			if (styleCss != null && styleCss != "")
			{
				masterStyleUrl = styleCss;
			}
			this.currMasterFrameStylesJSON = this.getCurrentMasterStyles(masterStyleUrl);
			this.currMaster.masterTemplateDataJSONStr = dojo.toJson(this.createTemplateDataJsonFromCurrMaster());
			this.currMasterFrameStylesJSON.currMaster = this.currMaster;

			var masterStyleDiv = document.getElementById(PresConstants.MASTER_STYLE_MODEL_VALUE);
			var defModelDiv = document.getElementById(PresConstants.DEFAULT_COMMON_STYLE);
			if (masterStyleDiv && (!defModelDiv))
			{
				var dDiv = dojo.create("div", {
					innerHTML: PresConstants.DEFAULT_COMMON_STYLE_STRING
				}, null);
				masterStyleDiv.appendChild(dDiv.firstChild.firstChild);
				// this.refreshPlaceHolder(this.editor.document.$);
			}
		}

		var data = {
			'currMasterFrameStylesJSON': this.currMasterFrameStylesJSON,
			'currMaster': this.currMaster,
			'isFromLoadMasterHtml': true,
			'masterHtmlDiv': masterHtmlDiv
		};

		this.dfd.resolve(data);
	},

	getCurrentMasterStyles: function(masterStyleCss)
	{
		var currMasterStylesJson = {};
		currMasterStylesJson.draw_page_title = "";
		currMasterStylesJson.draw_page_text = "";
		currMasterStylesJson.title = "";
		currMasterStylesJson.subtitle = "";
		currMasterStylesJson.text_title = "";
		currMasterStylesJson.text_outline = "";
		currMasterStylesJson.default_title = "";
		currMasterStylesJson.default_text = "";
		currMasterStylesJson.masterStyleCss = "";
		currMasterStylesJson.footer = "";
		currMasterStylesJson.pagenumber = "";
		currMasterStylesJson.datetime = "";
		currMasterStylesJson.text_footer = "";
		currMasterStylesJson.text_pagenumber = "";
		currMasterStylesJson.text_datetime = "";

		// retrieve from currMasterDiv
		// process title page master first
		var currMasterId = this.currMaster.masterPages[0].name;
		// get title
		var presClassString = "title";
		currMasterStylesJson.title = this.getMasterFrameStyle(currMasterId, presClassString);

		// get subtitle
		var presClassString = "subtitle";
		currMasterStylesJson.subtitle = this.getMasterFrameStyle(currMasterId, presClassString);

		// get footer
		var presClassString = "footer";
		currMasterStylesJson.footer = this.getMasterFrameStyle(currMasterId, presClassString);

		// get date-time
		var presClassString = "date-time";
		currMasterStylesJson.datetime = this.getMasterFrameStyle(currMasterId, presClassString);

		// get page-number
		var presClassString = "page-number";
		currMasterStylesJson.pagenumber = this.getMasterFrameStyle(currMasterId, presClassString);

		// get default title
		var presClassString = "";
		currMasterStylesJson.default_title = this.getMasterFrameStyle(currMasterId, presClassString);
		if (currMasterStylesJson.default_title == null || currMasterStylesJson.default_title == "")
		{
			currMasterStylesJson.default_title = "standard";
		}
		// get draw_page styles
		var presClassString = "draw_page";
		currMasterStylesJson.draw_page_title = this.getMasterFrameStyle(currMasterId, presClassString);

		// process outline page master
		currMasterId = this.currMaster.masterPages[1].name;
		// get title
		var presClassString = "title";
		currMasterStylesJson.text_title = this.getMasterFrameStyle(currMasterId, presClassString);

		// get outline
		var presClassString = "outline";
		currMasterStylesJson.text_outline = this.getMasterFrameStyle(currMasterId, presClassString);

		// get footer
		var presClassString = "footer";
		currMasterStylesJson.text_footer = this.getMasterFrameStyle(currMasterId, presClassString);

		// get date-time
		var presClassString = "date-time";
		currMasterStylesJson.text_datetime = this.getMasterFrameStyle(currMasterId, presClassString);

		// get page-number
		var presClassString = "page-number";
		currMasterStylesJson.text_pagenumber = this.getMasterFrameStyle(currMasterId, presClassString);

		// get default text
		var presClassString = "";
		currMasterStylesJson.default_text = this.getMasterFrameStyle(currMasterId, presClassString);
		if (currMasterStylesJson.default_text == null || currMasterStylesJson.default_text == "")
		{
			currMasterStylesJson.default_text = "standard";
		}
		// get draw_page styles
		var presClassString = "draw_page";
		currMasterStylesJson.draw_page_text = this.getMasterFrameStyle(currMasterId, presClassString);

		if (masterStyleCss != null)
		{
			currMasterStylesJson.masterStyleCss = masterStyleCss;
		}

		return currMasterStylesJson;

	},
	getMasterFrameStyle: function(masterPageId, presentationClassString)
	{

		var styleName = "";
		if (masterPageId != null && presentationClassString != null && (presentationClassString == 'title' || presentationClassString == 'subtitle' || presentationClassString == 'outline' || presentationClassString == 'footer' || presentationClassString == 'page-number' || presentationClassString == 'date-time'))
		{
			var currMasterPageDiv = document.getElementById(masterPageId);
			var currMasterPageSlideFrames = null;

			// D31037 [Chrome29]There is not thumbnail in slide shorter on Chrome29
			var masterDiv = dojo.byId("masterHtmlDiv");
			var tmp = dojo.query("#" + masterPageId, masterDiv)[0];
			currMasterPageSlideFrames = dojo.query("[presentation_class='" + presentationClassString + "']", tmp);
			if (currMasterPageSlideFrames != null && currMasterPageSlideFrames.length > 0)
			{
				var currMasterClassStr = dojo.trim(currMasterPageSlideFrames[0].className);
				var currMasterClassArray = currMasterClassStr.split(" ");
				if (currMasterClassArray != null)
				{
					for ( var i = 1; i < currMasterClassArray.length; i++)
					{ // the first one we want to ignore:"draw_frame"
						styleName = styleName + " " + currMasterClassArray[i];
					}
				}
			}
		}
		else if (masterPageId != null && presentationClassString != null && presentationClassString == "")
		{
			var currMasterPageDiv = document.getElementById(masterPageId);
			if (currMasterPageDiv != null)
			{ // 17310, due to weird characters in masterPageId, it may not find it, adding null check to avoid errorring out
				styleName = currMasterPageDiv.getAttribute("style_name");
			}
		}
		else if (masterPageId != null && presentationClassString != null && presentationClassString == "draw_page")
		{
			var currMasterPageDiv = document.getElementById(masterPageId);
			if (currMasterPageDiv != null)
			{ // 17310, due to weird characters in masterPageId, it may not find it, adding null check to avoid errorring out
				var styleNameTemp = dojo.trim(currMasterPageDiv.className);
				var styleNameTempArray = styleNameTemp.split(" ");
				if (styleNameTempArray != null)
				{
					for ( var i = 1; i < styleNameTempArray.length; i++)
					{ // the first one we want to ignore:"style_master-page"
						styleName = styleName + " " + styleNameTempArray[i];
					}
				}
			}

		}
		styleName = dojo.trim(styleName);
		return styleName;

	},
	removeCurrentMasterStylesByMasterStylesJSON: function(masterStylesJSONForFrame, slideElem)
	{
		if (masterStylesJSONForFrame != null)
		{
			if (slideElem == null)
			{
				slideElem = this.editor.document.$;
			}
			var masterStylesClassArray = masterStylesJSONForFrame.split(" ");
			for ( var j = 0; j < masterStylesClassArray.length; j++)
			{
				var frameStyleDivs = dojo.query("." + masterStylesClassArray[j], slideElem);
				for ( var i = 0; i < frameStyleDivs.length; i++)
				{
					dojo.removeClass(frameStyleDivs[i], masterStylesClassArray[j]);
				}
			}
		}
	},
	removeCurrentMasterStyles: function(slideElem)
	{
		// all the style we replace during apply templates are stored in this.currMasterFrameStylesJSON
		var slideElemWrapper = null;
		if (slideElem == null)
		{
			slideElem = this.editor.document.$;
			slideElemWrapper = this.editor.document.$;
			;
		}
		else
		{
			slideElemWrapper = slideElem.parentNode;
		}
		// remove the title page title style
		this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.title, slideElem);
		/*
		 * var masterStylesClassArray = this.currMasterFrameStylesJSON.title.split(" "); for(var j=0; j<masterStylesClassArray.length; j++){ var titleStyleDivs = dojo.query("."+masterStylesClassArray[j], this.editor.document.$); for(var i=0; i<titleStyleDivs.length; i++ ){ dojo.removeClass(titleStyleDivs[i],masterStylesClassArray[j]); } }
		 */

		// remove subtitle style
		this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.subtitle, slideElem);
		/*
		 * var subtitleStyleDivs = dojo.query("."+this.currMasterFrameStylesJSON.subtitle, this.editor.document.$); for(var i=0; i<subtitleStyleDivs.length; i++ ){ dojo.removeClass(subtitleStyleDivs[i],this.currMasterFrameStylesJSON.subtitle); }
		 */

		// remove text-title style
		this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.text_title, slideElem);
		/*
		 * var textTitleStyleDivs = dojo.query("."+this.currMasterFrameStylesJSON.text_title, this.editor.document.$); for(var i=0; i<textTitleStyleDivs.length; i++ ){ dojo.removeClass(textTitleStyleDivs[i],this.currMasterFrameStylesJSON.text_title); }
		 */
		// remove text-outline style
		this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.text_outline, slideElem);
		/*
		 * var textOutlineStyleDivs = dojo.query("."+this.currMasterFrameStylesJSON.text_outline, this.editor.document.$); for(var i=0; i<textOutlineStyleDivs.length; i++ ){ dojo.removeClass(textOutlineStyleDivs[i],this.currMasterFrameStylesJSON.text_outline); }
		 */
		// remove default title style
		this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.default_title, slideElem);
		/*
		 * var defaultTitleStyleDivs = dojo.query("."+this.currMasterFrameStylesJSON.default_title, this.editor.document.$); for(var i=0; i<defaultTitleStyleDivs.length; i++ ){ dojo.removeClass(defaultTitleStyleDivs[i],this.currMasterFrameStylesJSON.default_title); }
		 */
		// remove default text style
		this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.default_text, slideElem);

		// for title frame
		this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.footer, slideElem);
		this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.datetime, slideElem);
		this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.pagenumber, slideElem);

		// do the same for the text frames
		this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.text_footer, slideElem);
		this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.text_datetime, slideElem);
		this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.text_pagenumber, slideElem);

		/*
		 * var defaultTextStyleDivs = dojo.query("."+this.currMasterFrameStylesJSON.default_text, this.editor.document.$); for(var i=0; i<defaultTextStyleDivs.length; i++ ){ dojo.removeClass(defaultTextStyleDivs[i],this.currMasterFrameStylesJSON.default_text); }
		 */
		// remove draw_page style
		this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.draw_page_title, slideElemWrapper);
		this.removeCurrentMasterStylesByMasterStylesJSON(this.currMasterFrameStylesJSON.draw_page_text, slideElemWrapper);

		// ****************
		/*
		 * //remove title style from ALT0 layout var presClassString = "title"; var layoutName = "ALT0"; this.removeCurrentMasterStyleForPresClass(presClassString, layoutName); //remove title style from other layout this.removeCurrentMasterStyleForPresClass(presClassString); //remove subtitle style presClassString = "subtitle"; this.removeCurrentMasterStyleForPresClass(presClassString); //remove outline style presClassString = "outline"; this.removeCurrentMasterStyleForPresClass(presClassString); //remove unknown frame style presClassString = ""; this.removeCurrentMasterStyleForPresClass(presClassString);
		 * 
		 * //remove styles from draw_page level too var drawPages = dojo.query(".draw_page", this.editor.document.$); var styleName = this.currMasterFrameStylesJSON.default_text; for(var i=0; i < drawPages.length; i++){ dojo.removeClass(drawPages[i], styleName); } //remove default text style from everywhere (include <table> and presentation_class attr is null (i.e. custom text box) var defaultTextElems = dojo.query("."+styleName, this.editor.document.$); for(var i=0; i < defaultTextElems.length; i++){ dojo.removeClass(defaultTextElems[i], styleName); }
		 */
		/*
		 * commmented out because we don't want to remove original styles that may be used in the slides like MDP52, dp1, etc. //remove master style css link from head var masterStyleCss = this.currMasterFrameStylesJSON.masterStyleCss; var linkNodeList = concord.util.HtmlContent.getLinkElements(this.editor.document.$); if(linkNodeList!=null){ for(var i = 0; i<linkNodeList.length; i++){ if(linkNodeList[i].href.indexOf(masterStyleCss)>=0){ dojo.destroy(linkNodeList[i]); } } }
		 */

	},
	removeCurrentMasterStyleForPresClass: function(presClassString, layoutName)
	{
		var drawFrames = dojo.query("[presentation_class='" + presClassString + "']", this.editor.document.$);
		var styleName = "";
		if (presClassString == "subtitle")
		{
			styleName = this.currMasterFrameStylesJSON.subtitle;
		}
		else if (presClassString == "outline")
		{
			styleName = this.currMasterFrameStylesJSON.text_outline;
		}
		else if (presClassString == "title" && layoutName != null && layoutName == "ALT0")
		{
			styleName = this.currMasterFrameStylesJSON.title;
		}
		else if (presClassString == "title")
		{
			styleName = this.currMasterFrameStylesJSON.text_title;
		}
		else if (presClassString == "footer")
		{
			if (layoutName != null && layoutName == "ALT0")
				styleName = this.currMasterFrameStylesJSON.footer;
			else
				styleName = this.currMasterFrameStylesJSON.text_footer;
		}
		else if (presClassString == "date-time")
		{
			if (layoutName != null && layoutName == "ALT0")
				styleName = this.currMasterFrameStylesJSON.datetime;
			else
				styleName = this.currMasterFrameStylesJSON.text_datetime;
		}
		else if (presClassString == "page-number")
		{
			if (layoutName != null && layoutName == "ALT0")
				styleName = this.currMasterFrameStylesJSON.pagenumber;
			else
				styleName = this.currMasterFrameStylesJSON.text_pagenumber;
		}
		else if (presClassString == "")
		{
			styleName = this.currMasterFrameStylesJSON.default_text;
		}
		for ( var i = 0; i < drawFrames.length; i++)
		{
			// remove the stylename from div that has draw_frame_classes
			var drawFrameClassesDivs = dojo.query(".draw_frame_classes", drawFrames[i]);
			if (drawFrameClassesDivs != null && drawFrameClassesDivs.length > 0)
			{
				dojo.removeClass(drawFrameClassesDivs[0], styleName);
			}
		}
		// remove it from draw_frame too
		for ( var i = 0; i < drawFrames.length; i++)
		{
			dojo.removeClass(drawFrames[i], styleName);
		}

	},
	createTemplateDataJsonFromCurrMaster: function()
	{
		var templateData = null;
		// get the top master names
		var titlePageMasterName = this.currMaster.masterPages[0].name;
		var textPageMasterName = this.currMaster.masterPages[1].name;

		var titleMasterDrawPageDiv = document.getElementById(titlePageMasterName);
		var textMasterDrawPageDiv = document.getElementById(textPageMasterName);

		if (titleMasterDrawPageDiv != null && textMasterDrawPageDiv != null)
		{
			templateData = new Object();
			templateData.masterName = titleMasterDrawPageDiv.id;
			templateData.masterStylecss = dojo.attr(titleMasterDrawPageDiv, "masterstylecss");
			if (templateData.masterStylecss == null || templateData.masterStylecss == "")
			{
				templateData.masterStylecss = this.currMasterFrameStylesJSON.masterStyleCss;
			}
			templateData.masterPages = new Array();
			var titleMasterPage = new Object();
			titleMasterPage.name = titleMasterDrawPageDiv.id;
			titleMasterPage.page_layout_name = dojo.attr(titleMasterDrawPageDiv, "page_layout_name");
			titleMasterPage.style_name = dojo.attr(titleMasterDrawPageDiv, "style_name");
			var titleMasterPageClassNames = this.getMasterFrameStyle(titlePageMasterName, "draw_page");
			titleMasterPage.style_name = dojo.trim(titleMasterPage.style_name + " " + titleMasterPageClassNames);

			var titleMasterPageFrames = dojo.query(".draw_frame", titleMasterDrawPageDiv);
			titleMasterPage.frames = this.getMasterFramesJsonForMasterPage(titleMasterPageFrames);
			templateData.masterPages.push(titleMasterPage);

			var textMasterPage = new Object();
			textMasterPage.name = textMasterDrawPageDiv.id;
			textMasterPage.page_layout_name = dojo.attr(textMasterDrawPageDiv, "page_layout_name");
			textMasterPage.style_name = dojo.attr(textMasterDrawPageDiv, "style_name");
			var textMasterPageClassNames = this.getMasterFrameStyle(textPageMasterName, "draw_page");
			textMasterPage.style_name = dojo.trim(textMasterPage.style_name + " " + textMasterPageClassNames);

			var textMasterPageFrames = dojo.query(".draw_frame", textMasterDrawPageDiv);
			textMasterPage.frames = this.getMasterFramesJsonForMasterPage(textMasterPageFrames);
			templateData.masterPages.push(textMasterPage);
		}

		return templateData;
	},
	// parameter masterPageFrames, an array of frame elements within a master page
	getMasterFramesJsonForMasterPage: function(masterPageFrames)
	{
		var masterPageFramesJsonArray = new Array();
		if (masterPageFrames != null)
		{
			for ( var i = 0; i < masterPageFrames.length; i++)
			{
				var presClass = dojo.attr(masterPageFrames[i], "presentation_class");
				var dataNode = masterPageFrames[i].children[0];
				var frame = new Object();
				if ((presClass == null || presClass == "") && dojo.hasClass(masterPageFrames[i], "backgroundImage") && !(((dataNode) && (dojo.hasClass(dataNode, 'draw_text-box') || dojo.attr(dataNode, 'odf_element') == 'draw_text-box'))))
				{

					frame.used_as = "backgroundImage";
					frame.href = "";
					if (masterPageFrames[i].firstChild != null)
					{
						if (dojo.hasAttr(masterPageFrames[i].firstChild, "src"))
						{
							frame.href = dojo.attr(masterPageFrames[i].firstChild, "src");
						}
						else if (dojo.hasAttr(masterPageFrames[i].firstChild, "src1"))
						{
							frame.href = dojo.attr(masterPageFrames[i].firstChild, "src1");
						}
					}
				}
				else
				{
					frame.used_as = presClass;
					frame.emptyCB_placeholder = dojo.attr(masterPageFrames[i], "emptyCB_placeholder");
					if (frame.emptyCB_placeholder == null || frame.emptyCB_placeholder == "")
					{
						frame.emptyCB_placeholder = true;
					}
				}
				frame.name = "";
				var frameClone = masterPageFrames[i].cloneNode(true);
				dojo.removeClass(frameClone, "draw_frame");
				frame.style_name = frameClone.className;
				dojo.destroy(frameClone);
				frame.layer = "backgroundobjects";
				frame.top = masterPageFrames[i].style.top;
				frame.left = masterPageFrames[i].style.left;
				frame.width = masterPageFrames[i].style.width;
				frame.height = masterPageFrames[i].style.height;
				frame.html = masterPageFrames[i].outerHTML;
				masterPageFramesJsonArray.push(frame);
			}
		}
		return masterPageFramesJsonArray;
	}

};