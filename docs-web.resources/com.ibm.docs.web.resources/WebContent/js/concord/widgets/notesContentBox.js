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
 * @notesContentBox.js CAEditor component
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

dojo.provide("concord.widgets.notesContentBox");
dojo.require("concord.util.browser");
dojo.require("concord.util.BidiUtils");
dojo.require("concord.widgets.mContentBox");

dojo.declare("concord.widgets.notesContentBox", [concord.util.browser.isMobile() ? concord.widgets.mContentBox : concord.widgets.contentBox], {

  constructor: function(opts) {
    //console.log("notesContentBox:constructor","Entry");
    this.DEFAULT_NOTES_CONTENT        = this.STRINGS.defaultText_speakerNotesBox;
    this.init();
    //console.log("notesContentBox:constructor","Exit");
  },

  contentType                     : null,
  attachedStyleStateChange        : false,
  defaultPosition                 :{'left':10,'top':10,'width':345,'height':55}, //in px
  DEFAULT_NOTES_CONTENT           : '',
  HANDLE_IMAGE_SRC                : window.contextPath + window.staticRootPath + "/styles/css/images/speakerNotesBorder.gif",

  init: function(){
    //console.log("notesContentBox:init","Entry");
    this.inherited(arguments);
    this.contentBoxType = PresConstants.CONTENTBOX_NOTES_TYPE;
    //console.log("notesContentBox:init","Exit");
  },

  checkForDuplicateDFC: function() {
    dojo.query(".draw_frame_classes",this.contentBoxDataNode).forEach(function(node, index, arr){
      if (index > 0) {
        //console.log('duplicate dfc detected');
        dojo.destroy(node);
      }
    });
  },

  adjustSpeakerNotesBackGround: function() {
    var lockedIcon = dojo.query(".lockedIcon",this.mainNode)[0];
    if (lockedIcon) {
      dojo.query("*", this.contentBoxDataNode).forEach(function(node, index, arr){
        if (node.style.backgroundColor != "") {
          dojo.style(node, "backgroundColor", "#EEEEEE");
        }
      });
    } else {
      dojo.query("*", this.contentBoxDataNode).forEach(function(node, index, arr){
        if (node.style.backgroundColor != "") {
          dojo.style(node, "backgroundColor", "#FFFFFF");
        }
      });
    }
  },

  //
  // Handles when user clicks on a speaker notes box
  //
  handleSpeakerNotesOnClick: function(e){
    //console.info('handleSpeakerNotesOnClick');
    //19771 cancel createPackageOnClick if it is set
    if (window.pe.scene.slideEditor.createPackageOnClick) {
      var cancelCreation = true; //Handles cancelling when user has cross hair but has not yet dragged
      window.pe.scene.slideEditor.cancelAddTextBox(true);
    }
    var lockedIcon = dojo.query(".lockedIcon",this.mainNode)[0];
    if (lockedIcon) {
      return;
    }

    if (e == null) { e = window.event;}
    var sender = (typeof( window.event ) != "undefined" ) ? e.srcElement : e.target;
    //only go into edit mode if the user clicked in the box not on the handle
    if (dojo.hasClass(sender, "handle")) {
      return;
    }

    this.selectThisBox(e);
    if (!this.editor){
      this.makeEditable();

      if ((dojo.isWebKit || dojo.isIE) && this.TM_move == undefined) {
        window.pe.scene.slideEditor.setUIDimensions(null, this);
      }
    } else{
      if (!this.editModeOn) {
    	  
        this.toggleEditMode();
        this.handleCursorOnEdit();
        PresCKUtil.setPreSnapShot(this.editor);
      }
    }

    // show veritical scrollbar when switch to edit mode
    this.mainNode.style.overflowY = "auto";

    if (BidiUtils.isGuiRtl())
    	dojo.attr(sender.parentNode, "dir", "ltr");
    //D15862 do not follow links
    if(sender.tagName.toLowerCase() == "a"){
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  },

  // sets the size of the image since 100% in IE does not yield the correct needed size as other browsers.
  // todo(bjcheny): refer to adjustContentDataSize from contentBox
  adjustContentDataSize: function(){
  },

  updateCKBodyHeight: function(){
    this.fixSpeakerNotesEditWindow();
  },

  // Adjust style of editor
  fixSpeakerNotesEditWindow: function(){
    if (!this.editModeOn){
      return;
    }
    if (this.editor.document == undefined) {
      return;
    }
    var body = this.editor.document.$.body;
    var editTD = dojo.query("#cke_contents_"+this.editor.name+"",this.mainNode)[0];
    var ckIframeNode = dojo.query("iframe",editTD)[0];
    if (ckIframeNode.parentNode.id == "cke_contents_editor1") {
      return;
    }
    var editorWidth = this.mainNode.style.width;
    dojo.style(body,{
      'border':'0px solid',
      'height': ''+parseFloat(this.mainNode.style.height)-10+'px',
      'width': ''+editorWidth+'',
      'overflowX':'auto', // set to auto for horizontal scrollbar
      'overflowY':'scroll',
      'backgroundColor':'white',
      'margin':'0px',
      'padding':'0px'
    });

    var height = parseFloat(dojo.getComputedStyle(this.mainNode).height)-10;
    dojo.style(ckIframeNode,{
      'border':'0px solid',
      'height': ''+height+'px',
      'width': ''+editorWidth+'',
      'overflowX':'auto', // set to auto for horizontal scrollbar
      'overflowY':'scroll',
      'backgroundColor':'white',
      'margin':'0px',
      'padding':'0px'
    });

    dojo.style(editTD,{
      'border':'0px solid',
      'height': ''+parseFloat(this.mainNode.style.height)-10+'px',
      'width': ''+editorWidth+'',
      'backgroundColor':'white',
      'margin':'0px',
      'padding':'0px'
    });

    if (BidiUtils.isBidiOn() && dojo.isIE) {
	    dojo.style(body,{
		'width': ''+(parseFloat(editorWidth)-15)+'px',
	    });
    }

    var ieNineSpan = dojo.query(".cke_browser_ie9.",this.mainNode)[0];
    if (ieNineSpan) {
      dojo.style(ieNineSpan.parentNode,{
        'width': ''+editorWidth+''
      });
    }

    var drawFrame = dojo.query(".draw_frame_classes",body)[0];
    if (drawFrame) {
      dojo.style(drawFrame, "height", ""+parseFloat(this.mainNode.style.height)-14+"px");
      if (!dojo.isIE) {
        if (!dojo.isWebKit) {
          dojo.style(drawFrame.parentNode, "paddingRight", "18px");
        }
        dojo.style(drawFrame, "paddingRight", "18px");
      } else {
        dojo.style(drawFrame.parentNode, "paddingRight", "1px");
        dojo.style(drawFrame, "paddingRight", "1px");
        dojo.style(drawFrame, "paddingTop", "2px");
        dojo.style(drawFrame, "paddingLeft", "2px");
      }
    }

    if (dojo.isWebKit) {
      //body.parentNode.style.overflowY = "scroll";
      body.scrollTop = 0;
    }
  },

  handleOnMouseUpEvent: function(handle,e){
    if (dojo.isIE){
      document.onmousemove = null;
      document.onmouseup = null;
    } else{
      if (this.TL_CONNECT){
        dojo.disconnect(this.TL_CONNECT);
        dojo.disconnect(this.TL_move);
      }
      if (this.TM_CONNECT){
        dojo.disconnect(this.TM_CONNECT);
        dojo.disconnect(this.TM_move);
      }
      if (this.TR_CONNECT){
        dojo.disconnect(this.TR_CONNECT);
        dojo.disconnect(this.TR_move);
      }

      if (this.ML_CONNECT){
        dojo.disconnect(this.ML_CONNECT);
        dojo.disconnect(this.ML_move);
      }
      if (this.MR_CONNECT){
        dojo.disconnect(this.MR_CONNECT);
        dojo.disconnect(this.MR_move);
      }

      if (this.BL_CONNECT){
        dojo.disconnect(this.BL_CONNECT);
        dojo.disconnect(this.BL_move);
      }
      if (this.BM_CONNECT){
        dojo.disconnect(this.BM_CONNECT);
        dojo.disconnect(this.BM_move);
      }
      if (this.BR_CONNECT){
        dojo.disconnect(this.BR_CONNECT);
        dojo.disconnect(this.BR_move);
      }
    }

    if (this.tempLayer)
      this.removeTempMoveResizeDiv();

    //Null all move variables to avoid sticky mouse issue
    this.TL_move= null;
    this.TM_move= null;
    this.TR_move= null;
    this.ML_move= null;
    this.MR_move= null;
    this.BL_move= null;
    this.BM_move= null;
    this.BR_move= null;

    this.publishBoxStyleResizingEnd(); //add by wj, when mouse up publish resize event
    this.IS_RESIZING = false;
  },

  // handle mouse down events
  handleContentOnMouseDown: function(e){
    //console.info('notesContentBox:handleContentOnMouseDown','Entry')
    var lockedIcon = dojo.query(".lockedIcon",this.mainNode)[0];
    if (lockedIcon) {
      return;
    }
    if (e == null) { e = window.event;}
    var sender = (typeof( window.event ) != "undefined" ) ? e.srcElement : e.target;
    //only make speaker notes resizable if the user clicks on the handle
    if (dojo.hasClass(sender, "handle") == false) {
      return;
    }
    this.selectThisBox(e);
    this.updateMouseDownForResizeEvent(e);
  },

  // deprecated since no one uses it
  moveCursorPositionToEndOfFirstNode: function(selection){
  },

  isNotesContentBox: function() {
    return true;
  },

  // Sets the data of the contentBox. This needs to be implemented by the subclass
  setContentData: function(){
    //console.log("notesContentBox:setContentData","Entry");
    var dataNode = this.contentBoxDataNode = document.createElement('div');
    this.mainNode.appendChild(dataNode);

    this.isEmptyCBPlaceholder=true;
    dojo.addClass(this.mainNode, 'layoutClass');
    dojo.addClass(this.contentBoxDataNode, 'layoutClassSS');
    dojo.attr(this.mainNode, 'emptyCB_placeholder', 'true');

    // family should be notes, and set this atrribute for processEditorClose
    var family = this.layoutInfo.layoutFamily;
    this.buildTextNodeContent(this.DEFAULT_NOTES_CONTENT,
                              'defaultContentText '+PresConstants.CONTENT_BOX_NOTES_CLASS,family);
    this.updatedClassesForODP(family,
                              this.layoutInfo.layoutName);
    this.setNodeId(this.contentBoxDataNode,
    		PresConstants.CONTENTBOX_DATA_PREFIX);
    //console.log("notesContentBox:setContentData","Exit");
  },

  transformLayoutFamily:function(newLayoutFamily, newLayoutName) {
    console.log("transformLayoutFamily for notesContentBox","Entry");
  },

  publishBoxStyleResizingEnd: function(){
  },

  hideHandles: function() {
  },
  //
  // Adds events for resizing
  //
  updateMouseDownForResizeEvent: function(e){
	this.beforeMoveStyle = dojo.attr(this.mainNode,"style");
	if (e == null) { e = window.event;}
	var sender = (typeof( window.event ) != "undefined" ) ? e.srcElement : e.target;
	if (this.isEditModeOn())  //let's get out of edit mode
		this.toggleEditMode(false);
	if (sender.id=="tm_"+this.boxUID){
		// Add resize tempLayer to smooth out resize.
		if (!this.tempLayer)
			this.addTempMoveResizeDiv();
		  var posL=this.mainNode.offsetLeft;
		  var posT=this.mainNode.offsetTop;
		  var posH=this.mainNode.offsetHeight - this.getHeight_adjust();
		  var posW=this.mainNode.offsetWidth - this.getWidth_adjust();
		  var x=e.clientX;
		  var y=e.clientY;
		  if (dojo.isIE){
			  this.TM_move =true;
			  document.onmousemove = dojo.hitch(this,this.resizeFromTM,posL,posT,posH,posW,x,y);
			  document.onmouseup = dojo.hitch(this,this.handleOnMouseUpEvent);
		  } else{
			  this.TM_move = dojo.connect(window,'onmousemove',dojo.hitch(this,this.resizeFromTM,posL,posT,posH,posW,x,y));
			  this.TM_CONNECT = dojo.connect(document,'onmouseup',dojo.hitch(this,this.handleOnMouseUpEvent,this.TM_move));
		  }
		  this.IS_RESIZING =true;
		  return false;
	}
	return false;
  },
  //
  // Resizing from TM handle
  //
  resizeFromTM: function(posL,posT,posH,posW,x,y,e){
    if (this.TM_move){
      if (e == null) { e = window.event;}
      //D15237 do not adjust the size of speaker notes
      //if the mouse is not down in IE
      if (dojo.isIE) {
        //in order to correctly check if the left mouse button is down
        //in IE 9 you must use the window.event this will also work with IE 8
        var eventToCheck = window.event;
        //in ie if eventToCheck.button is not 1 then the left mouse button is not down
        if (eventToCheck.button != 1) {
          this.handleOnMouseUpEvent(this.TM_move,e);
        }
      }
      var presEditor = dojo.query("#presEditor")[0];
      var presEditorHeight = parseFloat(presEditor.style.height);
      var heightVal = posH-(e.clientY-y);
      var heightIsFine = true;

      //for now the speaker notes can only take up half the height of the screen
      //and must not be less that 62 pixels
      if ((presEditorHeight/heightVal) < 2 || heightVal < 62) {
        heightIsFine = false;
      }
      var myNewTop = this.PxToPercent(posT+(e.clientY-y),'height')+"%";
      var myNewHeight = this.PxToPercent(parseFloat(heightVal),'height') +"%"

      if ((heightIsFine)) {
        dojo.style(this.mainNode,{
          'top':this.PxToPercent(posT+(e.clientY-y),'height')+"%",
          'height': ""+heightVal+"px"
        });

        window.pe.scene.slideEditor.setUIDimensions(null, this);

        var resizeContent = true;
        this.updateHandlePositions(resizeContent);
      }
    }
  },

  //
  // Resizing from Property dialog controlling the height
  //
  resizeFromPropertiesDlg: function(height){
    if (this.TM_move){
      var presEditor = dojo.query("#presEditor")[0];
      var presEditorHeight = parseFloat(presEditor.style.height);
      var heightVal=height*presEditorHeight/100;
      var heightIsFine = true;

      //for now the speaker notes can only take up half the height of the screen
      //and must not be less that 62 pixels
      if ((presEditorHeight/heightVal) < 2 || dojo.number.round(heightVal,0) < 62) {
        heightIsFine = false;
      }

      if ((heightIsFine)) {
        dojo.style(this.mainNode,{
          'height': ""+heightVal+"px"
        });

        window.pe.scene.slideEditor.setUIDimensions(null, this);
        var resizeContent = true;
        this.updateHandlePositions(resizeContent);
      }
    }
  },

  showHandles: function (node) {
    if (node == null) node = this.mainNode;
    var resizeContent = false;
    this.updateHandlePositions(resizeContent, node);
    var handles = dojo.query('.handle',node);
    for (var i=0; i<handles.length; i++){
      var handle = handles[i];
      if (dojo.hasClass(handle, "tm")) {
        dojo.style(handle,{
          'display':'inline'
        });
      } else {
        dojo.style(handle,{
          'display':'none'
        });
      }
    }
  },

  updateHandlePositions: function(resizeContent, node) {
    if (node == null) node = this.mainNode;
    var handles = dojo.query('.handle',node);
    //var container = node;
    //var imgSizeAdjust=PresConstants.HANDLE_IMAGE_SIZE; // size of image
    //var borderSize = dojo.style(node,'borderTopWidth');
    //var halfBorderSize = borderSize/2;
    //var handleAdjust =  halfBorderSize;  // TO CENTER Handle based on thikness of border
    //var boxWidth = (dojo.isIE) ? node.clientWidth : dojo.style(node,'width');
    //var boxHeight =(dojo.isIE) ? node.clientHeight :dojo.style(node,'height');
    var boxId = dojo.attr(node,"boxid");
    boxId = boxId.substring(boxId.indexOf('_')+1, boxId.length);
    for (var i=0; i<handles.length; i++){
      var handle = handles[i];
      if (handle.id=='tm_'+boxId){
        dojo.style(handle,{
          'position':'absolute',
          'top': '0px',
          'left': '0px',
          'border': '0px',
          'width': '100%'
        });
      } else {
        dojo.style(handle,{
          'display':'none'
        });
      }
    }
    // Let's update comment icon
    if(this.hasComments()){
      this.updateCommentIconPosition();
    }
  },

  //
  // Enable menu items for this content box when editing (to be implemented by subclasses types)
  //
  enableMenuItemsOnEdit: function(){
    concord.util.presToolbarMgr.setFocusSorterTb(this.editor.name);
    var slideEditor = dojo.query(".slideEditor")[0];
    if (slideEditor && dojo.isWebKit) {
      slideEditor.style.display = "none";
    }

    concord.util.presToolbarMgr.togglePrevNextSlideButton();
    concord.util.presToolbarMgr.toggleFontEditButtons('off');
    concord.util.presToolbarMgr.toggleBGFillColorButton('off');
    concord.util.presToolbarMgr.toggleBorderColorButton('off');
    concord.util.presToolbarMgr.toggleToolbarButtonState('cke_button_moverowdown','off');
    concord.util.presToolbarMgr.toggleToolbarButtonState('cke_button_addcolumnbefore','off');
    concord.util.presToolbarMgr.toggleRemoveFormatButton('on');

    var eventData = null;
    if (!dojo.hasClass(this.mainNode,'isSpare')){ //enable menu if not a spare
      eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_disableWebClipboardMenuItem}];
      concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
    }
    eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableTextPropertyMenuItems}];
    concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
    eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableIncreaseIndentMenuItems}];
    concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
    eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableDecreaseIndentMenuItems}];
    concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
    eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_disableTextFontPropertyMenuItems}];
    concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);

    var eventDataFormat = [{'eventName': concord.util.events.slideEditorEvents_eventName_disableBringToFrontMenuItems}];
    concord.util.events.publish(concord.util.events.slideEditorEvents, eventDataFormat);
    eventDataFormat = [{'eventName': concord.util.events.slideEditorEvents_eventName_disableSendToBackMenuItems}];
    concord.util.events.publish(concord.util.events.slideEditorEvents, eventDataFormat);
    eventDataFormat = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableStrikeThroughMenuItems}];
    concord.util.events.publish(concord.util.events.slideEditorEvents, eventDataFormat);

    if (slideEditor && dojo.isWebKit) {
      slideEditor.style.display = "block";
    }

    if (!this.attachedStyleStateChange) {
      // watch for changes to strikethrough style
      this.editor.attachStyleStateChange(new CKEDITOR.style(CKEDITOR.config.coreStyles_strike), function(state){
        eventData = null;
        if (state == CKEDITOR.TRISTATE_ON)
          eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_strikethroughCheckedMenuOn}];
        else
          eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_strikethroughCheckedMenuOff}];
        concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
      });

      // watch for changes to bold style
      this.editor.attachStyleStateChange(new CKEDITOR.style(CKEDITOR.config.coreStyles_bold), function(state){
        eventData = null;
        if (state == CKEDITOR.TRISTATE_ON)
          eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_boldCheckedMenuOn}];
        else
          eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_boldCheckedMenuOff}];
        concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
      });

      // watch for changes to italic style
      this.editor.attachStyleStateChange(new CKEDITOR.style(CKEDITOR.config.coreStyles_italic), function(state){
        eventData = null;
        if (state == CKEDITOR.TRISTATE_ON)
          eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_italicCheckedMenuOn}];
        else
          eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_italicCheckedMenuOff}];
        concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
      });

      // watch for changes to underline style
      this.editor.attachStyleStateChange(new CKEDITOR.style(CKEDITOR.config.coreStyles_underline), function(state){
        eventData = null;
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
    concord.util.presToolbarMgr.toggleFontEditButtons('off');

    var eventData = null;
    if(!dojo.hasClass(this.mainNode,'isSpare')){ //disable menu if not a spare
      eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableWebClipboardMenuItem}];
      concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
    }

    eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_disableTextPropertyMenuItems}];
    concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
    eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_disableIncreaseIndentMenuItems}];
    concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
    eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_disableDecreaseIndentMenuItems}];
    concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);

    var eventDataFormat = [{'eventName': concord.util.events.slideEditorEvents_eventName_enableBringToFrontMenuItems}];
    concord.util.events.publish(concord.util.events.slideEditorEvents, eventDataFormat);
    eventDataFormat = [{'eventName': concord.util.events.slideEditorEvents_eventName_enableSendToBackMenuItems}];
    concord.util.events.publish(concord.util.events.slideEditorEvents, eventDataFormat);
    eventDataFormat = [{'eventName': concord.util.events.crossComponentEvents_eventName_disableStrikeThroughMenuItems}];
    concord.util.events.publish(concord.util.events.slideEditorEvents, eventDataFormat);
  },

  //
  // Builds the nodes under the data content node for text box
  //
  buildTextNodeContent: function(defaultTextContent, classToAdd, family, contentArray){
    // TODO: refer to D26869
    // this node is to keep old p which is to be destroyed
    // since the old p may have style which is useful for new p
    var nodeToDestroy = document.createElement('div');
    for (var i = 0, len = this.contentBoxDataNode.firstChild.firstChild.childElementCount;
         i < len; i++) {
      nodeToDestroy.appendChild(this.contentBoxDataNode.firstChild.firstChild.children[i]);
    }

    // for speaker notes, it's enough to only add default txt
    // unlike placeholder in slide
    var displayTableDiv = this.displayTableDiv = this.contentBoxDataNode.firstChild;
    var drawFrameClassDiv = this.drawFrameClassDiv = displayTableDiv.firstChild;

    this.contentBoxDataNode.appendChild(displayTableDiv);
    dojo.style(displayTableDiv,{
      'display':'table',
      'height':'100%',
      'width':'100%'
    });
    dijit.setWaiRole(displayTableDiv,'presentation');

    displayTableDiv.appendChild(drawFrameClassDiv);
    dojo.addClass(drawFrameClassDiv,'draw_frame_classes');
    dojo.style(drawFrameClassDiv,{
      'display':'table-cell',
      'height':'100%',
      'width':'100%'
    });
    dijit.setWaiRole(drawFrameClassDiv,'presentation');

    var p = document.createElement('p');
    if (BidiUtils.isGuiRtl())
    	dojo.attr(p, "dir", "rtl");

    drawFrameClassDiv.appendChild(p);
    dojo.addClass(p, classToAdd);
    // TODO: may need to apply style from old p to new p

    var span = document.createElement('span');
    span.appendChild(document.createTextNode(defaultTextContent));
    p.appendChild(span);
	var br = document.createElement('br');
	dojo.addClass(br, 'hideInIE');
	p.appendChild(br);
    PresCKUtil.removeAllChildren(nodeToDestroy); // node should be dfc
  },


  // todo(bjcheny): invoked selectionAdjustToPartNode before
  selectionAdjust:function(e){
  },

  selectionAdjustToPartNode:function(){
    //console.log("selectionAdjustToPartNode","Entry");
    var selection =this.editor.getSelection();
    var nativeSelection=selection.getNative();
    var body = this.editor.document.getBody().$;
    var drawFrameClassNode = dojo.query(".draw_frame_classes",body)[0];
    var range = selection.getRanges()[0];
    var startContainer = range.startContainer;
    var startOffset = range.startOffset;
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
      this.selectionAdjustToPartNode();
    }
  },

  // deprecated since no one uses it
  cursorPositionAdjust:function(e){
  },

  // deprecated since no one uses it
  removeAddrBR:function(e){
  },

  // set aria-labelledby for the presentations classes in the notes
  setAriaLabels:function(notesDrawFrame){
    if(notesDrawFrame!=null){
      var drawFrames = dojo.query('> .draw_frame',notesDrawFrame);  // get only immediate children that are draw_frames
      if (drawFrames!=null && drawFrames.length>0){
        for(var i=0; i<drawFrames.length; i++) {
          // call main class to handle drawFrames for page-number, date-time, header, footer
          this.inherited(arguments,[drawFrames[i]]);
        }
      }
      // now handle the main notes draw_text-box
      this.inherited(arguments,[notesDrawFrame]);
    }
  }


});
