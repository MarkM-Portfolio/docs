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
 *                   Rights Reserved. U.S. Government Users Restricted Rights:
 *                   Use, duplication or disclosure restricted by GSA ADP
 *                   Schedule Contract with IBM Corp.
 */

dojo.provide("concord.widgets.grpContentBox");
dojo.require("concord.util.browser");
dojo.require("concord.widgets.mContentBox");
dojo.require("concord.widgets.txtContentBox");
dojo.require("concord.widgets.imgContentBox");
dojo.require("concord.widgets.shapeContentBox");
dojo.require("concord.widgets.presentationDialog");
dojo.require("dojo.i18n");

dojo.requireLocalization("concord.util", "a11y");

dojo.declare("concord.widgets.grpContentBox", [ concord.util.browser.isMobile() ? concord.widgets.mContentBox : concord.widgets.contentBox ],
		{
			G_CONTENT_BOX_ARRAY			: null,
			selectedBoxes 				: null,
			isBoxShape						: false,
			txtContent                  : null,
			
			constructor : function(opts) {
				// console.log("grpContentBox:constructor","Entry");
				this.G_CONTENT_BOX_ARRAY = [];

				if (opts) {
					this.selectedBoxes = this.opts.selectedBoxes;
					this.isBoxShape = this.opts.isBoxShape;
				}
				this.init();
				// console.log("grpContentBox:constructor","Exit");
			},

			init : function() {
				// console.log("grpContentBox:init","Entry");
				this.inherited(arguments);

				// if no selected boxes from Slide Editor then we know it's from Slide Sorter
				if (!this.selectedBoxes) { 
					this.widgetizeContentData();
				}
			},
			isRotated: function(){
				if(this.G_CONTENT_BOX_ARRAY){
					for (var j=0; j < this.G_CONTENT_BOX_ARRAY.length; j++) {
						if (this.G_CONTENT_BOX_ARRAY[j].contentBoxType == PresConstants.CONTENTBOX_TEXT_TYPE){
							var styleString = dojo.attr(this.G_CONTENT_BOX_ARRAY[j].mainNode,'style')||'';
							if(styleString.indexOf('transform')>=0 && pe.scene.bean && pe.scene.bean.getExtension().toLowerCase() != 'pptx'){
								return true;
							}
						}
					}
				}
				return false;
			},
			isUnSupportCotent: function(){
				if(this.G_CONTENT_BOX_ARRAY && this.G_CONTENT_BOX_ARRAY[0] && this.G_CONTENT_BOX_ARRAY[0].contentBoxType == PresConstants.CONTENTBOX_IMAGE_TYPE &&
						this.G_CONTENT_BOX_ARRAY[0].mainNode.firstElementChild.nodeName.toLowerCase() == 'div'){
					dojo.removeClass(this.mainNode,'resizableContainer resizableGContainer bc');
					dojo.forEach(dojo.query('div', this.mainNode),
						function(item) {
							item.style.cursor = '';
							dojo.removeClass(item,'resizableContainer resizableGContainer bc');
						}
					);
					return true;
				}
				return false;
			},
			adjustSvgNode: function(){
				if (this.G_CONTENT_BOX_ARRAY[0] && this.G_CONTENT_BOX_ARRAY[0].contentBoxType == PresConstants.CONTENTBOX_SHAPE_TYPE) {
					this.G_CONTENT_BOX_ARRAY[0].setSvgShapePropeties(true);
				}
			},
			
			refreshSvgNode: function(){
				if (this.G_CONTENT_BOX_ARRAY[0] && this.G_CONTENT_BOX_ARRAY[0].contentBoxType == PresConstants.CONTENTBOX_SHAPE_TYPE) {
					this.G_CONTENT_BOX_ARRAY[0].refreshSvgShape();
				}
			},
			
			publishBoxStyleResizingEnd: function(){		
				//console.log("groupcontentBox:publishBoxStyleResizingEnd","Entry");
				this.adjustSvgNode();
				this.inherited(arguments);
			},
			
			//
			// Overwrite parent to handle data passed on by Slide Editor context menu.
			//
			setContentData : function() {
				if (this.selectedBoxes) {
					var dataNode = this.contentBoxDataNode = document.createElement('div');
					this.mainNode.appendChild(dataNode);

					for ( var i = 0; i < this.selectedBoxes.length; i++) {
						this.selectedBoxes[i].deSelectThisBox();
						var handles = dojo.query('.handle',	this.selectedBoxes[i].mainNode);
						for ( var j = 0; j < handles.length; j++) {
							dojo.removeClass(handles[j], 'handle');
							dojo.addClass(handles[j], 'disabledHandle');
						}
						dataNode.appendChild(this.selectedBoxes[i].mainNode);

						// publish to remove selected box from Slide Sorter
						this.selectedBoxes[i].publishDeleteNodeFrame();
					}
				}
			},
			
			//
			// Widgetize content passed on by Slide Sorter.
			//
			widgetizeContentData : function() {
				var gdf = dojo.query('.g_draw_frame', this.contentBoxDataNode);
				for (var i = 0;i < gdf.length; i++) {
					// Widgetize each g_draw_frame
					var contentObj = null;
					var family = this.getFamily(gdf[i]);
					if (family == 'shape') {
						contentObj = new concord.widgets.shapeContentBox({
							'CKEDITOR':this.opts.CKEDITOR,
							'CKToolbarSharedSpace': this.opts.CKToolbarSharedSpace,
							'mainNode':gdf[i],
							'contentBoxDataNode':this.findContentDataNode(gdf[i]),
							'parentContainerNode':this.contentBoxDataNode,
							'contentBoxType':PresConstants.CONTENTBOX_SHAPE_TYPE,
							'deSelectAll':this.opts.deSelectAll,
							'deSelectAllButMe':this.opts.deSelectAllButMe,
							'initialPositionSize':{'position':gdf[i].style.position,'left':gdf[i].style.left,'top':gdf[i].style.top,'width':gdf[i].style.width,'height':gdf[i].style.height},
							'isMultipleBoxSelected':this.opts.isMultipleBoxSelected,
							'isMoveable':this.opts.isBoxShape ? false : true,
							'isResizeable':this.opts.isBoxShape ? false : true,
							'publishSlideChanged':this.opts.publishSlideChanged,
							'getzIndexCtr':this.opts.getzIndexCtr,	
							'setzIndexCtr':this.opts.setzIndexCtr,
							'toggleBringToFront':this.opts.toggleBringToFront,	
							'toggleSendToBack':this.opts.toggleSendToBack,
							'deRegisterContentBox' : this.opts.deRegisterContentBox,
							'getActiveDesignTemplate' : this.opts.getActiveDesignTemplate,
							'deleteSelectedContentBoxes' : this.opts.deleteSelectedContentBoxes,
							'pasteSelectedContentBoxes'  : this.opts.pasteSelectedContentBoxes,
							'copySelectedContentBoxes'	 : this.opts.copySelectedContentBoxes,					
							'createIndicatorSytle':this.opts.createIndicatorSytle,
							'getInLineStyles':this.opts.getInLineStyles,
							'getMasterTemplateInfo' : this.opts.getMasterTemplateInfo,
							'checkBoxPosition' : this.opts.checkBoxPosition,					
							'handleMultiBoxSelected':this.opts.handleMultiBoxSelected});
					} if (family == 'graphic') {
						 contentObj = new concord.widgets.imgContentBox({
							'CKEDITOR':this.opts.CKEDITOR,
							'CKToolbarSharedSpace': this.opts.CKToolbarSharedSpace,
							'mainNode':gdf[i],
							'contentBoxDataNode':this.findContentDataNode(gdf[i]),
							'parentContainerNode':this.contentBoxDataNode,
							'contentBoxType':PresConstants.CONTENTBOX_IMAGE_TYPE,
							'deSelectAll':this.opts.deSelectAll,
							'deSelectAllButMe':this.opts.deSelectAllButMe,
							'initialPositionSize':{'position':gdf[i].style.position,'left':gdf[i].style.left,'top':gdf[i].style.top,'width':gdf[i].style.width,'height':gdf[i].style.height},
							'isMultipleBoxSelected':this.opts.isMultipleBoxSelected,
							'isMoveable':this.opts.isBoxShape ? false : true,
							'isResizeable':this.opts.isBoxShape ? false : true,
							'publishSlideChanged':this.opts.publishSlideChanged,
							'getzIndexCtr':this.opts.getzIndexCtr,	
							'setzIndexCtr':this.opts.setzIndexCtr,
							'toggleBringToFront':this.opts.toggleBringToFront,	
							'toggleSendToBack':this.opts.toggleSendToBack,
							'urlImage':null,
							'openAddNewImageDialog': this.opts.openAddNewImageDialog,
							'deRegisterContentBox' : this.opts.deRegisterContentBox,
							'getActiveDesignTemplate' : this.opts.getActiveDesignTemplate,
							'deleteSelectedContentBoxes' : this.opts.deleteSelectedContentBoxes,
							'pasteSelectedContentBoxes'  : this.opts.pasteSelectedContentBoxes,
							'copySelectedContentBoxes'	 : this.opts.copySelectedContentBoxes,					
							'createIndicatorSytle':this.opts.createIndicatorSytle,
							'getInLineStyles':this.opts.getInLineStyles,
							'getMasterTemplateInfo' : this.opts.getMasterTemplateInfo,
							'checkBoxPosition' : this.opts.checkBoxPosition,					
							'handleMultiBoxSelected':this.opts.handleMultiBoxSelected});									
					} else if (family =='text') {
						 contentObj = new concord.widgets.txtContentBox({
							'CKEDITOR':this.opts.CKEDITOR,
							'CKToolbarSharedSpace': this.opts.CKToolbarSharedSpace,
							'mainNode':gdf[i],
							'contentBoxDataNode':this.findContentDataNode(gdf[i]),
							'parentContainerNode':this.contentBoxDataNode,
							'contentBoxType':PresConstants.CONTENTBOX_TEXT_TYPE,
							'deSelectAll':this.opts.deSelectAl,
							'deSelectAllButMe':this.opts.deSelectAllButMe,
							'initialPositionSize':{'position':gdf[i].style.position,'left':gdf[i].style.left,'top':gdf[i].style.top,'width':gdf[i].style.width,'height':gdf[i].style.height},
							'isMultipleBoxSelected':this.opts.isMultipleBoxSelected,
							'isMoveable':this.opts.isBoxShape ? false : true,
							'isResizeable':this.opts.isBoxShape ? false : true,
							'publishSlideChanged':this.opts.publishSlideChanged,
							'getzIndexCtr':this.opts.getzIndexCtr,
							'setzIndexCtr':this.opts.setzIndexCtr,
							'toggleBringToFront':this.opts.toggleBringToFront,	
							'toggleSendToBack':this.opts.toggleSendToBack,
							'openAddNewImageDialog': this.opts.openAddNewImageDialog,	
							'deRegisterContentBox' : this.opts.deRegisterContentBox,
							'getActiveDesignTemplate' : this.opts.getActiveDesignTemplate,
							'deleteSelectedContentBoxes' : this.opts.deleteSelectedContentBoxes,
							'pasteSelectedContentBoxes'  : this.opts.pasteSelectedContentBoxes,
							'copySelectedContentBoxes'	 : this.opts.copySelectedContentBoxes,										
							'createIndicatorSytle':this.opts.createIndicatorSytle,
							'getInLineStyles':this.opts.getInLineStyles,
							'getMasterTemplateInfo' : this.opts.getMasterTemplateInfo,
							'checkBoxPosition' : this.opts.checkBoxPosition,
							'handleMultiBoxSelected':this.opts.handleMultiBoxSelect});	
						 
						 contentObj.setzIndexCtr((contentObj.getzIndexCtr()+1));	// Move text in front of image 
						 this.txtContent = contentObj;
					}
					
					if (contentObj != null){
						this.G_CONTENT_BOX_ARRAY.push(contentObj);
						if(concord.util.browser.isMobile())
							contentObj.groupContentBox = this;
					}

					// Remove g_draw_frame paddings 
					dojo.removeClass(gdf[i], 'resizableContainer');
					dojo.addClass(gdf[i], 'resizableGContainer');
					
					// Disable g_draw_frame handlers
					var handles = dojo.query('.handle',	gdf[i]);
					for ( var j = 0; j < handles.length; j++) {
						dojo.removeClass(handles[j], 'handle');
						dojo.addClass(handles[j], 'disabledHandle');
					}
				}
			},

			//
			// Overwrite parent to handle group specific behavior
			//
			deSelectThisBox: function(e){
				// 42526: [Co-editing]Other user click shape in some slide will broken lock status in co-editor user
				if(!this.boxSelected) return;
				// Handle self
				dojo.removeClass(this.mainNode,'resizableContainerSelected');		
				dojo.addClass(this.mainNode,'resizableContainer');		
				var focusElem = this.contentBoxDataNode;
				if (focusElem!=null) focusElem.blur();
				var turnOnEditMode = false;
				if(this.boxSelected){
					this.toggleEditMode(turnOnEditMode);	
				}
				this.hideHandles();		
				this.boxSelected =false;
				this.disableMenuItemsOnDeSelect();
				if(this.hasComments()){
					this.updateCommentIconPosition();
				}

				// Handle g_draw_frame
				if (this.G_CONTENT_BOX_ARRAY != null) {
					for (var i=0; i<this.G_CONTENT_BOX_ARRAY.length; i++){
						this.G_CONTENT_BOX_ARRAY[i].boxSelected=true;
						this.G_CONTENT_BOX_ARRAY[i].deSelectThisBox();
					}					
				}
				
			//	//D23697: Selection behavior is very strange in a sample file
			//	if(this.boxRep && this.contentBoxType ==PresConstants.CONTENTBOX_GROUP_TYPE) 
			//		this.boxRep.unLoadSpare();
			},

			//
			// Overwrite parent to handle group specific behavior
			//
			toggleEditMode: function(onOff) {
				// Handle self
				// 42548: [Co-editing]There is a conflict waring when other user goto edit mode of textbox
				var origEditMode = this.editModeOn;
				this.editModeOn = (onOff!=null)? onOff : !this.editModeOn;
				//13550 - if it is a spare, do not publish
				if(dojo.hasClass(this.mainNode, "isSpare") == false && origEditMode != this.editModeOn){
					this.publishBoxEditMode();
				}
				// Handle g_draw_frame
				if (!this.editModeOn && (this.G_CONTENT_BOX_ARRAY != null)) {
					for (var i=0; i<this.G_CONTENT_BOX_ARRAY.length; i++){
						if (this.G_CONTENT_BOX_ARRAY[i].editModeOn) this.G_CONTENT_BOX_ARRAY[i].toggleEditMode(false);
					}
				}
			},
			getDataTotalHeight: function(){
				var dataMargin = this.getDataMargin();
				var totalDataHeight =0;
				var totalDataHeight = 0;
				var dataNode = dojo.query('.draw_text-box',this.contentBoxDataNode);
				if (dataNode.length>0){
					totalDataHeight += dataNode[0].firstElementChild.offsetHeight;
				} else {
					totalDataHeight += this.contentBoxDataNode.offsetHeight;
				}
				totalDataHeight += dataMargin;
				return totalDataHeight;
			},			//
			// Return g_draw_frame content object given an id
			//
			getGContentBoxById: function(id){
				if (id && (this.G_CONTENT_BOX_ARRAY != null)){
					for (var j=0; j<this.G_CONTENT_BOX_ARRAY.length; j++){
						var gContentBoxObj = this.G_CONTENT_BOX_ARRAY[j];
						if ( id == dojo.attr(gContentBoxObj.mainNode,'id')){				
							return gContentBoxObj;
						}
					}	
				} 
				return null;		
			},	
			
			//
			// Return g_draw_frame id given an element id (typically <p> in text box)
			//
			getParentGDrawFrameId: function (id){
				var parentDrawFrameId = null;
				var node = dojo.byId(id);
				if ((node) && (dojo.hasClass(node,'draw_frame'))){
					return id;
				}
				if(node!=null){
					while(node){
						if ((node) && (dojo.hasClass(node,'g_draw_frame'))){
							break;
						} else if ((node) && (dojo.hasClass(node,'draw_frame'))){
							break;
						}
						node = node.parentNode;
					}
					parentDrawFrameId = node.id;
				}
				
				return parentDrawFrameId;
			},
			
			//
			// Returns a string indicating the ODP family of the node passed in.  
			// TODO: Get SlideEditor to pass this in via opts
			//
			getFamily: function(node){
			
				var presentationClass = dojo.attr(node, "presentation_class");
				var dataNode = node.children[0];
				if (dataNode.tagName.toLowerCase()=='svg') {
					return 'shape';
				} else if ((presentationClass == 'graphic') ||
					((dataNode) && (dojo.hasClass(dataNode, 'draw_image') && (dojo.attr(node,'draw_layer')!=this.BACKGROUND_OBJECTS))))
					{return 'graphic';}
				else if  ((presentationClass== 'date-time') ||
				        (presentationClass== 'footer') ||
				        (presentationClass== 'page-number')){			
				  return null;			
				} else if ((presentationClass== 'outline') ||
				        (presentationClass== 'title') ||
				        (presentationClass== 'subtitle') ||
				        (((dataNode) && (dojo.hasClass(dataNode, 'draw_text-box') || dojo.attr(dataNode,'odf_element')=='draw_text-box')))){
					
					return 'text';
				} else if ((dataNode) && (dataNode.tagName.toLowerCase()=='table')) {  // table
					return 'table';
				} else if (dojo.attr(node,'draw_layer')==this.BACKGROUND_OBJECTS){
					return null;
				} else if ((presentationClass== 'group')) {  // table
					return 'group';
				} else {
					console.log("SlideEditor cannot determine ODP drawFrame family type");
					return;			
				}
			},
			
			//
			// Return the content box data node.
			// TODO: Get SlideEditor to pass this in via opts
			//
			findContentDataNode: function(node){
				var dataNode = dojo.query('.contentBoxDataNode',node);
				if (dataNode.length>0){
					return dataNode[0];
				} else {
					//console.log("SlideEditor: findContentDataNode: Cannot find suitable contentBoxDataNode candidate for node id "+node.id);
					return node.children[0];			
				}	
			},
			
			makeNonEditable: function(){
				if(this.G_CONTENT_BOX_ARRAY !=null){
					for (var i=0; i<this.G_CONTENT_BOX_ARRAY.length; i++){
						this.G_CONTENT_BOX_ARRAY[i].makeNonEditable();
					}
				}
				this.inherited(arguments);
			},
			//
			// Extend parent with group specific attributes
			//
			destroyContentBox: function(keepMainNode){
				if(this.G_CONTENT_BOX_ARRAY !=null){
					for (var i=0; i<this.G_CONTENT_BOX_ARRAY.length; i++){
						this.G_CONTENT_BOX_ARRAY[i].destroyContentBox(keepMainNode);
					}
				}
				this.inherited(arguments);
				
				if (this.G_CONTENT_BOX_ARRAY) {
					this.G_CONTENT_BOX_ARRAY = null;					
				}
				if (this.selectedBoxes) {
					this.selectedBoxes = null;
				}
				if (this.isBoxShape) {
					this.isBoxShape = null;
				}
			},
			
			getEditor: function() {
			  if ( this.txtContent && this.txtContent.editor )
			    return this.txtContent.editor;
			  
			  return null;
			},
			
			_getSvgTitle: function(svgNode) {
				if (svgNode && svgNode.tagName.toLowerCase() == 'svg') {
					// deal with svg node : find for children 'title'
					var titleNodeList = dojo.query("title", svgNode);
					if (titleNodeList.length > 0) {
						var titleNode = titleNodeList[0];
						var altText = titleNode.textContent;
						if (!altText || altText.length == 0)
							return titleNode.innerHTML;
						else
							return altText;
					}
				}
				return null;
			},
			
			getAltText: function() {
				var altText = "";
				if ((this.G_CONTENT_BOX_ARRAY !=null) && 
				    (this.G_CONTENT_BOX_ARRAY.length > 0)) {
					var backgroundBox = this.G_CONTENT_BOX_ARRAY[0];  // the background is always on the first place
					if (backgroundBox.contentBoxType == PresConstants.CONTENTBOX_IMAGE_TYPE ||
						backgroundBox.contentBoxType == PresConstants.CONTENTBOX_SHAPE_TYPE) {
						if (backgroundBox.mainNode.childNodes.length > 0) {
							var imgNode = backgroundBox.mainNode.childNodes[0];
							if (imgNode.tagName.toLowerCase() == 'img' ||
									imgNode.tagName.toLowerCase() == 'svg') {
								// deal with img node : find for attribute 'alt'
								// Shape has the same logic as imported img
								altText = dojo.attr(imgNode, 'alt');
							}
						}
					}
				}
				
				return altText;
			},
			
			// set aria info
			setAriaLabels:function(drawFrame){
				if(drawFrame!=null){
					var labelledby = "";
					var gDrawFrames = dojo.query('.g_draw_frame',drawFrame);  // get all children that are g_draw_frames
					if (gDrawFrames!=null && gDrawFrames.length>0){
						for(var i=0; i<gDrawFrames.length; i++) {
							   var presClass = dojo.attr(gDrawFrames[i],'presentation_class');
							   if (presClass && presClass == 'graphic') {
								   var imgNode = gDrawFrames[i].firstChild;
								   var altText = dojo.attr(imgNode,'alt');

								   // have JAWS tell user its a "shape" object
								   if (dojo.hasClass(drawFrame,"draw_custom-shape")){
									   labelledby = 'P_arialabel_Shape ' + labelledby;
								   }
								  
								   if (!altText || altText.length == 0) {
									   // JAWS doesn't appear to like it when the alt tag is empty or missing (it won't announce anything)
									   // so lets put in a dummy alt tag text
									   var a11yStrings = dojo.i18n.getLocalization("concord.util", "a11y");
									   if (dojo.hasClass(drawFrame,"draw_custom-shape")){
										   	// there is no need to add 'alt' for svg node
										    if (imgNode.tagName.toLowerCase() == 'svg') {
										    	var title = this._getSvgTitle(imgNode);
										    	// For new created shape, use its title as alt text
										    	// The title has been localized
										    	if (title && title !== 'shape')
										    		altText = title;
										    	else
										    		altText = a11yStrings.aria_shape;
										    	dojo.attr(imgNode, 'alt', altText);
										    }
									   }
									   else {
										   dojo.attr(imgNode,'alt',a11yStrings.aria_image);
									   }
								   }
								   // Add aria-label for shape if it has not
								   if (dojo.hasClass(drawFrame,"draw_custom-shape")){
									   // when a shape has alt text, make sure it has aria-label so JAWS announces the alt text
									   if (!dojo.hasAttr(imgNode,'aria-label')){
										   dijit.setWaiState(imgNode,'label',altText);
									   }
								   }
								   labelledby = labelledby + gDrawFrames[i].id + ' ';
							   }
							   else {
									// call main class to handle draw text box content in the g_draw_frame
									this.inherited(arguments,[gDrawFrames[i]]);
									labelledby = labelledby + this.getAriaContentsID(this.getAriaNode(gDrawFrames[i])) + ' ';
							   }   
						}
					}
					// now we need to set aria-labelledby on the content box to be the image and textbox
					if (labelledby && this.contentBoxDataNode) {
						dijit.setWaiRole(this.contentBoxDataNode,'textbox');
						dijit.setWaiState(this.contentBoxDataNode,'labelledby',dojo.string.trim(labelledby));
						// make sure we indicate focus on the content box data node so JAWS reads this content
						if (!dojo.hasAttr(this.contentBoxDataNode,'tabindex')) {
							dojo.attr(this.contentBoxDataNode,'tabindex', '0');
						}
					}
				}
			},

			
		  //D14747
			SuperscriptText: function() {
				if(this.isEditModeOn()) {
					this.getEditor().execCommand('superscript');
				}
			},
		   //D14747	
			SubscriptText: function() {
				if(this.isEditModeOn()) {
					this.getEditor().execCommand('subscript');
				}
			},
		   //D14747	
			strikethroughText: function() {
				if(this.isEditModeOn()) {
					this.getEditor().execCommand('strike');
				}
			},		
			
			boldText: function() {
				if(this.isEditModeOn()) {
					this.getEditor().execCommand('bold');
				}
			},
			
			italicText: function() {
				if(this.isEditModeOn()) {
					this.getEditor().execCommand('italic');
				}
			},

			underlineText: function() {
				if(this.isEditModeOn()) {
					this.getEditor().execCommand('underline');
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
				var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_disableTextSelectionMenuItems}];
		 		concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
		 		this.inherited(arguments);
			}
			
			
		});
