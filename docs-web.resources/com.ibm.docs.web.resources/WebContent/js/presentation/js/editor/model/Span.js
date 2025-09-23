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

dojo.provide("pres.editor.model.Span");
dojo.require("pres.utils.fontSizeUtil");

dojo.declare("pres.editor.model.Span", null, {

	userId : null,//To hold indicator information
	bSoftBreak : false,//if the span is soft break, it should has length = 1
	length : null, //the length of this span
	
	fontSize : null,
	//To store the visible fontsize while building model, we should not change it
	//And this value only works when fontSize == null
	viewfontSize : null,
	textShadow : null,
	fontName : null,
	fontBold : null,
	fontItalic : null,
	fontUnderLine : null,
	fontColor : null,
	fontStrikeThrough : null,//true or false/null
	fontSuperSubScript : null,//"super","sub","baseline" null= no style
	upperLowerCase : null, //true=upper, false=lower, null no style
	
	misspell:null,//value is the wrong word
	spellSuggestions:null,//suggestion right word
	clsPreserve : null, //store unsupport classes
	hyperLinkId : null,	//store hyperlink node id in content map
	//Temporary mode for store dom node view value >>>>>
	lineHeight : null,
	//<<<<<
	
	constructor: function()
	{
		this.clsPreserve = [];
		this.length = 0;
	},
	
	//Copy style from another span
	copyStyle : function(_SrcSpan,bMerge)
	{
		this.userId = 				(!bMerge||(bMerge&&(this.userId == null)))?_SrcSpan.userId:this.userId;
		this.fontSize = 			(!bMerge||(bMerge&&(this.fontSize == null)))?_SrcSpan.fontSize:this.fontSize;
		this.viewfontSize = 		(!bMerge||(bMerge&&(this.viewfontSize == null)))?_SrcSpan.viewfontSize:this.viewfontSize;
		this.textShadow = 			(!bMerge||(bMerge&&(this.textShadow == null)))?_SrcSpan.textShadow:this.textShadow;		
		this.lineHeight = 			(!bMerge||(bMerge&&(this.lineHeight == null)))?_SrcSpan.lineHeight:this.lineHeight;
		this.fontName =  			(!bMerge||(bMerge&&(this.fontName == null)))?_SrcSpan.fontName:this.fontName;
		this.fontBold =  			(!bMerge||(bMerge&&(this.fontBold == null)))?_SrcSpan.fontBold:this.fontBold;
		this.fontItalic =  			(!bMerge||(bMerge&&(this.fontItalic == null)))?_SrcSpan.fontItalic:this.fontItalic;
		this.fontUnderLine =  		(!bMerge||(bMerge&&(this.fontUnderLine == null)))?_SrcSpan.fontUnderLine:this.fontUnderLine;
		this.fontColor = 			(!bMerge||(bMerge&&(this.fontColor == null)))?_SrcSpan.fontColor:this.fontColor;
		this.clsPreserve = 			(!bMerge||(bMerge&&(this.clsPreserve == null)))?dojo.clone(_SrcSpan.clsPreserve):this.clsPreserve;
		this.fontStrikeThrough =  	(!bMerge||(bMerge&&(this.fontStrikeThrough == null)))?_SrcSpan.fontStrikeThrough:this.fontStrikeThrough;
		this.fontSuperSubScript =  	(!bMerge||(bMerge&&(this.fontSuperSubScript == null)))?_SrcSpan.fontSuperSubScript:this.fontSuperSubScript;
		this.upperLowerCase =  		(!bMerge||(bMerge&&(this.upperLowerCase == null)))?_SrcSpan.upperLowerCase:this.upperLowerCase;
		this.hyperLinkId = 			(!bMerge||(bMerge&&(this.hyperLinkId == null)))?_SrcSpan.hyperLinkId:this.hyperLinkId;
		this.misspell = 			(!bMerge||(bMerge&&(this.misspell == null)))?_SrcSpan.misspell:this.misspell;
		this.spellSuggestions = 	(!bMerge||(bMerge&&(this.spellSuggestions == null)))?dojo.clone(_SrcSpan.spellSuggestions):this.spellSuggestions;
	},
	
	clone : function(_SrcSpan)
	{
		this.bSoftBreak = _SrcSpan.bSoftBreak;//if the span is soft break, it should has length = 1
		this.length = _SrcSpan.length; //the length of this span
		this.copyStyle(_SrcSpan);
	},
	
	isEqualWithoutContent : function(_SrcSpan)
	{
		 function compareStr(a,b){
			 if ( a < b )
			 return 1;
			 if ( a > b )
			 return -1;
			 return 0; // a == b
		}
		 
		 this.clsPreserve.sort(compareStr);
		 _SrcSpan.clsPreserve.sort(compareStr);
		
		return (
			(this.userId === _SrcSpan.userId)&&
			(this.bSoftBreak === _SrcSpan.bSoftBreak)&&		
			(this.textShadow === _SrcSpan.textShadow)&&		
			(this.fontSize === _SrcSpan.fontSize)&&	
			(this.fontName === _SrcSpan.fontName)&&
			(this.fontBold === _SrcSpan.fontBold)&&
			(this.fontItalic === _SrcSpan.fontItalic)&&
			(this.fontUnderLine === _SrcSpan.fontUnderLine)&&
			(this.fontColor === _SrcSpan.fontColor)&&
			(this.clsPreserve.toString() === _SrcSpan.clsPreserve.toString())&&
			(this.lineHeight === _SrcSpan.lineHeight)&&
			(this.fontStrikeThrough === _SrcSpan.fontStrikeThrough)&&
			(this.fontSuperSubScript === _SrcSpan.fontSuperSubScript)&&
			(this.upperLowerCase === _SrcSpan.upperLowerCase)&&
			(this.hyperLinkId === _SrcSpan.hyperLinkId)
		);
	},
	
	importClass : function(classStr)
	{
		this.clsPreserve = [];
		var clsList = classStr.split(' ');
		for ( var j = 0 ; j < clsList.length; j++)
		{	
			if ( clsList[j].match(/^CSS_/))
			{
				//do nothing
			}
			else
				this.clsPreserve.push(clsList[j]);
		}
	},
	
	setStyle : function(styleName,styleValue)
	{
		var c = pres.constants;
		if(styleName == c.CMD_FONT_NAME)
		{
			this.fontName = styleValue;
		}
		else if(styleName == c.CMD_FONT_SIZE)
		{
			this.fontSize = parseFloat(styleValue);
		}
		else if(styleName == c.CMD_BOLD)
		{
			this.fontBold = styleValue;
		}
		else if(styleName == c.CMD_ITALIC)
		{
			this.fontItalic = styleValue;
		}
		else if(styleName == c.CMD_UNDERLINE)
		{
			this.fontUnderLine = styleValue;
		}
		else if(styleName == c.CMD_FONT_COLOR)
		{
			this.fontColor = styleValue;
		}
		else if(styleName == c.CMD_FONT_SIZE_INCREASE)
		{
			if(this.fontSize == null)
			{
				this.fontSize = this.viewfontSize;
				this.viewfontSize = null;
			}
			
			this.fontSize = pres.utils.fontSizeUtil.getNext(this.fontSize);
		}
		else if(styleName == c.CMD_FONT_SIZE_DECREASE)
		{
			if(this.fontSize == null)
			{
				this.fontSize = this.viewfontSize;
				this.viewfontSize = null;
			}
			this.fontSize = pres.utils.fontSizeUtil.getPrev(this.fontSize);
		}
		else if(styleName == c.CMD_STRIKETHROUGH)
		{
			this.fontStrikeThrough = styleValue;
		}
		else if(styleName == c.CMD_SUPERSCRIPT)
		{
			if (styleValue) {
				this.fontSuperSubScript = "super";
			} else {
				this.fontSuperSubScript = "baseline";
			}
		}
		else if(styleName == c.CMD_SUBSCRIPT)
		{
			if (styleValue) {
				this.fontSuperSubScript = "sub";
			} else {
				this.fontSuperSubScript = "baseline";
			}
		}
		else if(styleName == "misspell")
		{
			this.misspell = styleValue.word;
			this.spellSuggestions = styleValue.suggestions;
		}
		else if(styleName == "hyperlinkid")
		{
			this.hyperLinkId = styleValue;
		}else if (styleName == "lineHeight")
		{
			this.lineHeight= styleValue;
		}
	},
	
	clearSpellCheck : function()
	{
		var old = this.misspell;
		this.misspell = null;
		this.spellSuggestions = null;
		return !(old == this.misspell);
	}
	
	
});
