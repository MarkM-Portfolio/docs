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

dojo.provide("concord.widgets.viewTextForHtmlPrint");
dojo.require("dojo.i18n");
dojo.requireLocalization("concord.widgets", "viewTextForHtmlPrint");

dojo.declare("concord.widgets.viewTextForHtmlPrint",null, {
	nls: null,

	connections: null,
	textPrintWindow: null,
	textPrintDoc: null,
	helpDiv: null,
	showHelp: false,
	helpButton: null,
	printButton: null,
	textDocURLLocation: null,
	
	constructor: function(printWindow){
		this.textPrintWindow = printWindow;
		this.textPrintWindow.focus();
		this.textPrintDoc = printWindow.document;
		this.textDocURLLocation = printWindow.top.opener.location;
		this.nls = dojo.i18n.getLocalization("concord.widgets", "viewTextForHtmlPrint");
	},
		
	loadData: function(){
		this.configToolbar();
		this.configToolbarEvents();
		this.configPrintDiv();
	},

	print: function(){
		this.textPrintWindow.focus();
		if (this.textPrintDoc.getElementsByClassName('floatBar').length != 0) {
			this.textPrintDoc.getElementById('viewbody').removeChild(this.textPrintDoc.getElementsByClassName('floatBar')[0]);
		}
		this.textPrintWindow.print();
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
			
			var screenReaderNode = this.textPrintDoc.getElementById('id_screenReaderNode');
			if(!screenReaderNode)
			{
				screenReaderNode = this.textPrintDoc.createElement('span');
				screenReaderNode.id = 'id_screenReaderNode';
				screenReaderNode.setAttribute('role', 'region');
				screenReaderNode.setAttribute('aria-live', 'assertive');
				screenReaderNode.setAttribute('style', 'font-size:0pt;');
				var parent = this.textPrintDoc.getElementById('textHtmlPrintToolbar');
				parent.appendChild(screenReaderNode);
			}
    		screenReaderNode.innerHTML = this.generatehelpMsg();	
			
			this.showHelp = true;
		}
	},
	
	generatehelpMsg:function(){
		
		var helpMsg = this.nls.HELP_MSG_TITLE + " " + this.nls.HELP_MSG + " ";

		helpMsg += "First, " + this.nls.HELP_MSG_FIREFOX_1 + " ";
		helpMsg += "Second, " + this.nls.HELP_MSG_FIREFOX_2 + " ";
		helpMsg += "Third, " + this.nls.HELP_MSG_FIREFOX_3 + " ";
		helpMsg += "Forth, " + this.nls.HELP_MSG_FIREFOX_4 + " ";
		helpMsg += "Fifth, " + this.nls.HELP_MSG_FIREFOX_5 + " ";
		helpMsg += "Sixth, " + this.nls.HELP_MSG_FIREFOX_6;
		
		helpMsg += this.nls.HELP_MSG_PG_TITLE + " ";
		
		helpMsg += "First, " + this.nls.HELP_MSG_FIREFOX_11 + " ";
		helpMsg += "Second, " + this.nls.HELP_MSG_FIREFOX_12 + " ";
		helpMsg += "Third, " + this.nls.HELP_MSG_FIREFOX_13 + " ";
		helpMsg += "Forth, " + this.nls.HELP_MSG_FIREFOX_14;
		
		return helpMsg;
	},
	
	configToolbar: function(){
		// set labels on toolbar buttons
		var toolbar = this.textPrintDoc.getElementById('textHtmlPrintToolbar');
		var printButton = this.printButton = this.textPrintDoc.getElementById('textHtmlPrintButton');
		printButton.innerHTML += this.nls.PRINT;
		//helpButton.innerHTML = this.nls.HELP;
		
		if(g_locale != 'ja' && g_locale != 'ja-jp' && g_locale != 'ko' && g_locale != 'ko-kr') {
			dojo.style(toolbar,{font: "75%/1.5 Arial,Helvetica,sans-serif"});	
		}
		// create the help section div 
		/*var helpDiv = this.helpDiv = this.textPrintDoc.createElement('div');
		helpDiv.id = 'textHtmlPrintHelp';
		var helpDivMsg = this.textPrintDoc.createElement('div');
		helpDivMsg.id = 'textHtmlPrintHelpInnerDiv';
		helpDiv.appendChild(helpDivMsg);
		toolbar.appendChild(helpDiv);

		// add browser-specific message to the help section
		var helpMsg = "<p class=\"textHtmlPrintHelpParagraph\"><b>" + this.nls.HELP_MSG_TITLE 
								+ "</b></p><p class=\"textHtmlPrintHelpParagraph\">" 
								+ this.nls.HELP_MSG + "<ol class=\"textHtmlPrintHelpList\">";
		if (dojo.isIE) {
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_IE_1 + "</li>";
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_IE_2 + "</li>";
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_IE_3 + "</li>";
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_IE_4 + "</li>";
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_IE_5 + "</li>";

		} else if (dojo.isSafari) {
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_SAFARI_1 + "</li>";
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_SAFARI_2 + "</li>";
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_SAFARI_3 + "</li>";
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_SAFARI_4 + "</li>";
		}
		else {
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_FIREFOX_1 + "</li>";
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_FIREFOX_2 + "</li>";
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_FIREFOX_3 + "</li>";
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_FIREFOX_4 + "</li>";
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_FIREFOX_5 + "</li>";
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_FIREFOX_6 + "</li>";
		}
		helpMsg += "</ol><br>";
		
		helpMsg += "<p class=\"textHtmlPrintHelpParagraph\"><b>" + this.nls.HELP_MSG_PG_TITLE 
		+ "</b></p><p class=\"textHtmlPrintHelpParagraph\"><ol class=\"textHtmlPrintHelpList\">";
		if (dojo.isIE) {
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_IE_11 + "</li>";
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_IE_12 + "</li>";
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_IE_13 + "</li>";
						
		} else if (dojo.isSafari) {
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_SAFARI_11 + "</li>";
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_SAFARI_12 + "</li>";
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_SAFARI_13 + "</li>";
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_SAFARI_14 + "</li>";
		}
		else {
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_FIREFOX_11 + "</li>";
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_FIREFOX_12 + "</li>";
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_FIREFOX_13 + "</li>";
			helpMsg += "<li class=\"textHtmlPrintHelpListItem\">" + this.nls.HELP_MSG_FIREFOX_14 + "</li>";
		}
		helpMsg += "</ol>";
		
		helpDivMsg.innerHTML = helpMsg;*/
	},
	
	configToolbarEvents: function(){
//		dojo.connect(this.helpButton, 'onclick', dojo.hitch(this, this.toggleHelp, this));
//		dojo.connect(this.helpDiv, 'onclick', dojo.hitch(this, this.toggleHelp, this));
		dojo.connect(this.printButton, 'onclick', dojo.hitch(this, this.print, this));
//		dojo.connect(this.textPrintWindow, 'onkeydown',this, "onkeydown");
	},
	onkeydown:function(e){
		if(e.ctrlKey)
		{
			if((e.keyChar == "f" || e.keyChar == "F")||e.keyCode == 72)
			{
				if(!this.showHelp)
					this.toggleHelp();
			}
		}
		else if(e.keyCode == 13)
		{
			if(e.target.localName == "img")
			{
				var id = e.target.id;
				if(id == "print_btn")
				{
					this.textPrintWindow.focus();
					this.textPrintWindow.print();
				}
				else if(id == "help_btn")
				{
					if(!this.showHelp)
						this.toggleHelp();
				}
			}
		}
		else if(e.keyCode == 27)
		{
			if(this.showHelp)
				this.toggleHelp();
		}
	},
	
	addPageBreak: function(){
		// supported by FF3.6, works in IE but breaks Safari
		var printDoc = this.presPrintDoc;
		var pageBreak = printDoc.createElement('p');
		pageBreak.innerHTML = '<br style="page-break-before: always;" clear="all" />';
		printDoc.body.appendChild(pageBreak);
	},
	
	/**
	 * load all the pages in document and clone these pages to textPrintDoc
	 */
	configPrintDiv: function(){
		var scrollTop = pe.lotusEditor.getScrollPosition();
        pe.lotusEditor.layoutEngine.rootView.render(scrollTop, true, true);
		var printDoc = this.textPrintDoc;
        printDoc.body.style.margin = 0;
		
		var viewhtmlDiv = this.textPrintDoc.getElementById('viewhtml');
		var pages = pe.lotusEditor._shell.view().getPages();
		var pagesCount = pages.length();
		// pageWidth and pageHeight are from the portrait page if the document has portait page.
		var pageHeight = pages.getByIndex(0).getHeight();
		var pageWidth = pages.getByIndex(0).getWidth();
		var hasDiffSizeSects = pe.lotusEditor.setting.hasDiffSizeSects();
		if (hasDiffSizeSects) {
			var sections = pe.lotusEditor.setting._sections;
			for (var i = 0; i < sections.length; i++) {
				if (!sections[i].pageSize.orient) { // the orient is undefined if portrait, and page size should be the portrait one
					pageHeight = sections[i].pageSize.h;
					pageWidth = sections[i].pageSize.w;
					break;
				}
			}
		}
		
		var totalHeight = Math.floor(pageHeight) * pagesCount;
		dojo.style(viewhtmlDiv, {'width': pageWidth + "px", 'height': totalHeight + "px", 'margin': '0 auto'}); // !important

        var printClasses = "bookMarkDisabled carriageReturnDisabled";
        dojo.addClass(viewhtmlDiv, printClasses);
		var bodyClasses = pe.lotusEditor.domDocument.body.className.split(" ");
        var editorClasses = pe.lotusEditor._editorDiv.className.split(" ");
        var documentClasses = pe.lotusEditor._shell.view().getPages().owner.domNode.className.split(" "); 
		bodyClasses.forEach(function(item, index){if (item)viewhtmlDiv.classList.add(item);});
		editorClasses.forEach(function(item, index){if (item)viewhtmlDiv.classList.add(item);});
		
		// add all the style sheets generated in document creation.
		var css = "";
		var rules = pe.lotusEditor.domDocument.styleSheets[0].cssRules;
		for(var i=0; i<rules.length; i++) {css = css + rules[i].cssText;}
		var cssStyle = printDoc.createElement('style');
		cssStyle.type = 'text/css';
		cssStyle.innerHTML=css;
		printDoc.getElementsByTagName('head').item(0).appendChild(cssStyle);
		
		// add print css
		var printCss = printDoc.createElement('style');
		printCss.type = 'text/css';
		printCss.media = 'print';
		printCss.innerHTML='.textHtmlPrintPage{border-bottom: none}  @page{margin: 0;}';
		printDoc.getElementsByTagName('head').item(0).appendChild(printCss);
		
        for(var i= 0; i< pages.length(); i++) {
        	this.addPage(pages.getByIndex(i), hasDiffSizeSects, documentClasses);
        }

		this.configTipBar(pageWidth);
        pe.lotusEditor.layoutEngine.rootView.render(scrollTop, false); // release dom
	},
	
	configTipBar: function(pageWidth) {
		var printDoc = this.textPrintDoc;
		var tipFloatBar = printDoc.createElement('div');
		dojo.addClass(tipFloatBar, "floatBar");
		dojo.style(tipFloatBar, {'width': pageWidth * 0.85 + "px"}); // the tipbar width is the document_width * 85%
		
		var infoDiv = printDoc.createElement("div");
		var infoIcon = printDoc.createElement("span");
		infoIcon.id = "infoIcon";
		dojo.style(infoIcon, {'margin': '14px 16px 14px 16px'});
		
		var tipContent = printDoc.createElement('span');
		tipContent.innerHTML = this.nls.TIP_MSG;
		dojo.style(tipContent, {'margin': '14px 0 14px 52px'});
		infoDiv.appendChild(infoIcon);
		infoDiv.appendChild(tipContent);
		dojo.addClass(infoDiv, "info");
		
		var closeBtnDiv = printDoc.createElement("div");
		var closeBtn = printDoc.createElement("span");
		closeBtn.id = "closeBtn";
		closeBtnDiv.appendChild(closeBtn);
		closeBtnDiv.onclick = function(){printDoc.getElementById('viewbody').removeChild(printDoc.getElementsByClassName('floatBar')[0]);};
		dojo.addClass(closeBtnDiv, "close_btn");
		
		tipFloatBar.appendChild(infoDiv);
		tipFloatBar.appendChild(closeBtnDiv);
		printDoc.getElementById('viewbody').appendChild(tipFloatBar);
	},
	
	/**
	 * need to clone each page to a table>tr>td>div>div>div to make the 'page-break-after' take effect when printing.
	 */
	addPage: function(page, hasDiffSizeSects, documentClasses) {
		var printDoc = this.textPrintDoc;
		var viewhtmlDiv = this.textPrintDoc.getElementById('viewhtml');
		var pageTable = printDoc.createElement('table');
    	dijit.setWaiRole(pageTable,'textPrint');
		dijit.setWaiState(pageTable,'hidden','true');
		var pageRow = printDoc.createElement('tr');
		var pageCell = printDoc.createElement('td');
		var outerDiv = printDoc.createElement('div');
		var firstDiv = printDoc.createElement('div');
		var secondDiv = printDoc.createElement('div');
		
		var pageWidth = page.getWidth();
		var pageHeight = Math.floor(page.getHeight()); // when all the pages are landscape, the height will be rounded, so blank page will appear.
		
		var pageDiv = printDoc.createElement('div');
		pageDiv.style = dojo.attr(page.domNode, 'style');
		dojo.style(pageDiv, {'top':'0px', 'left':'0px'});
		pageDiv.className = dojo.attr(page.domNode, 'class');
		pageDiv.innerHTML = page.domNode.innerHTML;
		secondDiv.appendChild(pageDiv);
		firstDiv.appendChild(secondDiv);
		outerDiv.appendChild(firstDiv);
		pageCell.appendChild(outerDiv);
		pageRow.appendChild(pageCell);
		pageTable.appendChild(pageRow);
		viewhtmlDiv.appendChild(pageTable);
		pageTable.cellSpacing = "0";
		pageTable.cellPadding = "0";
		dojo.style(pageTable, {'page-break-after' : 'always', 'page-break-inside': 'avoid'});
		dojo.style(outerDiv, {'width': pageWidth + "px", 'height': pageHeight + "px"});
		dojo.addClass(pageTable, "textHtmlPrintPage");
		dojo.addClass(pageRow, "textHtmlPrintPageRow");
		if(hasDiffSizeSects && page.section.pageSize.orient) { // if the orientation is landscope and not all the pages are landscape
        	dojo.style(firstDiv, {'transform': 'rotate(90deg)', 'margin-bottom': (pageWidth - pageHeight)/2 + "px"});
        	dojo.style(outerDiv, {'width': pageHeight + "px", 'height': pageWidth + "px"});
        } else {
        	dojo.style(firstDiv, {'margin': 'auto'});
        }
		dojo.style(secondDiv, {'position': 'relative', 'overflow': 'hidden', 'width': pageWidth + "px", 'height': pageHeight + "px"});
		documentClasses.forEach(function(item, index){if (item)secondDiv.classList.add(item);}); // make the css infrastructure same as original document, like: headerArea
	}
});

