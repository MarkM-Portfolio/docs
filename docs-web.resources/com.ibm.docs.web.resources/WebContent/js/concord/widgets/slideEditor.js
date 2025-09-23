    /***************************************************************** */
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
 * @slideEditor.js IBM Lotus Project Concord component
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp. 
 */

/**
 * slideEditor.js Allows users to edit IBM Lotus Project Concord presentation slides. 
 */
dojo.provide("concord.widgets.slideEditor");
dojo.require("concord.widgets.txtContentBox");
dojo.require("concord.widgets.notesContentBox");
dojo.require("concord.widgets.imgContentBox");
dojo.require("concord.widgets.shapeContentBox");
dojo.require("concord.widgets.tblContentBox");
dojo.require("concord.widgets.grpContentBox");
dojo.require("concord.widgets.presentationDialog");
dojo.require("concord.widgets.presRuler");
dojo.require("dijit.Menu");
dojo.require("dojox.fx.Shadow");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.TabContainer");
dojo.require("concord.widgets.imageGallery");
dojo.require("concord.widgets.layoutGallery");
dojo.require("concord.widgets.slideTransitionGallery");
dojo.require("concord.widgets.templateDesignGallery");
dojo.require("concord.widgets.ImagePropertyPresHandler");
dojo.require("concord.widgets.shapePropDlg");
dojo.require("dojo.fx");
dojo.require("dojo.io.iframe");
dojo.require("dijit.Dialog");
dojo.require("concord.util.events");
dojo.require("concord.util.BidiUtils");
dojo.require("dojo.i18n");
dojo.require("concord.spellcheck.scaytservice");
dojo.require("concord.editor.SpecialStyle");
dojo.require("concord.widgets.presNonModalDialog");
dojo.require("concord.widgets.InsertImageDialog");
dojo.require("concord.text.tools");
dojo.require("dojo.string");
dojo.require("concord.util.strings");
dojo.requireLocalization("concord.widgets","slideEditor");
dojo.requireLocalization("concord.util","a11y");
dojo.requireLocalization("concord.widgets","presPropertyDlg");

dojo.declare("concord.widgets.slideEditor",null, {
    
    constructor: function(opts) {
        //console.log("slideEditor:constructor","Entry");   
        if (opts.parentContainerNode){
            this.parentContainerNode = opts.parentContainerNode;
            this.positionSize = (opts.positionSize)? opts.positionSize :this.positionSize;
            this.getFocusComponent = opts.getFocusComponent;            
            this.init();
        }
        else { 
            throw new Error("Options need to specify parentContainerNode in slideEditor constructor");
        }
        if (opts.CKEDITOR){
            this.CKEDITOR =opts.CKEDITOR;
        }else{
            throw new Error("Options need to specify CKEDITOR in slideEditor constructor");
        }
        if (opts.CKToolbarSharedSpace){
            this.CKToolbarSharedSpace =opts.CKToolbarSharedSpace;
        }else{
            throw new Error("Options need to specify CKToolbarSharedSpace in slideEditor constructor");
        }               
        if (opts.scene){
            this.scene =opts.scene;
        }else{
            throw new Error("Options need to specify scene in slideEditor constructor");
        }       
    },

    //Constants
    SLIDE_EDITOR_CLASS          :"slideEditor",
        
    //Variables
    mainNode                    : null,
    notesDrawFrame				: null,
    notesDrawText				: null,
    parentContainerNode         : null,
    positionSize                :{'top':'5','left':'20','height':'80','width':'130'},
    CONTENT_BOX_ARRAY           : [],
    createPackageOnClick        : {'createNewContentBox':false, 'pos':null, 'callback':null},
    zIndexCtr                   : 100,
    editorShadow                : null,
    CKEDITOR                    : null,
    CKToolbarSharedSpace        : null,
    layoutGalleryObj            : null,
    templateGalleryObj          : null,
    slideTransitionGalleryObj   : null,
    slideEditorHeight           : null,
    horizontalRuler				: null,
    verticalRuler				: null,
    showRulers					: false,
    SYMPHONY_PAGE_WIDTH_IN_CM   : 28,
    SYMPHONY_PAGE_HEIGHT_IN_CM  : 21,
    SYMPHONY_PAGE_WIDTH_INCHES	: 11.0,
    SYMPHONY_PAGE_HEIGHT_INCHES	: 8.5,
    activeDesignTemplate        : {'cssFiles':null,'cssFilesNodes':null,'cssStylesOnSorterReady':null},
    inLineStyles                : [],

    BACKGROUND_OBJECTS          :"backgroundobjects",
    MOVE_INCREMENT              :5, // in px
    FINE_MOVE_INCREMENT         :1, // in px
    MULTI_MOVE_ON               : false,
    RESIZE_FLAG             : false,
    MOVE_FLAG                   :false,
    boxSelectorNode             :null, // JMT  - This feature is turned off for now D41057
    KEYPRESS        :       concord.util.events.keypressHandlerEvents_eventAction_KEYPRESS, 
    // Events that we care for  
    CTRL_A          :       concord.util.events.keypressHandlerEvents_eventAction_CTRL_A,
    CTRL_C          :       concord.util.events.keypressHandlerEvents_eventAction_CTRL_C,
    CTRL_V          :       concord.util.events.keypressHandlerEvents_eventAction_CTRL_V,
    CTRL_X          :       concord.util.events.keypressHandlerEvents_eventAction_CTRL_X,
    CTRL_ALT_M      :       concord.util.events.keypressHandlerEvents_eventAction_CTRL_ALT_M,
    DELETE          :       concord.util.events.keypressHandlerEvents_eventAction_DELETE,
    DOWN_ARROW      :       concord.util.events.keypressHandlerEvents_eventAction_DOWN_ARROW,
    END             :       concord.util.events.keypressHandlerEvents_eventAction_END,
    ENTER           :       concord.util.events.keypressHandlerEvents_eventAction_ENTER,
    ESC             :       concord.util.events.keypressHandlerEvents_eventAction_ESC,
    HOME            :       concord.util.events.keypressHandlerEvents_eventAction_HOME,
    INSERT          :       concord.util.events.keypressHandlerEvents_eventAction_INSERT,
    LEFT_ARROW      :       concord.util.events.keypressHandlerEvents_eventAction_LEFT_ARROW,
    PAGE_DOWN       :       concord.util.events.keypressHandlerEvents_eventAction_PAGE_DOWN,
    PAGE_UP         :       concord.util.events.keypressHandlerEvents_eventAction_PAGE_UP,
    RIGHT_ARROW     :       concord.util.events.keypressHandlerEvents_eventAction_RIGHT_ARROW,
    UP_ARROW        :       concord.util.events.keypressHandlerEvents_eventAction_UP_ARROW, 
    CTRL_TAB        :       concord.util.events.keypressHandlerEvents_eventAction_CTRL_TAB,
    BACKSPACE       :       concord.util.events.keypressHandlerEvents_eventAction_BACKSPACE,
    SAVE		    :		concord.util.events.keypressHandlerEvents_eventAction_SAVE,
    PRINT		    :		concord.util.events.keypressHandlerEvents_eventAction_PRINT,
    TAB				:		concord.util.events.keypressHandlerEvents_eventAction_TAB,
    SHIFT_TAB		:		concord.util.events.keypressHandlerEvents_eventAction_SHIFT_TAB,

    boxSelectorUsed : false,  // indicates when user selects boxes by mouse drag
    creatingConnector: false, // indicates when creating connector shape by mouse drag
    autoAnimate     : false,  // todo(bjcheny): always false now
    layoutHtmlDiv   : null,
    DEFAULT_TABLE_ROWS: 5,
    DEFAULT_TABLE_COLS: 4,
    ROW_MAX         : 10,
    COL_MAX         : 10,
    ROW_MIN         : 1,
    COL_MIN         : 1,
    DEFAULT_TABLE_HEIGHT : 5,   // in %
    DEFAULT_TABLE_WIDTH  : 58.5, // in %
    DEFAULT_TABLE_TOP    : 25,   // in %
    DEFAULT_TABLE_LEFT   : 16.45,  // in %
    currMasterFrameStylesJSON:{"title":"", "subtitle":"", "text_title":"", "text_outline":"","default_text":"","default_title":"","masterStyleCss":"" },
    currMaster:{"masterName":"", "masterPages":[{"name":""},{"name":""}]},
    IMAGE_DIALOG_WIDTH   	: '694',
    IMAGE_DIALOG_WIDTH_IE	: '710',
    IMAGE_DIALOG_HEIGHT  	: '440',
    IMAGE_DIALOG_HEIGHT_IE 	: '442',
    TOP_OF_AREA          : 'top',
    RIGHT_OF_AREA        : 'right',
    BOTTOM_OF_AREA       : 'bottom',
    LEFT_OF_AREA         : 'left',
    STRINGS              : null,
    PASTE_DISPLACEMENT   : 20,
    userLocks            : [],
    connectArray         : [], //D38660
    iframeDialogEventSet : false,
    spareBox: null,
    sceneReady: false,
    loadingNewSlide: false,
    slideEditorClasses:"slideEditor", //this is to hold any slide editor related classNames for draw_page level which slide sorter doesn't care, the classes that are only specific for slide editor
    showSpeakerNotes: true,

    eventShieldNode: null, 
    eventShieldSizeDiff: 50, // increase this number to increase the area shielded when user is dragging the boxSelectorNode
    
    // Page format variables
    pageHeight: "21.0",           // Symphony default (cm)
    pageWidth: "28.0",            // Symphony default (cm)
    pageUnits: "cm",              // (default)
    pageOrientation: "landscape", // landscape (default) or portrait
    openLockMessageDialogTmStamp: 0, // lock dialog can be called several times for same reason for instance in undo redo
    WIDGITIZE_TIMER: 5,
    slideSelectedTimeOut:null,
    outsideOfCanvas: false, //D2843
    currentCommentIconSize: null,
    SINGLE_CK_MODE : true,
    GROUP_SINGLE_CK_MODE: true,
    groupSpareBox:null,  //13550 - using single CK for group object
    tableSpareBox:null, //13550 - using single CK for table object
    
    maxZindex:-1,
    minZindex:-1,
    //
    // Initializes the slide editor
    //  
    init: function(){
        //console.log("slideEditor:init","Entry");  
        this.STRINGS = dojo.i18n.getLocalization("concord.widgets","slideEditor");
        //Create main Node  
        this.mainNode = document.createElement('div');
        dojo.style(this.mainNode, {'zIndex':'0'});
        this.parentContainerNode.appendChild(this.mainNode);
        dojo.addClass(this.mainNode,this.SLIDE_EDITOR_CLASS);
        // Add dojo tundra class to body
        if (!dojo.hasClass(document.body,'mainBody')) {
            dojo.addClass(document.body,'mainBody');
        }
        dojo.style(document.body,'overflow','hidden');
        // this.addContextMenu();  // to create contextMenu after loading finished

        this.connectArray.push(dojo.connect(this.mainNode,'onclick',dojo.hitch(this,this.handleClickOnSlideEditor)));
                
        document.body.oncontextmenu = function(e) { return false; };
        
        document.ondragstart = function(e) { return false; };
        document.onselectstart = function(e) {  return false; };
        
        this.subscribeToEvents();
        this.setDefaultMouseDown();
        var body = document.body;
        var show = pe.settings? pe.settings.getIndicator() : true;
        if(show) dojo.addClass(body,"user_indicator");      
    },
    
    //
    // inBox is the box to go into the registered array
    // outBox is the box to remove from the array.
    //
    swapRegisteredBox: function(inBox,outBox){
   		for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
        	if (this.CONTENT_BOX_ARRAY[i].mainNode.id == outBox.mainNode.id) {
        		this.CONTENT_BOX_ARRAY[i] = inBox;
        	}
    	}   
    },
    
    //
    // Create spare text box when user needs one. This helps with performance when user creates text box
    //
    createSpareBox: function(){
        //13550 - adding a return value so we know whether or not put the next createSpareGrpBox in setTimeout or not.
    	// allow to create spareBox after PresDocScene is ready
        if(this.spareBox == null && !this.loadingNewSlide && this.sceneReady) {
            var pos ={'left':-9999,'top':10,'width':345,'height':55}; //in px   
            //let's register the original name of the spare editor
            this.addNewTextContentBox(pos, true, null);
            
            // to check the editor
            if (!this.spareBox || !this.spareBox.editor) {
              this.destroySpareBox();
              return false;
            }
            
            this.spareBox.editorName = this.spareBox.editor.name;
            return true;
        } else
            return false;
    },
    
    /**
     * Get connector arrow coordinates.
     * The arrow is implemented with two lines.
     * Two predefined params:
     * 1. angle between the connector and arrow
     * 2. arrow length
     * Per two distances: connector start to arrow
     * and connector end to arrow
     * @param pos: connector start and end coordinates
     * @param isEnd: the end or the double arrow
     * @param position: output for arrow coordinates
     */
    getArrowPosition: function(pos, isEnd , position) {
        var x1 = isEnd ? pos.startX : pos.endX;
        var x2 = isEnd ? pos.endX : pos.startX;
        var y1 = isEnd ? pos.startY : pos.endY;
        var y2 = isEnd ? pos.endY : pos.startY;
    
        var diffX = x1 - x2,
            diffY = y1 - y2,
            lineLen = Math.sqrt((Math.pow(diffX, 2) + Math.pow(diffY, 2))),
            angle = Math.PI / 6,
            arrowLenSquare1 =  this.adjustArrowLen * this.adjustArrowLen,
            arrowLenSquare2 = Math.pow(this.adjustArrowLen * (Math.sin(angle)), 2) + Math.pow((lineLen - this.adjustArrowLen * (Math.cos(angle))), 2),
            f1 = arrowLenSquare1 - arrowLenSquare2 + Math.pow(x1, 2) - Math.pow(x2, 2) + Math.pow(y1, 2) - Math.pow(y2, 2);
        if (diffY == 0) {  // Cannot be divided in else branch, handle it separately
            var f2 = f1 / (2 * diffX),
                f3 = this.adjustArrowLen * (Math.sin(angle));
            if (isEnd) {
                position.endArrowX1 = f2;
                position.endArrowY1 = pos.endY - f3;
                position.endArrowX2 = f2;
                position.endArrowY2 = pos.endY + f3;
            } else {
                position.startArrowX1 = f2;
                position.startArrowY1 = pos.startY - f3;
                position.startArrowX2 = f2;
                position.startArrowY2 = pos.startY + f3;
            }
        } else {
            var f2 = f1 / (2 * diffY),
                f3 = -(diffX / diffY),
                a = 1 + Math.pow(f3, 2),
                b = 2 * (f2 * f3 - x2 - f3 * y2),
                c = Math.pow(x2, 2) + Math.pow(y2, 2) + Math.pow(f2, 2) - 2 * f2 * y2 - arrowLenSquare1,
                e = -(b/(2 * a)),
                f = Math.sqrt(Math.pow(b, 2) - 4 * a * c)/(2 * a);
            if (isEnd) {
                position.endArrowX1 = e + f;
                position.endArrowY1 = f2 + position.endArrowX1 * f3;
                position.endArrowX2 = e - f;
                position.endArrowY2 = f2 + position.endArrowX2 * f3;
            } else {
                position.startArrowX1 = e + f;
                position.startArrowY1 = f2 + position.startArrowX1 * f3;
                position.startArrowX2 = e - f;
                position.startArrowY2 = f2 + position.startArrowX2 * f3;
            }
        }
        
    },
    
    /**
     * Calculate an absolute pixel value as a percentage value
     * @param px: an absolute pixel
     * @param heightOrWidth: width or height
     * @param position: width and height is contained in it
     * @returns
     */
    connectorPxToPercent: function(px, heightOrWidth, position) {
        var result = null;
        if (heightOrWidth =='width')
            result = Math.abs(px - position.left) * 100 / position.width;
        else if (heightOrWidth =='height')
            result = Math.abs(px - position.top) * 100 / position.height;
        return result + '%';
    },
    
    /**
     * Get connector draw frame percentage values
     * @param pos: connector start and end px coordinates
     * @param arrow: end or double arrow
     * @returns 
     * connector start and end percentage coordinates
     * connector arrow percentage coordinates
     * draw frame left, top, width and height
     */
    getConnectorDrawFramePosition: function(pos, arrow){
        var position = {};
        // Get line dir from position
        // +x axis, 1st quadrant, +Y axis, 2nd quadrant
        // -x axis, 3rd quadrant, -Y axis, 4th quadrant
        // Origin point
        if(pos.endX > pos.startX && pos.endY == pos.startY) {
            position.left = pos.startX - this.adjustHalfArrowLen;
            position.top = pos.startY - this.adjustHalfArrowLen; // decrease 3 pixel to contain the line
            position.width = Math.abs(pos.endX - pos.startX) + this.adjustArrowLen;
            position.height = this.adjustArrowLen; // set height as 16 pixel
        } else if(pos.endX > pos.startX && pos.endY > pos.startY) {
            position.left = pos.startX - this.adjustHalfArrowLen;
            position.top = pos.startY - this.adjustHalfArrowLen;
            position.width = Math.abs(pos.endX - pos.startX) + this.adjustArrowLen;
            position.height = Math.abs(pos.endY - pos.startY) + this.adjustArrowLen;
        } else if(pos.endX == pos.startX && pos.endY > pos.startY) {
            position.left = pos.startX - this.adjustHalfArrowLen;
            position.top = pos.startY- this.adjustHalfArrowLen;
            position.width = this.adjustArrowLen;
            position.height = Math.abs(pos.endY - pos.startY) + this.adjustArrowLen;
        } else if(pos.endX < pos.startX && pos.endY > pos.startY) {
            position.left = pos.endX - this.adjustHalfArrowLen;
            position.top = pos.startY - this.adjustHalfArrowLen;
            position.width = Math.abs(pos.endX - pos.startX) + this.adjustArrowLen;
            position.height = Math.abs(pos.endY - pos.startY) + this.adjustArrowLen;
        } else if(pos.endX < pos.startX && pos.endY == pos.startY) {
            position.left = pos.endX - this.adjustHalfArrowLen;
            position.top = pos.endY - this.adjustHalfArrowLen;
            position.width = Math.abs(pos.endX - pos.startX) + this.adjustArrowLen;
            position.height = this.adjustArrowLen;
        } else if(pos.endX < pos.startX && pos.endY < pos.startY) {
            position.left = pos.endX - this.adjustHalfArrowLen;
            position.top = pos.endY - this.adjustHalfArrowLen;
            position.width = Math.abs(pos.endX - pos.startX) + this.adjustArrowLen;
            position.height = Math.abs(pos.endY - pos.startY) + this.adjustArrowLen;
        } else if(pos.endX == pos.startX && pos.endY < pos.startY) {
            position.left = pos.endX - this.adjustHalfArrowLen;
            position.top = pos.endY - this.adjustHalfArrowLen;
            position.width = this.adjustArrowLen;
            position.height = Math.abs(pos.endY - pos.startY) + this.adjustHalfArrowLen;
        } else if(pos.endX > pos.startX && pos.endY < pos.startY) {
            position.left = pos.startX - this.adjustHalfArrowLen;
            position.top = pos.endY - this.adjustHalfArrowLen;
            position.width = Math.abs(pos.endX - pos.startX) + this.adjustArrowLen;
            position.height = Math.abs(pos.endY - pos.startY) + this.adjustArrowLen;
        } else {
            position.left = pos.startX - this.adjustHalfArrowLen;
            position.top = pos.startY - this.adjustHalfArrowLen;
            position.width = this.adjustArrowLen;
            position.height = this.adjustArrowLen;
        }
        
        // Calculate line two points relative position
        position.lineX1 = this.connectorPxToPercent(pos.startX, 'width', position);
        position.lineY1 = this.connectorPxToPercent(pos.startY, 'height', position);
        position.lineX2 = this.connectorPxToPercent(pos.endX, 'width', position);
        position.lineY2 = this.connectorPxToPercent(pos.endY, 'height', position);
        
        // Get arrow absolute positions
        if (arrow == 'end') {
            this.getArrowPosition(pos, true, position);
        } else if (arrow == 'double') {
            this.getArrowPosition(pos, true, position);
            this.getArrowPosition(pos, false, position);
        }
        
        // Calculate arrow points relative position
        if (arrow == 'end') {
            position.endArrowX1 = this.connectorPxToPercent(position.endArrowX1, 'width', position);
            position.endArrowY1 = this.connectorPxToPercent(position.endArrowY1, 'height', position);
            position.endArrowX2 = this.connectorPxToPercent(position.endArrowX2, 'width', position);
            position.endArrowY2 = this.connectorPxToPercent(position.endArrowY2, 'height', position);
        } else if (arrow == 'double') {
            position.endArrowX1 = this.connectorPxToPercent(position.endArrowX1, 'width', position);
            position.endArrowY1 = this.connectorPxToPercent(position.endArrowY1, 'height', position);
            position.endArrowX2 = this.connectorPxToPercent(position.endArrowX2, 'width', position);
            position.endArrowY2 = this.connectorPxToPercent(position.endArrowY2, 'height', position);
            position.startArrowX1 = this.connectorPxToPercent(position.startArrowX1, 'width', position);
            position.startArrowY1 = this.connectorPxToPercent(position.startArrowY1, 'height', position);
            position.startArrowX2 = this.connectorPxToPercent(position.startArrowX2, 'width', position);
            position.startArrowY2 = this.connectorPxToPercent(position.startArrowY2, 'height', position);
        }
        
        // Get draw frame relative position
        position.left = this.PxToPercent(position.left,'width');
        position.top = this.PxToPercent(position.top,'height');
        position.width = this.PxToPercent(position.width,'width');
        position.height = this.PxToPercent(position.height,'height');
        
        return position;
    },
    
    // create connector shape. Will be called when creating by key-down
    createConnectorShape: function(pos) {
        var svgDrawFrame = this.initConnectorShape(pos);
        if (svgDrawFrame) {
            return this.finalizeConnectorShape(svgDrawFrame);
        }
        return null;
    },
    
    // Initialize a connector shape draw frame when the first mouse move
    initConnectorShape: function(pos) {
        var position = this.getConnectorDrawFramePosition(pos, this.arrow);
        
        // create svg div node and set relative size
        var svgDrawFrame = document.createElement('div');
        // Discard resizableContainer to not use padding in svg div
        // And discard resizableContainer when not use border for div
        dojo.attr(svgDrawFrame,"class","draw_frame boxContainer draw_custom-shape shape_svg");
        dojo.attr(svgDrawFrame,"presentation_class","shape_svg");
        dojo.attr(svgDrawFrame,"draw_layer","layout");
        dojo.attr(svgDrawFrame, "shape_node", "svg.on.shape");
        dojo.attr(svgDrawFrame, "draw_type", this.shapeType);
        dojo.attr(svgDrawFrame, "arrow", this.arrow);
        // Tab focus to main node other than data node
        // Because svg node cannot be focused
        dojo.attr(svgDrawFrame,"tabindex","0");
        dojo.style(svgDrawFrame,{
            'position': 'absolute',
            'top': position.top + "%",
            'left': position.left + "%",
            'height': position.height + '%', 
            'width': position.width +'%',
            'zIndex' : pos.zIndex
        });
        
        // add the svg to the svgDiv
        // set relative position and start point absolute coordinates
        var endStr = ' style="stroke:#3a5f8b;stroke-width:0.6pt;"/></line>';
        var svgStr = '<svg contentStyleType="text/css" contentScriptType="text/ecmascript" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" style="position:relative;width:100%;height:100%" version="1.1" draw_layer="layout">';
        svgStr += '<line ' +
            'x1="' + position.lineX1 + '" ' +
            'y1="' + position.lineY1 + '" ' +
            'x2="' + position.lineX2 + '" ' +
            'y2="' + position.lineY2 + '" ' +
            'class="line"' + endStr;
        
        // Add arrow info
        if (this.arrow == 'end') {
            svgStr += '<line ' +
                'x1="' + position.endArrowX1 + '" ' +
                'y1="' + position.endArrowY1 + '" ' +
                'x2="' + position.lineX2 + '" ' +
                'y2="' + position.lineY2 + '" ' +
                'class="arrow_end"' + endStr;
            svgStr += '<line ' +
                'x1="' + position.endArrowX2 + '" ' +
                'y1="' + position.endArrowY2 + '" ' +
                'x2="' + position.lineX2 + '" ' +
                'y2="' + position.lineY2 + '" ' +
                'class="arrow_end"' + endStr;
        } else if (this.arrow == 'double') {
            svgStr += '<line ' +
                'x1="' + position.endArrowX1 + '" ' +
                'y1="' + position.endArrowY1 + '" ' +
                'x2="' + position.lineX2 + '" ' +
                'y2="' + position.lineY2 + '" ' +
                'class="arrow_end"' + endStr;
            svgStr += '<line ' +
                'x1="' + position.endArrowX2 + '" ' +
                'y1="' + position.endArrowY2 + '" ' +
                'x2="' + position.lineX2 + '" ' +
                'y2="' + position.lineY2 + '" ' +
                'class="arrow_end"' + endStr;
            svgStr += '<line ' +
                'x1="' + position.startArrowX1 + '" ' +
                'y1="' + position.startArrowY1 + '" ' +
                'x2="' + position.lineX1 + '" ' +
                'y2="' + position.lineY1 + '" ' +
                'class="arrow_start"' + endStr;
            svgStr += '<line ' +
                'x1="' + position.startArrowX2 + '" ' +
                'y1="' + position.startArrowY2 + '" ' +
                'x2="' + position.lineX1 + '" ' +
                'y2="' + position.lineY1 + '" ' +
                'class="arrow_start"' + endStr;
        }
        svgStr += '</svg>';
        svgDrawFrame.innerHTML = svgStr;
        
        // Append svgDiv to slide editor
        this.setNodeId(svgDrawFrame,PresConstants.CONTENTBOX_PREFIX);
        this.mainNode.appendChild(svgDrawFrame);
        
        return svgDrawFrame;
    },
    
    // Resize a connector shape by mouse
    resizeConnectorShape: function(svgDrawFrame, pos) {
        if (!svgDrawFrame) return;
        
        // Get arrow info
        var arrow = dojo.attr(svgDrawFrame, 'arrow');
        // Get latest relative positions per px latest px value
        var position = this.getConnectorDrawFramePosition(pos, arrow);
        dojo.style(svgDrawFrame,{
            'position': 'absolute',
            'top': position.top + "%",
            'left': position.left + "%",
            'height': position.height + '%',
            'width': position.width +'%'
        });
        
        // Update line position
        var lineArray = dojo.query('line.line', svgDrawFrame);
        if (lineArray && lineArray.length > 0) {
            var lineNode = lineArray[0];
            dojo.attr(lineNode, 'x1', position.lineX1);
            dojo.attr(lineNode, 'y1', position.lineY1);
            dojo.attr(lineNode, 'x2', position.lineX2);
            dojo.attr(lineNode, 'y2', position.lineY2);
        }
        // update arrow position
        lineArray = dojo.query('line.arrow_end', svgDrawFrame);
        if (lineArray && lineArray.length > 0) {
            var lineNode = lineArray[0];
            dojo.attr(lineNode, 'x1', position.endArrowX1);
            dojo.attr(lineNode, 'y1', position.endArrowY1);
            dojo.attr(lineNode, 'x2', position.lineX2);
            dojo.attr(lineNode, 'y2', position.lineY2);
            lineNode = lineArray[1];
            dojo.attr(lineNode, 'x1', position.endArrowX2);
            dojo.attr(lineNode, 'y1', position.endArrowY2);
            dojo.attr(lineNode, 'x2', position.lineX2);
            dojo.attr(lineNode, 'y2', position.lineY2);
        }
        lineArray = dojo.query('line.arrow_start', svgDrawFrame);
        if (lineArray && lineArray.length > 0) {
            var lineNode = lineArray[0];
            dojo.attr(lineNode, 'x1', position.startArrowX1);
            dojo.attr(lineNode, 'y1', position.startArrowY1);
            dojo.attr(lineNode, 'x2', position.lineX1);
            dojo.attr(lineNode, 'y2', position.lineY1);
            lineNode = lineArray[1];
            dojo.attr(lineNode, 'x1', position.startArrowX2);
            dojo.attr(lineNode, 'y1', position.startArrowY2);
            dojo.attr(lineNode, 'x2', position.lineX1);
            dojo.attr(lineNode, 'y2', position.lineY1);
        }
    },
    
    // Finalize a connector shape when mouse up
    // The shape will be widgetized by it
    finalizeConnectorShape: function(svgDrawFrame) {
        if (!svgDrawFrame) return null;
        
        // add move cursor class for connector focus cursor change
        // Do not add it when init the shape. Or cursor will be changed
        // between cross hair and move when moving mouse
        dojo.addClass(svgDrawFrame, 'resizableConnector');
        
        // Update svg title
        var svgNode = svgDrawFrame.firstChild;
        if (svgNode) {
            var shapeTitleNode = document.createElement('title');
            var shapeTitleContentNode = document.createTextNode(this.shapeTitle);
            shapeTitleNode.appendChild(shapeTitleContentNode);
            // shapeTitle is a localized title
            svgNode.appendChild(shapeTitleNode);
            this.setNodeId(shapeTitleNode, PresConstants.CONTENTBOX_PREFIX);
        }
        
        // When dragging, to maintain the cross hair cursor, cross hair style
        // will be added into svg or line node, here clear it
        dojo.query('*[style*=cursor]', svgDrawFrame).forEach(function(node){
            dojo.style(node, 'cursor', '');
        });
        
        var contentObj = this.widgitizeContent(svgDrawFrame, true, true, false); 
        this.publishSlideEditorInFocus();
        return contentObj;
    },
    
    //Used to create a svg shape
    createSvgShape: function(pos, isSpare){
        // forbid widgitization for view draft mode
        if (window.pe.scene.isViewDraftMode())
            return;
        //13550 - when create table but there is no tableSpareBox yet, create the spareBox first
        if(isSpare != true && this.groupSpareBox == null){
            this.createSpareGrpContentBox();
        }
        //create the drawFrame using the
        //appropriate styles and attributes
        var drawFrame = document.createElement('div');
        if(isSpare == true){
            //spare default type is rectangle
            dojo.attr(drawFrame,"draw_type", PresShapeTemplates.SHAPETYPES.RECTANGULAR);
            // Set shape type or spare group spare content box
            // will be created failed just after loading
            // because svg node will be created failed and widgitizaing will fail
            if (!this.shapeType && !this.shapeTitle) {
                this.shapeType = PresShapeTemplates.SHAPETYPES.RECTANGULAR;
                var nls = dojo.i18n.getLocalization("concord.widgets","shapeGallery");
                this.shapeTitle = nls.rectangle;
            }
            dojo.addClass(drawFrame, "isSpare");
        } else {
            dojo.attr(drawFrame,"draw_type",""+this.shapeType+"");
        }
        // change to shape_svg to become consistent with imported shape
        // Before there are some defect fix using shape_svg
        // so for new created shape, also use that flag
        dojo.attr(drawFrame,"class","draw_frame draw_custom-shape boxContainer resizableContainer shape_svg");
        this.applyNewDrawFrameProperties(drawFrame,pos,false);
        dojo.attr(drawFrame,"draw_layer","layout");
        // adjust this value per imported result
        // "ungroupable" will be used when resizing in edit mode
        // In edit mode it will be yes and special handling for shape will be executed
        if (isSpare == true)  // edit mode
            dojo.attr(drawFrame,"ungroupable","yes");
        else  // view mode
            dojo.attr(drawFrame,"ungroupable","no");
        dojo.attr(drawFrame,"presentation_class","group");
        dojo.attr(drawFrame,"contentboxtype","drawing");
        dojo.attr(drawFrame,'text_anchor-type','paragraph');

        //create the drawText using the
        //appropriate styles and attributes
        var drawText = document.createElement('div');
        this.applyNewDrawTextProperties(drawText);
        dojo.attr(drawText,"class","contentBoxDataNode");
        dojo.attr(drawText,"style","position:relative;left:0%;top:0%;height:100%;width:100%;cursor:pointer;");
        
        //create the svgContainer node
        var svgContainer = document.createElement('div');
        dojo.attr(svgContainer,"style","position:absolute;left:0%;top:0%;width:100%;height:100%;");
        dojo.attr(svgContainer,"presentation_class","graphic");
        dojo.attr(svgContainer,"text_anchor-type","paragraph");
        dojo.attr(svgContainer,"draw_layer","layout");
        // Add this attr per import result
        dojo.attr(svgContainer, "shape_node", "svg.on.shape");
        dojo.attr(svgContainer,"class","g_draw_frame boxContainer resizableGContainer");
        dojo.attr(svgContainer,"tabindex","0");
        //add the svg to the svgContainer
        svgContainer.innerHTML = PresShapeTemplates[this.shapeType] && PresShapeTemplates[this.shapeType].svg;
        var svgNode = svgContainer.firstChild;
        if (svgNode) {
            var shapeTitleNode = document.createElement('title');
            var shapeTitleContentNode = document.createTextNode(this.shapeTitle);
            shapeTitleNode.appendChild(shapeTitleContentNode);
            // shapeTitle is a localized title
            svgNode.appendChild(shapeTitleNode);
        }
        //13550
        if(isSpare == true){
            dojo.addClass(svgContainer, "isSpare");
        }
        
        //append the svgContainer to the drawText
        drawText.appendChild(svgContainer);
        
        var textContainer = document.createElement('div');
        var textArea = PresShapeTemplates[this.shapeType] && PresShapeTemplates[this.shapeType].textArea;
        dojo.attr(textContainer,"style","position:absolute;" + textArea);
        dojo.attr(textContainer,"presentation_class","outline");
        dojo.attr(textContainer,"presentation_placeholder","true");
        dojo.attr(textContainer,"text_anchor-type","paragraph");
        dojo.attr(textContainer,"draw_layer","layout");
        dojo.attr(textContainer,"class","g_draw_frame boxContainer resizableGContainer");
        textContainer.innerHTML = '<div role="textbox" style="position:relative;top:0%;left:0%;cursor:pointer;width:100%;height:100%;" class="draw_text-box contentBoxDataNode" tabindex="0"><div style="display:table; height:100%; width:100%; table-layout:fixed;"><div class="draw_shape_classes" style="display:table-cell;width:100%;height:100%;vertical-align:middle;word-wrap:break-word;"><p style="text-align:center;margin-top:0%;margin-bottom:0%;margin-left:0%;" class="text_p"><span style="color:#FFFFFF">&#8203</span></p></div></div></div>';
        drawText.appendChild(textContainer);
        //13550
        if(isSpare == true){
            dojo.addClass(textContainer, "isSpare");
        }
        drawFrame.appendChild(drawText);
        
        this.mainNode.appendChild(drawFrame);
                
        if (pos.top == "0" && pos.left == "0") {
            var newLeft = Math.abs(dojo.style(this.mainNode,"width"))/2;
            var newTop = Math.abs(dojo.style(this.mainNode,"height"))/2;
            var drawWidth = Math.abs(dojo.style(drawFrame,"width"));
            var drawHeight = Math.abs(dojo.style(drawFrame,"height"));
            newLeft = newLeft - drawWidth;
            newTop = newTop - drawHeight;
            newLeft = Math.round(newLeft);
            newTop = Math.round(newTop);
            var top = this.PxToPercent(newTop,'height');
            var left = this.PxToPercent(newLeft,'width');
            dojo.style(drawFrame,{
                'top':top+"%",
                'left':left+"%"
            });	
        }
        
        this.setNodeId(drawFrame,PresConstants.CONTENTBOX_PREFIX);
        // Set clippath for new created shape
        concord.util.HtmlContent.checkIdRefForSVGElement(svgNode);
        
        var publish = !isSpare;
        var contentObj = this.widgitizeContent(drawFrame,publish,true,isSpare); 
        
        if (publish){
            this.publishSlideEditorInFocus();
        }
        return contentObj;
    },

    //
    //Converts Spare box into a real box.
    // A spare box needs to do the following to become a real txt box 
    //  1- have it's display and visibility attribute turned on
    //  2- be positioned in the right place 
    //  3- register spare
    //  4- remove ispare attribute from main node 
    //  5- send spare to coedit 
    //  
    makeSpareReal: function(pos,content,bInsertInternalList){    	
        if(!this.loadingNewSlide){
            this.addNewTextContentBox(pos, false,content,bInsertInternalList);      
        }
    },
    
    //
    //Destroys the spare box
    //
    destroySpareBox: function(){
        //console.log("SlideEditor::destroySpareBox Enter....");
        if (this.spareBox){
            //console.log("SlideEditor: destroying spare....");
            this.spareBox.makeNonEditable();
            this.spareBox.destroyContentBox();
        }
        this.spareBox = null;
    },
    //
    //Destroys the spare box
    //
    destroyGroupSpareBox: function(){
        //console.log("SlideEditor::destroySpareBox Enter....");
        if (this.groupSpareBox){
            //console.log("SlideEditor: destroying spare....");
            this.groupSpareBox.makeNonEditable();
            this.groupSpareBox.destroyContentBox();
        }
        this.groupSpareBox = null;
    },
    //
    //Destroys the spare box
    //
    destroyTableSpareBox: function(){
        //console.log("SlideEditor::destroySpareBox Enter....");
        if (this.tableSpareBox){
            //console.log("SlideEditor: destroying spare....");
            this.tableSpareBox.makeNonEditable();
            this.tableSpareBox.destroyContentBox();
        }
        this.tableSpareBox = null;
    },
    
    //
    // Returns position from px to pct for spareBox
    //
    
    getPosInPct: function(pos){
        var newPos={'top':null,'left':null,'width':null,'height':null};
        newPos.top = this.PxToPercent(pos.top,'height');
        newPos.left = this.PxToPercent(pos.left,'width');
        newPos.width = this.PxToPercent(pos.width,'width');
        newPos.height= this.PxToPercent(pos.height,'height');
        
        return newPos;      
    },
    
    //
    // List of events slide sorter is listening to
    //
    subscribeToEvents: function(){
        dojo.subscribe(concord.util.events.presSceneEvents, null, dojo.hitch(this,this.handleSubscriptionEventsForPresDocScene));
        dojo.subscribe(concord.util.events.presSceneEvents_Resize, null, dojo.hitch(this,this.handleSubscriptionEventsForPresDocScene_Resize));
        dojo.subscribe(concord.util.events.presSceneEvents_Render, null, dojo.hitch(this,this.handleSubscriptionEventsForPresDocScene_Render));
        dojo.subscribe(concord.util.events.slideSorterEvents, null, dojo.hitch(this,this.handleSubscriptionEventsForSorter));
        dojo.subscribe(concord.util.events.slideSorterEvents_Focus, null, dojo.hitch(this,this.handleSubscriptionEventsForSorter_Focus));
        dojo.subscribe(concord.util.events.presMenubarEvents, null, dojo.hitch(this,this.handleSubscriptionEventsForPresToolBar));
        dojo.subscribe(concord.util.events.presToolbarEvents, null, dojo.hitch(this,this.handleSubscriptionEventsForPresToolBar));
        dojo.subscribe(concord.util.events.keypressHandlerEvents, null, dojo.hitch(this,this.handleSubscriptionEventsForKeyPress));
        dojo.subscribe(concord.util.events.coeditingEvents, null, dojo.hitch(this,this.handleSubscriptionEventsForCoedit));
        dojo.subscribe(concord.util.events.commenttingEvents, null, dojo.hitch(this,this.handleSubscriptionEventsForComments));
        dojo.subscribe(concord.util.events.comments_queryposition,this, this.handleSubscriptionEventsForComments);
        dojo.subscribe(concord.util.events.slideEditorEvents_SetFocus, null, dojo.hitch(this,this.handleSubscriptionForSetFocusEvent));
        dojo.subscribe(concord.util.events.presMenubarEvents_SetFocus, null, dojo.hitch(this,this.handleSubscriptionForLostFocusEvent));
        dojo.subscribe(concord.util.events.slideSorterEvents_SetFocus, null, dojo.hitch(this,this.handleSubscriptionForLostFocusEvent));

        dojo.subscribe(concord.util.events.contentBoxEvents, null, dojo.hitch(this,this.handleSubscriptionEventsForContentBox));
    },
    
    //
    // Steps taken to unload current slide
    //
    unloadCurrentSlide: function(destroyNotes){
    	// 15079 show slide level comments on desktop
    	var slideComments = window.pe.scene.slideComments;
		if (slideComments && slideComments.isActive()) {
			this.exitSlideComment();
		}
		
        //Kill ckeditor for all content boxes
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
        	var notNotes = this.CONTENT_BOX_ARRAY[i].contentBoxType != PresConstants.CONTENTBOX_NOTES_TYPE;
                         	
        	if (!destroyNotes){
	            this.CONTENT_BOX_ARRAY[i].makeNonEditable();
	        	if(notNotes){
	        		this.mainNode.removeChild(this.CONTENT_BOX_ARRAY[i].mainNode);
	        	}
	            this.CONTENT_BOX_ARRAY[i].destroyContentBox();
        	}else{
        		if (notNotes){
    	            this.CONTENT_BOX_ARRAY[i].makeNonEditable();
    	        		if(this.CONTENT_BOX_ARRAY[i].mainNode!=null && this.CONTENT_BOX_ARRAY[i].mainNode.parent!=null){
    	        			this.mainNode.removeChild(this.CONTENT_BOX_ARRAY[i].mainNode);
    	        		}
    	            this.CONTENT_BOX_ARRAY[i].destroyContentBox();
        		}else{
        			if (!this.tempRefToLastNotes)
        				this.tempRefToLastNotes = [];
        			this.tempRefToLastNotes.push(this.CONTENT_BOX_ARRAY[i]);
        		}
        	}
        }   
    },
    
    //
    // Kill all ck instances in the current slide
    //
    killAllCkInCurrentSlide: function(){
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
            if(this.CONTENT_BOX_ARRAY[i].isWidgitized)
            	this.CONTENT_BOX_ARRAY[i].makeNonEditable();
        }   
    },
    
    adjustContentBoxPositions: function(){
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
        	if(this.CONTENT_BOX_ARRAY[i].isWidgitized)
        		this.CONTENT_BOX_ARRAY[i].adjustPositionForBorder();            
        }                   
    },

    //
    // Handle events from Content Boxes
    //  
    handleSubscriptionEventsForContentBox: function(data){
        if(data && data.eventName == concord.util.events.contentBoxEvents_eventName_boxClicked){
            var counter = 0;
            var txtBoxCounter = 0;
            var tblBoxCounter = 0;
            var tblContentBoxArray = [];
            var shapeCounter = 0;
            var pptxShapeCounter = 0;
            var speakerNotes = false;
            for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){            
                if (this.CONTENT_BOX_ARRAY[i].boxSelected){
                    counter++;
                    if (this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_TEXT_TYPE) {
                        txtBoxCounter++;
                    }
                    
                    if (this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_NOTES_TYPE) {
                    	speakerNotes = true;
                    }
                    
                    if (this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE) {
                        tblBoxCounter++;
                        tblContentBoxArray.push(i);
                    }
                    
                    if (this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE &&
                        dojo.hasClass( this.CONTENT_BOX_ARRAY[i].mainNode, 'shape_svg' ) &&
                        PresCKUtil.isFillPermittedType(dojo.attr(this.CONTENT_BOX_ARRAY[i].mainNode, 'draw_type'))) {
                        shapeCounter++;
                    }
                    
                    if (PresCKUtil.isPPTXShape(this.CONTENT_BOX_ARRAY[i].mainNode))
                        pptxShapeCounter++;
                }
            }           
            
            if(counter > 0){
            	if(!(speakerNotes && counter == 1)){
            		pe.scene.disableCommentButton(false);
            	}
            }else{
            	pe.scene.disableCommentButton(true);
            }
            
            if (counter == 1 &&  tblBoxCounter == 1){
                var editor = this.CONTENT_BOX_ARRAY[tblContentBoxArray[0]].editor;

                if(editor){
                    var selection = editor.getSelection();
                    if(selection){
                        var selectedElm = selection.getStartElement();
                        if (selectedElm){
                            var table = selectedElm.getAscendant('table',true);
            
                            if(table && table.hasClass('smartTable')){
                                concord.util.presToolbarMgr.toggleBGFillColorButton('on');
                                return;
                            }else {
                                concord.util.presToolbarMgr.toggleBGFillColorButton('off');
                            }
                        }
                    }
                }
            }
            
            
            // if selected all the textBox, user can set background color
            if ((txtBoxCounter >= 1) && (txtBoxCounter== counter)) { 
                concord.util.presToolbarMgr.toggleBGFillColorButton('on');
            }else{
                concord.util.presToolbarMgr.toggleBGFillColorButton('off');
            }
            
            var verticalAlignment = this.getVerticalAlignOnSelectedBoxes();
            if ( verticalAlignment ){
            	var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_verticalAlignOptionOn, 'verticalAlign': verticalAlignment }];
            	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
            } else {
            	var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_verticalAlignOptionAllOff }];
            	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
            }
            
            // If one or multiple shapes are selected
            if ((shapeCounter >= 1) && (shapeCounter == counter)) { 
                concord.util.presToolbarMgr.toggleBGFillColorButton('on');
            }
            
            if (pptxShapeCounter >= 1 && pptxShapeCounter == counter)
                concord.util.presToolbarMgr.toggleBorderColorButton('on');
            else
                concord.util.presToolbarMgr.toggleBorderColorButton('off');
        }
    },

    //
    // Handle events from presentationFocusComponent
    //  
    handleSubscriptionForSetFocusEvent: function(data){
        this.publishSlideEditorInFocus();

        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
            if (this.CONTENT_BOX_ARRAY[i].contentBoxType!=PresConstants.CONTENTBOX_NOTES_TYPE) {
            	if (data && data.presentationNotes) {
            		continue;
            	}
            }
            else if (data && !data.presentationNotes) {
           		continue;
            }
            
            var cur = this.getIndxBoxSelected();
            if (cur != null) {
            	this.CONTENT_BOX_ARRAY[cur].deSelectThisBox();
            }
        	var nextBox = this.CONTENT_BOX_ARRAY[i];
            
        	if(!nextBox.isWidgitized)
				continue;
            
            if (data && data.presentationNotes && !nextBox.isBoxLocked()) {
				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_showHideSpeakerNotes,
				                  'forceOpen':'true'}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);						
            }

        	nextBox.selectThisBox();
        	if (!nextBox.boxSelected && nextBox.isBoxLocked()) {
        		nextBox.selectThisLockedBox();
        	}
        	else if (nextBox.boxSelected && data && data.presentationNotes) {
        		nextBox.handleContentOnDblClick();
        	}
        	break;
        }       
    },

    handleSubscriptionForLostFocusEvent: function(data){
    	this.handleSelfFocusRemoved();
    },
    
    
    //now this is called directly by sorter when a slide is selected
    //bypassing pub/sub to speed up performance in loading slide in editor defect#6042
    handleSlideSelectedEvent:function(data){
    	
    	this.quickLoadInSlideEditor(data.slideSelected, data.isWidgitizeImmediately, data.fromAction);
    	//this.loadSlideInEditor(data.slideSelected,data.widgitize);
        //this.adjustContentBoxPositions();
        concord.util.presToolbarMgr.toggleFontEditButtons('off');
        concord.util.presToolbarMgr.toggleBGFillColorButton('off');
        concord.util.presToolbarMgr.toggleBorderColorButton('off');
        concord.util.presToolbarMgr.toggleInsertMoveRowButton('off');
        concord.util.presToolbarMgr.toggleInsertMoveColButton('off');
    },
    
    handleSubscriptionEventsForSorter_Focus: function(data){
    	this.handleSelfFocusRemoved();
    },
        
    //
    // Handle events from pub/sub model from Slide Sorter
    //
    handleSubscriptionEventsForSorter: function(data){
        if (data.eventName=='slideSorterReady'){
            var cssFilesArray = data.cssFiles;
            this.layoutHtmlDiv = data.layoutHtmlDiv;
           // this.activeDesignTemplate.cssStylesOnSorterReady = [];
            //Inject CSS files in our document
            //for (var i=0; i<cssFilesArray.length; i++){
            //    var cssNode = this.injectCssStyle(cssFilesArray[i]);
           //     if (cssNode)
            //        this.activeDesignTemplate.cssStylesOnSorterReady.push(cssNode);
           //}
                
            //add link element in our document
            if(!dojo.isIE)//roll back code for D28633
            {
                var linkElems = data.linkElements;              
                for (var i=0; i< linkElems.length;i++){
                    var link = dojo.clone(linkElems[i]);
                    if(link.href.indexOf('office_styles.css')!=-1 || link.href.indexOf('office_automatic_styles.css')!=-1){
                        var currentheadTag = window.document.getElementsByTagName("head")[0];              
                        currentheadTag.appendChild(link);
                    }

                }
            }

            /*for (var i=0; i< linkElems.length;i++){
                var link = dojo.clone(linkElems[i]);
                //check if the link is already available

                // D28633: [IE][Regression] Revert to last version font style restored to plain unexpectedly.
                // we should write an reference link for IE because its css content cannot be found
                if(dojo.isIE || (link.href.indexOf('office_styles.css')==-1 && link.href.indexOf('office_automatic_styles.css')==-1)){ 
                    var isExist = false;
                    if(linksInDoc!=null && linksInDoc.length>0){
                        for(var j=linksInDoc.length-1; j >=0; j--){
                            var hrefInDoc = linksInDoc[j].href;
                            var idx =hrefInDoc.indexOf(link.href);
                            if(idx >=0){
                                isExist = true;
                                break;
                            }
                        }
                    }
                    if(!isExist){
                        var styleNode = this.injectCssStyle(link.href, false);
                        this.activeDesignTemplate.cssStylesOnSorterReady.push(styleNode);
                    }
                }
            }*/
            //add inline styles in our document
            var inLineStyles = this.inLineStyles = data.styleElements;              
            var headTag = window.document.getElementsByTagName("head")[0];  
            for (var i=0; i< inLineStyles.length;i++){
            	var node = inLineStyles[i];
                var isExist = false;
                var styleId = node.id;
                if(styleId!=null && styleId.length>0){
                    var styleIdInDoc = document.getElementById(styleId);
                    if(styleIdInDoc!=null){
                        isExist = true;
                    }
                }
                if (headTag && !isExist)
                {
                	if(dojo.isIE)
                	{
                		// #D34157, root cause still not clear, maybe IE parse css use different way.
                		// Should work on IE9+ browsers.
                		var style = document.createElement("style");
                		headTag.appendChild(style);
                		style.outerHTML = node.outerHTML;
                	}
                	else
                	{
                		headTag.appendChild(dojo.clone(node));
                	}
                }
            } 
            PresCKUtil.createListStyleSheetinViewMode(window.document);
            
        } else if (data.eventName=='templateApplied'){
            this.activeDesignTemplate.cssFiles=[];
            this.activeDesignTemplate.cssFilesNodes=  {'cssFiles':[]};
            var cssFilesArray = data.cssFiles;
            this.activeDesignTemplate.cssFiles = cssFilesArray; 
            //#15511 - remove previous first then inject new ones
			//if inject first then remove, if we are applying same master style, the injected css is going to be removed.
            //remove the previous template's css file (but not removing office_styles.css or office_automatic_styles.css)
            if(this.getMasterTemplateInfo().masterStyleCss!=null){
                var officeStyleIdx = this.getMasterTemplateInfo().masterStyleCss.indexOf("office_styles.css");
                var officeAutoStyleIdx = this.getMasterTemplateInfo().masterStyleCss.indexOf("office_automatic_styles.css");
                if(officeStyleIdx<0 && officeAutoStyleIdx<0){
					//D14414: [Regression][MasterStyle] Font color is not black after switch back to default template.
                	var masterCss = concord.util.uri.stripRelativePathInfo(this.getMasterTemplateInfo().masterStyleCss);
                    this.removeCSS (masterCss);
                }
            }
            for (var i=0; i<cssFilesArray.length; i++){
                var loadFromAttachment = false;
                this.injectCssStyle(cssFilesArray[i],loadFromAttachment);               
            }   
            
        } else if(data.eventName == concord.util.events.slideSorterEvents_eventName_masterTemplateChange){
            this.handleMasterTemplateChange(data);
        } else if (data.eventName==concord.util.events.slideSorterEvents_eventName_attributeChange){
            this.handleCoeditAttributeChange(data);
        } else if (data.eventName==concord.util.events.slideSorterEvents_eventName_launchSlideDesignDialog) {
            this.openTemplateDesignDialog();
        } else if (data.eventName==concord.util.events.slideSorterEvents_eventName_launchSlideTransitionDialog) {
            this.openSlideTransitionDialog();
        }else if (data.eventName==concord.util.events.slideSorterEvents_eventName_launchSlideLayoutDialog)  {
            this.openLayoutDialog();
        } else if (data.eventName==concord.util.events.slideSorterEvents_eventName_deleteCommentIcon){
            this.handleCoeditDeleteCommentIcon(data);
        }else if (data.eventName==concord.util.events.slideSorterEvents_eventName_launchContentLockDialog){
            this.openLockMessageDialog(data.objId,data.userList);
        }else if(data.eventName==concord.util.events.slideSorterEvents_eventName_commentSelectedInSlideOpened){
            this.selectBoxWithComment(data);
        }else if(data.eventName==concord.util.events.slideSorterEvents_eventName_commentUnselectedInSlideOpened){
            this.unselectBoxWithComment(data);
        }else if (data.eventName==concord.util.events.slideSorterEvents_eventName_slidesLoaded){
        	this.createSpareBox();
        }else if(data.eventName== concord.util.events.slideSorterEvents_eventName_selectedSlideNumberUpdated){
        	this.handleUpdateSlideNumber(data);
        }else if(data.eventName==concord.util.events.slideSorterEvents_eventName_layoutApplied){
        	data.isWidgitizeImmediately = true;
        	this.handleSlideSelectedEvent(data);
        }
    },
    
    
	publishDialogInFocus: function(){	
		this.domNode.style.zIndex = this.maxZindex;
 		var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_inFocus,'componentName':'dialogs', 'presModal':true}];
 		concord.util.events.publish(concord.util.events.presentationFocus, eventData); 		
	},
    //
    // Handle events from pub/sub model from Slide PresDocScene
    //    
    handleSubscriptionEventsForPresDocScene_Resize: function(data){
        this.setUIDimensions(data);
        
        // 15079 show slide level comments on desktop
        // resize drawing on window resize
        var slideComments = window.pe.scene.slideComments;
        if (slideComments && slideComments.isActive() && slideComments.getContainer()) {
            slideComments.getContainer().resizestart();
            if (slideComments.getContainer().getNote())
                slideComments.getContainer().getNote().resizestart();
        }
    },
    
    handleSubscriptionEventsForPresDocScene_Render: function(data){
	    this.setUIDimensions();         
	    this.mainNode.style.display="block";
	    // this.adjustContentBoxPositions();
	    if (dojo.isIE) this.adjustAllContentDataSize();
	    if (this.editorShadow)
	        this.editorShadow.resize();
	    else {
	        this.editorShadow = new dojox.fx.Shadow({ node:this.mainNode, shadowThickness: 10, shodowOffset:10});            
	        this.editorShadow.startup();
	    }
	    this.createRulers();
	    //this.createIndicatorSytle(pe.authenticatedUser.getId());
	    this.sceneReady = true;
    },
    
    handleSubscriptionEventsForPresDocScene: function(data){
        if (data.eventName==concord.util.events.presDocSceneEvents_eventName_userJoined){
            this.handleUserJoined(data);
        }   
    },
    
    // Handle events from pub/sub model for presToolBar and presMenuBar
    // 
    handleSubscriptionEventsForPresToolBar: function(data){
        if (data.eventName==concord.util.events.presMenubarEvents_eventName_launchImageDialog){
            this.openAddNewImageDialog(dojo.hitch(this,this.addImageContentBox));            
        } else if (data.eventName==concord.util.events.presMenubarEvents_eventName_launchSlideDesignDialog) {
            this.openTemplateDesignDialog();
        } else if (data.eventName==concord.util.events.presMenubarEvents_eventName_launchShapeMessageDialog) {
            this.openShapeMessageDialog();
        }else if (data.eventName==concord.util.events.presMenubarEvents_eventName_launchSlideLayoutDialog)  {
            this.openLayoutDialog();
        }else if (data.eventName==concord.util.events.presMenubarEvents_eventName_launchShapePropertyDlg)  {
        	this.openShapePropDialog();
        }else if (data.eventName==concord.util.events.presMenubarEvents_eventName_launchImagePropertyDlg)  {
            this.openImagePropDialog();
        }else if (data.eventName==concord.util.events.presMenubarEvents_eventName_launchPropertyDlg)  {
            this.openPropertyDialog();
        }else if (data.eventName==concord.util.events.presMenubarEvents_eventName_strikethrough) {
            this.strikethroughContentOnSelectedBox(data.eventName);   
        }else if (data.eventName==concord.util.events.presMenubarEvents_eventName_bold) {
            this.boldContentOnSelectedBox(data.eventName);   
        }else if (data.eventName==concord.util.events.presMenubarEvents_eventName_italic) {
            this.italicContentOnSelectedBox(data.eventName);   
        }else if (data.eventName==concord.util.events.presMenubarEvents_eventName_underline) {
            this.underlineContentOnSelectedBox(data.eventName);   
        }else if (data.eventName==concord.util.events.presMenubarEvents_eventName_superscript || 
                  data.eventName==concord.util.events.presMenubarEvents_eventName_subscript)    {
            this.superSubscriptContentOnSelectedBox(data.eventName);            
        }else if (data.eventName==concord.util.events.presMenubarEvents_eventName_bringToFront) {
            this.toggleBringToFront();
        }else if (data.eventName==concord.util.events.presMenubarEvents_eventName_sendToBack)   {
            this.toggleSendToBack();            
        }else if (data.eventName==concord.util.events.presMenubarEvents_eventName_launchSlideTransitionDialog)  {
            this.openSlideTransitionDialog();
        }else if (data.eventName==concord.util.events.presMenubarEvents_eventName_launchTableRowDialog) {
            this.launchTableRowDialog(data);
        }else if (data.eventName==concord.util.events.presMenubarEvents_eventName_launchTableColDialog) {
            this.launchTableColDialog(data);
        } else if (data.eventName==concord.util.events.presMenubarEvents_eventName_createNewShapeBox){
            this.shapeType = data.shapeType;
            this.shapeTitle = data.shapeTitle;
            this.arrow = data.arrow;
            this.deSelectAll();
            if (data.fromMouse) {
                if (PresCKUtil.connectorShapeTypes[this.shapeType] == 1)
                    // Connector shape will be initialized when the first mouse move
                    // And then resize function will called to resize it
                    // And when mouse up, finalize the shape creation
                    this.prepareToCreateSvgShape({'shapeType':this.shapeType,
                        callback:dojo.hitch(this,this.initConnectorShape), 
                        resizeCallback:dojo.hitch(this,this.resizeConnectorShape),
                        finalizeCallback:dojo.hitch(this,this.finalizeConnectorShape)});
                else
                    this.prepareToCreateSvgShape({'pos':null, callback:dojo.hitch(this,this.createSvgShape)});
            } else {
                if (PresCKUtil.connectorShapeTypes[this.shapeType] == 1) {
                    var width = 15;
                    var height = 12;
                    var left = dojo.style(this.mainNode, 'width')/2 - width;
                    var top = dojo.style(this.mainNode, 'height')/2 - height;
                    var pos = {
                        startX: left,
                        startY: top,
                        endX: left + width,
                        endY: top + height,
                        zIndex: this.getzIndexCtr()
                    };
                    this.createConnectorShape(pos);
                } else {
                    var pos = {'left':'0', 'top':'0'};
                    this.createSvgShape(pos);
                }
            }
        } else if (data.eventName==concord.util.events.presMenubarEvents_eventName_createNewTextBox){
            this.prepareToCreateContentBox({'pos':null,'callback':dojo.hitch(this,this.makeSpareReal)});
        } else if (data.eventName==concord.util.events.presMenubarEvents_eventName_createDefaultTextBox){
            this.createDefaultContentBox();
        }else if (data.eventName==concord.util.events.presMenubarEvents_eventName_createTableBox){
            this.launchCreateTableDialog();
        }else if ( (data.eventName=='presAlignLeft') || (data.eventName=='presAlignRight') || (data.eventName=='presAlignCenter') || (data.eventName=='presJustify')){
            this.setContentStyleOnSelectedBox(data.eventName);
        }else if ( (data.eventName=='presLeftToRight') || (data.eventName=='presRightToLeft') ){
            this.setContentStyleOnSelectedBox(data.eventName);
        }else if ( ( data.eventName == 'presComments')){
            this.publishcreateComments();
        }else if (data.eventName == concord.util.events.presMenubarEvents_eventName_CopyObject){
                var itemsCopied = this.copySelectedItems();
                if (!itemsCopied){
                    this.publishCopySlides();
                }
        }else if (data.eventName == concord.util.events.presMenubarEvents_eventName_CutObject){
                var itemsCopied = this.copySelectedItems();
                if (!itemsCopied){
                    this.publishCutSlides();
                }else{
                	this.deleteSelectedContentBoxes();
                }
        }else if (data.eventName == concord.util.events.presMenubarEvents_eventName_PasteObject){
            this.pasteSelectedItems();
        }else if (data.eventName==concord.util.events.presToolbarEvents_eventName_createTableBoxDefault){
            this.createTable();
        }else if (data.eventName == concord.util.events.presMenubarEvents_eventName_deleteTableBox){
            this.deleteSelectedTables();//hide sorter view
            pe.scene.focusMgr.setFocusToSlideEditor();
        }else if (data.eventName == concord.util.events.presToolbarEvents_eventName_concordBGFill){
            this.setBGColorOnSelectedBox(data);    
            this.mainNode.parentNode.focus();
        }else if (data.eventName == concord.util.events.presToolbarEvents_eventName_concordBorderColor){
            this.setBorderColorOnSelectedBox(data);    
            this.mainNode.parentNode.focus();
        }else if (data.eventName == concord.util.events.presToolbarEvents_eventName_verticalAlign){
            this.setVerticalAlignOnSelectedBoxes(data);         
        }else if (data.eventName==concord.util.events.presMenubarEvents_eventName_addTableStyle){
            this.createTableAndAddTableStyle(data);
        }else if (data.eventName==concord.util.events.presMenubarEvents_eventName_addCustomTableStyle){
            this.createTableAndAddCustomTableStyle(data);
    	}else if (data.eventName==concord.util.events.presMenubarEvents_eventName_showHideSpeakerNotes){
            this.toggleShowSpeakerNotes(data);
        }
    },
            
    //
    // Handle events from pub/sub model for KeyPress
    //
    handleSubscriptionEventsForKeyPress: function(data){
    	// to ignore keypress in loading or read-only mode or view mode
    	var tempScene = window.pe.scene;
    	if (!tempScene.bLoadFinished || tempScene.bInReadOnlyMode ||
    			tempScene.isViewDraftMode()) {
			return;
		}
    	
        if (data.eventName==concord.util.events.keypressHandlerEvents_eventName_keypressEvent){                             
            //console.log('slideEditor, handleSubscriptionEventsForKeyPress');

        	if(data.eventAction == ('CTRL_C'||'CTRL_V'||'CTRL_X')){
        		this.keypressHandle(data);
        	}else 
        	// removed check for hasKBFocus - could not gurantee this flag would be set
            // properly because the enter key is blocked by the rich combo boxes
        	if (!this.checkIsToolbarCommand(data)) {
        		this.keypressHandle(data);
        	}
        	else {
        		if (data.e) {
        			dojo.stopEvent(data.e);
        		}
        	}

        } else if (data.eventName==concord.util.events.keypressHandlerEvents_eventAction_OUTSIDE_EDITOR){
            this.cancelAllMoveAndResize(data.e);
        }
    },
        
    checkIsToolbarCommand: function(evt)
    {
    	if (evt == null || evt.e == null) {
    		return false;
    	}
		var targetid = null;
		var target = evt.e.target;
		if (dojo.isIE) {
			target = evt.e.srcElement;
		}

		if (target) {
			targetid = target.id;
			if (targetid == null || targetid == "") {
				if (target.parentNode) {
					targetid = target.parentNode.id;
				}
			}
		}
		var tbdiv = dojo.byId('toolbar');
		if (tbdiv && targetid) {
			var res = dojo.query("#" + targetid,tbdiv);
			if (res.length > 0) {
				if (evt.e.keyCode && evt.e.keyCode != 27 && evt.e.keyCode != 13) { // ESC, Enter
					concord.util.presToolbarMgr.setKBFocus(true);
				}
				return true;
			}
		}
		return false;
    },
    
    //
    // Handle events from pub/sub model for Coedit
    //
    handleSubscriptionEventsForCoedit: function(data){
        if (data.eventName==concord.util.events.LocalSync_eventName_attributeChange){
            this.handleCoeditAttributeChange(data);
        }else if (data.eventName==concord.util.events.LocalSync_eventName_conflictingZindex) {
        	this.handleCoeditZindexConflict(data);
        }else if (data.eventName==concord.util.events.commenttingEvents_eventName_addCommentIcon){
            this.handleCoeditAddCommentIcon(data);
        }else if (data.eventName==concord.util.events.commenttingEvents_eventName_deleteCommentIcon){
            this.handleCoeditDeleteCommentIcon(data);
		}else if (data.eventName==concord.util.events.commenttingEvents_eventName_addSlideCommentIcon){
            this.mHandleCoeditAddSlideCommentIcon(data.slideId);
        }else if (data.eventName==concord.util.events.commenttingEvents_eventName_delSlideCommentIcon){
            this.mHandleCoeditDelSlideCommentIcon(data.slideId);
		}else if(data.eventName == concord.util.events.coeditingEvents_eventName_toggleContentBoxLock){
			this.handleToggleContentBoxLock(data.contentBoxId, data.lockContentBox, data.user);
		}else if(data.eventName == concord.util.events.coeditingEvents_eventName_slideSelectedByOtherUser){
			this.handleSlideSelectedByOtherUser(data);
		}
    },
    
    handleCoeditZindexConflict: function(data) {
    	var cb = this.getRegisteredContentBoxById(data.id);    	
        if (this.maxZindex != null && cb != null) {						
            for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){            	
                if (this.CONTENT_BOX_ARRAY[i].boxID != cb.boxID && this.CONTENT_BOX_ARRAY[i].getzIndexCtr() == cb.getzIndexCtr())  {
                	this.maxZindex += 1;
                	cb.setzIndexCtr(this.maxZindex);
        	        dojo.style(cb.mainNode,{
        	            'zIndex':cb.getzIndexCtr()
        	        }); 
        	        cb.publishBoxAttrChanged("style",cb.mainNode.id,true,false);                    
        	        
        	        this.maxZindex += 1;
        	        this.CONTENT_BOX_ARRAY[i].setzIndexCtr(this.maxZindex);
        	        dojo.style(this.CONTENT_BOX_ARRAY[i].mainNode,{
        	            'zIndex':this.CONTENT_BOX_ARRAY[i].getzIndexCtr()
        	        }); 
        	        this.CONTENT_BOX_ARRAY[i].publishBoxAttrChanged("style",this.CONTENT_BOX_ARRAY[i].mainNode.id,true,false);        	        
                }               
            }   
        }    	
    },

	//send messages to other users who selected the slide of any locked content boxes
    handleSlideSelectedByOtherUser: function(data) {
    	if (data.msg.drawFrameId == this.mainNode.id) {
    		for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
            	if (this.CONTENT_BOX_ARRAY[i].editModeOn) {
            		this.CONTENT_BOX_ARRAY[i].publishBoxEditMode();
            	}
        	}   	
    	}
    },
    
	handleToggleContentBoxLock:function(contentBoxId, lockContentBox, user){
		var contentBox = this.getRegisteredContentBoxById(contentBoxId);
		if (contentBoxId != null) {
			if (contentBox) {
            	contentBox.toggleLockIndicator(lockContentBox, user);
            }
		}
	},
    
    //
    // Handle events from pub/sub model for comments
    //
    handleSubscriptionEventsForComments: function(data){
        if (data.eventName == concord.util.events.commenttingEvents_eventName_createComment||data.eventName == concord.util.events.commenttingEvents_eventName_expandComments){
            this.closeAllDialogs();//hide sorter view            
        }else if (data.eventName==concord.util.events.commenttingEvents_eventName_commentCreated){
            this.handleCommentsCreated(data);            
        }else if (data.eventName==concord.util.events.comments_queryposition){
            this.handleQueryPosition(data);            
        }
    },
           
    //
    // publish copySlide to slideSorter
    //
    publishCopySlides: function(){
        //console.log("contentBox:publishCopySlides","Entry");      
        var eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_copySlides}];
        concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);              
    },
        
    //
    // publish cutSlides to slideSorter
    //
    publishCutSlides: function(){
        //console.log("contentBox:publishCutSlides","Entry");       
        var eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_cutSlides}];
        concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);              
    },
    
    //
    // Only deletes tables
    //
    deleteSelectedTables : function(){
    	PresCKUtil.normalizeMsgSeq(null, null, null, "beginMerge");    	
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
            if ((this.CONTENT_BOX_ARRAY[i].boxSelected) && (this.CONTENT_BOX_ARRAY[i].contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE)) {
                if (this.scene.isSlideNodeLocked(this.CONTENT_BOX_ARRAY[i].mainNode.id)){
                    this.openLockMessageDialog(this.CONTENT_BOX_ARRAY[i].mainNode.id);                  
                } else{
                    var publish = true;
                    this.CONTENT_BOX_ARRAY[i].deleteContentBox(publish);
                    i=i-1;
                }
            }
        }   
        PresCKUtil.normalizeMsgSeq(null, null, null, "endMerge");
    },

    //
    // Closes all opened non modal dialogs
    //
    closeAllNonModalDialog: function() {		 

        if (this.templateDesignDialogObj && this.templateDesignDialogObj.domNode.style.display != 'none') 
            this.templateDesignDialogObj.closeDialog(); 
        if (this.openLayoutDialogObj && this.openLayoutDialogObj.domNode.style.display != 'none') 
            this.openLayoutDialogObj.closeDialog();
        if (this.openSlideTransitionDialogObj && this.openSlideTransitionDialogObj.domNode.style.display != 'none') 
            this.openSlideTransitionDialogObj.closeDialog();
	},
	
    //
    // Closes all opened dialog
    //
    closeAllDialogs: function(){            
        if (this.newImageDialogObj) 
            this.newImageDialogObj.hide();
        if (this.templateDesignDialogObj) 
            this.templateDesignDialogObj.closeDialog(); 
        if (this.openLayoutDialogObj) 
            this.openLayoutDialogObj.closeDialog();
        if (this.openTablePropDialogObj) 
            this.openTablePropDialogObj.closeDialog();
        if (this.openImagePropDialogObj) 
            this.openImagePropDialogObj.closeDialog();
        if (this.slideTransitionDialogObj) 
            this.slideTransitionDialogObj.closeDialog();
        if (this.lockMessageDialog) 
            this.lockMessageDialog.closeDialog();
        if (this.newTableDialogObj) 
            this.newTableDialogObj.closeDialog();
        if (this.newTableRowDialogObj) 
            this.newTableRowDialogObj.closeDialog();
        if (this.newTableColDialogObj) 
            this.newTableColDialogObj.closeDialog();
    },
    
    //
    // closes a specified dialog
    //
    closeDialog: function(dialogObj){
        if (dialogObj)
            dialogObj.closeDialog();
    },
    
    //
    // Returns inLineStyles array
    //
    getInLineStyles: function(){
        return this.inLineStyles;
    },
    
    //
    // Set inLineStyles array
    //
    setInLineStyles: function(inlineStyles){
        this.inLineStyles = inlineStyles;
    },
    //
    // handleUserJoined
    //
    handleUserJoined: function(data){    	
        var userId = data.userId;
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){            
            if (this.CONTENT_BOX_ARRAY[i].editor){
                this.CONTENT_BOX_ARRAY[i].userJoined(userId);
            }
        }  
        console.log('===================handleUserJoined, userId == '+userId);
        this.createIndicator(userId);
    },
    createIndicator: function(userId){
		if (pe.scene.CKEditor.document)
			this.createIndicatorSytle(userId);
		else
		{
			setTimeout(dojo.hitch(this, function()
			{
				console.log('====================need to wait for document instance when creating indicator style');
				this.createIndicator(userId);
			}), 500);
		}
    },
    //
    // Checks if there are any pending changes that need to be flushed 
    //
    chkPendingChangesForAll: function(){    	
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){            
            if (this.CONTENT_BOX_ARRAY[i].editor){
                this.CONTENT_BOX_ARRAY[i].chkPendingChanges(true);
            }
        }                                   
    },
      
    //
    // Handle Show/Hide Coediting indicators
    //
    handleShowHideCoeditingIndicators: function(){
        var body = document.body;
        var visible = !dojo.hasClass(body, 'user_indicator');

        this.setCoeditingIndicators(visible, body);
        
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){            
            if (this.CONTENT_BOX_ARRAY[i].editor){
                body = this.CONTENT_BOX_ARRAY[i].editor.document.getBody().$;
                this.setCoeditingIndicators(visible, body);
            }
        }                                   
    },  
    
    //
    // Set coediting Indicator on or off
    //
    setCoeditingIndicators: function(on,body){
        if (on){
            dojo.addClass(body,"user_indicator");
        }else{
            dojo.removeClass(body,"user_indicator");
        }
    },
    
    //
    // Handle Coedit attributes coming in from Slide Sorter
    //
    //var eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_attributeChange,'id':id,'attributeName':'style','attributeValue':style}];
    handleCoeditAttributeChange: function(data){
        var box = this.getRegisteredContentBoxById(data.id);
        if (box){
            box.updateCoeditAttributeChange(data);
        } 
    },

    //
    // Superscript or Subscript Text in a content box
    //
    superSubscriptContentOnSelectedBox: function (eventName){
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
            if (this.CONTENT_BOX_ARRAY[i].boxSelected && 
            		(this.CONTENT_BOX_ARRAY[i].contentBoxType==PresConstants.CONTENTBOX_TEXT_TYPE || 
            			this.CONTENT_BOX_ARRAY[i].contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE ||
            				this.CONTENT_BOX_ARRAY[i].contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE ||
            				this.CONTENT_BOX_ARRAY[i].contentBoxType==PresConstants.CONTENTBOX_GROUP_TYPE)) { //D14747 - added shapes
                if(eventName=='superscript') {
                    this.CONTENT_BOX_ARRAY[i].SuperscriptText();
                }
                else {
                    this.CONTENT_BOX_ARRAY[i].SubscriptText();                           
                }
            }
        }       
    },
    
    //
    // Apply strikethrough style to text in a content box
    //
    strikethroughContentOnSelectedBox: function (eventName){
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
            if (this.CONTENT_BOX_ARRAY[i].boxSelected && 
            		(this.CONTENT_BOX_ARRAY[i].contentBoxType==PresConstants.CONTENTBOX_TEXT_TYPE || 
            			this.CONTENT_BOX_ARRAY[i].contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE ||
            				this.CONTENT_BOX_ARRAY[i].contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE ||
            				this.CONTENT_BOX_ARRAY[i].contentBoxType==PresConstants.CONTENTBOX_GROUP_TYPE)) {//D14747 - added shapes
                    this.CONTENT_BOX_ARRAY[i].strikethroughText();
            }
        }       
    },
    
    //
    // Apply bold style to text in a content box
    //
    boldContentOnSelectedBox: function (eventName){
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
            if (this.CONTENT_BOX_ARRAY[i].boxSelected && 
            		(this.CONTENT_BOX_ARRAY[i].contentBoxType==PresConstants.CONTENTBOX_TEXT_TYPE || 
            			this.CONTENT_BOX_ARRAY[i].contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE ||
            				this.CONTENT_BOX_ARRAY[i].contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE ||
            				this.CONTENT_BOX_ARRAY[i].contentBoxType==PresConstants.CONTENTBOX_GROUP_TYPE)) {//D14747 - added shapes
                    this.CONTENT_BOX_ARRAY[i].boldText();
            }
        }       
    },
    
    //
    // Apply italic style to text in a content box
    //
    italicContentOnSelectedBox: function (eventName){
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
            if (this.CONTENT_BOX_ARRAY[i].boxSelected && 
            		(this.CONTENT_BOX_ARRAY[i].contentBoxType==PresConstants.CONTENTBOX_TEXT_TYPE || 
            			this.CONTENT_BOX_ARRAY[i].contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE ||
            				this.CONTENT_BOX_ARRAY[i].contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE ||
            				this.CONTENT_BOX_ARRAY[i].contentBoxType==PresConstants.CONTENTBOX_GROUP_TYPE)) {//D14747 - added shapes
                    this.CONTENT_BOX_ARRAY[i].italicText();
            }
        }       
    },

    //
    // Apply underline style to text in a content box
    //
    underlineContentOnSelectedBox: function (eventName){
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
            if (this.CONTENT_BOX_ARRAY[i].boxSelected && 
            		(this.CONTENT_BOX_ARRAY[i].contentBoxType==PresConstants.CONTENTBOX_TEXT_TYPE || 
            			this.CONTENT_BOX_ARRAY[i].contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE ||
            				this.CONTENT_BOX_ARRAY[i].contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE ||
            				this.CONTENT_BOX_ARRAY[i].contentBoxType==PresConstants.CONTENTBOX_GROUP_TYPE)) {//D14747 - added shapes
                    this.CONTENT_BOX_ARRAY[i].underlineText();
            }
        }       
    },


    
    /*
     * Sets text alignment/direction on selected content box
     * 
     * Alignment/Direction Rules for Content Boxes:
     * - If the content box is a title and selected (regardless of if it's in edit mode),
     *   ALL "alignable" elements in the content box will get the specified alignment/direction.
     * - If NOT in edit mode (but the content box is selected), the specified alignment/direction will
     *   be applied to ALL "alignable" elements in the content box.
     * - If in edit mode, the specified alignment will be applied to all "alignable" elements
     *   within the editor's selected range.
     * - "Alignable" elements are P and LI elements.
     * 
     * Note that presentations doesn't currently enable the alignment buttons when not in
     * edit mode, so the scenarios in which a content box is selected but not in edit mode
     * shouldn't happen.
     */ 
    setContentStyleOnSelectedBox: function (eventName) {
      // internal function to find "alignable" elements based on the
      // specified node. this function is recursive (if the specified
      // node isn't "alignable").
    	//28334
    	PresCKUtil.runPending();
    	var editor;
      var findAlignableElements = function( /* CKEditor node */ node, /* array */ elements ) {
        elements = elements || [];
        if (!node)
          return elements;
        
        if (node.type == CKEDITOR.NODE_ELEMENT) {
          if (node.getName() == 'p' || node.getName() == 'li') {
            elements.push( node );
          } else {
            var children = node.getChildren();
            var count = children && children.count() || 0;
            for (var i = 0; i < count; i++) {
              findAlignableElements( children.getItem(i), elements );
            }
          }
        }
        return elements;
      };
      
        var bSetAlign = (eventName != 'presRightToLeft') && (eventName != 'presLeftToRight');
        for (var i = 0; i < this.CONTENT_BOX_ARRAY.length; i++) {
          var cb = this.CONTENT_BOX_ARRAY[i];
          var presentationClass = dojo.attr(cb.mainNode,'presentation_class'); //D15641
            if ((cb.boxSelected) && ((cb.contentBoxType == PresConstants.CONTENTBOX_TEXT_TYPE) || (cb.contentBoxType == PresConstants.CONTENTBOX_NOTES_TYPE) || (cb.contentBoxType==PresConstants.CONTENTBOX_GROUP_TYPE))) {
                var node = null;
                editor = cb.getEditor();
    			PresCKUtil.setPreSnapShot(editor);
                var clsName = cb.contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE ? '.draw_shape_classes' : '.draw_frame_classes';
                node = dojo.query(clsName, cb.contentBoxDataNode);              
                if (node.length > 0) {
                  var cbChildren = [];
                  // if we're in edit mode, iterate through
                  // the selected range
                  if (cb.editModeOn) {
                	var elem;
                	if (presentationClass!=null && presentationClass=='title'){//D4653 Conversion does not support different alignment of paragraphs...
                		//We are setting direction/alignment for all elements under the DFC  for title
                        var dfc = PresCKUtil.getDFCNode(editor);
                        for (var ii=0; ii<dfc.childNodes.length; ii++){
    	                	elem = dfc.childNodes[ii];
    	                	// since the element we found is in the editor doc,
    	                    // we need to find the canvas doc element instead
    	                	elem = dojo.query( '#' + elem.id, node[0] );
                    		if (elem && elem.length == 1){
                    			cbChildren.push( elem[0] );	
                    		}	                        
                        }                		                	
                	} else{                         
                		var range = editor.getSelection().getRanges()[0];
                		var iterator = range.createIterator();
                    
	                    while ( elem = iterator.getNextParagraph() ) {
	                      // since the element we found is in the editor doc,
	                      // we need to find the canvas doc element instead
	                      elem = dojo.query( '#' + elem.$.id, node[0] );
	                      if (elem && elem.length == 1)
	                        cbChildren.push( elem[0] );
	                    }                		
                	}
                  } else {
                    // if we're just selected (which isn't currently supported),
                    // then operate on all nodes within the content box
                    cbChildren = node[0].children;
                  }
                  
                  // for each of the nodes that we're operating on, find the
                  // appropriate "alignable" elements
                  var cbElements = [];
                  for (var j = 0; j < cbChildren.length; j++) {
                    cbElements = findAlignableElements( new CKEDITOR.dom.node( cbChildren[j] ), cbElements );
                  }
                  
                  // for each "alignable" element, track their attribute
                  // changes (for coedit msg later) so all changes can be
                  // undone / redone in a single operation
                  SYNCMSG.beginRecord();
                  if(cbElements) {
	                  for (var j = 0; j < cbElements.length; j++) {
	                    SYNCMSG.beginTrackAttributes( cbElements[j] );
	                    // when tracking attribute changes, we *must* use the 'setStyle'
	                    // function for the element and NOT the dojo.style function
	                    if(bSetAlign)
	                    	cbElements[j].setStyle( 'text-align', (eventName == 'presAlignLeft') ? 'left' : (eventName == 'presAlignCenter') ? 'center' : (eventName == 'presJustify') ? 'justify' : 'right' );
	                    else {
	                    	this._processElementDirection(cbElements[j], eventName);
	                    }
	                    // Defect 47785: number/bullet alignment doesn't follow text alignment in Safari
	                    if ( cbElements[j].is('li') && bSetAlign)
	                    {
	                    	// if left align, then defer to default 'list-style-position'; otherwise,
	                    	// set it to 'inside' for Safari
	                    	if (eventName == 'presAlignLeft')
	                    		cbElements[j].removeStyle( 'list-style-position' );
	                    	else
	                    		cbElements[j].setStyle( 'list-style-position', 'inside' );
	                    }
	                    // end tracking of attributes, which will send the
	                    // appropriate coedit msgs (which is why we have
	                    // calls to beginRecord above and endRecord below--
	                    // so they're sent in a single, atomic operation)
	                    SYNCMSG.endTrackAttributes( cbElements[j] );
	                  }
                  }
                  var msgs = SYNCMSG.endRecord();

                  PresCKUtil.setPostSnapShot(editor );  
                  if (msgs && msgs.length > 0){
//                	  this.chkPendingChangesForAll(); //D15831
                	  console.log('record align left message');
                      SYNCMSG.sendMessage(msgs);
                  }                  
                  // Now update CKEditor if it exists.
                  var cbEditor = cb.getEditor();
                    if (cbEditor) {
                        var node = dojo.query(clsName, cbEditor.document.getBody().$);
                        if (node.length > 0) {
                          var cbChildren = [];
                          // if we're in edit mode, iterate through
                          // the selected range
                          if (cb.editModeOn) {                           	  
                        	  if (presentationClass!=null && presentationClass=='title'){//D4653 Conversion does not support different alignment of paragraphs... 
                                  //We are setting direction/alignment for all elements under the DFC 
                                  var dfc = PresCKUtil.getDFCNode(cb.getEditor());
                                  var elem;
                                  for (var ii=0; ii<dfc.childNodes.length; ii++){
              	                	elem = dfc.childNodes[ii];
                          			cbChildren.push( elem );	
                                  }                                                      		  
                        	  } else{
                                  var range = cbEditor.getSelection().getRanges()[0];
                                  var iterator = range.createIterator();
                                  var elem;
                                  while ( elem = iterator.getNextParagraph() ) {
                                    cbChildren.push( elem.$ );
                                  }                        		  
                        	  }
                          } else {
                            // if we're just selected (which isn't currently supported),
                            // then operate on all nodes within the content box
                            cbChildren = node[0].children;
                          }
                 
                          // for each of the nodes that we're operating on, find the
                          // appropriate "alignable" elements
                          var cbElementsCK = [];
                          for (var k = 0; k < cbChildren.length; k++) {
                            cbElementsCK = findAlignableElements( new CKEDITOR.dom.node( cbChildren[k] ), cbElementsCK );
                          }
                          for (var k = 0; k < cbElementsCK.length; k++) {
                            if(bSetAlign){
                            	dojo.style(cbElementsCK[k].$, {
	                                'textAlign' : (eventName == 'presAlignLeft') ? 'left' : (eventName == 'presAlignCenter') ? 'center' : (eventName == 'presJustify') ? 'justify' : 'right'
                            	});
                            }
                            else {
                            	this._processElementDirection(cbElementsCK[k], eventName);
                            }
                            // Defect 47785: number/bullet alignment doesn't follow text alignment in Safari
                            if ( cbElementsCK[k].is('li') && bSetAlign )
                            {
                            	// if left align, then defer to default 'list-style-position'; otherwise,
                            	// set it to 'inside' for Safari
                            	if (eventName == 'presAlignLeft')
                            		dojo.style(cbElementsCK[k].$, { 'listStylePosition' : '' } );
                            	else
                            		dojo.style(cbElementsCK[k].$, { 'listStylePosition' : 'inside' } );
                            }
                          }
                        }
                        //D4498
                        //D16801: [Text][Regression] After setting alignment for empty textbox, user can't undo this operation by "ctrl+z"
                        //cbEditor.alignmentDef = (eventName=='presAlignLeft')? 'left': (eventName=='presAlignRight')? 'right': (eventName == 'presJustify') ? 'justify' : 'center' ; 		
                    }
                }
            } else if ((cb.boxSelected) && (cb.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE)) {
              // if we're in edit mode, iterate through
              // the selected ranges
              if (cb.editModeOn) {
                var cbChildren = [];
                editor = cb.getEditor();
                var ranges = editor.getSelection().getRanges();
                for (var k = 0; k < ranges.length; k++) {
                	var range = ranges[k];
                    var iterator = range.createIterator();
                    var elem;
                    while ( elem = iterator.getNextParagraph() ) {
                      // since the element we found is in the editor doc,
                      // we need to find the canvas doc element instead
                      elem = dojo.query( '#' + elem.$.id, editor.document.getBody().$ );
                      if (elem && elem.length == 1)
                        cbChildren.push( elem[0] );
                    }
                }
                
                // for each of the nodes that we're operating on, find the
                // appropriate "alignable" elements
                var cbElements = [];
                for (var j = 0; j < cbChildren.length; j++) {
                  cbElements = findAlignableElements( new CKEDITOR.dom.node( cbChildren[j] ), cbElements );
                }
                
                // for each "alignable" element, track their attribute
                // changes (for coedit msg later) so all changes can be
                // undone / redone in a single operation
                SYNCMSG.beginRecord();
                for (var j = 0; j < cbElements.length; j++) {
                  SYNCMSG.beginTrackAttributes( cbElements[j] );
                  // when tracking attribute changes, we *must* use the 'setStyle'
                  // function for the element and NOT the dojo.style function
                  if(bSetAlign) {
	                  cbElements[j].setStyle( 'text-align', (eventName == 'presAlignLeft') ? 'left' : (eventName == 'presAlignCenter') ? 'center' : (eventName == 'presJustify') ? 'justify' : 'right' );
	                  // Defect 47785: number/bullet alignment doesn't follow text alignment in Safari
	                  if ( cbElements[j].is('li') )
	                  {
	                	// if left align, then defer to default 'list-style-position'; otherwise,
	                	// set it to 'inside' for Safari
	                	if (eventName == 'presAlignLeft')
	                		cbElements[j].removeStyle( 'list-style-position' );
	                	else
	                		cbElements[j].setStyle( 'list-style-position', 'inside' );
	                  }
                  } else {
	                  this._processElementDirection(cbElements[j], eventName);
                  }
                  // end tracking of attributes, which will send the
                  // appropriate coedit msgs (which is why we have
                  // calls to beginRecord above and endRecord below--
                  // so they're sent in a single, atomic operation)
                  SYNCMSG.endTrackAttributes( cbElements[j] );
                }
                
                var msgs = SYNCMSG.endRecord();
                if (msgs && msgs.length > 0){
//                	this.chkPendingChangesForAll(); //D15831
                    SYNCMSG.sendMessage(msgs);
                }
              } else {
                // if we're just selected (which isn't currently supported),
                // then operate on all nodes within the selected cell
                // (which is what the published events below will do)
                if ( eventName == 'presAlignLeft' ) {
                    var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_leftAlignCellContent}];
                    window.concord.util.events.publish(window.concord.util.events.presMenubarEvents, eventData); 
                } else if ( eventName == 'presAlignCenter' ) {
                    var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_centerAlignCellContent}];
                    window.concord.util.events.publish(window.concord.util.events.presMenubarEvents, eventData); 
                } else if ( eventName == 'presAlignRight' ) {
                    var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_rightAlignCellContent}];
                    window.concord.util.events.publish(window.concord.util.events.presMenubarEvents, eventData); 
                }
              }
            }
        }
		PresCKUtil.setPreSnapShot(editor);
		PresCKUtil.adjustToolBarForList(editor);
    },
    
    _processElementDirection: function(node, eventName, enforce){
    	var bNewDirRtl = (eventName === 'presRightToLeft'), bOldDirRtl = (node.getStyle('direction') === 'rtl');
    	if(bNewDirRtl == bOldDirRtl && !enforce)
	    	return;

    	node.setStyle( 'direction', bNewDirRtl ? 'rtl' : 'ltr' );
    	node.setStyle( 'text-align', bNewDirRtl ? 'right' : 'left');
    	var marginLeft = node.getStyle('margin-right'), marginRight = node.getStyle('margin-left');
    	marginLeft ? node.setStyle('margin-left', marginLeft) : node.removeStyle('margin-left');
    	marginRight ? node.setStyle('margin-right', marginRight) : node.removeStyle('margin-right');   	
    },
    
    isVerticalAlignButtonEnabled: function(){
    	for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
            if (this.CONTENT_BOX_ARRAY[i].boxSelected &&
            	( this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_TEXT_TYPE ||
            		this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE ||
            		this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE )){
            	return true;
            }
    	}
    	return false;
    },
    
    getVerticalAlignOnSelectedBoxes: function(){
    	var currentAlignment = null;
    	var alignmentArray = [];
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
            if (this.CONTENT_BOX_ARRAY[i].boxSelected && 
            	( this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_TEXT_TYPE ||
            		this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE ||
            		this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE )){                    	
            	alignmentArray.push(this.CONTENT_BOX_ARRAY[i].getVerticalAlignment());
            } else if ( this.CONTENT_BOX_ARRAY[i].boxSelected){
            	return null;
            }
        }
		
        if ( alignmentArray.length > 0){
	        currentAlignment = alignmentArray[0];
	    	for ( var j = 0; j < alignmentArray.length; j++){
	    		if ( currentAlignment != alignmentArray[j]){
	    			currentAlignment = null;
	    			break;
	    		}
	    	}
        }
        return currentAlignment;
    },
    
    setVerticalAlignOnSelectedBoxes: function (data){ 
    	var verticalAlign = data.verticalAlign;
    	var msgPairList = [];
    	// Send one coediting message when set vertical align for multiple content box
    	var msgActs = [];
    	var currentVerticalAlign  = this.getVerticalAlignOnSelectedBoxes();
    	if (currentVerticalAlign && currentVerticalAlign == verticalAlign){
    		// if the current vertical alignment is the sanme as what we are setting it to then no-op
    		return;
    	}
    	for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
    		if ( this.CONTENT_BOX_ARRAY[i].boxSelected && this.CONTENT_BOX_ARRAY[i].isEditModeOn() && this.CONTENT_BOX_ARRAY[i].getEditor()) { 
    			var editor = this.CONTENT_BOX_ARRAY[i].getEditor();
    			if ( this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE){    				
    				var selectedCells = editor.getSelectedTableCells(editor);
    				PresCKUtil.setPreSnapShot(editor);
    				for (var j=0; j<selectedCells.length; j++){
    					dojo.style( selectedCells[j].$, 'verticalAlign', verticalAlign);
    				}
    				PresCKUtil.setPostSnapShot(editor );    			        
                    this.CONTENT_BOX_ARRAY[i].synchAllData(PresCKUtil.getDFCNode(editor), null, null, true);
    			} else if ( this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_TEXT_TYPE || 
                        this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE){
    				var dataAttr = {};
    				var dfcNodes = dojo.query('.draw_frame_classes, .draw_shape_classes',this.CONTENT_BOX_ARRAY[i].getEditor().document.getBody().$);
    				var dfcNode = dfcNodes[0];
                    dataAttr.id = dfcNode.id;
    				dataAttr.attributeName = 'style';
    				dataAttr.attributeValue ="vertical-align:" + verticalAlign + ";";  
                    var attrObj = SYNCMSG.getAttrValues(dataAttr, editor.document.$);
    				dojo.style( dfcNode, 'verticalAlign', verticalAlign);
    				msgPairList = SYNCMSG.createStyleMsgPair(dataAttr,attrObj,msgPairList);
    			}
    		} else if ( this.CONTENT_BOX_ARRAY[i].boxSelected){
    			if ( this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE){
    				var dataAttr = {};
					dojo.query('td , th', this.CONTENT_BOX_ARRAY[i].contentBoxDataNode).forEach(function(cell, index, arr){
						dataAttr.id = cell.id;
	    				dataAttr.attributeName = 'style';
	    				dataAttr.attributeValue ="vertical-align:" + verticalAlign + ";";  
	                    var attrObj = SYNCMSG.getAttrValues(dataAttr, window.document);
						dojo.style( cell, 'verticalAlign', verticalAlign);
						msgActs.push(SYNCMSG.createAttributeAct(dataAttr.id, attrObj.newAttrValue,
								attrObj.newStyleValue, attrObj.oldAttrValue, attrObj.oldStyleValue));
					});
    				if ( this.CONTENT_BOX_ARRAY[i].editor){
    					var tblInCk =  dojo.query('table',this.CONTENT_BOX_ARRAY[i].editor.document.$.body)[0];
    					dojo.query('td , th', tblInCk).forEach(function(cell, index, arr){
    						dojo.style( cell, 'verticalAlign', verticalAlign);
    					});
    				}
    			} else if ( this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_TEXT_TYPE || 
                        this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE){
    				var dataAttr = {};
    				var dfcNode = null;
    				var node = dojo.query('.draw_frame_classes, .draw_shape_classes',this.CONTENT_BOX_ARRAY[i].contentBoxDataNode);
                    if ( node.length > 0){
                    	dfcNode = node[0];
						dataAttr.id = dfcNode.id;
	    				dataAttr.attributeName = 'style';
	    				dataAttr.attributeValue ="vertical-align:" + verticalAlign + ";";  
	                    var attrObj = SYNCMSG.getAttrValues(dataAttr, window.document);
                    	dojo.style( dfcNode, 'verticalAlign', verticalAlign);
                    	msgActs.push(SYNCMSG.createAttributeAct(dataAttr.id, attrObj.newAttrValue,
                    			attrObj.newStyleValue, attrObj.oldAttrValue, attrObj.oldStyleValue));
                    }
    				if ( this.CONTENT_BOX_ARRAY[i].getEditor() && !this.GROUP_SINGLE_CK_MODE){
    					var nodes = dojo.query('.draw_frame_classes, .draw_shape_classes',this.CONTENT_BOX_ARRAY[i].getEditor().document.getBody().$);
    					if ( nodes.length > 0){
                        	dfcNode = nodes[0];
                        	dataAttr.id = dfcNode.id;
    	    				dataAttr.attributeName = 'style';
    	    				dataAttr.attributeValue ="vertical-align:" + verticalAlign + ";";
                        	var attrObj = SYNCMSG.getAttrValues(dataAttr,this.CONTENT_BOX_ARRAY[i].getEditor().document.$);
                        	dojo.style( dfcNode, 'verticalAlign', verticalAlign);
                        	msgActs.push(SYNCMSG.createAttributeAct(dataAttr.id, attrObj.newAttrValue,
                        		attrObj.newStyleValue, attrObj.oldAttrValue, attrObj.oldStyleValue));
    					}
    				}
    			}
    		}
    	}
    	var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_verticalAlignOptionOn, 'verticalAlign': verticalAlign }];
    	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
    	if (msgActs.length > 0 && msgPairList.length == 0)
            msgPairList = [SYNCMSG.createMessage(MSGUTIL.msgType.Attribute,msgActs)];
        if (msgPairList.length>0)
            SYNCMSG.sendMessage(msgPairList, SYNCMSG.SYNC_SORTER);
    },
    /**
     * Set shape fill or line color
     * @param node: the node conataining color attr
     * @param color: the color to be set
     * @param key: fill or stroke
     * @param oldAttrObj
     * @param newAttrObj
     */
    _setGroupLineFillColor: function(node, color, key, oldAttrObj, newAttrObj) {
        if (!node || !color || !key || !oldAttrObj || !newAttrObj) return;
        // If the value suffixed with "_upd", remove it
        // Or server will apply it to the ref place
        // But actually defs id is still not with the suffix
        // It is a temporary tag only for slide editor object
        // when client apply the message in coediting, refresh will called
        var oldColor = null, oldChanged = null, oldOpacity = null;
        oldColor = dojo.attr(node, key);
        oldColor = oldColor.replace('_upd', '');
        oldOpacity = dojo.attr(node, key + '-opacity');
        oldChanged = dojo.attr(node, 'data-' + key + '-chg');
        
        // Local change
        dojo.attr(node, key, color);
        if (oldOpacity) {
            var oldOpacityDouble = parseFloat(oldOpacity);
            if (oldOpacityDouble >= 0 && oldOpacityDouble < 1)
                node.removeAttribute(key + '-opacity');
        }
        // Add an attr to indicate line is change by editor
        // CL will convert pattern line as #FFFFFF
        // So we can simply convert color into solid line in CL
        // to preserve pattern line. So need a flag
        // Use html5 prefix "data-" to avoid browser filter it
        if (!oldChanged)
            dojo.attr(node, 'data-' + key + '-chg', '1');
        // Need delete orig node then insert new one
        // Or FF25 will not redraw when change from "none" line
        if (dojo.isFF <= 25 && oldColor == 'none') {
            var parentNode = node.parentNode;
            var cloneLineNode = node.cloneNode();
            dojo.destroy(node);
            parentNode.appendChild(cloneLineNode);
        }
        
        oldAttrObj[key] = oldColor;
        newAttrObj[key] = color;
        if (oldOpacityDouble != null && oldOpacityDouble !=undefined &&
            oldOpacityDouble >= 0 && oldOpacityDouble < 1) {
            oldAttrObj[key + '-opacity'] = oldOpacity;
            newAttrObj[key + '-opacity'] = '';
        }
        if (!oldChanged) {
            oldAttrObj['data-' + key + '-chg'] = '';
            newAttrObj['data-' + key + '-chg'] = '1';
        }
    },
    
    // Set border color for Docs created connector shapes
    _setConnectorLinesColor: function(line, borderColor, msgActs) {
        if (!line || !borderColor || !msgActs) return;
        // Create message acts
        var oldLineColor = dojo.style(line, "stroke");
        var oldLineChanged = dojo.attr(line, "data-stroke-chg");

        // Local change
        dojo.style(line, 'stroke', borderColor);
        // Add an attr to indicate line is change by editor
        // CL will convert pattern line as #FFFFFF
        // So we can simply convert color into solid line in CL
        // to preserve pattern line. So need a flag
        // Use html5 prefix "data-" to avoid browser filter it
        if (!oldLineChanged)
            dojo.attr(line, 'data-stroke-chg', '1');
        
        var lineId = line.id;
        
        // Need delete orig node then insert new one
        // Or FF25 will not redraw when change from "none" line
        if (dojo.isFF <= 25 && oldLineColor == 'none') {
            var parentNode = line.parentNode;
            var cloneLineNode = line.cloneNode();
            dojo.destroy(line);
            parentNode.appendChild(cloneLineNode);
        }
        
        // Create "a" message acts
        var act = null;
        var oldStyleObj = {};
        var newStyleObj = {};
        oldStyleObj['stroke'] = oldLineColor;
        newStyleObj['stroke'] = borderColor;
        if (!oldLineChanged) {
            oldStyleObj['data-stroke-chg'] = '';
            newStyleObj['data-stroke-chg'] = '1';
        }
        
        act = SYNCMSG.createAttributeAct(lineId, null, newStyleObj,  null, oldStyleObj);
        if (act) msgActs.push(act);
    },
    
    _setBorderColorOnSelectedShape: function(contentBox, borderColor, msgActs) {
        if (!contentBox || !borderColor || !msgActs) return;
        // Imported shapes or new created shapes except for connector shapes
        var nodeLineGrp = dojo.query('g[groupfor="line"]',contentBox.contentBoxDataNode);
        if (nodeLineGrp.length > 0){
            nodeLineGrp = nodeLineGrp[0];
            var lines = nodeLineGrp.childNodes;
            for (var i = 0, len = lines.length; i < len; i++) {
                var line = lines[i];
                var oldAttrObj = {}, newAttrObj = {};
                this._setGroupLineFillColor(line, borderColor, 'stroke', oldAttrObj, newAttrObj);
                var act = SYNCMSG.createAttributeAct(line.id, newAttrObj, null, oldAttrObj, null);
                if (act) msgActs.push(act);
            }
        }
        var arrowLineGrp = dojo.query('g[groupfor="arrow"]',contentBox.contentBoxDataNode);
        if (arrowLineGrp.length > 0){
            arrowLineGrp = arrowLineGrp[0];
            var alines = arrowLineGrp.childNodes;
            for (var i = 0, len = alines.length; i < len; i++) {
                var aline = alines[i];
                var oldAttrObj = {}, newAttrObj = {};
                var flag = PresCKUtil.checkArrowColorChange(aline);
                if (flag == true)
                    this._setGroupLineFillColor(aline, borderColor, 'fill', oldAttrObj, newAttrObj);
                else if (flag == false)
                    this._setGroupLineFillColor(aline, borderColor, 'stroke', oldAttrObj, newAttrObj);
                var act = SYNCMSG.createAttributeAct(aline.id, newAttrObj, null, oldAttrObj, null);
                if (act) msgActs.push(act);
            }
        }
        
        // Docs created connector shapes
        var clines = dojo.query('line',contentBox.contentBoxDataNode);
        for (var i = 0, len = clines.length; i < len; i++) {
            var cline = clines[i];
            this._setConnectorLinesColor(cline, borderColor, msgActs);
        }
    },
    
    setBorderColorOnSelectedBox: function (data){
        var borderColor = (data.color==null)? 'transparent':data.color;
        var msgActs = [];
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++) {
            var box = this.CONTENT_BOX_ARRAY[i];
            if (box.boxSelected && PresCKUtil.isPPTXShape(box.mainNode)) {
                this._setBorderColorOnSelectedShape(this.CONTENT_BOX_ARRAY[i], borderColor, msgActs);
            }
        }
        if (msgActs.length > 0)
            var msgPairList = [SYNCMSG.createMessage(MSGUTIL.msgType.Attribute, msgActs)];
        if (msgPairList.length > 0)
            SYNCMSG.sendMessage(msgPairList, SYNCMSG.SYNC_SORTER);
    },
    
    _setBGColorOnSelectedShape: function(contentBox, bgColor, msgActs) {
        if (!contentBox || !bgColor || !msgActs)
            return;
        // Path gradient fill will use circle
        // For image tag in old draft, do nothing for it
        var nodeRect = dojo.query('rect,circle',contentBox.contentBoxDataNode);
        if (nodeRect.length > 0){
            var svgRect = nodeRect[0];
            
            // Create message acts
            var oldFillColor = dojo.attr(svgRect, "fill");
            // If the value suffixed with "_upd", remove it
            // Or server will apply it to the ref place
            // But actually defs id is still not with the suffix
            // It is a temporary tag only for slide editor object
            // when client apply the message in coediting, refresh will called
            oldFillColor = oldFillColor.replace('_upd', '');

            var oldFillChanged = dojo.attr(svgRect, "data-fill-chg");
            var oldFillOpacity = dojo.attr(svgRect, "fill-opacity");
            // Local change
            dojo.attr(svgRect, 'fill', bgColor);
            if (oldFillOpacity) {
                var oldFillOpacityDouble = parseFloat(oldFillOpacity);
                if (oldFillOpacityDouble >= 0 && oldFillOpacityDouble < 1)
                    svgRect.removeAttribute('fill-opacity');
            }
            // Add an attr to indicate fill is change by editor
            // CL will convert pattern fill as #FFFFFF
            // So we can simply convert color into solid fill in CL
            // to preserve pattern fill. So need a flag
            // Use html5 prefix "data-" to avoid browser filter it
            if (!oldFillChanged)
                dojo.attr(svgRect, 'data-fill-chg', '1');
            
            var rectId = svgRect.id;
            
            // Need delete orig node then insert new one
            // Or FF25 will not redraw when change from "none" fill
            if (dojo.isFF <= 25 && oldFillColor == 'none') {
                var parentNode = svgRect.parentNode;
                var cloneSvgRectNode = svgRect.cloneNode();
                dojo.destroy(svgRect);
                parentNode.appendChild(cloneSvgRectNode);
            }
            
            // Create "a" message acts
            var act = null;
            var oldAttrObj = {};
            var newAttrObj = {};
            oldAttrObj['fill'] = oldFillColor;
            newAttrObj['fill'] = bgColor;
            if (oldFillOpacityDouble >= 0 && oldFillOpacityDouble < 1) {
                oldAttrObj['fill-opacity'] = oldFillOpacity;
                newAttrObj['fill-opacity'] = '';
            }
            if (!oldFillChanged) {
                oldAttrObj['data-fill-chg'] = '';
                newAttrObj['data-fill-chg'] = '1';
            }
            
            act = SYNCMSG.createAttributeAct(rectId, newAttrObj,
                null, oldAttrObj, null);
            if (act) msgActs.push(act);
            
        }
    },
    //
    // Sets background color selected content box
    //  
    setBGColorOnSelectedBox: function (data){       
        var bgColor = (data.color==null)? 'transparent':data.color; //JMT D41594
        var msgPairList = [];
        // Send one coediting message when set background color for multiple content box
        var msgActs = [];
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
            
            
            if ((this.CONTENT_BOX_ARRAY[i].boxSelected) && 
            		(this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_TEXT_TYPE || 
                     this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_NOTES_TYPE || 
                     this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE ||
                     (this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE &&
                     dojo.hasClass( this.CONTENT_BOX_ARRAY[i].mainNode, 'shape_svg' ) &&
                     PresCKUtil.isFillPermittedType(dojo.attr(this.CONTENT_BOX_ARRAY[i].mainNode, 'draw_type'))))) {
                
                // add color in textbox edit mode
                if (this.CONTENT_BOX_ARRAY[i].editModeOn && this.CONTENT_BOX_ARRAY[i].editor && 
                		(this.CONTENT_BOX_ARRAY[i].editor.getSelection() != null && 
                	     this.CONTENT_BOX_ARRAY[i].editor.getSelection().getRanges()[0] != undefined)) {
                    var editor = this.CONTENT_BOX_ARRAY[i].editor;
                    var selection = editor.getSelection();
                    //var range = selection.getRanges()[0];
                    var selectedElm = selection.getStartElement();
                    var table = selectedElm.getAscendant('table',true);
                    if(table && table.hasClass('smartTable')){
                    	PresCKUtil.setPreSnapShot(editor);
                        var selectedCells = editor.getSelectedTableCells(editor); //TODO getSelectedTableCells has issues in chrome when the range endContainer is P of the next cell with offset 0
                        for (var j=0; j<selectedCells.length; j++){
                            var dataAttr ={};
                            dataAttr.attributeName = 'style';
                            dataAttr.attributeValue ="background-color:"+bgColor+";";
                            dataAttr.id = selectedCells[j].getId();
                            var attrObj = SYNCMSG.getAttrValues(dataAttr,this.CONTENT_BOX_ARRAY[i].editor.document.$);
                            var previousColor = CKEDITOR.env.ie ? selectedCells[j].$.style.getAttribute('background-color') : selectedCells[j].$.style.getPropertyValue('background-color');
                            if ( previousColor){
                            	attrObj.oldStyleValue = 'background-color: ' + previousColor + '; ';
                            } else {
                            	attrObj.oldStyleValue = ' ';
                            }
                            //Override background image if necessary
                            selectedCells[j].setStyle('background-color',bgColor);
                           	var cs = dojo.getComputedStyle(selectedCells[j]);
                    		if (cs.backgroundImage != "none") {
                    			selectedCells[j].setStyle('background-image','none');
                    		}
                            if (bgColor == 'transparent') {
                            	selectedCells[j].setAttribute('docsBackgroundFill', 'false');
                            } else {
                            	selectedCells[j].setAttribute('docsBackgroundFill', 'true');                            	
                            }
                        }
                        PresCKUtil.setPostSnapShot(editor );    			        
                        this.CONTENT_BOX_ARRAY[i].synchAllData(PresCKUtil.getDFCNode(editor), null, null, true);
                    } else if (this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE &&
                        dojo.hasClass( this.CONTENT_BOX_ARRAY[i].mainNode, 'shape_svg' ) &&
                        PresCKUtil.isFillPermittedType(dojo.attr(this.CONTENT_BOX_ARRAY[i].mainNode, 'draw_type'))) {
                        this._setBGColorOnSelectedShape(this.CONTENT_BOX_ARRAY[i], bgColor, msgActs);
                    }else{
                        var node = dojo.query('.draw_frame_classes',this.CONTENT_BOX_ARRAY[i].editor.document.getBody().$); 
                        if (node.length>0){
                            var drawFrameClassesNodeCK = node[0];
                            var dataAttr ={};
                            dataAttr.attributeName = 'style';
                            
                           	//check if we need to override background image
                           	var overRideDfcCkBackGroundImage = false;
                           	var cs = dojo.getComputedStyle(drawFrameClassesNodeCK);
                    		if (cs.backgroundImage != "none") {
                        		overRideDfcCkBackGroundImage = true;
                    		}
                            
                            // Check if background is defined then retrieve that value.
                            // If background is not defined then grab background-color.
                            for(var k = 0; k < drawFrameClassesNodeCK.style.length; k++) {
                            	if (drawFrameClassesNodeCK.style[k] == "background") {
    		                        dataAttr.attributeValue ="background:"+bgColor+";";
    		                        break;
                            	}                        	
                            }    
                            if(!dataAttr.attributeValue)
                            	dataAttr.attributeValue ="background-color:"+bgColor+";";
                            	
                            if(overRideDfcCkBackGroundImage) {
                            	dataAttr.attributeValue +="background-image:none;";
                            }
                            	
                            dataAttr.id = drawFrameClassesNodeCK.id;
                            var attrObj = SYNCMSG.getAttrValues(dataAttr,this.CONTENT_BOX_ARRAY[i].editor.document.$);
                            dojo.style(drawFrameClassesNodeCK,'backgroundColor', bgColor);
                            if(overRideDfcCkBackGroundImage) {
                            	dojo.style(drawFrameClassesNodeCK,'backgroundImage', 'none');
                            }
                            msgPairList = SYNCMSG.createStyleMsgPair(dataAttr,attrObj,msgPairList);
                            
                            if (dojo.isWebKit) {
                            	var drawFrameClassesNode = dojo.query('.draw_frame_classes',this.CONTENT_BOX_ARRAY[i].contentBoxDataNode)[0];
                            	if (drawFrameClassesNode) {
                            		dojo.style(drawFrameClassesNode,'backgroundColor', bgColor);
                            		if(overRideDfcCkBackGroundImage) {
                            			dojo.style(drawFrameClassesNode,'backgroundImage', 'none');
                            		}
                            	}
                            }
                        }
                    }
                }  //fix for 21617[Textbox][IE9] The background fill for default text box does not sync to slide editor when set it in non-edit mode
                // If this else is commented, three same msgs will be sent
                // when seting background in edit mode. Have verified 21617
                // no issue even if this else is uncommented.
                else { // add color in textbox view mode                    
                    if (this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE &&
                            dojo.hasClass( this.CONTENT_BOX_ARRAY[i].mainNode, 'shape_svg' ) &&
                            PresCKUtil.isFillPermittedType(dojo.attr(this.CONTENT_BOX_ARRAY[i].mainNode, 'draw_type'))) {
                        this._setBGColorOnSelectedShape(this.CONTENT_BOX_ARRAY[i], bgColor, msgActs);
                    } else {
                        var overRideDfcBackGroundImage = false;

                        var node = dojo.query('.draw_frame_classes',this.CONTENT_BOX_ARRAY[i].contentBoxDataNode);
                        if (node.length>0){
                            var drawFrameClassesNode = node[0];                        
                            var dataAttr ={};
                            dataAttr.attributeName = 'style';

                            //check if we need to override background image
                            var cs = dojo.getComputedStyle(drawFrameClassesNode);
                            overRideDfcBackGroundImage = (cs.backgroundImage != "none");

                            // Check if background is defined then retrieve that value.
                            // If background is not defined then grab background-color.
                            for(var k = 0; k < drawFrameClassesNode.style.length; k++) {
                                if (drawFrameClassesNode.style[k] == "background") {
                                    dataAttr.attributeValue ="background:"+bgColor+";";
                                    break;
                                }
                            }
                            if(!dataAttr.attributeValue)
                                dataAttr.attributeValue ="background-color:"+bgColor+";";

                            if(overRideDfcBackGroundImage) {
                                dataAttr.attributeValue +="background-image:none;";
                            }

                            dataAttr.id = drawFrameClassesNode.id;

                            var attrObj = SYNCMSG.getAttrValues(dataAttr,window.document);
                            dojo.style(drawFrameClassesNode,'backgroundColor', bgColor);

                            /*var style = dojo.style(draframeClassesNode, 'background');
                            if (style != null && style.indexOf('transparent') != -1) {
                                style = style.replace(/transparent/gi, '');
                                dojo.style(draframeClassesNode, 'background', style);
                            }*/
                            if(overRideDfcBackGroundImage) {
                                dojo.style(drawFrameClassesNode,'backgroundImage', 'none');
                            }
                            msgActs.push(SYNCMSG.createAttributeAct(dataAttr.id, attrObj.newAttrValue,
                                attrObj.newStyleValue, attrObj.oldAttrValue, attrObj.oldStyleValue));
                        }
                        //if the textbox was previously edited in this session and the editor instance is still there,
                        // update the editor instance as well. 
                        if(this.CONTENT_BOX_ARRAY[i].editor != undefined){
                            node = dojo.query('.draw_frame_classes',this.CONTENT_BOX_ARRAY[i].editor.document.getBody().$); 
                            if (node.length>0){
                                var drawFrameClassesNodeCK = node[0];
                                var dataAttr ={};
                                dataAttr.attributeName = 'style';
                                dataAttr.attributeValue ="background-color:"+bgColor+";";
                                if(overRideDfcBackGroundImage) {
                                    dataAttr.attributeValue +="background-image:none;";
                                }
                                dataAttr.id = drawFrameClassesNodeCK.id;
                                var attrObj = SYNCMSG.getAttrValues(dataAttr,this.CONTENT_BOX_ARRAY[i].editor.document.$);
                                dojo.style(drawFrameClassesNodeCK,'backgroundColor', bgColor);
                                if(overRideDfcBackGroundImage) {
                                    dojo.style(drawFrameClassesNodeCK,'backgroundImage', 'none');
                                }
                                msgActs.push(SYNCMSG.createAttributeAct(dataAttr.id, attrObj.newAttrValue,
                                    attrObj.newStyleValue, attrObj.oldAttrValue, attrObj.oldStyleValue));
                            }
                        }
                    }
                }
            }
        }
        //send coedit message
        if (msgActs.length > 0 && msgPairList.length == 0)
            msgPairList = [SYNCMSG.createMessage(MSGUTIL.msgType.Attribute,msgActs)];
        
        if (msgPairList.length>0)
            SYNCMSG.sendMessage(msgPairList, SYNCMSG.SYNC_SORTER);
    },
 
    //
    // Verifies if a placeholder is selected to disable copy/cut from main menu
    // Only disable if all boxselected are placeHolders
    //
    chkIfPlaceHolderSelected: function(disableCopyCutMenu){
    	var placeHolderCount=0;
    	var boxSelectedCount=0;
    	var allPlaceHolders = false;
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
        	if (this.CONTENT_BOX_ARRAY[i].boxSelected){
        		boxSelectedCount++;
        	}
        	if ((this.CONTENT_BOX_ARRAY[i].boxSelected) && dojo.hasClass(this.CONTENT_BOX_ARRAY[i].mainNode,PresConstants.LAYOUT_CLASS)){        	
        		placeHolderCount++;
            }
        }               
        if (placeHolderCount==boxSelectedCount){
        	allPlaceHolders = true;
        	if(disableCopyCutMenu){
        		var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_disableCopyCutMenuItems}];
        		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
        	}
        }
        return  allPlaceHolders;
    },     
       
    
    //
    // cleanSlideEditor
    //
     cleanSlideEditor: function(destroyNotes){
        this.unloadCurrentSlide(destroyNotes);
        this.CONTENT_BOX_ARRAY = [];
        if (this.editorShadow)
            this.editorShadow.destroy(); 
        this.cleanUpConnections();
    },

    //
    //
    //
    cleanUpConnections: function(){
        //1: Remove event connection
        for(var i=0; i<this.connectArray.length; i++){
             dojo.disconnect(this.connectArray[i]);
        }

        for(var i=0; i<this.connectArray.length; i++){
            if (this.connectArray[i][0]) {
            	dojo.destroy(this.connectArray[i][0]);
            	this.connectArray[i][0] = null;
            }
            this.connectArray[i] = null;
        }           
        
        this.connectArray = [];      
    },
    
    //
    // Returns a string indicating the ODP family of the node passed in. Outputs text,graphic or table  
    //
    getFamily: function(node){
        var presentationClass = dojo.attr(node, "presentation_class");
        var dataNode = node.children[0];
        //
        // dataNode can contain the following class: draw_text-box,
        //

        //The order of this IF statement is important.  
        //We have to check for BACKGROUND objects before anything else to ensure we DO NOT widgetize.
        if ((presentationClass== 'outline') ||
            (presentationClass== 'title') ||
            (presentationClass== 'subtitle')) {
        	return 'text';
		} else if (dojo.attr(node,'draw_layer')==this.BACKGROUND_OBJECTS){
        	return null;
        } else if ((presentationClass == 'graphic') || ((dataNode) && (dojo.hasClass(dataNode, 'draw_image')))) {
        	return 'graphic';
        } else if  ((presentationClass== 'date-time') ||
                (presentationClass== 'footer') ||
                (presentationClass== 'page-number')){ 
        	return null;   
        } else if (presentationClass== 'notes') {
        	return 'notes';        
        } else if ((dataNode) && (dataNode.tagName.toLowerCase()=='table')) {  // table
        	return 'table';        
        } else if ((presentationClass== 'group')) {
            return 'group';
        } else if ((((dataNode) && (dojo.hasClass(dataNode, 'draw_text-box') || dojo.attr(dataNode,'odf_element')=='draw_text-box')))){   
        	return 'text';
        } else if (presentationClass== 'shape_svg') {
            return 'shape_svg';
        }else {
            //console.log("SlideEditor cannot determine ODP drawFrame family type");
            return;         
        }
    },

    //
    // when widgitizing a node we may want to find out wich child node will be the content box data node
    //
    findContentDataNode: function(node){
        //Let's see if contentBoxDataNode not already specified
        var dataNode = dojo.query('.contentBoxDataNode',node);
        if (dataNode.length>0){
            return dataNode[0];
        }
        //contentBoxDataNode is ususally the node with  draw_image class if a graphic family
        dataNode = dojo.query('.draw_image',node);
        if (dataNode.length>0){
            return dataNode[0];
        }
        //contentBoxDataNode is ususally the node with  draw_text-box class if a text family
        dataNode = dojo.query('.draw_text-box',node);
        
        //make sure the correct dataNode is used for a notes content box
        if (dojo.attr(node, "presentation_class") == "notes") {
        	var notesDrawText = null;
        	dojo.query(".draw_text-box",node).forEach(function(node, index, arr){
        		if (dojo.attr(node.parentNode,"presentation_class") == "notes") {
    			 	notesDrawText = node;
    			}
    		});
    		if (notesDrawText) {
    			return notesDrawText;
    		}
        }
        
        if (dataNode.length>0){
            return dataNode[0];
        } else {
            //console.log("SlideEditor: findContentDataNode: Cannot find suitable contentBoxDataNode candidate for node id "+node.id);
            return node.children[0];            
        }
    },
    
    //
    // Creates contentBox objects out of draw_frame elements
    //
    widgitizeContent: function(node,publish,selectBox,createSpare){
    	//console.log("widgitizing Content..");
        var boxCandidateArray = (node)? [node]: dojo.query('.draw_frame',this.mainNode);
        
        for (var i=0; i<boxCandidateArray.length; i++){
            var objDom = boxCandidateArray[i];
            if (dojo.hasClass(objDom,'isSpare')&& !createSpare){ //if createSpare is false but the drawframe class has isSpare then we are processing a spare that is already widgitized but waiting for makeReal to occur. Do not widgitize again
            	continue;
            }
            // Let's determined if it is a text box or image or table
            //TODO: Need to finetune how this function recognizes the various types. May need to get children to
            // determine family.
            //var contentObj = null;
            var family = this.getFamily(objDom);
            //6042, we separate the actual widgitize code just in case we need to break down each widgitize process into different set timeout for performance increase
            if(objDom!=null){
            	var objDomId = objDom.id;
                var contentObj = this.continueWidgitizeContent(createSpare, publish, selectBox, family, objDom, node);
                
            }
        }
        if(i > 0){
            console.log("widgitizing done");
            dojo.attr(this.mainNode, "isWidgitized", true);
            //window.pe.scene.hideErrorMessage();
            if (!window.pe.scene.slideSorter.currentInPaste)
            	this.hidePreparingSlideMsg();
        }
        return contentObj;
    },

    continueWidgitizeContent: function(createSpare, publish, selectBox, family, objDom, node){
	    //console.log("widgitizingComponent family:"+ family + "slideId:"+ this.mainNode.id);
	    //console.log("inside widgitizingComponent i:"+i+" length:"+boxCandidateArray.length);
	    var contentObj = null;
	    var opts = {'CKEDITOR':window.CKEDITOR,
                'CKToolbarSharedSpace': this.CKToolbarSharedSpace,
                'mainNode':objDom,
                'contentBoxDataNode':objDom.children[0],
                'parentContainerNode':this.mainNode,
                'contentBoxType': null,
                'deSelectAll':dojo.hitch(this,this.deSelectAll),
                'deSelectAllButMe':dojo.hitch(this,this.deSelectAllButMe),
                'initialPositionSize':{'left':objDom.style.left,'top':objDom.style.top,'width':objDom.style.width,'height':objDom.style.height},
                'isSpare':createSpare,
                'isMultipleBoxSelected':dojo.hitch(this,this.isMultipleBoxSelected),
                'publishSlideChanged':dojo.hitch(this,this.publishSlideChanged),
                'getzIndexCtr':dojo.hitch(this,this.getzIndexCtr),  
                'setzIndexCtr':dojo.hitch(this,this.setzIndexCtr),
                'toggleBringToFront':dojo.hitch(this,this.toggleBringToFront),
                'toggleSendToBack':dojo.hitch(this,this.toggleSendToBack),                  
                'openAddNewImageDialog': dojo.hitch(this,this.openAddNewImageDialog),
                'deRegisterContentBox' : dojo.hitch(this,this.deRegisterContentBox),
                'getActiveDesignTemplate' : dojo.hitch(this,this.getActiveDesignTemplate),
                'deleteSelectedContentBoxes' : dojo.hitch(this,this.deleteSelectedContentBoxes),
                'pasteSelectedContentBoxes'  : dojo.hitch(this,this.pasteSelectedItems),
                'copySelectedContentBoxes'   : dojo.hitch(this,this.copySelectedItems),                 
                'createIndicatorSytle':dojo.hitch(this,this.createIndicatorSytle),
                'getInLineStyles':dojo.hitch(this,this.getInLineStyles),
                'getMasterTemplateInfo' : dojo.hitch(this,this.getMasterTemplateInfo),
                'checkBoxPosition' : dojo.hitch(this,this.checkBoxPosition),
                'addImageContentBox': dojo.hitch(this,this.addImageContentBox),
                'handleMultiBoxSelected':dojo.hitch(this, this.handleMultiBoxSelected)};
	    
	    if (family == 'graphic') {
            opts.contentBoxType = PresConstants.CONTENTBOX_IMAGE_TYPE;
            opts.contentBoxDataNode = this.findContentDataNode(objDom);
	        opts.isSpare = false;
	        contentObj = new concord.widgets.imgContentBox(opts); 
	    } else if (family =='notes') {
            opts.contentBoxType = PresConstants.CONTENTBOX_NOTES_TYPE;
            opts.contentBoxDataNode = this.findContentDataNode(objDom);
            contentObj = new concord.widgets.notesContentBox(opts); 
	    } else if (family =='text') {                   
            opts.contentBoxType = PresConstants.CONTENTBOX_TEXT_TYPE;
            opts.contentBoxDataNode = this.findContentDataNode(objDom);
            contentObj = new concord.widgets.txtContentBox(opts); 
            //D38363: [B2B][Regression]Paste paragraphs in view mode, textbox height can't fit the paragraphs' height
    	    contentObj.updateMainNodeHeightBasedOnDataContent();
	    }else if (family =='table'){
            opts.contentBoxType = PresConstants.CONTENTBOX_TABLE_TYPE;
            opts.isSpare = false;
            contentObj = new concord.widgets.tblContentBox(opts);
            //D28955: [Merged]Table draw frame and table height don't have same height
    	    contentObj.updateMainNodeHeightBasedOnDataContent();
	    } else if (family =='group') {
            opts.contentBoxType = PresConstants.CONTENTBOX_GROUP_TYPE;
            opts.contentBoxDataNode = this.findContentDataNode(objDom);
            opts.isBoxShape = dojo.attr(opts.contentBoxDataNode.parentNode, "ungroupable") == "yes" ? true : false;
            opts.initialPositionSize.position = objDom.style.position;
            opts.isSpare = false;
            opts.addImageContentBox = null;
            contentObj = new concord.widgets.grpContentBox(opts);
            if(contentObj.isUnSupportCotent()){
            	contentObj.destroyContentBox(true);
            	return;
            }
	    } else if (family =='shape_svg') {
	        opts.contentBoxType = PresConstants.CONTENTBOX_SHAPE_TYPE;
	        opts.initialPositionSize.position = objDom.style.position;
	        opts.isSpare = false;
	        var drawType = dojo.attr(objDom, 'draw_type');
	        if (PresCKUtil.connectorShapeTypes[drawType] == 1)
	            contentObj = new concord.widgets.connectorShapeContentBox(opts);
	    }
	    
	    if (createSpare){
	    	if(family =='group'){
	    		this.groupSpareBox = contentObj;
	    		this.groupSpareBox.hide();
	    	}
	    	else if(family =='table'){
	    		this.tableSpareBox = contentObj;
	    		this.tableSpareBox.hide();
	    	}else
	    	{
	    		this.spareBox = contentObj;
	    		this.spareBox.hide();
	    	}
	    }         
	    else{
	        this.registerContentBox(contentObj);
	    }
	    
	    if (node){
	        dojo.style(node,{'visibility':''});
	        //for defect 26859, we need check the content object is not a spare object,
	        // and then to select it ot not.
	        if(selectBox && !createSpare ) contentObj.selectThisBox();
	    }
	    
	    if (publish){
	    	if (this.SINGLE_CK_MODE){
				//19864 make sure to add to undo if creating an svg shape
	    		if (this.createPackageOnClick.createNewContentBox && !dojo.hasClass(contentObj.mainNode,"shape_svg")){ //we creating a text box
		    		var addToUndo = false;
	                var park = true;
	                if(family =='group'){
	                	if(this.groupSpareBox!=null && this.groupSpareBox.txtContent!=null && this.groupSpareBox.txtContent.editor!=null){
	                		contentObj.publishInsertNodeFrame(null,addToUndo,park,this.groupSpareBox.txtContent.editor.name);
	                	}                	
	                }
	                else{
	                	contentObj.publishInsertNodeFrame(null,addToUndo,park,this.spareBox.editor.name);
	                }    			
	    		}else{
	    			//Don't copy node to sorter here
                	if(family == 'table'){
                		return contentObj;
                	}
	    			var addToUndo = true;
	    			contentObj.publishInsertNodeFrame(null,addToUndo); //only add to undo if not creating a new text box
	    			if(family == 'group')
	    				return contentObj;
	    		}
	    	}else {
	    		contentObj.publishInsertNodeFrame();
	    	}	        	    
	    }
    },
    
    
    //
    // get Applied Template
    //
    getActiveDesignTemplate: function(){
        return this.activeDesignTemplate;
    },
        
    //
    // Inject CSS file in main Document
    //
    injectCSS: function(cssFileName, loadFromAttachment){
        concord.util.uri.injectCSS(window.document,cssFileName,loadFromAttachment);
    },
    
    //Remove CSS file in main Document
    removeCSS:  function(cssFileName){
        concord.util.uri.removeCSS(window.document,cssFileName);
    },
    
    //
    // Inject CSS file in main Document
    //
    injectCssStyle: function(cssFileName, loadFromAttachment){
        var styleNode = concord.util.uri.injectCssStyle(window.document,cssFileName,loadFromAttachment);
        return styleNode;
    },         
    
    //
    // quickly loads in slide editor
    //
    quickLoadInSlideEditor: function(slideDom, isWidgitizeImmediately, fromAction){
        if (!slideDom) { return; }
        console.info("!!! load slide to Editor !!!");
        !window.pe.scene.keepCommentStatus && window.pe.scene.hideComments();
        pe.scene.disableCommentButton(true);
        var now = (new Date()).getTime();

    	if (this.lastSlideSelected) {
    		var diff = now - this.lastSlideSelected;
    		
    		if(diff <this.WIDGITIZE_TIMER && this.slideSelectedTimeOut!=null) {
    			clearTimeout(this.slideSelectedTimeOut);
    			this.slideSelectedTimeOut = null;
    		}
    	}
		this.lastSlideSelected = now;
        
        this.loadingNewSlide = true;
        this.cleanSlideEditor(true); 
        
        //D28052: Image fill Slide background in thumbnail is not correct
        dojo.removeClass(this.mainNode);
        var drawPageLoadedClasses = slideDom.className;
        this.mainNode.className ='slideEditor';
        dojo.addClass(this.mainNode,drawPageLoadedClasses);
        //for defect 25813, we need add draw_style-name to class, or which will lost.
//        if(drawPageLoadedClassesDrawStyleName != null)
//        	dojo.addClass(this.mainNode,drawPageLoadedClassesDrawStyleName); 
        
        //Destroy all children of mainNode
        for (var i=0; i< this.mainNode.children.length;i++){
            var nodeChild = this.mainNode.children[i];
            if (!dojo.hasClass(nodeChild,'isSpare') && (dojo.attr(nodeChild,'presentation_class') != 'notes' && !dojo.hasClass(nodeChild,'presentation_notes'))){ // Do not destroy spare
            	dojo.destroy(this.mainNode.children[i]);
            	i=i-1;
            }else if(dojo.attr(nodeChild,'presentation_class') == 'notes' || dojo.hasClass(nodeChild,'presentation_notes')){
    			if (!this.tempRefToLastNotesNode)
    				this.tempRefToLastNotesNode = [];
            	this.tempRefToLastNotesNode.push(nodeChild); 
            }
        }       
        this.editorShadow = new dojox.fx.Shadow({ node:this.mainNode, shadowThickness: 10, shodowOffset:10});            
        this.editorShadow.startup(); 
  	    dojo.query(".shadowPiece", this.mainNode).forEach(function(node, index, array){
		    //console.log(node);
			dojo.attr(node,'alt','');
  	    });
	       
  	    
  	   //D42166: [Migration]List symbol size change small after migrate from 1.0.5.1->1,.0.6, list line not edit on 1.0.5.1 
  	  try{
	  	  var start = new Date().getTime();
	  	  var skipForMobile = concord.util.browser.isMobile();// && concord.util.mobileUtil.disablePresEditing;
	  	  if(!skipForMobile){
		  	    var needUpdateLiList = [];
		  	    var needUpdateLiStyle = false;
			    dojo.forEach(
	 	            dojo.query( 'li', slideDom),
	 	            function( item ) {
	 	            	var oldlistBeforeCss = PresListUtil.getListBeforeClass(item,true);
	 	            	if(oldlistBeforeCss.length == 0){
	 	            		needUpdateLiList.push(item);
	 	            	} else {
	 	            		if(!pe.scene.slideSorter.listBeforeStyleStack[oldlistBeforeCss]);
	 	            			needUpdateLiList.push(item);
	 	            	}
	            });
	  	    	if(needUpdateLiList.length >0){
	  	    		needUpdateLiStyle = true;
	  	    		pe.scene.slideSorter.newlistBeforeStyleStack = {};
		  	  		for( var iii=0; iii < needUpdateLiList.length; iii++ )
		  			{
		  	  			PresListUtil.prepareStylesforILBefore(needUpdateLiList[iii]);
		  	    	}
		  	  		PresCKUtil.doUpdateListStyleSheet();
		  	  		pe.scene.slideSorter.preListCssStyleMSGList = null;
		  	  		pe.scene.slideSorter.postListCssStyleMSGList = null;
	  	    	}
	  	    }
	       	var end = new Date().getTime();
	       	console.log("=======>Deal List Style cost:"+ (end - start) +"ms");
  	   }catch (evt){
	       	console.log("=======>SlideEidotr.PresCKUtil.copyAllFirstSpanStyleToILBefore:error="+evt);
	   }
  	    
       // this.mainNode.innerHTML = slideDom.innerHTML;
        // let's loop through children instead to preserve spareNode in future 
        var docFrag = document.createDocumentFragment();
	      for (var i=0; i< slideDom.children.length; i++){
	          var clone = dojo.clone(slideDom.children[i]);
	          dojo.removeClass(clone, "resizableContainer");
	          docFrag.appendChild(clone);
	          if(dojo.attr(clone,'presentation_class') == 'notes' || dojo.hasClass(clone,'presentation_notes')){
	        	  dojo.style(clone, 'display','none');
	          }
	          clone = null;
	      }
	      
	      
	      this.mainNode.appendChild(docFrag);
	      //console.log("quickLoad:showHtml");
	      //debugger;
	      //need to see how many objects to be widgitized and adjust the widgitize timer
	      var drawFrameObjects = window.pe.scene.slideSorter.getDirectDrawFrameChildren(this.mainNode);
	      if(drawFrameObjects!=null && drawFrameObjects.length >= 100){
	    	  console.log ("too many objects");
	    	  this.WIDGITIZE_TIMER = 500;
	    	//#D11865 if number of box is greater than 100, needs to show info message to the user that we are preparing the slide,due to long time processing
	          this.showPreparingSlideMsg();
	      } else {
	    	  this.WIDGITIZE_TIMER = 5; //#28517 restore WIDGITIZE_TIMER in case it is changed to 500.
	      }
	    
	    var sEditor = this;  
    	var slideId = this.mainNode.id;	
    	dojo.attr(this.mainNode, "isWidgitized",false);
    	if(fromAction!=null && (fromAction == "PAGE_DOWN" || fromAction == "PAGE_UP")){
    		//do not do widgitize
    		//only widgitize on key up for these action
    		//console.log("DO NOT WIDGITIZE");
    		//6042 kicks in a backup timeout just in case in some cases keyup doesn't register, if keyup doesn't register, widgitize still happens from this backup timeout.
    		//this backup timeout is cancelled by key-up
    		this.slideSelectedTimeOut = setTimeout(function(){    		
    			sEditor.loadSlideInEditor(slideDom,true,slideId);
        	}, 1000);
    	} else if (isWidgitizeImmediately == true){
    		this.loadSlideInEditor(slideDom,true,slideId,fromAction);
    	} else {
    		// widgitization will not be executed in view draft mode
    		// Then edit mode cannot be entered into
    		var tempScene = window.pe.scene;
    		if (!tempScene.bLoadFinished || tempScene.bInReadOnlyMode ||
    				tempScene.isViewDraftMode()) {
    			// to delay the widgitization in loading
    			this.mainNode.className = 'slideEditor ' + slideDom.className;
    			this.lastSlideSelected = null;
    			// hide speaker notes in view draft mode
    			if (tempScene.isViewDraftMode()) {
    				this.showSpeakerNotes = false;
    				this.showHideSpeakerNotes();
    			}
    			return;
    		} else {
    			if (pe.scene.slideSorter.currentInPaste) return;
    			this.slideSelectedTimeOut = setTimeout(function(){    		
    				sEditor.loadSlideInEditor(slideDom,true,slideId,fromAction); // fromAction used for mobile
            	}, this.WIDGITIZE_TIMER);
    		}
    	}     
    },
    
    showPreparingSlideMsg:function(){
    	//#D11865 if number of boxes to be widgitized is greater than certain number, needs to show info message to the user that we are preparing the slide,due to long time processing
        	var prepSlideMsg = this.STRINGS.preparingSlide;
			window.pe.scene.showInfoMessage(prepSlideMsg, 60000); //show message with interval time 1 min for msg expiration, message will be hidden as soon as widgitized finished or timeout is cleared
			if(dojo.isIE){
				window.pe.scene.createTransparentUnderlay();
			}
    },
    hidePreparingSlideMsg:function(){
    	window.pe.scene.hideErrorMessage(); //need to cancel the preparing slide message too., but we don't want to cancel the preparing slide message when it is page down and its kind
    	if(dojo.isIE){
    		window.pe.scene.removeTransparentUnderlay();
    	}
    },   
    //
    // Load a slide in the slide editor
    //
    loadSlideInEditor: function(slideDom,widigitizeFlag, slideId){
    	// forbid widgitization for view draft mode
    	if (window.pe.scene.isViewDraftMode())
    		return;

    	//if its a stacked call which can happens as you page down quickly, don't widigitze if the current
    	//slidenumber is not the same as the one passed in during the set time out call
    	if (this.mainNode.id != slideId)
    		return;
    	
    	var starttime = new Date().getTime();
    	this.maxZindex = -1;
    	this.minZindex = -1;
    	dojo.attr(this.mainNode, "isWidgitized",false);
    	dojo.attr(this.mainNode, "tabindex","-1"); //D15238
    	// delete all the notes fields that may have been widgitized. 
    	
    	if(this.tempRefToLastNotes){
    		var temp = this.tempRefToLastNotes.pop(); 
    		while(temp && temp.isWidgitized){
	    		temp.makeNonEditable();
	    		temp.destroyContentBox();
	    		temp = this.tempRefToLastNotes.pop();
    		}
    	}
        if(this.tempRefToLastNotesNode){
    		temp = this.tempRefToLastNotesNode.pop(); 
    		while(temp){
            	dojo.destroy(temp);
    			temp = this.tempRefToLastNotesNode.pop();
    		}
        }
        var slideDomClone = dojo.clone(slideDom);
        
        var notesNode = dojo.query('.presentation_notes',this.mainNode);
       
        if(notesNode && notesNode.length >0){
        	dojo.style(notesNode[0], 'display','');
        	if (notesNode[0].firstChild && notesNode[0].firstChild.getAttribute('presentation_class') == 'notes') {
        		var a11yStrings = dojo.i18n.getLocalization("concord.util", "a11y");
        		dijit.setWaiRole(notesNode[0].firstChild, 'region');
        		dojo.attr(notesNode[0].firstChild,'aria-label',a11yStrings.aria_presentation_notes);
        	}
        }
    	
        this.connectArray.push(dojo.connect(this.mainNode,'onclick',dojo.hitch(this,this.handleClickOnSlideEditor)));
	   
       this.mainNode.id = slideDomClone.id;
       this.widgitizeContent(null,false,false,false);
        
       var reInsertMainNode = null;
       if (!this.SINGLE_CK_MODE){
    	   reInsertMainNode =  concord.util.HtmlContent.temporarilyDetachElement(this.mainNode);
       }
        
        var drawPageLoadedClasses = slideDomClone.className;
//        var drawPageLoadedClassesDrawStyleName = slideDomClone.getAttribute('draw_style-name');
        this.mainNode.className ='slideEditor';
        dojo.addClass(this.mainNode,drawPageLoadedClasses);
        //for defect 25813, we need add draw_style-name to class, or which will lost.
//        if(drawPageLoadedClassesDrawStyleName != null)
//        	dojo.addClass(this.mainNode,drawPageLoadedClassesDrawStyleName); 
        dojo.attr(this.mainNode,'presentation_presentation-page-layout-name',slideDomClone.getAttribute('presentation_presentation-page-layout-name'));
        dojo.attr(this.mainNode,'draw_master-page-name',slideDomClone.getAttribute('draw_master-page-name'));

        // 15079 show slide level comments on desktop
        dojo.attr(this.mainNode,'comments',slideDomClone.getAttribute('comments'));
        dojo.attr(this.mainNode,'commentsId',slideDomClone.getAttribute('commentsId'));
        
        if (dojo.isIE) {
        	this.correctIeNumberingList();
	        // add special class for IE.
	        dojo.addClass(this.mainNode,"iese");   
	    }
        
        //Also pull over the page format attributes
        
        if (slideDomClone.getAttribute('pageheight') && slideDomClone.getAttribute('pagewidth'))
        {
        	dojo.attr(this.mainNode,'pageheight',slideDomClone.getAttribute('pageheight'));
        	dojo.attr(this.mainNode,'pagewidth',slideDomClone.getAttribute('pagewidth'));        	
        }
        
        if (slideDomClone.getAttribute('pageunits') && slideDomClone.getAttribute('orientation'))
        {
        	dojo.attr(this.mainNode,'pageunits',slideDomClone.getAttribute('pageunits'));
        	dojo.attr(this.mainNode,'orientation',slideDomClone.getAttribute('orientation'));
        }
        
        dojo.destroy(slideDomClone);
        slideDomClone = null;

        if (reInsertMainNode){
        	reInsertMainNode();
        }
        
        if(!concord.util.browser.isMobile())
        {
        	// skip to improve performance for mobile
        	concord.util.presToolbarMgr.toggleFontEditButtons('off');
        	concord.util.presToolbarMgr.toggleBGFillColorButton('off');
        	concord.util.presToolbarMgr.toggleBorderColorButton('off');
        }
        
        this.loadingNewSlide=false;

        // disable anchors in draw frames, links should only respond to clicks in slide show mode
        var slideTextAnchors = dojo.query('[class = "text_a"]', dojo.byId("slideEditorContainer"));
        for (var j=0; j < slideTextAnchors.length; j++)
        	slideTextAnchors[j].onclick = function() { return false; };
        //also check for <a> anchor elements
        //Task #14906
    	 slideTextAnchors = dojo.query('a', dojo.byId("slideEditorContainer"));
         for (var j=0; j < slideTextAnchors.length; j++)
         	slideTextAnchors[j].onclick = function() { return false; };

        // enable speaker notes when switching
        // view draft mode to edit mode
        if (window.pe.scene.viewDraftToEditMode)
        	this.showSpeakerNotes = true;
        
        // do not show speaker notes area in slideEditor for Mobile
        if (concord.util.browser.isMobile()) {
        	this.showSpeakerNotes = false;
        } else {
        	this.loadSpeakerNotesWhenLoadSlide();
        }
        
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
        	//D24658: Text box is height change to very large when click the textbox
        	var contentbox = this.CONTENT_BOX_ARRAY[i];
        	
        	//13714, just in case a box is in edit mode, we need to use the orgZ instead of the actual zIndex of box's style
            var aBoxZ = 0;
            if(contentbox!=null && contentbox.origZ!=null){
            	aBoxZ = parseInt(contentbox.origZ);
            }
            else{
            	aBoxZ = parseInt(contentbox.mainNode.style.zIndex);
            }
            if ((!isNaN(aBoxZ)) && (aBoxZ > this.maxZindex)){
                this.maxZindex = aBoxZ;
            }
                        
            if ((this.minZindex === -1) && (!isNaN(aBoxZ))) this.minZindex = aBoxZ;
            
            if ((!isNaN(aBoxZ)) && (aBoxZ < this.minZindex)){
            	this.minZindex = aBoxZ;
            }
        	
        	//T25019: Ensure only one level <span> generated while taking edit action for text in Docs Presentation XML files
//			PresCKUtil.fixDOMStructure(this.CONTENT_BOX_ARRAY[i].mainNode);
        	var contentBoxId = contentbox.mainNode.id;
        	var userLock = window.pe.scene.getUsersSlideNodeLock(contentBoxId);
        	if (userLock.length > 0) {
        		var user = userLock[0];
				this.handleToggleContentBoxLock(contentBoxId, true, user);
        	}
        	
        	if(!contentbox.isWidgitized)
        		continue;
            
        	 //Let's check for early spills if data is text data is assigned an unreasonable height
            //No need to do this for grouped box
            if ((!dojo.hasClass(contentbox.mainNode, 'g_draw_frame')) && ((contentbox.contentBoxType==PresConstants.CONTENTBOX_TEXT_TYPE)||(contentbox.contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE)||
            				(contentbox.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE)) && 
            				(!contentbox.opts.copyBox) && dojo.style(contentbox.parentContainerNode,'display')!='none'){
	            if (!contentbox.checkResizeHeightLimits() || (contentbox.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE && contentbox.mainNode.style.height == "5%")){
	            	contentbox.updateMainNodeHeightBasedOnDataContent();
	            }
            }
            if (!dojo.hasClass(contentbox.mainNode, 'g_draw_frame')) { // No need to adjust for grouped box
            	if (dojo.isIE) contentbox.adjustContentDataSize();
            } 
        }
        // D11432 - need to toggle counter-reset values for OLs in IE
        // note: this was caused by D6042, which modified a doc fragment instead of the DOM node directly (in 'quickLoadInSlideEditor')
        if ( dojo.isIE ) {
            dojo.forEach(
                    dojo.query( 'ol', this.mainNode ),
                    function( item ) {
                        var cntr = dojo.style( item, 'counter-reset' );
                        dojo.style( item, 'counter-reset', '' );
                        if ( cntr )
                            dojo.style( item, 'counter-reset', cntr );
                    }
            );
        }
        
        //JMT - D2532 - Deselect all when right click on slideeditor
        if (this.ctxMenu!=null){
        	this.connectArray.push(dojo.connect(this.ctxMenu,'onOpen',this,'deSelectAll')); 
        }
        //D2843 - need to know when mouse is hovering outside of canvas for creation of new text box
        this.connectArray.push(dojo.connect(this.mainNode,'onmouseover', dojo.hitch(this,this.handleContentOnMouseOver)));
        this.connectArray.push(dojo.connect(this.mainNode,'onmouseout', dojo.hitch(this,this.handleContentOnMouseOut)));
        this.connectArray.push(dojo.connect(dojo.byId('slideEditorContainer'),'onclick',dojo.hitch(this,this.handleClickOnSlideEditorContainer)));  //T15521 - Ensure we call deselect when user clicks in gray area        
		//T15714 Let's disable paste option if pasting content from another document
        this.connectArray.push(dojo.connect(this.ctxMenu,'onOpen',this,'chckPasteFromOtherDoc'));         
        
        this.slideSelectedTimeOut = null;
        if(this.loadSlideTimeout!=null){
        	this.loadSlideTimeout = null;
        }
       if (this.SINGLE_CK_MODE){
    	   var retVal = this.createSpareBox(); 
    	   //13550 - grp to use single ck also
    	   //create spare grp content box, but using g_draw_frame txt content box to swap ck
    	   var grpContentBoxes = this.getGrpContentBoxArray();
    	   if(grpContentBoxes!=null && grpContentBoxes.length>0){
    		   //it is a problem to instantiate ckeditor back to back, so we need to do settimeout
    		   //if we know we just create a spare box before
    		   if(retVal ==true){
    			   setTimeout(dojo.hitch(this,function(){
            		   this.createSpareGrpContentBox();
           			}), 200); 
    		   }else{
    			   retVal = this.createSpareGrpContentBox();
    		   }
    	   }
    	   //13550 - grp to use single ck also
    	   //create spare table content box
    	   var tableContentBoxes = this.getTableContentBoxArray();
    	   if (tableContentBoxes!=null && tableContentBoxes.length>0 && !concord.util.browser.isMobile()) {
    		   //it is a problem to instantiate ckeditor back to back, so we need to do settimeout
    		   //if we know we just create a spare box before
    		   if(retVal ==true){
    			   setTimeout(dojo.hitch(this,function(){
            		   this.createSpareTableContentBox();
           			}), 200); 
    		   }else{
    			   this.createSpareTableContentBox();
    		   }
    	   }
       }
       this.loadCommentsWhenLoadSlide();
       if(dojo.isSafari && !concord.util.browser.isMobile())
	    	pe.scene.clipboard.focusClipboardContainer();
       var endtime = new Date().getTime();
       console.log("====>>>>times:"+ (endtime-starttime));
    }, 
    
    loadSpeakerNotesWhenLoadSlide: function(){
        //set notesDrawFrame and notesDrawText
        this.notesDrawFrame = dojo.query('[presentation_class = "notes"]', dojo.byId("slideEditorContainer"))[0];
        
        if (this.notesDrawFrame) {
        	var notesDrawText = null;
    		dojo.query(".draw_text-box",this.notesDrawFrame).forEach(function(node, index, arr){
    			if (dojo.attr(node.parentNode,"presentation_class") == "notes") {
    			 	notesDrawText = node;
    			}
    		});
    		this.notesDrawText = notesDrawText;
        }
        
        if (this.notesDrawFrame && this.notesDrawText) {	
        	this.adjustSpeakerNotes();
        }
        
        this.showHideSpeakerNotes();
    },
    
    loadCommentsWhenLoadSlide: function(){
    	if(pe.incommentsSelected)
    	{
    		pe.scene.sidebar.commentsController._handleShowComments(pe.scene.activeCommentId);
    		delete pe.incommentsSelected;
    	}
    	//TODO new comments
       // 15079 show slide level comments on desktop
		// show slide comment icon
		this.initSlideCommentIcon();
		
		var slideComments = window.pe.scene.slideComments;

		if (!slideComments || (slideComments && slideComments.isInitialized() == false)) {
//			var commentPane = window.pe.scene.sidebar.getCommentPane();
//			var commentStore = commentPane.store;
//			if (commentStore)
//				slideComments = window.pe.scene.slideComments = new concord.widgets.mSlideComments(commentStore, window.pe.scene.slideSorter, window.pe.scene.slideEditor);
		}
		
		if (slideComments && slideComments.isActive()) {
			slideComments.loadDraft();
			
			if (this.hasSlideComment()) {
				this.createSlideCommentActions();
				this.hitchSlideCommentActions();	
			}
		}
    }, 

    //
    // Handles when user mouses over the canvas
    //
    handleContentOnMouseOver: function(e){
       //console.log('mouse over slide editor '+dojo.hasClass(e.target,'slideEditor'));  
       if (this.createPackageOnClick.createNewContentBox && e.target && (dojo.hasClass(e.target,'slideEditor') || this.isNewTxtBoxAllowed(e.target) )) {
            document.body.style.cursor='crosshair';
            if (!dojo.hasClass(e.target,'slideEditor') && !dojo.hasClass(e.target,'shadowPiece')){
	            //var style = dojo.style(e.target,'cursor');
	            //#15334, in IE after create textbox, the cursor stays crosshair. 
	            //turns out because using dojo.style IE gets computed style, and already comes as crosshair
	            //so the if condition below style.toLowerCase()!='crosshair' turns false
            	var style = e.target.style.cursor;
	            if ((e.target.cursorStyle == undefined || e.target.cursorStyle ==null) && style.toLowerCase()!='crosshair'){
	            	e.target.cursorStyle = style;
	            }           
	            dojo.style(e.target,{
	           	 'cursor':'crosshair'
	            });
            }
            this.outsideOfCanvas = false;
       }else{
           document.body.style.cursor='default';
           if (e.target.cursorStyle != undefined && e.target.cursorStyle!=null){
        	   e.target.style.cursor =""; 
        	   delete  e.target.cursorStyle;
           }           
       }
    },
    
    //
    // Handles when user mouses over the canvas
    //
    handleContentOnMouseOut: function(e){
    	//console.log('mouse out of slide editor '+ dojo.hasClass(e.target,'slideEditor'));
        if (this.createPackageOnClick.createNewContentBox && e.target && (dojo.hasClass(e.target,'slideEditor') || this.isNewTxtBoxAllowed(e.target) )) {
             document.body.style.cursor='default';
             if (e.target.cursorStyle != undefined && e.target.cursorStyle!=null){
 	            dojo.style(e.target,{
 	             	 'cursor': e.target.cursorStyle
 	             });  
 	            
	        	delete  e.target.cursorStyle;
            } else{
         	   e.target.style.cursor =""; 
            }         
             this.outsideOfCanvas = true;
         }
    },
    
    isNewTxtBoxAllowed: function(node){
    	var isOk = false;    	
    	if (node!=null){
    		var dfp = this.getParentDrawFrameNode(node);
    		if (dfp!=null){
    			//D7356 - Now we allow creation of txtbox anywhere on canvas not just background objects. We still look for notes
    			var draw_layer = dojo.attr(dfp,"presentation_class");
    			isOk = (draw_layer == null || draw_layer.toLowerCase() != 'notes');
    		}    			    		
    	}
    	return isOk;
    },   

    //
    // In IE, if click on border for shape in text editing mode. 
    // the function "handleClickOnSlideEditor" will be called. Then shape will be deSelected.
    // In other browser, there is no such issue. The shape should in selection mode.
    // The root cause is unclear, which may be IE event special.
    // The solution is to avoid to calling for "handleClickOnSlideEditor/handleClickOnSlideEditorContainer".
    //
    cancelMouseClickingOnSlideEditor: function(e) {
    	// check arg
    	if (!e)
    		return false;
    	// check browser. Only IE and chrome will be considered
    	if (!dojo.isIE && !dojo.isChrome)
    		return false;
    	
    	// check selected CB in current slide
    	var selectedCB = null;
    	for (var i=0; i < this.CONTENT_BOX_ARRAY.length; ++i) {
    		if (this.CONTENT_BOX_ARRAY[i].boxSelected) {
    			if (selectedCB == null) {
    				selectedCB = this.CONTENT_BOX_ARRAY[i];
    			} else {
    				return false;   // there are multiple CBs in selected
    			}
    		}
    	}  // end for
    	
    	// check CB
    	if (selectedCB == null)
    		return false;
    	// check type
    	if (selectedCB.contentBoxType != PresConstants.CONTENTBOX_GROUP_TYPE)
    		return false;
    	
    	// get the abs position/size for selectecCB
    	var computedStyle = dojo.getComputedStyle(selectedCB.mainNode);
    	if (!computedStyle)
    		return false;
    	
    	// check left
    	var left_v = concord.util.resizer.getIntPropertyStyleValue(computedStyle.left);
    	
    	// offsetX and offsetY is reference to the target object
    	// for all browsers except for FF
    	if (e.offsetX < left_v)
    		return false;
    	
    	// check right
    	var right_v = left_v;
    	right_v += concord.util.resizer.getIntPropertyStyleValue(computedStyle.width);
    	right_v += concord.util.resizer.getIntPropertyStyleValue(computedStyle.borderLeftWidth);
    	right_v += concord.util.resizer.getIntPropertyStyleValue(computedStyle.borderRightWidth);
    	if (e.offsetX > right_v)
    		return false;
    	
    	// check top
    	var top_v = concord.util.resizer.getIntPropertyStyleValue(computedStyle.top);
    	if (e.offsetY < top_v)
    		return false;
    	
    	// check bottom
    	var bottom_v = top_v;
    	bottom_v += concord.util.resizer.getIntPropertyStyleValue(computedStyle.height);
    	bottom_v += concord.util.resizer.getIntPropertyStyleValue(computedStyle.borderTopWidth);
    	bottom_v += concord.util.resizer.getIntPropertyStyleValue(computedStyle.borderBottomWidth);
    	if (e.offsetY > bottom_v)
    		return false;

    	// cancel this clicking on slideEditor, because of being in shape area [IE only]
    	return true;
    },
    
    //
    // Handles when the user clicks on the body of the slide editor.
    //
    handleClickOnSlideEditor: function(e){
    	window.pe.scene.hideComments();
    	if (this.cancelMouseClickingOnSlideEditor(e))
    		return;
 
        // console.log("slideEditor:handleClickOnSlideEditor","Entry");
        PresCKUtil.runPending();
        window.pe.scene.validResize = true;
        if (dojo.isIE || dojo.isWebKit){//D8517 Need to adjust canvas if box is i
            if (this.mainNode.parentNode.scrollTop>0){
                this.mainNode.parentNode.scrollTop=0;
            }
        }
        e.preventDefault();
        e.stopPropagation();               
        this.publishSlideEditorInFocus();

        // Every so often we get an click event with unknown origin.. for ex after selecting  boxes via boxselector.
        if (dojo.isIE && this.boxSelectorUsed){
            this.boxSelectorUsed =false;
            return;
        }
        
        // Every so often we get an click event with unknown origin in chrome
        if (dojo.isChrome && this.creatingConnector) {
            this.creatingConnector = false;
            return;
        }

        //Deselect all contents from slide editor
        this.deSelectAll();
        
        if(dojo.isChrome)
        {
        	this.mainNode.parentNode.focus();
        }
        else if(dojo.isSafari && !concord.util.browser.isMobile())
        {
        	pe.scene.clipboard.focusClipboardContainer();
        }	
        
        // Check if a user is trying to create a new node.      
        if (this.createPackageOnClick.createNewContentBox && !this.outsideOfCanvas) {
            var position = this.getMousePosition(e);
            if (PresCKUtil.connectorShapeTypes[this.createPackageOnClick.shapeType] == 1) {
                // Creat a connect shape when just clicking slide editor
                var left = position.left;
                var top = position.top;
                var width = 15;
                var height = 12;
                var pos = {
                    startX: left,
                    startY: top,
                    endX: left + width,
                    endY: top + height,
                    zIndex: this.getzIndexCtr()
                };
                var svgDrawFrame = this.createPackageOnClick.callback(pos);
                if (svgDrawFrame) {
                    this.createPackageOnClick.finalizeCallback(svgDrawFrame);
                }
                
                this.createPackageOnClick.callback = null;
                this.createPackageOnClick.resizeCallback = null;
                this.createPackageOnClick.finalizeCallback = null;
                this.createPackageOnClick.createNewContentBox = false;
                this.createPackageOnClick.shapeType = null;
                document.body.style.cursor='default';
            } else {
                this.createPackageOnClick.pos =null;
                this.createPackageOnClick.callback(position);
                this.createPackageOnClick.callback = null; 
                this.createPackageOnClick.createNewContentBox = false;
                document.body.style.cursor='default';
            }
            if (e && e.target){
         	  e.target.style.cursor =""; 
         	  if (e.target.cursorStyle != undefined && e.target.cursorStyle!=null){
         	   delete  e.target.cursorStyle;
         	  }
            }
        }
        
        //console.log("slideEditor:handleClickOnSlideEditor","Exits");          
    },   
    
    handleClickOnSlideEditorContainer: function(e){
    	if(dojo.isSafari && !concord.util.browser.isMobile())
    		pe.scene.clipboard.focusClipboardContainer();
    	if (this.cancelMouseClickingOnSlideEditor(e))
    		return;
 
    	this.deSelectAll();
    },
    
    //
    // Returns boxSelector Area
    //
    getBoxSelectorArea: function(e){
        var pos = null;
        if (this.boxSelectorNode) 
                pos = { 'top':  dojo.style(this.boxSelectorNode,'top'),
                        'left': dojo.style(this.boxSelectorNode,'left'),
                        'width': dojo.style(this.boxSelectorNode,'width'),
                        'height': dojo.style(this.boxSelectorNode,'height')
                      };
        
        if (dojo.isIE && e.srcElement !=null){
        	var dfNode = this.getParentDrawFrameNode(e.srcElement);
        	var box =null;
        	if (dfNode!=null){ //We are over a draw frame Then we need to adjust the position
        		box = this.getRegisteredContentBoxById(dfNode.id);
        		//console.log('????? setting box ready to FALSE for '+box.mainNode.id);
        		if (box!=null){
        			box.boxReady = false; // disable going into edit mode in IE
        		}
        	}
        	if (box!=null){
	        	setTimeout (function(){
	        			//console.log('????? setting box ready to TRUE for '+box.mainNode.id);
	        			if (box!=null){
	        				box.boxReady=true;	
	        			}
	        	}, 1 ); 
        	}
        }
       
        return pos;
    },
    
    //
    // Returns the position of the mouse when event fired
    //
    getMousePosition : function(e){
        var pos = (dojo.isIE)? {'left':e.offsetX, 'top':e.offsetY} :{'left':e.layerX, 'top':e.layerY};
       // console.log("getMousePosition top, left, width, height==========> "+pos.top +" ; "+pos.left +" ; "+pos.width +" ; "+pos.height);
        
        pos.left = (e.clientX - this.mainNode.offsetLeft);
        pos.top  = (e.clientY - this.mainNode.offsetTop);
        
        return  pos;
    },
    
    //
    // Returns true if mouse is over a drawpage
    //    
    isMouseOverDrawPage: function(e){
    	var isInDP = true;
    	if (e.target!=null){
    		var dpNode = this.getParentDrawPageNode(e.target);  	
    		if (dpNode==null){
    			isInDP =false;
    		}
    	}    	
    	return isInDP;    	
    },
    
    //
    // Returns true if mouse is over  a drawframe
    //    
    isMouseOverDrawFrame: function(e){
    	var isInDF = true;
    	if (e.target!=null){
    		var dfNode = this.getParentDrawFrameNode(e.target);  	
    		if (dfNode==null){
    			isInDF =false;
    		}
    	}    	
    	return isInDF;    	
    },
    
    
    //
    // This method should be called for every content block that is on the slide
    //
    registerContentBox: function(contentBox){           
        if (contentBox){
        	if(contentBox.hasComments()){ //D13306
        		contentBox.updateCommentIconPosition();        		
        	}
            this.CONTENT_BOX_ARRAY.push(contentBox);
        }
    },
    checkSelectedBoxCommentNumber: function(){
    	var size = 0;
    	var boxToComment = this.getSelectedContentboxForComment();
    	if(boxToComment){
    		var commentImgs = boxToComment.mainNode.getElementsByClassName('imgcomment');
    		size = commentImgs.length;
    	}
    	if(size >=5){
    		this.showCantAddCommentDialog();
    		return true;
    	}else{
    		return false;
    	}
    },
    showCantAddCommentDialog: function() {
		var noBoxesDialog  = new concord.widgets.presentationDialog({
	          'id': 'noBoxesDialog',
	          'aria-describedby': 'noBoxesDialog_containerNode',
	          'title': this.STRINGS.cannotAddComment_Title,
	          'content': dojo.string.substitute(this.STRINGS.cannotAddComment_Content,[5]),
	          'presDialogHeight': '200',
	          'presDialogWidth' : '360',
	          'presDialogTop'   : (this.parentContainerNode.parentNode.offsetParent.offsetHeight/2) - 115,
	          'presDialogLeft'  : (this.parentContainerNode.parentNode.offsetParent.offsetWidth/2) - 150,   
	          'heightUnit':'px',
	          'presModal': true,
	          'destroyOnClose':true,
	          'presDialogButtons' : [{'label':this.STRINGS.ok,'action':dojo.hitch(this,function(){})}]        
	        });
		noBoxesDialog.startup();
		noBoxesDialog.show();
    },

    //
    // used to show or hide the speaker notes note
    //
    showHideSpeakerNotes: function(){
        if (this.notesDrawFrame) {
            if (this.showSpeakerNotes) {
                dojo.style(this.notesDrawFrame, "display", "");
            } else {
                dojo.style(this.notesDrawFrame, "display", "none");
            }
        } 
        this.setUIDimensions();         
    },

    //
    // used to toggle showSpeakerNotes from true to false
    //
    toggleShowSpeakerNotes: function(data){
        if (data.forceOpen) {
            if (!this.showSpeakerNotes) {
                var mi = dijit.byId("P_i_SpeakerNotes");
                if (mi) {
                    mi._setCheckedAttr(true);
                }
            }
            else {
                return;
            }
        }
        if (this.showSpeakerNotes) {
            this.showSpeakerNotes = false;
        } else {
            this.showSpeakerNotes = true;
        }
        this.showHideSpeakerNotes();
    },

    //
    // adjust speaker notes styles
    //
    adjustSpeakerNotes: function() {
    	//TODO work on what happens with default text here
    	if (this.notesDrawFrame) {
    		dojo.style(this.notesDrawFrame,"cursor","default");
    		dojo.style(this.notesDrawFrame,"overflowY","hidden");
    		dojo.style(this.notesDrawFrame, "minHeight","62px");
    		dojo.style(this.notesDrawFrame, "height","62px");
			dojo.style(this.notesDrawFrame, "paddingTop","10px");
			dojo.style(this.notesDrawFrame, "border","0px");
    		if (this.notesDrawText) {
    			dojo.style(this.notesDrawText, "height", "100%");
				dojo.style(this.notesDrawText, "width", "100%");
				dojo.style(this.notesDrawText, "height","37px");
				// activate styles specific to speaker notes
				dojo.addClass(this.notesDrawText, "notes_tweaks");
				if (this.notesDrawText.children[0]) {
					dojo.style(this.notesDrawText.children[0], "display", "table");
					dojo.style(this.notesDrawText.children[0], "height", "100%");
					dojo.style(this.notesDrawText.children[0], "width", "100%");
					dojo.style(this.notesDrawText.children[0], "margin","0px");
			        dojo.style(this.notesDrawText.children[0], "padding","0px");
			        dijit.setWaiRole(this.notesDrawText.children[0],'presentation');
					var drawFrameClassesNode = dojo.query(".draw_frame_classes",this.notesDrawText.children[0])[0]; 
					if (drawFrameClassesNode) {
						dojo.style(drawFrameClassesNode, "display", "table-cell");
						dojo.style(drawFrameClassesNode, "height", "100%");
						dojo.style(drawFrameClassesNode, "width", "100%");
						dojo.style(drawFrameClassesNode, "fontSize", "12px");
			    		dojo.style(drawFrameClassesNode, "margin","0px");
			    		dojo.style(drawFrameClassesNode, "padding","0px");
			    		dojo.style(drawFrameClassesNode, "textIndent","0.00%");
				        dijit.setWaiRole(drawFrameClassesNode,'presentation');
					}
		    		if (drawFrameClassesNode && drawFrameClassesNode.childNodes.length > 0) {	
    					//if any of the speaker notes subnodes have a line height of 1 and a class of defaultLineHeightSet
    					//then increase the lineHeight in order to properly display underline in the presentations editor
		    			dojo.query("p,li,span", drawFrameClassesNode).forEach(function(node, index, arr){
    						if (node.style.lineHeight != "") {
    							if (node.style.lineHeight == "1" && dojo.hasClass(node, "defaultLineHeightSet")) {
    									node.style.lineHeight = "1.2";
    							}
    						}
    					});
    				}
					//make sure that lists have relative positioning
					dojo.query("ol,ul", drawFrameClassesNode).forEach(function(node, index, arr){
						if (node.style.position == "") {
							node.style.position = "relative";
						}
					});
				}
    		}
    	}
    },

    //
    // Handles when key events. Looking for 
    // 1) CTRL+c
    // 2) CTRL+v
    //
    keypressHandle: function(data){
        var e = data.e;
        console.log('slideEditor:keypressHandle','Entry ');
        if (data.eventAction==this.CTRL_V) {
        	console.log('slideEditor:keypressHandle','Entry CTRL_V');
                this.pasteSelectedItems();
        }
        else if (data.eventAction==this.CTRL_C) {
        	console.log('slideEditor:keypressHandle','Entry CTRL_C');
        	var itemsCopied = this.copySelectedItems();
            if (!itemsCopied){
            	this.publishCopySlides();
            }          
        }        
        else if (data.eventAction==this.CTRL_X) {
        	console.log('slideEditor:keypressHandle','Entry CTRL_X');
                var itemsCopied = this.copySelectedItems();
                if (!itemsCopied){
                    this.publishCutSlides();
                }else{
                	//D35719 [IE]Failed to cut/Paste a image if copy a text before
                	if(dojo.isIE)
	                	setTimeout(dojo.hitch(this, function(){
	                		this.deleteSelectedContentBoxes();
	                	}),0);
                	else
                		this.deleteSelectedContentBoxes();
                }
        }
        else if (data.eventAction==this.SAVE){
     	   window.pe.scene.saveDraft();     	   
        }
        else if (data.eventAction==this.PRINT){
	    	var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_printHtml}];
			concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
        }
        else if (this.getFocusComponent(true) == concord.util.events.SLIDE_EDITOR_COMPONENT){
             if ((data.eventAction==this.DELETE) || (data.eventAction==this.BACKSPACE)) {
                 this.deleteSelectedContentBoxes();
             }else if (data.eventAction==this.CTRL_A){
                 this.selectAll();
             } else if (data.eventAction==this.LEFT_ARROW){ //left arrow    
                 var pos ={};                
                 if (e.ctrlKey){
                     pos.left= -(this.FINE_MOVE_INCREMENT);
                 } else{
                     pos.left= -(this.MOVE_INCREMENT);
                 }
                 this.moveSelectedItems(pos, this.LEFT_ARROW);
             } else if (data.eventAction==this.RIGHT_ARROW){ //right arrow           
                 var pos ={};                
                 if (e.ctrlKey){
                     pos.left= this.FINE_MOVE_INCREMENT;
                 } else{
                     pos.left= this.MOVE_INCREMENT;
                 }
                 this.moveSelectedItems(pos, this.RIGHT_ARROW);
             } else if (data.eventAction==this.UP_ARROW){ //up arrow
                 var pos ={};                
                 if (e.ctrlKey){
                     pos.top= - (this.FINE_MOVE_INCREMENT);
                 } else{
                     pos.top=  - (this.MOVE_INCREMENT);
                 }
                 this.moveSelectedItems(pos, this.UP_ARROW);
             } else if (data.eventAction==this.DOWN_ARROW){ //down arrow
                 var pos ={};
                 if (e.ctrlKey){
                     pos.top= this.FINE_MOVE_INCREMENT;
                 } else{
                     pos.top=  this.MOVE_INCREMENT;
                 }
                 this.moveSelectedItems(pos, this.DOWN_ARROW);
             }  else if (data.eventAction==this.CTRL_TAB || data.eventAction==this.TAB){
            	 dojo.stopEvent(e);
                 this.selectNextBox(false);
             }	else if (data.eventAction==this.SHIFT_TAB){
            	 dojo.stopEvent(e);
            	 this.selectNextBox(true);
             }  else if (data.eventAction==this.ENTER){
                 var indx = this.getIndxBoxSelected();
                 if (indx!=null && !window.pe.scene.isCtxMenuUp()) {  //D15026 do not go into edit mode if context menu is up                 
                     var contentObj = this.CONTENT_BOX_ARRAY[indx];
                     if(!contentObj.isWidgitized)
                    	 contentObj = this.widgitizeObject(contentObj);
                     // In the case of group, handle grouped textbox as well
                     if (contentObj.opts.contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE) {
                        if (contentObj.G_CONTENT_BOX_ARRAY != null) {
                            for (var i=0; i<contentObj.G_CONTENT_BOX_ARRAY.length; i++){
                                var gContentBoxObj = contentObj.G_CONTENT_BOX_ARRAY[i];
                                if (gContentBoxObj.opts.contentBoxType == PresConstants.CONTENTBOX_TEXT_TYPE || gContentBoxObj.opts.contentBoxType == PresConstants.CONTENTBOX_NOTES_TYPE){                
                                    gContentBoxObj.handleContentOnDblClick();
                                }
                            }
                        }
                     }
                     
                    contentObj.handleContentOnDblClick();                       
                 }
                 else if (data.eventAction==this.PAGE_UP ||data.eventAction==this.PAGE_DOWN ){
                     var eventData = [{'eventName': concord.util.events.keypressHandlerEvents_eventName_keypressEvent,'eventAction':data.eventAction}];
                     concord.util.events.publish(concord.util.events.slideSorterEvents, eventData);
                 }
             }
             
        }
       if (data.eventAction==this.ESC){ 
    	   var cancelCreation =true; //Handles cancelling when user has cross hair but has not yet dragged
    	   this.cancelAddTextBox(cancelCreation);
       }
       
       console.log('slideEditor:keypressHandle','Exit with e.ctrlKey');
    },
    
    // for object level widgitize, do nothing for desktop, implemented in mSlideEditor for mobile.
    widgitizeObject: function(opts)
	{
		return null;
	},
	
    //
    // Move all selected item
    //
    moveSelectedItems: function (pos, action) { 
        //console.log('slideEditor:moveSelectedItems','Entry');
    	//D15026
    	if (window.pe.scene.isCtxMenuUp()){
    		return;
    	}    	
        var objArray = [];
        var multipleBoxSelected = this.isMultipleBoxSelected();
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
            //prevent moving rotated shape
        	if (this.CONTENT_BOX_ARRAY[i].isRotated()){
        		this.showWarningMsgForRotatedObject();
        		continue;
        	}
            //prevent moving speaker notes
            if (this.CONTENT_BOX_ARRAY[i].boxSelected && this.CONTENT_BOX_ARRAY[i].contentBoxType != PresConstants.CONTENTBOX_NOTES_TYPE){
            	var tmpPos ={};
                if (pos.left) 
                    tmpPos.left = this.CONTENT_BOX_ARRAY[i].PxToPercent( (dojo.isIE < 9 || dojo.isWebKit)? this.CONTENT_BOX_ARRAY[i].mainNode.offsetLeft + pos.left : dojo.style(this.CONTENT_BOX_ARRAY[i].mainNode,'left') + pos.left);
                if (pos.top)
                    tmpPos.top  = this.CONTENT_BOX_ARRAY[i].PxToPercent( (dojo.isIE < 9 || dojo.isWebKit)? this.CONTENT_BOX_ARRAY[i].mainNode.offsetTop + pos.top : (dojo.style(this.CONTENT_BOX_ARRAY[i].mainNode,'top') + pos.top),'height');
                this.CONTENT_BOX_ARRAY[i].moveAndResize(tmpPos,true);
                this.CONTENT_BOX_ARRAY[i].checkBoxPosition(this.CONTENT_BOX_ARRAY[i], action);
                var sendCoeditMsg = true;
                                
                if (multipleBoxSelected){
                    objArray = this.buildDataList(objArray,this.CONTENT_BOX_ARRAY[i]);                                  
                }else {
                    this.CONTENT_BOX_ARRAY[i].publishBoxAttrChanged('style',null,sendCoeditMsg);
                }               
            }
        }           
        if (multipleBoxSelected && objArray.length>0){
            var eventData = [{'eventName': concord.util.events.LocalSync_eventName_multiBoxAttributeChange, 'ObjList':objArray}];
            concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);              
        }
		if(dojo.isSafari && !concord.util.browser.isMobile())
			pe.scene.clipboard.focusClipboardContainer();
        //console.log('slideEditor:moveSelectedItems','Exit');      
    },  
    
    showWarningMsgForRotatedObject:function(){
    	this.cleanShowtime && clearTimeout(this.cleanShowtime);
    	var msgStr = this.STRINGS.warningforRotatedShape;
    	window.pe.scene.showWarningMessage(msgStr);
    	this.cleanShowtime = setTimeout(dojo.hitch(this,function(){
    		window.pe.scene.hideErrorMessage();
			this.cleanShowtime = null;
		}), 2000); 
    },

    //
    // Invoked when a copy has been issued on selected boxes
    //
    copySelectedItems: function () {    
        console.log('slideEditor:copySelectedItems','Entry');
        var clipBoard = window.pe.scene.getPresClipBoard();
        var clipBoardData ={'identifiers':[],'data':[]};
        var contextPath = window.contextPath;
        var cpContent = '';
        var docId = window.pe.scene.bean.getUri();
        var boxSelected = false;
        window.pe.scene.slideSorter.preserveListBeforeStylesCss();
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
            if (this.CONTENT_BOX_ARRAY[i].boxSelected){
            	if (!boxSelected) boxSelected = true;
            	if (this.CONTENT_BOX_ARRAY[i].checkEmptyPlaceholder())
            		continue;
            	if (this.CONTENT_BOX_ARRAY[i].isRotated()){
            		this.showWarningMsgForRotatedObject();
            		continue;
            	}
            	var opts = this.CONTENT_BOX_ARRAY[i].duplicateSelf();               
                var imgUrl =''; 
                if (this.CONTENT_BOX_ARRAY[i].contentBoxType==PresConstants.CONTENTBOX_IMAGE_TYPE){
                    imgUrl =  this.CONTENT_BOX_ARRAY[i].contentBoxDataNode.src;
                } else if (this.CONTENT_BOX_ARRAY[i].contentBoxType==PresConstants.CONTENTBOX_GROUP_TYPE) {
                    if (this.CONTENT_BOX_ARRAY[i].G_CONTENT_BOX_ARRAY != null) {
                        for (var j=0; j<this.CONTENT_BOX_ARRAY[i].G_CONTENT_BOX_ARRAY.length; j++){
                            var gContentBoxObj = this.CONTENT_BOX_ARRAY[i].G_CONTENT_BOX_ARRAY[j];
                            if (gContentBoxObj.opts.contentBoxType == PresConstants.CONTENTBOX_IMAGE_TYPE ){
                                imgUrl =  gContentBoxObj.contentBoxDataNode.src;                                
                            }
                            
                        }
                    }
                }  
                var htmlContent = this.CONTENT_BOX_ARRAY[i].getFilteredContentHtml();
                cpContent = cpContent + htmlContent;
                clipBoardData.identifiers.push(opts.contentBoxType);
                clipBoardData.data.push({'contentBoxOpts':opts,
                                         'docUUID':docId,
                                         'imgUrl':(imgUrl!=null)? imgUrl.substring(imgUrl.indexOf(contextPath+"/")+contextPath.length+1):null,
                                         'auth' : window.pe.scene.authUser.getId(),
                                         'currMasterName' : this.getMasterTemplateInfo().currMaster.masterName
                                        });             
            }
        }   
        
        if (clipBoardData.identifiers.length>0 || boxSelected) { //JMT - D34750 - Do not wipe out clipboard if nothing is selected
        	console.log('slideEditor:copySelectedItems','Exit true:'+clipBoardData.identifiers.length);
            clipBoard.setData(dojo.toJson(clipBoardData));
            var params = {'content':cpContent,'type':'object','docId': docId};
            pe.scene.clipboard.copy(params);
        } else {
        	console.log('slideEditor:copySelectedItems','Exit false');
            return false;
        }
        return true;
              
    },

    //
    // getPos returns position of a contentBox in %
    //
    getPos: function(box){
        var pos = {'left':box.mainNode.style.left.replace('%',''),'top':box.mainNode.style.top.replace('%',''),'width': box.mainNode.style.width.replace('%',''),'height':box.mainNode.style.height.replace('%','')};
        return pos;
    },
    
    //
    // getPos returns position of a contentBox in px
    //
    getPosInPx: function(box){
        var pos = {'left':box.mainNode.offsetLeft,'top':box.mainNode.offsetTop,'width': dojo.style(box.mainNode,'width'),'height': dojo.style(box.mainNode,'height')};
        return pos;
    },
    
    //
    // Compare if objects are in exact same position or not
    //
    inSamePosition: function(pos){  
        var withIn = 1;
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
        	if(!this.CONTENT_BOX_ARRAY[i].isWidgitized)
        		this.widgitizeObject(this.CONTENT_BOX_ARRAY[i]);
            var occupiedPos = this.getPos(this.CONTENT_BOX_ARRAY[i]);
            var leftDiff = Math.abs(parseFloat(pos.left)-parseFloat(occupiedPos.left));
            var topDiff  = Math.abs(parseFloat(pos.top)-parseFloat(occupiedPos.top));
            if ( (leftDiff <= withIn) &&  (topDiff <= (withIn))){
                return true;
            }
        }
        return false;
    },
    
    //
    // displacePastedItem. Will displaced item meant for pasting
    //
    displacePastedItem: function(pos){
        var displace = this.PASTE_DISPLACEMENT;
        pos.top+=this.PxToPercent(displace,'height');
        pos.left+=this.PxToPercent(displace,'height');
        return pos;
    },
    
    //
    // returns new position for pasted items
    // 
    getNewPastePosition: function(pos){
        var lpCtr =0;
        var maxAttempt =100; //loop safety
        while (this.inSamePosition(pos) && lpCtr<=maxAttempt){
            pos = this.displacePastedItem(pos);  
            lpCtr++;
            //console.log('getNewPastePosition:attempt # '+lpCtr ); 
        }
        return pos; 
    },
    
	// T15714
	// Disables context menus paste if clipboard content is from other document
	//
	chckPasteFromOtherDoc: function(){
		if (!window.pe.scene.isUserInEditMode() &&
			window.pe.scene.checkClipboardFromOtherDoc() &&
			(this.menuItem7a)){
			this.menuItem7a.attr('disabled',true);
			return;
		}		
		this.menuItem7a.attr('disabled',false);
	},
	
    //
    // Pastes boxes that are copied 
    //
    pasteSelectedItems: function () {   
        console.log('slideEditor:pasteSelectedItems','Entry');    

    	var clipBoard = window.pe.scene.getPresClipBoard();
        var clipBoardData = dojo.fromJson(clipBoard.getData());
        var pasteArray = (clipBoardData) ? clipBoardData.data : [];
        var typeArray = (clipBoardData) ? clipBoardData.identifiers :[];
        var isMultipleBoxSelected = false;

        //D14866: Disable copy/paste of slides and slide objects across presentations
        if (!(clipBoardData && clipBoardData.data && clipBoardData.data[0] && clipBoardData.data[0].docUUID == window.pe.scene.session.uri)){
        	return;
        }
        
        this.deSelectAll();

        
        if ((typeArray.length > 0) && 
                ((typeArray[0] == PresConstants.CONTENTBOX_TEXT_TYPE)  ||
                (typeArray[0] == PresConstants.CONTENTBOX_IMAGE_TYPE)  ||
                (typeArray[0] == PresConstants.CONTENTBOX_SHAPE_TYPE)  ||
                (typeArray[0] == PresConstants.CONTENTBOX_TABLE_TYPE)  ||
                (typeArray[0] == PresConstants.CONTENTBOX_GROUP_TYPE))){             
                this.publishSlideEditorInFocus();
                var objList =[];
                if (pasteArray.length>1){
                    isMultipleBoxSelected = true;
                }
                
                var cbArrayOldLen = this.CONTENT_BOX_ARRAY.length;
                var grpCbNum = 0;
                var zArray = PresTools.sortZIndexArray(pasteArray);
                var savedTableStyleIE = null;
               
                var srcDataBase = pasteArray[0];
                var srcOptsBase = srcDataBase.contentBoxOpts;
                var posLeft = srcOptsBase.initialPositionSize.left;
                var posTop = srcOptsBase.initialPositionSize.top;
                var posWidth = srcOptsBase.initialPositionSize.width;
                var posHeight = srcOptsBase.initialPositionSize.height;
                var newPos = this.getNewPastePosition({left:posLeft,top:posTop,width:posWidth,height:posHeight});
                var deviation = {left:(newPos.left - posLeft),top:(newPos.top - posTop)};
                
                for (var i=0; i<zArray.length; i++){
                    var objectCopy = null;
                    var srcData = pasteArray[zArray[i].index];
                    var srcOpts = srcData.contentBoxOpts;
                    var mainNode = CKEDITOR.dom.element.createFromHtml(srcOpts.mainNode).$;
                    var dataNode = CKEDITOR.dom.element.createFromHtml(srcOpts.contentBoxDataNode).$;
            		if(PresTableUtil.isMergeCell(dataNode)){
            			continue;
            		}
                    //D9545 Let's prevent pasting of placeholders if they already exists on slide
                    if(dojo.hasClass(mainNode,'layoutClass')){
                    	var presentationClass = dojo.attr(mainNode,'presentation_class');
                    	if (presentationClass!=null && presentationClass.length>0){
                    		var nodes = dojo.query(".layoutClass[presentation_class='"+presentationClass+"']", this.mainNode);
                    		if (nodes && nodes.length>=1){
                    			continue;     //skip this entry since this place holder already exist on the slide editor
                    		}
                    	}
                    }
                    
                    // added by gangzhao
                    if(dojo.attr(mainNode, 'comments') != null)
                    {   
                        mainNode.removeAttribute('comments');
                    }
                    if(dojo.attr(mainNode, 'commentsId') != null)
                    {   
                        mainNode.removeAttribute('commentsId');
                    }
                    this.setNodeId(mainNode,PresConstants.CONTENTBOX_PREFIX);
                    this.setNodeId(dataNode,PresConstants.CONTENTBOX_DATA_PREFIX);
                    var newinitialPositionSize = srcOpts.initialPositionSize;
                    newinitialPositionSize.left = newinitialPositionSize.left + deviation.left;
                    newinitialPositionSize.top = newinitialPositionSize.top + deviation.top;
                                        
                    var opts ={
                            'CKEDITOR':CKEDITOR,
                            'mainNode':mainNode,
                            'CKToolbarSharedSpace': srcOpts.CKToolbarSharedSpace,              
                            'contentBoxDataNode':dataNode,
                            'parentContainerNode':this.mainNode,                    
                            'deSelectAll':dojo.hitch(this,this.deSelectAll),
                            'deSelectAllButMe':dojo.hitch(this,this.deSelectAllButMe),
                            'initialPositionSize':newinitialPositionSize,
                            'copyBox': true,
                            'isMultipleBoxSelected': dojo.hitch(this,this.isMultipleBoxSelected),
                            'publishSlideChanged':dojo.hitch(this,this.publishSlideChanged),
                            'getzIndexCtr': dojo.hitch(this,this.getzIndexCtr),
                            'setzIndexCtr': dojo.hitch(this,this.setzIndexCtr),
                            'toggleBringToFront':dojo.hitch(this,this.toggleBringToFront),
                            'toggleSendToBack':dojo.hitch(this,this.toggleSendToBack),                          
                            'openAddNewImageDialog':dojo.hitch(this,this.openAddNewImageDialog),
                            'getActiveDesignTemplate':dojo.hitch(this,this.getActiveDesignTemplate),
                            'deRegisterContentBox' : dojo.hitch(this,this.deRegisterContentBox),
                            'deleteSelectedContentBoxes' : dojo.hitch(this,this.deleteSelectedContentBoxes),
                            'pasteSelectedContentBoxes'  : dojo.hitch(this,this.pasteSelectedItems),
                            'copySelectedContentBoxes'   : dojo.hitch(this,this.copySelectedItems),                                     
                            'createIndicatorSytle':dojo.hitch(this,this.createIndicatorSytle),      
                            'getInLineStyles':dojo.hitch(this,this.getInLineStyles),
                            'handleMultiBoxSelected': dojo.hitch(this,this.handleMultiBoxSelected),
                            'getMasterTemplateInfo' : dojo.hitch(this,this.getMasterTemplateInfo),
                            'checkBoxPosition' : dojo.hitch(this,this.checkBoxPosition),
                            'addImageContentBox': dojo.hitch(this,this.addImageContentBox),
                            'contentBoxType': srcOpts.contentBoxType
                    };          
                    mainNode = this.removeAllChildrenNodes(mainNode);
                    mainNode.appendChild(dataNode);
                    
                    if (opts.contentBoxType == PresConstants.CONTENTBOX_TEXT_TYPE) {
                         objectCopy = new concord.widgets.txtContentBox(opts);
                    } else if (opts.contentBoxType == PresConstants.CONTENTBOX_IMAGE_TYPE) {
                        objectCopy = new concord.widgets.imgContentBox(opts);
                    } else if (opts.contentBoxType == PresConstants.CONTENTBOX_SHAPE_TYPE) {
                        if (PresCKUtil.isConnectorShape(opts.mainNode))
                            objectCopy = new concord.widgets.connectorShapeContentBox(opts);
                        else
                            objectCopy = new concord.widgets.shapeContentBox(opts);
                    } else if (opts.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE) {
                    	if(dojo.isIE)
                    		savedTableStyleIE = opts.contentBoxDataNode.style.cssText; 
                        objectCopy = new concord.widgets.tblContentBox(opts);
                    } else if (opts.contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE) {
                        objectCopy = new concord.widgets.grpContentBox(opts);
                        objectCopy.isBoxShape = dojo.attr(mainNode, "ungroupable") == "yes" ? true : false,
                        objectCopy.isMoveable = objectCopy.isBoxShape ? false : true,
                        objectCopy.isResizeable = objectCopy.isBoxShape ? false : true,
                        objectCopy.cleanGroupNodeForPaste(objectCopy);
                        
                        // need to update id/ref
                        objectCopy.adjustSvgNode();
                        grpCbNum++;
                    }                       
                    objectCopy.pasteBox(srcData.docUUID,srcData.imgUrl,srcData.currMasterName, isMultipleBoxSelected);
                    this.registerContentBox(objectCopy);

                    //D41721
                    if(dojo.isIE && savedTableStyleIE){
                    	objectCopy.contentBoxDataNode.style.cssText = savedTableStyleIE;
                    	savedTableStyleIE = null;
                    }
                    //S31805, update sorter for table here
                    if (isMultipleBoxSelected || (objectCopy.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE)){
                        objList = this.buildMultipleInsertObjList(objectCopy,objList);
                    }

                }   
                
                //S31805, update sorter for table here
                if (isMultipleBoxSelected || (objectCopy && objectCopy.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE)){
                    this.publishMultipleInsertNodeFrame(objList);
                }
                
                /// special logic for issue on webkit
                /// issue : the source shape will be invalid, after pasted it in current slide
                /// root cause : unclear in webkit
                /// solution : to refresh the existing shape in current slide
                if (dojo.isWebKit > 0 && cbArrayOldLen > 0 && grpCbNum > 0) {
                	for (var j=0; j<cbArrayOldLen; j++){
            			if (this.CONTENT_BOX_ARRAY[j].isWidgitized && 
            				this.CONTENT_BOX_ARRAY[j].contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE) {
            				this.CONTENT_BOX_ARRAY[j].refreshSvgNode();
            			}
            		}
                }
        }
        console.log('slideEditor:pasteSelectedItems','Exit');     
    },  
    
    buildMultipleInsertObjList: function(box,objListArr){
        var objList = (objListArr)? objListArr : [];    
        var newNode = dojo.clone(box.mainNode);
        newNode = box.cleanNodeForPublish(newNode);
        newNode = box.adjustPositionForBorder(newNode,true); //D9544
        var parentNode = box.mainNode.parentNode;
        var siblingNode = box.mainNode.previousSibling;
        objList.push({'node':newNode,'parentId': parentNode.id,'siblingId': siblingNode.id});
        return objList;
    },

    //
    // Publish multiple insert node frame
    //      
    publishMultipleInsertNodeFrame: function(objList){
        var eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_multipleInsertNodeFrame,'nodeList':objList}];
        concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);              
    },
    
    //
    // Publish multiple delete node frame
    //      
    publishMultipleDeleteNodeFrame: function(objList){
        var eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_multipleDeleteNodeFrame,'nodeList':objList}];
        concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);              
    },
    
    //
    // Delete selected items
    //
    deleteSelectedContentBoxes: function(){         
        var objList = [];
        var isMultipleBoxSelected = this.isMultipleBoxSelected();
        var sorterDoc = PROCMSG._getSorterDocument();
        var sorterElem = null;
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
            if (this.CONTENT_BOX_ARRAY[i].boxSelected){
                if (!this.isBoxLocked(this.CONTENT_BOX_ARRAY[i].mainNode.id)){
                    //we need sorter elem to get accurate child index number
                    sorterElem = dojo.query('#'+this.CONTENT_BOX_ARRAY[i].mainNode.id,sorterDoc)[0]; 
                    if (sorterElem){
                    	var idx = new CKEDITOR.dom.node(sorterElem).getIndex();
                    	objList.push({'node':this.CONTENT_BOX_ARRAY[i].mainNode.id,'parentId':this.mainNode.id, 'idx':idx});
                    	var publish = (isMultipleBoxSelected)? false :true;
             
                    	if (this.SINGLE_CK_MODE==true && this.CONTENT_BOX_ARRAY[i].boxRep){
                    		this.CONTENT_BOX_ARRAY[i].boxRep.unLoadSpare();
                        }
                    	this.CONTENT_BOX_ARRAY[i].deleteContentBox(publish);
                    	i=i-1;
                    }
                }
            }
        } 
        if (this.userLocks.length>0){
            this.launchContentLockDialog();
            this.userLocks=[];
        }
        
        if ((isMultipleBoxSelected) && (objList.length>0)){
            //sort list before sending
            objList.sort(dojo.hitch(this, this.sortNodesForDelete));
            this.publishMultipleDeleteNodeFrame(objList);
        }   
        sorterDoc=null;
        sorterElem=null;
    },
    
    
    //
    //sorts object based on their child index position. For delete it is sorted from higher index to lower
    //
    sortNodesForDelete: function(obj1,obj2){
        if(obj1 !=null && obj2 !=null){
            var idx1 = parseInt(obj1.idx);
            var idx2 = parseInt(obj2.idx);
            return [(-1)*(idx1 - idx2)]; //causes an array to be sorted numerically and ascending
        }else{
            return 0; //no sort performed
        }       
    },
    
    //
    // prep for launching lock dialog
    //
    launchContentLockDialog: function(id){
        //get all user ids
        var userIdList = [];    
        for ( var i = 0; i < this.userLocks.length; i++) {
            var usersList = this.userLocks[i];
        
            for (var j=0; j<usersList.length; j++){
                userIdList.push(usersList[j].id);
            }                   
        }
        this.openLockMessageDialog(id, userIdList);
    },  
    
    //
    // Determined is contentBox locked 
    //
    isBoxLocked: function(boxId){
        if (window.pe.scene.isSlideNodeLocked(boxId)){
            this.userLocks.push(window.pe.scene.getUsersSlideNodeLock(boxId));  
            //this.publishLaunchContentLockDialog(slide.id);
            return true;
        }
        return false;
    },
    
    //
    // Remove Children node 
    //
    removeAllChildrenNodes: function(node){
        for(var i=0; i<node.children.length; i++){
            dojo.destroy(node.children[i]); 
        }
        return node;
    },
    
    //
    // This function is invoked when a contentBox is deleted or removed from the slide
    //
    deRegisterContentBox: function(contentBox){
        if (contentBox){
            var tmpArray = [];      
            for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
                if (contentBox.boxUID != this.CONTENT_BOX_ARRAY[i].boxUID)
                    tmpArray[tmpArray.length]= this.CONTENT_BOX_ARRAY[i];
            }   
            this.CONTENT_BOX_ARRAY = tmpArray;
        }
    },
    
    //
    // sets default mousedown behavior
    //
    setDefaultMouseDown: function(){
        //console.log('setting mouse down to handleDefaultMouseDown ');
    	if (!this.createPackageOnClick.createNewContentBox){
    		document.body.style.cursor='default';
    	}
        if (this.mouseupEvent)
            dojo.disconnect(this.mouseupEvent); 
        
        if (this.defaultMouseDownEvt)
        	dojo.disconnect(this.defaultMouseDownEvt);
        
        this.defaultMouseDownEvt = dojo.connect(document,'onmousedown',dojo.hitch(this,this.handleDefaultMouseDown));
    },
    
    // handles the mouse move event for rulers, required only on IE8
    handleRulersMouseMove: function(e){
    	if (e == null)
    		e = window.event;
    	this.horizontalRuler.handleMouseMove(e);
    	this.verticalRuler.handleMouseMove(e);
    },
    
    //
    // on default mouse move when mouse is down you see a dashed selection box
    //
    handleDefaultMouseMove: function(x,y,z,sender,e){
        if (e == null) { e = window.event;}
        if (PresCKUtil.connectorShapeTypes[this.createPackageOnClick.shapeType] == 1) {
            var position = {
                startX: x - this.mainNode.offsetLeft,
                startY: y - this.mainNode.offsetTop,
                endX: e.clientX - this.mainNode.offsetLeft,
                endY: e.clientY - this.mainNode.offsetTop,
                zIndex: z
            };
            if (!this.createPackageOnClick.svgDrawFrame &&
                this.createPackageOnClick.createNewContentBox && !this.outsideOfCanvas) {
                this.createPackageOnClick.svgDrawFrame = this.createPackageOnClick.callback(position);
                // Create event shield layer to prevent unecessary mouse events over slide editor as user drags or mouse ups on the boxSelectorNode
                this.eventShieldNode = document.createElement('div');
                this.mainNode.appendChild(this.eventShieldNode);
                dojo.style(this.eventShieldNode,{
                    'border':this.eventShieldSizeDiff+'px solid transparent',
                    'opacity':'.3',
                    'backgroundColor':'transparent',
                    'position':'absolute',
                    'zIndex' : z
                });
                this.creatingConnector = true;
            }
            if (this.createPackageOnClick.createNewContentBox &&
                this.createPackageOnClick.svgDrawFrame) {
                var svgDrawFrame = this.createPackageOnClick.svgDrawFrame;
                this.createPackageOnClick.resizeCallback(svgDrawFrame, position);
                //Update the eventShield
                if (this.eventShieldNode!=null){
                    dojo.style(this.eventShieldNode,{
                        'top':(parseFloat(svgDrawFrame.style.top)-this.eventShieldSizeDiff) +"px",
                        'left': (parseFloat(svgDrawFrame.style.left)-this.eventShieldSizeDiff) +"px",
                        'width': (parseFloat(svgDrawFrame.style.width)+this.eventShieldSizeDiff) +"px",
                        'height': (parseFloat(svgDrawFrame.style.height)+this.eventShieldSizeDiff) +"px"
                    }); 
                }
                this.creatingConnector = true;
            }
        } else {
            // JMT  - This feature is turned off for now D41057
            if (!this.boxSelectorNode && this.createPackageOnClick.createNewContentBox && !this.outsideOfCanvas){//D2843 Only create Box selector node if we are in the canvas
            	this.createBoxSelectorNode(z);
            }
            
            if (this.createPackageOnClick.createNewContentBox && this.boxSelectorNode) {//D2843 now that we know boxSelector node is on we can proceed
                var width =  e.clientX - x;
                var height = e.clientY-y;
                var top = 0;
                var left = 0;
                
                if ((width>0) && (height >0)){    //Mouse moving down and to the right
                    top=y;
                    left=x;
                    this.boxSelectorUsed= true; // For some reason when mouse moves in this direction we get a click event when mouseup after move
                } else if ((width<0) && (height >0)){ //Mouse moving down and to left
                    left=x+width; //x+ (eclientX - x)
                    top = y;
                    this.boxSelectorUsed= true; // For some reason when mouse moves in this direction we get a click event when mouseup after move
                } else if ((width<0) && (height <0)){  //Mouse moving up and to left
                    left=x+width; //x+ (eclientX - x)
                    top = y+height;
                    this.boxSelectorUsed= true; // For some reason when mouse moves in this direction we get a click event when mouseup after move
                } else if ((width>0) && (height <0)){  //Mouse moving up and to left
                    left=x; //x+ (eclientX - x)
                    top = y+height;
                    this.boxSelectorUsed= true; // For some reason when mouse moves in this direction we get a click event when mouseup after move
                }
                    
                var slideEditorOffsetTop = this.mainNode.offsetTop;
                var slideEditorOffsetLeft = this.mainNode.offsetLeft;
                 
                this.updateBoxSelectorNodeSize(top,left,width,height,slideEditorOffsetTop,slideEditorOffsetLeft);
            }
        }
    },
    
    //
    // This function updates the eventShield which is used to 
    // provide a layer over the boxSelectorNode to avoid mouse events on the slide editor as
    // user is dragging the boxSelectorNode
    //    
    updateBoxSelectorNodeSize: function(top,left,width,height,slideEditorOffsetTop,slideEditorOffsetLeft){
		//update Box selector node then shield
        dojo.style(this.boxSelectorNode,{
            'top': top - slideEditorOffsetTop +"px",
            'left': left - slideEditorOffsetLeft+"px",
            'width': (width<0)? -(width)+"px":width +"px",
            'height': (height<0)? -(height)+"px" : height +"px"
        });                      	
    	
    	//Update the eventShield
    	if (this.eventShieldNode!=null){
	        dojo.style(this.eventShieldNode,{
	            'top':(parseFloat(this.boxSelectorNode.style.top)-this.eventShieldSizeDiff) +"px",
	            'left': (parseFloat(this.boxSelectorNode.style.left)-this.eventShieldSizeDiff) +"px",
	            'width': (parseFloat(this.boxSelectorNode.style.width)+this.eventShieldSizeDiff) +"px",
	            'height': (parseFloat(this.boxSelectorNode.style.height)+this.eventShieldSizeDiff) +"px"
	        }); 
    	}    	
    },
    
    //
    //BoxSelectorNode is created along with the event shield
    // These two must be created and destroyed at the same time
    createBoxSelectorNode: function(z){
        this.boxSelectorNode = document.createElement('div');
        this.mainNode.appendChild(this.boxSelectorNode);
        dojo.style(this.boxSelectorNode,{
            'border':'8px solid lightblue',
            'opacity':'.3',
            'backgroundColor':'transparent',
            'position':'absolute',
            'zIndex' :z
        }); 
        
        // Create event shield layer to prevent unecessary mouse events over slide editor as user drags or mouse ups on the boxSelectorNode
        this.eventShieldNode = document.createElement('div');
        this.mainNode.appendChild(this.eventShieldNode);
        dojo.style(this.eventShieldNode,{
            'border':this.eventShieldSizeDiff+'px solid transparent',
            'opacity':'.3',
            'backgroundColor':'transparent',
            'position':'absolute',
            'zIndex' :z
        }); 
    },
    
    
    //destroys the boxselector and the event shield
    // These two must be created and destroyed at the same time
    destroyBoxSelectorNode: function(){
    	//Needs to check if object is null before destory, or there would be an exception thrown out.
    	if(this.boxSelectorNode)
    		dojo.destroy(this.boxSelectorNode);
    	
    	if(this.eventShieldNode)
    		dojo.destroy(this.eventShieldNode);	
        
    	this.boxSelectorNode =null;
        this.eventShieldNode=null;
    },
    
    //
    // handles mouse up on default 
    //
    handleDefaultMouseUp: function(selectBox,e){
    	//console.log("slideEditor:handleDefaultMouseUp","Entry");
        if (e == null) { e = window.event;}
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
        if (dojo.isIE){
             document.onmousemove=selectBox; // restore onmousemove prior to selectBox
        } else {
             dojo.disconnect(selectBox);
        }
        
         // JMT  - This feature is turned off for now D41057
         if (this.boxSelectorNode){
            // Check if a user is trying to create a new node.      
            if (this.createPackageOnClick.createNewContentBox) {
                //var position = this.getMousePosition(e);
                var position = this.getBoxSelectorArea(e);
                if (dojo.isIE){
                    if ((position.left<=0 && position.top<=0 && position.height<=0 && position.width <=0) || (!this.boxSelectorUsed)){
                    	this.destroyBoxSelectorNode();                                            
                        this.setDefaultMouseDown();
                        return; // return allow the handleClickonSlideEditor function to process event
                    }
                }else if(position.height <= 0 || position.width <= 0){
                	//D29025
                	this.destroyBoxSelectorNode();                                            
                    this.setDefaultMouseDown();
                	return; // return allow the handleClickonSlideEditor function to process event
                }               
                
                this.createPackageOnClick.pos =null;
                this.createPackageOnClick.callback(position);
                this.createPackageOnClick.callback = null;              
                this.createPackageOnClick.createNewContentBox = false;
                document.body.style.cursor='default';
            } else{               
                 // console.log('Done Selecting now to find content boxes within selection');
                //this.selectContentBoxesFromBoxSelector(pos);
            }
            this.destroyBoxSelectorNode();
          } else if (this.createPackageOnClick.svgDrawFrame) {
              if (this.createPackageOnClick.createNewContentBox) {
                  this.createPackageOnClick.finalizeCallback(this.createPackageOnClick.svgDrawFrame);
                  
                  this.createPackageOnClick.callback = null;
                  this.createPackageOnClick.resizeCallback = null;
                  this.createPackageOnClick.finalizeCallback = null;
                  this.createPackageOnClick.createNewContentBox = false;
                  this.createPackageOnClick.svgDrawFrame = null;
                  this.createPackageOnClick.shapeType = null;
                  document.body.style.cursor='default';
              }
              if(this.eventShieldNode)
                  dojo.destroy(this.eventShieldNode);
              this.eventShieldNode = null;
         }
         this.setDefaultMouseDown();
    },
    
    //
    // handles default mousedown behavior. Just a select drag box
    //
    handleDefaultMouseDown: function(e){
    	window.pe.scene.validResize = false;
    	
//      console.log('handleDefaultMouseDown: Will drag on mouse move');
//      console.log('x0, y0 :'+x + ' : ' + y);
//      console.log('x1 client , y1 client :'+e.clientX + ' : ' + e.clientY);
//      console.log('Position on editor is x:y  => '+(e.clientX - window.pe.scene.slideEditor.mainNode.offsetLeft) +' : '+ (e.clientY - window.pe.scene.slideEditor.mainNode.offsetTop));
//      console.log('x1 layer , y1 layer :'+e.layerX + ' : ' + e.layerY);
//      console.log('x1 offSet , y1 offset :'+e.offSetX + ' : ' + e.offsetY);

        var sender = null;
        if (e == null) { e = window.event;}
        if (e){ sender = (typeof( window.event ) != "undefined" ) ? e.srcElement : e.target; }
        if ( !sender){
            return false;
        }
        
        if (sender.nodeName == 'INPUT') {
        	// Don't do anything if the default mouse handler is set, but the event sender is an
        	// input box.  This means the event came from a dialog, toolbar, or side panel.
        	return false;
        }
        
        var x=e.clientX;
        var y=e.clientY;
        var z= this.getzIndexCtr();
        var selectBox =null;
        if (dojo.isIE){             
            selectBox = this.selectBox = document.onmousemove;
            document.onmousemove = dojo.hitch(this,this.handleDefaultMouseMove,x,y,z,sender);
        }else{     
        	if (this.selectBox) dojo.disconnect(this.selectBox);
            selectBox = this.selectBox = dojo.connect(window,'onmousemove',dojo.hitch(this,this.handleDefaultMouseMove,x,y,z,sender));            
        }
        
        if (dojo.isIE){             
            document.onmouseup = dojo.hitch(this,this.handleDefaultMouseUp,selectBox);
        }else{    
            if (this.mouseupEvent) dojo.disconnect(this.mouseupEvent);
            this.mouseupEvent =  dojo.connect(document,'onmouseup',dojo.hitch(this,this.handleDefaultMouseUp,selectBox));
        }       
        //15647 - when a dialog is is opened and we resize the window small to get the document window scroll bars, clicking on the scroll bar then resize, has issues
    	//validResize was set to false in handleDefaultMouseDown
		//need to reset ie validResize flag to true here to activate resize
        if(dojo.isIE<9){
	    	setTimeout (function(){
	    		window.pe.scene.validResize = true;
	    	}, 500 );
        } 
        return false;
    },
    
    
    //
    // getsContentBoxes that fall within a pos area and selects them
    //
    selectContentBoxesFromBoxSelector: function(pos){
        var contentBoxesArray = this.getContentBoxesInArea(pos);
        for (var i=0; i< contentBoxesArray.length; i++){
            contentBoxesArray[i].selectThisBox();
        }           
    },
    
    //
    // Gets ContentBoxes that fall within a pos area
    //
    getContentBoxesInArea: function(pos){
        var resultArray = [];
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
            if (this.isBoxInArea(this.CONTENT_BOX_ARRAY[i].mainNode,pos).isIncluded){
                resultArray.push(this.CONTENT_BOX_ARRAY[i]);
            }
        }   
        return resultArray;
    },
    
    //
    // Gets ContentBoxes that fall within a pos area
    //
    getContentBoxesThatCollideWithArea: function(pos){
        var resultArray = [];
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
            if (this.isBoxInArea(this.CONTENT_BOX_ARRAY[i].mainNode,pos).collidesWith){
                resultArray.push(this.CONTENT_BOX_ARRAY[i]);
            }
        }   
        return resultArray;
    },  
    
    //
    // returns true if box in totally included in the area
    //
    isBoxInArea: function(nodeBox,area){
        var ctop = nodeBox.offsetTop;
        var cleft =  nodeBox.offsetLeft ;
        var cwidth =  nodeBox.offsetWidth ;
        var cheight =  nodeBox.offsetHeight ;

        var corners =[];
        //tl
        corners.push({'top':ctop,'left':cleft,'isIncluded':true,'topOfTargetArea':false,'bottomOfTargetArea':false,'leftOfTargetArea':false,'rightOfTargetArea':false});
        //tr
        corners.push({'top':ctop,'left':cleft+cwidth,'isIncluded':true,'topOfTargetArea':false,'bottomOfTargetArea':false,'leftOfTargetArea':false,'rightOfTargetArea':false});
        //bl
        corners.push({'top':ctop+cheight,'left':cleft,'isIncluded':true,'topOfTargetArea':false,'bottomOfTargetArea':false,'leftOfTargetArea':false,'rightOfTargetArea':false});
        //br
        corners.push({'top':ctop+cheight,'left':cleft+cwidth,'isIncluded':true,'topOfTargetArea':false,'bottomOfTargetArea':false,'leftOfTargetArea':false,'rightOfTargetArea':false});
        
        var isIncluded = true;      
        for(var i=0; i<corners.length;i++ ){
            var corner = corners[i];
            var top = corner.top;
            var left = corner.left;
            corners[i].isIncluded= true;
            if ((top < area.top)|| (top > area.top+area.height)){
                isIncluded = false;
                corners[i].isIncluded= false;
                //break;
                //this corner is outside let's find out where
                if (top < area.top){
                    corners[i].topOfTargetArea = true;
                    corners[i].bottomOfTargetArea = false;
                }else if (top > area.top+area.height){
                    corners[i].topOfTargetArea = false;
                    corners[i].bottomOfTargetArea = true;                   
                } 
            }
            if ((left < area.left) || (left > area.left+area.width)){
                isIncluded = false;
                corners[i].isIncluded= false;
                //break;
                //this corner is outside let's find out where
                if (left < area.left){
                    corners[i].leftOfTargetArea = true;
                    corners[i].rightOfTargetArea = false;
                }else if (left > area.left+area.width){
                    corners[i].leftOfTargetArea = false;
                    corners[i].rightOfTargetArea = true;                    
                }
            }               
        }       
                
        var collidesWith = (corners[0].isIncluded || corners[1].isIncluded || corners[2].isIncluded ||corners[3].isIncluded);
        var location = [];
        if (!(collidesWith) && !(isIncluded)){// If not included and does not collide then object is totally of the canvas need to determine where
            if (corners[0].topOfTargetArea && corners[1].topOfTargetArea && corners[2].topOfTargetArea &&corners[3].topOfTargetArea){
                location.push(this.TOP_OF_AREA);
            }if (corners[0].bottomOfTargetArea && corners[1].bottomOfTargetArea && corners[2].bottomOfTargetArea &&corners[3].bottomOfTargetArea){
                location.push(this.BOTTOM_OF_AREA);
            }if (corners[0].leftOfTargetArea && corners[1].leftOfTargetArea && corners[2].leftOfTargetArea &&corners[3].leftOfTargetArea){
                location.push(this.LEFT_OF_AREA);
            }if (corners[0].rightOfTargetArea && corners[1].rightOfTargetArea && corners[2].rightOfTargetArea &&corners[3].rightOfTargetArea){
                location.push(this.RIGHT_OF_AREA);
            }
        }
        return {'isIncluded': isIncluded,'cornerStatus':corners,'nodeBox':nodeBox,'collidesWith':collidesWith,'locationToTargetArea':location};
    },
    
    //
    // returns true if box in totally included in the area
    //
    isAreaInSlideEditor: function(area){        
        var corners =[];
        //tl
        corners.push({'top':area.top,'left':area.left,'isIncluded':true});
        //tr
        corners.push({'top':area.top,'left':area.left+area.width,'isIncluded':true});
        //bl
        corners.push({'top':area.top+area.height,'left':area.left,'isIncluded':true});
        //br
        corners.push({'top':area.top+area.height,'left':area.left+area.width,'isIncluded':true});
        
        var slideEditorArea = {'top':  dojo.style(this.mainNode,'top'),
                   'left': dojo.style(this.mainNode,'left'),
                   'width': dojo.style(this.mainNode,'width'),
                   'height': dojo.style(this.mainNode,'height')
                };
        
        
        var isIncluded = true;      
        for(var i=0; i<corners.length;i++ ){
            var corner = corners[i];
            var top = corner.top;
            var left = corner.left;
            corners[i].isIncluded= true;
            if ((top < slideEditorArea.top)|| (top > slideEditorArea.top+slideEditorArea.height)){
                isIncluded = false;
                corners[i].isIncluded= false;
                //break;
            }
            if ((left < slideEditorArea.left) || (left > slideEditorArea.left+slideEditorArea.width)){
                isIncluded = false;
                corners[i].isIncluded= false;
                //break;
            }           
        }       
        return {'isIncluded': isIncluded,'cornerStatus':corners,'area':area};
    },
    
    //
    // checks if nodeBox collides with nodeBox2
    // 
    //
    isBoxInBox: function(nodeBox,nodeBox2){     
        var corners =[];
        //tl
        corners.push({'top':dojo.style(nodeBox,'top'),'left':dojo.style(nodeBox,'left'),'isIncluded':true});
        //tr
        corners.push({'top':dojo.style(nodeBox,'top'),'left':dojo.style(nodeBox,'left')+dojo.style(nodeBox,'width'),'isIncluded':true});
        //bl
        corners.push({'top':dojo.style(nodeBox,'top')+dojo.style(nodeBox,'height'),'left':dojo.style(nodeBox,'left'),'isIncluded':true});
        //br
        corners.push({'top':dojo.style(nodeBox,'top')+dojo.style(nodeBox,'height'),'left':dojo.style(nodeBox,'left')+dojo.style(nodeBox,'width'),'isIncluded':true});
        
        var isIncluded = true;      
        for(var i=0; i<corners.length;i++ ){
            var corner = corners[i];
            var top = corner.top;
            var left = corner.left;
            corners[i].isIncluded= true;
            if ((top < dojo.style(nodeBox2,'top'))|| (top > dojo.style(nodeBox2,'top')+dojo.style(nodeBox2,'height'))){
                isIncluded = false;
                corners[i].isIncluded= false;
                //break;
            }
            if ((left < dojo.style(nodeBox2,'left')) || (left > dojo.style(nodeBox2,'left')+dojo.style(nodeBox2,'width'))){
                isIncluded = false;
                corners[i].isIncluded= false;
                //break;
            }           
        }       
        return {'isIncluded': isIncluded,'cornerStatus':corners,'nodeBox':nodeBox};
    },  
    //
    // Deselects all content Boxes
    //
    deSelectAll: function(){
        //console.log("slideEditor:deSelectAll","Entry");
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
        	var box = this.CONTENT_BOX_ARRAY[i];
        	
        	if(!box.isWidgitized)
        		continue;
        		
            box.deSelectThisBox();
            if (typeof box.deleteMe != "undefined" && box.deleteMe != null && box.deleteMe == true){
            	i--;
            }
            if (this.SINGLE_CK_MODE==true && box.boxRep){
            	box.boxRep.unLoadSpare();
            }
        }   
        //console.log("slideEditor:deSelectAll","Exit");
        //document.onmousedown=null;
        this.setDefaultMouseDown();
        
        if (!concord.util.browser.isMobile()) {
	        concord.util.presToolbarMgr.toggleBGFillColorButton('off');
	        concord.util.presToolbarMgr.toggleBorderColorButton('off');
	        concord.util.presToolbarMgr.toggleVerticalAlignButton('off');
        }
    },

    //
    // Selects all content Boxes
    //
    selectAll: function(){
        //console.log("slideEditor:selectAll","Entry");
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
        	if (this.CONTENT_BOX_ARRAY[i].contentBoxType!=PresConstants.CONTENTBOX_NOTES_TYPE) {
            	if(!this.CONTENT_BOX_ARRAY[i].isWidgitized)
            		this.widgitizeObject(this.CONTENT_BOX_ARRAY[i]);
        		
        		this.CONTENT_BOX_ARRAY[i].toggleEditMode(false);
            	this.CONTENT_BOX_ARRAY[i].selectThisBox();  
            }        
        }     
        this.setDefaultMouseDown();
    },

    //
    // Publish Slide has been updated
    // This function is not used but is left as a placeholder in case we need a general slidechange message.
    // 
    publishSlideChanged: function(){
    },

    //
    // Publish Slide has been updated
    //
    publishSlideEditorInFocus: function(){      
        concord.util.events.publish(concord.util.events.slideEditorEvents_Focus, null);
    },  
    
    
    //
    // Deselects all contentBoxes but the one passed to this function.
    // If forceDeselect is true then deselection will occur regardless
    // of multipleBoxSelection value.
    // When MULTI_MOVE_ON is on we should not deselect items. Override forceDeselect arg.
    // This the case when user is multimoving objects then mouses up to complete the onclick event.
    //
    deSelectAllButMe: function(contentBox,forceDeselect){
        var myUid = contentBox.boxUID;
        // 42540: There will no border around shape draw frame after select more shape then move
        if(dojo.hasClass(contentBox.mainNode, "g_draw_frame")== true) {
            //find draw-frame parent
            var dfp = this.getParentDrawFrameNode(contentBox.mainNode);
            if(dfp!=null){
                drawFrameNode = dfp;
                drawFrameContentBoxObj = this.getRegisteredContentBoxById(drawFrameNode.id);
                if (drawFrameContentBoxObj)
                    myUid = drawFrameContentBoxObj.boxUID;
            }
        }
        var forceD = forceDeselect; 
        if (this.MULTI_MOVE_ON){
            forceD = false;
            this.MULTI_MOVE_ON = false;
        }
        if ((!forceD)&&(this.isMultipleBoxSelected()))
            return;
        
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++) {
        	var box = this.CONTENT_BOX_ARRAY[i];
            if (myUid != box.boxUID && box.boxSelected) {
            	box.deSelectThisBox();
                
                if (this.SINGLE_CK_MODE==true && box.boxRep){
                	box.boxRep.unLoadSpare();
                }
            }
        }  // end for
        
        this.publishSlideEditorInFocus();
        //              
    },
    
    isBoxSelected: function(){
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){            
          if (this.CONTENT_BOX_ARRAY[i].boxSelected){
        	  return true;
          }
        }           
        return false;
    },
    
    //
    // Test returns true if multiple boxes are selected
    //
    isMultipleBoxSelected: function(count){
        var counter = 0;
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){            
          if (this.CONTENT_BOX_ARRAY[i].boxSelected){
            if (counter > 0){
              return true;
            } else {
              counter++;
            }
          }
        }           
        return false;
    },
    
    //
    // Prepares and handles  multiselect boxes  n case of multi move
    //
    handleMultiBoxSelected: function(e){
        //for multi Move
        //console.log('slideEditor:handleMultiBoxSelected','Entry');
        //Turn off moveable for all box objects to allow slideEditor to control moving of node
        // and toggle editmode off    	
        if (this.isMultipleBoxSelected()){
            for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
            	if(this.CONTENT_BOX_ARRAY[i].boxSelected)
            		this.CONTENT_BOX_ARRAY[i].toggleEditMode(false);
            }   
        }
        //document.onmousedown=dojo.hitch(this,this.updateMouseDownForMultiSelectMove);
        this.updateMouseDownForMultiSelectMove(e);
        this.publishSlideEditorInFocus();
        this.publishDisableComments();
    },

    //
    // handlesMultiSelectMouseMove deal one and multi objects 
    //
    handlesMultiSelectMouseMove: function(selectedBoxArray,x,y,sender,resizing,e){ 
        if (e == null) { e = window.event;}         
    	if (this.SINGLE_CK_MODE){
			if ((e.clientX==x) && (e.clientY==y)){//Mouse did not move so return. This is IE again sending erroneous mouse mouve events
				return;
			}
    	}
    	if (resizing){
            this.RESIZE_FLAG=true;
            var objArray = [];
            for (var i=0; i<selectedBoxArray.length; i++){
                var contentBoxObj = selectedBoxArray[i];
                if(contentBoxObj.boxContainer.isRotated()){
                	this.showWarningMsgForRotatedObject();
                	continue;
                }
                
                // Make sure all content box has no resize forbidden flag
                if (!this._isContentBoxResizeForbidden(selectedBoxArray)) {
                    // Add resize tempLayer to smooth out resize
                    if ( !contentBoxObj.boxContainer.tempLayer){
                        contentBoxObj.boxContainer.addTempMoveResizeDiv();
                    }
                    
                    var box = contentBoxObj.boxContainer;
                    if (PresCKUtil.isConnectorShape(box.mainNode)) {
                        var linePosBeforeMove = contentBoxObj.linePos;
                        if (linePosBeforeMove) {
                            var pos = null;
                            if (dojo.hasClass(sender,'start')) {
                                pos = {
                                    startX: e.clientX - this.mainNode.offsetLeft,
                                    startY: e.clientY - this.mainNode.offsetTop,
                                    endX: linePosBeforeMove.x2,
                                    endY: linePosBeforeMove.y2
                                };
                            } else if (dojo.hasClass(sender,'end')){
                                pos = {
                                    startX: linePosBeforeMove.x1,
                                    startY: linePosBeforeMove.y1,
                                    endX: e.clientX - this.mainNode.offsetLeft,
                                    endY: e.clientY - this.mainNode.offsetTop
                                };
                            }
                            if (pos != null) {
                                this.resizeConnectorShape(box.mainNode, pos);
                                box.updateHandlePositions(false);
                            }
                        }
                    } else {
                        if (dojo.hasClass(sender,'tl')) {
                        	box.resizeFromHandler(contentBoxObj.posL,contentBoxObj.posT,contentBoxObj.posH,contentBoxObj.posW,x,y,e,'tl');
                        } else if (dojo.hasClass(sender,'tm')){
                        	box.resizeFromHandler(contentBoxObj.posL,contentBoxObj.posT,contentBoxObj.posH,contentBoxObj.posW,x,y,e,'tm');
                        } else if (dojo.hasClass(sender,'tr')){
                        	box.resizeFromHandler(contentBoxObj.posL,contentBoxObj.posT,contentBoxObj.posH,contentBoxObj.posW,x,y,e,'tr');
                        } else if (dojo.hasClass(sender,'ml')){
                        	box.resizeFromHandler(contentBoxObj.posL,contentBoxObj.posT,contentBoxObj.posH,contentBoxObj.posW,x,y,e,'ml');
                        } else if (dojo.hasClass(sender,'mr')){
                        	box.resizeFromHandler(contentBoxObj.posL,contentBoxObj.posT,contentBoxObj.posH,contentBoxObj.posW,x,y,e,'mr');
                        } else if (dojo.hasClass(sender,'bl')){
                        	box.resizeFromHandler(contentBoxObj.posL,contentBoxObj.posT,contentBoxObj.posH,contentBoxObj.posW,x,y,e,'bl');
                        } else if (dojo.hasClass(sender,'bm')){
                        	box.resizeFromHandler(contentBoxObj.posL,contentBoxObj.posT,contentBoxObj.posH,contentBoxObj.posW,x,y,e,'bm');
                        } else if (dojo.hasClass(sender,'br')){
                        	box.resizeFromHandler(contentBoxObj.posL,contentBoxObj.posT,contentBoxObj.posH,contentBoxObj.posW,x,y,e,'br');                                                                   
                        }
                    }
                }
            }

        } else { // Not resizing then move
            var objArray = [];
            this.MOVE_FLAG = true; //used to signal on mouse up when move is done
            if (this.isMultipleBoxSelected()){
                this.MULTI_MOVE_ON =true; // used to control select and deselect behavior when multi box selected for move
            }else {
                for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
                	var contentBoxObj = this.CONTENT_BOX_ARRAY[i];
                    if(contentBoxObj.isRotated()){
                    	continue;
                    }
                    if (contentBoxObj.boxSelected && !contentBoxObj.tempLayer && contentBoxObj.contentBoxType != PresConstants.CONTENTBOX_NOTES_TYPE){
                        // Add resize tempLayer to smooth out move
                        contentBoxObj.addTempMoveResizeDiv();
                    }
                }   
            }
            for (var i=0; i<selectedBoxArray.length; i++){ 
            	var contentBoxObj = selectedBoxArray[i];
                if(contentBoxObj.boxContainer.isRotated()){
                	this.showWarningMsgForRotatedObject();
                	continue;
                }
            	if (selectedBoxArray[i].boxContainer.contentBoxType != PresConstants.CONTENTBOX_NOTES_TYPE) {
            		var newTop  = contentBoxObj.boxContainer.PxToPercent(contentBoxObj.posT+(e.clientY-y),'height')+"%";
            		var newLeft = contentBoxObj.boxContainer.PxToPercent(contentBoxObj.posL+(e.clientX-x),'width')+"%";
            		dojo.style(contentBoxObj.boxContainer.mainNode,{
            			'top':newTop,
            			'left':newLeft
            		});                             
//            		objArray = this.buildDataList(objArray,selectedBoxArray[i].boxContainer,'Resizing'); 
            	}
            }
            //if (this.isMultipleBoxSelected()){
//                var eventData = [{'eventName': concord.util.events.LocalSync_eventName_multiBoxAttributeChange, 'ObjList':objArray}];
//                concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);              
            //}
        } 
    	if(dojo.isSafari && !concord.util.browser.isMobile())
    		pe.scene.clipboard.focusClipboardContainer();
    },
    
    // Create connector line/arrow start and end position message
    createConnectorPosMsg : function( dataNode, msgActs) {
        var newMsgActs = msgActs ? msgActs : [];
        // Create line pos message acts
        dojo.query('line', dataNode).forEach(function(node){
            var newAttrObj = {};
            newAttrObj.x1 = dojo.attr(node, 'x1');
            newAttrObj.y1 = dojo.attr(node, 'y1');
            newAttrObj.x2 = dojo.attr(node, 'x2');
            newAttrObj.y2 = dojo.attr(node, 'y2');
            
            var oldAttrObj = {};
            var nodeInSorter = dojo.query("#"+node.id,
                pe.scene.slideSorter.getSorterDocument());
            if (nodeInSorter && nodeInSorter.length > 0) {
                nodeInSorter = nodeInSorter[0];
                oldAttrObj.x1 = dojo.attr(nodeInSorter, 'x1');
                oldAttrObj.y1 = dojo.attr(nodeInSorter, 'y1');
                oldAttrObj.x2 = dojo.attr(nodeInSorter, 'x2');
                oldAttrObj.y2 = dojo.attr(nodeInSorter, 'y2');
            }
            
            var act = SYNCMSG.createAttributeAct(node.id, newAttrObj,
                    null, oldAttrObj, null);
            newMsgActs.push(act);
        });
        return newMsgActs;
    },

    publishResize: function(selectedBoxArray) {
    	console.info("publish resize")
  	 // 34833: [B2B][Regression]Resize table with multi level
      // list will make text out of table cell, and can't restore to original after undo
       function _createMarginCoeditMessage( dataNode, marginSnapshot, msgActs) {
          function  _buildMsg( node, valueName ) {
              var line = PresCKUtil.ChangeToCKNode(node);
              var bMarginLeft = (valueName == 'margin-left');
              var prevValue = bMarginLeft?marginSnapshot.marginLeft[node.id]:marginSnapshot.textindent[node.id];
              var newValue = line.getStyle(valueName);
              if ( newValue && newValue != prevValue){
                  var dataAttr = {};
                  dataAttr.id = node.id;
                  dataAttr.attributeName = 'style';
                  dataAttr.attributeValue = valueName + ':' + newValue + '; '; 
                  var attrObj = SYNCMSG.getAttrValues(dataAttr, window.document);
                  attrObj.oldStyleValue = valueName + ':' + prevValue + '; ';
                  var act = SYNCMSG.createAttributeAct(dataAttr.id, attrObj.newAttrValue,
                      attrObj.newStyleValue, attrObj.oldAttrValue, attrObj.oldStyleValue);
                  newMsgActs.push(act);
              }
          }
          var newMsgActs = msgActs ? msgActs : [];
          dojo.query('li , p', dataNode).forEach(function(node){
              _buildMsg( node, 'margin-left' );
              _buildMsg( node, 'text-indent' );
          });
          return newMsgActs;
      }
      var objArray = [];
      var msgActs = [];
      for (var i=0; selectedBoxArray && ( i < selectedBoxArray.length); i++){
          var contentBox = selectedBoxArray[i].boxContainer;
          if(contentBox.isRotated()){
             	continue;
          }
          var marginSnapshot = selectedBoxArray[i].marginSnapshot;
          if (contentBox.contentBoxType != PresConstants.CONTENTBOX_NOTES_TYPE) {
              this.checkBoxPosition(contentBox);
          }
          contentBox.checkMainNodeHeightandUpdate(true);
          msgActs = _createMarginCoeditMessage(
                  contentBox.contentBoxDataNode, marginSnapshot, msgActs );
          msgActs = this.createConnectorPosMsg(
                  contentBox.contentBoxDataNode, msgActs );
          if (this.isMultipleBoxSelected()){
              objArray = this.buildDataList(objArray,contentBox,'ResizingEnd');
          }else {
              // Send margin acts together with draw fram change as a "a" message
              contentBox.publishBoxStyleResizingEnd(msgActs);
          }
          if ( contentBox.tempLayer){
              contentBox.removeTempMoveResizeDiv();
          }
          // Update lock icon position if it has
          contentBox.updateContentBoxLockedIconPosition();
      }
      setTimeout(dojo.hitch(this, function(){
          this.RESIZE_FLAG = false;
      }),10);
      if (this.isMultipleBoxSelected()){
          // Send margin acts together with draw fram change as a "a" message
          var eventData = [{'eventName': concord.util.events.LocalSync_eventName_multiBoxAttributeChange,
              'ObjList':objArray, 'marginMsgActs':msgActs}];
          concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
      }
      if(this.selectedBoxArrayForResize){
      	this.selectedBoxArrayForResize.length=0;
      	delete this.selectedBoxArrayForResize;
      }
  },

   
   _isContentBoxResizeForbidden : function(selectedBoxArray) {
       if (!selectedBoxArray) return false;
       for (var i=0; i < selectedBoxArray.length; i++){
           var contentBox = selectedBoxArray[i].boxContainer;
           if (contentBox && contentBox.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE &&
               dojo.isWebKit && contentBox.resizeForbidden) {
               return true;
           }
       }
       return false;
   },
   
   //
   // handlesMultiSelectMouseUp, deal one and multi objects 
   //
   handlesMultiSelectMouseUp: function(TL_move,resizing,selectedBoxArray,e) {
//       console.log('slideEditor: handlesMultiSelectMouseUp: Mouse will not move selected object');
       if (e == null) e = window.event;
       if ((e) && (e.stopPropagation)) e.stopPropagation();
       if (dojo.isIE){
       	if (this.horizontalRuler && this.verticalRuler)
       		document.onmousemove = dojo.hitch(this, this.handleRulersMouseMove);
       	else
       		document.onmousemove = null;
           document.onmouseup = null;
       } else{
           //dojo.disconnect(TL_move);
           if (this.TL_move) {
               dojo.disconnect(this.TL_move);
           }
           if (this.TL_CONNECT){
               dojo.disconnect(this.TL_CONNECT);
           }
       }
       this.setDefaultMouseDown();
       
       if(resizing) {
           // For table in webkit, when resize directly from edit mode
           // a timer is used to swich edit mode as false
           // if edit mode is not set as false actually
           // resize is forbidden for it. Or data lost will happen in coedit mode
           if(this._isContentBoxResizeForbidden(selectedBoxArray)) {
               // Clear vars set for resize even if resize is not executed
               // Or cannot enter into edit mode anymore
               setTimeout(dojo.hitch(this, function() {
                   this.RESIZE_FLAG = false;
               }),10);
               if(this.selectedBoxArrayForResize) {
                   this.selectedBoxArrayForResize.length=0;
                   delete this.selectedBoxArrayForResize;
               }
               return;
           }

           this.publishResize(selectedBoxArray);
       }
       else if (this.MOVE_FLAG){//then moving     
           setTimeout(dojo.hitch(this, function(){
               this.MOVE_FLAG = false;
           }),10);
           
           var objArray = [];
           for (var i=0; i<selectedBoxArray.length; i++){  
        	   if(selectedBoxArray[i].boxContainer.isRotated()){
        		   continue;
        	   }
               this.checkBoxPosition(selectedBoxArray[i].boxContainer);                    
               if (this.isMultipleBoxSelected()){
                   objArray = this.buildDataList(objArray,selectedBoxArray[i].boxContainer,'ResizingEnd');             
               }else {
                 // reuse 'resizing' msg
                   selectedBoxArray[i].boxContainer.publishBoxStyleResizingEnd();
                   if ( selectedBoxArray[i].boxContainer.tempLayer){
                       selectedBoxArray[i].boxContainer.removeTempMoveResizeDiv();
                   }
               }
           }
           
           if (this.isMultipleBoxSelected()){
           	var eventData = [{'eventName': concord.util.events.LocalSync_eventName_multiBoxAttributeChange, 'ObjList':objArray}];
               concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);                      
           }
       }
   },

    
    handleUpdateSlideNumber: function(data){
    	var slideNumber = data.slideNumber;
    	if(slideNumber!=null){
    		var slide = this.mainNode;
    		concord.widgets.headerfooter.headerfooterUtil.updatePageNumber(slide, slideNumber);
    	}
    },
    
    //
    //
    //
    buildDataList: function(objList,boxContainer,flag) {
        var objArray = objList;
        if (objArray==null)
            objArray = [];
            
        var obj ={'id':null, 'data':{}};
        obj.id = boxContainer.mainNode.id;
        var node = boxContainer.mainNode;
        var attrName  = 'style';
        
        node = boxContainer.adjustPositionForBorder(node,true);         
        
        var ckNode = new CKEDITOR.dom.node(node);
        var attrValue = ckNode.getAttribute('style');
                        
        if (attrValue && attrValue.charAt(attrValue.length-1) != ';')
            attrValue = attrValue + ";";
        //Let's replace resizableContainerSelected if present. We do not wish to synch this if present in value                         
        attrValue = attrValue.replace('resizableContainerSelected','resizableContainer');   
        
        obj.data.attributeName = attrName;
        obj.data.attributeValue = attrValue;
        obj.data.id = obj.id ;
        if(flag) 
            obj.data.flag=flag;
        objArray.push(obj);
        return objArray;
    },
    
    getConnectorShapePxPos: function(svgDrawFrameNode) {
        if (!svgDrawFrameNode) return;
        var left = svgDrawFrameNode.offsetLeft;
        var top = svgDrawFrameNode.offsetTop;
        var width = svgDrawFrameNode.offsetWidth;
        var height = svgDrawFrameNode.offsetHeight;
        
        var lineArray = dojo.query('line.line', svgDrawFrameNode);
        if (lineArray && lineArray.length > 0) {
            var lineNode = lineArray[0];
            var x1 = parseFloat(dojo.attr(lineNode, 'x1'))/100;
            var y1 = parseFloat(dojo.attr(lineNode, 'y1'))/100;
            var x2 = parseFloat(dojo.attr(lineNode, 'x2'))/100;
            var y2 = parseFloat(dojo.attr(lineNode, 'y2'))/100;
            
            var linePos = {
                'x1': left + width * x1,
                'y1': top + height * y1,
                'x2': left + width * x2,
                'y2': top + height * y2
            };
            return linePos;
        }
        return null;
    },
    
    //
    // Prepares and handles  multi move and multi resize
    //  
    updateMouseDownForMultiSelectMove: function(e){
        //console.log('slideEditor: updateMouseDownForMultiSelectMove: Mouse will move selected object');
        function _getMarginSnapshot (mainNode) {
            var marginSnapshot = {};
            marginSnapshot.marginLeft = [];
            marginSnapshot.textindent = [];
            dojo.query('li , p', mainNode ).forEach(function(node, index, arr){
                var line  = PresCKUtil.ChangeToCKNode(node);
                marginSnapshot.marginLeft[node.id] = line.getStyle('margin-left');
                marginSnapshot.textindent[node.id] = line.getStyle('text-indent');
            });
            return marginSnapshot;
        }

        var sender = null;
        var resizing = false;
        if (e == null) { e = window.event;}
        if (e ){sender = (typeof( window.event ) != "undefined" ) ? e.srcElement : e.target; }
        if ( !sender){
            this.setDefaultMouseDown(e);
            return false;
        }
        if (dojo.hasClass(sender,'handle')){
            resizing = true;
        }
//        PresCKUtil.normalizeMsgSeq(null,null,null,'beginMerge');
        
        var selectedBoxArray = [];
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
            if (this.CONTENT_BOX_ARRAY[i].boxSelected) {  
            	//Check each box for editmode,13550-  for group, kick out from edit mode while resize/move
        		var contentBox = this.CONTENT_BOX_ARRAY[i];
        				
    				if (window.pe.scene.slideEditor.SINGLE_CK_MODE && contentBox.contentBoxType ==PresConstants.CONTENTBOX_GROUP_TYPE && contentBox.boxRep!=null){ // this is a spare in it is representing a box
    					contentBox.deSelectThisBox();
    					try{
    						contentBox = contentBox.boxRep.unLoadSpare();
    					}catch (env){
                                            console.log('sth is wrong');
    					}	
    					contentBox.selectThisBox();
    				}
                    if (PresCKUtil.isConnectorShape(this.CONTENT_BOX_ARRAY[i].mainNode)) {
                        var linePos = this.getConnectorShapePxPos(this.CONTENT_BOX_ARRAY[i].mainNode);
                        selectedBoxArray.push({'boxContainer':this.CONTENT_BOX_ARRAY[i],
                            'posL':parseFloat(this.CONTENT_BOX_ARRAY[i].mainNode.offsetLeft),  // for move
                            'posT':parseFloat(this.CONTENT_BOX_ARRAY[i].mainNode.offsetTop),  // for move
                            'linePos': linePos});// for resize
                    } else {
                        selectedBoxArray.push({'boxContainer':this.CONTENT_BOX_ARRAY[i],
                                       'posL':parseFloat(this.CONTENT_BOX_ARRAY[i].mainNode.offsetLeft),
                                       'posT':parseFloat(this.CONTENT_BOX_ARRAY[i].mainNode.offsetTop),
                                       'posH': (this.CONTENT_BOX_ARRAY[i].mainNode.offsetHeight - this.CONTENT_BOX_ARRAY[i].getHeight_adjust()),
                                       'posW': (this.CONTENT_BOX_ARRAY[i].mainNode.offsetWidth - this.CONTENT_BOX_ARRAY[i].getWidth_adjust()),
                                       'marginSnapshot': _getMarginSnapshot( this.CONTENT_BOX_ARRAY[i].contentBoxDataNode)
                                      });
                    }
            }
        }
        this.selectedBoxArrayForResize = selectedBoxArray;   
        var x=e.clientX;
        var y=e.clientY;
        var TL_move = null;
        var isMobile = concord.util.browser.isMobile();
        if (dojo.isIE){
              TL_move = this.TL_move = document.onmousemove;
              this.TL_CONNECT = document.onmouseup;
              document.onmousemove = dojo.hitch(this,this.handlesMultiSelectMouseMove,selectedBoxArray,x,y,sender,resizing);
              document.onmouseup = dojo.hitch(this,this.handlesMultiSelectMouseUp,TL_move,resizing,selectedBoxArray);   
              document.ondragstart = function(e) { return false; };
        }else{
            //before we connect let's make sure any previous connections are disconnected to avoid mouse stick
            if (this.TL_move){
                dojo.disconnect(this.TL_move);
            } if (this.TL_CONNECT){
                dojo.disconnect(this.TL_CONNECT);
            }
            TL_move = this.TL_move= dojo.connect(window,isMobile?'ontouchmove':'onmousemove',dojo.hitch(this,this.handlesMultiSelectMouseMove,selectedBoxArray,x,y,sender,resizing));
            this.TL_CONNECT = dojo.connect(document,isMobile?'ontouchend':'onmouseup',dojo.hitch(this,this.handlesMultiSelectMouseUp,TL_move,resizing,selectedBoxArray));
        }
        if(dojo.isSafari && !concord.util.browser.isMobile())
        	pe.scene.clipboard.focusClipboardContainer();          
        return false;
    },
    
    //
    // Context Menu
    //
    addContextMenu : function(){
    	var node = this.mainNode;
        var ctxMenu =  this.ctxMenu = new dijit.Menu();
        dojo.addClass(ctxMenu.domNode,"lotusActionMenu");
        ctxMenu.domNode.style.display ='none';
        document.body.appendChild(ctxMenu.domNode);
        ctxMenu.bindDomNode(node);
        var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
        var menuItem1 = this.menuItem1 = new dijit.MenuItem({
            label: this.STRINGS.ctxMenu_createSlide,
            iconClass:"createSlideIcon",
            onClick:  function() {                  
                var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_createNewSlide}];
                concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
            },
            dir: dirAttr
        });        

        var menuItem3a = this.menuItem3a = new dijit.MenuItem({
            label: this.STRINGS.ctxMenu_selectAll,
            iconClass:"selectAll",
            onClick: dojo.hitch(this,this.selectAll),
            dir: dirAttr
        });         

        var menuItem4 = this.menuItem4 = new dijit.MenuItem({
            label: this.STRINGS.ctxMenu_createTextBox,
            iconClass:"addNewTextNodeIcon",
            onClick: dojo.hitch(this,this.prepareToCreateContentBox,{'pos':null,'callback':dojo.hitch(this,this.makeSpareReal)}),
            dir: dirAttr
        });        
        
        var menuItem5 = this.menuItem5 = new dijit.MenuItem({
            label:this.STRINGS.ctxMenu_addImage+this.STRINGS.tripleDot, 
            iconClass:"addNewImageIcon",
            onClick: dojo.hitch(this,this.openAddNewImageDialog,dojo.hitch(this,this.addImageContentBox)),
            dir: dirAttr
        }); 
        
        var menuItem5a = this.menuItem5a = new dijit.MenuItem({
            label: this.STRINGS.ctxMenu_createTable+this.STRINGS.tripleDot, 
            iconClass:"addNewTableIcon",
            onClick: dojo.hitch(this,this.launchCreateTableDialog),      
            dir: dirAttr
        });         
        
        var menuItem6 = this.menuItem6 = new dijit.MenuItem({
            label: this.STRINGS.ctxMenu_slideLayout+this.STRINGS.tripleDot, 
            iconClass:"layoutGalleryIcon",
            onClick: dojo.hitch(this,this.openLayoutDialog),     
            dir: dirAttr
        }); 
        
//        var menuItem7 = this.menuItem7 = new dijit.MenuItem({
//            label: this.STRINGS.ctxMenu_slideTemplates+this.STRINGS.tripleDot, 
//            iconClass:"designGalleryIcon",
//            onClick: dojo.hitch(this,this.openTemplateDesignDialog)     
//        });         

        var menuItem7a =  this.menuItem7a = new dijit.MenuItem({
            label: this.STRINGS.ctxMenu_paste, 
            iconClass:"pasteIcon",
            onClick: dojo.hitch(window.pe.scene,window.pe.scene.showMenusErrorMsg,'paste'),
            dir: dirAttr
        });
        
        ctxMenu.addChild(menuItem1);                
        ctxMenu.addChild(menuItem3a);
        
        ctxMenu.addChild(new dijit.MenuSeparator());        
        
        ctxMenu.addChild(menuItem4);
        ctxMenu.addChild(menuItem5);
        ctxMenu.addChild(menuItem5a);

        ctxMenu.addChild(new dijit.MenuSeparator());        
        ctxMenu.addChild(menuItem6);
        //ctxMenu.addChild(menuItem7);

        ctxMenu.addChild(new dijit.MenuSeparator());        
        ctxMenu.addChild(menuItem7a);
                
        ctxMenu.startup();
     },
    //
    // Cleaning up context menu
    //
    destroyContextMenu: function(){
        if (this.menuItem1) this.menuItem1.destroy();
        if (this.menuItem3a) this.menuItem3a.destroy();
        if (this.menuItem4) this.menuItem4.destroy();
        if (this.menuItem5) this.menuItem5.destroy();
        if (this.menuItem5a) this.menuItem5a.destroy();
        if (this.menuItem6) this.menuItem6.destroy();
        //if (this.menuItem7) this.menuItem7.destroy();
        if (this.menuItem7a) this.menuItem7a.destroy();
        if (this.ctxMenu)   this.ctxMenu.destroy();             
    },
    
    //
    // checkBoxPosition: Will ensure that part of the contentBox is close to the Canvas. This is a temporary
    // solution to prevent objects being lost/hidden in coedit session where some users have different screen resolution
    //
    checkBoxPosition: function(contentBoxObj, action){
        var slideEditorArea = {'top':  dojo.style(this.mainNode,'top'),
                   'left': dojo.style(this.mainNode,'left'),
                   'width': dojo.style(this.mainNode,'width'),
                   'height': dojo.style(this.mainNode,'height')
                };

        var result = this.isBoxInArea(contentBoxObj.mainNode,slideEditorArea);
        var  boxWasMoved = result.boxWasMoved = false;
        //If contentBoxObj is not contained in area then we need to fix spillage
        if (result.locationToTargetArea.length >0){ // object is not contained within SlideEditor we need to move
             boxWasMoved = this.fixBoxPosition(contentBoxObj,result,action);
            result.boxWasMoved = boxWasMoved;
        } 
        return result;      
    },
    
    //
    // Fixes box position 
    //  
    fixBoxPosition: function(contentBoxObj,result,action){
        var flag=0;
        for (var i =0; i<result.locationToTargetArea.length;i++){
            if ((action && action != this.DOWN_ARROW && result.locationToTargetArea[i] == this.TOP_OF_AREA) ||
            		(!action && result.locationToTargetArea[i] == this.TOP_OF_AREA)){  // Then we need to slide object down to flush with top
                this.flushBoxPosition(contentBoxObj,'top');
                flag++;
            }else if ((action && action != this.UP_ARROW && result.locationToTargetArea[i] == this.BOTTOM_OF_AREA) ||
    				 (!action && result.locationToTargetArea[i] == this.BOTTOM_OF_AREA)){ // Then we need to slide object up to flush with bottom of area
                this.flushBoxPosition(contentBoxObj,'bottom');
                flag++;
            }else if ((action && action != this.LEFT_ARROW && result.locationToTargetArea[i] == this.RIGHT_OF_AREA)||
            		 (!action && result.locationToTargetArea[i] == this.RIGHT_OF_AREA)){ // Then we need to slide object left to flush with right of area
                this.flushBoxPosition(contentBoxObj,'right');
                flag++;
            }else if ((action && action != this.RIGHT_ARROW && result.locationToTargetArea[i] == this.LEFT_OF_AREA) ||
   		 		  	 (!action && result.locationToTargetArea[i] == this.LEFT_OF_AREA)){ // Then we need to slide object right to flush with left of area
                this.flushBoxPosition(contentBoxObj,'left');
                flag++;
            }
        }
        if (flag>0)
            return true;
    },  
    
    //
    // flushBoxPosition. Flush to outside wall of slide sorter  
    //
    flushBoxPosition: function(contentBoxObj,sideToFlush){
        var objTop  = contentBoxObj.mainNode.offsetTop;
        var objLeft = contentBoxObj.mainNode.offsetLeft;
        var objWidth = contentBoxObj.mainNode.offsetWidth;
        var objHeight = contentBoxObj.mainNode.offsetHeight;

    	if (sideToFlush=='right'){
            //let's get the position of tr of the flushtoobject
            var newLeft = dojo.isIE ? this.mainNode.style.pixelLeft + this.mainNode.style.pixelWidth : dojo.style(this.mainNode, 'left') + this.mainNode.offsetWidth;
            
            //Let's build and look at the area we are looking to occupy
            var newPos = {
                    node: contentBoxObj.mainNode,
                    top: objTop,
                    left: newLeft,
                    width: objWidth,
                    height: objHeight,
                    unit: "px",
                    onEnd: dojo.hitch(this,this.percentConvert,contentBoxObj,null)
                };      
            //Let's determine if area is within slideEditor 
            this.slideTo(newPos,contentBoxObj);
             
        }else if (sideToFlush=='left'){
            //let's get the position of tl of the flushtoobject
            var newLeft = dojo.isIE ? this.mainNode.style.pixelLeft - objWidth : dojo.style(this.mainNode, 'left') - objWidth;
            
            //Let's build and look at the area we are looking to occupy
            var newPos = {
                    node: contentBoxObj.mainNode,
                    top: objTop,
                    left: newLeft,
                    width: objWidth,
                    height: objHeight,
                    unit: "px",
                    onEnd: dojo.hitch(this,this.percentConvert,contentBoxObj,null)
                };      
            //Let's determine if area is within slideEditor 
            this.slideTo(newPos,contentBoxObj);          
        } else if (sideToFlush=='top'){
            //let's get the position of bl of the flushtoobject
            var newTop = dojo.isIE ? this.mainNode.style.pixelTop - objHeight : dojo.style(this.mainNode, 'top') - objHeight;
            
            //Let's build and look at the area we are looking to occupy
            var newPos = {
                    node: contentBoxObj.mainNode,
                    top:  newTop,
                    left: objLeft,
                    width: objWidth,
                    height: objHeight,
                    unit: "px",
                    onEnd: dojo.hitch(this,this.percentConvert,contentBoxObj,null)
                };      
            //Let's determine if area is within slideEditor 
            this.slideTo(newPos,contentBoxObj);          
        }else if (sideToFlush=='bottom'){
            //let's get the position of tr of the flushtoobject
            var newTop = dojo.isIE ? this.mainNode.style.pixelTop +  + this.mainNode.style.pixelHeight : dojo.style(this.mainNode, 'top') + this.mainNode.offsetHeight;
            //Let's build and look at the area we are looking to occupy
            var newPos = {
                    node: contentBoxObj.mainNode,
                    top:  newTop,
                    left: objLeft,
                    width: objWidth,
                    height: objHeight,
                    unit: "px",
                    onEnd: dojo.hitch(this,this.percentConvert,contentBoxObj,null)
                };      
            //Let's determine if area is within slideEditor 
            this.slideTo(newPos,contentBoxObj);
        }
    },
    
    //
    // This will run auto fix. Auto fix will go through all the boxes in slide Editor and will check for the following: 
    //
    // Spillage Test
    // --------------
    //   Check to see if the box is spilling over outside the boundary of the slide editor. If it is then do the following
    //     a) Determine which quadrant it is spilling outside from
    //     b) Move it back with the Slide Editor
    //
    //
    // Collision Test
    // --------------
    //   Check to see if the box is colliding/overlapping with any other box on the slide editor. If it is colliding do the following:
    //     a) Identify which side (corner) of the box is colliding with other objects. And for each corner perform the following
    //     b) Attempt to move box away from colliding object and check a flag declaring that this collision was attempted to be resolved to avoid recursion
    //     c) After trying to move box on all corner if collision still exist then...
    //     d) resize box 
    //  
    runAutoFix: function(){     
        // check for spillage
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
            var contentBoxObj = this.CONTENT_BOX_ARRAY[i];
            var callback = (i==this.CONTENT_BOX_ARRAY.length-1)? dojo.hitch(this,this.runAutoFixCollision):null;
            this.spillCheck(contentBoxObj,callback);
        }       
    },
    
    //
    // runs as callback (called from percentConvert) This runs after runAutoFix is completed
    //
    runAutoFixCollision: function(){
        // Now that everything is on the slide editor let's check for collisions
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
            var contentBoxObj = this.CONTENT_BOX_ARRAY[i];
            this.collisionCheck(contentBoxObj);
        }       
    },
    
    //
    // Collision check will check for overlap between boxcontents
    //
    collisionCheck: function(contentBoxObj){
        // First let's check if the contentBox collides with other content boxes
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){            
            var otherBox = this.CONTENT_BOX_ARRAY[i];
            if (otherBox.mainNode.id != contentBoxObj.mainNode.id){ // skip this node since it is same as contentBoxObj
                //First let's check if contentBoxObj collides with other boxes  
                var result = this.isBoxInBox(contentBoxObj.mainNode,otherBox.mainNode);             
                // cornerStatus array has the following positions for the object corners:
                // cornerStatus[0] = tl (top left)
                // cornerStatus[1] = tr
                // cornerStatus[2] = bl (bottom left)
                // cornerStatus[3] = br
                var corners = result.cornerStatus;
                if (corners[0].isIncluded ||
                    corners[1].isIncluded ||
                    corners[2].isIncluded ||
                    corners[3].isIncluded) {  // If one of the corners is included then we have collision
                    this.handleCollision(contentBoxObj,otherBox,result);
                } else { // No contentBoxObj does not collide with this otherBox let's see if other box Collides with contentBoxObj
                    var result = this.isBoxInBox(otherBox.mainNode,contentBoxObj.mainNode);
                    var corners = result.cornerStatus;
                    if (corners[0].isIncluded ||
                        corners[1].isIncluded ||
                        corners[2].isIncluded ||
                        corners[3].isIncluded) {  // If one of the corners is included then we have collision
                        this.handleCollision(otherBox,contentBoxObj,result);
                    }
                }
            }
        }
        
    },
    
    //
    // Fix collision between two boxes by moving or resizing boxes as needed
    // Here box1 collides with box2 this means one of the corners of box1 is inside box2
    //
    handleCollision: function(box1,box2,result){
        // corners belong to box1
        // corners[0] = tl (top left)
        // corners[1] = tr
        // corners[2] = bl (bottom left)
        // corners[3] = br
        var corners = result.cornerStatus;
        if (corners[0].isIncluded &&
            corners[2].isIncluded) {
            // tl && bl corners collide so let's push box1 right until it is flushed with the right side of box2
            this.flushToSide(box1,box2,'right',dojo.hitch(this,this.handleCollision,box1, box2, result));
        }
    },
    
    //
    // Spill check verifies and fixes objects that do not fit in slide editor
    //
    spillCheck: function(contentBoxObj,callback) {
        var slideEditorArea = {'top':  dojo.style(this.mainNode,'top'),
                               'left': dojo.style(this.mainNode,'left'),
                               'width': dojo.style(this.mainNode,'width'),
                               'height': dojo.style(this.mainNode,'height')
                            };
        
        var result = this.isBoxInArea(contentBoxObj.mainNode,slideEditorArea);
        //If contentBoxObj is not contained in area then we need to fix spillage
        if (!result.isIncluded){ // object is not contained within SlideEditor we need to move
            this.fixSpillage(contentBoxObj,result,callback);
        } else if (callback) { // No spillage then proceed with collision check
            callback(); 
        }

        return result;
    },
    
    
    //
    // Fixes spillage 
    //  
    fixSpillage: function(contentBoxObj,result,callback){
        // cornerStatus array has the following positions for the object corners:
        // cornerStatus[0] = tl (top left)
        // cornerStatus[1] = tr
        // cornerStatus[2] = bl (bottom left)
        // cornerStatus[3] = br
        var corners = result.cornerStatus;
        if (corners[0].isIncluded && corners[2].isIncluded) {  // Then we need to slide object to left
            this.flushToSide(contentBoxObj,'slideEditor','right',callback);
        }else if  (corners[1].isIncluded && corners[3].isIncluded){ // Then we need to slide object to right
            this.flushToSide(contentBoxObj,'slideEditor','left',callback);
        }else if  (corners[0].isIncluded && corners[1].isIncluded){ // Then we need to slide object up
            this.flushToSide(contentBoxObj,'slideEditor','bottom',callback);
        }else if  (corners[2].isIncluded && corners[3].isIncluded){ // Then we need to slide object down
            this.flushToSide(contentBoxObj,'slideEditor','top',callback);           
        }
    },
    
    //
    // flushes object to a side of another container
    //
    flushToSide: function(contentBoxObj,flushToObject,sideToFlush,callback){
        if (flushToObject=='slideEditor'){ // We are flushing the contentBoxObj to the slideEditor
            if (sideToFlush=='right'){
                //Get new left position 
                var left = dojo.style(this.mainNode,'width') - contentBoxObj.mainNode.offsetWidth;
                
                var newPos = {
                        node: contentBoxObj.mainNode,
                        top:  dojo.style(contentBoxObj.mainNode,'top').toString(),
                        left: left.toString(),
                        unit: "px",
                        onEnd: dojo.hitch(this,this.percentConvert,contentBoxObj,callback)
                    };               
                this.slideTo(newPos,contentBoxObj);             
            } else  if (sideToFlush=='left'){
                //Get new left position 
                var left = 0;               
                var newPos = {
                        node: contentBoxObj.mainNode,
                        top:  dojo.style(contentBoxObj.mainNode,'top').toString(),
                        left: left.toString(),
                        unit: "px",
                        onEnd: dojo.hitch(this,this.percentConvert,contentBoxObj,callback)
                    };               
                this.slideTo(newPos,contentBoxObj);             
            } else  if (sideToFlush=='bottom'){
                //Get new top position                  
                var top = dojo.style(this.mainNode,'height') - contentBoxObj.mainNode.offsetHeight;
                var newPos = {
                        node: contentBoxObj.mainNode,
                        top:  top.toString(),
                        left: dojo.style(contentBoxObj.mainNode,'left').toString(),
                        unit: "px",
                        onEnd: dojo.hitch(this,this.percentConvert,contentBoxObj,callback),
                        onAnimate:dojo.hitch(this,this.publishSlideChanged)
                    };               
                this.slideTo(newPos,contentBoxObj);             
            } else  if (sideToFlush=='top'){
                //Get new top position 
                var top = 0;                
                var newPos = {
                        node: contentBoxObj.mainNode,
                        top:  top.toString(),
                        left: dojo.style(contentBoxObj.mainNode,'left').toString(),
                        unit: "px",
                        onEnd: dojo.hitch(this,this.percentConvert,contentBoxObj,callback)
                    };               
                this.slideTo(newPos,contentBoxObj);             
            }
        } else if (flushToObject!=null){ // we are flushing to the side of the flushtoobject
            if (sideToFlush=='right'){
                //let's get the position of tr of the flushtoobject
                var newLeft = dojo.style(flushToObject.mainNode,'left');
                var width = flushToObject.mainNode.offsetWidth;
                newLeft += width;
                
                //Let's build and look at the area we are looking to occupy
                var newPos = {
                        node: contentBoxObj.mainNode,
                        top:  dojo.style(contentBoxObj.mainNode,'top'),
                        left: newLeft,
                        width: dojo.style(contentBoxObj.mainNode,'width'),
                        height: dojo.style(contentBoxObj.mainNode,'height'),
                        unit: "px",
                        onEnd: dojo.hitch(this,this.percentConvert,contentBoxObj,null)
                    };      
                //Let's determine if area is within slideEditor 
                var inEditorArea = this.isAreaInSlideEditor(newPos);
                if (inEditorArea.isIncluded){
                    //Let's determine if area is clear of content boxes
                    var contentBoxesArray = this.getContentBoxesThatCollideWithArea(newPos);                    
                    if (contentBoxesArray.length==0) {// area is clear let's move
                        this.slideTo(newPos,contentBoxObj);
                        return true;
                    } else{ // else area in not clear it collides so may need to find a new area.
                        //alert('THERE ARE OTHER OBJECTS IN NEW AREA');
                        return false;
                    }                   
                } else {  // area not included in slide editor may need to resize
                    //alert('AREA NOT WITHIN EDITOR');
                    return false;
                }
                 
            }
        } else if (flushToObject==null){ //We are flushing in the direction until we hit a sLideEditor border or another content box 
                
        }
    },
    
    //
    // slideTo
    //
    slideTo: function(newPos,contentBoxObj){
        
        if (this.autoAnimate){
             setTimeout (function(){dojo.fx.slideTo(newPos).play();}, 1 );
             
        } else {
            dojo.style(contentBoxObj.mainNode,{
                'top':contentBoxObj.PxToPercent(newPos.top,'height')+"%",
                'left':contentBoxObj.PxToPercent(newPos.left,'width')+"%"
            }); 
            if (!this.isMultipleBoxSelected()){
                contentBoxObj.publishBoxAttrChanged('style',null,true);
            }
            contentBoxObj.selectThisBox();
        }
        
    },
    
    //
    // convert node back to %
    //
    percentConvert: function(contentBoxObj,callback){
        dojo.style(contentBoxObj.mainNode,{
            'top':contentBoxObj.PxToPercent(dojo.style(contentBoxObj.mainNode,'top'),'height')+"%",
            'left':contentBoxObj.PxToPercent(dojo.style(contentBoxObj.mainNode,'left'),'width')+"%"
        });
        
        contentBoxObj.publishBoxAttrChanged('style',null,true);
        contentBoxObj.selectThisBox();
        if (callback) callback();
    },
    
        
    //
    // Create  image
    //
    addImageContentBox: function(imageUrlArray,pos,imageName){            
     this.deSelectAll();
        for(var i=0; i<imageUrlArray.length; i++){
           var opts = {'CKEDITOR':window.CKEDITOR,
                    'CKToolbarSharedSpace': this.CKToolbarSharedSpace,
                    //'mainNode':null,
                    //'contentBoxDataNode':null,
                    'parentContainerNode':this.mainNode,
                    'contentBoxType':PresConstants.CONTENTBOX_IMAGE_TYPE,
                    'deSelectAll':dojo.hitch(this,this.deSelectAll),
                    'deSelectAllButMe':dojo.hitch(this,this.deSelectAllButMe),
                    'isMultipleBoxSelected':dojo.hitch(this,this.isMultipleBoxSelected),
                    'publishSlideChanged':dojo.hitch(this,this.publishSlideChanged),
                    'getzIndexCtr':dojo.hitch(this,this.getzIndexCtr),  
                    'setzIndexCtr':dojo.hitch(this,this.setzIndexCtr),
                    'toggleBringToFront':dojo.hitch(this,this.toggleBringToFront),
                    'toggleSendToBack':dojo.hitch(this,this.toggleSendToBack),                  
                    'imageUrl':imageUrlArray[i],
                    'imageName':imageName,
                    'openAddNewImageDialog': dojo.hitch(this,this.openAddNewImageDialog),
                    'deRegisterContentBox' : dojo.hitch(this,this.deRegisterContentBox),
                    'getActiveDesignTemplate' : dojo.hitch(this,this.getActiveDesignTemplate),
                    'deleteSelectedContentBoxes' : dojo.hitch(this,this.deleteSelectedContentBoxes),
                    'pasteSelectedContentBoxes'  : dojo.hitch(this,this.pasteSelectedItems),
                    'copySelectedContentBoxes'   : dojo.hitch(this,this.copySelectedItems),                                                     
                    'createIndicatorSytle':dojo.hitch(this,this.createIndicatorSytle),  
                    'getInLineStyles':dojo.hitch(this,this.getInLineStyles),
                    'getMasterTemplateInfo' : dojo.hitch(this,this.getMasterTemplateInfo),
                    'checkBoxPosition' : dojo.hitch(this,this.checkBoxPosition),
                    'addImageContentBox': dojo.hitch(this,this.addImageContentBox),
                    'handleMultiBoxSelected':dojo.hitch(this, this.handleMultiBoxSelected),
                    'addImageContentBox2': dojo.hitch(this, this.addImageContentBox2,pos)};
            var contentObj = new concord.widgets.imgContentBox(opts);   
        }
        this.publishSlideEditorInFocus();
    },  
    
    
    addImageContentBox2: function(pos,contentObj){
        if (pos!=null){
            //Now we need to resize image according to its ratio
            var newDim = this.getImageDimension(pos,contentObj);            
            contentObj.moveToPosition(newDim);
        }

        if (dojo.isIE) contentObj.adjustContentDataSize();
        
        this.registerContentBox(contentObj);
        contentObj.selectThisBox();
        contentObj.publishInsertNodeFrame(); 
        this.adjustUndoStackForImageInsert();                   
    },
    
    /*
	//gjo defect 2988
	//if the user is adding an image to a default imageTextBox then combine
	//the insert of the image and the delete of the imageTextBox in the undo stack
	*/
    adjustUndoStackForImageInsert: function() {
    	if(undoManager.stack!=null && undoManager.stack.length>1) {
    		var previousUndoFromStack = undoManager.stack[undoManager.index-1].undo;
    		//console.log(previousUndoFromStack);
    		if (previousUndoFromStack[0].updates[0] && previousUndoFromStack[0].updates[0].s) {
    			var defaultContentImage = dojo.query(".defaultContentImage",dojo._toDom(previousUndoFromStack[0].updates[0].s))[0];
    			if (defaultContentImage){
//    				undoManager.mergeTop2WithReorderedUndo();
    				PresCKUtil.normalizeMsgSeq(null,null,null,'endMerge');// end notify message
    			}
    		}
    	}
    },
    
    //
    //returns image dimension. Pos is dimension of place holder imgBox
    //
    getImageDimension: function(pos,box){
        var dim = {'width':null, 'height':null, 'top':null, 'left':null};
        var posPx = {'width':box.PercentToPx(pos.width,'width'),
                     'height':box.PercentToPx(pos.height,'height'),
                     'top':box.PercentToPx(pos.top,'height'),
                     'left':box.PercentToPx(pos.left,'width')};
        
        //1- Let's determine ratio based on current imgBox
        var imgH = (dojo.isIE)? box.mainNode.offsetHeight :dojo.style(box.mainNode,'height');
        var imgW = (dojo.isIE)? box.mainNode.offsetWidth :dojo.style(box.mainNode,'width');
                
        var ratio = imgH/imgW;  // this is aspect ratio

        //console.log("Image height/width  and ratio in px ===> "+imgH+" / "+imgW+" / "+ratio);
                
        //2- Let's use ratio to get new height
        dim.width =posPx.width; // same width as place holder image
        dim.height = (ratio * posPx.width);     // in px 
                
        while (dim.height > posPx.height){//need to fit image in place holder while maintaining proportion
            dim.width = dim.width - 10; //let's reduce by 10 px
            dim.height = (ratio * dim.width);     // in px      
        }
        
        //3- Now let's get top position for img box
        var midWayPt = posPx.height/2;
        var newTop = (midWayPt - (dim.height/2))+posPx.top;
        
        var midWayPt2 = posPx.width/2;
        var newLeft = (midWayPt2 -(dim.width/2)) + posPx.left;
        
        dim.width = box.PxToPercent(dim.width,'width');
        dim.height = box.PxToPercent(dim.height,'height');
        dim.top = box.PxToPercent(newTop,'height');
        dim.left = box.PxToPercent(newLeft,'width');
        
        //console.log("Returning image dimensions t/l/w/h in % ===== > "+dim.top +" / "+dim.left+" / "+dim.width +" / "+dim.height);
        return dim;
    },

    openAddNewImageDialog: function(callbackOnOK,inFocusCallBack){
    	
    	pe.scene.setFocusToDialog();
    	this.deSelectAll();
    	if(!this.newImageDialogObj){

        	var dlgDiv = document.createElement('div');
        	dlgDiv.id = 'presentationDialog';
        	document.body.appendChild(dlgDiv);
        	
        	var topPos = concord.util.resizer.getSlideEditorPosition();     
        	var dlgWidth = dojo.isIE? this.IMAGE_DIALOG_WIDTH_IE :this.IMAGE_DIALOG_WIDTH;
        	var dlgHeight = dojo.isIE? this.IMAGE_DIALOG_HEIGHT_IE : this.IMAGE_DIALOG_HEIGHT;
        	var dlgLeft = (this.parentContainerNode.parentNode.offsetParent.offsetWidth/2)-325;
        	var inFocusCallBack = dojo.hitch(pe.scene,pe.scene.setFocusToDialog);
        	var lang = this.mainNode.lang?this.mainNode.lang:"en";
    		var params = {
    				style: "position:absolute;top:" + topPos.y + "px;left:" + dlgLeft +"px;width:" + dlgWidth + "px;height:" + dlgHeight + "px;",
    				resizable: false,
    				dockable: false,
    				numElements: 40,
    				lang: lang,
    				uploadUrl: concord.util.uri.getEditAttRootUri(),
    				callback: callbackOnOK,
    				focusCallBack: inFocusCallBack
    			};
    			var formParams = {
    				"name":"uploadForm",
    				"method":"POST",			
    		    	"encType":"multipart/form-data"	
    			};	
    		this.newImageDialogObj = new concord.widgets.InsertImageDialog(this,this.STRINGS.imageDialog.titleInsert, this.STRINGS.imageDialog.insertImageBtn,null,params,formParams);
    	}
    	this.newImageDialogObj._callback = callbackOnOK;
    	this.newImageDialogObj.show();
    },
    
    //
    // Returns height of dialog based on slide editor's height
    //
    getSlideEditorTotalHeight: function(){
        var height = this.slideEditorHeight;
        return height;
    },
    
    
    //
    // Returns % based on unit specified. 
    //
    getPercent: function(value,heightOrWidth){
        if (value.indexOf('cm')>=0) {
            return this.CmToPercent(value,heightOrWidth);
        } else if (value.indexOf('%') >=0){
            return parseFloat(value);
        }       
    },
    
    //
    // Converts SYMPHONY cm to concord %
    //
    CmToPercent: function(cm,heightOrWidth){
        //console.log("slideEditor:CmToPercent","Entry cm is "+cm);
        var cmValue = parseFloat(cm);
        //var value = (heightOrWidth=='height')? parseFloat(this.parentContainerNode.style.height) : parseFloat(this.parentContainerNode.style.width);  
        var value = (heightOrWidth=='height')?  this.SYMPHONY_PAGE_HEIGHT_IN_CM : this.SYMPHONY_PAGE_WIDTH_IN_CM;   
        var result =  (cmValue * 100)/value;
        //console.log("slideEditor:CmToPercent","Exit % is "+result+"%. (Based on px for heightWidth = "+heightOrWidth+" and Value = "+value);  
        return result;
    },
    
    
    //
    // Create/Open layout dialog
    //
    openTemplateDesignDialog: function(){
    	return;//for story 32034
    	pe.scene.setFocusToDialog();
    	this.deSelectAll();
    	if(!dijit.byId('P_d_MasterStyles')){
    		
        	var dlgDiv = document.createElement('div');
        	dlgDiv.id = 'masterStyleDialog';
        	document.body.appendChild(dlgDiv);
    		
    		var topPos = concord.util.resizer.getSlideEditorPosition();
		
            this.templateDesignDialogObj = new concord.widgets.presNonModalDialog({
                id: "P_d_MasterStyles",
                title: this.STRINGS.ctxMenu_slideTemplates,
                content: "<div id='P_d_MasterStyles_MainDiv'> </div>",
                resizable: false, dockable: false, 
                style: "position:absolute;top:" + topPos.y + "px;left:0px;height:80%;width:"+ ((dojo.isIE)? '371' :'361') + "px;",
                'presDialogHeight':'80',
                'heightUnit':'%',
                'presDialogWidth' : (dojo.isIE)? '371' :'361',
                'presDialogTop'   : topPos.y,           
                'presDialogLeft'  : '0',                                        
                'presModal': false,
                'destroyOnClose':false
              }, dojo.byId('masterStyleDialog'));
              this.templateDesignDialogObj.startup();            
              var dialogHeight = (dojo.isIE)? (this.templateDesignDialogObj.domNode.clientHeight*.72) :(this.templateDesignDialogObj.domNode.offsetHeight*.72);
              this.templateDesignDialogContent(dialogHeight);
    	}else{
            if (this.templateGalleryObj!=null){ // jmt - D45188
                this.templateGalleryObj.deSelectAll();
            }
            this.templateDesignDialogObj.show();
            this.templateDesignDialogObj.resize(); //#10170: The layout/master styles dialog didn't resize if user close the dialog and reopen after resize. So need to resize it here.
            if (this.templateGalleryObj) this.templateGalleryObj.updateDialogHeight();

    	}
    	this.templateDesignDialogObj._getFocusItems(this.templateDesignDialogObj.domNode);
    	this.templateDesignDialogObj._firstFocusItem.focus();
    },       

    
    openSlideTransitionDialog: function(){
    	pe.scene.setFocusToDialog();
    	this.deSelectAll();
    	if(!dijit.byId('P_d_SlideTranstions')){

        	var dlgDiv = document.createElement('div');
        	dlgDiv.id = 'transitionDialog';
        	document.body.appendChild(dlgDiv);
        	
        	var topPos = concord.util.resizer.getSlideEditorPosition();     
        	var dlgLeft = (this.parentContainerNode.parentNode.offsetParent.offsetWidth/2)-360;
    		
    		this.openSlideTransitionDialogObj = new concord.widgets.presNonModalDialog({
       		 title: this.STRINGS.ctxMenu_slideTransitionTitle,
       	     content: "<div id='P_d_SlideTranstions_MainDiv'> </div>",   
       	     resizable: false, dockable: false, 
       	     style: "position:absolute;top:" + topPos.y + "px;left:" + dlgLeft +"px;width:" + ((dojo.isIE)? '696' :'676') + "px;height:330px;",
       	     id: "P_d_SlideTranstions",
       	     'destroyOnClose':false,
       	     'presModal': false,
       	     'presDialogButtons' : [
                                     {'label':this.STRINGS.ok,'action':dojo.hitch(this,function(evt){this.applySlideTransitions();})},
                                     {'label':this.STRINGS.cancel,'action':dojo.hitch(this,function(){/* TBD */})}
                                       ],
	       	     contentNodeId: 'P_d_SlideTranstions_MainDiv'
	       	  }, dojo.byId("transitionDialog"));

	       	this.openSlideTransitionDialogObj.startup();
            var dialogHeight = (this.openSlideTransitionDialogObj.domNode.offsetHeight*1);
            this.slideTransitionDialogContent(dialogHeight); 
            this.openSlideTransitionDialogObj.addDialogButtons();
       		if (this.slideTransitionGalleryObj) this.slideTransitionGalleryObj.updateDialogHeight();
    	}else {
            if (this.slideTransitionGalleryObj!=null){ // jmt - D45188
                this.slideTransitionGalleryObj.deSelectAll();
            }
            this.openSlideTransitionDialogObj.show();
            if (this.slideTransitionGalleryObj) this.slideTransitionGalleryObj.updateDialogHeight();
    	}
    	this.openSlideTransitionDialogObj._getFocusItems(this.openSlideTransitionDialogObj.domNode);
		this.openSlideTransitionDialogObj._firstFocusItem.focus();        	
    },
    
    //
    // Create/Open layout dialog
    //
    openLayoutDialog: function(){
    	
    	pe.scene.setFocusToDialog();
    	this.deSelectAll();
    	if(!dijit.byId('P_d_Layout')){
    		
        	var dlgDiv = document.createElement('div');
        	dlgDiv.id = 'layoutDialog';
        	document.body.appendChild(dlgDiv);
    		
    		var topPos = concord.util.resizer.getSlideEditorPosition();
    		var width = (dojo.isIE)? '371' :'361';
    		var left = BidiUtils.isGuiRtl() ? (dojo.byId("presEditorTbl").offsetWidth - width - 40) : 0;

            this.openLayoutDialogObj = new concord.widgets.presNonModalDialog({
                id: "P_d_Layout",
                title: this.STRINGS.ctxMenu_slideLayout,
                content: "<div id='P_d_Layout_MainDiv'> </div>",
                resizable: false, dockable: false, 
                style: "position:absolute;top:" + topPos.y + "px;left:" + left + "px;height:80%;width:"+ width + "px;",
                'presDialogHeight':'80',
                'heightUnit':'%',
                'presDialogWidth' : width,
                'presDialogTop'   : topPos.y,           
                'presDialogLeft'  : '0',                                        
                'presModal': false,
                'destroyOnClose':false
              }, dojo.byId('layoutDialog'));
              this.openLayoutDialogObj.startup();
              dojo.style(this.openLayoutDialogObj.domNode,'height','80%');
              var dialogHeight = (this.openLayoutDialogObj.domNode.offsetHeight*.72);
              this.layoutDialogContent(dialogHeight);
    	}else{
            if (this.layoutGalleryObj!=null){ // jmt - D45188
                this.layoutGalleryObj.deSelectAll();
            }
            this.openLayoutDialogObj.show();
            this.openLayoutDialogObj.resize(); //#10170: The layout/master styles dialog didn't resize if user close the dialog and reopen after resize. So need to resize it here.
            if (this.layoutGalleryObj) this.layoutGalleryObj.updateDialogHeight();

    	}
    	if( CKEDITOR.env.chrome){//fixed for #22989,disable tooltip of chrome of itself
	    	var nodeContainer = dojo.byId("P_d_Layout_MainDiv").parentNode;
	    	if( nodeContainer){
	    		var nodeCanvas = nodeContainer.parentNode;
	    		if( nodeCanvas){
	    			var theTitle = nodeCanvas.getAttribute("title");
	    			if( theTitle.length>0){
	    				nodeCanvas.setAttribute("title","");
	    			}
	    			var layoutNode = nodeCanvas.parentNode;
	    			if( layoutNode){
		    			var theLayoutTitle = layoutNode.getAttribute("title");
		    			if( theLayoutTitle.length>0){
		    				layoutNode.setAttribute("title","");
		    			}
	    			}
	    		}
	    	}
    	}
    	this.openLayoutDialogObj._getFocusItems(this.openLayoutDialogObj.domNode);
    	this.openLayoutDialogObj._firstFocusItem.focus();	
    },

    //
    // 20632
    // Open shape message dialog
    //
    openShapeMessageDialog: function(){
    	var widgetId= "P_d_ShapeMessage";
	    var contentId = "P_d_ShapeMessage_MainDiv";
	    var message = this.STRINGS.cannotCreateShapesMessage;
	    message =  dojo.string.substitute(message, {'productName' : concord.util.strings.getProdName()});
	    var title = this.STRINGS.cannotCreateShapesTitle;
	    var dialogHeight = '230';
	    var dialogHeightIE = '227';
	    
		 //D21561 - Need to adjust the dialog depending on the translated text of certain
		 // languages.  Note that auto would also make this work but there is a known issue with setting
		 // the height to auto for this element which causes the dialog to break if the window is too small.
   	 	var localeHeight = [{locale:'el',height:'260',heightIE:'257'},
   	                     {locale:'fr',height:'250',heightIE:'247'},
   	                     {locale:'de',height:'250',heightIE:'247'},
   	                     {locale:'pl',height:'250',heightIE:'247'}];
		 for (var i = 0; i < localeHeight.length; i++)
		 {
			 var locale = window.g_locale;
			 var index = locale.indexOf('-');
			 if(index != -1)
				 locale = locale.substr(0,index);

			 if(localeHeight[i].locale == locale)
			 {
				 dialogHeight = localeHeight[i].height;
				 dialogHeightIE = localeHeight[i].heightIE;
				 break;
			 }
		 }

	    this.shapeMessageDialog = new concord.widgets.presentationDialog({
	    	'id': widgetId,
	        'title': title,
	        'content': "<div id='"+contentId+"' style='padding:15px;'> </div>",
	        'presDialogHeight': (dojo.isIE) ? dialogHeightIE : dialogHeight,
	        'presDialogWidth' : '360',
	        'presDialogTop'   : (this.parentContainerNode.parentNode.offsetParent.offsetHeight/2) - 115,
	        'presDialogLeft'  : (this.parentContainerNode.parentNode.offsetParent.offsetWidth/2) - 150,   
	        'heightUnit':'px',
	        'presModal': true,
	        'destroyOnClose':true,
	        'presDialogButtons' : [{'label':this.STRINGS.ok,'action':dojo.hitch(this,function(){})}]        
	    });
	    this.shapeMessageDialog.startup();
	    this.shapeMessageDialog.show();
	    this.shapeMessageDialogContent(contentId,message);
    },
    
    //
    // 20632
    // Creates shape message dialog content
    //
    shapeMessageDialogContent:function(contentId,message){
    	var dialogContentDiv = dojo.byId(contentId);
		dialogContentDiv.innerHTML = message;
    },
    
    //
    // Open message dialog
    //
    openLockMessageDialog: function(id,userList){
		var curTime = new Date().getTime();					
		var timeLapse = curTime - this.openLockMessageDialogTmStamp;
		this.openLockMessageDialogTmStamp = curTime;
		if (timeLapse > 500){	
			var widgetId= "P_d_LockMessage";
	        var contentId = "P_d_LockMessage_MainDiv";
	        var message = this.STRINGS.contentInUseAll; //default message, assume slide content object
	        var title = this.STRINGS.contentInUse;  //default title, assume slide content object
			//check if it is a slide or slide content object, we have different message and title to show
			var isSlide = false;
			if(window.pe.scene.slideSorter.getSorterDocument()!=null){
				var node = window.pe.scene.slideSorter.getSorterDocument().getElementById(id);
				if(node!=null){
					isSlide = dojo.hasClass(node, "draw_page");
				}
			}
			if(isSlide == true){
				message = this.STRINGS.slidesInUseAll;
				title = this.STRINGS.slidesInUse; 
			}
	        this.lockMessageDialog = new concord.widgets.presentationDialog({
	          'id': widgetId,
	          'title': title,
	          'content': "<div id='"+contentId+"' style='padding:15px;'> </div>",
	          'presDialogHeight': (dojo.isIE)? '257' :'260',
	          'presDialogWidth' : '360',
	          'presDialogTop'   : (this.parentContainerNode.parentNode.offsetParent.offsetHeight/2) - 115,
	          'presDialogLeft'  : (this.parentContainerNode.parentNode.offsetParent.offsetWidth/2) - 150,   
	          'heightUnit':'px',
	          'presModal': true,
	          'destroyOnClose':true,
	          'presDialogButtons' : [{'label':this.STRINGS.ok,'action':dojo.hitch(this,function(){})}]        
	        });
	        this.lockMessageDialog.startup();
	        this.lockMessageDialog.show();
	        this.lockMessageDialogContent(id,widgetId,contentId,userList, message);   
		}
    },
    
    //
    // Creates message for lock message dialog content
    //
    lockMessageDialogContent:function(id,widgetId,contentId,userList, message){
    	var dialogContentDiv = dojo.byId(contentId);
		var users = (userList) ? userList : this.scene.getUsersSlideNodeLock(id);
		
		var contentStringArray = new Array();
		contentStringArray.push("<p><b>"+message+"</b></p><br>");
		contentStringArray.push("<ol>");
		for (var i=0; i<users.length; i++){
			var user = null;
			if(users[i].id!=null){
				user = ProfilePool.getUserProfile(users[i].id);	
			}else{
				user = ProfilePool.getUserProfile(users[i]);
			}		
			contentStringArray.push("<li>"+user.getName()+"&nbsp; &nbsp; "+this.STRINGS.contentLockemail+": <i>"+user.getEmail() + "</i></li>");
		}
		contentStringArray.push("</ol>");
		var contentString = contentStringArray.join("");
		dialogContentDiv.innerHTML = contentString;
    },
    
    //
    // Create/Open Image Properties dialog
    //
    openImagePropDialog: function(){
    	if(!this._imagePropHdl){
    		this._imagePropHdl = new concord.widgets.ImagePropertyPresHandler(this);						
	    }
	    this._imagePropHdl.showDlg();
    },
    
    //
    // Create/Open Shape Properties dialog
    //
    openShapePropDialog: function(){
    	if(!dijit.byId('P_d_ShapeProp')){
    		var shapeDlg = this.shapePropertyObj = new concord.widgets.shapePropDlg(this, dojo.i18n.getLocalization("concord.widgets","presPropertyDlg").shapeTitle, null, null);
    		shapeDlg.show();	
    	} else {
    		this.shapePropertyObj.show();
    	}    		
    },
    
    //
    // Create/Open Shape Properties dialog
    //
    openPropertyDialog: function(){
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
            //do not include speaker notes property dialog
            if (this.CONTENT_BOX_ARRAY[i].boxSelected){
            	this.CONTENT_BOX_ARRAY[i].openContentBoxProperties();
            }
        }
    },


    //
    // Open message dialog - for diabling change master_style while in co-edit mode
    //

    openPreventMasterStyleChangeDialog: function(){
        var widgetId= "P_d_PreventTemplateMessage";
        var contentId = "P_d_PreventTemplateMessage_MainDiv";
        var message = this.STRINGS.preventTemplateChangeMsg;
        var title = this.STRINGS.preventTemplateChange;  

        this.preventTemplateMessageDialog = new concord.widgets.presentationDialog({
          'id': widgetId,
          'title': title,
          'content': "<div id='"+contentId+"' style='padding:15px;'> </div>",
          'presDialogHeight': (dojo.isIE)? '192' :'195',
          'presDialogWidth' : '360',
          'presDialogTop'   : (this.parentContainerNode.parentNode.offsetParent.offsetHeight/2) - 115,
          'presDialogLeft'  : (this.parentContainerNode.parentNode.offsetParent.offsetWidth/2) - 150,   
          'heightUnit':'px',
          'presModal': true,
          'destroyOnClose':true,
          'presDialogButtons' : [{'label':this.STRINGS.ok,'action':dojo.hitch(this,function(){})}]        
        });
        this.preventTemplateMessageDialog.startup();
        this.preventTemplateMessageDialog.show();
        // fix for defect 15588 need to move this to presentation.css
  		this.preventTemplateMessageDialog.domNode.style.backgroundColor='#cccccc';
        //insert content to the dialog
        var dialogContentDiv = dojo.byId(contentId);
		var contentString = "<p><b>"+message+"</b></p>";		
		dialogContentDiv.innerHTML = contentString;
    },
    
    //
    // Returns a registered contentBox by ID
    //
    getRegisteredContentBoxById: function(id){
        if (id){
            for (var j=0; j<this.CONTENT_BOX_ARRAY.length; j++){
                var contentBoxObj = this.CONTENT_BOX_ARRAY[j];
                if ( contentBoxObj.mainNode && id == dojo.attr(contentBoxObj.mainNode,'id')){   
                	if(!contentBoxObj.isWidgitized)
                		contentBoxObj = this.widgitizeObject(contentBoxObj);
                    return contentBoxObj;
                }
            }   
        } 
        return null;        
    },  
    
    //
    // Get parent Draw_Frame given an ID in the drawFrame. Returns the mainNode id of a registered contentBox
    //
    getParentDrawFrameId: function (id,doc){
    	if (doc==null){
    		doc = window.document;
    	}
        var parentDrawFrameId = null;
        var node = doc.getElementById(id);
        if(node!=null){
            while(node){
                if ((node) && (dojo.hasClass(node,'draw_frame'))){
                    break;
                } else if (node.tagName.toLowerCase()=='body'){
                    node=null;
                    break;
                }
                node = node.parentNode;
            }
            if(node!=null){ //15488, added check if node is null so it won't error out when the id param is a slide id during undo layout in coedit mode
            	parentDrawFrameId = node.id;
            }
        }
        
        return parentDrawFrameId;
    },
    
    //
    // Get parent Draw_Frame given a node in the drawFrame. Returns the mainNode  of a registered contentBox
    //
    
    getParentDrawFrameNode: function (aNode){
       var node =  aNode;
        if(node!=null){
            while(node){
                if ((node) && (dojo.hasClass(node,'draw_frame'))){
                    break;
                } else if (node.tagName!=null && node.tagName.toLowerCase()=='body'){
                    node=null;
                    break;
                }
                node = node.parentNode;
            }
         }
        return node;
    }, 
    
    //
    // Get parent Draw_Page given an ID in the drawFrame. Returns the slide id of a registered contentBox
    //
    getParentDrawPageNode: function (aNode, myDoc){
        if(myDoc == null){
        	myDoc = document;
        }
        //We can pass in the wrapper and it will get the drawpage also
        var node = aNode;
        if (node!=null && node.firstChild && dojo.hasClass(node.firstChild,'draw_page')){
        	return  node.firstChild.id;
        }
        
        if(node!=null){
            while(node){
                if ((node) && (dojo.hasClass(node,'draw_page'))){
                    break;
                } else if (node.tagName.toLowerCase()=='body'){
                    node=null;
                    break;
                }
                node = node.parentNode;
            }            
        }
        
        return node;
    },    
    
    
    
    //
    // Get parent Draw_Page given an ID in the drawFrame. Returns the slide id of a registered contentBox
    //
    getParentDrawPageId: function (id, myDoc){
        var parentDrawPageId = null;
        if(myDoc == null){
        	myDoc = document;
        }
        //We can pass in the wrapper and it will get the drawpage also
        var node = myDoc.getElementById(id);
        if (node!=null && node.firstChild && dojo.hasClass(node.firstChild,'draw_page')){
        	return  node.firstChild.id;
        }
        
        if(node!=null){
            while(node){
                if (dojo.hasClass(node,'draw_page')){
                    break;
                } else if (node.tagName.toLowerCase()=='body'){
                    node=null;
                    break;
                }
                node = node.parentNode;
            }
           	parentDrawPageId = node? node.id : null;
        }
        
        return parentDrawPageId;
    },
    
    //
    // Returns a registered contentBox by Box ID
    //
    getRegisteredContentBoxByBoxId: function(id){
        if (id){
            for (var j=0; j<this.CONTENT_BOX_ARRAY.length; j++){
                var contentBoxObj = this.CONTENT_BOX_ARRAY[j];
                if ( id == dojo.attr(contentBoxObj.mainNode,'boxId')){              
                    return contentBoxObj;
                }
            }   
        } 
        return null;        
    },
    
    //
    // Apply selected layout to current slide
    //
    applyTemplateDesignToCurrentSlide: function(templateJSONDefinition){        
    	//to diable master style change while in co-editing
    	
    	var scene = window['pe'].scene;
		var sess = scene.session;
		if(sess.isSingleMode()!=true){
			if (this.templateDesignDialogObj) {
    			this.templateDesignDialogObj.closeDialogFocus(false,null);
    		}
			//open msg dialog preventing user to change master style when in coedit mode
			this.openPreventMasterStyleChangeDialog();
			
			
    		return;
		}
			
    	// First Remove all layout objects from current slide
        //alert('Publish Layout');
        var copyNode = dojo.clone(this.mainNode);
        copyNode = this.removeSlideEditorItems(copyNode);
        
        var eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_templateDesignApplied,'templateData':templateJSONDefinition,'slideSelected':copyNode}];
        //concord.util.events.publish(concord.util.events.slideEditorEvents, eventData); 
        //need to directly call to be able to expedite showing slide back in slide editor, rather than waiting until this event publish is processed
        window.pe.scene.slideSorter.handleTemplateDesignApplied(eventData[0]);
        copyNode = null;
    },
        
    //
    // Cleans node by removing specific slideEditor classes
    //
    removeSlideEditorItems: function(node){     
        //Clean mainNode (draw_page) classes
        dojo.removeClass(node,this.slideEditorClasses);
        //Clean all draw_frame classes (contentdataNode)
        var  contentDataNodeArrays = dojo.query('.contentBoxDataNode',node);        
        this.removeClasses(contentDataNodeArrays,'contentBoxDataNode');
        
        var drawFrameNodesArray = dojo.query('.draw_frame',node);
        this.removeClasses(drawFrameNodesArray,'boxContainer resizableContainerSelected resizableContainer');
        
        //Remove attribute boxid on drawframe       
        this.removeAttribute(drawFrameNodesArray, 'boxid');
        
        //Remove shadow images
        var shadowNodes = dojo.query('.shadowPiece',node);
        this.removeNodes(shadowNodes);
        // Remove all image handles
        var imageHandleNodes = dojo.query('.handle',node);
        this.removeNodes(imageHandleNodes);
        
        //Make sure all node frames within drawpage are visible
        for (var i=0;i<drawFrameNodesArray.length;i++){
            var frameNode = drawFrameNodesArray[i];
            if(frameNode.children.length>0){
            	dojo.style(frameNode.children[0],{'visibility':'','display':''});
            }
        }
        //let's remove spare nodes
        var spareNode = dojo.query(".isSpare", node);
        if(spareNode!=null && spareNode.length>0){
        	dojo.destroy(spareNode);
        }
        
        return node;
    },
    
    //
    // remove array of nodes from parents
    //
    removeNodes: function(nodeArray){
        for (var i=0; i< nodeArray.length; i++){
            var node = nodeArray[i];            
            dojo.destroy(node);
        }
        
    },
    
    //
    // remove class for array of nodes from parents
    //
    removeClasses: function(nodeArray,className){
        for (var i=0; i< nodeArray.length; i++){
            var node = nodeArray[i];
            dojo.removeClass(node,className);
        }       
    },
    
    //      
    // Remove attribute on array of nodes
    //  
    removeAttribute: function(nodeArray,attrName){
        for (var i=0; i< nodeArray.length; i++){
            var node = nodeArray[i];
            dojo.removeAttr(node, attrName);
        }
    },
    
    isSlideHasContentBoxLocked: function(){
    	var result = false;
    	var contentLockedItems =dojo.query(".lockedIcon",this.mainNode);
    	if(contentLockedItems.length>0){
    		result = true;
    	}
    	return result;
    },
   
	checkNLaunchContentLockDialog: function(){
		//check if there is any content box locked,
		//if there is any content box locked, this.userLocks must contain something
		for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
			this.isBoxLocked(this.CONTENT_BOX_ARRAY[i].mainNode.id);
		}
		if (this.userLocks.length>0){
            this.launchContentLockDialog();
            this.userLocks=[];
        }	
	},
    
	applyLayoutToCurrentSlide:function(resultArray){
		this.killAllCkInCurrentSlide(); 
		 var eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_applyLayout,'layoutResultArray':resultArray}];
	        concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
	},
            
    //
    //Creating template dialog content
    //
    templateDesignDialogContent: function(id,height){      
        //Create Dialog Content
        var mainTemplateDesignContainer = this.mainTemplateDesignContainer = document.createElement('div');
        mainTemplateDesignContainer.id = "P_d_MasterStyles_ContentDiv";
        dojo.byId('P_d_MasterStyles_MainDiv').appendChild(mainTemplateDesignContainer);

        //Load templateGallery  
        this.templateGalleryObj = new concord.widgets.templateDesignGallery({'mainDiv':mainTemplateDesignContainer,
                              'height':height,
                              'onSelectCallback': dojo.hitch(this,this.applyTemplateDesignToCurrentSlide),
                              'STRINGS':this.STRINGS.concordGallery,
                              'onDblClick':dojo.hitch(this.templateDesignDialogObj,this.templateDesignDialogObj.closeDialog)});
    },
    
    //
    //Creating layout dialog content
    //
    layoutDialogContent: function(height){     
        //Create Dialog Content
        var mainLayoutContainer = this.mainLayoutContainer = document.createElement('div');
        mainLayoutContainer.id = "P_d_Layout_ContentDiv";
        dojo.byId('P_d_Layout_MainDiv').appendChild(mainLayoutContainer);
        
        //Load layoutGallery  
        this.layoutGalleryObj = new concord.widgets.layoutGallery({'mainDiv':mainLayoutContainer,
                              'height':height,
                              'galleryLayoutData':this.layoutHtmlDiv,
                              'getMasterTemplateInfo' : dojo.hitch(this,this.getMasterTemplateInfo),
                              'handleClose' : dojo.hitch(this,this.closeDialog,this.openLayoutDialogObj),       
                              'onSelectCallback': dojo.hitch(this,this.applyLayoutToCurrentSlide),
                              'STRINGS':this.STRINGS.concordGallery,
                              'onDblClick':dojo.hitch(this.openLayoutDialogObj,this.openLayoutDialogObj.closeDialog)});
        // IE will not set correct font size for Korean unless the text box has a fixed height
        if (dojo.isIE)
        	dojo.style(this.layoutGalleryObj.searchBoxObj.domNode, 'height', '18px');	            
    },

    //
    //Creating slide transition dialog content
    //
    //
    slideTransitionDialogContent: function(height){    
        //Create Dialog Content
        var mainSlideTransitionContainer = this.mainSlideTransitionContainer = document.createElement('div');
        mainSlideTransitionContainer.id = "P_d_SlideTranstions_ContentDiv";
        dojo.byId('P_d_SlideTranstions_MainDiv').appendChild(mainSlideTransitionContainer);

        //Load layoutGallery  
       this.slideTransitionGalleryObj = new concord.widgets.slideTransitionGallery({'mainDiv':mainSlideTransitionContainer,
                              'height':height,
                              'handleClose' : dojo.hitch(this,this.closeDialog,this.openSlideTransitionDialogObj),
                              'onSelectCallback': dojo.hitch(this,this.applySlideTransitions),
                              'STRINGS':this.STRINGS.concordGallery,
                              'onDblClick':dojo.hitch(this.openSlideTransitionDialogObj,this.openSlideTransitionDialogObj.closeDialog)});
    },
  
    createDefaultContentBox : function() {
    	this.addTextBox();
    },

    addTextBox: function(content,bInsertInternalList){
    	this.deSelectAll();  
    	this.createSpareBox();
        this.publishSlideEditorInFocus();  
        
        var newPos={'top':'25','left':'18','width':'50','height':'18','percent':true};
        this.makeSpareReal(newPos,content,bInsertInternalList);
    },
    //
    // Prepares to create content box by turning cursor into crosshair and capturing cursor location where to add new svg shape
    //
    prepareToCreateSvgShape : function(opts){ 
        this.deSelectAll();
        this.createPackageOnClick.createNewContentBox = true;
        this.createPackageOnClick.shapeType = opts.shapeType;
        this.createPackageOnClick.callback = opts.callback;
        this.createPackageOnClick.resizeCallback = opts.resizeCallback;
        this.createPackageOnClick.finalizeCallback = opts.finalizeCallback;
        this.publishSlideEditorInFocus();        
        this.setDefaultMouseDown();
        this.outsideOfCanvas= true; //D2843 immediately prevent adding text box since we may be either in toolbar or context menu. Wait for mouseover canvase to set to false.
    }, 
       
    //
    // Prepares to create content box by turning cursor into crosshair and capturing cursor location where to add new content box
    //
    prepareToCreateContentBox : function(opts){ 
        this.deSelectAll();             
        this.createSpareBox();
        this.createPackageOnClick.createNewContentBox = true;
        this.createPackageOnClick.callback = opts.callback;
        this.publishSlideEditorInFocus();        
        this.setDefaultMouseDown();
        this.outsideOfCanvas= true; //D2843 immediately prevent adding text box since we may be either in toolbar or context menu. Wait for mouseover canvase to set to false.
        //document.body.style.cursor='crosshair';
    },
    
    //
    // Sets zIndex Ctr 
    //
    setzIndexCtr: function(value){
        this.zIndexCtr= value;
    },
        
    //
    // Gets zIndex counter
    //
    getzIndexCtr: function (){
        return this.zIndexCtr;
    },
    
    //
    // resets z Index get the largest zindex of all the frames loaded in slide editor
    //
    resetZindex: function(){
        var drawFrameList = dojo.query('.draw_frame',this.mainNode);
        
        for (var i=0;i<drawFrameList.length;i++){
            var drawFrameNode = drawFrameList[i];           
            var zIdx = parseInt(drawFrameNode.style.zIndex);
            var curzIdx = this.getzIndexCtr();
            if ((!isNaN(zIdx)) && (zIdx > curzIdx)){
                this.setzIndexCtr(zIdx);
            }
        }
    },

    //
    // Bring to front option
    //
    toggleBringToFront: function(){
        if (this.maxZindex != null) {
        	this.maxZindex += 1;
            for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){            
                if (this.CONTENT_BOX_ARRAY[i].boxSelected)  {
                	//13714 - need to take into account the box is in edit mode, thus we need to update origZ
                	if(this.CONTENT_BOX_ARRAY[i].origZ!=null){
                		this.CONTENT_BOX_ARRAY[i].origZ = this.maxZindex;
                		var zIdx = dojo.style(this.CONTENT_BOX_ARRAY[i].mainNode,'zIndex');
                		//13714 - need to coedit the maxZ index here
                		//work around: temporarily set mainNode zIndex to maxZ then send coedit msg, then bring it back to the zIdx before
                		dojo.style(this.CONTENT_BOX_ARRAY[i].mainNode,{
	                        'zIndex':this.maxZindex
	                    }); 
	                    this.CONTENT_BOX_ARRAY[i].publishBoxAttrChanged("style",this.CONTENT_BOX_ARRAY[i].mainNode.id,true);
	                    dojo.style(this.CONTENT_BOX_ARRAY[i].mainNode,{
	                        'zIndex':zIdx
	                    }); 
                	}else{
	                    this.CONTENT_BOX_ARRAY[i].setzIndexCtr(this.maxZindex);
	                    dojo.style(this.CONTENT_BOX_ARRAY[i].mainNode,{
	                        'zIndex':this.CONTENT_BOX_ARRAY[i].getzIndexCtr()
	                    }); 
	                    this.CONTENT_BOX_ARRAY[i].publishBoxAttrChanged("style",this.CONTENT_BOX_ARRAY[i].mainNode.id,true);
                	}
                }               
            }   
        }
    },
    
    //
    // Send to back option
    //
    toggleSendToBack: function(){
        var minZ = this.minZindex;
        //console.log("minZ: " + minZ);
        if (minZ != null) {
			minZ = minZ-1 < 1 ? 1 : minZ-1;
			this.minZindex = minZ;
            for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){            
                if (this.CONTENT_BOX_ARRAY[i].boxSelected)  {
                    if(this.CONTENT_BOX_ARRAY[i].origZ!=null){
                		this.CONTENT_BOX_ARRAY[i].origZ = minZ;
                		var zIdx = dojo.style(this.CONTENT_BOX_ARRAY[i].mainNode,'zIndex');
                		//13714 - need to coedit the maxZ index here
                		//work around: temporarily set mainNode zIndex to maxZ then send coedit msg, then bring it back to the zIdx before
                		dojo.style(this.CONTENT_BOX_ARRAY[i].mainNode,{
	                        'zIndex':minZ
	                    }); 
	                    this.CONTENT_BOX_ARRAY[i].publishBoxAttrChanged("style",this.CONTENT_BOX_ARRAY[i].mainNode.id,true);
	                    dojo.style(this.CONTENT_BOX_ARRAY[i].mainNode,{
	                        'zIndex':zIdx
	                    }); 
                	}else{
                		this.CONTENT_BOX_ARRAY[i].setzIndexCtr(minZ);
	                    dojo.style(this.CONTENT_BOX_ARRAY[i].mainNode,{
	                        'zIndex':this.CONTENT_BOX_ARRAY[i].getzIndexCtr()
	                    }); 
	                    this.CONTENT_BOX_ARRAY[i].publishBoxAttrChanged("style",this.CONTENT_BOX_ARRAY[i].mainNode.id,true);
                	}
                }
            }
        }
    },
    
    _createPNode: function()
    {
        var p = document.createElement('p');
        dojo.addClass(p,'text_p');
        dojo.attr(p,'odf_element','text:p');
        dojo.attr(p,'level','1');
        return p;
    },
    
    _createDefaultSpanNode:function(isSpare)
    {
        var span = document.createElement('span');
        span.innerHTML = '&#8203;'; //add 8203 to the first P node of the new text content box
        if(isSpare) {
        	dojo.addClass(span,'newTextContent');
        }
        return span;
    },

    //
    // Builds the nodes under the data content node for text box
    //
    buildTextNodeContent: function(isSpare,defaultTextContent,bInsertInternalList){
        var displayTableDiv  = document.createElement('div');
        this.applyNewTextContentDivTableProperties(displayTableDiv);

        var drawFrameClassDiv = document.createElement('div');
        this.applyNewTextContentDivTableCellProperties(drawFrameClassDiv);
        displayTableDiv.appendChild(drawFrameClassDiv);

        if(bInsertInternalList)
        {
        	if(defaultTextContent.getChild(0).is('span'))
        	{
                var p = this._createPNode();
                drawFrameClassDiv.appendChild(p);
                for(var i=0;i<defaultTextContent.getChildCount();i++)
        		{
        			var clipboardSpan = defaultTextContent.getChild(i);
        			var pasteSpan = clipboardSpan.clone(true);
        			p.appendChild(pasteSpan.$);
        		}
				var br = new CKEDITOR.dom.element('br');
				br.addClass('hideInIE');
				p.appendChild(br.$);
				dojo.query('span',p).forEach(function(_node){
					var node = PresCKUtil.ChangeToCKNode(_node);
					PresListUtil._DecodingVisibleStyle(node,false);
				});
        	}
        	else
        	{
        		for(var i=0;i<defaultTextContent.getChildCount();i++)
        		{
        			var clipboardLine = defaultTextContent.getChild(i);
        			var pasteLine = clipboardLine.clone(true);
        			var lineItem = PresListUtil.getLineItem(pasteLine);
        			if(!lineItem)
        				continue;
        			PresListUtil._fixLineStructure(lineItem);
        			drawFrameClassDiv.appendChild(pasteLine.$);
    				dojo.query('span',pasteLine.$).forEach(function(_node){
    					var node = PresCKUtil.ChangeToCKNode(_node);
    					PresListUtil._DecodingVisibleStyle(node,false);
    				});
					//remove master list class, and set to default lst
					//get margin-left and text-indent abs value
					var absMargin = PresCKUtil.getAbsoluteValue(lineItem,PresConstants.ABS_STYLES.MARGINLEFT);
					var absIndent = PresCKUtil.getAbsoluteValue(lineItem,PresConstants.ABS_STYLES.TEXTINDENT);
					var lc = PresListUtil.getListClass(lineItem);
					PresListUtil.removeListClass(lineItem,false,false,true,false);
					if(!lc.listClass.length)//no lst exist
					{
						if(pasteLine.is('ol'))
						{
							pasteLine.setAttribute('numberType','1');
							lineItem.addClass('lst-n');
						}
						else if(pasteLine.is('ul'))
						{
							lineItem.addClass('lst-c');
						}
						//else is <p>
					}						
					
					PresCKUtil.setCustomStyle(lineItem,PresConstants.ABS_STYLES.MARGINLEFT,absMargin);
					PresCKUtil.setCustomStyle(lineItem,PresConstants.ABS_STYLES.TEXTINDENT,absIndent);
        		}
        	}
        	var ckDrawFrameClassDiv = PresCKUtil.ChangeToCKNode(drawFrameClassDiv);
        	PresListUtil.updateListValue(ckDrawFrameClassDiv);
        }
        else
        {
            
            defaultTextContent = defaultTextContent || '';
            var lines = defaultTextContent.split('\n');
            var ifEmpty = !lines || (defaultTextContent.length === 0);
            var ifPH = (lines.length === 1) && (lines[0].charCodeAt(0) == 8203);
            if(ifEmpty || ifPH)
            {
            	var p = this._createPNode();
            	drawFrameClassDiv.appendChild(p);
            	var span = this._createDefaultSpanNode(isSpare);
            	p.appendChild(span);
            	(new CKEDITOR.dom.node(p)).appendBogus();
            }	
            else
            {
                for(var i = 0; i<lines.length ;i++)
                {
                	var line = lines[i];
                	if( line.length == 0 && i == lines.length - 1)
                		continue;
                    var p = this._createPNode();
                    drawFrameClassDiv.appendChild(p);
                    var span = this._createDefaultSpanNode(isSpare);

                    if( line.length == 0)
                    {
                        dojo.addClass(p,'userLineBreak');
                    }
                    else
                        span.appendChild(document.createTextNode(line));
                    p.appendChild(span);
                    (new CKEDITOR.dom.node(p)).appendBogus();
                }
            }	
        }
        return displayTableDiv;
    },

    //
    // Apply selected transitions to slide selected in the slide sorter
    //
    applySlideTransitions: function(){
        
        var applyToAll = false;
        
        var radioButtons = document.getElementsByName("selectedSlide");
        
        if (radioButtons[1].checked) {
            applyToAll = true;
        }
        
        var transitionSmilType = "none";
        var transitionSmilSubType = "none";
        var transitionSmilDirection = "none";
        
        dojo.query(".clipPickerDialogItemSelected", 'P_d_SlideTranstions').forEach(function(node, index, arr){
            if (node.id != "none") {
                var split = node.id.split('_');
                transitionSmilType = split[0];
                transitionSmilSubType = split[1];
                transitionSmilDirection = split[2];
            }   
        });
        
        var eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_slideTransitionApplied,'smil_type':transitionSmilType,'smil_subtype':transitionSmilSubType,'smil_direction':transitionSmilDirection,'applyToAll':applyToAll}];
        concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
    },
    
    //
    // Applies properties and classes to the first div under contentDataNode div with display= table
    //
    applyNewTextContentDivTableProperties: function(displayTableDiv){       
        dojo.style(displayTableDiv,{
            'display':'table',
            'height':'100%',
            'width':'100%'
        }); 
        dijit.setWaiRole(displayTableDiv,'presentation');
        dojo.attr(displayTableDiv,'tabindex','-1');
    },
    
    //
    // Applies properties and classes div with display= table-cell
    //
    applyNewTextContentDivTableCellProperties: function(drawFrameClassDiv){         
        dojo.style(drawFrameClassDiv,{
            'display':'table-cell',
            'height':'100%',
            'width':'100%'
        });    
        dijit.setWaiRole(drawFrameClassDiv,'presentation');
        dojo.attr(drawFrameClassDiv,'tabindex','-1');

        //TODO: GET DYNAMIC CLASSES FOR DIV table-cell
        var curLayout = dojo.attr(this.mainNode,'presentation_presentation-page-layout-name');
        if (curLayout =='ALT0')
            dojo.addClass(drawFrameClassDiv,'draw_frame_classes '+this.getMasterTemplateInfo().default_title);
        else
            dojo.addClass(drawFrameClassDiv,'draw_frame_classes '+this.getMasterTemplateInfo().default_text);       
    },  
    
    //
    // Apply Draw Frame classes and attributes for new node
    //
    applyNewDrawFrameProperties: function(drawFrame,pos,isSpare){       
        dojo.addClass(drawFrame,'draw_frame newbox'); 
        var top = pos.percent ? pos.top : this.PxToPercent(pos.top,'height');
        var left = pos.percent ? pos.left : this.PxToPercent(pos.left,'width');
        var width = "";
        var height = "";
        if (dojo.hasClass(drawFrame,'shape_svg')) {
        	if (this.shapeType == "rectangle" || this.shapeType == "round-rectangle" || this.shapeType == "ellipse") {
        		width = pos.percent ? pos.width : (pos.width!=null)? this.PxToPercent(pos.width,'width') : '15';
            	height = pos.percent ? pos.height : (pos.height!=null)? this.PxToPercent(pos.height,'height') : '12';
        	} else {
        		var newHeight = 10*dojo.style(this.mainNode,'width')/dojo.style(this.mainNode,'height');
        		width = pos.percent ? pos.width : (pos.width!=null)? this.PxToPercent(pos.width,'width') : '10';
            	height = pos.percent ? pos.height : (pos.height!=null)? this.PxToPercent(pos.height,'height') : ''+newHeight+'';
        	}
        } else {
        	width = pos.percent ? pos.width : (pos.width!=null)? this.PxToPercent(pos.width,'width') : '45';
        	height = pos.percent ? pos.height : (pos.height!=null)? this.PxToPercent(pos.height,'height') : '6';
        }
        dojo.attr(drawFrame,'presentation_class','');
        dojo.attr(drawFrame,'pfs','18');
        dojo.attr(drawFrame,'draw_layer','layout');
        dojo.style(drawFrame,{
            'position':'absolute',
            'top':top+"%",
            'left':left+"%",
            'height': height+'%', 
            'width': width+'%',//wj S2R1
            'visibility':'hidden'
            });             
        dojo.attr(drawFrame,'text_anchor-type','paragraph');
        dojo.attr(drawFrame,'draw_layer','layout');
        
        //TODO: GET DYNAMIC CLASSES FOR DRAWFRAME
    },
    
    //
    // Apply Draw Text box( dataContentNode) classes and attributes for new node
    //
    applyNewDrawTextProperties: function(drawText){     
        dojo.style(drawText,{
            'height':'100%',
            'width':'100%'
        });     
        dojo.attr(drawText,'odf_element','draw_text-box');          // Not sure if this is seen in conversion code anymore?
        dojo.addClass(drawText,'draw_text-box contentBoxDataNode'); // Add here so we can process during widgitize component
        
        //TODO: GET DYNAMIC CLASSES FOR DRAWText
    },
    
    //
    // Create ODP draw frame Element
    //
    createTextNode: function(pos,isSpare,text,bInsertInternalList){
        // forbid widgitization for view draft mode
        if (window.pe.scene.isViewDraftMode())
            return;
        if(window.pe.scene.lockPark || !text) {
            text = '';
            if(bInsertInternalList)
            	bInsertInternalList = false;
        }

        var drawFrame = document.createElement('div');
        this.applyNewDrawFrameProperties(drawFrame,pos,isSpare);
        
        var drawText = document.createElement('div');       
        this.applyNewDrawTextProperties(drawText);
        drawFrame.appendChild(drawText);
 
        var textNode = this.buildTextNodeContent(isSpare,text,bInsertInternalList); 
        drawText.appendChild(concord.util.presCopyPasteUtil.addIndicatorForPaste(textNode).$);

        if (isSpare){
            // jmtjmtjmt drawFrame.style.visibility = 'hidden';
            //dojo.attr(this.spareBox.mainNode,'isspare','true');
            dojo.addClass(drawFrame,'isSpare');
            dijit.setWaiState(drawFrame,'hidden', 'true');  // hide from jaws
        }
        
        this.mainNode.appendChild(drawFrame);
        this.setNodeId(drawFrame,PresConstants.CONTENTBOX_PREFIX);
        if(bInsertInternalList){
        	PresCKUtil.updateRelativeValue(drawFrame);
    		PresCKUtil.duplicateListBeforeStyleInSlide(drawFrame);
    		pe.scene.slideSorter.bInsertInternalListForPView = true;
        }
        var publish = !isSpare; // Tells to send publish that a new node was created
        this.widgitizeContent(drawFrame,publish,true,isSpare); 

        return drawFrame;
    },
    
    //
    // Create a table by first launching table dialog
    //
    launchCreateTableDialog: function(){
        var widthStr = (dojo.isIE)? '375px': '400px';
        
        if (this.newTableDialogObj){
        	this.newTableDialogObj.destroyRecursive();
        	this.newTableDialogObj = null;
        }

        this.newTableDialogObj = new concord.widgets.presentationDialog({
          id: "P_d_CreateTable",
          title: this.STRINGS.createTblTitle,
          content: "<div id='P_d_CreateTable_MainDiv' style='width:"+widthStr+"; height:auto;'> </div>",    
          'presDialogHeight': dojo.isIE? '282':'285',
          'presDialogWidth' : dojo.isIE? '380':'423',
          'presDialogTop'   : (this.parentContainerNode.parentNode.offsetParent.offsetHeight/2) -100,
          'presDialogLeft'  : (this.parentContainerNode.parentNode.offsetParent.offsetWidth/2) - 175,         
          'heightUnit':'px',
          'numElements': 2,
          'presDialogButtons' : [
                                 {'label':this.STRINGS.ok,'id':'createTblOkBtn','action':dojo.hitch(this,function(){  
	                                	 var retV = PresTableUtil.createTableFromMenu(this);
	                                	 return retV;
                                	 }
                                    )},
                                 {'label':this.STRINGS.cancel,'id':'createTblCancelBtn','action':dojo.hitch(this,function(){/* TBD */})}
                                 ],
          'presModal': true,
          'destroyOnClose':true,
          'refocus': false,
          'aria-describedby': "P_d_InsertTableRowsDesciption"
        });
        this.newTableDialogObj.startup();
        this.newTableDialogObj.show();
        this.newTableDialogContent(widthStr);   
        var tmpeditor = this;
        //D21274: [Table] The way to create a table with default dimension is inconsistent in Document and Presentation
        this.newTableDialogObj.handleKeyUp = function(event){
			if(event.keyCode==dojo.keys.ESCAPE){	    	
				//newTableDialogObj.closeDialog();
			} else if (event.keyCode==dojo.keys.ENTER){
				if(this.okBtn)
				{
					//retV is false if table created successfully
					var retV = PresTableUtil.createTableFromMenu(tmpeditor);
					if((typeof(retV) == "object") && retV.paraIncorrect){
						return retV;			
					}else{
						this.closeDialog();
						tmpeditor = null;
					}
				}
			}	
		};
        //jmt - 46279
        this.newTableDialogObj.domNode.style.height='auto';
        this.newTableDialogObj.domNode.style.width='auto';
		// The presentationclass background color of #ffffff overrides the default
		// on some browsers so need to set backgroundColor style in the
		// dialog object to get the proper border color.
        // This is set to a variant of gray similar to other dialogs
        this.newTableDialogObj.domNode.style.backgroundColor='#cccccc';
        var paneContent = dojo.query('.dijitDialogPaneContent',this.newTableDialogObj.domNode);
        if (paneContent.length >0){
            paneContent[0].style.height='auto';
            paneContent[0].style.width='auto';
        }
        paneContent = null;
    },
    
    /**
     * create table from menubar, and toolbar(style table, but not customized style table)
     * @param data
     * @returns: ret object
     * 			{
     * 				divId: 
     * 				tblContentObj:
     * 				isNewTbl:
     * 			}
     */
    createTableAndAddTableStyle: function(data){
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
            if (this.CONTENT_BOX_ARRAY[i].boxSelected && this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE){
                // If a table has been selected do nothing
            	var divId = this.CONTENT_BOX_ARRAY[i].mainNode.id;
            	var contentBox = this.CONTENT_BOX_ARRAY[i];
                return { 'existingTable': true, 'tableDFId': divId, 'tblContentBox': contentBox};
            }
        }
        
        //create table and df node
        var ret = this.createTable();
        var divId = ret && ret.tableDFId;
        if(!divId){
        	console.log("! Failed to create draw frame node for table.");
        	return null;
        }
        
        //1, will call slidesorter.handleSubscriptionEventsForPresToolBar.createTableAndAddTableStyle again...
        //anyway, this time won't create any table since the table is already created in editor and selected, so just returned.
        //2, will call tblcontentbox.addTableStyle 3 times, but the first 2 just returned, only the 3rd one will apply style to the table
        var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_addTableStyle, 
        				  addTableStyleData: data.addTableStyleData,
        				  isNewTable: ret.isNewTbl}];
        concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
        
        //insert table in sorter
        var contentObj = ret.tblContentBox;
        contentObj.publishInsertNodeFrame(null, true);//add to undo stack
        
        var dfNode = PROCMSG._getSorterDocument().getElementById(divId);
        var msgPair = SYNCMSG.createInsertNodeMsgPair(dfNode);
        
        SYNCMSG.sendMessage(msgPair, SYNCMSG.NO_LOCAL_SYNC);
        
        return ret;
    },
    
    /**
     * create table from toolbar(for customized style table)
     * @param data
     */
    createTableAndAddCustomTableStyle: function(data){
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
            if (this.CONTENT_BOX_ARRAY[i].boxSelected && this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE){
            	 // If a table has been selected do nothing
            	var divId = this.CONTENT_BOX_ARRAY[i].mainNode.id;
            	var contentBox = this.CONTENT_BOX_ARRAY[i];
                return { 'existingTable': true, 'tableDFId': divId, 'tblContentBox': contentBox};
            }
        }
        
        //create table and df node
        var ret = this.createTable();
        var divId = ret && ret.tableDFId;
        if(!divId){
        	console.log("! Failed to create draw frame node for table.");
        	return null;
        }
        
        //1. call this function again, but only returned since table is already created
        //2. handled in tblcontentbox.addCustomTableStyle
        var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_addCustomTableStyle, 
        				  addTableStyleData: data.addTableStyleData,
        				  isNewTable: ret.isNewTbl}];
        concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
        
        //insert table in sorter
        var contentObj = ret.tblContentBox;
        contentObj.publishInsertNodeFrame(null, true);//add to undo stack
        
        var dfNode = PROCMSG._getSorterDocument().getElementById(divId);
        var msgPair = SYNCMSG.createInsertNodeMsgPair(dfNode);
        
        SYNCMSG.sendMessage(msgPair, SYNCMSG.NO_LOCAL_SYNC);
        
        return ret;
    },
    //
    // Add table dialog content to dialog
    //
    newTableDialogContent: function(widthStr){
        //Create Dialog Content
        var addNewTableDialogMainDiv = document.createElement('div');
        addNewTableDialogMainDiv.id = "P_d_AddTable_MainDiv";
        dojo.byId('P_d_CreateTable_MainDiv').appendChild(addNewTableDialogMainDiv);
        
        dojo.style(addNewTableDialogMainDiv,{
            'width': widthStr
        });

        var tableText ="<table border='0' cellpadding='0' cellspacing='10' style='height:90px; width:"+widthStr+";' role='presentation'>";          
        tableText    +="    <tbody>";
        tableText    +="        <tr>";
        tableText    +="            <td colspan=2><span id='P_d_InsertTableRowsDesciption'>"+this.STRINGS.createTblLabel+"</span></td>";        
        tableText    +="        </tr>";
        tableText    +="        <tr>";
        tableText    +="            <td><label for='requiredRowField'>"+this.STRINGS.createTblNumRows+"</label></td>";
        tableText    +="            <td><input id='requiredRowField' class='cke_dialog_ui_input_text numRows' tabindex='1' type='text' name='numRows' size='2' value='4' aria-valuemin='1' aria-valuemax='10' aria-required='true'></td>";
        tableText    +="        </tr>";
        tableText    +="        <tr>";
        tableText    +="            <td><label for='requiredColField'>"+this.STRINGS.createTblNumCols+"</label></td>";
        tableText    +="            <td><input id='requiredColField' class='cke_dialog_ui_input_text numCols' tabindex='2' type='text' name='numCols' size='2' value='4' aria-valuemin='1' aria-valuemax='10' aria-required='true'></td>";
        tableText    +="        </tr>";
        tableText    +="        <tr>";
        tableText    +="            <td colspan='2' style='color:#B81324; font-weight:bold; visibility:hidden' role='alert' class='createTableErrorMsg'>"+this.STRINGS.createTblErrMsg+"</td>";
        tableText    +="        </tr>";
        tableText    +="    </tbody>";
        tableText    +="</table>";
        addNewTableDialogMainDiv.innerHTML = tableText;
        addNewTableDialogMainDiv = null;
    },

    //
    // Add table row dialog content to dialog
    //
    newTableRowDialogContent: function(data){
        
        //Create Dialog Content
        var addNewTableRowDialogMainDiv = this.addNewTableRowDialogMainDiv = document.createElement('div');
        addNewTableRowDialogMainDiv.id = "P_d_InsertTableRow_ContentDiv";
        dojo.byId('P_d_InsertTableRow_MainDiv').appendChild(addNewTableRowDialogMainDiv);
        
        //var numberOfRowsLabelText = dojo.create("div", { innerHTML: this.STRINGS.insertTblRowNumberOfRows });
        var numberOfRowsLabelText = dojo.create("label", { innerHTML: this.STRINGS.insertTblRowNumberOfRows });
        dojo.attr(numberOfRowsLabelText, 'for', 'newTableRowContentNubmerOfRows');
        dojo.create(numberOfRowsLabelText,  { style: { 'fontWeight': 'bold'} }, addNewTableRowDialogMainDiv);
        var numberOfRowsSelect = '<select name="newTableRowContentNubmerOfRows" id ="newTableRowContentNubmerOfRows" tabindex ="1">' +
        							'<option value="1">1</option>' +
        							'<option value="2">2</option>' +
        							'<option value="3">3</option>' +
        							'<option value="4">4</option>' +
        							'<option value="5">5</option>' +
        							'<option value="6">6</option>' +
        							'<option value="7">7</option>' +
        							'<option value="8">8</option>' +
        							'<option value="9">9</option>' +
        							'<option value="10">10</option>' +
        						  '</select>';
        dojo.place( numberOfRowsSelect, 'P_d_InsertTableRow_ContentDiv');
        dojo.create("br", null, addNewTableRowDialogMainDiv);
        dojo.create("br", null, addNewTableRowDialogMainDiv);
        var addNewPositionGroupDiv = document.createElement('div');
		dijit.setWaiRole(addNewPositionGroupDiv, 'group');
		dijit.setWaiState(addNewPositionGroupDiv,'label', this.STRINGS.insertVoicePosition);  
        var numberOfRowsPositionLabel = dojo.create("div", { innerHTML: this.STRINGS.insertTblRowNumberPosition });
        dojo.create(numberOfRowsPositionLabel,  { style: { 'fontWeight': 'bold'} }, addNewPositionGroupDiv);

        var radio1 = null;
        if (dojo.isIE < 9) {
            radio1 = dojo.create("<input name='insertType' type='radio' tabindex='2' />", null, addNewPositionGroupDiv);
            radio1.id = 'addNewTableRowAbove';
            radio1.checked = true;
            radio1.value = 'above';
        } else {
            radio1 = dojo.create('input', null, addNewPositionGroupDiv);
            dojo.attr(radio1, {
                    id: 'addNewTableRowAbove',
                    name: "insertType",
                    type: "radio",
                    tabindex: 2,                    
                    checked: 'true',
                    value: 'above'
                });
        }
        
        var label1 = null;
        label1 = dojo.create("label", null, addNewPositionGroupDiv);
        dojo.attr(label1,"for","addNewTableRowAbove");
        label1.innerHTML = "&nbsp;"+this.STRINGS.insertTblRowAbove;
        
        dojo.create("br", null, addNewPositionGroupDiv);
        
        var radio2 = null;
        if (dojo.isIE < 9) {
            radio2 = dojo.create("<input name='insertType' type='radio' tabindex='3' />", null, addNewPositionGroupDiv);
            radio2.id = 'addNewTableRowBelow';
            radio2.value = 'below';
        } else {
            radio2 = dojo.create('input', null, addNewPositionGroupDiv);
            dojo.attr(radio2, {
                    id: 'addNewTableRowBelow',
                    name: "insertType",
                    type: "radio",
                    tabindex: 3,                    
                    value: 'below'
                });
        }
        
        var label2 = null;
        label2 = dojo.create("label", null, addNewPositionGroupDiv);
        dojo.attr(label2,"for","addNewTableRowBelow");
        label2.innerHTML = "&nbsp;"+this.STRINGS.insertTblRowBelow;
        if(BidiUtils.isGuiRtl() && dojo.isIE) //hack for IE problem with set of radio buttons in 'rtl' block
		dojo.attr(label2,"dir","rtl");
        
        dojo.place( addNewPositionGroupDiv, 'P_d_InsertTableRow_ContentDiv');

        // If in a header row, prevent the option to insert a row
        // before using the button in the menubar insert row dialog
        if (!data.insertBeforeEnabled) {
            this.disableTableDialogMenuItem(radio1, label1, radio2);
        }
        
        dojo.connect(radio1,'onclick',dojo.hitch(this,function(){dojo.removeAttr(radio2,"checked");dojo.attr(radio1,"checked","true");}));
        dojo.connect(radio2,'onclick',dojo.hitch(this,function(){dojo.removeAttr(radio1,"checked");dojo.attr(radio2,"checked","true");}));       
    },
    
    //
    // Create a table rows first launching table row dialog
    //
    launchTableRowDialog: function(data){
        this.newTableRowDialogObj = new concord.widgets.presentationDialog({
          id: "P_d_InsertTableRow",
          title: this.STRINGS.insertTblRowTitle,
          content: "<div id='P_d_InsertTableRow_MainDiv'></div>",   
          'presDialogHeight': dojo.isIE? '247':'250',
          'presDialogWidth' : '250',
          'presDialogTop'   : (this.parentContainerNode.parentNode.offsetParent.offsetHeight/2) -100,
          'presDialogLeft'  : (this.parentContainerNode.parentNode.offsetParent.offsetWidth/2) - 175,         
          'heightUnit':'px',
          'numElements': 2,
          'presDialogButtons' : [
                                 {'id':'P_d_InsertTableRow_Ok_Button','label':this.STRINGS.ok,'action':dojo.hitch(this,function(){
                                	 	var numberOfRows = dojo.byId('newTableRowContentNubmerOfRows').value;
                                	 	numberOfRows = parseInt(numberOfRows);
                                	 	if (dojo.byId('addNewTableRowAbove').checked) {
                                	 		var eventData = [{'eventName': concord.util.events.presMenubarEvents_eventName_AddSTRowAbv,
                                	 						  'rowNum': numberOfRows}];
                                	 		concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
                                	 	}
                                	 	else if (dojo.byId('addNewTableRowBelow').checked) {
                                	 		var eventData = [{'eventName': concord.util.events.presMenubarEvents_eventName_AddSTRowBlw,
                                	 		                 'rowNum': numberOfRows}];
                                	 		concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
                                	 	}
                                 })},
                                 {'id':'P_d_InsertTableRow_Cancel_Button','label':this.STRINGS.cancel,'action':dojo.hitch(this,function(){/* TBD */})}
                                 ],
          'presModal': true,
          'destroyOnClose':true
        });
        this.newTableRowDialogObj.startup();
        this.newTableRowDialogContent(data);
		this.newTableRowDialogObj.show();
    },
    
    //
    // Add table row dialog content to dialog
    //
    newTableColDialogContent: function(data){
        
        //Create Dialog Content
        var addNewTableColDialogMainDiv = this.addNewTableColDialogMainDiv = document.createElement('div');
        addNewTableColDialogMainDiv.id = "P_d_InsertTableColumn_ContentDiv";
        dojo.byId('P_d_InsertTableColumn_MainDiv').appendChild(addNewTableColDialogMainDiv);
        
        var numberOfColsLabelText = dojo.create("label", { innerHTML: this.STRINGS.insertTblColNumberOfCols });
        dojo.attr(numberOfColsLabelText, 'for', 'newTableColContentNubmerOfCols');
        dojo.create(numberOfColsLabelText,  { style: { 'fontWeight': 'bold'} }, addNewTableColDialogMainDiv);
        var numberOfRowsSelect = '<select name="newTableColContentNubmerOfCols" id ="newTableColContentNubmerOfCols" tabindex ="1">' +
									'<option value="1">1</option>' +
									'<option value="2">2</option>' +
									'<option value="3">3</option>' +
									'<option value="4">4</option>' +
									'<option value="5">5</option>' +
									'<option value="6">6</option>' +
									'<option value="7">7</option>' +
									'<option value="8">8</option>' +
									'<option value="9">9</option>' +
									'<option value="10">10</option>' +
								  '</select>';
        dojo.place( numberOfRowsSelect, 'P_d_InsertTableColumn_ContentDiv');        
        dojo.create("br", null, addNewTableColDialogMainDiv);
        dojo.create("br", null, addNewTableColDialogMainDiv);
        
        var addNewPositionGroupDiv = document.createElement('div');
		dijit.setWaiRole(addNewPositionGroupDiv, 'group');
		dijit.setWaiState(addNewPositionGroupDiv,'label', this.STRINGS.insertVoicePosition);  
        var numberOfColsPositionLabel = dojo.create("div", { innerHTML: this.STRINGS.insertTblColNumberPosition });
        dojo.create(numberOfColsPositionLabel,  { style: { 'fontWeight': 'bold'} }, addNewPositionGroupDiv);
        
        var radio1 = null;
        if (dojo.isIE < 9) {
            radio1 = dojo.create("<input name='insertType' type='radio' tabindex='2' />", null, addNewPositionGroupDiv);
            radio1.id = 'addNewTableColBefore';
            radio1.checked = true;
            radio1.value = 'above';
        } else {
            radio1 = dojo.create('input', null, addNewPositionGroupDiv);
            dojo.attr(radio1, {
                    id: 'addNewTableColBefore',
                    name: "insertType",
                    type: "radio",
                    tabindex: 2,
                    checked: "true",
                    value: 'above'
                });
        }
        
        var label1 = null;
        label1 = dojo.create("label", null, addNewPositionGroupDiv);
        dojo.attr(label1,"for","addNewTableColBefore");
        label1.innerHTML = "&nbsp;"+this.STRINGS.insertTblColBefore;
        
        dojo.create("br", null, addNewPositionGroupDiv);
        
        var radio2 = null;
        if (dojo.isIE < 9) {
            radio2 = dojo.create("<input name='insertType' type='radio' tabindex='3'/>", null, addNewPositionGroupDiv);
            radio2.id = 'addNewTableColAfter';
            radio2.value = 'below';
        } else {
            radio2 = dojo.create('input', null, addNewPositionGroupDiv);
            dojo.attr(radio2, {
                    id: 'addNewTableColAfter',
                    name: "insertType",
                    tabindex: 3,                    
                    type: "radio",
                    value: 'below'
                });
        }
        
        var label2 = null;
        label2 = dojo.create("label", null, addNewPositionGroupDiv);
        dojo.attr(label2,"for","addNewTableColAfter");
        label2.innerHTML = "&nbsp;"+this.STRINGS.insertTblColAfter;
        if(BidiUtils.isGuiRtl() && dojo.isIE) //hack for IE problem with set of radio buttons in 'rtl' block
            dojo.attr(label2,"dir","rtl");
        
        dojo.place( addNewPositionGroupDiv, 'P_d_InsertTableColumn_ContentDiv');

        // If in a header column, prevent the option to insert a column
        // before using the button in the menubar insert column dialog
        if (!data.insertBeforeEnabled) {
            this.disableTableDialogMenuItem(radio1, label1, radio2);
        }

        dojo.connect(radio1,'onclick',dojo.hitch(this,function(){dojo.removeAttr(radio2,"checked");dojo.attr(radio1,"checked","true");}));
        dojo.connect(radio2,'onclick',dojo.hitch(this,function(){dojo.removeAttr(radio1,"checked");dojo.attr(radio2,"checked","true");}));       
    },
    
    //
    // Create a table rows first launching table row dialog
    //
    launchTableColDialog: function(data){
        this.newTableColDialogObj = new concord.widgets.presentationDialog({
          id: "P_d_InsertTableColumn",
          title: this.STRINGS.insertTblColTitle,
          content: "<div id='P_d_InsertTableColumn_MainDiv'></div>",    
          'presDialogHeight': dojo.isIE? '247':'250',
          'presDialogWidth' : '250',
          'presDialogTop'   : (this.parentContainerNode.parentNode.offsetParent.offsetHeight/2) -100,
          'presDialogLeft'  : (this.parentContainerNode.parentNode.offsetParent.offsetWidth/2) - 175,         
          'heightUnit':'px',
          'numElements': 2,       
          'presDialogButtons' : [
                                 {'id':'P_d_InsertTableColumn_Ok_Button','label':this.STRINGS.ok,'action':dojo.hitch(this,function(){
                                	 	var numberOfCols = dojo.byId('newTableColContentNubmerOfCols').value;
                                	 	numberOfCols = parseInt(numberOfCols);
                                        if (dojo.byId('addNewTableColBefore').checked) {                             
                                            var eventData = [{'eventName': concord.util.events.presMenubarEvents_eventName_AddSTColBfr,
                  	 						  'colNum': numberOfCols}];
                                            concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
                                        }
                                        else if (dojo.byId('addNewTableColAfter').checked) {
                                            var eventData = [{'eventName': concord.util.events.presMenubarEvents_eventName_AddSTColAft,
                  	 						  'colNum': numberOfCols}];
                                            concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
                                        }
                                 })},
                                 {'id':'P_d_InsertTableColumn_Cancel_Button','label':this.STRINGS.cancel,'action':dojo.hitch(this,function(){/* TBD */})}
                                 ],
          'presModal': true,
          'destroyOnClose':true
        });
        this.newTableColDialogObj.startup();
        this.newTableColDialogContent(data);
        this.newTableColDialogObj.show();
    },
    
    isInteger: function ( str ){
        var regu = /^[1-9]{1}[0-9]{0,}$/;
        return regu.test(str);
    },
    
    /**
     * Helper method to disable table menu items in the dialogs that pop up
     * when adding rows or columns.  This will disable the element specified
     * by greying out the label and disabling the button.  It will then enable
     * the button which is used as a default to the enableElement
     */
    disableTableDialogMenuItem: function(disableElement, disableLabel, enableElement) {
    	// Set the disable Element to unchecked and disabled.  Set the enable 
    	// element to checked.
    	dojo.attr(disableElement, 'checked', false);
    	dojo.attr(disableElement, 'disabled', true);
    	dojo.attr(enableElement, 'checked', true);
    	
    	// Update the disabled label to grey to appear inactive.
    	// Potentially use styles in the future.
    	dojo.style(disableLabel, 'color', '#c3c3c3');
    },
    
    /**
     * This will create a table content box
     * 13550 - add isSpare to reuse the function to create a spare table box
     * @returns: ret object
     * 			{
     * 				divId: 
     * 				tblContentObj:
     * 				isNewTbl:
     * 			}
     */
    createTable: function(isSpare){
    	//13550 - when create table but there is no tableSpareBox yet, create the spareBox first
        if(isSpare != true && this.tableSpareBox == null){
     		this.createSpareTableContentBox();
        }
		var isBidi = BidiUtils.isBidiOn();
        var numRows;
        var numCols;    
        var numRowsNumberOfClasses = dojo.query('.numRows').length;
        var numColsNumberOfClasses = dojo.query('.numCols').length;
        if (numRowsNumberOfClasses == 0 || numColsNumberOfClasses == 0){
            numRows = 4;
            numCols = 5;
        } else {
            numRows =  dojo.query('.numRows')[ numRowsNumberOfClasses - 1 ].value;
            numCols =  dojo.query('.numCols')[ numColsNumberOfClasses - 1 ].value;
        }
        var errorField = dojo.query('.createTableErrorMsg');
        if ((errorField) && (errorField.length>0))
            errorField = errorField[0];
                
        if (isNaN(numRows) ||
            (!isNaN(numRows) && ((numRows>this.ROW_MAX || numRows<this.ROW_MIN) || !this.isInteger(numRows)))){ 
           //numRows = this.DEFAULT_TABLE_ROWS;      //default
           dojo.style(errorField,{
                'visibility':'visible'
           });   
           dojo.query('.numRows')[ numRowsNumberOfClasses - 1 ].focus();
           return {"paraIncorrect": true};
        }  
        
        if (isNaN(numCols)||
            (!isNaN(numCols) && ((numCols>this.COL_MAX || numCols<this.COL_MIN) || !this.isInteger(numCols)))){ 
           numCols = this.DEFAULT_TABLE_COLS;       //default  
           dojo.style(errorField,{
                'visibility':'visible'
           });
           dojo.query('.numCols')[ numColsNumberOfClasses - 1 ].focus();
           return {"paraIncorrect": true};
        } 
        
        if ((numCols==0) || (numRows==0)){
           return false;           
        }
        
        //Hide error field
        dojo.style(errorField,{
            'visibility':'hidden'
        });
        
        var div = document.createElement('div');        
        //Create table
        var table = document.createElement('table');
        div.appendChild(table);
        dojo.addClass(table,'table_table smartTable ibmdocsTable st_plain');
        dijit.setWaiRole(table, 'grid');
        dojo.attr(table,'cellspacing','0');
        dojo.attr(table,'cellpadding','0');
        dojo.attr(table,'table_use-rows-styles','true');
        dojo.attr(table,'table_use-banding-rows-styles','true');
        dojo.attr(table,'table_template-name','st_plain');
        
        var colgrp = document.createElement('colgroup');
        table.appendChild(colgrp);
        for(var j=0; j<numCols; j++){
        	var col = document.createElement('col');
        	dojo.attr(col,'style','width: ' + (100/numCols) + '%;');
        	colgrp.appendChild(col);
        }
        
        var tbody = document.createElement('tbody');
        table.appendChild(tbody);
        
        var tr = null, td = null;
        for (var i=0; i<numRows;i++){
            tr = document.createElement('tr');
            dijit.setWaiRole(tr, 'row');
            tbody.appendChild(tr);
            dojo.addClass(tr,'table_table-row'); // There is usually a row class here such as ro632
            dojo.attr(tr,'table_default-cell-style-name','');  // This is a generated value example value is ce633
            dojo.style(tr,'height',(100/numRows)+'%');
            if (i%2==0)  //even rows
            {
                if ( i != 0)
                dojo.addClass(tr,'alternateRow');
            }
            
            if (i == numRows - 1)
            {
                dojo.addClass(tr,'lastRow');
            }
            
            for(var j=0; j<numCols; j++){
                td = document.createElement('td');
                dijit.setWaiRole(td, 'gridcell');
//                dojo.attr(td,'tabindex','0'); //D34602
                tr.appendChild(td);
                dojo.addClass(td,'table_table-cell');  // usually there is a cell class here such as ce633  
                // only put the width on the 1st row (and as a style attribute)
//                if ( i == 0 )
//                	// Defect 3245:  Do not set the border style for the cells in
//                	// a table due to an issue with cells generated or imported that 
//                	// do not have a border defined causing the borders to look 
//                	// inconsistent when exported.  The current fix is to remove the 
//                	// border style in a new table for now as this will need to 
//                	// be revisited when border widths are able to be set in the editor.
//                    //dojo.attr(td,'style','border: 1px solid; width: ' + (100/numCols) + '%;');
//                	dojo.attr(td,'style','width: ' + (100/numCols) + '%;');
                if ( j == 0)
                {
                    dojo.addClass(td,'firstColumn');
                }
                else if ( j == numCols - 1)
                {
                    dojo.addClass(td,'lastColumn');
                }
                
                var element = new CKEDITOR.dom.element( td );
                MSGUTIL.genDefaultContentForCell(element);
				if (isBidi) {
					this._processElementDirection (element.getFirst(),'presLeftToRight', true); 
				}
            }
        }
        var contentBox = this.createDrawFrameNodeForTable(table, isSpare);
        var divId = table.parentNode.id;
        return { "tableDFId": divId, 'tblContentBox': contentBox, 'isNewTbl': true};
    },
        
    //
    // Create ODP draw frame Element to contain a table
    // add isSpare - 13550 to create a spare table 
    //
    createDrawFrameNodeForTable: function(table, isSpare){
        // forbid widgitization for view draft mode
        if (window.pe.scene.isViewDraftMode())
            return;
        if(table!=null){
            this.deSelectAll();
            var drawFrame = document.createElement('div');
            // TODO: Need to dynamically get pr3 and P$ or perhaps get from standard
             dojo.addClass(drawFrame,'draw_frame newbox');   
            //dojo.addClass(drawFrame,'draw_frame  _28_Default_29__20_Title_20_Master-title pr3 P4');   
            var newPos = this.getNewPastePosition({left:this.DEFAULT_TABLE_LEFT,top:this.DEFAULT_TABLE_TOP,width:this.DEFAULT_TABLE_WIDTH,height:this.DEFAULT_TABLE_HEIGHT});
            var top = this.DEFAULT_TABLE_TOP;
            var left = this.DEFAULT_TABLE_LEFT;
            if(isSpare == true){
            	newPos.top = -50; //in % -10
            	newPos.left = -200;//in %-200
            }
            dojo.attr(drawFrame,'presentation_class','table');
            dojo.attr(drawFrame,'pfs','18');
            dojo.attr(drawFrame,'draw_layer','layout');
            dojo.attr(drawFrame,'text_anchor-type','paragraph');
            dojo.style(drawFrame,{
                'position':'absolute',
                'top':newPos.top+"%",
                'left':newPos.left+"%",
                'height': this.DEFAULT_TABLE_HEIGHT+"%",
                'width':this.DEFAULT_TABLE_WIDTH+"%",
                'visibility':'hidden'
                });
            
            var dataNode =table;
            drawFrame.appendChild(dataNode);
            dojo.style(dataNode,{
                'height':'100%',
                'width':'100%'
            });     
            dojo.addClass(dataNode,'contentBoxDataNode'); // Add here so we can process during widgitize component
                
            this.mainNode.appendChild(drawFrame);
            this.setNodeId(drawFrame);
            var pusblish = !isSpare; // Tells to send publish that a new node was created

            var contentObj = this.widgitizeContent(drawFrame,pusblish,true,isSpare); 

            if (pusblish){
	        	this.publishSlideEditorInFocus();
	        }
            
            drawFrame = null; //13550 - need to return drawFrame, so no need to  nullify here
            dataNode = null;
            
            return contentObj;
    	}
        
    },      
    
    //
    // Create a new text node.
    // Text will be created in position defined by pos if pos is defined
    //
    addNewTextContentBox: function(pos,isSpare,text,bInsertInternalList){      
        var drawFrame = null;       
        if (isSpare){
            drawFrame = this.createTextNode(pos,isSpare,text,bInsertInternalList);
            dijit.setWaiState(drawFrame,'hidden','true');
            var box = this.spareBox;                
            box.makeEditable();     
            // jmtjmtjmt box.mainNode.style.display='none';
        } else{
            this.deSelectAll();
            drawFrame = this.createTextNode(pos,false,text,bInsertInternalList);
            var box = this.getRegisteredContentBoxById(drawFrame.id);
            box.makeEditable();
            //S24621: Make the empty created textbox which from menu can moved to other place. in presentation editor.
            if(this.spareBox){
            	this.spareBox.creatingNewContentBox = true;
            }
        }
        if (!isSpare) {
        	this.publishSlideEditorInFocus();
        }
    },
    
    //
    // Shows or hides the vertical and horizontal rulers
    //
    setRulersVisible : function(show){
    	if (this.showRulers && !show) {
    		this.horizontalRuler.setVisible(false);
    		this.verticalRuler.setVisible(false);
    	}
    
    	if (!this.showRulers && show) {
        		this.horizontalRuler.setVisible(true);
        		this.verticalRuler.setVisible(true);
       	}	
       	this.showRulers = show;
       	this.setUIDimensions();
    },
    
   //
    // Sets UI dimensions for slide Editor
    //
    setUIDimensions: function(ev, speakerNotesContentBox){
    	!window.pe.scene.keepCommentStatus && window.pe.scene.hideComments();
    	var presEditor = dojo.query("#presEditor")[0];
    	if (presEditor) {
    		this.mainNode.parentNode.style.height = presEditor.style.height;
    	}
    	var rulerSize = 0;
    	if (this.showRulers)
    		rulerSize = 15;
    	
    	var showRulers = this.showRulers;
    	var slideEditorCoords = dojo.coords(this.mainNode.parentNode);
    	// Gets the slide editor height and width
        var slideEditorHeight = this.slideEditorHeight = parseFloat(this.mainNode.parentNode.style.height);
        var slideEditorWidth = this.slideEditorWidth = parseFloat(this.mainNode.parentNode.offsetWidth);
        var slideHeight, slideWidth, leftRightMargin, topbottomMargin;
        var pageSizeRatio;
        var slide = this.mainNode;
             
        // All the page format attributes are grabbed in the loadSlideInEditor
        // if they are defined in content.html
        if(slide != null) 
		{
        	var pageHeight = dojo.attr(slide, 'pageheight');
			var pageWidth = dojo.attr(slide, 'pagewidth');
			var pageUnits = dojo.attr(slide, 'pageunits');
			var pageOrientation = dojo.attr(slide, 'orientation');
			
			if (pageHeight != null && pageHeight != "null" && pageWidth != null && pageWidth != "null") 
			{
				this.pageHeight = pageHeight;
				this.pageWidth = pageWidth;
			}

			if (pageUnits != null) 
			{
				this.pageUnits = pageUnits;
			}

			if (pageOrientation != null) 
			{
				this.pageOrientation = pageOrientation;
			}
			
			var sizeFactor = 50;
			var maxSize = 16;
			var winSize = parseFloat(window.pe.scene.slideEditor.mainNode.style.width);
			if(winSize < parseFloat(window.pe.scene.slideEditor.mainNode.style.height))
				winSize = parseFloat(window.pe.scene.slideEditor.mainNode.style.height);
			
			var icSize = winSize/sizeFactor;
		    if(icSize > maxSize)
		    	icSize = maxSize;
		    
			if(icSize != this.currentCommentIconSize) {
				this.currentCommentIconSize = icSize;
				for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
					if(this.CONTENT_BOX_ARRAY[i].isWidgitized)
						if(this.CONTENT_BOX_ARRAY[i].hasComments())
							this.CONTENT_BOX_ARRAY[i].updateCommentIconPosition();	
				}
			}
		}
        //console.log("SlideEditor:  height --> " + this.pageHeight + ", width--> " + this.pageWidth);
        
        // Instead of relying on the slide editor height and width, instead check the current pageHeight and pageWidth
        // and set the margins based on those now that they could be any size based on predefined or
        // user defined values.
        
        var speakerNotesHeight = 0;
        var speakerNotesNode = this.notesDrawFrame;
    	var speakerNotesRatio = .1;
    	if (speakerNotesNode)
        {
    		if (speakerNotesNode.style.display != "none") {
    			
        		speakerNotesHeight = parseFloat(this.mainNode.style.height)*speakerNotesRatio;
        		if (speakerNotesContentBox != undefined) {
        			speakerNotesHeight = parseFloat(speakerNotesContentBox.mainNode.style.height);
        		}
        		
        		if (ev != undefined && ev != null) {
        			if (ev.eventName == "windowResized") {
        				//the window was resized we need to calculate the height of the
        				//speaker notes based on the percentage before the resize happened
        				var speakerNotesPercent = (ev.speakerNotesHeight/ev.presEditorHeight);
        				if (speakerNotesPercent > .5) {
        					speakerNotesPercent = .5;
        				}
        				speakerNotesHeight = parseFloat(presEditor.style.height) * speakerNotesPercent;
        			} 
        		}
        		
                // D17032, don't adjust speakerNotesHeight even if it's less than 62px

        		speakerNotesNode.style.height = speakerNotesHeight + "px";
            	speakerNotesNode.style.backgroundColor = 'white';
            	speakerNotesNode.style.paddingBottom = '0px';
            	speakerNotesNode.style.marginBottom = '0px';
            	speakerNotesNode.style.borderBottom = '0px';
            	speakerNotesNode.style.paddingTop = '10px';
            	speakerNotesNode.style.marginTop = '0px';
            	speakerNotesNode.style.borderTop = '0px';
            	speakerNotesNode.style.paddingRight = '0px';
            	speakerNotesNode.style.marginRight = '0px';
            	speakerNotesNode.style.borderRight = '0px';
            	speakerNotesNode.style.paddingLeft = '0px';
            	speakerNotesNode.style.marginLeft = '0px';
            	speakerNotesNode.style.borderLeft = '0px';
            	
            	dojo.style(this.notesDrawText, "margin","0px");
			    dojo.style(this.notesDrawText, "padding","0px");
			    dojo.style(this.notesDrawText, "overflowY","scroll");
            	this.notesDrawText.style.border = '0px';
            	this.notesDrawText.style.height = speakerNotesHeight - 10 +"px";
            	
            	var drawFrameClassesNode = dojo.query(".draw_frame_classes",this.notesDrawText.children[0])[0];
            	if (drawFrameClassesNode) {
					drawFrameClassesNode.style.height = speakerNotesHeight - 14 +"px";
				}

            }  	
        }
        
        // For the first case check to see if the pageHeight is greater then the pageWidth
        // and place into the editor
    	if (this.pageHeight >= this.pageWidth)
    	{
        	pageSizeRatio = concord.util.resizer.getRatio(this.pageWidth, this.pageHeight);
        	slideHeight = slideEditorHeight - speakerNotesHeight - 40;  // slideEditorHeight minus the top and bottom 20px margins
        	slideWidth = slideHeight * pageSizeRatio;
        	
            leftRightMargin = (slideEditorWidth - slideWidth) / 2;  // Center canvas in middle of editor
            slide.style.marginTop = '20px';
            slide.style.marginBottom = '20px';
            slide.style.marginLeft = leftRightMargin + 'px';
            slide.style.marginRight =  leftRightMargin + 'px';
            
            // Check to see if width is larger then the current window.  If it is, need
            // to readjust the window to fit in the current editor space
            if (slideWidth > slideEditorWidth) 
            {
            	pageSizeRatio = concord.util.resizer.getRatio(this.pageHeight, this.pageWidth);

            	slideWidth = slideEditorWidth - 40;
            	slideHeight = slideWidth * pageSizeRatio;
            	
                topbottomMargin = (slideEditorHeight - slideHeight) / 2;
                slide.style.marginTop = topbottomMargin + 'px';
                slide.style.marginBottom = topbottomMargin + 'px';
                slide.style.marginLeft = '20px';
                slide.style.marginRight =  '20px';
                leftRightMargin = 20;
            }
    	}
    	// Second case is if the page width is greater then the page height
    	else
    	{
        	pageSizeRatio = concord.util.resizer.getRatio(this.pageHeight, this.pageWidth);
        	slideWidth = slideEditorWidth - 40;
        	slideHeight = slideWidth * pageSizeRatio;
        	
            topbottomMargin = (slideEditorHeight - slideHeight - speakerNotesHeight) / 2;
			slide.style.marginTop = topbottomMargin + rulerSize + 'px';
            slide.style.marginBottom = topbottomMargin + 'px';
            slide.style.marginLeft =  20 + rulerSize + 'px';
            slide.style.marginRight =  '20px';
            leftRightMargin = 20;
            // Check to see if width is larger then the current editor window
            if (slideHeight > (slideEditorHeight - speakerNotesHeight - 40)) 
            {
            	pageSizeRatio = concord.util.resizer.getRatio(this.pageWidth, this.pageHeight);
            	
            	slideHeight = slideEditorHeight - speakerNotesHeight - 40;
            	slideWidth = slideHeight * pageSizeRatio;
            	
                leftRightMargin = (slideEditorWidth - slideWidth) / 2;
                slide.style.marginTop = '20px';
                slide.style.marginBottom = '20px';
                slide.style.marginLeft = leftRightMargin + 'px';
                slide.style.marginRight =  leftRightMargin + 'px';
                topbottomMargin = 20;
            }
    	}
    	
        slide.style.height = slideHeight-2 + 'px';
        slide.style.width = slideWidth -2  + 'px';
        
        // To obtain different arrow size in slide editor page with different size:
        // this.pageHeight(19cm) is default page size, for it define a default arrow ARROW_LENGTH(6px)
        // when slide editor page is resized, adjusted arrow len will be changed based on ARROW_LENGTH
        // That is to say, to different slide editor page size, different absolute arrow len
        // will be used when creating/resizing connector shape.
        this.adjustArrowLen = (this.mainNode.offsetHeight * PresConstants.ARROW_LENGTH)/
            ((this.pageHeight * PresConstants.PPICONSTATNT) / PresConstants.INTOCMCONVERTOR);
        this.adjustHalfArrowLen = this.adjustArrowLen / 2;
        
        var fontSize = PresCKUtil.getBasedFontSize(slideHeight,this.pageHeight);       
        slide.style.fontSize = fontSize + 'px';
        if (this.editorShadow) this.editorShadow.resize();
        
        // Resize the rulers
        var horizontalRuler = this.horizontalRuler;
        var verticalRuler = this.verticalRuler;
        // FIXME: for now we always use inches
        var pageUnitsCoef = (this.pageUnits == 'cm')? 2.54 : 1.0;
        if (showRulers && horizontalRuler) {
        	horizontalRuler.setPixelsPerUnit(slideWidth/this.pageWidth*pageUnitsCoef);
        	horizontalRuler.move(slideEditorCoords.x + rulerSize + 1, slideEditorCoords.y);
        	horizontalRuler.resize(slideEditorCoords.w - rulerSize - 2, rulerSize);
        }
        if (showRulers && verticalRuler) {
        	verticalRuler.setPixelsPerUnit(slideHeight/this.pageHeight*pageUnitsCoef);
        	verticalRuler.move(slideEditorCoords.x + 1, slideEditorCoords.y + rulerSize);
            verticalRuler.resize(rulerSize, slideEditorCoords.h - rulerSize);
        }
        
        if (speakerNotesNode && speakerNotesNode.style.display != "none") {
        	//correct top position of the speaker notes node
        	var topPercent = "100";
        	topPercent = ((parseFloat(this.mainNode.style.height)+parseFloat(slide.style.marginBottom)+2)/parseFloat(this.mainNode.style.height))*100;
        	speakerNotesNode.style.top = topPercent+'%';
        	//correct the width of the speaker notes node
            speakerNotesNode.style.width = '100%';
        	var canvas = dojo.query("#slideEditorContainer")[0];
        	var canvasPosition = dojo.position(canvas);
        	var canvasPositionWidth = canvasPosition.w;
        	var slideEditor = dojo.query(".slideEditor")[0];
        	var slideEditorWidth = dojo.style(slideEditor, "width");
        	var leftOffSet = canvasPositionWidth - slideEditorWidth - 4;
        	leftOffSet = leftOffSet/2;
        	leftOffSet = leftOffSet - rulerSize;
        	var leftOffSetPercent = leftOffSet/slideEditorWidth;
        	leftOffSetPercent = leftOffSetPercent * 100;
        	dojo.style(speakerNotesNode, "left", "-"+leftOffSetPercent+"%");
        	dojo.style(speakerNotesNode, "width", ""+canvasPositionWidth-rulerSize-2+"px"); 
        	var speakerNotesContentBox = this.getRegisteredContentBoxById(speakerNotesNode.id);
        	if ( speakerNotesContentBox){
        		speakerNotesContentBox.fixSpeakerNotesEditWindow();
        	}
        	dojo.style(speakerNotesNode,"overflowX","hidden");
        }
        
    	
        //Update all handles on box contents
        this.updateALLHandles();
        if (this.sceneReady) this.updateALLCKFonts();
        if (dojo.isIE) this.adjustAllContentDataSize();
        // Update dialogs layout and template if present
        if (this.layoutGalleryObj) this.layoutGalleryObj.updateDialogHeight();
        if (this.templateGalleryObj) this.templateGalleryObj.updateDialogHeight();
        if (this.slideTransitionGalleryObj) this.slideTransitionGalleryObj.updateDialogHeight();
 		if (this.sceneReady) this.refreshAllPositionFromSorter();
 		//Update all svg shapes to make sure the stroke-width is constant
 		for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
			if(this.CONTENT_BOX_ARRAY[i].isWidgitized)
	 			if ( this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE){
					this.CONTENT_BOX_ARRAY[i].adjustSvgNode();	
				}else if(this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE ){
					//Needs to recalculte presrowheight for table when there is any layout change
					//(e.g. user resize spreaker notes etc...) 
					this.CONTENT_BOX_ARRAY[i].setPresRowHeight(true);
				}				
		}
     },
    
    //
    // 
    //
    refreshAllPositionFromSorter: function(){
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
        	if (this.CONTENT_BOX_ARRAY[i].isWidgitized && this.CONTENT_BOX_ARRAY[i].contentBoxType != PresConstants.CONTENTBOX_NOTES_TYPE) {
        		this.CONTENT_BOX_ARRAY[i].refreshPositionFromSorter();
        		this.CONTENT_BOX_ARRAY[i].adjustPositionForBorder();
        	}        	
        }                          	
    },
        
    //
    // When window is being resized CK fonts need to be adjusted
    //
    updateALLCKFonts: function(){        
    	//For now close all CK they will update on reopen
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
        	if (this.CONTENT_BOX_ARRAY[i].editModeOn && this.CONTENT_BOX_ARRAY[i].contentBoxType!=PresConstants.CONTENTBOX_NOTES_TYPE) {
        		this.CONTENT_BOX_ARRAY[i].toggleEditMode(false);
        		this.CONTENT_BOX_ARRAY[i].makeNonEditable();
        	}
        }                      
    },
    
    //
    // When window is being resized adjust image heights
    //
    adjustAllContentDataSize: function(){
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){   
        	if(!this.CONTENT_BOX_ARRAY[i].isWidgitized)
        		this.widgitizeObject(this.CONTENT_BOX_ARRAY[i]);
            this.CONTENT_BOX_ARRAY[i].adjustContentDataSize();
        }                       
    },
       
    
    //
    //Updating handles on all elements
    //
    updateALLHandles: function(){
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){            
            if(this.CONTENT_BOX_ARRAY[i].isWidgitized)
            {
            	
            	if (this.CONTENT_BOX_ARRAY[i].boxSelected)                      
            		this.CONTENT_BOX_ARRAY[i].updateHandlePositions();  
            	else if(this.CONTENT_BOX_ARRAY[i].hasComments()){
            		this.CONTENT_BOX_ARRAY[i].updateCommentIconPosition();
            	}
            	this.CONTENT_BOX_ARRAY[i].updateContentBoxLockedIconPosition();
            }
        }
    },
    
    
    //
    // This function returns the equivalent % given a px number
    //
    PxToPercent: function(px,heightOrWidth){
        //console.log("contentBox:PxToPercent","Entry px is "+px);
        var pxValue = parseFloat(px);
        var value=null;
        if (dojo.isIE)
             value = (heightOrWidth=='height')? this.mainNode.offsetHeight : this.mainNode.offsetWidth;
        else
            value = (heightOrWidth=='height')? dojo.style(this.mainNode,'height') : dojo.style(this.mainNode,'width');

        var result =  (pxValue * 100)/value;
        //console.log("contentBox:PxToPercent","Exit % is "+result+"%. (Based on px for heightWidth = "+heightOrWidth+" and Value = "+value);   
        return result;
    },  
    
    //
    //Should be implemented by the parent and passed to this object
    //
    getFocusComponent : function(){
        throw new Error("Options argument need to specify getFocusComponent in slideEditor constructor.");
        return;             
    },
    
    //
    // Stores the master style names from slide sorter
    //  
    handleMasterTemplateChange:function(data){
        //need to store the master style json to be used when creating new frames or outlines 
    	//15511 - only remove when we are changing to a different master
    	//keep the links if we are changing to same master styles
        if(data!=null && this.currMasterFrameStylesJSON != data.currMasterFrameStylesJSON){
	        //Remove link elements from main document       
	        this.removeCSSLinks(window.document);
	        
	        //Remove link elements from all CK edit instances
	        //D14414: [Regression][MasterStyle] Font color is not black after switch back to default template.
	        if(!this.SINGLE_CK_MODE){
		        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){
		            if (this.CONTENT_BOX_ARRAY[i].editor){
		                //this.removeCSSLinks(this.CONTENT_BOX_ARRAY[i].editor.document.$);
		            	var masterCss = this.currMasterFrameStylesJSON.masterStyleCss;
		            	masterCss = concord.util.uri.stripRelativePathInfo(masterCss);
		                concord.util.uri.removeCSS(this.CONTENT_BOX_ARRAY[i].editor.document.$,masterCss);
		            }       
		        }        	
	        }else{
	        	var masterCss = this.currMasterFrameStylesJSON.masterStyleCss;
	        	masterCss = concord.util.uri.stripRelativePathInfo(masterCss);
	        	if(this.spareBox && this.spareBox.editor && this.spareBox.editor.document){
	        		concord.util.uri.removeCSS(this.spareBox.editor.document.$,masterCss);
	        	}
	        	if(this.groupSpareBox && this.groupSpareBox.editor && this.groupSpareBox.editor.document){
	        		concord.util.uri.removeCSS(this.groupSpareBox.editor.document.$,masterCss);
	        	}
	        	if(this.tableSpareBox && this.tableSpareBox.editor && this.tableSpareBox.editor.document){
	        		concord.util.uri.removeCSS(this.tableSpareBox.editor.document.$,masterCss);
	        	}
	        	
	        }
        }
        
        this.currMasterFrameStylesJSON = data.currMasterFrameStylesJSON;
        this.currMasterFrameStylesJSON.currMaster = data.currMaster;
    },
    
    //
    // Removing CSS links from head
    //
    removeCSSLinks: function(doc){
        //remove master style css link from head
        var masterStyleCss = this.currMasterFrameStylesJSON.masterStyleCss;
        if (masterStyleCss.length==0)
            return;
        //D14414: [Regression][MasterStyle] Font color is not black after switch back to default template.
        masterStyleCss = concord.util.uri.stripRelativePathInfo(masterStyleCss);
        var linkNodeList = concord.util.HtmlContent.getLinkElements(doc);
        if(linkNodeList!=null){
            for(var i = 0; i<linkNodeList.length; i++){
                if(linkNodeList[i].href.indexOf(masterStyleCss)>=0){
                    dojo.destroy(linkNodeList[i]);
                }
            }
        }   
    },

    //
    // Returns the master style names
    //  
    getMasterTemplateInfo: function(data){
        //need to store the master style json to be used when creating new frames or outlines       
        return this.currMasterFrameStylesJSON;      
    },
    
    // Connect mouse move ruler event handler to the onmousemove event
    connectRulerMouseMove: function(){
    	var haveRulers = this.horizontalRuler && this.verticalRuler;
    	if (!dojo.isIE && haveRulers){
       		this.connectArray.push(dojo.connect(window,'onmousemove',dojo.hitch(this.horizontalRuler, this.horizontalRuler.handleMouseMove)));
    		this.connectArray.push(dojo.connect(window,'onmousemove',dojo.hitch(this.verticalRuler, this.verticalRuler.handleMouseMove)));   		
    	}
    	else if (haveRulers)
        	document.onmousemove = dojo.hitch(this, this.handleRulersMouseMove);
    },
    
    //
    // Create rulers if they do not exist
    //
    createRulers: function(){
        var rulerContainer = dojo.byId('slideEditorContainer');
        var createdRuler = false;
        if (!this.horizontalRuler){	
        	var horizontalRuler = this.horizontalRuler = new concord.widgets.horizontalRuler();
        	rulerContainer.appendChild(horizontalRuler.domNode);
        	createdRuler = true;
        }
        if (!this.verticalRuler){
        	var verticalRuler = this.verticalRuler = new concord.widgets.verticalRuler();
        	rulerContainer.appendChild(verticalRuler.domNode);
        	createdRuler = true;
        }
        if (createdRuler)
        	this.connectRulerMouseMove();
    },
    
    createIndicatorSytleNode: function(tdocument,user, color){
    	 var ss = tdocument.createElement("style");
         ss.type = "text/css";
         ss.id = user;
         var rules = tdocument.createTextNode('.user_indicator .'+user+ '{ border-bottom:2px dotted ' +color +'; line-height:1.2em;}');
         //ss.innerHTML = ".user_indicator ." + user + "{background-color:" + color + ";}";
         if (ss.styleSheet) 
                 ss.styleSheet.cssText = rules.nodeValue;
         else 
                 ss.appendChild(rules);
         return ss;
    },
    readLine: function(){
    	var contentBoxInEditMode = pe.scene.getContentBoxCurrentlyInEditMode();
        if (contentBoxInEditMode)
        {
        	var ckselection = contentBoxInEditMode.editor.getSelection();
        	if (ckselection){
        		 var ranges = ckselection.getRanges();
        		 if(ranges && ranges.length == 1 && ranges[0].collapsed){
        			 var lastSelection = PresListUtil.getListSelectionRangeInfo(ranges[0]);
        			 if(lastSelection){
        				 var focusSpan = lastSelection.startSelection.focusSpan;
        				 var focusLine = focusSpan.getParent();
        				 var content = focusLine.getText();
        				 this.announce(content);
        			 }
        		 }
 		   }
        }
    },
    readIndicator: function(){
    	var contentBoxInEditMode = pe.scene.getContentBoxCurrentlyInEditMode();
        if (contentBoxInEditMode)
        {
        	var ckselection = contentBoxInEditMode.editor.getSelection();
        	if (ckselection){
        		 var ranges = ckselection.getRanges();
        		 if(ranges && ranges.length == 1 && ranges[0].collapsed){
        			 var lastSelection = PresListUtil.getListSelectionRangeInfo(ranges[0]);
        			 if(lastSelection){
        				 var focusSpan = lastSelection.startSelection.focusSpan;
        				 var content = focusSpan.getText();
        				 var userid = focusSpan.getAttribute('typeid').replace('CSS_','');
        				 var userName =  pe.scene.getEditorStore().getEditorById(userid).getName();
        				 var msg = content + ' Edit by ' + userName;
        				 this.announce(msg);
        			 }
        		 }
 		   }
        	return true;
        }
        return false;
    },
    announce: function(message){
		if(!this.screenReaderNode1){
			this.screenReaderNode1 = dojo.create('div',null, document.body);
    		this.screenReaderNode1.style.zIndex = -20000;
    		this.screenReaderNode1.style.position = "relative";
    		this.screenReaderNode1.style.top = "-10000px";
    		this.screenReaderNode1.style.overflow = "hidden";
    		this.screenReaderNode1.style.width = "1px";
    		this.screenReaderNode1.style.height = "1px";
        	dijit.setWaiRole(this.screenReaderNode1,'region');
			dijit.setWaiState(this.screenReaderNode1,'live', 'assertive');
			dijit.setWaiState(this.screenReaderNode1,'label', 'live region');
			
			this.screenReaderNode2 = dojo.create('div',null, document.body);
			this.screenReaderNode2.style.zIndex = -20000;
			this.screenReaderNode2.style.position = "relative";
    		this.screenReaderNode2.style.top = "-10000px";
    		this.screenReaderNode2.style.overflow = "hidden";
    		this.screenReaderNode2.style.width = "1px";
    		this.screenReaderNode2.style.height = "1px";
        	dijit.setWaiRole(this.screenReaderNode2,'region');
			dijit.setWaiState(this.screenReaderNode2, 'live', 'assertive');
			dijit.setWaiState(this.screenReaderNode2,'label', 'live region');
			
			this.screenReaderNode = this.screenReaderNode1;
		}
		// use two nodes and clean one and use another to fix the issue if two more char are same, and navigator them with key arrowleft/arrowright
		this.screenReaderNode.innerHTML = " ";
		dijit.removeWaiState(this.screenReaderNode, 'live');
		if(this.screenReaderNode == this.screenReaderNode1){
			this.screenReaderNode = this.screenReaderNode2;
		}else{
			this.screenReaderNode = this.screenReaderNode1;
		}
		dijit.setWaiState(this.screenReaderNode, 'live', 'assertive');
		this.screenReaderNode.innerHTML = message;
		console.log("annoucne--"+ message);
	},
    createScreenReaderNodesinEditMode: function(){
		var contentBoxInEditMode = pe.scene.getContentBoxCurrentlyInEditMode();
        if (contentBoxInEditMode)
        {
        	var contentdocument = contentBoxInEditMode.editor.document;
        	var allEditors = pe.scene.getEditorStore().editorContainer.items;
    		for ( var i in allEditors)
    		{
    			var editor = allEditors[i];
    			var userid = editor.getEditorId();
    			var user = "CSS_" + userid;
    			var userName = editor.getName();
    			var screenReaderNode = contentdocument.$.getElementById('coid_'+user);
        		if(!screenReaderNode)
        		{
        			screenReaderNode = contentdocument.$.createElement('span');
        			screenReaderNode.id = 'coid_'+user;
        			screenReaderNode.setAttribute('style', 'font-size:0pt;');
        			// #32944 Set the font size to 0
        			screenReaderNode.setAttribute(PresConstants.ABS_STYLES.FONTSIZE, "0");
        			var parent = contentdocument.getDocumentElement();
        			parent.$.appendChild(screenReaderNode);
        		}
        		screenReaderNode.innerHTML = 'Edit by ' + userName;	
    		}
        }
	},
    //
    // createIndicatorSytle
    //
    createIndicatorSytle: function(userId){
    	//console.log('createIndicatorSytle7630, userID == '+userId);
        var indicators = CKEDITOR.indicators;
        var user = "CSS_" + userId;
        var indicator=indicators[user];
        if(indicator!=null){
            return;
        }
        var color = pe.scene.getEditorStore().getUserCoeditColor(userId);
        var head = document.getElementsByTagName("head")[0];
        dojo.query('style[id='+user+']',head).forEach(dojo.destroy);
        var forMainNode = this.createIndicatorSytleNode(document,user,color);
        head.appendChild(forMainNode);
        var contentBoxInEditMode = pe.scene.getContentBoxCurrentlyInEditMode();
        if (contentBoxInEditMode)
        {
            var contentdocument = contentBoxInEditMode.editor.document.$;
            head = contentdocument.getElementsByTagName("head")[0];
            dojo.query('style[id=' + user + ']', head).forEach(dojo.destroy);
            var forCKNode = this.createIndicatorSytleNode(contentdocument, user, color);
            head.appendChild(forCKNode);
        }
        var value = {};
        value['user'] = user;
        value['id'] = user;
        value['color']=color;
		value['role'] = "group";
		value['couserid'] = "coid_"+user;
		var authUser = pe.scene.authUser.getId();
		this.createScreenReaderNode(user, pe.scene.getEditorStore().getEditorById(userId).getName());

        indicators[user] = new CKEDITOR.style(CKEDITOR.indicatorStyle, value);     
    	//console.log('createIndicatorSytle end, userID == '+userId); 
    },
    
    //
    // cancel all move operations and resize
    //
    cancelAllMoveAndResize: function(e){
       
        this.handlesMultiSelectMouseUp(this.TL_move, this.RESIZE_FLAG, this.selectedBoxArrayForResize, e);
        this.cancelAddTextBox();
    },
    
    
    //
    // Cancel text box creation
    // This function can be called in two scenarios
    // 1) when the user is dragging to create and lightblue border leaves canvas. In this case boxSelectorNode is set
    // 2) when user has cross hair cursor but has not begun to drag in this case boxSelectorNode is not set
    //
    cancelAddTextBox: function(cancelCreation){
     	if (((this.createPackageOnClick.createNewContentBox) && (this.boxSelectorNode!=null)) ||
    		((this.createPackageOnClick.createNewContentBox) && (this.boxSelectorNode==null)&& (cancelCreation!=null) && (cancelCreation==true)))	{
    		//Reset createPackageOnClick object
            this.createPackageOnClick.createNewContentBox = false;
            this.createPackageOnClick.pos =null;
//            document.body.style.cursor='default';
            this.createPackageOnClick.callback = null;   
            if (this.createPackageOnClick.svgDrawFrame) {
                this.createPackageOnClick.svgDrawFrame = null;
                this.createPackageOnClick.resizeCallback = null;
                this.createPackageOnClick.finalizeCallback = null;
                this.createPackageOnClick.shapeType = null;
            }
            //Destroy selector Box
        	try{
        		this.destroyBoxSelectorNode();
        	} catch(e){
        		//console.log("cancelAddTextBox: Error canceling new text box event");
        	}
	        this.setDefaultMouseDown();
    	}
    },
    
    
    //
    // Get current selected box index. returns null if no content box is selected
    //
    getIndxBoxSelected: function(){
        var currInd = null;
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){            
            if(this.CONTENT_BOX_ARRAY[i].isWidgitized)
            	if (this.CONTENT_BOX_ARRAY[i].boxSelected)  {
            		currInd = i;
            		break;
            	}               
        }   
        return currInd;
    },
    
    getIndxLockSelected: function(){
        var currInd = null;
        for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){            
            if(this.CONTENT_BOX_ARRAY[i].isWidgitized)
            {
            	if (this.CONTENT_BOX_ARRAY[i].lockSelected)  {
            		currInd = i;
            		break;
            	}
            }
        }
        return currInd;
    },
    

    // get next selected index
    selectNextBox: function(reverse){
        //get first selected box
        var currInd = this.getIndxBoxSelected();
        if (currInd == null) {
            currInd = this.getIndxLockSelected();
        }

        var nextInd = null;
        if (currInd!=null) {
            nextInd = currInd;
            var trynext = true;
            while (trynext) {
                if (reverse) {
                    nextInd = nextInd - 1;
                    if (nextInd < 0) {
                        nextInd = this.CONTENT_BOX_ARRAY.length - 1;
                    }
                } else {
                    nextInd = (nextInd +1) % this.CONTENT_BOX_ARRAY.length; //Next index to be focussed
                }

                // Don't tab to presentation notes. Must hit shift+F7 to go there.
                if (this.CONTENT_BOX_ARRAY[nextInd].contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE) {
                    continue;
                }

                if (nextInd!=null){
                    var nextBox = this.CONTENT_BOX_ARRAY[nextInd];
                    if(!nextBox.isWidgitized)
                    	nextBox = this.widgitizeObject(nextBox);
                    this.CONTENT_BOX_ARRAY[currInd].deSelectThisBox();
                    nextBox.selectThisBox();
                    if (!nextBox.boxSelected && nextBox.isBoxLocked()) {
                        nextBox.selectThisLockedBox();
                    }
                }
                trynext = false;
            }
        } else if (this.CONTENT_BOX_ARRAY.length > 0) { // need to skip notes
            var nextBox = null;
            for (var i = 0, length = this.CONTENT_BOX_ARRAY.length;
                 i < length; i++) {
                nextBox = this.CONTENT_BOX_ARRAY[i];
                if (nextBox.contentBoxType != PresConstants.CONTENTBOX_NOTES_TYPE) {
                    break;
                }
            }
            if(!nextBox.isWidgitized)
            	nextBox = this.widgitizeObject(nextBox);
            if (nextBox.contentBoxType != PresConstants.CONTENTBOX_NOTES_TYPE) {
                nextBox.selectThisBox();
                if (!nextBox.boxSelected && nextBox.isBoxLocked()) {
                    nextBox.selectThisLockedBox();
                }
            } else {            // todo(bjcheny): only notes
            }
        }
    },


    //set node elements id with new UUID
    setNodeId:function(nodeElem,prefix){
        if(nodeElem!=null){
            concord.util.HtmlContent.injectRdomIdsForElement(nodeElem);
            if (prefix!=null){
                nodeElem.id = prefix+nodeElem.id;
            }
            //set ids for all children elements
            var children = nodeElem.getElementsByTagName('*');
            for(var i =0; i<children.length; i++){
                // D7392 - skip BRs (since 'injectRdomIdsForElement' will delete them)
                if ( children[i].tagName.toLowerCase() != "br" ) {
                    concord.util.HtmlContent.injectRdomIdsForElement(children[i]);
                }
                if (prefix!=null){
                    if ((typeof children[i] != "undefined") && (children[i].id != null)) {
                        children[i].id = prefix+'_child_'+children[i].id;
                    }
                }
            }
        }
    },
    getSelectedContentboxForComment: function(){
    	for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){    
    		if (this.CONTENT_BOX_ARRAY[i].boxSelected && 
    			!this.CONTENT_BOX_ARRAY[i].isNotesContentBox &&
    			!this.CONTENT_BOX_ARRAY[i].isBoxLocked()){
    			firstBox = this.CONTENT_BOX_ARRAY[i];
    			return firstBox;
    		}
    	}
    	return null;
    },
    handleQueryPosition: function(pos){
    	var commentsId = pos.id;
    	if(commentsId){
    		var cBox = this.getBoxWithCommentId(commentsId);
    		if(cBox){
    			cBox.initializeCommentsNode();
    			var commentImgs = cBox.mainNode.getElementsByClassName('imgcomment');
        		var commentImg = commentImgs['ic_'+commentsId];
    			if(commentImg){
    				var styles = commentImg.getBoundingClientRect();
    				pos.filled = true;
    				pos.x = styles.left + styles.width/2;
    				pos.y = styles.top;
    				pos.w = styles.width;
    				pos.h = styles.height + styles.width * 3/29;
    				delete pe.incommentsSelected;
    				return pos;
    			} 
    		}
    	}
    	
    	var maxSize = PresConstants.COMMENT_ICON_SIZE;	
    	var winSize = parseFloat(window.pe.scene.slideEditor.mainNode.style.width);
    	if(winSize < parseFloat(window.pe.scene.slideEditor.mainNode.style.height))
    		winSize = parseFloat(window.pe.scene.slideEditor.mainNode.style.height);
    	
    	var commentIconSize = winSize/PresConstants.COMMENT_SIZEFACTOR;
    	if(commentIconSize > maxSize)
    		commentIconSize = maxSize;
    	
    	if(pe.incommentsSelected)
		{
			pos.filled = true;
			pos.x = -9999;
			pos.y = -9999;
			pos.w = commentIconSize;
			pos.h = commentIconSize;
			return pos;
		}
	    
	    var firstBox = this.getSelectedContentboxForComment();
	    if(firstBox){
	    	this.lastBoxForNewComments = firstBox;
			if (!firstBox.boxSelected)
				firstBox.selectThisBox();
			var commentImgs = firstBox.mainNode.getElementsByClassName('imgcomment');
			var i = commentImgs.length;
			var borderSize = dojo.style(firstBox.mainNode, 'borderTopWidth');
			var handleAdjust = borderSize / 2; // TO CENTER Handle based on thikness of border
			var topPos = -borderSize - ((commentIconSize / 2) - (handleAdjust)) + (commentIconSize * (i + borderSize / 29));
			pos.filled = true;
			var styles = firstBox.mainNode.getBoundingClientRect();
			pos.x = styles.left + styles.width + commentIconSize / 2;
			pos.y = styles.top + topPos + commentIconSize * 2 / 29;
			pos.w = commentIconSize;// styles.width;
			pos.h = commentIconSize;// styles.height;
			return pos;
	    }
	    
	    // default position for flyer comment.
		var styles = this.mainNode.getBoundingClientRect();
		pos.filled = true;
		pos.x = styles.left + styles.width / 2;
		pos.y = styles.top + styles.height * 1 / 3;
		pos.w = commentIconSize;
		pos.h = commentIconSize;
		return pos;
    },
    handleCommentsCreated: function(data){
    	if(this.lastBoxForNewComments){
    		var firstBox = this.lastBoxForNewComments;
    	}else{
    		var firstBox = this.getSelectedContentboxForComment();
    	}
    	if(firstBox){
    		if (!firstBox.boxSelected)
    			firstBox.selectThisBox();
    		firstBox.createCommentsLink(data.comments);
    	}
    	this.lastBoxForNewComments = null;
    },
    
    handleCoeditAddCommentIcon: function(data){
    	var drawFrameId = data.drawFrameId;
    	var commentId = data.commentId;
        var contentBox = this.getRegisteredContentBoxById(drawFrameId);
        if (contentBox)
            contentBox.addCommentIcon(commentId);
    },
    
    handleCoeditDeleteCommentIcon: function(data){
    	var drawFrameId = data.drawFrameId;
    	var commentId = data.commentId;
        var contentBox = this.getRegisteredContentBoxById(drawFrameId);
        if (contentBox)
            contentBox.deleteCommentIcon(commentId);     
    },
    
    publishDisableComments: function (){
        //console.log("slideEditor:publishDisableComments","Entry");
        var eventData = [{'eventName': concord.util.events.commenttingEvents_eventName_disableComments}];
        concord.util.events.publish(concord.util.events.commenttingEvents, eventData);  
    },
    publishcreateComments: function (){
        //console.log("slideEditor:publishcreateComments","Entry");
        var eventData = [{'eventName': concord.util.events.commenttingEvents_eventName_createComment}];
        concord.util.events.publish(concord.util.events.commenttingEvents, eventData);  
    },
    
    expandComments: function (commentsId){
        if(null!=this.activeCommentsId){
            this.commentsUnSelected(this.activeCommentsId);
        }
        this.commentsSelected(commentsId);
        this.commentsBar.expandComments(commentsId);
    },
    
    commentsSelected: function(commentsId){
        this.activeCommentsIcon(commentsId);

    },
    commentsUnSelected: function(commentsId){
        this.inActiveCommentsIcon(commentsId);

    },
    selectBoxWithComment:function(data){

        if(data!=null && data.commentsId!=null){
            var commentsId = data.commentsId;            
            var contentBox = this.getBoxWithCommentId(commentsId);
            if(contentBox == null) {
        		setTimeout(dojo.hitch(this,function(){
        			contentBox = this.getBoxWithCommentId(commentsId);
        			if(contentBox != null && !contentBox.boxSelected){
    	                contentBox.selectThisBox(null, commentsId);
    	            }
        		}), 100);
        	} else {
	            if(!contentBox.boxSelected){
	                contentBox.selectThisBox(null, commentsId);
	            }
        	}
        }
    },
    unselectBoxWithComment:function(data){
        if(data!=null && data.commentsId!=null){
            var commentsId = data.commentsId; 
            var contentBox = this.getBoxWithCommentId(commentsId);
            if(contentBox!=null && contentBox.boxSelected){
                contentBox.deSelectThisBox();
            }
        }
    },
    getFirstBoxAsAppearedInSlide:function(){
    	//Find first box (that is not the Notes or Locked) on the slide
    	var firstBox = null;
        if(this.CONTENT_BOX_ARRAY!=null && this.CONTENT_BOX_ARRAY.length>=2){
            //Find first VALID box
        	for(var f = 0; f<this.CONTENT_BOX_ARRAY.length; f++) {
        		var fb = this.CONTENT_BOX_ARRAY[f];
        		//D17462 include locked boxes
        		if(fb.contentBoxType != PresConstants.CONTENTBOX_NOTES_TYPE) {
        			firstBox = fb;
        			break; //found first valid box
        		}
        	}
        	
        	if(firstBox == null)
        		return null;
        	
        	//Now find highest Box on the slide
            var firstBoxTop = dojo.getComputedStyle(firstBox.mainNode).top;
            //D17462 make sure to send pixels to concord.util.resizer.getIntPropertyStyleValue
            //safari returns percentages
            firstBoxTop = firstBoxTop.replace("%","px");
            var firstBoxTopInt = concord.util.resizer.getIntPropertyStyleValue(firstBoxTop);
                
            for(var i=1; i<this.CONTENT_BOX_ARRAY.length; i++) {
                var contentBox = this.CONTENT_BOX_ARRAY[i];
                //D17462 include locked boxes
                if(fb.contentBoxType != PresConstants.CONTENTBOX_NOTES_TYPE) {
                	var contentBoxTop = dojo.getComputedStyle(contentBox.mainNode).top;
                	//D17462 make sure to send pixels to concord.util.resizer.getIntPropertyStyleValue
            		//safari returns percentages
                	contentBoxTop = contentBoxTop.replace("%","px"); 
                	var contentBoxTopInt=concord.util.resizer.getIntPropertyStyleValue(contentBoxTop);
                	if(contentBoxTopInt < firstBoxTopInt){
                		firstBox = contentBox;
                		firstBoxTopInt = contentBoxTopInt;
                	}
                }                
            }
        }
        if(firstBox && !firstBox.isWidgitized)
        	firstBox = this.widgitizeObject(firstBox);
        return firstBox;
    },
    getCommentIdInSelectedBox: function(){
        var actID = null;
        var selectedBoxIdx = this.getIndxBoxSelected();
        var selectedBox = null;
        if((selectedBoxIdx == null || selectedBoxIdx <0) && this.CONTENT_BOX_ARRAY.length>=1){
            //get the first box (top position) as it appears in slide
            var firstBox = this.getFirstBoxAsAppearedInSlide();
            selectedBox = firstBox;
        }else if(selectedBoxIdx != null && selectedBoxIdx>=0 && this.CONTENT_BOX_ARRAY.length>=1) {
            selectedBox = this.CONTENT_BOX_ARRAY[selectedBoxIdx];
        }
        if(selectedBox != null) {        	
        	actID = selectedBox.selectedCommentId; 
        }
        return actID;
    },
    getBoxWithCommentId:function(commentsId){
        if(commentsId!=null){
            for(var i=0; i<this.CONTENT_BOX_ARRAY.length; i++) {
                var contentBox = this.CONTENT_BOX_ARRAY[i];
                var contentBoxDrawFrame = contentBox.mainNode;
                if(contentBoxDrawFrame != null){
                    var drawFrameCommentIds = dojo.attr(contentBoxDrawFrame, 'commentsid');
                    if(drawFrameCommentIds!=null && drawFrameCommentIds!=""){
                        var drawFrameCommentIdArray = drawFrameCommentIds.split(" ");
                        for(var j=0; j< drawFrameCommentIdArray.length; j++){
                            var drawFrameCommentId = drawFrameCommentIdArray[j];
                            if(drawFrameCommentId == commentsId){
                                return contentBox;
                            }
                        }
                    }
                    
                }
            }
        }
        return null;
    },
    //
    //Destroys any dialogs present    
    //
    destroyDialogs: function(){     
        if (this.newImageDialogObj) 
            this.newImageDialogObj.destroyRecursive(true);
        if (this.templateDesignDialogObj) 
            this.templateDesignDialogObj.destroyRecursive(true); 
        if (this.openLayoutDialogObj) 
            this.openLayoutDialogObj.destroyRecursive(true);
        if (this.slideTransitionDialogObj) 
            this.slideTransitionDialogObj.destroyRecursive(true);
        if (this.lockMessageDialog) 
            this.lockMessageDialog.destroyRecursive(true);
        if (this.newTableDialogObj) 
            this.newTableDialogObj.destroyRecursive(true);  
        if (this.newTableRowDialogObj) 
            this.newTableRowDialogObj.destroyRecursive(true); 
        if (this.newTableColDialogObj) 
            this.newTableColDialogObj.destroyRecursive(true); 
    },
    
    //
    // this function is called to cleanup slideEditor
    //
    destroySlideEditor: function(){
        //Destroy objects
        this.cleanSlideEditor();        
        this.destroyContextMenu();
        this.destroyDialogs();
        
        
        //Destroy events
        if (dojo.isIE){             
            this.selectBox = null;
            document.onmousemove =null;
            document.onmouseup = null;
            document.ondragstart = null;
            this.TL_CONNECT = null;
            this.TL_move =null;         
        }else{          
            if (this.selectBox) dojo.disconnect(this.selectBox);
            if (this.mouseupEvent) dojo.disconnect(this.mouseupEvent);
            if (this.TL_move) dojo.disconnect(this.TL_move); 
            if (this.TL_CONNECT) dojo.disconnect(this.TL_CONNECT);          
        }

        this.mainNode=null;
        try{
        	this.destroyAllSpareBox();
		}catch(e){}
    },
	clearSlideNavSetTimeout : function(action) {
		if (this.slideSelectedTimeOut != null) {
			// console.log("onPageDown-clearTimeOut1");
			clearTimeout(this.slideSelectedTimeOut);
			this.slideSelectedTimeOut = null;
			if(action == null){ //if it is from handleOnClick slide, call from on slide click will pass in null as action
				//window.pe.scene.hideErrorMessage(); //need to cancel the preparing slide message too., but we don't want to cancel the preparing slide message when it is page down and its kind
				this.hidePreparingSlideMsg();
			}
		}

		if (this.loadSlideTimeout != null) {
			if (((action == this.PAGE_DOWN
					|| action == this.DOWN_ARROW || action == this.RIGHT_ARROW) && window.pe.scene.slideSorter.selectedSlide != window.pe.scene.slideSorter.slides[window.pe.scene.slideSorter.slides.length - 1])
					|| ((action == this.PAGE_UP
							|| action == this.UP_ARROW || action == this.LEFT_ARROW) && window.pe.scene.slideSorter.selectedSlide != window.pe.scene.slideSorter.slides[0])) {
			
				clearTimeout(this.loadSlideTimeout);
				this.loadSlideTimeout = null;
				//window.pe.scene.hideErrorMessage();
				this.hidePreparingSlideMsg();
				//console.log("onPageDown-clearTimeOutLoadSlide");
			}
		}
	},
	handleSelfFocusRemoved:function(){
		var isWidgitized = dojo.attr(this.mainNode, "isWidgitized");
		if(isWidgitized == true){
			//deselect all the boxes and kick out edit mode
			this.deSelectAll();
			this.mainNode.parentNode.blur();
		}
	},
    correctIeNumberingList:function(){
        if (dojo.isIE) {
            setTimeout(dojo.hitch(this, function(){
                dojo.query('li,p', this.mainNode).forEach(function(item, index, array) {
                    var bIsEmptyP = PresCKUtil.isEmptyParagraph(item);
                    var firstChild = item.firstChild;
                    if (!bIsEmptyP || PresCKUtil.checkNodeName(firstChild, 'ol')) {
                        // todo(bjcheny): do nothing when
                        // - ol as fisrt child of li
                        // - or it's not empty paragraph
                    } else if (PresCKUtil.checkNodeName(firstChild,'span')) {
                        var textContent = TEXTMSG.getTextContent(firstChild);
                        if (textContent.length == 0 || (textContent.length == 1 && textContent.charCodeAt(0) == 8203)) {
                            firstChild.innerHTML = '&nbsp;';
                        }
                       //D29655: [IE9][Regression]The position of list in shape is incorrect after imported and click the shape in docs,the list position changes.
                    } else if (PresCKUtil.checkNodeName(firstChild,'p') && bIsEmptyP && firstChild && firstChild.nodeType != CKEDITOR.NODE_TEXT) {
                        var spanelement = document.createElement('span');
                        spanelement.innerHTML = '&nbsp;';
                        if(!item.is)
                            item = new CKEDITOR.dom.element(item);
                        item.append( new CKEDITOR.dom.element(spanelement) );
                    }
                });

                // D14108 The numbering lists turns to 0 when toggle between one list edit box to another list edit box
                //- need to switch display none to block for OLs in IE to show up correctly again
                dojo.query('ol', this.mainNode).forEach(function(item, index, array) {
                    dojo.style( item, 'display', "none" );
                    dojo.style( item, 'display', "block" );
                });
            }), 1);
        } 
    },
	
	// handle co-edit add slide comment event - comment created via mobile
    mHandleCoeditAddSlideCommentIcon: function(slideId){
        if (this.mainNode.id == slideId)
        	this.initSlideCommentIcon();
    },
    
    // handle co-edit del slide comment event - comment created via mobile
    mHandleCoeditDelSlideCommentIcon: function(slideId){
    	if (this.mainNode.id == slideId)
            this.deleteSlideCommentIcon();     
    },
    
    // TODO: show annotation (drawing comment) - comment created via mobile
	mShowAnnotation: function(imageUrl) {
		// load the image of passed in url and overlay it on top of the slide editor
	},
	
	slideCommentsId: null,
    slideCommentIcon: null,
    slideCommentIconConnect: null,

	hasSlideComment: function() {
		if(dojo.attr(this.mainNode, 'comments') == 'true')
			return true;
		return false;
	},

	getSlideCommentIcon: function() {
		var ic = dojo.query(".slidecomment",this.mainNode)[0];
		return ic;
	},
	
	initSlideCommentIcon: function() {
		if(this.hasSlideComment()) {
			this.addSlideCommentIcon();
			
			var commentsId = dojo.attr(this.mainNode, 'commentsId');
			if (commentsId)
				this.slideCommentsId = dojo.trim(commentsId);
			else
				return;
			var commentsArray = commentsId.split(' ');
			
			dojo.forEach(commentsArray,function(el){
				// do nothing for now
			});
		} else {
			this.deleteSlideCommentIcon();
		}
	},

	addSlideCommentIcon: function() {
		var ic = this.getSlideCommentIcon();
		if (!ic) {
			ic = this.slideCommentIcon = document.createElement('img');
			dojo.addClass(ic,'slidecomment');
			ic.src = window.contextPath + window.staticRootPath + '/styles/css/images/comment16.png';
			var STRINGS = dojo.i18n.getLocalization("concord.widgets","contentBox");
			dojo.attr(ic,'title',STRINGS.tooltip_comment); //Defect 37321
			this.mainNode.appendChild(ic);		
		}
		
		var sizeFactor = 50;
		var maxSize = 16;	
		var winSize = parseFloat(this.slideEditorWidth);
		if(winSize < parseFloat(this.slideEditorHeight))
			winSize = parseFloat(this.slideEditorHeight);
					
		var commentIconSize = winSize/sizeFactor;
	    if (commentIconSize > maxSize)
	    	commentIconSize = maxSize;
	    
	    this.currentCommentIconSize = commentIconSize;
	    
		dojo.style(ic,{
			'position':'absolute',
			'right': '0',
			'margin': '-21px auto',
			'width':commentIconSize + "px",
			'height':commentIconSize + "px",
			'border':'none',
			'cursor':'pointer'
		});		
		
		this.slideCommentIconConnect = dojo.connect(ic,'onclick', dojo.hitch(this,this.viewSlideComment));
	},
	
	deleteSlideCommentIcon: function() {
		var ic = this.getSlideCommentIcon();
		if (ic)
			dojo.destroy(ic);
	
		dojo.disconnect(this.slideCommentIconConnect);
		
		// After deleting the icon, we're setting the widget property commentsID to null
		this.slideCommentsId = null;
		this.slideCommentIcon = null;
		this.slideCommentIconConnect = null;
	},
    
	// expand comment in the comment pane
	expandSlideComment:function(commentId){
		if (commentId) {
	 		var eventData = [{'eventName': concord.util.events.commenttingEvents_eventName_expandComments,'commentsId':commentId,'noFocus':false}];
	 		concord.util.events.publish(concord.util.events.commenttingEvents, eventData);
		}
	},
	
	// 15079 show slide level comments on desktop
	slideCommentConnectArray: [],
	
	// enter comment view mode
	viewSlideComment: function(commentId, expand) {
		var slideComments = window.pe.scene.slideComments;
		if (!slideComments || (slideComments && slideComments.isInitialized() == false)) {
			var commentPane = window.pe.scene.sidebar.getCommentPane();
			var commentStore = commentPane.store;
			if (commentStore)
				slideComments = window.pe.scene.slideComments = new concord.widgets.mSlideComments(commentStore, window.pe.scene.slideSorter, window.pe.scene.slideEditor, dojo.byId('slideEditorContainer'));
		}
		
		this.createSlideCommentActions();
		this.hitchSlideCommentActions();
		
		// nullify if commentId is an event
		if (commentId && commentId.type) {
			commentId = null;
			expand = null;
		}
		
		if (slideComments && slideComments.isInitialized())
			slideComments.view(commentId, expand);
	},

	// exit comment mode
	exitSlideComment: function() {
		var slideComments = window.pe.scene.slideComments;
		if (slideComments) {
			slideComments.exit();
			slideComments = window.pe.scene.slideComments = null;
		}
       
		this.destroySlideCommentActions();
		
		// recreate slide comment icon
		this.initSlideCommentIcon();
	},

	// create actions for slide level comments
	createSlideCommentActions: function() {
		this.destroySlideCommentActions();
		
		var scActions = document.createElement("div");
		scActions.setAttribute("id", "concord_sc_link");
		dojo.style(scActions, 'float', 'right');	
		var sc1Anchor = document.createElement("a");
		sc1Anchor.setAttribute("id", "concord_sc_exit_a");		
		dojo.addClass(sc1Anchor, "lotusMyLink");
		var sc1 = document.createElement("span");
		sc1.setAttribute("id", "concord_sc_exit");
		dojo.addClass(sc1, 'dijit dijitReset dijitInline dijitButton');
		dojo.style(sc1,{
			'position':'absolute',
			'left': '0',
			'margin': '-21px 0px auto',
			'cursor':'pointer',
			"fontSize": "0.75em"
		});
		var sc11 = document.createElement("span");
		dojo.addClass(sc11, 'dijitReset dijitInline dijitButtonNode');
		sc11.innerHTML = this.STRINGS.slideCommentClose;
		sc1.appendChild(sc11);
		sc1Anchor.appendChild(sc1);
		sc1Anchor.setAttribute("href", "#");
		scActions.appendChild(sc1Anchor);

		this.mainNode.appendChild(scActions);
	},
	
	// assign function to slide level comments actions
	hitchSlideCommentActions: function() {
		var slideComments = window.pe.scene.slideComments;

		if (!slideComments) return;
				
		for(var i=0; i<this.slideCommentConnectArray.length; i++){
            dojo.disconnect(this.slideCommentConnectArray[i]);       
		}
        
        this.slideCommentConnectArray = [];

		// set action for exit (done) icon
        this.slideCommentConnectArray.push(dojo.connect(dojo.byId("concord_sc_exit_a"), "onclick", dojo.hitch(
			this, this.exitSlideComment)));
	},
	
	// destroy slide level comments actions
	destroySlideCommentActions: function() {
		var scAction = dojo.byId('concord_sc_link');
		if (scAction) dojo.destroy(scAction);
		scAction = null;
		
        for(var i=0; i<this.slideCommentConnectArray.length; i++){
            dojo.disconnect(this.slideCommentConnectArray[i]);       
        }
        this.slideCommentConnectArray = [];
	},
	
	// remove passed-in commentId from slide DOM's commentsId attribute
	removeSlideCommentFromSlideDom: function(slideId, commentId, synchOffline) {
		return;
		// get the slide from sorter
		var msgPairList = [];
		var slideElem = window.pe.scene.slideSorter.getSlideById(slideId);
		if (slideElem) {
			// remove comment from slide's commentsId attribute
			var domCommentsId = [];
			var oldDomCommentsId = slideElem.getAttribute('commentsId');
			if (oldDomCommentsId) {
				oldDomCommentsId = dojo.trim(oldDomCommentsId);
				if (oldDomCommentsId.length > 0 && oldDomCommentsId != '' && oldDomCommentsId != 'false')
					domCommentsId = oldDomCommentsId.split(',');
			}

			var deleteIndex = -1;
			for (var i=0; i<domCommentsId.length; i++) {
				if (domCommentsId[i] == commentId) {
					deleteIndex = i;
					break;
				}
			}
			if (deleteIndex > -1)
				domCommentsId.splice(deleteIndex, 1);
			var newDomCommentsId = null;
			if (domCommentsId.length == 0)
				newDomCommentsId = 'false';
			else
				newDomCommentsId = domCommentsId.toString();
			
			// update slide
			// no need to update online content and other sesions when offline
			if (!concord.util.browser.isMobile() || (window.pe.scene.isOffline != null && !window.pe.scene.isOffline())) {
				if (synchOffline != null && synchOffline == true)
					msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slideElem), 'commentsId', newDomCommentsId, msgPairList, 'forceUpdate');	// force update since the 'local' DOM was updated when we previously delete comment offline
				else
					msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slideElem), 'commentsId', newDomCommentsId, msgPairList);									
			}
			// update slide sorter doc
			slideElem.setAttribute('commentsId', newDomCommentsId);
			// update slide editor as well
			this.mainNode.setAttribute('commentsId', newDomCommentsId);
			// set comments to false if no comment
			if (domCommentsId.length == 0) {
				// no need to update online content and other sesions when offline
				if (!concord.util.browser.isMobile() || (window.pe.scene.isOffline != null && !window.pe.scene.isOffline())) {
					if (synchOffline != null && synchOffline == true)
						msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slideElem), 'comments', 'false', msgPairList, 'forceUpdate'); // force update since the 'local' DOM was updated when we previously delete comment offline
					else
						msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(slideElem), 'comments', 'false', msgPairList);									
				}
				// update slide sorter doc
				slideElem.setAttribute('comments', 'false');	
				// update slide editor as well
				this.mainNode.setAttribute('comments', 'false');
			}
			
			// no need to update online content and other sesions when offline
			if (!concord.util.browser.isMobile() || (window.pe.scene.isOffline != null && !window.pe.scene.isOffline())) {
				SYNCMSG.sendMessage(msgPairList, SYNCMSG.NO_LOCAL_SYNC);
				// tells other clients to remove slide comment icon if no comment
				if (domCommentsId.length == 0) {
					this.handleDelSlideCommentCoedit(slideId);
				}
			}
		}
	},
	
	// handle deletion of slide comment for this session
	handleDelSlideComment: function(commentId) {
		var slideId = this.mainNode.id;
		this.removeSlideCommentFromSlideDom(slideId, commentId);	
		this.exitSlideComment();
	},
	
	createScreenReaderNode: function(user, userName){
		var screenReaderNode = pe.scene.CKEditor.document.$.getElementById('coid_'+user);
		if(!screenReaderNode)
		{
			screenReaderNode = pe.scene.CKEditor.document.$.createElement('span');
			screenReaderNode.id = 'coid_'+user;
			screenReaderNode.setAttribute('style', 'font-size:0pt;');
			// #32944 Set the font size to 0
			screenReaderNode.setAttribute(PresConstants.ABS_STYLES.FONTSIZE, "0");
			var parent = pe.scene.CKEditor.document.getDocumentElement();
			parent.$.appendChild(screenReaderNode);
		}
		screenReaderNode.innerHTML = 'Edit by ' + userName;	
	},
	
	// handle deletion of slide comments on coedit sessions
	handleDelSlideCommentCoedit: function(slideId) {
		createDelSlideCommentMsg = function(elemId){		
			var msgPair = SYNCMSG.createMessage(MSGUTIL.msgType.delSlideComment,[]);
			msgPair.msg.elemId = elemId;	
			return msgPair;		                                    
		};

		var delCommentMsg = createDelSlideCommentMsg(slideId);
		var anotherMsgList  = [];
		anotherMsgList.push(delCommentMsg);	
		var addToUndo = false;
		anotherMsgList[0] = SYNCMSG.addUndoFlag(anotherMsgList[0],addToUndo); 
		SYNCMSG.sendMessage(anotherMsgList, SYNCMSG.NO_LOCAL_SYNC);
	},
	
	//13550 - use single ck for shapes
	//creating spare shape content box and activate ckeditor
	createSpareGrpContentBox: function(){ 
		var isSpare = true;
		var retVal =false; //13550 - adding a return value so we know whether or not put the next createSpareTableBox in setTimeout or not.
		if(this.groupSpareBox==null && !this.loadingNewSlide){
			//var pos ={'left':-9999,'top':10,'width':345,'height':55}; //in px
			var pos ={'left':-9999,'top':-9999,'width':55,'height':55}; //in px
			this.createSvgShape(pos, isSpare);
			if(this.groupSpareBox!=null){
				var drawFrame = this.groupSpareBox.mainNode;
				drawFrame.id = "drawFrame_id_groupSpareBox";
				this.groupSpareBox.contentBoxDataNode.id = "contentBox_id_groupSpareBox_contentBoxDataNode";
				dijit.setWaiState(drawFrame,'hidden','true');
				dojo.addClass(this.groupSpareBox.mainNode, "isSpare");
				this.groupSpareBox.isSpare = true;
				var g_textBox = this.groupSpareBox.txtContent;         
	            if(g_textBox !=null){
					dojo.addClass(g_textBox.mainNode, "isSpare");
	            	g_textBox.opts.isSpare = true;
	            	g_textBox.isSpare = true;
	            	g_textBox.makeEditable();
	            	this.groupSpareBox.toggleEditMode(true);
	            	if(g_textBox.editor!=null){
	    				this.groupSpareBox.editor = g_textBox.editor;
	            		this.groupSpareBox.editorName = g_textBox.editor.name;
	            	}
	            	retVal = true;
				}
			} 
		}
		return retVal;
	},
		    
	    //get all the group content boxes from the slide
	    getGrpContentBoxArray:function(){
	    	var grpContentBoxArray = [];
            if(this.CONTENT_BOX_ARRAY!=null){
	            for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){            
	                    if(this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE){
	                        grpContentBoxArray.push(this.CONTENT_BOX_ARRAY[i]);
	                    }
	                
	            }
            }
            return grpContentBoxArray;
	    },
	  //get all the table content boxes from the slide
	    getTableContentBoxArray:function(){
	    	var tableContentBoxArray = [];
            if(this.CONTENT_BOX_ARRAY!=null){
	            for (var i=0; i<this.CONTENT_BOX_ARRAY.length; i++){            
	                    if(this.CONTENT_BOX_ARRAY[i].contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE){
	                    	tableContentBoxArray.push(this.CONTENT_BOX_ARRAY[i]);
	                    }
	                
	            }
            }
            return tableContentBoxArray;
	    },
	    
	    createSpareTableContentBox: function (){
	    	var isSpare = true;
	    	if(this.tableSpareBox==null && !this.loadingNewSlide){
				this.createTable(isSpare);
				//at this point this.tableSpareBox should have been instantiated by the widgitize of table creation
				if(this.tableSpareBox!=null){
					var drawFrame = this.tableSpareBox.mainNode;
					drawFrame.id = "body_id_tableSpareBox";
					this.tableSpareBox.contentBoxDataNode.id = "body_id_tableSpareBox_contentBoxDataNode";
					dijit.setWaiState(drawFrame,'hidden','true');
					dojo.addClass(this.tableSpareBox.mainNode, "isSpare");
					this.tableSpareBox.isSpare = true;
					this.tableSpareBox.makeEditable();
					if(this.tableSpareBox.editor!=null){
	            		this.tableSpareBox.editorName = this.tableSpareBox.editor.name;
	            	} 
				}  
			}
	    },
	    destroyAllSpareBox: function(){
	    	this.destroySpareBox();
	    	this.destroyGroupSpareBox();
	    	this.destroyTableSpareBox();
	    },
	    unloadAllOtherSpareBox:function(spareBox){
	    	if(spareBox!=this.spareBox && this.SINGLE_CK_MODE==true && this.spareBox!=null && this.spareBox.boxRep){
	    			this.spareBox.boxRep.unLoadSpare();
	    	}
	    	if(spareBox!=this.groupSpareBox && this.GROUP_SINGLE_CK_MODE==true && this.groupSpareBox!=null && this.groupSpareBox.boxRep){
	    			this.groupSpareBox.boxRep.unLoadSpare();
	    	}
	    	if(spareBox!=this.tableSpareBox && this.tableSpareBox && this.tableSpareBox.boxRep){
	    			this.tableSpareBox.boxRep.unLoadSpare();
	    	}
	    }
});
