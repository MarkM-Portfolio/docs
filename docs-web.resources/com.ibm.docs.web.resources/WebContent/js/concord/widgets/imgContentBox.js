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
 * @imgContentBox.js CAEditor component
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

dojo.provide("concord.widgets.imgContentBox");
dojo.require("concord.util.browser");
dojo.require("concord.widgets.mContentBox");
dojo.require("concord.widgets.presentationDialog");
dojo.require("dojo.i18n");
dojo.requireLocalization("concord.widgets","imgContentBox");

dojo.declare("concord.widgets.imgContentBox", [concord.util.browser.isMobile() ? concord.widgets.mContentBox : concord.widgets.contentBox], {
	
	constructor: function(opts) {
		//console.log("imgContentBox:constructor","Entry");	
		this.isEditable = false; 
		if (opts){
			this.imageUrl = (this.opts.imageUrl)? this.opts.imageUrl : this.DEFAULT_IMAGE_URL;
			// for files names with '&', the image url replaces it with '&amp;'. This will replace
			// '&amp;' with '&'
			this.imageUrl = this.imageUrl.replace(/&amp;/g, '&');
			this.imageName = (this.opts.imageName) ? this.opts.imageName : '';
		}
		this.DEFAULT_TEXT_CONTENT = this.STRINGS.defaultText_placeHolder_AddImage;		
		this.init();
		this.IMGSTRINGS = dojo.i18n.getLocalization("concord.widgets","imgContentBox");	
		//console.log("imgContentBox:constructor","Exit");	
	},
    
    IMGSTRINGS    :null,
	contentType: null,
	DEFAULT_IMAGE_URL: window.contextPath + window.staticRootPath + "/images/imgPlaceholder.png",
	DEFAULT_TEXT_CONTENT: "",
	imageUrl: null,
	defaultPosition	:{'left':'200','top':'300','width':'200','height':'200'}, // Default position when object in created in px
	
	init: function(){
		//console.log("imgContentBox:init","Entry");	
		this.defaultPosition.left = this.PercentToPx("50", 'width')- (this.defaultPosition.width/2) ;
		this.defaultPosition.top = this.PercentToPx("50", 'height')- (this.defaultPosition.height/2) ;
		this.inherited(arguments);
		this.contentBoxType = PresConstants.CONTENTBOX_IMAGE_TYPE;
		
		/**
		 * Defect:32071: [FF][IE] Convert odp image and text position error.
		 * Can't set the draw_img's position to 'relative' and convert service set it to 'absolute' as default. 
		 */
		dojo.style(this.contentBoxDataNode,{'position':'relative'});
		dojo.attr(this.contentBoxDataNode,'draw_layer','layout'); //set draw_layer to layout to indicate that this content box is not a background objects
		//console.log("imgContentBox:init","Exit");					
	},	
	
	// Sets the data of the contentBox. This needs to be implemented by the subclass
	setContentData: function(){
		//console.log("imgContentBox:setContentData","Entry");
		if (this.createFromLayout){
			this.isEmptyCBPlaceholder=true;
			dojo.addClass(this.mainNode,'layoutClass');
			dojo.attr(this.mainNode,'emptyCB_placeholder','true');
			dojo.attr(this.mainNode,'draw_layer','layout');

			var dataNode = this.contentBoxDataNode = document.createElement('div');
			dojo.addClass(this.contentBoxDataNode,'layoutClassSS imgContainer');
			
			this.mainNode.appendChild(dataNode);
				
				var defaultImg = document.createElement('img');
				defaultImg.src = this.DEFAULT_IMAGE_URL;
				dojo.addClass(defaultImg,'defaultContentImage');
				dataNode.appendChild(defaultImg);
				//Adding inline style here so that it can be also applied when this contentBOx is in slide sorter
				dojo.style(defaultImg,{
					'position':'absolute',
					'border':'0 none',
					'left':'39%',
					'top':'39%',
					'margin':'0',
					'opacity':'0.5',
					'padding':0,
					'height':'25%',
					'width':'25%'
				});
				
				// WAI-ARIA Add default empty alt tab.
				dojo.setAttribute(defaultImg,'alt', '');
				
				var divTxt = document.createElement('div');
				divTxt.appendChild(document.createTextNode(this.DEFAULT_TEXT_CONTENT));
				dojo.addClass(divTxt,'defaultContentText');
				//Adding inline style here so that it can be also applied when this contentBOx is in slide sorter
				dojo.style(divTxt,{
					'position':'absolute',
					'border':'0',
					'padding':'0',
					'textAlign':'center',
					'top':'5%',
					//'fontSize':'1.6em',
					'width':'100%'
				});
				dataNode.appendChild(divTxt);	
				//this.updateBorder();
				this.updatedClassesForODP(this.layoutInfo.layoutFamily);
		} else if (this.newBox){
				var dataNode = this.contentBoxDataNode = document.createElement('img');	
				dataNode.onload = dojo.hitch(this,this.onImageLoad,dataNode);
				dataNode.onerror = dojo.hitch(this,this.onImageError);
				this.mainNode.appendChild(dataNode);
				
				//if this is IE hide the mainNode until we are sure it is the correct size
				if (dojo.isIE) {
					dojo.style(this.mainNode,{
						'visibility':'hidden'				
					});
				}
				
				if (!dojo.isWebKit) {
					dojo.style(this.mainNode,{
						'height':'auto'				
					});
				}

				dojo.style(this.mainNode, {'position':'absolute'});
				//make sure URI is encoded
				dataNode.src = encodeURI(decodeURI(this.imageUrl));
				dataNode.setAttribute('alt', this.imageName);
				this.updatedClassesForODP("graphic");	
				dojo.addClass(dataNode, 'draw_image');

//				//lets wait to make sure image is loaded
//				var ctr =1;
//				var TIMEOUT_VALUE = 100;
//				var imageLoaded = false;				
//				while (ctr<TIMEOUT_VALUE){
//					console.log("setContentData: Checking imageLoad status... attempt  "+(ctr));		
//			        if(imageLoaded){
//			        	ctr+=TIMEOUT_VALUE;
//			        	console.log("setContentData: Image is loaded!!!");
//			        	break;
//					}else {
//						//Let's do the check. Let's check for height of image box
//						ctr++
//						var h = dojo.style(this.contentBoxDataNode,'height');
//						var w = dojo.style(this.contentBoxDataNode,'width');
//						console.log("setContentData: height/width of imgContentBox is "+ h+" / "+w);	
//						if (h>0 && w>0){
//							imageLoaded=true;
//						}							
//					}
//				}
				
//				this.onImageLoad(dataNode);
		}
		
		//for generate ids
		if (!this.newBox) {
			this.setNodeId(this.mainNode,PresConstants.CONTENTBOX_PREFIX);
		}
		//console.log("imgContentBox:setContentData","Exit");							
	},
	
	
	//
	// Runs when an image is done loading
	//
	onImageLoad: function(dataNode){
		
		//fix for ie issues related to defects 46758 and 47451
	    //this is required due to the way IE will fire adjustContentDataSize for images
		//and the way ie will fire onImageLoad if the image is cached
		this.setNodeId(this.mainNode,PresConstants.CONTENTBOX_PREFIX);
		
		if (dojo.isIE) {
			
			//ensure that the presentation_class for mainNode is set to graphic
			if (dojo.attr(this.mainNode,"presentation_class") == null) {
				this.updatedClassesForODP("graphic");
			}
			
			//ensure that the ontentBoxDataNode has a class of contentBoxDataNode
			dojo.addClass(this.contentBoxDataNode, 'contentBoxDataNode');
			
			//fix image size issues
			dojo.attr(this.contentBoxDataNode,"style","POSITION: relative; WIDTH: 100%; HEIGHT: 100%; CURSOR: pointer");
			this.adjustContentDataSize();
		}
		//end fix for ie issues related to defects 46758 and 47451
		
		console.log("Image is done loading with height "+dojo.style(this.contentBoxDataNode,'height'));		
		
		//D20988 re-set display size after image loaded
		//D24355 [Image][Regression] Inserted image from gallery is extremely big
		//D24320 [Image][Regression] Image is inserted in right bottom of editor canvas
		if(!window.pe.scene.slideEditor.galleryImage){
			var naturalHeight = dataNode.naturalHeight;
			var naturalWidth = dataNode.naturalWidth;
			var slideHeight = dojo.style(this.mainNode.parentNode,'height');
			var slideWidth = dojo.style(this.mainNode.parentNode,'width');
			slideWidth = slideWidth - 2*this.CONTENT_BOX_BORDER_WIDTH;
			slideHeight = slideHeight -2*this.CONTENT_BOX_BORDER_WIDTH;
			var viewHeight = null;
			var viewWidth = null;
	
			if(naturalWidth > slideWidth){
				viewHeight = naturalHeight * slideWidth / naturalWidth;
				viewWidth = slideWidth;
			}else{
				viewHeight = naturalHeight;
				viewWidth = naturalWidth;
			}
			
			if(viewHeight > slideHeight){
				
				viewWidth = viewWidth * slideHeight / viewHeight;
				viewHeight = slideHeight;
			}
			
			var left = this.PercentToPx("50", 'width')- (viewWidth/2) -7;
			var top = this.PercentToPx("50", 'height')- (viewHeight/2) -7;
			
			var heightPct = this.PxToPercent(viewHeight,'height');
			dojo.style(this.mainNode,{
				'height':heightPct+"%"
			});
			var widthPct = this.PxToPercent(viewWidth,'width');
			dojo.style(this.mainNode,{
				'width':widthPct+"%"
			});		
			
			var leftPct = this.PxToPercent(left,'width');
			dojo.style(this.mainNode,{
				'left':leftPct+"%"
			});
			
			var topPct = this.PxToPercent(top,'height');
			dojo.style(this.mainNode,{
				'top':topPct+"%"
			});
			
			window.pe.scene.slideEditor.galleryImage = null;	
		}else{
			//Adjust height
			var heightPx =dojo.style(this.mainNode,'height');
			var heightPct = this.PxToPercent(heightPx,'height');
			dojo.style(this.mainNode,{
				'height':heightPct+"%"
			});
			var left = this.PercentToPx("50", 'width')- (dojo.style(this.mainNode,'width')/2) -7;
			var top = this.PercentToPx("50", 'height')- (dojo.style(this.mainNode,'height')/2) -7;
			var leftPct = this.PxToPercent(left,'width');
			dojo.style(this.mainNode,{
				'left':leftPct+"%"
			});
			
			var topPct = this.PxToPercent(top,'height');
			dojo.style(this.mainNode,{
				'top':topPct+"%"
			});			
		}
		
		var resizeContent = false;
		this.updateHandlePositions(resizeContent);
		
		//if this is IE show the mainNode since we are sure it is the correct size
		if (dojo.isIE) {
			dojo.style(this.mainNode,{
				'visibility':'visible'				
			});
		}
		
		if (this.opts.addImageContentBox2){			
			this.opts.addImageContentBox2(this);
		}
		
	},	
	//
	// Runs when an image is unable to load
	//
	onImageError: function( error ){
		this.destroyContentBox();
		var nls = dojo.i18n.getLocalization("concord.widgets","InsertImageDlg");
		var unsupportedImage = nls.unsupportedImage;
		pe.scene.showErrorMessage(unsupportedImage,5000);
	},
	//
	// Returns the calculated image dimension as it will display on screen
	//
	getImageDimension: function(img){
		var dim = {'width':null, 'height':null};
		//get height and width
		dojo.style(img,{
			'width':this.defaultPosition.width+"px"
		});
		
		dim.width = dojo.style(img,'width');
		dim.height = dojo.style(img,'height');
		
		console.log("Returning image dimensions w/h ===== > "+dim.width +" / "+dim.height);
		return dim;
	},
	
	//
	// Modifies the mainNode size based on image dimensions
	//
	modifyBoxSizeBasedOnImgDim: function(){
		var hPct = this.PxToPercent(this.contentBoxDataNode.offsetHeight,'height') +"%";
		var wPct = this.PxToPercent(this.contentBoxDataNode.offsetWidth,'width') +"%";
		
		dojo.style(this.mainNode,{
			'height':hPct,
			'width':wPct
		});
		
	},
	
	shapeMessageDialog: function(mover, e, disableSelection){
		if(pe.scene.shapeDialog){
			pe.scene.shapeDialog = false;
			if(mover) mover.destroy();
			if(e) dojo.stopEvent(e);
			this._openShapeMessageDialog();
			dojo.connect(this.shapeMessageDialog,'onUnload', dojo.hitch(this,this._setShapeResizable));
			dojo.connect(this.shapeMessageDialog._fadeIn,'onEnd', dojo.hitch(this, function(){this._shapeMessageDialogComplete(disableSelection)}));
		}	
	},
	
	_shapeMessageDialogComplete: function(disableSelection){
		if(disableSelection)
		  setTimeout(function(){dojo.disconnect(disableSelection);},10);
	},
	
	_setShapeResizable: function(){
		pe.scene.resizableShape = true;
	},
		
	_openShapeMessageDialog: function(){
		var tmStamp = new Date().getTime();
		var widgetId= "shapeMessageDialog_"+tmStamp;
		var contentId = 'shapeMessageDialogContentDiv_'+tmStamp;
		this.shapeMessageDialog = new concord.widgets.presentationDialog({
	      'id': widgetId,
	      'title': this.IMGSTRINGS.shapeDialogTitle,
	      'content': "<div id='"+contentId+"' style='padding:15px;'> </div>",	     
	      'presDialogHeight': (dojo.isIE)? '237' :'240',
	      'presDialogWidth' : '360',
	      'presDialogTop'   : (this.parentContainerNode.parentNode.offsetParent.offsetParent.offsetHeight/2) - 115,
	      'presDialogLeft'  : (this.parentContainerNode.parentNode.offsetParent.offsetParent.offsetWidth/2) - 150,	      	      	      
	      'heightUnit':'px',
	      'presModal': true,
	      'destroyOnClose':true,
	      'presDialogButtons' : [{'label':this.IMGSTRINGS.ok,'action':dojo.hitch(this,function(){})}]	      
		});
		this.shapeMessageDialog.startup();
		this.shapeMessageDialog.show();
		this._shapeMessageDialogContent(contentId);		
	},
	
	_shapeMessageDialogContent:function(contentId){
		var dialogContentDiv = dojo.byId(contentId);
		var contentString = "<p><b>"+this.IMGSTRINGS.shapeDialogMsg+"</b></p>";
		dialogContentDiv.innerHTML = contentString;
	},
	
	isImageFromShape:function(){		
		if(dojo.hasAttr(this.mainNode, "contentboxtype") && dojo.attr(this.mainNode, "contentboxtype") == 'drawing')
		  return true;
		else 
		  return false;
	},
	
	// set aria info 
	setAriaLabels:function(drawFrame){
		if (drawFrame) {
		   if (!dojo.hasAttr(drawFrame,'tabindex')) {
			   dojo.attr(drawFrame,'tabindex', '0');
		   }
		}

	}


});
