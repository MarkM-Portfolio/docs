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
dojo.provide("viewer.widgets.ContinuousContainer");

dojo.require("viewer.util.Events");
dojo.require("viewer.widgets.PageControlWidget");
dojo.require("viewer.widgets.ScalableContentContainer");
dojo.require("viewer.widgets.ImageContainer");
dojo.require("viewer.widgets.ViewerMessage");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
//dojo.requireLocalization("viewer.widgets", "ImageContainer");

dojo.declare("viewer.widgets.ContinuousConatiner",
	[viewer.widgets.ScalableContentContainer, viewer.widgets.ImageContainer, dijit._Widget, dijit._Templated],
{
		orgWidth: 1600,
		orgHeight: 0,
		totalHeight: 0,
		pagesInfo: [],
		imgsInfo: [],
		templateString:
		'<div class="dijit continuousContainer" tabIndex="${tabIndex}" dojoAttachPoint="continuousContainer" dojoAttachEvent="onscroll: _onScroll,">' +
			'<table role="presentation" class="continuousViewTable" dojoAttachPoint="continuousViewTable">'+
				'<tbody dojoAttachPoint="continuousViewTbody"></tbody>' +
			'</table>' +
		'</div>',
		imgIdx: 0,
		baseUri: '',
		size: 1,
		currentPage: 0,
		tempImgInfoIdx: 0, // the image info is not accurate from this page
		tabIndex: 0,
		bFirstLoad: true, 
		
		postCreate: function(){
			this.createPlaceHolder();
			dojo.subscribe(viewer.util.Events.PAGE_INFO_UPDATED, this, this._onPageInfoUpdated);
//			var _nlsResources = dojo.i18n.getLocalization("viewer.widgets", "ImageContainer");
//			dojo.mixin(this, _nlsResources);
			this.createMessageBox();
			this.inherited(arguments);
			if(this.style == 'compact') {
				dojo.style(this.domNode.firstChild, "padding-top", "25px");
				dojo.style(this.domNode.firstChild, "padding-bottom", "25px");
			}
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
		createPlaceHolder: function(start){
			var td, tr, text, img;
			if (!start)
				start = 1;
			var needCheckInvalidPage = (this.tempImgInfoIdx == 0) || (this.tempImgInfoIdx == start); // all the pages before start page are valid
			var invalidPageFound = false;
			for (var i = start; i <= this.size; i++){
				if (needCheckInvalidPage && (!this.pagesInfo[i-1].getFullImageInfo())){
					if (!invalidPageFound){
						invalidPageFound = true;
						this.tempImgInfoIdx = i;
					}
				}
				var height = this.pagesInfo[i-1].getScaledFullImageHeight(this.orgWidth);
				this.imgsInfo[i-1] = {};
				this.imgsInfo[i-1].offset = (i == 1) ?  height : this.imgsInfo[i-2].offset + height;
				this.imgsInfo[i-1].loaded = false;
				tr = dojo.create('tr', {id: 'contentRow_'+i}, this.continuousViewTbody);
				td = dojo.create('td', {id: 'contentCell_'+i}, tr);
				var imageWrapper = dojo.create('div', {id: 'contentImageWrapper_'+i}, td);
				var imagePlaceHolder = dojo.create('div', {id: 'contentImagePlaceHolder_'+i}, imageWrapper);
				dojo.addClass(imagePlaceHolder, 'contentImagePlaceHolder');
				img = dojo.create('img', {	src: staticResPath + '/images/viewer/blank.gif',
											id: 'contentImg_' + i}, imageWrapper);
				dojo.attr(img, 'alt', this.contentImage +' '+i);
				dojo.addClass(imageWrapper, 'imageUnload');
			}
			if (needCheckInvalidPage && !invalidPageFound){
				this.tempImgInfoIdx = this.size + 1;
//				console.log('createPlaceHolder: tempImgInfoIdx is updated to ' + this.tempImgInfoIdx);
			}
		},
		
		fixImageOffset: function(){
			if (this.tempImgInfoIdx == 0)
				return false;
			var invalidPageFound = false;
			var oldIdx = this.tempImgInfoIdx;
//			console.log('fix start ' + this.tempImgInfoIdx);
			for (var i = this.tempImgInfoIdx; i <= this.size; i++){
				if (!this.pagesInfo[i-1].getFullImageInfo()){
					if (!invalidPageFound){
//						console.log('fix end ' + i);
						invalidPageFound = true;
						if (this.tempImgInfoIdx == i) 
							break;// the inaccurate image is not updated
						this.tempImgInfoIdx = i;
//						console.log('fixImageOffset: tempImgInfoIdx is updated to ' + this.tempImgInfoIdx);
					}
				}
				var height = this.pagesInfo[i-1].getScaledFullImageHeight(this.orgWidth);
				this.imgsInfo[i-1] = {};
				this.imgsInfo[i-1].offset = (i == 1) ?  height : this.imgsInfo[i-2].offset + height;				
			}
			if (!invalidPageFound){
				this.tempImgInfoIdx = this.size + 1;
//				console.log('fixImageOffset: tempImgInfoIdx is updated to ' + this.tempImgInfoIdx);
			}
			
			return (invalidPageFound && (this.tempImgInfoIdx != oldIdx));
		},
		
		resize: function(){
			if (!this.imgIdx && this.style == 'compact'){
				if (this.pagesInfo[0] && this.pagesInfo[0].getFullImageInfo()){
					console.log('loading first image...');
					this.loadImg(1);
				}else{
					console.log('Manage upload results...');
					return;
				}
			}
			var relativeTopPosition = 0; // the length between the top of the cell and scrollTop
			var currentCell = null;
			var scrollTop = this.continuousContainer.scrollTop;
			var cellMarginBox = null;
			if (this.currentPage){
				currentCell = dojo.byId('contentCell_' + this.currentPage);
				cellMarginBox = dojo.marginBox(currentCell);
				var rowBottomOffset = cellMarginBox.t + cellMarginBox.h;
				if (scrollTop >= cellMarginBox.t){ // if the top of the image is invisible
					if (scrollTop >= rowBottomOffset)
						console.warn('scroll bar has moved out of current page');
					relativeTopPosition = scrollTop - cellMarginBox.t;
				}
				else// scrollTop < rowMarginBox.t
					relativeTopPosition = scrollTop - cellMarginBox.t;				
			}
			
			var imgWidth = this.calculateImgWidth();
		
			var imgHeight;
			var oldScale = this.scale;
			if (this.style != '')
				this.scale = imgWidth / this.orgWidth;
			if (oldScale != this.scale){
				this.notifyScaleChanged(this.scale);
			}

			this.setReloadBtnSize(imgWidth);
			
			var buttonSize = null;
			
			// resize all the image
			for (var i = 1; i <= this.size; i++){
				imgHeight = this.pagesInfo[i-1].getScaledFullImageHeight(imgWidth);
				var img = dojo.byId('contentImg_'+i);
				dojo.attr(img, 'width', imgWidth);
				dojo.attr(img, 'height', imgHeight);
				var div = img.parentNode;
				dojo.style(div, 'width', imgWidth + 2 + 'px');
				dojo.style(div, 'height', imgHeight + 2 + 'px');
				var placeHolder = img.previousSibling;
				if (placeHolder){
					dojo.style(placeHolder, 'width', imgWidth +'px');
					dojo.style(placeHolder, 'height', imgHeight+'px');
				}
				var button = dijit.byId('B_Continuous_Reload_' + i);		
				if (button){
					if (!buttonSize){
						// all the buttons are with the same size
						// so if we have calculate the size for one button,
						// no need to calculate more
						buttonSize = this.getReloadButtonSize(button.domNode);
					}
					if (buttonSize.w > 0){
						dojo.style(button.domNode, 'marginLeft', (imgWidth - buttonSize.w)/2 + 'px');
						dojo.style(button.domNode, 'marginRight', (imgWidth - buttonSize.w)/2 + 'px');
						dojo.style(button.domNode, 'marginTop', 5 + 'px');
					}else{
						// the button is invisible
						buttonSize = null;
					}
				}
					
			}

			if (this.currentPage){
				var newCellMarginBox = dojo.marginBox(currentCell);
				var newScrollTop = scrollTop;
				// move scroll bar to the relative position
				if (relativeTopPosition >= 0){
					var newImgBottomOffset = newCellMarginBox.t + newCellMarginBox.h;
					newScrollTop = newCellMarginBox.t + relativeTopPosition/cellMarginBox.h * newCellMarginBox.h;
				}else{
					newScrollTop = newCellMarginBox.t + relativeTopPosition;
				}
				if (newScrollTop != this.continuousContainer.scrollTop){
					this.scrolledForResize = true;
					this.continuousContainer.scrollTop = newScrollTop;
				}
			}
			else{
				this.calculateCurrentPage();
			}				
			
			this.loadVisibleImg(this.currentPage);		
		},
		
		calculateImgWidth: function(){
			var parent = this.continuousContainer.parentNode;
			if (!parent)
				return null;
			var parentHeight = parent.clientHeight - 6; 
			var parentWidth = parent.clientWidth - 6; 
			var width, maxWidth/*, maxHeight*/;
			if (this.style == 'fitWidth'){
				var bVScroll = false;
				if (this.size == 0)
					bVScroll = false;
				else if ((this.imgsInfo[this.size - 1].offset/this.orgWidth) > (parentHeight/parentWidth))
					bVScroll = true;
				
				if (bVScroll)
					width = parentWidth - 24;
				else
					width = parentWidth - 12;
				
			}else if (this.style == 'compact'){
//				maxHeight = (parentHeight - 8) * 0.7; 
//				maxWidth = (parentWidth - 8) * 0.7;
				if(parentWidth > 140){
					maxWidth = parentWidth - 140;
				}else{
					maxWidth = parentWidth;
				}
//				var scaledWidth4maxHeight = this.pagesInfo[this.imgIdx-1].getScaledFullImageWidth(maxHeight) + 2;
				if(this.size==0){
					width=0;
				}else{
					var scaledWidth4maxWidth = this.pagesInfo[this.imgIdx-1].getFullImageInfo().getPageWidth();
					if ( scaledWidth4maxWidth > maxWidth){
						width = maxWidth;
					}else{
						width = scaledWidth4maxWidth;
					}
				}
				if (width < 2){
					width = 2;
				}
			}else {
				width = this.orgWidth * this.scale;
			}
			
			if (width < 0)
				width = 0;

			return width;
			
			// calculate the size
//			if (this.style == 'fitWidth'){
//				maxWidth = (parentHeight/parentWidth) > this.imgHeightDivWidth ? 
//									(parentWidth - 12) * this.scale : (parentWidth - 24) * this.scale;
//				width = maxWidth; 
//				height = width * this.imgHeightDivWidth; 
//			}else if (this.style == 'fitHeight'){
//				maxHeight = (parentHeight/parentWidth) < this.imgHeightDivWidth ? 
//									(parentHeight - 12) * this.scale : (parentHeight - 24) * this.scale;
//				height = maxHeight;
//				width = height/this.imgHeightDivWidth;
//			}
//			else if (this.style == 'fitWindow'){
//				maxHeight = parentHeight * this.scale - 12; 
//				maxWidth = parentWidth * this.scale - 12; 
//				if ((parentHeight/maxWidth) > this.imgHeightDivWidth){
//					width = maxWidth;
//					height = width * this.imgHeightDivWidth ;
//				}else{
//					height = maxHeight;
//					width = height / this.imgHeightDivWidth;
//				}			
//			}
//			
//			return {height: height, width: width};
		},
		
		_onPageSelected: function(i){
			if (this.currentPage != i){
				if (i>1)
					this.bFirstLoad = false;
				this.currentPage = i;
				console.log('page ' + i +' selected in ContinuousContainer');
				var td = dojo.byId('contentCell_'+i);
				if (td){
					var oldScrollTop = this.continuousContainer.scrollTop;
					this.scrolledForPage = true;
//					this.scrollIntoView(td);
					// always jump to the top of the cell
					var newScrollTop = dojo.marginBox(td).t;
					this.continuousContainer.scrollTop = newScrollTop;
					if (this.continuousContainer.scrollTop == oldScrollTop){ // scrolled
						this.scrolledForPage = false;
					}
				}
				this.loadVisibleImg(i);
			}
		},
		_onScroll: function(){
//			console.log('ContinuousContainer._onScroll, top ' + this.continuousContainer.scrollTop);
			if ((!this.scrolledForPage) && (!this.scrolledForResize)){	
				this.calculateCurrentPage();
				this.loadVisibleImg(this.currentPage);
			}else{ // this scroll event is caused by pageChange or scaleChange
				console.log('ContinuousContainer._onScroll, scrolledForPage '+ this.scrolledForPage + ', scrolledForResize '+ this.scrolledForResize);
				this.scrolledForPage = false;
				this.scrolledForResize = false;
			}
		},
		
		calculateCurrentPage: function(){			
			if (this.size == 0)
				return;
//			console.log('ContinuousContainer.calculateCurrentPage');
			var scrollTop = this.continuousContainer.scrollTop;
			var currentPage = this.currentPage;
//			console.log('Content is scrolling, top: ' + scrollTop);
			var currentPageEndOffset = this.getPageEndOffset(this.currentPage);
			var currentPageStartOffset = this.getPageStartOffset(this.currentPage);
			if ((scrollTop < currentPageEndOffset) && (scrollTop >= currentPageStartOffset)){
//				console.log('current page not changed');
			}else if (scrollTop >= currentPageEndOffset){ // after current page
				var bFound = false;
				for (var i = this.currentPage + 1; i<=this.size; i++){
					if (scrollTop < this.getPageEndOffset(i)){
						currentPage = i;
//						this.notifyPageSelected(i);
						bFound = true;
						break;
					}
				}
				if (!bFound){
					console.warn('Current page cannot be found');
//					this.notifyPageSelected(this.size);
					currentPage = this.size;
				}
				
			}else{ //scrollOffset < currentPageStartOffset // before current page
				var bFound = false;
				for (var i = this.currentPage - 1; i >= 1; i--){
					if ((i == 1 && scrollTop >= 0) || (scrollTop >= this.getPageStartOffset(i))){
//						this.notifyPageSelected(i);
						currentPage = i;
						bFound = true;
						break;
					}
				}
				if (!bFound){
					console.warn('Current page cannot be found');
					currentPage = 1;
//					this.notifyPageSelected(1);
				}

			}
			
			if (currentPage != this.currentPage){
				this.currentPage = currentPage;
				this.notifyPageSelected(this.currentPage);
			}
				
		},
		
		getPageStartOffset: function(i){
			if (i<=1)
				return 0;
			else
				return this.imgsInfo[i - 2].offset*this.scale + 10 * (i - 1) + 2; // 2: table margin
		},
		
		getPageEndOffset: function(i){
			if (i < 1)
				return 0;
			else
				return this.imgsInfo[i - 1].offset*this.scale + 10 * i;// 3: padding, 2: border, 4: td padding
		},
		
		loadVisibleImg: function(startPage){
			if ((startPage <= 0) || (startPage > this.size))
				return;
//			console.log('start continuousContainer loadVisibleImg');
			var scrollTop = this.continuousContainer.scrollTop;
			var height = dojo.contentBox(this.continuousContainer).h;
			var bottom = scrollTop + height;

			for (var i = startPage; i<=this.size; i++){
				this.loadImg(i);
				if (i< this.size && (this.imgsInfo[i-1].offset*this.scale + 9* i > bottom)){
					if (!this.bFirstLoad){ // disable preload for first load
						this.loadImg(i + 1);
					}
					break;
				}
			}
			if (!this.bFirstLoad && (startPage > 1))
				this.loadImg(startPage-1);
//			console.log('end continuousContainer loadVisibleImg');
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

		loadImg: function(index, preventCache){
			if ((index <= 0 ) || ( index > this.size))
				return;
//			console.log('content loadImg ' + index);
			var id = 'contentImg_'+index;
			if ((!this.imgsInfo[index-1].loaded) &&  (this.pagesInfo[index-1] && this.pagesInfo[index-1].getFullImageInfo())){
				var img = dojo.byId(id);
//				console.log('content: load ' + index);
				if (dojo.hasClass(img.parentNode, 'imageUnload')){
					var src = this.baseUri + '/' + this.pagesInfo[index-1].getFullImageInfo().getFilepath();
					var lpreventCache = this._isFirstFullImage(src);
					
					if (preventCache || lpreventCache){
						src += '?preventCache='+ new Date().valueOf();
						if(DOC_SCENE.compactMode){
							src += '&mode=compact';
						}
					}else if(DOC_SCENE.compactMode){
							src += '?mode=compact';
					}
					if(this.pagesInfo[index-1].getThumbnailInfo())
					{
						var altSrc = this.baseUri + '/' + this.pagesInfo[index-1].getThumbnailInfo().getFilepath();
						if(DOC_SCENE.compactMode){
							altSrc += '?mode=compact';
						}
						var contentImage=new Image();
						if (!dojo.isChrome && !dojo.isSafari) {
							img.onload = function(){
								dojo.removeClass(img.parentNode, 'imageUnload');
								dojo.removeClass(img.parentNode, 'imageLoadErr');
							}
							dojo.attr(img, 'src', altSrc);
							dojo.attr(contentImage,'src',src);
						} else {
							img.onload = dojo.hitch(this, this._onImageLoaded, img, index);
							img.onerror = dojo.hitch(this, this._onImageLoadErr, img, index);
							dojo.attr(img, 'src', src);
							dojo.attr(contentImage,'src',altSrc);
						}
						contentImage.onload = dojo.hitch(this, this._onAltImageLoaded,contentImage,img,index,src);
						contentImage.onerror = dojo.hitch(this, this._onAltImageLoadErr,contentImage,img,index);
					}
					else
					{
						img.onload = dojo.hitch(this, this._onImageLoaded, img, index);
						img.onerror = dojo.hitch(this, this._onImageLoadErr, img, index);					
						dojo.attr(img, 'src', src);
					}
				}
				this.imgsInfo[index-1].loaded = true;
				this.imgIdx = index;
			}

		},
		
		reloadImg: function(index){
			var id = 'contentImg_'+index;
			var img = dojo.byId(id);
			dojo.addClass(img.parentNode, 'imageUnload');
			dojo.removeClass(img.parentNode, 'imageLoadErr');
			dojo.attr(img, 'src', staticResPath + '/images/viewer/blank.gif');
			//dojo.attr(img, 'aria-label', 'PlaceHolder');
			this.imgsInfo[index-1].loaded = false;
			setTimeout(dojo.hitch(this, this.loadImg, index, true), 1000);
		},

		getReloadButtonSize: function(button){
			return dojo.marginBox(button.firstChild);
		},	
		
		_onPageInfoUpdated: function(pageNum, pageInfo, data){
			this.pageInfo = pageInfo;
			var resizeNeeded = false;
			var oldSize = this.size;
			if (data.orgWidth){
				this.orgWidth = data.orgWidth;
				resizeNeeded = true;
			}
			
			if (this.size < pageNum){
				var oldNum = this.size;
				this.size = pageNum;
				this.createPlaceHolder(oldNum+1);
				resizeNeeded = true;
//				this.resize();
			}else{
				if (this.size > pageNum)
					console.warn("page number is decreased!!!");
			}
			
			if (data.fullImageUpdated){
				if (this.fixImageOffset())
					resizeNeeded = true;
			}
			
			if (resizeNeeded)
				this.resize();
			this.calculateCurrentPage();
			this.loadVisibleImg(this.currentPage);
		},
		
		_onImageLoaded: function(img, index){
			dojo.removeClass(img.parentNode, 'imageUnload');
			dojo.removeClass(img.parentNode, 'imageLoadErr');
			if (img.previousSibling){ // destroy the placeholder
				dojo.forEach(dijit.findWidgets(img.previousSibling), function(widget){
					widget.destroy();
				});
				dojo.destroy(img.previousSibling);
			}
			img.onload=null;
			img.onerror=null;			
		},
		_onAltImageLoaded: function(contentImage,img,index,src){
			if (!dojo.isChrome && !dojo.isSafari) {
				img.src=src;
			}
			dojo.destroy(contentImage);
			if (!dojo.isChrome && !dojo.isSafari) {
				this._onImageLoaded(img,index);
			}
		},
		_onAltImageLoadErr:function(contentImage,img,index)
		{
			dojo.destroy(contentImage);
			if (!dojo.isChrome && !dojo.isSafari) {
				this._onImageLoadErr(img, index);
			}
		},
		_onImageLoadErr: function(img, index){
			console.log('content: img ' + index + ' load error');
			dojo.removeClass(img.parentNode, 'imageUnload');
			dojo.addClass(img.parentNode, 'imageLoadErr');
			var imagePlaceHolder = img.previousSibling;
			if (!dijit.byId('B_Continuous_Reload_' + index)){
				var width = imagePlaceHolder.clientWidth;
				var button = new dijit.form.Button(	{id: 'B_Continuous_Reload_' + index,
					title: this.btnReload,
					showLabel: false,
				    label: this.btnReload,
					iconClass: "reloadIcon",
					onClick: dojo.hitch(this, function(i){
						console.log('contentContainer: reload button ' + i + ' is clicked');
						this.reloadImg(i);
						}, index)
					}); 
				dojo.place(button.domNode, imagePlaceHolder, 'first');
				dojo.addClass(button.domNode, 'ContentReloadButton');
//				dojo.addClass(button.domNode,"lotusDijitButtonImg");
				buttonSize = this.getReloadButtonSize(button.domNode);

				dojo.style(button.domNode, 'marginLeft', (width - buttonSize.w-8)/2 + 'px');
				dojo.style(button.domNode, 'marginRight', (width - buttonSize.w-8)/2 + 'px');
				dojo.style(button.domNode, 'marginTop', 5 + 'px');
			}
			img.onload = null;
			img.onerror = null;			
		},
		
		_onKeyPress: function(e){
			if((e.keyCode == dojo.keys.UP_ARROW))
			{			
				this.continuousContainer.scrollTop -= 20;
			}
			else if((e.keyCode == dojo.keys.DOWN_ARROW))
			{
				this.continuousContainer.scrollTop += 20;
			}
			else if((e.keyCode == dojo.keys.LEFT_ARROW))
			{
				this.continuousContainer.scrollLeft -= 20;
			}
			else if((e.keyCode == dojo.keys.RIGHT_ARROW))
			{
				this.continuousContainer.scrollLeft += 20;
			}
		},
		
		/////////////////////////// for debug //////////////////////
		testImgInfo: function(){
			for (var i=1; i<=this.size; i++){
				var row = dojo.byId('contentRow_' + i);
				var box = dojo.marginBox(row);
				console.log('row['+ i +']: ' + box.t + ' ' + (box.t+box.h) + ' offset: ' + this.getPageStartOffset(i) + ' ' + this.getPageEndOffset(i));
			}
		}

	
});