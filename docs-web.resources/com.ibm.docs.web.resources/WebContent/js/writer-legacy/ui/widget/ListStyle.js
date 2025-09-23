﻿dojo.provide("writer.ui.widget.ListStyle");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("writer","lang");
dojo.requireLocalization("concord.widgets","menubar");
dojo.declare("writer.ui.widget.ListStyle", [ dijit._Widget, dijit._Templated ],
{
	templates:{
		liststyle:{
			templateString:'<div class="hello_class"><table role ="presentation" cellspacing="0" cellpadding="0"><thead></thead><tbody><tr><td class="leftMost topMost"><ul class="circle" dojoAttachEvent="onmouseover:onMouseOver,onmouseout:onMouseOut"><li><span></span></li><li><span></span></li><li><span></span></li><li><span></span></li></ul></td><td class="topMost"><ul class="square" dojoAttachEvent="onmouseover:onMouseOver,onmouseout:onMouseOut"><li><span></span></li><li><span></span></li><li><span></span></li><li><span></span></li></ul></td></tr><tr><td class="leftMost"><ul class="upper-roman" dojoAttachEvent="onmouseover:onMouseOver,onmouseout:onMouseOut"><li><span></span></li><li><span></span></li><li><span></span></li><li><span></span></li></ul></td><td><ul class="lower-alpha" dojoAttachEvent="onmouseover:onMouseOver,onmouseout:onMouseOut"><li><span></span></li><li><span></span></li><li><span></span></li><li><span></span></li></ul></td></tr><tr><td class="leftMost"><ul class="lower-alpha" dojoAttachEvent="onmouseover:onMouseOver,onmouseout:onMouseOut"><li><span></span></li><li><span></span></li><li><span></span></li><li><span></span></li></ul></td><td><ul class="lower-alpha" dojoAttachEvent="onmouseover:onMouseOver,onmouseout:onMouseOut"><li><span></span></li><li><span></span></li><li><span></span></li><li><span></span></li></ul></td></tr></tbody></table><div></div></div>'
		},
		bulletList:{
			templateString:'<div class="hello_class" data-dojo-attach-point="containerNode"><table role ="presentation" cellspacing="0" cellpadding="0" class="bulletList"><tbody><tr><td id="bullet_0" class="leftMost topMost"><p style="margin:0px; padding:0px;text-align: center;font-size: 9pt;">None</p></td><td id="bullet_1" class="topMost"><p><span>&#8226;</span></p></td><td id="bullet_2" class="topMost" > <p><span>&#9830;</span></p></td></tr><tr><td id="bullet_3" class="leftMost"><p><span >■</span></p></td><td id="bullet_4"><p><span > &#43;</span></p></td><td id="bullet_5"><p><span style="font-family:wingdings;">\uF076</span></p></td></tr><tr><td id="bullet_6" class="leftMost"><p><span>►</span></p></td><td id="bullet_7"><p><span >✔</span></p></td><td id="bullet_8"><p><span>➔</span></p></td></tr></tbody></table></div>'
		},
		numberList:{
			templateString:' <div class="hello_class" data-dojo-attach-point="containerNode"><table role ="presentation" cellspacing="0" cellpadding="0"><tbody><tr><td id="numbering_0" class="leftMost topMost" ><p><span>None</span></p></td><td id="numbering_1" class="topMost"><ul ><li>A.<span></span></li><li>B.<span></span></li><li>C.<span></span></li></ul></td><td id="numbering_2" class="topMost"><ul class="upper-alpha"><li>a.<span></span></li><li>b.<span></span></li><li>c.<span></span></li></ul></td></tr><tr><td id="numbering_3" class="leftMost"><ul><li>a)<span></span></li><li>b)<span></span></li><li>c)<span></span></li></ul></td><td id="numbering_4" ><ul><li>1.<span></span></li><li>2.<span></span></li><li>3.<span></span></li></ul></td><td id="numbering_5" ><ul ><li>1)<span></span></li><li>2)<span></span></li><li>3)<span></span></li></ul></td></tr><tr><td id="numbering_6" class="leftMost"><ul><li>1b<span></span></li><li>2b<span></span></li><li>3b<span></span></li></ul></td><td id="numbering_7" ><ul><li>I.<span></span></li><li>II.<span></span></li><li>III.<span></span></li></ul></td><td id="numbering_8" ><ul><li>i.<span></span></li><li>ii.<span></span></li><li>iii.<span></span></li></ul></td></tr></tbody></table></div>'
		},
		multilevelList:{
			templateString:' <div class="hello_class" data-dojo-attach-point="containerNode"><table role ="presentation" cellspacing="0" cellpadding="0"><tbody><tr><td id="multiLevel_0" class="leftMost topMost" ><p><span>None</span></p></td><td  id="multiLevel_1" class="topMost"><ul class="upper-alpha"><li><span class="single-line">1<span></span></span><ul class="indent-first"><li><span class="single-line">1.1<span></span></span><ul class="indent-second"><li><span class="single-line">1.1.1<span></span></span></li></ul></li></ul></li></ul></td><td  id="multiLevel_2" class="topMost"><ul class="upper-alpha noindent-fix"><li><span class="single-line">1.<span></span></span><span class="single-line">1.1.<span></span></span><span class="single-line  noindent-fix">1.1.1.<span></span></span></li></ul></td></tr><tr><td id="multiLevel_3" class="leftMost"><ul class="lower-roman" ><li><span class="single-line">I.<span></span></span><ul class="indent-first"><li><span class="single-line">A.<span></span></span><ul class="indent-second"><li><span class="single-line">1.<span></span></span></li></ul></li></ul></li></ul></td><td id="multiLevel_4"><ul class="upper-roman"><li><span class="single-line">I. ${heading1}<span></span></span><ul class="indent-first"><li><span class="single-line">A. ${heading2}<span></span></span><ul class="indent-second"><li><span class="single-line">1. ${heading3}<span></span></span></li></ul></li></ul></li></ul></td><td id="multiLevel_5"><ul class="decimal noindent-fix"><li><span class="single-line">1 ${heading1}<span></span></span><span class="single-line">1.1 ${heading2}<span></span></span><span class="single-line">1.1.1 ${heading3}<span></span></span></li></ul></td></tr></tbody></table></div> '
		}
	},
	type : "liststyle",
	templateString:'',
	cells:null,
	focusIndex:0,
	focusNode:null,
	containerNode:null,
	defaultTimeout: 500,
	timeoutChangeRate: 0.90,
	tabIndex:"0",
	listMap : {"bullet":['none','circle','diamond','square','plus','fourDiamond','rightArrow','checkMark','thinArrow'],"numbering":['none','upperLetter','lowerLetter','lowerLetterParenthesis','decimal','decimalParenthesis','decimalB','upperRoman','lowerRoman'],"multiLevel":['none','mulNum1','mulNum2','upperRoman','romanHeading','numHeading']},
	defaultNumberingsIndex:{ 
		    "none"	: 0,
			"upperLetter" 		: 1,
            "lowerLetter" 	: 2,
            "lowerLetterParenthesis" 	: 3,
            "decimal"	: 4,
            "decimalParenthesis" : 5,
            "decimalB" 	: 6,
            "upperRoman" 	: 7,
            "lowerRoman" 	: 8 
	},
	defaultBulletsIndex:{ 
		 "none"	: 0,			
         "circle" 		: 1,
         "diamond" 		: 2,
         "square" 		: 3,
         "plus" 		: 4,
         "fourDiamond"	: 5,
         "rightArrow" 	: 6,
         "checkMark" 	: 7,
         "thinArrow" 	: 8
	},
	getIndex: function(type, isNumbering){
		if(isNumbering)
			return this.defaultNumberingsIndex[type];
		else
			return this.defaultBulletsIndex[type];
	},
	constructor:function(){
	},
	postMixInProperties:function(){
		var nls = dojo.i18n.getLocalization("writer","lang");
		var noneStr = nls.list_none;
		this.templateString = this.templates[this.type].templateString.replace("None",noneStr);
		var menuNls = dojo.i18n.getLocalization("concord.widgets","menubar");
		this.heading1 = menuNls.formatMenu_Heading1;
		this.heading2 = menuNls.formatMenu_Heading2;
		this.heading3 = menuNls.formatMenu_Heading3;
	},
	buildRendering:function(){
		this.inherited(arguments);
	},
	postCreate:function(){
		this.inherited(arguments);
		if(!this.containerNode) return;
		this.cells = dojo.query("td",this.containerNode)
						.onmouseover(dojo.hitch(this,this.onMouseOver))
						.onmouseout(dojo.hitch(this,this.onMouseOut))
						.onclick(dojo.hitch(this,this.onClick));
		
		var keyIncrementMap = {
				UP_ARROW: -3,
				// The down key the index is increase by the x dimension.
				DOWN_ARROW: 3,
				// Right and left move the index by 1.
				RIGHT_ARROW: this.isLeftToRight() ? 1 : -1,
				LEFT_ARROW: this.isLeftToRight() ? -1 : 1
			};
		
		dojo.connect(this.containerNode,"onkeypress",this,function(evt){
			var keys = dojo.keys;
			if(evt.charCode == keys.ESCAPE || evt.keyCode == keys.ESCAPE || evt.charCode == keys.TAB || evt.keyCode == keys.TAB)
				return;
				
			var navKey=false;
			for(var key in keyIncrementMap){
				var charOrCode = keys[key];
				if(charOrCode==evt.charCode||charOrCode==evt.keyCode){
					var increment = keyIncrementMap[key];
					this._navigateByKey(increment);
					navKey=true;
					break;
				}
			}
			if(!navKey){
				if(evt.charCode==keys.SPACE || evt.keyCode==keys.SPACE || evt.charCode==keys.ENTER || evt.keyCode==keys.ENTER){
					//press space, enter
					this.changeList();
				}
			}
			
			dojo.stopEvent(evt);
		});
		this._setCurrent(this.cells[0]);
	},
	_navigateByKey:function(increment){
		if(!increment) return;
		var newIndex = this.focusIndex+increment;
		if(newIndex<0||newIndex>=this.cells.length) return ;

		this._setCurrent(this.cells[newIndex]);
		setTimeout(dojo.hitch(this,"focus"),0);
		this.focusIndex=newIndex;
	},
	_setCurrent:function(node){
		this.focusNode && this.changeStyle(this.focusNode,true);		
		this.focusNode=node;
		this.changeStyle(this.focusNode, false);
		if(node)
			dojo.attr(node,"tabIndex",this.tabIndex);
		this.announceSelection();
	},
	focus: function(){
		dijit.focus(this.focusNode);		
	},
	announceSelection: function(){
		var targetNode = this.focusNode;	
		if(targetNode){
			var ids = targetNode.id.split('_');
			var style = this.listMap[ids[0]][ids[1]];
			pe.lotusEditor && pe.lotusEditor.getShell()._editWindow.announce(style);
		}
	},
	onOpen:function(){
		this.inherited(arguments);
		if(BidiUtils.isBidiOn()) {
			if(dijit.byId("D_t_Direction").iconClass == "cke_button_bidirtl" && (this.type=="numberList"||this.type=="multilevelList"))
				dojo.addClass(this.domNode, 'rtl');
			else
				dojo.removeClass(this.domNode, 'rtl');
		}
		if(this.type == "multilevelList")
		{
			var romanOutline = this.cells[this.cells.length - 2];
			var numOutline = this.cells[this.cells.length - 1];
			
			if(pe.lotusEditor.isContentEditing())
			{
				dojo.removeClass(romanOutline, 'DisabledItem');
				dojo.removeClass(numOutline, 'DisabledItem');
			}
			else
			{
				// Disable heading outline item
				dojo.addClass(romanOutline, 'DisabledItem');
				dojo.addClass(numOutline, 'DisabledItem');
			}	
			this.announceSelection();
		}	
	},
	onMouseOver : function(evt) {
		this.changeStyle(evt.target, false);
	},
	onMouseOut : function(evt) {
		this.changeStyle(evt.target, true);
	},
	onChange: function(/*===== value =====*/){
		// summary:
		//		Callback when a cell is selected.
		// value: String
		//		Value corresponding to cell.
	},
	changeList: function(){
		var targetNode = this.focusNode;
		var ids = targetNode.id.split('_');
		this.focusIndex= parseInt( ids[1] );
		var style = this.listMap[ids[0]][ids[1]];
		
		if(this.type == "multilevelList" && !pe.lotusEditor.isContentEditing())
		{
			if( dojo.hasClass(targetNode, "DisabledItem") )
				return;
//			if(style == "romanHeading" || style == "numHeading")
//				return;
		}
		
		this.onChange();
		
		
		// TODO ugly method to record the click type.
		// Use a event to notify is better.
		pe.lotusEditor["default"+ids[0]] = style;
		
		pe.lotusEditor.execCommand(ids[0],{"numbering":style, "onOff":false});
	},
	
	onClick : function(evt) {
		var targetNode = this.getTargetNode(evt.target);
		this._setCurrent(targetNode);
		
		this.changeList();
	},
	changeStyle : function(node, isRemove) {
		var target = this.getTargetNode(node), 
			helperLeft = this.getHelperNodeLeft(target), 
			helperTop = this.getHelperNodeTop(target);
		if (isRemove) {
			dojo.removeClass(target, 'ItemHover');
			if (helperLeft) dojo.removeClass(helperLeft, 'ItemHoverHelperLeft');
			else dojo.removeClass(target, 'ItemHoverLeft');
			if (helperTop) dojo.removeClass(helperTop, 'ItemHoverHelperTop');
			else dojo.removeClass(target, 'ItemHoverTop');
		} else {
			dojo.addClass(target, 'ItemHover');
			if (helperLeft) dojo.addClass(helperLeft, 'ItemHoverHelperLeft');
			else dojo.addClass(target, 'ItemHoverLeft');
			if (helperTop) dojo.addClass(helperTop, 'ItemHoverHelperTop');
			else dojo.addClass(target, 'ItemHoverTop');
		}
	},
	getTargetNode : function(n/* node the mouse over on */) {
		while (n && "TD" !== n.tagName.toUpperCase()) {
			n = n && n.parentNode;
		}
		return n;
	},
	getHelperNodeLeft : function(target/* target td element */) {
		if (!target) return null;
		var prevTd = target.previousSibling;
		if (prevTd)
			return prevTd;
		else
			return null;
	},
	getHelperNodeTop : function(target/* target td element */) {
		if (!target)
			return null;
		var tmp = target, idx = 0;
		while (tmp.previousSibling) {
			tmp = tmp.previousSibling;
			idx++;
		}
		var prevTr = tmp.parentNode.previousSibling;
		/* not the first row of the table */
		if (prevTr) {
			return prevTr.children[idx];
		} else
			return null;
	}
});