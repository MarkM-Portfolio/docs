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
dojo.provide("viewer.widgets.ThumbnailPicker");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("viewer.widgets.PageControlWidget");
dojo.require("viewer.widgets.ImageContainer");
//dojo.requireLocalization("viewer.widgets", "ImageContainer");

dojo.declare(
	"viewer.widgets.ThumbnailPicker",
	[viewer.widgets.PageControlWidget, viewer.widgets.ImageContainer, dijit._Widget, dijit._Templated],
	{
		size: 0,
		pagesInfo: [],
		imgsInfo: [],
		tabIndex: 0, 
//		extension: "",
		baseUri: "",
		thumbWidth: 133,
		viewManager: null,
		templateString:
		'<div class="dijit thumbnailPicker" dojoAttachPoint="thumbnailContainer" dojoAttachEvent="onscroll: _onScroll,onkeypress:_onKeyPress" tabIndex="${tabIndex}">' +
			'<table role="presentation" dojoAttachPoint="thumbnailTable" style="align: center" dojoAttachEvent="onkeypress:_onKeyPress">'+
				'<tbody dojoAttachPoint="thumbnailTBody"></tbody>' + 
			'</table>'+
		'</div>',

		
		postCreate: function(){
			this.setReloadBtnSize(this.thumbWidth);
			dojo.style(this.thumbnailTable, 'width', this.thumbWidth + 30 + "px");
			this.createPlaceHolder();
			dojo.subscribe(viewer.util.Events.PAGE_INFO_UPDATED, this, this._onPageInfoUpdated);
//			var _nlsResources = dojo.i18n.getLocalization("viewer.widgets", "ImageContainer");
//			dojo.mixin(this, _nlsResources);
			this.inherited(arguments);
		},
		
		createPlaceHolder: function(start){
			var td, tr, text, img, imageWrapper, imagePlaceHolder;
			var imgHeight, imgWidth;
			if (!start)
				start = 1;
			for (var i = start; i <= this.size; i++){
				imgWidth = this.thumbWidth;
				if (this.pagesInfo[i-1]){// the page has been converted
					imgHeight = this.pagesInfo[i-1].getScaledThumbnailHeight(imgWidth);
				}
				this.imgsInfo[i-1] = {};
				this.imgsInfo[i-1].offset = (i==1) ? imgHeight + 21 : this.imgsInfo[i-2].offset + imgHeight + 21;
				this.imgsInfo[i-1].loaded = false;
				tr = dojo.create('tr', null, this.thumbnailTBody);
				td = dojo.create('td', null, tr);
				text = document.createTextNode(''+i);
				td.appendChild(text);
				td = dojo.create('td', {id: 'thumbnailCell_'+i,
										width: imgWidth + 16 + "px",
//										height: imgHeight + 19 + "px",
										onclick: dojo.hitch(this, this._onThumbnailClicked, i),
										onmouseover: dojo.hitch(this, this._onMouseOver, i),
										onmouseout: dojo.hitch(this, this._onMouseOut, i)										
										}, tr);
				imageWrapper = dojo.create('div', {id: 'thumbnailImageWrapper_'+i}, 
														td);
				imagePlaceHolder = dojo.create('div', {id: 'thumbnailImagePlaceHolder_'+i}, imageWrapper);
				dojo.addClass(imagePlaceHolder, 'thumbnailImagePlaceHolder');
				dojo.style(imagePlaceHolder, 'width', imgWidth + 'px');
				dojo.style(imagePlaceHolder, 'height', imgHeight +'px');
				img = dojo.create('img', {width: imgWidth, 
											height: imgHeight, 
											src: staticResPath + '/images/viewer/blank.gif',
											alt: this.thumbnailImage+' '+i,
											id: 'thumbnailImage_'+i
											}, imageWrapper);
				dojo.addClass(imageWrapper, 'imageUnload');
			}
		},

		_onThumbnailClicked: function(index, evt){
			var button = dijit.byId('B_Thumbnail_Reload_' + index);
			if (button){
				if (evt.target != button.domNode){ // if user click WITHIN the button
					var node = evt.target;
					var bChild = false;
					while(node != evt.currentTarget){
						var parent = node.parentNode;
						if (parent == button.domNode){
							bChild = true;
							break;
						}
						node = node.parentNode;
					}
					
					if (bChild)
						return;
					}
			}
			if (this.updateCurrentPage(index))
				this.notifyPageSelected(index);
		},

		updateCurrentPage: function(index, needScroll){
			var hasSelected = false;
			var id = 'thumbnailCell_'+index;
			dojo.query('td.selected', this.thumbnailContainer).forEach(function(node){
				var theId = dojo.attr(node, 'id');
				if (theId && (theId == id))
					hasSelected = true;
				else
					dojo.removeClass(node, 'selected');
			});
				
			if (!hasSelected){
				var td = dojo.byId(id);
				if (td){
					dojo.addClass(td, 'selected');
					dojo.removeClass(td, 'hover');
					try{
					if (needScroll)
						this.scrollIntoView(td);
					}
					catch(e){
						
					}				
				}
			}
			
			return !hasSelected;
		},
		
		loadImg: function(index, preventCache){

			if ((index <= 0 ) || ( index > this.size))
				return;
//			console.log('thumbnail: load ' + index);
			var id = 'thumbnailImage_'+index;
			if ((!this.imgsInfo[index-1].loaded ) && (this.pagesInfo[index-1] && this.pagesInfo[index-1].getThumbnailInfo())){
				var img = dojo.byId(id);
				if (dojo.hasClass(img.parentNode, 'imageUnload')){
					var imgWidth = this.thumbWidth;
					var imgHeight = this.pagesInfo[index-1].getScaledThumbnailHeight(imgWidth);
					//dojo.attr(img, 'src', this.baseUri + '/' + (index - 1) +this.extension);
					var src = this.baseUri + '/' + this.pagesInfo[index-1].getThumbnailInfo().getFilepath();
					if (preventCache){
						src += '?preventCache='+ new Date().valueOf();
						if(DOC_SCENE.compactMode){
							src += '&mode=compact';
						}
					}else if(DOC_SCENE.compactMode){
							src += '?mode=compact';
					}
					img.onload = dojo.hitch(this, this._onImageLoaded, img, index);
					img.onerror = dojo.hitch(this, this._onImageLoadErr, img, index);
					dojo.attr(img, 'src', src);
					dojo.attr(img, 'width', imgWidth);
					dojo.attr(img, 'height', imgHeight);
				}
				this.imgsInfo[index-1].loaded = true;
			}
		},
		
		reloadImg: function(index){
			var id = 'thumbnailImage_'+index;
			var img = dojo.byId(id);
			dojo.addClass(img.parentNode, 'imageUnload');
			dojo.removeClass(img.parentNode, 'imageLoadErr');
			dojo.attr(img, 'src', staticResPath + '/images/viewer/blank.gif');
			this.imgsInfo[index-1].loaded = false;
			setTimeout(dojo.hitch(this, this.loadImg, index, true), 1000);
		},
		
		resize: function(){
			this.inherited(arguments);
			this.loadVisibleImgs();
		},

		getReloadButtonSize: function(button){
			if (!this.buttonSize)
				this.buttonSize = dojo.marginBox(button.firstChild);
			
			return this.buttonSize;
		},
		
		_onMouseOver: function(index){
			var id = 'thumbnailCell_'+index;
			var td = dojo.byId(id);
			if (td){
				if (!dojo.hasClass(td, 'selected'))
					dojo.addClass(td, 'hover');
			}
		},
		
		_onMouseOut: function(index){
			var id = 'thumbnailCell_'+index;
			var td = dojo.byId(id);;
			if (td){
				dojo.removeClass(td, 'hover');
			}
		},
		
		_onImageLoaded: function(img, index){
			dojo.removeClass(img.parentNode, 'imageUnload');
			dojo.removeClass(img.parentNode, 'imageLoadErr');
			dojo.addClass(img.parentNode, 'imageLoaded');
			if (img.previousSibling){ // destroy the placeholder
				dojo.forEach(dijit.findWidgets(img.previousSibling), function(widget){
					widget.destroy();
				});
				dojo.destroy(img.previousSibling);
			}
			img.onload=null;
			img.onerror=null;
		},
		
		_onImageLoadErr: function(img, index){
			console.log('thumbnail: img ' + index + ' load error');
			dojo.removeClass(img.parentNode, 'imageUnload');
			dojo.addClass(img.parentNode, 'imageLoadErr');
			var imagePlaceHolder = img.previousSibling;
			if (!dijit.byId('B_Thumbnail_Reload_' + index)){
				var width = imagePlaceHolder.clientWidth;
				var height = imagePlaceHolder.clientHeight;
				var button = new dijit.form.Button(	{id: 'B_Thumbnail_Reload_' + index,
					title: this.btnReload,
					showLabel: false,
				    label: this.btnReload,
					iconClass: "reloadIcon",
					onClick: dojo.hitch(this, function(i){
						console.log('thumbnail: reload button ' + i + ' is clicked');
						this.reloadImg(i);
						return false; // prevent thumbnail to handle the event
						}, index)
					}); 
				dojo.addClass(button.domNode, 'ContentReloadButton');
//				dojo.addClass(button.domNode,"lotusDijitButtonImg");
				dojo.place(button.domNode, imagePlaceHolder, 'first');
				var buttonSize = this.getReloadButtonSize(button.domNode);
				dojo.style(button.domNode, 'marginLeft', (width - buttonSize.w-8)/2 + 'px');
				dojo.style(button.domNode, 'marginRight', (width - buttonSize.w-8)/2 + 'px');
				dojo.style(button.domNode, 'marginTop', (height - buttonSize.h)/2 + 'px');
				dojo.style(button.domNode, 'marginBottom', (height - buttonSize.h)/2 + 'px');
			}
			img.onerror = null;
			img.onload = null;
		},
		
//		_isInViewerport: function(node){
//			if (!node)
//				return false;
//			var scrollTop = this.thumbnailContainer.scrollTop;
//			var offsetTop = node.offsetTop;
//			
//			if (scrollTop > offsetTop)
//				return false;
//			if (scrollTop + this.thumbnailContainer.clientHeight < node.offsetTop + node.offsetHeight)
//				return false;
//			return true;
//		},
		
		_onPageSelected: function(index){
			this.updateCurrentPage(index, true);			
			this.loadVisibleImgs();
		},
		
		_onPageInfoUpdated: function(pageNum, pageInfo){
			this.pageInfo = pageInfo;
			if (this.size < pageNum){
				var oldNum = this.size;
				this.size = pageNum;
				this.createPlaceHolder(oldNum + 1);
			}else{
				if (this.size > pageNum)
					console.warn("page number is decreased!!!");
			}
			this.loadVisibleImgs();
		},
		
		_onScroll: function(){
			this.loadVisibleImgs();
		},
		_onKeyPress : function(e)
		{
			if(e.keyCode == dojo.keys.UP_ARROW
			    ||e.keyCode == dojo.keys.DOWN_ARROW
			    ||e.keyCode == dojo.keys.LEFT_ARROW
			    ||e.keyCode == dojo.keys.RIGHT_ARROW
			    ||e.keyCode == dojo.keys.PAGE_UP
			    ||e.keyCode == dojo.keys.PAGE_DOWN)
			{
				e.preventDefault();
				this.notifyPageScroll(e);
			}
			
		},
		loadVisibleImgs: function(){
//			console.log('start loadVisibleImgs');
			var scrollTop = this.thumbnailContainer.scrollTop;
//			console.log('ThumbnailPicker is scrolling, top: ' + scrollTop);	
			var height = dojo.contentBox(this.thumbnailContainer).h;
			var bottom = scrollTop + height;
//			console.log('ThumbnailPicker is scrolling, bottom: ' + bottom);
			var startIndex = this.searchPage(scrollTop, this.size);
			for (var i = startIndex; i<=this.size; i++){
//				console.log('loadVisibleImgs: load ' + i);
				this.loadImg(i);
				if (i< this.size && this.imgsInfo[i-1].offset>bottom)
					break;
			}
			if (startIndex > 1)
				this.loadImg(startIndex - 1);
//			console.log('end loadVisibleImgs');
		},
		
		comparePos: function(index, pos){
			if (this.imgsInfo[index-1].offset > pos)
				return 1;
			if (this.imgsInfo[index-1].offset < pos)
				return -1;
			return 0;
		}
		
	});