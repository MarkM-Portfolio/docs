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

dojo.provide("concord.widgets.viewPresForHtmlPrint");
dojo.require("dojo.i18n");
dojo.require("concord.util.A11YUtil");
dojo.requireLocalization("concord.widgets", "viewPresForHtmlPrint");

dojo.declare("concord.widgets.viewPresForHtmlPrint", null, {
	nls: null,
	slides: null,
	connections: null,
	slideContainer: null,
	presPrintWindow: null,
	presPrintDoc: null,
	helpDiv: null,
	showHelp: false,
	toolbar: null,
	helpButton: null,
	printButton: null,
	presPrintDataEvent: null,
	presDocURLLocation: null,
	numImages: 0,
	defaultPageHeight: "21",
	defaultPageWidth: "28",
	slideViewWidth: "640",
	slideWidth: null,
	slideHeight: null,
	
	constructor: function(printWindow){
		this.presPrintWindow = printWindow;
		this.presPrintWindow.focus();
		this.presPrintDoc = printWindow.document;
		this.presDocURLLocation = printWindow.top.opener.location;
		this.nls = dojo.i18n.getLocalization("concord.widgets", "viewPresForHtmlPrint");
	},
	
	configEvents: function(slideData){
		g_htmlPrintDataEvt = concord.util.events.subscribe(concord.util.events.slideSorterEvents, null, dojo.hitch(this,this.handleSubscriptionEvents));
		var eventData = [{eventName: concord.util.events.slideShowEvents_eventName_getSlidesForPrint}];
		concord.util.events.publish(concord.util.events.slideShowEvents, eventData);
	},
	
	addEvent: function(eventConnections){
		if (!this.connections)
			this.connections = new Array();
		this.connections.push(eventConnections);
	},
	
	print: function(){
		this.presPrintWindow.print();
	},
	
	toggleHelp: function(){
		if (this.showHelp) {
			dojo.style(this.helpDiv, {
				'display' : 'none'
			});
			this.showHelp = false;
		} else {
			dojo.style(this.helpDiv, {
				'display' : 'block'
			});
			this.showHelp = true;
		}
	},
	
	showToolbar: function(){
		// show the toolbar and hide the loading message
		var loadingMessageDiv = this.presPrintDoc.getElementById('presHtmlPrintLoadingMsg');
		dojo.removeClass(loadingMessageDiv, "presHtmlPrintLoadingMsg");
		dojo.addClass(loadingMessageDiv, "presHtmlPrintLoadingMsgDone");
		var bodyTag = this.presPrintDoc.getElementsByTagName("body")[0];
		dijit.setWaiState(bodyTag,'busy','false');
		dojo.removeClass(this.toolbar, "presHtmlPrintToolbarSlidesLoading");
		dojo.addClass(this.toolbar, "presHtmlPrintToolbarSlidesLoaded");

		var printButton = this.presPrintDoc.getElementById('presHtmlPrintButton');
		dojo.attr(printButton,"tabindex","0");
		var helpButton = this.presPrintDoc.getElementById('presHtmlPrintHelpButton');
		dojo.attr(helpButton,"tabindex","0");
	},
	
	configToolbar: function(){
		// set labels on toolbar buttons
		var toolbar = this.toolbar = this.presPrintDoc.getElementById('presHtmlPrintToolbar');
		var printButton = this.printButton = this.presPrintDoc.getElementById('presHtmlPrintButton');
		dijit.setWaiRole(printButton, 'button');
		printButton.innerHTML += this.nls.PRINT;
		// Append doesn't work for IE8 so will just assign aria-label directly
		// instead of creating label with for and id.
		//var chkBoxLabel = document.createElement('label');
		//dojo.attr(chkBoxLabel,'for','presHtmlPrintButton');
		//chkBoxLabel.appendChild(document.createTextNode(this.nls.PRINT));
		//printButton.document.appendChild(chkBoxLabel);
		dijit.setWaiState(printButton, 'label', this.nls.PRINT);

		// wai-aria -- Print image requires an alt tag
		var printImages = printButton.getElementsByTagName('img');
		if (printImages && printImages.length > 0) {
			printImages[0].setAttribute('alt',this.nls.PRINT);
		}
		var helpButton = this.helpButton = this.presPrintDoc.getElementById('presHtmlPrintHelpButton');
		var helpImages = helpButton.getElementsByTagName('img');
		if (helpImages && printImages.length > 0) {
			helpImages[0].setAttribute('alt',this.nls.HELP);
		}

		
		// create the help section div 
		var helpDiv = this.helpDiv = this.presPrintDoc.createElement('div');
		helpDiv.id = 'presHtmlPrintHelp';
		var helpDivMsg = this.presPrintDoc.createElement('div');
		helpDivMsg.id = 'presHtmlPrintHelpInnerDiv';
		helpDiv.appendChild(helpDivMsg);
		toolbar.appendChild(helpDiv);
		
		this.eventConnections = new Array();
		
		// add browser-specific message to the help section
		var helpMsg = "<p class=\"presHtmlPrintHelpParagraph\"><b>" + this.nls.HELP_MSG_TITLE + 
			"</b></p><p class=\"presHtmlPrintHelpParagraph\">" + 
			this.nls.HELP_MSG + "</p><ol class=\"presHtmlPrintHelpList\">";
		if (dojo.isIE) {
			helpMsg += "<li class=\"presHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_IE_1 + "</li>";
			helpMsg += "<li class=\"presHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_IE_2 + "</li>";
			helpMsg += "<li class=\"presHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_IE_3 + "</li>";
			helpMsg += "<li class=\"presHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_IE_4 + "</li>";
			helpMsg += "<li class=\"presHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_IE_5 + "</li>";
		} else if (dojo.isWebKit) {
			helpMsg += "<li class=\"presHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_SAFARI_1 + "</li>";
			helpMsg += "<li class=\"presHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_SAFARI_2 + "</li>";
			helpMsg += "<li class=\"presHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_SAFARI_3 + "</li>";
			helpMsg += "<li class=\"presHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_SAFARI_4 + "</li>";
		}
		else {
			helpMsg += "<li class=\"presHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_FIREFOX_1 + "</li>";
			helpMsg += "<li class=\"presHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_FIREFOX_2 + "</li>";
			helpMsg += "<li class=\"presHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_FIREFOX_3 + "</li>";
			helpMsg += "<li class=\"presHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_FIREFOX_4 + "</li>";
			helpMsg += "<li class=\"presHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_FIREFOX_5 + "</li>";
			helpMsg += "<li class=\"presHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_FIREFOX_6 + "</li>";
		}
		helpMsg += "</ol>";
		helpDivMsg.innerHTML = helpMsg;
	},
	
	configToolbarEvents: function(){
		this.addEvent(dojo.connect(this.helpButton, 'onclick', dojo.hitch(this, this.toggleHelp, this)));
		this.addEvent(dojo.connect(this.helpDiv, 'onclick', dojo.hitch(this, this.toggleHelp, this)));
		this.addEvent(dojo.connect(this.printButton, 'onclick', dojo.hitch(this, this.print, this)));
		this.addEvent(dojo.connect(this.printButton, 'onkeypress', dojo.hitch(this, this.keypress, this.printButton)));
		this.addEvent(dojo.connect(this.helpButton, 'onkeypress', dojo.hitch(this, this.keypress, this.helpButton)));
		this.addEvent(dojo.connect(this.presPrintWindow.document, 'onkeypress', dojo.hitch(this, this.handleWindowKey)));
	},
	
	unsubscribeEvents: function(){
		if (this.presPrintDataEvent)
			dojo.unsubscribe(g_htmlPrintDataEvt);
		dojo.forEach(this.connections, dojo.disconnect);
		this.connections = [];
	},
	
	keypress: function(targ,evt) {
		if (evt.keyCode == dojo.keys.ENTER) {
			if (targ == this.printButton) {
				this.print();
			}
			else if (targ == this.helpButton) {
				this.toggleHelp();
			}
		}
	},
	
	handleWindowKey: function(evt) {
		if (evt.keyCode == dojo.keys.ESCAPE) {
			this.presPrintWindow.close();
		}
	},
	
	switchToSlideView: function() {
		dojo.query('[class ~= "presHtmlPrintNotesViewElement"]', this.presPrintDoc.body).forEach(function(node, index, arr){
			dojo.style(node, {
				'display' : 'none'
			});
		});
	},
	
	switchToNotesView: function() {
		dojo.query('[class ~= "presHtmlPrintNotesViewElement"]', this.presPrintDoc.body).forEach(function(node, index, arr){
			dojo.style(node, {
				'display' : 'block'
			});
		});
	},
	
	addPageBreak: function(){
		// supported by FF3.6, works in IE but breaks Safari
		var printDoc = this.presPrintDoc;
		var pageBreak = printDoc.createElement('p');
		pageBreak.innerHTML = '<br style="page-break-before: always;" clear="all" />';
		printDoc.body.appendChild(pageBreak);
	},
	
	stripParentDivs: function(parent) {
		var innerText = "<p></p>";
		if (parent){
			var textNode = parent.firstChild;
			while (textNode && textNode.firstChild && textNode.firstChild.nodeName == 'DIV') {
				textNode = textNode.firstChild;
			}
			innerText = textNode? textNode.innerHTML : "<p></p>";
		}
		
		return innerText;
	},
	
	addSlide: function(index, lastIndex){
		var printDoc = this.presPrintDoc;
		var slide = this.slides[index];
		
		// we don't want user to TAB through slide content
		dojo.query('*[tabindex="0"]', slide).forEach(function(node, index, arr){
			dojo.attr(node, 'tabindex', '-1');
		});

        var speakerNotes = dojo.query('[presentation_class = "notes"]', slide)[0];
        var defaultSpeakerNotes = dojo.query('[class ~= "defaultContentText"]', speakerNotes)[0];
        
        // Extract the text within speaker notes and notes view header&footer
        var notesText = defaultSpeakerNotes != undefined? "" : speakerNotes ? speakerNotes.innerHTML : "";
        var notesHeader = dojo.query('[presentation_class = "header"]', speakerNotes)[0];
        var notesFooter = dojo.query('[presentation_class = "footer"]', speakerNotes)[0];
        var notesDateTime = dojo.query('[presentation_class = "date-time"]', speakerNotes)[0];
        var notesPageNumber = dojo.query('[presentation_class = "page-number"]', speakerNotes)[0];
        
		var smil_type = dojo.attr(slide, 'smil_type');
		var smil_subtype = dojo.attr(slide, 'smil_subtype');
		var smil_direction = dojo.attr(slide, 'smil_direction');
		
    	var pageHeight = dojo.attr(slide, 'pageheight');
		var pageWidth = dojo.attr(slide, 'pagewidth');
		
		if (isNaN(''+pageHeight) || isNaN(''+pageWidth) || pageHeight == "" || pageWidth == "") {
			pageHeight = this.defaultPageHeight;
			pageWidth = this.defaultPageWidth;
		}
		
        var slideWidth = dojo.isIE? this.getBrowserWidth(this.presPrintWindow)*0.95 : this.slideViewWidth;
        var slideHeight = slideWidth * concord.util.resizer.getRatio(pageHeight, pageWidth);
		var fontSize = PresCKUtil.getBasedFontSize(slideHeight, pageHeight);
		
		slide.style.fontSize = fontSize + 'px';
		
		if (smil_direction == null) {
			smil_direction = "none";
		}
				
		if (smil_type == "none") {
			smil_type = null;
		}
		
		// track how many images have been loaded to estimate whether the page content is loaded
		// completely
		var imgTags = dojo.query('img', slide);
		for (var j = 0; j < imgTags.length; j++)
			imgTags[j].setAttribute("onload", "imageLoaded()");

		//if a node is layoutClassSS hide it unless it has a background color
		var layoutClassElms = dojo.query('.layoutClassSS',slide);
		var hasBackGroundColor = false;
		for (var i = 0; i< layoutClassElms.length; i++) {
			hasBackGroundColor = false;

			//determine if any sub nodes have a background color
			dojo.query("div", layoutClassElms[i]).forEach(function(node, index, arr){
				if (node.style.backgroundColor != "") {
					hasBackGroundColor = true;	
				}
			});	

			//only hide the node if there is no background color
			if (hasBackGroundColor == false) {
				layoutClassElms[i].style.display = 'none';
			} else {
				//if a node has background color do not display default text
				dojo.query(".defaultContentText", layoutClassElms[i]).forEach(function(node, index, arr){
					node.innerHTML = "";
				});
			}
		}
		
		var headerText = this.stripParentDivs(notesHeader) || "";
		var dateTimeText = this.stripParentDivs(notesDateTime)|| "";
		var footerText = this.stripParentDivs(notesFooter)|| "";
		var pageNumberText = this.stripParentDivs(notesPageNumber)|| "";
		
        dojo.destroy(notesHeader);
        dojo.destroy(notesFooter);
        dojo.destroy(notesDateTime);
        dojo.destroy(notesPageNumber);
        dojo.destroy(speakerNotes);
        
		var tempDiv = (dojo.isIE || dojo.isEdge)? document.createElement('div') : printDoc.createElement('div');
		dojo.style(slide, 'height', slideHeight + 'px');
		tempDiv.appendChild(slide);
		
		var slideDiv = printDoc.createElement('div');
		slideDiv.innerHTML = tempDiv.innerHTML;
		dojo.style(slideDiv, {
			'position' : 'relative',
			'height' : slideHeight + 'px',
			'width' :  slideWidth + 'px'
		});
				
		var slideCenterer = printDoc.createElement('div');
		dojo.style(slideCenterer, {
			'margin' :  'auto'
		});
		slideCenterer.appendChild(slideDiv);
		
		var notesDiv = printDoc.createElement('div');
		notesDiv.innerHTML = notesText || "";
		dojo.style(notesDiv, {
			'position' : 'relative',
			'height' : 'auto',
			'width' :  'auto'
		});
		
		// Page layout is represented by a table with three rows. The middle row contains the slide 
		// with speaker notes, while upper and lower rows contain header and footer.
		var slideTable = printDoc.createElement('table');
		dijit.setWaiRole(slideTable,'presentation');
		dijit.setWaiState(slideTable,'hidden','true');
		var headerRow = printDoc.createElement('tr');
		var slideRow = printDoc.createElement('tr');
		var footerRow = printDoc.createElement('tr');
		var headerCell = printDoc.createElement('td');
		var headerMiddleCell = printDoc.createElement('td');
		var dateTimeCell = printDoc.createElement('td');
		var footerCell = printDoc.createElement('td');
		var footerMiddleCell = printDoc.createElement('td');
		var pageNumberCell = printDoc.createElement('td');
		var slideCell = printDoc.createElement('td');

		// The only way to force the slide cell to occupy 100% of the table row in IE
		if (dojo.isIE)
			slideCell.setAttribute("colSpan", "3");
		
		headerRow.appendChild(headerCell);
		headerRow.appendChild(headerMiddleCell);
		headerRow.appendChild(dateTimeCell);
		footerRow.appendChild(footerCell);
		footerRow.appendChild(footerMiddleCell);
		footerRow.appendChild(pageNumberCell);
		slideRow.appendChild(slideCell);
		slideTable.appendChild(headerRow);
		slideTable.appendChild(slideRow);
		slideTable.appendChild(footerRow);
		
		slideCell.appendChild(slideCenterer);
        slideCell.appendChild(notesDiv);
        headerCell.innerHTML = headerText;
        dateTimeCell.innerHTML = dateTimeText;
        footerCell.innerHTML = footerText;
        pageNumberCell.innerHTML = pageNumberText;
		printDoc.body.appendChild(slideTable);

		// page break
		if(dojo.isIE==10 && index < lastIndex){
			dojo.style(slideTable, {'page-break-after' : 'always'});
		}else if (!dojo.isWebKit && index < lastIndex) {
			// works on IE and Firefox
			this.addPageBreak();
		} else if (dojo.isWebKit && index < lastIndex)
			dojo.style(slideTable, {'page-break-after' : 'always'});
		
		dojo.addClass(slideDiv, "concord");
		dojo.addClass(notesDiv, "concord");
		dojo.addClass(slideTable, "presHtmlPrintSlidePage");
	    dojo.addClass(slideDiv, "presHtmlPrintSlide");
		dojo.addClass(notesDiv, "presHtmlPrintNotes");
		dojo.addClass(notesDiv, "presHtmlPrintNotesViewElement");
		dojo.addClass(footerRow, "presHtmlPrintNotesViewElement");
		dojo.addClass(headerRow, "presHtmlPrintNotesViewElement");
		dojo.addClass(footerRow, "presHtmlPrintFooterRow");
		dojo.addClass(slideRow, "presHtmlPrintSlideRow");
		dojo.addClass(headerCell, "presHtmlPrintHeaderFooterLeftCell");
		dojo.addClass(dateTimeCell, "presHtmlPrintHeaderFooterRightCell");
		dojo.addClass(footerCell, "presHtmlPrintHeaderFooterLeftCell");
		dojo.addClass(pageNumberCell, "presHtmlPrintHeaderFooterRightCell");
		
		return slideDiv.children[0];
	},
	
	loadSlides: function(data) {
		this.slides = new Array();
		var sorterSlides = data.slides;
		sorterSlides = dojo.clone(sorterSlides);
				
		for (var i=0; i<sorterSlides.length; i++){
			var tempDiv = document.createElement('div');
			tempDiv.innerHTML = sorterSlides[i];
			this.slides.push(tempDiv.firstChild);
		}
		
		this.numImages = 0;
		for(var i=0; i < this.slides.length; i++){
			var slide = this.slides[i];
			
			var images = dojo.query('img.draw_image', slide);
			
			var presURL = this.presDocURLLocation.href;
			presURL = presURL.substring(0,presURL.lastIndexOf('/') + 1);
			
			for (var j=0; j<images.length; j++){
				var imgURL = images[j].getAttribute('src');
				if (imgURL && (imgURL.indexOf('data:image/') == -1)) {
					if(imgURL.indexOf('http://') == 0) {
						var printWinURL = this.presPrintWindow.location.href;
						imgURL = imgURL.substring(presWinURL.lastIndexOf('/') + 1);
					}
					imgURL = presURL + imgURL;
				
					images[j].setAttribute('src',imgURL);
				}
			}
			
			var imgTags = dojo.query('img', slide);
			this.numImages += imgTags.length;
		}
		//console.log('Total images in print view: ' + this.numImages);

		// add css files
		var cssFilesArray = data.linkElements;

		var headTag = this.presPrintDoc.getElementsByTagName("head")[0];

		for (var i=0; i < cssFilesArray.length; i++){
			//var linkTag = dojo.clone(cssFilesArray[i])
			var linkTag = this.presPrintDoc.createElement('link');
			this.copyLinkAttributes(cssFilesArray[i], linkTag);
			
			if (headTag){
				if (this.presPrintDoc.createStyleSheet){
					this.presPrintDoc.createStyleSheet(linkTag.href);
				}else{
					headTag.appendChild(linkTag);
				}
			}	
		}
		
		// add inline styles
		var inLineStyles = data.styleElements;
		
		var headTag = this.presPrintDoc.getElementsByTagName("head")[0];

		for (var i=0; i< inLineStyles.length;i++){
			var style;
			
			if (dojo.isIE) {
				style = this.presPrintDoc.createStyleSheet();
				style.cssText = ""+inLineStyles[i].innerHTML+"";
			}
			else {
				style = this.presPrintDoc.createElement('style');
				style.innerHTML = inLineStyles[i].innerHTML;
				
				if (headTag)
					headTag.appendChild(style);
			}
		}
		var bodyTag = this.presPrintDoc.getElementsByTagName("body")[0];
		dijit.setWaiRole(bodyTag,'main');
		dijit.setWaiState(bodyTag,'label',this.nls.PRINT_PRES); 

		// add all slides to the printer-friendly view
		var numSlides = this.slides.length;
		for(var i=0; i < numSlides; i++)
			this.addSlide(i, numSlides-1);
		
		concord.util.A11YUtil.createLabels(bodyTag, this.presPrintDoc);

		// by default do not display speaker notes
		this.switchToSlideView();
	},
	
	handleSubscriptionEvents: function(data){
		if(data!=null){
			if (data.eventName==concord.util.events.slideSorterEvents_eventName_presHtmlPrintData){	
				this.loadSlides(data);
				this.configToolbar();
				this.configToolbarEvents();
			}
		}
	},
	
	getBrowserWidth: function(printWindow){
		var width = 0;
		
		if(typeof(printWindow.innerWidth) == 'number') 
			width = printWindow.innerWidth;
		else if(printWindow.document.documentElement && printWindow.document.documentElement.clientWidth)
			width = printWindow.document.documentElement.clientWidth;
		else if(printWindow.document.body && printWindow.document.body.clientWidth)
			width = printWindow.document.body.clientWidth;
		
		return width;
	},
	
	copyLinkAttributes: function(from, to){
		dojo.attr(to, 'class', dojo.attr(from,'class'));
		dojo.attr(to, 'rel', dojo.attr(from,'rel'));
		dojo.attr(to, 'type', dojo.attr(from,'type'));
		dojo.attr(to, 'href', dojo.attr(from,'href'));
	},
	
	dummyFunction: function(param) {
		// do nothing
	}
});

