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

dojo.provide("concord.text.StyleMsg");
dojo.require("concord.text.MsgUtil");
dojo.require("concord.text.SyncMsg");

( function()
{
/*****************************************************************************************************************************************
 * converted string to styles parameter
 * @name MsgUtil.getStyleParas 
 * @function
 * @param String
 * @returns an object like {font-size: 48 , ...}
 * @example
*/
concord.text.MsgUtil.prototype.getStyleParas = function ( string )
{
	var ret ={},stylePair;
	//#38656 
	var styles = string.split(/\s*;\s*/);
	for( var j=0; j< styles.length; j++ )
	{
		if( styles[j] ) 
		{
			stylePair = styles[j].split(/\s*:\s*/);
			if( stylePair.length >=1 )//#36845
			{
				var styleName = dojo.trim( stylePair[0].toLowerCase());
				var value = dojo.trim( stylePair[1]||"" );
				ret[styleName] = value;
			}
			else 
				console.log( "empty style string");
		}
	}		
	return ret;
};

//function to get next text node, we regard a tab node as a text node
function _getNextTextOrTab(  node, guard  )
{
	if (!node || !node.getNextSourceNode) return null;
	// a fix for tab image. Tab image should also be considered as text node
	var text =  node.getNextSourceNode(false, null, guard );
	while( text && text.type != CKEDITOR.NODE_TEXT && !(text.hasClass && text.hasClass('ConcordTab')) ){
		text =  text.getNextSourceNode(false, null, guard );
	}
	return text;
};

/*****************************************************************************************************************************************
 * get next text span
 * @name  concord.text.MsgUtil.prototype.getNextTextNode
 * @param  CKEDITOR.dom.element: paragra dom element
 * @param  CKEDITOR.dom.node: current node
 * @param  CKEDITOR.dom.node: end node  
 * @returns an array of object like {'node': , 'target': '123', 'index': 0, 'offset',22}
 */
concord.text.MsgUtil.prototype.getNextTextNode = function( node, guard )
{
	// a fix for tab image. Tab image should also be considered as text node
	var text =  _getNextTextOrTab(  node, guard  );
	//a limitation here, if a paragraph contains tabs only without any text, will return null.
	while( text && text.getParent() && !this.getNodeLength(text.getParent()) ){
		text =  _getNextTextOrTab(  text, guard  );
	}
	return text;
};

concord.text.MsgUtil.prototype.getPreviousTextNode = function( node, guard )
{
	var text =  node.getPreviousSourceNode(false, CKEDITOR.NODE_TEXT, guard );
	while( text && text.getParent() && !this.getNodeLength(text.getParent()) )
	{
		text = text.getPreviousSourceNode(false, CKEDITOR.NODE_TEXT, guard );
	}
	return text;
};

/*****************************************************************************************************************************************
 * convert CKEDITOR.dom.range  to the ranges in module
 * 
 */

concord.text.MsgUtil.prototype.analyzeRange = function ( range, toText)
{ 
	var isParagraphNode = function( node )
	{
		if( node.type == CKEDITOR.NODE_ELEMENT )
			return  node.is('div') || MSGUTIL.isHeading(node)||( MSGUTIL.isListItem(node)&&!MSGUTIL.isBlock(node.getFirst()))||MSGUTIL.isParagraph(node);
		return false;
	};
	
	var getNextParagraph = function( p, guard )
 	{
 		var e = p.getNextSourceNode( false, CKEDITOR.NODE_ELEMENT, guard );
 		while( e && !isParagraphNode(e) )
			e = e.getNextSourceNode( false, CKEDITOR.NODE_ELEMENT, guard );
		return e;
 	};
 	
 	var getPreviousParagraph = function( p, guard )
 	{
 		var e = p.getPreviousSourceNode( false, CKEDITOR.NODE_ELEMENT, guard );
 		while( e && !isParagraphNode(e) )
			e = e.getPreviousSourceNode( false, CKEDITOR.NODE_ELEMENT, guard );
		var childPara, boundary = e;
		while(  e && ( childPara = getNextParagraph( e, boundary )) ) 
			e = childPara;
		return e;
 	};
 	
 	var getParagraphLength = function( para )
 	{
 		 return (para.is('li'))? MSGUTIL.getBulletTextNodeLength(para) : MSGUTIL.getNodeLength( para )
 	};
 	
	var elementlist = new Array();

	var boundaryNodes = range.getBoundaryNodes();
	var last = boundaryNodes.endNode.getNextSourceNode( true, CKEDITOR.NODE_TEXT );
	
	var startNode = range.startContainer;
	var startOffset = range.startOffset;
	if( startNode.type == CKEDITOR.NODE_ELEMENT )	
	{
		startNode = boundaryNodes.startNode;
		startOffset = 0;
	}
	
	var endNode = range.endContainer;
	var endOffset = range.endOffset;
	
	if( endNode.type == CKEDITOR.NODE_ELEMENT )
	{
		endNode = boundaryNodes.endNode;
		if( endNode.type == CKEDITOR.NODE_TEXT )
			endOffset = MSGUTIL.getNodeLength(endNode);
		else
		{
			endOffset = endNode.getChildCount();
			if( endOffset == 0 && endNode.getParent())
			{
				// Defect #48502
				endNode = range.endContainer;
				endOffset = range.endOffset;
			}
		}
	}
	
	if( toText )
	{
		var index, para, offset;
		var current = startNode, next;	
		while(current)
		{
			next = MSGUTIL.getNextTextNode(current,last);
			if( current && (current.type == CKEDITOR.NODE_TEXT|| (current.hasClass && current.hasClass('ConcordTab') )) )
			{
				//console.log(current.getText());
				index = (  current == startNode )? startOffset:0;
				
				para = MSGUTIL.getParagraphNode ( current );
				index += MSGUTIL.transOffsetRelToAbs ( current, index, para );
				
				offset = ( current == endNode )? endOffset : MSGUTIL.getNodeLength(current);
				elementlist.push(  { "target": para.getId(),"index": index,"offset":offset, "node":current });
			}
			current = next;
		}
	}
	else
	{			
		var para = MSGUTIL.getParagraphNode ( startNode );
		var para2 = MSGUTIL.getParagraphNode ( endNode );
		
		// startNode and endNode maybe 'ol'
		// then para and para2 is not paragraph node
		var i, end, oldPara = para;
		if( isParagraphNode( para ) )
			i = MSGUTIL.transOffsetRelToAbs ( startNode, startOffset, para );
		else
		{
			para = getNextParagraph( para, para2 );
			i = 0;
		}
		
		if( para == null ) // no paragraph in the selection 
			return elementlist;
		
		if( isParagraphNode( para2 ) )
			end = MSGUTIL.transOffsetRelToAbs ( endNode, endOffset,para2 );
		else
		{
			para2 = getPreviousParagraph( para2, oldPara );
			if( para2 == null )  para2 = para;
			end =  getParagraphLength( para2 );
		}
	
		while( para && !para.equals(para2))
		{
			var len = getParagraphLength( para );
			var el = {"target": para.getId(),"index":i,"offset":len };
			if( len - i > 0 )
				elementlist.push( {"target": para.getId(),"index":i,"offset":len-i } );
			para = getNextParagraph( para);
			i = 0;
		}
		elementlist.push(  { "target": para2.getId(),"index": i,"offset":end-i } );
	}

	return elementlist;
};

/*****************************************************************************************************************************************
 * remove styles 
 * 
 */
concord.text.MsgUtil.prototype.removeStyles = function ( node, styles )
{
	styles = dojo.clone(styles);
	for( var name in styles )
	{
		if( name == "text-decoration" )
			styles[name]= node.getStyle(name).replace(styles[name],"").replace(/\s+/g,' ');
		else
			styles[name]="";
	}
	this.setStyles(node,styles);
	
};
concord.text.MsgUtil.prototype.removeStylesKeepTextProperties = function(node, styles) {
	styles = dojo.clone(styles);
	var va = null;
	for( var name in styles )
	{
		if( name == "text-decoration" )
			styles[name]= node.getStyle(name).replace(styles[name],"").replace(/\s+/g,' ');
		else if (name == "vertical-align") {
			va = styles[name];
			styles[name] = "";
		}
		else
			styles[name]="";
	}
	for( var name in styles ) {
		// When removing a style property, treat text and font properties 
		// differently.  Instead of removing the properties, set it to 'none',
		// or 'normal', whatever is applicble.
		if (name == 'text-decoration' || name == 'font-weight' ||
				name == 'font-style' || name == 'color') {
			this.setTextStyle(node, name, styles[name]);
		} else if (name == 'vertical-align' && (va == 'super' || va == 'sub')) {
			this.setTextStyle(node, name, styles[name]);
			var body = window.pe.scene.getEditor().document.getBody();
			if (body && body.$) {
				var isBodyDescendant = dojo.isDescendant(node.$, body.$);
				if (isBodyDescendant)
					PresFontUtil.applyVerticalAlignFontSizeToElement(node, false);
			}
		} else {
			this.setStyle(node, name, styles[name]);
		}
	}
	
};
concord.text.MsgUtil.prototype.setStyles = function( node, styles )
{
	for( var name in styles )
		this.setStyle( node, name,styles[name]);
};

concord.text.MsgUtil.prototype.hasStyle = function ( node, name )
{
	if( this.isTextDecorationStyle(name))
	{
		var a = "text-decoration";
		var style = node.getStyle(a);
		return style!= ''&& style.match("\\b"+name+"\\b");
	}
	else
		return node.getStyle(name)!='';
};

concord.text.MsgUtil.prototype.setTextStyle = function( node, name, value )
{
	if( name == 'background-color' &&  CKEDITOR.env.ie )
	//there is bug in ie for setStyle function in this case;
		name = 'background';
	
	if(value=="") {
		if (name == 'font-weight' || name == 'font-style')
			node.setStyle( name, 'normal');
		else if (name == 'text-decoration')
			node.setStyle( name, 'none');
		else if (name == 'color')
			node.setStyle( name, 'inherit');
		else
			node.removeStyle(name);
	} else {
		// IE needs to remove counter-reset first, or else setStyle will take no effect.
		if (CKEDITOR.env.ie)
			node.removeStyle(name);
		node.setStyle(name, value);
	}
};

concord.text.MsgUtil.prototype.setStyle = function( node, name, value )
{
		if( name == 'background-color' &&  CKEDITOR.env.ie )
		//there is bug in ie for setStyle function in this case;
			name = 'background';
	
		if( this.isTextDecorationStyle(name))
		{
			var a = "text-decoration";
			var style = node.getStyle(a);
			// For some reason the setStyle of none or a blank line returns
			// initial on Chrome for text-decoration styles
			if( style == "none" || (dojo.isChrome && style == "initial")) style = '';
			if( value == ''&& style.match("\\b"+name+"\\b") )
			{ //remove decoration style
				style = style.replace(name,'').replace(/\s+/g,' ');
				node.setStyle(a, style);
			}
			else if( value != ''&& !style.match("\\b"+name+"\\b"))
			 //if value != '', set decoration style
				node.setStyle( a, (style=="") ? name : ( style + " " + name ));
		}
		else 
		{
			if(value=="")
				node.removeStyle(name);
			else
			{
				// IE need remove counter-reset first, or else setStyle will take no effect.
				if (CKEDITOR.env.ie)
					node.removeStyle(name);
				node.setStyle( name, value );
				if ( CKEDITOR.env.webkit && name == 'counter-reset' && value != "")
				{
					//Defect 3303	[Safari] list restart work incorrectly
					// Don't know the exact reason why setting counter-reset don't work in safari, so we have to remove the list and insert it back,
					// which cause browser reflow(may re-caculate the counter).
					var parent = node.getParent();
					var previous = node.getPrevious();
					node.remove();
					if (previous)
						node.insertAfter(previous);
					else
						node.appendTo(parent, true);
				}
			}
		}
};

function isMarginStyle( n )
{
 	return n == "margin-left" || n== "margin-right"|| n== "margin-top" || n == "margin-bottom";
};

function isBorderStyle( n )
{
	 return n == "border-left" || n == "border-top" || n == "border-right" || n == "border-bottom" || n =="border-width" || n== "border-style"
};

concord.text.MsgUtil.prototype.isTextDecorationStyle = function( n )
{
	return n =="line-through"||n == "underline";
};

concord.text.MsgUtil.prototype.isStyleExist = function( styles, n)
{
 	if( styles[n] == null )
	{
		if( isMarginStyle( n ))
			return styles['margin']!=null;
		else if( isBorderStyle ( n ))
			return styles['border']!=null;
		else if( n == 'text-decoration' )
			return styles['underline'] != null || styles['line-through'] != null;
		else if( n == 'underline' || n == 'line-through' )
			return styles['text-decoration'] != null;
		else
			return false;
	}
	return true;
};

concord.text.MsgUtil.prototype.checkNullValues = function( values )
{
	for ( var n in values )
	{
		if( values[n] == null ) values[n]="";
	}
};
concord.text.MsgUtil.prototype.checkSameValues = function( newValues, old )
{
 	for ( var name in newValues )
 	{
 		// Defect 9340 always add "presentation_presentation-page-layout-name" attribute message for OT
 		if(name == "presentation_presentation-page-layout-name")
 			continue;
 		if( old[name] == newValues[name])
 		{
 			delete old[name];
 			delete newValues[name];
 		}
 	}
	return true;
};
/*****************************************************************************************************************************************
 * get attributes
 * @param CKEditor.dom.element
 */
concord.text.MsgUtil.prototype.getElementAttributes = function ( element )
{
	var attributes = element.$.attributes;
	var ret = {};
	for ( var n = 0 ; n < attributes.length ; n++ )
	{
		var attribute = attributes[n];

		// Lowercase attribute name hard rule is broken for
		// some attribute on IE, e.g. CHECKED.
		var attrName = attribute.nodeName.toLowerCase(),
			attrValue;
		if( attrName == 'style')
			continue;
		if( attrName == 'checked' && ( attrValue = element.getAttribute( attrName ) ) )
			ret[attrName] = attrValue;
		// IE BUG: value attribute is never specified even if it exists.
		else if ( attribute.specified ||
		  ( CKEDITOR.env.ie && attribute.nodeValue && attrName == 'value' ) )
		{
			attrValue = element.getAttribute( attrName );
			if ( attrValue === null )
				attrValue = attribute.nodeValue;
			ret[attrName] = attrValue;
		}
	}
	return ret;
};
concord.text.MsgUtil.prototype.mergeElements = function( element, sibling, isNext )
{
	if ( sibling && sibling.type == CKEDITOR.NODE_ELEMENT )
	{
		var hasBookmark = sibling.getAttribute( '_fck_bookmark' );

		if ( hasBookmark )
			sibling = isNext ? sibling.getNext() : sibling.getPrevious();

		if ( sibling && sibling.type == CKEDITOR.NODE_ELEMENT && element.isIdentical && element.isIdentical( sibling ) )
		{
			// Save the last child to be checked too, to merge things like
			// <b><i></i></b><b><i></i></b> => <b><i></i></b>
			var innerSibling = isNext ? element.getLast() : element.getFirst();

			if ( hasBookmark )
				( isNext ? sibling.getPrevious() : sibling.getNext() ).move( element, !isNext );

			sibling.moveChildren( element, !isNext );
			sibling.remove();

			// Now check the last inner child (see two comments above).
			if ( innerSibling )
				this.mergeSiblings( innerSibling );
		}
	}
};

concord.text.MsgUtil.prototype.mergeSiblings = function ( element )
{
	// Merge web link message.
	if ( !element || element.type != CKEDITOR.NODE_ELEMENT || (!CKEDITOR.dtd.$removeEmpty[ element.getName() ] && element.getName() != 'a' ))
		return;

	this.mergeElements( element, element.getNext(), true );
	this.mergeElements( element, element.getPrevious() );
};

// If the element has no more attributes, remove it.
concord.text.MsgUtil.prototype.removeNoAttribsElement = function ( element )
{
	// If no more attributes remained in the element, remove it,
	// leaving its children.
	if ( element.hasAttributes && !element.hasAttributes() )
	{
		// Removing elements may open points where merging is possible,
		// so let's cache the first and last nodes for later checking.
		var firstChild	= element.getFirst();
		var lastChild	= element.getLast();

		element.remove( true );

		if ( firstChild )
		{
			// Check the cached nodes for merging.
			MSGUTIL.mergeSiblings( firstChild );

			if ( lastChild && !firstChild.equals( lastChild ) )
				MSGUTIL.mergeSiblings( lastChild );
		}
	}
};
/*
	 * @param {CKEDITOR.dom.node} node.
	 * @example
	 */
concord.text.MsgUtil.prototype.isSpan = function ( node )
{
		return node&&(node.type == CKEDITOR.NODE_ELEMENT) && node.getName() == 'span';	
};
})();

