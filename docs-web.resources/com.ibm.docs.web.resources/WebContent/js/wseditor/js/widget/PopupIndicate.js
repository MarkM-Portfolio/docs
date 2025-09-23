/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.widget.PopupIndicate");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("websheet.widget.PopupIndicate", [dijit._Widget, dijit._Templated], {
	widgetsInTemplate: true,
	templateString: dojo.cache("websheet.templates", "PopupIndicate.html"),
	
	value: "",
	className: null,
	_isShowing: false,
	
	constructor: function(args)
	{
		this.editor = args.editor;
		this.value = args.value;
		this.className = args.className;
	},
	
	postCreate: function()
	{
		if(this.value != null)
			this.info.innerHTML = this.value;
		dojo.addClass(this.PopupNode, "popupIndicate");
		if(this.className != null)
			dojo.addClass(this.PopupNode, this.className);
	},
	
	addStyle: function(style, value)
	{
		dojo.style(this.PopupNode, style, value);
	},
	
	show: function(pos, value)
	{
		if(value != null) {
			if (BidiUtils.isBidiOn()) {
				this.info.dir = BidiUtils.getResolvedTextDir(value);
			}
			this.info.innerHTML = value;
		}
		dojo.style(this.PopupNode,"display", "");
		this._locate(pos);
		this._isShowing = true;
	},
	
	_locate: function(pos)
	{
		if(!pos) return; 
		var x = pos.x;
		var y = pos.y;
		var w = pos.w;
		var h = pos.h;
		
		var xPos = x;
		var yPos = y;
		
		var bHeight = concord.util.browser.getBrowserHeight();
		var bWidth = concord.util.browser.getBrowserWidth();
		
		var boxHeight = this.PopupNode.clientHeight;
		var boxWidth = dojo.style(this.PopupNode,"width");
		var scrollbarW = 25; //scrollbar width
		
		xPos += w/2 ; // w is the cell's width
		bWidth = bWidth - scrollbarW; // In sheet, minus the scrollbar's width  
		
		var arrowup = false; //by default
		var iconDx = 10; //revise value
		var iconDy = 10; //revise value
		var leftIconPos = (boxWidth / 2- iconDx) +"px";//by default, half of popup width 
		var left = xPos - boxWidth/2 - 5;
		
		if(left < 0) { // Part of the popup dialog is sheltered in the left of IBM Docs
			left = 0; //Try to show the whole popup dialog
			xPos -= this.editor.getRowHeaderWidth(); // To remove the row header's width
			left = this.editor.getRowHeaderWidth() + 1 ; 
			//5px is the distance from the right-top corner to the yellow triangle icon
			leftIconPos = (xPos - iconDx - 5) +"px" ;
		}else if(left < this.editor.getRowHeaderWidth()){
			left = this.editor.getRowHeaderWidth() + 1 ; 
			xPos -= this.editor.getRowHeaderWidth(); // To remove the row header's width
			leftIconPos = (xPos - iconDx - 5) +"px" ;			
		}
		
		if(xPos +  boxWidth/2 > bWidth){// Part of the popup dialog may be sheltered in the right of IBM Docs
			if(xPos > bWidth){	// Part of the cell may be sheltered in the right of IBM Docs		
				leftIconPos = (boxWidth - iconDx) +"px";	
			}else{
				leftIconPos = (boxWidth - bWidth + xPos -5) +"px";			
			}
			left = bWidth - boxWidth - iconDx + 1 ;
		}
		
		var isShown = true;
		
		var top = yPos- 412;
		if(top <60){  // 60px is about the height of banner
			arrowup = true;
			top = yPos +h + 5;
			if(top + boxHeight > bHeight){
				top = bHeight - boxHeight - iconDy;
				isShown = false;
			} 
		} else{
			top = yPos- boxHeight;
			if(dojo.isFF){				
				top += 5;
			}else if(dojo.isChrome || dojo.isSafari){
				top -= iconDy;
			}	
		}
		
		dojo.style(this.PopupNode,"left",left +"px");
		dojo.style(this.PopupNode,"top",top +"px");			
		
		this._locateArrow(arrowup, leftIconPos, isShown);
	},
	
	reLocate: function(pos)
	{
		if(pos){
			dojo.style(this.PopupNode,"display", "");
			this._locate(pos);
		}
		else
			this.hide();
	},
	
	isShow: function()
	{
		return this._isShowing;
	},
	
	close: function()
	{
		this.hide();
		this._isShowing = false;
	},
	
	hide: function()
	{
		dojo.style(this.PopupNode,"display", "none");
	},
	
	_locateArrow: function(arrowup, leftPos, isShown){
		dojo.attr(this.arrowNode,"src",contextPath + window.staticRootPath + '/images/blank.gif');
		dojo.removeAttr(this.arrowNode,"style");		
		dojo.removeAttr(this.allyArrowNode,"style");
		if(arrowup){
			dojo.removeClass(this.arrowNode,"arrowdown");
			dojo.addClass(this.arrowNode,"arrowup");
			dojo.style(this.arrowNode,"top","-7px");			
			this.allyArrowNode.innerHTML = "&#9650;";
			dojo.style(this.allyArrowNode,"top","-10px");
		}else{
			dojo.removeClass(this.arrowNode,"arrowup");
			dojo.addClass(this.arrowNode,"arrowdown");
			dojo.style(this.arrowNode,"bottom","-7px");			
			this.allyArrowNode.innerHTML = "&#9660;";
			dojo.style(this.allyArrowNode,"bottom","-10px");
			
			var top = dojo.style(this.PopupNode,"top");
			if(dojo.isFF){				
				top -= 13;
			}
			dojo.style(this.PopupNode,"top",top +"px");	
		}
		dojo.attr(this.arrowNode,'alt','');
		dojo.style(this.arrowNode,"left",leftPos);
		dojo.style(this.allyArrowNode,"left",leftPos);
		dojo.style(this.arrowNode,"display",isShown ? "block" :"none");
	}

});