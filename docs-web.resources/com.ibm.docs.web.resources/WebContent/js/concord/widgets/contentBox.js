/**
 * Licensed Materials - Property of IBM.
 * @contentBox.js IBM Lotus Project Concord component
 * Copyright IBM Corporation 2010. All Rights Reserved.
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

/**
 * contentBox.js defines the basic properties of a contentBox Object (Fragment) that lives in the Slide Editor. Properties such as
 * Moveable, Resizeable and common context menus are defined here.
 */

dojo.provide("concord.widgets.contentBox");
dojo.require("dojo.dnd.move");
dojo.require("dijit._Widget");
dojo.require("dijit.Menu");
dojo.require("dojox.layout.ResizeHandle");
dojo.require("concord.util.touchEvents");
dojo.require("dojo.i18n");
dojo.require("dojo.string");
dojo.require("concord.spellcheck.scaytservice");
dojo.require("concord.widgets.presContentBoxPropDlg");
dojo.require("concord.util.browser");
dojo.require("concord.pres.PresTxtboxUtil");
dojo.require("concord.pres.PresGrpUtil");
dojo.require("concord.util.BidiUtils");

dojo.requireLocalization("concord.widgets","contentBox");
dojo.requireLocalization("concord.util","a11y");
dojo.requireLocalization("concord.widgets","presPropertyDlg");

dojo.declare("concord.widgets.contentBox", dijit._Widget, {
	
	constructor: function(opts) {
		//console.log("contentBox:constructor","Entry");
		if (opts){
			if (opts.parentContainerNode)
				this.parentContainerNode = opts.parentContainerNode;
			else {
				throw new Error("Options argument need to specify parentContainerNode in contentBox constructor. This is usually a div node that will contain this contentBox. For example the Slide Editor main div.");
				return;
			}
			// if opts.mainNode is null force the newBox flag to be true
			if (opts.mainNode){
				this.mainNode 			= opts.mainNode;
			} else {
				this.mainNode = null;
				opts.newBox = true;
			}
		
			this.opts						= opts;
			this.isResizeable     			= (opts.isResizeable != null) ? opts.isResizeable : true;
			this.isMoveable       			= (opts.isMoveable != null)? opts.isMoveable  : true;
			this.isEditable       			= (opts.isEditable != null)? opts.isEditable : true;
			this.contentBoxDataNode			= (opts.contentBoxDataNode) ? opts.contentBoxDataNode : null;
			this.contentBoxType   			= (opts.contentBoxType) ? opts.contentBoxType : PresConstants.CONTENTBOX_TEXT_TYPE;
			this.CKEDITOR			    	= (opts.CKEDITOR) ? opts.CKEDITOR : null;
			this.editor						= (opts.editor) ? opts.editor : null;
			this.dojo				   		= (opts.dojo) ? opts.dojo : window.dojo;
			this.CONTENTS_ARRAY		   		= (opts.CONTENTS_ARRAY) ? opts.CONTENTS_ARRAY : [];
			this.boxUID				   		= (new Date().getTime()) + Math.floor(Math.random()*10000).toString();
			this.boxID						= PresConstants.BOX_CLASS+"_"+this.boxUID;
			this.deSelectAll 		   		= opts.deSelectAll;
			this.deSelectAllButMe 	   		= opts.deSelectAllButMe;
			this.initialPositionSize   		= (opts.initialPositionSize) ? opts.initialPositionSize : this.defaultPosition;
			this.newBox 			   		= (opts.newBox) ? opts.newBox : false;
			this.copyBox			   		= (opts.copyBox) ? opts.copyBox: false;
			this.setzIndexCtr		 		= (opts.setzIndexCtr)? opts.setzIndexCtr : this.setzIndexCtr;
			this.getzIndexCtr		 		= (opts.getzIndexCtr)? opts.getzIndexCtr : this.getzIndexCtr;
			this.getzIndexCtr		 		= (opts.getzIndexCtr)? opts.getzIndexCtr : this.getzIndexCtr;
			this.toggleBringToFront		 	= (opts.toggleBringToFront)? opts.toggleBringToFront : this.toggleBringToFront;
			this.toggleSendToBack		 	= (opts.toggleSendToBack)? opts.toggleSendToBack : this.toggleSendToBack;
			this.isMultipleBoxSelected 		= (opts.isMultipleBoxSelected)? opts.isMultipleBoxSelected : this.isMultipleBoxSelected;
			this.publishSlideChanged 		= (opts.publishSlideChanged)? opts.publishSlideChanged : this.publishSlideChanged;
			this.deleteSelectedContentBoxes = (opts.deleteSelectedContentBoxes)? opts.deleteSelectedContentBoxes : this.deleteSelectedContentBoxes;
			this.pasteSelectedContentBoxes  = (opts.pasteSelectedContentBoxes)? opts.pasteSelectedContentBoxes : this.pasteSelectedContentBoxes;
			this.copySelectedContentBoxes   = (opts.copySelectedContentBoxes)? opts.copySelectedContentBoxes : this.copySelectedContentBoxes;
			this.createIndicatorSytle		= (opts.createIndicatorSytle)? opts.createIndicatorSytle: this.createIndicatorSytle;
			this.handleMultiBoxSelected 	= (opts.handleMultiBoxSelected)? opts.handleMultiBoxSelected : this.handleMultiBoxSelected;
			this.getMasterTemplateInfo		= (opts.getMasterTemplateInfo) ?  opts.getMasterTemplateInfo  : this.getMasterTemplateInfo;
			this.checkBoxPosition			= (opts.checkBoxPosition) ? opts.checkBoxPosition : this.checkBoxPosition;
			this.addImageContentBox         = (opts.addImageContentBox) ? opts.addImageContentBox : this.addImageContentBox;
			this.getInLineStyles			= (opts.getInLineStyles) ? opts.getInLineStyles : this.getInLineStyles;
			this.openAddNewImageDialog 		= (opts.openAddNewImageDialog) ? opts.openAddNewImageDialog : this.openAddNewImageDialog;
			this.deRegisterContentBox   	= (opts.deRegisterContentBox) ? opts.deRegisterContentBox : this.deRegisterContentBox;
			this.getActiveDesignTemplate	= (opts.getActiveDesignTemplate)? opts.getActiveDesignTemplate: this.getActiveDesignTemplate;
			this.CKToolbarSharedSpace   	= (opts.CKToolbarSharedSpace) ? opts.CKToolbarSharedSpace : this.CKToolbarSharedSpace;
			this.createFromLayout			= (opts.createFromLayout)	? opts.createFromLayout : false;
			this.layoutInfo					= (opts.layoutInfo) ? opts.layoutInfo : null;
			this.beforeMoveStyle 			= null;
			this.initialEditServerSeq		= null;
		}else {
			throw new Error("Options need to be specifed in contentBox constructor.");
			return;
		}
		this.STRINGS = dojo.i18n.getLocalization("concord.widgets","contentBox");
		//console.log("contentBox:constructor","Exit");
		this.isBidi = BidiUtils.isBidiOn();
		this.resizeForbidden = false;
	},
	
	statics:{index:0},
	
	//Variables
	parentContainerNode			: null,
	mainNode					: null,
	isResizeable 				: true,
	isMoveable 					: true,
	isEditable					: true,
	contentBoxDataNode			: null,
	contentBoxType				: 'contentBoxTxt',   //ContentBox type is 'txt' or 'img' for now. Default is txt
	CKEDITOR    				: null,
	editor						: null,
	CONTENTS_ARRAY				: null,
	contentBoxPropertyObj		: null,
	newBox						: false,   //New means user is creating new content box or updating placeholder.  False means that this.mainNode points to an existing div with content data already inside
	editModeOn					: false,
	boxSelected					: false,   //Indicates when user clicks on the box
	lockSelected				: false,   //Indicates a locked box is selected
	defaultPosition				:{'left':'10','top':'10','width':'38','height':'15'}, // Default position when object in created
	boxUID						: null,
	initialPositionSize			: null,
	editTD						: null,
	opts						: null,
	copyBox						: false,
	nodeMoveable				: null,
	CKToolbarSharedSpace		: null,
	tempLayer					: null,
	hasBorder					: false,
	borderProperty				: {'borderTopStyle':'solid',
								   'borderRightStyle':'solid',
								   'borderBottomStyle':'solid',
								   'borderLeftStyle':'solid',
								   'borderTopWidth':'2px',
								   'borderRightWidth':'2px',
								   'borderBottomWidth':'2px',
								   'borderLeftWidth':'2px',
								   'borderTopColor':'#E8E8E8',
								   'borderRightColor':'#E8E8E8',
								   'borderBottomColor':'#E8E8E8',
								   'borderLeftColor':'#E8E8E8'},
	beforeDataEdit				: null,
	afterDataEdit				: null,
	userResized					: false, //This is set to true the minute the user resizes the box. when mouse up, will set to false again.
	isEmptyCBPlaceholder		: false,
	isDirty						: false,
	commentsId                  : null,
	CONTENT_BOX_BORDER_WIDTH	: 8,
	moverHandle					: null, // mover handle this is null when user is not moving object. It is not null while moving object
	IS_RESIZING					: false,
	STRINGS				 		: null,
	currentResizeHandle			: null,
	nbspHandler 				: null,
	MOUSEDOWN					:null,
	onClickTimeStamp			:0,
	initialEditServerSeq		: null,
	synchAllTodoCtr				: null,
	boxReady					: null,
	defaultTextDFC 				: null,
	boxRep						: null, //If this is set then this contentBox is a spare that has a boxRep (boxRepresenting)
	MAX_TOOLTIP_LENGTH          : 100,
	creatingNewContentBox		: false, //D17605 This box needs to know when a box is being created on top of it to ctrl mouse events
	creatingNewContentBoxDrag   : false,
	isContentBoxMouseDown   	: false,
	ONCLICKEVENT				: 'onclick',
	isWidgitized				: false, // for object widgitize, only available for moible now.
	// This functions initializes the contentBox widget. It does the following:
	// 1. Instantiates main contentBox node
	// 2. Adds it to parent container if not already there.
	// 3. Sets the data inside the contentBox node
	// 4. Adds the needed properties to the widget (resizeable, editable etc....)
	init : function(){
		//console.log("contentBox:init","Entry");
		//Instantiate main contentBox node and add to parent container if it is not already in container.
		this.isWidgitized = true;
		this.boxReady =false;
		if (!this.mainNode) {
			this.mainNode =document.createElement('div');
			this.newBox=true;
			this.parentContainerNode.appendChild(this.mainNode);
		}
		var copyBox = (this.opts.copyBox!=null && this.opts.copyBox!=undefined && this.opts.copyBox==true) ? true: false; 
		
		
		var reInsertMainNode = (!copyBox)? concord.util.HtmlContent.temporarilyDetachElement(this.mainNode):null;
		
		if ((this.mainNode.id==null) || ((this.mainNode.id!=null) &&(this.mainNode.id.length==0))){
			this.setNodeId(this.mainNode,PresConstants.CONTENTBOX_PREFIX);
		}
		
		dojo.attr(this.mainNode,PresConstants.BOX_ID_ATTRIBUTE_NAME,this.boxID); // main node boxId attr is same as this widget's boxId property
		dojo.addClass(this.mainNode,PresConstants.BOX_CLASS);

		this.initializeBoxContainerNode();
		this.initializeDataContentNode();
		
		//Let's apply the properties to this contentBox
		if (this.isResizeable) this.makeResizeable();
				
		//Let's attach events to this box
		this.attachEventToContentBox();
		
		var resizeContent = false;
		this.updateHandlePositions(resizeContent);
		
		// this.refreshPositionFromSorter();
		// this.adjustPositionForBorder();
		 if (!dojo.hasClass(this.mainNode, 'g_draw_frame') /*&& dojo.attr(this.mainNode, "presentation_class") != "notes"*/) {	// No context menu for grouped box or speaker notes
			 this.addContextMenu();
		 }
		 if (reInsertMainNode!=null)
			 reInsertMainNode();

		 //D28032: [Regression]Table display incorrect in edit mode, only one row can be display
		 if(this.newBox || dojo.hasClass(this.mainNode,'newbox')){
			 /* D24658: Text box is height change to very large when click the textbox
			  * move to slideEditor widgitizeContent
			  */
			 //Let's check for early spills if data is text data is assigned an unreasonable height
			 //No need to do this for grouped box
			 if ((!dojo.hasClass(this.mainNode, 'g_draw_frame')) && ((this.contentBoxType==PresConstants.CONTENTBOX_TEXT_TYPE)||(this.contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE)||(this.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE)) && (!this.opts.copyBox) && dojo.style(this.parentContainerNode,'display')!='none'){
				 if (!this.checkResizeHeightLimits() || (this.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE && this.mainNode.style.height == "5%")){
					 this.updateMainNodeHeightBasedOnDataContent();
				 }
			 }
			 if (!dojo.hasClass(this.mainNode, 'g_draw_frame')) {	// No need to adjust for grouped box
				 if (dojo.isIE) this.adjustContentDataSize();
			 }
		 }
		 

		 if (!dojo.hasClass(this.mainNode, 'g_draw_frame') &&
				 ( !dojo.style(this.mainNode,'zIndex') || !this.mainNode.style.zIndex || dojo.style(this.mainNode,'zIndex') == 'auto' ) ) {
				var tmpZ = window.pe.scene.slideEditor.maxZindex;
				if (tmpZ <= 0) tmpZ = 500;	// start from 500 so we have enough room to handle multiple sendtoback
				tmpZ = parseInt(tmpZ)+5;
				window.pe.scene.slideEditor.maxZindex = tmpZ;
				dojo.style(this.mainNode,{
						'zIndex':tmpZ
				});
				
				// Set the zIndex counter and publish to the slide sorter.  This is necessary for
				// any new slide generated as the initial title and outline content boxes do not
				// have z-order specified in the slide sorter
				this.setzIndexCtr(tmpZ);
				var aNewBox = (this.newBox || dojo.hasClass(this.mainNode,'newbox'));
				if (!aNewBox){	// don't publish if newbox	or if creatingFromLayout
					var addToUndo = false;
					var adjustBorder = false;
					//D28782: There is a  message said that  "There are edits to this draft that have not been published as a version." even there is not change for the file.
					this.publishBoxAttrChanged(null, null, false,addToUndo,adjustBorder);
				}
				this.keyStrokeChecker = null;
				this.lastKeyStroke = null;
				//console.log("(init) setting zIndex to: " + (parseInt(tmpZ)+5));
		 }
		 this.makeNonContentEditable();
		if(dojo.isIE){
			this.setBgImgTransparent();
		}
		
		//Add level info for this textbox
		var lines = dojo.query('p,li',this.mainNode);
		var textboxInfo = PresCKUtil.getCurrentTextboxInfo(this.mainNode,true);
		for(var i=0;i<lines.length;i++)
		{
			var line = PresCKUtil.ChangeToCKNode(lines[i]);
			if(!dojo.attr(line.$, "level"))
				dojo.attr(line.$, "level", "1");//Default level 1
			if(textboxInfo && !textboxInfo.isPlaceholder)
			{
				//for not placeholder lines, we should force add abs value
				var customValue = PresCKUtil.getCustomStyle(line,PresConstants.ABS_STYLES.MARGINLEFT);
				if(!customValue)
				{
					var absMarginLeft = PresCKUtil.getAbsoluteValue(line,PresConstants.ABS_STYLES.MARGINLEFT);
					PresCKUtil.setCustomStyle(line,PresConstants.ABS_STYLES.MARGINLEFT,absMarginLeft);
				}
			}
		}
		
		//console.log("contentBox:init","Exit");
		this.boxReady= true;
		this.initializeCommentsNode();
		
		// set aria information
		this.setAriaLabels(this.mainNode);
		
	},
	
	attachEventToContentBox: function()
	{
		var cArray = this.connectArray = [];
		if (dojo.attr(this.mainNode, "presentation_class") == "notes") {
			if (!dojo.hasClass(this.mainNode, 'g_draw_frame')) {
				cArray.push(dojo.connect(this.mainNode,'onmousedown', dojo.hitch(this,this.handleContentOnMouseDown)));
				cArray.push(dojo.connect(this.mainNode,'onclick', dojo.hitch(this,this.handleSpeakerNotesOnClick)));
			}
		} else {
			if (!dojo.hasClass(this.mainNode, 'g_draw_frame')) { // no onclick for grouped box
				cArray.push(dojo.connect(this.mainNode,'onmousedown', dojo.hitch(this,this.handleContentOnMouseDown)));				
			}
			cArray.push(dojo.connect(this.mainNode,'onclick', dojo.hitch(this,this.handleContentOnClick)));
		}
		//D7356 - use handlecontentmouseover
		cArray.push(dojo.connect(this.mainNode,'onmouseover', dojo.hitch(this,this.handleContentOnMouseOver)));
		cArray.push(dojo.connect(this.mainNode,'onmousemove', dojo.hitch(this,this.handleContentOnMouseMove)));
	},

	checkLastKeyStroke: function() {
//		TODO: Revisit this feature for SINGLE CK MODE
//		if (this.lastKeyStroke == null) {
//			this.makeNonEditable();
//			this.deSelectThisBox();
//		} else {
//			this.lastKeyStroke = null;
//			this.keyStrokeChecker = setTimeout(dojo.hitch(this, "checkLastKeyStroke"), PresConstants.CONTENTBOX_EDIT_TIMEOUT);
//		}
	},
	
	/**
	 * If this box contains text node
	 */
	_isTextContentBox:function()
	{
		switch( this.contentBoxType )
		{
		case PresConstants.CONTENTBOX_TEXT_TYPE:
		case PresConstants.CONTENTBOX_NOTES_TYPE:
		case PresConstants.CONTENTBOX_TABLE_TYPE:
			return true;
		default:
			return false;
		}
		return false;
	},

	getNbspHandler:function(){
		if(this.nbspHandler == null)
			this.nbspHandler = new concord.pres.NbspHandler(this);
		return this.nbspHandler;
	},
    getBorderAdjustment: function( onExit ) {
        return (onExit)? this.CONTENT_BOX_BORDER_WIDTH : -(this.CONTENT_BOX_BORDER_WIDTH);
      },
	
	
	//
	// This function will refresh the position of the contentBox based of the real position from the slide sorter
	// initially implemented for D7718
	//
	refreshPositionFromSorter: function(){
		var doc = PROCMSG._getSorterDocument();
		if (doc!=null){
			var sorterBody = doc.body; 
			var sorterNode = dojo.query("#"+this.mainNode.id,sorterBody);
			if (sorterNode!=null && sorterNode.length>0){
				this.mainNode.style.top = sorterNode[0].style.top;
				this.mainNode.style.left= sorterNode[0].style.left;
			}
		}
	},
	
	//
	// The content has been pushed down and to the right due to border when selected and due to padding when not selected
	// We need to account for real position. We need to take away border/padding size from top and left positions on entry
	// and add back on exit.
	//
	adjustPositionForBorder: function(aNode,onExit,topLeft){		
		var nodeToAdjust = (aNode) ? aNode : this.mainNode;
			node = (onExit)? dojo.clone(nodeToAdjust) : nodeToAdjust;
		if (dojo.attr(this.mainNode, "presentation_class") == "notes" ||
			// docs created connector shape does not have border(selected)
			// or padding(deselected). So no need adjust border(8px)
			PresCKUtil.isConnectorShape(this.mainNode)) {
			return node;
		}
		var adjustValue = this.getBorderAdjustment(onExit);
		//30943: [Regression][SampleSpecial]Table at the edge of slide border, then position changed after import pptx sample file .node.style.left will return "" if it's value like 1.09361e-005%
		var curPositionTopPx = this.PercentToPx(node.style.top || 0, 'height');
		var curPositionLeftPx = this.PercentToPx(node.style.left || 0, 'width');
		var curPositionTopPct = this.PxToPercent(curPositionTopPx+adjustValue, 'height');
		var curPositionLeftPct = this.PxToPercent(curPositionLeftPx+adjustValue, 'width');
		if ((topLeft==null) && (curPositionTopPct != Infinity) && (curPositionTopPct != -Infinity)  && (curPositionLeftPct != Infinity) && (curPositionLeftPct != -Infinity)) {
			dojo.style(node,{
				'top':curPositionTopPct+"%",
				'left':curPositionLeftPct+"%"
			});
		} else if ((topLeft=='top') && (curPositionTopPct != Infinity) && (curPositionTopPct != -Infinity)){
			dojo.style(node,{
				'top':curPositionTopPct+"%"
			});
		} else if ((topLeft=='left') && (curPositionLeftPct != Infinity) && (curPositionLeftPct != -Infinity)){
			dojo.style(node,{
				'left':curPositionLeftPct+"%"
			});
		}
		nodeToAdjust = null;
		return node;
	},

	//
	// Updates height of mainNode based on the data and not on user resize events
	// Please note the mainContainer Style Height =  dataContainer offsetHeight
	//
	updateMainNodeHeightBasedOnDataContent: function(){
		var heightVal = this.getMainNodeHeightBasedOnDataContent();
		dojo.style(this.mainNode,{
			'height':this.PxToPercent(heightVal,'height')+"%"
		});
	},
	
	//
	// Computes height of mainNode based on the data and not on user resize events
	// Returns value in px
	//
	getMainNodeHeightBasedOnDataContent: function(){
		var totalDataHeight = this.getDataTotalHeight(true);
		//var heightVal = this.contentBoxDataNode.offsetHeight + this.getHeight_adjust(this.contentBoxDataNode);
		var heightVal = totalDataHeight + this.getHeight_adjust(this.contentBoxDataNode);

		return heightVal;
	},
	
	
	///
	/// *** special logic for shape ***
	/// After undo the size/pos changed shape in text editing mode,
	/// the pos/size for spare will be covered in undo.
	/// But the original will keep the old value, which need to sync
	///
	/// It's OK for shape in none text editing mode. 
	/// Because the undo msg will apply on the original node
	///
	syncPosSizeForRepBox: function() {
		if (this.contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE) {
			var repBox = this.boxRep;  // if having repBox, it means the shape in text editing mode
			if (repBox) {
				// position/size for mainNode
				var bPosSizeChanged = false;
				if (repBox.mainNode.style.top != this.mainNode.style.top) {
					repBox.mainNode.style.top = this.mainNode.style.top;
					bPosSizeChanged = true;
				}
				if (repBox.mainNode.style.left != this.mainNode.style.left) {
					repBox.mainNode.style.left = this.mainNode.style.left;
					bPosSizeChanged = true;
				}
				if (repBox.mainNode.style.width != this.mainNode.style.width) {
					repBox.mainNode.style.width = this.mainNode.style.width;
					bPosSizeChanged = true;
				}
				if (repBox.mainNode.style.height != this.mainNode.style.height) {
					repBox.mainNode.style.height = this.mainNode.style.height;
					bPosSizeChanged = true;
				}
				
				// position for posHandler
				if (bPosSizeChanged) {
					repBox.updateHandlePositions(false);
				}
				
				// zindex : to make sure that text is above svg/image 
				if (this.mainNode.style.zIndex <= repBox.mainNode.style.zIndex) {
					this.mainNode.style.zIndex = repBox.mainNode.style.zIndex + 1;
				}
				// position/size for contentBoxDataNode in IE only
				if (dojo.isIE) {
					// need to consider the changes on contentBoxDataNode in IE
					if (repBox.contentBoxDataNode.style.width != this.contentBoxDataNode.style.width) {
						repBox.contentBoxDataNode.style.width = this.contentBoxDataNode.style.width;
					}
					if (repBox.contentBoxDataNode.style.height != this.contentBoxDataNode.style.height) {
						repBox.contentBoxDataNode.style.height = this.contentBoxDataNode.style.height;
					}
				}
			}
		}
	},
	
	//
	// Get Data Total height
	//
	getDataTotalHeight: function(){
		var dataMargin = this.getDataMargin();
		//var totalDataHeight = this.getFirstContentDataChild().offsetHeight + dataMargin + PresConstants.HEIGHT_ADJUST;
		var totalDataHeight =0;
		var children = this.contentBoxDataNode.children;
		for(var i=0; i<children.length; i++){
			//for D17087,[IE9] The title textbox of first slide will truncate if change master style
			//if the real size is more than the size of 10%*frame height,use the real height
			totalDataHeight += children[i].offsetHeight;
		}
		totalDataHeight += dataMargin;
		return totalDataHeight;
	},
	
	//
	//initialize box position and other properties
	//
	initializeBoxContainerNode: function(){
		//Let's initialize box position and other properties
		if ((this.newBox) && (!this.createFromLayout)){
			this.getPositionForNewBox();
			dojo.addClass(this.mainNode,'newbox');
		} else if (this.createFromLayout) {
			this.moveAndResize(this.layoutInfo.layoutSizePos);
		}else{
			this.moveToPosition();
		}

		if (!dojo.hasClass(this.mainNode, 'resizableContainer') &&
				// Do not handle this class for connector shape
				!PresCKUtil.isConnectorShape(this.mainNode))
			dojo.addClass(this.mainNode,'resizableContainer');
		
		if (dojo.hasClass(this.mainNode,PresConstants.LAYOUT_CLASS)){
			this.isEmptyCBPlaceholder =true;
		} else {
			this.isEmptyCBPlaceholder =false;
		}
				
	},

	//
	// Setting styles and other attribute of the contentBoxDataNode inside the main contentBox node.
	//
	initializeDataContentNode: function(){
		if (this.newBox) {
			this.setContentData();
		} else if (this.contentBoxDataNode==null){
			this.contentBoxDataNode = this.mainNode.lastElementChild;
		}

		if (this.contentBoxDataNode.id.length==0){
			this.contentBoxDataNode.id = 'contentBoxDataNode_'+this.boxUID;
		}
		dojo.addClass(this.contentBoxDataNode, 'contentBoxDataNode');
		//Add inline style for slideSorter
		if (this.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE){
			dojo.style(this.contentBoxDataNode,{
				'height':this.getTableHeightPercent(),
				'width':'100%'
			});
		}else{
			dojo.style(this.contentBoxDataNode,{
			'height':'100%',
			'width':'100%'
		});
		}
		
		if ((this.contentBoxType == PresConstants.CONTENTBOX_TEXT_TYPE) && (dojo.hasClass(this.mainNode,'newbox'))){
			this.newBox=true;
			dojo.addClass(this.mainNode,'newbox');
		}

		if( this._isTextContentBox() ){	// create spellchecker for it
				this.spellChecker = window.spellcheckerManager.createSpellchecker(this.contentBoxDataNode, false, false);
		}
	},

	//
	// adjustContentDataSize sets the size of the image since 100% in IE does not yield the correct needed size as other browsers.
	//
	adjustContentDataSize: function(){
		// No need update content data size for connector shape
		if (PresCKUtil.isConnectorShape(this.mainNode))
			return;

		if (this.parentContainerNode && !this.isEmptyCBPlaceholder){	// if parentContainerNode is null we know it's being destroyed
			var heightPlusPadding = (this.mainNode.style.height=='auto')? this.mainNode.offsetHeight :this.PercentToPx(this.mainNode.style.height,'height');
			var widthPlusPadding = this.PercentToPx(this.mainNode.style.width, 'width');
			if (this.contentBoxType != PresConstants.CONTENTBOX_NOTES_TYPE) {
				this.setContentDataSizeforIE(this.contentBoxDataNode,heightPlusPadding);
//				this.contentBoxDataNode.style.height = heightPlusPadding +"px";
				this.contentBoxDataNode.style.width = widthPlusPadding +"px";
			}
		} else if (this.isEmptyCBPlaceholder){//D2845 and D15602
			this.contentBoxDataNode.style.height ="100%";
			this.contentBoxDataNode.style.width ="100%";
		}
	},

	toggleLockIndicator: function(lockContentBox, user){
		if (lockContentBox == true) {
			this.addLockedIcon(user);
		} else {
			this.deleteLockedIcon();
			setTimeout(dojo.hitch(this, function(){
				window.spellcheckerManager.refresh(this.contentBoxDataNode);
			}), 0); 	
		}
	},
	
	initializeCommentsNode: function(){
		var commentStore = pe.scene.sidebar.commentsController.store;
		this.destroyAllCommentIconNodes();
		if(this.hasComments()) {
			var cid = dojo.attr(this.mainNode, 'commentsId');
			this.commentsId = dojo.trim(cid);
			var commentsArray = this.commentsId.split(' ');
			for(var i=0;i<commentsArray.length;i++) {
				var commentId = commentsArray[i];
				var comment = commentStore.get(commentId);
				var isResolved = comment.items[0].isResolved();
				if(!isResolved){
					this.addCommentIcon(commentId);
				}
				else if(pe.scene.clickedComment && commentId == pe.scene.activeCommentId)
				{
					this.addCommentIcon(commentId,isResolved);
				}
			}	
		}
	},
	
	deleteCommentIcon: function(commentId){
		var pWidget =  concord.widgets.sidebar.PopupCommentsCacher.getCachedSpecificWidget(commentId);
    	if(pWidget && pWidget.isShown()){
    		pWidget.hide();	    	
    	}
		var ic = this.getSpecificCommentIconNode(commentId);
		if(ic){ 
			dojo.destroy(ic);
			this.updateCommentIconPosition();
			// After deleting the icon, we're updating the widget property commentsID
			if(this.hasComments()) {			
				this.commentsId = dojo.trim(dojo.attr(this.mainNode, 'commentsId'));
			} else
				this.commentsId = null;
		}
	},

	deleteLockedIcon: function(){
		if (!PresCKUtil.isConnectorShape(this.mainNode)) {
			dojo.removeClass(this.mainNode,'resizableContainerSelected');
			dojo.addClass(this.mainNode,'resizableContainer');
		}
		dijit.removeWaiState(this.mainNode, "label");
		//D15550 - before disabling we need to ensure that user does not need toolbar for instance if user is in a different contenBox
		var disableToolbar = null;//D15550
		if (window.pe.scene.getEditor().name == window.pe.scene.slideSorter.editor.name){
			disableToolbar= true; //user is not currently editing anything so we can disable toolbar
		}else{
			var disableToolbar = false; //user is currently editing leave toolbar alone			
		}
		this.deSelectThisBox(null,disableToolbar);
		
		this.makeNonEditable();
		var li = dojo.query(".lockedIcon",this.mainNode)[0];
		if (li) dojo.destroy(li);
		// fix for defect 8297 for ie8 opacity with progid:DXImageTransform.Microsoft.Alpha is not always getting set
		// dojo.style(this.contentBoxDataNode, "opacity", 1);
		if (this.contentBoxType != PresConstants.CONTENTBOX_NOTES_TYPE) {
			var contentBoxDataNodeCk = new CKEDITOR.dom.node(this.contentBoxDataNode);
			contentBoxDataNodeCk.setOpacity( 1 );
			contentBoxDataNodeCk = null;
		}
		dojo.style(this.contentBoxDataNode, "backgroundColor", "");
		if (dojo.style(this.mainNode, "backgroundColor") != "") {
			dojo.style(this.contentBoxDataNode, "backgroundColor", ""+dojo.style(this.mainNode, "backgroundColor")+"");
			dojo.style(this.mainNode, "backgroundColor", "");
		}
		if (this.contentBoxType == PresConstants.CONTENTBOX_NOTES_TYPE) {
			dojo.style(this.contentBoxDataNode, "backgroundColor", "white");
			this.adjustSpeakerNotesBackGround();
			dojo.style(this.mainNode, "overflowY", "hidden");	
		}
		this.addContextMenu();
	},
	
	addLockedIcon: function(user){
		//14925 if the content box has a boxRep then unload it and run addLockedIcon on the returned content content box
		if (this.boxRep) {
			var contentBox = this.boxRep.unLoadSpare();
			contentBox.addLockedIcon(user);
			return;
		}
		if (this.contentBoxType == PresConstants.CONTENTBOX_NOTES_TYPE) {
			dojo.style(this.mainNode, "overflowY", "hidden");	
		}
		if (!PresCKUtil.isConnectorShape(this.mainNode)) {
			dojo.removeClass(this.mainNode,'resizableContainerSelected');
			dojo.addClass(this.mainNode,'resizableContainer');
		}

		//D15550 - before disabling we need to ensure that user does not need toolbar for instance if user is in a different contenBox
		var disableToolbar = false;
		if (window.pe.scene.getEditor().name == window.pe.scene.slideSorter.editor.name){
			disableToolbar= true; //user is not currently editing anything so we can disable toolbar
		}
		this.deSelectThisBox(null,disableToolbar);
		
		this.makeNonEditable();

		var li = this.LockedIconNode = document.createElement('div');
		dojo.addClass(li,'lockedIcon');
		dojo.attr(li,'tabindex','-1');
		dijit.setWaiRole(li, 'textbox');
		dijit.setWaiState(li, 'readonly', 'true');
		dijit.setWaiState(li, 'disabled', 'true');
		li.id = 'li_'+this.boxUID;
		dijit.setWaiState(li, 'labelledby', li.id);
		this.mainNode.appendChild(li);
		var  backColor = pe.scene.getEditorStore().getUserCoeditColor(user.id);
		var  borderColor = pe.scene.getEditorStore().getUserCoeditBorderColor(user.id);
		dojo.style(li,{
			'position':'absolute',
			'cursor':'pointer',
			'fontWeight':'bold',
			'backgroundColor':''+backColor+'',
			'border': '1px solid '+borderColor+'',
			'marginTop': '0px',
			'marginRight': '0px',
			'marginBottom': '0px',
			'marginLeft': '0px',
			'paddingTop': '3px',
			'paddingRight': '3px',
			'paddingBottom': '3px',
			'paddingLeft': '3px'
		});
		var initials = "";
		var x = user && user.disp_name && user.disp_name.split(' ');
		if (x) {
			for (var i = 0; i < x.length; i++) {
				initials += x[i].substring(0,1).toUpperCase()+".";
			}
			initials = initials.substring(0,initials.length-1);
		}
//		li.innerHTML = '<span style="margin: 0px; padding: 0px;" aria-hidden="true">'+initials+'</span>';
		dojo.attr(li, "title", ""+dojo.string.substitute(this.STRINGS.defaultText_is_editing,[user.disp_name])+"");
		
		// D18391 Need to use g_locale also as navigator.userLanguage, though specific
		// to IE only, doesn't pick up the browser settings and only picks up the 
		// Windows desktop settings for language.  Adding g_locale addresses this issue.
		var lang = g_locale || navigator.userLanguage || navigator.language;

		// D17622  For non-english languages use a locked icon instead of user initials.
		// When initials is empty, also use default lock
		if(lang.indexOf('en') == -1 || !initials)
		{
			var lockedImagePath = window.contextPath + window.staticRootPath + '/images/lock.png';
			var template = "<img src='${lockedImagePath}' alt='${alt}' aria-hidden='true' style='margin: 0px; padding: 0px; position: absolute;'>";
			var html = dojo.string.substitute(template, {
				lockedImagePath: lockedImagePath,
				alt: " "
			});
			
			dojo.place(html, li);

		} else {
				li.innerHTML = '<span style="margin: 0px; padding: 0px;" aria-hidden="true">'+initials+'</span>';
			}

		// fix for defect 8297 for ie8 opacity with progid:DXImageTransform.Microsoft.Alpha is not always getting set
		//dojo.style(this.contentBoxDataNode, "opacity", 0.5);
		if (this.contentBoxType != PresConstants.CONTENTBOX_NOTES_TYPE) {
			var contentBoxDataNodeCk = new CKEDITOR.dom.node(this.contentBoxDataNode);
			contentBoxDataNodeCk.setOpacity( 0.5 );
		}
		if (dojo.style(this.contentBoxDataNode, "backgroundColor") != "") {
			dojo.style(this.mainNode, "backgroundColor", ""+dojo.style(this.contentBoxDataNode, "backgroundColor")+"");
		}
		dojo.style(this.contentBoxDataNode, "backgroundColor", "#EEEEEE");
		if (this.contentBoxType == PresConstants.CONTENTBOX_NOTES_TYPE) {
			this.adjustSpeakerNotesBackGround();
		}
		this.updateContentBoxLockedIconPosition();
		if (this.ctxMenu) {
			this.ctxMenu.destroy();
		}
	},
	
	//
	// Adding comment icon
	//
	addCommentIcon: function(currentCommentsId,isResolved){
		//adding image icon on top right
		var ic = document.createElement('img');
		ic.id = 'ic_'+currentCommentsId;
		dojo.addClass(ic,'imgcomment');
		if(isResolved)
			ic.src=window.contextPath + window.staticRootPath + '/styles/css/images/comment16resolved.png';
		else
			ic.src=window.contextPath + window.staticRootPath + '/styles/css/images/comment16.png';
		var a11yStrings = dojo.i18n.getLocalization("concord.util", "a11y");
		dojo.attr(ic,'alt', a11yStrings.aria_comments_icon);
		this.mainNode.appendChild(ic);
		
		var maxSize = PresConstants.COMMENT_ICON_SIZE;	
		var winSize = parseFloat(window.pe.scene.slideEditor.slideEditorWidth);
		if(winSize < parseFloat(window.pe.scene.slideEditor.slideEditorHeight))
			winSize = parseFloat(window.pe.scene.slideEditor.slideEditorHeight);
					
		var commentIconSize = winSize/PresConstants.COMMENT_SIZEFACTOR;
	    if(commentIconSize > maxSize)
	    	commentIconSize = maxSize;
	    
	    window.pe.scene.slideEditor.currentCommentIconSize = commentIconSize;
	    
		dojo.style(ic,{
			'position':'absolute',
			'width':commentIconSize + "px",
			'height':(commentIconSize*26/29)  + "px",
			'border':'none',
			'cursor':'pointer'
		});	
		//TODO new comment hover show comments
		this.connectArray.push(dojo.connect(ic,'onmouseover', dojo.hitch(this,this._expandComments,ic.id,false)));
		this.updateCommentIconPosition();		
	},
	
	//
	// returns specific comment icon node or null
	//
	getSpecificCommentIconNode: function(cid){
		var cin = dojo.byId("ic_"+cid);
		if(cin)
			return cin;
		else
			return null;
	},
	
	//
	//Destroy all the comment icon nodes from this box
	//
	destroyAllCommentIconNodes: function(){
		dojo.query(".imgcomment",this.mainNode).forEach(dojo.destroy);
	},
	
	//
	//get all comment icon nodes in this box
	//
	getCommentIconNodes: function(){
		return dojo.query(".imgcomment",this.mainNode);
	},
	
	//
	// updates position of content box locked icon
	//
	updateContentBoxLockedIconPosition: function(){
		var li = dojo.query(".lockedIcon", this.mainNode)[0];
		if (li == undefined || li.childNodes[0] == undefined) {
			return;
		}
		if (this.contentBoxType == PresConstants.CONTENTBOX_NOTES_TYPE) {
			dojo.style(this.mainNode, "overflowY", "hidden");	
		}
		var width = li.childNodes[0].offsetWidth;
		var height = li.childNodes[0].offsetHeight-2;
		var left = this.mainNode.offsetWidth;		
		var top = this.contentBoxDataNode.offsetHeight;
		top = top - height;
		//place the lock indicator in the top right corner of the content box
		if (this.contentBoxType == PresConstants.CONTENTBOX_NOTES_TYPE) {
			left = left - width - 8;
			top = top - 8;
			top = 0;
		} else {
			left = left - width - 16;
			top = 8;
		}
		dojo.style(li,{
			'width': width+'px',
			'height': height+'px',
			'lineHeight': height+'px',
			'left': left + 'px',
			'top': top + 'px'
		});
	},
	
	//
	// updates position and size of comment icon
	//
	updateCommentIconPosition: function(){
		var ic = this.getCommentIconNodes();
		var isBidiRTL = BidiUtils.isGuiRtl();
		if(ic && ic.length>0) {			
			var maxSize = PresConstants.COMMENT_ICON_SIZE;
			var winSize = parseFloat(window.pe.scene.slideEditor.mainNode.style.width);
			if(winSize < parseFloat(window.pe.scene.slideEditor.mainNode.style.height))
				winSize = parseFloat(window.pe.scene.slideEditor.mainNode.style.height);
			
			var icSize = winSize/PresConstants.COMMENT_SIZEFACTOR;
		    if(icSize > maxSize)
		    	icSize = maxSize;
			
			var borderSize = dojo.style(this.mainNode,'borderTopWidth');
			var handleAdjust =   borderSize/2;  // TO CENTER Handle based on thikness of border
			for(var i=0;i<ic.length;i++) {
				if(borderSize <= 0)
					var topPos = i*icSize;
				else
					var topPos = -borderSize -((icSize/2)-(handleAdjust)) + (i*icSize);
				if(this.boxSelected)
					topPos += icSize * borderSize/29;
				var posValStr = (this.mainNode.offsetWidth-borderSize)+"px"; 
				var leftVal, rightVal;
				if (isBidiRTL){
					leftVal = 'auto';
					rightVal = posValStr;
				} else {
					leftVal = posValStr;
					rightVal = 'auto';
				}
				dojo.style(ic[i],{
					'position':'absolute',
					'top': (topPos+icSize * 2/29)+"px",
					'left': leftVal,
					'right': rightVal,
					'width': icSize + "px",
	    			'height':(icSize*26/29) + "px"
				});
			}
		}				
		tr = null;
		ic = null;
	},
	
	//
	// This function gets the height adjustment which is the total of padding + margin + border of the given node.
	// If node is not passed then this.mainNode is used.
	//
	getHeight_adjust: function(node, includeMargin){
		//console.log("contentBox:getHeight_adjust","Entry");
		if (!node){
			node = this.mainNode;
		}
//		if ( dojo.isIE && this.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE){
//			// fix for defect 9957 ie8 and occasionally ie9 is adding extra space between table and contentBox border
//			return 0;
//		}
		var value =0;
		var containerPadding = parseFloat(dojo.style(node, 'paddingTop'));
		var containerMargin  = (includeMargin) ? parseFloat(dojo.style(node,'marginTop')) : 0;
		var containerBorder  = parseFloat(dojo.style(node,'borderTopWidth'));
		
		var valueTop = containerPadding + containerMargin + containerBorder;
		
		containerPadding = parseFloat(dojo.style(node, 'paddingBottom'));
		containerMargin  = (includeMargin) ? parseFloat(dojo.style(node,'marginBottom')) : 0;
		containerBorder  = parseFloat(dojo.style(node,'borderBottomWidth'));

		var valueBottom = containerPadding + containerMargin + containerBorder;
		
		value = valueTop + valueBottom;
		node = null;
		//console.log("contentBox:getHeight_adjust","Exit with value: "+ value +" for node "+node.id);

		// temp fix for 31377
		// It's not can only be reproduced on chrome, but also firefox with specific width and height
		// What can be currently done is enhance main node height
		// Need to take a further look 
		if(dojo.isWebKit && dojo.hasClass(this.mainNode,'newbox') && containerBorder == 0){
			value += 2;
		}
		if(dojo.hasClass(this.contentBoxDataNode,'layoutClassSS')){
			value -=4;
		}
		return value;
	},
	//
	// This function gets the width adjustment which is the total of padding + margin + border of the given node.
	// If node is not passed then this.mainNode is used.
	//
	getWidth_adjust: function(node, includeMargin){
		//console.log("contentBox:getWidth_adjust","Entry");
		
		if (!node){
			node = this.mainNode;
		}
		var value =0;
		var containerPadding = parseFloat(dojo.style(node, 'paddingLeft'));
		var containerMargin  = (includeMargin) ? parseFloat(dojo.style(node,'marginLeft')) : 0;
		var containerBorder  = parseFloat(dojo.style(node,'borderLeftWidth'));

		var valueLeft = containerPadding + containerMargin + containerBorder;
		
		containerPadding = parseFloat(dojo.style(node, 'paddingRight'));
		containerMargin  = (includeMargin) ? parseFloat(dojo.style(node,'marginRight')) : 0;
		containerBorder  = parseFloat(dojo.style(node,'borderRightWidth'));

		var valueRight = containerPadding + containerMargin + containerBorder;
		
		value = valueLeft + valueRight;
		node = null;
		//console.log("contentBox:getWidth_adjust","Exit with value: "+ value +" for node "+node.id);
		return value;
	},
	
	//
	// This function retrieves mainNode position for boxes that are displayed but do not have an associated contentBox object
	//
	getPositionForNewBox : function(){
		//console.log("contentBox:getPositionForNewBox","Entry");
		var top=this.defaultPosition.top;
		var left=this.defaultPosition.left;
		var height = this.defaultPosition.height;
		var width  = this.defaultPosition.width;
		if ((this.initialPositionSize.top) && (this.initialPositionSize.left)){
			top = this.initialPositionSize.top;
			left = this.initialPositionSize.left;
		}
		//Initial size is ignored. Default size is used.
		dojo.style(this.mainNode,{
			'top': this.PxToPercent(top,'height') +"%",
			'left': this.PxToPercent(left,'width')+"%",
			//'height': this.PxToPercent(height,'height')+"%",
			//'width' : this.PxToPercent(width,'width')+"%"
			'height': this.PxToPercent(height,'height')+"%",
			'width' : this.PxToPercent(width,'width') +"%"
		});
		
		//console.log("contentBox:getPositionForNewBox","Exit");
	},
	
	
	//
	// When mouseover turn on the onmousedown event in case of resize
	//
	handleContentOnMouseOver : function(e){
		//console.log('contentBox:handleContentOnMouseOver','Entry');
		 if (dojo.attr(this.mainNode, "presentation_class") == "notes"){
			return;
		 }
		
		if (window.pe.scene.slideEditor.createPackageOnClick && window.pe.scene.slideEditor.createPackageOnClick.createNewContentBox==true){
			dojo.style(this.mainNode,{
				'cursor':'crosshair'
			});			
			return;
		} else if (this.mainNode.style.cursor=='crosshair'){
			dojo.style(this.mainNode,{
				'cursor':'move'
			});	
		}
	},
	
	handleContentOnMouseUp: function(e){
	    // console.log('contentBox:handleContentOnMouseUp');
	    setTimeout(dojo.hitch(this, function(){
		    this.userResized = false;
	    	this.isContentBoxMouseDown = false;
			window.pe.scene.slideEditor.MULTI_MOVE_ON = false;
	    }),10);
	},
	//
	// handle mouse down events
	//
	handleContentOnMouseDown: function(e){
		window.pe.scene.hideComments();
		//D7356 -added next if 
		if (window.pe.scene.slideEditor.createPackageOnClick && window.pe.scene.slideEditor.createPackageOnClick.createNewContentBox==true){
			this.creatingNewContentBox=true; //D17605
			return;
		}
		if (!this.boxReady) return;
		//D17233 use isBoxLocked to check for a user lock
		if (this.isBoxLocked()) {
			return;
		}
		if (e == null) { e = window.event;}
		var sender = (typeof( window.event ) != "undefined" ) ? e.srcElement : e.target;
		
		this.selectThisBox(e);
		if (!dojo.hasClass(this.mainNode, 'g_draw_frame')){
			this.handleMultiBoxSelected(e);
		}
		this.isContentBoxMouseDown = true;
		window.pe.scene.slideEditor.MULTI_MOVE_ON = false;
		setTimeout(function(){
		    if(dojo.isSafari && !concord.util.browser.isMobile())
		        pe.scene.clipboard.focusClipboardContainer();	
		},0);
		
	},
	
	//
	// handle mouse move events
	//
	handleContentOnMouseMove: function(e){	
		if (this.creatingNewContentBox==true){			 			
			this.creatingNewContentBoxDrag = true; //D17605 Prevent this box from going into edit mode since user is creating a new text box over this one.			
		}
	},	
	//
	// When mouseout turn reset the onmousedown event
	//
	handleContentOnMouseOut : function(e){
		document.onmousedown=this.MOUSEDOWN;
	},
	
	//
	// Handles when user clicks on a contentbox
	//
	handleContentOnClick: function(e){
		window.pe.scene.hideComments();
		// console.log('contentBox:handleContentOnClick');
		//D17605 There is a chance that when user is creating a custom box of a text box the text box may receive a click event 
		// interferring with the creation of the custom box. We need to cancel such event .
		try {
			PresCKUtil.runPending();
		}catch (e){
			console.log("handleContentOnClick_PresCKUtil.runPending:"+e);
		}

		if ((window.pe.scene.slideEditor.createPackageOnClick && window.pe.scene.slideEditor.createPackageOnClick.createNewContentBox==true) || (this.creatingNewContentBox==true && this.creatingNewContentBoxDrag)){	
			if (e && (this.creatingNewContentBox==true) && this.creatingNewContentBoxDrag==true){ //D17605 Only stop event if
				e.preventDefault();
				e.stopPropagation();				
			}
			this.creatingNewContentBox = false;
			this.creatingNewContentBoxDrag = false;
			//for defect 26864, we can not rerurn directly here, we should check toolbar and menu status
			//for defect 27925, but here is not real root cause, root cause is one click event sent
			//with editor is null, I have create a coding task to trace it.
			if(this.editor)
				this.toggleEditMode(false, true);
			return;
		}
		
		if(pe.scene.slideEditor.MOVE_FLAG || pe.scene.slideEditor.RESIZE_FLAG){
			if(e){
				e.preventDefault();
				e.stopPropagation();
			}
			if(this.isEditModeOn()){
				var dfc = PresCKUtil.getDFCNode(this.editor);
				if (dfc != null) {
				  var hastext = PresCKUtil.doesNodeContainText(dfc);
				  if(hastext){
					this.toggleEditMode(false, false);
				  }
				}
			}
			else if(dojo.isSafari && !concord.util.browser.isMobile())
				pe.scene.clipboard.focusClipboardContainer();
			
			return;
		}

		if(this.editModeOn){
			var dfc = PresCKUtil.getDFCNode(this.editor);
			if(dfc != null){
				var hastext = PresCKUtil.doesNodeContainText(dfc);
				if(!hastext){
					if(e){
						e.preventDefault();
						e.stopPropagation();
					}
					//D26855: [Regression]The predefine text in placeholder will lost after press backspace and select border to exit edit mode
					var family = dojo.attr(this.mainNode,'presentation_class');
					if(family && family.length>0){
					    var layoutName = dojo.attr(this.mainNode,'presentation_presentation-page-layout-name');
					    var tclassname ='';
					    if (family=='outline'){
					    	tclassname = 'defaultContentText '+PresConstants.CONTENT_BOX_OUTLINE_CLASS;
					    } else if (family == 'title'){					
					    	tclassname = 'defaultContentText '+PresConstants.CONTENT_BOX_TITLE_CLASS;
					    } else if (family == 'subtitle'){
					    	if(layoutName == "ALT32"){
					    		tclassname = 'defaultContentText '+PresConstants.CONTENT_BOX_SUBTITLE_CLASS;
					    	}else {
					    		tclassname = 'defaultContentText '+PresConstants.CONTENT_BOX_SUBTITLE_CLASS;
					    	}
					    } else if (family == 'notes'){
					    	tclassname = 'defaultContentText '+PresConstants.CONTENT_BOX_NOTES_CLASS;
					    }
					    if(dfc.firstChild)
					    {
					    	if(PresCKUtil.checkName(dfc.firstChild,'ul') && dfc.firstChild.firstChild)
					    		dojo.addClass(dfc.firstChild.firstChild,tclassname);
					    	else
					    		dojo.addClass(dfc.firstChild,tclassname);
					    }	
					    	
						this.isDirty = false;
						this.isEmptyCBPlaceholder = true;
					}
					this.toggleEditMode(false, true);
					return;
				} 
			}
		}
		else if(dojo.isSafari && !concord.util.browser.isMobile())
			pe.scene.clipboard.focusClipboardContainer();	
		
		if (e && (e.ctrlKey || e.metaKey)){ //Prevent going into edit mode when selecting a contentBox with ctrl/command key
			e.preventDefault();
			e.stopPropagation();
			if(dojo.isSafari && !concord.util.browser.isMobile() && e.keyCode == 86)
			{
				pe.scene.clipboard.focusClipboardContainer();
			}	
				
			return;
		}
		//D25613[Regression] Can't select multi-object by Ctrl key [o]
		//D23014: [Textbox] Objects remains in selected mode incorrectly while enter in edit mode of one object
		if(window.pe.scene.slideEditor.isMultipleBoxSelected()){
			window.pe.scene.slideEditor.MULTI_MOVE_ON = false;
			this.deSelectAllButMe(this,true);
		}
		if (!this.boxReady)
			return;
		//D17233 use isBoxLocked to check for a user lock
		if (this.isBoxLocked()) {
			return;
		}
		if (window.pe.scene.slideEditor.SINGLE_CK_MODE){ 
			if (e == null) { e = window.event;}
			var sender = (typeof( window.event ) != "undefined" ) ? e.srcElement : e.target;
			if (dojo.hasClass(sender,'imgcomment')){
				e.preventDefault();
				e.stopPropagation();
				return;
			}		
		}
		
//		this.mainNode.focus();
	
		this.chkTimelyClickToGoInEditMode(e);
		//this.handleContentOnDblClick(e);
		return;
	},
	
	
	//
	//Check on click time stamp;
	//
	chkTimelyClickToGoInEditMode: function(e){
		//console.log('contentBox:chkTimelyClickToGoInEditMode','Entry for '+this.mainNode.id +' boxReady is '+this.boxReady);
		if (window.pe.scene.slideEditor.createPackageOnClick && window.pe.scene.slideEditor.createPackageOnClick.createNewContentBox==true){
			return;
		}
		if (!this.boxReady) return;			
		window.pe.scene.validResize = false;
		try{	
//			var curTime = new Date().getTime();
//			var scene = window.pe.scene;
//			var timeLapse = curTime - this.onClickTimeStamp;
//			this.onClickTimeStamp = curTime;
//			if (timeLapse > scene.MIN_CLICK_TIME ) {
				this.handleContentOnDblClick(e);
//			} else if (e) {
//				e.preventDefault();
//				e.stopPropagation();
//			}
		}catch(evt){
			console.log("Error while going into edit mode: "+evt);
			// D14108 The numbering lists turns to 0 when toggle between one list edit box to another list edit box
			//this also happens when error exception occur trying to go to edit mode
			//- need to switch display none to block for OLs in IE to show up correctly again
	        window.pe.scene.slideEditor.correctIeNumberingList();
		}
        window.pe.scene.validResize = true;
	},	
	
	//
	//Check on click time stamp
	//
	chckOnClickTimeStamp: function(){
		if (!this.boxReady) return;			
		window.pe.scene.validResize = false;
		try{

		var curTime = new Date().getTime();
		var scene = window.pe.scene;
		if (this.contentBoxType!=PresConstants.CONTENTBOX_IMAGE_TYPE && this.contentBoxType!=PresConstants.CONTENTBOX_SHAPE_TYPE && !dojo.hasClass(this.mainNode,PresConstants.LAYOUT_CLASS) && !dojo.hasClass(this.mainNode,PresConstants.IMPORTED_IMAGE_CLASS)){
			var timeLapse = curTime - this.onClickTimeStamp;
            //console.log("chckOnClickTimeStamp: Time between click is "+timeLapse);
//			if (this.onClickTimeStamp==0){
//				scene.showInfoMessage(this.STRINGS.defaultText_newBox, scene.INFO_MSG_DURATION);
//			}else
			if ((scene.DBL_CLICK_TIME < timeLapse ) && (timeLapse < scene.ON_CLICK_INTERVAL) ){
				var msg = this.STRINGS.toolTipText_OnDblClick;
				var tipMsg = dojo.string.substitute(window.pe.scene.nls.tipInfo,[msg]);
				scene.showInfoMessage(tipMsg, scene.INFO_MSG_DURATION);
			}
		}
		this.onClickTimeStamp = curTime;
		}catch(e){}
        window.pe.scene.validResize = true;
	},
	
	handleContentOnDblClick_isEitable : function(){
		this.trytimes ++; 
		var slideEditor = window.pe.scene.slideEditor;
		//13550 - need to check if there is other objects in edit mode
		//if so, need to kick other boxes out of edit mode
		if(this.contentBoxType==PresConstants.CONTENTBOX_TEXT_TYPE){
			if(dojo.hasClass(this.mainNode, 'g_draw_frame')){
				slideEditor.unloadAllOtherSpareBox(slideEditor.groupSpareBox);
			}else{
				slideEditor.unloadAllOtherSpareBox(slideEditor.spareBox);
			}
		}
		else if(this.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE){
			slideEditor.unloadAllOtherSpareBox(slideEditor.tableSpareBox);			
		}
		
		if ((this.contentBoxType==PresConstants.CONTENTBOX_TEXT_TYPE) || (this.contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE) || 
				(this.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE) ) {
			//13550 - (1) when the click happens in the textbox of a group box, 
			//the event will be captured first by the textbox of the group box
			//so it will come here..making the textbox in editmode.
			//then the event propagates to the group box which will be handled by the else-if section of code below 
			if (!this.editor){
				this.makeEditable();
			} else{
				this.toggleEditMode();
				this.handleCursorOnEdit();
			}
			
		}else if(this.contentBoxType==PresConstants.CONTENTBOX_GROUP_TYPE && slideEditor.GROUP_SINGLE_CK_MODE==true) {
			//13550-check if right now it is in edit mode.. just in case it is now in edit mode due to click on txtbox g_drawFrame
			//if so, we don't need to process again.
			//else, we need to make the txtbox call makeEditable
			if(this.spr!=null){//if this.spr is set meaning it is using spare and in edit mode already
				//just update the toggle edit mode on the spare
				this.spr.toggleEditMode(true);
			}else{
				//13550
				//for the group box, there are two ways to go edit mode:
				//(1) clicking on textbox of the group
				//    - txtbox catches the event first (handled in if(this.contentBoxType==PresConstants.CONTENTBOX_TEXT_TYPE) code above 
				//    - then group box catches the even later (handled in if(this.spr!=null) above)
				//(2) clicking on group area outside the textbox, e.g. in Triangle shape, clicking near the top of the triangle would only
				//    register the event on the group object only (not on the textbox)
				//    This case is handled below.. 
				//    The group box then tells its textbox to get into edit mode
				
				slideEditor.unloadAllOtherSpareBox(slideEditor.groupSpareBox);			
				
				var txtBoxObj = this.txtContent;
				if(txtBoxObj){
					if (!txtBoxObj.editor){
						txtBoxObj.makeEditable();
					} else{
						txtBoxObj.toggleEditMode();
						txtBoxObj.handleCursorOnEdit();
					}
				}
				if(this.spr!=null){
					this.spr.toggleEditMode(true);
				}
			}
			
		}
		else if (this.contentBoxType==PresConstants.CONTENTBOX_GROUP_TYPE && window.pe.scene.slideEditor.GROUP_SINGLE_CK_MODE!=true) {
			this.toggleEditMode();
		}
	},
	
	handleContentOnDblClick : function(e){
		this.trytimes = 0; 
		//console.log("contentBox:handleContentOnDblClick","Entry");
		//console.log("==============> TIMER - Start clik for Edit Mode ");
		//window.TIME_CLICK_FOR_EDIT = new Date().getTime();

		if (!this.boxReady) return;
		//D17233 use isBoxLocked to check for a user lock
		if (this.isBoxLocked()) {
			return;
		}
		if (e){
			if (!dojo.hasClass(this.mainNode, 'g_draw_frame')) {	// propagate if grouped box
				e.preventDefault();
				e.stopPropagation();
			}
		}
		if (this.isEditable){
			this.handleContentOnDblClick_isEitable();
		} else if ( dojo.hasClass(this.mainNode,PresConstants.LAYOUT_CLASS) && (this.contentBoxType==PresConstants.CONTENTBOX_IMAGE_TYPE)){
			//Need to launch image gallery
			this.openAddNewImageDialog(dojo.hitch(this,this.cleanupLayoutDefaultImage));
		}
		//console.log("contentBox:handleContentOnDblClick","Exit");
	},
	
	//
	// Handles update layout Image content
	//
	cleanupLayoutDefaultImage: function(imageUrl, inputPos, imageName){
		if ((imageUrl) && (imageUrl.length>0)){//For D34516
			//Let's delete current place holder
			var publish = true;
			//Let's addImageContentBox
			var pos ={};
			pos.top   = parseFloat(this.mainNode.style.top);
			pos.left  = parseFloat(this.mainNode.style.left);
			pos.width = parseFloat(this.mainNode.style.width);
			pos.height= parseFloat(this.mainNode.style.height);
			PresCKUtil.normalizeMsgSeq(null,null,null,'beginMerge');//begin notify message
			this.deleteContentBox(publish);
			this.addImageContentBox(imageUrl,pos, imageName);
			//Let's destroy this placeholder
		}
	},
	
	//
	// this function cleans up the default text from layout to be a regular text node for the user
	//
	cleanupLayoutDefaultText: function(){
		var msgPairList =[];
		var attrName = "class";
		var newE = null;
		var oldAttrValue=null;
		
		//0- Remove classes in ckeditor
		if (this.editor){
			var nodes = dojo.query('.defaultContentText',this.editor.document.$.body);// p or ul node containing defaultContentText class
			for (var i=0; i< nodes.length; i++){
				var classes = 'defaultContentText '+PresConstants.CONTENT_BOX_TITLE_CLASS+' '+PresConstants.CONTENT_BOX_SUBTITLE_CLASS +' '+PresConstants.CONTENT_BOX_NOTES_CLASS+' '+PresConstants.CONTENT_BOX_OUTLINE_CLASS;
				dojo.removeClass(nodes[i],classes);
			}
			//Also remove newTextContent class since this node has now been edited by user
			var nodes = dojo.query('.newTextContent',this.editor.document.$.body);
			for (var i=0; i< nodes.length; i++){
				var classes = 'newTextContent';
				dojo.removeClass(nodes[i],classes);
				// D12828 Leaving a class attribute with no value causes backspace problems
				if (dojo.attr(nodes[i], 'class') == "")
					dojo.removeAttr(nodes[i], 'class');
			}
		}

		//1 - Remove class cb_title cb_outline and cb_subtitle from default content node
		var nodes = dojo.query('.defaultContentText',this.contentBoxDataNode);// p or ul node containing defaultContentText class
		for (var i=0; i< nodes.length; i++){
			var attrName = "class";
			var newE = new CKEDITOR.dom.node(nodes[i]);
			var oldAttrValue = newE.getAttribute(attrName);
			var classes = 'defaultContentText '+PresConstants.CONTENT_BOX_TITLE_CLASS+' '+PresConstants.CONTENT_BOX_SUBTITLE_CLASS +' '+PresConstants.CONTENT_BOX_NOTES_CLASS+' '+PresConstants.CONTENT_BOX_OUTLINE_CLASS;
			dojo.removeClass(nodes[i],classes);
			msgPairList = SYNCMSG.createAttributeMsgPair(newE, attrName, null, msgPairList,oldAttrValue);
		}

		//2 - Remove layoutClassSS from contentBoxDataNode
		newE = new CKEDITOR.dom.node(this.contentBoxDataNode);
		oldAttrValue = newE.getAttribute(attrName);
		dojo.removeClass(this.contentBoxDataNode,'layoutClassSS');
		msgPairList = SYNCMSG.createAttributeMsgPair(newE, attrName, null, msgPairList,oldAttrValue);
		
		//3 - Remove layoutClass from mainNode;
		newE = new CKEDITOR.dom.node(this.mainNode);
		oldAttrValue = newE.getAttribute(attrName);
		dojo.removeClass(this.mainNode,'layoutClass');
		msgPairList = SYNCMSG.createAttributeMsgPair(newE, attrName, null, msgPairList,oldAttrValue);

		//4 - Set presentationb_placeHolder attribute to false on mainNode
		attrName = "emptyCB_placeholder";
		msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(this.mainNode), attrName, 'false', msgPairList);
		dojo.attr(this.mainNode,'emptyCB_placeholder','false');
		
		//5 - Set draw_layer attribute to "layout" indicating it is a real content on mainNode
		attrName = "draw_layer";
		msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(this.mainNode), attrName, 'layout', msgPairList);
		dojo.attr(this.mainNode,'draw_layer','layout');
		
		//wangzhe>>>============
		PresCKUtil.prepareTextboxInfo(this.mainNode);
		//we should update the relative value for this place holder
		PresCKUtil.updateRelativeValue(this.mainNode);
		PresCKUtil.updateRelativeValue(this.editor.document.$.body);
		PresCKUtil.clearTextboxInfo();
		//<<<<===============
		
		//6 - Send to sorter and other clients then prevent from adding to undo q by setting the flag -replace removeUndo
		var addToUndo = false;
		msgPairList[0] = SYNCMSG.addUndoFlag(msgPairList[0],addToUndo);
		SYNCMSG.sendMessage(msgPairList, SYNCMSG.SYNC_SORTER);
		
		this.isEmptyCBPlaceholder = false;
//		this.publishLayoutConverted(false);
	},

	/**
	 * Fix any issues that are seen when going into edit mode for a content box.
	 */
	fixContentDisplay: function() {
	    if (!this.editor)
	        return;
	    
	    var listFixed = false;
	    // for some reason, list indicators disappear in certain cases when going into edit
	    // mode in IE8.
	    // - from edit mode in a text box, single click another text box
	    // - immediately go back into edit mode of the original text box
	    // - list indicators (some or all) are gone
	    if ( CKEDITOR.env.ie ) {
    	    var dfc = PresCKUtil.getDFCNode( this.editor );
    	    if (dfc) {
	            // toggling the 'display' style on the DFC seems to fix this
	            var display = dojo.style( dfc, 'display' );
	            dojo.style( dfc, { 'display' : '' } );
	            dojo.style( dfc, { 'display' : display } );
    	    }
    	    dfc = null;
    	// D7656 - List item text is sometimes placed on the next line in Safari. It's unclear why / how
    	//         this is happening. The only *reliable* method I've found so far to fix this is to
    	//         remove / re-add the list.
	    } else if ( CKEDITOR.env.webkit ) {
    	    var dfc = PresCKUtil.getDFCNode( this.editor );
            if (dfc) {
                dojo.forEach(
                        // find all lists in the DFC
                        dojo.query( 'OL, UL', dfc ),
                        function( item ) {
                            listFixed = true;
                            var ckItem = new CKEDITOR.dom.node( item ),
                                prev = ckItem.getPrevious(),
                                parent = ckItem.getParent();
                            ckItem.remove();
                            if ( prev )
                                ckItem.insertAfter( prev );
                            else
                                ckItem.appendTo( parent, true );
                        }
                );
            }
	    }
	    this.moveCursorToLastEditableElement();
	    return;
	    /*
	     * D8921 - make sure the content is in a "supported" structure
	     * 
	     * <UL>
	     *   <LI>
	     *     <UL>
	     *       <LI>some content</LI>
	     *     </UL>
	     *     <SPAN>some more content</SPAN>
	     *     <SPAN>even more content</SPAN>
	     *   </LI>
	     * </UL>
	     * 
	     * -- should be turned into --
	     * 
	     * <UL>
	     *   <LI>
	     *     <UL>
	     *       <LI>some content</LI>
	     *     </UL>
	     *   </LI>
	     *   <LI>
	     *     <SPAN>some more content</SPAN>
	     *   </LI>
	     *   <LI>
	     *     <SPAN>even more content</SPAN>
	     *   </LI>
	     * </UL>
	     */
	    var fixUnsupportedListSpans = function( item ) {
	        if ( !item )
	            return;
	        
	        item = new CKEDITOR.dom.node( item );
	        var parent = item.getParent(),
	            newParent = parent.clone( false, false );
	        // this *should* be an LI. ignore if not.
	        if ( !parent.is || !parent.is( 'li' ) )
	            return;
	        
	        // update flag
	        spanFixed = true;
	        while ( item ) {
	            var tmp = item.getNext();
	            newParent.append( item );
	            // use BR to trigger a new LI
	            if ( item.is && item.is( 'br' ) ) {
	                newParent.insertAfter( parent );
	                parent = newParent;
	                newParent = parent.clone( false, false );
	            }
	            item = tmp;
	        }
	        
	        // if new LI doesn't have any children added to it, don't add it to the list
	        if ( newParent.getChildCount() > 0 )
	            newParent.insertAfter( parent );
	        
	        newParent = null;
	    };
	    
	    var spanFixed = false;
	    var editNode = this.getContentEditNode();
	    dojo.forEach(
	            // UL+SPAN finds all SPANs that are next siblings of unordered lists
	            dojo.query( 'UL+SPAN', editNode),
	            fixUnsupportedListSpans
	    );
	    dojo.forEach(
	            // OL+SPAN finds all SPANs that are next siblings of ordered lists
	            dojo.query( 'OL+SPAN', editNode),
	            fixUnsupportedListSpans
	    );
	    
	    if ( spanFixed ) {
	        PresCKUtil.setPreSnapShot( this.editor, editNode );
			this.editor.initSnapShot = PresCKUtil.cloneSnapShot( this.editor.preSnapShot );								
	        this.synchAllData( editNode, null, null, false );
	    }
	    
	    if ( spanFixed || listFixed ) {
	    	this.moveCursorPositionToLastNode( this.editor.getSelection() );
	    }
	},
	
	
	/**
	 * Fix any issues that are seen after window resize event fires for IE.
	 */
	fixContentDisplayViewMode: function() {
	    if (dojo.isIE && !this.isEditModeOn()) {
    	    var node = dojo.query("li",this.contentBoxDataNode);
    	    if (node.length>0){
 				this.selectThisBox();
				this.deSelectThisBox();
    	    }
	    }
	},	
	
	//
	// Adjust style of editor
	//
	fixEditWindow: function(){
		this.editTD = dojo.query("#cke_contents_"+this.getEditorName(),this.mainNode);
		dojo.style(this.editTD[0],{
			'border':'none'
		});
		
// Following lines for table height debugging - to not delete.		
//		dojo.style(this.editTD[0],{
//			'outline':'1px solid red'
//		});
//		
//		var body = this.editor.document.$.body;
//		dojo.style(body,{
//			'outline':'1px solid yellow'
//		})

		if (dojo.isIE){
			// Process for IE - JMT fix for flashing CK on entering edit
			var body = this.editor.document.$.body;
			dojo.style(body,{
				'overflow':'hidden'
			});
		} else {
			var ckIframeNode = dojo.query("iframe",this.editTD[0])[0];
			dojo.style(ckIframeNode,{
				'overflow':'hidden'
			});
		}
		
		if (this.contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE) {
			this.fixSpeakerNotesEditWindow();
		}
	},
		
	//
	// Update ckeditor window height and width
	//
	updateEditSizeToFitMainContainer : function(){
		if (this.editor == undefined || this.editor == null) {
			return;
		}
		try{
				if(dojo.isIE && this.contentBoxType != PresConstants.CONTENTBOX_TABLE_TYPE){ //JMT fix for flashing CK on entering edit
					if(dojo.hasClass(this.mainNode, "g_draw_frame")){
						//13550 - for some reason if it is in a shape, we need to just use the offset
						this.editor.resize(this.mainNode.offsetWidth - this.getWidth_adjust(),this.mainNode.offsetHeight - this.getHeight_adjust(),true); //Midified with 16632 but needed even if we pull 16632 off
					}
					else{
						this.editTD = dojo.query("#cke_contents_"+this.getEditorName(),this.mainNode)[0];
						var newHeight =  this.getHeightOnCKEdit(false);
						var newWidth  = this.getWidthOnCKEdit(false);
						//console.log("contentBox:updateEditSizeToFitMainContainer","New Width/Height is: "+newWidth+"/"+newHeight);
						this.editTD.style.height = newHeight;
//						this.editTD.style.width = newWidth+'px';
						this.editor.resize(newWidth,newHeight);
					}
				} else {
					this.editor.resize(this.mainNode.offsetWidth - this.getWidth_adjust(),this.mainNode.offsetHeight - this.getHeight_adjust(),true); //Midified with 16632 but needed even if we pull 16632 off
				}
		} catch(e){}
	},

	handleContentMove: function(e){
		//console.log("contentBox:handleContentMove","Entry");
	},
	
	handleContentOnBlur: function(e){
		//console.log("contentBox:handleContentBlur","Entry");
	},
	
	
	//stroy 35054
	//implemented in imgContentBox.js
	shapeMessageDialog: function(mover, e){
	},
	
	//
	// dojoMoveable mouse down event
	//
	dojoMouseDownForMoveable: function(box, e){
		// summary:
		//		event processor for onmousedown, creates a Mover for the node
		// e: Event
		//		mouse event
		if(this.skip && dojo.dnd.isFormElement(e)){ return; }
		if(this.delay){
			this.events.push(
				dojo.connect(this.handle, "onmousemove", this, "onMouseMove"),
				dojo.connect(this.handle, "onmouseup", this, "onMouseUp")
			);
			this._lastX = (dojo.isIE) ? e.clientX : e.pageX;
			this._lastY = (dojo.isIE) ? e.clientY : e.pageY;
		}else{
			this.onDragDetected(e);
		}
		dojo.stopEvent(e);
	},
	
	//
	// Makes contentBox not  moveable inside the parentContainerNode
	//
	makeNotMoveable: function(){
		//console.log("contentBox:makeNotMoveable","Entry");
		if (this.nodeMoveable)
			this.nodeMoveable.destroy();
		this.nodeMoveable=null;
		//console.log("contentBox:makeNotMoveable","Exit");
	},
	
	//
	// Deselects all then select this content box
	//
	deselectAllThenSelectMe: function(e){
		var forceDeselect = false;
		this.deSelectAllButMe(this,forceDeselect);
		this.selectThisBox(e);
	},
	
	isBoxLocked: function(){
		var li = dojo.query(".lockedIcon",this.mainNode)[0];
		if (li) {
			return true;
		} else {
			//D17233 if the user clicks on a box that is part of a group box
			//check if the parent is locked
			if (dojo.hasClass(this.mainNode,"resizableGContainer")) {
				li = dojo.query(".lockedIcon",this.parentContainerNode.parentNode)[0];
				if (li) {
					return true;
				}
			}
			return false;
		}
	},
	
	//
	// For accessibility, a locked box must be "soft" selected so a user can determine
	// the box is there and locked. Just focus on the locked icon div.
	//
	selectThisLockedBox: function() {
		var li = dojo.query(".lockedIcon",this.mainNode)[0];
		if (li) {
			dojo.style(li,{'border' :'1px dashed'});
			this.lockSelected = true;
			li.focus();
		}
		return;
	},
	
	//
	// Sets border and resize nodes around box to show that it has been selected
	//
    selectThisBox: function(e, commentId){
        //never select if the box is locked 
        if (this.isBoxLocked()) {
            return;
        }
        
        if ((e == null)&& !(dojo.isWebKit)){ //jmt - 46690 - In case of select all where e needs to be null - Safari will get some event from window which causes select all to fail
            e = window.event;
        }
        if ((e) && (e.stopPropagation)) e.stopPropagation();
        var target = ((e) && (e.target)) ? e.target : this.mainNode;
        if (!dojo.hasClass(target,'handle')){ // Do not select when this is a handle.
            //D14336: if a image place holder is clicked, don't close dialogs. 
            if(!(this.isEmptyCBPlaceholder && this.contentBoxType == PresConstants.CONTENTBOX_IMAGE_TYPE))
                window.pe.scene.slideEditor.closeAllNonModalDialog();
            
            
            if (!this.boxSelected){
                //console.log("contentBox.js:selectThisBox() Entry "+this.boxUID);
                var presClass = dojo.attr(this.mainNode, "presentation_class");
                if (presClass != "notes" &&  // do not change this class for speaker notes
                    !PresCKUtil.isConnectorShape(this.mainNode)) {
                    dojo.removeClass(this.mainNode,'resizableContainer');
                    dojo.addClass(this.mainNode,'resizableContainerSelected');
                }
                
                
                // for wai-aria
				var flag = this.contentBoxType==PresConstants.CONTENTBOX_IMAGE_TYPE ||
					this.contentBoxType==PresConstants.CONTENTBOX_SHAPE_TYPE;
				// Focus to main node other than data node
				var focusElem = flag ? this.mainNode :this.contentBoxDataNode;
				if (focusElem && !this.isSpare) {
					if (flag) {
						// no additional aria information needed for images
					}
					else if (this.contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE)
					{	
						// no additional aria info needed for groups
					}
					else 
					{	
						//
						// set aria-describedby such that when the box is selected, JAWS announces
						// the text in the box, the type of textbox (or imported object description) and then "press enter to edit" (except for images)
						//
						dijit.setWaiState(focusElem,'readonly','true');

						var describedby = 'P_arialabel_PressEnterToEdit';
						if (dojo.hasAttr(focusElem, 'aria-describedby')) {
							var nodeDescribedby = dojo.attr(focusElem, 'aria-describedby');
							if (nodeDescribedby.indexOf(describedby) == -1) {
								describedby = nodeDescribedby + ' ' + describedby;   // append "press enter to edit" to imported described by
								dijit.setWaiState(focusElem,'describedby', describedby);
							}
						}
						else {
							dijit.setWaiState(focusElem,'describedby', describedby);
						}
					}
				}

				this.showHandles();
				this.boxSelected =true;					
					
				if(this.hasComments()) {										
					this.updateCommentIconPosition();					
				}
				 
				// commented out as we no longer change zindex upon select
				// now that we support bring to front and send to back
				//this.setzIndexCtr((this.getzIndexCtr()+5));
				//dojo.style(this.mainNode,{
				//		'zIndex':this.getzIndexCtr()
				//});
				if ((e) && (e.currentTarget)){
					if (!(e.ctrlKey || e.metaKey)){
						var forceDeselect = true;
						this.deSelectAllButMe(this,forceDeselect);
					}
				}
				
				//for wai-aria
				try {
				/* Defect #8573, due to setTimeout loadSlideInEditor in slideEditor.js 
				/* implemented for page up page down performance issue
				/* setting focus here will grab focus for IE from contextMenu in slidesorter
				 * 
				 * Update - feb/2013, removed the if (!dojo.isIE) check when doing the focus - this
				 * was causing problem for keyboard commands. It seems the original issue when loading
				 * a slide does not happen anymore on IE.
				 */

					// #31782, skip for mobile.
					!concord.util.browser.isMobile() && focusElem.focus();
				} catch(e) {
					// console.log(e);
				}
				this.enableMenuItemsOnSelect();
				//console.log("contentBox.js:selectThisBox() Exit");
			} else{
				if ((e) && (e.currentTarget) && ((e.ctrlKey || e.metaKey))){
					this.deSelectThisBox(e);
				} else if ((e) && (e.currentTarget)){
					var forceDeselect = true;
					//this.deSelectAllButMe(this,forceDeselect);
				} else {
					if (this.contentBoxType == PresConstants.CONTENTBOX_IMAGE_TYPE || 
							this.contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE){
						this.enableMenuItemsOnSelect();
					}
				}
			}
		}
		
		// D10160 - if already in edit mode, make sure the cursor is correctly positioned when you click
		//          past the end of the line (i.e. before any BR nodes, *within* the last, inner-most SPAN)
		
		if ( this.isEditModeOn() && this.editor ) {
		    var selection = this.editor.getSelection(),
		        range = selection && selection.getRanges()[0];
		    // should *always* be collapsed on 'click' event, but just to be sure...
		    //D21730, add check "range.startOffset == range.endOffset"
		    if ( range && range.collapsed && (range.startOffset == range.endOffset) && range.checkEndOfBlock() ) {
		        PresCKUtil.moveToEndOfRange( range );
		    }
		    return;
		}
		this.publishBoxSelectedEvent();
		if(dojo.isSafari && !concord.util.browser.isMobile())
			pe.scene.clipboard.focusClipboardContainer();
	},
	
	//
	// Sets border and resize nodes around box to show that it has been deselected
	//
	deSelectThisBox: function(e,disableToolbar){
		if (e) e.stopPropagation();
		if(!this.boxSelected) return;
		window.pe.scene.hideComments();
		if (this.lockSelected) {
			var li = dojo.query(".lockedIcon",this.mainNode)[0];
			if (li) {
				dojo.style(li,{'border' :''});
				li.blur();
			}
			this.lockSelected = false;
		}

		var updateToolbar = (disableToolbar!=null)? disableToolbar : true; //D15550 We will update toolbar by default if disableToolbar is null
		if (!PresCKUtil.isConnectorShape(this.mainNode)) {
			dojo.removeClass(this.mainNode,'resizableContainerSelected');
			dojo.addClass(this.mainNode,'resizableContainer');
		}
		
		//For wai-aria
			var focusElem = (this.contentBoxType==PresConstants.CONTENTBOX_IMAGE_TYPE || this.contentBoxType==PresConstants.CONTENTBOX_SHAPE_TYPE)? this.mainNode :this.contentBoxDataNode;
			if (focusElem!=null) focusElem.blur(); // JMT for D35248
			//dojo.attr(focusElem,'tabindex','');


		this.hideHandles();
		if(this.boxSelected && this.isEditModeOn()){//wj for S2R1
			PresCKUtil.runPending();	
			this.toggleEditMode(false);
		}
		this.boxSelected =false;
		if (updateToolbar){//D15550
			this.disableMenuItemsOnDeSelect();
		}
		if(this.hasComments()){
			this.updateCommentIconPosition();
		}		
		if (typeof this.deleteMe != "undefined" && this.deleteMe != null && this.deleteMe == true && this.contentBoxType==PresConstants.CONTENTBOX_TEXT_TYPE && dojo.hasClass(this.mainNode,'newbox')) {
			var addToUndo = false;			
			this.deleteContentBox(true,addToUndo);
		}
		focusElem = null;
		
		if (this.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE && dojo.isWebKit)
			this.resizeForbidden = false;
		if(pe.scene.slideEditor.isBoxSelected()){
			pe.scene.disableCommentButton(false);
		} else {
			pe.scene.disableCommentButton(true);
		}
	},

	//Make this node selected
	selectContent: function(){
		//console.log("contentBox.js:selectContent() Entry");
		this.boxSelected =true;
		dojo.style(this.mainNode,{
			'border' :'1px dashed'
		});
		//console.log("contentBox.js:selectContent() Entry");
	},
	
	isHandleofCurNode: function(handle){
            var p = handle.parentNode;
            if(this.mainNode.id == p.id){
                if (dojo.hasClass(handle,"tl handle")) {
                    return true;
                }
                if (dojo.hasClass(handle,"tm handle")) {
                    return true;
                }
                if (dojo.hasClass(handle,"tr handle")) {
                    return true;
                }
                if (dojo.hasClass(handle,"bl handle")) {
                    return true;
                }
                if (dojo.hasClass(handle,"bm handle")) {
                    return true;
                }
                if (dojo.hasClass(handle,"br handle")) {
                    return true;
                }
                if (dojo.hasClass(handle,"ml handle")) {
                    return true;
                }
                if (dojo.hasClass(handle,"mr handle")) {
                    return true;
                }
            }

        return false;
	},
	//
	// Shows resize nodes (handles) around box (8 total)
	//
	   showHandles: function (node) {
	        if (node == null) node = this.mainNode;
	        if (dojo.attr(this.mainNode, "presentation_class") == "notes") { //do not show handles for speaker notes
	            return;
	        }
	        var resizeContent = false;
	        this.updateHandlePositions(resizeContent, node);
	        var handles = dojo.query('.handle',node);
	        for (var i=0; i<handles.length; i++){
	           var handle = handles[i];
	           dojo.style(handle,{
	                    'display':'inline'
	            });
	           handle = null;
	        }
	        node = null;
	        handles = null;
	    },


	//
	// Hides resize nodes (handles) around box (8 total)
	//
	hideHandles: function() {
		var handles = dojo.query('.handle',this.mainNode);
		for (var i=0; i<handles.length; i++){
		   var handle = handles[i];
		   dojo.style(handle,{
					'display':'none'
			});
		   handle = null;
		}
		handles = null;
	},

	//
	// Updates the position of all 8 resize handles around the box
	//
	updateHandlePositions: function(resizeContent, node) {
		if (node == null) node = this.mainNode;
		var handles = dojo.query('.handle',node);
        var container = node;
		var imgSizeAdjust=PresConstants.HANDLE_IMAGE_SIZE; // size of image
		//var handleAdjust = this.HANDLE_ADJUST;
		var borderSize = dojo.style(node,'borderTopWidth');
		var halfBorderSize = borderSize/2;
		var handleAdjust =  halfBorderSize;  // TO CENTER Handle based on thikness of border
		var boxWidth = (dojo.isIE) ? node.clientWidth : dojo.style(node,'width');
		var boxHeight =(dojo.isIE) ? node.clientHeight :dojo.style(node,'height');
		var boxId = dojo.attr(node,"boxid");
		boxId = boxId.substring(boxId.indexOf('_')+1, boxId.length);
		for (var i=0; i<handles.length; i++){
		   var handle = handles[i];
		   if (handle.id=='tl_'+boxId) {
				dojo.style(handle,{
					'position':'absolute',
					'top':(-borderSize -((imgSizeAdjust/2)-(handleAdjust)))+'px',
					'left':(-borderSize -((imgSizeAdjust/2)-(handleAdjust)))+'px'
				});
				
				
		   } else if (handle.id=='tr_'+boxId){
				dojo.style(handle,{
					'position':'absolute',
					'top':(-borderSize -((imgSizeAdjust/2)-(handleAdjust)))+'px',
					'left':(boxWidth -((imgSizeAdjust/2)-(handleAdjust)))+'px'
				});
				
		   } else if (handle.id=='tm_'+boxId){
				dojo.style(handle,{
					'position':'absolute',
					'top':(-borderSize -((imgSizeAdjust/2)-(handleAdjust)))+'px',
					'left':((boxWidth/2)-(imgSizeAdjust/2))+'px'
				});
				
			} else if (handle.id=='ml_'+boxId){
						dojo.style(handle,{
							'position':'absolute',
							'top':((boxHeight/2)-(imgSizeAdjust/2))+'px',
							'left':(-borderSize -((imgSizeAdjust/2)-(handleAdjust)))+'px'
						});
				
			} else if (handle.id=='mr_'+boxId){
						dojo.style(handle,{
							'position':'absolute',
							'top':((boxHeight/2)-(imgSizeAdjust/2))+'px',
							'left':(boxWidth -((imgSizeAdjust/2)-(handleAdjust)))+'px'
						});
				
			} else if (handle.id=='bl_'+boxId){
						dojo.style(handle,{
							'position':'absolute',
							'top':(boxHeight -((imgSizeAdjust/2)-(handleAdjust)))+'px',
							'left':(-borderSize -((imgSizeAdjust/2)-(handleAdjust)))+'px'
						});
				
			} else if (handle.id=='bm_'+boxId){
						dojo.style(handle,{
							'position':'absolute',
							'top':(boxHeight -((imgSizeAdjust/2)-(handleAdjust)))+'px',
							'left':((boxWidth/2)-(imgSizeAdjust/2))+'px'
						});
				
			} else if (handle.id=='br_'+boxId){
						dojo.style(handle,{
							'position':'absolute',
							'top':(boxHeight -((imgSizeAdjust/2)-(handleAdjust)))+'px',
							'left':(boxWidth -((imgSizeAdjust/2)-(handleAdjust)))+'px'
						});
				
			}
		 
		   handle = null;
		}
		// Let's update comment icon
		if(this.hasComments()){
			this.updateCommentIconPosition();
		}
		//Let's also update resizing the CKEditor
		if(resizeContent){
			//TODO, refine, set userResized as true here is very inappropriate, 'cause drag draw fame is not equal to resizing, but still need to reset handler.
			//so far, still keep it here since the impact is very big, too much references of this function. And, a lot of "endMerge" will be wrongly send out.
			this.userResized =true;
			this.updateEditSizeToFitMainContainer();
		}
		
		if ((this.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE) && (this.isEditModeOn())){
			this.updateTableSize();
		}
		container = null;
		node = null;
		handles = null;
	},
	
	//
	// Get Data Margin of element(s) within contentBoxDataNode
	//
	getDataMargin : function(){
		var margin = 0;
		var marginTop = 0;
		var marginBottom =0;
		
		if (this.contentBoxType!= PresConstants.CONTENTBOX_IMAGE_TYPE){
			marginTop = (this.contentBoxDataNode.firstElementChild) ? dojo.style(this.contentBoxDataNode.firstElementChild,'marginTop'): 0;
			marginBottom = (this.contentBoxDataNode.lastElementChild)? dojo.style(this.contentBoxDataNode.lastElementChild,'marginBottom'): 0;
			margin = marginTop + marginBottom;
		} else{
			margin =0;
		}
		//console.log("contentBox : getDataMargin","marginTop + marginBottom = margin "+marginTop +" + "+ marginBottom +" = "+ margin);

		if (isNaN(margin))
			margin=0;
		 return margin;
	},

	//
	// Get First child node under the contentData node
	//
	getFirstContentDataChild: function(){
		return null;
	},
	
	
	//This function takes a parent and a child node. If the child node's height exceeds that of its parents
	// then this function returns false. Other wise it returns true. It is designed to detect text spilling
	// outside of the boxContainer borders
	checkResizeHeightLimits: function(){
		//return true;
		var totalDataHeight = this.getDataTotalHeight();
		if (this.contentBoxType==PresConstants.CONTENTBOX_TEXT_TYPE||this.contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE||this.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE){
			 if  (( ((totalDataHeight - parent.offsetHeight) >= 0) ||
			      ((totalDataHeight - parent.offsetHeight) < 0) &&
			      (totalDataHeight - parent.offsetHeight) > -1)) {
					return false;
			}
			return true;
		} else{ //No need to consider images... always return true since image will always fit perfectly within its container (100% w and h)
			return true;
		}
	},
	

	//
	// This function used to change the offsetHeight to the [height]vaule. On IE the style vaule node.style.height doesnt same as node.offsetHeight
	//

	setContentDataSizeforIE: function(node,height){
		dojo.style(node,{
			'height':height+'px'
		});
		var tempH = node.offsetHeight - height;
		if(tempH < 0.5) return;
		var d = 0;
		var i =0;
		var setHeight = height;
		while(node.offsetHeight > height){
			i++;
			setHeight = setHeight - d;
			if(setHeight<0) break;
			dojo.style(node,{
				'height':setHeight+'px'
			});
			d = node.offsetHeight - setHeight;
			if(i>20) break;
		}
	},
	/**
	 * get the width limit during a resize.  
	 * Current size limit values of 20 pixels per column. Chosen as they match closely to PPT and Symphony
	 */
	getContentDataWidthLimitation: function(){
		var tbl = this.contentBoxDataNode;
		var numRows = tbl.rows? tbl.rows.length : 0;
		var numCols = numRows > 0 ? tbl.rows[0].childNodes.length : 1;
		tbl = null;

		var pixelWidthLimit = numCols * 20;
		return pixelWidthLimit;
	},
	/**
	 * get the height limit during a resize.  
	 */
	getContentDataHeightLimitation: function(){
		var limitedHeight = 1;
		var cbd = this.contentBoxDataNode;
		
		var drawFramClasses = dojo.query('.draw_frame_classes', cbd);
        if(drawFramClasses.length == 0)
        	drawFramClasses = dojo.query('.draw_shape_classes', cbd);
        cbd = drawFramClasses[0];
        if(!cbd)return limitedHeight;
		var oldHeight = cbd.style.height;
		cbd.style.height = '1px';
		limitedHeight = cbd.offsetHeight + this.getHeight_adjust(cbd);
		cbd.style.height = oldHeight;	
		return limitedHeight;
	},
	/**
	 * Check to see if the width of the table has reached the size
	 * limit during a resize.  Row height is preserved by the browser
	 * during resizing and won't shrink to a single line but width is
	 * not.
	 * @param posL -- Position of the left of cotentbox object
	 * @param posT -- Position of the top of cotentbox object
	 * @param posH -- Position of the height of cotentbox object
	 * @param posW -- Position of the width of cotentbox object
	 * @param x -- The x value of the cotentbox object
	 * @param y -- The y value of the cotentbox object
	 * @param e -- The event client x,y value of cotentbox object
	 * @param hdlName -- The handle move being made. 
	 */
	resizeFromHandler: function(posL,posT,posH,posW,x,y,e,hdlName){
		if(this.contentBoxType == PresConstants.CONTENTBOX_IMAGE_TYPE)
			var ratio = posW/posH;
			
		var isImageFromShape = this.isImageFromShape();
		if(isImageFromShape && pe.scene.shapeDialog){
			this.shapeMessageDialog(null,e);
			return;
		}
		if(isImageFromShape && !pe.scene.resizableShape)
			return;
		if(this.isEditModeOn()&& !concord.util.browser.isMobile()){
			this.toggleEditMode(false);
		}
		
		// For table in webkit, when resize directly from edit mode
		// a timer is used to swich edit mode as false
		// if edit mode is not set as false actually
		// resize is forbidden for it. Or data lost will happen in coedit mode
		if(this.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE &&
			dojo.isWebKit && this.resizeForbidden)
			return;
		
		var displacementX = e.clientX-x;
		var displacementY = e.clientY-y;
		if (dojo.isIE){
			this.adjustContentDataSize();
		}
		var newT = posT;
		var newL = posL;
		var newH = posH;
		var newW = posW;
		hdlName = hdlName.toLowerCase();
		switch(hdlName){
			case "tl":
				if(this.contentBoxType == PresConstants.CONTENTBOX_IMAGE_TYPE && ratio){
					displacementY = displacementX / ratio;
				}
				
				newT = posT+displacementY;
				newL = posL+displacementX;
				newH = posH-displacementY;
				newW = posW-displacementX;
				break;
			case "tm":
				newT = posT+displacementY;
				newH = posH-displacementY;
				break;
			case "tr":
				newT = posT+displacementY;
				newH = posH-displacementY;
				if(this.contentBoxType == PresConstants.CONTENTBOX_IMAGE_TYPE && ratio){
					newW = ratio * newH;
				}else
					newW = posW+displacementX;
				break;
			case "ml":
				newL = posL+displacementX;
				newW = posW-displacementX;
				break;
			case "mr":
				newW = posW+displacementX;
				break;
			case "bl":
				newL = posL+displacementX;
				newW = posW-displacementX;
				if(this.contentBoxType == PresConstants.CONTENTBOX_IMAGE_TYPE && ratio){
					newH = newW / ratio;
				}else
					newH = posH+displacementY;
				
				break;
			case "bm":
				newH = posH+displacementY;
				break;
			case "br":
				newH = posH+displacementY;
				if(this.contentBoxType == PresConstants.CONTENTBOX_IMAGE_TYPE && ratio){
					newW = ratio * newH;
				}else
					newW = posW+displacementX;
				break;
			default:
				break;
		}
		var displacementX = e.clientX-x;
		var displacementY = e.clientY-y;
		if (dojo.isIE){
			this.adjustContentDataSize();
		}
		
		var pixelWidthLimit = this.getContentDataWidthLimitation();
		if(newW < pixelWidthLimit){
			newW = pixelWidthLimit;
			newL = posL+posW - newW;
		}
		var posB = posT + posH + this.getHeight_adjust();
		if(newH < 20){
			newH = 20;
			newT = posB - 20;			
		}
		
		if(hdlName == 'tl'||hdlName == 'tm'||hdlName == 'tr')
			dojo.style(this.mainNode,{
				'top':this.PxToPercent(newT,'height')+"%"
			});
		if(hdlName == 'tl'||hdlName == 'ml'||hdlName == 'bl')
			dojo.style(this.mainNode,{
				'left':this.PxToPercent(newL,'width')+"%"
			});
		if(hdlName == 'tl'||hdlName == 'tr'||hdlName == 'ml'||hdlName == 'mr'||hdlName == 'bl'||hdlName == 'br')
			dojo.style(this.mainNode,{
				'width':this.PxToPercent(newW,'width')+"%"
			});
		
		if(hdlName != 'ml' && hdlName != 'mr' && newH != posH)
			dojo.style(this.mainNode,{
				'height':this.PxToPercent(newH,'height')+"%"
			});
		if((hdlName == 'ml' || hdlName == 'mr') && this.contentBoxType != PresConstants.CONTENTBOX_TABLE_TYPE)
			dojo.style(this.mainNode,{
				'height':this.PxToPercent(posH,'height')+"%"
			});
		if (dojo.isIE){
			this.adjustContentDataSize();
		}
		if(concord.util.browser.isMobile())
		{
			this.updateCKBodyHeight();
		}
		var contentH = this.getMainNodeHeightBasedOnDataContent();
		if(contentH < 20)
			contentH = 20;
		var newB = newT + contentH + this.getHeight_adjust();
		if(contentH > newH ){
			var tmp = contentH - this.mainNode.offsetHeight;
			newT = newT - (newB - posB); 
			if(hdlName == 'tl'||hdlName == 'tm'||hdlName == 'tr')
			dojo.style(this.mainNode,{
				'top':this.PxToPercent(newT,'height')+"%"
			});
			dojo.style(this.mainNode,{
				'height':this.PxToPercent(contentH,'height')+"%"
			});
		}
		if (this.contentBoxType==PresConstants.CONTENTBOX_TEXT_TYPE|| this.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE){
			var totalDataWidth = this.contentBoxDataNode.childNodes[0].childNodes[0].offsetWidth;
			if(totalDataWidth + this.getWidth_adjust() > this.mainNode.offsetWidth){
				if(hdlName == 'tl'||hdlName == 'tr'||hdlName == 'ml'||hdlName == 'mr'||hdlName == 'bl'||hdlName == 'br')
				dojo.style(this.mainNode,{
					'width':this.PxToPercent(totalDataWidth,'width')+"%"
				});
				if(hdlName == 'tl'||hdlName == 'ml'||hdlName == 'bl')
				dojo.style(this.mainNode,{
					'left':this.PxToPercent(posL+posW - totalDataWidth,'width')+"%"
				});
			}
		}
		if (dojo.isIE){
			this.adjustContentDataSize();
		}
		this.checkMainNodeHeightandUpdate(false);
		if(concord.util.browser.isMobile())
		{
			this.updateCKBodyHeight();
		}
		
		if (this.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE){
			if(hdlName =='ml' || hdlName=='mr')
				PresTableUtil.updateViewDFNodeWithContentHeight(this);
			else {
				this._updatePresRowHeight(true); //update presrowheight for each row
			}
		}
		this.updateHandlePositions(true);
		if(this.editor && this.editor.document){
			PresCKUtil.updateRelativeValue(this.editor.document.getBody().$,[PresConstants.ABS_STYLES.TEXTINDENT,PresConstants.ABS_STYLES.MARGINLEFT]);
		}
		PresCKUtil.updateRelativeValue(this.mainNode,[PresConstants.ABS_STYLES.TEXTINDENT,PresConstants.ABS_STYLES.MARGINLEFT]);
	},
	
	isEditModeOn: function() {
		if (this.editModeOn || this.spr) { //jmtperf
		//13550, if it is a spare (has boxRep property), must be in edit mode return true
			return true;
		} else {
			return false;
		}
	},
	
	//stroy 35054
	isImageFromShape: function(){
		if (this.contentBoxType != PresConstants.CONTENTBOX_IMAGE_TYPE)
		 return false;
	},
	
	//
	// Handle mouse up event. Used to cancel resize on mouse up
	//
	handleOnMouseUpEvent: function(handle,e){
        //console.log('contenBox.handleOnMouseUpEvent','Entry');
		this.checkBoxPosition(this);
		
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
	
	//
	// Makes contentBox resizeable inside the parentContainerNode
	//
	makeResizeable: function(){
		//console.log("contentBox:makeResizeable","Entry");
		//Show border and handles on click
		
		//Let's add resizeable squares Total 8

		//Top Left corner
		var tl = document.createElement('img');
		tl.id = 'tl_'+this.boxUID;
		dojo.addClass(tl,'tl handle');
		tl.src=PresConstants.HANDLE_IMAGE_SRC;
		tl.setAttribute('alt', '');

		this.mainNode.appendChild(tl);
		var styleForHandleImage = {
			'position':'absolute',
			'width':PresConstants.HANDLE_IMAGE_SIZE + 'px',
			'height':PresConstants.HANDLE_IMAGE_SIZE + 'px',
			'border':'none'
		};
		dojo.style(tl, styleForHandleImage);
		dojo.style(tl,{
			'cursor':'nw-resize'
		});

		//Top Right corner
		var tr = document.createElement('img');
		tr.id = 'tr_'+this.boxUID;
		dojo.addClass(tr,'tr handle');
		tr.src=PresConstants.HANDLE_IMAGE_SRC;
		tr.setAttribute('alt', '');

		this.mainNode.appendChild(tr);
		dojo.style(tr, styleForHandleImage);
		dojo.style(tr,{
			'cursor':'ne-resize'
		});

		//Top middle
		var tm = document.createElement('img');
		tm.id = 'tm_'+this.boxUID;
		dojo.addClass(tm,'tm handle');
		// TODO: may also add for others
		// for speaker notes, it has own HANDLE_IMAGE_SRC
		tm.src= this.HANDLE_IMAGE_SRC || PresConstants.HANDLE_IMAGE_SRC;
		tm.setAttribute('alt', '');

		this.mainNode.appendChild(tm);
		dojo.style(tm, styleForHandleImage);
		dojo.style(tm,{
			'cursor':'n-resize'
		});

		//Middle Left
		var ml = document.createElement('img');
		ml.id = 'ml_'+this.boxUID;
		dojo.addClass(ml,'ml handle');
		ml.src=PresConstants.HANDLE_IMAGE_SRC;
		ml.setAttribute('alt', '');

		this.mainNode.appendChild(ml);
		dojo.style(ml, styleForHandleImage);
		dojo.style(ml,{
			'cursor':'w-resize'
		});

		//Middle Right
		var mr = document.createElement('img');
		mr.id = 'mr_'+this.boxUID;
		dojo.addClass(mr,'mr handle');
		mr.src=PresConstants.HANDLE_IMAGE_SRC;
		mr.setAttribute('alt', '');

		this.mainNode.appendChild(mr);
		dojo.style(mr, styleForHandleImage);
		dojo.style(mr,{
			'cursor':'e-resize'
		});

		//Bottom Left corner
		var bl = document.createElement('img');
		bl.id = 'bl_'+this.boxUID;
		dojo.addClass(bl,'bl handle');
		bl.src=PresConstants.HANDLE_IMAGE_SRC;
		bl.setAttribute('alt', '');

		this.mainNode.appendChild(bl);
		dojo.style(bl, styleForHandleImage);
		dojo.style(bl,{
			'cursor':'sw-resize'
		});

		//Bottom Right corner
		var br = document.createElement('img');
		br.id = 'br_'+this.boxUID;
		dojo.addClass(br,'br handle');
		br.src=PresConstants.HANDLE_IMAGE_SRC;
		br.setAttribute('alt', '');

		this.mainNode.appendChild(br);
		dojo.style(br, styleForHandleImage);
		dojo.style(br,{
			'cursor':'se-resize'
		});

		//Bottom middle
		var bm = document.createElement('img');
		bm.id = 'bm_'+this.boxUID;
		dojo.addClass(bm,'bm handle');
		bm.src=PresConstants.HANDLE_IMAGE_SRC;
		bm.setAttribute('alt', '');

		this.mainNode.appendChild(bm);
		dojo.style(bm, styleForHandleImage);
		dojo.style(bm,{
			'cursor':'s-resize'
		});

		var resizeContent = false;
		this.updateHandlePositions(resizeContent);
		this.hideHandles();
		tl = null;
		tr = null;
		tm = null;
		ml = null;
		mr = null;
		bl = null;
		br = null;
		bm = null;
		//console.log("contentBox:makeResizeable","Exit");
	},

	loadCss: function() {
		var totalClassArr = PresCKUtil.getAllClassesStr(this.mainNode);
		var resultCssStr = this.getCssStrFromClass(totalClassArr);
		if (resultCssStr) {
			concord.util.uri.prependStyleNode(null, resultCssStr, this.editor.document.$);
		}
	},

	getCssStrFromClass: function(totalClassArr) {
		var resultCssStr = '';
		var externalCssStr = this.loadExternalCss(totalClassArr);
		if (externalCssStr) {
			resultCssStr += externalCssStr;
		}

		var internalCssStr = this.loadInternalCss(totalClassArr);
		if (internalCssStr) {
			resultCssStr += internalCssStr;
		}
		return resultCssStr;
	},

	loadExternalCss: function(totalClassArr) {
		var autoCssMap =
			window.pe.scene.slideSorter.officeAutomaticStylesMap;
		var cssMap = window.pe.scene.slideSorter.officeStylesMap;
		if (!autoCssMap || !cssMap)
			return;

		var spliceIndex = [];
		var resultCssArr = [], resultCssMap = {};
		for (var i = 0, classArrLen = totalClassArr.length; i < classArrLen; ++i) {
			var classStr = totalClassArr[i];
			if (classStr.indexOf('draw_') == -1
				// && classStr.indexOf('standard_') == -1
				&& classStr.indexOf('text_') == -1
				&& classStr.indexOf('space') == -1
				&& classStr.indexOf('cke_') == -1
				&& classStr.indexOf('contentBox') == -1
				&& classStr.indexOf('hideInIE') == -1
				&& classStr.length) {
				if (resultCssMap.hasOwnProperty(classStr)) {
					spliceIndex.push(i);
					continue;
				}

				resultCssMap[classStr] = 1;
				var key = '.' + classStr;
				var value = null;
				var toSplice = false;
				if (key.indexOf('ML') != -1
					|| key.indexOf('MP') != -1
					|| key.indexOf('MT') != -1) {
					for (var j = 1; j < 10; ++j) {
						key = key.slice(0, -1) + j;
						value = cssMap[key];
						if (typeof value !== 'undefined') {
							resultCssArr.push(value);
							resultCssMap[key.substring(1)] = 1;
							toSplice = true;
						}
					}
				} else {
					value = cssMap[key];
					if (typeof value == 'undefined') value = autoCssMap[key];
					if (typeof value !== 'undefined') {
						resultCssArr.push(value);
						toSplice = true;
					}
				}

				if (toSplice)
					spliceIndex.push(i);
			}
		} // end of for loop

		for (var i = 0, len = spliceIndex.length; i < len; ++i) {
			totalClassArr.splice(spliceIndex[i]-i, 1);
		}

		var resultCssStr = PresCKUtil.getCssStrFromCssArr(resultCssArr);
		return resultCssStr;
	},

	loadInternalCss: function(totalClassArr) {
		var internalCssMap = window.pe.scene.slideSorter.internalCssMap;
		if (!internalCssMap)
			return;

		var resultCssArr = [], resultCssMap = {};
		// resultCssArr.push('.draw_frame_classes ul:first-child>li:first-child {margin-top:0px !important;}');
		// resultCssArr.push('.draw_frame_classes ol:first-child>li:first-child {margin-top:0px !important;}');
		// resultCssArr.push('.draw_frame_classes p:first-child {margin-top:0px !important;}');
		// resultCssArr.push('.draw_shape_classes ul:first-child>li:first-child {margin-top:0px !important;}');
		// resultCssArr.push('.draw_shape_classes ol:first-child>li:first-child {margin-top:0px !important;}');
		// resultCssArr.push('.draw_shape_classes p:first-child {margin-top:0px !important;}');
		// resultCssArr.push('.table_table-cell ul:first-child>li:first-child {margin-top:0px !important;}');
		// resultCssArr.push('.table_table-cell ol:first-child>li:first-child {margin-top:0px !important;}');
		// resultCssArr.push('.table_table-cell p:first-child {margin-top:0px !important;}');

		var tdCellPrefix = 'td.table_table-cell.';
		var thCellPrefix = 'th.table_table-cell.';
		var spliceIndex = [];
		for (var i = 0, classArrLen = totalClassArr.length; i < classArrLen; ++i) {
			var classStr = totalClassArr[i];
			if ((classStr.indexOf('td_id') === 0 || classStr.indexOf('ce') === 0 || classStr.indexOf('T') === 0)
				&& !resultCssMap.hasOwnProperty(classStr)) {
				resultCssMap[classStr] = 1;
				var key = tdCellPrefix + classStr;
				var value = internalCssMap[key];
				if (typeof value === 'undefined') {
					key = thCellPrefix + classStr;
					value = internalCssMap[key];
				}
				if (typeof value === 'undefined') {
					key = '.' + classStr;
					value = internalCssMap[key];
				}
				if (typeof value !== 'undefined') {
					resultCssArr.push(value);
					resultCssMap[key] = 1;
					toSplice = true;
				}
			} else if (classStr.indexOf('standard_') == -1
				&& classStr.indexOf('text_') == -1
				&& classStr.indexOf('space') == -1
				&& classStr.indexOf('cke_') == -1
				&& classStr.indexOf('contentBox') == -1
				&& classStr.indexOf('hideInIE') == -1
				&& classStr.length) {
				if (resultCssMap.hasOwnProperty(classStr)) {
					spliceIndex.push(i);
					continue;
				}

				resultCssMap[classStr] = 1;
				var key = '.' + classStr;
				var value = null;
				var toSplice = false;
				if (key.indexOf('ML') != -1
					// || key.indexOf('IL') != -1 // go to else
					// || key.indexOf('lst') != -1 // go to else
					|| key.indexOf('MP') != -1
					|| key.indexOf('MT') != -1) {
					for (var j = 1; j < 10; ++j) {
						key = key.slice(0, -1) + j;
						value = internalCssMap[key];
						if (typeof value !== 'undefined') {
							resultCssArr.push(value);
							resultCssMap[key.substring(1)] = 1;
							toSplice = true;
						}
					}
				} else {
					value = internalCssMap[key];
					if (typeof value !== 'undefined') {
						resultCssArr.push(value);
						toSplice = true;
					}
				}
				if (toSplice)
					spliceIndex.push(i);
			} // end of if (classStr.indexOf('standard_') == -1
		} // end of for loop

		for (var i = 0, len = spliceIndex.length; i < len; ++i) {
			totalClassArr.splice(spliceIndex[i]-i, 1);
		}

		var resultCssStr = PresCKUtil.getCssStrFromCssArr(resultCssArr);
		return resultCssStr;
	},


	//
	// Go in and out of edit mode by hiding/showing editor instead of destroying and recreating editor
	//	
	toggleEditMode: function(onOff,fromUndoRedo){ //D15602 - Need to know if from undo Redo	
		if(!onOff) {
			try {
				PresCKUtil.runKeyUpBackUp(this.editor,true);
			} catch(e) {
				console.log(e);
			}
		}

		window.pe.scene.lockPark = false;
		if (!this.boxReady) return;	
		if (this.spr && window.pe.scene.slideEditor.SINGLE_CK_MODE){  //jmtperf
			this.spr.toggleEditMode(onOff);
			return;
		}

		if (this.editor){
		    delete this.editor.lastEditCellID;
			var cKbody = this.editor.document.$.body;
			//First let's see if onOff is same as this.editModeOn
			//If so let's exit and not do anything
			if (onOff!=null && onOff== false &&  onOff == this.isEditModeOn()){ // Current state same as requested state.
				return;
			} 				
			this.editModeOn = onOff || !this.isEditModeOn();
			var editorNode  = dojo.byId('cke_'+this.getEditorName());
			if (this.isEditModeOn()){ // if true turn edit mode on	
				//D17468 - ensure that prevent synch is reset to false when entering edit mode.
				this.preventSynch = false;
				if (this.boxRep){
					this.boxRep.preventSynch = false;
				}

				cKbody.contentEditable = true;

				if (cKbody.parentNode) {
					cKbody.parentNode.contentEditable = false;
				}

				//Defects 20000 and 20001 when in edit mode for an shape_svg the body tag needs to have the slideEditor class
				if (dojo.hasClass(this.mainNode.parentNode.parentNode,"shape_svg")) {
					dojo.addClass(cKbody,"slideEditor");
				}
				// #32388 Safari's fontSize maybe not a integer, and will be different with the value: dojo.style(x,'fontSize')
				cKbody.style.fontSize = dojo.isWebKit ? window.pe.scene.slideEditor.mainNode.style.fontSize : dojo.style(this.mainNode,'fontSize');
				this.updateEditSizeToFitMainContainer();
				if (this.contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE) {
					this.mainNode.style.overflowY = "hidden";
					if (dojo.isWebKit) {
					    this.mainNode.scrollTop = 0;
					}
					// add marker class to activate styles specific to speaker notes
					dojo.addClass(cKbody, 'notes_tweaks');
				}
				// temporarily increase z-index when entering edit mode
				if (dojo.hasClass(this.mainNode, 'g_draw_frame')) {
					// find the draw_frame if grouped content box
					var df = this.mainNode;
					if(df!=null){
						while(df){
							if ((df) && (dojo.hasClass(df,'draw_frame'))){
								break;
							} else if (df.tagName.toLowerCase()=='body'){
								df=null;
								break;
							}
							df = df.parentNode;
						}
					}
					df.origZ = parseInt(df.style.zIndex);
					window.pe.scene.slideEditor.maxZindex += 5;
					dojo.style(df,{
							'zIndex':window.pe.scene.slideEditor.maxZindex
					});
					df = null;
				} else {
					this.origZ = parseInt(this.mainNode.style.zIndex);
					window.pe.scene.slideEditor.maxZindex += 5;
					dojo.style(this.mainNode,{
							'zIndex':window.pe.scene.slideEditor.maxZindex
					});
						
					// Do not publish the new zindex to the slide sorter if an edit is
					// being made.  If, in the future, we want to show the edit effect in
					// the slide sorter, can uncomment and update accordginly.  For now to
					// reduce the amount of traffic and messages, do not do a publish.
					/*if (!dojo.hasClass(this.mainNode,'newbox')){	// don't publish if newbox
						this.publishBoxAttrChanged(null, null, true);
					}*/
					//console.log("(editMode0) origZ --> " + this.origZ + ", zIndex --> " + (tmpZ+5));
				}
				this.editor.forceNextSelectionCheck();
				this.updateCKBodyHeight();
				if ( this.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE){
					dojo.query('td,th',cKbody).forEach(function(td){
		 				dojo.style(td,'overflow','hidden');
		 			});
					if(dojo.isIE){
						var viewTableH = this.contentBoxDataNode.style.height; //in px
						dojo.style(cKbody, 'height', viewTableH);
					}
					this.updateEditModeTableRowHeights();
					if (dojo.isIE) this.adjustContentDataSize();
					this.updateCKBodyWidth();
					if(dojo.isWebKit)
					// for 33531, not sure why the focus not good.
						this.mainNode.tabIndex=-1;
				}
				
				!concord.util.browser.isMobile() && this.processEditorOpen();
				
				dojo.style(this.mainNode.firstElementChild,{
					'display':'none',
					'visibility':'hidden'
				});
				dojo.style(this.contentBoxDataNode,{
					'display':'none',
					'visibility':'hidden'
				});
				if(editorNode!=null){
					//
					//D16632 - Workaround for mysterious IE patch problem which causes IE9 to crash when ifram is hidden on exiting edit mode.
					//d25437,[IE10]Resize pasted textbox display a  redundant textbox 					
					if (dojo.isIE > 8 && dojo.isIE!=10) {
						dojo.style(editorNode,{
							'display':'',
							'visibility':'visible',
							'opacity':'1',
							'zIndex':''
						});
					}else{
						dojo.style(editorNode,{
							'display':'',
							'visibility':'visible'												
						});						
					}
					if (this.isBidi && (this.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE) && this.boxRep){
						var tblDir = dojo.style(this.boxRep.contentBoxDataNode,"direction");
						var queryStr = ".smartTable[id*=\'"+ this.contentBoxDataNode.id + "\']";
						dojo.query(queryStr).forEach(function(node, index){
							dojo.style(node, "direction",dojo.style(this.boxRep.contentBoxDataNode,"direction"));
						},this);
						if (this.editor && this.editor.document && this.editor.document.$){
							dojo.style(cKbody, 'direction', dojo.style(this.boxRep.contentBoxDataNode,"direction"));
							if (this.editor.document.$.body.firstChild)
								dojo.style(cKbody.firstChild, 'direction', dojo.style(this.boxRep.contentBoxDataNode,"direction"));
						}
					}
						
				}
				// set iframe title to be our wai-aria role so JAWS announces it when we go into edit mode
				var a11ySTRINGS = dojo.i18n.getLocalization("concord.util","a11y");
				var iframeBodyLabel = a11ySTRINGS.aria_textbox;
				
				var iframeNode = dojo.query("iframe",this.mainNode)[0];
				if (this.contentBoxType==PresConstants.CONTENTBOX_IMAGE_TYPE) {
					// currently can't edit an image or shape, so nothing to do (yet)
				}
				else 
				{
					if (this.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE) {
						iframeBodyLabel = a11ySTRINGS.aria_table;
					}
					else {
						var presClass = dojo.attr(this.mainNode, "presentation_class");			
						if (presClass) {
							if (presClass == 'title') 
								iframeBodyLabel = a11ySTRINGS.aria_slide_title;
							else if (presClass == 'subtitle') 
								iframeBodyLabel = a11ySTRINGS.aria_slide_subtitle;
							else if (presClass == 'notes') 
								iframeBodyLabel = a11ySTRINGS.aria_presentation_notes;
							else if (presClass == 'outline') 
								iframeBodyLabel = a11ySTRINGS.aria_outline;
							else  {
								// normal textbox
							}
						}
					}
				}

				//Make CK background transparent
				var cke_content = dojo.query("#cke_contents_"+this.getEditorName(),this.mainNode)[0];
				dojo.style(cke_content,{
					'backgroundColor': 'transparent',
					'overflow': 'auto'   // story 44406 (FF6 support) - get rid of unnecessary scrollbars
				});
				// Make body transparent
				dojo.style(cKbody,{
					'backgroundColor': 'transparent',
					'backgroundImage': 'none',
					'filter':'none'
				});

				this.loadCss();

				dojo.attr(iframeNode,'title',a11ySTRINGS.aria_iframe_edit);	
                //dijit.setWaiRole(body, 'application');
                dijit.setWaiState(cKbody, 'label', iframeBodyLabel);
				
				//if IE let's try to remove contenteditable selection box and handles
				if (dojo.isIE){
					var drawClassFrames = null;
					if (dojo.hasClass(this.mainNode, 'g_draw_frame')) {
						drawClassFrames = dojo.query(".draw_shape_classes", cKbody)[0];
					} else {
						drawClassFrames = dojo.query(".draw_frame_classes", cKbody)[0];
					}
					if(drawClassFrames){
						// disabled the fix for defect 7892 due to regression side effects
						// dojo.attr(drawClassFrames.parentNode.parentNode, 'contentEditable', 'false');
						dojo.attr(drawClassFrames.parentNode, 'contentEditable', 'false');
						dojo.attr(drawClassFrames, 'contentEditable', 'true');
				   }
				} else if (dojo.isFF ){
					// CK3621 need this for FF move cursor on first editing
					// fix for defect 7179
		    		dojo.attr(cKbody,'contenteditable','false');
		    		dojo.attr(cKbody,'contenteditable','true');
				}
				
				//Add cursor to editor
				if (!dojo.hasClass(this.mainNode, 'isSpare')) {
					concord.util.presToolbarMgr.setFocusSorterTb(this.getEditorName());
				} else {
					concord.util.presToolbarMgr.setFocusSorterTb();
				}
				//21582 - do not enable menu item if it is a spare content box
				if (!dojo.hasClass(this.mainNode, 'isSpare')) {
					this.enableMenuItemsOnEdit();
				}
				//this.editor.focusManager.focus(); // make sure we focus on the right editor D45021 for toolbar
				if(dojo.isMoz){// disable table tools for Moz
					try { this.editor.document.$.execCommand( 'enableInlineTableEditing', false,false ); } catch(e) {
						//console.log(e);
						}
					try { this.editor.document.$.execCommand( 'enableObjectResizing', false,false ); } catch(e) {
						//console.log(e);
						}
				}
				window.pe.scene.slideEditor.closeAllNonModalDialog();
				//D25367: [IE]Need click twice to exit textbox edit mode
				if (dojo.isIE){
					setTimeout(dojo.hitch(this, function(){
						pe.scene.slideEditor.boxSelectorUsed = false;
					}),100);
				}
			} else{
				if (this.editor){ //D7279 
					this.editor.prevPostSnapShot = null;
				}
				  this.keyStrokeChecker = null;
				  if (this.contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE) {
					var drawFrame = dojo.query(".draw_frame_classes",this.editor.document.$.body)[0];
					if (drawFrame) {
						dojo.style(drawFrame.parentNode, "width", "100%");
						dojo.style(drawFrame.parentNode, "paddingRight", "0px");
						dojo.style(drawFrame, "paddingRight", "0px");
						dojo.style(drawFrame, "paddingTop", "0px");
						dojo.style(drawFrame, "paddingLeft", "0px");
						//make sure that lists have relative positioning
						dojo.query("ol,ul", drawFrame).forEach(function(node, index, arr){
    						if (node.style.position == "") {
    							node.style.position = "relative";
    						}
    					});
					}
				  	this.mainNode.style.overflowY = "hidden";
				  	if (dojo.isWebKit) {
				  	    this.mainNode.scrollTop = 0;
				  	}
				  }
				 //D32312: [IE10] Mouse cursor show at top-left corner of slide after exit edit mode of object.
				  cKbody.contentEditable = false;
				  var ckBodyH = cKbody.style.height;
				  if (dojo.isIE){
						var drawClassFrames = null;
						if (this.editor.document) {
							
							if (dojo.hasClass(this.mainNode, 'g_draw_frame')) {
								drawClassFrames = dojo.query(".draw_shape_classes", cKbody)[0];
							} else {
								drawClassFrames = dojo.query(".draw_frame_classes", cKbody)[0];
							}
						}
						if(drawClassFrames){
							dojo.removeAttr(drawClassFrames.parentNode, 'contentEditable'); //, 'false');
							dojo.removeAttr(drawClassFrames, 'contentEditable'); // , 'true');
					   }
					}
					if (this.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE && this.editor && this.editor.document){
				   	  	dojo.query('.selectedSTCell',cKbody).removeClass('selectedSTCell');
				   	  	dojo.query('td,th',cKbody).forEach(function(td){
			 				dojo.style(td,'overflow','');
			 		  	});
			    	}
					//Hide Editor: hide span which contains the iframe node
					if(editorNode!=null){
						//
						//D16632 - Workaround for mysterious IE patch problem which causes IE9 to crash when ifram is hidden on exiting edit mode.
						////d25437,[IE10]Resize pasted textbox display a  redundant textbox 						
						if (dojo.isIE >8 && dojo.isIE!=10) {
							dojo.style(editorNode,{
								'opacity':'0',
								'height':'0px',
								'width':'0px',
								'zIndex':'-100'
							});
							dojo.style(cKbody,{ // also need to set the body height to 0
								'height':'0px'
							});
						} else{						
							dojo.style(editorNode,{
								'display':'none',
								'visibility':'hidden'
							});
						}
					}
					
					dojo.style(this.contentBoxDataNode,{
						'display':'',
						'visibility':'visible'
					});
						
					// returns z-index to the original value when exiting edit mode
					if (dojo.hasClass(this.mainNode, 'g_draw_frame')) {
						// find the draw_frame if grouped content box
						var df = this.mainNode;
						if(df!=null){
							while(df){
								if ((df) && (dojo.hasClass(df,'draw_frame'))){
									break;
								} else if (df.tagName.toLowerCase()=='body'){
									df=null;
									break;
								}
								df = df.parentNode;
							}
						}
						if (df!=null && df.origZ != null) {
							dojo.style(df,{
								'zIndex':df.origZ
							});
							df.origZ = null;
						}
						df = null;
					} else {
						// Set the original zindex after edit is complete.  This used to use
						// setzIndexCtr but that is in the scope of the editor and not each
						// individual content box.
						dojo.style(this.mainNode,{
							'zIndex':this.origZ ? this.origZ : this.mainNode.style.zIndex
						});
						
						// Publish the original zindex out to the slide sorter to remain
						// consistent with the editor.
						if (!dojo.hasClass(this.mainNode,'isSpare')){	// don't publish if spare content box
							var addToUndo = false;
							this.publishBoxAttrChanged(null, null, false,addToUndo); //Coedit flag now set to false to handle D6162
						}
						
						if (this.origZ) this.origZ = null;
					}
					this.synchDataWhileCloseEditMode();
					
					if(dojo.isIE && (this.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE)){
						//update contentboxdatanode for table with ckbody height
						dojo.style(this.contentBoxDataNode, "height", ckBodyH);
					}
					
					//Defect 12240
					if (dojo.isIE == 9) {
						var hasOrderedlists = dojo.query( 'ol', this.mainNode );
						if (hasOrderedlists.length>0) {
							dojo.style(this.mainNode,{
								'display':'none',
								'visibility':'hidden'
							});
							dojo.style(this.mainNode,{
								'display':'',
								'visibility':'visible'
							});
						}
					}
					this.disableMenuItemsOnNonEdit();
					// clean br on exiting
					if(this.contentBoxType==PresConstants.CONTENTBOX_TEXT_TYPE || this.contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE){
						var child = this.editor.document.getBody().getChild(0);
						//D17295 make sure notes does not have a br as the first child of the editor body
						if (this.contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE && child.$.nodeType == CKEDITOR.NODE_ELEMENT && child.is && child.is('br')) {
							child.remove();
							child = this.editor.document.getBody().getChild(0);
						}
						//D17295 make sure notes does not have a br as the first child of the contentBoxDataNode
						if (this.contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE && this.contentBoxDataNode.firstChild && this.contentBoxDataNode.firstChild.nodeName.toLowerCase() == 'br') {
							dojo.destroy(this.contentBoxDataNode.firstChild);
						}
						child.$.normalize();
						this.removeMozBRs(child.$);
						child = null;
						//D17295 make sure notes is deselected after exiting edit mode
						if (this.contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE) {
							this.deSelectThisBox();
						}
					}
					!concord.util.browser.isMobile() && this.processEditorClose(fromUndoRedo); //D15602 Need to know if from undoRedo
					if (dojo.isIE || dojo.isWebKit){//D8517 Need to adjust canvas if box is i
						//D17817 make sure the slideEditor.mainNode exists
		        		if (pe.scene.slideEditor.mainNode && pe.scene.slideEditor.mainNode.parentNode.scrollTop>0){
		        			pe.scene.slideEditor.mainNode.parentNode.scrollTop=0;
		        		}
					}
					if(dojo.isSafari && !concord.util.browser.isMobile())
						pe.scene.clipboard.focusClipboardContainer();
			}
			this.publishBoxEditMode();
		} else {
			this.disableMenuItemsOnNonEdit();
			if(dojo.isSafari && !concord.util.browser.isMobile())
				pe.scene.clipboard.focusClipboardContainer();
		}
	},
	//only do this for table.
	checkMainNodeHeightandUpdate: function(updateHandler){

	},
	//
	// remove br _moz_dirty
	//
	removeMozBRs: function(node){
		// text nodes can't be queried via dojo.query
		if (node.nodeType == CKEDITOR.NODE_TEXT)
			return;
		
		var mozBRs = dojo.query("br",node);
		for (var i=0; i<mozBRs.length; i++){
		 if ((mozBRs[i].nextSibling == null) && mozBRs[i].hasAttribute('_moz_dirty'))	{	// only delete the last one
			 dojo.destroy(mozBRs[i]);
		 }
		}
	},

	//
	// getHeightOnCKEdit
	//
	getHeightOnCKEdit: function(modify){
		var heightVal = null;
		if (!dojo.isIE){
			heightVal = this.mainNode.offsetHeight - this.getHeight_adjust()+'px';
		} else{
			var heightPlusPadding = this.PercentToPx(this.mainNode.style.height,'height');
			heightVal = heightPlusPadding +"px";
			//console.log("contentBox:getHeightOnCKEdit  -  this.mainNode.style.height - for CKE???: ",heightVal);
			//set height to equivalent px to prevent from flashing
			//if(modify) this.mainNode.style.height = heightPlusPadding + this.getHeight_adjust()+'px';
		}
		return heightVal;
	},
		
	//
	// getWidthOnCKEdit
	//
	getWidthOnCKEdit: function(modify){
		var widthVal = null;
		if (!dojo.isIE){
			widthVal = this.mainNode.offsetWidth - this.getWidth_adjust()+'px';
		} else{
			var widthPlusPadding = this.PercentToPx(this.mainNode.style.width,'width');
			widthVal = widthPlusPadding +"px";
            //console.log("contentBox:getHeightOnCKEdit  -  this.mainNode.style.width - for CKE???: ",widthVal);
			//set width to equivalent px to prevent from flashing
			//if(modify) this.mainNode.style.width = widthPlusPadding + this.getWidth_adjust()+'px';
		}
		return widthVal;
	},
	
	_updateSvgFill: function(sprDataNode, rectNode) {
		if (!sprDataNode || !rectNode)
			return;
		// Get change fill attrs
		var nodeRect = dojo.query('rect,circle', sprDataNode);
		if (nodeRect.length > 0){
			var svgRect = nodeRect[0];
			var newFillColor = dojo.attr(svgRect, "fill");
			var newFillOpacity = dojo.attr(svgRect, "fill-opacity");
			var newFillChanged = dojo.attr(svgRect, "data-fill-chg");
		}
		// update fill and fill opacity
		if (newFillColor)
			rectNode.setAttribute('fill', newFillColor);
		else
			rectNode.removeAttribute('fill');
		// update fill and fill opacity
		if (newFillOpacity)
			rectNode.setAttribute('fill-opacity', newFillOpacity);
		else
			rectNode.removeAttribute('fill-opacity');
		// update fill and fill opacity
		if (newFillChanged)
			rectNode.setAttribute('data-fill-chg', newFillChanged);
		else
			rectNode.removeAttribute('data-fill-chg');
	},
	
	_updateSvgGrpLineFill: function(sprDataNode, id, lineNode, key) {
		if (!sprDataNode || !lineNode || !id)
			return;
		// Get change fill attrs
		var nodeLine = sprDataNode.getElementById(id);
		if (nodeLine){
			var newColor = dojo.attr(nodeLine, key);
			var newOpacity = dojo.attr(nodeLine, key + '-opacity');
			var newChanged = dojo.attr(nodeLine, 'data-' + key + '-chg');
		}
		// update fill and fill opacity
		if (newColor)
			lineNode.setAttribute(key, newColor);
		else
			lineNode.removeAttribute(key);
		// update fill and fill opacity
		if (newOpacity)
			lineNode.setAttribute(key + '-opacity', newOpacity);
		else
			lineNode.removeAttribute(key + '-opacity');
		// update fill and fill opacity
		if (newChanged)
			lineNode.setAttribute('data-' + key + '-chg', newChanged);
		else
			lineNode.removeAttribute('data-' + key + '-chg');
	},
	
	
	//
	// Remove spare from contentBox
	//
	unLoadSpare: function(){
		//console.log("Unloading spare.... ENTRY");
		try{
			//0- before unloading check pending changes
//			this.spr.chkPendingChanges(true);
			PresCKUtil.runPending(this.spr.editor);
		} catch(e){	
			console.log("Error while unloading spare 0....PresCKUtil.runPending");
		}
		
		var drawFrameNode = this.mainNode;
		var drawFrameContentBoxObj = this;
		var sprContentBoxObj = this.spr;
		//13550
		var isGDrawFrame = false;
		var curTime = new Date().getTime();
		
		try {
			//1- copy content from spare back to this
			if(this.contentBoxType ==PresConstants.CONTENTBOX_TABLE_TYPE){
				//13550
				if(this.spr.contentBoxDataNode!=null && this.spr.contentBoxDataNode.firstChild!=null){
					var contentHtml = "";
					//TODO this if condition won't meet at any time
					if(this.spr.contentBoxDataNode.firstChild.tagName!=null && this.spr.contentBoxDataNode.firstChild.tagName.toLowerCase() == "table"){
						contentHtml = this.spr.contentBoxDataNode.firstChild.innerHTML; //get the tbody
					}else{ //this means child of contentBoxDataNode should be tbody already
						contentHtml = this.spr.contentBoxDataNode.innerHTML;
					}
					//Copy changed table content back to view mode table node
					if (dojo.isIE){
						this.mainNode.firstElementChild = PresCKUtil.insertTableContentForIE(document, this.mainNode.firstElementChild, contentHtml);
					} else{
						this.mainNode.firstElementChild.innerHTML = contentHtml;
					}
					this.contentBoxDataNode = this.mainNode.firstElementChild;					
				}
			}else if(this.contentBoxType ==PresConstants.CONTENTBOX_GROUP_TYPE){
	        	//copy the text content box
	        	var txtContentBox = drawFrameContentBoxObj.txtContent;
	        	var sprTxtContentBox = sprContentBoxObj.txtContent;        	
	        	if(dojo.isIE){
	        		var tmpHtml = PresCKUtil.insertHTMLForIE(this.spr.editor, sprTxtContentBox.contentBoxDataNode.innerHTML);
	        		txtContentBox.contentBoxDataNode.innerHTML = tmpHtml;
	        	}else{
	        		//copy the text content to spr content box
	        		txtContentBox.contentBoxDataNode.innerHTML = sprTxtContentBox.contentBoxDataNode.innerHTML;
	        	}
	        	//change id of the actual txtContetnBox to be the same as the spr
	        	txtContentBox.mainNode.id = sprTxtContentBox.mainNode.id;
	        	txtContentBox.contentBoxDataNode.id = sprTxtContentBox.contentBoxDataNode.id;
	        	sprTxtContentBox.mainNode.id = 'spareMainNode_grp_txtBox_'+curTime;
	        	sprTxtContentBox.contentBoxDataNode.id = 'spareContentBoxDataNode_grp_txtBox_'+curTime;
	        	sprContentBoxObj.editor.document.$.body.id = 'spareContentBoxDataNode_grp_txtBox_'+curTime;
	        	//copy the classnames from the spr from actual txtContentBox
	        	txtContentBox.mainNode.className = sprTxtContentBox.mainNode.className;
	        	txtContentBox.contentBoxDataNode.className = sprTxtContentBox.contentBoxDataNode.className; 
	        	//copy the attribute of the txtContentBox
	        	dojo.attr(txtContentBox.mainNode,'presentation_class',dojo.attr(sprTxtContentBox.mainNode,'presentation_class'));
				dojo.attr(txtContentBox.mainNode,'emptyCB_placeholder',dojo.attr(sprTxtContentBox.mainNode,'emptyCB_placeholder'));
				dojo.attr(txtContentBox.mainNode,'draw_layer',dojo.attr(sprTxtContentBox.mainNode,'draw_layer'));
				//copy the position and size of the txtContentBox
				txtContentBox.mainNode.style.top =sprTxtContentBox.mainNode.style.top;
				txtContentBox.mainNode.style.left =  sprTxtContentBox.mainNode.style.left;
				txtContentBox.mainNode.style.height = sprTxtContentBox.mainNode.style.height;
				txtContentBox.mainNode.style.width = sprTxtContentBox.mainNode.style.width;
				txtContentBox.mainNode.style.zIndex = sprTxtContentBox.mainNode.style.zIndex;
				txtContentBox.mainNode.style.display='';
	
				//change id of childnodes under spr  contentboxdatanode to avoid collision
				var sprChildNodes = dojo.query("*", sprTxtContentBox.contentBoxDataNode);
				for(var cn=0; cn<sprChildNodes.length; cn++){
					var cnOldId = sprChildNodes[cn].id;
					sprChildNodes[cn].id = cnOldId+"_"+curTime;
				}
	
				//now change the other content boxes
				var contentBoxes = drawFrameContentBoxObj.G_CONTENT_BOX_ARRAY;
				//get graphic content box from spare
				var sprGraphicBoxes = dojo.query(".g_draw_frame[presentation_class='graphic']",sprContentBoxObj.mainNode);
				
				if(sprGraphicBoxes!=null && sprGraphicBoxes.length>0){
					//use the first one
					var sprGraphicBoxGDFNode = sprGraphicBoxes[0]; //spare shape structure now only have 1 graphic and 1 text box
					var sprGraphicBoxCBDataNode = sprGraphicBoxGDFNode.firstChild;
					for(var g=0; g< contentBoxes.length; g++){ //this supposed to be 1 graphic and 1 text box
						var cb = contentBoxes[g];
						if(cb.mainNode.id != txtContentBox.mainNode.id && dojo.attr(cb.mainNode, "presentation_class") =="graphic"){ //if this is not the text box and it is graphic			        		
							var is_svg = false;
							if (cb.contentBoxDataNode.tagName!=null && cb.contentBoxDataNode.tagName.toLowerCase() == "svg")
								is_svg = true;
							
							var needToChangeId = false;
							if (is_svg) {
								needToChangeId = true;
							}
							
							//assuming we don't do any update to the graphic content box during edit mode
							//we don't need to copy back the content from spare.. assuming the content from the actual is still valid
							//just need to update id so that no id collision
							var childNodes = dojo.query("*", cb.contentBoxDataNode);
							for(var cn=0; cn<childNodes.length; cn++){
								var cnOldId = childNodes[cn].id;
								if(cnOldId.substring(cnOldId.length-3, cnOldId.length) == "SPR"){
									childNodes[cn].id = cnOldId.substring(0, cnOldId.length-3);
								}
								
								if (childNodes[cn].id == "") {
									dojo.removeAttr(childNodes[cn], "id");
								}
								
								if (needToChangeId) {
									var cnNodeName = childNodes[cn].tagName.toLowerCase();
									if (cnNodeName == "clippath" || cnNodeName == "lineargradient" || cnNodeName == "radialgradient" || cnNodeName == "pattern") {
									  var oldId = childNodes[cn].id;
									  var appendSuffix = "_upd";
									  var appendSuffixLen = appendSuffix.length;
									  if (oldId.slice(-appendSuffixLen) == appendSuffix) {
										  childNodes[cn].id = oldId.substring(0, oldId.length-appendSuffixLen);
									  } else {
										  childNodes[cn].id = oldId + appendSuffix;
									  }
									}
									if (cnNodeName == "rect" || cnNodeName == "circle")
										this._updateSvgFill(sprGraphicBoxCBDataNode, childNodes[cn]);
									if (cnNodeName == "path") {
										var grpFor = dojo.attr(childNodes[cn].parentNode, "groupfor");
										if (grpFor == "line")
											this._updateSvgGrpLineFill(sprGraphicBoxCBDataNode, childNodes[cn].id, childNodes[cn], 'stroke');
										else if (grpFor== "arrow") {
											var flag = PresCKUtil.checkArrowColorChange(childNodes[cn]);
											if (flag == true)
												this._updateSvgGrpLineFill(sprGraphicBoxCBDataNode, childNodes[cn].id, childNodes[cn], 'fill');
											else if(flag == false)
												this._updateSvgGrpLineFill(sprGraphicBoxCBDataNode, childNodes[cn].id, childNodes[cn], 'stroke');
										}
									}
								}  // end if (needToChangeId)
							}  // end for
				        	
							//transfer all the id and attr of contentBoxDataNode
							if(is_svg){
								// update id/ref by common interface
								drawFrameContentBoxObj.adjustSvgNode();
								
								//no need to transfer the svg properties, assume it doesn't change during edit, only textbox changes
								cb.contentBoxDataNode.id = sprGraphicBoxCBDataNode.id;
							}else{//handling img shape
								var imgElems = dojo.query("img", sprGraphicBoxCBDataNode.parentNode);
			        			for(var i=0; i<imgElems.length; i++){
			        				if(dojo.attr(imgElems[i],"forHandlingImgShape")== "true"){
			        					cb.contentBoxDataNode.id = imgElems[i].id;
			        				}
			        			}
							}
				        	//copy back the id
							cb.mainNode.id = sprGraphicBoxGDFNode.id;			        	
				        	//copy the classnames from the spr to actual graphicContentBox
							cb.mainNode.className = sprGraphicBoxGDFNode.className;
							//assuming didn't change during edit.. so we don't need to do copy the attribute of the graphicContentBox
							
							//change id of childnodes under spr  contentboxdatanode to avoid collision
							var sprChildNodes = dojo.query("*", sprGraphicBoxCBDataNode);
							for(var cn=0; cn<sprChildNodes.length; cn++){
								var cnOldId = sprChildNodes[cn].id;
								sprChildNodes[cn].id = cnOldId+"_"+curTime;
							}
						}
					}
				}
			}
			else{
				if (dojo.isIE){
					this.contentBoxDataNode.innerHTML =PresCKUtil.insertHTMLForIE(this.spr.editor, this.spr.contentBoxDataNode.innerHTML);
				} else{
					this.contentBoxDataNode.innerHTML =this.spr.contentBoxDataNode.innerHTML;
				}
			}
		} catch(e){	
			console.log("Error while unloading spare 1....- copy content from spare back to this.");
		}			
		
		try {
			//2- update All id's back
			this.mainNode.id = this.spr.mainNode.id;		 
			this.spr.mainNode.id = 'spareMainNode_'+curTime;
			
			this.contentBoxDataNode.id = this.spr.contentBoxDataNode.id;
			this.spr.contentBoxDataNode.id = 'spareContentBoxDataNode_'+curTime;
			this.spr.editor.document.$.body.id = 'spareContentBoxDataNode_'+curTime;
			
			if(this.contentBoxType ==PresConstants.CONTENTBOX_TABLE_TYPE){
				//update all the tbody and tr and tds of the spare table id to avoid duplicate ids
				var tbodyElems = dojo.query("tbody", this.spr.contentBoxDataNode);
				for(var t=0; t<tbodyElems.length; t++){
					tbodyElems[t].id ='tbody_'+curTime;
					tbodyElems[t].innerHTML = "";
				}
			}
			else {
				var sprDFCParent = dojo.query("div", this.spr.contentBoxDataNode)[0];//this.spr.contentBoxDataNode.firstChild;
				var thisDFCParent = dojo.query("div", this.contentBoxDataNode)[0];//this.contentBoxDataNode.firstChild;
				var sprDFC = sprDFCParent.firstChild;
				var thisDFC = thisDFCParent.firstChild;
				thisDFCParent.id = sprDFCParent.id;
				thisDFC.id = sprDFC.id;
				
				sprDFCParent.id = 'spareParentDFC_'+curTime;
				sprDFC.id = 'spareDFC_'+curTime;
				
				sprDFC.innerHTML="";
			}
		} catch(e){	
			console.log("Error while unloading spare 2....- update All id's back");
		}
		
		  try {
	            //3- Now move this box to spare location
	            this.mainNode.style.top = this.spr.mainNode.style.top; 
	            this.mainNode.style.left = this.spr.mainNode.style.left;
	            this.mainNode.style.height = this.spr.mainNode.style.height;
	            this.mainNode.style.width = this.spr.mainNode.style.width;
	            if(this.spr.mainNode.origZ!=null){
	                this.mainNode.style.zIndex = this.spr.mainNode.origZ;
	            }else{
	                this.mainNode.style.zIndex = this.spr.mainNode.style.zIndex;
	            }
	            
	            //For IE, contentBoxDataNode height might be absolute value, need to update to percentage.
	            if (dojo.isIE){
	                this.contentBoxDataNode.style.height = this.spr.contentBoxDataNode.style.height;
	                this.contentBoxDataNode.style.width = this.spr.contentBoxDataNode.style.width;
	            }
	        } catch(e){ 
	            console.log("Error while unloading spare 3....- Now move this box to spare location");
	        }
		//4- Now Move spare out of the way
		try { 
			 this.spr.mainNode.style.top = '-9999px';
			 this.spr.mainNode.style.left = '-9999px';
		} catch(e){	
			console.log("Error while unloading spare 4....- Now Move spare out of the way");
		}
		 
		try {
			//5- Hide Spare and show real box
			 this.mainNode.style.display='';
			//
			//D16632 - Workaround for mysterious IE patch problem which causes IE9 to crash when ifram is hidden on exiting edit mode.
		 	// let's prevent from hiding for IE9
			//					
		 	if (dojo.isIE!=9){
		 			this.spr.mainNode.style.display='none';
		 	}	
		} catch(e){	
			console.log("Error while unloading spare 5....- Hide Spare and show real box");
		}
		
		try {
		    //7- Update contentBox properties
			 this.isEmptyCBPlaceholder = this.spr.isEmptyCBPlaceholder;
			 this.isSpare = false; 
			 this.spr.isSpare = true;
			 this.createFromLayout = this.spr.createFromLayout;
			 this.newBox  =  this.spr.newBox;
			 this.boxSelected = this.spr.boxSelected;
			 this.spr.editor.config.isSpareBox = true;
			 this.spr.defaultTextDFC=null;
			 this.spr.editor.ctrlA = false;
			 this.spr.editor.selectAllByMouse = false; // reset to false
			 this.spr.destroyEditorSnapshots();
			 if(this.spr.editor.typeOverSelectAll!= null && this.spr.editor.typeOverSelectAll!=undefined){
				 delete this.spr.editor.typeOverSelectAll;			 
			 }
			 
			 this.spr.editor.deleteNodeProps = null; //T15925
		 } catch(e){	
				console.log("Error while unloading spare 7....- Update contentBox properties");
		 }
		 try {
			 //8- Update Classes
			 this.mainNode.className = this.spr.mainNode.className; 
			 this.contentBoxDataNode.className = this.spr.contentBoxDataNode.className;		
			 //8a- D14155 Also update attributes for main node
			 dojo.attr(this.mainNode,'presentation_class',dojo.attr(this.spr.mainNode,'presentation_class'));
			 dojo.attr(this.mainNode,'emptyCB_placeholder',dojo.attr(this.spr.mainNode,'emptyCB_placeholder'));
			 dojo.attr(this.mainNode,'draw_layer',dojo.attr(this.spr.mainNode,'draw_layer'));
			 if(this.contentBoxType ==PresConstants.CONTENTBOX_GROUP_TYPE){
				var dtype = dojo.attr(this.spr.mainNode,'draw_type');
				dojo.attr(this.mainNode,'draw_type', dtype || '');
			}
	
			 
			 if (dojo.hasClass(this.mainNode, 'resizableContainer')){			
				this.hideHandles();
			 }else{			
				this.showHandles();
			 }
			 
			 dojo.addClass(this.spr.mainNode,'isSpare');
			 dijit.setWaiState(this.spr.mainNode,'hidden', 'true');  // hide from jaws
			 dijit.removeWaiState(this.mainNode,'hidden');
			 
			 // remove spare body classes because it comes from a specific objects
			 var sprBody = this.spr.editor.document.$.body;
			 dojo.removeClass(sprBody);
		 
		 } catch(e){	
				console.log("Error while unloading spare 8....- Update Classes");
		 }
		 
		 try {
			//9- Handle comments 			
			if(this.spr.hasComments()){
				//9.1 - disconnect event from spare comment gif
				if (this.spr.commentConnect && this.spr.commentConnect.disconnect){
					this.spr.commentConnect.disconnect();
					this.spr.commentConnect=null;
				}
				
				//9.2 Initialize comments node
				dojo.attr(this.mainNode,'commentsId',dojo.attr(this.spr.mainNode,'commentsId'));
				dojo.attr(this.mainNode,'comments',dojo.attr(this.spr.mainNode,'comments'));
				this.initializeCommentsNode();				
				
				//9.3- reset spare node attributes for comments								
				dojo.removeAttr(this.spr.mainNode,'commentsId');
				dojo.removeAttr(this.spr.mainNode,'comments');				
			} else if (this.hasComments()){ //TODO: We need to handle when comment is deleted while in edit mode. Need to remove comment from original box
				dojo.removeAttr(this.mainNode, 'comments');				
				dojo.removeAttr(this.mainNode, 'commentsId');				
				this.commentsId = null;				
				this.destroyAllCommentIconNodes();
			}	
			//9.4- reset remaining box properties for commments
			//remove all comment icon nodes from spare			
			this.spr.destroyAllCommentIconNodes();
			if ( this.spr.commentsId!=null)
				this.spr.commentsId = null;
		 
		 } catch(e){	
			console.log("Error while unloading spare 8....- Update Classes");
		 }
		 
		try {
			 //10- Swap original box back in
			window.pe.scene.slideEditor.swapRegisteredBox(this,this.spr);
			
			if (this.contentBoxType ==PresConstants.CONTENTBOX_GROUP_TYPE) {
				var sprTxtContentBox = sprContentBoxObj.txtContent; 
				sprTxtContentBox.contentBoxDataNode.innerHTML = '';
			} else {
				this.spr.contentBoxDataNode.innerHTML =''; //TODO destroy the node.
			}
			this.spr.boxRep = null;
			this.spr = null;
			// 42526: [Co-editing]Other user click shape in some slide will broken lock status in co-editor user
			// Group content box obj shares the same spr with its text content box obj
			// so when unload spare, decrease spr ref number for text content box obj
			if (this.G_CONTENT_BOX_ARRAY != null) {
				for (var j=0; j < this.G_CONTENT_BOX_ARRAY.length; j++) {
					if (this.G_CONTENT_BOX_ARRAY[j].contentBoxType == PresConstants.CONTENTBOX_TEXT_TYPE)
						this.G_CONTENT_BOX_ARRAY[j].spr.boxRep = null;
						this.G_CONTENT_BOX_ARRAY[j].spr = null;
				}
			}
		 } catch(e){	
			console.log("Error while unloading spare 10....- Swap original box back in");
		 }	
		 
		 try {
			//11- Complete toggleEdit mode off actions	
//			 this.publishBoxEditMode(); // second edit mode off is sent unnecessary
		 } catch(e){	
			 console.log("Error while unloading spare 11....- Complete toggleEdit mode off actions");
		 }	
		
//		 try{
//	  	   //12- Destory spare and recreate
//			if(this.contentBoxType ==PresConstants.CONTENTBOX_GROUP_TYPE){
//				try{
//					  window.pe.scene.slideEditor.destroyGroupSpareBox();
//				}catch(e){
//					console.log("!!! Error while destroying group spare box : " + e.toString());
//				}
//				
//				// in case the redundant node is not deleted
//				if (dojo.byId(sprContentBoxObj.mainNode.id)) {
//					dojo.destroy(sprContentBoxObj.mainNode);
//				}
//				
//				// create a new one
//				window.pe.scene.slideEditor.groupSpareBox = null;
//				window.pe.scene.slideEditor.createSpareGrpContentBox();
//			}
//		 } catch(e){	
//			 console.log("Error while unloading spare 12....- Destory spare and recreate");
//		 }	
		 
		return this;		
	},	
	
	//
	// Swaps sparebox with this contentBox
	// This function is suppose to simulate the CKEDITOR initializing itself.
	// When done running the current contentBox is to be at exactly the same state
	// as when ck is about to fire contentDom event.
	//
	loadSpare: function(){
	    try{
	        //0- debug print
	        //this.printSpareState();       
	            var dfNode = this.mainNode; 
	            var isGDrawFrame = false;
			var drawFrameNode = this.mainNode;
			var drawFrameContentBoxObj = this;
		}catch (e){
			console.info('========loadSpare.0- debug print');
		};
		try{
		// 1- hide this contentBox
			if(dojo.hasClass(this.mainNode, "g_draw_frame")== true){
				//find draw-frame parent
				var dfp = window.pe.scene.slideEditor.getParentDrawFrameNode(this.mainNode);
				if(dfp!=null){
					drawFrameNode = dfp;
					drawFrameContentBoxObj = window.pe.scene.slideEditor.getRegisteredContentBoxById(drawFrameNode.id);
					if (drawFrameContentBoxObj)
						drawFrameContentBoxObj.mainNode.style.display='none';
				}
				isGDrawFrame = true;			
			}
			
			if(isGDrawFrame!=true ){
				this.mainNode.style.display='none';
			}
		}catch (e){
			console.error('========loadSpare.1- hide this contentBox:'+e);
			return;
		};
		try{	
		// 2- Get handle to spare unload other box first then update content with new box
			var spr = null;
			if(isGDrawFrame == true ){
				spr = this.getSpareInstance(PresConstants.CONTENTBOX_GROUP_TYPE);
			}else if(this.contentBoxType ==PresConstants.CONTENTBOX_TABLE_TYPE){
				spr = this.getSpareInstance(PresConstants.CONTENTBOX_TABLE_TYPE);
			}
			else{
				spr = this.getSpareInstance();
			}
			
			//Check if spare editor is alive		
			if (spr==null){
				console.error('There was a problem getting spare box'); //Should never reach here 
				return;
			}

			//
			//D16632
			//Bizzare IE9 Issue with 11/14 update 9.0.11
			//
			//
			if(isGDrawFrame==true && spr.txtContent!=null){
				spr.editor = spr.txtContent.editor;
			}
			//Before we load let's put the spare in a desired state for IE9
			if (dojo.isIE > 8){
				var body = spr.editor.document.$.body;
				dojo.addClass(body,'concord');	
			}
			//
			//
			//Bizzare IE9 Issue with 11/14 update
			//
			//
				
	        if (spr.boxRep!=null){
	        	spr.boxRep.unLoadSpare();
	        }	     	        

	        var	sprBody = spr.editor.document.$.body;
	        //13550 - handle table content
	        if(this.contentBoxType ==PresConstants.CONTENTBOX_TABLE_TYPE){
				//prep the table content
				var tbl = this.createTableNodeForEditMode(true);
				//empty out spr.contentBoxDataNode
				dojo.empty(spr.contentBoxDataNode);
				//add the table to contentBoxDataNode
				spr.contentBoxDataNode.appendChild(tbl);
				
				//D35857 [CustomStyle]Table style change to incorrect if we move a row down in table
				this._updateTableStyleAttributes(spr.contentBoxDataNode, tbl);
				
				//add content to the editor
				if (dojo.isIE){
					var tmpHtml = PresCKUtil.insertHTMLForIE(spr.editor, spr.contentBoxDataNode.innerHTML);
		        	sprBody.innerHTML = tmpHtml;
				}
				else{
					sprBody.innerHTML = spr.contentBoxDataNode.innerHTML;
				}
			}
	        else if(isGDrawFrame==true){
	        	//copy the text content box
	        	var txtContentBox = drawFrameContentBoxObj.txtContent;
	        	var sprTxtContentBox = spr.txtContent;        	
	        	if(dojo.isIE){
	        		var tmpHtml = PresCKUtil.insertHTMLForIE(spr.editor, txtContentBox.contentBoxDataNode.innerHTML);
	        		sprBody.innerHTML = tmpHtml;
	        		sprTxtContentBox.contentBoxDataNode.innerHTML = tmpHtml;
	        	}else{
	        		//copy the text content to editor body
	        		sprBody.innerHTML = txtContentBox.contentBoxDataNode.innerHTML;
	        		//copy the text content to spr content box
		        	sprTxtContentBox.contentBoxDataNode.innerHTML = txtContentBox.contentBoxDataNode.innerHTML;
	        	}
	        	//change id of the spr to be the same as the actual txtContentBox
	        	sprTxtContentBox.mainNode.id = txtContentBox.mainNode.id;
	        	sprTxtContentBox.contentBoxDataNode.id = txtContentBox.contentBoxDataNode.id;
	        	//copy the classnames to the spr from actual txtContentBox
	        	sprTxtContentBox.mainNode.className = txtContentBox.mainNode.className;
	        	sprTxtContentBox.contentBoxDataNode.className = txtContentBox.contentBoxDataNode.className;
	        	//copy the attribute of the txtContentBox
	        	dojo.attr(sprTxtContentBox.mainNode,'presentation_class',dojo.attr(txtContentBox.mainNode,'presentation_class'));
	        	dojo.attr(sprTxtContentBox.mainNode,'pfs',dojo.attr(txtContentBox.mainNode,'pfs'));
				dojo.attr(sprTxtContentBox.mainNode,'emptyCB_placeholder',dojo.attr(txtContentBox.mainNode,'emptyCB_placeholder'));
				dojo.attr(sprTxtContentBox.mainNode,'draw_layer',dojo.attr(txtContentBox.mainNode,'draw_layer'));
				//copy the position and size of the txtContentBox
				sprTxtContentBox.mainNode.style.top =txtContentBox.mainNode.style.top;
				sprTxtContentBox.mainNode.style.left =  txtContentBox.mainNode.style.left;
				sprTxtContentBox.mainNode.style.height = txtContentBox.mainNode.style.height;
				sprTxtContentBox.mainNode.style.width = txtContentBox.mainNode.style.width;
				sprTxtContentBox.mainNode.style.zIndex = txtContentBox.mainNode.style.zIndex;
				sprTxtContentBox.mainNode.style.display='';
				
				//sprTxtContentBox.mainNode.style.backgroundColor = 'red';
				//now change the other content boxes
				var contentBoxes = drawFrameContentBoxObj.G_CONTENT_BOX_ARRAY;
				//get graphic content box from spare
				var sprGraphicBoxes = dojo.query(".g_draw_frame[presentation_class='graphic']",spr.mainNode);
				
				if(sprGraphicBoxes!=null && sprGraphicBoxes.length>0){
					//use the first one
					var sprGraphicBoxGDFNode = sprGraphicBoxes[0]; //spare shape structure should only have 1 graphic and 1 text box
					var sprGraphicBoxCBDataNode = sprGraphicBoxGDFNode.firstChild;
					for(var g=0; g< contentBoxes.length; g++){ //this supposed to be 1 graphic and 1 text box
						var cb = contentBoxes[g];
						if(cb.mainNode.id != txtContentBox.mainNode.id && dojo.attr(cb.mainNode, "presentation_class") =="graphic"){ //if this is not the text box and it is graphic			        		
			        		var is_svg = false;
			        		if(cb.contentBoxDataNode.tagName!=null && cb.contentBoxDataNode.tagName.toLowerCase() == "svg")
								is_svg = true;

							if (is_svg == true) { //if handling svg shape..
			        			sprGraphicBoxCBDataNode.style.display = "";
			        			//remove img element from previously handling image shape if any
			        			var imgElems = dojo.query("img", sprGraphicBoxCBDataNode.parentNode);
			        			for(var i=0; i<imgElems.length; i++){
			        				if(dojo.attr(imgElems[i],"forHandlingImgShape")== "true"){
			        					dojo.destroy(imgElems[i]);
			        				}
			        			}
								// copy the svg content to spr content box
				        		// svg can't do innerHTML so has to appendChild
			        			// no need for c++ because of "destroy". Or full fill for rect will be shown
			        			// for the svg rect in the first edit-mode-in
				        		for(var c=0; c< sprGraphicBoxCBDataNode.childNodes.length;){
			        				var child = sprGraphicBoxCBDataNode.childNodes[c];
			        				dojo.destroy(child);
			        			}
				        		var svgTemp = dojo.clone(cb.contentBoxDataNode);
				        		if(svgTemp!=null && svgTemp.childNodes!=null){
				        			// no need for c++ because of "appendChild" will destroy orig
				        			for(var c=0; c< svgTemp.childNodes.length;){
				        				var child = svgTemp.childNodes[c];
				        				//dojo.empty(sprGraphicBox.contentBoxDataNode);
				        				sprGraphicBoxCBDataNode.appendChild(child);
				        			}
				        			dojo.destroy(svgTemp);
				        			svgTemp = null;
				        		}
					        	
								//transfer all the id and attr of contentBoxDataNode
									//transfer the svg properties
									sprGraphicBoxCBDataNode.id = cb.contentBoxDataNode.id;
									dojo.attr(sprGraphicBoxCBDataNode,'version',dojo.attr(cb.contentBoxDataNode,'version'));
									dojo.attr(sprGraphicBoxCBDataNode,'xmlns',dojo.attr(cb.contentBoxDataNode,'xmlns'));
									dojo.attr(sprGraphicBoxCBDataNode,'preserveAspectRatio',dojo.attr(cb.contentBoxDataNode,'preserveAspectRatio'));
									dojo.attr(sprGraphicBoxCBDataNode,'viewBox',dojo.attr(cb.contentBoxDataNode,'viewBox'));								
									dojo.attr(sprGraphicBoxCBDataNode,'xmlns:xlink',dojo.attr(cb.contentBoxDataNode,'xmlns:xlink'));
									dojo.attr(sprGraphicBoxCBDataNode,'style',dojo.attr(cb.contentBoxDataNode,'style'));
									dojo.attr(sprGraphicBoxCBDataNode,'draw_layer',dojo.attr(cb.contentBoxDataNode,'draw_layer'));
									dojo.attr(sprGraphicBoxCBDataNode,'contentStyleType',dojo.attr(cb.contentBoxDataNode,'contentStyleType'));
									dojo.attr(sprGraphicBoxCBDataNode,'contentScriptType',dojo.attr(cb.contentBoxDataNode,'contentScriptType'));
									
			        		}//end if svg_Shape
			        		else{ //if handling image shape
			        			//cb.contentBoxDataNode should be an img element
			        			// sprGraphicBoxCBDataNode from spare is an svg
			        			//in the spare we need to hide the svg and display the img
			        			sprGraphicBoxCBDataNode.style.display = "none";
			        			var imgNode = dojo.clone(cb.contentBoxDataNode);
			        			//remove the existing one
			        			var imgElems = dojo.query("img", sprGraphicBoxCBDataNode.parentNode);
			        			for(var i=0; i<imgElems.length; i++){
			        				if(dojo.attr(imgElems[i],"forHandlingImgShape")== "true"){
			        					dojo.destroy(imgElems[i]);
			        				}
			        			}
			        			if(sprGraphicBoxCBDataNode.parentNode!=null){
			        				sprGraphicBoxCBDataNode.parentNode.appendChild(imgNode);
			        				dojo.attr(imgNode,"forHandlingImgShape", "true");
			        			} 	
			        		}
				        	//change id of the spr to be the same as the actual graphicContentBox
							sprGraphicBoxGDFNode.id = cb.mainNode.id;			        	
				        	//copy the classnames to the spr from actual graphicContentBox
							sprGraphicBoxGDFNode.className = cb.mainNode.className;
				        	//copy the attribute of the txtContentBox
				        	dojo.attr(sprGraphicBoxGDFNode,'presentation_class',dojo.attr(cb.mainNode,'presentation_class'));
							dojo.attr(sprGraphicBoxGDFNode,'emptyCB_placeholder',dojo.attr(cb.mainNode,'emptyCB_placeholder'));
							dojo.attr(sprGraphicBoxGDFNode,'draw_layer',dojo.attr(cb.mainNode,'draw_layer'));
						}
					}
				}
				
	        	
	        }
	        else {
		        if (dojo.isIE){
	        		var tmpHtml = PresCKUtil.insertHTMLForIE(spr.editor, this.contentBoxDataNode.innerHTML);
	        		sprBody.innerHTML = tmpHtml;
	        		spr.contentBoxDataNode.innerHTML = tmpHtml;		      	        	
		        } else{
		        	sprBody.innerHTML = this.contentBoxDataNode.innerHTML;
		        	spr.contentBoxDataNode.innerHTML = this.contentBoxDataNode.innerHTML;		        						        	
		        }
	        }
		}catch (e){
			console.error('========loadSpare.2- Get handle to spare unload other box first then update content with new box:'+e);
			return;
		};
		try{
		// 3- Update all id's necessary
			spr.mainNode.id = this.mainNode.id;
			this.mainNode.id += 'SPR';
			spr.contentBoxDataNode.id = this.contentBoxDataNode.id;
			sprBody.id = this.contentBoxDataNode.id;
			this.contentBoxDataNode.id += 'SPR';
			
			if(this.contentBoxType ==PresConstants.CONTENTBOX_TABLE_TYPE){
				sprBody.id +="_body";
				
				var colgrpElems = dojo.query("colgroup", this.contentBoxDataNode);
				for(var t=0; t<colgrpElems.length; t++){
					colgrpElems[t].id += 'SPR';
				}
				var colElems = dojo.query("col", this.contentBoxDataNode);
				for(var t=0; t<colElems.length; t++){
					colElems[t].id += 'SPR';
				}
				//update all the tbody and tr and tds of the table id with suffix SPR
				var tbodyElems = dojo.query("tbody", this.contentBoxDataNode);
				for(var t=0; t<tbodyElems.length; t++){
					tbodyElems[t].id += 'SPR';
				}
				var trElems = dojo.query("tr", this.contentBoxDataNode);
				for(var t=0; t<trElems.length; t++){
					trElems[t].id += 'SPR';
				}
				var thElems = dojo.query("th", this.contentBoxDataNode);
				for(var t=0; t<thElems.length; t++){
					thElems[t].id += 'SPR';
					thElems[t].innerHTML = "";//empty out content to avoid duplicate id's on the canvas
				}
				var tdElems = dojo.query("td", this.contentBoxDataNode);
				for(var t=0; t<tdElems.length; t++){
					tdElems[t].id += 'SPR';
					tdElems[t].innerHTML = "";//empty out content to avoid duplicate id's on the canvas
				}
			}
			else if(isGDrawFrame == true){
				spr.mainNode.id = drawFrameContentBoxObj.mainNode.id;
				drawFrameContentBoxObj.mainNode.id +='SPR';
				//change all the node id under contentBoxDataNode to avoid id collision
				spr.contentBoxDataNode.id = drawFrameContentBoxObj.contentBoxDataNode.id;
				if(drawFrameContentBoxObj.G_CONTENT_BOX_ARRAY!=null){
					for(var g=0; g<drawFrameContentBoxObj.G_CONTENT_BOX_ARRAY.length; g++){
						var gDrawFrameObj = drawFrameContentBoxObj.G_CONTENT_BOX_ARRAY[g];
						gDrawFrameObj.mainNode.id +='SPR';
						
						var is_svg = false;
						if (gDrawFrameObj.contentBoxDataNode.tagName!=null && gDrawFrameObj.contentBoxDataNode.tagName.toLowerCase() == "svg")
							is_svg = true;
						
						if(gDrawFrameObj.contentBoxType != PresConstants.CONTENTBOX_TEXT_TYPE){
							//change the id of all the elements
							var nodes = dojo.query('*', drawFrameContentBoxObj.G_CONTENT_BOX_ARRAY[g].mainNode);
							for(var n=0; n<nodes.length; n++){
								nodes[n].id +='SPR';
							}
							
						}else{
							if(gDrawFrameObj.contentBoxDataNode!=null){
								gDrawFrameObj.contentBoxDataNode.id+='SPR';
								if(gDrawFrameObj.contentBoxDataNode.firstChild!=null){ //dfc parent
									gDrawFrameObj.contentBoxDataNode.firstChild.id +='SPR';
									var dfc = gDrawFrameObj.contentBoxDataNode.firstChild.firstChild;
									if(dfc!=null){ //dfc
										dfc.id +='SPR';
										dfc.innerHTML = "";
									}
								}
							}
						}
						
						if (is_svg) {
							// update id/ref by common interface
							drawFrameContentBoxObj.adjustSvgNode();
						}
					}
				}
				sprBody.id = this.contentBoxDataNode.id;
			}
			else{
				var sprDFCParent = spr.contentBoxDataNode.firstChild;
				var thisDFCParent = this.contentBoxDataNode.firstChild;
				var sprDFC = sprDFCParent.firstChild;
				var thisDFC = thisDFCParent.firstChild;

				thisDFC.innerHTML =""; //empty out content to avoid duplicate id's on the canvas

				sprDFCParent.id = thisDFCParent.id;
				thisDFCParent.id += 'SPR';
				sprDFC.id = thisDFC.id;
				thisDFC.id +='SPR';
			}
		}catch (e){
			console.error('========loadSpare.3- Update all ids necessary:'+e);
			return;
		};
		try{
		// 4- Set sprBox classes
			spr.mainNode.className = drawFrameContentBoxObj.mainNode.className;
			spr.contentBoxDataNode.className = drawFrameContentBoxObj.contentBoxDataNode.className;
			if(this.contentBoxType !=PresConstants.CONTENTBOX_TABLE_TYPE && isGDrawFrame != true){
				var sprDFCParent = spr.contentBoxDataNode.firstChild;
				var thisDFCParent = this.contentBoxDataNode.firstChild;
				var sprDFC = sprDFCParent.firstChild;
				var thisDFC = thisDFCParent.firstChild;
				sprDFCParent.className = thisDFCParent.className;
				sprDFC.className = thisDFC.className;
			}
			
			//4.a - D14155 Handle mainNode attributes as well 
			dojo.attr(spr.mainNode,'presentation_class',dojo.attr(drawFrameContentBoxObj.mainNode,'presentation_class'));
			dojo.attr(spr.mainNode,'presentation_placeholder_index',dojo.attr(drawFrameContentBoxObj.mainNode,'presentation_placeholder_index'));
			//wangzhe >>>>>==================
			//dojo.attr(spr.mainNode,'emptyCB_placeholder',dojo.attr(drawFrameContentBoxObj.mainNode,'presentation_placeholder'));
			var attr_Placeholder = dojo.attr(drawFrameContentBoxObj.mainNode,'emptyCB_placeholder');
			if(!attr_Placeholder)
				attr_Placeholder = dojo.attr(drawFrameContentBoxObj.mainNode,'presentation_placeholder');
			dojo.attr(spr.mainNode,'emptyCB_placeholder',attr_Placeholder);
			//<<<<<=======================
			dojo.attr(spr.mainNode,'draw_layer',dojo.attr(drawFrameContentBoxObj.mainNode,'draw_layer'));
			//Wangzhe >>>==============
			dojo.attr(spr.mainNode,'presentation_placeholder',dojo.attr(drawFrameContentBoxObj.mainNode,'presentation_placeholder'));
			//<<<<=====================
			if(isGDrawFrame == true){ //if svgShape, need to copy draw_type attr
				var dtype = dojo.attr(drawFrameContentBoxObj.mainNode,'draw_type');
				dojo.attr(spr.mainNode,'draw_type', dtype || '');
			}
			
			dijit.setWaiState(drawFrameContentBoxObj.mainNode,'hidden', 'true');  // hide from jaws
			dijit.removeWaiState(spr.mainNode,'hidden');
			// Set initial class for body which is used for coeditting highlight
			if (pe.settings.settings.show_indicator == 'yes')
				dojo.addClass(sprBody, "user_indicator");
			else if (pe.settings.settings.show_indicator == 'no')
				dojo.removeClass(sprBody, "user_indicator");
		}catch (e){
			console.error('========loadSpare.4- Set sprBox classes:'+e);
			return;
		};
		try{
		 // 5- Now move spare to location of this box which is hidden
            spr.mainNode.style.top =drawFrameContentBoxObj.mainNode.style.top;
            spr.mainNode.style.left =  drawFrameContentBoxObj.mainNode.style.left;
            spr.mainNode.style.height = drawFrameContentBoxObj.mainNode.style.height;
            spr.mainNode.style.width = drawFrameContentBoxObj.mainNode.style.width;
            spr.mainNode.style.zIndex = drawFrameContentBoxObj.mainNode.style.zIndex;
            spr.mainNode.style.display='';


            if (dojo.isIE){
                spr.contentBoxDataNode.style.height = drawFrameContentBoxObj.contentBoxDataNode.style.height; 
                spr.contentBoxDataNode.style.width = drawFrameContentBoxObj.contentBoxDataNode.style.width;
            }
		}catch (e){
			console.error('========loadSpare.5- Now move spare to location of this box which is hidden:'+e);
			return;
		};
		try{
		// 6- Handle handles
			var updateCKSize = true;
			spr.updateHandlePositions(updateCKSize);
			spr.showHandles();
			
			spr.updateCKBodyHeight();
		}catch (e){
			console.error('========loadSpare. 6- Handle handles:'+e);
			return;
		};
		try{
		 // 7- Update contentBox properties
			if (dojo.attr(drawFrameContentBoxObj.mainNode,'emptyCB_placeholder')=='true'){
				spr.isEmptyCBPlaceholder = drawFrameContentBoxObj.isEmptyCBPlaceholder = true;			 
			}else{
				spr.isEmptyCBPlaceholder = drawFrameContentBoxObj.isEmptyCBPlaceholder = false;		
			}
			
			spr.isSpare = drawFrameContentBoxObj.isSpare;
			spr.createFromLayout =drawFrameContentBoxObj.createFromLayout;
			spr.newBox = drawFrameContentBoxObj.newBox;
			spr.editor.config.isSpareBox = false;
			spr.boxSelected = true;
			spr.isDirty = drawFrameContentBoxObj.isDirty;
			spr.defaultTextDFC=drawFrameContentBoxObj.defaultTextDFC;
			spr.editor.alignmentDef=null; //D16486 need to reset alignment information
			
			spr.boxRep = drawFrameContentBoxObj;
			if (this.isBidi && spr.boxRep && spr.boxRep.contentBoxDataNode && (spr.contentBoxType==spr.CONTENTBOX_TABLE_TYPE)){
				var tblDir = dojo.style(spr.boxRep.contentBoxDataNode,"direction");
				if (tblDir){
					dojo.style(spr.contentBoxDataNode,'direction',tblDir);
					dojo.style(spr.editor.document.$.body,'direction',tblDir);
				}
			}

			if(isGDrawFrame == true){ //for shapes, needs to set boxRep on shape/grp level also, to indicate that this has spare obj
				drawFrameContentBoxObj.spr = spr; 
			}
		}catch (e){
			console.error('========loadSpare. 7- Update contentBox properties:'+e);
			return;
		};
		try{
			// 8- Handle comments 			
			if(drawFrameContentBoxObj.hasComments()){
				//todo: 13550 comment in the outer box /shape
				dojo.attr(spr.mainNode,'commentsId', dojo.attr(drawFrameContentBoxObj.mainNode,'commentsId'));
				dojo.attr(spr.mainNode,'comments', dojo.attr(drawFrameContentBoxObj.mainNode,'comments'));
				var cin = drawFrameContentBoxObj.getCommentIconNodes();
				for(var i=0; i<cin.length;i++){
					var cNode = dojo.clone(cin[i]);
					spr.mainNode.appendChild(cNode);
					//TODO new comment hover show comments 
					spr.commentConnect = dojo.connect(cNode,'onmouseover', dojo.hitch(spr,spr._expandComments, cNode.id, false));
					spr.commentsId = drawFrameContentBoxObj.commentsId;
					cNode=null;
				}
			}
		}catch (e){
			console.error('========loadSpare. 8- Handle comments:'+e);
			return;
		};
		try{
		// 9- Replace box in registered slideEditor box
			window.pe.scene.slideEditor.swapRegisteredBox(spr,drawFrameContentBoxObj);
		}catch (e){
			console.error('========loadSpare. 9- Replace box in registered slideEditor box:'+e);
			return;
		};
		 //10- Return spr	
			return spr;
	},

	//param is gDrawFrameDiv, a text box g_draw_frame div of group content box
	placeGrpTxtContentBoxToGrpSpare: function(gDrawFrameDiv){
		if(gDrawFrameDiv!=null){
			//put original text content box under spare
			var grpSpare = window.pe.scene.slideEditor.groupSpareBox;
			if(grpSpare!=null){
				var sprContentBoxDataNode = grpSpare.contentBoxDataNode;
				if(sprContentBoxDataNode!=null ){
					//we need to park the original textbox under the spare
					sprContentBoxDataNode.appendChild(gDrawFrameDiv);
					
				}
				
			}
			
		}
	},
	
	 	
	makeEditable: function(){
		//console.log("==============> TIMER - Start clik for Edit Mode ");
		if (window.pe.scene.slideEditor.SINGLE_CK_MODE){			
			//TODO: Check on contentboxType group, we need to make sure teh contentBox_groupd_type doesn't go to the else
			if (this.contentBoxType==PresConstants.CONTENTBOX_GROUP_TYPE || (dojo.hasClass(this.mainNode,'g_draw_frame') && window.pe.scene.slideEditor.GROUP_SINGLE_CK_MODE == false) ||
					(dojo.hasClass(this.mainNode,'isSpare') || this.contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE)){
				this.makeEditableORIG();
			}
			
			else{		
				var spr = this.spr =  this.loadSpare();	
				if(spr!=null){
					//13550
					//we need to run contentDom and dataReady function on the spare textbox object
					//For the group object, spr is a group box, so we need to refers to the spr group's text box object
					//for other type of content boxes, spr is generally a textbox level already
					var sprTxtContentBox = spr;
					if(dojo.hasClass(this.mainNode,'g_draw_frame')){
						sprTxtContentBox = spr.txtContent;
					}
					PresCKUtil.lockInput = true;
					var contentDomFunc  = dojo.hitch(sprTxtContentBox.editor,sprTxtContentBox.handleContentDom,sprTxtContentBox);
					contentDomFunc();
					var dataReadyFunc  = dojo.hitch(sprTxtContentBox.editor,sprTxtContentBox.handleDataReady,sprTxtContentBox);
					dataReadyFunc();
//					spr.handleCursorOnEdit();
				}
								

			}
		}else {
			this.makeEditableORIG();
		}
	},	    	
	
	//
	//PERCENT
	//
	//
	//	Makes contentBox makeEditable inside the parentContainerNode
	//
	makeEditableORIG: function(){
		//console.log("contentBox:makeEditableORIG","Entry");
		if (!this.boxReady) return;
		//this.CKEDITOR
		if (!window.pe.scene.slideEditor.sceneReady)
			return;				
			// Let's destroy this editor if it exists
		  	concord.util.presToolbarMgr.setFocusSorterTb();			
			this.destroyThisEditor();
			this.isDirty=false;
		    //
		    // If table then append xtra node
		    //
		    if (this.contentBoxDataNode.tagName.toLowerCase()=='table'){
		        var tbl = this.createTableNodeForEditMode(); //13550 - taking out the code into a function
		    	this.contentBoxDataNode.appendChild(tbl);
		    	tbl = null;
		    	
		    }

			//Prevent IE expansion
			if (dojo.isIE){
				//21167 - in group, do not set overflow hidden
				if(dojo.hasClass(this.mainNode,"g_draw_frame")!= true || window.pe.scene.slideEditor.SINGLE_CK_MODE!=true){
					dojo.style(this.mainNode,{
						'overflow':'hidden'
					});
				}
				
			}
			
			//var oneuiCSS = window.contextPath + window.staticRootPath + '/js/dijit/themes/oneui30/oneui30.css';
			//var lotusuiCSS = window.contextPath + window.staticRootPath + '/styles/css/base/core.css';
			var slideEditorCSS = window.contextPath + window.staticRootPath + '/styles/css/presentations/slideEditor.css';
			this.editor= this.CKEDITOR.replace( this.contentBoxDataNode.id,
					{
						sharedSpaces :
						{
							top : this.CKToolbarSharedSpace
						},
						theme: 'presentation',
						contentBoxDataNode: true,
						isSpareBox : (this.opts.isSpare)? 'true': null,
						// Removes the maximize plugin as it's not usable
						// in a shared toolbar.
						// Removes the resizer as it's not usable in a
						// shared elements path.
						removePlugins : 'table,tabletools,elementspath,dojo,scayt,menubutton,maximize,resize,task,concordtoolbar,messages,menubar,fixedwidthpage,comments,div, browserresizehandler,closeeditor,comments, concordimage,concordpreview, concordtemplates,concordtoolbar,createpdf,dojo,fixedwidthpage,headingbutton,menubar,messages,publish,smartblock,startnewdoc,task,showborders',
						extraPlugins: concord.util.editor.getExtraPlugins(),
						contentsCss: [slideEditorCSS],
						resize_enabled: false,
						disableObjectResizing: true,
						disableNativeTableHandles: true,
						fullPage : false,
						bodyId : (this.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE)? this.mainNode.id : this.contentBoxDataNode.id,
						enterMode: this.CKEDITOR.ENTER_P,
						height: this.getHeightOnCKEdit(true),
						width: this.getWidthOnCKEdit(true)	,
						toolbarCanCollapse: false
					} );
					//CK3621 set toolbarCanCollapse above
		if (window.pe.scene.slideEditor.SINGLE_CK_MODE){
			if (dojo.hasClass(this.mainNode,'g_draw_frame') || this.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE || this.contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE){
				this.editor.on('contentDom', dojo.hitch(this.editor,this.handleContentDom,this));
				this.editor.on('dataReady',dojo.hitch(this.editor,this.handleDataReady,this));
			}
		} else {
			this.editor.on('contentDom', dojo.hitch(this.editor,this.handleContentDom,this));
			this.editor.on('dataReady',dojo.hitch(this.editor,this.handleDataReady,this));			
		}
		
		this.editModeOn =true;
		//console.log("contentBox:makeEditable","Exit");		
	},
	
	//
	// handle contentDom
	// 
	handleContentDom: function(contentBox, event){
		//window.TIME_CK_CONTENTDOM_START = new Date().getTime();
		//console.log("=======> TIMER - CK time to ContentDom "+(window.TIME_CK_CONTENTDOM_START - window.TIME_CLICK_FOR_EDIT )+" millsec.");
		if (this.firstPass == undefined  || this.firstPass ==null){
			this.firstPass = true;
		}

	    // D9528 - copy DOJO classes from main HTML to CKEditor instance HTML
	    //         (so any CSS selectors will still work within an editor instance)
		if (this.firstPass){
		    try {  // don't let any JS errors derail the rest of what we do
		        var mainDom = contentBox.contentBoxDataNode.document ?
		                contentBox.contentBoxDataNode.document : contentBox.contentBoxDataNode.ownerDocument,
		            mainClasses = mainDom.documentElement.className,
		            ckClasses = contentBox.editor.document.$.documentElement.className;
		        contentBox.editor.document.$.documentElement.className = ckClasses + ' ' + mainClasses;
				mainDom = null;		        
		    } catch ( e ) { }
		}	    
		//Fix Range
		//contentBox.updateCKRange();
		//JMT-coeditfix adding user to editor
		this.user=window.pe.scene.authUser;
		//Add CSS information from slideSorterReady

		//clearout stylename headtags
		var headTag =this.document.$.getElementsByTagName("head")[0];
		//var styleNodes = dojo.query('[stylename]',headTag);
		var styleNodes = dojo.query('style',headTag);
		
		var onlyKeepOneSpellcheckStyle = false;
		var onlyKeepOneRuntimeStyle = false;
		
		for (var i=0; i<styleNodes.length; i++){
			var node = styleNodes[i];
				// 14037 do not destroy runtimeStyle
			    // do not destroy spellcheck style D13574
				if(node.id == 'spellcheckStyle'){
					if(onlyKeepOneSpellcheckStyle)
						dojo.destroy(node);
					else 
						onlyKeepOneSpellcheckStyle = true;
				} else if(node.id == 'runtimeStyle'){
					if(onlyKeepOneRuntimeStyle)
						dojo.destroy(node);
					else 
						onlyKeepOneRuntimeStyle = true;
				} else  
					dojo.destroy(node);
				node=null; // Need to nullify to release node from memory
		}

        var designTemplate = contentBox.getActiveDesignTemplate();
        var cssArray = designTemplate.cssStylesOnSorterReady;
        if (cssArray==null || cssArray.length<1) {
            designTemplate.cssStylesOnSorterReady = [];
        }
 
        var nodesArray = contentBox.getActiveDesignTemplate().cssStylesOnSorterReady;       
		for (var i=0; i< nodesArray.length;i++) {
			concord.util.uri.createStyleNode(nodesArray[i],null,contentBox.editor.document.$);
		}
		//Add inline styles
		var inLineStyles = contentBox.getInLineStyles();
		if(headTag){
			for (var i=1; i< inLineStyles.length;i++){
				var styleNode = inLineStyles[i].cloneNode(true);
				if(dojo.isIE)
				{
					var tmpstyle = this.document.$.createElement("style");
					headTag.appendChild(tmpstyle);
					tmpstyle.outerHTML = styleNode.outerHTML;
				} else
					headTag.appendChild(styleNode);
				styleNode = null;
			}
		}
		PresCKUtil.createListStyleSheetinEditMode(this.document.$);

		contentBox.fixEditWindow();

		//Append current designTemplate styles
		var designCSS = contentBox.getActiveDesignTemplate().cssFiles;
		if (designCSS){
			for (var i =0; i<designCSS.length; i++){
				contentBox.injectCSS(designCSS[i],false);
			}
		}
		var liststyle = null;
		var styles = dojo.query("style[stylename='list_before_style']", headTag);
		if(styles!=null && styles.length>0){
			liststyle = styles[styles.length-1];
			if(styles.length>1){
				for (var i=0; i< styles.length;i++){
					headTag.removeChild(styles[i]);
				}
			}
		}
	},

	//
	// handle data ready
	//
	 handleDataReady: function(contentBox, event ){
			//window.TIME_CK_DATA_READY_START = new Date().getTime();
			//console.log("=======> TIMER - CK time to data ready "+(window.TIME_CK_DATA_READY_START - window.TIME_CLICK_FOR_EDIT )+" millsec.");
			contentBox.updateCKBodyClassAndContent();

			//Add events;
			if (this.firstPass){
				//story 40738		
				contentBox.disableDrag();
				
				// 7892 make sure you do not get a shaded border in IE
				if (dojo.isIE) {
					this.document.on('mousedown', dojo.hitch(contentBox,function(e){						
						if (this.boxSelected && this.isEditModeOn() && this.editor) {
							//7661 gjo when clicking in a content box temporarily
							//set an inline minHeight to auto for IE
							//to avoid having handles show up on the li
							dojo.query("li", this.editor.document.$.body).forEach(function(node, index, arr){
								dojo.style(node,"minHeight","auto");
							});
							if (contentBox.contentBoxType != PresConstants.CONTENTBOX_TABLE_TYPE) {
								var selection = this.editor.getSelection();
								if (selection == null) {
									this.moveCursorToLastEditableElement();
								}
							}
						}	
					}));
					this.document.on('mouseup', dojo.hitch(contentBox,function(e){						
						//7661 gjo remove minHeight set to auto once the user is
						//in edit mode
						setTimeout(dojo.hitch(this, function(){
							dojo.query("li", this.editor.document.$.body).forEach(function(node, index, arr){
								dojo.style(node,"minHeight","");
							});
						}),1);	
					}));
					//disable autlo linking in IE9, by default IE9 always auto detech a url or email and turns it into a hyperlink
					//we need to disable this.
					//task 14906
					if(dojo.isIE >= 9) {
						if(this.document!=null){
							this.document.$.execCommand("AutoUrlDetect", false, false);
						}
					}
				}
				
				//31744 disable default pageup/down behavior inside contentbox, except in speaker notes.
				// use dojo connect here(instead of document.on) to get a cross-platform dojo event
				if (contentBox.contentBoxType != PresConstants.CONTENTBOX_NOTES_TYPE) 
				{
					dojo.connect(this.document.$,"onkeydown",function(evt)
						{
							var key = evt.keyCode;
							if ((dojo.keys.PAGE_UP==key)||(dojo.keys.PAGE_DOWN==key))
							{
								evt.preventDefault();
								return;
							}
						});
				}
				
				this.document.on('click', dojo.hitch(contentBox,contentBox.selectThisBox));
				this.document.on('dblclick', dojo.hitch(contentBox,function(e){this.dbClickSelectAdjust(e);}));
				var dispacher=(dojo.isIE)?this.document:this.window;
				dispacher.on('keyup', dojo.hitch(contentBox,function(e){this.keyupHandler(e);}));
				if (!dojo.isIE){
					dispacher.on('mouseup', dojo.hitch(contentBox,function(e){this.handleEditorMouseUp(e);}));
				}

				// JMT disabling keydown dispatcher causes 42587
			
				if ( contentBox.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE){
					dispacher.on('keydown', dojo.hitch(contentBox,function(e){this.keydownHandler(e);}));
				}
							//CK3621 commented out both keypresshandler
							// only for text content boxes
				//			if (this.contentBoxType == PresConstants.CONTENTBOX_TEXT_TYPE || this.contentBoxType == PresConstants.CONTENTBOX_NOTES_TYPE)
				//			  this.on('key', dojo.hitch(contentBox,function(e){this.keypressHandler(e);}));
				
				//D14863 Problem with native browser save dialog appearing when 
				//pressing CTRL-S  added handler specifically for save draft event.
				// Also happens for CTRL-P for bringing up print dialog
				this.on('key', dojo.hitch(contentBox,function(e){this.suppressNativeDialog(e);}));
			}
			
			//Prep for coedit
			var userId = pe.authenticatedUser.getId();
	    	this.execCommand("createIndicatorSytle", {
	    		"user": userId
	    	});
	    	
	    	//Add Current Indicators to new CK
	    	var editorHead = this.document.getHead().$;
	    	for(var index in CKEDITOR.indicators) {
	    		var styleNode = dojo.clone(dojo.query('#'+index)[0]);
	    		if (styleNode){
	    			editorHead.appendChild(styleNode);
	    			if(dojo.isIE && styleNode.styleSheet)
	    			    styleNode.styleSheet.cssText = dojo.query('#'+index)[0].styleSheet.cssText;
	    		}
	    		styleNode = null;
	    	}

			//CK3621 ensure content editable for contentbox
			//contentBox.makeContentEditable();

			//dojo.query('#CSS_2')[0].innerHTML"
	    	//contentBox.createIndicatorSytle(userId);
	    	contentBox.toggleEditMode(true);
	    	
	    	//Set on mouse up event
			//Prevented IE expansion  now remove overflow then show handles
			if (dojo.isIE){
				
					if(dojo.hasClass(contentBox.mainNode, "g_draw_frame")!=true ||window.pe.scene.slideEditor.SINGLE_CK_MODE!=true){
						dojo.style(contentBox.mainNode,{
							'overflow':''
						});
					}
					if(dojo.hasClass(contentBox.mainNode, "g_draw_frame")!=true){
						contentBox.showHandles();
						//Change mainNode size back to px since now flashing window is over.
						var pxHIndex = contentBox.mainNode.style.height.indexOf('px');
				    	var pxWIndex = contentBox.mainNode.style.width.indexOf('px');
						if (contentBox.contentBoxType != PresConstants.CONTENTBOX_NOTES_TYPE) {
				    		if(pxHIndex >= 0) {
						    	contentBox.mainNode.style.height = contentBox.PxToPercent(contentBox.mainNode.style.height,'height')+"%";
							}
							if(pxWIndex >=0) {
						    	contentBox.mainNode.style.width  = contentBox.PxToPercent(contentBox.mainNode.style.width,'width')+"%";
							}
						}
				}
			}
//			if(dojo.hasClass(contentBox.mainNode,'isSpare')){
//				contentBox.disableMenuItemsOnNonEdit();
//				window.pe.scene.slideSorter.mainNode
//				var focusItem = dojo.byId('slideSorterContainer');
//				focusItem.focus();
//				concord.util.presToolbarMgr.setFocusSorterTb();
//			}
				
			if (this.firstPass){
				contentBox.editor.document.on('mouseup', dojo.hitch(contentBox,contentBox.checkCursorPosition));
			}
	    	var body =this.document.$.getElementsByTagName("body")[0];
	    	dojo.addClass(body,'ck_mainBody');
	    	//D111245: When printing PPT/ODP files using Docs Editor, the text is printed with wrong font
	    	//D32315: [Regression][IE]There is no font family in new textbox/Table after import a ODP file
	    	//We use Arial as the default fontsize
	    	switch ( g_locale.toLowerCase() ) {
		        case 'ja':
		        case 'ja-jp':
		        	body.style.fontFamily="'MS UI Gothic','MS PGothic','Apple Gothic','Arial','Helvetica','sans-serif'";
		            break;
		        case 'ko':
		        case 'ko-kr':
		        	body.style.fontFamily="'Gulim','GulimChe','Arial','Helvetica','sans-serif'";
		            break; 
		        default:
		        	body.style.fontFamily="'Arial','Helvetica','sans-serif'";
		            break;
	        }
	    	
	    	
	    	// fix for defect 17198 to prevent scrollbars in ff17
	    	dojo.style(body, 'overflow', 'hidden');
	    	//D30145: Part of text of imported no-wrap textbox is not visible when edit. 
	    	if(contentBox.contentBoxType == PresConstants.CONTENTBOX_TEXT_TYPE){
	    		body.firstChild.firstChild.style.whiteSpace = 'pre-wrap';
	    		body.firstChild.firstChild.style.wordWrap = 'break-word';
	    		//body.firstChild.firstChild.style.wordBreak = 'break-all';
	    	}
	    	
	    	if (!window.pe.scene.slideEditor.SINGLE_CK_MODE && contentBox.editor.config.isSpareBox ||
		    	    window.pe.scene.slideEditor.SINGLE_CK_MODE && window.pe.scene.slideEditor.createPackageOnClick.createNewContentBox){
		    		contentBox.editor.newBox = true;
		    }else {
	    		if (!contentBox.createFromLayout && !contentBox.isEmptyCBPlaceholder) {
	    			contentBox.editor.newBox = false;  //If this is an existing text box with content already set then set to false
	    		}
	    	}

			if(dojo.hasClass(contentBox.mainNode,'isSpare')){
				//console.log("***************************** completeLoad");
				//contentBox.disableMenuItemsOnNonEdit();
				//this.setReadOnly();
				this.on('focus',dojo.hitch(contentBox,'blurSpareBox'));
				this.on('selectionChange',dojo.hitch(contentBox,'blurSpareBox'));
			}
			//CK3621 We need contentbox obj reference in CK	and also let's store dfc and isTable flag
	    	this.contentBox=contentBox;
	    	this.isSpeakerNotes = false;
	    	if(contentBox.contentBoxType!=PresConstants.CONTENTBOX_TABLE_TYPE){
	    		this.dfc = PresCKUtil.getDFCNode(this);
	    		if(this.dfc!=null){
		    		this.dfcParent =  dojo.clone(this.dfc.parentNode); //we may need this if dfc gets destroyed by range
		    		this.isTable= false;
		    		if (contentBox.contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE){
		    			this.isSpeakerNotes = true;
		    		}
	    		}
	    	}else{
	    		this.dfcParent =  dojo.clone(this.document.$.body.firstChild); // the actual table
				this.isTable= true;
	    	}
	    	//CK3621 Let's reset timer for on keydown
	    	this.continueInput = false;
	    	this.preInput = null;
	    	this.synchAllTodoCtr=0;
	    	PresCKUtil.cleanSynchAllParams(this.editor);
	    	//Remove extra child of body when entering edit mode
	    	//CK3621 the cleanBody function is temporary until we fix the mysterious P
	    	contentBox.cleanBodyChildren(body);
	    
	    	
	    	//console.log("=======> TIMER - data ready  Total time "+(new Date().getTime() - window.TIME_CK_DATA_READY_START)+" millsec.");
			//window.TIME_CK_DATA_READY_START = null;
			contentBox.handleCursorOnEdit();
			
			//13550 and 21167
			//if it's a group text box, need to adjust editor so that it shows the full text even though the text 
			//overflow the graphic
			if(dojo.hasClass(contentBox.mainNode, "g_draw_frame")){
				contentBox.editorAdjust();
			}
			
			if (contentBox.editor){//D7279 get initial snap shot on entering edit mode
				PresCKUtil.setPreSnapShot(contentBox.editor);
				contentBox.editor.initSnapShot = PresCKUtil.cloneSnapShot(contentBox.editor.preSnapShot);
			}
			if (contentBox.contentBoxType != PresConstants.CONTENTBOX_NOTES_TYPE && !contentBox.isSpare){
				concord.util.presToolbarMgr.toggleVerticalAlignButton('on');
			}
			editorHead = null;
			body = null;
			dispacher = null;
			this.firstPass = false;
			contentBox.preventSynch = false;
	 },
	
	handleCursorOnEdit: function(){
		if (!dojo.hasClass(this.mainNode, 'isSpare')) {
			if (!this.isEditModeOn()) {
				return;
			}
			var contentBox = this;
			var ev = this.editor;
			function cancel( event ) {
				event.cancel();
				if (event.data.stopPropagation) {
					event.data.stopPropagation();
				}
				if (event.data.preventDefault) {
					event.data.preventDefault();
				}
				if (event.stop) {
					event.stop();
				}
			}
			PresCKUtil.lockInput = true;
			ev.document.on( 'mousedown', cancel,  null, null, 0 );
			//D36216 [Regression][IE]Failed to insert a row/column after undo in table
			//restore the timer back to fix 36216
			if(pe.undoInTable && dojo.isIE && contentBox.editor.isTable){
				pe.undoInTable = false;
				contentBox.updateCKBodyHeight();
				var mainId = contentBox.mainNode.id;
				var doc = PROCMSG._getSorterDocument();
				if (doc!=null){
					var slideEditorMainNode = pe.scene.slideEditor.mainNode;
					var slideEditorHeightinPX = dojo.isIE ? slideEditorMainNode.offsetHeight: dojo.style(slideEditorMainNode, 'height');
					var sorterBody = doc.body; 
					var sorterNode = dojo.query("#"+mainId,sorterBody);
					if (sorterNode!=null && sorterNode.length>0){						
						dojo.query('tr', ev.document.$.body).forEach(function(tr){
							var sorterTrNodes = dojo.query("#"+tr.id,sorterBody);
							tr.style.height = sorterTrNodes[0].style.height;
							var trH = dojo.isIE? tr.offsetHeight : dojo.style(tr, "height");
							dojo.attr(tr, {
								'presrowheight': trH * 1000 / slideEditorHeightinPX
							});
						});
					}
				}
			}
			setTimeout(function(){
				try{					
					ev.focus();
					ev.document.$.body.focus();
					var selection = ev.getSelection();
					if (selection == null) {
						window.pe.scene.BYPASS_DOCUMENT_OWNER_TEST=true;											
						selection = ev.getSelection();
						window.pe.scene.BYPASS_DOCUMENT_OWNER_TEST=false;
					}
					
					var child = ev.document.getBody().getChild(0);
					if (child.is('ul')){
						child = child.getLast(); // get li element
					}
					if (child.$.tagName.toLowerCase() =='table'){
						child = child.$.rows[0].firstChild;
						child = new CKEDITOR.dom.node( child );
						if (contentBox.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE){
							PresCKUtil.addBR(contentBox.editor);
							contentBox.moveCursorToLastEditableElement();
		    			}
					}
					//move cursor to the first positon if there is noly one space
					if(contentBox.contentBoxType==PresConstants.CONTENTBOX_TEXT_TYPE || contentBox.contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE){
						child.$.normalize();
						
						// add br to the end of every p if there is none (48199)
						// to be handled in pres/ProcMsg
						PresCKUtil.addBR(contentBox.editor);
						
						contentBox.removeMozBRs(child.$);
						//D23078 when speakernotes get focus, move the cursor to the end of all the text, keep speakernotes the same as normal contentbox. And speakernotes is never newBox
						contentBox.moveCursorToLastEditableElement();
					}
				} catch(e){
					ev.focus();
					var selection = ev.getSelection();
					if(selection){
						var range = selection.getRanges()[0];
						var child = ev.document.getBody().getChild(0);
						if(range){
							range.moveToElementEditEnd( child,true );
							range.select();
						}
						
					}
				}
				//CK3621 ensure content editable for contentbox
				// JMT PERF - we do not need this call contentBox.makeContentEditable();
				contentBox.fixContentDisplay();
				
		    	//
		    	//CK3621 need this for FF move cursor on first editing
		    	//
		    	if (dojo.isFF){
		    		dojo.attr(ev.document.$.body,'contenteditable','false');
		    		dojo.attr(ev.document.$.body,'contenteditable','true');

		    		//the following 2 lines of code disable the native handles.
		    		ev.document.$.execCommand("enableObjectResizing", false, "false");
		    		ev.document.$.execCommand("enableInlineTableEditing", false, "false");
		    	}
		    	contentBox.editorAdjust(null, null, true);
				//console.log("==============> TIMER - End clik for Edit Mode "+(new Date().getTime() - window.TIME_CLICK_FOR_EDIT )+" millsec.");
				//window.TIME_CLICK_FOR_EDIT =null;
				PresCKUtil.adjustToolBar(["BOLD","FONTSIZE", "FONTNAME", "ITALIC", "UNDERLINE", "LINETHROUGH"]);
				//D14848
				PresCKUtil.adjustToolBarForList(ev);
				PresCKUtil.lockInput = false;
				ev.document.removeListener( 'mousedown', cancel );
				contentBox = null;
				ev = null;
				child = null;
			}, dojo.isIE ? 500 : 0);
//			}, dojo.isIE || dojo.isFF < 4? 1000:500);
//			},10);
		}
		
	},
	
	//Sends focus on sorter when attempt
	//is made to focus the spareBox
	blurSpareBox: function(){
		//console.log("***************************** blurSpareBox: Entry");
		if (dojo.hasClass(this.mainNode,'isSpare')){
			//console.log("***************************** blurSpareBox: This is a spare");
//			concord.util.presToolbarMgr.setFocusSorterTb();
//			CKEDITOR.instances.editor1.focus();
			document.body.style.cursor='auto';
		}
		//console.log("***************************** blurSpareBox: Exit");
	},

	
	dbClickSelectAdjust:function(e){
		
	},

	//CK3621 this function is temporary
	//On entering edit mode there seems to be an extra p tag with moz type attr defined. This
	// p tag is a sibling of the draw_fram classes div and must be removed
	cleanBodyChildren: function(body){
		var ckBody=null;
		if (body==null){
			ckBody = this.editor.document.$.getElementsByTagName("body")[0];
		}else {
			ckBody = body;
		}
		if (ckBody.childNodes.length > 1) {
			for  (var i=ckBody.childNodes.length-1; i>=0; i--){
				var child = ckBody.childNodes[i];
				// defect 14827 make sure table node is not destroyed
				if (child.nodeName.toLowerCase() != 'div' && child.nodeName.toLowerCase() != 'table') {
					dojo.destroy(child);
					child = null;
				}
			}
		}
		ckBody = null;
	},
	
	handleEditorMouseUp: function(e){
		 var eventData = [{'eventName':concord.util.events.keypressHandlerEvents_eventAction_OUTSIDE_EDITOR ,'e':e}];
		 concord.util.events.publish(concord.util.events.keypressHandlerEvents, eventData);
	},
	
	keyupHandler:function(e){
		if(!this.isEditModeOn())
			return;
		var key = e.data.getKey();
		var keyStroke = e.data.getKeystroke();
		var contentChange = PresCKUtil.isVisibleKey(key, keyStroke, e && e.data && e.data.$)
		//D36520, D38547, D39780, D33403, D36943
		//D41727, D41736
		if(this.editor.isCommdV || this.editor.isCommdX){
			contentChange = true;
			delete this.editor.xpressed;
			delete this.editor.vpressed;
		}else if(this.editor.isCommdC || this.editor.isCommdA){
			contentChange = false;
			delete this.editor.cpressed;
			delete this.editor.apressed;
		}else{
			contentChange = PresCKUtil.isSpecialKeysCauseContentChange(this.editor, key, contentChange);
		}
		//D43083: [B2B][Regression]ESC is not work to exit edit mode after paste text
		contentChange =  contentChange || key==27; //D8517 we need esc to go out of edit mode
		if (!this.editor.config.isSpareBox && contentChange){
			this.cleanBodyChildren();

			var fromUndo = false;
			if(key == 90 || key == 89 || keyStroke == CKEDITOR.CTRL + 90 || keyStroke == CKEDITOR.CTRL + 89)
				fromUndo = true;
			if(!fromUndo)
			{
				//Now adjust height
				var ckBody = this.editor.document.getBody().$;
				if (this.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE) {
					var totalRowH = PresTableUtil.setRowHeightWithPresValue(dojo.query("table", ckBody)[0]);
					dojo.style(ckBody, 'height', totalRowH + "px");
				}

			}
			
			if((key == 13 || key == CKEDITOR.SHIFT + 13) && concord.util.browser.isMobile())
			{
				// in mobile, enter will happened later than editorAdjust, so there set a timer.
				setTimeout(dojo.hitch(this,function(){
						this.editorAdjust(e, null, fromUndo || !this.editor.prekeyMultiCellSelected);
				}), 0);
			}
			else{
				if(keyStroke != CKEDITOR.CTRL + 65){ //ctrlA does not need to adjust editor
					//D40327
					if(!PresCKUtil._pastetabletocell){
						this.editorAdjust(e, null, fromUndo || !this.editor.prekeyMultiCellSelected);//don't update table row height
					}
					else{
						delete PresCKUtil._pastetabletocell;
					}
				}
			}
			
			//D28938 [GVT][Table][Presentation][DBCS] Some content cannot be displayed completely when in edit table mode.
			if(this.editor.webkitIMEMode && dojo.isSafari)
				return;
				
			PresCKUtil.adjustToolBar(["BOLD","FONTSIZE", "FONTNAME", "ITALIC", "UNDERLINE", "LINETHROUGH"]);
		}
		
		this.editor.isCommdV && (delete this.editor.isCommdV);
		this.editor.isCommdX && (delete this.editor.isCommdX);
		this.editor.isCommdC && (delete this.editor.isCommdC);
		this.editor.isCommdA && (delete this.editor.isCommdA);
	},
	
	//defect 35454
	removeAddrBR:function(e){
	},
	
	//defect 35505
	cursorPositionAdjust:function(e){
		
	},
	
	selectionAdjust:function(e){
		
	},
	keydownHandler:function(e){
		if(!this.isEditModeOn()){
		    if(dojo.isSafari && !concord.util.browser.isMobile())
	            pe.scene.clipboard.focusClipboardContainer();		    
		    return;
		}
	},
	
	//D14863 -- Save specific
	// Problem with native browser dialogs like save or print appearing when 
	// pressing shortcut keys.  Added handler specifically for save draft and print events.
	suppressNativeDialog: function(e) {
		var keystroke = e && e.data.keyCode;
		this.lastKeyStroke = keystroke;	  
		if(keystroke == CKEDITOR.CTRL + 83){
			e.cancel();     	
			
			setTimeout(function(){
				var eventData = [{'eventName':concord.util.events.keypressHandlerEvents_eventName_keypressEvent ,'e':null,'eventAction':concord.util.events.keypressHandlerEvents_eventAction_SAVE}]; 
				concord.util.events.publish(concord.util.events.keypressHandlerEvents, eventData);
			},0);
			
			return;
		}
		
		if(keystroke == CKEDITOR.CTRL + 80){
			e.cancel();     	
			 // Interesting behavior in Safari in that you cannot do a callback and get 
			 // window.open to work reliably.  The callback is necessary in FF, IE, Chrome to 
			 // prevent the native browser print dialog from opening.
			if (dojo.isSafari) {
				setTimeout(function(){
					var eventData = [{'eventName':concord.util.events.keypressHandlerEvents_eventName_keypressEvent ,'e':null,'eventAction':concord.util.events.keypressHandlerEvents_eventAction_PRINT}]; 
					concord.util.events.publish(concord.util.events.keypressHandlerEvents, eventData);
				},0);
			} else {
				var eventData = [{'eventName':concord.util.events.keypressHandlerEvents_eventName_keypressEvent ,'e':null,'eventAction':concord.util.events.keypressHandlerEvents_eventAction_PRINT}]; 
				concord.util.events.publish(concord.util.events.keypressHandlerEvents, eventData);				
			}
			
			return;
		}

	},
	
	/*
	 * for some reason, the keydownHandler doesn't get fired in a text content box
	 * (but does for a table content box). this allows the "normal" event to happen
	 * (i.e. CTRL+A will select all data in a text content box automatically).
	 */
	keypressHandler:function(e){
		if(!this.isEditModeOn())
			return;
		var keystroke = e && e.data.keyCode;
		this.lastKeyStroke = keystroke;
	    if ( keystroke == CKEDITOR.CTRL + 65 ) //CTRL+A
	    {
          var kpEditor = e.data.editor || e.sender;
	      // if editor param, then we were manually triggered
	      if (!kpEditor)
	        return;
	      
	      // if we were manually triggered, we need to select all text programmatically
	      kpEditor.focus();
	      var selection = kpEditor.getSelection(),
	          range = selection && selection.getRanges()[0];
	      if (range) {
	        // get to the container's root DIV (in case the content itself has any DIVs).
	        // hint: it's a 'draw_frame_classes'
	        var containerDiv = range.startContainer.getAscendant('div');
	        while (containerDiv && !(containerDiv.hasClass( 'draw_frame_classes' ) || containerDiv.hasClass( 'draw_shape_classes' ))) {
	          containerDiv = containerDiv.getAscendant('div');
	        }
	        if (!containerDiv)
	          return; // shouldn't happen, but just in case
	        
	        var availItems = containerDiv.getChildren(),
	            newStart = availItems.getItem(0),
	            newEnd = availItems.getItem( availItems.count() - 1 );
	        range.setStartBefore( newStart );
	        range.setEndAfter( newEnd );
	        range.select();
	        
	        kpEditor.forceNextSelectionCheck();
	        kpEditor.selectionChange();
	      }
	    }
	},
	
	//
	// check Cursor position
	//
	checkCursorPosition: function(selection){
		 //console.log("contentBox Editor mouse up - Entry");
			 var selection = this.editor.getSelection();
			 if (selection != null) {
				 var curNode = selection.getStartElement().$;
				 //console.log("contentBox Editor startElement "+selection.getStartElement().getName());
				 if (((selection.getStartElement().getName().toLowerCase()=='div') &&(dojo.hasClass(curNode,'draw_frame_classes'))) ||
					((selection.getStartElement().getName().toLowerCase()=='div') &&(dojo.hasClass(curNode.childNodes[0],'draw_frame_classes')))){
					 this.moveCursorPositionToLastNode(selection);
				 } 
				 curNode = null;
				 //D43431: [Regression][IE11]Put focus after list symbol, input string the new input string size is not correct
				 if(dojo.isIE){
					 var range = selection.getRanges()[0];
					 var info = PresListUtil.getListSelectionRangeInfo(range);
					 if(info && info.bCollapsed && info.startSelection.lineTextOffset==0){
						 var isLi = range.startContainer.getAscendant( 'li', true );
						 if(isLi){
							 var isFirstSpan = range.startContainer.getAscendant( 'span', true );
							 if(isFirstSpan){
								 PresCKUtil.moveCursorToBeginningOfNode(isFirstSpan.$||isFirstSpan,selection);
							 } else { //range is at li,move to first Span
								 if (isLi.firstChild && isLi.firstChild.nodeName.toLowerCase() == "span") {
									 PresCKUtil.moveCursorToBeginningOfNode(isLi.firstChild,selection);
								 }
							 }
						 }
					 }
				 }
			 }			 
		 
			 //previse defect D14848 and D14317 have been verfied
			 //give broswer 100ms time to wait selection updated.
			  var timeout = dojo.isIE ? 800 : 100;
			 setTimeout(dojo.hitch(this, function(){
					PresCKUtil.adjustToolBar(["BOLD","FONTSIZE", "FONTNAME", "ITALIC", "UNDERLINE", "LINETHROUGH"]);
					PresCKUtil.adjustToolBarForList(this.editor);
				}),timeout);
			 
		 //console.log("contentBox Editor mouse up - Exit");
	},

    moveCursorPositionToLastBullet: function(selection){
        if (selection != null && selection.document != null) {
            var range = new CKEDITOR.dom.range(selection.document);
            var bullet = null;
            if (selection.getStartElement().getName().toLowerCase()=='ul') {
                bullet = selection.getStartElement().$;
                bullet = bullet.lastChild ? bullet.lastChild : bullet;
            } else if (selection.getStartElement().getName().toLowerCase()=='li') {
                bullet = selection.getStartElement().$;
                bullet = bullet.parentNode.lastChild ? bullet.parentNode.lastChild : bullet;
            } else {
                // Presentations
                // On undo operations, the moveCursorPositionToLastBullet function above
                // could have adjusted the range such that the cursor is in the SPAN (and
                // not on the LI anymore). We need to account for that.
                var li = selection.getStartElement().getAscendant('li', true);
                if (li) {
                    bullet = li.$.parentNode.lastChild ? li.$.parentNode.lastChild : li.$;
                } else
                    return;	// not a bullet
            }
        
            var lastNode = bullet;
            while (lastNode && lastNode.childNodes && lastNode.childNodes.length > 0)
            	lastNode = lastNode.childNodes[lastNode.childNodes.length-1];
            if (!lastNode)
            	return;
            this.removeMozBRs(lastNode);
            var cursorPos = CKEDITOR.POSITION_BEFORE_END;
            if (typeof lastNode.childNodes != undefined && lastNode.childNodes != null && lastNode.childNodes.length > 0) {
                if ((lastNode.lastChild.nodeName.toLowerCase() == 'br' && lastNode.lastChild.previousSibling)
                        || (lastNode.lastChild.isElementContentWhitespace != null && lastNode.lastChild.isElementContentWhitespace && lastNode.lastChild.previousSibling) ) {   // if a <br> or empty text node then get the prev sibling
                    lastNode = lastNode.lastChild.previousSibling;
                } else {
                    lastNode = lastNode.lastChild;
                    if (lastNode.nodeName.toLowerCase() == 'br') {
                    	cursorPos = CKEDITOR.POSITION_BEFORE_START;
                    }
                    if (window.pe.scene.session.isSingleMode() && dojo.hasClass(lastNode,"indicatortag")) {
            			cursorPos = CKEDITOR.POSITION_AFTER_END;
            		}
                }
            }
            
            var lastNodeCk = new CKEDITOR.dom.node(lastNode);
            range.setStartAt( lastNodeCk, cursorPos );
            range.setEndAt( lastNodeCk, cursorPos );
            range.collapse(true);
            selection.selectRanges( [ range ] );
        }
    },

    //
    //Move cursor position to node
    //
    moveCursorPositionToLastNode: function(selection){
        //console.log("moveCursorPositionToLastNode Editor mouse up - Entry");
        if (selection != null && selection.document != null && !dojo.hasClass(this.mainNode,'isSpare')) {
            var range = new CKEDITOR.dom.range(selection.document);
            var drawFramClasses = dojo.query('.draw_frame_classes', this.editor.document.$.body);
            //might this object is shape
            if(drawFramClasses.length == 0)
            	drawFramClasses = dojo.query('.draw_shape_classes', this.editor.document.$.body);
            var drawFramClassesDiv = null;
            if (drawFramClasses && drawFramClasses.length>0){
                drawFramClassesDiv = drawFramClasses[0];
            }
         
            var lastNode = (drawFramClassesDiv && drawFramClassesDiv.childNodes && drawFramClassesDiv.childNodes.length > 0) ? drawFramClassesDiv.childNodes[drawFramClassesDiv.childNodes.length-1] : drawFramClassesDiv;
            while (lastNode && lastNode.childNodes && lastNode.childNodes.length > 0)
            	lastNode = lastNode.childNodes[lastNode.childNodes.length-1];
            if (!lastNode)
            	return;
            
            this.removeMozBRs(lastNode);
            var cursorPos = CKEDITOR.POSITION_BEFORE_END;
            if (lastNode.nodeName.toLowerCase() == 'br') {
            	if (lastNode.previousSibling) {
            		lastNode = lastNode.previousSibling;    // set the stage to set the range before br
            		// We used to move the cursor to CKEDITOR.POSITION_AFTER_END only when not coediting.
            		// In order to fix defect 7040 that check has been removed, it looks like CKEDITOR.POSITION_AFTER_END
            		// works for a single editor as well as for multiple editors
            		if (dojo.hasClass(lastNode,"indicatortag")) {
            			cursorPos = CKEDITOR.POSITION_AFTER_END;
            		}
            	} else {
            		cursorPos = CKEDITOR.POSITION_BEFORE_START;
            	}
            }

            var lastNodeCk = new CKEDITOR.dom.node(lastNode);
            range.setStartAt( lastNodeCk, cursorPos );
            range.setEndAt( lastNodeCk, cursorPos );
            range.collapse(true);
            selection.selectRanges( [ range ] );
        }
        //console.log("moveCursorPositionToLastNode Editor mouse up - Exit");
    },
    
    //
    // Moves cursor to an editable area after undo/redo
    //
    moveCursorToLastEditableElement: function(nodeId){
    	if (this.isEditModeOn() && this.editor){
    		//console.log('moveCursorAfterUndoRedo');
    		
    		if (nodeId==null){
    			var dfc = PresCKUtil.getDFCNode(this.editor);
    			if (dfc){
    				nodeId= dfc.id;
    			} else{
    				return;
    			}
    		}
    		if (this.editor.isTable){
				var table =dojo.query('.smartTable',this.editor.document.$.body);
				// first cell is always the default selected if there is no other selected cell
				if(table.length == 0)
					return;
				var rows = table[0].rows;
				if(rows.length == 0)
					return;
				
				var firstTd = rows[0].firstChild; 
    			dojo.removeClass( firstTd, 'selectedSTCell' );
    			//get selected cell and move cursor there
    			var sc =dojo.query('.selectedSTCell',this.editor.document.$.body);
    			
    			if (sc && sc.length>0 && sc[0].id !=null && sc[0].id.length!=0){
    				nodeId=sc[0].id;
    			} else {
					nodeId = firstTd.id;
    			}
    			
    			if ( sc.length > 1){
        			dojo.query('.selectedSTCell', this.editor.document.$.body).removeClass('selectedSTCell');
    			}
    		}
    		var curNode = this.editor.document.$.getElementById(nodeId);
    		var ckNode =  new CKEDITOR.dom.node(curNode);
    		var range = new CKEDITOR.dom.range( this.editor.document);
    	    range.setStart(ckNode,0);
    		range.collapse(true);
    		range.moveToElementEditEnd(ckNode);
    		// D9084 - if end container is a BR, then move it back one
    		var ndx = range.startOffset == 0 ? range.startOffset : range.startOffset - 1,
    		    last = MSGUTIL.getChildNode( range.startContainer, ndx );
    		// In some cases range.startContainer is the last empty span (typically the coediting span) 
    		// which causes last to be null as it doesn't have any child node.  Let's take this into account.
    		if ( !last ) {
    			last = range.startContainer.getParent().getLast();
    			while (MSGUTIL.isBlock(last)) {
    				last = last.getLast();
    			}
    		}
    		if (PresCKUtil.checkNodeName(last, 'br')) {
    			last = last.getPrevious ? last.getPrevious() : last.$.previousSibling;
//    			// Remove ending br as it messes block boundary calculation in IE
//    			if (dojo.isIE && last) {
//    				dojo.destroy(last.$.nextSibling);
//    			}
    		}
    		if ( last) {
    			var cursorPos = CKEDITOR.POSITION_BEFORE_END;
    			// get last non-empty span
    			var prev = last;
    			while (prev) {
    				last = prev;
    				if (!PresCKUtil.isTextEmpty(prev.$)) {
               			cursorPos = CKEDITOR.POSITION_BEFORE_END;
    					break;
    				}
    				
    				prev = prev.getPrevious ? prev.getPrevious() : prev.$.previousSibling;
    				if (prev)
    					dojo.destroy(prev.$.nextSibling);
    			}

            	range.setStartAt(last , cursorPos );
    		    range.collapse( true );
    		}
    		
    		// 13376 if we have a span as the last child of a span then we need to set the
    		// cursor position to before the end of the last child
    		if ( last && last.is && last.is( 'span' ) ) {
    			var checkLastNodeSpan = last.getLast();
    			if (checkLastNodeSpan && checkLastNodeSpan.is && checkLastNodeSpan.is( 'span' )) {
    				last = checkLastNodeSpan;
    				cursorPos = CKEDITOR.POSITION_BEFORE_END;
    				range.setStartAt(last , cursorPos );
        		    range.collapse( true );
    			}
    		}
    		
    		range.select(); 
    		if (this.editor.isTable){
    			this.editor.execCommand('makeSmartTableCellActive');
    		}
		PresCKUtil.adjustToolBar(["BOLD","FONTSIZE", "FONTNAME", "ITALIC", "UNDERLINE", "LINETHROUGH"]);
    		//D14848
    		window.PresCKUtil.adjustToolBarForList(this.editor);
    	}else{
    		//console.log('could not move cursor to position after undo');
    	}
    },
    
    
    moveCursorPositionToLastNodeOfTableCell: function ( tableCell, selection){
	    if (selection != null && selection.document != null) {
	    	var range = new CKEDITOR.dom.range(selection.document);
	    	var lastNode = tableCell.lastChild;
	    	while (lastNode && lastNode.childNodes && lastNode.childNodes.length > 0)
            	lastNode = lastNode.childNodes[lastNode.childNodes.length-1];
            if (!lastNode)
            	return;
	    	this.removeMozBRs(lastNode);
	    	var cursorPos = CKEDITOR.POSITION_BEFORE_END;
            if (lastNode.nodeName.toLowerCase() == 'br') {
            	if (lastNode.previousSibling) {
            		lastNode = lastNode.previousSibling;    // set the stage to set the range before br
            		// We used to move the cursor to CKEDITOR.POSITION_AFTER_END only when not coediting.
            		// In order to fix defect 7040 that check has been removed, it looks like CKEDITOR.POSITION_AFTER_END
            		// works for a single editor as well as for multiple editors
            		if (dojo.hasClass(lastNode,"indicatortag")) {
            			cursorPos = CKEDITOR.POSITION_AFTER_END;
            		}
                }
            }
            var lastNodeCk = new CKEDITOR.dom.node(lastNode);
            range.setStartAt( lastNodeCk, cursorPos );
            range.setEndAt( lastNodeCk, cursorPos );
            range.collapse(true);
            selection.selectRanges( [ range ] );
            range = null;
            lastNode = null;
            lastNodeCk = null;
    	}
    },
 
    fixShapeBox: function(ckBody, height, width) {
		var dataNode = null;
		var trDataNode = null;
		if (height == null) {
			height = dojo.style(this.mainNode,'height')+'px';
			
			//If this is a shape set height to text node height (D 14332)
			if(this.isShape()) {
				var txtNodes = dojo.query(".draw_text-box",this.mainNode);
				if(txtNodes && txtNodes.length>0)				
					height = dojo.style(txtNodes[0].parentNode,'height')+'px';
			}
			width = "100%";
		}
		if (!ckBody) {
			dataNode  = dojo.query("#cke_"+ this.txtContent.getEditorName(),this.txtContent.mainNode)[0];
		} else {
			dataNode  = dojo.query("#cke_"+ this.getEditorName(),this.mainNode)[0];
		}
		if (dataNode) {
			dojo.style(dataNode,{'position': 'relative', 'top': '0%', 'left': '0%', 'width': '100%', 'height': '100%', 'vertical-align': 'middle'});
		}
		if (!ckBody) {
			trDataNode  = dojo.query("#cke_contents_"+ this.txtContent.getEditorName(),this.txtContent.mainNode)[0];
		} else {
						trDataNode  = dojo.query("#cke_contents_"+ this.getEditorName(),this.mainNode)[0];
		}
		if (trDataNode) {
			dojo.style(trDataNode,{'height': ''+height+''});
			dojo.style(trDataNode,{'width': ''+width+''});
		}
		var iFrame  = dojo.query('iframe',this.mainNode)[0];
		if(iFrame){
			if (dojo.isWebKit){
				dojo.style(iFrame,{'display':'none'});
				dojo.style(iFrame,{'display':'block'});
			}
			dojo.style(iFrame.contentDocument.body,{'overflow':'hidden'});
			iFrame.contentDocument.body.style.height = ''+height+'';
			iFrame.contentDocument.body.style.width = ''+width+'';
		}
    },
    
	updateCKBodyHeight: function(){
		var ckBody = null;
		window.pe.scene.validResize = false;
		try{
			if ( this.editor){
				ckBody =  this.editor.document.getBody().$;
			}
			if (dojo.isIE){ //JMT fix for flashing CK on entering edit
				var pxHIndex = this.mainNode.style.height.indexOf('px');
				var pxWIndex = this.mainNode.style.width.indexOf('px');
					
				var heightPlusPadding =(pxHIndex >= 0) ? parseFloat(this.mainNode.style.height): this.PercentToPx(this.mainNode.style.height,'height');
				var widthPlusPadding = (pxWIndex >=0 )? parseFloat(this.mainNode.style.width): this.PercentToPx(this.mainNode.style.width, 'width');

				if (ckBody){
					if(this.isShape()){
						ckBody.style.height = this.mainNode.offsetHeight + "px";
					}else{
						ckBody.style.height = (heightPlusPadding) +"px";
					}
					// D25495, invoke fixShapeBox for table on all browsers
					this.fixShapeBox(true, ''+heightPlusPadding+'px', ''+widthPlusPadding+'px');
				} else {
					this.fixShapeBox(false, ''+heightPlusPadding+'px', ''+widthPlusPadding+'px');
				}
			} else {
				if (ckBody) {
					dojo.style(ckBody,{'height':dojo.style(this.mainNode,'height')+'px'});
					// D25495, invoke fixShapeBox for table on all browsers
					this.fixShapeBox(true, null, null);
				} else {
					this.fixShapeBox(false, null, null);
				}
			}
			
		}catch(e){
            //console.log("update CK Body height has error:"+e);
		}
		ckBody = null;
		window.pe.scene.validResize = true;
	},
	
	updateCKBodyWidth:function(){
		var ckBody;
		if ( this.editor){
			ckBody =  this.editor.document.getBody().$;
		}
		
		if (dojo.isIE){ //JMT fix for flashing CK on entering edit
			var pxWIndex = this.mainNode.style.width.indexOf('px');
				
			var widthPlusPadding = (pxWIndex >=0 )? parseFloat(this.mainNode.style.width): this.PercentToPx(this.mainNode.style.width, 'width');
			if ( ckBody){
				ckBody.style.width = widthPlusPadding +"px";
			}
		} else{
			var dataNode  = dojo.query("#cke_"+this.getEditorName(),this.mainNode)[0];
			dojo.style(dataNode,{'width':dojo.style(this.mainNode,'width')+'px'});
			if ( ckBody){
				dojo.style(ckBody,{'width':dojo.style(this.mainNode,'width')+'px'});
			}
		}
		ckBody = null;
	},
	
	disableDrag: function(){
		this.editor.document.on('dragstart', dojo.hitch(this,this.handletableOnDrag));
		this.editor.document.on('drop', dojo.hitch(this,this.handletableOnDrop));
	},
	
	handletableOnDrag : function(e){
		e.data.preventDefault();
		e.data.stopPropagation();
		return false;
	},
	handletableOnDrop : function(e){
		e.data.preventDefault();
		e.data.stopPropagation();
		return false;
	},
	
	//
	// Updates the classes in CKEditor Body tag and initializes CK content
	//
	updateCKBodyClassAndContent: function(){
		var classes = this.mainNode.className;
		var body= this.editor.document.getBody().$;
		var cursorPos = null;
		//D22959: [Chrome] text-size will be enlarged when the text-box be selected
		if(dojo.isWebKit)
		dojo.style(body,'-webkit-text-size-adjust','none');
		
		dojo.attr(body,'pfs',dojo.attr(this.mainNode,'pfs'));
		dojo.addClass(body,"oneui30 lotusui30");
		dojo.addClass(body.parentNode,"oneui30 lotusui30");
		dojo.addClass(body,classes);
		dojo.removeClass(body,'concord_Doc_Style_1');

		var classes = this.mainNode.parentNode.className;
		dojo.addClass(body,classes);
		dojo.removeClass(body,'PM1');
		dojo.removeClass(body,'PM1_concord');
		body.style.marginTop = "0px";
		body.style.marginBottom = "0px";
		//13550 - if g_drawFrame for shapes we need to get rid of margin right and left too
		// otherwise the content in edit mode is more squished then in non-edit mode
		//for some reason by default the body ck has margin left and right 8 px set.
		if(dojo.hasClass(this.mainNode,'g_draw_frame')== true){
			body.style.marginLeft = "0px";
			body.style.marginRight = "0px";
		}
		// #32388 Safari's fontSize maybe not a integer, and will be different with the value: dojo.style(x,'fontSize')
		body.style.fontSize = dojo.isWebKit ? window.pe.scene.slideEditor.mainNode.style.fontSize : dojo.style(this.mainNode,'fontSize');
		body.style.lineHeight = dojo.style(this.mainNode,'lineHeight')+"px";
		//inject following in css header
		var domDoc = this.editor.document.$;
		var docURL = window.contextPath + window.staticRootPath + '/styles/css/';
		var fromAttachment = false;
		//concord.util.uri.injectCSS(domDoc,docURL+'presentations/slideEditor.css',fromAttachment);
		//concord.util.uri.injectCSS(domDoc,docURL+'smartTables/smartTablesExhibit.css',fromAttachment);

		//Now let's remove defaultcontent so user can edit
		var content =null;
		var tmpNode = null;
		if ((this.createFromLayout) || (this.isEmptyCBPlaceholder)) { // If from layout placeholder then user has not yet modified this box
			dojo.removeClass(body,PresConstants.LAYOUT_CLASS);// remove from ckeditor
			
			var msgList =[];

			if(dojo.hasClass(this.mainNode, PresConstants.LAYOUT_CLASS)) {
				var dataNode = this.mainNode;
				var parkMsgPair= true;
				//
				//Let's park msgPairList since we are entering edit mode on a default content box
				//
				//-replace removeUndo
				TEXTMSG.handleNodeAttr(dataNode, 'class', function() {
					dojo.removeClass(dataNode,'layoutClass');
                    //console.info(dataNode.id);
				},null,parkMsgPair,this.editor,msgList);
			}
					
			if(dojo.hasClass(this.contentBoxDataNode, PresConstants.LAYOUT_CLASSSS)) {
				var dataNode = this.contentBoxDataNode;
				var parkMsgPair= true;
				//
				//Let's park msgPairList since we are entering edit mode on a default content box
				//
				//-replace removeUndo
				var useParkMsg = false; //Tell synch.sendMessge not to use the part to send to avoid duplicate msg 
				TEXTMSG.handleNodeAttr(dataNode, 'class', function() {
					dojo.removeClass(dataNode,'layoutClassSS');
                    //console.info(dataNode.id);
				},null,parkMsgPair,this.editor,msgList,useParkMsg);  
			}
		} else if ((dojo.hasClass(this.mainNode,'newbox')) && (this.newBox)){ // This is a new box
			//var pNode =  this.editor.document.getBody().$.firstChild;
			var node = dojo.query('.newTextContent',this.editor.document.getBody().$)[0];
			if (node && !window.pe.scene.slideEditor.SINGLE_CK_MODE) //we done need this call to blankout in singleCK mode since it will be called from toggleEditMode
				this.blankOutCKContentAndSynchForDefaultText(node);
		}
		dojo.addClass(body,"concord");
		dojo.addClass(body.parentNode,"concord");
		if (CKEDITOR.env.hc)
			dojo.addClass(body,"dijit_a11y");

		// Following code for story 6483
		//concord.util.HtmlContent.addI18nClassToBody(body);
		//story 13127 - need to get language classname from sorter Doc, not from browner setting
		if(window.pe.scene.slideSorter.contentLangClassName!=null){
			dojo.addClass(body, window.pe.scene.slideSorter.contentLangClassName);
		}
		
		//D30153: [Regression] spell check doesn't work in textbox in edit mode. spell check only works  in textbox in view mode
		if(window.spellcheckerManager && window.spellcheckerManager.isAutoScaytEnabled()){
			dojo.addClass(body,'concordscEnabled');
		}else {
			dojo.removeClass(body,'concordscEnabled');
		}
		dijit.setWaiRole(body, 'main');
		domDoc = null;
		body = null;
	},
	
	//
	// This function mostly used for placeholders and newBox. Basically contentBox that have a defaultContent.
	// On first time editing we need to manage the default text in canvas and open with an empty content in CK.
	// node is the span that contains the default text.
	//
	blankOutCKContentAndSynchForDefaultText: function(node,cmdL){
		if (this.defaultTextDFC==null){
			this.defaultTextDFC = dojo.clone(this.getDFCForDefaultText());
			if (this.boxRep){
				this.boxRep.defaultTextDFC = this.defaultTextDFC;
			}
		}
		var pNode = new CKEDITOR.dom.node(node);
		if(node.nodeName.toLowerCase() =='span') {
			if (node.parentNode.nodeName.toLowerCase() !='li') {
				pNode = pNode.getAscendant('p');
			} else {
				pNode = pNode.getAscendant('li');
			}
		}
		
			// save some information before we delete the node to properly record for undo/redo
			var pnp = pNode.$.parentNode;
			var pt = pNode.$.nodeName.toLowerCase();
			var poe = dojo.attr(pNode.$, "odf_element");
			var pc = dojo.attr(pNode.$, "class");
			var ps = dojo.attr(pNode.$, "style");
			var pStartNumber = dojo.attr(pNode.$, "startnumber");
			var pValues = dojo.attr(pNode.$, "values");
			var pid = pNode.$.id;
			
			var msgPairs = [];
			
			//Need to do these mainode attributes update here so they are registered in undo/redo. Doing this in processEditorClose does 
			//does not register these attr updates in undo redo.. so without this fix undo does not restore the emptyCB_placeholder and draw_layer attributes
			//in the following scenatio
			// 1- enter default text and type
			// 2 - undo to restore the default text notice that the emptyCB_placeholder is not restored.
			//Set presentationb_placeHolder attribute to false on mainNode
			var attrName = "emptyCB_placeholder";
			msgPairs = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(this.mainNode), attrName, 'false', msgPairs);						
			//dojo.attr(this.mainNode,'emptyCB_placeholder','false');
			
			//Set draw_layer attribute to "layout" indicating it is a real content on mainNode
			attrName = "draw_layer";
			msgPairs = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(this.mainNode), attrName, 'layout', msgPairs);
			//dojo.attr(this.mainNode,'draw_layer','layout');


			
			msgPairs =SYNCMSG.createDeleteNodeMsgPair(pNode,msgPairs);
			dojo.destroy(pNode.$);
			
			// recreate the node so we get proper record for undo/redo
			var nnode = document.createElement(pt);
			this.setNodeId(nnode,PresConstants.CONTENTBOX_PREFIX);
			nnode.id=pid;
			
			// add the prev attributes odf_element="text:p" class="text_p"
			if (poe)
			    dojo.attr(nnode, "odf_element", poe);
			if (ps)
			    dojo.attr(nnode, "style", ps);
			if(pStartNumber)
				 dojo.attr(nnode, "startnumber", pStartNumber);
			if(pValues)
				 dojo.attr(nnode, "values", pValues);
			
			dojo.attr(nnode, "level", "1");//Default level 1
			if(nnode.nodeName.toLowerCase() == "li"){
				dijit.setWaiRole(pnp, 'list');
				dijit.setWaiRole(nnode, 'listitem');
				dijit.setWaiState(nnode,'level', '1');
			}
			//we should find proper master class for this node
			var masterClass = PresCKUtil.getMasterClass(this.getDFCForDefaultText(),1);
			if(masterClass)
			{
				if(pc && pc.indexOf('IL_CS_')){
					dojo.attr(nnode, "class", pc);
				}
				var ckNode = PresCKUtil.ChangeToCKNode(nnode);
				ckNode = PresCKUtil.setMasterClass(ckNode,masterClass);
				if(ckNode)
					nnode = ckNode.$;
			}
			else if (pc)
				dojo.attr(nnode, "class", pc);

			
			// Safari needs break line at the end of p to handle focus of the area to the right of the span
			// but let's add for all browser for consistency
			if (nnode.nodeName.toLowerCase() == 'li') {
			    nnode.innerHTML=PresCKUtil.getDefaultTextHtml();
			} else {  // p
			    nnode.innerHTML=
                                PresCKUtil.getDefaultTextHtml()+PresCKUtil.getBogusHtml();
			}
			
			pnp.appendChild(nnode);
			var oulNode = PresCKUtil.ChangeToCKNode(pnp);
			if(oulNode && oulNode.is('ol','ul'))
			{
				dojo.removeClass(oulNode.$);
				oulNode.addClass('concordList_Preserve');
				oulNode.removeAttribute('odf_element');
			}
			msgPairs =SYNCMSG.createInsertNodeMsgPair(nnode,msgPairs);
			
			if (msgPairs!=null && msgPairs.length > 0 && !dojo.hasClass(this.mainNode,'isSpare')){
				this.setPlaceHolderFlagInMsgAct(msgPairs);
				//At this poing we should have a parked message in the editor if this is a layout box
				//If this is a new text box the park will not yet be defined so we need to initialize.
				if (typeof this.editor.parkedMsgPairList==undefined || this.editor.parkedMsgPairList ==null){
					//console.log('contentbox set park msg to null 6311');
					this.editor.parkedMsgPairList=[];
				}
				
				var newPairList =[];
				for (var i=0; i<msgPairs.length;i++){
					//console.log('contentbox set park msg to null 6320');
					this.editor.parkedMsgPairList.push(dojo.clone(msgPairs[i])); //We need to merge the parked list
					newPairList.push(SYNCMSG.addUndoFlag(msgPairs[i],false));  //We build new pairlist to send for coedit without adding to undo q
				}
				//By this point the parked Ck should have:
				// for default text box: a e e (msg types a = default border from layoutClasSS and e e are element msgs built above in this function)
				// for new text box: e e
				//
				
				SYNCMSG.sendMessage(newPairList, SYNCMSG.SYNC_BOTH);	//Send Coedit msg for reseting default text
				if ((this.createFromLayout) || (this.isEmptyCBPlaceholder)){
					this.editor.newBox=true;	// used by postInput in textMsg
				}
			}else if (msgPairs!=null && msgPairs.length > 0 && dojo.hasClass(this.mainNode,'isSpare')){ //jmt D46411
				//So far we blankedout the CK content now we need to blankout contentBoxDataNode if this is a spare.
				//contentBoxDataNode is blanked out for nonSpare boxes with SYNCMSG.sendCombinedMessage earlier.
				var dfNode = dojo.query(".draw_frame_classes", this.contentBoxDataNode);
				if ((dfNode!=null) && (dfNode.length >0)){
					var cNode= dfNode[0].firstChild;
					if (cNode!=null && cNode.nodeName.toLowerCase()=="p"){
						cNode.innerHTML=PresCKUtil.getDefaultTextHtml()+PresCKUtil.getBogusHtml();
						cNode.id = nnode.id;
					}
				}
			}
			
			if (!dojo.hasClass(this.mainNode,'isSpare'))
					this.moveCursorPositionToLastNode(this.editor.getSelection());		
			if(masterClass)
			{
				this.cleanupLayoutDefaultText();
			}
	},
		
	//
	// Sets placeHolder flag in message
	//
	setPlaceHolderFlagInMsgAct: function(msgPairs){
		   for (var i=0; i< msgPairs.length;i++){
			   var msg = msgPairs[i].msg;
			   var rMsg = msgPairs[i].rMsg;
			   msg.updates[0].placeHolderFlag=true;
			   rMsg.updates[0].placeHolderFlag=true;
		   }
		   return msg;
	},
	
	
	//
	// Returns DFC for text content box and speaker notes content box
	//
	getDFCForDefaultText: function (){		
		var dfcViewMode = null;
		if (this.contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE){
			dfcViewMode = dojo.query('.draw_frame_classes',this.contentBoxDataNode);
		}else{
			dfcViewMode = dojo.query('.draw_frame_classes',this.mainNode);			
		}
		return  (dfcViewMode!=null && dfcViewMode.length>0)? dfcViewMode[0]: null;
	},
	
	
	//
	// This function mostly used for placeholders and newBox. Basically contentBox that have a defaultContent.
	// On leaving editmode we need to manage the default text and reset default text in canvas and CK
	// node is the span that contains the default text.
	// 
	// D2845 If this function gets called to reset a title that was not a placeholder then we need to merge last action in the box with 
	// content from undo queue. addToUndoAndMerge should be true
	//
	resetCKContentAndSynchForDefaultText: function(msgPairsList, addToUndoAndMerge){	
	    //console.log("======>>>>> resetCKContentAndSynchForDefaultText running");
	    // this.preventSynch=true; // TODO: this flag should be useless now

	    var drawFrameClassDiv = this.getDFCForDefaultText();
		var cloneDFCDiv = dojo.clone(drawFrameClassDiv);
	    if (drawFrameClassDiv !=null && drawFrameClassDiv.firstChild!=null){
	    	// we need to find what type of contentbox this is
		    var family = dojo.attr(this.mainNode,'presentation_class');
		    var dfcExists =true;
		    var dfc = this.contentBoxDataNode.firstChild.firstChild;
		    var line = PresListUtil.getLineItem(dfc.firstChild);
		    var oldILCSClassName = PresListUtil.getListBeforeClass(line);
		    var lineid = line.$.id;
		    var layoutName = dojo.attr(window.pe.scene.slideEditor.mainNode,'presentation_presentation-page-layout-name');
		    if (family=='outline'){
		    	this.buildTextNodeContent(this.DEFAULT_OUTLINE_CONTENT,'defaultContentText '+PresConstants.CONTENT_BOX_OUTLINE_CLASS,family,null,dfcExists);
		    } else if (family == 'title'){					
		    	this.buildTextNodeContent(this.DEFAULT_TITLE_CONTENT,'defaultContentText '+PresConstants.CONTENT_BOX_TITLE_CLASS,family,null,dfcExists);
		    } else if (family == 'subtitle'){
		    	if(layoutName == "ALT32"){
		    		this.buildTextNodeContent(this.DEFAULT_TEXT_CONTENT,'defaultContentText '+PresConstants.CONTENT_BOX_SUBTITLE_CLASS,family,null,dfcExists);
		    	}else {
		    		this.buildTextNodeContent(this.DEFAULT_SUBTITLE_CONTENT,'defaultContentText '+PresConstants.CONTENT_BOX_SUBTITLE_CLASS,family,null,dfcExists);
		    	}
		    } else if (family == 'notes'){
				// there is still the last div here for notes, need to set default text under it
				this.buildTextNodeContent(this.DEFAULT_NOTES_CONTENT,'defaultContentText '+PresConstants.CONTENT_BOX_NOTES_CLASS,family,null,dfcExists);
		    } else {        // since removeAllChildren is done in buildTextNodeContent
				PresCKUtil.removeAllChildren(dfc); // node should be dfc
		    }

		    this.updatedClassesForODP(family,layoutName);
		    this.setNodeId(dfc.firstChild);
		    line = PresListUtil.getLineItem(dfc.firstChild);
		    line.$.id = lineid;
		    if(oldILCSClassName.length>0) 
		    	line.addClass(oldILCSClassName);
			//wangzhe>>>============
			//we should update the relative value this place holder
			PresCKUtil.updateRelativeValue(dfc);
			//<<<<===============

		PresCKUtil.copyAllFirstSpanStyleToILBefore(dfc,true);
		PresCKUtil.doUpdateListStyleSheet();
		//By this point DFC is set and ready to be sent to other users.
		//Create Message
		var msgPairs = (msgPairsList!=null)? msgPairsList:  [];
		//1 - delete node
		var ckNode = new CKEDITOR.dom.node(drawFrameClassDiv);
		msgPairs =SYNCMSG.createDeleteNodeMsgPair(ckNode,msgPairs);
		msgPairs[msgPairs.length-1].rMsg.updates[0]['s']=cloneDFCDiv.outerHTML;
		//2 - insert node
		msgPairs =SYNCMSG.createInsertNodeMsgPair(drawFrameClassDiv,msgPairs);
		
		//3- Add to queue depen
		var addToUndo = (addToUndoAndMerge==null || addToUndoAndMerge==false)? false : true;
		var mergeTop2forList = false;
		if(pe.scene.slideSorter.preListCssStyleMSGList && pe.scene.slideSorter.preListCssStyleMSGList.length>0){
			mergeTop2forList = true;
			//msgPairs[0].msg.updates[1]&msgPairs[0].rMsg.updates[1] at here is a IE message.
			msgPairs[msgPairs.length-1].msg.updates[0].p_iclb=pe.scene.slideSorter.postListCssStyleMSGList;
			msgPairs[msgPairs.length-1].rMsg.updates[0].p_iclb=pe.scene.slideSorter.preListCssStyleMSGList;
			pe.scene.slideSorter.postListCssStyleMSGList = null;
			pe.scene.slideSorter.preListCssStyleMSGList = null;
		}
		msgPairs[0] = SYNCMSG.addUndoFlag(msgPairs[0],addToUndo||mergeTop2forList);
		SYNCMSG.sendMessage(msgPairs,SYNCMSG.SYNC_SORTER,true);	
		mergeTop2forList && undoManager.mergeTop2();
		PresCKUtil.normalizeMsgSeq(null,null,null,'endMerge');
        }
    },
	//
	// synch data content while eixst edit mode.
	//
	synchDataWhileCloseEditMode: function(){
		var doPublish = false;
		var body = this.editor.document.getBody().$;
		var node = (this.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE)? body.firstChild : body; // Will no longer need to do this once we wrap tables in a div
		if(dojo.isIE && this.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE){
			var child = dojo.query('table',this.contentBoxDataNode);
			for(var i=0; i< child.length; i++){
				dojo.destroy(child[i]);
			}
			child = dojo.query('tbody',this.contentBoxDataNode);
			for(var i=0; i< child.length; i++){
				dojo.destroy(child[i]);
			}
		}
		this.contentBoxDataNode.innerHTML ="";
		
		//Now copy CK content to canvas dom
		if ( dojo.isWebKit && this.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE){
			//toggle visibility of table to fix defect Defect 47580 [Safari] table get very small after edit
			dojo.style(this.contentBoxDataNode,{
				'display':'none',
				'visibility':'hidden'
			});
		}
		for(var i=0; i< node.children.length;i++){
			var copyNode = dojo.clone(node.children[i]);
	    	//D30145: Part of text of imported no-wrap textbox is not visible when edit. 
	    	if(this.contentBoxType==PresConstants.CONTENTBOX_TEXT_TYPE && copyNode.firstChild &&  copyNode.firstChild.style.whiteSpace){
	    		copyNode.firstChild.style.whiteSpace = '';
	    		copyNode.firstChild.style.wordWrap = '';
	    		//copyNode.firstChild.style.wordBreak = '';
	    	}
			this.contentBoxDataNode.appendChild(copyNode);
		}
		if (this.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE){
			
			if ( dojo.isWebKit){
				// Set as true temporarily to avoid resize and rn msg sent
				this.resizeForbidden = true;
				//toggle visibility of table to fix defect Defect 47580 [Safari] table get very small after edit
				//D24365 [chrome][table]resize table row, then change focus to the other object on this slite, table size not correct 
				setTimeout(dojo.hitch(this, function(){
					//D36315: [Chrome][Safari]Switch cursor between two tables in new slide will make duplicate table in large file
					if(!this.isEditModeOn()){
						dojo.style(this.contentBoxDataNode,{
							'display':'',
							'visibility':'visible'
						});
						this.updateViewTableSize();
						this.checkMainNodeHeightandUpdate(true);
					}
					this.resizeForbidden = false;
				}),0);
			}else{
				this.updateViewTableSize();
				this.checkMainNodeHeightandUpdate(true);
			}
		} else {
			this.checkMainNodeHeightandUpdate(true);
		}
		
		if(body && body.ownerDocument)
		{// prez can't pass onblur in scservice, refresh the document for CK
			window.spellcheckerManager.refresh(body.ownerDocument);
		}
		
		var id = this.mainNode.id;
		setTimeout(dojo.hitch(this, function(){
			var checkNode = pe.scene.slideEditor.getRegisteredContentBoxById(id);
			if(checkNode && checkNode.contentBoxDataNode)
				window.spellcheckerManager.refresh(checkNode.contentBoxDataNode);
		}),1000);
	},
	
	refreshSpellCheck : function(){
		var body = this.editor.document.getBody().$;
		if(body && body.ownerDocument)
		{// prez can't pass onblur in scservice, refresh the document for CK
			window.spellcheckerManager.refresh(body.ownerDocument);
		}

		window.spellcheckerManager.refresh(this.contentBoxDataNode);
	},
		
	updateCKRange: function(){
		if (this.editor.getSelection()!=null){
			this.getSelectionORIG = dojo.hitch(this.editor,this.editor.getSelection);
			 this.editor.getSelection = dojo.hitch(this,this.getSelection);
		}
	},

	getSelection: function(){
		//console.log("******* In custom getSelection "+this.getEditorName());
		var selection = this.getSelectionORIG();
		return selection;
	},
	
	//
	// set contentEditable of dfc to true
	//
	makeContentEditable: function(){
	},
	
	//
	// set contentEditable of dfc to false for when IE is editing content box
	//
	makeNonContentEditable: function(){
		var drawClassFrames = null;
		drawClassFrames = dojo.query('[contentEditable]',this.mainNode)[0];
		if(drawClassFrames){			
			dojo.removeAttr(drawClassFrames, 'contentEditable');
	   }
	},
	
   
	//
	//Synchs when typing a space
	//
    syncPorLi: function(){
		var selection = this.editor.getSelection();
		var startElement = selection.getStartElement().$;
		//Let's get parent p or parent li
		var node = this.getParentNodeToSynch(startElement);
		if (node!=null){
			//Create Message
			var msgPairs = [SYNCMSG.createReplaceNodeMsg(node)];
			//3 - set 'txt typing' flag in msg
				// For insert message
				msgPairs[0].msg.updates[0].p_tt=true;
				msgPairs[0].rMsg.updates[0].p_tt=true;
				// For insert message
				msgPairs[0].msg.updates[1].p_tt=true;
				msgPairs[0].rMsg.updates[1].p_tt=true;
			//4- synch with sorter and canvas
			SYNCMSG.sendMessage(msgPairs, SYNCMSG.SYNC_BOTH);
		}else {
			this.synchAllData();
		}
	},
	
    //
    // returns  parent p, li, td or th
    //
    getParentNodeToSynch: function (node){
        var nodeToSynch = null;
        if(node!=null){
            while(node){
                if ((node) && ((node.nodeName.toLowerCase()=='p') ||
                		      (node.nodeName.toLowerCase()=='li') ||
                		      (node.nodeName.toLowerCase()=='td') ||
                		      (node.nodeName.toLowerCase()=='th'))){
                    break;
                }else if ((node) && (dojo.hasClass(node,'draw_frame') || (node.tagName.toLowerCase()=='body'))){
                    node=null;
                    break;
                }
                node = node.parentNode;
            }
            nodeToSynch = node;
        }
        return nodeToSynch;
    },
    
    /**
	 * Gets the root of all of this content box's data (i.e. the DFC)
	 * 
	 * The returned node is a DOM node.
	 */
	getContentRootNode: function() {
		return PresCKUtil.getDFCNode( this.editor );
	},
	
	/**
	 * Gets the root of the editable area of this content box (i.e. the DFC).
	 * Different types of content boxes might have different root edit areas.
	 * 
	 * The returned node is a DOM node.
	 */
	getContentEditNode: function() {
		return this.getContentRootNode();
	},
	
	/**
	 * Cleans unwanted elements for coedit.
	 * 
	 * The specified 'node' is a DOM node and should be a clone (if you don't want to lose any
	 * styles/classes/attributes in your slide editor instance).
	 */
	cleanupNode: function( node ) {
		if (node.nodeType == CKEDITOR.NODE_TEXT)
			return;
		// remove any bookmarks that may be present in the node		
		dojo.forEach(
			dojo.query( '[data-cke-bookmark=1]', node ),
			function( item ) { 
				dojo.destroy( item ); }
		);
		
		//There may be invalid spans as a result of font color or any styles applied let's clean up
		//PresCKUtil.removeInvalidSpan(this.editor);
	},
	
	/**
	 * Synchronizes the data in this content box.
	 * 
	 * Callers may pass in a specific node (which must have
	 * an ID) for fine-grained synchronization. If no synch node is specified, this function will
	 * assume that ALL data within the editable area of this content box (i.e. as returned by
	 * getContentEditNode) will be synch'ed.
	 */
	synchAllData: function( nodeToSynch, preSnapShot, postSnapShot, addToUndo,undoMsgId, keep8203) {
		//Let's get all content
//		if (updateCtr!=null &&  this.editor.synchAllTodoCtr !=null)
//			this.editor.synchAllTodoCtr--;
		//this.editor.synchAllDataLocked = true;
		if (this.preventSynch==true){	
			//this.editor.synchAllDataLocked = false;
			return;
		}
		if(PresCKUtil.isIMEMode) 
			return;
		
		if(preSnapShot && postSnapShot && preSnapShot.outerHTML == postSnapShot.outerHTML)
			return;
		
		var addToUndoQ =  (addToUndo!=null)? addToUndo : true;  // defaults to true
		var node = (nodeToSynch!=null)? nodeToSynch :  this.getContentEditNode();
		if (node && node.parentNode){
			node = node.$ || node;
	    	//D30145: Part of text of imported no-wrap textbox is not visible when edit. 
			if(this.contentBoxType==PresConstants.CONTENTBOX_TEXT_TYPE && node.style.whiteSpace){
				node.style.whiteSpace = '';
				node.style.wordWrap = '';
				//node.style.wordBreak = '';
			}
			this.cleanupNode(node);
			if ( this.editor.isTable ){
				this.editor.execCommand('deactivateSmartTableCell');
			}
			// Create the replace node message
			var msgPairs = [ SYNCMSG.createReplaceNodeMsg(node, null, keep8203) ];
	    	//D30145: Part of text of imported no-wrap textbox is not visible when edit. 
			if(this.contentBoxType==PresConstants.CONTENTBOX_TEXT_TYPE){
	    		node.style.whiteSpace = 'pre-wrap';
	    		node.style.wordWrap = 'break-word';
	    		//node.style.wordBreak = 'break-all';
	    	}
			//1 - delete node
//			msgPairs =SYNCMSG.createDeleteNodeMsgPair(new CKEDITOR.dom.node(node),msgPairs);
			//2 - insert node
//			msgPairs =SYNCMSG.createInsertNodeMsgPair(node,msgPairs);
			//3 - set 'txt typing' flag in msg
			// For delete message
			PresCKUtil.doUpdateListStyleSheet();
			msgPairs[0].msg.updates[0].p_tt=true;
			msgPairs[0].rMsg.updates[0].p_tt=true;
			msgPairs[0].msg.updates[1].p_tt=true;
			msgPairs[0].rMsg.updates[1].p_tt=true;
			if(pe.scene.slideSorter.preListCssStyleMSGList && pe.scene.slideSorter.preListCssStyleMSGList.length>0){
				//msgPairs[0].msg.updates[1]&msgPairs[0].rMsg.updates[1] at here is a IE message.
				msgPairs[0].msg.updates[1].p_iclb=pe.scene.slideSorter.postListCssStyleMSGList;
				msgPairs[0].rMsg.updates[1].p_iclb=pe.scene.slideSorter.preListCssStyleMSGList;
				pe.scene.slideSorter.postListCssStyleMSGList = null;
				pe.scene.slideSorter.preListCssStyleMSGList = null;
			}
			//4 Get pre and post nodes
			var pre = (preSnapShot)? preSnapShot: (this.editor.preSnapShot)? PresCKUtil.cloneSnapShot(this.editor.preSnapShot): null;
			var post = (postSnapShot)? postSnapShot : PresCKUtil.cloneSnapShot(this.getContentRootNode());
			if (pre==null || post==null){
				addToUndoQ = false;
			}
				
			if (this.editor.isTable && node.nodeName.toLowerCase()=='td' && pre && pre.nodeName.toLowerCase()=='td' && post.nodeName.toLowerCase()=='tbody'){
				var capturedPostSnapshot = PresCKUtil.setPostSnapShot(this.editor,node);
				post =  PresCKUtil.cloneSnapShot(this.editor.postSnapShot); //make sure post is td
				capturedPostSnapshot = null;
			} 
			
			//5- synch with sorter and canvas - do not add to undo queue since this will be handled in step 5
			var addToUndo = false;
			msgPairs[0] = SYNCMSG.addUndoFlag(msgPairs[0],addToUndo);

            PresCKUtil.setPreSnapShot( this.editor );
			//5a- let's first check if this is a newbox i.e new default Text box that is being modified
			if (this.editor.parkedMsgPairList&&this.editor.parkedMsgPairList.length >0 ){//if we have a parked message which has not been processed yet then this must be a copy paste
				this.editor.newBox = false;
				var sendCoedit =false;
				TEXTMSG.processParkedMessage(msgPairs,this,sendCoedit,undoMsgId,pre,post,node);  // here we merge the new msgPairs with the parked
				return;
			} 
			
			var msgPairList = SYNCMSG.sendMessage(msgPairs, SYNCMSG.SYNC_BOTH, true,undoMsgId);						
			//6 - Handle adding to undo queue
			if (addToUndoQ != null && addToUndoQ==true){
				if (pre.innerHTML != post.innerHTML){
					var msgPairList = this.makeUndoRedoMsgForPTT(pre,post,node,msgPairList.msgList,msgPairList.rMsgList);
					PresCKUtil.normalizeMsgSeq(msgPairList.msgList,msgPairList.rMsgList,undoMsgId);
				}
			}		
			if ( this.editor.isTable ){
				this.editor.execCommand('makeSmartTableCellActive', true);
			}
		}
	},
	
	//
	// Creates special undo/redo message for ptt (presentation text type) of messages
	//
	makeUndoRedoMsgForPTT: function(pre,post,node,msgList,rMsgList){
		 //Add to queue if these messages are different
		if(!pre || !post)
		{
			console.log("preSnapShot or postSnapShot should be set");
			return;
		}
		this.cleanupNode(pre);
		this.cleanupNode(post);
		pre.removeAttribute('contenteditable');
		post.removeAttribute('contenteditable');
		
		//D8391
//		var travelingUndoStack = (undoManager.index != undoManager.stack.length-1); // we are traveling undo stack 
		//set previous post for D7279 		
			var nodeToUse = pre;
//			if (this.editor.initSnapShot && this.editor.initSnapShot.innerHTML.length>0 && this.editor.initSnapShot.childNodes.length>0){    // in the case of table for instance we needed to save in contentbox instead of editor since table does not exist at table creation time
//				console.log('makeUndoRedoMsgForPTT init snap == '+this.editor.initSnapShot.innerHTML);
//				nodeToUse = PresCKUtil.cloneSnapShot(this.editor.initSnapShot);						
//				dojo.destroy(this.editor.initSnapShot);
//				this.editor.initSnapShot = null;
//			} 
//			if (this.editor.prevPostSnapShot){
//				nodeToUse = (travelingUndoStack) ? this.getLastUndoPost(pre)  :this.editor.prevPostSnapShot;
//				
//				//D9970 -  Here we are ensuring that the pre and nodeToUse are the same. If not this will cause 9970 ( refreshing and getting 2 TBODY tags after undo of a style for isntance) 
//				if ((pre.id != nodeToUse.id) && !travelingUndoStack && this.editor.isTable){ //reset if nodeToUse is not pointing to same node as pre 
//					nodeToUse = pre;
//				}
//
//			}
			if (nodeToUse && nodeToUse.parentId!=undefined && nodeToUse.parentId !=null && nodeToUse.idx!= undefined && nodeToUse.idx!=null){
				this.cleanupNode(nodeToUse);
//				pre.id =  nodeToUse.id;
//				pre.parentId = nodeToUse.parentId;
//				pre.idx = nodeToUse.idx;				
//				pre.innerHTML = nodeToUse.innerHTML;
				pre = nodeToUse;
//				console.log("====> updating PRE from last POST makeUndoRedoMsgForPTT  pre == "+pre.innerHTML);				
			}  else {
				nodeToUse = pre;
			}
//			this.editor.prevPostSnapShot = null;//PresCKUtil.cloneSnapShot(post);			
		
		// Update message list for undo using pre image
		//	console.log("====> makeUndoRedoMsgForPTT  pre == "+pre.innerHTML);
		var tmpNode = document.createElement('div');
		var preParentId = pre.parentNode && pre.parentNode.id;
		tmpNode.appendChild(pre);
		rMsgList[0].updates[1]['s']=tmpNode.innerHTML;
		dojo.destroy(tmpNode.firstChild);
		
		//D9970 -  Perhaps in the future to hardened - here we need to confirm that rMsgList[0] and rMsgList[1] are operating on the same node. Ditto for msgList
		rMsgList[0].updates[0].p_nid = pre.id;
		rMsgList[0].updates[0].tid = pre.parentId || preParentId;
		rMsgList[0].updates[0].idx = pre.idx;

		//Let's check if we need to update the other part of rMsgList - D9970
		if (rMsgList[0].updates[0].p_nid != rMsgList[0].updates[1].p_nid){
			//This is the msg for delete element
			rMsgList[0].updates[1].p_nid = pre.id;
			rMsgList[0].updates[1].tid = pre.parentId || preParentId;
			rMsgList[0].updates[1].idx = pre.idx;
			var sibling = null;
			if(pre.id){
				var preNode = dojo.byId(pre.id);
				sibling = preNode && preNode.nextSlibling;
			}
			rMsgList[0].updates[1].refId = (sibling) ? sibling : '';
		}
		
		
		// Update message list for redo using post image
		var postParentId = post.parentNode && post.parentNode.id;
		tmpNode.appendChild(post);
		msgList[0].updates[1]['s']=tmpNode.innerHTML;
		dojo.destroy(tmpNode);
		tmpNode = null;

		msgList[0].updates[1].p_nid = post.id;
		msgList[0].updates[1].tid = post.parentId || postParentId;		
		msgList[0].updates[1].idx = post.idx;
		
		//Let's check if we need to update the other part of rMsgList - D9970
		if (msgList[0].updates[1].p_nid != msgList[0].updates[0].p_nid){
			//This is the msg for delete element
			msgList[0].updates[0].p_nid = post.id;
			msgList[0].updates[0].tid = post.parentId || postParentId;
			msgList[0].updates[0].idx = post.idx;	
			var sibling =  post.id ? (dojo.byId(post.id) ? dojo.byId(post.id).nextSlibling : null):null;
			msgList[0].updates[0].refId = sibling || '';
		}
		
		if (nodeToUse){
			dojo.destroy(nodeToUse);
		}
		return {'msgList':msgList,'rMsgList':rMsgList};
	},
	
	
	//
	// Gets last redo msg from stack 
	//
	getLastUndoPost: function(pre){
		try{
			var undoStackIndex = undoManager.index;
			var lastRedoFromStack = undoManager.stack[undoManager.index].redo;
			var tmpNode = (this.editor.isTable)? document.createElement('table') : document.createElement('div');
			tmpNode.innerHTML = lastRedoFromStack[1].updates[0]['s'];
			if (pre.id ==lastRedoFromStack[1].updates[0].p_nid ){
				pre.innerHTML = tmpNode.firstChild.innerHTML;	
			}			
		}catch(e){
			//do nothing
		}		
		return pre;
	},
	
	/**
	 * Gets invoked when user modify CKEDITOR content and we need to adjust the editor window and mainContainer to avoid CKEDITOR scrollbars
     * @returns 
	 */
	editorAdjust: function(e,resizingFlag,undoFlag,bForce){
		if(!this.isEditModeOn())
			return;
		var dfc = null;
		var fromUndo  = (undoFlag!=null) ? undoFlag: false;
        window.pe.scene.validResize = false;
		try{
		var body = this.editor.document.getBody().$;
		if (!concord.util.browser.isMobile() && dojo.attr(this.mainNode, "presentation_class") != "notes") {
			body.parentNode.scrollTop = 0;
		}

		if (!resizingFlag){
			var key = (e && e.data && e.data.getKey)? e.data.getKey() : null;
			if (key && key == 27){ // Escape key then get out of edit mode
				// This code for ESC key was revamped in Jan/13 to fix the context 
				// menu popup (via shift+F10) after pressing the ESC key.
				var contentBox = this;
				// need to find parent node for grpType
				if (dojo.hasClass(this.mainNode, 'g_draw_frame')) {
					var dfp = window.pe.scene.slideEditor.getParentDrawFrameNode(this.mainNode);
					if (dfp!=null) {
						var drawFrameNode = dfp;
						var drawFrameContentBoxObj = window.pe.scene.slideEditor.getRegisteredContentBoxById(drawFrameNode.id);
						if ((drawFrameContentBoxObj != null) && 
						    (drawFrameContentBoxObj.contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE)) {
							contentBox = drawFrameContentBoxObj;
						}
					}
				}
				
				contentBox.deSelectThisBox();
				if (window.pe.scene.slideEditor.SINGLE_CK_MODE && contentBox.boxRep!=null){ // this is a spare in it is representing a box
					contentBox = contentBox.boxRep.unLoadSpare();	             
				}
				//D17428 do not select the content box if it is notes
				//notes should not be selected and not in edit mode
				if (contentBox.contentBoxType!=PresConstants.CONTENTBOX_NOTES_TYPE) {
					contentBox.selectThisBox();
				}
				window.pe.scene.validResize = true;
				if (dojo.isIE || dojo.isWebKit){//D8517 Need to adjust canvas if scroll is detected
		    		if (pe.scene.slideEditor.mainNode.parentNode.scrollTop>0){
		    			pe.scene.slideEditor.mainNode.parentNode.scrollTop=0;
		    		}
				}

				if (this.contentBoxType == PresConstants.CONTENTBOX_NOTES_TYPE) {
					if (dojo.isIE) {
						if (e) {
							dojo.stopEvent(e.data);
						}
						contentBox.mainNode.focus();
					}
					pe.scene.focusMgr.publishNextFocusRegion(concord.util.events.SLIDE_EDITOR_COMPONENT);
					return;
				}
				
				if (dojo.isIE) {
					contentBox.mainNode.focus();
					dojo.stopEvent(e.data);
				}
				else {
					window.focus();
				}
				return;
			}else if (key && key == 33){ // page up then publish page up event to move to prev slide
				//var turnOnEditMode = false;
				//this.toggleEditMode(turnOnEditMode); //no need to turn off edit mode here, since when we switch slide, the cleaning up process already doing this, toggling edit mode off here will cause a problem
				var eventData = [{'eventName': concord.util.events.keypressHandlerEvents_eventName_keypressEvent,'eventAction':concord.util.events.keypressHandlerEvents_eventAction_PAGE_UP}];
				 concord.util.events.publish(concord.util.events.slideSorterEvents, eventData);
				 window.pe.scene.validResize = true;
				return;
			}else if (key && key == 34){ // page down then publish page up event to move to next slide
				//var turnOnEditMode = false;
				//this.toggleEditMode(turnOnEditMode);//no need to turn off edit mode here, since when we switch slide, the cleaning up process already doing this, toggling edit mode off here will cause a problem
				var eventData = [{'eventName': concord.util.events.keypressHandlerEvents_eventName_keypressEvent,'eventAction':concord.util.events.keypressHandlerEvents_eventAction_PAGE_DOWN}];
				 concord.util.events.publish(concord.util.events.slideSorterEvents, eventData);
				 window.pe.scene.validResize = true;
				return;
			}
			
			var enterKeyAutomaticAdjust= 0;
				var ckBody = this.editor.document.getBody().$;
				for (var i=ckBody.children.length-1; i>=0; i--){
					var lastElement = ckBody.children[i];
					enterKeyAutomaticAdjust+=lastElement.offsetHeight;
					lastElement = null;
				}
				
			//User is modifying content so no longer creating from layout or no longer a new box
				// isNewBox temporarily addresses the issue where user edit then save (without typing or exiting edit mode) then close
				var isNewBox = false;
				var newBox = dojo.query('.defaultContentText', ckBody);
				if (newBox.length > 0) {
					isNewBox = true;
				}
				ckbody = null;
			if ((this.createFromLayout) || (this.isEmptyCBPlaceholder) || (this.newBox)  || isNewBox){
//				dojo.removeClass(this.mainNode, PresConstants.LAYOUT_CLASS);
				
				this.newBox=false;
				this.createFromLayout=false;
				this.isDirty = true;
//				this.publishBoxAttrChanged('class',null,true);
				this.cleanupLayoutDefaultText();
			}

			// 8342: [SpeakerNotes][Safari] Failed to move mouse focus to end of text after insert and click.
			// move addBR up to cover speaker notes as well
			// 8258: [Safari][Textbox] Failed to move mouse focus to end of text after insert and click.
			// add br hideInIE to the end as you type as needed to keep the cursor from jumping to the front
			if (dojo.isWebKit) {
				PresCKUtil.addBR(this.editor);
			}

			// 8837: [SpeakerNotes][IE] A blank line is added unexpectedly after align right.			
			// Remove any preceeding br in IE
			if (dojo.isIE) {
	 		    dfc = PresCKUtil.getDFCNode(this.editor);
	 			var ps = dojo.query("p",dfc);
	 			for(var i=0;i<ps.length; i++){
	 				var br = ps[i].firstChild;
	 				if (br && br.nodeName.toLowerCase() == 'br' && br.nextSibling && br.nextSibling.nodeName.toLowerCase() == 'span') {
	 					dojo.destroy(br);
	 				}
	 				br = null;
	 			}
	 			dfc = null;
	 			ps = null;
//				if(this.editor.isTable){
//					var mainId = this.mainNode.id;
//					var sdoc = PROCMSG._getSorterDocument();
//					if (sdoc!=null){
//						var sorterBody = sdoc.body; 
//						var sorterNode = dojo.query("#"+mainId,sorterBody);
//						if (sorterNode!=null && sorterNode.length>0){						
//							dojo.query('tr', this.editor.document.$.body).forEach(function(tr){
//								var sorterTrNodes = dojo.query("#"+tr.id,sorterBody);
//								tr.style.height = sorterTrNodes[0].style.height;
//							});
//						}
//					}
//				}
			}
			
			// 6300: [List][FF] Additional blank line is added inside of bullets in exported odp.
			// Replace br _moz_dirty in FF with br hideInIE
			if (dojo.isFF) {
	 		    dfc = PresCKUtil.getDFCNode(this.editor);
	 			var brs = dojo.query("[_moz_dirty]",dfc);
	 			for(var i=0;i<brs.length; i++){
	 				if (brs[i].nodeName.toLowerCase() == 'br') {
	 					dojo.addClass(brs[i], 'hideInIE');
	 					dojo.removeAttr(brs[i], '_moz_dirty');
	 				}
	 			}
	 			dfc = null;
	 			brs = null;
////	 			below code added by D23048 [AllY][Web 2.1a][FF]Shift+ left arrow can't  select more than a character in front of  focus in table
////	 			tried D23048, it's fine on FF, seems below code is useless 
//				// When you type a space, a BR._moz_dirty element gets added after the text node (but
//				// inside the SPAN). The code above will turn it into BR.hideInIE (again, still inside
//				// the SPAN). We need to move it after the SPAN.
//	 			var key = (e && e.data && e.data.getKey)? e.data.getKey() : null;
//	 			var keystroke = (e && e.data && e.data.getKeystroke())? e.data.getKeystroke() : null;
//	 			if(PresCKUtil.isVisibleKey(key, keystroke, e && e.data && e.data.$)){
//		 			dojo.forEach(
//					        // _moz_dirty gets turned to hideInIE for FF only. So just check for
//					        // all BRs.
//					        dojo.query( 'BR', this.getContentEditNode() ),
//					        function( item ) {
//					            // if previous sibling is a text node (and no next sibling)...
//					        	//D29704 Table height change big after ctrl+C to copy some cells in imported odp sample file
//					        	var flg = item.previousSibling 
//					        	&&(item.previousSibling.nodeType == CKEDITOR.NODE_TEXT) 
//					        	&& !item.nextSibling;
//					        	if(item.parentNode){
//					        		flg = flg && PresCKUtil.checkNodeName(item.parentNode, 'span');
//					        		if(item.parentNode.nextSibling){
//					        			flg = flg && !PresCKUtil.checkNodeName(item.parentNode.nextSibling, 'br'); 
//					        		}
//					        	}
//					            if (flg) {
//					                var mv = new CKEDITOR.dom.node( item );
//					                mv.insertAfter( mv.getParent() );
//					                mv = null;
//					            }
//					        }
//					);
//	 			}
			}

			if (dojo.attr(this.mainNode, "presentation_class") == "notes") {
				enterKeyAutomaticAdjust = 0;
				var ckBody = this.editor.document.getBody().$;
				for (var i=ckBody.children.length-1; i>=0; i--){
					var lastElement = ckBody.children[i];
						for (var x=lastElement.children.length-1; x>=0; x--){
							var myElement = lastElement.children[x];
							for (var z=myElement.children.length-1; z>=0; z--){
								var myFinalElement = myElement.children[z];
								enterKeyAutomaticAdjust += myFinalElement.offsetHeight;
								myFinalElement = null;
							}
							myElement = null;
						}
						lastElement = null;
				}
				ckBody = null;
				body = this.editor.document.getBody().$;
				body.style.height = enterKeyAutomaticAdjust+"px";
				var drawFrameClassesNode = dojo.query(".draw_frame_classes",body)[0];
            	if (drawFrameClassesNode) {
					drawFrameClassesNode.style.height = enterKeyAutomaticAdjust - 4 +"px";
				}
				//fix for proper scrolling if user presses enter at the end of the visible area
				if (dojo.isFF || dojo.isWebKit) {
					var selection = this.editor.getSelection();
					var selectedNode = selection.getStartElement().$;
					
            		var drawFramClasses = dojo.query('.draw_frame_classes', this.editor.document.$.body);
           		    var drawFramClassesDiv = null;
            		if (drawFramClasses && drawFramClasses.length>0){
                		drawFramClassesDiv = drawFramClasses[0];
            		}
            		var totalHeight = 0;
            		var foundSelectedNode = false;
            		for (var i = 0;(!foundSelectedNode) && (i< drawFramClassesDiv.childNodes.length); i++ ){
            			// 13310 make sure the height calculation uses li items in ordered and unordered lists
            			if (drawFramClassesDiv.childNodes[i].nodeName.toLowerCase() == 'ul' || drawFramClassesDiv.childNodes[i].nodeName.toLowerCase() == 'ol') {
            				for (var x = 0; (!foundSelectedNode) && (x< drawFramClassesDiv.childNodes[i].childNodes.length); x++ ){
            					totalHeight+=drawFramClassesDiv.childNodes[i].childNodes[x].offsetHeight;
            					//if (selectedNode.id == drawFramClassesDiv.childNodes[i].childNodes[x].id || selectedNode.parentNode.id == drawFramClassesDiv.childNodes[i].childNodes[x].id){
            					//	foundSelectedNode = true;
            					//	break;
            					//}
            					var tempNode1 = null;
	            				var tempNode2 = null;            				
	            				tempNode1=selectedNode;	
	            				while(tempNode1)
	            				{
		            				if (tempNode1.id == drawFramClassesDiv.childNodes[i].childNodes[x].id || tempNode1.parentNode.id == drawFramClassesDiv.childNodes[i].childNodes[x].id){
		            					foundSelectedNode = true;
		            					break;
		            				}else{
		            					if (tempNode1.parentNode.nodeName.toLowerCase() == drawFramClassesDiv.nodeName.toLowerCase()){
		            						foundSelectedNode = false;
		            						break;
		            					}else{
		            						tempNode2=tempNode1.parentNode;
		            						tempNode1=tempNode2;
		            					}
		            				}
	            				}
            					
            				}
            			} else {
            				totalHeight+=drawFramClassesDiv.childNodes[i].offsetHeight;
            				//if (selectedNode.id == drawFramClassesDiv.childNodes[i].id || selectedNode.parentNode.id == drawFramClassesDiv.childNodes[i].id){
            				//	foundSelectedNode = true;
            				//}

            				var tempNode1 = null;
            				var tempNode2 = null;            				
            				tempNode1=selectedNode;	
            				while(tempNode1)
            				{
	            				if (tempNode1.id == drawFramClassesDiv.childNodes[i].id || tempNode1.parentNode.id == drawFramClassesDiv.childNodes[i].id){
	            					foundSelectedNode = true;
	            					break;
	            				}else{
	            					if (tempNode1.parentNode.nodeName.toLowerCase() == drawFramClassesDiv.nodeName.toLowerCase()){
	            						foundSelectedNode = false;
	            						break;
	            					}else{
	            						tempNode2=tempNode1.parentNode;
	            						tempNode1=tempNode2;
	            					}
	            				}
            				}
      
            			}
            		}
            		
                	var drawFrameClassesNode = dojo.query(".draw_frame_classes",this.contentBoxDataNode)[0];
                	if (drawFrameClassesNode) {
    					drawFrameClassesNode.style.height = this.mainNode.style.height - 14 +"px";
    				}
            		if (dojo.isFF && (body.parentNode.scrollTop + parseFloat(this.mainNode.style.height) - 20 ) < totalHeight) {
						body.parentNode.scrollTop = totalHeight - parseFloat(this.mainNode.style.height) + 20;
					}
					if (dojo.isWebKit && (body.scrollTop + parseFloat(this.mainNode.style.height) - 20 ) < totalHeight) {
						body.scrollTop = totalHeight - parseFloat(this.mainNode.style.height) + 20;
					}
					selectedNode = null;
					drawFramClasses = null;
					drawFramClassesDiv = null;
				}
				window.pe.scene.validResize = true;
				body = null;
				drawFrameClassesNode =  null;
				return;
			}
		}
		var ckBody = this.editor.document.getBody().$;
		var isMobileTextBox = (this.contentBoxType == PresConstants.CONTENTBOX_TEXT_TYPE || this.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE) && concord.util.browser.isMobile();
		if(isMobileTextBox)
			dojo.removeClass(ckBody, 'mobileAutoHeight');
		
		var dataNode  = dojo.query("#cke_"+this.getEditorName(),this.mainNode)[0];
		var containerDataHeight = dataNode.offsetHeight;
		var enterKeyAdjust = (enterKeyAutomaticAdjust==0) ? ckBody.offsetHeight : enterKeyAutomaticAdjust;
		// 24 comes from body? padding  8 + 8  then another 4 + 4 from html box
		var editorContentHeight = (this.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE ) ? ckBody.firstChild.offsetHeight : enterKeyAdjust; 
		//console.log(' Body height in px + 3 * 8: '+(this.editor.document.$.body.offsetHeight+24)+"\ncke_datanode "+dataNode.offsetHeight);
		if(isMobileTextBox && editorContentHeight > ckBody.offsetHeight)
			dojo.addClass(ckBody, 'mobileAutoHeight');
		if (bForce || Math.abs(editorContentHeight - containerDataHeight)>1 ){ //if greater or equal then scrollbars will appear need to adjust
			// on chrome & safari will always have a adjuest message when using equal at here. the vaule is such as is 156 & 157. ignore it.
			// 1 - Resize CKEDITOR window based on new height			
			var adjustWidthTmp = this.getWidth_adjust();
			var ckWidth = this.mainNode.offsetWidth - adjustWidthTmp;
			var ckHeight = editorContentHeight;
			var resized = false;
			try {
				resized = this.editor.resize(ckWidth,ckHeight,true); //Modified with 16632 but needed even if we pull 16632 off - This will prevent span parent of Iframe to grow when user types
			} catch(e) {
				console.log("Issue arised when update editor window width/height: " + e);
			}

			// 2 - Resize mainNode Container
			//But skip this step if node is a shape Defect 13609	
			if(editorContentHeight != containerDataHeight && !this.isShape()){
				try{
			    	var newH = this.PxToPercent(editorContentHeight,'height') +"%";
					if (dojo.hasClass(this.mainNode, 'g_draw_frame')) {
						PresCKUtil.updateDFHeightForImageGroup(this.mainNode, editorContentHeight);
					} else {
						dojo.style(this.mainNode,{
							'height' : newH			 
						});
						// update mobile contentbox height
						if(isMobileTextBox && this.contentBoxType != PresConstants.CONTENTBOX_TABLE_TYPE)
							concord.util.mobileUtil.presObject.processMessage(this.mainNode.id, MSGUTIL.actType.setAttributes);
					}
					
					// If not a table do normal processing of the editor dimensions
					// If a table need to handle editor adjustments differently then other elements
					// On text entry in edit mode for a table, need to update the table and edit
					// box dimensions as text entry can expand or shrink the table cell
					if (this.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE) {
						this._updateTableOnEditResize();
					}
					this.updateHandlePositions(false);
				}catch(e){
			   		console.log("Error in contentbox.editorAdjust(PresCKUtil.updateDrawFrameHeight): " + e);
		   		}
				resized = true;
			}

			if (!resizingFlag && !undoFlag){	
				//13550 - when the text is spilling the shape bottom border, there was an issue with teh top left in sorter is changed/shifted to the right 
				//for textbox part of the group object, we don't need to show handle and adjust the top/left attribute when the editor grows
				//since the border and handles are on the group object draw_frame level, not on the g_draw_frame level
				if(dojo.hasClass(this.mainNode, "g_draw_frame") != true) {
				    this.showHandles();  // this will resize the handles	
				    if(resized) {
				    	//D22341, for draw frame(table and textbox) height change, we have to use publishBoxStyleResizing to create messages
				    	this.editor.continueInput = false;
				    	try{
				    		
				    		this.publishBoxStyleResizingEnd();
				    	}catch(e){
				    		console.log("publishBoxStyleResizing :   " + e);
				    	}
				    	PresCKUtil.runPending();
				    	PresCKUtil.normalizeMsgSeq(null, null, null, "endMerge"); //end of user hit enter key
				    	//this.publishBoxAttrChanged(null, nodeToAdjust ? nodeToAdjust.id : null,true,this.editor.isTable);
				    	return true;
				 	}
				}
			 }
		}
		}catch(e){
			console.log("Issue arised from contentBos.editorAdjust: " + e);
		}
		
        window.pe.scene.validResize = true;
	},
	
	isShape: function() {
		var df = this.mainNode;
		if(dojo.hasClass(df, 'g_draw_frame')) {				
			while(df){
				if ((df) && (dojo.hasClass(df,'draw_frame'))){
					break;
				} else if (df.tagName.toLowerCase()=='body'){
					df=null;
					break;
				}
				df = df.parentNode;
			}				
		}
		return dojo.attr(df, "ungroupable") == "yes" ? true : false;	
	},
	
	//
	// Insert CSS into CKEDITOR
	//
	injectCSS: function(cssFileName,useAttchmentURL){
   		var doc =  this.editor.document.$;
   		concord.util.uri.injectCSS(doc,cssFileName,useAttchmentURL);
	},
		
	//
	// Ensure pending changes are saved	
	//
	chkPendingChanges: function(resetCtr){		
	},
	
	//
	//	Makes contentBox non Editable inside the parentContainerNode. Should be called instead of toggleEditMode
	//  when you wish to destroy editor instead of hiding it.
	//  If this is the spare then we should not kill editor unless force == true
	//	
	makeNonEditable: function(force,fromUndoRedo){  //D15602 - Need to know if this is from undoRedo		
		//console.log("contentBox:makeNonEditable","Entry");
		//If coder gets here this must be a regular box that needs to exit edit mode
		// or force is true on a spare and we must kill editor.
		//
		  if(this.editor){
			  //Let's ensure there is nothing left to send to sorter
//			  this.chkPendingChanges(true); // pass in true to reset synchAllTodoCtr ctr
			  PresCKUtil.runPending(this.editor);
			  if(this.isEditModeOn()==true){
				  var turnOnEditMode = false;
				  this.toggleEditMode(turnOnEditMode,fromUndoRedo);
			  }	
			  var editorName = fromUndoRedo?this.getEditorName():null;
			  concord.util.presToolbarMgr.setFocusSorterTb(editorName);			  
			  if (window.pe.scene.slideEditor.SINGLE_CK_MODE){
				  if ((!this.boxRep) ||
				  	  (this.boxRep && force==true)){ //should not destroy editor for spare unless force is true
					  this.destroyThisEditor();
				  }
			  } else {
				  this.destroyThisEditor();
			  }
			  //this.processEditorClose();
			//Let's send coedit message that this user is no longer in edit mode for this content Box
			this.editModeOn =false;
			this.publishBoxEditMode();
			this.disableMenuItemsOnNonEdit();
			if(dojo.isSafari && !concord.util.browser.isMobile())
				pe.scene.clipboard.focusClipboardContainer();
		  }
//		console.log("contentBox:makeNonEditable","Exit");
	},
	
	//
	// Verifies status of placeHolder flag
	//
	chkisEmptyCBPlaceholderProp: function(){
		// 1- let's check if there is any text at all
		var node = PresCKUtil.getDFCNode(this.editor);
		if(PresCKUtil.doesNodeContainText(node)){
			
			//S24380, take 8203 as a valid char so need a check here
			var txt = TEXTMSG.getTextContent(node);
			if(txt && (txt.length === 1) && (txt.charCodeAt(0) == 8203 )){
				return this.isEmptyCBPlaceholder;
			}
			
			//It does contain text then we are sure that this is no longer a place holder
			this.isEmptyCBPlaceholder =false;
		}
		return this.isEmptyCBPlaceholder;
	},
	
	checkEmptyPlaceholder: function(){
		var ckMainNode = PresCKUtil.ChangeToCKNode(this.mainNode);
		var isPlaceholder = dojo.attr(this.mainNode,'presentation_placeholder');
		var presClass = dojo.attr(this.mainNode,'presentation_class');
		var isEmptyPlaceholder = false;
		var LineItems = dojo.query('li,p',this.mainNode);
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
	
	processEditorOpen: function()
	{
		// it's posssible it's reset to placeholder by another user in co-editing
		// it's necessary to also check this attriubte
		var b_emptyCB_placeholder = dojo.attr(this.mainNode, 'emptyCB_placeholder');
		//Before showing Editor let's verify if this is newBox or place holder
		//This needs to be done to synch back empty CK content to canvas which at this
		//point should have placeholder text or default newBox text
		if ((dojo.hasClass(this.mainNode,'newbox')) && (this.newBox)){
			var node = dojo.query('.newTextContent',this.editor.document.getBody().$)[0];
			if(node)
				this.blankOutCKContentAndSynchForDefaultText(node);
		} else if ((this.createFromLayout)
				|| (this.isEmptyCBPlaceholder)
				|| (b_emptyCB_placeholder == 'true')) {
			var body = this.editor.document.getBody().$;
			dojo.removeClass(body,PresConstants.LAYOUT_CLASS);// remove from ckeditor

			var msgList = [];
			if(dojo.hasClass(this.mainNode, PresConstants.LAYOUT_CLASS)) {
				var dataNode = this.mainNode;
				var parkMsgPair= true;
				//Let's park msgPairList since we are entering edit mode on a default content box
				//-replace removeUndo
				TEXTMSG.handleNodeAttr(dataNode, 'class', function() {
					dojo.removeClass(dataNode,'layoutClass');
				},null,parkMsgPair,this.editor,msgList);
			}

			if(dojo.hasClass(this.contentBoxDataNode,PresConstants.LAYOUT_CLASSSS)) {
				var dataNode = this.contentBoxDataNode;
				var parkMsgPair= true;
				//
				//Let's park msgPairList since we are entering edit mode on a default content box
				//
				var useParkMsg = false; //Tell synch.sendMessge not to use the part to send to avoid duplicate msg 
				TEXTMSG.handleNodeAttr(dataNode, 'class', function() {
					dojo.removeClass(dataNode,'layoutClassSS');
                    //console.info(dataNode.id);
				},null,parkMsgPair,this.editor,msgList,useParkMsg);
			}
			
			//Add to cmdlist
			var cmdList = new Array();
//			JMT phase this out
			content = dojo.query('.defaultContentText',body);
			if (content.length>0){
				if (dojo.hasClass(content[0],PresConstants.CONTENT_BOX_TITLE_CLASS)){ //If title then remove default text
					if ((content[0].childNodes.length>0) && (content[0].childNodes[0].nodeName.toLowerCase()=='span')){
						var node = content[0].childNodes[0];
						cursorPos = node;
					} else{
						var node = content[0];
						cursorPos = node;
					}
					this.blankOutCKContentAndSynchForDefaultText(node,cmdList);
				} else if (dojo.hasClass(content[0],PresConstants.CONTENT_BOX_SUBTITLE_CLASS)){ //If subtitle then remove default text
					if ((content[0].childNodes.length>0) && (content[0].childNodes[0].nodeName.toLowerCase()=='span')){
						var node = content[0].childNodes[0];
						cursorPos = node;
					} else{
						var node = content[0];
						cursorPos = node;
					}
					this.blankOutCKContentAndSynchForDefaultText(node,cmdList);
				} else if (dojo.hasClass(content[0],PresConstants.CONTENT_BOX_NOTES_CLASS)){ //If notes then remove default text
					if ((content[0].childNodes.length>0) && (content[0].childNodes[0].nodeName.toLowerCase()=='span')){
						var node = content[0].childNodes[0];
						cursorPos = node;
					} else{
						var node = content[0];
						cursorPos = node;
					}
					this.blankOutCKContentAndSynchForDefaultText(node,cmdList);
				} else if (dojo.hasClass(content[0],PresConstants.CONTENT_BOX_OUTLINE_CLASS)){ //If outline then remove default text
					var li = content[0];
					
					//in case the defaultContentText class is on ul element
					if(li && PresCKUtil.checkNodeName(li,'ul'))
					{
						li = li.childNodes[0];
					}	
					if ((li.childNodes.length>0) && (li.childNodes[0].nodeName.toLowerCase()=='span')){
						var node = li.childNodes[0];
						//node.innerHTML =' ';
						cursorPos = node;
					} else{
						var node = li;
						//node.innerHTML = ' ';
						cursorPos = node;
					}
					this.blankOutCKContentAndSynchForDefaultText(node,cmdList);
				}
			}
			body = null;
			dataNode = null;
		}
	},
	
	// D25999: refer processEditorClose() to handle speaker notes when it has placeholder flag
	processEditorCloseForSpeakernotes: function() {
		if (this.chkisEmptyCBPlaceholderProp()) {
			this.createFromLayout=true;
			TEXTMSG.handleNodeAttrNoUndo(this.mainNode, 'class', function(data) {
				if(!dojo.hasClass(data.node, data.attr)) {
					dojo.addClass(data.node, data.attr);
				}
			}, {node: this.mainNode, attr: PresConstants.LAYOUT_CLASS});

			//Now let's re-add defaultcontent since user did not edit
			delete this.editor.parkedMsgPairList;
			var sendCoeditMsg = false;
			var node = this.contentBoxDataNode;
			TEXTMSG.handleNodeAttrNoUndo(node, 'class', function() {
				//Add this class back since user did not modify this placeholder but do not add to undo q
				dojo.addClass(node,'layoutClassSS');
			});

			//D2845 ensure that attributes are also updated
			//Update mainNode emptyCB_placeholder
			TEXTMSG.handleNodeAttrNoUndo( this.mainNode, 'emptyCB_placeholder', function(data){
				dojo.attr(data.node, data.attr,'true'); //update presentation attribute
			},{node: this.mainNode, attr: 'emptyCB_placeholder'});

			//Update mainNode emptyCB_placeholder
			TEXTMSG.handleNodeAttrNoUndo( this.mainNode, 'presentation_class', function(data){
				dojo.attr(data.node, data.attr,'backgroundobjects'); //update presentation attribute
			},{node: this.mainNode, attr: 'draw_layer'});

			this.resetCKContentAndSynchForDefaultText();
		}
	},
	
	processEditorCloseForPlaceholder: function() {
		if (this.chkisEmptyCBPlaceholderProp()) {
			this.createFromLayout=true;
			TEXTMSG.handleNodeAttrNoUndo(this.mainNode, 'class', function(data){
				if(!dojo.hasClass(data.node, data.attr)) {
					dojo.addClass(data.node, data.attr);
				}
			}, {node: this.mainNode, attr: PresConstants.LAYOUT_CLASS});
		
			//Update mainNode emptyCB_placeholder
			delete this.editor.parkedMsgPairList;
			var sendCoeditMsg = false;
			var node = this.contentBoxDataNode;
			TEXTMSG.handleNodeAttrNoUndo(node, 'class', function(){
				dojo.addClass(node,'layoutClassSS'); //Add this class back since user did not modify this placeholder but do not add to undo q
			});
			
			//D2845 ensure that attributes are also updated
			//Update mainNode emptyCB_placeholder
			TEXTMSG.handleNodeAttrNoUndo( this.mainNode, 'emptyCB_placeholder', function(data){
				dojo.attr(data.node, data.attr,'true'); //update presentation attribute
			},{node: this.mainNode, attr: 'emptyCB_placeholder'});

			//Update mainNode emptyCB_placeholder
			TEXTMSG.handleNodeAttrNoUndo( this.mainNode, 'presentation_class', function(data){
				dojo.attr(data.node, data.attr,'backgroundobjects'); //update presentation attribute
			},{node: this.mainNode, attr: 'draw_layer'});
			
			var bNeedRestoreDefaultText = false;
			var isNodeEmpty = PresCKUtil.isNodeTextEmpty(this.mainNode);
			var isPlaceholder = dojo.attr(this.mainNode,'presentation_placeholder');
			if (isNodeEmpty && isPlaceholder)
				bNeedRestoreDefaultText = true;
			if (!bNeedRestoreDefaultText){
				// process content need to add default text
				var content = dojo.query('.defaultContentText',this.editor.document.getBody().$);
				if (content.length>0){
					if (dojo.hasClass(content[0],PresConstants.CONTENT_BOX_OUTLINE_CLASS)) {
						if(dojo.hasClass(content[0],'centerTextAlign')){
							bNeedRestoreDefaultText = true;
						}else {
							var liNodes = dojo.query('li',content[0]);
							if ((liNodes.length>0) && (liNodes[0].childNodes.length > 0) && (liNodes[0].childNodes[0].nodeName.toLowerCase()=='span')){
								var node = liNodes[0].childNodes[0];
								bNeedRestoreDefaultText = true;
							}
						}
					}
					if (dojo.hasClass(content[0],PresConstants.CONTENT_BOX_TITLE_CLASS) ||
						dojo.hasClass(content[0],PresConstants.CONTENT_BOX_NOTES_CLASS) ||
						dojo.hasClass(content[0],PresConstants.CONTENT_BOX_SUBTITLE_CLASS)){
						bNeedRestoreDefaultText = true;
					}
				}
			}
			
			if(bNeedRestoreDefaultText)
				this.resetCKContentAndSynchForDefaultText();
		}
	},
	// updateListStyle for both viewMode and slideSorter
	updateListStyle: function() {
		var newStyle = window.pe.scene.slideSorter.newStyle;
		var delStyle = window.pe.scene.slideSorter.delStyle;
		if (newStyle || delStyle.length) {
			pe.scene.slideSorter.newlistBeforeStyleStack = newStyle;
			pe.scene.slideSorter.deletelistBeforeStyleStack = delStyle;
			var listBeforeStyleSheetinSorter = pe.scene.slideSorter.getListBeforeStyleSheetInSorter();
			var fragment = PresCKUtil.doUpdateListStyleSheetupdateTextNode(listBeforeStyleSheetinSorter,
					pe.scene.slideSorter.getSorterDocument());
			pe.scene.slideSorter.listBeforeStyleSheet = fragment;

			var listBeforeStyleSheetinViewMode = PresCKUtil.getListBeforeStyleSheet(window.document);
			PresCKUtil.doUpdateListStyleSheetupdateTextNode(listBeforeStyleSheetinViewMode,window.document);

			pe.scene.slideSorter.newlistBeforeStyleStack = {};
			pe.scene.slideSorter.deletelistBeforeStyleStack = [];

			window.pe.scene.slideSorter.newStyle = {};
			window.pe.scene.slideSorter.delStyle = [];
		}
	},

	// handles cleaning up after editor closes or hides. It assumes that this.editor still exists.
	processEditorClose: function(fromUndoRedo){
		if (!dojo.isIE)
			this.updateListStyle();

		//D29366: [Chrome]Font display on thumnail page very larger than normal page
		PresCKUtil.removeAppleStyleSpan(this.editor);
		try {
			PresCKUtil.runPending();
		}catch (e){
			console.log("processEditorClose_PresCKUtil.runPending:"+e);
		}
		var fromUndo = (fromUndoRedo!=null)? fromUndoRedo: false; //D15602 	
	
		var isPlaceholder = dojo.attr(this.mainNode,'presentation_placeholder');
		if ((this.isDirty) && (this.isEmptyCBPlaceholder)){ // if user has modified the layout in ckeditor and this is a placeholder then cleanup placeholder to transform into textcontent
			this.cleanupLayoutDefaultText();
		} else if (this.isEmptyCBPlaceholder && this.editor.isSpeakerNotes) {
			this.processEditorCloseForSpeakernotes();
		} else if (this.isEmptyCBPlaceholder && isPlaceholder == "true"){ // Restore placeHolderStatus
			this.processEditorCloseForPlaceholder();
		} else if ((dojo.hasClass(this.mainNode,'newbox'))/* && (!this.newBox)*/){ // This is a new box which may have just been modified
			if (window.pe.scene.slideEditor.SINGLE_CK_MODE){
				if (!this.editor.newBox){ // a newbox which just got modified in single ck mode
					dojo.removeClass(this.mainNode,'newbox');
					var addToUndo = false;
					this.publishBoxAttrChanged('class',null,true,addToUndo);
					this.newBox=false;
					this.editor.contextMenu.hide();
					
					var presClass = dojo.attr(this.mainNode,'presentation_class');
					var dfc = PresCKUtil.getDFCNode(this.editor);
					//Text was modified but is now empty, the textbox need to delete.
					if(!fromUndo && (presClass == '')
							&& PresTxtboxUtil.shouldTxtboxBeDeleted(dfc, presClass)){
						//console.log("remove empty textbox");
						//console.log('clear park msg from contentbox 7487');
						delete this.editor.parkedMsgPairList; //clear park
						this.deleteMe = true;
						var addToUndo = true;			
						this.deleteContentBox(true,addToUndo);
						PresCKUtil.normalizeMsgSeq(null,null,null,'endMerge');
					}
					
					return;
				}
			}

			var node = this.editor.document.getBody().getChild(0);
			if ( node) {
				var textContent;
				var backgroundColor = node.$.firstChild? node.$.firstChild.style.backgroundColor : "";
				if(dojo.isIE <9) //D18280 - need to ensure that we get the correct text content so we can trigger the delete of the content box 
				{
				   	textContent=node.$.innerText;
				}else{
					textContent=node.$.textContent;
				}
				if (this.getNbspHandler().checkTxtBox(node) || textContent.length > 1 || backgroundColor != ""){
					this.newBox = false;
					this.isDirty = true;
					dojo.removeClass(this.mainNode,'newbox');
					if (!dojo.hasClass(this.mainNode,'isSpare') && this.contentBoxType != PresConstants.CONTENTBOX_TABLE_TYPE) {
						//-replace removeUndo
						var addToUndo = false;
						this.publishBoxAttrChanged('class',null,true,addToUndo);
					}
					var presClass = dojo.attr(this.mainNode,'presentation_class');
					//Text was modified but is now empty, the textbox need to delete.
					if(!fromUndo && !TEXTMSG.hasTxt(textContent,true) &&presClass !=null && presClass.length==0){
						//console.log("remove empty textbox");
						//console.log('clear park msg from contentbox 7521');
						delete this.editor.parkedMsgPairList; //clear park
						this.deleteMe = true;
						var addToUndo = true;			
						this.deleteContentBox(true,addToUndo);
					}
					
				} else {
					// user did nothing so delete this newly created box instead of resetting content to default text
					delete this.editor.parkedMsgPairList; //clear park
					this.deleteMe = true;
				}
			} else {
				dojo.removeClass(this.mainNode,'newbox');
				this.publishBoxAttrChanged('class',null,true);
			}
			
		}else if ( this.contentBoxType != PresConstants.CONTENTBOX_TABLE_TYPE ) { 
			//D2845  if not a custom text box			
			var dfc = PresCKUtil.getDFCNode(this.editor);
			var presClass = dojo.attr(this.mainNode,'presentation_class');
			
			//Text was modified but is now empty, the textbox need to delete.
			var isPresClassEmpty=
				((presClass != null && presClass.length == 0) || presClass == "null");
			if(!fromUndo && PresTxtboxUtil.shouldTxtboxBeDeleted(dfc, presClass)
					&& isPresClassEmpty){
				//console.log("remove empty textbox");
				//console.log('clear park msg from contentbox 7546');
				this.editor.parkedMsgPairList = null; //clear park
				this.deleteMe = true;
				var addToUndo = true;			
				this.deleteContentBox(true,addToUndo);
				PresCKUtil.normalizeMsgSeq(null,null,null,'endMerge');
			}

			var grpFlg = dojo.attr(this.mainNode.parentNode.parentNode, "presentation_class") != "group";
			var shpFlg = !dojo.hasClass(this.mainNode.parentNode.parentNode, "shape_svg");
			// Text was modified but is now empty need to restore if it is an empty non custom box
			if(grpFlg && shpFlg && !fromUndo && !PresCKUtil.doesNodeContainText(dfc, false, true, true)
					&& !isPresClassEmpty){
				this.isEmptyCBPlaceholder = true;
				this.isDirty=false; //reset since user really did not modify anything		
				
				//1 - Add layoutClass to mainNode
				var msgPairs = [];
				var attrName = "class";

				var newE = new CKEDITOR.dom.node(this.mainNode);
				var oldAttrValue = newE.getAttribute(attrName);
				dojo.addClass(this.mainNode,PresConstants.LAYOUT_CLASS);
				msgPairs = SYNCMSG.createAttributeMsgPair(newE, attrName, null, msgPairs,oldAttrValue);

				//2- Add contentBoxDataNode class LAYOUT_CLASSSS															
				var newE = new CKEDITOR.dom.node(this.contentBoxDataNode);
				var oldAttrValue = newE.getAttribute(attrName);
				dojo.addClass(this.contentBoxDataNode,PresConstants.LAYOUT_CLASSSS);
				msgPairs = SYNCMSG.createAttributeMsgPair(newE, attrName, null, msgPairs,oldAttrValue);
				

				//3- Update mainNode emptyCB_placeholder
				attrName = "emptyCB_placeholder";
				msgPairs = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(this.mainNode), attrName, 'true', msgPairs);									
				dojo.attr(this.mainNode,'emptyCB_placeholder','true');
				
				//4- Update mainNode draw_layer
				attrName = "draw_layer";
				//4- Update mainNode draw_layer
				attrName = "draw_layer";
				msgPairs = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(this.mainNode), attrName, 'layout', msgPairs);									
				dojo.attr(this.mainNode,'draw_layer','layout');
								
				var addToUndoAndMerge = false;
				this.resetCKContentAndSynchForDefaultText(msgPairs,addToUndoAndMerge);	
				this.editor.parkedMsgPairList = null;
				bDefaultTextResetted = true;
			}
		}
		
		//26661,[GVT][IE10][IE9][Regression] DBCS words lost when move cursor to other slide.
		//27105,The undo button is enable after only goto table cell and exit edit mode
		if(!this.deleteMe && this.editor.contentBox && this.editor.userInput )
		{
			var synchNode = this.editor.contentBox.getContentEditNode();
			synchNode && this.editor.contentBox.synchAllData( synchNode );
		}
		this.editor.contextMenu.hide();
		
		//D26833 [Chrome][Regression]Enter into outline, it will lead to all selection if you have ever pressed ctrl+a in a title placeholder
		if(this.editor.ctrlA){
			this.editor.ctrlA = false;
			if(this.editor.getSelection()){
				this.moveCursorPositionToLastNode(this.editor.getSelection());
			}
		}
		!concord.util.browser.isMobile() && window.pe.scene.setFocusToSlideEditor();
	},
	
	// Sets the data of the contentBox to default contentBox in case user did
	// not specify data contentBox. This needs to be implemented by the subclass
	getDefaultContentData: function(){
		throw new Error("fragment.getDefaultContentData() has not been defined");
	},
	
	// Sets the data of the contentBox. This needs to be implemented by the subclass
	setContentData: function(){
		throw new Error("fragment.setContentData() has not been defined");
	},
	
	//Event thrown when resizing
	resizing: function(e){
	},
	
	//
	// This function returns the equivalent em given a px number
	//
	PxToEm: function(px){
		// Get current Font-Size
		//console.log("contentBox:PxToEm","Entry px is "+px+"px");
		var curFontSize = parseFloat(dojo.style(this.parentContainerNode,'fontSize')); // px Need to get this programatically
		var result =  px/curFontSize;
		//console.log("contentBox:PxToEm","Exit em is "+result+"em. (Based on fontsize of "+curFontSize+"px.  i.e 1em = "+curFontSize+"px");
		return result;
	},
	
	//
	// This function returns the equivalent % given a px number
	//
	PxToPercent: function(px,heightOrWidth){
		//console.log("contentBox:PxToPercent","Entry px is "+px);
		var pxValue = parseFloat(px);
		//var value = (heightOrWidth=='height')? parseFloat(this.parentContainerNode.style.height) : parseFloat(this.parentContainerNode.style.width);
		// for presentation notes, we need to use the height from the slideeditor container, not the parent container
		var parent = (this.contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE) ? this.parentContainerNode.parentNode : this.parentContainerNode;
		var value = (heightOrWidth=='height')? parent.offsetHeight : parent.offsetWidth;
		var result =  (pxValue * 100)/value;
		//console.log("contentBox:PxToPercent","Exit % is "+result+"%. (Based on px for heightWidth = "+heightOrWidth+" and Value = "+value);
		return result;
	},
	
	//
	// Converts percent to em
	//
	PercentToEm: function(perc){
		//console.log("contentBox:PercentToEm","Entry perc is "+perc);
		return perc/100;
	},

	//
	// Converts percent to em
	//
	EmToPercent: function(em){
		//console.log("contentBox:EmToPercent","Entry em is "+em);
		return em * 100;
	},
	
	//
	// This function returns the equivalent px given a % number
	//
    PercentToPx: function(pct,heightOrWidth){
        //console.log("contentBox:PercentToPx","Entry pct is "+pct);
        var pctValue = parseFloat(pct);
        var value = (heightOrWidth=='height')? this.parentContainerNode.offsetHeight : this.parentContainerNode.offsetWidth;
        var result =  (pctValue * value)/100;
        return result;
    },
	
	moveToPosition: function(pos){
		//Let's determine original position. If we can't we will use pos
		var origTop   = (pos) ?  pos.top   : parseFloat(this.initialPositionSize.top);
		var origLeft  = (pos) ?  pos.left  : parseFloat(this.initialPositionSize.left);
		var origWidth = (pos) ?  pos.width : parseFloat(this.initialPositionSize.width);
		var origHeight= (pos) ?  pos.height: parseFloat(this.initialPositionSize.height);
		
		origTop = (isNaN(origTop)) ? 0 : origTop;
		origLeft = (isNaN(origLeft)) ? 0 : origLeft;
		origWidth = (isNaN(origWidth)) ? 0 : origWidth;
		origHeight = (isNaN(origHeight)) ? 0 : origHeight;
				
		dojo.style(this.mainNode,{
			'top' : origTop +'%',
			'left': origLeft +'%',
			'height': origHeight+'%',
			'width': origWidth +'%',
			'position':'absolute'
		});
		if(dojo.isSafari && !concord.util.browser.isMobile())
			pe.scene.clipboard.focusClipboardContainer();
	},
	
	moveImg: function(pos,keepSelected){
		//Let's determine original position. If we can't we will use pos
		var origTop   = (pos.top!=null && !isNaN(pos.top)) ?  parseFloat(pos.top)   : parseFloat(this.mainNode.style.top);
		var origLeft  = (pos.left!=null && !isNaN(pos.left)) ?  parseFloat(pos.left)  : parseFloat(this.mainNode.style.left);
		//var origWidth = (pos.width!=null && !isNaN(pos.width)) ? parseFloat( pos.width) : parseFloat(this.mainNode.style.width);
		//var origHeight= (pos.height!=null && !isNaN(pos.height)) ?  parseFloat(pos.height): parseFloat(this.mainNode.style.height);
						
		dojo.style(this.mainNode,{
			'top' : origTop +'%',
			'left': origLeft +'%',
			//'height': origHeight+'%',
			//'width': origWidth +'%',
			'position':'absolute'
		});
		if (!keepSelected)
			this.deSelectThisBox();
		if(dojo.isSafari && !concord.util.browser.isMobile())
			pe.scene.clipboard.focusClipboardContainer();
	},
	
	moveAndResize: function(pos,keepSelected){
		//Let's determine original position. If we can't we will use pos
		var origTop   = (pos.top!=null && !isNaN(pos.top)) ?  parseFloat(pos.top)   : parseFloat(this.mainNode.style.top);
		var origLeft  = (pos.left!=null && !isNaN(pos.left)) ?  parseFloat(pos.left)  : parseFloat(this.mainNode.style.left);
		var origWidth = (pos.width!=null && !isNaN(pos.width)) ? parseFloat( pos.width) : parseFloat(this.mainNode.style.width);
		var origHeight= (pos.height!=null && !isNaN(pos.height)) ?  parseFloat(pos.height): parseFloat(this.mainNode.style.height);
						
		dojo.style(this.mainNode,{
			'top' : origTop +'%',
			'left': origLeft +'%',
			'height': origHeight+'%',
			'width': origWidth +'%',
			'position':'absolute'
		});
		if (!keepSelected)
			this.deSelectThisBox();
		if(dojo.isSafari && !concord.util.browser.isMobile())
			pe.scene.clipboard.focusClipboardContainer();
	},
	
	
	//
	// Update Image URL. When pasting we want the url to belong to the target document
	//
	updateImageURL: function(){
		var src = dojo.attr(this.contentBoxDataNode,'src');
		var context = window.contextPath;
		//context always starts with "/", get rid of the slash
		context = context.substring(1);
		if(concord.util.uri.hasContext(context, src)){
			var serviceUrl = concord.util.uri.getPasteAttachmentURL();
//			serviceUrl = concord.main.App.appendSecureToken(serviceUrl);
			var newSrc = concord.util.uri.getUploadedAttachmentURL(src, serviceUrl, this.contentBoxDataNode.id);
			dojo.attr(this.contentBoxDataNode,'src',newSrc);
		}
	},
	
	//
	// Add image to document. Called when pasting image and group to canvas to add image file to document.
	// url is the image's fully qualified url.
	// e.g. 'http://hostname:port/concord/app/doc/concord.storage/abc.odp/edit/Pictures/key.png'
	//
	addImageToDoc: function(url){
		var newUri=null;
		if(url!=null && url.length>0){
			var servletUrl = concord.util.uri.getPasteAttachmentURL();
			var obj = {};
  			obj.uri = url;
			
			var sData = dojo.toJson(obj);
			var response, ioArgs;
			dojo.xhrPost({
				url: servletUrl,
				handleAs: "json",
				handle: function(r, io){
								response = r;
								ioArgs = io;
								newUri = response.uri;
						},
				sync: true,
				contentType: "text/plain",
				postData: sData
			});
			return (newUri!=null)? newUri : null;
		}
	},
	
	//
	// Paste copied box. The docUUID is the id of the source doc where obj was copied from
	//
	pasteBox: function(docUUID,imgUrl,currMasterName, isMultipleBoxSelected, isFromExtPres){
		// A copied box has all the needed elements except that the mainNode is not yet attached to the slideEditor
		// pasting then consist of attaching the mainNode to the slide editor
		var newImgUrl = null;
		if (this.contentBoxType == PresConstants.CONTENTBOX_TEXT_TYPE) {
			var sameDoc = (docUUID == window.pe.scene.bean.getUri()) ? true : false;
			this.updateODPClasses(sameDoc, currMasterName);
		} else if ((this.contentBoxType == PresConstants.CONTENTBOX_IMAGE_TYPE) || (this.contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE)){
		   if (docUUID!= window.pe.scene.bean.getUri()){
			   var fullUrl = location.protocol + "//" + location.host + window.contextPath + "/" + imgUrl;
			   if (isFromExtPres)
				   fullUrl = imgUrl;
			   newImgUrl = this.addImageToDoc(fullUrl.split("?")[0]);	// clean random param before sending to backend service
		   }
		   if (newImgUrl!=null){
				//D34969: Paste an image into a slide, two same get requests are fired.
				if (this.contentBoxType == PresConstants.CONTENTBOX_IMAGE_TYPE){
					if (isFromExtPres){
						dojo.query('img.draw_image',this.mainNode).forEach(function(_node){
							dojo.attr(_node, 'src', '');
							dojo.attr(_node, 'src', newImgUrl);
						});
					} else {
						this.contentBoxDataNode.src='';
						this.contentBoxDataNode.src = newImgUrl;
					}
				} else if (this.contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE) {
					if (this.G_CONTENT_BOX_ARRAY != null) {
						for (var j=0; j<this.G_CONTENT_BOX_ARRAY.length; j++){
							var gContentBoxObj = this.G_CONTENT_BOX_ARRAY[j];
							if (gContentBoxObj.opts.contentBoxType == PresConstants.CONTENTBOX_IMAGE_TYPE ){
								gContentBoxObj.contentBoxDataNode.src = '';
								gContentBoxObj.contentBoxDataNode.src=newImgUrl;
							}
						}
					}
				}
			}
		}
		
		//make sure we increment the z-index for the pasted object 
		//so that it is always in front of the source object. 
		window.pe.scene.slideEditor.maxZindex += 5;
		dojo.style(this.mainNode,{
				'zIndex':window.pe.scene.slideEditor.maxZindex
		});
		
		dojo.style(this.mainNode,{
			'top': this.initialPositionSize.top +"%",
			'left': this.initialPositionSize.left+"%",
			'height': this.initialPositionSize.height+"%",
			'width' : this.initialPositionSize.width +"%"
		});
		
		if(!pe.keepIndicator){
			this.mainNode = concord.util.presCopyPasteUtil.removeIndicatorForCopy(this.mainNode).$;
			this.mainNode = concord.util.presCopyPasteUtil.addIndicatorForPaste(this.mainNode).$;
		}
		
		PresCKUtil.duplicateListBeforeStyleInSlide(this.mainNode);
		pe.scene.slideSorter.bInsertInternalListForPView = true;
		this.parentContainerNode.appendChild(this.mainNode);
		this.boxSelected=false;
		//this.userResized =true;// remove, this flag is of no use here 
		this.selectThisBox();
		
		//S31805, don't update sorter for table there, but in the caller(slideeditor) code
		if (!isMultipleBoxSelected && (this.contentBoxType != PresConstants.CONTENTBOX_TABLE_TYPE) && !isFromExtPres)
			this.publishInsertNodeFrame();
	},
	
	//
	// Makes a copy of itself
	//
	duplicateSelf: function(){
		//Let's get out of edit mode to copy nodes correctly
		
		//D25404: After press ctrl+C on empty textbox, textbox is lost
		var hastext = PresCKUtil.doesNodeContainText(this.contentBoxDataNode);
		if(hastext){
			this.toggleEditMode(false); //jmt - 47929
		}
		
		//Start from inside out
		//Make copy of data node
		var dataClone = dojo.clone(this.contentBoxDataNode);
		//filter out the spell check attribute and style
		if (this.spellChecker && spellcheckerManager.bChecked)
			this.spellChecker.resetOneNode(dataClone, true);
		//Replicate properties of mainNode without children
		var mainNodeClone = this.adjustPositionForBorder(null,true); // returns clone node with true position (sorter position)
		mainNodeClone.innerHTML="";
		
		var opts ={
//				'CKEDITOR':this.opts.CKEDITOR,
				'mainNode':new CKEDITOR.dom.element(mainNodeClone).getOuterHtml(),
				'CKToolbarSharedSpace': this.opts.CKToolbarSharedSpace,
				'contentBoxDataNode':new CKEDITOR.dom.element(dataClone).getOuterHtml(),
//				'parentContainerNode':this.opts.parentContainerNode,
				'copiedFromParentID': this.opts.parentContainerNode.id,
//				'deSelectAll':this.opts.deSelectAll,
//				'deSelectAllButMe':this.opts.deSelectAllButMe,
				'initialPositionSize':{'left':this.PxToPercent(this.mainNode.offsetLeft,'width'),'top':this.PxToPercent(this.mainNode.offsetTop,'height'),'width': this.PxToPercent(dojo.style(this.mainNode,'width'),'width'),'height':(dojo.isIE)? parseFloat(this.mainNode.style.height) :this.PxToPercent(dojo.style(this.mainNode,'height'),'height')},
				'copyBox': true
//				'isMultipleBoxSelected': this.opts.isMultipleBoxSelected,
//				'publishSlideChanged':this.opts.publishSlideChanged,
//				'getzIndexCtr': this.opts.getzIndexCtr,
//				'setzIndexCtr': this.opts.setzIndexCtr,
//				'openAddNewImageDialog': this.opts.openAddNewImageDialog,
//				'getActiveDesignTemplate':this.opts.getActiveDesignTemplate,
//				'deRegisterContentBox' : this.opts.deRegisterContentBox,
//				'deleteSelectedContentBoxes': this.opts.deleteSelectedContentBoxes,
//				'pasteSelectedContentBoxes'  :this.opts.pasteSelectedContentBoxes,
//				'copySelectedContentBoxes'	 :this.opts.copySelectedContentBoxes,
//				'createIndicatorSytle': this.opts.createIndicatorSytle,
//				'getInLineStyles':this.opts.getInLineStyles,
//				'getMasterTemplateInfo' : this.opts.getMasterTemplateInfo,
//				'checkBoxPosition' : this.opts.checkBoxPosition,
//				'addImageContentBox': this.opts.addImageContentBox,
//				'handleMultiBoxSelected': this.opts.handleMultiBoxSelected
		};
		if (null != this.contentBoxType)
			opts.contentBoxType = this.contentBoxType;
		dataClone = null;
		return opts;
	},

	//
	// Publish content box edit mode status
	//
	publishBoxEditMode: function(){
	//	console.log("contentBox:publishBoxEditMode","Entry");
		if (dojo.hasClass(this.mainNode,'isSpare'))
			return;

		var editOn = this.isEditModeOn();
		var nodeId = this.mainNode.id;
		
		if (dojo.hasClass(this.mainNode, 'g_draw_frame')) {
			// in some cases, the dbclick event will only be responsed in textContentBox for shape
			// the text editing mode will not publish, which leads to confusion
			// so need to map the txtContentBox to grpContentBox
			nodeId = null;
			var grpContentBox = null;
			
			// map the txtContentBox to grpContentBox
			if (this.contentBoxType == PresConstants.CONTENTBOX_TEXT_TYPE) {
				var pDrawFrameNode = window.pe.scene.slideEditor.getParentDrawFrameNode(this.mainNode);
				if (pDrawFrameNode) {
					grpContentBox = window.pe.scene.slideEditor.getRegisteredContentBoxById(pDrawFrameNode.id);
					if ((grpContentBox != null) && 
					    (grpContentBox.contentBoxType != PresConstants.CONTENTBOX_GROUP_TYPE)) {
						grpContentBox = null;
					}
				}
			}
			
			// to ensure the text editing mode be published
			if (grpContentBox != null && editOn) {
				if (grpContentBox.spr) {
					nodeId = grpContentBox.spr.mainNode.id;  // grpCB is the original node,
					                                         // use the id in spared node
				} else {
					nodeId = grpContentBox.mainNode.id;      // grpCB is the spared node
					                                         // use the id in spared node
				}
			}
			
			if (nodeId == null) {
				return;
			}
		}  // end if -- g_draw_frame
		
		// in some cases, the clicking will on original grp node --- SPR
		if (this.contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE && this.spr) {
			nodeId = this.spr.mainNode.id;           // click on the original node
			                                         // use the id in spared node
		}
		
 		if (this.initialEditServerSeq == null && editOn) {
			this.initialEditServerSeq = window.pe.scene.session.getCurrentSeq();
		}
		if (!editOn) {
			this.initialEditServerSeq = null;
		}
		
 		var eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_boxEditMode,
 			'id': nodeId, 
 			'editMode': editOn, 
 			'initialEditServerSeq': this.initialEditServerSeq}];
 		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
 		
	},

	//
	// Publish delete node frame
	//
	publishDeleteNodeFrame: function(addToUndo){
		if (typeof addToUndo ==undefined || addToUndo==null){
			addToUndo=true;
		}
		//console.log("contentBox:publishDeleteNodeFrame","Entry");
 		var eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_deleteNodeFrame,'node':this.mainNode.id,'parentId':this.parentContainerNode.id,'addToUndo':addToUndo}];
 		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
	},
	
	//
	// Publish insert node frame
	publishInsertNodeFrame: function(node,addToUndo,park,editorName){
		//console.log("contentBox:publishInsertNodeFrame","Entry");
		if (typeof addToUndo ==undefined || addToUndo==null){
			addToUndo=true;
		}

		var newNode = (node) ? dojo.clone(node) : dojo.clone(this.mainNode);
		var clnNewNode = this.cleanNodeForPublish(newNode);
		
		var adJNewNode = this.adjustPositionForBorder(clnNewNode,true); //D9544
		
		//make sure speaker notes does not get added to undo que
		if (dojo.attr(adJNewNode, "presentation_class") == "notes") {
			addToUndo=false;
		}
		
		var parentNode = (node) ? node.parentNode : this.mainNode.parentNode;
		if(!parentNode){
			console.log("!Error to insert draw frame node to sorter.");
			return;
		}
		//S31805 [Table] Upgrade the message level to draw frame for table related operation
		if(this.isEditModeOn() && this.editor && dojo.attr(this.mainNode, "presentation_class") === "table"){
			//In edit mode, there are some "support nodes(iframe nodes)" which are not required to update sorter.
			//then, we need to set up the correct node(mainNode + table) used to update sorter
			parentNode = this.mainNode.parentNode; //adjust parentNode from ckbody to parent node of mainnode
			adJNewNode = dojo.query("table", this.editor.document.$.body)[0];
			var dupMainNode = dojo.clone(this.mainNode);
			dupMainNode.innerHTML = adJNewNode.outerHTML;
			adJNewNode = dupMainNode;
			//D39316
			dojo.query('.selectedSTCell',adJNewNode).removeClass('selectedSTCell');
		}
		
		var siblingNode = (node) ? node.previousSibling : this.mainNode.previousSibling;
		if (siblingNode==null){ // in the case of a spareBox after switching slide it may not have a prev sibling
			siblingNode = (node) ? node.nextSibling : this.mainNode.nextSibling;
		}

		//handled in slidesorter.handleSubscriptionEventsSlideEditor only.
		//to insert node to sorter by event
 		var eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_insertNodeFrame,
 						  'node':adJNewNode,
 						  'parentId': parentNode.id,
 						  'siblingId': (siblingNode!=null)? siblingNode.id : null,
 						  'addToUndo':addToUndo,
 						  'park':park,
 						  'editorName':editorName}];
 		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
 		
		dojo.destroy(newNode);
		newNode = null;
		dojo.destroy(clnNewNode);
		clnNewNode = null;
// 		dojo.destroy(adJNewNode);
 		adJNewNode = null;

	},
	
	//
	// Updates image size before sending to sorter. This is for IE. We need to update contentBoxDataNode size  back to 100% so this size value does not get saved in document
	//
	updateContentDataBoxSizeOnPublish: function(node){
		var dataNodeArr = dojo.query('.contentBoxDataNode',node);
		if (dataNodeArr.length >0){
			var contentBoxDataNode = dataNodeArr[0];
			dojo.style(contentBoxDataNode,{
				'height':'100%',
				'width':'100%'
			});
		}
		return node;
	},
	
	//
	//Clean Node for publish. Removes classes, attributes and children that are not needed for publishing.
	//
	cleanNodeForPublish: function(node){
		//console.log("contentBox:cleanNodeForPublish","Entry");
		//remove handle nodes
		var handles = dojo.query('.handle',node);
		for(var i=0; i< handles.length; i++){
			dojo.destroy(handles[i]);
		}
		
		//remove disabled hanle nodes in group
		var disabledHandles = dojo.query('.disabledHandle',node);
		for(var i=0; i< disabledHandles.length; i++){
			dojo.destroy(disabledHandles[i]);
		}
		
		node.className  = node.className.replace('resizableContainerSelected','resizableContainer');
		//remove CK editor content if present: mainly for spareNode'
		if (node.childNodes.length >= 2){//if cknode is present then we need to remove and make visibile the contentBoxData node of this clone
			// Sometimes multiple spare node will generated in table
			for (var i = 1; i < node.childNodes.length;) {
				var child = node.childNodes[i];
				if (child.id=="cke_"+node.childNodes[0].id ||
					dojo.hasClass(child, 'cke_skin_lotus')){
					dojo.destroy(child);
				} else {
					i++;
				}
			}
			var dataNode  = node.childNodes[0];
			if (dataNode && dataNode.style){
				dataNode.style.display='';
				dataNode.style.visibility='';
			}
		}
		
		if (dojo.isIE)
			node = this.updateContentDataBoxSizeOnPublish(node);
		return node;
	},

	//
	//Clean Group Node for paste. Removes classes, attributes and children that are not needed for pasting.
	//
	cleanGroupNodeForPaste: function(contentObj){
		//console.log("contentBox:cleanNodeForPublish","Entry");
		for (var i=0;i<contentObj.G_CONTENT_BOX_ARRAY.length;i++) {
			var gnode = contentObj.G_CONTENT_BOX_ARRAY[i].contentBoxDataNode;
			
			var children = gnode.parentNode.children;
			for(var j=children.length-1; j>0; j--){	// Do not destroy first child (contentBoxDataNode)
				dojo.destroy(children[j]);
			}
		}
		return contentObj;
	},
	
	//
	// Publish when layout has been converted to a contentBox. Needs contentBoxDataNode id
	//
	publishLayoutConverted: function(forGraphic){
		//console.log("contentBox:publishLayoutConverted","Entry");
		var drawFrameNode = null;
		var drawFrameID = null;
		var dataNodeId = null;
		if (forGraphic){
			drawFrameNode = dojo.clone(this.mainNode);
			drawFrameID = drawFrameNode.id;
		} else{
			dataNodeId = this.contentBoxDataNode.id;
		}
				
 		var eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_layoutConverted,'dataNodeId':dataNodeId,'drawFrameID':drawFrameID,'drawFrameNode':drawFrameNode}];
 		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
 		drawFrameNode = null;
	},
	
	//
	// Publish content box with new attribute value. Supports new attributes as well. Replaces publishBoxStyleChanged.
	//
	publishBoxAttrChanged: function(attributeName,nodeId,sendCoeditMsg,addToUndo,adjustBorder){
		//console.log("contentBox:publishBoxAttrChanged","Entry");
		if (typeof addToUndo ==undefined || addToUndo==null){
			addToUndo=true;
		}
		if (typeof adjustBorder ==undefined || adjustBorder==null){
			adjustBorder=true;
		}
		
		var node = null;
		var sndCoeditMsg = (sendCoeditMsg) ? true : false;
		var id = (nodeId)? nodeId : this.mainNode.id;
		var nodeToAdjust = dojo.byId(id);
		var attrName  = (attributeName)? attributeName :'style';
		
		if (!nodeToAdjust || nodeToAdjust == null)
			return;
		if ( attrName.toLowerCase()=='style' && nodeToAdjust.id==this.mainNode.id && adjustBorder){
			node = this.adjustPositionForBorder(nodeToAdjust,true);
		} else {
			node = nodeToAdjust;
		}
		
		var ckNode = new CKEDITOR.dom.node(node);
		var attrValue = ckNode.getAttribute(attrName);
		
		//Let's replace resizableContainerSelected if present. We do not wish to synch this if present in value
		if ((dojo.isIE) && (attrName.toLowerCase()=='style'))
		{
			if (attrValue && attrValue.charAt(attrValue.length-1) != ';')
				attrValue = attrValue + ";";
		}
		
		if(attrValue) {
			attrValue = attrValue.replace('resizableContainerSelected','resizableContainer');
		
	 		var eventData = [{'eventName': concord.util.events.LocalSync_eventName_attributeChange,
	 						  'id':id,'attributeName':attrName,'attributeValue':attrValue,
	 						  'sendCoeditMsg':sndCoeditMsg,'addToUndo':addToUndo,
	 						  'posChange': adjustBorder}]; // posChange = true: draw frame position changed.
	 		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
		}
		
		if ( !ckNode.getParent()){ // this.adjustPositionForBorder() returns a clone, clean the node if it is a clone
			dojo.destroy(node);
		}	
		ckNode = null;
		node = null;
		nodeToAdjust = null;
	},
	
	//
	// Publish content box resizing end
	//
	publishBoxStyleResizingEnd: function(marginMsgActs){
		if (dojo.isIE){
			this.adjustContentDataSize();
		}
		//console.log("contentBox:publishBoxStyleResizingEnd","Entry");
		var sendCoeditMsg = true;
		var id = this.mainNode.id;
		var attrName  = 'style';

		var node = dojo.byId(id);
		node = this.adjustPositionForBorder(node,true);
		// #13288 returns z-index to the original value when publishing the resize event
		var oz = this.mainNode.origZ || this.origZ;
		if(oz!=null && dojo.hasClass(node,'draw_frame')){
			dojo.style(node, 'zIndex', oz);
		}
		var attrValue = dojo.attr(node,attrName);
 		var eventData = [{'eventName': concord.util.events.LocalSync_eventName_attributeChange,
 	                      'id':id,
 	                      'attributeName':'style',
 	                      'attributeValue':attrValue,
 	                      'flag':'ResizingEnd',
 	                      'sendCoeditMsg':sendCoeditMsg,
 	                      'marginMsgActs':marginMsgActs}];
 		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
 		
 		//if((this.contentBoxType==PresConstants.CONTENTBOX_TEXT_TYPE)&&(!CKEDITOR.env.ie))//defect 37631
 		     //this.makeNonEditable();
	},
	
	getEditor: function() {
	  if (this.spr && window.pe.scene.slideEditor.SINGLE_CK_MODE){  // jmtperf
		  return this.spr.editor;
	  }
	  return this.editor;
	},
	
	//
	// Should be implemented by the parent and passed to this object
	//
	isMultipleBoxSelected: function(){
		throw new Error("Options argument need to specify isMultipleBoxSelected in contentBox constructor.");
		return;
	},
	
	//
	// Should be implemented by the parent and passed to this object
	//
	publishSlideChanged: function(){
		throw new Error("Options argument need to specify publishSlideChanged in contentBox constructor.");
		return;
	},
	
	
	//
	// Add temp move/resize Div. This will allow moving and resizing to be smoother
	//
	addTempMoveResizeDiv: function(){
		var tempLayer = this.tempLayer = document.createElement('div');
		tempLayer.id = 'tmpmovrszdiv_'+new Date().getTime();
		this.mainNode.insertBefore(tempLayer, this.contentBoxDataNode);
		dojo.addClass(tempLayer,'tempLayer');
		dojo.style(tempLayer,{
			'zIndex':this.getzIndexCtr()
		});
		tempLayer = null;
	},
	
	//
	// Remove temp move/resize Div. This will allow moving and resizing to be smoother especially if CKEDitor is active in the node
	//
	removeTempMoveResizeDiv: function(){
		try{dojo.destroy(this.tempLayer);}catch(e){}
		this.tempLayer=null;
		//Tell listeners slide has changed
		//this.publishSlideChanged(); // commenting out for now but this is an ideal spot for firing this event it covers moves and resize
	},
	
	
    //
    // Clean focus cells on a node for tables (implemented in tblContentBox
    //
    cleanSelectedSTCells: function(node){
    	
    },
	
	//
	// Should be implemented by the parent and passed to this object
	//
	getInLineStyles: function(){
		throw new Error("Options argument need to specify getInLineStyles in contentBox constructor.");
		return;
	},
	
	//
	// Should be implemented by the parent and passed to this object
	//
	handleMultiBoxSelected: function(){
		throw new Error("Options argument need to specify handleMultiBoxSelected in contentBox constructor.");
		return;
	},
	
	//
	// Should be implemented by the parent and passed to this object
	//
	getMasterTemplateInfo: function(){
		throw new Error("Options argument need to specify getMasterTemplateInfo in contentBox constructor.");
		return;
	},
	
	//
	// Should be implemented by the parent and passed to this object
	//
	checkBoxPosition: function(){
		throw new Error("Options argument need to specify checkBoxPosition in contentBox constructor.");
		return;
	},
	
	//
	// Should be implemented by the parent and passed to this object
	//
	addImageContentBox: function(){
		throw new Error("Options argument need to specify addImageContentBox in contentBox constructor.");
		return;
	},
	
	//
	// Should be implemented by the parent and passed to this object
	//
	createIndicatorSytle: function(){
		throw new Error("Options argument need to specify createIndicatorSytle in contentBox constructor.");
		return;
	},
	
	//
	// Should be implemented by the parent and passed to this object
	//
	deleteSelectedContentBoxes: function(){
		throw new Error("Options argument need to specify deleteSelectedContentBoxes in contentBox constructor.");
		return;
	},
	
	//
	// Should be implemented by the parent and passed to this object
	//
	pasteSelectedContentBoxes: function(){
		throw new Error("Options argument need to specify pasteSelectedContentBoxes in contentBox constructor.");
		return;
	},
	
	//
	// Should be implemented by the parent and passed to this object
	//
	copySelectedContentBoxes: function(){
		throw new Error("Options argument need to specify copySelectedContentBoxes in contentBox constructor.");
		return;
	},
	
	
	//
	// Should be implemented by the parent and passed to this object
	//
	openAddNewImageDialog: function(){
		throw new Error("Options argument need to specify openAddNewImageDialog in contentBox constructor.");
		return;
	},

	//
	// Should be implemented by the parent and passed to this object
	//
	deRegisterContentBox: function(){
		throw new Error("Options argument need to specify deRegisterContentBox in contentBox constructor.");
		return;
	},
	//
	
	// Should be implemented by the parent and passed to this object
	//
	getActiveDesignTemplate: function(){
		throw new Error("Options argument need to specify getActiveDesignTemplate in contentBox constructor.");
		return;
	},
		
	//
	//Should be implemented by the parent and passed to this object
	//
	getzIndexCtr : function(){
		throw new Error("Options argument need to specify getzIndexCtr in contentBox constructor.");
		return;
	},
	
	//
	//Should be implemented by the parent and passed to this object
	//
	setzIndexCtr : function(val){
		throw new Error("Options argument need to specify setzIndexCtr in contentBox constructor.");
		return;
	},
	
	//
	// Hide contentBox
	//
	hide: function(){
		this.mainNode.style.display='none';
	},
	
	//
	// show contentBox
	//
	show: function(){
		this.mainNode.style.display='';
	},
	
	//
	// Update attribute change from coedit.
	//
	updateCoeditAttributeChange: function(data){
		//TODO: For style attribute may need to parse and update each style individually as to not lose any pertinent style
		//dojo.attr(this.mainNode,data.attributeName, data.attributeValue);
		// Since this may be a resize attribute we need to recalculate the resize handle position
		var resizeContent = false;
		this.updateHandlePositions(resizeContent);
		//if this node is currently being edited we need to resize the CKwindow
		if(this.isEditModeOn()) {
			if (this.contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE) {
				this.updateCKBodyHeight();
			} else if ( this.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE){
				this.updateCKBodyHeight();
				this.updateCKBodyWidth();
				this.updateEditSizeToFitMainContainer();
				dojo.style( this.editor.document.$.body,  {'position': ''});
			} else {
				this.updateCKBodyHeight();
				this.updateEditSizeToFitMainContainer();
			}
		}
	},
	
	//
	// Add border to contentBox. Border is created as a child of dataContentNode
	//
	updateBorder: function(border){
		dojo.style( this.contentBoxDataNode,(border) ? border : this.borderProperty);
	},
	
	//
	// Adds ODP classes to draw frame (this.mainNode) level. Only gets called from setDataContent
	//
	updatedClassesForODP: function(layoutFamily,layoutName){
		// Add needed Classes
		if (!dojo.hasClass(this.mainNode,'draw_frame')){
			dojo.addClass(this.mainNode,'draw_frame');
		}
		
		//Add needed attributes
		if (layoutFamily)
			this.dojo.attr(this.mainNode,PresConstants.PRESENTATION_CLASS,layoutFamily);
		
		var masterTextStyle =null;
		var masterPageId = dojo.attr(this.parentContainerNode, "draw_master-page-name");
		masterTextStyle = window.pe.scene.slideSorter.getMasterFrameStyle(masterPageId, layoutFamily);
		if (this.isEmptyCBPlaceholder){
			if (layoutFamily=='outline'){
				dojo.addClass(this.contentBoxDataNode,'draw_text-box');
				//masterTextStyle = this.getMasterTemplateInfo().text_outline;
				if ((masterTextStyle!=null) && (masterTextStyle.length!=0)){
					var drawFrameClassDiv = dojo.query('.draw_frame_classes',this.mainNode)[0];
					dojo.addClass(drawFrameClassDiv,masterTextStyle);
				}
			} else if (layoutFamily == 'title'){
				/*
				if (layoutName=='ALT0'){
					masterTextStyle = this.getMasterTemplateInfo().title;
				} else{
					masterTextStyle = this.getMasterTemplateInfo().text_title;
				}
				*/
				dojo.addClass(this.contentBoxDataNode,'draw_text-box');
				if ((masterTextStyle!=null) && (masterTextStyle.length!=0)){
					var drawFrameClassDiv = dojo.query('.draw_frame_classes',this.mainNode)[0];
					dojo.addClass(drawFrameClassDiv,masterTextStyle);
				}
			} else if (layoutFamily == 'subtitle'){
				dojo.addClass(this.contentBoxDataNode,'draw_text-box');
				//masterTextStyle =this.getMasterTemplateInfo().subtitle;
				//if(masterTextStyle==null || masterTextStyle == "" || layoutName == "ALT32"){//if subtitle style is not defined, use the one used by the outline
				if(masterTextStyle==null || masterTextStyle == ""){
					//to use outline text because the background we are using outline background.. sometimes subtitle text is white for title page background but in outline background becomes white on white,
                	//so it is safer to use outline text when using outline background
					masterTextStyle = window.pe.scene.slideSorter.getMasterFrameStyle(masterPageId, "outline"); //if no subtitle style, try outline style first from current master
					if(masterTextStyle==null || masterTextStyle == ""){
						masterTextStyle =this.getMasterTemplateInfo().text_outline;  //otherwise use the default master
					}
				}
				if ((masterTextStyle!=null) && (masterTextStyle.length!=0)){
					var drawFrameClassDiv = dojo.query('.draw_frame_classes',this.mainNode)[0];
					dojo.addClass(drawFrameClassDiv,masterTextStyle);
				}
				if(layoutName == "ALT32" || (layoutName == "ALT0" && (this.getMasterTemplateInfo().subtitle == null ||this.getMasterTemplateInfo().subtitle == "" ))){
					//if this is a center text layout or a subtitle layout but no subtitle style, center it
					var drawFrameClassDiv = dojo.query('.draw_frame_classes',this.mainNode)[0];
					var pElem = dojo.query("p",drawFrameClassDiv)[0];
					//pElem.style.textAlign = "center";
					dojo.addClass(pElem, "centerTextAlign");
					//drawFrameClassDiv.style.verticalAlign = "middle";
					dojo.addClass(drawFrameClassDiv,"centerVerticalAlign");
				}
			}
		}//end isEmptyCBPlaceholder
		
		//if graphics add standard class
		 if (this.contentBoxType==PresConstants.CONTENTBOX_IMAGE_TYPE) {
			 //If this is new content we do not need the text styling for images
			 //this is to fix defect 8264
			 if(!dojo.hasClass(this.mainNode,"newbox")) {
				 //dojo.addClass(this.mainNode,'standard '+this.getMasterTemplateInfo().default_text);
				 masterTextStyle = window.pe.scene.slideSorter.getMasterFrameStyle(masterPageId, "outline");
				 //dojo.addClass(this.mainNode, this.getMasterTemplateInfo().text_outline); //Using outline text for same font size			 
				 dojo.addClass(this.mainNode, masterTextStyle ); //Using outline text for same font size
			 }
		 }
	},
	
	updateFrameClass: function(sameDoc,sameStyle,masterTextStyle){
		if( (null == masterTextStyle) || (masterTextStyle.length ==0) )
			return;
		var drawFrameClassDiv = concord.util.presDOMUtil.getTargetMainNode(this);
		if (!sameDoc || !sameStyle) drawFrameClassDiv.className = 'draw_frame_classes';
		masterTextStyle = masterTextStyle.replace("BORDER_STYLE_NONE","");
		dojo.addClass(drawFrameClassDiv,masterTextStyle);
	},
	
	//
	// Updates ODP classes when new object is added i.e cut and paste
	//
	updateODPClasses: function(sameDoc, currMasterName){
		// Add needed Classes
		if (sameDoc == null) sameDoc = true;
		if (currMasterName == null) currMasterName = "";
		var sameStyle = (currMasterName == this.getMasterTemplateInfo().currMaster.masterName) ? true : false;
		var layoutFamily = this.dojo.attr(this.mainNode,PresConstants.PRESENTATION_CLASS);
		var layoutName = dojo.attr(this.parentContainerNode,'presentation_presentation-page-layout-name');
		var masterTextStyle =null;
		if (layoutFamily=='outline'){
			dojo.addClass(this.contentBoxDataNode,'draw_text-box');
			masterTextStyle = this.getMasterTemplateInfo().text_outline;
			this.updateFrameClass(sameDoc,sameStyle,masterTextStyle);
		} else if (layoutFamily == 'title'){
			if (layoutName=='ALT0'){
				masterTextStyle = this.getMasterTemplateInfo().title;
			} else{
				masterTextStyle = this.getMasterTemplateInfo().text_title;
			}
			dojo.addClass(this.contentBoxDataNode,'draw_text-box');
			this.updateFrameClass(sameDoc,sameStyle,masterTextStyle);
		} else if (layoutFamily == 'subtitle'){
			dojo.addClass(this.contentBoxDataNode,'draw_text-box');
			masterTextStyle =this.getMasterTemplateInfo().subtitle;
			var drawFrameClassDiv = concord.util.presDOMUtil.getTargetMainNode(this);
			if (!sameDoc || !sameStyle) drawFrameClassDiv.className = 'draw_frame_classes';
			if((masterTextStyle == null) || (masterTextStyle.length!=0))
				masterTextStyle =this.getMasterTemplateInfo().text_outline;
			if((masterTextStyle == null) || (masterTextStyle.length!=0))
			{
				masterTextStyle =this.getMasterTemplateInfo().default_text;
			}
			else
			{
				this.updateFrameClass(sameDoc,sameStyle,masterTextStyle);
			}
		} else { // Assume it is simple text box
			if (layoutFamily == 'null')
				this.dojo.attr(this.mainNode,PresConstants.PRESENTATION_CLASS,'');
			var drawFrameClassDiv = concord.util.presDOMUtil.getTargetMainNode(this);
			if (!sameDoc || !sameStyle) drawFrameClassDiv.className = 'draw_frame_classes';
			if (layoutName =='ALT0')
				dojo.addClass(drawFrameClassDiv,this.getMasterTemplateInfo().default_title);
			else
				dojo.addClass(drawFrameClassDiv,this.getMasterTemplateInfo().default_text);
		}
	},
	
	//
	// Context Menu
	//
	addContextMenu: function(){
		var node = this.mainNode;
		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
		var ctxMenu =  this.ctxMenu = new dijit.Menu({'id':'contextBoxCtxMenu_'+(this.statics.index++), dir: dirAttr});
		dojo.addClass(ctxMenu.domNode,"lotusActionMenu");
		ctxMenu.domNode.style.display ='none';
		document.body.appendChild(ctxMenu.domNode);
		ctxMenu.bindDomNode(node);

		var notesType = (this.contentBoxType == PresConstants.CONTENTBOX_NOTES_TYPE) ? true : false;

		var menuItem1 = this.menuItem1 = new dijit.MenuItem({
			label: this.STRINGS.ctxMenu_delete,
			iconClass:"deleteContentBoxIcon",
			onClick: dojo.hitch(this,this.deleteSelectedContentBoxes,false),
			dir: dirAttr
		});
		var menuItem2 = this.menuItem2 = new dijit.MenuItem({
			label: this.STRINGS.ctxMenu_cut,
			iconClass:"cutContentBoxIcon",
			onClick: dojo.hitch(window.pe.scene,window.pe.scene.showMenusErrorMsg,'cut'),
			dir: dirAttr
		});
		var menuItem3 = this.menuItem3 =  new dijit.MenuItem({
			label: this.STRINGS.ctxMenu_copy,
			iconClass:"copyContentBoxIcon",
			onClick: dojo.hitch(window.pe.scene,window.pe.scene.showMenusErrorMsg,'copy'),
			dir: dirAttr
		});
		var menuItem4 = this.menuItem4 = new dijit.MenuItem({
			label: this.STRINGS.ctxMenu_paste,
			iconClass:"pasteContentBoxIcon",
			onClick: dojo.hitch(window.pe.scene,window.pe.scene.showMenusErrorMsg,'paste'),
			dir: dirAttr
		});
		
		var menuItem5 = this.menuItem5 = new dijit.MenuItem({
			label: this.STRINGS.ctxMenu_properties+'...',
			iconClass:"propertiesContentBoxIcon",
			onClick: dojo.hitch(this,this.openContentBoxProperties),
			dir: dirAttr
		});
		
		var ctxMenuPropStrings = dojo.i18n.getLocalization("concord.widgets", "presPropertyDlg");

		var menuItem6 = this.menuItem6 = new dijit.MenuItem({
			label: ctxMenuPropStrings.notesTitle,
			iconClass:"propertiesContentBoxIcon",
			onClick: dojo.hitch(this,this.openContentBoxProperties),
			dir: dirAttr
		});
		
		var menuItem9 = this.menuItem9 =  new dijit.MenuItem({
			label: this.STRINGS.ctxMenu_bringToFront,
			iconClass:"bringToFrontIcon",
			onClick: dojo.hitch(this,this.toggleBringToFront),
			dir: dirAttr
		});
		
		var menuItem10 = this.menuItem10 =  new dijit.MenuItem({
			label: this.STRINGS.ctxMenu_sendToBack,
			iconClass:"sendToBackIcon",
			onClick: dojo.hitch(this,this.toggleSendToBack),
			dir: dirAttr
		});
		
		if (!notesType) {
			ctxMenu.addChild(menuItem2);
			ctxMenu.addChild(menuItem3);
			ctxMenu.addChild(menuItem4);
			ctxMenu.addChild(menuItem1);
			ctxMenu.addChild(new dijit.MenuSeparator());
			ctxMenu.addChild(menuItem5);
			ctxMenu.addChild(new dijit.MenuSeparator());
			ctxMenu.addChild(menuItem9);
			ctxMenu.addChild(menuItem10);
		} else {
			ctxMenu.addChild(menuItem6);
		}
		// Let's disable chckCopyCutForPlaceHolder for now
		//this.connectArray.push(dojo.connect(ctxMenu,'onOpen',this,'chckCopyCutForPlaceHolder')); //D33036
		this.connectArray.push(dojo.connect(ctxMenu,'onOpen',this,'deselectAllThenSelectMe')); //D33036
		
		//T15714 Let's disable paste option if pasting content from another document
		this.connectArray.push(dojo.connect(ctxMenu,'onOpen',this,'chckPasteFromOtherDoc')); 
		
		// Let's disable Properties option if multi-select
		this.connectArray.push(dojo.connect(ctxMenu,'onOpen',this,'chckPropertiesForMultiselect'));

		if (dojo.isIE) {
			this.connectArray.push(dojo.connect(ctxMenu,'onKeyDown',this, function(e) {
				dojo.stopEvent(e);
				if (e.keyCode == dojo.keys.ESCAPE) {
					dijit.popup.close(this.ctxMenu);
					this.mainNode.focus();
				}
			}));
		}
	},
	
	// T15714
	// Disables context menus paste if clipboard content is from other document
	//
	chckPasteFromOtherDoc: function(){
		if (!window.pe.scene.isUserInEditMode() &&
			window.pe.scene.checkClipboardFromOtherDoc() &&
			(this.menuItem4)){
			this.menuItem4.attr('disabled',true);
			return;
		}		
		this.menuItem4.attr('disabled',false);
	},		
	
	// 
	// Disables context menus "properties" if more than one content box is selected
	//
	chckPropertiesForMultiselect: function(){
		if (this.menuItem5){
			if (!this.isMultipleBoxSelected()){
				this.menuItem5.attr('disabled',false);
				return;
			}		
			this.menuItem5.attr('disabled',true);
		}
		
		if (this.menuItem6){
			if (!this.isMultipleBoxSelected()){
				this.menuItem6.attr('disabled',false);
				return;
			}		
			this.menuItem6.attr('disabled',true);
		}
	},		

	//
	// Check if box is place holder to enable/disable copy/paste menu items
	//
	chckCopyCutForPlaceHolder: function(){		
		if(!this.isMultipleBoxSelected()){
			if (dojo.hasClass(this.mainNode,PresConstants.LAYOUT_CLASS)){
				this.disableCopyCutForPlaceHolder();
			}else{
				this.enableCopyCutForPlaceHolder();
			}			
		}else{
			if(window.pe.scene.slideEditor.chkIfPlaceHolderSelected(false)){
				this.disableCopyCutForPlaceHolder();
			} else{
				this.enableCopyCutForPlaceHolder();
			}
		}
	},
	
	
	//
	// Disables context menus copy/cut for a placeholder
	//
	disableCopyCutForPlaceHolder: function(){
		if (this.menuItem2) this.menuItem2.attr('disabled',true);
		if (this.menuItem3) this.menuItem3.attr('disabled',true);
		
//		if (this.boxSelected){
//			var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_disableCopyCutMenuItems}];
//			concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
//		}
	},
	
	
	//
	// Enables context menus copy/cut for a placeholder
	//
	enableCopyCutForPlaceHolder: function(){
		if (this.menuItem2)  this.menuItem2.attr('disabled',false);
		if (this.menuItem3)  this.menuItem3.attr('disabled',false);	
		
//		var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enableCopyCutMenuItems}];
//		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
	},
	
	//
	//Should be implemented by the parent and passed to this object
	//

	toggleBringToFront: function(){
//		var maxZ = this.getMaxZindex();
//		//console.log("maxZ: " + maxZ);
//		if (maxZ) {
//			this.setzIndexCtr(maxZ+5);
//			dojo.style(this.mainNode,{
//				'zIndex':this.getzIndexCtr()
//			});
//			this.publishBoxAttrChanged("style",this.mainNode.id,true);
//		}
		return;
	},
	
	//
	//
	//Should be implemented by the parent and passed to this object
	//
	toggleSendToBack: function(){
//		var minZ = this.getMinZindex();
//		//console.log("minZ: " + minZ);
//		if (minZ) {
//			minZ = minZ-5 < 0 ? 0 : minZ-5;
//			this.setzIndexCtr(minZ);
//			dojo.style(this.mainNode,{
//				'zIndex':this.getzIndexCtr()
//			});
//			this.publishBoxAttrChanged("style",this.mainNode.id,true);
//		}
		return;
	},

	//
	// Delete ContentBox
	//
	deleteContentBox: function(publish,addToUndo){
		//D17295 do not delete notes content boxes
		//Code execution should never get this far for notes 
		//adding this code to be sure notes will not get deleted
		
		
		if (this.contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE) {
			return;
		}
		window.pe.scene.hideComments();
    	if (window.pe.scene.slideEditor.SINGLE_CK_MODE==true && this.boxRep){
    		var thisBox = this.boxRep.unLoadSpare();     		
    		thisBox.deleteContentBox(publish,addToUndo);
    		return;
        }
    	
		var resetToolbarFocus = false;
		if (dojo.isIE && this.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE) {
			resetToolbarFocus = true;
		}
		this.disableMenuItemsOnDeSelect();
		this.publishDeleteCommentsCmd();  //D13306
		this.makeNonEditable();
		if (publish) this.publishDeleteNodeFrame(addToUndo);
		if (this.deRegisterContentBox) this.deRegisterContentBox(this);
		this.destroyContentBox();
		// 9493: [CopyPaste][IE] the focus lost when cut a object on IE then can not paste/undo without click the edit page 
		// Ensure focus stays on the slide editor after deleting contentbox ==> same reason for D26679 [FF]Undo of table delete can't restore table
		if (dojo.isIE || dojo.isFF) {
			setTimeout(dojo.hitch(this,function(){
				window.pe.scene.setFocusToSlideEditor();
			}),100);			
		}
		concord.util.presToolbarMgr.toggleVerticalAlignButton('off');
		// Ensure toolbar is reset to sorter after unwanted IE events are happening
		if (resetToolbarFocus) {
			setTimeout(dojo.hitch(this,function(){
				concord.util.presToolbarMgr.setFocusSorterTb();
			}), 500);
		}
	},
	
	destroyEditorSnapshots: function(){
		if (this.editor){
			if ( this.editor.initSnapShot){
				dojo.destroy(this.editor.initSnapShot);
				this.editor.initSnapShot = null;
			}
			if ( this.editor.preSnapShot){
				dojo.destroy(this.editor.preSnapShot);
				this.editor.preSnapShot = null;
			}			  
			if ( this.editor.prevPostSnapShot){
				dojo.destroy(this.editor.prevPostSnapShot);
				this.editor.prevPostSnapShot = null;
			}
			if ( this.editor.postSnapShot ){
				dojo.destroy(this.editor.postSnapShot);
				this.editor.postSnapShot = null;
			}
			this.editor.synchAllTodoCtr = null;
		}
	},
	//
	// Destroy the editor. Should only be called by deleteContentBox and makeEditable
	//
	destroyThisEditor: function(){
	  if ((this.editor) || CKEDITOR.instances[this.contentBoxDataNode.id]){
		  var editor = this.editor || CKEDITOR.instances[this.contentBoxDataNode.id];        
		  this.editTD =null;
		  editor.contentBox = null;
		  editor.dfc = null;
		  editor.dfcParent = null;
		  //console.log('clear park msg from contentbox 8851');
		  editor.parkedMsgPairList = null;
		  editor.fontFamilyCombo = null;
		  editor.fontSizeCombo = null;
		  editor.spellchecker = null;
		  this.destroyEditorSnapshots();
		  if (editor.deleteNodeProps != undefined && editor.deleteNodeProps != null){
			  dojo.destroy(editor.deleteNodeProps);
			  editor.deleteNodeProps = null;
		  }
		  
		  //destroy toolbar
		  var toolbar = dojo.query('.cke_editor_'+this.getEditorName(),dojo.byId('toolbar'));
		  if(toolbar && toolbar.length > 0){
			  toolbar = toolbar[0].parentNode;
			  dojo.destroy(toolbar);
			  toolbar = null;
		  }
		  
		  // destroy the editor structure
		  if (this.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE && editor.document) {
			  var editModeTable = dojo.query('table',editor.document.$.body)[0];
			  if ( editModeTable){
				  dojo.destroy(editModeTable);
			  }
			  editModeTable = null;
		  }
		  
		  if(editor.element){
			  editor.element.$ = null;
			  editor.element = null;
		  }
		  
		  if(editor.container)
			  dojo.destroy(editor.container.$);

		  editor.destroy(true);
		  editor.container = null;
		  this.editor= null;
		  editor=null;
		  this.afterEditData = this.contentBoxDataNode.innerHTML;        
	  }
	},
	
	//
	// Properties ContentBox
	//
	cutContentBox: function(){
		 this.copySelectedContentBoxes();
		 this.deleteSelectedContentBoxes();
	},
	
	//
	// Properties ContentBox
	//
	openContentBoxProperties: function(){
		if (this.contentBoxType == PresConstants.CONTENTBOX_IMAGE_TYPE ||
			this.contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE ||
			this.contentBoxType == PresConstants.CONTENTBOX_SHAPE_TYPE)
		{
			// TODO: uncomment here when support svg shape property change
			//if (dojo.hasClass(this.mainNode,"shape_svg")) {
			//	var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_launchShapePropertyDlg}];
			//} else {
				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_launchImagePropertyDlg}];
			//}
			concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
		} else {
		    var propDlg = this.contentBoxPropertyObj = new concord.widgets.presContentBoxPropDlg(this, this.STRINGS.ctxMenu_properties, null, null);
		    propDlg.show();	 
		}
	},

	//
	// Handles user Joined
	//
	userJoined: function(userId){
	},
	
	//
	//set node elements id with new UUID
	//
	setNodeId: function(nodeElem,prefix){
		if(nodeElem!=null){
			concord.util.HtmlContent.injectRdomIdsForElement(nodeElem);
			if (prefix!=null){
				nodeElem.id = prefix+nodeElem.id;
			}
			//set ids for all children elements
			var children = nodeElem.getElementsByTagName('*');
			for(var i =0; i<children.length; i++){
				if (children[i].id.length==0) {
					concord.util.HtmlContent.injectRdomIdsForElement(children[i]);
					if (prefix!=null){
						children[i].id = prefix+'_child_'+children[i].id;
					}
				}
			}
		}
	},
	
	//
	// Enable menu items for this content box when selected (to be implemented by subclasses types)
	//
	enableMenuItemsOnSelect: function(){
		if (this.contentBoxType==PresConstants.CONTENTBOX_TEXT_TYPE || this.contentBoxType==PresConstants.CONTENTBOX_NOTES_TYPE){
			concord.util.presToolbarMgr.toggleBGFillColorButton('on');
		}
		if (PresCKUtil.isPPTXShape(this.mainNode)){
			concord.util.presToolbarMgr.toggleBorderColorButton('on');
		}
		var eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_enableBringToFrontMenuItems}];
		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);

		eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_enableSendToBackMenuItems}];
		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
		
		eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_enablePropertyMenuItems}];
 		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);

		
		// make sure "Properties..." doesn't show up if we have multiple things selected (the scenario where
		// they select an image, then select a content box)
		if (this.isMultipleBoxSelected()){			
			eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_disablePropertyMenuItems}];
	 		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
		}
		
	},
	
	//
	// Disable menu items for this content box when not selected (to be implemented by subclasses types)
	//
	disableMenuItemsOnDeSelect: function(){
		concord.util.presToolbarMgr.toggleBGFillColorButton('off');
		concord.util.presToolbarMgr.toggleBorderColorButton('off');
		concord.util.presToolbarMgr.toggleFontEditButtons('off');
		if ( !pe.scene.slideEditor.isVerticalAlignButtonEnabled()){
			concord.util.presToolbarMgr.toggleVerticalAlignButton('off');
		}
		
		var eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_disableBringToFrontMenuItems}];
		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);

		eventData = [{'eventName': concord.util.events.slideEditorEvents_eventName_disableSendToBackMenuItems}];
		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
		
	 	eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_disablePropertyMenuItems}];
	 	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);	
	},
	
	//
	// Enable menu items for this content box when editing (to be implemented by subclasses types)
	//
	enableMenuItemsOnEdit: function(){
		
	},
	
	//
	// Disable menu items for this content box when editing (to be implemented by subclasses types)
	//
	disableMenuItemsOnNonEdit: function(){
		
	},
	publishCreateCommentsCmd: function(){
 		var eventData = [{'eventName': concord.util.events.commenttingEvents_eventName_createComment}];
 		concord.util.events.publish(concord.util.events.commenttingEvents, eventData);
	},
	publishDeleteCommentsCmd: function()
	{
		if(this.hasComments())
		{
			var commentsId = dojo.attr(this.mainNode,'commentsId');
	 		var eventData = [{'eventName': concord.util.events.commenttingEvents_eventName_DeleteComments,'commentsId':commentsId}];
	 		concord.util.events.publish(concord.util.events.commenttingEvents, eventData);
		}
	},
	publishBoxSelectedEvent: function(){
		var eventData = [{'eventName': concord.util.events.contentBoxEvents_eventName_boxClicked}];
		concord.util.events.publish(concord.util.events.contentBoxEvents, eventData);
	},
	createCommentsLink: function(comments){	
		//get current list of comment id's from mainNode	
		var cid = dojo.attr(this.mainNode, 'commentsId');
		if(cid)
			this.commentsId = dojo.trim(cid);
		
		//append or initilize current comment into comment list
		var currentCommentsId = comments.getId();
		if(this.commentsId!=null && this.commentsId != '')
			this.commentsId += ' ' + currentCommentsId;
		else
			this.commentsId = currentCommentsId;
		
		this.addCommentIcon(currentCommentsId);
		
		var msgPairList = new Array();
		
		// add comment into comment store on other clients.
		var sess = window.pe.scene.session;
		var msgCMTS = sess.createMessage();
		msgCMTS.type = "comments";
		msgCMTS.action = "add";
		msgCMTS.id = currentCommentsId;//comments.id;
		msgCMTS.data = comments.items[0].e;		
		var msgItem = new Object();
		msgItem.msg = msgCMTS;		
		msgPairList.push(msgItem);
		
		// send coedit attribute updates for comments and commentsId				
		var attrName = "comments";
		msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(this.mainNode), attrName, 'true', msgPairList);
		dojo.attr(this.mainNode, 'comments','true');
				
		attrName = "commentsId";
		msgPairList = SYNCMSG.createAttributeMsgPair(new CKEDITOR.dom.node(this.mainNode), attrName, dojo.trim(this.commentsId), msgPairList);
		dojo.attr(this.mainNode, 'commentsId',dojo.trim(this.commentsId));
		
		//send coedit msg to add new comment icon
		var addCommentMsg = SYNCMSG.createAddNewCommentMsg(this.mainNode.id, currentCommentsId);	//tells other clients to add comment icon node.
		msgPairList.push(addCommentMsg);		
		
		SYNCMSG.sendCombinedMessage(msgPairList, SYNCMSG.SYNC_SORTER);		  
	},
	
	hasComments: function()
	{
		if(dojo.attr(this.mainNode, 'comments') == 'true')
			return true;
		return false;
	},
	
	/**
	 * Update the table dimenstions on resize.  This will update the 
	 * content box, the internal table and the handles
	 */
	_updateTableOnEditResize: function(){
		this.updateMainNodeHeightBasedOnDataContent();
		//this.updateEditSizeToFitMainContainer();
		//this.updateHandlePositions(true);
	},
	
	/**
	 * targetTable: update targetTable with sourceTable attributes
	 * @param table
	 */
	_updateTableStyleAttributes: function( targetTable, sourceTable){
		if(!targetTable || !sourceTable)
			return;
		var backgroundStyleAttribute = 'table_use-rows-styles';
		var headerStyleAttribute = 'table_use-first-row-styles';
		var bottomRowStyleAttribute = 'table_use-last-row-styles';
		var firstColumnStyleAttribute = 'table_use-first-column-styles';
		var lastColumnStyleAttribute = 'table_use-last-column-styles';
		var alternateRowStyleAttribute = 'table_use-banding-rows-styles';
		var alternateColStyleAttribute = 'table_use-banding-columns-styles';
		var borderStyleAttribute = 'table_use-border-styles';
		var tableHeaderColorStyleAttribute = 'table_header_color';
		var tableSummaryColorStyleAttribute = 'table_summary_color';
		var tableAltRowColorStyleAttribute = 'table_alt_color';
		var tableBackgroundColorStyleAttribute = 'table_background_color';
		var tableBorderColorStyleAttribute = 'table_border_color';
		var customStyleAttribute = 'customstyle';
		var tableTemplateName = 'table_template-name';
		var ariaRole = 'role';
		var ariaLabel = 'aria-label';
		var ariaLabelledby = 'aria-labelledby';
		var pfsAttribute = 'pfs';
		var tableStylesAttributes = [ backgroundStyleAttribute, headerStyleAttribute, bottomRowStyleAttribute,
		                               firstColumnStyleAttribute, lastColumnStyleAttribute, alternateRowStyleAttribute,
		                               alternateColStyleAttribute, borderStyleAttribute, tableHeaderColorStyleAttribute, tableTemplateName,
		                               customStyleAttribute,tableSummaryColorStyleAttribute, tableAltRowColorStyleAttribute, 
		                               tableBackgroundColorStyleAttribute, tableBorderColorStyleAttribute,
		                               ariaRole, ariaLabel, ariaLabelledby,pfsAttribute];
		for ( var i = 0; i < tableStylesAttributes.length; i++ ){
			if ( dojo.hasAttr( sourceTable, tableStylesAttributes[i])){
				dojo.attr(targetTable, tableStylesAttributes[i], dojo.attr(sourceTable, tableStylesAttributes[i]) );
			}
		}
	},
	
	_updateTableWithDefaultCellContent: function( table){
    	var actList = [];
    	var msgPairs = [];
    	var srcTd = null;
    	var contentBox = this;
    	dojo.query('tbody td,th', table).forEach(function(td, index, arr){
    		if ( td.hasChildNodes() && td.firstChild.nodeName.toLowerCase() == 'p'){
    			srcTd = td;
    		} else if ( !td.hasChildNodes() ||
    				// cell with only a single br child is treated as an empty cell
    				( td.childElementCount == 1 && td.firstChild.nodeName.toLowerCase() == 'br')){
    			if ( td.hasChildNodes() && td.firstChild.nodeName.toLowerCase() == 'br'){
    				dojo.destroy( td.firstChild );
    			}
    			var tdElement = new CKEDITOR.dom.element( td );
    			MSGUTIL.genDefaultContentForCell(tdElement);
    			contentBox._copyCellContentStyles( srcTd, td);
    			var tdElementChild = tdElement.getChild(0);
				actList.push(SYNCMSG.createInsertBlockElementAct(tdElementChild));
    		}
		});
    	if ( actList.length > 0 ){
    		msgPairs.push(SYNCMSG.createMessage(MSGUTIL.msgType.Table,actList,null,table.id));
    		//-replace removeUndo
    		var addToUndo = false;
    		msgPairs[0] = SYNCMSG.addUndoFlag(msgPairs[0],addToUndo);

    		SYNCMSG.sendMessage(msgPairs, SYNCMSG.SYNC_BOTH);
		}
	},
	
	_copyCellContentStyles: function ( srcCell, destCell){
		if ( srcCell ){
			var srcFirstChild = srcCell.firstChild;
			var destFirstChild = destCell.firstChild;
			if ( srcFirstChild && destFirstChild &&
				srcFirstChild.nodeName.toLowerCase()=='p' &&
				destFirstChild.nodeName.toLowerCase()=='p'){	
				var srcFirstChildCk = new CKEDITOR.dom.node(srcFirstChild);
				var destFirstChildCk = new CKEDITOR.dom.node(destFirstChild);
				srcFirstChildCk.copyAttributes( destFirstChildCk, { id: 1 } );
			}
		}
	},
	
	_expandComments:function(cinId, noFocus){
		if(window.pe.scene.clickedComment)
			return;
		pe.showCommentTimeout && clearTimeout(pe.showCommentTimeout);
		pe.showCommentTimeout = setTimeout(
			dojo.hitch(this, function(cinId, noFocus){
				window.pe.scene.slideEditor.deSelectAllButMe(this,true);
				this.selectThisBox();
				this.toggleEditMode(false);
				var commentsId = cinId.substring(cinId.indexOf("_")+1,cinId.length);
				var eventData = [{'eventName': concord.util.events.commenttingEvents_eventName_expandComments,'commentsId':commentsId,'noFocus':noFocus}];
				concord.util.events.publish(concord.util.events.commenttingEvents, eventData);
			},cinId, noFocus),500
		);
	},
	
    _isActiveComments:function(commentsId){
//		var commentsHdl = this.getCommentsHdl();
//   	 	var activeComments =  commentsHdl.activeCommentsId;
//   	 	if(commentsId == activeComments)
//   	 		return true;
//   	 	return false;
   },
   
   getNodesFromConnect: function(){
	   var connectNodesArr = [];
	   
		for(var i=0; i<this.connectArray.length; i++){
			if (this.connectArray[i][0]) connectNodesArr.push(this.connectArray[i][0]);
		}
		return connectNodesArr;
   },
   
   //
   // Completely annihilate this contentBox from memory
   //
   destroyContentBox: function(keepMainNode){
		if (this.spellChecker) {
			if (this.contentBoxDataNode!=null) this.spellChecker.removeNode(this.contentBoxDataNode);
			this.spellChecker = null;
		}		
		
		//2- : Remove event connection
		for(var i=0; i<this.connectArray.length; i++){
			 dojo.disconnect(this.connectArray[i]);
			//this.connectArray.splice(i, 1);
			 this.connectArray[i] = null;
		}
		this.connectArray =[];
		
		//3-  Destroy Context Menu
		if (this.menuItem1) this.menuItem1.destroy();
		if (this.menuItem2) this.menuItem2.destroy();
		if (this.menuItem3) this.menuItem3.destroy();
		if (this.menuItem4) this.menuItem4.destroy();
		if (this.menuItem5) this.menuItem5.destroy();
		if (this.menuItem6) this.menuItem6.destroy();
		if (this.menuItem9) this.menuItem9.destroy();
		if (this.menuItem10) this.menuItem10.destroy();
		if (this.ctxMenu){
			this.ctxMenu.unBindDomNode(this.mainNode);
			this.ctxMenu.destroy();
			this.ctxMenu = null;
		}
		
		//4-  Destroy moveable
		if (this.nodeMoveable) this.nodeMoveable.destroy();
			
		if ( this.nbspHandler){
			this.nbspHandler.contentBox = null;
		 	this.nbspHandler = null;
		}
		
		//5-  Destroy this widget
		this.destroyRecursive();
		
		var nodeToDeleteArr = this.getNodesFromConnect();
		
		for(var i=0; i< nodeToDeleteArr.length; i++){
			 dojo.destroy(nodeToDeleteArr[i]);
			 nodeToDeleteArr[i] =null;		 
		}
		
		// destroy resize Handles
		dojo.query('.handle',this.mainNode).forEach(dojo.destroy);
		
	//6- : Remove node
		if(!keepMainNode){
			if (this.contentBoxDataNode!=null) dojo.destroy(this.contentBoxDataNode);
			dojo.destroy(this.mainNode);
		}

	//7-: Nullify javascript reference to a node
	     this.contentBoxDataNode = null;
	     this.domNode =null;
	     if ( this.opts){
	    	 this.opts.mainNode = null;
	    	 this.opts.parentContainerNode = null;
	    	 this.opts.contentBoxDataNode = null;
			 this.opts = null;
	     }
	     		     
	 	//Variables
	    this.boxContainer = null;
	 	this.parentContainerNode = null;
	 	this.isResizeable 		 = null;
	 	this.isMoveable 		 =null;
	 	this.isEditable			  =null;
	 	this.contentBoxType		  =null;
	 	this.editor				  = null;
	 	this.CONTENTS_ARRAY		  = null;
	 	this.newBox				  =null;
	 	this.editModeOn			 =null;
	 	this.boxSelected		 =null;
	 	this.defaultPosition	 =null;
	 	this.boxUID				 =null;
	 	this.initialPositionSize =null;
	 	this.editTD				 =null;
	 	this.copyBox			 =null;
	 	this.nodeMoveable		  =null;
	 	this.CKToolbarSharedSpace	 =null;
	 	this.tempLayer				=null;
	 	this.hasBorder				=null;
	 	this.borderProperty				=null;
	 	this.beforeDataEdit			 =null;
	 	this.afterDataEdit			 =null;
	 	this.afterEditData           = null;
	 	this.userResized			 = false;
	 	this.isEmptyCBPlaceholder			 =null;
	 	this.isDirty				 =null;
	 	this.commentsId               =null;
	 	this.moverHandle			  =null;
	 	this.currentResizeHandle	  =null;
	 	this.connectArray			 =[];
	 	this.dfcParent			= null;
	 	this.dfc 					= null;
	 	if(this.editor){
		 	this.editor.dfc 			= null;
		 	this.editor.dfcParent		= null;
		 	this.editor.initSnapShot		= null;
		 	//console.log('clear park msg from contentbox 9320');
		 	this.editor.parkedMsgPairList 	= null;
		 	this.editor.preSnapShot			= null;
			this.editor.preSnapShot = null;
			this.editor.prevPostSnapShot = null;
		 	this.editor.keyDownTimeout = null;
	 	}
	 	if (this.defaultTextDFC)
	 		dojo.destroy(this.defaultTextDFC);
	 	this.defaultTextDFC=null;
   },
   
   /**
    * This function should be used to retrieve the contentBox editor name
    * @returns
    */
   getEditorName: function(){
	   if (window.pe.scene.slideEditor.SINGLE_CK_MODE && this.editor){
		   return this.editor.name;
	   } else{
		   return this.contentBoxDataNode.id;   
	   }	   
   },
   
   /**
    * This function checks to see if the spare and its editor are healthy
    * Should only be used in SINGLE_CK_MODE  (i.e SINGLE_CK_MODE == true)
    * Called by getSpareEditorInstance.
    */
   _isSpareFine: function(spareEditor, spareBoxType){
	   var slideEditor = window.pe.scene.slideEditor;
	   var spr = null;
	   if((spareBoxType!= null && spareBoxType == PresConstants.CONTENTBOX_GROUP_TYPE) || (spareBoxType== null && this.contentBoxtype == PresConstants.CONTENTBOX_GROUP_TYPE)){
		   var spareBox = slideEditor.groupSpareBox;
		   if(spareBox!=null){
			   if(spareBox.boxRep !=null){
				   //the actual txt box spare is used in another box
				   var boxRepId = spareBox.boxRep.mainNode.id;
				   if(boxRepId !=null){
					   var SPRIdx = boxRepId.indexOf("SPR");
					   var sprId = boxRepId.substring(0, SPRIdx);
					   var sprMainNode = dojo.byId(sprId);
					   var dfp = window.pe.scene.slideEditor.getParentDrawFrameNode(sprMainNode);
						if(dfp!=null){
							var drawFrameContentBoxObj = window.pe.scene.slideEditor.getRegisteredContentBoxById(dfp.id);
							spr = drawFrameContentBoxObj.txtContent;
						}
				   }   
			   }
			   else{
				   spr = spareBox.txtContent;
			   }
		   }
	   }else if(spareBoxType!= null && spareBoxType == PresConstants.CONTENTBOX_TABLE_TYPE){
		   spr = slideEditor.tableSpareBox;
	   }
	   else{
		   spr = slideEditor.spareBox;
	   }
	   if (spr!=null && spr.editor!=null &&  spr.contentBoxDataNode!=null && spareEditor!=null && spareEditor.document!=null && spareEditor.document.$.body!=null){//We need to ensure that not only editor is healty but the contentBoxDataNode as well.
		   return true;
	   }else{
		   return false;
	   }		   
   },
   
   /**
    * getNewSpare.. destroys the old spare and gets a new one
    */
   getNewSpare: function(spareBoxType){
		//if spare.editor is still null then we need to destroy spare and recreate
		console.log('Spare Editor may be corrupted or destroyed... Creating new spare instance!!!');
		var slideEditor = window.pe.scene.slideEditor;
		try{
			var spareBox = null;
		   if((spareBoxType!= null && spareBoxType == PresConstants.CONTENTBOX_GROUP_TYPE) || (spareBoxType== null && this.contentBoxtype == PresConstants.CONTENTBOX_GROUP_TYPE)){
			   spareBox = slideEditor.groupSpareBox;
		   }
		   else if((spareBoxType!= null && spareBoxType == PresConstants.CONTENTBOX_TABLE_TYPE)|| (spareBoxType== null && this.contentBoxtype == PresConstants.CONTENTBOX_TABLE_TYPE)){
			   spareBox = slideEditor.tableSpareBox;
		   }
		   else{
			   spareBox = slideEditor.spareBox;
		   }
		   if(spareBox!=null){
			   spareBox.destroyContentBox();
			   spareBox=null;
		   }
			//window.pe.scene.slideEditor.spareBox.destroyContentBox();
			//window.pe.scene.slideEditor.spareBox=null;
			//Reload slide since may have bad contentBoxes around
			console.log('Reloading slide due to error going into edit mode');
			var sorter = window.pe.scene.slideSorter;
			sorter.simulateSlideClick(sorter.selectedSlide);
		} catch(e){
		}
		if((spareBoxType!= null && spareBoxType == PresConstants.CONTENTBOX_GROUP_TYPE) || (spareBoxType== null && this.contentBoxtype == PresConstants.CONTENTBOX_GROUP_TYPE)){
			slideEditor.groupSpareBox = null;
			slideEditor.createSpareGrpContentBox();
			return slideEditor.groupSpareBox;
	   }else if((spareBoxType!= null && spareBoxType == PresConstants.CONTENTBOX_TABLE_TYPE) || (spareBoxType== null && this.contentBoxtype == PresConstants.CONTENTBOX_TABLE_TYPE)){
			slideEditor.tableSpareBox = null;
			slideEditor.createSpareTableContentBox();
			return slideEditor.tableSpareBox;
	   }
		else{
		   slideEditor.spareBox=null;
		   slideEditor.createSpareBox();
		   return slideEditor.spareBox;
	   }	   
   },
      
   /**
    * This function returns the editor instance and should only be used in SINGLE_CK_MODE  (i.e SINGLE_CK_MODE == true)
    * Attempts to always return a valide spareBox
    * @returns
    */
   getSpareInstance: function(spareBoxType){
	   var slideEditor = window.pe.scene.slideEditor;	   
	   var spareBox = null;
	   if((spareBoxType!= null && spareBoxType == PresConstants.CONTENTBOX_GROUP_TYPE) || (spareBoxType== null && this.contentBoxtype == PresConstants.CONTENTBOX_GROUP_TYPE)){
		   spareBox = slideEditor.groupSpareBox;
		   // return spareBox;
	   }else if(spareBoxType!= null && spareBoxType == PresConstants.CONTENTBOX_TABLE_TYPE){
		   spareBox = slideEditor.tableSpareBox;
		   
		   // to create sparebox for table at the first time to edit table [Mobile Only]
		   if (spareBox==null && concord.util.browser.isMobile()) {
			   slideEditor.createSpareTableContentBox();
			   spareBox = slideEditor.tableSpareBox;
		   }
	   }
	   else{
		   spareBox = slideEditor.spareBox;
	   }

	   if (spareBox && spareBox.editorName && CKEDITOR.instances[spareBox.editorName]!=null){
		   var spareEditor = CKEDITOR.instances[spareBox.editorName];
		   //TODO: pass sparebox type param in getNewSpare
		   if (this._isSpareFine(spareEditor, spareBoxType)){
			   return spareBox;
		   }else{
			   return this.getNewSpare(spareBoxType);
		   }
	   }	   
	   else
		   return this.getNewSpare(spareBoxType);
   },
   
   setBgImgTransparent: function(){
	   if(this.mainNode!=null && (dojo.hasClass(this.mainNode, "resizableContainer")||dojo.hasClass(this.mainNode, "resizableContainerSelected"))){
		   var transparentImgPath = window.contextPath + window.staticRootPath + "/images/realTransparent.png";
		   dojo.style(this.mainNode, "background", "url("+transparentImgPath+") repeat");
	   }
   },

   
	// set aria-labelledby for the presentations classes in the slide
   setAriaLabels:function(drawFrame){
	   if(drawFrame!=null && (drawFrame.className == null || drawFrame.className.indexOf('isSpare') == -1)){
		   var ariaNode = this.getAriaNode(drawFrame);
		   if (ariaNode) {
			   var ariaLabel = this.getAriaLabel(drawFrame,ariaNode);

			   if (ariaLabel) {
				   if(ariaNode.tagName.toLowerCase()=='table'){
                       dijit.setWaiState(ariaNode,'label', 'table_' + ariaLabel); 
              	   }else
				   dijit.setWaiState(ariaNode,'labelledby', ariaLabel);  
			   }
			   
			   var presClass = dojo.attr(drawFrame,'presentation_class');
			   if (presClass == null) 
				   presClass = "";

			   // make sure tabindex is set
			   if (!dojo.hasAttr(ariaNode,'tabindex')) {
				   if (presClass == 'page-number' || presClass == 'footer' || presClass == 'date-time'|| presClass == 'header') {
					   dojo.attr(ariaNode,'tabindex', '-1');
				   }
				   else {
					   dojo.attr(ariaNode,'tabindex', '0');
				   }
			   }

			   // make sure the aria role is set (except for header/footer and outline textboxes, those don't need roles)
			   if (!dojo.hasAttr(ariaNode,'role')) {
				   var role = this.getAriaRole(presClass);  // get role based on type of content box
				   if (role) 
					   dijit.setWaiRole(ariaNode,role);		   
			   }
		   }
		   //43695: [Regression][A11Y]JAWS can't read table cell content
		   dojo.forEach(dojo.query('td,th', this.contentBoxDataNode),
				function(item) {
			   		dojo.attr(item, 'tabindex','0');
				}
	        );
	   }
   },

   
   // get node that will contain the aria information
   getAriaNode:function(drawFrame){
	   var drawTextboxes = dojo.query('> .draw_text-box',drawFrame);
	   if (drawTextboxes!=null && drawTextboxes.length>0){
		   return drawTextboxes[0];
	   }
	   return null;
   },
   

   // get ID of the node that labels the contents of the textbox
   getAriaContentsID:function(ariaNode){

	   //get the reference to the contents of the textbox
	   if (ariaNode){
		   var tmpNode = dojo.query(".draw_frame_classes",ariaNode);
		   if ((tmpNode.length > 0) && (tmpNode[0].firstChild)) {
			   return tmpNode[0].firstChild.id;
		   }
		   else {
			   var tmpNode = dojo.query(".draw_shape_classes",ariaNode);
			   if ((tmpNode.length > 0) && (tmpNode[0].firstChild)) {
				   return tmpNode[0].firstChild.id;
			   }
		   }
	   }
	   return "";
   },
   
   // default aria role
   getAriaRole:function(presClass){
	   if (presClass && (presClass == 'page-number' || presClass == 'footer' || presClass == 'date-time' || presClass == 'header')) 
		   return "";
	   else
		   return "textbox";
	   },

   // get aria-label if it exists, otherwise use a generic text based on the presentation class,
   // and return the labelledby info to use
   getAriaLabel:function(drawFrame, ariaNode){
	   var label = "";
	   // set the text that JAWS will announce before reading the contents.  If it has a aria-label (imported presentation), use that
	   // otherwise we'll set our own default text based on the type of textbox
	   if (ariaNode && dojo.hasAttr(ariaNode,'aria-label')) {
		   label = ariaNode.id;
	   }
	   else {
		   // use our generic text box label when we have one for this presentation class (e.g. "title")
		   // except for 'outline' - if we're in a shape, do NOT set the label 
		   var presClass = dojo.attr(drawFrame,'presentation_class');
		   if (presClass != 'outline' || !dojo.hasClass(drawFrame, 'g_draw_frame')){
			   label = concord.util.A11YUtil.getLabel(presClass); 
		   }
	   }
	   
	   // now append the node id that contains the contents of the textbox
	   var labelledbyID = this.getAriaContentsID(ariaNode);
	   if (labelledbyID && label != labelledbyID){
		   if (label)
			   label = label + ' ' + labelledbyID;
		   else
			   label = labelledbyID;
	   }
	   
	   return label;

   },
  
	getVerticalAlignment : function(){
		var dfcNodes = null;
		var dfcNode = null;
		if ( this.isEditModeOn() && this.getEditor()){
			dfcNodes = dojo.query('.draw_frame_classes, .draw_shape_classes', this.getEditor().document.getBody().$);
			if ( dfcNodes.length > 0)
				dfcNode = dfcNodes[0];
		} else {
			dfcNodes = dojo.query('.draw_frame_classes, .draw_shape_classes', this.contentBoxDataNode);
			if ( dfcNodes.length > 0)
				dfcNode = dfcNodes[0];
		}
        
        if ( dfcNode){
        	var computedStyle = dojo.getComputedStyle(dfcNode);
        	if ( computedStyle && computedStyle.verticalAlign && computedStyle.verticalAlign == 'baseline' ){
        		return 'top';
        	} else if ( computedStyle && computedStyle.verticalAlign) {
        		return computedStyle.verticalAlign;
        	}
        }
        return undefined;
	},
	isUnSupportCotent: function(){
		return false;
	},
	isRotated: function(){
		return false;
	},
	createTableNodeForEditMode: function(isForSpare){
		if (this.contentBoxType==PresConstants.CONTENTBOX_TABLE_TYPE){
			var cbTable = this.contentBoxDataNode;
			this._updateTableWithDefaultCellContent(cbTable);
	    	var tbl = document.createElement('table');
	    	dojo.style(tbl,{
	    		'width':"100%",
	    		'height':this.getTableHeightPercent()
	    	});
	    	if (this.isBidi && dojo.style(this.mainNode, "direction")) 
	    		dojo.style(tbl,"direction", dojo.style(this.mainNode, "direction"));
	    	dojo.addClass(tbl,this.contentBoxDataNode.className);
	    	this._updateTableStyleAttributes(tbl, this.contentBoxDataNode);
	    	
	    	var colgrpElems = dojo.query('colgroup', this.contentBoxDataNode);
	    	if(colgrpElems.length > 0){
	    		var colgrp = colgrpElems[0];
	    		tbl.appendChild(isForSpare ? dojo.clone(colgrp) : colgrp);
	    	}
	    	
	    	var tbodyElems = dojo.query('tbody',this.contentBoxDataNode);
	    	if(tbodyElems.length>0){
	    		//assume there is only one tbody
	    		var tbody = tbodyElems[0];
	    		if(isForSpare == true){
	    			//for spare, we don't want to remove from the actual this.contentBoxDataNode
		    		var tbodyClone = dojo.clone(tbody);
		    		tbl.appendChild( tbodyClone);
		    	}else{
		    		tbl.appendChild(tbody);
		    	}
	    		
	    	}
	    	tbl.id = this.contentBoxDataNode.id;
	    	
	    	return tbl;
		}
		return null;
	},
	
	getFilteredContentHtml:function()
	{
		PresCKUtil.updateIdForAllSpans(this.mainNode);
		var tmpNode =  dojo.clone(this.mainNode);
		if(!pe.keepIndicator){
			tmpNode = concord.util.presCopyPasteUtil.removeIndicatorForCopy(tmpNode).$;
		}
		var dfc = new CKEDITOR.dom.element(tmpNode);
		var cnt = dfc.$.childNodes.length-1;
		for(var i= cnt;i>0;i--)
		{
			var child = dfc.getLast();
			child.remove();
		}
		PresListUtil._EnCodingDataForBrowser(dfc,this.mainNode);
		return dfc.getOuterHtml();
	}


});
