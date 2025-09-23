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

dojo.provide("concord.pres.MsgUtil");
dojo.require("concord.text.MsgUtil");

dojo.declare("concord.pres.MsgUtil", concord.text.MsgUtil, {
        
    constructor: function(data) {
        //Adding presentation specific messages to MSGUTIL
        MSGUTIL.msgType.contentBoxEditMode = "contentBoxEditMode";        
        MSGUTIL.msgType.slideSelected = "slideSelected";
        MSGUTIL.msgType.doAssignment = "doAssignment";
        MSGUTIL.msgType.applyTemplate = "applyTemplate";
        MSGUTIL.msgType.templateApplied = "templateApplied";
        MSGUTIL.msgType.layoutApplied = "layoutApplied";
        MSGUTIL.msgType.addNewComment = "addNewComment";
        MSGUTIL.msgType.deleteComment = "deleteComment";
        MSGUTIL.msgType.cleanLayoutDefaultText = "CLDT";
        MSGUTIL.msgType.requestLockStatus = "LCKST";
        MSGUTIL.msgType.removeUserLock = "RMVUSRLCK";
        MSGUTIL.msgType.addSlideComment = "addSlideComment";
        MSGUTIL.msgType.delSlideComment = "delSlideComment";
        MSGUTIL.msgType.slideShowCoview = "SSCV";
        MSGUTIL.msgType.slideShowCoviewStart = "SSCVS";
        MSGUTIL.msgType.slideShowCoviewEnd = "SSCVE";
        MSGUTIL.msgType.slideShowCoviewJoin = "SSCVJ";
        MSGUTIL.msgType.slideShowCoviewLeft = "SSCVL";
        
    },
    
     PRES_IS_NODE_A_SLIDE :"p_isnas",
     PRES_IS_NODE_A_SLIDE_WRAPPER :"p_isnasw",
     PRES_IS_NODE_A_DRAW_FRAME :"p_isnad",
     PRES_IS_NODE_A_TASK :"p_isnat",
     PRES_NODE_ID :"p_nid",
     
     /**
      * Overrides concord.text.MsgUtil.isBookMark
      * 
      * The new CK Editor that presentations uses seems to have a different
      * "bookmark" attribute, so let's check for the new attribute, too.
      */
     isBookMark : function( node ) {
    	 if (!window.g_noimprove) return false;
    	 
         var ret = false;
         if( node.type == CKEDITOR.NODE_ELEMENT )
             ret = node.hasAttribute('data-cke-bookmark');
         return ret || this.inherited( arguments );
     },
     
     /**
      * Overrides concord.text.MsgUtil.getRange
      * 
      * For presentations if we have done a "select all" in a content box
      * for some reason the range selects the editor BODY element and
      * not the child elements of the DIV containing the text box
      * contents (even though that's what the "select all" code does).
      */
     getRange : function( editor, msgList)
     {
        var range = this.inherited( arguments );
        
        // 1st, get the content box container
        var containerDiv = dojo.query( 'div.draw_frame_classes', range.document.$ );
        var items;
        if (containerDiv && containerDiv[0])
        {
          containerDiv = new CKEDITOR.dom.element( containerDiv[0] );
          // now, get its content
          items = containerDiv.getChildren();
        }
        // if you're editing a table cell, the above won't get your content
        if (!items)
        {
          containerDiv = dojo.query( 'td.selectedSTCell', range.document.$ );
          if (containerDiv && containerDiv[0])
          {
            containerDiv = new CKEDITOR.dom.element( containerDiv[0] );
            items = containerDiv.getChildren();
          }
        }
        
        // flags
        var startReset = false;
        var endReset = false;
        // if start container is the body, then update to 1st content node
        if (range.startContainer.getName && range.startContainer.getName() == 'body') {
          startReset = true; // update flag
          range.setStartBefore( items.getItem(0) );
        }
        // if end container is the body, then update to last content node
        if (range.endContainer.getName && range.endContainer.getName() == 'body') {
          endReset = true; // update flag
          range.setEndAfter( items.getItem(items.count() - 1) );
        }
        // no sense in continuing if we've already set both start and end containers
        if (startReset && endReset)
          return range;
        
        // if the range is collapsed (i.e. nothing is selected),
        // let's continue as normal
        if (range.collapsed)
          return range;
        
        // if we're not at the beginning of the start container (where ever it may be),
        // it's impossible for us to have selected all
        if (range.startOffset >= 0)
          return range;
        
        // if no items, run as normal
        if (!items)
          return range;
        
        // Defect XXX
        // if the start container has a previous sibling (unless it's a table cell), then we can't
        // be at the very beginning (and can't have selected all)
        var start = range.startContainer;
        if (start.type == CKEDITOR.NODE_TEXT)
          start = start.getParent();
        if (!start.is('td') && start.getPrevious())
          return range;
        
        // now, let's check if all content is selected
        // first, we'll create a range iterator and see if the 1st item
        // in that iterator matches the 1st item in the content box
        var iter = range.createIterator();
        var firstRangeElem = iter.getNextParagraph();
        var firstContentElem = items.getItem(0);
        // the range iteration doesn't give UL or OL items (but the content
        // box does), so we have to get the 1st LI (even if there are multiple
        // list levels)
        while (firstContentElem.is && firstContentElem.is('ul','ol')) {
          firstContentElem = firstContentElem.getFirst();
        }
        
        // if the 1st elements aren't the same, we couldn't have
        // selected all content...
        if ( !firstRangeElem.equals( firstContentElem ) )
          return range;
        
        // next, we'll find the last item in the range iterator and see if it
        // matches the last item in the content box
        // 47558 make sure lastRangeElem has been initialized/ has value before compare
        var lastRangeElem = firstRangeElem, elem;
        while (elem = iter.getNextParagraph()) {
          lastRangeElem = elem;
        }
        
        // note: i've observed an "extra" item at the end of the content box
        // if i retrieve it *before* iterating through the range, so i'm
        // only getting the last item after i'm done iterating above
        // see comment above about UL/OL items
        var lastContentElem = items.getItem( items.count() - 1 );
        while (lastContentElem.is && lastContentElem.is('ul','ol')) {
          lastContentElem = lastContentElem.getLast();
        }
        
        // if the last elements aren't the same, we couldn't have
        // selected all content...
        if ( !lastRangeElem.equals( lastContentElem ) )
          return range;
        
        // ok, the first and last elements were equal. make sure the
        // range is selected properly
        // note that i can't use first|lastContentElem that i saved earlier
        // since it's possible i got children of those (i.e. trying to get
        // to any LI elements)
        range.setStartBefore( items.getItem(0) );
        range.setEndAfter( items.getItem( items.count() - 1 ) );
        return range;
     },
    
     /**
      * Overrides concord.text.MsgUtil.getInsertPos
      * 
      * For presentations, we want to add the "insertBefore" flag if we have a text
      * node AND the returned offset is 0.
      */
     getInsertPos : function(ascendant, offset)
     {
        var ret = this.inherited( arguments );
        if ( ascendant.type == CKEDITOR.NODE_TEXT )
        {
            ret.insertBefore = (ret.offset == 0);
        }
        return ret;
     },
     
 	/*generate default <p> element for cell
 	 * @name MSGUITL.genDefaultContentForCell
 	 * @function
 	 * @param CKEDITOR.dom.element
 	 * @param oldP: old P node with style.
 	 */
 	genDefaultContentForCell : function(element, oldP)
 	{
 		 if(oldP){
 			 var oldPNode = new CKEDITOR.dom.node(oldP);
 			 element.append(oldPNode);
  		 }else{
  			 var defaultStr = '<span style="font-size: 1em;">&#8203;</span>';
  			 var para = element.getDocument().createElement('p');
  			 para.$.innerHTML = defaultStr;
  			 para.appendBogus();
  			 element.append(para);
  		 }

 	},

	// S24380, refer to text.msgutil.isBr/isBogus
	isBr : function(node) {
		if(!node)
			return false;

		return node.type == CKEDITOR.NODE_ELEMENT && node.is('br');
	},

	isBogus : function(node) {
		return MSGUTIL.isBr(node) && node.hasClass('hideInIE');
	},

 	//
 	// The adjust range for cut will check the startContainer and end container and modify according to the following rules
 	// 1) if endContainer is body then change to p or li under drawFrame classes
 	// this function assumes that if the endContainer of the range is set to the body then a CTRL+A was specified by user 
 	//
 	adjustRangeForCut: function(ranges){
 		if (ranges.length==1){
 			if (ranges[0].endContainer.$.nodeName.toLowerCase()=='body'){
 				var pNode = ranges[0].endContainer.$;
 				while (pNode.nodeName.toLowerCase() != 'p' && pNode.nodeName.toLowerCase() != 'li'  && pNode.firstChild) {
 					pNode = pNode.firstChild;
 				}
				var txtNode=null;
				var lastNode=null;

 				if (pNode.nodeName.toLowerCase() == 'p'){
 					var dfNode = pNode.parentNode;					
 					var pNodes = dojo.query("p",dfNode);
 					var lastp = (pNodes.length>0) ? pNodes[pNodes.length-1]: null;
					if (lastp!=null){
						var spanNodes = dojo.query("span",lastp);
						if (spanNodes.length >0){
	 						var lastSpan = spanNodes[spanNodes.length-1];
	 						//Now let's get last text
	 		 				txtNode = lastSpan.lastChild;
	 		 				//if empty span then get last text of previous span
	 		 				while (!txtNode && lastSpan.previousSibling) {
	 		 					txtNode = lastSpan.previousSibling.lastChild;
	 		 				}
	 		 				lastNode = lastSpan;
						} else{	//no spans under the last p
							if (lastp!=null){
								txtNode = lastp.lastChild;
								lastNode = lastp;
							}							
						}
					} 					
 				} else if (pNode.nodeName.toLowerCase() == 'li'){
 					var ulNode = pNode.parentNode;
					var liNodes = dojo.query("li",ulNode);
					var lastLi = (liNodes.length>0) ?liNodes[liNodes.length-1]: null;
					if (lastLi!=null){
						var spanNodes = dojo.query("span",lastLi);
						if (spanNodes.length >0){
	 						var lastSpan = spanNodes[spanNodes.length-1];
	 						//Now let's get last text
	 		 				txtNode = lastSpan.lastChild;
	 		 				//if empty span then get last text of previous span
	 		 				while (!txtNode && lastSpan.previousSibling) {
	 		 					txtNode = lastSpan.previousSibling.lastChild;
	 		 				}
	 		 				lastNode = lastSpan;
						} else{	//no spans under the last li
							if (lastLi!=null){
								txtNode = lastLi.lastChild;
								lastNode = lastLi;
							}							
						}
					}
 				}
 				while (txtNode && txtNode.nodeType && txtNode.nodeType != CKEDITOR.NODE_TEXT  && txtNode.previousSibling) {
 					txtNode = txtNode.previousSibling;
 				}
 				if (txtNode && txtNode.nodeType == CKEDITOR.NODE_TEXT){
 					ranges[0].endOffset = txtNode.textContent.length; 		 					
 					ranges[0].endContainer=new CKEDITOR.dom.text(txtNode);
 				}		 				
 			}
 		} 
 		//let's process for startcontainer
 		// for webkit seems that we get body for the startContainer as well.
		// FF and IE seem to return correct startContainer
 		//if (dojo.isWebKit){ 
			if (ranges[0].startContainer.$.nodeName.toLowerCase()=='body'){
				var pNode = ranges[0].startContainer.$;
				while (pNode.nodeName.toLowerCase() != 'p' && pNode.nodeName.toLowerCase() != 'li'  && pNode.firstChild) {
					pNode = pNode.firstChild;
				}
				var txtNode=null;
				var firstNode=null;
	
				if (pNode.nodeName.toLowerCase() == 'p'){
					var dfNode = pNode.parentNode;					
					var pNodes = dojo.query("p",dfNode);
					var firstP = (pNodes.length>0) ? pNodes[0]: null;
					if (firstP!=null){
						var spanNodes = dojo.query("span",firstP);
						if (spanNodes.length >0){
	 						var firstSpan = spanNodes[0];
	 						//Now let's get first text
	 		 				txtNode = firstSpan.firstChild; 	
	 		 				firstNode = firstSpan;
						} else{	//no spans under the last p
							if (firstP!=null){
								txtNode = firstP.firstChild;
								firstNode = firstP;
							}							
						}
					} 					
				} else if (pNode.nodeName.toLowerCase() == 'li'){
					var ulNode = pNode.parentNode;
					var liNodes = dojo.query("li",ulNode);
					var firstLi = (liNodes.length>0) ?liNodes[0]: null;
					if (firstLi!=null){
						var spanNodes = dojo.query("span",firstLi);
						if (spanNodes.length >0){
	 						var firstSpan = spanNodes[0];
	 						//Now let's get first text
	 		 				txtNode = firstSpan.firstChild; 	
	 		 				firstNode = firstSpan;
						} else{	//no spans under the last li
							if (firstLi!=null){
								txtNode = firstLi.firstChild;
								firstNode = firstLi;
							}							
						}
					}
				}
				while (txtNode && txtNode.nodeType && txtNode.nodeType != CKEDITOR.NODE_TEXT  && txtNode.nextSibling) {
					txtNode = txtNode.nextSibling;
				}
				if (txtNode && txtNode.nodeType == CKEDITOR.NODE_TEXT){
					ranges[0].startOffset = 0; 		 					
					ranges[0].startContainer=new CKEDITOR.dom.text(txtNode);
				}		 				
			} 		
 		//}
 		return ranges;
 	},
 	
 	/**
 	 * Gets the list class name, if any, on the specified 'node'. The 'node' must be a valid
 	 * list-related element (e.g. UL, OL, LI).
 	 * 
 	 * The 'super' implementation now makes use of ListUtil functions, which Presentations doesn't
 	 * want or use. So we now have to provide an alternate implementation.
 	 */
 	getListClass: function( node ) {
 	    return CKEDITOR.plugins.liststyles && CKEDITOR.plugins.liststyles.getListStyle ?
 	            CKEDITOR.plugins.liststyles.getListStyle( node ) : null;
 	},
 	
 	/**
 	 * Removes the list class names, if any, from the specified 'node'. The 'node' must be a valid
 	 * list-related element (e.g. UL, OL, LI).
 	 * 
 	 * The 'super' implementation now makes use of ListUtil functions, which Presentations doesn't
 	 * want or use. So we now have to provide an alternate implementation.
 	 */
 	removeListClass: function( node ) {
 	    var cls = this.getListClass( node );
 	    if ( cls ) {
 	        node.removeClass( cls );
 	    }
 	},

 	/**
 	 * Sets the list class name on the specified 'node'. The 'node' must be a valid
 	 * list-related element (e.g. UL, OL, LI).
	 */
 	setListClass: function( node, cls ) {
 		var styleInfo = {
		        style : cls,
                type : node
		    };
 		CKEDITOR.plugins.liststyles && CKEDITOR.plugins.liststyles.applyListStyles( null, node, styleInfo, false );
 	},
 
 	getBlock : function(node)
	{	
 		if(dojo.isIE && !node.getParent()){
 			return node;
 		}
 		
 		var block = this.inherited( arguments );
 		if ( node && block == null){
 			return node; 			
 		} else {
 			return block;
 		}
	},
	/* check is the tag is block tag
	 * @name MSGUTIL.isBlock 
	 * @function
	 * @param CKEDITOR.dom.node
	 * @returns return if the node is a block node
	 * @example
	 *	var node = CKEDITOR.dom.element.createFromHtml("<p>ABCEFG</p>");
	 *  alert( MSGUTIL.isBlock(node) ) // true
	 */
	isBlock : function(node)
	{
		if(!node)
			return false;
			
		var nodeName;
		if(typeof node == "string")
			nodeName = node.toLowerCase();
		else if(node.type == CKEDITOR.NODE_ELEMENT)
			nodeName = node.getName();
		else if(node.type == CKEDITOR.NODE_TEXT)
			return false;		
		else
			return false;
			
		if( node.is('div') && node.getParent()!=null && node.getParent().is('li'))
			return false;
		
		var dtd = CKEDITOR.dtd;
		var isBlock = dtd.$block[nodeName] || dtd.$blockLimit[nodeName] || dtd.$listItem[nodeName] || dtd.$list[nodeName] || dtd.$tableContent[nodeName];		
		isBlock = isBlock || nodeName == 'html';
		
		return isBlock;
	},

	//do not remove color when setting style
	//14405 gjo
	setTextStyle : function( node, name, value )
	{
		 var doCopy = false;
		 var li = node.getAscendant({'li':1}, true);
		 if(li){
			 var newSpan = PresCKUtil.getFirstVisibleSpanFromLine(li);
			 if(node.equals(newSpan)){
				 doCopy = true;
			 }
		 } 
		 
		var styles = [];
		if(value=="") {
			if (name == 'font-weight' || name == 'font-style'){
				node.setStyle( name, 'normal');
				styles[name] = 'normal';
				if(doCopy){
					pe.scene.slideSorter.needUpdateListStyleSheet = true;
					PresCKUtil.copyFirstSpanStyleToILBefore(li,styles,true);
				}
			}
			else if (name == 'text-decoration'){
				node.setStyle( name, 'none');
				styles[name] = 'none';
				//doCopy && PresCKUtil.copyFirstSpanStyleToILBefore(li,styles);
			}
			else if (name == 'vertical-align')
				node.setStyle( name, 'baseline');
			else if (name == 'color') {
				//node.setStyle( name, 'inherit');
			} else
				node.removeStyle(name);
		} else {
			// IE needs to remove counter-reset first, or else setStyle will take no effect.
			if (CKEDITOR.env.ie)
				node.removeStyle(name);
			node.setStyle(name, value);
		}
	},
	
	/**
	 * Overrides 'concord.text.MsgUtil.normalize', which removes all SPANs that are "empty." Instead (for Presentations), let's add
	 * some legitimate "empty" data (if they're *really* empty).
	 * 
	 * @param node
	 */
	normalize : function( node ) {
		if (!window.g_noimprove) return;
		
        if (!node)
            return;
        node.$.normalize();
        MSGUTIL.normalizeFix(node);
        var spans = node.$.querySelectorAll("span");
        for (var i = 0; i < spans.length; i++)
        {
            var span = new CKEDITOR.dom.element(spans[i]);
            var text = PresCKUtil.getImmediateText( span );
            if ( !MSGUTIL.isBookMark(span) && (text == null || text.length == 0)) {
                // the SPAN is empty. add some legitimate empty data.
                span.appendText( '\u200B' ); // Unicode zero-character white space (8203)
            }
        }
	}
});

(function(){
        MSGUTIL = new concord.pres.MsgUtil();   
})();
