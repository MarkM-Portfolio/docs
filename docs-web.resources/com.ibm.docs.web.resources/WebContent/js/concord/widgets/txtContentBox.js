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

/*
 * @txtContentBox.js CAEditor component
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

dojo.provide("concord.widgets.txtContentBox");
dojo.require("concord.util.browser");
dojo.require("concord.widgets.mContentBox");

dojo.declare("concord.widgets.txtContentBox", [concord.util.browser.isMobile() ? concord.widgets.mContentBox : concord.widgets.contentBox], {
	
	constructor: function(opts) {
		//console.log("txtContentBox:constructor","Entry");	
		this.DEFAULT_TEXT_CONTENT     = this.STRINGS.defaultText_newBox;
		this.DEFAULT_OUTLINE_CONTENT  = this.STRINGS.defaultText_placeHolder_AddOutline;
		this.DEFAULT_TITLE_CONTENT    = this.STRINGS.defaultText_placeHolder_AddTitle;
		this.DEFAULT_SUBTITLE_CONTENT = this.STRINGS.defaultText_placeHolder_AddSubtitle;
		this.init();		
		//console.log("txtContentBox:constructor","Exit");	
	},

	contentType			: null,
	attachedStyleStateChange	: false,
	defaultPosition			:{'left':10,'top':10,'width':345,'height':55}, //in px
	DEFAULT_TEXT_CONTENT		: '',
	DEFAULT_OUTLINE_CONTENT		: '',
	DEFAULT_TITLE_CONTENT		: '',
	DEFAULT_SUBTITLE_CONTENT 	: '',
	
	init: function(){
		//console.log("txtContentBox:init","Entry");		
		this.inherited(arguments);
		this.contentBoxType = PresConstants.CONTENTBOX_TEXT_TYPE;
		//this.setBorderSpacing(); //this was for 9651, but need to be moved to slideEditor.css with class .slideEditor due to defect11327
	},
	/*
	 * The settings of borderSpacing back to 0px is moved to slideEditor.css with class .slideEditor due to defect11327
	//sets border spacing on the display: table node
	setBorderSpacing: function() {
		dojo.style(this.contentBoxDataNode.children[0],"borderSpacing","0px");
	},
	*/

	// Sets the data of the contentBox. This needs to be implemented by the subclass
	setContentData: function(){
		//console.log("txtContentBox:setContentData","Entry");			
		var dataNode = this.contentBoxDataNode = document.createElement('div');
		this.mainNode.appendChild(dataNode);

		if (this.createFromLayout){
			this.isEmptyCBPlaceholder=true;
			dojo.addClass(this.mainNode,'layoutClass');
			dojo.addClass(this.contentBoxDataNode,'layoutClassSS');
			dojo.attr(this.mainNode,'emptyCB_placeholder','true');
			dojo.attr(this.mainNode,'draw_layer','layout');
			//If from layout what family are we dealing with?					
			var family = this.layoutInfo.layoutFamily;
				if (family=='outline'){
					this.buildTextNodeContent(this.DEFAULT_OUTLINE_CONTENT,'defaultContentText '+PresConstants.CONTENT_BOX_OUTLINE_CLASS,family);
					this.updatedClassesForODP(family,this.layoutInfo.layoutName);					
				} else if (family == 'title'){					
					this.buildTextNodeContent(this.DEFAULT_TITLE_CONTENT,'defaultContentText '+PresConstants.CONTENT_BOX_TITLE_CLASS,family);
					this.updatedClassesForODP(family,this.layoutInfo.layoutName);
					
				} else if (family == 'subtitle'){
					if(this.layoutInfo.layoutName == "ALT32"){
						this.buildTextNodeContent(this.DEFAULT_TEXT_CONTENT,'defaultContentText '+PresConstants.CONTENT_BOX_SUBTITLE_CLASS,family);
					}else {
						this.buildTextNodeContent(this.DEFAULT_SUBTITLE_CONTENT,'defaultContentText '+PresConstants.CONTENT_BOX_SUBTITLE_CLASS,family);
					}
					this.updatedClassesForODP(family,this.layoutInfo.layoutName);
				} 
				else {
					
				}				
		} else if (this.newBox){ //new box is now being created from slide editor. This path may no longer be needed
			this.buildTextNodeContent(this.DEFAULT_TEXT_CONTENT,'defaultContentText text');
			this.updatedClassesForODP(null);		
		}
		
		this.setNodeId(this.contentBoxDataNode,PresConstants.CONTENTBOX_DATA_PREFIX);		
		//console.log("txtContentBox:setContentData","Exit");			
		dataNode = null;
	},
	//
	// Enable menu items for this content box when editing (to be implemented by subclasses types)
	//
	enableMenuItemsOnEdit: function(){
		//console.log("IN enableMenuItemsOnEdit function");
		//var isSpare = dojo.attr(this.mainNode,'isspare');
		//console.log("IN enableMenuItemsOnEdit function.... does mainNOde have class isSpare? "+dojo.hasClass(this.mainNode,'isSpare'));
		//if (isSpare==null || (isSpare!=null && isSpare.length<=0)){ //enable menu if not a spare
		if (!dojo.hasClass(this.mainNode,'isSpare')){ //enable menu if not a spare
			var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_disableWebClipboardMenuItem}];
	 		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);			 		
			concord.util.presToolbarMgr.toggleFontEditButtons('on');
		}
		
		//D15840 disable bring to front and send to back in edit mode
		var eventDisableBringToFrontMenu = [{'eventName': concord.util.events.slideEditorEvents_eventName_disableBringToFrontMenuItems}];
 		concord.util.events.publish(concord.util.events.slideEditorEvents, eventDisableBringToFrontMenu);
		var eventDisableSendToBackMenu = [{'eventName': concord.util.events.slideEditorEvents_eventName_disableSendToBackMenuItems}];
 		concord.util.events.publish(concord.util.events.slideEditorEvents, eventDisableSendToBackMenu);
		
		var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableTextStyleMenuItems}];
 		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);	
		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableTextPropertyMenuItems}];
	 	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
	 	eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableIncreaseIndentMenuItems}];
	 	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
	 	eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableDecreaseIndentMenuItems}];
	 	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableTextFontPropertyMenuItems}];
	 	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);

 		concord.util.presToolbarMgr.toggleInsertMoveRowButton('off');
 		concord.util.presToolbarMgr.toggleInsertMoveColButton('off');
		concord.util.presToolbarMgr.togglePrevNextSlideButton();

 		//disable background fill on odp imported shape
		var parentNode = this.mainNode.parentNode.parentNode;
		if (dojo.attr(parentNode, "contentboxtype") == 'drawing' &&
			!(dojo.hasClass(parentNode, 'shape_svg') &&
			PresCKUtil.isFillPermittedType(dojo.attr(parentNode, 'draw_type')))) {
			concord.util.presToolbarMgr.toggleBGFillColorButton('off');
		}
		
		if (!PresCKUtil.isPPTXShape(parentNode))
			concord.util.presToolbarMgr.toggleBorderColorButton('off');
		
 		if (!this.attachedStyleStateChange) {
 			// watch for changes to superscript style
 	        this.editor.attachStyleStateChange(new CKEDITOR.style(CKEDITOR.config.coreStyles_superscript_base), function(state){
 	        	var eventData = null;
 	        	if (state == CKEDITOR.TRISTATE_ON)
 	        		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_superscriptCheckedMenuOn}];
 	        	else
 	        		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_superscriptCheckedMenuOff}];
 	        	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
 	        });
 	        
 	        // watch for changes to subscript style
 	        this.editor.attachStyleStateChange(new CKEDITOR.style(CKEDITOR.config.coreStyles_subscript_base), function(state){
 	        	var eventData = null;
 	        	if (state == CKEDITOR.TRISTATE_ON)
 	        		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_subscriptCheckedMenuOn}];
 	        	else
 	        		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_subscriptCheckedMenuOff}];
 	        	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
 	        });
 	        
 	        // watch for changes to strikethrough style
 	        this.editor.attachStyleStateChange(new CKEDITOR.style(CKEDITOR.config.coreStyles_strike), function(state){
 	        	var eventData = null;
 	        	if (state == CKEDITOR.TRISTATE_ON)
 	        		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_strikethroughCheckedMenuOn}];
 	        	else
 	        		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_strikethroughCheckedMenuOff}];
 	        	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
 	        });
 	        
 	        // watch for changes to bold style
 	        this.editor.attachStyleStateChange(new CKEDITOR.style(CKEDITOR.config.coreStyles_bold), function(state){
 	        	var eventData = null;
 	        	if (state == CKEDITOR.TRISTATE_ON)
 	        		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_boldCheckedMenuOn}];
 	        	else
 	        		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_boldCheckedMenuOff}];
 	        	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
 	        });

 	        // watch for changes to italic style
 	        this.editor.attachStyleStateChange(new CKEDITOR.style(CKEDITOR.config.coreStyles_italic), function(state){
 	        	var eventData = null;
 	        	if (state == CKEDITOR.TRISTATE_ON)
 	        		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_italicCheckedMenuOn}];
 	        	else
 	        		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_italicCheckedMenuOff}];
 	        	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
 	        });
 	        
 	        // watch for changes to underline style
 	        this.editor.attachStyleStateChange(new CKEDITOR.style(CKEDITOR.config.coreStyles_underline), function(state){
 	        	var eventData = null;
 	        	if (state == CKEDITOR.TRISTATE_ON)
 	        		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_underlineCheckedMenuOn}];
 	        	else
 	        		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_underlineCheckedMenuOff}];
 	        	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
 	        });

 	        this.attachedStyleStateChange = true;
 		}
	},
	
	//
	// Disable menu items for this content box when editing (to be implemented by subclasses types)
	//
	disableMenuItemsOnNonEdit: function(){
		//var isSpare = dojo.attr(this.mainNode,'isspare');
		if(!dojo.hasClass(this.mainNode,'isSpare')){ //disable menu if not a spare
			var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableWebClipboardMenuItem}];
		 	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);

		 	eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableCopyCutMenuItems}];
		 	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
		 	
			var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_disableTextPropertyMenuItems}];
		 	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);

			var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_disableIncreaseIndentMenuItems}];
		 	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
		 	
		 	var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_disableDecreaseIndentMenuItems}];
		 	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
		 	
		 	var eventData2 = [{'eventName': concord.util.events.crossComponentEvents_eventName_disableTextStyleMenuItems}];
	 		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData2);
			
	 		concord.util.presToolbarMgr.toggleFontEditButtons('off',this.editor);
		}
		
		//D15840 enable bring to front and send to back in select mode
		//D17817 make sure the widget exists
		if (dijit.byId('P_i_BringToFront')) {
			var eventEnableBringToFrontMenu = [{'eventName': concord.util.events.slideEditorEvents_eventName_enableBringToFrontMenuItems}];
			concord.util.events.publish(concord.util.events.slideEditorEvents, eventEnableBringToFrontMenu);
		}
		//D17817 make sure the widget exists
		if (dijit.byId('P_i_SendToBack')) {
			var eventEnableSendToBackMenu = [{'eventName': concord.util.events.slideEditorEvents_eventName_enableSendToBackMenuItems}];
			concord.util.events.publish(concord.util.events.slideEditorEvents, eventEnableSendToBackMenu);
		}
	},
	
	
	//
	// Enable menu items for this content box when selected 
	//
	enableMenuItemsOnSelect: function(){
		var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableTextSelectionMenuItems}];
 		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
 		concord.util.presToolbarMgr.toggleVerticalAlignButton('on');
 		this.inherited(arguments);
	},
	
	//
	// Disable menu items for this content box when not selected
	//
	disableMenuItemsOnDeSelect: function(){
		//console.log('about to send table selection enabled');
		var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_disableTextSelectionMenuItems}];
 		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
 		this.inherited(arguments);
	},
	
	//
	// Builds the nodes under the data content node for text box
	//
	buildTextNodeContent: function(defaultTextContent, classToAdd,family, contentArray,dfcExists){
		if(contentArray==null || contentArray.length==0){
			contentArray = [];
			contentArray.push(defaultTextContent);
		}

		_fixLastBr = function(line)
		{
			line = PresCKUtil.ChangeToCKNode(line);
			if(PresCKUtil.checkNodeName(line.getLast(),'br'))
					return;
			var br = new CKEDITOR.dom.element('br');
			br.addClass('hideInIE');
			line.append(br);
		};
		
		// this node is to keep old p which is to be destroyed
		// since the old p may have style which is useful for new p
		var nodeToDestroy = document.createElement('div');
		for (var i = 0, len = this.contentBoxDataNode.firstChild.firstChild.childElementCount;
			i < len; i++) {
			nodeToDestroy.appendChild(this.contentBoxDataNode.firstChild.firstChild.children[i]);
		}

		var drawFrameClassDiv =null;
		var displayTableDiv =null;
		if (!dfcExists){//D2845
			displayTableDiv = this.displayTableDiv = document.createElement('div');
			this.contentBoxDataNode.appendChild(displayTableDiv);
			dojo.style(displayTableDiv,{
				'display':'table',
				'height':'100%',
				'width':'100%',
				'table-layout':'fixed'
			});
			dijit.setWaiRole(displayTableDiv,'presentation');

			drawFrameClassDiv = this.drawFrameClassDiv = document.createElement('div');
			displayTableDiv.appendChild(drawFrameClassDiv);
			dojo.addClass(drawFrameClassDiv,'draw_frame_classes');
			dojo.style(drawFrameClassDiv,{
				'display':'table-cell',
				'height':'100%',
				'width':'100%'
			});
			dijit.setWaiRole(drawFrameClassDiv,'presentation');
		}else{
			displayTableDiv = this.contentBoxDataNode.firstChild;
			drawFrameClassDiv = displayTableDiv.firstChild;				
		}

		//Reset the level & master class
		//we should find proper master class for this node
		var masterClass = PresCKUtil.getMasterClass(drawFrameClassDiv.firstChild?drawFrameClassDiv.firstChild:drawFrameClassDiv,1);

		if (family=='outline') {
    		var ul = document.createElement('ul');
    		var liCName = null;

    		for(var k=0; k<contentArray.length; k++){
    			var li = document.createElement('li');
    			dojo.addClass(li, 'text_list-item'); // for conversion
    		    var ln = MSGUTIL.getPureText( CKEDITOR.dom.element.createFromHtml( contentArray[k] ) );
    		    ln = ln.replace(/\s/g, '');
    		    // if using custom list class and there's non-empty data
    		    if ( liCName && ln != '' )
    				dojo.addClass( li, liCName );
    		    // if using custom list class and there's empty data
    		    else if (liCName && ln == '' )
    		        dojo.style( li, 'display', 'block' );
    			
    			ul.appendChild(li);
    			if(contentArray[k] ==defaultTextContent ){ //if default text content, create span
    				var span = document.createElement('span');
    				span.appendChild(document.createTextNode(contentArray[k]));
    				dojo.addClass(li,classToAdd);
    				li.appendChild(span);
    			}else{ //else has no span, content directly under li
    				li.innerHTML = contentArray[k];
    			}
    			dojo.attr(li,'p_text_style-name','');
    			dojo.attr(li,'text_p','true');
    			_fixLastBr(li);
    		}
    		
    		dojo.addClass(ul,'text_list');
    		
    		if (liCName)
    		    dojo.addClass( ul, liCName );
    		drawFrameClassDiv.appendChild(ul);
    		
			if(masterClass)
			{
				var ckUL = PresCKUtil.ChangeToCKNode(ul);
				for(var i=0;i<ckUL.getChildCount();i++)
				{
					PresCKUtil.setMasterClass(ckUL.getChild(i),masterClass);
				}
			}   		
		    
		} else{
			for(var k=0; k<contentArray.length; k++){
				var p = document.createElement('p');
				drawFrameClassDiv.appendChild(p);
				dojo.addClass(p,classToAdd);
				// TODO: only handle textAlign from old p to new p
				// TODO: dojo.style() fails to query on IE10
				var attrValue = 
					nodeToDestroy.children[k] && nodeToDestroy.children[k].style.textAlign;
				attrValue && attrValue.length > 0 && dojo.style(p, 'textAlign', attrValue);

				if(contentArray[k] ==defaultTextContent ){ //if default text content, create span
					var span = document.createElement('span');
					var txtNode = document.createTextNode(contentArray[k]);
					span.appendChild(txtNode);
					p.appendChild(span);
					span = null;
					txtNode = null;
				}else{ //else has no span, content directly under li
					p.innerHTML = contentArray[k];
				}
				
				_fixLastBr(p);
				if(masterClass)
				{
					var newP = PresCKUtil.setMasterClass(p,masterClass,true);
					if(newP)
						p = newP.$;
				}
				p = null;
			}
		}
		displayTableDiv = null;
		drawFrameClassDiv = null;

		PresCKUtil.removeAllChildren(nodeToDestroy); // node should be dfc
    },

	selectionAdjust:function(e){
		if(e&&(!CKEDITOR.env.ie)){
			if(e.data.getKey()==65){
			  this.selectionAdjustToPartNode(e);
			}
		}
	},
	
	selectionAdjustToPartNode:function(e){
		var selection =this.editor.getSelection();
        var range=selection.getRanges()[0];
        var nativeSelection=selection.getNative();
        //D16692 - prevent dbl click from highlighting an empty target. This causes stray text when user overwrites.
		if (e && e.data){ //Prevent going into edit mode when selecting a contentBox with ctrl key			
			var target = e.data.getTarget();
			if (target && !PresCKUtil.doesNodeContainText(target.$)){
				var cursorPos = CKEDITOR.POSITION_BEFORE_END;	           
	            range.setStartAt( target, cursorPos );
	            range.setEndAt( target, cursorPos );                 
	            range.collapse(true);
	            selection.selectRanges( [ range ] );
	            PresCKUtil.adjustToolBar(["BOLD","FONTSIZE", "FONTNAME", "ITALIC", "UNDERLINE", "LINETHROUGH"]);
	            return;
			} else if (target && target.$.nodeName.toLowerCase()=='p'){//D17213 - user has dbl clicked on the p level (for right or far left of text)
				nativeSelection.selectAllChildren(target.$);
				return;
			}	
			
		}

		
		var body= this.editor.document.getBody().$;
        var drawFrameClassNode = dojo.query(".draw_frame_classes",body)[0];		
		var startContainer = range.startContainer;
		var startOffset =range.startOffset;
		if(nativeSelection.containsNode(drawFrameClassNode,false)){
			 var contentNode=drawFrameClassNode.firstChild;
    	     var node=contentNode.firstChild;
    	     if(node.nodeName.toLowerCase()=='li')
	           node=node.firstChild;//span in li
	         var rangeN=nativeSelection.getRangeAt(0);
	         rangeN.setStart(node,0);	        
	         if(range.endContainer.$ != body)
			    rangeN.setEnd(body,1);
		}else if(startContainer){
			if(startContainer.$.tagName == 'UL' || startContainer.$.tagName == 'OL' || startContainer.$.tagName == 'DIV'){
					 nativeSelection.selectAllChildren(startContainer.$.childNodes[startOffset]);
					 var node = startContainer.$.childNodes[startOffset]; //p or li
					 node=node.firstChild; //span
					 var rangeN=nativeSelection.getRangeAt(0);
	                 rangeN.setStart(node,0);
				}
		}
	},
	
	SuperscriptText: function() {
		if(this.editModeOn) {
			this.editor.execCommand('superscript');
		}
	},
	
	SubscriptText: function() {
		if(this.editModeOn) {
			this.editor.execCommand('subscript');
		}
	},
	
	strikethroughText: function() {
		if(this.editModeOn) {
			this.editor.execCommand('strike');
		}
	},
	
	boldText: function() {
		if(this.editModeOn) {
			this.editor.execCommand('bold');
		}
	},
	
	italicText: function() {
		if(this.editModeOn) {
			this.editor.execCommand('italic');
		}
	},

	underlineText: function() {
		if(this.editModeOn) {
			this.editor.execCommand('underline');
		}
	},
		
	dbClickSelectAdjust:function(e){
		if(e&&(!CKEDITOR.env.ie)){
          this.selectionAdjustToPartNode(e);
		}
	},
	//defect 35505
	cursorPositionAdjust:function(e){
		if(e&&(!CKEDITOR.env.ie)){
			if(e.data.getKey()==8||e.data.getKey()==46){
			   var selection =this.editor.getSelection();
			   var range=selection.getRanges()[0];
			   if(range.collapsed){
			   	 if(range.startContainer.$.tagName=='LI'){
				   	 if(range.endOffset==range.startContainer.getChildCount()){
				   	 	var brNode=range.startContainer.getLast()
				   	 	if(brNode){
					   	 	if(brNode.$.tagName=='BR'){
					   	 		while(brNode.getPrevious().$.tagName=='BR')
					   	 		   brNode=brNode.getPrevious();
					   	 		var txtNode=brNode.getPrevious();
					   	 		range.setStartAt(txtNode,CKEDITOR.POSITION_BEFORE_END);
					   	 		range.setEndAt(txtNode,CKEDITOR.POSITION_BEFORE_END);
					   	 		range.collapse(true);
		                        selection.selectRanges( [ range ] );
					   	 	}
				   	     }
				   	 }
			   	 }
			   }
			}
		}
	},
	
	// deprecated, since no one uses it
	removeAddrBR:function(e){
	}
	
});
