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

dojo.provide("pres.editor.EditorUtilList");

/*
 * This utility provide List operations Including : Enable/disable list Indent/outdent list Change Bullet style
 */

dojo.declare("pres.editor.EditorUtilList", null, {
	STYLES:
	{
		FONTSIZE: "fontSize",
		FONTNAME: "fontFamily",
		BOLD: "fontWeight",
		ITALIC: "fontStyle",
		UNDERLINE: "textDecoration",
		LINETHROUGH: "textDecoration",
		SUPERSCRIPT: "verticalAlign",
		SUBSCRIPT: "verticalAlign",
		BORDERTOPWIDTH: "borderTopWidth",
		BORDERRIGHTWIDTH: "borderRightWidth",
		BORDERBOTTOMWIDTH: "borderBottomWidth",
		BORDERLEFTWIDTH: "borderLeftWidth",
		PADDINGTOP: "paddingTop",
		PADDINGRIGHT: "paddingRight",
		PADDINGBOTTOM: "paddingBottom",
		PADDINGLEFT: "paddingLeft",
		MARGINTOP: "marginTop",
		MARGINRIGHT: "marginRight",
		MARGINLEFT: "marginLeft",
		MARGINBOTTOM: "marginBottom"
	},
	
	ABS_STYLES:
	{
		FONTSIZE: "abs-font-size",
		MARGINLEFT: "abs-margin-left",
		TEXTINDENT: "abs-text-indent",
		NUMBERTYPE: "abs-number-type",
		STARTNUMBER: "abs-start-number",
		LISTSCALE: "abs-bullet-scale",
		LISTCOLOR: "abs-bullet-color",
		LISTFAMILY: "abs-bullet-family"
	},
	
	config_indentOffset : 1270,
	
	setDefaultListType: function(liNode)
	{
		var lineItemNode = liNode;
		var parentNode = lineItemNode.parentNode;
		var nodeName = lineItemNode.nodeName;
		if (nodeName.toLowerCase() == 'ol' || nodeName.toLowerCase() == 'ul')
		{
			parentNode = lineItemNode;
			lineItemNode = lineItemNode.firstChild;
			nodeName = lineItemNode.nodeName;
		}
		if (nodeName.toLowerCase() != 'li')
		{
			// debugger;
			return;
		}
		
		var parentNodeName = parentNode.nodeName;
		if(parentNodeName.toLowerCase() == 'ol')
		{
			dojo.attr(parentNode, 'numberType','1');
			dojo.addClass(lineItemNode,'lst-n');
		}
		else if(parentNodeName.toLowerCase() == 'ul')
		{
			dojo.addClass(lineItemNode,'lst-c');
		}		
	},
	_hasListClass: function(liNode)
	{
		var lineItemNode = liNode;
		var nodeName = lineItemNode.nodeName;
		if (nodeName.toLowerCase() != 'li' && nodeName.toLowerCase() != 'p')
		{
			return false;
		}
		var listClassesString = dojo.attr(lineItemNode, 'class');
		if (listClassesString == undefined || listClassesString == null)
		{
			listClassesString = " ";
		}
		var listClasses = listClassesString.split(' ');
		for ( var j = 0; j < listClasses.length; j++)
			if (listClasses[j].match(/^lst-/))
			{
				return true;
			}
		return false;
	},
	_removeListClass: function(liNode, bRemoveList, bRemoveInline, bRmoveMaster, bRemoveHidden, bRemoveILCS)
	{
		var lineItemNode = liNode;
		var nodeName = lineItemNode.nodeName;
		if (nodeName.toLowerCase() == 'ol' || nodeName.toLowerCase() == 'ul')
		{
			lineItemNode = lineItemNode.firstChild;
			nodeName = lineItemNode.nodeName;
		}
		if (nodeName.toLowerCase() != 'li' && nodeName.toLowerCase() != 'p')
		{
			// debugger;
			return;
		}
		if (!(bRemoveList || bRemoveInline || bRmoveMaster || bRemoveHidden))
			return;

		var listClassesString = dojo.attr(lineItemNode, 'class');
		if (listClassesString == undefined || listClassesString == null)
		{
			listClassesString = " ";
		}
		var listClasses = listClassesString.split(' ');
		for ( var j = 0; j < listClasses.length; j++)
		{
			if ((bRemoveList && listClasses[j].match(/^lst-/)) || (bRmoveMaster && (listClasses[j].match(/^ML_/))) || (bRmoveMaster && (listClasses[j].match(/^MP_/))) || (bRmoveMaster && (listClasses[j].match(/^MT_/))) || (bRemoveInline && (listClasses[j].match(/^IL_/))) || (bRemoveHidden && (listClasses[j].match(/^sys-list-hidden/))))
			{
				dojo.removeClass(lineItemNode, listClasses[j]);
			}
			if(bRemoveILCS && listClasses[j].match(/^IL_CS_/))
			{
				dojo.removeClass(lineItemNode, listClasses[j]);
			}
		}
	},

	// Check whether the line has "lst-" class
	isCustomedLine: function(_line)
	{
		var regx = /^lst-/g;
		var regxLst_MR = /^lst-MR-/g;
		var lineItem = EditorUtil.getLineItem(_line);
		if (!lineItem)
			return null;
		var cls = EditorUtil.getAttribute(lineItem, 'class');
		if (cls == undefined || cls == null)
		{
			cls = " ";
		}
		var listClasses = cls.split(' ');
		for ( var j = 0; j < listClasses.length; j++)
		{
			if (listClasses[j].match(regx) && !(listClasses[j].match(regxLst_MR)))
			{
				return true;
			}
		}
		return false;
	},
	
 	//Get line node, return <p>/<ol>/<ul> or null
 	getLineNode : function(node){
 		var block = EditorUtil.getBlock(node);
 		if(block)
 		{
 			if(EditorUtil.is(block,'li'))
 				block = block.parentNode;
 		}
 		return block;
 	},
	
	//Get the previous of next line
	//in case of any node which be inserted between to lines
	//such as <textnode> or <bookmark>
	//input <ol><ul><p>,output <ol><ul><p>
	_getNeighborLine:function(_CKLine,bPrevious)
	{
		var lineIndex = EditorUtil.getIndex(_CKLine);
		var parentNode = _CKLine.parentNode;
		if(!parentNode)
			return null;
		for(var i = lineIndex+(bPrevious?-1:1);
		(bPrevious?i>=0:i<parentNode.childNodes.length);
		(bPrevious?i--:i++))
		{
			var node = parentNode.childNodes[i];
			if(EditorUtil.is(node,'ol','ul','p'))
			{
				return node;
			}
		}

		return null;
	},
	
	//return the neighbor line of same level
	//Note : bCrossLevel could allow the search cross the level boundary
	//such as 
	/*
	*       <a>
	*    <b>
	*       <C>
	*   if bCrossLevel is true, while search for <a> it could get <C>, otherwise it get nothing
	*/
	getNeighborListLine : function(line, bPrevious,bCrossLevel)
	{
		var neighborLine  = this._getNeighborLine(line,bPrevious);
		while(neighborLine)
		{//in case of multi line selection
			if(EditorUtil.hasAttribute(neighborLine,'new_action_line'))
					neighborLine  = this._getNeighborLine(neighborLine,bPrevious);
			else
			{
				var numberInfo = EditorUtil.getNumberingKeyValue(line);
				var neighborInfo = null;
				if(neighborLine && EditorUtil.is(neighborLine,'ol','ul'))
				{
					neighborInfo = EditorUtil.getNumberingKeyValue(neighborLine);
					if(numberInfo.level == neighborInfo.level)
					{
						return neighborLine;
					}
					else if(numberInfo.level < neighborInfo.level || bCrossLevel)
						neighborLine  = this._getNeighborLine(neighborLine,bPrevious);
					else 
						return null;
				}
				else
					return null;
			}
		}
		
		return null;
	},
	//Presentation use get list class
	//return is object,contain list class inline class and masgter class
	//node is li,ou,ol,p
	getListClass : function ( liNode )
	{
		var regx = [/^IL_/g,/^lst-/g,/^MP_/g,/^ML_/g,/^MT_/g];
		var regxLst_MR = /^lst-MR-/g;
		var listClass = [];
		var listMRClass = [];
		for(var r=0 ; r<regx.length; r++)
		{
			var tl = [];
			listClass[r]=tl;
		}
		
		if(!liNode)
			return "";
		
		if(!EditorUtil.is(liNode,'li','ol','ul','p'))
		{
			//debugger;
			return "";
		}
		var target = EditorUtil.is(liNode,'li','p')?liNode:liNode.firstChild;
		
		var cls = EditorUtil.getAttribute(target,'class');
		
		if (cls == undefined || cls == null){
			cls = " ";
		}
		var listClasses = cls.split(' ');
		for ( var j = 0 ; j < listClasses.length; j++)
		{
			if ( listClasses[j].match(regxLst_MR) )
			{
				listMRClass.push(listClasses[j]);
			}
			else
			{
				for(var r=0 ; r<regx.length; r++)
					if ( listClasses[j].match(regx[r]) 
							&& !(listClasses[j].match(regxLst_MR)))
					{
						listClass[r].push(listClasses[j]);
					}
			}
		}

		return {
			inlineClass:listClass[0],///^IL_/g,
			listClass:listClass[1],///^lst-/g,
			listMRClass:listMRClass,///^lst-MR/g
			masterParagraphClass:listClass[2],///^MP_/g,
			masterListClass:listClass[3],//^ML_/g,
			masterTextClass:listClass[4]//^MT_/g
			
		};
	},
	_percentToFloat : function(str)
	{
  	   var ndx = str.indexOf( '%' );
  	   if (ndx >= 0)
  		{
  		 var re = str.substring(0, ndx);
  		 re = parseFloat(re)/100.0;
  		 return re;
  		}
  	    return NaN;	  	   
	},
	isListCreatedByDocs: function(liNode)
	{
		if(!liNode)
			return false;
		var supports = ["lst-c", "lst-cs", "lst-ra", "lst-d", "lst-da", "lst-ta", "lst-cm", "lst-ps", "lst-n", "lst-np", "lst-ua", "lst-uap", "lst-la", "lst-lap", "lst-ur", "lst-lr"];
		var listClassesString = dojo.attr(liNode, 'class');
		for ( var i = 0; i < supports.length; i++)
		{
			if( listClassesString.indexOf(supports[i]) > -1 ){
				return true;
			}
		}
		return false;
	},
	prepareStylesforILBefore: function(liNode)
	{
		// Update from view ======================================
		var firstSpan = EditorUtil.getFirstVisibleSpanFromLine(liNode);
		if (firstSpan)
		{
			var fontSize = Math.round(EditorUtil.getAbsoluteValue(firstSpan, EditorUtil.ABS_STYLES.FONTSIZE));
			var fontFamily = EditorUtil.getStyle(firstSpan, "font-family");
			var color = EditorUtil.getStyle(firstSpan, "color");
			if (color)
			{
				color = EditorUtil.convertToHexColor(color);
				color = color.substring(1, color.length);
				color = color.toUpperCase();
			}
			if (liNode.parentNode.nodeName.toLowerCase() == 'ul')
			{
				var listClassesString = dojo.attr(liNode, 'class');
				if (listClassesString.indexOf('lst-ta') >= 0)
				{
					fontFamily = 'wingdings';
				}
				else if (listClassesString.indexOf('lst-ra') >= 0 || listClassesString.indexOf('lst-cm') >= 0)
				{
					fontFamily = 'webdings';
				}
				else if (listClassesString.indexOf('lst-d') >= 0 || listClassesString.indexOf('lst-da') >= 0)
				{
					fontFamily = 'times_new_roman';
				}
				else if (listClassesString.indexOf('lst-a') >= 0)
				{
					fontFamily = 'symbol';
				}
				else if (listClassesString.indexOf('lst-ps') >= 0)
				{
					fontFamily = 'impact';
				}
				else if (listClassesString.indexOf('lst-c') >= 0 || listClassesString.indexOf('ML_defaultMaster_Content_outline_1') >= 0)
				{
					fontFamily = 'arial';
				}
			}
			fontFamily = fontFamily.toLowerCase();
			fontFamily = fontFamily.replace(/ /gi, '_');
			fontFamily = fontFamily.replace(/'/gi, '');
			var v = EditorUtil.getStyle(firstSpan, "font-weight");
			fontBold = (v == "bold" || v == "bolder" || v == "700" || v == "800" || v == "900");
			v = EditorUtil.getStyle(firstSpan, "font-style");
			fontItalic = (v == 'italic');
			if (color)
			{
				var cls = 'LC_' + color;
				dojo.addClass(liNode, cls);
			}
			if (fontFamily)
			{
				var cls = 'LF_' + fontFamily;
				dojo.addClass(liNode, cls);
			}
			if (fontBold != null)
			{
				var cls = 'LB_' + (fontBold ? 'TRUE' : 'FALSE');
				dojo.addClass(liNode, cls);
			}
			if (fontItalic != null)
			{
				var cls = 'LI_' + (fontItalic ? 'TRUE' : 'FALSE');
				dojo.addClass(liNode, cls);
			}
			if (fontSize)
			{
				var cls = 'LS_' + fontSize;
				dojo.addClass(liNode, cls);
			}
		}
	}
});