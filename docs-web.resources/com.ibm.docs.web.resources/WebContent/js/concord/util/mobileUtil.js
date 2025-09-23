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

/*
 * @concord.util.mobileUtil
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

dojo.provide("concord.util.mobileUtil");
dojo.requireLocalization("concord.widgets","InsertImageDlg");

/** ! UTF-8 */

concord.util.mobileUtil.fontFallback = {
	"Calibri" : "Arial",
	"Comic Sans MS" : "Chalkboard SE",
	"Lucida Sans Unicode" : "Arial",
	"Tahoma" : "Arial",
	"Frutiger VR" : "Arial",
	"MS PMincho" : "Hiragino Mincho ProN", // Japanese
	"Gulim" : "Arial", // Korean
	"宋体": "Heiti SC", // Simplified Chinese
	"細明體": "Heiti SC" // Traditional Chinese
};

concord.util.mobileUtil.bulletFallback = {
		"wingdings" : {	61473 : 9999,
						61474 : 9986,
						61475 : 9985,
						//61476 : 128083,
						//61477 : 128176,
						//61478 : 128214,
						61479 : 8226, // no equivalent
						61480 : 9742,
						61481 : 9990,
						61482 : 9993,
						61483 : 9993, // no equivalent
						//61484 : 128234,
						//61485 : 128235,
						//61486 : 128236,
						//61487 : 128237,
						//61488 : 128193,
						//61489 : 128194,
						//61490 : 128196,
						//61491 : 128196, // no equivalent
						//61492 : 128196, // no equivalent
						//61493 : 128196, // no equivalent
						61494 : 8987,
						61495 : 9000,
						61496 : 8226, // mouse no equivalent
						61497 : 8226, // trackball no equivalent
						61498 : 128187,
						61499 : 8226, // hard disk no equivalent
						//61500 : 128190,
						//61501 : 128190, // 5? Floppy disk ?no equivalent
 						61502 : 9991,
 						61503 : 9997,
 						61504 : 9997, // (Writing left hand ?no equivalent)
 						61505 : 9996,
 						//61506 : 128076,
 						//61507 : 128077,
 						//61508 : 128078,
 						61509 : 9756,
 						61510 : 9758,
 						61511 : 9757,
 						61512 : 9759,
 						61513 : 9995,
 						61514 : 9786,
 						//61515 : 128528,
 						61516 : 9785,
 						//61517 : 128163,
 						61518 : 9760,
 						61519 : 9872,
 						//61520 : 128681,
 						61521 : 9992,
 						61522 : 9788,
 						//61523 : 128167,
 						61524 : 10052,
 						61525 : 10014, // White Latin cross, no equivalent
 						61526 : 10014,
 						61527 : 8226,  //Celtic cross, no equivalent
 						61528 : 10016, //Celtic cross, no equivalent
 						61529 : 10017,
 						61530 : 9770,
 						61531 : 9775,
 						61532 : 2384,
 						61533 : 9784,
 						61534 : 9800,
 						61535 : 9801,
 						61536 : 9802,
 						61537 : 9803,
 						61538 : 9804,
 						61539 : 9805,
 						61540 : 9806,
 						61541 : 9807,
 						61542 : 9808,
 						61543 : 9809,
 						61544 : 9810,
 						61545 : 9811,
 						61546 : 38,
 						61547 : 38,
 						61548 : 9679,
 						61549 : 10061,
 						61550 : 9632,
 						61551 : 9633,
 						61552 : 9633,   //Bold white square, no equivalent
 						61553 : 10065,
 						61554 : 10066,
 						61555 : 11047,
 						61556 : 10731,
 						61557 : 9670,
 						61558 : 10070,
 						61559 : 11045,
 						61560 : 8999,
 						61561 : 9043,
 						61562 : 8984,
 						61563 : 10048,
 						61564 :	10047,
 						61565 :	10077,
 						61566 :	10078,
 						61567 :	9647,
 						61568 :	9450,
 						61569 :	9312,
 						61570 :	9313,
 						61571 :	9314,
 						61572 :	9315,
 						61573 :	9316,
 						61574 :	9317,
 						61575 :	9318,
 						61576 :	9319,
 						61577 :	9320,
 						61578 :	9321,
 						61579 :	9471,
 						61580 :	10102,
 						61581 :	10103,
 						61582 :	10104,
 						61583 :	10105,
 						61584 :	10106,
 						61585 :	10107,
 						61586 :	10108,
 						61587 :	10109,
 						61588 :	10110,
 						61589 :	10111,
 						// 61590 - 61597 no equivalent
 						61598 :	183,
 						61599 :	8226,
 						61600 :	9642,
 						61601 :	9675,
 						61602 :	11093,
 						61603 :	11093, // work around
 						61604 :	9673,
 						61605 :	9678,
 						61606 :	9675, // work around
 						61607 :	9642,
 						61608 :	9723,
 						61609 :	10022, // work around
 						61610 :	10022,
 						61611 :	9733,
 						61612 :	10038,
 						61613 :	10036,
 						61614 :	10041,
 						61615 :	10037,
 						61616 :	10037, // work around
 						61617 :	8982,
 						61618 :	10209,
 						61619 :	8977,
 						// 61620 no equivalent
 						61621 :	10026,
 						61622 :	10032,
 						//61623 :	128336,
 						//61624 :	128337,
 						//61625 :	128338,
 						//61626 :	128339,
 						//61627 :	128340,
 						//61628 :	128341,
 						//61629 :	128342,
 						//61630 :	128343,
 						//61631 :	128344,
 						//61632 :	128345,
 						//61633 :	128346,
 						//61634 :	128347,
 						// 61635 - 61652  no equivalent
 						61653 :	9003,
 						61654 : 8998,
 						// 61655 no equivalent
 						61656 :	10146,
 						// 61657 - 61659 no equivalent
 						61660 :	10162,
 						// 61661 - 61671 no equivalent
 						61663 : 8592,
 						61672 :	10132,
 						// 61673 - 61678 no equivalent
 						61679 :	8678,
 						61680 :	8680,
 						61681 :	8679,
 						61682 :	8681,
 						61683 :	11012,
 						61684 :	8691,
 						61685 :	11008,
 						61686 :	11009,
 						61687 :	11011,
 						61688 :	11010,
 						61689 :	9645,
 						61690 :	9643,
 						61691 :	10007,
 						61692 :	10003,
 						61693 :	9746,
 						61694 :	9745,
 						61695 :	10003, // work around  Ballot box with check -> Check mark
						65279 : 65279     // Space
					  },
					  "symbol" : { 
							61473   :   33,
							61474   :   8704,
							61475   :	35,
							61476	:	8707,
							61477	:	37,
							61478	:	38,
							61479	:	8717,
							61480	:	40,
							61481	:	41,
							61482	:	8727,
							61483	:	43,
							61484	:	44,
							61485	:	8722,
							61486	:	46,
							61487	:	47,
							61488	:	48,
							61489	:	49,
							61490	:	50,
							61491	:	51,
							61492	:	52,
							61493	:	53,
							61494	:	54,
							61495	:	55,
							61496	:	56,
							61497	:	57,
							61498	:	58,
							61499	:	59,
							61500	:	60,
							61501	:	61,
							61502	:	62,
							61503	:	63,
							61504	:	8773,
							61505	:	913,
							61506	:	914,
							61507	:	935,
							61508	:	916,
							61509	:	917,
							61510	:	934,
							61511	:	915,
							61512	:	919,
							61513	:	921,
							61514	:	977,
							61515	:	922,
							61516	:	923,
							61517	:	924,
							61518	:	925,
							61519	:	927,
							61520	:	928,
							61521	:	920,
							61522	:	929,
							61523	:	931,
							61524	:	932,
							61525	:	933,
							61526	:	950,
							61527	:	937,
							61528	:	926,
							61529	:	936,
							61530	:	918,
							61531	:	91,
							61532	:	8756,
							61533	:	93,
							61534	:	8869,
							61535	:	95,
							//61536	:		,
							61537	:	945,
							61538	:	946,
							61539	:	967,
							61540	:	948,
							61541	:	949,
							61542	:	966,
							61543	:	947,
							61544	:	951,
							61545	:	964,
							61546	:	981,
							61547	:	954,
							61548	:	955,
							61549	:	956,
							61550	:	957,
							61551	:	959,
							61552	:	960,
							61553	:	952,
							61554	:	961,
							61555	:	963,
							61556	:	964,
							61557	:	965,
							61558	:	982,
							61559	:	969,
							61560	:	958,
							61561	:	968,
							61562	:	962,
							61563	:	123,
							61564	:	124,
							61565	:	125,
							61566	:	8764,
							//61567	:		,
							//61568	:		,
							//61569	:		,
							//61570	:		,
							//61571	:		,
							//61572	:		,
							//61573	:		,
							//61574	:		,
							//61575	:		,
							//61576	:		,
							//61577	:		,
							//61578	:		,
							//61579	:		,
							//61580	:		,
							//61581	:		,
							//61582	:		,
							//61583	:		,
							//61584	:		,
							//61585	:		,
							//61586	:		,
							//61587	:		,
							//61588	:		,
							//61589	:		,
							//61590	:		,
							//61591	:		,
							//61592	:		,
							//61593	:		,
							//61594	:		,
							//61595	:		,
							//61596	:		,
							//61597	:		,
							//61598	:		,
							//61599	:		,
							//61600	:		,
							61601	:	978,
							//61602	:		,
							61603	:	8804,
							61604	:	8260,
							61605	:	8734,
							61606	:	402,
							61607	:	9827,
							61608	:	9830,
							61609	:	9829,
							61610	:	9824,
							61611	:	8596,
							61612	:	8592,
							61613	:	8593,
							61614	:	8594,
							61615	:	8595,
							61616	:	176,
							61617	:	177,
							61618	:	8243,
							61619	:	8805,
							61620	:	215,
							61621	:	8733,
							61622	:	8706,
							61623	:	8226,
							61624	:	247,
							61625	:	8800,
							61626	:	8801,
							61627	:	8776,
							61628	:	8230,
							61629	:	9168,
							61630	:	9135,
							61631	:	8629,
							61632	:	8501,
							61633	:	8465,
							61634	:	8476,
							61635	:	8472,
							61636	:	8855,
							61637	:	8853,
							61638	:	8709,
							61639	:	8745,
							61640	:	8746,
							61641	:	8835,
							61642	:	8839,
							61643	:	8836,
							61644	:	8834,
							61645	:	8838,
							61646	:	8712,
							61647	:	8713,
							61648	:	8736,
							61649	:	8711,
							61650	:	174,
							61651	:	169,
							61652	:	8482,
							61653	:	928,
							61654	:	8730,
							61655	:	8901,
							61656	:	172,
							61657	:	8743,
							61658	:	8744,
							61659	:	8660,
							61660	:	8656,
							61661	:	8657,
							61662	:	8658,
							61663	:	8659,
							61664	:	9674,
							61665	:	9001,
							61666	:	174,
							61667	:	169,
							61668	:	8482,
							61669	:	8721,
							61670	:	9115,
							61671	:	9116,
							61672	:	9117,
							61673	:	9121,
							61674	:	9122,
							61675	:	9123,
							61676	:	9127,
							61677	:	9128,
							61678	:	9129,
							61679	:	9125,
							//61680	:		,
							61681	:	9002,
							61682	:	8747,
							61683	:	8992,
							61684	:	9134,
							61685	:	8993,
							61686	:	9118,
							61687	:	9119,
							61688	:	9120,
							61689	:	9124,
							61690	:	9125,
							61691	:	9126,
							61692	:	9131,
							61693	:	9132,
							61694	:	9133,
							65279   : 65279   // Space
						}
};

concord.util.mobileUtil.disablePresEditing = true;
concord.util.mobileUtil.useNativeSlideSorter = true;

concord.util.mobileUtil.jsObjCBridge = {
	isProcessing: false,
	eventsQueue: [],
	_buildEventsUrl: function(events){
		return "iconcord:" + window.encodeURIComponent( dojo.toJson(events));
	},
	postEvents: function(events){
		if(!concord.util.browser.isMobile()) {
			return;
		}
		if (window.webkit && webkit.messageHandlers && window.webkit.messageHandlers["iconcord"]) {
			window.webkit.messageHandlers["iconcord"].postMessage(events);
			return;
		}
		
		if ( this.isProcessing ){
			this.eventsQueue = this.eventsQueue.concat(events);
			return;
		}
		var eventsUrl = this._buildEventsUrl(events);
		this.isProcessing = true;
		document.location = eventsUrl;
	},
	processQueuedEvents: function(){
		if(!concord.util.browser.isMobile()) {
			return;
		}
		if ( this.eventsQueue.length > 0 ){
			var eventsUrl = this._buildEventsUrl(this.eventsQueue);
			this.eventsQueue = [];
			this.isProcessing = true;
			document.location = eventsUrl;
		} else {
			this.isProcessing = false;
		}
	},
	log: function(logString){
		var events = [];
		var params = [logString];
		events.push({"name":"log", "params":params});
		this.postEvents(events);
	}
};

concord.util.mobileUtil.appendStyleText = function(editor, styleText)
{
	var styleNode = editor.document.getById("runtimeMobileStyle");
	if (styleNode == null)
	{
		var head = editor.document.getHead();
		styleNode = editor.document.createElement("style", {attributes:{id:"runtimeMobileStyle",type:"text/css"}});
		head.append(styleNode);	
	}
	var rules = editor.document.createText(styleText);
	if (styleNode.$.styleSheet)
		styleNode.$.styleSheet.cssText += rules.getText();
	else
		styleNode.append(rules);
};

concord.util.mobileUtil.appendStyleTextWithStyleId = function(editor, styleId, styleText)
{
	var styleNode = editor.document.getById(styleId);
	if (styleNode == null)
	{
		var head = editor.document.getHead();
		styleNode = editor.document.createElement("style", {attributes:{id:styleId,type:"text/css"}});
		head.append(styleNode);	
	}
	var rules = editor.document.createText(styleText);
	if (styleNode.$.styleSheet)
		styleNode.$.styleSheet.cssText += rules.getText();
	else
		styleNode.append(rules);
};

concord.util.mobileUtil.addCSSforFontFallback = function(editor)
{
	if(!editor)
		return;

	var data = concord.util.mobileUtil.fontFallback;
	if(data)
	{
		var styleText = "";
		for( var font in data)
		{
			styleText += '@font-face { font-family: "' + font + '"; ' +
							'src: local("' + data[font] +'");' + 
							'font-style: normal; font-weight: normal;} ';
		}
        concord.util.mobileUtil.appendStyleText(editor, styleText);
	}
};

// create styles for font, font size and heading.
concord.util.mobileUtil.getStyles = function(editor, type)
{
	var config = editor.config;
	var entries, styleDefinition, styleType;
	if(type=="font")
	{
		entries = concord.editor.PopularFonts.getLangSpecFont();
		styleDefinition = editor.config.font_style;
		styleType = "family";
	}
	else if(type=="fontSize")
	{
		entries = editor.config.fontSize_sizes;
		styleDefinition = editor.config.fontSize_style;
		styleType = "size";
	}
	else if(type=="heading")
	{
		entries = editor.config.format_tags;
		styleDefinition = null;
		styleType = null;
	}
	else
		return null;
	var names = entries.split( ';' );
	var styles = {};
	styles.names= [];
	for ( var i = 0 ; i < names.length ; i++ )
	{
		var parts = names[ i ].split( '/' );
		var name = parts[ 0 ];
		if(type=="heading")
		{
			styles[ name ] = new CKEDITOR.style( editor.config[ 'format_' + name ] );
		}
		else
		{
			var vars = {};
			vars[ styleType ]  = parts[ 1 ] || name;
			styles[ name ] = new CKEDITOR.style( styleDefinition, vars );
			styles.names.push( name );
		}
		// index should not be 0, since 0 is disable state and can not execute command.
		styles[ name ].index = i+1; 
	}
	return styles;
};

concord.util.mobileUtil.applyStyle = function(editor, data)
{
	var styles = data.styles, style = null;
	for(var name in styles)
	{
		if( styles[name].index == data.index )
		{
			style = styles[name];
			break;
		}
	}
	if(style == null)
		return;
		
	editor.focus();
	editor.fire( 'saveSnapshot' );
	style.apply( editor.document );
	setTimeout( function()
	{
		editor.fire( 'saveSnapshot' );
	}, 0 );
};

concord.util.mobileUtil.applyTableStyle = function(editor, data)
{
	editor.fire('applyTableStyle', data);
};

concord.util.mobileUtil.insertTable = function(editor, data)
{
	var evData = {
			selectedTableType: 'simpleST',
			stName: '',
			initCols: 4,
			initRows: 4,
			newTableStyleClass: data.tableStyleClass
		};
	editor.fire('genSmartTableAndApplyStyle', evData);
};

concord.util.mobileUtil.insertSpeChar = function(editor, data)
{
	editor.insertHtml( data.insertChar );
};

concord.util.mobileUtil.image = {
	nls : null,
	imageLoadingTimeOut : null,
	selectedImage : null,
	showImageURLisNullMessage : function()
	{
		if(this.nls == null)
			this.nls = dojo.i18n.getLocalization("concord.widgets","InsertImageDlg");
		pe.scene.showWarningMessage(this.nls.urlIsNull,2000);
	},
	showUnsupportMessage : function()
	{
		if(this.nls == null)
			this.nls = dojo.i18n.getLocalization("concord.widgets","InsertImageDlg");
		pe.scene.showWarningMessage(this.nls.unsupportedImage,2000);
	},
	showImageTooLargeMessage : function()
	{
		if(this.nls == null)
			this.nls = dojo.i18n.getLocalization("concord.widgets","InsertImageDlg");
		pe.scene.showErrorMessage(dojo.string.substitute(this.nls.maxSize,[g_maxImgSize]),2000);
	},
	showImageLoadingMessage : function()
	{
		if(this.nls == null)
			this.nls = dojo.i18n.getLocalization("concord.widgets","InsertImageDlg");
		var messageStr = this.nls.loading;
		this.imageLoadingTimeOut = setTimeout(function(){
			dojo.hitch(pe.scene,pe.scene.showWarningMessage(messageStr,60000));
		},500);
	},
	processNativeUploadImageEvent : function(data)
	{
		if(this.nls == null)
			this.nls = dojo.i18n.getLocalization("concord.widgets","InsertImageDlg");
		if( this.imageLoadingTimeOut )
			clearTimeout(this.imageLoadingTimeOut);
		this.imageLoadingTimeOut = null;
		imageLoadingTimeOut = null;
		pe.scene.hideErrorMessage();
		var resultElement = dojo.create('div',{'innerHTML':data.resultString});
		var json = dojo.fromJson(resultElement.firstChild.innerHTML);
		var url = null;
		var errorMessage = null;
		if(json && json.attachments && json.attachments.length>0)
		{
			url = json.attachments[0].url;
			errorMessage = json.attachments[0].msg;
		}
		if(!url || errorMessage)
		{
			if(errorMessage == 'insert_image_server_error')
			{
				var insertImageErrorMsg = this.nls.insertImageErrorP1 + '<br>' + this.nls.insertImageErrorP2
	                                      + '<br>' + this.nls.insertImageErrorP3;
			    pe.scene.showErrorMessage(insertImageErrorMsg,10000);			   
			}
		       else
	        {
	            pe.scene.showErrorMessage(dojo.string.substitute(this.nls.maxSize,[errorMessage]),2000);
	        }
			return; 
		}
		//pe.scene.uploadImage(url, data.width, data.height);
		if (pe.lotusEditor)
		{
			// case Document:
			pe.lotusEditor.execCommand("insertImage", [url, null, function(){
				var events = [{"name":"dismissImageUploadDialog", "params":[]}];
				concord.util.mobileUtil.jsObjCBridge.postEvents(events);
			}]);
		}
		else
		{
			// case Presentation:
			pe.scene.slideEditor.createBox("image", {url: url});
			concord.util.mobileUtil.jsObjCBridge.postEvents([{"name":"dismissImageUploadDialog", "params":[]}]);

		}
	},
	show : function(image)
	{
		this.selectedImage = image;
		var imageInfo = image ? image.getMobileImageInfo() : {};
		concord.util.mobileUtil.jsObjCBridge.postEvents([{"name":"imageResize", "params":[imageInfo]}]);
	},
	resizeImage : function(deltaW, deltaH)
	{
		this.selectedImage && this.selectedImage.resize(deltaW, deltaH);
	}
};

concord.util.mobileUtil.getColor = function(data)
{
	var style, evaluator;
	var type = data.type;
	if(type == 'fore')
	{
		style = "color";
		evaluator = concord.text.tools.textEvaluator;
	}
	else if(type == 'fill')
	{
		style = "background-color";
		evaluator = concord.text.tools.tableEvaluator;
	}
	else if(type == 'back')
	{
		style = "background-color";
		evaluator = concord.text.tools.textEvaluator;
	}
	else
	{
		return null;
	}
	
	var rangeStyle=null;
	if( pe.scene.docType == 'pres')
		rangeStyle = PresCKUtil.fixColorPanelMultiSelect(null,[],true,concord.util.presToolbarMgr.findActiveTbEditor(),style);
	else{
		var sel = pe.lotusEditor.getSelection();
		if(sel.getCursor()){//layout engine
			var cursor = sel.getCursor();
			var cursorCtx = cursor.getContext();
			var textStyle = cursorCtx._run.getComputedStyle();
			rangeStyle = concord.text.tools.colorHex(textStyle[style]);
		}else{
			rangeStyle = concord.text.tools.fixColorPanelMultiSelect(null,[],false,style,evaluator);	
		}
	}

	if(rangeStyle == "inherit" || rangeStyle.toLowerCase().replace(/\s*/g,"").match(/rgba\(\d+,\d+,\d+,0\)/))
		rangeStyle = "transparent";
	return rangeStyle;
};

concord.util.mobileUtil.setColor = function(editor, data)
{
	editor.focus();
	var type = data.type;
	var color = data.color;
	if(type == 'fore' || type == 'back')
	{
		var style = new CKEDITOR.style( editor.config['colorButton_' + type + 'Style'], color ? { color : color } : {color : 'inherit' } );
		editor.fire( 'saveSnapshot' );
		if ( color && color != "" )
			style.apply( editor.document );
		else
			style.remove( editor.document );
		editor.fire( 'saveSnapshot' );
	}else if(type == 'fill'){
		// Set background color in Presentation
		var eventData = [{eventName: concord.util.events.presToolbarEvents_eventName_concordBGFill, color:color}];
		window.concord.util.events.publish(window.concord.util.events.presToolbarEvents, eventData);  	
		
		// Set background color in Document
		editor.fire('setBGFill', {color:color});
	}else if(type == 'border'){
		// Set border color in Presentation
		var eventData = [{eventName: concord.util.events.presToolbarEvents_eventName_concordBorderColor, color:color}];
		window.concord.util.events.publish(window.concord.util.events.presToolbarEvents, eventData);
	}
};

concord.util.mobileUtil.getTableBorderStyle = function()
{
	var hasClass = function(element, classList)
	{
		if( element && element.hasClass )
		{
			for (var i = 0; i < classList.length; i++){
				if( element.hasClass(classList[i]) )
					return true;
			}
		}
		return false;
	};
	var isDefinedBorderStyle = function(style){
		for (var i = 0; i < borderStyle.length; i++){
			if( borderStyle[i]== style ){
				return i;
			}
		}
		return -1;
	};
	var isDefinedBorderWidth = function(width, borderWidth){
		for (var i =0;i< borderWidth.length;i++ ){
			if( borderWidth[i]==width ){
				return i;
			}
		}
		return -1;
	};
	var sel = pe.lotusEditor.getSelection();
	var range = sel.getRanges()[0];
	var startContainer= range.startContainer;
	var table = startContainer.getAscendant('table',true);
	if(table==null){
		return "";
	}
	var tableBorderStyle = table.getStyle('border-style');
	var tableBorderWidth = table.getStyle("border-width");
	var tableBorderColor = table.getStyle("border-color");
	// Some concord table style have same border style for all td.
	var classList = ['st_plain','st_green_style','st_blue_style','st_dark_gray','st_gray_tint',
	                 'st_purple_tint','st_red_tint','st_blue_tint','st_green_tint'];
	var borderStyle = ['none','solid','double','dashed','dotted','ridge','groove'];
	if(tableBorderStyle == "" && hasClass(table,classList)){
		var tbody = table.getLast();
		if( tbody && tbody.is && tbody.is('tbody')){
			cell = tbody.getChildren().getItem(0).getChildren().getItem(0);
			if( cell && cell.is && (cell.is('td','th') ) ){
				tableBorderStyle = cell.getComputedStyle('border-bottom-style');
				tableBorderWidth = cell.getComputedStyle('border-bottom-width');
				tableBorderColor = cell.getComputedStyle('border-bottom-color');
			}
		}
	}
	tableBorderWidth = CKEDITOR.tools.toPtValue(tableBorderWidth);
	tableBorderColor = concord.text.tools.colorHex(tableBorderColor);
	var selectedStyle = isDefinedBorderStyle(tableBorderStyle);
	if( selectedStyle == 0 || tableBorderWidth == 0)
		return "";
	if(tableBorderColor == "inherit" || tableBorderColor.toLowerCase().replace(/\s*/g,"")=="rgba(0,0,0,0)")
		tableBorderColor = "transparent";
	return ""+tableBorderWidth + "," + (selectedStyle-1) + "," + tableBorderColor;
};

concord.util.mobileUtil.setTableBorderStyle = function(editor, data)
{
	var borderStyleIndex = data.borderStyle;
	var borderWidth = data.borderWidth;
	var borderColor = data.borderColor;
	var clearTableBorder = function(element){
		var styleStr = element.getAttribute("style");
		if(styleStr==null||styleStr==""){
			return "";
		}
		var styles =styleStr.split(/\s*;\s*/);
		var preservedStyle=[];
		for(var i =0;i< styles.length;i++){
			var style = styles[i];
			var match = style.match("border");
			if(style==""){
				continue;
			}
			if(match==null||match ==""||match==undefined){
				preservedStyle.push(style);
			}
			match = style.match("border-collapse");
			if(match!=null && match!="" && match!=undefined){
				preservedStyle.push("border-collapse: collapse");
			}
			match = style.match("border-spacing");
			if(match!=null && match!="" && match!=undefined){
				preservedStyle.push(style);
			}
		}
		var newStyleStr= preservedStyle.join(";");
		return newStyleStr;
	};
	
	var borderStyleArray = ["none","solid","double","dashed","dotted","ridge","groove"];

	if (CKEDITOR.env.ie && !editor.getSelection()){
		editor.focus();
	}
	var sel = editor.getSelection();
	var range = sel.getRanges()[0];
	var startContainer= range.startContainer;
	var table = startContainer.getAscendant('table',true);
	if(table==null){
		return ;
	}
	var tbody = table.getFirst();
	while(tbody && !tbody.is('tbody')){
		tbody = tbody.getNext();
	}
	if( tbody==null|| !tbody.is('tbody')){
		return;
	}
	if ( borderStyleIndex<-1 || borderStyleIndex>5){
		return;
	}
	
	var borderStyle = borderStyleArray[borderStyleIndex+1];
	
	if(borderStyle == "none")
		borderWidth = 1;
	var actList = [];
	var tmp_styles = {};
 	var tmp_attributes = {}; 
 	var tmp_oldstyles = {};
 	var tmp_oldatts = {};
 	var oldStyle = table.getAttribute("style");
 	if(oldStyle==null){
 		oldStyle ="";
 	}
 	var style = clearTableBorder(table);
	if(style==""){
		style = "border:"+ borderWidth+"pt "+ " "+borderStyle+" "+borderColor+";";
	}else{
		style = style+";border:"+ borderWidth+"pt "+ " "+borderStyle+" "+borderColor;
	}
	if( style!= oldStyle){
		tmp_oldatts.style=oldStyle;
		tmp_attributes.style= style;
		table.setAttribute('style',style);
		var act =SYNCMSG.createAttributeAct( table.getId(),tmp_attributes,tmp_styles,tmp_oldatts, tmp_oldstyles );
		actList.push(act);
	}
	var rows = tbody.getChildren();
	for ( var rindex =0;rindex< rows.count();rindex++){
		var row = rows.getItem(rindex);
		var cols = row.getChildren();
		for(var cindex=0;cindex<cols.count();cindex++){
			var col = cols.getItem(cindex);
			if(!col.getId()){
				continue;
			}
			var tmp_styles = {};
		 	var tmp_attributes = {}; 
		 	var tmp_oldstyles = {};
		 	var tmp_oldatts = {};
		 	var oldStyle = col.getAttribute("style");
		 	if(oldStyle==null){
		 		oldStyle ="";
		 	}
		 	var style = clearTableBorder(col);
			if(style==""){
				style = "border:"+ borderWidth+"pt "+ " "+borderStyle+" "+borderColor+";";
			}else{
				style = style+";border:"+ borderWidth+"pt "+ " "+borderStyle+" "+borderColor;
			}
			if( style!= oldStyle){
				tmp_oldatts.style=oldStyle;
				tmp_attributes.style= style;
				col.setAttribute('style',style);
				var act =SYNCMSG.createAttributeAct( col.getId(),tmp_attributes,tmp_styles,tmp_oldatts, tmp_oldstyles );
				actList.push(act);
			}				
		}
	}
	var msg =SYNCMSG.createMessage(MSGUTIL.msgType.Table,actList,null,table.getId());
	SYNCMSG.sendMessage([msg]);
};

concord.util.mobileUtil.loadAllComments = function()
{
	try
	{
		if (!pe.scene.getSession().commentsProxy) {
			dojo.require("concord.xcomments.CommentsStore");
			// for spreadsheet, the comments proxy is constructed when sidebar initailize
			// while mobile will never show sidebar, so here we need manually create comments proxy
			var store = new concord.xcomments.CommentsStore(pe.scene.getSession().url, true);
			pe.scene.getSession().registerCommentsProxy(store.proxy);
		}
		pe.scene.getSession().commentsProxy.getAll();
	}
	catch(err)
	{
		return "err:" & err.message;
	}
	
	return "success";
};
concord.util.mobileUtil.createCommentWithJSON = function (jsObj)
{
	try
	{
		var responseTo = null;
		if( jsObj.commentId )
			responseTo = jsObj.commentId;
		
		var content = jsObj.content;
		var assigneeId = null;
		if( jsObj.assigneeId)
			assigneeId = jsObj.assigneeId;
		var assigneeOrg = null;
		if( jsObj.assigneeOrg)
			assigneeOrg = jsObj.assigneeOrg;
		
		return concord.util.mobileUtil.createComment( responseTo, content, assigneeId, assigneeOrg );
	}
	catch( err )
	{
		return "errJSON: " + err.message;
	}
	
};

concord.util.mobileUtil.createComment = function(responseTo, content, assigneeId, assigneeOrg)
{
	try
	{
		var assignee = {
			id : [assigneeId],
			org : [assigneeOrg]
		};
		var user = {
			uid : pe.authenticatedUser.getId(),
			org : pe.authenticatedUser.getOrgId(),
			name : pe.authenticatedUser.getName()
		}; 
		 
	    var e = concord.xcomments.CommentItem.createItem(content, user, assignee);
	    var rst;
		if( responseTo )
		{
			// reply a comment
			pe.scene.commentsAppended(responseTo, e);
			rst = e.toJSObj();
			concord.net.Beater.beat(false,true,true);
		}
		else
		{
			// create new comment;
			var comment = new concord.xcomments.Comments(null);
			comment.appendItem(e); 
			pe.scene.commentsCreated(comment);
			rst = comment.toJSObj();
		}
		return 'success:' + dojo.toJson( rst );
	}
	catch(err)
	{
		return 'err' + err.message;
	}
};

concord.util.mobileUtil.deleteComment = function(commentsId)
{
	var commentPane = null;
	if(pe.scene.sidebar && pe.scene.sidebar.getCommentPane && (commentPane = pe.scene.sidebar.getCommentPane()))
		commentPane._deleteComments(commentsId);
	else
		pe.scene.commentsDeleted(commentsId);
	concord.net.Beater.beat(false,true,true);
	concord.util.mobileUtil.tableResize.refresh();
	return "success";
};

concord.util.mobileUtil.backupSelection = function(commentsId)
{
	if( pe.scene.docType == 'text')
	{
		try
		{
			var ranges = pe.lotusEditor.getSelection().getRanges();
			concord.util.mobileUtil.selectionRanges = [];
			for( var i=0;i<ranges.length;i++  )
			{
				concord.util.mobileUtil.selectionRanges.push( ranges[i].clone() );
			}
		}
		catch(err)
		{
		}
	}
};
concord.util.mobileUtil.getiOSVersion = function(){
	var userAgent = navigator.userAgent;
	var res;
	if(/(iPad|iPhone|iPod)/i.test(userAgent)){
		res =userAgent.match(/\d_\d(_\d)?/);
		if(res)
			res = res[0].replace(/_/g,".");
	}
	return res;
};

concord.util.mobileUtil.newDocResponse = function(app, fromTemplate, response, ioArgs ) {
	if (ioArgs.xhr.status==201) {
		dojo.require("concord.util.uri")
		var docBean = new concord.beans.Document(response);
		var newUri;
	
		if (fromTemplate)
			newUri = concord.util.uri.getDocPageUri(docBean) + "?fromTemplate=true";
		else
			newUri = concord.util.uri.getDocPageUri(docBean);
		var events = [];
		var params = [docBean.getTitle() + "." + docBean.getExtension(), newUri, docBean.getUri()];
		events.push({"name":"createFileSuccess", "params":params});
		concord.util.mobileUtil.jsObjCBridge.postEvents(events);

		//document.location = newUri;
	} else {
		if (!this.nls)
		{
			dojo.requireLocalization("concord.scenes","Scene");
			this.nls = dojo.i18n.getLocalization("concord.scenes","Scene");
		}
		var errMsg;

		if (ioArgs.xhr.status==409){
			if(app == 'text')
				errMsg = this.nls.newDocTextErrMsg3;
			if(app == 'spreadsheet')
				errMsg = this.nls.newDocSheetErrMsg3;
			if(app == '')
				errMsg = this.nls.newDocPresErrMsg3;
			//pe.scene.showErrorMessage(outOfSpace, 15000);
		} else {
			if ( fromTemplate) { 
				if(app == 'text')
					errMsg = this.nls.newDocTextErrMsg2;
				if(app == 'spreadsheet')
					errMsg = this.nls.newDocSheetErrMsg2;
				if(app == '')
					errMsg = this.nls.newDocPresErrMsg2;
			}
			else {
				if(app == 'text')
					errMsg = this.nls.newDocTextErrMsg;
				if(app == 'spreadsheet')
					errMsg = this.nls.newDocSheetErrMsg;
				if(app == '')
					errMsg = this.nls.newDocPresErrMsg;
			}
			//pe.scene.showErrorMessage(dojo.string.substitute(errMsg, [app]), 15000);
		}
		
		var events = [];
		var params = [-1, "", errMsg];
		events.push({"name":"postError", "params":params});
		concord.util.mobileUtil.jsObjCBridge.postEvents(events);
	}
	
		
};



concord.util.mobileUtil.createNewTextDoc = function(title, fromTemplate, params)
{
	var servletUrl = concord.util.uri.getDocServiceRoot() + "/text";
	var emptyDoc;
	if( params )
	{
		emptyDoc = params;
		if( params.community )
			servletUrl += "?communityuuid=" + params.community;
	}
	else
		emptyDoc = {};
	emptyDoc.newTitle = title;
	var sData = dojo.toJson(emptyDoc);
	dojo.xhrPost({
			url: servletUrl,
			handleAs: "json",
			handle: dojo.hitch(concord.util.mobileUtil, concord.util.mobileUtil.newDocResponse, 'text', fromTemplate),
			sync: true,
			contentType: "text/plain",
			postData: sData
	});
};


concord.util.mobileUtil.createNewPresDoc = function( title, params) {
	var servletUrl = concord.util.uri.getDocServiceRoot() + "/pres";
	var data;
	if( params )
	{
		data = params;
		if( params.community )
			servletUrl += "?communityuuid=" + params.community;
	}
	else
		data = {};
	
	data.newTitle = title;
	data.template = "default";
	var sData = dojo.toJson(data);
	dojo.xhrPost ({
		url: servletUrl,
		handleAs: "json",
		handle: dojo.hitch(this, this.newDocResponse, '', false ),
		sync: true,
		contentType: "text/plain",
		postData: sData
	});
};

concord.util.mobileUtil.createNewSheetDoc = function( title, fromTemplate, params) {
	var servletUrl = concord.util.uri.getDocServiceRoot() + "/sheet";
	var data;
	if( params)
	{
		data = params;
		if( params.community )
			servletUrl += "?communityuuid=" + params.community;
	}
	else
	{
		data = {};
	}
	data["newTitle"] = title;
	// create 3 init sheets name
	if (!this.nls)
	{
		dojo.requireLocalization("concord.scenes","Scene");
		this.nls = dojo.i18n.getLocalization("concord.scenes","Scene");
	}
	
	data["st0"] = this.nls.st0;
	data["st1"] = this.nls.st1;
	data["st2"] = this.nls.st2;
	data["locale"] = g_locale;
	if(fromTemplate)
	{
		data.templateId = concord.util.mobileUtil.spreadsheetTemplateId;
	}
	
	var sData = dojo.toJson(data);
	dojo.xhrPost ({
		url: servletUrl,
		handleAs: "json",
		handle: dojo.hitch(this, this.newDocResponse, 'spreadsheet', false),
		sync: true,
		contentType: "text/plain",
		postData: sData
	});
};

concord.util.mobileUtil.createNewDoc = function(docObj)
{
	try
	{
		switch( docObj.docType ){
			case 0: return concord.util.mobileUtil.createNewTextDoc(docObj.title,docObj.fromTemplate, docObj.params);
			case 1: return concord.util.mobileUtil.createNewPresDoc(docObj.title, docObj.params);
			case 2: return concord.util.mobileUtil.createNewSheetDoc(docObj.title, docObj.fromTemplate, docObj.params);
			default:break;
		} 
	}
	catch(err)
	{
		alert(err.message);
	}
};
//#15395,when set B/I/U from context menu of iPad UIWebView, then browser itself will add tag <b><i><u>, and these tags can not be 
//handled by IBM Docs, so need to use <span style="font-weight:bold,font-style:italic,text-decoration:underline"> to replace these tags
//this function will iterate all children to normalize
concord.util.mobileUtil.normalizeElements = function( node,root)
{
	var child = node.getFirst(),next;
	var totalLen=0;
	if(root){
		totalLen= MSGUTIL.getNodeLength(root);
	}
	var divs = [],dlNode;
	while( child )
	{
		next = child.getNext();
		if( child.type == CKEDITOR.NODE_ELEMENT )
		{
			concord.util.mobileUtil.normalizeElements( child ,root);
			if( child.getDtd() == null )
			{ //not supported tag
				child.remove(true);
				child = next;
				continue;
			}
			
			if( child.getChildCount()==0 && child.is('table','form','fieldset','menu','ol','ul','dl','blockquote','dir','center') )
			{
				child.remove();
				child = next;
				continue;
			}
			if( child.getStyle('position') == 'absolute' )
			{
				child.removeStyle('position');
				child.removeStyle('left');
				child.removeStyle('top');
			}
			concord.util.mobileUtil.fixStyles( child );
		}
		else if ( !child.type  )
		{ //maybe comments ...
			child.remove();
		}
		child = next;
	}
};
//#15396,replace tag <b><i><u><strike> with <span style="font-weight:bold,font-style:italic,text-decoration:underline,text-decoration:strike"> 
concord.util.mobileUtil.fixStyles = function(node)
{
	var tag = node.getName();
	var styles;
	switch(tag)
	{
		case 'b':
			styles = {name:'font-weight',value:"bold"};
		break;
		case 'i':
			styles = {name:'font-style',value:"italic"};
		break;
		case 'u':
			styles = {name:'text-decoration',value:"underline"};
		break;
		case 'strike':
			styles = {name:'text-decoration',value:"line-through"};
		break;
	};
	if( styles){
		var p = node.getParent();
		
		var next = node.getNext();
		//#30406, <b>xx<b>&#8203,  node maybe followed by a zero width space char, then move it into node.
		if (pe.scene.docType == "pres" && next && next.type == CKEDITOR.NODE_TEXT && next.$.length == 1 && next.$.textContent.charCodeAt(0)==8203 )
			node.append(next.remove());

		if(p.getChildCount() == 1 && p.is('span')){
			MSGUTIL.moveChildren(node);
		}else{
			p = null;
			var lastChild;
			if(MSGUTIL.isBogus(lastChild = node.getLast())){
				//like <li><b><span>abc<span><br class="hideInIE"><b><ol>...</li>.
				//then bogus br should not located in b, but the very last element of its parent li
				lastChild.remove().insertAfter(node);
			}
			if( node.getChildCount() == 1 )
			{
				var child = node.getFirst();
				if( child.is && child.is('span'))
				{// if node only have one child, and this child is a span,then set style to this span
					MSGUTIL.moveChildren(node);
					node = p = child;
				}
			}
			if(node.$.innerText.replace(/\n/g,'').length == 0){
				// like <u><br class="lb"></u> or <b><img></b>,just need to remmove this useless tag
				//if block is empty or only have children like img,then need to set style to this block
				var block = MSGUTIL.getBlock(node);
				if(block.$.innerText.replace(/\n/g,'').length == 0)
					p = block;
				MSGUTIL.moveChildren(node);
			}
			if( !p)
			{
				if(!MSGUTIL.isBlockInDomTree(node))
					return;
				node.renameNode('span');
				p = node;
			}
		}
		if(MSGUTIL.isTextDecorationStyle(styles.value)){
			MSGUTIL.setStyle(p,styles.value,styles.value);	
		}else{
			MSGUTIL.setStyle(p,styles.name,styles.value);
		}
			
		var parent = MSGUTIL.getBlock(p);
		if(tag != 'u' && tag != 'strike'){
			if((MSGUTIL.isParagraph(parent) || MSGUTIL.isHeading(parent)) && MSGUTIL.getNodeLength(parent) == MSGUTIL.getNodeLength(p)){
				MSGUTIL.setStyles(parent,styles);
				if(MSGUTIL.isListItem(parent.getParent()))
					parent = parent.getParent();
			}
			if(MSGUTIL.isListItem(parent) && MSGUTIL.getBulletTextNodeLength(parent) == MSGUTIL.getNodeLength(p)){
				MSGUTIL.setStyles(parent,styles);
				var liList = parent.$.querySelectorAll('li');
				var i,subStyle,li;
				switch(tag)
				{
					case 'b':
						subStyle = {name:'font-weight',value:'normal'};
					break;
					case 'i':
						subStyle = {name:'font-style',value:'normal'};
					break;
				};
				for(i=0;i<liList.length;i++){
					li = new CKEDITOR.dom.element(liList[i]);
					if(!MSGUTIL.hasStyle(li,subStyle.name))
						li.setStyle(subStyle.name,subStyle.value);
				}
			}
		}
	}
};

concord.util.mobileUtil.chartRendered = function(param){
	var events = [];
	events.push({"name":"chartRendered","params":[param]});
	concord.util.mobileUtil.jsObjCBridge.postEvents(events);
};

concord.util.mobileUtil.snapPreStart = function(){
	var events = [];
	events.push({"name":"snapPreStart","params":[]});
	concord.util.mobileUtil.jsObjCBridge.postEvents(events);
};

concord.util.mobileUtil.totalSlide = function(num){
	if(num <= 0)
		return;
	var events = [];
	events.push({"name":"totalSlide","params":[num]});
	concord.util.mobileUtil.jsObjCBridge.postEvents(events);
};
concord.util.mobileUtil.delSlide = function(idx){
	if(idx >= 0){
		var events = [];
		events.push({"name":"delSlide","params":[idx]});
		concord.util.mobileUtil.jsObjCBridge.postEvents(events);	
	}
};
concord.util.mobileUtil.insSlide = function(idx){
	if(idx >= 0){
		var events = [];
		events.push({"name":"insSlide","params":[idx]});
		concord.util.mobileUtil.jsObjCBridge.postEvents(events);	
	}
};
concord.util.mobileUtil.changeSlide = function(id, nativeClick){
	if(id == undefined || id == null)return;
	var events = [];
	var info = concord.util.mobileUtil.presObject.getSlideInfo();
	info['nativeClick'] = nativeClick?1:0;
	events.push({"name":"presSlideChange","params":[id,info]});
	concord.util.mobileUtil.jsObjCBridge.postEvents(events);
};

concord.util.mobileUtil.clickCurrentSlide = function(slideDom)
{
	var sorter = pe.scene.slideSorter;
	var rect = slideDom.getBoundingClientRect();
	var param = {"x":rect.left+rect.width,"y":30+rect.top+rect.height*0.5};
	if(!window.pe.scene.checkClipboardFromOtherDoc())
		param["hasPaste"] = 1;
	
	var slideNumber = sorter.getSlideNumber(sorter.selectedSlide);
	var selectAll = sorter.multiSelectedSlides.length === sorter.slides.length;
    if(!selectAll && sorter.multiSelectedSlides.length === 1&&!sorter.isMultiSlidesHaveLockedSlide()){
    	if ( slideNumber != 1)
    		param["hasMoveUp"] = 1;
        if ( slideNumber != sorter.slides.length )
        	param["hasMoveDown"] = 1;
	}
	concord.util.mobileUtil.jsObjCBridge.postEvents([{"name":"presSlideMenu","params":[param]}]);
};

concord.util.mobileUtil.removeSlideCoeditIndicator = function(idx){
	if(idx >= 0){
		var events = [];
		events.push({"name":"removeSlideCoIndicator","params":[idx]});
		concord.util.mobileUtil.jsObjCBridge.postEvents(events);
	}
};

concord.util.mobileUtil.updateCoeditSlideIndicator = function(idx,color,name){
	if(idx >= 0 && color && color !="" && name && name != ""){
		var events = [];
		events.push({"name":"updateSlideCoIndicator","params":[idx,color,name]});
		concord.util.mobileUtil.jsObjCBridge.postEvents(events);
	}
};

concord.util.mobileUtil.showMessage = function(message){
	var events = [];
	var params = [message];
	events.push({"name":"showMessage", "params":params});
	concord.util.mobileUtil.jsObjCBridge.postEvents(events);
};

concord.util.mobileUtil.contextMenuShow = function(isShow){
	if(isShow){
		pe.lotusEditor.isContextMenuShow = true;
		concord.util.browser.hideImageIndicator(pe.lotusEditor.document);
	}
};

concord.util.mobileUtil.presObject = {
	contextMenu : function(contentBox, menuItems)
	{
		if(pe.scene.slideShowInProgress())
			return;
		if(!contentBox || !contentBox.mainNode)
			return;
		var events = [];
		var param = {};
		if(menuItems && menuItems.length)
		{
			param["items"] = menuItems;
			var slideEditor = window.pe.scene.slideEditor;
			var editorTop = slideEditor.mainNode.offsetTop;
			var editorLeft = slideEditor.mainNode.offsetLeft;
			var delta = 3;
			param["t"] = contentBox.mainNode.offsetTop + editorTop - delta;
			param["l"] = contentBox.mainNode.offsetLeft + editorLeft;
			param["w"] = contentBox.mainNode.offsetWidth;
			param["h"] = contentBox.mainNode.offsetHeight + 2*delta;
			contentBox.isMenuShow = true;
		} else
			contentBox.isMenuShow = false;
		events.push({"name":"objectContextMenu", "params":[param]});
		concord.util.mobileUtil.jsObjCBridge.postEvents(events);
	},
	
	deleteCurrentObject : function()
	{
		pe.scene.slideEditor.deleteSelectedContentBoxes();
	},
	
	getSlideInfo : function()
	{
		return window.pe.scene.slideEditor.getSlideInfo();
	},
	
	selectObject : function(id)
	{
		var contentObj = pe.scene.slideEditor.getRegisteredContentBoxById(id);
		if(contentObj)
		{
			if(!contentObj.isWidgitized)
				contentObj = pe.scene.slideEditor.widgitizeObject(contentObj);
			contentObj.chkTimelyClickToGoInEditMode();
			contentObj.boxSelected = true;
		}
	},
	
	moveObjectStart : function(id)
	{
		var contentObj = pe.scene.slideEditor.getRegisteredContentBoxById(id);
		if(contentObj && contentObj.mainNode)
		{
			contentObj.mainNode.style.display = "none";
			if(contentObj.contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE
					&& contentObj.boxRep && contentObj.boxRep.mainNode)
				contentObj.boxRep.mainNode.style.display = "none";
		}
	},
	
	moveObjectEnd : function(id, offsetX, offsetY)
	{
		var contentObj = pe.scene.slideEditor.getRegisteredContentBoxById(id);
		if(contentObj && contentObj.mainNode)
		{
			contentObj.mainNode.style.display = "";
			if(offsetX==0 && offsetY==0)
				return;
			var posL = parseFloat(contentObj.mainNode.offsetLeft);
            var posT = parseFloat(contentObj.mainNode.offsetTop);
            var newTop  = contentObj.PxToPercent(posT+offsetY,'height')+"%";
            var newLeft = contentObj.PxToPercent(posL+offsetX,'width')+"%";
            dojo.style(contentObj.mainNode,{'top':newTop,'left':newLeft}); 
            
            // reset the z-index
            var edtingZIndex = dojo.style(contentObj.mainNode,'zIndex');
    		if(contentObj.mainNode.origZ!=null && dojo.hasClass(contentObj.mainNode,'draw_frame')){
    			dojo.style(contentObj.mainNode, 'zIndex', contentObj.mainNode.origZ);
    		}
    		
            var objArray = pe.scene.slideEditor.buildDataList(objArray,contentObj,'Resizing'); 
            var eventData = [{'eventName': concord.util.events.LocalSync_eventName_multiBoxAttributeChange, 'ObjList':objArray}];
            concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
            
        	if(edtingZIndex){
				dojo.style(contentObj.mainNode, 'zIndex', edtingZIndex);
			}
        	
            if(contentObj.contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE
					&& contentObj.boxRep && contentObj.boxRep.mainNode)
            {
				contentObj.boxRep.mainNode.style.display = "";
				contentObj.boxRep.mainNode.style.top = contentObj.mainNode.style.top;
				contentObj.boxRep.mainNode.style.left = contentObj.mainNode.style.left;
            }
		}
	},
	
	resizeObject : function(id, handleType, offsetX, offsetY)
	{
		var contentObj = pe.scene.slideEditor.getRegisteredContentBoxById(id);
		if(contentObj && contentObj.mainNode)
		{
			var posL = parseFloat(contentObj.mainNode.offsetLeft);
            var posT = parseFloat(contentObj.mainNode.offsetTop);
            var posH = contentObj.mainNode.offsetHeight - contentObj.getHeight_adjust();
            var posW = contentObj.mainNode.offsetWidth - contentObj.getWidth_adjust();
			var fun = contentObj["resizeFromHandler"];
			var preEditMode = contentObj.editModeOn;
			contentObj.editModeOn = true;
			contentObj[handleType+"_move"] = true;
			fun && fun.call(contentObj,posL,posT,posH,posW,0,0,{clientX:offsetX,clientY:offsetY},handleType);
			contentObj[handleType+"_move"] = null;
			contentObj.editModeOn = preEditMode;
        		
            var edtingZIndex = dojo.style(contentObj.mainNode,'zIndex');
    		if(contentObj.mainNode.origZ!=null && dojo.hasClass(contentObj.mainNode,'draw_frame')){
    			dojo.style(contentObj.mainNode, 'zIndex', contentObj.mainNode.origZ);
    		}
    		
			contentObj.publishBoxStyleResizingEnd();
			
			if(edtingZIndex){
				dojo.style(contentObj.mainNode, 'zIndex', edtingZIndex);
			}
		}
		//update the native view after the resize.
		concord.util.mobileUtil.presObject.processMessage(id, MSGUTIL.actType.setAttributes);
        if(contentObj.contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE
				&& contentObj.boxRep && contentObj.boxRep.mainNode)
        {
			contentObj.boxRep.mainNode.style.top = contentObj.mainNode.style.top;
			contentObj.boxRep.mainNode.style.left = contentObj.mainNode.style.left;
			contentObj.boxRep.mainNode.style.width = contentObj.mainNode.style.width;
			contentObj.boxRep.mainNode.style.height = contentObj.mainNode.style.height;
        }
	},
	
	processMessage : function(id, type)
	{
		var drawFrameId = pe.scene.slideEditor.getParentDrawFrameId(id);
		var contentBox = drawFrameId && pe.scene.slideEditor.getRegisteredContentBoxById(drawFrameId);
		if(!contentBox || !contentBox.mainNode)
			return;
		var param = {"id":contentBox.mainNode.id, "type":type};
		switch(type)
		{
			case "lock": case "unlock":
			case MSGUTIL.actType.deleteElement:
				break;
			case MSGUTIL.actType.insertElement:
			{
				var contentBoxType = pe.scene.slideEditor.contentBoxTypeMap[contentBox.contentBoxType];
				if(contentBoxType)
					param["boxtype"] = contentBoxType;
			}
			case MSGUTIL.actType.setAttributes:
			{
				param["t"] = contentBox.mainNode.offsetTop;
				param["l"] = contentBox.mainNode.offsetLeft;
				param["w"] = contentBox.mainNode.offsetWidth;
				param["h"] = contentBox.mainNode.offsetHeight;
				param["z"] = dojo.style(contentBox.mainNode,'zIndex');
		        if(contentBox.contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE
						&& contentBox.boxRep && contentBox.boxRep.mainNode)
		        {
		        	contentBox.boxRep.mainNode.style.top = contentBox.mainNode.style.top;
		        	contentBox.boxRep.mainNode.style.left = contentBox.mainNode.style.left;
		        	contentBox.boxRep.mainNode.style.width = contentBox.mainNode.style.width;
		        	contentBox.boxRep.mainNode.style.height = contentBox.mainNode.style.height;
		        }
				break;
			}
			default:
				return;
		}
		concord.util.mobileUtil.jsObjCBridge.postEvents([{"name":"presObjectChange", "params":[param]}]);
	}
};

concord.util.mobileUtil.viewport = {
	meta : null,
	width : 0,
	minFactor : 0.6,
	maxFactor : 3.0,
	curMinScale : 0.6,
	curMaxScale : 3.0,	
	screenWidth : 0,
	getMeta : function(){
		if(this.meta)
			return this.meta;
		var metas = dojo.query('meta[name="viewport"]');
		var viewportMeta = (metas.length > 0) && metas[0];
		if(!viewportMeta)
		{
			var head = document.getElementsByTagName( 'head' )[0];
			viewportMeta = document.createElement("meta");
			viewportMeta.setAttribute("name", "viewport");
			viewportMeta.setAttribute("content", "width=device-width, height=device-height,initial-scale=1, user-scalable=yes");// fix ios7 WebView issue
			head.appendChild(viewportMeta);
		}
		return this.meta = viewportMeta;
	},
	init : function(w, scrWidth){
		var viewportMeta = this.getMeta();
		var screenWidth = 1024;
		if(scrWidth)
			screenWidth = scrWidth;
		this.width = w;
		var scale = screenWidth/w;
		if (scale > 1.0) {
			scale = 1.0;
			this.width = screenWidth;
		}
		this.curMaxScale = scale*this.maxFactor;
		this.curMinScale = scale*this.minFactor;
		viewportMeta.setAttribute("content", "width=device-width, height=device-height,"+" initial-scale="+scale+",minimum-scale="+this.curMinScale+", maximum-scale="+this.curMaxScale+", user-scalable=yes");// fix ios7 WebView issue
		concord.util.mobileUtil.jsObjCBridge.postEvents([{"name":"viewport", "params":[scale]}]);
	},
	getHtmlWidth : function()
	{
		var w = "";
		var style = window.getComputedStyle(pe.lotusEditor._shell._editWindow._editorFrame,"");
		if(style)
			w = parseInt(style.getPropertyValue("width"));
		return w;
	},
	getScaleRange : function()
	{
		return dojo.toJson([this.curMinScale,this.curMaxScale]);
	},	
	setupMinMaxScaleBeforeRotate : function()
	{
		if(this.width == 0)
			return;
		var minScale = 768/(this.width+1)*this.minFactor;
		var maxScale = 1024/(this.width+1)*this.maxFactor;
		this.setMinMaxScale(minScale, maxScale);
	},
	setupMinMaxScaleAfterRotate : function(isPortrait)
	{
		if(this.width == 0)
			return;
		var screenWidth = isPortrait ? 768 : 1024;
		var scale = screenWidth/(this.width+1);
	    this.setMinMaxScale(scale*this.minFactor, scale*this.maxFactor);
	},
	setMinMaxScale : function(minScale, maxScale)
	{
		var viewportMeta = this.getMeta();
		var content = viewportMeta.getAttribute("content");
	    // set min scale
	    if(content.match(/minimum-scale\s*=\s*\d*(?:\.\d+)?/))
	    	content = content.replace(/minimum-scale\s*=\s*\d*(?:\.\d+)?/, "minimum-scale="+minScale);
	    else
	    	content += ",minimum-scale="+minScale;
	    // set max scale
	    if(content.match(/maximum-scale\s*=\s*\d*(?:\.\d+)?/))
	    	content = content.replace(/maximum-scale\s*=\s*\d*(?:\.\d+)?/, "maximum-scale="+maxScale);
	    else
	    	content += ",maximum-scale="+maxScale;
	    viewportMeta.setAttribute("content",content);
	    this.curMinScale = minScale;
	    this.curMaxScale = maxScale;
	}
};

// current scale
concord.util.mobileUtil.currentScale = {scale : 1};

// file format not matched call back params
concord.util.mobileUtil.fileFormatNotMatchParams = {};

// file format not match callback
concord.util.mobileUtil.fileFormatNotMatchCallback = function(aborted){
	var params = concord.util.mobileUtil.fileFormatNotMatchParams;
	if (params.callback && params.response) {
		params.callback(params.response, aborted);
	}
};

concord.util.mobileUtil.postError = function(errorCode, errorTitle, errorMessage, data){
	var events = [];
	
	var params = [errorCode];
	errorTitle = errorTitle == undefined ? "" : errorTitle;
	params.push(errorTitle);
	errorMessage = errorMessage == undefined ? "" : errorMessage;
	params.push(errorMessage);
	data = data == undefined ? "" : data;
	params.push(data);
	events.push({"name":"postError", "params":params});
	concord.util.mobileUtil.jsObjCBridge.postEvents(events);
};

concord.util.mobileUtil.autoCorrect = {
	acts : [],
	oldBlock : null,
	oldRange : null,
	endPos : 0,
	lsnerBlock : null,
	applyByDefault : false,
	newBlockId : "",
	apply : function(editor, bApplyByDefault)
	{
//		this.newBlockId = "";
//		this.applyByDefault = bApplyByDefault;
//		this.endPos = -1;
//		var sel = editor.getSelection();
//		var ranges = sel && sel.getRanges();
//		var range = (ranges && ranges.length == 1)? ranges[0] : null;
//		// apply auto-correct before enter key.
//		if(range && range.collapsed)
//		{
//			if(sel.getNative().rangeCount <= 0)
//				return;
//			this.lsnerBlock = MSGUTIL.getBlock(range.startContainer);
//			if(!this.lsnerBlock)
//				return;
//			this.oldBlock = this.lsnerBlock.clone(true,true);
//			this.endPos = MSGUTIL.getNodeLength(this.oldBlock) - MSGUTIL.transOffsetRelToAbs(range.startContainer, range.startOffset, this.lsnerBlock);
//			if(this.endPos < 0)
//				return;
//			this.oldRange = sel.getNative().getRangeAt(0);
//			this.acts = [];
//			this.lsnerBlock.on("DOMCharacterDataModified", this.autoCorrectListener, this);
//			if(!this.applyByDefault)
//				concord.util.mobileUtil.jsObjCBridge.postEvents([{"name":"autoCorrect", "params":[]}]);
//		}
	},
	autoCorrectListener : function(event)
	{
//		if(!this.oldBlock)
//			return;
//		this.oldRange = null;
//		var target = new CKEDITOR.dom.node(event.data.$.target);
//		var newBlock = MSGUTIL.getBlock(target);
//		var newContent = MSGUTIL.getPureText(newBlock);
//		var oldContent = MSGUTIL.getPureText(this.oldBlock);
//		var newLen = newContent.length;
//		var oldLen = oldContent.length;
//		
//		var pos = 0;
//		if(this.endPos >= 0 && this.endPos < oldLen && this.endPos < newLen && oldContent.substring(oldLen-this.endPos, oldLen) == newContent.substring(newLen-this.endPos, newLen))
//		{
//			pos = this.endPos;
//		}
//		else
//		{
//			while(pos < oldLen && pos < newLen && oldContent.substring(oldLen-pos-1, oldLen) == newContent.substring(newLen-pos-1, newLen) )
//				pos++;
//		}
//		var newAct = SYNCMSG.createTextChangeAct( oldLen, oldLen-pos, newLen, newLen-pos, newBlock, this.oldBlock);	
//		this.acts = this.acts.concat(newAct);
//		this.oldBlock = newBlock.clone(true,true);
	},
	sendMessage : function()
	{
		// reset range.
//		var sel = pe.scene.getEditor().document.getSelection().getNative();
//		if(!this.applyByDefault && sel && sel.rangeCount > 0)
//		{
//			var range = sel.getRangeAt(0);
//			if(!this.oldRange)
//			{
//				if(this.lsnerBlock)
//				{
//					var pos = MSGUTIL.getNodeLength(this.lsnerBlock) - this.endPos;
//					if(pos>0)
//					{
//						var ret = MSGUTIL.getInsertPos(this.lsnerBlock, pos);
//						range.setEnd(ret.container.$,ret.offset);
//					}
//				}
//				range.collapse();
//			}
//			else
//			{
//				range = this.oldRange;
//				this.oldRange = null;
//			}
//			var newBlock = pe.lotusEditor.document.getById(this.newBlockId);
//			if(newBlock && this.lsnerBlock && !newBlock.equals(this.lsnerBlock)){
//				console.log('fix range to block :'+this.newBlockId);
//				sel.selectAllChildren(newBlock.$);
//				sel.collapseToEnd();
//			}
//			else
//			{
//				range && sel.removeAllRanges();
//				range && sel.addRange(range);
//			}
//		}
//		
//		// send message.
//		if(pe.scene.docType == "text" && this.acts.length > 0)
//		{
//			var msgPairs = [SYNCMSG.createMessage(MSGUTIL.msgType.Text, this.acts)];
//			SYNCMSG.sendMessage(msgPairs);
//			this.acts = [];
//		}
//		this.lsnerBlock && this.lsnerBlock.removeListener("DOMCharacterDataModified", this.autoCorrectListener);
//		this.lsnerBlock = null;
	},
	sendMessageWithTimer : function(time)
	{
//		if(!time)
//			time = 0;
//		var that = this;
//		setTimeout(function(){
//			that.sendMessage();
//		}, time);
	},
	clear : function()
	{
//		this.applyByDefault = true;
//		this.acts = [];
//		this.lsnerBlock && this.lsnerBlock.removeListener("DOMCharacterDataModified", this.autoCorrectListener);
//		this.lsnerBlock = null;
//		this.newBlockId = "";
	}
};

concord.util.mobileUtil.isPanGesture = false;
concord.util.mobileUtil.isProcessedMessage = false;
//keyboard dimension
concord.util.mobileUtil.keyboardDimension = {x : 0, y : 0, width : 0, height : 0, isDocked : 0};

concord.util.mobileUtil.keydownDismissPopover = function( e )
{
	//pe.scene.CKEditor.document.removeListener("keydown", concord.util.mobileUtil.keydownDismissPopover );
	
	var events = [{"name":"dismissPopover", "params":[]}];
	concord.util.mobileUtil.jsObjCBridge.postEvents(events);
};
concord.util.mobileUtil.registerKeydownDismissPopover = function()
{
	//pe.scene.CKEditor.document.on("keydown", concord.util.mobileUtil.keydownDismissPopover);
};

concord.util.mobileUtil.keyboardWillShow = function(bPreventHeight)
{
//	console.log('keyboardwillshow');
	concord.util.mobileUtil.bPreventHeight = bPreventHeight; //  // in ios6 clientHeight is wrong,but ios7 fix it.
	concord.util.mobileUtil.isKeyboardShow = true;
};

concord.util.mobileUtil.keyboardDidShow = function(originX,originY,sizeW,sizeH,isDocked)
{
	concord.util.mobileUtil.keyboardDimension = {x:originX,y:originY,width:sizeW,height:sizeH,isDocked:isDocked};
};

concord.util.mobileUtil.keyboardWillHide = function(fromChangeFrame)
{
	concord.util.mobileUtil.isKeyboardShow = false;
};

concord.util.mobileUtil.keyboardDidHide = function(){
	concord.util.mobileUtil.tableResize.isBlured = false;
	concord.util.mobileUtil.keyboardDimension.x = 0;
	concord.util.mobileUtil.keyboardDimension.y = 0;
	concord.util.mobileUtil.keyboardDimension.width = 0;
	concord.util.mobileUtil.keyboardDimension.height = 0;
};

concord.util.mobileUtil.highlightCommentIcon = function(commentId)
{
	
	var rootElement = null;
	
	if( pe.scene.docType == "text" )
	{
		pe.scene.commentsSelected(commentId);
	}
	else if( pe.scene.docType == "pres" )
	{
		pe.scene.commentsSelected(commentId);
//		if(commentId == pe.scene.slideEditor.getCommentIdInSelectedBox())
//			return;
//		var commentPane = pe.scene.sidebar.getCommentPane();
//		var divID = commentPane.prefix + commentId;
//        commentPane.listener.commentsSelected(commentId);
//        commentPane._closeAllComments(divID, true);
	}
	// support spreadsheet in future.
};

concord.util.mobileUtil.unHighlightCommentIcon = function(commentId)
{
	var rootElement = null;
	
	if( pe.scene.docType == "text" )
	{
		pe.scene.commentsUnSelected(commentId);
	}
	else if( pe.scene.docType == "pres" )
	{
		pe.scene.commentsUnSelected(commentId);
//		var commentPane = pe.scene.sidebar.getCommentPane();
//		var divID = commentPane.prefix + commentId;
//        var comments = dojo.byId(divID);
//        if (comments) {
//        	commentPane._collapseComments(comments);
//        	commentPane.listener.commentsUnSelected(commentId);
//        	commentPane._disableCommentsTabindex(comments);                            
//        }
	}
	// support spreadsheet in future.
};

concord.util.mobileUtil.getNodePosInView = function(node){
	//get the distance between node bottom and curent window bottom
	if(!node || !node.is)
		return 0;
	var nodePos = concord.util.browser.getElementPositionInDocument(node);
	return {x:nodePos.left + nodePos.width - window.scrollX - window.innerWidth,y:nodePos.top + nodePos.height - window.scrollY - window.innerHeight};
};

concord.util.mobileUtil.verifyPassword = function(pwdData) {
	var url = contextPath + "/api/docsvr/" + DOC_SCENE.repository + "/" + DOC_SCENE.uri + "/decrypt";
	var postData = { "docpwd": pwdData.pwd,
			"repoid": DOC_SCENE.repository,
			"docuri": DOC_SCENE.uri
	};
	var sData = dojo.toJson( postData );
	
	dojo.xhrPost({
		url: url,
		handleAs: "json",
		handle: function(data) {                      	
			console.log(data);
			if( data instanceof Error)
			{
				var events = [];
				events.push({"name":"networkIssue", "params":[{YES:"concord.util.mobileUtil.reloadAndRetry();"}]});
				concord.util.mobileUtil.jsObjCBridge.postEvents(events);

				return;
			};
			if(data.status == 'converting'){
				DOC_SCENE.jobId = data.jobid;
				console.log(DOC_SCENE.jobId);
				pe.scene.queryJob();
			}else if(data.status == 'success'){
				pe.scene.staged(true);
			}else {
				
			}				
		},
		sync: false,
		content: postData
	});
	
};
//confirm obj: title titleKey, message, messageKey, yesTitle, yesTitleKey , YES callback, NO callback
concord.util.mobileUtil.confirm = function(confirmObj)
{
	var events = [{"name":"confirm", "params":[confirmObj]}];
	concord.util.mobileUtil.jsObjCBridge.postEvents(events);
};

concord.util.mobileUtil.showSaveAsDialog = function()
{
	var events = [{"name":"saveAs", "params":[pe.scene.getDocTitle()]}];
	concord.util.mobileUtil.jsObjCBridge.postEvents(events);
};

concord.util.mobileUtil.versionPublished = function()
{
	var events = [];
	events.push({"name":"versionPublished", "params":[]});
	concord.util.mobileUtil.jsObjCBridge.postEvents(events);	
};

concord.util.mobileUtil.showPublishDialog = function()
{
	var events = [];
	events.push({"name":"versionPublishDlg", "params":[]});
	concord.util.mobileUtil.jsObjCBridge.postEvents(events);	
};

concord.util.mobileUtil.showPublishFailedDialog = function(msg)
{
	var events = [];
	events.push({"name":"versionPublishedFailed", "params":[msg]});
	concord.util.mobileUtil.jsObjCBridge.postEvents(events);
};

concord.util.mobileUtil.networkIssue = function()
{
	var events = [];
	events.push({"name":"networkIssue", "params":[{YES:"concord.util.mobileUtil.networkIssueRetry();"}]});
	concord.util.mobileUtil.jsObjCBridge.postEvents(events);
};

concord.util.mobileUtil.showErrorMessage = function(msg)
{
	concord.util.mobileUtil.showErrorMessageWithJSON({message:msg});
};

concord.util.mobileUtil.showErrorMessageWithJSON = function(msg)
{
	var events = [];
	events.push({"name":"showErrorMessage", "params":[msg]});
	concord.util.mobileUtil.jsObjCBridge.postEvents(events);
};

// check network issue recovery
// if not,pop up Network issue again
// callback func by Native
concord.util.mobileUtil.networkIssueRetry = function()
{
	if(pe.scene.bOffline){
		concord.util.mobileUtil.reLoad();
	}else if(pe.scene.bNetworkIssue){
		concord.util.mobileUtil.networkIssue();
	}
};
concord.util.mobileUtil.reLoad = function()
{
	 var events =[{"name":"reload", "params":[]}];
 	 concord.util.mobileUtil.jsObjCBridge.postEvents(events);
};

concord.util.mobileUtil.reloadAndRetry = function()
{
	 var events =[{"name":"reload", "params":[{"retry":true}]}];
 	 concord.util.mobileUtil.jsObjCBridge.postEvents(events);
};

concord.util.mobileUtil.stopActivityIndicator = function()
{
	var events = [{"name":"stopActivityIndicator", "params":[]}];
	concord.util.mobileUtil.jsObjCBridge.postEvents(events);
};

concord.util.mobileUtil.tableResize = {
	tableInfo : null,
	resizingElement : null,
	selectedTabId : "",
	isViewUpdated : false,
	show : function(cellView, noBuildTableInfo)
	{
		if(noBuildTableInfo)
			cellView = this.tableInfo.cellView;
		var param = {};
		if(cellView)
		{
			if(!this.tableInfo || this.tableInfo.cellView != cellView)
				 this.selectedTabId = "";
			var preTable = this.tableInfo && this.tableInfo.tableView.model;
			if(!noBuildTableInfo)
				this.tableInfo = this.buildTableInfo(cellView);
			if(preTable && this.tableInfo && this.tableInfo.tableView.model == preTable)
				param["sameTable"] = 1;
			if(this.selectedTabId != "" && this.tableInfo.selectedTab)
				param["selectedTab"] = this.tableInfo.selectedTab;
			param["left"] = this.tableInfo.viewsInfo[0].left;
			param["top"] = this.tableInfo.viewsInfo[0].top;
			param["width"] = this.tableInfo.viewsInfo[0].width;
			param["height"] = this.tableInfo.viewsInfo[0].height;
			param["rows"] = this.tableInfo.rows;
			param["cols"] = this.tableInfo.cols;
			if(this.tableInfo.viewsInfo.length > 1)
				param["views"] = this.tableInfo.viewsInfo.slice(1);
		}
		else
			this.tableInfo = null;
		concord.util.mobileUtil.jsObjCBridge.postEvents([{"name":"tableResize", "params":[param]}]);
	},
	onSelectionChange : function(cellView)
	{
		var needShow = false;
		if(this.isViewUpdated)
		{
			this.isViewUpdated = false;
			needShow = true;
		}
		else if((!!this.tableInfo)^(!!cellView) || (this.tableInfo && cellView && this.tableInfo.cellView != cellView))
			needShow = true;
		else if(this.tableInfo && cellView && this.tableInfo.cellView == cellView)
		{
			var top = this.tableInfo.viewsInfo[0].top;
			var docTop = pe.lotusEditor.padding;
			var tableView = this.tableInfo.tableView.getViews().first.content;
			var newTop = tableView.getTop()+tableView.marginTop+docTop;
			if(top != newTop)
				needShow = true;
		}
		needShow && this.show(cellView);
	},
	viewUpdated : function()
	{
		if(!this.tableInfo || !this.tableInfo.cellView)
			return;
		this.isViewUpdated = true;
	},
	deleteTable : function()
	{
		var delTableCommand = pe.lotusEditor.getCommand("deleteTable");
		delTableCommand && delTableCommand.exec();
	},
	startResizeColumn : function(colIndex)
	{
		if(!this.tableInfo)
			return;
		var leftMin, rightMin;
		var curCell = this.tableInfo.targetCells[colIndex];
		this.resizingElement = curCell;
		var targetCell = curCell;
		if(curCell.getColSpan()>1){
			var matrix = curCell.getTable().getTableMatrix();
			var colIdx = curCell.getColIdx()+curCell.getColSpan()-1;
			var cells = matrix.getColumn(colIdx);
			var targetCell = null;
			for(var i=0;i<cells.length;i++){
				if(cells[i].getColSpan()==1){
					targetCell = cells[i];
					break;
				}
			}
		}
		var curCellWidth = this.tableInfo.cols[colIndex].width;
		var pos = curCell.getLeft()+curCellWidth;
		leftMin = pos-targetCell.getLeft()-16;
		var nextCell = curCell.next(true);
		if(nextCell){
			rightMin = nextCell.getLeft()+nextCell.getBoxWidth()-16-pos;
		}else{
			var curPage = writer.global.viewTools.getPage(curCell);
			var tableContainer = writer.global.viewTools.getTableContainer(curCell.getParent());
			var _maxW = tableContainer.getLeft()+tableContainer.getWidth()-5-curCell.getLeft()+curPage.left+curCell.getTable().marginLeft;
			_maxW = Math.max(_maxW,curCellWidth);
			rightMin = _maxW-curCellWidth;
		}
		return leftMin + "," + rightMin;
	},
	resizeColumn : function(shift)
	{
		if(shift && this.tableInfo && this.resizingElement)
		{
			dojo.publish(writer.constants.EVENT.RESIZECOLUMN,[this.tableInfo.tableView.model,this.resizingElement.getColIdx()+this.resizingElement.getColSpan()-1,shift]);
		}
	},
	startResizeRow : function(rowIndex)
	{
		if(!this.tableInfo)
			return;
		this.resizingElement = this.tableInfo.targetRows[rowIndex];
		return this.resizingElement.getBoxHeight()-16;
	},
	resizeRow : function(shift)
	{
		if(shift && this.tableInfo && this.resizingElement)
		{
			dojo.publish(writer.constants.EVENT.RESIZEROW,[this.tableInfo.tableView.model,this.resizingElement.model.getRowIdx(),Math.round(shift)]);
		}
	},
	insertCol : function(position, index)
	{
		if(!this.tableInfo)
			return;
		var tablePlugin = pe.lotusEditor.getPlugin("Table");
		if(tablePlugin)
		{
			if(arguments.length < 2)
			{
				position = "after";
				index = this.tableInfo.targetCells.length-1;
			}
			var cell = this.tableInfo.targetCells[index];
			tablePlugin.insertCol(cell.model,position);
		}
	},
	insertRow : function(position, index)
	{
		if(!this.tableInfo)
			return;
		var tablePlugin = pe.lotusEditor.getPlugin("Table");
		if(tablePlugin)
		{
			if(arguments.length < 2)
			{
				position = "after";
				index = this.tableInfo.targetRows.length-1;
			}
			var row = this.tableInfo.targetRows[index];
			tablePlugin.insertRow(row.model,position);
		}
	},
	deleteCol : function(index)
	{
		if(!this.tableInfo)
			return;
		var tablePlugin = pe.lotusEditor.getPlugin("Table");
		if(tablePlugin)
		{
			var cell = this.tableInfo.targetCells[index];
			tablePlugin.deleteCol([cell.model]);
		}
	},
	deleteRow : function(index)
	{
		if(!this.tableInfo)
			return;
		var tablePlugin = pe.lotusEditor.getPlugin("Table");
		if(tablePlugin)
		{
			var row = this.tableInfo.targetRows[index];
			tablePlugin.deleteRow([row.model]);
		}
	},
	resizeTable : function(width, height){
		if(this.tableInfo && this.tableInfo.viewsInfo.length == 1)
		{
			var tblMatrix = this.tableInfo.tableView.getTableMatrix();
			var rowCnt = tblMatrix.length();
			var colCnt = tblMatrix.length2();
			var _minH = 10*rowCnt;
			var _minW = 10*colCnt;
			var curPage = writer.global.viewTools.getPage(this.tableInfo.tableView);
			var tableContainer = writer.global.viewTools.getTableContainer(this.tableInfo.tableView);
			var _maxW = tableContainer.getLeft()+tableContainer.getWidth()-6-this.tableInfo.tableView.getLeft()+curPage.left;
			if(width < _minW)
				width = _minW;
			if(width > _maxW)
				width = _maxW;
			if(height < _minH)
				height = _minH;
			var delX = width - this.tableInfo.viewsInfo[0].width;
			var delY = height - this.tableInfo.viewsInfo[0].height;
			dojo.publish(writer.constants.EVENT.RESIZETABLE,[this.tableInfo.tableView.model,delX,delY]);
		}
	},
	getColCmdState : function(index)
	{
		return "1,1";
	},
	getRowCmdState : function(index)
	{
		return "1,1";
	},
	setSelectedTab : function(tag)
	{
		if(!this.tableInfo)
		{
			this.selectedTabId = "";
			return;
		}
		if(tag == 0 || tag > this.tableInfo.cols.length || -tag > this.tableInfo.rows.length)
			this.selectedTabId = "";
		else
			this.selectedTabId = tag > 0 ? "col_"+this.tableInfo.targetCells[tag-1].refId : "row_"+this.tableInfo.targetRows[-tag-1].refId;
	},
	buildTableInfo : function(cellView){
		var tableInfo = {};
		var cellRowIdx = cellView.parent.getRowIdx();
		var cellColIdx = cellView.getColIdx();
		var curTableView = cellView.getTable();
		tableInfo.tableView = curTableView;
		tableInfo.cellView = cellView;
		tableInfo.viewsInfo = [];
		tableInfo.rows = [];
		tableInfo.targetRows = [];
		tableInfo.cols = [];
		tableInfo.targetCells = [];
		var docLeft = pe.lotusEditor.layoutEngine.rootView.docLeft;
		var docTop = pe.lotusEditor.padding;
		var selectedTabId = null;
		var selectedTabIsCol = true;
		if(this.selectedTabId != "")
		{
			var prefix = this.selectedTabId.substring(0,4);
			selectedTabId = this.selectedTabId.substring(4);
			selectedTabIsCol = (prefix == "col_");
		}
		
		var matrix = curTableView.getTableMatrix();
		for ( var i = 0, len = matrix.getColumnCount(), offset = curTableView.getLeftBorderWidth(), preCell = null; i < len; i++)
		{
			var cell = matrix.getCell(cellRowIdx, i);
			if( cell == preCell )
				continue;
			preCell = cell;
			var w = cell.getBoxWidth();
			tableInfo.targetCells.push(cell);
			tableInfo.cols.push({
				'x' : offset,
				'width' : w
			});
			offset += w;
			if(selectedTabId && selectedTabIsCol && cell.refId == selectedTabId)
				tableInfo.selectedTab = tableInfo.cols.length;
		}
		
		var item = curTableView.getViews().first;
		while(item)
		{
			var info = {};
			var tableView = item.content;
			info.left = tableView.getLeft()+docLeft;
			info.top = tableView.getTop()+tableView.marginTop+docTop;
			info.width = tableView.getWidth()+tableView.getLeftBorderWidth()+tableView.getRightBorderWidth();
			info.height = tableView.getContentHeight()+tableView.getTopBorderWidth()+tableView.getBottomBorderWidth();
			tableInfo.viewsInfo.push(info);
			var topDiff = info.top - tableInfo.viewsInfo[0].top;
			var matrix = tableView.getTableMatrix();
			for ( var i = 0, len = matrix.length(), offset = tableView.getTopBorderWidth(), preCell = null; i < len; i++)
			{
				var cell = matrix.getCell(i, cellColIdx);
				if( cell == preCell )
					continue;
				preCell = cell;
				var h = cell.getBoxHeight();
				tableInfo.rows.push({
					'y' : offset+topDiff,
					'height' : h
				});
				offset += h;
				var rowSpan = cell.getRowSpan();
				var targetRow = cell.getParent();
				while(rowSpan>1){
					targetRow = targetRow.next();
					rowSpan--;
				}
				tableInfo.targetRows.push(targetRow);
				if(selectedTabId && !selectedTabIsCol && targetRow.refId == selectedTabId)
					tableInfo.selectedTab = -tableInfo.rows.length;
			}
			item = item.next;
		}
		return tableInfo;
	}
};

concord.util.mobileUtil.layoutDoc =
{
	copyString : null,
	spellCheckContext : {},
	getSelectionPos : function(reversed)
	{
		var frameTop = pe.lotusEditor._shell._editWindow._editorFrame.offsetTop;
		var drawingObj = writer.global.viewTools.getCurrSelectedDrawingObj();
		if (drawingObj) 
		{
			var imageInfo = drawingObj.getMobileImageInfo();
			var pos0 = {x:imageInfo.left,y:imageInfo.top+frameTop,h:imageInfo.height};
			var pos1 = {x:imageInfo.left+imageInfo.width,y:imageInfo.top+frameTop,h:imageInfo.height};
			reversed && (pos0["r"] = 1);
			return [pos0,pos1];
		}
		var sel = pe.lotusEditor.getSelection();
		var selLen = sel._selections.length;
		if(selLen)
		{
			var sel0 = sel._selections[0];
			var sel1 = sel._selections[selLen-1];
			var pos0,pos1,pt=0,pb=0;
			var scrollTop = pe.lotusEditor.getScrollPosition();
			var scrollLeft = pe.lotusEditor.getScrollPositionH();
			if(sel0._line)
				pos0 = {x:sel0._line.getContentLeft()+sel0._line.paddingLeft+pe.lotusEditor._shell.baseLeft+sel0._start,
						y:sel0._line.getTop()+pe.lotusEditor._shell.baseTop+frameTop,
						h:sel0._domNode.offsetHeight};
			else if(sel0._domNode)
			{
				var cRect = sel0._domNode.getBoundingClientRect();
				pos0 = {x:cRect.left + scrollLeft,
						y:cRect.top  + scrollTop,
						h:sel0._domNode.offsetHeight};
			}
			if(sel1._line)
				pos1 = {x:sel1._line.getContentLeft()+sel1._line.paddingLeft+pe.lotusEditor._shell.baseLeft+sel1._end,
						y:sel1._line.getTop()+pe.lotusEditor._shell.baseTop+frameTop,
						h:sel1._domNode.offsetHeight};
			else if(sel1._domNode)
			{
				var cRect = sel1._domNode.getBoundingClientRect();
				pos1 = {x:cRect.right + scrollLeft,
						y:cRect.top + scrollTop,
						h:sel1._domNode.offsetHeight};				
			}
			if(pos0 && pos1)
			{
				reversed && (pos0["r"] = 1);
				return [pos0,pos1];
			}
			else
				return [];
		}
		else
		{
			var cur = sel._cursor;
			if(!cur._visible)
				return [];
			return [{x:cur._domNode.offsetLeft,y:cur._domNode.offsetTop+frameTop,h:cur._domNode.offsetHeight}];
		}
	},
	clearCopyString : function()
	{
		this.copyString = null;
		delete this.copyString;
	},
	getClipBoardPureText : function()
	{
		var div = document.createElement('div');
		div.innerHTML = this.copyString;
		this.clearCopyString();
		return div.innerText;
	},
	cut : function()
	{
		pe.lotusEditor.execCommand("cut");
		return this.copyString;
	},
	copy : function()
	{
		pe.lotusEditor.execCommand("copy");
		return this.copyString;
	},
	paste : function(json)
	{
		pe.lotusEditor.execCommand("paste");
		pe.lotusEditor._shell._editWindow._inputNode.innerHTML = json.pasteText;
	},
	selectAll : function()
	{
		pe.lotusEditor.execCommand("selectAll");
	},
	onTap : function(x,y,tapCount)
	{
		var headerfooterPos = pe.lotusEditor._shell.isPointInHeaderFooter(x, y);
		if( headerfooterPos != null)
			return "inHeaderFooterArea";
//		console.log("MobileUtil _onTap:[" + x + "," + y + "]");
		var needReturnPos = !!tapCount;
		tapCount = tapCount || 1;
		var sel = pe.lotusEditor.getSelection();
		if((x < 0 || y < 0) && sel && sel.isEmpty())
		{
			var cur = sel._cursor._domNode;
			var frameTop = pe.lotusEditor._shell._editWindow._editorFrame.offsetTop;
			x = cur.offsetLeft;
			y = cur.offsetTop+frameTop + cur.offsetHeight*0.5;
		}
		var dummyEvent = {detail:tapCount,button:0,preventDefault:function(){},stopPropagation:function(){}};
		dummyEvent.clientX = x;
		dummyEvent.clientY = y;
		pe.lotusEditor._shell._editWindow._onMouseDown(false,dummyEvent);
		sel && (sel._isSelecting = false);
		return needReturnPos && dojo.toJson(this.getSelectionPos());
	},
	onDragStart : function(x,y)
	{
		this.onTap(x,y);
	},
	onDragEnd : function(x,y)
	{
		var isRangeReversed = false;
		var sel = pe.lotusEditor.getSelection();
		var point = pe.lotusEditor._shell.screenToClient({'x': x,'y': y });
		var ret = pe.lotusEditor._shell.pickAnything(point);
		if(ret)
		{
			var range = new writer.core.Range( sel._start, ret );
			isRangeReversed = sel._rangeTools.isNeedSwap(range);
			sel.selectTo(ret);
		}
		return dojo.toJson(this.getSelectionPos(isRangeReversed));
	},
	onScroll : function()
	{
		pe.lotusEditor._shell._editWindow._onScroll();
		pe.lotusEditor._shell._domRect = dojo.position(pe.lotusEditor.getEditorDIV());
	},
	onTextChange : function(len, text, markLen, type)//type:1,imeEnd;2,imeStart&&selected
	{
		if(len == 1 && text.length == 0 && markLen == 0)
		{
			if(type == 3)
			{
				pe.lotusEditor.undoManager.ignoreUndo(true);
				pe.lotusEditor.execCommand("backspace");
				pe.lotusEditor.undoManager.ignoreUndo(false);
				var sel = pe.lotusEditor.getSelection();
				sel.removeHighlight();
			}
			else
				pe.lotusEditor.execCommand("backspace");
		}
		else if(text == "\n")
		{	
			pe.lotusEditor.execCommand("enter");
		}
		else
		{
			var sel = pe.lotusEditor.getSelection();
			var ranges = sel && sel.getRanges();
			var range = ranges && ranges.length && ranges[0];
			if(!range)
			{
				console.error("ERROR! range is null.");
				return;
			}
			sel.removeHighlight();
			var paraPos = range.getStartParaPos();
			if(paraPos.index < len)
			{
				console.error("ERROR! paraPos index is shorter than len.");
				return;
			}
			var start = {"obj": paraPos.obj, "index": paraPos.index - len };
			
			if(len > 0)
			{
				if(!range.isCollapsed())
				{
					console.error("ERROR! range is not collapsed and also have mark selection.");
					return;
				}
				var newRange = new writer.core.Range( start, paraPos );
				sel.destroy();
				sel.addRanges(newRange,false);
			}
			if(text.length)
			{				
				if(markLen)
				{
					if(!type)
					{
						pe.lotusEditor.undoManager.ignoreUndo(true);
						pe.lotusEditor._shell._editWindow._keyHandler._impl._insertText(text,false);
						pe.lotusEditor.undoManager.ignoreUndo(false);					
					}
					else
					{
						pe.lotusEditor._shell._editWindow._keyHandler._impl._insertText(text,false);
						pe.lotusEditor.undoManager.updateCompositeKeyAction(type);
					}
				}
				else
					pe.lotusEditor._shell._editWindow._keyHandler._impl._insertText(text,false);
			}
			else if(len > 0)
			{
				if(markLen)
				{
					pe.lotusEditor.undoManager.ignoreUndo(true);
					pe.lotusEditor.execCommand("backspace");
					pe.lotusEditor.undoManager.ignoreUndo(false);
				}
				else
					pe.lotusEditor.execCommand("backspace");
			}

			if(markLen)
			{
				paraPos.index = paraPos.index - len + text.length;
				start.index = paraPos.index - markLen;
				if(type && (type == 1 || type ==3))
					return;
				var hightRange = new writer.core.Range( start, paraPos );
				sel.registerHighlightRanges([hightRange]);
			}
		}
	},
	onContextMenu : function()
	{
		var ret = {};
		var sel = pe.lotusEditor.getSelection();
		if(sel._ranges.length==1)
		{
			var firstR = sel._ranges[0];
//			if(!writer.util.ModelTools.inTable(firstR.getStartModel().obj))
//			{
				var sObj = firstR._start && firstR._start.obj;
				if(sObj && sObj.model && dojo.isFunction(sObj.model.isTextRun)
						&& sObj.model.isTextRun() && sObj.getParaText().length==0)
					ret["inBlankLine"] = 1;		
				else if(!firstR.isCollapsed() )
					ret["isSelected"] = 1;
//			}
		}
		else
			ret["isSelected"] = 1;
		
		if(sel.hightToc)
			ret["inTOC"] = 1;
		var misword = this.getMisword();
		if(misword)
			ret["misword"] = misword;

		return dojo.toJson(ret);
	},
	showCursor : function(noblink)
	{
		var sel = pe.lotusEditor.getSelection();
		sel && sel._cursor.show(noblink);
		return dojo.toJson(this.getSelectionPos());
	},
	hideCursor : function(){
		var sel = pe.lotusEditor.getSelection();
		if(sel)
		{
			sel.removeHighlight();
			sel._selections && sel._selections.length && sel.destroy();
			sel._cursor.hide();
		}
	},
	getMisword : function()
	{
		if (typeof window.spellcheckerManager == 'undefined' ||
				!window.spellcheckerManager.isScServiceAvialable() ||
				!window.spellcheckerManager.isAutoScaytEnabled())
			return;
		var ranges = pe.lotusEditor.getShell().getSelection().getRanges();
		var range = ranges[0];
		if (ranges.length != 1 || !range) return;

		var start_pos = range.getStartView();
		var end_pos = range.getEndView();
		if (start_pos.obj != end_pos.obj || end_pos.index != start_pos.index) return;

		var parapos = range.getEndParaPos();
		var index = parapos.index;
		if (!parapos.obj || parapos.obj.modelType != writer.MODELTYPE.PARAGRAPH) return;
		
		var spellchecker = pe.lotusEditor._editorDoc.spellchecker;
		var amisword = spellchecker && spellchecker.getMisWordByIndex(parapos.obj, index);
		if (!amisword || amisword.word.length <= 0) return;
		this.spellCheckContext = {
				sc_inst : spellchecker,
				parapos : parapos,
				misword : amisword,
				rootview : range.getRootView()
			};
		return amisword.word;
	},
	replaceMisword : function(json)
	{
		this.spellCheckContext["sugg"] = json.sugg;
		dojo.hitch(this.spellCheckContext, this.spellCheckContext.sc_inst.onSuggestionWord)();
	}
};

concord.util.mobileUtil.showSpeakerNote= function(node, index)
{
	function filter( node, result ) {
		
		var nodeName = node.nodeName.toUpperCase();
		if( nodeName  == "P" || nodeName == "UL" || nodeName == "OL" )
		{
			result.appendChild(dojo.clone(node));
		}
		else
		{
			var len = node.children.length;
			for( var i=0;i<len ;i++)
			{
				var child = node.children[i]; 
				if( child.style && 'hidden' == child.style['visibility'] )
				{	
					continue; 
				}
				filter(child , result);

			}
		}
	}
	
	var url = contextPath + "/api/docsvr/" + DOC_SCENE.repository + "/" + DOC_SCENE.uri + "/speakerNotes";
	//var subNode = dojo.query(".notes_tweaks", node)[0];
	var data = {"idx": index, "content":""};
	if( node )
	{
		var tmpNode = document.createElement("div");
		var nls = dojo.i18n.getLocalization("concord.widgets","contentBox");
		filter( node, tmpNode);
		
		if( dojo.trim(tmpNode.innerText) != nls.defaultText_speakerNotesBox )
		{
			data.content = tmpNode.innerHTML;
		}
	}
	
	dojo.xhrPost({
			url: url,
			handleAs: "json",
			load: function(r) {
			},
			error: function(error) {
			},
			sync: false,
			contentType: "text/plain",
			postData: dojo.toJson(data)
	});
};


concord.util.mobileUtil.requiredAppHeaders = function()
{
	try
	{
		if( dojo.cookie("entitlements") )
		{
			//if current domain contains a cookie called "entitlements" means this is a SC env
			concord.util.mobileUtil.APP_HEADERS = {};
		}
		
		if( concord.util.mobileUtil.APP_HEADERS )
			return concord.util.mobileUtil.APP_HEADERS;
		//the xhr will be handled by the mobile devices.
		var url = contextPath + "/api/docsvr/requiredAppHeaders";
		dojo.xhr("GET", {
				url: url,
				handleAs: "json",
				load: function(r) {
					concord.util.mobileUtil.APP_HEADERS = r;
				},
				error: function(error) {
					concord.util.mobileUtil.APP_HEADERS = {};
				},
				sync: true
		});
		
		return concord.util.mobileUtil.APP_HEADERS;
	}
	catch(err)
	{
		return {};
	}
};

concord.util.mobileUtil.clearPresClipboard = function(){
	CKEDITOR.plugins.clipboard = null;
};

concord.util.mobileUtil.applyAutoCorrectIssueIOS7 = {
	charCodeMap : {'U+0020':'\u00a0', 'U+002C':',', 'U+002E':'.', 'U+0021':'!', 'U+003F':'?', 'U+002D':'-', 'U+002F':'\/', 'U+003A':':', 'U+003B':';', 'U+0028':'(', 'U+0029':')', 'U+0024':'$', 'U+0026':'&',
	 'U+0040':'@', 'U+0027':'\'', 'U+0022':'\"', 'U+005B':'[', 'U+005D':']', 'U+007B':'{', 'U+007D':'}', 'U+0023':'#', 'U+0025':'%', 'U+005E':'^', 'U+002A':'*', 'U+002B':'+', 'U+003D':'=', 'U+005F':'_',
	  'U+005C':'\\', 'U+007C':'|', 'U+007E':'~', 'U+003C':'<', 'U+003E':'>'},
	fixAct : function( act, charCode ){
		if(act && act.length == 2 && act[0].act && act[1].act && act[0].act.t == 'dt' && act[1].act.t == 'it')
		{
			var cnt = act[1].act.cnt;
			if(cnt && cnt.length == 1)
			{
				if(cnt[0].t)
				{
					var text = cnt[0].t;
					if(text.length && text.charAt(text.length-1) != this.charCodeMap[charCode])
					{
						act[1].act.len += 1;
						act[1].act.cnt[0].t = text + this.charCodeMap[charCode];
					}
				}
				else if( cnt[0].e)
				{
					var element = CKEDITOR.dom.element.createFromHtml(cnt[0].e);
					var text = MSGUTIL.getPureText(element);
					if(element && element.is && element.is('span') && text && text.length && text.charAt(text.length-1) != this.charCodeMap[charCode])
					{
						element.appendText(this.charCodeMap[charCode]);
						act[1].act.len += 1;
						act[1].act.cnt[0].e = element.getOuterHtml();
					}
				}
			}
		}
	}
};

concord.util.mobileUtil.isBodySelected = function(range){
	var result = false;
	if(!range || range.collapsed || !range.startContainer || !range.endContainer || !range.startContainer.is || !range.endContainer.is){
		return result;
	}
	
	if(range.startContainer.is('body') && range.endContainer.is('body')){
		result = true;
	}
	
	return result;
};

concord.util.mobileUtil.initToolbar = function(){
	var widgets = writer.global.getToolbarConfig();
	var commands = [];
	dojo.forEach(widgets, function(widget) {
		if(widget.command){
			var command = pe.lotusEditor.getCommand(widget.command());
			commands.push({"name":command.getName(),"state":command.getState()});
		}
	});
	var events = [];
	events.push({"name":"initToolbar", "params":[{"commands":commands,"layoutEngine":true}]});
	concord.util.mobileUtil.jsObjCBridge.postEvents( events );
};

concord.util.mobileUtil.fixNodeFontSize = function(node){
	if(!node || !node.is)
		return;
	var blocks = node.$.querySelectorAll('td');
	var cnt = blocks.length;
	if(cnt > 0){
		for(var i=0;i<cnt;i++){
			var block = new CKEDITOR.dom.element(blocks[i]);
			var len = block.getChildCount();
			for(var k=0;k<len;k++){
				var childEle = block.getChild(k);
				if(childEle.is('p'))
					concord.util.mobileUtil.fixFontSize(childEle);
				else if(childEle.is('ol','ul')){
					var count = childEle.getChildCount();
					for(var j=0;j<count;j++){
						concord.util.mobileUtil.fixFontSize(childEle.getChild(j));
					}
				}
			}
		}
	}else{
		cnt = node.getChildCount();
		for(var i=0;i<cnt;i++){
			var block = node.getChild(i);
			if(block.is('p','font'))
				concord.util.mobileUtil.fixFontSize(block);
			else if(block.is('ol','ul')){
				var count = block.getChildCount();
				for(var j=0;j<count;j++){
					concord.util.mobileUtil.fixFontSize(block.getChild(j));
				}
			}else if(block.is('span') && block.getStyle('font-size').indexOf('px') != -1 && block.getStyle('background-color')){
				block.removeStyle('background-color');
				block.removeStyle('line-height');
				block.removeStyle('font-size');
			}
		}
	}
};

concord.util.mobileUtil.fixFontSize = function(block){
	if(!block || !block.is){
		return;
	}else if(!block.is('p','li','font')){
		return;
	}
	var tAlign = block.getStyle('text-align');
	if(tAlign.indexOf('-webkit-auto') != -1 || tAlign.indexOf('start') != -1){
		block.removeStyle('text-align');
	}
	var isFont = false;
	if(block.is('font')){
		block = block.getParent();
		isFont = true;
	}
		
	var fChild = block.getFirst();
	if(fChild.is('a')){
		fChild = fChild.getFirst();
	}
	if(block.getChildCount() == 1 && (fChild.is('span') || fChild.is('font'))){
		if(fChild.is('font')){
			fChild.remove(true);
			fChild = block.getFirst();
		}
		if(fChild.is('span')){
			if(MSGUTIL.isBogus(fChild.getLast())){
				if(!fChild.$.querySelector('span')){
					fChild.getLast().insertAfter(fChild);
				}else{
					fChild.remove(true);	
				}
			}else if(fChild.$.querySelector('span')){
				fChild.remove(true);
			}else if(fChild.getFirst().is && fChild.getFirst().is('font')){
				fChild.getFirst().remove(true);
			}
		}
		block.$.normalize();
		fChild = block.getFirst();
		if(!fChild.is && _isNotVisibleTextNode(fChild)){
			fChild.remove();
			fChild = block.getFirst();
		}
		var spans = block.$.querySelectorAll('span');
		var len = spans.length;
		for(var i=0;i<spans.length;i++){
			var span = new CKEDITOR.dom.element(spans[i]);
			if(span.getStyle('font-size').indexOf('px') != -1 && span.getStyle('background-color')){
				span.removeStyle('background-color');
				span.removeStyle('line-height');
				span.removeStyle('font-size');
			}
		}
	}
	if(!isFont && !MSGUTIL.isBogus(block.getLast())){
		block.appendBogus();
	}
	
	function _isNotVisibleTextNode(node)
	{
		if(!node || node.is)
			return false;
		if(node.$.length == 1 && node.$.textContent.charCodeAt(0) == 8203)
			return true;
		return false;
	}
};
//check draft status before publish
concord.util.mobileUtil.checkDraftStatusForPublish=function()
{
	var chkurl = concord.util.uri.getDocDraftAccUri();
	dojo.xhrGet({
		url : chkurl,
		handleAs : "json",
		preventCache : true,
		handle : function(resp, io) {
			if( resp instanceof Error)
			{
				var events = [];
				events.push({"name":"networkIssue", "params":[{YES:"concord.util.mobileUtil.reloadAndRetry();"}]});
				concord.util.mobileUtil.jsObjCBridge.postEvents(events);
				return;
			};
			
			
			var modified, modifier;
			if(resp && !resp.valid)
			{
				modified = resp.latest_version_modified;	
				modifier = resp.latest_version_modifier;
				
		    	var message = concord.util.dialogs.formatStrings4Modifier(pe.scene.nls.uploadNewVersionPublishConfirm, modifier, modified);			
				//confirm obj: title titleKey, message, messageKey, yesTitle, yesTitleKey , YES callback, NO callback
				var confirmObj = {
					message: message,
					yesTitleKey: "keyPublishMine",
					YES: "concord.util.mobileUtil.showPublishDialog()",
					NO: ""
				};
				concord.util.mobileUtil.confirm( confirmObj);
				
			}
			else
			{
				//show publish;
				concord.util.mobileUtil.showPublishDialog();
			}
		},
		sync : false
	});
	return true;
};
concord.util.mobileUtil.getFallbackFont = function(text, fontfamily)
{
	var newText = text, newFontFamily = fontfamily;
	var bulletMap = concord.util.mobileUtil.bulletFallback[fontfamily];
	if (bulletMap) {
		var bulletCode = text.charCodeAt(0);
		if (bulletCode) {
			var fallBackCharCode = bulletMap[bulletCode];
			if (fallBackCharCode) {
				newText = String.fromCharCode(fallBackCharCode);
			} else {
				newText = String.fromCharCode(8226);
			}
			newFontFamily = "Arial";
		}
	}
	return {"newFont": newFontFamily, "newText": newText};
};

concord.util.mobileUtil.fallbackListSymbol = function(runNode){
	var fontfamily = runNode.style["fontFamily"].toLowerCase();
	var bulletMap = concord.util.mobileUtil.bulletFallback[fontfamily];
	if (bulletMap) {
		var bulletCode = runNode.innerHTML.charCodeAt(0);
		if (bulletCode) {
			var fallBackCharCode = bulletMap[bulletCode];
			if (fallBackCharCode) {
				runNode.innerHTML = String.fromCharCode(fallBackCharCode);
			} else {
				runNode.innerHTML = String.fromCharCode(8226);
			}
			runNode.style["fontFamily"] = "Arial";
		}
	}
};

// Register a command to get mobile app notified when a command state updated
// commandName - String. name of the command. See presentation/js/constants.js for list of command names
// keyName - String. name of state key, "checked", "disabled", etc.
concord.util.mobileUtil.registerPresentationCommand = function(commandName)
{
	var command = pe.scene.hub.commandsModel.getModel(commandName);
	var commandJSON = null;
	var watcher = function(name, oldValue, newValue)
	{
		if (oldValue != newValue)
		{
			webkit.messageHandlers["iconcord"].postMessage({
				type: "command",
				name: command.cmd,
				key: name,
				value: newValue
			});
		}
	};
	
	if (command)
	{
		commandJSON = {name: command.cmd};
		
		if (command.disabled !== undefined)
		{
			commandJSON.disabled = command.disabled;
			command.watch("disabled", watcher);
		}
		
		if (command.checked !== undefined)
		{
			commandJSON.checked = command.checked;
			command.watch("checked", watcher);
		}
		
		if (command.value !== undefined)
		{
			commandJSON.value = command.value;
			command.watch("value", watcher);
		}
		
		if (command.items)
		{
			commandJSON.options = command.items;
		}
	}

	return commandJSON;
};

concord.util.mobileUtil.presentationLayoutSlide = function(templateName)
{
	if (!templateName)
		templateName = "blank";
	var slideHandler = pe.scene.hub.slideHandler;
	
	if (slideHandler)
	{
		var layout = slideHandler.getLayoutResultArray(templateName);
		slideHandler.applyLayoutToCurrentSlide(layout);
	}
};

concord.util.mobileUtil.getSSNumberFormats = function()
{
	// used for mobile number format menu items
	var numberFormatItems = createNumberFormatItems();
	return numberFormatItems;
};

concord.util.mobileUtil.getSSNumberFormats2 = function()
{
	// used for mobile number format menu items
	var numberFormatItems = createNumberFormatItems();
	return dojo.toJson(numberFormatItems);
};

concord.util.mobileUtil.ssNumberFormat = function(format){
	websheet.model.ModelHelper.numberFormat(format);
};

