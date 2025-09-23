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

dojo.provide("pres.editor.model.Paragraph");

dojo.declare("pres.editor.model.Paragraph", null, {

	strContent: "",
	// Store all spans
	spanList: null,
	id: null,
	
	
	//Styles===================================
	// Self properties
	indent: null, // unit is cmm = cm*1000
	marginLeft: null,//customized margin left unit is cmm = cm*1000
	marginRight: null,// unit is cmm = cm*1000
	
	fontSize: null,
	level: null,
	textAligment : null,//left/right/center
	direction : null,//ltr/rtl

	listType: null,//'bullet' or numbering type ,such as "A",'1','I'
	startNumber: null,
	listBeforeStyle : null,
	
	isHiddenList : null,//hidden invisible list
	
	// Temporary mode for store dom node view value
    //>>>>>>===================================
	marginTop: null,//just preserver for view
	marginBottom: null,//just preserver for view
	clsCustom : null, //used to store customized list class, 
	//We could store more than one list
	clsInLine :  null, //[] to store InLine class "IL_"
	clsInLineCS :  null, //[] to store InLine class "IL_CS_"
	clsPreserve : null,
	lineHeight: null,
	absLineHeight : null, 

	//Flags====================================
	renderDirty : null, //This flag is used to decide when this paragraph be re-render 
	spellingCheck : null,//[true]is doing spellCheck, [false]finished spellCheck, [null]not taking spellCheck
	
	//ODP special value==============
	odp_oldstylename : null,
	odp_oldlevel : null,

	constructor: function(){
		this.spanList = [];
		this.clsCustom = "";
		this.clsInLine = [];
		this.clsInLineCS = [];
		this.clsPreserve = [];

		this.listBeforeStyle = {
				color : null,
				fontSize : null,
				fontFamily : null,
				fontBold : null, //Bold,fontWeight
				fontItalic : null //Italic,fontStyle
		};
	},
	
	//Copy styles from other paragraph
	copyStyle : function(_para,keepListStyle,bNoInLineStyle)
	{
		this.indent = _para.indent; // unit is cmm = cm*1000
		this.marginLeft = _para.marginLeft;// unit is cmm = cm*1000
		this.marginRight = _para.marginRight;// unit is cmm = cm*1000
		
		this.marginTop = _para.marginTop;//just preserver for view
		this.marginBottom = _para.marginBottom;//just preserver for view
		
		this.fontSize = _para.fontSize;
		this.level = _para.level;
		this.textAligment = _para.textAligment;
		this.direction = _para.direction;
		if(!keepListStyle)
		{
			this.listType = _para.listType;
			this.startNumber = _para.startNumber;
			this.clsCustom = _para.clsCustom;
		}
		
		this.isHiddenList = _para.isHiddenList;		
		
		// Temporary mode for store dom node view value >>>>>>
		this.lineHeight = _para.lineHeight;

		if(!bNoInLineStyle)
		{
			this.clsInLine = dojo.clone(_para.clsInLine);
			this.clsInLineCS = dojo.clone(_para.clsInLineCS);
		}
		
		this.clsPreserve = dojo.clone(_para.clsPreserve);
		this.odp_oldstylename = _para.odp_oldstylename;
		this.odp_oldlevel = _para.odp_oldlevel;
		if(!keepListStyle)
		{
			this.listBeforeStyle.color = _para.listBeforeStyle.color;
			this.listBeforeStyle.fontSize = _para.listBeforeStyle.fontSize;
			this.listBeforeStyle.fontFamily = _para.listBeforeStyle.fontFamily;
			this.listBeforeStyle.fontBold = _para.listBeforeStyle.fontBold;
			this.listBeforeStyle.fontItalic = _para.listBeforeStyle.fontItalic;
		}
	},
	
	clone : function(_para)
	{
		this.strContent = _para.strContent;
		this.copyStyle(_para);
		this.spanList = [];
		for(var i=0;i<_para.spanList.length;i++)
		{
			var span = new pres.editor.model.Span();
			span.clone(_para.spanList[i]);
			this.spanList.push(span);
		}
	},
	
	clearInvalidSpan : function()
	{
		var newList = [];
		var contentCount = 0;
		var keepedSpan = null;
		for(var i = 0; i< this.spanList.length; i++)
		{
			var span = this.spanList[i];
			if(span.length == 0)
			{
				if(contentCount == 0)
				{
					keepedSpan = span;
				}
			}
			else if(span.bSoftBreak)
			{
				if(contentCount == 0 && keepedSpan)
				{
					newList.push(keepedSpan);
				}
				newList.push(span);
				contentCount = 0;
			}
			else
			{
				newList.push(span);
				contentCount ++ ;
			}
		}
		if(newList.length)
			this.spanList = newList;

	},
	
	fixBlankSpace : function()
	{
		//first 
		this.strContent = this.strContent.replace(/\xa0/gi,'\x20');
		
		if(this.strContent.length == 1 && this.strContent == " ")
			this.strContent = '\xa0';
		else
			this.strContent = this.strContent.replace(/\x20\x20/gi,'\x20\xa0');
		
	},
	
	_ApplyListBeforePreDefClass : function(listBeforeClass)
	{
		
		var value = listBeforeClass.substring(3,listBeforeClass.length);
		
		if(listBeforeClass.match(/^LS_/g))
		{
			//FontSize
			this.listBeforeStyle.fontSize = parseInt(value);
		}
		else if(listBeforeClass.match(/^LC_/g))
		{
			//FontColor
			this.listBeforeStyle.color = value;
		}
		else if(listBeforeClass.match(/^LF_/g))
		{
			//FontFamily
			this.listBeforeStyle.fontFamily = value;
		}
		else if(listBeforeClass.match(/^LB_/g))
		{//Bold
			if(value == 'TRUE')
			{
				this.listBeforeStyle.fontBold = true;
			}
			else
				this.listBeforeStyle.fontBold = false;
		}
		else if(listBeforeClass.match(/^LI_/g))
		{//Italic
			if(value == 'TRUE')
			{
				this.listBeforeStyle.fontItalic = true;
			}
			else
				this.listBeforeStyle.fontItalic = false;
		}
			
	},

	importClass : function(classStr,bInPlaceholder)
	{
		this.clsCustom = "";
		this.clsInLine = [];
		this.clsInLineCS = [];
		this.clsPreserve = [];
		
		var clsList = classStr.split(' ');
		for ( var j = 0 ; j < clsList.length; j++)
		{	
			if ( clsList[j].match(/^lst-/) 
					&& !clsList[j].match(/^lst-MR-/))
			{
				this.clsCustom = clsList[j];
			}
			else if (  clsList[j].match(/^ML_/)
					|| clsList[j].match(/^MP_/) 
					||clsList[j].match(/^MT_/))
			{
				
				if(bInPlaceholder)
				{
					//Do nothing
				}
				else
					this.clsPreserve.push(clsList[j]);
			}
			else if ( clsList[j].match(/^IL_/) 
					&& !clsList[j].match(/^IL_CS_/) )
			{
				this.clsInLine.push(clsList[j]);
			}
			else if ( clsList[j].match(/^IL_CS_/) )
			{
				this.clsInLineCS.push(clsList[j]);
			}
			else if ( clsList[j].match(/^LS_/) 
					|| clsList[j].match(/^LC_/)
					|| clsList[j].match(/^LF_/)
					|| clsList[j].match(/^LB_/)
					|| clsList[j].match(/^LI_/))
			{
				this._ApplyListBeforePreDefClass(clsList[j]);
			}		
			else 
			{
				this.clsPreserve.push(clsList[j]);
			}
			if( clsList[j] == 'sys-list-hidden')
			{
				this.isHiddenList = true;
			}
		}
	},
	
	insertText : function(offset, t)
	{
		this.strContent = (this.strContent.substring(0, offset) + t + this.strContent.substring(offset));
	},

	removeText : function(offset, length)
	{
		this.strContent = this.strContent.substring(0, offset) + this.strContent.substring(offset + length);
	},
	
	replaceText : function(offset, length, repStr)
	{
		this.strContent = this.strContent.substring(0, offset) + repStr + this.strContent.substring(offset + length);
	},

	getSpanText: function(spanIndex)
	{
		var textOffset = 0;
		var length = null;
		for ( var i = 0; i < this.spanList.length; i++)
		{
			var span = this.spanList[i];
			if (i == spanIndex)
			{
				length = span.length;
				break;
			}
			textOffset += span.length;
		}
		if (length == null)
			return null;
		var str = this.strContent.substring(textOffset, textOffset + length);
		return str;
	},
	
	//split Span according line text offset
	splitSpan : function(lineTextOffset)
	{
		var focusSpanInfo = this.getSpanByLineTextOffset(lineTextOffset);
		var newSpan = new pres.editor.model.Span();
		newSpan.copyStyle(focusSpanInfo.spanNode);
		newSpan.userId = focusSpanInfo.spanNode.userId;
		newSpan.length = focusSpanInfo.spanNode.length - focusSpanInfo.offset;
		focusSpanInfo.spanNode.length = focusSpanInfo.offset;
		this.insertSpan(focusSpanInfo.index+1,newSpan);
		return {
			preSpan : focusSpanInfo.spanNode,
			preIndex : focusSpanInfo.index,
			postSpan : newSpan,
			postIndex : focusSpanInfo.index + 1
		};
	},
	
	getFirstBROffset:function()
	{
		var textOffset = 0;
		for ( var i = 0; i < this.spanList.length; i++)
		{
			var span = this.spanList[i];
			if(span.bSoftBreak)
			{
				return textOffset;
			}
			textOffset +=  span.length;
		}
		return this.strContent.length;
	},

	//PostFirst = false
	//	if cursor at one span beginning : <XXX><|YYY>, 
	//	it will return the the previous span, and let be <XXX|><YYY>
	//	And return <XXX>
	//else PostFirst = true
	//	if cursor at one span beginning : <XXX|><YYY>, 
	//	it will return the the previous span, and let be <XXX><|YYY>
	//	And return <YYY>
	// So, for a range selection if we want get right span index, we should use it like this:
	//      startInfo = getSpanByLineTextOffset(startOffset,true);
	//      endInfo = getSpanByLineTextOffset(startOffset,false);
	// bNotIgnoreBR = true, means when cursor in br, we will return it, otherwise return the span nearby it
	getSpanByLineTextOffset: function(offset,bPostFirst,bNotIgnoreBR)
	{
		if( offset == null)
			return null;
				
		if (offset == 0)
			return {
				spanNode: this.spanList[0],
				index: 0,
				offset :0
			};
		var textOffset = 0;
		for ( var i = 0; i < this.spanList.length; i++)
		{
			var span = this.spanList[i];
			var curSpanOffset = textOffset + span.length;
			if (bPostFirst?
					(textOffset <= offset && offset < curSpanOffset)
					:(textOffset < offset && offset <= curSpanOffset))
			{
				if(span.bSoftBreak && !bNotIgnoreBR)
				{
					var postSpan = this.spanList[i+1];
					if(postSpan && !postSpan.bSoftBreak)
					{
						return {
							spanNode: postSpan,
							index: i+1,
							offset : 0//offset in span
						};
					}
				}
				
				return {
					spanNode: span,
					index: i,
					offset : offset - textOffset//offset in span
				};
			}
			textOffset = curSpanOffset;
		}
		return null;
	},
	
	getSelectionModel : function(startOffset,//text offset in line
			endOffset)//text offset in line
	{
		var startTxtOffset = (startOffset!=null)?startOffset:0;
		var endTxtOffset = (endOffset!=null)?endOffset:this.strContent.length;
		
		var para = new pres.editor.model.Paragraph();
		para.id = this.id;
		para.copyStyle(this);
		
		var startIndex = 0;
		var endIndex = -1;
		var startSpanTxtOffset = null;
		var endSpanTxtOffset = null;
		if(startOffset == null && endOffset == null)
		{
			para.strContent = this.strContent;
			startIndex = 0;
			endIndex = this.spanList.length-1;
		}
		else
		{
			para.strContent = this.strContent.substring(startTxtOffset,endTxtOffset);
			var startInfo = this.getSpanByLineTextOffset(startTxtOffset,true);
			var endInfo = this.getSpanByLineTextOffset(endTxtOffset,false);
			
			startIndex = startInfo.index;
			startSpanTxtOffset = startInfo.offset;
			endIndex = endInfo.index;
			endSpanTxtOffset = endInfo.offset;
		}

		for(var i=startIndex;i<=endIndex;i++)
		{
			var srcSpan = this.spanList[i];
			var span  = new pres.editor.model.Span();
			span.copyStyle(srcSpan);
			span.userId  =  srcSpan.userId;
			span.id  =  srcSpan.id;
			span.bSoftBreak  =  srcSpan.bSoftBreak;
			if(startIndex === endIndex && endSpanTxtOffset !== null && startSpanTxtOffset !== null)
			{
				span.length = endSpanTxtOffset - startSpanTxtOffset;
			}
			else if((i===startIndex) && (startSpanTxtOffset!=null))
			{
				span.length  =  srcSpan.length - startSpanTxtOffset;
			}
			else if((i===endIndex) && (endSpanTxtOffset!=null))
			{
				span.length  =  endSpanTxtOffset;
			}
			else
				span.length  =  srcSpan.length; 
			para.spanList.push(span);
		}


		return para;
	},
	
	//insert span just at the spanList[index] node, after insert, it at the "index"
	//if index == spanList.length, we insert at last, equal to .push()
	insertSpan : function(index, span)
	{
		if(index == this.spanList.length)
			this.spanList.push(span);
		else
			this.spanList.splice(index,0,span);
	},
	
	disableList : function()
	{
		if(!this.listType)
			return;
		this.listType = null;
		this.startNumber = null;
		this.clsCustom = '';
		this.clsInLine = [];
		this.clsInLineCS = [];
		this.odp_oldstylename = null;
		this.odp_oldlevel = null;
		this.id = EditorUtil.getUUID();
	},
	
	updateListBeforeDataFromSpan : function()
	{
		//this is enable action
		//we should update list before value
		//get first visible span
		var visibleSpan = this.spanList[0];
		for(var i=0;i<this.spanList.length;i++)
		{
			if(this.spanList[i].length>0 && !this.spanList[i].bSoftBreak)
			{
				visibleSpan = this.spanList[i];
				break;
			}
		}
		
		this.listBeforeStyle.color = null;
		if(visibleSpan.fontColor)
		{
			var color = EditorUtil.convertToHexColor(visibleSpan.fontColor);
			color = color.substring(1,color.length);
			color = color.toUpperCase();
			this.listBeforeStyle.color = color;
		}
			
		this.listBeforeStyle.fontSize = visibleSpan.fontSize;
		if (this.listType != 'bullet')
			this.listBeforeStyle.fontFamily = visibleSpan.fontName;
	},
	
	setCustomList : function(targetClass,bNumbering,bInPlaceHolder)
	{
		function _getNumberType( clsStr)
		{
			var type = clsStr;
			switch (clsStr) {
			case "lst-ur" : 
				type = "I";
				break;
			case "lst-lr" : 
				type="i";
				break;
			case "lst-uap" : 
			case "lst-ua" : 
				type = "A";
				break;
			case "lst-lap":
			case "lst-la" : 
				type = "a";
				break;
			case "lst-n":
			case "lst-n2":
			case "lst-np":
			case "lst-n arabic":
			case "lst-np arabic":
				type = "1";
				break;
			case "lst-j1":
				type = "ã‚¤ãƒ­ãƒ?ï¿?";
				break;
			case "lst-j2":
				type = "ã‚¢ã‚¤ã‚?ï¿?";
				break;
			};
			return type;		
		}
		
		if(!this.listType)
		{
			this.id = EditorUtil.getUUID();
		}
		
		if(bNumbering)
		{
			this.listType = _getNumberType(targetClass);
			this.startNumber = 1;
		}
		else
		{
			this.listType = 'bullet';
			this.startNumber = null;
			if(!this.indent && !this.marginLeft && !bInPlaceHolder)
			{
				this.indent = -793;
				this.marginLeft = 793;
			}
		}
		this.updateListBeforeDataFromSpan();
		
		this.clsCustom = targetClass;
		this.odp_oldstylename = null;
		this.odp_oldlevel = null;
	},
	
	indentList : function(isIndent,targetPara,bInPlaceHolder)
	{
		var newLevel=this.level+(isIndent?1:-1);
		if(newLevel<=0)
			newLevel = 1;
		if(newLevel>=9)
			newLevel = 9;
		if(newLevel == this.level)
			return;
		
		this.level = newLevel;
		this.lastIndentTargetPara = null;
		if(targetPara)
		{
			var keepListStyle = true;

			if((this.listType && this.listType != 'bullet')
					&&
				(targetPara.listType && targetPara.listType != 'bullet'))
			{
				keepListStyle = false;
			}
			
			this.copyStyle(targetPara,keepListStyle,true);
			this.lastIndentTargetPara = targetPara;

		}
		else
		{
			if(this.marginLeft!=null)
				this.marginLeft = 1270*(isIndent?1:-1)+this.marginLeft;//1.27 cm for each indent/outdent
			if(this.marginRight!=null)
				this.marginRight = 1270*(isIndent?1:-1)+this.marginRight;
			
			if(bInPlaceHolder)
			{
				this.listBeforeStyle.fontSize = null;//means we need get size from visible text
			}
			
		}
		
		if(!bInPlaceHolder)
		{
			this.odp_oldstylename = null;
			this.odp_oldlevel = null;
		}
		
		this.listBeforeStyle.fontSize = null;
		this.renderDirty = true;
	},
	
	setSpanLineSpaceValue:function(lineSpaceValue)
	{
		for(var i=0;i<this.spanList.length;i++)
		{
			this.spanList[i].setStyle("lineHeight",lineSpaceValue);
		}
		//	this.renderDirty = true;
	},
	
	setTextStyle : function(startOffset,//text offset in line
			endOffset,//text offset in line
			styleName, //such as "font_name","font_color"
			styleValue) //such as "calibri","color:#FFEEDD"
	{

		var startIndex = (startOffset!=null)?this.splitSpan(startOffset).postIndex:0;
		var endIndex = (endOffset!=null)?this.splitSpan(endOffset).preIndex:(this.spanList.length-1);
				
		for(var i= startIndex;i<=endIndex;i++)
		{
			this.spanList[i].setStyle(styleName,styleValue);
		}
		
		//Set the first span style
		if(((startOffset == 0) || (startOffset == null)) && (this.listType))
		{
			var c = pres.constants;
			if((styleName == c.CMD_FONT_NAME)&& (this.listType != 'bullet'))
			{
				var value = styleValue.toLowerCase();
				value = value.toLowerCase();
				value = value.replace(/ /gi,'_');
				this.listBeforeStyle.fontFamily = value;
			}
			else if(styleName == c.CMD_FONT_SIZE)
			{
				this.listBeforeStyle.fontSize = parseInt(styleValue);
			}
			else if(styleName == c.CMD_FONT_SIZE_INCREASE || styleName == c.CMD_FONT_SIZE_DECREASE)
			{
				//Need update fontsize from view first span
				this.listBeforeStyle.fontSize = null;
			}
			else if(styleName == c.CMD_BOLD)
			{
				this.listBeforeStyle.fontBold = styleValue;
			}
			else if(styleName == c.CMD_ITALIC)
			{
				this.listBeforeStyle.fontItalic = styleValue;
			}
			else if(styleName == c.CMD_FONT_COLOR)
			{
				var color = EditorUtil.convertToHexColor(styleValue);
				color = color.substring(1,color.length);
				color = color.toUpperCase();
				this.listBeforeStyle.color = color;
			}
		}

		this.renderDirty = true;
	},

	setTextStyleForAll : function(
			styleName, //such as "font_name","font_color"
			styleValue) //such as "calibri","color:#FFEEDD"
	{
		var endIndex = this.spanList.length;
		for(var i=0;i<endIndex;i++)
		{
			this.spanList[i].setStyle(styleName,styleValue);
		}
		//Set the first span style
		if(this.listType)
		{
			var c = pres.constants;
//			if((styleName == c.CMD_FONT_NAME)&& (this.listType != 'bullet'))
//			{
//				var value = styleValue.toLowerCase();
//				value = value.toLowerCase();
//				value = value.replace(/ /gi,'_');
//				this.listBeforeStyle.fontFamily = value;
//			}
			if(styleName == c.CMD_FONT_SIZE)
			{
				this.listBeforeStyle.fontSize = parseInt(styleValue);
			}
			else if(styleName == c.CMD_BOLD)
			{
				this.listBeforeStyle.fontBold = styleValue;
			}
			else if(styleName == c.CMD_ITALIC)
			{
				this.listBeforeStyle.fontItalic = styleValue;
			}
			else if(styleName == c.CMD_FONT_COLOR)
			{
				var color = EditorUtil.convertToHexColor(styleValue);
				color = color.substring(1,color.length);
				color = color.toUpperCase();
				this.listBeforeStyle.color = color;
			}
		}
		this.renderDirty = true;
	},

	mergeHyperLink : function(hyperLinkMap)
	{
		function _findNeighbourVisibleSpan(bForward,index,list)
		{
			for(var i=index + (bForward?-1:1);
			(bForward?(i>=0):(i<list.length));
			i += (bForward?-1:1))
			{
				var span = list[i];
				if(!span)
					return null;
				if(span.bSoftBreak)
					return null;
				if(span.length)
					return span;
			}
			return null;
		}
		
		function _getHashHyperLinkID(_span)
		{
			var mapNode = hyperLinkMap[_span.hyperLinkId];
			if(mapNode)
			{
				var url = EditorUtil.getAttribute(mapNode,"href");
				if(!url)
					url = EditorUtil.getAttribute(mapNode,"xlink_href");
				if(!url)
					url="";
				url = url.toLowerCase();
				return EditorUtil.getStrHashCode(url);
			}
			return null;
		}
		
		for(var i= 1;i<this.spanList.length;i++)
		{
			var span = this.spanList[i];
			var preSpan = _findNeighbourVisibleSpan(true,i,this.spanList);
			if(preSpan)
			{
				var selfID = _getHashHyperLinkID(span);
				var preID = _getHashHyperLinkID(preSpan);
				if(selfID === preID)
				{
					span.hyperLinkId = preSpan.hyperLinkId;
				}
			}
		}
	},
	
	clearSpellCheck : function()
	{
		var re = false;
		for(var i= 0;i<this.spanList.length;i++)
		{
			re = this.spanList[i].clearSpellCheck() || re;
		}
		if(re)
			this.renderDirty = true;
	},
	
	//Spell Check =================================================
	doSpellCheck : function()
	{
		this.spellingCheck = true;
		this._enableSpellCheck = true;
		this.clearSpellCheck();
		var strCheck = this.strContent.replace(/\xa0/gi,'\x20');
		pres.spellCheckService.checkText(strCheck
				,3 // numbering of suggestions
				,dojo.hitch(this, function(item){
					this._spellCheckCallback(item);
					})
				);
	},
	
	stopSpellCheck : function()
	{
		this._enableSpellCheck = false;
	},
	
	isSpellCheckComplete : function()
	{
		return this.spellingCheck == false;
	},

	_spellCheckCallback:function(item)
	{
		this.spellingCheck = false;
		if(!this._enableSpellCheck)
			return;
		try{
			for(var i=0;i<item.length;i++)
			{
				var u = item[i];
				//u.start
				//u.end
				//u.word
				//u.suggestions
				this.setTextStyle(u.start, u.end, "misspell", u);
			}
			this.clearInvalidSpan();
			this.renderDirty = (item.length>0) || this.renderDirty;
		}
		catch(e)
		{
		}
	},
	
	//if lineOffset == null means replace all
	replaceWithSuggestion: function(sugg, wrongWordCurOffset, allWorngWord)
	{
		function _replaceOneWord(wordSpanIndex,para,wrongWord)
		{
			var startSpan = null;
			var startIndex = -1;
			var endIndex = -1;
			
			//find the start span
			for(var i=wordSpanIndex;i>=0;i--)
			{
				var span = para.spanList[i];
				if(span.misspell == wrongWord)
				{
					startSpan = span;
					startIndex = i;
				}
				else
					break;
			}
			
			if(startIndex == -1)
				return {
				re : false,
				txtOffset : -1};
			
			//find the end span
			for(var i=startIndex;i<para.spanList.length;i++)
			{
				var span = para.spanList[i];
				if(span.misspell == wrongWord)
				{
					endIndex = i;
				}
				else
					break;
			}
			
			if(endIndex == -1)
				return {
					re : false,
					txtOffset : -1};
			
			var wrongWordStartOffset = 0;
			for(var i=0;i<startIndex;i++)
			{
				wrongWordStartOffset += para.spanList[i].length;
			}

			para.replaceText(wrongWordStartOffset,wrongWord.length,sugg);
			
			startSpan.misspell = null;
			startSpan.spellSuggestions = null;
			startSpan.length = sugg.length;
			
			//remove other spans in the same word
			para.spanList.splice(startIndex+1,endIndex - startIndex);
			return {
				re : true,
				txtOffset : wrongWordStartOffset+startSpan.length};
		}
		

		if(allWorngWord)
		{
			var replaced = false;
			//find the error span
			for(var i=0;i<this.spanList.length;i++)
			{
				var span = this.spanList[i];
				if(span.misspell == allWorngWord)
				{
					var result = _replaceOneWord(i,this,allWorngWord);
					if(result.re)
					{
						i=0;
						replaced = true;
					}
				}
			}
			this.renderDirty = this.renderDirty || replaced;
			return replaced;
		}
		else
		{
			var startSpanInfo = this.getSpanByLineTextOffset(wrongWordCurOffset);
			if (!startSpanInfo)
				return false;
			var fSpan  = startSpanInfo.spanNode;
			if(dojo.isSafari)
			{
				var sugContain = false;
				if(fSpan.spellSuggestions)
				{
					for(var i=0;i<fSpan.spellSuggestions.length;i++)
					{
						if(fSpan.spellSuggestions[i] == sugg)
						{
							sugContain = true;
							break;
						}
					}
				}
				
				if(!sugContain && (fSpan.length == startSpanInfo.offset))
				{
					var tSpanInfo = this.getSpanByLineTextOffset(wrongWordCurOffset+1);
					if (tSpanInfo)
					{
						startSpanInfo = tSpanInfo;
					}
				}
			}			
			
			var wrongWord = startSpanInfo.spanNode.misspell;
			
			var result = _replaceOneWord(startSpanInfo.index,this,wrongWord);
			this.renderDirty = true;
			return result;
		}
	}
});
