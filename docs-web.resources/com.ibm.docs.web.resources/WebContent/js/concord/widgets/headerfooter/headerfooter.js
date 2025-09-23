dojo.provide("concord.widgets.headerfooter.headerfooter");
dojo.require("dojo.i18n");
dojo.require("concord.util.BidiUtils");
dojo.require("concord.widgets.headerfooter.headerfooterUtil");

dojo.requireLocalization("concord.widgets.headerfooter","headerfooter");

dojo.declare("concord.widgets.headerfooter.headerfooter", null, {	
	headerLoaded:false,
	footerLoaded:false,
	loaded:false,
	constructor: function (domNode)
	{
		this.flag=false;
		this.ee=false;
		this.currentArea="text";
		this.hlock=false;//header not locked by others.
		this.flock=false;
		this.isIE=document.all?true:false;
		this.HEADER_EDITING=false;
		this.FOOTER_EDITING=false;
		this.currentImageID=null;
		this.nls = dojo.i18n.getLocalization("concord.widgets.headerfooter","headerfooter");
		this._createHeader();
		this._createFooter();
		this.ts = "";
		this.bodyLeft = 0;
	},
	_createHeader:function()
	{
		var mainNode = dojo.byId('mainNode');
		var headerDivCon=dojo.create('div',null,mainNode);
		headerDivCon.innerHTML= "<div id=\"header_editor\" class=\"editor\">" +
								"<div id=\"iframeDiv\" style=\"display:block;width:100%;height:100%\">"+
								"	<iframe id=\"ifRTC\" name=\"ifRTC\" role=\"application\" class=\"headerfooter_iframe\" frameborder=\"0\" src='" + window.contextPath + "/jsp/header.html' title=\"header frame\" aria-label=\"header frame\"></iframe>"+
								"</div>"+
								"</div>";
		dojo.attr(headerDivCon,"id","headerDivCon");
		dojo.attr(headerDivCon,"class","header_div_con");
		dojo.style(headerDivCon, {
			"display":"none"
		});
		
		var iframe = frames["ifRTC"];
		if (iframe.attachEvent){
		    iframe.attachEvent("onload", function(){
		    	pe.scene.headerfooter.headerLoaded = true;
		    	pe.scene.headerfooter.frameLoaded();
		    });
		} else {
		    iframe.onload = function(){
		    	pe.scene.headerfooter.headerLoaded = true;
		    	pe.scene.headerfooter.frameLoaded();
		    };
		}
	},	
	_createFooter:function()
	{
		var mainNode = dojo.byId('mainNode');
		var footerDivCon=dojo.create('div',null,mainNode);
		footerDivCon.innerHTML= "<div id=\"footer_editor\" class=\"editor\">" +
								"<div id=\"iframeDiv1\" style=\"display:block;width:100%;height:100%\">"+
								"	<iframe id=\"ifRTC1\" name=\"ifRTC1\" role=\"application\" class=\"headerfooter_iframe\" frameborder=\"0\" src='" + window.contextPath + "/jsp/footer.html' title=\"footer frame\" aria-label=\"footer frame\"></iframe>"+
								"</div>"+
								"</div>";
		dojo.attr(footerDivCon,"id","footerDivCon");
		dojo.attr(footerDivCon,"class","footer_div_con");
		dojo.style(footerDivCon, {
			"display":"none"
		});
		
		var iframe = frames["ifRTC1"];
		if (iframe.attachEvent){
		    iframe.attachEvent("onload", function(){
		    	pe.scene.headerfooter.footerLoaded = true;
		    	pe.scene.headerfooter.frameLoaded();
		    });
		} else {
		    iframe.onload = function(){
		    	pe.scene.headerfooter.footerLoaded = true;
		    	pe.scene.headerfooter.frameLoaded();
		    };
		}
	},
	_editHeader:function( firstTimeShow )
	{
		var header=dojo.byId("headerDivCon");
		dojo.style(header, {
			"width":this.getHFWidth()+"px",
			"left":this.getMarginLeft()+"px",
			"top":this.getHeaderMarginTop()+"px",
			"display":""
		});
		var toggler=dojo.byId("togglebar");
		var left = BidiUtils.isGuiRtl() ? this.getMarginLeft()-dojo.byId("togglebar").offsetWidth-2 : this.getMarginLeft()+this.getHFWidth()+2;
		dojo.style(toggler, {
			"left":left+"px",
			"top":(this.getHeaderMarginTop()+20)+"px",
			"display":""
		});
		dojo.attr(toggler,"class","headerfooter_expand");
		if(firstTimeShow)
		{
			header.style.display="none";
			dojo.attr(toggler,"class","headerfooter_collapse");
			toggler.title = pe.scene.toolbar.nls.HeaderExpand;
		}
	},
	_editFooter:function(firstTimeShow)
	{
		var footer=dojo.byId("footerDivCon");
		var h = concord.widgets.headerfooter.headerfooterUtil.getAbsDocBottom();
		dojo.style(footer, {
			"width":this.getHFWidth()+"px",
			"left":this.getMarginLeft()+"px",
			"top":(h - 67)+"px",
			"display":""
		});
		var toggler=dojo.byId("togglebar1");
		dojo.style(toggler, {
			"left":(this.getMarginLeft()+this.getHFWidth()+2)+"px",
			"display":""
		});
		dojo.attr(toggler,"class","headerfooter_expand1");
		if(firstTimeShow)
		{
			footer.style.display="none";
			dojo.attr(toggler,"class","headerfooter_collapse1");
			toggler.title = pe.scene.toolbar.nls.FooterExpand;
			pe.scene.headerfooter.firstTimeShowFooter=false;
		}
	},
	frameLoaded:function()
	{
		if(this.headerLoaded && this.footerLoaded)
		{
			this.updateBodyMargin();
			this.updateLocation();
			// For contenteditable IE8 or above only.
			var headerDoc = frames['ifRTC']?frames['ifRTC'].document:null;
			var footerDoc = frames['ifRTC1']?frames['ifRTC1'].document:null;
			if(g_locale == 'ja' || g_locale == 'ja-jp') {
				headerDoc&&headerDoc.body&&dojo.addClass(headerDoc.body,"lotusJapanese");
				footerDoc&&footerDoc.body&&dojo.addClass(footerDoc.body,"lotusJapanese");
			}
			if(g_locale == 'ko' || g_locale == 'ko-kr') {
				headerDoc&&headerDoc.body&&dojo.addClass(headerDoc.body,"lotusKorean");
				footerDoc&&footerDoc.body&&dojo.addClass(footerDoc.body,"lotusKorean");
			}
			if( dojo.isIE && document.documentMode >= 8 )
			{
				if( headerDoc && headerDoc.createStyleSheet )
				{
					var sheet = headerDoc.createStyleSheet();
					sheet.addRule('span[contenteditable=false]','display:inline-block');
				}
				if( footerDoc && footerDoc.createStyleSheet )
				{
					var sheet = footerDoc.createStyleSheet();
					sheet.addRule('span[contenteditable=false]','display:inline-block');
				}
			}
			// only load, do not create hidden div in body.
			this.loadObjFromDom("header_div", true);
			this.loadObjFromDom("footer_div", true);

			if(pe.scene.headerFooterIsEmpty("header_div") == false)
			{
				pe.scene.headerfooter._editHeader(true);
			}
			if(pe.scene.headerFooterIsEmpty("footer_div") == false)
			{
				pe.scene.headerfooter._editFooter(true);
			}
			this.loaded = true;
			
			// Add check tab listner for IE9 and FF and Safari
			pe.scene.headerfooter.setEventListener(true);
			(dojo.isIE && document.documentMode > 8) && headerDoc.addEventListener( 'DOMCharacterDataModified', pe.scene.headerfooter.checkTabs);
			(dojo.isIE && document.documentMode > 8) && footerDoc.addEventListener( 'DOMCharacterDataModified', pe.scene.headerfooter.checkTabs);
		}
	},
	setEventListener:function( isToAdd )
	{
		var headerDoc = frames['ifRTC']?frames['ifRTC'].document:null;
		var footerDoc = frames['ifRTC1']?frames['ifRTC1'].document:null;
		// Add check tab listner for FF and Safari
		if( (!dojo.isIE || document.documentMode > 8 ) && headerDoc )
		{
			if(isToAdd)
				headerDoc.addEventListener( 'DOMSubtreeModified', pe.scene.headerfooter.checkTabs);
			else
				headerDoc.removeEventListener( 'DOMSubtreeModified', pe.scene.headerfooter.checkTabs);
		}
		if( (!dojo.isIE  || document.documentMode > 8) && footerDoc )
		{
			if(isToAdd)
				footerDoc.addEventListener( 'DOMSubtreeModified', pe.scene.headerfooter.checkTabs);
			else
				footerDoc.removeEventListener( 'DOMSubtreeModified', pe.scene.headerfooter.checkTabs);
		}
	},
	getStoreDiv:function(id)
	{
		var ret=pe.scene.CKEditor.document.$.getElementById(id);
		if(ret)
			return CKEDITOR.dom.element.get(ret);
		else
			return null;
	},
	enableFooter:function()
	{
		var enableDiv = frames["ifRTC1"].document.getElementById("RTC1");
		if(!enableDiv)
			return;

		if(enableDiv.contentEditable=="true")
		{
			this.updateRangeByClick();
			return;
		}
		this.setStatus("footer_div");
		this.loadObjFromDom("footer_div");
		
		if(this.hlock||this.flock)
		{
			this.preventEdit();
			return;
		}
		else
		{
			this.lockFooter();
			pe.scene.toolbar._showToolbar();
			pe.scene.toolbar._showBackground();
			this.currentArea="footer";
			pe.scene.toolbar._setLocation();
			this.FOOTER_EDITING=true;
			var b=enableDiv.parentNode;
			b.scroll="";
			b.style.overflow="";
			this.setCursor();
		}
	},
	enableHeader:function()
	{
		var enableDiv = frames["ifRTC"].document.getElementById("RTC");
		if(!enableDiv)
			return;
		
		if(enableDiv.contentEditable=="true")
		{
			this.updateRangeByClick();
			return;
		}
		this.setStatus("header_div");
		this.loadObjFromDom("header_div");
		
		if(this.hlock||this.flock)
		{
			this.preventEdit();
			return;
		}
		else
		{
			this.lockHeader();
			pe.scene.toolbar._showToolbar();
			pe.scene.toolbar._showBackground();
			pe.scene.headerfooter.currentArea="header";
			pe.scene.toolbar._setLocation();
			pe.scene.headerfooter.HEADER_EDITING=true;
			var b=enableDiv.parentNode;
			b.scroll="";
			b.style.overflow="";
			this.setCursor();
		}
	},
	lockHeader:function()
	{
		this.lockById("header_div");
		frames["ifRTC"].document.getElementById("RTC").contentEditable=true;
		//try { frames["ifRTC"].document.execCommand( 'enableObjectResizing', false, false ) ; } catch(e) {};
		frames["ifRTC"].document.getElementById("RTC").style.background="#FFFFFF";
		frames["ifRTC"].document.body.style.background="#FFFFFF";
	},
	lockFooter:function()
	{
		this.lockById("footer_div");
		frames["ifRTC1"].document.getElementById("RTC1").contentEditable=true;
		//try { frames["ifRTC1"].document.execCommand( 'enableObjectResizing', false, false ) ; } catch(e) {};
		frames["ifRTC1"].document.getElementById("RTC1").style.background="#FFFFFF";
		frames["ifRTC1"].document.body.style.background="#FFFFFF";
	},
	lockById:function(id)
	{
		var storeDiv=this.getStoreDiv(id);
		var old = storeDiv.$.className||"";
		var act = SYNCMSG.createAttributeAct( storeDiv.getId(),{'class':'locked' },null,{'class':old},null);
		var msgPair = SYNCMSG.createMessage(MSGUTIL.msgType.Attribute, [act]);
		// Do not put in undo list.
		pe.scene.session.sendMessage(msgPair.msg);
	},
	unlockById:function(id)
	{
		var storeDiv=this.getStoreDiv(id);
		var old = storeDiv.$.className||"";
		var act = SYNCMSG.createAttributeAct( storeDiv.getId(),{'class':'nolock' },null,{'class':old},null);
		var msgPair = SYNCMSG.createMessage(MSGUTIL.msgType.Attribute, [act]);
		// Do not put in undo list.
		pe.scene.session.sendMessage(msgPair.msg);
		storeDiv.setAttribute('class','nolock');
	},
	preventEdit:function()
	{
		window.pe.scene.showWarningMessage(this.nls.HeaderFooterEditing,5000);
	},
	setStatus:function(id)
	{
		var val;
		var storeDiv=this.getStoreDiv(id);
		if(!storeDiv)
		{
			val=false;
		}			
		else
		{
			if(storeDiv.hasAttribute('class')&&(storeDiv.getAttribute('class')=='locked'))
			{
				val=true;
			}
			else
			{
				val=false;
			}
		}	
		this.setLockVal(id, val);
		// remove lock if no one edit header/footer
		if(pe.scene.session.isSingleMode())
		{
			this.hlock && this.unlockById('header_div');
			this.flock && this.unlockById('footer_div');
			this.hlock = false;
			this.flock = false;
		}
	},
	setLockVal:function(id,val)
	{
		if(id=='header_div')
		{
			this.hlock=val;
		}
		else
		{
			this.flock=val;
		}	
	},
	setUIval:function(id,val)
	{
		var element=null;
		if(id=="header_div")
		{
			element=frames["ifRTC"].document.getElementById("RTC");
		}
		else
		{
			element=frames["ifRTC1"].document.getElementById("RTC1");
		}
		if(element)
		{
			element.innerHTML=val;
			pe.scene.currentRange = null;
			//check tabs.
			(dojo.isIE && document.documentMode < 9) && pe.scene.headerfooter.checkTabs();
			(dojo.isIE && document.documentMode >= 9) && setTimeout(function(){pe.scene.headerfooter.checkTabs();},0);
		}
		return element;
	},
	loadObjFromDom:function(id, isFirstLoad)
	{
		// view mode, do not allow to edit the header or footer
		if (pe.scene.isViewMode()&&!pe.scene.isHTMLViewMode()) {
			return;
		}
		var paraNode=pe.scene.CKEditor.document.getBody();
		var storeDiv=this.getStoreDiv(id);
		if(!storeDiv)
		{
			if(isFirstLoad)
				return;
			storeDiv=new CKEDITOR.dom.element('div');
			storeDiv.setAttribute('id',id);
			storeDiv.setAttribute('class','nolock');
			storeDiv.setStyle('display','none');
			storeDiv.setHtml("<p ts=\""+ this.ts + "\" style=\"text-align:center\">&nbsp;</p><p ts=\""+ this.ts + "\" style=\"text-align:center\">&nbsp;</p>");
			paraNode.append(storeDiv,true);
			var msgPairs=[];
			var act=SYNCMSG.createInsertBlockElementAct(storeDiv);
			msgPairs.push( SYNCMSG.createMessage(MSGUTIL.msgType.Attribute, [act]) );
			SYNCMSG.sendMessage(msgPairs);
			this.setUIval(id, storeDiv.getHtml());
			this.setLockVal(id, false);
		}
		else
		{
			var last=storeDiv.$.lastChild;
			if(!dojo.isIE&&(last.nodeName!="P"||(last.nodeName=="P"&&last.childNodes.length>0)))
				storeDiv.appendHtml("<p ts=\""+ this.ts + "\" ></p>");
			var first=storeDiv.$.firstChild;
			if(!dojo.isIE&&first.nodeType==1&&first.nodeName=="P"&&first.textContent.trim().length==0)
			{
				if(!(first.lastChild&&first.lastChild.nodeType==1&&first.lastChild.nodeName=="BR"))
					storeDiv.getFirst().appendHtml("<br>");
			}
			var content=storeDiv.getHtml();
			var element=this.setUIval(id, content);
			if(storeDiv.hasAttribute('class')&&(storeDiv.getAttribute('class')=='locked'))
			{
				this.setLockVal(id, true);
			}
			else
			{
				this.setLockVal(id, false);
			}
			this.addStyleLink(id);
			if(!element)
				return;
			var images=element.getElementsByTagName("img");
			for(var i=0;i<images.length;i++)
			{
				var src=images.item(i).getAttribute("src");
				if( src )
				{
					var url=document.URL;
					var newURL;
					var loc;
					if(pe.scene.isHTMLViewMode())
						loc=src.indexOf(DOC_SCENE.version+"/Pictures/",0);
					else
						loc=src.indexOf("Pictures/",0);
					if(loc==0)
					{
						newURL=url.replace("content",src);
						images.item(i).setAttribute("src",newURL);
					}
					else
					{//For IE.
						loc=src.indexOf("/jsp/Pictures/",0);
						if(loc!=-1)
						{
							newURL=url.replace("content",src.substring(loc+5));
							images.item(i).setAttribute("src",newURL);
						}	
					}	
				}
			}	
		}
	},
	storeObjToDom:function(id,val)
	{
		var paraNode=pe.scene.CKEditor.document.getBody();
		var storeDiv=this.getStoreDiv(id);
		var msgPairs=[];
		var act;
		act = SYNCMSG.createDeleteBlockElementAct(storeDiv);
		msgPairs.push( SYNCMSG.createMessage(MSGUTIL.msgType.Element, [act]) );
		
		storeDiv.setHtml(val);
		// generate id for header/footer
		MSGUTIL.generateID(storeDiv);
		storeDiv.setAttribute("class","nolock");
		//replace image location
		var images=storeDiv.$.getElementsByTagName("img");
		for(var i=0;i<images.length;i++)
		{
			var src=images.item(i).getAttribute("src");
			if(src)
			{
				var rex=document.URL.substr(0,document.URL.length-7);
				var loc=src.indexOf(rex);
				if(loc!=-1)
				{
					var newURL=src.substring(rex.length);
					images.item(i).setAttribute("src",newURL);
				}					
			}
		}
		//Call for header footer.
		this.normalizeElements(storeDiv,storeDiv);

		act=SYNCMSG.createInsertBlockElementAct(storeDiv);
		msgPairs.push( SYNCMSG.createMessage(MSGUTIL.msgType.Element, [act]) );
		act = SYNCMSG.createUpdateHeaderFooterAct(id);
		msgPairs.push( SYNCMSG.createMessage(MSGUTIL.msgType.HeaderFooter, [act]) );
		SYNCMSG.sendMessage(msgPairs);
	},
	addStyleLink:function(id)
	{
		var url=document.URL;
		var hfdom=null;
		if(id=="header_div")
		{
			hfdom=frames["ifRTC"].document;
		}
		else
		{	
			hfdom=frames["ifRTC1"].document;
		}
		var linkNode=hfdom.getElementsByTagName("link").item(0);
		if(!linkNode)
		{
			linkNode=document.createElement("link");
			linkNode.setAttribute("rel", "stylesheet");
			linkNode.setAttribute("type", "text/css");
			linkNode.setAttribute("href", "style.css");
		}	
		if(linkNode.getAttribute("href")=="style.css")
		{
			var url=document.URL;
			var newHref=url.replace("content", "style.css");
			linkNode.setAttribute("href",newHref);
		}
	},
	
	filterRTC : function(rtc){
		if (!rtc){
			return;
		}
		if (!rtc.$){
			rtc = new CKEDITOR.dom.node(rtc);
		}
		
		if (!rtc.is || !rtc.is('div')){
			return;
		}
		
		var child = rtc.getFirst();
		var currentP = null;
		while(child){
			if (child.type!=CKEDITOR.NODE_ELEMENT || !MSGUTIL.isBlock(child)){
				
				var currentchild = child;
				child = child.getNext();
				if (!currentP){
					currentP = pe.scene.CKEditor.document.createElement("p");
					currentP.setAttribute("ts",this.ts);
					currentP.insertAfter(currentchild);
				}
				currentchild.remove();
				currentchild.appendTo(currentP);
			}else{
				currentP = null;
				child = child.getNext();
			}
			
		}
		
		return rtc.$;
	},
	quitEdit:function()
	{
		setTimeout(function(){
			pe.scene.headerfooter.filterRTC(frames["ifRTC"].document.getElementById("RTC"));
			pe.scene.headerfooter.filterRTC(frames["ifRTC1"].document.getElementById("RTC1"));
			frames["ifRTC"].document.getElementById("RTC").contentEditable=false;
			frames["ifRTC"].document.getElementById("RTC").style.background="#EEEEEE";
			frames["ifRTC"].document.body.style.background="#EEEEEE";
			frames["ifRTC"].document.getElementById("RTC").parentNode.scroll="no";
			frames["ifRTC"].document.getElementById("RTC").parentNode.style.overflow="hidden";
			frames["ifRTC1"].document.getElementById("RTC1").contentEditable=false;
			frames["ifRTC1"].document.getElementById("RTC1").style.background="#EEEEEE";
			frames["ifRTC1"].document.body.style.background="#EEEEEE";
			frames["ifRTC1"].document.getElementById("RTC1").parentNode.scroll="no";
			frames["ifRTC1"].document.getElementById("RTC1").parentNode.style.overflow="hidden";
			pe.scene.toolbar._hideToolbar();
			if(pe.scene.headerfooter.HEADER_EDITING)
			{
				pe.scene.headerfooter.storeObjToDom('header_div',concord.widgets.headerfooter.headerfooterUtil.GetHeaderContent());
				pe.scene.headerfooter.HEADER_EDITING=false;
			}
			if(pe.scene.headerfooter.FOOTER_EDITING)
			{
				pe.scene.headerfooter.storeObjToDom('footer_div',concord.widgets.headerfooter.headerfooterUtil.GetFooterContent());
				pe.scene.headerfooter.HEADER_EDITING=false;
			}
			pe.scene.currentRange = null;
			pe.scene.headerfooter.currentArea="text";
		}, 200);
	},
	quit:function()
	{
		pe.scene.headerfooter.filterRTC(frames["ifRTC"].document.getElementById("RTC"));
		pe.scene.headerfooter.filterRTC(frames["ifRTC1"].document.getElementById("RTC1"));
		pe.scene.toolbar._hideToolbar();
		if(pe.scene.headerfooter.HEADER_EDITING)
		{
			pe.scene.headerfooter.storeObjToDom('header_div',concord.widgets.headerfooter.headerfooterUtil.GetHeaderContent());
			pe.scene.headerfooter.HEADER_EDITING=false;
		}
		if(pe.scene.headerfooter.FOOTER_EDITING)
		{
			pe.scene.headerfooter.storeObjToDom('footer_div',concord.widgets.headerfooter.headerfooterUtil.GetFooterContent());
			pe.scene.headerfooter.HEADER_EDITING=false;
		}
		pe.scene.currentRange = null;
		pe.scene.headerfooter.currentArea="text";
	},
	getMarginLeft:function()
	{
		var frame=dojo.byId('cke_contents_editor1');
		var bodyMargin=pe.scene.CKEditor.document.getBody().$.getBoundingClientRect().left;
		return bodyMargin+frame.getBoundingClientRect().left;
	},
	getHFWidth:function()
	{
		return pe.scene.CKEditor.document.getBody().$.clientWidth;
	},

	getFrameBodyStyle:function(id)
	{
		var frameDiv=dojo.byId(id);
		var frame=frameDiv.getElementsByTagName('iframe').item(0);
		
		if(frame.contentDocument)
		  doc = frame.contentDocument; // For NS6
		else if(frame.contentWindow)
		  doc = frame.contentWindow.document; // For IE5.5 and IE6

		if(doc)
		{
		  var contentBody = doc.body;
		  var style = contentBody.style;
		  return style;
		}

		return "";
	},
	getHeaderMarginTop:function()
	{
		return concord.util.browser.getBrowserHeight()-dojo.byId('cke_contents_editor1').offsetHeight;
	},
	getScrollWidth:function() {
	  var noScroll, hasScroll, tempDiv = document.createElement("DIV");
	  tempDiv.style.cssText = "position:absolute; top:-1000px; width:200px; height:200px; overflow:hidden;";
	  noScroll = document.body.appendChild(tempDiv).clientWidth;
	  tempDiv.style.overflowY = "scroll";
	  hasScroll = tempDiv.clientWidth;
	  document.body.removeChild(tempDiv);
	  return noScroll-hasScroll;
	},
	_updateLocation:function(id)
	{
		if(this.isVisible(id)){
			var headerDivCon=dojo.byId(id);
			if(headerDivCon)
			{
				var left = pe.scene.headerfooter.getMarginLeft();
				var width= pe.scene.headerfooter.getHFWidth();
				dojo.style(headerDivCon, {
					"left":left+"px",
					"width":width+"px"
				});
				var documentEle = pe.scene.CKEditor.document.getDocumentElement();
				var clipRight = documentEle.$.clientWidth+(dojo.byId('ll_sidebar_div')?dojo.byId('ll_sidebar_div').offsetWidth:0)-left;
				headerDivCon.style.clip = "rect(auto,"+clipRight+"px,auto,auto)";
			}
		}
	},
	trackZoomOut:function()
	{
		var body=pe.scene.CKEditor.document.getBody();
		var frame=dojo.byId('cke_contents_editor1');
		var footerDiv=dojo.byId("footerDivCon");
		if(footerDiv)
		{
			var togVisible = this.isVisible("togglebar1");
			var footerVisible = this.isVisible("footerDivCon");
			if(togVisible||footerVisible){
				var toggler=dojo.byId("togglebar1");
				if(body.$.clientHeight<frame.clientHeight)
				{
					var marginbottom=frame.clientHeight-body.$.clientHeight-67;
					if(footerVisible){
						dojo.style(footerDiv, {
							"bottom":marginbottom+"px",
							"top":""
						});
					}
					if(togVisible){
						dojo.style(toggler, {
							"bottom":(marginbottom+15)+"px",
							"top":""
						});
					}
				}
				else
				{
					var h = concord.widgets.headerfooter.headerfooterUtil.getAbsDocBottom();
					if(footerVisible){
						dojo.style(footerDiv, {
							"bottom":"",
							"top":(h - 67)+"px"
						});
					}
					if(togVisible){
						dojo.style(toggler, {
							"bottom":"",
							"top":(h - 20 - 15)+"px"
						});
					}
				}
			}
		}	
	},
	updateBodyMargin:function()
	{
		var docBodyStyle = this.getFrameBodyStyle("cke_contents_editor1");
		var headerBodyStyle = this.getFrameBodyStyle("iframeDiv");
		var footerBodyStyle = this.getFrameBodyStyle("iframeDiv1");
		var docWidth = docBodyStyle.width;
		var docPaddingLeft = docBodyStyle.paddingLeft;
		var docPaddingRight = docBodyStyle.paddingRight;
		
		if(!docWidth)
		{
			docWidth = "615px";
			docPaddingLeft = docPaddingRight = "60px";
		}
		headerBodyStyle.paddingLeft = footerBodyStyle.paddingLeft = docPaddingLeft;
		frames["ifRTC"].document.getElementById("RTC").style.width = docWidth;
		frames["ifRTC1"].document.getElementById("RTC1").style.width = docWidth;
		
		// For tabstop in header/footer.
		// Multiply 0.999 to avoid tab change to another line due to precision lost in calculation.
		var w = CKEDITOR.tools.toCmValue(docWidth)*0.999;
		this.bodyLeft = CKEDITOR.tools.toCmValue(docPaddingLeft);
		this.ts = 'p:'+ (w/2) + 'cm,t:center;p:'+ w +'cm,t:right';
		this._addTsToBlock();
	},
	isVisible:function(id){
		var node=dojo.byId(id);
		var visible =dojo.style(node,"display");
		if(visible&&visible=="none"){
			return false;
		}
		return true;
	},
	setStyle:function(id,style){
		var node=dojo.byId(id);
		var visible =dojo.style(node,"display");
		if(visible&&visible=="none"){
			return;
		}
		dojo.style(node, style);
	},
	updateLocation:function()
	{
		var hf = pe.scene.headerfooter;
		hf._updateLocation("headerDivCon");
		hf._updateLocation("toolbarCon");
		hf._updateLocation("footerDivCon");
		hf.trackZoomOut();
		var headerMarginTop =null;
		var marginLeft=marginLeft||hf.getMarginLeft();
		var hfWidth=hfWidth||hf.getHFWidth();
		var headerMarginiTop=null;
		var left = BidiUtils.isGuiRtl() ? marginLeft-dojo.byId("togglebar").offsetWidth-2 : marginLeft+hfWidth+2;
		if(hf.isVisible("togglebar")){
			headerMarginTop = headerMarginTop||hf.getHeaderMarginTop();
			dojo.style(dojo.byId("togglebar"), {"left":left+"px",	"top":(headerMarginTop+20)+"px"});
		}
		if(hf.isVisible("togglebar1")){
			dojo.style(dojo.byId("togglebar1"),{"left":left+"px"});
		}
		if(hf.isVisible("headerDivCon")){
			headerMarginTop = headerMarginTop||hf.getHeaderMarginTop();
			dojo.style(dojo.byId("headerDivCon"), {"top":headerMarginTop+"px"});
		}
		
		if(hf.currentArea=="header" && hf.isVisible("toolbarCon")){
			headerMarginTop = headerMarginTop||hf.getHeaderMarginTop();
			dojo.style(dojo.byId("toolbarCon"),{"top":(headerMarginTop+67)+"px"});
		}
		pe.scene.toolbar.updateLocation();
	},
	
	addCss:function(id)
	{
		var obj=dojo.byId(id);
		obj.className="header_button span_focus";
	},
	removeCss:function(id)
	{
		var obj=dojo.byId(id);
		obj.className="header_button span_unfocus";
	},
	hideHeader:function()
	{
		var container = dojo.byId('headerDivCon'); 
		if(container!=null)
		{
			dojo.style(container, {
				"display":"none"
			});
		}
	},
	showHeader:function()//done
	{
		var container = dojo.byId('headerDivCon'); 
		if(container!=null)
		{
			dojo.style(container, {
				"display":"block"
			});
		}
		this.loadObjFromDom("header_div");
		this.updateLocation();
	},
	showFooter:function()
	{
		var container = dojo.byId('footerDivCon'); 
		if(container!=null)
		{
			dojo.style(container, {
				"display":"block"
			});
		}
		this.loadObjFromDom("footer_div");
		this.updateLocation();
	},
	hideFooter:function()
	{
		var container = dojo.byId('footerDivCon'); 
		if(container!=null)
		{
			dojo.style(container, {
				"display":"none"
			});
		}
	},
	remove:function(removeAll)
	{
		var innerStr = "<p ts=\""+ this.ts + "\" style=\"text-align:center\">&nbsp;</p><p ts=\""+ this.ts + "\" style=\"text-align:center\">&nbsp;</p>";
		var removeHead = function(){
			frames["ifRTC"].document.getElementById("RTC").innerHTML = innerStr;
			dojo.byId("headerDivCon").style.display="none";
			dojo.byId("togglebar").style.display="none";
		};
		var removeFooter = function(){
			frames["ifRTC1"].document.getElementById("RTC1").innerHTML = innerStr;
			dojo.byId("footerDivCon").style.display="none";
			dojo.byId("togglebar1").style.display="none";
		};
		if(removeAll){
			removeHead();
			removeFooter();
		}
		else if(pe.scene.headerfooter.currentArea=="header"){
			removeHead();
		}
		else{
			removeFooter();
		}
		
		this.quitEdit();
	},
	updateRange:function(id,event)
	{
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
	    if((event.altKey)&&(event.keyCode==121))     
		{
	    	// alt + F10, set focus to toolbar.
	    	pe.scene.toolbar && pe.scene.toolbar._toolbar.focus();
	    	dojo.stopEvent(event);
	    	return;
		}
	    else if((event.ctrlKey)&&(event.keyCode==65))     
		{
			if(pe.scene.headerfooter.isIE)
				concord.widgets.headerfooter.headerfooterUtil.selectAll();
			else
			{
				var range=win.getSelection().getRangeAt(0);
				if(div.children.length>1||(div.children.length==1&&div.children.item(0).nodeName!="BR"))
				{
					var last=div.children.item(div.children.length-1);
					if(last.nodeName!="P"||(last.nodeName=="P"&&last.childNodes.length>0))
						div.appendChild(win.document.createElement("p"));
					last=div.lastChild.previousSibling;
					range.setStart(div,0);
					range.setEnd(div,div.childNodes.length-1);
					win.getSelection().addRange(range);
				}
				dojo.stopEvent(event);
			}
		}
		else if(this.setRangeForFieldAndTab(doc, event.keyCode))
		{//solve left arrow, right arrow, end key.
			dojo.stopEvent(event);
		}
		else if(this.deleteKey(doc, event.keyCode))
		{//solve backspace, delete key.
			dojo.stopEvent(event);
		}
		else if(event.keyCode==9)
		{
			// tab key
			var imghtml='<img unselectable="on" class="ConcordTab">';
			var tabEle = CKEDITOR.dom.element.createFromHtml(imghtml);
			var ckDoc = new CKEDITOR.dom.document( doc );
			var sel = new CKEDITOR.dom.selection( ckDoc );
			var ranges = sel.getRanges();
			// Left or right key
			if( ranges )
			{
				ranges[0].insertNode(tabEle);
				ranges[0].setStartAfter(tabEle);
				ranges[0].collapse(true);
				ranges[0].select();
			}
			dojo.stopEvent(event);
		}
		else
		{
		    if (!dojo.isIE && win.getSelection && win.getSelection().getRangeAt) {//for FF
		    	var handle = this;
		    	setTimeout(function(){
					var range=win.getSelection().getRangeAt(0);
			    	win.focus();
			    	for(var i=0;i<div.children.length;i++)
			    	{
			    		if(div.children.item(i).nodeName=="BR")
				    		div.removeChild(div.children.item(i));
			    	}
			    	if(div.children.length==0||(div.children.length==1&&div.children.item(0).nodeName=="P"&&div.children.item(0).childNodes.length==0))
			    	{
			    		var p=win.document.createElement("p");
			    		var txt=win.document.createTextNode("");
			    		p.appendChild(txt);
			    		p.style.textAlign="left";
			    		p.setAttribute("ts",handle.ts);
			    		range.insertNode(p);
			    		range.setStart(p,0);
			    		range.setEnd(p,0);
			    		if(p.previousSibling)
			    		{
			    			var txt=p.previousSibling.parentNode.removeChild(p.previousSibling);
			    			p.appendChild(txt);
			    			range.setStart(txt,txt.length);
				    		range.setEnd(txt,txt.length);
			    		}
			    		win.getSelection().removeAllRanges();
			    		win.getSelection().addRange(range);
			    		var last=div.children.item(div.children.length-1);
						if(last&&last.nodeName!="P"||(last.nodeName=="P"&&last.childNodes.length>0))
						{
							p = win.document.createElement("p");
							p.setAttribute("ts",handle.ts);
							div.appendChild(p);
						}
			    	}
			    },0);
		    } 
		    else if (doc.selection && doc.selection.createRange)
		    {
		    	var handle = this;
		    	setTimeout(function(){
					var range=doc.selection.createRange();
			    	for(var i=0;i<div.children.length;i++)
			    	{
			    		if(div.children.item(i).nodeName=="BR")
				    		div.removeChild(div.children.item(i));
			    	}
			    	if(div.children.length==0||(div.children.length==1&&div.children.item(0).nodeName=="P"&&div.children.item(0).childNodes.length==0))
			    	{
			    		var p=win.document.createElement("p");
			    		var txt=win.document.createTextNode("");
			    		p.appendChild(txt);
			    		p.style.textAlign="left";
			    		p.setAttribute("ts",handle.ts);
			    		div.appendChild(p);
			    		if(p.previousSibling)
			    		{
			    			var txt=p.previousSibling.parentNode.removeChild(p.previousSibling);
			    			p.appendChild(txt);
			    		}
			    		range.moveToElementText(p);
			    		range.collapse(false);
			    		range.select();
			    		pe.scene.currentRange = range;
			    		var last=div.children.item(div.children.length-1);
						if(last&&last.nodeName!="P"||(last.nodeName=="P"&&last.childNodes.length>0))
						{
							p = win.document.createElement("p");
							p.setAttribute("ts",handle.ts);
							div.appendChild(p);
						}
			    	}
			    },0);
		    }	
		}
	    //check tabs.
	    if( event.keyCode!=37 && event.keyCode!=39 && dojo.isIE )
	    	setTimeout(function(){pe.scene.headerfooter.checkTabs();}, 0);
	    
		concord.widgets.headerfooter.headerfooterUtil.getRange();
	},
	// Delete or backSpace
	deleteKey:function (doc, key)
	{
		if( key != 46 && key != 8 )
			return false;
		var ckDoc = new CKEDITOR.dom.document( doc );
		var sel = new CKEDITOR.dom.selection( ckDoc );
		var range = MSGUTIL.getRange(sel);
		var isBackspace = key==8?true:false;
		var guard = function(node)
		{
			if(MSGUTIL.isFieldElement(node))
				return true;
			return !!(node && node.is && node.is("img") && node.isVisible());
		};
		if(range.collapsed)
		{
			var isStartOfBlock = range.checkStartOfBlock();
			var isEndOfBlock = range.checkEndOfBlock();
			// Delete the whole Field when using backspace or delete key.
			var node = null;
			if( ( isBackspace && ( node = MSGUTIL.isAfterElement(range, guard) ) )
				|| ( !isBackspace && ( node = MSGUTIL.isBeforeElement(range, guard) ) ) )
			{
				// remove all child first in field, otherwise the tab width will not update.
				var child = node.getFirst();
				while(child)
				{
					child.remove();
					child = node.getFirst();
				}
				// resize image width to zero, otherwise the tab width will not update.
				if(node.is("img"))
					node.setStyle("width", "0px");
				node.remove();
				return true;
			}
			if(!dojo.isWebKit
				|| (!isStartOfBlock && !isEndOfBlock)
				|| (isBackspace && !isStartOfBlock)
				|| (!isBackspace && !isEndOfBlock))
				return false;
		}
		else // Selection
		{
			if(!dojo.isWebKit)
				return false;
			var startBlock = MSGUTIL.getBlock(range.startContainer);
			var endBlock = MSGUTIL.getBlock(range.endContainer);
			if( startBlock.$ == endBlock.$ )
				return false;
		}
		// Remove all contenteditable=false for field in Safari, otherwise field will delete.
		// SetTimer to set back after Safari merged blocks.
		concord.widgets.headerfooter.headerfooterUtil.blinkForField();

		return false;
	},
	
	// Move cursor to the front/behind of the field/Tab when cursor is at behind/front
	// of the field/Tab and using right/left key.
	// Return true if it is this situation, otherwise return false.
	// Same as coediting plugin's setRangeForField.
	setRangeForFieldAndTab:function (doc, key)
	{
		var ckDoc = new CKEDITOR.dom.document( doc );
		var sel = new CKEDITOR.dom.selection( ckDoc );
		var ranges = sel.getRanges();
		// Left or right key
		if( ranges && ( key == 37 || key == 39 || key == 35 ) )
		{
			var node = null;
			var range = null;
			var guard = function(node)
			{
				if(MSGUTIL.isFieldElement(node))
					return true;
				return !!(node && node.is && node.is("img") && node.getAttribute('class')
					&& ( node.getAttribute('class').indexOf("ConcordTab") >= 0));
			};
			if( key == 35 )
			{
				CKEDITOR.tools.setTimeout( function(){
					var ckDoc = new CKEDITOR.dom.document( doc );
					var sel = new CKEDITOR.dom.selection( ckDoc );
					var ranges = sel?sel.getRanges():null;
					if(ranges)
					{
						var range = ranges[ranges.length - 1];
						if(range.checkEndOfBlock())
							return;
						var node = MSGUTIL.isBeforeFieldElement(range);
						if(node)
						{
							var rangeList = range.endContainer.getAscendant( 'li', true );
							if( rangeList )
							{
								var nodeList = node.getAscendant( 'li', true );
								if( nodeList && nodeList.$ != rangeList.$ )
									return;
							}
							range.endOffset = node.getIndex() + 1;
							range.endContainer = node.getParent();
							range.collapse();
							sel.selectRanges([range]);
						}
					}
				}, 0, this );
				return false;
			}
			else if( key == 37 )
			{
				range = ranges[0];
				node = MSGUTIL.isAfterElement(range, guard);
			}
			else if( key == 39 )
			{
				range = ranges[ranges.length - 1];
				node = MSGUTIL.isBeforeElement(range, guard);
			}
			var isCollapsed = range.collapsed;
			if( node )
			{
				if( key == 37 )
				{
					range.startOffset = node.getIndex();
					range.startContainer = node.getParent();
					if( isCollapsed )
						range.collapse(true);
				}
				else if( key == 39)
				{
					range.endOffset = node.getIndex() + 1;
					range.endContainer = node.getParent();
					if( isCollapsed )
						range.collapse();
				}
				sel.selectRanges([range]);
				return true;
			}
			return false;
		}
		return false;
	},
	updateRangeByClick:function(event)
	{
		// Only in IE, when field is at the end of line, cursor can not move to the end by mouse.
		// Same logic as selection plugin.
		if(dojo.isIE && event && event.srcElement)
		{
			var doc = pe.scene.headerfooter.currentArea=='header'?frames['ifRTC'].document:frames['ifRTC1'].document;
			var ckDoc = new CKEDITOR.dom.document( doc );
			var target = new CKEDITOR.dom.element(event.srcElement);
			var r = new CKEDITOR.dom.range(ckDoc);
			r.setStartAt(target,CKEDITOR.POSITION_BEFORE_END);
			var fieldNode = MSGUTIL.isAfterFieldElement(r);
			if( fieldNode )
			{
				var offsetField = fieldNode.$.offsetWidth;
				var node = fieldNode;
				while( node && node.nodeName != 'BODY' )
				{
					offsetField += node.$.offsetLeft;
					node = node.$.offsetParent;
				}
				var offsetMouse = event.clientX;
				node = target;
				while( node && node.nodeName != 'BODY' )
				{
					offsetMouse += node.$.offsetLeft;
					node = node.$.offsetParent;
				}
				if( event.clientX >= offsetField )
				{
					var sel = new CKEDITOR.dom.selection( ckDoc );
					var ranges = sel?sel.getRanges():null;
					if(!ranges)
						return;
					var range = ranges[0];
					var isCollapsed = range.collapsed;
					range.setStartAfter( fieldNode );
					if(isCollapsed)
						range.collapse(true);
					sel.selectRanges(ranges);
				}
			}
		}
		concord.widgets.headerfooter.headerfooterUtil.getRange();
	},
	stopEvent:function(e)
	{
		dojo.stopEvent(e);
	},
	showToolTip:function(div,type)
	{
		if(div.contentEditable=="false" && !pe.scene.isViewMode())
		{
			if(type == 'header')
				div.title = this.nls.DoubleClickToEditHeader;
			else
				div.title = this.nls.DoubleClickToEditFooter;
		}
		else
			div.title = '';
	},
	// support tab in header/footer for event listener
	checkTabs:function(e)
	{
		// remove listener
		pe.scene.headerfooter.setEventListener(false);
		var node = null;
		var area = pe.scene.headerfooter.currentArea;
		if(area=='header' || area =='text')
		{
			node = new CKEDITOR.dom.element(frames['ifRTC'].document.getElementById("RTC"));
			concord.text.tools.fixTab( node, true, pe.scene.headerfooter.bodyLeft );
		}
		if(area=='footer' || area =='text')
		{
			node = new CKEDITOR.dom.element(frames['ifRTC1'].document.getElementById("RTC1"));
			concord.text.tools.fixTab( node, true, pe.scene.headerfooter.bodyLeft );
		}
		// add listener, set a timer otherwise will cause dead loop in IE.
		if(dojo.isIE && document.documentMode > 8)
			setTimeout(function(){pe.scene.headerfooter.setEventListener(true);}, 0);
		else
			pe.scene.headerfooter.setEventListener(true);
	},
	_addTsToBlock:function()
	{
		var doc = frames["ifRTC"].document;
		var doc1 = frames["ifRTC1"].document;
		dojo.query('p,li,td,th,h1,h2,h3,h4,h5,h6', doc).forEach(function(node, index, array){
			if(!dojo.attr( node, 'ts'))
				dojo.attr( node, {'ts' : this.ts});
		});
		dojo.query('p,li,td,th,h1,h2,h3,h4,h5,h6', doc1).forEach(function(node, index, array){
			if(!dojo.attr( node, 'ts'))
				dojo.attr( node, {'ts' : this.ts});
		});
	},
	//Defect 46832. change the old tag with span.
	normalizeElements:function( node,root)
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
				pe.scene.headerfooter.normalizeElements( child ,root);
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
					
				else if ( child.is('br'))
				{
					var brPos;
					if(!root){
						brPos = 0;
					}
					brPos = MSGUTIL.transOffsetRelToAbs(child,0,root);
					if(brPos!=0||brPos<totalLen){
					
					}else if( child.hasAttribute('id') )
						child.removeAttribute('id');
					else if( child.getParent().getAttribute('id')!= 'concordTempPasteDiv') //is not the root br
						child.remove();
				}
				this.fixStyles( child );
			}
			else if ( !child.type  )
			{ //maybe comments ...
				child.remove();
			}
			child = next;
		}
		//dojo.forEach( divs, normalizeDiv );
		dojo.query('.ODT_PN, .ODT_DT', node.$).forEach(function(item, index, array)
		{
			if( item.children.length==1 && item.children.item(0).nodeName=="SPAN")
			{
				var field = new CKEDITOR.dom.element(item);
				var child = field.getFirst();
				var spanStyles = MSGUTIL.getStyleParas(dojo.attr(child.$,'style'));
				MSGUTIL.setStyles(field, spanStyles);
				child.remove(true);
			}
		});
	},
	fixStyles:function(node)
	{
		var tag = node.getName();
		var styles;
		switch(tag)
		{
			case 'strong':
			case 'b':
				styles = CKEDITOR.config.coreStyles_bold.styles;
			break;
			case 'em':
			case 'i':
				styles = CKEDITOR.config.coreStyles_italic.styles;
			break;
			case 'u':
				styles = CKEDITOR.config.coreStyles_underline.styles;
			break;
			case 'strike':
				styles = CKEDITOR.config.coreStyles_strike.styles;
			break;
			case 'sup':
				styles = CKEDITOR.config.coreStyles_subscript.styles;
			break;
			case 'sub':
				styles = CKEDITOR.config.coreStyles_superscript.styles;
			break;
			case 'font':
				styles={};
				if( node.hasAttribute('size'))
				{
					 var size = node.getAttribute('size');
					 var value;
					 switch( size )
					 {
					 case "1":
					 		value = '8pt';
					 		break;
					 	case "2":
					 		value = '10pt';
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
					 		value = '36pt';
					 		break;
					 };
					value && (styles['font-size'] = value);
					node.removeAttribute('size');	
				}
				if( node.hasAttribute('color'))
				{
					styles['color'] = node.getAttribute('color');
					node.removeAttribute('color');
				}
				if( node.hasAttribute('face'))
				{
					styles['font-family'] = node.getAttribute('face');
					node.removeAttribute('face');
				}
				break;
			break;
		};
		if( styles )
		{
			var p = node.getParent();
			if( p.is('span') && p.getChildCount()!=1)
			{
				MSGUTIL.moveChildren(node);
			}
			else
			{
				p = null;
				if( node.getChildCount()==1 )
				{
					var child = node.getFirst();
					if( child.is && child.is('span'))
					{
						MSGUTIL.moveChildren(node);
						p = child;
					}
				}
				if( !p )
				{
					node.renameNode('span');
					p = node;
				}
			}
			MSGUTIL.setStyles( p,styles);
		}
	},
	setCursor:function()
	{
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
		// Webkit is sometimes failed to focus iframe, blur it first(#3835).
		if( dojo.isWebKit && win.parent )
			win.parent.focus();
		div.focus();
	    var sel,range;
	    if (!dojo.isIE && win.getSelection && win.getSelection().getRangeAt)
		{
	    	sel = win.getSelection();
	    	if(pe.scene.currentRange)
	    		range = pe.scene.currentRange;
	    	else
	    	{
	    		range=win.getSelection().getRangeAt(0);
	    		div.firstChild ? range.setStart(div.firstChild,0) : range.setStart(div,0);
	    		range.collapse(true);
	    	}
	    	sel.removeAllRanges();
	    	sel.addRange(range);
	    }
		else if (doc.selection && doc.selection.createRange)
		{
//	        sel=doc.selection;
//	        sel.empty();
			if (!pe.scene.currentRange) {
	        	pe.scene.currentRange = doc.selection.createRange();
	        	pe.scene.currentRange.collapse(true);
	        	pe.scene.currentRange.select();
	        }
	    }
	}
});


