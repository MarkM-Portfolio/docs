/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of IBM.                             */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* Copyright IBM Corporation 2012. All Rights Reserved.              */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("viewer.widgets.NormalContentContainer");

dojo.require("viewer.util.Events");
dojo.require("viewer.widgets.ScalableContentContainer");
dojo.require("viewer.widgets.ImageContainer");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Button");
//dojo.requireLocalization("viewer.widgets", "ImageContainer");

dojo.declare("viewer.widgets.NormalContentContainer",
	[viewer.widgets.ScalableContentContainer, viewer.widgets.ImageContainer, dijit._Widget, dijit._Templated],
	{
		orgHeight: 0,
		orgWidth: 1600, 
		pagesInfo: [],
		templateString: dojo.cache("viewer.widgets", "templates/NormalContentContainer.html"),
		imgIdx: 0,
		imgNode: null,
		baseUri: '',
		tabIndex: 0,
		bFirstLoad: true, 
				
		postCreate: function(){			
			if (this.imgIdx != 0)
				this._onPageSelected(this.imgIdx);
			dojo.subscribe(viewer.util.Events.PAGE_INFO_UPDATED, this, this._onPageInfoUpdated);
//			var _nlsResources = dojo.i18n.getLocalization("viewer.widgets", "ImageContainer");
//			dojo.mixin(this, _nlsResources);
			var button = new dijit.form.Button(	{id: 'B_Normal_Reload',
				title: this.btnReload,
				showLabel: false,
			    label: this.btnReload,
				iconClass: "reloadIcon",
				onClick: dojo.hitch(this, function(){
					console.log('contentContainer: reload button is clicked');
					this.reloadImg();
					})
				}); 
			dojo.place(button.domNode, this.normalImageWrapper, 'first');
			dojo.addClass(button.domNode, 'ContentReloadButton');
			dojo.addClass(button.domNode,"lotusDijitButtonImg");
			this.reloadButton = button;
			this.createMessageBox();
			this.inherited(arguments);
		},
		
		//when the mediaSize is 0,call it
		createMessageBox:function()
		{
			if(this.viewManager.mediaSize==0)
			{
				var messageBox = new viewer.widgets.ViewerMessage({
					type : 0,
					parentDiv :this
				});
				messageBox.showMessage();
			}
		},
		
		resize: function(){
			if (!this.imgIdx){
				if (this.pagesInfo[0] && this.pagesInfo[0].getFullImageInfo()){
					this.loadImage(1);
				}
				
				return;	
			}
			var parent = this.normalContentContainer.parentNode;
			var parentHeight = parent.clientHeight; 
			var parentWidth = parent.clientWidth; 
			var height, width, maxWidth, maxHeight;
			var oldScale = this.scale;
			
			// calculate the wrapper size
			if (this.style == 'fitWidth'){
				var bVScroll = (this.orgHeight > parentHeight);
				if (bVScroll)
					width = parentWidth - 20;
				else
					width = parentWidth - 8;
				
				height = this.pagesInfo[this.imgIdx-1].getScaledFullImageHeight(width - 2) + 2;
				
				if ((width < 2) || (height <2)){
					width = 2;
					height = 2;
				}

				this.scale = (width - 2)/this.orgWidth;
			}else if (this.style == 'fitHeight'){
				var bHScroll = this.orgWidth > parentWidth;
				if (bHScroll)
					height = parentHeight - 20;
				else
					height = parentWidth - 8;

				width = this.pagesInfo[this.imgIdx-1].getScaledFullImageWidth(height);
				if ((width < 2) || (height <2)){
					width = 2;
					height = 2;
				}
				this.scale = (width - 2)/this.orgWidth;
			}
			else if (this.style == 'fitWindow'){
				maxHeight = parentHeight - 8; 
				maxWidth = parentWidth - 8;
				var scaledWidth4maxHeight = this.pagesInfo[this.imgIdx-1].getScaledFullImageWidth(maxHeight) + 2;
				if ( scaledWidth4maxHeight > maxWidth){
					width = maxWidth;
					height = this.pagesInfo[this.imgIdx-1].getScaledHeight(width - 2) + 2;
				}else{
					height = maxHeight;
					width = scaledWidth4maxHeight;
				}
				if ((width < 2) || (height <2)){
					width = 2;
					height = 2;
				}
				this.scale = (width - 2)/this.orgWidth;
				
			}
			else if (this.style == 'slideMode'){
				maxHeight = (parentHeight - 8) * 0.8; 
				maxWidth = (parentWidth - 8) * 0.8;
				var scaledWidth4maxHeight = this.pagesInfo[this.imgIdx-1].getScaledFullImageWidth(maxHeight) + 2;
				if ( scaledWidth4maxHeight > maxWidth){
					width = maxWidth;
					height = this.pagesInfo[this.imgIdx-1].getScaledFullImageHeight(width - 2) + 2;
				}else{
					height = maxHeight;
					width = scaledWidth4maxHeight;
				}
				if ((width < 2) || (height <2)){
					width = 2;
					height = 2;
				}
				this.scale = (width - 2)/this.orgWidth;
			}else{
				width = this.orgWidth * this.scale + 2;
				height = this.orgHeight * this.scale + 2;
			}				
			
			if (height < parentHeight){
				var top;
				if (width < parentWidth)
					top = (parentHeight - height)/2;
				else
					top = (parentHeight - 20 - height)/2; // scroll bar
				dojo.style(this.normalMarginContainer, 'top', top + 'px');
				dojo.style(this.normalMarginContainer, 'height', height + 'px');
			} else {
				dojo.style(this.normalMarginContainer, 'height', height + 'px');
				dojo.style(this.normalMarginContainer, 'top',  '0px');
			}
			if (width < parentWidth){
				var left;
				if (height < parentHeight)
					left = right = (parentWidth - width)/2;
				else
					left = right = (parentWidth - 20 - width)/2; // scroll bar
				dojo.style(this.normalMarginContainer, 'left', left + 'px');
				dojo.style(this.normalMarginContainer, 'width', width + 'px' );
			} else {
				dojo.style(this.normalMarginContainer, 'width', width + 'px');
				dojo.style(this.normalMarginContainer, 'left',  '0px');
			}

			if (this.imgNode){
				dojo.attr(this.imgNode, 'width', width-4); 
				dojo.attr(this.imgNode, 'height', height-4);
			}
			
			this.setReloadBtnSize(width-2);
			this.positionReloadButton();
//			
//			var buttonSize = this.getReloadButtonSize();
//			if (buttonSize.w > 0){
//				dojo.style(this.reloadButton.domNode, 'marginLeft', (width - buttonSize.w)/2 + 'px');
//				dojo.style(this.reloadButton.domNode, 'marginRight', (width - buttonSize.w)/2 + 'px');
//				dojo.style(this.reloadButton.domNode, 'marginTop', 5 + 'px');
//			}
			
			
			if (oldScale != this.scale){
				this.notifyScaleChanged(this.scale);
			}
		},
		
		loadImage: function(i, preventCache){
			if ((i != this.imgIdx) || (!this.imgNode)){
				this.imgIdx = i;
				
				// remove old class
				dojo.removeClass(this.normalImageWrapper, 'imageLoadErr');
				dojo.addClass(this.normalImageWrapper, 'imageUnload');
				
				// search the img from cache
				var img = dojo.byId('normalContentImg_' + this.imgIdx);
				var oldImg = this.imgNode;
				if (img){// find out the img from cache
					// put this image in image wrapper
					dojo.place(img, this.normalImageWrapper, 'last');
					this.imgNode = img;
					if (dojo.hasClass(img, 'loadErr')){
						dojo.addClass(this.normalImageWrapper, 'imageLoadErr');
						dojo.removeClass(this.normalImageWrapper, 'imageUnload');
					}else if (dojo.hasClass(img, 'loaded')){
						dojo.removeClass(this.normalImageWrapper, 'imageUnload');
					}
				}else {// cannot find out the img from cache					
					// create a new image node
					this.imgNode = this.createPageImage(i, this.normalImageWrapper, preventCache);
				}
				
				// put the old image into the cache
				if (oldImg)
					dojo.place(oldImg, this.normalCacheContainer, 'last');
				
				this.orgHeight = this.pagesInfo[i-1].getScaledFullImageHeight(this.orgWidth);				
				this.resize();
			}
		},
		
		reloadImg: function(){
			if (this.imgIdx){
				var img = dojo.byId('normalContentImg_' + this.imgIdx);
				if (img){
					if (img == this.imgNode)
						this.imgNode = null;
					dojo.destroy(img);
				}
				dojo.removeClass(this.normalImageWrapper, 'imageLoadErr');
				dojo.addClass(this.normalImageWrapper, 'imageUnload');
				setTimeout(dojo.hitch(this, this.loadImage, this.imgIdx, true), 1000);
			}
		},
		
		loadImageInCache: function(i){
			var img = dojo.byId('normalContentImg_' + i);
			if (img) // find out the image in cache
				return;
			else{
				img = this.createPageImage(i, this.normalCacheContainer);
			}
		},
		
		createPageImage: function(i, parentNode, preventCache){
			var img = null;
			if (this.pagesInfo[i-1] && this.pagesInfo[i-1].getFullImageInfo()){
				var src = this.baseUri + '/' + this.pagesInfo[i-1].getFullImageInfo().getFilepath();
				var lpreventCache = this._isFirstFullImage(src);
				if (preventCache || lpreventCache)
					src += '?preventCache='+ new Date().valueOf();
				
				if(this.pagesInfo[i-1].getThumbnailInfo())
				{
					var altSrc = this.baseUri + '/' + this.pagesInfo[i-1].getThumbnailInfo().getFilepath();
					img = dojo.create('img', {id: 'normalContentImg_'+i,
						src: altSrc,
						alt: this.contentImage+' '+i}, 
					  parentNode);
					dojo.removeClass(this.normalImageWrapper, 'imageUnload');
					var image=new Image();
					dojo.attr(image,'src',src);
				
					image.onload = dojo.hitch(this, this._onImageLoaded,image,img,src);
					image.onerror = dojo.hitch(this, this._onImageLoadErr,image,img);
				}
				else
				{
					img = dojo.create('img', {id: 'normalContentImg_'+i,
						  src: src,
						  alt: this.contentImage+' '+i,
						  onload: dojo.hitch(this, this._onAltImageLoaded,img),
						  onerror: dojo.hitch(this, this._onAltImageLoadErr,img)}, 
						  parentNode);
				}
				
			}
			return img;
		},
		
		_isFirstFullImage: function(src) {
			var fImage1 = "pictures/image.jpg";
			var fImage1_2 =  "pictures/image.png";
			var fImage1_3 =  "pictures/image.gif";
			
			var start = src.length - fImage1.length;
			var subStr = src.substr(start);
			if (subStr == fImage1 || subStr == fImage1_2 || subStr == fImage1_3) {
				return true;
			} else {
				return false;
			}
		},

		getReloadButtonSize: function(){
			return dojo.marginBox(this.reloadButton.domNode.firstChild);
		},	
		
		positionReloadButton: function(){
			var width = this.normalImageWrapper.clientWidth;
			var buttonSize = this.getReloadButtonSize();
			if (buttonSize.w > 0){
				dojo.style(this.reloadButton.domNode, 'marginLeft', (width - buttonSize.w)/2 + 'px');
				dojo.style(this.reloadButton.domNode, 'marginRight', (width - buttonSize.w)/2 + 'px');
				dojo.style(this.reloadButton.domNode, 'marginTop', 5 + 'px');
			}
		},
		
		_onImageLoaded:function(image,img,src)
		{
			dojo.attr(img,'src',src);
			dojo.destroy(image);
			this._onAltImageLoaded(img);
		},
		_onAltImageLoaded:function(img)
		{
			if (img == this.imgNode){
				console.log('img in contentContainer is loaded');
				dojo.removeClass(this.normalImageWrapper, 'imageUnload');
			}
			dojo.addClass(img, 'loaded');
			img.onload = null;
			img.onerror = null;
			return false;			
		},
		_onImageLoadErr:function(image,img)
		{
			dojo.destroy(image);
			this._onAltImageLoadErr(img);
		},
		_onAltImageLoadErr:function(img)
		{
			if (img == this.imgNode){
				dojo.removeClass(this.normalImageWrapper, 'imageUnload');
				dojo.addClass(this.normalImageWrapper, 'imageLoadErr');
			}
			dojo.addClass(img, 'loadErr');
			console.log('error occur when img is loaded in contentContainer');	
			this.positionReloadButton();
//			var width = this.normalImageWrapper.clientWidth;
//			var buttonSize = this.getReloadButtonSize();
//			dojo.style(this.reloadButton.domNode, 'marginLeft', (width - buttonSize.w)/2 + 'px');
//			dojo.style(this.reloadButton.domNode, 'marginRight', (width - buttonSize.w)/2 + 'px');
//			dojo.style(this.reloadButton.domNode, 'marginTop', 5 + 'px');
			img.onload = null;
			img.onerror = null;
		},
		_onReloadBtnClicked: function(){
			console.log('contentContainer: reload button ' + this.imgIdx + ' is clicked');
			this.reloadImg();
		},
		
		// callback for events
		_onPageSelected: function(i){
			if (i == 0)
				return;
			
			if (i>1){
				this.bFirstLoad = false;
			}
			this.loadImage(i);
			if (this.bFirstLoad)
				return;
			if (i>1){
				this.loadImageInCache(i - 1);
			}
			
			if (i < this.pagesInfo.length){
				this.loadImageInCache(i + 1);
			}
				
		},
		
		_onPageInfoUpdated: function(pageNum, pagesInfo, data){
			this.pagesInfo = pagesInfo;
			if (data.orgWidth){
				this.orgWidth = data.orgWidth;
				this.resize();
			}
			this._onPageSelected(this.imgIdx);
		},
		_onKeyPress: function(e){
			if((e.keyCode == dojo.keys.UP_ARROW))
			{			
				this.normalContentContainer.scrollTop -= 20;
			}
			else if((e.keyCode == dojo.keys.DOWN_ARROW))
			{
				this.normalContentContainer.scrollTop += 20;
			}
			else if((e.keyCode == dojo.keys.LEFT_ARROW))
			{
				this.normalContentContainer.scrollLeft -= 20;
			}
			else if((e.keyCode == dojo.keys.RIGHT_ARROW))
			{
				this.normalContentContainer.scrollLeft += 20;
			}
		}
	}
)