dojo.provide("concord.widgets.headerfooter.headerfooterUtil");
dojo.require("dojo.date.locale");
dojo.require("dojo.i18n");

dojo.require("concord.widgets.InsertImageDlg");

// To determine time date format use the following process 
// (Current assertion is to match PowerPoint formats)
//    1) First determine common format amongst languages and put at top level
//    2) If a subsequent language is different then the default add section for locale 
//       and define.  First check gregorian.js files for dateFormat.  If one doesn't exist
//       that matches PowerPoint, define a datePattern.
concord.widgets.headerfooter.TimeDateFormatCode = {
	"D1":{
		formatName:"short",
		formatLength:"short",
		selector:"date"
	},
	"D3":{
		datePattern:"MM/dd/yy",
		selector:"date",
			
		"de":{
			datePattern:"dd.MM.yy",
			selector:"date"
			},
		"fr":{
			datePattern:"dd/MM/yy",
			selector:"date"
			},
		"zh":{
			datePattern:"yy/MM/dd",
			selector:"date"
			},
		"ja":{
			datePattern:"yy/MM/dd",
			selector:"date"
			}
	},
	"D5":{
		formatName:"medium",
		formatLength:"medium",
		selector:"date",
			
		"de":{
			datePattern:"dd. MMM yyyy",
			selector:"date"
			},
			
		"zh":{
			formatName:"long",
			formatLength:"long",
			selector:"date"
			},
		"ja":{
			formatName:"long",
			formatLength:"long",
			selector:"date"
			}
	},
	"D6":{
		formatName:"long",
		formatLength:"long",
		selector:"date"
	},
	"D8":{
		// Symphony uses no comma datePattern.  Full matches powerpoint
		formatName:"full",
		formatLength:"full",
		selector:"date",
		
		"ja":{
			dateCategory:"dateFormatItem-yMMMEd",
			selector:"date"
			}
	},
	"D1T1":{
		datePattern:"MM/dd/yyyy hh:mm a",
		selector:"date"
	},
	"D3T2":{
		datePattern:"MM/dd/yyyy HH:mm",
		selector:"date",
			
		"de":{
			datePattern:"dd.MM.yy HH:mm",
			selector:"date"
			},
		"fr":{
			datePattern:"dd/MM/yy HH:mm",
			selector:"date"
			},
		"zh":{
			datePattern:"yy/MM/dd HH:mm",
			selector:"date"
			},
		"ja":{
			datePattern:"yy/MM/dd HH:mm",
			selector:"date"
			}
	},
	"D3T5":{
		datePattern:"MM/dd/yyyy hh:mm a",
		selector:"date",
		
		"de":{
			datePattern:"dd.MM.yy hh:mm a",
			selector:"date"
			},
		"fr":{
			datePattern:"dd/MM/yy hh:mm a",
			selector:"date"
			},
		"zh":{
			datePattern:"yy/MM/dd a HH:mm",
			selector:"date"
			},
		"ja":{
			datePattern:"yy/MM/dd a HH:mm",
			selector:"date"
			}
	},
	"T1":{
		timeCategory:"dateFormatItem-hms",
		selector:"time"
	},
	"T2":{
		timeCategory:"dateFormatItem-Hm",
		selector:"time"
	},
	"T3":{
		timeCategory:"dateFormatItem-Hms",
		selector:"time"
	},
	"T5":{
		timeCategory:"dateFormatItem-hm",
		selector:"time"
	},
	"T6":{
		timeCategory:"dateFormatItem-hms",
		selector:"time"
	},
	"T7":{
		timeCategory:"timeFormat-long",
		selector:"time"
	}
};

// Remove all contenteditable=false for fieldm, and setTimer to set back in no time.
concord.widgets.headerfooter.headerfooterUtil.blinkForField = function()
{
	var doc;
	if(pe.scene.headerfooter.currentArea=="header")
		doc = frames["ifRTC"].document;
	else if(pe.scene.headerfooter.currentArea=="footer")
		doc = frames["ifRTC1"].document;
	else
		return;
	dojo.query('.ODT_PN', doc).forEach(function(node, index, array){
		dojo.removeAttr(node,"contenteditable");
	});
	dojo.query('.ODT_DT', doc).forEach(function(node, index, array){
		dojo.removeAttr(node,"contenteditable");
	});
	setTimeout( function(){
		dojo.query('.ODT_PN', doc).forEach(function(node, index, array){
			dojo.attr( node, {'contenteditable' : 'false'});
		});
		dojo.query('.ODT_DT', doc).forEach(function(node, index, array){
			dojo.attr( node, {'contenteditable' : 'false'});
		});
	}, 0);
};

concord.widgets.headerfooter.headerfooterUtil.execCmd=function(cmd,val)
{
	var div,doc;
	if(pe.scene.headerfooter.currentArea=="header")
	{
		doc = frames["ifRTC"].document;
		div=doc.getElementById("RTC");
	}
	else if(pe.scene.headerfooter.currentArea=="footer")
	{
		doc = frames["ifRTC1"].document;
		div=doc.getElementById("RTC1");
	}
	else
	{
		return;
	}
	concord.widgets.headerfooter.headerfooterUtil.blinkForField();
	if(dojo.isIE && document.documentMode > 8 && pe.scene.currentRange)
	{//IE9
		pe.scene.currentRange.select();
		pe.scene.currentRange.execCommand(cmd,false,val);
	}
	else{
		doc.execCommand(cmd, false, val);
	}
	div.focus();
	//For IE
	if(dojo.isIE)
	{
		pe.scene.currentRange.scrollIntoView(true);
	}
	//concord.widgets.headerfooter.headerfooterUtil.normalizeElements(div);
	if(cmd=="FontSize"||cmd=="FontName")
		concord.widgets.headerfooter.headerfooterUtil.setStyle(div);
	
	// check tab.
    ( dojo.isIE && document.documentMode < 9) && setTimeout(function(){pe.scene.headerfooter.checkTabs();}, 0);
};
concord.widgets.headerfooter.headerfooterUtil.Bold = function() {
	concord.widgets.headerfooter.headerfooterUtil.execCmd('Bold','');
};

concord.widgets.headerfooter.headerfooterUtil.Italic = function() {
	concord.widgets.headerfooter.headerfooterUtil.execCmd('Italic','');
};

concord.widgets.headerfooter.headerfooterUtil.Underline = function() {
	concord.widgets.headerfooter.headerfooterUtil.execCmd('Underline','');
};
concord.widgets.headerfooter.headerfooterUtil.InsertImage = function(id) {
	pe.scene.getEditor().focus();//IE8 has focus lost issue. this focus operation is to display the image select dialog.
	var editArea = pe.scene.headerfooter.currentArea;
	var frameId = null;
	if( editArea == "header" )
		frameId = "ifRTC";
	else if( editArea == "footer" )
		frameId = "ifRTC1";
	var doc = (frameId != null) ? frames[frameId].document : null;
	
	var local_dialog = {
			_uploadUrl : pe.scene.CKEditor.config.filebrowserImageUploadUrl,
			document: doc,
			onshow_hdl : function()
			{
			},
			onhide_hdl : function()
			{
			},
			_callback : function( url, imageLoadingTimeOut )
			{
				var element = document.createElement( 'img' );
				url = encodeURI(decodeURI( url ));
				var newURL = url;
				if(url.indexOf("Pictures",0)==0)
				{
					//generate the absolute url
					var absoluteURL=document.URL;
					newURL=absoluteURL.replace("content",url);
				}
				element.setAttribute( 'src', newURL );
				element.setAttribute('id',MSGUTIL.getUUID());
				var onLoad = function()
				{
					try
					{
						var oriHeight=30;
						var oriWidth=30;
						if(element.naturalHeight)//for FF
						{
							oriHeight=element.naturalHeight;
							oriWidth=element.naturalWidth;
						}	
						else
						{
							oriHeight=element.clientHeight;
							oriWidth=element.clientWidth;
						}
						if(oriHeight>50)
						{
							fitHeight=50;
							fitWidth=oriWidth*50/oriHeight;
							element.style.height="50px";
							element.style.width=fitWidth+"px";
						}
						
						if(imageLoadingTimeOut != null)
						{
							clearTimeout(imageLoadingTimeOut);
							imageLoadingTimeOut = null;
						}	
						pe.scene.hideErrorMessage();
						
				    	( dojo.isIE && document.documentMode < 9) && pe.scene.headerfooter.checkTabs();
						
						pe.scene.headerfooter.setCursor();
						concord.widgets.headerfooter.headerfooterUtil.insertNodeAtCursor(element);
					}
					catch(e)
					{
					}
				};
				
				if( element.width && element.height )
					onLoad();
				else
					dojo.connect(element, "load", null, onLoad);
				element.setAttribute( '_cke_saved_src', url );
			}
		};
	concord.widgets.InsertImageDlg.show( local_dialog );
};
concord.widgets.headerfooter.headerfooterUtil.InsertPageNumber = function() {
	var element = document.createElement( 'span' );
	var idValue = MSGUTIL.getUUID(); 
	element.setAttribute("id", idValue );
	element.setAttribute( "class", "ODT_PN" );
	element.setAttribute( "contenteditable", "false" );	
	element.innerHTML="#";
	pe.scene.headerfooter.setCursor();
	concord.widgets.headerfooter.headerfooterUtil.insertNodeAtCursor(element);
};
concord.widgets.headerfooter.headerfooterUtil.InsertDate = function() {
	pe.scene.insertDate(pe.scene.getEditor());
};

concord.widgets.headerfooter.headerfooterUtil.InsertTime = function() {
	pe.scene.insertTime(pe.scene.getEditor());
};

concord.widgets.headerfooter.headerfooterUtil.getRange=function() {
    var win,doc;
    if(pe.scene.headerfooter.currentArea=="header")
	{
		win=frames["ifRTC"];
		doc=win.document;
	}
	else if(pe.scene.headerfooter.currentArea=="footer")
	{
		win=frames["ifRTC1"];
		doc=win.document;
	}
    if (!dojo.isIE && win.getSelection && win.getSelection().getRangeAt) {
    	setTimeout(function(){
    		pe.scene.currentRange = win.getSelection().getRangeAt(0);
    	},0);
    } else if (doc.selection && doc.selection.createRange) {
    	setTimeout(function(){
    		pe.scene.currentRange = doc.selection.createRange();
    	},0);
    }
};
concord.widgets.headerfooter.headerfooterUtil.insertNodeAtCursor=function(node) {
    var html;
    var win,doc,div;
    if(pe.scene.headerfooter.currentArea=="header")
	{
		win=frames["ifRTC"];
		doc=win.document;
		div=doc.getElementById("RTC");
	}
	else if(pe.scene.headerfooter.currentArea=="footer")
	{
		win=frames["ifRTC1"];
		doc=win.document;
		div=doc.getElementById("RTC1");
	}
    
    if(node.nodeName&&node.nodeName.toLowerCase()=="span"&&node.hasAttribute("id")){
    	node.innerHTML = node.innerHTML.replace(/ /g,"&nbsp;");
    }
    if (!dojo.isIE && win.getSelection && win.getSelection().getRangeAt) {
    	setTimeout(function(){
			if(pe.scene.headerfooter.currentArea=="header")
				win=frames["ifRTC"];
			else if(pe.scene.headerfooter.currentArea=="footer")
				win=frames["ifRTC1"];
			var range=win.getSelection().getRangeAt(0);
	    	win.focus();
	    	range.deleteContents();
	    	for(var i=0;i<div.children.length;i++)
	    	{
	    		if(div.children.item(i).nodeName=="BR")
		    		div.removeChild(div.children.item(i));
	    	}
	    	if(div.children.length==0||(div.children.length==1&&div.children.item(0).nodeName=="P"&&div.children.item(0).childNodes.length==0))
	    	{
	    		var p=win.document.createElement("p");
	    		var txt=win.document.createTextNode("");
	    		p.setAttribute("ts",pe.scene.headerfooter.ts);
	    		p.appendChild(txt);
	    		range.insertNode(p);
	    		p.style.textAlign="left";
	    		range.setStart(p,0);
	    		range.setEnd(p,0);
	    		var last=div.children.item(div.children.length-1);
				if(last.nodeName!="P"||(last.nodeName=="P"&&last.childNodes.length>0))
				{
					p = win.document.createElement("p");
					p.setAttribute("ts",pe.scene.headerfooter.ts);
					div.appendChild(p);
				}
	    	}
	    	range.insertNode(node);
	    	range.setStartAfter(node);
	    	range.setEndAfter(node);
	    	pe.scene.currentRange = range;
	    	win.getSelection().removeAllRanges();
	    	win.getSelection().addRange(range);
	    	
	    	//For safari, and className again.
	    	if(node.textContent=="#" && !dojo.hasClass(node,"ODT_PN"))
	    		dojo.addClass(node,"ODT_PN");
	    	if(node.hasAttribute("datetime") && !dojo.hasClass(node,"ODT_DT"))
	    		dojo.addClass(node,"ODT_DT");
	    },0);
    } else if (doc.selection && doc.selection.createRange) {
        html = (node.nodeType == 3) ? node.data : node.outerHTML;
        if (!pe.scene.currentRange) {
        	pe.scene.currentRange = doc.selection.createRange();
        }
        pe.scene.currentRange.select();
        pe.scene.currentRange.pasteHTML(html);
        setTimeout( function() {
			pe.scene.currentRange.select();
			( dojo.isIE && document.documentMode < 9) && pe.scene.headerfooter.checkTabs();
		}, 0 );
    }
};
concord.widgets.headerfooter.headerfooterUtil.setBlockElementAlign=function(val)
{
	var range=pe.scene.currentRange;
	var parent=range.parentElement();
	while(parent&&parent.tagName!="LI"&&parent.tagName!="P"&&parent.tagName!="DIV"&&parent.tagName!="BODY")
	{
		parent=parent.parentElement;
	}
	if(parent.tagName!="BODY")
		parent.style.textAlign=val;
	range.select();
};
concord.widgets.headerfooter.headerfooterUtil.fixAlign=function(){
	var div,doc;
	if(pe.scene.headerfooter.currentArea=="header")
	{
		doc = frames["ifRTC"].document;
	}
	else if(pe.scene.headerfooter.currentArea=="footer")
	{
		doc = frames["ifRTC1"].document;
	} 
	dojo.query('[align]', doc).forEach(function(node, index, array){
		var align = dojo.attr(node,'align');
		dojo.style(node,"textAlign",align);
		dojo.removeAttr(node,"align");
	}); 
};

concord.widgets.headerfooter.headerfooterUtil.setDirection = function(dir)
{
	var div,doc;
	if(pe.scene.headerfooter.currentArea=="header"){
		doc = frames["ifRTC"].document;
		div = doc.getElementById("RTC");
	}else if(pe.scene.headerfooter.currentArea=="footer"){
		doc = frames["ifRTC1"].document;
		div = doc.getElementById("RTC1");
	}else{
		return;
	}

	var elements = dojo.query("p", doc), selection = doc.getSelection(), inSelection = false;
	for(var i = 0; i < elements.length; i++) {
		if(pe.scene.headerfooter.isIE) {
			inSelection = (pe.scene.currentRange.boundingTop <= elements[i].getClientRects()[0].top) &&
				(pe.scene.currentRange.getBoundingClientRect().bottom >= elements[i].getClientRects()[0].bottom);
		} else if(selection.containsNode) {
			inSelection = selection.containsNode(elements[i], true);
		}
		if(inSelection) {
			elements[i].style.direction = dir;
			elements[i].style.textAlign = (dir === 'rtl') ? 'right' : 'left';
		}
	}
	div.focus();
};
concord.widgets.headerfooter.headerfooterUtil.AlignRight = function() {
	if(pe.scene.headerfooter.isIE)
		concord.widgets.headerfooter.headerfooterUtil.setBlockElementAlign("right");
	else{
		concord.widgets.headerfooter.headerfooterUtil.execCmd('JustifyRight','');
		concord.widgets.headerfooter.headerfooterUtil.fixAlign();
	}
};
concord.widgets.headerfooter.headerfooterUtil.AlignLeft = function() {
	if(pe.scene.headerfooter.isIE)
		concord.widgets.headerfooter.headerfooterUtil.setBlockElementAlign("left");
	else{
		concord.widgets.headerfooter.headerfooterUtil.execCmd('JustifyLeft','');
		concord.widgets.headerfooter.headerfooterUtil.fixAlign();
	}
};
concord.widgets.headerfooter.headerfooterUtil.AlignCenter = function() {
	if(pe.scene.headerfooter.isIE)
		concord.widgets.headerfooter.headerfooterUtil.setBlockElementAlign("center");
	else{
		concord.widgets.headerfooter.headerfooterUtil.execCmd('JustifyCenter','');
		concord.widgets.headerfooter.headerfooterUtil.fixAlign();
	}
};
concord.widgets.headerfooter.headerfooterUtil.FontSize = function(val) {
	if(pe.scene.headerfooter.isIE&&pe.scene.currentRange)
	{//IE
		var len=pe.scene.currentRange.text.length;
		if(len>0)
		{//select a range
			concord.widgets.headerfooter.headerfooterUtil.blinkForField();
			pe.scene.currentRange.select();
			pe.scene.currentRange.execCommand('FontSize',false,val);
			var div,doc;
			if(pe.scene.headerfooter.currentArea=="header")
			{
				doc=frames["ifRTC"].document;
				div=doc.getElementById("RTC");
			}
			else if(pe.scene.headerfooter.currentArea=="footer")
			{
				doc=frames["ifRTC1"].document;
				div=doc.getElementById("RTC1");
			}
			concord.widgets.headerfooter.headerfooterUtil.setStyle(div);
			
		    // check tab.
		    ( dojo.isIE && document.documentMode < 9) && setTimeout(function(){pe.scene.headerfooter.checkTabs();}, 0);
		}
		else
			pe.scene.currentRange.collapse(false);
		pe.scene.currentRange.select();
	}	
	else//FF
		concord.widgets.headerfooter.headerfooterUtil.execCmd('FontSize',val);
};
concord.widgets.headerfooter.headerfooterUtil.FontColor = function(val) {
	concord.widgets.headerfooter.headerfooterUtil.execCmd('ForeColor',val);
};
concord.widgets.headerfooter.headerfooterUtil.FontName = function(val) {
	if(pe.scene.headerfooter.isIE&&pe.scene.currentRange)
	{
		var len=pe.scene.currentRange.text.length;
		if(len>0)
		{
			concord.widgets.headerfooter.headerfooterUtil.blinkForField();
			pe.scene.currentRange.select();
			pe.scene.currentRange.execCommand('FontName',false,val);
			var div,doc;
			if(pe.scene.headerfooter.currentArea=="header")
			{
				doc=frames["ifRTC"].document;
				div=doc.getElementById("RTC");
			}
			else if(pe.scene.headerfooter.currentArea=="footer")
			{
				doc=frames["ifRTC1"].document;
				div=doc.getElementById("RTC1");
			}
			concord.widgets.headerfooter.headerfooterUtil.setStyle(div);
			
		    // check tab.
		    ( dojo.isIE && document.documentMode < 9) && setTimeout(function(){pe.scene.headerfooter.checkTabs();}, 0);
		}
		else
			pe.scene.currentRange.collapse(false);
		pe.scene.currentRange.select();
	}	
	else
		concord.widgets.headerfooter.headerfooterUtil.execCmd('FontName',val);
};
concord.widgets.headerfooter.headerfooterUtil.GetHeaderContent = function() {
	var obj = frames["ifRTC"].document.getElementById("RTC");
	return obj.innerHTML;
};
concord.widgets.headerfooter.headerfooterUtil.GetFooterContent = function() {
	var obj = frames["ifRTC1"].document.getElementById("RTC1");
	return obj.innerHTML;
};
concord.widgets.headerfooter.headerfooterUtil.selectAll = function() {
	concord.widgets.headerfooter.headerfooterUtil.execCmd('selectAll','');
};
concord.widgets.headerfooter.headerfooterUtil.setStyle=function(div){
	var fns=div.getElementsByTagName("FONT");
	for(var i=0;i<fns.length;i++)
	{
		var fn=fns.item(i);
		var fontname="";
		var fontsize="";
		if( fn.hasAttribute('size'))
		{
			 var size = fn.getAttribute('size');
			 var value="";
			 switch( size )
			 {
			 	case "1":
			 		value = '8pt';
			 		break;
			 	case "2":
			 		value = '10pt'
			 		break;
			 	case "3":
			 		value = '12pt';
			 		break;
			 	case "4": 
			 		value = '14pt';
			 		break;
			 	case "5":
			 		value = '18pt';
			 		break;
			 	case "6":
			 		value = '24pt';
			 		break; 
			 	case "7":
			 		value = '36pt'
			 		break;
			 };
			 fontsize=value;
		}
		if( fn.hasAttribute('face'))
			fontname = fn.getAttribute('face');
		concord.widgets.headerfooter.headerfooterUtil.setSpanStyle(fn,fontsize,fontname);
	}	
};
concord.widgets.headerfooter.headerfooterUtil.setSpanStyle=function(div,fontsize,fontname)
{//div is a P or Span
	var children=div.children;
	for(var j=0;j<children.length;j++)
	{
		var child=children.item(j);
		if(child.nodeType==1&&(child.nodeName=="SPAN"||child.nodeName=="P"))
		{
			child.style.fontSize=fontsize;
			child.style.fontFamily=fontname;
			concord.widgets.headerfooter.headerfooterUtil.setSpanStyle(child,fontsize,fontname);
		}	
	}
};

concord.widgets.headerfooter.headerfooterUtil.getAbsDocBottom = function() {
	var iframe = dojo.byId("cke_contents_editor1");
	var documentEle = pe.scene.CKEditor.document.getDocumentElement();
	var scrollHeight = iframe.offsetHeight - documentEle.$.clientHeight;
	if(scrollHeight < 0)
		scrollHeight = 0;
	if(dojo.isIE)
		return document.documentElement.clientHeight - scrollHeight;
	else
		return document.documentElement.offsetHeight - scrollHeight;
};

/**
 * Update the header and footer fields with the proper date and time if they are
 * defined as variable.  Fixed values will not be changed.
 * 
 * If a slide has a variable date time header or footer field, the date time field
 * will be updated based on the locale and format defined in the html file.
 * 
 * @param slide Slide to update variable date time fields if they exist.
 */
concord.widgets.headerfooter.headerfooterUtil.updateHeaderFooterDateTimeFields=function(slide){
	// Define default in case nothing is set to the browser locale
	var defaultLocale = g_locale;
	// Retrieve all the date-time presentation class divs
	var dateTimeDrawFrames = dojo.query(".draw_frame[presentation_class='date-time']",slide);

	// For each dateTime frame, update based on information provided
	// Currently this is whether the value is fixed or variable.
	// If fixed, then just leave the value that is already in the span
	// If variable, need to use locale and format to calculate a date/time.
	for(var i=0; i< dateTimeDrawFrames.length; i++){
		var dateTimeFrame = dateTimeDrawFrames[i];
		var fixedField = dojo.attr(dateTimeFrame, "text_fixed");
		
		// If date-time is a fixed value, just continue as no calculations
		// are necessary.  Will just use imported value in span which is
		// the fixed value specified.  
		// Also if fixedfield is not set continue.  This will occur when
		// header date-time is checked but empty
		if (fixedField=="true" || fixedField == null) {
			continue;
		}
		
		// Get the format and locale for the conversion
		var format = dojo.attr(dateTimeFrame, "text_datetime-format");
		var locale = dojo.attr(dateTimeFrame, "text_locale");
		
		// If locale is not defined then default to browser locale
		if (locale == null || locale.length <= 0 || locale == "undefined") {
			locale = defaultLocale;
			dojo.attr(dateTimeFrame, "text_locale", locale);
		}
		
		// If en_US convert to en as the formatting methods don't seem to handle
		// en_US well.
		if (locale=="en_US") {
			locale="en";
		}if (locale=="zh_CN") {
			locale="zh";
		}
		
		// The locale passed in may not be in the language of the browser or a 
		// language that has been initialized.  To remedy this pull in the locale
		// so the correct language bundles will be retrieved by dojo.
		// Currently this assumes a gregorian calendar.  If another calendar
		// type is desired, will need to update this call.
		var normalizedLocale = dojo.i18n.normalizeLocale(locale).replace("_", "-");
		dojo["requireLocalization"]("dojo.cldr", "gregorian", normalizedLocale);
		
		// Get the formatted time based on the format and locale
		var formattedDateTime = this.formatDateTime(new Date() , format, normalizedLocale);
		
		// Place the formatted string into the span.
		var textSpan = dojo.query("span", dateTimeFrame);
		if (textSpan != null && textSpan[0] != null) {
			textSpan[0].innerHTML = dojo.string.substitute(formattedDateTime);
		}
		else 
		{
			// If a new presentation is loaded, the date/time could be on the 
			// span or the paragraph from Symphony.  
			var textP = dojo.query("p", dateTimeFrame);
			if (textP != null && textP[0] != null && textP[0].innerHTML != null) {			        
				textP[0].innerHTML = dojo.string.substitute(formattedDateTime);
			}
		}
	}
};

/**
 * Format a date based on the locale and format passed in.  The format passed in can
 * be a defined format or a format based on dojo.date.locale.format.
 * @param showString String that will be converted using the format
 * @param format Format string of the date or time.  Based on dojo.date.locale.format
 * @param locale Locale string to convert the date or time.
 * @returns The converted string based on the locale and format.
 */
concord.widgets.headerfooter.headerfooterUtil.formatDateTime=function(showString, format, locale){
	var rawDate = showString;

	try{
		try{								
			var options = {};
			
			// For now just need the locale and not the country for looking up the 
			// pattern.  For this will just grab the locale substing.  If formatting of
			// the date time is specific to locale and country, will have to update
			// this substring call accordingly.
			var localeSubstring = locale.substring(0,2);
			
			// Pattern is based on the time date formats in Symphony
			var pattern = concord.widgets.headerfooter.TimeDateFormatCode[format][localeSubstring];
			if (pattern == null) {
				pattern = concord.widgets.headerfooter.TimeDateFormatCode[format];
			}
			
			// If pattern is found then pass in the options for conversion.  If 
			// not found then use a date pattern with a date selector.
			if(pattern){
				dojo.mixin(options, pattern);
			}else{
				options.datePattern = format;
				options.selector = "date";
			}
			
			// Use the locale passed in or the default.  The default is usually the browser
			// defined setting.
			if (locale != null && locale.length > 0){
				options.locale = locale;
			} else {
				options.locale = g_locale;
			}
			
			// Main translation routine passing in the string as well as the options.
			showString = dojo.date.locale.format(rawDate, options);
		}
		catch(e){
			// If an error is thrown during translation, default to the rawDate format as well
			// as a date conversion.
			showString = dojo.date.locale.format(rawDate,{
				selector: "date"
			});
			//console.log(e);
		}
	}
	catch(e){
		// If error occurs then just return back the original string passed in as default.
		return showString;
	}
	
	// Returns the converted date time string or the same string passed in if any errors occur 
	// during translation.
	return showString;
};

/**
 * Update the page number in the header and footer elements on a single slide.
 * 
 * @param slides Slide to update page number.  Will update header and footer page numbers  
 * @param pageNumber Page number integer to start update for slide. 
 */
concord.widgets.headerfooter.headerfooterUtil.updatePageNumber=function(slide, pageNumber){
	if (slide != null) {
		// Refresh all field which field='page-number' to ensure that all page number field could be update
		// whatever the object type the page number field exist in 
		//TODO: pay attention to that there is without [field='page-number'] with current version.
		var pageNumberFields = dojo.query("span.text_page-number",slide);
		// loop to update all the page number field
		for(var j=0; j< pageNumberFields.length; j++){
			var pageNumberField = pageNumberFields[j];
			if (pageNumberField != null && pageNumberField.innerHTML) {
				pageNumber = concord.widgets.headerfooter.headerfooterUtil.formatPageNumber(pageNumberField, pageNumber);
				pageNumberField.innerHTML = pageNumber;
			}
		}
	}
};

/**
 * Update the page numbers in the header and footer elements on all slides.
 * 
 * @param slides Slides to update page number.  
 * @param startPageNumber Page number integer to start updating the page numbers for
 * the remainder of the slides.  If not specified will start the count at the 
 * first slide and update all the slides after that count.
 */
concord.widgets.headerfooter.headerfooterUtil.updatePageNumbers=function(slides, startPageNumber){

	if (slides != null) {
		var pageNumber = 0;
		
		if (startPageNumber != null && startPageNumber > 0) {
			pageNumber = startPageNumber;
		} else {
			startPageNumber = 1;
		}
		for(var i=startPageNumber-1; i< slides.length; i++){
			//D21725 [MasterStyle] sldNum in textbox is not updated after duplicate the slide
			//D30925: [Regression]The slide number format is not correct after insert a duplicate slide
			pageNumber++;
			concord.widgets.headerfooter.headerfooterUtil.updatePageNumber(slides[i],pageNumber);
		}
	}
};

/**
 * Formats the page number based on the number type
 * Currently the types defined are:
 *            4 -- Numeric
 * Support for the other types Symphony supports will be added later:
 * 			  0 -- Lowercase alphabetic
 * 			  1 -- Uppercase alphabetic
 * 			  2 -- Lowercase roman numeral
 * 			  3 -- Uppercase roman numeral
 * @param pageNumber Page Number integer to convert.
 * @returns Page number formatted based on the type.  Currently this is
 * only numeric but will support roman, and others in the future.
 */
concord.widgets.headerfooter.headerfooterUtil.formatPageNumber=function(div, pageNumber){
	if (BidiUtils.isArabicLocale()){
		pageNumber = BidiUtils.convertArabicToHindi(pageNumber + "");
	}
	return pageNumber;
};


