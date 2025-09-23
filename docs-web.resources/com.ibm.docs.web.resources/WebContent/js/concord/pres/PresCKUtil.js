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

dojo.provide("concord.pres.PresCKUtil");
dojo.require("concord.pres.ListUtil");
dojo.require("concord.util.presFontUtil");
dojo.require("concord.pres.PresTableUtil");
dojo.require("concord.pres.PresGrpUtil");
dojo.declare("concord.pres.PresCKUtil", null, {
        
    constructor: function() {
        //Adding presentation specific messages to PresCKUtil 
    	this._checkTimer = null;
    	this._callbacks = [];
    },
    
   specialKey: { /*Backspace*/ 8:1, /*ENTER*/ 13:1, /*Space*/ 32:1, /*Delete*/ 46:1, /*IME*/ 229:1, /*IME*/ 0:1},
   connectorShapeTypes: {'line' : 1, 'straightConnector1' : 1,
       'bentConnector2' : 1, 'bentConnector3' : 1, 'bentConnector4' : 1, 'bentConnector5' : 1,
       'curvedConnector2' : 1, 'curvedConnector3' : 1, 'curvedConnector4' : 1, 'curvedConnector5' : 1},
   keyDowningMap : [],//if key in this map, means the key not "up", it is continue be pressed
   bEnableHandleDeleteInKeyUp : false,
   bEnableHLink: false,
   editFlag: "is_edited",
   
   setKeyDown: function(keyStroke,bDown)
   {
	   if(bDown)
		   this.keyDowningMap[keyStroke] = true;
	   else
		   this.keyDowningMap[keyStroke] = false;
   },
   
   isKeyDown: function(keyStroke)
   {
	   return this.keyDowningMap[keyStroke]?true:false;
   },

   MasterClassMap : [],//to store master class css name, for searching performance enhancement
   
    getFirstContentFromBody: function(node) {
    	// drill down and find first p  ul ol or table
		while (node.nodeName.toLowerCase() != 'p' && node.nodeName.toLowerCase() != 'ul' && node.nodeName.toLowerCase() != 'ol' && node.nodeName.toLowerCase() != 'table' && node.firstChild) {
			node = node.firstChild;
		}
		return node;
    },
    
    getBody: function(node) {
		//drill up and if you see p, li or table leave alone
    	var tmpNode = node;
		while (node.nodeName.toLowerCase() != 'body' && node.parentNode) {
			if (tmpNode.nodeName.toLowerCase()=='p' || tmpNode.nodeName.toLowerCase()=='ul' || tmpNode.nodeName.toLowerCase()=='ol' || tmpNode.nodeName.toLowerCase()=='table'){
				return null;
			}
			node = node.parentNode;
		}
    	return node;
    },
    
    getContentBoxByDrawFrameID: function(dfID){
    	var slideEditor = pe.scene.slideEditor;
    	for(var i = 0, len = slideEditor.CONTENT_BOX_ARRAY.length; i < len; i++){
			var cb = slideEditor.CONTENT_BOX_ARRAY[i];
			if(cb.mainNode.id == dfID){
				return cb;
			}
    	}
    	return null;
    },

    // do 2 things:
    // 1. sort the resultCssArr using css index
    // 2. join the css using \n
    getCssStrFromCssArr: function(resultCssArr) {
        resultCssArr.sort(function(a, b) {
            var key1 = a[1], key2 = b[1];
            return key1 - key2;
        });
        var resultCssStr = '';
        var concordPrefix = '.concord ';
        for (var k = 0, len = resultCssArr.length; k < len; ++k) {
            var value = resultCssArr[k];
            value = value[0]; // get css array
            for (var i = 0, cssLen = value.length; i < cssLen; ++i) {
                resultCssStr += '\n' + (concordPrefix + value[i]);
            }
        }
        return resultCssStr;
    },

     getAllClassesStr: function(dfc) {
        var totalClassArr = [];
        dojo.forEach(dojo.query('*', dfc),
                function(item) {
                    var classArr = dojo.attr(item, 'class').split(' ');
                    totalClassArr = totalClassArr.concat(classArr);
                }
        );
        return totalClassArr;
    },

    // there can be below cases in css:
    // 1 .concord .ML_u28_Default_29__20_Title_20_Master_outline_1 {} - using space to split
    // 2 .concord .ML_u28_Default_29__20_Title_20_Master_outline_1:before {}  - using :
    // 3 .concord .ML_u28_Default_29__20_Title_20_Master_outline_1[style*="direction: rtl"]:before {} - using [
    getKey: function(key) {
        for (var i = 0, len = key.length; i < len; ++i) {
            var ch = key[i];
            if (ch == ' '
                || ch == ':'
                || ch == '[') {
                return key.slice(0, i);
            }
        }
        return key;
    },

    parseCss: function(cssStr) {
        cssStr = cssStr.replace(/\.concord/g, '');
        cssStr = cssStr.replace(/[\r\n\t]/g, '');
        var cssMap = {};
        var allStr = cssStr.split('}');
        for (var len = allStr.length, i = 0; i < len; ++i) {
            var pos = allStr[i].indexOf('{');
            if (pos != -1) {
                var key = allStr[i].substring(0, pos).trim();
                key = PresCKUtil.getKey(key);
                if (typeof cssMap[key] == 'undefined') {
                    var arr = [].concat(allStr[i] + '}');
                    cssMap[key] = [arr, i]; // 1st: css arr, 2nd: css index
                } else {
                    var arr = cssMap[key];
                    arr[0] = arr[0].concat(allStr[i] + '}');
                }
            }
        }
        return cssMap;
    },

    parseExternalCss: function(cssNode) {
        var cssStr = '';
        if (cssNode.styleSheet)
            cssStr = cssNode.styleSheet.cssText;
        else
            cssStr = cssNode.textContent;
        var cssMap = PresCKUtil.parseCss(cssStr);
        return cssMap;
    },

    parseInternalCss: function(cssNode) {
        var cssStr = '';
        if (dojo.isIE) {
            // outerHTML starts with <style type="text/css">
            cssStr = cssNode.innerHTML;
        } else {
            cssStr = cssNode.textContent;
        }
        var cssMap = PresCKUtil.parseCss(cssStr);
        return cssMap;
    },


    /**
     * CK provide "is" function to check the type of node, 
     * but only limited to element node, this function could also check text node.
     * So, please try this one other than CK "is" function.
     * @param node : can be either ck node or native node.
     * @param compareNodeName : e.g. 'p', 'td', 'tr'
     * @returns
     * @tag automation test needed
     */
    checkNodeName: function(node, compareNodeName){
    	if(!node || !compareNodeName)
    		return false;
    	
    	if(!node.$)
    		node = new CKEDITOR.dom.node(node);
    	
    	if(node.type === CKEDITOR.NODE_ELEMENT){
    		var args = Array.prototype.slice.call(arguments, 1);
    		for(var i = 0, len = args.length; i < len; i++){
    			if(!args[i])
    				continue;
    			var tmp = args[i].toLowerCase();
    			if(node.is(tmp))
    				return true;
    		}
    	}
    	else{//text node
    		var args = Array.prototype.slice.call(arguments, 1);
    		for(var i = 0, len = args.length; i < len; i++){
    			if(!args[i])
    				continue;
    			var tmp = args[i].toLowerCase();
        		if(tmp.toLowerCase() === "#text")
        			return true;
    		}
    	}
    	return false;	
    },
    
    isNodeInList: function(node) {
        while(!PresCKUtil.checkNodeName(node,
                                        'p','li','ol','ul')) {
            node = node.getParent();
        }

        return PresCKUtil.checkNodeName(node, 'li','ol','ul');
    },

    fixListCursor: function(ranges, node) {
    	var listCursorPos = CKEDITOR.POSITION_BEFORE_END;
    	var nodeName = node.nodeName.toLowerCase();
    	if (nodeName == 'ol' || nodeName == 'ul') {
    		// If the cursor is at the list level, drill down through all the sublists
        	while (node && node.nodeName.toLowerCase() != "span" && node.nodeType != CKEDITOR.NODE_TEXT && node.lastChild)
        		node = node.lastChild;
    	} else if (nodeName == 'li') {
    		// D15085 If the cursor is at the LI level, first try to find a valid SPAN or BR by the offset
    		var offset = ranges[0].startOffset;
    		var childAtOffset = node.children[offset];
    		//Wangzhe >>>>===================
    		if (offset >= 0 && childAtOffset && childAtOffset.nodeName && 
    		//<<<=====================
    				(childAtOffset.nodeName.toLowerCase() == 'span' || childAtOffset.nodeName.toLowerCase() == 'br')) {
    			node = childAtOffset;
    			listCursorPos = CKEDITOR.POSITION_BEFORE_START;
    		} else {
        		// ... otherwise find the last element which is not a sublist
        		node = node.lastChild? node.lastChild : node;
        		while (node && (node.nodeName.toLowerCase() == 'ul' || node.nodeName.toLowerCase() == 'ol'))
        			node = node.previousSibling;
    		}
    	}

    	if (node && node.nodeName.toLowerCase() == "br")
    		listCursorPos = CKEDITOR.POSITION_BEFORE_START;

    	var ckNode = new CKEDITOR.dom.node(node);
    	ranges[0].setStartAt(ckNode, listCursorPos);
    	ranges[0].setEndAt(ckNode, listCursorPos);
    },
    
    fixRanges: function(ranges){  	
    	//Let's check and fix the end container    	
    	if((ranges.length > 0) && ranges[0].startContainer)
    	{
    		//D14458 - Do not take focus away from pasteBin
    		if (ranges[0].startContainer.type==CKEDITOR.NODE_ELEMENT && ranges[0].startContainer.$.id == 'cke_pastebin'){
    			return ranges;
    		}
    		
	    	var endNode = ranges[0].endContainer.$;
	    	var endNodeOffSet = ranges[0].endOffset;	    		    	
	    	if (endNode.nodeName.toLowerCase()=='body'){
	    		endNode = this.getFirstContentFromBody(endNode);
	    		endNode = endNode.parentNode.lastChild;
	    		endNodeOffSet = endNode.childNodes.length;
	    		ranges[0].endOffset = endNodeOffSet; 		 					
	    		ranges[0].endContainer=new CKEDITOR.dom.node(endNode);  
	    		//ranges[0].select();
	    	} else if (endNode.nodeName.toLowerCase()=='div'){  
	    		endNode = this.getBody(endNode); 
	    		if (endNode!=null){
	    			endNode = this.getFirstContentFromBody(endNode);
	    			endNode = endNode.parentNode.lastChild;
	    			
	    			var endNodeName = endNode.nodeName.toLowerCase();
	    			if ((endNodeName == 'ul' || endNodeName == 'ol') && (ranges[0].collapsed)) {
	    				// Do not position the cursor at the UL or OL level, move to the last span of the list
	    				PresCKUtil.fixListCursor(ranges, endNode);
	    			} else {
	    				endNodeOffSet = endNode.childNodes.length;
	    				ranges[0].endOffset = endNodeOffSet; 		 					
	    				ranges[0].endContainer=new CKEDITOR.dom.node(endNode);
	    			}
	    			//ranges[0].select();
	    		}    		
	    	} else if (endNode.nodeName.toLowerCase() == 'li' && ranges[0].collapsed) {
	    		// Do not position the cursor at LI element, find a span inside the LI
	    		PresCKUtil.fixListCursor(ranges, endNode);
	    	}
	    	
	    	//Let's check and fix the start container
	    	var startNode = ranges[0].startContainer.$;
	    	var startNodeOffSet = ranges[0].startOffset;
	    	if (startNode.nodeName.toLowerCase()=='body'){
	    		startNode = this.getFirstContentFromBody(startNode);
	    		startNode = startNode.parentNode.firstChild;
	    		startNodeOffSet = 0;
	    		ranges[0].startOffset = startNodeOffSet; 		 					
	    		ranges[0].startContainer=new CKEDITOR.dom.node(startNode);    
	        	//ranges[0].select();
	    	} else if (startNode.nodeName.toLowerCase()=='div'){  
	    		//drill up and if you see p or li leave alone
	    		startNode = this.getBody(startNode); 
	    		if (startNode!=null){
	    			startNode = this.getFirstContentFromBody(startNode);
	    			startNode = startNode.parentNode.firstChild;
	    			startNodeOffSet = 0;
	    			ranges[0].startOffset = startNodeOffSet; 		 					
	    			ranges[0].startContainer=new CKEDITOR.dom.node(startNode);
	    	    	//ranges[0].select();
	    		}    		
	    	}
	    	
	    	// if the range is collapsed, and our end (and start) container points
	    	// past any valid node (which can happen if you click past the last node
	    	// in a text box [especially in IE]).
	    	if (ranges[0].collapsed) {
	    	    endNode = ranges[0].endContainer;
	    	    endNodeOffSet = ranges[0].endOffset;
	    	    if ( endNode.type == CKEDITOR.NODE_ELEMENT ) {
	    	        var numKids = MSGUTIL.getChildCount( endNode );
	    	        // D8555
	    	        if (numKids < endNodeOffSet) {
	    	            // since the index is 0-based, we need to subtract 1
	    	            ranges[0].endOffset = numKids <= 0 ? 0 : numKids - 1;
	    	            ranges[0].startOffset = numKids <= 0 ? 0 : numKids - 1;
	    	        }
	    	    } else if ( endNode.type == CKEDITOR.NODE_TEXT ) {
	    	        // I've noticed that this can be a problem in text nodes, too.
	    	        // XXX - special case for Safari (for now) since the code below fixes issues only found on Safari.
	    	    	if (dojo.isWebKit) {
		    	        var txtLen = MSGUTIL.getNodeLength( endNode );
		    	        if ((dojo.isMac && ((txtLen+1) < endNodeOffSet)) || (!dojo.isMac && (txtLen < endNodeOffSet))) {
		    	            ranges[0].endOffset = txtLen <= 0 ? 0 : txtLen;
		    	            ranges[0].startOffset = txtLen <= 0 ? 0 : txtLen;
		    	        }
		    	    }
	    	    }
	    	}
	    	
	    	
	    	// D8261
	    	// Special case when the user is selecting the last word of a block
	    	// i.e: aaa bbb ccc   and the user wants to select ccc and apply style 
	    	// in FF the entire line would get the style.
	    	// This seems to be triggered in FF when there is a br node that is next sibling to the span
	    	//
	    	if (!ranges[0].collapsed && dojo.isFF){
	    	    endNode = ranges[0].endContainer;
	    	    endNodeOffSet = ranges[0].endOffset;
	    	    startNode = ranges[0].startContainer;
	    	    startNodeOffSet = ranges[0].startOffset;
	    	    var br = (endNode.type   == CKEDITOR.NODE_ELEMENT) ? endNode.getChild(endNodeOffSet): null; 	    	    
	    	    if ( br!=null && br.is!=null && br.is('br')				  &&
	    	    	 startNode.type == CKEDITOR.NODE_TEXT                 &&	    	    	 
	    	    	 endNodeOffSet  != startNode.getParent().getIndex()   &&	
	    	    	 dojo.isDescendant(startNode.$,endNode.$)) {
	    	    		//console.log('========= > FIX RANGES end of line text selection detected');
    	    			var lastSpan = (br.$.previousSibling.nodeName.toLowerCase()=='span')? br.$.previousSibling : PresCKUtil.getImmediateLastSpanChildFromNode(endNode.$);
    	    			
    	    			//var lastSpanCK =  new CKEDITOR.dom.node(lastSpan.lastChild);
    	    			var lastSpanCK =  new CKEDITOR.dom.node(lastSpan.lastChild ? lastSpan.lastChild : lastSpan);
    	    			//17300, lastSpanCK could be a text node or a span, so adjusting the endOffset accordingly
    	    			if(lastSpanCK!=null && lastSpanCK.type == CKEDITOR.NODE_TEXT){
    	    				var txtLength = lastSpanCK.getLength();
    	    				ranges[0].endOffset = txtLength;
    	    			}else if(lastSpanCK!=null && lastSpanCK.type ==CKEDITOR.NODE_ELEMENT){
    	    				var numChildren = lastSpanCK.getChildCount();
    	    				ranges[0].endOffset = numChildren;
    	    			}    	    		
	    	    		ranges[0].endContainer = lastSpanCK;
	    	    }	    			    		
	    	}
    	}
    	// 9268 when setting a custom color in IE the range gets moved
    	// to a text node at the end of the previousSibling of the newly created span
    	// so move the cursor back to the newly created span
    	if (dojo.isIE && ranges[0].collapsed ){
    		var container = ranges[0].startContainer, offset = ranges[0].startOffset;
    		if( container.type == CKEDITOR.NODE_TEXT && offset >= container.getLength() && !container.getNext()){
    			//is end of a text node
	    		var nextParentSibling = container.getParent().getNext();
	    		if ( nextParentSibling  && nextParentSibling.type == CKEDITOR.NODE_ELEMENT 
	    				&& nextParentSibling.getName()=='span' && nextParentSibling.getChildCount()==0) {
	    			//move to next empty span
	    				ranges[0].moveToElementEditStart(nextParentSibling);
	    		}	
    		}
    	} 	     	
    	// Ensure we select new range in case native range is referenced down stream.
    	return ranges;
     },
     
     
     //
     // Detects if range includes all content    
     //
     checkIfAllSelected: function(editor, ranges){
    	 if ( editor && !editor.ctrlA && !ranges[0].collapsed ) {
    		 var dfc = PresCKUtil.getDFCNode(editor); 
    		 if (dfc!=null){
        		 var startNode = PresCKUtil.getFirstSpan(ranges[0].startContainer.$,true); //Gets first span in startContainer
        		 var endNode = PresCKUtil.getLastSpan(ranges[0].endContainer.$,true);      //Gets last span in endContainer
        		 var startOffset = ranges[0].startOffset;
        		 var endOffset = ranges[0].endOffset;
        		 var spansList = dfc.getElementsByTagName('span');
        		         		        		 
        		 if (spansList!=null && spansList.length>0){
        			 // 1- Let's identify the first span 
        			 //    and the last span in the DFC        			 
            		 var firstSpan = spansList[0];  // First editable span under DFC
            		 var lastSpan = spansList[spansList.length-1];  // last editable span under DFC
            		 
        			 // 2- Let's set flags that will help determine 
        			 //    if this is a select all	 
            		 var isFirstSpanInRange          = false;  //means the first editable span is in the range
            		 var isLastSpanInRange           = false;  //means the last editable span is in the range
            		 var isAllTxtInStartContainer    = true;   //means all the text in the startContainer span has been selected
            		 var isAllTxtInEndContainer      = true;   //means all the text in the endContainer span has been selected

        			 // 3- Let's first check if all text in the start and endContainer have been selected
        			 //   if all the text in the span has not been selected then we know this is not a select All     		 
            		 if (ranges[0].startContainer.type == CKEDITOR.NODE_TEXT){
            			 if (startOffset !=0){
            				 isAllTxtInStartContainer = false;
            			 }            			 
            		 }
            		 if (ranges[0].endContainer.type == CKEDITOR.NODE_TEXT){
            			 if (endOffset < ranges[0].endContainer.$.nodeValue.length){
            				 isAllTxtInEndContainer = false;
            			 }            			 
            		 } 
            		 if (!isAllTxtInStartContainer || !isAllTxtInEndContainer){ //If there are some text left out of the range then we now this is not a select all
            			 return false;
            		 }     
            		            		 
            		 // 4- By this point startNode and endNode should be spans
            	    var _ckstartNode = PresCKUtil.ChangeToCKNode(startNode);
            	    var _ckfirstSpan = PresCKUtil.ChangeToCKNode(firstSpan);
        			 if (_ckstartNode && _ckstartNode.equals && _ckstartNode.equals(_ckfirstSpan)){
        				 isFirstSpanInRange=true;
        			 } else{
        				 return false;
        			 }
             	    var _ckendNode = PresCKUtil.ChangeToCKNode(endNode);
            	    var _cklastSpan = PresCKUtil.ChangeToCKNode(lastSpan);
        			 if (_ckendNode && _ckendNode.equals && _ckendNode.equals(_cklastSpan)){ 
        				 var nSelection = editor.window.$.getSelection();
        				 if (nSelection && nSelection.containsNode(lastSpan.childNodes[lastSpan.childNodes.length-1],lastSpan.childNodes.length-1)){
        					 isLastSpanInRange=true;
        				 }
        			 } else {
        				 return false;
        			 }            		 
            		 return(isFirstSpanInRange && isLastSpanInRange);
        		 }    			 
    		 }
    	 }
    	 return false;
     },
 
     //
     // Detect if range contains a given     
     //
     checkIfNodeInRange: function(editor,node,selection,dfc,spans){
    		 if (node!=null){
     			 var ranges = selection.getRanges();
        		 var startNode = selection.getStartElement().$; //Gets first span in startContaine        		 
        		 var endNode = (ranges[0].collapsed) ? startNode.$ : PresCKUtil.getLastSpan(ranges[0].endContainer.$,true);
        		 
        		 var spanList = (spans)? spans :  dfc.getElementsByTagName('span');
        		 var startNodeReached = false;
        		 var endNodeReached = false;
        		 var nodeToSeekReached = false;

        		 //Let's adjust endNode if needed
        		 var invalidEndNode = false;
        		 if (ranges[0].endContainer.$.nodeName.toLowerCase()=="span" && ranges[0].endOffset==0){ //This means that entire span is selected.
        			 //If entire span is selected then let's make sure that span text is in selected text 
            		 var selectedText = selection.getSelectedText();
            		 var endContainerSpanText = TEXTMSG.getTextContent(ranges[0].endContainer.$);
            		 if (selectedText.indexOf(endContainerSpanText) < 0){
            			 invalidEndNode = true;
            		 }
        		 }
        		 
        		 if (node===startNode){
        			 return true;
        		 }
        		 if (startNode.localName == 'br' && node.nextSibling == startNode){
        			 //if start node is from a 'br',ignore this element
        			 //for defect 16661
        			 return false;
        		 }
        		 
        		 for (var i=0; i< spanList.length;i++){
        			 var span = spanList[i];        			 
        			 if (span === startNode || 
        					 (startNode.localName == 'br' && span.nextSibling == startNode)){ // Start node reached
        				 startNodeReached =true;
        				 if (nodeToSeekReached){
        					 return false;
        				 }         				         				 
        			 }
        			 if (span === endNode){
        				 endNodeReached = true;
        				 if (node===endNode && startNodeReached && !invalidEndNode){ //if node is endNode and if range is in just one span
        					 return true;
        				 }
        				 if (node===endNode && startNodeReached && invalidEndNode){ //if node is endNode and if range is in just one span
        					 return false;
        				 }
        				 if (!nodeToSeekReached){
        					 return false;
        				 }
        			 }
        			 if (span === node){ //node to seek reached
        				 nodeToSeekReached = true;
        				 if (startNodeReached && endNodeReached){ //start node reached but end node not reached
        					 return false;
        				 } else if (startNodeReached && !endNodeReached){
        					return true;
        				 } else if (!startNodeReached){
        					 return false;
        				 }        				 
        			 } 
        		 }        		 
    		 }    	 
    	 return false;
     },
     
     //
     // returns draw_frame_classes for non tables
     // and returns tbody for tables
     // returns null for anything else
     //
     getDFCNode: function(editor){
    	if(!editor)
    		editor = window['pe'].scene.getEditor();
 		var body = editor.document.$.body;
 		var dfc = (body.firstChild)? body.firstChild :null;	
 		
 		if (dfc==null){
 			return dfc;
 		}
 		
 		if (editor.isTable==false) {					
	 		while(dfc && dfc.nodeName.toLowerCase() != 'div') {
	 			dfc = dfc.nextSibling;
	 		}
	 		if (dfc==null) {
	 			return dfc;
	 		}
 		}
 					
 		dfc = (dfc.firstChild) ? dfc.firstChild : null;		
 		
 		if (dfc!=null && editor.isTable==false && dfc.nodeName.toLowerCase()!="div"){
 			dfc = null;
 		} 
 		
 		if(dfc!=null && editor.isTable==true && dfc.nodeName.toLowerCase()!="tbody"){
	 		while(dfc && dfc.nodeName.toLowerCase() != 'tbody') {
	 			dfc = dfc.nextSibling;
	 		}
 		}
 		body = null;
 		return dfc;
     },

    doesNodeNeedFixForList: function(dfc) {
        // node has ul but no li, so need to fix
        var bNeedFixList =
            (dfc.childNodes.length == 1)
            && (dfc.firstChild.nodeName.toLowerCase()=='ol'
                || dfc.firstChild.nodeName.toLowerCase()=='ul')
            && dojo.query('li',dfc).length == 0; // D16581 do nothing when it contains li
        return bNeedFixList;
    },
    
    checkEmptyPlaceholder: function(drawFrameNode){
		var ckDrawFrameNode = PresCKUtil.ChangeToCKNode(drawFrameNode);
		var isPlaceholder = dojo.attr(ckDrawFrameNode.$,'presentation_placeholder');
		var presClass = dojo.attr(ckDrawFrameNode.$,'presentation_class');
		var isEmptyPlaceholder = false;
		var LineItems = dojo.query('li,p',ckDrawFrameNode.$);
		if (LineItems.length==1 && 
				(dojo.hasClass(LineItems[0],'cb_title') ||
				 dojo.hasClass(LineItems[0],'cb_subtitle') ||
				 dojo.hasClass(LineItems[0],'cb_outline') ||
				 dojo.hasClass(LineItems[0],'cb_graphic'))){
			// it's a empty placeholder
			isEmptyPlaceholder = true;
		}
					
		if (isPlaceholder == 'true' && 
				(isEmptyPlaceholder || presClass == 'graphic'))
			return true;
		
		return false;
	},

     // Checks if draw_frame_classes (dfc) node in editor is empty
     // Will handle and fix if dfc node contains empty content
     // Usually called after a CTRLA followed by a delete key or backspace
     // When this function is done there should be a proper, clean DFC structure with valid p or ul/ol under the DFC
    checkForEmptyContent: function(editor){
        var dfc = PresCKUtil.getDFCNode(editor);
        if (dfc!=null){
            if(this.doesNodeContainText(dfc)){ // does dfc contain text if so do nothing since dfc is not empty
                return;                    //**We may need to check if text is in a p, li or table
            }else if (PresCKUtil.isNodeEmpty(dfc)){// we know it does not have text but may still have child nodes.. if empty lets add p or li
                this.fixEmptyNodeAfterDelete(editor,dfc);
            }else if (dfc.childNodes.length >=1){//it has more than one child but no text we need to empty out dfc and fix with default p or li
                //this may still be a valid table let's check
                // in the case of table and backspace after delete.. we will get a tbody
                if (dfc.nodeName.toLowerCase() != 'tbody'){
                    //D9701 - This is the case where we have an empty ul or ol under the dfc with no text. 
                    // Let restore and add proper li under ul or ol
                    var bNeedFixForList = PresCKUtil.doesNodeNeedFixForList(dfc);
                    if (bNeedFixForList) {
                        var parentList = dfc.firstChild;
                        PresCKUtil.removeAllChildren(parentList);
                        PresCKUtil.addDefaultLi(new CKEDITOR.dom.element(parentList));
                        editor.contentBox.cleanBodyChildren();
                        var sel = editor.getSelection();
                        editor.contentBox.moveCursorPositionToLastNode(sel);
                        return;
                    }                                                 
                    
                    //D16581 Let's check if contains user line breaks
                    if (PresCKUtil.doesNodeContainUserLineBreaks(dfc)){
                        //If yes content seems empty but is not since it contains user line breaks
                        return;
                    }
                    
                    PresCKUtil.removeAllChildren(dfc);
                    PresCKUtil.fixEmptyNodeAfterDelete(editor,dfc);
                }
            } else{ //* handle any thing else here
                console.log('sth is wrong when checkForEmptyContent');
            }
        }else{// dfc is null so let's add it back
            PresCKUtil.addDFC(editor);
        }
    },
 	
 	
 	//
 	//delete all children of node 
    //
 	removeAllChildren: function(node){
 		for (var i=node.childNodes.length-1; i>=0; i--){
 			var childNode = node.childNodes[i];
			dojo.destroy(childNode);
 		} 	 		
 	},
 	
 	//[Public API]
 	//Initailize Independent Paragraphs
 	//This function will split original List structure into independent list
 	//Such as
 	/*<UL>								<UL>
 	 * 	<LI>								<LI>
 	 * 		<Span>A								<Span>A
 	 * 		<Span>Z								<Span>Z
 	 * 	<LI>
 	 * 		<Span>B           ==>   	<UL>
 	 * 		<UL>							<LI>
 	 * 			<LI>							<Span>B
 	 * 				<Span>C				<UL>
 	 * 										<LI>
 	 * 											<UL>
 	 * 												<LI>
 	 * 													<Span>C
 	 * 
 	 * =====
 	 * <P> also could be treated, it will keep unchange
 	 * <UL>
 	 * <P>
 	 * <OL>
 	 * */
 	GenerateIndependentParagraphs: function(paraRoot)
 	{
 		//////////////////////////////////////////////////////////////////
 	 	BuildIndependentParagraphs = function(nodeLI,newParaRoot){
 	 		var levelNumber = 0;
 	 		var newCurNode = null;
 	 		var newParentNode = null;
 	 		var curNode = nodeLI;
 	 		while( curNode && curNode.is && curNode.is('ol','ul','li')){
 	 			if(newCurNode == null){
 	 				newCurNode = curNode.clone();
 	 				//Move all child(except ol/ul) of curNode into newCurNode
 	 		 		var children = curNode.getChildren();
 	 		 		var childList = [];
 	 				for ( var i = 0, count = children.count(); i < count; i++ )	
 	 				{
 	 					var child = children.getItem( i );
 	 					if(!child.is('ol','ul'))
 	 						childList.push(child);
 	 				}
 	 				for(var i in childList)
 	 					newCurNode.append(childList[i]);
 	 			}
 	 			else
 	 				newCurNode = newParentNode;
 	 			curNode = curNode.getParent();
 	 			if(curNode.is('div'))
 	 				break;
 	 			newParentNode = curNode.clone();
 	 			newParentNode.append(newCurNode); 
 	 			if(newParentNode.is('ol','ul'))
 	 				levelNumber++;
 	 		}
 	 		//newParentNode.setAttribute('LevelNumber',levelNumber);
 	 		//Put it under new root
 	 		newParaRoot.append(newParentNode);
 	 	};
 	 	//[Internal private function]Should never be called publicly!!
 	 	TravelListNodeTree = function(nodeOUL,newParaRoot)
 	 	{
 	 		var children = nodeOUL.getChildren();
 	 		var childList = [];
 			for ( var i = 0, count = children.count(); i < count; i++ )	
 				childList.push(children.getItem( i ));

 			for(var i in childList)
 			{
 				var child = childList[i];
 	 			if(child.is('li'))
 	 			{
 	 				BuildIndependentParagraphs(child,newParaRoot);
 	 				var grandChildren = child.getChildren();
 	 				var grandChildList = [];
 	 				for ( var j = 0, jcount = grandChildren.count(); j < jcount; j++ )	
 	 					grandChildList.push(grandChildren.getItem( j ));

 	 				for(var j in grandChildList)
 	 				{
 	 		 			if(grandChildList[j].is('ol','ul'))
 	 		 				TravelListNodeTree(grandChildList[j],newParaRoot);
 	 				}
 	 			}
 			}
 	 	};
 	 	
 	 	if(!paraRoot || !paraRoot.is || !paraRoot.is('div','td'))
 	 	{
 	 		console.log('GenerateIndependentParagraphs : parameter div is not right!');
 	 		return null;
 	 	}
 			
 		var newParaRoot = paraRoot.clone();
 		//At last, we need remove the old divRoot
 		//divRoot.getParent().append(newDivRoot);
 		//Get the RootNode, it must be a div
 		//Then check eachChild of divRoot
 		var children = paraRoot.getChildren();
 		var childList = [];
		for ( var i = 0, count = children.count(); i < count; i++ )	
		{
			var child = children.getItem( i );
				childList.push(child);
		}
		
		for(var i in childList)
		{
			var child = childList[i];
 			if(child.is('ol','ul'))
 				TravelListNodeTree(child,newParaRoot);
 			else if(child.is('p'))//keep <p> unchange
 				newParaRoot.append(child);
		}

		PresCKUtil.removeAllChildren(paraRoot.$);
 		var child = newParaRoot.getFirst();
		while ( child )	
		{
			paraRoot.append(child);
			child = newParaRoot.getFirst();
		}
 		dojo.destroy(newParaRoot.$);
 		return paraRoot;
 	},
 	

 	//[API]
 	//We need merge the independent paragraphs into a simple structure
 	//Parameter is the divRoot, which contains all the independent paragraphs
 	MergeIndependentParagraghs: function(paraRoot){
 		////////////////////////////////////////////////
 		IsNodeEqual = function(Node_A,Node_B)
 		{
 			var cNode_A = Node_A.clone();
 			var cNode_B = Node_B.clone();
 			cNode_A.removeAttribute('id');
 			cNode_A.removeAttribute('RangeSelection');
 			cNode_B.removeAttribute('id');
 			cNode_B.removeAttribute('RangeSelection');
 			if(cNode_A.$.outerHTML.length != cNode_B.$.outerHTML.length)
 				return false;
 			var re = cNode_A.$.outerHTML == cNode_B.$.outerHTML;
 			if(0)
 			{
 				for(var i=0;i<cNode_A.$.outerHTML.length;i++)
 				{
 					var c_A = cNode_A.$.outerHTML.charAt(i);
 					var c_B = cNode_B.$.outerHTML.charAt(i);
 					if(c_A != c_B)
 						return false;
 				}
 			}
 			return re;
 		};
 		
 	 	
 	 	MergerToParagragh = function(targetNode,sourceNode){
 	 		getFirstOUL = function(node)
 	 		{
 	 			var re = node.getFirst();
 	 			while(re && !re.is('ol','ul','li'))
 	 				re = re.getNext();
 	 			return re;
 	 		};
 	 		
 	 		getLastOUL = function(node)
 	 		{
 	 			var re = node.getLast();
 	 			while(re && !re.is('ol','ul','li'))
 	 				re = re.getPrevious();
 	 			return re;
 	 		};
 	 		
 	 		isLeafLi = function(node)
 	 		{
	 			if(!node.is('li'))
	 				return false;
	 			if(getLastOUL(node))
	 				return false;
	 			return true;
 	 		};
 	 		
 	 		//We do not merge <p>
 	 		if(targetNode.is('p') || sourceNode.is('p'))
 	 			return false;

 	 		
 	 		//They are must root node
 	 		if(!targetNode.getParent().is('div'))
 	 			return false;
 	 		//They are must sibings
 	 		if(!targetNode.getParent().equals(sourceNode.getParent()))
 	 			return false;
 	 		
 	 		var cTargetNode = targetNode;
 	 		var cSourceNode = sourceNode;
 	 		
 	 		var cMergeTargetNode = null;
 	 		var cMergeSourceNode = null;

 	 		while( cTargetNode && cSourceNode )
 	 		{ 	
 	 			//If current node are same, we could check their child
 	 	 		if(IsNodeEqual(cTargetNode,cSourceNode))
 	 	 		{
 	 	 			cMergeTargetNode = cTargetNode;
 	 	 			cMergeSourceNode = cSourceNode;
 	 	 			
 	 	 			//Get child node
 	 	 			var cTargetNode_OULChild = getLastOUL(cTargetNode);
 	 	 			var cSourceNode_OULChild = getLastOUL(cSourceNode);
 	 	 			var bLeafTarget = isLeafLi(cTargetNode_OULChild);
 	 	 			var bLeafSource = isLeafLi(cSourceNode_OULChild);
 	 	 			
 	 	 			if( (!bLeafSource) && (!bLeafTarget))
 	 	 			{//both not leaf node, continue
 	 	 	 			cTargetNode = cTargetNode_OULChild;
 	 	 	 			cSourceNode = cSourceNode_OULChild;
 	 	 			}
 	 	 			else //we should check whether could final merge
 	 	 			{
 	 	 				if( bLeafTarget && !bLeafSource )
 	 	 	 			{
 	 	 					if(IsNodeEqual(cTargetNode_OULChild,cSourceNode_OULChild))
 	 	 					{
 	 	 	 	 	 			cMergeTargetNode = cTargetNode_OULChild;
 	 	 	 	 	 			cMergeSourceNode = cSourceNode_OULChild;
 	 	 					}
 	 	 	 			}
 	 	 				break;
 	 	 			}

 	 	 		}
 	 	 		//Otherwise, break loop
 	 	 		else break;
 	 		}
 	 		
	 	 	if(cMergeTargetNode && cMergeSourceNode)
 	 		{
	 	 		if(cMergeTargetNode.equals(cMergeSourceNode))
	 	 			return false;
	 	 			
	 	 	 	for(var child = cMergeSourceNode.getFirst();
	 	 	 		child;
	 	 	 		child = cMergeSourceNode.getFirst())
	 	 	 	{
	 	 	 		cMergeTargetNode.append(child);
	 	 	 	}
 	 	 		//Then we destroy the curNode
 	 	 		dojo.destroy(sourceNode.$);
 	 			return true;
 	 		} 
 	 		
 			return false;
 	 	};
 		//////////////////////////////////////////////////
 	 	
 	 	var curParagraph = paraRoot.getFirst();
 	 	var nextParagraph = curParagraph.getNext();
 	 	while(nextParagraph)
 	 	{
 	 		var bSuccess = MergerToParagragh(curParagraph,nextParagraph);
 	 		if(bSuccess)
 	 		{	//nextParagraph must be destroied
 	 			nextParagraph = curParagraph.getNext();
 	 		}
 	 		else
 	 		{
 	 			//Move current paragraph to next, since it do not match the merge
 	 	 		curParagraph = nextParagraph;
 	 	 		nextParagraph = nextParagraph.getNext();		
 	 		}
 	 	}
 		return true;
 	},

 	
    /*
    * Merges the 'prev' and 'next' SPAN nodes (provided they have the same / close definition)
    */
    mergeAdjacentSpans : function( prev, next, range ) {
        if ( !prev || !next )
            return prev;
        var mergeNodes = false;
        // are they SPANs?
        if ( prev.is && prev.is( 'span' ) && next.is && next.is( 'span' ) ) {
            var prevStyle = prev.getAttribute( 'style' ),
                prevStyles = prevStyle ? MSGUTIL.getStyleParas( prevStyle ) : {},
                nextStyle = next.getAttribute( 'style' ),
                nextStyles = nextStyle ? MSGUTIL.getStyleParas( nextStyle ) : {},
                emptyStyles = !prevStyle && !nextStyle;
            // if we previously split 'text_p' or 'text_span' SPANs, we would have dropped
            // Txx / Pxx classes from one of them, so we can't compare all classes
            if ( ( prev.hasClass( 'text_p' ) && next.hasClass( 'text_p' ) ) ||
                 ( prev.hasClass( 'text_span' ) && next.hasClass( 'text_span' ) ) ||
                 ( prev.getAttribute( 'class' ) == next.getAttribute( 'class' ) ) ) {
                if ( emptyStyles )
                    mergeNodes = true;
                else {
                    // D15085 if only the second of the two adjacent spans has styles, then for sure they do not match
                    var allStylesTheSame = prevStyle? true : false;
                    var colorStyleRE = /\w*color/;
                    for ( var style in prevStyles ) {
                        // font sizes could be rounded, so avoid equality comparison for that style
                        if ( style != 'font-size' ) {
                            // color-based styles *could* have RGB values (that may or may not have
                            // spaces in them). we need to "normalize" the values before we
                            // compare for equality.
                            if ( colorStyleRE.test( style ) ) {
                                var prevColorVal = prevStyles[ style ],
                                    nextColorVal = nextStyles[ style ];
                                prevColorVal = PresCKUtil.normalizeColorValue( prevColorVal );
                                nextColorVal = PresCKUtil.normalizeColorValue( nextColorVal );
                                if ( prevColorVal != nextColorVal ) {
                                    allStylesTheSame = false;
                                    break;
                                }
                            } else if ( prevStyles[ style ] != nextStyles[ style ] ) {
                                allStylesTheSame = false;
                                break;
                            }
                        }
                    }
                    
                    // D15085 if the second of the two adjacent spans has a style not present in the first span,
                    // then the styles do not match
                    for (var style in nextStyles) {
                    	if (style != 'font-size' && !prevStyles[style]) {
                    		allStylesTheSame = false;
                    		break;
                    	}	
                    }
                    
                    // we didn't find any mismatches, so now compare font sizes
                    // (to see if "close enough")
                    if ( allStylesTheSame ) {
                        var prevFS = prevStyles[ 'font-size' ],
                            nextFS = nextStyles[ 'font-size' ];
                        if ( prevFS && prevFS.indexOf( 'em' ) >= 0 )
                            prevFS = prevFS.substring( 0, prevFS.indexOf( 'em' ) ) * 1;
                        else
                            prevFS = 1; // assume 1 em
                        if ( nextFS && nextFS.indexOf( 'em' ) >= 0 )
                            nextFS = nextFS.substring( 0, nextFS.indexOf( 'em' ) ) * 1;
                        else
                            nextFS = 1; // assume 1 em
                        
                        // rounding of file sizes could make them "close" but not equal
                        if ( PresCKUtil.areSameFontSizes( prevFS, nextFS ) )
                            mergeNodes = true;
                    }
                }
            }
        }
        
        var ret = null;
        if ( mergeNodes ) {
            var newPrev = prev.getLast(),
                newNext = next.getFirst(),
                nextChildren = [],
                nextChild = newNext && newNext.getNext(),
                validSpan = function( span ) {
                    if ( span && span.is && span.is( 'span' ) ) {
                        return span.getChildCount() > 0;
                    }
                    // if not a SPAN, assume it's "valid"
                    return true;
                };
                
            while ( !validSpan( newPrev ) ) {
                newPrev = newPrev.getPrevious();
                newPrev.getNext().remove(); // remove the invalid SPAN
            }
            while ( nextChild ) {
                nextChildren.push( nextChild );
                nextChild = nextChild.getNext();
            }
            
            ret = PresCKUtil.mergeAdjacentSpans( newPrev, newNext, range );
            // for some reason, the returned node might not be merged completely (if it's a text node that had previously
            // been merged). try to get to the correct position.
            if ( ret.type == CKEDITOR.NODE_TEXT )
                ret = ret.getParent();
            while ( ret.getNext() )
                ret = ret.getNext();
            var nextSize = nextChildren.length;
            for ( var i = 0; i < nextSize; i++ ) {
                var c = nextChildren[i];
                ret = PresCKUtil.mergeAdjacentSpans( ret, c, range );
                while ( ret.getNext() )
                    ret = ret.getNext();
            }
            // depending on where we are in the recursive call, we could either need
            // to remove the 'prev' or 'next' nodes. decide based on child count.
            if ( prev.getChildCount() == 0 ) {
                // should never happen, but just in case
                prev.remove();
                ret = next;
            } else if ( next.getChildCount() == 0 ) {
                next.remove();
            }
        } else {
            var isText = prev.type == CKEDITOR.NODE_TEXT,
                l = isText ? prev.getLength() : CKEDITOR.POSITION_AFTER_END,
                par = prev.getParent();
            ret = prev;
            if ( prev.type == next.type && isText ) {
                var prevText = prev.getText(),
                    nextText = next.getText();
                prev.setText( prevText + nextText );
                next.remove();
            } else {
                next.insertAfter( prev );
            }
            //par.$.normalize();
            
 		    // update the range
            if ( range && !range.mergeUpdated ) {
                if ( isText ) {
                    range.setStart( ret, l );
                } else {
                    range.setStartAt( prev, l );
                }
                // add flag so we don't update the range again
                range.mergeUpdated = true;
 		        range.collapse( true );
 		        range.select();
            }
        }
        return ret;
    },

 	//
 	//add dfc this function will clear the editor.body and add the correct DIvs for dfc
 	//
 	addDFC: function(editor){
 		var body = editor.document.$.body;
 		// TODO: only keep backgroundcolor here
 		var backgroundColor = '';
 		try {
 			backgroundColor = body.firstChild.firstChild
 				&& dojo.style(body.firstChild.firstChild,
 						'backgroundColor');
 		} catch (e) {
 			// should do nothing in case of failure
 		}
 		PresCKUtil.removeAllChildren(body);

 		var dfcParent = dojo.clone(editor.dfcParent);
 		var dfc = dfcParent.firstChild;
 		PresCKUtil.removeAllChildren(dfc);

 		var deletedNode = dojo.clone(editor.deleteNodeProps);
 		if (deletedNode!= null && (deletedNode.nodeName.toLowerCase()=="ul" || deletedNode.nodeName.toLowerCase()=="ol")){
 			PresCKUtil.removeAllChildren(deletedNode);
 			PresCKUtil.addDefaultLi(new CKEDITOR.dom.element(deletedNode));
 			dfc.appendChild(deletedNode);
 		} else{
 			PresCKUtil.addDefaultP(dfc);
 		}

 		//D14757
 		if (dojo.isWebKit){//For some reason we somtimes lose the font information on the body let's recapture from draw frame
 			body.style.fontSize =dojo.style(editor.contentBox.mainNode,'fontSize');
 		}

 		if (backgroundColor) {
 			dojo.style(dfc, 'backgroundColor', backgroundColor);
 		}

 		body.appendChild(dfcParent);
 		editor.contentBox.cleanBodyChildren(body); //remove any br's or unwanted tags
 		editor.contentBox.editorAdjust();
 		var sel = editor.getSelection();
 		editor.contentBox.moveCursorPositionToLastNode(sel);
 	},
 	 	
 	//
 	//adds BR hideInIE to the end of each paragraph in the DFC
 	//
 	addBR: function(editor) {
 		if (!editor)
 			return;
 		
 		// allow the node to be passed in
 		var dfc = null;
 		if ( editor.$ )
 		    // CKEditor-based DOM node
 		    dfc = editor.$;
 		else if ( editor.plugins == undefined )
 		    // not a CKEditor instance. assume it's a real DOM node
 		    dfc = editor;
 		else
 		    // the 'editor' really is the editor instance. use it
 		    dfc = this.getDFCNode(editor);
		var ps = dojo.query("p,li",dfc);
		for(var i=0;i<ps.length; i++){
			var lastNodeName = ps[i].lastChild? ps[i].lastChild.nodeName.toLowerCase() : null;
			// D15711 - skip LI elements which have sublists
			if (lastNodeName == 'ul' || lastNodeName == 'ol') {
				//D15251
				var nodeCk = new CKEDITOR.dom.node(ps[i]);
				var lastChild = nodeCk.getLast() ;
				lastChild = lastChild.getPrevious();
				//in this case we have a ul or ol with a span as the previous sibling
				//this means the br class="hideInIE" is missing
				if (lastChild && lastChild.is && lastChild.is('span')) {
					var node =  CKEDITOR.env.opera ? nodeCk.getDocument().createText('') : nodeCk.getDocument().createElement( 'br' ) ;
					node.addClass("hideInIE");
					node.insertAfter(lastChild);
				}
				continue;
			}
			
			if (ps[i].childNodes.length == 0 || lastNodeName != 'br') {
				var nodeCk = new CKEDITOR.dom.node(ps[i]);
				var lastChild = nodeCk.getLast() ;
				while ( lastChild && lastChild.type == CKEDITOR.NODE_TEXT && !CKEDITOR.tools.rtrim( lastChild.getText() ) ) {
					lastChild = lastChild.getPrevious();	
				}
				if ( ps[i].childNodes.length == 0 || !lastChild || !lastChild.is || !lastChild.is( 'br' ) ) {
					var node =  CKEDITOR.env.opera ? nodeCk.getDocument().createText('') : nodeCk.getDocument().createElement( 'br' ) ;
					if (node.type == CKEDITOR.NODE_ELEMENT) {
						node.addClass("hideInIE");
						nodeCk.append(node);
					}
				}
			}
			if (ps[i].lastChild.nodeName.toLowerCase() == 'br' && !dojo.hasClass(ps[i].lastChild, "hideInIE")) {
				var nodeCk = new CKEDITOR.dom.node(ps[i].lastChild);
				nodeCk.addClass("hideInIE");
				nodeCk.removeAttribute("_moz_dirty");
			}
		}
		dfc = null;
		nodeCk = null;
		lastChild = null;
		ps = null;
 	},
 	
	//
	// Will store attributes and classes of node to be deleted
	// in editor.deleteNodeProps object
	// This only saves props if deleteNode is an element not a text node
	//
	 setDeleteNodeProperties: function(editor){
		//Node to be deleted is represented by the endContainer node
		if (!editor.isTable){
			var dfc = PresCKUtil.getDFCNode(editor);			
			if (dfc!=null && dfc.firstChild!=null){
				var deleteNode = new CKEDITOR.dom.node(dfc.firstChild);
				
				if (deleteNode.type == CKEDITOR.NODE_ELEMENT){
					var clone = dojo.clone(deleteNode.$); // save in case we need to restore after CTRL A delete
					//D15255  Let's store styles for span, li and p					
					//1 - Get first span style info to save
					var firstSpan = PresCKUtil.getFirstNonEmptySpanAndStyles(clone, editor);
					var styleInfoForSpan = null;
					if (firstSpan && firstSpan.nodeName.toLowerCase()=='span'){
						firstSpan = CKEDITOR.dom.node(firstSpan);
						styleInfoForSpan =  firstSpan.getAttribute('style');
						if (dojo.isIE)
						{
							if (styleInfoForSpan && styleInfoForSpan.charAt(styleInfoForSpan.length-1) != ';')
								styleInfoForSpan = styleInfoForSpan + ";";
						}
						//clone.firstSpanStyle = styleInfoForSpan;					
					}
					firstSpan =null;
										
					//2 - Get first p style info to save
					var firstP = clone;
					var styleInfoForP = null;		
					if (clone && clone.nodeName.toLowerCase()=='p'){
						firstP = CKEDITOR.dom.node(firstP);
						styleInfoForP =  firstP.getAttribute('style');
						if (dojo.isIE)
						{
							if (styleInfoForP && styleInfoForP.charAt(styleInfoForP.length-1) != ';')
								styleInfoForP = styleInfoForP + ";";
						}
						//clone.firstPStyle = styleInfoForP;						
					}
					 
					//3 - Get first li style info to save
					var firstLi = clone.firstChild;
					var styleInfoForLi = null;					
					//Get first li style info to save
					if (firstLi && firstLi.nodeName.toLowerCase()=='li'){
						firstLi = CKEDITOR.dom.node(firstLi);
						styleInfoForLi =  firstLi.getAttribute('style');
						if (dojo.isIE)
						{
							if (styleInfoForLi && styleInfoForLi.charAt(styleInfoForLi.length-1) != ';')
								styleInfoForLi = styleInfoForLi + ";";
						}
						//clone.firstLiStyle = styleInfoForLi;
					} 
					firstLi = null;
					
					
					//4 - Save styles found
					clone.firstSpanStyle = styleInfoForSpan;
					clone.firstPStyle = styleInfoForP;
					clone.firstLiStyle = styleInfoForLi;
					
					clone.innerHTML = "";
					clone.id="";
					concord.util.HtmlContent.injectRdomIdsForElement(clone);
					editor.deleteNodeProps = clone;			
				}
			}
			dfc = null;
			deleteNode = null;
		} else{
			editor.deleteNodeProps = dojo.clone(editor.document.$.body.firstChild);// the table element
		}
	},
	
 	
 	//
 	// isCKNode checks if a node is native or a cknode
 	//
 	isCKNode: function(node){
 		var isCK = false;
 		if (typeof node.$ != undefined && node.$ != null){
 			isCK = true;
 		}
 		return isCK; 		
 	},
 	
 	
 	//
 	// node was empty ( i.e no children elements at all)let's fix
 	// 1) Here we can fix if node is dfc .. then add p by default if editor.deleteNodeProps not set
 	// 2) We can fix empty p tags
 	// 3) We can also fix empty ul or ol tags.
 	//
 	fixEmptyNodeAfterDelete: function(editor,node){
 		var dfc = PresCKUtil.getDFCNode(editor);
 		if (dfc && dfc.id == node.id){  // if this is dfc node then lets restore saved deleted element attributes and classes (not content)
 			if (typeof editor.deleteNodeProps !=undefined && editor.deleteNodeProps!=null){
// 				var delNode = dojo.clone(editor.deleteNodeProps);
// 				PresCKUtil.removeAllChildren(delNode);
// 				PresCKUtil.addDefaultSpan(delNode);
// 				node.appendChild(delNode);
 				//console.log('fixEmptyNodeAfterDelete : NODE IS EMPTY SO ADDING deleteNOdePROP');
 				PresCKUtil.addDFC(editor);
 			} else { //there is no saved deleted element properties then we simply restore default p as last measure
 				PresCKUtil.addDefaultP(node);
 				//console.log('fixEmptyNodeAfterDelete : NODE IS EMPTY SO ADDING default P node');
 			}
 		}else if (node && node.nodeName.toLowerCase()=='p'){
 			PresCKUtil.addDefaultSpan(node);
				//console.log('fixEmptyNodeAfterDelete : NODE IS EMPTY SO ADDING default span in P');
 		}else if (node && (node.nodeName.toLowerCase()=='ul') || (node.nodeName.toLowerCase()=='ol')){
 			PresCKUtil.addDefaultLi(new CKEDITOR.dom.element(node));
				//console.log('fixEmptyNodeAfterDelete : NODE IS EMPTY SO ADDING default UL OR LI ');
 		}
 		editor.contentBox.cleanBodyChildren();
 		var sel = editor.getSelection();
 		editor.contentBox.moveCursorPositionToLastNode(sel);
 	},
 	//
 	// Simply creates a default ul with valid li
 	//
 	addDefaultUL: function(node){
 		var str = '<ul odf_element="text:list" class="text_list lst-c"><li><span>&#8203;</span></li></ul>';
 		var ul = CKEDITOR.dom.element.createFromHtml(str);
 		node.appendChild(ul.$); 
 		PresCKUtil.removeAllChildren(ul.$);
 		PresCKUtil.addDefaultLi(ul); 				
 	},	
	
 	
 	//
 	// Simply restores a valid li
 	//
 	addDefaultLi: function(node){
 	    if (!node)
 	        return;
 	    if (!node.is || !node.is('ul', 'ol'))
 	        return;
 	    
 	    // get custom list class name from parent (OL or UL)
 	    var cName = CKEDITOR.plugins.liststyles.getListStyle ?
 	            CKEDITOR.plugins.liststyles.getListStyle( node ) : null;
 		var str = '<li class="text_list-item' + (cName ? ' ' + cName : '') + '"><span></span></li>';
 		var li = CKEDITOR.dom.element.createFromHtml(str);
 		concord.util.HtmlContent.injectRdomIdsForElement(li.$);
 		
 		var editor = window.pe.scene.getEditor();
 		//D15255 Let's see if there are styles we need to handle for li
 		if (editor.deleteNodeProps != undefined && editor.deleteNodeProps != null && editor.deleteNodeProps.firstLiStyle && editor.deleteNodeProps.firstLiStyle.length >0){
 			li.setAttribute('style', editor.deleteNodeProps.firstLiStyle);
 		}
 		//D15255 Let's see if there are styles we need to handle for span
 		if (editor.deleteNodeProps != undefined && editor.deleteNodeProps != null && editor.deleteNodeProps.firstSpanStyle && editor.deleteNodeProps.firstSpanStyle.length >0 && li.$.firstChild.nodeName.toLowerCase()=='span'){
 			dojo.attr(li.$.firstChild,'style',editor.deleteNodeProps.firstSpanStyle);
 		}
 		
 		//D4498 need to consider alignment when restoring node
 		if (editor.alignmentDef !=null && editor.alignmentDef!=undefined){
 			li.$.style.textAlign = editor.alignmentDef;
 		}
 		node.$.appendChild(li.$);
 		return li;
 	},
 	
 	//
 	// Extracts the style from the last span of the previous block item
 	//
 	getPrevBlockStyle: function(previousBlock) {
		if (previousBlock) {
			var prevBlockLastSpan = previousBlock.getLast();
			while (prevBlockLastSpan && prevBlockLastSpan.getPrevious() && prevBlockLastSpan.is && prevBlockLastSpan.is('br', 'ul', 'ol'))
				prevBlockLastSpan = prevBlockLastSpan.getPrevious();
			
			if (prevBlockLastSpan.type != CKEDITOR.NODE_TEXT ){
				return prevBlockLastSpan.getAttribute('style');
			}			
		} else
			return null;
 	},

    getBogusHtml: function() {
        return '<br class="hideInIE">';
    },

    getDefaultSpanHtml: function() {
        return '<span>&#8203;</span>';
    },

    getDefaultTextHtml: function() {
        return '<span class="newTextContent">&#8203;</span>';
    },

 	// Simply restores the default span with valid p for an empty box
 	addDefaultSpan: function(node){
 		var str = PresCKUtil.getDefaultSpanHtml()+PresCKUtil.getBogusHtml();
 		var span = CKEDITOR.dom.element.createFromHtml(str);
 		//D4498 need to consider alignment when restoring node
 		var editor = window.pe.scene.getEditor();
 		if (editor.alignmentDef !=null && editor.alignmentDef!=undefined){
 			span.$.style.textAlign = editor.alignmentDef;
 		}
 		node.appendChild(span.$);
 	},
 	
 	/**
 	 * Similar to 'addDefaultSpan' above, but uses zero-width character (8203). This is meant to be called
 	 * as a "global" function to fix any blocks (e.g. P or LI) that are missing SPANs that act as
 	 * "placeholders" for cursor positioning (i.e. as removed via 'removeInvalidSpans').
 	 */
 	fixMissingSpans: function( editor ) {
 	    if (!editor)
 	        return;
 	    
 	    dojo.forEach(
 	            dojo.query( 'P, LI', editor.contentBox.getContentEditNode() ),
 	            function( item ) {
 	                // item is a P or LI
 	                item = new CKEDITOR.dom.node( item );
 	                // the first child if 'item' *should* be a SPAN
 	                // if it's empty, direct text, or a BR, it needs to be fixed
 	                var first = item.getFirst(),
 	                    needsFixing = false,
 	                    data = '&#8203;';
 	                if ( !first )
 	                    needsFixing = true;
 	                else if ( !first.is ) {
 	                    needsFixing = true;
 	                    data = first.getText();  // preserve whatever's there
 	                    first.remove();
 	                    }
 	                //<LI>
 	                //	<OL/UL> is a legal structure
 	                else if(item.is('li') && first.is('ol','ul')){ 
 	                	needsFixing = false;
 	                } else if ( !first.is( 'span' ) ) {
 	                    needsFixing = true;
 	                } else if (first.is('span')) {
 	                	// D15516 -- check both single and nested spans for missing text node
 	                	var innerSpan = first;
 	                	while (innerSpan.getFirst() && innerSpan.getFirst().is && innerSpan.getFirst().is('span'))
 	                		innerSpan = innerSpan.getFirst();
 	                	if (innerSpan && !innerSpan.getFirst()) {
 	 	                    // we have a span or nested spans without a text node inside
// 	 	                    needsFixing = true;
 	 	                    innerSpan.remove();
 	                	}
 	                }
 	                
 	                if ( needsFixing ) {
 	                    var newSpan = CKEDITOR.dom.element.createFromHtml( '<span>' + data + '</span>', item.getDocument() );
 	                    if ( first && first.is && first.is( 'span') && !MSGUTIL.isBookMark( first ) )
 	                        first.copyAttributes(newSpan);
 	                    // D15516 -- don't copy Firefox's moz_dirty over 
 	                    if (newSpan.hasAttribute('_moz_dirty'))
 	                    	newSpan.removeAttribute('_moz_dirty');
 	                    
 	                    // D16440 -- when adding adding a placeholder span to an empty li, copy style from the last span of the previous li
 	                    if (item.is && item.is('li')) {
 	                    	prevLi = item.getPrevious();
 	                    	if (prevLi && prevLi.is && prevLi.is('li')) {
 	                    		var prevStyle = PresCKUtil.getPrevBlockStyle(prevLi);
 	                    		//defect 21476
 	                    		//font rule: parent size* child size
 	                    		//to an empty li, copy style from the last span of the previous li
 	                    		//if "font-size",set it to 1 (pfs is usd for absolute value)
 	                    		if ( prevStyle && prevStyle.indexOf("font-size")>=0){
 	                    			prevStyle = "font-size: 1em;";
 	                    		}
 	                    		if (prevStyle)
 	                    			newSpan.setAttribute('style', prevStyle);
 	                    	}
 	                    		
 	                    }
 	                    item.append( newSpan, true );
 	                }
 	            }
 	    );
 	},
 	
 	// Simply restores the default p with valid span for an empty box
 	// should be called only with dfc node to populate empty dfc
 	// #15663: need to return the new P so the caller can get a handle of it
 	// note: for memory leak to check later, if we are returning a node like this, and it is not used/caught by the caller,
 	// would it introduce memory leak
 	addDefaultP: function(node){
 	    if (!node)
 	        return;
 		var pStr = '<p odf_element="text:p" class="text_p">'+PresCKUtil.getDefaultSpanHtml()+PresCKUtil.getBogusHtml()+'</p>';
 		var pNode = CKEDITOR.dom.element.createFromHtml(pStr);
 		concord.util.HtmlContent.injectRdomIdsForElement(pNode.$);
 		var editor = window.pe.scene.getEditor();
 		
 		//D15255 Let's see if there are styles we need to handle for li
 		if (editor.deleteNodeProps != undefined && editor.deleteNodeProps != null && editor.deleteNodeProps.firstPStyle && editor.deleteNodeProps.firstPStyle.length >0){
 			pNode.setAttribute('style', editor.deleteNodeProps.firstPStyle);
 		}
 		//D15255 Let's see if there are styles we need to handle for span
 		if (editor.deleteNodeProps != undefined && editor.deleteNodeProps != null && editor.deleteNodeProps.firstSpanStyle && editor.deleteNodeProps.firstSpanStyle.length>0 &&  pNode.$.firstChild.nodeName.toLowerCase()=='span'){
 			dojo.attr(pNode.$.firstChild,'style',editor.deleteNodeProps.firstSpanStyle);
 		}

 		//D4498 need to consider alignment when restoring node
 		if (editor.alignmentDef !=null && editor.alignmentDef!=undefined){
 			pNode.$.style.textAlign = editor.alignmentDef;
 		}

 		node.appendChild(pNode.$);
 		return pNode.$;
 	},
 	
 	
 	//
 	// Returns true if no nodes are found under node
 	//
 	isNodeEmpty: function(node){
 		var isEmpty =false;
 		if (node.childNodes.length==0){
 			isEmpty = true;
 		} 	 		 
 		return isEmpty;
 	},
 	
 	//
 	// Returns true if node contains user linebreaks.
 	//
 	doesNodeContainUserLineBreaks: function(node){
 		var lineBreaksFound =false;
 		var nodes = dojo.query('.userLineBreak, .text_line-break',node);
 		
 		if (nodes.length>0){
 			lineBreaksFound = true;
 		} 	 		 
 		return lineBreaksFound;
 	},
 	
 	//
 	// Returns true if node contains more than one li
 	//
 	doesNodeContainMoreThanOneParagraph: function(node){
 		var lisFound =false;
 		var nodes = dojo.query('li, p',node); 		
 		if (nodes.length>1){
 			lisFound = true;
 		} 	 		 
 		return lisFound;
 	},
    
    /*
     * Check whether the input node represent an empty line/paragraph
     * Input :  node, which use checkNodeName instead of is()
     * 
     * Result 	[false]: maybe this node is not a list or paragraph
     * 		[true] : is node is an empty paragraph/list
     * */
    isEmptyParagraph: function(node){
 	//even if it's not CKNode, use PresCKUtil.checkNodeName instead
 	//Not paragraph, return;
 	if(!PresCKUtil.checkNodeName(node, 'p','li'))
 	    return false;
 	//Try to get immediate text, which do not contains its sub children's text
        var re = node.childNodes ? 
            this.doesNodeContainImmediateText(node)
            : this.doesNodeContainImmediateText(node.$);
	return !re; 
    },
 	
    /**
     * Gets the immediate text on the node. This function is most useful for list item nodes
     * that contain sublist items. Those list items report the text contained in their sublists,
     * which isn't normally what you want when you ask for the text of the list item.
     * 
     * @param node
     * @returns
     */
    getImmediateText: function( node ) {
        if ( !node )
            return '';
        if ( node.$ )
            node = node.$; // make sure it's a DOM node
        
        if ( node.nodeType == CKEDITOR.NODE_TEXT )
            return TEXTMSG.getTextContent( node );
        
        var ret = '',
            length = node.childNodes ? node.childNodes.length : 0;
        for ( var i = 0; i < length; i++ ) {
            var child = node.childNodes[i];
            if ( child.nodeType == CKEDITOR.NODE_TEXT ) {
                ret += TEXTMSG.getTextContent(child);
            } else if ( child.nodeName.toLowerCase() == 'span' && child.style[ 'display' ] == '' ) {
                ret += this.getImmediateText( child );
            }
        }
        return ret;
    },
 	
 	
 	//
 	// Returns true if no node has text
    // Now accepts parameter to check for linebreaks and emptyli
    // checkFlg: check 8203. 
 	//
 	doesNodeContainText: function(node,chkForUserLineBreak, checkForEmptyParagraph, checkFlg){	
  		// justify the text content
 		var txt = TEXTMSG.getTextContent(node);
 		var hasContent = false;
 		if(node.nodeName.toLowerCase() == 'td')
 			hasContent = TEXTMSG.hasTxt(txt,false);
 		else
 			hasContent = TEXTMSG.hasTxt(txt,true);
 		var hasTxt =  (txt && txt.length > 0 ? hasContent : false);
 		
 		//S24380
 		if(checkFlg && (txt.length === 1) && (txt.charCodeAt(0) === 8203)){
 			hasTxt = false;
 		}
 		
 		// justify the line break if needed
		var hasLineBreaks   = false;
		var lineBreakCheck = (chkForUserLineBreak!=null)? chkForUserLineBreak :false; // default is false
		if (lineBreakCheck) {
			hasLineBreaks =  PresCKUtil.doesNodeContainUserLineBreaks(node);
		}
		
		// justify the empty li if needed
		var hasMultiEmptyLi = false;
		var emptyPCheck   = (checkForEmptyParagraph!=null)? checkForEmptyParagraph :false; // default is false
		if (emptyPCheck){
 			hasMultiEmptyLi =  PresCKUtil.doesNodeContainMoreThanOneParagraph(node);   //checks for multiple empty li's
 		}
		return (hasLineBreaks || hasMultiEmptyLi || hasTxt);
 	}, 
    
 	//
 	// Returns true if any of the immediate child text node has text
 	//
 	doesNodeContainImmediateText: function(node){
 		var hasTxt = false;
 		for (var i=0;i<node.childNodes.length;i++) {
 			var child = node.childNodes[i];
 			if (child.nodeType == CKEDITOR.NODE_TEXT) {
 				var txt = TEXTMSG.getTextContent(child);
 				hasTxt = TEXTMSG.hasTxt(txt,true);
 				if (hasTxt == true)
 					break;
 			} else if (child.nodeName.toLowerCase() == 'span') {
 			    var spanTxt = this.doesNodeContainImmediateText( child );
 			    if (spanTxt)
 			        return spanTxt;
 			}
 		}
 		return hasTxt;
 	},

 	//
 	// Returns true if any of the immediate child text node has text
 	//
 	doesNodeContainImmediateText2: function(node, blankSpace){
 		var hasTxt = false;
 		for (var i=0;i<node.childNodes.length;i++) {
 			var child = node.childNodes[i];
 			if (child.nodeType == CKEDITOR.NODE_TEXT) {
 				var txt = TEXTMSG.getTextContent(child);
 				hasTxt = TEXTMSG.hasTxt(txt, blankSpace);
 				if (hasTxt == true)
 					break;
 			} 
 		}
 		return hasTxt;
 	},
 	//In case node.$.outerHTML doesn't work
 	getOuterHtml: function(node){
 		var cknode = new CKEDITOR.dom.element(node);
		if ( cknode )
		{
			return cknode.getOuterHtml();
		}

 	},
 	//Wangzhe >>>>>=============
 	getRuleCSSText : function (_rule,bNotIncludingSelector){

 		var rule = _rule.cssRule;
 		
		var filterIECSSText = function(rule){
			var cssText = rule.cssText;
			var cssSelector = rule.selectorText
									.replace(/::/g,':') ;
			return cssSelector + cssText.substring(cssText.indexOf("{"));
		};
		
		var filterWebKitCSSText = function(rule){
			var curCssText = rule.cssText;
			if(!rule.style.content)
				return curCssText;

			var contentValue = rule.style.content;
			var i1 = contentValue.indexOf("attr(values)");
			if(i1<0)
				return curCssText;

			contentValue = contentValue.replace(/,/ig,"");

			curCssText = curCssText.replace(/content:[^;]*;/,"content:"+contentValue+";");	
			return curCssText;
		};

		var cssText = "";			
		if(rule.cssText)
		{
			if(CKEDITOR.env.webkit)
				cssText = filterWebKitCSSText(rule);
			else
				cssText = filterIECSSText(rule);
		}
		else
		{
				cssText = rule.selectorText;
				cssText += '{';
				cssText += rule.style.cssText;
				cssText += '}';
		}
		
		if(bNotIncludingSelector)
		{
			cssText = cssText.substring(cssText.indexOf("{")+1,cssText.indexOf("}")-1);
		}
		
		return cssText;
	},

	//
 	// get CSS styles from CSS Styles
 	// @ruleNames ['default-style','standard','xxx','xxx',........]
 	// return array of css rules 
 	// using PresCKUtil.getCSSRules(['default-style','standard']);
 	//
 	getCSSRules : function(ruleNames,curDoc) {
		function isSearchedRule(cssRule,ruleNames)	{
				if(cssRule.type == CSSRule.STYLE_RULE){
				   var curRuleName = cssRule.selectorText.toLowerCase();
				   //remove ".concord ." of rule name
				   var cRegex=/\s*.concord\s*./g;
				   var match = curRuleName.match( cRegex );
		          if ( match && match.length > 0 )
		          {
		                match = match[0];
		                var n = curRuleName.indexOf(match);
						curRuleName = curRuleName.substring(n+match.length);
		          }
			   
				   for(var i=0; i<ruleNames.length; i++)
				   {
					   if (ruleNames[i] && 
						  (ruleNames[i].toLowerCase() == curRuleName)) {
						   return true;
				       }
				   }
			   }
			   return false;	   
			};
			
		function getMatchedRules()
		{
			var result = [];
			   var allStyleSheets = curDoc?(curDoc.$?curDoc.$.styleSheets:curDoc.styleSheets):null;
			   if (allStyleSheets) 
			   {
			      for (var i=0; i<allStyleSheets.length; i++) 
			      { 
			         var styleSheet = allStyleSheets[i];
						if(styleSheet)
						{
							 var ii=0;
							 var cssRule;
							 do {
								try{
								    if (styleSheet.cssRules)
								        cssRule = styleSheet.cssRules[ii];
								    else
								        cssRule = styleSheet.rules[ii];    
								    if (cssRule && isSearchedRule(cssRule,ruleNames))
								    {
								    	result.push({cssRule:cssRule, index:ii, styleSheet:styleSheet});
								    }
								}catch(e){}
							    ii++;
							 } while (cssRule);	
						}
			      }		   
			   }
			return result;
		};
		
		if(!curDoc)
			curDoc = window.document;
		
		
		var result = getMatchedRules();
		return result;
	},
	//<<<<=======================
	
	//
 	// Fix nest spans, ensure only one level <span> be used, merge styles together.
 	// @node should be a root of nest span.
 	//
 	fixNestedSpansWithStyle: function(node){
 		if (node){		    
 			var spans = node.childNodes; 	
 			for (var i=0,lens = spans.length ; i< lens;i++){
 				var child= spans[i];
 				if(child && child.nodeName.toLowerCase()=="span"){
 					if(child.childNodes.length==0){
 						dojo.destroy(child);
 					}else if(child.childNodes.length==1){
 						while(child.childNodes.length==1 && child.firstChild && child.firstChild.nodeType != 3) {
 							var fieldstyleInfoForNode =  child.getAttribute('field');
 								if(dojo.hasClass(child,'text_p')||dojo.hasClass(child,'text_page-number')||dojo.hasClass(child,'text_a')
 										||dojo.hasClass(child,'text_date')||dojo.hasClass(child,'text_time')
 										||dojo.hasClass(child,'text_author-name')||dojo.hasClass(child,'text_file-name')
 										||(fieldstyleInfoForNode && fieldstyleInfoForNode!='')){
 									child =child.firstChild;
 								}else if(child.nodeName.toLowerCase()=="span" && child.firstChild.nodeName.toLowerCase()=="span"){
 									var style = concord.util.presCopyPasteUtil.getMergedStyles(child, child.firstChild);
 									var customStyle = concord.util.presCopyPasteUtil.getMergedCustomStyles(child, child.firstChild);
 						    		child = dojo.place(child.firstChild,child,'replace');
 						    		dojo.attr(child,'style',style);
 						    		dojo.attr(child,'customstyle',customStyle);
 								}else {
 									child =child.firstChild;
 								}
 						}
 						if(child.childNodes.length>1 )PresCKUtil.fixNestedSpansWithStyle(child);
 					}else{
 						var len = child.childNodes.length;
 						var n=0;
 						for(n; n < len;n++){
 							var tmpch = child.childNodes[0];
 							var childcp=child.cloneNode(false);
 							if(tmpch.nodeType == 3){
 								var newSpan = child.ownerDocument.createElement('span');
 								newSpan.appendChild(tmpch);
 								childcp.appendChild(newSpan);
 							} else {
 								childcp.appendChild(tmpch);
 							}
 							childcp = dojo.place(childcp,child,'before');
 						}
 						dojo.destroy(child);
 						i= i+ (len-1);
 						lens = spans.length;
 					}
 				}else {
 					PresCKUtil.fixNestedSpansWithStyle(child);
 				}
 			}
 		}
 		return node;
 	},
 	//
 	// Fix nest spans, ensure only one level <span> be used, merge styles together.
 	// leavel span with text_p class for list.
 	//
 	fixNestedSpans: function(node){
 		do {
 		var nestSpans = dojo.query('span > span',node);
 		var length = nestSpans.length;
 		var span_p = 0;
 			for(var i=nestSpans.length -1 ;i>=0;i--){
 				if(nestSpans[i].parentNode && nestSpans[i].parentNode.parentNode){
 					var nestspan = nestSpans[i].parentNode.parentNode;
 					
 					var item = nestSpans[i].parentNode;
 					var fieldstyleInfoForNode =  item.getAttribute('field');
	                	if(dojo.hasClass(item,'text_p')||dojo.hasClass(item,'text_page-number')||dojo.hasClass(item,'text_a')
								||dojo.hasClass(item,'text_date')||dojo.hasClass(item,'text_time')
								||dojo.hasClass(item,'text_author-name')||dojo.hasClass(item,'text_file-name')
								||(fieldstyleInfoForNode && fieldstyleInfoForNode!='')){
	                		span_p = span_p + 1;
						}
 					PresCKUtil.fixNestedSpansWithStyle(nestspan);
 				}else {
 					dojo.addClass(nestSpans[i],'removeThisNode');
 				}
 			}
 			dojo.query('.removeThisNode',node).forEach(dojo.destroy);
 		} while (length > 0 && length > span_p);
 		
 		var megerSpans = dojo.query('span.text_p',node);
 	 	for(var i=megerSpans.length -1 ;i>=0;i--){
 	 		var spanp0 = megerSpans[i];
 	 		if(i>0){
 	 			var spanp1 = megerSpans[i-1];
 	 			if(spanp0.parentNode == spanp1.parentNode ){
 	 				var t0=spanp0.cloneNode(false);
 	 				var t1=spanp1.cloneNode(false);		
 	 				if(t0.outerHTML==t1.outerHTML ){
 	 					spanp1.innerHTML += spanp0.innerHTML;
 	 					dojo.addClass(spanp0,'removeThisNode'); 
 	 				}
 	 				dojo.forEach(
 	 	                 dojo.query( 'SPAN[id]', spanp1),
 	 	                 function( item ) {
 	 	                 	var fieldstyleInfoForNode =  item.getAttribute('field');
 	 	                 	if(dojo.hasClass(item,'text_p')||dojo.hasClass(item,'text_page-number')||dojo.hasClass(item,'text_a')
 	 								||dojo.hasClass(item,'text_date')||dojo.hasClass(item,'text_time')
 	 								||dojo.hasClass(item,'text_author-name')||dojo.hasClass(item,'text_file-name')
 	 								||(fieldstyleInfoForNode && fieldstyleInfoForNode!='')){
 	 									
 	 						} else {
 	 							item.removeAttribute( 'id' );  
 	 						}
 	 	                }
 	  		        );
	 				dojo.destroy(t0);
 	 				dojo.destroy(t1);
 	 			}
 	 		}
 	 }
 	 dojo.query('.removeThisNode',node).forEach(dojo.destroy);
 	 dojo.query('span > br.hideInIE',node).forEach(dojo.destroy);
 	},
 	
 	/**
 	 * This function ONLY checks table that end user manipulates, not table internal used for layout.
 	 * Empty table import from ppt has a broken dom strcture:
 	 *    <table><tbody></tbody><tbody></tbody></table>
 	 *    <td><p> </p></td> ==> <td><p><span>&#8203;</span><br></p></td>
 	 *    
 	 * Valid TD/TH node, take td as example:
 	 * 1, <td><p><span>&#8203;</span><br class="text_line-break"><span>&#8203;</span><br class="hideInIE"></p></td>
 	 * 2, <td><p><a><span>&#8203;</span></a><br class="hideInIE"></p></td>
 	 * 3-1, <td><ol><li><a><span>&#8203;</span></a><br class="hideInIE"></li></ol><td>
 	 * 3-2, <td><ul><li><span>&#8203;</span><br class="hideInIE"></li></ul><td>
 	 * @param node
 	 */
 	fixBrokenTable: function(table){
 		if(!table)
 			return;
 		
 		//D27133 Table width is decreased when play slide show
		if(!dojo.attr(table,'style')){
			dojo.attr(table, 'style', "height: 100%; width: 100%;");
		}
 		
 		var tbodys = dojo.query("tbody", table);
 		if(tbodys.length > 1){
 			for(var i = 0; i <tbodys.length - 1; i++){
 				dojo.destroy(tbodys[i]);
 			}
 		}
 		
 		var reGenPNode = function(node){
 			if(!node || !node.$)
 				return;
 			
 			var txt = node.getText() || '&#8203;';
			var newp = CKEDITOR.dom.element.createFromHtml('<p><span>' + txt + "</span></p>");
			newp.appendBogus();
			newp.insertBefore(node);
			node.remove();
 		};
 		
 		dojo.query("tr", table).forEach(function(tr){
 			dojo.query("td, th", tr).forEach(function(td){
 				var tdNode = new CKEDITOR.dom.node(td);
				var len = tdNode.getChildCount();
				if(len == 0){
					PresCKUtil.removeAllChildren(td);
					MSGUTIL.genDefaultContentForCell(tdNode);						
				}
				else{
					//check the first level child for td node
					for(var i = len - 1; i >= 0; i--){
						
						var subNode = tdNode.getChild(i);
						if(PresCKUtil.checkNodeName(subNode, "p")){
							PresCKUtil.fixPorLINode(subNode);
						}else if(PresCKUtil.checkNodeName(subNode, "ol", "ul")){
							var liNodeL = subNode.getChildCount();
							for(j = liNodeL - 1; j >= 0; j--){
								var liNode = subNode.getChild(j);
								if(PresCKUtil.checkNodeName(liNode, "p", "li")){
									PresCKUtil.fixPorLINode(liNode);
								}else{
									reGenPNode(liNode);
								}
							}
						}else{
							reGenPNode(subNode);
						}
						
					}
				}
					
 			});
 			
 		});
 	},
 	
 	fixTablesInSlide: function(node){
 		if(!node)
 			return;
 		
 		dojo.query("table", node).forEach(function(table){	
	 		var parentNode = table.parentNode;
 			var preClass = parentNode && dojo.attr(parentNode, 'presentation_class');
 			if(preClass == "table" || dojo.hasClass(table,'smartTable')){
 				PresCKUtil.fixBrokenTable(table);
 			}
 			if(parentNode && dojo.hasClass(parentNode,'draw_frame')){
 				dojo.attr(parentNode, 'presentation_class', 'table');
 				var tables = dojo.query("table", parentNode);
 		 		if(tables.length > 1){
 		 			for(var i = tables.length - 1; i >0; i--){
 		 				dojo.addClass(tables[i],'removeThisNode');
 		 			}
 		 		}
 			}
 		});
 		dojo.query('.removeThisNode',node).forEach(dojo.destroy);
 	},
 	fixIEcontenteditable: function(node){
 		//D31941: [Regression][IE10] The slide content flash after reopen presentation.
 		dojo.forEach(
 			dojo.query('div[contenteditable]',node),
 			function( item ) {
 				item.removeAttribute('contenteditable');
 			}
 		);
 	},
 	fixDOMStructure: function(node){
 		try {
 			if(dojo.isIE)
 			{
 				PresCKUtil.fixIEcontenteditable(node);
 			}
 	 		//for T25019: Ensure only one level <span> generated while taking edit action for text in Docs Presentation XML files
 			PresCKUtil.fixNestedSpans(node);
 			PresCKUtil.fixTablesInSlide(node);
 		}catch(evt){
 			console.log("Error while fixDOMStructure: "+evt);
 		}
 	},
 	
 	/**
 	 * 
 	 */
 	fixPorLINode: function(givenNode){
 		if(!PresCKUtil.checkNodeName(givenNode, "p", "li"))
 			return;
 		
 		givenNode = (givenNode.$) ? givenNode : new CKEDITOR.dom.node(givenNode);
 		
		var lenP = givenNode.getChildCount();
		
		var reGenSpanNode = function(node){
			if(!node || !node.$)
 				return;
			
			var txt = node.getText() || '&#8203;';
			var newSpan = CKEDITOR.dom.element.createFromHtml('<span>' + txt + '</span>');
			newSpan.insertBefore(node);
			node.remove();
		}; 
		
		var isValideBR = function(node){
			return PresCKUtil.checkNodeName(node, 'br') && node.hasClass("hideInIE");
		};
		
		var isLineBreakBR = function(node){
			return PresCKUtil.checkNodeName(node, 'br') && node.hasClass("text_line-break");
		};
		
		if(lenP > 0){
			
			var lastNode = givenNode.getLast();
			if(!isValideBR(lastNode)){
				givenNode.appendBogus();
				lenP = givenNode.getChildCount();
			}
			for(var j = lenP - 2; j >= 0; j--){
				var subNode = givenNode.getChild(j);
				if(PresCKUtil.checkNodeName(subNode, 'span')){
					if(subNode.getChildCount() === 0){
						subNode.setHtml('&#8203;');
					}
				}else if(PresCKUtil.checkNodeName(subNode, 'a')){
					var spanL = subNode.getChildCount();
					for(var k = spanL - 1; k >= 0; k--){
						var spanNode = subNode.getChild(k);
						if(PresCKUtil.checkNodeName(spanNode, 'span')){
							if(spanNode.getChildCount() === 0){
								spanNode.setHtml('&#8203;');
							}
						}else{
							reGenSpanNode(spanNode);
						}
					}
				}else if(isValideBR(subNode)){
					//for hideInIE BR which is not the last child node of P/LI, we remove it; 
					//for other type of BR(e.g. text_line-break), we keep it.
					subNode.remove();
				}else{
					if(!isLineBreakBR(subNode)){
						//for unexpected node, we extract it's text and regenerate a new span to hold it.
						reGenSpanNode(subNode);
					}
				}
			}
			
		}else{
			//for empty P/LI node, we create a new span with 8203
			var txt = givenNode.getText() || '&#8203;';
			givenNode.setHtml('<span>' + txt + '</span>');
			givenNode.appendBogus();
		}
 		
 	},
 	
 	
 	//
 	// Gets first non empty span
 	//
 	getFirstNonEmptySpanAndStyles: function(node, editor){
 		if (node!=null){
 			PresCKUtil.removeNoStyleEmptySpans(editor);
 			var spans = node.getElementsByTagName('span'); 			
 			for (var i=0; i< spans.length;i++){
 				if (this.doesNodeContainText(spans[i])){
 					//span found with text we need to capture style info for this span and nested spans 					
 					var span = dojo.clone(spans[i]);
 					//Remove all empty nested spans
 					//Now let's capture inline style info for all nested spans
 					var styleProp = [];					
 					var ckSpan= new CKEDITOR.dom.node(span);
 					var node = ckSpan;
 					while (node!=null && node.type == CKEDITOR.NODE_ELEMENT){
 						styleProp = PresCKUtil.captureNodeStyleInfo(node,styleProp);
 						node = node.getFirst();
 					}  					
 					//Now let's apply the style on the span
 					spans[i].styleProp = styleProp;
 					var styleString = "";
 					for (var styleName in styleProp){
 						styleString += styleName+":"+styleProp[styleName]+";";
 					} 					
 					//console.log('Cummulative Style string '+styleString);
 					spans[i].setAttribute('style',styleString);
 					return spans[i];
 				}
 			}
 		}
 	},
 	
 	
 	//
 	// Captures the inline style information of a span 
 	//
 	captureNodeStyleInfo: function(node,styleProp){
 		if (node==null)
 			return;
 		if (styleProp==null){
 			styleProp = [];
 		}
 		
 		var ckNode = node;
 		if (!PresCKUtil.isCKNode(ckNode)){
 			ckNode = CKEDITOR.dom.node(node);
 		}

 		var styleArray = [];
 		var styleInfoForNode =  ckNode.getAttribute('style');
 		if (styleInfoForNode){
 			if (!dojo.isIE)
 			{
 				if (styleInfoForNode && styleInfoForNode.charAt(styleInfoForNode.length-1) == ';')
 					styleInfoForNode = styleInfoForNode.substring(0,styleInfoForNode.length-1);
 			}
 			styleArray = styleInfoForNode.split(";"); 			
 		}
		
		for (var i=0; i< styleArray.length; i++){
			var entry = styleArray[i];
			var styleName ="";
			var styleValue ="";
			var semiIndex = entry.indexOf(':');
			if (semiIndex >=0){
				styleName = entry.substring(0,semiIndex).replace(" ","");
				styleValue = entry.substring(semiIndex+1).replace(" ","");
				styleProp[styleName]=styleValue;
			}			
		}
 		return styleProp;
 	},

 	//
 	// Remove invalid tags and reset the range
 	//
 	// Defect 14431 gjo
 	removeInvalidTagsAndSetRange: function (editor, range) {
 		//console.log('removeInvalidTagsAndSetRange');
 		var dfc = null;
 		if ( editor.isTable){
			dfc = editor.contentBox.getContentEditNode();
 		} else {
 			dfc = PresCKUtil.getDFCNode(editor);
 		}
 		
 		if (!dfc)
 		    return;
 		for (var i=dfc.childNodes.length-1; i>=0; i--){
			var removeTheChild = false;
			var child = dfc.childNodes[i];
			//check for valid p tag structure
			if (child.nodeName.toLowerCase() == 'p') {
				//the following structure in not permitted
				//<p></p>
				if (child.childNodes.length == 0) {
					removeTheChild = true;
				}
				//the following structure in not permitted
				//<p><br></p>
				if (child.childNodes.length == 1 
						&& child.childNodes[0].nodeName.toLowerCase() == 'br') {
					removeTheChild = true;
				}
				//the following structure in not permitted
				//<p><span></span><br></p>
				if (child.childNodes.length == 2 
						&& child.childNodes[1].nodeName.toLowerCase() == 'br'
						&& child.childNodes[0].nodeName.toLowerCase() == 'span'
						&& this.isEmpty(child.childNodes[0].innerHTML)
						&& !dojo.hasClass( child, 'userLineBreak' )) {
					removeTheChild = true;
				}
			}
			
			//a br as a child of the dfc is not permitted
			if (child.nodeName.toLowerCase() == 'br') {
				removeTheChild = true;
			}
			
			//if the structure of the child is not permitted
			//then reset the range to the end of the previous child
			//if it exists and destroy the child
			if (removeTheChild) {
				if (dfc.childNodes[i + 1] != undefined) {
						//console.log('move the range to the start of the next child');
						var firstSpan = PresCKUtil.getFirstSpanFromNode(dfc.childNodes[i + 1]);
						//console.log(firstSpan);
						var moveToNode = new CKEDITOR.dom.element( firstSpan );
						range.moveToElementEditStart( moveToNode );
						range.select();
						dojo.destroy(child);
				} else {
					if (dfc.childNodes[i - 1] != undefined) {
						//console.log('move the range to the end of the previous child');
						var lastSpan = PresCKUtil.getLastSpanFromNode(dfc.childNodes[i - 1]);
						//console.log(lastSpan);
						if(lastSpan){
							var moveToNode = new CKEDITOR.dom.element( lastSpan );
							range.moveToElementEditEnd( moveToNode );
							range.select();
							dojo.destroy(child);
						}
					}
				}
			}	
		}
		return range;	
 	},
 	
 	//
 	// Remove mozilla-inserted-br
 	//
 	removeInvalidBr: function(editor){
 		var dfc = PresCKUtil.getDFCNode(editor);
 		if (!dfc)
 		    return;
 		var mozBrs = dojo.query("br", dfc);
 		if (!mozBrs)
 		    return;
		for (var i=mozBrs.length-1; i>=0; i--){
			if (mozBrs[i].hasAttribute('_moz_dirty')) {
				var parent = mozBrs[i].parentNode;
				var prev = mozBrs[i].previousSibling;
				// set correct parent since br could be within span instead of directly under p or li
				while (parent.nodeName.toLowerCase() != 'p' && parent.nodeName.toLowerCase() != 'li' && parent.parentNode) {
					parent = parent.parentNode;
				}
				// remove br
				dojo.destroy(mozBrs[i]);	
				// outdent siblings if the destroyed br is the first child (otherwise it would cause nested empty list structure)
				var siblingsPromoted = false;
				if (!prev && parent && parent.nodeName.toLowerCase() == 'li') {	// if this is list
					for (var j=0; j<parent.childNodes.length; j++){	// parent.childNodes are ul
						var child = parent.childNodes[j];
						if (child.nodeName.toLowerCase() == 'ul' || child.nodeName.toLowerCase() == 'ol') {	// promote children
							while (child.childNodes.length > 0) {
								var gchild = child.childNodes[0];
								//adjust font size
								//this.adjustIndentedFontSize(gchild);
								// outdent
								parent.parentNode.insertBefore(gchild,parent);
								siblingsPromoted = true;
							}
						}
					}
				}
				// remove parent if children were outdented
				if (siblingsPromoted) {
					dojo.destroy(parent);
				}
			}
		}
  	},
  	
  	//Wangzhe >>>====================
  	AutoTest: function()
  	{
  		function _checkLineFontSize(line)
  		{
  			var report = "";
  			if(line.hasAttribute('font-size'))
  			{
  				var str = "line id={"+line.getAttribute()+"} has \'font-size:"+line.getAttribute('font-size')+"\'\r\n";
  				report+=str;
  			}
  			return report;
  		}
  		
  		function _AutoTestLine(line)
  		{
  			//Frist check all relative data
  			//whethe consist with abosule value
  			var result = PresCKUtil._updateRelativeValue(line,null,true);
  	  		var reportString = result.reportString;
  	  		
  			if(result.couldContinueTest)
  			{
  				//Then check whether has illegal value in <p>,<li>
  				//the font size should 18pt
  				var lineContainor = line.is('p')?null:line.getParent();
  				if(lineContainor)
  				{
  					var str = _checkLineFontSize(lineContainor);
  					if(str!="")
  					{
  	  					reportString+=str;
  	  					reportString+="\r\n";
  					}
  				}

  				var str = _checkLineFontSize(line);
				if(str!="")
  				{
					reportString+=strFontSizeError;
					reportString+="\r\n";
  				}

  			}
  			
  			return {
  				reportString : reportString,
  				couldContinueTest : true
  			};
  		}
  		
  		function _checkOneLeafNode(divLeaf)
  		{
  			var strErrResult = "";
	  			//Find the leaf div
	  			var hasLine = false;
	  			//check the child node,
	  			var childCount = divLeaf.getChildCount();
	  			for(var index = 0;index<childCount;index++)
	  			{
	  				var child = divLeaf.getChild(index);
	  				if(!PresCKUtil.checkNodeName(child,'ol','ul','p'))
	  				{
	  					strErrResult += "Has illegal line node :" + child.getOuterHtml() + "\r\n";
	  					break;
	  				}
	  				hasLine = true;
	  				
	  				var lineItem = child;
	    			//continue check each line
	  				if(child.is('ol','ul'))
	  				{
	  					if(child.getChildCount()!=1)
	 	  				{
	  						strErrResult += "ol/ul has more than one child:\r\n" + child.getOuterHtml() + "\r\n";
		  	  				break;
	  	  				}
	  					lineItem = child.getFirst();
	  				} 	  		
	  		
	  				if(PresCKUtil.checkNodeName(lineItem,'li','p'))
	  				{
  						strErrResult += "ol/ul has unexpect child:\r\n" + lineItem.getOuterHtml() + "\r\n";
	  	  				break;
	  				}	  				
	  				
	  				//Empty placeholder, ignore
	  				if(lineItem.hasClass('cb_outline')
	  						||lineItem.hasClass('cb_title')
	  						||lineItem.hasClass('cb_subtitle')
	  						||lineItem.hasClass('cb_notes'))
	  					continue;
	  				
	  				var lastNode = lineItem.getLast();
	  				if(!lastNode 
	  						|| !PresCKUtil.checkNodeName(lastNode,'br') 
	  						//|| !lastNode.hasClass('hideInIE')
	  						)
	  				{
	  					strErrResult += "Line don't has <br> as end:\r\n" + lineItem.getOuterHtml() + "\r\n";
	  	  				break;
	  				}
	  				var firstNode = lineItem.getFirst();
	  				if(!firstNode 
	  						|| !PresCKUtil.checkNodeName(firstNode,'span'))
	  				{
	  					strErrResult += "Line don't has <span> as start:\r\n" + lineItem.getOuterHtml() + "\r\n";
	  	  				break;
	  				}
	  				var spanCount = lineItem.getChildCount();
	  				for(var m = 0; m < spanCount-1; m++)
	  				{
	  					var span = lineItem.getChild(m);
	  					if(!PresCKUtil.checkNodeName(span,'span','br','a'))
		 	  			{
	  						strErrResult += "Line has unexpect child LineStructure is \r\n:" + lineItem.getOuterHtml() + "\r\n";
	  	  				break;
		 	  			}

	  					if(span.is('br') && (!span.hasClass('text_line-break') || span.getFirst()))
		 	  			{
	  						strErrResult += "Line has unexpect <br>:\r\n" + lineItem.getOuterHtml() + "\r\n";
	  	  				break;
		 	  			}
	  					
	  					if(span.is('span'))
	  					{
	  						span.$.normalize();
	  						var textNode = span.getFirst();
	  						if(!textNode || !PresCKUtil.checkNodeName(textNode,'#text','a'))
	  		 	  			{
	  							strErrResult += "Line has multilevel <span>:\r\n" + lineItem.getOuterHtml() + "\r\n";
			  	  				break;
	  		 	  			}
	  					}
	  				}
	  				
	  				if(hasStructureError)
	  					break;
	  			}
	  			
	  			//if found not <p>/<ul>/<ol> then report error
	  			if(!hasLine)
	  			{
	  				strErrResult += "<"+ divLeaf.getName()+">" + " id=" + divLeaf.getId() + " do not has line\r\n";
	  			}
	  			return strErrResult;
  		}
  		
  		function _checkTextboxDiv(divNode)
  		{
  			var strErrResult = "";
	  			//find four level divs
	  			var tNode = divNode;
	  			while(tNode && PresCKUtil.checkNodeName(tNode,'div'))
	  			{
	  				var nextDiv = tNode.getFirst();
	  				if(PresCKUtil.checkNodeName(nextDiv,'ol','ul','p'))
	  					break;
	  				if(tNode.getChildCount()!=1)
	  				{
	  					tNode = null;
	  					break;
	  				}
	  				tNode = nextDiv;
	  			}
	  			
	  			if(!tNode || !PresCKUtil.checkNodeName(tNode,'div'))
	  			{
	  				
	  				strErrResult += "Don not has four level div structure \r\n";
	  				//hasStructureError = true;
	  			}
	  			else
	  			{
	  	  			var leafErr = _checkOneLeafNode(tNode);
	  	  			if(leafErr!="")
	  	  			{
	  	  			strErrResult += leafErr;
	  	  				//hasStructureError = true;
	  	  			}	
	  			}
	  		return strErrResult;
  		}
  		
  		
  		var lineEnd = "\r\n";
  		var dateTime = new Date();
  		var strTestReport = "Test start at : " + dateTime + lineEnd;
  		strTestReport+= "===================\r\n";
  		var curDoc = CKEDITOR.instances.editor1.document; 
  		
  		//First check all list
  		var allDrawFrame = dojo.query(".draw_frame", curDoc.$);
  		for(var i=0;i<allDrawFrame.length;i++)
  		{
  			var drawFrame = this.ChangeToCKNode(allDrawFrame[i]);
  			{
  				var allLines = dojo.query("p,li",drawFrame.$);
  		  		for(var j=0;j<allLines.length;j++)
  		  		{
  	  	  			var line = this.ChangeToCKNode(allLines[j]);
  	  	  			var result = _AutoTestLine(line);
  	  	  			if(result.reportString!="")
  	  	  			{
  	  	  	  	  		strTestReport+=result.reportString;
  	  	  	  	  		strTestReport+=lineEnd;	
  	  	  			}
  	  	  			if(!result.couldContinueTest)
  	  	  			{
  	  	  				break;
  	  	  			}
  		  		}
  			}

//  		<drawFrame>
//  			<div_textbox>
//  				<div_table>
//  					<div_leaf>
//  						<p/ul/ol>
  			var strErr = "";
  			var hasStructureError = false;
  			var dramFrameType = drawFrame.getAttribute('presentation_class');
  			if(dramFrameType == 'table')//For table
  			{
  		  		var allTds = dojo.query("td", drawFrame.$);
  		  		for(var t=0;t<allTds.length;t++)
  		  		{
  		  			var td = this.ChangeToCKNode(allTds[t]);
  	  	  			var leafErr = _checkOneLeafNode(td);
  	  	  			if(leafErr!="")
  	  	  			{
  	  	  				strErr += leafErr;
  	  	  				hasStructureError = true;
  	  	  			}
  		  		}
  			}
  			else if(dramFrameType == 'group')//For shape
  			{
  				//Find the textbox node
  		  		var allTextbox = dojo.query("div[presentation_class='outline']", drawFrame.$);
  		  		for(var t=0;t<allTextbox.length;t++)
  		  		{
  		  			var textbox = this.ChangeToCKNode(allTextbox[t]);
  	  	  			var leafErr = _checkTextboxDiv(textbox);
  	  	  			if(leafErr!="")
  	  	  			{
  	  	  				strErr += leafErr;
  	  	  				hasStructureError = true;
  	  	  			}
  		  		}
  			}
  			else if(!dramFrameType
  				|| dramFrameType == ''
  				||	dramFrameType == 'graphic'
  				|| dramFrameType == 'date-time'
  				|| dramFrameType == 'page-number'
  					)//for not check objects
  			{
  			}
  			else //for textbox
  			{
  	  			var leafErr = _checkTextboxDiv(drawFrame);
  	  			if(leafErr!="")
  	  			{
  	  				strErr += leafErr;
  	  				hasStructureError = true;
  	  			}	
  			}

  			if(hasStructureError)
  				strTestReport+= "<div> id=" + drawFrame.getId() + " has strcture error :\r\n" + strErr + "\r\n\r\n";
  		}
  		
  		strTestReport+= "===================";
  		//Send out report
  		console.info(strTestReport);	
  	},
  	
  	//Encapsulate undo & redo
  	//usage 
  	/* PresCKUtil.beginUndo(editor)
  	 * ...
  	 * ...actions
  	 * ...
  	 * PresCKUtil.endUndo();
  	 * */
  	_undoEditor :null,
  	_preSnapShot:null,
  	beginUndo: function(editor, keep8203)
  	{
  		this.runPending(editor, keep8203);
  		if(this._preSnapShot)
  			return;
  		this.normalizeMsgSeq(null, null, null, "beginMerge");
  		this._undoEditor = editor;
		var snapShot = this.setPreSnapShot(this._undoEditor);
		this._preSnapShot = this.cloneSnapShot(snapShot);
 	},
  	
  	endUndo: function()
  	{
  		if(!this._undoEditor)
  		return;
  		this._undoEditor.preSnapShot = this._preSnapShot;
		this.setPostSnapShot(this._undoEditor);
		this._preSnapShot = null;
  	},
  	
  	/*
  	 * this function is used for key action, such "del/backspace/enter"
  	 * Usage : 
  	 *    ...key caction,  now all key input will be syc from here. in coediting/plugin.js keyup will call this function too.
  	 *    PresCKUtil.postUndoForKeyAction(editor);
  	 * */
  	postUndoForKeyAction : function(editor)
  	{
  		
  		function _forceEndUndo(editor)
	  	{
			PresCKUtil.setPostSnapShot(editor);
			var preSnapShot = null;
			var postSnapShot = null;
//			if(cellID)
//			{
//				var preCell = dojo.query("td[id='"+cellID+"']",editor.preSnapShot);
//				//preSnapShot.getElementById( cellID );
//				var postCell = dojo.query("td[id='"+cellID+"']",editor.postSnapShot);
//				//postSnapShot.getElementById( cellID );
//				if(preCell.length && postCell.length)
//				{
//					preSnapShot = PresCKUtil.cloneSnapShot(preCell[0]);
//					postSnapShot = PresCKUtil.cloneSnapShot(postCell[0]);
//				}
//			}
//			else
//			{
				preSnapShot = editor.preInput || PresCKUtil.cloneSnapShot(editor.preSnapShot);
				postSnapShot = PresCKUtil.cloneSnapShot(editor.postSnapShot);
//			}			
			editor.contentBox.synchAllData(nodeToSynch,preSnapShot,postSnapShot,null,null);
			editor.contentBox.editorAdjust(null,null,null,true);
			editor.continueInput = false;
			editor.preInput = null;
			editor.prekeyMultiCellSelected = false;
			editor.keyDownTimeout = null;
			dojo.destroy(preSnapShot);
			dojo.destroy(postSnapShot);
			preSnapShot = null;
			postSnapShot = null;
		
	  	};
  		
  		if(PresCKUtil.isIMEMode){
  			return;
  		}
  		
		//D32734: [Regression]one more record in undo list after remove all text
  		PresCKUtil.normalizeMsgSeq(null,null,null,'beginMerge');
		window.pe.scene.undoBackup = null;
		var nodeToSynch = PresCKUtil.getDFCNode(editor);
		
  		var cellID = null;
		if( editor.isTable){
			// allow default browser arrow down but fix to have correct selectedSTCell defect 2608 
			var selection = editor.getSelection();
			var rangelist = selection.getRanges();
			var range = rangelist[0];
			var curMultiCellSelected = false;
			//check whether multi-cell
			if(rangelist.length>1)
			{
				curMultiCellSelected = true;
			}
			else
			{
				var ancestor = range.getCommonAncestor(true, true);
				if(!ancestor.is('p','span','li','ol','ul','td','th'))
				{
					curMultiCellSelected = true;
				}
			}
			if(!editor.prekeyMultiCellSelected && !curMultiCellSelected)
			{
				var selectedCell = range.startContainer.getAscendant('td',true) 
				|| range.startContainer.getAscendant('th',true);
				nodeToSynch = selectedCell.$;
				cellID = selectedCell.getId();
				
				if( !editor.lastEditCellID)
					editor.lastEditCellID = cellID;
				else if(editor.lastEditCellID != cellID)
				{
					editor.lastEditCellID = cellID;
					editor.prekeyMultiCellSelected = true;
					cellID = null;
//					return;
				}
			}
		}						
		
		editor.keyDownTimeout && clearTimeout(editor.keyDownTimeout);
		editor.keyDownTimeout = setTimeout(function()
			  	{
			_forceEndUndo(editor);
	  	}, 1000);
  	},
  	
  	getListBeforeStyleSheet : function(curDoc)
  	{
   	   var styleSheet = null;
  	   curDoc = curDoc.$?curDoc.$:curDoc;
  	   var headTag = curDoc.getElementsByTagName("head")[0];  
  	   var styles = dojo.query("style[stylename='list_before_style']", headTag);
  	   if(styles.length==0){
  		   var style = curDoc.createElement("style");
  		   dojo.attr(style,'styleName','list_before_style');
  		   dojo.attr(style,'type','text/css');	
  		   dojo.attr(style,'id',MSGUTIL.getUUID());
  		   var rules = curDoc.createTextNode('');
  		   
  		   var headTag = curDoc.getElementsByTagName("head")[0];
  		   if (headTag){
  			   headTag.appendChild(style);
  		   }
  		   
  		   if (style.styleSheet) 
  			   style.styleSheet.cssText = rules.nodeValue;
  		   else 
  			   style.appendChild(rules);
  		 return style;
  	   }
	   return styles[0];
  	},
  	
  	//Get current editor mode editor
  	//if return null, means our not in edit mode
  	getCurrentEditModeEditor : function()
  	{
  		var contentbox=pe.scene.getContentBoxCurrentlyInEditMode();
  		if(!contentbox)
  			return null;
  		return contentbox.editor;
  	},
  	
  	getOfficeAutomaticStyleSheet : function(tmpdocument)
  	{
  	   var curDoc = tmpdocument?tmpdocument:pe.lotusEditor.document;
	   var allStyleSheets = curDoc.$?curDoc.$.styleSheets:curDoc.styleSheets;
	   if (allStyleSheets) 
	   {
	      for (var i=0; i<allStyleSheets.length; i++) 
	      { 
	         var styleSheet = allStyleSheets[i];
				if(styleSheet)
				{
					if(styleSheet.href && styleSheet.href.indexOf('office_automatic_styles.css')>=0||
							(styleSheet.ownerNode && styleSheet.ownerNode.getAttribute('stylename')&&styleSheet.ownerNode.getAttribute('stylename').indexOf('office_automatic_styles.css')>=0))
						return styleSheet;
				}
	      }		   
	   }
	   return null;
  	},
  	removeAllILCSBeforeClass: function(root)
	{
  		 dojo.forEach(
         		dojo.query('li',root),
                 function( listItem ) {
         			PresListUtil.removeListBeforeClass(listItem);
                 }
         );
	},
  	copyAllFirstSpanStyleToILBefore: function(root,withColor)
	{
  		root = root.is?root.$:root;
  		pe.scene.slideSorter.newlistBeforeStyleStack = {};
		var needUpdate = false;
		if(root.nodeName.toLowerCase()=='li'){
			needUpdate = true;
 			PresListUtil.prepareStylesforILBefore(root,withColor);
		} else 
  		dojo.forEach(dojo.query('li',root),function( listItem ) {
 			var cknode =PresCKUtil.ChangeToCKNode(listItem);
 			var fsize = cknode.getStyle('font-size');
 			if(fsize && fsize.length >0){
 				cknode.removeStyle('font-size');
 				PresCKUtil.updateRelativeValue(listItem,[PresConstants.ABS_STYLES.FONTSIZE]);
 			}
 			needUpdate = true;
 			PresListUtil.prepareStylesforILBefore(listItem,withColor);
        });
  		if(needUpdate){
  			PresCKUtil.doUpdateListStyleSheet();
  		}
	},
	copyFirstSpanStyleToILBefore: function(liNode,styles,donotupdate)
	{
		if(!PresCKUtil.checkNodeName(liNode, 'li')) return;
		if(!donotupdate){
			pe.scene.slideSorter.newlistBeforeStyleStack = {};
		}
		function _setListBeforeCssClassValue(styleName,styleValue)
	  	{
			var ruleArray = [];
	  		if(theoldtext.length>0){
	  			ruleArray = PresCKUtil.turnStyleStringToArray(theoldtext);
	  			if(!ruleArray) ruleArray = [];
	  			if(styleName=='color'&& styleValue.indexOf('rgb')>=0){
	  	  			styleValue = PresCKUtil.RGBToHex(styleValue);
	  	  		} else if(styleName=='font-family'&& styleValue.indexOf(',')>0){
	  	  			styleValue = styleValue.substring(0,styleValue.indexOf(','));
	  	  		}
	  	  		//modify the value
	  	  		if(styleValue && styleValue.length>0)
	  	  			ruleArray[styleName] = styleValue +' !important';
	  	  		else 
	  	  			ruleArray[styleName] = '';
	  	  		//build as text
	  	  		theoldtext = PresCKUtil._arrayToStyleString(ruleArray);  			
	  		} else {
	  			if(styleName=='color'&& styleValue.indexOf('rgb')>=0){
	  	  			styleValue = PresCKUtil.RGBToHex(styleValue);
	  	  		} else if(styleName=='font-family'&& styleValue.indexOf(',')>0){
	  	  			styleValue = styleValue.substring(0,styleValue.indexOf(','));
	  	  		}
				//modify the value
				ruleArray[styleName] = styleValue +' !important';
				//build as text
				theoldtext = PresCKUtil._arrayToStyleString(ruleArray);
	  		}
	  	}
		function _updateFontSizeListBeforeStyle(name)
  		{
			//update fontsize first, since it is the standard for other value to reference
//			var selfBulletScale = PresCKUtil.getAbsoluteValue(liNode,PresConstants.ABS_STYLES.BULLETSCALE);
//			if(selfBulletScale)
//				selfBulletScale = parseFloat(selfBulletScale);
//			else
//				selfBulletScale = 1.0;
//			if(selfBulletScale <= 0.0)
//				selfBulletScale = 1.0;
			var bfontsize = parseFloat(styles[name]) /18.0 +'em';
			_setListBeforeCssClassValue(name,bfontsize);
  		}
		function _updateOtherListBeforeStyle(name)
  		{
  			var olnode = liNode.getParent();
			var isNumber = olnode.getAttribute( 'numberType' );
			if(isNumber && isNumber.length>0){
				if(name == 'font-weight'){
					PresCKUtil.setCustomStyle(liNode,'abs-bullet-weight',styles[name]);
				} else if(name == 'font-style'){
					PresCKUtil.setCustomStyle(liNode,'abs-bullet-style',styles[name]);
				} else if(name == 'font-family'){
					PresCKUtil.setCustomStyle(liNode,'abs-bullet-family',styles[name]);
				}
				_setListBeforeCssClassValue(name,styles[name]);
			} else {
				//bullet type
				if(name == 'font-weight'||name == 'font-style'){
					_setListBeforeCssClassValue(name,'');
				} else if(name == 'font-family'){
					var listClassesString = dojo.attr( liNode.$, 'class');
					if(listClassesString.indexOf('lst-ta')>0){
						_setListBeforeCssClassValue('font-family','Wingdings');
					}else if(listClassesString.indexOf('lst-ra')>0||listClassesString.indexOf('lst-cm')>0){
						_setListBeforeCssClassValue('font-family','Webdings');
					}else if(listClassesString.indexOf('lst-d')>0 ||listClassesString.indexOf('lst-da')>0){
						_setListBeforeCssClassValue('font-family','"Times New Roman"');
					}else if(listClassesString.indexOf('lst-a')>0){
						_setListBeforeCssClassValue('font-family','Symbol');
					}else if(listClassesString.indexOf('lst-ps')>0){
						_setListBeforeCssClassValue('font-family','Impact');
					}else if(listClassesString.indexOf('lst-c')>0||listClassesString.indexOf('ML_defaultMaster_Content_outline_1')>0){
						_setListBeforeCssClassValue('font-family','Arial');
					}else {
						_setListBeforeCssClassValue('font-family','');
					}
				}
			}
			
			if(name == 'color'){
				PresCKUtil.setCustomStyle(liNode,'abs-bullet-color',styles[name]);
				_setListBeforeCssClassValue(name,styles[name]);
			}
  		};
  		if(!pe.scene.slideSorter.postListCssStyleMSGList){
  			pe.scene.slideSorter.preListCssStyleMSGList = [];
  			pe.scene.slideSorter.postListCssStyleMSGList = [];
  		}
  		var preListCss ='';
  		var theoldtext ='';
  		var liNodeid = liNode.getId();
  		var oldlistBeforeCss = PresListUtil.getListBeforeClass(liNode);
  		var before = 'IL_CS_'+liNodeid;
  		var forecedo = false;
  		if(oldlistBeforeCss != before && oldlistBeforeCss.length > 0){
  			forecedo = true;
  			theoldtext = pe.scene.slideSorter.listBeforeStyleStack[oldlistBeforeCss];
  			pe.scene.slideSorter.deletelistBeforeStyleStack.push('.'+oldlistBeforeCss);
  			delete pe.scene.slideSorter.listBeforeStyleStack[oldlistBeforeCss];
  			pe.scene.slideSorter.preListCssStyleMSGList.push(oldlistBeforeCss+':before='+theoldtext);
			pe.scene.slideSorter.postListCssStyleMSGList.push(oldlistBeforeCss+':before=no');
  		} else{
  			theoldtext = pe.scene.slideSorter.listBeforeStyleStack[before];	
  		}
		if(theoldtext==undefined) {
			theoldtext = '';
			preListCss = before +':before=no';
		}else
			preListCss = before +':before='+theoldtext;
		liNode.addClass( 'IL_CS_'+liNodeid );
		
	 	for( var name in styles ){
			if(name == 'underline' || name == 'line-through'|| name == 'line-height') continue;
			if(name == 'font-size'){
				_updateFontSizeListBeforeStyle(name);
			} else {
				_updateOtherListBeforeStyle(name);
			}
		}
	 	var postListCss = before + ':before=' +theoldtext;	 	
	 	if(forecedo||preListCss!=postListCss){
	 		forecedo = null;
	 		delete pe.scene.slideSorter.listBeforeStyleStack[before];
	 		pe.scene.slideSorter.deletelistBeforeStyleStack.push('.'+before);
	 		pe.scene.slideSorter.newlistBeforeStyleStack[before] = theoldtext;
		 	if(PresCKUtil.debug){
				console.log("=======>Old List CSS text:"+preListCss);
				console.log("=======>New List CSS text:"+postListCss);
			}
			pe.scene.slideSorter.preListCssStyleMSGList.push(preListCss);
			pe.scene.slideSorter.postListCssStyleMSGList.push(postListCss);
	 	}
	 	
		if(!donotupdate){
			PresCKUtil.doUpdateListStyleSheet();
		}
	},
  	
	RGBToHex:function( cssStyle )
	{
		return cssStyle.replace( /(?:rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\))/gi, function( match, red, green, blue )
			{
				red = parseInt( red, 10 ).toString( 16 );
				green = parseInt( green, 10 ).toString( 16 );
				blue = parseInt( blue, 10 ).toString( 16 );
				var color = [red, green, blue] ;

				// Add padding zeros if the hex value is less than 0x10.
				for ( var i = 0 ; i < color.length ; i++ )
					color[i] = String( '0' + color[i] ).slice( -2 ) ;

				return '#' + color.join( '' ) ;
			 });
	},
  	removeFromListBeforeStyleSheet: function(listBeforeClassName)
  	{
  		if(!pe.scene.slideSorter.postListCssStyleMSGList){
  			pe.scene.slideSorter.preListCssStyleMSGList = [];
  			pe.scene.slideSorter.postListCssStyleMSGList = [];
  		}
  		var preListCss = '';
		var postListCss = '';
		var cssClassName = listBeforeClassName+':before';
		var theoldtext = pe.scene.slideSorter.listBeforeStyleStack[listBeforeClassName];
		if(theoldtext != undefined){
			pe.scene.slideSorter.deletelistBeforeStyleStack.push('.'+listBeforeClassName);
  			delete pe.scene.slideSorter.listBeforeStyleStack[listBeforeClassName];
			preListCss = cssClassName +'='+theoldtext;
			postListCss = cssClassName + '=no';
		}else{
			console.log("===>can't find the list before css style:"+cssClassName);
		}
		if(preListCss.length>0 && postListCss.length>0){
			if(PresCKUtil.debug){
				console.log("=======>Old List CSS text:"+preListCss);
				console.log("=======>New List CSS text:"+postListCss);
			}
			pe.scene.slideSorter.preListCssStyleMSGList.push(preListCss);
			pe.scene.slideSorter.postListCssStyleMSGList.push(postListCss);
		}
  	},
  	deleteILBeforeStyles: function(root)
	{
  		root = root.is?root.$:root;
		if(root.nodeName.toLowerCase()=='li'){
			PresCKUtil.deleteILBeforeStyle(root);
		} else 
  		dojo.forEach(dojo.query('li',root),function( listItem ) {
     		PresCKUtil.deleteILBeforeStyle(listItem);
        });
	},
	deleteILBeforeStyle: function(listItem)
	{
		var preListCss = '';
		var postListCss = '';
		var theoldtext = '';
  		if(!pe.scene.slideSorter.postListCssStyleMSGList){
  			pe.scene.slideSorter.preListCssStyleMSGList = [];
  			pe.scene.slideSorter.postListCssStyleMSGList = [];
  		}
		var lineItem = PresListUtil.getLineItem(listItem);
		var oldlistBeforeCss = PresListUtil.getListBeforeClass(lineItem);
		if(oldlistBeforeCss.length > 0){
			theoldtext = pe.scene.slideSorter.listBeforeStyleStack[oldlistBeforeCss];
			pe.scene.slideSorter.deletelistBeforeStyleStack.push('.'+oldlistBeforeCss);
  			delete pe.scene.slideSorter.listBeforeStyleStack[oldlistBeforeCss];
  			if(theoldtext==undefined) {
  				theoldtext = '';
  				preListCss = oldlistBeforeCss +':before=no';
  			}else
  				preListCss = oldlistBeforeCss +':before='+theoldtext;
  			postListCss = oldlistBeforeCss + ':before=no';
  			pe.scene.slideSorter.preListCssStyleMSGList.push(preListCss);
			pe.scene.slideSorter.postListCssStyleMSGList.push(postListCss);
		}
	},
  	updateListBeforeStyleSheet: function(dealdoc,cssstring)
  	{	//from message don't need to add to pre/postListCssStyleMSGList again.
  		//undo/redo will call this function to update list before style.
  		//if (!window.g_noimprove) return;
  		
  		var preListCss = '';
		var postListCss = '';
		
  		for ( var i = 0; i < cssstring.length; i++ )
		{
			var onecsstext = cssstring[i];
			var names = onecsstext.split('=');
  	  		cssClassName = names[0];
  	  		var listClassName = cssClassName.replace(':before','');
  	  		listcsstext = names[1];
	  	  	delete pe.scene.slideSorter.listBeforeStyleStack[listClassName];
			pe.scene.slideSorter.deletelistBeforeStyleStack.push('.'+listClassName);
  	  		if(listcsstext!='no'){
				pe.scene.slideSorter.newlistBeforeStyleStack[listClassName] = listcsstext;
  	  		} 
		}  	 
  		PresCKUtil.doUpdateListStyleSheet();
  	},
  	createListStyleSheetinEditMode: function(eidtordomdoc){
  		var headTag = eidtordomdoc.getElementsByTagName("head")[0];
		if (headTag){
    		dojo.query("style[stylename='list_before_style']", headTag).forEach(dojo.destroy);
    		var listBeforeStyle = eidtordomdoc.createElement("style");
    		dojo.attr(listBeforeStyle,'styleName','list_before_style');
    		dojo.attr(listBeforeStyle,'type','text/css');
    		dojo.attr(listBeforeStyle,'id',MSGUTIL.getUUID());
    		dojo.forEach(dojo.query('li',eidtordomdoc),function( listItem ) {
    			var listStyleName = PresListUtil.getListBeforeClass(listItem,true);
    			var listStyleContent = pe.scene.slideSorter.listBeforeStyleStack[ listStyleName ];
    			var listStyleWholeText = '.' +listStyleName+':before {' +listStyleContent +'}';
    			var rules = eidtordomdoc.createTextNode(listStyleWholeText);
	            listBeforeStyle.appendChild(rules);
    		});
    		headTag.appendChild(listBeforeStyle);
		}
  	},
  	createListStyleSheetinViewMode: function(sorterdomdoc){
  		var headTag = sorterdomdoc.getElementsByTagName("head")[0];
		if (headTag){
    		dojo.query("style[stylename='list_before_style']", headTag).forEach(dojo.destroy);
    		var listBeforeStyle = sorterdomdoc.createElement("style");
    		dojo.attr(listBeforeStyle,'styleName','list_before_style');
    		dojo.attr(listBeforeStyle,'type','text/css');
    		dojo.attr(listBeforeStyle,'id',MSGUTIL.getUUID());
    		for ( var listStyleName in pe.scene.slideSorter.listBeforeStyleStack )
    		{
    			var listStyleContent = pe.scene.slideSorter.listBeforeStyleStack[ listStyleName ];
    			var listStyleWholeText = '.' +listStyleName+':before {' +listStyleContent +'}';
    			var rules = sorterdomdoc.createTextNode(listStyleWholeText);
	            listBeforeStyle.appendChild(rules);
    		}
    		headTag.appendChild(listBeforeStyle);
		}
  	},

  	getCSSRule: function(sheet, ruleName, deleteFlag)
  	{
  		var cssRule = false;
  		var i = 0;
  		do {
  			if (sheet.cssRules)
  			{
  				cssRule = sheet.cssRules[i];
  			}
  			else {
  				cssRule = sheet.rules[i];
  			}
  			if (cssRule)
  			{
  				if (cssRule.selectorText == ruleName)
  				{
  					if (deleteFlag == "delete")
  					{
  						if (sheet.cssRules)
  						{
  							sheet.deleteRule(i);
  						}
  						else {
  							sheet.removeRule(i);
  						}
  						return true;
  					}
  					else {
  						return cssRule;
  					}
  				}
  			}
  			i++
  		} while (cssRule);
  		
  		return false;
  	},
  	
  	
  	doUpdateListStyleSheetupdateTextNode: function(listBeforeStyleSheet,domdocument){
  		if (window.g_noimprove)
  			return this.doUpdateListStyleSheetupdateTextNodeBadPerformance(listBeforeStyleSheet, domdocument);
  /*		var fragment = null;
  		var isUnsupported = null;
		if (dojo.isIE) {
			isUnsupported = true; // for IE, new stylesheet doesn't take efffect immediately
			fragment = listBeforeStyleSheet;
		} else {
			fragment = listBeforeStyleSheet.cloneNode(true);
		}
*/
		var sheet = listBeforeStyleSheet.sheet;
		for (var i = 0; i < pe.scene.slideSorter.deletelistBeforeStyleStack.length; i++)
		{
			var deletListClassName = pe.scene.slideSorter.deletelistBeforeStyleStack[i];
			if(dojo.isIE || dojo.isWebKit) 
				this.getCSSRule(sheet, deletListClassName + "::before", "delete");
			else
				this.getCSSRule(sheet, deletListClassName + ":before", "delete");
		}
		
		for ( var listStyleName in pe.scene.slideSorter.newlistBeforeStyleStack )
		{
			var ruleName = '.' +listStyleName+':before';
			if(dojo.isIE || dojo.isWebKit) 
				ruleName = '.' +listStyleName+'::before';
			var ruleContent =  pe.scene.slideSorter.newlistBeforeStyleStack[ listStyleName ];
			var rule = ruleName + ' {' +ruleContent +'}';
			if (sheet.addRule)
			{
				sheet.addRule(ruleName, ruleContent);
			}
			else {
				sheet.insertRule(rule, 0);
			}
		}
		return;
		/*
		if(pe.scene.slideSorter.deletelistBeforeStyleStack.length>0){
			var childNodes = fragment.childNodes;
			for(var i=0;i<childNodes.length;i++){
				var textContent = childNodes[i].textContent;
				for(j=0;j<pe.scene.slideSorter.deletelistBeforeStyleStack.length;j++){
					var deletListClassName = pe.scene.slideSorter.deletelistBeforeStyleStack[j];
					if(textContent.indexOf(deletListClassName)==0){
						fragment.removeChild(childNodes[i]);
						i = i-1;
						break;
					}
				}
			}
		}

		for ( var listStyleName in pe.scene.slideSorter.newlistBeforeStyleStack ) {
			var listStyleContent = pe.scene.slideSorter.newlistBeforeStyleStack[ listStyleName ];
			var listStyleWholeText = '.' +listStyleName+':before {' +listStyleContent +'}';
			var rules = domdocument.createTextNode(listStyleWholeText);
			fragment.appendChild(rules);
		}

		if (!isUnsupported)
			listBeforeStyleSheet.parentNode.replaceChild(fragment, listBeforeStyleSheet);
		*/
		
		//return fragment; // only used by slidesorter currently
  	},
  	
  	doUpdateListStyleSheetupdateTextNodeBadPerformance: function(listBeforeStyleSheet,domdocument){
  		var fragment = null;
  		var isUnsupported = null;
		if (dojo.isIE) {
			isUnsupported = true; // for IE, new stylesheet doesn't take efffect immediately
			fragment = listBeforeStyleSheet;
		} else {
			fragment = listBeforeStyleSheet.cloneNode(true);
		}

		if(pe.scene.slideSorter.deletelistBeforeStyleStack.length>0){
			var childNodes = fragment.childNodes;
			for(var i=0;i<childNodes.length;i++){
				var textContent = childNodes[i].textContent;
				for(j=0;j<pe.scene.slideSorter.deletelistBeforeStyleStack.length;j++){
					var deletListClassName = pe.scene.slideSorter.deletelistBeforeStyleStack[j];
					if(textContent.indexOf(deletListClassName)==0){
						fragment.removeChild(childNodes[i]);
						i = i-1;
						break;
					}
				}
			}
		}

		for ( var listStyleName in pe.scene.slideSorter.newlistBeforeStyleStack ) {
			var listStyleContent = pe.scene.slideSorter.newlistBeforeStyleStack[ listStyleName ];
			var listStyleWholeText = '.' +listStyleName+':before {' +listStyleContent +'}';
			var rules = domdocument.createTextNode(listStyleWholeText);
			fragment.appendChild(rules);
		}

		if (!isUnsupported)
			listBeforeStyleSheet.parentNode.replaceChild(fragment, listBeforeStyleSheet);

		return fragment; // only used by slidesorter currently
  	},

  	doUpdateListStyleSheet: function(){
  		var contentBox = window.pe.scene.getContentBoxCurrentlyInEditMode();
  		var bEditModeOn = (contentBox != null) && contentBox.isEditModeOn();
		if (bEditModeOn) {
			var tdocument = contentBox.editor.document; //Editor CK instance in Iframe
			var listBeforeStyleSheetinEditMode = PresCKUtil.getListBeforeStyleSheet(tdocument);
			PresCKUtil.doUpdateListStyleSheetupdateTextNode(listBeforeStyleSheetinEditMode,tdocument.$);
		}

		if (dojo.isIE || !bEditModeOn) {
			var listBeforeStyleSheetinViewMode = PresCKUtil.getListBeforeStyleSheet(window.document);
			PresCKUtil.doUpdateListStyleSheetupdateTextNode(listBeforeStyleSheetinViewMode,window.document);
			
			var listBeforeStyleSheetinSorter = pe.scene.slideSorter.getListBeforeStyleSheetInSorter();
			var fragment =
				PresCKUtil.doUpdateListStyleSheetupdateTextNode(listBeforeStyleSheetinSorter,
						pe.scene.slideSorter.getSorterDocument());
			pe.scene.slideSorter.listBeforeStyleSheet = fragment;
		}

		for (var listStyleName in pe.scene.slideSorter.newlistBeforeStyleStack)
		{
			var listStyleContent = pe.scene.slideSorter.newlistBeforeStyleStack[ listStyleName ];
			pe.scene.slideSorter.listBeforeStyleStack[listStyleName] = listStyleContent;

			// use it when close editor
			pe.scene.slideSorter.newStyle[listStyleName] = listStyleContent;
		}

		// use it when close editor
		pe.scene.slideSorter.newlistBeforeStyleStack = {};
		if (pe.scene.slideSorter.deletelistBeforeStyleStack.length) {
			pe.scene.slideSorter.delStyle =
				pe.scene.slideSorter.delStyle.concat(pe.scene.slideSorter.deletelistBeforeStyleStack);
		}
		pe.scene.slideSorter.deletelistBeforeStyleStack = [];
  	},

  	duplicateListBeforeStyleInSlide: function(root){
  		root = root.is?root.$:root; 
 		dojo.forEach(dojo.query('li',root),function( listItem ) {
			var oldILCSClassName = PresListUtil.getListBeforeClass(listItem);
			if(oldILCSClassName && oldILCSClassName.length > 0)
				PresCKUtil.duplicateListBeforeStyle(oldILCSClassName,listItem,true);
			else 
				PresListUtil.prepareStylesforILBefore(listItem,true);
        });
  	},
  	duplicateListBeforeStyle: function(oldILCSClassName,liNode,donotupdate){
  		if(!PresCKUtil.checkNodeName(liNode, 'li')) return;
  		liNode = PresCKUtil.ChangeToCKNode(liNode);
  		var theoldtext = pe.scene.slideSorter.listBeforeStyleStack[oldILCSClassName];
  		if (!theoldtext && window.pe.scene.slideSorter.oldListBeforeStyleStack)
  			theoldtext = window.pe.scene.slideSorter.oldListBeforeStyleStack[oldILCSClassName];
  		
		if(!donotupdate){
			pe.scene.slideSorter.newlistBeforeStyleStack = {};
		}
		var newILCSClassName = '';
		var liNodeid = liNode.getId();
		if(liNodeid)
			newILCSClassName = 'IL_CS_'+liNodeid;
		else 
			newILCSClassName = 'IL_CS_'+MSGUTIL.getUUID();
		
		liNode.addClass( newILCSClassName );
		var newListCssName = newILCSClassName+':before';
		
  		if(!pe.scene.slideSorter.postListCssStyleMSGList){
  			pe.scene.slideSorter.preListCssStyleMSGList = [];
  			pe.scene.slideSorter.postListCssStyleMSGList = [];
  		}
  		var preListCss = '';
		var postListCss = '';
  		
		var listStyle = '';
		if(theoldtext!=undefined){
			var ruleArray = PresCKUtil.turnStyleStringToArray(theoldtext);
			//For D37703, for duplicate IL, we should really duplicate, 
			//but should not add styles whihc are not exits on old style
  	  		if(!ruleArray){
  	  			ruleArray = [];
  	  			ruleArray['font-size'] = '';
  	  			ruleArray['font-weight'] = '';
  	  			ruleArray['font-style'] = '';
  	  			ruleArray['font-family'] = '';
  	  		}
			var firstSpan = PresCKUtil.getFirstVisibleSpanFromLine(liNode);
			if (firstSpan) {
				
				firstSpan = PresCKUtil.ChangeToCKNode(firstSpan);
				var fontSize = ruleArray.hasOwnProperty("font-size") ? firstSpan.$.style.fontSize : '';
			 	var fontWeight = ruleArray.hasOwnProperty("font-weight") ? firstSpan.$.style.fontWeight : '';
				var fontStyle = ruleArray.hasOwnProperty("font-style") ? firstSpan.$.style.fontStyle : '';
				var fontFamily = ruleArray.hasOwnProperty("font-family") ? firstSpan.$.style.fontFamily : '';
				
				var computedStyle = dojo.getComputedStyle(firstSpan.$);
				if(fontSize && fontSize.length > 0){
					fontSize = PresFontUtil.convertFontsizeToPT(fontSize);
					fontSize = parseFloat(fontSize) /18.0 +'em';
				} else {
					fontSize = parseFloat(PresFontUtil.convertFontsizeToPT(computedStyle.fontSize)) /18.0 +'em';
				}
				ruleArray['font-size'] = fontSize +' !important';
				var olulnode = liNode.getParent();
				var isNumber = olulnode.getAttribute( 'numberType' );
				if(isNumber && isNumber.length>0){
					ruleArray['font-weight'] = fontWeight.length>0 ? fontWeight +' !important':'';
					ruleArray['font-style'] = fontStyle.length>0 ? fontStyle +' !important':'';
					// for Arial, Helvetica, sans-serif, we need to get the Arial instead
					// otherwise, the CSS style would not be refreshed correctly
					if(fontFamily.indexOf(',')>0){
						fontFamily = fontFamily.substring(0,fontFamily.indexOf(','));
					}
					ruleArray['font-family'] = fontFamily.length>0 ? fontFamily +' !important':'';
				} else {
					//bullet type
					ruleArray['font-weight'] = '';
					ruleArray['font-style'] = '';
					var listClassesString = dojo.attr( liNode.$, 'class');
					if(listClassesString.indexOf('lst-ta')>0){
						ruleArray['font-family']='Wingdings !important';
					}else if(listClassesString.indexOf('lst-ra')>0||listClassesString.indexOf('lst-cm')>0){
						ruleArray['font-family']='Webdings !important';
					}else if(listClassesString.indexOf('lst-d')>0 ||listClassesString.indexOf('lst-da')>0){
						ruleArray['font-family']='"Times New Roman" !important';
					}else if(listClassesString.indexOf('lst-a')>0){
						ruleArray['font-family']='Symbol !important';
					}else if(listClassesString.indexOf('lst-ps')>0){
						ruleArray['font-family']='Impact !important';
					}else if(listClassesString.indexOf('lst-c')>0||listClassesString.indexOf('ML_defaultMaster_Content_outline_1')>0){
						ruleArray['font-family']='Arial !important';
					}else {
						ruleArray['font-family']='';
					}
				}
				//build as text
				var thenewtext = PresCKUtil._arrayToStyleString(ruleArray);
				postListCss = newListCssName  + '='+thenewtext;
				if(oldILCSClassName == newILCSClassName){
					preListCss = newListCssName + '='+theoldtext;
					pe.scene.slideSorter.deletelistBeforeStyleStack.push('.'+newILCSClassName);
				}else{
					preListCss = newListCssName + '=no';
				}
				pe.scene.slideSorter.newlistBeforeStyleStack[newILCSClassName] = thenewtext;
				pe.scene.slideSorter.listBeforeStyleStack[newILCSClassName] = thenewtext;
			}
		}else{
			//console.log("===>can't find the list before css style:"+oldILCSClassName +" need do copyAllFirstSpanStyleToILBefore.");
			PresListUtil.prepareStylesforILBefore(liNode,true);
		}
		if(preListCss.length>0 && postListCss.length>0){
			if(PresCKUtil.debug){
				console.log("=======>Old List CSS text:"+preListCss);
				console.log("=======>New List CSS text:"+postListCss);
			}
			pe.scene.slideSorter.preListCssStyleMSGList.push(preListCss);
			pe.scene.slideSorter.postListCssStyleMSGList.push(postListCss);
		}
		
		if(!donotupdate){
	  		PresCKUtil.doUpdateListStyleSheet();
		}
  	},
  	_getModelValueDiv: function(className)
  	{
  		var classDiv = document.getElementById(className);
  		if(!window.__pres2 && !classDiv)
  			classDiv = CKEDITOR.instances.editor1.document.$.getElementById(className);
  		if(!classDiv)
  			return null;
  		classDiv = this.ChangeToCKNode(classDiv);
  		return classDiv;
  	},
  	
  	//if the style not exist, it will return null, otherwise return the value
  	//className : css rule name, such as "lst-c"
  	//styleName :  the name of style, such as "fontsize"
  	//[Return] the value of style, such as "1em"
  	getAbsModuleValue: function(className,styleName)
  	{
  		var classDiv =  this._getModelValueDiv(className);
  		if(!classDiv)
  			return null;
		var value = classDiv.getAttribute(styleName);
		return value;
  	},
  	
  	updateIdForAllSpans: function(rootNode) 
  	{
  		if (!rootNode || rootNode == null)
  			return;
  		
  		var ckNode = PresCKUtil.ChangeToCKNode(rootNode);
  		dojo.query('span',ckNode.$).forEach(function(_node){
  			var node = PresCKUtil.ChangeToCKNode(_node);
  			
  			if (!node.hasAttribute('id'))
  				concord.util.HtmlContent.injectRdomIdsForElement(node.$);
  		});
  	},
  	  	
  	//update the relative value of node and child
  	//Order is update itself first, then its child
  	//For li, it need update:
  	//	[font-size] for its bullet size use abs-bullet-scale
  	//	[margin-left] get its em first,(according system default fontsize) 
  	//	then get relative according to its fontsize
  	
  	//For p, it need update:
  	//	[margin-left] get its em (according system default fontsize) 
  	
  	//For span, it need update:
  	//	[font-size] get its em (according system default fontsize), 
  	//  then  get relative according to its parent <li>/<p> fontsize
  	updateRelativeValue: function(_node,abs_styleNames)
  	{
  		this._updateRelativeValue(_node,abs_styleNames,false);
  	},
  	
  	_updateRelativeValue: function(_node,abs_styleNames,bAutoTestMode)
  	{
  		function _getRelativeStyleName(node, abs_styleName)
  		{
  			switch(abs_styleName)
  			{
  			case PresConstants.ABS_STYLES.TEXTINDENT:
  				return "text-indent";
  			case PresConstants.ABS_STYLES.MARGINLEFT:
  				return (node && node.getStyle('direction') === 'rtl') ? "margin-right" : "margin-left";
  			case PresConstants.ABS_STYLES.FONTSIZE:
  			case PresConstants.ABS_STYLES.BULLETSCALE:
  				return "font-size";	
  			}
  			return null;
  		};
		function _getFloatFontsize(node)
		{
	  		var selfFS = node.getStyle( 'font-size' );
	  		if(selfFS)
	  		{
	  	        var ndx = selfFS.indexOf( 'em' );
	  	        if (ndx >= 0)
	  	        {
	  	        	selfFS = selfFS.substring(0, ndx);
	  	        	selfFS = parseFloat(selfFS);
	  	        	return selfFS;
	  	        }
	  		}
	  		return null;
		};
  		function _updateValueForLine(lineNode,abs_styleNames)
  		{
  			var reportString = "";
  			var curTBInfo = PresCKUtil.getCurrentTextboxInfo(lineNode);
  			if(!curTBInfo)//This value is very import, if missing, we are in the environment not certain
  			{
  				if(bAutoTestMode)
  				{
  					reportString = "Could not find textbox infomation for line : id = {"+lineNode.getAttribute("id") + "} \r\n";
  				}  				
	  			return {
					reportString : reportString,
					couldContinueTest : true
				};
  			};
			
  			for(var i=0;i<abs_styleNames.length;i++)
  			{
  				var selfAbsValue = PresCKUtil.getAbsoluteValue(lineNode,abs_styleNames[i]);
  				var relStyleName = _getRelativeStyleName(lineNode, abs_styleNames[i]);
	  	  		switch(abs_styleNames[i])
	  	  		{
	  	  			case PresConstants.ABS_STYLES.TEXTINDENT:
					case PresConstants.ABS_STYLES.MARGINLEFT:
					{
						//get its absolute value
						
						if(!selfAbsValue || isNaN(selfAbsValue))
							selfAbsValue = 0;
						selfAbsValue = parseFloat(selfAbsValue);//unit is cmm (cm*1000)

			  			var fRelValue = selfAbsValue/curTBInfo.absWidth*100.0; //%
			  			//keep text-indent could not exceed marging-left
			  			//otherwise, the text or bullet will move out the textbox
			  			if(relStyleName == 'margin-left' || relStyleName == 'margin-right')
			  			{
				  			var preTextIndentValue = lineNode.getStyle( 'text-indent' );
				  			var fPreTextIndentValue = PresCKUtil._percentToFloat(preTextIndentValue)*100;
				  			if((fRelValue+fPreTextIndentValue)<0.0)
				  			{
				  				var needFixTextIndentValue = fRelValue*(-1.0);
				  				var value = needFixTextIndentValue + '%';
				  				lineNode.setStyle( 'text-indent', value);
				  			}
			  			}
			  			else if(relStyleName == 'text-indent')
			  			{
				  			var preMarginLeftValue = lineNode.getStyle( 'margin-left' );
				  			var fPreMarginLeftValue = PresCKUtil._percentToFloat(preMarginLeftValue)*100;
				  			if((fRelValue+fPreMarginLeftValue)<0.0)
				  				fRelValue = fPreMarginLeftValue*(-1.0);
			  			}

		  		  		var relStyleValue = fRelValue+'%';
		  		  		if(bAutoTestMode)
		  		  		{
		  		  			var preRelValue = lineNode.getStyle( relStyleName );
		  		  			if(preRelValue)
		  		  			{
		  		  				var fPreRelValue = PresCKUtil._percentToFloat(preRelValue)*100;
		  		  				var dis = fPreRelValue - fRelValue;
		  		  				if(dis>0.1 || dis<-0.1 )//precision should not big 0.1%
		  		  				{
		  		  					var reStr = "line id:{" + lineNode.getAttribute("id") + "} has dismatch [" + relStyleName + "]\r\n";
		  		  					reStr+="ReCaluValue = " + fRelValue+", CurrentValue = "+fPreRelValue+"\r\n";
		  		  					reportString += reStr;
		  		  					reportString += "\r\n";
		  		  				}
		  		  			}
		  		  		}
		  		  		else
		  		  			lineNode.setStyle( relStyleName, relStyleValue);
		  		  		break;
					}
					case PresConstants.ABS_STYLES.FONTSIZE:
					{
						if(!bAutoTestMode)
						{
							//li node deson't allow fontsize style. remove it font-size style here.
							lineNode.removeStyle(relStyleName);
						}
						break;
					}
	  	  		}
  			}
  			
			return {
				reportString : reportString,
				couldContinueTest : true
			};
  		}
  		
  		function _updateValueForSpan(spanNode,abs_styleNames)
  		{
  			var reportString = "";
  			for(var i=0;i<abs_styleNames.length;i++)
  			{
	  	  		switch(abs_styleNames[i])
	  	  		{
					case PresConstants.ABS_STYLES.FONTSIZE:
					{
						//D35561: [B2B][Regression]Hyperlink font size change bigger after press ctrl+c
						//Temp fix for <span><a><span> structure. we won't allow these structure in futrue relaease.
						var firstEl = spanNode.getFirst();
			  			if(firstEl && PresCKUtil.checkNodeName(firstEl,'a')){
			  				continue;
			  			}
			  			
						//get its absolute value
						var selfAbsValue = bSpeakerNotesEditingMode?18:PresCKUtil.getAbsoluteValue(spanNode,PresConstants.ABS_STYLES.FONTSIZE);
						selfAbsValue = parseFloat(selfAbsValue);
						//change it to standard em
		  		  		var standardFS = "18";//defModelDiv.getAttribute(PresConstants.ABS_STYLES.FONTSIZE);
		  		  		standardFS = parseFloat(standardFS);
		  		  		var fRelValue = selfAbsValue/standardFS;
		  		  		
		  		  		var relStyleName = _getRelativeStyleName(null, PresConstants.ABS_STYLES.FONTSIZE);
		  		  		
		  		  		/*//Then try to get the fontsize of its parent <p>/<li>
		  		  		 * p orli node deson't allow fontsize style. remove it.
		  		  		var fLineFS = _getFloatFontsize(spanNode.getParent());
		  		  		if(fLineFS)
		  		  		{
			  		  		//parent has font size, then should eliminate the affect
			  		  		fRelValue = fRelValue/fLineFS;
		  		  		}*/
		  		  		var relStyleValue = fRelValue+'em';						
		  		  		if(bAutoTestMode)
		  		  		{
		  		  			var fPreRelValue = _getFloatFontsize(spanNode);
		  		  			if(fPreRelValue)
		  		  			{
		  		  				var dis = fPreRelValue - fRelValue;
		  		  				if(dis>0.01 || dis<-0.01 )//precision should not big 0.01em
		  		  				{
		  		  					var line  = spanNode.getParent();
		  		  					var reStr = "line id:{" + line.getAttribute("id") + "} has dismatch [" + relStyleName + "]\r\n";
		  		  					reStr+="ReCaluValue = " + fRelValue+", CurrentValue = "+fPreRelValue+"\r\n";
		  		  					reportString += reStr;
		  		  					reportString += "\r\n";
		  		  				}
		  		  			}
		  		  		}
		  		  		spanNode.setStyle( relStyleName, relStyleValue);

		  		  			
					}
					break;
	  	  		}
  			}

			return {
				reportString : reportString,
				couldContinueTest : true
			};
  		}
  		
  		function _updateValueForOneNode(node,abs_styleNames)
  		{
  			var nodeName = node.getName().toLowerCase();
  			switch(nodeName)
  			{
  			case 'span':
  				return _updateValueForSpan(node,abs_styleNames);
  				break;
  			case 'li':
  			case 'p':
  				return _updateValueForLine(node,abs_styleNames);
  				break;
  			}
  			
  			return {
  					reportString : "",
  					couldContinueTest : true
  			};
  		}
  		
  		var strAutoTestReport = "";
 			
  		//If do not mean which value should be update
  		//then we should update all
  		if(!abs_styleNames)
  		{
  			abs_styleNames = [];
  			abs_styleNames.push(PresConstants.ABS_STYLES.MARGINLEFT);
  			abs_styleNames.push(PresConstants.ABS_STYLES.TEXTINDENT);
  			abs_styleNames.push(PresConstants.ABS_STYLES.FONTSIZE);
  		}
  		
  		var rootNode = this.ChangeToCKNode(_node);
	  	
  		var bSpeakerNotesEditingMode = false;
  	  	var report = {
  					reportString : "",
  					couldContinueTest : true
  				};
  	  	if(rootNode)
  	  	{
  	  		if(!window.__pres2)
  	  		{
  	  		var editor = PresCKUtil.getCurrentEditModeEditor();
  	  		if(editor)
  	  		{
  	  			var aDrawFrameContainer = PresCKUtil.ChangeToCKNode(editor.contentBox.mainNode);
  	  			if((aDrawFrameContainer.getAttribute('presentation_class') == 'notes')
  	  					&& (rootNode.is('p','li','span')))
  	  			{
  	  				var aDiv = rootNode;
	  	  			while(aDiv)
	  				{
	  					if(aDiv.is('div')
	  							&&aDiv.hasClass('draw_frame'))
	  					{
	  						var aPageNode = aDiv.getParent();
	  						if(aPageNode && aPageNode.is
	  								&& aPageNode.hasClass('draw_page')
	  								&& aPageNode.hasAttribute('draw_master-page-name'))
	  						{
	  							break;		
	  						}
	  					}						
	  					aDiv = aDiv.getParent();
	  				}
	  	  			
	  	  			if(!aDiv || aDiv.equals(aDrawFrameContainer))
	  	  				bSpeakerNotesEditingMode = true;
  	  				
  	  			}
  	  		}
  	  		}
  	  		
  	  		var _re = _updateValueForOneNode(rootNode,abs_styleNames);
	  	  	if(bAutoTestMode)
  	  	  	{
  	  	  		report.reportString += _re.reportString;
  	  	  		if(!_re.couldContinueTest)
  	  	  			return report;
  	  	  	}
  	  	  	
  	  		var nodeTypes =["p,li","span"];//order is important, since must update <p>/<li> firstly
  	  		for(var k=0;k<nodeTypes.length;k++)
  	  		{
  	  			allSubNodes = dojo.query(nodeTypes[k],rootNode.$);
  	  			for(var n=0;n<allSubNodes.length; n++)
  	  			{
  	  				var node = this.ChangeToCKNode(allSubNodes[n]);
  	  				var _re = _updateValueForOneNode(node,abs_styleNames);
  	    	  	  	if(bAutoTestMode)
  	    	  	  	{
  	    	  	  		report.reportString += _re.reportString;
  	    	  	  		if(!_re.couldContinueTest)
  	    	  	  			return report;
  	    	  	  	}
  	  			}
  	  		}
  	  	}
  	  	return report;
  	},  	
  	
  	//node must be <span / li /p> 
  	getAbsoluteValue: function(_node,_styleName)
  	{
  		var node = this.ChangeToCKNode(_node);
  		if(!node.is('li','span','p','div'))
  			return null;
  		//Check its own custom style
  		var vCustomValue = node.getAttribute(_styleName);
  		if(vCustomValue)
  		{//if has,return it
  			return vCustomValue;
  		}
  		vCustomValue = this.getCustomStyle(node, _styleName);
  		if(vCustomValue)
  		{//if has,return it
  			return vCustomValue;
  		}
			//in case of <span><A><span>
		var aLinkTest = node.getParent();
		if(PresCKUtil.checkNodeName(aLinkTest,'a'))
		{
			var linkSpan = aLinkTest.getParent();
			if(PresCKUtil.checkNodeName(linkSpan,'span'))
			{
		  		//Check its own custom style
		  		vCustomValue = linkSpan.getAttribute(_styleName);
		  		if(vCustomValue)
		  		{//if has,return it
		  			return vCustomValue;
		  		}
		  		vCustomValue = this.getCustomStyle(linkSpan, _styleName);
		  		if(vCustomValue)
		  		{//if has,return it
		  			return vCustomValue;
		  		}
			}
		}
  		
  		if(!node.is('div'))
  		{	//find the value from its parent
  			//try to find the custom style in list
  			var lineItem = node;
  			//if it is a <span>
  			if(lineItem.is('span'))
  			{
  				//Search span class
  				var cls = lineItem.getAttribute('class');
  				if (cls == undefined || cls == null){
  					cls = " ";
  				}
  				var listClasses = cls.split(' ');
  				for ( var j = 0 ; j < listClasses.length; j++)
  				{
	    			vCustomValue = this.getAbsModuleValue(listClasses[j],_styleName);
	  	  	  	   if(vCustomValue)
	  	  	  	  	 {//if has,return it
	  	  	  	  	  			return vCustomValue;
	  	  	  	  	}
  				}
  				  				
  				//get the parent li/p
  				lineItem = node.getAscendant('li')||node.getAscendant('p');
  				if(lineItem)
  				{
  	  				vCustomValue = this.getCustomStyle(lineItem, _styleName);
  	  		  		if(vCustomValue)
  	  		  		{//if has,return it
  	  		  			return vCustomValue;
  	  		  		}
  	  		  		//TODO for external table the attributes are not on span node but td/table node. 
//  	  		  		else
//  	  		  		{
//  	  		  			var table = node.getAscendant('table');
//  	  		  			if(table && table.$ && dojo.hasClass(table.$,'smartTable'))
//  	  		  			{
//	  	  		  			lineItem = node.getAscendant('td');
//		  	  		  		vCustomValue = this.getCustomStyle(lineItem, _styleName);
//		  	  		  		if(vCustomValue)
//		  	  		  			return vCustomValue;
//		  	  		  		else
//		  	  		  		{
//		  	  		  			lineItem = table;
//		  	  		  			vCustomValue = this.getCustomStyle(lineItem, _styleName);
//			  	  		  		if(vCustomValue)
//			  	  		  			return vCustomValue;
//		  	  		  		}  	  		  				
//  	  		  			}	
//  	  		  		}	
  				}
  			}
  			//Then get the list style
  			//find list own "lst-/IL" class
  			var lc = PresListUtil.getListClass(lineItem);
  			if(lc)
  			{
  				//The order in lc is very import
  				//it could ensure we first seach lst, then master
  				//the order reference function PresListUtil.getListClass in pres/ListUtil.js
  				for(var p in lc)
  				{
  					if(lc[p])
  					{
  						for(var k=0;k<lc[p].length;k++)
  						{
  	  						var className = lc[p][k];
  	  	    				vCustomValue = this.getAbsModuleValue(className,_styleName);
  	  	  	  	  	  		if(vCustomValue)
  	  	  	  	  	  		{//if has,return it
  	  	  	  	  	  			return vCustomValue;
  	  	  	  	  	  		}
  	  	  	  	  	  		//if not found, we try find "xxx:before"
  	  	  	  	  	  		className = className + PresConstants.LIST_BEFORE;
  	  	    				vCustomValue = this.getAbsModuleValue(className,_styleName);
  	  	  	  	  	  		if(vCustomValue)
  	  	  	  	  	  		{//if has,return it
  	  	  	  	  	  			return vCustomValue;
  	  	  	  	  	  		}
  						}
  					}
  				}
  			}
  		}
  		//At last we could not find anything, then we should default value
  		switch(_styleName)
  		{
  		 case PresConstants.ABS_STYLES.FONTSIZE:
  			 {
  			 // table always use fontsize 18 as the default one.
  			 if(pe.scene.fixedTableFontsize)
  				 return 18;
  			 else
  				 return pe.scene.doc.fontSize || "18";
  	  			return null;
  			 }
  		}   		
  		return null;
  	},

  	//change a string to style array
  	//string format : abc:XXX;efg:YYY;oopo:ZZZ;....
  	//Array format :  Array[styleName] = value
  	turnStyleStringToArray: function(styleString)
  	{
 		var styleArray = [];
 		if (styleString){
 			if (!dojo.isIE)
 			{
 				if (styleString && styleString.charAt(styleString.length-1) == ';')
 					styleString = styleString.substring(0,styleString.length-1);
 			}
 			styleArray = styleString.split(';'); 
 		}
 		else
 			return null;
 		var styleProp = [];
		for (var i=0; i< styleArray.length; i++){
			var entry = styleArray[i];
			var styleName ='';
			var styleValue ='';
			var semiIndex = entry.indexOf(':');
			if (semiIndex >=0){
				styleName = dojo.trim(entry.substring(0,semiIndex));
				styleValue = dojo.trim(entry.substring(semiIndex+1));
				styleProp[styleName]=styleValue;
			}			
		}
 		
 		return styleProp;
  	},
  	
  	//array to stryle string
  	//Array format :  Array[styleName] = value
  	//string format : abc:XXX;efg:YYY;oopo:ZZZ;....
  	_arrayToStyleString: function(styleProp)
  	{
  		var stylesText = '';  		
		for ( var style in styleProp )
		{
			var styleVal = styleProp[ style ]+'';
			styleVal = dojo.trim(styleVal);
			if(styleVal && styleVal.length>0){
				var text = style + ':' + styleVal +';';
				stylesText += text;
			}
		}
		return stylesText;
  	},
  	
  	_getCustomStyleList: function(_node)
  	{
  		var node = this.ChangeToCKNode(_node);
  		if (node) {
	  		var styleInfoForNode = node.getAttribute("customstyle");
	  		return this.turnStyleStringToArray(styleInfoForNode);
  		}
  	},
  	
  	//GetCustomStyle
  	getCustomStyle: function(_node,_styleName)
  	{
  		var styleProp = this._getCustomStyleList(_node);
  		if(styleProp)
  			return styleProp[_styleName];
  		return null;
  	},
  	
  	//SetCustomStyle
  	setCustomStyle: function(_node,_styleName,_styleValue)
  	{
  		var node = this.ChangeToCKNode(_node);
  		var styleProp = this._getCustomStyleList(node);
  		if(!styleProp)
  		{
  				styleProp = [];
  		}
  		styleProp[_styleName] = _styleValue;
  		var stylesText = this._arrayToStyleString(styleProp);
		node.setAttribute("customstyle",stylesText);
  	},
  	
  	//RemoveCustomStyle
  	removeCustomStyle: function(_node,_styleName)
  	{
  		var node = this.ChangeToCKNode(_node);
  		var styleProp = this._getCustomStyleList(node);
  		if(!styleProp)
  		{
  				styleProp = [];
  		}
  		var newStyleProp = [];
		for ( var style in styleProp )
			if(style!=_styleName)
				newStyleProp[style] = styleProp[ style ];

  		var stylesText = this._arrayToStyleString(newStyleProp);
		node.setAttribute("customstyle",stylesText);
  	},
  	

	//line is il,ou,ul,p
	//If the line is an empty line ,return its first span
	getFirstVisibleSpanFromLine: function(line,bFromEnd){
		if(!line || !line.is || !line.is('a','p','ol','ul','li'))
		{
			//debugger;
			return null;
		}
		var bEmptyLine = this.isNodeTextEmpty(line);
		var lineItem = PresListUtil.getLineItem(line);
		if(line.is('a'))
			lineItem = line;
		if(!lineItem)
			return null;
		var bEndWithBR = true;
		if(!PresCKUtil.checkNodeName(lineItem.getLast(),'br'))
		{
			bEndWithBR = false;
			//console.warn('getFirstVisibleSpanFromLine detect no <br> end error, the line strucure is : ['+ line.getOuterHtml() +']');
		}
		//Last node of line must be <br>
		var children = lineItem.getChildren();
		var count = children.count();
		
		for ( var i = bFromEnd?(bEndWithBR?(count-2):(count-1)):0;
		bFromEnd?(i >= 0):(i < count-1); 
		bFromEnd?(i--):(i++)  )
		{
			var span = children.getItem( i );
			if(	PresCKUtil.checkNodeName(span,'br'))
					break;
			span = span.type == CKEDITOR.NODE_TEXT?span.getParent():span;
			
			//<li/p><a><span>xxxx</span></a></li>
			//<p/li><span><a><span>xxxx</span></a></span></li>
			var isa = span.getFirst();
			if(isa && isa.type != CKEDITOR.NODE_TEXT && isa.is('a')){
				span = isa;
			}
			
			if(span.is('a') && !this.isNodeTextEmpty(span)){
				return this.getFirstVisibleSpanFromLine(span);
			}
			
			var isBrTextBreak = bFromEnd?span.getPrevious():span.getNext();
			if(span.is('span') && PresCKUtil.checkNodeName(isBrTextBreak,'br') && dojo.hasClass(isBrTextBreak.$,'text_line-break') )
				return span;
				
			if(span.is('span') && (bEmptyLine || !this.isNodeTextEmpty(span.$)) && !span.hasAttribute('data-cke-bookmark'))
				return span;
		}
		
		//not found, and want to return null
		//last try
		//if it is not an empty line, 
		//and could not find the span at above logic, 
		//it might be one line contian white space
		//we try to found the first span
		if(!bEmptyLine)
		{
			var firstSpan = null;
			for(var i=0;i<count;i++)
			{
				var child = lineItem.getChild(i);
				if(PresCKUtil.checkNodeName(child,'br'))
					break;
				if(PresCKUtil.checkNodeName(child,'span'))
				{
					if(bFromEnd && child)
						firstSpan = child;
					
					if(!bFromEnd && !firstSpan)
						firstSpan = child;
					
					if(!this.isNodeTextEmpty(child))
						return child;
				}
			}
			if(firstSpan)
				return firstSpan;
		}
		console.error('getFirstVisibleSpanFromLine fail, the line strucure must error : ['+ line.getOuterHtml() +']');
		return null;
	},
	
	//get the line in the range selection
	//if the selection is part of one line, it also return the line it belong to
	//no matter the selection is a range of text or lines/textbox/table_cell
	//Currently we could not do any text/line action while select textbox
	//return is an object contain array of <ol>/<ul>/<p>, also contain the rootNode of the those line
	//the root node must be td/div/table
	getLinesSelected: function(editor)
	{
		function _getParentDiv(node)
		{
			var div = null;
			if(node.is('ol','ul','p'))
				div = node.getParent();
			else if(node.is('li'))
			{
				var parent = node.getParent();
				if(parent)
					div = parent.getParent();
			}
			else if(node.is('span'))
			{
				var parent = node.getParent();
				if(parent)
				{
					if(parent.is('p'))
						div = parent.getParent();//get ol.ul
					else if(parent.is('li'))
					{
						var grandParent = parent.getParent();//get ol.ul
						if(grandParent)
							div = grandParent.getParent();
					}
				}
			}
			return div;
		}
		
		var selectLines = [];
		var rootNode = null;
		if(!editor)
			editor = window.pe.scene.getEditor();
		var selection = editor.getSelection();
		var range = selection.getRanges()[0];
		var bSelectEditingText = false;
		
		//check whether we select textbox or text/line in table
		var startblock = MSGUTIL.getBlock(range.startContainer);
		var endblock = MSGUTIL.getBlock(range.endContainer);
		if(startblock.is('ol','ul','li','p','span')
				&& endblock.is('ol','ul','li','p','span')
				)
		{
			var divStart = _getParentDiv(startblock);
			var divEnd = _getParentDiv(endblock);

			if(divStart&&divEnd
					&&divStart.is('div','td','th')&&divEnd.is('div','td','th')
					&&divStart.equals(divEnd))
			bSelectEditingText = true;
		}
		
		if(!editor.isTable 
				&& (startblock.is('div') || endblock.is('div')))
		{
			var div = startblock.is('div')?startblock:endblock;
			dojo.query('ol,ul,p',div.$).forEach(function(node){
				var line = PresCKUtil.ChangeToCKNode(node);
				selectLines.push(line);
			});
		}
		
		if(editor.isTable)
		{
			//check whether we select table cell
			var selectedCells = PresListUtil.getSelectedTableCells( selection);
			if(selectedCells.length>1)
				bSelectEditingText = false;
			if(!bSelectEditingText)
			{
				//try to get the table node
				var table = selectedCells[0];
				while(table)
				{
					if(table.is('table'))
						break;
					table = table.getParent();
				}
				if(table)
				{
					for(var c=0;c<selectedCells.length;c++)
					{
						var sel = dojo.query("ol,ul,p",selectedCells[c].$); 
						for(var i=0;i<sel.length;i++)
						{
							var node = PresCKUtil.ChangeToCKNode(sel[i]);
							selectLines.push(node);
						}
					}			

					rootNode = table;
				}
			}
		}

		//we only select text/line in textbox, not textbox or table cell
		if(bSelectEditingText)
		{
	 		//If not in table cross cell selection
			var startLine = this.getLineNode(range.startContainer);
			var endLine = this.getLineNode(range.endContainer);
			if(!startLine || !endLine)
			{	//the starLine & endLine should exist
				//debugger;
				return null;
			}
			rootNode = startLine.getParent();
			var startIndex = startLine.getIndex();
			var endIndex = endLine.getIndex();
			var children = rootNode.getChildren();
			var linesList = [];
			for ( var i = startIndex; i <= endIndex; i++ )	
			{
					var child = children.getItem( i );
		 			if(child.is('ol','ul','p'))
		 				selectLines.push(child);
			}
		}
				
		return {
			rootNode:rootNode,
			selectLines:selectLines
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
		
	_updateTextboxInfo:function(_txtNode,bNotNeedUpdateBBox)
	{			
		function _findDrawFrameContainer(aDrawFrameContainer)
		{
			while(aDrawFrameContainer)
			{
				if(aDrawFrameContainer.is('div')
						&&aDrawFrameContainer.hasClass('draw_frame'))
				{
					var aPageNode = aDrawFrameContainer.getParent();
					if(aPageNode && aPageNode.is
							&& aPageNode.hasClass('draw_page')
							&& aPageNode.hasAttribute('draw_master-page-name'))
					{
						break;		
					}
				}						
				aDrawFrameContainer = aDrawFrameContainer.getParent();
			}
			return aDrawFrameContainer;
		};
		
		if(!_txtNode)
		{
			this._mCurrentTextboxInfo = null;
			return null;
		}
			
		
		var txtNode = this.ChangeToCKNode(_txtNode);
		var editor = window.pe.scene.getEditor();
		var isPlaceholder = false;
		var isTableCell = false;
		var masterPageName = null;
		var layoutName = null;
		var placeholderType = null;
		var placeholderIndex = null;
		var absWidth = null;//unit is cmm (cm*1000)
		var absHeight = null;//unit is cmm (cm*1000)
		
//		var aDrawFrameContainer = editor.contentBox ? PresCKUtil.ChangeToCKNode(editor.contentBox.mainNode) : _findDrawFrameContainer(txtNode);
		var aDrawFrameContainer = _findDrawFrameContainer(txtNode);
		if(!aDrawFrameContainer)
		{
			if(editor && editor.contentBox)
			{
				aDrawFrameContainer = this.ChangeToCKNode(editor.contentBox.mainNode);
				if(dojo.hasClass(editor.contentBox.mainNode, "g_draw_frame")== true){
					aDrawFrameContainer = _findDrawFrameContainer(aDrawFrameContainer);			
				}
			}
		}
		if(!aDrawFrameContainer)
		{
			this._mCurrentTextboxInfo = null;
			return null;
		
		}
		var aPageNode = aDrawFrameContainer.getParent();
		
		//Table structure
		//<body style="height: 126.117px;  width: 522.8px;">
		//		<table table_template-name="st_plain" >
		//			<tbody >
		//				<tr style="height: 25.0033%;">
		//					<td/th style="width: 20%;">
		//						<p level="2" customstyle="abs-margin-left:1200;" style="margin-left: 8.67523%;">
		
		var td = txtNode.getAscendant('th', true) || txtNode.getAscendant('td', true);
		if(td && PresCKUtil.checkNodeName(td.getFirst(), 'ol','ul','p'))
		{
			if(!bNotNeedUpdateBBox)
			{
				var tr = td.getParent();
				var tBody = tr.getParent();
				var table = tBody.getParent();
				var body = table.getParent();
				
				var pageHeight = aPageNode.getAttribute('pageheight');
				var pageWidth = aPageNode.getAttribute('pagewidth');
				pageHeight = parseFloat(pageHeight);
				pageWidth = parseFloat(pageWidth);
				pageHeight = pageHeight * 1000.0;//To cmm
				pageWidth = pageWidth * 1000.0;
				
				
				//could not get width
				//in Chrome, after paste, the table always no width
			absWidth = PresTableUtil.getColumnAbsWidthByPercent(td) + "px"; //"***px"
				absHeight = dojo.getComputedStyle(td.$)['height']; //"***px"
				absWidth = CKEDITOR.tools.toCmValue(absWidth)*1000.0;
				absHeight = CKEDITOR.tools.toCmValue(absHeight)*1000.0;
				
				var viewPageWidth = dojo.getComputedStyle(aPageNode.$)['width']; //"***px"
				var viewPageHeight = dojo.getComputedStyle(aPageNode.$)['height']; //"***px"
				viewPageWidth = CKEDITOR.tools.toCmValue(viewPageWidth)*1000.0;
				viewPageHeight = CKEDITOR.tools.toCmValue(viewPageHeight)*1000.0;
				
				absWidth = absWidth/viewPageWidth*pageWidth;
				absHeight = absHeight/viewPageHeight*pageHeight;
			}

			isTableCell = true;
		}
		
		if(!isTableCell)
		{
			masterPageName = dojo.attr(aPageNode.$,'draw_master-page-name');
			layoutName = dojo.attr(aPageNode.$,'presentation_presentation-page-layout-name');
			placeholderType = dojo.attr(aDrawFrameContainer.$,'presentation_class');	
			placeholderIndex = dojo.attr(aDrawFrameContainer.$,"presentation_placeholder_index");
			placeholderIndex = parseInt(placeholderIndex);
			
			isPlaceholder = dojo.attr(aDrawFrameContainer.$,"presentation_placeholder");
			if(!isPlaceholder || isPlaceholder!= 'true')
				isPlaceholder = false;
			else
				isPlaceholder = true;
			

			if(!bNotNeedUpdateBBox)
			{
				//might we are in slidersort now
				//try to get the real info
				//pageheight="19.05" pagewidth="25.4" pageunits="cm"
				var pageUnit = aPageNode.getAttribute('pageunits');
				var pageHeight = aPageNode.getAttribute('pageheight');
				var pageWidth = aPageNode.getAttribute('pagewidth');
				pageHeight = parseFloat(pageHeight);
				pageWidth = parseFloat(pageWidth);
				if(pageUnit=="cm")
				{
					pageHeight = pageHeight * 1000.0;
					pageWidth = pageWidth * 1000.0;
				}
				
				var relHeight = aDrawFrameContainer.getStyle('height');
				var relWidth = aDrawFrameContainer.getStyle('width');
				if(placeholderType == 'notes')
				{
					//note width is px, we should change it to cmm
					absHeight = CKEDITOR.tools.toCmValue(relHeight)*1000.0;
					absWidth = CKEDITOR.tools.toCmValue(relWidth)*1000.0;
				}
				else
				{
					relHeight = PresCKUtil._percentToFloat(relHeight);
					relWidth = PresCKUtil._percentToFloat(relWidth);
					absHeight = pageHeight*relHeight;
					absWidth = pageWidth*relWidth;
				}
			}

		}
		

		this._mCurrentTextboxInfo =  {
			isTableCell:isTableCell,
			isPlaceholder:isPlaceholder,
			masterPageName:masterPageName,
			layoutName:layoutName,
			placeholderType:placeholderType,
			placeholderIndex:placeholderIndex,
			absWidth:absWidth,//unit is cmm (cm*1000)
			absHeight:absHeight//unit is cmm (cm*1000)
		};
	},
	
	//This value is used to store textbox model data
	_mCurrentTextboxInfo:null,
	
	_mKeepTextboxInfo:false,
	
	clearTextboxInfo:function()
	{
		this._mCurrentTextboxInfo = null;
		this._mKeepTextboxInfo = false;
	},
	
	//this function is used to prepare model data for current edit box
	prepareTextboxInfo:function(_txtNode,bNotNeedUpdateBBox)
	{
		this._updateTextboxInfo(_txtNode,bNotNeedUpdateBBox);
		if(this._mCurrentTextboxInfo)
			this._mKeepTextboxInfo = true;
	},
	
 	/*
	//the input node could be any thing txt node in textbox in the page
	//then the function will automatically to find its content textbox 
	//bNotNeedUpdateBBox : if true, then not caculate the width and height of current textbox
 	 * */	
	getCurrentTextboxInfo: function(_txtNode,bNotNeedUpdateBBox){
		if(!this._mKeepTextboxInfo )
			this._updateTextboxInfo(_txtNode,bNotNeedUpdateBBox);
		return this._mCurrentTextboxInfo;
	},
	
	//if success return startnumber and numbertype,
	//otherwise return null, that master class is not a numbering class
	getMasterNumberingInfo : function (className)
	{
		
		function _implentment(cssName)
		{
	  		var classDiv =  PresCKUtil._getModelValueDiv(cssName);
	  		if(!classDiv)
	  			return null;
			var startNumber = classDiv.getAttribute('startnumber');
			var numberType = classDiv.getAttribute('numbertype');
			if(startNumber&&numberType)
			{
				return {
					numberType : numberType,
					startNumber : startNumber
				};
			}
			return null;
		}
		
		var re = _implentment(className);
		if(!re)
			re = _implentment(className + PresConstants.LIST_BEFORE);
		return re;
	},
		
	_hasMasterClass : function (className)
	{
		var re = this.MasterClassMap[className];
		if(re==true || re==false)
			return re;
		
		if(this._getModelValueDiv(className))
		{
			this.MasterClassMap[className] = true;
			return true;
		}
		
		var doc = (pe && pe.lotusEditor)?pe.lotusEditor.document:null;
		if(window.__pres2)
			doc = window.document;
		if(doc)
		{
			var rules = this.getCSSRules([className],doc);
			if(rules.length)
			{
				this.MasterClassMap[className] = true;
				return true;
			}
			else
			{
				this.MasterClassMap[className] = false;
			}
		}
		
		return false;
	},
	
 	/*
 	 * 
 	 * "ML_DarkYellow_outline_1_3", that means 
		"ML_": master list class prefix
		"MP_": master paragraph class prefix
		"MT_": master text class prefix
		ML_[masterName]_[placeholderType]_[Index]_[level]
		
		if not found, we return default internal build master style
 	 * *///Get master class for list in current textbox
 	getMasterClass: function(_txtNode, list_level){
 		var txtBoxInfo = this.getCurrentTextboxInfo(_txtNode,true);
        if (!txtBoxInfo || !txtBoxInfo.isPlaceholder) {
        	return null;
        }
        
        var nlistLevel = parseInt(list_level);
        if(txtBoxInfo.placeholderType == 'title')
        {
        	//for title placeholder we only support level 1 style
        	nlistLevel = 1;
        }
        
        function _buildMasterClass(masterPageName,placeholderType,placeholderIndex,nlistLevel)
        {
    		//ML_[masterName]_[layoutFamily]_[Index]_[level]
    		var classAppednStr = masterPageName+'_'
    							+placeholderType+'_'
    							+(placeholderIndex?(placeholderIndex+'_'):'')
    							+nlistLevel;
     		var reML = 'ML_'+classAppednStr;
     		var reMP = 'MP_'+classAppednStr;
     		var reMT = 'MT_'+classAppednStr;

     		return {
     			listClass : reML,
     			paragraphClass : reMP,
     			textClass : reMT
     		};
        }
        
        var mc = _buildMasterClass(txtBoxInfo.masterPageName,
        		txtBoxInfo.placeholderType,
        		txtBoxInfo.placeholderIndex,
        		nlistLevel);
      //Comment the following code for return master class any way
        if(!this._hasMasterClass(mc.listClass) 
        		&& !this._hasMasterClass(mc.listClass+PresConstants.LIST_BEFORE)
        		&& !this._hasMasterClass(mc.paragraphClass)
        		&& !this._hasMasterClass(mc.textClass))
        {
            //All missing we need turn a default master
            //build default master
            mc.listClass = 'ML_default'+txtBoxInfo.placeholderType+'_'+nlistLevel;
            mc.paragraphClass = 'MP_default'+txtBoxInfo.placeholderType+'_'+nlistLevel;
            mc.textClass = 'MT_default'+txtBoxInfo.placeholderType+'_'+nlistLevel;
        }
        
        return mc; 		
 	},
 	
 	//if masterClass == null,means to clear all master style
 	//only work for placeholder
 	//And after change, the input node might be also changed, so you need to get the output node
 	//such as var line = setMasterClass(line,XXX);
 	//If bForceApplyMasterList == true, means even the list node is <p> it also could get master list class "ML_"
 	setMasterClass: function(_listElement,masterClass,bForceApplyMasterList)
 	{
 		var txtBoxInfo = this.getCurrentTextboxInfo(_listElement,true);
        if (!txtBoxInfo || !txtBoxInfo.isPlaceholder) {
        	return;
        } 		
 		
 		var listElement = this.ChangeToCKNode(_listElement);
 		var inputType = listElement.getName().toLowerCase();
 		if(!listElement.is('p','li'))
 		{
 			if(listElement.is('ol','ul'))
 			{
 				listElement = listElement.getFirst();
 			}
 		}
 		if(!listElement.is('p','li'))
 			return;
 		var line = listElement.is('p')?listElement:listElement.getParent();
 		var oldType = line.getName().toLowerCase();
 		//The following code is set for real support master page
		var listClassesString = dojo.attr( listElement.$, 'class');
		if (listClassesString == undefined || listClassesString == null){
			listClassesString = " ";
		}	
		var bNeedMasterListClass = !(listElement.is('p'));
		var listClasses = listClassesString.split(' ');
		for ( var j = 0 ; j < listClasses.length; j++)
			{
			if ( listClasses[j].match(/^ML_|^MP_|^MT_/))
				dojo.removeClass( listElement.$, listClasses[j]);
			}
		if(masterClass)
		{
			listElement.addClass( masterClass.paragraphClass );
			listElement.addClass( masterClass.textClass );
			
			if(bNeedMasterListClass || bForceApplyMasterList)
			{
				listElement.addClass( masterClass.listClass );
				
				if(!PresListUtil.isCustomedLine(listElement))
				{
					var ni = PresCKUtil.getMasterNumberingInfo(masterClass.listClass);
					if(ni) // the new master is a numbering
					{
						//old is p or ul
						if(oldType == ('p'))
							line = PresListUtil.createList(listElement, masterClass.listClass,'ol',true);
						else if(oldType == ('ul'))
							line = PresListUtil.changeListStyleAndType(line, masterClass.listClass,'ol',ni.startNumber,ni.numberType );
						listElement = line.getFirst();
						listElement.setAttribute('startNumber',ni.startNumber);
						var v = PresListUtil.getValue (ni.numberType,ni.startNumber-1);
						line.setAttribute('numberType',ni.numberType);
						listElement.setAttribute('values',v);
					}
					else // new master is a bullet
					{
						if(oldType == 'ol')
						{	//need change to ul
							line = PresListUtil.changeListStyleAndType(line, masterClass.listClass,'ul');
							listElement = line.getFirst();
						}
					}
				}
			}
		}
		if(inputType == 'li')
		return listElement;
		else return line;
 	},

 	
 	//Get line node, return <p>/<ol>/<ul> or null
 	getLineNode : function(node){
 		var block = MSGUTIL.getBlock(node);
 		if(block)
 		{
 			if(block.is('li'))
 				block = block.getParent();
 		}
 		return block;
 	},
 	
	
	ChangeToCKNode : function(node)
	{
		if(!node)
			return null;
 		var ckNode = (node.is)?node
 				:new CKEDITOR.dom.element( node.$?node.$:node );//This is not a CK Node, new a node
		return ckNode;
	},
	
	/**
	 * There are lots of empty checking function in PresCKUtil now:
	 * 
	 	isEmpty()
	 	isTextEmpty()
	 	isNodeEmpty()
		isEmptySpanOrLi()
		isThisAEmptySpan()
		doesNodeContainText()
		checkForEmptyContent()
	 !!!What a mess!!!
	 and some of them used for different case,
	 I have no effort to merge them together now, so I write a base empty check function
	 and this function is used for my all functions.
	 In the future, this is a very basic function, we need merge all empty function together into this function, 
	 otherwise our logic will drop into a mess
	*/
	//Check whether a node is an text empty node
	//Parameter:
	//node could be null
	//if could be <span>/<br>/<p>/<li>/<ol>/<ul>/<div>
	//Return 	[null]  :something error
	//			[true]  :the node does not contain any visible text
	//			[false] :the node contain any visible text
	//[Forbidden Change this function without Presentation Team agreement!!]
	isNodeTextEmpty : function(_Node)
	{
 		function _isEmptyBr(br)
 		{
 			if(br.hasClass("text_line-break"))
 				return false;
 			return true;
 		};
 		
 		function _isNotVisibleCharCode(charCode)
 		{
 			return (charCode === 8203 || charCode === 65279);
 		}
 		 		
 		function _isEmptySpan(span)
 		{
 			
 			var copyspan = dojo.clone(span);
            var realyHtml = copyspan.$.outerHTML.replace( /<span[^>]+data-cke-bookmark[^<]*?<\/span>/ig,'' );
            copyspan.setHtml(realyHtml);
            var txt = copyspan.getText();
            dojo.destroy(copyspan.$);
// 			var txt = TEXTMSG.getTextContent(span.$);
 			if(!txt)
 				return true;
 			var isEmpty = true;
 			for (var i = 0; i < txt.length && isEmpty; i++) {
 				var subStr = txt.substring(i,i+1);
 				if (subStr!=''&&!_isNotVisibleCharCode(txt.charCodeAt(i)))
 					{
 				    	isEmpty = false;
 					}
 			}
 			
 			return isEmpty;
 		};
 		

 		function _isEmptyLineItem(lineItemNode)
 		{
 			var result = false;
 			// get p or li
 			var node = PresCKUtil.checkNodeName(lineItemNode, 'ol','ul') ?
 				lineItemNode.getFirst() : lineItemNode;
 			if (PresCKUtil.checkNodeName(node, 'p', 'li'))
 			{
 				var len = 0;
 				var first = node.getFirst();
 				while (first)
 				{
 					var text = MSGUTIL.getPureText(first);
 					//remove 8203 & 65279
 					text = text.replace(/uFEFF/g,'');//65279
 					text = text.replace(/u200B/g,'');//8203
 					// ignore 8203 length
 					if (!(text.length == 1 && (text.charCodeAt(0) == 8203 || text.charCodeAt(0) == 65279)))
 						len += text.length;
 					if (PresCKUtil.checkNodeName(first, 'br') &&
 						first.hasClass('text_line-break'))
 						len += 1;
					if (len > 0) break;
					first = first.getNext();
 				}
 				result = (len == 0);
 			}
 			return result;
 		};

		var node = this.ChangeToCKNode(_Node);
		if(!node)return true;
 		if(!node.is && !node.is('span','br','p','ol','ul','li','div'))
 		{
 			//debugger;
 			return null;
 		}
 		
 		if(node.is('br'))
 			return _isEmptyBr(node);
 		 		
 		if(node.is('span'))
 			return _isEmptySpan(node);
 		
 		if(node.is('a','p','ol','ul','li'))
 			return _isEmptyLineItem(node);
 		
 		if(node.is('div'))
 		{
			var lineElems = dojo.query("ol,ul,p", node.$);
			if(!lineElems.length)
				return true;
			for(var i=0; i< lineElems.length; i++){
				var _ckElement = this.ChangeToCKNode(lineElems[i]);
				if(!_isEmptyLineItem(_ckElement))
					return false;
			}		
  		
 			return true;
 		}
 			
 		
		return true;  		
	},
	
	removeInvalidSpanAfterCursorChange : function(editor) {
		if(PresCKUtil.lockInput)
			return;
		var sel = editor.getSelection();
		if(!sel)
			return;
		var range = sel.getRanges()[0];
		if(!range.collapsed)
			return;
		
		var block = MSGUTIL.getBlock(range.startContainer);
		PresCKUtil.removeInvalidSpanForLine(block,true);
	},
	//TODO-range not conside the table cross cell selection case
	//The rootNode should be the container node of all lines
	//bKeepRange : [true] means if the range at one invalid span, the range will be updated, you should get the range by return
	//				otherwise, no relation with the range, we do the action in DOM level 
  	removeInvalidSpanForLine : function(rootNode,bKeepRange,oldRange) {
 		function _isInvalidSpan(span)
 		{
 			var ckSpan = PresCKUtil.ChangeToCKNode(span);
 			if(dojo.hasAttr(ckSpan.$,'data-cke-bookmark'))
 				return false;
 				
 			var parentNode = ckSpan.getParent();
 			var preItem = ckSpan.getPrevious();
 			
			if(preItem 
					&& PresCKUtil.checkNodeName(preItem, 'span')
					&& dojo.hasAttr(preItem.$,'data-cke-bookmark'))
				preItem = preItem.getPrevious();
			
 			var nextItem = ckSpan.getNext();
			if(nextItem 
					&& PresCKUtil.checkNodeName(nextItem, 'span')
					&& dojo.hasAttr(nextItem.$,'data-cke-bookmark'))
				nextItem = nextItem.getNext();
 			var beEmpty = PresCKUtil.isNodeTextEmpty(ckSpan);
 			if(!beEmpty)
 				return false;
 			//Empty span,we should check its pre and next items

 			//if the empty span is used to hold text position, it is useful
 			/**
 			 *<li/p>
 			 *    <span>
 			 *    	<br>
 			 *    <span>
 			 *     <br>
 			 *     <span>
 			 *     <br> 
 			 *
 			 */
 			 if(!preItem && !nextItem) //only has span
 				 return false;
 			 
 			//the span is the first node in line
 			 if(!preItem)
 			 {
 				 //its next must be br, otherwise it is a invalid span
 				 if(PresCKUtil.checkNodeName(nextItem, 'br'))
 					 return false;
 			 }
 			 else //not first node
 			 {
 				 if(!nextItem) //it is the last node
 				{
 	 				//its previous must be br, otherwise it is a invalid span
 	 				if(PresCKUtil.checkNodeName(preItem, 'br'))
 	 					return false;
 				}
 				 else //it is a middle node
 				{
 					 //then it must be the only span in two br
  	 				if(PresCKUtil.checkNodeName(preItem, 'br')
  	 						&& PresCKUtil.checkNodeName(nextItem, 'br'))
 	 					return false;
 				}
 			 }

 			 return true;
 		};
 		
 		var editor = PresCKUtil.getCurrentEditModeEditor();
 		var ckRooNode = this.ChangeToCKNode(rootNode);
  		if(!ckRooNode)
  			return null;
  		
  		//we should get the cursor span
  		// and ensure if they be deleted, we could restore range right
  		var startCursorSpan = null;
  		var endCursorSpan = null;
  		var startOffset = 0;
  		var endOffset = 0;
  		var bFirstFindInvalidNode = false;
	  	var range = oldRange?oldRange:editor.getSelection().getRanges()[0];
		var bCursorNodeChanged = false;
		var bCollapsed  = range.collapsed;
 		dojo.query('span',ckRooNode.$).forEach(function(node){
 			var span = PresCKUtil.ChangeToCKNode(node);
			if (_isInvalidSpan(span))
			{
				var bSkipThisSpan = false;
				if(bKeepRange)
				{
					//hey! here we get the cursor in invalid span
					//we should move the cursor
					if(!bFirstFindInvalidNode)
					{
						bFirstFindInvalidNode = true;
			  	  		var selectInfo = PresListUtil.getListSelectionRangeInfo(range);
			  	  		if(!selectInfo)
			  	  			return null;
			  	  	  		if(selectInfo.bCollapsed)
			  	  	  		{
			  	  	  			var line = selectInfo.root.getChild(selectInfo.startSelection.lineIndex);
			  	  	  			var lineItem = PresListUtil.getLineItem(line);
			  	  	  			startCursorSpan = selectInfo.startSelection.focusSpan;
			  	  	  		}
			  	  	  		else
			  	  	  		{
			  	  	  			var line = selectInfo.root.getChild(selectInfo.startSelection.lineIndex);
			  	  	  			var lineItem = PresListUtil.getLineItem(line);
			  	  	  			startCursorSpan = selectInfo.startSelection.focusSpan;
			  	  	  			
			  	  	  			line = selectInfo.root.getChild(selectInfo.endSelection.lineIndex);
			  	  	  			lineItem = PresListUtil.getLineItem(line);
			  	  	  			endCursorSpan = selectInfo.endSelection.focusSpan;
			  	  	  		}
			  	  			startOffset = selectInfo.startSelection.textOffset;
			  	  			endOffset = selectInfo.endSelection?selectInfo.endSelection.textOffset:null;
					}
										
					if(span.equals(startCursorSpan))
					{
						//try to get next node
						startCursorSpan = span.getNext();
						startOffset = 0;
						//if not exits get the previous node
						if(!startCursorSpan || !PresCKUtil.checkNodeName(startCursorSpan,'span'))
						{
							startCursorSpan = span.getPrevious();
							startOffset = TEXTMSG.getTextContent(startCursorSpan.$).length;
						}

						bCursorNodeChanged = true;
					}
	 				else if(span.equals(endCursorSpan))
	 				{
						//try to get previous node
	 					endCursorSpan = span.getPrevious();
						//if not exits get the next node
						if(!endCursorSpan || !PresCKUtil.checkNodeName(endCursorSpan,'span'))
						{
							endCursorSpan = span.getNext();
							endOffset = 0;
						}
						else
						{
							endOffset = TEXTMSG.getTextContent(endCursorSpan.$).length;
						}
	 											
	 					bCursorNodeChanged = true;
	 				}
				}
				if(!bSkipThisSpan)
					dojo.destroy(span.$);
			}
 		});
 		
 		//We have the cursor changed after remove node
 		//we need restore it back
 		if(bCursorNodeChanged)
 		{
 	 		startCursorSpan.$.normalize();
 			var textNode = startCursorSpan.getChild(0);
 			if(!textNode)
 				startCursorSpan.setHtml('&#8203;');
 			
 			if(endCursorSpan)
 			{
 				endCursorSpan.$.normalize();
				var textNode = endCursorSpan.getChild(0);
				if(!textNode)
					endCursorSpan.setHtml('&#8203;');
 			}
 			
 			if(bCollapsed)
 			{
 				range.setStart(startCursorSpan.getChild(0),startOffset);
 				range.setEnd(startCursorSpan.getChild(0),startOffset);
 				range.select();
 			}
 			else
 			{
 				range.setStart(startCursorSpan.getChild(0),startOffset);
 				range.setEnd(endCursorSpan.getChild(0),endOffset);
 				range.select();
 			}
 		}
 		return range;
  	},
  	//<<<============================
  	
  	
  	// Remove empty spans (one space and nbsp are treated as valid character)
  	// Used when hitting enter to create new line and when copy pasting
	// 9434: [SpellCheck][Regression] If activating spell check, the space between misspelling words will lost after pressing "Enter" in text box.
 	removeInvalidSpan: function( editor ) {
 		var dfc = null;
 		if ( editor.isTable){
			var selection = editor.getSelection();
			var range = selection.getRanges()[0];
			var selectedCell = range.startContainer.getAscendant('td',true) || range.startContainer.getAscendant('th',true);
			if ( selectedCell){
				dfc = selectedCell.$;
			} else {
				dfc = PresCKUtil.getDFCNode(editor);
			}
 		} else {
 			dfc = PresCKUtil.getDFCNode(editor);
 		}
 		if (!dfc)
 		    return;
 		var spans = dojo.query("span", dfc);
 		if (!spans)
 		    return;

		for (var i=spans.length-1; i>=0; i--) {
			//D16566 updated to ensure we don't remove spans with parent node containing userlineBreak class
			if (!dojo.hasClass(spans[i], 'spacePlaceholder') 
					&& !dojo.hasClass(spans[i], 'text_p') 
					&& !dojo.hasClass(spans[i], 'text_span') 
					&& PresCKUtil.isTextEmpty( spans[i])
				&& spans[i].parentNode 
				&& !dojo.hasClass(spans[i].parentNode,'userLineBreak'))
			{
				//15565 - need to move cursor to next or prev span with text when we are about to delete the empty span that has cursor in it
				var selection = editor.getSelection();
				var range = selection.getRanges()[0];
				if(range.collapsed == true && range.startContainer.$ === range.endContainer.$ && (range.startContainer.$ === spans[i] || range.startContainer.$ == spans[i].firstChild )){
					//currently only do this when range is collapsed and cursor is in the span
		  			//either cursor is in the span or in the textNode of Span
		  			//not sure if we need to do this for non-collapsed range also, never been tried
					PresCKUtil.moveCursorToPrevOrNextSpan(spans[i], editor.getSelection());
				}
				dojo.destroy(spans[i]);
			}
		}
  	},
  	
  	// Replace old outline class with new class
  	replaceOldOutlineClassWithNew: function(node) {
  		if (node && node.$) {
  			//dojo.query('td[colspan], th[colspan]', table);
  			var ulsWithNewClass = dojo.query('ul[newOutlineClass]', node.$);
  			for (var i = 0; i < ulsWithNewClass.length; i++) {
  				var ul = ulsWithNewClass[i];
  				var oldOutlineClass = dojo.attr(ul, 'oldOutlineClass');
  				var newOutlineClass = dojo.attr(ul, 'newOutlineClass');
  				if (oldOutlineClass != undefined && oldOutlineClass != null &&
  						newOutlineClass!= undefined && newOutlineClass != null) {
  					dojo.removeClass(ul, oldOutlineClass);
  					dojo.addClass(ul, newOutlineClass);
  				}
  				dojo.removeAttr(ul, 'oldOutlineClass');
  				dojo.removeAttr(ul, 'newOutlineClass');
  			}
  		}
  	},
  	
  	//15565
  	//assuming the cursor is in the span param, 
  	//needs to move cursor
  	//used when we want to delete the span in param, and the cursor was there
  	//for example when hit backspace on a span that only has a space in it. 
  	//by hitting backspace we remove the empty span where the cursor was and need to put the cursor in the previous or next span with text
  	//<span style="font-weight:bold">apple</span><span></span></span style="font-weight:bold">banana</span>
  	//we are about to delete the empty span in the middle and cursor was there
  	moveCursorToPrevOrNextSpan: function(span, selection){
  	//if the one we destory has the cursor on it, we need to move the cursor
  		if(span!=null && selection !=null){
			var theSpan = span;
			var spanPrevToMoveCursorTo = null;
			var spanNextToMoveCursorTo = null;
			while(theSpan.previousSibling!=null && theSpan.previousSibling.nodeName.toLowerCase() == "span" && this.isTextEmpty( theSpan.previousSibling)){
				theSpan = theSpan.previousSibling;
			}
			if(theSpan.previousSibling!=null){
				spanPrevToMoveCursorTo = theSpan.previousSibling;
			}else{ //if no prev sibling with text, try looking next sibling
				while(theSpan.nextSibling!=null && theSpan.nextSibling.nodeName.toLowerCase() == "span" && this.isTextEmpty( theSpan.nextSibling)){
					theSpan = theSpan.nextSibling;
				}
				if(theSpan.nextSibling !=null){
					spanNextToMoveCursorTo = theSpan.nextSibling;
				}
			}
			if(spanPrevToMoveCursorTo !=null){
				this.moveCursorToEndOfNode(spanPrevToMoveCursorTo,selection);
			}else if(spanNextToMoveCursorTo !=null){
				this.moveCursorToEndOfNode(spanPrevToMoveCursorTo,selection);	
			}
  			
  		}
		
  	},
  	
    //remove empty spans that do not have an inline style
    //14405 gjo
    removeNoStyleEmptySpans: function( editor ) {
        var dfc = PresCKUtil.getDFCNode(editor);
        if (!dfc)
            return;
        var spans = dojo.query("span", dfc);
        //console.log(spans);
        if (!spans)
            return;
        for (var i=spans.length-1; i>=0; i--) {
            // D24623, check whether containin text(or spaces)
            var txt = TEXTMSG.getTextContent(spans[i]);
            var hasTxt =  (txt != undefined && txt != null && txt.length > 0 ? TEXTMSG.hasTxt(txt, true) : false);
            //for defect 26670, we will remove all text span which didn't contain text node.
            //These empty test span node is created when spliting node
            if (dojo.hasClass(spans[i],"newTextContent") || (((dojo.attr(spans[i],"style") == null 
            		|| (spans[i].getAttribute('class') != null
            		&& spans[i].getAttribute('class').indexOf('text_span')>=0))) && !hasTxt)) {
            	//for defect 27757
            	//there is a kind of span named 'text_s', before we ignore it.
            	if(!hasTxt && spans[i].firstChild && spans[i].firstChild.nodeName == 'BR')
            		continue;
            	//for defect 27833, there is a special char add in list in webkit and ie browser
            	//we must ignore this char when removeNoStyleEmptySpans, which affect the cursor. 
            	if(!hasTxt && txt.length == 1 && txt.charCodeAt(0) == 65279)
            		continue;
                //console.log("destroy the span");
                //dojo.destroy(spans[i]);
                //#14821 - need to check if span is within range/selection, if it is do not remove, if it is not we need to remove
                //if we blindly remove span without checking where the cursor is, we would remove the span that the cursor is currently on.
                //this caused defect 14821
                var selection = editor.getSelection(),
                // Bookmark the range so we can re-select it after processing.
                ranges = selection.getRanges(),
                range;
                var iterator = ranges.createIterator();
                var isSpanInRange = false;
                while ( ( range = iterator.getNextRange() ) ) {
                    if(range.collapsed == true){
                        var rangeStartContainer = range.startContainer;
                        if(rangeStartContainer!=null && rangeStartContainer.$ == spans[i]){
                            isSpanInRange = true;
                        }
                    }
                }
                if(isSpanInRange!= true){ //if span is not in range/selection, remove it
                    dojo.destroy(spans[i]);
                }
            }
        }
    },
  	
  	// Similar to doesNodeContainText but uses isEmpty vs hasTxt
  	isTextEmpty: function( node ) {
 		if (node.nodeType != CKEDITOR.NODE_TEXT && node.childNodes.length==0){
 			return true;
 		} 	 		 
 		var txt = TEXTMSG.getTextContent(node);
 		return (txt != undefined && txt != null && txt.length > 0 ? this.isEmpty( txt ) : true);
 	}, 
 	
 	// Similar to hasTxt with the exception that isEmpty treats one space and nbsp as valid character
	isEmpty: function( childTxt ) {
	    if ( childTxt == null )
	        return true;
		var isEmpty = true;
		for (var i = 0; i < childTxt.length && isEmpty; i++) {
			if (childTxt.substring(i, i+1) != '')
			    isEmpty = false;
		}
		
		return isEmpty;
	},	
  	
  	/**
  	 * Finds the root list node (UL or OL) of the specified list or list item 'node'.
  	 * @param node
  	 * @returns
  	 */
  	findListRoot: function( node ) {
  	    if (!node)
  	        return null;
  	    var ckNode = node.$ ? node : new CKEDITOR.dom.node( node );
        while (true) {
            var listNode = ckNode.getAscendant( { ul:1, ol:1 } );
            if (listNode)
                ckNode = listNode;
            else
                break;
        }
        return ckNode;
  	},

  	//
  	// Adjust font size of indented/outdented line item (e.g. when deleting parent list)
  	//
  	adjustIndentedFontSize: function( node, baseIndentLevel ) {
  	    var database = {},
  	        ckNode = this.findListRoot( node );
  	    
  	    // calling 'arrayToList' calls the auto adjustment code from the 'liststyles' plugin
  	    var listArray = CKEDITOR.plugins.list.listToArray( ckNode, database ),
  	        newList = CKEDITOR.plugins.list.arrayToList( listArray, database );
  	},
  	
 	//
 	// Remove [browser-inserted] br from list when it's inside li and preceeding ul
 	//
  	//TODO, merge into removeInvalidBr
 	removeInvalidBrFromLi: function(editor){
 		var dfc = PresCKUtil.getDFCNode(editor);
 		if (!dfc)
 		    return;
		var mozBrs = dojo.query("br", dfc);
		if (!mozBrs)
		    return;
		for (var i=mozBrs.length-1; i>=0; i--){
			if (!mozBrs[i].previousSibling && mozBrs[i].nextSibling && (mozBrs[i].nextSibling.nodeName.toLowerCase() == 'ul' || mozBrs[i].nextSibling.nodeName.toLowerCase() == 'ol')) {
				var parent = mozBrs[i].parentNode;
				// set correct parent since br could be within span instead of directly under p or li
				while (parent.nodeName.toLowerCase() != 'p' && parent.nodeName.toLowerCase() != 'li' && parent.parentNode) {
					parent = parent.parentNode;
				}
				if (parent.nodeName.toLowerCase() == 'li') {
					// remove br
					dojo.destroy(mozBrs[i]);	
					// outdent siblings
					var siblingsPromoted = false;
					for (var j=0; j<parent.childNodes.length; j++){	// parent.childNodes are ul
						var child = parent.childNodes[j];
						if (child.nodeName.toLowerCase() == 'ul' || child.nodeName.toLowerCase() == 'ol') {	// promote children
							while (child.childNodes.length > 0) {
								var gchild = child.childNodes[0];
								//adjust font size
								//this.adjustIndentedFontSize(gchild);
								// outdent
								parent.parentNode.insertBefore(gchild,parent);
								siblingsPromoted = true;
							}
						}
					}
					// remove parent
					if (siblingsPromoted) {
						dojo.destroy(parent);						
					}
				}
			}
		}
 	},
 	
 	//
 	// Replace mozilla-inserted-br with valid p
 	//
  	replaceInvalidDfcBrWithP: function(editor){  		
 		var dfc = PresCKUtil.getDFCNode(editor);
 		if (!dfc)
 		    return;
 		for (var i=dfc.childNodes.length-1; i>=0; i--){
			var child = dfc.childNodes[i];
			if (child.nodeName.toLowerCase() == 'br') {	// replace br with p
				var clone = dojo.clone(child.previousSibling ? child.previousSibling : child.nextSibling);				
				clone.innerHTML = '<span class="newTextContent"></span><br class="hideInIE">';
				clone.id="";
				concord.util.HtmlContent.injectRdomIdsForElement(clone);
				dfc.insertBefore(clone,child);
				dojo.destroy(child);
			}
		}
  	},
 	
 	//
 	// Remove 'invalid' p
 	//
 	removeInvalidP: function(editor){
 		var dfc = PresCKUtil.getDFCNode(editor);
 		if (!dfc)
 		    return;
 		for (var i=dfc.childNodes.length-1; i>=0; i--){
			var child = dfc.childNodes[i];
			if (child.nodeName.toLowerCase() == 'p') {
				// remove empty p
				if (child.childNodes.length == 0) {
					dojo.destroy(child);
				}
				// remove p that only contains br
				if (child.childNodes.length == 1
						&& child.firstChild.nodeName.toLowerCase() == 'br'
						&& !dojo.hasClass( child, 'userLineBreak' ) ) {
					dojo.destroy(child);
				}
			} 
		}
  	},
  	
 	//
 	// Remove 'invalid' li
 	//
 	removeInvalidLi: function( editor, selection ) {
 	    var start = selection && selection.getStartElement().$ || PresCKUtil.getDFCNode( editor );
 		var size = start && start.childNodes ? start.childNodes.length : 0;
 		for (var i = size - 1; i >= 0; i--) {
			var child = start.childNodes[i];
			if (child && (child.nodeName.toLowerCase() == 'ul' || child.nodeName.toLowerCase() == 'ol')) {
				this.recursivelyRemoveInvalidLi(child);
			} 
		}
  	},

 	//
 	// Recursively remove 'empty' li
 	//
 	recursivelyRemoveInvalidLi: function(node) {
 	    if (!node)
 	        return;
 		for (var i=node.childNodes.length-1; i>=0; i--){
			var child = node.childNodes[i];
			var childName = child.nodeName.toLowerCase();
			// remove empty li
			if (childName == 'li' && child.childNodes.length == 0) {
				dojo.destroy(child);
			}
			// remove li that only contains br or empty span
			if (child && childName == 'li' && child.childNodes.length == 1 
					&& (child.firstChild.nodeName.toLowerCase() == 'br' || (child.firstChild.nodeName.toLowerCase() == 'span' && !this.doesNodeContainImmediateText(child.firstChild)))
					) {
				dojo.destroy(child);
			}
			// remove li that only contains ul (promote ul's children)
			if (child && childName == 'li' && child.childNodes.length == 1 
					&& (child.firstChild.nodeName.toLowerCase() == 'ul' || child.firstChild.nodeName.toLowerCase() == 'ol')) {
				var toRemove = child;
				var toRemoveParent = child.parentNode;
				var toPromote = child.firstChild;	// the nested ul in the 'empty' li to promote, use last child as there are cases of preceeding empty spans
				while (toPromote.childNodes.length > 0) {
					var childToPromote = toPromote.childNodes[0];
					this.recursivelyRemoveInvalidLi(childToPromote);
					//promote
					toRemoveParent.insertBefore(childToPromote,toRemove);
					//adjust font size
					//this.adjustIndentedFontSize(childToPromote, 0);
				}
				dojo.destroy(toPromote);
				dojo.destroy(toRemove);
			}
			if (child && (childName == 'ul' || childName == 'ol' || childName == 'li')) {
				this.recursivelyRemoveInvalidLi(child);
			}
		}
  	},
  	
  	//
  	// Gets snaphot of entire dfc or tbody
  	// mainly used for preSnapShot and postSnapShot for undoRedo
  	//
  	getSnapShot: function(editor){
  		var node=null;
  		if (editor.document && editor.document.$.body.firstChild
  				&& editor.document.$.body.firstChild.firstChild) { // dfc for text and body for tables
  			node = editor.document.$.body.firstChild.firstChild;
  		}
  		//S36075, need to change snapshot node to tbody.
  		if(editor.contentBox && editor.contentBox.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE){
  			node = dojo.query("tbody", editor.document.$.body.firstChild)[0];
  		}
  		var snapShot = (node!=null) ? PresCKUtil.cloneSnapShot(node) : node; 
  		node = null;
		return snapShot;	
  	},
  	
  	//
  	// Sets snapshot in editor.preSnapShot to the node passed in. If node is null it uses the dfc
  	//
  	setPreSnapShot: function(editor,node){
  		var snapShot = (node) ? PresCKUtil.cloneSnapShot(node) : PresCKUtil.getSnapShot(editor);
  		if (editor.preSnapShot) dojo.destroy(editor.preSnapShot);
  		editor.preSnapShot = snapShot;
  		snapShot = null;
  		return editor.preSnapShot;
  	},
  	//
  	// Sets snapshot in editor.postSnapShot to the node passed in. If node is null it uses the dfc
  	//
  	setPostSnapShot: function(editor,node){
  		var snapShot = (node) ? PresCKUtil.cloneSnapShot(node) : PresCKUtil.getSnapShot(editor);
  		if (editor.postSnapShot) dojo.destroy(editor.postSnapShot);
  		editor.postSnapShot = snapShot; 
  		snapShot = null;
  		return editor.postSnapShot;
  	},
  	
  	setInitSnapShot: function(editor){
  		if ( editor.initSnapShot ){
  			dojo.destroy( editor.initSnapShot);
  			editor.initSnapShot = null;
  		}
  		PresCKUtil.setPreSnapShot(editor);            	  
  		editor.initSnapShot = PresCKUtil.cloneSnapShot(editor.preSnapShot);
  	},
  	
  	/**
  	 * This function extracted from contentBox.editorAdjust
  	 * This function only adjust DF node for image/group(g_draw_frame)
  	 * @param mainNode
  	 * @param editorContentHeight
  	 */
  	updateDFHeightForImageGroup: function(mainNode, editorContentHeight){
  		if(!mainNode || isNaN(editorContentHeight))
  			return;
  		
  		if (!dojo.hasClass(mainNode, 'g_draw_frame'))
  			return;
		var dfNode = pe.scene.slideEditor.getParentDrawFrameNode(mainNode);
		if(dfNode) {
			var dfHeight =  (editorContentHeight * 100) / (dojo.isIE ? dfNode.parentNode.offsetHeight : dojo.style(dfNode.parentNode,'height')) ;
			dojo.style(dfNode,{
				   'height' : dfHeight +"%"					 
			    });
			if (dojo.isIE) {
				// IE converts to px so we need to update contentBboxDataNode as well
				dojo.style(dfNode.firstChild,{
					'height' : "100%"					 
					});
			}
		}
  	},
  	
  	/**
  	 * Updates the node inserted via the inserthtml command on Safari.
  	 * The inserthtml command converts the attributes from em to px.
  	 * This will convert the attributes back to em values.
  	 * @param document - Main document 
  	 * @param range - Current range being pasted into
  	 * @param data - Current data being pasted
  	 */
  	fixInsertHtmlSafari: function(document, range, data) {
  		//#15772 - need to clean even when the ascendant is li element
  		var intP = range.startContainer.getAscendant( { 'p':1, 'li':1 }, true );
		if (intP) {
			if(data!=null){
				dojo.query('.Apple-style-span', intP.$).forEach(function(node, index, array){				
					dojo.removeClass(node, 'Apple-style-span');
					var copyElement = CKEDITOR.dom.element.createFromHtml(data, document);
					if(copyElement.getName().toLowerCase() == "span"){
						var styleStr = dojo.attr(copyElement.$, 'style');
						var styles=[];
						if(styleStr!=null){
							styles =styleStr.split(';');
						}
						for (var i=0; i < styles.length; i++) {
							var style = styles[i].split(':');
							if (style[0].trim() == 'font-size') {
								dojo.style(node, 'fontSize', style[1].trim());
								
							} else if (style[0].trim() == 'line-height') {
								dojo.style(node, 'lineHeight', style[1].trim());
							}
						}
					}else { //if copyElement level is not a span, e.g. a <p> parent of spans, and the node/span has lineHeight, remove it.. this is added by Safari
						if(node.style!=null && node.style.lineHeight!=null && node.style.lineHeight.indexOf("px")>=0){
							dojo.style(node, "lineHeight", "");
						}
						
					}
					//D7507 Need to add indicator information  to this span								
					 setTimeout( function(){
	  					window.pe.scene.getEditor().fire("filterPaste",new CKEDITOR.dom.node(node));
	  				},100);  										
				});
			}
			
		}
  	},
  	//15764
  	//during paste, Safari injected computed style from original element
  	//to be inline style, 
  	//need to remove the ones that we think already covered by our css styles
  	fixStyleWebkit: function(document,data){
  		var newData = data;
  		if(document!=null && data!=null){
  			var copyDiv = document.$.createElement("div");
  			copyDiv.innerHTML = data;
  			document.$.body.appendChild(copyDiv);
  			PresCKUtil.fixLiStyleWebkit(copyDiv);
  			PresCKUtil.fixPStyleWebkit(copyDiv);
  			PresCKUtil.fixSpanStyleWebkit(copyDiv);
  			PresCKUtil.fixOlUlStyleWebkit(copyDiv);
  			newData = copyDiv.innerHTML;
			dojo.destroy(copyDiv);
  		}
  		
  		return newData;
  	},
  	
  	//during paste, Safari injected padding-left with px value that throws off how it looks in sorter, it is way to the right
  	//here we need to clean it from the data to be pasted (this is done before the html is inserted to the document)
  	fixLiStyleWebkit: function(copyDiv) {
  		if(copyDiv!=null){
  			//search for li items and clean the padding with px value greater than 0 (injected by Safari)
  			//15772 we need to look for li padding with "px" value, padding should not have "px" value
			var lis = dojo.query("li", copyDiv);
			for(var i=0; i< lis.length; i++){
				var styleStr = dojo.attr(lis[i], 'style');
				var styles=[];
				if(styleStr!=null){
					styles =styleStr.split(';');
				}
				for (var k=0; k < styles.length; k++) {
					var style = styles[k].split(':');
					if (style[0].trim().indexOf("padding")>=0 && style[1].indexOf("px")>0 && style[1].trim().substring(0)!="0"){
						dojo.style(lis[i], style[0].trim(), "");
					}
				}
			}
  		}
  		
  	},
    //#15764 during paste, Safari injected p style that already in the p css to be inline
  	//this throws off when we increase font (with toolbar) and set numbering, 
  	//the numbering will keep the default font-size on p (same font-size transferred to li) rather than following the one set on the span, 
  	//here we need to clean it from the data to be pasted (this is done before the html is inserted to the document)
  	//we just clean the one that we are sure is the default p style as defined in the documentContent.css
  	fixPStyleWebkit: function(copyDiv) {
  		if(copyDiv!=null){
			var pElems = dojo.query("p", copyDiv);
			for(var i=0; i< pElems.length; i++){
				var styleStr = dojo.attr(pElems[i], 'style');
				var styles=[];
				if(styleStr!=null){
					styles =styleStr.split(';');
				}
				for (var k=0; k < styles.length; k++) {
					var style = styles[k].split(':');
					if (style[0].trim().indexOf("font-size")>=0 && style[1].trim()=="1em"){
						dojo.style(pElems[i], style[0].trim(), "");
					}
					if (style[0].trim().indexOf("line-height")>=0){
						dojo.style(pElems[i], style[0].trim(), "");
					}
					if (style[0].trim().indexOf("list-style-position")>=0 && style[1].trim()=="outside"){
						dojo.style(pElems[i], style[0].trim(), "");
					}
				}
				//D26406: [Chrome]Copy 2 paragraphs from title placeholder to outline, first paragraph is lost
				if(pElems[i].firstChild && pElems[i].firstChild.nodeType==3){
					pElems[i].innerHTML = '<span>'+pElems[i].innerHTML +'</span>';
				}
				
			}		
  		}  		
  	},
  	
  	fixPNonWebKit: function(document,data){
  		var newData = data;
  		if(document!=null && data!=null){
  			var copyDiv = document.$.createElement("div");
  			copyDiv.innerHTML = data;
  	  		if(copyDiv!=null){
  				var pElems = dojo.query("p", copyDiv);
  				for(var i=0; i< pElems.length; i++){
  					if(pElems[i].firstChild && pElems[i].firstChild.nodeType==3){
  						pElems[i].innerHTML = '<span>'+pElems[i].innerHTML +'</span>';
  					}
  				}
  				newData = copyDiv.innerHTML;
  		  	  	dojo.destroy(copyDiv);
  	  		}	
  		}
  		return newData;
  	},
    
  	//remove invalid styles from span
  	fixSpanStyleWebkit: function(copyDiv) {
  		if(copyDiv!=null){
			var spanElems = dojo.query("span", copyDiv);
			for(var i=0; i< spanElems.length; i++){
				var styleStr = dojo.attr(spanElems[i], 'style');
				var styles=[];
				if(styleStr!=null){
					styles =styleStr.split(';');
				}
				for (var k=0; k < styles.length; k++) {
					var style = styles[k].split(':');					
					if (style[0].trim().indexOf("line-height")>=0){
						dojo.style(spanElems[i], style[0].trim(), "");
					}
					if (style[0].trim().indexOf("list-style-position")>=0 && style[1].trim()=="outside"){
						dojo.style(spanElems[i], style[0].trim(), "");
					}
				}
			}		
  		}  		
  	},
  	
    //remove invalid styles from OL and UL
  	fixOlUlStyleWebkit: function(copyDiv) {
  		if(copyDiv!=null){
			var ulolElems = dojo.query("ol,ul", copyDiv);
			for(var i=0; i< ulolElems.length; i++){
				var styleStr = dojo.attr(ulolElems[i], 'style');
				var styles=[];
				if(styleStr!=null){
					styles =styleStr.split(';');
				}
				for (var k=0; k < styles.length; k++) {
					var style = styles[k].split(':');
					if (style[0].trim().indexOf("font-size")>=0){ // TODO: delete fontSize or not
						dojo.style(ulolElems[i], style[0].trim(), "");
					}
				}
			}		
  		}  		
  	},
  	
  	/**
  	 * Due to an issue in FF 8 and greater, the hover behavior for panels
  	 * needs to be overridden (#3544).  This funtion allows the onmouseover,
  	 * onmouseout and onClick to override the hover selector defined in the
  	 * panel css file and allow it to function properly in the browser.
  	 * @param classType Class type to modify the hover behavior.  Currently
  	 * the following are defined:
  	 * 			tablestyles --> td.tablestyle_gallery_box
  	 * 			slidetransitions --> img.transitionstyle_picture_box
  	 * 			liststyles --> td.ddbpanel_gallery_box
  	 * 			colorbutton --> a.cke_colorbox
  	 * @param node Container node for the desired elements.  This is usually
  	 * just the element.$ object.
  	 */
  	updateHoverBehavior: function(classType, node) {
  		
  		var addStyle = function(node) {
  			dojo.style(node, {
  				'border' : '1px solid #e9f5ff',
  				'backgroundColor' : '#ccc'
  			}); 
  		};
  		
  		var addHoverStyle = function(node) {
  			dojo.style(node, {
  				'backgroundColor' : '',
  				'borderColor' : ''
  			}); 
  		};
  		var removeHoverStyle = function(node) {
  			dojo.style(node, {
  				'borderColor' : '#ffffff',
  				'backgroundColor' : '#ffffff'
  			}); 
  		};
  		
  		var removeStyle = function(node) {
  			dojo.style(node, {
  				'backgroundColor' : '',
  				'border' : ''
  			}); 
  		};
  		// The fixes an issue with FF > 3.# for browsers.  Only 
  		// override the hover action for those browsers. 
  		if (!CKEDITOR.env.gecko || (CKEDITOR.env.gecko && CKEDITOR.env.version < 40000)) {
  			return;
  		}
  		// For each classtype we need to connect to the mouseover, mouseout
  		// and click events to update the classes, border and background
  		// colors appropriately.
  		dojo.query(classType, node).forEach(function(node, index, array) {
  			if(dojo.hasClass(node, 'cke_panel_listItem')) { 
  				if (dojo.hasClass(node, 'cke_selected')) {
  					addStyle(node);
  					addHoverStyle(node.firstChild);
  				} else {
  					removeHoverStyle(node.firstChild);
  					removeStyle(node);
  				}
  			}
  			
			dojo.connect(node, 'onmouseover', function() {
				//Default border and css class definition
				var border = '1px solid #316ac5';
				var hoverClass = 'cke_hover';
				// If list style is a selectable box need to update the 
				// border and hoverclass from the defaults
				if (dojo.hasClass(node, 'ddbpanel_selectable')) {
					border = '2px solid #316ac5';
					hoverClass = 'cke_hover_transition';
				}

				// For the liststyles the nodes needing to be modified
				// is the spans in the ddbpanel_gallery_box table
				// definition.  Also these styles have different borders
				// defined then draw fill, text color and tables
				if (dojo.hasClass(node, 'ddbpanel_gallery_box')) {
					node = node.firstChild.firstChild;
					border = '2px solid #316ac5';
					hoverClass = 'cke_hover_transition';
				}

				if (dojo.hasClass(node, 'cke_panel_listItem')) {
					node = node.firstChild;
					borderColor = '#316ac5';
					hoverClass = 'cke_hover';
				}
				
				// For the transitions the border and class is different
				// then the draw fill, text color and tables.  Leaving 
				// separate from the list styles for now in case other 
				// differences are identified.
				if (dojo.hasClass(node, 'transitionstyle_picture_box')) {
					border = '2px solid #316ac5';
					hoverClass = 'cke_hover_transition';					
				}
				
				// Even though the class is set, also need to set the style
				// to overcome an issue when the color is defaulted to
				// white when the selection is clicked.
				dojo.style( node, {
					'border' : border,
					'backgroundColor': '#dff1ff'
				
				});
				
				// Add the appropriate class which defines the border 
				// and color.  Do not remove the prior class with the
				// hover, focus and active selectors as this also
				// contains a lot of other styles.
				dojo.addClass(node, hoverClass);		
			});
			
			dojo.connect(node, 'onmouseout', function() {
				
				// For list styles, need to modify the span under the 
				// gallery box table elements
				if (dojo.hasClass(node, 'ddbpanel_gallery_box')) {
					node = node.firstChild.firstChild;
				}
				
				if (dojo.hasClass(node, 'cke_panel_listItem')) {
					node = node.firstChild;
				}

				// Remove the style information created on mouseover
				if (!dojo.hasClass(node, 'cke_selected')) {
					dojo.style( node, {
						'border' : '',
						'backgroundColor': ''
					});
				}

				// Remove the hover class included during mouseover
				dojo.removeClass(node, 'cke_hover');
				dojo.removeClass(node, 'cke_hover_transition');					
			});
			
			dojo.connect(node, 'onclick', function() {
				// Default border and backgroundcolor to define
				// on selection of the button
				var border = '1px solid #FFFFFF';
				var backgroundColor = '#FFFFFF';
				
				if (dojo.hasClass(node, 'cke_panel_listItem')) {
					node = node.firstChild;
					backgroundColor = 'dff1ff';
					border = '1px solid #316ac5';
				}

				// Transition styles use a different border then default
				if (dojo.hasClass(node, 'transitionstyle_picture_box')) {
					border = '2px solid #FFFFFF';
				}
				
				// List styles use a different border and color then default
				if (dojo.hasClass(node, 'ddbpanel_selectable')) {
					border = '2px solid #FFA346';
					backgroundColor = '#FFDDBB';					
				}
				
				// Add the style to the element
				dojo.style( node, {
					'border' : border,
					'backgroundColor': backgroundColor
				});
				
				// Remove the hover classes potentially added during
				// mouse over.
				dojo.removeClass(node, 'cke_hover');
				dojo.removeClass(node, 'cke_hover_transition');					
			});
		});
  	},
  	
  	/**
  	 * Due to an issue in FF 8 and greater, the hover behavior for panels
  	 * needs to be overridden (#3544).  This funtion allows the onmouseover,
  	 * onmouseout and onClick to override the hover selector defined in the
  	 * panel css file and allow it to function properly in the browser for 
  	 * colorbutton dialogs.
  	 * @param selectors Class type to modify the hover behavior.  Currently
  	 * the following are defined:
  	 * 			colorbutton --> a.cke_colorbox
  	 * @param node Container node for the desired elements.  This is usually
  	 * just the element.$ object.
  	 * @param isCK Boolean to determine if in a CKEditor instance
  	 * @param editor Editor object
  	 * @param style Style to check.  For colorbutton the styles will most
  	 * likely be background-color and color.
  	 * @param evaluator
  	 */
	fixColorPanelMultiSelect: function(node,selectors,isCK,editor,style,evaluator){
		// If no style passed in to check then simply return
		if(style==null){
			return;
		}
		
		// Get the color or backgroundColor style from the selected content
		// box(es) to determine whether any items in the color dialog
		// need to be selected.
		var rangeStyle = null;
		var sel = editor.getSelection();
		// If checking for background color and multiple content boxes are
		// selected, the current behavior is to not set a color.
		if (!pe.scene.slideEditor.isMultipleBoxSelected()) {
			if(style == ('background-color')){
				// If content box not in edit mode but background color
				// is still allowed to be set.  Get the normalized value and
				// check in the DFC node for the background-color.
				// 
				// If user slect a content box but not into edit mode:
				// In IE, sel is null; 
				// In chrom/safari, the sel is the text content of the div(text node or paragraph) 
				// which is not what we expected, so directly get the draw frame bgcolor;
				// In FF, sel is not null, but is empty.
				try{
					rangeStyle = dojo.style(PresCKUtil.getDFCNode(editor).id, 'backgroundColor');
				}
				catch(e){
					console.log('throw exception when style background color, e:'+e);
				}
				
				if(editor.isTable){
					var selectedCells = editor.getSelectedTableCells(editor);
					if(selectedCells.length > 0){
						var tmpBGColor = dojo.style(selectedCells.pop().$, 'backgroundColor');
						var sameBGC = dojo.every(selectedCells, function(cell){
							var tmp = dojo.style(cell.$, 'backgroundColor');
							return (tmp == tmpBGColor); 
								
						});
						rangeStyle = sameBGC ? tmpBGColor : rangeStyle;
					}
				}
				rangeStyle = concord.text.tools.colorHex(rangeStyle);
				
				//  For an editable content box get the range
				var envFlag = !CKEDITOR.env.chrome && !CKEDITOR.env.safari;
				if(envFlag && (rangeStyle == "transparent") && sel && sel.getRanges() && sel.getRanges().length > 0) {
					var ranges = sel.getRanges();
					rangeStyle = concord.text.tools.getStyleValue(ranges, style, evaluator);
					rangeStyle = concord.text.tools.colorHex(rangeStyle);
				}
				
			} else if (style == ('border-color')) {
				// No need to get orig color because colot highlight function has been disabled
				return;
			} else{
				//  For an editable content box get the range
				if (sel && sel.getRanges() && sel.getRanges().length > 0) {
					var ranges = sel.getRanges();
					try{
						rangeStyle = concord.text.tools.getStyleValue(ranges, style,evaluator);
						rangeStyle = concord.text.tools.colorHex(rangeStyle);
					}
					catch(e){
						console.log('throw exception when style font color, e:'+e);
					}
				} 
				else{
					// If content box not in edit mode but background color
					// is still allowed to be set.  Get the normalized value and
					// check in the DFC node for the background-color.
					rangeStyle = dojo.style(PresCKUtil.getDFCNode(editor).id, style);
					rangeStyle = concord.text.tools.colorHex(rangeStyle);
				}
			}
		}
		
		var isSelected = function(node){
			if(style == null){
				return false;
			}
			var color =concord.text.tools.colorHex( node.firstChild.style.backgroundColor);
			if(rangeStyle == color){
				return true;
			}
			return false;
		};
		var addStyle = function(node){
			dojo.style( node, {
				'border' : '#316ac5 1px solid',
				'backgroundColor': '#dff1ff'
			});
		};
		var removeStyle = function(node){
			dojo.style( node, {
				'border' : '#fff 1px solid',
				'backgroundColor': '#FFFFFF'
			});
		};
		var addSelectedStyle = function(node){
			addStyle(node);
		};
		var removeSelectedStyle = function(node){
			if(!dojo.hasClass(node,"cke_selected")){
				removeStyle(node);
			}else{
				addStyle(node);
			}
		};	

		for (var i =0;i<selectors.length;i++){
  			var classType = selectors[i];
	  		dojo.query(classType, node).forEach(function(node, index, array) {
	  			removeStyle(node);
				dojo.removeClass(node,'cke_selected');
				if(isCK==true){
					node.blur();
				}else{
					removeSelectedStyle(node);
				}
				if(isSelected(node)){
					dojo.addClass(node,"cke_selected");	
					addSelectedStyle(node);
				}
				dojo.connect(node, 'onmouseover', function() {				
					addSelectedStyle(node);
				});
				
				dojo.connect(node, 'onmouseout', function() {
					removeSelectedStyle(node);
				});
				dojo.connect(node,'onfocus',function(){
					addSelectedStyle(node);
				});
				dojo.connect(node,'onblur',function(){
					removeSelectedStyle(node);
				});
				dojo.connect(node, 'onclick', function() {
				});
			});
		}
		
		return rangeStyle;
	},

  	
  	//
  	// cloneSnapShot clones node along with properties needed for pre and post snapshots
  	//
  	cloneSnapShot: function(node){
  	    if ( !node )
  	        return null;
  		var copy = dojo.clone(node);  		
  		copy.parentId = (node.parentNode && node.parentNode.id!=undefined && node.parentNode.id!=null)?  node.parentNode.id : (node.parentId)? node.parentId: null;
  		var idxNode = new CKEDITOR.dom.element(node); 
		var idx =  idxNode.getIndex();
		idxNode.$ = null;
		idxNode = null;
  		copy.idx = (node.idx)? node.idx: idx;		
		return copy;
  	},
  	
  	//
  	// Cleans table cells for coedit
  	//
    cleanSelectedSTCells: function(node){    	
    	dojo.removeClass(node,'selectedSTCell');
 		dojo.query('.selectedSTCell',node).removeClass('selectedSTCell');
    },
    
    /**
     * Cleans up any blank text nodes (from the specified 'node').
     */
    removeEmptyText : function( node ) {
        dojo.forEach(
                dojo.query( 'span', node ),
                function( item ) {
                    var next = item.nextSibling;
                    // skip BR
                    if ( next && next.nodeName.toLowerCase() == 'br' )
                        next = next.nextSibling;
                    
                    if ( next && next.nodeType == CKEDITOR.NODE_TEXT && !TEXTMSG.hasTxt( TEXTMSG.getTextContent( next ),true ) ) {
                        var par = next.parentNode;
                        // it's empty. is it in a SPAN?
                        if ( par.nodeName.toLowerCase() != 'span' )
                            dojo.destroy( next );
                    }
                }
        );
        dojo.forEach(
                dojo.query( 'P > BR', node),
                function( item ) {
                    var next = item.nextSibling;
                    if ( next && next.nodeType == CKEDITOR.NODE_TEXT && !TEXTMSG.hasTxt( TEXTMSG.getTextContent( next ),true ) ) {
                        dojo.destroy( next );
                    }
                }
        );
    },
    
    //
    // Move cursor to the beginning of a given node
    //
    moveCursorToBeginningOfNode: function(node, selection) {
		var range = selection.getRanges()[0];
		var cursorPos = CKEDITOR.POSITION_AFTER_START;
		
		// set cursor to first span or text node
		while (node && node.nodeName.toLowerCase() != "span" && node.nodeType != CKEDITOR.NODE_TEXT && node.firstChild) {
			node = node.firstChild;
		}
		if (!node)
		    return;
		
		var nodeCK = new CKEDITOR.dom.node(node);
		range.setStartAt(nodeCK, cursorPos);
		range.setEndAt(nodeCK, cursorPos);
		range.collapse(true);
		range.select();
    },
    
    
    //
    // Move cursor to the beginning of a given node
    //
    moveCursorToEndOfNode: function(node, selection, insideSpan) {
		var range = selection.getRanges()[0];
		var cursorPos = CKEDITOR.POSITION_BEFORE_END;
		
		// set cursor to first span or text node
		while (node && node.nodeName.toLowerCase() != "span" && node.nodeType != CKEDITOR.NODE_TEXT && node.lastChild) {
			node = node.lastChild;
		}

		if (node && node.nodeName.toLowerCase() == "br"){
			cursorPos = CKEDITOR.POSITION_BEFORE_START;
			if(insideSpan)
			{
				// #33614
				var pNode = node.previousSibling;
				if(pNode && pNode.nodeName.toLowerCase() == "span")
				{
					// found the span.
					node = pNode;
				}
			}
		}
		
		if (!node)
		    return;
		
		if(insideSpan && node.nodeName.toLowerCase() == "span")
			cursorPos = CKEDITOR.POSITION_BEFORE_END;
		
		var nodeCK = new CKEDITOR.dom.node(node);
		range.setStartAt(nodeCK, cursorPos);
		range.setEndAt(nodeCK, cursorPos);
		range.collapse(true);
		range.select();
    },
    
    /**
     * Moves the cursor (if necessary) to the end of the last, inner-most text found starting at the
     * specified 'node'. The cursor will be positioned before any BRs.
     * 
     * The range will be collapsed after this function runs (if it wasn't already at the end).
     * 
     * This is *similar* to the 'moveCursorToEndOfNode' function above.
     */
    moveToEndOfRange : function( range, ckNode ) {
        if ( !range || !range.startContainer )
            return;
        
        // if we passed in a 'node', use it
        var offset = !ckNode ? range.startOffset : ckNode.type == CKEDITOR.NODE_ELEMENT ? ckNode.getChildCount() - 1 : ckNode.getLength() - 1,
            node = !ckNode ? range.startContainer : ckNode,
            update = !!ckNode,
            position = CKEDITOR.POSITION_BEFORE_END;
        if ( node.type == CKEDITOR.NODE_ELEMENT ) {
            // if offset is <0, node will be null so we're ok
            node = node.getChild( offset );
            // D9672 - skip any lists
            while ( node && node.is && node.is( 'ol', 'ul' ) )
                node = node.getPrevious();
            
            if ( node == null ) {
                update = true;
                node = !ckNode ? range.startContainer.getLast() : ckNode.getLast();
            }
            
            // find the last, inner-most node (which *should* be a SPAN)
            var finished = node == null,
                guard = null;
            if ( !node ) {
                node = !ckNode ? range.startContainer : ckNode;
                position = CKEDITOR.POSITION_AFTER_START;
            }
            while ( !finished ) {
                while ( node && node.is && node.is( 'br' ) ) {
                    update = true;
                    var tmp = node.getPrevious();
                    // if BR doesn't contain a previous sibling, use the parent
                    // (and place the cursor after the start)
                    if ( !tmp ) {
                        //node = node.getParent();
                        finished = node.getParent().equals( guard );
                        if ( !finished ) {
                            node = node.getParent();
                            guard = node;
                        } else {
                            // the parent (P or LI) has a single child, the BR.
                            // let's insert a SPAN
                            var span = CKEDITOR.dom.element.createFromHtml(PresCKUtil.getDefaultSpanHtml(),
                                                                           node.getDocument());
                            span.insertBefore( node );
                            node = span;
                        }
                        position = CKEDITOR.POSITION_AFTER_START;
                        break;
                    }
                    node = tmp;
                }
                
                if ( node && node.type == CKEDITOR.NODE_TEXT ) {
                    finished = true;
    //              node = node.getParent();
    //              position = CKEDITOR.POSITION_BEFORE_END;
                }
                
                if ( !finished ) {
                    var tmp = node.getLast();
                    // if nothing is in the node...
                    if ( !tmp ) {
                        finished = true;
                        position = CKEDITOR.POSITION_AFTER_START;
                        // if the node is a SPAN, we need some text in there
                        if ( node.is && node.is( 'span' ) ) {
                            node.setHtml('&#8203;'); // still 8203
                            tmp = node.getAscendant( 'p' );
                            if ( tmp )
                                tmp.addClass( 'userLineBreak' );
                        }
                    } else
                        node = tmp;
                }
            }
        } else {
            if ( offset >= node.getLength() ) {
                update = true;
            }
        }
        
        if ( update ) {
            if ( node.type == CKEDITOR.NODE_ELEMENT )
                range.setStartAt( node, position );
            else
                range.setStartAt( node, CKEDITOR.POSITION_BEFORE_END );
            range.collapse( true );
            range.select();
        }
    },
    
  	
  	//
 	// Fixed invalid nested list structure of current selection
  	// 
  	// (seen in IE only)
  	// <ul> 
  	//	<ul>
  	//		<li>listitem 1</li>
  	//	</ul>
  	//	<li>listitem 2</li>
  	// </ul>
  	//
 	// in this case we need to promote/ outdent listitem 1
  	//
  	fixInvalidNestedList: function(selection){
		var node = selection.getStartElement().$;
		var parent = node && node.parentNode;
		var gparent = parent ? node.parentNode.parentNode : null;
		if (parent && gparent && 
				(parent.nodeName.toLowerCase() == 'ul' || parent.nodeName.toLowerCase() == 'ol') && 
				parent.previousSibling == null &&
				(gparent.nodeName.toLowerCase() == 'ul' || gparent.nodeName.toLowerCase() == 'ol')) {
			// promote/ outdent children
			while (parent.childNodes && parent.childNodes.length > 0) {
				var child = parent.childNodes[0];
				//adjust font size
				//this.adjustIndentedFontSize(child);
				// outdent
				gparent.insertBefore(child,parent);
			}
			// remove itself
			dojo.destroy(parent);
			// update cursor
			node = selection.getStartElement().$;
			if (node) {
				this.moveCursorToBeginningOfNode(node, selection);
			}
		}
  	},
  	
  	//
 	// Fixed nested list in empty list item of current selection (causing multiple bullets in the same line)
  	// 
  	// (seen in all browsers)
  	// <ul> 
  	//	<li>
  	//		<ul>nested list 1</ul>
  	//	</li>
  	//	<li>listitem 2</li>
  	// </ul>
  	//
 	// in this case we need to promote/ outdent nested list 1 and remove empty li
  	//
  	fixMergingListItems: function(editor, selection){
  		var node = null;
  		if (selection != undefined && selection != null) {
  			node = selection.getStartElement().$;
  			// handle the different browser selection to get the ul containing the 'empty' li
  			var child = node && node.lastChild;
  			// selection does not always return the right element so let's make sure we get the ul containing the 'empty' li
  			if (child && child.nodeName.toLowerCase() != 'ul' && child.nodeName.toLowerCase() != 'ol') {
  				child = node.parentNode ? node.parentNode.lastChild : null;
  			}
//  			if (dojo.isIE) {
//  				child = node.parentNode.nextSibling;
//  			}
  			if (child) {
  				this.fixNestedListInEmptyListitem(child, editor, false);
  			}
  		} else {
  	  		var dfc = PresCKUtil.getDFCNode(editor);
  	  		node = dfc;
  	  		var size = dfc && dfc.childNodes ? dfc.childNodes.length : 0;
  	 		for (var i = size - 1; i >= 0; i--) {
  				var child = dfc.childNodes[i];
  	  	 		this.fixNestedListInEmptyListitem(child, editor, true);
  	 		}
  		}

		// Safari wraps the 'merged' content with its own span and its own style.
		//   <span class="Apple-style-span" style="font-size: [value]px; line-height: [value]px; ">
		// We need to remove this span and merge its content with content of previous node.
		if (node && dojo.isWebKit) {
			var appleSpans = dojo.query(".Apple-style-span", node.parentNode);
			for  (var i=appleSpans.length-1; i>=0; i--){
				var item = appleSpans[i];
				
				// D14820 in case the node is not a span or its contents can't be safely moved, at least fix the style and class
  	        	dojo.removeClass(item, '.Apple-style-span');
  	        	item.removeAttribute('style');
  	        	
	  	        // D14820 if it's not a span, the style has been fixed, nothing left to do
	  	        if (item.nodeName.toLowerCase() != 'span')
	  	        	continue;
	  	        
	  	        var parent = item.parentNode;
	  	        if (!parent) 
	  	        	return;
	  	        if (!item.nextSibling) {
					var child = item.firstChild;
					if (child.nodeType==CKEDITOR.NODE_TEXT){ //D13545 - If the child is a text node then do not touch the span 
						continue; 
					}					
					while (child) {
						var nextChild = child.nextSibling;
						parent.appendChild(child);       						
						child = nextChild;
					}
	  	        } else {
					var child = item.firstChild;
					if (child.nodeType==CKEDITOR.NODE_TEXT){ //D13545 - If the child is a text node then do not touch the span 
						continue; 
					}					
					var nextSibling = item.nextSibling;
					while (child) {
						var nextChild = child.nextSibling;
						parent.insertBefore( child, nextSibling );       						
						child = nextChild;
					}
	  	        }
	  	        dojo.destroy(item);
			}
		}
  	},
  	
  	removeAppleStyleSpan: function(editor){
  		try {
  			var dfc = PresCKUtil.getDFCNode(editor);
  	        if (!dfc)
  	            return;
  	        var needUpdate = false;
  	        //D29366: [Chrome]Font display on thumnail page very larger than normal page
			var appleSpans = dojo.query(".Apple-style-span,font", dfc);
			for  (var i=appleSpans.length-1; i>=0; i--){
				var item = appleSpans[i];
  	        	
	  	        if (!(item.nodeName.toLowerCase() == 'font' ||item.nodeName.toLowerCase() == 'span'))
	  	        	continue;
	  	        
	  	        var parent = item.parentNode;
	  	        if (!parent) 
	  	        	return;
	  	        if (!item.nextSibling) {
					var child = item.firstChild;				
					while (child) {
						var nextChild = child.nextSibling;
						parent.appendChild(child);       						
						child = nextChild;
					}
	  	        } else {
					var child = item.firstChild;				
					var nextSibling = item.nextSibling;
					while (child) {
						var nextChild = child.nextSibling;
						parent.insertBefore( child, nextSibling );       						
						child = nextChild;
					}
	  	        }
	  	        dojo.destroy(item);
	  	        needUpdate = true;
			}
			//only for D39256: [Chrome]Font size display on slidesorter is not correct
			var appleSpans = dojo.query("b", dfc);
			for  (var i=appleSpans.length-1; i>=0; i--){
				needUpdate = true;
				var item = appleSpans[i];
				var childSpan = item.firstChild;
				var parentSpan = item.parentNode;
				if(childSpan && childSpan.nodeName.toLowerCase() == 'span' && parentSpan && parentSpan.nodeName.toLowerCase() == 'span')
				{
					var pfontSize = dojo.trim(parentSpan.style.fontSize);
					if(pfontSize.toLowerCase().indexOf('px') != -1){
						var fontSizeInPx = pfontSize.toLowerCase().replace('px','');
						pfontSize = PresFontUtil.getCalcPtFromPx(fontSizeInPx);
						PresCKUtil.setCustomStyle(childSpan,PresConstants.ABS_STYLES.FONTSIZE,pfontSize);
					}				
					dojo.style( childSpan, 'font-weight', 'bold' );
					parentSpan.parentNode.replaceChild( childSpan , parentSpan);
				}
			}			
			if(needUpdate){
				PresCKUtil.updateRelativeValue(dfc,[PresConstants.ABS_STYLES.FONTSIZE]);
			}
  		}catch (e){
  			console.log('removeAppleStyleSpan error:'+e);
  		}
  	},
  	
  	fixNestedListInEmptyListitem: function(child, editor, cleanDfc){
		if (child && (child.nodeName.toLowerCase() == 'ul' || child.nodeName.toLowerCase() == 'ol')) {	
			var toRemoveParent = cleanDfc ? child.firstChild && child.firstChild.lastChild : child; // ul containing the empty li (use lastChild as it may be preceeded by textnode)
			var toRemove = toRemoveParent && toRemoveParent.firstChild;	// the 'empty' li to remove
			if (toRemove && this.doesNodeContainImmediateText(toRemove)) {	// handling one nested level down if applicable
				toRemoveParent = toRemoveParent.firstChild.lastChild;
				toRemove = toRemoveParent.firstChild;
			}
			this.recursivelyFixNestedListInEmptyListitem(toRemove, toRemoveParent);
			var selection = editor.getSelection();//we should update selection instead of do this work for all the nodes
			this.removeInvalidLi(editor,selection);
			if (cleanDfc) { // update cursor
				// update cursor
				var node = dojo.isMozilla ? editor.getSelection().getStartElement().$ : toRemoveParent;
				if (node) {
					this.moveCursorToBeginningOfNode(node, editor.getSelection());
				}
			}
		}
  	},
  	
  	//
  	// Called by fixNestedListInEmptyListitem
  	//
  	recursivelyFixNestedListInEmptyListitem: function(toRemove, toRemoveParent) {
		if (toRemove && toRemove.nodeName.toLowerCase() == 'li' &&
				!this.doesNodeContainImmediateText(toRemove) &&
				toRemove.lastChild &&
				(toRemove.lastChild.nodeName.toLowerCase() == 'ul' || toRemove.lastChild.nodeName.toLowerCase() == 'ol')) {
			var toPromote = toRemove.lastChild;	// the nested ul in the 'empty' li to promote, use last child as there are cases of preceeding empty spans
			while (toPromote && toPromote.childNodes && toPromote.childNodes.length > 0) {
				var childToPromote = toPromote.childNodes[0];
				this.recursivelyFixNestedListInEmptyListitem(childToPromote, toPromote);
				//promote
				toRemoveParent && toRemoveParent.insertBefore(childToPromote,toRemove);
				//adjust font size
				//this.adjustIndentedFontSize(childToPromote, 0);
			}
			dojo.destroy(toPromote);
			dojo.destroy(toRemove);
		}
  	},
  	
  	/**
  	 * Fix the list structure according to CKEditor (and our) needs.
  	 * 
  	 * - Scenario 1 (in which a sub-list should be a <i>child</i>
  	 *   of its list, and <b>NOT</b> a <i>sibling</i>) -
  	 *   Sometimes, we get a list structure like the following:
  	 *   <UL>
  	 *     <LI>list item 1</LI>
  	 *     <UL>
  	 *       <LI>sub list item 1-1</LI>
  	 *     </UL>
  	 *   </UL>
  	 * 
  	 *   But CKEditor expects the following structure:
  	 *   <UL>
  	 *     <LI>list item 1
  	 *       <UL>
  	 *         <LI>sub list item 1-1</LI>
  	 *       </UL>
  	 *     </LI>
  	 *   </UL>
  	 * 
  	 * - Scenario 2 (in which a sub-list is placed within an empty
  	 *   list item) -
  	 *   Sometimes, we get a list structure like the following:
  	 *   <UL>
  	 *     <LI>list item 1</LI>
  	 *     <LI>
  	 *       <UL>
  	 *         <LI>sub list item 1-1</LI>
  	 *       </UL>
  	 *     </LI>
  	 *   </UL>
  	 * 
  	 *   But we expect the following structure:
  	 *   <UL>
  	 *     <LI>list item 1
  	 *       <UL>
  	 *         <LI>sub list item 1-1</LI>
  	 *       </UL>
  	 *     </LI>
  	 *   </UL>
  	 * 
  	 * This function will fix those situations.
  	 * 
  	 * @param editor - the currently "active" editor instance
  	 */
  	fixListStructure: function( editor ) {
  	    if ( !editor || !editor.contentBox )
  	        return;
  	    var editNode = editor.contentBox.getContentEditNode();
  	    if (!editNode)
  	        return;
  	    
  	    // re-usable functions
  	    var
  	    fixInvalidSiblings = function( item ) {
  	        if (!item)
  	            return;
  	        
  	        if (item.previousSibling) {
  	            item.previousSibling.appendChild( item );
  	        }
  	    },
  	    fixInvalidLists = function( item ) {
  	        if (!item)
  	            return;
  	        
  	        // D9672
  	        // we added a new selection criteria that's a little more inclusive of nodes that may filter into
  	        // this code. we now need to verify the structure.
  	        // if there's a previous node ...
  	        var prevSibling = item.previousSibling;
  	        if ( prevSibling ) {
  	            // ... it should be a BR ...
  	            if ( prevSibling.nodeName.toLowerCase() != 'br' ) {
  	                // ... or a *completely empty* SPAN ...
  	                if ( prevSibling.nodeName.toLowerCase() == 'span' &&
  	                        prevSibling.firstChild && ( prevSibling.firstChild.firstChild || ( prevSibling.firstChild.nodeValue && prevSibling.firstChild.nodeValue.length > 0 ) ) )
  	                    return;
  	                if ( prevSibling.nodeName.toLowerCase() == '#text' && prevSibling.nodeValue.length > 0 )
  	                    return;
  	            }
  	            // ... with no previous node.
  	            if ( prevSibling.previousSibling )
  	                return;
  	        }
  	        var emptyParent = item.parentNode;
  	        // D9672 - make sure the node we're moving into has some data
  	        while (emptyParent && emptyParent.previousSibling) {
  	            emptyParent.previousSibling.appendChild( item );
  	            dojo.destroy(emptyParent);
  	            // D9672 - if new parent contains data, then flag to stop our while loop
  	            emptyParent = PresCKUtil.doesNodeContainImmediateText( item.parentNode ) ? null : item.parentNode;
  	        }
  	        
  	        // if parent (li) is first child and child (li) is only child
  	        // then we know we have empty nested list
  			// apply to concord-created list only (i.e. skip imported list so we don't remove intentional 'empty' indents)
  	        var importedList = CKEDITOR.plugins.liststyles && CKEDITOR.plugins.liststyles.isConvertedList ?
  	                CKEDITOR.plugins.liststyles.isConvertedList( new CKEDITOR.dom.node( item ) ) : false;
  	        if (!importedList && emptyParent && !emptyParent.previousSibling) {
  	        	while ( item.lastChild && item.lastChild.nodeName.toLowerCase() == 'li' ) {
  	        		var emptyGParent = emptyParent.parentNode;
  	        		if (emptyGParent) {
  	        			// reset font size since we're pasting as new list
    	    	        item.lastChild.style.fontSize = '';
    	 	        	// D15516 -- after moving the sublist to a different parent, make sure that it has 
    	  	        	// a placeholder span, otherwise the prossess will recurse when fixInvalidLists is called on the parent
    	  	        	if (item.lastChild.firstChild.nodeName && item.lastChild.firstChild.nodeName.toLowerCase() != 'span') {
    	  	        		var placeholder = document.createElement('span');
    						placeholder.innerHTML = ((CKEDITOR.env.ie && concord.util.browser.getIEVersion() >= 9) ? '&nbsp;' : '&#8203;');
    						item.lastChild.insertBefore(placeholder, item.lastChild.firstChild);
    	  	        	}
  	        			if (!emptyParent.nextSibling) {
  	  	        			emptyGParent.appendChild( item.lastChild );
  	        			} else {
  	        				emptyGParent.insertBefore( item.lastChild, emptyParent.nextSibling );
  	        			}
  	        			// add counter-reset for numbered list
    	    	        if (item.nodeName.toLowerCase() == 'ol') {
    	    	        	var ckEmptyGParent = new CKEDITOR.dom.element(emptyGParent);
    	    	        	emptyGParent.style.counterReset = MSGUTIL.getListClass(ckEmptyGParent);    	    	        	
    	    	        }
  	        		}
  	        	}
  	        	if ( !item.lastChild ) {  	        		
  	        		//make sure there are no unaccounted for children in the empty parent
  	        		//this may happen when pasting indented lists on consecutive list items.
  	        		var liNodes = dojo.query('li',emptyParent);
  	        		for(var i = 0; i < liNodes.length; i++){
  	        			if(PresCKUtil.doesNodeContainImmediateText(liNodes[i]))
  	        				emptyParent.parentNode.appendChild(liNodes[i]);
  	        		}  	        		 	        		
  	        		dojo.destroy(emptyParent);
  	        	}
  	        }
  	    },
  	    fixAppleSpans = function( item ) {  	    	
  	        if (!item)
  	            return;

  	        // if it's not span then only reset class and style
  	        if (item.nodeName.toLowerCase() != 'span') {
  	        	dojo.removeClass(item, 'Apple-style-span'); //D14756
  	        	item.removeAttribute('style');
  	        	return;
  	        }
  	        
  	        var parent = item.parentNode;
  	        if (!parent) 
  	        	return;
  	        
  	        //D14756 If node does not contain text  
  	        //Handling following case where li looks like below and item is span with apple-style-span class on it
  	        //<li><span class="Apple-style-span" style="line-height: 34px;"><br></span><br class="hideInIE"></li>
  	        //Without this if Safari would have left the LI in the following state
  	        //<li><br> <br class="hideInIE"></li>
  	        if (item.nodeName.toLowerCase() == 'span' &&
  	        	!PresCKUtil.doesNodeContainText(item) &&
  	        	parent.childNodes.length ==2  &&  // this item span and a br
  	        	parent.lastChild.nodeName.toLowerCase()=='br'
  	        	){
	        		dojo.removeClass(item, 'Apple-style-span');  	        		
	  	        	if (item.style.fontSize && item.style.fontSize.indexOf("px")>=0){
	  	        		item.style.fontSize = "";
	  	        	}	  	        	
	  	        	if (item.style.lineHeight && item.style.lineHeight.indexOf("px")>=0){
	  	        		item.style.lineHeight = "";
	  	        	}
	  	        	item.innerHTML ='&#8203;';
	  	        	//item.appendChild(editor.document.$.createTextNode(''));  

	  	        	//Need to reset cursor
	  	        	var range = window.pe.scene.getEditor().getSelection().getRanges()[0];
	  	        	range.moveToElementEditStart(new CKEDITOR.dom.node(item));
					range.select();
  	        	return;
  	        }
  	        
  	        
  	        if (!item.nextSibling) {
				var child = item.firstChild;
				if (child.nodeType==CKEDITOR.NODE_TEXT){ //D13545 - If the child is a text node then do not touch the span 
					return; 
				}
				while (child) {
					var nextChild = child.nextSibling;
					parent.appendChild(child);       						
					child = nextChild;
				}
  	        } else {
				var child = item.firstChild;
				if (child.nodeType==CKEDITOR.NODE_TEXT){ //D13545 - If the child is a text node then do not touch the span 
					return; 
				}
				var nextSibling = item.nextSibling;
				while (child) {
					var nextChild = child.nextSibling;
					parent.insertBefore( child, nextSibling );       						
					child = nextChild;
				}
  	        }
  	        dojo.destroy(item);
  	    };
  	    
  	    function fixInvalidBr(item) {
  	    	var parent = item.parentNode;
  	    	if (parent && parent.lastChild && parent.lastChild.nodeName.toLowerCase() == 'br') {
  	    		var lastBr = parent.lastChild;
  	    		var prevSiblingNodeName = lastBr && lastBr.previousSibling? lastBr.previousSibling.nodeName.toLowerCase() : "";
  	    		// two consecutive <br> nodes are invalid
  	    		if (dojo.hasClass(lastBr, 'hideInIE') && lastBr.previousSibling && prevSiblingNodeName == 'br')
  	    			dojo.destroy(lastBr.previousSibling);	
  	    		//D15192 This structure is never valid
  	    		//<li><span>b <br></span><br class="hideInIE"></li>
  	    		if (dojo.hasClass(lastBr, 'hideInIE') && lastBr.previousSibling && prevSiblingNodeName == 'span'
  	    			&& lastBr.previousSibling.lastChild && lastBr.previousSibling.lastChild.nodeName.toLowerCase() == "br"
  	    			&& !dojo.hasClass(lastBr.previousSibling.lastChild,"text_line-break")) {
  	    			dojo.destroy(lastBr.previousSibling.lastChild);
  	    		}
  	    		// D14033 - the last sublist followed by a <br> is invalid
  	    		else if (dojo.hasClass(lastBr, 'hideInIE') && lastBr.previousSibling && 
  	    				(prevSiblingNodeName == 'ul' || prevSiblingNodeName == 'ol')) {
  	    			dojo.destroy(lastBr);
  	    		}
  	    	}
  	    };
        
        // remove extra BR elements from the end of the list item
        dojo.forEach(
            dojo.query( 'LI>BR', editNode ),
            fixInvalidBr
        );
  	    // fixes list items that are siblings of OL lists
		dojo.forEach(
		    // LI+OL --> selects all LIs that are placed after OLs (i.e. are siblings)
			dojo.query( 'LI+OL', editNode ),
			fixInvalidSiblings
		);
  	    // fixes list items that are siblings of OL lists
		dojo.forEach(
		    // LI+UL --> selects all LIs that are placed after ULs (i.e. are siblings)
			dojo.query( 'LI+UL', editNode ),
			fixInvalidSiblings
		);
        // fixes UL lists that are first children of (empty) list items
        dojo.forEach(
            dojo.query( 'LI>UL', editNode ),
            fixInvalidLists
        );
        // fixes OL lists that are first children of (empty) list items
        dojo.forEach(
            dojo.query( 'LI>OL', editNode ),
            fixInvalidLists
        );
        // migrates apple spans content to sibling or parent
        dojo.forEach(
            dojo.query( '.Apple-style-span', editNode ),
            fixAppleSpans
        );
		contentEditNode = null;
  	},

	/**
     * 14358
  	 * Fix list item after style.
	 *
	 * Primarily after import from powerpoint when a user enters a new 
	 * list item the new list item may be in this format
     *
     *<span style="line-height: 1.222;" class="text_p P26_1_CDUP">
     *    <span styles_changed="true" style="line-height: 1.222; color: rgb(255, 51, 0);" class="text_span T36"></span>
     *</span>
     *<span style="line-height: 1.222; color: rgb(255, 140, 0);" class="text_p P26_1_CDUP">
     *    <span styles_changed="true" style="line-height: 1.222;" class="text_span T36">
     *        <span style="line-height: 1.222;">sssss</span>
     *    </span>
     *</span>
     *<span style="line-height: 1.222;" class="text_p P26_1_CDUP">
     *    <span styles_changed="true" style="line-height: 1.222; color: rgb(255, 51, 0);" class="text_span T36"></span>
     *</span>
     *<br class="hideInIE">
	 */
	fixListItemAfterStyle: function( listItem ) {
		/* Remove invalid spans such as
  	     *<span style="line-height: 1.222;" class="text_p P26_1_CDUP">
         *    <span styles_changed="true" style="line-height: 1.222; color: rgb(255, 51, 0);" class="text_span T36"></span>
         *</span>
		*/
  	    var
  	    fixToRemoveInvalidSpans = function( item ) {
  	    	if (item.childNodes.length == 1
  	    			&& item.childNodes[0].nodeName.toLowerCase()=='span'
  	    			&& item.childNodes[0].childNodes.length == 0
  	    			&& PresCKUtil.isTextEmpty(item)
  	    			&& PresCKUtil.isTextEmpty(item.childNodes[0])) {
  	    			dojo.destroy(item);
  	    	}	
  	    },
  	    /*
		 * In some cases the second span may have a color inherited from css
		 * so move the color definition to the last span
         *<span style="line-height: 1.222; color: rgb(255, 140, 0);" class="text_p P26_1_CDUP">
         *    <span styles_changed="true" style="line-height: 1.222;" class="text_span T36">
         *        <span style="line-height: 1.222;">sssss</span>
         *    </span>
         *</span>
		*/
  	    fixColorStyle = function( item ) {
  	    	if (item.parentNode.childNodes.length == 1
  	    		&& item.parentNode.parentNode.childNodes.length == 1) {
  	    		var firstColor = dojo.style(item.parentNode.parentNode, "color");
  	    		var firstStyle = dojo.attr(item.parentNode.parentNode,"style");
  	    		var secondColor = dojo.style(item, "color");
  		    	if (firstStyle.indexOf(firstColor) > -1 && (firstColor != secondColor)) {
  		    		dojo.style(item,'color',firstColor);
  		    	}
  	    	}	
	    };
	    // fix invalid spans inside an li
        dojo.forEach(
            dojo.query( 'SPAN', listItem ),
            fixToRemoveInvalidSpans
        );
        // fix color being applied on wrong span
        dojo.forEach(
            dojo.query( 'SPAN>SPAN>SPAN', listItem ),
            fixColorStyle
        );    
	},

  	/**
  	 * Sets the font size for the specified 'listItem' or 'spanItem' to the specified 'fontSize'.
  	 * If the 'listItem' has any sublists underneath it, then we need to apply the
  	 * "converse" setting to them (i.e. 1/'fontSize') so that their list items
  	 * remain unchanged.
  	 * 
  	 * @param item: can be span or li
  	 * @param fontSize - new font size. Must be a number (assumes 'em' units)
  	 *                   or a string (with 'em' units specified). If not
  	 *                   specified, defaults to 1.
  	 */
  	setFontSizeForListItem: function( item, fontSize ) {
  	    if (!PresCKUtil.checkNodeName(item, 'li', 'span'))
  	        return;
  	    if ( !fontSize )
  	        return;
  	    
  	    fontSize = fontSize  + '';
  	    var ptValIdx = fontSize.indexOf('pt');
	    
  	    if(ptValIdx >0){
	    	fontSize = parseInt(fontSize);
	    	fontSize = PresFontUtil.getCalcEmFromPt(fontSize,[item.$]);
    		fontSize = fontSize[0];
	    }
  	    
  	    var fs = 1;
  	    if ( typeof fontSize == 'string' ) {
  	        var ndx = fontSize.indexOf( 'em' );
  	        if (ndx >= 0)
  	            fontSize = fontSize.substring(0, ndx);
  	    }
  	    if ( isNaN( fontSize ) ) {
  	        console.warn( 'Invalid font size : "' + fontSize + '" (' + typeof fontSize + '). Can\'t set font size on item.' );
  	        return;
  	    }
  	    fs = new Number( fontSize );
  	    
  	    item.setStyle( 'font-size', fs + 'em' );
  	    var
  	        sublist = function( node ) {
  	            return node && node.is && node.is( 'ol', 'ul' );
  	        },
  	        child = item.getFirst( sublist ),
  	        // "converse" font size
  	        convFs = (1 / fs).toFixed(2);
  	        
  	    // set "converse" font size on any sublists
  	    while ( child ) {
  	        child.setStyle( 'font-size', convFs + 'em' );
  	        child = child.getNext( sublist );
  	    }
  	},
  	
  	simulateCtrlA: function(doc){
  		PresCKUtilObj = this;
  		this._fireCtrlAKeyEvent( doc, "keydown");
  		doc.execCommand( 'SelectAll', false, null );
  		setTimeout( function(){
  			PresCKUtilObj._fireCtrlAKeyEvent( doc, "keyup");
  		},100);  		
  	},
  	
  	_fireCtrlAKeyEvent: function ( doc, eventName){
  		var bubbles = true;
  		var cancelable = true;
  		var view = window;
  		var ctrlKey = true;
  		var altKey = false;
  		var shiftKey = false;
  		var metaKey = false;
  		var keyCode = 65;
  		var charCode = 0;
  		var keyEvent = null;
  		if(dojo.isIE){
  			keyEvent = doc.createEventObject();
  			keyEvent.bubbles = bubbles;
  			keyEvent.view = view;
  			keyEvent.ctrlKey = ctrlKey;
  			keyEvent.altKey = altKey;
  			keyEvent.shiftKey = shiftKey;
  			keyEvent.metaKey = metaKey;
  			keyEvent.keyCode = keyCode;
  			keyEvent.charCode = charCode;
  			doc.body.fireEvent('on' + eventName, keyEvent);
  		} else if ( dojo.isFF){
  			keyEvent = doc.createEvent('KeyboardEvent');
  			keyEvent.initKeyEvent (eventName, bubbles, cancelable, view, ctrlKey, altKey, shiftKey, metaKey, keyCode, charCode);
  			doc.body.dispatchEvent(keyEvent);
  		} else {
  			keyEvent = doc.createEvent("Events");
  			keyEvent.initEvent(eventName, bubbles, cancelable );
  			keyEvent.view = view;
  			keyEvent.ctrlKey = ctrlKey;
  			keyEvent.altKey = altKey;
  			keyEvent.shiftKey = shiftKey;
  			keyEvent.metaKey = metaKey;
  			keyEvent.keyCode = keyCode;
  			keyEvent.charCode = charCode;
  			doc.body.dispatchEvent(keyEvent);
  		}
  		return keyEvent;
  	},	
    
    getFirstSpanFromNode: function(node) {
    	// drill down and find first span  ul ol or table
    	var span =null;
    	var spans = dojo.query('span',node);
    	if (spans.length >0){
    		span =  spans[0];
    	}
		return span;
    },
    
    //
    // Returns the first span found in the node
    // if includeNode is true it will retun node if node is a span 
    //    
    getFirstSpan: function(node,includeNode) {
    	// drill down and find first span  ul ol or table
    	var nodeTmp = node;
    	if (nodeTmp.nodeType == CKEDITOR.NODE_TEXT){ //Ensure that the node is at least a span 
    		nodeTmp= nodeTmp.parentNode; 
    	} 
    	var span =null;   
    	
    	var spans = nodeTmp.getElementsByTagName('span');
    	if (spans && spans.length >0){
    		span =  spans[0];
    	}

    	if (span==null && includeNode!=null && includeNode==true && nodeTmp.nodeName.toLowerCase()=='span'){
   			return nodeTmp;
    	}       	
    	nodeTmp=null;
    	spans=null;    	
    	return span;
    },
    //
 	// Gets first span that contains text
 	// If we have nested spans returns the child that contains the text 
 	//
 	getFirstSpanWithText: function(node){
 		if (node!=null){
 			var spans = node.getElementsByTagName('span'); 			
 			for (var i=0; i< spans.length; i++){
 				for (var j=0 ;j< spans[i].childNodes.length; j++) {
 					var child = spans[i].childNodes[j];
 					if (child.nodeName.toLowerCase() == 'span'){
 						break;
 					} else if (child.nodeType == CKEDITOR.NODE_TEXT) {
 						var txt = TEXTMSG.getTextContent(child);
 						if ( TEXTMSG.hasTxt(txt,true)){
 							return spans[i];
 						}
 					}
 				}
 			}
 		}
 		return null;
 	},
 	
 	/** Get first span immediately with text. Ignore 8203, '', bookmark span
 	 * @param node: containing spans
 	 * @returns: A CK span node
 	 */
 	getFirstSpanImmediatelyWithText: function(node) {
 		if (!node)
 			return null;
 		if (node.$)
 			node = node.$;

		var spans = node.getElementsByTagName('span');
		for (var i=0; i< spans.length; i++) {
			if (PresCKUtil.isThisAEmptySpan(spans[i], true) ||
				PresCKUtil.checkIfSpanWithJustBookmarks(spans[i], true) ||
				dojo.hasAttr(spans[i],'data-cke-bookmark'))
				continue;
			else {
 				for (var j=0 ;j< spans[i].childNodes.length; j++) {
 					var child = spans[i].childNodes[j];
 					if (child.nodeName.toLowerCase() == 'span' &&
 						!PresCKUtil.isThisAEmptySpan(child, true) &&
 			 			!PresCKUtil.checkIfSpanWithJustBookmarks(child, true) &&
 			 			!dojo.hasAttr(child,'data-cke-bookmark')) {
 						break;
 					} else if (child.nodeType == CKEDITOR.NODE_TEXT) {
 						var txt = TEXTMSG.getTextContent(child);
 						if ( TEXTMSG.hasTxt(txt,true)){
 							return spans[i];
 						}
 					}
 				}
			}
		}
 		return null;
 	},
    //
    // Returns the last span immediate child (not grand child) found in the node
    // if includeNode is true it will retun node if node is a span 
    //    
    getLastSpan: function(node, includeNode) {
    	// drill down and find first span 
    	var nodeTmp = node;
    	if (nodeTmp.nodeType == CKEDITOR.NODE_TEXT){ //Ensure that the node is at least a span 
    		nodeTmp= nodeTmp.parentNode; 
    	} 
    	
    	var span =null;
    	var lastNode = null;
    	for (var x=nodeTmp.childNodes.length-1; x>=0; x--){
    		lastNode = nodeTmp.childNodes[x];
    		if (lastNode.nodeName.toLowerCase()=='ul' ||
    			lastNode.nodeName.toLowerCase()=='ol' ||
    			lastNode.nodeName.toLowerCase()=='br'){
    			continue;    //skip ul,ol or br
    		} else{ // If entering this else then we have a span
    			if (lastNode.nodeType == CKEDITOR.NODE_TEXT){
    				lastNode = lastNode.parentNode; //Ensure we get the parent span of the text
    			}
    			var spans = lastNode.getElementsByTagName('span');
    			if (spans && spans.length >0){
    				span =  spans[spans.length-1];
    				break;
    			}
    		}    		    		
    	}
    	
    	if (span==null && includeNode!=null && includeNode==true && lastNode != null && lastNode.nodeName.toLowerCase()=='span'){
   			return lastNode;
    	}   
    	nodeTmp=null;
    	spans=null;
		return span;
    },    
    
    //
    // Only looks at immediate children list not grandchildren
    //    
    getImmediateLastSpanChildFromNode: function(node) {
    	// drill down and find last span 
    	var lastNode = node.lastChild;
		while (lastNode.nodeName.toLowerCase() != 'span' && lastNode.previousSibling) {
			lastNode = lastNode.previousSibling;
		}
		return lastNode;
    },    
    
    getLastSpanFromNode: function(node) {
    	// drill down and find first span 
    	var span =null;
    	var spans = dojo.query('span',node);
    	if (spans.length >0){
    		span =  spans[spans.length-1];
    	}
		return span;
    },    
    
    getLastElementNode: function(node,elemTag){
    	var elem =null;
    	var elems = dojo.query(elemTag,node);
    	if (elems.length >0){
    		elem =  elems[elems.length-1];
    	}
		return elem;    	
    },

    
    getFirstElementNode: function(node,elemTag){
    	var elem =null;
    	var elems = dojo.query(elemTag,node);
    	if (elems.length >0){
    		elem =  elems[0];
    	}
		return elem;    	
    },
    
    
    moveCursorToFirstPosInDFC: function(editor){
    	var dfc = PresCKUtil.getDFCNode(editor);
    	var fs =  PresCKUtil.getFirstSpanFromNode(dfc);
    	if (fs==null){ //span is null then let's try p
    		fs = PresCKUtil.getFirstElementNode(dfc,'p');
    		if (fs==null){
    			fs = PresCKUtil.getFirstElementNode(dfc,'li');
    		}
    	}
    	PresCKUtil.moveCursorToBeginningOfNode(fs,editor.getSelection());
    },

    moveCursorToLastPosInDFC: function(editor){
    	var dfc = PresCKUtil.getDFCNode(editor);
    	var fs =  PresCKUtil.getLastSpanFromNode(dfc);
    	if (fs==null){ //span is null then let's try p
    		fs = PresCKUtil.getLastElementNode(dfc,'p');
    		if (fs==null){
    			fs = PresCKUtil.getLastElementNode(dfc,'li');
    		}
    	}
    	PresCKUtil.moveCursorToEndOfNode(fs,editor.getSelection());	
    },

    isAtEndOfLi : function (range) {
        var absPosition = 
            MSGUTIL.transOffsetRelToAbs(range.startContainer, range.startOffset, range.startContainer);
        var totalLen = MSGUTIL.getNodeLength(range.startContainer);
        return (absPosition == totalLen);
    },

    stopEvent : function (event) {
    	if(!event)
    		return;
        event.data.preventDefault(true);
        event.data.stopPropagation();
        event.cancel();
        event.stop();
    },

    doesNodeOnlyContainNbsp : function(node) {
        var txt = TEXTMSG.getTextContent(node);
        return txt && txt.length == 1
            && (TEXTMSG.isNbsp(txt.charAt(0)) // nbsp
                || txt.charAt(0) == ' '	// or ' '
                || txt.charCodeAt(0) == 160);    // nbsp 
    },

    isEmptySpanOrLi : function(node) { // can have nbsp or ' '
        var hasText = PresCKUtil.doesNodeContainText(node.$);
        var hasOnlyNbsp = !hasText || PresCKUtil.doesNodeOnlyContainNbsp(node.$);
        var isSpanOrLi = MSGUTIL.isBullet(node) || PresCKUtil.isSpan(node);
        return !hasText || hasOnlyNbsp && isSpanOrLi;
    },

    // refer to fix of D14825
    moveToPreviousLi : function (event, editor) {
    	var range = editor.getSelection() && editor.getSelection().getRanges()[0];
        if (range && range.startContainer) {
            var parentWithSibling = range.startContainer;
            var prevSibling = '';
            if (range.startContainer.type == CKEDITOR.NODE_TEXT) {
                // find the innermost ascendant which has a sibling
                while (parentWithSibling && !prevSibling) {
                    parentWithSibling = parentWithSibling.getParent();
                    prevSibling = parentWithSibling? parentWithSibling.getPrevious() : null;
                    if (parentWithSibling.is
                        && parentWithSibling.is('ul', 'ol', 'p')) {
                        break;
                    }
                }
            } else {
                prevSibling = parentWithSibling.getPrevious(); // in case it's not NODE_TEXT type
            }

            // * 111      <li> ... </li>
            // *          <li> <span>..</span> <br class='hideInIE'>
            //    ** 222       <ol> ...</ol>                        </li>
            // prevSibling can be the br
            if (MSGUTIL.isBogus(prevSibling) && prevSibling.getPrevious()) { // bogus is child of parent
                prevSibling = prevSibling.getPrevious();
            }

            if (prevSibling //  && PresCKUtil.isEmptySpanOrLi(prevSibling)
               ) {
                // move to the end of the previous sibling
                if (parentWithSibling.is && parentWithSibling.is('li', 'ul', 'ol', 'p', 'span') && prevSibling) {
                    PresCKUtil.moveCursorToEndOfNode(prevSibling.$, editor.getSelection(), true);

                    PresCKUtil.stopEvent(event);
                    return true;
                } else if (editor.isTable && !prevSibling) {
                    // since the left arrow is being blocked, the move to a new table cell is prevented.
                    // so we manually move the cursor to the previous table cell
                    editor.execCommand('moveToPreviousCell');
                    editor.setupNewCell();

                    PresCKUtil.stopEvent(event);
                    return true;
                }
            } else {
                // no previous li/p sibling and not in table, kept cursor in this li
                if (!editor.isTable) {
                    PresCKUtil.stopEvent(event);
                    return true;
                }
            }
        }

        return false;
    },

    // refer to isBullet in MSGUTIL
    isSpan : function(node) {
        if (!node)
            return false;

        var nodeName = '';
        if (typeof node == 'string')
            nodeName = node.toLowerCase();
        else if (node.nodeName) // for ie
            nodeName = node.nodeName.toLowerCase();
        else if (node.type == CKEDITOR.NODE_ELEMENT)
            nodeName = node.getName();
        else
            return false;

        return nodeName == 'span';
    },

    isBullet : function(node) {
        if (!node)
            return false;

        var nodeName = '';
        if (typeof node == 'string')
            nodeName = node.toLowerCase();
        else if (node.nodeName) // for ie
            nodeName = node.nodeName.toLowerCase();
        else if (node.type == CKEDITOR.NODE_ELEMENT)
            nodeName = node.getName();
        else
            return false;

        var dtd = CKEDITOR.dtd;
        return dtd.$listItem[nodeName] || dtd.$list[nodeName];
    },

    doesNodeHaveBothSpanAndBullet : function(node) {
        var hasSpan = false;
        var hasBullet = false;
        for (var i = 0, length = node.childElementCount;
             i < length; i++) {
            var child = node.childNodes[i];
            if (!hasSpan && PresCKUtil.isSpan(child)) {
                hasSpan = true;
            } else if (!hasBullet && PresCKUtil.isBullet(node)) {
                hasBullet = true;
            }

            if (hasSpan && hasBullet) {
                break;
            }
        }

        return hasSpan && hasBullet;
    },

    moveToNextLi : function(event, editor) {
        var range = editor.getSelection() && editor.getSelection().getRanges()[0];
        if (range && range.endContainer) {
            var parentWithSibling = range.endContainer;
            var nextSibling = null;
            var bList = PresCKUtil.checkNodeName(parentWithSibling, 'li', 'ul', 'ol', 'p');
            if (!bList) {
                // find the outermost ascendant which has a sibling
                while (parentWithSibling && (!nextSibling || MSGUTIL.isBogus(nextSibling))) {
                    parentWithSibling = parentWithSibling.getParent();
                    nextSibling = parentWithSibling? parentWithSibling.getNext() : null;
                    if (parentWithSibling.is && parentWithSibling.is('ul', 'ol', 'p'))
                        break;
                }
            } else {
                nextSibling = parentWithSibling.getNext();
            }
            
            if (!nextSibling) {
                return false;
            }

            var bHaveSpanAndBullet =
                PresCKUtil.doesNodeHaveBothSpanAndBullet(nextSibling.$);
            // move to the start of the next sibling
            var bBulletOrP =
                PresCKUtil.checkNodeName(parentWithSibling, 'li', 'ul', 'ol', 'p');
            if (bBulletOrP) {
                if (bHaveSpanAndBullet) {
                    // it looks like
                    // * 111       <li> ... </li>
                    // *           <li> <span>..</span> <br class='hideInIE'>
                    //   ** 222         <ol> ... </ol>                       </li>
                    // then we need to move to span other than ol
                    PresCKUtil.moveCursorToBeginningOfNode(nextSibling.$.firstChild,
                                                           editor.getSelection());

                    PresCKUtil.stopEvent(event);
                    return true;
                } else {
                    PresCKUtil.moveCursorToBeginningOfNode(nextSibling.$,
                                                           editor.getSelection());

                    PresCKUtil.stopEvent(event);
                    return true;
                } 
            }
        }

        return false;
    },

    isLastOrFirstPosForSpeakernotes : function(event, editor) {
        var range = editor.getSelection().getRanges()[0];
        var dfc = PresCKUtil.getDFCNode(editor);
        var keyStroke = event.data.getKeystroke();

        var isAtLastPos = false;
        var isAtFirstPos = false;
        if (keyStroke == dojo.keys.LEFT_ARROW
            || keyStroke == dojo.keys.UP_ARROW
            || keyStroke == dojo.keys.HOME) { //arrow left, arrow up or home key
            var node = range.startContainer; 
            if (node.type == CKEDITOR.NODE_TEXT) {
                node = node.getParent();
            }
            var firstNode =
                PresCKUtil.getFirstElementNode(dfc, node.$.nodeName);
            if (firstNode) {
                var ckNode = new CKEDITOR.dom.element(firstNode);
                if (node.equals(ckNode)
                    && node.getParent()&&node.getParent().equals(ckNode.getParent())) {
                    if (keyStroke == dojo.keys.UP_ARROW) {                 // arrowing up from anywhere in the first node
                        event.data.preventDefault(true);
                        editor.visibleKey = false;
                        isAtFirstPos = true;
                    } else if (keyStroke == dojo.keys.LEFT_ARROW && range.startOffset == 0) { // arrowing left from first position of first node
                        event.data.preventDefault(true);
                        editor.visibleKey = false;
                        isAtFirstPos = true;
                    } else if (keyStroke == dojo.keys.HOME) {
                        editor.safariHomeKeyAdjust = true; //Need to adjust on key up
                    }
                }
            }
        } else if (keyStroke == dojo.keys.RIGHT_ARROW
                   || keyStroke == dojo.keys.DOWN_ARROW
                   || keyStroke == dojo.keys.END) { //arrow right, arrow down or END key
            var node = range.startContainer;
            if (node.type == CKEDITOR.NODE_TEXT){
                node = node.getParent();
            }
            var lastNode =
                PresCKUtil.getLastElementNode(dfc, node.$.nodeName);
            if (lastNode) {
                var ckNode = new CKEDITOR.dom.element(lastNode);
                if (node.equals(ckNode)
                    && node.getParent()&&node.getParent().equals(ckNode.getParent())) {
                    if (keyStroke == dojo.keys.DOWN_ARROW) { // arrowing down from anywhere in the last node
                        event.data.preventDefault(true);
                        editor.visibleKey = false;
                        isAtLastPos = true;
                    } else if (keyStroke == dojo.keys.RIGHT_ARROW) {
                        var isAtLastPos = range.checkEndOfBlock();
                        var isEmptySpan =
                            PresCKUtil.isEmpty(range.endContainer.getText()); // may be span with 8203
                        if (isAtLastPos || isEmptySpan) {
                            // arrowing right from last position of last node
                            event.data.preventDefault(true);
                            editor.visibleKey = false;
                            isAtLastPos = true;
                        }
                    } else if (keyStroke == dojo.keys.END) { // END key
                        editor.safariEndKeyAdjust = true;  //Need to adjust on key up
                    }
                }
            }
        }

        return isAtFirstPos || isAtLastPos;
    },
    
    getBookmarkForCurrentRange: function( editor){
		var bookmark = null;
		var selection = null;
		var ranges = null;
		selection = editor.getSelection();
		ranges = selection && selection.getRanges();
		if ( ranges && ranges[0]){
			bookmark = ranges[0].createBookmark();
		}
		return bookmark;
    },
    
    moveRangeToBookmark: function( bookmark, editor){
		var selection = null;
    	selection = editor.getSelection();
    	var range = new CKEDITOR.dom.range(selection.document);
    	if ( bookmark){
        	range.moveToBookmark( bookmark );
        	selection.selectRanges( [ range ] );
        }
    },
    
    recreateDefaultCell: function(cell, keepStyle){
		var currentClasses = dojo.attr( cell, 'class');
		var inlineStyles = dojo.attr( cell, 'style');
		var oldP = null;
		if(keepStyle){
			oldP = dojo.clone(dojo.query("p", cell)[0]);
			var oldSpan = oldP && dojo.clone(dojo.query("span", oldP)[0]);
			if(oldSpan){
				oldSpan.innerHTML = '&#8203;';
				oldP.innerHTML = oldSpan.outerHTML;
				new CKEDITOR.dom.element(oldP).appendBogus();
			}
		}
		PresCKUtil.removeAllChildren(cell);
		MSGUTIL.genDefaultContentForCell(new CKEDITOR.dom.element(cell), oldP);
		dojo.attr( cell, 'class', currentClasses  );
		dojo.attr( cell, 'style', inlineStyles  );
    },
    
	getEndOfNodeCursorPositionRange: function(document, lastNode){
		var range = new CKEDITOR.dom.range( document);

		while (lastNode && lastNode.childNodes && lastNode.childNodes.length > 0){
			lastNode = lastNode.childNodes[lastNode.childNodes.length-1];
			if (lastNode.nodeName.toLowerCase() == 'br' && lastNode.previousSibling) {
        		lastNode = lastNode.previousSibling;
			}
		}
		if (!lastNode)
            	return;

        
		var cursorPos = CKEDITOR.POSITION_BEFORE_END;
        if (lastNode.nodeName.toLowerCase() == 'br') {
        	if (lastNode.previousSibling) {
            	lastNode = lastNode.previousSibling;    // set the stage to set the range before br
            } else {
            	cursorPos = CKEDITOR.POSITION_BEFORE_START;
            }
        }
        
        var lastNodeCk = new CKEDITOR.dom.node(lastNode);
        range.setStartAt( lastNodeCk, cursorPos );
        range.setEndAt( lastNodeCk, cursorPos );              
        range.collapse(true);
        return range;
    },
    
    /**
     * Compares two (numeric) font sizes and returns whether they are the "same."
     * 
     * Scenario:
     * - When you press ENTER (in 'enterkey' plugin), we determine the relative font size on the next line
     *   text. The font size calculation can introduce some rounding errors (which may be different depending
     *   on which browser is being used).
     * - When you combine two lines by hitting DEL at the end of the 1st line or hitting BS at the beginning
     *   of the 2nd line (in 'coediting' plugin), we attempt to merge those lines as much as possible by
     *   comparing styles / classes and font sizes, which, because of the rounding issues noted above, *might*
     *   not be the same. Instead, we have to check that the font sizes are "close enough" to the same.
     * 
     * @param fs1
     * @param fs2
     */
    areSameFontSizes : function( fs1, fs2 ) {
        return Math.abs( (fs1 - fs2) * 100 ) < 5;
    },
    
    /**
     * On older versions of Safari, color values may include spaces (between the RGB-specified value)
     * **OR** be "converted" into straight hex codes. So, when comparing color values, we need to
     * "normalize" to a known format. This function will turn RGB-based values into hex values.
     * 
     * @param colorValue - hex- or RGB-based color value
     * @returns hex-based color value
     */
    normalizeColorValue : function( colorValue ) {
        // make check for RGB(r,g,b) be case insensitive
        var rgbValueRE = /rgb\(\s?(\d{1,3}),\s?(\d{1,3}),\s?(\d{1,3})\s?\)/i;
        // if it doesn't match, just return the value that was passed in
        if ( !rgbValueRE.test( colorValue ) )
            return colorValue;
        
        var match = colorValue.match( rgbValueRE );
        // should have 4 matches:
        // - the 1st one will be the whole RGB string
        // - the 2nd through 4th ones will be the matched "groups"
        //   (the digits within the parentheses)
        if ( match && match.length == 4 ) {
            var r = match[1],
                g = match[2],
                b = match[3];
            // convert from text to number
            r = isNaN( r ) ? ( new Number(0) ) : ( new Number(r * 1) );
            g = isNaN( g ) ? ( new Number(0) ) : ( new Number(g * 1) );
            b = isNaN( b ) ? ( new Number(0) ) : ( new Number(b * 1) );
            
            // convert to hex
            r = (r < 16) ? '0' + r.toString(16) : r.toString(16);
            g = (g < 16) ? '0' + g.toString(16) : g.toString(16);
            b = (b < 16) ? '0' + b.toString(16) : b.toString(16);
            
            // chain the hex values together
            return '#' + r + g + b;
        }
        
        return colorValue;
    },
    
    
    /**
	 * D11285
     * Returns if key code is visible character or not.
     * Basically if the key stroke visibly modifies the content this function 
     * should return true. This includes ENTER key
     * Used: 1) Currently in coedit plugin key to avoid checking emptyDFC
     * 		 2) And in contentBox keyUpHandler for preventing calls to editorAdjust
     *          which may result in not restoring the default text
     */
	isVisibleKey: function(keyCode, keyStroke, eventData)
	{
		if (keyCode == null || keyCode == undefined ||
			keyStroke == null || keyStroke == undefined)
			return false;
		
		//Press Ctrl or Alt, this is not a visible key
		//enter (13), BS (8), or DEL (46)
		if(eventData && (eventData.altKey || eventData.ctrlKey || eventData.metaKey) &&
			(keyCode != 13 || keyCode != 8 || keyCode != 46))
			return false;
		
		// Character and number Key
		if(keyCode >= 48 && keyCode <= 90 ){
			if ( keyStroke == CKEDITOR.CTRL + 67 ){ // CTRL+c
				return false;
			}
			return true;
		}
		
		if(keyCode >= 96 && keyCode <= 111){
			if ( keyStroke == CKEDITOR.CTRL + 99 ){ // CTRL+C
				return false;
			}
			return true;
		}
		
		if(keyCode >= 186 && keyCode <= 192)
			return true;
		
		if(keyCode >= 219 && keyCode <= 222)
			return true;
		
		if(keyCode in PresCKUtil.specialKey) //backspace, space, del, Enter 
			return true;

		// Defect 38122
		if(keyCode == 0 && keyStroke == 2000 && CKEDITOR.env.gecko && CKEDITOR.env.mac)
		{
			// In IME mode, shift+ /(?) has different key code in keypress event.
			// Capture the key down event when the key code is 0 and key stroke is 2000.
			// Just press the shift key, its code is 16.
			// F16-F19 key code is 0 and key stroke is 2000
			return true;
		}
		// End

		// #30746 There are a lots of character that keycode = 0 on ipad virtual keyboard for different languages.
		if(keyCode == 0 && keyStroke == 0 && concord.util.browser.isMobile())
			return true;
		
		var editor = window.pe.scene.getEditor();
		if(editor && !editor.isTable && keyCode == 9)
			return true;
		
		return false;
	},
	
	setPressedForSpecialKeys: function(editor, key){
		if(isNaN(key))
			return;
		
		if(key == 99 || key == 67){ //for key 'c' or 'C'
			if(editor.cpressed)
				editor.cpressed ++;
			else
				editor.cpressed = 1;
		}else if(key == 97 || key == 65){ //for key 'a' or 'A'
			if(editor.apressed)
				editor.apressed ++;
			else
				editor.apressed = 1;
		}else if(key == 120 || key == 88){ //for key 'x' or 'X'
			if(editor.xpressed)
				editor.xpressed ++;
			else
				editor.xpressed = 1;
		}else if(key == 118 || key == 86){ //for key 'v' or 'V'
			if(editor.vpressed)
				editor.vpressed ++;
			else
				editor.vpressed = 1;
		}
		//console.log("set-->  editor.cpressed : " + editor.cpressed + ";   editor.apressed : " + editor.apressed +";   editor.xpressed : " + editor.xpressed);
	},
	
	isSpecialKeysCauseContentChange: function(editor, key, contentChange){
		if(isNaN(key))
			return contentChange;
		
		var ret = contentChange;
		//console.log("get-->   editor.cpressed : " + editor.cpressed + ";   editor.apressed : " + editor.apressed +";   editor.xpressed : " + editor.xpressed);
		if(key == 99 || key == 67){ //for key 'c' or 'C'
			ret = (editor.cpressed >= 2) ? true : false;
			delete editor.cpressed;
		}else if(key == 97 || key == 65){ //for key 'a' or 'A'
			ret = (editor.apressed >= 2) ? true : false;
			delete editor.apressed;
		}else if(key == 120 || key == 88){ //for key 'x' or 'X'
			ret = (editor.xpressed >= 2) ? true : false;
			delete editor.xpressed;
		}else if(key == 118 || key == 86){ //for key 'v' or 'V'
			ret = (editor.vpressed >= 2) ? true : false;
			delete editor.vpressed;
		}
		//console.log("after check-->   editor.cpressed : " + editor.cpressed + ";   editor.apressed : " + editor.apressed +";   editor.xpressed : " + editor.xpressed);
		
		return ret;
	},
	
	/*****
	 * Returns next span. Goes deep first( goes to children first then to 
	 */
	getSpans: function(node,endSpan, spanArray){
		if (node==null)
			return;
		if (node.type == CKEDITOR.NODE_TEXT){
			return;
		}				
		if (node.$==null && node.nodeName.toLowerCase()=='br'){
			return;			
		}
		var _cknode = PresCKUtil.ChangeToCKNode(node);
		var _ckendSpan = PresCKUtil.ChangeToCKNode(endSpan);
		if (endSpan!=null && _cknode && _cknode.equals && _cknode.equals(_ckendSpan)){
			return;
		}			
		
		var childrenNodes = node.getChildren();
		//Get the Children
		for (var i = 0; i<childrenNodes.count(); i++){
			var child = childrenNodes.getItem(i);			
			PresCKUtil.getSpans((child.$)? child: new CKEDITOR.dom.node(child) ,endSpan, spanArray);
		}
			
		//getSibling
		var sibling = node.nextSiblingElement();
		if (sibling!=null){			
			PresCKUtil.getSpans((sibling.$)? sibling : new CKEDITOR.dom.node(sibling), endSpan, spanArray);
		}
		
		if (node.$.nodeName.toLowerCase()=='span'){
			spanArray.push(node.$);
		}
		return spanArray;
	},
	
	
	/***
	 * This function returns all the spans that are within a range
	 */
	getSpansFromRange: function(editor){	
		
		var spanArray = [];		
		
		var ranges = editor.getSelection().getRanges( 1 ),
		iterator = ranges.createIterator(),
		range;

		while ( ( range = iterator.getNextRange() ) )
		{
			//D14864 getSpansFromRange is not intended for use with collapsed ranges, skip them
			if (range.collapsed)
				continue;
			
			if ( ! range.collapsed )
				range.enlarge( CKEDITOR.ENLARGE_ELEMENT );
			
			var bookmark = range.createBookmark(),
			
			startNode	= bookmark.startNode,
			endNode		= bookmark.endNode,
			currentNode;
			
			if(startNode.getParent().equals(endNode.getParent()) && startNode.getParent().getName() == 'span'){
				spanArray.push(startNode.getParent().$);
			}
			else{
					var addParentNodes = function(node){
						if (node.$.nextSibling == null){
							return;
						} 
						
						var path = new CKEDITOR.dom.elementPath( node ),
						pathElements = path.elements;
		
						for ( var i = 1, pathElement ; pathElement = pathElements[ i ] ; i++ )
						{
							if ( pathElement.equals( path.block ) || pathElement.equals( path.blockLimit ) )
								break;
		
							// If this element can be removed (even partially).
							if ( pathElement.getName() == 'span' && !( pathElement.hasAttribute && pathElement.hasAttribute( 'data-cke-bookmark' ) ))
								spanArray.push(pathElement.$);
						}
		
						
					};
					
					addParentNodes(startNode);
		
					currentNode = startNode.getNextSourceNode( true, CKEDITOR.NODE_ELEMENT );
					
					while ( currentNode )
					{
						if ( currentNode.equals( endNode ) )
							break;
		
						if (currentNode.getName() == 'span' && !( currentNode.hasAttribute && currentNode.hasAttribute( 'data-cke-bookmark' ) ) 
								&& currentNode.getFirst() && !currentNode.getFirst().equals(endNode))
							spanArray.push(currentNode.$);
						
						currentNode = currentNode.getNextSourceNode( false, CKEDITOR.NODE_ELEMENT );
					}
			}
			range.moveToBookmark( bookmark );
		}	
		return spanArray;
	},
	
	cleanSpanIds:function( rootDfc, cache ) {
    	var idHash = {};
        var attrToQry = cache ? 'id' : 'origid',
            attrToSet = cache ? 'origid' : 'id';
        dojo.forEach(
                dojo.query( 'SPAN[' + attrToQry + ']', rootDfc),
                function( item ) {
                	if(!dojo.hasClass(item,'text_p')) {
                		var id = dojo.attr( item, attrToQry );                		
                		if(!cache) {
                			if(idHash[id]) {
		                		id = MSGUTIL.getUUID();
	                		}                			
	                		idHash[id] = id;                			
                		} 
                		
                		dojo.attr( item, attrToSet, id );
                		item.removeAttribute( attrToQry );                		 
                	}
                }
        );
    },
    
    cleanSpans: function(rootDfc) {
    	 // for some reason, applying font-size can create empty / invalid SPANs. remove them.
        dojo.forEach(
                dojo.query( 'SPAN', rootDfc ),
                function( item ) {
                    if ( !item )
                        return;
                    
                    // if the SPAN doesn't contain any children (i.e. not even a text node)
                    // or if the SPAN is a bookmark, remove it
                    if ( !item.firstChild || ( item.hasAttribute && item.hasAttribute( 'data-cke-bookmark' ) ) ){
                        dojo.destroy( item );
                    }
                    else {
                        // if the SPAN contains a single text node whose contents are a
                        // "zero width space" character (Unicode 8203), remove it.
                        var txt = item.innerText || item.textContent || '';
                        if ( txt.length == 1 && (txt.charCodeAt( 0 ) == 65279 ))
                            dojo.destroy( item );
                        
                        // if the SPAN contains a single SPAN that's a bookmark node, remove it.
                        else if ( item.childNodes.length == 1 && item.firstChild.hasAttribute && item.firstChild.hasAttribute( 'data-cke-bookmark' ) )
                            dojo.destroy( item );
                    }
                }
        );
    },
    
	/***
	 * This function returns all the spans that are within a range
	 */
	getSpansFromRange_1: function(editor){	
		var spanArray = [];		
		if (editor==null){
			return spanArray;
		}		
		var selection = editor.getSelection();
		var ranges = selection.getRanges();
		
		if (ranges.length >0){
			 var range = ranges[0];			 
			 var startNode = range.startContainer;
			 
			 //1- Ensure we have spans for startNode and endNode
			 startNode = (startNode.type ==CKEDITOR.NODE_TEXT)? startNode.getParent() : (startNode.$.nodeName.toLowerCase()=='span')? startNode :range.startContainer.$.childNodes[range.startOffset];
			 var endNode = range.endContainer;
			 endNode = (endNode.type == CKEDITOR.NODE_TEXT)? endNode.getParent() : (endNode.$.nodeName.toLowerCase()=='span')? endNode : range.endContainer.$.childNodes[range.endOffset];			 
			 var iterator = range.createIterator();
			 var block = iterator.getNextParagraph();			 			 			 
			 while(block!=null){				 
				 var spans = dojo.query('span',block.$);
				 
				 for (var i=0; i < spans.length;i++){
					 spanArray.push(spans[i]);
				 }				 
				 block = iterator.getNextParagraph();
			 }
		}
		return spanArray;
	},

	/**
	 * Get style for a given range.
	 * @return retStyles : valid value--> only one node in walker, return the style value. e.g. {"BOLD":true, "FONTSIZE":"12px",...}
	 * 			           null--> the styles from range are of multiple value and not with the same value
	 */
	_getStyleValueForRange: function(range, styleName){
		var walker = new CKEDITOR.dom.walker(range.clone(), concord.text.tools.max_state_elements);
		walker.evaluator = concord.text.tools.textEvaluator;
		var node = walker.next();
		var currentPath = null;
		var styleValue = null;
		var hitTarget = -1;
		
		while(node){
			currentPath = new CKEDITOR.dom.elementPath(node);
			styleValue = PresCKUtil._getStyleValueFromElementPath(currentPath, styleName);
			
			if(hitTarget == -1){
				hitTarget = styleValue;
			}else if(hitTarget != styleValue){
				return null;
			}
			node = walker.next();
		}
		return hitTarget == -1 ? null : hitTarget;
		
	},
		
	/**
	 * The style vaule for a given element path.
	 * @param elementPath
	 * @param styleName : name of styles, please refer style keys from PresConstants
	 * @returns  null: styles from elementPath all don't match the given style.
	 * 			 stylevalue: the style value from elementPath("true"/"false" for bold)
	 */
	_getStyleValueFromElementPath: function(elementPath,styleName){
		if(elementPath == null || elementPath.elements == null){
			return null;
		}
		
		var isBold = function(v){
			v = (v + "").toLowerCase(); 
			if(v == "bold" || v== "bolder" || v == "700" || v=="800" || v == "900")
				return true;
			else if(v == "normal" || v == "400")
				return false;
		};
		
		var isItalic = function(v){
			v = (v + "").toLowerCase(); 
			if(v == "italic")
				return true;
			else
				return false;
		};
		styleName = styleName.toUpperCase();
		var styleKey = PresConstants.STYLES[styleName];
		var elements = elementPath.elements;
		for (var i =0;i< elements.length;i++){
			var element = elements[i];
			
			//using dojo API to get computedstyle is more accurate. // element.getComputedStyle(styleKey);
			var cpuStyleValue = dojo.getComputedStyle(element.$)[styleKey];
			
			switch(styleName){
				case "BOLD":
					return isBold(cpuStyleValue);
				case "FONTSIZE":
					cpuStyleValue = PresFontUtil.getPtFontSize(element.$);
					if(cpuStyleValue){
						// round font size
						if(cpuStyleValue > 10.25 && cpuStyleValue < 10.75)
							return 10.5;
						cpuStyleValue = dojo.number.round(cpuStyleValue * 1, 0);
						return cpuStyleValue;
					}
					break;
				case "FONTNAME":
					if(cpuStyleValue){
						cpuStyleValue = PresFontUtil.cleanQuotes(cpuStyleValue);
						if (cpuStyleValue.indexOf(',') > 0){
							cpuStyleValue = cpuStyleValue.substring(0, cpuStyleValue.indexOf(','));
							// substring will have added an additional quote to the end of the font name (if it
							// was a quoted string to begin with).  Remove the extra quote.
							cpuStyleValue = cpuStyleValue.replace(/"/g, ""); //#14257 and 14320, there is extra quote at the front of the font name, need to clean any extra quote
						}
						
						// Safari and Chrome return both double and single quotes for the
						// font family.  Clean up the single quotes.
						if (dojo.isWebKit && cpuStyleValue.indexOf("'") == 0) {
							cpuStyleValue = cpuStyleValue.replace(/'/g, "");
						}
						
						cpuStyleValue = PresFontUtil.toProperCase(cpuStyleValue);
						return cpuStyleValue;
					}
				case "ITALIC":
					return isItalic(cpuStyleValue);
				case "UNDERLINE":
					return cpuStyleValue.indexOf('underline')>=0?true:false;
				case "LINETHROUGH":
					return cpuStyleValue.indexOf('line-through')>=0?true:false;
				case "SUPERSCRIPT":
					return cpuStyleValue.indexOf('super')>=0?true:false;
				case "SUBSCRIPT":
					return cpuStyleValue.indexOf('sub')>=0?true:false;
				default:
					break;
			}
			
		}
		return null;
	},

	/**
	 * D7870 [Table][Toolbar] The Bold toolbar button is not enabled when select cell's text in a header row
	 * @param editor
	 * @param styleList: ["BOLD","FONTSIZE", "FONTNAME"]
	 */
	adjustToolBarForStyle: function(styleName){
		var editor = window['pe'].scene.getEditor();
		var sel = editor.getSelection();
		
		//D25805 Can't enter edit mode after click table twice
		if(dojo.isIE && !sel){
			return -1;
		}
		
		var ranges = sel.getRanges();
		var lastRet = -1;
		var ret = null;
		
		if(ranges.length == 0)
			return -1;
		
		for(var i = 0, len = ranges.length; i < len; i++){
			var range = ranges[i];
			if(!range.startContainer || !range.endContainer)
				continue;
			
			if(range.collapsed){
				var startE = range.startContainer;
				if((startE.type == CKEDITOR.NODE_TEXT) && (range.startOffset == range.endOffset)){
					
					if(range.startOffset == 0){
						if(startE.$.previousSibling){
							startE = startE.$.previousSibling;
							startE = new CKEDITOR.dom.node(startE);
						}
					}
					var currentPath = new CKEDITOR.dom.elementPath(startE);
					ret = PresCKUtil._getStyleValueFromElementPath(currentPath, styleName);
				}else if (startE.type == CKEDITOR.NODE_ELEMENT){
					if(startE.getChildCount() > range.startOffset)
						startE = startE.getChild(range.startOffset);
					else if(startE.getChildCount() > 0)
						startE = startE.getChild(startE.getChildCount() - 1);
					
					if(startE.$.nodeName.toLowerCase() == "br"){//<p><span></span><br>^^<p>
						startE = startE.getPreviousSourceNode();
						if(startE.getChildCount && (startE.getChildCount() > 0)) //startE could be a text node.
							startE = startE.getChild(startE.getChildCount() - 1);
					} 
					var currentPath = new CKEDITOR.dom.elementPath(startE);
					ret = PresCKUtil._getStyleValueFromElementPath(currentPath, styleName);
				}
			}else{
				ret = PresCKUtil._getStyleValueForRange(range, styleName);
			}
			
			if(-1 == lastRet){
				lastRet = ret;
			}
			else if(ret != lastRet){
				ret = "";
				break;
			}
			
		}
		
		return ret;
	},
	
	adjustToolBar: function(styleList){
		var retStyles = {};
		var editor = window['pe'].scene.getEditor();
		
		//Code refine for D28975
		if(!editor || !editor.contentBox || !editor.contentBox.editModeOn)
			return;
			
		for(var i = 0, len = styleList.length; i < len; i++){
			var styleName = styleList[i];
			var ret = PresCKUtil.adjustToolBarForStyle(styleName);
			retStyles[styleName] = ret;
		}
		
		setTimeout(dojo.hitch(this, function(styleList, retStyles){
			
			var state = CKEDITOR.TRISTATE_OFF;
			var eventData;
			for(var index=0, lenSL = styleList.length; index < lenSL; index++){
				var sName = styleList[index];
				var ret = (retStyles[sName] != -1) ? retStyles[sName] : "";
				switch(sName){
				case "BOLD":
					if(ret){
						state = CKEDITOR.TRISTATE_ON;
						eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_boldCheckedMenuOn}];
					}
					else{
						state = CKEDITOR.TRISTATE_OFF;
						eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_boldCheckedMenuOff}];
					}
					//editor.boldButton && editor.boldButton.setState(state, true); //directly change class
					editor.getCommand( 'bold' ).setState(state);
					concord.util.events.publish(concord.util.events.slideEditorEvents, eventData); 
					break;
				case "FONTSIZE":
					ret = ret || "";
					editor.fontSizeCombo && editor.fontSizeCombo.setValue(ret);	
					if (editor.contentBox.contentBoxType != PresConstants.CONTENTBOX_NOTES_TYPE) {
						if(ret && ret <= "5"){
							editor.getCommand( 'decreasefont' ).setState(CKEDITOR.TRISTATE_DISABLED);
							editor.getCommand( 'increasefont' ).setState(CKEDITOR.TRISTATE_OFF);
							if(!dijit.byId('P_i_DecreaseFontSize').disabled){
								eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_disableDecreaseFontSizeMenuItems}];
								concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
							}
							
							var incFontSize = dijit.byId('P_i_IncreaseFontSize');
							if(incFontSize && incFontSize.disabled){
								eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableIncreaseFontSizeMenuItems}];
								concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
							}
						}else if(ret >= "200"){
							editor.getCommand( 'increasefont' ).setState(CKEDITOR.TRISTATE_DISABLED);
							editor.getCommand( 'decreasefont' ).setState(CKEDITOR.TRISTATE_OFF);
							
							var incFontSize = dijit.byId('P_i_IncreaseFontSize');
							if(incFontSize && !(incFontSize.disabled)){
								eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_disableIncreaseFontSizeMenuItems}];
								concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
							}
							
							var decFontSize = dijit.byId('P_i_DecreaseFontSize');
							if(decFontSize && decFontSize.disabled){
								eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableDecreaseFontSizeMenuItems}];
								concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
							}
						}else{
							editor.getCommand( 'increasefont' ).setState(CKEDITOR.TRISTATE_OFF);
							editor.getCommand( 'decreasefont' ).setState(CKEDITOR.TRISTATE_OFF);
							
							var incFontSize = dijit.byId('P_i_IncreaseFontSize');
							if(incFontSize && incFontSize.disabled){
								eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableIncreaseFontSizeMenuItems}];
								concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
							}
							
							var decFontSize = dijit.byId('P_i_DecreaseFontSize');
							if(decFontSize && decFontSize.disabled){
								eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableDecreaseFontSizeMenuItems}];
								concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
							}						
						}
					}
					break;
				case "FONTNAME":
					ret = ret || "";
					editor.fontFamilyCombo && editor.fontFamilyCombo.setValue(ret);
					break;
				case "ITALIC":
					if(ret){
						state = CKEDITOR.TRISTATE_ON;
						eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_italicCheckedMenuOn}];
					}
					else{
						state = CKEDITOR.TRISTATE_OFF;
						eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_italicCheckedMenuOff}];
					}
					editor.getCommand( 'italic' ).setState(state);
					concord.util.events.publish(concord.util.events.slideEditorEvents, eventData); 
					break;
				case "UNDERLINE":
					if(ret){
						state = CKEDITOR.TRISTATE_ON;
						eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_underlineCheckedMenuOn}];
					}
					else{
						state = CKEDITOR.TRISTATE_OFF;
						eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_underlineCheckedMenuOff}];
					}
					editor.getCommand( 'underline' ).setState(state);
					concord.util.events.publish(concord.util.events.slideEditorEvents, eventData); 
					break;
				case "LINETHROUGH":
					if(ret){
						state = CKEDITOR.TRISTATE_ON;
						eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_strikethroughCheckedMenuOn}];
					}
					else{
						state = CKEDITOR.TRISTATE_OFF;
						eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_strikethroughCheckedMenuOff}];
					}
					editor.getCommand( 'strike' ).setState(state);
					concord.util.events.publish(concord.util.events.slideEditorEvents, eventData); 
					break;
				default:
					break;
				
				}
			}
		}, styleList, retStyles), 0);
	},
	
	/**
	 * This functions returns the spans in a block for font detection
	 */
	getSpansFromSelection: function(editor){
		var spanArray = [];		
		if (editor==null){
			return spanArray;
		}		
		var selection = editor.getSelection();
		var dfc = PresCKUtil.getDFCNode(editor);
		
		var spans = dojo.query('span',dfc);				 
		 for (var i=0; i < spans.length;i++){
			 if (PresCKUtil.checkIfNodeInRange(editor,spans[i],selection,dfc,spans)){
				 spanArray.push(spans[i]);
			 }					 
		 }	

		return spanArray;
	},
	

	//D15192 make sure that br's inside spans have a class of hideInIE
	//when a user has select shift+enter
	adjustBrClassForShiftEnter: function(editor){
		if ( !editor || !editor.contentBox )
  	        return;
  	    var editNode = editor.contentBox.getContentEditNode();
  	    if (!editNode)
  	        return;
  	    var brs = dojo.query('SPAN>BR',editNode);		 
		for (var i=0; i < brs.length;i++){
			if (!dojo.hasClass(brs[i], "hideInIE")) {
				dojo.addClass(brs[i], "text_line-break");
			}
		}
	},

	//D14848
	//based on the selection
	//hide or show indent and outdent in the toolbar 
	//select or deselect numbering/bullet button in the toolbar
	adjustToolBarForList: function(editor){
		if(!editor)
			return;
		
	    function _IsAlginment(element, value ){
	    	var direction = element.getComputedStyle( 'direction' );
	    	var align = element.getComputedStyle( 'text-align' );
	    	if(align)
	    	{
	    		align = align.replace( /-moz-|-webkit-|start|auto/ig, '');
	    		if((align!='right')
	    				&& (align!='left') 
	    				&& (align!='center'))
	    			align = null;
	    	}
	    	if(!align)
	    		align = direction == 'rtl' ? 'right' : 'left';
		    return (align == value);
	    }
		
		function _toggleToolbarButton(buttonName,state)
		{
			var editor = concord.util.presToolbarMgr.findActiveTbEditor();
			var toolbars = editor.toolbox.toolbars;
		    for (var i=0; i<toolbars.length; i++){
				var toolbar = toolbars[i];
				for (var j=0; j<toolbar.items.length; j++){
					var item = toolbar.items[j];
					if(item.button){
						if (item.button.className == buttonName){
								item.button.setState(state);
						}
					}
				}
			}
		}
		
		//state is 
//		CKEDITOR.TRISTATE_ON = 1;
//		CKEDITOR.TRISTATE_OFF = 2;
//		CKEDITOR.TRISTATE_DISABLED = 0;
		function _toggleButton(buttonName,state)
		{
			switch(buttonName)
			{
			case 'cke_button_indent':
			case 'cke_button_outdent':
				{
					if(state == CKEDITOR.TRISTATE_ON)
						state = CKEDITOR.TRISTATE_OFF;
					_toggleToolbarButton(buttonName,state);
					var eventName = null;
					if(state == CKEDITOR.TRISTATE_DISABLED)
					{
						eventName = (buttonName=='cke_button_indent')?
								concord.util.events.crossComponentEvents_eventName_disableIncreaseIndentMenuItems:
								concord.util.events.crossComponentEvents_eventName_disableDecreaseIndentMenuItems;
					}
					else 
					{
						eventName = (buttonName=='cke_button_indent')?
								concord.util.events.crossComponentEvents_eventName_enableIncreaseIndentMenuItems:
								concord.util.events.crossComponentEvents_eventName_enableDecreaseIndentMenuItems;
					}
					
					if(eventName)
					{
						var eventData = [{'eventName': eventName}];
						concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);	
					}
				}
				break;

			default:
				{
				_toggleToolbarButton(buttonName,state);
				}
				break;
			}
		}
		
		var selection = editor.getSelection();
		if (!selection) {
			return;
		}
		var range = selection.getRanges()[0];
		if (!range || !range.startContainer) {
			return;
		}
		var selectLineInfo = this.getLinesSelected(editor);
		if(!selectLineInfo)
		{
			_toggleButton('cke_button_indent',CKEDITOR.TRISTATE_ON);
			_toggleButton('cke_button_outdent',CKEDITOR.TRISTATE_ON);
			_toggleButton('cke_button_numberedlist',CKEDITOR.TRISTATE_OFF);
			_toggleButton('cke_button_bulletedlist',CKEDITOR.TRISTATE_OFF);
			_toggleButton('cke_button_justifyleft',CKEDITOR.TRISTATE_OFF);
			_toggleButton('cke_button_justifycenter',CKEDITOR.TRISTATE_OFF);
			_toggleButton('cke_button_justifyright',CKEDITOR.TRISTATE_OFF);
			return;
		}
		var layoutFamily = editor.contentBox ? dojo.attr(editor.contentBox.mainNode, "presentation_class") : null;
	
		var maxLevel = 0;
		var minLevel = 10;
		var numberingType = true;
		var bulletType = true;
		var allAlignLeft = true;
		var allAlignCenter = true;
		var allAlignRight = true;
		for(var i=0;i<selectLineInfo.selectLines.length;i++)
		{
			var line = selectLineInfo.selectLines[i];
			if(numberingType && !(line.is('ol')))
				numberingType = false;
			if(bulletType && !(line.is('ul')))
				bulletType = false;
			var lineItem = PresListUtil.getLineItem(line);
			if(!lineItem)
			{
				console.warn("no line item in line:"+line.getOuterHtml());
				continue;
			}
			var level = lineItem.getAttribute('level');
			if(level)
			{
				level = parseInt(level,10);
				if(!level || isNaN(level))
					level = 1;
			}
			else
				level = 1;
			if(level>maxLevel)
				maxLevel = level;
			if(level<minLevel)
				minLevel = level;
			
			if(allAlignLeft && !_IsAlginment(lineItem,'left'))
				allAlignLeft = false;
			if(allAlignRight && !_IsAlginment(lineItem,'right'))
				allAlignRight = false;
			if(allAlignCenter && !_IsAlginment(lineItem,'center'))
				allAlignCenter = false;
			
		}
		//both true? that's impossible, might cause no line be selected
		if(numberingType && bulletType)
		{
			numberingType = false;
			bulletType = false;
		}

		var line = BidiUtils.isBidiOn() ? selectLineInfo.selectLines[0] : null;
		if(line && !editor.readOnly) {
	    		var indent = dojo.query('.cke_button_indent');
	    		var outdent = dojo.query('.cke_button_outdent');
	    		var isRtlElement = PresListUtil.getLineItem(line).getComputedStyle('direction') == 'rtl';
		    	var toolbar = dojo.query("#toolbar")[0];
	    		/* skip if icons are already in correct position */
	    		if(toolbar && (dojo.hasClass(toolbar, 'rtl') ^ isRtlElement)) {
		    		for(var i = 0; i < indent.length; i++) {
		    			if(isRtlElement) //swap relative placement
		    				dojo.place(outdent[i].parentNode, indent[i].parentNode, "after");
		    			else
		    				dojo.place(outdent[i].parentNode, indent[i].parentNode, "before"); 	
		    		}
		    		/* swap icons indent <-> outdent */
	                    	if(isRtlElement)
	                    		dojo.addClass(toolbar, 'rtl');
	                    	else
	                    		dojo.removeClass(toolbar, 'rtl');
	    		}
	    	}
		
		//we only want to disable indent outden for title boxes
		if (layoutFamily && (layoutFamily == "title")){
 			
			_toggleButton('cke_button_indent',CKEDITOR.TRISTATE_DISABLED);
			_toggleButton('cke_button_outdent',CKEDITOR.TRISTATE_DISABLED);
 		}
		else
		{
			_toggleButton('cke_button_indent', ((maxLevel == minLevel)&&(maxLevel==9))?CKEDITOR.TRISTATE_DISABLED:CKEDITOR.TRISTATE_ON);
			_toggleButton('cke_button_outdent',((maxLevel == minLevel)&&(minLevel==1))?CKEDITOR.TRISTATE_DISABLED:CKEDITOR.TRISTATE_ON);
		}

		_toggleButton('cke_button_numberedlist',numberingType?CKEDITOR.TRISTATE_ON:CKEDITOR.TRISTATE_OFF);
		_toggleButton('cke_button_bulletedlist',bulletType?CKEDITOR.TRISTATE_ON:CKEDITOR.TRISTATE_OFF);
		
		//For support mobile device, use getCommand, not _toggleButton
		pe.scene.getEditor().getCommand("presAlignLeft").setState( allAlignLeft?CKEDITOR.TRISTATE_ON:CKEDITOR.TRISTATE_OFF );
		pe.scene.getEditor().getCommand("presAlignCenter").setState( allAlignCenter?CKEDITOR.TRISTATE_ON:CKEDITOR.TRISTATE_OFF );
		pe.scene.getEditor().getCommand("presAlignRight").setState( allAlignRight?CKEDITOR.TRISTATE_ON:CKEDITOR.TRISTATE_OFF );
	},
    
    insertHTMLForIE: function(editor,htmlStr){
    	var doc = editor.document.$;
    	var div = doc.createElement('div');
    	div.appendChild(doc.createTextNode(htmlStr));    	
    	var str = div.innerText;
    	dojo.destroy(div);
    	div = null;
    	return str;
    },
    //htmlStr should be a valid content under Table, e.g. tbody or tr
    insertTableContentForIE: function(document, table, htmlStr){
    	if(document!=null && table!=null && htmlStr!=null){
    		var span = document.createElement("span");
    		span.style.visibility = "hidden";
    		span.innerHTML="<table>"+htmlStr+"</table>";
    		//todo:need to handle multiple tr's right under table without tbody
    		var newColgrp = span.firstChild.childNodes[0];
    		var newTbody = span.firstChild.childNodes[1];
    		table.innerHTML = "";
    		newColgrp && table.appendChild(newColgrp);
    		newTbody && table.appendChild(newTbody);
    		dojo.destroy(span);		
    	}
    	return table;
    },
    
    /***
     * Clears the synchAllParams of the editor 
     */
    cleanSynchAllParams: function(editor){
    	if ( editor && editor.synchAllParams ){
    		if( editor.synchAllParams.nodeToSynch){
    			dojo.destroy(editor.synchAllParams.nodeToSynch); 
    			editor.synchAllParams.nodeToSynch = null;
    		}
    		if(editor.synchAllParams.preSnapShot){
    			dojo.destroy(editor.synchAllParams.preSnapShot);
    			editor.synchAllParams.preSnapShot = null;
    		}
    		editor.synchAllParams = null;
    	}
	},

    /***
     * Updates the synchAllParams of the editor 
     */
	updateSynchAllParams: function(editor,node){
		if (editor.keyDownTimeout!=null){
			clearTimeout(editor.keyDownTimeout);
			editor.synchAllTodoCtr--;
		}
		var nodeToSynchClone =(node)? PresCKUtil.cloneSnapShot(node) :null;
		editor.synchAllParams = {'nodeToSynch': nodeToSynchClone};
		editor.synchAllTodoCtr++;	
		nodeToSynchClone=null;
	},
    
	/***
	 * Converts margin value from em to percent
	 */
	convertMarginEmToPercent: function(emValue){	
		var percentValue;
		if (emValue.indexOf('em') > 0) {
			// Assume that indent offset is 1em per indent level
			var value = parseInt(emValue.slice(0, emValue.indexOf('em')));
			var multiplier = 5;//CKEDITOR.config.indentUnit == '%'? CKEDITOR.config.indentOffset : 5;
			percentValue = '' + value*multiplier + '%';
		} else
			percentValue = emValue;
		
		return percentValue;
	},
	
	doesTableHaveMergedColumn: function( table){
		var cells = dojo.query('td[colspan], th[colspan]', table);
		if ( cells && cells.length > 0){
			return true;
		}
		return false;
	},
	
	doesCellHaveMergedColumn:  function( cell){
		return dojo.hasAttr(cell, 'colspan');
	},
	removeDefaultTextContent: function(editor){
		if(editor!=null){
			//Defect 13726 do not include the defaultContentText when pasting
			var dfc = PresCKUtil.getDFCNode(editor);
			if (dfc && dfc.firstChild ){
				if(PresCKUtil.checkNodeName(dfc.firstChild,'p','ul'))
				{
					var nodeToEvaluate = dfc.firstChild;
					if(PresCKUtil.checkNodeName(dfc.firstChild,'ul'))
						nodeToEvaluate = dfc.firstChild.firstChild;
					if (dojo.hasClass(nodeToEvaluate, "defaultContentText")) {
						
						//for #14320 we need to comment out the following if which blindly remove the span if it has newTextContent class
						//side effect is the pasted text gets deleted if we paste it into a default box because we destroy it below here
			//				if (dfc.firstChild.firstChild.nodeName.toLowerCase() == 'span' && dojo.hasClass(dfc.firstChild.firstChild,"newTextContent")) {
			//					dojo.destroy(dfc.firstChild);
			//				}
						//if (CKEDITOR.env.webkit) {
							//for #14320
							//need to go through all children if there is any content
							//if there is any content, or text node,leave it
							var hasContent = PresCKUtil.doesNodeContainText(nodeToEvaluate);
							/*
							var children = nodeToEvaluate.childNodes;
							var len = children.length;
							var hasContent = false;
							for (var i = 0; i < len; ++i) {
								var nodeType = children[i].nodeType;
								if(nodeType == 1){
									if(children[i].innerHTML!=null && children[i].innerHTML.length >0 && children[i].innerHTML!="&nbsp;"){
										hasContent = true;
									}
								}else if(nodeType == 3){
									if(children[i].nodeValue!=null && children[i].nodeValue.length>0){
										hasContent = true;
									}
								}
							}
							*/
							//for #14320
							if (hasContent == false){
								this.removeBlankNewTextContent(dfc);
							} 
							/*&& dfc.firstChild.firstChild.nodeName.toLowerCase() == 'span' && dojo.hasClass(dfc.firstChild.firstChild,"newTextContent")) {
								dojo.destroy(dfc.firstChild);
							}
							*/
						//}
						/*
						 else{
							this.removeBlankNewTextContent(dfc);
						}
						*/
						
					}else{ //#14320 and #13726 pasting to a newly created textbox (p doesn't have defaultContentText class) in other browsers except Safari gets a first blank line
						if(!CKEDITOR.env.webkit){
							this.removeBlankNewTextContent(dfc);
						}
						
					}
				}
			}
		}
	},
	removeBlankNewTextContent:function(dfc){
		if(dfc!=null && dfc.firstChild!=null){
			var spanCandidate = dfc.firstChild.firstChild;
			if(dfc.firstChild.nodeName.toLowerCase() == 'ul' && dfc.firstChild.firstChild !=null){
				spanCandidate = dfc.firstChild.firstChild.firstChild;
			}
			var isElemHasContain = PresCKUtil.doesNodeContainText(spanCandidate);
			if (spanCandidate.nodeName.toLowerCase() == 'span' && dojo.hasClass(spanCandidate,"newTextContent") && isElemHasContain == false) {
				dojo.destroy(spanCandidate.parentNode);
			}
		}
	},

	transformPtoLiElem: function(pElem) {
		/*//cannot use sorter's they have some differences in handling data
		var sorter = window.pe.scene.slideSorter;
		var li = sorter.transformPtoLiElem(pElem);
		return li;
		*/
		var li = document.createElement('li');
		//D15089 Li's should have ID's
		concord.util.HtmlContent.injectRdomIdsForElement(li);
		if(pElem!=null){
			//Wangzhe >>>=================
//			var liCName = CKEDITOR.plugins.liststyles && CKEDITOR.plugins.liststyles.defaultListStyles ?
//    		        CKEDITOR.plugins.liststyles.defaultListStyles.ul : null; // if exists, use current setting for UL
			var liCName = null;
			//<<<=======================
			dojo.addClass(li, 'text_list-item'); // for conversion
			var content = pElem.innerHTML;

		    var hasContent = (PresCKUtil.doesNodeOnlyContainNbsp(pElem)) ?
		    		false : PresCKUtil.doesNodeContainText(pElem);

		    // if using custom list class and there's non-empty data
		    if ( liCName && hasContent == true )
				dojo.addClass( li, liCName );
		    // if using custom list class and there's empty data
		    else if (liCName && hasContent == false )
		        dojo.style( li, 'display', 'block' );
			
			li.innerHTML = content;
			
			dojo.attr(li,'p_text_style-name','');
			dojo.attr(li,'text_p','true');
		}
		return li;
		
	},
	
	getDirectLiElemsFromUl: function (ulElem){
		var children = [];
		if(ulElem!=null){
			var ulChildren = ulElem.childNodes;
			for(var i=0; i< ulChildren.length; i++){
				if(ulChildren[i].nodeType == 1 && ulChildren[i].tagName!=null && ulChildren[i].tagName.toLowerCase() == "li"){
					children.push(ulChildren[i]);
				}
			}
		}
		return children;
	},
	//14853: [Textbox][Firefox]Font size not reflected or wrong when entering text in textbox
	// check to see if the span has a text node besides other span children
	doesSpanHaveVisibleTextNodes: function(node,ignoreSpace){

		var children = node.childNodes;
		
		if (children.length == 0){
			return false;
		}
		
		var retValue = false;
		
		var childNode = children[0];
		var ctr = 0;
		while(childNode && (!retValue)){

			if(childNode.nodeType == CKEDITOR.NODE_TEXT){
				spanText = TEXTMSG.getTextContent(node);
				if(!ignoreSpace){
					spanText = spanText.replace(/\s/g, "");
					var charValue=String.fromCharCode(8203);
					spanText = spanText.replace(new RegExp(charValue, "g"), "");
				}
				if(spanText != ''){
					retValue = true;
					break;
				}
				
			}
			
			childNode = children[ctr++];
		}
		return retValue;
	},
	
	// check to see if its an empty span
    // blankSpace = true: take blank space as text content;
	// blankSpace = false: ingore blank space;
	// e.g. for "<span>&nbsp;<span>", hasTxt(childTxt, true) ==> true; hasTxt(childTxt) ==> false;
	isThisAEmptySpan: function(node, blankSpace){
		if (node.childNodes.length==0)
			return true;

		var spanText; 
		
		if(node.textContent)
			spanText = node.textContent;
		else
			spanText = node.innerText;
		
		if((spanText == ' ' || spanText == '\xa0') && blankSpace)
			return false;
		
		spanText = spanText && spanText.replace(/\s/g, "");
		
		if(spanText == '')
			return true;
		
		return false;
	},
	
	//check to see if the span has all bookmark spans
    // blankSpace = true: take blank space as text content;
	// blankSpace = false: ingore blank space;
	// e.g. for "<span>&nbsp;<span>", hasTxt(childTxt, true) ==> true; hasTxt(childTxt) ==> false;
	checkIfSpanWithJustBookmarks: function(node, blankSpace){
		if (!node){
			return false;
		}
		var returnVal = true;
		var childNodes = node.childNodes;
		
		if(childNodes.length == 0)
			return false;
		
		var childNode = childNodes[0];
		var ctr = 0;
		while(childNode){
			
			if(childNode.nodeType == CKEDITOR.NODE_ELEMENT && childNode.nodeName.toLowerCase() == 'span' && !dojo.hasAttr(childNode,'data-cke-bookmark')){
				returnVal = false;
				break;
			}else if(childNode.nodeType == CKEDITOR.NODE_TEXT){
				var nodeText; 
				
				if(node.textContent)
					nodeText = node.textContent;
				else
					nodeText = node.innerText;
				
				if((nodeText == ' ' || nodeText == '\xa0') && blankSpace)
					return false;
				
				nodeText = nodeText.replace(/\s/g, "");

				if(nodeText != ''){
					returnVal = false;
					break;			
				}
			}
			childNode = childNodes[ctr++];
		}
		
		
		return returnVal;
		
	},
	
	checkIfFirstSpanWithText: function(node){
		if (!node){
			return false;
		}

		if(node.$){
			node = node.$;
		}
		
		var firstChild = true;
		
		// accounting for nested spans. The goal is if the selected text visible to the user
		// is right next to the bullet, this function will return true.
		var checkParent = true;
		var currLevelNode = node;
		var tempNode = currLevelNode.previousSibling;
		
		while(checkParent){
			
			while (tempNode){
				if((tempNode.nodeName.toLowerCase() == 'span' && !PresCKUtil.isThisAEmptySpan(tempNode) && !PresCKUtil.checkIfSpanWithJustBookmarks(tempNode) && !dojo.hasAttr(tempNode,'data-cke-bookmark'))){
					return false;
				}
				
				tempNode = tempNode.previousSibling;
			}
			if(currLevelNode.parentNode == null)
				return false;

			if(currLevelNode.parentNode.nodeName.toLowerCase() == 'span'){
				currLevelNode = currLevelNode.parentNode;
				tempNode = currLevelNode.previousSibling;	
			}else if(currLevelNode.parentNode.nodeName.toLowerCase() == 'li'){
				return true;
			}else if(currLevelNode.parentNode.nodeName.toLowerCase() == 'p' || currLevelNode.parentNode.nodeName.toLowerCase() == 'div'){
				return false;
			}else {
				return false;
			}
		}

		return firstChild;

	},
	/**
	 * D14828
	 * Looks for stray txt and adds to a span
	 * PLEASE NOTE: This function is only to be used for the identified defect.
     * Do not expect to reuse this function whenever you have a stray text that does not
     * fit the cases identified in the comments below.
	 */
	fixStrayTxt: function(dfc,editor,rangeOnStrayText){		
		if (editor.ctrlA)   //do nothing if ctrlA is on.
			return;
		var selection = editor.getSelection();
		var ranges = selection.getRanges();
		var span = null;
		//D14828 16560 17252 and 15084
		// Here are the cases identified when user 1 types in ab over existing content
		//
		// Note: CASES 1 and 2 covers before the user types the second character		
		// 			case1 : First char: a will stray under block
		// 		   		ex: <p> a <span indicator=1> </span> </p>
		
		// 			case2 : First char a strays under previous sibling (usually another indicator)
		//				ex: <p> <span indicator =2 > a </span> 

		// Note: CASES 3 and 4 covers when the user types the second character
		
		// 			case3 : First char a strays under block and the second char is in the correct span
		//		 		ex:  <p> a <span indicator=1>  b</span> </p>
		// 				This happens in the following scenario: Since fixStrayTxt  function only runs on keyup
		// 				if the user presses the second char b before the first char's 'a' keyup is processed then
		// 				the first char 'a' is not fixed. We rely on the processing of the second char to fixt the first one.
		
		// 			case4 : First char a strays under strays under previous sibling and the second char is in the correct span
		//		 		ex:  <p>  <span indicator =2 > a </span>  <span indicator=1>  b</span> </p>
		// 				This happens in the following scenario: Since fixStrayTxt  function only runs on keyup
				
		if (rangeOnStrayText){
			//
			// This if case will handle the first character that has strayed from a type over scenario. The code will immediately 
			// bring that character into the new indicator span. The range can be at the text node itself or at the parent block element.
			//
			var startContainer = ranges && ranges.length > 0 && ranges[0].startContainer? ranges[0].startContainer : null;
			var txtNode = null;
			if (startContainer && startContainer.type == CKEDITOR.NODE_TEXT)
				txtNode = startContainer;
			else if (startContainer && startContainer.is && startContainer.is('li', 'p')) {
				var childAtOffset = startContainer.getChild(ranges[0].startOffset);
				if(childAtOffset)
					txtNode = childAtOffset.type == CKEDITOR.NODE_TEXT? childAtOffset : null;
			}
			if (txtNode){
				if (txtNode.$.parentNode.nodeName.toLowerCase()!='span'){
					span = PresCKUtil.createNewIndicator(txtNode);		
					if (span){// case 1
						var range = ranges[0];
						var cursorPos = CKEDITOR.POSITION_BEFORE_END;
			            range.setStartAt( span, cursorPos );
			            range.setEndAt( span, cursorPos );                 
			            range.collapse(true);
			            selection.selectRanges( [ range ] );
					}				
				}else{// case2: if it is span but wrong indicator let's fix
//					if ( !window.pe.scene.session.isSingleMode() ) {
						var parentSpan = txtNode.$.parentNode; // should be span
						var indicatorId= "CSS_"+ pe.scene.authUser.getId();
						if (!dojo.hasClass(parentSpan,indicatorId)){
							parentSpan.className=indicatorId;
							dojo.attr(parentSpan,'typeid',indicatorId);						
						}		
//					}
				}
			}			
		}else { //the range is not on the stray. The stray is sibling to the current range
			//
			// This if case will handle the second character after the type over is performed.
			// It covers the scenario where first character has strayed but the never corrected (because the user typed to quickly)
			//
			if (ranges && ranges.length > 0 && ranges[0].startContainer && ranges[0].startContainer.type == CKEDITOR.NODE_TEXT  &&
				ranges[0].startContainer.$.parentNode && ranges[0].startContainer.$.parentNode.nodeName.toLowerCase()=='span' &&
				ranges[0].startContainer.$.parentNode.previousSibling && 
				ranges[0].startContainer.$.parentNode.previousSibling.nodeType ==CKEDITOR.NODE_TEXT){
				//This if case will handle second character after first character has strayed under a p or li
				var range = ranges[0];
				var strayText = range.startContainer.getParent().getPrevious();
				var currentSpan =  range.startContainer.getParent();
				span = currentSpan.$;
				var currentTextNode = range.startContainer.$;
				var currentTextContent = TEXTMSG.getTextContent(currentSpan.$);
				
				//1- Add the stray to current span
				TEXTMSG.setTextContent(currentSpan.$,strayText.getText()+ currentTextContent);
				
				//2- delete stray
				dojo.destroy(strayText.$);
				
				//3-Move cursor back to end of span
				var cursorPos = CKEDITOR.POSITION_BEFORE_END;
	            range.setStartAt( currentSpan, cursorPos );
	            range.setEndAt( currentSpan, cursorPos );                 
	            range.collapse(true);
	            selection.selectRanges( [ range ] );			
			} else if (ranges && ranges.length > 0 && ranges[0].startContainer && ranges[0].startContainer.type == CKEDITOR.NODE_TEXT  &&
					ranges[0].startContainer.$.parentNode && ranges[0].startContainer.$.parentNode.nodeName.toLowerCase()=='span' &&
					ranges[0].startContainer.$.parentNode.previousSibling && 
					ranges[0].startContainer.$.parentNode.previousSibling.nodeName.toLowerCase() =='span'){
				//This if case will handle second character after first character has strayed under another span with different indicator
				var range = ranges[0];
				var strayContainer = range.startContainer.getParent().getPrevious();
				var strayText =strayContainer.getLast(); //this should be the stray text node
				if (strayText.type !=CKEDITOR.NODE_TEXT){
					return;
				}
				var currentSpan =  range.startContainer.getParent();
				span = currentSpan.$;
				var currentTextNode = range.startContainer.$;
				var currentTextContent = TEXTMSG.getTextContent(currentSpan.$);
				
				//1- Add the stray to current span
				TEXTMSG.setTextContent(currentSpan.$,strayText.getText()+ currentTextContent);
				
				//2- delete stray
				dojo.destroy(strayText.$);
				
				//3-Move cursor back to end of span
				var cursorPos = CKEDITOR.POSITION_BEFORE_END;
	            range.setStartAt( currentSpan, cursorPos );
	            range.setEndAt( currentSpan, cursorPos );                 
	            range.collapse(true);
	            selection.selectRanges( [ range ] );							
			}
		}
		return span ;
	},
	
	/**
	 * D14828
	 * Creates indicator aroung elememt and returns element
	 */
	createNewIndicator : function(element){
		console.log('	fixStrayTxt createNewIndicator');
		var indicatorspan= new CKEDITOR.dom.element("span");
		var indicatorId= "CSS_"+ pe.scene.authUser.getId();
		indicatorspan.setAttribute("type","indicator");
		indicatorspan.setAttribute("typeid",indicatorId);
   		indicatorspan.addClass(indicatorId);
		indicatorspan.addClass("indicatortag");
		indicatorspan.appendText(element.getText());
		indicatorspan.replace(element);
		return indicatorspan;
	},
	updateRowHeightForDelete: function( selectedRow){
		if ( selectedRow){
			var table = new CKEDITOR.dom.element(selectedRow).getAscendant('table', true);
			var maxHeight = dojo.isIE ? selectedRow.style.getAttribute('max-height') : selectedRow.style.getPropertyValue('max-height');
			var currentHeight = (selectedRow.offsetHeight/table.$.offsetHeight)*100;
			if ( maxHeight && currentHeight > parseFloat( maxHeight)){
				dojo.style( selectedRow,  {
					'height': maxHeight,
					'maxHeight': ''
				});
			} else {
				PresTableUtil.resetCKBodyHeight(contentBox);
				dojo.style( selectedRow,  'maxHeight', '');
			}
		}
	},
	convertSafariStyleNodesToSpan: function( range){
		var modifyNode = false;		
		var bold = false;
		var italics = false;
		var underline = false;
		var strike = false;
		var fontColor = null;
		var fontSize = null;
		var currentNode = range.startContainer;	
		var nodeToReplace = null;
		var span = null;
		while ( currentNode && currentNode.type != CKEDITOR.NODE_TEXT && (currentNode.$.nodeName.toLowerCase()== 'b' || currentNode.$.nodeName.toLowerCase()== 'i' ||
				currentNode.$.nodeName.toLowerCase()== 'u' || currentNode.$.nodeName.toLowerCase()== 'font' || currentNode.hasClass('Apple-style-span') )){
			modifyNode = true;
			nodeToReplace = currentNode;
			currentNode = currentNode.getParent();
		}
			
		if ( modifyNode ){
			bold = dojo.query('b', currentNode.$).length > 0 ? true : false;
			italics = dojo.query('i', currentNode.$).length > 0 ? true : false;
			underline = dojo.query('u', currentNode.$).length > 0 ? true : false;
			strike = dojo.query('strike', currentNode.$).length > 0 ? true : false;
			var fontTags = dojo.query('font', currentNode.$);
			if ( fontTags.length > 0){
				fontColor = dojo.attr( fontTags[0], 'color');
			}
			dojo.query('.Apple-style-span span', currentNode.$).forEach(function(node, index, array){
				var pxFontSize = CKEDITOR.env.ie ? node.style.getAttribute('font-size') : node.style.getPropertyValue('font-size');
				if ( pxFontSize && pxFontSize.indexOf("px")>=0){
					var ptFontSize = PresFontUtil.getCalcPtFromPx( parseFloat(pxFontSize));
					//override the px fontsize to em
					dojo.style( node, 'font-size', '1em');
					var fontSizes = PresFontUtil.getCalcEmFromPt(ptFontSize,[node]);
					fontSize = fontSizes[0];
				}
			});
			if ( TEXTMSG.getTextContent(nodeToReplace.$)){
				span = CKEDITOR.dom.element.createFromHtml( '<span>' + TEXTMSG.getTextContent(nodeToReplace.$) + '</span>', currentNode.getDocument() );
			} else {
				span = CKEDITOR.dom.element.createFromHtml( PresCKUtil.getDefaultSpanHtml(), currentNode.getDocument() );
			}
			if ( bold) dojo.style( span.$, 'font-weight', 'bold' );
			if ( italics) dojo.style( span.$, 'font-style', 'italic' );
			if ( underline) dojo.style( span.$, 'text-decoration', 'underline' );
			if ( strike) dojo.style( span.$, 'text-decoration', 'line-through' );
			if ( fontColor) dojo.style( span.$, 'color', fontColor );
			if ( fontSize) dojo.style( span.$, 'font-size', fontSize );
			span.replace( nodeToReplace);
			range.moveToElementEditEnd( span );
			range.select();
		}
		
		return range;
	},
	
	//
	// Utility function to return index of element in array
	//
	isInArray: function(arr,entry){
		for (var i=0; i<arr.length; i++){
			if (arr[i]===entry){
				return i;
			}
		}
		return -1;
	},
    
    /**
     * Util function: to convert a string style to a style object
     * @param style: style in string
     * e.g.  "position: absolute; top: -2.36651%; left: -1.66919%; height: 23.1596%; width: 58.4388%; z-index: 610;"
     * ==>   {position: "absolute", top: "-2.36651%", left: "-1.66919%", height: "23.1596%", width: "58.4388%", z-index: "610"}
     */
    getDrawFrameStyle: function(style){
    	var ret = {};
    	var list = style.split(";");
    	if(!list || (list.length == 0))
    		return null;
    	
    	dojo.forEach(list, function(item){
    		var subList = item.split(":");
    		if(subList.length == 2)
    			ret[dojo.trim(subList[0])] = dojo.trim(subList[1]);
    	});
    	
    	return ret;
    },
    
    /**
     * for each property from properties, replace that property in properties with the one in oldStyles.
     * @param newList : "position: absolute; top: -2.36651%; left: -1.66919%; height: 23.1596%; width: 58.4388%; z-index: 610;"
     * @param oldList : "top: -0.16083%; width: 58.438860%; height: 70%; left: -0.0172088%; position: absolute; z-index: 610;"
     * @param properties : ['width','height']
     * @return ret: updated newList as string: "position: absolute; top: -2.36651%; left: -1.66919%; height: 70%; width: 60%; z-index: 610;"
     * 
     */
    replaceStyle: function(stylesValue, oldStyles, properties){
    	var newList = PresCKUtil.getDrawFrameStyle(stylesValue);
		var oldList = PresCKUtil.getDrawFrameStyle(oldStyles);
		var ret = "";
		var flg = false;
		
		if(!newList || !oldList || !properties)
			return ret;
		
    	dojo.forEach(properties, function(property){
    		if(newList[property] && oldList[property]){
    			oldList[property] = newList[property];
    			flg = true;
    		}
    	});
    	
    	if(!flg)
    		return ret;
    	
    	for(var i in oldList){
    		if(oldList.hasOwnProperty(i))
    			ret = ret + i + ": " + oldList[i] + ";";
    	}
    	return ret;
    },
    
	normalizeMsgSeq: function(msgList,rMsgList,undoMsgId,mergeFlag){
		var editor = window['pe'].scene.getEditor();
		window.pe.scene.getEditor().recordUndo(msgList,rMsgList,mergeFlag);
	},
	normalizeMsgSeq1: function(msgList){
		var contentbox = window['pe'].scene.getContentBoxCurrentlyInEditMode();
		if(contentbox!=null && contentbox.isEditModeOn() && contentbox.mainNode){
			if(msgList instanceof Array){
				for (var i = 0; i < msgList.length; i++){
					var item = msgList[i];
					// 40798: [Co-editing]Can't get lock if enter into edit mode before other user  join in
					// Do not change slideSelected elemId as edit mode content box id 
					if (!item.elemId)
						item.elemId = contentbox.mainNode.id;
				}
			} else {
				// 40798: [Co-editing]Can't get lock if enter into edit mode before other user  join in
				if (!msgList.elemId)
					msgList.elemId = contentbox.mainNode.id;
			}
		}
		
		var editor = window['pe'].scene.getEditor();
		//T26975: check the send message status when user go into edit mode to avoid broken message be created.
		if(msgList && msgList.length == 1 && msgList[0].type == 'contentBoxEditMode' && msgList[0].editMode){
			var errorHandler = function(response, ioArgs)
			{
				console.log('something wrong happened during send contentBoxEditMode message');
				window.pe.scene.slideEditor.deSelectAll();
				concord.net.Beater._session.lockEditor(null);
			};
			console.log('contentBoxEditMode message send');
			window.pe.scene.session.sendMessage(msgList,errorHandler);
		}else{
			console.log('other message send');
			window.pe.scene.session.sendMessage(msgList);
		} 
	},
	runPending : function(editor, keep8203)
	{
		if(!editor){
			var contentBox = window.pe.scene.getContentBoxCurrentlyInEditMode();
			if(contentBox && contentBox.editor){
				editor = contentBox.editor;
			}
		}
		if(editor && editor.keyDownTimeout){
			window.pe.scene.undoBackup = null;
			clearTimeout(editor.keyDownTimeout);
			PresCKUtil.setPostSnapShot(editor);
			var contentBox = editor.contentBox;
			dfc = PresCKUtil.getDFCNode(editor);
			var preSnapShot = editor.preInput || PresCKUtil.cloneSnapShot(editor.preSnapShot);
			var postSnapShot = PresCKUtil.cloneSnapShot(editor.postSnapShot);
			contentBox.synchAllData(dfc,preSnapShot,postSnapShot,null,null,keep8203);
			editor.continueInput = false;
			editor.preInput = null;
			editor.prekeyMultiCellSelected = false;
			dojo.destroy(preSnapShot);
			dojo.destroy(postSnapShot);
			preSnapShot = null;
			postSnapShot = null;
			editor.keyDownTimeout = null;
		}
	},
	
	runKeyUpBackUp : function(editor,clean,mergeMsg)
	{
		if(window.pe.scene.undoBackup)
		{
			if(mergeMsg)
				PresCKUtil.normalizeMsgSeq(null,null,null,'beginMerge');
			var contentBox = editor.contentBox;
			dfc = PresCKUtil.getDFCNode(editor);
			var preSnapShot =editor.preInput || PresCKUtil.cloneSnapShot(editor.preSnapShot);
			var postSnapShot = PresCKUtil.cloneSnapShot(PresCKUtil.setPostSnapShot(editor));
			contentBox.synchAllData(dfc,preSnapShot,postSnapShot);
			contentBox.editorAdjust();
			editor.continueInput = false;
			editor.preInput = null;
			editor.prekeyMultiCellSelected = false;
			editor.keyDownTimeout = null;
		}
		if(clean)
			window.pe.scene.undoBackup = null;
			
	},
	/**
	 * Get font in px for slide editor/sort/show/print.
	 * Dynamic calculation now for fontSize based on height of canvas to the pageHeight. 
	 * (slideHeight * constant) / px per centimeter
	 * The current calculation takes the height passed in times a constant divided 
	 * by px/cm of the slide.  The PPI is currently set to 96 and 2.54 is the inch
	 * to cm conversion.
	 * The current PPI of 96 assumes a 1920x1080 resolution on a 23" screen or
	 * similar type dimensions.
	 * 
	 * @param slideHeight
	 * @param pageHeight
	 * @returns {Number}
	 */
    getBasedFontSize: function(slideHeight,pageHeight){
    	var fzBase = pe.scene.doc.fontSize || 18;
    	var fzBasePX = fzBase * PresConstants.PPICONSTATNT / 72;

        var fontSize = (slideHeight * fzBasePX)/
    	((pageHeight*PresConstants.PPICONSTATNT)/PresConstants.INTOCMCONVERTOR);
//      14853: [Textbox][Firefox]Font size not reflected or wrong when entering text in textbox
        fontSize = dojo.number.round(fontSize,2);
        if(dojo.isIE)
        {
            // IE and Chrome appear to use integers for font-size
            // in the inline style whereas FF and Safari use decimals
            // For now adjust to the nearest integer value
            fontSize = Math.floor(fontSize + .5);
        }
        return fontSize;        
    },
    isEditModeOn: function(){
    	var editModeOn = false; 
    	if(window.pe.scene.slideEditor && window.pe.scene.slideEditor.CONTENT_BOX_ARRAY)
	    	for (var i=0; i<window.pe.scene.slideEditor.CONTENT_BOX_ARRAY.length; i++){            
				if (window.pe.scene.slideEditor.CONTENT_BOX_ARRAY[i].editor){
					var cb = window.pe.scene.slideEditor.CONTENT_BOX_ARRAY[i];
					if(cb.isEditModeOn())
						editModeOn = true;
				}
			}
    	return editModeOn;
    },
    
    setEditFlagInProcMsg : function(msg, doc, scope){
    	if(scope != 'sorter')
			return;
		if(msg.asCtrl || msg.isCtrl)
			return;
		var acts2 = msg.as || msg.updates;
		if(!acts2)
			return;
		//filter out comments message
		if(msg.type == "addNewComment" || msg.type == "comments")
			return;
		var msgPairList2 =[];
		for( var i=0; i < acts2.length; i++ ){
			var act2 = acts2[i];
			//msg from remote
			if(act2.remoteFlag){
				return;
			}
			//msg from local			
			var mType = msg.type;
			var style = act2.s;
			// filter out msg for update z-index, not filter out msg for Bring to Font/Send to Back and move contentbox
			if(mType == "a" && !act2.addToUndoFlag && style && style.hasOwnProperty("z-index") && !(act2.flag=="ResizingEnd")){
				continue;	
			}
			//filter out set attribute message which attribute is null obj, and comments msg
			var attr = act2.a;
			if(mType == "a" && attr && ((Object.keys(attr).length == 0 && !style)|| attr.hasOwnProperty("commentsId") || attr.hasOwnProperty("comments"))){
				continue;
			}		
			
			//msg is from a node, act.p_isnad==true and p_nid is the node
			var isEdited = null;
			var drawFrame = null;
			var ele = null;
			if(act2.p_isnad){
				if(act2.p_nid){
					ele = doc.getElementById(act2.p_nid);
					if(ele)
						drawFrame = this._getParentDrawFrame(ele, doc);
				}
			}else{ //when act.p_isnad==false, tid is the node
				if(act2.tid){
					ele = doc.getElementById(act2.tid);
					if(ele)
						drawFrame = this._getParentDrawFrame(ele, doc);
				}
			}
			if(drawFrame){
				var slide = drawFrame.parentNode;
				//add the flag on the slide draw page
				if(dojo.hasClass(slide,'draw_page')){
					isEdited = slide.getAttribute(this.editFlag);
					if(isEdited != "true"){
						slide.setAttribute(this.editFlag,"true");
						msgPairList2 = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slide), this.editFlag, 'true', msgPairList2, 'false');
					}
					isEdited = drawFrame.getAttribute(this.editFlag);
					if(!isEdited){
						drawFrame.setAttribute(this.editFlag,"true");
						msgPairList2 = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(drawFrame), this.editFlag, 'true', msgPairList2, 'false');
					}
				}			
			}
		}
		if(msgPairList2.length>0){
			var msgList2 = [];
			for (var i=0; i<msgPairList2.length; i++)
			{	
				var msg = msgPairList2[i].msg;
				msgList2.push(msg);
			}
			window.pe.scene.session.sendMessage(msgList2);
		}
	},
	
	_getParentDrawFrame : function(aNode, doc){
		var node = aNode;
		while(node)
		{
			if(dojo.hasClass(node,'draw_frame'))
				break;
			else if (node.tagName!=null && node.tagName.toLowerCase()=='body'){
                node=null;
                break;
            }
			node = node.parentNode;
		}
		return node;
	},
	
	isFillPermittedType : function(drawType) {
		if (!drawType) return false;
		// The number in type name means the turn number
		return !(this.connectorShapeTypes[drawType] == 1);
	},

	isConnectorShape: function(mainNode) {
		if (!mainNode) return false;
		// Use presentation_class to differentiate grouped svg shape
		// and new connect shape
		return dojo.attr( mainNode, 'presentation_class' ) == 'shape_svg' &&
			PresCKUtil.connectorShapeTypes[dojo.attr(mainNode, 'draw_type')] == 1;
	},
	
	// If a shape is set as no line, in MSO, it will be looked like the line is
	// really removed. Especially when the line width is large. When hover, you
	// will found large border width area will not be hovered. But actually all
	// changed border styles will be saved into XML file. When a color is set,
	// all styles can be showed.
	// To display as MSO, all border styles are removed(including arrow).
	// So when setting a border color, all those cannot be seen. It is unreasonable.
	// So here exclude shape with no line to set border color
	// BTW, Docs can set color as "transparent" which is different from "none"
	isPPTXShape: function(mainNode) {
		if (!mainNode) return false;
		if (!dojo.hasClass( mainNode, 'shape_svg' )) return false;
		
		var noline = false;
		// Check whether it is no line
		var nodeLineGrp = dojo.query('g[groupfor="line"]', mainNode);
		if (nodeLineGrp.length > 0){
			nodeLineGrp = nodeLineGrp[0];
			var lines = nodeLineGrp.childNodes;
			if (lines.length > 0) {
				var line = lines[0];
				noline = (dojo.attr(line, 'stroke') == 'none');
			}
		}
		return !noline;
	},
	
	/**
	 * Check to change arrow stroke or fill
	 * @param node
	 * @returns true fill false stroke
	 */
	checkArrowColorChange: function(node) {
		if (!node) return null;
		// Per conversion logic
		// TRIANGLE, DIAMONG and STEALTH will be set as "stroke:none;fill:realColor;stroke-linejoin:miter"
		// OVAL will be set as "stroke:none;fill:realColor;" without stroke-linejoin and stroke-linecap
		// ARROW will be set as "stroke:realColor;fill:none;stroke-linecap:round"
		// So per above, change arrow stroke or fill when change border color
		var join = dojo.attr(node, 'stroke-linejoin');
		var cap = dojo.attr(node, 'stroke-linecap');
		if (join || (!join && !cap))
			return true;  // change fill
		else if (cap)
			return false;  // change stroke
		else
			return null;
	},
    //if the message is sent from create slide/create contentbox/change slide layout/set slide transition
    //this method is called by sendMessage
	setEditFlagInSendMsg : function(msgList, doc, data){

		if(!data)
			return;
		if(data.syncSorter || data.syncCanvus)
			return;
		var isEdited = null;
		for (var im=0; im<msgList.length; im++) {
			var msg = msgList[im];
			if(msg.asCtrl || msg.isCtrl)
				continue;
			var acts = msg.as || msg.updates;
			if(!acts)
				continue;
			var msgPairList1 =[];
			for( var ia=0; ia < acts.length; ia++ ){
				var act = acts[ia];
				//when background image is set by CSS, a msg will be sent, do not handle this message
				//see slidesorter.js  msgPairList = this.checkNcreateBackgroundImageDivFromCss(slideElement, null, msgPairList);
				if(msg.type=="e" && act.t=="ie" && act.s && (act.s.indexOf("backgroundImage") > -1))
					continue;
				//create slide
				if(msg.type=="e" && act.t=="ie" && act.p_isnasw==true){
					var slideWrapper = doc.getElementById(act.p_nid);
					if(slideWrapper){
						var slide = slideWrapper.childNodes[0];
						isEdited = slide ? slide.getAttribute(this.editFlag) : null; 
						if(isEdited != "true"){
							slide.setAttribute(this.editFlag,"true");
							msgPairList1 = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slide), this.editFlag, 'true', msgPairList1, 'false');
						}
						var drawframeList = slide.childNodes;
						for(var dfIndex = 0; dfIndex < drawframeList.length; dfIndex++){
							var dfNode = drawframeList[dfIndex];
							if(dfNode && !dfNode.getAttribute(this.editFlag)){
								dfNode.setAttribute(this.editFlag,"true");
								msgPairList1 = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(dfNode), this.editFlag, 'true', msgPairList1, 'false');
							}
						}
						
					}					
				}
				//create contentbox, move/delete table column/lines, change table style
				else if((msg.type=="e" || msg.type=="rn") && act.t=="ie" && act.p_isnad==true){
					var slide = doc.getElementById(act.tid);
					isEdited = slide ? slide.getAttribute(this.editFlag):null;
					if(isEdited != "true"){
						slide.setAttribute(this.editFlag,"true");
						msgPairList1 = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slide), this.editFlag, 'true', msgPairList1, 'false');
					}	
					var dfNode = doc.getElementById(act.p_nid);
					if(dfNode && !dfNode.getAttribute(this.editFlag)){
						dfNode.setAttribute(this.editFlag,"true");
						msgPairList1 = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(dfNode), this.editFlag, 'true', msgPairList1, 'false');
					}
				}
				//delete contentbox
				else if((msg.type=="e" || msg.type=="rn") && act.t=="de" && act.p_isnad==true){
					var slide = doc.getElementById(act.tid);
					isEdited = slide ? slide.getAttribute(this.editFlag):null;
					if(isEdited != "true"){
						slide.setAttribute(this.editFlag,"true");
						msgPairList1 = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slide), this.editFlag, 'true', msgPairList1, 'false');
					}
				}				
				//change slide layout, set slide transition
				else if(msg.type=="a" && act.t=="sbt" && act.a && (act.a.hasOwnProperty("presentation_presentation-page-layout-name") || act.a.hasOwnProperty("smil_type"))){
					var slide = doc.getElementById(act.tid);
					isEdited = slide ? slide.getAttribute(this.editFlag):null;
					if(isEdited != "true"){
						slide.setAttribute(this.editFlag,"true");
						msgPairList1 = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slide), this.editFlag, 'true', msgPairList1, 'false');
					}
				}
				//handle spellcheck message
				else if(msg.type == "t" && act.t == "it"){
					if(act.tid){
						var dfNode = doc.getElementById(act.tid);
						dfNode = dfNode ? this._getParentDrawFrame(dfNode, doc) : null;
						if(dfNode){
							var slide = dfNode.parentNode;
							//add the flag on the slide draw page
							if(dojo.hasClass(slide,'draw_page')){
								isEdited = slide ? slide.getAttribute(this.editFlag):null;
								if(isEdited != "true"){
									slide.setAttribute(this.editFlag,"true");
									msgPairList1 = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slide), this.editFlag, 'true', msgPairList1, 'false');
								}
								if(!dfNode.getAttribute(this.editFlag)){
									dfNode.setAttribute(this.editFlag,"true");
									msgPairList1 = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(dfNode), this.editFlag, 'true', msgPairList1, 'false');
								}
							}
						}						
					}
				}
			}
			if(msgPairList1.length>0){
				var msgList1 = [];
				for (var i=0; i<msgPairList1.length; i++)
				{	
					var msg = msgPairList1[i].msg;
					msgList1.push(msg);
				}
				pe.scene.session.sendMessage(msgList1);
			}
		}
	}
	
});

(function(){
        PresCKUtil = new concord.pres.PresCKUtil();   
})();
