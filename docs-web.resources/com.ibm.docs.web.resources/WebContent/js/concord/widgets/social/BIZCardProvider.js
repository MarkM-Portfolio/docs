dojo.provide("concord.widgets.social.BIZCardProvider");
dojo.require("dojo.i18n");
dojo.require("concord.util.conditional");
dojo.require("dijit.Tooltip");
dojo.declare("concord.widgets.social.BIZCardProvider", null, {
	bBIZCardAvailable:false,
	javlin_path:null,
	bInitial:false,
	bPreventFocus:false,
	constructor: function(initialParams) 
	{
		if (this.bInitial)
			return;
		
		if ( initialParams && initialParams.bBIZCardAvailable && initialParams.root && initialParams.root != "" && concord.util.conditional.entitilementVerification('bh_contacts'))
		{
			if (!window.djConfig)
				window.djConfig = {};
			window.djConfig.isDebug=true;
			window.stproxyConfig = window.stproxyConfig||{};
			window.stproxyConfig.tokenLogin = true;
			window.stproxyConfig.isConnectClient = false;
			var scriptElem = document.createElement('script');
			var lang_locate = g_locale.split('-');
			var lang_para = '&lang='+lang_locate[0]+'&country='+lang_locate[1];
			scriptElem.src =  (window.location.protocol == "https:"?initialParams.ssl_root:initialParams.root)+(gIs_cloud?'/connections/resources/web/_js/?include=lconn.profiles.bizCard.bizCardUI&exclude=dojo.i18n~&debug=true'+lang_para:'');
			scriptElem.type="text/javascript";
			document.body.insertBefore(scriptElem,document.body.firstChild);
			if (gIs_cloud)
			{
				this.javlin_path = (window.location.protocol == "https:"?initialParams.ssl_root:initialParams.root)+'/connections/resources/web/_js/?include=lconn.core.people&exclude=dojo.i18n&debug=true'+lang_para;
				concord.util.conditional.processUntilAvailable(dojo.hitch(this,"_loadJavlin"),dojo.hitch(this,"_errorProcess"),"window.SemTagSvc && window.SemTagSvc.parseDom",null,false);
			}
			else
				concord.util.conditional.processUntilAvailable(dojo.hitch(this,"_FinalProcess"),dojo.hitch(this,"_errorProcess"),"window.SemTagSvc && window.SemTagSvc.parseDom",null,false);
		}
		else
		{
			this.bInitial = true;
		}
	},
	_loadJavlin: function()
	{
		var scriptElem = document.createElement('script');
		var nls = "";
        var LOFVars = {};
        LOFVars.nls = nls;
        window.ibm = window.ibm || {};
        window.ibm.LOFVars = LOFVars;
		scriptElem.src =  this.javlin_path;
		scriptElem.type="text/javascript";
		dojo.connect(scriptElem,"onload",this,"_FinalProcess");
		document.body.insertBefore(scriptElem,document.body.firstChild);
	},
	getJavlinVersion: function()
	{
		return '1.40.33';
	},
	_errorProcess: function ()
	{
		this.bBIZCardAvailable = false;
		this.bInitial = true;
	},
	preventFocusRestore: function ()
	{
		if (this.bBIZCardAvailable && !gIs_cloud)
		{
			this.bPreventFocus = true;
		}
	},
	isPreventFocusRestore:function()
	{
		var bRet = this.bPreventFocus;
		this.bPreventFocus =false;
		return bRet;
	},
	_FinalProcess: function ()
	{
		this.bInitial = true;
		this.bBIZCardAvailable = true;
		var headers = document.getElementsByTagName('head');
		if (headers[0])
		{
			var links = headers[0].getElementsByTagName('link');
			for (var i=0;i<links.length;i++)
			{
				var link = links[i];
				if (link.rel == "stylesheet" && link.type == "text/css" && link.media == "screen")
				{
					var href = link.href.toLowerCase();
					if ( href.indexOf("webclientall.css") != -1)
					{
						headers[0].removeChild(link);
						break;
					}
				}
			}
		}
		if (!gIs_cloud)
			this._replaceDupClass();
	},
	_replaceDupClass: function()
	{
		LCSemTagMenu.endHideTimer= function(menuId) {
			LCSemTagMenu.printDebug("HIDE TIMER expired for " + menuId + ". Firing hide method.");
			menuElem = dojo.byId(menuId);
			LCSemTagMenu.hide(menuId);
			//if (!conditionRenderer.isPreventFocusRestore())
			//	LCSemTagMenu.restoreFocus();
		};
		LCSemTagMenu.showHover = function(event, clickHandler) 
		{
			this.printDebug("in showHover");
			try
			{
				if( LCSemTagMenu.staticHover) 
					return;
				try 
				{
					// if focus was set from restoreFocus function and triggered a show event, skip showing and reset the focusRestored flag
					if (LCSemTagMenu.focusRestored && event.type == "focus" ) 
					{
						LCSemTagMenu.printDebug("skipping showHover because focus was restored from hide timer... event [" + event.type + "]. ");
						LCSemTagMenu.focusRestored = false;
						return;
					}
				}
				catch(e) 
				{
					console.log("showHover: eat exception, IE has issues with certain events not having an event.type, so reset flag regardless");
					LCSemTagMenu.focusRestored = false;
					return;
				}
				LCSemTagMenu.originalActiveEl = document.activeElement;
				var elem = lconn.core.bizCard.bizCardUtils.getElementFromEvent(event);
				//in case of <img> enclosed in <a>, the image is the one that gets the mouseover, but the <a> element is the one we want
				if(elem && elem.tagName.toLowerCase() == "img" && elem.parentNode.tagName.toLowerCase() == "a") 
					elem = elem.parentNode;
				// save the current hovered element's tabIndex and next sibling for later restoration
				LCSemTagMenu.elemOrigTabIdx = elem.getAttribute("tabIndex");
				if ( LCSemTagMenu.tabOrderByTabIndex && !LCSemTagMenu.elemOrigTabIdx ) 
				{
					LCSemTagMenu.elemNext = elem.nextSibling;
					elem.setAttribute("tabIndex", parseInt(Number(LCSemTagMenu.elemTempTabIdx))); // set temp tabIndex if element does not have a tabIndex
				}
				var tag = LCSemTagMenu.getMenuTag( elem );
				var origRefCnt = 0;
				if (elem && elem != LCSemTagMenu.currentElem) 
				{ // new hover request
					LCSemTagMenu.clearAllSvcHandlers(tag);
					origRefCnt = elem.getAttribute(lconn.core.bizCard.bizCardUtils.refcntAttr);
					if (origRefCnt) {
						LCSemTagMenu.currentEvent = event;
						LCSemTagMenu.setCurrentElement(elem);
					}
					else {
						LCSemTagMenu.printDebug("showHover called for a DOM element with no refcnt attribute!");
						LCSemTagMenu.setCurrentElement(null);
						return;
					}
				}
				LCSemTagMenu.addSvcHandler(tag, clickHandler);
				// everybody called in = time to actually show hover
				LCSemTagMenu.setRefCount(origRefCnt);
				// RTC #82748
				// Issue occurs when we render the mini bizcard through the renderMiniBizCard from another event.
				// This means that the bc_document_node could possibly be created on a node other than the
				// one that it is normally created on (semtagmenu node). Once this happens the normal bizcard
				// uses the mini bizcard node which could possibly be hidden off the screen or doesnt have the
				// correct parent. This causes the page to jump to the location of that bizcard node.
				// PMR #56213,122,000
				// Modified this logic to exclude the inline card for communities, which was disappearing when the
				// page contained an inline community AND a popup profile card.
				var bcDocNode = dojo.byId('bc_document_node');
				if (bcDocNode) 
				{
					var removeNode = true;
					var bcDocParent = bcDocNode.parentNode;
					while (bcDocParent) 
					{
						if (bcDocParent.className && bcDocParent.className.indexOf('popupPersonCard') > -1 || bcDocParent.className.indexOf('vcomm') > -1) 
						{
							removeNode = false;
							break;
						}
						bcDocParent = bcDocParent.parentNode;
					}
					if (removeNode) 
					{
						bcDocNode.parentNode.removeChild(bcDocNode);
					}
				}
				var out = new lconn.core.bizCard.bizCardUtils.out();
				LCSemTagMenu.writeHover(out, "ltr");
				tag.innerHTML = out.buffer;
				LCSemTagMenu.showing = true;
				var pos = LCSemTagMenu.currentElemPosition;
				LCSemTagMenu.show(
					LCSemTagMenu.id,
					event,
					Math.round(pos.x), 0,
					Math.round(pos.y), pos.h,
					Math.round(pos.w), Math.round(pos.h),
					LCSemTagMenu.hoverOffset.w);
				LCSemTagMenu.hoverOffset.w = LCSemTagMenu.getMenuTag().children[0].offsetWidth;
			}
			catch(e)
			{
				console.error("Error in LCSemTagMenu.showHover");
				console.error(e);
			}
		};
		var elem = LCSemTagMenu.getMenuTag();
		if (elem)
		{
			dojo.removeClass(elem,"lotusui30_fonts");
			dojo.addClass(elem,"docs_st_biz");
		}
	},
	_generateDefaultHover : function(item,container)
	{
		this.bBIZCardAvailable = false;
		container.title = item.UserName;
		
	},
	
	generateHover: function (item,container) 
	{
		if (!this.bInitial)
		{
			setTimeout(dojo.hitch(this,"generateHover",item,container),1000);
			return true;
		}
		if (!this.bBIZCardAvailable)
		{
			this._generateDefaultHover(item,container);
			return false;
		}
		else
		{
			if (gIs_cloud)
			{
				dojo.addClass(container,'vcard');
				{
					var identify = document.createElement('span');
					identify.className = "fn";
					identify.style.display = "none";
					identify.innerHTML = item.UserName;
					identify.title = "";
					container.appendChild(identify);
					//container.(identify,container.firstChild);
				}
				{
					var identify = document.createElement('span');
					identify.className = "x-lconn-userid";
					identify.style.display = "none";
					identify.innerHTML = item.UID;
					container.appendChild(identify);
					//container.insertBefore(identify,container.firstChild);
				}
				window.SemTagSvc.parseDom(null,container);
				setTimeout(function(){
					var node = container.getElementsByTagName("a")[0]; 
					if (node){
						dojo.attr(node,'tabindex', 0);
						dojo.connect(node, "focus", function(){
							dijit.Tooltip.show(node.title,node,["below"]);
					});
						dojo.connect(node, "blur", function(){
							dijit.Tooltip.hide(node);
						});						
					}
				}, 1000); 
				
				if (window.LCSemTagMenu && window.LCSemTagMenu.catchCtrlEnter)//SC javlin ISSUE...
					window.LCSemTagMenu.catchCtrlEnter =  function(event){
					};
			}
			else
			{
				dojo.addClass(container,'fn');
				dojo.addClass(container,'vcard');
				
				//var innerLink = document.createElement('a');
				container.href = "javascript:void(0);";
				
				var identify = document.createElement('span');
				identify.className = "x-lconn-userid";
				identify.style.display = "none";
				identify.innerHTML = item.UID;
				container.appendChild(identify);
			
				window.SemTagSvc.parseDom(null,container);
				item.icon.setBIZCardLabel(container.attributes['aria-label'].value);
			}
			return true;
		}
	}
});
